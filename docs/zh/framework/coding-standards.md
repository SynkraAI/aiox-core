<!-- 翻译：zh-CN 原文：/docs/framework/coding-standards.md 最后同步：2026-02-22 -->

# AIOS 编码标准

> [EN](../../framework/coding-standards.md) | [PT](../../pt/framework/coding-standards.md) | [ES](../../es/framework/coding-standards.md) | **ZH**

**版本:** 1.1
**最后更新:** 2025-12-14
**状态:** 官方框架标准
**迁移通知:** 本文档将于2026年第二季度迁移到 `SynkraAI/aios-core` 仓库（参见 Decision 005）

---

## 目录

- [概述](#概述)
- [JavaScript/TypeScript 标准](#javascripttypescript-标准)
- [文件组织](#文件组织)
- [命名约定](#命名约定)
- [代码质量](#代码质量)
- [文档标准](#文档标准)
- [测试标准](#测试标准)
- [Git 约定](#git-约定)
- [安全标准](#安全标准)

---

## 概述

本文档定义了 AIOS 框架开发的官方编码标准。所有代码贡献都必须遵守这些标准，以确保一致性、可维护性和质量。

**执行方式:**

- ESLint（自动化）
- Prettier（自动化）
- CodeRabbit 审查（自动化）
- 人工审查（手动）

---

## JavaScript/TypeScript 标准

### 语言版本

```javascript
// 目标: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ 推荐: 现代语法
const data = await fetchData();
const { id, name } = data;

// ❌ 不推荐: 过时语法
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 代码风格

#### 缩进与格式化

```javascript
// ✅ 推荐: 2空格缩进
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ 不推荐: 4空格或制表符
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Prettier 配置:**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### 行长度

```javascript
// ✅ 推荐: 最大100字符
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ 不推荐: 超过100字符
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### 引号

```javascript
// ✅ 推荐: 字符串使用单引号
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ 不推荐: 双引号（JSON除外）
const agentName = 'developer';
```

### 现代 JavaScript 模式

#### Async/Await（首选）

```javascript
// ✅ 推荐: async/await
async function loadAgent(agentId) {
  try {
    const agent = await fetchAgent(agentId);
    const config = await loadConfig(agent.configPath);
    return { agent, config };
  } catch (error) {
    console.error(`Failed to load agent ${agentId}:`, error);
    throw error;
  }
}

// ❌ 不推荐: Promise 链
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### 解构

```javascript
// ✅ 推荐: 解构
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ 不推荐: 手动提取
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### 箭头函数

```javascript
// ✅ 推荐: 回调使用箭头函数
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ 不推荐: 简单回调使用传统函数
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### 模板字面量

```javascript
// ✅ 推荐: 字符串插值使用模板字面量
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ 不推荐: 字符串拼接
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### 错误处理

```javascript
// ✅ 推荐: 带上下文的具体错误处理
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Task execution failed [${taskName}]:`, error);
    throw new Error(`Failed to execute task "${taskName}": ${error.message}`);
  }
}

// ❌ 不推荐: 静默失败或通用错误
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.log('Error:', error);
    return null; // 静默失败
  }
}
```

---

## 文件组织

### 目录结构

```
.aios-core/
├── agents/              # 代理定义 (YAML + Markdown)
├── tasks/               # 任务工作流 (Markdown)
├── templates/           # 文档模板 (YAML/Markdown)
├── workflows/           # 多步骤工作流 (YAML)
├── checklists/          # 验证检查清单 (Markdown)
├── data/                # 知识库 (Markdown)
├── utils/               # 实用脚本 (JavaScript)
├── tools/               # 工具集成 (YAML)
└── elicitation/         # 引导引擎 (JavaScript)

docs/
├── architecture/        # 项目特定的架构决策
├── framework/           # 官方框架文档（迁移到仓库1）
├── stories/             # 开发故事
├── epics/               # Epic 规划
└── guides/              # 操作指南
```

### 文件命名

```javascript
// ✅ 推荐: 文件使用 kebab-case
agent - executor.js;
task - runner.js;
greeting - builder.js;
context - detector.js;

// ❌ 不推荐: 文件使用 camelCase 或 PascalCase
agentExecutor.js;
TaskRunner.js;
GreetingBuilder.js;
```

### 模块结构

```javascript
// ✅ 推荐: 清晰的模块结构
// 文件: agent-executor.js

// 1. 导入
const fs = require('fs').promises;
const yaml = require('yaml');
const { loadConfig } = require('./config-loader');

// 2. 常量
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 3. 辅助函数（私有）
function validateAgent(agent) {
  // ...
}

// 4. 主要导出（公共 API）
async function executeAgent(agentId, args) {
  // ...
}

async function loadAgent(agentId) {
  // ...
}

// 5. 导出
module.exports = {
  executeAgent,
  loadAgent,
};
```

---

## 命名约定

### 变量与函数

```javascript
// ✅ 推荐: 变量和函数使用 camelCase
const agentName = 'developer';
const taskResult = await executeTask();

function loadAgentConfig(agentId) {
  // ...
}

async function fetchAgentData(agentId) {
  // ...
}

// ❌ 不推荐: snake_case 或 PascalCase
const agent_name = 'developer';
const TaskResult = await executeTask();

function LoadAgentConfig(agentId) {
  // ...
}
```

### 类

```javascript
// ✅ 推荐: 类使用 PascalCase
class AgentExecutor {
  constructor(config) {
    this.config = config;
  }

  async execute(agentId) {
    // ...
  }
}

class TaskRunner {
  // ...
}

// ❌ 不推荐: camelCase 或 snake_case
class agentExecutor {
  // ...
}

class task_runner {
  // ...
}
```

### 常量

```javascript
// ✅ 推荐: 真正的常量使用 SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const AGENT_STATUS_ACTIVE = 'active';

// ❌ 不推荐: camelCase 或小写
const maxRetryAttempts = 3;
const defaulttimeout = 5000;
```

### 私有成员

```javascript
// ✅ 推荐: 私有成员使用下划线前缀（约定）
class AgentManager {
  constructor() {
    this._cache = new Map();
    this._isInitialized = false;
  }

  _loadFromCache(id) {
    // 私有辅助方法
    return this._cache.get(id);
  }

  async getAgent(id) {
    // 公共 API
    return this._loadFromCache(id) || (await this._fetchAgent(id));
  }
}
```

### 布尔变量

```javascript
// ✅ 推荐: is/has/should 前缀
const isEnabled = true;
const hasPermission = false;
const shouldRetry = checkCondition();

// ❌ 不推荐: 模糊命名
const enabled = true;
const permission = false;
const retry = checkCondition();
```

---

## 代码质量

### ESLint 配置

```json
{
  "env": {
    "node": true,
    "es2022": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 13,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "es5"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### 代码复杂度

```javascript
// ✅ 推荐: 低圈复杂度 (< 10)
function processAgent(agent) {
  if (!agent.enabled) return null;

  const config = loadConfig(agent.configPath);
  const result = executeAgent(agent, config);

  return result;
}

// ❌ 不推荐: 高圈复杂度
function processAgent(agent) {
  if (agent.type === 'dev') {
    if (agent.mode === 'yolo') {
      if (agent.hasStory) {
        // ... 嵌套逻辑
      } else {
        // ... 更多嵌套逻辑
      }
    } else {
      // ... 更多分支
    }
  } else if (agent.type === 'qa') {
    // ... 更多分支
  }
  // ... 更多复杂性
}
```

**重构复杂函数:**

```javascript
// ✅ 推荐: 提取辅助函数
function processAgent(agent) {
  if (!agent.enabled) return null;

  if (agent.type === 'dev') {
    return processDevAgent(agent);
  }

  if (agent.type === 'qa') {
    return processQaAgent(agent);
  }

  return processDefaultAgent(agent);
}
```

### DRY 原则

```javascript
// ✅ 推荐: 可复用函数
function validateAndLoad(filePath, schema) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.parse(content);

  if (!schema.validate(data)) {
    throw new Error(`Invalid schema: ${filePath}`);
  }

  return data;
}

const agent = validateAndLoad('agent.yaml', agentSchema);
const task = validateAndLoad('task.yaml', taskSchema);

// ❌ 不推荐: 重复代码
const agentContent = fs.readFileSync('agent.yaml', 'utf8');
const agentData = yaml.parse(agentContent);
if (!agentSchema.validate(agentData)) {
  throw new Error('Invalid agent schema');
}

const taskContent = fs.readFileSync('task.yaml', 'utf8');
const taskData = yaml.parse(taskContent);
if (!taskSchema.validate(taskData)) {
  throw new Error('Invalid task schema');
}
```

---

## 文档标准

### JSDoc 注释

```javascript
/**
 * 加载并执行 AIOS 代理
 *
 * @param {string} agentId - 代理的唯一标识符
 * @param {Object} args - 代理执行参数
 * @param {boolean} args.yoloMode - 启用自主模式
 * @param {string} args.storyPath - 故事文件路径（可选）
 * @param {number} [timeout=5000] - 执行超时时间（毫秒）
 * @returns {Promise<Object>} 代理执行结果
 * @throws {Error} 如果代理未找到或执行失败
 *
 * @example
 * const result = await executeAgent('dev', {
 *   yoloMode: true,
 *   storyPath: 'docs/stories/story-6.1.2.5.md'
 * });
 */
async function executeAgent(agentId, args, timeout = 5000) {
  // 实现
}
```

### 行内注释

```javascript
// ✅ 推荐: 解释为什么，而不是什么
// 缓存代理以避免每次激活时重新解析 YAML（性能优化）
const agentCache = new Map();

// yolo 模式回滚需要决策日志（Story 6.1.2.6 要求）
if (yoloMode) {
  await createDecisionLog(storyId);
}

// ❌ 不推荐: 陈述显而易见的事
// 创建一个新的 Map
const agentCache = new Map();

// 如果 yolo 模式为 true
if (yoloMode) {
  await createDecisionLog(storyId);
}
```

### README 文件

每个模块/目录应有一个 README.md：

```markdown
# Agent Executor

**目的:** 加载并执行带有配置管理的 AIOS 代理。

## 用法

\`\`\`javascript
const { executeAgent } = require('./agent-executor');

const result = await executeAgent('dev', {
yoloMode: true,
storyPath: 'docs/stories/story-6.1.2.5.md'
});
\`\`\`

## API

- `executeAgent(agentId, args, timeout)` - 执行代理
- `loadAgent(agentId)` - 加载代理配置

## 依赖

- `yaml` - YAML 解析
- `fs/promises` - 文件系统操作
```

---

## 测试标准

### 测试文件命名

```bash
# 单元测试
tests/unit/context-detector.test.js
tests/unit/git-config-detector.test.js

# 集成测试
tests/integration/contextual-greeting.test.js
tests/integration/workflow-navigation.test.js

# 端到端测试
tests/e2e/agent-activation.test.js
```

### 测试结构

```javascript
// ✅ 推荐: 使用 Given-When-Then 的描述性测试名称
describe('ContextDetector', () => {
  describe('detectSessionType', () => {
    it('should return "new" when conversation history is empty', async () => {
      // Given（给定）
      const conversationHistory = [];
      const sessionFile = null;

      // When（当）
      const result = await detectSessionType(conversationHistory, sessionFile);

      // Then（那么）
      expect(result).toBe('new');
    });

    it('should return "workflow" when command pattern matches story_development', async () => {
      // Given（给定）
      const conversationHistory = [{ command: 'validate-story-draft' }, { command: 'develop' }];

      // When（当）
      const result = await detectSessionType(conversationHistory, null);

      // Then（那么）
      expect(result).toBe('workflow');
    });
  });
});
```

### 代码覆盖率

- **最低:** 所有新模块 80%
- **目标:** 核心模块 90%
- **关键:** 安全/验证模块 100%

```bash
# 运行覆盖率
npm test -- --coverage

# package.json 中的覆盖率阈值
{
  "jest": {
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

---

## Git 约定

### 提交消息

```bash
# ✅ 推荐: Conventional Commits 格式
feat: implement contextual agent greeting system [Story 6.1.2.5]
fix: resolve git config cache invalidation issue [Story 6.1.2.5]
docs: update coding standards with TypeScript config
chore: update ESLint configuration
refactor: extract greeting builder into separate module
test: add unit tests for WorkflowNavigator

# ❌ 不推荐: 模糊或非描述性
update files
fix bug
changes
wip
```

**格式:**

```
<type>: <description> [Story <id>]

<可选正文>

<可选页脚>
```

**类型:**

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `chore`: 构建/工具变更
- `refactor`: 代码重构（无功能变更）
- `test`: 测试添加/修改
- `perf`: 性能改进
- `style`: 代码风格变更（格式化等）

### 分支命名

```bash
# ✅ 推荐: 描述性分支名称
feature/story-6.1.2.5-contextual-greeting
fix/git-config-cache-ttl
refactor/agent-executor-optimization
docs/update-coding-standards

# ❌ 不推荐: 模糊的分支名称
update
fix
my-branch
```

---

## 安全标准

### 输入验证

```javascript
// ✅ 推荐: 验证所有外部输入
function executeCommand(command) {
  // 白名单验证
  const allowedCommands = ['help', 'develop', 'review', 'deploy'];

  if (!allowedCommands.includes(command)) {
    throw new Error(`Invalid command: ${command}`);
  }

  return runCommand(command);
}

// ❌ 不推荐: 无验证
function executeCommand(command) {
  return eval(command); // 绝对不要这样做
}
```

### 路径遍历保护

```javascript
// ✅ 推荐: 验证文件路径
const path = require('path');

function loadFile(filePath) {
  const basePath = path.resolve(__dirname, '.aios-core');
  const resolvedPath = path.resolve(basePath, filePath);

  // 防止目录遍历
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Invalid file path');
  }

  return fs.readFile(resolvedPath, 'utf8');
}

// ❌ 不推荐: 直接使用路径
function loadFile(filePath) {
  return fs.readFile(filePath, 'utf8'); // 易受 ../../../etc/passwd 攻击
}
```

### 密钥管理

```javascript
// ✅ 推荐: 使用环境变量
const apiKey = process.env.CLICKUP_API_KEY;

if (!apiKey) {
  throw new Error('CLICKUP_API_KEY environment variable not set');
}

// ❌ 不推荐: 硬编码密钥
const apiKey = 'pk_12345678_abcdefgh'; // 绝对不要这样做
```

### 依赖安全

```bash
# 定期安全审计
npm audit
npm audit fix

# 使用 Snyk 或类似工具进行持续监控
```

---

## 执行

### Pre-commit 钩子

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm test
```

### CI/CD 流水线

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit
```

### CodeRabbit 集成

所有 PR 由 CodeRabbit 自动审查：

- 代码质量问题
- 安全漏洞
- 性能问题
- 最佳实践违规
- 测试覆盖率缺口

---

## 版本历史

| 版本 | 日期 | 变更 | 作者 |
| ---- | ---- | ---- | ---- |
| 1.0 | 2025-01-15 | 初始编码标准文档 | Aria (architect) |
| 1.1 | 2025-12-14 | 更新迁移通知至 SynkraAI/aios-core [Story 6.10] | Dex (dev) |

---

**相关文档:**

- [技术栈](./tech-stack.md)
- [源代码树](./source-tree.md)

---

_这是官方 AIOS 框架标准。所有代码贡献必须遵守。_
