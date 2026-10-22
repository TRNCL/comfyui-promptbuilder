const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/promptbuilder.js'), 'utf8');

function loadFunctions() {
  const context = vm.createContext({ state: { settings: {} } });
  for (const [start, end] of [
    ['function hasChinese(text)', 'var init_translation ='],
    ['function formatChip(chip)', '// src/utils/promptParse.ts'],
    ['var WEIGHT_MIN =', '// src/model/layoutPresets.ts'],
  ]) {
    const begin = source.indexOf(start);
    const finish = source.indexOf(end, begin);
    assert.ok(begin !== -1 && finish > begin, `Cannot locate bundle section: ${start}`);
    vm.runInContext(source.slice(begin, finish), context);
  }
  return context;
}

const plain = (value) => JSON.parse(JSON.stringify(value));
const chip = (text, weight = 1, enabled = true) => ({ text, weight, enabled });
const box = (chips, isBreak = false, enabled = true) => ({ chips, break: isBreak, enabled });
const group = (inputboxes, isBreak = false, enabled = true) => ({
  inputboxes, break: isBreak, enabled, color: '#f00',
});

test('adjacent weighted expressions retain their full text', () => {
  const ctx = loadFunctions();
  for (const text of [
    '(red hair:1.3) (blue eyes:1.0)',
    '[red hair:1.3] [blue eyes:1.0]',
    '(red hair:1.3) and (blue eyes:1.2)',
    '((red hair:1.3))',
    '(red hair:1.3]',
    '(red hair:1.3',
    'red hair):1.3',
  ]) {
    const parsed = plain(ctx.parseWeightedPrompt(text));
    assert.deepEqual(parsed, [{ text, weight: 1 }]);
    assert.equal(parsed.map(ctx.formatChip).join(', '), text);
  }
});

test('balanced outer weights and existing bare weights still parse', () => {
  const ctx = loadFunctions();
  const cases = [
    ['(red hair:1.3)', 'red hair', 1.3],
    ['[blue eyes:1.2]', 'blue eyes', 1.2],
    ['((red hair:1.3), blue eyes:1.2)', '(red hair:1.3), blue eyes', 1.2],
    ['([red hair, blue eyes]:1.25)', '[red hair, blue eyes]', 1.3],
    ['(tag:0)', 'tag', 0.1],
    ['(tag:8)', 'tag', 5],
    ['tag: 1.2', 'tag', 1.2],
    ['16:9', '16:9', 1],
    ['1.5:2', '1.5:2', 1],
    ['tag:100', 'tag:100', 1],
    [String.raw`(literal \(tag\):1.2)`, String.raw`literal \(tag\)`, 1.2],
    [String.raw`(literal\:1.2)`, String.raw`(literal\:1.2)`, 1],
    [String.raw`literal\:1.2`, String.raw`literal\:1.2`, 1],
  ];
  for (const [input, text, weight] of cases) {
    assert.deepEqual(plain(ctx.parsePromptToken(input)), { text, weight }, input);
  }
});

test('comma splitting respects nested brackets and escaped punctuation', () => {
  const ctx = loadFunctions();
  assert.deepEqual(plain(ctx.splitPromptParts('red hair, (blue eyes, smile:1.2), [day, night], sky')), [
    'red hair', '(blue eyes, smile:1.2)', '[day, night]', 'sky',
  ]);
  assert.deepEqual(plain(ctx.splitPromptParts(String.raw`literal\(, next, literal\,comma, tail`)), [
    String.raw`literal\(`, 'next', String.raw`literal\,comma`, 'tail',
  ]);
  assert.deepEqual(plain(ctx.splitPromptParts(String.raw`path\\, tail`)), [String.raw`path\\`, 'tail']);
  assert.deepEqual(plain(ctx.parseWeightedPrompt(' , (red hair:1.3), [blue eyes:1.2], ')), [
    { text: 'red hair', weight: 1.3 }, { text: 'blue eyes', weight: 1.2 },
  ]);
  assert.deepEqual(plain(ctx.parseWeightedPrompt('')), []);
});

