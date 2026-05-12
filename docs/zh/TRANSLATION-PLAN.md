# Synkra AIOX 中文文档翻译计划

> 🌐 [EN](../TRANSLATION-PLAN.md) | [PT](../pt/TRANSLATION-PLAN.md) | [ES](../es/TRANSLATION-PLAN.md) | **ZH**

---

## 概述

本文档描述了将 Synkra AIOX 文档翻译成中文的完整计划。

### 翻译范围统计

| 指标 | 数值 |
|------|------|
| **总文档数量** | ~980 个文件 |
| **文档行数** | ~473,000 行 |
| **总大小** | ~13.4 MB |
| **优先翻译文档** | ~150 个文件 |
| **预计总词数** | ~500,000 字 |

---

## 阶段规划

### 第一阶段：核心文档 (Tier 1 - Critical)

**目标：** 让中文用户能够安装和开始使用 AIOX

**预计文件数：** 25 个文件
**优先级：** 最高

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 快速入门 | `getting-started.md` | `zh/getting-started.md` | ⬜ |
| 安装指南 - macOS | `installation/macos.md` | `zh/installation/macos.md` | ⬜ |
| 安装指南 - Linux | `installation/linux.md` | `zh/installation/linux.md` | ⬜ |
| 安装指南 - Windows | `installation/windows.md` | `zh/installation/windows.md` | ⬜ |
| 安装故障排除 | `installation/troubleshooting.md` | `zh/installation/troubleshooting.md` | ⬜ |
| 常见问题 | `installation/faq.md` | `zh/installation/faq.md` | ⬜ |
| 核心架构 | `core-architecture.md` | `zh/core-architecture.md` | ⬜ |
| 元代理命令 | `meta-agent-commands.md` | `zh/meta-agent-commands.md` | ⬜ |
| 代理参考指南 | `agent-reference-guide.md` | `zh/agent-reference-guide.md` | ⬜ |
| README | `README.md` | `zh/README.md` | ⬜ |
| 环境配置 | `ENVIRONMENT.md` | `zh/ENVIRONMENT.md` | ⬜ |
| 指导原则 | `GUIDING-PRINCIPLES.md` | `zh/GUIDING-PRINCIPLES.md` | ⬜ |

**框架文档：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 框架 README | `framework/README.md` | `zh/framework/README.md` | ⬜ |
| 编码标准 | `framework/coding-standards.md` | `zh/framework/coding-standards.md` | ⬜ |
| 技术栈 | `framework/tech-stack.md` | `zh/framework/tech-stack.md` | ⬜ |
| 源码树 | `framework/source-tree.md` | `zh/framework/source-tree.md` | ⬜ |

**指南文档：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 指南 README | `guides/README.md` | `zh/guides/README.md` | ⬜ |
| API 参考 | `guides/api-reference.md` | `zh/guides/api-reference.md` | ⬜ |
| 开发环境设置 | `guides/development-setup.md` | `zh/guides/development-setup.md` | ⬜ |
| 质量门控 | `guides/quality-gates.md` | `zh/guides/quality-gates.md` | ⬜ |
| 工作流指南 | `guides/workflows-guide.md` | `zh/guides/workflows-guide.md` | ⬜ |

---

### 第二阶段：代理系统 (Tier 2 - Important)

**目标：** 完整理解代理系统和工作流

**预计文件数：** 35 个文件
**优先级：** 高

**代理流程文档 (aiox-agent-flows/)：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 代理流程 README | `aiox-agent-flows/README.md` | `zh/aiox-agent-flows/README.md` | ⬜ |
| AIOX Master 系统 | `aiox-agent-flows/aiox-master-system.md` | `zh/aiox-agent-flows/aiox-master-system.md` | ⬜ |
| 开发者系统 | `aiox-agent-flows/dev-system.md` | `zh/aiox-agent-flows/dev-system.md` | ⬜ |
| 架构师系统 | `aiox-agent-flows/architect-system.md` | `zh/aiox-agent-flows/architect-system.md` | ⬜ |
| QA 系统 | `aiox-agent-flows/qa-system.md` | `zh/aiox-agent-flows/qa-system.md` | ⬜ |
| UX 设计专家系统 | `aiox-agent-flows/ux-design-expert-system.md` | `zh/aiox-agent-flows/ux-design-expert-system.md` | ⬜ |
| 数据工程师系统 | `aiox-agent-flows/data-engineer-system.md` | `zh/aiox-agent-flows/data-engineer-system.md` | ⬜ |
| 分析师系统 | `aiox-agent-flows/analyst-system.md` | `zh/aiox-agent-flows/analyst-system.md` | ⬜ |
| 产品经理系统 | `aiox-agent-flows/pm-system.md` | `zh/aiox-agent-flows/pm-system.md` | ⬜ |
| Scrum Master 系统 | `aiox-agent-flows/sm-system.md` | `zh/aiox-agent-flows/sm-system.md` | ⬜ |
| DevOps 系统 | `aiox-agent-flows/devops-system.md` | `zh/aiox-agent-flows/devops-system.md` | ⬜ |
| Squad 创建者系统 | `aiox-agent-flows/squad-creator-system.md` | `zh/aiox-agent-flows/squad-creator-system.md` | ⬜ |

