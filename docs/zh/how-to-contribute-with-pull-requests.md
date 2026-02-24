# 如何通过拉取请求做出贡献

> 🌐 [EN](../how-to-contribute-with-pull-requests.md) | [PT](../pt/how-to-contribute-with-pull-requests.md) | [ES](../es/how-to-contribute-with-pull-requests.md) | **ZH**

---

**GitHub 和拉取请求的新手？** 本指南将逐步引导您了解基础知识。

## 什么是拉取请求？

拉取请求（PR）是您向 GitHub 上的项目建议更改的方式。可以这样想象："这是我想进行的一些更改 - 请审查并考虑将其添加到主项目中。"

## 开始之前

⚠️ **重要**：请保持您的贡献小而精准！我们倾向于许多小的、清晰的更改，而不是一个巨大的更改。

**提交 PR 之前必须做的事情：**

- **对于错误修复**：使用[错误报告模板](https://github.com/SynkraAIinc/@synkra/aios-core/issues/new?template=bug_report.md)创建一个问题
- **对于新功能**：
  1. 在 Discord 的[#general-dev 频道](https://discord.gg/gk8jAdXWmj)中讨论
  2. 使用[功能请求模板](https://github.com/SynkraAIinc/@synkra/aios-core/issues/new?template=feature_request.md)创建一个问题
- **对于大的更改**：始终先开一个问题来讨论对齐

## 分步指南

### 1. Fork 存储库

1. 进入 [Synkra AIOS 存储库](https://github.com/SynkraAIinc/@synkra/aios-core)
2. 单击右上角的"Fork"按钮
3. 这会创建您自己的项目副本

### 2. 克隆您的 Fork

```bash
# 将 YOUR-USERNAME 替换为您的实际 GitHub 用户名
git clone https://github.com/YOUR-USERNAME/@synkra/aios-core.git
cd @synkra/aios-core
```

### 3. 创建新分支

**永远不要直接在 `main` 分支上工作！** 始终为您的更改创建一个新分支：

```bash
# 创建并切换到新分支
git checkout -b fix/typo-in-readme
# 或
git checkout -b feature/add-new-agent
```

**分支命名提示：**

- `fix/描述` - 用于错误修复
- `feature/描述` - 用于新功能
- `docs/描述` - 用于文档更改

### 4. 进行更改

- 编辑要更改的文件
- 保持更改小而专注于一件事
- 如果可能，测试您的更改

### 5. 提交您的更改

```bash
# 添加您的更改
git add .

# 使用清晰的消息进行提交
git commit -m "修复 README.md 中的拼写错误"
```

**良好的提交消息：**

- "修复安装说明中的拼写错误"
- "添加新代理使用示例"
- "更新文档中的断开链接"

**糟糕的提交消息：**

- "stuff"
- "changes"
- "update"

### 6. Push 到您的 Fork

```bash
# Push 您的分支到您的 fork
git push origin fix/typo-in-readme
```

### 7. 创建拉取请求

1. 在 GitHub 上进入您的 fork
2. 您会看到一个绿色的"Compare & pull request"按钮 - 单击它
3. 选择正确的目标分支：
   - **`next` 分支**用于大多数贡献（功能、文档、改进）
   - **`main` 分支**仅用于关键修复
4. 使用 CONTRIBUTING.md 中的模板填写 PR 描述：
   - **是什么**：1-2 句描述更改的内容
   - **为什么**：1-2 句解释原因
   - **如何**：2-3 个关于实现的要点
   - **测试**：您如何测试
5. 参考相关问题编号（例如："修复 #123"）

### 8. 等待审查

- 维护者将审查您的 PR
- 他们可能会要求更改
- 对反馈保持耐心和响应

## 什么使拉取请求变好？

✅ **好的 PR：**

- 一次改变一件事
- 有清晰、描述性的标题
- 在描述中解释是什么和为什么
- 仅包含需要更改的文件

❌ **避免：**

- 更改整个文件的格式
- 在一个 PR 中进行多个不相关的更改
- 在 PR 中复制您的整个项目/存储库
- 没有解释的更改

## 常见错误要避免

1. **不要重新格式化整个文件** - 只改变必要的部分
2. **不要包含不相关的更改** - 每个 PR 专注于一个修复/功能
3. **不要在问题中粘贴代码** - 改为创建适当的 PR
4. **不要提交您的整个项目** - 贡献具体的改进

## 需要帮助？

- 🐛 使用[错误报告模板](https://github.com/SynkraAIinc/@synkra/aios-core/issues/new?template=bug_report.md)报告错误
- 💡 使用[功能请求模板](https://github.com/SynkraAIinc/@synkra/aios-core/issues/new?template=feature_request.md)建议功能
- 📖 阅读完整的[贡献指南](../CONTRIBUTING.md)

## 示例：好 vs 坏 PR

### 好 PR 示例

**标题**："修复指向安装指南的断开链接"
**更改**：一个文件，一行修改
**描述**："README.md 中的链接指向错误的文件。已更新以指向正确的安装指南。"

### 坏 PR 示例

**标题**："更新"
**更改**：50 个文件，整个代码库重新格式化
**描述**："我进行了一些改进"

---

**记住**：我们在这里帮助！不要害怕提问。每位专家都曾经是初学者。
