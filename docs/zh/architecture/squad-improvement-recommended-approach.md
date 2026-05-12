<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/squad-improvement-recommended-approach.md | 同步: 2026-02-22 -->

# 推荐方案：Squad 改进系统

> [EN](../../architecture/squad-improvement-recommended-approach.md) | [PT](../../pt/architecture/squad-improvement-recommended-approach.md) | [ES](../../es/architecture/squad-improvement-recommended-approach.md) | **ZH**

---

**生成日期:** 2025-12-26
**生成者:** @architect (Aria)
**功能:** Squad 分析和持续改进任务
**提案 Story:** SQS-11

---

## 功能需求

**描述:** 创建任务来分析现有 squads 并增量添加/修改组件，支持无需重新创建的 squad 持续改进。

**需要 API 集成:** 否
**需要数据库更改:** 否

---

## 提案的新任务

### 1. `*analyze-squad` - 分析现有 Squad

**用途:** 扫描和分析现有 squad，显示其结构、组件和改进机会。

**用法:**
```bash
@squad-creator

*analyze-squad my-squad
# → my-squad 的完整分析

*analyze-squad my-squad --verbose
# → 带文件内容的详细分析

*analyze-squad my-squad --suggestions
# → 包含 AI 生成的建议
```

**输出:**
- Squad 概览（名称、版本、作者）
- 组件清单（任务、代理等）
- 依赖分析
- 覆盖率指标（哪些目录为空）
- 改进建议

### 2. `*extend-squad` - 添加/修改组件

**用途:** 交互式地向现有 squad 添加新组件。

**用法:**
```bash
@squad-creator

*extend-squad my-squad
# → 交互模式，询问要添加什么

*extend-squad my-squad --add agent
# → 添加新代理

*extend-squad my-squad --add task --agent my-agent
# → 为特定代理添加新任务

*extend-squad my-squad --add workflow
# → 添加新工作流

*extend-squad my-squad --story SQS-XX
# → 将更改链接到 story
```

**支持的组件:**
| 组件      | 标志              | 创建               |
| --------- | ----------------- | ------------------ |
| 代理      | `--add agent`     | `agents/{name}.md` |
| 任务      | `--add task`      | `tasks/{agent}-{task}.md` |
| 工作流    | `--add workflow`  | `workflows/{name}.md` |
| 检查清单  | `--add checklist` | `checklists/{name}.md` |
| 模板      | `--add template`  | `templates/{name}.md` |
| 工具      | `--add tool`      | `tools/{name}.js` |
| 脚本      | `--add script`    | `scripts/{name}.js` |
| 数据      | `--add data`      | `data/{name}.yaml` |

---

## 服务类型

**推荐:** 实用服务（内部任务 + 脚本）

**理由:**
- 不需要外部 API 集成
- 仅文件系统操作
- 遵循现有 squad-creator 模式
- 与现有 validator/loader 集成

---

## 建议的结构

### 新任务文件

```
.aiox-core/development/tasks/
├── squad-creator-analyze.md     # 新增: *analyze-squad
└── squad-creator-extend.md      # 新增: *extend-squad
```

### 新脚本文件

```
.aiox-core/development/scripts/squad/
├── squad-analyzer.js            # 新增: 分析逻辑
└── squad-extender.js            # 新增: 扩展逻辑
```

### 更新的文件

```
.aiox-core/development/agents/squad-creator.md  # 添加新命令
.aiox-core/schemas/squad-schema.json            # (无需更改)
```

---

## 实施阶段

### 阶段 1：分析任务 (4-6h)

1. **创建 `squad-creator-analyze.md`**
   - 定义任务格式 (TASK-FORMAT-SPECIFICATION-V1)
   - 引出：squad 名称、输出格式
   - 步骤：扫描、分析、生成报告

2. **创建 `squad-analyzer.js`**
   - `analyzeSquad(squadPath)` → 返回分析对象
   - 组件清单
   - 覆盖率指标
   - 依赖检查

3. **添加测试**
   - `tests/unit/squad/squad-analyzer.test.js`
   - 目标：80%+ 覆盖率

### 阶段 2：扩展任务 (6-8h)

4. **创建 `squad-creator-extend.md`**
   - 定义任务格式
   - 引出：组件类型、名称、详情
   - 步骤：验证、创建、更新清单、重新验证

5. **创建 `squad-extender.js`**
   - `addAgent(squadPath, agentDef)`
   - `addTask(squadPath, taskDef)`
   - `addTemplate(squadPath, templateDef)`
   - 等等，每种组件类型
   - 自动更新 squad.yaml

6. **添加测试**
   - `tests/unit/squad/squad-extender.test.js`
   - 目标：80%+ 覆盖率

### 阶段 3：代理集成 (2-3h)

7. **更新 `squad-creator.md`**
   - 添加 `*analyze-squad` 命令
   - 添加 `*extend-squad` 命令
   - 更新依赖部分

8. **同步 IDE 规则**
   - 运行同步脚本到 .claude, .cursor 等

### 阶段 4：文档 (2-3h)

