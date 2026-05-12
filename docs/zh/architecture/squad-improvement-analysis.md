<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/squad-improvement-analysis.md | 同步: 2026-02-22 -->

# 项目分析：Squad 改进系统

> [EN](../../architecture/squad-improvement-analysis.md) | [PT](../../pt/architecture/squad-improvement-analysis.md) | [ES](../../es/architecture/squad-improvement-analysis.md) | **ZH**

---

**生成日期:** 2025-12-26
**生成者:** @architect (Aria)
**功能:** Squad 分析和持续改进任务
**Story:** TBD (提案: SQS-11)

---

## 项目结构

| 方面         | 值                             |
| ------------ | ------------------------------ |
| 框架         | AIOX-FullStack                 |
| 主要语言     | TypeScript/JavaScript          |
| Squad 系统   | v4.2 (Task-First 架构)         |
| 现有任务     | 8 个 squad-creator 任务        |
| 测试框架     | Jest                           |

---

## 当前 Squad Creator 清单

### 代理定义

| 属性           | 值                                         |
| -------------- | ------------------------------------------ |
| **代理 ID**    | squad-creator                              |
| **名称**       | Craft                                      |
| **职位**       | Squad Creator                              |
| **图标**       | 🏗️                                         |
| **文件**       | `.aiox-core/development/agents/squad-creator.md` |

### 现有任务

| 任务               | 文件                         | 状态        | 用途             |
| ------------------ | ---------------------------- | ----------- | ---------------- |
| `*design-squad`    | squad-creator-design.md      | ✅ 就绪     | 从文档设计       |
| `*create-squad`    | squad-creator-create.md      | ✅ 就绪     | 创建新 squad     |
| `*validate-squad`  | squad-creator-validate.md    | ✅ 就绪     | 验证结构         |
| `*list-squads`     | squad-creator-list.md        | ✅ 就绪     | 列出本地 squads  |
| `*migrate-squad`   | squad-creator-migrate.md     | ✅ 就绪     | 迁移旧格式       |
| `*download-squad`  | squad-creator-download.md    | ⏳ 占位符   | 从注册表下载     |
| `*publish-squad`   | squad-creator-publish.md     | ⏳ 占位符   | 发布到 aiox-squads |
| `*sync-squad-synkra` | squad-creator-sync-synkra.md | ⏳ 占位符  | 同步到市场       |

### 现有脚本

| 脚本            | 文件                 | 用途             |
| --------------- | -------------------- | ---------------- |
| SquadLoader     | squad-loader.js      | 解析和加载清单   |
| SquadValidator  | squad-validator.js   | 根据 schema 验证 |
| SquadGenerator  | squad-generator.js   | 生成 squad 结构  |
| SquadDesigner   | squad-designer.js    | 从文档设计       |
| SquadMigrator   | squad-migrator.js    | 迁移旧格式       |
| SquadDownloader | squad-downloader.js  | 从注册表下载     |
| SquadPublisher  | squad-publisher.js   | 发布到 aiox-squads |

---

## 差距分析

### 当前工作流覆盖

```
┌─────────────────────────────────────────────────────────────────┐
│                      SQUAD 生命周期                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 设计      *design-squad            ✅ 已覆盖               │
│       ↓                                                         │
│  2. 创建      *create-squad            ✅ 已覆盖               │
│       ↓                                                         │
│  3. 验证      *validate-squad          ✅ 已覆盖               │
│       ↓                                                         │
│  4. 改进      ??? (缺失)               ❌ 差距                 │
│       ↓                                                         │
│  5. 分发      *publish-squad           ⏳ 占位符               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 缺失的能力

| 能力             | 描述                                     | 影响                         |
| ---------------- | ---------------------------------------- | ---------------------------- |
| **分析 Squad**   | 扫描现有 squad，列出组件，识别机会       | 无法了解 squad 包含什么      |
| **添加组件**     | 增量添加新 agents/tasks/templates/tools  | 必须重新创建 squad 来添加组件 |
| **修改组件**     | 编辑现有组件                             | 无指导式工作流               |
| **移除组件**     | 移除未使用的组件                         | 需要手动清理                 |
| **Story 集成**   | 将改进链接到官方 stories                 | 无可追溯性                   |

### Squad 组件 (来自 schema)

| 组件       | 目录       | 用途             | 可添加? |
| ---------- | ---------- | ---------------- | ------- |
| tasks      | tasks/     | 任务定义 (task-first!) | ❌ 无任务 |
| agents     | agents/    | 代理角色         | ❌ 无任务 |
| workflows  | workflows/ | 多步骤工作流     | ❌ 无任务 |
| checklists | checklists/| 验证检查清单     | ❌ 无任务 |
| templates  | templates/ | 文档模板         | ❌ 无任务 |
| tools      | tools/     | 自定义工具 (.js) | ❌ 无任务 |
| scripts    | scripts/   | 自动化脚本       | ❌ 无任务 |
| data       | data/      | 静态数据文件     | ❌ 无任务 |

---

## 用户旅程分析

### 当前 (有问题)

```
用户: "我想向现有 squad 添加新代理"

1. 用户在 agents/ 中手动创建代理文件
2. 用户手动更新 squad.yaml components.agents[]
3. 用户运行 *validate-squad (可能失败)
4. 用户手动修复问题
5. 无文档记录添加了什么
6. 无链接到任何 story
```

### 期望 (使用新任务)

```
用户: "我想向现有 squad 添加新代理"

1. 用户运行 *analyze-squad my-squad
   → 显示当前结构、组件、建议

2. 用户运行 *extend-squad my-squad
   → 交互式: "您想添加什么?"
   → 选项: agent, task, template, tool, workflow, checklist, script, data
   → 使用模板指导创建
   → 自动更新 squad.yaml
   → 自动验证

3. 可选通过 --story SQS-XX 标志链接到 story
```

---

## 相关 Stories

| Story  | 状态     | 相关性                      |
| ------ | -------- | --------------------------- |
| SQS-4  | ✅ 就绪  | Squad Creator Agent (基础)  |
| SQS-9  | ✅ 就绪  | Squad Designer (design-squad) |
| SQS-10 | ✅ 就绪  | 项目配置参考                |
| **SQS-11** | 📋 提案 | Squad 分析和扩展任务        |

---

## 参考模式: analyze-project-structure.md

现有任务 `analyze-project-structure.md` 提供了良好的模式：

1. **引出** - 询问要添加什么功能
2. **扫描** - 扫描项目结构
3. **模式分析** - 识别现有模式
4. **建议** - 生成建议
5. **输出文档** - 创建分析文档

此模式可以适用于 squad 分析。

---

## 检测到的技术模式

### 语言分布
- **TypeScript:** 主要用于脚本
- **JavaScript:** 工具和 squad 脚本
- **Markdown:** 代理/任务定义

### 测试
- **框架:** Jest
- **覆盖率:** 核心脚本 >80%
- **位置:** `tests/unit/squad/`

### 配置
- **Schema:** JSON Schema 验证
- **清单:** squad.yaml (YAML)
- **继承:** extend/override/none

---

## 建议摘要

1. **创建 `*analyze-squad` 任务** - 分析现有 squad 结构
2. **创建 `*extend-squad` 任务** - 增量添加组件
3. **创建 `squad-analyzer.js` 脚本** - 核心分析逻辑
4. **创建 `squad-extender.js` 脚本** - 扩展逻辑
5. **更新 squad-creator.md 代理** - 添加新命令
6. **链接到 story 系统** - 可选 --story 标志

---

**下一文档:** [recommended-approach.md](./squad-improvement-recommended-approach.md)
