# 多仓库策略

> **ZH** | [EN](../architecture/multi-repo-strategy.md) | [PT](../pt/architecture/multi-repo-strategy.md)

---

**版本:** 2.1.0
**最后更新:** 2026-01-28
**状态:** 官方架构文档

---

## 目录

- [概览](#概览)
- [仓库结构](#仓库结构)
- [主要仓库 (aios-core)](#主要仓库-aios-core)
- [Squad 仓库](#squad-仓库)
- [MCP 生态系统仓库](#mcp-生态系统仓库)
- [私有仓库](#私有仓库)
- [同步机制](#同步机制)
- [包分发](#包分发)
- [最佳实践](#最佳实践)

---

## 概览

AIOS v4 采用**多仓库策略**以实现模块化开发、社区贡献和核心框架、扩展(squads)和专有组件之间的清晰分离。

### 设计目标

| 目标                | 描述                                  |
| ------------------- | ------------------------------------- |
| **模块化**          | Squad 可独立开发和版本化               |
| **社区**            | 开源 Squad 鼓励社区贡献               |
| **IP 保护**         | 专有组件保留在私有仓库中               |
| **可扩展性**        | 团队可在单独仓库中工作而无冲突        |
| **许可灵活性**      | 不同组件可有不同许可证                |

---

## 仓库结构

```
SynkraAI 组织
├── 公共仓库
│   ├── aios-core          # 主框架 (MIT)
│   ├── aios-squads        # 社区 Squad (MIT)
│   └── mcp-ecosystem      # MCP 配置 (Apache 2.0)
│
└── 私有仓库
    ├── mmos               # 专有 MMOS (NDA)
    └── certified-partners # 合作伙伴资源(专有)
```

---

## 主要仓库 (aios-core)

### 目的

主仓库包含所有项目依赖的基础 AIOS 框架。

### 内容

| 目录                       | 描述                                    |
| -------------------------- | --------------------------------------- |
| `.aios-core/core/`         | 框架基础(配置、注册表、质量门)          |
| `.aios-core/development/`  | 代理、任务、工作流定义                  |
| `.aios-core/product/`      | 模板、检查表、PM 数据                   |
| `.aios-core/infrastructure/` | 脚本、工具、集成                      |
| `docs/`                    | 框架文档                                |

### 许可证

**MIT** - 宽松许可证用于核心的使用、修改和分发。

### npm 包

```bash
npm install @aios/core
```

---

## Squad 仓库

### 概览

Squad 是模块化扩展,为 AIOS 添加专门功能。

### aios-squads 仓库

```
aios-squads/
├── etl/                    # ETL 处理 Squad
├── creator/                # 内容创建 Squad
├── mmos/                   # MMOS 集成 Squad
└── templates/              # Squad 创建模板
```

### 许可证

**MIT** - 社区贡献的完全开源自由。

### npm 包

```bash
npm install @aios/squad-etl
npm install @aios/squad-creator
npm install @aios/squad-mmos
```

---

## MCP 生态系统仓库

### 目的

各种 IDE 和环境的集中 MCP(模型上下文协议)配置。

### 许可证

**Apache 2.0** - 最大采用的宽松许可证。

### npm 包

```bash
npm install @aios/mcp-presets
```

---

## 私有仓库

### SynkraAI/mmos(专有+NDA)

包含专有 MMOS(心智操作系统)组件:

- MMOS Minds 定义
- 心智 DNA 算法
- 专有训练数据
- 合作伙伴特定定制

**访问:** 需要 NDA 和许可协议。

### SynkraAI/certified-partners(专有)

AIOS 认证合作伙伴的资源:

- 高级 Squad 实现
- 合作伙伴门户访问
- 企业支持工具
- 白标配置

**访问:** 需要认证合作伙伴状态。

---

## 同步机制

### 仓库间的依赖

```
aios-squads → 依赖于 → aios-core
```

### 版本兼容性

| aios-core | aios-squads | mcp-ecosystem |
| --------- | ----------- | ------------- |
| ^2.1.0    | ^1.0.0      | ^1.0.0        |
| ^3.0.0    | ^2.0.0      | ^1.x.x        |

### npm 依赖(推荐)

```json
{
  "dependencies": {
    "@aios/core": "^2.1.0",
    "@aios/squad-etl": "^1.0.0",
    "@aios/mcp-presets": "^1.0.0"
  }
}
```

---

## 包分发

### npm 包范围

| 包                   | 注册表 | 许可证     | 仓库        |
| -------------------- | ------ | ---------- | ----------- |
| `@aios/core`         | npm    | MIT        | aios-core   |
| `@aios/squad-etl`    | npm    | MIT        | aios-squads |
| `@aios/squad-creator`| npm    | MIT        | aios-squads |
| `@aios/squad-mmos`   | npm    | MIT        | aios-squads |
| `@aios/mcp-presets`  | npm    | Apache 2.0 | mcp-ecosystem |

---

## 最佳实践

### 对于核心贡献者

1. **原子变更** - 保持 PR 专注于单个功能或修复
2. **向后兼容性** - 避免次要版本中的破坏性变更
3. **文档** - 在同一 PR 中更新代码的文档
4. **跨仓库测试** - 针对依赖仓库测试变更

### 对于 Squad 开发者

1. **清单优先** - 在实现前定义 squad.yaml
2. **对等依赖** - 指定精确的 aios-core 版本要求
3. **独立测试** - Squad 应有自己的测试套件
4. **README 标准** - 包含使用示例和要求

### 对于项目消费者

1. **锁定版本** - 在生产中使用精确版本
2. **测试更新** - 更新依赖后运行完整测试套件
3. **监控发布** - 订阅发布通知
4. **报告问题** - 在正确的仓库中注册问题

---

## 相关文档

- [高级架构](./high-level-architecture.md)
- [模块系统](./module-system.md)
- [Squad 指南](../guides/squads-guide.md)

---

_最后更新: 2026-01-28 | AIOS 框架团队_
