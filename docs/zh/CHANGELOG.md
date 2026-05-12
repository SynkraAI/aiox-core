<!--
  翻译：zh-CN（简体中文）
  原文：/docs/CHANGELOG.md
  最后同步：2026-02-22
  说明：仅翻译标题和描述，保留技术内容
-->

# 变更日志

> 🌐 [EN](../CHANGELOG.md) | [PT](../pt/CHANGELOG.md) | [ES](../es/CHANGELOG.md) | **ZH**

---

Synkra AIOX 的所有重要变更都将记录在此文件中。

本格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/spec/v2.0.0.html)。

---

## [2.2.0] - 2026-01-29

### 新增

- **AIOX 自主开发引擎 (ADE)**：完整的自主开发系统，包含 7 个 Epic：
  - **Epic 1 - Worktree Manager**：用于并行 story 开发的 Git worktree 隔离
  - **Epic 2 - Migration V2→V3**：autoClaude V3 格式及能力标志
  - **Epic 3 - Spec Pipeline**：将需求转换为可执行规范
  - **Epic 4 - Execution Engine**：13 步子任务执行，强制自我批评
  - **Epic 5 - Recovery System**：自动故障恢复，含尝试跟踪和回滚
  - **Epic 6 - QA Evolution**：10 阶段结构化审查流程
  - **Epic 7 - Memory Layer**：用于模式、洞察和注意事项的持久记忆

- **新代理命令**：
  - `@devops`: `*create-worktree`, `*list-worktrees`, `*merge-worktree`, `*cleanup-worktrees`, `*inventory-assets`, `*analyze-paths`, `*migrate-agent`, `*migrate-batch`
  - `@pm`: `*gather-requirements`, `*write-spec`
  - `@architect`: `*assess-complexity`, `*create-plan`, `*create-context`, `*map-codebase`
  - `@analyst`: `*research-deps`, `*extract-patterns`
  - `@qa`: `*critique-spec`, `*review-build`, `*request-fix`, `*verify-fix`
  - `@dev`: `*execute-subtask`, `*track-attempt`, `*rollback`, `*capture-insights`, `*list-gotchas`, `*apply-qa-fix`

- **新脚本**：
  - `worktree-manager.js`, `story-worktree-hooks.js`, `project-status-loader.js`
  - `asset-inventory.js`, `path-analyzer.js`, `migrate-agent.js`
  - `subtask-verifier.js`, `plan-tracker.js`
  - `recovery-tracker.js`, `approach-manager.js`, `rollback-manager.js`, `stuck-detector.js`
  - `qa-loop-orchestrator.js`, `qa-report-generator.js`
  - `codebase-mapper.js`, `pattern-extractor.js`, `gotchas-documenter.js`

- **新工作流**：
  - `auto-worktree.yaml` - 为 story 自动创建 worktree
  - `spec-pipeline.yaml` - 5 阶段规范流水线
  - `qa-loop.yaml` - QA 审查和修复循环

- **新任务**（15+ 个 ADE 新任务）：
  - Spec Pipeline: `spec-gather-requirements.md`, `spec-assess-complexity.md`, `spec-research-dependencies.md`, `spec-write-spec.md`, `spec-critique.md`
  - Execution: `plan-create-implementation.md`, `plan-create-context.md`, `plan-execute-subtask.md`
  - QA: `qa-review-build.md`, `qa-fix-issues.md`, `qa-structured-review.md`
  - Memory: `capture-session-insights.md`
  - Worktree: `worktree-create.md`, `worktree-list.md`, `worktree-merge.md`

- **JSON Schemas**：
  - `agent-v3-schema.json` - V3 代理定义验证
  - `task-v3-schema.json` - V3 任务定义验证

- **模板**：
  - `spec-tmpl.md` - 规范文档模板
  - `qa-report-tmpl.yaml` - QA 报告模板

- **检查清单**：
  - `self-critique-checklist.md` - 开发者强制自我批评

