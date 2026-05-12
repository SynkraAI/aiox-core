# AIOX Service Discovery Guide

> **EN** | [PT](../pt/guides/service-discovery.md) | [ES](../es/guides/service-discovery.md)

---

> How to discover, query, and use workers in the AIOX framework.

**Version:** 2.1.0
**Last Updated:** 2025-12-01

---

## Overview

The Service Discovery system enables finding and using workers (tasks, templates, scripts, workflows) across the AIOX framework. The **Service Registry** is the central catalog containing metadata about all available workers.

### Key Concepts

| Concept              | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| **Worker**           | Any executable unit: task, template, script, workflow                      |
| **Service Registry** | Central catalog of all workers with metadata                               |
| **Category**         | Worker type: `task`, `template`, `script`, `checklist`, `workflow`, `data` |
| **Tag**              | Searchable label for grouping workers                                      |

---

## Service Registry API

### Loading the Registry

```javascript
const { getRegistry, loadRegistry } = require('./.aiox-core/core/registry/registry-loader');

// Quick load (returns registry data)
const registry = await loadRegistry();
console.log(`Loaded ${registry.totalWorkers} workers`);

// Full loader with methods
const reg = getRegistry();
await reg.load();
```

### Querying Workers

#### Get by ID

```javascript
const registry = getRegistry();
const worker = await registry.getById('create-story');

console.log(worker);
// {
//   id: 'create-story',
//   name: 'Create Story',
//   category: 'task',
//   path: '.aiox-core/development/tasks/po-create-story.md',
//   tags: ['task', 'creation', 'story', 'product'],
//   agents: ['po']
// }
```

#### Get by Category

```javascript
// Get all tasks
const tasks = await registry.getByCategory('task');
console.log(`Found ${tasks.length} tasks`);

// Get all templates
const templates = await registry.getByCategory('template');
```

#### Get by Tag

```javascript
// Single tag
const devTasks = await registry.getByTag('development');

// Multiple tags (AND logic)
const qaDevTasks = await registry.getByTags(['testing', 'development']);
```

#### Get Workers for Agent

```javascript
// Get all workers assigned to the dev agent
const devWorkers = await registry.getForAgent('dev');

// Get workers for multiple agents
const teamWorkers = await registry.getForAgents(['dev', 'qa']);
```

#### Search

```javascript
// Text search across worker names and descriptions
const results = await registry.search('validate', { maxResults: 10 });

// Search within category
const taskResults = await registry.search('story', {
  category: 'task',
  maxResults: 5,
});
```

### Registry Information

```javascript
const registry = getRegistry();

// Get metadata
const info = await registry.getInfo();
// { version: '1.0.0', generated: '2025-12-01', totalWorkers: 203 }

// Get category summary
const categories = await registry.getCategories();
// { task: 115, template: 52, script: 55, ... }

// Get all tags
const tags = await registry.getTags();
// ['task', 'creation', 'story', 'testing', ...]

// Count workers
const count = await registry.count();
// 203
```

---

## CLI Commands

### `aiox discover`

Search for workers in the registry.

```bash
# Search by text
aiox discover "create story"

# Search by category
aiox discover --category task

# Search by tag
aiox discover --tag testing

# Search for agent
aiox discover --agent dev

# Combine filters
aiox discover --category task --tag development --agent dev
```

**Output:**

```
Found 5 workers matching "create story":

  [task] po-create-story
         Path: .aiox-core/development/tasks/po-create-story.md
         Tags: task, creation, story, product
         Agents: po

  [task] dev-create-brownfield-story
         Path: .aiox-core/development/tasks/dev-create-brownfield-story.md
         Tags: task, creation, brownfield
         Agents: dev

  ...
```

### `aiox info`

Get detailed information about a specific worker.

```bash
# Get worker info by ID
aiox info create-story

# Get worker info with full path
aiox info --path .aiox-core/development/tasks/po-create-story.md
```

**Output:**

```
Worker: create-story
========================
Name:        Create Story
Category:    task
Path:        .aiox-core/development/tasks/po-create-story.md

Description:
  Creates a new user story from template with proper formatting
  and acceptance criteria.

Inputs:
  - story-title (string, required)
  - epic-id (string, optional)
  - priority (string, optional)

Outputs:
  - story-file-path (string)

Tags:
  task, creation, story, product

Agents:
  po

Performance:
  Avg Duration: 1m
  Cacheable: No
  Parallelizable: No
```

### `aiox list`

List workers by category or agent.

```bash
# List all tasks
aiox list tasks

# List all templates
aiox list templates

# List workers for agent
aiox list --agent dev

# List with pagination
aiox list tasks --page 1 --limit 20
```

---

## Service Types

### Tasks

Executable workflow definitions for agents.

```yaml
# Example task structure
task:
  name: create-story
  version: 1.0.0
  description: 'Creates a new user story'

inputs:
  - name: story-title
    type: string
    required: true

outputs:
  - name: story-file-path
    type: string

steps:
  - name: gather-requirements
    action: elicit
  - name: generate-story
    action: template-render
```

**Location:** `.aiox-core/development/tasks/`

### Templates

Document and code templates for generation.

| Template                   | Purpose                   |
| -------------------------- | ------------------------- |
| `story-tmpl.yaml`          | Story document template   |
| `prd-tmpl.yaml`            | PRD template              |
| `architecture-tmpl.yaml`   | Architecture doc template |
| `component-react-tmpl.tsx` | React component template  |
| `ide-rules/*.md`           | IDE-specific rules        |

**Location:** `.aiox-core/product/templates/`

### Scripts

