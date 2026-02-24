# 分析师代理系统 (@analyst) - AIOS

> **版本:** 1.0.0
> **创建于:** 2026-02-04
> **所有者:** @analyst (Atlas)
> **状态:** 官方文档

---

## 概览

本文档描述了**@分析师(Atlas)**代理的完整系统，包括所有涉及的文件、工作流、可用命令、模板和代理间的集成。

分析师代理设计用于:
- 进行市场研究和竞争分析
- 促进结构化头脑风暴会议
- 创建项目简报和深度研究提示
- 为决策提供可行的洞察
- 支持项目发现(brownfield文档)
- 生成意识执行摘要报告

---

## 代理档案

| 属性 | 值 |
|------|-----|
| **名称** | Atlas |
| **ID** | analyst |
| **职位** | 业务分析师 |
| **图标** | :mag: |
| **原型** | 解码器 |
| **星座** | 天蝎座 |
| **语气** | 分析性、好奇、创意 |
| **签名** | "-- Atlas，调查真理:mag_right:" |

### 核心原则

1. **好奇心驱动的探究** - 主动提问发现潜在真理
2. **客观和基于证据的分析** - 基于可验证数据
3. **战略语境化** - 置于更广泛的战略背景
4. **促进清晰和共同理解** - 精确表达需求
5. **创意探索和发散思维** - 广泛生成想法后收敛
6. **结构化和方法性的方法** - 系统方法确保全面性
7. **面向行动的输出** - 清晰可行的交付物
8. **协作伙伴关系** - 迭代细化合作
9. **保持广泛视角** - 市场趋势意识
10. **信息完整性** - 精确表示来源

---

## 完整文件列表

### 代理核心文件

| 文件 | 目的 |
|------|------|
| `.aios-core/development/agents/analyst.md` | 分析师代理核心定义 |
| `.claude/commands/AIOS/agents/analyst.md` | Claude Code命令激活@analyst |

### 分析师任务

| 文件 | 命令 | 目的 |
|------|------|------|
| `.aios-core/development/tasks/facilitate-brainstorming-session.md` | `*brainstorm {topic}` | 主要任务 - 促进结构化头脑风暴会议 |
| `.aios-core/development/tasks/analyst-facilitate-brainstorming.md` | `*brainstorm {topic}` | 头脑风暴任务的交互变体 |
| `.aios-core/development/tasks/create-deep-research-prompt.md` | `*research-prompt {topic}` | 为调查生成深度研究提示 |
| `.aios-core/development/tasks/advanced-elicitation.md` | `*elicit` | 高级需求提取会话 |
| `.aios-core/development/tasks/create-doc.md` | `*doc-out` | 从YAML模板创建文档 |
| `.aios-core/development/tasks/document-project.md` | `*create-project-brief` | 现有项目文档 |
| `.aios-core/development/tasks/calculate-roi.md` | (相关) | ROI和成本节省计算 |

### 相关分析任务

| 文件 | 目的 |
|------|------|
| `.aios-core/development/tasks/analyze-brownfield.md` | Brownfield项目分析 |
| `.aios-core/development/tasks/analyze-framework.md` | 现有框架分析 |
| `.aios-core/development/tasks/analyze-performance.md` | 性能分析 |
| `.aios-core/development/tasks/analyze-project-structure.md` | 项目结构分析 |
| `.aios-core/development/tasks/analyze-cross-artifact.md` | 跨工件分析 |

### 分析师模板

| 文件 | 目的 |
|------|------|
| `.aios-core/product/templates/project-brief-tmpl.yaml` | 项目简报模板 |
| `.aios-core/product/templates/market-research-tmpl.yaml` | 市场研究模板 |
| `.aios-core/product/templates/competitor-analysis-tmpl.yaml` | 竞争分析模板 |
| `.aios-core/product/templates/brainstorming-output-tmpl.yaml` | 头脑风暴输出模板 |

### 数据文件

| 文件 | 目的 |
|------|------|
| `.aios-core/development/data/aios-kb.md` | AIOS知识库 |
| `.aios-core/development/data/brainstorming-techniques.md` | 可用头脑风暴技术 |

### 使用分析师的工作流

| 文件 | 阶段 | 目的 |
|------|------|------|
| `.aios-core/development/workflows/greenfield-fullstack.yaml` | 第1阶段 | 发现与规划 - 创建project-brief.md |
| `.aios-core/development/workflows/brownfield-discovery.yaml` | 第9阶段 | 意识执行摘要报告 |

---

## 命令到任务的映射

### 研究和分析命令

| 命令 | 任务文件 | 操作 |
|------|---------|------|
| `*perform-market-research` | `create-doc.md`+模板 | 创建市场研究报告 |
| `*create-competitor-analysis` | `create-doc.md`+模板 | 创建详细竞争分析 |
| `*research-prompt {topic}` | `create-deep-research-prompt.md` | 生成深度研究提示 |

### 构思和发现命令

| 命令 | 任务文件 | 操作 |
|------|---------|------|
| `*brainstorm {topic}` | `facilitate-brainstorming-session.md` | 促进结构化头脑风暴 |
| `*create-project-brief` | `document-project.md` | 创建项目简报 |
| `*elicit` | `advanced-elicitation.md` | 高级提取会话 |

### 实用命令

| 命令 | 操作 |
|------|------|
| `*help` | 显示所有可用命令 |
| `*doc-out` | 完整文档输出 |
| `*session-info` | 显示当前会话详情 |
| `*guide` | 代理使用指南 |
| `*yolo` | 切换跳过确认 |
| `*exit` | 退出analyst模式 |

