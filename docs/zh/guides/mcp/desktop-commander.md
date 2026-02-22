# Desktop Commander MCP

> **EN** | **ZH**

---

使用 Desktop Commander MCP 服务器和 Claude Code 的指南，用于高级终端和进程管理功能。

**版本：** 1.0.0
**最后更新：** 2026-01-28

---

## 概述

Desktop Commander 是一个 MCP 服务器，使用高级功能扩展 Claude Code，用于本地环境管理。它提供 Claude Code 的本机工具无法做到的功能，使其对某些工作流程至关重要。

### 何时使用 Desktop Commander

| 用例                            | 原生 Claude Code | Desktop Commander |
| ------------------------------- | ---------------- | ----------------- |
| 持久会话（SSH、REPL）           | 不支持           | **推荐**          |
| 交互式进程                      | 限制             | **推荐**          |
| 模糊文件编辑                    | 不支持           | **推荐**          |
| 读取文件尾部（负偏移）          | 不支持           | **推荐**          |
| 内存中代码执行                  | 不支持           | **推荐**          |
| 简单文件操作                    | **首选**         | 较慢              |
| Git 操作                        | **首选**         | 不必要            |
| 文件搜索（Glob、Grep）          | **首选**         | 不必要            |

---

## 能力比较

### Desktop Commander 可以做而 Claude Code 不能做的事

| 功能                     | Claude Code 原生                           | Desktop Commander                            |
| ------------------------ | ------------------------------------------ | -------------------------------------------- |
| **持久会话**             | Shell 状态在调用之间不持久（仅工作目录）   | 维护活动会话（SSH、数据库、REPL）            |
| **内存中代码执行**       | 需要 Write → Bash                          | 直接 REPL 执行（Python、Node.js、R）         |
| **模糊编辑**             | Edit 需要 old_string 精确匹配               | 智能回退并模糊搜索                          |
| **负偏移（tail）**       | Read 仅具有正偏移                          | 从文件末尾读取（如 Unix tail）                |
| **交互式进程**           | 限制（后台无 stdin）                      | 双向 stdin/stdout                            |
| **动态配置**             | 需要重启                                   | 动态更改 shell、目录、阻止的命令              |
| **审计日志**             | ~/.claude.json 中的基本信息                | 完整的工具历史和使用统计                      |

### Claude Code 原生足够的地方

| 功能                     | Claude Code 原生        | 注释                           |
| ------------------------ | ----------------------- | ------------------------------ |
| **分页搜索**             | Grep 有 `head_limit` 和 `offset` | 已经能够流式传输 |
| **多会话管理**           | Task 工具 + TaskOutput + /tasks | 不同的方法但功能齐全 |
| **CSV/JSON 分析**        | Read + Bash with jq/python | 对大多数情况都适用 |

---

## 安装

### 前置要求

- Node.js 18+
- Claude Code CLI 已安装
- MCP 支持已启用

### 设置

```bash
# 全局安装 desktop-commander
npm install -g @anthropic/desktop-commander

# 或添加到 Claude Code MCP 配置
claude mcp add desktop-commander
```

### 配置

添加到 `~/.claude.json`：

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/desktop-commander"]
    }
  }
}
```

---

## 可用工具

### 终端管理

| 工具              | 描述                       |
| ----------------- | -------------------------- |
| `execute_command` | 使用持久会话运行 shell 命令 |
| `read_output`     | 从运行进程读取输出          |
| `send_input`      | 向交互式进程发送输入        |
| `force_terminate` | 杀死运行的进程              |
| `list_sessions`   | 列出所有活动会话            |
| `list_processes`  | 列出运行的进程              |

### 文件操作

| 工具             | 描述                               |
| ---------------- | ---------------------------------- |
| `read_file`      | 读取文件，支持负偏移（tail）       |
| `write_file`     | 写入文件内容                       |
| `edit_block`     | 使用模糊匹配回退编辑               |
| `search_files`   | 搜索带有流式传输/分页              |
| `get_file_info`  | 获取文件元数据                     |
| `list_directory` | 列出目录内容                       |

### 代码执行

| 工具           | 描述                            |
| -------------- | ------------------------------- |
| `execute_code` | 内存中运行代码（Python、Node.js、R） |
| `create_repl`  | 创建持久 REPL 会话              |
| `repl_execute` | 在现有 REPL 中执行              |

### 配置

| 工具               | 描述                  |
| ------------------ | --------------------- |
| `get_config`       | 获取当前配置          |
| `set_config_value` | 动态更新配置          |

---

## 使用示例

### 持久 SSH 会话

```
# 创建 SSH 会话
execute_command: ssh user@server.com

# 向会话发送命令
send_input: ls -la
read_output: [session_id]

# 保持会话活动以进行多次交互
send_input: cd /var/log
send_input: tail -f syslog
```

### 内存中 Python 分析

```
# 执行 Python 而不创建文件
execute_code:
  language: python
  code: |
    import pandas as pd
    df = pd.read_csv('/path/to/data.csv')
    print(df.describe())
    print(df.head(10))
