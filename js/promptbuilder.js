// PromptBuilder — generated file, do not edit directly
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/model/types.ts
var LS_KEYS, GROUP_COLORS, GROUP_COLORS_LIGHT, STATE_VERSION, UNDO_LIMIT, PANEL_DEFAULTS, COLUMN_MINS, PRESET_COLLAPSE_THRESHOLD, NODE_TYPES;
var init_types = __esm({
  "src/model/types.ts"() {
    "use strict";
    LS_KEYS = {
      presets: "promptbuildernext_presets",
      settings: "promptbuildernext_settings",
      cats: "promptbuildernext_state",
      panelGeo: "promptbuildernext_panelgeo",
      colWidths: "promptbuildernext_colwidths"
    };
    GROUP_COLORS = [
      "#FF6B6B",
      // 红 · 高
      "#C92A2A",
      // 红 · 低
      "#FFE066",
      // 黄 · 高
      "#E6A800",
      // 黄 · 低
      "#69DB7C",
      // 绿 · 高
      "#2F9E44",
      // 绿 · 低
      "#74C0FC",
      // 蓝 · 高
      "#1C7ED6",
      // 蓝 · 低
      "#B197FC",
      // 紫 · 高
      "#7048E8",
      // 紫 · 低
      "#CED4DA",
      // 灰 · 高
      "#868E96"
      // 灰 · 低
    ];
    GROUP_COLORS_LIGHT = [
      "#E03131",
      // 红 · 高
      "#9B1C1C",
      // 红 · 低
      "#E6B800",
      // 黄 · 高
      "#A67C00",
      // 黄 · 低
      "#2F9E44",
      // 绿 · 高
      "#1B6B2E",
      // 绿 · 低
      "#1C7ED6",
      // 蓝 · 高
      "#0B4F9C",
      // 蓝 · 低
      "#7950F2",
      // 紫 · 高
      "#5F3DC4",
      // 紫 · 低
      "#868E96",
      // 灰 · 高
      "#495057"
      // 灰 · 低
    ];
    STATE_VERSION = 5;
    UNDO_LIMIT = 50;
    PANEL_DEFAULTS = {
      minWidth: 600,
      minHeight: 400,
      defaultWidth: 900,
      defaultHeight: 600
    };
    COLUMN_MINS = {
      presetMinHeight: 120,
      workspaceMinHeight: 200,
      rightMinWidth: 220
    };
    PRESET_COLLAPSE_THRESHOLD = 60;
    NODE_TYPES = [
      "PromptBuilderCLIPEncode",
      "PromptBuilderText",
      "PromptBuilderNextCLIPEncode",
      "PromptBuilderNextText"
    ];
  }
});

// src/utils/dom.ts
function $(id) {
  return document.getElementById(id);
}
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      if (key === "className") el.className = val;
      else el.setAttribute(key, val);
    }
  }
  for (const child of children) {
    el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return el;
}
function div(className, ...children) {
  return h("div", className ? { className } : {}, ...children);
}
function span(className, ...children) {
  return h("span", className ? { className } : {}, ...children);
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function gid() {
  return Math.random().toString(36).slice(2, 11);
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
var init_dom = __esm({
  "src/utils/dom.ts"() {
    "use strict";
  }
});

// src/model/factory.ts
function mkChip(text, cnText = "", weight = 1, categoryColor) {
  return {
    id: gid(),
    text,
    cnText,
    weight,
    enabled: true,
    categoryColor
  };
}
function mkBox() {
  return { id: gid(), enabled: true, break: false, chips: [] };
}
function mkGroup(name, color, theme = "dark") {
  const palette = theme === "light" ? GROUP_COLORS_LIGHT : GROUP_COLORS;
  return {
    id: gid(),
    name,
    color: color || palette[Math.floor(Math.random() * palette.length)],
    enabled: true,
    collapsed: false,
    break: false,
    inputboxes: [mkBox()]
  };
}
function mkNegativeGroup() {
  return {
    id: "__neg__",
    name: "\u8D1F\u9762\u63D0\u793A\u8BCD",
    // 默认暗红（可改色，与普通分组共用调色板）
    color: GROUP_COLORS[1],
    enabled: true,
    collapsed: false,
    break: false,
    inputboxes: [mkBox()]
  };
}
function defaultPresets() {
  return {
    items: [],
    children: {
      "\u6211\u7684\u8BCD\u5E93": {
        items: [],
        children: {
          "\u9ED8\u8BA4": {
            name: "\u9ED8\u8BA4",
            items: [
              { text: "masterpiece", cnText: "\u6770\u4F5C" },
              { text: "best quality", cnText: "\u6700\u4F73\u8D28\u91CF" },
              { text: "1girl", cnText: "\u4E00\u4E2A\u5973\u5B69" }
            ],
            color: GROUP_COLORS[0]
          }
        }
      }
    }
  };
}
function defaultSettings() {
  return {
    scale: "mid",
    translator: "mymemory",
    theme: "dark",
    customApi: { url: "", method: "POST", body: "", responseField: "" }
  };
}
var init_factory = __esm({
  "src/model/factory.ts"() {
    "use strict";
    init_types();
    init_dom();
  }
});

// src/model/state.ts
function setActiveNode(node) {
  activeNode = node;
}
function getGroupColors() {
  return state.settings.theme === "light" ? GROUP_COLORS_LIGHT : GROUP_COLORS;
}
function allGroups() {
  return [...cur.workspace, cur.negativeGroup];
}
function findBox(boxId) {
  for (const g of allGroups()) {
    for (const b of g.inputboxes) {
      if (b.id === boxId) return { box: b, group: g };
    }
  }
  return null;
}
function findChip(chipId) {
  for (const g of allGroups()) {
    for (const b of g.inputboxes) {
      const chip = b.chips.find((c) => c.id === chipId);
      if (chip) return { chip, box: b, group: g };
    }
  }
  return null;
}
function getFocusedBox() {
  if (cur.focusedBox) {
    const hit = findBox(cur.focusedBox);
    if (hit) return hit;
  }
  for (const g of cur.workspace) {
    if (g.enabled && g.inputboxes.length > 0) {
      return { box: g.inputboxes[0], group: g };
    }
  }
  if (cur.negativeGroup.inputboxes[0]) {
    return { box: cur.negativeGroup.inputboxes[0], group: cur.negativeGroup };
  }
  return null;
}
function getCurrentPresetItems() {
  const l1 = state.presets.children[state.l1Cat];
  if (!l1) return null;
  const l2 = l1.children[state.l2Cat];
  return l2?.items ?? null;
}
function getCurrentL2Category() {
  const l1 = state.presets.children[state.l1Cat];
  if (!l1) return null;
  const l2 = l1.children[state.l2Cat];
  if (!l2) return null;
  if (!l2.color) l2.color = "#8a93a6";
  return l2;
}
function normalizeCategories() {
  const l1Keys = Object.keys(state.presets.children);
  if (l1Keys.length === 0) {
    state.l1Cat = "";
    state.l2Cat = "";
    return;
  }
  if (!state.presets.children[state.l1Cat]) state.l1Cat = l1Keys[0];
  const l2Keys = Object.keys(state.presets.children[state.l1Cat].children || {});
  if (l2Keys.length === 0) state.l2Cat = "";
  else if (!state.presets.children[state.l1Cat].children[state.l2Cat]) state.l2Cat = l2Keys[0];
}
function markPresetIndexDirty() {
  _presetDirty = true;
}
function getPresetIndex() {
  if (_presetDirty || !_presetIndex) {
    _presetIndex = [];
    for (const l1 of Object.values(state.presets.children)) {
      for (const l2 of Object.values(l1.children)) {
        for (const item of l2.items) {
          _presetIndex.push({
            text: item.text,
            cnText: item.cnText,
            categoryColor: l2.color
          });
        }
      }
    }
    _presetDirty = false;
  }
  return _presetIndex;
}
function cloneUndoSnapshot() {
  return JSON.parse(JSON.stringify({
    workspace: cur.workspace,
    negativeGroup: cur.negativeGroup,
    focusedBox: cur.focusedBox,
    presets: state.presets,
    l1Cat: state.l1Cat,
    l2Cat: state.l2Cat
  }));
}
function restoreUndoSnapshot(snap) {
  const copy = JSON.parse(JSON.stringify(snap));
  cur.workspace = copy.workspace;
  cur.negativeGroup = copy.negativeGroup;
  cur.focusedBox = copy.focusedBox;
  state.presets = copy.presets;
  state.l1Cat = copy.l1Cat;
  state.l2Cat = copy.l2Cat;
  markPresetIndexDirty();
}
var state, cur, activeNode, _presetIndex, _presetDirty;
var init_state = __esm({
  "src/model/state.ts"() {
    "use strict";
    init_types();
    init_factory();
    state = {
      _v: STATE_VERSION,
      presets: defaultPresets(),
      l1Cat: "\u6211\u7684\u8BCD\u5E93",
      l2Cat: "\u9ED8\u8BA4",
      settings: defaultSettings()
    };
    cur = {
      workspace: [mkGroup("\u4EBA\u7269")],
      negativeGroup: mkNegativeGroup(),
      focusedBox: ""
    };
    activeNode = null;
    _presetIndex = null;
    _presetDirty = true;
  }
});

// src/ui/pipe.ts
function injectCSS(id, css2) {
  let el = _styles.get(id);
  if (!el) {
    el = document.createElement("style");
    el.id = `pb-style-${id}`;
    el.textContent = css2;
    document.head.appendChild(el);
    _styles.set(id, el);
  } else {
    el.textContent = css2;
  }
}
var _styles;
var init_pipe = __esm({
  "src/ui/pipe.ts"() {
    "use strict";
    _styles = /* @__PURE__ */ new Map();
  }
});

// src/ui/toast.ts
function toast(msg, type = "", ms = 2500) {
  if (!_css) {
    injectCSS("toast", CSS2);
    _css = true;
  }
  if (!_box) {
    _box = div("pb-toast-container");
    document.body.appendChild(_box);
  }
  const el = div("pb-toast");
  if (type) el.classList.add(`pb-toast-${type}`);
  el.textContent = msg;
  _box.appendChild(el);
  setTimeout(() => {
    el.classList.add("pb-toast-out");
    setTimeout(() => el.remove(), 200);
  }, ms);
}
var CSS2, _css, _box;
var init_toast = __esm({
  "src/ui/toast.ts"() {
    "use strict";
    init_pipe();
    init_dom();
    CSS2 = /*css*/
    `
.pb-toast-container {
  position: fixed; z-index: 10005; bottom: 24px; left: 50%;
  transform: translateX(-50%); display: flex; flex-direction: column;
  align-items: center; gap: 8px; pointer-events: none;
}
.pb-toast {
  padding: 8px 18px; border-radius: 8px; background: var(--pb-panel);
  border: 1px solid var(--pb-border); color: var(--pb-text); font-size: 14px;
  box-shadow: var(--pb-shadow-lg); pointer-events: auto;
  animation: pb-toast-in 200ms ease-out; transition: opacity 200ms;
}
.pb-toast.pb-toast-out { opacity: 0; }
.pb-toast.pb-toast-ok { border-color: #5cd859; }
.pb-toast.pb-toast-warn { border-color: #ff9f43; }
.pb-toast.pb-toast-error { border-color: var(--pb-danger); }
@keyframes pb-toast-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
    _css = false;
    _box = null;
  }
});

// src/services/translation.ts
var translation_exports = {};
__export(translation_exports, {
  detectPair: () => detectPair,
  translateChips: () => translateChips,
  translateText: () => translateText
});
function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}
function detectPair(text) {
  return hasChinese(text) ? { src: "zh", tgt: "en" } : { src: "en", tgt: "zh" };
}
async function translateText(text) {
  const s = state.settings;
  const pair = detectPair(text);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5e3);
  try {
    switch (s.translator) {
      case "google":
        return await translateGoogle(text, pair, controller.signal);
      case "custom":
        return await translateCustom(text, pair, controller.signal);
      default:
        return await translateMyMemory(text, pair, controller.signal);
    }
  } finally {
    clearTimeout(timeout);
  }
}
async function translateMyMemory(text, pair, signal) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair.src}|${pair.tgt}`;
  const resp = await fetch(url, { signal });
  const data = await resp.json();
  if (data.responseStatus === 200 || data.responseStatus === 403) {
    return data.responseData?.translatedText || text;
  }
  throw new Error(`MyMemory ${data.responseStatus}`);
}
async function translateGoogle(text, pair, signal) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${pair.src}&tl=${pair.tgt}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await fetch(url, { signal });
  const data = await resp.json();
  if (data?.[0]) return data[0].map((seg) => seg[0]).join("");
  return text;
}
async function translateCustom(text, pair, signal) {
  const cfg = state.settings.customApi;
  if (!cfg.url) throw new Error("\u81EA\u5B9A\u4E49 API \u672A\u914D\u7F6E");
  const esc = (s, json) => json ? s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") : s;
  const fill = (tpl, json) => tpl.replace(/\{text\}/g, esc(text, json)).replace(/\{src\}/g, pair.src).replace(/\{tgt\}/g, pair.tgt);
  const opts = {
    method: cfg.method,
    signal,
    headers: { "Content-Type": "application/json" }
  };
  if (cfg.method !== "GET" && cfg.body) opts.body = fill(cfg.body, true);
  const resp = await fetch(fill(cfg.url, false), opts);
  const data = await resp.json();
  if (!cfg.responseField) return JSON.stringify(data);
  let cur2 = data;
  for (const p of cfg.responseField.split(".")) {
    if (cur2 == null || typeof cur2 !== "object") return text;
    cur2 = cur2[p];
  }
  return typeof cur2 === "string" ? cur2 : JSON.stringify(cur2);
}
async function translateChips(chips, opts) {
  const targets = chips.filter(
    (c) => c.text.trim() && (opts?.force || !c.cnText)
  );
  if (!targets.length) return { ok: 0, fail: 0 };
  let ok = 0, fail = 0;
  const queue = [...targets];
  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) {
      const chip = queue.shift();
      try {
        const translated = await translateText(chip.text);
        const pair = detectPair(chip.text);
        if (pair.src === "zh" && !hasChinese(translated)) {
          chip.cnText = chip.text;
          chip.text = translated;
        } else {
          chip.cnText = translated;
        }
        ok++;
      } catch {
        fail++;
      } finally {
        chip.translating = false;
      }
    }
  });
  await Promise.all(workers);
  if (fail && ok) toast(`\u5DF2\u7FFB\u8BD1 ${ok} \u4E2A\uFF0C\u5931\u8D25 ${fail} \u4E2A`, "warn");
  else if (fail) toast(`${fail} \u4E2A\u7FFB\u8BD1\u5931\u8D25`, "warn");
  else if (ok) toast(`\u5DF2\u7FFB\u8BD1 ${ok} \u4E2A`, "ok");
  return { ok, fail };
}
var init_translation = __esm({
  "src/services/translation.ts"() {
    "use strict";
    init_state();
    init_toast();
  }
});

// src/index.ts
init_types();
init_state();
import { app } from "../../scripts/app.js";

// src/app/persist.ts
init_types();
init_state();
init_factory();
init_dom();

// src/build/prompt.ts
init_state();
function formatChip(chip) {
  return chip.weight !== 1 ? `(${chip.text}:${chip.weight})` : chip.text;
}
function buildGroupText(g) {
  const segments = [];
  for (const box of g.inputboxes) {
    if (!box.enabled) continue;
    const parts = box.chips.filter((c) => c.enabled).map(formatChip);
    if (!parts.length) continue;
    const content2 = parts.join(", ");
    segments.push(box.break ? `BREAK, ${content2}, BREAK` : content2);
  }
  if (!segments.length) return "";
  const content = segments.join(", ");
  return g.break ? `BREAK, ${content}, BREAK` : content;
}
function buildPositiveText() {
  return cur.workspace.filter((g) => g.enabled).map(buildGroupText).filter(Boolean).join(", ");
}
function buildNegativeText() {
  if (!cur.negativeGroup.enabled) return "";
  return buildGroupText(cur.negativeGroup);
}
function countWordsAndChars(text) {
  if (!text?.trim()) return { words: 0, chars: 0 };
  const trimmed = text.trim();
  return {
    words: trimmed.split(/,\s*/).filter(Boolean).length,
    chars: trimmed.replace(/,\s*/g, "").length
  };
}
function buildGroupSegments(g) {
  const segs = [];
  if (g.break) segs.push({ text: "BREAK", isBreak: true });
  const boxParts = [];
  for (const box of g.inputboxes) {
    if (!box.enabled) continue;
    const parts = box.chips.filter((c) => c.enabled).map(formatChip);
    if (!parts.length) continue;
    const content = parts.join(", ");
    if (box.break) {
      if (boxParts.length) {
        segs.push({ text: boxParts.join(", "), color: g.color });
        boxParts.length = 0;
      }
      segs.push({ text: "BREAK", isBreak: true });
      segs.push({ text: content, color: g.color });
      segs.push({ text: "BREAK", isBreak: true });
    } else {
      boxParts.push(content);
    }
  }
  if (boxParts.length) segs.push({ text: boxParts.join(", "), color: g.color });
  if (g.break) segs.push({ text: "BREAK", isBreak: true });
  if (segs.length === 2 && segs[0].isBreak && segs[1].isBreak) return [];
  return segs;
}
function buildPositiveSegments() {
  const out = [];
  const groups = cur.workspace.filter((g) => g.enabled);
  for (const g of groups) {
    const segs = buildGroupSegments(g);
    if (!segs.length) continue;
    if (out.length) {
      const last = out[out.length - 1];
      if (!last.isBreak) {
        last.text += ", ";
      } else {
        let color;
        for (let j = out.length - 1; j >= 0; j--) {
          if (out[j].color) {
            color = out[j].color;
            break;
          }
        }
        out.push({ text: ", ", color });
      }
    }
    out.push(...segs);
  }
  return out;
}
function buildNegativeSegments() {
  if (!cur.negativeGroup.enabled) return [];
  return buildGroupSegments(cur.negativeGroup);
}

// src/utils/promptParse.ts
var WEIGHT_MIN = 0.1;
var WEIGHT_MAX = 5;
function clampWeight(n) {
  if (!Number.isFinite(n)) return 1;
  const r = Math.round(n * 10) / 10;
  return Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, r));
}
function splitPromptParts(text) {
  const parts = [];
  let buf = "";
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "[") {
      depth++;
      buf += ch;
      continue;
    }
    if (ch === ")" || ch === "]") {
      depth = Math.max(0, depth - 1);
      buf += ch;
      continue;
    }
    if (ch === "," && depth === 0) {
      const t = buf.trim();
      if (t) parts.push(t);
      buf = "";
      continue;
    }
    buf += ch;
  }
  const last = buf.trim();
  if (last) parts.push(last);
  return parts;
}
function parsePromptToken(raw) {
  const s = raw.trim();
  if (!s) return { text: "", weight: 1 };
  const wrapped = s.match(/^([(\[])\s*([\s\S]+?)\s*:\s*([+-]?\d+(?:\.\d+)?)\s*([)\]])$/);
  if (wrapped && matchingBrackets(wrapped[1], wrapped[4])) {
    const text = wrapped[2].trim();
    if (text) return { text, weight: clampWeight(parseFloat(wrapped[3])) };
  }
  const bare = s.match(/^(.+?)\s*:\s*([+-]?\d+(?:\.\d+)?)$/);
  if (bare) {
    const text = bare[1].trim();
    const w = parseFloat(bare[2]);
    if (text && !/^\d+(\.\d+)?$/.test(text) && Number.isFinite(w) && w >= 0.05 && w <= 10) {
      if (!/^\d+$/.test(text) || bare[2].includes(".")) {
        if (!isLikelyAspectRatio(text, bare[2])) {
          return { text, weight: clampWeight(w) };
        }
      }
    }
  }
  return { text: s, weight: 1 };
}
function matchingBrackets(open, close) {
  return open === "(" && close === ")" || open === "[" && close === "]";
}
function isLikelyAspectRatio(left, right) {
  if (!/^\d{1,2}$/.test(left) || !/^\d{1,2}$/.test(right)) return false;
  const a = parseInt(left, 10);
  const b = parseInt(right, 10);
  return a >= 1 && a <= 32 && b >= 1 && b <= 32;
}
function parseWeightedPrompt(text) {
  if (!text?.trim()) return [];
  const out = [];
  for (const part of splitPromptParts(text)) {
    const tok = parsePromptToken(part);
    if (!tok.text) continue;
    out.push(tok);
  }
  return out;
}

