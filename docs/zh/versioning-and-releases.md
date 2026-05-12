# 如何发布新版本

> 🌐 [EN](../versioning-and-releases.md) | [PT](../pt/versioning-and-releases.md) | [ES](../es/versioning-and-releases.md)

---

## 自动化发布（推荐）

发布新版本的最简单方法是通过**自动语义发布**。只需使用正确的消息格式进行提交并推送，其他一切都会自动发生。

### 提交消息格式

使用这些前缀来控制发生什么类型的发布：

```bash
fix: resolve CLI argument parsing bug      # → 补丁发布 (4.1.0 → 4.1.1)
feat: add new agent orchestration mode     # → 次要发布 (4.1.0 → 4.2.0)
feat!: redesign CLI interface              # → 主要发布 (4.1.0 → 5.0.0)
```

### 自动发生的事情

当您推送带有 `fix:` 或 `feat:` 的提交时，GitHub Actions 将：

1. ✅ 分析您的提交消息
2. ✅ 在 `package.json` 中增加版本
3. ✅ 生成更改日志
4. ✅ 创建 git 标签
5. ✅ **自动发布到 NPM**
6. ✅ 使用发行说明创建 GitHub 发布

### 您的简单工作流

```bash
# 进行更改
git add .
git commit -m "feat: add team collaboration mode"
git push

# 就这样！发布会自动发生
# 用户现在可以运行：npx @synkra/aiox-core（并获得新版本）
```

### 不触发发布的提交

这些提交类型不会创建发布（将其用于维护）：

```bash
chore: update dependencies     # 无发布
docs: fix typo in readme      # 无发布
style: format code            # 无发布
test: add unit tests          # 无发布
```

### 测试您的设置

```bash
npm run release:test    # 安全在本地运行 - 测试配置
```

---

## 手动发布方法（仅限例外）

如果需要绕过自动系统，仅使用这些方法。

### 快速手动版本增加

```bash
npm run version:patch   # 4.1.0 → 4.1.1 (bug fixes)
npm run version:minor   # 4.1.0 → 4.2.0 (new features)
npm run version:major   # 4.1.0 → 5.0.0 (breaking changes)

# 然后手动发布：
npm publish
git push && git push --tags
```

### 手动 GitHub Actions 触发

如果需要，您也可以通过 GitHub Actions 工作流分派手动触发发布。

---

## 故障排除

### 未触发发布

如果您的合并到 `main` 未触发发布：

1. **检查提交消息** - 仅 `fix:` 和 `feat:` 前缀触发发布
2. **验证 CI 通过** - 如果 lint、typecheck 和 test 通过，发布才会运行
3. **检查工作流日志** - 转到"操作"→"语义发布"以查看详情

### 发布失败

常见问题和解决方案：

| 错误 | 解决方案 |
|------|----------|
| `ENOGHTOKEN` | GITHUB_TOKEN 密钥缺失或过期 |
| `ENOPKGAUTH` | NPM_TOKEN 密钥缺失或无效 |
| `ENOTINHISTORY` | 分支没有正确的历史（使用 `fetch-depth: 0`） |
| `EINVALIDNPMTOKEN` | 重新生成具有发布权限的 NPM 令牌 |

### 跳过发布

要在不触发发布的情况下进行合并，请使用以下其中一种：

```bash
# 方法 1：使用非发布前缀
git commit -m "chore: update dependencies"

# 方法 2：将 [skip ci] 添加到提交消息
git commit -m "feat: new feature [skip ci]"
```

### 强制手动发布

如果自动发布失败，您可以手动发布：

```bash
npm run version:patch   # 或 minor/major
git push && git push --tags
npm publish
```

---

## 配置文件

| 文件 | 目的 |
|------|------|
| `.releaserc.json` | 语义发布配置 |
| `.github/workflows/semantic-release.yml` | GitHub Actions 工作流 |
| `package.json` | 版本源，npm 脚本 |

---

*上次更新：Story 6.17 - 语义发布自动化*
