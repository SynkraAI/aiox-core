# @qa 系统

> **版本:** 1.0.0
> **创建:** 2026-02-04
> **所有者:** @qa (Quinn - 守护者)
> **状态:** 官方文档

---

## 概览

**@qa 代理 (Quinn)** 是 AIOS 的**测试架构师和质量顾问**。其角色是为开发团队提供全面的质量分析、质量门决策和可行的建议。

**原型:** 守护者
**通信语气:** 分析、系统、教育、务实
**特征词汇:** 验证、检查、保证、保护、审计、检查、确保

### 核心原则

1. **根据需要的深度** - 根据风险信号深入，低风险时保持简洁
2. **需求可追踪性** - 使用给定-当-然模式将所有故事映射到测试
3. **基于风险的测试** - 按概率 x 影响评估和优先级
4. **质量属性** - 验证 NFR(安全、性能、可靠性)
5. **可测试性评估** - 评估可控制性、可观察性、可调试性
6. **门治理** - 提供明确的 PASS/CONCERNS/FAIL/WAIVED 决策和理由
7. **咨询卓越** - 通过文档教育，永远不要任意阻止
8. **CodeRabbit 集成** - 使用自动审查提早发现问题

---

## 完整文件列表

### @qa 的核心任务文件

| 文件 | 命令 | 目的 |
|---------|---------|-----------|
| `.aios-core/development/tasks/qa-gate.md` | `*gate {story}` | 创建质量门决策文件 |
| `.aios-core/development/tasks/qa-review-story.md` | `*review {story}` | 完整故事审查和门决策 |
| `.aios-core/development/tasks/qa-test-design.md` | `*test-design {story}` | 创建全面的测试场景 |
| `.aios-core/development/tasks/qa-risk-profile.md` | `*risk-profile {story}` | 生成风险评估矩阵 |
| `.aios-core/development/tasks/qa-nfr-assess.md` | `*nfr-assess {story}` | 验证非功能需求 |
| `.aios-core/development/tasks/qa-trace-requirements.md` | `*trace {story}` | 将需求映射到测试(给定-当-然) |
| `.aios-core/development/tasks/qa-generate-tests.md` | `*generate-tests` | 自动生成测试套件 |
| `.aios-core/development/tasks/qa-run-tests.md` | `*run-tests` | 执行测试套件和质量门 |
| `.aios-core/development/tasks/qa-backlog-add-followup.md` | `*backlog-add` | 添加后续项到待办事项 |
| `.aios-core/development/tasks/qa-create-fix-request.md` | `*create-fix-request {story}` | 为 @dev 生成修复请求文档 |

### 代理定义文件

| 文件 | 目的 |
|---------|-----------|
| `.aios-core/development/agents/qa.md` | QA 代理的完整定义 |
| `.claude/commands/AIOS/agents/qa.md` | Claude Code 命令用于激活 @qa |

### 工作流文件

| 文件 | 目的 |
|---------|-----------|
| `.aios-core/development/workflows/qa-loop.yaml` | QA 循环协调器(审查 -> 修复 -> 重新审查) |

---

## 命令到任务的映射

### 分析和审查命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*code-review {scope}` | (内部) | 执行自动审查 |
| `*review {story}` | `qa-review-story.md` | 完整故事审查 |

### 质量门命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*gate {story}` | `qa-gate.md` | 创建质量门决策 |
| `*nfr-assess {story}` | `qa-nfr-assess.md` | 验证非功能需求 |
| `*risk-profile {story}` | `qa-risk-profile.md` | 生成风险矩阵 |

### 测试策略命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*test-design {story}` | `qa-test-design.md` | 创建测试场景 |
| `*trace {story}` | `qa-trace-requirements.md` | 将需求映射到测试 |
| `*generate-tests` | `qa-generate-tests.md` | 自动生成测试 |
| `*run-tests` | `qa-run-tests.md` | 执行测试套件 |

### 待办事项命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*backlog-add` | `qa-backlog-add-followup.md` | 添加后续项到待办事项 |
| `*backlog-update {id} {status}` | (通过 po-manage-story-backlog) | 更新项目状态 |
| `*backlog-review` | (通过 po-manage-story-backlog) | 生成待办事项审查 |

### 实用工具命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*help` | (内部) | 显示所有命令 |
| `*session-info` | (内部) | 显示会话详情 |
| `*guide` | (内部) | 显示完整使用指南 |
| `*exit` | (内部) | 退出 QA 模式 |

---

## 故事审查的生命周期

### 前置条件

