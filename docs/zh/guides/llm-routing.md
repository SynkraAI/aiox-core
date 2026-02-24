# LLM 路由指南

> [EN](../../guides/llm-routing.md) | [PT](../../pt/guides/llm-routing.md) | [ES](../../es/guides/llm-routing.md) | **ZH**

---

**版本:** 1.0.0
**更新:** 2025-12-14

Claude Code 的成本效益 LLM 路由。在保持完整功能的同时节省高达 99% 的 API 成本。

---

## 概述

LLM 路由为不同用例提供两个命令:

| 命令          | 提供者            | 成本           | 用例                   |
| ------------- | ----------------- | -------------- | ---------------------- |
| `claude-max`  | Claude Max (OAuth) | 订阅           | 高级体验，复杂任务      |
| `claude-free` | DeepSeek          | ~$0.14/M tokens | 开发，测试，简单任务    |

---

## 快速开始

### 安装

**选项 1: 如果您已克隆 aios-core**
```bash
# 从 aios-core 目录
node .aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

**选项 2: 全新安装**
```bash
# 克隆仓库
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core

# 运行安装程序
node .aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

### 设置 DeepSeek API 密钥

1. 在此获取 API 密钥: <https://platform.deepseek.com/api_keys>
2. 添加到项目的 `.env` 文件:

```bash
DEEPSEEK_API_KEY=sk-your-key-here
```

### 使用

```bash
# 高级 Claude 体验 (使用您的 Claude Max 订阅)
claude-max

# 成本效益开发 (使用 DeepSeek ~$0.14/M tokens)
claude-free
```

---

## 命令

### claude-max

通过 OAuth 使用您的 Claude Max 订阅 (claude.ai 登录)。

**功能:**
- 完整 Claude 能力
- 无需 API 密钥
- 使用现有 Claude 登录
- 最适合复杂推理任务

**使用:**
```bash
claude-max
```

**何时使用:**
- 复杂代码分析
- 架构决策
- 需要高准确性的任务
- 生产关键工作

---

### claude-free

使用 DeepSeek API 和 Anthropic 兼容端点。

**功能:**
- 工具调用支持 ✅
- 流式传输支持 ✅
- ~99% 成本降低
- 项目 `.env` 文件支持

**使用:**
```bash
claude-free
```

**何时使用:**
- 开发和测试
- 简单代码任务
- 学习和实验
- 高量操作

---

## 成本比较

| 提供者       | 输入 Tokens   | 输出 Tokens   | 每月 (1M tokens) |
| ------------ | ------------- | ------------- | ---------------- |
| Claude API   | $15.00/M      | $75.00/M      | $90.00           |
| Claude Max   | 包含          | 包含          | $20/月           |
| **DeepSeek** | **$0.07/M**   | **$0.14/M**   | **$0.21**        |

**使用 DeepSeek 的节省:** 与 Claude API 相比高达 99.7%

---

## 配置

### API 密钥来源

`claude-free` 按此顺序查找 DeepSeek API 密钥:

1. **项目 `.env` 文件** (推荐)
   ```bash
   # 项目根目录的 .env
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

2. **环境变量**
   ```bash
   # Windows
   setx DEEPSEEK_API_KEY "sk-your-key-here"

   # Unix (添加到 ~/.bashrc 或 ~/.zshrc)
   export DEEPSEEK_API_KEY="sk-your-key-here"
   ```

### 安装位置

| 操作系统      | 安装目录                      |
| ------------- | ----------------------------- |
| Windows       | `%APPDATA%\npm\`              |
| macOS/Linux   | `/usr/local/bin/` 或 `~/bin/` |

---

## 工作原理

### claude-max
1. 清除所有替代提供者设置
2. 使用 Claude 的默认 OAuth 认证
3. 使用您的 Max 订阅启动 Claude Code

### claude-free
1. 搜索 `.env` 文件 (当前目录 → 父目录)
2. 从 `.env` 或环境加载 `DEEPSEEK_API_KEY`
3. 设置 DeepSeek 的 Anthropic 兼容端点
4. 使用 DeepSeek 后端启动 Claude Code

**DeepSeek 端点:**
```text
https://api.deepseek.com/anthropic
```

此端点提供:
- Anthropic API 兼容性
- 工具/函数调用支持
- 流式响应

### 安全说明: 权限绕过

`claude-max` 和 `claude-free` 命令默认使用 `--dangerously-skip-permissions` 标志。这:

- **跳过确认提示** 用于文件操作、命令执行等
- **应仅在受信任的仓库/环境中使用**
- **不推荐用于不受信任的代码库**

每次运行这些命令时会显示警告。如果您更喜欢交互式确认，请直接运行 `claude` 而不是使用路由命令。

---

## 故障排除

### 命令未找到

**Windows:**
```powershell
# 检查 npm 全局是否在 PATH 中
echo $env:PATH | Select-String "npm"

