# ADE Epic 3 交接 - Spec Pipeline

> **发送方:** Quinn (@qa) - QA 代理
> **接收方:** Aria (@architect) - 解决方案架构师
> **日期:** 2026-01-28
> **状态:** Epic 1+2 完成 → Epic 3 解锁

---

## 执行摘要

Epic 1 (Worktree) 和 Epic 2 (Migration V3) **100% 完成**并通过 QA Gate。Epic 3 (Spec Pipeline) **解锁**并可立即开始。

**Epic 3 是 100% 提示工程** - @architect 领导所有 6 个 stories。

---

## 已验证的先决条件 ✅

| 依赖项          | 状态              | 证据                                          |
| --------------- | ----------------- | --------------------------------------------- |
| WorktreeManager | ✅ 正常工作       | `manager.list()` 执行无错误                   |
| V3 Schemas      | ✅ 完成           | `agent-v3-schema.json`, `task-v3-schema.json` |
| 所有 Agents V3  | ✅ 12/12 已迁移   | 所有都有 `autoClaude:` 部分                   |
| 迁移脚本        | ✅ 就绪           | `asset-inventory.js`, `path-analyzer.js`      |

---

## Epic 3: Spec Pipeline 概览

**类型:** 10% 代码, **90% 提示工程**

Spec Pipeline 通过 5 个顺序阶段将模糊需求转换为可执行规格:

```
用户请求 → 收集 → 评估 → 研究 → 编写 → 评审 → 规格就绪
```

---

## Story 详情

| Story | 交付物                          | 类型           | 代理       |
| ----- | ------------------------------- | -------------- | ---------- |
| 3.1   | `spec-gather-requirements.md`   | Task .md       | @architect |
| 3.2   | `spec-assess-complexity.md`     | Task .md       | @architect |
| 3.3   | `spec-research-dependencies.md` | Task .md + MCP | @architect |
| 3.4   | `spec-write-spec.md`            | Task .md       | @architect |
| 3.5   | `spec-critique.md`              | Task .md       | @architect |
| 3.6   | `spec-pipeline.yaml`            | Workflow .yaml | @architect |

**需要 @dev:** 无
**@architect 领导:** 所有 stories

---

## Story 3.1: 收集需求 (Gather Requirements)

**目标:** 收集和结构化用户需求

**任务:** `spec-gather-requirements.md`

**输入:**

- 用户请求 (文本或语音)
- 项目上下文 (来自 status.json)
- 现有规格 (如果迭代)

**输出:**

- 结构化需求文档
- 澄清问题 (如有歧义)
- 初始范围定义

**模式:**

```yaml
autoClaude:
  pipelinePhase: spec-gather
  elicit: true
  deterministic: false # 需要 LLM 创造力
```

---

## Story 3.2: 评估复杂度 (Assess Complexity)

**目标:** 评估复杂度并估算工作量

**任务:** `spec-assess-complexity.md`

**输入:**

- 收集的需求 (来自 3.1)
- 代码库分析
- 技术约束

**输出:**

- 复杂度评分 (simple/standard/complex)
- 工作量估算
- 风险因素
- 拆分建议 (如果复杂)

**模式:**

```yaml
autoClaude:
  pipelinePhase: spec-assess
  complexity: standard
  verification:
    type: none # 评估是咨询性的
```

---

## Story 3.3: 研究依赖 (Research Dependencies)

**目标:** 研究所需的库、API 和模式

**任务:** `spec-research-dependencies.md`

**所需工具:**

- EXA (网络搜索)
- Context7 (库文档)
- 代码库搜索

**输入:**

- 需求 + 评估
- 技术栈偏好 (来自 technical-preferences.md)

**输出:**

- 带理由的推荐库
- API 文档链接
- 代码示例
- 兼容性说明

**模式:**

```yaml
autoClaude:
  pipelinePhase: spec-research
  tools:
    - exa
    - context7
```

---

## Story 3.4: 编写规格 (Write Specification)

**目标:** 生成可执行规格

**任务:** `spec-write-spec.md`

**输入:**

- 所有先前输出 (需求、评估、研究)
- 规格模板

**输出:**

- 完整规格文档
- 实施检查清单
- 测试场景 (Given-When-Then)
- 验收标准

**模板:** 使用现有 `spec-tmpl.yaml` 或创建新的

**模式:**

```yaml
autoClaude:
  pipelinePhase: spec-write
  deterministic: true # 相同输入 = 相同规格
  composable: true
```

---

## Story 3.5: 评审规格 (Critique Specification)

**目标:** 在执行前验证和改进规格

**任务:** `spec-critique.md`

**输入:**

- 编写的规格 (来自 3.4)
- 质量检查清单

**输出:**

- 评审报告
- 改进建议
- 通过/需修改 决定
- 修订后的规格 (如果自动更正)

**代理:** @qa 能力 (canCritique: true)

**模式:**

```yaml
autoClaude:
  pipelinePhase: spec-critique
  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md
```

---

## Story 3.6: Pipeline 编排 (Pipeline Orchestration)

**目标:** 将 5 个阶段编排为单一工作流

**工作流:** `spec-pipeline.yaml`

**结构:**

```yaml
workflow:
  id: spec-pipeline
  sequence:
    - step: gather
      task: spec-gather-requirements.md
      agent: pm
    - step: assess
      task: spec-assess-complexity.md
      agent: architect
    - step: research
      task: spec-research-dependencies.md
      agent: analyst
    - step: write
      task: spec-write-spec.md
      agent: pm
    - step: critique
      task: spec-critique.md
      agent: qa
      gate: true # 必须通过才能继续
```

---

## 技术模式

### Task V3 模板

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-{phase}
  deterministic: boolean
  elicit: boolean
  composable: true

  verification:
    type: none|command|manual

  contextRequirements:
    projectContext: true
    filesContext: false
    implementationPlan: false
    spec: false
```

### Pipeline 阶段枚举

```
spec-gather    # @pm - 收集需求
spec-assess    # @architect - 评估复杂度
spec-research  # @analyst - 研究依赖
spec-write     # @pm - 编写规格
spec-critique  # @qa - 验证质量
```

---

## 成功标准

- [ ] 所有 5 个 spec tasks 使用 autoClaude V3 部分创建
- [ ] Pipeline 工作流编排所有阶段
- [ ] 每个 task 有清晰的输入/输出
- [ ] Critique task 包含质量门禁
- [ ] 端到端测试: 模糊请求 → 完整规格

---

## 推荐执行顺序

1. **3.1 + 3.2 + 3.3** - 创建 3 个分析 tasks (可并行)
2. **3.4** - 编写规格 task (依赖于理解流程)
3. **3.5** - Critique task (需要规格来评审)
4. **3.6** - Pipeline 工作流 (集成所有)

---

## 相关文档

- PRD: `docs/prd/aios-autonomous-development-engine.md`
- Auto-Claude 分析: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Epic Stories: `docs/stories/aios-core-ade/epic-3-spec-pipeline.md`

---

## Epic 3 的 QA Gate

完成 Epic 3 后，执行:

```
@qa *gate epic-3-spec-pipeline
```

**验证:**

- 所有 5 个 tasks 通过 task-v3-schema.json 验证
- Pipeline 工作流执行无错误
- E2E 测试: "添加登录功能" → 完整规格

---

_交接由 Quinn (@qa) 准备 - 质量守护者_
_提交: 3fea6ca - feat(ade): complete Epic 1+2_
_日期: 2026-01-28_
