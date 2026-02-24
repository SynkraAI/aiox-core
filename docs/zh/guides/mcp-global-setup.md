# AIOS MCP全局设置指南

> **EN** | **ZH-CN** | [PT](../pt/guides/mcp-global-setup.md) | [ES](../es/guides/mcp-global-setup.md)

---

> 为Synkra AIOS配置全局MCP（模型上下文协议）服务器。

**版本:** 2.1.1
**最后更新:** 2025-12-23

---

## 概述

MCP全局系统允许你配置一次MCP服务器并在所有AIOS项目之间共享。这消除了在每个项目中配置相同服务器的需要。

### 好处

| 好处                   | 描述                             |
| ---------------------- | -------------------------------- |
| **单一配置**  | 配置一次，到处使用  |
| **一致设置**   | 所有项目间相同的服务器配置 |
| **凭据管理** | 安全的集中凭据存储  |
| **轻松更新**          | 在一处更新服务器版本     |

### 全局目录结构

```
~/.aios/
├── mcp/
│   ├── global-config.json    # 主配置文件
│   ├── servers/              # 个别服务器配置
│   │   ├── context7.json
│   │   ├── exa.json
│   │   └── github.json
│   └── cache/                # 服务器响应缓存
└── credentials/              # 安全凭据存储
    └── .gitignore            # 防止意外提交
```

### 推荐的架构

基于生产配置，推荐的MCP设置使用两层：

```
┌─────────────────────────────────────────────────────────────┐
│                    ~/.claude.json                            │
│                   (用户MCP - 直接)                       │
├─────────────────────────────────────────────────────────────┤
│  desktop-commander  │ 持久会话, REPL, 模糊编辑 │
│  docker-gateway     │ 容器化MCP的网关        │
│  playwright         │ 浏览器自动化                    │
│  n8n-mcp           │ 工作流自动化 (可选)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              docker-gateway (58+ 工具)                      │
│            (Docker内的MCP - 无令牌成本)              │
├─────────────────────────────────────────────────────────────┤
│  Apify        │ 网络爬虫, 社交媒体提取       │
│  Context7     │ 库文档查询                │
│  EXA          │ 网络搜索和研究                     │
│  + 其他     │ 任何在容器中运行的MCP             │
└─────────────────────────────────────────────────────────────┘
```

**为什么这个架构?**

| MCP位置                 | 令牌成本        | 用例                                     |
| ----------------------- | --------------- | ---------------------------------------- |
| **直接在 ~/.claude.json** | 正常            | 需要主机访问的MCP（文件、终端） |
| **在 docker-gateway内**    | **无额外成本** | 不需要主机访问的MCP（API、网络） |

在docker-gateway内运行的MCP被封装在容器中，因此它们的工具定义不会对Claude对话上下文造成开销。

---

## 平台特定路径

### Windows

```
C:\Users\<username>\.aios\mcp\global-config.json
C:\Users\<username>\.aios\mcp\servers\
C:\Users\<username>\.aios\credentials\
```

### macOS

```
/Users/<username>/.aios/mcp/global-config.json
/Users/<username>/.aios/mcp/servers/
/Users/<username>/.aios/credentials/
```

### Linux

```
/home/<username>/.aios/mcp/global-config.json
/home/<username>/.aios/mcp/servers/
/home/<username>/.aios/credentials/
```

---

## 初始设置

### 第1步：创建全局结构

```bash
# 创建全局目录和配置
aios mcp setup
```

**这会创建:**

- `~/.aios/` - 全局AIOS目录
- `~/.aios/mcp/` - MCP配置目录
- `~/.aios/mcp/global-config.json` - 主配置文件
- `~/.aios/mcp/servers/` - 个别服务器配置
- `~/.aios/mcp/cache/` - 响应缓存
- `~/.aios/credentials/` - 安全凭据存储

### 第2步：验证设置

```bash
# 检查全局配置存在
aios mcp status
```

**预期输出:**

```
MCP全局配置
========================

位置: ~/.aios/mcp/global-config.json
状态:   ✓ 已配置

服务器: 0个已配置
缓存:   为空

运行 'aios mcp add <server>' 来添加服务器。
```

---

## 添加MCP服务器

### 使用模板

AIOS包含流行MCP服务器的模板：

```bash
# 从模板添加
aios mcp add context7
aios mcp add exa
aios mcp add github
aios mcp add puppeteer
aios mcp add filesystem
aios mcp add memory
aios mcp add desktop-commander
```

### 可用模板

| 模板            | 类型    | 描述                   |
| --------------- | ------- | ---------------------- |
| `context7`      | SSE     | 库文档查询 |
| `exa`           | 命令 | 高级网络搜索           |
| `github`        | 命令 | GitHub API集成        |
| `puppeteer`     | 命令 | 浏览器自动化            |
| `filesystem`    | 命令 | 文件系统访问            |
| `memory`        | 命令 | 临时内存存储      |
| `desktop-commander` | 命令 | 桌面自动化            |