// src/app/persist.ts
function loadPresetsFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEYS.presets);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.children && typeof data.children === "object") return data;
  } catch {
  }
  return null;
}
function savePresetsToLS() {
  try {
    localStorage.setItem(LS_KEYS.presets, JSON.stringify(state.presets));
    localStorage.setItem(LS_KEYS.cats, JSON.stringify({ l1Cat: state.l1Cat, l2Cat: state.l2Cat }));
  } catch {
  }
}
function loadSettingsFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEYS.settings);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return null;
}
function saveSettingsToLS() {
  try {
    localStorage.setItem(LS_KEYS.settings, JSON.stringify(state.settings));
  } catch {
  }
}
function loadPanelGeo() {
  try {
    const raw = localStorage.getItem(LS_KEYS.panelGeo);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return null;
}
function savePanelGeo(geo) {
  try {
    localStorage.setItem(LS_KEYS.panelGeo, JSON.stringify(geo));
  } catch {
  }
}
function loadColWidths() {
  try {
    const raw = localStorage.getItem(LS_KEYS.colWidths);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  return null;
}
function saveColWidths(widths) {
  try {
    localStorage.setItem(LS_KEYS.colWidths, JSON.stringify(widths));
  } catch {
  }
}
function migrateGroup(g) {
  g.id = g.id || gid();
  g.name = g.name || "\u5206\u7EC4";
  g.color = g.color || "#6aa9ff";
  g.enabled = g.enabled !== false;
  g.break = !!g.break;
  g.collapsed = !!g.collapsed;
  if (!Array.isArray(g.inputboxes) || g.inputboxes.length === 0) g.inputboxes = [mkBox()];
  for (const b of g.inputboxes) {
    b.id = b.id || gid();
    b.enabled = b.enabled !== false;
    b.break = !!b.break;
    if (!Array.isArray(b.chips)) b.chips = [];
    for (const c of b.chips) {
      c.id = c.id || gid();
      c.text = typeof c.text === "string" ? c.text : String(c.text ?? "");
      c.cnText = typeof c.cnText === "string" ? c.cnText : "";
      c.weight = typeof c.weight === "number" ? c.weight : 1;
      c.enabled = c.enabled !== false;
    }
  }
  return g;
}
function initFromStorage() {
  const presets = loadPresetsFromLS();
  if (presets) state.presets = presets;
  try {
    const cat = localStorage.getItem(LS_KEYS.cats);
    if (cat) {
      const c = JSON.parse(cat);
      if (c.l1Cat) state.l1Cat = c.l1Cat;
      if (c.l2Cat) state.l2Cat = c.l2Cat;
    }
  } catch {
  }
  normalizeCategories();
  const settings = loadSettingsFromLS();
  if (settings) {
    state.settings = {
      ...state.settings,
      ...settings,
      customApi: { ...state.settings.customApi, ...settings.customApi || {} }
    };
  }
}
function serializeNodeState() {
  const data = {
    _v: STATE_VERSION,
    workspace: cur.workspace,
    negativeGroup: cur.negativeGroup,
    focusedBox: cur.focusedBox
  };
  return JSON.stringify(data);
}
function deserializeNodeState(json) {
  try {
    const data = JSON.parse(json);
    if (data.workspace && data.negativeGroup) {
      cur.workspace = (Array.isArray(data.workspace) ? data.workspace : []).map(migrateGroup);
      if (cur.workspace.length === 0) cur.workspace = [mkGroup("\u4EBA\u7269", void 0, state.settings.theme)];
      cur.negativeGroup = migrateGroup(data.negativeGroup);
      cur.focusedBox = data.focusedBox || cur.workspace[0]?.inputboxes[0]?.id || "";
      return true;
    }
  } catch {
  }
  return false;
}
function parseFlat(text) {
  return parseWeightedPrompt(text).map(({ text: t, weight }) => mkChip(t, "", weight));
}
function loadNodeIntoCur(node) {
  const pb = node.properties?.["pb_state_next"];
  if (pb && deserializeNodeState(pb)) return;
  const pos = node.widgets?.find((w) => w.name === "positive")?.value || "";
  const neg = node.widgets?.find((w) => w.name === "negative")?.value || "";
  if (pos || neg) {
    cur.workspace = [{
      ...mkGroup("\u5BFC\u5165", void 0, state.settings.theme),
      inputboxes: [{ id: gid(), enabled: true, break: false, chips: parseFlat(pos) }]
    }];
    cur.negativeGroup = {
      ...mkNegativeGroup(),
      inputboxes: [{ id: gid(), enabled: true, break: false, chips: parseFlat(neg) }]
    };
    cur.focusedBox = cur.workspace[0].inputboxes[0].id;
    return;
  }
  cur.workspace = [mkGroup("\u4EBA\u7269", void 0, state.settings.theme)];
  cur.negativeGroup = mkNegativeGroup();
  cur.focusedBox = cur.workspace[0].inputboxes[0].id;
}
function syncWidgets() {
  if (!activeNode?.widgets) return;
  const pos = activeNode.widgets.find((w) => w.name === "positive");
  const neg = activeNode.widgets.find((w) => w.name === "negative");
  if (pos) pos.value = buildPositiveText();
  if (neg) neg.value = buildNegativeText();
  try {
    (window.__comfyApp || window.app)?.graph?.change?.();
  } catch {
  }
}
function saveNodeState() {
  if (!activeNode) return;
  if (activeNode.properties) {
    activeNode.properties["pb_state_next"] = serializeNodeState();
  }
  syncWidgets();
}

// src/model/ops.ts
init_state();
init_factory();

// src/model/selection.ts
init_state();
var _selected = /* @__PURE__ */ new Set();
var _anchorId = null;
function getSelectedIds() {
  return [..._selected];
}
function getSelectedCount() {
  return _selected.size;
}
function isSelected(chipId) {
  return _selected.has(chipId);
}
function clearSelection() {
  _selected.clear();
  _anchorId = null;
  paintSelectionClasses();
}
function selectOnly(chipId) {
  _selected.clear();
  _selected.add(chipId);
  _anchorId = chipId;
  paintSelectionClasses();
}
function toggleSelect(chipId) {
  if (_selected.has(chipId)) {
    _selected.delete(chipId);
    if (_anchorId === chipId) _anchorId = _selected.size ? [..._selected][_selected.size - 1] : null;
  } else {
    _selected.add(chipId);
    _anchorId = chipId;
  }
  paintSelectionClasses();
}
function selectAllInBox(boxId) {
  for (const g of allGroups()) {
    for (const b of g.inputboxes) {
      if (b.id !== boxId) continue;
      _selected.clear();
      for (const c of b.chips) _selected.add(c.id);
      _anchorId = b.chips[0]?.id || null;
      paintSelectionClasses();
      return;
    }
  }
}
function selectRangeTo(chipId) {
  const hit = findChip(chipId);
  if (!hit) {
    selectOnly(chipId);
    return;
  }
  const ids = hit.box.chips.map((c) => c.id);
  const end = ids.indexOf(chipId);
  if (end < 0) {
    selectOnly(chipId);
    return;
  }
  let start = _anchorId ? ids.indexOf(_anchorId) : end;
  if (start < 0) start = end;
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  _selected.clear();
  for (let i = lo; i <= hi; i++) _selected.add(ids[i]);
  if (!_anchorId) _anchorId = chipId;
  paintSelectionClasses();
}
function pruneSelection() {
  const alive = /* @__PURE__ */ new Set();
  for (const g of allGroups()) {
    for (const b of g.inputboxes) {
      for (const c of b.chips) alive.add(c.id);
    }
  }
  for (const id of [..._selected]) {
    if (!alive.has(id)) _selected.delete(id);
  }
  if (_anchorId && !alive.has(_anchorId)) {
    _anchorId = _selected.size ? [..._selected][0] : null;
  }
}
function paintSelectionClasses() {
  pruneSelection();
  document.querySelectorAll(".pb-chip.pb-chip-selected").forEach((el) => {
    el.classList.remove("pb-chip-selected");
  });
  for (const id of _selected) {
    document.querySelector(`.pb-chip[data-chip-id="${id}"]`)?.classList.add("pb-chip-selected");
  }
}
function getSelectedIdsInWorkspaceOrder() {
  const out = [];
  const set = _selected;
  if (!set.size) return out;
  for (const g of allGroups()) {
    for (const b of g.inputboxes) {
      for (const c of b.chips) {
        if (set.has(c.id)) out.push(c.id);
      }
    }
  }
  return out;
}

// src/model/ops.ts
var NOOP = {
  changed: false,
  undoable: false,
  persistNode: false,
  persistPresets: false,
  persistSettings: false,
  scopes: []
};
function ws(scopes = ["workspace", "output"]) {
  return { changed: true, undoable: true, persistNode: true, persistPresets: false, persistSettings: false, scopes };
}
function pr(scopes = ["presets"]) {
  return { changed: true, undoable: true, persistNode: false, persistPresets: true, persistSettings: false, scopes };
}
function findGroup(id) {
  if (id === cur.negativeGroup.id) return cur.negativeGroup;
  return cur.workspace.find((g) => g.id === id) || null;
}
function reorder(arr, from, to) {
  if (from === to || from < 0 || to < 0 || from >= arr.length) return false;
  const [item] = arr.splice(from, 1);
  if (item === void 0) return false;
  arr.splice(Math.min(to, arr.length), 0, item);
  return true;
}
function reorderRecordKeys(rec, from, to) {
  const keys = Object.keys(rec);
  if (!reorder(keys, from, to)) return false;
  const next = {};
  for (const k of keys) next[k] = rec[k];
  for (const k of Object.keys(rec)) delete rec[k];
  for (const k of keys) rec[k] = next[k];
  return true;
}
function renameRecordKey(rec, oldKey, newKey, mapValue) {
  if (!oldKey || !newKey || oldKey === newKey) return false;
  if (!(oldKey in rec) || newKey in rec) return false;
  const keys = Object.keys(rec);
  const next = {};
  for (const k of keys) {
    if (k === oldKey) {
      const v = rec[oldKey];
      next[newKey] = mapValue ? mapValue(v) : v;
    } else {
      next[k] = rec[k];
    }
  }
  for (const k of Object.keys(rec)) delete rec[k];
  for (const k of Object.keys(next)) rec[k] = next[k];
  return true;
}
function applyOp(op) {
  switch (op.type) {
    case "chip/add": {
      const hit = findBox(op.boxId);
      if (!hit) return NOOP;
      const i = op.index ?? hit.box.chips.length;
      hit.box.chips.splice(i, 0, op.chip);
      cur.focusedBox = op.boxId;
      return ws();
    }
    case "chip/addFromPreset": {
      const hit = findBox(op.boxId);
      if (!hit) return NOOP;
      const chip = mkChip(op.text, op.cnText, 1, op.categoryColor);
      const i = op.index ?? hit.box.chips.length;
      hit.box.chips.splice(i, 0, chip);
      cur.focusedBox = op.boxId;
      return ws();
    }
    case "chip/addText": {
      const hit = findBox(op.boxId);
      if (!hit || !op.text.trim()) return NOOP;
      const tokens = parseWeightedPrompt(op.text);
      if (!tokens.length) return NOOP;
      const idx = getPresetIndex();
      for (const { text: t, weight } of tokens) {
        const preset = idx.find((p) => p.text === t || p.cnText === t);
        hit.box.chips.push(
          preset ? mkChip(preset.text, preset.cnText, weight, preset.categoryColor) : mkChip(t, "", weight)
        );
      }
      cur.focusedBox = op.boxId;
      return ws();
    }
    case "chip/remove": {
      const hit = findBox(op.boxId);
      if (!hit) return NOOP;
      const i = hit.box.chips.findIndex((c) => c.id === op.chipId);
      if (i < 0) return NOOP;
      hit.box.chips.splice(i, 1);
      pruneSelection();
      return ws();
    }
    case "chip/reorder": {
      const hit = findBox(op.boxId);
      if (!hit) return NOOP;
      if (!reorder(hit.box.chips, op.fromIndex, op.toIndex)) return NOOP;
      return { ...ws(["output"]), scopes: ["output"] };
    }
    case "chip/move": {
      const from = findBox(op.fromBoxId);
      const to = findBox(op.toBoxId);
      if (!from || !to) return NOOP;
      const i = from.box.chips.findIndex((c) => c.id === op.chipId);
      if (i < 0) return NOOP;
      if (op.fromBoxId === op.toBoxId) {
        if (!reorder(from.box.chips, i, op.toIndex)) return NOOP;
        return { ...ws(["output"]), scopes: ["output"] };
      }
      const [chip] = from.box.chips.splice(i, 1);
      to.box.chips.splice(Math.min(op.toIndex, to.box.chips.length), 0, chip);
      cur.focusedBox = op.toBoxId;
      return ws();
    }
    case "chip/update": {
      const hit = findChip(op.chipId);
      if (!hit) return NOOP;
      Object.assign(hit.chip, op.patch);
      const undoable = !("translating" in op.patch && Object.keys(op.patch).length === 1);
      return { ...ws(), undoable };
    }
    case "chip/batchRemove": {
      if (!op.chipIds.length) return NOOP;
      const idSet = new Set(op.chipIds);
      let removed = 0;
      for (const g of allGroups()) {
        for (const b of g.inputboxes) {
          const next = b.chips.filter((c) => {
            if (idSet.has(c.id)) {
              removed++;
              return false;
            }
            return true;
          });
          b.chips = next;
        }
      }
      if (!removed) return NOOP;
      pruneSelection();
      return ws();
    }
    case "chip/batchUpdate": {
      if (!op.chipIds.length) return NOOP;
      let n = 0;
      for (const id of op.chipIds) {
        const hit = findChip(id);
        if (!hit) continue;
        Object.assign(hit.chip, op.patch);
        n++;
      }
      if (!n) return NOOP;
      return ws();
    }
    case "chip/batchAdjustWeight": {
      if (!op.chipIds.length || !op.delta) return NOOP;
      let n = 0;
      for (const id of op.chipIds) {
        const hit = findChip(id);
        if (!hit) continue;
        const w = Math.round((hit.chip.weight + op.delta) * 10) / 10;
        hit.chip.weight = Math.max(0.1, Math.min(5, w));
        n++;
      }
      if (!n) return NOOP;
      return ws();
    }
    case "chip/batchMove": {
      if (!op.chipIds.length) return NOOP;
      const to = findBox(op.toBoxId);
      if (!to) return NOOP;
      const idSet = new Set(op.chipIds);
      const order = op.chipIds;
      const picked = [];
      const byId = /* @__PURE__ */ new Map();
      for (const g of allGroups()) {
        for (const b of g.inputboxes) {
          const remain = [];
          for (const c of b.chips) {
            if (idSet.has(c.id)) byId.set(c.id, c);
            else remain.push(c);
          }
          b.chips = remain;
        }
      }
      for (const id of order) {
        const c = byId.get(id);
        if (c) picked.push(c);
      }
      if (!picked.length) return NOOP;
      let idx = Math.max(0, Math.min(op.toIndex, to.box.chips.length));
      to.box.chips.splice(idx, 0, ...picked);
      cur.focusedBox = op.toBoxId;
      return ws();
    }
    case "box/add": {
      const g = findGroup(op.groupId);
      if (!g || g.id === "__neg__") return NOOP;
      const b = mkBox();
      g.inputboxes.push(b);
      cur.focusedBox = b.id;
      return ws();
    }
    case "box/remove": {
      const g = findGroup(op.groupId);
      if (!g || g.inputboxes.length <= 1) return NOOP;
      const i = g.inputboxes.findIndex((b) => b.id === op.boxId);
      if (i < 0) return NOOP;
      g.inputboxes.splice(i, 1);
      cur.focusedBox = g.inputboxes[0]?.id || "";
      pruneSelection();
      return ws();
    }
    case "box/reorder": {
      const g = findGroup(op.groupId);
      if (!g) return NOOP;
      if (!reorder(g.inputboxes, op.fromIndex, op.toIndex)) return NOOP;
      return { ...ws(["output"]), scopes: ["output"] };
    }
    case "box/toggle": {
      const hit = findBox(op.boxId);
      if (!hit) return NOOP;
      hit.box[op.field] = !hit.box[op.field];
      return ws();
    }
    case "group/add": {
      const g = mkGroup(op.name || "\u65B0\u5206\u7EC4", void 0, state.settings.theme);
      cur.workspace.push(g);
      cur.focusedBox = g.inputboxes[0].id;
      return ws();
    }
    case "group/remove": {
      if (cur.workspace.length <= 1) return NOOP;
      const i = cur.workspace.findIndex((g) => g.id === op.groupId);
      if (i < 0) return NOOP;
      cur.workspace.splice(i, 1);
      pruneSelection();
      cur.focusedBox = cur.workspace[0]?.inputboxes[0]?.id || "";
      return ws();
    }
    case "group/reorder": {
      if (!reorder(cur.workspace, op.fromIndex, op.toIndex)) return NOOP;
      return { ...ws(["output"]), scopes: ["output"] };
    }
    case "group/patch": {
      const g = findGroup(op.groupId);
      if (!g) return NOOP;
      Object.assign(g, op.patch);
      return ws();
    }
    case "focus/box": {
      if (cur.focusedBox === op.boxId) return NOOP;
      cur.focusedBox = op.boxId;
      return { changed: true, undoable: false, persistNode: false, persistPresets: false, persistSettings: false, scopes: [] };
    }
    case "workspace/clear": {
      cur.workspace = [mkGroup("\u4EBA\u7269", void 0, state.settings.theme)];
      cur.negativeGroup = mkNegativeGroup();
      cur.focusedBox = cur.workspace[0].inputboxes[0].id;
      pruneSelection();
      return ws();
    }
    case "workspace/replace": {
      cur.workspace = op.workspace.length ? op.workspace : [mkGroup("\u4EBA\u7269", void 0, state.settings.theme)];
      cur.negativeGroup = op.negativeGroup || mkNegativeGroup();
      cur.focusedBox = op.focusedBox || cur.workspace[0]?.inputboxes[0]?.id || "";
      pruneSelection();
      return ws();
    }
    case "preset/tryAddFromChip": {
      const items = getCurrentPresetItems();
      if (!items) return NOOP;
      if (items.some((i) => i.text === op.text)) return NOOP;
      items.push({ text: op.text, cnText: op.cnText });
      markPresetIndexDirty();
      return pr();
    }
    case "preset/tryAddManyFromChips": {
      const items = getCurrentPresetItems();
      if (!items || !op.items.length) return NOOP;
      const seen = new Set(items.map((i) => i.text));
      let added = 0;
      for (const it of op.items) {
        const t = (it.text || "").trim();
        if (!t || seen.has(t)) continue;
        seen.add(t);
        items.push({ text: t, cnText: it.cnText || "" });
        added++;
      }
      if (!added) return NOOP;
      markPresetIndexDirty();
      return pr();
    }
    case "preset/removeItem": {
      const items = resolvePresetItems(op.l1, op.l2);
      if (!items) return NOOP;
      const i = items.findIndex((x) => x.text === op.text);
      if (i < 0) return NOOP;
      items.splice(i, 1);
      markPresetIndexDirty();
      return pr();
    }
    case "preset/updateItem": {
      const items = resolvePresetItems(op.l1, op.l2);
      if (!items) return NOOP;
      const i = items.findIndex((x) => x.text === op.oldText);
      if (i < 0) return NOOP;
      const nextText = op.text.trim();
      if (!nextText) return NOOP;
      if (nextText !== op.oldText && items.some((x, idx) => idx !== i && x.text === nextText)) {
        return NOOP;
      }
      items[i] = { text: nextText, cnText: op.cnText };
      markPresetIndexDirty();
      return pr();
    }
    case "preset/reorderItems": {
      const items = getCurrentPresetItems();
      if (!items) return NOOP;
      if (!reorder(items, op.fromIndex, op.toIndex)) return NOOP;
      markPresetIndexDirty();
      return { ...pr(), scopes: [] };
    }
    case "preset/reorderL1": {
      if (!reorderRecordKeys(state.presets.children, op.fromIndex, op.toIndex)) return NOOP;
      return { ...pr(), scopes: [] };
    }
    case "preset/reorderL2": {
      const l1 = state.presets.children[state.l1Cat];
      if (!l1) return NOOP;
      if (!reorderRecordKeys(l1.children, op.fromIndex, op.toIndex)) return NOOP;
      return { ...pr(), scopes: [] };
    }
    case "preset/moveL2": {
      if (!op.l2Name || op.fromL1 === op.toL1) return NOOP;
      const fromL1 = state.presets.children[op.fromL1];
      const toL1 = state.presets.children[op.toL1];
      if (!fromL1 || !toL1) return NOOP;
      const cat = fromL1.children[op.l2Name];
      if (!cat) return NOOP;
      if (toL1.children[op.l2Name]) return NOOP;
      delete fromL1.children[op.l2Name];
      const keys = Object.keys(toL1.children);
      const idx = op.toIndex == null ? keys.length : Math.max(0, Math.min(Math.floor(op.toIndex), keys.length));
      keys.splice(idx, 0, op.l2Name);
      const next = {};
      for (const k of keys) {
        next[k] = k === op.l2Name ? cat : toL1.children[k];
      }
      for (const k of Object.keys(toL1.children)) delete toL1.children[k];
      for (const k of keys) toL1.children[k] = next[k];
      state.l1Cat = op.toL1;
      state.l2Cat = op.l2Name;
      markPresetIndexDirty();
      return pr(["presets"]);
    }
    case "preset/setCats": {
      if (op.l1 !== void 0) state.l1Cat = op.l1;
      if (op.l2 !== void 0) state.l2Cat = op.l2;
      normalizeCategories();
      return {
        changed: true,
        undoable: false,
        persistNode: false,
        persistPresets: true,
        persistSettings: false,
        scopes: ["presets"]
      };
    }
    case "preset/addL1": {
      if (!op.name || state.presets.children[op.name]) return NOOP;
      state.presets.children[op.name] = { items: [], children: {} };
      state.l1Cat = op.name;
      state.l2Cat = "";
      markPresetIndexDirty();
      return pr();
    }
    case "preset/addL2": {
      const l1 = state.presets.children[state.l1Cat];
      if (!l1 || !op.name || l1.children[op.name]) return NOOP;
      l1.children[op.name] = { name: op.name, items: [], color: op.color };
      state.l2Cat = op.name;
      markPresetIndexDirty();
      return pr();
    }
    case "preset/renameL1": {
      if (!op.newName || op.newName === op.oldName || state.presets.children[op.newName]) return NOOP;
      if (!renameRecordKey(state.presets.children, op.oldName, op.newName)) return NOOP;
      if (state.l1Cat === op.oldName) state.l1Cat = op.newName;
      return pr();
    }
    case "preset/renameL2": {
      const l1 = state.presets.children[state.l1Cat];
      if (!l1 || !op.newName || l1.children[op.newName]) return NOOP;
      if (!renameRecordKey(l1.children, op.oldName, op.newName, (cat) => {
        cat.name = op.newName;
        return cat;
      })) return NOOP;
      if (state.l2Cat === op.oldName) state.l2Cat = op.newName;
      return pr();
    }
    case "preset/setL2Color": {
      const l1 = state.presets.children[state.l1Cat];
      const l2 = l1?.children[op.name];
      if (!l2 || !op.color || l2.color === op.color) return NOOP;
      l2.color = op.color;
      markPresetIndexDirty();
      return pr();
    }
    case "preset/deleteL1": {
      delete state.presets.children[op.name];
      normalizeCategories();
      markPresetIndexDirty();
      return pr();
    }
    case "preset/deleteL2": {
      const l1 = state.presets.children[state.l1Cat];
      if (!l1) return NOOP;
      delete l1.children[op.name];
      normalizeCategories();
      markPresetIndexDirty();
      return pr();
    }
    case "preset/replace": {
      state.presets = op.presets;
      if (op.l1Cat) state.l1Cat = op.l1Cat;
      if (op.l2Cat) state.l2Cat = op.l2Cat;
      normalizeCategories();
      markPresetIndexDirty();
      return pr();
    }
    case "settings/patch": {
      Object.assign(state.settings, op.patch);
      return {
        changed: true,
        undoable: false,
        persistNode: false,
        persistPresets: false,
        persistSettings: true,
        scopes: ["settings", "workspace"]
      };
    }
    case "settings/customApi": {
      Object.assign(state.settings.customApi, op.patch);
      return {
        changed: true,
        undoable: false,
        persistNode: false,
        persistPresets: false,
        persistSettings: true,
        scopes: ["settings"]
      };
    }
    default:
      return NOOP;
  }
}
function resolvePresetItems(l1Name, l2Name) {
  const l1n = l1Name || state.l1Cat;
  const l2n = l2Name || state.l2Cat;
  const l1 = state.presets.children[l1n];
  if (!l1) return null;
  const l2 = l1.children[l2n];
  return l2?.items ?? null;
}

// src/app/dragGate.ts
var _dragging = false;
var _queued = false;
var _listeners = /* @__PURE__ */ new Set();
function isDragging() {
  return _dragging;
}
function beginDrag() {
  _dragging = true;
  window.__pb_dragging = true;
}
var _ending = false;
function endDrag() {
  if (_ending) return;
  _ending = true;
  try {
    _dragging = false;
    window.__pb_dragging = false;
    if (_queued) {
      _queued = false;
      for (const fn of _listeners) fn();
    }
  } finally {
    _ending = false;
  }
}
function onDragIdleFlush(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
function queueRenderAfterDrag() {
  _queued = true;
  if (!_dragging) {
    for (const fn of _listeners) fn();
    _queued = false;
  }
}

// src/app/undo.ts
init_types();
init_state();
var undoStack = [];
var redoStack = [];
var onRestore = null;
function setUndoRestoreHandler(fn) {
  onRestore = fn;
}
function clearUndo() {
  undoStack = [];
  redoStack = [];
}
function recordUndoSnapshot(snapshot) {
  undoStack.push(snapshot);
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  redoStack = [];
}
function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(cloneUndoSnapshot());
  restoreUndoSnapshot(undoStack.pop());
  onRestore?.();
}
function redo() {
  if (redoStack.length === 0) return;
  const next = redoStack.pop();
  undoStack.push(cloneUndoSnapshot());
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  restoreUndoSnapshot(next);
  onRestore?.();
}
function canUndo() {
  return undoStack.length > 0;
}
function canRedo() {
  return redoStack.length > 0;
}
function getUndoDepth() {
  return undoStack.length;
}
function getRedoDepth() {
  return redoStack.length;
}

// src/app/dispatch.ts
init_state();
var _render = null;
var _pendingScopes = /* @__PURE__ */ new Set();
var _persistNodeTimer = null;
var _gateHooked = false;
function setRenderer(fn) {
  _render = fn;
  if (!_gateHooked) {
    _gateHooked = true;
    onDragIdleFlush(() => flushPendingRender());
  }
}
function flushRender() {
  if (!_render || _pendingScopes.size === 0) return;
  const scopes = _pendingScopes;
  _pendingScopes = /* @__PURE__ */ new Set();
  _render(scopes);
}
function flushPendingRender() {
  _pendingScopes.add("workspace");
  _pendingScopes.add("presets");
  _pendingScopes.add("output");
  flushRender();
}
function schedulePersistNode() {
  if (_persistNodeTimer) clearTimeout(_persistNodeTimer);
  _persistNodeTimer = setTimeout(() => saveNodeState(), 200);
}
function dispatch(op, options) {
  const captureUndo = !options?.noUndo;
  const before = captureUndo ? cloneUndoSnapshot() : null;
  const result = applyOp(op);
  if (!result.changed) return false;
  if (result.undoable && before) {
    recordUndoSnapshot(before);
  }
  if (result.persistNode) schedulePersistNode();
  if (result.persistPresets) savePresetsToLS();
  if (result.persistSettings) saveSettingsToLS();
  if (result.scopes.length) {
    for (const s of result.scopes) _pendingScopes.add(s);
    if (isDragging()) {
      queueRenderAfterDrag();
    } else {
      queueMicrotask(() => {
        if (!isDragging()) flushRender();
        else queueRenderAfterDrag();
      });
    }
  }
  return true;
}
function refreshAll() {
  _pendingScopes = /* @__PURE__ */ new Set(["all"]);
  flushRender();
  saveNodeState();
  savePresetsToLS();
}

// src/ui/panel.ts
init_pipe();

// node_modules/open-props/open-props.min.css
var open_props_min_default = `:where(html){--font-system-ui:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;--font-transitional:Charter,Bitstream Charter,Sitka Text,Cambria,serif;--font-old-style:Iowan Old Style,Palatino Linotype,URW Palladio L,P052,serif;--font-humanist:Seravek,Gill Sans Nova,Ubuntu,Calibri,DejaVu Sans,source-sans-pro,sans-serif;--font-geometric-humanist:Avenir,Montserrat,Corbel,URW Gothic,source-sans-pro,sans-serif;--font-classical-humanist:Optima,Candara,Noto Sans,source-sans-pro,sans-serif;--font-neo-grotesque:Inter,Roboto,Helvetica Neue,Arial Nova,Nimbus Sans,Arial,sans-serif;--font-monospace-slab-serif:Nimbus Mono PS,Courier New,monospace;--font-monospace-code:Dank Mono,Operator Mono,Inconsolata,Fira Mono,ui-monospace,SF Mono,Monaco,Droid Sans Mono,Source Code Pro,Cascadia Code,Menlo,Consolas,DejaVu Sans Mono,monospace;--font-industrial:Bahnschrift,DIN Alternate,Franklin Gothic Medium,Nimbus Sans Narrow,sans-serif-condensed,sans-serif;--font-rounded-sans:ui-rounded,Hiragino Maru Gothic ProN,Quicksand,Comfortaa,Manjari,Arial Rounded MT,Arial Rounded MT Bold,Calibri,source-sans-pro,sans-serif;--font-slab-serif:Rockwell,Rockwell Nova,Roboto Slab,DejaVu Serif,Sitka Small,serif;--font-antique:Superclarendon,Bookman Old Style,URW Bookman,URW Bookman L,Georgia Pro,Georgia,serif;--font-didone:Didot,Bodoni MT,Noto Serif Display,URW Palladio L,P052,Sylfaen,serif;--font-handwritten:Segoe Print,Bradley Hand,Chilanka,TSCu_Comic,casual,cursive;--font-sans:var(--font-system-ui);--font-serif:ui-serif,serif;--font-mono:var(--font-monospace-code);--font-weight-1:100;--font-weight-2:200;--font-weight-3:300;--font-weight-4:400;--font-weight-5:500;--font-weight-6:600;--font-weight-7:700;--font-weight-8:800;--font-weight-9:900;--font-lineheight-00:.95;--font-lineheight-0:1.1;--font-lineheight-1:1.25;--font-lineheight-2:1.375;--font-lineheight-3:1.5;--font-lineheight-4:1.75;--font-lineheight-5:2;--font-letterspacing-0:-.05em;--font-letterspacing-1:.025em;--font-letterspacing-2:.050em;--font-letterspacing-3:.075em;--font-letterspacing-4:.150em;--font-letterspacing-5:.500em;--font-letterspacing-6:.750em;--font-letterspacing-7:1em;--font-size-00:.5rem;--font-size-0:.75rem;--font-size-1:1rem;--font-size-2:1.1rem;--font-size-3:1.25rem;--font-size-4:1.5rem;--font-size-5:2rem;--font-size-6:2.5rem;--font-size-7:3rem;--font-size-8:3.5rem;--font-size-fluid-0:max(.75rem,min(2vw,1rem));--font-size-fluid-1:max(1rem,min(4vw,1.5rem));--font-size-fluid-2:max(1.5rem,min(6vw,2.5rem));--font-size-fluid-3:max(2rem,min(9vw,3.5rem));--size-000:-.5rem;--size-00:-.25rem;--size-1:.25rem;--size-2:.5rem;--size-3:1rem;--size-4:1.25rem;--size-5:1.5rem;--size-6:1.75rem;--size-7:2rem;--size-8:3rem;--size-9:4rem;--size-10:5rem;--size-11:7.5rem;--size-12:10rem;--size-13:15rem;--size-14:20rem;--size-15:30rem;--size-px-000:-8px;--size-px-00:-4px;--size-px-1:4px;--size-px-2:8px;--size-px-3:16px;--size-px-4:20px;--size-px-5:24px;--size-px-6:28px;--size-px-7:32px;--size-px-8:48px;--size-px-9:64px;--size-px-10:80px;--size-px-11:120px;--size-px-12:160px;--size-px-13:240px;--size-px-14:320px;--size-px-15:480px;--size-fluid-1:max(.5rem,min(1vw,1rem));--size-fluid-2:max(1rem,min(2vw,1.5rem));--size-fluid-3:max(1.5rem,min(3vw,2rem));--size-fluid-4:max(2rem,min(4vw,3rem));--size-fluid-5:max(4rem,min(5vw,5rem));--size-fluid-6:max(5rem,min(7vw,7.5rem));--size-fluid-7:max(7.5rem,min(10vw,10rem));--size-fluid-8:max(10rem,min(20vw,15rem));--size-fluid-9:max(15rem,min(30vw,20rem));--size-fluid-10:max(20rem,min(40vw,30rem));--size-content-1:20ch;--size-content-2:45ch;--size-content-3:60ch;--size-header-1:20ch;--size-header-2:25ch;--size-header-3:35ch;--size-xxs:240px;--size-xs:360px;--size-sm:480px;--size-md:768px;--size-lg:1024px;--size-xl:1440px;--size-xxl:1920px;--size-relative-000:-.5ch;--size-relative-00:-.25ch;--size-relative-1:.25ch;--size-relative-2:.5ch;--size-relative-3:1ch;--size-relative-4:1.25ch;--size-relative-5:1.5ch;--size-relative-6:1.75ch;--size-relative-7:2ch;--size-relative-8:3ch;--size-relative-9:4ch;--size-relative-10:5ch;--size-relative-11:7.5ch;--size-relative-12:10ch;--size-relative-13:15ch;--size-relative-14:20ch;--size-relative-15:30ch;--ease-1:cubic-bezier(.25,0,.5,1);--ease-2:cubic-bezier(.25,0,.4,1);--ease-3:cubic-bezier(.25,0,.3,1);--ease-4:cubic-bezier(.25,0,.2,1);--ease-5:cubic-bezier(.25,0,.1,1);--ease-in-1:cubic-bezier(.25,0,1,1);--ease-in-2:cubic-bezier(.50,0,1,1);--ease-in-3:cubic-bezier(.70,0,1,1);--ease-in-4:cubic-bezier(.90,0,1,1);--ease-in-5:cubic-bezier(1,0,1,1);--ease-out-1:cubic-bezier(0,0,.75,1);--ease-out-2:cubic-bezier(0,0,.50,1);--ease-out-3:cubic-bezier(0,0,.3,1);--ease-out-4:cubic-bezier(0,0,.1,1);--ease-out-5:cubic-bezier(0,0,0,1);--ease-in-out-1:cubic-bezier(.1,0,.9,1);--ease-in-out-2:cubic-bezier(.3,0,.7,1);--ease-in-out-3:cubic-bezier(.5,0,.5,1);--ease-in-out-4:cubic-bezier(.7,0,.3,1);--ease-in-out-5:cubic-bezier(.9,0,.1,1);--ease-elastic-out-1:cubic-bezier(.5,.75,.75,1.25);--ease-elastic-out-2:cubic-bezier(.5,1,.75,1.25);--ease-elastic-out-3:cubic-bezier(.5,1.25,.75,1.25);--ease-elastic-out-4:cubic-bezier(.5,1.5,.75,1.25);--ease-elastic-out-5:cubic-bezier(.5,1.75,.75,1.25);--ease-elastic-in-1:cubic-bezier(.5,-0.25,.75,1);--ease-elastic-in-2:cubic-bezier(.5,-0.50,.75,1);--ease-elastic-in-3:cubic-bezier(.5,-0.75,.75,1);--ease-elastic-in-4:cubic-bezier(.5,-1.00,.75,1);--ease-elastic-in-5:cubic-bezier(.5,-1.25,.75,1);--ease-elastic-in-out-1:cubic-bezier(.5,-.1,.1,1.5);--ease-elastic-in-out-2:cubic-bezier(.5,-.3,.1,1.5);--ease-elastic-in-out-3:cubic-bezier(.5,-.5,.1,1.5);--ease-elastic-in-out-4:cubic-bezier(.5,-.7,.1,1.5);--ease-elastic-in-out-5:cubic-bezier(.5,-.9,.1,1.5);--ease-step-1:steps(2);--ease-step-2:steps(3);--ease-step-3:steps(4);--ease-step-4:steps(7);--ease-step-5:steps(10);--ease-elastic-1:var(--ease-elastic-out-1);--ease-elastic-2:var(--ease-elastic-out-2);--ease-elastic-3:var(--ease-elastic-out-3);--ease-elastic-4:var(--ease-elastic-out-4);--ease-elastic-5:var(--ease-elastic-out-5);--ease-squish-1:var(--ease-elastic-in-out-1);--ease-squish-2:var(--ease-elastic-in-out-2);--ease-squish-3:var(--ease-elastic-in-out-3);--ease-squish-4:var(--ease-elastic-in-out-4);--ease-squish-5:var(--ease-elastic-in-out-5);--ease-spring-1:linear(0,0.006,0.025 2.8%,0.101 6.1%,0.539 18.9%,0.721 25.3%,0.849 31.5%,0.937 38.1%,0.968 41.8%,0.991 45.7%,1.006 50.1%,1.015 55%,1.017 63.9%,1.001);--ease-spring-2:linear(0,0.007,0.029 2.2%,0.118 4.7%,0.625 14.4%,0.826 19%,0.902,0.962,1.008 26.1%,1.041 28.7%,1.064 32.1%,1.07 36%,1.061 40.5%,1.015 53.4%,0.999 61.6%,0.995 71.2%,1);--ease-spring-3:linear(0,0.009,0.035 2.1%,0.141 4.4%,0.723 12.9%,0.938 16.7%,1.017,1.077,1.121,1.149 24.3%,1.159,1.163,1.161,1.154 29.9%,1.129 32.8%,1.051 39.6%,1.017 43.1%,0.991,0.977 51%,0.974 53.8%,0.975 57.1%,0.997 69.8%,1.003 76.9%,1);--ease-spring-4:linear(0,0.009,0.037 1.7%,0.153 3.6%,0.776 10.3%,1.001,1.142 16%,1.185,1.209 19%,1.215 19.9% 20.8%,1.199,1.165 25%,1.056 30.3%,1.008 33%,0.973,0.955 39.2%,0.953 41.1%,0.957 43.3%,0.998 53.3%,1.009 59.1% 63.7%,0.998 78.9%,1);--ease-spring-5:linear(0,0.01,0.04 1.6%,0.161 3.3%,0.816 9.4%,1.046,1.189 14.4%,1.231,1.254 17%,1.259,1.257 18.6%,1.236,1.194 22.3%,1.057 27%,0.999 29.4%,0.955 32.1%,0.942,0.935 34.9%,0.933,0.939 38.4%,1 47.3%,1.011,1.017 52.6%,1.016 56.4%,1 65.2%,0.996 70.2%,1.001 87.2%,1);--ease-bounce-1:linear(0,0.004,0.016,0.035,0.063,0.098,0.141,0.191,0.25,0.316,0.391 36.8%,0.563,0.766,1 58.8%,0.946,0.908 69.1%,0.895,0.885,0.879,0.878,0.879,0.885,0.895,0.908 89.7%,0.946,1);--ease-bounce-2:linear(0,0.004,0.016,0.035,0.063,0.098,0.141 15.1%,0.25,0.391,0.562,0.765,1,0.892 45.2%,0.849,0.815,0.788,0.769,0.757,0.753,0.757,0.769,0.788,0.815,0.85,0.892 75.2%,1 80.2%,0.973,0.954,0.943,0.939,0.943,0.954,0.973,1);--ease-bounce-3:linear(0,0.004,0.016,0.035,0.062,0.098,0.141 11.4%,0.25,0.39,0.562,0.764,1 30.3%,0.847 34.8%,0.787,0.737,0.699,0.672,0.655,0.65,0.656,0.672,0.699,0.738,0.787,0.847 61.7%,1 66.2%,0.946,0.908,0.885 74.2%,0.879,0.878,0.879,0.885 79.5%,0.908,0.946,1 87.4%,0.981,0.968,0.96,0.957,0.96,0.968,0.981,1);--ease-bounce-4:linear(0,0.004,0.016 3%,0.062,0.141,0.25,0.391,0.562 18.2%,1 24.3%,0.81,0.676 32.3%,0.629,0.595,0.575,0.568,0.575,0.595,0.629,0.676 48.2%,0.811,1 56.2%,0.918,0.86,0.825,0.814,0.825,0.86,0.918,1 77.2%,0.94 80.6%,0.925,0.92,0.925,0.94 87.5%,1 90.9%,0.974,0.965,0.974,1);--ease-bounce-5:linear(0,0.004,0.016 2.5%,0.063,0.141,0.25 10.1%,0.562,1 20.2%,0.783,0.627,0.534 30.9%,0.511,0.503,0.511,0.534 38%,0.627,0.782,1 48.7%,0.892,0.815,0.769 56.3%,0.757,0.753,0.757,0.769 61.3%,0.815,0.892,1 68.8%,0.908 72.4%,0.885,0.878,0.885,0.908 79.4%,1 83%,0.954 85.5%,0.943,0.939,0.943,0.954 90.5%,1 93%,0.977,0.97,0.977,1);--ease-circ-in:cubic-bezier(.6,.04,.98,.335);--ease-circ-in-out:cubic-bezier(.785,.135,.15,.86);--ease-circ-out:cubic-bezier(.075,.82,.165,1);--ease-cubic-in:cubic-bezier(.55,.055,.675,.19);--ease-cubic-in-out:cubic-bezier(.645,.045,.355,1);--ease-cubic-out:cubic-bezier(.215,.61,.355,1);--ease-expo-in:cubic-bezier(.95,.05,.795,.035);--ease-expo-in-out:cubic-bezier(1,0,0,1);--ease-expo-out:cubic-bezier(.19,1,.22,1);--ease-quad-in:cubic-bezier(.55,.085,.68,.53);--ease-quad-in-out:cubic-bezier(.455,.03,.515,.955);--ease-quad-out:cubic-bezier(.25,.46,.45,.94);--ease-quart-in:cubic-bezier(.895,.03,.685,.22);--ease-quart-in-out:cubic-bezier(.77,0,.175,1);--ease-quart-out:cubic-bezier(.165,.84,.44,1);--ease-quint-in:cubic-bezier(.755,.05,.855,.06);--ease-quint-in-out:cubic-bezier(.86,0,.07,1);--ease-quint-out:cubic-bezier(.23,1,.32,1);--ease-sine-in:cubic-bezier(.47,0,.745,.715);--ease-sine-in-out:cubic-bezier(.445,.05,.55,.95);--ease-sine-out:cubic-bezier(.39,.575,.565,1);--layer-1:1;--layer-2:2;--layer-3:3;--layer-4:4;--layer-5:5;--layer-important:2147483647;--shadow-color:220 3% 15%;--shadow-strength:1%;--shadow-strength-3:calc(var(--shadow-strength) + 2%);--shadow-strength-4:calc(var(--shadow-strength) + 3%);--shadow-strength-5:calc(var(--shadow-strength) + 4%);--shadow-strength-6:calc(var(--shadow-strength) + 5%);--shadow-strength-7:calc(var(--shadow-strength) + 6%);--shadow-strength-8:calc(var(--shadow-strength) + 7%);--shadow-strength-10:calc(var(--shadow-strength) + 9%);--inner-shadow-highlight:inset 0 -.5px 0 0 #fff,inset 0 .5px 0 0 rgba(0,0,0,.067);--shadow-1:0 1px 2px -1px hsl(var(--shadow-color)/var(--shadow-strength-10));--shadow-2:0 3px 5px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 7px 14px -5px hsl(var(--shadow-color)/var(--shadow-strength-6));--shadow-3:0 -1px 3px 0 hsl(var(--shadow-color)/var(--shadow-strength-3)),0 1px 2px -5px hsl(var(--shadow-color)/var(--shadow-strength-3)),0 2px 5px -5px hsl(var(--shadow-color)/var(--shadow-strength-5)),0 4px 12px -5px hsl(var(--shadow-color)/var(--shadow-strength-6)),0 12px 15px -5px hsl(var(--shadow-color)/var(--shadow-strength-8));--shadow-4:0 -2px 5px 0 hsl(var(--shadow-color)/var(--shadow-strength-3)),0 1px 1px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 2px 2px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 5px 5px -2px hsl(var(--shadow-color)/var(--shadow-strength-5)),0 9px 9px -2px hsl(var(--shadow-color)/var(--shadow-strength-6)),0 16px 16px -2px hsl(var(--shadow-color)/var(--shadow-strength-7));--shadow-5:0 -1px 2px 0 hsl(var(--shadow-color)/var(--shadow-strength-3)),0 2px 1px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 5px 5px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 10px 10px -2px hsl(var(--shadow-color)/var(--shadow-strength-5)),0 20px 20px -2px hsl(var(--shadow-color)/var(--shadow-strength-6)),0 40px 40px -2px hsl(var(--shadow-color)/var(--shadow-strength-8));--shadow-6:0 -1px 2px 0 hsl(var(--shadow-color)/var(--shadow-strength-3)),0 3px 2px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 7px 5px -2px hsl(var(--shadow-color)/var(--shadow-strength-4)),0 12px 10px -2px hsl(var(--shadow-color)/var(--shadow-strength-5)),0 22px 18px -2px hsl(var(--shadow-color)/var(--shadow-strength-6)),0 41px 33px -2px hsl(var(--shadow-color)/var(--shadow-strength-7)),0 100px 80px -2px hsl(var(--shadow-color)/var(--shadow-strength-8));--inner-shadow-0:inset 0 0 0 1px hsl(var(--shadow-color)/var(--shadow-strength-10));--inner-shadow-1:inset 0 1px 2px 0 hsl(var(--shadow-color)/var(--shadow-strength-10)),var(--inner-shadow-highlight);--inner-shadow-2:inset 0 1px 4px 0 hsl(var(--shadow-color)/var(--shadow-strength-10)),var(--inner-shadow-highlight);--inner-shadow-3:inset 0 2px 8px 0 hsl(var(--shadow-color)/var(--shadow-strength-10)),var(--inner-shadow-highlight);--inner-shadow-4:inset 0 2px 14px 0 hsl(var(--shadow-color)/var(--shadow-strength-10)),var(--inner-shadow-highlight);--ratio-square:1;--ratio-landscape:4/3;--ratio-portrait:3/4;--ratio-widescreen:16/9;--ratio-ultrawide:18/5;--ratio-golden:1.6180/1;--gray-0:#f8f9fa;--gray-1:#f1f3f5;--gray-2:#e9ecef;--gray-3:#dee2e6;--gray-4:#ced4da;--gray-5:#adb5bd;--gray-6:#868e96;--gray-7:#495057;--gray-8:#343a40;--gray-9:#212529;--gray-10:#16191d;--gray-11:#0d0f12;--gray-12:#030507;--stone-0:#f8fafb;--stone-1:#f2f4f6;--stone-2:#ebedef;--stone-3:#e0e4e5;--stone-4:#d1d6d8;--stone-5:#b1b6b9;--stone-6:#979b9d;--stone-7:#7e8282;--stone-8:#666968;--stone-9:#50514f;--stone-10:#3a3a37;--stone-11:#252521;--stone-12:#121210;--red-0:#fff5f5;--red-1:#ffe3e3;--red-2:#ffc9c9;--red-3:#ffa8a8;--red-4:#ff8787;--red-5:#ff6b6b;--red-6:#fa5252;--red-7:#f03e3e;--red-8:#e03131;--red-9:#c92a2a;--red-10:#b02525;--red-11:#962020;--red-12:#7d1a1a;--pink-0:#fff0f6;--pink-1:#ffdeeb;--pink-2:#fcc2d7;--pink-3:#faa2c1;--pink-4:#f783ac;--pink-5:#f06595;--pink-6:#e64980;--pink-7:#d6336c;--pink-8:#c2255c;--pink-9:#a61e4d;--pink-10:#8c1941;--pink-11:#731536;--pink-12:#59102a;--purple-0:#f8f0fc;--purple-1:#f3d9fa;--purple-2:#eebefa;--purple-3:#e599f7;--purple-4:#da77f2;--purple-5:#cc5de8;--purple-6:#be4bdb;--purple-7:#ae3ec9;--purple-8:#9c36b5;--purple-9:#862e9c;--purple-10:#702682;--purple-11:#5a1e69;--purple-12:#44174f;--violet-0:#f3f0ff;--violet-1:#e5dbff;--violet-2:#d0bfff;--violet-3:#b197fc;--violet-4:#9775fa;--violet-5:#845ef7;--violet-6:#7950f2;--violet-7:#7048e8;--violet-8:#6741d9;--violet-9:#5f3dc4;--violet-10:#5235ab;--violet-11:#462d91;--violet-12:#3a2578;--indigo-0:#edf2ff;--indigo-1:#dbe4ff;--indigo-2:#bac8ff;--indigo-3:#91a7ff;--indigo-4:#748ffc;--indigo-5:#5c7cfa;--indigo-6:#4c6ef5;--indigo-7:#4263eb;--indigo-8:#3b5bdb;--indigo-9:#364fc7;--indigo-10:#2f44ad;--indigo-11:#283a94;--indigo-12:#21307a;--blue-0:#e7f5ff;--blue-1:#d0ebff;--blue-2:#a5d8ff;--blue-3:#74c0fc;--blue-4:#4dabf7;--blue-5:#339af0;--blue-6:#228be6;--blue-7:#1c7ed6;--blue-8:#1971c2;--blue-9:#1864ab;--blue-10:#145591;--blue-11:#114678;--blue-12:#0d375e;--cyan-0:#e3fafc;--cyan-1:#c5f6fa;--cyan-2:#99e9f2;--cyan-3:#66d9e8;--cyan-4:#3bc9db;--cyan-5:#22b8cf;--cyan-6:#15aabf;--cyan-7:#1098ad;--cyan-8:#0c8599;--cyan-9:#0b7285;--cyan-10:#095c6b;--cyan-11:#074652;--cyan-12:#053038;--teal-0:#e6fcf5;--teal-1:#c3fae8;--teal-2:#96f2d7;--teal-3:#63e6be;--teal-4:#38d9a9;--teal-5:#20c997;--teal-6:#12b886;--teal-7:#0ca678;--teal-8:#099268;--teal-9:#087f5b;--teal-10:#066649;--teal-11:#054d37;--teal-12:#033325;--green-0:#ebfbee;--green-1:#d3f9d8;--green-2:#b2f2bb;--green-3:#8ce99a;--green-4:#69db7c;--green-5:#51cf66;--green-6:#40c057;--green-7:#37b24d;--green-8:#2f9e44;--green-9:#2b8a3e;--green-10:#237032;--green-11:#1b5727;--green-12:#133d1b;--lime-0:#f4fce3;--lime-1:#e9fac8;--lime-2:#d8f5a2;--lime-3:#c0eb75;--lime-4:#a9e34b;--lime-5:#94d82d;--lime-6:#82c91e;--lime-7:#74b816;--lime-8:#66a80f;--lime-9:#5c940d;--lime-10:#4c7a0b;--lime-11:#3c6109;--lime-12:#2c4706;--yellow-0:#fff9db;--yellow-1:#fff3bf;--yellow-2:#ffec99;--yellow-3:#ffe066;--yellow-4:#ffd43b;--yellow-5:#fcc419;--yellow-6:#fab005;--yellow-7:#f59f00;--yellow-8:#f08c00;--yellow-9:#e67700;--yellow-10:#b35c00;--yellow-11:#804200;--yellow-12:#663500;--orange-0:#fff4e6;--orange-1:#ffe8cc;--orange-2:#ffd8a8;--orange-3:#ffc078;--orange-4:#ffa94d;--orange-5:#ff922b;--orange-6:#fd7e14;--orange-7:#f76707;--orange-8:#e8590c;--orange-9:#d9480f;--orange-10:#bf400d;--orange-11:#99330b;--orange-12:#802b09;--choco-0:#fff8dc;--choco-1:#fce1bc;--choco-2:#f7ca9e;--choco-3:#f1b280;--choco-4:#e99b62;--choco-5:#df8545;--choco-6:#d46e25;--choco-7:#bd5f1b;--choco-8:#a45117;--choco-9:#8a4513;--choco-10:#703a13;--choco-11:#572f12;--choco-12:#3d210d;--brown-0:#faf4eb;--brown-1:#ede0d1;--brown-2:#e0cab7;--brown-3:#d3b79e;--brown-4:#c5a285;--brown-5:#b78f6d;--brown-6:#a87c56;--brown-7:#956b47;--brown-8:#825b3a;--brown-9:#6f4b2d;--brown-10:#5e3a21;--brown-11:#4e2b15;--brown-12:#422412;--sand-0:#f8fafb;--sand-1:#e6e4dc;--sand-2:#d5cfbd;--sand-3:#c2b9a0;--sand-4:#aea58c;--sand-5:#9a9178;--sand-6:#867c65;--sand-7:#736a53;--sand-8:#5f5746;--sand-9:#4b4639;--sand-10:#38352d;--sand-11:#252521;--sand-12:#121210;--camo-0:#f9fbe7;--camo-1:#e8ed9c;--camo-2:#d2df4e;--camo-3:#c2ce34;--camo-4:#b5bb2e;--camo-5:#a7a827;--camo-6:#999621;--camo-7:#8c851c;--camo-8:#7e7416;--camo-9:#6d6414;--camo-10:#5d5411;--camo-11:#4d460e;--camo-12:#36300a;--jungle-0:#ecfeb0;--jungle-1:#def39a;--jungle-2:#d0e884;--jungle-3:#c2dd6e;--jungle-4:#b5d15b;--jungle-5:#a8c648;--jungle-6:#9bbb36;--jungle-7:#8fb024;--jungle-8:#84a513;--jungle-9:#7a9908;--jungle-10:#658006;--jungle-11:#516605;--jungle-12:#3d4d04;--gradient-space: ;--gradient-1:linear-gradient(to bottom right var(--gradient-space),#1f005c,#5b0060,#870160,#ac255e,#ca485c,#e16b5c,#f39060,#ffb56b);--gradient-2:linear-gradient(to bottom right var(--gradient-space),#48005c,#8300e2,#a269ff);--gradient-3:radial-gradient(circle at top right var(--gradient-space),#0ff,rgba(0,255,255,0)),radial-gradient(circle at bottom left var(--gradient-space),#ff1492,rgba(255,20,146,0));--gradient-4:linear-gradient(to bottom right var(--gradient-space),#00f5a0,#00d9f5);--gradient-5:conic-gradient(from -270deg at 75% 110% var(--gradient-space),#f0f,#fffaf0);--gradient-6:conic-gradient(from -90deg at top left var(--gradient-space),#000,#fff);--gradient-7:linear-gradient(to bottom right var(--gradient-space),#72c6ef,#004e8f);--gradient-8:conic-gradient(from 90deg at 50% 0% var(--gradient-space),#111,50%,#222,#111);--gradient-9:conic-gradient(from .5turn at bottom center var(--gradient-space),#add8e6,#fff);--gradient-10:conic-gradient(from 90deg at 40% -25% var(--gradient-space),gold,#f79d03,#ee6907,#e6390a,#de0d0d,#d61039,#cf1261,#c71585,#cf1261,#d61039,#de0d0d,#ee6907,#f79d03,gold,gold,gold);--gradient-11:conic-gradient(at bottom left var(--gradient-space),#ff1493,cyan);--gradient-12:conic-gradient(from 90deg at 25% -10% var(--gradient-space),#ff4500,#d3f340,#7bee85,#afeeee,#7bee85);--gradient-13:radial-gradient(circle at 50% 200% var(--gradient-space),#000142,#3b0083,#b300c3,#ff059f,#ff4661,#ffad86,#fff3c7);--gradient-14:conic-gradient(at top right var(--gradient-space),lime,cyan);--gradient-15:linear-gradient(to bottom right var(--gradient-space),#c7d2fe,#fecaca,#fef3c7);--gradient-16:radial-gradient(circle at 50% -250% var(--gradient-space),#374151,#111827,#000);--gradient-17:conic-gradient(from -90deg at 50% -25% var(--gradient-space),blue,#8a2be2);--gradient-18:linear-gradient(0deg var(--gradient-space),rgba(255,0,0,.8),rgba(255,0,0,0) 75%),linear-gradient(60deg var(--gradient-space),rgba(255,255,0,.8),rgba(255,255,0,0) 75%),linear-gradient(120deg var(--gradient-space),rgba(0,255,0,.8),rgba(0,255,0,0) 75%),linear-gradient(180deg var(--gradient-space),rgba(0,255,255,.8),rgba(0,255,255,0) 75%),linear-gradient(240deg var(--gradient-space),rgba(0,0,255,.8),rgba(0,0,255,0) 75%),linear-gradient(300deg var(--gradient-space),rgba(255,0,255,.8),rgba(255,0,255,0) 75%);--gradient-19:linear-gradient(to bottom right var(--gradient-space),#ffe259,#ffa751);--gradient-20:conic-gradient(from -135deg at -10% center var(--gradient-space),orange,#ff7715,#ff522a,#ff3f47,#ff5482,#ff69b4);--gradient-21:conic-gradient(from -90deg at 25% 115% var(--gradient-space),red,#f06,#f0c,#c0f,#60f,#00f,#00f,#00f,#00f);--gradient-22:linear-gradient(to bottom right var(--gradient-space),#acb6e5,#86fde8);--gradient-23:linear-gradient(to bottom right var(--gradient-space),#536976,#292e49);--gradient-24:conic-gradient(from .5turn at 0% 0% var(--gradient-space),#00c476,10%,#82b0ff,90%,#00c476);--gradient-25:conic-gradient(at 125% 50% var(--gradient-space),#b78cf7,#ff7c94,#ffcf0d,#ff7c94,#b78cf7);--gradient-26:linear-gradient(to bottom right var(--gradient-space),#9796f0,#fbc7d4);--gradient-27:conic-gradient(from .5turn at bottom left var(--gradient-space),#ff1493,#639);--gradient-28:conic-gradient(from -90deg at 50% 105% var(--gradient-space),#fff,orchid);--gradient-29:radial-gradient(circle at top right var(--gradient-space),#bfb3ff,rgba(191,179,255,0)),radial-gradient(circle at bottom left var(--gradient-space),#86acf9,rgba(134,172,249,0));--gradient-30:radial-gradient(circle at top right var(--gradient-space),#00ff80,rgba(0,255,128,0)),radial-gradient(circle at bottom left var(--gradient-space),#adffd6,rgba(173,255,214,0));--noise-1:url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.005' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");--noise-2:url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.05' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");--noise-3:url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.25' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");--noise-4:url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 2056 2056' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");--noise-5:url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 2056 2056' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");--noise-filter-1:contrast(300%) brightness(100%);--noise-filter-2:contrast(200%) brightness(150%);--noise-filter-3:contrast(200%) brightness(250%);--noise-filter-4:contrast(200%) brightness(500%);--noise-filter-5:contrast(200%) brightness(1000%);--animation-fade-in:fade-in .5s var(--ease-3);--animation-fade-in-bloom:fade-in-bloom 2s var(--ease-3);--animation-fade-out:fade-out .5s var(--ease-3);--animation-fade-out-bloom:fade-out-bloom 2s var(--ease-3);--animation-scale-up:scale-up .5s var(--ease-3);--animation-scale-down:scale-down .5s var(--ease-3);--animation-slide-out-up:slide-out-up .5s var(--ease-3);--animation-slide-out-down:slide-out-down .5s var(--ease-3);--animation-slide-out-right:slide-out-right .5s var(--ease-3);--animation-slide-out-left:slide-out-left .5s var(--ease-3);--animation-slide-in-up:slide-in-up .5s var(--ease-3);--animation-slide-in-down:slide-in-down .5s var(--ease-3);--animation-slide-in-right:slide-in-right .5s var(--ease-3);--animation-slide-in-left:slide-in-left .5s var(--ease-3);--animation-shake-x:shake-x .75s var(--ease-out-5);--animation-shake-y:shake-y .75s var(--ease-out-5);--animation-shake-z:shake-z 1s var(--ease-in-out-3);--animation-spin:spin 2s linear infinite;--animation-ping:ping 5s var(--ease-out-3) infinite;--animation-blink:blink 1s var(--ease-out-3) infinite;--animation-float:float 3s var(--ease-in-out-3) infinite;--animation-bounce:bounce 2s var(--ease-squish-2) infinite;--animation-pulse:pulse 2s var(--ease-out-3) infinite;--border-size-1:1px;--border-size-2:2px;--border-size-3:5px;--border-size-4:10px;--border-size-5:25px;--radius-1:2px;--radius-2:5px;--radius-3:1rem;--radius-4:2rem;--radius-5:4rem;--radius-6:8rem;--radius-drawn-1:255px 15px 225px 15px/15px 225px 15px 255px;--radius-drawn-2:125px 10px 20px 185px/25px 205px 205px 25px;--radius-drawn-3:15px 255px 15px 225px/225px 15px 255px 15px;--radius-drawn-4:15px 25px 155px 25px/225px 150px 25px 115px;--radius-drawn-5:250px 25px 15px 20px/15px 80px 105px 115px;--radius-drawn-6:28px 100px 20px 15px/150px 30px 205px 225px;--radius-round:1e5px;--radius-blob-1:30% 70% 70% 30%/53% 30% 70% 47%;--radius-blob-2:53% 47% 34% 66%/63% 46% 54% 37%;--radius-blob-3:37% 63% 56% 44%/49% 56% 44% 51%;--radius-blob-4:63% 37% 37% 63%/43% 37% 63% 57%;--radius-blob-5:49% 51% 48% 52%/57% 44% 56% 43%;--radius-conditional-1:clamp(0px,calc(100vw - 100%) * 1e5,var(--radius-1));--radius-conditional-2:clamp(0px,calc(100vw - 100%) * 1e5,var(--radius-2));--radius-conditional-3:clamp(0px,calc(100vw - 100%) * 1e5,var(--radius-3));--radius-conditional-4:clamp(0px,calc(100vw - 100%) * 1e5,var(--radius-4));--radius-conditional-5:clamp(0px,calc(100vw - 100%) * 1e5,var(--radius-5));--radius-conditional-6:clamp(0px,calc(100vw - 100%) * 1e5,var(--radius-6));--palette-hue:250;--palette-hue-rotate-by:0;--palette-chroma:0.15;--color-1:oklch(98% calc(var(--palette-chroma)*0.03) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*0));--color-2:oklch(97% calc(var(--palette-chroma)*0.06) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*1));--color-3:oklch(93% calc(var(--palette-chroma)*0.1) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*2));--color-4:oklch(84% calc(var(--palette-chroma)*0.12) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*3));--color-5:oklch(80% calc(var(--palette-chroma)*0.16) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*4));--color-6:oklch(71% calc(var(--palette-chroma)*0.19) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*5));--color-7:oklch(66% calc(var(--palette-chroma)*0.2) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*6));--color-8:oklch(58% calc(var(--palette-chroma)*0.21) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*7));--color-9:oklch(53% calc(var(--palette-chroma)*0.2) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*8));--color-10:oklch(49% calc(var(--palette-chroma)*0.19) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*9));--color-11:oklch(42% calc(var(--palette-chroma)*0.17) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*10));--color-12:oklch(35% calc(var(--palette-chroma)*0.15) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*11));--color-13:oklch(27% calc(var(--palette-chroma)*0.12) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*12));--color-14:oklch(20% calc(var(--palette-chroma)*0.09) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*13));--color-15:oklch(16% calc(var(--palette-chroma)*0.07) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*14));--color-16:oklch(10% calc(var(--palette-chroma)*0.05) calc(var(--palette-hue) + var(--palette-hue-rotate-by)*15))}@media (prefers-color-scheme:dark){:where(html){--shadow-color:220 40% 2%;--shadow-strength:25%;--inner-shadow-highlight:inset 0 -.5px 0 0 hsla(0,0%,100%,.067),inset 0 .5px 0 0 rgba(0,0,0,.467)}}@supports (background:linear-gradient(to right in oklab,#000,#fff)){:where(html){--gradient-space:in oklab}}@keyframes fade-in{to{opacity:1}}@keyframes fade-in-bloom{0%{filter:brightness(1) blur(20px);opacity:0}10%{filter:brightness(2) blur(10px);opacity:1}to{filter:brightness(1) blur(0);opacity:1}}@keyframes fade-out{to{opacity:0}}@keyframes fade-out-bloom{to{filter:brightness(1) blur(20px);opacity:0}10%{filter:brightness(2) blur(10px);opacity:1}0%{filter:brightness(1) blur(0);opacity:1}}@keyframes scale-up{to{transform:scale(1.25)}}@keyframes scale-down{to{transform:scale(.75)}}@keyframes slide-out-up{to{transform:translateY(-100%)}}@keyframes slide-out-down{to{transform:translateY(100%)}}@keyframes slide-out-right{to{transform:translateX(100%)}}@keyframes slide-out-left{to{transform:translateX(-100%)}}@keyframes slide-in-up{0%{transform:translateY(100%)}}@keyframes slide-in-down{0%{transform:translateY(-100%)}}@keyframes slide-in-right{0%{transform:translateX(-100%)}}@keyframes slide-in-left{0%{transform:translateX(100%)}}@keyframes shake-x{0%,to{transform:translateX(0)}20%{transform:translateX(-5%)}40%{transform:translateX(5%)}60%{transform:translateX(-5%)}80%{transform:translateX(5%)}}@keyframes shake-y{0%,to{transform:translateY(0)}20%{transform:translateY(-5%)}40%{transform:translateY(5%)}60%{transform:translateY(-5%)}80%{transform:translateY(5%)}}@keyframes shake-z{0%,to{transform:rotate(0deg)}20%{transform:rotate(-2deg)}40%{transform:rotate(2deg)}60%{transform:rotate(-2deg)}80%{transform:rotate(2deg)}}@keyframes spin{to{transform:rotate(1turn)}}@keyframes ping{90%,to{opacity:0;transform:scale(2)}}@keyframes blink{0%,to{opacity:1}50%{opacity:.5}}@keyframes float{50%{transform:translateY(-25%)}}@keyframes bounce{25%{transform:translateY(-20%)}40%{transform:translateY(-3%)}0%,60%,to{transform:translateY(0)}}@keyframes pulse{50%{transform:scale(.9)}}@media (prefers-color-scheme:dark){@keyframes fade-in-bloom{0%{filter:brightness(1) blur(20px);opacity:0}10%{filter:brightness(.5) blur(10px);opacity:1}to{filter:brightness(1) blur(0);opacity:1}}}@media (prefers-color-scheme:dark){@keyframes fade-out-bloom{to{filter:brightness(1) blur(20px);opacity:0}10%{filter:brightness(.5) blur(10px);opacity:1}0%{filter:brightness(1) blur(0);opacity:1}}}`;

// src/theme.ts
var OPEN_PROPS_CSS = open_props_min_default;
var THEME_CSS = (
  /*css*/
  `
:root {
  --pb-bg: #0f1115;
  --pb-panel: #161a22;
  --pb-panel-2: #1c2230;
  --pb-border: #262d3b;
  --pb-text: #e6e9ef;
  --pb-text-dim: #8a93a6;
  --pb-accent: #6aa9ff;
  --pb-danger: #ff6b6b;
}
#pbMainPanel {
  --pb-bg: #0f1115;
  --pb-panel: #161a22;
  --pb-panel-2: #1c2230;
  --pb-border: #262d3b;
  --pb-text: #e6e9ef;
  --pb-text-dim: #8a93a6;
  --pb-accent: #6aa9ff;
  --pb-danger: #ff6b6b;
  --pb-chip-bg: #2a3142;
  --pb-chip-bg-focus: #324063;
  --pb-radius: 8px;
  --pb-transition-fast: 120ms ease;
  --pb-shadow-md: var(--shadow-4);
  --pb-shadow-lg: var(--shadow-6);
  --pb-font-sm: 12px;
}
/* \u6D45\u8272\uFF1A\u7C73\u9EC4\u6696\u8272\uFF0C\u6574\u4F53\u504F\u6DF1\uFF1Bpanel \u4E0E panel-2 \u5C42\u7EA7\u5DEE\u62C9\u5927 */
#pbMainPanel.pb-light {
  --pb-bg: #e4d5b8;           /* \u6700\u6DF1\u5E95 */
  --pb-panel: #f2e6ce;        /* \u4E3B\u9762\u677F\uFF1A\u660E\u663E\u4EAE\u4E8E\u5E95 */
  --pb-panel-2: #d6c4a0;      /* \u6B21\u7EA7\u9762\uFF1A\u660E\u663E\u6DF1\u4E8E\u4E3B\u9762\u677F */
  --pb-border: #c4b08a;
  --pb-text: #2a2416;
  --pb-text-dim: #6e6350;
  --pb-chip-bg: #e0d2b0;
  --pb-chip-bg-focus: #d4c49a;
}
`
);

// src/ui/panel.ts
init_dom();
init_types();
init_state();
var PANEL_CSS = (
  /*css*/
  `
#pbMainPanel {
  position: fixed; z-index: 9999; display: grid;
  grid-template-rows: auto 1fr auto;
  width: ${PANEL_DEFAULTS.defaultWidth}px; height: ${PANEL_DEFAULTS.defaultHeight}px;
  min-width: ${PANEL_DEFAULTS.minWidth}px; min-height: ${PANEL_DEFAULTS.minHeight}px;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: var(--pb-radius);
  color: var(--pb-text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px; line-height: 1.4; box-shadow: var(--pb-shadow-lg);
  user-select: none; overflow: hidden; resize: both;
}
#pbMainPanel.pb-hidden { display: none !important; }
#pbMainPanel.pb-minimized {
  height: auto !important;
  width: max-content !important;
  min-width: 0 !important;
  max-width: none !important;
  min-height: unset !important;
  resize: none;
}
#pbMainPanel.pb-minimized .pb-body,
#pbMainPanel.pb-minimized .pb-statusbar { display: none; }
#pbMainPanel.pb-minimized .pb-titlebar {
  border-radius: var(--pb-radius);
  border-bottom: none;
  gap: 8px;
  padding: 4px 8px;
  width: max-content;
}
#pbMainPanel.pb-minimized .pb-title-name {
  margin-right: 0; flex-shrink: 0; font-size: 12px;
}
#pbMainPanel.pb-minimized .pb-title-actions {
  gap: 8px; flex-shrink: 0; margin-left: 0;
}
#pbMainPanel.pb-minimized .pb-min-grip {
  opacity: 0.7; margin-right: 0; font-size: 12px; letter-spacing: 1px;
}
#pbMainPanel.pb-minimized .pb-btn.primary {
  height: 22px; padding: 1px 8px; font-size: 11px;
}
#pbMainPanel.pb-minimized .pb-minimize {
  font-size: 15px; padding: 0 4px; min-width: 20px; text-align: center;
}

.pb-titlebar {
  display: flex; align-items: center; justify-content: space-between;
  /* \u7565\u9AD8\u4E8E\u5E95\u680F\uFF08\u5E95\u680F padding 4px + 11px \u5B57\uFF09\uFF0C\u9876\u680F\u518D\u8584\u4E00\u70B9 */
  padding: 4px 12px; background: var(--pb-panel-2); border-bottom: 1px solid var(--pb-border);
  cursor: move; font-size: 12px; font-weight: 600; flex-shrink: 0;
  min-height: 0;
}
.pb-title-name { pointer-events: none; white-space: nowrap; line-height: 1.2; }
.pb-title-actions { display: flex; align-items: center; gap: 12px; }
.pb-btn {
  border: 1px solid var(--pb-border); background: var(--pb-panel-2); color: var(--pb-text);
  border-radius: 6px; padding: 2px 10px; cursor: pointer; font-size: 12px; white-space: nowrap;
  height: 24px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
}
.pb-btn:hover { border-color: var(--pb-accent); color: var(--pb-accent); }
.pb-btn.primary { background: var(--pb-accent); color: #0b1020; border-color: var(--pb-accent); font-weight: 600; }
.pb-btn:disabled { opacity: 0.35; pointer-events: none; cursor: default; }
.pb-minimize {
  cursor: pointer; color: var(--pb-text-dim); font-size: 16px; padding: 0 4px; line-height: 1;
  display: inline-flex; align-items: center; justify-content: center; user-select: none;
}
.pb-minimize:hover { color: var(--pb-accent); }

.pb-body { display: grid; grid-template-columns: 1fr 4px 260px; overflow: hidden; min-height: 0; min-width: 0; }
.pb-main-area { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
.pb-presets-area { overflow-y: auto; overflow-x: hidden; min-width: 0; min-height: 0; width: 100%; }
.pb-row-divider { height: 4px; background: var(--pb-border); cursor: row-resize; flex-shrink: 0; }
.pb-row-divider:hover { background: var(--pb-accent); }
.pb-workspace-area { overflow-y: auto; overflow-x: hidden; flex: 1; min-height: 0; }
.pb-col-divider { width: 4px; background: var(--pb-border); cursor: col-resize; }
.pb-col-divider:hover { background: var(--pb-accent); }
.pb-right-area { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.pb-statusbar {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 4px 10px; border-top: 1px solid var(--pb-border); background: var(--pb-panel-2);
  cursor: move; font-size: 11px; color: var(--pb-text-dim); flex-shrink: 0;
}
.pb-status-left {
  display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap;
  cursor: default;
}
.pb-status-sep { opacity: 0.5; user-select: none; pointer-events: none; }
.pb-status-link {
  background: none; border: none; padding: 0; margin: 0;
  font: inherit; font-size: 11px; color: var(--pb-text-dim);
  cursor: pointer; white-space: nowrap; text-decoration: none;
  user-select: none; font-variant-numeric: tabular-nums;
}
.pb-status-link:hover { color: var(--pb-accent); }
.pb-status-link.pb-disabled {
  opacity: 0.35; pointer-events: none; cursor: default;
}
.pb-status-right {
  display: flex; align-items: center; margin-left: auto; flex-shrink: 0;
  cursor: move;
}
.pb-min-grip {
  color: var(--pb-text-dim); font-size: 13px; letter-spacing: 2px; opacity: .45;
  flex-shrink: 0; cursor: move;
}
`
);
var _rightWidth = 260;
var _presetCollapsed = false;
function applyPresetCollapsedUI() {
  const presetsArea = $("pbPresetsArea");
  const row = $("pbRowDivider");
  if (!presetsArea || !row) return;
  if (_presetCollapsed) {
    const h2 = presetsArea.querySelector(".pb-preset-header");
    const b = presetsArea.querySelector(".pb-preset-body");
    if (h2) h2.style.display = "none";
    if (b) b.style.display = "none";
    presetsArea.style.height = "auto";
    presetsArea.style.flex = "none";
    row.style.cssText = "min-height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--pb-text-dim);cursor:row-resize;";
    row.textContent = `${state.l1Cat || "\u8BCD\u5E93"} \u25BC`;
  } else {
    if (row.textContent && row.textContent.includes("\u25BC")) {
      row.style.cssText = "";
      row.textContent = "";
    }
  }
}
function getPanel() {
  let panel = $("pbMainPanel");
  if (!panel) {
    panel = buildPanel();
    document.body.appendChild(panel);
    injectCSS("openprops", OPEN_PROPS_CSS);
    injectCSS("theme", THEME_CSS);
    injectCSS("panel", PANEL_CSS);
    restorePos(panel);
    bindEvents(panel);
  }
  return panel;
}
function buildPanel() {
  const panel = div();
  panel.id = "pbMainPanel";
  panel.className = "pb-hidden";
  const titlebar = div("pb-titlebar");
  titlebar.innerHTML = `
    <span class="pb-min-grip">\u22EE\u22EE</span>
    <span class="pb-title-name">PromptBuilder</span>
    <div class="pb-title-actions">
      <button type="button" class="pb-btn primary" id="pbGenerateBtn" title="\u6267\u884C\u751F\u6210">\u25B6 \u751F\u6210</button>
      <span class="pb-minimize" id="pbMinimizeBtn" title="\u6536\u8D77 (Ctrl+Shift+X)">\u2212</span>
    </div>
  `;
  panel.appendChild(titlebar);
  titlebar.querySelector("#pbMinimizeBtn")?.addEventListener("click", () => {
    toggleMinimized();
  });
  const body = div("pb-body");
  const main = div("pb-main-area");
  const presets = div("pb-presets-area");
  presets.id = "pbPresetsArea";
  const rowDiv = div("pb-row-divider");
  rowDiv.id = "pbRowDivider";
  const actionBar = div();
  actionBar.id = "pbActionBar";
  actionBar.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:4px;padding:4px 12px;flex-shrink:0;";
  actionBar.innerHTML = `
    <span style="font-size:12px;font-weight:600;color:var(--pb-text-dim);">\u5DE5\u4F5C\u533A</span>
    <div style="display:flex;gap:4px;">
      <button type="button" id="pbTranslateBtn" class="pb-btn" style="font-size:11px;padding:2px 8px;height:26px;">\u7FFB\u8BD1</button>
      <button type="button" id="pbClearBtn" class="pb-btn" style="font-size:11px;padding:2px 8px;height:26px;">\u6E05\u7A7A</button>
    </div>
  `;
  const workspace = div("pb-workspace-area");
  workspace.id = "pbWorkspaceArea";
  main.appendChild(presets);
  main.appendChild(rowDiv);
  main.appendChild(actionBar);
  main.appendChild(workspace);
  const colDiv = div("pb-col-divider");
  colDiv.id = "pbColDivider";
  const right = div("pb-right-area");
  right.id = "pbRightArea";
  const out = div();
  out.id = "pbOutputSlot";
  out.style.cssText = "flex:1;overflow-y:auto;min-height:0;";
  const set = div();
  set.id = "pbSettingsSlot";
  set.style.cssText = "flex-shrink:0;overflow-y:auto;max-height:40%;";
  right.appendChild(out);
  right.appendChild(set);
  body.appendChild(main);
  body.appendChild(colDiv);
  body.appendChild(right);
  panel.appendChild(body);
  const status = div("pb-statusbar");
  status.innerHTML = `
    <div class="pb-status-left">
      <span class="pb-min-grip" title="\u62D6\u62FD\u79FB\u52A8">\u22EE\u22EE</span>
      <span class="pb-status-link pb-disabled" id="pbUndoBtn" role="button" tabindex="0" title="\u64A4\u9500">\u64A4\u9500 0</span>
      <span class="pb-status-sep">\xB7</span>
      <span class="pb-status-link pb-disabled" id="pbRedoBtn" role="button" tabindex="0" title="\u91CD\u505A">\u91CD\u505A 0</span>
      <span class="pb-status-link" id="pbExportBtn" role="button" tabindex="0">\u5BFC\u51FA\u8BCD\u5E93</span>
      <span class="pb-status-link" id="pbImportBtn" role="button" tabindex="0">\u5BFC\u5165\u8BCD\u5E93</span>
    </div>
    <div class="pb-status-right">
      <span>@trancentral</span>
    </div>
  `;
  panel.appendChild(status);
  return panel;
}
function viewportSize() {
  const vv = window.visualViewport;
  return {
    w: vv?.width ?? window.innerWidth,
    h: vv?.height ?? window.innerHeight
  };
}
function panelZoom(panel) {
  const z = parseFloat(panel.style.zoom || "1");
  return Number.isFinite(z) && z > 0 ? z : 1;
}
function clampPanelTop(top, panel) {
  const { h: h2 } = viewportSize();
  const z = panelZoom(panel);
  const title = panel.querySelector(".pb-titlebar");
  const edge = Math.max(24, (title?.offsetHeight ?? 28) * z);
  const maxTop = Math.max(0, (h2 - edge) / z);
  return clamp(top, 0, maxTop);
}
function clampPanelLeft(left, panel) {
  const { w } = viewportSize();
  const z = panelZoom(panel);
  const edge = 48;
  const pw = panel.offsetWidth * z;
  const minL = (edge - pw) / z;
  const maxL = (w - edge) / z;
  return clamp(left, minL, maxL);
}
function restorePos(panel) {
  const { w, h: h2 } = viewportSize();
  const geo = loadPanelGeo();
  if (geo) {
    panel.style.width = clamp(geo.width, PANEL_DEFAULTS.minWidth, w) + "px";
    panel.style.height = clamp(geo.height, PANEL_DEFAULTS.minHeight, h2) + "px";
    panel.style.left = clampPanelLeft(geo.left, panel) + "px";
    panel.style.top = clampPanelTop(geo.top, panel) + "px";
  } else {
    panel.style.left = Math.max(0, (w - PANEL_DEFAULTS.defaultWidth) / 2) + "px";
    panel.style.top = Math.max(0, (h2 - PANEL_DEFAULTS.defaultHeight) / 2) + "px";
  }
  const saved = loadColWidths();
  if (saved?.[1]) _rightWidth = saved[1];
  applyLayout();
}
function applyLayout() {
  const body = document.querySelector("#pbMainPanel .pb-body");
  if (body) body.style.gridTemplateColumns = `1fr 4px ${_rightWidth}px`;
}
function bindEvents(panel) {
  bindDrag(".pb-titlebar", panel);
  bindDrag(".pb-statusbar", panel);
  new ResizeObserver(() => {
    savePanelGeo({
      left: panel.offsetLeft,
      top: panel.offsetTop,
      width: panel.offsetWidth,
      height: panel.offsetHeight
    });
    applyLayout();
  }).observe(panel);
  requestAnimationFrame(() => {
    const col = panel.querySelector("#pbColDivider");
    col?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      col.setPointerCapture(e.pointerId);
      const sx = e.clientX;
      const start = _rightWidth;
      const move = (ev) => {
        const pe = ev;
        _rightWidth = clamp(start + (sx - pe.clientX), COLUMN_MINS.rightMinWidth, 600);
        applyLayout();
      };
      const up = () => {
        col.removeEventListener("pointermove", move);
        saveColWidths([0, _rightWidth]);
      };
      col.addEventListener("pointermove", move);
      col.addEventListener("pointerup", up, { once: true });
    });
    const row = panel.querySelector("#pbRowDivider");
    row?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      row.setPointerCapture(e.pointerId);
      const sy = e.clientY;
      const presetsArea = $("pbPresetsArea");
      if (!presetsArea) return;
      const startH = presetsArea.offsetHeight;
      let hitMin = false;
      let collapsed = _presetCollapsed;
      const move = (ev) => {
        const pe = ev;
        const dy = pe.clientY - sy;
        let newH = startH + dy;
        if (!collapsed && newH < PRESET_COLLAPSE_THRESHOLD) {
          if (!hitMin) {
            newH = PRESET_COLLAPSE_THRESHOLD;
            hitMin = true;
          } else if (dy < -30) {
            collapsed = true;
            _presetCollapsed = true;
            applyPresetCollapsedUI();
            return;
          }
        }
        if (collapsed && dy > 10) {
          collapsed = false;
          _presetCollapsed = false;
          const h2 = presetsArea.querySelector(".pb-preset-header");
          const b = presetsArea.querySelector(".pb-preset-body");
          if (h2) h2.style.display = "";
          if (b) b.style.display = "";
          row.style.cssText = "";
          row.textContent = "";
          newH = PRESET_COLLAPSE_THRESHOLD;
        }
        if (!collapsed) {
          newH = clamp(newH, COLUMN_MINS.presetMinHeight, window.innerHeight - 300);
          presetsArea.style.height = newH + "px";
          presetsArea.style.flex = "none";
        }
      };
      const up = () => row.removeEventListener("pointermove", move);
      row.addEventListener("pointermove", move);
      row.addEventListener("pointerup", up, { once: true });
    });
  });
}
function bindDrag(sel, panel) {
  const handle = panel.querySelector(sel);
  if (!handle) return;
  let sx = 0, sy = 0, sl = 0, st = 0;
  handle.addEventListener("pointerdown", (e) => {
    const pe = e;
    if (pe.button !== 0) return;
    const t = pe.target;
    if (t.closest("button, input, select, textarea, .pb-minimize, .pb-status-link")) return;
    sx = pe.clientX;
    sy = pe.clientY;
    const z = panelZoom(panel);
    const rect = panel.getBoundingClientRect();
    const parsedL = parseFloat(panel.style.left);
    const parsedT = parseFloat(panel.style.top);
    sl = Number.isFinite(parsedL) ? parsedL : rect.left / z;
    st = Number.isFinite(parsedT) ? parsedT : rect.top / z;
    handle.setPointerCapture(pe.pointerId);
    const move = (ev) => {
      const pv = ev;
      const zz = panelZoom(panel);
      const left = sl + (pv.clientX - sx) / zz;
      const top = st + (pv.clientY - sy) / zz;
      panel.style.left = clampPanelLeft(left, panel) + "px";
      panel.style.top = clampPanelTop(top, panel) + "px";
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      const left = parseFloat(panel.style.left);
      const top = parseFloat(panel.style.top);
      savePanelGeo({
        left: Number.isFinite(left) ? left : panel.offsetLeft,
        top: Number.isFinite(top) ? top : panel.offsetTop,
        width: panel.offsetWidth,
        height: panel.offsetHeight
      });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up, { once: true });
  });
}
function showPanel() {
  getPanel().classList.remove("pb-hidden");
  updateUndoButtons();
}
function isPanelVisible() {
  const p = $("pbMainPanel");
  return p ? !p.classList.contains("pb-hidden") : false;
}
function toggleMinimized() {
  const panel = getPanel();
  if (panel.classList.contains("pb-hidden")) return;
  const min = panel.classList.toggle("pb-minimized");
  const btn = panel.querySelector("#pbMinimizeBtn");
  if (btn) {
    btn.textContent = min ? "\u26F6" : "\u2212";
    btn.title = min ? "\u5C55\u5F00 (Ctrl+Shift+X)" : "\u6536\u8D77 (Ctrl+Shift+X)";
  }
  updateUndoButtons();
}
function updateUndoButtons() {
  const undoBtn = document.getElementById("pbUndoBtn");
  const redoBtn = document.getElementById("pbRedoBtn");
  const u = canUndo();
  const r = canRedo();
  if (undoBtn) {
    undoBtn.textContent = `\u64A4\u9500 ${getUndoDepth()}`;
    undoBtn.classList.toggle("pb-disabled", !u);
  }
  if (redoBtn) {
    redoBtn.textContent = `\u91CD\u505A ${getRedoDepth()}`;
    redoBtn.classList.toggle("pb-disabled", !r);
  }
}

