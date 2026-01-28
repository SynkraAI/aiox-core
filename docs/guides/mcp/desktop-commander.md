# Desktop Commander MCP

> **EN**

---

Guide for using Desktop Commander MCP server with Claude Code for advanced terminal and process management capabilities.

**Version:** 1.0.0
**Last Updated:** 2026-01-28

---

## Overview

Desktop Commander is an MCP server that extends Claude Code with advanced capabilities for local environment management. It provides features that Claude Code's native tools cannot do, making it essential for certain workflows.

### When to Use Desktop Commander

| Use Case                            | Native Claude Code | Desktop Commander |
| ----------------------------------- | ------------------ | ----------------- |
| Persistent sessions (SSH, REPL)     | Not supported      | **Recommended**   |
| Interactive processes               | Limited            | **Recommended**   |
| Fuzzy file editing                  | Not supported      | **Recommended**   |
| Reading file tail (negative offset) | Not supported      | **Recommended**   |
| In-memory code execution            | Not supported      | **Recommended**   |
| Simple file operations              | **Preferred**      | Slower            |
| Git operations                      | **Preferred**      | Unnecessary       |
| File search (Glob, Grep)            | **Preferred**      | Unnecessary       |

---

## Capabilities Comparison

### What Desktop Commander Does That Claude Code Cannot

| Capability                   | Claude Code Native                                           | Desktop Commander                                      |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| **Persistent Sessions**      | Shell state doesn't persist between calls (only working dir) | Maintains active sessions (SSH, databases, REPL)       |
| **In-Memory Code Execution** | Requires Write → Bash                                        | Direct REPL execution (Python, Node.js, R)             |
| **Fuzzy Editing**            | Edit requires EXACT match of old_string                      | Intelligent fallback with fuzzy search                 |
| **Negative Offset (tail)**   | Read only has positive offset                                | Read from end of file (like Unix tail)                 |
| **Interactive Processes**    | Limited (background without stdin)                           | Bidirectional stdin/stdout                             |
| **Dynamic Configuration**    | Requires restart                                             | Change shell, directories, blocked commands on the fly |
| **Audit Trail**              | Basic in .claude.json                                        | Complete tool history and usage statistics             |

### Where Claude Code Native is Sufficient

| Capability                   | Claude Code Native                 | Notes                             |
| ---------------------------- | ---------------------------------- | --------------------------------- |
| **Paginated Search**         | Grep has `head_limit` and `offset` | Already streaming-capable         |
| **Multi-Session Management** | Task tool + TaskOutput + /tasks    | Different approach but functional |
| **CSV/JSON Analysis**        | Read + Bash with jq/python         | Works well for most cases         |

---

## Installation

### Prerequisites

- Node.js 18+
- Claude Code CLI installed
- MCP support enabled

### Setup

```bash
# Install desktop-commander globally
npm install -g @anthropic/desktop-commander

# Or add to Claude Code MCP config
claude mcp add desktop-commander
```

### Configuration

Add to `~/.claude.json`:

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

## Available Tools

### Terminal Management

| Tool              | Description                               |
| ----------------- | ----------------------------------------- |
| `execute_command` | Run shell command with persistent session |
| `read_output`     | Read output from running process          |
| `send_input`      | Send input to interactive process         |
| `force_terminate` | Kill a running process                    |
| `list_sessions`   | List all active sessions                  |
| `list_processes`  | List running processes                    |

### File Operations

| Tool             | Description                                   |
| ---------------- | --------------------------------------------- |
| `read_file`      | Read file with negative offset support (tail) |
| `write_file`     | Write file content                            |
| `edit_block`     | Edit with fuzzy matching fallback             |
| `search_files`   | Search with streaming/pagination              |
| `get_file_info`  | Get file metadata                             |
| `list_directory` | List directory contents                       |

### Code Execution

| Tool           | Description                             |
| -------------- | --------------------------------------- |
| `execute_code` | Run code in-memory (Python, Node.js, R) |
| `create_repl`  | Create persistent REPL session          |
| `repl_execute` | Execute in existing REPL                |

### Configuration

| Tool               | Description                      |
| ------------------ | -------------------------------- |
| `get_config`       | Get current configuration        |
| `set_config_value` | Update configuration dynamically |

---

## Usage Examples

### Persistent SSH Session

```
# Create SSH session
execute_command: ssh user@server.com

# Send commands to session
send_input: ls -la
read_output: [session_id]

# Keep session alive for multiple interactions
send_input: cd /var/log
send_input: tail -f syslog
```

### In-Memory Python Analysis

```
# Execute Python without creating files
execute_code:
  language: python
  code: |
    import pandas as pd
    df = pd.read_csv('/path/to/data.csv')
    print(df.describe())
    print(df.head(10))
```

