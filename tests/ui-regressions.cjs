const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/promptbuilder.js'), 'utf8').replace(/\r\n/g, '\n');
function between(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `Missing source boundaries: ${start}`);
  return source.slice(from, to);
}
function fn(name, next) {
  return between(`function ${name}(`, `function ${next}(`);
}

// Minimal DOM adapters; callbacks and rendering logic come from the shipped bundle.
function dom() {
  const document = { listeners: {}, activeElement: null };
  function matches(el, selector) {
    if (selector.startsWith('#')) return el.id === selector.slice(1);
    if (selector === '[data-sortable]') return el.attrs['data-sortable'] != null;
    if (selector === '.pb-inputbox[data-box-id]') return el.classList.contains('pb-inputbox') && el.attrs['data-box-id'] != null;
    if (selector.startsWith('.pb-inputbox[data-box-id="')) return el.classList.contains('pb-inputbox') && el.attrs['data-box-id'] === selector.match(/"(.*?)"/)[1];
    if (selector.startsWith('.')) return selector.slice(1).split('.').every(c => el.classList.contains(c));
    return el.tagName === selector.toUpperCase();
  }
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase();
      this.children = [];
      this.listeners = {};
      this.attrs = {};
      this.className = '';
      this.style = { setProperty() {}, getPropertyValue() { return ''; } };
      this.value = '';
      this.selectionStart = this.selectionEnd = 0;
      this.selectionDirection = 'none';
      this.scrollTop = 0;
      this.classList = {
        contains: c => this.className.split(' ').includes(c),
        add: c => { if (!this.classList.contains(c)) this.className += ` ${c}`; },
        remove: c => { this.className = this.className.split(' ').filter(x => x !== c).join(' '); }
      };
    }
    addEventListener(name, cb) { (this.listeners[name] ||= []).push(cb); }
    fire(name, event = {}) { for (const cb of this.listeners[name] || []) cb(event); }
    appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
    setAttribute(k, value) { this.attrs[k] = value; }
    getAttribute(k) { return this.attrs[k] ?? null; }
    closest(selector) {
      for (let el = this; el; el = el.parentElement) {
        if (selector.split(',').some(s => matches(el, s.trim()))) return el;
      }
      return null;
    }
    contains(el) { return el === this || this.children.some(child => child.contains(el)); }
    querySelectorAll(selector) {
      const parts = selector.split(' ');
      const last = parts.pop();
      const out = [];
      const walk = node => {
        for (const child of node.children) {
          if (matches(child, last) && (!parts.length || child.parentElement.closest(parts.join(' ')))) out.push(child);
          walk(child);
        }
      };
      walk(this);
      return out;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    set innerHTML(value) {
      assert.equal(value, '');
      if (this.contains(document.activeElement)) document.activeElement = document.body;
      for (const child of this.children) child.parentElement = null;
      this.children = [];
    }
    focus() { document.activeElement = this; }
    setSelectionRange(start, end, direction) { this.selectionStart = start; this.selectionEnd = end; this.selectionDirection = direction; }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(c => c !== this); }
  }
  document.createElement = tag => new Element(tag);
  document.body = new Element('body');
  document.activeElement = document.body;
  document.addEventListener = (name, cb) => (document.listeners[name] ||= []).push(cb);
  document.fire = (name, event) => { for (const cb of document.listeners[name] || []) cb(event); };
  document.querySelectorAll = selector => document.body.querySelectorAll(selector);
  const div = className => { const el = new Element(); el.className = className || ''; return el; };
  return { document, div, Element };
}

