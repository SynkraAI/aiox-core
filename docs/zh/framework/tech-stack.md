<!-- 翻译：zh-CN 原文：/docs/framework/tech-stack.md 最后同步：2026-02-22 -->

# AIOX 技术栈

> [EN](../../framework/tech-stack.md) | [PT](../../pt/framework/tech-stack.md) | [ES](../../es/framework/tech-stack.md) | **ZH**

**版本:** 1.1
**最后更新:** 2025-12-14
**状态:** 官方框架标准
**迁移通知:** 本文档将于2026年第二季度迁移到 `SynkraAI/aiox-core` 仓库（参见 Decision 005）

---

## 目录

- [概述](#概述)
- [核心运行时](#核心运行时)
- [语言与转译器](#语言与转译器)
- [核心依赖](#核心依赖)
- [开发工具](#开发工具)
- [测试框架](#测试框架)
- [构建与部署](#构建与部署)
- [外部集成](#外部集成)
- [未来技术栈（迁移后）](#未来技术栈迁移后)

---

## 概述

AIOX 基于现代 JavaScript/TypeScript 和 Node.js 运行时构建，针对跨平台 CLI 开发进行了优化，具有交互式用户体验和代理编排能力。

**理念:**

- 尽可能选择**成熟技术**（经过验证的稳定依赖）
- 仅在必要时选择**新兴技术**（性能、开发体验改进）
- 最小化依赖（降低供应链风险）
- 跨平台优先（Windows、macOS、Linux）

---

## 核心运行时

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**为什么选择 Node.js 18+:**

- 原生 `fetch()` API（无需 axios/node-fetch）
- ES2022 模块支持（顶层 await）
- V8 10.2+（性能改进）
- 活跃的 LTS 支持（安全补丁）
- 跨平台（Windows/macOS/Linux）

**包管理器:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (user choice)
Lock File: package-lock.json
```

---

## 语言与转译器

### JavaScript（主要）

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**为什么选择 ES2022:**

- 类字段和私有方法
- 顶层 await
- 错误原因
- Array.at() 方法
- Object.hasOwn()

### TypeScript（类型定义）

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**当前 TypeScript 用法:**

```typescript
// index.d.ts - 公共 API 的类型定义
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

### CLI 与交互式用户体验

#### @clack/prompts (^0.11.0)

**目的:** 具有精美用户体验的现代 CLI 提示
**用途:** 交互式向导、用户输入收集
**原因:** 一流的用户体验、加载动画、进度条

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Select agent:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**目的:** 终端字符串样式
**用途:** 彩色输出、格式化
**原因:** 跨平台、零依赖、稳定的 API

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**目的:** 轻量级颜色库（chalk 的更快替代品）
**用途:** 性能关键的颜色输出
**原因:** 比 chalk 小14倍，快2倍

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**目的:** 终端加载动画
**用途:** 加载指示器、异步操作
**原因:** 精美的加载动画、可定制、广泛使用

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### 文件系统与路径操作

#### fs-extra (^11.3.2)

**目的:** 增强的文件系统操作
**用途:** 文件复制、目录创建、JSON 读写
**原因:** 基于 Promise、比内置 `fs` 提供更多实用工具

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**目的:** 文件模式匹配
**用途:** 按模式查找文件（例如 `*.md`、`**/*.yaml`）
**原因:** 快速、支持 gitignore 模式

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### YAML 处理

#### yaml (^2.8.1)

**目的:** YAML 解析和序列化
**用途:** 代理配置、工作流、模板
**原因:** 快速、符合规范、保留注释

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**目的:** 备选 YAML 解析器（遗留支持）
**用途:** 解析较旧的 YAML 文件
**原因:** 不同的 API，用于一些遗留代码

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**迁移说明:** 合并为单一 YAML 库（Story 6.2.x）

### Markdown 处理

#### @kayvan/markdown-tree-parser (^1.5.0)

**目的:** 将 markdown 解析为 AST
**用途:** 故事解析、文档结构分析
**原因:** 轻量级、快速、支持 GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### 进程执行

#### execa (^9.6.0)

**目的:** 更好的 child_process
**用途:** 运行 git、npm、外部 CLI 工具
**原因:** 跨平台、基于 Promise、更好的错误处理

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### 命令行解析

#### commander (^14.0.1)

**目的:** CLI 框架
**用途:** 解析命令行参数、子命令
**原因:** 行业标准、功能丰富、TypeScript 支持

```javascript
const { Command } = require('commander');
const program = new Command();

program
  .command('agent <name>')
  .description('Activate an agent')
  .action((name) => {
    console.log(`Activating agent: ${name}`);
  });
```

#### inquirer (^8.2.6)

**目的:** 交互式命令行提示
**用途:** 用户输入收集、向导
**原因:** 丰富的提示类型、验证支持

```javascript
const inquirer = require('inquirer');
const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'agent',
    message: 'Select agent:',
    choices: ['dev', 'qa', 'architect'],
  },
]);
```

### 沙箱与安全

#### isolated-vm (^5.0.4)

**目的:** 用于沙箱 JavaScript 执行的 V8 隔离
**用途:** 安全执行用户脚本、任务执行
**原因:** 安全隔离、内存限制、超时控制

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### 验证

#### validator (^13.15.15)

**目的:** 字符串验证器和清理器
**用途:** 输入验证（URL、邮箱等）
**原因:** 全面、经过良好测试、无依赖

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // 有效的 URL
}
```

#### semver (^7.7.2)

**目的:** 语义版本解析和比较
**用途:** 版本检查、依赖解析
**原因:** NPM 标准、久经考验

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // 版本兼容
}
```

---

## 开发工具

### 代码检查

#### ESLint (^9.38.0)

**目的:** JavaScript/TypeScript 代码检查器
**配置:** `.eslintrc.json`
**插件:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**关键规则:**

```javascript
{
  "rules": {
    "no-console": "off",           // 允许 CLI 中的 console
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### 格式化

#### Prettier (^3.5.3)

**目的:** 代码格式化器
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

**目的:** YAML 文件检查器
**用途:** 验证代理配置、工作流、模板

### Git 钩子

#### husky (^9.1.7)

**目的:** Git 钩子管理
**用途:** Pre-commit 代码检查、pre-push 测试

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

**目的:** 对暂存文件运行代码检查器
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
// 示例测试
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
**用途:** 类型安全的测试编写

---

## 构建与部署

### 版本管理与发布

#### semantic-release (^25.0.2)

**目的:** 自动化语义版本管理和发布
**用途:** 自动 NPM 发布、变更日志生成

**插件:**

- `@semantic-release/changelog` (^6.0.3) - 生成 CHANGELOG.md
- `@semantic-release/git` (^10.0.1) - 提交发布资产

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

# 版本管理
npm run version:patch          # 提升补丁版本
npm run version:minor          # 提升次版本
npm run version:major          # 提升主版本

# 发布
npm run publish:dry-run        # 测试发布
npm run publish:preview        # 发布预览标签
npm run publish:stable         # 发布最新标签
```

---

## 外部集成

### MCP 服务器

AIOX 与 Model Context Protocol (MCP) 服务器集成：

```yaml
MCP Servers:
  - clickup-direct: ClickUp integration (task management)
  - context7: Documentation lookup
  - exa-direct: Web search
  - desktop-commander: File operations
  - docker-mcp: Docker management
  - ide: VS Code/Cursor integration
```

**配置:** `.claude.json` 或 `.cursor/settings.json`

### CLI 工具

代理使用的外部 CLI 工具：

```yaml
GitHub CLI (gh):
  Version: 2.x+
  Usage: Repository management, PR creation
  Install: https://cli.github.com

Railway CLI (railway):
  Version: 3.x+
  Usage: Deployment automation
  Install: npm i -g @railway/cli

Supabase CLI (supabase):
  Version: 1.x+
  Usage: Database migrations, schema management
  Install: npm i -g supabase

Git:
  Version: 2.30+
  Usage: Version control
  Required: Yes
```

### 云服务

```yaml
Railway:
  Purpose: Application deployment
  API: Railway CLI

Supabase:
  Purpose: PostgreSQL database + Auth
  API: Supabase CLI + REST API

GitHub:
  Purpose: Repository hosting, CI/CD
  API: GitHub CLI (gh) + Octokit

CodeRabbit:
  Purpose: Automated code review
  API: GitHub App integration
```

---

## 未来技术栈（迁移后）

**计划于2026年第二至四季度**（仓库重组后）：

### ESM 迁移

```javascript
// 当前: CommonJS
const agent = require('./agent');
module.exports = { executeAgent };

// 未来: ES Modules
import { agent } from './agent.js';
export { executeAgent };
```

### 完整 TypeScript

```typescript
// 从 JS + .d.ts 迁移到完整 TypeScript
// 好处: 类型安全、更好的重构、改进的开发体验
```

### 构建工具

```yaml
Bundler: esbuild or tsup
Reason: Fast builds, tree-shaking, minification
Target: Single executable CLI (optional)
```

### 测试改进

```yaml
E2E Testing: Playwright (browser automation tests)
Performance Testing: Benchmark.js (workflow timing)
```

---

## 依赖管理

### 安全审计

```bash
# 运行安全审计
npm audit

# 自动修复漏洞
npm audit fix

# 检查过时的包
npm outdated
```

### 更新策略

```yaml
Major Updates: Quarterly review (Q1, Q2, Q3, Q4)
Security Patches: Immediate (within 48 hours)
Minor Updates: Monthly review
Dependency Reduction: Ongoing effort
```

### 依赖树

```bash
# 查看依赖树
npm ls --depth=2

# 查找重复包
npm dedupe

# 分析包大小
npx cost-of-modules
```

---

## 版本兼容性矩阵

| 组件 | 版本 | 兼容性 | 说明 |
| ---- | ---- | ------ | ---- |
| **Node.js** | 18.0.0+ | 必需 | Active LTS |
| **npm** | 9.0.0+ | 必需 | 包管理器 |
| **TypeScript** | 5.9.3 | 推荐 | 类型定义 |
| **ESLint** | 9.38.0 | 必需 | 代码检查 |
| **Prettier** | 3.5.3 | 必需 | 格式化 |
| **Jest** | 30.2.0 | 必需 | 测试 |
| **Git** | 2.30+ | 必需 | 版本控制 |
| **GitHub CLI** | 2.x+ | 可选 | 仓库管理 |
| **Railway CLI** | 3.x+ | 可选 | 部署 |
| **Supabase CLI** | 1.x+ | 可选 | 数据库管理 |

---

## 性能考虑

### 包大小

```bash
# 生产包大小（压缩后）
Total: ~5MB (includes all dependencies)

# 关键依赖（始终加载）:
- commander: 120KB
- chalk: 15KB
- yaml: 85KB
- fs-extra: 45KB

# 可选依赖（延迟加载）:
- inquirer: 650KB (interactive mode only)
- @clack/prompts: 180KB (wizard mode only)
```

### 启动时间

```yaml
Cold Start: ~200ms (initial load)
Warm Start: ~50ms (cached modules)
Yolo Mode: ~100ms (skip validation)

Optimization Strategy:
  - Lazy load heavy dependencies
  - Cache parsed YAML configs
  - Use require() conditionally
```

### 内存使用

```yaml
Baseline: 30MB (Node.js + AIOX core)
Agent Execution: +10MB (per agent)
Story Processing: +20MB (markdown parsing)
Peak: ~100MB (typical workflow)
```

---

## 平台特定说明

### Windows

```yaml
Path Separators: Backslash (\) - normalized to forward slash (/)
Line Endings: CRLF - Git configured for auto conversion
Shell: PowerShell or CMD - execa handles cross-platform
Node.js: Windows installer from nodejs.org
```

### macOS

```yaml
Path Separators: Forward slash (/)
Line Endings: LF
Shell: zsh (default) or bash
Node.js: Homebrew (brew install node@18) or nvm
```

### Linux

```yaml
Path Separators: Forward slash (/)
Line Endings: LF
Shell: bash (default) or zsh
Node.js: nvm, apt, yum, or official binaries
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
SUPABASE_ACCESS_TOKEN=xxx         # Supabase CLI 认证
```

---

## 相关文档

- [编码标准](./coding-standards.md)
- [源代码树](./source-tree.md)

---

## 版本历史

| 版本 | 日期 | 变更 | 作者 |
| ---- | ---- | ---- | ---- |
| 1.0 | 2025-01-15 | 初始技术栈文档 | Aria (architect) |
| 1.1 | 2025-12-14 | 更新迁移通知至 SynkraAI/aiox-core，semantic-release 至 v25.0.2 [Story 6.10] | Dex (dev) |

---

_这是官方 AIOX 框架标准。所有技术选型必须与此技术栈保持一致。_
