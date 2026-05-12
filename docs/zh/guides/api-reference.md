# AIOX API 参考

> **[EN](../../guides/api-reference.md)** | **[PT](../../pt/guides/api-reference.md)** | **[ES](../../es/guides/api-reference.md)** | **ZH**

---

Synkra AIOX 完整 API 参考 - AI 编排全栈开发系统。

**版本：** 2.1.0
**最后更新：** 2026-01-29

---

## 目录

1. [概述](#概述)
2. [代理激活](#代理激活)
3. [命令参考](#命令参考)
4. [代理特定命令](#代理特定命令)
5. [工作流 API](#工作流-api)
6. [参数和选项](#参数和选项)
7. [返回代码和错误](#返回代码和错误)
8. [IDE 集成](#ide-集成)
9. [示例](#示例)

---

## 概述

### API 架构

AIOX 通过两个主要机制提供统一 API 来与专业 AI 代理交互：

1. **代理激活** - 使用 `@` 前缀激活专业代理
2. **命令执行** - 使用 `*` 前缀执行代理命令

```
┌─────────────────────────────────────────────────────────────┐
│                      AIOX API 层                             │
├─────────────────────────────────────────────────────────────┤
│  @agent         →  激活代理角色                               │
│  *command       →  执行代理命令                               │
│  *command args  →  使用参数执行命令                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    代理解析                                  │
├─────────────────────────────────────────────────────────────┤
│  .aiox-core/development/agents/{agent-id}.md                 │
│  依赖项：任务、模板、检查清单、脚本                           │
└─────────────────────────────────────────────────────────────┘
```

### 核心原则

| 原则                   | 描述                                              |
| ---------------------- | ------------------------------------------------- |
| **任务优先**           | 一切都是任务。用户请求解析为任务执行。           |
| **代理专业化**         | 每个代理都有明确定义的范围和责任                 |
| **声明性命令**         | 命令描述意图，代理处理执行                       |
| **渐进式增强**         | 简单命令扩展为复杂工作流                         |

---

## 代理激活

### 语法

```
@{agent-id}
@{agent-id} *{command}
@{agent-id} *{command} {arguments}
```

### 可用代理

| 代理 ID          | 名称   | 原型    | 主要责任                           |
| ---------------- | ------ | ------- | ---------------------------------- |
| `@dev`           | Dex    | Builder | 代码实现、调试、测试               |
| `@qa`            | Quinn  | Guardian| 质量保证、代码审查、测试           |
| `@architect`     | Aria   | Visionary| 系统架构、API 设计                |
| `@pm`            | Morgan | Strategist| 产品需求、史诗、战略            |
| `@po`            | Pax    | Champion| 待办事项管理、验收标准             |
| `@sm`            | River  | Facilitator| 冲刺规划、故事创建             |
| `@analyst`       | Atlas  | Explorer| 市场研究、竞争分析                 |
| `@data-engineer` | Dara   | Architect| 数据库架构、迁移、查询           |
| `@devops`        | Gage   | Optimizer| CI/CD、部署、git 操作             |
| `@ux-expert`     | Uma    | Creator | UI/UX 设计、线框图                 |
| `@aiox-master`   | Orion  | Orchestrator| 框架编排、元操作             |

### 激活行为

激活代理时：

1. 从 `.aiox-core/development/agents/{id}.md` 加载代理定义文件
2. 采用角色（语气、词汇、问候）
3. 基于会话类型显示上下文问候
4. 代理停止并等待用户输入

```bash
# 激活开发者代理
@dev

# 输出：
# 💻 Dex (Builder) 已就绪。让我们创造伟大的东西！
#
# **快速命令：**
# - *develop {story-id} - 实现故事任务
# - *run-tests - 执行 linting 和测试
# - *help - 显示所有命令
```

### 使用命令激活

您可以在一个步骤中激活代理并执行命令：

```bash
@dev *develop story-1.2.3
@qa *review story-1.2.3
@architect *create-full-stack-architecture
```

---

## 命令参考

### 通用命令

这些命令在所有代理中可用：

| 命令            | 描述                    | 示例            |
| --------------- | ----------------------- | --------------- |
| `*help`         | 显示所有可用命令        | `*help`         |
| `*guide`        | 显示综合使用指南        | `*guide`        |
| `*session-info` | 显示当前会话详情        | `*session-info` |
| `*exit`         | 退出当前代理模式        | `*exit`         |
| `*yolo`         | 切换确认跳过            | `*yolo`         |

### 命令语法

```
*{command}
*{command} {positional-argument}
*{command} {arg1} {arg2}
*{command} --{flag}
*{command} --{option}={value}
```

### 命令解析

命令解析为代理依赖项中的任务文件：

```
*develop story-1.2.3
    │
    ▼
.aiox-core/development/tasks/dev-develop-story.md
    │
    ▼
带参数的任务执行：{ story: "story-1.2.3" }
```

---

## 代理特定命令

### @dev (开发者)

**故事开发：**

| 命令                  | 参数          | 描述                                          |
| --------------------- | ------------- | --------------------------------------------- |
| `*develop`            | `{story-id}`  | 实现故事任务（模式：yolo、交互、预检）       |
| `*develop-yolo`       | `{story-id}`  | 自主开发模式                                 |
| `*develop-interactive`| `{story-id}`  | 交互开发模式（默认）                         |
| `*develop-preflight`  | `{story-id}`  | 实现前规划模式                               |

**子任务执行（ADE）：**

| 命令              | 参数            | 描述                                  |
| ----------------- | --------------- | ------------------------------------- |
| `*execute-subtask`| `{subtask-id}`  | 执行单个子任务（13 步代码代理工作流）|
| `*verify-subtask` | `{subtask-id}`  | 验证子任务完成                       |

**恢复系统：**

| 命令            | 参数            | 描述                 |
| --------------- | --------------- | -------------------- |
| `*track-attempt`| `{subtask-id}`  | 跟踪实现尝试         |
| `*rollback`     | `[--hard]`      | 回滚到最后良好状态   |

**构建操作：**

| 命令                | 参数          | 描述                         |
| ------------------- | ------------- | ---------------------------- |
| `*build`            | `{story-id}`  | 完整自主构建管道             |
| `*build-autonomous` | `{story-id}`  | 启动自主构建循环             |
| `*build-resume`     | `{story-id}`  | 从检查点恢复构建             |
| `*build-status`     | `[--all]`     | 显示构建状态                 |
| `*build-log`        | `{story-id}`  | 查看构建尝试日志             |

**质量和技术债：**

| 命令              | 参数      | 描述                      |
| ----------------- | --------- | ------------------------- |
| `*run-tests`      | -         | 执行 linting 和所有测试   |
| `*apply-qa-fixes` | -         | 应用 QA 反馈和修复        |
| `*backlog-debt`   | `{title}` | 注册技术债务项目          |

**Worktree 隔离：**

| 命令                | 参数          | 描述                 |
| ------------------- | ------------- | -------------------- |
| `*worktree-create`  | `{story-id}`  | 创建隔离的 worktree  |
| `*worktree-list`    | -             | 列出活跃的 worktree  |
| `*worktree-merge`   | `{story-id}`  | 将 worktree 合并回基础 |
| `*worktree-cleanup` | -             | 删除完成的 worktree  |

**内存层：**

| 命令                | 参数                              | 描述                |
| ------------------- | --------------------------------- | ------------------- |
| `*capture-insights` | -                                 | 捕获会话见解        |
| `*list-gotchas`     | -                                 | 列出已知陷阱        |
| `*gotcha`           | `{title} - {description}`         | 手动添加陷阱        |
| `*gotchas`          | `[--category X] [--severity Y]`   | 列出和搜索陷阱      |

---

## 工作流 API

### 可用工作流

| 工作流                 | 描述                 | 参与代理           |
| ---------------------- | -------------------- | ------------------ |
| `greenfield-fullstack` | 新的全栈项目         | 所有代理           |
| `greenfield-service`   | 新微服务             | architect、dev、qa |
| `greenfield-ui`        | 新前端项目           | architect、ux、dev |
| `brownfield-fullstack` | 向现有项目添加功能   | architect、dev、qa |
| `brownfield-service`   | 扩展现有服务         | dev、qa            |
| `brownfield-ui`        | 扩展现有前端         | ux、dev、qa        |

### 工作流执行

```bash
# 启动工作流
@aiox-master *workflow greenfield-fullstack

# 带参数
*workflow brownfield-service --target=./services/auth
```

### 工作流结构

```yaml
# 工作流定义示例
name: greenfield-fullstack
phases:
  - name: research
    agent: analyst
    tasks:
      - brainstorm
      - competitive-analysis
  - name: planning
    agent: pm
    tasks:
      - create-prd
  - name: architecture
    agent: architect
    tasks:
      - create-full-stack-architecture
  - name: implementation
    agent: dev
    tasks:
      - develop
```

---

## 参数和选项

### 全局选项

| 选项         | 类型    | 描述                 |
| ------------ | ------- | -------------------- |
| `--verbose`  | boolean | 启用详细输出         |
| `--dry-run`  | boolean | 预览而不执行         |
| `--force`    | boolean | 强制操作             |
| `--help`     | boolean | 显示命令帮助         |

### 故事参数

| 参数          | 类型   | 描述          | 示例                         |
| ------------- | ------ | ------------- | ---------------------------- |
| `{story-id}`  | string | 故事标识符    | `story-1.2.3`、`STORY-42`    |
| `--status`    | enum   | 故事状态过滤器| `draft`、`ready`、`complete` |
| `--epic`      | string | 按史诗过滤    | `--epic=AUTH`                |

### 构建参数

| 参数            | 类型   | 描述              | 示例                           |
| --------------- | ------ | ----------------- | ------------------------------ |
| `--mode`        | enum   | 构建模式          | `yolo`、`interactive`、`preflight` |
| `--retry`       | number | 最大重试次数      | `--retry=3`                    |
| `--checkpoint`  | string | 从检查点恢复      | `--checkpoint=build-001`       |

### 审查参数

| 参数            | 类型   | 描述          | 示例                         |
| --------------- | ------ | ------------- | ---------------------------- |
| `--scope`       | enum   | 审查范围      | `uncommitted`、`committed`   |
| `--base`        | string | 基础分支      | `--base=main`                |
| `--severity`    | enum   | 最小严重级别  | `critical`、`high`、`medium` |

---

## 返回代码和错误

### 标准返回代码

| 代码 | 状态     | 描述                               |
| ---- | -------- | ---------------------------------- |
| `0`  | SUCCESS  | 操作成功完成                       |
| `1`  | ERROR    | 常规错误                           |
| `2`  | BLOCKED  | 操作被阻止（需要批准）             |
| `3`  | HALTED   | 操作停止（需要用户干预）           |
| `4`  | SKIP     | 操作跳过                           |
| `5`  | TIMEOUT  | 操作超时                           |

### 错误类别

| 类别                 | 描述                         | 解决方案                           |
| -------------------- | ---------------------------- | ---------------------------------- |
| `AGENT_NOT_FOUND`    | 缺少代理定义                 | 检查 `.aiox-core/development/agents/` |
| `TASK_NOT_FOUND`     | 缺少任务定义                 | 检查代理依赖项                     |
| `STORY_NOT_FOUND`    | 找不到故事文件               | 验证 `docs/stories/` 路径          |
| `VALIDATION_FAILED`  | 前提条件不符                 | 检查先决条件                       |
| `PERMISSION_DENIED`  | 不允许的操作                 | 检查代理限制                       |
| `DEPENDENCY_MISSING` | 缺少必需依赖项               | 安装或配置依赖项                   |

### 错误响应格式

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "故事状态必须是 'Ready for Dev' 才能开始实现",
  "context": {
    "story": "story-1.2.3",
    "currentStatus": "Draft",
    "requiredStatus": "Ready for Dev"
  },
  "suggestions": ["更新故事状态为 'Ready for Dev'", "联系 @pm 批准故事"]
}
```

### 质量门控决定

| 决定       | 描述                         | 操作                  |
| ---------- | ---------------------------- | --------------------- |
| `PASS`     | 所有标准都符合               | 继续到下一阶段        |
| `CONCERNS` | 发现次要问题                 | 记录并谨慎继续        |
| `FAIL`     | 发现关键问题                 | 必须在继续前修复      |
| `WAIVED`   | 已确认问题，继续进行         | 记录豁免原因          |

---

## IDE 集成

### 支持的 IDE

| IDE         | 目录      | 格式            | 支持级别 |
| ----------- | --------- | --------------- | -------- |
| Claude Code | `.claude/`| Markdown        | 完整     |
| Cursor      | `.cursor/ `| MDC (frontmatter)| 完整    |
| VS Code     | `.vscode/ `| JSON            | 部分     |
| Gemini      | `.gemini/ `| Markdown        | 基础     |

### Claude Code 集成

Claude Code 是主要支持的 IDE，拥有完整集成：

**代理命令（斜杠命令）：**

```
/dev          → 激活 @dev 代理
/qa           → 激活 @qa 代理
/architect    → 激活 @architect 代理
/aiox-master  → 激活 @aiox-master 代理
```

---

## 示例

### 示例 1：完整故事实现

```bash
# 1. 激活开发者代理
@dev

# 2. 开始故事实现
*develop story-1.2.3

# 3. 运行测试
*run-tests

# 4. 检查已知陷阱
*list-gotchas

# 5. 退出开发者模式
*exit

# 6. 切换到 QA
@qa

# 7. 审查故事
*review story-1.2.3

# 8. 创建质量门控
*gate story-1.2.3
```

---

_Synkra AIOX API 参考 v4.0.4_
