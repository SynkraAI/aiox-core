# Docker MCP 设置指南

> 🌐 [EN](../docker-mcp-setup.md) | **ZH**

---

使用 AIOS 设置基于 Docker 的 MCP（模型上下文协议）服务器的指南。

**版本：** 2.1.0
**最后更新：** 2026-01-28

---

## 前置条件

在设置 Docker MCP 之前，请确保您有：

- **Docker Desktop** 已安装并运行
- **Node.js** 18+ 已安装
- **AIOS** 项目已初始化
- 所需 MCP 服务的 API 密钥（EXA、Apify 等）

---

## 安装

### 步骤 1：安装 Docker MCP 工具包

```bash
# 安装 Docker MCP 工具包
docker mcp install

# 验证安装
docker mcp --version
```

### 步骤 2：初始化 MCP 配置

```bash
# 创建全局 MCP 结构
aios mcp setup
```

这会创建：

- `~/.aios/mcp/` - MCP 配置目录
- `~/.aios/mcp/global-config.json` - 主配置文件
- `~/.aios/mcp/servers/` - 单个服务器配置
- `~/.aios/credentials/` - 安全凭证存储

### 步骤 3：添加 MCP 服务器

```bash
# 从模板添加服务器
aios mcp add context7
aios mcp add exa
aios mcp add github
```

---

## 配置

### MCP 架构

AIOS 使用 Docker MCP 工具包作为主要 MCP 基础设施。

### 可用的 MCP

#### Context7（文档查询）

```bash
# 添加 Context7
aios mcp add context7
```

**用于：**
- 库文档查询
- 包/框架的 API 参考
- 获取依赖项的最新文档

#### EXA（Web 搜索）

```bash
# 添加 EXA
aios mcp add exa

# 设置 API 密钥
export EXA_API_KEY="your-api-key"
```

**用于：**
- 搜索最新信息
- 研究和文档查询
- 公司和竞争对手研究
- 在线查找代码示例

#### Apify（Web 抓取）

```bash
# 添加 Apify
aios mcp add apify

# 设置 API 令牌
export APIFY_TOKEN="your-token"
```

**用于：**
- Web 抓取社交媒体（Instagram、TikTok、LinkedIn）
- 从电子商务网站提取数据
- 从任何网站进行自动数据收集

---

## CLI 命令

### 设置命令

```bash
# 初始化全局 MCP 配置
aios mcp setup

# 强制重新创建（备份现有）
aios mcp setup --force
```

### 服务器管理

```bash
# 从模板添加服务器
aios mcp add <server-name>

# 删除服务器
aios mcp remove <server-name>

# 启用/禁用服务器
aios mcp enable <server-name>
aios mcp disable <server-name>
```

### 状态和列表

```bash
# 列出已配置的服务器
aios mcp list

# 显示详细状态
aios mcp status

# 同步到项目
aios mcp sync
```

---

## 环境变量

### 设置变量

**macOS/Linux：**

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

**Windows (PowerShell)：**

```powershell
$env:EXA_API_KEY = "your-api-key"
$env:GITHUB_TOKEN = "your-github-token"
$env:APIFY_TOKEN = "your-apify-token"
```

### 安全凭证存储

```bash
# 添加凭证
aios mcp credential set EXA_API_KEY "your-api-key"

# 获取凭证
aios mcp credential get EXA_API_KEY

# 列表凭证（已屏蔽）
aios mcp credential list
```

---

## 故障排除

### 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 权限被拒绝 | 以管理员身份运行终端（Windows）或使用 sudo |
| 服务器未启动 | 检查命令和参数，验证包已安装 |
| 未找到环境变量 | 设置变量或使用凭证存储 |
| 超时错误 | 增加配置中的超时 |
| 连接被拒绝 | 检查 URL 和网络访问 |

### 常见修复

```bash
# 重置全局配置
aios mcp setup --force

# 清理缓存
rm -rf ~/.aios/mcp/cache/*

# 验证配置
aios mcp status --verbose
```

---

## MCP 治理

**重要：** 所有 MCP 基础设施管理由 **DevOps Agent (@devops / Gage)** 专门处理。

其他代理（Dev、Architect 等）是 MCP **消费者**，而不是管理员。

---

_Synkra AIOS Docker MCP 设置指南 v4.2.11_
