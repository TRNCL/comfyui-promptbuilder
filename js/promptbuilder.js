import { app } from "../../scripts/app.js";

/* ============================================================
   PromptBuilder ComfyUI 插件
   浮动面板（三栏）+ 节点入口，修改自动同步到所有节点
   - 左栏：预设词库（双行分类 / 词语 / 跨分类搜索 / 拖拽排序）
   - 中栏：工作区（分组 → 输入框 → chip，权重/翻译/bypass/拖拽排序）
   - 右栏：输出（复制按钮 + 词条计数，自动 sync 到节点）
   其它：撤销/恢复、导入/导出 JSON、面板位置记忆、拖拽指示线
   状态持久化到 localStorage，带版本迁移（_v）
   ============================================================ */
app.registerExtension({
  name: "promptbuilder.promptbuilder",

  init() {
    // ==================== 样式：全部 pb- 前缀，避免污染 ComfyUI ====================
    const style = document.createElement("style");
    style.textContent = `
.pb-panel *{box-sizing:border-box}
:root{--pb-bg:#0f1115;--pb-panel:#161a22;--pb-panel-2:#1c2230;--pb-border:#262d3b;--pb-text:#e6e9ef;--pb-text-dim:#8a93a6;--pb-accent:#6aa9ff;--pb-accent-2:#8b6aff;--pb-danger:#ff6b6b;--pb-chip-bg:#2a3142;--pb-chip-bg-focus:#324063}
.pb-panel{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Roboto,Arial,sans-serif;font-size:14px;position:fixed;top:50px;left:50px;width:950px;height:620px;z-index:9999;display:none;flex-direction:column;border:1px solid var(--pb-border);border-radius:10px;background:var(--pb-bg);color:var(--pb-text);box-shadow:0 8px 32px rgba(0,0,0,.6);resize:both;overflow:hidden;min-width:600px;min-height:400px}
.pb-panel.visible{display:flex}
.pb-titlebar{display:flex;align-items:center;justify-content:space-between;padding:7px 12px;background:var(--pb-panel-2);border-bottom:1px solid var(--pb-border);cursor:move;user-select:none;font-size:13px;font-weight:600;flex-shrink:0}
.pb-title-name{pointer-events:none}
.pb-title-actions{display:flex;align-items:center;gap:6px}
.pb-title-actions .pb-btn{cursor:pointer}
.pb-titlebar .pb-close{cursor:pointer;color:var(--pb-text-dim);font-size:16px;padding:0 4px}
.pb-titlebar .pb-close:hover{color:var(--pb-danger)}
.pb-body{display:grid;grid-template-columns:280px 1fr 260px;flex:1;min-height:0;overflow:hidden}
.pb-col{display:flex;flex-direction:column;background:var(--pb-panel);border-right:1px solid var(--pb-border);min-width:0;overflow:hidden}
.pb-col:last-child{border-right:none;border-left:1px solid var(--pb-border)}
.pb-col-header{display:flex;align-items:center;justify-content:space-between;padding:0 10px;gap:6px;border-bottom:1px solid var(--pb-border);font-weight:600;font-size:13px;background:var(--pb-panel-2);flex-shrink:0;height:36px}
.pb-col-body{flex:1;overflow:auto;padding:8px 10px;min-height:0}
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
.pb-chip{display:inline-flex;align-items:center;gap:1px;background:var(--pb-chip-bg);padding:2px 2px 2px 2px;border-radius:6px;font-size:12px;border:1px solid transparent;user-select:none}
.pb-chip .text{display:flex;flex-direction:column;padding:0 5px;line-height:1.3}
.pb-chip .text .w{color:var(--pb-text-dim);font-size:10px}
.pb-chip-main{white-space:nowrap}
.pb-chip-sub{font-size:10px;color:var(--pb-text-dim);line-height:1.2}
.pb-chip-path{font-size:9px;color:var(--pb-text-dim);opacity:.7;line-height:1.2;margin-top:1px;font-style:italic}
.pb-chip.translating .pb-chip-sub{color:var(--pb-accent)}
.pb-chip.dragging{opacity:.4}
.pb-chip.tok-highlight{background:#3d2a1f;border-color:#ff9f6a;box-shadow:0 0 6px rgba(255,159,106,.3)}
.pb-chip .adj{min-width:16px;align-self:stretch;text-align:center;border:none;background:transparent;color:var(--pb-text-dim);cursor:pointer;font-size:12px;padding:0 3px;border-radius:4px}
.pb-chip .adj:hover{background:var(--pb-panel-2);color:var(--pb-accent)}
.pb-chip .x{min-width:22px;align-self:stretch;text-align:center;border:none;background:transparent;color:var(--pb-text-dim);cursor:pointer;font-size:13px;padding:0 3px;border-radius:4px}
.pb-chip .x:hover{background:var(--pb-panel-2);color:var(--pb-danger)}
.pb-chip .w{color:var(--pb-text-dim);font-size:10px;margin-left:3px}
.pb-chip.translating{opacity:.8}
.pb-chip.translating::after{content:"⟳";font-size:10px;margin-left:2px;color:var(--pb-accent)}
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
.pb-toggle{display:inline-flex;align-items:center;cursor:pointer}
.pb-toggle input{display:none}
.pb-toggle-slider{width:32px;height:18px;background:var(--pb-border);border-radius:9px;position:relative;transition:background .2s}
.pb-toggle-slider::after{content:"";width:14px;height:14px;background:var(--pb-text-dim);border-radius:50%;position:absolute;top:2px;left:2px;transition:all .2s}
.pb-toggle input:checked+.pb-toggle-slider{background:var(--pb-accent)}
.pb-toggle input:checked+.pb-toggle-slider::after{background:#0b1020;left:16px}
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
      <div class="pb-titlebar"><span class="pb-title-name">PromptBuilder</span><div class="pb-title-actions"><button class="pb-btn" id="pbUndo" title="撤销 (Ctrl+Z)">↶</button><button class="pb-btn" id="pbRedo" title="重做 (Ctrl+Y)">↷</button><button class="pb-btn" id="pbExport" title="导出 JSON 备份">⬆ 导出</button><button class="pb-btn" id="pbImport" title="导入 JSON">⬇ 导入</button><button class="pb-btn primary" id="pbGenerate" title="执行生成 (1 张)" style="margin-left:4px">▶ 生成</button><span class="pb-close">×</span></div></div>
      <div class="pb-body">
        <div class="pb-col">
          <div class="pb-col-header"><span>预设词库</span></div>
          <div class="pb-preset-search"><input id="pbPresetSearch" placeholder="搜索词语…" autocomplete="off"/></div>
          <div class="pb-preset-cats" id="pbPresetCats"></div>
          <div class="pb-preset-cats pb-l2" id="pbPresetCatsL2"></div>
          <div class="pb-col-body" style="padding:0"><div class="pb-preset-list" id="pbPresetList"></div><div class="pb-preset-list" id="pbPresetSearchResults" style="display:none"></div></div>
        </div>
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
            <div class="pb-setting-row"><span class="label">Token 高亮</span><label class="pb-toggle"><input type="checkbox" id="pbToggleToken75"><span class="pb-toggle-slider"></span></label></div>
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
    // ResizeObserver 监听尺寸变化
    try {
      const ro = new ResizeObserver(() => savePanelGeo());
      ro.observe(panel);
    } catch (e) {}
    function closePanel() { panel.classList.remove("visible"); const p = document.querySelector(".pb-color-picker"); if (p) p.remove(); hideIndicator(); hideAc(); }
    panel.querySelector(".pb-close").onclick = closePanel;

    /* ============================================================
       逻辑入口
       ============================================================ */
    // ==================== 工具函数 ====================
    const $ = (id) => document.getElementById(id);
    const COLORS = ["#6aa9ff","#8b6aff","#ff6b9d","#ff9f6a","#ffd86a","#6affb6","#6ae0ff","#ff6b6b","#b46aff","#6a8aff","#9aff6a","#ff6ad8"];
    const MAX_WEIGHT = 5.0;

    let state = {
      _v: 3,
      presets: { items: [], children: {} },
      l1Cat: null, l2Cat: null,
      workspace: [mkGroup("人物", COLORS[0])],
      focusedBox: null,
      settings: { scale: "mid", translator: "mymemory", theme: "dark", tokenHighlight: false, customApi: { url: "", method: "GET", body: "", responseField: "" } },
      _token75ChipId: null
    };
    state.negativeGroup = mkNegativeGroup();

    try {
      const saved = JSON.parse(localStorage.getItem("promptbuilder_comfy_state"));
      if (saved) {
        // 兼容旧数据：按 _v 版本号顺序迁移（v0=最旧，当前=3）
        // 每个版本步骤幂等：对新数据无副作用，对旧数据补齐缺失字段
        saved._v = saved._v || 0;
        // v0 → v1：清理已废弃的 group.weight 死字段
        if (saved._v < 1) {
          const stripWeight = (g) => { if (g) delete g.weight; };
          (saved.workspace || []).forEach(stripWeight);
          stripWeight(saved.negativeGroup);
        }
        // v1 → v2：为每个 group 补 enabled=true（默认参与输出）
        if (saved._v < 2) {
          const ensureEnabled = (g) => { if (g && g.enabled === undefined) g.enabled = true; };
          (saved.workspace || []).forEach(ensureEnabled);
          ensureEnabled(saved.negativeGroup);
        }
        // v2 → v3：为每个 inputbox 补 enabled=true（默认参与输出）
        if (saved._v < 3) {
          const ensureBoxEnabled = (g) => { (g?.inputboxes || []).forEach(b => { if (b.enabled === undefined) b.enabled = true; }); };
          (saved.workspace || []).forEach(ensureBoxEnabled);
          ensureBoxEnabled(saved.negativeGroup);
        }
        saved._v = 3;
        if (saved.presets?.children) {
          state.presets = saved.presets;
          state.l1Cat = saved.l1Cat || state.l1Cat;
          state.l2Cat = saved.l2Cat || state.l2Cat;
        }
        if (saved.workspace) state.workspace = saved.workspace;
        if (saved.negativeGroup) state.negativeGroup = saved.negativeGroup;
        if (saved.focusedBox != null) state.focusedBox = saved.focusedBox;
        if (saved.settings) state.settings = Object.assign(state.settings, saved.settings);
      }
    } catch (e) {}
    if (!state.negativeGroup?.inputboxes?.length) {
      state.negativeGroup = mkNegativeGroup();
    }

    function gid() { return Math.random().toString(36).slice(2, 9); }
    let _presetIndex = [];     // 词库扁平索引，renderPresets 末尾重建
    let _danbooruIndex = [];   // danbooru 标签索引 [[en, zh], ...]，init 时异步加载
    let _danbooruLoading = false;
    let _pendingFocusBox = null; // 输入确认后保持聚焦的 box id
    let _acLayer = null;       // 自动补全浮层元素（懒创建）
    let _acItems = [];         // 当前浮层显示的候选词对象数组
    let _acActive = -1;        // 当前高亮项索引
    /** 创建一个输入框（box） */
    function mkBox(title = "默认") { return { id: gid(), title, enabled: true, chips: [] }; }
    /** 创建一个普通分组（group） */
    function mkGroup(name, color) { return { id: gid(), name, color, enabled: true, collapsed: false, inputboxes: [mkBox()] }; }
    /** 创建负面提示词分组（固定结构） */
    function mkNegativeGroup() { return { id: "__neg__", name: "负面提示词", color: COLORS[3], enabled: true, collapsed: false, inputboxes: [mkBox()] }; }
    /** 创建一个 chip */
    function mkChip(text, cnText) { return { id: gid(), text, cnText: cnText || null, weight: 1.0 }; }
    let _persistTimer;
    // ==================== 撤销 / 恢复 ====================
    // 策略：以 persist() 的 200ms 防抖为快照边界 —— 连续输入会合并为一次可撤销操作，
    // 避免逐字符产生海量快照。undoStack 存历史，redoStack 存撤销后可重做的状态。
    const UNDO_LIMIT = 50;
    let undoStack = [];   // 历史快照（较旧 → 较新）
    let redoStack = [];
    let _lastSnapshot = null; // 最近一次持久化后的快照
    function snapshotState() {
      // 只快照用户数据，避免捕获临时态
      return JSON.parse(JSON.stringify({
        _v: state._v, presets: state.presets, l1Cat: state.l1Cat, l2Cat: state.l2Cat,
        workspace: state.workspace, negativeGroup: state.negativeGroup, focusedBox: state.focusedBox,
        settings: state.settings
      }));
    }
    function restoreSnapshot(snap) {
      if (!snap) return;
      state._v = snap._v; state.presets = snap.presets; state.l1Cat = snap.l1Cat; state.l2Cat = snap.l2Cat;
      state.workspace = snap.workspace; state.negativeGroup = snap.negativeGroup; state.focusedBox = snap.focusedBox;
      if (snap.settings) state.settings = snap.settings;
      applySettings(); renderPresets(); renderWorkspace(); renderOutput();
    }
    function undo() {
      if (!undoStack.length) { toast("没有可撤销的操作", "", 1200); return; }
      redoStack.push(_lastSnapshot);
      const prev = undoStack.pop();
      _lastSnapshot = prev;
      restoreSnapshot(prev);
      saveState();
      toast("已撤销", "ok", 1000);
    }
    function redo() {
      if (!redoStack.length) { toast("没有可重做的操作", "", 1200); return; }
      undoStack.push(_lastSnapshot);
      const next = redoStack.pop();
      _lastSnapshot = next;
      restoreSnapshot(next);
      saveState();
      toast("已重做", "ok", 1000);
    }
    /** 统一的 state 写入，带配额超限容错 */
    function saveState() {
      try { localStorage.setItem("promptbuilder_comfy_state", JSON.stringify(state)); }
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
    function persist() {
      clearTimeout(_persistTimer);
      _persistTimer = setTimeout(() => { saveState(); scheduleSnapshot(); }, 200);
    }
    /** 统一的"重新渲染 + 持久化"收口，绝大多数状态变更后调用 */
    function commit() { if (state.settings.tokenHighlight) findToken75Chip(); renderWorkspace(); renderOutput(); persist(); }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

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
      // 同步 token 高亮开关
      const tokToggle = $("pbToggleToken75"); if (tokToggle) tokToggle.checked = st.tokenHighlight;
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
    const tokToggle = $("pbToggleToken75");
    if (tokToggle) tokToggle.onchange = () => { state.settings.tokenHighlight = tokToggle.checked; commit(); };
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
          state.focusedBox = box.id;
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
        if (state.focusedBox !== box.id && !box.chips.length) return;
        box.chips.forEach(c => {
          const w = +c.weight.toFixed(1);
          if (w === 1.0) { parts.push(c.text); return; }
          parts.push(`(${c.text}:${w.toFixed(1)})`);
        });
      });
      return parts;
    }
    function buildPositive() {
      const parts = [];
      state.workspace.forEach(g => { parts.push(...buildGroup(g)); });
      return parts.join(", ");
    }
    function buildNegative() {
      return buildGroup(state.negativeGroup).join(", ");
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
    function findToken75Chip() {
      let acc = 0;
      for (const g of state.workspace) {
        if (g.enabled === false) continue;
        for (const box of g.inputboxes) {
          if (box.enabled === false) continue;
          for (const c of box.chips) {
            const term = c.weight.toFixed(1) !== "1.0"
              ? `(${c.text}:${c.weight.toFixed(1)})` : c.text;
            const tok = estimateTokens(term);
            if (acc < 75 && acc + tok >= 75) {
              state._token75ChipId = c.id;
              return;
            }
            acc += tok;
          }
        }
      }
      state._token75ChipId = null;
    }
    let _pbNodes = null; // 缓存 PromptBuilderCLIPEncode 节点（惰性失效）
    function syncToNode(field, text) {
      if (!app.graph?._nodes) return;
      // 惰性清理：过滤掉已从图中移除的节点；缓存为空时回退全量扫描并重建
      if (_pbNodes) _pbNodes = _pbNodes.filter(n => app.graph._nodes.includes(n));
      if (!_pbNodes || !_pbNodes.length) {
        _pbNodes = app.graph._nodes.filter(n => n.comfyClass === "PromptBuilderCLIPEncode");
      }
      let changed = false;
      _pbNodes.forEach(node => {
        const widget = node.widgets?.find(w => w.name === field);
        if (widget && widget.value !== text) { widget.value = text; changed = true; }
      });
      if (changed) app.graph.change();
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
      // 新建词语（同上，不变）
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
      const ng = state.negativeGroup;
      const ngEnabled = ng.enabled !== false;
      const g = document.createElement("div");
      g.className = "pb-group negative-fixed" + (ng.collapsed ? " collapsed" : "") + (ngEnabled ? "" : " disabled");
      g.dataset.gid = ng.id; g._payload = ng;
      const bar = document.createElement("div"); bar.className = "pb-group-color-bar"; bar.style.background = ng.color; g.appendChild(bar);
      const header = document.createElement("div"); header.className = "pb-group-header";
      header.innerHTML = `<span class="caret">▾</span><div class="pb-color-dot" style="background:${ng.color}"></div><div class="name">${escapeHtml(ng.name)}</div><button class="pb-btn pb-group-toggle" data-act="toggle" title="${ngEnabled ? "禁用输出" : "启用输出"}" style="font-size:11px;padding:2px 6px;margin-left:auto">${ngEnabled ? "👁" : "🚫"}</button><button class="pb-btn" data-act="clear" style="font-size:11px;padding:2px 6px;" title="一键清空">清空</button>`;
      header.onclick = (e) => {
        if (e.target.dataset.act === "clear") { ng.inputboxes.forEach(box => box.chips = []); commit(); return; }
        if (e.target.dataset.act === "toggle") { ng.enabled = ng.enabled === false; commit(); return; }
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
      state.workspace.forEach(group => {
        const g = document.createElement("div");
        g.className = "pb-group" + (group.collapsed ? " collapsed" : "");
        g.dataset.gid = group.id; g._payload = group; g.draggable = true;
        attachListDrag(g, state.workspace, () => { commit(); }, "group");
        const bar = document.createElement("div"); bar.className = "pb-group-color-bar"; bar.style.background = group.color; g.appendChild(bar);
        const gEnabled = group.enabled !== false;
        g.classList.toggle("disabled", !gEnabled);
        const header = document.createElement("div"); header.className = "pb-group-header";
        header.innerHTML = `<span class="caret">▾</span><div class="pb-color-dot" style="background:${group.color}"></div><div class="name">${escapeHtml(group.name)}</div><button class="pb-btn pb-group-toggle" data-act="toggle" title="${gEnabled ? "禁用输出" : "启用输出"}" style="font-size:11px;padding:2px 6px;">${gEnabled ? "👁" : "🚫"}</button><button class="pb-btn" data-act="del" style="font-size:11px;padding:2px 6px;" title="删除分组">删除</button>`;
        header.onclick = (e) => {
          if (e.target.dataset.act === "del") { state.workspace = state.workspace.filter(x => x.id !== group.id); commit(); return; }
          if (e.target.dataset.act === "toggle") { group.enabled = group.enabled === false; commit(); return; }
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
      add.onclick = () => { state.workspace.push(mkGroup("新分组", COLORS[(state.workspace.length) % COLORS.length])); commit(); };
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
      const isFixed = group === state.negativeGroup;
      const boxEnabled = box.enabled !== false;
      const el = document.createElement("div");
      el.className = "pb-inputbox" + (state.focusedBox === box.id ? " focused" : "") + (!isFixed && !boxEnabled ? " disabled" : "");
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
        state.focusedBox = box.id; el.classList.add("focused");
      };
      el.querySelector(".pb-inputbox-title").oninput = (e) => { box.title = e.target.value; renderOutput(); persist(); };
      if (!isFixed) el.querySelector(".pb-inputbox-remove").onclick = (e) => { e.stopPropagation(); group.inputboxes = group.inputboxes.filter(b => b.id !== box.id); if (state.focusedBox === box.id) state.focusedBox = null; commit(); };
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
    // ==================== 渲染：chip（权重 / 删除 / 双击编辑 / 拖拽排序） ====================
    function renderChip(chip, box) {
      const el = document.createElement("span");
      el.className = "pb-chip" + (chip.translating ? " translating" : "") + (state.settings.tokenHighlight && chip.id === state._token75ChipId ? " tok-highlight" : "");
      el.draggable = true; el.dataset.cid = chip.id; el._payload = chip;
      const hasCN = !!chip.cnText;
      const sub = hasCN ? `<small class="pb-chip-sub">${escapeHtml(chip.cnText)}</small>` : "";
      const w = chip.weight.toFixed(1) === "1.0" ? "" : `<span class="w">${chip.weight.toFixed(1)}</span>`;
      el.innerHTML = `<button class="adj adj-minus" title="减权 0.1">−</button><span class="text"><span class="pb-chip-main">${escapeHtml(chip.text)}${w}</span>${sub}</span><button class="adj adj-plus" title="加权 0.1">+</button><button class="x" title="删除">×</button>`;
      el.querySelector(".adj-minus").onmousedown = e => e.preventDefault();
      el.querySelector(".adj-plus").onmousedown = e => e.preventDefault();
      el.querySelector(".adj-minus").onclick = e => { e.stopPropagation(); chip.weight = clamp(+(chip.weight - 0.1).toFixed(1), 0.1, MAX_WEIGHT); commit(); };
      el.querySelector(".adj-plus").onclick = e => { e.stopPropagation(); chip.weight = clamp(+(chip.weight + 0.1).toFixed(1), 0.1, MAX_WEIGHT); commit(); };
      el.querySelector(".x").onclick = e => { e.stopPropagation(); _pendingFocusBox = box.id; box.chips = box.chips.filter(c => c.id !== chip.id); commit(); };
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
      attachChipDrag(el, box, chip);
      return el;
    }

    async function addChipsToFocused(word) {
      if (!state.focusedBox) {
        // 自动聚焦第一个可用输入框；若一个都没有则 toast 提示
        const firstBox = state.workspace[0]?.inputboxes?.[0];
        if (firstBox) {
          state.focusedBox = firstBox.id;
          renderWorkspace();
          toast("已自动聚焦到「" + (state.workspace[0].name) + " / " + (firstBox.title || "默认") + "」", "ok", 1600);
        } else {
          toast("请先在工作区添加一个输入框", "warn");
          return;
        }
      }
      for (const g of [...state.workspace, state.negativeGroup]) {
        const box = g.inputboxes.find(b => b.id === state.focusedBox);
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
        const allChips = []; [...state.workspace, state.negativeGroup].forEach(g => g.inputboxes.forEach(b => b.chips.forEach(c => { if (!c.cnText && !c.translating) allChips.push(c); })));
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
        state.workspace = [mkGroup("人物", COLORS[0])];
        state.negativeGroup = mkNegativeGroup();
        state.focusedBox = null;
        commit();
      };
    })();

    // ==================== 导入 / 导出 ====================
    (function bindIO() {
      const exportBtn = $("pbExport"), importBtn = $("pbImport");
      if (exportBtn) {
        exportBtn.onclick = (e) => {
          e.stopPropagation();
          try {
            const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `promptbuilder-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            toast("已导出备份", "ok", 1600);
          } catch (err) { toast("导出失败：" + err.message, "error"); }
        };
      }
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
              const ok = await confirmModal("导入将覆盖当前所有数据，确定继续？", { okText: "覆盖导入", title: "导入 JSON" });
              if (!ok) return;
              // 合并：用导入数据覆盖，并跑一遍迁移确保字段齐全
              if (parsed.presets) state.presets = parsed.presets;
              if (parsed.workspace) state.workspace = parsed.workspace;
              if (parsed.negativeGroup) state.negativeGroup = parsed.negativeGroup;
              state.l1Cat = parsed.l1Cat || Object.keys(state.presets.children)[0] || null;
              state.l2Cat = parsed.l2Cat || Object.keys(state.presets.children[state.l1Cat]?.children || {})[0] || null;
              // 统一跑迁移补字段（weight 清理 + group/box enabled）
              const migrate = (g) => { if (!g) return; delete g.weight; if (g.enabled === undefined) g.enabled = true; (g.inputboxes || []).forEach(b => { if (b.enabled === undefined) b.enabled = true; }); };
              state.workspace.forEach(migrate); migrate(state.negativeGroup);
              state._v = 3;
              state.focusedBox = state.workspace[0]?.inputboxes?.[0]?.id || null;
              renderPresets(); commit();
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
    (function autoFocus() { if (state.workspace.length && state.workspace[0].inputboxes.length) { state.focusedBox = state.workspace[0].inputboxes[0].id; $("pbWorkspace").querySelector(".pb-chip-input")?.focus(); } })();
  },

  // ==================== 节点集成：按钮入口 + 右键菜单 ====================
  nodeCreated(node) {
    if (node.comfyClass !== "PromptBuilderCLIPEncode") return;
    const panel = document.querySelector(".pb-panel");
    if (!panel) return;
    node.addWidget("button", "✏️ 在 PromptBuilder 中编辑", null, () => {
      panel.dataset.activeNode = String(node.id);
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
      callback: () => { if (panel) { panel.dataset.activeNode = String(node.id); panel.classList.add("visible"); } }
    }];
  }
});
