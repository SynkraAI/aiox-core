# 权限模式指南

> 控制AIOX代理对您系统的自主权。

---

## 概述

权限模式让您控制AIOX代理拥有的自主权级别。无论您是探索新代码库还是运行完全自主的构建，都有适合您工作流的模式。

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 探索         │  ⚠️ 询问         │  ⚡ 自动           │
│  安全浏览        │  确认更改        │  完全自主         │
├─────────────────────────────────────────────────────────────┤
│  读取: ✅        │  读取: ✅        │  读取: ✅         │
│  写入: ❌        │  写入: ⚠️确认    │  写入: ✅         │
│  执行: ❌        │  执行: ⚠️确认    │  执行: ✅         │
│  删除: ❌        │  删除: ⚠️确认    │  删除: ✅         │
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

```bash
# 检查当前模式
*mode

# 切换到探索模式（安全）
*mode explore

# 切换到询问模式（均衡-默认）
*mode ask

# 切换到自动模式（狂野）
*mode auto
# 或
*yolo
```

---

## 模式说明

### 🔍 探索模式

**最适合:** 首次探索、学习代码库、只读审计

```
*mode explore
```

在探索模式中:

- ✅ 读取任何文件
- ✅ 搜索代码库
- ✅ 运行只读命令（git status、ls等）
- ❌ 无法写入或编辑文件
- ❌ 无法运行潜在破坏性命令
- ❌ 无法执行构建/部署操作

**示例阻止的操作:**

- `Write` / `Edit` 工具
- `git push`, `git commit`
- `npm install`
- `rm`, `mv`, `mkdir`

---

### ⚠️ 询问模式（默认）

**最适合:** 日常开发、安全性和生产力的平衡

```
*mode ask
```

在询问模式中:

- ✅ 读取任何文件
- ⚠️ 写入操作需要确认
- ⚠️ 执行操作需要确认
- ⚠️ 破坏性操作需要明确批准

**确认流程:**

```
⚠️ 需要确认

操作: 写入
工具: 编辑

文件: `src/components/Button.tsx`

[继续] [跳过] [切换到自动]
```

---

### ⚡ 自动模式

**最适合:** 高级用户、自主构建、信任的工作流

```
*mode auto
# 或
*yolo
```

在自动模式中:

- ✅ 完整读取访问权限
- ✅ 完整写入访问权限
- ✅ 完整执行访问权限
- ✅ 无需确认

**警告:** 谨慎使用。代理可以修改和删除文件而不询问。

---

## 模式指示器

您的当前模式始终在代理问候语中可见:

```
🏛️ Aria (架构师) 已准备好！[⚠️ 询问]

快速命令:
...
```

徽章显示:

- `[🔍 探索]` - 只读模式
- `[⚠️ 询问]` - 确认模式（默认）
- `[⚡ 自动]` - 完全自主模式

---

## 配置

模式持久化在`.aiox/config.yaml`:

```yaml
permissions:
  mode: ask # explore | ask | auto
```

---

## 操作分类

系统将操作分为4种类型:

| 类型 | 示例 |
|------|------|
| **读取** | `Read`、`Glob`、`Grep`、`git status`、`ls` |
| **写入** | `Write`、`Edit`、`mkdir`、`touch`、`git commit` |
| **执行** | `npm install`、`npm run`、任务执行 |
| **删除** | `rm`、`git reset --hard`、`DROP TABLE` |

### 安全命令（始终允许）

这些命令即使在探索模式下也始终允许:

```bash
# Git（只读）
git status, git log, git diff, git branch

# 文件系统（只读）
ls, pwd, cat, head, tail, wc, find, grep

# 包信息
npm list, npm outdated, npm audit

# 系统信息
node --version, npm --version, uname, whoami
```

### 破坏性命令（额外谨慎）

这些触发删除分类，即使在询问模式下也需要明确批准:

```bash
rm -rf
git reset --hard
git push --force
DROP TABLE
DELETE FROM
TRUNCATE
```

---

## ADE集成

自主开发引擎(ADE)尊重权限模式:

| 模式 | ADE行为 |
|------|---------|
| **探索** | 仅规划，无执行 |
| **询问** | 批量操作待批准 |
| **自动** | 完全自主执行 |

### 询问模式中的批量批准

运行自主工作流时，操作被分组:

```
⚠️ 批量确认

以下5个操作将被执行:
- 写入: 创建 src/components/NewFeature.tsx
- 写入: 更新 src/index.ts
- 执行: npm install lodash
- 写入: 添加 tests/newFeature.test.ts
- 执行: npm test

[全部批准] [逐个审查] [取消]
```

---

## 最佳实践

### 对于新用户

1. 从`*mode explore`开始安全浏览
2. 准备好进行更改时切换到`*mode ask`
3. 仅在确信时使用`*mode auto`

### 对于CI/CD

在自动化中设置模式:

```yaml
# .github/workflows/aiox.yml
- name: 运行AIOX
  run: |
    echo "permissions:\n  mode: auto" > .aiox/config.yaml
    aiox run build
```

### 对于团队

- 在共享环境中默认使用`ask`模式
- 在代码审查中使用`explore`
- 为指定的自动化帐户保留`auto`

---

## 故障排除

### "在探索模式中操作被阻止"

切换到限制较少的模式:

```
*mode ask
```

### 模式不持久化

检查`.aiox/config.yaml`存在且可写:

```bash
ls -la .aiox/config.yaml
```

### 确认过于频繁

切换到自动模式:

```
*mode auto
```

或在ADE工作流中使用批量批准。

---

## API参考

```javascript
const { PermissionMode, OperationGuard } = require('./.aiox-core/core/permissions');

// 加载当前模式
const mode = new PermissionMode();
await mode.load();
console.log(mode.currentMode); // 'ask'
console.log(mode.getBadge()); // '[⚠️ 询问]'

// 更改模式
await mode.setMode('auto');

// 检查操作
const guard = new OperationGuard(mode);
const result = await guard.guard('Bash', { command: 'rm -rf node_modules' });
// { proceed: false, needsConfirmation: true, operation: 'delete', ... }
```

---

_权限模式 - 受 [Craft Agents OSS](https://github.com/lukilabs/craft-agents-oss) 启发_