// src/ui/workspace.ts
init_state();
init_pipe();
init_dom();

// src/ui/chip.ts
init_pipe();
init_dom();
init_toast();
init_state();
var CSS3 = (
  /*css*/
  `
.pb-chip {
  position: relative; display: inline-flex; flex-direction: column; justify-content: center;
  min-width: 40px; max-width: 280px; height: 36px;
  padding: 3px 20px 3px 16px; margin: 3px;
  border-radius: 6px; background: var(--pb-chip-bg); cursor: grab;
  user-select: none; box-sizing: border-box; overflow: hidden;
}
.pb-chip:hover { background: var(--pb-chip-bg-focus); }
.pb-chip.pb-chip-selected {
  /* fallback for browsers without color-mix */
  background: var(--pb-chip-bg-focus);
  background: color-mix(in srgb, var(--pb-accent) 28%, var(--pb-chip-bg));
}
.pb-chip.pb-chip-multi-ghost { opacity: 0.35; }
.pb-chip::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px;
  border-radius: 5px 0 0 5px; background: var(--pb-chip-color, var(--pb-text-dim));
}
.pb-chip-top-row { display: flex; align-items: baseline; gap: 2px; min-width: 0; }
.pb-chip-main {
  font-size: 12px; font-weight: 500; line-height: 1.25; color: var(--pb-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.pb-chip-weight { font-size: 10px; line-height: 1.25; color: var(--pb-text-dim); flex-shrink: 0; }
.pb-chip-sub {
  font-size: 10px; line-height: 1.2; color: var(--pb-text-dim); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.pb-chip-del {
  position: absolute; right: 0; top: 0; bottom: 0; width: 16px;
  display: none; align-items: center; justify-content: center;
  border: none; background: transparent; color: var(--pb-text-dim);
  font-size: 10px; cursor: pointer; border-radius: 0 6px 6px 0;
}
.pb-chip:hover .pb-chip-del { display: flex; }
.pb-chip-del:hover { color: var(--pb-danger); }
.pb-chip.pb-bypass { opacity: 0.45; }
.pb-chip.pb-bypass .pb-chip-main { text-decoration: line-through; }
.pb-chip.pb-translating { opacity: 0.7; }
.pb-chip.pb-translating::after {
  content: '...'; position: absolute; right: 18px; top: 50%;
  transform: translateY(-50%); font-size: 10px; color: var(--pb-accent);
}
.pb-chip.sortable-ghost { opacity: 0.25; border: 1px dashed var(--pb-border); background: transparent; }
.pb-chip.sortable-chosen { opacity: 0.55; box-shadow: 0 4px 12px rgba(0,0,0,0.35); }

.pb-chip-toolbar {
  position: fixed; z-index: 10007; display: flex; gap: 2px; padding: 2px; align-items: center;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: 6px;
  box-shadow: var(--pb-shadow-md); opacity: 0; pointer-events: none; transition: opacity 120ms;
}
.pb-chip-toolbar.pb-visible { opacity: 1; pointer-events: auto; }
.pb-chip-toolbar button {
  min-width: 26px; height: 24px; padding: 0 4px; border: none; border-radius: 4px;
  background: transparent; color: var(--pb-text); cursor: pointer; font-size: 12px;
  white-space: nowrap;
}
.pb-chip-toolbar button:hover { background: var(--pb-border); }
.pb-chip-toolbar .pb-tb-count {
  font-size: 10px; color: var(--pb-text-dim); padding: 0 4px; white-space: nowrap;
}
/* \u6743\u91CD\u6570\u5B57\uFF1A\u66FF\u4EE3 \u2212/+\uFF0C\u53EF\u70B9\u7F16\u8F91 / \u6EDA\u8F6E\u8C03\u8282 */
.pb-chip-toolbar .pb-tb-weight {
  min-width: 36px; height: 24px; padding: 0 6px; margin: 0;
  border: 1px solid var(--pb-border); border-radius: 4px; box-sizing: border-box;
  background: var(--pb-bg); color: var(--pb-text); cursor: text;
  font-size: 12px; font-weight: 400; line-height: 22px; font-variant-numeric: tabular-nums;
  display: inline-flex; align-items: center; justify-content: center;
  white-space: nowrap; user-select: none;
  vertical-align: middle;
}
/* \u65E0\u60AC\u505C\u53D8\u8272\uFF0C\u9760\u8FB9\u6846\u4E0E toolbar \u533A\u5206 */
.pb-chip-toolbar .pb-tb-weight:hover {
  background: var(--pb-bg);
}
.pb-chip-toolbar .pb-tb-weight-input {
  width: 40px; height: 24px; padding: 0 4px; margin: 0; box-sizing: border-box;
  border: 1px solid var(--pb-border); border-radius: 4px;
  background: var(--pb-bg); color: var(--pb-text);
  font-size: 12px; font-weight: 400; line-height: 22px;
  font-variant-numeric: tabular-nums; text-align: center; outline: none;
  /* \u9690\u85CF number \u53F3\u4FA7\u6B65\u8FDB\u7BAD\u5934 */
  -moz-appearance: textfield;
  appearance: textfield;
}
.pb-chip-toolbar .pb-tb-weight-input::-webkit-outer-spin-button,
.pb-chip-toolbar .pb-tb-weight-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pb-chip-edit-panel {
  position: fixed; z-index: 10009;
  /* \u56FA\u5B9A\u5BBD\u5EA6\uFF0C\u907F\u514D\u8D85\u957F\u65E0\u7A7A\u683C\u6587\u672C\u628A\u5F39\u7A97\u6491\u5BBD */
  width: min(240px, 92vw); max-width: min(240px, 92vw);
  box-sizing: border-box; padding: 10px;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: 8px;
  box-shadow: var(--pb-shadow-lg); display: flex; flex-direction: column; gap: 6px;
  min-width: 0;
}
.pb-chip-edit-panel label {
  font-size: 10px; color: var(--pb-text-dim); display: flex; flex-direction: column; gap: 2px;
  min-width: 0; max-width: 100%;
}
.pb-chip-edit-panel input,
.pb-chip-edit-panel textarea {
  width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box;
  padding: 4px 6px; font-size: 12px;
  border: 1px solid var(--pb-border); border-radius: 4px;
  background: var(--pb-bg); color: var(--pb-text); outline: none;
  font-family: inherit; line-height: 1.4;
}
.pb-chip-edit-panel input:focus,
.pb-chip-edit-panel textarea:focus { border-color: var(--pb-accent); }
.pb-chip-edit-panel textarea {
  min-height: 36px; max-height: 160px;
  resize: vertical; /* \u9AD8\u5EA6\u7531 JS \u6309\u56FA\u5B9A\u5BBD\u5EA6\u4E0B\u7684 scrollHeight \u8BA1\u7B97 */
  white-space: pre-wrap;
  word-break: break-word; overflow-wrap: anywhere;
  /* \u65E0\u7A7A\u683C\u957F\u4E32\u4E5F\u5F3A\u5236\u65AD\u884C\uFF0C\u9632\u6B62\u6491\u5BBD */
  overflow-wrap: anywhere;
  overflow-x: hidden; overflow-y: auto;
}
.pb-chip-edit-actions { display: flex; gap: 6px; justify-content: flex-end; margin-top: 4px; }
.pb-chip-edit-actions button {
  font-size: 11px; padding: 3px 10px; border-radius: 4px; cursor: pointer;
  border: 1px solid var(--pb-border); background: var(--pb-panel-2); color: var(--pb-text);
}
.pb-chip-edit-actions button.primary {
  background: var(--pb-accent); border-color: var(--pb-accent); color: #0b1020; font-weight: 600;
}
`
);
var _css2 = false;
var _toolbar = null;
var _hideTimer = null;
var TOOLBAR_SHOW_DELAY_MS = 200;
var _showTimer = null;
var _active = null;
var _editPanel = null;
var _editCommit = null;
var _weightEditing = false;
function ensureCss() {
  if (!_css2) {
    injectCSS("chip", CSS3);
    _css2 = true;
  }
}
function getToolbar() {
  if (!_toolbar) {
    ensureCss();
    _toolbar = div("pb-chip-toolbar");
    document.body.appendChild(_toolbar);
    _toolbar.addEventListener("pointerenter", () => {
      if (_hideTimer) clearTimeout(_hideTimer);
      if (_showTimer) clearTimeout(_showTimer);
      _showTimer = null;
    });
    _toolbar.addEventListener("pointerleave", () => {
      if (_weightEditing) return;
      hideToolbar();
    });
    _toolbar.addEventListener("pointerdown", onToolbarPointerDown);
    _toolbar.addEventListener("wheel", onToolbarWeightWheel, { passive: false });
    _toolbar.addEventListener("click", onToolbarWeightClick);
  }
  return _toolbar;
}
function fmtWeight(w) {
  const r = Math.round((Number.isFinite(w) ? w : 1) * 10) / 10;
  return String(clamp(r, 0.1, 5));
}
function toolbarTargetIds() {
  const multi = getSelectedCount() > 1 && _active && isSelected(_active.chip.id);
  return multi ? getSelectedIds() : _active ? [_active.chip.id] : [];
}
function activeChipWeight() {
  if (!_active) return 1;
  const w = findChip(_active.chip.id)?.chip.weight;
  return Number.isFinite(w) ? w : 1;
}
function applyWeightDelta(delta) {
  const ids = toolbarTargetIds();
  if (!ids.length) return;
  if (ids.length > 1) {
    dispatch({ type: "chip/batchAdjustWeight", chipIds: ids, delta });
  } else {
    const chip = findChip(ids[0])?.chip;
    if (!chip) return;
    dispatch({
      type: "chip/update",
      chipId: chip.id,
      patch: { weight: clamp(Math.round((chip.weight + delta) * 10) / 10, 0.1, 5) }
    });
  }
  if (_active) rebindActiveAfterRender(_active.chip.id);
}
function commitWeightValue(raw) {
  const ids = toolbarTargetIds();
  if (!ids.length) return;
  const n = parseFloat(raw.trim());
  if (!Number.isFinite(n)) return;
  const weight = clamp(Math.round(n * 10) / 10, 0.1, 5);
  if (ids.length > 1) {
    dispatch({ type: "chip/batchUpdate", chipIds: ids, patch: { weight } });
  } else {
    const chip = findChip(ids[0])?.chip;
    if (!chip || chip.weight === weight) {
    } else {
      dispatch({ type: "chip/update", chipId: chip.id, patch: { weight } });
    }
  }
  if (_active) rebindActiveAfterRender(_active.chip.id);
}
function onToolbarWeightWheel(e) {
  const t = e.target;
  if (!t.closest?.(".pb-tb-weight, .pb-tb-weight-input")) return;
  if (_weightEditing) return;
  e.preventDefault();
  e.stopPropagation();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  applyWeightDelta(delta);
}
function onToolbarWeightClick(e) {
  const btn = e.target.closest?.(".pb-tb-weight");
  if (!btn || _weightEditing) return;
  e.preventDefault();
  e.stopPropagation();
  beginWeightEdit(btn);
}
function beginWeightEdit(weightEl) {
  if (!_toolbar || _weightEditing) return;
  _weightEditing = true;
  if (_hideTimer) {
    clearTimeout(_hideTimer);
    _hideTimer = null;
  }
  const cur2 = activeChipWeight();
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "pb-tb-weight-input";
  inp.min = "0.1";
  inp.max = "5";
  inp.step = "0.1";
  inp.value = fmtWeight(cur2);
  inp.title = "\u6743\u91CD 0.1\u20135";
  weightEl.replaceWith(inp);
  inp.focus();
  inp.select();
  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    _weightEditing = false;
    if (commit) commitWeightValue(inp.value);
    if (_active && _toolbar?.classList.contains("pb-visible")) {
      const el = liveChipAnchor(_active.el, _active.chip.id) || _active.el;
      placeToolbar(el, findChip(_active.chip.id)?.chip ?? _active.chip);
    } else if (inp.isConnected) {
      const span2 = document.createElement("button");
      span2.type = "button";
      span2.className = "pb-tb-weight";
      span2.textContent = fmtWeight(activeChipWeight());
      span2.title = "\u6743\u91CD \xB7 \u70B9\u51FB\u7F16\u8F91 \xB7 \u6EDA\u8F6E\xB10.1";
      inp.replaceWith(span2);
    }
  };
  inp.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      finish(true);
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      finish(false);
    }
  });
  inp.addEventListener("blur", () => finish(true));
  inp.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const v = parseFloat(inp.value);
    const base = Number.isFinite(v) ? v : activeChipWeight();
    const delta = ev.deltaY < 0 ? 0.1 : -0.1;
    inp.value = fmtWeight(base + delta);
  }, { passive: false });
}
function findChipEl(chipId) {
  const esc = typeof CSS3 !== "undefined" && typeof CSS3.escape === "function" ? CSS3.escape(chipId) : chipId.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return document.querySelector(`.pb-chip[data-chip-id="${esc}"]`);
}
function liveChipAnchor(preferred, chipId) {
  if (preferred?.isConnected) {
    const r = preferred.getBoundingClientRect();
    if (r.width > 0 || r.height > 0) return preferred;
  }
  return findChipEl(chipId);
}
function rebindActiveAfterRender(chipId) {
  queueMicrotask(() => {
    if (!_active || _active.chip.id !== chipId) return;
    if (_weightEditing) return;
    const el = findChipEl(chipId);
    if (!el) return;
    const chip = findChip(chipId)?.chip ?? _active.chip;
    _active = { chip, box: _active.box, el };
    if (_toolbar?.classList.contains("pb-visible") && !_editPanel) {
      placeToolbar(el, chip);
    }
  });
}
function onToolbarPointerDown(e) {
  const t = e.target;
  if (t.closest(".pb-tb-weight, .pb-tb-weight-input")) return;
  e.preventDefault();
  e.stopPropagation();
  const act = t.closest("button")?.getAttribute("data-act");
  if (!act) return;
  const multi = getSelectedCount() > 1 && _active && isSelected(_active.chip.id);
  const ids = multi ? getSelectedIds() : _active ? [_active.chip.id] : [];
  if (!ids.length) return;
  if (act === "bypass") {
    if (ids.length > 1) {
      const anyOn = ids.some((id) => findChip(id)?.chip.enabled);
      dispatch({ type: "chip/batchUpdate", chipIds: ids, patch: { enabled: !anyOn } });
    } else {
      const chip = findChip(ids[0])?.chip;
      if (!chip) return;
      dispatch({ type: "chip/update", chipId: chip.id, patch: { enabled: !chip.enabled } });
    }
    if (_active) rebindActiveAfterRender(_active.chip.id);
    return;
  }
  if (act === "edit") {
    if (ids.length !== 1 || !_active) return;
    const chipId = _active.chip.id;
    const staleEl = _active.el;
    hideToolbar(true);
    const hit = findChip(chipId);
    if (!hit) return;
    openChipEdit(liveChipAnchor(staleEl, chipId), hit.chip);
    return;
  }
  if (act === "translate") {
    hideToolbar(true);
    if (ids.length > 1) void translateMany(ids);
    else {
      const chip = findChip(ids[0])?.chip;
      if (chip) void translateOneChip(chip);
    }
    return;
  }
  if (act === "delete") {
    hideToolbar(true);
    dispatch({ type: "chip/batchRemove", chipIds: ids });
    clearSelection();
  }
}
function fillToolbar(multi, count, weight) {
  if (_weightEditing) return;
  const tb = getToolbar();
  if (multi) {
    tb.innerHTML = `
      <span class="pb-tb-count">${count} \u9879</span>
      <button type="button" data-act="bypass" title="\u6279\u91CF\u542F\u7528/\u7981\u7528">\u{1F441}</button>
      <button type="button" data-act="translate" title="\u6279\u91CF\u5F3A\u5236\u7FFB\u8BD1">\u{1F310}</button>
      <button type="button" data-act="delete" title="\u6279\u91CF\u5220\u9664">\xD7</button>
    `;
  } else {
    const w = fmtWeight(weight);
    tb.innerHTML = `
      <button type="button" class="pb-tb-weight" title="\u6743\u91CD \xB7 \u70B9\u51FB\u7F16\u8F91 \xB7 \u6EDA\u8F6E\xB10.1">${w}</button>
      <button type="button" data-act="bypass" title="\u542F\u7528/\u7981\u7528">\u{1F441}</button>
      <button type="button" data-act="edit" title="\u7F16\u8F91\u4E2D\u82F1\u6587">\u270F\uFE0F</button>
      <button type="button" data-act="translate" title="\u7FFB\u8BD1\u6B64\u8BCD\uFF08\u5F3A\u5236\uFF09">\u{1F310}</button>
    `;
  }
}
function showToolbar(chipEl, chip, box) {
  if (window.__pb_dragging) return;
  if (_editPanel) return;
  if (_hideTimer) clearTimeout(_hideTimer);
  _hideTimer = null;
  _active = { chip, box, el: chipEl };
  if (_toolbar?.classList.contains("pb-visible")) {
    if (_showTimer) {
      clearTimeout(_showTimer);
      _showTimer = null;
    }
    placeToolbar(chipEl, chip);
    return;
  }
  if (_showTimer) clearTimeout(_showTimer);
  _showTimer = setTimeout(() => {
    _showTimer = null;
    if (window.__pb_dragging || _editPanel) return;
    if (!_active || _active.chip.id !== chip.id) return;
    const el = liveChipAnchor(_active.el, chip.id) || chipEl;
    _active = { chip, box, el };
    placeToolbar(el, chip);
  }, TOOLBAR_SHOW_DELAY_MS);
}
function placeToolbar(chipEl, chip) {
  const multi = getSelectedCount() > 1 && isSelected(chip.id);
  const liveW = findChip(chip.id)?.chip.weight ?? chip.weight;
  fillToolbar(multi, getSelectedCount(), liveW);
  const tb = getToolbar();
  const rect = chipEl.getBoundingClientRect();
  if (rect.width <= 0 && rect.height <= 0) return;
  const tw = multi ? 180 : 140;
  let left = rect.left + rect.width / 2 - tw / 2;
  let top = rect.top - 32;
  if (top < 0) top = rect.bottom + 4;
  if (left < 0) left = 4;
  if (left + tw > window.innerWidth) left = window.innerWidth - tw - 4;
  tb.style.left = left + "px";
  tb.style.top = top + "px";
  tb.classList.add("pb-visible");
}
function hideToolbar(immediate = false) {
  if (_weightEditing && !immediate) return;
  if (_showTimer) {
    clearTimeout(_showTimer);
    _showTimer = null;
  }
  const run = () => {
    if (_weightEditing) {
      _weightEditing = false;
    }
    _toolbar?.classList.remove("pb-visible");
    if (!_editPanel) _active = null;
  };
  if (immediate) {
    if (_hideTimer) clearTimeout(_hideTimer);
    _hideTimer = null;
    run();
    return;
  }
  if (_hideTimer) clearTimeout(_hideTimer);
  _hideTimer = setTimeout(run, 160);
}
function renderChip(chip, box) {
  ensureCss();
  const el = div("pb-chip");
  el.setAttribute("data-chip-id", chip.id);
  el.setAttribute("data-chip-text", chip.text);
  if (chip.cnText) el.setAttribute("data-chip-cn", chip.cnText);
  if (chip.categoryColor) el.style.setProperty("--pb-chip-color", chip.categoryColor);
  if (!chip.enabled) el.classList.add("pb-bypass");
  if (chip.translating) el.classList.add("pb-translating");
  if (isSelected(chip.id)) el.classList.add("pb-chip-selected");
  const top = div("pb-chip-top-row");
  const main = span("pb-chip-main");
  main.textContent = chip.text;
  const openEdit = (e) => {
    e.stopPropagation();
    openChipEdit(el, chip);
  };
  main.addEventListener("dblclick", openEdit);
  top.appendChild(main);
  if (chip.weight !== 1) {
    top.appendChild(span("pb-chip-weight", `\xB7${chip.weight}`));
  }
  el.appendChild(top);
  const del = document.createElement("button");
  del.type = "button";
  del.className = "pb-chip-del";
  del.textContent = "\xD7";
  del.addEventListener("pointerdown", (e) => e.stopPropagation());
  del.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (getSelectedCount() > 1 && isSelected(chip.id)) {
      dispatch({ type: "chip/batchRemove", chipIds: getSelectedIds() });
      clearSelection();
    } else {
      dispatch({ type: "chip/remove", boxId: box.id, chipId: chip.id });
    }
  });
  el.appendChild(del);
  if (chip.cnText) {
    const sub = span("pb-chip-sub");
    sub.textContent = chip.cnText;
    sub.addEventListener("dblclick", openEdit);
    el.appendChild(sub);
  }
  el.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    e.stopPropagation();
    if (e.shiftKey) selectRangeTo(chip.id);
    else if (e.ctrlKey || e.metaKey) toggleSelect(chip.id);
    else selectOnly(chip.id);
  });
  el.addEventListener("pointerenter", () => showToolbar(el, chip, box));
  el.addEventListener("pointerleave", () => hideToolbar());
  return el;
}
function openChipEdit(anchor, chip) {
  closeChipEdit();
  ensureCss();
  const live = findChip(chip.id)?.chip ?? chip;
  const panel = div("pb-chip-edit-panel");
  panel.innerHTML = `
    <label>\u82F1\u6587 / \u4E3B\u6587\u672C
      <textarea class="pb-ce-en" rows="2">${escapeHtml(live.text)}</textarea>
    </label>
    <label>\u4E2D\u6587
      <textarea class="pb-ce-cn" rows="2">${escapeHtml(live.cnText || "")}</textarea>
    </label>
    <div class="pb-chip-edit-actions">
      <button type="button" data-act="cancel">\u53D6\u6D88</button>
      <button type="button" class="primary" data-act="save">\u4FDD\u5B58</button>
    </div>
  `;
  document.body.appendChild(panel);
  _editPanel = panel;
  const panelW = Math.min(240, Math.floor(window.innerWidth * 0.92));
  panel.style.width = panelW + "px";
  const el = liveChipAnchor(anchor, live.id);
  const rect = el?.getBoundingClientRect();
  let left;
  let top;
  if (rect && (rect.width > 0 || rect.height > 0)) {
    left = rect.left;
    top = rect.bottom + 6;
    if (left + panelW > window.innerWidth) left = window.innerWidth - panelW - 8;
    if (top + 180 > window.innerHeight) top = Math.max(8, rect.top - 180);
    left = Math.max(8, left);
  } else {
    left = Math.max(8, Math.floor((window.innerWidth - panelW) / 2));
    top = Math.max(8, Math.floor(window.innerHeight * 0.18));
  }
  panel.style.left = left + "px";
  panel.style.top = top + "px";
  const en = panel.querySelector(".pb-ce-en");
  const cn = panel.querySelector(".pb-ce-cn");
  const autosize = (ta) => {
    ta.style.width = "100%";
    ta.style.height = "0";
    ta.style.overflowY = "hidden";
    void ta.offsetWidth;
    const sh = ta.scrollHeight;
    const next = Math.min(160, Math.max(36, sh));
    ta.style.height = next + "px";
    ta.style.overflowY = sh > 160 ? "auto" : "hidden";
  };
  requestAnimationFrame(() => {
    autosize(en);
    autosize(cn);
  });
  en.addEventListener("input", () => autosize(en));
  cn.addEventListener("input", () => autosize(cn));
  en.focus();
  en.select();
  const save2 = (mode = "explicit") => {
    let text = en.value.replace(/^\s+|\s+$/g, "");
    const cnText = cn.value.replace(/^\s+|\s+$/g, "");
    const base = live;
    if (!text) {
      if (mode === "blur") {
        text = base.text;
      } else {
        toast("\u82F1\u6587\u4E0D\u80FD\u4E3A\u7A7A", "warn");
        return;
      }
    }
    const patch = {};
    if (text !== base.text) patch.text = text;
    if (cnText !== (base.cnText || "")) patch.cnText = cnText;
    if (Object.keys(patch).length) {
      dispatch({ type: "chip/update", chipId: base.id, patch });
    }
    closeChipEdit();
  };
  _editCommit = save2;
  panel.querySelector('[data-act="save"]')?.addEventListener("click", () => save2("explicit"));
  panel.querySelector('[data-act="cancel"]')?.addEventListener("click", () => closeChipEdit());
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeChipEdit();
      return;
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      save2("explicit");
    }
  });
  setTimeout(() => {
    document.addEventListener("pointerdown", onChipEditOutside, true);
  }, 0);
}
function onChipEditOutside(e) {
  if (!_editPanel || _editPanel.contains(e.target)) return;
  _editCommit?.("blur");
}
function closeChipEdit() {
  document.removeEventListener("pointerdown", onChipEditOutside, true);
  _editCommit = null;
  _editPanel?.remove();
  _editPanel = null;
}
function commitAfterTranslate(before, ok) {
  if (ok) {
    recordUndoSnapshot(before);
    updateUndoButtons();
  }
  dispatch(
    {
      type: "workspace/replace",
      workspace: cur.workspace,
      negativeGroup: cur.negativeGroup,
      focusedBox: cur.focusedBox
    },
    { noUndo: true }
  );
}
async function translateOneChip(chip) {
  if (!chip.text.trim()) {
    toast("\u65E0\u53EF\u7FFB\u8BD1\u6587\u672C", "warn");
    return;
  }
  const before = cloneUndoSnapshot();
  dispatch({ type: "chip/update", chipId: chip.id, patch: { translating: true } }, { noUndo: true });
  const { translateChips: translateChips2 } = await Promise.resolve().then(() => (init_translation(), translation_exports));
  const { ok } = await translateChips2([chip], { force: true });
  if (!ok) {
    dispatch({ type: "chip/update", chipId: chip.id, patch: { translating: false } }, { noUndo: true });
    return;
  }
  recordUndoSnapshot(before);
  updateUndoButtons();
  dispatch({
    type: "chip/update",
    chipId: chip.id,
    patch: { text: chip.text, cnText: chip.cnText, translating: false }
  }, { noUndo: true });
}
async function translateMany(ids) {
  const chips = [];
  for (const id of ids) {
    const hit = findChip(id);
    if (hit?.chip.text.trim()) chips.push(hit.chip);
  }
  if (!chips.length) {
    toast("\u65E0\u53EF\u7FFB\u8BD1\u6587\u672C", "warn");
    return;
  }
  const before = cloneUndoSnapshot();
  for (const c of chips) c.translating = true;
  dispatch(
    {
      type: "workspace/replace",
      workspace: cur.workspace,
      negativeGroup: cur.negativeGroup,
      focusedBox: cur.focusedBox
    },
    { noUndo: true }
  );
  const { translateChips: translateChips2 } = await Promise.resolve().then(() => (init_translation(), translation_exports));
  const { ok } = await translateChips2(chips, { force: true });
  commitAfterTranslate(before, ok > 0);
}