**工作流文档 (aiox-workflows/)：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 工作流 README | `aiox-workflows/README.md` | `zh/aiox-workflows/README.md` | ⬜ |
| 绿地全栈工作流 | `aiox-workflows/greenfield-fullstack-workflow.md` | `zh/aiox-workflows/greenfield-fullstack-workflow.md` | ⬜ |
| 绿地服务工作流 | `aiox-workflows/greenfield-service-workflow.md` | `zh/aiox-workflows/greenfield-service-workflow.md` | ⬜ |
| 绿地 UI 工作流 | `aiox-workflows/greenfield-ui-workflow.md` | `zh/aiox-workflows/greenfield-ui-workflow.md` | ⬜ |
| 棕地全栈工作流 | `aiox-workflows/brownfield-fullstack-workflow.md` | `zh/aiox-workflows/brownfield-fullstack-workflow.md` | ⬜ |
| 棕地服务工作流 | `aiox-workflows/brownfield-service-workflow.md` | `zh/aiox-workflows/brownfield-service-workflow.md` | ⬜ |
| 棕地 UI 工作流 | `aiox-workflows/brownfield-ui-workflow.md` | `zh/aiox-workflows/brownfield-ui-workflow.md` | ⬜ |
| 棕地发现工作流 | `aiox-workflows/brownfield-discovery-workflow.md` | `zh/aiox-workflows/brownfield-discovery-workflow.md` | ⬜ |
| 规格流水线工作流 | `aiox-workflows/spec-pipeline-workflow.md` | `zh/aiox-workflows/spec-pipeline-workflow.md` | ⬜ |
| QA 循环工作流 | `aiox-workflows/qa-loop-workflow.md` | `zh/aiox-workflows/qa-loop-workflow.md` | ⬜ |
| Story 开发周期 | `aiox-workflows/story-development-cycle-workflow.md` | `zh/aiox-workflows/story-development-cycle-workflow.md` | ⬜ |

**代理定义：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 角色定义 | `agents/persona-definitions.md` | `zh/agents/persona-definitions.md` | ⬜ |
| 原型原理 | `agents/archetype-rationale.md` | `zh/agents/archetype-rationale.md` | ⬜ |

---

### 第三阶段：架构文档 (Tier 2 - Important)

**目标：** 深入理解系统架构

**预计文件数：** 20 个文件
**优先级：** 高

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 架构索引 | `architecture/ARCHITECTURE-INDEX.md` | `zh/architecture/ARCHITECTURE-INDEX.md` | ⬜ |
| 架构简介 | `architecture/introduction.md` | `zh/architecture/introduction.md` | ⬜ |
| 高级架构 | `architecture/high-level-architecture.md` | `zh/architecture/high-level-architecture.md` | ⬜ |
| AIOX 视觉概览 | `architecture/AIOX-VISUAL-OVERVIEW.md` | `zh/architecture/AIOX-VISUAL-OVERVIEW.md` | ⬜ |
| 模块系统 | `architecture/module-system.md` | `zh/architecture/module-system.md` | ⬜ |
| 源码树 | `architecture/source-tree.md` | `zh/architecture/source-tree.md` | ⬜ |
| 命令权限矩阵 | `architecture/command-authority-matrix.md` | `zh/architecture/command-authority-matrix.md` | ⬜ |
| 代理责任矩阵 | `architecture/agent-responsibility-matrix.md` | `zh/architecture/agent-responsibility-matrix.md` | ⬜ |
| 代理工具集成指南 | `architecture/agent-tool-integration-guide.md` | `zh/architecture/agent-tool-integration-guide.md` | ⬜ |
| 编码标准 | `architecture/coding-standards.md` | `zh/architecture/coding-standards.md` | ⬜ |
| 技术栈 | `architecture/tech-stack.md` | `zh/architecture/tech-stack.md` | ⬜ |
| CI/CD | `architecture/ci-cd.md` | `zh/architecture/ci-cd.md` | ⬜ |
| MCP 系统图 | `architecture/mcp-system-diagrams.md` | `zh/architecture/mcp-system-diagrams.md` | ⬜ |
| MCP API 密钥管理 | `architecture/mcp-api-keys-management.md` | `zh/architecture/mcp-api-keys-management.md` | ⬜ |

