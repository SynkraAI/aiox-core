# @dev 系统

> **版本:** 1.0.0
> **创建:** 2026-02-04
> **所有者:** @dev (Dex - 构建者)
> **状态:** 官方文档

---

## 概览

**@dev 代理 (Dex)** 是 AIOS 的全栈开发者，负责故事实现、调试、重构和应用开发最佳实践。该代理充当**构建者**，精确实现故事，仅更新故事文件的授权部分，并保持全面的测试。

### 主要特性

| 特性 | 描述 |
|----------------|-----------|
| **角色** | Dex - 构建者 |
| **原型** | 构建者 |
| **语气** | 务实、简洁、面向解决方案 |
| **专注** | 故事实现、测试、代码质量 |
| **结束语** | "-- Dex，一直在构建" |

### 典型词汇

- 构建
- 实现
- 重构
- 解决
- 优化
- 调试
- 测试

---

## 完整文件列表

### @dev 的核心任务文件

| 文件 | 命令 | 目的 |
|---------|---------|-----------|
| `.aios-core/development/tasks/dev-develop-story.md` | `*develop {story-id}` | 主要任务 - 使用 YOLO/Interactive/Pre-flight 模式完整开发故事 |
| `.aios-core/development/tasks/dev-improve-code-quality.md` | `*improve-code-quality <path>` | 改进代码质量(格式、linting、现代语法) |
| `.aios-core/development/tasks/dev-optimize-performance.md` | `*optimize-performance <path>` | 分析和优化代码性能 |
| `.aios-core/development/tasks/dev-suggest-refactoring.md` | `*suggest-refactoring <path>` | 建议自动重构机会 |
| `.aios-core/development/tasks/dev-backlog-debt.md` | `*backlog-debt` | 在待办事项中记录技术债务 |
| `.aios-core/development/tasks/apply-qa-fixes.md` | `*apply-qa-fixes` | 应用基于 QA 反馈的修复 |
| `.aios-core/development/tasks/execute-checklist.md` | `*execute-checklist` | 使用检查清单验证文档 |
| `.aios-core/development/tasks/validate-next-story.md` | `*validate-story-draft` | 验证故事质量和完整性 |
| `.aios-core/development/tasks/sync-documentation.md` | `*sync-documentation` | 将文档与代码变更同步 |
| `.aios-core/development/tasks/po-manage-story-backlog.md` | (内部使用) | 管理故事待办事项 |

### 代理定义文件

| 文件 | 目的 |
|---------|-----------|
| `.aios-core/development/agents/dev.md` | @dev 代理的核心定义(角色、命令、工作流) |
| `.claude/commands/AIOS/agents/dev.md` | Claude Code 命令用于激活 @dev |

### @dev 使用的检查清单文件

| 文件 | 目的 |
|---------|-----------|
| `.aios-core/product/checklists/story-dod-checklist.md` | 故事的完成定义 |
| `.aios-core/product/checklists/pre-push-checklist.md` | 推送前检查清单 |
| `.aios-core/product/checklists/change-checklist.md` | 变更验证 |

---

## 命令到任务的映射

### 开发命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*develop {story-id}` | `dev-develop-story.md` | 实现完整故事 |
| `*develop {story-id} yolo` | `dev-develop-story.md` | 自主模式(0-1 个提示) |
| `*develop {story-id} interactive` | `dev-develop-story.md` | 交互模式(5-10 个提示) |
| `*develop {story-id} preflight` | `dev-develop-story.md` | 前置规划 |
| `*run-tests` | (内联) | 执行 linting 和测试 |

### 质量命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*apply-qa-fixes` | `apply-qa-fixes.md` | 应用 QA 修复 |
| `*improve-code-quality <path>` | `dev-improve-code-quality.md` | 改进代码质量 |
| `*optimize-performance <path>` | `dev-optimize-performance.md` | 优化性能 |
| `*suggest-refactoring <path>` | `dev-suggest-refactoring.md` | 建议重构 |

### 待办事项和文档命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*backlog-debt` | `dev-backlog-debt.md` | 记录技术债务 |
| `*sync-documentation` | `sync-documentation.md` | 同步文档 |
| `*validate-story-draft` | `validate-next-story.md` | 验证故事草稿 |

### 上下文和会话命令

| 命令 | 操作 |
|---------|----------|
| `*help` | 显示所有可用命令 |
| `*explain` | 解释刚才做了什么 |
| `*guide` | 显示完整使用指南 |
| `*load-full {file}` | 加载完整文件(绕过摘要) |
| `*clear-cache` | 清除上下文缓存 |
| `*session-info` | 显示会话详情 |
| `*exit` | 退出开发者模式 |

---

## 执行模式

| 模式 | 何时使用 | 提示 |
|------|-------------|---------|
| **YOLO** | 简单的、确定性的任务 | 0-1 |
| **Interactive** | 学习、复杂决策 | 5-10 |
| **Pre-flight** | 歧义要求、关键工作 | 全部提前 |

---

## Git 限制

@dev 的 Git 操作有限:

**允许的操作:**
- `git add` - 暂存文件
- `git commit` - 本地提交
- `git status` - 检查状态
- `git diff` - 审查变更
- `git log` - 查看历史
- `git branch` - 列出/创建分支
- `git checkout` - 切换分支
- `git merge` - 本地合并

**被阻止的操作(仅 @github-devops):**
- `git push`
- `git push --force`
- `gh pr create`
- `gh pr merge`

---

## 最佳实践

### 何时使用 @dev

**使用 @dev 来:**
- 实现已批准的故事
- 应用 QA 修复
- 重构现有代码
- 优化性能
- 记录技术债务
- 执行和验证测试

**不要使用 @dev 来:**
- 创建故事(使用 @sm)
- 推送到远程(使用 @github-devops)
- 验证架构(使用 @architect)
- 管理待办事项(使用 @po)

---

## 故事文件更新

**@dev 仅可编辑以下部分:**
- 任务/子任务复选框
- 开发代理记录部分
- 代理模型使用
- 调试日志参考
- 完成备注列表
- 文件列表
- 变更日志
- 状态

**切勿编辑:**
- 故事描述
- 验收标准
- 开发备注(仅添加，不修改)
- 测试部分(结构)

---

## 总结

| 方面 | 详情 |
|---------|----------|
| **总核心文件** | 10 个任务文件 + 1 个代理定义 |
| **主要命令** | 15 个命令(*develop、*run-tests、*apply-qa-fixes 等) |
| **执行模式** | 3 种(YOLO、交互、预飞行) |
| **使用的检查清单** | 3 个(故事 DoD、推送前、变更) |
| **集成工作流** | 6 个(brownfield + greenfield 变体) |
| **协作代理** | 4 个(@sm、@po、@qa、@github-devops) |
| **允许的 Git 操作** | 8 个(add、commit、status、diff、log、branch、checkout、merge) |
| **被阻止的 Git 操作** | 4 个(push、push --force、gh pr create、gh pr merge) |
| **CodeRabbit 自我修复** | 轻模式(最多 2 个迭代，仅 CRITICAL) |

---

## 更改日志

| 日期 | 作者 | 描述 |
|------|-------|-----------|
| 2026-02-04 | @dev | 创建初始文档 |

---

*-- Dex，一直在构建*
