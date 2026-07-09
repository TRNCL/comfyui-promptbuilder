"""PromptBuilder node classes."""


class PromptBuilderCLIPEncode:
    """CLIP text encode node — standard version with tokenization + encoding."""

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "clip": ("CLIP",),
                "positive": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Positive prompt (managed by PromptBuilder)",
                }),
                "negative": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Negative prompt (managed by PromptBuilder)",
                }),
            }
        }

    RETURN_TYPES = ("CONDITIONING", "CONDITIONING")
    RETURN_NAMES = ("positive", "negative")
    FUNCTION = "encode"
    # 主目录下独立分类（不再挂在 conditioning 下）
    CATEGORY = "PromptBuilder"

    def encode(self, clip, positive, negative):
        pos_tokens = clip.tokenize(positive)
        neg_tokens = clip.tokenize(negative)
        pos_cond = clip.encode_from_tokens_scheduled(pos_tokens)
        neg_cond = clip.encode_from_tokens_scheduled(neg_tokens)
        return (pos_cond, neg_cond)


class PromptBuilderText:
    """Text passthrough node — raw prompt text without CLIP encoding."""

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "positive": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Positive prompt (managed by PromptBuilder)",
                }),
                "negative": ("STRING", {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Negative prompt (managed by PromptBuilder)",
                }),
            }
        }

    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("positive", "negative")
    FUNCTION = "passthrough"
    CATEGORY = "PromptBuilder"

    def passthrough(self, positive, negative):
        return (positive, negative)
