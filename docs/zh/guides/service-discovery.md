# AIOS服务发现指南

> **[EN](../../guides/service-discovery.md)** | [PT](../../pt/guides/service-discovery.md) | [ES](../../es/guides/service-discovery.md) | **中文 (ZH)**

---

> 如何在AIOS框架中发现、查询和使用工作者。

**版本:** 2.1.0
**最后更新:** 2025-12-01

---

## 概述

服务发现系统能够在AIOS框架中找到和使用工作者（任务、模板、脚本、工作流）。**服务注册表**是包含所有可用工作者元数据的中央目录。

### 关键概念

| 概念              | 描述                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| **工作者**           | 任何可执行单元：任务、模板、脚本、工作流                      |
| **服务注册表** | 所有工作者及其元数据的中央目录                       |
| **类别**         | 工作者类型：`task`、`template`、`script`、`checklist`、`workflow`、`data` |
| **标签**              | 用于分组工作者的可搜索标签                                      |

---

## 服务注册表API

### 加载注册表

```javascript
const { getRegistry, loadRegistry } = require('./.aios-core/core/registry/registry-loader');

// 快速加载（返回注册表数据）
const registry = await loadRegistry();
console.log(`加载了 ${registry.totalWorkers} 个工作者`);

// 完整加载器（带方法）
const reg = getRegistry();
await reg.load();
```

### 查询工作者

#### 按ID获取

```javascript
const registry = getRegistry();
const worker = await registry.getById('create-story');

console.log(worker);
// {
//   id: 'create-story',
//   name: '创建故事',
//   category: 'task',
//   path: '.aios-core/development/tasks/po-create-story.md',
//   tags: ['task', 'creation', 'story', 'product'],
//   agents: ['po']
// }
```

#### 按类别获取

```javascript
// 获取所有任务
const tasks = await registry.getByCategory('task');
console.log(`找到 ${tasks.length} 个任务`);

// 获取所有模板
const templates = await registry.getByCategory('template');
```

#### 按标签获取

```javascript
// 单个标签
const devTasks = await registry.getByTag('development');

// 多个标签（AND逻辑）
const qaDevTasks = await registry.getByTags(['testing', 'development']);
```

#### 获取代理的工作者

```javascript
// 获取分配给dev代理的所有工作者
const devWorkers = await registry.getForAgent('dev');

// 获取多个代理的工作者
const teamWorkers = await registry.getForAgents(['dev', 'qa']);
```

#### 搜索

```javascript
// 在工作者名称和描述中进行文本搜索
const results = await registry.search('validate', { maxResults: 10 });

// 在类别中搜索
const taskResults = await registry.search('story', {
  category: 'task',
  maxResults: 5,
});
```

### 注册表信息

```javascript
const registry = getRegistry();

// 获取元数据
const info = await registry.getInfo();
// { version: '1.0.0', generated: '2025-12-01', totalWorkers: 203 }

// 获取类别摘要
const categories = await registry.getCategories();
// { task: 115, template: 52, script: 55, ... }

// 获取所有标签
const tags = await registry.getTags();
// ['task', 'creation', 'story', 'testing', ...]

// 计数工作者
const count = await registry.count();
// 203
```

---

## CLI命令

### `aios discover`

在注册表中搜索工作者。

```bash
# 按文本搜索
aios discover "create story"

# 按类别搜索
aios discover --category task

# 按标签搜索
aios discover --tag testing

# 按代理搜索
aios discover --agent dev

# 组合过滤
aios discover --category task --tag development --agent dev
```

**输出:**

```
找到5个与"create story"匹配的工作者:

  [task] po-create-story
         路径: .aios-core/development/tasks/po-create-story.md
         标签: task, creation, story, product
         代理: po

  [task] dev-create-brownfield-story
         路径: .aios-core/development/tasks/dev-create-brownfield-story.md
         标签: task, creation, brownfield
         代理: dev

  ...
```

### `aios info`

获取特定工作者的详细信息。

```bash
# 按ID获取工作者信息
aios info create-story

# 按完整路径获取工作者信息
aios info --path .aios-core/development/tasks/po-create-story.md
```

**输出:**

```
工作者: create-story
========================
名称:        创建故事
类别:    任务
路径:        .aios-core/development/tasks/po-create-story.md

描述:
  从模板创建新用户故事，具有适当的格式
  和验收标准。

输入:
  - story-title (string, 必需)
  - epic-id (string, 可选)
  - priority (string, 可选)

输出:
  - story-file-path (string)

标签:
  task, creation, story, product

代理:
  po

性能:
  平均耗时: 1分钟
  可缓存: 否
  可并行化: 否
```

### `aios list`

按类别或代理列出工作者。

```bash
# 列出所有任务
aios list tasks

# 列出所有模板
aios list templates

# 列出代理的工作者
aios list --agent dev

# 列出分页结果
aios list tasks --page 1 --limit 20
```

---

## 服务类型

### 任务

代理的可执行工作流定义。

