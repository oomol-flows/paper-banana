# PaperBanana

基于 [PaperBanana](https://github.com/dwzhu-pku/PaperBanana) 的 `dev_planner`
(即 `Retrieve → Plan → Visualize`) 实现。

生成的图片可能未达预期。你可以稍后使用 "edit" 区块对图片进行调整。

## Credits

The [dataset](https://huggingface.co/datasets/dwzhu/PaperBananaBench) and
prompts are from the original PaperBanana repo.

## 项目概述

PaperBanana 为 AI 科学家自动化生成学术插图。通过结合检索、规划和可视化的智能流程，将研究内容转换为可发表的图表。

## 模块功能

- **Retriever（检索器）**: 搜索精选图表集合，找到视觉相似的参考图以指导插图生成
- **Planner（规划器）**: 使用参考图的上下文学习，将研究内容转换为详细的视觉提示
- **Visualizer（可视化器）**: 使用最先进的图像生成模型，从文本提示生成科学插图
- **Editor（编辑器）**: 基于文本指令，使用 AI 编辑能力修改现有图像
- **Generate（生成子流程）**: 端到端学术插图流程，结合检索、规划和可视化模块

## 模块组合建议

1. **完整流程**: 使用 Generate 子流程，从研究内容自动生成端到端插图
2. **手动流程**: 串联 Retriever → Planner → Visualizer，逐步控制每个环节
3. **迭代优化**: Generate → Editor，对需要调整的输出进行微调
4. **参考引导**: 使用 Retriever 输出指导 Planner，保持一致的视觉风格

## 基本使用

1. 提供描述机制、过程或发现的研究内容
2. 可选添加标题以提供额外上下文
3. 运行 Generate 子流程或按顺序运行各个模块
4. 根据需要审查和编辑生成的插图

## 示例

**示例 1: 机制图**
- 输入: "甲状腺髓样癌机制研究，显示 PGC-1α 表达、PROS1 乙酰化以及肿瘤-巨噬细胞通过 PROS1/MERTK 相互作用"
- 输出: 可发表的机制图，展示正常细胞与癌细胞对比

**示例 2: 流程图**
- 输入: "单细胞测序工作流程，从样本采集到聚类分析再到通路富集"
- 输出: 展示每个分析步骤的可视化流程图

**示例 3: 图像编辑**
- 输入: 生成的图像 URL + 提示"添加关键细胞组分的标签"
- 输出: 带有注释标签的更新图表

## License

MIT.
