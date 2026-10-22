# 回归测试

测试直接读取发布的 `js/promptbuilder.js`，执行实际函数和事件回调；不需要安装 ComfyUI、模型或 npm 依赖。DOM、ComfyUI 接口、网络和存储使用隔离适配器。

使用支持 `node:test` 的 Node.js（建议 Node.js 22 或更高版本），在仓库根目录分别运行：

```sh
node tests/prompt-regressions.cjs
node tests/state-regressions.cjs
node tests/ui-regressions.cjs
```

覆盖提示词权重与转义、输出预览、翻译请求编码、即时节点保存、工作流重载与撤销、词库导入校验、输入草稿、补全、中文输入法事件、拖拽排序及快捷键作用域。

这些测试不包含真实模型推理、操作系统输入法或完整 ComfyUI 前端集成。
