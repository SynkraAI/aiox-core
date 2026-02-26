# 构建恢复指南

> [EN](../../guides/build-recovery-guide.md) | **ZH**

> **Story:** 8.4 - 构建恢复与恢复
> **Epic:** Epic 8 - 自主构建引擎

---

## 概述

构建恢复系统使自主构建能够在失败或中断后从检查点恢复。构建不必从头开始,而是从最后成功的点继续。

---

## 主要功能

| 功能                      | 描述                                   |
| ------------------------- | -------------------------------------- |
| **检查点**                | 每个子任务完成后自动保存               |
| **恢复**                  | 从最后一个检查点继续                   |
| **状态监控**              | 实时构建进度                           |
| **废弃检测**              | 对过时构建发出警报(> 1小时)          |
| **失败通知**              | 卡住或达到最大迭代次数时发出警报       |
| **尝试日志**              | 完整的调试历史记录                     |

---

## 命令

### 检查构建状态

```bash
# 单个构建
*build-status story-8.4

# 所有活动构建
*build-status --all
```

### 恢复失败的构建

```bash
*build-resume story-8.4
```

### 查看尝试日志

```bash
*build-log story-8.4

# 按子任务筛选
*build-log story-8.4 --subtask 2.1

# 限制输出
*build-log story-8.4 --limit 20
```

### 清理废弃的构建

```bash
*build-cleanup story-8.4

# 强制清理(即使是活动构建)
*build-cleanup story-8.4 --force
```

---

## 构建状态 Schema

构建状态存储在 `plan/build-state.json`:

```json
{
  "storyId": "story-8.4",
  "status": "in_progress",
  "startedAt": "2026-01-29T10:00:00Z",
  "lastCheckpoint": "2026-01-29T11:30:00Z",
  "currentPhase": "phase-2",
  "currentSubtask": "2.3",
  "completedSubtasks": ["1.1", "1.2", "2.1", "2.2"],
  "checkpoints": [...],
  "metrics": {
    "totalSubtasks": 10,
    "completedSubtasks": 4,
    "totalAttempts": 6,
    "totalFailures": 2
  }
}
```

---

## 状态值

| 状态          | 描述                         |
| ------------- | ---------------------------- |
| `pending`     | 构建已创建但尚未开始         |
| `in_progress` | 构建正在运行                 |
| `paused`      | 构建已手动暂停               |
| `abandoned`   | 超过 1 小时无活动            |
| `failed`      | 构建失败(可恢复)           |
| `completed`   | 构建成功完成                 |

---

## 检查点系统

每个子任务完成后自动保存检查点:

```
plan/
├── build-state.json        # 主状态文件
├── build-attempts.log      # 尝试日志
└── checkpoints/            # 检查点快照
    ├── cp-lxyz123-abc.json
    ├── cp-lxyz124-def.json
    └── ...
```

每个检查点包含:

- 时间戳
- 子任务 ID
- Git 提交(如果可用)
- 修改的文件
- 持续时间和尝试次数

---

## 与 Epic 5 的集成

构建恢复与恢复系统(Epic 5)集成:

| 组件                  | 用途                       |
| --------------------- | -------------------------- |
| `stuck-detector.js`   | 检测循环失败               |
| `recovery-tracker.js` | 跟踪尝试历史               |

当构建卡住(连续 3 次以上失败)时,系统会:

1. 根据错误模式生成建议
2. 创建通知以供人工审核
3. 将子任务标记为"卡住"

---

## 废弃构建检测

如果满足以下条件,构建将被标记为废弃:

- 状态为 `in_progress`
- 超过 1 小时无检查点(可配置)

检测和处理:

```bash
# 检查是否废弃
*build-status story-8.4  # 如果废弃会显示警告

# 清理
*build-cleanup story-8.4
```

---

## 编程式使用

```javascript
const { BuildStateManager, BuildStatus } = require('.aios-core/core/execution/build-state-manager');

// 创建管理器
const manager = new BuildStateManager('story-8.4', {
  planDir: './plan',
});

// 创建或加载状态
const state = manager.loadOrCreateState({ totalSubtasks: 10 });

// 开始子任务
manager.startSubtask('1.1', { phase: 'phase-1' });

// 完成子任务(自动检查点)
manager.completeSubtask('1.1', {
  duration: 5000,
  filesModified: ['src/file.js'],
});

// 记录失败
const result = manager.recordFailure('1.2', {
  error: 'TypeScript error',
  attempt: 1,
});

// 检查是否卡住
if (result.isStuck) {
  console.log('Suggestions:', result.suggestions);
}

// 恢复构建
const context = manager.resumeBuild();

// 获取状态
const status = manager.getStatus();
console.log(`Progress: ${status.progress.percentage}%`);
```

---

## 配置

默认配置可以覆盖:

```javascript
const manager = new BuildStateManager('story-8.4', {
  config: {
    maxIterations: 10,        // 每个子任务的最大尝试次数
    globalTimeout: 1800000,   // 30 分钟
    abandonedThreshold: 3600000, // 1 小时
    autoCheckpoint: true,     // 自动保存检查点
  },
});
```

---

## 故障排除

### "No build state found"

构建尚未开始。运行 `*build story-id` 以开始。

### "Build already completed"

无法恢复已完成的构建。如需要请启动新构建。

### "Worktree missing"

隔离的 worktree 已被删除。选项:

1. 重新创建 worktree 并恢复
2. 使用新构建重新开始

### 构建卡住

如果构建卡住(相同错误重复出现):

1. 检查通知中的建议
2. 查看尝试日志:`*build-log story-id`
3. 尝试不同的方法或升级处理

---

## 最佳实践

1. 在长时间构建期间**定期检查状态**
2. 调试失败时**查看日志**
3. **清理废弃的构建**以释放资源
4. **使用检查点** - 不要禁用自动检查点
5. **监控通知**以获取卡住警报

---

_Story 8.4 指南 - 构建恢复与恢复_
_Epic 8 的一部分 - 自主构建引擎_
