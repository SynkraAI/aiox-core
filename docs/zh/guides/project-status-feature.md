# 项目状态功能 - 用户指南

> **EN** | **ZH-CN** | [PT](../pt/guides/project-status-feature.md) | [ES](../es/guides/project-status-feature.md)

---

**功能:** Agent激活时的动态项目状态上下文
**版本:** 1.0
**Story:** 6.1.2.4
**创建:** 2025-01-14

---

## 概述

项目状态功能在任何AIOX Agent激活时自动显示你当前的工作上下文。这包括：

- **Git分支** 你当前在哪个分支
- **修改的文件** 工作目录中的修改
- **最近提交** （最后2个）
- **当前故事/Epic** （如果有Story处于InProgress状态）

这给你即时的工作上下文，无需手动运行 `git status` 或搜索活跃故事。

---

## 示例显示

当你激活一个Agent（例如 `/dev`）时，你会看到：

```
💻 Dex (Builder) 已就绪。让我们构建一些很棒的东西！

当前项目状态：
  - 分支: main
  - 修改: story-6.1.2.4.md, po.md
  - 最近: chore: cleanup Utils Registry, Phase 4: Open-Source Preparation

输入 *help 查看可用命令！
```

---

## 设置

### 前提条件

- **Git仓库** - 项目必须用 `git init` 初始化
- **AIOX-FullStack** 框架已安装
- **Node.js 18+** 和所需包

### 初始设置

通过@devops agent运行初始化命令：

```bash
/devops
*init-project-status
```

这将：
1. 检测你的git仓库
2. 在 `core-config.yaml` 中启用 `projectStatus`
3. 创建 `.aiox/project-status.yaml` 缓存文件
4. 将缓存文件添加到 `.gitignore`
5. 测试状态显示

**替代手动设置:**

如果你更喜欢手动配置：

1. 编辑 `.aiox-core/core-config.yaml`：
   ```yaml
   projectStatus:
     enabled: true
     autoLoadOnAgentActivation: true
     showInGreeting: true
     cacheTimeSeconds: 60
   ```

2. 创建 `.aiox/` 目录：
   ```bash
   mkdir .aiox
   ```

3. 添加到 `.gitignore`：
   ```gitignore
   .aiox/project-status.yaml
   ```

---

## 配置

### 完整配置选项

位置: `.aiox-core/core-config.yaml`

```yaml
projectStatus:
  enabled: true                      # 启用/禁用功能
  autoLoadOnAgentActivation: true    # 在Agent激活时加载
  showInGreeting: true               # 在问候中显示
  cacheTimeSeconds: 60               # 缓存TTL（秒）
  components:                        # 切换各个组件
    gitBranch: true                  # 显示分支名称
    gitStatus: true                  # 显示修改的文件
    recentWork: true                 # 显示最近提交
    currentEpic: true                # 显示当前epic
    currentStory: true               # 显示当前story
  statusFile: .aiox/project-status.yaml  # 缓存文件位置
  maxModifiedFiles: 5                # 限制显示的修改文件数
  maxRecentCommits: 2                # 限制显示的提交数
```

### 定制示例

**仅显示分支和故事:**
```yaml
projectStatus:
  enabled: true
  components:
    gitBranch: true
    gitStatus: false      # 隐藏修改文件
    recentWork: false     # 隐藏提交
    currentEpic: false
    currentStory: true
```

**将缓存TTL增加到5分钟:**
```yaml
projectStatus:
  cacheTimeSeconds: 300
```

**显示更多提交和文件:**
```yaml
projectStatus:
  maxModifiedFiles: 10
  maxRecentCommits: 5
```

---

## 工作原理

### 状态收集

当Agent激活时，系统：

1. **检查缓存** - 查找 `.aiox/project-status.yaml`
2. **验证TTL** - 缓存 < 60秒？
3. **返回缓存** - 如果有效，使用缓存状态（快速）
4. **生成新鲜** - 如果过期，运行git命令并扫描故事
5. **更新缓存** - 为下次激活保存新状态

