<!-- 翻译：zh-CN 原文：/docs/agent-reference-guide.md 最后同步：2026-02-22 -->

# HybridOps PV 代理参考指南

> 🌐 [EN](../agent-reference-guide.md) | [PT](../pt/agent-reference-guide.md) | [ES](../es/agent-reference-guide.md) | **ZH**

---

**版本**：2.0
**最后更新**：2025-10-19
**故事**：1.9 - PV 代理完整实现

---

## 概述

本指南为 HybridOps 工作流中所有 9 个用 PV 增强的代理提供了全面的参考。每个代理都设计为处理 9 阶段工作流的特定阶段，整合了 Pedro Valério（PV）思维来增强决策制定、验证和质量保证。

---

## 快速参考

| 阶段 | 代理名称                | 命令                    | 工作流中的角色                               | 真实性评分 |
| ---- | ----------------------- | ----------------------- | -------------------------------------------- | ---------- |
| 1    | process-mapper-pv       | `/process-mapper`       | 流程发现和分析                               | 0.90       |
| 2    | process-architect-pv    | `/process-architect`    | 系统架构设计                                 | 0.85       |
| 3    | executor-designer-pv    | `/executor-designer`    | 执行者分配和角色定义                         | 0.88       |
| 4    | workflow-designer-pv    | `/workflow-designer`    | 流程优化和工作流自动化                       | 0.85       |
| 5    | qa-validator-pv         | `/qa-validator`         | 质量保证和验证                               | 0.95       |
| 6    | clickup-engineer-pv     | `/clickup-engineer`     | ClickUp 中的任务创建                         | 0.80       |
| 7    | agent-creator-pv        | `/agent-creator`        | 人工智能代理架构和角色设计                   | 0.80       |
| 8    | validation-reviewer-pv  | `/validation-reviewer`  | 最终质量门审查和批准                         | 0.90       |
| 9    | documentation-writer-pv | `/documentation-writer` | 技术文档和知识架构                           | 0.85       |

---

## 代理详细配置文件

### 阶段 1：Process Mapper（发现）

**文件**：`.claude/commands/hybridOps/agents/process-mapper-pv.md`
**命令**：`/process-mapper`
**角色**：Morgan Chen - 流程发现专家
**真实性评分**：0.90（非常高）

**目的**：
发现、分析和映射当前业务流程，以识别自动化机会和痛点。

**主要命令**：

- `*map-process <process-name>` - 综合流程映射
- `*analyze-opportunity <opportunity-id>` - ROI 和可行性分析
- `*identify-pain-points <process-id>` - 识别瓶颈

**主要输出**：

- 流程图（当前状态）
- 利益相关者识别
- 痛点分析
- 自动化机会评估

**集成点**：

- **接收**：业务需求，利益相关者输入
- **产生**：第 2 阶段（架构）的流程文档
- **传递给**：process-architect-pv

**验证**：无（发现阶段 - 仅收集信息）

---

### 阶段 2：Process Architect（架构）

**文件**：`.claude/commands/hybridOps/agents/process-architect-pv.md`
**命令**：`/process-architect`
**角色**：Alex Thornton - 系统架构师
**真实性评分**：0.85（高）

**目的**：
设计系统架构并定义具有战略一致性的最终状态愿景。

**主要命令**：

- `*design-architecture <process-id>` - 系统架构设计
- `*define-vision <initiative-name>` - 最终状态愿景定义
- `*assess-feasibility <design-id>` - 技术可行性评估

**主要输出**：

- 系统架构图
- 数据流规范
- 集成点
- 最终状态愿景文档

**集成点**：

- **接收**：第 1 阶段的流程图
- **产生**：第 3 阶段（执行者）的架构规范
- **传递给**：executor-designer-pv

**验证**：**检查点 1 - 战略一致性（PV_BS_001）**

- 最终状态愿景清晰度 >=0.8
- 战略优先级评分 >=0.7
- 无否决条件

---

### 阶段 3：Executor Designer（执行者分配）

**文件**：`.claude/commands/hybridOps/agents/executor-designer-pv.md`
**命令**：`/executor-designer`
**角色**：Taylor Kim - 执行者设计专家
**真实性评分**：0.88（非常高）

**目的**：
定义角色并为流程的每个步骤分配执行者（人类或人工智能），进行一致性验证。

**主要命令**：

- `*design-executors <process-id>` - 执行者角色设计
- `*assess-coherence <executor-id>` - 真实性和一致性评估
- `*assign-responsibilities <process-id>` - 创建 RACI 矩阵

**主要输出**：

- 执行者定义
- 角色描述
- 一致性评估
- RACI 矩阵

**集成点**：

