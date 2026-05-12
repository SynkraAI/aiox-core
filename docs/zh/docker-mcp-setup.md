# Docker MCP 设置指南

> 🌐 [EN](../docker-mcp-setup.md) | **ZH**

---

使用 AIOX 设置基于 Docker 的 MCP（模型上下文协议）服务器的指南。

**版本：** 2.1.0
**最后更新：** 2026-01-28

---

## 前置条件

在设置 Docker MCP 之前，请确保您有：

- **Docker Desktop** 已安装并运行
- **Node.js** 18+ 已安装
- **AIOX** 项目已初始化
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
aiox mcp setup
```

这会创建：

- `~/.aiox/mcp/` - MCP 配置目录
- `~/.aiox/mcp/global-config.json` - 主配置文件
- `~/.aiox/mcp/servers/` - 单个服务器配置
- `~/.aiox/credentials/` - 安全凭证存储

### 步骤 3：添加 MCP 服务器

```bash
# 从模板添加服务器
aiox mcp add context7
aiox mcp add exa
aiox mcp add github
```

---

## 配置

### MCP 架构

AIOX 使用 Docker MCP 工具包作为主要 MCP 基础设施。

### 可用的 MCP

#### Context7（文档查询）

```bash
# 添加 Context7
aiox mcp add context7
```

**用于：**
- 库文档查询
- 包/框架的 API 参考
- 获取依赖项的最新文档

#### EXA（Web 搜索）

```bash
# 添加 EXA
aiox mcp add exa

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
aiox mcp add apify

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
aiox mcp setup

# 强制重新创建（备份现有）
aiox mcp setup --force
```

### 服务器管理

```bash
# 从模板添加服务器
aiox mcp add <server-name>

# 删除服务器
aiox mcp remove <server-name>

# 启用/禁用服务器
aiox mcp enable <server-name>
aiox mcp disable <server-name>
```

### 状态和列表

```bash
# 列出已配置的服务器
aiox mcp list

# 显示详细状态
aiox mcp status

# 同步到项目
aiox mcp sync
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
aiox mcp credential set EXA_API_KEY "your-api-key"

# 获取凭证
aiox mcp credential get EXA_API_KEY

# 列表凭证（已屏蔽）
aiox mcp credential list
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
aiox mcp setup --force

# 清理缓存
rm -rf ~/.aiox/mcp/cache/*

# 验证配置
aiox mcp status --verbose
```

---

## MCP 治理

**重要：** 所有 MCP 基础设施管理由 **DevOps Agent (@devops / Gage)** 专门处理。

其他代理（Dev、Architect 等）是 MCP **消费者**，而不是管理员。

---

_Synkra AIOX Docker MCP 设置指南 v4.2.11_
