# PromptBuilder — Visual Prompt Editor for ComfyUI

A ComfyUI custom node that lets you build prompts visually by dragging, clicking, and typing — no more typing commas in tiny text areas.

![](screenshot.png)

## Features

- **Visual prompt builder** — Organize prompts in groups → input boxes → chips, drag to reorder
- **Built-in tag library** — Self-managed Chinese/English word bank with categories and search
- **Danbooru auto-complete** — 37K+ tags with Chinese translations, type to search
- **Weight adjustment** — Fine-tune each tag's weight with ±0.1 buttons
- **One-click translation** — Translate all untranslated words (MyMemory / Google / custom API)
- **Real-time token counter** — Approximate CLIP token estimation with color warnings (75/150)
- **Token highlight** — Highlight the chip at the 75-token boundary (toggleable)
- **Undo/Redo** — Full 50-step history (Ctrl+Z / Ctrl+Y)
- **Import/Export** — Backup and restore all presets and workspace as JSON
- **Dark/Light theme** — Adjustable zoom scale

## Installation

1. Copy the `comfyui-promptbuilder` folder into ComfyUI's `custom_nodes/` directory
2. Restart ComfyUI

```
ComfyUI/
└── custom_nodes/
    └── comfyui-promptbuilder/
        ├── __init__.py
        ├── nodes.py
        ├── LICENSE
        └── js/
            ├── promptbuilder.js
            └── danbooru-tags.json
```

## Usage

1. In ComfyUI, add a **PromptBuilder CLIP Encode** node (`conditioning/promptbuilder`)
2. Connect it to a CLIP model
3. Click **✏️ Edit in PromptBuilder** to open the floating panel
4. Build your prompts — they sync to the node automatically

### Interface Layout

```
┌──────────────┬────────────────────┬──────────────┐
│  Presets     │  Workspace         │  Output      │
│              │                    │              │
│  Categories  │  ▸ Group           │  Positive    │
│  & words     │   [input box]      │  [copy]      │
│              │   [chips...]       │  counts      │
│  Search      │                    │              │
│              │  ▾ Negative        │  Negative    │
│              │   [input box]      │  [copy]      │
│              │   [chips...]       │  counts      │
│              │                    │              │
│              │                    │  ⚙ Settings  │
└──────────────┴────────────────────┴──────────────┘
```

- **Tab** to accept auto-complete suggestion
- **Enter** or **,** to add raw text as chips
- **±** buttons to adjust weight
- Drag chips to reorder or move between input boxes
- Drag chips to the preset column to save words

## Requirements

- ComfyUI (any recent version)
- No additional Python dependencies

## License

This project is licensed under the GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.
