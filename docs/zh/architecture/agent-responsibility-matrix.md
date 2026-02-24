<!-- 翻译: ZH-CN | 原始: /docs/pt/architecture/agent-responsibility-matrix.md | 同步: 2026-02-22 -->

# 代理责任矩阵 - Epic 3 战略改进

> 🌐 [EN](../../architecture/agent-responsibility-matrix.md) | [PT](../../pt/architecture/agent-responsibility-matrix.md) | **ZH**

---

**文档版本**: 1.0
**最后更新**: 2025-10-25
**作者**: Winston (@architect) + Sarah (@po)
**上下文**: Epic 3 第 2 阶段 - 战略改进 (Stories 3.13-3.19)

---

## 执行摘要

本文档为所有 AIOS 代理定义了清晰的责任界限，特别关注:
1. **GitHub DevOps 集中化** - 仅 @github-devops 可推送到远程存储库
2. **数据架构专业化** - @data-architect 管理数据库/数据科学
3. **分支管理划分** - @sm (本地) vs @github-devops (远程)
4. **Git 操作限制** - 哪些代理可以执行哪些 git/GitHub 操作

**关键规则**: 仅 @github-devops 代理可执行 `git push` 到远程存储库。

---

## Git/GitHub 操作矩阵

### 完全操作权限

| 操作 | @github-devops | @dev | @sm | @qa | @architect | @po |
|-----|:--------------:|:----:|:---:|:---:|:----------:|:---:|
| **git push** | ✅ 唯一 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git push --force** | ✅ 唯一 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr create** | ✅ 唯一 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr merge** | ✅ 唯一 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh release create** | ✅ 唯一 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git commit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git add** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git checkout -b** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git merge** (本地) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git status** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git log** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git diff** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 执行机制

**多层深度防御**:

1. **Git 前推送钩子** (主要应用)
   - 位置: `.git/hooks/pre-push`
   - 检查: 环境变量 `$AIOS_ACTIVE_AGENT`
   - 动作: 如果 agent != "github-devops" 则阻止推送

2. **环境变量** (运行时检测)
   ```bash
   export AIOS_ACTIVE_AGENT="github-devops"
   export AIOS_GIT_PUSH_ALLOWED="true"
   ```

3. **代理定义** (文档 + 限制)
   - 所有代理都有 `git_restrictions` 部分
   - 清晰的 `allowed_operations` 和 `blocked_operations` 列表
   - 重定向消息指向 @github-devops

4. **IDE 配置** (UX 层)
   ```json
   {
     "agents": {
       "dev": { "blockedOperations": ["push"] },
       "github-devops": { "allowedOperations": ["*"] }
     }
   }
   ```

---

## 代理责任界限

### @architect (Winston) 🏗️
**角色**: 整体系统架构师和全栈技术领导

**主要职责范围**:
- 系统架构 (微服务、单体、无服务器、混合)
- 技术栈选择 (框架、语言、平台)
- 基础设施规划 (部署、可扩展性、监控、CDN)
- API 设计 (REST、GraphQL、tRPC、WebSocket)
- 安全架构 (身份验证、授权、加密)
- 前端架构 (状态管理、路由、性能)
- 后端架构 (服务边界、事件流、缓存)
- 横切关注 (日志、监控、错误处理)

**Git 操作**: 仅读取 (status、log、diff) - 无推送

**委托给**:
- **@data-architect**: 数据库 schema 设计、查询优化、ETL 管道
- **@github-devops**: Git 推送、创建 PR、CI/CD 配置

**保持**:
- 系统角度的数据库技术选择
- 数据层与应用架构的集成
- Git 工作流设计 (分支策略)

---

### @data-architect (DataArch) 🗄️
**角色**: 数据库架构师和数据科学工作流专家

**主要职责范围**:
- 数据库 schema 设计 (表、关系、索引、约束)
- 数据建模 (规范化、非规范化策略)
- 查询优化和性能调整
- ETL 管道设计和实现
- 数据科学工作流架构
- Supabase 特定优化 (RLS 策略、实时、边界函数)
- 数据治理 (安全、隐私、合规)

**Git 操作**: 本地提交 (add、commit) - 无推送

**协作对象**:
- **@architect**: 数据库技术选择、数据层集成
- **@github-devops**: 提交后推送迁移文件

**专门知识**: Supabase 专家 (行级安全、实时、边界函数、存储)

---

### @dev (James) 💻
**角色**: 高级软件工程师和实现专家

**主要职责范围**:
- 从故事实现代码
- 调试和重构
- 单元/集成测试
- 本地 git 操作 (add、commit、checkout、merge)
- 故事任务执行

**Git 操作**:
- ✅ 允许: add、commit、status、diff、log、branch、checkout、merge (本地)
- ❌ 阻止: push、gh pr create

**故事完成后的工作流**:
1. 标记故事状态: "准备审查"
2. 通知用户: "故事完成。激活 @github-devops 推送变更"
3. 不尝试 git push

---

