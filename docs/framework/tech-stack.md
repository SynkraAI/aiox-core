# AIOX Technology Stack

> 🌐 **EN** | [PT](../pt/framework/tech-stack.md) | [ES](../es/framework/tech-stack.md)

**Version:** 1.1
**Last Updated:** 2025-12-14
**Status:** Official Framework Standard
**Migration Notice:** This document will migrate to `SynkraAI/aiox-core` repository in Q2 2026 (see Decision 005)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Runtime](#core-runtime)
- [Languages & Transpilers](#languages--transpilers)
- [Core Dependencies](#core-dependencies)
- [Development Tools](#development-tools)
- [Testing Framework](#testing-framework)
- [Build & Deployment](#build--deployment)
- [External Integrations](#external-integrations)
- [Future Stack (Post-Migration)](#future-stack-post-migration)

---

## Overview

AIOX is built on modern JavaScript/TypeScript with Node.js runtime, optimized for cross-platform CLI development with interactive UX and agent orchestration capabilities.

**Philosophy:**

- Prefer **boring technology** where possible (proven, stable dependencies)
- Choose **exciting technology** only where necessary (performance, DX improvements)
- Minimize dependencies (reduce supply chain risk)
- Cross-platform first (Windows, macOS, Linux)

---

## Core Runtime

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**Why Node.js 18+:**

- ✅ Native `fetch()` API (no need for axios/node-fetch)
- ✅ ES2022 module support (top-level await)
- ✅ V8 10.2+ (performance improvements)
- ✅ Active LTS support (security patches)
- ✅ Cross-platform (Windows/macOS/Linux)

**Package Manager:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (user choice)
Lock File: package-lock.json
```

---

## Languages & Transpilers

### JavaScript (Primary)

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**Why ES2022:**

- ✅ Class fields and private methods
- ✅ Top-level await
- ✅ Error cause
- ✅ Array.at() method
- ✅ Object.hasOwn()

### TypeScript (Type Definitions)

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**Current TypeScript Usage:**

```typescript
// index.d.ts - Type definitions for public API
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**TypeScript Configuration:**

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

## Core Dependencies

### CLI & Interactive UX

#### @clack/prompts (^0.11.0)

**Purpose:** Modern CLI prompts with beautiful UX
**Usage:** Interactive wizard, user input collection
**Why:** Best-in-class UX, spinner animations, progress bars

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

**Purpose:** Terminal string styling
**Usage:** Colored output, formatting
**Why:** Cross-platform, zero dependencies, stable API

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**Purpose:** Lightweight color library (faster alternative to chalk)
**Usage:** Performance-critical color output
**Why:** 14x smaller than chalk, 2x faster

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**Purpose:** Terminal spinners
**Usage:** Loading indicators, async operations
**Why:** Beautiful spinners, customizable, widely used

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### File System & Path Operations

#### fs-extra (^11.3.2)

**Purpose:** Enhanced file system operations
**Usage:** File copying, directory creation, JSON read/write
**Why:** Promise-based, additional utilities over built-in `fs`

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Purpose:** File pattern matching
**Usage:** Finding files by patterns (e.g., `*.md`, `**/*.yaml`)
**Why:** Fast, supports gitignore patterns

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### YAML Processing

#### yaml (^2.8.1)

**Purpose:** YAML parsing and serialization
**Usage:** Agent configs, workflows, templates
**Why:** Fast, spec-compliant, preserves comments

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**Purpose:** Alternative YAML parser (legacy support)
**Usage:** Parsing older YAML files
**Why:** Different API, used in some legacy code

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**Migration Note:** Consolidate to single YAML library (Story 6.2.x)

### Markdown Processing

#### @kayvan/markdown-tree-parser (^1.5.0)

**Purpose:** Parse markdown into AST
**Usage:** Story parsing, document structure analysis
**Why:** Lightweight, fast, supports GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### Process Execution

#### execa (^9.6.0)

**Purpose:** Better child_process
**Usage:** Running git, npm, external CLI tools
**Why:** Cross-platform, promise-based, better error handling

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### Command Line Parsing

#### commander (^14.0.1)

**Purpose:** CLI framework
**Usage:** Parsing command-line arguments, subcommands
**Why:** Industry standard, rich features, TypeScript support

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

**Purpose:** Interactive command line prompts
**Usage:** User input collection, wizards
**Why:** Rich prompt types, validation support

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

### Sandboxing & Security

#### isolated-vm (^5.0.4)

**Purpose:** V8 isolate for sandboxed JavaScript execution
**Usage:** Safe execution of user scripts, task execution
**Why:** Security isolation, memory limits, timeout control

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### Validation

#### validator (^13.15.15)

**Purpose:** String validators and sanitizers
**Usage:** Input validation (URLs, emails, etc.)
**Why:** Comprehensive, well-tested, no dependencies

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // Valid URL
}
```

#### semver (^7.7.2)

**Purpose:** Semantic versioning parser and comparison
**Usage:** Version checking, dependency resolution
**Why:** NPM standard, battle-tested

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // Version compatible
}
```

---

## Development Tools

### Linting

#### ESLint (^9.38.0)

**Purpose:** JavaScript/TypeScript linter
**Configuration:** `.eslintrc.json`
**Plugins:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**Key Rules:**

```javascript
{
  "rules": {
    "no-console": "off",           // Allow console in CLI
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### Formatting

#### Prettier (^3.5.3)

**Purpose:** Code formatter
**Configuration:** `.prettierrc`

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

**Purpose:** YAML file linter
**Usage:** Validate agent configs, workflows, templates

### Git Hooks

#### husky (^9.1.7)

**Purpose:** Git hooks management
**Usage:** Pre-commit linting, pre-push tests

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

**Purpose:** Run linters on staged files
**Configuration:**

```json
{
  "lint-staged": {
    "**/*.md": ["prettier --write"],
    "**/*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Testing Framework

### Jest (^30.2.0)

**Purpose:** Testing framework
**Usage:** Unit tests, integration tests, coverage

```javascript
// Example test
describe('AgentExecutor', () => {
  it('should load agent configuration', async () => {
    const agent = await loadAgent('dev');
    expect(agent.name).toBe('developer');
  });
});
```

**Configuration:**

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

**Purpose:** TypeScript type definitions for Jest
**Usage:** Type-safe test writing

---

## Build & Deployment

### Versioning & Release

#### semantic-release (^25.0.2)

**Purpose:** Automated semantic versioning and releases
**Usage:** Automatic NPM publishing, changelog generation

**Plugins:**

- `@semantic-release/changelog` (^6.0.3) - Generate CHANGELOG.md
- `@semantic-release/git` (^10.0.1) - Commit release assets

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

### Build Scripts

```bash
# Package building
npm run build                  # Build all packages
npm run build:agents           # Build agents only
npm run build:teams            # Build teams only

# Versioning
npm run version:patch          # Bump patch version
npm run version:minor          # Bump minor version
npm run version:major          # Bump major version

# Publishing
npm run publish:dry-run        # Test publish
npm run publish:preview        # Publish preview tag
npm run publish:stable         # Publish latest tag
```

---

## External Integrations

### MCP Servers

AIOX integrates with Model Context Protocol (MCP) servers:

```yaml
MCP Servers:
  - clickup-direct: ClickUp integration (task management)
  - context7: Documentation lookup
  - exa-direct: Web search
  - desktop-commander: File operations
  - docker-mcp: Docker management
  - ide: VS Code/Cursor integration
```

**Configuration:** `.claude.json` or `.cursor/settings.json`

### CLI Tools

External CLI tools used by agents:

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

### Cloud Services

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

## Future Stack (Post-Migration)

**Planned for Q2-Q4 2026** (after repository restructuring):

### ESM Migration

```javascript
// Current: CommonJS
const agent = require('./agent');
module.exports = { executeAgent };

// Future: ES Modules
import { agent } from './agent.js';
export { executeAgent };
```

### Full TypeScript

```typescript
// Migrate from JS + .d.ts to full TypeScript
// Benefits: Type safety, better refactoring, improved DX
```

### Build Tooling

```yaml
Bundler: esbuild or tsup
Reason: Fast builds, tree-shaking, minification
Target: Single executable CLI (optional)
```

### Testing Improvements

```yaml
E2E Testing: Playwright (browser automation tests)
Performance Testing: Benchmark.js (workflow timing)
```

---

## Dependency Management

### Security Audits

```bash
# Run security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

### Update Policy

```yaml
Major Updates: Quarterly review (Q1, Q2, Q3, Q4)
Security Patches: Immediate (within 48 hours)
Minor Updates: Monthly review
Dependency Reduction: Ongoing effort
```

### Dependency Tree

```bash
# View dependency tree
npm ls --depth=2

# Find duplicate packages
npm dedupe

# Analyze bundle size
npx cost-of-modules
```

---

## Version Compatibility Matrix

| Component        | Version | Compatibility | Notes                 |
| ---------------- | ------- | ------------- | --------------------- |
| **Node.js**      | 18.0.0+ | Required      | Active LTS            |
| **npm**          | 9.0.0+  | Required      | Package manager       |
| **TypeScript**   | 5.9.3   | Recommended   | Type definitions      |
| **ESLint**       | 9.38.0  | Required      | Linting               |
| **Prettier**     | 3.5.3   | Required      | Formatting            |
| **Jest**         | 30.2.0  | Required      | Testing               |
| **Git**          | 2.30+   | Required      | Version control       |
| **GitHub CLI**   | 2.x+    | Optional      | Repository management |
| **Railway CLI**  | 3.x+    | Optional      | Deployment            |
| **Supabase CLI** | 1.x+    | Optional      | Database management   |

---

## Performance Considerations

### Bundle Size

```bash
# Production bundle size (minified)
Total: ~5MB (includes all dependencies)

# Critical dependencies (always loaded):
- commander: 120KB
- chalk: 15KB
- yaml: 85KB
- fs-extra: 45KB

# Optional dependencies (lazy loaded):
- inquirer: 650KB (interactive mode only)
- @clack/prompts: 180KB (wizard mode only)
```

### Startup Time

```yaml
Cold Start: ~200ms (initial load)
Warm Start: ~50ms (cached modules)
Yolo Mode: ~100ms (skip validation)

Optimization Strategy:
  - Lazy load heavy dependencies
  - Cache parsed YAML configs
  - Use require() conditionally
```

### Memory Usage

```yaml
Baseline: 30MB (Node.js + AIOX core)
Agent Execution: +10MB (per agent)
Story Processing: +20MB (markdown parsing)
Peak: ~100MB (typical workflow)
```

---

## Platform-Specific Notes

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

## Environment Variables

```bash
# AIOX Configuration
AIOX_DEBUG=true                    # Enable debug logging
AIOX_CONFIG_PATH=/custom/path      # Custom config location
AIOX_YOLO_MODE=true               # Force yolo mode

# Node.js
NODE_ENV=production                # Production mode
NODE_OPTIONS=--max-old-space-size=4096  # Increase memory limit

# External Services
CLICKUP_API_KEY=pk_xxx            # ClickUp integration
GITHUB_TOKEN=ghp_xxx              # GitHub API access
RAILWAY_TOKEN=xxx                 # Railway deployment
SUPABASE_ACCESS_TOKEN=xxx         # Supabase CLI auth
```

---

## Related Documents

- [Coding Standards](./coding-standards.md)
- [Source Tree](./source-tree.md)

---

## Version History

| Version | Date       | Changes                                                                                  | Author           |
| ------- | ---------- | ---------------------------------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Initial tech stack documentation                                                         | Aria (architect) |
| 1.1     | 2025-12-14 | Updated migration notice to SynkraAI/aiox-core, semantic-release to v25.0.2 [Story 6.10] | Dex (dev)        |

---

_This is an official AIOX framework standard. All technology choices must align with this stack._
