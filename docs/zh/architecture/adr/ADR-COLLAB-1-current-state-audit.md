<!-- 翻译: zh-CN | 原文: /docs/architecture/adr/ADR-COLLAB-1-current-state-audit.md | 同步日期: 2026-02-22 -->

# ADR-COLLAB-1: 当前状态审计 - 分支保护与贡献者工作流

**Story:** COLLAB-1
**日期:** 2025-12-30
**状态:** 已接受
**作者:** @devops (Gage)

---

## 背景

一位社区用户改进了 `@data-engineer` 代理。本审计记录当前的仓库安全配置，以识别可能允许未授权修改 main 分支的漏洞。

---

## 决策

审计以下当前状态：

1. 分支保护规则
2. GitHub Actions 工作流
3. CODEOWNERS 配置
4. 必需的状态检查

---

## 当前状态

### 1. 分支保护设置

**来源:** `gh api repos/SynkraAI/aios-core/branches/main/protection`

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "lint", "typecheck"]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false,
    "required_approving_review_count": 0
  },
  "required_signatures": {
    "enabled": false
  },
  "enforce_admins": {
    "enabled": false
  },
  "required_linear_history": {
    "enabled": false
  },
  "allow_force_pushes": {
    "enabled": false
  },
  "allow_deletions": {
    "enabled": false
  },
  "required_conversation_resolution": {
    "enabled": false
  }
}
```

### 2. 仓库设置

**来源:** `gh api repos/SynkraAI/aios-core`

```json
{
  "name": "aios-core",
  "default_branch": "main",
  "visibility": "public",
  "allow_forking": true,
  "has_discussions": true,
  "has_issues": true,
  "has_projects": true,
  "has_wiki": true
}
```

### 3. GitHub Actions 工作流

**来源:** `gh api repos/SynkraAI/aios-core/actions/workflows`

| 工作流 | 状态 | 路径 |
| --- | --- | --- |
| CI | 活跃 | .github/workflows/ci.yml |
| Test | 活跃 | .github/workflows/test.yml |
| PR Automation | 活跃 | .github/workflows/pr-automation.yml |
| PR Labeling | 活跃 | .github/workflows/pr-labeling.yml |
| Semantic Release | 活跃 | .github/workflows/semantic-release.yml |
| Release | 活跃 | .github/workflows/release.yml |
| NPM Publish | 活跃 | .github/workflows/npm-publish.yml |
| Welcome New Contributors | 活跃 | .github/workflows/welcome.yml |
| macOS Testing | 活跃 | .github/workflows/macos-testing.yml |
| Quarterly Gap Audit | 活跃 | .github/workflows/quarterly-gap-audit.yml |
| CodeQL | 活跃 | dynamic/github-code-scanning/codeql |

### 4. CODEOWNERS 配置

**来源:** `.github/CODEOWNERS`

```codeowners
* @SynkraAI
```

**分析:** 仅在组织级别单一所有权 - 无按路径的细粒度所有权。

### 5. CodeRabbit 配置

**状态:** `.coderabbit.yaml` 未找到

---

## 差距分析

### 严重级别 - 关键

| 配置 | 当前 | 预期 | 风险 |
| --- | --- | --- | --- |
| `required_approving_review_count` | **0** | **1** | 未审查的代码可被合并 |
| `require_code_owner_reviews` | **false** | **true** | 无领域专家验证 |

**影响:** 任何具有写入权限的协作者都可以在没有批准的情况下合并 PR，绕过代码审查。

### 严重级别 - 高

| 配置 | 当前 | 预期 | 风险 |
| --- | --- | --- | --- |
| CodeRabbit `.coderabbit.yaml` | 缺失 | 已配置 | 无自动化 AI 审查 |
| CODEOWNERS 粒度 | 组织级别 | 按路径指定 | 无专家路由 |

**影响:** 审查质量降低，对贡献者无自动化反馈。

### 严重级别 - 中

| 配置 | 当前 | 预期 | 风险 |
| --- | --- | --- | --- |
| 必需检查中的 `test` | 未要求 | 必需 | 测试可被跳过 |
| `required_conversation_resolution` | false | true | 反馈可被忽略 |
| 必需检查中的 `story-validation` | 未要求 | 可选 | Story 一致性未强制 |

**影响:** PR 可能在测试失败或反馈未处理的情况下被合并。

### 严重级别 - 低

| 配置 | 当前 | 预期 | 风险 |
| --- | --- | --- | --- |
| 必需签名 | false | 可选 | 提交真实性未验证 |
| 必需线性历史 | false | 可选 | 复杂的合并历史 |

**影响:** 轻微的可追溯性问题。

---

## 摘要表

| 类别 | 状态 | 需要的操作 |
| --- | --- | --- |
| 批准审查 | 关键 | 启用至少 1 个必需 |
| Code owner 审查 | 关键 | 启用 |
| CodeRabbit 配置 | 高 | 创建 |
| CODEOWNERS 细化 | 高 | 增强 |
| 检查中的 Test | 中 | 添加 |
| 对话解决 | 中 | 启用 |

---

## 风险评估

### 当前风险级别: 高

在 `required_approving_review_count: 0` 的情况下，任何协作者都可以：

1. 创建 PR
2. 无需任何审查立即合并
3. 绕过所有人工监督

这对于内部开发是可接受的，但**不建议用于外部贡献**。

### 缓解因素

- CI 流水线（`lint`、`typecheck`、`build`）是必需的
- 强制推送已禁用
- 分支删除已禁用
- 过期的审查会被驳回（当需要审查时）

---

## 建议

### 第一阶段: 立即（关键）

1. 设置 `required_approving_review_count: 1`
2. 设置 `require_code_owner_reviews: true`

**命令:**

```bash
gh api repos/SynkraAI/aios-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null
```

### 第二阶段: 短期（高）

1. 创建包含 AIOS 特定规则的 `.coderabbit.yaml`
2. 更新 CODEOWNERS 添加细粒度路径

### 第三阶段: 中期（中）

1. 将 `test` 添加到必需状态检查
2. 启用 `required_conversation_resolution`

---

## 审计产物

导出的配置保存在：

- `.aios/audit/branch-protection.json`
- `.aios/audit/repo-settings.json`

---

## 后果

### 正面

- 完整可见当前安全态势
- 明确的修复优先级
- 基于证据的建议

### 负面

- 审计揭示了显著的漏洞
- 需要立即采取行动以确保外部贡献安全

### 中性

- 现有 CI 流水线配置良好
- Fork 工作流已在 CONTRIBUTING.md 中记录

---

## 相关文档

- [contribution-workflow-research.md](../contribution-workflow-research.md)
- [ADR-COLLAB-2-proposed-configuration.md](./ADR-COLLAB-2-proposed-configuration.md)

---

_本审计作为 Story COLLAB-1 调查的一部分进行。_
