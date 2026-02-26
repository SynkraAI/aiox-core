<!-- 翻译：zh-CN 原文：/docs/framework/source-tree.md 最后同步：2026-02-22 -->

# AIOS 源代码树结构

> [EN](../../framework/source-tree.md) | [PT](../../pt/framework/source-tree.md) | [ES](../../es/framework/source-tree.md) | **ZH**

**版本:** 4.0.0
**最后更新:** 2026-02-11
**状态:** 官方框架标准
**仓库:** SynkraAI/aios-core

---

## 目录

- [概述](#概述)
- [模块化架构](#模块化架构)
- [框架核心 (.aios-core/)](#框架核心-aios-core)
- [模块详情](#模块详情)
- [文档 (docs/)](#文档-docs)
- [Squads 系统](#squads-系统)
- [自主开发引擎 (ADE)](#自主开发引擎-ade)
- [文件命名约定](#文件命名约定)
- [新文件放置位置](#新文件放置位置)

---

## 概述

AIOS 使用**模块化架构**，具有清晰的关注点分离：

1. **框架核心** (`.aios-core/`) - 按领域组织的可移植框架组件
2. **项目工作区** (root) - 项目特定的实现

**理念:**

- **领域驱动组织** - 按功能分组的组件
- **可移植性** - 框架组件可跨项目使用
- **关注点分离** - 模块之间有清晰的边界

---

## 模块化架构

```
aios-core/                             # 根项目
├── .aios-core/                        # 框架核心（模块化）
│   ├── cli/                           # CLI 命令和实用工具
│   ├── core/                          # 框架基础
│   ├── data/                          # 共享数据文件
│   ├── development/                   # 开发资产（代理、任务、工作流）
│   ├── docs/                          # 内部框架文档
│   ├── elicitation/                   # 引导引擎
│   ├── infrastructure/                # 基础设施工具和脚本
│   ├── manifests/                     # 安装清单
│   ├── product/                       # PM/PO 资产（模板、检查清单）
│   ├── quality/                       # 质量门模式
│   ├── scripts/                       # 实用脚本
│   └── core-config.yaml               # 框架配置
│
├── docs/                              # 公共文档
│   ├── architecture/                  # 架构文档
│   ├── framework/                     # 官方框架标准
│   ├── guides/                        # 操作指南
│   ├── installation/                  # 安装指南
│   └── community/                     # 社区文档
│
├── templates/                         # 项目模板
│   └── squad/                         # Squad 模板（参见 docs/guides/squads-guide.md）
│
├── bin/                               # CLI 可执行文件
│   └── aios.js                        # 主 CLI 入口点
│
├── tools/                             # 构建和实用工具
│   ├── cli.js                         # CLI 构建器
│   └── installer/                     # 安装脚本
│
├── tests/                             # 测试套件
│   ├── unit/                          # 单元测试
│   ├── integration/                   # 集成测试
│   └── e2e/                           # 端到端测试
│
├── .claude/                           # Claude Code 配置
│   ├── CLAUDE.md                      # 项目指令
│   ├── commands/                      # 代理斜杠命令
│   └── rules/                         # IDE 规则
│
├── index.js                           # 主入口点
├── package.json                       # 包清单
└── README.md                          # 项目 README
```

---

## 框架核心 (.aios-core/)

**目的:** 按领域组织的可移植框架组件，实现清晰的关注点分离。

### 目录结构 (v2.0 模块化)

```
.aios-core/
├── cli/                               # CLI 系统
│   ├── commands/                      # CLI 命令实现
│   │   ├── generate/                  # 代码生成命令
│   │   ├── manifest/                  # 清单管理
│   │   ├── mcp/                       # MCP 工具命令
│   │   ├── metrics/                   # 质量指标
│   │   ├── migrate/                   # 迁移工具
│   │   ├── qa/                        # QA 命令
│   │   └── workers/                   # 后台工作者
│   └── utils/                         # CLI 实用工具
│
├── core/                              # 框架基础
│   ├── config/                        # 配置系统
│   ├── data/                          # 核心知识库
│   ├── docs/                          # 核心文档
│   ├── elicitation/                   # 交互式提示引擎
│   ├── manifest/                      # 清单处理
│   ├── mcp/                           # MCP 编排
│   ├── migration/                     # 迁移实用工具
│   ├── quality-gates/                 # 质量门验证器
│   ├── registry/                      # 服务注册表
│   ├── session/                       # 运行时状态管理
│   └── utils/                         # 核心实用工具
│
├── data/                              # 共享数据
│   ├── aios-kb.md                     # AIOS 知识库（@aios-master，延迟加载）
│   ├── agent-config-requirements.yaml # 每个代理的配置加载规则（@architect，代理变更时更新）
│   ├── technical-preferences.md       # 用户/团队技术偏好（@architect，偏好变更时更新）
│   └── workflow-patterns.yaml         # 工作流检测模式（@sm，工作流变更时更新）
│
├── development/                       # 开发资产
│   ├── agents/                        # 代理定义（11个核心代理）
│   │   ├── aios-master.md             # 主编排器
│   │   ├── dev.md                     # 开发者代理
│   │   ├── qa.md                      # QA 工程师代理
│   │   ├── architect.md               # 系统架构师代理
│   │   ├── po.md                      # 产品负责人代理
│   │   ├── pm.md                      # 产品经理代理
│   │   ├── sm.md                      # Scrum Master 代理
│   │   ├── analyst.md                 # 业务分析师代理
│   │   ├── ux-design-expert.md        # UX 设计师代理
│   │   ├── data-engineer.md           # 数据工程师代理
│   │   └── devops.md                  # DevOps 代理
│   ├── agent-teams/                   # 代理团队配置
│   ├── tasks/                         # 任务工作流（60+任务）
│   ├── workflows/                     # 多步骤工作流
│   └── scripts/                       # 开发脚本
│
├── docs/                              # 内部文档
│   └── standards/                     # 框架标准
│
├── elicitation/                       # 引导引擎
│   ├── agent-elicitation.js           # 代理创建引导
│   ├── task-elicitation.js            # 任务创建引导
│   └── workflow-elicitation.js        # 工作流创建引导
│
├── infrastructure/                    # 基础设施
│   ├── integrations/                  # 外部集成
│   │   └── pm-adapters/               # PM 工具适配器（ClickUp、GitHub、Jira）
│   ├── scripts/                       # 基础设施脚本
│   │   ├── documentation-integrity/   # 文档完整性系统
│   │   └── llm-routing/               # LLM 路由实用工具
│   ├── templates/                     # 基础设施模板
│   │   ├── core-config/               # 配置模板
│   │   ├── github-workflows/          # CI/CD 模板
│   │   ├── gitignore/                 # Gitignore 模板
│   │   └── project-docs/              # 项目文档模板
│   ├── tests/                         # 基础设施测试
│   └── tools/                         # 工具集成
│       ├── cli/                       # CLI 工具包装器
│       ├── local/                     # 本地工具
│       └── mcp/                       # MCP 服务器配置
│
├── manifests/                         # 安装清单
│   └── schema/                        # 清单模式
│
├── product/                           # PM/PO 资产
│   ├── checklists/                    # 验证检查清单
│   │   ├── po-master-checklist.md     # PO 验证
│   │   ├── story-draft-checklist.md   # 故事草稿验证
│   │   ├── architect-checklist.md     # 架构评审
│   │   └── change-checklist.md        # 变更管理
│   ├── data/                          # PM 特定数据文件
│   │   ├── brainstorming-techniques.md    # 头脑风暴方法（@analyst，参考文档，很少更新）
│   │   ├── elicitation-methods.md         # 引导技术（@po，参考文档，很少更新）
│   │   ├── mode-selection-best-practices.md # 模式选择指南（@sm，工作流变更时更新）
│   │   ├── test-levels-framework.md       # 测试级别定义（@qa，测试策略变更时更新）
│   │   └── test-priorities-matrix.md      # 测试优先级规则（@qa，优先级变更时更新）
│   └── templates/                     # 文档模板
│       ├── engine/                    # 模板引擎
│       ├── ide-rules/                 # IDE 规则模板
│       ├── story-tmpl.yaml            # 故事模板
│       ├── prd-tmpl.yaml              # PRD 模板
│       └── epic-tmpl.md               # Epic 模板
│
├── quality/                           # 质量系统
│   └── schemas/                       # 质量门模式
│
├── scripts/                           # 根脚本
│   └── ...                            # 实用脚本
│
├── core-config.yaml                   # 框架配置
├── install-manifest.yaml              # 安装清单
├── user-guide.md                      # 用户指南
└── working-in-the-brownfield.md       # 遗留项目指南
```

### 文件模式

```yaml
Agents:
  Location: .aios-core/development/agents/
  Format: Markdown with YAML frontmatter
  Naming: {agent-name}.md (kebab-case)
  Example: dev.md, qa.md, architect.md

Tasks:
  Location: .aios-core/development/tasks/
  Format: Markdown workflow
  Naming: {task-name}.md (kebab-case)
  Example: create-next-story.md, develop-story.md

Templates:
  Location: .aios-core/product/templates/
  Format: YAML or Markdown
  Naming: {template-name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Location: .aios-core/development/workflows/
  Format: YAML
  Naming: {workflow-type}-{scope}.yaml
  Example: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Location: .aios-core/product/checklists/
  Format: Markdown
  Naming: {checklist-name}-checklist.md
  Example: story-draft-checklist.md, architect-checklist.md

Core Utilities:
  Location: .aios-core/core/utils/
  Format: JavaScript (CommonJS)
  Naming: {utility-name}.js (kebab-case)
  Example: component-generator.js, story-manager.js

CLI Commands:
  Location: .aios-core/cli/commands/{category}/
  Format: JavaScript (CommonJS)
  Naming: {command-name}.js (kebab-case)
  Example: generate/agent.js, manifest/install.js

Infrastructure Scripts:
  Location: .aios-core/infrastructure/scripts/{category}/
  Format: JavaScript
  Naming: {script-name}.js (kebab-case)
  Example: documentation-integrity/link-verifier.js
```

---

## 数据文件治理

代理激活时使用的所有数据文件必须有文档化的所有权、填充规则和更新触发器。

### 框架数据文件 (docs/framework/)

| 文件 | 所有者 | 填充规则 | 更新触发器 | 使用者 |
|------|--------|----------|------------|--------|
| `coding-standards.md` | @dev | 编码标准变更时更新 | `*update-standards` 任务或手动编辑 | @dev, @pm, @ux-design-expert, @sm |
| `tech-stack.md` | @architect | 技术栈决策时更新 | `*create-doc architecture` 或手动编辑 | @dev, @pm, @ux-design-expert, @analyst |
| `source-tree.md` | @architect | 结构变更时更新 | `*update-source-tree` 任务 | @dev, @analyst |

### 共享数据文件 (.aios-core/data/)

| 文件 | 所有者 | 填充规则 | 更新触发器 | 使用者 |
|------|--------|----------|------------|--------|
| `aios-kb.md` | @aios-master | 框架重大变更时更新 | 手动编辑 | @aios-master (延迟) |
| `agent-config-requirements.yaml` | @architect | 代理配置需求变更时更新 | 故事驱动 | AgentConfigLoader |
| `technical-preferences.md` | @architect | 偏好变更时更新 | 手动编辑或 `*add-tech-doc` | @dev, @qa, @devops, @architect, @data-engineer |
| `workflow-patterns.yaml` | @sm | 工作流变更时更新 | 手动编辑 | @sm, WorkflowNavigator |

### 产品数据文件 (.aios-core/product/data/)

| 文件 | 所有者 | 填充规则 | 更新触发器 | 使用者 |
|------|--------|----------|------------|--------|
| `brainstorming-techniques.md` | @analyst | 参考文档，很少更新 | 手动编辑 | @analyst |
| `elicitation-methods.md` | @po | 参考文档，很少更新 | 手动编辑 | @po |
| `mode-selection-best-practices.md` | @sm | 工作流变更时更新 | 手动编辑 | @sm |
| `test-levels-framework.md` | @qa | 测试策略变更时更新 | `*update-test-strategy` 或手动编辑 | @qa |
| `test-priorities-matrix.md` | @qa | 优先级变更时更新 | `*update-test-strategy` 或手动编辑 | @qa |

---

## 文档 (docs/)

### 当前组织

```
docs/
├── architecture/                      # 混合：官方 + 项目特定
│   ├── coding-standards.md            # 官方（迁移到仓库1）
│   ├── tech-stack.md                  # 官方（迁移到仓库1）
│   ├── source-tree.md                 # 官方（迁移到仓库1）
│   ├── decision-analysis-*.md         # 项目特定决策
│   ├── architectural-review-*.md      # 项目特定评审
│   └── mcp-*.md                       # 框架文档（迁移到仓库1）
│
├── framework/                         # 新：官方框架文档（2026年第二季度）
│   ├── coding-standards.md            # 框架编码标准
│   ├── tech-stack.md                  # 框架技术栈
│   ├── source-tree.md                 # 框架源代码树
│   └── README.md                      # 迁移通知
│
├── stories/                           # 开发故事
│   ├── aios migration/                # AIOS 迁移故事
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # 其他故事
│
├── epics/                             # Epic 规划
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # 其他 epics
│
├── decisions/                         # 架构决策记录
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # 其他 ADR
│
├── guides/                            # 操作指南
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # 其他指南
│
├── qa/                                # QA 工件
│   └── backlog-archive/               # 归档的 QA 项目
│
├── prd/                               # 产品需求文档
│   └── ...                            # PRD 文件
│
├── planning/                          # 规划文档
│   └── ...                            # Sprint 计划、路线图
│
├── standards/                         # 框架标准
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # 故事待办列表索引
```

### 建议的重组（Story 6.1.2.6）

```
docs/
├── framework/                         # 官方框架文档
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── agent-spec.md
│   ├── task-spec.md
│   └── workflow-spec.md
│
├── architecture/                      # 项目特定架构
│   ├── project-decisions/             # 此项目的 ADR
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # 架构图
│
├── stories/                           # 开发故事
│   ├── index.md                       # 故事索引（自动生成）
│   ├── backlog.md                     # 故事待办（官方）
│   └── ...                            # 故事文件
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Squads 系统

> **注意:** Squads 在 OSR-8 中取代了旧的"Squads"系统。完整文档请参见 [Squads 指南](../guides/squads-guide.md)。

### 概述

Squads 是为 AIOS 添加专门功能的模块化扩展。与已弃用的 Squads 不同，Squads 遵循标准化的模板结构。

### Squad 模板位置

```
templates/squad/                       # 用于创建扩展的 Squad 模板
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
# 未来 CLI（计划中）：
npx create-aios-squad my-squad-name

# 当前方法：
cp -r templates/squad/ squads/my-squad-name/
# 然后自定义 squad.yaml 和组件
```

### Squad 清单结构

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Description of what this squad does
author: Your Name
license: MIT

# 此 squad 提供的组件
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# 依赖
dependencies:
  aios-core: '>=2.1.0'
```

### 从 Squads 迁移

| 旧版（已弃用） | 当前（Squads） |
| -------------- | -------------- |
| `Squads/` 目录 | `templates/squad/` 模板 |
| `legacyPacksLocation` 配置 | `squadsTemplateLocation` 配置 |
| `pack.yaml` 清单 | `squad.yaml` 清单 |
| 直接加载 | 基于模板创建 |

---

## 未来结构（迁移后2026年第二季度）

**Decision 005 定义了5个独立仓库：**

### 仓库1: SynkraAI/aios-core (MIT)

```
aios-core/
├── .aios-core/                        # 框架资产（模块化 v2.0）
│   ├── cli/                           # CLI 命令和实用工具
│   ├── core/                          # 框架基础
│   │   ├── config/                    # 配置系统
│   │   ├── quality-gates/             # 质量验证器
│   │   └── utils/                     # 核心实用工具
│   ├── development/                   # 开发资产
│   │   ├── agents/                    # 代理定义（11个核心）
│   │   ├── tasks/                     # 任务工作流（60+）
│   │   └── workflows/                 # 多步骤工作流
│   ├── infrastructure/                # 基础设施工具
│   │   ├── integrations/              # PM 适配器、工具
│   │   ├── scripts/                   # 自动化脚本
│   │   └── templates/                 # 基础设施模板
│   ├── product/                       # PM/PO 资产
│   │   ├── checklists/                # 验证检查清单
│   │   └── templates/                 # 文档模板
│   └── ...
│
├── bin/                               # CLI 入口点
│   └── aios.js                        # 主 CLI
│
├── tools/                             # 构建和实用工具
│   ├── cli.js                         # CLI 构建器
│   └── installer/                     # 安装脚本
│
├── docs/                              # 框架文档
│   ├── framework/                     # 官方标准
│   ├── guides/                        # 操作指南
│   ├── installation/                  # 设置指南
│   └── architecture/                  # 架构文档
│
├── templates/                         # 项目模板
│   └── squad/                         # Squad 模板
│
├── tests/                             # 测试套件
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── examples/                          # 示例项目
    ├── basic-agent/
    ├── vibecoder-demo/
    └── multi-agent-workflow/
```

### 仓库2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # AIOS 认证的 squads
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
    └── create-aios-squad/
```

### 仓库3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # MCP 预设（Docker MCP Toolkit）
│   ├── aios-dev/
│   ├── aios-research/
│   └── aios-docker/
│
├── mcps/                              # 基础 MCP 配置
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # IDE 集成
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### 仓库4: SynkraAI/certified-partners (私有)

```
certified-partners/
├── premium-packs/                     # 高级 Squads
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # 合作伙伴成功平台
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # 市场平台
    ├── api/
    └── web/
```

### 仓库5: SynkraAI/mmos (私有 + NDA)

```
mmos/
├── minds/                             # 34个认知克隆
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
Directories: kebab-case (lowercase, hyphen-separated)
  ✅ .aios-core/
  ✅ Squads/
  ❌ .AIOS-Core/
  ❌ legacy-packs/

Files (Code): kebab-case with extension
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Files (Docs): kebab-case with .md extension
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Files (Config): lowercase or kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### 特殊情况

```yaml
Stories:
  Format: story-{epic}.{story}.{substory}.md
  Example: story-6.1.2.5.md

Epics:
  Format: epic-{number}-{name}.md
  Example: epic-6.1-agent-identity-system.md

Decisions:
  Format: decision-{number}-{name}.md
  Example: decision-005-repository-restructuring-FINAL.md

Templates:
  Format: {name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Format: {name}-checklist.md
  Example: architect-checklist.md
```

---

## 新文件放置位置

### 决策矩阵

```yaml
# 我正在创建一个新代理：
Location: .aios-core/development/agents/{agent-name}.md
Example: .aios-core/development/agents/security-expert.md

# 我正在创建一个新任务：
Location: .aios-core/development/tasks/{task-name}.md
Example: .aios-core/development/tasks/deploy-to-production.md

# 我正在创建一个新工作流：
Location: .aios-core/development/workflows/{workflow-name}.yaml
Example: .aios-core/development/workflows/continuous-deployment.yaml

# 我正在创建一个新模板：
Location: .aios-core/product/templates/{template-name}-tmpl.{yaml|md}
Example: .aios-core/product/templates/deployment-plan-tmpl.yaml

# 我正在创建一个新检查清单：
Location: .aios-core/product/checklists/{checklist-name}-checklist.md
Example: .aios-core/product/checklists/security-review-checklist.md

# 我正在创建一个 CLI 命令：
Location: .aios-core/cli/commands/{category}/{command-name}.js
Example: .aios-core/cli/commands/generate/workflow.js

# 我正在创建一个核心实用工具：
Location: .aios-core/core/utils/{utility-name}.js
Example: .aios-core/core/utils/performance-monitor.js

# 我正在创建一个基础设施脚本：
Location: .aios-core/infrastructure/scripts/{category}/{script-name}.js
Example: .aios-core/infrastructure/scripts/llm-routing/router.js

# 我正在添加一个 PM 工具适配器：
Location: .aios-core/infrastructure/integrations/pm-adapters/{adapter-name}.js
Example: .aios-core/infrastructure/integrations/pm-adapters/monday-adapter.js

# 我正在编写一个故事（内部开发文档 - gitignored）：
Location: docs/stories/{sprint-context}/{story-file}.md
Example: docs/stories/v4.0.4/sprint-6/story-6.14-new-feature.md

# 我正在创建官方框架文档：
Location: docs/framework/{doc-name}.md
Example: docs/framework/agent-development-guide.md

# 我正在创建一个测试：
Location: tests/{type}/{test-name}.test.js
Example: tests/unit/agent-executor.test.js

# 我正在创建一个 squad：
Location: Copy templates/squad/ to your squads directory
Example: squads/devops-automation/ (customize from template)
```

---

## 特殊目录

### .ai/ 目录（新 - Story 6.1.2.6）

```
.ai/                                   # AI 会话工件
├── decision-log-6.1.2.5.md            # Yolo 模式决策日志
├── decision-log-6.1.2.6.md            # 另一个决策日志
└── session-{date}-{agent}.md          # 会话记录（可选）
```

**目的:** 跟踪开发会话期间 AI 驱动的决策（特别是 yolo 模式）

**自动生成:** 是（启用 yolo 模式时）

### outputs/ 目录

```
outputs/                               # 运行时输出（gitignored）
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

**目的:** 不提交到 git 的运行时工件

---

## 自主开发引擎 (ADE)

> **v3.0 新增** - ADE 通过智能工作流、模式学习和自愈循环提供自主开发能力。

### ADE 架构概述

```
.aios-core/
├── workflow-intelligence/             # WIS - 模式学习系统
│   ├── __tests__/                     # WIS 测试套件
│   ├── engine/                        # 核心 WIS 引擎
│   │   ├── confidence-scorer.js       # 模式置信度评分
│   │   ├── output-formatter.js        # 输出格式化
│   │   ├── suggestion-engine.js       # 智能建议
│   │   └── wave-analyzer.js           # 波形模式分析
│   ├── learning/                      # 机器学习组件
│   │   ├── capture-hook.js            # 模式捕获钩子
│   │   ├── index.js                   # 学习模块入口
│   │   ├── pattern-capture.js         # 模式捕获引擎
│   │   ├── pattern-store.js           # 模式持久化
│   │   └── pattern-validator.js       # 模式验证
│   ├── registry/                      # 工作流注册表
│   │   └── workflow-registry.js       # 工作流注册
│   └── index.js                       # WIS 入口点
│
├── infrastructure/scripts/            # ADE 基础设施脚本
│   ├── worktree-manager.js            # Git worktree 隔离（Epic 1）
│   ├── project-status-loader.js       # 项目状态管理（Epic 2）
│   ├── spec-pipeline-runner.js        # 规格管道自动化（Epic 3）
│   ├── plan-tracker.js                # 计划进度跟踪（Epic 4）
│   ├── subtask-verifier.js            # 子任务验证（Epic 4）
│   ├── approach-manager.js            # 方法管理（Epic 5）
│   ├── stuck-detector.js              # 卡住检测逻辑（Epic 5）
│   ├── recovery-tracker.js            # 恢复跟踪（Epic 5）
│   ├── rollback-manager.js            # 回滚管理（Epic 5）
│   ├── qa-report-generator.js         # QA 报告生成（Epic 6）
│   ├── qa-loop-orchestrator.js        # QA 循环自动化（Epic 6）
│   ├── codebase-mapper.js             # 代码库映射（Epic 7）
│   ├── pattern-extractor.js           # 模式提取（Epic 7）
│   └── gotchas-documenter.js          # 陷阱文档化（Epic 7）
│
├── development/workflows/             # ADE 工作流
│   ├── spec-pipeline.yaml             # 需求 → 规格工作流（Epic 3）
│   └── qa-loop.yaml                   # QA 审查 → 修复循环（Epic 6）
│
├── development/tasks/                 # ADE 任务
│   ├── spec-assess-complexity.md      # 复杂度评估（Epic 3）
│   ├── spec-critique.md               # 规格评审（Epic 3）
│   ├── spec-gather-requirements.md    # 需求收集（Epic 3）
│   ├── spec-research-dependencies.md  # 依赖研究（Epic 3）
│   ├── spec-write-spec.md             # 规格编写（Epic 3）
│   ├── plan-create-context.md         # 上下文生成（Epic 4）
│   ├── plan-create-implementation.md  # 实现规划（Epic 4）
│   ├── plan-execute-subtask.md        # 子任务执行（Epic 4）
│   ├── verify-subtask.md              # 子任务验证（Epic 4）
│   ├── qa-review-build.md             # 10阶段 QA 审查（Epic 6）
│   ├── qa-create-fix-request.md       # 修复请求生成（Epic 6）
│   ├── qa-fix-issues.md               # 问题修复工作流（Epic 6）
│   ├── capture-session-insights.md    # 会话洞察捕获（Epic 7）
│   ├── extract-patterns.md            # 模式提取（Epic 7）
│   └── document-gotchas.md            # 陷阱文档化（Epic 7）
│
└── product/                           # ADE 模板和检查清单
    ├── templates/
    │   ├── qa-report-tmpl.md          # QA 报告模板（Epic 6）
    │   └── current-approach-tmpl.md   # 当前方法模板（Epic 5）
    └── checklists/
        └── self-critique-checklist.md # 自我批评检查清单（Epic 4）
```

### ADE Epics 摘要

| Epic | 名称 | 关键组件 |
| ---- | ---- | -------- |
| **Epic 1** | 故事分支隔离 | `worktree-manager.js` - Git worktree 管理 |
| **Epic 2** | 项目状态系统 | `project-status-loader.js` - YAML 状态跟踪 |
| **Epic 3** | 规格管道 | `spec-pipeline.yaml` + 5个规格任务 |
| **Epic 4** | 实现规划 | `plan-tracker.js`、`subtask-verifier.js`、上下文生成器 |
| **Epic 5** | 自愈循环 | `stuck-detector.js`、`recovery-tracker.js`、`rollback-manager.js` |
| **Epic 6** | QA 演进 | `qa-loop-orchestrator.js`、10阶段审查、修复请求生成 |
| **Epic 7** | 记忆层 | `codebase-mapper.js`、`pattern-extractor.js`、会话洞察 |

### ADE 配置

ADE 通过 `.aios-core/core-config.yaml` 配置：

```yaml
ade:
  enabled: true
  worktrees:
    enabled: true
    baseDir: .worktrees
  specPipeline:
    enabled: true
    maxIterations: 3
  qaLoop:
    enabled: true
    maxIterations: 5
  memoryLayer:
    enabled: true
    patternStore: .aios/patterns/
```

### ADE 运行时状态

运行时状态持久化在 `.aios/`：

```
.aios/
├── project-status.yaml        # 当前项目状态
├── status.json                # 运行时状态
├── patterns/                  # 学习的模式（Epic 7）
│   ├── code-patterns.json
│   └── gotchas.json
├── worktrees/                 # Worktree 状态（Epic 1）
│   └── story-{id}.json
└── qa-loops/                  # QA 循环状态（Epic 6）
    └── {story-id}/
        ├── iteration-1.json
        └── qa-report.md
```

---

## 相关文档

- [编码标准](./coding-standards.md)
- [技术栈](./tech-stack.md)
- [ADE 架构](../architecture/ade-architecture.md) _(计划中)_

---

## 版本历史

| 版本 | 日期 | 变更 | 作者 |
| ---- | ---- | ---- | ---- |
| 1.0 | 2025-01-15 | 初始源代码树文档 | Aria (architect) |
| 1.1 | 2025-12-14 | 更新组织为 SynkraAI，用 Squads 系统替换 Squads [Story 6.10] | Dex (dev) |
| 2.0 | 2025-12-15 | 主要更新以反映模块化架构（cli/、core/、development/、infrastructure/、product/）[Story 6.13] | Pax (PO) |
| 3.0 | 2026-01-29 | 添加 ADE（自主开发引擎）部分，记录 Epics 1-7：workflow-intelligence、ADE 脚本、工作流、任务和运行时状态 [ADE 集成] | Aria (architect) |
| 3.1 | 2026-02-06 | 添加数据文件治理部分：记录7个缺失的数据文件及其所有者、填充规则和更新触发器。扩展 .aios-core/data/ 和 product/data/ 树列表。[Story ACT-8] | Dex (dev) |

---

_这是官方 AIOS 框架标准。所有文件放置必须遵循此结构。_
