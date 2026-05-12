# 🏛️ AIOX Dashboard - Arquitetura Completa

> **Versão:** 2.0.0
> **Data:** 2026-01-29
> **Status:** Produção
> **Autor:** @architect (Aria)

---

> **PT** | [EN](../../architecture/dashboard-architecture.md) | [ES](../architecture/dashboard-architecture.md)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Arquitetura de Componentes](#arquitetura-de-componentes)
5. [Sistema de State Management](#sistema-de-state-management)
6. [APIs e Comunicação](#apis-e-comunicação)
7. [Design System](#design-system)
8. [Fluxo de Dados](#fluxo-de-dados)
9. [Padrões e Convenções](#padrões-e-convenções)
10. [Extensibilidade](#extensibilidade)

### 📚 Documentos Relacionados

| Documento                                        | Descrição                                                |
| ------------------------------------------------ | -------------------------------------------------------- |
| [dashboard-realtime.md](./dashboard-realtime.md) | Arquitetura de Real-Time Observability (CLI → Dashboard) |

---

## Visão Geral

O AIOX Dashboard é uma aplicação web Next.js que fornece uma interface visual para monitorar e gerenciar o sistema AIOX. Ele se comunica com o CLI/AIOX através de arquivos de status no filesystem e Server-Sent Events (SSE).

### Princípios Arquiteturais

1. **CLI-First**: Dashboard é complementar ao CLI, não substituto
2. **File-Based Communication**: Status via `.aiox/dashboard/status.json`
3. **Real-Time Updates**: SSE com fallback para polling
4. **Offline-Capable**: Funciona com dados mock em desenvolvimento
5. **Type-Safe**: TypeScript em toda a stack

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AIOX DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         PRESENTATION LAYER                        │   │
│  │  ┌─────────┐ ┌──────────────────────────────────────────────┐    │   │
│  │  │ Sidebar │ │               Main Content                    │    │   │
│  │  │         │ │  ┌────────────────────────────────────────┐  │    │   │
│  │  │ Kanban  │ │  │           ProjectTabs                  │  │    │   │
│  │  │ Agents  │ │  ├────────────────────────────────────────┤  │    │   │
│  │  │ Termnls │ │  │                                        │  │    │   │
│  │  │ Insight │ │  │    Page Content (KanbanBoard,          │  │    │   │
│  │  │ Context │ │  │    AgentMonitor, TerminalGrid, etc)    │  │    │   │
│  │  │ Roadmap │ │  │                                        │  │    │   │
│  │  │ GitHub  │ │  └────────────────────────────────────────┘  │    │   │
│  │  │ Settngs │ │                                              │    │   │
│  │  └─────────┘ └──────────────────────────────────────────────┘    │   │
│  │  ┌───────────────────────────────────────────────────────────┐   │   │
│  │  │                      StatusBar                             │   │   │
│  │  │  [Connection] [Rate Limit] [Claude]    [@agent] [Notifs]  │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         STATE LAYER (Zustand)                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  story   │ │  agent   │ │ terminal │ │    ui    │ │settings│ │   │
│  │  │  store   │ │  store   │ │  store   │ │  store   │ │ store  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER (SWR + Hooks)                  │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐│   │
│  │  │  useStories()  │ │  useAgents()   │ │  useRealtimeStatus()   ││   │
│  │  │  useAioxStatus │ │                │ │  (SSE + Polling)       ││   │
│  │  └────────────────┘ └────────────────┘ └────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API LAYER (Next.js Routes)                │   │
│  │  /api/stories  │  /api/status  │  /api/events  │  /api/github    │   │
│  │      (CRUD)    │   (polling)   │    (SSE)      │   (webhook)     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ File I/O + SSE
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              FILESYSTEM                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ .aiox/dashboard/         │  │ docs/stories/                        │ │
│  │   status.json (CLI→UI)   │  │   *.md (Stories Markdown)            │ │
│  └──────────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ Write
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOX AGENTS                                │
│  @dev │ @qa │ @architect │ @pm │ @po │ @analyst │ @devops               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Framework Principal

| Tecnologia     | Versão | Propósito                           |
| -------------- | ------ | ----------------------------------- |
| **Next.js**    | 16.1.6 | Framework full-stack com App Router |
| **React**      | 19.2.3 | UI library com Server Components    |
| **TypeScript** | 5.x    | Type safety em toda a codebase      |

### Gerenciamento de Estado

| Tecnologia  | Versão | Propósito                     |
| ----------- | ------ | ----------------------------- |
| **Zustand** | 5.0.10 | Global state com persistência |
| **SWR**     | 2.3.8  | Data fetching e cache         |

### UI e Estilos

| Tecnologia       | Versão  | Propósito                                    |
| ---------------- | ------- | -------------------------------------------- |
| **Tailwind CSS** | 4.x     | Utility-first CSS                            |
| **Radix UI**     | latest  | Primitivos acessíveis (Dialog, Context Menu) |
| **Lucide React** | 0.563.0 | Sistema de ícones SVG                        |
| **dnd-kit**      | 6.3.1   | Drag and drop para Kanban                    |

### Utilitários

| Tecnologia         | Versão | Propósito                             |
| ------------------ | ------ | ------------------------------------- |
| **gray-matter**    | 4.0.3  | Parse de frontmatter YAML em Markdown |
| **clsx**           | 2.1.1  | Conditional class names               |
| **tailwind-merge** | 3.4.0  | Merge de classes Tailwind             |

---

## Estrutura de Diretórios

```
apps/dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Dashboard route group
│   │   │   ├── layout.tsx            # Dashboard layout (AppShell)
│   │   │   ├── agents/page.tsx       # Agent monitor page
│   │   │   ├── github/page.tsx       # GitHub integration
│   │   │   ├── kanban/page.tsx       # Story board
│   │   │   ├── settings/page.tsx     # Settings panel
│   │   │   └── terminals/page.tsx    # Terminal sessions
│   │   ├── api/                      # API routes
│   │   │   ├── events/route.ts       # SSE endpoint
│   │   │   ├── github/route.ts       # GitHub API proxy
│   │   │   ├── logs/route.ts         # Log streaming
│   │   │   ├── qa/metrics/route.ts   # QA metrics
│   │   │   ├── status/route.ts       # AIOX status polling
│   │   │   └── stories/              # Stories CRUD
│   │   │       ├── route.ts          # GET/POST /api/stories
│   │   │       └── [id]/route.ts     # GET/PUT/DELETE /api/stories/:id
│   │   ├── globals.css               # Design tokens + utilities
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Root redirect
│   │
│   ├── components/                   # React components
│   │   ├── agents/                   # Agent-related
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentMonitor.tsx
│   │   │   └── index.ts
│   │   ├── context/                  # Context panel
│   │   │   ├── ContextPanel.tsx
│   │   │   └── index.ts
│   │   ├── github/                   # GitHub integration
│   │   │   ├── GitHubPanel.tsx
│   │   │   └── index.ts
│   │   ├── insights/                 # Analytics/insights
│   │   │   ├── InsightsPanel.tsx
│   │   │   └── index.ts
│   │   ├── kanban/                   # Kanban board
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── SortableStoryCard.tsx
│   │   │   └── index.ts
│   │   ├── layout/                   # Layout components
│   │   │   ├── AppShell.tsx
│   │   │   ├── ProjectTabs.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── index.ts
│   │   ├── qa/                       # QA components
│   │   │   └── QAMetricsPanel.tsx
│   │   ├── roadmap/                  # Roadmap view
│   │   │   ├── RoadmapCard.tsx
│   │   │   ├── RoadmapView.tsx
│   │   │   └── index.ts
│   │   ├── settings/                 # Settings
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── index.ts
│   │   ├── stories/                  # Story components
│   │   │   ├── StoryCard.tsx
│   │   │   ├── StoryCreateModal.tsx
│   │   │   ├── StoryDetailModal.tsx
│   │   │   ├── StoryEditModal.tsx
│   │   │   └── index.ts
│   │   ├── terminal/                 # Terminal output
│   │   │   ├── TerminalOutput.tsx
│   │   │   └── index.ts
│   │   ├── terminals/                # Terminal sessions grid
│   │   │   ├── TerminalCard.tsx
│   │   │   ├── TerminalGrid.tsx
│   │   │   ├── TerminalOutput.tsx
│   │   │   ├── TerminalStream.tsx
│   │   │   └── index.ts
│   │   └── ui/                       # Base UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── fab.tsx
│   │       ├── icon.tsx
│   │       ├── progress-bar.tsx
│   │       ├── section-label.tsx
│   │       ├── skeleton.tsx
│   │       ├── status-badge.tsx
│   │       ├── status-dot.tsx
│   │       └── tag.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── index.ts
│   │   ├── use-agents.ts             # Agent data + polling
│   │   ├── use-aiox-status.ts        # Status with SWR
│   │   ├── use-realtime-status.ts    # SSE connection
│   │   └── use-stories.ts            # Stories data fetching
│   │
│   ├── lib/                          # Utilities
│   │   ├── icons.ts                  # Icon system (lucide mapping)
│   │   ├── mock-data.ts              # Mock data for dev/demo
│   │   └── utils.ts                  # cn(), formatDate(), etc.
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── agent-store.ts            # Agent state
│   │   ├── index.ts
│   │   ├── projects-store.ts         # Multi-project tabs
│   │   ├── settings-store.ts         # User settings
│   │   ├── story-store.ts            # Stories + Kanban order
│   │   ├── terminal-store.ts         # Terminal sessions
│   │   └── ui-store.ts               # UI state (sidebar, view)
│   │
│   └── types/                        # TypeScript types
│       └── index.ts                  # All shared types
│
├── components.json                   # shadcn/ui config
├── next-env.d.ts                     # Next.js types
├── next.config.ts                    # Next.js config
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind config (if used)
└── tsconfig.json                     # TypeScript config
```

---

## Arquitetura de Componentes

### Hierarquia de Componentes

```
<RootLayout>                          # src/app/layout.tsx
  └── <DashboardLayout>               # src/app/(dashboard)/layout.tsx
        └── <AppShell>                # Wrapper principal
              ├── <Sidebar>           # Navegação lateral
              │     └── <SidebarNavItem>[]
              │
              ├── <Main>              # Área de conteúdo
              │     ├── <ProjectTabs> # Tabs de projetos
              │     └── {children}    # Conteúdo da página
              │
              └── <StatusBar>         # Barra de status
                    ├── <StatusIndicator>
                    ├── <RateLimitDisplay>
                    ├── <ActiveAgentBadge>
                    └── <NotificationBadge>
```

### Componentes Principais

#### AppShell

```typescript
// Responsabilidades:
// - Layout master (sidebar + content + statusbar)
// - Keyboard shortcuts globais ([ para toggle sidebar)
// - Hydration mismatch prevention

interface AppShellProps {
  children: React.ReactNode;
}
```

#### KanbanBoard

```typescript
// Responsabilidades:
// - Renderizar colunas de status
// - Drag & drop entre colunas
// - Gerenciar modais (create/edit story)

interface KanbanBoardProps {
  onStoryClick?: (story: Story) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}
```

#### AgentMonitor

```typescript
// Responsabilidades:
// - Grid de agentes ativos/idle
// - Auto-refresh toggle (Live/Paused)
// - Polling status indicator
```

---

## Sistema de State Management

### Arquitetura de Stores

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ZUSTAND STORES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        story-store                               │    │
│  │  State:                                                          │    │
│  │    - stories: Record<string, Story>                             │    │
│  │    - storyOrder: Record<StoryStatus, string[]>  ← PERSISTED     │    │
│  │    - isLoading, error                                           │    │
│  │  Actions:                                                        │    │
│  │    - setStories(), addStory(), updateStory(), deleteStory()     │    │
│  │    - moveStory(), reorderInColumn()                             │    │
│  │  Selectors:                                                      │    │
│  │    - getStoriesByStatus(), getStoryById(), getEpics()           │    │
│  │  Features:                                                       │    │
│  │    - Race condition protection (operationsInProgress)            │    │
│  │    - Status change listeners (pub/sub pattern)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        agent-store                               │    │
│  │  State:                                                          │    │
│  │    - agents: Record<AgentId, Agent>                             │    │
│  │    - activeAgentId: AgentId | null                              │    │
│  │    - pollingInterval, isPolling, lastPolledAt                   │    │
│  │  Actions:                                                        │    │
│  │    - setActiveAgent(), clearActiveAgent(), updateAgent()        │    │
│  │    - handleRealtimeUpdate()  ← SSE handler                      │    │
│  │  Selectors:                                                      │    │
│  │    - getActiveAgents(), getIdleAgents(), getAgentById()         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        ui-store                                  │    │
│  │  State:  (PERSISTED)                                            │    │
│  │    - sidebarCollapsed: boolean                                  │    │
│  │    - activeView: SidebarView                                    │    │
│  │  Actions:                                                        │    │
│  │    - toggleSidebar(), setSidebarCollapsed(), setActiveView()    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        projects-store                            │    │
│  │  State:  (PERSISTED)                                            │    │
│  │    - projects: Project[]                                        │    │
│  │    - activeProjectId: string | null                             │    │
│  │  Actions:                                                        │    │
│  │    - addProject(), removeProject(), setActiveProject()          │    │
│  │    - reorderProjects(), closeOtherProjects(), closeAllProjects()│    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        settings-store                            │    │
│  │  State:  (PERSISTED)                                            │    │
│  │    - settings: DashboardSettings                                │    │
│  │      - theme: 'dark' | 'light' | 'system'                       │    │
│  │      - useMockData: boolean                                     │    │
│  │      - autoRefresh: boolean                                     │    │
│  │      - refreshInterval: number                                  │    │
│  │      - storiesPath: string                                      │    │
│  │      - agentColors: Record<string, string>                      │    │
│  │  Actions:                                                        │    │
│  │    - updateSettings(), setTheme(), resetToDefaults()            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        terminal-store                            │    │
│  │  State:                                                          │    │
│  │    - terminals: Record<string, Terminal>                        │    │
│  │    - activeTerminalId: string | null                            │    │
│  │  Actions:                                                        │    │
│  │    - createTerminal(), removeTerminal()                         │    │
│  │    - appendLine(), appendLines(), clearTerminal()               │    │
│  │    - setTerminalStatus()                                        │    │
│  │  Features:                                                       │    │
│  │    - Max lines buffer (default 1000)                            │    │
│  │    - Auto-trim when exceeds limit                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Persistência

| Store            | localStorage Key          | O que persiste                   |
| ---------------- | ------------------------- | -------------------------------- |
| `story-store`    | `aiox-stories`            | `storyOrder` (ordem das colunas) |
| `ui-store`       | `aiox-ui`                 | `sidebarCollapsed`, `activeView` |
| `projects-store` | `aiox-projects`           | `projects`, `activeProjectId`    |
| `settings-store` | `aiox-dashboard-settings` | Todo o objeto `settings`         |

### Padrão de Listeners

Os stores usam um padrão pub/sub para notificar mudanças:

```typescript
// Registrar listener (fora do componente React)
const unsubscribe = registerStoryStatusListener((storyId, oldStatus, newStatus) => {
  console.log(`Story ${storyId} moved from ${oldStatus} to ${newStatus}`);
});

// Cleanup
unsubscribe();
```

---

## APIs e Comunicação

### Endpoints

#### GET /api/status

```typescript
// Retorna status atual do AIOX
// Lê de: .aiox/dashboard/status.json

interface AioxStatus {
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
// Server-Sent Events para updates real-time
// Eventos:
//   - status:update     → AioxStatus
//   - connection:status → { connected: boolean }
//   - heartbeat         → { alive: true }
//   - error             → { message: string }

// Formato do evento:
interface SSEEvent {
  type: 'status:update' | 'connection:status' | 'heartbeat' | 'error';
  data: unknown;
  timestamp: string;
}
```

#### GET/POST /api/stories

```typescript
// GET: Lista todas as stories de docs/stories/
// POST: Cria nova story

interface StoriesResponse {
  stories: Story[];
  source: 'filesystem' | 'mock' | 'empty' | 'error';
  count?: number;
  message?: string;
}

interface CreateStoryRequest {
  title: string;
  description?: string;
  status?: StoryStatus;
  type?: StoryType;
  priority?: StoryPriority;
  complexity?: StoryComplexity;
  category?: StoryCategory;
  agent?: AgentId;
  epicId?: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string;
}
```

### Comunicação CLI ↔ Dashboard

```
┌─────────────┐                              ┌──────────────────┐
│   CLI/AIOX  │                              │    Dashboard     │
│   (Claude)  │                              │    (Next.js)     │
└──────┬──────┘                              └────────┬─────────┘
       │                                              │
       │  1. Agent ativado                            │
       │  ─────────────────────────────────────────▶  │
       │     Escreve .aiox/dashboard/status.json      │
       │                                              │
       │                                              │ 2. Dashboard detecta
       │                                              │    (SSE poll 2s)
       │                                              │
       │                                              │ 3. UI atualiza
       │                                              │    (real-time)
       │                                              │
       │  4. Story status muda                        │
       │  ─────────────────────────────────────────▶  │
       │     Escreve status.json                      │
       │                                              │
       │                                              │ 5. Kanban atualiza
       │                                              │    posição do card
       │                                              │
       │  6. Agent termina                            │
       │  ─────────────────────────────────────────▶  │
       │     status.json: activeAgent = null          │
       │                                              │
       │                                              │ 7. Agent vai para
       │                                              │    "Standby" no UI
       │                                              │
```

### Hooks de Data Fetching

#### useAioxStatus

```typescript
// SWR-based polling do status
const { status, isLoading, isConnected, statusError, mutate } = useAioxStatus({
  interval: 5000, // Poll every 5s
  paused: false, // Pausar polling
});
```

#### useRealtimeStatus

```typescript
// SSE connection com fallback para polling
const { status, isConnected, isRealtime, lastUpdate, reconnect } = useRealtimeStatus({
  enabled: true,
  fallbackInterval: 5000,
  maxReconnectAttempts: 3,
  onStatusUpdate: (status) => {
    /* ... */
  },
  onConnectionChange: (connected) => {
    /* ... */
  },
});
```

#### useStories

```typescript
// Stories com toggle mock/real
const { isLoading, isError, source, useMockData, refresh } = useStories({
  refreshInterval: 30000, // Auto-refresh every 30s
});
```

---

## Design System

### Design Tokens

O dashboard usa um sistema de design tokens CSS customizados definidos em `globals.css`:

#### Cores de Background

```css
--bg-base: #000000; /* Fundo principal */
--bg-elevated: #050505; /* Sidebar, modais */
--bg-surface: #0a0a0a; /* Cards */
--bg-surface-hover: #0f0f0f;
```

#### Hierarquia de Texto (WCAG AA)

```css
--text-primary: #fafaf8; /* 19.5:1 contrast */
--text-secondary: #b8b8ac; /* 8.2:1 contrast */
--text-tertiary: #8a8a7f; /* 4.8:1 contrast */
--text-muted: #6a6a5e; /* 3.2:1 - decorative */
--text-disabled: #3a3a32; /* Disabled state */
```

#### Sistema de Cores por Agente

```css
--agent-dev: #22c55e; /* Verde */
--agent-qa: #eab308; /* Amarelo */
--agent-architect: #8b5cf6; /* Roxo */
--agent-pm: #3b82f6; /* Azul */
--agent-po: #f97316; /* Laranja */
--agent-analyst: #06b6d4; /* Cyan */
--agent-devops: #ec4899; /* Pink */
```

#### Sistema de Accent Gold

```css
--accent-gold: #c9b298;
--accent-gold-light: #e4d8ca;
--accent-gold-bg: rgba(201, 178, 152, 0.08);
--border-gold: rgba(201, 178, 152, 0.25);
```

#### Status Colors

```css
--status-success: #4ade80;
--status-warning: #fbbf24;
--status-error: #f87171;
--status-info: #60a5fa;
--status-idle: #4a4a42;
```

### Sistema de Ícones

O dashboard usa `lucide-react` com um mapeamento centralizado em `src/lib/icons.ts`:

```typescript
import type { IconName } from '@/lib/icons';

// Uso em componentes:
const { iconMap } = require('@/lib/icons');
const IconComponent = iconMap['code']; // <Code /> do Lucide
```

Ícones disponíveis por categoria:

- **Navigation**: dashboard, kanban, terminal, settings, menu, chevron-*
- **Status**: circle, check-circle, x-circle, alert-circle, clock, loader
- **Actions**: play, pause, refresh, search, copy, plus, trash, edit, save
- **Agents**: bot, code, test-tube, building, bar-chart, target, wrench

### Utility Classes

```css
/* Transições elegantes */
.transition-luxury {
  transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Cards refinados */
.card-refined {
  background: var(--card);
  border: 1px solid var(--border);
}
.card-refined:hover {
  transform: translateY(-1px);
  border-color: var(--border-medium);
}

/* Gold accent hover */
.hover-gold:hover {
  border-color: var(--border-gold);
}

/* Scrollbar customizada */
.scrollbar-refined::-webkit-scrollbar {
  width: 6px;
}
```

---

## Fluxo de Dados

### Story Lifecycle

```
                    ┌─────────────────────────────────────────────────────┐
                    │               STORY LIFECYCLE                        │
                    └─────────────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              ┌──────────┐          ┌──────────┐          ┌──────────┐
              │ CREATE   │          │ UPDATE   │          │ DELETE   │
              └────┬─────┘          └────┬─────┘          └────┬─────┘
                   │                     │                     │
                   ▼                     ▼                     ▼
         ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
         │ StoryCreateModal │   │ StoryEditModal  │   │ Confirm Dialog  │
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
                             │            │   *.md files    │
                             │            └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  KanbanBoard    │
                    │  re-renders     │
                    └─────────────────┘
```

### Fluxo de Drag & Drop

```
User drags story card
         │
         ▼
┌─────────────────────────────────────┐
│     DndContext.onDragStart()        │
│  1. Find story by activeId          │
│  2. setActiveStory(story)           │
│  3. Show DragOverlay                │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     DndContext.onDragEnd()          │
│  1. Determine target column         │
│  2. Calculate new index             │
│  3. Same column? reorderInColumn()  │
│  4. Different? moveStory()          │
│  5. Clear activeStory               │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     story-store.moveStory()         │
│  1. Race condition check            │
│  2. Remove from old position        │
│  3. Insert at new position          │
│  4. Update story.status             │
│  5. notifyStatusChange()            │
│  6. Clear operation lock            │
└─────────────────────────────────────┘
```

---

## Padrões e Convenções

### Convenções de Nomenclatura

| Tipo        | Padrão                  | Exemplo                  |
| ----------- | ----------------------- | ------------------------ |
| Components  | PascalCase              | `StoryCard.tsx`          |
| Hooks       | camelCase com `use`     | `useStories.ts`          |
| Stores      | kebab-case com `-store` | `story-store.ts`         |
| Types       | PascalCase              | `StoryStatus`            |
| CSS Classes | kebab-case              | `card-refined`           |
| Files       | kebab-case              | `use-realtime-status.ts` |

### Component Structure

```typescript
// Ordem recomendada em componentes
'use client';

// 1. Imports - React primeiro
import { useState, useEffect, useCallback } from 'react';

// 2. Imports - Third-party
import { DndContext } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

// 3. Imports - Types
import type { Story, StoryStatus } from '@/types';

// 4. Imports - Internal components
import { StoryCard } from '@/components/stories';

// 5. Imports - Hooks & Stores
import { useStoryStore } from '@/stores/story-store';

// 6. Interface Props
interface ComponentProps {
  story: Story;
  onUpdate?: (story: Story) => void;
}

// 7. Component
export function Component({ story, onUpdate }: ComponentProps) {
  // 7a. Hooks
  const [state, setState] = useState();
  const { action } = useStore();

  // 7b. Callbacks
  const handleClick = useCallback(() => {}, []);

  // 7c. Effects
  useEffect(() => {}, []);

  // 7d. Render
  return <div>...</div>;
}
```

### Padrão de Export

Cada diretório de componentes tem um `index.ts`:

```typescript
// components/stories/index.ts
export { StoryCard } from './StoryCard';
export { StoryCreateModal } from './StoryCreateModal';
export { StoryEditModal } from './StoryEditModal';
export { StoryDetailModal } from './StoryDetailModal';
```

---

## Extensibilidade

### Adicionando Nova View

1. **Criar página**: `src/app/(dashboard)/nova-view/page.tsx`
2. **Criar componente**: `src/components/nova-view/NovaViewPanel.tsx`
3. **Adicionar ao sidebar**: `src/types/index.ts` → `SidebarView` e `SIDEBAR_ITEMS`
4. **Criar store (se necessário)**: `src/stores/nova-view-store.ts`

### Adicionando Novo Agente

1. **Adicionar tipo**: `src/types/index.ts` → `AgentId`
2. **Adicionar config**: `src/types/index.ts` → `AGENT_CONFIG`
3. **Adicionar cor**: `src/app/globals.css` → `--agent-{id}`
4. **Adicionar mock**: `src/lib/mock-data.ts` → `MOCK_AGENTS`

### Adicionando Novo Status (Kanban)

1. **Adicionar tipo**: `src/types/index.ts` → `StoryStatus`
2. **Adicionar coluna**: `src/types/index.ts` → `KANBAN_COLUMNS`
3. **Adicionar cor**: `src/types/index.ts` → `STATUS_COLORS`
4. **Adicionar CSS**: `src/app/globals.css` → variáveis se necessário
5. **Atualizar store**: `src/stores/story-store.ts` → `DEFAULT_ORDER`

### Adicionando Nova API

1. **Criar route**: `src/app/api/nova-rota/route.ts`
2. **Implementar handlers**: GET, POST, PUT, DELETE
3. **Criar hook (opcional)**: `src/hooks/use-nova-rota.ts`
4. **Adicionar tipos**: `src/types/index.ts`

---

## Próximos Passos (Roadmap)

> 📖 **Arquitetura detalhada de Real-Time:** Ver [dashboard-realtime.md](./dashboard-realtime.md)

### Prioridade Alta

- [ ] **Real-Time Observability** - CLI → Dashboard em tempo real ([arquitetura](./dashboard-realtime.md))
- [ ] **Background Tasks UI** - Visualizar tasks ADE em execução
- [ ] **Dynamic Status System** - Status customizáveis por projeto
- [ ] **Multi-File Diff View** - Ver mudanças antes de aprovar

### Prioridade Média

- [ ] **Permission Modes UI** - Toggle visual de permissões
- [ ] **Notification System** - Toast notifications para eventos
- [ ] **Terminal Streaming** - Output real-time dos agentes

### Prioridade Baixa

- [ ] **Worktrees View** - Gerenciar git worktrees
- [ ] **Ideas Panel** - Capturar ideias durante desenvolvimento
- [ ] **Export/Import** - Backup de configurações

---

_Documentação gerada por @architect (Aria) - AIOX Core v2.0_
