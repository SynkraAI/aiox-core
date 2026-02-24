# @architect 系统

> **版本:** 1.0.0
> **创建:** 2026-02-04
> **所有者:** @architect (Aria - 愿景家)
> **状态:** 官方文档

---

## 概览

**@architect 代理 (Aria)** 是 AIOS 的**全系统架构师和全栈技术领导**。该代理负责:

- **完整系统架构**(微服务、单体、无服务器、混合)
- **技术栈选择**(框架、语言、平台)
- **基础设施规划**(部署、扩展、监控、CDN)
- **API 设计**(REST、GraphQL、tRPC、WebSocket)
- **安全架构**(认证、授权、加密)
- **前端架构**(状态管理、路由、性能)
- **后端架构**(服务边界、事件流、缓存)
- **跨切面关注**(日志、监控、错误处理)
- **集成模式**(事件驱动、消息、webhooks)
- **性能优化**(全栈层级)

### 核心原则

1. **全系统思维** - 将每个组件视为更大系统的一部分
2. **用户体验驱动架构** - 从用户旅程开始，向后工作
3. **务实的技术选择** - 在可能的地方选择"无聊"技术，在必要的地方选择"激动人心"技术
4. **渐进复杂性** - 最初设计简单系统，但可扩展
5. **跨栈性能专注** - 在所有层级整体优化
6. **开发者体验第一** - 使开发者能够提高生产力
7. **每层安全** - 实施深度防御
8. **数据中心设计** - 让数据需求指导架构
9. **成本意识工程** - 平衡技术理想与财务现实
10. **活跃架构** - 设计以适应变化

---

## 完整文件列表

### @architect 的核心任务文件

| 文件 | 命令 | 目的 |
|---------|---------|-----------|
| `.aios-core/development/tasks/architect-analyze-impact.md` | `*analyze-impact` | 分析修改对框架组件的影响 |
| `.aios-core/development/tasks/document-project.md` | `*document-project` | 生成现有项目的 brownfield 文档 |
| `.aios-core/development/tasks/create-doc.md` | `*create-doc` | 从 YAML 模板创建文档 |
| `.aios-core/development/tasks/collaborative-edit.md` | `*collaborative-edit` | 管理协作编辑会话 |
| `.aios-core/development/tasks/create-deep-research-prompt.md` | `*research` | 生成深度研究提示 |
| `.aios-core/development/tasks/execute-checklist.md` | `*execute-checklist` | 执行验证检查清单 |
| `.aios-core/development/tasks/spec-assess-complexity.md` | `*assess-complexity` | 评估故事复杂性(规范管道) |

### 代理定义文件

| 文件 | 目的 |
|---------|-----------|
| `.aios-core/development/agents/architect.md` | 架构师代理的核心定义 |
| `.claude/commands/AIOS/agents/architect.md` | Claude Code 命令用于激活 @architect |

### @architect 的模板文件

| 文件 | 目的 |
|---------|-----------|
| `.aios-core/product/templates/architecture-tmpl.yaml` | 后端架构模板 |
| `.aios-core/product/templates/front-end-architecture-tmpl.yaml` | 前端架构模板 |
| `.aios-core/product/templates/fullstack-architecture-tmpl.yaml` | 全栈架构模板 |
| `.aios-core/product/templates/brownfield-architecture-tmpl.yaml` | Brownfield 项目模板 |

---

## 命令到任务的映射

### 架构设计命令

| 命令 | 任务文件/模板 | 操作 |
|---------|---------------------|----------|
| `*create-full-stack-architecture` | `create-doc.md` + 模板 | 创建完整的全栈架构 |
| `*create-backend-architecture` | `create-doc.md` + 模板 | 创建后端架构 |
| `*create-front-end-architecture` | `create-doc.md` + 模板 | 创建前端架构 |
| `*create-brownfield-architecture` | `create-doc.md` + 模板 | 为现有项目创建架构 |

### 分析命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*analyze-impact` | `architect-analyze-impact.md` | 分析修改影响 |
| `*assess-complexity` | `spec-assess-complexity.md` | 评估复杂性(5 个维度) |
| `*research` | `create-deep-research-prompt.md` | 生成研究提示 |

### 文档命令

| 命令 | 任务文件 | 操作 |
|---------|-----------|----------|
| `*document-project` | `document-project.md` | 文档化现有项目 |
| `*execute-checklist` | `execute-checklist.md` | 执行架构检查清单 |
| `*doc-out` | N/A (内置) | 输出完整文档 |
| `*shard-prd` | N/A (内置) | 将 PRD 分解为部分 |

