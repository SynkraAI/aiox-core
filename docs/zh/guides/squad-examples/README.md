# Squad 示例

> **EN** | [PT](../../pt/guides/squad-examples/README.md) | [ES](../../es/guides/squad-examples/README.md) | **ZH**

---

此目录包含示例 Squad 配置，帮助你快速开始。

## 可用示例

### 1. 简单代理 (`simple-agent.yaml`)

一个专注于文档任务的最小代理示例。非常适合：
- 理解代理结构
- 学习命令定义
- 基本系统提示模式

### 2. 数据处理 Squad (`data-processor-squad.yaml`)

一个完整的 squad 清单，展示：
- 多个代理协作
- 具有依赖关系的任务定义
- 工作流编排
- 外部 npm 依赖
- 配置选项

## 使用这些示例

### 复制并自定义

```bash
# 复制一个示例以开始你的 squad
cp docs/guides/squad-examples/simple-agent.yaml my-squad/agents/my-agent.yaml

# 编辑以满足你的需求
code my-squad/agents/my-agent.yaml
```

### 通过阅读学习

每个示例都包含注释，解释：
- 为什么使用某些模式
- 正在演示的最佳实践
- 常见定制点

## 创建你自己的

1. 从 [Squad 模板](../../../templates/squad/) 开始
2. 参考这些示例以了解模式
3. 按照 [Squads 指南](../squads-guide.md) 进行

## 贡献示例

有有用的 squad 模式吗？我们欢迎贡献！

1. 在此目录中创建你的示例
2. 添加清晰的注释解释该模式
3. 使用描述更新此 README
4. 按照 [CONTRIBUTING.md](../../../CONTRIBUTING.md) 提交 PR

---

*AIOS Squads：与你一起工作的 AI 代理团队*