```yaml
Pre-conditions:
  - 故事状态: "审查"
  - 开发者完成所有任务
  - 故事中的文件列表已更新
  - 所有自动化测试通过
```

### 审查流程

审查流程包含以下步骤:
1. CodeRabbit 自动扫描
2. 手动审查(风险、NFR、测试设计、需求追踪)
3. 门决策(PASS、CONCERNS、FAIL、WAIVED)

### 问题严重性

| 严重性 | 前缀 | 操作 | 门影响 |
|------------|---------|------|-----------------|
| CRITICAL | `SEC-`、`DATA-` | 自动修复或阻止 | 门 = FAIL |
| HIGH | `PERF-`、`REL-` | 自动修复或文档化 | 门 = FAIL |
| MEDIUM | `MNT-`、`TEST-` | 技术债务问题 | 门 = CONCERNS |
| LOW | `DOC-`、`ARCH-` | 审查备注 | 门 = PASS |

### 门决策

| 决策 | 标准 |
|---------|----------|
| **PASS** | 所有验收标准满足，无高严重性问题，测试覆盖达到标准 |
| **CONCERNS** | 存在非阻止问题，应追踪和安排，可在意识前进 |
| **FAIL** | 验收标准未满足，存在高严重性问题，建议返回进行中 |
| **WAIVED** | 问题已明确接受，需要批准和理由，尽管已知问题继续进行 |

---

## CodeRabbit 集成

### 自我修复配置

```yaml
coderabbit_integration:
  enabled: true
  self_healing:
    type: full
    max_iterations: 3
    severity_filter:
      - CRITICAL
      - HIGH
    behavior:
      CRITICAL: auto_fix
      HIGH: auto_fix
      MEDIUM: document_as_debt
      LOW: ignore
```

### 流程

1. 运行 CodeRabbit CLI
2. 解析输出寻找 CRITICAL/HIGH
3. 尝试自动修复(最多 3 次)
4. 如果失败，需要手动干预
5. MEDIUM 问题文档化为技术债务

---

## 代理协作

### 与 @dev 的交互

1. @qa 执行 `*review {story}`
2. 发现关键问题
3. 创建 `*create-fix-request {story}`
4. @dev 接收 `QA_FIX_REQUEST.md`
5. @dev 执行 `*fix-qa-issues {story}`
6. @qa 重新审查

### 与 @po 的交互

1. @qa 在审查期间发现后续项
2. 使用 `*backlog-add` 添加项
3. 项目与源"QA 审查"一起追踪
4. @po 使用 `*backlog-prioritize` 优先级

---

## Git 限制

```yaml
git_restrictions:
  allowed_operations:
    - git status
    - git log
    - git diff
    - git branch -a

  blocked_operations:
    - git push
    - git commit
    - gh pr create
```

---

## 最佳实践

### 审查期间

1. 先运行 CodeRabbit - 让自动化找到明显问题
2. 评估风险 - 确定审查深度
3. 检查可追踪性 - 每个 AC 应有对应测试
4. 文档化重构 - 如果修改代码，解释原因和方法
5. 保持专注 - 仅更新 QA 结果部分

### 创建门

1. 使用正确的严重性 - 仅低/中/高
2. 理由决策 - 状态理由 1-2 句
3. 识别所有者 - 每个问题的 dev/sm/po
4. 定义过期 - 通常 2 周

### 避免

- 修改故事中超过 QA 结果的部分
- 无明确理由阻止
- 忽视中等问题(文档化为技术债务)
- 在 CodeRabbit 完成前审查
- 未检查测试覆盖就批准

---

## 总结

| 方面 | 详情 |
|---------|----------|
| **总核心任务** | 10 个主要任务文件 |
| **总辅助任务** | 9 个支持任务文件 |
| **主要工作流** | qa-loop.yaml(协调) |
| **审查命令** | 2 个(`*code-review`、`*review`) |
| **门命令** | 3 个(`*gate`、`*nfr-assess`、`*risk-profile`) |
| **测试命令** | 4 个(`*test-design`、`*trace`、`*generate-tests`、`*run-tests`) |
| **待办事项命令** | 3 个(`*backlog-*` 系列) |
| **门决策** | 4 个(PASS、CONCERNS、FAIL、WAIVED) |
| **严重性级别** | 3 个(低、中、高) |
| **自我修复最大** | 3 个迭代 |
| **CodeRabbit 集成** | 是(WSL 模式) |

---

## 更改日志

| 日期 | 作者 | 描述 |
|------|-------|-----------|
| 2026-02-04 | @qa | 创建初始文档，完整 Mermaid 图表 |

---

*-- Quinn，质量守护者*
