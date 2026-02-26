# AIOS Dashboard - 完整架构

> **版本:** 2.0.0
> **日期:** 2026-01-29
> **状态:** 生产环境
> **作者:** @architect (Aria)

---

> [EN](../../architecture/dashboard-architecture.md) | [PT](../../pt/architecture/dashboard-architecture.md) | [ES](../../es/architecture/dashboard-architecture.md) | **ZH**

---

## 目录

1. [概述](#概述)
2. [技术栈](#技术栈)
3. [目录结构](#目录结构)
4. [组件架构](#组件架构)
5. [状态管理系统](#状态管理系统)
6. [API 和通信](#api-和通信)
7. [设计系统](#设计系统)
8. [数据流](#数据流)
9. [模式和规范](#模式和规范)
10. [可扩展性](#可扩展性)

### 相关文档

| 文档                                              | 描述                                         |
| ------------------------------------------------ | -------------------------------------------- |
| [dashboard-realtime.md](./dashboard-realtime.md) | 实时可观测性架构 (CLI → Dashboard)            |

---

## 概述

AIOS Dashboard 是一个 Next.js Web 应用程序，提供可视化界面来监控和管理 AIOS 系统。它通过文件系统中的状态文件和服务器发送事件 (SSE) 与 CLI/AIOS 通信。

### 架构原则

1. **CLI 优先**: Dashboard 是 CLI 的补充，而非替代品
2. **基于文件的通信**: 通过 `.aios/dashboard/status.json` 进行状态传递
3. **实时更新**: SSE 与轮询回退
4. **离线能力**: 开发环境中可使用模拟数据
5. **类型安全**: 全栈 TypeScript

### 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AIOS DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         表示层                                    │   │
│  │  ┌─────────┐ ┌──────────────────────────────────────────────┐    │   │
│  │  │ 侧边栏   │ │               主内容区                        │    │   │
│  │  │         │ │  ┌────────────────────────────────────────┐  │    │   │
│  │  │ 看板    │ │  │           项目标签页                    │  │    │   │
│  │  │ 代理    │ │  ├────────────────────────────────────────┤  │    │   │
│  │  │ 终端    │ │  │                                        │  │    │   │
│  │  │ 洞察    │ │  │    页面内容 (看板、代理监控、          │  │    │   │
│  │  │ 上下文  │ │  │    终端网格等)                          │  │    │   │
│  │  │ 路线图  │ │  │                                        │  │    │   │
│  │  │ GitHub  │ │  └────────────────────────────────────────┘  │    │   │
│  │  │ 设置    │ │                                              │    │   │
│  │  └─────────┘ └──────────────────────────────────────────────┘    │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │                      状态栏                                │   │   │
│  │  │  [连接] [速率限制] [Claude]    [@agent] [通知]             │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         状态层 (Zustand)                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  story   │ │  agent   │ │ terminal │ │    ui    │ │settings│ │   │
│  │  │  store   │ │  store   │ │  store   │ │  store   │ │ store  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         数据层 (SWR + Hooks)                     │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐│   │
│  │  │  useStories()  │ │  useAgents()   │ │  useRealtimeStatus()   ││   │
│  │  │  useAiosStatus │ │                │ │  (SSE + 轮询)          ││   │
│  │  └────────────────┘ └────────────────┘ └────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API 层 (Next.js 路由)                    │   │
│  │  /api/stories  │  /api/status  │  /api/events  │  /api/github    │   │
│  │      (CRUD)    │   (轮询)      │    (SSE)      │   (webhook)     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ 文件 I/O + SSE
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              文件系统                                    │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ .aios/dashboard/         │  │ docs/stories/                        │ │
│  │   status.json (CLI→UI)   │  │   *.md (Stories Markdown)            │ │
│  └──────────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ 写入
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOS 代理                                  │
│  @dev │ @qa │ @architect │ @pm │ @po │ @analyst │ @devops               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 技术栈

### 主框架

| 技术           | 版本   | 用途                           |
| -------------- | ------ | ------------------------------ |
| **Next.js**    | 16.1.6 | 使用 App Router 的全栈框架      |
| **React**      | 19.2.3 | 带服务器组件的 UI 库            |
| **TypeScript** | 5.x    | 全代码库类型安全                |

### 状态管理

| 技术        | 版本   | 用途                    |
| ----------- | ------ | ----------------------- |
| **Zustand** | 5.0.10 | 带持久化的全局状态       |
| **SWR**     | 2.3.8  | 数据获取和缓存          |

### UI 和样式

| 技术             | 版本    | 用途                                  |
| ---------------- | ------- | ------------------------------------- |
| **Tailwind CSS** | 4.x     | 实用优先的 CSS                        |
| **Radix UI**     | latest  | 可访问的原语 (Dialog, Context Menu)   |
| **Lucide React** | 0.563.0 | SVG 图标系统                          |
| **dnd-kit**      | 6.3.1   | 看板的拖放功能                        |

### 工具

| 技术               | 版本  | 用途                            |
| ------------------ | ----- | ------------------------------- |
| **gray-matter**    | 4.0.3 | 解析 Markdown 中的 YAML frontmatter |
| **clsx**           | 2.1.1 | 条件类名                        |
| **tailwind-merge** | 3.4.0 | 合并 Tailwind 类                |

---

## 目录结构

```
apps/dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Dashboard 路由组
│   │   │   ├── layout.tsx            # Dashboard 布局 (AppShell)
│   │   │   ├── agents/page.tsx       # 代理监控页面
│   │   │   ├── github/page.tsx       # GitHub 集成
│   │   │   ├── kanban/page.tsx       # Story 看板
│   │   │   ├── settings/page.tsx     # 设置面板
│   │   │   └── terminals/page.tsx    # 终端会话
│   │   ├── api/                      # API 路由
│   │   │   ├── events/route.ts       # SSE 端点
│   │   │   ├── github/route.ts       # GitHub API 代理
│   │   │   ├── logs/route.ts         # 日志流
│   │   │   ├── qa/metrics/route.ts   # QA 指标
│   │   │   ├── status/route.ts       # AIOS 状态轮询
│   │   │   └── stories/              # Stories CRUD
│   │   │       ├── route.ts          # GET/POST /api/stories
│   │   │       └── [id]/route.ts     # GET/PUT/DELETE /api/stories/:id
│   │   ├── globals.css               # 设计令牌 + 工具类
│   │   ├── layout.tsx                # 根布局
│   │   └── page.tsx                  # 根重定向
│   │
│   ├── components/                   # React 组件
│   │   ├── agents/                   # 代理相关
│   │   ├── context/                  # 上下文面板
│   │   ├── github/                   # GitHub 集成
│   │   ├── insights/                 # 分析/洞察
│   │   ├── kanban/                   # 看板
│   │   ├── layout/                   # 布局组件
│   │   ├── qa/                       # QA 组件
│   │   ├── roadmap/                  # 路线图视图
│   │   ├── settings/                 # 设置
│   │   ├── stories/                  # Story 组件
│   │   ├── terminal/                 # 终端输出
│   │   ├── terminals/                # 终端会话网格
│   │   └── ui/                       # 基础 UI 组件
│   │
│   ├── hooks/                        # 自定义 React hooks
│   ├── lib/                          # 工具
│   ├── stores/                       # Zustand stores
│   └── types/                        # TypeScript 类型
│
├── components.json                   # shadcn/ui 配置
├── next-env.d.ts                     # Next.js 类型
├── next.config.ts                    # Next.js 配置
├── package.json                      # 依赖
├── tailwind.config.ts                # Tailwind 配置
└── tsconfig.json                     # TypeScript 配置
```

---

## 组件架构

### 组件层次结构

```
<RootLayout>                          # src/app/layout.tsx
  └── <DashboardLayout>               # src/app/(dashboard)/layout.tsx
        └── <AppShell>                # 主包装器
              ├── <Sidebar>           # 侧边导航
              │     └── <SidebarNavItem>[]
              │
              ├── <Main>              # 内容区域
              │     ├── <ProjectTabs> # 项目标签
              │     └── {children}    # 页面内容
              │
              └── <StatusBar>         # 状态栏
                    ├── <StatusIndicator>
                    ├── <RateLimitDisplay>
                    ├── <ActiveAgentBadge>
                    └── <NotificationBadge>
```

### 主要组件

#### AppShell

```typescript
// 职责:
// - 主布局 (侧边栏 + 内容 + 状态栏)
// - 全局键盘快捷键 ([ 切换侧边栏)
// - 防止 Hydration 不匹配

interface AppShellProps {
  children: React.ReactNode;
}
```

#### KanbanBoard

```typescript
// 职责:
// - 渲染状态列
// - 列间拖放
// - 管理模态框 (创建/编辑 story)

interface KanbanBoardProps {
  onStoryClick?: (story: Story) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}
```

#### AgentMonitor

```typescript
// 职责:
// - 活跃/空闲代理网格
// - 自动刷新切换 (实时/暂停)
// - 轮询状态指示器
```

---

## 状态管理系统

### Store 架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ZUSTAND STORES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        story-store                               │    │
│  │  状态:                                                           │    │
│  │    - stories: Record<string, Story>                             │    │
│  │    - storyOrder: Record<StoryStatus, string[]>  ← 持久化        │    │
│  │    - isLoading, error                                           │    │
│  │  操作:                                                           │    │
│  │    - setStories(), addStory(), updateStory(), deleteStory()     │    │
│  │    - moveStory(), reorderInColumn()                             │    │
│  │  选择器:                                                         │    │
│  │    - getStoriesByStatus(), getStoryById(), getEpics()           │    │
│  │  特性:                                                           │    │
│  │    - 竞态条件保护 (operationsInProgress)                         │    │
│  │    - 状态变更监听器 (发布/订阅模式)                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        agent-store                               │    │
│  │  状态:                                                           │    │
│  │    - agents: Record<AgentId, Agent>                             │    │
│  │    - activeAgentId: AgentId | null                              │    │
│  │    - pollingInterval, isPolling, lastPolledAt                   │    │
│  │  操作:                                                           │    │
│  │    - setActiveAgent(), clearActiveAgent(), updateAgent()        │    │
│  │    - handleRealtimeUpdate()  ← SSE 处理器                       │    │
│  │  选择器:                                                         │    │
│  │    - getActiveAgents(), getIdleAgents(), getAgentById()         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 持久化

| Store            | localStorage Key          | 持久化内容                     |
| ---------------- | ------------------------- | ------------------------------ |
| `story-store`    | `aios-stories`            | `storyOrder` (列顺序)          |
| `ui-store`       | `aios-ui`                 | `sidebarCollapsed`, `activeView` |
| `projects-store` | `aios-projects`           | `projects`, `activeProjectId`  |
| `settings-store` | `aios-dashboard-settings` | 整个 `settings` 对象           |

---

## API 和通信

### 端点

#### GET /api/status

```typescript
// 返回 AIOS 当前状态
// 读取自: .aios/dashboard/status.json

interface AiosStatus {
  version: string;
  updatedAt: string;
  connected: boolean;
  project: { name: string; path: string } | null;
  activeAgent: {
    id: AgentId;
    name: string;
    activatedAt: string;
    currentStory?: string;
  } | null;
  session: {
    startedAt: string;
    commandsExecuted: number;
    lastCommand?: string;
  } | null;
  stories: {
    inProgress: string[];
    completed: string[];
  };
  rateLimit?: {
    used: number;
    limit: number;
    resetsAt?: string;
  };
}
```

#### GET /api/events (SSE)

```typescript
// 实时更新的服务器发送事件
// 事件:
//   - status:update     → AiosStatus
//   - connection:status → { connected: boolean }
//   - heartbeat         → { alive: true }
//   - error             → { message: string }

interface SSEEvent {
  type: 'status:update' | 'connection:status' | 'heartbeat' | 'error';
  data: unknown;
  timestamp: string;
}
```

### CLI ↔ Dashboard 通信

```
┌─────────────┐                              ┌──────────────────┐
│   CLI/AIOS  │                              │    Dashboard     │
│   (Claude)  │                              │    (Next.js)     │
└──────┬──────┘                              └────────┬─────────┘
       │                                              │
       │  1. 代理激活                                  │
       │  ─────────────────────────────────────────▶  │
       │     写入 .aios/dashboard/status.json         │
       │                                              │
       │                                              │ 2. Dashboard 检测
       │                                              │    (SSE 轮询 2s)
       │                                              │
       │                                              │ 3. UI 更新
       │                                              │    (实时)
       │                                              │
       │  4. Story 状态变更                            │
       │  ─────────────────────────────────────────▶  │
       │     写入 status.json                         │
       │                                              │
       │                                              │ 5. 看板更新
       │                                              │    卡片位置
       │                                              │
       │  6. 代理退出                                  │
       │  ─────────────────────────────────────────▶  │
       │     status.json: activeAgent = null          │
       │                                              │
       │                                              │ 7. 代理进入
       │                                              │    "待机" 状态
       │                                              │
```

---

## 设计系统

### 设计令牌

Dashboard 使用在 `globals.css` 中定义的自定义 CSS 设计令牌系统:

#### 背景颜色

```css
--bg-base: #000000; /* 主背景 */
--bg-elevated: #050505; /* 侧边栏、模态框 */
--bg-surface: #0a0a0a; /* 卡片 */
--bg-surface-hover: #0f0f0f;
```

#### 文本层次 (WCAG AA)

```css
--text-primary: #fafaf8; /* 19.5:1 对比度 */
--text-secondary: #b8b8ac; /* 8.2:1 对比度 */
--text-tertiary: #8a8a7f; /* 4.8:1 对比度 */
--text-muted: #6a6a5e; /* 3.2:1 - 装饰性 */
--text-disabled: #3a3a32; /* 禁用状态 */
```

#### 代理颜色系统

```css
--agent-dev: #22c55e; /* 绿色 */
--agent-qa: #eab308; /* 黄色 */
--agent-architect: #8b5cf6; /* 紫色 */
--agent-pm: #3b82f6; /* 蓝色 */
--agent-po: #f97316; /* 橙色 */
--agent-analyst: #06b6d4; /* 青色 */
--agent-devops: #ec4899; /* 粉色 */
```

#### 状态颜色

```css
--status-success: #4ade80;
--status-warning: #fbbf24;
--status-error: #f87171;
--status-info: #60a5fa;
--status-idle: #4a4a42;
```

---

## 数据流

### Story 生命周期

```
                    ┌─────────────────────────────────────────────────────┐
                    │               STORY 生命周期                         │
                    └─────────────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              ┌──────────┐          ┌──────────┐          ┌──────────┐
              │ 创建     │          │ 更新     │          │ 删除     │
              └────┬─────┘          └────┬─────┘          └────┬─────┘
                   │                     │                     │
                   ▼                     ▼                     ▼
         ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
         │ StoryCreateModal │   │ StoryEditModal  │   │ 确认对话框      │
         │  onCreated()     │   │  onUpdated()    │   │  onDeleted()    │
         └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
                  │                     │                     │
                  └──────────┬──────────┴──────────┬──────────┘
                             │                     │
                             ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │  story-store    │   │  /api/stories   │
                    │  addStory()     │   │  POST/PUT/DELETE│
                    │  updateStory()  │   │                 │
                    │  deleteStory()  │   └────────┬────────┘
                    └────────┬────────┘            │
                             │                     │
                             │                     ▼
                             │            ┌─────────────────┐
                             │            │ docs/stories/   │
                             │            │   *.md 文件     │
                             │            └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  KanbanBoard    │
                    │  重新渲染       │
                    └─────────────────┘
```

---

## 模式和规范

### 命名规范

| 类型        | 模式                    | 示例                     |
| ----------- | ----------------------- | ------------------------ |
| 组件        | PascalCase              | `StoryCard.tsx`          |
| Hooks       | camelCase 带 `use`      | `useStories.ts`          |
| Stores      | kebab-case 带 `-store`  | `story-store.ts`         |
| 类型        | PascalCase              | `StoryStatus`            |
| CSS 类      | kebab-case              | `card-refined`           |
| 文件        | kebab-case              | `use-realtime-status.ts` |

---

## 可扩展性

### 添加新视图

1. **创建页面**: `src/app/(dashboard)/new-view/page.tsx`
2. **创建组件**: `src/components/new-view/NewViewPanel.tsx`
3. **添加到侧边栏**: `src/types/index.ts` → `SidebarView` 和 `SIDEBAR_ITEMS`
4. **创建 store (如需要)**: `src/stores/new-view-store.ts`

### 添加新代理

1. **添加类型**: `src/types/index.ts` → `AgentId`
2. **添加配置**: `src/types/index.ts` → `AGENT_CONFIG`
3. **添加颜色**: `src/app/globals.css` → `--agent-{id}`
4. **添加模拟数据**: `src/lib/mock-data.ts` → `MOCK_AGENTS`

---

## 后续步骤 (路线图)

> 详细的实时架构请参阅 [dashboard-realtime.md](./dashboard-realtime.md)

### 高优先级

- [ ] **实时可观测性** - CLI → Dashboard 实时连接 ([架构](./dashboard-realtime.md))
- [ ] **后台任务 UI** - 可视化 ADE 任务执行
- [ ] **动态状态系统** - 按项目可定制的状态
- [ ] **多文件差异视图** - 审批前查看变更

### 中优先级

- [ ] **权限模式 UI** - 可视化权限切换
- [ ] **通知系统** - 事件 Toast 通知
- [ ] **终端流** - 代理实时输出

### 低优先级

- [ ] **Worktrees 视图** - 管理 git worktrees
- [ ] **创意面板** - 开发过程中捕获创意
- [ ] **导出/导入** - 配置备份

---

_文档由 @architect (Aria) 生成 - AIOS Core v2.0_
