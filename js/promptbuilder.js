import { app } from "../../scripts/app.js";

/* ============================================================
   PromptBuilder ComfyUI 插件
   浮动面板（三栏）= 单例视图，绑定到「当前活动节点」
   - 左栏：预设词库（全局共享；双行分类 / 词语 / 跨分类搜索 / 拖拽排序）
   - 中栏：工作区（分组 → 输入框 → chip，权重/翻译/bypass/拖拽排序）
   - 右栏：输出（复制按钮 + 词条计数，自动 sync 到活动节点）
   其它：撤销/恢复、导出词库 JSON / 导入（自动识别）、面板位置记忆、拖拽指示线
   ============================================================
   架构（v4 起）：
   - 全局 state：presets（词库）/ l1Cat,l2Cat / settings —— 多节点共享，
     存 localStorage（promptbuilder_presets / promptbuilder_settings）。
   - 每个节点的提示词（workspace / negativeGroup / focusedBox）存在
     node.properties.pb_state（JSON），随工作流保存、随拖图加载，节点间互相独立。
   - 面板不直接持有提示词，而是加载到内存变量 cur；切换/打开节点时重载。
   撤销/重做只跟当前节点；切换节点时清栈。
   ============================================================ */
app.registerExtension({
  name: "promptbuilder.promptbuilder",

  init() {
    // ==================== 样式：全部 pb- 前缀，避免污染 ComfyUI ====================
    const style = document.createElement("style");
    style.textContent = `
.pb-panel *{box-sizing:border-box}
:root{--pb-bg:#0f1115;--pb-panel:#161a22;--pb-panel-2:#1c2230;--pb-border:#262d3b;--pb-text:#e6e9ef;--pb-text-dim:#8a93a6;--pb-accent:#6aa9ff;--pb-accent-2:#8b6aff;--pb-danger:#ff6b6b;--pb-chip-bg:#2a3142;--pb-chip-bg-focus:#324063}
.pb-panel{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Roboto,Arial,sans-serif;font-size:14px;position:fixed;top:50px;left:50px;width:950px;height:620px;z-index:9999;display:none;flex-direction:column;border:1px solid var(--pb-border);border-radius:10px;background:var(--pb-bg);color:var(--pb-text);box-shadow:0 8px 32px rgba(0,0,0,.6);resize:both;overflow:hidden;min-width:900px;min-height:400px}
.pb-panel.visible{display:flex}
.pb-titlebar{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;background:var(--pb-panel-2);border-bottom:1px solid var(--pb-border);cursor:move;user-select:none;font-size:13px;font-weight:600;flex-shrink:0}
.pb-title-name{pointer-events:none}
.pb-title-actions{display:flex;align-items:center;gap:6px}
.pb-title-actions .pb-btn{cursor:pointer}
.pb-titlebar .pb-close{cursor:pointer;color:var(--pb-text-dim);font-size:16px;padding:0 4px}
.pb-titlebar .pb-close:hover{color:var(--pb-danger)}
.pb-minimize{cursor:pointer;color:var(--pb-text-dim);font-size:16px;padding:0 4px;line-height:1}
.pb-minimize:hover{color:var(--pb-accent)}
.pb-min-grip{color:var(--pb-text-dim);font-size:13px;letter-spacing:2px;opacity:.45;margin-right:10px;flex-shrink:0;pointer-events:none}
/* 收起态：只留 titlebar 小条 */
.pb-panel.minimized{height:auto!important;width:auto!important;min-width:unset;min-height:unset;resize:none}
.pb-panel.minimized .pb-body{display:none}
.pb-panel.minimized .pb-statusbar{display:none}
.pb-panel.minimized .pb-titlebar{border-radius:10px;border-bottom:none;padding:8px 18px;gap:14px}
.pb-panel.minimized .pb-title-actions{gap:10px}
.pb-panel.minimized .pb-title-actions .pb-btn:not(#pbGenerate){display:none}
.pb-panel.minimized .pb-min-grip{opacity:.7;margin-right:16px}
.pb-body{display:grid;grid-template-columns:280px 4px 1fr 4px 260px;flex:1;min-height:0;overflow:hidden}
.pb-col{display:flex;flex-direction:column;background:var(--pb-panel);border-right:1px solid var(--pb-border);min-width:0;overflow:hidden}
.pb-col:nth-child(1){min-width:240px}
.pb-col:nth-child(3){min-width:400px}
.pb-col:nth-child(5){min-width:240px}
.pb-col:last-child{border-right:none;border-left:1px solid var(--pb-border)}
.pb-col-divider{background:var(--pb-border);cursor:col-resize;transition:background .15s}
.pb-col-divider:hover,.pb-col-divider.active{background:var(--pb-accent)}
.pb-col-header{display:flex;align-items:center;justify-content:space-between;padding:0 10px;gap:6px;border-bottom:1px solid var(--pb-border);font-weight:600;font-size:13px;background:var(--pb-panel-2);flex-shrink:0;height:36px}
.pb-col-body{flex:1;overflow:auto;padding:8px 10px;min-height:0;scrollbar-width:none}
.pb-col-body::-webkit-scrollbar{width:0;height:0;display:none}
.pb-btn{border:1px solid var(--pb-border);background:var(--pb-panel-2);color:var(--pb-text);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;transition:all .15s;white-space:nowrap}
.pb-btn:hover{border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-btn.primary{background:var(--pb-accent);color:#0b1020;border-color:var(--pb-accent);font-weight:600}
.pb-btn.primary:hover{filter:brightness(1.1)}
.pb-preset-search{padding:6px 8px;border-bottom:1px solid var(--pb-border);background:var(--pb-panel-2)}
.pb-preset-search input{width:100%;background:var(--pb-panel);border:1px solid var(--pb-border);color:var(--pb-text);border-radius:4px;padding:4px 8px;font-size:12px;box-sizing:border-box}
.pb-preset-search input:focus{outline:none;border-color:var(--pb-accent)}
.pb-preset-cats{display:flex;flex-wrap:nowrap;gap:4px;padding:6px 8px;border-bottom:1px solid var(--pb-border);background:var(--pb-panel-2);overflow-x:auto;overflow-y:hidden;scroll-behavior:smooth;scrollbar-width:none}
.pb-preset-cats::-webkit-scrollbar{height:0;width:0;display:none}
.pb-preset-cats.pb-l2{border-bottom:1px solid var(--pb-border);background:var(--pb-panel);padding:4px 8px;gap:3px}
.pb-cat-tag{display:inline-flex;align-items:center;gap:2px;padding:3px 10px;border-radius:999px;background:var(--pb-chip-bg);cursor:pointer;user-select:none;font-size:12px;border:1px solid transparent;white-space:nowrap;flex-shrink:0}
.pb-cat-tag.active{background:var(--pb-accent);color:#0b1020;font-weight:600}
.pb-cat-tag:hover:not(.active){border-color:var(--pb-accent)}
.pb-cat-tag .pb-cat-x{font-size:13px;color:var(--pb-text-dim);cursor:pointer;margin-left:2px;line-height:1}
.pb-cat-tag .pb-cat-x:hover{color:var(--pb-danger)}
.pb-cat-tag.active .pb-cat-x{color:rgba(0,0,0,.4)}
.pb-cat-tag.active .pb-cat-x:hover{color:#600}
.pb-cat-add{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;border:1px dashed var(--pb-border);color:var(--pb-text-dim);cursor:pointer;font-size:12px;white-space:nowrap;flex-shrink:0;background:transparent}
.pb-cat-add:hover{border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-cat-input{padding:3px 8px;border-radius:999px;background:var(--pb-panel-2);border:1px solid var(--pb-accent);color:var(--pb-text);font-size:12px;width:100px;outline:none}
.pb-cat-input:focus{outline:none}
.pb-preset-list{display:flex;flex-wrap:wrap;gap:4px;padding:8px}
.pb-preset-word{display:inline-flex;align-items:center;gap:2px;padding:3px 4px 3px 10px;border-radius:6px;background:var(--pb-chip-bg);font-size:12px;cursor:pointer;transition:all .15s;border:1px solid transparent}
.pb-preset-word:hover{background:var(--pb-chip-bg-focus);border-color:var(--pb-accent)}
.pb-preset-word.dragging{opacity:.4}
.pb-preset-word .text{display:flex;flex-direction:column;line-height:1.3}
.pb-preset-x{min-width:22px;align-self:stretch;text-align:center;border:none;background:transparent;color:var(--pb-text-dim);cursor:pointer;font-size:13px;padding:0 3px;border-radius:4px}
.pb-preset-x:hover{background:var(--pb-panel-2);color:var(--pb-danger)}
.pb-preset-add-btn{width:100%;background:transparent;border:1px dashed var(--pb-border);color:var(--pb-text-dim);border-radius:6px;padding:5px 8px;font-size:12px;cursor:pointer;margin-top:4px}
.pb-preset-add-btn:hover{border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-preset-add-row{display:flex;flex-direction:column;gap:4px;margin-top:4px;width:100%}
.pb-preset-add-row input{width:100%;background:var(--pb-panel-2);border:1px solid var(--pb-border);color:var(--pb-text);border-radius:4px;padding:4px 6px;font-size:12px}
.pb-preset-add-row input:focus{outline:none;border-color:var(--pb-accent)}
.pb-preset-add-row .pb-row-actions{display:flex;gap:4px;justify-content:flex-end}
.pb-preset-add-row .pb-translate-mini{padding:3px 8px;background:var(--pb-accent);color:#0b1020;border:none;border-radius:4px;font-size:11px;cursor:pointer;font-weight:600}
.pb-preset-add-row .pb-translate-mini:hover{filter:brightness(1.1)}
.pb-preset-add-row .pb-save-mini{padding:3px 10px;background:var(--pb-panel-2);color:var(--pb-text);border:1px solid var(--pb-border);border-radius:4px;font-size:11px;cursor:pointer}
.pb-preset-add-row .pb-save-mini:hover{border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-group{background:#294429;border:1px solid var(--pb-border);border-radius:8px;margin-bottom:8px;overflow:hidden;position:relative}
.pb-group.negative-fixed{background:#442929;margin-top:20px}
.pb-group.dragging{opacity:.4}
.pb-group.disabled{opacity:.5;filter:grayscale(.5)}
.pb-group.disabled .pb-group-color-bar{opacity:.4}
.pb-group-color-bar{height:3px;background:var(--pb-accent)}
.pb-group-header{display:flex;align-items:center;gap:6px;padding:6px 8px;cursor:pointer;user-select:none}
.pb-group-header .name{font-weight:600;flex:1;font-size:13px}
.pb-group-header .caret{transition:transform .2s;color:var(--pb-text-dim);font-size:11px}
.pb-group.collapsed .caret{transform:rotate(-90deg)}
.pb-group.collapsed .pb-group-body{display:none}
.pb-color-dot{width:13px;height:13px;border-radius:50%;cursor:pointer;border:1px solid rgba(255,255,255,.1)}
.pb-group-body{padding:4px 8px 8px}
.pb-inputbox{background:var(--pb-panel);border:1px solid var(--pb-border);border-radius:6px;padding:6px;margin-bottom:6px;position:relative}
.pb-inputbox.dragging{opacity:.4}
.pb-inputbox.disabled{opacity:.5;filter:grayscale(.5)}
.pb-inputbox.focused{border-color:var(--pb-box-color, var(--pb-accent));outline:2px solid var(--pb-box-color, var(--pb-accent));outline-offset:-1px;position:relative}
.pb-inputbox.focused::before{content:"";position:absolute;left:-1px;top:-1px;bottom:-1px;width:3px;background:var(--pb-box-color, var(--pb-accent));border-radius:6px 0 0 6px}
.pb-inputbox-header{display:flex;align-items:center;gap:4px;margin-bottom:4px;background:rgba(0,0,0,.15);border-radius:4px;padding:3px 4px}
.pb-inputbox-toggle{background:transparent;border:none;color:var(--pb-text-dim);cursor:pointer;font-size:12px;padding:1px 3px;border-radius:4px;flex-shrink:0}
.pb-inputbox-toggle:hover{color:var(--pb-accent)}
.pb-inputbox-title{background:transparent;color:var(--pb-text);border:1px solid transparent;border-radius:4px;padding:3px 4px;font-size:12px;font-weight:600;flex:1;min-width:0}
.pb-inputbox-title:hover,.pb-inputbox-title:focus{border-color:var(--pb-border);outline:none}
.pb-inputbox-remove{color:var(--pb-text-dim);cursor:pointer;padding:1px 3px;font-size:13px;opacity:0;transition:opacity .12s}
.pb-inputbox:hover .pb-inputbox-remove,.pb-inputbox-remove:focus{opacity:1}
.pb-inputbox-remove:hover{color:var(--pb-danger)}
.pb-chip-area{display:flex;flex-wrap:wrap;gap:4px;min-height:30px;padding:3px;border-radius:4px}
.pb-chip{display:inline-flex;align-items:center;gap:1px;background:var(--pb-chip-bg);padding:3px 6px;border-radius:6px;font-size:12px;border:1px solid transparent;user-select:none}
.pb-chip .text{display:flex;flex-direction:column;padding:0 5px;line-height:1.3}
.pb-chip .text .w{color:var(--pb-text-dim);font-size:10px}
.pb-chip-main{white-space:nowrap}
.pb-chip-sub{font-size:10px;color:var(--pb-text-dim);line-height:1.2}
.pb-chip-path{font-size:9px;color:var(--pb-text-dim);opacity:.7;line-height:1.2;margin-top:1px;font-style:italic}
.pb-chip.translating .pb-chip-sub{color:var(--pb-accent)}
.pb-chip.dragging{opacity:.4}
.pb-chip-x{border:none;background:transparent;color:var(--pb-text-dim);cursor:pointer;font-size:13px;padding:0 2px;border-radius:4px;flex-shrink:0;line-height:1}
.pb-chip-x:hover{color:var(--pb-danger)}
.pb-chip .w{color:var(--pb-text-dim);font-size:10px;margin-left:3px}
.pb-chip.translating{opacity:.8}
.pb-chip.translating::after{content:"⟳";font-size:10px;margin-left:2px;color:var(--pb-accent)}
.pb-chip.bypassed{opacity:.45;text-decoration:line-through}
/* 浮动工具栏：单例，mouseenter 时定位到 chip 上方/下方 */
.pb-chip-toolbar{position:fixed;z-index:10007;display:flex;align-items:center;gap:2px;background:var(--pb-panel-2);border:1px solid var(--pb-accent);border-radius:6px;padding:3px 6px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .12s,visibility .12s;pointer-events:none}
.pb-chip-toolbar.show{opacity:1;visibility:visible;pointer-events:auto}
.pb-chip-toolbar button{background:transparent;border:none;color:var(--pb-text-dim);cursor:pointer;font-size:13px;padding:2px 4px;border-radius:4px;min-width:22px;text-align:center;line-height:1}
.pb-chip-toolbar button:hover{color:var(--pb-accent);background:var(--pb-panel)}
.pb-chip-input{background:transparent;border:none;color:var(--pb-text);font-size:12px;flex:1;min-width:80px;outline:none;padding:2px 3px}
.pb-autocomplete{position:fixed;z-index:10006;background:var(--pb-panel-2);border:1px solid var(--pb-accent);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.5);max-height:240px;overflow:auto;min-width:180px;display:none}
.pb-autocomplete.show{display:block}
.pb-ac-item{display:flex;flex-direction:column;padding:5px 10px;cursor:pointer;gap:1px}
.pb-ac-item .en{font-size:12px;color:var(--pb-text)}
.pb-ac-item .cn{font-size:10px;color:var(--pb-text-dim)}
.pb-ac-item:hover,.pb-ac-item.active{background:var(--pb-chip-bg-focus)}
.pb-col.drop-hover{border-color:var(--pb-accent);box-shadow:inset 0 0 0 2px rgba(106,169,255,.3)}
/* 亮色主题：覆盖 --pb-* 变量 */
.pb-panel.pb-light{--pb-bg:#f5f6f8;--pb-panel:#ffffff;--pb-panel-2:#eef0f4;--pb-border:#d4d9e3;--pb-text:#1a1f2e;--pb-text-dim:#6b7280;--pb-chip-bg:#e3e7ef;--pb-chip-bg-focus:#d0d8f0}
.pb-panel.pb-light .pb-group{background:#e8f0e8}.pb-panel.pb-light .pb-group.negative-fixed{background:#f0e8e8}
.pb-panel.pb-light .pb-add-inputbox{background:#e8eef0}
/* 设置区 */
.pb-settings{padding:8px 8px 12px;border-top:1px solid var(--pb-border);flex-shrink:0}
.pb-settings-title{font-size:11px;color:var(--pb-text-dim);text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px}
.pb-setting-row{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;font-size:12px}
.pb-setting-row .label{color:var(--pb-text-dim);white-space:nowrap}
.pb-seg{display:inline-flex;border:1px solid var(--pb-border);border-radius:6px;overflow:hidden}
.pb-seg button{background:transparent;border:none;color:var(--pb-text-dim);font-size:11px;padding:3px 9px;cursor:pointer;border-right:1px solid var(--pb-border);transition:all .12s}
.pb-seg button:last-child{border-right:none}
.pb-seg button.active{background:var(--pb-accent);color:#0b1020;font-weight:600}
.pb-seg button:hover:not(.active){color:var(--pb-accent)}
.pb-setting-select{background:var(--pb-panel-2);color:var(--pb-text);border:1px solid var(--pb-border);border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;outline:none;flex:1;max-width:130px}
.pb-setting-select:focus{border-color:var(--pb-accent)}
.pb-add-inputbox{width:100%;padding:5px;font-size:12px;background:#1b291b;border:1px dashed var(--pb-border);border-radius:4px;color:var(--pb-text-dim);cursor:pointer}
.pb-add-inputbox:hover{border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-add-group{width:100%;padding:8px;font-size:13px;background:transparent;border:1px dashed var(--pb-border);border-radius:8px;color:var(--pb-text-dim);cursor:pointer}
.pb-add-group:hover{border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-group.negative-fixed .pb-group-header{cursor:pointer}
.pb-group.negative-fixed .pb-inputbox-header{cursor:default}
.pb-translate-bar{display:flex;align-items:center;gap:6px;margin-left:auto}
.pb-translate-toggle{padding:3px 8px;border-radius:999px;border:1px solid var(--pb-border);background:transparent;color:var(--pb-text-dim);font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap;user-select:none}
.pb-translate-toggle.on{background:var(--pb-accent);color:#0b1020;border-color:var(--pb-accent)}
.pb-translate-toggle:hover:not(.on){border-color:var(--pb-accent);color:var(--pb-accent)}
.pb-output-wrap{margin:6px 8px}
.pb-output-label{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--pb-text-dim);text-transform:uppercase;letter-spacing:.3px;margin-bottom:3px}
.pb-output-box{margin:0;padding:8px;background:var(--pb-panel-2);border:1px solid var(--pb-border);border-radius:6px;font-family:"SF Mono",Consolas,"Courier New",monospace;font-size:12px;line-height:1.5;min-height:60px;white-space:pre-wrap;word-break:break-word;color:var(--pb-text)}
.pb-output-count,.pb-box-token{margin-top:4px;font-size:10px;color:var(--pb-text-dim);text-align:right;letter-spacing:.2px}
.pb-output-count .tok-warn,.pb-box-token .tok-warn{color:#ffd86a}
.pb-output-count .tok-over,.pb-box-token .tok-over{color:var(--pb-danger)}
.pb-color-picker{position:fixed;z-index:10000;background:var(--pb-panel-2);border:1px solid var(--pb-border);border-radius:6px;padding:6px;display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
.pb-color-swatch{width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid transparent}
.pb-color-swatch:hover{border-color:#fff}
.pb-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:10001}
.pb-modal{background:var(--pb-panel);border:1px solid var(--pb-border);border-radius:8px;padding:16px;min-width:280px;max-width:400px}
.pb-modal h3{margin:0 0 10px;font-size:15px}
.pb-modal .pb-row{display:flex;gap:6px;justify-content:flex-end}
.pb-modal .pb-form-row{display:flex;flex-direction:column;gap:3px;margin-bottom:10px}
.pb-modal .pb-form-row label{font-size:12px;color:var(--pb-text-dim)}
.pb-modal .pb-form-row input,.pb-modal .pb-form-row textarea{background:var(--pb-panel-2);color:var(--pb-text);border:1px solid var(--pb-border);border-radius:4px;padding:5px 6px;font-size:13px;font-family:inherit}
.pb-modal .pb-form-row input:focus,.pb-modal .pb-form-row textarea:focus{outline:none;border-color:var(--pb-accent)}
.pb-modal .pb-form-row textarea{min-height:80px;resize:vertical}
.pb-toast-wrap{position:fixed;top:60px;right:20px;z-index:10005;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.pb-drop-indicator{position:fixed;z-index:10010;pointer-events:none;background:#ffd86a;border-radius:2px;display:none}
.pb-drop-indicator.h{height:4px;min-width:30px}
.pb-drop-indicator.v{width:4px;min-height:20px}
.pb-drop-indicator.show{display:block}
.pb-toast{background:var(--pb-panel-2);border:1px solid var(--pb-border);border-left:3px solid var(--pb-accent);border-radius:6px;padding:8px 12px;font-size:12px;color:var(--pb-text);box-shadow:0 4px 16px rgba(0,0,0,.5);max-width:300px;animation:pbToastIn .15s ease}
.pb-toast.error{border-left-color:var(--pb-danger)}
.pb-toast.warn{border-left-color:#ffd86a}
.pb-toast.ok{border-left-color:#6affb6}
.pb-toast.fade{opacity:0;transition:opacity .3s}
@keyframes pbToastIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
.pb-panel ::-webkit-scrollbar{width:6px;height:6px}
.pb-panel ::-webkit-scrollbar-track{background:transparent}
.pb-panel ::-webkit-scrollbar-thumb{background:var(--pb-border);border-radius:3px}
.pb-panel ::-webkit-scrollbar-thumb:hover{background:#3a4357}
.pb-panel{scrollbar-width:thin;scrollbar-color:var(--pb-border) transparent}
.pb-statusbar{display:flex;align-items:center;justify-content:space-between;padding:4px 12px;background:var(--pb-panel-2);border-top:1px solid var(--pb-border);cursor:move;user-select:none;font-size:11px;color:var(--pb-text-dim);flex-shrink:0}
.pb-status-grip{letter-spacing:2px;opacity:.6}
.pb-status-author{opacity:.5}
`;
    document.head.appendChild(style);

    // ==================== 浮动面板 DOM ====================
    const panel = document.createElement("div");
    panel.className = "pb-panel";
    panel.id = "pbMainPanel";
    panel.innerHTML = `
      <div class="pb-titlebar"><span class="pb-min-grip" title="拖拽移动">⋮⋮</span><span class="pb-title-name">PromptBuilder</span><div class="pb-title-actions"><button class="pb-btn" id="pbUndo" title="撤销 (Ctrl+Z)">↶</button><button class="pb-btn" id="pbRedo" title="重做 (Ctrl+Y)">↷</button><button class="pb-btn" id="pbExportPresets" title="导出词库（分类 & 词语）">⬆ 词库</button><button class="pb-btn" id="pbImport" title="导入 JSON（自动识别词库或提示词）">⬇ 导入</button><button class="pb-btn primary" id="pbGenerate" title="执行生成 (1 张)" style="margin-left:4px">▶ 生成</button><span class="pb-minimize" title="收起面板">−</span><span class="pb-close">×</span></div></div>
      <div class="pb-body">
        <div class="pb-col">
          <div class="pb-col-header"><span>预设词库</span></div>
          <div class="pb-preset-search"><input id="pbPresetSearch" placeholder="搜索词语…" autocomplete="off"/></div>
          <div class="pb-preset-cats" id="pbPresetCats"></div>
          <div class="pb-preset-cats pb-l2" id="pbPresetCatsL2"></div>
          <div class="pb-col-body" style="padding:0"><div class="pb-preset-list" id="pbPresetList"></div><div class="pb-preset-list" id="pbPresetSearchResults" style="display:none"></div></div>
        </div>
        <div class="pb-col-divider"></div>
        <div class="pb-col">
          <div class="pb-col-header">
            <span>工作区</span>
            <div class="pb-translate-bar">
              <button class="pb-translate-toggle" id="pbTranslateToggle">🌐 翻译</button>
              <button class="pb-translate-toggle" id="pbClearAll" style="background:transparent;border:1px solid var(--pb-border)" title="清空工作区">🧹 清空</button>
            </div>
          </div>
          <div class="pb-col-body" id="pbWorkspace"></div>
        </div>
        <div class="pb-col-divider"></div>
        <div class="pb-col">
          <div class="pb-col-header">输出</div>
          <div class="pb-col-body">
            <div class="pb-output-wrap"><div class="pb-output-label"><span>Positive Prompt</span><button class="pb-btn" id="pbCopyPos">复制</button></div><div class="pb-output-box" id="pbOutputBoxPos"></div><div class="pb-output-count" id="pbOutputCountPos"></div></div>
            <div class="pb-output-wrap"><div class="pb-output-label"><span>Negative Prompt</span><button class="pb-btn" id="pbCopyNeg">复制</button></div><div class="pb-output-box" id="pbOutputBoxNeg"></div><div class="pb-output-count" id="pbOutputCountNeg"></div></div>
          </div>
          <div class="pb-settings">
            <div class="pb-settings-title">设置</div>
            <div class="pb-setting-row"><span class="label">界面缩放</span><div class="pb-seg" id="pbSegScale"><button data-v="sm">小</button><button data-v="mid" class="active">中</button><button data-v="lg">大</button></div></div>
            <div class="pb-setting-row"><span class="label">翻译引擎</span><select id="pbSelTranslator" class="pb-setting-select"><option value="mymemory">MyMemory</option><option value="google">Google</option><option value="custom">自定义</option></select></div>
            <div class="pb-setting-row" id="pbCustomApiRow" style="display:none"><span class="label">自定义 API</span><button class="pb-btn" id="pbCustomApiCfg" title="配置自定义翻译 API" style="font-size:11px;padding:2px 8px">⚙ 配置</button></div>
            <div class="pb-setting-row"><span class="label">主题</span><div class="pb-seg" id="pbSegTheme"><button data-v="dark" class="active">暗色</button><button data-v="light">亮色</button></div></div>
          </div>
        </div>
      </div>
      <div class="pb-statusbar"><span class="pb-status-grip">⋮⋮</span><span class="pb-status-author">@trancentral</span></div>`;
    document.body.appendChild(panel);

    // ==================== 面板位置/尺寸记忆 ====================
    const PANEL_GEO_KEY = "promptbuilder_comfy_panelgeo";
    function savePanelGeo() {
      try {
        const r = panel.getBoundingClientRect();
        localStorage.setItem(PANEL_GEO_KEY, JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height }));
      } catch (e) {}
    }
    function restorePanelGeo() {
      try {
        const g = JSON.parse(localStorage.getItem(PANEL_GEO_KEY));
        if (!g) return;
        // 限制在视口内，避免完全飞出屏幕
        const left = clamp(g.left, 0, Math.max(0, window.innerWidth - 100));
        const top = clamp(g.top, 0, Math.max(0, window.innerHeight - 60));
        panel.style.left = left + "px"; panel.style.top = top + "px";
        if (g.width) panel.style.width = g.width + "px";
        if (g.height) panel.style.height = g.height + "px";
      } catch (e) {}
    }
    restorePanelGeo();

    // ==================== 面板拖拽（titlebar + statusbar 双端） ====================
    // 绑定一个拖拽手柄；closeSelector 指定该手柄上需放过的关闭按钮
    // 用 offsetLeft/offsetTop 增量计算，避免 zoom 下 getBoundingClientRect 偏移
    function bindDrag(handle, closeSelector) {
      handle.onmousedown = (e) => {
        if (closeSelector && e.target.closest(closeSelector)) return;
        const startLeft = panel.offsetLeft, startTop = panel.offsetTop;
        const startClientX = e.clientX, startClientY = e.clientY;
        const onMove = (ev) => { panel.style.left = (startLeft + ev.clientX - startClientX) + "px"; panel.style.top = (startTop + ev.clientY - startClientY) + "px"; };
        const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); savePanelGeo(); };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        e.preventDefault();
      };
    }
    bindDrag(panel.querySelector(".pb-titlebar"), ".pb-close");
    bindDrag(panel.querySelector(".pb-statusbar"), null);
    // ==================== 列宽可拖拽分隔条 ====================
    const COL_WIDTH_KEY = "promptbuilder_comfy_colwidths";
    const bodyEl = panel.querySelector(".pb-body");
    function saveColWidths() {
      try {
        const allCols = [...bodyEl.querySelectorAll(".pb-col")];
        const val = `${allCols[0].offsetWidth}px 4px 1fr 4px ${allCols[2].offsetWidth}px`;
        bodyEl.style.gridTemplateColumns = val;
        localStorage.setItem(COL_WIDTH_KEY, val);
      } catch (e) {}
    }
    function restoreColWidths() {
      try {
        const w = localStorage.getItem(COL_WIDTH_KEY);
        if (w) bodyEl.style.gridTemplateColumns = w;
      } catch (e) {}
    }
    restoreColWidths();
    function bindColumnResize(divider, leftIdx) {
      divider.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const allCols = [...bodyEl.querySelectorAll(".pb-col")];
        const w = allCols.map(c => c.offsetWidth);
        const startLeft = w[leftIdx], startRight = w[leftIdx + 1];
        const MINS = [240, 400, 240];
        divider.classList.add("active");
        bodyEl.style.userSelect = "none";
        const onMove = (ev) => {
          const dx = ev.clientX - startX;
          // 钳定 delta：任一侧触底时分隔条停止移动
          const maxDx = startRight - MINS[leftIdx + 1];
          const minDx = MINS[leftIdx] - startLeft;
          const clamped = Math.max(minDx, Math.min(maxDx, dx));
          w[leftIdx] = Math.max(MINS[leftIdx], startLeft + clamped);
          w[leftIdx + 1] = Math.max(MINS[leftIdx + 1], startRight - clamped);
          bodyEl.style.gridTemplateColumns = `${w[0]}px 4px ${w[1]}px 4px ${w[2]}px`;
        };
        const onUp = () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          divider.classList.remove("active");
          bodyEl.style.userSelect = "";
          saveColWidths();
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      });
    }
    bindColumnResize(bodyEl.querySelector(".pb-col-divider"), 0);
    bindColumnResize(bodyEl.querySelectorAll(".pb-col-divider")[1], 1);
    // ==================== 面板位置/大小持久化 ====================
    try {
      const ro = new ResizeObserver(() => savePanelGeo());
      ro.observe(panel);
    } catch (e) {}
    function closePanel() { panel.classList.remove("visible"); const p = document.querySelector(".pb-color-picker"); if (p) p.remove(); hideIndicator(); hideAc(); clearTimeout(_toolbarHideTimer); clearTimeout(_switchTimer); if (_toolbarEl) _toolbarEl.classList.remove("show"); _activeChipEl = null; }
    panel.querySelector(".pb-close").onclick = closePanel;
    const minBtn = panel.querySelector(".pb-minimize");
    if (minBtn) minBtn.onclick = (e) => {
      e.stopPropagation();
      panel.classList.toggle("minimized");
      minBtn.textContent = panel.classList.contains("minimized") ? "⛶" : "−";
      minBtn.title = panel.classList.contains("minimized") ? "展开面板" : "收起面板";
      clearTimeout(_toolbarHideTimer); clearTimeout(_switchTimer); if (_toolbarEl) _toolbarEl.classList.remove("show"); _activeChipEl = null;
      savePanelGeo();
    };

    /* ============================================================
       逻辑入口
       ============================================================ */
    // ==================== 工具函数 ====================
    const $ = (id) => document.getElementById(id);
    const COLORS = ["#6aa9ff","#8b6aff","#ff6b9d","#ff9f6a","#ffd86a","#6affb6","#6ae0ff","#ff6b6b","#b46aff","#6a8aff","#9aff6a","#ff6ad8"];
    const MAX_WEIGHT = 5.0;

    // ==================== 数据模型工厂 ====================
    // 函数声明会被提升，故放在此处也可被前面的 state 初始化代码调用
    function gid() { return Math.random().toString(36).slice(2, 9); }
    /** 创建一个输入框（box） */
    function mkBox(title = "默认") { return { id: gid(), title, enabled: true, chips: [] }; }
    /** 创建一个普通分组（group） */
    function mkGroup(name, color) { return { id: gid(), name, color, enabled: true, collapsed: false, break: false, inputboxes: [mkBox()] }; }
    /** 创建负面提示词分组（固定结构） */
    function mkNegativeGroup() { return { id: "__neg__", name: "负面提示词", color: COLORS[3], enabled: true, collapsed: false, break: false, inputboxes: [mkBox()] }; }
    /** 创建一个 chip（weight 可选，默认 1.0） */
    function mkChip(text, cnText, weight) { return { id: gid(), text, cnText: cnText || null, weight: weight == null ? 1.0 : +weight, enabled: true }; }

    /** 统一 group 迁移：删废弃 weight 死字段 + 补 enabled（分组/输入框两层）。
     *  幂等：对新数据无副作用。供节点状态反序列化、导入等多处复用。 */
    function migrateGroups(groups) {
      (groups || []).forEach(g => {
        if (!g) return;
        delete g.weight;                          // v1：清理死字段
        if (g.enabled === undefined) g.enabled = true;     // v2：分组级
        if (g.break === undefined) g.break = false;        // v4：分组级 BREAK 隔离
        (g.inputboxes || []).forEach(b => { if (b.enabled === undefined) b.enabled = true; (b.chips || []).forEach(c => { if (c.enabled === undefined) c.enabled = true; }); }); // v3：输入框级 & chip 级
      });
    }

    // ==================== 全局共享 state（词库 / UI 设置）====================
    // 仅保存多节点共享的数据。节点专属的提示词（workspace/negativeGroup/focusedBox）
    // 不在此处，而是存到 node.properties.pb_state。
    let state = {
      _v: 3,
      presets: { items: [], children: {} },
      l1Cat: null, l2Cat: null,
      settings: { scale: "mid", translator: "mymemory", theme: "dark", customApi: { url: "", method: "GET", body: "", responseField: "" } },
    };

    // ==================== 当前编辑态（从活动节点加载到内存）====================
    let activeNode = null;            // 当前绑定的 PromptBuilderCLIPEncode 节点
    let cur = {
      workspace: [mkGroup("人物", COLORS[0])],
      negativeGroup: mkNegativeGroup(),
      focusedBox: null,
    };

    // ==================== 共享 state 从 localStorage 加载（带迁移）====================
    // 老版本（≤v3）把全部数据塞在一个 promptbuilder_comfy_state 键里；v4 拆键后，
    // 旧键里的 presets/settings 仍被读取迁移到新键，workspace/negativeGroup 按既定
    // 决策丢弃（每个节点从此自带状态，不再有"全局默认提示词"概念）。
    try {
      const oldSaved = JSON.parse(localStorage.getItem("promptbuilder_comfy_state"));
      if (oldSaved && oldSaved.presets?.children) {
        state.presets = oldSaved.presets;
        state.l1Cat = oldSaved.l1Cat || Object.keys(state.presets.children)[0] || null;
        state.l2Cat = oldSaved.l2Cat || Object.keys(state.presets.children[state.l1Cat]?.children || {})[0] || null;
        if (oldSaved.settings) state.settings = Object.assign(state.settings, oldSaved.settings);
      }
    } catch (e) {}
    try {
      const pSaved = JSON.parse(localStorage.getItem("promptbuilder_presets"));
      if (pSaved?.presets?.children) {
        state.presets = pSaved.presets;
        state.l1Cat = pSaved.l1Cat || Object.keys(state.presets.children)[0] || null;
        state.l2Cat = pSaved.l2Cat || Object.keys(state.presets.children[state.l1Cat]?.children || {})[0] || null;
      }
    } catch (e) {}
    try {
      const sSaved = JSON.parse(localStorage.getItem("promptbuilder_settings"));
      if (sSaved?.settings) state.settings = Object.assign(state.settings, sSaved.settings);
    } catch (e) {}
    // 兜底：词库没有任何 L1 分类时补一个默认空分类，避免左栏空白
    if (!Object.keys(state.presets.children).length) {
      state.presets.children["我的词库"] = { items: [], children: { "默认": { items: [], children: {} } } };
      state.l1Cat = "我的词库"; state.l2Cat = "默认";
    }
    if (!state.l1Cat || !state.presets.children[state.l1Cat]) {
      state.l1Cat = Object.keys(state.presets.children)[0] || null;
    }
    if (state.l1Cat && (!state.l2Cat || !state.presets.children[state.l1Cat]?.children?.[state.l2Cat])) {
      state.l2Cat = Object.keys(state.presets.children[state.l1Cat]?.children || {})[0] || null;
    }

    let _presetIndex = [];     // 词库扁平索引，renderPresets 末尾重建
    let _danbooruIndex = [];   // danbooru 标签索引 [[en, zh], ...]，init 时异步加载
    let _danbooruLoading = false;
    let _pendingFocusBox = null; // 输入确认后保持聚焦的 box id
    let _acLayer = null;       // 自动补全浮层元素（懒创建）
    let _acItems = [];         // 当前浮层显示的候选词对象数组
    let _acActive = -1;        // 当前高亮项索引
    let _toolbarEl = null, _toolbarHideTimer = null, _activeChipEl = null, _switchTimer = null; // chip 浮动工具栏
    let _persistTimer;
    // ==================== 撤销 / 恢复 ====================
    // 策略：以 persist() 的 200ms 防抖为快照边界 —— 连续输入会合并为一次可撤销操作，
    // 避免逐字符产生海量快照。undoStack 存历史，redoStack 存撤销后可重做的状态。
    const UNDO_LIMIT = 50;
    let undoStack = [];   // 历史快照（较旧 → 较新）
    let redoStack = [];
    let _lastSnapshot = null; // 最近一次持久化后的快照（仅含 cur 节点态）
    /** 快照当前节点的编辑态（workspace/negativeGroup/focusedBox）。
     *  不含共享的 presets/settings —— 它们不进撤销栈（改它们会影响所有节点）。 */
    function snapshotState() {
      return JSON.parse(JSON.stringify({
        workspace: cur.workspace, negativeGroup: cur.negativeGroup, focusedBox: cur.focusedBox
      }));
    }
    /** 切换节点时清空撤销栈：A 节点的撤销不应作用于 B 节点。 */
    function clearUndoStacks() { undoStack = []; redoStack = []; _lastSnapshot = null; }
    function restoreSnapshot(snap) {
      if (!snap) return;
      cur.workspace = snap.workspace; cur.negativeGroup = snap.negativeGroup; cur.focusedBox = snap.focusedBox;
      renderWorkspace(); renderOutput();
    }
    function undo() {
      if (!undoStack.length) { toast("没有可撤销的操作", "", 1200); return; }
      redoStack.push(_lastSnapshot);
      const prev = undoStack.pop();
      _lastSnapshot = prev;
      restoreSnapshot(prev);
      saveCurrentNodeState();
      toast("已撤销", "ok", 1000);
    }
    function redo() {
      if (!redoStack.length) { toast("没有可重做的操作", "", 1200); return; }
      undoStack.push(_lastSnapshot);
      const next = redoStack.pop();
      _lastSnapshot = next;
      restoreSnapshot(next);
      saveCurrentNodeState();
      toast("已重做", "ok", 1000);
    }
    /** 写共享数据（词库 + 设置）到 localStorage，分两个键。 */
    function saveSharedState() {
      try {
        localStorage.setItem("promptbuilder_presets", JSON.stringify({
          _v: state._v, presets: state.presets, l1Cat: state.l1Cat, l2Cat: state.l2Cat
        }));
        localStorage.setItem("promptbuilder_settings", JSON.stringify({ settings: state.settings }));
      }
      catch (e) { toast("存储空间不足，部分更改未能保存", "warn", 3000); }
    }
    let _snapshotTimer = null;
    // 快照压栈用更长防抖（600ms），合并连续输入为单个撤销点；写入仍用 200ms
    function scheduleSnapshot() {
      clearTimeout(_snapshotTimer);
      _snapshotTimer = setTimeout(() => {
        if (_lastSnapshot !== null) {
          undoStack.push(_lastSnapshot);
          if (undoStack.length > UNDO_LIMIT) undoStack.shift();
        }
        _lastSnapshot = snapshotState();
        redoStack = []; // 新操作清空 redo
      }, 600);
    }
    /** persist：共享数据落 localStorage + 当前节点态写回 node.properties + 排撤销快照。
     *  任何编辑收口都走这里，确保两边都不漏。 */
    function persist() {
      clearTimeout(_persistTimer);
      _persistTimer = setTimeout(() => { saveSharedState(); saveCurrentNodeState(); scheduleSnapshot(); }, 200);
    }
    /** 统一的"重新渲染 + 持久化"收口，绝大多数状态变更后调用 */
    function commit() { renderWorkspace(); renderOutput(); persist(); }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

    // ==================== 节点状态序列化 / 反序列化（核心）====================
    // 每个节点的提示词存到 node.properties.pb_state（JSON 字符串），随工作流保存、
    // 随拖图加载。面板打开/切换节点时把它反序列化到内存 cur。
    const PB_STATE_VERSION = 3;
    /** 把当前 cur 拍平成 JSON 字符串（供写入 node.properties.pb_state）。 */
    function serializeNodeState() {
      return JSON.stringify({
        _v: PB_STATE_VERSION,
        workspace: cur.workspace,
        negativeGroup: cur.negativeGroup,
        focusedBox: cur.focusedBox
      });
    }
    /** 把节点状态写回活动节点，并标记工作流已修改（保证 ComfyUI 存盘带上 properties）。
     *  空操作：没有活动节点时直接返回。 */
    function saveCurrentNodeState() {
      if (!activeNode) return;
      try {
        activeNode.properties.pb_state = serializeNodeState();
        app.graph?.change?.();
      } catch (e) {}
    }
    /** 扁平提示词文本 → chip 数组（fallback 用：旧版/外部工作流只有 positive/negative 文本）。
     *  识别 "(text:权重)" 语法还原权重；不识别的按 weight=1.0。无法还原分组/颜色/中英对照。 */
    function parseFlatToChips(text) {
      const chips = [];
      String(text || "").split(/[,\n]/).map(s => s.trim()).filter(Boolean).forEach(term => {
        const m = term.match(/^\((.+):(-?\d+(?:\.\d+)?)\)$/);  // (text:1.2)
        if (m) {
          const w = clamp(+parseFloat(m[2]).toFixed(1), 0.1, MAX_WEIGHT);
          chips.push(mkChip(m[1].trim(), null, w));
        } else {
          chips.push(mkChip(term, null, 1.0));
        }
      });
      return chips;
    }
    /** 从节点读出状态并写入 cur。三层 fallback：
     *  1) node.properties.pb_state（结构化，含分组/权重/颜色）→ 完整还原
     *  2) 节点的 positive/negative widget 文本 → 扁平解析成单个"导入"分组 + 负面
     *  3) 都没有 → 默认空白 workspace + 默认 negativeGroup
     *  返回是否走了结构化路径（用于 UI 提示）。 */
    function deserializeNodeState(node) {
      // 1) 结构化
      try {
        const raw = node.properties?.pb_state;
        if (raw) {
          const s = JSON.parse(raw);
          if (s && (s.workspace || s.negativeGroup)) {
            cur.workspace = Array.isArray(s.workspace) && s.workspace.length ? s.workspace : [mkGroup("人物", COLORS[0])];
            cur.negativeGroup = s.negativeGroup || mkNegativeGroup();
            cur.focusedBox = s.focusedBox ?? null;
            migrateGroups(cur.workspace);
            migrateGroups([cur.negativeGroup]);
            if (!cur.negativeGroup?.inputboxes?.length) cur.negativeGroup = mkNegativeGroup();
            return true;
          }
        }
      } catch (e) {}
      // 2) 扁平文本 fallback
      const posWidget = node.widgets?.find(w => w.name === "positive");
      const negWidget = node.widgets?.find(w => w.name === "negative");
      const posText = (posWidget?.value || "").trim();
      const negText = (negWidget?.value || "").trim();
      if (posText || negText) {
        const g = mkGroup("导入", COLORS[0]);
        g.inputboxes = [{ id: gid(), title: "默认", enabled: true, chips: parseFlatToChips(posText) }];
        cur.workspace = [g];
        const ng = mkNegativeGroup();
        ng.inputboxes[0].chips = parseFlatToChips(negText);
        cur.negativeGroup = ng;
        cur.focusedBox = g.inputboxes[0].id;
        return false;
      }
      // 3) 默认空白
      cur.workspace = [mkGroup("人物", COLORS[0])];
      cur.negativeGroup = mkNegativeGroup();
      cur.focusedBox = cur.workspace[0].inputboxes[0].id;
      return false;
    }
    /** 绑定某节点为活动节点：切 activeNode → 重载 cur → 清撤销栈 → 全量重渲染。 */
    function loadNodeIntoPanel(node) {
      activeNode = node;
      panel.dataset.activeNode = String(node.id);
      clearUndoStacks();
      deserializeNodeState(node);
      applySettings(); renderPresets(); renderWorkspace(); renderOutput();
      _lastSnapshot = snapshotState(); // 撤销基准
    }

    // ==================== 设置：界面缩放 / 翻译引擎 / 主题 ====================
    function applySettings() {
      const st = state.settings;
      // 缩放：用 zoom（Chromium 支持，不影响 getBoundingClientRect 坐标体系）
      const zoomMap = { sm: 0.85, mid: 1.0, lg: 1.2 };
      panel.style.zoom = zoomMap[st.scale] ?? 1.0;
      // 主题
      panel.classList.toggle("pb-light", st.theme === "light");
      // 同步分段按钮高亮
      syncSeg("pbSegScale", st.scale);
      const selTrans = $("pbSelTranslator"); if (selTrans) selTrans.value = st.translator;
      syncSeg("pbSegTheme", st.theme);
      // 自定义 API 配置行仅在选中"自定义"时显示
      const customRow = $("pbCustomApiRow"); if (customRow) customRow.style.display = (st.translator === "custom") ? "" : "none";
    }
    function syncSeg(segId, value) {
      const seg = $(segId); if (!seg) return;
      seg.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.v === value));
    }
    function bindSeg(segId, key) {
      const seg = $(segId); if (!seg) return;
      seg.querySelectorAll("button").forEach(b => {
        b.onclick = (e) => {
          e.stopPropagation();
          state.settings[key] = b.dataset.v;
          applySettings(); persist();
        };
      });
    }
    bindSeg("pbSegScale", "scale");
    const selTrans = $("pbSelTranslator");
    if (selTrans) selTrans.onchange = (e) => { e.stopPropagation(); state.settings.translator = selTrans.value; applySettings(); persist(); };
    bindSeg("pbSegTheme", "theme");
    // 自定义 API 配置弹窗
    const cfgBtn = $("pbCustomApiCfg");
    if (cfgBtn) cfgBtn.onclick = (e) => {
      e.stopPropagation();
      const ca = state.settings.customApi || {};
      const form = document.createElement("div");
      // URL
      const urlRow = document.createElement("div"); urlRow.className = "pb-form-row";
      urlRow.innerHTML = '<label>请求 URL（支持 {text} {src} {tgt} 占位符）</label>';
      const urlInp = document.createElement("input"); urlInp.value = ca.url || ""; urlInp.placeholder = "https://api.example.com/translate?q={text}&from={src}&to={tgt}";
      urlRow.appendChild(urlInp); form.appendChild(urlRow);
      // 方法
      const methodRow = document.createElement("div"); methodRow.className = "pb-form-row";
      methodRow.innerHTML = '<label>请求方法</label>';
      const methodSel = document.createElement("select"); methodSel.style.cssText = "background:var(--pb-panel-2);color:var(--pb-text);border:1px solid var(--pb-border);border-radius:4px;padding:5px 6px;font-size:13px";
      ["GET", "POST"].forEach(m => { const o = document.createElement("option"); o.value = m; o.textContent = m; if ((ca.method || "GET") === m) o.selected = true; methodSel.appendChild(o); });
      methodRow.appendChild(methodSel); form.appendChild(methodRow);
      // Body
      const bodyRow = document.createElement("div"); bodyRow.className = "pb-form-row";
      bodyRow.innerHTML = '<label>请求体（POST 时使用，JSON 模板，支持 {text} {src} {tgt}）</label>';
      const bodyInp = document.createElement("textarea"); bodyInp.value = ca.body || ""; bodyInp.placeholder = '{"text":"{text}","source":"{src}","target":"{tgt}"}';
      bodyRow.appendChild(bodyInp); form.appendChild(bodyRow);
      // 响应字段
      const respRow = document.createElement("div"); respRow.className = "pb-form-row";
      respRow.innerHTML = '<label>响应字段路径（点号分隔，如 data.result 或 0.0.0）</label>';
      const respInp = document.createElement("input"); respInp.value = ca.responseField || ""; respInp.placeholder = "data.result";
      respRow.appendChild(respInp); form.appendChild(respRow);
      openModal({
        title: "自定义翻译 API", bodyEl: form, submitText: "保存",
        onSubmit: () => {
          state.settings.customApi = { url: urlInp.value.trim(), method: methodSel.value, body: bodyInp.value, responseField: respInp.value.trim() };
          persist(); toast("自定义 API 配置已保存", "ok", 1500);
        }
      });
    };
    applySettings();

    // ==================== 翻译（按 settings.translator 分支） ====================
    
    function detectPair(text) { return /[\u4e00-\u9fff]|\p{sc=Han}/u.test(text) ? { src: "zh", tgt: "en" } : { src: "en", tgt: "zh" }; }
    /** 通用并发池：限制同时执行的异步任务数量 */
    async function runPool(items, limit, fn) {
      let i = 0;
      const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) { const idx = i++; await fn(items[idx], idx); }
      });
      await Promise.all(workers);
    }
    // 按点号路径取值：支持 "data.result"、"0.0.0"（数组索引）等
    function getByPath(obj, path) {
      if (!path) return obj;
      return path.split(".").reduce((cur, key) => (cur == null ? cur : cur[key]), obj);
    }
    // 占位符替换：{text} {src} {tgt}
    // jsonSafe=true 时对 {text} 的值做 JSON 字符串内容转义（仅用于 POST body 模板），
    // 保证用户词语文本中的 " \ 换行等字符不会破坏 JSON 结构。{src}/{tgt} 为固定语言代码，无需转义。
    function fillTemplate(tpl, text, src, tgt, jsonSafe) {
      const textVal = jsonSafe ? text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") : text;
      return (tpl || "").replace(/\{text\}/g, () => textVal).replace(/\{src\}/g, src).replace(/\{tgt\}/g, tgt);
    }
    // 返回 { ok, text?, reason? }：ok=true 且 text 为空表示"无需翻译"；reason 用于 toast
    async function translateText(text) {
      if (!text || !text.trim()) return { ok: true, text: "" };
      const { src, tgt } = detectPair(text);
      if (src === tgt) return { ok: true, text };
      const engine = state.settings.translator || "mymemory";
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      try {
        let out;
        if (engine === "google") {
          // Google 非官方端点（免费、无需 key，稳定性一般）
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tgt}&dt=t&q=${encodeURIComponent(text)}`, { signal: ctrl.signal });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          // 返回格式：[[[译文, 原文, ...], ...], ...]
          out = (data?.[0] || []).map(seg => seg?.[0] || "").join("");
        } else if (engine === "custom") {
          // 自定义 API
          const ca = state.settings.customApi || {};
          if (!ca.url) return { ok: false, reason: "未配置自定义 API（请点⚙配置）" };
          const url = fillTemplate(ca.url, encodeURIComponent(text), src, tgt);
          const opt = { signal: ctrl.signal };
          if (ca.method === "POST") {
            opt.method = "POST"; opt.headers = { "Content-Type": "application/json" };
            opt.body = fillTemplate(ca.body || "{}", text, src, tgt, true);
          }
          const res = await fetch(url, opt);
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json().catch(() => ({}));
          out = getByPath(data, ca.responseField);
          if (typeof out !== "string") out = out != null ? String(out) : "";
        } else {
          // MyMemory（默认）
          const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`, { signal: ctrl.signal });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const data = await res.json();
          out = data?.responseData?.translatedText;
          if (out && /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(out)) return { ok: false, reason: "翻译额度已达上限，请稍后再试" };
        }
        if (!out) return { ok: false, reason: "翻译接口未返回结果" };
        return { ok: true, text: out };
      } catch (e) {
        const reason = e.name === "AbortError" ? "翻译请求超时" : "翻译请求失败（网络错误）";
        return { ok: false, reason };
      }
      finally { clearTimeout(tid); }
    }

    // ==================== 弹窗 ====================
    let _modalMask = null;
    function openModal({ title, bodyEl, onSubmit, submitText = "保存", cancelText = "取消" }) {
      closeModal();
      const mask = document.createElement("div"); mask.className = "pb-modal-mask";
      const modal = document.createElement("div"); modal.className = "pb-modal";
      const h = document.createElement("h3"); h.textContent = title;
      const actions = document.createElement("div"); actions.className = "pb-row";
      const cancel = document.createElement("button"); cancel.className = "pb-btn"; cancel.textContent = cancelText;
      const ok = document.createElement("button"); ok.className = "pb-btn primary"; ok.textContent = submitText;
      actions.append(cancel, ok); modal.append(h, bodyEl, actions); mask.appendChild(modal);
      mask.addEventListener("click", (e) => { if (e.target === mask) closeModal(); });
      cancel.onclick = closeModal;
      ok.onclick = () => { if (onSubmit() !== false) closeModal(); };
      document.body.appendChild(mask); _modalMask = mask;
      setTimeout(() => modal.querySelector("input, textarea")?.focus(), 0);
      return { close: closeModal, okBtn: ok };
    }
    function closeModal() { if (_modalMask) { _modalMask.remove(); _modalMask = null; } }

    // ==================== Toast ====================
    let _toastWrap = null;
    function toast(msg, type = "", ms = 2200) {
      if (!_toastWrap) { _toastWrap = document.createElement("div"); _toastWrap.className = "pb-toast-wrap"; document.body.appendChild(_toastWrap); }
      const t = document.createElement("div"); t.className = "pb-toast " + type; t.textContent = msg;
      _toastWrap.appendChild(t);
      setTimeout(() => { t.classList.add("fade"); setTimeout(() => t.remove(), 300); }, ms);
    }
    // promise 化的确认弹窗，复用 openModal，返回 true/false
    function confirmModal(msg, opts = {}) {
      return new Promise(resolve => {
        let settled = false;
        const body = document.createElement("p"); body.textContent = msg; body.style.margin = "0 0 12px";
        body.style.fontSize = "13px"; body.style.lineHeight = "1.5";
        openModal({
          title: opts.title || "确认",
          bodyEl: body,
          submitText: opts.okText || "确定",
          cancelText: opts.cancelText || "取消",
          onSubmit: () => { settled = true; resolve(true); }
        });
        // 点确定：onSubmit 已 resolve(true)；否则遮罩消失即为取消
        const obs = new MutationObserver(() => { if (!_modalMask && !settled) { resolve(false); obs.disconnect(); } });
        obs.observe(document.body, { childList: true });
      });
    }
    // promise 化的文本输入弹窗，返回输入值或 null（取消）
    function promptModal(message, defaultValue = "", opts = {}) {
      return new Promise(resolve => {
        let settled = false;
        const wrap = document.createElement("div");
        const label = document.createElement("div"); label.textContent = message; label.style.cssText = "font-size:13px;margin-bottom:6px;line-height:1.5";
        const inp = document.createElement("input"); inp.value = defaultValue; inp.style.cssText = "width:100%;background:var(--pb-panel-2);color:var(--pb-text);border:1px solid var(--pb-border);border-radius:4px;padding:6px 8px;font-size:13px;box-sizing:border-box";
        inp.onkeydown = (ev) => { if (ev.key === "Enter") { ev.preventDefault(); settled = true; resolve(inp.value); closeModal(); } };
        wrap.append(label, inp);
        openModal({
          title: opts.title || "输入",
          bodyEl: wrap,
          submitText: opts.okText || "确定",
          cancelText: opts.cancelText || "取消",
          onSubmit: () => { settled = true; resolve(inp.value); }
        });
        const obs = new MutationObserver(() => { if (!_modalMask && !settled) { resolve(null); obs.disconnect(); } });
        obs.observe(document.body, { childList: true });
      });
    }

    // ==================== 拖动插入指示线（共享） ====================
    let _indicator = null;
    function getIndicator() {
      if (!_indicator) { _indicator = document.createElement("div"); _indicator.className = "pb-drop-indicator"; document.body.appendChild(_indicator); }
      return _indicator;
    }
    function hideIndicator() { if (_indicator) _indicator.classList.remove("show"); }
    // orient: "h"=横向流(chip)，"v"=纵向流(分组/输入框/词)
    // 返回 "before" | "after"，表示光标相对 target 的插入侧
    function showIndicatorAt(target, e, orient) {
      const ind = getIndicator();
      const r = target.getBoundingClientRect();
      let before;
      if (orient === "h") {
        before = (e.clientX - r.left) < r.width / 2; // 左半区→before
        ind.classList.add("v"); ind.classList.remove("h");
        const x = before ? r.left : r.right;
        ind.style.left = (x - 2) + "px"; ind.style.top = (r.top + 2) + "px"; ind.style.height = (r.height - 4) + "px"; ind.style.width = "";
      } else {
        before = (e.clientY - r.top) < r.height / 2; // 上半区→before
        ind.classList.add("h"); ind.classList.remove("v");
        const y = before ? r.top : r.bottom;
        ind.style.top = (y - 2) + "px"; ind.style.left = (r.left + 2) + "px"; ind.style.width = (r.width - 4) + "px"; ind.style.height = "";
      }
      ind.classList.add("show");
      return before ? "before" : "after";
    }

    // ==================== chip 跨输入框拖拽（专用，支持跨容器） ====================
    let chipDragCtx = null; // { chip, fromBox }
    function attachChipDrag(el, sourceBox, chip) {
      el.addEventListener("dragstart", (e) => {
        chipDragCtx = { chip, fromBox: sourceBox };
        el.classList.add("dragging");
        clearTimeout(_toolbarHideTimer); clearTimeout(_switchTimer); if (_toolbarEl) _toolbarEl.classList.remove("show"); _activeChipEl = null;
        try { e.dataTransfer.setData("text/plain", "chip"); } catch (_) {}
        e.dataTransfer.effectAllowed = "move";
        e.stopPropagation();
      });
      el.addEventListener("dragend", () => { el.classList.remove("dragging"); chipDragCtx = null; hideIndicator(); });
      // 作为 drop 目标：拖到某个 chip 上时，按光标左/右半区决定插在它之前/之后
      el.addEventListener("dragover", (e) => {
        if (!chipDragCtx) return;
        e.preventDefault();
        if (chipDragCtx.chip === chip) { hideIndicator(); return; } // 拖到自身：不显示
        chipDragCtx.side = showIndicatorAt(el, e, "h");
      });
      el.addEventListener("drop", (e) => {
        if (!chipDragCtx) return;
        e.preventDefault(); e.stopPropagation();
        hideIndicator();
        const { chip: dragged, fromBox, side } = chipDragCtx;
        if (dragged === chip) { chipDragCtx = null; return; } // 拖到自身：无操作
        const toBox = sourceBox;
        const fromIdx = fromBox.chips.indexOf(dragged);
        // 先从源数组删除，再基于删除后的目标数组计算插入位置（避免索引错位）
        fromBox.chips.splice(fromIdx, 1);
        let toIdx = toBox.chips.indexOf(chip);
        if (side === "after") toIdx += 1;   // 光标在目标 chip 右半区 → 插到它后面
        // 同容器内拖到原位置：还原，避免无意义的删除再插入
        if (fromBox === toBox && toIdx === fromIdx) { toBox.chips.splice(fromIdx, 0, dragged); chipDragCtx = null; return; }
        toBox.chips.splice(toIdx, 0, dragged);
        chipDragCtx = null;
        commit();
      });
    }
    // chip-area 容器接收 drop（拖到空白区域 → 追加到末尾）
    function attachChipAreaDrop(area, box) {
      area.addEventListener("dragover", (e) => {
        // 词库词拖入：接收并显示追加指示线
        if (dragCtx && dragCtx.kind === "preset" && dragCtx.payload) {
          if (e.target.closest(".pb-chip")) return;
          e.preventDefault();
          const ind = getIndicator();
          const r = area.getBoundingClientRect();
          ind.classList.add("v"); ind.classList.remove("h");
          ind.style.left = (r.right - 2) + "px"; ind.style.top = (r.top + 2) + "px";
          ind.style.height = (r.height - 4) + "px"; ind.style.width = "";
          ind.classList.add("show");
          return;
        }
        if (!chipDragCtx) return;
        if (e.target.closest(".pb-chip")) return; // 命中具体 chip：交给 chip 自己显示
        e.preventDefault();
        // 空白处：指示线显示在容器右边缘（追加位置）
        if (chipDragCtx.fromBox !== box || box.chips.length) {
          const ind = getIndicator();
          const r = area.getBoundingClientRect();
          ind.classList.add("v"); ind.classList.remove("h");
          ind.style.left = (r.right - 2) + "px"; ind.style.top = (r.top + 2) + "px";
          ind.style.height = (r.height - 4) + "px"; ind.style.width = "";
          ind.classList.add("show");
          chipDragCtx.side = "append";
        } else { hideIndicator(); }
      });
      area.addEventListener("dragleave", (e) => { if (!area.contains(e.relatedTarget)) hideIndicator(); });
      area.addEventListener("drop", (e) => {
        // 词库词拖入：添加为 chip（带翻译）
        if (dragCtx && dragCtx.kind === "preset" && dragCtx.payload) {
          if (e.target.closest(".pb-chip")) return;
          e.preventDefault(); e.stopPropagation();
          hideIndicator();
          const w = dragCtx.payload;
          box.chips.push(mkChip(w.text, w.cnText));
          cur.focusedBox = box.id;
          dragCtx = null;
          commit();
          return;
        }
        if (!chipDragCtx) return;
        if (e.target.closest(".pb-chip")) return;
        e.preventDefault(); e.stopPropagation();
        hideIndicator();
        const { chip: dragged, fromBox } = chipDragCtx;
        if (fromBox === box) { chipDragCtx = null; return; } // 同容器空白处：无操作
        const fromIdx = fromBox.chips.indexOf(dragged);
        fromBox.chips.splice(fromIdx, 1);
        box.chips.push(dragged);
        chipDragCtx = null;
        commit();
      });
    }

    // ==================== 拖拽排序引擎（分组 / 输入框 / 词库 通用） ====================
    let dragCtx = null;
    function attachListDrag(el, arr, onDrop, kind) {
      el.addEventListener("dragstart", (e) => {
        dragCtx = { kind, fromIndex: arr.indexOf(el._payload), payload: el._payload };
        el.classList.add("dragging");
        try { e.dataTransfer.setData("text/plain", kind); } catch (_) {}
        e.dataTransfer.effectAllowed = "move";
        e.stopPropagation();
      });
      el.addEventListener("dragend", () => { el.classList.remove("dragging"); dragCtx = null; hideIndicator(); });
      el.addEventListener("dragover", (e) => {
        if (!dragCtx || dragCtx.kind !== kind) return;
        e.preventDefault();
        if (dragCtx.fromIndex === arr.indexOf(el._payload)) { hideIndicator(); return; } // 拖到自身
        dragCtx.side = showIndicatorAt(el, e, "v");
        dragCtx.toIndex = arr.indexOf(el._payload);
      });
      el.addEventListener("dragleave", (e) => { if (el === e.target) hideIndicator(); });
      el.addEventListener("drop", (e) => {
        if (!dragCtx || dragCtx.kind !== kind) return;
        e.preventDefault(); e.stopPropagation();
        hideIndicator();
        const from = dragCtx.fromIndex;
        const side = dragCtx.side || "before";     // dragover 时记录的插入侧
        let to = dragCtx.toIndex ?? arr.indexOf(el._payload);
        if (from < 0 || to < 0 || from === to) { dragCtx = null; return; }
        const [item] = arr.splice(from, 1);          // 先删除源元素
        // 删除后重新计算目标索引：after → to+1；若源在目标之前，删除使目标前移一位需补偿
        let target = (side === "after") ? to + 1 : to;
        if (from < to) target -= 1;
        if (target < 0) target = 0;
        if (target === from) { arr.splice(from, 0, item); dragCtx = null; return; } // 拖到原位置：还原
        arr.splice(target, 0, item);
        dragCtx = null;
        onDrop && onDrop();
      });
    }

    // ==================== 颜色选择器 ====================
    let pickerEl = null;
    function openColorPicker(anchor, group) {
      if (pickerEl) { pickerEl.remove(); pickerEl = null; return; }
      const r = anchor.getBoundingClientRect();
      pickerEl = document.createElement("div"); pickerEl.className = "pb-color-picker";
      COLORS.forEach(c => {
        const s = document.createElement("div"); s.className = "pb-color-swatch"; s.style.background = c;
        s.onclick = () => { group.color = c; pickerEl.remove(); pickerEl = null; renderWorkspace(); persist(); };
        pickerEl.appendChild(s);
      });
      document.body.appendChild(pickerEl);
      // 边界判断：右/下溢出时向左/上弹出
      const pw = pickerEl.offsetWidth, ph = pickerEl.offsetHeight;
      let left = r.left, top = r.bottom + 6;
      if (left + pw > window.innerWidth - 6) left = Math.max(6, window.innerWidth - pw - 6);
      if (top + ph > window.innerHeight - 6) top = Math.max(6, r.top - ph - 6);
      pickerEl.style.left = left + "px"; pickerEl.style.top = top + "px";
      setTimeout(() => document.addEventListener("click", () => { if (pickerEl) { pickerEl.remove(); pickerEl = null; } }, { once: true }), 0);
    }

    // ==================== 输出构建：拼接 chip → 文本 → 同步到节点 ====================
    // collapsed 仅为视觉折叠，不影响输出；group/box enabled=false 才不参与输出
    function buildGroup(g) {
      if (g.enabled === false) return []; // 显式禁用（分组级）
      const parts = [];
      g.inputboxes.forEach(box => {
        if (box.enabled === false) return; // 显式禁用（输入框级 bypass）
        if (cur.focusedBox !== box.id && !box.chips.length) return;
        box.chips.forEach(c => {
          if (c.enabled === false) return;
          const w = +c.weight.toFixed(1);
          if (w === 1.0) { parts.push(c.text); return; }
          parts.push(`(${c.text}:${w.toFixed(1)})`);
        });
      });
      if (!parts.length) return [];
      if (g.break) { parts.unshift("BREAK"); parts.push("BREAK"); }
      return parts;
    }
    function buildPositive() {
      const parts = [];
      cur.workspace.forEach(g => { parts.push(...buildGroup(g)); });
      return parts.join(", ");
    }
    function buildNegative() {
      return buildGroup(cur.negativeGroup).join(", ");
    }
    /** CLIP token 近似估算：英文约 1.3 token/word，中文约 1 token/字，权重语法 +2 */
    function estimateTokens(text) {
      if (!text) return 0;
      let tokens = 0;
      text.split(",").map(s => s.trim()).filter(Boolean).forEach(term => {
        const hasWeight = /^\(.+:.+\)$/.test(term);
        const inner = hasWeight ? term.slice(1, term.lastIndexOf(":")) : term;
        // 英文词（按空格/连字符拆）
        const enParts = inner.replace(/[\u4e00-\u9fff]+/g, " ").split(/\s+/).filter(Boolean);
        tokens += Math.ceil(enParts.length * 1.3);
        // 中文字符（逐字计）
        const cnChars = (inner.match(/[\u4e00-\u9fff]/g) || []).length;
        tokens += cnChars;
        if (hasWeight) tokens += 2;
      });
      return tokens;
    }
    /** 计算单个输入框的 token 估算文本（含颜色分级 HTML） */
    function boxTokenHtml(box) {
      const parts = [];
      box.chips.forEach(c => {
        if (c.enabled === false) return;
        const w = +(c.weight ?? 1).toFixed(1);
        parts.push(w === 1.0 ? c.text : `(${c.text}:${w.toFixed(1)})`);
      });
      const txt = parts.join(", ");
      const tok = estimateTokens(txt);
      const cls = tok > 150 ? "tok-over" : (tok > 75 ? "tok-warn" : "");
      return tok > 0 ? (cls ? `<span class="${cls}">~${tok} token</span>` : `~${tok} token`) : "";
    }
    function renderOutput() {
      const posRaw = buildPositive();        // 只算一次，复用于显示与计数
      const negRaw = buildNegative();
      const pos = posRaw || "（空）";
      const neg = negRaw || "（空）";
      $("pbOutputBoxPos").textContent = pos;
      $("pbOutputBoxNeg").textContent = neg;
      // 词条计数 + token 估算：仅在非空时显示，token 超 75 标黄、超 150 标红
      const fmtCount = (txt) => {
        if (!txt) return "";
        const words = txt.split(",").map(s => s.trim()).filter(Boolean).length;
        const tok = estimateTokens(txt);
        const cls = tok > 150 ? "tok-over" : (tok > 75 ? "tok-warn" : "");
        const tokHtml = cls ? `<span class="${cls}">· ~${tok} token</span>` : `· ~${tok} token`;
        return `${words} 词 · ${txt.length} 字符 ${tokHtml}`;
      };
      $("pbOutputCountPos").innerHTML = posRaw ? fmtCount(posRaw) : "";
      $("pbOutputCountNeg").innerHTML = negRaw ? fmtCount(negRaw) : "";
      syncToNode("positive", pos);
      syncToNode("negative", neg);
    }
    /** 把构建出的文本同步到【活动节点】的 positive/negative widget。
     *  只写当前绑定节点，不再广播到所有节点（每节点状态独立）。 */
    function syncToNode(field, text) {
      if (!activeNode) return;
      const widget = activeNode.widgets?.find(w => w.name === field);
      if (widget && widget.value !== text) {
        widget.value = text;
        try { app.graph?.change?.(); } catch (e) {}
      }
    }

    let _copyTimer;
    $("pbCopyPos").onclick = () => {
      const txt = buildPositive(); if (!txt) return;
      navigator.clipboard?.writeText(txt);
      const b = $("pbCopyPos"); clearTimeout(_copyTimer); b.textContent = "已复制"; _copyTimer = setTimeout(() => b.textContent = "复制", 1200);
    };
    $("pbCopyNeg").onclick = () => {
      const txt = buildNegative(); if (!txt) return;
      navigator.clipboard?.writeText(txt);
      const b = $("pbCopyNeg"); clearTimeout(_copyTimer); b.textContent = "已复制"; _copyTimer = setTimeout(() => b.textContent = "复制", 1200);
    };

    // ==================== 渲染：预设词库 ====================
    function renderPresets() {
      // L1 行
      const catsEl = $("pbPresetCats"); catsEl.innerHTML = "";
      Object.keys(state.presets.children).forEach(cat => {
        const t = mkCatTag(cat, state.l1Cat === cat);
        t.querySelector(".pb-cat-name").onclick = () => {
          state.l1Cat = cat; const keys = Object.keys(state.presets.children[cat].children); state.l2Cat = keys[0] || null; renderPresets();
        };
        t.querySelector(".pb-cat-name").ondblclick = () => renameCat(cat, t, state.presets.children, "l1Cat");
        t.querySelector(".pb-cat-x").onclick = e => { e.stopPropagation(); delCat(cat, state.presets.children, "l1Cat"); };
        catsEl.appendChild(t);
      });
      renderCatAdd(catsEl, state.presets.children, "l1Cat");

      // L2 行
      const l2El = $("pbPresetCatsL2"); l2El.innerHTML = "";
      const l1Node = state.l1Cat ? state.presets.children[state.l1Cat] : null;
      if (l1Node) {
        Object.keys(l1Node.children).forEach(cat => {
          const t = mkCatTag(cat, state.l2Cat === cat);
          t.querySelector(".pb-cat-name").onclick = () => { state.l2Cat = cat; renderPresets(); };
          t.querySelector(".pb-cat-name").ondblclick = () => renameCat(cat, t, l1Node.children, "l2Cat");
          t.querySelector(".pb-cat-x").onclick = e => { e.stopPropagation(); delCat(cat, l1Node.children, "l2Cat"); };
          l2El.appendChild(t);
        });
        renderCatAdd(l2El, l1Node.children, "l2Cat");
      }

      // 词语列表 — 仅在 L1+L2 都选中时显示
      const listEl = $("pbPresetList"); listEl.innerHTML = "";
      if (!l1Node || !state.l2Cat) return;
      const words = l1Node.children[state.l2Cat]?.items || [];
      words.forEach((w) => {
        listEl.appendChild(renderPresetWord(w, { items: words, draggable: true, onDeleted: () => { renderPresets(); persist(); } }));
      });
      // 新建词语行
      const addBtn = document.createElement("button"); addBtn.className = "pb-preset-add-btn"; addBtn.textContent = "+ 新建词语";
      const addRow = document.createElement("div"); addRow.className = "pb-preset-add-row"; addRow.style.display = "none";
      const addCN = document.createElement("input"); addCN.placeholder = "中文"; addCN.className = "pb-preset-cn";
      const addEN = document.createElement("input"); addEN.placeholder = "English"; addEN.className = "pb-preset-en";
      const actions = document.createElement("div"); actions.className = "pb-row-actions";
      const transMini = document.createElement("button"); transMini.textContent = "翻译"; transMini.className = "pb-translate-mini";
      const saveMini = document.createElement("button"); saveMini.textContent = "保存"; saveMini.className = "pb-save-mini";
      actions.append(transMini, saveMini); addRow.append(addCN, addEN, actions);
      addBtn.onclick = () => { addBtn.style.display = "none"; addRow.style.display = ""; addCN.focus(); };
      const saveWord = () => {
        const cn = addCN.value.trim(), en = addEN.value.trim();
        if (!cn && !en) { addRow.style.display = "none"; addBtn.style.display = ""; addCN.value = addEN.value = ""; return; }
        const entry = cn && en ? { text: en, cnText: cn } : { text: cn || en };
        words.push(entry); addCN.value = addEN.value = ""; addRow.style.display = "none"; addBtn.style.display = "";
        renderPresets(); persist();
      };
      transMini.onclick = async () => {
        const cn = addCN.value.trim(), en = addEN.value.trim();
        const run = async (src, fillTarget, focusTarget) => {
          transMini.textContent = "…"; const r = await translateText(src); transMini.textContent = "翻译";
          if (r.ok && r.text) { fillTarget.value = r.text; focusTarget.focus(); }
          else if (!r.ok) { toast(r.reason, "error"); }
        };
        if (cn && !en) run(cn, addEN, addEN);
        else if (en && !cn) run(en, addCN, addCN);
      };
      saveMini.onclick = saveWord;
      addCN.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); saveWord(); } };
      addEN.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); saveWord(); } };
      listEl.appendChild(addBtn); listEl.appendChild(addRow);
      // 重建词库索引缓存，供输入框自动补全使用
      _presetIndex = [];
      Object.keys(state.presets.children).forEach(l1 => {
        const n1 = state.presets.children[l1];
        Object.keys(n1.children || {}).forEach(l2 => {
          (n1.children[l2].items || []).forEach(w => _presetIndex.push(w));
        });
      });
    }
    /** 统一渲染词库词（renderPresets 和 renderSearchResults 共用）
     * opts: { items, onDeleted, draggable, path } */
    function renderPresetWord(w, opts) {
      const wrap = document.createElement("div");
      wrap.className = "pb-preset-word";
      if (opts.draggable) { wrap.draggable = true; wrap._payload = w; }
      const hasCN = !!w.cnText;
      const sub = hasCN ? `<small class="pb-chip-sub">${escapeHtml(w.cnText)}</small>` : "";
      const pathTag = opts.path ? `<small class="pb-chip-path">${escapeHtml(opts.path)}</small>` : "";
      wrap.innerHTML = `<span class="text"><span class="pb-chip-main">${escapeHtml(w.text)}</span>${sub}${pathTag}</span><button class="pb-preset-x" title="删除">×</button>`;
      wrap.onclick = (e) => {
        if (e.target.classList.contains("pb-preset-x")) {
          const idx = opts.items.indexOf(w); if (idx >= 0) opts.items.splice(idx, 1);
          opts.onDeleted && opts.onDeleted(); return;
        }
        addChipsToFocused(w);
      };
      if (opts.draggable) attachListDrag(wrap, opts.items, opts.onDeleted, "preset");
      return wrap;
    }
    function mkCatTag(name, active) {
      const t = document.createElement("div");
      t.className = "pb-cat-tag" + (active ? " active" : "");
      t.innerHTML = `<span class="pb-cat-name">${escapeHtml(name)}</span><span class="pb-cat-x">×</span>`;
      return t;
    }
    function renameCat(oldName, tagEl, parentObj, stateKey) {
      const nameEl = tagEl.querySelector(".pb-cat-name");
      nameEl.innerHTML = `<input value="${escapeHtml(oldName)}" style="background:transparent;border:1px solid var(--pb-accent);color:inherit;border-radius:4px;padding:2px 4px;font-size:12px;width:90px;outline:none">`;
      const inp = nameEl.querySelector("input"); inp.focus(); inp.select();
      const done = (cancel) => { if (cancel) { renderPresets(); return; } const v = inp.value.trim(); if (v && v !== oldName && !parentObj[v]) { const entries = Object.entries(parentObj); const idx = entries.findIndex(([k]) => k === oldName); entries[idx] = [v, entries[idx][1]]; Object.assign(parentObj, Object.fromEntries(entries)); if (state[stateKey] === oldName) state[stateKey] = v; renderPresets(); persist(); } else { renderPresets(); } };
      inp.onblur = () => done(true);
      inp.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); done(false); } else if (ev.key === "Escape") done(true); };
    }
    function delCat(name, parentObj, stateKey) {
      delete parentObj[name];
      if (state[stateKey] === name) {
        state[stateKey] = Object.keys(parentObj)[0] || null;
        if (stateKey === "l1Cat" && state.l1Cat) {
          const l2s = Object.keys(state.presets.children[state.l1Cat].children);
          state.l2Cat = l2s[0] || null;
        } else if (stateKey === "l2Cat") state.l2Cat = Object.keys(parentObj)[0] || null;
      }
      renderPresets(); persist();
    }
    function renderCatAdd(parentEl, parentObj, stateKey) {
      const btn = document.createElement("span"); btn.className = "pb-cat-tag pb-cat-add"; btn.textContent = "+ 新建";
      btn.onclick = () => {
        btn.style.display = "none";
        const inp = document.createElement("input"); inp.className = "pb-cat-input"; inp.placeholder = "名称…";
        const done = () => { btn.style.display = ""; inp.remove(); const v = inp.value.trim(); if (v && !parentObj[v]) { parentObj[v] = { items: [], children: {} }; state[stateKey] = v; if (stateKey === "l1Cat") state.l2Cat = null; renderPresets(); persist(); } };
        inp.onblur = done; inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); done(); } else if (e.key === "Escape") { inp.value = ""; done(); } };
        parentEl.appendChild(inp); inp.focus();
      };
      parentEl.appendChild(btn);
    }

    // ==================== 渲染：负面提示词（固定在底部） ====================
    function renderNegativeGroup() {
      const root = $("pbWorkspace");
      const ng = cur.negativeGroup;
      const ngEnabled = ng.enabled !== false;
      const g = document.createElement("div");
      g.className = "pb-group negative-fixed" + (ng.collapsed ? " collapsed" : "") + (ngEnabled ? "" : " disabled");
      g.dataset.gid = ng.id; g._payload = ng;
      const bar = document.createElement("div"); bar.className = "pb-group-color-bar"; bar.style.background = ng.color; g.appendChild(bar);
      const header = document.createElement("div"); header.className = "pb-group-header";
      header.innerHTML = `<span class="caret">▾</span><div class="pb-color-dot" style="background:${ng.color}"></div><div class="name">${escapeHtml(ng.name)}</div><button class="pb-btn pb-group-break" data-act="break" title="${ng.break ? "取消隔离" : "隔离此分组"}" style="font-size:11px;padding:2px 6px;color:${ng.break ? 'var(--pb-accent)' : 'var(--pb-text-dim)'}">隔离</button><button class="pb-btn pb-group-toggle" data-act="toggle" title="${ngEnabled ? "禁用输出" : "启用输出"}" style="font-size:11px;padding:2px 6px;margin-left:auto">${ngEnabled ? "👁" : "🚫"}</button><button class="pb-btn" data-act="clear" style="font-size:11px;padding:2px 6px;" title="一键清空">清空</button>`;
      header.onclick = (e) => {
        if (e.target.dataset.act === "clear") { ng.inputboxes.forEach(box => box.chips = []); commit(); return; }
        if (e.target.dataset.act === "toggle") { ng.enabled = ng.enabled === false; commit(); return; }
        if (e.target.dataset.act === "break") { ng.break = ng.break === false; commit(); return; }
        if (e.target.classList.contains("name")) return;
        if (e.target.classList.contains("pb-color-dot")) { openColorPicker(e.target, ng); return; }
        ng.collapsed = !ng.collapsed; commit();
      };
      g.appendChild(header);
      if (!ng.collapsed) { const body = document.createElement("div"); body.className = "pb-group-body"; ng.inputboxes.forEach(box => body.appendChild(renderInputBox(ng, box))); g.appendChild(body); }
      root.appendChild(g);
    }

    // ==================== 渲染：工作区（分组 → 输入框 → chip） ====================
    function renderWorkspace() {
      const root = $("pbWorkspace"); root.innerHTML = "";
      cur.workspace.forEach(group => {
        const g = document.createElement("div");
        g.className = "pb-group" + (group.collapsed ? " collapsed" : "");
        g.dataset.gid = group.id; g._payload = group; g.draggable = true;
        attachListDrag(g, cur.workspace, () => { commit(); }, "group");
        const bar = document.createElement("div"); bar.className = "pb-group-color-bar"; bar.style.background = group.color; g.appendChild(bar);
        const gEnabled = group.enabled !== false;
        g.classList.toggle("disabled", !gEnabled);
        const header = document.createElement("div"); header.className = "pb-group-header";
      header.innerHTML = `<span class="caret">▾</span><div class="pb-color-dot" style="background:${group.color}"></div><div class="name">${escapeHtml(group.name)}</div><button class="pb-btn pb-group-break" data-act="break" title="${group.break ? "取消隔离" : "隔离此分组"}" style="font-size:11px;padding:2px 6px;color:${group.break ? 'var(--pb-accent)' : 'var(--pb-text-dim)'}">隔离</button><button class="pb-btn pb-group-toggle" data-act="toggle" title="${gEnabled ? "禁用输出" : "启用输出"}" style="font-size:11px;padding:2px 6px;">${gEnabled ? "👁" : "🚫"}</button><button class="pb-btn" data-act="del" style="font-size:11px;padding:2px 6px;" title="删除分组">删除</button>`;
      header.onclick = (e) => {
        if (e.target.dataset.act === "del") { cur.workspace = cur.workspace.filter(x => x.id !== group.id); commit(); return; }
        if (e.target.dataset.act === "toggle") { group.enabled = group.enabled === false; commit(); return; }
        if (e.target.dataset.act === "break") { group.break = group.break === false; commit(); return; }
        if (e.target.classList.contains("name")) return;
        if (e.target.classList.contains("pb-color-dot")) { openColorPicker(e.target, group); return; }
        group.collapsed = !group.collapsed; renderWorkspace(); persist();
      };
        header.querySelector(".name").ondblclick = (e) => { e.stopPropagation(); promptModal("分组新名称：", group.name, { title: "重命名分组" }).then(nn => { if (nn != null) { const v = nn.trim(); if (v) { group.name = v; renderWorkspace(); persist(); } } }); };
        g.appendChild(header);
        if (!group.collapsed) {
          const body = document.createElement("div"); body.className = "pb-group-body";
          group.inputboxes.forEach(box => body.appendChild(renderInputBox(group, box)));
          const addBtn = document.createElement("button"); addBtn.className = "pb-add-inputbox"; addBtn.textContent = "+ 添加输入框";
          addBtn.onclick = () => { group.inputboxes.push(mkBox()); renderWorkspace(); persist(); };
          body.appendChild(addBtn); g.appendChild(body);
        }
        root.appendChild(g);
      });
      const add = document.createElement("button"); add.className = "pb-add-group"; add.textContent = "+ 添加输入分组";
      add.onclick = () => { cur.workspace.push(mkGroup("新分组", COLORS[(cur.workspace.length) % COLORS.length])); commit(); };
      root.appendChild(add);
      renderNegativeGroup();
      const ae = document.activeElement;
      if (ae && (ae.classList.contains("pb-chip-input") || ae.classList.contains("pb-inputbox-title"))) {
        const bid = ae.closest(".pb-inputbox")?.dataset?.bid;
        const target = bid ? root.querySelector(`.pb-inputbox[data-bid="${bid}"] .pb-chip-input`) : null;
        if (target) { target.focus(); try { target.setSelectionRange(ae.selectionStart ?? ae.value.length, ae.selectionEnd ?? ae.value.length); } catch (_) {} }
      } else if (_pendingFocusBox) {
        const target = root.querySelector(`.pb-inputbox[data-bid="${_pendingFocusBox}"] .pb-chip-input`);
        if (target) { target.focus(); }
        _pendingFocusBox = null;
      }
    }

    // ==================== 渲染：输入框 ====================
    function renderInputBox(group, box) {
      const isFixed = group === cur.negativeGroup;
      const boxEnabled = box.enabled !== false;
      const el = document.createElement("div");
      el.className = "pb-inputbox" + (cur.focusedBox === box.id ? " focused" : "") + (!isFixed && !boxEnabled ? " disabled" : "");
      el.dataset.bid = box.id; el._payload = box;
      // 注入分组色为 CSS 变量，供 .pb-inputbox.focused 的边框/竖条/outline 取色（与分组色条一致）
      el.style.setProperty("--pb-box-color", group.color || "var(--pb-accent)");
      el.innerHTML = `<div class="pb-inputbox-header"${isFixed?"":' draggable="true"'}>${isFixed?"":`<button class="pb-inputbox-toggle" data-act="toggle" title="${boxEnabled ? "Bypass（不参与输出）" : "启用输出"}">${boxEnabled ? "👁" : "🚫"}</button>`}<input class="pb-inputbox-title" value="${escapeHtml(box.title)}"/>${isFixed?"":'<span class="pb-inputbox-remove" title="删除">×</span>'}</div><div class="pb-chip-area"></div><div class="pb-box-token"></div>`;
      if (!isFixed) { const header = el.querySelector(".pb-inputbox-header"); header._payload = box; attachListDrag(header, group.inputboxes, () => { commit(); }, "inputbox"); }
      // bypass toggle（仅普通分组的输入框）
      if (!isFixed) el.querySelector('.pb-inputbox-toggle').onclick = (e) => { e.stopPropagation(); box.enabled = box.enabled === false; commit(); };
      el.onclick = (e) => {
        const skip = e.target.closest("button, .pb-chip");
        if (skip) return;
        // 移除其它输入框的聚焦态
        document.querySelectorAll(".pb-inputbox.focused").forEach(el2 => el2.classList.remove("focused"));
        cur.focusedBox = box.id; el.classList.add("focused");
      };
      el.querySelector(".pb-inputbox-title").oninput = (e) => { box.title = e.target.value; renderOutput(); persist(); };
      if (!isFixed) el.querySelector(".pb-inputbox-remove").onclick = (e) => { e.stopPropagation(); group.inputboxes = group.inputboxes.filter(b => b.id !== box.id); if (cur.focusedBox === box.id) cur.focusedBox = null; commit(); };
      const area = el.querySelector(".pb-chip-area");
      attachChipAreaDrop(area, box);
      box.chips.forEach(chip => area.appendChild(renderChip(chip, box)));
      // 填充输入框 token 计数
      const tokEl = el.querySelector(".pb-box-token");
      if (tokEl) tokEl.innerHTML = boxTokenHtml(box);
      const input = document.createElement("input"); input.className = "pb-chip-input"; input.placeholder = "输入词语，逗号分隔可批量…";
      input.oninput = () => showAc(input, box);
      input.onkeydown = (e) => {
        // 上下键移动补全高亮
        if ((e.key === "ArrowDown" || e.key === "ArrowUp") && _acItems.length) {
          e.preventDefault();
          _acActive = (_acActive + (e.key === "ArrowDown" ? 1 : -1) + _acItems.length) % _acItems.length;
          renderAcActive(); return;
        }
        if (e.key === "Escape") { hideAc(); return; }
        // Tab：选中推荐补全
        if (e.key === "Tab") {
          if (_acItems.length && _acActive >= 0) { e.preventDefault(); selectAc(input, box, _acActive); return; }
        }
        // Enter / 逗号：直接输入原始内容
        if (e.key === "Enter" || e.key === "," || e.key === "，") {
          e.preventDefault(); const v = input.value; if (v.trim()) { _pendingFocusBox = box.id; addChipsToBox(box, v); input.value = ""; hideAc(); }
        }
        else if (e.key === "Backspace" && !input.value && box.chips.length) { box.chips.pop(); _pendingFocusBox = box.id; commit(); }
      };
      input.onblur = () => { setTimeout(hideAc, 150); };
      area.appendChild(input);
      return el;
    }

    /** 局部更新 chip 权重显示，不重建 DOM（性能优化：避免全量 renderWorkspace） */
    function updateChipWeight(el, chip) {
      const main = el.querySelector(".pb-chip-main");
      if (!main) return;
      const oldW = main.querySelector(".w");
      if (oldW) oldW.remove();
      if (chip.weight.toFixed(1) !== "1.0") {
        const wSpan = document.createElement("span");
        wSpan.className = "w";
        wSpan.textContent = chip.weight.toFixed(1);
        main.appendChild(wSpan);
      }
      // 同步刷新所属输入框的 token 计数
      const inputbox = el.closest(".pb-inputbox");
      const box = inputbox?._payload;
      if (box) { const tokEl = inputbox.querySelector(".pb-box-token"); if (tokEl) tokEl.innerHTML = boxTokenHtml(box); }
    }
    // ==================== chip 浮动工具栏（单例，mouseenter 定位到 chip 上方 / 下方） ====================
    /** 浮动栏的创建与隐藏。参考 autocomplete 单例模式。 */
    function getToolbar() {
      if (!_toolbarEl) { _toolbarEl = document.createElement("div"); _toolbarEl.className = "pb-chip-toolbar"; document.body.appendChild(_toolbarEl); }
      return _toolbarEl;
    }
    function hideToolbar() {
      clearTimeout(_toolbarHideTimer);
      clearTimeout(_switchTimer);
      _toolbarHideTimer = setTimeout(() => {
        if (_toolbarEl) _toolbarEl.classList.remove("show");
        _activeChipEl = null;
      }, 200);
    }
    function showToolbar(chipEl) {
      clearTimeout(_toolbarHideTimer); clearTimeout(_switchTimer);
      const tb = getToolbar();
      tb.classList.add("show");
      const cr = chipEl.getBoundingClientRect();
      const tw = tb.offsetWidth, th = tb.offsetHeight;
      let left = cr.left + cr.width / 2 - tw / 2;
      let top = cr.top - th - 6;
      if (top < 6) top = cr.bottom + 6;
      if (left < 6) left = 6;
      if (left + tw > window.innerWidth - 6) left = window.innerWidth - tw - 6;
      tb.style.left = left + "px"; tb.style.top = top + "px";
    }
    /** 绑定 chip → toolbar：mouseenter 延时切换（150ms 防抖，避免路过 chip 抢 toolbar）。 */
    function attachToolbarToChip(el, box, chip) {
      const tb = getToolbar();
      el.addEventListener("mouseenter", () => {
        if (el.classList.contains("dragging")) return;
        if (_activeChipEl === el) { clearTimeout(_toolbarHideTimer); return; }
        clearTimeout(_toolbarHideTimer); clearTimeout(_switchTimer);
        _switchTimer = setTimeout(() => {
          _activeChipEl = el;
          const bypassed = chip.enabled === false;
          tb.innerHTML = `
            <button class="pb-chiptb-wminus" title="减权 0.1">−</button>
            <button class="pb-chiptb-wplus" title="加权 0.1">+</button>
            <button class="pb-chiptb-bypass" title="${bypassed ? "恢复输出" : "Bypass（不参与输出）"}">${bypassed ? "🚫" : "👁"}</button>`;
          tb.querySelector(".pb-chiptb-wminus").onmousedown = e => e.preventDefault();
          tb.querySelector(".pb-chiptb-wplus").onmousedown = e => e.preventDefault();
          tb.querySelector(".pb-chiptb-wminus").onclick = e => { e.stopPropagation(); chip.weight = clamp(+(chip.weight - 0.1).toFixed(1), 0.1, MAX_WEIGHT); updateChipWeight(el, chip); commit(); };
          tb.querySelector(".pb-chiptb-wplus").onclick = e => { e.stopPropagation(); chip.weight = clamp(+(chip.weight + 0.1).toFixed(1), 0.1, MAX_WEIGHT); updateChipWeight(el, chip); commit(); };
          tb.querySelector(".pb-chiptb-bypass").onclick = e => { e.stopPropagation(); chip.enabled = chip.enabled === false; commit(); };
          showToolbar(el);
        }, _activeChipEl ? 150 : 0);
      });
      el.addEventListener("mouseleave", () => hideToolbar());
      tb.addEventListener("mouseenter", () => { clearTimeout(_toolbarHideTimer); clearTimeout(_switchTimer); });
      tb.addEventListener("mouseleave", () => hideToolbar());
    }
    // ==================== 渲染：chip（权重 / 删除 / 双击编辑 / 拖拽排序） ====================
    function renderChip(chip, box) {
      const el = document.createElement("span");
      const bypassedClass = chip.enabled === false ? " bypassed" : "";
      el.className = "pb-chip" + (chip.translating ? " translating" : "") + bypassedClass;
      el.draggable = true; el.dataset.cid = chip.id; el._payload = chip;
      const hasCN = !!chip.cnText;
      const sub = hasCN ? `<small class="pb-chip-sub">${escapeHtml(chip.cnText)}</small>` : "";
      const w = chip.weight.toFixed(1) === "1.0" ? "" : `<span class="w">${chip.weight.toFixed(1)}</span>`;
      el.innerHTML = `<span class="text"><span class="pb-chip-main">${escapeHtml(chip.text)}${w}</span>${sub}</span><button class="pb-chip-x" title="删除">×</button>`;
      el.querySelector(".pb-chip-x").onclick = e => { e.stopPropagation(); _pendingFocusBox = box.id; box.chips = box.chips.filter(c => c.id !== chip.id); commit(); };
      // 双击编辑
      const startEdit = (targetEl, field, value) => {
        el.draggable = false;
        targetEl.innerHTML = `<input value="${escapeHtml(value)}" style="background:var(--pb-chip-bg-focus);border:1px solid var(--pb-accent);color:var(--pb-text);border-radius:4px;padding:2px 5px;font-size:12px;width:110px;outline:none">`;
        const inp = targetEl.querySelector("input"); inp.focus(); inp.select();
        const done = (cancel) => {
          el.draggable = true;
          if (cancel) { renderWorkspace(); return; }
          const v = inp.value.trim();
          if (v && v !== value) {
            chip[field] = v;
            commit();
          } else { renderWorkspace(); }
        };
        inp.onblur = () => done(true);
        inp.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); done(false); } else if (ev.key === "Escape") done(true); };
      };
      el.querySelector(".pb-chip-main").ondblclick = e => {
        e.stopPropagation();
        startEdit(el.querySelector(".pb-chip-main"), "text", chip.text);
      };
      if (hasCN) {
        el.querySelector(".pb-chip-sub").ondblclick = e => {
          e.stopPropagation();
          startEdit(el.querySelector(".pb-chip-sub"), "cnText", chip.cnText);
        };
      }
      attachToolbarToChip(el, box, chip);
      attachChipDrag(el, box, chip);
      return el;
    }

    async function addChipsToFocused(word) {
      if (!cur.focusedBox) {
        // 自动聚焦第一个可用输入框；若一个都没有则 toast 提示
        const firstBox = cur.workspace[0]?.inputboxes?.[0];
        if (firstBox) {
          cur.focusedBox = firstBox.id;
          renderWorkspace();
          toast("已自动聚焦到「" + (cur.workspace[0].name) + " / " + (firstBox.title || "默认") + "」", "ok", 1600);
        } else {
          toast("请先在工作区添加一个输入框", "warn");
          return;
        }
      }
      for (const g of [...cur.workspace, cur.negativeGroup]) {
        const box = g.inputboxes.find(b => b.id === cur.focusedBox);
        if (!box) continue;
        if (typeof word === "object") {
          box.chips.push(mkChip(word.text, word.cnText));
        } else {
          await addChipsToBox(box, word);
        }
        commit();
        return;
      }
    }
    // ==================== 输入框自动补全 ====================
    function getAcLayer() {
      if (!_acLayer) { _acLayer = document.createElement("div"); _acLayer.className = "pb-autocomplete"; document.body.appendChild(_acLayer); }
      return _acLayer;
    }
    function hideAc() { if (_acLayer) _acLayer.classList.remove("show"); _acItems = []; _acActive = -1; }
    // 取输入框光标前、最后一个逗号后的片段作为当前补全词
    function currentTerm(input) {
      const v = input.value.slice(0, input.selectionStart ?? input.value.length);
      const parts = v.split(/[，,]/);
      return parts[parts.length - 1].trim();
    }
    function showAc(input, box) {
      const term = currentTerm(input).toLowerCase();
      if (!term) { hideAc(); return; }
      const seen = new Set(); const matches = [];
      // 1. 用户词库匹配
      for (const w of _presetIndex) {
        const en = (w.text || "").toLowerCase();
        const cn = (w.cnText || "").toLowerCase();
        if (en.includes(term) || cn.includes(term)) {
          const key = en + "|" + cn;
          if (seen.has(key)) continue; seen.add(key);
          matches.push({ text: w.text, cnText: w.cnText, source: null });
          if (matches.length >= 10) break;
        }
      }
      // 2. danbooru 词库匹配（用户词库不够 10 条时补充）
      if (matches.length < 10 && _danbooruIndex.length) {
        for (const [en, zh] of _danbooruIndex) {
          const enLow = en.toLowerCase();
          const zhLow = (zh || "").toLowerCase();
          const termAlt = term.includes(" ") ? term.replace(/\s+/g, "_") : term.includes("_") ? term.replace(/_/g, " ") : null;
          if (enLow.includes(term) || zhLow.includes(term) || (termAlt && (enLow.includes(termAlt) || zhLow.includes(termAlt)))) {
            const key = enLow + "|" + zhLow;
            if (seen.has(key)) continue; seen.add(key);
            matches.push({ text: en, cnText: zh, source: "📦 danbooru" });
            if (matches.length >= 10) break;
          }
        }
      }
      _acItems = matches; _acActive = matches.length ? 0 : -1;
      const layer = getAcLayer();
      if (!matches.length) { hideAc(); return; }
      layer.innerHTML = "";
      matches.forEach((w, i) => {
        const item = document.createElement("div"); item.className = "pb-ac-item" + (i === 0 ? " active" : "");
        const sourceTag = w.source ? '<span class="cn" style="color:var(--pb-accent-2)">' + w.source + '</span>' : "";
        item.innerHTML = '<span class="en">' + escapeHtml(w.text) + '</span>' + (w.cnText ? '<span class="cn">' + escapeHtml(w.cnText) + '</span>' : "") + sourceTag;
        // mousedown 而非 click，避免输入框失焦
        item.onmousedown = (e) => { e.preventDefault(); selectAc(input, box, i); };
        layer.appendChild(item);
      });
      // 定位：输入框下方
      const r = input.getBoundingClientRect();
      layer.style.left = r.left + "px"; layer.style.top = (r.bottom + 2) + "px";
      layer.classList.add("show");
    }
    function renderAcActive() {
      if (!_acLayer) return;
      _acLayer.querySelectorAll(".pb-ac-item").forEach((el, i) => el.classList.toggle("active", i === _acActive));
      const active = _acLayer.children[_acActive];
      if (active) active.scrollIntoView({ block: "nearest" });
    }
    // 选中第 idx 个候选：用词库词创建 chip（带 cnText），并从输入框移除当前片段
    function selectAc(input, box, idx) {
      const w = _acItems[idx]; if (!w) return;
      // 移除当前片段（光标前最后一个逗号后的内容）
      const before = input.value.slice(0, input.selectionStart ?? input.value.length);
      const after = input.value.slice(input.selectionStart ?? input.value.length);
      const cut = before.lastIndexOf(","); const cut2 = before.lastIndexOf("，");
      const cutAt = Math.max(cut, cut2);
      const prefix = cutAt >= 0 ? before.slice(0, cutAt + 1) : "";
      input.value = prefix + after;
      // 创建 chip（带词库翻译）
      _pendingFocusBox = box.id;
      box.chips.push(mkChip(w.text, w.cnText));
      hideAc(); commit();
    }

    async function addChipsToBox(box, text) {
      const terms = text.split(/[，,]/).map(s => s.trim()).filter(Boolean);
      if (!terms.length) return;
      terms.forEach(t => {
        const low = t.toLowerCase();
        const lowAlt = low.includes(" ") ? low.replace(/\s+/g, "_") : low.includes("_") ? low.replace(/_/g, " ") : null;
        // 先在用户词库匹配
        let match = _presetIndex.find(w => {
          const elow = (w.text || "").toLowerCase();
          return elow === low || (lowAlt && elow === lowAlt);
        })?.cnText;
        if (match) match = { cnText: match };
        // 再在 danbooru 词库匹配
        if (!match && _danbooruIndex.length) {
          const db = _danbooruIndex.find(([en]) => {
            const elow = en.toLowerCase();
            return elow === low || (lowAlt && elow === lowAlt);
          });
          if (db && db[1]) match = { cnText: db[1] };
        }
        box.chips.push(mkChip(t, match ? match.cnText : null));
      });
      commit();
    }
    // ==================== 翻译按钮（一次性全量翻译） ====================
    (function () {
      const toggle = $("pbTranslateToggle");
      if (!toggle) return;
      toggle.classList.remove("on"); toggle.textContent = "🌐 翻译";
      toggle.onclick = () => {
        toggle.textContent = "🌐 翻译中…"; toggle.classList.add("on");
        const allChips = []; [...cur.workspace, cur.negativeGroup].forEach(g => g.inputboxes.forEach(b => b.chips.forEach(c => { if (!c.cnText && !c.translating) allChips.push(c); })));
        if (!allChips.length) { toggle.textContent = "🌐 翻译"; toggle.classList.remove("on"); toast("没有需要翻译的词语", "", 1400); return; }
        allChips.forEach(c => c.translating = true); renderWorkspace(); renderOutput();
        let done = 0, failed = 0;
        runPool(allChips, 4, async (c) => {
          try {
            const r = await translateText(c.text);
            if (r.ok && r.text) {
              // 按译文语言归位：英文进 text（主/输出），中文进 cnText（备注）
              const isCn = /[\u4e00-\u9fff]/.test(r.text);
              if (isCn) { c.cnText = r.text; }
              else { c.cnText = /[\u4e00-\u9fff]/.test(c.text) ? c.text : (c.cnText || null); c.text = r.text; }
            } else if (!r.ok) failed++;
          } finally { delete c.translating; done++; }
        }).then(() => { commit(); toggle.textContent = "🌐 翻译"; toggle.classList.remove("on"); if (failed > 0) toast(`${failed} 个词语翻译失败（额度或网络问题）`, "warn", 2600); });
      };
    })();

    // ==================== 清空工作区 ====================
    (function () {
      const btn = $("pbClearAll");
      if (!btn) return;
      btn.onclick = () => {
        cur.workspace = [mkGroup("人物", COLORS[0])];
        cur.negativeGroup = mkNegativeGroup();
        cur.focusedBox = null;
        commit();
      };
    })();

    // ==================== 导入 / 导出 ====================
    (function bindIO() {
      const exportBtn = $("pbExportPresets"), importBtn = $("pbImport");
      /** 导出词库 JSON 文件。 */
      if (exportBtn) {
        exportBtn.onclick = (e) => {
          e.stopPropagation();
          try {
            const data = { type: "presets", presets: state.presets, l1Cat: state.l1Cat, l2Cat: state.l2Cat };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `promptbuilder-presets-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            toast("词库已导出", "ok", 1500);
          } catch (err) { toast("导出失败：" + err.message, "error"); }
        };
      }
      /** 导入：自动识别词库（presets.children）或提示词（workspace）。 */
      if (importBtn) {
        importBtn.onclick = (e) => {
          e.stopPropagation();
          const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
          inp.onchange = async () => {
            const file = inp.files?.[0]; if (!file) return;
            try {
              const text = await file.text();
              const parsed = JSON.parse(text);
              if (!parsed || (!parsed.presets && !parsed.workspace)) throw new Error("文件格式不正确");
              const isPresets = !!(parsed.presets?.children);
              const isPrompt = !!(parsed.workspace);
              const label = isPresets && isPrompt ? "词库 + 提示词" : isPresets ? "词库" : "提示词";
              const ok = await confirmModal(`检测到「${label}」备份，导入将覆盖当前对应数据，确定继续？`, {
                okText: "覆盖导入", title: "导入 " + label
              });
              if (!ok) return;
              if (isPresets) {
                state.presets = parsed.presets;
                state.l1Cat = parsed.l1Cat || Object.keys(state.presets.children)[0] || null;
                state.l2Cat = parsed.l2Cat || Object.keys(state.presets.children[state.l1Cat]?.children || {})[0] || null;
                saveSharedState();
                renderPresets();
              }
              if (isPrompt) {
                cur.workspace = parsed.workspace;
                cur.negativeGroup = parsed.negativeGroup || mkNegativeGroup();
                cur.focusedBox = parsed.focusedBox ?? null;
                migrateGroups(cur.workspace);
                migrateGroups([cur.negativeGroup]);
                if (!cur.negativeGroup?.inputboxes?.length) cur.negativeGroup = mkNegativeGroup();
                if (!cur.workspace.length) cur.workspace = [mkGroup("人物", COLORS[0])];
                cur.focusedBox = cur.focusedBox || cur.workspace[0]?.inputboxes?.[0]?.id || null;
                saveCurrentNodeState();
                renderWorkspace(); renderOutput();
              }
              toast("导入成功", "ok", 1800);
            } catch (err) { toast("导入失败：" + err.message, "error"); }
          };
          inp.click();
        };
      }
    })();

    // ==================== 撤销/重做：按钮 + 快捷键 ====================
    (function bindUndoRedo() {
      const u = $("pbUndo"), r = $("pbRedo");
      if (u) u.onclick = (e) => { e.stopPropagation(); undo(); };
      if (r) r.onclick = (e) => { e.stopPropagation(); redo(); };
      // 仅在面板可见时响应快捷键
      document.addEventListener("keydown", (e) => {
        if (!panel.classList.contains("visible")) return;
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) return;
        // 输入框里编辑文本时也允许，但避免与浏览器原生冲突：仅在面板内命中时拦截
        if (e.key === "z" || e.key === "Z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        else if (e.key === "y" || e.key === "Y") { e.preventDefault(); redo(); }
      });
    })();

    // Generate 按钮：触发 ComfyUI 生成 1 张
    (function bindGenerate() {
      const btn = $("pbGenerate"); if (!btn) return;
      btn.onclick = (e) => {
        e.stopPropagation();
        if (app?.queuePrompt) { app.queuePrompt(0, 1); }
      };
    })();

    // 鼠标滚轮横向滚动分类行
    (function bindCatScroll() {
      [$("pbPresetCats"), $("pbPresetCatsL2")].forEach(el => {
        el?.addEventListener("wheel", (e) => {
          if (el.scrollWidth <= el.clientWidth) return;
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }, { passive: false });
      });
    })();

    // ==================== chip 拖拽保存到当前选中分类 ====================
    (function bindChipToPreset() {
      const presetCol = panel.querySelector(".pb-col"); // 左栏第一列
      if (!presetCol) return;
      presetCol.addEventListener("dragover", (e) => {
        if (!chipDragCtx) return;
        e.preventDefault();
        presetCol.classList.add("drop-hover");
      });
      presetCol.addEventListener("dragleave", (e) => {
        // 仅当离开整个列时移除高亮
        if (!presetCol.contains(e.relatedTarget)) presetCol.classList.remove("drop-hover");
      });
      presetCol.addEventListener("drop", (e) => {
        if (!chipDragCtx) return;
        e.preventDefault();
        presetCol.classList.remove("drop-hover");
        const chip = chipDragCtx.chip;
        // 检查当前是否有选中的 L1/L2 分类
        if (!state.l1Cat || !state.l2Cat) { toast("请先在左栏选择一个分类", "warn"); return; }
        const l2Node = state.presets.children[state.l1Cat]?.children?.[state.l2Cat];
        if (!l2Node) { toast("目标分类不存在", "error"); return; }
        // 存入当前分类（允许重复）
        l2Node.items.push({ text: chip.text, cnText: chip.cnText || null });
        renderPresets(); persist();
        toast(`已保存「${chip.text}」到 ${state.l1Cat} / ${state.l2Cat}`, "ok", 1800);
      });
    })();

    // ==================== 搜索结果（跨所有分类，独立渲染，不影响 renderPresets） ====================
    function renderSearchResults(q) {
      const box = $("pbPresetSearchResults");
      if (!box) return;
      box.innerHTML = "";
      // 收集所有分类下的命中项，记录来源 items 数组用于删除
      const hits = [];
      Object.keys(state.presets.children).forEach(l1 => {
        const l1Node = state.presets.children[l1];
        Object.keys(l1Node.children || {}).forEach(l2 => {
          const items = l1Node.children[l2].items || [];
          items.forEach(w => {
            const cn = (w.cnText || "").toLowerCase();
            const en = (w.text || "").toLowerCase();
            if (cn.includes(q) || en.includes(q)) hits.push({ w, items, path: l1 + " / " + l2 });
          });
        });
      });
      if (!hits.length) {
        const empty = document.createElement("div");
        empty.style.cssText = "color:var(--pb-text-dim);font-size:12px;text-align:center;padding:14px 4px";
        empty.textContent = "无匹配结果";
        box.appendChild(empty);
        return;
      }
      hits.forEach(({ w, items, path }) => {
        box.appendChild(renderPresetWord(w, { items, path, onDeleted: () => { renderSearchResults(q); persist(); } }));
      });
    }

    // 搜索框实时过滤：搜索态切换 pbPresetList / pbPresetSearchResults 的显示，
    // 由独立的 renderSearchResults 渲染结果，完全不调用 renderPresets（解耦，避免互相干扰）
    (function bindPresetSearch() {
      const inp = $("pbPresetSearch");
      if (!inp) return;
      const listEl = $("pbPresetList");
      const resEl = $("pbPresetSearchResults");
      let st;
      inp.addEventListener("input", () => {
        clearTimeout(st);
        st = setTimeout(() => {
          const q = (inp.value || "").trim().toLowerCase();
          if (q) {
            if (listEl) listEl.style.display = "none";
            if (resEl) resEl.style.display = "";
            renderSearchResults(q);
          } else {
            if (listEl) listEl.style.display = "";
            if (resEl) resEl.style.display = "none";
          }
        }, 100);
      });
    })();

    // 预加载 danbooru 词库（仅一次，不阻塞渲染）
    if (!_danbooruIndex.length && !_danbooruLoading) {
      _danbooruLoading = true;
      const base = import.meta.url.substring(0, import.meta.url.lastIndexOf("/"));
      fetch(base + "/danbooru-tags.json").then(r => r.json()).then(arr => {
        _danbooruIndex = arr;
      }).catch(() => {}).finally(() => { _danbooruLoading = false; });
    }

    renderPresets(); renderWorkspace(); renderOutput();
    _lastSnapshot = snapshotState(); // 撤销基准：记录初始状态
    (function autoFocus() { if (cur.workspace.length && cur.workspace[0].inputboxes.length) { cur.focusedBox = cur.workspace[0].inputboxes[0].id; $("pbWorkspace").querySelector(".pb-chip-input")?.focus(); } })();
    // 暴露给 extension 层的其他钩子（nodeCreated / getNodeMenuItems / beforeRegisterNodeDef）
    panel._loadNodeIntoPanel = loadNodeIntoPanel;
  },

  // ==================== 节点集成：按钮入口 + 右键菜单 ====================
  nodeCreated(node) {
    if (node.comfyClass !== "PromptBuilderCLIPEncode") return;
    const panel = document.querySelector(".pb-panel");
    if (!panel) return;
    node.addWidget("button", "✏️ 在 PromptBuilder 中编辑", null, () => {
      if (panel._loadNodeIntoPanel) panel._loadNodeIntoPanel(node);
      panel.classList.add("visible");
    });
    // 节点上只预览不可编辑
    setTimeout(() => {
      node.widgets.forEach(w => {
        if ((w.name === "positive" || w.name === "negative") && w.element) {
          const ta = w.element.querySelector?.("textarea") || w.element;
          ta.disabled = true;
        }
      });
    }, 200);
  },

  getNodeMenuItems(node) {
    if (node.comfyClass !== "PromptBuilderCLIPEncode") return [];
    const panel = document.querySelector(".pb-panel");
    return [{
      content: "✏️ 在 PromptBuilder 中编辑",
      callback: () => { if (panel && panel._loadNodeIntoPanel) { panel._loadNodeIntoPanel(node); panel.classList.add("visible"); } }
    }];
  },

  // 工作流加载 / 拖图后：若面板已打开且绑定节点已失效，自动刷新
  beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "PromptBuilderCLIPEncode") return;
    const origOnConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function(o) {
      const r = origOnConfigure?.apply(this, arguments);
      try {
        const panel = document.querySelector(".pb-panel");
        if (!panel?.classList.contains("visible") || !panel._loadNodeIntoPanel) return r;
        const activeId = panel.dataset.activeNode;
        // 若当前绑定节点已不在图中（工作流重载 / 拖图），或本节点就是绑定节点，则重载面板
        const activeStillExists = activeId != null && app.graph?._nodes?.some(n =>
          String(n.id) === activeId && n.comfyClass === "PromptBuilderCLIPEncode"
        );
        if (!activeStillExists || activeId === String(this.id)) {
          panel._loadNodeIntoPanel(this);
        }
      } catch (e) {}
      return r;
    };
  }
});
