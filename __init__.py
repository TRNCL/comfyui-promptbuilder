"""PromptBuilder — ComfyUI custom node for visual SD prompt construction."""

from .nodes import PromptBuilderCLIPEncode, PromptBuilderText

WEB_DIRECTORY = "./js"

# 每种功能只注册一次，避免菜单里出现重复节点
NODE_CLASS_MAPPINGS = {
    "PromptBuilderCLIPEncode": PromptBuilderCLIPEncode,
    "PromptBuilderText": PromptBuilderText,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBuilderCLIPEncode": "PromptBuilder CLIP Encode",
    "PromptBuilderText": "PromptBuilder Text",
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
