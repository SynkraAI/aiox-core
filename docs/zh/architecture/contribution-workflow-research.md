<!-- 翻译: ZH-CN | 原始: /docs/en/architecture/contribution-workflow-research.md | 同步: 2026-02-22 -->

# 外部贡献工作流研究

> 🌐 [EN](../../architecture/contribution-workflow-research.md) | [PT](../../pt/architecture/contribution-workflow-research.md) | **ZH**

---

**故事:** COLLAB-1
**日期:** 2025-12-30
**作者:** @dev (Dex) + @devops (Gage)
**状态:** 已完成

---

## 执行摘要

本文档汇总了开源项目外部贡献者工作流最佳实践的研究发现，特别是为了实现 AIOX 代理和任务的安全社区贡献。

---

## 1. GitHub 分支保护的最佳实践

### 1.1 行业建议

基于 [GitHub 官方文档](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)、[DEV 社区](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3) 和 [Legit Security](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following) 的研究:

| 保护规则                    | 建议              | 理由                                   |
| --------------------------- | ----------------- | -------------------------------------- |
| **强制拉取请求审查** | 启用 1-2 个审核者 | 防止未审核代码被合并                  |
| **要求代码所有者审查** | 启用              | 确保领域专家审查相关更改               |
| **退出过期审查** | 启用              | 在新更改后强制重新审查                 |
| **强制状态检查** | CI 必须通过       | 在合并前捕获构建/测试失败             |
| **要求解决对话** | 启用              | 确保所有反馈都得到解决                 |
| **限制强制推送** | 禁用强制推送      | 防止历史重写                           |
| **要求线性历史** | 可选              | 更干净的 git 历史（考虑用于 monorepos）|

### 1.2 主要见解

> "具有存储库写入权限的协作者对其所有文件和历史具有完全写入权限。虽然这有利于协作，但并非总是可取的。"

**关键点:** 分支保护是最重要的安全考虑之一。它可以防止不期望的代码进入生产环境。

### 1.3 开源推荐配置

```yaml
branch_protection:
  require_pull_request_reviews:
    required_approving_review_count: 1 # 至少 1 个批准
    dismiss_stale_reviews: true # 更改后重新审查
    require_code_owner_reviews: true # 领域专家批准
    require_last_push_approval: false # 开源可选

  required_status_checks:
    strict: true # 分支必须最新
    contexts:
      - lint
      - typecheck
      - build
      - test # 关键质量指标

  restrictions:
    users: []
    teams: ['maintainers']

  allow_force_pushes: false
  allow_deletions: false
  required_conversation_resolution: true # 解决所有反馈
```

---

## 2. CodeRabbit 配置最佳实践

### 2.1 官方文档

