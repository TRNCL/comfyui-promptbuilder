from .nodes import PromptBuilderCLIPEncode

WEB_DIRECTORY = "./js"
NODE_CLASS_MAPPINGS = {
    "PromptBuilderCLIPEncode": PromptBuilderCLIPEncode,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBuilderCLIPEncode": "PromptBuilder CLIP Encode",
}
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