---

## 工具和集成

### 可用工具

| 工具 | 目的 |
|------|------|
| **exa** | 市场和技术的高级网络搜索 |
| **context7** | 库文档查找 |
| **google-workspace** | 研究文档(Drive、Docs、Sheets) |
| **clickup** | 想法捕获和组织 |

### 与其他代理的集成

| 代理 | 协作类型 |
|------|---------|
| **@pm (Morgan)** | 分析师为PRD创建提供研究和分析 |
| **@po (Pax)** | 分析师提供市场洞察和竞争分析 |
| **@architect** | 分析师可提供技术研究 |
| **@ux-design-expert** | 分析师为UX决策提供用户研究 |

---

## 执行模式

### 1. YOLO模式 - 快速和自主(0-1提示)
- 自主决策(含日志)
- 用户交互最少
- **最适合:** 简单的确定性任务

### 2. 交互模式 - 平衡和教育性(5-10提示)[默认]
- 显式决策检查点
- 教育解释
- **最适合:** 学习、复杂决策

### 3. 飞行前规划 - 综合规划
- 任务分析阶段(识别歧义)
- 零歧义执行
- **最适合:** 模糊需求、关键工作

---

## 最佳实践

### 市场研究

1. **定义清晰目标** - 知道研究会通知什么决策
2. **使用多个来源** - 结合一次和二次来源
3. **量化时可能** - TAM/SAM/SOM及清晰计算
4. **识别假设** - 记录局限和前提
5. **关注可行洞察** - 不只是数据，还有建议

### 竞争分析

1. **优先竞争对手** - 使用优先矩阵(市场份额vs威胁)
2. **优先级1-2深度分析** - 详细档案
3. **持续监控** - 建立更新节奏
4. **识别蓝海** - 寻找未争议的市场空间
5. **记录来源** - 用于验证和未来更新

### 头脑风暴会议

1. **做促进者，不是生成者** - 引导用户生成自己的想法
2. **一次一个技术** - 不混合多个技术
3. **数量优先于质量** - 目标: 60分钟内100个想法
4. **延迟判断** - 先生成，后评估
5. **记录一切** - 捕获甚至"疯狂"的想法
6. **管理能量** - 监控参与并提供休息

### 高级提取

1. **语境优先于方法** - 方法选择前分析内容
2. **使用1-9格式** - 总是呈现编号选项
3. **提供详细理由** - 解释权衡和决策
4. **等待回应** - 不在无用户输入时进行
5. **简明扼要** - 关注可行洞察

---

## 故障排除

### 头脑风暴会议停滞

**症状:** 用户停止生成想法，回应简短

**解决方案:**
1. 检查能量水平: "你对这个方向感觉如何?"
2. 提供技术交换: "想尝试不同方法?"
3. 使用更具体的提示
4. 休息后恢复

### 缺乏足够数据的研究

**症状:** EXA返回少量结果，小众市场

**解决方案:**
1. 扩展搜索范围(相关术语)
2. 使用相邻市场类比
3. 结合一次研究(采访)
4. 清晰记录差距和不确定性

### 项目简报不完整

**症状:** 模糊部分，缺乏特异性

**解决方案:**
1. 使用高级提取深入
2. 请求具体例子
3. 用场景质疑假设
4. 如必要多次迭代会话

---

## 参考

### 主要任务

- [Task: facilitate-brainstorming-session.md](.aios-core/development/tasks/facilitate-brainstorming-session.md)
- [Task: create-deep-research-prompt.md](.aios-core/development/tasks/create-deep-research-prompt.md)
- [Task: advanced-elicitation.md](.aios-core/development/tasks/advanced-elicitation.md)
- [Task: create-doc.md](.aios-core/development/tasks/create-doc.md)
- [Task: document-project.md](.aios-core/development/tasks/document-project.md)

### 模板

- [Template: project-brief-tmpl.yaml](.aios-core/product/templates/project-brief-tmpl.yaml)
- [Template: market-research-tmpl.yaml](.aios-core/product/templates/market-research-tmpl.yaml)
- [Template: competitor-analysis-tmpl.yaml](.aios-core/product/templates/competitor-analysis-tmpl.yaml)
- [Template: brainstorming-output-tmpl.yaml](.aios-core/product/templates/brainstorming-output-tmpl.yaml)

### 工作流

- [Workflow: greenfield-fullstack.yaml](.aios-core/development/workflows/greenfield-fullstack.yaml)
- [Workflow: brownfield-discovery.yaml](.aios-core/development/workflows/brownfield-discovery.yaml)

### 代理

- [Agent: analyst.md](.aios-core/development/agents/analyst.md)

---

## 总结

| 方面 | 详情 |
|------|------|
| **总核心任务** | 6个任务文件 |
| **总模板** | 4个YAML模板 |
| **研究命令** | 3个(`*perform-market-research`、`*create-competitor-analysis`、`*research-prompt`) |
| **构思命令** | 3个(`*brainstorm`、`*create-project-brief`、`*elicit`) |
| **使用的工作流** | 2(greenfield-fullstack、brownfield-discovery) |
| **消费代理** | @pm、@po、@architect、@ux-design-expert |
| **集成工具** | exa、context7、google-workspace、clickup |
| **执行模式** | 3(YOLO、交互、飞行前) |

---

*-- Atlas，调查真理:mag_right:*
