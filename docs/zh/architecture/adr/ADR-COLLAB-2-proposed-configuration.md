<!-- 翻译: zh-CN | 原文: /docs/architecture/adr/ADR-COLLAB-2-proposed-configuration.md | 同步日期: 2026-02-22 -->

# ADR-COLLAB-2: 提议配置 - 外部贡献工作流

**Story:** COLLAB-1
**日期:** 2025-12-30
**状态:** 提议
**作者:** @devops (Gage) + @architect (Aria)

---

## 背景

在[当前状态审计](./ADR-COLLAB-1-current-state-audit.md)之后，本文档提议具体的配置更改，以启用对 AIOS 的安全外部贡献。

---

## 决策

实施多阶段配置更新，建立安全的外部贡献者工作流。

---

## 提议的配置

### 1. 分支保护规则

**目标:** `main` 分支

```yaml
# 提议的分支保护配置
branch_protection:
  main:
    # 状态检查（CI 必须通过）
    required_status_checks:
      strict: true # 分支必须是最新的
      contexts:
        - lint # 现有
        - typecheck # 现有
        - build # 现有
        - test # 添加 - 确保测试通过
        - validation-summary # 添加 - alls-green 模式

    # Pull request 审查
    required_pull_request_reviews:
      dismiss_stale_reviews: true # 现有
      require_code_owner_reviews: true # 从 false 更改
      require_last_push_approval: false # 为 OSS 保持 false
      required_approving_review_count: 1 # 从 0 更改

    # 管理员强制执行
    enforce_admins: false # 允许维护者紧急绕过

    # 推送限制
    allow_force_pushes: false # 现有
    allow_deletions: false # 现有
    block_creations: false # 保持 false

    # 对话解决
    required_conversation_resolution: true # 添加 - 所有反馈必须处理

    # 线性历史（可选）
    required_linear_history: false # 保持 false - 允许合并提交

    # 签名（可选）
    required_signatures: false # 暂时保持 false
```

**实施命令:**

```bash
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test","validation-summary"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null \
  -F required_conversation_resolution=true
```

---

### 2. CodeRabbit 配置

**文件:** `.coderabbit.yaml`（根目录）

```yaml
# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
# AIOS CodeRabbit 配置
# Story: COLLAB-1

language: 'en-US'
tone: professional
early_access: false

reviews:
  # 自动审查设置
  auto_review:
    enabled: true
    base_branches:
      - main
    drafts: false

  # 审查行为
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false

  # 按路径的审查指令
  path_instructions:
    # 代理定义 - 严格验证
    '.aios-core/development/agents/**':
      - '验证代理是否遵循 AIOS 代理 YAML 结构（persona_profile、commands、dependencies）'
      - '检查 persona_profile 是否包含 archetype、communication style 和 greeting_levels'
      - '验证所有列出的命令是否有对应的任务依赖'
      - '确保代理对命令有适当的可见性元数据'
      - '检查安全性：无硬编码凭据或敏感数据'

    # 任务定义
    '.aios-core/development/tasks/**':
      - '验证任务是否遵循 AIOS 任务格式，包含清晰的引导点'
      - '检查交付物是否定义明确'
      - '验证引用的依赖是否存在于代码库中'
      - '确保任务有适当的错误处理指导'

    # 工作流定义
    '.aios-core/development/workflows/**':
      - '验证工作流 YAML 结构是否有效'
      - '检查步骤顺序和依赖是否有逻辑意义'
      - '验证引用的代理和任务是否存在'

    # 模板文件
    '.aios-core/product/templates/**':
      - '确保模板遵循 AIOS 模板约定'
      - '检查占位符语法是否一致'
      - '验证模板生成有效输出'

    # CI/CD 配置
    '.github/**':
      - '审查安全影响'
      - '检查正确的 secrets 处理'
      - '验证工作流语法'
      - '确保与现有 CI 模式一致'

    # JavaScript/TypeScript 代码
    '**/*.js':
      - '检查 async/await 最佳实践'
      - '验证错误处理是否全面'
      - '查找潜在的安全漏洞'
      - '确保代码遵循 AIOS 编码标准'

    '**/*.ts':
      - '验证 TypeScript 类型是否正确定义'
      - "检查应更具体的 'any' 类型用法"
      - '确保导出正确类型化'

# PR 标题验证（Conventional Commits）
auto_title_instructions: |
  格式: "<type>(<scope>): <description>"

  Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
  Scope: 可选，表示受影响的区域（agent, task, workflow, ci, docs）
  Description: 简洁（<= 72 字符），祈使语气

  示例:
  - feat(agent): add KISS validation to data-engineer
  - fix(task): resolve elicitation timeout issue
  - docs: update external contribution guide

# 聊天设置
chat:
  auto_reply: true

# 工具配置
tools:
  # Linting 工具
  eslint:
    enabled: true
  markdownlint:
    enabled: true
  yamllint:
    enabled: true

  # 安全工具
  gitleaks:
    enabled: true

# 行为设置
abort_on_close: true
```

