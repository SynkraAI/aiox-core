# Docker Gateway MCP 教程

> **EN** | [PT](../../pt/guides/mcp/docker-gateway-tutorial.md) | **ZH**

---

Docker Gateway 是一个 MCP 服务器，充当 Claude Code 和多个运行在 Docker 容器内的 MCP 服务器之间的**桥梁**。

**版本：** 1.0.0
**最后更新：** 2026-01-28

---

## 什么是 Docker Gateway?

Docker Gateway 是一个 MCP 服务器，充当 Claude Code 和多个运行在 Docker 容器内的 MCP 服务器之间的**桥梁**。

### 关键优势：无额外 Token 成本

当 MCP 在 docker-gateway 内运行时，它们的工具定义被**封装**在容器中。这意味着：

| 配置                       | Token 成本      | 上下文中的工具定义     |
| -------------------------- | --------------- | ---------------------- |
| 直接在 ~/.claude.json 中   | 每个 MCP 增加   | 是的，所有工具架构可见 |
| 在 docker-gateway 内       | **无额外成本**  | 在容器中封装           |

**原因？** Claude Code 仅看到 docker-gateway 工具（`mcp-add`、`mcp-find` 等），而不是容器内每个 MCP 的单个工具。实际工具通过网关调用。

---

## 前置要求

- **Docker Desktop** 4.37+ 已安装且正在运行
- **Claude Code** CLI 已安装
- 所需 MCP 服务的 API 密钥

---

## 步骤 1：初始化 Docker MCP 工具包

```bash
# 初始化目录系统
docker mcp catalog init

# 验证初始化
docker mcp catalog ls
```

**预期输出：**

```
docker-mcp: Docker MCP Catalog
```

目录包含 313+ 个可用的 MCP 服务器。

---

## 步骤 2：浏览可用服务器

```bash
# 列出所有可用服务器
docker mcp catalog show docker-mcp

# 搜索特定服务器
docker mcp catalog show docker-mcp | grep -i apify
docker mcp catalog show docker-mcp | grep -i exa
```

---

## 步骤 3：启用 MCP 服务器

```bash
# 启用你想要使用的服务器
docker mcp server enable apify-mcp-server
docker mcp server enable exa
docker mcp server enable context7

# 列出已启用的服务器
docker mcp server ls
```

---

## 步骤 4：配置 API 密钥

### 方法 1：使用 Docker MCP 秘密（可能有 bug）

```bash
# 设置秘密
docker mcp secret set APIFY_TOKEN "your-apify-token"
docker mcp secret set EXA_API_KEY "your-exa-api-key"
```

### 方法 2：直接编辑目录文件（推荐的解决方案）

由于已知 bug（2025 年 12 月），秘密可能无法正确传递到容器。

**解决方案：** 直接编辑 `~/.docker/mcp/catalogs/docker-mcp.yaml`：

```yaml
# 找到你的 MCP 条目并添加 env 值
apify-mcp-server:
  env:
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'

exa:
  env:
    - name: EXA_API_KEY
      value: 'your-exa-api-key-here'
```

⚠️ **安全注意：** 这会在本地文件中暴露凭证。设置适当的文件权限：

```bash
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
```

---

## 步骤 5：配置 Claude Code

将 docker-gateway 添加到 `~/.claude.json`：

```json
{
  "mcpServers": {
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

或使用 Claude CLI：

```bash
claude mcp add docker-gateway -s user -- docker mcp gateway run
```

---

## 步骤 6：验证设置

```bash
# 检查通过网关可用的工具
docker mcp tools ls

# 预期输出显示网关工具 + 已启用服务器工具
# 示例：58 个工具（7 个网关 + 来自已启用服务器的 51 个）
```

在 Claude Code 中：

```bash
# 列出 MCP 状态
claude mcp list

# 应该显示：
# docker-gateway: docker mcp gateway run - ✓ Connected
```

---

## 使用 Docker Gateway

### 可用的网关工具

| 工具                | 描述                       |
| ------------------- | -------------------------- |
| `mcp-add`           | 将 MCP 服务器添加到当前会话 |
| `mcp-find`          | 在目录中搜索服务器          |
| `mcp-remove`        | 从会话中删除 MCP 服务器     |
| `mcp-exec`          | 从已启用的服务器执行工具    |
| `mcp-config-set`    | 配置 MCP 服务器设置         |
| `code-mode`         | 创建组合的 JavaScript 工具 |
| `mcp-create-profile` | 保存当前网关状态           |

### 访问已启用服务器的工具

服务器启用后，它们的工具可通过网关访问：

```
# Apify 工具（通过 docker-gateway）
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
mcp__docker-gateway__apify-slash-rag-web-browser

# EXA 工具（通过 docker-gateway）
mcp__docker-gateway__web_search_exa
mcp__docker-gateway__company_research

# Context7 工具（通过 docker-gateway）
mcp__docker-gateway__resolve-library-id
mcp__docker-gateway__query-docs
```

---

## 完整示例配置

### ~/.claude.json

```json
{
  "mcpServers": {
    "desktop-commander": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"]
    },
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    }
  }
}
```

### 结果

```
用户 MCP（4 个服务器）：
├── desktop-commander  ✓ 已连接
├── docker-gateway     ✓ 已连接  (58 个工具在内部)
├── playwright         ✓ 已连接
└── n8n-mcp           ✓ 已连接

在 docker-gateway 内部：
├── apify-mcp-server   (7 个工具)
├── exa                (8 个工具)
├── context7           (2 个工具)
└── + 网关工具         (7 个工具)
```

---

## 故障排除

### 网关无法启动

```bash
# 检查 Docker 是否正在运行
docker info

# 检查网关日志
docker mcp gateway run --verbose
```

### 工具显示为"(N prompts)"而不是"(N tools)"

这表示身份验证失败。使用解决方案：

```bash
# 使用硬编码凭证直接编辑目录
nano ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### 找不到服务器

```bash
# 更新目录
docker mcp catalog update

# 验证服务器是否存在
docker mcp catalog show docker-mcp | grep -i "server-name"
```

### 重置所有内容

```bash
# 禁用所有服务器
docker mcp server reset

# 重置目录
docker mcp catalog reset

# 重新初始化
docker mcp catalog init
```

---

## 最佳实践

### 1. 对基于 API 的 MCP 使用 docker-gateway

将这些放在 docker-gateway 内（不需要主机访问）：

- Apify（网络抓取 API）
- EXA（搜索 API）
- Context7（文档 API）
- 任何云/SaaS 集成

### 2. 保持主机访问 MCP 直接连接

在 ~/.claude.json 中直接保持这些：

- desktop-commander（需要主机文件/终端访问）
- playwright（需要主机浏览器）
- 文件系统 MCP

### 3. 保护你的凭证

```bash
# 设置限制性权限
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
chmod 700 ~/.docker/mcp/

# 从不提交这些文件
echo "~/.docker/mcp/" >> ~/.gitignore_global
```

---

## 相关文档

- [Desktop Commander MCP 指南](./desktop-commander.md)
- [MCP 全局设置指南](../mcp-global-setup.md)
- [Docker MCP 设置](../../docker-mcp-setup.md)

---

_Docker Gateway MCP 教程 v1.0.0 - AIOS 框架_
