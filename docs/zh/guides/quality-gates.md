# AIOS 质量门控系统指南

> **[EN](../../guides/quality-gates.md)** | **[PT](../../pt/guides/quality-gates.md)** | **[ES](../../es/guides/quality-gates.md)** | **ZH**

---

Synkra AIOS 的 3 层质量门控系统综合指南。

**版本：** 2.1.0
**最后更新：** 2025-12-01

---

## 概述

AIOS 质量门控系统通过三个渐进式验证层提供自动化质量保证。每层在开发的适当阶段捕获不同类型的问题。

### 3 层架构

```
质量门控：
第 1 层：提交前     → 快速检查（30 秒）
第 2 层：PR 自动化  → AI 辅助（5 分钟）
第 3 层：人工审查   → 战略审查（可变）
```

| 层数        | 类型       | 速度    | 目的                        |
| ----------- | ---------- | ------- | --------------------------- |
| **第 1 层** | 自动化     | 30 秒   | 捕获语法、linting、类型错误 |
| **第 2 层** | AI 辅助   | 5 分钟  | 捕获逻辑、安全、模式问题    |
| **第 3 层** | 人工       | 可变    | 战略审查、签字认可          |

---

## 第 1 层：提交前检查

### 目的

快速的本地检查在代码提交之前运行。立即捕获明显的问题。

### 包含的检查

| 检查          | 工具          | 超时  | 描述                   |
| ------------- | ------------- | ----- | ---------------------- |
| **Lint**      | ESLint        | 60 秒 | 代码风格和最佳实践     |
| **Test**      | Jest          | 5 分钟| 单元测试和覆盖率       |
| **TypeCheck** | TypeScript    | 2 分钟| 静态类型验证           |

### 配置

```yaml
# .aios-core/core/quality-gates/quality-gate-config.yaml
layer1:
  enabled: true
  failFast: true
  checks:
    lint:
      enabled: true
      command: 'npm run lint'
      failOn: 'error'
      timeout: 60000
    test:
      enabled: true
      command: 'npm test'
      timeout: 300000
      coverage:
        enabled: true
        minimum: 80
    typecheck:
      enabled: true
      command: 'npm run typecheck'
      timeout: 120000
```

### 运行第 1 层

```bash
# 运行所有第 1 层检查
aios qa run --layer=1

# 运行特定检查
aios qa run --layer=1 --check=lint
aios qa run --layer=1 --check=test
aios qa run --layer=1 --check=typecheck

# 详细输出
aios qa run --layer=1 --verbose
```

### 预期输出

```
第 1 层：提交前检查
==========================

[1/3] Lint 检查
  运行：npm run lint
  ✓ 通过（12.3 秒）
  无警告或错误

[2/3] 测试检查
  运行：npm test
  ✓ 通过（45.2 秒）
  覆盖率：87.3%（最低：80%）

[3/3] TypeCheck
  运行：npm run typecheck
  ✓ 通过（28.1 秒）
  0 个错误

第 1 层 通过（85.6 秒）
```

---

## 第 2 层：PR 自动化

### 目的

在拉取请求上运行的 AI 辅助代码审查。捕获更深层的问题，如逻辑错误、安全漏洞和架构问题。

### 集成工具

| 工具            | 目的             | 阻塞严重级别 |
| --------------- | ---------------- | ------------ |
| **CodeRabbit**  | AI 代码审查      | CRITICAL     |
| **Quinn (@qa)** | 自动 QA 审查     | CRITICAL     |

### 配置

```yaml
# .aios-core/core/quality-gates/quality-gate-config.yaml
layer2:
  enabled: true
  coderabbit:
    enabled: true
    command: 'coderabbit --prompt-only -t uncommitted'
    timeout: 900000
    blockOn:
      - CRITICAL
    warnOn:
      - HIGH
    documentOn:
      - MEDIUM
    ignoreOn:
      - LOW
  quinn:
    enabled: true
    autoReview: true
    agentPath: '.claude/commands/AIOS/agents/qa.md'
    severity:
      block: ['CRITICAL']
      warn: ['HIGH', 'MEDIUM']
```

### 运行第 2 层

```bash
# 运行所有第 2 层检查
aios qa run --layer=2

# 仅运行 CodeRabbit
aios qa run --layer=2 --tool=coderabbit

# 运行 Quinn 审查
aios qa run --layer=2 --tool=quinn
```

### 严重级别

| 严重级别      | 操作           | 描述                                       |
| ------------- | -------------- | ------------------------------------------ |
| **CRITICAL**  | 阻塞           | 安全漏洞、数据丢失风险、破坏性变更         |
| **HIGH**      | 警告+记录      | 性能问题、缺少验证、反模式                 |
| **MEDIUM**    | 记录           | 代码味道、改进建议、次要风险               |
| **LOW**       | 忽略           | 风格偏好、次要优化                         |

### CodeRabbit 集成

CodeRabbit 执行 AI 驱动的代码审查，重点关注：

