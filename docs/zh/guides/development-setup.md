# 开发设置指南

> **[EN](../../guides/development-setup.md)** | **[PT](../../pt/guides/development-setup.md)** | **[ES](../../es/guides/development-setup.md)** | **ZH**

---

为想要为 Synkra AIOS 项目做出贡献的开发者提供的完整指南。

**版本：** 1.0.0
**最后更新：** 2026-01-29

---

## 目录

1. [先决条件](#先决条件)
2. [Fork 和克隆](#fork-和克隆)
3. [环境设置](#环境设置)
4. [项目结构](#项目结构)
5. [运行测试](#运行测试)
6. [添加新代理](#添加新代理)
7. [创建新任务](#创建新任务)
8. [创建新工作流](#创建新工作流)
9. [代码标准](#代码标准)
10. [PR 和代码审查流程](#pr-和代码审查流程)
11. [调试和故障排除](#调试和故障排除)

---

## 先决条件

开始前，请确保已安装以下软件：

| 工具           | 最低版本 | 检查命令     | 目的         |
| -------------- | -------- | ------------ | ------------ |
| **Node.js**    | 18.0.0   | `node --version` | JavaScript 运行时 |
| **npm**        | 9.0.0    | `npm --version`  | 包管理器     |
| **Git**        | 2.30+    | `git --version`  | 版本控制     |
| **GitHub CLI** | 2.0+     | `gh --version`   | GitHub 操作  |

### 推荐工具

| 工具                 | 目的                                 |
| -------------------- | ------------------------------------ |
| **Claude Code**      | 与 AIOS 代理进行 AI 驱动的开发       |
| **VS Code / Cursor** | 带 AIOS 集成的 IDE                   |
| **Docker Desktop**   | MCP 服务器和容器化工具               |

### 安装先决条件

**macOS（Homebrew）：**

```bash
# 安装 Node.js
brew install node@18

# 安装 GitHub CLI
brew install gh

# 认证 GitHub CLI
gh auth login
```

**Windows（Chocolatey）：**

```bash
# 安装 Node.js
choco install nodejs-lts

# 安装 GitHub CLI
choco install gh

# 认证 GitHub CLI
gh auth login
```

**Linux（Ubuntu/Debian）：**

```bash
# 通过 NodeSource 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 GitHub CLI
sudo apt install gh

# 认证 GitHub CLI
gh auth login
```

---

## Fork 和克隆

### 第 1 步：Fork 仓库

1. 导航至 [github.com/SynkraAI/aios-core](https://github.com/SynkraAI/aios-core)
2. 点击右上角的 **Fork** 按钮
3. 选择您的 GitHub 账户作为目标

### 第 2 步：克隆您的 Fork

```bash
# 克隆您的 fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# 添加上游远程
git remote add upstream https://github.com/SynkraAI/aios-core.git

# 验证远程
git remote -v
```

### 第 3 步：保持更新

```bash
# 从上游获取最新更改
git fetch upstream

# 将上游 main 合并到本地 main
git checkout main
git merge upstream/main

# 推送到您的 fork
git push origin main
```

---

## 环境设置

### 第 1 步：安装依赖项

```bash
# 安装所有依赖项
npm install
```

### 第 2 步：环境变量

在项目根目录创建 `.env` 文件（此文件被 gitignored）：

```bash
# AI 提供商配置
ANTHROPIC_API_KEY=your-anthropic-api-key

# 可选：OpenAI 备选方案
OPENAI_API_KEY=your-openai-api-key

# 框架设置
NODE_ENV=development
AIOS_DEBUG=false

# 可选：MCP 配置
SYNKRA_API_TOKEN=your-synkra-token
```

### 第 3 步：验证安装

```bash
# 运行测试套件
npm test

# 检查 linting
npm run lint

# 检查 TypeScript
npm run typecheck

# 验证项目结构
npm run validate:structure
```

### 第 4 步：IDE 集成（可选）

将 AIOS 代理同步到您的 IDE：

```bash
# 同步到所有支持的 IDE
npm run sync:ide

# 同步到特定 IDE
npm run sync:ide:cursor

# 验证同步
npm run sync:ide:validate
```

---

## 代码标准

### ESLint 配置

项目使用 ESLint 9 及平面配置：

```bash
# 运行 linting
npm run lint

# 修复自动可修复的问题
npm run lint -- --fix
```

### TypeScript 配置

```bash
# 运行类型检查
npm run typecheck
```

### Prettier 格式化

```bash
# 格式化所有 Markdown 文件
npm run format
```

### 命名约定

| 类型       | 约定           | 示例                  |
| ---------- | -------------- | --------------------- |
| **文件**   | kebab-case     | `my-component.js`     |
| **类**     | PascalCase     | `MyComponent`         |
| **函数**   | camelCase      | `myFunction`          |
| **常量**   | UPPER_SNAKE    | `MAX_RETRIES`         |
| **代理**   | kebab-case     | `dev`、`qa`、`architect` |
| **任务**   | kebab-case     | `create-story`、`dev-build` |

### Commit 约定

使用 Conventional Commits：

```bash
# 功能
git commit -m "feat: add new agent validation"

# Bug 修复
git commit -m "fix: resolve task execution error"

# 文档
git commit -m "docs: update development guide"

# 维护
git commit -m "chore: update dependencies"

# 带范围
git commit -m "feat(agents): add data-engineer agent"
git commit -m "fix(tasks): handle missing input gracefully"
```

---

## 运行测试

### 测试命令

```bash
# 运行所有测试
npm test

# 在监视模式下运行测试
npm run test:watch

# 带覆盖率报告
npm run test:coverage

# 健康检查测试
npm run test:health-check
```

### 编写测试

**单元测试示例：**

```javascript
// tests/unit/example.test.js
const { describe, it, expect } = require('@jest/globals');

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle expected input', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });

    it('should throw on invalid input', () => {
      expect(() => myFunction(null)).toThrow('Invalid input');
    });
  });
});
```

---

## PR 和代码审查流程

### 步骤 1：创建特性分支

```bash
# 从 main 创建分支
git checkout main
git pull upstream main
git checkout -b feat/my-feature

# 或用于修复
git checkout -b fix/bug-description
```

### 步骤 2：运行质量检查

```bash
# 运行所有检查
npm test
npm run lint
npm run typecheck
```

### 步骤 3：提交并推送

```bash
# 暂存更改
git add -A

# 使用 conventional 消息提交
git commit -m "feat: implement my feature"

# 推送到您的 fork
git push origin feat/my-feature
```

---

## 调试和故障排除

### 启用调试模式

```bash
# 设置环境变量
export AIOS_DEBUG=true

# 用调试输出运行
npm test -- --verbose
```

### 常见问题

#### 问题：本地测试失败但 CI 中通过

**原因：** 环境差异或过时缓存

**解决方案：**

```bash
# 清除 Jest 缓存
npx jest --clearCache

# 清除 npm 缓存
npm cache clean --force

# 重新安装依赖项
rm -rf node_modules
npm install
```

#### 问题：拉取更改后 ESLint 出错

**原因：** ESLint 缓存过时

**解决方案：**

```bash
# 清除 ESLint 缓存
rm .eslintcache

# 再次运行 lint
npm run lint
```

---

_Synkra AIOS 开发设置指南 v1.0.0_
_最后更新：2026-01-29_
