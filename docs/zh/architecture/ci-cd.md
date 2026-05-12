<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/ci-cd.md | 同步: 2026-02-22 -->

# CI/CD 架构

> 🌐 [EN](../../architecture/ci-cd.md) | [PT](../../pt/architecture/ci-cd.md) | **ZH** | [ES](../../es/architecture/ci-cd.md)

---

> 故事 6.1: GitHub Actions 成本优化

## 概述

AIOX-Core 使用 GitHub Actions 进行持续集成和部署。本文档描述了故事 6.1 中实现的优化工作流架构。

## 工作流层级

```text
┌─────────────────────────────────────────────────────────────────┐
│                        触发事件                                  │
├─────────────────────────────────────────────────────────────────┤
│  拉取请求 → ci.yml (必需) + pr-automation.yml (指标)              │
│  推送到 main → ci.yml + semantic-release.yml + test.yml         │
│              + cross-platform (ci.yml 中的条件)                 │
│  标签 v*   → release.yml → npm-publish.yml                      │
└─────────────────────────────────────────────────────────────────┘
```

**说明:** PR 仅执行 ci.yml 和 pr-automation.yml (~12 个作业)。扩展测试 (test.yml) 仅在推送到 main 时执行。

## 活跃工作流

| 工作流                | 目的                                  | 触发           | 关键 |
| --------------------- | ------------------------------------- | -------------- | ---- |
| `ci.yml`              | 主要 CI 验证 (lint、typecheck、test) | PR、push main  | 是   |
| `pr-automation.yml`   | 覆盖率报告和指标                      | 仅 PR          | 否   |
| `semantic-release.yml` | 自动版本化和 changelog                | 推送到 main    | 是   |
| `test.yml`            | 扩展测试 (安全、构建、集成)          | 仅 push main   | 否   |
| `macos-testing.yml`   | macOS 特定测试 (Intel + ARM)         | 按 path 过滤   | 否   |
| `release.yml`         | GitHub 发布创建                       | 标签 v\*       | 是   |
| `npm-publish.yml`     | 发布到 NPM                            | 发布已发布     | 是   |
| `pr-labeling.yml`     | 自动 PR 标签                          | PR 打开/同步   | 否   |
| `quarterly-gap-audit.yml` | 计划审计                           | Cron           | 否   |
| `welcome.yml`         | 欢迎新手贡献者                        | PR             | 否   |

## 优化策略

### 1. 并发控制

所有工作流使用并发组来避免重复执行:

```yaml
concurrency:
  group: <workflow>-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true  # 用于 CI 工作流
  # 或
  cancel-in-progress: false  # 用于发布/发布工作流
```

### 2. 路径过滤

工作流忽略仅文档更改的不必要执行:

```yaml
paths-ignore:
  - 'docs/**'
  - '*.md'
  - '.aiox/**'
  - 'squads/**'
  - 'LICENSE'
  - '.gitignore'
```

### 3. 条件跨平台测试

跨平台矩阵 (3 个操作系统 x 3 个 Node 版本 = 排除后 7 个作业) 仅在推送到 main 时执行:

```yaml
cross-platform:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
      node: ['18', '20', '22']
      exclude:
        - os: macos-latest
          node: '18' # isolated-vm 的 SIGSEGV
        - os: macos-latest
          node: '20' # isolated-vm 的 SIGSEGV
```

### 4. 统一验证

单一的真实来源用于验证:

- **ci.yml** 处理所有验证 (lint、typecheck、test)
- **semantic-release.yml** 依赖分支保护 (不需要重复的 CI)
- **pr-automation.yml** 仅关注指标/覆盖率

## 可计费分钟减少

| 前        | 后         | 节省 |
| --------- | ---------- | ---- |
| ~340 分钟/周 | ~85 分钟/周 | ~75% |

### 详细说明:

- 并发: 40% 减少 (取消过时的执行)
- 路径过滤: 30% 减少 (忽略仅文档 PR)
- 统一跨平台: 25% 减少 (7 对 16 个作业)
- 移除冗余工作流: 5% 减少

## 分支策略

所有工作流仅面向 `main` 分支:

- 无 `master` 或 `develop` 分支
- 功能分支 → 拉取请求到 main
- 通过 main 上的 semantic-release 发布

## 强制状态检查

用于 `main` 上的分支保护:

1. `CI / ESLint`
2. `CI / TypeScript Type Checking`
3. `CI / Jest Tests`
4. `CI / Validation Summary`

## 故障排除

### 工作流不执行?

1. 检查路径是否在 `paths-ignore` 中
2. 检查分支是否与触发条件匹配
3. 检查并发组 (可能已被取消)

### 发布未发布?

1. 检查 `NPM_TOKEN` secret 是否配置
2. 检查 semantic-release 配置
3. 检查常规 commit 格式

### macOS 测试失败?

- Node 18/20 在 macOS 上存在 isolated-vm 的 SIGSEGV 问题
- 仅 Node 22 在 macOS 上执行 (按设计)

## 相关文档

- [GitHub Actions 计费](https://docs.github.com/en/billing/managing-billing-for-github-actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
