# AIOS 指南

> **[EN](../../guides/README.md)** | **[PT](../../pt/guides/README.md)** | **[ES](../../es/guides/README.md)** | **ZH**

---

Synkra AIOS 系统指南的完整文档索引。

---

## MCP 配置（Docker MCP 工具包）

**状态：** 生产就绪
**令牌缩减：** 85%+（相比直接 MCP）
**设置时间：** 10-20 分钟

### 快速开始

**想要优化的 MCP 配置？**
使用 DevOps 代理：`@devops` 然后 `*setup-mcp-docker`

### MCP 管理命令

| 命令                 | 描述                    | 代理    |
| -------------------- | ----------------------- | ------- |
| `*setup-mcp-docker`  | 初始 Docker MCP 工具包设置 | @devops |
| `*search-mcp`        | 搜索目录中可用的 MCP    | @devops |
| `*add-mcp`           | 向 Docker 网关添加 MCP 服务器 | @devops |
| `*list-mcps`         | 列出当前启用的 MCP      | @devops |
| `*remove-mcp`        | 从 Docker 网关删除 MCP  | @devops |

### 架构参考

| 指南                                                           | 目的                   | 时间   | 受众    |
| -------------------------------------------------------------- | ---------------------- | ------ | ------- |
| **[MCP 全局设置指南](./mcp-global-setup.md)**                   | 全局 MCP 服务器配置    | 10分钟 | 所有用户 |
| **[MCP API 密钥管理](../architecture/mcp-api-keys-management.md)** | 安全凭证处理           | 10分钟 | DevOps |

> **注：** 1MCP 文档已弃用。AIOS 现在独占使用 Docker MCP 工具包（故事 5.11）。存档文档位于 `.github/deprecated-docs/guides/`。

---

## v4.2 框架文档

**状态：** 完整（故事 2.16）
**版本：** 2.1.0
**最后更新：** 2025-12-17

### 核心架构

| 指南                                                     | 目的                           | 时间    | 受众                 |
| -------------------------------------------------------- | ------------------------------ | ------- | -------------------- |
| **[模块系统架构](../architecture/module-system.md)**     | v4.2 模块化架构（4 个模块）    | 15分钟  | 架构师、开发人员      |
| **[服务发现指南](./service-discovery.md)**               | 工作者发现和注册表 API         | 10分钟  | 开发人员             |
| **[迁移指南 v2.0→v4.2](../migration/migration-guide.md)** | 分步迁移说明                   | 20分钟  | 所有升级用户         |

### 系统配置

| 指南                                                 | 目的                       | 时间    | 受众         |
| ---------------------------------------------------- | -------------------------- | ------- | ------------ |
| **[质量门控指南](./quality-gates.md)**               | 3 层质量门控系统           | 15分钟  | QA、DevOps   |
| **[质量仪表板指南](./quality-dashboard.md)**         | 仪表板指标可视化           | 10分钟  | 技术主管、QA |
| **[MCP 全局设置指南](./mcp-global-setup.md)**        | 全局 MCP 服务器配置        | 10分钟  | 所有用户     |

### 开发工具（第 3 阶段）

| 指南                                                | 目的                  | 时间    | 受众     |
| --------------------------------------------------- | --------------------- | ------- | -------- |
| **[模板引擎 v2](./template-engine-v2.md)**          | 文档生成引擎          | 10分钟  | 开发人员 |

### 快速导航（v4）

**...了解 4 个模块架构**
→ [`module-system.md`](../architecture/module-system.md)（15分钟）

**...发现可用的工作者和任务**
→ [`service-discovery.md`](./service-discovery.md)（10分钟）

**...从 v2.0 迁移到 v4.2**
→ [`migration-guide.md`](../migration/migration-guide.md)（20分钟）

**...配置质量门控**
→ [`quality-gates.md`](./quality-gates.md)（15分钟）

**...监控质量指标仪表板**
→ [`quality-dashboard.md`](./quality-dashboard.md)（10分钟）

**...使用模板引擎**
→ [`template-engine-v2.md`](./template-engine-v2.md)（10分钟）

**...设置 CodeRabbit 集成**

**...设置全局 MCP 服务器**
→ [`mcp-global-setup.md`](./mcp-global-setup.md)（10分钟）

---

## 其他指南

- [代理参考指南](../agent-reference-guide.md)
- [Git 工作流指南](../git-workflow-guide.md)
- [入门指南](../getting-started.md)
- [安装故障排除](./installation-troubleshooting.md)
- [故障排除](../troubleshooting.md)

---

## 第 3 阶段文档

| 文档                                          | 行数 | 状态     |
| --------------------------------------------- | ---- | -------- |
| [质量门控指南](./quality-gates.md)            | ~600 | 完整     |
| [质量仪表板指南](./quality-dashboard.md)      | ~350 | 完整     |
| [模板引擎 v2](./template-engine-v2.md)        | ~400 | 完整     |
| [CodeRabbit 集成](./coderabbit/)             | ~1000| 完整     |

---

## 支持

- **GitHub 议题：** 标记 `documentation`、`guides`、`mcp`
- **专家：** 查看 CODEOWNERS 文件

---

**最后更新：** 2025-12-17
**版本：** 2.1（故事 6.14）
