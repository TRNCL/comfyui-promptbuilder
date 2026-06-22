from .nodes import PromptBuilderCLIPEncode, PromptBuilderText

WEB_DIRECTORY = "./js"
NODE_CLASS_MAPPINGS = {
    "PromptBuilderCLIPEncode": PromptBuilderCLIPEncode,
    "PromptBuilderText": PromptBuilderText,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBuilderCLIPEncode": "PromptBuilder CLIP Encode",
    "PromptBuilderText": "PromptBuilder Text",
}
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