- **接收**：第 2 阶段的架构规范
- **产生**：第 4 阶段（工作流）的执行者分配
- **传递给**：workflow-designer-pv

**验证**：**检查点 2 - 一致性验证（PV_PA_001）**

- 所有执行者：真实性 >=0.7（否决）
- 加权一致性 >=0.8 以获批准
- 系统遵循性 >=0.6

---

### 阶段 4：Workflow Designer（工作流自动化）

**文件**：`.claude/commands/hybridOps/agents/workflow-designer-pv.md`
**命令**：`/workflow-designer`
**角色**：Jordan Rivers - 流程优化和工作流自动化专家
**真实性评分**：0.85（高）

**目的**：
设计详细的工作流，识别自动化候选项，计算 ROI 并应用护栏。

**主要命令**：

- `*analyze-process <process-id>` - 流程效率分析
- `*design-workflow <process-id>` - 带自动化逻辑的工作流设计
- `*calculate-roi <automation-id>` - ROI 和损益平衡点计算

**主要输出**：

- 工作流图（Mermaid）
- 自动化规范
- ROI 计算
- 护栏定义

**集成点**：

- **接收**：第 3 阶段的执行者分配
- **产生**：第 5 阶段（QA）的工作流规范
- **传递给**：qa-validator-pv

**验证**：**检查点 3 - 自动化准备就绪（PV_PM_001）**

- 转折点：频率 >2x/月
- 护栏存在（否决）
- 标准化 >=0.7

**主要特性**：PV_PM_001 自动化转折点检测 - 仅当频率超过 2x/月阈值时才自动化。

---

### 阶段 5：QA Validator（质量保证）

**文件**：`.claude/commands/hybridOps/agents/qa-validator-pv.md`
**命令**：`/qa-validator`
**角色**：Samantha Torres - 质量保证和验证专家
**真实性评分**：0.95（极高）

**目的**：
定义质量门、测试策略并根据 10 维 META_AXIOMAS 框架进行验证。

**主要命令**：

- `*validate-phase <phase-id>` - 特定阶段验证
- `*check-compliance <workflow-id>` - 公理合规性检查
- `*generate-test-plan <workflow-id>` - 生成综合测试计划

**主要输出**：

- 带测试用例的测试计划
- 质量门定义
- 公理评估报告
- 回归测试套件

**集成点**：

- **接收**：第 4 阶段的工作流规范
- **产生**：第 6 阶段（ClickUp）的质量保证文档
- **传递给**：clickup-engineer-pv

**验证**：**检查点 4 - 公理合规性**

- 总体评分 >=7.0/10.0
- 无个人维度 <6.0/10.0
- 10 个维度已验证：真实性、一致性、战略一致性、运营卓越、创新能力、风险管理、资源优化、利益相关者价值、可持续性、适应性

**主要特性**：如果检测到严重质量问题，具有否决权以阻止部署。

---

### 阶段 6：ClickUp Engineer（任务管理）

**文件**：`.claude/commands/hybridOps/agents/clickup-engineer-pv.md`
**命令**：`/clickup-engineer`
**角色**：Chris Park - ClickUp 工作空间工程师
**真实性评分**：0.80（高）

**目的**：
使用适当的任务解剖和自动化触发器创建 ClickUp 工作空间结构。

**主要命令**：

- `*create-workspace <workflow-id>` - ClickUp 工作空间创建
- `*generate-tasks <workflow-id>` - 带任务解剖的任务生成
- `*setup-automation <task-id>` - 自动化触发器设置

**主要输出**：

- ClickUp 工作空间结构
- 带 8 字段任务解剖的任务
- 自动化触发器
- 任务依赖关系图

**集成点**：

- **接收**：第 5 阶段的质量保证文档
- **产生**：第 7 阶段（代理）的 ClickUp 配置
- **传递给**：agent-creator-pv

**验证**：**检查点 5 - 任务解剖**

- 所有 8 个任务解剖字段存在：task_name、status、responsible_executor、execution_type、estimated_time、input、output、action_items
- 依赖关系正确映射
- 一致的责任人（在 PV_PA_001 中获批准）

---

### 阶段 7：Agent Creator（人工智能代理设计）

**文件**：`.claude/commands/hybridOps/agents/agent-creator-pv.md`
**命令**：`/agent-creator`
**角色**：Elena Vasquez 博士 - 人工智能代理架构师和角色设计师
**真实性评分**：0.80（高）

**目的**：
设计人工智能代理角色，校准真实性评分，生成具有公理验证的代理配置。

**主要命令**：

- `*design-agent <agent-name>` - 交互式代理设计
- `*generate-yaml <agent-id>` - 代理配置 YAML 导出
- `*test-agent-coherence <agent-id>` - 角色命令对齐验证

