# 上下文问候系统指南

> [EN](../../guides/contextual-greeting-system-guide.md) | [PT](../../pt/guides/contextual-greeting-system-guide.md) | [ES](../../es/guides/contextual-greeting-system-guide.md) | **ZH**

---

**故事:** 6.1.2.5 - 上下文代理加载系统
**状态:** 组件已实现，集成待完成
**日期:** 2025-01-15

---

## 概述

上下文问候系统是一项 UX 改进，使 AIOX 代理的问候变得智能和自适应，根据会话上下文显示相关信息和命令。

## 已实现的内容

### 核心组件 (Story 6.1.2.5)

1. **ContextDetector** (`.aiox-core/core/session/context-detector.js`)
   - 检测会话类型: `new`、`existing` 或 `workflow`
   - 混合方法: 对话历史 (首选) + 会话文件 (后备)
   - 非活动会话 TTL 1 小时

2. **GitConfigDetector** (`.aiox-core/infrastructure/scripts/git-config-detector.js`)
   - 检测项目的 git 配置
   - TTL 5 分钟的缓存
   - 1000ms 超时保护

3. **GreetingBuilder** (`.aiox-core/development/scripts/greeting-builder.js`)
   - 根据会话类型构建上下文问候
   - 按可见性过滤命令 (full/quick/key)
   - 150ms 超时并优雅回退

4. **WorkflowNavigator** (`.aiox-core/development/scripts/workflow-navigator.js`)
   - 检测当前工作流状态
   - 根据状态建议下一个命令
   - 预填充带上下文的命令 (story path, branch)

5. **工作流模式** (`.aiox-core/data/workflow-patterns.yaml`)
   - 定义了 10 个常见工作流
   - 带下一步建议的状态转换
   - 根据实际项目使用验证的模式

### 待完成 (未来故事 - 6.1.4 或 6.1.6)

**与激活流程的集成:**
- 拦截代理激活 (当您输入 `@dev`、`@po` 等时)
- 自动调用 GreetingBuilder
- 在默认问候位置注入上下文问候

## 会话类型

### 1. 新会话

**何时:** 首次交互或 1 小时不活动后

**特点:**
- 完整介绍 (archetypal 问候)
- 代理角色描述
- 项目状态 (如果配置了 git)
- 完整命令 (visibility=full 的最多 12 个命令)

**示例:**
```
💻 Dex (Builder) 准备就绪。让我们构建一些很棒的东西!

**角色:** 专注于干净、可维护代码的全栈开发者

📊 项目状态:
🌿 main
📝 5 个修改的文件
📦 最后提交: feat: implement greeting system

**可用命令:**
   - `*help`: 显示所有可用命令
   - `*develop`: 实现故事任务
   - `*review-code`: 审查代码更改
   - `*run-tests`: 执行测试套件
   - `*build`: 为生产构建
   ... (最多 12 个命令)
```

### 2. 现有会话

**何时:** 在同一会话中继续工作

**特点:**
- 简短介绍 (named 问候)
- 项目状态
- 当前上下文 (上次操作)
- 快速命令 (visibility=quick 的 6-8 个命令)

**示例:**
```
💻 Dex (Builder) 准备就绪。

📊 项目状态:
🌿 feature/story-6.1.2.5
📝 3 个修改的文件

📌 **上次操作:** review-code

**快速命令:**
   - `*help`: 显示帮助
   - `*develop`: 实现故事
   - `*review-code`: 审查代码
   - `*run-tests`: 运行测试
   - `*qa-gate`: 运行质量门禁
   ... (6-8 个最常用的命令)
```

### 3. 工作流会话

**何时:** 在活动工作流中 (例如: 验证故事后)

**特点:**
- 最小介绍 (minimal 问候)
- 压缩的项目状态
- 工作流上下文 (正在处理 X)
- **下一步建议** (新功能!)
- 关键命令 (visibility=key 的 3-5 个命令)

