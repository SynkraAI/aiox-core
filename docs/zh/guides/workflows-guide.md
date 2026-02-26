# AIOS 工作流指南

**版本:** 1.0.0
**最后更新:** 2026-02-02
**状态:** 活跃

---

## 概述

AIOS 工作流是一系列精心编排的代理活动序列，可以自动化复杂的开发流程。它为常见的开发场景提供了结构化、可重复的模式。

### 核心概念

| 概念 | 描述 |
|------|------|
| **工作流** | 一个YAML定义，通过一系列步骤协调多个代理 |
| **阶段** | 工作流中相关步骤的逻辑分组 |
| **步骤** | 代理在工作流中执行的单个操作 |
| **转换** | 从一个步骤移动到下一个步骤，可选择条件 |
| **状态** | 在整个会话中持久化跟踪工作流进度 |

---

## 工作流类型

### 按项目类型

| 类型 | 描述 | 用例 |
|------|------|------|
| **绿地** | 从零开始的新项目 | 启动新应用 |
| **棕地** | 现有项目 | 增强或审核现有代码 |
| **通用** | 任何项目类型 | 跨切面流程，如故事开发 |

### 按范围

| 范围 | 描述 | 示例 |
|------|------|------|
| **全栈** | 完整应用 | `greenfield-fullstack`，`brownfield-fullstack` |
| **UI** | 仅前端 | `greenfield-ui`，`brownfield-ui` |
| **服务** | 仅后端 | `greenfield-service`，`brownfield-service` |
| **发现** | 分析和审核 | `brownfield-discovery` |

---

## 可用工作流

### 核心开发工作流

#### 1. 故事开发周期
**ID:** `story-development-cycle`
**类型:** 通用
**代理:** SM → PO → Dev → QA

最常见的迭代开发工作流:

```
┌─────────────────────────────────────────────────────────────┐
│                   故事开发周期                               │
│                                                              │
│  @sm: 创建故事 → @po: 验证 → @dev: 实现 → @qa              │
│         │            │            │        │                │
│         ▼            ▼            ▼        ▼                │
│     草稿故事      10项检查    代码+测试   质量门             │
└─────────────────────────────────────────────────────────────┘
```

**阶段:**
1. **故事创建** - SM从待办事项创建下一个故事
2. **故事验证** - PO用10点清单进行验证
3. **实现** - Dev实现并进行测试
4. **QA审查** - QA运行质量门

**何时使用:**
- 任何故事开发（绿地或棕地）
- 带有验证和质量门的完整周期
- 当需要流程可追溯性时

---

#### 2. 绿地全栈
**ID:** `greenfield-fullstack`
**类型:** 绿地
**代理:** DevOps → Analyst → PM → UX → Architect → PO → SM → Dev → QA

完整的新全栈应用工作流:

**阶段:**
1. **环境引导** - DevOps设置项目基础设施
2. **发现和规划** - 创建项目简报、PRD、规范、架构
3. **文档分片** - 将文档分解为开发
4. **开发周期** - 迭代故事实现

**何时使用:**
- 构建生产就绪的应用
- 多个团队成员参与
- 复杂的功能需求
- 预期长期维护

---

#### 3. 棕地发现
**ID:** `brownfield-discovery`
**类型:** 棕地
**代理:** Architect → Data Engineer → UX → QA → Analyst → PM

现有项目的完整技术债务评估:

**阶段:**
1. **数据收集** - 系统、数据库、前端文档
2. **初始整合** - 草稿评估
3. **专家验证** - DB、UX、QA审查
4. **最终报告** - 评估+执行报告
5. **规划** - 史诗和故事创建

**何时使用:**
- 从Lovable/v0.dev迁移
- 完整代码库审核
- 投资前的技术债务评估

---

### 其他工作流

| 工作流 | ID | 描述 |
|--------|-------|------|
| 绿地UI | `greenfield-ui` | 仅前端新项目 |
| 绿地服务 | `greenfield-service` | 仅后端新项目 |
| 棕地全栈 | `brownfield-fullstack` | 增强现有全栈应用 |
| 棕地UI | `brownfield-ui` | 增强现有前端 |
| 棕地服务 | `brownfield-service` | 增强现有后端 |
| QA循环 | `qa-loop` | 质量保证周期 |
| 规范管道 | `spec-pipeline` | 规范精化 |
| 设计系统构建 | `design-system-build-quality` | 设计系统创建 |

---

## 如何创建工作流

### 第1步: 规划工作流

定义:
- **目的**: 这个工作流解决什么问题?
- **代理**: 哪些代理参与?
- **序列**: 步骤的顺序是什么?
- **条件**: 是否有决策点或并行活动?

### 第2步: 使用创建工作流任务

```bash
# 激活能够创建工作流的代理
@architect

# 运行创建工作流任务
*create-workflow
```

### 第3步: 回答启发式问题

任务将询问:

1. **目标上下文**: `core`、`squad`或`hybrid`
2. **工作流名称**: 例如，`feature-development`
3. **主要目标**: 预期的结果是什么?
4. **阶段/步骤**: 工作流的主要阶段
5. **代理编排**: 每个阶段的代理
6. **资源需求**: 需要的模板、数据文件

### 第4步: 工作流结构

生成的工作流遵循以下结构:

```yaml
workflow:
  id: my-workflow
  name: 我的自定义工作流
  version: "1.0"
  description: "这个工作流的作用描述"
  type: greenfield | brownfield | generic
  project_types:
    - web-app
    - saas

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: 阶段名称
    - phase_2: 另一个阶段

  sequence:
    - step: step_name
      id: unique-id
      phase: 1
      agent: agent-name
      action: 操作描述
      creates: output-file.md
      requires: previous-step-id
      optional: false
      notes: |
        此步骤的详细说明...
      next: next-step-id

  flow_diagram: |
    ```mermaid
    graph TD
      A[开始] --> B[步骤1]
      B --> C[步骤2]
    ```

  decision_guidance:
    when_to_use:
      - 场景1
      - 场景2
    when_not_to_use:
      - 反模式1

  handoff_prompts:
    step1_complete: "步骤1完成。下一步: @agent用于步骤2"
```

### 第5步: 输出位置

工作流根据上下文保存:
- **核心**: `.aios-core/development/workflows/{name}.yaml`
- **Squad**: `squads/{squad}/workflows/{name}.yaml`
- **混合**: `squads/{squad}/workflows/{name}.yaml`

---

## 如何运行工作流

### 方法1: 引导模式（默认）

```bash
# 启动工作流
*run-workflow story-development-cycle start

# 检查状态
*run-workflow story-development-cycle status

# 继续下一步
*run-workflow story-development-cycle continue

# 跳过可选步骤
*run-workflow story-development-cycle skip

# 中止工作流
*run-workflow story-development-cycle abort
```

### 方法2: 引擎模式

```bash
# 运行完整引擎自动化
*run-workflow greenfield-fullstack start --mode engine
```

### 工作流状态

状态持久化在`.aios/{instance-id}-state.yaml`:

```yaml
instance_id: "wf-abc123"
workflow_name: "story-development-cycle"
status: "active"
current_step: 2
total_steps: 4
steps:
  - id: create
    status: completed
    completed_at: "2026-02-02T10:00:00Z"
  - id: validate
    status: in_progress
  - id: implement
    status: pending
  - id: review
    status: pending
```

### 多会话连续性

工作流在Claude Code会话之间持久化:

1. 用户启动新会话
2. 激活@aios-master
3. 运行`*run-workflow {name} continue`
4. 系统加载状态，显示当前步骤
5. 用户执行步骤
6. 返回并再次运行`continue`

---

## 工作流模式

AIOS根据命令历史检测常见的工作流模式:

### 检测到的模式

| 模式 | 触发命令 | 代理序列 |
|------|---------|---------|
| 故事开发 | `validate-story-draft`，`develop`，`review-qa` | PO → Dev → QA → DevOps |
| 史诗创建 | `create-epic`，`create-story`，`validate-story-draft` | PO → SM → Architect |
| 架构审查 | `analyze-impact`，`create-doc`，`review-proposal` | Architect → QA → Dev |
| Git工作流 | `pre-push-quality-gate`，`github-pr-automation` | Dev → DevOps |
| 数据库工作流 | `db-domain-modeling`，`db-schema-audit` | Data Engineer → Dev → QA |

### 模式检测

系统使用`workflow-patterns.yaml`来:
- 根据使用的命令检测您所在的工作流
- 提供置信度分数的建议下一步
- 提供情境性交接消息

---

## 最佳实践

### 工作流设计

1. **保持阶段重点** - 每个阶段应有明确的目的
2. **定义明确的交接** - 记录每个代理传递给下一个的内容
3. **包括可选步骤** - 为简单情况允许灵活性
4. **添加决策指导** - 帮助用户了解何时使用/不使用

### 工作流执行

1. **从状态开始** - 在继续前检查`*run-workflow {name} status`
2. **遵循交接提示** - 它们包含重要上下文
3. **不跳过必需步骤** - 只能跳过可选步骤
4. **记录决策** - 为将来参考保留笔记

### 工作流创建

1. **首先用简单情况测试** - 验证流程有效
2. **包括流程图** - 可视化表示有助于理解
3. **添加详细笔记** - 将来用户会感谢您
4. **定义错误处理** - 出错时会发生什么?

---

## 工作流与任务

| 方面 | 工作流 | 任务 |
|------|--------|------|
| **范围** | 多个步骤，多个代理 | 单个步骤，单个代理 |
| **状态** | 在会话间持久化 | 无状态 |
| **用例** | 复杂流程 | 原子操作 |
| **位置** | `.aios-core/development/workflows/` | `.aios-core/development/tasks/` |

---

## 故障排除

### 常见问题

**找不到工作流:**
```
错误: 找不到工作流'{name}'
```
- 检查工作流名称与文件ID匹配
- 验证目标上下文（核心/squad）

**没有活跃实例:**
```
错误: 找不到活跃工作流实例
```
- 首先用`*run-workflow {name} start`启动工作流

**步骤不可选:**
```
错误: 无法跳过非可选步骤
```
- 完成步骤或中止工作流

### 获取帮助

```bash
# 列出可用工作流
ls .aios-core/development/workflows/

# 验证工作流
*validate-workflow {name}

# 查看工作流详情
cat .aios-core/development/workflows/{name}.yaml
```

---

## 详细工作流文档

有关每个工作流的完整文档，包括详细的分步指南、流程图和实现细节，请参阅:

- [AIOS工作流](../aios-workflows/README.md) - 每个工作流的完整文档

---

## 相关文档

- [HybridOps工作流图](./hybridOps/workflow-diagram.md) - 人工代理协作模式
- [代理参考指南](../agent-reference-guide.md) - 可用代理及其能力
- [故事驱动开发](./user-guide.md#story-driven-development) - 故事工作流

---

*AIOS工作流指南 v1.0 - 协调AI-人工协作*