### 自定义服务器配置

```bash
# 使用JSON配置添加自定义服务器
aios mcp add my-server --config='{"command":"npx","args":["-y","my-mcp-server"]}'

# 从配置文件添加
aios mcp add my-server --config-file=./my-server-config.json
```

---

## CLI命令

### `aios mcp setup`

初始化全局MCP配置。

```bash
# 创建全局结构
aios mcp setup

# 强制重新创建（备份现有）
aios mcp setup --force

# 指定自定义位置
aios mcp setup --path=/custom/path
```

### `aios mcp add`

添加新的MCP服务器。

```bash
# 从模板添加
aios mcp add context7

# 使用自定义配置添加
aios mcp add custom-server --config='{"command":"npx","args":["-y","package"]}'

# 使用环境变量添加
aios mcp add exa --env='EXA_API_KEY=your-key'
```

### `aios mcp remove`

移除MCP服务器。

```bash
# 移除服务器
aios mcp remove context7

# 移除时跳过确认
aios mcp remove context7 --yes
```

### `aios mcp list`

列出配置的服务器。

```bash
# 列出所有服务器
aios mcp list

# 列出详细信息
aios mcp list --verbose

# 仅列出已启用的
aios mcp list --enabled
```

**输出:**

```
配置的MCP服务器
======================

  context7     [enabled]  SSE  https://mcp.context7.com/sse
  exa          [enabled]  CMD  npx -y exa-mcp-server
  github       [disabled] CMD  npx -y @modelcontextprotocol/server-github

总计: 3个服务器 (2个已启用, 1个已禁用)
```

### `aios mcp enable/disable`

启用或禁用服务器。

```bash
# 禁用服务器
aios mcp disable github

# 启用服务器
aios mcp enable github

# 切换
aios mcp toggle github
```

### `aios mcp status`

显示全局MCP状态。

```bash
# 完整状态
aios mcp status

# JSON输出
aios mcp status --json
```

### `aios mcp sync`

将全局配置同步到项目。

```bash
# 同步到当前项目
aios mcp sync

# 仅同步特定服务器
aios mcp sync --servers=context7,exa
```

---

## 配置文件

### global-config.json

所有服务器定义的主配置文件。

```json
{
  "version": "1.0",
  "servers": {
    "context7": {
      "type": "sse",
      "url": "https://mcp.context7.com/sse",
      "enabled": true
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "enabled": true
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      },
      "enabled": true
    }
  },
  "defaults": {
    "timeout": 30000,
    "retries": 3
  }
}
```

### 个别服务器文件

每个服务器在 `servers/` 中也有其自己的配置文件：

```json
// ~/.aios/mcp/servers/context7.json
{
  "type": "sse",
  "url": "https://mcp.context7.com/sse",
  "enabled": true
}
```

---

## 服务器类型

### SSE (Server-Sent Events)

对于提供流HTTP端点的服务器。

```json
{
  "type": "sse",
  "url": "https://mcp.server.com/sse",
  "enabled": true
}
```

### 命令

对于作为本地进程运行的服务器。

```json
{
  "command": "npx",
  "args": ["-y", "@package/mcp-server"],
  "env": {
    "API_KEY": "${API_KEY}"
  },
  "enabled": true
}
```

### Windows命令包装器

对于Windows，对NPX使用CMD包装器：

```json
{
  "command": "cmd",
  "args": ["/c", "npx-wrapper.cmd", "-y", "@package/mcp-server"],
  "env": {
    "API_KEY": "${API_KEY}"
  },
  "enabled": true
}
```

---

## 环境变量

### 在配置中使用变量

使用 `${VAR_NAME}` 语法引用环境变量：

```json
{
  "env": {
    "API_KEY": "${MY_API_KEY}",
    "TOKEN": "${MY_TOKEN}"
  }
}
```

### 设置变量

**Windows (PowerShell):**

```powershell
$env:EXA_API_KEY = "your-api-key"
$env:GITHUB_TOKEN = "your-github-token"
```

**Windows (CMD):**

```cmd
set EXA_API_KEY=your-api-key
set GITHUB_TOKEN=your-github-token
```

**macOS/Linux:**

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
```

### 持久变量

**Windows:** 添加到系统环境变量

**macOS/Linux:** 添加到 `~/.bashrc`, `~/.zshrc`, 或 `~/.profile`：

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
```

---

## 凭据管理

### 安全存储

凭据存储在 `~/.aios/credentials/` 中，包含 `.gitignore` 以防止意外提交。

```bash
# 添加凭据
aios mcp credential set EXA_API_KEY "your-api-key"

# 获取凭据
aios mcp credential get EXA_API_KEY

# 列出凭据（已掩盖）
aios mcp credential list
```

### 凭据文件格式

```json
// ~/.aios/credentials/api-keys.json
{
  "EXA_API_KEY": "encrypted-value",
  "GITHUB_TOKEN": "encrypted-value"
}
```

---

## 编程式使用

### JavaScript API