**示例:**
```
⚖️ Pax 准备就绪。

📊 🌿 main | 📝 5 个修改 | 📖 STORY-6.1.2.5

📌 **上下文:** 正在处理 Story 6.1.2.5

**故事已验证! 下一步:**

1. `*develop-yolo story-6.1.2.5.md` - 自主模式 (无中断)
2. `*develop-interactive story-6.1.2.5.md` - 交互模式带检查点
3. `*develop-preflight story-6.1.2.5.md` - 先计划，后执行

**关键命令:**
   - `*help`: 显示帮助
   - `*validate-story-draft`: 验证故事
   - `*backlog-summary`: 快速待办状态
```

## 命令可见性系统

### 命令元数据

每个命令现在有一个 `visibility` 属性，控制何时显示:

```yaml
commands:
  - name: help
    visibility: [full, quick, key]  # 始终可见
    description: "显示所有可用命令"

  - name: develop
    visibility: [full, quick, key]  # 主要命令
    description: "实现故事任务"

  - name: review-code
    visibility: [full, quick]  # 经常使用，但非关键
    description: "审查代码更改"

  - name: build
    visibility: [full]  # 不常用，仅在新会话中
    description: "为生产构建"

  - name: qa-gate
    visibility: [key]  # 在工作流中关键，但不总是需要
    description: "运行质量门禁"
```

### 分类指南

**`full` (12 个命令)** - 新会话
- 所有可用命令
- 展示代理的完整能力
- 适合发现

**`quick` (6-8 个命令)** - 现有会话
- 经常使用的命令
- 专注于生产力
- 移除不常用的命令

**`key` (3-5 个命令)** - 工作流会话
- 当前工作流的关键命令
- 最小干扰
- 最大效率

## 工作流导航

### 定义的工作流

**10 个常见工作流:**

1. **story_development** - 验证 → 开发 → QA → 部署
2. **epic_creation** - 创建史诗 → 创建故事 → 验证
3. **backlog_management** - 审查 → 优先级 → 安排
4. **architecture_review** - 分析 → 文档 → 审查
5. **git_workflow** - 质量门禁 → PR → 合并
6. **database_workflow** - 设计 → 迁移 → 测试
7. **code_quality_workflow** - 评估 → 重构 → 测试
8. **documentation_workflow** - 研究 → 文档 → 同步
9. **ux_workflow** - 设计 → 实现 → 验证
10. **research_workflow** - 头脑风暴 → 分析 → 文档

### 状态转换

每个工作流定义状态之间的转换:
- **Trigger:** 成功完成的命令
- **Greeting Message:** 上下文消息
- **Next Steps:** 带预填充参数的下一个命令建议

**示例 (Story Development):**

```yaml
story_development:
  transitions:
    validated:
      trigger: "validate-story-draft 成功完成"
      greeting_message: "故事已验证! 准备实现。"
      next_steps:
        - command: develop-yolo
          args_template: "${story_path}"
          description: "自主 YOLO 模式 (无中断)"
        - command: develop-interactive
          args_template: "${story_path}"
          description: "交互模式带检查点 (默认)"
        - command: develop-preflight
          args_template: "${story_path}"
          description: "先全部计划，然后执行"
```

## 如何测试

### 选项 1: 自动测试脚本

```bash
node .aiox-core/development/scripts/test-greeting-system.js
```

此脚本测试 4 种场景:
1. 新会话问候 (Dev)
2. 现有会话问候 (Dev)
3. 工作流会话问候 (PO)
4. 简单问候回退

### 选项 2: Node REPL 手动测试

```javascript
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();

// 模拟代理
const mockAgent = {
  name: 'Dex',
  icon: '💻',
  persona_profile: {
    greeting_levels: {
      named: '💻 Dex (Builder) 准备就绪!'
    }
  },
  persona: { role: '开发者' },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'] }
  ]
};

// 测试新会话
builder.buildGreeting(mockAgent, { conversationHistory: [] })
  .then(greeting => console.log(greeting));
```

### 选项 3: 等待完整集成

