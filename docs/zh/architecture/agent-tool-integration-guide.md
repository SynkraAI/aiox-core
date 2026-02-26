<!-- 翻译: ZH-CN | 原始: /docs/pt/architecture/agent-tool-integration-guide.md | 同步: 2026-02-22 -->

# 代理工具集成指南

> **ZH** | [EN](../architecture/agent-tool-integration-guide.md) | [PT](../pt/architecture/agent-tool-integration-guide.md)

---

**版本**: 1.0.0
**最后更新**: 2026-01-26
**状态**: 官方参考

---

## 概述

本指南说明如何将工具与 AIOS 代理集成。工具通过提供对外部服务、API 和系统资源的访问来扩展代理的能力。

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                 代理工具集成架构          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   代理定义 (YAML 格式的 .md 文件)                           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  dependencies:                                      │   │
│   │    tools: [git, coderabbit, context7]              │   │
│   │    tasks: [task-a.md, task-b.md]                   │   │
│   │    checklists: [checklist-a.md]                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  工具类型                                             │   │
│   │  ├── CLI 工具 (git、npm、gh)                        │   │
│   │  ├── MCP 服务器 (EXA、Context7、Apify)              │   │
│   │  └── 外部服务 (CodeRabbit、Supabase)               │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 依赖声明

代理在其 `.md` 定义文件中的 YAML 块中声明其依赖关系。

### 依赖类型

| 类型           | 描述                           | 位置                        |
| -------------- | ------------------------------ | -------------------------- |
| `tools`        | CLI 工具和外部服务             | 系统 PATH 或 MCP           |
| `tasks`        | 任务工作流文件                 | `.aios-core/development/tasks/`    |
| `checklists`   | 验证清单                       | `.aios-core/product/checklists/`   |

### 声明示例

```yaml
# 来自 .aios-core/development/agents/dev.md
dependencies:
  checklists:
    - story-dod-checklist.md
  tasks:
    - apply-qa-fixes.md
    - create-service.md
    - dev-develop-story.md
    - execute-checklist.md
  tools:
    - coderabbit # 提交前代码质量检查
    - git # 本地操作: add、commit、status、diff
    - context7 # 库文档查询
    - supabase # 数据库操作
    - n8n # 工作流自动化
    - browser # Web 应用测试
    - ffmpeg # 媒体文件处理
```

---

## 按代理的工具类别

### @dev (Dex - 开发代理)

| 工具   | 类型     | 目的                                    |
| ------ | -------- | -------------------------------------- |
| `git`        | CLI      | 版本控制 (仅本地操作) |
| `coderabbit` | 外部  | 提交前代码质量审查    |
| `context7`   | MCP      | 库文档查询        |
| `supabase`   | 外部  | 数据库操作和迁移      |
| `n8n`        | 外部  | 工作流自动化                       |
| `browser`    | MCP      | Web 应用测试                     |
| `ffmpeg`     | CLI      | 媒体文件处理           |

**@dev 的 Git 限制**:

- 允许: `git add`、`git commit`、`git status`、`git diff`、`git log`、`git branch`
- 阻止: `git push`、`gh pr create`、`gh pr merge`
- 推送操作需要 @devops 代理

### @devops (Gage - DevOps 代理)

| 工具   | 类型     | 目的                           |
| ------ | -------- | ------------------------------- |
| `git`        | CLI      | 完整 git 操作包括推送 |
| `gh`         | CLI      | GitHub CLI 用于 PR 操作 |
| `docker`     | CLI      | 容器操作             |
| `coderabbit` | 外部  | 自动代码审查 |

**独占能力**:

- 唯一授权推送到远程的代理
- 唯一授权创建/合并 PR 的代理
- MCP 基础设施管理

### @qa (Quinn - QA 代理)

| 工具   | 类型 | 目的                          |
| ------ | ---- | ----------------------------- |
| `jest`       | CLI  | 单元测试                   |
| `playwright` | MCP  | E2E 测试和浏览器自动化  |
| `npm test`   | CLI  | 测试执行器                 |

### @architect (Aria - 架构师代理)

| 工具 | 类型 | 目的                   |
| ---- | ---- | ---------------------- |
| `exa`      | MCP  | 研究和分析          |
| `context7` | MCP  | 文档参考  |

---

## MCP 集成

### 可用的 MCP 工具

MCP 服务器 (Model Context Protocol) 为代理使用提供结构化 API。

