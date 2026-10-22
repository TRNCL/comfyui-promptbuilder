const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/promptbuilder.js'), 'utf8');

function section(start, end) {
  const first = source.indexOf(start);
  const last = source.indexOf(end, first + start.length);
  assert.ok(first >= 0 && last > first, `Missing source section: ${start}`);
  return source.slice(first, last);
}

function harness() {
  const storage = new Map();
  const timers = new Map();
  const inputs = [];
  let timerId = 0;
  const context = vm.createContext({
    console,
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    queueMicrotask() {},
    AbortController,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    document: {
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement() {
        const events = new Map();
        const input = { addEventListener: (name, fn) => events.set(name, fn), click() {}, events };
        inputs.push(input);
        return input;
      },
    },
    window: {},
    app: { registerExtension(extension) { this.extension = extension; } },
  });
  const run = js => vm.runInContext(js, context);
  // Use the actual model, operations, persistence and undo code in the shipped bundle.
  run(source.slice(0, source.indexOf('// src/ui/panel.ts')).replace(/^import \{ app \} from .*;$/m, ''));
  run(section('function openNode(node)', 'function doUndo()'));
  run(section('function importPresetsOnly()', 'function bindStatusLink('));
  run(section('app.registerExtension({', 'console.log("[PromptBuilder]'));
  run(`
    var panelHidden = false;
    var draftResetCount = 0;
    var rendered = 0;
    var notices = [];
    var panelStub = { dataset: {}, classList: { contains: () => panelHidden } };
    function getPanel() { return panelStub; }
    function resetWorkspaceDrafts() { draftResetCount++; }
    function renderAll() { rendered++; }
    function showPanel() {}
    function toast(message, level) { notices.push({ message, level }); }
    setUndoRestoreHandler(refreshAll);
    var nodeA = { id: 1, properties: {}, widgets: [{name: 'positive', value: 'alpha'}, {name: 'negative', value: ''}] };
    var nodeB = { id: 2, properties: {}, widgets: [{name: 'positive', value: 'beta'}, {name: 'negative', value: ''}] };
  `);
  return { context, storage, timers, inputs, run };
}

test('an edit is immediately available to ComfyUI queueing and workflow serialization', () => {
  const h = harness();
  h.run(`
    openNode(nodeA);
    dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'added' });
  `);
  assert.equal(h.run('nodeA.widgets[0].value'), 'alpha, added');
  assert.equal(h.run('JSON.parse(nodeA.properties.pb_state_next).workspace[0].inputboxes[0].chips[1].text'), 'added');
  assert.equal(h.timers.size, 0, 'saving must not rely on a later timer');
  h.run(`openNode(nodeA);`);
  assert.equal(h.run('buildPositiveText()'), 'alpha, added');
});

test('switching nodes immediately preserves the edit on its original node', () => {
  const h = harness();
  h.run(`
    openNode(nodeA);
    dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'added' });
    openNode(nodeB);
  `);
  assert.equal(h.run('nodeA.widgets[0].value'), 'alpha, added');
  assert.equal(h.run('nodeB.widgets[0].value'), 'beta');
  h.run('openNode(nodeA)');
  assert.equal(h.run('buildPositiveText()'), 'alpha, added');
});

test('reopening an unsaved node preserves the box IDs used to retain input drafts', () => {
  const h = harness();
  h.run('openNode(nodeA); var boxIdBefore = cur.focusedBox; openNode(nodeA)');
  assert.equal(h.run('cur.focusedBox === boxIdBefore'), true);
  assert.equal(h.run('draftResetCount'), 1);
});

test('editing a node without properties creates its serialized state', () => {
  const h = harness();
  h.run(`delete nodeA.properties; openNode(nodeA); dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'added' });`);
  assert.equal(h.run('JSON.parse(nodeA.properties.pb_state_next).workspace[0].inputboxes[0].chips[1].text'), 'added');
});

test('undo and redo immediately update serialized state and output widgets', () => {
  const h = harness();
  h.run(`openNode(nodeA); dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'added' }); undo();`);
  assert.equal(h.run('nodeA.widgets[0].value'), 'alpha');
  h.run('redo()');
  assert.equal(h.run('nodeA.widgets[0].value'), 'alpha, added');
  assert.equal(h.run('JSON.parse(nodeA.properties.pb_state_next).workspace[0].inputboxes[0].chips.length'), 2);
});

test('workflow replacement with the same node ID clears undo, redo and draft ownership', () => {
  const h = harness();
  h.run(`
    openNode(nodeA);
    dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'first' });
    dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'second' });
    undo();
    var replacement = { id: 1, properties: {}, widgets: [{ name: 'positive', value: 'new workflow' }] };
    softReloadActiveNode(replacement);
  `);
  assert.equal(h.run('canUndo() || canRedo()'), false);
  assert.equal(h.run('draftResetCount'), 2);
  h.run('undo(); redo()');
  assert.equal(h.run('buildPositiveText()'), 'new workflow');
  assert.equal(h.run('replacement.widgets[0].value'), 'new workflow');
});