### 使用的Git命令

```bash
# 检查是否git仓库
git rev-parse --is-inside-work-tree

# 获取分支（现代git >= 2.22）
git branch --show-current

# 获取分支（较旧git的备选）
git rev-parse --abbrev-ref HEAD

# 获取修改的文件
git status --porcelain

# 获取最近提交
git log -2 --oneline --no-decorate
```

### 故事检测

扫描 `docs/stories/` 以查找包含以下内容的文件：
```markdown
**Status:** InProgress
**Story ID:** STORY-X.Y.Z
**Epic:** Epic X.Y - Name
```

仅显示状态为 `InProgress` 或 `In Progress` 的故事。

---

## 性能

### 基准

| 操作 | 时间 | 说明 |
|------|------|------|
| **首次加载** | 80-100ms | 运行git命令 + 文件扫描 |
| **缓存加载** | 5-10ms | 从缓存读取YAML |
| **缓存未命中** | 80-100ms | TTL过期，重新生成 |
| **Agent开销** | <100ms | 添加到激活时间 |

### 缓存策略

- **缓存TTL:** 60秒（可配置）
- **缓存位置:** `.aiox/project-status.yaml`
- **缓存格式:** YAML，包含状态对象 + 时间戳
- **失效:** TTL过期后自动

**为什么是60秒?**
- 足够长以避免Agent切换时重复git调用
- 足够短以反映最近的更改
- 性能和新鲜性的最优平衡

---

## 受影响的Agent

所有11个AIOX Agent都显示项目状态：

1. **@dev** (Dex - Builder)
2. **@po** (Pax - Balancer)
3. **@qa** (Quinn - Guardian)
4. **@sm** (River - Facilitator)
5. **@pm** (Morgan - Strategist)
6. **@architect** (Aria - Visionary)
7. **@analyst** (Atlas - Decoder)
8. **@devops** (Gage - Operator)
9. **@data-engineer** (Dara - Sage)
10. **@ux-design-expert** (Uma - Empathizer)
11. **@aiox-master** (Orion - Orchestrator)

---

## 故障排除

### 状态未显示

**症状:** Agent激活时没有状态显示

**检查:**
1. `projectStatus.enabled: true` 在 core-config.yaml 中？
2. 这是git仓库吗？ (`git rev-parse --is-inside-work-tree`)
3. `.aiox-core/infrastructure/scripts/project-status-loader.js` 存在吗？
4. Agent激活输出中有错误吗？

**解决方案:**
```bash
# 重新运行初始化
/devops
*init-project-status
```

### 过期状态数据

**症状:** 状态显示旧数据

**原因:** 缓存未正确失效

**解决方案:**
```bash
# 手动清除缓存
rm .aiox/project-status.yaml

# 或重启agent会话
```

### Git命令失败

**症状:** 分支显示"unknown"，文件缺失

**检查:**
1. git在PATH中吗？ (`git --version`)
2. git版本 >= 2.0? (推荐 >= 2.22)
3. 仓库损坏？ (`git fsck`)

**回退:** 系统会在现代命令失败时自动使用较旧的git命令。

### 性能问题

**症状:** Agent激活 > 200ms 持续

**原因:** 大型仓库或缓慢的磁盘I/O

**解决方案:**
```yaml
# 减少收集数据
projectStatus:
  maxModifiedFiles: 3    # 默认值: 5
  maxRecentCommits: 1     # 默认值: 2
  components:
    recentWork: false     # 禁用提交
```

### 非Git项目

**预期行为:**
```
当前项目状态：
  (不是git仓库)
```

这是正常的并且无害的。Agent在没有git的情况下正常工作。

---

## 高级用法

### 为特定Agent禁用

目前，状态在所有Agent中显示。要全局禁用：

```yaml
projectStatus:
  enabled: false
```