| MCP 服务器 | 提供的工具                                               | 使用者        |
| ---------- | -------------------------------------------------------- | ------------- |
| EXA        | `web_search_exa`、`company_research_exa`、`get_code_context_exa`    | @architect       |
| Context7   | `resolve-library-id`、`query-docs`                  | @dev、@architect |
| Playwright | `browser_navigate`、`browser_screenshot`、`browser_click`           | @qa              |
| Apify      | `search-actors`、`call-actor`、`get-actor-output`                   | @devops          |

### MCP 配置

MCP 服务器通过 Docker MCP 工具包配置。见 [MCP API 密钥管理](./mcp-api-keys-management.md) 用于配置。

### 使用模式

```
1. 代理收到需要外部数据的任务
2. 代理从其依赖中识别适当的 MCP 工具
3. 代理通过工具接口调用 MCP 工具
4. MCP 返回结构化响应
5. 代理处理响应并继续任务
```

---

## CodeRabbit 集成

@dev 代理包括 CodeRabbit 进行提交前质量检查。

### 配置

```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl # 或 'native'

  self_healing:
    enabled: true
    type: light
    max_iterations: 2
    timeout_minutes: 15
    trigger: story_completion
    severity_filter:
      - CRITICAL
    behavior:
      CRITICAL: auto_fix
      HIGH: document_only
      MEDIUM: ignore
      LOW: ignore
```

### 工作流

在将故事标记为 "准备审查" 前:

1. 在未提交的变更上执行 CodeRabbit
2. 如果发现关键问题，尝试自动修复 (最多 2 次迭代)
3. 在故事的开发笔记中记录高严重级别问题
4. 如果关键问题在迭代后仍然存在，停止并通知用户

---

## Git 限制架构

AIOS 实现严格的 git 操作治理:

### @dev 代理的权限

```yaml
git_restrictions:
  allowed_operations:
    - git add
    - git commit
    - git status
    - git diff
    - git log
    - git branch
    - git checkout
    - git merge
  blocked_operations:
    - git push
    - git push --force
    - gh pr create
    - gh pr merge
```

### @devops 代理的权限

```yaml
git_permissions:
  full_access: true
  special_capabilities:
    - push to remote
    - create pull requests
    - merge pull requests
    - admin bypass for branch protection
```

### 切换工作流

```
@dev 完成故事
    ↓
@dev 标记状态: "准备审查"
    ↓
用户激活 @devops
    ↓
@devops 创建 PR 并推送
```

---

## 添加新工具

### 步骤 1: 更新代理定义

将工具添加到代理的 `dependencies.tools` 列表:

```yaml
dependencies:
  tools:
    - existing-tool
    - new-tool # 在此添加
```

### 步骤 2: 记录工具使用

如果工具需要特定配置或有特殊使用模式，添加文档:

```yaml
tool_integration:
  new-tool:
    purpose: '简短描述'
    common_commands:
      - 'new-tool --help'
      - 'new-tool run <args>'
    when_to_use: '当条件 X 满足时使用'
```

### 步骤 3: 测试集成

激活代理并验证工具是否可访问且可正常工作。

---

## 最佳实践

### 应该做的事

- 在代理定义中声明所有工具依赖关系
- 为每种任务类型使用合适的工具
- 遵循代理的权限界限
- 记录工具使用以用于调试
- 使用前验证工具输出

### 不应该做的事

- 使用在依赖中未声明的工具
- 绕过 git 限制 (使用合适的代理)
- 忽略工具返回码
- 在工具日志中公开敏感数据
- 跳过输入验证

---

## 故障排除

### 未找到工具

1. 验证工具是否已安装: `which <tool-name>`
2. 检查环境变量 PATH
3. 验证工具在代理依赖中声明

### MCP 工具错误

1. 验证 MCP 服务器是否正在运行
2. 验证 API 密钥是否已配置 (见 [MCP API 密钥管理](./mcp-api-keys-management.md))
3. 查阅工具特定文档

### 权限被拒绝

1. 验证此代理是否阻止该操作
2. 验证是否应该使用 @devops
3. 检查文件/目录权限

---

## 相关文档

- [MCP API 密钥管理](./mcp-api-keys-management.md)
- [MCP 使用规则](../../../.claude/rules/mcp-usage.md)
- [代理定义](../../../.aios-core/development/agents/)

---

**维护者**: @architect (Aria)