### @sm (Bob) 🏃
**角色**: 技术 Scrum 主管 - 故事准备专家

**主要职责范围**:
- 故事创建和精化
- Epic 管理和分解
- Sprint 规划协助
- 开发期间本地分支管理
- 冲突解决指导 (本地合并)

**Git 操作**:
- ✅ 允许: checkout -b (创建功能分支)、branch (列表)、merge (本地)
- ❌ 阻止: push、gh pr create、删除远程分支

**分支管理工作流**:
1. 故事开始 → 创建本地功能分支: `git checkout -b feature/X.Y-story-name`
2. 开发者本地提交
3. 故事完成 → 通知 @github-devops 推送并创建 PR

**注意**: @sm 在开发期间管理本地分支，@github-devops 管理远程操作

---

### @github-devops (DevOps) 🚀
**角色**: GitHub 仓库经理和 DevOps 专家

**主要权限**: 唯一获授权推送到远程存储库的代理

**独占操作**:
- ✅ git push (所有变体)
- ✅ gh pr create、gh pr merge
- ✅ gh release create
- ✅ 删除远程分支

**主要职责范围**:
- 存储库完整性和治理
- 执行推送前质量门 (lint、test、typecheck、build)
- 语义版本控制和发布管理
- 创建和管理拉取请求
- CI/CD 管道配置 (GitHub Actions)
- 仓库清理 (过时分支、临时文件)
- 生成变更日志

**质量门 (推送前必需)**:
- npm run lint → PASS
- npm test → PASS
- npm run typecheck → PASS
- npm run build → PASS
- 故事状态 = "完成" 或 "准备审查"
- 无未提交的变更
- 无合并冲突
- **需要用户确认**

**语义版本控制逻辑**:
- MAJOR (v4 → v5): 破坏性变更、API 重新设计
- MINOR (v4.31 → v4.32): 新功能、向后兼容
- PATCH (v4.31.0 → v4.31.1): 仅错误修复

---

### @qa (Quinn) 🧪
**角色**: 测试架构师和质量顾问

**主要职责范围**:
- 全面测试架构审查
- 质量门决策 (通过/关注/失败/豁免)
- 风险评估和测试策略
- 需求可追踪性
- 咨询角色 (不阻止，提供建议)

**Git 操作**: 仅读取 (status、log、diff 用于审查) - 无提交、无推送

**注意**: QA 审查代码但不提交。@dev 提交，@github-devops 推送。

---

### @po (Sarah) 📝
**角色**: 技术产品经理和流程守护者

**主要职责范围**:
- 待办项管理和故事精化
- 验收标准验证
- Sprint 规划和优先级排序
- 流程遵守和质量保证
- 文档生态系统完整性

**Git 操作**: 无 (PO 角色在 git 方面是非技术性的)

**注意**: @po 验证需求和优先级工作，不与 git 交互。

---

## 工作流示例

### 场景 1: 标准故事开发

```
1. 用户: "启动 Story 3.14: GitHub DevOps 代理"

2. @sm 激活:
   - 创建功能分支: `git checkout -b feature/3.14-github-devops-agent`
   - 传递给 @dev

3. @dev 激活:
   - 实现故事任务
   - 本地提交: `git add . && git commit -m "feat: implement pre-push quality gate"`
   - 标记故事: "准备审查"
   - 通知用户: "故事完成。激活 @github-devops 推送变更"

4. @github-devops 激活:
   - 执行 *pre-push (质量门)
   - 全部通过 → 呈现摘要
   - 用户确认
   - 推送: `git push -u origin feature/3.14-github-devops-agent`
   - 创建 PR: `gh pr create --title "Story 3.14: GitHub DevOps Agent" --body "..."`
   - 报告: "✅ 推送成功。PR #123 已创建: https://github.com/..."
```

### 场景 2: 数据库 Schema 设计

```
1. 用户: "设计用户身份验证的数据库 schema"

2. @architect 激活:
   - 分析系统需求
   - 决定: "为持久化使用 Supabase"
   - 委托: "激活 @data-architect 进行 schema 设计"

3. @data-architect 激活:
   - 执行 *design-schema
   - 创建表: users、sessions、auth_providers
   - 设计行级安全策略以确保安全
   - 生成迁移: `20251025_create_auth_schema.sql`
   - 本地提交: `git add migrations/ && git commit -m "feat: add auth schema"`
   - 通知: "Schema 设计完成。激活 @github-devops 推送迁移"

4. @github-devops 激活:
   - 执行 *pre-push (质量门)
   - 推送迁移到存储库
```

### 场景 3: 创建发布版本

```
1. 用户: "创建发布版本 v4.32.0"

2. @github-devops 激活:
   - 执行 *version-check
   - 分析自 v4.31.0 以来的提交
   - 推荐: "MINOR 版本碰撞 (新功能，向后兼容)"
   - 用户确认: v4.32.0
   - 执行 *pre-push (质量门)
   - 从提交生成变更日志
   - 创建标签: `git tag v4.32.0`
   - 推送: `git push && git push --tags`
   - 在 GitHub 创建发布: `gh release create v4.32.0 --title "Release v4.32.0" --notes "..."`
   - 报告: "✅ 发布版本 v4.32.0 已创建: https://github.com/.../releases/v4.32.0"
```

