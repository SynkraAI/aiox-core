<!-- 翻译: ZH-CN | 原文: /docs/en/architecture/utility-integration-guide.md | 同步: 2026-02-22 -->

# 工具集成指南

> 🌐 [EN](../../architecture/utility-integration-guide.md) | [PT](../../pt/architecture/utility-integration-guide.md) | **ZH** | [ES](../../es/architecture/utility-integration-guide.md)

---

**版本:** 1.0.0
**创建于:** 2025-10-29
**作者:** Sarah (@po)、Winston (@architect)
**目的:** 为在 AIOX 框架中集成工具脚本定义模式

---

## 什么是工具集成?

**定义:** 工具集成是使孤立工具脚本**可发现、文档化和可用**的过程，位于 AIOX 框架内。

工具被认为**完全集成**当:
1. ✅ **已注册** 在 core-config.yaml 中
2. ✅ **被引用** 至少由一个代理或任务
3. ✅ **已文档化** 包含目的和用法
4. ✅ **已测试** 以确保正确加载
5. ✅ **可发现** 通过框架机制

---

## 集成模式

### 模式 1: 代理辅助工具

**何时使用:** 工具提供代理直接使用的辅助函数

**集成步骤:**
1. 将工具添加到目标代理的 `dependencies.utils` 数组
2. 在代理文件中记录工具的目的
3. 在 core-config.yaml 中注册 (如果还未注册)
4. 测试代理是否成功加载工具

**示例: util-batch-creator**

```yaml
# .aiox-core/agents/dev.yaml
id: dev
name: 开发代理
dependencies:
  utils:
    - batch-creator  # 创建相关任务的批次
    - code-quality-improver
```

**修改的文件:**
- `.aiox-core/agents/{agent}.yaml` (添加到 dependencies.utils)
- `.aiox-core/core-config.yaml` (如必要则注册)
- `.aiox-core/utils/README.md` (记录工具)

---

### 模式 2: 任务执行工具

**何时使用:** 工具由任务在执行期间调用

**集成步骤:**
1. 识别或创建使用工具的任务
2. 在任务的 `execution.utils` 部分添加工具引用
3. 记录任务如何使用工具
4. 在 core-config.yaml 中注册 (如必要)
5. 使用工具测试任务执行

**示例: util-commit-message-generator**

```yaml
# .aiox-core/tasks/generate-commit-message.md
id: generate-commit-message
name: 生成提交信息
execution:
  utils:
    - commit-message-generator  # 该任务的主工具
  steps:
    - 分析暂存的更改
    - 使用工具生成语义提交信息
    - 向用户呈现信息以批准
```

**修改的文件:**
- `.aiox-core/tasks/{task}.md` (添加 execution.utils)
- `.aiox-core/agents/{agent}.yaml` (添加任务到 executes 列表)
- `.aiox-core/core-config.yaml` (如必要则注册)
- `.aiox-core/utils/README.md` (记录工具)

---

### 模式 3: 框架基础设施工具

**何时使用:** 工具由框架本身使用，而不是由代理/任务直接使用

**集成步骤:**
1. 在 core-config.yaml 的适当类别中注册
2. 在 utils/README.md 中记录为 "框架工具"
3. 添加到框架文档
4. 测试工具在框架上下文中加载

**示例: util-elicitation-engine**

```yaml
# .aiox-core/core-config.yaml
utils:
  framework:
    - elicitation-engine  # 用于代理创建工作流
    - aiox-validator
```

**修改的文件:**
- `.aiox-core/core-config.yaml` (在框架中注册)
- `.aiox-core/utils/README.md` (记录为框架工具)
- 框架文档 (如适用)

---

### 模式 4: 文档/分析工具

**何时使用:** 工具执行分析或文档生成

**集成步骤:**
1. 添加到相关代理的工具 (通常是 architect、qa 或文档代理)
2. 创建或更新使用工具的任务
3. 记录分析/输出格式
4. 在 core-config.yaml 中注册

**示例: util-documentation-synchronizer**

```yaml
# .aiox-core/agents/architect.yaml
dependencies:
  utils:
    - documentation-synchronizer  # 保持文档与代码同步
    - dependency-analyzer
```

**修改的文件:**
- `.aiox-core/agents/{agent}.yaml`
- `.aiox-core/tasks/{task}.md` (如创建任务)
- `.aiox-core/core-config.yaml`
- `.aiox-core/utils/README.md`

---

## 集成工作流

### 标准流程 (适用于所有模式):