---

### 3. CODEOWNERS 配置

**文件:** `.github/CODEOWNERS`

```codeowners
# AIOS Code Owners
# Story: COLLAB-1
# 最后更新: 2025-12-30
#
# 格式: <pattern> <owners>
# 后面的模式优先于前面的
# 参见: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# ============================================
# 默认所有者（后备）
# ============================================
* @SynkraAI/maintainers

# ============================================
# 框架核心
# ============================================
# 代理定义 - 需要核心团队审查
.aios-core/development/agents/ @SynkraAI/core-team

# 任务定义 - 需要核心团队审查
.aios-core/development/tasks/ @SynkraAI/core-team

# 工作流定义 - 需要核心团队审查
.aios-core/development/workflows/ @SynkraAI/core-team

# 模板 - 需要架构师/核心团队审查
.aios-core/product/templates/ @SynkraAI/core-team
templates/ @SynkraAI/core-team

# 核心工具 - 需要高级审查
.aios-core/core/ @SynkraAI/core-team
.aios-core/cli/ @SynkraAI/core-team

# ============================================
# 基础设施
# ============================================
# CI/CD - 需要 devops 批准
.github/ @SynkraAI/devops

# Docker 配置
.docker/ @SynkraAI/devops

# 配置文件
.aios-core/core-config.yaml @SynkraAI/core-team
package.json @SynkraAI/maintainers
package-lock.json @SynkraAI/maintainers

# ============================================
# 文档（更宽松）
# ============================================
# 通用文档 - 维护者可批准
docs/ @SynkraAI/maintainers

# 架构决策 - 需要核心团队
docs/architecture/ @SynkraAI/core-team
docs/framework/ @SynkraAI/core-team

# Stories - 维护者（内部开发文档）
docs/stories/ @SynkraAI/maintainers

# 指南 - 维护者（对贡献者友好）
docs/guides/ @SynkraAI/maintainers

# ============================================
# 安全敏感文件
# ============================================
# 安全配置
.github/CODEOWNERS @SynkraAI/core-team
.github/workflows/semantic-release.yml @SynkraAI/devops
.github/workflows/npm-publish.yml @SynkraAI/devops

# 根配置文件
.env* @SynkraAI/core-team
*.config.js @SynkraAI/maintainers
```

**需要的 GitHub 团队:**

- `@SynkraAI/maintainers` - 通用维护者（写入权限）
- `@SynkraAI/core-team` - 框架核心开发者
- `@SynkraAI/devops` - CI/CD 和基础设施

---

### 4. 必需状态检查更新

**当前检查:** `lint`、`typecheck`、`build`

**提议的检查:**

| 检查 | 来源工作流 | 优先级 | 备注 |
| --- | --- | --- | --- |
| `lint` | ci.yml | 必需 | ESLint 验证 |
| `typecheck` | ci.yml | 必需 | TypeScript 检查 |
| `build` | ci.yml | 必需 | 构建验证 |
| `test` | ci.yml | 必需 | Jest 测试套件 |
| `validation-summary` | ci.yml | 必需 | alls-green 模式 |
| `story-validation` | ci.yml | 可选 | Story checkbox 验证 |

**注意:** ci.yml 中的 `validation-summary` job 作为 "alls-green" 模式，确保所有其他 job 都已通过。

---

### 5. PR 模板

**文件:** `.github/PULL_REQUEST_TEMPLATE/agent_contribution.md`

```markdown
## 代理贡献

### 代理信息

- **代理名称:**
- **代理 ID:**
- **代理类型:** (core | expansion | community)

### 所做更改

- [ ] 新代理定义
- [ ] 更新现有代理
- [ ] 添加新命令
- [ ] 新任务依赖

### 检查清单

#### 必需

- [ ] 代理遵循 AIOS 代理 YAML 结构
- [ ] `persona_profile` 完整（archetype、communication、greeting_levels）
- [ ] 所有命令都有对应的任务依赖
- [ ] 无硬编码凭据或敏感数据
- [ ] 已添加/更新测试（如适用）
- [ ] 已更新文档

#### 可选

- [ ] 已更新代理 README
- [ ] 已提供使用示例

### 测试

描述您如何测试这些更改：

### 相关 Issues

Fixes #

---

_提交此 PR，即表示我确认已阅读[贡献指南](../../../../CONTRIBUTING.md)_
```

