<!-- 翻译: ZH-CN | 原始: /docs/pt/architecture/source-tree.md | 同步: 2026-02-22 -->

# AIOX 代码树结构

> 🌐 [EN](../../architecture/source-tree.md) | [PT](../../pt/architecture/source-tree.md) | **ZH**

---

> ⚠️ **已弃用**: 此文件仅为向后兼容性而保留。
>
> **官方版本**: [docs/framework/source-tree.md](../framework/source-tree.md)
>
> 此文件将在 Q2 2026 后在 `docs/framework/` 完全合并后被移除。

---

# AIOX 代码树结构

**版本**: 1.1
**最后更新**: 2025-12-14
**状态**: 已弃用 - 请查看 docs/framework/source-tree.md
**迁移通知**: 此文档将在 Q2 2026 迁移到 `SynkraAI/aiox-core` 存储库（参见决策 005）

---

## 📋 目录

- [概述](#概述)
- [当前结构 (aiox-core Brownfield)](#当前结构-aiox-core-brownfield)
- [框架核心 (.aiox-core/)](#框架核心-aiox-core)
- [文档 (docs/)](#文档-docs)
- [Squad 系统](#squad-系统)
- [未来结构 (Q2 2026 迁移后)](#未来结构-q2-2026-迁移后)
- [文件命名约定](#文件命名约定)
- [新文件放置位置](#新文件放置位置)

---

## 概述

AIOX 使用**双层架构**:

1. **框架核心** (`.aiox-core/`) - 可移植框架组件
2. **项目工作空间** (根目录) - 特定项目实现

**理念**:

- 框架组件是**可移植的** (在项目间移动)
- 项目文件是**特定的** (brownfield 实现)
- 清晰的**职责分离** (框架 vs 项目)

---

## 当前结构 (aiox-core Brownfield)

```
aiox-core/                             # 根目录 (brownfield 项目)
├── .aiox-core/                        # 框架核心 (可移植)
│   ├── core/                          # 框架必要组件 (v4)
│   │   ├── config/                    # 配置系统
│   │   ├── data/                      # 核心知识库
│   │   ├── docs/                      # 核心文档
│   │   ├── elicitation/               # 交互式提示引擎
│   │   ├── session/                   # 运行时状态管理
│   │   └── utils/                     # 核心工具
│   ├── product/                       # PM/PO 资产 (v4)
│   │   ├── templates/                 # 文档模板 (52+ 文件)
│   │   ├── checklists/                # 验证清单 (6 文件)
│   │   └── data/                      # PM 特定数据 (6 文件)
│   ├── agents/                        # 代理定义
│   ├── tasks/                         # 任务工作流
│   ├── workflows/                     # 多步工作流
│   ├── scripts/                       # 实用脚本
│   ├── tools/                         # 工具集成
│   └── core-config.yaml               # 框架配置
│
├── docs/                              # 文档
│   ├── architecture/                  # 架构决策 + 官方文档
│   ├── framework/                     # ⭐ 新: 官方框架文档
│   ├── stories/                       # 开发故事
│   ├── epics/                         # Epic 规划
│   ├── decisions/                     # 架构决策记录 (ADR)
│   ├── guides/                        # 实用指南
│   ├── qa/                            # QA 报告
│   └── prd/                           # 产品需求
│
├── templates/                         # 项目模板
│   └── squad/                         # Squad 模板用于扩展 (见 docs/guides/squads-guide.md)
│
├── bin/                               # CLI 可执行文件
│   ├── @synkra/aiox-core.js              # 主 CLI 入口点
│   └── aiox-minimal.js                # 最小 CLI
│
├── tools/                             # 构建和实用工具
│   ├── cli.js                         # CLI 构建器
│   ├── package-builder.js             # 包构建器
│   └── installer/                     # 安装脚本
│
├── tests/                             # 测试套件
│   ├── unit/                          # 单元测试
│   ├── integration/                   # 集成测试
│   └── e2e/                           # 端到端测试
│
├── .claude/                           # Claude Code IDE 配置
│   ├── settings.json                  # 项目设置
│   ├── CLAUDE.md                      # 项目说明
│   └── commands/                      # 斜杠命令 (代理)
│
├── outputs/                           # 运行时输出
│   ├── minds/                         # MMOS 认知克隆
│   └── architecture-map/              # 架构分析
│
├── .ai/                               # ⭐ 新: AI 会话工件
│   └── decision-log-{story-id}.md     # yolo 模式决策日志
│
├── index.js                           # 主入口点 (CommonJS)
├── index.esm.js                       # ES Module 入口
├── index.d.ts                         # TypeScript 定义
├── package.json                       # 包清单
├── tsconfig.json                      # TypeScript 配置
├── .eslintrc.json                     # ESLint 配置
├── .prettierrc                        # Prettier 配置
└── README.md                          # 项目 README
```

---

## 框架核心 (.aiox-core/)

**目的**: 可在任何 AIOX 项目中工作的可移植框架组件。

### 目录结构

```
.aiox-core/
├── agents/                            # 145 个代理定义
│   ├── aiox-master.md                 # 主编排器
│   ├── dev.md                         # 开发代理
│   ├── qa.md                          # QA 工程师代理
│   ├── architect.md                   # 系统架构师代理
│   ├── po.md                          # 产品经理代理
│   ├── pm.md                          # 项目经理代理
│   ├── sm.md                          # Scrum 主管代理
│   ├── analyst.md                     # 业务分析师代理
│   ├── ux-expert.md                   # UX 设计师代理
│   ├── data-engineer.md               # 数据工程师代理
│   ├── devops.md                      # DevOps 代理
│   ├── db-sage.md                     # 数据库架构师代理
│   └── .deprecated/                   # 已归档代理
│
├── tasks/                             # 60 个任务工作流
│   ├── create-next-story.md           # 创建故事工作流
│   ├── develop-story.md               # 开发故事工作流
│   ├── validate-next-story.md         # 验证故事工作流
│   ├── review-story.md                # 审查故事工作流
│   ├── apply-qa-fixes.md              # QA 修复工作流
│   ├── execute-checklist.md           # 清单执行
│   ├── document-project.md            # 项目文档化
│   ├── create-doc.md                  # 文档创建
│   ├── shard-doc.md                   # 文档分片
│   └── ...                            # 再加 50+ 任务
│
├── templates/                         # 20 个文档模板
│   ├── story-tmpl.yaml                # 故事模板 v2.0
│   ├── design-story-tmpl.yaml         # 设计故事模板 v1.0
│   ├── prd-tmpl.yaml                  # 产品需求文档模板
│   ├── epic-tmpl.md                   # Epic 模板
│   ├── architecture-tmpl.yaml         # 架构模板
│   ├── fullstack-architecture-tmpl.yaml  # 全栈架构模板
│   ├── brownfield-architecture-tmpl.yaml # Brownfield 架构模板
│   ├── schema-design-tmpl.yaml        # 数据库 schema 模板
│   └── ...                            # 再加 12+ 模板
│
├── workflows/                         # 6 个多步工作流
│   ├── greenfield-fullstack.yaml      # 绿地全栈工作流
│   ├── greenfield-service.yaml        # 绿地服务工作流
│   ├── greenfield-ui.yaml             # 绿地 UI 工作流
│   ├── brownfield-fullstack.yaml      # Brownfield 全栈工作流
│   ├── brownfield-service.yaml        # Brownfield 服务工作流
│   └── brownfield-ui.yaml             # Brownfield UI 工作流
│
├── checklists/                        # 6 个验证清单
│   ├── po-master-checklist.md         # PO 验证清单
│   ├── story-draft-checklist.md       # 故事草稿验证
│   ├── architect-checklist.md         # 架构审查清单
│   ├── qa-checklist.md                # QA 清单
│   ├── pm-checklist.md                # PM 清单
│   └── change-checklist.md            # 变更管理清单
│
├── data/                              # 6 个知识库文件
│   ├── aiox-kb.md                     # AIOX 知识库
│   ├── technical-preferences.md       # 技术栈偏好
│   ├── elicitation-methods.md         # 启发方法
│   ├── brainstorming-techniques.md    # 头脑风暴方法
│   ├── test-levels-framework.md       # 测试级别框架
│   └── test-priorities-matrix.md      # 测试优先级矩阵
│
├── scripts/                             # 54 个实用脚本
│   ├── component-generator.js         # 组件脚手架生成
│   ├── elicitation-engine.js          # 交互式启发
│   ├── story-manager.js               # 故事生命周期管理
│   ├── yaml-validator.js              # YAML 验证
│   ├── usage-analytics.js             # 框架使用分析
│   └── ...                            # 再加 49+ 工具
│
├── tools/                             # 工具集成
│   ├── mcp/                           # MCP 服务器配置
│   │   ├── clickup-direct.yaml        # ClickUp 集成
│   │   ├── context7.yaml              # Context7 集成
│   │   └── exa-direct.yaml            # Exa 搜索集成
│   ├── cli/                           # CLI 工具包装
│   │   ├── github-cli.yaml            # GitHub CLI 包装
│   │   └── railway-cli.yaml           # Railway CLI 包装
│   └── local/                         # 本地工具
│
├── elicitation/                       # 3 个启发引擎
│   ├── agent-elicitation.js           # 代理创建启发
│   ├── task-elicitation.js            # 任务创建启发
│   └── workflow-elicitation.js        # 工作流创建启发
│
├── agent-teams/                       # 代理团队配置
│   └── ...                            # 团队定义
│
├── core-config.yaml                   # ⭐ 框架配置
├── install-manifest.yaml              # 安装清单
├── user-guide.md                      # 用户指南
└── working-in-the-brownfield.md       # Brownfield 开发指南
```

### 文件模式

```yaml
Agents:
  位置: .aiox-core/agents/
  格式: Markdown + YAML frontmatter
  命名: {agent-name}.md (kebab-case)
  示例: developer.md, qa-engineer.md

Tasks:
  位置: .aiox-core/tasks/
  格式: Workflow Markdown
  命名: {task-name}.md (kebab-case)
  示例: create-next-story.md, develop-story.md

Templates:
  位置: .aiox-core/product/templates/
  格式: YAML 或 Markdown
  命名: {template-name}-tmpl.{yaml|md}
  示例: story-tmpl.yaml, prd-tmpl.md

Workflows:
  位置: .aiox-core/workflows/
  格式: YAML
  命名: {workflow-type}-{scope}.yaml
  示例: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  位置: .aiox-core/product/checklists/
  格式: Markdown
  命名: {checklist-name}-checklist.md
  示例: story-draft-checklist.md, architect-checklist.md

Utilities:
  位置: .aiox-core/utils/
  格式: JavaScript (CommonJS)
  命名: {utility-name}.js (kebab-case)
  示例: component-generator.js, story-manager.js
```

---

## 文档 (docs/)

### 当前组织

```
docs/
├── architecture/                      # ⚠️ 混合: 官方 + 项目特定
│   ├── coding-standards.md            # ✅ 官方 (迁移到 REPO 1)
│   ├── tech-stack.md                  # ✅ 官方 (迁移到 REPO 1)
│   ├── source-tree.md                 # ✅ 官方 (迁移到 REPO 1)
│   ├── decision-analysis-*.md         # 项目特定决策
│   ├── architectural-review-*.md      # 项目特定审查
│   └── mcp-*.md                       # 框架文档 (迁移到 REPO 1)
│
├── framework/                         # ⭐ 新: 官方框架文档 (Q2 2026)
│   ├── coding-standards.md            # 框架编码标准
│   ├── tech-stack.md                  # 框架技术栈
│   ├── source-tree.md                 # 框架代码树
│   └── README.md                      # 迁移通知
│
├── stories/                           # 开发故事
│   ├── aiox migration/                # AIOX 迁移故事
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # 其他故事
│
├── epics/                             # Epic 规划
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # 其他 Epic
│
├── decisions/                         # 架构决策记录
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # 其他 ADR
│
├── guides/                            # 实用指南
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # 其他指南
│
├── qa/                                # QA 工件
│   └── backlog-archive/               # 已存档 QA 项
│
├── prd/                               # 产品需求文档
│   └── ...                            # PRD 文件
│
├── planning/                          # 规划文档
│   └── ...                            # Sprint 计划、Roadmap
│
├── standards/                         # 框架标准
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # ⭐ 故事待办项索引
```

### 建议的重组 (Story 6.1.2.6)

```
docs/
├── framework/                         # ✅ 官方框架文档
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── agent-spec.md
│   ├── task-spec.md
│   └── workflow-spec.md
│
├── architecture/                      # 项目特定架构
│   ├── project-decisions/             # ✅ 此项目的 ADR
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # 架构图
│
├── stories/                           # 开发故事
│   ├── index.md                       # ⭐ 故事索引 (自动生成)
│   ├── backlog.md                     # ⭐ 故事待办项 (官方)
│   └── ...                            # 故事文件
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Squad 系统

> **注意**: Squad 替代了 OSR-8 中已弃用的 "Squad" 系统。完整文档见 [Squad 指南](../guides/squads-guide.md)。

### 概述

Squad 是添加专用功能到 AIOX 的模块化扩展。不同于已弃用的 Squad，Squad 遵循标准化模板结构。

### Squad 模板位置

```
templates/squad/                       # 创建扩展的 Squad 模板
├── squad.yaml                         # Squad 清单模板
├── package.json                       # NPM 包模板
├── README.md                          # 文档模板
├── LICENSE                            # 许可证模板
├── .gitignore                         # Git 忽略模板
├── agents/                            # Squad 特定代理
│   └── example-agent.yaml
├── tasks/                             # Squad 特定任务
│   └── example-task.yaml
├── workflows/                         # Squad 特定工作流
│   └── example-workflow.yaml
├── templates/                         # Squad 特定模板
│   └── example-template.md
└── tests/                             # Squad 测试
    └── example-agent.test.js
```

### 创建新 Squad

```bash
# 计划中的 CLI (未来):
npx create-aiox-squad my-squad-name

# 当前方法:
cp -r templates/squad/ squads/my-squad-name/
# 然后自定义 squad.yaml 和组件
```

### Squad 清单结构

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: 此 Squad 所做功能的描述
author: 你的名字
license: MIT

# 此 Squad 提供的组件
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# 依赖关系
dependencies:
  aiox-core: '>=2.1.0'
```

### Squad 迁移

| 旧版本 (已弃用)          | 当前版本 (Squad)                |
| ---------------------- | ------------------------------ |
| 目录 `Squads/`         | 模板 `templates/squad/`        |
| 配置 `legacyPacksLocation` | 配置 `squadsTemplateLocation`  |
| 清单 `pack.yaml`        | 清单 `squad.yaml`              |
| 直接加载              | 基于模板创建               |

---

## 未来结构 (Q2 2026 迁移后)

**决策 005 定义 5 个单独存储库**:

### 存储库 1: SynkraAI/aiox-core (MIT)

```
aiox-core/
├── src/                               # 源代码
│   ├── core/                          # 核心编排引擎
│   │   ├── agent-executor.js
│   │   ├── task-runner.js
│   │   └── workflow-orchestrator.js
│   ├── integrations/                  # 外部集成
│   │   ├── mcp/                       # MCP 编排
│   │   └── ide/                       # IDE 集成
│   └── cli/                           # CLI 接口
│
├── .aiox-core/                        # 框架资产 (当前结构)
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── ...
│
├── docs/                              # 框架文档
│   ├── getting-started/
│   ├── core-concepts/
│   ├── integrations/
│   └── api/
│
├── examples/                          # 示例项目
│   ├── basic-agent/
│   ├── vibecoder-demo/
│   └── multi-agent-workflow/
│
└── tests/                             # 测试套件
    ├── unit/
    ├── integration/
    └── e2e/
```

### 存储库 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # AIOX 审核的 Squad
│   ├── github-devops/
│   ├── db-sage/
│   └── coderabbit-workflow/
│
├── community/                         # 社区提交
│   ├── marketing-agency/
│   ├── sales-automation/
│   └── ...
│
├── templates/                         # Squad 模板
│   ├── minimal-squad/
│   └── agent-squad/
│
└── tools/                             # Squad 开发工具
    └── create-aiox-squad/
```

### 存储库 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # MCP 预设 (Docker MCP Toolkit)
│   ├── aiox-dev/
│   ├── aiox-research/
│   └── aiox-docker/
│
├── mcps/                              # MCP 基础配置
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # IDE 集成
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### 存储库 4: SynkraAI/certified-partners (私有)

```
certified-partners/
├── premium-packs/                     # 高级 Squad
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # 合作伙伴成功平台
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # Marketplace 平台
    ├── api/
    └── web/
```

### 存储库 5: SynkraAI/mmos (私有 + NDA)

```
mmos/
├── minds/                             # 34 个认知克隆
│   ├── pedro-valerio/
│   ├── paul-graham/
│   └── ...
│
├── emulator/                          # MMOS 仿真引擎
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # 研究工件
    └── transcripts/
```

---

## 文件命名约定

### 通用规则

```yaml
目录: kebab-case (小写，用连字符分隔)
  ✅ .aiox-core/
  ✅ Squads/
  ❌ .AIOX-Core/
  ❌ legacy-packs/

文件 (代码): kebab-case + 扩展名
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

文件 (文档): kebab-case + .md 扩展名
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

文件 (配置): 小写或 kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### 特殊情况

```yaml
故事:
  格式: story-{epic}.{story}.{substory}.md
  示例: story-6.1.2.5.md

Epic:
  格式: epic-{number}-{name}.md
  示例: epic-6.1-agent-identity-system.md

决策:
  格式: decision-{number}-{name}.md
  示例: decision-005-repository-restructuring-FINAL.md

模板:
  格式: {name}-tmpl.{yaml|md}
  示例: story-tmpl.yaml, prd-tmpl.md

清单:
  格式: {name}-checklist.md
  示例: architect-checklist.md
```

---

## 新文件放置位置

### 决策矩阵

```yaml
# 我在创建新代理:
位置: .aiox-core/agents/{agent-name}.md
示例: .aiox-core/agents/security-expert.md

# 我在创建新任务:
位置: .aiox-core/tasks/{task-name}.md
示例: .aiox-core/tasks/deploy-to-production.md

# 我在创建新工作流:
位置: .aiox-core/workflows/{workflow-name}.yaml
示例: .aiox-core/workflows/continuous-deployment.yaml

# 我在创建新模板:
位置: .aiox-core/product/templates/{template-name}-tmpl.{yaml|md}
示例: .aiox-core/product/templates/deployment-plan-tmpl.yaml

# 我在编写故事:
位置: docs/stories/{epic-context}/{story-file}.md
示例: docs/stories/aiox migration/story-6.1.2.6.md

# 我在记录架构决策:
位置: docs/architecture/project-decisions/{decision-file}.md
示例: docs/architecture/project-decisions/decision-006-auth-strategy.md

# 我在创建官方框架文档:
位置: docs/framework/{doc-name}.md
示例: docs/framework/agent-development-guide.md

# 我在创建实用脚本:
位置: .aiox-core/utils/{utility-name}.js
示例: .aiox-core/utils/performance-monitor.js

# 我在创建测试:
位置: tests/{type}/{test-name}.test.js
示例: tests/unit/agent-executor.test.js

# 我在创建 Squad:
位置: 从 templates/squad/ 复制到 Squad 目录
示例: squads/devops-automation/ (从模板自定义)
```

---

## 特殊目录

### .ai/ 目录 (新 - Story 6.1.2.6)

```
.ai/                                   # AI 会话工件
├── decision-log-6.1.2.5.md            # yolo 模式决策日志
├── decision-log-6.1.2.6.md            # 另一个决策日志
└── session-{date}-{agent}.md          # 会话抄本 (可选)
```

**目的**: 追踪 AI 在开发会话中做出的决策（尤其是 yolo 模式）

**自动生成**: 是 (启用 yolo 模式时)

### outputs/ 目录

```
outputs/                               # 运行时输出 (gitignored)
├── minds/                             # MMOS 认知克隆
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # 架构分析
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**目的**: 不提交到 git 的运行时工件

---

## 相关文档

- [编码标准](./coding-standards.md)
- [技术栈](./tech-stack.md)

---

## 版本历史

| 版本 | 日期       | 变更                                                            | 作者            |
| ---- | ---------- | -------------------------------------------------------------- | --------------- |
| 1.0  | 2025-01-15 | 代码树初始文档化                                               | Aria (architect)|
| 1.1  | 2025-12-14 | 更新 org 为 SynkraAI，用 Squad 系统替换 Squads [Story 6.10]    | Dex (dev)       |

---

_这是 AIOX 框架的官方模式。所有文件放置应遵循此结构。_
