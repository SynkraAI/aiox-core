# ADE 架构 - 自主开发引擎

> **版本:** 1.0
> **最后更新:** 2026-01-29
> **状态:** 官方框架标准
>
> [EN](../../architecture/ade-architecture.md) | [PT](../../pt/architecture/ade-architecture.md) | [ES](../../es/architecture/ade-architecture.md) | **ZH**

---

## 目录

- [概述](#概述)
- [设计原则](#设计原则)
- [Epic 架构](#epic-架构)
- [系统组件](#系统组件)
- [集成点](#集成点)
- [运行时状态管理](#运行时状态管理)
- [配置](#配置)
- [工作流智能系统 (WIS)](#工作流智能系统-wis)
- [错误处理和恢复](#错误处理和恢复)

---

## 概述

**自主开发引擎 (ADE)** 是 AIOS 用于自主开发工作流的基础设施。它使 AI 代理能够通过智能管道、自愈循环和持久学习独立工作。

### 核心能力

| 能力                 | 描述                         | Epic  |
| -------------------- | ---------------------------- | ----- |
| **Story 隔离**       | 基于 worktree 的分支隔离     | Epic 1 |
| **项目状态**         | 基于 YAML 的状态跟踪         | Epic 2 |
| **规格管道**         | 需求 → 规格自动化            | Epic 3 |
| **实施规划**         | 计划生成和进度跟踪           | Epic 4 |
| **自愈**             | 卡住检测和恢复               | Epic 5 |
| **QA 演进**          | 自动审查 → 修复循环          | Epic 6 |
| **记忆层**           | 模式学习和陷阱文档           | Epic 7 |

### 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AIOS 框架                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    ADE - 自主开发引擎                                   │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Epic 1    │  │   Epic 2    │  │   Epic 3    │  │   Epic 4    │   │ │
│  │  │  Worktree   │→│   Status    │→│    Spec     │→│    Plan     │   │ │
│  │  │  Manager    │  │   Loader    │  │  Pipeline   │  │   Tracker   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                     运行时状态 .aios/                           │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Epic 5    │  │   Epic 6    │  │   Epic 7    │  │     WIS     │   │ │
│  │  │  Auto-Cure  │←│   QA Loop   │←│   Memory    │←│   Engine    │   │ │
│  │  │   Loop      │  │ Orchestrate │  │   Layer     │  │   Learning  │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 设计原则

### 1. 确定性优先

```yaml
优先级:
  1. 确定性脚本         # 始终优先
  2. SQL/JSON 查询      # 可预测、可审计
  3. 正则/模式匹配      # 可重现
  4. LLM 作为最后手段   # 仅在需要创造力时
```

### 2. 状态持久化

所有 ADE 状态都持久化在 `.aios/` 中用于:

- 会话恢复
- 进度跟踪
- 学习延续

### 3. 组合管道

工作流由组合任务构建:

- 每个任务有定义的输入/输出
- 任务可以独立执行或按顺序执行
- 管道根据复杂性调整

### 4. 自愈循环

每个管道都有内置恢复:

- 带可配置阈值的卡住检测
- 自动回滚能力
- 针对不可恢复状态的升级路径

---

## Epic 架构

### Epic 1: Story 分支隔离

**目的:** 在专用 Git worktrees 中隔离 story 开发。

```
组件: worktree-manager.js
位置: .aios-core/infrastructure/scripts/

流程:
  1. Story 开始 → 创建 worktree
  2. 开发 → 在隔离中工作
  3. Story 完成 → 合并并清理
```

**核心函数:**

- `createWorktree(storyId)` - 创建隔离分支
- `switchWorktree(storyId)` - 切换上下文
- `mergeWorktree(storyId)` - 合并到 main
- `cleanupWorktree(storyId)` - 移除 worktree

### Epic 2: 项目状态系统

**目的:** 在人类可读的 YAML 中跟踪项目状态。

```
组件: project-status-loader.js
位置: .aios-core/infrastructure/scripts/

状态文件: .aios/project-status.yaml
```

**状态 Schema:**

```yaml
project:
  name: 'project-name'
  currentStory: 'STORY-001'

stories:
  STORY-001:
    status: in_progress
    branch: feat/story-001
    specStatus: approved
    qaStatus: pending
```

### Epic 3: 规格管道

**目的:** 将需求转换为规格。

```
组件:
  - Workflow: spec-pipeline.yaml
  - Tasks: spec-gather-requirements.md
           spec-assess-complexity.md
           spec-research-dependencies.md
           spec-write-spec.md
           spec-critique.md
```

**管道阶段:**

| 阶段     | 代理       | 输出              |
| -------- | ---------- | ----------------- |
| 1. 收集  | @pm        | requirements.json |
| 2. 评估  | @architect | complexity.json   |
| 3. 研究  | @analyst   | research.json     |
| 4. 编写  | @pm        | spec.md           |
| 5. 评审  | @qa        | critique.json     |

**复杂性适配:**

```yaml
简单: 收集 → 编写 → 评审
标准: 收集 → 评估 → 研究 → 编写 → 评审 → 规划
复杂: 收集 → 评估 → 研究 → 编写 → 评审 → 修订 → 评审2 → 规划
```

### Epic 4: 实施规划

**目的:** 生成和跟踪实施计划。

```
组件:
  - Scripts: plan-tracker.js
             subtask-verifier.js
  - Tasks: plan-create-context.md
           plan-create-implementation.md
           plan-execute-subtask.md
           verify-subtask.md
  - Checklist: self-critique-checklist.md
```

**计划结构:**

```json
{
  "storyId": "STORY-001",
  "subtasks": [
    { "id": 1, "status": "complete", "verified": true },
    { "id": 2, "status": "in_progress", "verified": false },
    { "id": 3, "status": "pending", "verified": false }
  ],
  "progress": { "completed": 1, "total": 3, "percentage": 33 }
}
```

### Epic 5: 自愈循环

**目的:** 检测卡住状态并自动恢复。

```
组件:
  - Scripts: stuck-detector.js
             recovery-tracker.js
             rollback-manager.js
             approach-manager.js
  - Template: current-approach-tmpl.md
```

**卡住检测信号:**

| 信号           | 阈值       | 动作           |
| -------------- | ---------- | -------------- |
| 相同错误 3 次  | 3 次发生   | 建议替代方案   |
| 无进展         | 10 分钟    | 请求审查       |
| 重复回滚       | 2 次回滚   | 升级           |

**恢复流程:**

```
检测到卡住 → 记录方法 → 尝试替代 → 成功?
                                    ↓ 否
                            回滚 → 升级
```

### Epic 6: QA 演进

**目的:** 带修复循环的自动 QA 审查。

```
组件:
  - Workflow: qa-loop.yaml
  - Scripts: qa-loop-orchestrator.js
             qa-report-generator.js
  - Tasks: qa-review-build.md (10 阶段)
           qa-create-fix-request.md
           qa-fix-issues.md
  - Template: qa-report-tmpl.md
```

**QA 循环流程:**

```
┌─────────────────────────────────────────────────────────────┐
│                      QA 循环                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ 审查    │ → │ 生成    │ → │ 检查    │ → │ 需修复?  │  │
│  │ 构建    │    │ 报告    │    │ 结论    │    │         │  │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘  │
│                                                     │       │
│                 ┌───────────────────────────────────┘       │
│                 │                                           │
│          ┌──────▼──────┐                                    │
│          │   通过      │ → 完成                             │
│          └─────────────┘                                    │
│          ┌──────▼──────┐                                    │
│          │ 需要修改    │ → 创建修复请求 → @dev 修复         │
│          └─────────────┘    └────────────────────┘         │
│                                      │                      │
│                 ┌────────────────────┘                      │
│                 │ (最多 5 次迭代)                            │
│                 └──────→ 返回审查                           │
│                                                              │
│          ┌──────▼──────┐                                    │
│          │   阻塞      │ → 升级到 @architect                │
│          └─────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**10 阶段审查:**

1. 语法和格式
2. 代码结构
3. 命名规范
4. 错误处理
5. 安全模式
6. 性能模式
7. 测试覆盖
8. 文档
9. 可访问性
10. 最终评估

### Epic 7: 记忆层

**目的:** 跨会话持久学习。

```
组件:
  - Scripts: codebase-mapper.js
             pattern-extractor.js
             gotchas-documenter.js
  - Tasks: capture-session-insights.md
           extract-patterns.md
           document-gotchas.md
```

**记忆类型:**

| 类型         | 描述                    | 存储                              |
| ------------ | ----------------------- | --------------------------------- |
| 代码模式     | 来自代码库的可重用模式  | .aios/patterns/code-patterns.json |
| 陷阱         | 已知问题和解决方案      | .aios/patterns/gotchas.json       |
| 会话洞察     | 会话期间的发现          | .aios/sessions/                   |
| 代码库地图   | 项目结构分析            | .aios/codebase-map.json           |

---

## 系统组件

### 基础设施脚本

| 脚本                       | Epic  | 用途               |
| -------------------------- | ----- | ------------------ |
| `worktree-manager.js`      | 1     | Worktree 管理      |
| `project-status-loader.js` | 2     | YAML 状态跟踪      |
| `spec-pipeline-runner.js`  | 3     | 规格管道自动化     |
| `plan-tracker.js`          | 4     | 计划进度跟踪       |
| `subtask-verifier.js`      | 4     | 子任务验证         |
| `approach-manager.js`      | 5     | 方法跟踪           |
| `stuck-detector.js`        | 5     | 卡住状态检测       |
| `recovery-tracker.js`      | 5     | 恢复日志           |
| `rollback-manager.js`      | 5     | 回滚管理           |
| `qa-report-generator.js`   | 6     | QA 报告生成        |
| `qa-loop-orchestrator.js`  | 6     | QA 循环自动化      |
| `codebase-mapper.js`       | 7     | 项目结构映射       |
| `pattern-extractor.js`     | 7     | 模式提取           |
| `gotchas-documenter.js`    | 7     | 陷阱文档           |

---

## 配置

### 主配置

位于 `.aios-core/core-config.yaml`:

```yaml
ade:
  enabled: true

  worktrees:
    enabled: true
    baseDir: .worktrees
    autoCleanup: true

  specPipeline:
    enabled: true
    maxIterations: 3
    strictGate: true

  qaLoop:
    enabled: true
    maxIterations: 5
    autoFix: true

  memoryLayer:
    enabled: true
    patternStore: .aios/patterns/
    sessionCapture: true

  selfHealing:
    enabled: true
    stuckThreshold: 3
    autoRollback: false
```

---

## 工作流智能系统 (WIS)

WIS 基于学习的模式提供智能建议。

### 组件

```
.aios-core/workflow-intelligence/
├── engine/
│   ├── confidence-scorer.js   # 模式置信度评分
│   ├── output-formatter.js    # 输出格式化
│   ├── suggestion-engine.js   # 智能建议
│   └── wave-analyzer.js       # 波形模式分析
├── learning/
│   ├── capture-hook.js        # 模式捕获钩子
│   ├── pattern-capture.js     # 模式捕获引擎
│   ├── pattern-store.js       # 模式持久化
│   └── pattern-validator.js   # 模式验证
└── registry/
    └── workflow-registry.js   # 工作流注册表
```

### 与 ADE 的集成

WIS 通过以下方式与 ADE 集成:

1. **模式捕获** - 从成功的工作流中学习
2. **建议引擎** - 基于上下文建议方法
3. **置信度评分** - 按可靠性对建议排名

---

## 错误处理和恢复

### 错误类别

| 类别     | 处理方式       | 示例         |
| -------- | -------------- | ------------ |
| 瞬态     | 重试 (3x)      | 网络超时     |
| 可恢复   | 替代方法       | Lint 失败    |
| 阻塞     | 升级           | 安全问题     |
| 致命     | 停止 + 通知    | 损坏         |

### 恢复策略

```yaml
strategies:
  retry:
    maxAttempts: 3
    delay: exponential

  alternative:
    trigger: same_error_3x
    action: suggest_approach

  rollback:
    trigger: corruption_detected
    action: restore_checkpoint

  escalate:
    trigger: max_iterations
    action: notify_architect
```

---

## 版本历史

| 版本 | 日期       | 变更                          | 作者              |
| ---- | ---------- | ----------------------------- | ----------------- |
| 1.0  | 2026-01-29 | 初始 ADE 架构文档             | Aria (architect)  |

---

_这是记录自主开发引擎的官方 AIOS 框架标准。_
