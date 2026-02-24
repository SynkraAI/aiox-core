<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/ARCHITECTURE-INDEX.md | 同步时间: 2026-01-26 -->

# AIOS 架构文档索引

> 🌐 [EN](../../architecture/ARCHITECTURE-INDEX.md) | [PT](../../pt/architecture/ARCHITECTURE-INDEX.md) | [ES](../../es/architecture/ARCHITECTURE-INDEX.md) | **ZH-CN**

---

**版本:** 2.1.1
**上次更新:** 2026-01-26
**状态:** 官方参考文档

---

## 📋 文档导航

本索引为 AIOS v4 的所有架构文档提供导航。

> **注意:** 官方框架文档（编码标准、技术栈、源代码树）已合并到 `docs/framework/`。详见 [Framework README](../framework/README.md)。

---

## 📁 目录结构

```
docs/architecture/
├── ARCHITECTURE-INDEX.md     # 本文件
├── high-level-architecture.md # 系统概览
├── module-system.md          # 4 模块架构
├── mcp-system-diagrams.md    # MCP 架构图
├── memory-layer.md           # 内存系统架构
├── adr/                      # 架构决策记录
└── [framework/]              # 详见 docs/framework/ 的标准
```

---

## 🎯 按主题快速链接

### 核心架构

| 文档 | 描述 | 状态 |
|------|------|------|
| [高级架构](./high-level-architecture.md) | AIOS v4 架构概览 | ✅ 当前版本 |
| [模块系统](./module-system.md) | 4 模块模块化架构 | ✅ 当前版本 |
| [内存层](./memory-layer.md) | 内存系统架构 | ✅ 当前版本 |

### MCP 和集成

| 文档 | 描述 | 状态 |
|------|------|------|
| [MCP 系统图](./mcp-system-diagrams.md) | MCP 架构图 | ✅ 当前版本 |

> **注意:** MCP 管理通过 Docker MCP 工具包进行（Story 5.11）。使用 `@devops` 代理与 `*setup-mcp-docker` 进行配置。

### 代理系统

| 文档 | 描述 | 状态 |
|------|------|------|
| [代理责任矩阵](./agent-responsibility-matrix.md) | 代理角色和职责 | ✅ 当前版本 |
| [代理配置审计](./agent-config-audit.md) | 配置审计 | ✅ 当前版本 |

### 工具和实用程序

| 文档 | 描述 | 状态 |
|------|------|------|
| [实用程序集成指南](./utility-integration-guide.md) | 实用程序集成 | ✅ 当前版本 |
| [CI/CD](./ci-cd.md) | CI/CD 流水线文档 | ✅ 当前版本 |

### 健康检查系统 (HCS)

| 文档 | 描述 | 状态 |
|------|------|------|
| [HCS 检查规范](./hcs-check-specifications.md) | 健康检查规范 | ✅ 当前版本 |
| [HCS 执行模式](./hcs-execution-modes.md) | 执行模式 | ✅ 当前版本 |
| [HCS 自愈规范](./hcs-self-healing-spec.md) | 自愈规范 | ✅ 当前版本 |

### Squad 系统

| 文档 | 描述 | 状态 |
|------|------|------|
| [Squad 改进分析](./squad-improvement-analysis.md) | 改进分析 | ✅ 当前版本 |
| [Squad 改进方法](./squad-improvement-recommended-approach.md) | 推荐方法 | ✅ 当前版本 |

### 架构决策记录 (ADR)

| 文档 | 描述 | 状态 |
|------|------|------|
| [ADR COLLAB-1](./adr/ADR-COLLAB-1-current-state-audit.md) | 当前状态审计 | ✅ 当前版本 |
| [ADR COLLAB-2](./adr/ADR-COLLAB-2-proposed-configuration.md) | 建议的配置 | ✅ 当前版本 |
| [ADR HCS](./adr/adr-hcs-health-check-system.md) | 健康检查系统 | ✅ 当前版本 |
| [ADR 隔离虚拟机](./adr/adr-isolated-vm-decision.md) | 隔离虚拟机决策 | ✅ 当前版本 |

### 参考文档（官方位置在 docs/framework/）

| 文档 | 描述 | 状态 |
|------|------|------|
| [技术栈](../framework/tech-stack.md) | 技术决策 | ✅ 当前版本 |
| [编码标准](../framework/coding-standards.md) | 代码标准 | ✅ 当前版本 |
| [源代码树](../framework/source-tree.md) | 项目结构 | ✅ 当前版本 |

> **注意:** 这些链接到 `docs/framework/` 是官方位置。

### 研究和分析

| 文档 | 描述 | 状态 |
|------|------|------|
| [贡献工作流研究](./contribution-workflow-research.md) | 贡献分析 | ✅ 当前版本 |
| [介绍](./introduction.md) | 原始介绍 (v2.0) | 📦 历史遗留 |

---

## 🏗️ 架构概览图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AIOS v4 架构                                       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    多仓库结构                                    │   │
│   │                                                                  │   │
│   │   SynkraAI/aios-core ◄───── 中央枢纽                           │   │
│   │          │                    - 框架核心                        │   │
│   │          │                    - 11 个基础代理                   │   │
│   │          │                    - 讨论中心                        │   │
│   │          │                                                       │   │
│   │   ┌──────┴───────┐                                               │   │
│   │   │              │                                               │   │
│   │   ▼              ▼                                               │   │
│   │ aios-squads   mcp-ecosystem                                      │   │
│   │ (MIT)         (Apache 2.0)                                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    模块化架构                                    │   │
│   │                                                                  │   │
│   │   .aios-core/                                                    │   │
│   │   ├── core/           ← 框架基础                                │   │
│   │   ├── development/    ← 代理、任务、工作流                      │   │
│   │   ├── product/        ← 模板、检查列表                          │   │
│   │   └── infrastructure/ ← 脚本、工具、集成                        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    质量门槛 3 层                                 │   │
│   │                                                                  │   │
│   │   第 1 层: 提交前 ──► 第 2 层: PR ──► 第 3 层: 人工审查         │   │
│   │   (Husky/lint-staged)   (CodeRabbit)    (战略审查)              │   │
│   │        30%                  +50%              +20%               │   │
│   │                        (80% 自动化)                              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 新贡献者推荐阅读顺序

### 快速开始 (30 分钟)
1. [高级架构](./high-level-architecture.md)
2. [模块系统](./module-system.md)
3. [框架 README](../framework/README.md)

### 深入学习 (2-3 小时)
1. 所有快速开始文档
2. [代理责任矩阵](./agent-responsibility-matrix.md)
3. [MCP 系统图](./mcp-system-diagrams.md)
4. [技术栈](../framework/tech-stack.md)

### 完全掌握 (1-2 天)
1. 本索引中的所有文档
2. 架构决策的 ADR 文档
3. 健康检查系统的 HCS 文档

---

## 📝 文档状态图例

| 状态 | 含义 |
|------|------|
| ✅ 当前版本 | 与 v4.2 保持最新 |
| ⚠️ 需要更新 | 需要术语或内容更新 |
| 📦 历史遗留 | 历史参考 |
| 🆕 新增 | 最近创建 |

---

**上次更新:** 2026-01-26
**维护者:** @architect (Aria)
