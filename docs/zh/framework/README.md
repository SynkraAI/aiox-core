<!-- 翻译：zh-CN 原文：/docs/framework/README.md 最后同步：2026-02-22 -->

# AIOS 框架文档

> [EN](../../framework/README.md) | [PT](../../pt/framework/README.md) | [ES](../../es/framework/README.md) | **ZH**

**状态:** 官方框架标准
**创建日期:** 2025-01-16 (Story 6.1.2.6)
**迁移目标:** 2026年第二季度 -> `SynkraAI/aios-core` 仓库

---

## 概述

本目录包含**官方 AIOS 框架文档**，定义了适用于所有 AIOS 项目（新项目和遗留项目）的标准、模式和结构。

**目的**: 将框架级文档与项目特定的实现细节分离。

---

## 文档清单

| 文档 | 目的 | 受众 |
|------|------|------|
| [**coding-standards.md**](coding-standards.md) | JavaScript/TypeScript 标准、命名约定、代码质量规则 | 所有开发者 |
| [**tech-stack.md**](tech-stack.md) | 技术选型、框架、库和工具标准 | 架构师、开发者 |
| [**source-tree.md**](source-tree.md) | 目录结构、文件组织和项目布局模式 | 所有团队成员 |

---

## 迁移通知

**重要**: 这些文档现在位于 `SynkraAI/aios-core` 仓库中。从旧的 `aios/aios-core` 组织的迁移已于2024年12月完成，作为 OSR-9（品牌重塑）的一部分。

### 迁移时间线

- **第一阶段 (2026年第一季度 - Story 6.1.2.6):** 框架文档已分离到 `docs/framework/`
- **第二阶段 (2024年第四季度):** 仓库已迁移到 `SynkraAI/aios-core` (OSR-9)
- **第三阶段 (2026年第三季度):** 旧的 `docs/architecture/` 副本将从遗留项目中移除

### 向后兼容性

为保持向后兼容性，框架文档在2026年第三季度之前可在**两个**位置访问：
- **新位置**（推荐）: `docs/framework/{doc-name}.md`
- **旧位置**（已弃用）: `docs/architecture/{doc-name}.md`

**参考**: 请更新内部链接以使用 `docs/framework/` 以准备迁移。

---

## 框架与项目文档

### 框架文档 (`docs/framework/`)
- **范围**: 可在所有 AIOS 项目间移植
- **示例**: 编码标准、技术栈、源代码树结构
- **生命周期**: 存放在 `SynkraAI/aios-core` 仓库中
- **变更**: 需要框架级别的审批

### 项目文档 (`docs/architecture/project-decisions/`)
- **范围**: 特定于遗留项目实现
- **示例**: 决策分析、架构评审、集成决策
- **生命周期**: 永久存放在项目仓库中
- **变更**: 由项目团队决定

---

## 使用指南

### 对于开发者
1. **入职时阅读框架文档** - 了解 AIOS 标准
2. **开发时参考** - 确保符合框架模式
3. **通过 PR 提出变更** - 框架标准随社区输入而演进

### 对于架构师
1. **维护框架文档** - 保持标准的时效性和实用性
2. **审查 PR 的合规性** - 确保代码遵循文档标准
3. **规划迁移** - 为2026年第二季度的仓库拆分做准备

### 对于 AIOS 框架维护者
1. **版本控制** - 跟踪框架标准的变更
2. **迁移准备** - 确保文档已准备好进行仓库分离
3. **跨项目一致性** - 统一应用标准

---

## 相关文档

- **架构概述**: [`docs/architecture/`](../architecture/)
- **安装指南**: [`docs/installation/`](../installation/)
- **平台指南**: [`docs/platforms/`](../platforms/)
- **架构决策**: `docs/decisions/` *(即将推出)*
- **Epic 规划**: `docs/epics/` *(即将推出)*

---

**最后更新**: 2026-01-28
**维护者**: AIOS 框架团队
