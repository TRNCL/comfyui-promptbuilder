# PromptBuilder

ComfyUI 自定义节点：用可视化面板搭建 SD / 类 SD 提示词。

提示词拆成可拖拽的 **chip**，支持分组、权重、词库复用与中英编辑；输出实时拼成标准提示词字符串。

\---

## 软件特点

* **Chip 工作区**：词/短语可排序、加权、禁用、多选批量处理；分组与负面分区
* **二级词库**：L1/L2 分类，与工作区互拖；支持排序与跨类移动
* **补全与粘贴**：词库 + Danbooru 标签补全；可识别 `(tag:1.2)` 等权重写法
* **可撤销、可备份**：撤销/重做；词库存 localStorage，可导出导入 JSON

\---

## 导入预设词库

首次使用可导入一份现成词库，避免从零建分类。

### 文件从哪来

* 发布包 / 仓库中的示例：`presets/promptbuilder\_presets.json`
* 你自己或他人用 PromptBuilder **导出** 的 JSON

### 怎么导入

1. 打开 PromptBuilder 面板
2. 点底栏 **导入词库**
3. 选择上述 JSON 文件
4. 导入成功后，左侧词库出现 L1/L2 分类与词条，可直接点选或拖入工作区

### 注意

* 导入会 **替换当前浏览器里的词库**（不是与旧词库合并）。重要数据请先 **导出词库** 备份
* 词库保存在浏览器 **localStorage**，与具体工作流文件无强制绑定；换浏览器/清站点数据会丢，需重新导入
* **导出词库** 可随时备份或分享给别人再导入

\---

## 基本操作

### 工作区

|操作|方法|
|-|-|
|添加 chip|输入后 **Enter** 或 **逗号**；可一次粘贴多词|
|从词库添加|点击词条，或拖到工作区|
|排序 / 移动|拖拽 chip|
|多选|**Ctrl/⌘** 多选；**Shift** 范围选；**Ctrl+A** 全选当前框|
|权重|悬停 → 工具栏数字；滚轮 ±0.1 或点击输入（多选不显示权重）|
|编辑中英文|双击或 ✏️|
|禁用 / 翻译 / 删除|👁 / 🌐 / × 或 **Delete**|

### 词库

|操作|方法|
|-|-|
|切换分类|点击 L1 / L2|
|分类排序|同级拖拽|
|L2 换到别的 L1|拖 L2，悬停目标 L1，在 **L2 行内**松手|
|编辑 / 删除分类|悬停分类 → ✏️ / 🗑|
|加入词库|工作区 chip 拖入词库列表|
|导入 / 导出|底栏「导入词库」「导出词库」|

### 补全

* **↑ / ↓** 选择，**Tab** 确认推荐
* **Enter** 提交原文，不采纳补全

### 面板

|操作|方法|
|-|-|
|打开|节点 **Edit in PromptBuilder**|
|收起 / 展开|**−** 或 **Ctrl+Shift+X**|
|撤销 / 重做|底栏，或 **Ctrl+Z** / **Ctrl+Y**|
|生成|**▶ 生成**|

权重范围 **0.1～5**，步进 **0.1**；≠1 时输出 `(词:1.2)`。

\---

## 快捷键

|快捷键|作用|
|-|-|
|`Ctrl+Shift+X`|收起 / 展开面板|
|`Ctrl+Z` / `Ctrl+Y`|撤销 / 重做|
|`Ctrl+A`|全选当前框 chip|
|`Delete`|删除选中 chip|
|`Tab` / `Enter`|确认补全 / 提交原文|

\---

## 数据与注意

* 词库与设置在 **localStorage**；节点提示词随工作流保存
* 再点「Edit in PromptBuilder」会重载节点并清空本次撤销栈；仅收起面板不会
* 节点上正/负文本框由面板托管，请在 PromptBuilder 内编辑

\---

## 致谢

* Danbooru 中英标签表：[ffdkj/ffdkj-Danbooru\_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table)
* 部分预设词库参考：[physton/sd-webui-prompt-all-in-one](https://github.com/physton/sd-webui-prompt-all-in-one)

