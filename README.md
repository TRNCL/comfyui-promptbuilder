# PromptBuilder — ComfyUI 可视化提示词编辑器<br><sub>Visual Prompt Editor for ComfyUI</sub>

一个 ComfyUI 插件，让你用拖拽、点击、打字的方式搭建提示词，告别在小文本框里手敲逗号。

A ComfyUI custom node that lets you build prompts visually by dragging, clicking, and typing — no more typing commas in tiny text areas.

## 功能特性 / Features

- **可视化搭建 / Visual builder** — 分组 → 输入框 → 词语芯片，三级结构，拖拽排序
- **自定义词库 / Word bank** — 中英文词语仓库，支持分类、搜索，搭提示词像拼积木
- **Danbooru 自动补全 / Danbooru auto-complete** — 内置 3.7 万标签 + 中文翻译，输入即搜（37K+ tags with CN translations）
- **权重微调 / Weight adjustment** — ±0.1 按钮精确控制每个词的权重
- **一键翻译 / One-click translation** — 批量翻译未翻译的词（MyMemory / Google / 自定义 API）
- **Token 实时统计 / Token counter** — CLIP token 近似估算，超 75 标黄、超 150 标红
- **Token 高亮定位 / Token highlight** — 可开关：高亮第 75 个 token 对应的词，方便控制提示词长度
- **撤销/重做 / Undo/Redo** — 50 步历史（Ctrl+Z / Ctrl+Y）
- **导入/导出 / Import/Export** — JSON 格式备份全部数据
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

---

> 1. Find **PromptBuilder CLIP Encode** under `conditioning/promptbuilder` in the node menu
> 2. Connect to a CLIP model
> 3. Click **✏️ 在 PromptBuilder 中编辑** to open the floating panel
> 4. Build prompts — they sync to the node automatically

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

- ComfyUI（任意较新版本 / any recent version）
- 无需额外 Python 依赖 / No extra dependencies

## 许可证 / License

[GNU General Public License v3.0](LICENSE)
