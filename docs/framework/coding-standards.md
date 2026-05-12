# AIOX Coding Standards

> 🌐 **EN** | [PT](../pt/framework/coding-standards.md) | [ES](../es/framework/coding-standards.md)

**Version:** 1.1
**Last Updated:** 2025-12-14
**Status:** Official Framework Standard
**Migration Notice:** This document will migrate to `SynkraAI/aiox-core` repository in Q2 2026 (see Decision 005)

---

## 📋 Table of Contents

- [Overview](#overview)
- [JavaScript/TypeScript Standards](#javascripttypescript-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Quality](#code-quality)
- [Documentation Standards](#documentation-standards)
- [Testing Standards](#testing-standards)
- [Git Conventions](#git-conventions)
- [Security Standards](#security-standards)

---

## Overview

This document defines the official coding standards for AIOX framework development. All code contributions must adhere to these standards to ensure consistency, maintainability, and quality.

**Enforcement:**

- ESLint (automated)
- Prettier (automated)
- CodeRabbit review (automated)
- Human review (manual)

---

## JavaScript/TypeScript Standards

### Language Version

```javascript
// Target: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ GOOD: Modern syntax
const data = await fetchData();
const { id, name } = data;

// ❌ BAD: Outdated syntax
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### TypeScript Configuration

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

### Code Style

#### Indentation & Formatting

```javascript
// ✅ GOOD: 2 spaces indentation
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ BAD: 4 spaces or tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Prettier Configuration:**

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

#### Line Length

```javascript
// ✅ GOOD: Max 100 characters
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ BAD: Over 100 characters
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Quotes

```javascript
// ✅ GOOD: Single quotes for strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ BAD: Double quotes (except JSON)
const agentName = 'developer';
```

### Modern JavaScript Patterns

#### Async/Await (Preferred)

```javascript
// ✅ GOOD: async/await
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

// ❌ BAD: Promise chains
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Destructuring

```javascript
// ✅ GOOD: Destructuring
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ BAD: Manual extraction
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Arrow Functions

```javascript
// ✅ GOOD: Arrow functions for callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ BAD: Traditional functions for simple callbacks
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ GOOD: Template literals for string interpolation
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ BAD: String concatenation
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Error Handling

```javascript
// ✅ GOOD: Specific error handling with context
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Task execution failed [${taskName}]:`, error);
    throw new Error(`Failed to execute task "${taskName}": ${error.message}`);
  }
}

// ❌ BAD: Silent failures or generic errors
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.log('Error:', error);
    return null; // Silent failure
  }
}
```

---

## File Organization

### Directory Structure

```
.aiox-core/
├── agents/              # Agent definitions (YAML + Markdown)
├── tasks/               # Task workflows (Markdown)
├── templates/           # Document templates (YAML/Markdown)
├── workflows/           # Multi-step workflows (YAML)
├── checklists/          # Validation checklists (Markdown)
├── data/                # Knowledge base (Markdown)
├── utils/               # Utility scripts (JavaScript)
├── tools/               # Tool integrations (YAML)
└── elicitation/         # Elicitation engines (JavaScript)

docs/
├── architecture/        # Project-specific architecture decisions
├── framework/           # Official framework docs (migrates to REPO 1)
├── stories/             # Development stories
├── epics/               # Epic planning
└── guides/              # How-to guides
```

### File Naming

```javascript
// ✅ GOOD: Kebab-case for files
agent - executor.js;
task - runner.js;
greeting - builder.js;
context - detector.js;

// ❌ BAD: camelCase or PascalCase for files
agentExecutor.js;
TaskRunner.js;
GreetingBuilder.js;
```

### Module Structure

```javascript
// ✅ GOOD: Clear module structure
// File: agent-executor.js

// 1. Imports
const fs = require('fs').promises;
const yaml = require('yaml');
const { loadConfig } = require('./config-loader');

// 2. Constants
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 3. Helper functions (private)
function validateAgent(agent) {
  // ...
}

// 4. Main exports (public API)
async function executeAgent(agentId, args) {
  // ...
}

async function loadAgent(agentId) {
  // ...
}

// 5. Exports
module.exports = {
  executeAgent,
  loadAgent,
};
```

---

## Naming Conventions

### Variables & Functions

```javascript
// ✅ GOOD: camelCase for variables and functions
const agentName = 'developer';
const taskResult = await executeTask();

function loadAgentConfig(agentId) {
  // ...
}

async function fetchAgentData(agentId) {
  // ...
}

// ❌ BAD: snake_case or PascalCase
const agent_name = 'developer';
const TaskResult = await executeTask();

function LoadAgentConfig(agentId) {
  // ...
}
```

### Classes

```javascript
// ✅ GOOD: PascalCase for classes
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

// ❌ BAD: camelCase or snake_case
class agentExecutor {
  // ...
}

class task_runner {
  // ...
}
```

### Constants

```javascript
// ✅ GOOD: SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const AGENT_STATUS_ACTIVE = 'active';

// ❌ BAD: camelCase or lowercase
const maxRetryAttempts = 3;
const defaulttimeout = 5000;
```

### Private Members

```javascript
// ✅ GOOD: Prefix with underscore for private (convention)
class AgentManager {
  constructor() {
    this._cache = new Map();
    this._isInitialized = false;
  }

  _loadFromCache(id) {
    // Private helper
    return this._cache.get(id);
  }

  async getAgent(id) {
    // Public API
    return this._loadFromCache(id) || (await this._fetchAgent(id));
  }
}
```

### Boolean Variables

```javascript
// ✅ GOOD: is/has/should prefix
const isEnabled = true;
const hasPermission = false;
const shouldRetry = checkCondition();

// ❌ BAD: Ambiguous names
const enabled = true;
const permission = false;
const retry = checkCondition();
```

---

## Code Quality

### ESLint Configuration

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

### Code Complexity

```javascript
// ✅ GOOD: Low cyclomatic complexity (< 10)
function processAgent(agent) {
  if (!agent.enabled) return null;

  const config = loadConfig(agent.configPath);
  const result = executeAgent(agent, config);

  return result;
}

// ❌ BAD: High cyclomatic complexity
function processAgent(agent) {
  if (agent.type === 'dev') {
    if (agent.mode === 'yolo') {
      if (agent.hasStory) {
        // ... nested logic
      } else {
        // ... more nested logic
      }
    } else {
      // ... more branches
    }
  } else if (agent.type === 'qa') {
    // ... more branches
  }
  // ... even more complexity
}
```

**Refactor complex functions:**

```javascript
// ✅ GOOD: Extracted helper functions
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

### DRY Principle

```javascript
// ✅ GOOD: Reusable function
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

// ❌ BAD: Repeated code
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

## Documentation Standards

### JSDoc Comments

```javascript
/**
 * Loads and executes an AIOX agent
 *
 * @param {string} agentId - Unique identifier for the agent
 * @param {Object} args - Agent execution arguments
 * @param {boolean} args.yoloMode - Enable autonomous mode
 * @param {string} args.storyPath - Path to story file (optional)
 * @param {number} [timeout=5000] - Execution timeout in milliseconds
 * @returns {Promise<Object>} Agent execution result
 * @throws {Error} If agent not found or execution fails
 *
 * @example
 * const result = await executeAgent('dev', {
 *   yoloMode: true,
 *   storyPath: 'docs/stories/story-6.1.2.5.md'
 * });
 */
async function executeAgent(agentId, args, timeout = 5000) {
  // Implementation
}
```

### Inline Comments

```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Cache agents to avoid re-parsing YAML on every activation (performance optimization)
const agentCache = new Map();

// Decision log required for yolo mode rollback (Story 6.1.2.6 requirement)
if (yoloMode) {
  await createDecisionLog(storyId);
}

// ❌ BAD: Stating the obvious
// Create a new Map
const agentCache = new Map();

// If yolo mode is true
if (yoloMode) {
  await createDecisionLog(storyId);
}
```

### README Files

Every module/directory should have a README.md:

```markdown
# Agent Executor

**Purpose:** Loads and executes AIOX agents with configuration management.

## Usage

\`\`\`javascript
const { executeAgent } = require('./agent-executor');

const result = await executeAgent('dev', {
yoloMode: true,
storyPath: 'docs/stories/story-6.1.2.5.md'
});
\`\`\`

## API

- `executeAgent(agentId, args, timeout)` - Execute agent
- `loadAgent(agentId)` - Load agent configuration

## Dependencies

- `yaml` - YAML parsing
- `fs/promises` - File system operations
```

---

## Testing Standards

### Test File Naming

```bash
# Unit tests
tests/unit/context-detector.test.js
tests/unit/git-config-detector.test.js

# Integration tests
tests/integration/contextual-greeting.test.js
tests/integration/workflow-navigation.test.js

# E2E tests
tests/e2e/agent-activation.test.js
```

### Test Structure

```javascript
// ✅ GOOD: Descriptive test names with Given-When-Then
describe('ContextDetector', () => {
  describe('detectSessionType', () => {
    it('should return "new" when conversation history is empty', async () => {
      // Given
      const conversationHistory = [];
      const sessionFile = null;

      // When
      const result = await detectSessionType(conversationHistory, sessionFile);

      // Then
      expect(result).toBe('new');
    });

    it('should return "workflow" when command pattern matches story_development', async () => {
      // Given
      const conversationHistory = [{ command: 'validate-story-draft' }, { command: 'develop' }];

      // When
      const result = await detectSessionType(conversationHistory, null);

      // Then
      expect(result).toBe('workflow');
    });
  });
});
```

### Code Coverage

- **Minimum:** 80% for all new modules
- **Target:** 90% for core modules
- **Critical:** 100% for security/validation modules

```bash
# Run coverage
npm test -- --coverage

# Coverage thresholds in package.json
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

## Git Conventions

### Commit Messages

```bash
# ✅ GOOD: Conventional Commits format
feat: implement contextual agent greeting system [Story 6.1.2.5]
fix: resolve git config cache invalidation issue [Story 6.1.2.5]
docs: update coding standards with TypeScript config
chore: update ESLint configuration
refactor: extract greeting builder into separate module
test: add unit tests for WorkflowNavigator

# ❌ BAD: Vague or non-descriptive
update files
fix bug
changes
wip
```

**Format:**

```
<type>: <description> [Story <id>]

<optional body>

<optional footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Build/tooling changes
- `refactor`: Code refactoring (no functional change)
- `test`: Test additions/modifications
- `perf`: Performance improvements
- `style`: Code style changes (formatting, etc.)

### Branch Naming

```bash
# ✅ GOOD: Descriptive branch names
feature/story-6.1.2.5-contextual-greeting
fix/git-config-cache-ttl
refactor/agent-executor-optimization
docs/update-coding-standards

# ❌ BAD: Vague branch names
update
fix
my-branch
```

---

## Security Standards

### Input Validation

```javascript
// ✅ GOOD: Validate all external inputs
function executeCommand(command) {
  // Whitelist validation
  const allowedCommands = ['help', 'develop', 'review', 'deploy'];

  if (!allowedCommands.includes(command)) {
    throw new Error(`Invalid command: ${command}`);
  }

  return runCommand(command);
}

// ❌ BAD: No validation
function executeCommand(command) {
  return eval(command); // NEVER DO THIS
}
```

### Path Traversal Protection

```javascript
// ✅ GOOD: Validate file paths
const path = require('path');

function loadFile(filePath) {
  const basePath = path.resolve(__dirname, '.aiox-core');
  const resolvedPath = path.resolve(basePath, filePath);

  // Prevent directory traversal
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Invalid file path');
  }

  return fs.readFile(resolvedPath, 'utf8');
}

// ❌ BAD: Direct path usage
function loadFile(filePath) {
  return fs.readFile(filePath, 'utf8'); // Vulnerable to ../../../etc/passwd
}
```

### Secrets Management

```javascript
// ✅ GOOD: Use environment variables
const apiKey = process.env.CLICKUP_API_KEY;

if (!apiKey) {
  throw new Error('CLICKUP_API_KEY environment variable not set');
}

// ❌ BAD: Hardcoded secrets
const apiKey = 'pk_12345678_abcdefgh'; // NEVER DO THIS
```

### Dependency Security

```bash
# Regular security audits
npm audit
npm audit fix

# Use Snyk or similar for continuous monitoring
```

---

## Enforcement

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm test
```

### CI/CD Pipeline

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

### CodeRabbit Integration

All PRs automatically reviewed by CodeRabbit for:

- Code quality issues
- Security vulnerabilities
- Performance problems
- Best practice violations
- Test coverage gaps

---

## Version History

| Version | Date       | Changes                                                     | Author           |
| ------- | ---------- | ----------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Initial coding standards document                           | Aria (architect) |
| 1.1     | 2025-12-14 | Updated migration notice to SynkraAI/aiox-core [Story 6.10] | Dex (dev)        |

---

**Related Documents:**

- [Tech Stack](./tech-stack.md)
- [Source Tree](./source-tree.md)

---

_This is an official AIOX framework standard. All code contributions must comply._
