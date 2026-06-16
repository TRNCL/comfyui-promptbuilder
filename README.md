# PromptBuilder — ComfyUI 可视化提示词编辑器<br><sub>Visual Prompt Editor for ComfyUI</sub>

一个 ComfyUI 插件，让你用拖拽、点击、打字的方式搭建提示词，告别在小文本框里手敲逗号。

A ComfyUI custom node that lets you build prompts visually by dragging, clicking, and typing — no more typing commas in tiny text areas.

![](screenshot.png)

## 功能特性 / Features

- **可视化搭建 / Visual builder** — 分组 → 输入框 → 词语芯片，三级结构，拖拽排序
- **自定义词库 / Word bank** — 中英文词语仓库，支持分类、搜索，搭提示词像拼积木
- **Danbooru 自动补全 / Danbooru auto-complete** — 内置 3.7 万标签 + 中文翻译，输入即搜（37K+ tags with CN translations）
- **权重微调 / Weight adjustment** — ±0.1 按钮精确控制每个词的权重
- **一键翻译 / One-click translation** — 批量翻译未翻译的词（MyMemory / Google / 自定义 API）
- **Token 实时统计 / Token counter** — CLIP token 近似估算，超 75 标黄、超 150 标红
- **Token 高亮定位 / Token highlight** — 可开关：高亮第 75 个 token 对应的词，方便控制提示词长度
- **撤销/重做 / Undo/Redo** — 50 步历史（Ctrl+Z / Ctrl+Y）
- **导入/导出（分离） / Import/Export (separated)** — 词库和提示词各自独立导出/导入，互不覆盖；导入自动识别格式。Word bank and prompt are exported/imported independently with auto-detection.
- **暗色/亮色主题 / Dark/Light theme** — 可调缩放比例

## 安装 / Installation

把 `comfyui-promptbuilder` 文件夹放到 ComfyUI 的 `custom_nodes/` 目录下，重启 ComfyUI。

Copy the `comfyui-promptbuilder` folder into ComfyUI's `custom_nodes/` directory, then restart.

```
ComfyUI/
└── custom_nodes/
    └── comfyui-promptbuilder/
        ├── __init__.py
        ├── nodes.py
        ├── LICENSE
        ├── README.md
        └── js/
            ├── promptbuilder.js
            └── danbooru-tags.json
```

## 使用 / Usage

1. 在节点菜单中 `conditioning/promptbuilder` 分类下，添加 **PromptBuilder CLIP Encode** 节点
2. 连接 CLIP 模型
3. 点击节点上的 **✏️ 在 PromptBuilder 中编辑** 打开浮动面板
4. 搭建提示词 — 输出自动同步到节点
5. 多个 PromptBuilder 节点各自独立：点击不同节点的按钮，面板自动切到对应节点的内容，不会互相覆盖

---

> 1. Find **PromptBuilder CLIP Encode** under `conditioning/promptbuilder` in the node menu
> 2. Connect to a CLIP model
> 3. Click **✏️ 在 PromptBuilder 中编辑** to open the floating panel
> 4. Build prompts — they sync to the node automatically
> 5. Multiple PromptBuilder nodes are independent: clicking the button on different nodes switches the panel to that node's content — no cross-contamination

### 面板布局 / Layout

```
┌──────────────┬────────────────────┬──────────────┐
│  预设词库     │  工作区             │  输出         │
│  Presets     │  Workspace         │  Output      │
│              │                    │              │
│  分类 & 词语  │  ▸ 分组 / Group     │  Positive    │
│              │   [输入框/box]      │  [复制/copy] │
│  搜索        │   [芯片/chips...]   │  统计/counts │
│  Search      │                    │              │
│              │  ▾ 负面提示词        │  Negative    │
│              │   Negative         │  [复制/copy] │
│              │   [输入框/box]      │  统计/counts │
│              │   [芯片/chips...]   │              │
│              │                    │  ⚙ 设置      │
└──────────────┴────────────────────┴──────────────┘
```

- **Tab** 选中推荐补全 / accept suggestion
- **Enter / 逗号** 直接输入原始内容 / add raw text
- **± 按钮** 调整权重 / adjust weight
- **拖拽芯片** 排序或跨输入框移动 / drag to reorder
- **拖到左栏** 将芯片保存到词库 / drag to preset column to save

## 环境要求 / Requirements

- ComfyUI（需支持 `CLIP.encode_from_tokens_scheduled` 的版本，约 2024 年中之后的版本均可；旧版可能报 `AttributeError` / Requires a ComfyUI build with `CLIP.encode_from_tokens_scheduled` — any version from ~mid-2024 onward works; older builds may raise `AttributeError`）
- 无需额外 Python 依赖 / No extra Python dependencies

## 已知限制 / Known Limitations

- **扁平提示词解析有损 / Flat prompt parsing is lossy** — 拖入别人的图（或旧版工作流），如果只有扁平 prompt 文本而没有结构化数据，面板会把文本拆成 chip，但分组结构、颜色、中英对照会丢失。自己用本插件生成的图不受影响。When loading workflows from others (or from older versions) that only have flat prompt text, the panel parses it into chips but loses group structure, colors, and CN/EN mappings. Images created by this plugin carry full structured data and are unaffected.
- **Google 翻译端点 / Google translate endpoint** — "Google" 选项走的是免费非官方端点，受 CORS 和可用性影响，浏览器直连可能失败；如需稳定翻译请用 MyMemory 或自定义 API。The "Google" option uses a free unofficial endpoint subject to CORS/availability and may fail when called directly from the browser; for stable results use MyMemory or a custom API.
- **Token 统计为近似值 / Token count is approximate** — CLIP token 数为前端粗估（英文约 1.3 token/词，中文按字计），仅供参考，不代表真实分词结果。The token count is a rough client-side estimate (≈1.3 token/word for English, per-character for Chinese) and does not reflect actual CLIP tokenization.
- **节点与面板不完全同步 / Node fields are not fully synced back** — 在面板内编辑会自动写入节点；但直接在节点文本框里手动修改不会反向同步回面板，二者可能不一致，请优先在面板内编辑。Edits made in the panel are pushed to the node automatically, but manual edits in the node's own text area are not synced back to the panel and the two may diverge — prefer editing inside the panel.

## 架构说明 / Architecture

- **每节点状态独立 / Per-node state** — 提示词（分组/输入框/chip/权重/颜色）存在节点自身，随工作流保存、随拖图自动加载，节点间互不影响。Each node carries its own structured prompt state, surviving workflow save/reload — nodes never cross-contaminate.
- **词库全局共享 / Shared word bank** — 词库和 UI 设置跨节点共享，存浏览器 `localStorage`，可通过「导出词库 / 导入」搬到其他机器。The word bank and UI settings are shared globally (stored in localStorage). Use "Export word bank" / "Import" to transfer them across machines.
- **面板绑定活动节点 / Panel binds to active node** — 面板是单例视图，点击哪个节点的编辑按钮就绑定到哪个节点；切换节点自动清空撤销栈，互不干扰。The floating panel is a singleton view; clicking a node's edit button binds the panel to that node. Switching nodes clears undo history to avoid cross-node confusion.

## 许可证 / License

[GNU General Public License v3.0](LICENSE)
