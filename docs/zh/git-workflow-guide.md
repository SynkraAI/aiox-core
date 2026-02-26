# AIOS Git 工作流指南

> 🌐 [EN](../git-workflow-guide.md) | [PT](../pt/git-workflow-guide.md) | [ES](../es/git-workflow-guide.md)

---

_Story: 2.2-git-workflow-implementation.yaml_

## 目录

- [概述](#概述)
- [纵深防御架构](#纵深防御架构)
- [第一层：提交前验证](#第一层提交前验证)
- [第二层：推送前验证](#第二层推送前验证)
- [第三层：CI/CD 流程](#第三层cicd-流程)
- [分支保护](#分支保护)
- [日常工作流](#日常工作流)
- [故障排除](#故障排除)
- [性能提示](#性能提示)

## 概述

Synkra AIOS 实现了**纵深防御**验证策略，具有三个渐进式层级，可以提早发现问题并确保代码质量在合并之前。

### 为什么是三层？

1. **快速反馈** - 在开发过程中立即发现问题
2. **本地验证** - 基本检查不依赖云
3. **权威验证** - 合并前的最终门关
4. **故事一致性** - 确保开发与故事一致

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     开发工作流                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 层级 1：提交前钩子 (本地 - <5秒)                            │
│ ✓ ESLint (代码质量)                                         │
│ ✓ TypeScript (类型检查)                                     │
│ ✓ 缓存启用                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 层级 2：推送前钩子 (本地 - <2秒)                            │
│ ✓ 故事复选框验证                                            │
│ ✓ 状态一致性                                                │
│ ✓ 必需部分                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 层级 3：GitHub Actions CI (云 - 2-5分钟)                    │
│ ✓ 所有 lint/type 检查                                       │
│ ✓ 完整测试套件                                              │
│ ✓ 代码覆盖率 (≥80%)                                         │
│ ✓ 故事验证                                                  │
│ ✓ 分支保护                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ 准备合并     │
                      └──────────────┘
```

## 纵深防御架构

### 层级 1：提交前 (本地 - 快速)

**性能目标：** <5 秒
**触发器：** `git commit`
**位置：** `.husky/pre-commit`

**验证内容：**

- ESLint 代码质量
- TypeScript 类型检查
- 语法错误
- 导入问题

**工作原理：**

```bash
# 在提交时自动触发
git add .
git commit -m "feat: add feature"

# 运行：
# 1. ESLint with caching (.eslintcache)
# 2. TypeScript incremental compilation (.tsbuildinfo)
```

**好处：**

- ⚡ 快速反馈 (<5秒)
- 💾 缓存以获得速度
- 🔒 防止断裂代码提交
- 🚫 历史中没有无效语法

### 层级 2：推送前 (本地 - 故事验证)

**性能目标：** <2 秒
**触发器：** `git push`
**位置：** `.husky/pre-push`

**验证内容：**

- 故事复选框完成度与状态
- 需要的故事部分存在
- 状态一致性
- 开发代理记录

**工作原理：**

```bash
# 在推送时自动触发
git push origin feature/my-feature

# 验证 docs/stories/ 中的所有故事文件
```

**验证规则：**

1. **状态一致性：**

```yaml
# ❌ 无效：已完成但任务未完成
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # 错误！

# ✅ 有效：所有任务完成
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **必需部分：**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **状态流：**

```
ready → in progress → Ready for Review → completed
```

### 层级 3：CI/CD (云 - 权威)

**性能：** 2-5 分钟
**触发器：** 推送任何分支、创建 PR
**平台：** GitHub Actions
**位置：** `.github/workflows/ci.yml`

**作业：**

1. **ESLint** (`lint` 作业)
   - 在干净环境中运行
   - 不依赖缓存

2. **TypeScript** (`typecheck` 作业)
   - 完整类型检查
   - 无增量编译

3. **测试** (`test` 作业)
   - 完整测试套件
   - 覆盖率报告
   - 强制执行 80% 阈值

4. **故事验证** (`story-validation` 作业)
   - 所有故事验证
   - 状态一致性检查

5. **验证摘要** (`validation-summary` 作业)
   - 汇总所有结果
   - 如果任何失败则阻止合并

**性能监控：**

- 可选的性能作业
- 测量验证时间
- 仅供参考

## 层级 1：提交前验证

### 快速参考

```bash
# 手动验证
npm run lint
npm run typecheck

# 自动修复 lint 问题
npm run lint -- --fix

# 跳过钩子（不推荐）
git commit --no-verify
```

### ESLint 配置

**文件：** `.eslintrc.json`

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "cache": true,
  "cacheLocation": ".eslintcache"
}
```

**主要功能：**

- TypeScript 支持
- 缓存启用
- 警告 console.log
- 用 `_` 前缀忽略未使用的变量

### TypeScript 配置

**文件：** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**主要功能：**

- ES2022 目标
- 严格模式
- 增量编译
- CommonJS 模块

### 性能优化

**缓存文件：**

- `.eslintcache` - ESLint 结果
- `.tsbuildinfo` - TypeScript 增量数据

**首次运行：** ~10-15秒（无缓存）
**后续运行：** <5秒（缓存）

**缓存失效：**

- 配置更改
- 依赖更新
- 文件删除

## 层级 2：推送前验证

### 快速参考

```bash
# 手动验证
node .aios-core/utils/aios-validator.js pre-push
node .aios-core/utils/aios-validator.js stories

# 验证单个故事
node .aios-core/utils/aios-validator.js story docs/stories/1.1-story.yaml

# 跳过钩子（不推荐）
git push --no-verify
```

### 故事验证器

**位置：** `.aios-core/utils/aios-validator.js`

**功能：**

- 彩色终端输出
- 进度指示器
- 清晰的错误消息
- 潜在问题的警告

**示例输出：**

```
══════════════════════════════════════════════════════════
  故事验证: 2.2-git-workflow-implementation.yaml
══════════════════════════════════════════════════════════

故事: 2.2 - 带有多层验证的 Git 工作流
状态: in progress

进度: 12/15 任务 (80.0%)

✓ 故事验证通过，有警告

警告：
  • 考虑将状态更新为 'Ready for Review'
```

### 验证规则

#### 1. 复选框格式

支持的格式：

- `[x]` - 完成（小写）
- `[X]` - 完成（大写）
- `[ ]` - 未完成

无法识别的：

- `[o]`, `[*]`, `[-]` - 不计为完成

#### 2. 状态一致性

| 状态 | 规则 |
|------|------|
| `ready` | 不应检查任何任务 |
| `in progress` | 检查某些任务 |
| `Ready for Review` | 所有任务都已检查 |
| `completed` | 所有任务都已检查 |

#### 3. 必需部分

所有故事必须具有：

```yaml
id: "X.X"
title: "故事标题"
description: "故事描述"
status: "ready" | "in progress" | "Ready for Review" | "completed"
acceptance_criteria:
  - name: "标准"
    tasks:
      - "[ ] 任务"
```

#### 4. 开发代理记录

推荐但非必需：

```yaml
dev_agent_record:
  agent_model: 'claude-sonnet-4-5'
  implementation_date: '2025-01-23'
```

缺少时出现警告。

### 错误消息

**缺少必需的部分：**

```
✗ 缺少必需的部分: description, acceptance_criteria
```

**状态不一致：**

```
✗ 故事标记为已完成，但仅 12/15 个任务已检查
```

**不存在的文件：**

```
✗ 找不到故事文件: docs/stories/missing.yaml
```

## 层级 3：CI/CD 流程

### 工作流结构

**文件：** `.github/workflows/ci.yml`

**作业：**

1. **lint** - ESLint 验证
2. **typecheck** - TypeScript 检查
3. **test** - Jest 测试和覆盖率
4. **story-validation** - 故事一致性
5. **validation-summary** - 汇总结果
6. **performance** (可选) - 性能指标

### 作业详情

#### ESLint 作业

```yaml
- name: Run ESLint
  run: npm run lint
```

- 在 Ubuntu 最新版本上运行
- 超时：5 分钟
- 使用 npm 缓存
- 任何 lint 错误都会失败

#### TypeScript 作业

```yaml
- name: Run TypeScript type checking
  run: npm run typecheck
```

- 在 Ubuntu 最新版本上运行
- 超时：5 分钟
- 类型错误时失败

#### 测试作业

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
```

- 在 Ubuntu 最新版本上运行
- 超时：10 分钟
- 将覆盖率上传到 Codecov
- 强制执行 80% 覆盖率阈值

#### 故事验证作业

```yaml
- name: Validate story checkboxes
  run: node .aios-core/utils/aios-validator.js stories
```

- 在 Ubuntu 最新版本上运行
- 超时：5 分钟
- 验证所有故事

#### 验证摘要作业

```yaml
needs: [lint, typecheck, test, story-validation]
if: always()
```

- 所有验证后运行
- 检查所有作业状态
- 如果任何验证失败则失败
- 提供摘要

### CI 触发器

**推送事件：**

- `master` 分支
- `develop` 分支
- `feature/**` 分支
- `bugfix/**` 分支

**拉取请求事件：**

- 对 `master`
- 对 `develop`

### 查看 CI 结果

```bash
# 查看 PR 检查
gh pr checks

# 查看工作流运行
gh run list

# 查看特定运行
gh run view <run-id>

# 重新运行失败的作业
gh run rerun <run-id>
```

## 分支保护

### 设置

```bash
# 运行设置脚本
node scripts/setup-branch-protection.js

# 查看当前保护
node scripts/setup-branch-protection.js --status
```

### 需求

- 已安装 GitHub CLI (`gh`)
- 使用 GitHub 进行身份验证
- 对存储库具有管理员访问权限

### 保护规则

**主分支保护：**

1. **必需的状态检查：**
   - ESLint
   - TypeScript 类型检查
   - Jest 测试
   - 故事复选框验证

2. **拉取请求审查：**
   - 需要 1 次批准
   - 关闭新提交中的陈旧审查

3. **其他规则：**
   - 线性历史强制执行（仅 rebase）
   - 强制推送被阻止
   - 分支删除被阻止
   - 规则适用于管理员

### 手动配置

通过 GitHub CLI：

```bash
# 设置必需的状态检查
gh api repos/OWNER/REPO/branches/master/protection/required_status_checks \
  -X PUT \
  -f strict=true \
  -f contexts[]="ESLint" \
  -f contexts[]="TypeScript Type Checking"

# 需要 PR 审查
gh api repos/OWNER/REPO/branches/master/protection/required_pull_request_reviews \
  -X PUT \
  -f required_approving_review_count=1

# 阻止强制推送
gh api repos/OWNER/REPO/branches/master/protection/allow_force_pushes \
  -X DELETE
```

## 日常工作流

### 开始新功能

```bash
# 1. 更新 master
git checkout master
git pull origin master

# 2. 创建功能分支
git checkout -b feature/my-feature

# 3. 进行更改
# ... 编辑文件 ...

# 4. 提交（触发提交前钩子）
git add .
git commit -m "feat: add my feature [Story X.X]"

# 5. 推送（触发推送前钩子）
git push origin feature/my-feature

# 6. 创建 PR
gh pr create --title "feat: Add my feature" --body "Description"
```

### 更新故事

```bash
# 1. 打开故事文件
code docs/stories/X.X-story.yaml

# 2. 标记任务完成
# 更改: - "[ ] Task"
# 为:   - "[x] Task"

# 3. 如果需要更新状态
# 更改: status: "in progress"
# 为:   status: "Ready for Review"

# 4. 提交故事更新
git add docs/stories/X.X-story.yaml
git commit -m "docs: update story X.X progress"

# 5. 推送（验证故事）
git push
```

### 修复验证失败

**ESLint 错误：**

```bash
# 自动修复问题
npm run lint -- --fix

# 检查剩余问题
npm run lint

# 提交修复
git add .
git commit -m "style: fix lint issues"
```

**TypeScript 错误：**

```bash
# 查看所有错误
npm run typecheck

# 在代码中修复错误
# ... 编辑文件 ...

# 验证修复
npm run typecheck

# 提交修复
git add .
git commit -m "fix: resolve type errors"
```

**故事验证错误：**

```bash
# 检查故事
node .aios-core/utils/aios-validator.js stories

# 修复故事文件
code docs/stories/X.X-story.yaml

# 验证修复
node .aios-core/utils/aios-validator.js story docs/stories/X.X-story.yaml

# 提交修复
git add docs/stories/
git commit -m "docs: fix story validation"
```

**测试失败：**

```bash
# 运行测试
npm test

# 运行特定测试
npm test -- path/to/test.js

# 修复失败的测试
# ... 编辑测试文件 ...

# 运行覆盖率
npm run test:coverage

# 提交修复
git add .
git commit -m "test: fix failing tests"
```

### 合并拉取请求

```bash
# 1. 确保 CI 通过
gh pr checks

# 2. 获得批准
# （等待团队成员审查）

# 3. 合并（squash）
gh pr merge --squash --delete-branch

# 4. 更新本地 master
git checkout master
git pull origin master
```

## 故障排除

### 钩子未运行

**症状：** 提交成功但未进行验证

**解决方案：**

1. 检查 Husky 安装：

```bash
npm run prepare
```

2. 验证钩子文件存在：

```bash
ls -la .husky/pre-commit
ls -la .husky/pre-push
```

3. 检查文件权限 (Unix)：

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### 提交前钩子速度缓慢

**症状：** 提交前钩子花费 >10 秒

**解决方案：**

1. 清除缓存：

```bash
rm .eslintcache .tsbuildinfo
git commit  # 重建缓存
```

2. 检查文件更改：

```bash
git status
# 一次提交较少的文件
```

3. 更新依赖：

```bash
npm update
```

### 故事验证失败

**症状：** 推送前失败，显示故事错误

**常见问题：**

1. **复选框不匹配：**

```yaml
# 错误：完成状态但任务未完成
status: 'completed'
tasks:
  - '[x] Task 1'
  - '[ ] Task 2' # ← 修复此项

# 解决方案：完成所有任务或更改状态
```

2. **缺少部分：**

```yaml
# 错误：缺少必需的部分
id: '1.1'
title: 'Story'
# 缺少: description, acceptance_criteria, status

# 解决方案：添加缺少的部分
```

3. **无效的 YAML：**

```yaml
# 错误：无效的 YAML 语法
tasks:
  - "[ ] Task 1
  - "[ ] Task 2"  # ← 上面缺少结束引号

# 解决方案：修复 YAML 语法
```

### CI 失败但本地通过

**症状：** CI 失败但所有本地验证通过

**常见原因：**

1. **缓存差异：**

```bash
# 清除本地缓存
rm -rf node_modules .eslintcache .tsbuildinfo coverage/
npm ci
npm test
```

2. **环境差异：**

```bash
# 使用与 CI 相同的 Node 版本 (18)
nvm use 18
npm test
```

3. **未提交的文件：**

```bash
# 检查未提交的更改
git status

# 如果需要隐藏
git stash
```

### 分支保护阻止合并

**症状：** 无法合并 PR，即使有批准

**检查：**

1. **需要的检查通过：**

```bash
gh pr checks
# 所有必须显示 ✓
```

2. **需要的批准：**

```bash
gh pr view
# 检查"审查者"部分
```

3. **分支是最新的：**

```bash
# 更新分支
git checkout feature-branch
git rebase master
git push --force-with-lease
```

## 性能提示

### 缓存管理

**保留缓存：**

- `.eslintcache` - ESLint 结果
- `.tsbuildinfo` - TypeScript 构建信息
- `coverage/` - 测试覆盖率数据

**提交到 .gitignore：**

```gitignore
.eslintcache
.tsbuildinfo
coverage/
```

### 增量开发

**最佳实践：**

1. **小提交：**
   - 更少的文件 = 更快的验证
   - 更容易调试失败

2. **在开发期间进行测试：**

```bash
# 在提交前手动运行验证
npm run lint
npm run typecheck
npm test
```

3. **立即修复问题：**
   - 不要让问题堆积
   - 在上下文中更容易修复

### CI 优化

**工作流优化：**

1. **并行作业** - 所有验证并行运行
2. **作业超时** - 在挂起时快速失败
3. **缓存** - npm 依赖被缓存
4. **条件作业** - 性能作业仅在 PR 上

### 故事验证性能

**当前性能：**

- 单个故事：<100ms
- 所有故事：<2秒（典型）

**优化提示：**

1. **保持故事专注** - 每个故事一个功能
2. **限制任务数** - 将大故事分解为较小的故事
3. **有效的 YAML** - 解析错误会减慢验证

## 高级主题

### 跳过验证

**适当时机：**

- 紧急修复
- 仅文档更改
- CI 配置更改

**如何跳过：**

```bash
# 跳过提交前
git commit --no-verify

# 跳过推送前
git push --no-verify

# 跳过 CI（不推荐）
# 将 [skip ci] 添加到提交消息
git commit -m "docs: update [skip ci]"
```

**警告：** 仅在绝对必要时跳过。跳过的验证不会发现问题。

### 自定义验证

**添加自定义验证器：**

1. **创建验证器函数：**

```javascript
// .aios-core/utils/custom-validator.js
module.exports = async function validateCustom() {
  // 您的验证逻辑
  return { success: true, errors: [] };
};
```

2. **添加到钩子：**

```bash
# .husky/pre-commit
node .aios-core/utils/aios-validator.js pre-commit
node .aios-core/utils/custom-validator.js
```

3. **添加到 CI：**

```yaml
# .github/workflows/ci.yml
- name: Custom validation
  run: node .aios-core/utils/custom-validator.js
```

### Monorepo 支持

**对于 monorepos：**

1. **限制验证范围：**

```javascript
// 仅验证更改的包
const changedFiles = execSync('git diff --name-only HEAD~1').toString();
const packages = getAffectedPackages(changedFiles);
```

2. **并行包验证：**

```yaml
strategy:
  matrix:
    package: [package-a, package-b, package-c]
```

## 参考

- **AIOS 验证器：** [.aios-core/utils/aios-validator.js](../.aios-core/utils/aios-validator.js)
- **CI 工作流：** [.github/workflows/ci.yml](../.github/workflows/ci.yml)

---

**有疑问？有问题吗？**

- [打开问题](https://github.com/SynkraAI/aios-core/issues)
- [加入 Discord](https://discord.gg/gk8jAdXWmj)