### 实用工具命令

| 命令 | 操作 |
|---------|----------|
| `*help` | 显示所有可用命令 |
| `*session-info` | 显示当前会话详情 |
| `*guide` | 显示代理使用指南 |
| `*yolo` | 切换跳过确认 |
| `*exit` | 退出架构师模式 |

---

## 复杂性评估 (*assess-complexity)

### 5 个维度

| 维度 | 评分范围 | 示例 |
|--------|----------|----------|
| **范围** | 1-5 | 1-2 个文件到 20+ |
| **集成** | 1-5 | 无到复杂协调 |
| **基础设施** | 1-5 | 无到新服务器 |
| **知识** | 1-5 | 现有模式到未知领域 |
| **风险** | 1-5 | 低到关键 |

**总分:** 5-25
- **SIMPLE:** <= 8 (< 1 天)
- **STANDARD:** 9-15 (1-3 天)
- **COMPLEX:** >= 16 (3+ 天)

---

## 架构师和其他代理的协作

### 接收来自的输入

- **@pm:** PRD 和业务需求
- **@ux-design-expert:** 前端规范和 UI 模式
- **@analyst:** 研究结果和技术发现

### 委托给

- **@db-sage:** 数据库架构和查询优化
- **@devops:** Git 操作和 CI/CD

### 交付给

- **@dev:** 要实现的架构
- **@po:** 工件验证
- **@sm:** 供冲刺的故事

---

## Git 限制

```yaml
git_restrictions:
  allowed_operations:
    - git status
    - git log
    - git diff
    - git branch -a

  blocked_operations:
    - git push        # 仅 @github-devops
    - git push --force
    - gh pr create

  redirect_message: "要进行 git push 操作，请激活 @github-devops"
```

---

## CodeRabbit 集成

### 何时使用

- 审查多层架构变更
- 验证 API 设计模式
- 审查安全架构
- 审查性能优化
- 验证集成模式
- 审查基础设施代码

### 严重性处理

| 严重性 | 操作 | 专注 |
|----------|------|------|
| **CRITICAL** | 阻止批准 | 安全漏洞、完整性风险 |
| **HIGH** | 标记讨论 | 性能瓶颈、反模式 |
| **MEDIUM** | 文档化为技术债务 | 可维护性、设计模式 |
| **LOW** | 重构备注 | 风格一致性 |

---

## 最佳实践

### 设计架构时

1. 从用户开始 - 用户旅程指导架构决策
2. 文档化权衡 - 记录选择的内容和原因
3. 考虑演进 - 为变化设计，不完美
4. 验证假设 - 对未知技术使用 `*research`
5. 早期协作 - 在完成前涉及 @db-sage 和 @ux-design-expert

### 分析影响时

1. 使用适当的深度 - 快速检查使用 `shallow`，关键变更使用 `deep`
2. 包括测试 - 对 API 变更使用 `--include-tests`
3. 文档化决策 - 使用 `--save-report` 保存报告
4. 尊重风险阈值 - 不要忽视 HIGH/CRITICAL

### 文档化项目时

1. 诚实文档 - 文档化技术债务，不要理想化
2. 参考文件 - 使用真实路径，不要重复内容
3. 专注 PRD - 如果存在 PRD，文档化相关区域
4. 捕获陷阱 - 解决方案和部落知识很有价值

---

## 总结

| 方面 | 详情 |
|---------|----------|
| **代理名称** | Aria (愿景家) |
| **ID** | @architect |
| **总核心任务** | 7 个任务文件 |
| **架构模板** | 4 个(全栈、后端、前端、brownfield) |
| **设计命令** | 4 个(`*create-*-architecture`) |
| **分析命令** | 3 个(`*analyze-impact`、`*assess-complexity`、`*research`) |
| **文档命令** | 3 个(`*document-project`、`*execute-checklist`、`*create-doc`) |
| **涉及的工作流** | 4 个(greenfield-fullstack、brownfield-fullstack、spec-pipeline、qa-loop) |
| **协作代理** | 5 个(@pm、@ux-design-expert、@db-sage、@devops、@analyst) |
| **Git 限制** | 仅读(推送 -> @devops) |
| **外部工具** | 6 个(exa、context7、git、supabase-cli、railway-cli、coderabbit) |

---

## 更改日志

| 日期 | 作者 | 描述 |
|------|-------|-----------|
| 2026-02-04 | @architect | 创建初始文档 |

---

*-- Aria，构建未来*
