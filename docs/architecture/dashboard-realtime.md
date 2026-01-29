# 🔴 AIOS Dashboard - Real-Time Observability Architecture

> **Versão:** 1.0.0
> **Data:** 2026-01-29
> **Status:** Proposta
> **Autor:** @architect (Aria)
> **Relacionado:** [dashboard-architecture.md](./dashboard-architecture.md)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Problema Atual](#problema-atual)
3. [Arquitetura Proposta](#arquitetura-proposta)
4. [Event Emitter (CLI)](#event-emitter-cli)
5. [Events Schema](#events-schema)
6. [Enhanced SSE Endpoint](#enhanced-sse-endpoint)
7. [Events Store](#events-store)
8. [Novos Componentes UI](#novos-componentes-ui)
9. [Fluxo de Dados Completo](#fluxo-de-dados-completo)
10. [Implementação Faseada](#implementação-faseada)

---

## Visão Geral

Este documento descreve a arquitetura para **observabilidade em tempo real** do AIOS Dashboard, permitindo que usuários acompanhem comandos executados no CLI com máximo detalhe visual.

### Caso de Uso Principal

```
Usuário executa comandos no CLI → Dashboard mostra TUDO em tempo real
```

### Princípios

1. **Zero Configuration** - Funciona automaticamente quando CLI e Dashboard estão ativos
2. **File-Based** - Comunicação via filesystem (não requer servidor adicional)
3. **Append-Only Events** - Log de eventos imutável para debugging
4. **Graceful Degradation** - Dashboard funciona mesmo sem eventos (fallback para polling)

---

## Problema Atual

### O que o Dashboard MOSTRA hoje

| Evento no CLI     | Dashboard Atual           | Nota            |
| ----------------- | ------------------------- | --------------- |
| `@agent` ativa    | ✅ StatusBar mostra       | Funciona        |
| `*exit` agent     | ✅ Agent vai para standby | Funciona        |
| Story status muda | ⚠️ Kanban atualiza        | Sem notificação |

### O que o Dashboard NÃO MOSTRA

| Evento no CLI                | Dashboard Atual |
| ---------------------------- | --------------- |
| Comando `*xxx` executando    | ❌ Nada         |
| Claude "pensando"            | ❌ Nada         |
| Tool calls (Read/Write/Bash) | ❌ Nada         |
| Progresso da tarefa          | ❌ Nada         |
| Output do Claude             | ❌ Nada         |
| git commit/push              | ❌ Nada         |
| Erros                        | ❌ Nada         |
| Tarefa completa              | ❌ Nada         |

### Gap Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: CLI → Dashboard Real-Time                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  VOCÊ NO CLI                              DASHBOARD                      │
│  ────────────                             ─────────                      │
│                                                                          │
│  @architect ─────────────────────────────▶ ✅ Agent ativo aparece       │
│  (ativa agente)                             (StatusBar + AgentMonitor)  │
│                                                                          │
│  *create-architecture ───────────────────▶ ❌ NÃO MOSTRA comando        │
│  (executa tarefa)                           executando                   │
│                                                                          │
│  [Claude pensando...] ───────────────────▶ ❌ NÃO MOSTRA progresso      │
│                                             em tempo real                │
│                                                                          │
│  [Criando arquivo X] ────────────────────▶ ❌ NÃO MOSTRA arquivos       │
│  [Editando arquivo Y]                       sendo criados/editados      │
│                                                                          │
│  [Story atualizada] ─────────────────────▶ ⚠️ PARCIAL - status muda     │
│                                             mas sem detalhes             │
│                                                                          │
│  [git commit] ───────────────────────────▶ ❌ NÃO MOSTRA commits        │
│                                             em tempo real                │
│                                                                          │
│  *exit ──────────────────────────────────▶ ✅ Agent vai para standby    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura Proposta

### Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOS AGENTS                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Claude Code Session                         │    │
│  │  @architect → *create-architecture → [thinking...] → [file ops] │    │
│  └────────────────────────────────┬────────────────────────────────┘    │
│                                   │                                      │
│                                   │ EMIT EVENTS                          │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │               .aios/dashboard/events.jsonl (append-only)         │    │
│  │  {"type":"agent:activated","agent":"architect","ts":"..."}      │    │
│  │  {"type":"command:start","cmd":"*create-architecture","ts":"..."}│   │
│  │  {"type":"llm:thinking","duration":0,"ts":"..."}                │    │
│  │  {"type":"tool:call","tool":"Read","file":"src/index.ts","ts":""}│   │
│  │  {"type":"file:write","path":"docs/arch.md","lines":50,"ts":""}  │   │
│  │  {"type":"command:complete","cmd":"*create","success":true,"ts":""}│ │
│  └────────────────────────────────┬────────────────────────────────┘    │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                                    │ SSE Stream
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DASHBOARD                                   │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      /api/events (enhanced SSE)                    │  │
│  │  - Watch events.jsonl for changes                                 │  │
│  │  - Stream new events to connected clients                         │  │
│  │  - Maintain last N events in memory                               │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         events-store (NEW)                         │  │
│  │  - currentCommand: { name, startedAt, status }                    │  │
│  │  - llmStatus: 'idle' | 'thinking' | 'responding'                  │  │
│  │  - recentFiles: { path, action, timestamp }[]                     │  │
│  │  - recentEvents: Event[] (circular buffer)                        │  │
│  │  - errors: Error[]                                                │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         UI COMPONENTS                            │    │
│  │                                                                   │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │    │
│  │  │  CommandPanel   │  │  ActivityFeed   │  │  FileChangesPanel│  │   │
│  │  │  ─────────────  │  │  ────────────   │  │  ───────────────  │  │  │
│  │  │ *create-arch    │  │ 02:45 Thinking  │  │ ✏️ docs/arch.md   │  │  │
│  │  │ ████████░░ 80%  │  │ 02:44 Read x.ts │  │ ✏️ src/index.ts   │  │  │
│  │  │ 2m 34s elapsed  │  │ 02:43 Agent on  │  │ 📁 +3 files       │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │    │
│  │                                                                   │    │
│  │  ┌───────────────────────────────────────────────────────────┐   │    │
│  │  │                    TerminalStream (enhanced)               │   │   │
│  │  │  Real-time Claude output with ANSI colors                  │   │   │
│  │  │  [02:45:12] Analyzing project structure...                 │   │   │
│  │  │  [02:45:15] Creating architecture document...              │   │   │
│  │  │  [02:45:20] ✓ docs/architecture/system-arch.md created     │   │   │
│  │  └───────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Event Emitter (CLI)

### Localização

```
.aios-core/core/events/dashboard-emitter.ts
```

### Interface

```typescript
// .aios-core/core/events/types.ts

/**
 * High-level events only (Decision #2)
 * Focused on monitoring, not debugging
 */
export type DashboardEventType =
  // Agent lifecycle
  | 'agent:activated'
  | 'agent:deactivated'

  // Command execution
  | 'command:start'
  | 'command:complete'
  | 'command:error'

  // Story updates
  | 'story:status-change'

  // Session
  | 'session:start'
  | 'session:end';

export interface DashboardEvent {
  id: string; // UUID v4
  type: DashboardEventType;
  timestamp: string; // ISO 8601
  agentId?: string; // Active agent when event occurred
  sessionId?: string; // Session identifier
  data: Record<string, unknown>; // Event-specific payload
}
```

### Implementação

```typescript
// .aios-core/core/events/dashboard-emitter.ts

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { DashboardEvent, DashboardEventType } from './types';

const EVENTS_DIR = '.aios/dashboard';
const EVENTS_FILE = 'events.jsonl';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB rotation

class DashboardEmitter {
  private projectRoot: string;
  private sessionId: string;
  private activeAgentId: string | null = null;
  private enabled: boolean = true;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.sessionId = randomUUID();
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    const dir = join(this.projectRoot, EVENTS_DIR);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private getEventsPath(): string {
    return join(this.projectRoot, EVENTS_DIR, EVENTS_FILE);
  }

  emit(type: DashboardEventType, data: Record<string, unknown> = {}): void {
    if (!this.enabled) return;

    const event: DashboardEvent = {
      id: randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      agentId: this.activeAgentId ?? undefined,
      sessionId: this.sessionId,
      data,
    };

    try {
      const line = JSON.stringify(event) + '\n';
      appendFileSync(this.getEventsPath(), line, 'utf-8');
    } catch (error) {
      // Silently fail - dashboard is optional
      console.debug('[DashboardEmitter] Failed to emit event:', error);
    }
  }

  // High-level convenience methods (Decision #2)

  agentActivated(agentId: string, agentName: string): void {
    this.activeAgentId = agentId;
    this.emit('agent:activated', { agentId, agentName });
  }

  agentDeactivated(): void {
    const agentId = this.activeAgentId;
    this.activeAgentId = null;
    this.emit('agent:deactivated', { agentId });
  }

  commandStart(command: string): void {
    this.emit('command:start', { command });
  }

  commandComplete(command: string, success: boolean): void {
    this.emit('command:complete', { command, success });
  }

  commandError(command: string, error: string): void {
    this.emit('command:error', { command, error });
  }

  storyStatusChange(storyId: string, oldStatus: string, newStatus: string): void {
    this.emit('story:status-change', { storyId, oldStatus, newStatus });
  }

  sessionStart(): void {
    this.emit('session:start', { sessionId: this.sessionId });
  }

  sessionEnd(): void {
    this.emit('session:end', { sessionId: this.sessionId });
  }

  // Control methods
  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }
}

// Singleton export
let emitter: DashboardEmitter | null = null;

export function getDashboardEmitter(projectRoot?: string): DashboardEmitter {
  if (!emitter && projectRoot) {
    emitter = new DashboardEmitter(projectRoot);
  }
  if (!emitter) {
    throw new Error('DashboardEmitter not initialized. Call with projectRoot first.');
  }
  return emitter;
}

export function initDashboardEmitter(projectRoot: string): DashboardEmitter {
  emitter = new DashboardEmitter(projectRoot);
  return emitter;
}
```

### Integração com Claude Code Hooks

```typescript
// .aios-core/integrations/claude-code/hooks.ts

import { getDashboardEmitter } from '../core/events/dashboard-emitter';

/**
 * High-level hooks only (Decision #2)
 * Agent and command lifecycle events
 */

// Hook: Agent activated (e.g., @architect)
export function onAgentActivated(agentId: string, agentName: string): void {
  const emitter = getDashboardEmitter();
  emitter.agentActivated(agentId, agentName);
}

// Hook: Agent deactivated (e.g., *exit)
export function onAgentDeactivated(): void {
  const emitter = getDashboardEmitter();
  emitter.agentDeactivated();
}

// Hook: Command started (e.g., *create-architecture)
export function onCommandStart(command: string): void {
  const emitter = getDashboardEmitter();
  emitter.commandStart(command);
}

// Hook: Command completed
export function onCommandComplete(command: string, success: boolean): void {
  const emitter = getDashboardEmitter();
  emitter.commandComplete(command, success);
}

// Hook: Command error
export function onCommandError(command: string, error: string): void {
  const emitter = getDashboardEmitter();
  emitter.commandError(command, error);
}

// Hook: Story status change
export function onStoryStatusChange(storyId: string, oldStatus: string, newStatus: string): void {
  const emitter = getDashboardEmitter();
  emitter.storyStatusChange(storyId, oldStatus, newStatus);
}
```

---

## Events Schema

### File Location

```
.aios/dashboard/events.jsonl
```

### Format

JSON Lines (JSONL) - one JSON object per line, append-only.

### Event Payloads by Type (High-Level Only)

#### Agent Events

```jsonl
{"id":"uuid","type":"agent:activated","timestamp":"2026-01-29T14:30:00.000Z","sessionId":"uuid","data":{"agentId":"architect","agentName":"Aria"}}
{"id":"uuid","type":"agent:deactivated","timestamp":"2026-01-29T15:45:00.000Z","agentId":"architect","sessionId":"uuid","data":{"agentId":"architect"}}
```

#### Command Events

```jsonl
{"id":"uuid","type":"command:start","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture"}}
{"id":"uuid","type":"command:complete","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture","success":true}}
{"id":"uuid","type":"command:error","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture","error":"Failed to read config file"}}
```

#### Story Events

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

#### Session Events

```jsonl
{"id":"uuid","type":"session:start","timestamp":"...","data":{"sessionId":"uuid"}}
{"id":"uuid","type":"session:end","timestamp":"...","data":{"sessionId":"uuid"}}
```

### File Rotation

When `events.jsonl` exceeds 10MB:

1. Rename to `events.{timestamp}.jsonl`
2. Create new `events.jsonl`
3. Keep last 5 rotated files

---

## Enhanced SSE Endpoint

### Current vs Enhanced

| Aspect         | Current `/api/events` | Enhanced                       |
| -------------- | --------------------- | ------------------------------ |
| Source         | `status.json` only    | `status.json` + `events.jsonl` |
| Update trigger | Polling interval      | File watch + polling           |
| Event types    | `status:update` only  | All event types                |
| History        | None                  | Last N events                  |

### Implementation

```typescript
// apps/dashboard/src/app/api/events/route.ts (enhanced)

import { NextRequest } from 'next/server';
import { watch, existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

const AIOS_DIR = process.env.AIOS_PROJECT_ROOT || process.cwd();
const STATUS_FILE = join(AIOS_DIR, '.aios/dashboard/status.json');
const EVENTS_FILE = join(AIOS_DIR, '.aios/dashboard/events.jsonl');

interface SSEEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();
  let lastEventPosition = 0;
  let isConnected = true;

  // Track last known file sizes for change detection
  let lastStatusMtime = 0;
  let lastEventsSize = 0;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      sendEvent(controller, {
        type: 'connection:status',
        data: { connected: true },
        timestamp: new Date().toISOString(),
      });

      // Send current status
      sendCurrentStatus(controller);

      // Send recent events (last 50)
      sendRecentEvents(controller, 50);

      // Setup file watchers
      const watchers: ReturnType<typeof watch>[] = [];

      // Watch status.json
      if (existsSync(STATUS_FILE)) {
        const statusWatcher = watch(STATUS_FILE, (eventType) => {
          if (eventType === 'change' && isConnected) {
            const stat = statSync(STATUS_FILE);
            if (stat.mtimeMs > lastStatusMtime) {
              lastStatusMtime = stat.mtimeMs;
              sendCurrentStatus(controller);
            }
          }
        });
        watchers.push(statusWatcher);
      }

      // Watch events.jsonl
      if (existsSync(EVENTS_FILE)) {
        const eventsWatcher = watch(EVENTS_FILE, (eventType) => {
          if (eventType === 'change' && isConnected) {
            const stat = statSync(EVENTS_FILE);
            if (stat.size > lastEventsSize) {
              sendNewEvents(controller, lastEventsSize);
              lastEventsSize = stat.size;
            }
          }
        });
        watchers.push(eventsWatcher);
        lastEventsSize = statSync(EVENTS_FILE).size;
      }

      // Heartbeat every 30s
      const heartbeatInterval = setInterval(() => {
        if (isConnected) {
          sendEvent(controller, {
            type: 'heartbeat',
            data: { alive: true },
            timestamp: new Date().toISOString(),
          });
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        isConnected = false;
        clearInterval(heartbeatInterval);
        watchers.forEach((w) => w.close());
        controller.close();
      });
    },
  });

  function sendEvent(controller: ReadableStreamDefaultController, event: SSEEvent): void {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(encoder.encode(data));
  }

  function sendCurrentStatus(controller: ReadableStreamDefaultController): void {
    try {
      if (existsSync(STATUS_FILE)) {
        const content = readFileSync(STATUS_FILE, 'utf-8');
        const status = JSON.parse(content);
        sendEvent(controller, {
          type: 'status:update',
          data: status,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      sendEvent(controller, {
        type: 'error',
        data: { message: 'Failed to read status' },
        timestamp: new Date().toISOString(),
      });
    }
  }

  function sendRecentEvents(controller: ReadableStreamDefaultController, count: number): void {
    try {
      if (existsSync(EVENTS_FILE)) {
        const content = readFileSync(EVENTS_FILE, 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);
        const recentLines = lines.slice(-count);

        const events = recentLines
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        sendEvent(controller, {
          type: 'events:history',
          data: { events },
          timestamp: new Date().toISOString(),
        });

        lastEventPosition = content.length;
      }
    } catch (error) {
      // Silently fail
    }
  }

  function sendNewEvents(controller: ReadableStreamDefaultController, fromPosition: number): void {
    try {
      if (existsSync(EVENTS_FILE)) {
        const content = readFileSync(EVENTS_FILE, 'utf-8');
        const newContent = content.slice(fromPosition);
        const lines = newContent.trim().split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const event = JSON.parse(line);
            sendEvent(controller, {
              type: 'event:new',
              data: event,
              timestamp: new Date().toISOString(),
            });
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

---

## Events Store

### Location

```
apps/dashboard/src/stores/events-store.ts
```

### Interface

```typescript
// apps/dashboard/src/stores/events-store.ts

import { create } from 'zustand';
import type { DashboardEvent } from '@/types';

// Configurable retention (Decision #3)
const DEFAULT_MAX_EVENTS = 100;

export interface CurrentCommand {
  name: string;
  startedAt: string;
  status: 'running' | 'complete' | 'error';
  errorMessage?: string;
}

export interface EventRetentionSettings {
  mode: 'session' | 'hours' | 'persistent';
  hoursToKeep?: number;
  maxEvents?: number;
}

interface EventsState {
  // Connection
  isConnected: boolean;
  lastUpdate: string | null;

  // Session
  sessionId: string | null;
  sessionStartedAt: string | null;

  // Current command (high-level only)
  currentCommand: CurrentCommand | null;

  // Recent events (high-level only)
  recentEvents: DashboardEvent[];

  // Retention settings
  retentionSettings: EventRetentionSettings;

  // Actions
  setConnected: (connected: boolean) => void;
  processEvent: (event: DashboardEvent) => void;
  processHistoryEvents: (events: DashboardEvent[]) => void;
  setRetentionSettings: (settings: EventRetentionSettings) => void;
  clearEvents: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  // Initial state
  isConnected: false,
  lastUpdate: null,
  sessionId: null,
  sessionStartedAt: null,
  currentCommand: null,
  recentEvents: [],
  retentionSettings: {
    mode: 'session',
    hoursToKeep: 24,
    maxEvents: DEFAULT_MAX_EVENTS,
  },

  // Actions
  setConnected: (connected) => set({ isConnected: connected }),

  processEvent: (event) => {
    const state = get();
    const maxEvents = state.retentionSettings.maxEvents || DEFAULT_MAX_EVENTS;

    // Add to recent events (circular buffer)
    const newEvents = [...state.recentEvents, event].slice(-maxEvents);

    // Process by event type (high-level only)
    let updates: Partial<EventsState> = {
      recentEvents: newEvents,
      lastUpdate: event.timestamp,
    };

    switch (event.type) {
      // Session events
      case 'session:start':
        updates.sessionId = event.data.sessionId as string;
        updates.sessionStartedAt = event.timestamp;
        break;

      case 'session:end':
        updates.sessionId = null;
        updates.sessionStartedAt = null;
        updates.currentCommand = null;
        break;

      // Command events
      case 'command:start':
        updates.currentCommand = {
          name: event.data.command as string,
          startedAt: event.timestamp,
          status: 'running',
        };
        break;

      case 'command:complete':
        if (state.currentCommand) {
          updates.currentCommand = {
            ...state.currentCommand,
            status: 'complete',
          };
          // Clear after 3 seconds
          setTimeout(() => {
            set({ currentCommand: null });
          }, 3000);
        }
        break;

      case 'command:error':
        if (state.currentCommand) {
          updates.currentCommand = {
            ...state.currentCommand,
            status: 'error',
            errorMessage: event.data.error as string,
          };
        }
        break;
    }

    set(updates);
  },

  processHistoryEvents: (events) => {
    events.forEach((event) => {
      get().processEvent(event);
    });
  },

  setRetentionSettings: (settings) => {
    set({ retentionSettings: settings });
  },

  clearEvents: () => {
    set({
      recentEvents: [],
      currentCommand: null,
    });
  },
}));

// Selectors
export const selectCurrentCommand = (state: EventsState) => state.currentCommand;
export const selectRecentEvents = (state: EventsState) => state.recentEvents;
export const selectSessionInfo = (state: EventsState) => ({
  sessionId: state.sessionId,
  startedAt: state.sessionStartedAt,
});
```

---

## Novos Componentes UI

### Componentes Necessários (High-Level Only)

| Componente          | Responsabilidade              | Prioridade |
| ------------------- | ----------------------------- | ---------- |
| `CommandPanel`      | Mostra comando atual e status | P0         |
| `ActivityFeed`      | Timeline de eventos recentes  | P0         |
| `SessionIndicator`  | Status da sessão ativa        | P1         |
| `RetentionSettings` | Config de retenção de eventos | P2         |

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

  useEffect(() => {
    if (!currentCommand || currentCommand.status !== 'running') {
      setElapsed(0);
      return;
    }

    const startTime = new Date(currentCommand.startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentCommand]);

  if (!currentCommand) {
    return (
      <div className="p-3 rounded-lg bg-surface border border-subtle">
        <div className="flex items-center gap-2 text-muted text-sm">
          <Terminal className="w-4 h-4" />
          <span>Aguardando comando...</span>
        </div>
      </div>
    );
  }

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const statusConfig = {
    running: {
      icon: <Loader2 className="w-4 h-4 animate-spin text-blue-400" />,
      bg: 'border-blue-500/30 bg-blue-500/5',
    },
    complete: {
      icon: <CheckCircle className="w-4 h-4 text-green-400" />,
      bg: 'border-green-500/30 bg-green-500/5',
    },
    error: {
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      bg: 'border-red-500/30 bg-red-500/5',
    },
  };

  const config = statusConfig[currentCommand.status];

  return (
    <div className={cn('p-3 rounded-lg border transition-luxury', config.bg)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-mono text-sm">{currentCommand.name}</span>
        </div>
        {currentCommand.status === 'running' && (
          <span className="text-xs text-muted">{formatElapsed(elapsed)}</span>
        )}
      </div>

      {currentCommand.status === 'error' && currentCommand.errorMessage && (
        <div className="mt-2 p-2 rounded bg-red-500/10 text-red-400 text-xs">
          {currentCommand.errorMessage}
        </div>
      )}
    </div>
  );
}
```

### ActivityFeed

```typescript
// apps/dashboard/src/components/realtime/ActivityFeed.tsx

'use client';

import { useEventsStore, selectRecentEvents } from '@/stores/events-store';
import { cn } from '@/lib/utils';
import { User, Terminal, AlertCircle, Play, Square, Kanban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// High-level events only (Decision #2)
const EVENT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  'agent:activated': { icon: User, color: 'text-purple-400', label: 'Agent ativado' },
  'agent:deactivated': { icon: User, color: 'text-gray-400', label: 'Agent desativado' },
  'command:start': { icon: Terminal, color: 'text-blue-400', label: 'Comando' },
  'command:complete': { icon: Terminal, color: 'text-green-400', label: 'Comando OK' },
  'command:error': { icon: AlertCircle, color: 'text-red-400', label: 'Erro' },
  'story:status-change': { icon: Kanban, color: 'text-orange-400', label: 'Story' },
  'session:start': { icon: Play, color: 'text-green-400', label: 'Sessão iniciada' },
  'session:end': { icon: Square, color: 'text-gray-400', label: 'Sessão encerrada' },
};

interface ActivityFeedProps {
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({ maxItems = 15, className }: ActivityFeedProps) {
  const recentEvents = useEventsStore(selectRecentEvents);
  const displayEvents = recentEvents.slice(-maxItems).reverse();

  if (displayEvents.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted text-sm', className)}>
        Nenhuma atividade recente
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {displayEvents.map((event) => {
        const config = EVENT_CONFIG[event.type] || {
          icon: Terminal,
          color: 'text-gray-400',
          label: event.type,
        };
        const Icon = config.icon;

        const getEventDetail = () => {
          switch (event.type) {
            case 'agent:activated':
              return event.data.agentName as string;
            case 'command:start':
            case 'command:complete':
            case 'command:error':
              return event.data.command as string;
            case 'story:status-change':
              return `${event.data.storyId}: ${event.data.oldStatus} → ${event.data.newStatus}`;
            default:
              return null;
          }
        };

        const detail = getEventDetail();
        const timeAgo = formatDistanceToNow(new Date(event.timestamp), {
          addSuffix: true,
          locale: ptBR,
        });

        return (
          <div
            key={event.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover transition-colors text-xs"
          >
            <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', config.color)} />
            <span className="text-secondary truncate flex-1">
              {config.label}
              {detail && (
                <span className="text-muted ml-1 font-mono">{detail}</span>
              )}
            </span>
            <span className="text-muted text-[10px] flex-shrink-0">{timeAgo}</span>
          </div>
        );
      })}
    </div>
  );
}
```

### SessionIndicator

```typescript
// apps/dashboard/src/components/realtime/SessionIndicator.tsx

'use client';

import { useEventsStore, selectSessionInfo } from '@/stores/events-store';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Clock } from 'lucide-react';

export function SessionIndicator() {
  const { sessionId, startedAt } = useEventsStore(selectSessionInfo);

  if (!sessionId) {
    return (
      <div className="flex items-center gap-2 text-muted text-xs">
        <Activity className="w-3.5 h-3.5" />
        <span>Sem sessão ativa</span>
      </div>
    );
  }

  const duration = startedAt
    ? formatDistanceToNow(new Date(startedAt), { locale: ptBR })
    : '';

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-green-400">
        <Activity className="w-3.5 h-3.5" />
        <span>Sessão ativa</span>
      </div>
      {duration && (
        <div className="flex items-center gap-1 text-muted">
          <Clock className="w-3 h-3" />
          <span>{duration}</span>
        </div>
      )}
    </div>
  );
}
```

---

## Fluxo de Dados Completo (High-Level)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE DATA FLOW (HIGH-LEVEL ONLY)                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           1. USER ACTION IN CLI                              │
│                                                                              │
│  $ claude                                                                    │
│  > @architect                          ← agent:activated                     │
│  🏛️ Aria (Visionary) ready                                                  │
│  > *create-architecture                ← command:start                       │
│  [Claude working...]                                                         │
│  ✓ Architecture created                ← command:complete                    │
│  > *exit                               ← agent:deactivated                   │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  Claude Code Hooks (Decision #1)
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    2. EVENTS WRITTEN TO FILESYSTEM                           │
│                                                                              │
│  .aios/dashboard/events.jsonl (HIGH-LEVEL ONLY)                             │
│  ─────────────────────────────────────────────────                          │
│  {"type":"session:start","data":{"sessionId":"uuid"},"ts":"..."}            │
│  {"type":"agent:activated","data":{"agentId":"architect"},"ts":"..."}       │
│  {"type":"command:start","data":{"command":"*create-architecture"},"ts":""}│
│  {"type":"command:complete","data":{"success":true},"ts":"..."}             │
│  {"type":"agent:deactivated","data":{"agentId":"architect"},"ts":"..."}     │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  File watcher
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      3. SSE ENDPOINT STREAMS EVENTS                          │
│                                                                              │
│  /api/events (Server-Sent Events)                                           │
│  ────────────────────────────────                                           │
│                                                                              │
│  SSE Output (high-level events only):                                       │
│  data: {"type":"event:new","data":{"type":"agent:activated",...}}          │
│  data: {"type":"event:new","data":{"type":"command:start",...}}            │
│  data: {"type":"event:new","data":{"type":"command:complete",...}}         │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  EventSource
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       4. STORES UPDATE STATE                                 │
│                                                                              │
│  events-store (simplified)                                                  │
│  ─────────────────────────                                                  │
│  {                                                                          │
│    sessionId: "uuid",                                                       │
│    currentCommand: { name: '*create-architecture', status: 'complete' },   │
│    recentEvents: [agent:activated, command:start, command:complete, ...]   │
│  }                                                                          │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  React re-render
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5. UI COMPONENTS UPDATE                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Dashboard UI                                 │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │       CommandPanel          │  │       ActivityFeed          │   │   │
│  │  │  ─────────────────────────  │  │  ─────────────────────────  │   │   │
│  │  │                             │  │                             │   │   │
│  │  │  ✓ *create-architecture     │  │  14:32 Comando OK           │   │   │
│  │  │    Completo                 │  │  14:30 Comando iniciado     │   │   │
│  │  │                             │  │  14:29 Agent ativado Aria   │   │   │
│  │  │                             │  │  14:28 Sessão iniciada      │   │   │
│  │  └─────────────────────────────┘  └─────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                         StatusBar                            │    │   │
│  │  │  ● Connected  │  Sessão ativa (5 min)  │  @architect (Aria) │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementação Faseada (Simplificada)

### Fase 1: Fundação (P0)

| Item                          | Descrição                  | Esforço |
| ----------------------------- | -------------------------- | ------- |
| Claude Code Hooks Integration | Conectar aos hooks nativos | 2h      |
| events.jsonl                  | Formato high-level         | 1h      |
| Enhanced SSE                  | Watch events.jsonl         | 2h      |
| events-store                  | Store simplificado         | 1h      |

**Entregável:** Eventos high-level fluem do CLI para o Dashboard

### Fase 2: UI Core (P1)

| Item                  | Descrição                  | Esforço |
| --------------------- | -------------------------- | ------- |
| CommandPanel          | Comando atual + status     | 1h      |
| ActivityFeed          | Timeline simplificada      | 1h      |
| SessionIndicator      | Status da sessão           | 30min   |
| StatusBar integration | Integrar novos indicadores | 1h      |

**Entregável:** Dashboard mostra atividade high-level em tempo real

### Fase 3: Configuração (P2)

| Item                   | Descrição                       | Esforço |
| ---------------------- | ------------------------------- | ------- |
| RetentionSettings UI   | Toggle session/hours/persistent | 1h      |
| Settings integration   | Persistência de preferências    | 1h      |
| localStorage/IndexedDB | Implementar modos de retenção   | 2h      |

**Entregável:** Retenção de eventos configurável pelo usuário

---

## Decisões Tomadas

### 1. Fonte de Eventos ✅

**Decisão:** Claude Code Hooks

| Aspecto       | Detalhe                                     |
| ------------- | ------------------------------------------- |
| Implementação | Usar hooks nativos do Claude Code           |
| Vantagem      | Automático, completo, sem wrapper adicional |
| Dependência   | API de hooks do Claude Code                 |

### 2. Nível de Detalhe ✅

**Decisão:** High-level apenas

| Eventos Incluídos              | Eventos Excluídos             |
| ------------------------------ | ----------------------------- |
| `agent:activated/deactivated`  | `tool:call` (Read/Write/Bash) |
| `command:start/complete/error` | `file:read/write/create`      |
| `session:start/end`            | `llm:thinking/responding`     |
| `story:status-change`          | Output streaming              |

**Rationale:** Foco em monitoramento, não debug. Menor volume de dados, melhor performance.

### 3. Retenção de Eventos ✅

**Decisão:** Configurável pelo usuário

```typescript
// settings-store.ts
interface EventRetentionSettings {
  mode: 'session' | 'hours' | 'persistent';
  hoursToKeep?: number; // quando mode = 'hours'
  maxEvents?: number; // limite máximo em qualquer modo
}

// Defaults
const DEFAULT_RETENTION: EventRetentionSettings = {
  mode: 'session',
  hoursToKeep: 24,
  maxEvents: 1000,
};
```

| Modo         | Comportamento             | Storage      |
| ------------ | ------------------------- | ------------ |
| `session`    | Limpa ao fechar dashboard | Memory       |
| `hours`      | Mantém últimas N horas    | localStorage |
| `persistent` | Mantém até limite         | IndexedDB    |

**UI:** Toggle em Settings → Events → Retention

---

_Documentação gerada por @architect (Aria) - AIOS Core v2.0_