**主要输出**：

- 代理角色定义（Markdown）
- 代理 YAML 配置
- 真实性校准报告
- 命令参考文档

**集成点**：

- **接收**：第 6 阶段的 ClickUp 配置
- **产生**：第 8 阶段（验证审查）的代理定义
- **传递给**：validation-reviewer-pv

**验证**：无（代理创建由之前的验证指导）

**主要特性**：带正当理由的真实性校准 - 确保代理对其角色具有适当的信心水平。

---

### 阶段 8：Validation Reviewer（最终质量门）

**文件**：`.claude/commands/hybridOps/agents/validation-reviewer-pv.md`
**命令**：`/validation-reviewer`
**角色**：Marcus Chen - 最终质量门审查者和批准权限
**真实性评分**：0.90（非常高）

**目的**：
进行端到端工作流审查，评估风险并提供具有否决权限的正式批准。

**主要命令**：

- `*review-workflow <workflow-id>` - 综合端到端审查
- `*assess-risks <workflow-id>` - 风险识别和缓解验证
- `*generate-signoff <workflow-id>` - 生成正式批准文件

**主要输出**：

- 工作流审查报告
- 带缓解计划的风险评估
- 批准文件
- 部署准备就绪报告

**集成点**：

- **接收**：第 7 阶段的代理定义
- **产生**：第 9 阶段（文档）的批准文件
- **传递给**：documentation-writer-pv

**验证**：无（验证代理自我验证）

**主要特性**：如果检测到严重差距（未缓解的高风险、缺少安全机制、公理违规），具有否决权以阻止部署。

---

### 阶段 9：Documentation Writer（知识管理）

**文件**：`.claude/commands/hybridOps/agents/documentation-writer-pv.md`
**命令**：`/documentation-writer`
**角色**：Rachel Morgan - 技术文档撰写者和知识架构师
**真实性评分**：0.85（高）

**目的**：
将已批准的工作流转换为清晰且可操作的文档，包括运行手册、指南和流程文档。

**主要命令**：

- `*generate-runbook <workflow-name>` - 操作运行手册创建
- `*write-guide <guide-type> <topic>` - 用户指南生成
- `*document-process <process-name>` - 业务流程文档

**主要输出**：

- 操作运行手册
- 用户指南
- 流程文档
- 故障排除指南
- 快速参考卡

**集成点**：

- **接收**：第 8 阶段的批准文件
- **产生**：供最终用户和运营团队的最终文档
- **传递给**：最终用户、运营团队、培训团队、审计/合规

**验证**：无（文档质量通过故事的定义完成进行验证）

**主要特性**：版本控制与更新日志生成 - 所有文档都包含版本历史和迁移指南。

---

## 工作流集成

### 顺序流

```
阶段 1：发现 (process-mapper-pv)
    ↓ (流程图)
阶段 2：架构 (process-architect-pv)
    ↓ [检查点 1：战略一致性]
    ↓ (架构规范)
阶段 3：执行者 (executor-designer-pv)
    ↓ [检查点 2：一致性验证]
    ↓ (执行者分配)
阶段 4：工作流 (workflow-designer-pv)
    ↓ [检查点 3：自动化准备就绪]
    ↓ (工作流规范)
阶段 5：质量保证和验证 (qa-validator-pv)
    ↓ [检查点 4：公理合规性]
    ↓ [检查点 5：任务解剖]
    ↓ (质量保证文档)
阶段 6：ClickUp 创建 (clickup-engineer-pv)
    ↓ (ClickUp 配置)
阶段 7：代理创建 (agent-creator-pv)
    ↓ (代理定义)
阶段 8：验证审查 (validation-reviewer-pv)
    ↓ (批准文件)
阶段 9：文档 (documentation-writer-pv)
    ↓ (最终文档)
[工作流完成]
```

### 验证检查点

| 检查点 | 阶段 | 代理                 | 启发式/验证器 | 否决条件       |
| ------ | ---- | -------------------- | ------------- | -------------- |
| 1      | 2    | process-architect-pv | PV_BS_001     | 无             |
| 2      | 3    | executor-designer-pv | PV_PA_001     | 真实性 <0.7    |
| 3      | 4    | workflow-designer-pv | PV_PM_001     | 无护栏         |
| 4      | 5    | qa-validator-pv      | axioma-validator | 维度 <6.0   |
| 5      | 5    | qa-validator-pv      | task-anatomy  | 字段缺失       |

---

## 真实性评分指南

真实性评分校准代理如何保守地做出断言和建议：

