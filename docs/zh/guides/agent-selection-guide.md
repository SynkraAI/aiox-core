# 代理选择指南

> **EN** | [PT](../pt/guides/agent-selection-guide.md) | [ES](../es/guides/agent-selection-guide.md)

---

## 选择正确代理的快速参考

**最后更新:** 2026-01-29 (ADE v2.2.0)

---

## 快速决策树

```
需要研究/分析? → @analyst
   ↓
需要PRD/史诗? → @pm
   ↓
需要架构? → @architect
   ↓
需要数据库? → @data-engineer
   ↓
需要故事? → @sm
   ↓
需要实现? → @dev
   ↓
需要测试/QA? → @qa
   ↓
需要部署? → @devops
```

---

## 代理快速参考

| 代理 | 图标 | 用于 | 不用于 |
|------|------|------|--------|
| **@analyst** (Atlas) | 🔍 | 市场研究、竞争分析、头脑风暴、模式提取 | PRD创建、架构、故事 |
| **@pm** (Morgan) | 📋 | PRD、史诗、产品战略、需求收集、规范编写 | 研究、架构、详细故事 |
| **@architect** (Aria) | 🏛️ | 系统架构、API设计、技术栈、复杂度评估、实现规划 | 研究、PRD、数据库架构 |
| **@data-engineer** (Dara) | 📊 | 数据库架构、RLS、迁移、查询优化 | 应用架构、DB技术选择 |
| **@sm** (River) | 🌊 | 用户故事、冲刺规划、待办事项整理 | PRD、史诗、研究、实现 |
| **@dev** (Dex) | 💻 | 故事实现、编码、测试、子任务执行、恢复 | 故事创建、部署 |
| **@qa** (Quinn) | 🧪 | 代码审查、测试、质量保证、规范批评、结构化审查 | 实现 |
| **@po** (Pax) | 🎯 | 待办事项管理、验收标准、优先级排序 | 史诗创建、架构 |
| **@ux-design-expert** (Nova) | 🎨 | UI/UX设计、线框图、设计系统 | 实现 |
| **@devops** (Gage) | ⚙️ | Git操作、PR创建、部署、CI/CD、工作树管理、迁移 | 本地Git、实现 |
| **@aiox-master** (Orion) | 👑 | 框架开发、多代理编排 | 日常任务（使用专门代理） |

---

## 🤖 ADE命令按代理 (v2.2.0)

### @devops (Gage) - 基础设施与运营

**工作树管理:**
| 命令 | 描述 |
|------|------|
| `*create-worktree {story}` | 为故事开发创建隔离的Git工作树 |
| `*list-worktrees` | 列出所有活跃工作树及状态 |
| `*merge-worktree {story}` | 合并已完成的工作树回到主分支 |
| `*cleanup-worktrees` | 删除陈旧/已合并的工作树 |

**迁移管理:**
| 命令 | 描述 |
|------|------|
| `*inventory-assets` | 从V2资产生成迁移清单 |
| `*analyze-paths` | 分析路径依赖和迁移影响 |
| `*migrate-agent` | 将单个代理从V2迁移到V3格式 |
| `*migrate-batch` | 批量迁移所有代理并验证 |

---

### @pm (Morgan) - 产品管理

**规范管道:**
| 命令 | 描述 |
|------|------|
| `*gather-requirements` | 从利益相关者获取和文档化需求 |
| `*write-spec` | 从需求生成正式规范文档 |

---

### @architect (Aria) - 系统架构

**规范管道:**
| 命令 | 描述 |
|------|------|
| `*assess-complexity` | 评估故事复杂度和估计工作量 |

**执行引擎:**
| 命令 | 描述 |
|------|------|
| `*create-plan` | 创建包含阶段和子任务的实现计划 |
| `*create-context` | 为故事生成项目和文件上下文 |

**内存层:**
| 命令 | 描述 |
|------|------|
| `*map-codebase` | 生成代码库地图（结构、服务、模式） |

---

### @analyst (Atlas) - 研究与分析

**规范管道:**
| 命令 | 描述 |
|------|------|
| `*research-deps` | 研究依赖和技术约束 |

**内存层:**
| 命令 | 描述 |
|------|------|
| `*extract-patterns` | 提取和文档化代码库中的代码模式 |

---

### @qa (Quinn) - 质量保证

