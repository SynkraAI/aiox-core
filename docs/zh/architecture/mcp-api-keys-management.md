<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/mcp-api-keys-management.md | 同步: 2026-02-22 -->

# MCP API 密钥管理

> 🌐 [EN](../../architecture/mcp-api-keys-management.md) | [PT](../../pt/architecture/mcp-api-keys-management.md) | **ZH** | [ES](../../es/architecture/mcp-api-keys-management.md)

---

**版本:** 1.0.0
**最后更新:** 2026-01-26
**状态:** 官方参考

---

## 概述

本文档描述在 AIOS 中管理 Model Context Protocol (MCP) 服务器使用的 API 密钥的最佳实践。正确的 API 密钥管理对安全和运营完整性至关重要。

---

## AIOS 中的 MCP 架构

AIOS 使用 Docker MCP Toolkit 作为主要的 MCP 基础设施:

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP 架构                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   直接在 Claude Code (~/.claude.json)                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  playwright     → 浏览器自动化                       │   │
│   │  desktop-commander → Docker gateway 操作            │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   在 Docker Desktop 内 (通过 docker-gateway)                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  EXA           → Web 搜索、研究                      │   │
│   │  Context7      → 库文档查询                         │   │
│   │  Apify         → Web 抓取、数据提取                │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 支持的 MCP 服务器

| MCP 服务器 | 需要密钥 | 环境变量 | 位置 |
|-----------|---------|--------|------|
| EXA | 是 | `EXA_API_KEY` | Docker MCP config.yaml |
| Context7 | 否 | N/A | N/A |
| Apify | 是 | `APIFY_API_TOKEN` | Docker MCP docker-mcp.yaml |
| Playwright | 否 | N/A | N/A |

---

## 配置方法

### 方法 1: Docker MCP Toolkit (主要)

Docker MCP Toolkit 通过其配置文件管理 API 密钥。

**对于 EXA (使用 apiKeys 部分):**

位置: `~/.docker/mcp/config.yaml`

```yaml
# ~/.docker/mcp/config.yaml
apiKeys:
  exa: "你的-exa-api-密钥-在这里"
```

**对于需要环境变量的服务器 (Apify 等):**

位置: `~/.docker/mcp/catalogs/docker-mcp.yaml`

```yaml
# ~/.docker/mcp/catalogs/docker-mcp.yaml
apify:
  env:
    - name: APIFY_API_TOKEN
      value: '你的-apify-token-在这里'  # 直接硬编码 (参见已知问题)
```

### 方法 2: 环境变量

用于本地开发或无 Docker 配置:

```bash
# ~/.zshrc 或 ~/.bashrc
export EXA_API_KEY="你的-exa-api-密钥"
export APIFY_API_TOKEN="你的-apify-token"
```

### 方法 3: 项目 .env 文件

用于特定项目配置:

```bash
# .env (添加到 .gitignore!)
EXA_API_KEY=你的-exa-api-密钥
APIFY_API_TOKEN=你的-apify-token
```

---

## AIOS 中的 MCP 治理

**重要:** 所有 MCP 基础设施管理由 **DevOps 代理 (@devops / Gage)** 专门处理。

| 操作 | 代理 | 命令 |
|------|------|------|
| 搜索 MCP 目录 | DevOps | `*search-mcp` |
| 添加 MCP 服务器 | DevOps | `*add-mcp` |
| 列出启用的 MCP | DevOps | `*list-mcps` |
| 移除 MCP 服务器 | DevOps | `*remove-mcp` |
| 配置 Docker MCP | DevOps | `*setup-mcp-docker` |

其他代理 (Dev、Architect 等) 是 MCP **使用者**，不是管理员。

---

## 安全最佳实践

### 要做的事

- 将 API 密钥存储在环境变量或安全配置文件中
- 将 `.env` 文件添加到 `.gitignore`
- 为开发和生产使用不同的 API 密钥
- 定期轮换 API 密钥 (建议每 90 天)
- 在不需要写入访问时使用只读 API 密钥
- 监控 API 使用以检测异常

### 不要做的事

- 在版本控制中提交 API 密钥
- 在聊天或电子邮件中共享 API 密钥
- 在开发中使用生产密钥
- 在共享位置的文本文件中存储密钥
- 在源代码中硬编码密钥

---

## 已知问题

### Docker MCP Secrets Bug (2025 年 12 月)

**问题:** Docker MCP Toolkit 的 secrets 存储和模板插值无法正确工作。通过 `docker mcp secret set` 配置的凭据**不会**传递给容器。

**症状:**
- `docker mcp tools ls` 显示 "(N prompts)" 而不是 "(N tools)"
- MCP 服务器启动但身份验证失败
- 详细输出显示 `-e ENV_VAR` 但没有值

**解决方案:** 直接编辑 `~/.docker/mcp/catalogs/docker-mcp.yaml` 并使用硬编码值:

```yaml
# 而不是使用 secret 引用
apify:
  env:
    - name: APIFY_API_TOKEN
      value: '令牌的实际值'  # 直接硬编码
```

**受影响的 MCP:** 任何需要身份验证的 MCP (Apify、Notion、Slack 等)

**工作的 MCP:** EXA 可用，因为其密钥在 `~/.docker/mcp/config.yaml` 的 `apiKeys` 中

---

## 密钥轮换程序

### 第 1 步: 生成新密钥

1. 登录服务提供商仪表板 (EXA、Apify 等)
2. 生成新的 API 密钥
3. 安全地记录新密钥

### 第 2 步: 更新配置

```bash
# 更新 Docker MCP 配置
vim ~/.docker/mcp/config.yaml

# 或用于基于环境变量的 MCP
vim ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### 第 3 步: 验证新密钥

```bash
# 重启 Docker MCP (如果使用 Docker Desktop MCP)
# 或重启 Claude Code 以重新加载配置

# 使用 @devops 测试连接
@devops *list-mcps
```

### 第 4 步: 撤销旧密钥

1. 返回服务提供商仪表板
2. 撤销/删除旧的 API 密钥
3. 验证旧密钥不再工作

---

## 故障排除

### 错误 "身份验证失败"

1. 验证 API 密钥正确 (无多余空格)
2. 验证密钥未过期
3. 验证密钥拥有必需的权限
4. 验证使用限制未被超出

### 密钥未被读取

1. 重启 Claude Code 或您的 IDE
2. 验证配置文件语法 (YAML)
3. 验证文件权限
4. 对于 Docker MCP，验证 Docker Desktop 正在运行

### MCP 工具显示 "prompts" 而不是 "tools"

这表示存在 secrets bug。使用 docker-mcp.yaml 中的硬编码解决方案。

---

## API 密钥来源

| 服务 | 获取 API 密钥 | 文档 |
|------|--------------|------|
| EXA | [dashboard.exa.ai](https://dashboard.exa.ai) | [docs.exa.ai](https://docs.exa.ai) |
| Apify | [console.apify.com](https://console.apify.com) | [docs.apify.com](https://docs.apify.com) |

---

## 相关文档

- [MCP 使用规则](../../../.claude/rules/mcp-usage.md) - 完整的 MCP 治理规则
- [高级架构](./high-level-architecture.md)

---

**维护者:** @devops (Gage)