**文件:** `.github/PULL_REQUEST_TEMPLATE/task_contribution.md`

```markdown
## 任务贡献

### 任务信息

- **任务名称:**
- **任务文件:**
- **相关代理:**

### 所做更改

- [ ] 新任务定义
- [ ] 更新现有任务
- [ ] 新引导点

### 检查清单

#### 必需

- [ ] 任务遵循 AIOS 任务格式
- [ ] 引导点清晰可操作
- [ ] 交付物定义明确
- [ ] 包含错误处理指导
- [ ] 引用的依赖存在

#### 可选

- [ ] 已提供工作流示例
- [ ] 已更新文档

### 测试

描述您如何测试此任务：

### 相关 Issues

Fixes #

---

_提交此 PR，即表示我确认已阅读[贡献指南](../../../../CONTRIBUTING.md)_
```

---

## 实施计划

### 第一阶段: 关键安全（第 1 天）

| 项目 | 操作 | 回滚 |
| --- | --- | --- |
| 必需审批 | 设置 count 为 1 | `gh api -X PUT ... required_approving_review_count:0` |
| Code owner 审查 | 启用 | `gh api -X PUT ... require_code_owner_reviews:false` |

**风险:** 低 - 这些是附加保护

### 第二阶段: 自动化审查（第 2-3 天）

| 项目 | 操作 | 回滚 |
| --- | --- | --- |
| CodeRabbit 配置 | 创建 `.coderabbit.yaml` | 删除文件 |
| 在功能 PR 上测试 | 打开测试 PR | N/A |
| 验证集成 | 检查 CodeRabbit 评论 | N/A |

**风险:** 低 - CodeRabbit 默认不阻塞

### 第三阶段: 文档（第 3-5 天）

| 项目 | 操作 | 回滚 |
| --- | --- | --- |
| CODEOWNERS | 更新粒度 | `git revert` |
| PR 模板 | 创建模板 | `git revert` |
| 外部指南 | 创建指南 | `git revert` |

**风险:** 非常低 - 仅文档

### 第四阶段: CI 强化（第 5-7 天）

| 项目 | 操作 | 回滚 |
| --- | --- | --- |
| 将 `test` 添加到必需 | 更新分支保护 | 从 contexts 中移除 |
| 对话解决 | 启用 | 禁用 |

**风险:** 中 - 如果测试不稳定可能阻塞合法 PR

---

## 回滚程序

### 紧急回滚（分支保护）

```bash
# 移除所有分支保护（仅紧急情况）
gh api -X DELETE repos/SynkraAI/aios-core/branches/main/protection

# 恢复最小保护
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":0}' \
  -F restrictions=null
```

### CodeRabbit 回滚

```bash
# 简单删除配置文件
rm .coderabbit.yaml
git add -A && git commit -m "chore: rollback CodeRabbit config"
git push
```

### CODEOWNERS 回滚

```bash
# 恢复简单所有权
echo "* @SynkraAI" > .github/CODEOWNERS
git add -A && git commit -m "chore: rollback CODEOWNERS"
git push
```

---

## 成功标准

| 指标 | 目标 | 测量方式 |
| --- | --- | --- |
| 所有 PR 需要批准 | 100% | 分支保护审计 |
| CodeRabbit 审查 PR | 100% | CodeRabbit 仪表板 |
| 无未授权合并 | 0 事件 | 安全审计 |
| 外部贡献者成功 | 1 周内第一个 PR | GitHub insights |
| 首次审查时间 | <24 小时 | PR 指标 |

---

## 后果

### 正面

- 安全的外部贡献工作流
- 使用 CodeRabbit 的自动化代码审查
- 使用 CODEOWNERS 的清晰所有权
- 使用模板的一致 PR 质量

### 负面

- 合并过程略慢（需要批准）
- 维护者可用性变得关键
- 新 CodeRabbit 反馈的学习曲线

### 中性

- 需要在 GitHub 组织中创建团队
- 需要定期维护 CODEOWNERS

---

## 相关文档

- [ADR-COLLAB-1-current-state-audit.md](./ADR-COLLAB-1-current-state-audit.md)
- [contribution-workflow-research.md](../contribution-workflow-research.md)

---

_配置设计作为 Story COLLAB-1 调查的一部分完成。_
