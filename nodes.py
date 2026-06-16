class PromptBuilderCLIPEncode:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {
            "clip": ("CLIP",),
            "positive": ("STRING", {"multiline": True, "default": ""}),
            "negative": ("STRING", {"multiline": True, "default": ""}),
        }}
    RETURN_TYPES = ("CONDITIONING", "CONDITIONING")
    RETURN_NAMES = ("positive", "negative")
    FUNCTION = "encode"
    CATEGORY = "conditioning/promptbuilder"

    def encode(self, clip, positive, negative):
        return (
            clip.encode_from_tokens_scheduled(clip.tokenize(positive)),
            clip.encode_from_tokens_scheduled(clip.tokenize(negative)),
        )