---

### 第四阶段：高级指南 (Tier 3 - Standard)

**目标：** 完善文档覆盖

**预计文件数：** 50+ 个文件
**优先级：** 中

**安全相关：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 安全最佳实践 | `security-best-practices.md` | `zh/security-best-practices.md` | ⬜ |
| 安全强化 | `guides/security-hardening.md` | `zh/guides/security-hardening.md` | ⬜ |
| 安全文档 | `security.md` | `zh/security.md` | ⬜ |

**MCP 相关：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| MCP 全局设置 | `guides/mcp-global-setup.md` | `zh/guides/mcp-global-setup.md` | ⬜ |
| Docker Gateway 教程 | `guides/mcp/docker-gateway-tutorial.md` | `zh/guides/mcp/docker-gateway-tutorial.md` | ⬜ |
| Desktop Commander | `guides/mcp/desktop-commander.md` | `zh/guides/mcp/desktop-commander.md` | ⬜ |

**Squad 相关：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| Squad API | `api/squads-api.md` | `zh/api/squads-api.md` | ⬜ |
| Squad 示例 | `guides/squad-examples/README.md` | `zh/guides/squad-examples/README.md` | ⬜ |
| Squad 迁移 | `guides/squad-migration.md` | `zh/guides/squad-migration.md` | ⬜ |
| Squad 贡献 | `guides/contributing-squads.md` | `zh/guides/contributing-squads.md` | ⬜ |

**其他指南：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 性能调优 | `performance-tuning-guide.md` | `zh/performance-tuning-guide.md` | ⬜ |
| Git 工作流 | `git-workflow-guide.md` | `zh/git-workflow-guide.md` | ⬜ |
| 版本发布 | `versioning-and-releases.md` | `zh/versioning-and-releases.md` | ⬜ |
| 权限模式 | `guides/permission-modes.md` | `zh/guides/permission-modes.md` | ⬜ |
| 代理选择指南 | `guides/agent-selection-guide.md` | `zh/guides/agent-selection-guide.md` | ⬜ |
| 模板引擎 v2 | `guides/template-engine-v2.md` | `zh/guides/template-engine-v2.md` | ⬜ |
| 质量仪表板 | `guides/quality-dashboard.md` | `zh/guides/quality-dashboard.md` | ⬜ |

---

### 第五阶段：示例和社区 (Tier 4 - Extended)

**目标：** 完整示例和社区文档

**预计文件数：** 30+ 个文件
**优先级：** 低

**示例：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 基础 Squad | `examples/squads/basic-squad/` | `zh/examples/squads/basic-squad/` | ⬜ |
| 多代理 Squad | `examples/squads/multi-agent-squad/` | `zh/examples/squads/multi-agent-squad/` | ⬜ |
| 带工具 Squad | `examples/squads/squad-with-tools/` | `zh/examples/squads/squad-with-tools/` | ⬜ |

**社区：**

| 文档 | 原文路径 | 译文路径 | 状态 |
|------|----------|----------|------|
| 社区文档 | `community.md` | `zh/community.md` | ⬜ |
| 贡献指南 | `contributing.md` | `zh/contributing.md` | ⬜ |
| 行为准则 | `code-of-conduct.md` | `zh/code-of-conduct.md` | ⬜ |
| PR 指南 | `how-to-contribute-with-pull-requests.md` | `zh/how-to-contribute-with-pull-requests.md` | ⬜ |

---

## 翻译标准

### 术语表