function workspaceHarness() {
  const { document, div } = dom();
  const panel = div(); panel.id = 'pbMainPanel'; document.body.appendChild(panel);
  const workspace = div(); workspace.id = 'pbWorkspaceArea'; panel.appendChild(workspace);
  const box = { id: 'box', enabled: true, chips: [] };
  const negativeBox = { id: 'negative', enabled: true, chips: [] };
  const calls = [];
  const ctx = vm.createContext({
    document, div, span: () => document.createElement('span'),
    $: id => id === panel.id ? panel : id === workspace.id ? workspace : null,
    cur: { focusedBox: box.id, workspace: [{ id: 'group', inputboxes: [box] }], negativeGroup: { id: 'neg', inputboxes: [negativeBox] } },
    _css4: true, _input: null, _box2: null, _items: [], _active2: -1,
    dispatch: op => { calls.push(op); return true; },
    hideAc() { ctx._input = null; ctx._box2 = null; ctx._items = []; },
    showAc() {}, navigateAc() {}, destroySortable() {}, bindGroupList() {}, bindChipArea() {}, paintSelectionClasses() {},
    setTimeout() {}, mkChip: (text, cnText, weight, categoryColor) => ({ text, cnText, weight, categoryColor })
  });
  vm.runInContext(between('var _workspaceDrafts =', 'function renderGroup(') + fn('renderBox', 'startRename') + fn('selectAc', 'pick') + between('function pick(', '// src/ui/workspace.ts\nvar CSS5'), ctx);
  ctx.renderGroup = (group, isNeg) => {
    const el = div('pb-group');
    for (const b of group.inputboxes) el.appendChild(ctx.renderBox(group, b, isNeg));
    return el;
  };
  const input = (id = box.id) => workspace.querySelector(`.pb-inputbox[data-box-id="${id}"] .pb-chip-input`);
  return { ctx, document, workspace, box, calls, input };
}

test('workspace redraw retains drafts and caret independently for each input', () => {
  const h = workspaceHarness();
  h.ctx.renderWorkspace();
  h.input().value = 'unfinished words';
  h.input().setSelectionRange(3, 8, 'backward');
  h.input().focus();
  h.input('negative').value = 'negative draft';
  h.ctx.renderWorkspace();
  assert.equal(h.input().value, 'unfinished words');
  assert.equal(h.input('negative').value, 'negative draft');
  assert.equal(h.document.activeElement, h.input());
  assert.equal(h.input().selectionStart, 3);
  assert.equal(h.input().selectionEnd, 8);
  assert.equal(h.input().selectionDirection, 'backward');

  const otherInput = h.document.createElement('input');
  h.document.body.appendChild(otherInput); otherInput.focus();
  h.ctx.renderWorkspace();
  assert.equal(h.document.activeElement, otherInput, 'redraw must not steal focus from another field');
  h.document.activeElement = h.document.body;
  h.ctx.renderWorkspace();
  assert.equal(h.document.activeElement, h.document.body, 'background redraw must not reclaim keyboard focus from the canvas');
});

test('reset before a workflow load does not capture the old node DOM again', () => {
  const h = workspaceHarness();
  h.ctx.renderWorkspace(); h.input().value = 'old workflow draft';
  h.ctx.resetWorkspaceDrafts();
  h.ctx.renderWorkspace();
  assert.equal(h.input().value, '');
});

test('autocomplete preserves comma-prefix draft across its resulting redraw', () => {
  const h = workspaceHarness();
  h.ctx.renderWorkspace();
  h.input().value = 'red hair, blu';
  h.ctx._input = h.input(); h.ctx._box2 = h.box;
  h.ctx._items = [{ text: 'blue_eyes', cnText: '蓝眼' }]; h.ctx._active2 = 0;
  assert.equal(h.ctx.selectAc(h.input(), h.box), true);
  h.ctx.renderWorkspace();
  assert.equal(h.calls[0].chip.text, 'blue_eyes');
  assert.equal(h.input().value, 'red hair, ');
  assert.equal(h.ctx.selectAc(h.input(), h.box), false, 'stale suggestions must not be selectable');
});

