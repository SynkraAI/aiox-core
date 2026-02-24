# 对 Synkra AIOS 做出贡献

> **[葡萄牙語版本](../CONTRIBUTING-PT.md)**

欢迎来到 AIOS！感谢您对贡献的兴趣。本指南将帮助您了解我们的开发工作流程、贡献流程以及如何提交更改。

## 目录

- [快速开始](#快速开始)
- [贡献类型](#贡献类型)
- [开发工作流程](#开发工作流程)
- [贡献代理](#贡献代理)
- [贡献任务](#贡献任务)
- [贡献 Squads](#贡献-squads)
- [代码审查流程](#代码审查流程)
- [验证系统](#验证系统)
- [代码标准](#代码标准)
- [测试要求](#测试要求)
- [常见问题](#常见问题)
- [获得帮助](#获得帮助)
- [使用 Pro](#使用-pro)

---

## 快速开始

### 1. Fork 并克隆

```bash
# 通过 GitHub UI Fork，然后克隆您的 fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# 添加 upstream 远程
git remote add upstream https://github.com/SynkraAI/aios-core.git
```

### 2. 设置开发环境

**先决条件：**

- Node.js >= 20.0.0
- npm
- Git
- GitHub CLI (`gh`) - 可选但推荐

```bash
# 安装依赖
npm install

# 验证设置
npm test
npm run lint
npm run typecheck
```

### 3. 创建功能分支

```bash
git checkout -b feature/your-feature-name
```

**分支命名约定：**
| 前缀 | 用于 |
|--------|---------|
| `feature/` | 新功能、代理、任务 |
| `fix/` | 错误修复 |
| `docs/` | 文档更新 |
| `refactor/` | 代码重构 |
| `test/` | 测试添加/改进 |

### 4. 进行更改

按照以下相关指南进行操作以进行您的贡献类型。

### 5. 运行本地验证

```bash
npm run lint      # 代码风格
npm run typecheck # 类型检查
npm test          # 运行测试
npm run build     # 验证构建
```

### 6. 推送并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建针对 `main` 分支的 Pull Request。

---

## 贡献类型

| 贡献 | 描述 | 难度 |
| ----------------- | ------------------------------------ | ----------- |
| **文档** | 修复拼写错误、改进指南 | 简单 |
| **错误修复** | 修复报告的问题 | 简单-中等 |
| **任务** | 添加新的任务工作流 | 中等 |
| **代理** | 创建新的 AI 代理角色 | 中等 |
| **Squads** | 代理 + 任务 + 工作流的包 | 高级 |
| **核心功能** | 框架改进 | 高级 |

---

## 开发工作流程

### 提交约定

我们使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>: <description>

<optional body>
```

**类型：** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**示例：**

```bash
git commit -m "feat(agent): add security-auditor agent"
git commit -m "fix: resolve memory leak in config loader"
git commit -m "docs: update contribution guide"
```

### Pull Request 流程

1. **创建 PR** 针对 `main` 分支
2. **自动检查**运行（lint、typecheck、test、build）
3. **CodeRabbit 审查** - 提供 AI 驱动的反馈
4. **维护者审查** - 至少需要 1 个批准
5. **合并**所有检查通过后

---

## 贡献代理

代理是具有特定专业知识和命令的 AI 角色。

### 代理文件位置

```
.aios-core/development/agents/your-agent.md
```

### 所需的代理结构

```yaml
agent:
  name: AgentName
  id: agent-id # kebab-case，唯一
  title: 描述性标题
  icon: emoji
  whenToUse: '何时激活此代理'

persona_profile:
  archetype: Builder | Analyst | Guardian | Operator | Strategist

  communication:
    tone: pragmatic | friendly | formal | analytical
    emoji_frequency: none | low | medium | high

    vocabulary:
      - domain-term-1
      - domain-term-2

    greeting_levels:
      minimal: '简短问候'
      named: '具有个性的命名问候'
      archetypal: '完整的原型问候'

    signature_closing: '签名短语'

persona:
  role: "代理的主要角色"
  style: '通信风格'
  identity: "代理的身份描述"
  focus: '代理关注的内容'

  core_principles:
    - 原则 1
    - 原则 2

commands:
  - help: 显示可用命令
  - custom-command: 命令描述

dependencies:
  tasks:
    - related-task.md
  tools:
    - tool-name
```

### 代理贡献检查清单

- [ ] 代理 ID 是唯一的并使用 kebab-case
- [ ] `persona_profile` 完成，包括原型和沟通
- [ ] 所有命令都有描述
- [ ] 依赖关系列出所有必需的任务
- [ ] 没有硬编码的凭证或敏感数据
- [ ] 遵循代码库中的现有模式

### 代理的 PR 模板

创建 PR 时使用**代理贡献**模板。

---

## 贡献任务

任务是代理可以运行的可执行工作流。

### 任务文件位置

```
.aios-core/development/tasks/your-task.md
```

### 所需的任务结构

```markdown
# 任务名称

**描述：** 此任务做什么
**代理：** @dev, @qa, 等
**询问：** true | false

---

## 先决条件

- 先决条件 1
- 先决条件 2

## 步骤

### 第 1 步：第一步

描述要做什么。

**询问点（如果询问为 true）：**

- 要问用户的问题
- 提供的选项

### 第 2 步：第二步

继续进行更多步骤...

## 可交付成果

- [ ] 可交付成果 1
- [ ] 可交付成果 2

## 错误处理

如果发生 X，做 Y。

---

## 依赖关系

- `dependency-1.md`
- `dependency-2.md`
```

### 任务贡献检查清单

- [ ] 任务有明确的描述和目的
- [ ] 步骤是顺序的且合乎逻辑
- [ ] 询问点很清楚（如果适用）
- [ ] 可交付成果明确定义
- [ ] 包括错误处理指导
- [ ] 依赖关系存在于代码库中

### 任务的 PR 模板

创建 PR 时使用**任务贡献**模板。

---

## 贡献 Squads

Squads 是相关代理、任务和工作流的包。

### Squad 结构

```
your-squad/
├── manifest.yaml       # Squad 元数据
├── agents/
│   └── your-agent.md
├── tasks/
│   └── your-task.md
└── workflows/
    └── your-workflow.yaml
```

### Squad 清单

```yaml
name: your-squad
version: 1.0.0
description: 此小队做什么
author: 您的名字
dependencies:
  - base-squad (可选)
agents:
  - your-agent
tasks:
  - your-task
```

### Squad 资源

- [Squads 指南](../docs/guides/squads-guide.md) - 完整文档
- [Squad 模板](../templates/squad/) - 从工作模板开始
- [Squad 讨论](https://github.com/SynkraAI/aios-core/discussions/categories/ideas) - 分享想法

---

## 代码审查流程

### 自动检查

当您提交 PR 时，以下检查会自动运行：

| 检查 | 描述 | 必需 |
| -------------- | ---------------------- | -------- |
| **ESLint** | 代码风格和质量 | 是 |
| **TypeScript** | 类型检查 | 是 |
| **Build** | 构建验证 | 是 |
| **Tests** | Jest 测试套件 | 是 |
| **Coverage** | 最少 80% 覆盖率 | 是 |

### CodeRabbit AI 审查

[CodeRabbit](https://coderabbit.ai) 自动审查您的 PR 并提供以下反馈：

- 代码质量和最佳实践
- 安全问题
- AIOS 特定模式（代理、任务、工作流）
- 性能问题

**严重级别：**

| 级别 | 所需操作 |
| ------------ | ---------------------------------------- |
| **关键** | 必须在合并前修复 |
| **高** | 强烈建议修复 |
| **中** | 考虑修复或记录为技术债务 |
| **低** | 可选改进 |

**对 CodeRabbit 的回应：**

- 在请求审查前解决关键和高问题
- 可以记录中等问题以供后续跟进
- 低问题是信息性的

### 维护者审查

自动检查通过后，维护者将：

1. 验证更改符合项目标准
2. 检查安全隐含
3. 确保文档已更新
4. 批准或请求更改

### 合并要求

- [ ] 所有 CI 检查通过
- [ ] 至少 1 个维护者批准
- [ ] 所有对话已解决
- [ ] 没有合并冲突
- [ ] 分支是最新的与 main

---

## 验证系统

AIOS 实施了 **深度防御**策略，有 3 个验证层：

### 第 1 层：提交前（本地）

**性能：** < 5 秒

- ESLint 带缓存
- TypeScript 增量编译
- IDE 同步（自动暂存 IDE 命令文件）

### 第 2 层：推送前（本地）

**性能：** < 2 秒

- 故事复选框验证
- 状态一致性检查

### 第 3 层：CI/CD（云）

**性能：** 2-5 分钟

- 完整的 lint 和类型检查
- 完整的测试套件
- 覆盖率报告
- 故事验证
- 分支保护规则

---

## 代码标准

### JavaScript/TypeScript

- ES2022 功能
- 优先使用 `const` 而不是 `let`
- 使用 async/await 而不是 promises
- 为公开 API 添加 JSDoc 注释
- 遵循现有代码风格

### 文件组织

```
.aios-core/
├── development/
│   ├── agents/      # 代理定义
│   ├── tasks/       # 任务工作流
│   └── workflows/   # 多步工作流
├── core/            # 核心实用工具
└── product/
    └── templates/   # 文档模板

docs/
├── guides/          # 用户指南
└── architecture/    # 系统架构
```

### ESLint & TypeScript

- 扩展：`eslint:recommended`, `@typescript-eslint/recommended`
- 目标：ES2022
- 启用严格模式
- 生产中没有 console.log（警告）

---

## 测试要求

### 覆盖率要求

- **最少：** 80% 覆盖率（分支、函数、行、语句）
- **单元测试：** 所有新函数均需要
- **集成测试：** 工作流均需要

### 运行测试

```bash
npm test                    # 运行所有测试
npm run test:coverage       # 包含覆盖率报告
npm run test:watch          # 监视模式
npm test -- path/to/test.js # 特定文件
```

### 编写测试

```javascript
describe('MyModule', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

---

## 常见问题

### Q: 审查需要多长时间？

**A:** 我们的目标是在 24-48 小时内进行首次审查。复杂的更改可能需要更长时间。

### Q: 我可以在不进行测试的情况下贡献吗？

**A:** 强烈建议进行测试。对于仅文档的更改，可能不需要测试。

### Q: 如果我的 PR 有冲突怎么办？

**A:** 在最新的 main 上重新合并您的分支：

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease
```

### Q: 我可以用葡萄牙语贡献吗？

**A:** 是的！我们接受葡萄牙语的 PR。见 [CONTRIBUTING-PT.md](../CONTRIBUTING-PT.md)。

### Q: 我如何成为维护者？

**A:** 随着时间的推移，持续的高质量贡献。从小的修复开始，逐步进入更大的功能。

### Q: 我的 CI 检查失败了。我该怎么办？

**A:** 检查 GitHub Actions 日志：

```bash
gh pr checks  # 查看 PR 检查状态
```

常见修复：

- 为样式问题运行 `npm run lint -- --fix`
- 运行 `npm run typecheck` 以查看类型错误
- 在推送前确保测试在本地通过

---

## 获得帮助

- **GitHub Issues：** [打开一个 issue](https://github.com/SynkraAI/aios-core/issues)
- **讨论：** [开始讨论](https://github.com/SynkraAI/aios-core/discussions)
- **社区：** [COMMUNITY.md](../COMMUNITY.md)

---

## 使用 Pro

AIOS 使用 Open Core 模型，带有私人 `pro/` git 子模块（见 [ADR-PRO-001](../docs/architecture/adr/adr-pro-001-repository-strategy.md)）。

### 对于开源贡献者

**您不需要 pro/ 子模块。** 标准克隆完美运行：

```bash
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core
npm install && npm test  # 所有测试都通过了，没有 pro/
```

`pro/` 目录在您的克隆中将不存在——这是预期的，所有功能、测试和 CI 都在没有它的情况下通过。

### 对于有 Pro 访问权限的团队成员

```bash
# 使用子模块克隆
git clone --recurse-submodules https://github.com/SynkraAI/aios-core.git

# 或添加到现有克隆
git submodule update --init pro
```

**推送顺序：** 始终先推送 `pro/` 更改，然后是 `aios-core`。

### 未来：CLI 设置

```bash
# 将在未来版本中发布
aios setup --pro
```

有关完整的开发者工作流程指南，见 [Pro 开发者工作流程](../docs/guides/workflows/pro-developer-workflow.md)。

---

## 其他资源

- [社区指南](../COMMUNITY.md) - 如何参与
- [Squads 指南](../docs/guides/squads-guide.md) - 创建代理团队
- [架构](../docs/architecture/) - 系统设计
- [路线图](../ROADMAP.md) - 项目方向

---

**感谢您对 Synkra AIOS 的贡献！**