// node_modules/sortablejs/modular/sortable.esm.js
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o, r, i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
var version = "1.15.7";
function userAgent(pattern) {
  if (typeof window !== "undefined" && window.navigator) {
    return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
  }
}
var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
var Edge = userAgent(/Edge/i);
var FireFox = userAgent(/firefox/i);
var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
var IOS = userAgent(/iP(ad|od|hone)/i);
var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
var captureMode = {
  capture: false,
  passive: false
};
function on(el, event, fn) {
  el.addEventListener(event, fn, !IE11OrLess && captureMode);
}
function off(el, event, fn) {
  el.removeEventListener(event, fn, !IE11OrLess && captureMode);
}
function matches(el, selector) {
  if (!selector) return;
  selector[0] === ">" && (selector = selector.substring(1));
  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (_) {
      return false;
    }
  }
  return false;
}
function getParentOrHost(el) {
  return el.host && el !== document && el.host.nodeType && el.host !== el ? el.host : el.parentNode;
}
function closest(el, selector, ctx, includeCTX) {
  if (el) {
    ctx = ctx || document;
    do {
      if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
        return el;
      }
      if (el === ctx) break;
    } while (el = getParentOrHost(el));
  }
  return null;
}
var R_SPACE = /\s+/g;
function toggleClass(el, name, state2) {
  if (el && name) {
    if (el.classList) {
      el.classList[state2 ? "add" : "remove"](name);
    } else {
      var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
      el.className = (className + (state2 ? " " + name : "")).replace(R_SPACE, " ");
    }
  }
}
function css(el, prop, val) {
  var style = el && el.style;
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, "");
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }
      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style) && prop.indexOf("webkit") === -1) {
        prop = "-webkit-" + prop;
      }
      style[prop] = val + (typeof val === "string" ? "" : "px");
    }
  }
}
function matrix(el, selfOnly) {
  var appliedTransforms = "";
  if (typeof el === "string") {
    appliedTransforms = el;
  } else {
    do {
      var transform = css(el, "transform");
      if (transform && transform !== "none") {
        appliedTransforms = transform + " " + appliedTransforms;
      }
    } while (!selfOnly && (el = el.parentNode));
  }
  var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return matrixFn && new matrixFn(appliedTransforms);
}
function find(ctx, tagName, iterator) {
  if (ctx) {
    var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
    if (iterator) {
      for (; i < n; i++) {
        iterator(list[i], i);
      }
    }
    return list;
  }
  return [];
}
function getWindowScrollingElement() {
  var scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    return scrollingElement;
  } else {
    return document.documentElement;
  }
}
function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
  if (!el.getBoundingClientRect && el !== window) return;
  var elRect, top, left, bottom, right, height, width;
  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect();
    top = elRect.top;
    left = elRect.left;
    bottom = elRect.bottom;
    right = elRect.right;
    height = elRect.height;
    width = elRect.width;
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }
  if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
    container = container || el.parentNode;
    if (!IE11OrLess) {
      do {
        if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
          var containerRect = container.getBoundingClientRect();
          top -= containerRect.top + parseInt(css(container, "border-top-width"));
          left -= containerRect.left + parseInt(css(container, "border-left-width"));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
      } while (container = container.parentNode);
    }
  }
  if (undoScale && el !== window) {
    var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
    if (elMatrix) {
      top /= scaleY;
      left /= scaleX;
      width /= scaleX;
      height /= scaleY;
      bottom = top + height;
      right = left + width;
    }
  }
  return {
    top,
    left,
    bottom,
    right,
    width,
    height
  };
}
function isScrolledPast(el, elSide, parentSide) {
  var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
  while (parent) {
    var parentSideVal = getRect(parent)[parentSide], visible = void 0;
    if (parentSide === "top" || parentSide === "left") {
      visible = elSideVal >= parentSideVal;
    } else {
      visible = elSideVal <= parentSideVal;
    }
    if (!visible) return parent;
    if (parent === getWindowScrollingElement()) break;
    parent = getParentAutoScrollElement(parent, false);
  }
  return false;
}
function getChild(el, childNum, options, includeDragEl) {
  var currentChild = 0, i = 0, children = el.children;
  while (i < children.length) {
    if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
      if (currentChild === childNum) {
        return children[i];
      }
      currentChild++;
    }
    i++;
  }
  return null;
}
function lastChild(el, selector) {
  var last = el.lastElementChild;
  while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
    last = last.previousElementSibling;
  }
  return last || null;
}
function index(el, selector) {
  var index2 = 0;
  if (!el || !el.parentNode) {
    return -1;
  }
  while (el = el.previousElementSibling) {
    if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
      index2++;
    }
  }
  return index2;
}
function getRelativeScrollOffset(el) {
  var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
  if (el) {
    do {
      var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
      offsetLeft += el.scrollLeft * scaleX;
      offsetTop += el.scrollTop * scaleY;
    } while (el !== winScroller && (el = el.parentNode));
  }
  return [offsetLeft, offsetTop];
}
function indexOfObject(arr, obj) {
  for (var i in arr) {
    if (!arr.hasOwnProperty(i)) continue;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
    }
  }
  return -1;
}
function getParentAutoScrollElement(el, includeSelf) {
  if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
  var elem = el;
  var gotSelf = false;
  do {
    if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
      var elemCSS = css(elem);
      if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
        if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
        if (gotSelf || includeSelf) return elem;
        gotSelf = true;
      }
    }
  } while (elem = elem.parentNode);
  return getWindowScrollingElement();
}
function extend(dst, src) {
  if (dst && src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dst[key] = src[key];
      }
    }
  }
  return dst;
}
function isRectEqual(rect1, rect2) {
  return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
}
var _throttleTimeout;
function throttle(callback, ms) {
  return function() {
    if (!_throttleTimeout) {
      var args = arguments, _this = this;
      if (args.length === 1) {
        callback.call(_this, args[0]);
      } else {
        callback.apply(_this, args);
      }
      _throttleTimeout = setTimeout(function() {
        _throttleTimeout = void 0;
      }, ms);
    }
  };
}
function cancelThrottle() {
  clearTimeout(_throttleTimeout);
  _throttleTimeout = void 0;
}
function scrollBy(el, x, y) {
  el.scrollLeft += x;
  el.scrollTop += y;
}
function clone(el) {
  var Polymer = window.Polymer;
  var $2 = window.jQuery || window.Zepto;
  if (Polymer && Polymer.dom) {
    return Polymer.dom(el).cloneNode(true);
  } else if ($2) {
    return $2(el).clone(true)[0];
  } else {
    return el.cloneNode(true);
  }
}
function getChildContainingRectFromElement(container, options, ghostEl2) {
  var rect = {};
  Array.from(container.children).forEach(function(child) {
    var _rect$left, _rect$top, _rect$right, _rect$bottom;
    if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2) return;
    var childRect = getRect(child);
    rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
    rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
    rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
    rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
  });
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function AnimationStateManager() {
  var animationStates = [], animationCallbackId;
  return {
    captureAnimationState: function captureAnimationState() {
      animationStates = [];
      if (!this.options.animation) return;
      var children = [].slice.call(this.el.children);
      children.forEach(function(child) {
        if (css(child, "display") === "none" || child === Sortable.ghost) return;
        animationStates.push({
          target: child,
          rect: getRect(child)
        });
        var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
        if (child.thisAnimationDuration) {
          var childMatrix = matrix(child, true);
          if (childMatrix) {
            fromRect.top -= childMatrix.f;
            fromRect.left -= childMatrix.e;
          }
        }
        child.fromRect = fromRect;
      });
    },
    addAnimationState: function addAnimationState(state2) {
      animationStates.push(state2);
    },
    removeAnimationState: function removeAnimationState(target) {
      animationStates.splice(indexOfObject(animationStates, {
        target
      }), 1);
    },
    animateAll: function animateAll(callback) {
      var _this = this;
      if (!this.options.animation) {
        clearTimeout(animationCallbackId);
        if (typeof callback === "function") callback();
        return;
      }
      var animating = false, animationTime = 0;
      animationStates.forEach(function(state2) {
        var time = 0, target = state2.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state2.rect, targetMatrix = matrix(target, true);
        if (targetMatrix) {
          toRect.top -= targetMatrix.f;
          toRect.left -= targetMatrix.e;
        }
        target.toRect = toRect;
        if (target.thisAnimationDuration) {
          if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
          (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
            time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
          }
        }
        if (!isRectEqual(toRect, fromRect)) {
          target.prevFromRect = fromRect;
          target.prevToRect = toRect;
          if (!time) {
            time = _this.options.animation;
          }
          _this.animate(target, animatingRect, toRect, time);
        }
        if (time) {
          animating = true;
          animationTime = Math.max(animationTime, time);
          clearTimeout(target.animationResetTimer);
          target.animationResetTimer = setTimeout(function() {
            target.animationTime = 0;
            target.prevFromRect = null;
            target.fromRect = null;
            target.prevToRect = null;
            target.thisAnimationDuration = null;
          }, time);
          target.thisAnimationDuration = time;
        }
      });
      clearTimeout(animationCallbackId);
      if (!animating) {
        if (typeof callback === "function") callback();
      } else {
        animationCallbackId = setTimeout(function() {
          if (typeof callback === "function") callback();
        }, animationTime);
      }
      animationStates = [];
    },
    animate: function animate(target, currentRect, toRect, duration) {
      if (duration) {
        css(target, "transition", "");
        css(target, "transform", "");
        var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
        target.animatingX = !!translateX;
        target.animatingY = !!translateY;
        css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
        this.forRepaintDummy = repaint(target);
        css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
        css(target, "transform", "translate3d(0,0,0)");
        typeof target.animated === "number" && clearTimeout(target.animated);
        target.animated = setTimeout(function() {
          css(target, "transition", "");
          css(target, "transform", "");
          target.animated = false;
          target.animatingX = false;
          target.animatingY = false;
        }, duration);
      }
    }
  };
}
function repaint(target) {
  return target.offsetWidth;
}
function calculateRealTime(animatingRect, fromRect, toRect, options) {
  return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
}
var plugins = [];
var defaults = {
  initializeByDefault: true
};
var PluginManager = {
  mount: function mount(plugin) {
    for (var option2 in defaults) {
      if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
        plugin[option2] = defaults[option2];
      }
    }
    plugins.forEach(function(p) {
      if (p.pluginName === plugin.pluginName) {
        throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
      }
    });
    plugins.push(plugin);
  },
  pluginEvent: function pluginEvent(eventName, sortable, evt) {
    var _this = this;
    this.eventCanceled = false;
    evt.cancel = function() {
      _this.eventCanceled = true;
    };
    var eventNameGlobal = eventName + "Global";
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName]) return;
      if (sortable[plugin.pluginName][eventNameGlobal]) {
        sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
          sortable
        }, evt));
      }
      if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
        sortable[plugin.pluginName][eventName](_objectSpread2({
          sortable
        }, evt));
      }
    });
  },
  initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
    plugins.forEach(function(plugin) {
      var pluginName = plugin.pluginName;
      if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
      var initialized = new plugin(sortable, el, sortable.options);
      initialized.sortable = sortable;
      initialized.options = sortable.options;
      sortable[pluginName] = initialized;
      _extends(defaults2, initialized.defaults);
    });
    for (var option2 in sortable.options) {
      if (!sortable.options.hasOwnProperty(option2)) continue;
      var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
      if (typeof modified !== "undefined") {
        sortable.options[option2] = modified;
      }
    }
  },
  getEventProperties: function getEventProperties(name, sortable) {
    var eventProperties = {};
    plugins.forEach(function(plugin) {
      if (typeof plugin.eventProperties !== "function") return;
      _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
    });
    return eventProperties;
  },
  modifyOption: function modifyOption(sortable, name, value) {
    var modifiedValue;
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName]) return;
      if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
        modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
      }
    });
    return modifiedValue;
  }
};
function dispatchEvent(_ref) {
  var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
  sortable = sortable || rootEl2 && rootEl2[expando];
  if (!sortable) return;
  var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent(name, {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent(name, true, true);
  }
  evt.to = toEl || rootEl2;
  evt.from = fromEl || rootEl2;
  evt.item = targetEl || rootEl2;
  evt.clone = cloneEl2;
  evt.oldIndex = oldIndex2;
  evt.newIndex = newIndex2;
  evt.oldDraggableIndex = oldDraggableIndex2;
  evt.newDraggableIndex = newDraggableIndex2;
  evt.originalEvent = originalEvent;
  evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
  var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
  for (var option2 in allEventProperties) {
    evt[option2] = allEventProperties[option2];
  }
  if (rootEl2) {
    rootEl2.dispatchEvent(evt);
  }
  if (options[onName]) {
    options[onName].call(sortable, evt);
  }
}
var _excluded = ["evt"];
var pluginEvent2 = function pluginEvent3(eventName, sortable) {
  var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
  PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
    dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    dragStarted: moved,
    putSortable,
    activeSortable: Sortable.active,
    originalEvent,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex,
    hideGhostForTarget: _hideGhostForTarget,
    unhideGhostForTarget: _unhideGhostForTarget,
    cloneNowHidden: function cloneNowHidden() {
      cloneHidden = true;
    },
    cloneNowShown: function cloneNowShown() {
      cloneHidden = false;
    },
    dispatchSortableEvent: function dispatchSortableEvent(name) {
      _dispatchEvent({
        sortable,
        name,
        originalEvent
      });
    }
  }, data));
};
function _dispatchEvent(info) {
  dispatchEvent(_objectSpread2({
    putSortable,
    cloneEl,
    targetEl: dragEl,
    rootEl,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex
  }, info));
}
var dragEl;
var parentEl;
var ghostEl;
var rootEl;
var nextEl;
var lastDownEl;
var cloneEl;
var cloneHidden;
var oldIndex;
var newIndex;
var oldDraggableIndex;
var newDraggableIndex;
var activeGroup;
var putSortable;
var awaitingDragStarted = false;
var ignoreNextClick = false;
var sortables = [];
var tapEvt;
var touchEvt;
var lastDx;
var lastDy;
var tapDistanceLeft;
var tapDistanceTop;
var moved;
var lastTarget;
var lastDirection;
var pastFirstInvertThresh = false;
var isCircumstantialInvert = false;
var targetMoveDistance;
var ghostRelativeParent;
var ghostRelativeParentInitialScroll = [];
var _silent = false;
var savedInputChecked = [];
var documentExists = typeof document !== "undefined";
var PositionGhostAbsolutely = IOS;
var CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float";
var supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div");
var supportCssPointerEvents = (function() {
  if (!documentExists) return;
  if (IE11OrLess) {
    return false;
  }
  var el = document.createElement("x");
  el.style.cssText = "pointer-events:auto";
  return el.style.pointerEvents === "auto";
})();
var _detectDirection = function _detectDirection2(el, options) {
  var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
  if (elCSS.display === "flex") {
    return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  }
  if (elCSS.display === "grid") {
    return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  }
  if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
    var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
    return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
  }
  return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
};
var _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
  var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
  return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
};
var _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
  var ret;
  sortables.some(function(sortable) {
    var threshold = sortable[expando].options.emptyInsertThreshold;
    if (!threshold || lastChild(sortable)) return;
    var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
    if (insideHorizontally && insideVertically) {
      return ret = sortable;
    }
  });
  return ret;
};
var _prepareGroup = function _prepareGroup2(options) {
  function toFn(value, pull) {
    return function(to, from, dragEl2, evt) {
      var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
      if (value == null && (pull || sameGroup)) {
        return true;
      } else if (value == null || value === false) {
        return false;
      } else if (pull && value === "clone") {
        return value;
      } else if (typeof value === "function") {
        return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
      } else {
        var otherGroup = (pull ? to : from).options.group.name;
        return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
      }
    };
  }
  var group = {};
  var originalGroup = options.group;
  if (!originalGroup || _typeof(originalGroup) != "object") {
    originalGroup = {
      name: originalGroup
    };
  }
  group.name = originalGroup.name;
  group.checkPull = toFn(originalGroup.pull, true);
  group.checkPut = toFn(originalGroup.put);
  group.revertClone = originalGroup.revertClone;
  options.group = group;
};
var _hideGhostForTarget = function _hideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "none");
  }
};
var _unhideGhostForTarget = function _unhideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "");
  }
};
if (documentExists && !ChromeForAndroid) {
  document.addEventListener("click", function(evt) {
    if (ignoreNextClick) {
      evt.preventDefault();
      evt.stopPropagation && evt.stopPropagation();
      evt.stopImmediatePropagation && evt.stopImmediatePropagation();
      ignoreNextClick = false;
      return false;
    }
  }, true);
}
var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt;
    var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
    if (nearest) {
      var event = {};
      for (var i in evt) {
        if (evt.hasOwnProperty(i)) {
          event[i] = evt[i];
        }
      }
      event.target = event.rootEl = nearest;
      event.preventDefault = void 0;
      event.stopPropagation = void 0;
      nearest[expando]._onDragOver(event);
    }
  }
};
var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
  if (dragEl) {
    dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
  }
};
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
  }
  this.el = el;
  this.options = options = _extends({}, options);
  el[expando] = this;
  var defaults2 = {
    group: null,
    sort: true,
    disabled: false,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    // percentage; 0 <= x <= 1
    invertSwap: false,
    // invert always
    invertedSwapThreshold: null,
    // will be set to same as swapThreshold if default
    removeCloneOnHide: true,
    direction: function direction() {
      return _detectDirection(el, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: true,
    animation: 0,
    easing: null,
    setData: function setData(dataTransfer, dragEl2) {
      dataTransfer.setData("Text", dragEl2.textContent);
    },
    dropBubble: false,
    dragoverBubble: false,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: false,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: false,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: false,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
    supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && (!Safari || IOS),
    emptyInsertThreshold: 5
  };
  PluginManager.initializePlugins(this, el, defaults2);
  for (var name in defaults2) {
    !(name in options) && (options[name] = defaults2[name]);
  }
  _prepareGroup(options);
  for (var fn in this) {
    if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
      this[fn] = this[fn].bind(this);
    }
  }
  this.nativeDraggable = options.forceFallback ? false : supportDraggable;
  if (this.nativeDraggable) {
    this.options.touchStartThreshold = 1;
  }
  if (options.supportPointer) {
    on(el, "pointerdown", this._onTapStart);
  } else {
    on(el, "mousedown", this._onTapStart);
    on(el, "touchstart", this._onTapStart);
  }
  if (this.nativeDraggable) {
    on(el, "dragover", this);
    on(el, "dragenter", this);
  }
  sortables.push(this.el);
  options.store && options.store.get && this.sort(options.store.get(this) || []);
  _extends(this, AnimationStateManager());
}
Sortable.prototype = /** @lends Sortable.prototype */
{
  constructor: Sortable,
  _isOutsideThisEl: function _isOutsideThisEl(target) {
    if (!this.el.contains(target) && target !== this.el) {
      lastTarget = null;
    }
  },
  _getDirection: function _getDirection(evt, target) {
    return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
  },
  _onTapStart: function _onTapStart(evt) {
    if (!evt.cancelable) return;
    var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
    _saveInputCheckedState(el);
    if (dragEl) {
      return;
    }
    if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
      return;
    }
    if (originalTarget.isContentEditable) {
      return;
    }
    if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
      return;
    }
    target = closest(target, options.draggable, el, false);
    if (target && target.animated) {
      return;
    }
    if (lastDownEl === target) {
      return;
    }
    oldIndex = index(target);
    oldDraggableIndex = index(target, options.draggable);
    if (typeof filter === "function") {
      if (filter.call(this, evt, target, this)) {
        _dispatchEvent({
          sortable: _this,
          rootEl: originalTarget,
          name: "filter",
          targetEl: target,
          toEl: el,
          fromEl: el
        });
        pluginEvent2("filter", _this, {
          evt
        });
        preventOnFilter && evt.preventDefault();
        return;
      }
    } else if (filter) {
      filter = filter.split(",").some(function(criteria) {
        criteria = closest(originalTarget, criteria.trim(), el, false);
        if (criteria) {
          _dispatchEvent({
            sortable: _this,
            rootEl: criteria,
            name: "filter",
            targetEl: target,
            fromEl: el,
            toEl: el
          });
          pluginEvent2("filter", _this, {
            evt
          });
          return true;
        }
      });
      if (filter) {
        preventOnFilter && evt.preventDefault();
        return;
      }
    }
    if (options.handle && !closest(originalTarget, options.handle, el, false)) {
      return;
    }
    this._prepareDragStart(evt, touch, target);
  },
  _prepareDragStart: function _prepareDragStart(evt, touch, target) {
    var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
    if (target && !dragEl && target.parentNode === el) {
      var dragRect = getRect(target);
      rootEl = el;
      dragEl = target;
      parentEl = dragEl.parentNode;
      nextEl = dragEl.nextSibling;
      lastDownEl = target;
      activeGroup = options.group;
      Sortable.dragged = dragEl;
      tapEvt = {
        target: dragEl,
        clientX: (touch || evt).clientX,
        clientY: (touch || evt).clientY
      };
      tapDistanceLeft = tapEvt.clientX - dragRect.left;
      tapDistanceTop = tapEvt.clientY - dragRect.top;
      this._lastX = (touch || evt).clientX;
      this._lastY = (touch || evt).clientY;
      dragEl.style["will-change"] = "all";
      dragStartFn = function dragStartFn2() {
        pluginEvent2("delayEnded", _this, {
          evt
        });
        if (Sortable.eventCanceled) {
          _this._onDrop();
          return;
        }
        _this._disableDelayedDragEvents();
        if (!FireFox && _this.nativeDraggable) {
          dragEl.draggable = true;
        }
        _this._triggerDragStart(evt, touch);
        _dispatchEvent({
          sortable: _this,
          name: "choose",
          originalEvent: evt
        });
        toggleClass(dragEl, options.chosenClass, true);
      };
      options.ignore.split(",").forEach(function(criteria) {
        find(dragEl, criteria.trim(), _disableDraggable);
      });
      on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
      if (options.supportPointer) {
        on(ownerDocument, "pointerup", _this._onDrop);
        !this.nativeDraggable && on(ownerDocument, "pointercancel", _this._onDrop);
      } else {
        on(ownerDocument, "mouseup", _this._onDrop);
        on(ownerDocument, "touchend", _this._onDrop);
        on(ownerDocument, "touchcancel", _this._onDrop);
      }
      if (FireFox && this.nativeDraggable) {
        this.options.touchStartThreshold = 4;
        dragEl.draggable = true;
      }
      pluginEvent2("delayStart", this, {
        evt
      });
      if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        if (options.supportPointer) {
          on(ownerDocument, "pointerup", _this._disableDelayedDrag);
          on(ownerDocument, "pointercancel", _this._disableDelayedDrag);
        } else {
          on(ownerDocument, "mouseup", _this._disableDelayedDrag);
          on(ownerDocument, "touchend", _this._disableDelayedDrag);
          on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
        }
        on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
        on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
        options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
        _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
      } else {
        dragStartFn();
      }
    }
  },
  _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
    var touch = e.touches ? e.touches[0] : e;
    if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
      this._disableDelayedDrag();
    }
  },
  _disableDelayedDrag: function _disableDelayedDrag() {
    dragEl && _disableDraggable(dragEl);
    clearTimeout(this._dragStartTimer);
    this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function _disableDelayedDragEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._disableDelayedDrag);
    off(ownerDocument, "touchend", this._disableDelayedDrag);
    off(ownerDocument, "touchcancel", this._disableDelayedDrag);
    off(ownerDocument, "pointerup", this._disableDelayedDrag);
    off(ownerDocument, "pointercancel", this._disableDelayedDrag);
    off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function _triggerDragStart(evt, touch) {
    touch = touch || evt.pointerType == "touch" && evt;
    if (!this.nativeDraggable || touch) {
      if (this.options.supportPointer) {
        on(document, "pointermove", this._onTouchMove);
      } else if (touch) {
        on(document, "touchmove", this._onTouchMove);
      } else {
        on(document, "mousemove", this._onTouchMove);
      }
    } else {
      on(dragEl, "dragend", this);
      on(rootEl, "dragstart", this._onDragStart);
    }
    try {
      if (document.selection) {
        _nextTick(function() {
          document.selection.empty();
        });
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (err) {
    }
  },
  _dragStarted: function _dragStarted(fallback, evt) {
    awaitingDragStarted = false;
    if (rootEl && dragEl) {
      pluginEvent2("dragStarted", this, {
        evt
      });
      if (this.nativeDraggable) {
        on(document, "dragover", _checkOutsideTargetEl);
      }
      var options = this.options;
      !fallback && toggleClass(dragEl, options.dragClass, false);
      toggleClass(dragEl, options.ghostClass, true);
      Sortable.active = this;
      fallback && this._appendGhost();
      _dispatchEvent({
        sortable: this,
        name: "start",
        originalEvent: evt
      });
    } else {
      this._nulling();
    }
  },
  _emulateDragOver: function _emulateDragOver() {
    if (touchEvt) {
      this._lastX = touchEvt.clientX;
      this._lastY = touchEvt.clientY;
      _hideGhostForTarget();
      var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
      var parent = target;
      while (target && target.shadowRoot) {
        target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        if (target === parent) break;
        parent = target;
      }
      dragEl.parentNode[expando]._isOutsideThisEl(target);
      if (parent) {
        do {
          if (parent[expando]) {
            var inserted = void 0;
            inserted = parent[expando]._onDragOver({
              clientX: touchEvt.clientX,
              clientY: touchEvt.clientY,
              target,
              rootEl: parent
            });
            if (inserted && !this.options.dragoverBubble) {
              break;
            }
          }
          target = parent;
        } while (parent = getParentOrHost(parent));
      }
      _unhideGhostForTarget();
    }
  },
  _onTouchMove: function _onTouchMove(evt) {
    if (tapEvt) {
      var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
      if (!Sortable.active && !awaitingDragStarted) {
        if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
          return;
        }
        this._onDragStart(evt, true);
      }
      if (ghostEl) {
        if (ghostMatrix) {
          ghostMatrix.e += dx - (lastDx || 0);
          ghostMatrix.f += dy - (lastDy || 0);
        } else {
          ghostMatrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: dx,
            f: dy
          };
        }
        var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
        css(ghostEl, "webkitTransform", cssMatrix);
        css(ghostEl, "mozTransform", cssMatrix);
        css(ghostEl, "msTransform", cssMatrix);
        css(ghostEl, "transform", cssMatrix);
        lastDx = dx;
        lastDy = dy;
        touchEvt = touch;
      }
      evt.cancelable && evt.preventDefault();
    }
  },
  _appendGhost: function _appendGhost() {
    if (!ghostEl) {
      var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
      if (PositionGhostAbsolutely) {
        ghostRelativeParent = container;
        while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
          ghostRelativeParent = ghostRelativeParent.parentNode;
        }
        if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
          if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
          rect.top += ghostRelativeParent.scrollTop;
          rect.left += ghostRelativeParent.scrollLeft;
        } else {
          ghostRelativeParent = getWindowScrollingElement();
        }
        ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
      }
      ghostEl = dragEl.cloneNode(true);
      toggleClass(ghostEl, options.ghostClass, false);
      toggleClass(ghostEl, options.fallbackClass, true);
      toggleClass(ghostEl, options.dragClass, true);
      css(ghostEl, "transition", "");
      css(ghostEl, "transform", "");
      css(ghostEl, "box-sizing", "border-box");
      css(ghostEl, "margin", 0);
      css(ghostEl, "top", rect.top);
      css(ghostEl, "left", rect.left);
      css(ghostEl, "width", rect.width);
      css(ghostEl, "height", rect.height);
      css(ghostEl, "opacity", "0.8");
      css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
      css(ghostEl, "zIndex", "100000");
      css(ghostEl, "pointerEvents", "none");
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);
      css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
    }
  },
  _onDragStart: function _onDragStart(evt, fallback) {
    var _this = this;
    var dataTransfer = evt.dataTransfer;
    var options = _this.options;
    pluginEvent2("dragStart", this, {
      evt
    });
    if (Sortable.eventCanceled) {
      this._onDrop();
      return;
    }
    pluginEvent2("setupClone", this);
    if (!Sortable.eventCanceled) {
      cloneEl = clone(dragEl);
      cloneEl.removeAttribute("id");
      cloneEl.draggable = false;
      cloneEl.style["will-change"] = "";
      this._hideClone();
      toggleClass(cloneEl, this.options.chosenClass, false);
      Sortable.clone = cloneEl;
    }
    _this.cloneId = _nextTick(function() {
      pluginEvent2("clone", _this);
      if (Sortable.eventCanceled) return;
      if (!_this.options.removeCloneOnHide) {
        rootEl.insertBefore(cloneEl, dragEl);
      }
      _this._hideClone();
      _dispatchEvent({
        sortable: _this,
        name: "clone"
      });
    });
    !fallback && toggleClass(dragEl, options.dragClass, true);
    if (fallback) {
      ignoreNextClick = true;
      _this._loopId = setInterval(_this._emulateDragOver, 50);
    } else {
      off(document, "mouseup", _this._onDrop);
      off(document, "touchend", _this._onDrop);
      off(document, "touchcancel", _this._onDrop);
      if (dataTransfer) {
        dataTransfer.effectAllowed = "move";
        options.setData && options.setData.call(_this, dataTransfer, dragEl);
      }
      on(document, "drop", _this);
      css(dragEl, "transform", "translateZ(0)");
    }
    awaitingDragStarted = true;
    _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
    on(document, "selectstart", _this);
    moved = true;
    window.getSelection().removeAllRanges();
    if (Safari) {
      css(document.body, "user-select", "none");
    }
  },
  // Returns true - if no further action is needed (either inserted or another condition)
  _onDragOver: function _onDragOver(evt) {
    var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
    if (_silent) return;
    function dragOverEvent(name, extra) {
      pluginEvent2(name, _this, _objectSpread2({
        evt,
        isOwner,
        axis: vertical ? "vertical" : "horizontal",
        revert,
        dragRect,
        targetRect,
        canSort,
        fromSortable,
        target,
        completed,
        onMove: function onMove(target2, after2) {
          return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
        },
        changed
      }, extra));
    }
    function capture() {
      dragOverEvent("dragOverAnimationCapture");
      _this.captureAnimationState();
      if (_this !== fromSortable) {
        fromSortable.captureAnimationState();
      }
    }
    function completed(insertion) {
      dragOverEvent("dragOverCompleted", {
        insertion
      });
      if (insertion) {
        if (isOwner) {
          activeSortable._hideClone();
        } else {
          activeSortable._showClone(_this);
        }
        if (_this !== fromSortable) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
          toggleClass(dragEl, options.ghostClass, true);
        }
        if (putSortable !== _this && _this !== Sortable.active) {
          putSortable = _this;
        } else if (_this === Sortable.active && putSortable) {
          putSortable = null;
        }
        if (fromSortable === _this) {
          _this._ignoreWhileAnimating = target;
        }
        _this.animateAll(function() {
          dragOverEvent("dragOverAnimationComplete");
          _this._ignoreWhileAnimating = null;
        });
        if (_this !== fromSortable) {
          fromSortable.animateAll();
          fromSortable._ignoreWhileAnimating = null;
        }
      }
      if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
        lastTarget = null;
      }
      if (!options.dragoverBubble && !evt.rootEl && target !== document) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
        !insertion && nearestEmptyInsertDetectEvent(evt);
      }
      !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
      return completedFired = true;
    }
    function changed() {
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      _dispatchEvent({
        sortable: _this,
        name: "change",
        toEl: el,
        newIndex,
        newDraggableIndex,
        originalEvent: evt
      });
    }
    if (evt.preventDefault !== void 0) {
      evt.cancelable && evt.preventDefault();
    }
    target = closest(target, options.draggable, el, true);
    dragOverEvent("dragOver");
    if (Sortable.eventCanceled) return completedFired;
    if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
      return completed(false);
    }
    ignoreNextClick = false;
    if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
      vertical = this._getDirection(evt, target) === "vertical";
      dragRect = getRect(dragEl);
      dragOverEvent("dragOverValid");
      if (Sortable.eventCanceled) return completedFired;
      if (revert) {
        parentEl = rootEl;
        capture();
        this._hideClone();
        dragOverEvent("revert");
        if (!Sortable.eventCanceled) {
          if (nextEl) {
            rootEl.insertBefore(dragEl, nextEl);
          } else {
            rootEl.appendChild(dragEl);
          }
        }
        return completed(true);
      }
      var elLastChild = lastChild(el, options.draggable);
      if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
        if (elLastChild === dragEl) {
          return completed(false);
        }
        if (elLastChild && el === evt.target) {
          target = elLastChild;
        }
        if (target) {
          targetRect = getRect(target);
        }
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
          capture();
          if (elLastChild && elLastChild.nextSibling) {
            el.insertBefore(dragEl, elLastChild.nextSibling);
          } else {
            el.appendChild(dragEl);
          }
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
        var firstChild = getChild(el, 0, options, true);
        if (firstChild === dragEl) {
          return completed(false);
        }
        target = firstChild;
        targetRect = getRect(target);
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
          capture();
          el.insertBefore(dragEl, firstChild);
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (target.parentNode === el) {
        targetRect = getRect(target);
        var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
        if (lastTarget !== target) {
          targetBeforeFirstSwap = targetRect[side1];
          pastFirstInvertThresh = false;
          isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
        }
        direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
        var sibling;
        if (direction !== 0) {
          var dragIndex = index(dragEl);
          do {
            dragIndex -= direction;
            sibling = parentEl.children[dragIndex];
          } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
        }
        if (direction === 0 || sibling === target) {
          return completed(false);
        }
        lastTarget = target;
        lastDirection = direction;
        var nextSibling = target.nextElementSibling, after = false;
        after = direction === 1;
        var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
        if (moveVector !== false) {
          if (moveVector === 1 || moveVector === -1) {
            after = moveVector === 1;
          }
          _silent = true;
          setTimeout(_unsilent, 30);
          capture();
          if (after && !nextSibling) {
            el.appendChild(dragEl);
          } else {
            target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
          }
          if (scrolledPastTop) {
            scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
          }
          parentEl = dragEl.parentNode;
          if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
            targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
          }
          changed();
          return completed(true);
        }
      }
      if (el.contains(dragEl)) {
        return completed(false);
      }
    }
    return false;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function _offMoveEvents() {
    off(document, "mousemove", this._onTouchMove);
    off(document, "touchmove", this._onTouchMove);
    off(document, "pointermove", this._onTouchMove);
    off(document, "dragover", nearestEmptyInsertDetectEvent);
    off(document, "mousemove", nearestEmptyInsertDetectEvent);
    off(document, "touchmove", nearestEmptyInsertDetectEvent);
  },
  _offUpEvents: function _offUpEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._onDrop);
    off(ownerDocument, "touchend", this._onDrop);
    off(ownerDocument, "pointerup", this._onDrop);
    off(ownerDocument, "pointercancel", this._onDrop);
    off(ownerDocument, "touchcancel", this._onDrop);
    off(document, "selectstart", this);
  },
  _onDrop: function _onDrop(evt) {
    var el = this.el, options = this.options;
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    pluginEvent2("drop", this, {
      evt
    });
    parentEl = dragEl && dragEl.parentNode;
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    if (Sortable.eventCanceled) {
      this._nulling();
      return;
    }
    awaitingDragStarted = false;
    isCircumstantialInvert = false;
    pastFirstInvertThresh = false;
    clearInterval(this._loopId);
    clearTimeout(this._dragStartTimer);
    _cancelNextTick(this.cloneId);
    _cancelNextTick(this._dragStartId);
    if (this.nativeDraggable) {
      off(document, "drop", this);
      off(el, "dragstart", this._onDragStart);
    }
    this._offMoveEvents();
    this._offUpEvents();
    if (Safari) {
      css(document.body, "user-select", "");
    }
    css(dragEl, "transform", "");
    if (evt) {
      if (moved) {
        evt.cancelable && evt.preventDefault();
        !options.dropBubble && evt.stopPropagation();
      }
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      if (dragEl) {
        if (this.nativeDraggable) {
          off(dragEl, "dragend", this);
        }
        _disableDraggable(dragEl);
        dragEl.style["will-change"] = "";
        if (moved && !awaitingDragStarted) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
        }
        toggleClass(dragEl, this.options.chosenClass, false);
        _dispatchEvent({
          sortable: this,
          name: "unchoose",
          toEl: parentEl,
          newIndex: null,
          newDraggableIndex: null,
          originalEvent: evt
        });
        if (rootEl !== parentEl) {
          if (newIndex >= 0) {
            _dispatchEvent({
              rootEl: parentEl,
              name: "add",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "remove",
              toEl: parentEl,
              originalEvent: evt
            });
            _dispatchEvent({
              rootEl: parentEl,
              name: "sort",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "sort",
              toEl: parentEl,
              originalEvent: evt
            });
          }
          putSortable && putSortable.save();
        } else {
          if (newIndex !== oldIndex) {
            if (newIndex >= 0) {
              _dispatchEvent({
                sortable: this,
                name: "update",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
          }
        }
        if (Sortable.active) {
          if (newIndex == null || newIndex === -1) {
            newIndex = oldIndex;
            newDraggableIndex = oldDraggableIndex;
          }
          _dispatchEvent({
            sortable: this,
            name: "end",
            toEl: parentEl,
            originalEvent: evt
          });
          this.save();
        }
      }
    }
    this._nulling();
  },
  _nulling: function _nulling() {
    pluginEvent2("nulling", this);
    rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
    var el = this.el;
    savedInputChecked.forEach(function(checkEl) {
      if (el.contains(checkEl)) {
        checkEl.checked = true;
      }
    });
    savedInputChecked.length = lastDx = lastDy = 0;
  },
  handleEvent: function handleEvent(evt) {
    switch (evt.type) {
      case "drop":
      case "dragend":
        this._onDrop(evt);
        break;
      case "dragenter":
      case "dragover":
        if (dragEl) {
          this._onDragOver(evt);
          _globalDragOver(evt);
        }
        break;
      case "selectstart":
        evt.preventDefault();
        break;
    }
  },
  /**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
  toArray: function toArray() {
    var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
    for (; i < n; i++) {
      el = children[i];
      if (closest(el, options.draggable, this.el, false)) {
        order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
      }
    }
    return order;
  },
  /**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
  sort: function sort(order, useAnimation) {
    var items = {}, rootEl2 = this.el;
    this.toArray().forEach(function(id, i) {
      var el = rootEl2.children[i];
      if (closest(el, this.options.draggable, rootEl2, false)) {
        items[id] = el;
      }
    }, this);
    useAnimation && this.captureAnimationState();
    order.forEach(function(id) {
      if (items[id]) {
        rootEl2.removeChild(items[id]);
        rootEl2.appendChild(items[id]);
      }
    });
    useAnimation && this.animateAll();
  },
  /**
   * Save the current sorting
   */
  save: function save() {
    var store = this.options.store;
    store && store.set && store.set(this);
  },
  /**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
  closest: function closest$1(el, selector) {
    return closest(el, selector || this.options.draggable, this.el, false);
  },
  /**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
  option: function option(name, value) {
    var options = this.options;
    if (value === void 0) {
      return options[name];
    } else {
      var modifiedValue = PluginManager.modifyOption(this, name, value);
      if (typeof modifiedValue !== "undefined") {
        options[name] = modifiedValue;
      } else {
        options[name] = value;
      }
      if (name === "group") {
        _prepareGroup(options);
      }
    }
  },
  /**
   * Destroy
   */
  destroy: function destroy() {
    pluginEvent2("destroy", this);
    var el = this.el;
    el[expando] = null;
    off(el, "mousedown", this._onTapStart);
    off(el, "touchstart", this._onTapStart);
    off(el, "pointerdown", this._onTapStart);
    if (this.nativeDraggable) {
      off(el, "dragover", this);
      off(el, "dragenter", this);
    }
    Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
      el2.removeAttribute("draggable");
    });
    this._onDrop();
    this._disableDelayedDragEvents();
    sortables.splice(sortables.indexOf(this.el), 1);
    this.el = el = null;
  },
  _hideClone: function _hideClone() {
    if (!cloneHidden) {
      pluginEvent2("hideClone", this);
      if (Sortable.eventCanceled) return;
      css(cloneEl, "display", "none");
      if (this.options.removeCloneOnHide && cloneEl.parentNode) {
        cloneEl.parentNode.removeChild(cloneEl);
      }
      cloneHidden = true;
    }
  },
  _showClone: function _showClone(putSortable2) {
    if (putSortable2.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (cloneHidden) {
      pluginEvent2("showClone", this);
      if (Sortable.eventCanceled) return;
      if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
        rootEl.insertBefore(cloneEl, dragEl);
      } else if (nextEl) {
        rootEl.insertBefore(cloneEl, nextEl);
      } else {
        rootEl.appendChild(cloneEl);
      }
      if (this.options.group.revertClone) {
        this.animate(dragEl, cloneEl);
      }
      css(cloneEl, "display", "");
      cloneHidden = false;
    }
  }
};
function _globalDragOver(evt) {
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = "move";
  }
  evt.cancelable && evt.preventDefault();
}
function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
  var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent("move", {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent("move", true, true);
  }
  evt.to = toEl;
  evt.from = fromEl;
  evt.dragged = dragEl2;
  evt.draggedRect = dragRect;
  evt.related = targetEl || toEl;
  evt.relatedRect = targetRect || getRect(toEl);
  evt.willInsertAfter = willInsertAfter;
  evt.originalEvent = originalEvent;
  fromEl.dispatchEvent(evt);
  if (onMoveFn) {
    retVal = onMoveFn.call(sortable, evt, originalEvent);
  }
  return retVal;
}
function _disableDraggable(el) {
  el.draggable = false;
}
function _unsilent() {
  _silent = false;
}
function _ghostIsFirst(evt, vertical, sortable) {
  var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
  var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
  var spacer = 10;
  return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
}
function _ghostIsLast(evt, vertical, sortable) {
  var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
  var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
  var spacer = 10;
  return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
}
function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
  var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
  if (!invertSwap) {
    if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
      if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
        pastFirstInvertThresh = true;
      }
      if (!pastFirstInvertThresh) {
        if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
          return -lastDirection;
        }
      } else {
        invert = true;
      }
    } else {
      if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
        return _getInsertDirection(target);
      }
    }
  }
  invert = invert || invertSwap;
  if (invert) {
    if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
      return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
    }
  }
  return 0;
}
function _getInsertDirection(target) {
  if (index(dragEl) < index(target)) {
    return 1;
  } else {
    return -1;
  }
}
function _generateId(el) {
  var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
  while (i--) {
    sum += str.charCodeAt(i);
  }
  return sum.toString(36);
}
function _saveInputCheckedState(root) {
  savedInputChecked.length = 0;
  var inputs = root.getElementsByTagName("input");
  var idx = inputs.length;
  while (idx--) {
    var el = inputs[idx];
    el.checked && savedInputChecked.push(el);
  }
}
function _nextTick(fn) {
  return setTimeout(fn, 0);
}
function _cancelNextTick(id) {
  return clearTimeout(id);
}
if (documentExists) {
  on(document, "touchmove", function(evt) {
    if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
      evt.preventDefault();
    }
  });
}
Sortable.utils = {
  on,
  off,
  css,
  find,
  is: function is(el, selector) {
    return !!closest(el, selector, el, false);
  },
  extend,
  throttle,
  closest,
  toggleClass,
  clone,
  index,
  nextTick: _nextTick,
  cancelNextTick: _cancelNextTick,
  detectDirection: _detectDirection,
  getChild,
  expando
};
Sortable.get = function(element) {
  return element[expando];
};
Sortable.mount = function() {
  for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
    plugins2[_key] = arguments[_key];
  }
  if (plugins2[0].constructor === Array) plugins2 = plugins2[0];
  plugins2.forEach(function(plugin) {
    if (!plugin.prototype || !plugin.prototype.constructor) {
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
    }
    if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
    PluginManager.mount(plugin);
  });
};
Sortable.create = function(el, options) {
  return new Sortable(el, options);
};
Sortable.version = version;
var autoScrolls = [];
var scrollEl;
var scrollRootEl;
var scrolling = false;
var lastAutoScrollX;
var lastAutoScrollY;
var touchEvt$1;
var pointerElemChangedInterval;
function AutoScrollPlugin() {
  function AutoScroll() {
    this.defaults = {
      scroll: true,
      forceAutoScrollFallback: false,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: true
    };
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
  }
  AutoScroll.prototype = {
    dragStarted: function dragStarted(_ref) {
      var originalEvent = _ref.originalEvent;
      if (this.sortable.nativeDraggable) {
        on(document, "dragover", this._handleAutoScroll);
      } else {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._handleFallbackAutoScroll);
        } else if (originalEvent.touches) {
          on(document, "touchmove", this._handleFallbackAutoScroll);
        } else {
          on(document, "mousemove", this._handleFallbackAutoScroll);
        }
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref2) {
      var originalEvent = _ref2.originalEvent;
      if (!this.options.dragOverBubble && !originalEvent.rootEl) {
        this._handleAutoScroll(originalEvent);
      }
    },
    drop: function drop3() {
      if (this.sortable.nativeDraggable) {
        off(document, "dragover", this._handleAutoScroll);
      } else {
        off(document, "pointermove", this._handleFallbackAutoScroll);
        off(document, "touchmove", this._handleFallbackAutoScroll);
        off(document, "mousemove", this._handleFallbackAutoScroll);
      }
      clearPointerElemChangedInterval();
      clearAutoScrolls();
      cancelThrottle();
    },
    nulling: function nulling() {
      touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
      autoScrolls.length = 0;
    },
    _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
      this._handleAutoScroll(evt, true);
    },
    _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
      var _this = this;
      var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
      touchEvt$1 = evt;
      if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
        autoScroll(evt, this.options, elem, fallback);
        var ogElemScroller = getParentAutoScrollElement(elem, true);
        if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
          pointerElemChangedInterval && clearPointerElemChangedInterval();
          pointerElemChangedInterval = setInterval(function() {
            var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
            if (newElem !== ogElemScroller) {
              ogElemScroller = newElem;
              clearAutoScrolls();
            }
            autoScroll(evt, _this.options, newElem, fallback);
          }, 10);
          lastAutoScrollX = x;
          lastAutoScrollY = y;
        }
      } else {
        if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
          clearAutoScrolls();
          return;
        }
        autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
      }
    }
  };
  return _extends(AutoScroll, {
    pluginName: "scroll",
    initializeByDefault: true
  });
}
function clearAutoScrolls() {
  autoScrolls.forEach(function(autoScroll2) {
    clearInterval(autoScroll2.pid);
  });
  autoScrolls = [];
}
function clearPointerElemChangedInterval() {
  clearInterval(pointerElemChangedInterval);
}
var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
  if (!options.scroll) return;
  var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
  var scrollThisInstance = false, scrollCustomFn;
  if (scrollRootEl !== rootEl2) {
    scrollRootEl = rootEl2;
    clearAutoScrolls();
    scrollEl = options.scroll;
    scrollCustomFn = options.scrollFn;
    if (scrollEl === true) {
      scrollEl = getParentAutoScrollElement(rootEl2, true);
    }
  }
  var layersOut = 0;
  var currentParent = scrollEl;
  do {
    var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
    if (el === winScroller) {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
    } else {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
    }
    var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
    var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
    if (!autoScrolls[layersOut]) {
      for (var i = 0; i <= layersOut; i++) {
        if (!autoScrolls[i]) {
          autoScrolls[i] = {};
        }
      }
    }
    if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
      autoScrolls[layersOut].el = el;
      autoScrolls[layersOut].vx = vx;
      autoScrolls[layersOut].vy = vy;
      clearInterval(autoScrolls[layersOut].pid);
      if (vx != 0 || vy != 0) {
        scrollThisInstance = true;
        autoScrolls[layersOut].pid = setInterval(function() {
          if (isFallback && this.layer === 0) {
            Sortable.active._onTouchMove(touchEvt$1);
          }
          var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
          var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
          if (typeof scrollCustomFn === "function") {
            if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
              return;
            }
          }
          scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
        }.bind({
          layer: layersOut
        }), 24);
      }
    }
    layersOut++;
  } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
  scrolling = scrollThisInstance;
}, 30);
var drop = function drop2(_ref) {
  var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
  if (!originalEvent) return;
  var toSortable = putSortable2 || activeSortable;
  hideGhostForTarget();
  var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  unhideGhostForTarget();
  if (toSortable && !toSortable.el.contains(target)) {
    dispatchSortableEvent("spill");
    this.onSpill({
      dragEl: dragEl2,
      putSortable: putSortable2
    });
  }
};
function Revert() {
}
Revert.prototype = {
  startIndex: null,
  dragStart: function dragStart(_ref2) {
    var oldDraggableIndex2 = _ref2.oldDraggableIndex;
    this.startIndex = oldDraggableIndex2;
  },
  onSpill: function onSpill(_ref3) {
    var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
    this.sortable.captureAnimationState();
    if (putSortable2) {
      putSortable2.captureAnimationState();
    }
    var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
    if (nextSibling) {
      this.sortable.el.insertBefore(dragEl2, nextSibling);
    } else {
      this.sortable.el.appendChild(dragEl2);
    }
    this.sortable.animateAll();
    if (putSortable2) {
      putSortable2.animateAll();
    }
  },
  drop
};
_extends(Revert, {
  pluginName: "revertOnSpill"
});
function Remove() {
}
Remove.prototype = {
  onSpill: function onSpill2(_ref4) {
    var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
    var parentSortable = putSortable2 || this.sortable;
    parentSortable.captureAnimationState();
    dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
    parentSortable.animateAll();
  },
  drop
};
_extends(Remove, {
  pluginName: "removeOnSpill"
});
Sortable.mount(new AutoScrollPlugin());
Sortable.mount(Remove, Revert);
var sortable_esm_default = Sortable;

