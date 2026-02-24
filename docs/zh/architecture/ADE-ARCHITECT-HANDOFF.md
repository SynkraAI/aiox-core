# ADE 架构师交接

> **发送方:** Quinn (@qa) - QA 代理
> **接收方:** Aria (@architect) - 解决方案架构师
> **日期:** 2026-01-28
> **项目:** AIOS 自主开发引擎 (ADE)

---

## 执行摘要

ADE 是一个 **提示工程 + 基础设施** 项目，用于在 AIOS 中启用自主开发执行。大约 **60% 的工作是创建 tasks .md、workflows .yaml 和模板** - 而不是传统代码。

**您是该项目的技术领导者。** @dev 仅用于特定的 JS 脚本。

---

## 依赖项分析

### 关键路径 (顺序必需)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             关键路径                                        │
│                                                                              │
│  Epic 1 ──────► Epic 2 ──────► Epic 3 ──────► Epic 4                        │
│  Worktree       Migration      Spec Pipeline   Execution                    │
│  (P0)           (P0)           (P0)            (P0)                         │
│                                                                              │
│  阻塞: 每个 epic 取决于前一个完成                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 并行化机会 (Epic 4 之后)

```
                              Epic 4 (Execution)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             Epic 5 (Recovery)              Epic 6 (QA Evolution)
             P1 - 4 stories                 P1 - 5 stories
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              Epic 7 (Memory)
                              P2 - 4 stories
```

**Epic 5 和 Epic 6 可以在 Epic 4 完成后 并行运行**。

---

## 依赖矩阵

| Epic                 | 依赖  | 阻塞   | 并行  |
| -------------------- | ---- | ------ | ------ |
| **1. Worktree**      | -    | 2, 4   | -      |
| **2. Migration**     | 1    | 3, 4, 5, 6 | -  |
| **3. Spec Pipeline** | 2    | 4      | -      |
| **4. Execution**     | 3    | 5, 6   | -      |
| **5. Recovery**      | 4    | 7      | **6**  |
| **6. QA Evolution**  | 4    | 7      | **5**  |
| **7. Memory**        | 5, 6 | -      | -      |

---

## 准备并行化

虽然 epics 有 **实施** 依赖，但您可以在当前 epic 开发时 **准备** 未来的 epics：

| 执行时 | 可以准备 (不实施) |
| ------ | ----------------------------------------- |
| Epic 1 | Epic 2 的 V3 Schemas (设计) |
| Epic 2 | Epic 3 的 tasks 结构 |
| Epic 3 | Epic 4 的 implementation.yaml 结构 |
| Epic 4 | Epic 5 和 6 的设计 (并行) |

---

## Epic 按工作类型的详细信息

### Epic 1: Worktree Manager (P0) - 5 stories

**类型:** 70% 代码, 30% 提示工程

| Story | 交付物                            | 类型        |
| ----- | --------------------------------- | ----------- |
| 1.1   | worktree-manager.js               | JS 脚本   |
| 1.2   | Merge operations                  | JS 脚本   |
| 1.3   | CLI commands (\*create-worktree, etc) | Task .md    |
| 1.4   | Auto-create trigger               | Workflow    |
| 1.5   | status.json integration           | JS + Schema |

**需要 @dev:** Stories 1.1, 1.2, 1.5 (脚本)
**@architect 领导:** Stories 1.3, 1.4 (提示/工作流)

---

### Epic 2: Migration V2→V3 (P0) - 6 stories

**类型:** 60% 代码, 40% 提示工程

| Story | 交付物                  | 类型                |
| ----- | ----------------------- | ------------------- |
| 2.1   | asset-inventory.js      | JS 脚本           |
| 2.2   | path-analyzer.js        | JS 脚本           |
| 2.3   | V3 Schemas (agent, task) | JSON Schema         |
| 2.4   | migrate-agent.js        | JS 脚本           |
| 2.5   | Pilot migration (@dev, @qa) | 手动 + 验证  |
| 2.6   | Batch migration         | 编排        |

**需要 @dev:** Stories 2.1, 2.2, 2.4 (脚本)
**@architect 领导:** Stories 2.3, 2.5, 2.6 (schemas/编排)

---

### Epic 3: Spec Pipeline (P0) - 6 stories

**类型:** 10% 代码, 90% 提示工程

| Story | 交付物                    | 类型           |
| ----- | ----------------------------- | -------------- |
| 3.1   | spec-gather-requirements.md   | Task .md       |
| 3.2   | spec-assess-complexity.md     | Task .md       |
| 3.3   | spec-research-dependencies.md | Task .md + MCP |
| 3.4   | spec-write-spec.md            | Task .md       |
| 3.5   | spec-critique.md              | Task .md       |
| 3.6   | spec-pipeline.yaml            | Workflow .yaml |

**需要 @dev:** 无
**@architect 领导:** 所有 stories (100% 提示工程)

---

### Epic 4: Execution Engine (P0) - 6 stories

**类型:** 30% 代码, 70% 提示工程

| Story | 交付物                         | 类型          |
| ----- | ---------------------------------- | ------------- |
| 4.1   | plan-create-implementation.md      | Task .md      |
| 4.2   | plan-create-context.md             | Task .md      |
| 4.3   | plan-execute-subtask.md (13 steps) | Task .md      |
| 4.4   | self-critique-checklist.md         | Checklist .md |
| 4.5   | subtask-verifier.js                | JS 脚本     |
| 4.6   | plan-tracker.js                    | JS 脚本     |

**需要 @dev:** Stories 4.5, 4.6 (脚本)
**@architect 领导:** Stories 4.1, 4.2, 4.3, 4.4 (提示)

---

### Epic 5: Recovery System (P1) - 4 stories