# 如果没有，添加它:
$env:PATH += ";$env:APPDATA\npm"
```

**Unix:**
```bash
# 检查 PATH
echo $PATH | grep -E "(local/bin|~/bin)"

# 如果 ~/bin 不在 PATH 中，添加到 ~/.bashrc:
export PATH="$HOME/bin:$PATH"
```

### DEEPSEEK_API_KEY 未找到

1. 验证 `.env` 文件存在于项目根目录
2. 检查密钥格式: `DEEPSEEK_API_KEY=sk-...`
3. `=` 周围没有空格
4. 值周围不需要引号

### API 错误

| 错误               | 原因             | 解决方案                      |
| ------------------ | ---------------- | ----------------------------- |
| 401 Unauthorized   | 无效 API 密钥    | 在 DeepSeek 仪表盘验证密钥     |
| 429 Rate Limited   | 请求太多         | 等待并重试                     |
| Connection refused | 网络问题         | 检查互联网连接                 |

### 工具调用不工作

DeepSeek 的 `/anthropic` 端点支持工具调用。如果工具不工作:
1. 验证端点是 `https://api.deepseek.com/anthropic`
2. 检查 API 密钥有足够额度
3. 先尝试不带工具的简单测试

---

## 高级配置

### 自定义模型

如果需要不同模型，编辑模板文件:

**Windows:** `.aios-core/infrastructure/scripts/llm-routing/templates/claude-free.cmd`
**Unix:** `.aios-core/infrastructure/scripts/llm-routing/templates/claude-free.sh`

更改:
```bash
export ANTHROPIC_MODEL="deepseek-chat"
```

### 环境变量

| 变量                 | 描述          | 默认值                                |
| -------------------- | ------------- | ------------------------------------- |
| `ANTHROPIC_BASE_URL` | API 端点      | `https://api.deepseek.com/anthropic`  |
| `ANTHROPIC_API_KEY`  | API 密钥      | 来自 DEEPSEEK_API_KEY                  |
| `ANTHROPIC_MODEL`    | 模型名称      | `deepseek-chat`                       |
| `API_TIMEOUT_MS`     | 请求超时      | `600000` (10 分钟)                    |

---

## 卸载

### Windows
```powershell
Remove-Item "$env:APPDATA\npm\claude-free.cmd"
Remove-Item "$env:APPDATA\npm\claude-max.cmd"
```

### Unix
```bash
rm /usr/local/bin/claude-free
rm /usr/local/bin/claude-max
# 或如果安装在 ~/bin:
rm ~/bin/claude-free
rm ~/bin/claude-max
```

---

## 相关资源

- **工具定义:** `.aios-core/infrastructure/tools/cli/llm-routing.yaml`
- **安装脚本:** `.aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js`
- **任务定义:** `.aios-core/development/tasks/setup-llm-routing.md`
- **DeepSeek API:** <https://platform.deepseek.com/api_keys>

---

## 常见问题

**Q: DeepSeek 和 Claude 一样好吗?**
A: DeepSeek 对大多数编码任务表现出色，但在复杂问题上可能不及 Claude 的推理能力。重要工作使用 `claude-max`。

**Q: 我可以在同一会话中使用两个命令吗?**
A: 可以! 每个命令设置自己的环境。您可以在它们之间切换。

**Q: claude-free 可以离线工作吗?**
A: 不能，它需要互联网访问来连接 DeepSeek 的 API。

**Q: 我的 API 密钥安全吗?**
A: 密钥从 `.env` 文件 (不要提交!) 或环境变量加载。永远不要硬编码密钥。

---

*由 AIOS Framework 生成 - Story 6.7*
