# AIOS自主开发引擎(ADE) - 完整指南

> **版本:** 1.0.0
> **日期:** 2026-01-29
> **状态:** 生产就绪 ✅

---

## 什么是ADE?

**AIOS自主开发引擎(ADE)**是一个自主开发系统，通过结构化管道和专业化Agent将模糊的需求转变为功能代码。

### 主要特性

- **Spec管道** - 将想法转变为可执行的规范
- **执行引擎** - 使用强制自我评论执行子任务
- **恢复系统** - 自动从失败中恢复
- **QA演进** - 10阶段的结构化审查
- **内存层** - 学习和记录模式

---

## 架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADE架构                                            │
│                                                                              │
│  用户请求 ──► Spec管道 ──► 执行引擎 ──► 工作代码       │
│                                    │                                 │
│                                    ▼                                 │
│                                恢复系统                           │
│                                    │                                 │
│                                    ▼                                 │
│                                QA演进                              │
│                                    │                                 │
│                                    ▼                                 │
│                                内存层                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7个Epic

### Epic 1: Worktree管理器

**目的:** 通过Git worktrees隔离分支

**命令 (@devops):**

- `*create-worktree {story}` - 创建隔离的worktree
- `*list-worktrees` - 列出活跃worktree
- `*merge-worktree {story}` - Merge worktree
- `*cleanup-worktrees` - 移除旧worktree

