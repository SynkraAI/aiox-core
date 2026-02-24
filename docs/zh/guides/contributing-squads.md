# Squad贡献指南

> **EN** | **ZH-CN** | [PT](../pt/guides/contributing-squads.md) | [ES](../es/guides/contributing-squads.md)

---

如何向AIOS生态系统贡献Squad。

## 概述

有两种方式与社区共享你的Squad：

1. **aios-squads Repository** - GitHub上的免费开源Squad
2. **Synkra Marketplace** - 通过Synkra API的高级Squad

## 质量标准

所有贡献的Squad必须符合这些标准：

### 必需

| 要求 | 描述 |
|------|------|
| **有效的清单** | `squad.yaml` 通过JSON Schema验证 |
| **文档** | README.md包含使用说明 |
| **许可证** | 开源许可证（MIT、Apache 2.0等） |
| **AIOS兼容性** | `aios.minVersion: "2.1.0"` 或更高 |
| **Task优先架构** | Task作为主要入口点 |

### 推荐

| 建议 | 描述 |
|------|------|
| **示例** | README中的使用示例 |
| **测试** | 关键功能的单元测试 |
| **变更日志** | 版本历史文档 |
| **故障排除** | 常见问题和解决方案 |

## 命名约定

### Squad名称

- 使用 `kebab-case`: `my-awesome-squad`
- 具有描述性: `etl-data-pipeline` 而不是 `data1`
- 避免通用名称: `helper-squad` 太模糊
- 名称中不包含版本号: `my-squad` 而不是 `my-squad-v2`

### 前缀 (slashPrefix)

`squad.yaml` 中的 `slashPrefix` 决定命令前缀：

```yaml
slashPrefix: etl  # 命令变为 *etl-extract, *etl-transform
```

选择唯一的、短的前缀（2-5个字符）。

## 清单要求

### 必需字段

```yaml
# 这些字段是必需的
name: my-squad
version: 1.0.0              # 语义版本控制
description: 此Squad的功能说明

aios:
  minVersion: "2.1.0"
  type: squad

components:
  agents: []                # 至少一个agent或task
  tasks: []
```

### 推荐字段

```yaml
# 这些字段是推荐的
author: Your Name <email@example.com>
license: MIT
slashPrefix: my

tags:
  - relevant
  - keywords

dependencies:
  node: []
  python: []
  squads: []
```

## 文档要求

### README.md结构

```markdown
# Squad名称

简短描述（1-2句）。

## 安装

如何安装/添加此Squad。

## 用法

基本使用示例。

## 命令

| 命令 | 描述 |
|------|------|
| *cmd1 | 它的作用 |
| *cmd2 | 它的作用 |

## 配置

任何配置选项。

## 示例

详细的使用示例。

## 故障排除

常见问题和解决方案。

## 许可证

许可证信息。
```

## 发布到aios-squads

### 前提条件

1. GitHub账户
2. Squad已验证: `*validate-squad --strict`
3. 唯一的Squad名称（检查现有Squad）

### 步骤

```bash
# 1. 验证你的Squad
@squad-creator
*validate-squad my-squad --strict

# 2. 发布（创建PR）
*publish-squad ./squads/my-squad
```

这将：
1. Fork `SynkraAI/aios-squads` （如需要）
2. 用你的Squad创建分支
3. 开启审查PR

### 审查过程

1. **自动检查** - Schema验证、结构检查
2. **维护者审查** - 代码审查、质量检查
3. **合并** - Squad添加到注册表

时间表：通常2-5个工作日。

## 发布到Synkra Marketplace

### 前提条件

1. Synkra账户
2. 配置API令牌
3. Squad已验证

### 步骤

```bash
# 1. 配置令牌
export SYNKRA_API_TOKEN="your-token"

# 2. 同步到marketplace
@squad-creator
*sync-squad-synkra ./squads/my-squad --public
```

### 可见性选项

| 标志 | 效果 |
|------|------|
| `--private` | 仅对你的工作区可见 |
| `--public` | 对所有人可见 |

## 更新已发布的Squad

### 版本号提升

遵循语义版本控制：

- **MAJOR** (1.0.0 → 2.0.0): 破坏性改变
- **MINOR** (1.0.0 → 1.1.0): 新特性，向后兼容
- **PATCH** (1.0.0 → 1.0.1): Bug修复

### 更新过程

```bash
# 1. 更新squad.yaml中的版本
# 2. 更新CHANGELOG.md
# 3. 验证
*validate-squad my-squad --strict

# 4. 重新发布
*publish-squad ./squads/my-squad
# 或
*sync-squad-synkra ./squads/my-squad
```

## 行为准则

### 应该做的

- 提供清晰、准确的文档
- 发布前测试你的Squad
- 对问题和反馈做出回应
- 保持依赖项最少
- 遵循AIOS约定

### 不应该做的

- 包含恶意代码
- 在代码中存储凭据
- 未经归属复制他人的工作
- 使用冒犯性的名称或内容
- 用测试Squad垃圾邮件注册表

## 获得帮助

- **问题**: [GitHub讨论](https://github.com/SynkraAI/aios-core/discussions)
- **问题**: [问题跟踪器](https://github.com/SynkraAI/aios-core/issues)
- **指南**: 本文档

## 相关资源

- [Squad开发指南](./squads-guide.md)
- [Squad迁移指南](./squad-migration.md)
- [aios-squads Repository](https://github.com/SynkraAI/aios-squads)

---

**版本:** 1.0.0 | **更新:** 2025-12-26 | **Story:** SQS-8
