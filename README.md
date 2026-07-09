# PromptBuilder

ComfyUI 自定义节点：可视化 SD 提示词面板。

## 安装

1. 将本文件夹 `PromptBuilder` 复制到 ComfyUI 的 `custom\_nodes/` 目录下  
（路径示例：`ComfyUI/custom\_nodes/PromptBuilder/`）
2. 重启 ComfyUI
3. 在节点菜单 **PromptBuilder** 分类中添加：

   * **PromptBuilder CLIP Encode**
   * **PromptBuilder Text**
4. 点击节点上的 **Edit in PromptBuilder** 打开面板

## 目录说明

|路径|说明|
|-|-|
|`\_\_init\_\_.py` / `nodes.py`|节点注册与实现|
|`js/promptbuilder.js`|前端面板|
|`js/tags\_sqlite\_\*.json`|Danbooru 中英标签补全库，来自https://github.com/ffdkj/ffdkj-Danbooru\_Tag-Chinese-English-Translation-Table|
|`presets/promptbuilder\_presets.json`|可选导入预设词库，来自https://github.com/physton/sd-webui-prompt-all-in-one|

## 使用提示

* 底栏：撤销 / 重做 / 导出词库 / 导入词库
* 快捷键：`Ctrl+Shift+X` 收起/展开面板；`Ctrl+Z` / `Ctrl+Y` 撤销重做
* 词库与工作区状态保存在浏览器 localStorage 与节点属性中