test('onConfigure also isolates new state on the same node instance while hidden', () => {
  const h = harness();
  h.run(`
    openNode(nodeA);
    dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'old edit' });
    function TestNode() {}
    TestNode.prototype.onConfigure = function() {
      this.properties = {};
      this.widgets[0].value = 'configured workflow';
      return 42;
    };
    app.extension.beforeRegisterNodeDef(TestNode, { name: NODE_TYPES[0] }, app);
    panelHidden = true;
    var configuredResult = TestNode.prototype.onConfigure.call(nodeA);
  `);
  assert.equal(h.run('configuredResult'), 42);
  assert.equal(h.run('canUndo() || canRedo()'), false);
  assert.equal(h.run('buildPositiveText()'), 'configured workflow');
  assert.equal(h.run('rendered'), 1, 'a hidden panel need not repaint');
});

test('configuring an unrelated node leaves the active undo history intact', () => {
  const h = harness();
  h.run(`openNode(nodeA); dispatch({ type: 'chip/addText', boxId: cur.focusedBox, text: 'added' }); softReloadActiveNode(nodeB);`);
  assert.equal(h.run('canUndo()'), true);
  assert.equal(h.run('buildPositiveText()'), 'alpha, added');
});

test('invalid preset replacements cannot modify state, saved data or undo history', () => {
  const invalid = [
    null, [], {}, { children: [] }, { children: { category: null } },
    { children: { category: { items: [] } } },
    { children: { category: { children: [] } } },
    { children: { category: { children: { sub: null } } } },
    { children: { category: { children: { sub: {} } } } },
    { children: { category: { children: { sub: { items: 'wrong' } } } } },
    { children: { category: { children: { sub: { items: [null] } } } } },
    { children: { category: { children: { sub: { items: [{ text: 7 }] } } } } },
    { children: { category: { children: { sub: { items: [{ text: 'word', cnText: {} }] } } } } },
    { children: { category: { children: { sub: { items: [], color: 7 } } } } },
  ];
  for (const presets of invalid) {
    const h = harness();
    h.run('savePresetsToLS(); var original = JSON.stringify(state.presets)');
    const saved = new Map(h.storage);
    h.context.candidate = presets;
    assert.equal(h.run('dispatch({ type: "preset/replace", presets: candidate })'), false, JSON.stringify(presets));
    assert.equal(h.run('JSON.stringify(state.presets) === original'), true);
    assert.equal(h.run('canUndo()'), false);
    assert.deepEqual(h.storage, saved);
  }
});

test('empty categories and legacy optional metadata remain valid', () => {
  const h = harness();
  for (const presets of [
    { children: {} },
    { children: { category: { children: {} } } },
    { children: { category: { children: { sub: { items: [] } } } } },
    { children: { category: { children: { sub: { items: [{ text: 'word' }] } } } } },
  ]) {
    h.context.candidate = presets;
    assert.equal(h.run('dispatch({ type: "preset/replace", presets: candidate, l1Cat: "toString", l2Cat: "__proto__" })'), true);
    assert.doesNotThrow(() => h.run('getPresetIndex()'));
  }
  assert.equal(h.run('state.l1Cat'), 'category');
  assert.equal(h.run('state.l2Cat'), 'sub');
  h.context.candidate = JSON.parse(fs.readFileSync(path.join(__dirname, '../presets/promptbuilder_presets.json'), 'utf8')).presets;
  assert.equal(h.run('isValidPresets(candidate)'), true, 'the bundled preset must remain importable');
});

test('invalid persisted presets are ignored without replacing their saved bytes', () => {
  const h = harness();
  const key = h.run('LS_KEYS.presets');
  const corrupt = JSON.stringify({ children: { broken: { items: [] } } });
  h.storage.set(key, corrupt);
  assert.equal(h.run('loadPresetsFromLS()'), null);
  h.run('initFromStorage()');
  assert.ok(h.run('getPresetIndex().length') > 0);
  assert.equal(h.storage.get(key), corrupt);
});

test('file import reports rejected data and preserves the original preset library', async () => {
  const h = harness();
  h.run('savePresetsToLS(); var original = JSON.stringify(state.presets); importPresetsOnly()');
  const saved = new Map(h.storage);
  const input = h.inputs.at(-1);
  input.files = [{ text: async () => JSON.stringify({ presets: { children: { broken: { items: [] } } } }) }];
  await input.events.get('change')();
  assert.equal(h.run('JSON.stringify(state.presets) === original'), true);
  assert.deepEqual(h.storage, saved);
  assert.equal(h.run('notices.at(-1).level'), 'error');
  assert.equal(h.run('canUndo()'), false);
});

test('valid file import is saved and remains undoable', async () => {
  const h = harness();
  h.run('var original = JSON.stringify(state.presets); importPresetsOnly()');
  const input = h.inputs.at(-1);
  input.files = [{ text: async () => JSON.stringify({ presets: { children: {} } }) }];
  await input.events.get('change')();
  assert.equal(h.run('notices.at(-1).level'), 'ok');
  assert.equal(h.run('Object.keys(state.presets.children).length'), 0);
  assert.deepEqual(JSON.parse(h.storage.get(h.run('LS_KEYS.presets'))), { children: {} });
  h.run('undo()');
  assert.equal(h.run('JSON.stringify(state.presets) === original'), true);
});