// src/sortable/session.ts
var _session = null;
function setDragSession(s) {
  _session = s;
}
function getDragSession() {
  return _session;
}
function clearDragSession() {
  _session = null;
}

// src/sortable/guard.ts
var _silent2 = 0;
function isSortableSilent() {
  return _silent2 > 0;
}
function destroySortable(instance) {
  if (!instance) return;
  _silent2++;
  try {
    try {
      instance.option?.("disabled", true);
    } catch {
    }
    instance.destroy();
  } catch {
  } finally {
    _silent2 = Math.max(0, _silent2 - 1);
  }
}

// src/sortable/chips.ts
var FILTER = ".pb-chip-del, .pb-icon-btn, button, input, a, .pb-word-del";
function finishDrag() {
  queueRenderAfterDrag();
  endDrag();
  clearDragSession();
}
function commitPresetDrop(boxId, index2, item) {
  const session = getDragSession();
  let text = "";
  let cnText = "";
  let color;
  if (session?.kind === "preset") {
    if (session.consumed) {
      item.remove();
      return true;
    }
    text = session.text;
    cnText = session.cnText;
    color = session.color;
  } else {
    text = item.getAttribute("data-clone-text") || item.getAttribute("data-preset-text") || item.querySelector(".pb-word-main")?.textContent?.trim() || "";
    cnText = item.getAttribute("data-clone-cn") || item.getAttribute("data-preset-cn") || item.querySelector(".pb-word-sub")?.textContent?.trim() || "";
    color = item.getAttribute("data-clone-color") || item.getAttribute("data-preset-color") || item.style.getPropertyValue("--pb-card-color").trim() || void 0;
  }
  item.remove();
  if (!text) return false;
  if (session?.kind === "preset") session.consumed = true;
  if (!isDragging()) beginDrag();
  dispatch({
    type: "chip/addFromPreset",
    boxId,
    text,
    cnText,
    categoryColor: color || void 0,
    index: index2
  });
  queueRenderAfterDrag();
  return true;
}
function bindChipArea(el, box) {
  const boxId = box.id;
  el._pbBoxId = boxId;
  return new sortable_esm_default(el, {
    group: {
      name: "chips",
      pull: true,
      put: (_to, from) => {
        const g = from?.options?.group;
        const name = !g ? "" : typeof g === "string" ? g : g.name || "";
        return name === "chips";
      }
    },
    animation: 220,
    easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    draggable: ".pb-chip",
    filter: FILTER,
    preventOnFilter: false,
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 3,
    emptyInsertThreshold: 24,
    onMove(evt) {
      if (isSortableSilent()) return false;
      const toEl = evt.to;
      if (!toEl.classList.contains("pb-chip-area") && !toEl.classList.contains("pb-word-list")) {
        return false;
      }
      return true;
    },
    onStart(evt) {
      if (isSortableSilent()) return;
      beginDrag();
      const item = evt.item;
      const chipId = item.getAttribute("data-chip-id") || "";
      if (!chipId) return;
      let multiIds;
      if (isSelected(chipId)) {
        multiIds = getSelectedIdsInWorkspaceOrder();
        if (multiIds.length <= 1) multiIds = void 0;
      } else {
        selectOnly(chipId);
      }
      setDragSession({
        kind: "chip",
        chipId,
        fromBoxId: boxId,
        multiIds,
        text: item.getAttribute("data-chip-text") || item.querySelector(".pb-chip-main")?.textContent?.trim() || "",
        cnText: item.getAttribute("data-chip-cn") || item.querySelector(".pb-chip-sub")?.textContent?.trim() || ""
      });
      if (multiIds && multiIds.length > 1) {
        for (const id of multiIds) {
          if (id === chipId) continue;
          document.querySelector(`.pb-chip[data-chip-id="${id}"]`)?.classList.add("pb-chip-multi-ghost");
        }
        item.classList.add("pb-chip-multi-leader");
      }
    },
    onAdd(evt) {
      if (isSortableSilent()) return;
      const item = evt.item;
      const index2 = typeof evt.newIndex === "number" ? evt.newIndex : 0;
      const isPresetDom = item.classList.contains("pb-word-card") || item.hasAttribute("data-clone-text") || item.hasAttribute("data-preset-text") || getDragSession()?.kind === "preset";
      if (isPresetDom) {
        commitPresetDrop(boxId, index2, item);
        return;
      }
    },
    onEnd(evt) {
      if (isSortableSilent()) return;
      const item = evt.item;
      const session = getDragSession();
      document.querySelectorAll(".pb-chip-multi-ghost").forEach((n) => n.classList.remove("pb-chip-multi-ghost"));
      item.classList.remove("pb-chip-multi-leader");
      if (session?.kind === "preset" && !session.consumed) {
        const toId2 = evt.to?._pbBoxId;
        if (toId2) {
          const index2 = typeof evt.newIndex === "number" ? evt.newIndex : 0;
          commitPresetDrop(toId2, index2, item);
        } else {
          try {
            item.remove();
          } catch {
          }
        }
        finishDrag();
        return;
      }
      if (session?.kind === "preset" && session.consumed) {
        finishDrag();
        return;
      }
      const fromId = (session?.kind === "chip" ? session.fromBoxId : void 0) || evt.from._pbBoxId;
      const toId = evt.to._pbBoxId;
      const chipId = (session?.kind === "chip" ? session.chipId : void 0) || item.getAttribute("data-chip-id") || "";
      if (!fromId || !chipId) {
        finishDrag();
        return;
      }
      if (!toId) {
        queueRenderAfterDrag();
        finishDrag();
        return;
      }
      const toIndex = typeof evt.newIndex === "number" ? evt.newIndex : 0;
      const multiIds = session?.kind === "chip" ? session.multiIds : void 0;
      if (!isDragging()) beginDrag();
      if (multiIds && multiIds.length > 1) {
        const multiSet = new Set(multiIds);
        const toEl = evt.to;
        const children = Array.from(toEl.children).filter(
          (n) => n instanceof HTMLElement && n.classList.contains("pb-chip")
        );
        let insertAt = 0;
        for (const child of children) {
          const id = child.getAttribute("data-chip-id") || "";
          if (id === chipId) break;
          if (id && !multiSet.has(id)) insertAt++;
        }
        dispatch({
          type: "chip/batchMove",
          chipIds: multiIds,
          toBoxId: toId,
          toIndex: insertAt
        });
        queueRenderAfterDrag();
      } else if (fromId === toId) {
        if (evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
          dispatch({
            type: "chip/reorder",
            boxId: fromId,
            fromIndex: evt.oldIndex,
            toIndex: evt.newIndex
          });
        }
      } else {
        dispatch({
          type: "chip/move",
          fromBoxId: fromId,
          toBoxId: toId,
          chipId,
          toIndex
        });
        queueRenderAfterDrag();
      }
      finishDrag();
    }
  });
}