**类型:** 40% 代码, 60% 提示工程

| Story | 交付物           | 类型           |
| ----- | -------------------- | -------------- |
| 5.1   | attempt-tracker.js   | JS 脚本      |
| 5.2   | recovery-strategy.md | Task .md       |
| 5.3   | Escalation triggers  | Workflow       |
| 5.4   | Retry policies       | Config + Logic |

**需要 @dev:** Story 5.1 (脚本)
**@architect 领导:** Stories 5.2, 5.3, 5.4

---

### Epic 6: QA Evolution (P1) - 5 stories

**类型:** 10% 代码, 90% 提示工程

| Story | 交付物                | 类型                 |
| ----- | ------------------------- | -------------------- |
| 6.1   | review-subtask.md         | Task .md             |
| 6.2   | qa-gate-auto.md           | Task .md             |
| 6.3   | CodeRabbit integration    | Config + Workflow    |
| 6.4   | review-qa.md (Dev→QA→Dev) | Task .md             |
| 6.5   | Quality metrics           | Schema + Aggregation |

**需要 @dev:** Story 6.5 (metrics script, optional)
**@architect 领导:** Stories 6.1, 6.2, 6.3, 6.4

---

### Epic 7: Memory Layer (P2) - 4 stories

**类型:** 50% 代码, 50% 提示工程

| Story | 交付物                       | 类型         |
| ----- | -------------------------------- | ------------ |
| 7.1   | project-memory schema (Supabase) | SQL + Schema |
| 7.2   | Memory query utilities           | JS + SQL     |
| 7.3   | Pattern learning                 | Task .md     |
| 7.4   | Cross-project insights           | Task .md     |

**需要 @dev:** Stories 7.1, 7.2 (Supabase)
**@architect 领导:** Stories 7.3, 7.4

---

## 推荐执行计划

### 第 1 阶段: 基础 (第 1-3 周)

```
第 1 周: Epic 1 (Worktree Manager)
        └── @dev: 1.1, 1.2, 1.5
        └── @architect: 1.3, 1.4
        └── 准备: 设计 V3 schemas (Epic 2)

第 2-3 周: Epic 2 (Migration V2→V3)
        └── @dev: 2.1, 2.2, 2.4
        └── @architect: 2.3, 2.5, 2.6
        └── 准备: spec tasks 的草稿结构 (Epic 3)
```

### 第 2 阶段: 主 Pipeline (第 4-6 周)

```
第 4-5 周: Epic 3 (Spec Pipeline) - 100% @architect
        └── 所有 6 个 stories 都是提示工程
        └── 准备: execution tasks 的草稿 (Epic 4)

第 6 周: Epic 4 (Execution Engine)
        └── @dev: 4.5, 4.6
        └── @architect: 4.1, 4.2, 4.3, 4.4
```

### 第 3 阶段: 恢复力 (第 7-8 周) - 并行

```
第 7-8 周: Epic 5 (Recovery) + Epic 6 (QA Evolution) 并行

        轨道 1 - Recovery:
        └── @dev: 5.1
        └── @architect: 5.2, 5.3, 5.4

        轨道 2 - QA Evolution:
        └── @architect: 6.1, 6.2, 6.3, 6.4
        └── @dev: 6.5 (optional)
```

### 第 4 阶段: 智能 (第 9-10 周)

```
第 9-10 周: Epic 7 (Memory Layer)
        └── @dev: 7.1, 7.2 (Supabase)
        └── @architect: 7.3, 7.4
```

---

## 关键文档

### PRD

- `docs/prd/aios-autonomous-development-engine.md`

### Stories

- `docs/stories/aios-core-ade/` (7 个 epic 文件 + README)

### Quality Gates

- `docs/qa/gates/aios-core-ade/` (7 个 gate 文件 + README)

### 参考

- `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md` (Auto-Claude 模式)
- `.aios-core/core-config.yaml` (中央配置)

---

## Quality Gate 协议

完成每个 epic 后，触发 @qa 执行 quality gate：

```
@qa *gate epic-{N}-{name}
```

**可能的决定:**

- **PASS:** 下一个 epic 解锁
- **CONCERNS:** 批准但有后续项目
- **FAIL:** 返回修复
- **WAIVED:** 由 @po 授权的绕过

---

## 重要说明

### 关于提示工程

tasks .md 是 **LLM 的可执行指令**。它们需要:

1. **确定性** - 相同输入 = 相同输出
2. **完整** - 所有步骤都是显式的
3. **可验证** - 输出可验证
4. **可组合** - 可被其他 tasks 调用

### 关于自我评论 (Epic 4)

execute-subtask 的步骤 5.5 和 6.5 是 **关键的**。它们强制 LLM 在继续之前审查自己的工作。不能被绕过，除非有显式标志。

### 关于与 Dashboard 的集成

Dashboard (单独项目) 会 **消费** ADE 产生的内容：

- status.json 格式
- Worktree API
- Agents V3

ADE 工作不依赖 Dashboard。

---

## 推荐的首步

1. **阅读完整 PRD** - `docs/prd/aios-autonomous-development-engine.md`
2. **阅读 Auto-Claude 分析** - `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
3. **启动 Epic 1.1** - worktree-manager.js (委托给 @dev)
4. **并行地设计 V3 schemas** (Epic 2.3)

---

## 启动前给 @architect 的问题

1. 您更喜欢从代码开始 (Epic 1.1 与 @dev) 还是从设计开始 (V3 schemas)?
2. 您想创建专门的 @prompt-engineer 代理还是承担这个角色？
3. 对范围或依赖性有任何疑问吗？

---

_交接由 Quinn (@qa) 准备 - 质量守护者_
_日期: 2026-01-28_