来自 [CodeRabbit 文档](https://docs.coderabbit.ai/getting-started/yaml-configuration) 和 [awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit):

**主要配置元素:**

| 元素                    | 目的                   | 建议                                |
| ----------------------- | ---------------------- | ----------------------------------- |
| `language`              | 响应语言               | 匹配项目语言 (pt-BR 或 en-US)      |
| `reviews.auto_review`   | PR 自动审查            | 为开源启用                          |
| `reviews.path_instructions` | 按路径自定义审查规则 | 对代理/任务验证至关重要            |
| `chat.auto_reply`       | 回复注释               | 为更好的贡献者体验启用              |

### 2.2 真实世界示例

**TEN 框架 (.coderabbit.yaml):**

```yaml
language: 'en-US'
reviews:
  profile: 'chill'
  high_level_summary: true
  auto_review:
    enabled: true
tools:
  ruff:
    enabled: true
  gitleaks:
    enabled: true
```

**PHARE 项目:**

```yaml
path_instructions:
  '**/*.cpp':
    - '检查内存泄漏'
    - '检查线程安全'
tools:
  shellcheck:
    enabled: true
  markdownlint:
    enabled: true
```

**NVIDIA NeMo RL:**

```yaml
auto_title_instructions: |
  格式: "<类别>: <标题>"
  类别: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  标题应 <= 80 个字符
```

### 2.3 AIOX 特定建议

对于代理/任务贡献，CodeRabbit 应验证:

1. **代理 YAML 结构** - persona_profile, commands, dependencies
2. **任务格式** - elicitation points, deliverables
3. **文档** - README 更新、指南引用
4. **安全** - 无硬编码密钥、适当权限

---

## 3. CODEOWNERS 最佳实践

### 3.1 行业模式

来自 [Harness 博客](https://www.harness.io/blog/mastering-codeowners)、[Satellytes](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/) 和 [GitHub 文档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners):

**主要原则:**

| 原则            | 描述                            |
| --------------- | ------------------------------- |
| **最后匹配胜出**| 后面的模式覆盖前面的模式       |
| **使用通配符** | 用 `*` 和 `**` 合并条目        |
| **团队优于用户**| 当人员变化时更容易维护         |
| **粒度**        | 在太宽泛和太具体之间平衡       |

### 3.2 Monorepo 模式

```codeowners
# 默认所有者（回退）
* @org/maintainers

# 目录所有权（更具体）
/src/auth/ @org/security-team
/src/api/ @org/backend-team
/src/ui/ @org/frontend-team

# 按文件类型所有权
*.sql @org/dba-team
Dockerfile @org/devops-team

# 关键文件（需要资深审查）
/.github/ @org/core-team
/security/ @org/security-team
```

### 3.3 AIOX 特定结构

```codeowners
# 默认 - 需要维护者审查
* @SynkraAI/maintainers

# 代理定义 - 需要核心团队审查
.aiox-core/development/agents/ @SynkraAI/core-team

# 任务定义 - 需要核心团队审查
.aiox-core/development/tasks/ @SynkraAI/core-team

# CI/CD - 需要 devops 批准
.github/ @SynkraAI/devops

# 文档 - 对贡献者更宽容
docs/ @SynkraAI/maintainers

# 模板 - 需要架构师审查
templates/ @SynkraAI/core-team
.aiox-core/product/templates/ @SynkraAI/core-team
```

---

## 4. GitHub Actions 必需检查

### 4.1 最佳实践

来自 [GitHub 文档](https://docs.github.com/articles/about-status-checks) 和社区讨论:

**关键见解:**

> "如果检查失败，GitHub 将阻止 PR 合并。但是，跳过的任务报告"成功"且不阻止合并。"

**解决方案模式 (alls-green 任务):**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    # ...

  test:
    runs-on: ubuntu-latest
    # ...

  alls-green:
    name: 所有检查通过
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: always()
    steps:
      - name: 检查所有任务是否通过
        run: |
          if [ "${{ needs.lint.result }}" != "success" ]; then exit 1; fi
          if [ "${{ needs.test.result }}" != "success" ]; then exit 1; fi
```

### 4.2 推荐的强制检查

| 检查            | 类型    | 优先级 |
| --------------- | ------- | ------ |
| `lint`          | 强制    | 高     |
| `typecheck`     | 强制    | 高     |
| `build`         | 强制    | 高     |
| `test`          | 强制    | 高     |
| `story-validation` | 可选 | 中     |
| `ide-sync-validation` | 可选 | 低    |
| `alls-green`    | 强制    | 高     |

---

## 5. 开源贡献工作流示例

### 5.1 Next.js

来自 [Next.js 贡献指南](https://nextjs.org/docs/community/contribution-guide):

- Fork 和 PR 工作流
- Prettier 格式化自动验证
- 需要维护者 PR 审查
- 使用 Turborepo 进行 monorepo 管理

### 5.2 Prisma

来自 [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md):

**主要要求:**

- 强制 CLA 签署
- 结构化提交消息
- 测试必须覆盖更改
- 监控捆绑大小 (<6MB)
- CI/CD 必须通过 (lint, test, cross-platform)

**工作流:**

1. 克隆存储库
2. 创建功能分支
3. 进行更改 + 测试
4. 提交带有描述的 PR
5. 签署 CLA
6. 等待审查

### 5.3 常见模式

| 模式               | 采用率              | 建议     |
| ------------------ | ------------------- | -------- |
| Fork 工作流        | 非常普遍            | 采用     |
| CLA 签署           | 企业开源中常见      | 暂时可选 |
| 常规提交           | 非常普遍            | 已采用   |
| 强制批准           | 通用                | 采用（1个批准）|
| CODEOWNERS         | 常见                | 采用（粒度化）|
| CodeRabbit/AI 审查 | 增长中              | 采用     |

---

## 6. 安全考虑

### 6.1 Fork 工作流 vs 直接分支

| 方面                | Fork 工作流       | 直接分支        |
| ------------------- | ------------------- | --------------- |
| **安全性**          | 更高（隔离）      | 更低（共享）   |
| **贡献者访问权**    | 不需要写入权      | 需要写入权     |
| **CI/CD**           | 在 fork 上下文运行 | 在主仓上下文    |
| **密钥**            | 受保护            | 可访问         |
| **复杂性**          | 稍微更复杂        | 更简单         |

**建议:** Fork 工作流用于外部贡献者（已在 CONTRIBUTING.md 中记录）

### 6.2 在 PR 中保护密钥

- 永远不要在 CI 日志中暴露密钥
- 谨慎使用 `pull_request_target`
- 限制密钥范围
- 审计 PR 作者的可疑模式

---

## 7. AIOX 建议

### 7.1 立即行动（关键）

1. **启用强制批准审查** (`required_approving_review_count: 1`)
2. **启用代码所有者审查** (`require_code_owner_reviews: true`)
3. **将 `test` 添加到强制状态检查**

### 7.2 短期行动（高）

1. **创建 `.coderabbit.yaml`** 带有 AIOX 特定路径说明
2. **更新 CODEOWNERS** 带有粒度所有权
3. **启用强制对话解决**

### 7.3 中期行动（中）

1. **为代理/任务贡献创建专门的 PR 模板**
2. **改进 CONTRIBUTING.md** 带有代理贡献检查表
3. **添加贡献者入职指南**

### 7.4 低优先级（好有）

1. **添加 CLA 机器人** 用于法律保护
2. **实现过期 PR 自动化**
3. **添加贡献指标仪表板**

---

## 8. 来源

### 分支保护

- [GitHub 文档: 管理分支保护规则](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [DEV 社区: 分支保护最佳实践](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3)
- [Legit Security: GitHub 安全最佳实践](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following)

### CodeRabbit

- [CodeRabbit YAML 配置](https://docs.coderabbit.ai/getting-started/yaml-configuration)
- [awesome-coderabbit 仓库](https://github.com/coderabbitai/awesome-coderabbit)
- [TEN 框架 .coderabbit.yaml](https://github.com/TEN-framework/ten-framework/blob/main/.coderabbit.yaml)

### CODEOWNERS

- [Harness: 掌握 CODEOWNERS](https://www.harness.io/blog/mastering-codeowners)
- [GitHub 文档: 关于代码所有者](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Satellytes: Monorepo CODEOWNERS](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/)

### GitHub Actions

- [GitHub 文档: 关于状态检查](https://docs.github.com/articles/about-status-checks)
- [GitHub 博客: 必需工作流](https://github.blog/enterprise-software/devops/introducing-required-workflows-and-configuration-variables-to-github-actions/)

### 开源示例

- [Next.js 贡献指南](https://nextjs.org/docs/community/contribution-guide)
- [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md)

---

_文档生成为 Story COLLAB-1 调查的一部分。_