test('IME confirmation and candidate navigation do not submit or intercept input', () => {
  const h = workspaceHarness();
  h.ctx.renderWorkspace();
  const input = h.input(); input.value = 'zhongwen';
  let prevented = 0;
  const event = key => ({ key, preventDefault: () => prevented++ });
  input.fire('compositionstart');
  for (const key of ['Enter', ',', 'Tab', 'ArrowDown', 'ArrowUp']) input.fire('keydown', event(key));
  input.fire('compositionend');
  input.fire('keydown', { ...event('Enter'), isComposing: true });
  input.fire('keydown', { ...event('Enter'), keyCode: 229 });
  assert.equal(h.calls.length, 0);
  assert.equal(input.value, 'zhongwen');
  assert.equal(prevented, 0);
  input.value = '中文'; input.fire('keydown', event('Enter'));
  h.ctx.renderWorkspace();
  assert.equal(h.calls[0].text, '中文');
  assert.equal(h.input().value, '', 'submitted text must not reappear as a draft');
});

test('normal preset dragging persists same-list order but not cross-list copies', () => {
  let session;
  const calls = [];
  const ctx = vm.createContext({
    sortable_esm_default: function (_, options) { this.options = options; }, FILTER3: '',
    isSortableSilent: () => false, isDragging: () => true, beginDrag() {}, finishDrag2() {},
    getDragSession: () => session, setDragSession: value => { session = value; }, dispatch: op => calls.push(op)
  });
  vm.runInContext(between('function bindPresetList(', '// src/sortable/cats.ts'), ctx);
  const { div } = dom(); const list = div(); const card = div(); card.attrs['data-preset-text'] = 'first';
  const callbacks = ctx.bindPresetList(list).options;
  callbacks.onStart({ item: card });
  callbacks.onEnd({ item: card, from: list, to: list, oldIndex: 0, newIndex: 1 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, 'preset/reorderItems');
  assert.equal(calls[0].fromIndex, 0); assert.equal(calls[0].toIndex, 1);
  callbacks.onEnd({ item: card, from: list, to: div(), oldIndex: 0, newIndex: 1 });
  assert.equal(calls.length, 1);
});

test('editing shortcuts belong to the expanded panel; minimize shortcut remains global', () => {
  const { document, div } = dom();
  const panel = div(); panel.id = 'pbMainPanel'; document.body.appendChild(panel);
  const chip = div('pb-chip'); panel.appendChild(chip);
  const canvas = document.createElement('canvas'); document.body.appendChild(canvas);
  const toolbar = div('pb-chip-toolbar'); document.body.appendChild(toolbar);
  const counts = { undo: 0, select: 0, toggle: 0 };
  const ctx = vm.createContext({
    document, $: () => panel, cur: { focusedBox: 'box' },
    doUndo: () => counts.undo++, doRedo() {}, clearSelection() {},
    findBox: () => ({}), selectAllInBox: () => counts.select++, toggleMinimized: () => counts.toggle++
  });
  vm.runInContext(fn('isPanelVisible', 'toggleMinimized') + fn('bindKeys', 'bindClearSelectionOnOutsideClick'), ctx);
  ctx.bindKeys();
  const key = (target, k, extras = {}) => document.fire('keydown', { target, key: k, ctrlKey: true, preventDefault() {}, ...extras });
  document.fire('pointerdown', { target: canvas }); key(canvas, 'z'); key(canvas, 'a');
  assert.equal(counts.undo, 0); assert.equal(counts.select, 0);
  document.fire('pointerdown', { target: chip }); key(document.body, 'z'); key(document.body, 'a');
  assert.equal(counts.undo, 1); assert.equal(counts.select, 1);
  document.fire('pointerdown', { target: toolbar }); key(toolbar, 'z');
  assert.equal(counts.undo, 2);
  panel.classList.add('pb-minimized'); key(toolbar, 'z'); key(toolbar, 'a');
  assert.equal(counts.undo, 2); assert.equal(counts.select, 1);
  document.fire('pointerdown', { target: canvas }); key(canvas, 'X', { shiftKey: true });
  assert.equal(counts.toggle, 1);
});