---

## 数据架构 vs 系统架构

### 比较矩阵

| 责任 | @architect | @data-architect |
|-----|:----------:|:---------------:|
| **数据库技术选择 (系统视角)** | ✅ | 🤝 协作 |
| **数据库 schema 设计** | ❌ 委托 | ✅ 主要 |
| **查询优化** | ❌ 委托 | ✅ 主要 |
| **ETL 管道设计** | ❌ 委托 | ✅ 主要 |
| **数据访问 API 设计** | ✅ 主要 | 🤝 协作 |
| **应用级缓存** | ✅ 主要 | 🤝 咨询 |
| **数据库特定优化 (RLS、触发器)** | ❌ 委托 | ✅ 主要 |
| **数据科学工作流** | ❌ 委托 | ✅ 主要 |
| **数据库基础设施 (可扩展性、复制)** | ✅ 主要 | 🤝 咨询 |

### 协作模式

**问题**: "应该使用哪个数据库？"
- **@architect 回答**: 系统角度 (成本、部署、团队技能、基础设施)
- **@data-architect 回答**: 数据角度 (查询模式、可扩展性、数据模型适配)
- **结果**: 综合建议

**问题**: "设计数据库 schema"
- **@architect**: 委托给 @data-architect
- **@data-architect**: 设计 schema、创建迁移
- **@architect**: 将 schema 集成到系统中 (API、ORM、缓存)

---

## 分支管理责任

### 本地分支 (@sm 在开发期间)

**责任**:
- 故事开始时创建功能分支
- 管理开发者的工作分支
- 本地分支清理 (删除已合并的分支)

**命令**:
```bash
# @sm 可执行:
git checkout -b feature/3.14-github-devops
git branch -d feature/old-branch
git merge feature/branch-to-integrate
```

### 远程分支 (@github-devops 用于存储库)

**责任**:
- 推送分支到远程
- 删除远程分支 (清理)
- 管理发布分支
- 保护 main/master 分支

**命令**:
```bash
# 仅 @github-devops 可执行:
git push -u origin feature/3.14-github-devops
git push origin --delete feature/old-branch
gh pr create
gh pr merge
```

---

## Story 3.14 实现清单

- [ ] **创建 Git 前推送钩子**
  - 位置: `.git/hooks/pre-push`
  - 内容: 检查 `$AIOS_ACTIVE_AGENT`，如果 != "github-devops" 则阻止
  - 使其可执行: `chmod +x .git/hooks/pre-push`

- [ ] **更新所有代理定义** (完成 ✅)
  - [x] @architect - 添加了 `git_restrictions` 和协作限制
  - [x] @dev - 移除 git push，添加工作流重定向
  - [x] @sm - 澄清仅本地分支管理
  - [x] @qa - 操作仅读取 git
  - [x] @github-devops - 创建有独占推送权限
  - [x] @data-architect - 创建有数据专业化

- [ ] **更新代理激活脚本**
  - 添加环境变量配置: `AIOS_ACTIVE_AGENT={agent_id}`
  - 适当设置 `AIOS_GIT_PUSH_ALLOWED`

- [ ] **IDE 配置** (.claude/settings.json)
  - 为每个代理添加 `agents.{id}.blockedOperations`
  - 在 IDE 设置指南中记录

- [ ] **文档更新**
  - [x] 代理责任矩阵 (此文档)
  - [ ] 更新 git-workflow-guide.md
  - [ ] 更新开发者入职文档

- [ ] **测试**
  - 测试 @dev 尝试 git push (应被阻止)
  - 测试 @github-devops git push (应工作)
  - 测试推送前质量门
  - 测试 PR 创建工作流

---

## 未来考虑

### Story 3.19: 内存层 (条件)
如果在实用程序审计 (Story 3.17) 后被批准:
- 内存层不需要 git 限制 (实用程序，不是代理)
- 与代理的集成不改变责任界限

### Squad
如果通过 Squad 添加新代理:
- **模式**: 无 git 推送能力
- **异常流程**: 必须由 PO 明确批准并有正当理由
- **应用**: 前推送钩子自动阻止，除非代理 ID 在白名单上

---

## 总结

**关键点**:
1. ✅ 仅 @github-devops 可推送到远程存储库 (通过 git 钩子应用)
2. ✅ @architect 管理系统架构，@data-architect 管理数据层
3. ✅ @sm 管理本地分支，@github-devops 管理远程操作
4. ✅ 质量门在任何推送前都是必需的
5. ✅ 所有代理都有清晰且文件记录的界限

**应用**: 多层 (钩子 + 环境变量 + 代理定义 + IDE 配置)

**状态**: ✅ 准备在 Story 3.14 中实现

---

*文档由 @architect (Winston) 和 @po (Sarah) 维护*
*最后审查: 2025-10-25*