// src/sortable/lists.ts
var FILTER2 = "button, input, textarea, a, .pb-icon-btn, .pb-chip-input, .pb-chip, .pb-chip-area";
function groupNameOf(sortable) {
  const g = sortable?.options?.group;
  if (!g) return "";
  return typeof g === "string" ? g : g.name || "";
}
function bindGroupList(el) {
  return new sortable_esm_default(el, {
    animation: 200,
    handle: ".pb-grip",
    draggable: ".pb-group",
    filter: FILTER2,
    preventOnFilter: false,
    forceFallback: true,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    group: {
      name: "pb-groups",
      pull: true,
      put: (to) => groupNameOf(to) === "pb-groups"
    },
    onMove(evt) {
      if (isSortableSilent()) return false;
      if (evt.to !== el) return false;
      const related = evt.related;
      if (related && !related.classList.contains("pb-group")) {
        if (related.closest(".pb-chip-area")) return false;
      }
      return true;
    },
    onStart: () => {
      if (isSortableSilent()) return;
      beginDrag();
    },
    onEnd(evt) {
      if (isSortableSilent()) return;
      if (evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
        dispatch({ type: "group/reorder", fromIndex: evt.oldIndex, toIndex: evt.newIndex });
      }
      queueRenderAfterDrag();
      endDrag();
      clearDragSession();
    }
  });
}
function bindBoxList(el, groupId) {
  const groupName = `pb-boxes-${groupId}`;
  return new sortable_esm_default(el, {
    animation: 200,
    handle: ".pb-box-grip",
    draggable: ".pb-inputbox",
    filter: FILTER2,
    preventOnFilter: false,
    forceFallback: true,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    group: {
      name: groupName,
      pull: true,
      put: (to) => groupNameOf(to) === groupName
    },
    onMove(evt) {
      if (isSortableSilent()) return false;
      if (evt.to !== el) return false;
      const related = evt.related;
      if (related?.closest?.(".pb-chip-area") && !related.classList.contains("pb-inputbox")) {
        return false;
      }
      return true;
    },
    onStart: () => {
      if (isSortableSilent()) return;
      beginDrag();
    },
    onEnd(evt) {
      if (isSortableSilent()) return;
      if (evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
        dispatch({
          type: "box/reorder",
          groupId,
          fromIndex: evt.oldIndex,
          toIndex: evt.newIndex
        });
      }
      queueRenderAfterDrag();
      endDrag();
      clearDragSession();
    }
  });
}

// src/ui/workspace.ts
init_toast();

// src/ui/autocomplete.ts
init_pipe();
init_dom();
init_state();