- **文档**：
  - [ADE 完整指南](guides/ade-guide.md) - 完整教程
  - [Epic 1-7 交接文档](architecture/) - 技术交接（ADE-EPIC-1 至 ADE-EPIC-7）
  - [代理变更](architecture/ADE-AGENT-CHANGES.md) - 所有代理修改及能力矩阵

### 变更

- **代理格式**：所有 12 个代理已迁移到 autoClaude V3 格式及能力标志
- **代理同步**：所有代理现在在 `.aiox-core/development/agents/` 和 `.claude/commands/AIOX/agents/` 之间同步

### 修复

- 所有 ADE Epic 的代理命令注册
- V3 格式的 Schema 验证

---

## [2.1.0] - 2025-01-24

### 新增

- **交互式安装向导**：逐步引导设置，含组件选择
- **多 IDE 支持**：支持 4 个 IDE（Claude Code、Cursor、Gemini CLI、GitHub Copilot）
- **Squads 系统**：模块化附加组件，包括 HybridOps 用于 ClickUp 集成
- **跨平台测试**：Windows、macOS 和 Linux 的完整测试覆盖
- **错误处理和回滚**：安装失败时自动回滚并提供恢复建议
- **代理改进**：
  - `dev` 代理在 yolo 模式下的决策日志
  - `qa` 代理的待办事项管理命令
  - CodeRabbit 集成用于自动代码审查
  - 带有项目状态的上下文问候
- **文档套件**：
  - 故障排除指南，含 23 个已记录问题
  - 22 个问答的 FAQ
  - v2.0 到 v4.0.4 的迁移指南

### 变更

- **目录结构**：`.legacy-core/` 重命名为 `.aiox-core/`
- **配置格式**：增强 `core-config.yaml`，新增 git、projectStatus 和 sharding 选项部分
- **代理格式**：更新代理 YAML schema，含 persona_profile、commands visibility 和 whenToUse 字段
- **IDE 配置**：Claude Code 代理移至 `.claude/commands/AIOX/agents/`
- **文件位置**：
  - `docs/architecture/coding-standards.md` → `docs/framework/coding-standards.md`
  - `docs/architecture/tech-stack.md` → `docs/framework/tech-stack.md`
  - `.aiox-core/utils/` → `.aiox-core/scripts/`

### 修复

- Windows 长路径安装失败
- PowerShell 执行策略阻止脚本
- Linux/macOS 上的 npm 权限问题
- 安装后 IDE 配置未应用

### 废弃

- 手动安装流程（改用 `npx @synkra/aiox-core install`）
- `.legacy-core/` 目录名称（自动迁移）

### 安全

- 增加安装目录验证以防止系统目录修改
- 改进环境变量和 API 密钥的处理

---

## [2.0.0] - 2024-12-01

### 新增

- Synkra AIOX 首次公开发布
- 11 个专业 AI 代理（dev、qa、architect、pm、po、sm、analyst、ux-expert、data-engineer、devops、db-sage）
- 任务工作流系统，含 60+ 个预构建任务
- 模板系统，含 20+ 个文档模板
- 故事驱动开发方法论
- 基本 Claude Code 集成

### 已知问题

- 需要手动安装（2-4 小时）
- 有限的跨平台支持
- 无交互式向导

---

## [1.0.0] - 2024-10-15

### 新增

- 首次内部发布
- 核心代理框架
- 基本任务执行

---

## 迁移说明

### 从 2.0.x 升级到 2.1.x

**快速升级：**

```bash
npx @synkra/aiox-core install --force-upgrade
```

**主要变更：**

1. 目录重命名：`.legacy-core/` → `.aiox-core/`
2. 使用新字段更新 `core-config.yaml`
3. 重新运行 IDE 配置

---

## 链接

- [故障排除](./installation/troubleshooting.md)
- [FAQ](./installation/faq.md)
- [GitHub 仓库](https://github.com/SynkraAI/aiox-core)
- [Issue 追踪器](https://github.com/SynkraAI/aiox-core/issues)