| 英文 | 简体中文 | 繁体中文 | 备注 |
|------|----------|----------|------|
| Agent | 代理 | 代理 | 核心概念 |
| Workflow | 工作流 | 工作流程 | |
| Story | 故事 / Story | 故事 / Story | 保留英文亦可 |
| Task | 任务 | 任務 | |
| Epic | 史诗 / Epic | Epic | 保留英文更常见 |
| Squad | 小队 / Squad | 小隊 / Squad | |
| Greenfield | 绿地项目 | 全新專案 | 新项目 |
| Brownfield | 棕地项目 | 既有專案 | 现有项目 |
| Meta-Agent | 元代理 | 元代理 | |
| Memory Layer | 记忆层 | 記憶層 | |
| Self-Modifying | 自修改 | 自修改 | |
| Orchestration | 编排 | 編排 | |
| Pipeline | 流水线 | 管線 | |
| Gate | 门控 | 門控 | 质量门控 |
| Persona | 角色 / 人格 | 角色 / 人格 | |
| Constitution | 宪法 / 准则 | 憲法 / 準則 | AIOX Constitution |
| CLI | CLI / 命令行 | CLI / 命令列 | |
| Hook | 钩子 | 鉤子 | |
| MCP | MCP | MCP | 不翻译 |
| SYNAPSE | SYNAPSE | SYNAPSE | 不翻译 |

### 翻译原则

1. **保持技术准确性** - 技术术语优先使用行业标准翻译
2. **代码不翻译** - 代码块、变量名、命令保持英文
3. **保留品牌名** - Synkra、AIOX、Claude 等品牌名不翻译
4. **链接更新** - 更新文档内部链接指向中文版本
5. **同步标记** - 每个文件标注原文版本和同步日期

### 文件头模板

```markdown
<!--
  翻译：zh-CN（简体中文）
  原文：/docs/en/{path}
  最后同步：YYYY-MM-DD
  翻译者：{name}
  审核者：{name}
-->

# 文档标题

> 🌐 [EN](../{path}) | [PT](../pt/{path}) | [ES](../es/{path}) | **ZH**

---
```

---

## 目录结构

```text
docs/zh/
├── README.md                           # 中文文档首页
├── TRANSLATION-PLAN.md                 # 本计划文件
├── GLOSSARY.md                         # 术语表
├── getting-started.md                  # 快速入门
├── core-architecture.md                # 核心架构
├── meta-agent-commands.md              # 元代理命令
├── agent-reference-guide.md            # 代理参考指南
├── ENVIRONMENT.md                      # 环境配置
├── GUIDING-PRINCIPLES.md               # 指导原则
├── security-best-practices.md          # 安全最佳实践
├── performance-tuning-guide.md         # 性能调优指南
├── git-workflow-guide.md               # Git 工作流指南
├── versioning-and-releases.md          # 版本发布
│
├── installation/                       # 安装文档
│   ├── README.md
│   ├── macos.md
│   ├── linux.md
│   ├── windows.md
│   ├── faq.md
│   └── troubleshooting.md
│
├── framework/                          # 框架文档
│   ├── README.md
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
│
├── guides/                             # 指南
│   ├── README.md
│   ├── api-reference.md
│   ├── development-setup.md
│   ├── quality-gates.md
│   ├── workflows-guide.md
│   ├── permission-modes.md
│   ├── agent-selection-guide.md
│   ├── security-hardening.md
│   ├── mcp/
│   │   ├── docker-gateway-tutorial.md
│   │   └── desktop-commander.md
│   └── squad-examples/
│       └── README.md
│
├── aiox-agent-flows/                   # 代理流程
│   ├── README.md
│   ├── aiox-master-system.md
│   ├── dev-system.md
│   ├── architect-system.md
│   ├── qa-system.md
│   ├── ux-design-expert-system.md
│   ├── data-engineer-system.md
│   ├── analyst-system.md
│   ├── pm-system.md
│   ├── sm-system.md
│   ├── devops-system.md
│   └── squad-creator-system.md
│
├── aiox-workflows/                     # 工作流
│   ├── README.md
│   ├── greenfield-fullstack-workflow.md
│   ├── greenfield-service-workflow.md
│   ├── greenfield-ui-workflow.md
│   ├── brownfield-fullstack-workflow.md
│   ├── brownfield-service-workflow.md
│   ├── brownfield-ui-workflow.md
│   ├── brownfield-discovery-workflow.md
│   ├── spec-pipeline-workflow.md
│   ├── qa-loop-workflow.md
│   └── story-development-cycle-workflow.md
│
├── architecture/                       # 架构文档
│   ├── ARCHITECTURE-INDEX.md
│   ├── introduction.md
│   ├── high-level-architecture.md
│   ├── AIOX-VISUAL-OVERVIEW.md
│   ├── module-system.md
│   ├── source-tree.md
│   ├── command-authority-matrix.md
│   ├── agent-responsibility-matrix.md
│   ├── agent-tool-integration-guide.md
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── ci-cd.md
│   ├── mcp-system-diagrams.md
│   └── mcp-api-keys-management.md
│
├── agents/                             # 代理定义
│   ├── persona-definitions.md
│   └── archetype-rationale.md
│
├── api/                                # API 文档
│   └── squads-api.md
│
├── examples/                           # 示例
│   └── squads/
│       ├── basic-squad/
│       ├── multi-agent-squad/
│       └── squad-with-tools/
│
├── community/                          # 社区
│   └── README.md
│
├── security/                           # 安全
│   └── README.md
│
└── troubleshooting.md                  # 故障排除
```

