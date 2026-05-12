<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/tech-stack.md | 同步: 2026-02-22 -->

# AIOX 技术栈

> 🌐 [EN](../../architecture/tech-stack.md) | [PT](../../pt/architecture/tech-stack.md) | **ZH** | [ES](../../es/architecture/tech-stack.md)

---

> ⚠️ **已弃用**: 本文件仅为向后兼容性而维护。
>
> **官方版本:** [docs/framework/tech-stack.md](../framework/tech-stack.md)
>
> 本文件将在 2026 Q2 完成 `docs/framework/` 整合后移除。

---

# AIOX 技术栈

**版本:** 1.1
**最后更新:** 2025-12-14
**状态:** 已弃用 - 参见 docs/framework/tech-stack.md
**迁移通知:** 本文档将在 2026 Q2 迁移到 `SynkraAI/aiox-core` 仓库 (参见决策 005)

---

## 📋 目录

- [概述](#概述)
- [核心运行时](#核心运行时)
- [语言和转译器](#语言和转译器)
- [核心依赖](#核心依赖)
- [开发工具](#开发工具)
- [测试框架](#测试框架)
- [构建和部署](#构建和部署)
- [外部集成](#外部集成)
- [迁移后的未来栈](#迁移后的未来栈)

---

## 概述

AIOX 构建在现代 JavaScript/TypeScript 和 Node.js 运行时上，优化用于开发具有交互式 UX 和代理编排功能的跨平台 CLI。

**理念:**

- 尽可能使用**成熟技术** (经过验证和稳定的依赖)
- 仅在必要时选择**创新技术** (性能、DX 改进)
- 最小化依赖 (降低供应链风险)
- 优先跨平台 (Windows、macOS、Linux)

---

## 核心运行时

### Node.js

```yaml
版本: 18.0.0+
LTS: 是 (LTS 有效期至 2025 年 4 月)
原因: 稳定的 async/await 支持、fetch API、ES2022
```

**为什么选择 Node.js 18+:**

- ✅ 原生 `fetch()` API (无需 axios/node-fetch)
- ✅ 对 ES2022 模块的支持 (顶级 await)
- ✅ V8 10.2+ (性能改进)
- ✅ 活跃的 LTS 支持 (安全补丁)
- ✅ 跨平台 (Windows/macOS/Linux)

**包管理器:**

```yaml
主要: npm 9.0.0+
备选: yarn/pnpm (用户选择)
锁定文件: package-lock.json
```

---

## 语言和转译器

### JavaScript (主要)

```yaml
标准: ES2022
模块系统: CommonJS (require/module.exports)
未来: 计划迁移到 ESM (故事 6.2.x)
```

**为什么选择 ES2022:**

- ✅ 类字段和私有方法
- ✅ 顶级 await
- ✅ 错误 cause
- ✅ 数组 Array.at() 方法
- ✅ Object.hasOwn()

### TypeScript (类型定义)

```yaml
版本: 5.9.3
用途: 仅类型定义 (.d.ts 文件)
编译: 不使用 (纯 JS 运行时)
未来: 考虑完全迁移到 TypeScript (Q2 2026)
```

**当前的 TypeScript 用途:**

```typescript
// index.d.ts - API 公开的类型定义
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**TypeScript 配置:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## 核心依赖

### CLI 和交互式 UX

#### @clack/prompts (^0.11.0)

**目的:** 现代化的 CLI 提示，具有优雅的 UX
**用途:** 交互式向导、用户输入收集
**优势:** 世界级的 UX、微调动画、进度条

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: '选择代理:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**目的:** 终端字符串样式化
**用途:** 彩色输出、格式化
**优势:** 跨平台、零依赖、API 稳定

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ 代理激活成功'));
console.log(chalk.red('❌ 任务失败'));
```

#### picocolors (^1.1.1)

**目的:** 轻量级颜色库 (比 chalk 更快的替代品)
**用途:** 性能关键的彩色输出
**优势:** 比 chalk 小 14 倍，快 2 倍

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ 快速输出'));
```

#### ora (^5.4.1)

**目的:** 终端加载动画
**用途:** 加载指示器、异步操作
**优势:** 美观的加载动画、可定制、广泛使用

```javascript
const ora = require('ora');
const spinner = ora('加载代理中...').start();
await loadAgent();
spinner.succeed('代理已加载');
```

### 文件系统和路径操作

#### fs-extra (^11.3.2)

**目的:** 改进的文件系统操作
**用途:** 文件复制、目录创建、JSON 读/写
**优势:** 基于 Promise、相对于原生 `fs` 的额外工具

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**目的:** 文件模式匹配
**用途:** 按模式查找文件 (例: `*.md`、`**/*.yaml`)
**优势:** 快速、支持 gitignore 模式

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### YAML 处理

#### yaml (^2.8.1)

**目的:** YAML 解析和序列化
**用途:** 代理配置、工作流、模板
**优势:** 快速、符合规范、保留注释

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**目的:** 替代 YAML 解析器 (旧版支持)
**用途:** 解析旧的 YAML 文件
**优势:** API 不同、用于旧代码

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**迁移说明:** 整合为单个 YAML 库 (故事 6.2.x)

### Markdown 处理

#### @kayvan/markdown-tree-parser (^1.5.0)

**目的:** 将 markdown 解析为 AST
**用途:** 故事解析、文档结构分析
**优势:** 轻量级、快速、支持 GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### 流程执行

#### execa (^9.6.0)

**目的:** 改进的 child_process
**用途:** 执行 git、npm、外部 CLI 工具
**优势:** 跨平台、基于 Promise、更好的错误处理

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### 命令行解析

#### commander (^14.0.1)

**目的:** CLI 框架
**用途:** 命令行参数解析、子命令
**优势:** 行业标准、功能丰富、TypeScript 支持

```javascript
const { Command } = require('commander');
const program = new Command();

program
  .command('agent <name>')
  .description('激活一个代理')
  .action((name) => {
    console.log(`激活代理: ${name}`);
  });
```

#### inquirer (^8.2.6)

**目的:** 交互式命令行提示
**用途:** 用户输入收集、向导
**优势:** 丰富的提示类型、验证支持

```javascript
const inquirer = require('inquirer');
const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'agent',
    message: '选择代理:',
    choices: ['dev', 'qa', 'architect'],
  },
]);
```

### 沙箱和安全

#### isolated-vm (^5.0.4)

**目的:** V8 隔离区用于沙箱 JavaScript 执行
**用途:** 安全执行用户脚本、任务执行
**优势:** 安全隔离、内存限制、超时控制

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### 验证

#### validator (^13.15.15)

**目的:** 字符串验证和清理
**用途:** 输入验证 (URL、邮箱等)
**优势:** 全面、测试充分、无依赖

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // URL 有效
}
```

#### semver (^7.7.2)

**目的:** 语义版本解析和比较
**用途:** 版本检查、依赖解析
**优势:** NPM 标准、充分测试

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // 版本兼容
}
```

---

## 开发工具

### Linting

#### ESLint (^9.38.0)

**目的:** JavaScript/TypeScript 代码检查
**配置:** `.eslintrc.json`
**插件:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**主要规则:**

```javascript
{
  "rules": {
    "no-console": "off",           // CLI 中允许 console
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### 格式化

#### Prettier (^3.5.3)

**目的:** 代码格式化
**配置:** `.prettierrc`

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

#### yaml-lint (^1.7.0)

**目的:** YAML 文件检查
**用途:** 验证代理配置、工作流、模板

### Git Hooks

#### husky (^9.1.7)

**目的:** Git hooks 管理
**用途:** 提交前 linting、推送前测试

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  }
}
```

#### lint-staged (^16.1.1)

**目的:** 在暂存文件上运行 linters
**配置:**

```json
{
  "lint-staged": {
    "**/*.md": ["prettier --write"],
    "**/*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 测试框架

### Jest (^30.2.0)

**目的:** 测试框架
**用途:** 单元测试、集成测试、覆盖率

```javascript
// 测试示例
describe('AgentExecutor', () => {
  it('should load agent configuration', async () => {
    const agent = await loadAgent('dev');
    expect(agent.name).toBe('developer');
  });
});
```

**配置:**

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

#### @types/jest (^30.0.0)

**目的:** Jest 的 TypeScript 类型定义
**用途:** 使用类型安全的方式编写测试

---

## 构建和部署

### 版本化和发布

#### semantic-release (^25.0.2)

**目的:** 自动化的语义版本化和发布
**用途:** 自动发布到 NPM、生成 changelog

**插件:**

- `@semantic-release/changelog` (^6.0.3) - 生成 CHANGELOG.md
- `@semantic-release/git` (^10.0.1) - 提交发布资源

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git"
    ]
  }
}
```

### 构建脚本

```bash
# 包构建
npm run build                  # 构建所有包
npm run build:agents           # 仅构建代理
npm run build:teams            # 仅构建团队

# 版本化
npm run version:patch          # 增加补丁版本
npm run version:minor          # 增加次要版本
npm run version:major          # 增加主要版本

# 发布
npm run publish:dry-run        # 测试发布
npm run publish:preview        # 发布为 preview 标签
npm run publish:stable         # 发布为 latest 标签
```

---

## 外部集成

### MCP 服务器

AIOX 与 Model Context Protocol (MCP) 服务器集成:

```yaml
MCP 服务器:
  - clickup-direct: ClickUp 集成 (任务管理)
  - context7: 文档查找
  - exa-direct: Web 搜索
  - desktop-commander: 文件操作
  - docker-mcp: Docker 管理
  - ide: VS Code/Cursor 集成
```

**配置:** `.claude.json` 或 `.cursor/settings.json`

### CLI 工具

代理使用的外部 CLI 工具:

```yaml
GitHub CLI (gh):
  版本: 2.x+
  用途: 仓库管理、PR 创建
  安装: https://cli.github.com

Railway CLI (railway):
  版本: 3.x+
  用途: 部署自动化
  安装: npm i -g @railway/cli

Supabase CLI (supabase):
  版本: 1.x+
  用途: 数据库迁移、schema 管理
  安装: npm i -g supabase

Git:
  版本: 2.30+
  用途: 版本控制
  必需: 是
```

### 云服务

```yaml
Railway:
  目的: 应用部署
  API: Railway CLI

Supabase:
  目的: PostgreSQL 数据库 + 身份验证
  API: Supabase CLI + REST API

GitHub:
  目的: 仓库托管、CI/CD
  API: GitHub CLI (gh) + Octokit

CodeRabbit:
  目的: 自动化代码审查
  API: GitHub App 集成
```

---

## 迁移后的未来栈

**计划于 2026 Q2-Q4** (仓库重组后):

### ESM 迁移

```javascript
// 当前: CommonJS
const agent = require('./agent');
module.exports = { executeAgent };

// 未来: ES Modules
import { agent } from './agent.js';
export { executeAgent };
```

### 完整的 TypeScript

```typescript
// 从 JS + .d.ts 迁移到完整的 TypeScript
// 优势: 类型安全、更好的重构、改进的 DX
```

### 构建工具

```yaml
Bundler: esbuild 或 tsup
原因: 快速构建、树摇晃、最小化
目标: 单个 CLI 可执行文件 (可选)
```

### 测试改进

```yaml
E2E 测试: Playwright (浏览器自动化测试)
性能测试: Benchmark.js (工作流计时)
```

---

## 依赖管理

### 安全审计

```bash
# 运行安全审计
npm audit

# 自动修复漏洞
npm audit fix

# 检查过期的包
npm outdated
```

### 更新策略

```yaml
主要更新: 季度审查 (Q1, Q2, Q3, Q4)
安全补丁: 立即 (48 小时内)
次要更新: 月度审查
依赖减少: 持续工作
```

### 依赖树

```bash
# 查看依赖树
npm ls --depth=2

# 查找重复的包
npm dedupe

# 分析 bundle 大小
npx cost-of-modules
```

---

## 版本兼容性矩阵

| 组件       | 版本    | 兼容性   | 说明                  |
| ---------- | ------- | -------- | --------------------- |
| **Node.js**      | 18.0.0+ | 必需     | 活跃 LTS              |
| **npm**          | 9.0.0+  | 必需     | 包管理器              |
| **TypeScript**   | 5.9.3   | 推荐     | 类型定义              |
| **ESLint**       | 9.38.0  | 必需     | Linting               |
| **Prettier**     | 3.5.3   | 必需     | 格式化                |
| **Jest**         | 30.2.0  | 必需     | 测试                  |
| **Git**          | 2.30+   | 必需     | 版本控制              |
| **GitHub CLI**   | 2.x+    | 可选     | 仓库管理              |
| **Railway CLI**  | 3.x+    | 可选     | 部署                  |
| **Supabase CLI** | 1.x+    | 可选     | 数据库管理            |

---

## 性能考虑

### Bundle 大小

```bash
# 生产 bundle 大小 (最小化)
总计: ~5MB (包括所有依赖)

# 关键依赖 (总是加载):
- commander: 120KB
- chalk: 15KB
- yaml: 85KB
- fs-extra: 45KB

# 可选依赖 (延迟加载):
- inquirer: 650KB (仅交互模式)
- @clack/prompts: 180KB (仅向导模式)
```

### 初始化时间

```yaml
冷启动: ~200ms (初始加载)
热启动: ~50ms (模块缓存)
Yolo 模式: ~100ms (跳过验证)

优化策略:
  - 延迟加载重型依赖
  - 缓存解析的 YAML 配置
  - 有条件地使用 require()
```

### 内存使用

```yaml
基线: 30MB (Node.js + AIOX core)
代理执行: +10MB (每个代理)
故事处理: +20MB (markdown 解析)
峰值: ~100MB (典型工作流)
```

---

## 特定平台说明

### Windows

```yaml
路径分隔符: 反斜杠 (\) - 规范化为正斜杠 (/)
行尾: CRLF - Git 配置自动转换
Shell: PowerShell 或 CMD - execa 处理跨平台
Node.js: 来自 nodejs.org 的 Windows 安装程序
```

### macOS

```yaml
路径分隔符: 正斜杠 (/)
行尾: LF
Shell: zsh (默认) 或 bash
Node.js: Homebrew (brew install node@18) 或 nvm
```

### Linux

```yaml
路径分隔符: 正斜杠 (/)
行尾: LF
Shell: bash (默认) 或 zsh
Node.js: nvm、apt、yum 或官方二进制文件
```

---

## 环境变量

```bash
# AIOX 配置
AIOX_DEBUG=true                    # 启用调试日志
AIOX_CONFIG_PATH=/custom/path      # 自定义配置位置
AIOX_YOLO_MODE=true               # 强制 yolo 模式

# Node.js
NODE_ENV=production                # 生产模式
NODE_OPTIONS=--max-old-space-size=4096  # 增加内存限制

# 外部服务
CLICKUP_API_KEY=pk_xxx            # ClickUp 集成
GITHUB_TOKEN=ghp_xxx              # GitHub API 访问
RAILWAY_TOKEN=xxx                 # Railway 部署
SUPABASE_ACCESS_TOKEN=xxx         # Supabase CLI 身份验证
```

---

## 相关文档

- [编码标准](./coding-standards.md)
- [源树](./source-tree.md)

---

## 版本历史

| 版本 | 日期       | 更改                                                                          | 作者             |
| ---- | ---------- | ----------------------------------------------------------------------------- | ---------------- |
| 1.0  | 2025-01-15 | 初始技术栈文档                                                                | Aria (architect) |
| 1.1  | 2025-12-14 | 更新对 SynkraAI/aiox-core 的迁移通知、semantic-release 到 v25.0.2 [故事 6.10] | Dex (dev)        |

---

_这是 AIOX 框架的官方模式。所有技术选择应与本栈保持一致。_
