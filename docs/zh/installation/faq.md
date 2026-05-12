<!-- 翻译：zh-CN 原文：/docs/installation/faq.md 最后同步：2026-02-22 -->

# Synkra AIOX 常见问题

> 🌐 [EN](../../installation/faq.md) | [PT](../pt/installation/faq.md) | [ES](../es/installation/faq.md)

**版本:** 2.1.0
**最后更新:** 2025-01-24

---

## 目录

- [安装相关问题](#安装相关问题)
- [更新与维护](#更新与维护)
- [离线与隔离环境使用](#离线与隔离环境使用)
- [IDE 与配置](#ide-与配置)
- [代理与工作流](#代理与工作流)
- [Squad](#squad)
- [高级用法](#高级用法)

---

## 安装相关问题

### 问题 1：为什么使用 npx 而不是 npm install -g？

**答案:** 我们推荐使用 `npx @synkra/aiox-core install` 而不是全局安装，原因如下：

1. **始终最新版本**: npx 自动获取最新版本
2. **无全局污染**: 不会添加到全局 npm 包
3. **项目隔离**: 每个项目可以拥有自己的版本
4. **无权限问题**: 避免常见的全局 npm 权限问题
5. **CI/CD 友好**: 在自动化管道中无缝工作

**如果您更喜欢全局安装：**

```bash
npm install -g @synkra/aiox-core
@synkra/aiox-core install
```

---

### 问题 2：系统要求是什么？

**答案:**

| 组件          | 最小版本                        | 推荐版本    |
| ------------- | ------------------------------- | ----------- |
| **Node.js**   | 18.0.0                          | 20.x LTS    |
| **npm**       | 9.0.0                           | 10.x        |
| **磁盘空间**  | 100 MB                          | 500 MB      |
| **RAM**       | 2 GB                            | 8 GB        |
| **OS**        | Windows 10, macOS 12, Ubuntu 20.04 | 最新版本 |

**检查您的系统：**

```bash
node --version  # 应为 18+
npm --version   # 应为 9+
```

---

### 问题 3：我可以在现有项目中安装 AIOX 吗？

**答案:** 可以！AIOX 为绿地和棕地项目设计。

**对于现有项目：**

```bash
cd /path/to/existing-project
npx @synkra/aiox-core install
```

安装程序将：

- 创建 `.aiox-core/` 目录（框架文件）
- 创建 IDE 配置（`.claude/`、`.cursor/` 等）
- 不修改您的现有源代码
- 不覆盖现有文档，除非您选择

**重要:** 如果您有现有的 `.claude/` 或 `.cursor/` 目录，安装程序会在修改前询问。

---

### 问题 4：安装需要多长时间？

**答案:**

| 场景                | 时间          |
| ------------------- | ------------- |
| **首次安装**        | 2-5 分钟      |
| **更新现有安装**    | 1-2 分钟      |
| **仅安装启动 Squad** | 30-60 秒     |

影响安装时间的因素：

- 互联网连接速度
- npm 缓存状态
- 选中的 IDE 数量
- 选中的启动 Squad 数量

---

### 问题 5：AIOX 在我的项目中创建了哪些文件？

**答案:** AIOX 创建以下结构：

```
your-project/
├── .aiox-core/                 # 框架核心（200+ 文件）
│   ├── agents/                 # 11+ 个代理定义
│   ├── tasks/                  # 60+ 个任务工作流
│   ├── templates/              # 20+ 个文档模板
│   ├── checklists/             # 验证清单
│   ├── scripts/                # 实用脚本
│   └── core-config.yaml        # 框架配置
│
├── .claude/                    # Claude Code（如果选中）
│   └── commands/AIOX/agents/   # 代理斜杠命令
│
├── .cursor/                    # Cursor（如果选中）
│   └── rules/                  # 代理规则
│
├── docs/                       # 文档结构
│   ├── stories/                # 开发故事
│   ├── architecture/           # 架构文档
│   └── prd/                    # 产品需求
│
└── Squads/            # （如果安装）
    └── hybrid-ops/             # HybridOps 包
```

---

## 更新与维护

### 问题 6：如何将 AIOX 更新到最新版本？

**答案:**

```bash
# 通过 npx 更新（推荐）
npx @synkra/aiox-core update

# 或重新安装最新版本
npx @synkra/aiox-core install --force-upgrade

# 检查当前版本
npx @synkra/aiox-core status
```

**更新的内容：**

- `.aiox-core/` 文件（代理、任务、模板）
- IDE 配置
- 启动 Squad（如果安装）

**保留的内容：**

- `core-config.yaml` 中的自定义修改
- 您的文档（`docs/`）
- 您的源代码

---

### 问题 7：应该多久更新一次？

**答案:** 我们建议：

| 更新类型        | 频率       | 命令                           |
| --------------- | ---------- | ------------------------------ |
| **安全补丁**    | 立即       | `npx @synkra/aiox-core update` |
| **次要更新**    | 每月       | `npx @synkra/aiox-core update` |
| **主要版本**    | 每季度     | 先查看变更日志                 |

**检查更新：**

```bash
npm show @synkra/aiox-core version
npx @synkra/aiox-core status
```

---

### 问题 8：我可以回滚到之前的版本吗？

**答案:** 可以，有多个选项：

**选项 1：重新安装特定版本**

```bash
npx @synkra/aiox-core@1.1.0 install --force-upgrade
```

**选项 2：使用 Git 恢复**

```bash
# 如果 .aiox-core 在 git 中跟踪
git checkout HEAD~1 -- .aiox-core/
```

**选项 3：从备份恢复**

```bash
# 安装程序创建备份
mv .aiox-core .aiox-core.failed
mv .aiox-core.backup .aiox-core
```

---

## 离线与隔离环境使用

### 问题 9：我可以在没有互联网的情况下使用 AIOX 吗？

**答案:** 可以，但需要一些准备：

**初始设置（需要互联网）：**

```bash
# 联网时安装一次
npx @synkra/aiox-core install

# 打包以供离线使用
tar -czvf aiox-offline.tar.gz .aiox-core/ .claude/ .cursor/
```

**在隔离机器上：**

```bash
# 解压软件包
tar -xzvf aiox-offline.tar.gz

# AIOX 代理可在没有互联网的情况下工作
# （它们不需要外部 API 调用）
```

**没有互联网的限制：**

- 无法更新到新版本
- MCP 集成（ClickUp、GitHub）将不工作
- 无法获取库文档（Context7）

---

### 问题 10：我如何将 AIOX 转移到隔离环境？

**答案:**

1. **在联网机器上：**

   ```bash
   # 安装并打包
   npx @synkra/aiox-core install
   cd your-project
   tar -czvf aiox-transfer.tar.gz .aiox-core/ .claude/ .cursor/ docs/
   ```

2. **通过 USB、安全传输等转移归档文件**

3. **在隔离机器上：**

   ```bash
   cd your-project
   tar -xzvf aiox-transfer.tar.gz
   ```

4. **如果需要，手动配置 IDE**（路径可能不同）

---

## IDE 与配置

### 问题 11：AIOX 支持哪些 IDE？

**答案:**

| IDE                | 状态       | 代理激活           |
| ------------------ | ---------- | ------------------- |
| **Claude Code**    | 完全支持   | `/dev`、`/qa` 等   |
| **Cursor**         | 完全支持   | `@dev`、`@qa` 等   |
| **Gemini CLI**     | 完全支持   | 在提示中提及       |
| **GitHub Copilot** | 完全支持   | 聊天模式           |

**为新 IDE 添加支持:** 使用 IDE 的代理/规则规范打开 GitHub 问题。

---

### 问题 12：我可以为多个 IDE 配置 AIOX 吗？

**答案:** 可以！在安装过程中选择多个 IDE：

**交互式：**

```
? Which IDE(s) do you want to configure?
❯ ◉ Cursor
  ◉ Claude Code
```

**命令行：**

```bash
npx @synkra/aiox-core install --ide cursor,claude-code
```

每个 IDE 获得其自己的配置目录：

- `.cursor/rules/` 用于 Cursor
- `.claude/commands/` 用于 Claude Code

---

### 问题 13：我如何为新团队成员配置 AIOX？

**答案:**

如果 `.aiox-core/` 已提交到您的仓库：

```bash
# 新团队成员只需克隆
git clone your-repo
cd your-repo

# 可选择配置他们喜欢的 IDE
npx @synkra/aiox-core install --ide cursor
```

如果 `.aiox-core/` 未提交：

```bash
git clone your-repo
cd your-repo
npx @synkra/aiox-core install
```

**最佳实践:** 将 `.aiox-core/` 提交到您的仓库以共享一致的代理配置。

---

## 代理与工作流

### 问题 14：包含了哪些代理？

**答案:** AIOX 包括 11+ 个专门代理：

| 代理           | 角色             | 最适合的工作                      |
| -------------- | ---------------- | --------------------------------- |
| `dev`          | 全栈开发者       | 代码实现、调试                    |
| `qa`           | QA 工程师        | 测试、代码审查                    |
| `architect`    | 系统架构师       | 设计、架构决策                    |
| `pm`           | 项目经理         | 规划、跟踪                        |
| `po`           | 产品所有者       | 积压工作、需求                    |
| `sm`           | Scrum 主管       | 便利化、冲刺管理                  |
| `analyst`      | 业务分析师       | 需求分析                         |
| `ux-expert`    | UX 设计师        | 用户体验设计                      |
| `data-engineer` | 数据工程师       | 数据管道、ETL                     |
| `devops`       | DevOps 工程师    | CI/CD、部署                       |
| `db-sage`      | 数据库架构师     | 模式设计、查询                    |

---

### 问题 15：如何创建自定义代理？

**答案:**

1. **复制现有代理：**

   ```bash
   cp .aiox-core/agents/dev.md .aiox-core/agents/my-agent.md
   ```

2. **编辑 YAML 前置：**

   ```yaml
   agent:
     name: MyAgent
     id: my-agent
     title: My Custom Agent
     icon: 🔧

   persona:
     role: Expert in [your domain]
     style: [communication style]
   ```

3. **添加到 IDE 配置：**

   ```bash
   npx @synkra/aiox-core install --ide claude-code
   ```

4. **激活:** `/my-agent` 或 `@my-agent`

---

### 问题 16：什么是"yolo 模式"？

**答案:** Yolo 模式是自主开发模式，其中代理：

- 不需分步确认即可实现故事任务
- 根据故事需求自主做出决策
- 在 `.ai/decision-log-{story-id}.md` 中记录所有决策
- 可随时停止

**启用 yolo 模式：**

```bash
/dev
*develop-yolo docs/stories/your-story.md
```

**何时使用：**

- 对于需求明确、接受条件清晰的故事
- 当您信任代理的决策制定时
- 对于重复性任务

**何时不使用：**

- 对于复杂的架构变更
- 当需求模糊时
- 对于生产关键代码

---

## Squad

### 问题 17：什么是 Squad？

**答案:** 启动 Squad 是可选的扩展，用于扩展 AIOX 功能：

| 包            | 功能                                                      |
| -------------- | --------------------------------------------------------- |
| **hybrid-ops** | ClickUp 集成、流程自动化、专门工作流 |

**安装 Squad：**

```bash
npx @synkra/aiox-core install --Squads hybrid-ops
```

**列出可用的 Squad：**

```bash
npx @synkra/aiox-core install
```

---

### 问题 18：我可以创建自己的 Squad 吗？

**答案:** 可以！启动 Squad 遵循此结构：

```
my-expansion/
├── pack.yaml           # 包清单
├── README.md           # 文档
├── agents/             # 自定义代理
│   └── my-agent.md
├── tasks/              # 自定义任务
│   └── my-task.md
├── templates/          # 自定义模板
│   └── my-template.yaml
└── workflows/          # 自定义工作流
    └── my-workflow.yaml
```

**pack.yaml 示例：**

```yaml
name: my-expansion
version: 1.0.0
description: My custom Squad
dependencies:
  aiox-core: ">=1.0.0"
agents:
  - my-agent
tasks:
  - my-task
```

---

## 高级用法

### 问题 19：如何将 AIOX 与 CI/CD 集成？

**答案:**

**GitHub Actions 示例：**

```yaml
name: CI with AIOX
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npx @synkra/aiox-core install --full --ide claude-code
      - run: npm test
```

**GitLab CI 示例：**

```yaml
test:
  image: node:18
  script:
    - npx @synkra/aiox-core install --full
    - npm test
```

---

### 问题 20：如何自定义 core-config.yaml？

**答案:** `core-config.yaml` 文件控制框架行为：

```yaml
# 文档分片
prd:
  prdSharded: true
  prdShardedLocation: docs/prd

# 故事位置
devStoryLocation: docs/stories

# dev 代理加载的文件
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md

# Git 配置
git:
  showConfigWarning: true
  cacheTimeSeconds: 300

# 代理问候语中的项目状态
projectStatus:
  enabled: true
  showInGreeting: true
```

**编辑后，重启 IDE 以应用更改。**

---

### 问题 21：我如何为 AIOX 做贡献？

**答案:**

1. **Fork 仓库:** https://github.com/SynkraAI/aiox-core

2. **创建功能分支：**

   ```bash
   git checkout -b feature/my-feature
   ```

3. **按照编码标准做出更改：**
   - 阅读 `docs/framework/coding-standards.md`
   - 为新功能添加测试
   - 更新文档

4. **提交 pull request：**
   - 描述您的更改
   - 链接到相关问题
   - 等待审查

**欢迎的贡献类型：**

- 错误修复
- 新代理
- 文档改进
- 启动 Squad
- IDE 集成

---

### 问题 22：我可以在哪里获得帮助？

**答案:**

| 资源            | 链接                                                   |
| --------------- | ------------------------------------------------------ |
| **文档**        | `docs/` 在您的项目中                                   |
| **故障排除**    | [troubleshooting.md](./troubleshooting.md)             |
| **GitHub Issues** | https://github.com/SynkraAI/aiox-core/issues |
| **源代码**      | https://github.com/SynkraAI/aiox-core        |

**在寻求帮助之前：**

1. 检查此 FAQ
2. 检查 [故障排除指南](./troubleshooting.md)
3. 搜索现有 GitHub 问题
4. 在您的问题中包含系统信息和错误消息

---

## 相关文档

- [故障排除指南](./troubleshooting.md)
- [编码标准](../../framework/coding-standards.md)