---

## 执行计划

### 阶段 1：基础设施 (第1周)

- [ ] 创建 `docs/zh/` 目录结构
- [ ] 创建 `GLOSSARY.md` 术语表
- [ ] 创建 `README.md` 中文首页
- [ ] 设置翻译工作流脚本

### 阶段 2：核心文档 (第2-3周)

- [ ] 翻译安装文档 (6个文件)
- [ ] 翻译快速入门
- [ ] 翻译核心架构
- [ ] 翻译框架文档 (4个文件)
- [ ] 翻译基础指南 (5个文件)

### 阶段 3：代理系统 (第4-5周)

- [ ] 翻译代理流程 (12个文件)
- [ ] 翻译工作流 (11个文件)
- [ ] 翻译代理定义 (2个文件)

### 阶段 4：架构文档 (第6周)

- [ ] 翻译架构索引
- [ ] 翻译核心架构文档 (14个文件)

### 阶段 5：高级指南 (第7-8周)

- [ ] 翻译安全文档 (3个文件)
- [ ] 翻译 MCP 文档 (3个文件)
- [ ] 翻译 Squad 文档 (4个文件)
- [ ] 翻译其他指南 (10+个文件)

### 阶段 6：示例和社区 (第9-10周)

- [ ] 翻译示例文档 (3个目录)
- [ ] 翻译社区文档 (4个文件)
- [ ] 最终审核和校对

---

## 质量保证

### 翻译审核流程

```text
初译 → 技术审核 → 语言审核 → 合并
```

1. **初译** - 完成初步翻译
2. **技术审核** - 确保技术准确性
3. **语言审核** - 确保语言流畅性
4. **合并** - PR 审核后合并

### 自动化检查

- [ ] 链接检查 - 确保内部链接有效
- [ ] 格式检查 - 确保 Markdown 格式正确
- [ ] 术语一致性检查 - 确保术语使用一致
- [ ] 代码块检查 - 确保代码块未被翻译

---

## 维护计划

### 同步策略

1. **版本标记** - 每个文件记录原文版本
2. **变更监控** - 监控英文文档变更
3. **定期同步** - 每月检查并同步更新
4. **自动提醒** - 当原文更新时创建 Issue

### 文档版本对照

| 文档 | 英文版本 | 中文版本 | 同步状态 |
|------|----------|----------|----------|
| getting-started.md | v4.2.13 | - | ⬜ 待翻译 |
| ... | ... | ... | ... |

---

## 贡献指南

### 如何参与翻译

1. Fork 仓库
2. 选择一个待翻译文档
3. 创建分支 `zh/translate-{filename}`
4. 按照翻译标准完成翻译
5. 提交 PR

### PR 模板

```markdown
## 翻译内容

- 文件：`docs/zh/{path}`
- 原文：`docs/{path}`
- 类型：[ ] 新翻译 / [ ] 更新同步

## 检查清单

- [ ] 遵循术语表
- [ ] 添加文件头标记
- [ ] 更新内部链接
- [ ] 代码块保持英文
- [ ] 通过格式检查
```

---

## 联系方式

如有翻译相关问题，请：

1. 在 GitHub 创建 Issue，标签 `translation/zh`
2. 参与 Discord 的 `#translation-zh` 频道
3. 邮件联系翻译协调员

---

*Synkra AIOX 中文文档翻译计划 v1.0*
*创建日期：2026-02-22*
