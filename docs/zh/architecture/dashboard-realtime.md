# AIOS Dashboard - 实时可观测性架构

> [EN](../../architecture/dashboard-realtime.md) | [PT](../../pt/architecture/dashboard-realtime.md) | [ES](../../es/architecture/dashboard-realtime.md) | **ZH**

> **版本:** 1.0.0
> **日期:** 2026-01-29
> **状态:** 提案
> **作者:** @architect (Aria)
> **相关:** [dashboard-architecture.md](./dashboard-architecture.md)

---

## 目录

1. [概述](#概述)
2. [当前问题](#当前问题)
3. [提议的架构](#提议的架构)
4. [事件发射器 (CLI)](#事件发射器-cli)
5. [事件 Schema](#事件-schema)
6. [增强的 SSE 端点](#增强的-sse-端点)
7. [事件 Store](#事件-store)
8. [新 UI 组件](#新-ui-组件)
9. [完整数据流](#完整数据流)
10. [分阶段实施](#分阶段实施)

---

## 概述

本文档描述了 AIOS Dashboard **实时可观测性**的架构，允许用户以最大的视觉细节跟踪 CLI 中执行的命令。

### 主要用例

```
用户在 CLI 中执行命令 → Dashboard 实时显示所有内容
```

### 原则

1. **零配置** - CLI 和 Dashboard 同时活动时自动工作
2. **基于文件** - 通过文件系统通信（不需要额外服务器）
3. **仅追加事件** - 用于调试的不可变事件日志
4. **优雅降级** - Dashboard 在没有事件时也能工作（回退到轮询）

---

## 当前问题

### Dashboard 今天显示什么

| CLI 中的事件      | 当前 Dashboard              | 备注     |
| ---------------- | -------------------------- | -------- |
| `@agent` 激活    | ✅ 状态栏显示               | 正常工作 |
| `*exit` 代理     | ✅ 代理进入待机状态         | 正常工作 |
| Story 状态变更   | ⚠️ 看板更新                | 无通知   |

### Dashboard 不显示什么

| CLI 中的事件              | 当前 Dashboard |
| ------------------------ | -------------- |
| 命令 `*xxx` 正在执行      | ❌ 无          |
| Claude "思考中"           | ❌ 无          |
| 工具调用 (Read/Write/Bash) | ❌ 无          |
| 任务进度                  | ❌ 无          |
| Claude 输出               | ❌ 无          |
| git commit/push           | ❌ 无          |
| 错误                      | ❌ 无          |
| 任务完成                  | ❌ 无          |

### 视觉差距

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    流程: CLI → Dashboard 实时                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  您在 CLI 中                                 DASHBOARD                   │
│  ────────────                                ─────────                   │
│                                                                          │
│  @architect ─────────────────────────────▶ ✅ 代理激活显示               │
│  (激活代理)                                  (StatusBar + AgentMonitor)  │
│                                                                          │
│  *create-architecture ───────────────────▶ ❌ 不显示正在执行的命令       │
│  (执行任务)                                                              │
│                                                                          │
│  [Claude 思考中...] ─────────────────────▶ ❌ 不显示实时进度             │
│                                                                          │
│  [创建文件 X] ───────────────────────────▶ ❌ 不显示正在创建/编辑的文件  │
│  [编辑文件 Y]                                                            │
│                                                                          │
│  [Story 更新] ───────────────────────────▶ ⚠️ 部分 - 状态变更但无详情    │
│                                                                          │
│  [git commit] ───────────────────────────▶ ❌ 不显示实时提交             │
│                                                                          │
│  *exit ──────────────────────────────────▶ ✅ 代理进入待机               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 提议的架构

### 总体图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOS 代理                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Claude Code 会话                            │    │
│  │  @architect → *create-architecture → [思考中...] → [文件操作]    │    │
│  └────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                      │
│                                   │ 发射事件                             │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │               .aios/dashboard/events.jsonl (仅追加)              │    │
│  │  {"type":"agent:activated","agent":"architect","ts":"..."}      │    │
│  │  {"type":"command:start","cmd":"*create-architecture","ts":"..."}│   │
│  │  {"type":"command:complete","cmd":"*create","success":true,"ts":""}│ │
│  └────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                                    │ SSE 流
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DASHBOARD                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      /api/events (增强的 SSE)                     │  │
│  │  - 监视 events.jsonl 的变化                                       │  │
│  │  - 将新事件流式传输到连接的客户端                                  │  │
│  │  - 在内存中保持最近 N 个事件                                       │  │
│  └────────────────────────────┬──────────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         events-store (新增)                        │  │
│  │  - currentCommand: { name, startedAt, status }                    │  │
│  │  - recentEvents: Event[] (循环缓冲)                               │  │
│  │  - errors: Error[]                                                │  │
│  └────────────────────────────┬──────────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         UI 组件                                  │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │    │
│  │  │  CommandPanel   │  │  ActivityFeed   │  │ SessionIndicator│  │    │
│  │  │  ─────────────  │  │  ────────────   │  │ ───────────────  │  │   │
│  │  │ *create-arch    │  │ 02:45 命令完成  │  │ ● 会话活跃       │  │   │
│  │  │ ████████░░ 80%  │  │ 02:44 命令开始  │  │   5 分钟         │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 事件发射器 (CLI)

### 位置

```
.aios-core/core/events/dashboard-emitter.ts
```

### 接口

```typescript
// .aios-core/core/events/types.ts

/**
 * 仅高级事件 (决策 #2)
 * 专注于监控，而非调试
 */
export type DashboardEventType =
  // 代理生命周期
  | 'agent:activated'
  | 'agent:deactivated'

  // 命令执行
  | 'command:start'
  | 'command:complete'
  | 'command:error'

  // Story 更新
  | 'story:status-change'

  // 会话
  | 'session:start'
  | 'session:end';

export interface DashboardEvent {
  id: string; // UUID v4
  type: DashboardEventType;
  timestamp: string; // ISO 8601
  agentId?: string; // 事件发生时的活跃代理
  sessionId?: string; // 会话标识符
  data: Record<string, unknown>; // 事件特定的负载
}
```

---

## 事件 Schema

### 文件位置

```
.aios/dashboard/events.jsonl
```

### 格式

JSON Lines (JSONL) - 每行一个 JSON 对象，仅追加。

### 按类型的事件负载 (仅高级)

#### 代理事件

```jsonl
{"id":"uuid","type":"agent:activated","timestamp":"2026-01-29T14:30:00.000Z","sessionId":"uuid","data":{"agentId":"architect","agentName":"Aria"}}
{"id":"uuid","type":"agent:deactivated","timestamp":"2026-01-29T15:45:00.000Z","agentId":"architect","sessionId":"uuid","data":{"agentId":"architect"}}
```

#### 命令事件

```jsonl
{"id":"uuid","type":"command:start","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture"}}
{"id":"uuid","type":"command:complete","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture","success":true}}
{"id":"uuid","type":"command:error","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture","error":"读取配置文件失败"}}
```

#### Story 事件

```jsonl
{
  "id": "uuid",
  "type": "story:status-change",
  "timestamp": "...",
  "agentId": "architect",
  "data": {
    "storyId": "AIOS-123",
    "oldStatus": "in-progress",
    "newStatus": "review"
  }
}
```

#### 会话事件

```jsonl
{"id":"uuid","type":"session:start","timestamp":"...","data":{"sessionId":"uuid"}}
{"id":"uuid","type":"session:end","timestamp":"...","data":{"sessionId":"uuid"}}
```

### 文件轮转

当 `events.jsonl` 超过 10MB 时:

1. 重命名为 `events.{timestamp}.jsonl`
2. 创建新的 `events.jsonl`
3. 保留最近 5 个轮转文件

---

## 新 UI 组件

### 需要的组件 (仅高级)

| 组件                | 职责                  | 优先级 |
| ------------------- | --------------------- | ------ |
| `CommandPanel`      | 显示当前命令和状态     | P0     |
| `ActivityFeed`      | 最近事件时间线         | P0     |
| `SessionIndicator`  | 活跃会话状态           | P1     |
| `RetentionSettings` | 事件保留配置           | P2     |

### CommandPanel

```typescript
// apps/dashboard/src/components/realtime/CommandPanel.tsx

'use client';

import { useEventsStore, selectCurrentCommand } from '@/stores/events-store';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle, Terminal } from 'lucide-react';

export function CommandPanel() {
  const currentCommand = useEventsStore(selectCurrentCommand);
  const [elapsed, setElapsed] = useState(0);

  // ... 实现细节
}
```

### ActivityFeed

```typescript
// apps/dashboard/src/components/realtime/ActivityFeed.tsx

'use client';

import { useEventsStore, selectRecentEvents } from '@/stores/events-store';

// 仅高级事件 (决策 #2)
const EVENT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  'agent:activated': { icon: User, color: 'text-purple-400', label: '代理已激活' },
  'agent:deactivated': { icon: User, color: 'text-gray-400', label: '代理已停用' },
  'command:start': { icon: Terminal, color: 'text-blue-400', label: '命令' },
  'command:complete': { icon: Terminal, color: 'text-green-400', label: '命令完成' },
  'command:error': { icon: AlertCircle, color: 'text-red-400', label: '错误' },
  'story:status-change': { icon: Kanban, color: 'text-orange-400', label: 'Story' },
  'session:start': { icon: Play, color: 'text-green-400', label: '会话开始' },
  'session:end': { icon: Square, color: 'text-gray-400', label: '会话结束' },
};
```

---

## 分阶段实施 (简化)

### 第一阶段: 基础 (P0)

| 项目                        | 描述                    | 工作量 |
| --------------------------- | ----------------------- | ------ |
| Claude Code Hooks 集成      | 连接到原生 hooks        | 2h     |
| events.jsonl                | 高级格式                | 1h     |
| 增强的 SSE                  | 监视 events.jsonl       | 2h     |
| events-store                | 简化的 Store            | 1h     |

**交付物:** 高级事件从 CLI 流向 Dashboard

### 第二阶段: 核心 UI (P1)

| 项目                | 描述                  | 工作量 |
| ------------------- | --------------------- | ------ |
| CommandPanel        | 当前命令 + 状态       | 1h     |
| ActivityFeed        | 简化的时间线          | 1h     |
| SessionIndicator    | 会话状态              | 30min  |
| StatusBar 集成      | 集成新指标            | 1h     |

**交付物:** Dashboard 实时显示高级活动

### 第三阶段: 配置 (P2)

| 项目                   | 描述                          | 工作量 |
| ---------------------- | ----------------------------- | ------ |
| RetentionSettings UI   | 切换 session/hours/persistent | 1h     |
| Settings 集成          | 偏好持久化                    | 1h     |
| localStorage/IndexedDB | 实现保留模式                  | 2h     |

**交付物:** 用户可配置的事件保留

---

## 已做出的决策

### 1. 事件来源 ✅

**决策:** Claude Code Hooks

| 方面     | 详情                                |
| -------- | ----------------------------------- |
| 实现     | 使用 Claude Code 的原生 hooks       |
| 优势     | 自动、完整、无需额外包装器          |
| 依赖     | Claude Code hooks API               |

### 2. 详细程度 ✅

**决策:** 仅高级

| 包含的事件                     | 排除的事件                    |
| ------------------------------ | ----------------------------- |
| `agent:activated/deactivated`  | `tool:call` (Read/Write/Bash) |
| `command:start/complete/error` | `file:read/write/create`      |
| `session:start/end`            | `llm:thinking/responding`     |
| `story:status-change`          | 输出流                        |

**理由:** 专注于监控而非调试。更少的数据量，更好的性能。

### 3. 事件保留 ✅

**决策:** 用户可配置

```typescript
interface EventRetentionSettings {
  mode: 'session' | 'hours' | 'persistent';
  hoursToKeep?: number; // 当 mode = 'hours'
  maxEvents?: number; // 任何模式下的最大限制
}

// 默认值
const DEFAULT_RETENTION: EventRetentionSettings = {
  mode: 'session',
  hoursToKeep: 24,
  maxEvents: 1000,
};
```

| 模式         | 行为                    | 存储         |
| ------------ | ----------------------- | ------------ |
| `session`    | 关闭 dashboard 时清除   | 内存         |
| `hours`      | 保留最近 N 小时         | localStorage |
| `persistent` | 保留到达限制            | IndexedDB    |

**UI:** 在 Settings → Events → Retention 中切换

---

_文档由 @architect (Aria) 生成 - AIOS Core v2.0_