### Fuzzy File Editing

```
# Edit with approximate match (when exact match fails)
edit_block:
  file_path: /path/to/file.py
  old_text: "def process_data(data)"  # Approximate match
  new_text: "def process_data(data: dict) -> dict"
  fuzzy: true
```

### Reading File Tail

```
# Read last 100 lines of a large log file
read_file:
  path: /var/log/application.log
  offset: -100  # Negative = from end
  lines: 100
```

### Interactive REPL

```
# Create Node.js REPL
create_repl:
  language: nodejs

# Execute in REPL (maintains state)
repl_execute: const data = require('./config.json')
repl_execute: Object.keys(data).length
repl_execute: data.settings.enabled
```

---

## Best Practices

### 1. Use Native Tools When Possible

Desktop Commander adds latency. Prefer native tools for:

```
# Good - Use native Read
Read tool for simple file reading

# Good - Use native Bash
Bash tool for quick commands

# Good - Use native Grep
Grep tool for file search
```

### 2. Use Desktop Commander For

```
# Persistent sessions
- SSH connections
- Database connections (psql, mysql, mongo shell)
- REPL sessions (python, node, irb)

# Interactive processes
- Long-running commands with output monitoring
- Processes requiring stdin input

# Advanced file operations
- Large files needing tail (negative offset)
- Edits with inexact matches (fuzzy)
```

### 3. Session Management

```
# Always list sessions before creating new ones
list_sessions

# Clean up unused sessions
force_terminate: [old_session_id]

# Name sessions for clarity
execute_command:
  command: ssh prod-server
  session_name: prod-ssh
```

### 4. Error Handling

```
# Check process status before sending input
list_processes

# Use timeouts for long operations
execute_command:
  command: long-running-task
  timeout: 300000  # 5 minutes
```

---

## Integration with AIOS

### Tool Selection Priority

Per `.claude/rules/mcp-usage.md`:

| Task               | USE THIS               | NOT desktop-commander            |
| ------------------ | ---------------------- | -------------------------------- |
| Read local files   | `Read` tool            | Slower                           |
| Write local files  | `Write` / `Edit` tools | Slower                           |
| Run shell commands | `Bash` tool            | Unless persistent session needed |
| Search files       | `Glob` tool            | Slower                           |
| Search content     | `Grep` tool            | Slower                           |

### When Desktop Commander is Required

1. User explicitly requests persistent session
2. Task requires REPL execution
3. Need to read tail of large files
4. Edit requires fuzzy matching
5. Interactive process with stdin/stdout

### Agent Responsibilities

| Agent              | Desktop Commander Use Case                    |
| ------------------ | --------------------------------------------- |
| **@dev**           | REPL sessions, debugging, live coding         |
| **@devops**        | SSH sessions, server management, log analysis |
| **@data-engineer** | Data analysis REPL, database connections      |
| **@qa**            | Interactive testing, process monitoring       |

---

## Troubleshooting

### Session Not Persisting

```bash
# Check if desktop-commander is running
claude mcp status

# Restart MCP server
claude mcp restart desktop-commander
```

### Fuzzy Edit Not Working

```
# Ensure fuzzy flag is set
edit_block:
  fuzzy: true
  threshold: 0.8  # Adjust similarity threshold
```

### Process Timeout

```
# Increase timeout for long operations
execute_command:
  timeout: 600000  # 10 minutes

# Or use background mode
execute_command:
  background: true
```

### Cannot Connect to Server

```bash
# Check MCP configuration
cat ~/.claude.json | grep -A 10 desktop-commander

# Verify npm package
npm list -g @anthropic/desktop-commander

# Reinstall if needed
npm install -g @anthropic/desktop-commander@latest
```

---

## Related Documentation

- [Docker Gateway Tutorial](./docker-gateway-tutorial.md)
- [MCP Global Setup Guide](../mcp-global-setup.md)
- [Docker MCP Setup](../../docker-mcp-setup.md)
- [MCP Usage Rules](../../../.claude/rules/mcp-usage.md)
- [Agent Tool Integration](../../architecture/agent-tool-integration-guide.md)

---

## Summary

| Feature               | Native Claude Code | Desktop Commander     |
| --------------------- | ------------------ | --------------------- |
| Speed                 | Fast               | Slower (MCP overhead) |
| Persistent Sessions   | No                 | Yes                   |
| In-Memory Execution   | No                 | Yes                   |
| Fuzzy Editing         | No                 | Yes                   |
| Negative Offset       | No                 | Yes                   |
| Interactive Processes | Limited            | Full                  |

**Rule of Thumb:** Use native tools by default. Switch to Desktop Commander only when you need its unique capabilities.

---

_Desktop Commander MCP Guide v1.0.0 - AIOS Framework_