test('BREAK preview text matches exact prompt output for boxes and groups', () => {
  const ctx = loadFunctions();
  const cases = [
    [group([box([chip('red hair')]), box([chip('blue eyes')], true), box([chip('smile')])]),
      'red hair, BREAK, blue eyes, BREAK, smile'],
    [group([box([chip('red hair', 1.3), chip('hidden', 1, false)]), box([chip('blue eyes')], true)], true),
      'BREAK, (red hair:1.3), BREAK, blue eyes, BREAK, BREAK'],
    [group([box([chip('hidden')], true, false), box([], true), box([chip('sky')])]), 'sky'],
    [group([box([], true)], true), ''],
    [group([box([chip('hidden', 1, false)], true)], true), ''],
  ];
  for (const [value, expected] of cases) {
    assert.equal(ctx.buildGroupText(value), expected);
    const segments = ctx.buildGroupSegments(value);
    assert.equal(segments.map((s) => s.text).join(''), expected);
    assert.ok(segments.filter((s) => s.isBreak).every((s) => s.text === 'BREAK'));
  }
});

test('positive and negative previews retain group separators and enabled flags', () => {
  const ctx = loadFunctions();
  ctx.cur = {
    workspace: [
      group([box([chip('red hair')])], true),
      group([box([])], true),
      group([box([chip('hidden')])], false, false),
      group([box([chip('blue eyes')], true)]),
    ],
    negativeGroup: group([box([chip('blur')], true)], true),
  };
  const positive = 'BREAK, red hair, BREAK, BREAK, blue eyes, BREAK';
  const negative = 'BREAK, BREAK, blur, BREAK, BREAK';
  assert.equal(ctx.buildPositiveText(), positive);
  assert.equal(ctx.buildPositiveSegments().map((s) => s.text).join(''), positive);
  assert.equal(ctx.buildNegativeText(), negative);
  assert.equal(ctx.buildNegativeSegments().map((s) => s.text).join(''), negative);
  ctx.cur.negativeGroup.enabled = false;
  assert.equal(ctx.buildNegativeText(), '');
  assert.deepEqual(plain(ctx.buildNegativeSegments()), []);
});

function translationContext(config) {
  const ctx = loadFunctions();
  const requests = [];
  ctx.state.settings.customApi = config;
  ctx.fetch = async (url, opts) => {
    requests.push({ url, opts });
    return { json: async () => ({ result: { translation: 'translated' } }) };
  };
  return { ctx, requests };
}

test('custom translation encodes URL placeholder values without changing prompt text', async () => {
  const { ctx, requests } = translationContext({
    url: 'https://example.test/translate?q={text}&from={src}&to={tgt}',
    method: 'GET', responseField: 'result.translation',
  });
  const original = '黑色 & white #1? 50% + $& {src} {text}';
  assert.equal(await ctx.translateCustom(original, { src: 'zh', tgt: 'en' }), 'translated');
  const url = new URL(requests[0].url);
  assert.equal(url.searchParams.get('q'), original);
  assert.equal(url.searchParams.get('from'), 'zh');
  assert.equal(url.searchParams.get('to'), 'en');
  assert.equal(url.hash, '');
  assert.equal(requests[0].opts.body, undefined);
});

test('custom translation JSON strings preserve controls and replacement-like text', async () => {
  const { ctx, requests } = translationContext({
    url: 'https://example.test/translate?lang={src}', method: 'POST',
    body: '{"text":"{text}","copy":"{text}","source":"{src}","target":"{tgt}"}',
    responseField: 'result.translation',
  });
  const original = 'price $& $\' $` {src} {tgt} {text} "quote" \\path\t\r\n\b\f\u0000';
  const signal = new AbortController().signal;
  await ctx.translateCustom(original, { src: 'en', tgt: 'zh' }, signal);
  assert.deepEqual(JSON.parse(requests[0].opts.body), {
    text: original, copy: original, source: 'en', target: 'zh',
  });
  assert.equal(requests[0].opts.signal, signal);
  assert.equal(requests[0].opts.headers['Content-Type'], 'application/json');
});

test('custom translation keeps response selection and missing-configuration behavior', async () => {
  const { ctx } = translationContext({ url: 'https://example.test', method: 'POST', responseField: '' });
  assert.equal(await ctx.translateCustom('cat', { src: 'en', tgt: 'zh' }), '{"result":{"translation":"translated"}}');
  ctx.state.settings.customApi.responseField = 'missing.translation';
  assert.equal(await ctx.translateCustom('cat', { src: 'en', tgt: 'zh' }), 'cat');
  ctx.state.settings.customApi.url = '';
  await assert.rejects(ctx.translateCustom('cat', { src: 'en', tgt: 'zh' }), /API/);
});