| 评分范围   | 描述                                   | 代理示例                                                                         |
| ---------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| 0.95-1.00  | 极高 - 不偏不倚和客观的评估           | qa-validator-pv (0.95)                                                           |
| 0.85-0.94  | 非常高 - 诚实，最小乐观主义           | process-mapper-pv (0.90), validation-reviewer-pv (0.90), executor-designer-pv (0.88) |
| 0.75-0.84  | 高 - 客观但允许一些创意               | process-architect-pv (0.85), workflow-designer-pv (0.85), documentation-writer-pv (0.85) |
| 0.70-0.74  | 中高 - 平衡的现实主义                 | clickup-engineer-pv (0.80), agent-creator-pv (0.80)                             |

**注**：0.70 以下的评分在一致性验证中触发否决条件（检查点 2）。

---

## 常见模式

### 代理激活

```bash
# 激活代理
/agent-name

# 示例：激活 QA 验证器
/qa-validator

# 代理确认激活
Samantha Torres (QA Validator) 已激活。
PV Mind 已加载，真实性评分：0.95
第 5 阶段（质量保证和验证）的上下文已准备好。

命令：*validate-phase, *check-compliance, *generate-test-plan
使用 *help 获取完整命令列表。
```

### 命令执行

```bash
# 执行主要命令
*command-name <parameters>

# 示例：验证第 4 阶段的输出
*validate-phase 4

# 示例：生成运行手册
*generate-runbook hybrid-ops-workflow
```

### 工作流上下文访问

所有代理都接收工作流上下文：

```javascript
const workflowContext = pvMind.getPhaseContext(<phase-number>);
// 返回：{
//   phaseNumber: <number>,
//   phaseName: "<name>",
//   inputs: [<previous-phase-outputs>],
//   outputs: [<expected-deliverables>],
//   dependencies: [<phase-ids>],
//   guardrails: [<safety-checks>]
// }
```

---

## PV Mind 集成

所有代理都使用带以下内容的 Pedro Valério 思维集成：

### META_AXIOMAS 框架

4 级信念层级：

- **级别 -4**：存在（真理基础）
- **级别 -3**：认识论（知识验证）
- **级别 -2**：社会（协作背景）
- **级别 0**：操作（执行规则）

### PV 启发式

- **PV_BS_001**：未来回溯法（战略一致性）
- **PV_PA_001**：一致性扫描（执行者验证）
- **PV_PM_001**：自动化转折点（频率限制 2x）

### 护栏

所有代理都应用：

- 带重试逻辑的错误处理
- 验证规则（最小限制）
- 回滚机制（检查点恢复）
- 极端情况文档

---

## 故障排除

### 代理未找到

**症状**：命令 `/agent-name` 无法识别
**解决方案**：检查代理文件是否存在于 `.claude/commands/hybridOps/agents/<agent-name>-pv.md`

### 检查点验证失败

**症状**：工作流在检查点停止
**解决方案**：查看详细反馈，修正问题，重新尝试检查点。对于否决条件，必须在继续之前修正。

### 缺少代理上下文

**症状**：代理无法访问上一阶段的输出
**解决方案**：检查工作流 YAML 是否具有正确的阶段依赖关系，确认上一阶段已成功完成。

---

## 文件位置

```
.claude/commands/hybridOps/
├── agents/
│   ├── process-mapper-pv.md           (阶段 1)
│   ├── process-architect-pv.md        (阶段 2)
│   ├── executor-designer-pv.md        (阶段 3)
│   ├── workflow-designer-pv.md        (阶段 4)
│   ├── qa-validator-pv.md             (阶段 5)
│   ├── clickup-engineer-pv.md         (阶段 6)
│   ├── agent-creator-pv.md            (阶段 7)
│   ├── validation-reviewer-pv.md      (阶段 8)
│   └── documentation-writer-pv.md     (阶段 9)
├── workflows/
│   └── hybrid-ops-pv.yaml             (工作流编排)
└── docs/
    ├── workflow-diagram.md             (工作流可视化)
    └── agent-reference-guide.md        (本文档)
```

---

## 相关文档

- [工作流图](../guides/hybridOps/workflow-diagram.md) - 9 阶段工作流的可视化表示
- [工作流 YAML](../guides/hybridOps/hybrid-ops-pv.yaml) - 工作流编排配置

---

## 版本历史

| 版本 | 日期       | 更改                                                        | 故事 |
| ---- | ---------- | ----------------------------------------------------------- | ---- |
| 2.0  | 2025-10-19 | 添加了 5 个缺失的代理（阶段 4、5、7、8、9），更新了工作流参考 | 1.9  |
| 1.0  | 2025-10-19 | 初始指南，有 4 个现有代理                                   | 1.8  |

---

**状态**：完整 - 所有 9 个代理已实现并验证
**最后验证**：2025-10-19
**维护者**：AIOS HybridOps 团队