- 安全漏洞
- 性能问题
- 代码质量和可维护性
- 最佳实践违规
- 文档完整性

```bash
# 手动 CodeRabbit 运行
coderabbit --prompt-only -t uncommitted

# 带特定路径
coderabbit --files "src/**/*.js" --prompt-only
```

---

## 第 3 层：人工审查

### 目的

战略性人工审查以获得最终签字。确保满足业务需求和架构决定是否合理。

### 配置

```yaml
# .aios-core/core/quality-gates/quality-gate-config.yaml
layer3:
  enabled: true
  requireSignoff: true
  assignmentStrategy: 'auto'
  defaultReviewer: '@architect'
  checklist:
    enabled: true
    template: 'strategic-review-checklist'
    minItems: 5
  signoff:
    required: true
    expiry: 86400000
```

### 分配策略

| 策略            | 描述                               |
| --------------- | ---------------------------------- |
| **auto**        | 基于文件所有权和专业知识分配       |
| **manual**      | 手动分配审查者                     |
| **round-robin** | 轮流分配团队成员                   |

### 审查检查清单

战略审查检查清单确保审查者涵盖关键领域：

```markdown
## 战略审查检查清单

### 架构

- [ ] 更改与系统架构一致
- [ ] 未引入未授权依赖项
- [ ] 保持向后兼容性

### 安全

- [ ] 未暴露敏感数据
- [ ] 存在输入验证
- [ ] 身份验证/授权正确

### 质量

- [ ] 代码可维护性和可读性
- [ ] 测试全面
- [ ] 文档已更新

### 业务

- [ ] 满足验收标准
- [ ] 已考虑用户体验
- [ ] 性能可接受
```

### 签字流程

```bash
# 请求人工审查
aios qa request-review --pr=123

# 审查签字
aios qa signoff --pr=123 --reviewer="@architect"

# 检查签字状态
aios qa signoff-status --pr=123
```

---

## CLI 命令

### `aios qa run`

运行质量门控检查。

```bash
# 按顺序运行所有层
aios qa run

# 运行特定层
aios qa run --layer=1
aios qa run --layer=2
aios qa run --layer=3

# 带选项运行
aios qa run --verbose          # 详细输出
aios qa run --fail-fast        # 第一个失败时停止
aios qa run --continue-on-fail # 尽管失败仍继续
```

### `aios qa status`

检查当前质量门控状态。

```bash
# 获取总体状态
aios qa status

# 获取特定层的状态
aios qa status --layer=1

# 获取 PR 状态
aios qa status --pr=123
```

### `aios qa report`

生成质量门控报告。

```bash
# 生成报告
aios qa report

# 导出到文件
aios qa report --output=qa-report.json
aios qa report --format=markdown --output=qa-report.md
```

### `aios qa configure`

配置质量门控设置。

```bash
# 交互式配置
aios qa configure

# 设置特定选项
aios qa configure --layer1.coverage.minimum=90
aios qa configure --layer2.coderabbit.enabled=false
aios qa configure --layer3.requireSignoff=true
```

---

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  layer1:
    name: Layer 1 - Pre-commit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: aios qa run --layer=1

  layer2:
    name: Layer 2 - PR Automation
    needs: layer1
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: aios qa run --layer=2
        env:
          CODERABBIT_API_KEY: ${{ secrets.CODERABBIT_API_KEY }}

  layer3:
    name: Layer 3 - Human Review
    needs: layer2
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: aios qa request-review --pr=${{ github.event.pull_request.number }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - layer1
  - layer2
  - layer3

layer1:
  stage: layer1
  script:
    - npm ci
    - aios qa run --layer=1

layer2:
  stage: layer2
  script:
    - npm ci
    - aios qa run --layer=2
  needs:
    - layer1

layer3:
  stage: layer3
  script:
    - aios qa request-review
  needs:
    - layer2
  when: manual
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

aios qa run --layer=1 --fail-fast
```

---

## 故障排除

### 第 1 层失败

| 问题        | 解决方案                                  |
| ----------- | ----------------------------------------- |
| Lint 错误   | 运行 `npm run lint -- --fix` 自动修复     |
| 测试失败    | 检查测试输出，更新测试或修复代码          |
| TypeCheck   | 审查类型注解，修复类型不匹配              |
| 超时        | 增加配置中的超时或优化测试                |

### 第 2 层失败

| 问题           | 解决方案                      |
| -------------- | ----------------------------- |
| CodeRabbit 严重| 解决安全/破坏性变更问题      |
| CodeRabbit 超时| 检查网络，尝试手动运行        |
| Quinn 阻塞     | 审查 @qa 反馈，更新代码       |

### 第 3 层问题

| 问题           | 解决方案           |
| -------------- | ------------------ |
| 未分配审查者   | 在配置中设置默认审查者 |
| 签字已过期     | 请求新审查         |
| 检查清单未完整 | 完成所有必需项     |

---

_Synkra AIOS v4 质量门控系统指南_