// src/services/danbooru.ts
var TAG_FILE = "tags_sqlite_2026-05-18.json";
var _index = [];
var _loading = false;
var _loaded = false;
var _loadPromise = null;
function getDanbooruIndex() {
  if (!_loaded && !_loading) void load();
  return _index;
}
function preloadTagIndex() {
  return load();
}
function resolveScriptBase() {
  let base = ".";
  for (const s of document.querySelectorAll("script[src]")) {
    const src = s.src;
    if (src?.includes("promptbuilder")) {
      base = src.substring(0, src.lastIndexOf("/"));
      break;
    }
  }
  if (base === "." && import.meta.url) {
    const mu = import.meta.url;
    base = mu.substring(0, mu.lastIndexOf("/"));
  }
  return base;
}
function normalizeTags(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const out = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const text = String(row.name ?? "").trim();
    if (!text) continue;
    const cnText = row.cn_name != null ? String(row.cn_name) : "";
    let postCount = 0;
    if (typeof row.post_count === "number") postCount = row.post_count;
    else if (typeof row.post_count === "string") postCount = Number(row.post_count) || 0;
    out.push({ text, cnText, postCount });
  }
  out.sort((a, b) => b.postCount - a.postCount);
  return out;
}
async function load() {
  if (_loaded) return;
  if (_loadPromise) return _loadPromise;
  _loading = true;
  _loadPromise = (async () => {
    try {
      const base = resolveScriptBase();
      const url = `${base}/${TAG_FILE}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      _index = normalizeTags(data);
      console.log(`[PromptBuilder] danbooru tags loaded: ${_index.length} from ${TAG_FILE}`);
      _loaded = true;
    } catch (e) {
      console.warn("[PromptBuilder] danbooru tags load failed", e);
      _index = [];
      _loaded = true;
    } finally {
      _loading = false;
    }
  })();
  return _loadPromise;
}

// src/ui/autocomplete.ts
init_factory();
var CSS4 = (
  /*css*/
  `
.pb-ac-layer {
  position: fixed; z-index: 10006; max-height: 240px; overflow-y: auto;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: var(--pb-radius);
  box-shadow: var(--pb-shadow-lg); min-width: 160px;
}
.pb-ac-item { padding: 4px 8px; cursor: pointer; font-size: 12px; display: flex; gap: 8px; align-items: center; }
.pb-ac-item:hover, .pb-ac-item.pb-active { background: var(--pb-border); }
.pb-ac-main { font-weight: 500; color: var(--pb-text); }
.pb-ac-sub { color: var(--pb-text-dim); font-size: 10px; }
.pb-ac-source { color: var(--pb-text-dim); font-size: 10px; margin-left: auto; }
`
);
var MAX_RESULTS = 30;
var MAX_PRESET = 15;
var MAX_DANBOORU = 20;
var _css3 = false;
var _layer = null;
var _items = [];
var _active2 = -1;
var _input = null;
var _box2 = null;
function layer() {
  if (!_layer) {
    if (!_css3) {
      injectCSS("autocomplete", CSS4);
      _css3 = true;
    }
    _layer = div("pb-ac-layer");
    document.body.appendChild(_layer);
    document.addEventListener("pointerdown", (e) => {
      if (_layer && _layer.style.display !== "none" && !_layer.contains(e.target)) hideAc();
    });
  }
  return _layer;
}
function hideAc() {
  const l = layer();
  l.style.display = "none";
  _items = [];
  _active2 = -1;
  _input = null;
  _box2 = null;
}
function foldSep(s) {
  return s.toLowerCase().replace(/[_\s]+/g, " ");
}
function matchTerm(text, cnText, termFold, termRaw) {
  if (foldSep(text).includes(termFold)) return true;
  if (!cnText) return false;
  return cnText.includes(termRaw) || foldSep(cnText).includes(termFold);
}
function isPrefix(text, cnText, termFold, termRaw) {
  if (foldSep(text).startsWith(termFold)) return true;
  if (!cnText) return false;
  return cnText.startsWith(termRaw) || foldSep(cnText).startsWith(termFold);
}
function showAc(input, box) {
  _input = input;
  _box2 = box;
  const val = input.value;
  const term = val.slice(val.lastIndexOf(",") + 1).trim();
  if (!term) {
    hideAc();
    return;
  }
  const termFold = foldSep(term);
  const presets = [];
  for (const p of getPresetIndex()) {
    if (!matchTerm(p.text, p.cnText, termFold, term)) continue;
    presets.push({
      text: p.text,
      cnText: p.cnText,
      categoryColor: p.categoryColor,
      source: "preset"
    });
  }
  presets.sort((a, b) => {
    const ap = isPrefix(a.text, a.cnText, termFold, term) ? 0 : 1;
    const bp = isPrefix(b.text, b.cnText, termFold, term) ? 0 : 1;
    return ap - bp || a.text.length - b.text.length;
  });
  const seen = new Set(presets.map((r) => r.text));
  const danbooru = [];
  const starts = [];
  const includes = [];
  for (const d of getDanbooruIndex()) {
    if (starts.length >= MAX_DANBOORU && starts.length + includes.length >= MAX_DANBOORU * 2) break;
    if (seen.has(d.text)) continue;
    if (!matchTerm(d.text, d.cnText, termFold, term)) continue;
    const hit = {
      text: d.text,
      cnText: d.cnText,
      source: "danbooru",
      postCount: d.postCount
    };
    if (isPrefix(d.text, d.cnText, termFold, term)) starts.push(hit);
    else includes.push(hit);
  }
  for (const h2 of [...starts, ...includes]) {
    if (danbooru.length >= MAX_DANBOORU) break;
    if (seen.has(h2.text)) continue;
    danbooru.push(h2);
    seen.add(h2.text);
  }
  danbooru.sort((a, b) => {
    const ap = isPrefix(a.text, a.cnText, termFold, term) ? 0 : 1;
    const bp = isPrefix(b.text, b.cnText, termFold, term) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return (b.postCount || 0) - (a.postCount || 0);
  });
  const results = [
    ...presets.slice(0, MAX_PRESET),
    ...danbooru
  ].slice(0, MAX_RESULTS);
  if (!results.length) {
    hideAc();
    return;
  }
  _items = results;
  _active2 = 0;
  const l = layer();
  l.innerHTML = "";
  _items.forEach((item, i) => {
    const el = div("pb-ac-item");
    if (i === _active2) el.classList.add("pb-active");
    const srcLabel = item.source === "preset" ? "\u8BCD\u5E93" : "danbooru";
    el.innerHTML = `
      <span class="pb-ac-main">${escapeHtml(item.text)}</span>
      ${item.cnText ? `<span class="pb-ac-sub">${escapeHtml(item.cnText)}</span>` : ""}
      <span class="pb-ac-source">${srcLabel}</span>
    `;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      pick(i);
    });
    l.appendChild(el);
  });
  const rect = input.getBoundingClientRect();
  l.style.left = rect.left + "px";
  l.style.top = rect.bottom + 4 + "px";
  l.style.width = Math.max(rect.width, 160) + "px";
  l.style.display = "";
  l.scrollTop = 0;
}
function navigateAc(delta) {
  if (!_items.length) return;
  _active2 = (_active2 + delta + _items.length) % _items.length;
  const l = layer();
  const items = l.querySelectorAll(".pb-ac-item");
  items.forEach((el, i) => {
    el.classList.toggle("pb-active", i === _active2);
  });
  const activeEl = items[_active2];
  activeEl?.scrollIntoView({ block: "nearest", inline: "nearest" });
}
function selectAc(_input2, _box3) {
  if (!_items.length || _active2 < 0) return false;
  pick(_active2);
  return true;
}
function pick(index2) {
  if (!_input || !_box2) return;
  const item = _items[index2];
  if (!item) return;
  const val = _input.value;
  const last = val.lastIndexOf(",");
  _input.value = last >= 0 ? val.slice(0, last + 1) + " " : "";
  dispatch({
    type: "chip/add",
    boxId: _box2.id,
    chip: mkChip(item.text, item.cnText, 1, item.categoryColor)
  });
  hideAc();
}

// src/ui/workspace.ts
var CSS5 = (
  /*css*/
  `
.pb-group {
  margin: 8px 12px; border-radius: var(--pb-radius);
  border: 1px solid var(--pb-group-color, var(--pb-border));
  background: var(--pb-panel-2); overflow: hidden;
}
.pb-group.pb-bypass { opacity: 0.45; }
.pb-group-header {
  display: flex; align-items: center; gap: 4px; padding: 6px 8px;
}
.pb-group-header .pb-grip { font-size: 14px; color: var(--pb-text-dim); cursor: grab; }
.pb-group-name { font-weight: 600; font-size: 14px; flex-shrink: 0; }
.pb-header-spacer { flex: 1; min-width: 0; align-self: stretch; cursor: pointer; }
.pb-inputbox {
  margin: 4px 8px 8px; padding: 6px 8px; background: var(--pb-bg);
  border-radius: 6px; cursor: text; border: 1px solid transparent;
}
.pb-inputbox.pb-focused { border-color: var(--pb-accent); }
.pb-inputbox.pb-bypass { opacity: 0.45; }
.pb-inputbox-header { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.pb-chip-area {
  display: flex; flex-wrap: wrap; align-items: flex-start; min-height: 44px;
  position: relative;
}
.pb-chip-area-empty {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  pointer-events: none; font-size: 11px; color: var(--pb-text-dim); font-style: italic;
  opacity: 0.7;
}
.pb-chip-input {
  flex: 1; min-width: 80px; height: 24px; border: none; border-radius: 4px;
  background: transparent; color: var(--pb-text); padding: 2px 6px;
  font-size: 12px; outline: none;
}
.pb-chip-input:focus { background: var(--pb-bg); }
.pb-add-btn {
  padding: 4px 10px; border: 1px dashed var(--pb-border); border-radius: 6px;
  background: transparent; color: var(--pb-text-dim); cursor: pointer;
  font-size: 12px; margin: 4px 8px 8px; width: calc(100% - 16px); box-sizing: border-box;
}
.pb-add-btn:hover { border-color: var(--pb-accent); color: var(--pb-text); }
.pb-icon-btn {
  width: 26px; height: 26px; border: none; border-radius: 4px;
  background: transparent; color: var(--pb-text-dim); cursor: pointer;
  font-size: 14px; display: inline-flex; align-items: center; justify-content: center;
}
.pb-icon-btn:hover { background: var(--pb-border); color: var(--pb-text); }
.pb-icon-btn.pb-active {
  color: var(--pb-accent);
  background: color-mix(in srgb, var(--pb-accent) 22%, transparent);
  font-weight: 700;
}
.pb-color-picker {
  position: fixed; z-index: 10000; display: grid; grid-template-columns: repeat(6, 24px);
  gap: 4px; padding: 6px; background: var(--pb-panel); border: 1px solid var(--pb-border);
  border-radius: 8px; box-shadow: var(--pb-shadow-lg);
}
.pb-color-swatch { width: 24px; height: 24px; border-radius: 4px; border: 2px solid transparent; cursor: pointer; }
.pb-color-swatch:hover, .pb-color-swatch.pb-current { border-color: var(--pb-accent); }
.pb-groups-container, .pb-boxes-container { min-height: 4px; }
`
);
var _css4 = false;
var _colorPicker = null;
function renderWorkspace() {
  if (!_css4) {
    injectCSS("workspace", CSS5);
    _css4 = true;
  }
  const el = $("pbWorkspaceArea");
  if (!el) return;
  const scrollTop = el.scrollTop;
  const panel = $("pbMainPanel");
  const panelScroll = panel?.scrollTop ?? 0;
  el.querySelectorAll("[data-sortable]").forEach((node) => {
    destroySortable(node._sortable);
    node._sortable = null;
  });
  el.innerHTML = "";
  const groupsContainer = div("pb-groups-container");
  groupsContainer.id = "pbGroupsContainer";
  groupsContainer.setAttribute("data-sortable", "1");
  for (const g of cur.workspace) {
    groupsContainer.appendChild(renderGroup(g, false));
  }
  el.appendChild(groupsContainer);
  groupsContainer._sortable = bindGroupList(groupsContainer);
  const addGroup = document.createElement("button");
  addGroup.className = "pb-add-btn";
  addGroup.textContent = "+ \u6DFB\u52A0\u8F93\u5165\u5206\u7EC4";
  addGroup.addEventListener("click", () => dispatch({ type: "group/add" }));
  el.appendChild(addGroup);
  const sep = div();
  sep.style.cssText = "margin:12px 8px 4px;border-top:2px solid var(--pb-border);";
  el.appendChild(sep);
  el.appendChild(renderGroup(cur.negativeGroup, true));
  el.scrollTop = scrollTop;
  if (panel) panel.scrollTop = panelScroll;
  if (cur.focusedBox) {
    const input = el.querySelector(
      `.pb-inputbox[data-box-id="${cur.focusedBox}"] .pb-chip-input`
    );
    if (input) {
      input.focus({ preventScroll: true });
      el.scrollTop = scrollTop;
      if (panel) panel.scrollTop = panelScroll;
    }
  }
  paintSelectionClasses();
}
function renderGroup(g, isNeg) {
  const groupEl = div("pb-group");
  groupEl.setAttribute("data-group-id", g.id);
  groupEl.style.setProperty("--pb-group-color", g.color);
  if (!g.enabled) groupEl.classList.add("pb-bypass");
  const header = div("pb-group-header");
  header.innerHTML = `
    <span class="pb-grip">\u22EE\u22EE</span>
    <span class="pb-group-name">${escapeHtml(g.name)}</span>
    <span class="pb-header-spacer"></span>
  `;
  const colorDot = document.createElement("span");
  colorDot.style.cssText = `width:12px;height:12px;border-radius:50%;background:${g.color};cursor:pointer;flex-shrink:0;`;
  colorDot.addEventListener("click", (e) => {
    e.stopPropagation();
    openColorPicker(colorDot, g);
  });
  const nameSpan = header.querySelector(".pb-group-name");
  header.insertBefore(colorDot, nameSpan);
  nameSpan.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    startRename(nameSpan, g);
  });
  header.addEventListener("dblclick", (e) => {
    const t = e.target;
    if (!t.closest(".pb-group-name") && !t.closest("button")) {
      dispatch({ type: "group/patch", groupId: g.id, patch: { collapsed: !g.collapsed } });
    }
  });
  header.appendChild(iconBtn(g.enabled ? "\u{1F441}" : "\u{1F6AB}", () => {
    dispatch({ type: "group/patch", groupId: g.id, patch: { enabled: !g.enabled } });
  }));
  const br = iconBtn("//", () => {
    dispatch({ type: "group/patch", groupId: g.id, patch: { break: !g.break } });
  });
  br.style.fontSize = "10px";
  br.title = "BREAK \u9694\u79BB";
  if (g.break) br.classList.add("pb-active");
  header.appendChild(br);
  if (!isNeg) {
    header.appendChild(iconBtn("\xD7", () => {
      if (cur.workspace.length <= 1) {
        toast("\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u5206\u7EC4", "warn");
        return;
      }
      dispatch({ type: "group/remove", groupId: g.id });
    }));
  }
  groupEl.appendChild(header);
  const body = div();
  body.style.display = g.collapsed ? "none" : "";
  const boxes = div("pb-boxes-container");
  boxes.setAttribute("data-sortable", "1");
  for (const box of g.inputboxes) {
    boxes.appendChild(renderBox(g, box, isNeg));
  }
  body.appendChild(boxes);
  if (!isNeg && g.inputboxes.length > 1) {
    boxes._sortable = bindBoxList(boxes, g.id);
  }
  if (!isNeg) {
    const addBox = document.createElement("button");
    addBox.className = "pb-add-btn";
    addBox.textContent = "+ \u6DFB\u52A0\u8F93\u5165\u6846";
    addBox.addEventListener("click", () => dispatch({ type: "box/add", groupId: g.id }));
    body.appendChild(addBox);
  }
  groupEl.appendChild(body);
  return groupEl;
}
function renderBox(group, box, isNeg) {
  const boxEl = div("pb-inputbox");
  boxEl.setAttribute("data-box-id", box.id);
  if (cur.focusedBox === box.id) boxEl.classList.add("pb-focused");
  if (!box.enabled) boxEl.classList.add("pb-bypass");
  const header = div("pb-inputbox-header");
  if (!isNeg) {
    const grip = span("pb-box-grip");
    grip.textContent = "\u22EE\u22EE";
    grip.style.cssText = "cursor:grab;color:var(--pb-text-dim);font-size:14px;letter-spacing:2px;";
    header.appendChild(grip);
  }
  const input = document.createElement("input");
  input.className = "pb-chip-input";
  input.placeholder = "\u8F93\u5165\u8BCD\u8BED\uFF0C\u9017\u53F7\u5206\u9694\u2026";
  input.addEventListener("focus", () => {
    if (cur.focusedBox !== box.id) dispatch({ type: "focus/box", boxId: box.id });
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        dispatch({ type: "chip/addText", boxId: box.id, text });
        input.value = "";
      }
      hideAc();
    } else if (e.key === ",") {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        dispatch({ type: "chip/addText", boxId: box.id, text });
        input.value = "";
      }
      hideAc();
    } else if (e.key === "Tab") {
      if (selectAc(input, box)) e.preventDefault();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      navigateAc(e.key === "ArrowDown" ? 1 : -1);
      e.preventDefault();
    } else if (e.key === "Escape") hideAc();
  });
  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.activeElement !== input) hideAc();
    }, 120);
  });
  input.addEventListener("input", () => showAc(input, box));
  header.appendChild(input);
  header.appendChild(iconBtn(box.enabled ? "\u{1F441}" : "\u{1F6AB}", () => {
    dispatch({ type: "box/toggle", boxId: box.id, field: "enabled" });
  }));
  const bbr = iconBtn("//", () => {
    dispatch({ type: "box/toggle", boxId: box.id, field: "break" });
  });
  bbr.style.fontSize = "10px";
  bbr.title = "BREAK \u9694\u79BB";
  if (box.break) bbr.classList.add("pb-active");
  header.appendChild(bbr);
  if (!isNeg && group.inputboxes.length > 1) {
    header.appendChild(iconBtn("\xD7", () => {
      dispatch({ type: "box/remove", groupId: group.id, boxId: box.id });
    }));
  }
  boxEl.appendChild(header);
  const markFocused = () => {
    dispatch({ type: "focus/box", boxId: box.id });
    document.querySelectorAll("#pbWorkspaceArea .pb-inputbox.pb-focused").forEach((n) => n.classList.remove("pb-focused"));
    boxEl.classList.add("pb-focused");
  };
  boxEl.addEventListener("pointerdown", (e) => {
    const t = e.target;
    if (t.closest("input, textarea, button, .pb-box-grip, .pb-chip-del, .pb-chip-edit, .pb-chip-edit-panel")) {
      if (t.closest("input, textarea")) markFocused();
      return;
    }
    if (t.closest(".pb-chip")) {
      markFocused();
      return;
    }
    markFocused();
    input.focus({ preventScroll: true });
  });
  const area = div("pb-chip-area");
  area.setAttribute("data-box-id", box.id);
  area.setAttribute("data-sortable", "1");
  if (box.chips.length === 0) {
    const empty = div("pb-chip-area-empty");
    empty.textContent = "\u62D6\u5165\u8BCD\u8BED\u6216\u5728\u4E0A\u65B9\u8F93\u5165";
    area.appendChild(empty);
  }
  for (const chip of box.chips) {
    area.appendChild(renderChip(chip, box));
  }
  area._sortable = bindChipArea(area, box);
  boxEl.appendChild(area);
  return boxEl;
}
function iconBtn(text, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "pb-icon-btn";
  b.textContent = text;
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return b;
}
function startRename(nameSpan, g) {
  const input = document.createElement("input");
  input.value = g.name;
  input.style.cssText = "background:var(--pb-bg);border:1px solid var(--pb-accent);color:var(--pb-text);padding:2px 6px;border-radius:3px;font-size:13px;outline:none;width:120px;";
  nameSpan.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    const v = input.value.trim();
    if (v) dispatch({ type: "group/patch", groupId: g.id, patch: { name: v } });
    else renderWorkspace();
  };
  input.addEventListener("blur", finish);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finish();
    }
    if (e.key === "Escape") {
      input.value = g.name;
      finish();
    }
  });
}
function openColorPicker(anchor, g) {
  closeColorPicker();
  const picker = div("pb-color-picker");
  for (const c of getGroupColors()) {
    const sw = div("pb-color-swatch");
    sw.style.background = c;
    if (c === g.color) sw.classList.add("pb-current");
    sw.addEventListener("click", () => {
      dispatch({ type: "group/patch", groupId: g.id, patch: { color: c } });
      closeColorPicker();
    });
    picker.appendChild(sw);
  }
  document.body.appendChild(picker);
  const rect = anchor.getBoundingClientRect();
  picker.style.left = rect.left + "px";
  picker.style.top = rect.bottom + 4 + "px";
  _colorPicker = picker;
  setTimeout(() => {
    document.addEventListener("pointerdown", (e) => {
      if (_colorPicker && !_colorPicker.contains(e.target)) closeColorPicker();
    }, { once: true });
  }, 0);
}
function closeColorPicker() {
  _colorPicker?.remove();
  _colorPicker = null;
}

// src/ui/presets.ts
init_state();
init_pipe();
init_dom();

// src/sortable/presets.ts
init_state();
init_toast();
var FILTER3 = ".pb-word-del, .pb-icon-btn, button, input, a, .pb-chip-del, .pb-word-toolbar, .pb-word-edit, [data-empty]";
function finishDrag2() {
  queueRenderAfterDrag();
  endDrag();
  clearDragSession();
}
function bindPresetList(el) {
  return new sortable_esm_default(el, {
    group: { name: "chips", pull: "clone", put: true },
    animation: 220,
    draggable: ".pb-word-card",
    filter: FILTER3,
    preventOnFilter: true,
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 3,
    emptyInsertThreshold: 24,
    // 仅允许：词库内排序 / 投放到工作区 chip 输入区（禁止拖到输入框外触发动画）
    onMove(evt) {
      if (isSortableSilent()) return false;
      const toEl = evt.to;
      if (toEl.classList.contains("pb-word-list")) return true;
      if (toEl.classList.contains("pb-chip-area")) return true;
      return false;
    },
    onStart(evt) {
      if (isSortableSilent()) return;
      beginDrag();
      const card = evt.item;
      const text = card.getAttribute("data-preset-text") || card.querySelector(".pb-word-main")?.textContent?.trim() || "";
      const cnText = card.getAttribute("data-preset-cn") || card.querySelector(".pb-word-sub")?.textContent?.trim() || "";
      const color = card.getAttribute("data-preset-color") || card.style.getPropertyValue("--pb-card-color").trim() || void 0;
      if (text) {
        setDragSession({ kind: "preset", text, cnText, color: color || void 0 });
      }
    },
    onClone(evt) {
      const card = evt.clone;
      const session = getDragSession();
      if (session?.kind === "preset") {
        card.setAttribute("data-clone-text", session.text);
        if (session.cnText) card.setAttribute("data-clone-cn", session.cnText);
        if (session.color) card.setAttribute("data-clone-color", session.color);
      } else {
        const text = card.getAttribute("data-preset-text") || card.querySelector(".pb-word-main")?.textContent?.trim() || "";
        const cn = card.getAttribute("data-preset-cn") || card.querySelector(".pb-word-sub")?.textContent?.trim() || "";
        if (text) card.setAttribute("data-clone-text", text);
        if (cn) card.setAttribute("data-clone-cn", cn);
      }
      card.querySelectorAll(".pb-word-del, button").forEach((n) => n.remove());
      card.setAttribute("data-pb-clone", "1");
      card.style.pointerEvents = "none";
    },
    onAdd(evt) {
      if (isSortableSilent()) return;
      const item = evt.item;
      const session = getDragSession();
      item.remove();
      evt.to?.querySelectorAll("[data-empty]").forEach((n) => n.remove());
      if (session?.kind === "chip") {
        session.copiedToPreset = true;
        if (!isDragging()) beginDrag();
        const multiIds = session.multiIds;
        if (multiIds && multiIds.length > 1) {
          const payload = [];
          const seen = /* @__PURE__ */ new Set();
          for (const id of multiIds) {
            const hit = findChip(id);
            const t = hit?.chip.text?.trim() || "";
            if (!t || seen.has(t)) continue;
            seen.add(t);
            payload.push({ text: t, cnText: hit.chip.cnText || "" });
          }
          if (!payload.length && session.text) {
            payload.push({ text: session.text, cnText: session.cnText || "" });
          }
          const existing = new Set((getCurrentPresetItems() || []).map((i) => i.text));
          const willAdd = payload.filter((p) => !existing.has(p.text)).length;
          const ok = dispatch({ type: "preset/tryAddManyFromChips", items: payload });
          if (ok) {
            const skipped = payload.length - willAdd;
            toast(
              skipped > 0 ? `\u5DF2\u6279\u91CF\u52A0\u5165 ${willAdd} \u9879\uFF0C\u8DF3\u8FC7 ${skipped} \u9879\u91CD\u590D` : `\u5DF2\u6279\u91CF\u52A0\u5165\u8BCD\u5E93 ${willAdd} \u9879`,
              "ok"
            );
          } else {
            toast("\u672A\u80FD\u52A0\u5165\uFF08\u53EF\u80FD\u5747\u5DF2\u5B58\u5728\u6216\u672A\u9009\u5206\u7C7B\uFF09", "warn");
          }
        } else {
          const text = session.text || item.getAttribute("data-chip-text") || item.querySelector(".pb-chip-main")?.textContent?.trim() || "";
          const cnText = session.cnText || item.getAttribute("data-chip-cn") || item.querySelector(".pb-chip-sub")?.textContent?.trim() || "";
          if (text) {
            const ok = dispatch({ type: "preset/tryAddFromChip", text, cnText });
            if (ok) toast(`\u5DF2\u52A0\u5165\u8BCD\u5E93\uFF1A${text}`, "ok");
            else toast("\u672A\u80FD\u52A0\u5165\uFF08\u53EF\u80FD\u5DF2\u5B58\u5728\u6216\u672A\u9009\u5206\u7C7B\uFF09", "warn");
          }
        }
      } else {
        const text = item.getAttribute("data-chip-text") || item.querySelector(".pb-chip-main")?.textContent?.trim() || "";
        const cnText = item.getAttribute("data-chip-cn") || item.querySelector(".pb-chip-sub")?.textContent?.trim() || "";
        if (text) {
          if (!isDragging()) beginDrag();
          const ok = dispatch({ type: "preset/tryAddFromChip", text, cnText });
          if (ok) toast(`\u5DF2\u52A0\u5165\u8BCD\u5E93\uFF1A${text}`, "ok");
          else toast("\u672A\u80FD\u52A0\u5165\uFF08\u53EF\u80FD\u5DF2\u5B58\u5728\u6216\u672A\u9009\u5206\u7C7B\uFF09", "warn");
        }
      }
      queueRenderAfterDrag();
    },
    onEnd(evt) {
      if (isSortableSilent()) return;
      const session = getDragSession();
      const item = evt.item;
      if (session?.kind === "preset") {
        if (item?.getAttribute("data-pb-clone") === "1") {
          try {
            item.remove();
          } catch {
          }
        }
        finishDrag2();
        return;
      }
      if (session?.kind !== "chip" && evt.from === evt.to && evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
        if (!isDragging()) beginDrag();
        dispatch({
          type: "preset/reorderItems",
          fromIndex: evt.oldIndex,
          toIndex: evt.newIndex
        });
      }
      if (session?.kind === "chip") {
        queueRenderAfterDrag();
      }
      finishDrag2();
    }
  });
}

// src/sortable/cats.ts
init_state();
init_dom();
init_toast();
function groupNameOf2(sortable) {
  const g = sortable?.options?.group;
  if (!g) return "";
  return typeof g === "string" ? g : g.name || "";
}
var _l2Drag = null;
var _l2PtrMove = null;
function clearL2DragListeners() {
  if (_l2PtrMove) {
    document.removeEventListener("pointermove", _l2PtrMove, true);
    _l2PtrMove = null;
  }
}
function escapeAttr(s) {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(s) : s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function previewL2Tag(name, color) {
  const tag = document.createElement("span");
  tag.className = "pb-cat-tag pb-l2-tag";
  tag.setAttribute("data-cat-name", name);
  tag.textContent = name;
  if (color) {
    tag.style.background = `color-mix(in srgb, ${color} 28%, transparent)`;
    tag.style.color = color;
    tag.style.border = "none";
    tag.style.boxShadow = "none";
  }
  return tag;
}
function paintL2RowForDragPreview(previewL1, drag) {
  const l2Row = $("pbPresetCatsL2");
  if (!l2Row) return;
  const esc = escapeAttr(drag.l2Name);
  let dragEl2 = l2Row.querySelector(`.pb-cat-tag[data-cat-name="${esc}"]`) || document.querySelector(
    ".pb-cat-tag.pb-l2-tag.sortable-chosen, .pb-cat-tag.pb-l2-tag.sortable-drag"
  );
  if (!dragEl2) {
    dragEl2 = document.querySelector(
      `.pb-cat-tag.pb-l2-tag[data-cat-name="${esc}"]`
    );
  }
  const addBtn = l2Row.querySelector(".pb-cat-add");
  [...l2Row.querySelectorAll(".pb-cat-tag[data-cat-name]")].forEach((el) => {
    if (el === dragEl2) return;
    el.remove();
  });
  const l1 = state.presets.children[previewL1];
  const names = l1 ? Object.keys(l1.children) : [];
  const insertBefore = addBtn;
  for (const name of names) {
    if (name === drag.l2Name) {
      if (dragEl2 && insertBefore) l2Row.insertBefore(dragEl2, insertBefore);
      else if (dragEl2) l2Row.appendChild(dragEl2);
      continue;
    }
    const color = l1.children[name]?.color;
    const tag = previewL2Tag(name, color);
    if (insertBefore) l2Row.insertBefore(tag, insertBefore);
    else l2Row.appendChild(tag);
  }
  if (dragEl2 && drag.fromL1 !== previewL1 && !names.includes(drag.l2Name)) {
    if (insertBefore) l2Row.insertBefore(dragEl2, insertBefore);
    else l2Row.appendChild(dragEl2);
  }
}
function l1NameFromPoint(x, y) {
  const stack = document.elementsFromPoint(x, y);
  for (const node of stack) {
    const el = node;
    if (el.classList?.contains("sortable-drag") || el.classList?.contains("sortable-fallback")) {
      continue;
    }
    const tag = el.closest?.("#pbPresetCats .pb-cat-tag[data-cat-name]");
    if (tag && !tag.classList.contains("pb-cat-add")) {
      return tag.getAttribute("data-cat-name");
    }
  }
  return null;
}
function hitL2Row(x, y) {
  const stack = document.elementsFromPoint(x, y);
  for (const node of stack) {
    const el = node;
    if (el.classList?.contains("sortable-drag") || el.classList?.contains("sortable-fallback")) {
      continue;
    }
    if (el.closest?.("#pbPresetCatsL2")) return true;
  }
  return false;
}
function clientPoint(evt) {
  const oe = evt.originalEvent;
  if (!oe) return null;
  if ("clientX" in oe && typeof oe.clientX === "number") {
    return { x: oe.clientX, y: oe.clientY };
  }
  const t = oe.changedTouches?.[0] || oe.touches?.[0];
  if (t) return { x: t.clientX, y: t.clientY };
  return null;
}
function finishCatDrag() {
  clearL2DragListeners();
  _l2Drag = null;
  queueRenderAfterDrag();
  endDrag();
  clearDragSession();
}
function bindCatRow(el, level) {
  const groupName = level === "l1" ? "pb-preset-l1" : "pb-preset-l2";
  return new sortable_esm_default(el, {
    animation: 180,
    draggable: ".pb-cat-tag[data-cat-name]",
    filter: ".pb-cat-add, input, textarea, button",
    preventOnFilter: true,
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 4,
    direction: "horizontal",
    swapThreshold: 0.65,
    group: {
      name: groupName,
      pull: true,
      // L1/L2 不同 group → 无法把 L2 DOM 放进 L1 行（松在 L1 上不会 insert）
      put: (to) => groupNameOf2(to) === groupName
    },
    onMove(evt) {
      if (isSortableSilent()) return false;
      if (evt.to !== el) return false;
      const related = evt.related;
      if (related?.classList.contains("pb-cat-add")) return false;
      return true;
    },
    onStart(evt) {
      if (isSortableSilent()) return;
      beginDrag();
      document.querySelectorAll(".pb-cat-popup").forEach((n) => n.remove());
      if (level !== "l2") return;
      const item = evt.item;
      const l2Name = item.getAttribute("data-cat-name") || "";
      const fromL1 = state.l1Cat;
      if (!l2Name || !fromL1) return;
      _l2Drag = { l2Name, fromL1, previewL1: fromL1 };
      _l2PtrMove = (e) => {
        if (!_l2Drag) return;
        const name = l1NameFromPoint(e.clientX, e.clientY);
        if (!name || name === _l2Drag.previewL1) return;
        if (!state.presets.children[name]) return;
        _l2Drag.previewL1 = name;
        paintL2RowForDragPreview(name, {
          l2Name: _l2Drag.l2Name,
          fromL1: _l2Drag.fromL1
        });
      };
      document.addEventListener("pointermove", _l2PtrMove, true);
    },
    onEnd(evt) {
      if (isSortableSilent()) {
        finishCatDrag();
        return;
      }
      if (level === "l1") {
        if (evt.from === evt.to && evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
          dispatch({
            type: "preset/reorderL1",
            fromIndex: evt.oldIndex,
            toIndex: evt.newIndex
          });
        }
        finishCatDrag();
        return;
      }
      const session = _l2Drag;
      const pt = clientPoint(evt);
      const onL2 = pt ? hitL2Row(pt.x, pt.y) : evt.to === el;
      if (!session || !onL2) {
        finishCatDrag();
        return;
      }
      const newIndex2 = evt.newIndex;
      if (newIndex2 == null) {
        finishCatDrag();
        return;
      }
      if (session.previewL1 === session.fromL1) {
        if (evt.oldIndex != null && evt.oldIndex !== newIndex2) {
          dispatch({
            type: "preset/reorderL2",
            fromIndex: evt.oldIndex,
            toIndex: newIndex2
          });
        }
      } else {
        const ok = dispatch({
          type: "preset/moveL2",
          fromL1: session.fromL1,
          toL1: session.previewL1,
          l2Name: session.l2Name,
          toIndex: newIndex2
        });
        if (!ok) {
          toast("\u65E0\u6CD5\u79FB\u52A8\uFF1A\u76EE\u6807\u4E0B\u5DF2\u6709\u540C\u540D\u4E8C\u7EA7\u5206\u7C7B\uFF0C\u6216\u5206\u7C7B\u4E0D\u5B58\u5728", "warn");
        }
      }
      finishCatDrag();
    }
  });
}

// src/ui/presets.ts
init_factory();
init_toast();
var CSS6 = (
  /*css*/
  `
.pb-presets {
  display: flex; flex-direction: column; height: 100%;
  min-width: 0; min-height: 0; width: 100%; max-width: 100%;
  box-sizing: border-box;
}
.pb-preset-header {
  flex-shrink: 0; position: sticky; top: 0; z-index: 5;
  background: var(--pb-panel); padding: 6px 12px 2px; border-bottom: 1px solid var(--pb-border);
  min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box;
}
.pb-preset-top-row {
  display: flex; align-items: center; gap: 6px;
  min-width: 0; width: 100%; max-width: 100%;
  box-sizing: border-box;
}
/* \u641C\u7D22\u6846\u6682\u65F6\u9690\u85CF\uFF08\u529F\u80FD\u4FDD\u7559\u5728\u6587\u4EF6\u5E95\u90E8\u6CE8\u91CA\u533A\uFF09
.pb-preset-search {
  width: 120px; padding: 4px 8px; background: var(--pb-bg); border: 1px solid var(--pb-border);
  border-radius: 6px; color: var(--pb-text); font-size: 12px; outline: none; margin-left: auto;
}
*/
/* \u6A2A\u5411\u53EF\u6EDA\uFF1B\u53EA\u9690\u85CF\u6EDA\u52A8\u6761\u5916\u89C2\uFF0C\u4E0D\u5173\u529F\u80FD */
.pb-cat-row {
  display: flex; gap: 6px; flex-wrap: nowrap; margin-bottom: 8px;
  overflow-x: auto; overflow-y: hidden;
  min-width: 0; max-width: 100%;
  box-sizing: border-box;
  align-items: center;
  overscroll-behavior-x: contain;
  /* \u9690\u85CF\u6EDA\u52A8\u6761\uFF0C\u4FDD\u7559 scrollLeft / \u6EDA\u8F6E / \u89E6\u63A7\u677F */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pb-cat-row::-webkit-scrollbar { display: none; }
/* L1\uFF1A\u5728 flex \u884C\u5185\u7528 width:0 + flex:1 \u5F3A\u5236\u5403\u6389\u5269\u4F59\u5BBD\uFF0C\u624D\u80FD overflow \u6EDA\u52A8 */
.pb-preset-top-row > .pb-cat-row {
  flex: 1 1 auto;
  width: 0;
}
/* L2\uFF1A\u5757\u7EA7\u5360\u6EE1\u7236\u5BBD */
.pb-preset-header > .pb-cat-row {
  flex: none;
  width: 100%;
}
/* \u5206\u7C7B\u6309\u94AE\uFF1A\u5706\u89D2\u77E9\u5F62\uFF0C\u6BD4 chip \u7565\u77EE */
.pb-cat-tag {
  display: inline-flex; align-items: center; justify-content: center;
  box-sizing: border-box;
  min-height: 28px; height: 28px; padding: 0 12px;
  border-radius: 6px; border: 1px solid transparent;
  background: var(--pb-panel-2); color: var(--pb-text); font-size: 12px; font-weight: 500;
  line-height: 1.2; cursor: pointer; white-space: nowrap; flex-shrink: 0;
}
/* \u53EF\u6392\u5E8F\u7684\u5206\u7C7B\uFF1Agrab\uFF1B\u300C+\u300D\u4FDD\u6301 pointer */
.pb-cat-tag[data-cat-name] { cursor: grab; }
.pb-cat-tag[data-cat-name]:active { cursor: grabbing; }
.pb-cat-tag.pb-cat-add { cursor: pointer; opacity: 0.5; }
.pb-cat-tag.sortable-ghost { opacity: 0.35; }
.pb-cat-tag.sortable-drag { opacity: 0.95; box-shadow: var(--pb-shadow-md); }
/* L1 \u9AD8\u4EAE\uFF1A\u5F3A\u8C03\u8272\u5E95\uFF0C\u65E0\u8FB9\u6846 */
.pb-cat-tag.pb-cat-active:not(.pb-l2-tag) {
  background: var(--pb-accent); border-color: transparent; color: #fff; font-weight: 600;
}
/* L2\uFF1A\u534A\u900F\u660E\u8272\u5757\u6309\u94AE\uFF0C\u65E0\u63CF\u8FB9\uFF1B\u5E95\u8272/\u6587\u5B57\u8272\u7531 JS \u6309\u5206\u7C7B\u8272\u8BBE\u7F6E */
.pb-cat-tag.pb-l2-tag {
  border: none !important;
  border-width: 0 !important;
  font-weight: 500;
}
.pb-cat-tag.pb-l2-tag.pb-cat-active {
  font-weight: 600;
}
.pb-preset-body { flex: 1; overflow-y: auto; padding: 4px 12px; }
.pb-word-list {
  display: flex; flex-wrap: wrap; gap: 4px;
  /* \u4FDD\u8BC1\u7A7A\u5217\u8868\u4E5F\u6709\u53EF\u6295\u653E\u533A\u57DF */
  min-height: 48px;
}
.pb-word-empty {
  width: 100%; padding: 16px 8px; text-align: center; font-size: 12px;
  color: var(--pb-text-dim); font-style: italic;
  pointer-events: none; /* \u4E0D\u6321 Sortable \u6295\u653E */
}
/* \u8BCD\u5E93 chip \u4E0E\u5DE5\u4F5C\u533A .pb-chip \u540C\u5C3A\u5BF8/\u5B57\u53F7 */
.pb-word-card {
  position: relative; display: inline-flex; flex-direction: column; justify-content: center;
  min-width: 40px; max-width: 280px; height: 36px;
  padding: 3px 20px 3px 16px; margin: 3px;
  border-radius: 6px; background: var(--pb-chip-bg); cursor: pointer;
  user-select: none; box-sizing: border-box; overflow: hidden;
}
.pb-word-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px;
  border-radius: 5px 0 0 5px; background: var(--pb-card-color, var(--pb-text-dim));
}
.pb-word-card:hover { background: var(--pb-chip-bg-focus); }
.pb-word-main {
  font-size: 12px; font-weight: 500; line-height: 1.25; color: var(--pb-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.pb-word-sub {
  font-size: 10px; line-height: 1.2; color: var(--pb-text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.pb-word-del {
  position: absolute; right: 0; top: 0; bottom: 0; width: 16px; display: none;
  align-items: center; justify-content: center; border: none; background: transparent;
  color: var(--pb-text-dim); font-size: 10px; cursor: pointer; border-radius: 0 6px 6px 0;
}
.pb-word-card:hover .pb-word-del { display: flex; }
.pb-word-del:hover { color: var(--pb-danger); }
.pb-search-results { display: none; }

/* \u8BCD\u5E93 chip \u60AC\u6D6E\u5DE5\u5177\u680F */
.pb-word-toolbar {
  position: fixed; z-index: 10008; display: flex; gap: 2px; padding: 2px;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: 6px;
  box-shadow: var(--pb-shadow-md); opacity: 0; pointer-events: none; transition: opacity 120ms;
}
.pb-word-toolbar.pb-visible { opacity: 1; pointer-events: auto; }
.pb-word-toolbar button {
  width: 28px; height: 24px; border: none; border-radius: 4px;
  background: transparent; color: var(--pb-text); cursor: pointer; font-size: 13px;
}
.pb-word-toolbar button:hover { background: var(--pb-border); }

/* \u4E2D\u82F1\u7F16\u8F91\u6D6E\u5C42 */
.pb-word-edit {
  position: fixed; z-index: 10009; min-width: 220px; padding: 10px;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: 8px;
  box-shadow: var(--pb-shadow-lg); display: flex; flex-direction: column; gap: 6px;
}
.pb-word-edit label {
  font-size: 10px; color: var(--pb-text-dim); display: flex; flex-direction: column; gap: 2px;
}
.pb-word-edit input {
  width: 100%; box-sizing: border-box; padding: 4px 6px; font-size: 12px;
  border: 1px solid var(--pb-border); border-radius: 4px;
  background: var(--pb-bg); color: var(--pb-text); outline: none;
}
.pb-word-edit input:focus { border-color: var(--pb-accent); }
.pb-word-edit-actions { display: flex; gap: 6px; justify-content: flex-end; margin-top: 4px; }
.pb-word-edit-actions button {
  font-size: 11px; padding: 3px 10px; border-radius: 4px; cursor: pointer;
  border: 1px solid var(--pb-border); background: var(--pb-panel-2); color: var(--pb-text);
}
.pb-word-edit-actions button.primary {
  background: var(--pb-accent); border-color: var(--pb-accent); color: #0b1020; font-weight: 600;
}

/* \u5206\u7C7B\u7F16\u8F91\u5F39\u7A97 */
.pb-cat-edit {
  position: fixed; z-index: 10009; min-width: 220px; padding: 10px;
  background: var(--pb-panel); border: 1px solid var(--pb-border); border-radius: 8px;
  box-shadow: var(--pb-shadow-lg); display: flex; flex-direction: column; gap: 8px;
}
.pb-cat-edit label {
  font-size: 10px; color: var(--pb-text-dim); display: flex; flex-direction: column; gap: 2px;
}
.pb-cat-edit input {
  width: 100%; box-sizing: border-box; padding: 4px 6px; font-size: 12px;
  border: 1px solid var(--pb-border); border-radius: 4px;
  background: var(--pb-bg); color: var(--pb-text); outline: none;
}
.pb-cat-edit input:focus { border-color: var(--pb-accent); }
.pb-cat-edit-swatches {
  display: grid; grid-template-columns: repeat(6, 22px); gap: 4px;
}
.pb-cat-edit-swatch {
  width: 22px; height: 22px; border-radius: 4px; border: 2px solid transparent; cursor: pointer;
}
.pb-cat-edit-swatch:hover, .pb-cat-edit-swatch.pb-current { border-color: var(--pb-text); }
.pb-cat-edit-actions { display: flex; gap: 6px; justify-content: flex-end; }
.pb-cat-edit-actions button {
  font-size: 11px; padding: 3px 10px; border-radius: 4px; cursor: pointer;
  border: 1px solid var(--pb-border); background: var(--pb-panel-2); color: var(--pb-text);
}
.pb-cat-edit-actions button.primary {
  background: var(--pb-accent); border-color: var(--pb-accent); color: #0b1020; font-weight: 600;
}
`
);
var _css5 = false;
var _lastRenderedL1 = "";
function renderPresets() {
  if (!_css5) {
    injectCSS("presets", CSS6);
    _css5 = true;
  }
  const el = $("pbPresetsArea");
  if (!el) return;
  const prevL1Scroll = $("pbPresetCats")?.scrollLeft ?? 0;
  const prevL2Scroll = $("pbPresetCatsL2")?.scrollLeft ?? 0;
  const l1Changed = _lastRenderedL1 !== "" && _lastRenderedL1 !== state.l1Cat;
  hideWordToolbar();
  closeWordEdit();
  closeCatEdit();
  el.querySelectorAll("[data-sortable]").forEach((node) => {
    destroySortable(node._sortable);
    node._sortable = null;
  });
  el.innerHTML = `
    <div class="pb-presets">
      <div class="pb-preset-header">
        <div class="pb-preset-top-row">
          <div class="pb-cat-row" id="pbPresetCats"></div>
          <!-- \u641C\u7D22\u6846\u6682\u65F6\u5173\u95ED
          <input type="text" class="pb-preset-search" id="pbPresetSearch" placeholder="\u641C\u7D22...">
          -->
        </div>
        <div class="pb-cat-row" id="pbPresetCatsL2"></div>
      </div>
      <div class="pb-preset-body" id="pbPresetBody">
        <div class="pb-word-list" id="pbPresetList" data-sortable="1"></div>
        <!-- <div class="pb-search-results" id="pbPresetSearchResults"></div> -->
      </div>
    </div>
  `;
  renderCats();
  renderWords();
  const l1Row = $("pbPresetCats");
  const l2Row = $("pbPresetCatsL2");
  if (l1Row) l1Row.scrollLeft = prevL1Scroll;
  if (l2Row) l2Row.scrollLeft = l1Changed ? 0 : prevL2Scroll;
  _lastRenderedL1 = state.l1Cat;
  applyPresetCollapsedUI();
}
function renderCats() {
  const l1Row = $("pbPresetCats");
  const l2Row = $("pbPresetCatsL2");
  if (!l1Row) return;
  destroySortable(l1Row._sortable);
  l1Row._sortable = null;
  if (l2Row) {
    destroySortable(l2Row._sortable);
    l2Row._sortable = null;
  }
  l1Row.innerHTML = "";
  l1Row.setAttribute("data-sortable", "1");
  for (const name of Object.keys(state.presets.children)) {
    const tag = span("pb-cat-tag");
    tag.setAttribute("data-cat-name", name);
    if (name === state.l1Cat) tag.classList.add("pb-cat-active");
    tag.textContent = name;
    tag.addEventListener("click", () => {
      if (window.__pb_dragging) return;
      const l2s = Object.keys(state.presets.children[name].children);
      dispatch({ type: "preset/setCats", l1: name, l2: l2s[0] || "" });
    });
    attachL1Popup(tag, name);
    l1Row.appendChild(tag);
  }
  const addL1 = span("pb-cat-tag pb-cat-add");
  addL1.textContent = "+";
  addL1.title = "\u6DFB\u52A0\u4E00\u7EA7\u5206\u7C7B";
  addL1.addEventListener("click", () => {
    const inp = document.createElement("input");
    inp.style.cssText = "width:60px;font-size:12px;padding:1px 4px;";
    addL1.replaceWith(inp);
    inp.focus();
    const done = () => {
      const v = inp.value.trim();
      if (v) dispatch({ type: "preset/addL1", name: v });
      else renderPresets();
    };
    inp.addEventListener("blur", done);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") done();
    });
  });
  l1Row.appendChild(addL1);
  l1Row._sortable = bindCatRow(l1Row, "l1");
  if (!l2Row) return;
  l2Row.innerHTML = "";
  l2Row.setAttribute("data-sortable", "1");
  const l1 = state.presets.children[state.l1Cat];
  if (!l1) return;
  for (const name of Object.keys(l1.children)) {
    l2Row.appendChild(buildL2TagEl(name, l1.children[name], name === state.l2Cat));
  }
  l2Row.appendChild(createAddL2Button(() => state.presets.children[state.l1Cat]));
  l2Row._sortable = bindCatRow(l2Row, "l2");
  bindCatRowHScroll(l1Row);
  bindCatRowHScroll(l2Row);
}
function buildL2TagEl(name, l2, active) {
  const tag = span("pb-cat-tag pb-l2-tag");
  tag.setAttribute("data-cat-name", name);
  tag.textContent = name;
  if (active) tag.classList.add("pb-cat-active");
  if (l2?.color) {
    const alpha = active ? 0.55 : 0.28;
    tag.style.background = `color-mix(in srgb, ${l2.color} ${Math.round(alpha * 100)}%, transparent)`;
    tag.style.color = l2.color;
    tag.style.border = "none";
    tag.style.boxShadow = "none";
  }
  tag.addEventListener("click", () => {
    if (window.__pb_dragging) return;
    dispatch({ type: "preset/setCats", l2: name });
  });
  attachL2Popup(tag, name, l2?.color || "");
  return tag;
}
function createAddL2Button(getL1) {
  const addL2 = span("pb-cat-tag pb-cat-add");
  addL2.textContent = "+";
  addL2.title = "\u6DFB\u52A0\u4E8C\u7EA7\u5206\u7C7B";
  addL2.addEventListener("click", () => {
    const l1 = getL1();
    if (!l1) return;
    const palette = getGroupColors();
    let color = palette[Object.keys(l1.children).length % palette.length];
    const wrap = div();
    wrap.style.cssText = "display:flex;gap:4px;align-items:center;";
    const ni = document.createElement("input");
    ni.placeholder = "\u5206\u7C7B\u540D";
    ni.style.cssText = "width:60px;font-size:12px;padding:1px 4px;border:1px solid var(--pb-accent);border-radius:4px;background:var(--pb-bg);color:var(--pb-text);";
    const colors = div();
    colors.style.cssText = "display:flex;gap:3px;";
    for (const c of palette) {
      const d = div();
      d.style.cssText = `width:16px;height:16px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c === color ? "var(--pb-text)" : "transparent"};`;
      d.addEventListener("click", () => {
        color = c;
        colors.querySelectorAll("div").forEach((x) => x.style.borderColor = "transparent");
        d.style.borderColor = "var(--pb-text)";
      });
      colors.appendChild(d);
    }
    wrap.appendChild(ni);
    wrap.appendChild(colors);
    addL2.replaceWith(wrap);
    ni.focus();
    const done = () => {
      const n = ni.value.trim();
      if (n) dispatch({ type: "preset/addL2", name: n, color });
      else renderPresets();
    };
    ni.addEventListener("blur", () => setTimeout(done, 150));
    ni.addEventListener("keydown", (e) => {
      if (e.key === "Enter") done();
    });
  });
  return addL2;
}
function bindCatRowHScroll(row) {
  row.addEventListener(
    "wheel",
    (e) => {
      if (row.scrollWidth <= row.clientWidth + 1) return;
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!dx) return;
      const max = row.scrollWidth - row.clientWidth;
      const next = Math.min(max, Math.max(0, row.scrollLeft + dx));
      if (next === row.scrollLeft) return;
      e.preventDefault();
      row.scrollLeft = next;
    },
    { passive: false }
  );
  let dragging = false;
  let moved2 = false;
  let startX = 0;
  let startLeft = 0;
  row.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("input, textarea, button, .pb-cat-tag")) return;
    dragging = true;
    moved2 = false;
    startX = e.clientX;
    startLeft = row.scrollLeft;
    row.style.cursor = "grabbing";
  });
  row.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const d = e.clientX - startX;
    if (!moved2 && Math.abs(d) < 5) return;
    if (!moved2) {
      moved2 = true;
      try {
        row.setPointerCapture(e.pointerId);
      } catch {
      }
    }
    row.scrollLeft = startLeft - d;
    e.preventDefault();
  });
  const endDrag2 = (e) => {
    if (!dragging) return;
    dragging = false;
    row.style.cursor = "";
    if (moved2) {
      const block = (ce) => {
        ce.stopPropagation();
        ce.preventDefault();
        row.removeEventListener("click", block, true);
      };
      row.addEventListener("click", block, true);
      setTimeout(() => row.removeEventListener("click", block, true), 0);
    }
    try {
      row.releasePointerCapture(e.pointerId);
    } catch {
    }
  };
  row.addEventListener("pointerup", endDrag2);
  row.addEventListener("pointercancel", endDrag2);
}
function renderWords() {
  const list = $("pbPresetList");
  if (!list) return;
  list.innerHTML = "";
  const items = getCurrentPresetItems();
  const l2 = getCurrentL2Category();
  if (!items) {
    const empty = div("pb-word-empty");
    empty.textContent = "\u8BF7\u9009\u62E9\u6216\u521B\u5EFA\u4E00\u4E2A\u4E8C\u7EA7\u5206\u7C7B";
    list.appendChild(empty);
    return;
  }
  if (items.length === 0) {
    const empty = div("pb-word-empty");
    empty.textContent = "\u6682\u65E0\u8BCD\u8BED\uFF0C\u53EF\u4ECE\u5DE5\u4F5C\u533A\u62D6\u5165\u6216\u70B9\u51FB\u6DFB\u52A0";
    empty.setAttribute("data-empty", "1");
    list.appendChild(empty);
    list._sortable = bindPresetList(list);
    return;
  }
  for (const item of items) {
    if (!item?.text) continue;
    list.appendChild(wordCard(item, l2?.color, state.l1Cat, state.l2Cat));
  }
  list._sortable = bindPresetList(list);
}
function wordCard(item, color, l1 = state.l1Cat, l2 = state.l2Cat) {
  const card = div("pb-word-card");
  card.setAttribute("data-preset-text", item.text);
  if (item.cnText) card.setAttribute("data-preset-cn", item.cnText);
  if (color) {
    card.style.setProperty("--pb-card-color", color);
    card.setAttribute("data-preset-color", color);
  }
  const main = span("pb-word-main");
  main.textContent = item.text;
  card.appendChild(main);
  if (item.cnText) {
    const sub = span("pb-word-sub");
    sub.textContent = item.cnText;
    card.appendChild(sub);
  }
  card.addEventListener("click", (e) => {
    if (e.target.closest(".pb-word-del, .pb-word-toolbar, .pb-word-edit")) return;
    const fb = getFocusedBox();
    if (!fb) return;
    dispatch({
      type: "chip/add",
      boxId: fb.box.id,
      chip: mkChip(item.text, item.cnText, 1, color)
    });
  });
  const del = document.createElement("button");
  del.type = "button";
  del.className = "pb-word-del";
  del.textContent = "\xD7";
  del.addEventListener("pointerdown", (e) => e.stopPropagation());
  del.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "preset/removeItem", text: item.text, l1, l2 });
  });
  card.appendChild(del);
  card.addEventListener("pointerenter", () => {
    if (window.__pb_dragging) return;
    showWordToolbar(card, item, l1, l2);
  });
  card.addEventListener("pointerleave", () => hideWordToolbar());
  return card;
}
var _wordTb = null;
var _wordTbTimer = null;
var _wordTbShowTimer = null;
var WORD_TB_SHOW_DELAY_MS = 200;
var _wordTbCtx = null;
var _wordEdit = null;
function ensureWordToolbar() {
  if (_wordTb) return _wordTb;
  _wordTb = div("pb-word-toolbar");
  _wordTb.innerHTML = `
    <button type="button" data-act="edit" title="\u7F16\u8F91\u4E2D\u82F1\u6587">\u270F\uFE0F</button>
  `;
  document.body.appendChild(_wordTb);
  _wordTb.addEventListener("pointerenter", () => {
    if (_wordTbTimer) clearTimeout(_wordTbTimer);
    if (_wordTbShowTimer) {
      clearTimeout(_wordTbShowTimer);
      _wordTbShowTimer = null;
    }
  });
  _wordTb.addEventListener("pointerleave", () => hideWordToolbar());
  _wordTb.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const act = e.target.closest("button")?.getAttribute("data-act");
    if (!_wordTbCtx || act !== "edit") return;
    const { item, l1, l2, card } = _wordTbCtx;
    hideWordToolbar(true);
    openWordEdit(card, item, l1, l2);
  });
  return _wordTb;
}
function showWordToolbar(card, item, l1, l2) {
  if (_wordTbTimer) clearTimeout(_wordTbTimer);
  _wordTbTimer = null;
  _wordTbCtx = { item, l1, l2, card };
  const place = () => {
    if (!_wordTbCtx || _wordTbCtx.card !== card) return;
    const tb = ensureWordToolbar();
    const rect = card.getBoundingClientRect();
    const tw = 36;
    let left = rect.left + rect.width / 2 - tw / 2;
    let top = rect.top - 30;
    if (top < 0) top = rect.bottom + 4;
    if (left < 0) left = 4;
    if (left + tw > window.innerWidth) left = window.innerWidth - tw - 4;
    tb.style.left = left + "px";
    tb.style.top = top + "px";
    tb.classList.add("pb-visible");
  };
  if (_wordTb?.classList.contains("pb-visible")) {
    if (_wordTbShowTimer) {
      clearTimeout(_wordTbShowTimer);
      _wordTbShowTimer = null;
    }
    place();
    return;
  }
  if (_wordTbShowTimer) clearTimeout(_wordTbShowTimer);
  _wordTbShowTimer = setTimeout(() => {
    _wordTbShowTimer = null;
    if (window.__pb_dragging) return;
    place();
  }, WORD_TB_SHOW_DELAY_MS);
}
function hideWordToolbar(immediate = false) {
  if (_wordTbShowTimer) {
    clearTimeout(_wordTbShowTimer);
    _wordTbShowTimer = null;
  }
  const run = () => {
    _wordTb?.classList.remove("pb-visible");
    _wordTbCtx = null;
  };
  if (immediate) {
    if (_wordTbTimer) clearTimeout(_wordTbTimer);
    _wordTbTimer = null;
    run();
    return;
  }
  if (_wordTbTimer) clearTimeout(_wordTbTimer);
  _wordTbTimer = setTimeout(run, 160);
}
function openWordEdit(card, item, l1, l2) {
  closeWordEdit();
  const panel = div("pb-word-edit");
  panel.innerHTML = `
    <label>\u82F1\u6587 / \u4E3B\u6587\u672C
      <input type="text" class="pb-we-en" value="${escapeHtml(item.text)}">
    </label>
    <label>\u4E2D\u6587
      <input type="text" class="pb-we-cn" value="${escapeHtml(item.cnText || "")}">
    </label>
    <div class="pb-word-edit-actions">
      <button type="button" data-act="cancel">\u53D6\u6D88</button>
      <button type="button" class="primary" data-act="save">\u4FDD\u5B58</button>
    </div>
  `;
  document.body.appendChild(panel);
  _wordEdit = panel;
  const rect = card.getBoundingClientRect();
  let left = rect.left;
  let top = rect.bottom + 6;
  if (left + 240 > window.innerWidth) left = window.innerWidth - 248;
  if (top + 140 > window.innerHeight) top = Math.max(8, rect.top - 140);
  panel.style.left = Math.max(8, left) + "px";
  panel.style.top = top + "px";
  const en = panel.querySelector(".pb-we-en");
  const cn = panel.querySelector(".pb-we-cn");
  en.focus();
  en.select();
  const save2 = () => {
    const text = en.value.trim();
    const cnText = cn.value.trim();
    if (!text) {
      toast("\u82F1\u6587\u4E0D\u80FD\u4E3A\u7A7A", "warn");
      return;
    }
    const ok = dispatch({
      type: "preset/updateItem",
      oldText: item.text,
      text,
      cnText,
      l1,
      l2
    });
    if (!ok && text !== item.text) {
      toast("\u82F1\u6587\u4E0E\u73B0\u6709\u8BCD\u91CD\u590D", "warn");
      return;
    }
    closeWordEdit();
  };
  panel.querySelector('[data-act="save"]')?.addEventListener("click", save2);
  panel.querySelector('[data-act="cancel"]')?.addEventListener("click", () => closeWordEdit());
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      save2();
    }
    if (e.key === "Escape") closeWordEdit();
  });
  setTimeout(() => {
    document.addEventListener("pointerdown", onWordEditOutside, true);
  }, 0);
}
function onWordEditOutside(e) {
  if (_wordEdit && !_wordEdit.contains(e.target)) {
    closeWordEdit();
  }
}
function closeWordEdit() {
  document.removeEventListener("pointerdown", onWordEditOutside, true);
  _wordEdit?.remove();
  _wordEdit = null;
}
var _popup = null;
var _popupTimer = null;
var CAT_POPUP_SHOW_DELAY_MS = 200;
var _popupShowTimer = null;
var _catEdit = null;
function scheduleCatPopup(tag, actions) {
  if (window.__pb_dragging) return;
  if (_popupTimer) {
    clearTimeout(_popupTimer);
    _popupTimer = null;
  }
  if (_popup) {
    if (_popupShowTimer) {
      clearTimeout(_popupShowTimer);
      _popupShowTimer = null;
    }
    showCatPopup(tag, actions);
    return;
  }
  if (_popupShowTimer) clearTimeout(_popupShowTimer);
  _popupShowTimer = setTimeout(() => {
    _popupShowTimer = null;
    if (window.__pb_dragging) return;
    if (!tag.isConnected || !tag.matches(":hover")) return;
    showCatPopup(tag, actions);
  }, CAT_POPUP_SHOW_DELAY_MS);
}
function attachL1Popup(tag, name) {
  tag.addEventListener("pointerenter", () => {
    scheduleCatPopup(tag, [
      { label: "\u270F\uFE0F", title: "\u4FEE\u6539", onClick: () => openL1Edit(tag, name) },
      {
        label: "\u{1F5D1}",
        title: "\u5220\u9664",
        onClick: () => {
          if (!confirm(`\u786E\u5B9A\u5220\u9664\u4E00\u7EA7\u5206\u7C7B\u300C${name}\u300D\uFF1F
\u5176\u4E0B\u6240\u6709\u4E8C\u7EA7\u5206\u7C7B\u4E0E\u8BCD\u8BED\u5C06\u4E00\u5E76\u5220\u9664\uFF08\u53EF\u64A4\u9500\uFF09\u3002`)) return;
          dispatch({ type: "preset/deleteL1", name });
        }
      }
    ]);
  });
  tag.addEventListener("pointerleave", () => {
    if (_popupShowTimer) {
      clearTimeout(_popupShowTimer);
      _popupShowTimer = null;
    }
    _popupTimer = setTimeout(hideCatPopup, 200);
  });
}
function attachL2Popup(tag, name, currentColor) {
  tag.addEventListener("pointerenter", () => {
    scheduleCatPopup(tag, [
      { label: "\u270F\uFE0F", title: "\u4FEE\u6539", onClick: () => openL2Edit(tag, name, currentColor) },
      {
        label: "\u{1F5D1}",
        title: "\u5220\u9664",
        onClick: () => {
          if (!confirm(`\u786E\u5B9A\u5220\u9664\u4E8C\u7EA7\u5206\u7C7B\u300C${name}\u300D\uFF1F
\u5176\u4E2D\u8BCD\u8BED\u5C06\u4E00\u5E76\u5220\u9664\uFF08\u53EF\u64A4\u9500\uFF09\u3002`)) return;
          dispatch({ type: "preset/deleteL2", name });
        }
      }
    ]);
  });
  tag.addEventListener("pointerleave", () => {
    if (_popupShowTimer) {
      clearTimeout(_popupShowTimer);
      _popupShowTimer = null;
    }
    _popupTimer = setTimeout(hideCatPopup, 200);
  });
}
function showCatPopup(anchor, actions) {
  if (window.__pb_dragging) return;
  if (_popupTimer) {
    clearTimeout(_popupTimer);
    _popupTimer = null;
  }
  _popup?.remove();
  _popup = null;
  document.querySelectorAll(".pb-cat-popup").forEach((n) => n.remove());
  const popup = div("pb-cat-popup");
  popup.style.cssText = "position:fixed;z-index:10007;display:flex;gap:2px;padding:3px;background:var(--pb-panel);border:1px solid var(--pb-border);border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.4);";
  for (const a of actions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = a.title;
    btn.textContent = a.label;
    btn.style.cssText = "font-size:11px;padding:2px 8px;border:none;background:transparent;color:var(--pb-text);cursor:pointer;border-radius:3px;";
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      hideCatPopup();
      a.onClick();
    });
    popup.appendChild(btn);
  }
  popup.addEventListener("pointerenter", () => {
    if (_popupTimer) clearTimeout(_popupTimer);
    if (_popupShowTimer) {
      clearTimeout(_popupShowTimer);
      _popupShowTimer = null;
    }
  });
  popup.addEventListener("pointerleave", () => {
    _popupTimer = setTimeout(hideCatPopup, 200);
  });
  document.body.appendChild(popup);
  const rect = anchor.getBoundingClientRect();
  popup.style.left = Math.min(rect.left, window.innerWidth - 140) + "px";
  popup.style.top = rect.bottom + 4 + "px";
  _popup = popup;
}
function hideCatPopup() {
  if (_popupShowTimer) {
    clearTimeout(_popupShowTimer);
    _popupShowTimer = null;
  }
  if (_popupTimer) {
    clearTimeout(_popupTimer);
    _popupTimer = null;
  }
  _popup?.remove();
  _popup = null;
  document.querySelectorAll(".pb-cat-popup").forEach((n) => n.remove());
}
function placeNear(el, anchor, minW = 240) {
  const rect = anchor.getBoundingClientRect();
  let left = rect.left;
  let top = rect.bottom + 6;
  if (left + minW > window.innerWidth) left = window.innerWidth - minW - 8;
  if (top + 160 > window.innerHeight) top = Math.max(8, rect.top - 160);
  el.style.left = Math.max(8, left) + "px";
  el.style.top = top + "px";
}
function openL1Edit(anchor, oldName) {
  closeCatEdit();
  const panel = div("pb-cat-edit");
  panel.innerHTML = `
    <label>\u4E00\u7EA7\u5206\u7C7B\u540D\u79F0
      <input type="text" class="pb-ce-name" value="${escapeHtml(oldName)}">
    </label>
    <div class="pb-cat-edit-actions">
      <button type="button" data-act="cancel">\u53D6\u6D88</button>
      <button type="button" class="primary" data-act="save">\u4FDD\u5B58</button>
    </div>
  `;
  document.body.appendChild(panel);
  _catEdit = panel;
  placeNear(panel, anchor);
  const nameInp = panel.querySelector(".pb-ce-name");
  nameInp.focus();
  nameInp.select();
  const save2 = () => {
    const v = nameInp.value.trim();
    if (!v) {
      toast("\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A", "warn");
      return;
    }
    if (v !== oldName) {
      const ok = dispatch({ type: "preset/renameL1", oldName, newName: v });
      if (!ok) {
        toast("\u540D\u79F0\u65E0\u6548\u6216\u5DF2\u5B58\u5728", "warn");
        return;
      }
    }
    closeCatEdit();
    if (v === oldName) renderPresets();
  };
  panel.querySelector('[data-act="save"]')?.addEventListener("click", save2);
  panel.querySelector('[data-act="cancel"]')?.addEventListener("click", () => closeCatEdit());
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save2();
    }
    if (e.key === "Escape") closeCatEdit();
  });
  setTimeout(() => document.addEventListener("pointerdown", onCatEditOutside, true), 0);
}
function openL2Edit(anchor, oldName, currentColor) {
  closeCatEdit();
  let picked = currentColor || getGroupColors()[0];
  const panel = div("pb-cat-edit");
  panel.innerHTML = `
    <label>\u4E8C\u7EA7\u5206\u7C7B\u540D\u79F0
      <input type="text" class="pb-ce-name" value="${escapeHtml(oldName)}">
    </label>
    <div>
      <div style="font-size:10px;color:var(--pb-text-dim);margin-bottom:4px;">\u989C\u8272</div>
      <div class="pb-cat-edit-swatches"></div>
    </div>
    <div class="pb-cat-edit-actions">
      <button type="button" data-act="cancel">\u53D6\u6D88</button>
      <button type="button" class="primary" data-act="save">\u4FDD\u5B58</button>
    </div>
  `;
  const swatches = panel.querySelector(".pb-cat-edit-swatches");
  for (const c of getGroupColors()) {
    const sw = div("pb-cat-edit-swatch");
    sw.style.background = c;
    if (c === picked) sw.classList.add("pb-current");
    sw.addEventListener("click", () => {
      picked = c;
      swatches.querySelectorAll(".pb-cat-edit-swatch").forEach((el) => el.classList.remove("pb-current"));
      sw.classList.add("pb-current");
    });
    swatches.appendChild(sw);
  }
  document.body.appendChild(panel);
  _catEdit = panel;
  placeNear(panel, anchor, 260);
  const nameInp = panel.querySelector(".pb-ce-name");
  nameInp.focus();
  nameInp.select();
  const save2 = () => {
    const v = nameInp.value.trim();
    if (!v) {
      toast("\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A", "warn");
      return;
    }
    let changed = false;
    if (v !== oldName) {
      const ok = dispatch({ type: "preset/renameL2", oldName, newName: v });
      if (!ok) {
        toast("\u540D\u79F0\u65E0\u6548\u6216\u5DF2\u5B58\u5728", "warn");
        return;
      }
      changed = true;
    }
    const catName = v !== oldName ? v : oldName;
    if (picked && picked !== currentColor) {
      dispatch({ type: "preset/setL2Color", name: catName, color: picked });
      changed = true;
    }
    closeCatEdit();
    if (!changed) renderPresets();
  };
  panel.querySelector('[data-act="save"]')?.addEventListener("click", save2);
  panel.querySelector('[data-act="cancel"]')?.addEventListener("click", () => closeCatEdit());
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save2();
    }
    if (e.key === "Escape") closeCatEdit();
  });
  setTimeout(() => document.addEventListener("pointerdown", onCatEditOutside, true), 0);
}
function onCatEditOutside(e) {
  if (_catEdit && !_catEdit.contains(e.target)) closeCatEdit();
}
function closeCatEdit() {
  document.removeEventListener("pointerdown", onCatEditOutside, true);
  _catEdit?.remove();
  _catEdit = null;
}

// src/ui/output.ts
init_pipe();
init_dom();
init_state();
var CSS7 = (
  /*css*/
  `
.pb-output-section {
  padding: 8px; border-bottom: 1px solid var(--pb-border);
  display: flex; flex-direction: column; flex: 1; min-height: 0;
}
.pb-output-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;
}
.pb-output-header span { font-size: 12px; font-weight: 600; color: var(--pb-text-dim); }
.pb-output-stats { font-size: 10px; color: var(--pb-text-dim); }
.pb-output-copy {
  font-size: 10px; padding: 2px 8px; border: 1px solid var(--pb-border);
  border-radius: 4px; background: transparent; color: var(--pb-text-dim); cursor: pointer;
}
.pb-output-copy:hover { border-color: var(--pb-accent); color: var(--pb-accent); }
.pb-output-text {
  flex: 1; overflow-y: auto; padding: 6px 8px; background: var(--pb-bg); border-radius: 4px;
  font-size: 12px; line-height: 1.55; word-break: break-all; color: var(--pb-text);
  white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; min-height: 40px;
  /* \u5F7B\u5E95\u53BB\u6389\u5916\u6846\uFF08border / outline / box-shadow\uFF09 */
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}
.pb-output-empty { color: var(--pb-text-dim); font-size: 12px; font-style: italic; text-align: center; padding: 12px; display: block; }
/* \u63D0\u793A\u8BCD\u5F69\u8272\u5206\u6BB5\uFF08\u52FF\u4E0E settings \u7684 .pb-segctrl \u6DF7\u6DC6\uFF09 */
.pb-seg {
  color: var(--pb-text); font-weight: 500;
  border: none !important; outline: none; box-shadow: none;
  display: inline; /* \u8986\u76D6\u4EFB\u4F55\u8BEF\u5957\u7528\u7684 flex \u5E03\u5C40 */
  padding: 0; margin: 0; border-radius: 0; overflow: visible;
}
.pb-seg-break {
  display: inline; color: var(--pb-danger); font-weight: 700;
  background: color-mix(in srgb, var(--pb-danger) 15%, transparent);
  padding: 0 3px; border-radius: 3px;
}
/* \u6D45\u8272\uFF1A\u8F93\u51FA\u533A\u7565\u52A0\u6DF1\u5E95\uFF0C\u5F69\u8272\u5206\u6BB5\u52A0\u7C97 + \u8F7B\u63CF\u8FB9\u4EE5\u4FDD\u8BC1\u53EF\u8BFB\u6027 */
#pbMainPanel.pb-light .pb-output-text {
  background: #d8c9a8;
  color: #1f1a12;
}
#pbMainPanel.pb-light .pb-seg {
  font-weight: 600;
  text-shadow:
    0 0 0.4px rgba(30, 24, 12, 0.35),
    0 0 0.4px rgba(30, 24, 12, 0.35);
}
#pbMainPanel.pb-light .pb-seg-break {
  background: color-mix(in srgb, var(--pb-danger) 22%, #f2e6ce);
  text-shadow: none;
}
`
);
var _css6 = false;
function parseHex(color) {
  const s = color.trim();
  const m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h2 = m[1];
  if (h2.length === 3) h2 = h2.split("").map((c) => c + c).join("");
  return {
    r: parseInt(h2.slice(0, 2), 16),
    g: parseInt(h2.slice(2, 4), 16),
    b: parseInt(h2.slice(4, 6), 16)
  };
}
function luminance(r, g, b) {
  const lin = (c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function adaptSegColor(color) {
  if (state.settings.theme !== "light") return color;
  const rgb = parseHex(color);
  if (!rgb) return color;
  let { r, g, b } = rgb;
  let L = luminance(r, g, b);
  const maxL = 0.42;
  if (L <= maxL) return color;
  let t = 0;
  while (L > maxL && t < 12) {
    r = Math.round(r * 0.82);
    g = Math.round(g * 0.82);
    b = Math.round(b * 0.82);
    L = luminance(r, g, b);
    t++;
  }
  const hex = (n) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
function renderSegments(segs) {
  if (!segs.length) return "";
  return segs.map((s) => {
    if (s.isBreak) return `<span class="pb-seg-break">${escapeHtml(s.text)}</span>`;
    if (s.color) {
      const c = adaptSegColor(s.color);
      return `<span class="pb-seg" style="color:${escapeHtml(c)}">${escapeHtml(s.text)}</span>`;
    }
    return `<span class="pb-seg">${escapeHtml(s.text)}</span>`;
  }).join("");
}
function renderOutput() {
  injectCSS("output", CSS7);
  _css6 = true;
  const slot = $("pbOutputSlot");
  if (!slot) return;
  const pos = buildPositiveText();
  const neg = buildNegativeText();
  const ps = countWordsAndChars(pos);
  const ns = countWordsAndChars(neg);
  const posHtml = pos ? renderSegments(buildPositiveSegments()) : '<span class="pb-output-empty">\u5728\u8BCD\u5E93\u4E2D\u70B9\u51FB\u6216\u5728\u8F93\u5165\u6846\u4E2D\u8F93\u5165</span>';
  const negHtml = neg ? renderSegments(buildNegativeSegments()) : '<span class="pb-output-empty">\u6682\u65E0\u8D1F\u9762\u63D0\u793A\u8BCD</span>';
  slot.innerHTML = `
    <div class="pb-output-section">
      <div class="pb-output-header">
        <span>Positive</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="pb-output-stats">${ps.words}\u8BCD \xB7 ${ps.chars}\u5B57</span>
          <button type="button" class="pb-output-copy" data-copy="${escapeHtml(pos)}">\u590D\u5236</button>
        </div>
      </div>
      <div class="pb-output-text">${posHtml}</div>
    </div>
    <div class="pb-output-section">
      <div class="pb-output-header">
        <span>Negative</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="pb-output-stats">${ns.words}\u8BCD \xB7 ${ns.chars}\u5B57</span>
          <button type="button" class="pb-output-copy" data-copy="${escapeHtml(neg)}">\u590D\u5236</button>
        </div>
      </div>
      <div class="pb-output-text">${negHtml}</div>
    </div>
  `;
  slot.querySelectorAll(".pb-output-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.textContent = "\u5DF2\u590D\u5236";
      setTimeout(() => {
        btn.textContent = "\u590D\u5236";
      }, 1200);
    });
  });
}

// src/ui/settings.ts
init_state();
init_pipe();
init_dom();
var CSS8 = (
  /*css*/
  `
.pb-settings { padding: 8px; }
.pb-setting-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.pb-setting-label { font-size: 12px; color: var(--pb-text-dim); }
/* \u8BBE\u7F6E\u5206\u6BB5\u63A7\u4EF6\uFF08\u52FF\u4E0E output \u7684 .pb-seg \u63D0\u793A\u8BCD\u5206\u6BB5\u540C\u540D\uFF09 */
.pb-segctrl { display: inline-flex; border: 1px solid var(--pb-border); border-radius: 4px; overflow: hidden; }
.pb-segctrl button {
  padding: 2px 8px; border: none; background: transparent; color: var(--pb-text-dim);
  font-size: 10px; cursor: pointer; border-right: 1px solid var(--pb-border);
}
.pb-segctrl button:last-child { border-right: none; }
.pb-segctrl button.pb-segctrl-active { background: var(--pb-accent); color: #fff; }
.pb-sel {
  background: var(--pb-bg); border: 1px solid var(--pb-border); border-radius: 4px;
  color: var(--pb-text); font-size: 10px; padding: 2px 4px;
}
.pb-custom-api-row { padding: 4px 0; display: flex; flex-direction: column; gap: 4px; }
.pb-custom-api-row input, .pb-custom-api-row textarea {
  width: 100%; background: var(--pb-bg); border: 1px solid var(--pb-border); border-radius: 3px;
  color: var(--pb-text); font-size: 10px; padding: 3px 6px; box-sizing: border-box;
}
.pb-custom-api-row textarea { height: 40px; resize: vertical; }
`
);
var _css7 = false;
function renderSettings() {
  if (!_css7) {
    injectCSS("settings", CSS8);
    _css7 = true;
  }
  const area = $("pbSettingsSlot");
  if (!area) return;
  area.innerHTML = `
    <div class="pb-settings">
      <div class="pb-setting-row">
        <span class="pb-setting-label">\u754C\u9762\u7F29\u653E</span>
        <div class="pb-segctrl" id="pbSegScale">
          <button type="button" data-val="sm">\u5C0F</button>
          <button type="button" data-val="mid">\u4E2D</button>
          <button type="button" data-val="lg">\u5927</button>
        </div>
      </div>
      <div class="pb-setting-row">
        <span class="pb-setting-label">\u7FFB\u8BD1\u5F15\u64CE</span>
        <select class="pb-sel" id="pbSelTranslator">
          <option value="mymemory">MyMemory</option>
          <option value="google">Google</option>
          <option value="custom">\u81EA\u5B9A\u4E49</option>
        </select>
      </div>
      <div class="pb-custom-api-row" id="pbCustomApiRow" style="display:none;">
        <input type="text" id="pbApiUrl" placeholder="API URL ({text} {src} {tgt})">
        <select id="pbApiMethod" class="pb-sel" style="width:100%;">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <textarea id="pbApiBody" placeholder="\u8BF7\u6C42\u4F53 JSON \u6A21\u677F"></textarea>
        <input type="text" id="pbApiField" placeholder="\u54CD\u5E94\u5B57\u6BB5\u8DEF\u5F84">
      </div>
      <div class="pb-setting-row">
        <span class="pb-setting-label">\u4E3B\u9898</span>
        <div class="pb-segctrl" id="pbSegTheme">
          <button type="button" data-val="dark">\u6697\u8272</button>
          <button type="button" data-val="light">\u4EAE\u8272</button>
        </div>
      </div>
    </div>
  `;
  bindSeg("pbSegScale", "scale");
  bindSeg("pbSegTheme", "theme");
  const sel = $("pbSelTranslator");
  if (sel) {
    sel.value = state.settings.translator;
    sel.addEventListener("change", () => {
      dispatch({ type: "settings/patch", patch: { translator: sel.value } });
    });
  }
  const persistApi = () => {
    dispatch({
      type: "settings/customApi",
      patch: {
        url: $("pbApiUrl")?.value.trim() || "",
        method: $("pbApiMethod")?.value || "POST",
        body: $("pbApiBody")?.value || "",
        responseField: $("pbApiField")?.value.trim() || ""
      }
    });
  };
  ["pbApiUrl", "pbApiMethod", "pbApiBody", "pbApiField"].forEach((id) => {
    $(id)?.addEventListener("change", persistApi);
    $(id)?.addEventListener("blur", persistApi);
  });
  applySettings();
}
function bindSeg(id, key) {
  const seg = $(id);
  if (!seg) return;
  seg.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      dispatch({ type: "settings/patch", patch: { [key]: btn.dataset.val } });
    });
  });
}
function applySettings() {
  const panel = $("pbMainPanel");
  if (!panel) return;
  const s = state.settings;
  const scales = { sm: "0.85", mid: "1", lg: "1.15" };
  panel.style.zoom = scales[s.scale];
  panel.classList.toggle("pb-light", s.theme === "light");
  const root = document.documentElement;
  if (s.theme === "light") {
    root.style.setProperty("--pb-bg", "#e4d5b8");
    root.style.setProperty("--pb-panel", "#f2e6ce");
    root.style.setProperty("--pb-panel-2", "#d6c4a0");
    root.style.setProperty("--pb-border", "#c4b08a");
    root.style.setProperty("--pb-text", "#2a2416");
    root.style.setProperty("--pb-text-dim", "#6e6350");
    root.style.setProperty("--pb-accent", "#6aa9ff");
    root.style.setProperty("--pb-danger", "#ff6b6b");
    root.style.setProperty("--pb-chip-bg", "#e0d2b0");
    root.style.setProperty("--pb-chip-bg-focus", "#d4c49a");
  } else {
    root.style.setProperty("--pb-bg", "#0f1115");
    root.style.setProperty("--pb-panel", "#161a22");
    root.style.setProperty("--pb-panel-2", "#1c2230");
    root.style.setProperty("--pb-border", "#262d3b");
    root.style.setProperty("--pb-text", "#e6e9ef");
    root.style.setProperty("--pb-text-dim", "#8a93a6");
    root.style.setProperty("--pb-accent", "#6aa9ff");
    root.style.setProperty("--pb-danger", "#ff6b6b");
    root.style.setProperty("--pb-chip-bg", "#2a3142");
    root.style.setProperty("--pb-chip-bg-focus", "#324063");
  }
  syncSeg("pbSegScale", s.scale);
  syncSeg("pbSegTheme", s.theme);
  const sel = $("pbSelTranslator");
  if (sel) sel.value = s.translator;
  const row = $("pbCustomApiRow");
  if (row) row.style.display = s.translator === "custom" ? "" : "none";
  if (s.translator === "custom") {
    const url = $("pbApiUrl");
    const method = $("pbApiMethod");
    const body = $("pbApiBody");
    const field = $("pbApiField");
    if (url && document.activeElement !== url) url.value = s.customApi.url;
    if (method && document.activeElement !== method) method.value = s.customApi.method;
    if (body && document.activeElement !== body) body.value = s.customApi.body;
    if (field && document.activeElement !== field) field.value = s.customApi.responseField;
  }
}
function syncSeg(id, value) {
  $(id)?.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("pb-segctrl-active", btn.dataset.val === value);
  });
}

// src/index.ts
init_toast();
window.__comfyApp = app;
initFromStorage();
void preloadTagIndex();
setRenderer((scopes) => {
  const all = scopes.has("all");
  if (all || scopes.has("workspace")) renderWorkspace();
  if (all || scopes.has("presets")) renderPresets();
  if (all || scopes.has("output")) renderOutput();
  if (all || scopes.has("settings")) {
    renderSettings();
  }
  applySettings();
  if (all || scopes.has("workspace")) paintSelectionClasses();
  updateUndoButtons();
});
setUndoRestoreHandler(() => {
  refreshAll();
  updateUndoButtons();
});
function renderAll() {
  renderPresets();
  renderWorkspace();
  renderOutput();
  renderSettings();
  applySettings();
  updateUndoButtons();
}
function openNode(node) {
  setActiveNode(node);
  const panel = getPanel();
  if (node.id != null) panel.dataset.activeNode = String(node.id);
  clearUndo();
  clearSelection();
  loadNodeIntoCur(node);
  renderAll();
  showPanel();
}
function softReloadActiveNode(node) {
  const panel = getPanel();
  if (panel.classList.contains("pb-hidden")) return;
  const activeId = panel.dataset.activeNode;
  if (activeId == null || String(node.id) !== activeId) return;
  setActiveNode(node);
  loadNodeIntoCur(node);
  renderAll();
}
function doUndo() {
  undo();
  updateUndoButtons();
}
function doRedo() {
  redo();
  updateUndoButtons();
}
function exportPresetsOnly() {
  const data = {
    type: "promptbuildernext_presets",
    presets: state.presets,
    l1Cat: state.l1Cat,
    l2Cat: state.l2Cat
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `promptbuildernext_presets_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("\u8BCD\u5E93\u5DF2\u5BFC\u51FA", "ok");
}
function importPresetsOnly() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.presets) {
        dispatch({
          type: "preset/replace",
          presets: data.presets,
          l1Cat: data.l1Cat,
          l2Cat: data.l2Cat
        });
        toast("\u8BCD\u5E93\u5DF2\u5BFC\u5165", "ok");
      } else {
        toast("\u6587\u4EF6\u4E2D\u6CA1\u6709\u8BCD\u5E93\u6570\u636E", "warn");
      }
    } catch {
      toast("\u5BFC\u5165\u5931\u8D25", "error");
    }
  });
  input.click();
}
function bindStatusLink(id, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.classList.contains("pb-disabled")) return;
    fn();
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (el.classList.contains("pb-disabled")) return;
      fn();
    }
  });
}
function bindButtons() {
  bindStatusLink("pbUndoBtn", () => doUndo());
  bindStatusLink("pbRedoBtn", () => doRedo());
  bindStatusLink("pbExportBtn", exportPresetsOnly);
  bindStatusLink("pbImportBtn", importPresetsOnly);
  document.getElementById("pbTranslateBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("pbTranslateBtn");
    const chips = [
      ...cur.workspace.flatMap((g) => g.inputboxes.flatMap((b) => b.chips)),
      ...cur.negativeGroup.inputboxes.flatMap((b) => b.chips)
    ].filter((c) => !c.cnText && c.text.trim());
    if (!chips.length) {
      toast("\u6CA1\u6709\u9700\u8981\u7FFB\u8BD1\u7684\u8BCD\u8BED", "warn");
      return;
    }
    if (btn) btn.disabled = true;
    const before = cloneUndoSnapshot();
    chips.forEach((c) => {
      c.translating = true;
    });
    renderWorkspace();
    try {
      const { translateChips: translateChips2 } = await Promise.resolve().then(() => (init_translation(), translation_exports));
      const { ok } = await translateChips2(chips);
      if (ok > 0) {
        recordUndoSnapshot(before);
        updateUndoButtons();
      }
      dispatch(
        {
          type: "workspace/replace",
          workspace: cur.workspace,
          negativeGroup: cur.negativeGroup,
          focusedBox: cur.focusedBox
        },
        { noUndo: true }
      );
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  document.getElementById("pbClearBtn")?.addEventListener("click", () => {
    dispatch({ type: "workspace/clear" });
  });
  document.getElementById("pbGenerateBtn")?.addEventListener("click", () => {
    try {
      app.queuePrompt(0, 1);
    } catch {
    }
  });
}
function bindKeys() {
  document.addEventListener("keydown", (e) => {
    if (!isPanelVisible()) return;
    const t = e.target;
    const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === "X" || e.key === "x")) {
      e.preventDefault();
      toggleMinimized();
      return;
    }
    if (inField) return;
    if (e.key === "Escape") {
      clearSelection();
      return;
    }
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      doUndo();
    }
    if (mod && (e.key === "y" || e.key === "z" && e.shiftKey)) {
      e.preventDefault();
      doRedo();
    }
    if (mod && (e.key === "a" || e.key === "A")) {
      e.preventDefault();
      const boxId = cur.focusedBox;
      if (boxId && findBox(boxId)) selectAllInBox(boxId);
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (getSelectedCount() > 0) {
        e.preventDefault();
        dispatch({ type: "chip/batchRemove", chipIds: getSelectedIds() });
        clearSelection();
      }
    }
  });
}
function bindClearSelectionOnOutsideClick() {
  document.addEventListener("pointerdown", (e) => {
    if (!isPanelVisible()) return;
    if (getSelectedCount() === 0) return;
    const t = e.target;
    if (!t) return;
    if (t.closest(".pb-chip, .pb-chip-toolbar, .pb-chip-edit-panel")) return;
    clearSelection();
  }, true);
}
getPanel();
bindButtons();
bindKeys();
bindClearSelectionOnOutsideClick();
updateUndoButtons();
app.registerExtension({
  name: "promptbuilder.promptbuildernext",
  nodeCreated(node) {
    if (!NODE_TYPES.includes(node.comfyClass)) return;
    node.addWidget("button", "\u270F\uFE0F Edit in PromptBuilder", null, () => {
      openNode(node);
      const p = getPanel();
      p.classList.remove("pb-hidden", "pb-minimized");
    });
    setTimeout(() => {
      for (const w of node.widgets || []) {
        if ((w.name === "positive" || w.name === "negative") && w.element) {
          const ta = w.element.querySelector?.("textarea") || w.element;
          ta.disabled = true;
        }
      }
    }, 200);
  },
  getNodeMenuItems(node) {
    if (!NODE_TYPES.includes(node.comfyClass)) return [];
    return [{
      content: "\u270F\uFE0F Edit in PromptBuilder",
      callback: () => openNode(node)
    }];
  },
  beforeRegisterNodeDef(nodeType, nodeData, _appRef) {
    if (!NODE_TYPES.includes(nodeData.name)) return;
    const orig = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function(...args) {
      const r = orig?.apply(this, args);
      try {
        softReloadActiveNode(this);
      } catch {
      }
      return r;
    };
  }
});
console.log("[PromptBuilder] ready (dispatch + Sortable gate)");
/*! Bundled license information:

sortablejs/modular/sortable.esm.js:
  (**!
   * Sortable 1.15.7
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   *)
*/
//# sourceMappingURL=promptbuilder.js.map