9. **更新文档**
   - 更新 `docs/guides/squads-guide.md`
   - 在 squad-examples/ 中添加示例
   - 更新 epic-sqs-squad-system.md

10. **创建 Story**
    - `docs/stories/v4.0.4/sprint-XX/story-sqs-11-squad-improvement.md`

---

## 详细任务规格

### `squad-creator-analyze.md`

```yaml
task: analyzeSquad()
responsible: squad-creator (Craft)
responsible_type: Agent
atomic_layer: Analysis
elicit: true

inputs:
- field: squad_name
  type: string
  source: User Input
  required: true
  validation: Squad 存在于 ./squads/

- field: output_format
  type: string
  source: User Input
  required: false
  validation: console|markdown|json

outputs:
- field: analysis_report
  type: object
  destination: 控制台或文件
  persisted: false
```

**输出示例:**
```
=== Squad 分析: my-domain-squad ===

📋 概览
  名称: my-domain-squad
  版本: 1.0.0
  作者: John Doe
  许可证: MIT

📦 组件
  ├── 代理 (2)
  │   ├── lead-agent.md
  │   └── helper-agent.md
  ├── 任务 (3)
  │   ├── lead-agent-task1.md
  │   ├── lead-agent-task2.md
  │   └── helper-agent-task1.md
  ├── 工作流 (0) ← 空
  ├── 模板 (1)
  │   └── report-template.md
  ├── 工具 (0) ← 空
  └── 检查清单 (0) ← 空

📊 覆盖率
  任务: ████████░░ 80% (3/4 代理有任务)
  文档: ██████████ 100% (README 存在)
  配置: ████████░░ 80% (tech-stack 缺失)

💡 建议
  1. 添加代理验证检查清单
  2. 创建常用代理序列的工作流
  3. 在 config/ 中添加 tech-stack.md
```

### `squad-creator-extend.md`

```yaml
task: extendSquad()
responsible: squad-creator (Craft)
responsible_type: Agent
atomic_layer: Modification
elicit: true

inputs:
- field: squad_name
  type: string
  source: User Input
  required: true

- field: component_type
  type: string
  source: User Input
  required: true
  validation: agent|task|workflow|checklist|template|tool|script|data

- field: component_name
  type: string
  source: User Input
  required: true
  validation: kebab-case

- field: story_id
  type: string
  source: User Input
  required: false
  validation: SQS-XX 格式

outputs:
- field: created_file
  type: string
  destination: Squad 目录
  persisted: true

- field: updated_manifest
  type: boolean
  destination: squad.yaml
  persisted: true
```

---

## 代理分配

| 角色     | 代理      | 职责           |
| -------- | --------- | -------------- |
| 主要     | @dev (Dex) | 实现脚本和任务 |
| 支持     | @qa (Quinn) | 测试实现       |
| 审查     | @architect (Aria) | 架构审查    |

---

## 依赖

### 运行时依赖
- Node.js 18+
- 现有 squad 脚本 (loader, validator, generator)

### 开发依赖
- Jest (测试)
- js-yaml (YAML 解析)

---

## 工作量估算

| 阶段                | 工作量   | 依赖                |
| ------------------- | -------- | ------------------- |
| 阶段 1：分析任务    | 4-6h     | SQS-4 (完成)        |
| 阶段 2：扩展任务    | 6-8h     | 阶段 1              |
| 阶段 3：代理集成    | 2-3h     | 阶段 2              |
| 阶段 4：文档        | 2-3h     | 阶段 3              |
| **总计**            | **14-20h** |                   |

---

## Story 集成

### 提案 Story: SQS-11

**标题:** Squad 分析和扩展任务

**Epic:** SQS (Squad 系统增强)

**Sprint:** Sprint 14 (或下一个可用)

**验收标准:**
- [ ] `*analyze-squad` 显示完整 squad 清单
- [ ] `*extend-squad` 可以添加所有组件类型
- [ ] 扩展时自动更新 squad.yaml
- [ ] 扩展后运行验证
- [ ] 可选 --story 标志用于可追溯性
- [ ] 80%+ 测试覆盖率
- [ ] 文档已更新

---

## 后续步骤

1. **审查并批准**此方案
2. **创建 Story SQS-11** 在 `docs/stories/v4.0.4/sprint-XX/`
3. **执行 `*create-service squad-analyzer`** 创建结构（或手动创建）
4. **开始实现** 与 @dev

---

## 考虑过的替代方案

### 方案 A：单一 `*improve-squad` 任务（不推荐）
- 在单一任务中组合分析 + 扩展
- 过于复杂，违反单一职责
- 难以测试

### 方案 B：多个细粒度任务（不推荐）
- `*add-agent`, `*add-task`, `*add-workflow` 等
- 太多命令需要记忆
- 用户体验不一致

### 方案 C：两个任务 - 分析 + 扩展（推荐 ✅）
- 职责分离清晰
- 先分析，后扩展
- 与现有模式一致

---

**创建者:** @architect (Aria)
**日期:** 2025-12-26
**状态:** 等待批准

---

*下一步: 创建 Story SQS-11 或继续实现*
