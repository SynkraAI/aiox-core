<!--
  翻译：zh-CN（简体中文）
  原文：/docs/getting-started.md
  最后同步：2026-02-22
-->

# Synkra AIOS 入门指南

> 🌐 [EN](../getting-started.md) | [PT](../pt/getting-started.md) | [ES](../es/getting-started.md) | **ZH**

---

欢迎使用 Synkra AIOS。本指南针对 10 分钟内实现首次价值进行了优化。

## 目录

1. [10 分钟快速路径](#10-分钟快速路径)
2. [安装](#安装)
3. [您的第一个项目](#您的第一个项目)
4. [基本命令](#基本命令)
5. [IDE 兼容性](#ide-兼容性)
6. [棕地项目：现有项目](#棕地项目现有项目)
7. [高级路径](#高级路径)
8. [故障排除](#故障排除)
9. [后续步骤](#后续步骤)

## 10 分钟快速路径

如果您是新手，请使用以下确切流程：

### 步骤 1：安装 AIOS

```bash
# 新项目
npx aios-core init my-first-project
cd my-first-project

# 现有项目
# cd existing-project
# npx aios-core install
```

### 步骤 2：选择您的 IDE 激活路径

- Claude Code：`/agent-name`
- Gemini CLI：`/aios-menu` 然后 `/aios-<agent>`
- Codex CLI：`/skills` 然后 `aios-<agent-id>`
- Cursor/Copilot/AntiGravity：遵循 `docs/ide-integration.md` 中的约束

### 步骤 3：验证首次价值

当满足以下 3 个条件时，即实现首次价值：
1. 您激活了一个 AIOS 代理。
2. 您收到了有效的问候/激活响应。
3. 您运行了一个启动命令（`*help` 或等效命令）并获得了有用的输出。

通过规则：在 <= 10 分钟内完成所有 3 个条件。

## 安装

### 前置要求

- **Node.js** 版本 18.0.0 或更高（推荐 v20+）
- **npm** 版本 9.0.0 或更高
- **Git**（可选，但推荐）

### 快速安装

```bash
# 创建新项目
npx aios-core init my-first-project

# 导航到您的项目
cd my-first-project

# 在您的 IDE 中开始使用 AIOS 代理
# （请参阅上面的步骤 2 了解 IDE 特定的激活方式）
```

### 安装选项

```bash
# 1. 使用自定义模板创建新项目
npx aios-core init my-project --template enterprise

# 2. 在现有项目中安装
cd existing-project
npx aios-core install

# 3. 在非空目录中强制安装
npx aios-core init my-project --force

# 4. 跳过依赖安装（稍后手动安装）
npx aios-core init my-project --skip-install
```

## 您的第一个项目

### 项目结构

安装后，您的项目将包含：

```
my-first-project/
├── .aios-core/                 # AIOS 框架核心
│   ├── core/                   # 编排、内存、配置
│   ├── data/                   # 知识库、实体注册表
│   ├── development/            # 代理、任务、模板、脚本
│   └── infrastructure/         # CI/CD 模板、验证脚本
├── .claude/                    # Claude Code 集成（如果启用）
├── .codex/                     # Codex CLI 集成（如果启用）
├── .gemini/                    # Gemini CLI 集成（如果启用）
├── docs/                       # 文档
│   └── stories/                # 开发故事
├── packages/                   # 共享包
├── tests/                      # 测试套件
└── package.json                # 项目依赖
```

### 配置

AIOS 配置位于 `.aios-core/core/config/`。安装程序处理初始设置。要验证您的安装：

```bash
npx aios-core doctor
```

## 基本命令

### 代理激活

AIOS 代理通过您的 IDE 激活。激活后，代理响应以 `*` 为前缀的命令：

```bash
# 通用命令（在任何代理中都有效）
*help                    # 显示此代理的可用命令
*guide                   # 显示详细使用指南
*session-info            # 显示当前会话详情
*exit                    # 退出代理模式

# 代理特定示例
@dev *help               # 开发者代理命令
@qa *review STORY-42     # QA 代理审查故事
@pm *create-epic         # PM 代理创建 Epic
@sm *draft               # Scrum Master 起草故事
```

### 可用代理

| 代理 | 名称 | 专注领域 |
| --- | --- | --- |
| `@dev` | Dex | 代码实现、bug 修复、重构 |
| `@qa` | Quinn | 测试、质量门控、代码审查 |
| `@architect` | Aria | 系统设计、技术决策 |
| `@pm` | Bob | PRD、战略、路线图 |
| `@po` | Pax | 待办事项、故事验证、优先级排序 |
| `@sm` | River | 故事创建、冲刺计划 |
| `@analyst` | Alex | 研究、竞争分析 |
| `@data-engineer` | Dara | 数据库设计、迁移 |
| `@ux-design-expert` | Uma | UI/UX 设计、无障碍访问 |
| `@devops` | Gage | Git 操作、CI/CD、部署 |

### 典型工作流

```
1. @pm 创建 PRD              → *create-epic
2. @sm 起草故事              → *draft
3. @po 验证故事              → *validate-story-draft
4. @dev 实现                 → （从故事文件工作）
5. @qa 审查                  → *review STORY-ID
6. @devops 推送              → *push（唯一具有推送权限的代理）
7. @po 关闭故事              → *close-story STORY-ID
```

## IDE 兼容性

并非所有 IDE 都同等支持 AIOS 功能。请参阅 [`docs/ide-integration.md`](./ide-integration.md) 中的完整比较。

摘要：

| IDE/CLI | 总体状态 | 如何激活 |
| --- | --- | --- |
| Claude Code | 可用 | `/agent-name` 命令 |
| Gemini CLI | 可用 | `/aios-menu` 然后 `/aios-<agent>` |
| Codex CLI | 有限 | `/skills` 然后 `aios-<agent-id>` |
| Cursor | 有限 | `@agent` + 同步规则 |
| GitHub Copilot | 有限 | 聊天模式 + 仓库指令 |
| AntiGravity | 有限 | 工作流驱动激活 |

- **可用**：完全推荐新用户使用。
- **有限**：可使用，有文档化的变通方法。

## 棕地项目：现有项目

已有代码库？AIOS 通过专用工作流处理棕地项目。

### 快速棕地项目设置

```bash
# 导航到您的现有项目
cd my-existing-project

# 安装 AIOS（非破坏性，保留您的配置）
npx aios-core install

# 运行 doctor 验证兼容性
npx aios-core doctor
```

### 首次运行时发生的事情

当您首次在现有项目中激活 AIOS 代理时：

1. **检测**：AIOS 检测到代码但没有 AIOS 文档
2. **提议**："我可以分析您的代码库。这需要 4-8 小时。"
3. **发现**：多代理技术债务评估（可选）
4. **输出**：系统架构文档 + 技术债务报告

### 棕地项目工作流选项

| 您的情况 | 推荐工作流 |
|----------------|---------------------|
| 向现有项目添加主要功能 | `@pm → *create-doc brownfield-prd` |
| 审计遗留代码库 | `brownfield-discovery.yaml`（完整工作流） |
| 快速增强 | `@pm → *brownfield-create-epic` |
| 单个 bug 修复 | `@pm → *brownfield-create-story` |

### 安全保证

- **非破坏性**：AIOS 创建文件，从不覆盖现有文件
- **回滚**：`git checkout HEAD~1 -- .` 恢复 AIOS 之前的状态
- **配置保留**：您的 `.eslintrc`、`tsconfig.json` 等保持不变

### 资源

- **[棕地项目工作指南](.aios-core/working-in-the-brownfield.md)** - 完整的棕地项目文档
- **[兼容性检查清单](.aios-core/development/checklists/brownfield-compatibility-checklist.md)** - 迁移前/后检查
- **[风险报告模板](.aios-core/product/templates/brownfield-risk-report-tmpl.yaml)** - 分阶段风险评估

---

## 高级路径

对于想要深入了解的有经验用户：

### 同步和验证

```bash
# 将代理同步到所有配置的 IDE
npm run sync:ide

# 验证跨 IDE 一致性
npm run validate:parity

# 运行所有质量检查
npm run lint && npm run typecheck && npm test
```

### 故事驱动开发

所有 AIOS 开发都遵循 `docs/stories/` 中的故事。每个故事包含：
- 带复选框的验收标准
- 映射到特定 AC 的任务
- CodeRabbit 集成用于自动审查
- 质量门控分配

请参阅[用户指南](./guides/user-guide.md)了解完整工作流。

### 小队扩展

小队将 AIOS 扩展到软件开发之外的任何领域。请参阅[小队指南](./guides/squads-guide.md)。

## 故障排除

### 安装问题

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 运行诊断
npx aios-core doctor

# 自动修复常见问题
npx aios-core doctor --fix
```

### 代理无响应

1. 验证您的 IDE 是否受支持（请参阅 [IDE 兼容性](#ide-兼容性)）。
2. 运行 `npm run sync:ide` 刷新代理文件。
3. 重启您的 IDE/CLI 会话。

### 同步问题

```bash
# 预览将要更改的内容
npm run sync:ide -- --dry-run

# 强制重新同步
npm run sync:ide

# 同步后验证
npm run validate:parity
```

## 后续步骤

- **[用户指南](./guides/user-guide.md)** - 从规划到交付的完整工作流
- **[IDE 集成](./ide-integration.md)** - 每个 IDE 的详细设置
- **[架构](./architecture/ARCHITECTURE-INDEX.md)** - 技术深度解析
- **[小队指南](./guides/squads-guide.md)** - 将 AIOS 扩展到任何领域
- **[故障排除](./troubleshooting.md)** - 常见问题和解决方案

---

_Synkra AIOS 入门指南 v4.2.11_