当与激活流程的集成实现后 (Story 6.1.4/6.1.6)，系统将在激活任何代理时自动工作:

```
@dev              → 自动上下文问候
@po               → 自动上下文问候
@qa               → 自动上下文问候
```

## 相关文件

### 核心脚本
- `.aiox-core/core/session/context-detector.js` - 会话类型检测
- `.aiox-core/infrastructure/scripts/git-config-detector.js` - Git 配置检测
- `.aiox-core/development/scripts/greeting-builder.js` - 问候构建
- `.aiox-core/development/scripts/workflow-navigator.js` - 工作流导航
- `.aiox-core/development/scripts/agent-exit-hooks.js` - 退出钩子 (用于持久化)

### 数据文件
- `.aiox-core/data/workflow-patterns.yaml` - 工作流定义

### 测试
- `tests/unit/context-detector.test.js` - 23 个测试
- `tests/unit/git-config-detector.test.js` - 19 个测试
- `tests/unit/greeting-builder.test.js` - 23 个测试
- `tests/integration/performance.test.js` - 性能验证

### 配置
- `.aiox-core/core-config.yaml` - 全局配置 (git + agentIdentity 部分)

### 代理 (已更新)
- `.aiox-core/agents/dev.md` - ✅ 命令可见性元数据
- `.aiox-core/agents/po.md` - ✅ 命令可见性元数据
- `.aiox-core/agents/*.md` - ⏳ 剩余 9 个代理 (待更新)

## 下一步

### 立即 (修复测试问题)
1. 修复测试配置问题 (1-2 小时)
2. 运行完整测试套件
3. 执行性能测试

### 短期 (Story 6.1.4 或 6.1.6)
1. 实现与代理激活流程的集成
2. 更新剩余 9 个代理的命令可见性元数据
3. 使用真实代理激活进行测试

### 长期 (Story 6.1.2.6)
1. 实现动态工作流模式学习
2. 添加基于使用的命令优先级
3. 实现代理协作提示

## 性能指标

**目标 (来自 Story 6.1.2.5):**
- P50 延迟: <100ms
- P95 延迟: <130ms
- P99 延迟: <150ms (硬限制)

**预期 (基于代码审查):**
- Git 配置 (缓存命中): <5ms ✅
- Git 配置 (缓存未命中): <50ms ✅
- 上下文检测: <50ms ✅
- 会话文件 I/O: <10ms ✅
- 工作流匹配: <20ms ✅
- **总计 P99:** ~100-120ms ✅ (远低于限制)

**优化:**
- 并行执行 (Promise.all)
- 基于 TTL 的缓存
- 超时保护
- 缓存命中时提前退出

## 向后兼容性

**100% 向后兼容:**
- 没有可见性元数据的代理显示所有命令 (最多 12)
- 任何错误时优雅回退到简单问候
- 激活流程零破坏性更改
- 渐进式迁移 (第 1 阶段: dev/po → 第 2 阶段: 剩余 9 个)

## 常见问题

**Q: 为什么我激活代理时问候不是上下文的?**
A: 与激活流程的集成尚未实现。组件存在但尚未自动调用。

**Q: 集成何时完成?**
A: 在未来的故事中 (可能是 6.1.4 或 6.1.6)。取决于代理配置系统。

**Q: 如何现在测试?**
A: 使用测试脚本: `node .aiox-core/development/scripts/test-greeting-system.js`

**Q: 如果代理没有可见性元数据会发生什么?**
A: 回退: 显示所有命令 (最多 12)。不会破坏任何东西。

**Q: 如何给我的命令添加可见性元数据?**
A: 参见上面的 "命令可见性系统" 部分和 dev.md 和 po.md 代理中的示例。

**Q: 我可以禁用上下文问候吗?**
A: 可以，通过配置: `core-config.yaml` → `agentIdentity.greeting.contextDetection: false`

---

**文档更新:** 2025-01-15
**作者:** Quinn (QA) + Dex (Dev)
**故事:** 6.1.2.5 - 上下文代理加载系统