JavaScript utilities for automation.

| Script                | Purpose                   |
| --------------------- | ------------------------- |
| `backup-manager.js`   | Backup/restore operations |
| `template-engine.js`  | Template processing       |
| `git-wrapper.js`      | Git operations            |
| `security-checker.js` | Security validation       |

**Location:** `.aiox-core/infrastructure/scripts/`

### Workflows

Multi-step development processes.

| Workflow                    | Use Case                      |
| --------------------------- | ----------------------------- |
| `greenfield-fullstack.yaml` | New full-stack project        |
| `brownfield-fullstack.yaml` | Existing project enhancement  |
| `greenfield-service.yaml`   | New backend service           |
| `brownfield-ui.yaml`        | Existing frontend enhancement |

**Location:** `.aiox-core/development/workflows/`

### Checklists

Quality validation checklists.

| Checklist                | Purpose                  |
| ------------------------ | ------------------------ |
| `story-dod-checklist.md` | Story Definition of Done |
| `pre-push-checklist.md`  | Pre-push validation      |
| `architect-checklist.md` | Architecture review      |
| `release-checklist.md`   | Release validation       |

**Location:** `.aiox-core/product/checklists/`

---

## Worker Registration

### Automatic Registration

Workers are automatically registered when the registry is built:

```bash
# Rebuild registry
node .aiox-core/core/registry/build-registry.js
```

The builder scans:

- `.aiox-core/development/tasks/**/*.md`
- `.aiox-core/product/templates/**/*`
- `.aiox-core/infrastructure/scripts/**/*.js`
- `.aiox-core/product/checklists/**/*.md`
- `.aiox-core/development/workflows/**/*.yaml`
- `.aiox-core/core/data/**/*`

### Worker Entry Schema

```json
{
  "id": "create-story",
  "name": "Create Story",
  "description": "Creates a new user story from template",
  "category": "task",
  "subcategory": "creation",
  "inputs": ["story-title", "epic-id"],
  "outputs": ["story-file-path"],
  "tags": ["task", "creation", "story", "product"],
  "path": ".aiox-core/development/tasks/po-create-story.md",
  "taskFormat": "TASK-FORMAT-V1",
  "executorTypes": ["Agent", "Worker"],
  "performance": {
    "avgDuration": "1m",
    "cacheable": false,
    "parallelizable": false
  },
  "agents": ["po"],
  "metadata": {
    "source": "development",
    "addedVersion": "1.0.0"
  }
}
```

---

## Caching

The registry loader implements intelligent caching:

| Feature             | Description                             |
| ------------------- | --------------------------------------- |
| **TTL Cache**       | 5 minutes default expiration            |
| **Indexed Lookups** | O(1) by ID, category, tag               |
| **Lazy Loading**    | Registry loaded on first query          |
| **Manual Refresh**  | Force reload with `registry.load(true)` |

### Cache Operations

```javascript
const registry = getRegistry();

// Force reload (bypass cache)
await registry.load(true);

// Clear cache
registry.clearCache();

// Check if cached
const isCached = registry.isCached();
```

---

## Code Examples

### Find All Tasks for an Agent

```javascript
const { getRegistry } = require('./.aiox-core/core/registry/registry-loader');

async function getAgentTasks(agentId) {
  const registry = getRegistry();
  const tasks = await registry.getForAgent(agentId);

  return tasks.filter((w) => w.category === 'task');
}

// Usage
const devTasks = await getAgentTasks('dev');
console.log(`Dev agent has ${devTasks.length} tasks`);
```

### Search and Execute Task

```javascript
const { getRegistry } = require('./.aiox-core/core/registry/registry-loader');
const { TaskExecutor } = require('./.aiox-core/development/scripts/task-executor');

async function findAndExecute(searchTerm, inputs) {
  const registry = getRegistry();
  const results = await registry.search(searchTerm, {
    category: 'task',
    maxResults: 1,
  });

  if (results.length === 0) {
    throw new Error(`No task found for: ${searchTerm}`);
  }

  const task = results[0];
  const executor = new TaskExecutor(task.path);
  return executor.execute(inputs);
}

// Usage
await findAndExecute('create story', {
  'story-title': 'Implement user authentication',
  'epic-id': 'EPIC-001',
});
```

### List Workers by Category

```javascript
const { getRegistry } = require('./.aiox-core/core/registry/registry-loader');

async function listByCategory() {
  const registry = getRegistry();
  const categories = await registry.getCategories();

  for (const [category, count] of Object.entries(categories)) {
    console.log(`${category}: ${count} workers`);
  }
}

// Output:
// task: 115 workers
// template: 52 workers
// script: 55 workers
// checklist: 11 workers
// workflow: 7 workers
// data: 3 workers
```

---

## Troubleshooting

### Registry Not Loading

```bash
# Verify registry file exists
ls .aiox-core/core/registry/service-registry.json

# Rebuild registry
node .aiox-core/core/registry/build-registry.js

# Validate registry
node .aiox-core/core/registry/validate-registry.js
```

### Worker Not Found

1. Check worker file exists in expected location
2. Verify file has proper YAML frontmatter
3. Rebuild registry to include new workers
4. Check category and tags in search query

### Performance Issues

```javascript
// Check cache status
const registry = getRegistry();
console.log('Cached:', registry.isCached());

// Clear cache if stale
registry.clearCache();
await registry.load(true);
```

---

## Related Documentation

- [Module System Architecture](../architecture/module-system.md)
- [Quality Gates Guide](./quality-gates.md)

---

_Synkra AIOX v4 Service Discovery Guide_