**文档:** [ADE-EPIC1-HANDOFF.md](../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: 迁移V2→V3

**目的:** 迁移到autoClaude V3格式

**命令 (@devops):**

- `*inventory-assets` - V2资产清单
- `*analyze-paths` - 分析依赖关系
- `*migrate-agent` - 迁移单个agent
- `*migrate-batch` - 批量迁移

**文档:** [ADE-EPIC2-HANDOFF.md](../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec管道

**目的:** 将需求转变为可执行规范

**流程:**

```
用户请求 → 收集 → 评估 → 研究 → 编写 → 评论 → Spec就绪
```

**各Agent命令:**

| Agent      | 命令                | 阶段                   |
| ---------- | ------------------- | ---------------------- |
| @pm        | `*gather-requirements` | 收集需求     |
| @architect | `*assess-complexity`   | 评估复杂性   |
| @analyst   | `*research-deps`       | 研究依赖     |
| @pm        | `*write-spec`          | 编写规范     |
| @qa        | `*critique-spec`       | 评论和批准   |

**文档:** [ADE-EPIC3-HANDOFF.md](../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: 执行引擎

**目的:** 在规范中执行功能代码

**Coder的13个步骤:**

1. 加载上下文
2. 读取实现计划
3. 理解当前子任务
4. 计划方法
5. 编写代码
   - 5.5 自我评论 (强制)
6. 运行测试
   - 6.5 自我评论 (强制)
7. 修复问题
8. 运行Linter
9. 修复Lint问题
10. 手动验证
11. 更新计划状态
12. 提交更改
13. 信号完成

**命令 (@architect):**

- `*create-plan` - 创建实现计划
- `*create-context` - 生成项目上下文

**命令 (@dev):**

- `*execute-subtask` - 执行子任务

**文档:** [ADE-EPIC4-HANDOFF.md](../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: 恢复系统

**目的:** 从子任务失败中恢复

**流程:**

```
子任务失败 → 跟踪尝试 → 重试(<3) → 卡住检测 → 回滚 → 上报
```

**命令 (@dev):**

- `*track-attempt` - 记录尝试
- `*rollback` - 回滚到之前状态

**文档:** [ADE-EPIC5-HANDOFF.md](../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA演进

**目的:** 10阶段的结构化审查

**10个阶段:**

1. 设置与上下文加载
2. 代码质量分析
3. 测试覆盖率审查
4. 安全扫描
5. 性能检查
6. 文档审核
7. 可访问性审查
8. 集成点检查
9. 边界情况与错误处理
10. 最终摘要与决定

**命令 (@qa):**

- `*review-build {story}` - 完整审查
- `*request-fix {issue}` - 请求修复
- `*verify-fix {issue}` - 验证修复

**命令 (@dev):**

- `*apply-qa-fix` - 应用QA修复

**文档:** [ADE-EPIC6-HANDOFF.md](../architecture/ADE-EPIC6-HANDOFF.md)

---

### Epic 7: 内存层

**目的:** 模式和见解的持久内存

**内存类型:**

- **见解** - 开发中的发现
- **模式** - 提取的代码模式
- **陷阱** - 已知的坑
- **决定** - 架构决定

**命令 (@dev):**

- `*capture-insights` - 捕获会话见解
- `*list-gotchas` - 列出已知陷阱

**命令 (@architect):**

- `*map-codebase` - 生成代码库地图

**命令 (@analyst):**

- `*extract-patterns` - 从代码提取模式

**文档:** [ADE-EPIC7-HANDOFF.md](../architecture/ADE-EPIC7-HANDOFF.md)

---

## 快速开始

### 1. 从需求创建Spec

```bash
# 激活PM并收集需求
@pm *gather-requirements

# 评估复杂性
@architect *assess-complexity

# 研究依赖
@analyst *research-deps

# 编写规范
@pm *write-spec

# 评论和批准
@qa *critique-spec
```

### 2. 执行批准的Spec

```bash
# 创建实现计划
@architect *create-plan

# 创建项目上下文
@architect *create-context

# 执行子任务 (循环)
@dev *execute-subtask 1.1
@dev *execute-subtask 1.2
...
```

### 3. QA审查

```bash
# 结构化审查
@qa *review-build STORY-42

# 如果有问题:
@qa *request-fix "缺少错误处理"
@dev *apply-qa-fix
@qa *verify-fix
```

### 4. 捕获学习

```bash
# 捕获会话见解
@dev *capture-insights

# 记录陷阱
@dev *list-gotchas
```

---

## 文件结构

```
.aios-core/
├── development/
│   ├── agents/              # V3 agent定义
│   ├── tasks/               # 可执行tasks
│   │   ├── spec-*.md        # Spec管道tasks
│   │   ├── plan-*.md        # 执行引擎tasks
│   │   ├── qa-*.md          # QA演进tasks
│   │   └── capture-*.md     # 内存层tasks
│   └── workflows/
│       ├── spec-pipeline.yaml
│       ├── qa-loop.yaml
│       └── auto-worktree.yaml
│
├── infrastructure/
│   ├── scripts/
│   │   ├── worktree-manager.js     # Epic 1
│   │   ├── asset-inventory.js      # Epic 2
│   │   ├── migrate-agent.js        # Epic 2
│   │   ├── subtask-verifier.js     # Epic 4
│   │   ├── plan-tracker.js         # Epic 4
│   │   ├── recovery-tracker.js     # Epic 5
│   │   ├── rollback-manager.js     # Epic 5
│   │   ├── qa-loop-orchestrator.js # Epic 6
│   │   ├── codebase-mapper.js      # Epic 7
│   │   └── pattern-extractor.js    # Epic 7
│   └── schemas/
│       ├── agent-v3-schema.json
│       └── task-v3-schema.json
│
└── product/
    ├── templates/
    │   ├── spec-tmpl.md
    │   └── qa-report-tmpl.yaml
    └── checklists/
        └── self-critique-checklist.md
```

---

## autoClaude V3格式

### Agent定义

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:10.724Z'

  specPipeline:
    canGather: boolean # @pm
    canAssess: boolean # @architect
    canResearch: boolean # @analyst
    canWrite: boolean # @pm
    canCritique: boolean # @qa

  execution:
    canCreatePlan: boolean # @architect
    canCreateContext: boolean # @architect
    canExecute: boolean # @dev
    canVerify: boolean # @dev

  recovery:
    canTrackAttempts: boolean # @dev
    canRollback: boolean # @dev

  qa:
    canReview: boolean # @qa
    canRequestFix: boolean # @qa

  memory:
    canCaptureInsights: boolean # @dev
    canExtractPatterns: boolean # @analyst
    canDocumentGotchas: boolean # @dev
```

### Task定义

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-gather|spec-assess|exec-plan|exec-subtask|etc
  deterministic: boolean
  elicit: boolean
  composable: boolean

  verification:
    type: none|command|manual
    command: 'npm test'

  selfCritique:
    required: boolean
    checklistRef: 'self-critique-checklist.md'
```

---

## QA门控

每个Epic都有必须通过的QA门控：

```bash
@qa *gate epic-{N}-{name}
```

**决定:**

- **PASS** - 下一个epic已解锁
- **CONCERNS** - 批准但有后续
- **FAIL** - 返回修复
- **WAIVED** - 由@po授权绕过

---

## 故障排除

### 子任务反复失败

```bash
# 检查尝试历史
@dev *track-attempt --status

# 回滚到最后好状态
@dev *rollback --hard

# 尝试不同方法
@dev *execute-subtask 2.1 --approach alternative
```

### Spec未批准

```bash
# 查看评论反馈
cat docs/stories/STORY-42/spec-critique.json

# 完善规范
@pm *write-spec --iterate

# 重新提交评论
@qa *critique-spec
```

### Worktree冲突

```bash
# 列出worktree
@devops *list-worktrees

# 解决冲突
@devops *merge-worktree STORY-42 --resolve

# Cleanup
@devops *cleanup-worktrees
```

---

## 相关文档

- [ADE架构切换](../architecture/ADE-ARCHITECT-HANDOFF.md) - 总体概览
- [ADE Agent更改](../architecture/ADE-AGENT-CHANGES.md) - 所有Agent更改及能力矩阵
- [Epic 1 - Worktree管理器](../architecture/ADE-EPIC1-HANDOFF.md)
- [Epic 2 - 迁移V2→V3](../architecture/ADE-EPIC2-HANDOFF.md)
- [Epic 3 - Spec管道](../architecture/ADE-EPIC3-HANDOFF.md)
- [Epic 4 - 执行引擎](../architecture/ADE-EPIC4-HANDOFF.md)
- [Epic 5 - 恢复系统](../architecture/ADE-EPIC5-HANDOFF.md)
- [Epic 6 - QA演进](../architecture/ADE-EPIC6-HANDOFF.md)
- [Epic 7 - 内存层](../architecture/ADE-EPIC7-HANDOFF.md)

---

_AIOS自主开发引擎 - 自主地将想法转变为代码_
