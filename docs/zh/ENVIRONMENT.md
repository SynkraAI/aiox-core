<!-- 翻译：zh-CN 原文：/docs/ENVIRONMENT.md 最后同步：2026-02-22 -->

# 环境变量

> 🌐 [EN](../ENVIRONMENT.md) | [PT](../pt/ENVIRONMENT.md) | [ES](../es/ENVIRONMENT.md) | **ZH**

---

本文档列出了 Synkra AIOS 及其组件使用的所有环境变量。

## 概述

Synkra AIOS 使用环境变量进行配置、API 密钥和敏感信息。**切勿在存储库中提交环境变量。**

## 必需的环境变量

### 框架核心

当前，Synkra AIOS 不需要任何必需的环境变量来进行基本操作。所有配置都通过 `core-config.yaml` 和 Squad 配置文件进行。

## 可选的环境变量

### GitHub 集成

如果您正在使用 GitHub CLI 功能：

```bash
GITHUB_TOKEN=your_github_token_here
```

**注意：** GitHub CLI (`gh`) 会自动管理身份验证。只有在直接使用 GitHub API 时，此变量才是必需的。

### Squads

某些 Squads 可能需要环境变量。请查看每个 Squad 的 README 获取具体要求。

#### ETL Squad

```bash
# 可选：数据源的 API 密钥
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_API_KEY=your_twitter_api_key
# ... 其他服务的 API 密钥
```

#### 私有 Squads

私有 Squads（在 `aios-Squads` 存储库中）可能需要额外的环境变量。请查看每个 Squad 的文档。

## 环境文件配置

### 创建 `.env` 文件

1. 复制示例文件（如果可用）：
   ```bash
   cp .env.example .env
   ```

2. 或在项目根目录创建新的 `.env` 文件：
   ```bash
   touch .env
   ```

3. 添加您的环境变量：
   ```bash
   # .env
   GITHUB_TOKEN=your_token_here
   YOUTUBE_API_KEY=your_key_here
   ```

### 加载环境变量

Synkra AIOS 使用 `dotenv`（如果已安装）加载 `.env`。若依赖 Node.js 原生能力，请明确使用 `--env-file` 或等效方式加载。

**重要：** `.env` 文件在 gitignore 中，永远不会被提交到存储库。

## 安全最佳实践

1. **切勿提交 `.env` 文件** - 它们会被 gitignore 自动忽略
2. **切勿提交 API 密钥或 secrets** - 改用环境变量
3. **为开发和生产使用不同的值** - 创建 `.env.development` 和 `.env.production` 文件
4. **定期轮换 secrets** - 特别是在它们可能被泄露的情况下
5. **使用 secrets 管理工具** - 对于生产部署，考虑使用以下服务：
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - GitHub Secrets (用于 CI/CD)

## CI/CD 的环境变量

对于 GitHub Actions 和其他 CI/CD 管道，使用平台的 secrets 管理：

### GitHub Actions

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  CUSTOM_SECRET: ${{ secrets.CUSTOM_SECRET }}
```

### 其他 CI/CD 平台

请查看您的平台文档获取 secrets 管理：
- **GitLab CI：** 使用 GitLab CI/CD 变量
- **CircleCI：** 使用 CircleCI 环境变量
- **Jenkins：** 使用 Jenkins 凭证

## 故障排除

### 环境变量未加载

1. 检查 `.env` 文件是否存在于项目根目录
2. 检查 `.env` 文件的语法（`=` 周围没有空格）
3. 重启您的开发服务器/进程
4. 检查是否已安装 `dotenv`（如需要）

### 缺少环境变量

如果您看到有关缺少环境变量的错误：
1. 查看本文档了解必需的变量
2. 查看 Squad 文档
3. 检查 `.env` 文件是否包含所有必需的变量
4. 确保 `.env` 文件位于正确位置（项目根目录）

## 贡献

添加新的环境变量时：
1. 在本文档中记录它们
2. 将它们添加到 `.env.example`（如果创建）
3. 更新相关文档
4. 确保 `.env` 在 `.gitignore` 中

---

**最后更新：** 2025-11-12
**Story：** 4.8 - Repository Open-Source Migration