```javascript
const {
  globalDirExists,
  globalConfigExists,
  createGlobalStructure,
  readGlobalConfig,
  addServer,
  removeServer,
  listServers,
} = require('./.aios-core/core/mcp/global-config-manager');

// 检查设置是否存在
if (!globalDirExists()) {
  createGlobalStructure();
}

// 添加服务器
addServer('my-server', {
  command: 'npx',
  args: ['-y', 'my-mcp-server'],
  enabled: true,
});

// 列出服务器
const { servers, total, enabled } = listServers();
console.log(`${enabled}/${total} servers enabled`);

// 移除服务器
removeServer('my-server');
```

### OS检测

```javascript
const {
  detectOS,
  isWindows,
  isMacOS,
  isLinux,
  getGlobalMcpDir,
  getGlobalConfigPath,
} = require('./.aios-core/core/mcp/os-detector');

// 获取OS类型
console.log(detectOS()); // 'windows' | 'macos' | 'linux'

// 获取路径
console.log(getGlobalMcpDir()); // ~/.aios/mcp/
console.log(getGlobalConfigPath()); // ~/.aios/mcp/global-config.json
```

---

## 故障排除

### 设置问题

| 问题 | 解决方案 |
| --- | --- |
| 权限被拒绝 | 以管理员身份运行终端 (Windows) 或使用sudo (macOS/Linux) |
| 目录存在 | 使用 `aios mcp setup --force` 来重新创建 |
| 未找到路径 | 确保主目录存在 |

### 服务器问题

| 问题 | 解决方案 |
| --- | --- |
| 服务器未启动 | 检查命令和参数，验证包已安装 |
| 未找到环境变量 | 设置变量或使用凭据存储 |
| 超时错误 | 增加配置中的超时 |
| 连接被拒绝 | 检查URL和网络访问 |

### Windows特定问题

| 问题 | 解决方案 |
| --- | --- |
| 未找到NPX | 将Node.js添加到PATH，使用CMD包装器 |
| 符号链接错误 | 启用开发者模式或使用连接点 |
| 路径太长 | 在注册表中启用长路径 |

### 常见修复

```bash
# 重置全局配置
aios mcp setup --force

# 清除缓存
rm -rf ~/.aios/mcp/cache/*

# 验证配置
aios mcp status --verbose

# 手动测试服务器
npx -y @modelcontextprotocol/server-github
```

### Docker MCP工具包问题

| 问题 | 解决方案 |
| --- | --- |
| 秘密未传递给容器 | 直接编辑目录文件（见下文） |
| 模板插值失败 | 在目录中使用硬编码值 |
| 工具显示为"(N prompts)" | 令牌未被传递 - 应用解决方案 |

#### Docker MCP秘密错误 (2025年12月)

**问题:** Docker MCP工具包的秘密存储 (`docker mcp secret set`) 和模板插值 (`{{...}}`) 不正常工作。凭据未传递给容器。

**症状:**

- `docker mcp tools ls` 显示"(N prompts)"而不是"(N tools)"
- MCP服务器启动但认证失败
- 详细输出显示 `-e ENV_VAR` 没有值

**解决方案:** 直接编辑 `~/.docker/mcp/catalogs/docker-mcp.yaml`：

```yaml
{ mcp-name }:
  env:
    - name: API_TOKEN
      value: 'actual-token-value-here'
```

**示例 - Apify:**

```yaml
apify-mcp-server:
  env:
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
```

**注意:** 这在本地文件中暴露凭据。保护文件权限并永远不提交此文件。

---

## 与IDE集成

### Claude Desktop

添加到Claude Desktop设置：

```json
{
  "mcpServers": {
    "aios-global": {
      "command": "aios",
      "args": ["mcp", "serve", "--global"]
    }
  }
}
```

### VS Code

在 `.vscode/settings.json` 中配置：

```json
{
  "aios.mcp.useGlobal": true,
  "aios.mcp.globalPath": "~/.aios/mcp/global-config.json"
}
```

### 项目特定覆盖

在项目根目录中创建 `.mcp.json` 来覆盖全局设置：

```json
{
  "inherit": "global",
  "servers": {
    "context7": {
      "enabled": false
    },
    "project-specific": {
      "command": "node",
      "args": ["./local-mcp-server.js"]
    }
  }
}
```

---

## 最佳实践

1. **使用模板** 对于常见服务器
2. **安全存储凭据** 在凭据目录中
3. **禁用未使用的服务器** 以减少资源使用
4. **保持服务器更新** 与最新包版本
5. **使用项目覆盖** 对于项目特定需求
6. **备份配置** 在重大更改前

---

## 相关文档

- [Docker网关教程](./mcp/docker-gateway-tutorial.md)
- [Desktop Commander MCP指南](./mcp/desktop-commander.md)
- [Docker MCP设置](../docker-mcp-setup.md)
- [模块系统架构](../architecture/module-system.md)
- [MCP架构图](../architecture/mcp-system-diagrams.md)

---

_Synkra AIOS v4 MCP全局设置指南_
