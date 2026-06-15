# PromptBuilder — ComfyUI 可视化提示词编辑器

一个 ComfyUI 插件，让你用拖拽、点击、打字的方式搭建提示词，告别在小文本框里手敲逗号。

## 功能特性

- **可视化搭建** — 分组 → 输入框 → 词语芯片，三级结构，拖拽排序
- **自定义词库** — 中英文词语仓库，支持分类、搜索，搭提示词像拼积木
- **Danbooru 自动补全** — 内置 3.7 万标签 + 中文翻译，输入即搜
- **权重微调** — ±0.1 按钮精确控制每个词的权重
- **一键翻译** — 批量翻译未翻译的词（MyMemory / Google / 自定义 API）
- **Token 实时统计** — CLIP token 近似估算，超 75 标黄、超 150 标红
- **Token 高亮定位** — 开关开启后高亮第 75 token 对应的词，方便控制长度
- **撤销/重做** — 50 步历史（Ctrl+Z / Ctrl+Y）
- **导入/导出** — JSON 格式备份全部数据
- **暗色/亮色主题** — 可调缩放比例

## 安装

把 `comfyui-promptbuilder` 文件夹放到 ComfyUI 的 `custom_nodes/` 目录下，重启 ComfyUI。

```
ComfyUI/
└── custom_nodes/
    └── comfyui-promptbuilder/
        ├── __init__.py
        ├── nodes.py
        ├── LICENSE
        ├── README.md
        ├── README_CN.md
        └── js/
            ├── promptbuilder.js
            └── danbooru-tags.json
```

## 使用

1. 在节点菜单中找到 `conditioning/promptbuilder`，添加 **PromptBuilder CLIP Encode** 节点
2. 连接 CLIP 模型
3. 点击节点上的 **✏️ 在 PromptBuilder 中编辑** 打开浮动面板
4. 搭建提示词 — 输出自动同步到节点

### 面板布局

```
┌──────────────┬────────────────────┬──────────────┐
│  预设词库     │  工作区             │  输出         │
│              │                    │              │
│  分类 & 词语  │  ▸ 分组             │  Positive    │
│              │   [输入框]          │  [复制]      │
│  搜索        │   [芯片...]         │  字数统计     │
│              │                    │              │
│              │  ▾ 负面提示词        │  Negative    │
│              │   [输入框]          │  [复制]      │
│              │   [芯片...]         │  字数统计     │
│              │                    │              │
│              │                    │  ⚙ 设置      │
└──────────────┴────────────────────┴──────────────┘
```

- **Tab** 选中推荐补全
- **Enter / 逗号** 直接输入原始内容
- **± 按钮** 调整权重
- **拖拽芯片** 排序或跨输入框移动
- **拖到左栏** 将芯片保存到词库

## 环境要求

- ComfyUI（任意较新版本）
- 无需额外 Python 依赖

## 许可证

GNU General Public License v3.0 — 详见 [LICENSE](LICENSE)