```

### 模糊文件编辑

```
# 使用近似匹配编辑（当精确匹配失败时）
edit_block:
  file_path: /path/to/file.py
  old_text: "def process_data(data)"  # 近似匹配
  new_text: "def process_data(data: dict) -> dict"
  fuzzy: true
```

### 读取文件尾部

```
# 读取大日志文件的最后 100 行
read_file:
  path: /var/log/application.log
  offset: -100  # 负 = 从末尾
  lines: 100
```

### 交互式 REPL

```
# 创建 Node.js REPL
create_repl:
  language: nodejs

# 在 REPL 中执行（维护状态）
repl_execute: const data = require('./config.json')
repl_execute: Object.keys(data).length
repl_execute: data.settings.enabled
```

---

## 最佳实践

### 1. 尽可能使用原生工具

Desktop Commander 增加延迟。优先使用原生工具：

```
# 好的 - 使用原生 Read
Read 工具用于简单的文件读取

# 好的 - 使用原生 Bash
Bash 工具用于快速命令

# 好的 - 使用原生 Grep
Grep 工具用于文件搜索
```

### 2. 对以下情况使用 Desktop Commander

```
# 持久会话
- SSH 连接
- 数据库连接（psql、mysql、mongo shell）
- REPL 会话（python、node、irb）

# 交互式进程
- 长时间运行的命令，监控输出
- 需要 stdin 输入的进程

# 高级文件操作
- 需要 tail 的大文件（负偏移）
- 不精确匹配的编辑（模糊）
```

### 3. 会话管理

```
# 创建新会话前始终列出会话
list_sessions

# 清理未使用的会话
force_terminate: [old_session_id]

# 为清晰起见命名会话
execute_command:
  command: ssh prod-server
  session_name: prod-ssh
```

### 4. 错误处理

```
# 发送输入前检查进程状态
list_processes

# 为长时间运行的操作使用超时
execute_command:
  command: long-running-task
  timeout: 300000  # 5 分钟
```

---

## 与 AIOS 集成

### 工具选择优先级

根据 `.claude/rules/mcp-usage.md`：

| 任务           | 使用这个             | 不使用 desktop-commander |
| -------------- | -------------------- | ----------------------- |
| 读取本地文件   | `Read` 工具          | 较慢                    |
| 写入本地文件   | `Write` / `Edit` 工具 | 较慢                    |
| 运行 shell 命令 | `Bash` 工具         | 除非需要持久会话         |
| 搜索文件       | `Glob` 工具          | 较慢                    |
| 搜索内容       | `Grep` 工具          | 较慢                    |

### 何时需要 Desktop Commander

1. 用户明确要求持久会话
2. 任务需要 REPL 执行
3. 需要读取大文件的尾部
4. 编辑需要模糊匹配
5. 带有 stdin/stdout 的交互式进程

### 代理职责

| 代理              | Desktop Commander 用例                |
| ----------------- | ------------------------------------- |
| **@dev**          | REPL 会话、调试、实时编码             |
| **@devops**       | SSH 会话、服务器管理、日志分析        |
| **@data-engineer** | 数据分析 REPL、数据库连接            |
| **@qa**           | 交互式测试、进程监控                  |

---

## 故障排除

### 会话未持久化

```bash
# 检查 desktop-commander 是否正在运行
claude mcp status

# 重启 MCP 服务器
claude mcp restart desktop-commander
```

### 模糊编辑不工作

```
# 确保设置了 fuzzy 标志
edit_block:
  fuzzy: true
  threshold: 0.8  # 调整相似度阈值
```

### 进程超时

```
# 增加长操作的超时时间
execute_command:
  timeout: 600000  # 10 分钟

# 或使用后台模式
execute_command:
  background: true
```

### 无法连接到服务器

```bash
# 检查 MCP 配置
cat ~/.claude.json | grep -A 10 desktop-commander

# 验证 npm 包
npm list -g @anthropic/desktop-commander

# 如需要重新安装
npm install -g @anthropic/desktop-commander@latest
```

---

## 相关文档

- [Docker Gateway 教程](./docker-gateway-tutorial.md)
- [MCP 全局设置指南](../mcp-global-setup.md)
- [Docker MCP 设置](../../docker-mcp-setup.md)
- [MCP 使用规则](../../../.claude/rules/mcp-usage.md)
- [代理工具集成](../../architecture/agent-tool-integration-guide.md)

---

## 总结

| 特性               | 原生 Claude Code | Desktop Commander |
| ------------------- | --------------- | --------------------
| 速度                | 快              | 较慢（MCP 开销）  |
| 持久会话            | 否              | 是                |
| 内存中执行          | 否              | 是                |
| 模糊编辑            | 否              | 是                |
| 负偏移              | 否              | 是                |
| 交互式进程          | 限制            | 完全              |

**经验法则：** 默认使用原生工具。仅当需要其独特功能时才切换到 Desktop Commander。

---

_Desktop Commander MCP 指南 v1.0.0 - AIOS 框架_