**规范管道:**
| 命令 | 描述 |
|------|------|
| `*critique-spec {story}` | 审查和批评规范的完整性 |

**QA演进（10阶段审查）:**
| 命令 | 描述 |
|------|------|
| `*review-build {story}` | 10阶段结构化QA审查 - 输出qa_report.md |
| `*request-fix {issue}` | 从@dev请求特定修复及上下文 |
| `*verify-fix {issue}` | 验证修复是否正确实现 |

---

### @dev (Dex) - 开发

**执行引擎:**
| 命令 | 描述 |
|------|------|
| `*execute-subtask` | 执行子任务，遵循13步工作流和自我批评 |

**恢复系统:**
| 命令 | 描述 |
|------|------|
| `*track-attempt` | 跟踪实现尝试（在recovery/attempts.json中注册） |
| `*rollback` | 回滚到最后良好状态（--hard跳过确认） |

**QA循环:**
| 命令 | 描述 |
|------|------|
| `*apply-qa-fix` | 应用QA请求的修复（从qa_report.md读取上下文） |

**内存层:**
| 命令 | 描述 |
|------|------|
| `*capture-insights` | 捕获会话洞察（发现、模式、陷阱） |
| `*list-gotchas` | 列出.aiox/gotchas.md中的已知陷阱 |

---

## 常见场景

### "我想构建一个新功能"（传统方式）

```
1. @analyst *brainstorm - 构思
2. @pm *create-prd - 产品需求
3. @architect *create-architecture - 技术设计
4. @data-engineer *create-schema - 数据库设计
5. @sm *create-next-story - 用户故事
6. @dev *develop - 实现
7. @qa *review - 质量检查
8. @devops *create-pr - 部署
```

### "我想使用ADE规范管道"（自主方式）

```
1. @pm *gather-requirements - 收集和结构化需求
2. @architect *assess-complexity - 评估复杂度
3. @analyst *research-deps - 研究库/API
4. @pm *write-spec - 生成规范
5. @qa *critique-spec - 验证规范质量
   ↓
[规范已批准]
   ↓
6. @architect *create-plan - 创建实现计划
7. @architect *create-context - 生成上下文文件
8. @dev *execute-subtask 1.1 - 执行13步+自我批评
9. @qa *review-build - 10阶段QA审查
   ↓
[如果发现问题]
   ↓
10. @qa *request-fix - 请求修复
11. @dev *apply-qa-fix - 应用修复
12. @qa *verify-fix - 验证
```

### "我在实现上卡住了"

```
1. @dev *track-attempt - 记录失败的尝试
2. @dev *rollback - 恢复到最后良好状态
3. @dev *list-gotchas - 检查已知陷阱
4. @dev *execute-subtask --approach alternative - 尝试不同方法
```

### "我需要理解现有代码库"

```
1. @architect *map-codebase - 生成结构/服务/模式地图
2. @analyst *extract-patterns - 文档化代码模式
3. @dev *capture-insights - 记录发现
```

### "我需要并行故事开发"

```
1. @devops *create-worktree STORY-42 - 隔离分支
2. @dev *execute-subtask - 在隔离环境中工作
3. @devops *merge-worktree STORY-42 - 完成时合并
4. @devops *cleanup-worktrees - 清理陈旧分支
```

---

## 委派模式

### 规范管道流

```
@pm *gather-requirements
    ↓
@architect *assess-complexity
    ↓
@analyst *research-deps
    ↓
@pm *write-spec
    ↓
@qa *critique-spec
```

### 执行流

```
@architect *create-plan
    ↓
@architect *create-context
    ↓
@dev *execute-subtask (循环)
    ↓
@qa *review-build
```

### QA循环

```
@qa *review-build
    ↓ (发现问题)
@qa *request-fix
    ↓
@dev *apply-qa-fix
    ↓
@qa *verify-fix
    ↓ (循环直到清洁)
```

### 恢复流

```
@dev 失败子任务
    ↓
@dev *track-attempt
    ↓
重试 < 3? → @dev用变化重试
    ↓
@dev *rollback → 尝试不同方法
```

---

## 完整文档

- **[ADE完整指南](./ade-guide.md)** - 自主开发引擎完整教程
- **[代理责任矩阵](../architecture/agent-responsibility-matrix.md)** - 完整的边界定义

---

**版本:** 2.0 | **ADE:** v2.2.0 | **日期:** 2026-01-29