```yaml
# 示例任务结构
task:
  name: create-story
  version: 1.0.0
  description: '创建新用户故事'

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

**位置:** `.aios-core/development/tasks/`

### 模板

用于生成的文档和代码模板。

| 模板                   | 用途                   |
| -------------------------- | ------------------------- |
| `story-tmpl.yaml`          | 故事文档模板   |
| `prd-tmpl.yaml`            | PRD模板              |
| `architecture-tmpl.yaml`   | 架构文档模板 |
| `component-react-tmpl.tsx` | React组件模板  |
| `ide-rules/*.md`           | IDE特定规则        |

**位置:** `.aios-core/product/templates/`

### 脚本

用于自动化的JavaScript实用程序。

| 脚本                | 用途                   |
| --------------------- | ------------------------- |
| `backup-manager.js`   | 备份/恢复操作 |
| `template-engine.js`  | 模板处理       |
| `git-wrapper.js`      | Git操作            |
| `security-checker.js` | 安全验证       |

**位置:** `.aios-core/infrastructure/scripts/`

### 工作流

多步开发流程。

| 工作流                    | 用例                      |
| --------------------------- | ----------------------------- |
| `greenfield-fullstack.yaml` | 新全栈项目        |
| `brownfield-fullstack.yaml` | 现有项目增强  |
| `greenfield-service.yaml`   | 新后端服务           |
| `brownfield-ui.yaml`        | 现有前端增强 |

**位置:** `.aios-core/development/workflows/`

### 检查清单

质量验证检查清单。

| 检查清单                | 用途                  |
| ------------------------ | ------------------------ |
| `story-dod-checklist.md` | 故事完成定义 |
| `pre-push-checklist.md`  | 推送前验证      |
| `architect-checklist.md` | 架构审查      |
| `release-checklist.md`   | 发布验证       |

**位置:** `.aios-core/product/checklists/`

---

## 工作者注册

### 自动注册

构建注册表时自动注册工作者:

```bash
# 重建注册表
node .aios-core/core/registry/build-registry.js
```

构建器扫描:

- `.aios-core/development/tasks/**/*.md`
- `.aios-core/product/templates/**/*`
- `.aios-core/infrastructure/scripts/**/*.js`
- `.aios-core/product/checklists/**/*.md`
- `.aios-core/development/workflows/**/*.yaml`
- `.aios-core/core/data/**/*`

### 工作者条目架构

```json
{
  "id": "create-story",
  "name": "创建故事",
  "description": "从模板创建新用户故事",
  "category": "task",
  "subcategory": "creation",
  "inputs": ["story-title", "epic-id"],
  "outputs": ["story-file-path"],
  "tags": ["task", "creation", "story", "product"],
  "path": ".aios-core/development/tasks/po-create-story.md",
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

## 缓存

注册表加载器实现了智能缓存:

| 功能             | 描述                             |
| ------------------- | --------------------------------------- |
| **TTL缓存**       | 5分钟默认过期            |
| **索引查找** | 按ID、类别、标签O(1)               |
| **延迟加载**    | 首次查询时加载注册表          |
| **手动刷新**  | 使用 `registry.load(true)` 强制重新加载 |

### 缓存操作

```javascript
const registry = getRegistry();

// 强制重新加载（绕过缓存）
await registry.load(true);

// 清除缓存
registry.clearCache();

// 检查是否缓存
const isCached = registry.isCached();
```

---

## 代码示例

### 查找代理的所有任务

```javascript
const { getRegistry } = require('./.aios-core/core/registry/registry-loader');

async function getAgentTasks(agentId) {
  const registry = getRegistry();
  const tasks = await registry.getForAgent(agentId);

  return tasks.filter((w) => w.category === 'task');
}

// 使用
const devTasks = await getAgentTasks('dev');
console.log(`Dev代理有 ${devTasks.length} 个任务`);
```

### 搜索并执行任务

```javascript
const { getRegistry } = require('./.aios-core/core/registry/registry-loader');
const { TaskExecutor } = require('./.aios-core/development/scripts/task-executor');

async function findAndExecute(searchTerm, inputs) {
  const registry = getRegistry();
  const results = await registry.search(searchTerm, {
    category: 'task',
    maxResults: 1,
  });

  if (results.length === 0) {
    throw new Error(`未找到任务: ${searchTerm}`);
  }

  const task = results[0];
  const executor = new TaskExecutor(task.path);
  return executor.execute(inputs);
}

// 使用
await findAndExecute('create story', {
  'story-title': '实现用户认证',
  'epic-id': 'EPIC-001',
});
```

### 按类别列出工作者

```javascript
const { getRegistry } = require('./.aios-core/core/registry/registry-loader');

async function listByCategory() {
  const registry = getRegistry();
  const categories = await registry.getCategories();

  for (const [category, count] of Object.entries(categories)) {
    console.log(`${category}: ${count} 个工作者`);
  }
}

// 输出:
// task: 115 个工作者
// template: 52 个工作者
// script: 55 个工作者
// checklist: 11 个工作者
// workflow: 7 个工作者
// data: 3 个工作者
```

---

## 故障排除

### 注册表未加载

```bash
# 验证注册表文件是否存在
ls .aios-core/core/registry/service-registry.json

# 重建注册表
node .aios-core/core/registry/build-registry.js

# 验证注册表
node .aios-core/core/registry/validate-registry.js
```

### 找不到工作者

1. 检查工作者文件是否存在于预期位置
2. 验证文件是否有适当的YAML前置内容
3. 重建注册表以包含新工作者
4. 检查搜索查询中的类别和标签

### 性能问题

```javascript
// 检查缓存状态
const registry = getRegistry();
console.log('已缓存:', registry.isCached());

// 如果过时，清除缓存
registry.clearCache();
await registry.load(true);
```

---

## 相关文档

- [模块系统架构](../architecture/module-system.md)
- [质量门禁指南](./quality-gates.md)

---

_Synkra AIOS v4 服务发现指南_