```
1. 分析
   ├─ 检查工具代码以理解目的
   ├─ 识别工具类别 (辅助、执行器、分析器等)
   └─ 确定适当的集成模式

2. 映射
   ├─ 识别应使用工具的目标代理
   ├─ 识别或创建调用工具的任务
   └─ 记录映射决策

3. 集成
   ├─ 将工具引用添加到代理/任务文件
   ├─ 在 core-config.yaml 中注册 (如必要)
   └─ 在 utils/README.md 中记录

4. 测试
   ├─ 加载工具以验证无错误
   ├─ 加载代理以验证依赖解析
   ├─ 如适用则测试任务执行
   └─ 运行间隙检测以验证正确性

5. 文档
   ├─ 在 README 中添加工具描述
   ├─ 记录用法模式
   ├─ 注解使用它的代理/任务
   └─ 更新架构图
```

---

## 工具分类

工具应进行分类以便于集成:

### 类别 1: 代码质量
**目的:** 分析、改进、验证代码
**模式:** 代理辅助工具 (代理 dev、qa)
**示例:** aiox-validator、code-quality-improver、coverage-analyzer

### 类别 2: Git/工作流
**目的:** Git 操作、工作流自动化
**模式:** 任务执行 (代理 dev、github-devops)
**示例:** commit-message-generator、branch-manager、conflict-resolver

### 类别 3: 组件管理
**目的:** 生成、管理、搜索组件
**模式:** 代理辅助工具 + 任务执行
**示例:** component-generator、component-search、deprecation-manager

### 类别 4: 文档
**目的:** 生成、同步、分析文档
**模式:** 文档工具 (代理 architect、docs)
**示例:** documentation-synchronizer、dependency-impact-analyzer

### 类别 5: 批处理/辅助
**目的:** 批量操作、框架辅助
**模式:** 变化 (代理辅助工具或框架)
**示例:** batch-creator、clickup-helpers、elicitation-engine

---

## 测试要求

### 对于每个集成的工具:

**1. 加载测试**
```javascript
// 验证工具加载无错误
const utility = require('.aiox-core/utils/{utility-name}');
// 不应抛出错误
```

**2. 引用验证**
```bash
# 验证代理/任务引用有效
node outputs/architecture-map/schemas/validate-tool-references.js
```

**3. 间隙检测**
```bash
# 验证间隙已解决
node outputs/architecture-map/schemas/detect-gaps.js
# 应显示 0 个工具间隙
```

**4. 集成测试** (如适用)
```javascript
// 验证代理加载工具依赖
const agent = loadAgent('agent-name');
// 应在解析的依赖中包含工具
```

---

## 文档要求

### utils/README.md 中的模板条目:

```markdown
### util-{name}

**目的:** 工具执行功能的简要描述

**由以下使用:**
- agent-{name} (用于 {目的})
- task-{name} (在 {阶段} 期间)

**集成模式:** {模式-名称}

**位置:** `.aiox-core/utils/{name}.js`

**使用示例:**
\`\`\`javascript
const util = require('./utils/{name}');
// 代码示例
\`\`\`
```

---

## core-config.yaml 中的注册

### 将工具添加到适当的部分:

```yaml
utils:
  # 代理辅助工具
  helpers:
    - batch-creator
    - code-quality-improver

  # 任务执行工具
  executors:
    - commit-message-generator
    - component-generator

  # 框架基础设施工具
  framework:
    - elicitation-engine
    - aiox-validator

  # 分析/文档工具
  analyzers:
    - documentation-synchronizer
    - dependency-analyzer
```

---

## 成功标准

工具集成成功时:

✅ **可发现:**
- 在 core-config.yaml 中列出
- 在 utils/README.md 中记录
- 由代理/任务引用

✅ **功能性:**
- 加载无错误
- 代理/任务可使用它
- 测试通过

✅ **已验证:**
- 间隙检测显示 0 个间隙
- 引用验证通过
- 集成测试通过

✅ **已文档化:**
- 目的清晰表述
- 提供使用示例
- 已识别集成模式

---

## 常见陷阱

❌ **不要:** 添加工具到代理而不理解其目的
✅ **要:** 首先检查代码，理解功能

❌ **不要:** 如果现有任务可使用则创建新任务
✅ **要:** 在适当时扩展现有任务

❌ **不要:** 注册而不文档化
✅ **要:** 始终添加 README 条目

❌ **不要:** 跳过测试
✅ **要:** 验证工具加载并解析

---

## 快速参考

| 模式 | 目标 | 修改的文件 | 测试 |
|------|------|----------|------|
| 代理辅助工具 | Agent YAML | agent.yaml、core-config、README | 加载代理 |
| 任务执行 | Task MD + Agent | task.md、agent.yaml、core-config、README | 执行任务 |
| 框架 | 框架 | core-config、README、文档 | 加载工具 |
| 文档 | Architect/Docs | agent.yaml、core-config、README | 间隙检测 |

---

**指南版本:** 1.0.0
**最后更新:** 2025-10-29
**维护者:** Winston (@architect)