*注意: 按Agent禁用尚未实现（见未来增强）。*

### 自定义状态文件位置

```yaml
projectStatus:
  statusFile: .custom/my-status.yaml
```

不要忘记更新 `.gitignore`。

### 编程式访问

```javascript
const { loadProjectStatus, formatStatusDisplay } = require('./.aiox-core/infrastructure/scripts/project-status-loader.js');

// 获取原始状态对象
const status = await loadProjectStatus();
console.log(status);

// 获取格式化显示字符串
const display = formatStatusDisplay(status);
console.log(display);

// 手动清除缓存
const { clearCache } = require('./.aiox-core/infrastructure/scripts/project-status-loader.js');
await clearCache();
```

---

## 回滚

### 禁用功能

1. **编辑配置:**
   ```yaml
   projectStatus:
     enabled: false
   ```

2. **清除缓存:**
   ```bash
   rm .aiox/project-status.yaml
   ```

3. **重启agent** - 新激活不会显示状态

### 完全移除

要完全移除该功能：

```bash
# 移除脚本
rm .aiox-core/infrastructure/scripts/project-status-loader.js

# 移除task
rm .aiox-core/tasks/init-project-status.md

# 移除缓存
rm .aiox/project-status.yaml

# 移除测试
rm .aiox-core/infrastructure/scripts/__tests__/project-status-loader.test.js

# 从core-config.yaml移除配置部分
# (手动编辑文件)

# 回滚agent文件到6.1.2.4之前
git revert <commit-hash>
```

---

## Git版本兼容性

### 推荐: git >= 2.22

使用现代命令：
```bash
git branch --show-current
```

### 支持: git >= 2.0

回退到：
```bash
git rev-parse --abbrev-ref HEAD
```

### 最低: git 2.0+

较旧版本可能工作但未经测试。

**检查你的版本:**
```bash
git --version
```

---

## 未来增强

潜在的改进（尚未实现）：

- [ ] 按Agent状态切换（例如仅为@qa禁用）
- [ ] 彩色编码的状态指示器（ 绿色 干净，黄色 已修改，红色 冲突）
- [ ] 故事进度百分比（完成任务 / 总计）
- [ ] 估计的当前故事完成时间
- [ ] 多故事检测（显示所有InProgress）
- [ ] 通过插件的自定义状态组件
- [ ] 实时文件监视（移除缓存延迟）

---

## 常见问题

**Q: 这会减慢Agent激活吗?**
A: 初次加载添加约100ms。缓存加载添加约10ms。这是最少的，值得上下文好处。

**Q: 我可以为特定Agent禁用吗?**
A: 暂时不行。你可以通过 `projectStatus.enabled: false` 全局禁用。

**Q: 如果我不使用git怎么办?**
A: 状态显示"(不是git仓库)"，agent正常工作。

**Q: 状态多久刷新一次?**
A: 默认每60秒（通过 `cacheTimeSeconds` 可配置）。

**Q: 这在Windows/Linux/macOS上工作吗?**
A: 是的，在所有平台上都经过测试。

**Q: 我可以定制状态格式吗?**
A: 暂时不行。格式在 `project-status-loader.js:formatStatusDisplay()` 中是固定的。

**Q: 缓存在agent之间共享吗?**
A: 是的，所有agent使用相同的缓存文件 (`.aiox/project-status.yaml`)。

---

## 相关文档

- **Story:** `docs/stories/aiox migration/story-6.1.2.4-project-status-context.md`
- **配置:** `.aiox-core/core-config.yaml` (projectStatus部分)
- **脚本:** `.aiox-core/infrastructure/scripts/project-status-loader.js`
- **Init Task:** `.aiox-core/tasks/init-project-status.md`
- **测试:** `.aiox-core/infrastructure/scripts/__tests__/project-status-loader.test.js`

---

**版本:** 1.0
**状态:** ✅ 生产就绪
**最后更新:** 2025-01-14
