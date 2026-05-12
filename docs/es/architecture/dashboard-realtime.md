# 🔴 AIOX Dashboard - Arquitectura de Observabilidad en Tiempo Real

> **ES** | [EN](../architecture/dashboard-realtime.md) | [PT](../pt/architecture/dashboard-realtime.md)
>
> **Versión:** 1.0.0
> **Fecha:** 2026-01-29
> **Estado:** Propuesta
> **Autor:** @architect (Aria)
> **Relacionado:** [dashboard-architecture.md](./dashboard-architecture.md)

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Problema Actual](#problema-actual)
3. [Arquitectura Propuesta](#arquitectura-propuesta)
4. [Event Emitter (CLI)](#event-emitter-cli)
5. [Esquema de Eventos](#esquema-de-eventos)
6. [Endpoint SSE Mejorado](#endpoint-sse-mejorado)
7. [Almacén de Eventos](#almacén-de-eventos)
8. [Nuevos Componentes UI](#nuevos-componentes-ui)
9. [Flujo de Datos Completo](#flujo-de-datos-completo)
10. [Implementación por Fases](#implementación-por-fases)

---

## Descripción General

Este documento describe la arquitectura para **observabilidad en tiempo real** del AIOX Dashboard, permitiendo que los usuarios monitoreen comandos ejecutados en la CLI con máximo detalle visual.

### Caso de Uso Principal

```
Usuario ejecuta comandos en CLI → Dashboard muestra TODO en tiempo real
```

### Principios

1. **Cero Configuración** - Funciona automáticamente cuando la CLI y el Dashboard están activos
2. **Basado en Archivos** - Comunicación a través del sistema de archivos (no requiere servidor adicional)
3. **Eventos Append-Only** - Log de eventos inmutable para debugging
4. **Degradación Elegante** - El Dashboard funciona incluso sin eventos (fallback a polling)

---

## Problema Actual

### Qué muestra el Dashboard HOY

| Evento en CLI     | Dashboard Actual           | Nota            |
| ----------------- | ------------------------- | --------------- |
| `@agent` activa   | ✅ StatusBar muestra       | Funciona        |
| `*exit` agent     | ✅ Agent va a standby     | Funciona        |
| Story status cambia | ⚠️ Kanban actualiza        | Sin notificación |

### Qué NO muestra el Dashboard

| Evento en CLI                | Dashboard Actual |
| ---------------------------- | --------------- |
| Comando `*xxx` ejecutando    | ❌ Nada         |
| Claude "pensando"            | ❌ Nada         |
| Tool calls (Read/Write/Bash) | ❌ Nada         |
| Progreso de la tarea          | ❌ Nada         |
| Output de Claude             | ❌ Nada         |
| git commit/push              | ❌ Nada         |
| Errores                        | ❌ Nada         |
| Tarea completa              | ❌ Nada         |

### Brecha Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO: CLI → Dashboard Tiempo Real                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USTED EN CLI                             DASHBOARD                      │
│  ────────────                             ─────────                      │
│                                                                          │
│  @architect ─────────────────────────────▶ ✅ Agent activo aparece      │
│  (activa agente)                            (StatusBar + AgentMonitor)   │
│                                                                          │
│  *create-architecture ───────────────────▶ ❌ NO MUESTRA comando        │
│  (ejecuta tarea)                            ejecutando                   │
│                                                                          │
│  [Claude pensando...] ───────────────────▶ ❌ NO MUESTRA progreso       │
│                                             en tiempo real               │
│                                                                          │
│  [Creando archivo X] ────────────────────▶ ❌ NO MUESTRA archivos       │
│  [Editando archivo Y]                       siendo creados/editados      │
│                                                                          │
│  [Story actualizada] ─────────────────────▶ ⚠️ PARCIAL - status cambia  │
│                                             pero sin detalles            │
│                                                                          │
│  [git commit] ───────────────────────────▶ ❌ NO MUESTRA commits        │
│                                             en tiempo real               │
│                                                                          │
│  *exit ──────────────────────────────────▶ ✅ Agent va a standby       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Arquitectura Propuesta

### Diagrama General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOX AGENTS                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Claude Code Session                         │    │
│  │  @architect → *create-architecture → [thinking...] → [file ops] │    │
│  └────────────────────────────────┬────────────────────────────────┘    │
│                                   │                                      │
│                                   │ EMIT EVENTS                          │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │               .aiox/dashboard/events.jsonl (append-only)         │    │
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
│  │                      /api/events (SSE mejorado)                    │  │
│  │  - Watch events.jsonl para cambios                                │  │
│  │  - Stream nuevos eventos a clientes conectados                    │  │
│  │  - Mantener últimos N eventos en memoria                          │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         events-store (NUEVO)                       │  │
│  │  - currentCommand: { name, startedAt, status }                    │  │
│  │  - llmStatus: 'idle' | 'thinking' | 'responding'                  │  │
│  │  - recentFiles: { path, action, timestamp }[]                     │  │
│  │  - recentEvents: Event[] (circular buffer)                        │  │
│  │  - errors: Error[]                                                │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         COMPONENTES UI                            │    │
│  │                                                                   │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │    │
│  │  │  CommandPanel   │  │  ActivityFeed   │  │  FileChangesPanel│  │   │
│  │  │  ─────────────  │  │  ────────────   │  │  ───────────────  │  │  │
│  │  │ *create-arch    │  │ 02:45 Pensando  │  │ ✏️ docs/arch.md   │  │  │
│  │  │ ████████░░ 80%  │  │ 02:44 Read x.ts │  │ ✏️ src/index.ts   │  │  │
│  │  │ 2m 34s elapsed  │  │ 02:43 Agent on  │  │ 📁 +3 files       │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │    │
│  │                                                                   │    │
│  │  ┌───────────────────────────────────────────────────────────┐   │    │
│  │  │                    TerminalStream (mejorado)               │   │   │
│  │  │  Output en tiempo real de Claude con colores ANSI          │   │   │
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

### Ubicación

```
.aiox-core/core/events/dashboard-emitter.ts
```

### Interfaz

```typescript
// .aiox-core/core/events/types.ts

/**
 * Eventos de alto nivel solamente (Decisión #2)
 * Enfocado en monitoreo, no debugging
 */
export type DashboardEventType =
  // Ciclo de vida del agente
  | 'agent:activated'
  | 'agent:deactivated'

  // Ejecución de comandos
  | 'command:start'
  | 'command:complete'
  | 'command:error'

  // Actualizaciones de story
  | 'story:status-change'

  // Sesión
  | 'session:start'
  | 'session:end';

export interface DashboardEvent {
  id: string; // UUID v4
  type: DashboardEventType;
  timestamp: string; // ISO 8601
  agentId?: string; // Agente activo cuando ocurrió el evento
  sessionId?: string; // Identificador de sesión
  data: Record<string, unknown>; // Payload específico del evento
}
```

### Implementación

```typescript
// .aiox-core/core/events/dashboard-emitter.ts

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { DashboardEvent, DashboardEventType } from './types';

const EVENTS_DIR = '.aiox/dashboard';
const EVENTS_FILE = 'events.jsonl';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // rotación de 10MB

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
      // Falla silenciosa - dashboard es opcional
      console.debug('[DashboardEmitter] Failed to emit event:', error);
    }
  }

  // Métodos de conveniencia de alto nivel (Decisión #2)

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

  // Métodos de control
  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }
}

// Exportación singleton
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

### Integración con Hooks de Claude Code

```typescript
// .aiox-core/integrations/claude-code/hooks.ts

import { getDashboardEmitter } from '../core/events/dashboard-emitter';

/**
 * Hooks de alto nivel solamente (Decisión #2)
 * Eventos de ciclo de vida de agente y comando
 */

// Hook: Agente activado (e.g., @architect)
export function onAgentActivated(agentId: string, agentName: string): void {
  const emitter = getDashboardEmitter();
  emitter.agentActivated(agentId, agentName);
}

// Hook: Agente desactivado (e.g., *exit)
export function onAgentDeactivated(): void {
  const emitter = getDashboardEmitter();
  emitter.agentDeactivated();
}

// Hook: Comando iniciado (e.g., *create-architecture)
export function onCommandStart(command: string): void {
  const emitter = getDashboardEmitter();
  emitter.commandStart(command);
}

// Hook: Comando completado
export function onCommandComplete(command: string, success: boolean): void {
  const emitter = getDashboardEmitter();
  emitter.commandComplete(command, success);
}

// Hook: Error en comando
export function onCommandError(command: string, error: string): void {
  const emitter = getDashboardEmitter();
  emitter.commandError(command, error);
}

// Hook: Cambio de estado de story
export function onStoryStatusChange(storyId: string, oldStatus: string, newStatus: string): void {
  const emitter = getDashboardEmitter();
  emitter.storyStatusChange(storyId, oldStatus, newStatus);
}
```

---

## Esquema de Eventos

### Ubicación de Archivo

```
.aiox/dashboard/events.jsonl
```

### Formato

JSON Lines (JSONL) - un objeto JSON por línea, append-only.

### Payloads de Eventos por Tipo (Sólo Alto Nivel)

#### Eventos de Agente

```jsonl
{"id":"uuid","type":"agent:activated","timestamp":"2026-01-29T14:30:00.000Z","sessionId":"uuid","data":{"agentId":"architect","agentName":"Aria"}}
{"id":"uuid","type":"agent:deactivated","timestamp":"2026-01-29T15:45:00.000Z","agentId":"architect","sessionId":"uuid","data":{"agentId":"architect"}}
```

#### Eventos de Comando

```jsonl
{"id":"uuid","type":"command:start","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture"}}
{"id":"uuid","type":"command:complete","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture","success":true}}
{"id":"uuid","type":"command:error","timestamp":"...","agentId":"architect","data":{"command":"*create-architecture","error":"Failed to read config file"}}
```

#### Eventos de Story

```jsonl
{
  "id": "uuid",
  "type": "story:status-change",
  "timestamp": "...",
  "agentId": "architect",
  "data": {
    "storyId": "AIOX-123",
    "oldStatus": "in-progress",
    "newStatus": "review"
  }
}
```

#### Eventos de Sesión

```jsonl
{"id":"uuid","type":"session:start","timestamp":"...","data":{"sessionId":"uuid"}}
{"id":"uuid","type":"session:end","timestamp":"...","data":{"sessionId":"uuid"}}
```

### Rotación de Archivos

Cuando `events.jsonl` excede 10MB:

1. Renombrar a `events.{timestamp}.jsonl`
2. Crear nuevo `events.jsonl`
3. Mantener últimos 5 archivos rotados

---

## Endpoint SSE Mejorado

### Actual vs Mejorado

| Aspecto         | `/api/events` Actual | Mejorado                       |
| -------------- | --------------------- | ------------------------------ |
| Fuente         | `status.json` solamente | `status.json` + `events.jsonl` |
| Activador de actualización | Intervalo de polling | File watch + polling           |
| Tipos de eventos | `status:update` solamente | Todos los tipos de eventos |
| Historial        | Ninguno              | Últimos N eventos |

### Implementación

```typescript
// apps/dashboard/src/app/api/events/route.ts (mejorado)

import { NextRequest } from 'next/server';
import { watch, existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

const AIOX_DIR = process.env.AIOX_PROJECT_ROOT || process.cwd();
const STATUS_FILE = join(AIOX_DIR, '.aiox/dashboard/status.json');
const EVENTS_FILE = join(AIOX_DIR, '.aiox/dashboard/events.jsonl');

interface SSEEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();
  let lastEventPosition = 0;
  let isConnected = true;

  // Rastrear últimos tamaños conocidos de archivo para detección de cambios
  let lastStatusMtime = 0;
  let lastEventsSize = 0;

  const stream = new ReadableStream({
    start(controller) {
      // Enviar evento de conexión inicial
      sendEvent(controller, {
        type: 'connection:status',
        data: { connected: true },
        timestamp: new Date().toISOString(),
      });

      // Enviar estado actual
      sendCurrentStatus(controller);

      // Enviar eventos recientes (últimos 50)
      sendRecentEvents(controller, 50);

      // Configurar observadores de archivo
      const watchers: ReturnType<typeof watch>[] = [];

      // Observar status.json
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

      // Observar events.jsonl
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

      // Heartbeat cada 30s
      const heartbeatInterval = setInterval(() => {
        if (isConnected) {
          sendEvent(controller, {
            type: 'heartbeat',
            data: { alive: true },
            timestamp: new Date().toISOString(),
          });
        }
      }, 30000);

      // Limpiar al cerrar
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
      // Falla silenciosa
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
            // Saltar líneas malformadas
          }
        }
      }
    } catch (error) {
      // Falla silenciosa
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

## Almacén de Eventos

### Ubicación

```
apps/dashboard/src/stores/events-store.ts
```

### Interfaz

```typescript
// apps/dashboard/src/stores/events-store.ts

import { create } from 'zustand';
import type { DashboardEvent } from '@/types';

// Retención configurable (Decisión #3)
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
  // Conexión
  isConnected: boolean;
  lastUpdate: string | null;

  // Sesión
  sessionId: string | null;
  sessionStartedAt: string | null;

  // Comando actual (solo alto nivel)
  currentCommand: CurrentCommand | null;

  // Eventos recientes (solo alto nivel)
  recentEvents: DashboardEvent[];

  // Configuración de retención
  retentionSettings: EventRetentionSettings;

  // Acciones
  setConnected: (connected: boolean) => void;
  processEvent: (event: DashboardEvent) => void;
  processHistoryEvents: (events: DashboardEvent[]) => void;
  setRetentionSettings: (settings: EventRetentionSettings) => void;
  clearEvents: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  // Estado inicial
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

  // Acciones
  setConnected: (connected) => set({ isConnected: connected }),

  processEvent: (event) => {
    const state = get();
    const maxEvents = state.retentionSettings.maxEvents || DEFAULT_MAX_EVENTS;

    // Agregar a eventos recientes (circular buffer)
    const newEvents = [...state.recentEvents, event].slice(-maxEvents);

    // Procesar por tipo de evento (solo alto nivel)
    let updates: Partial<EventsState> = {
      recentEvents: newEvents,
      lastUpdate: event.timestamp,
    };

    switch (event.type) {
      // Eventos de sesión
      case 'session:start':
        updates.sessionId = event.data.sessionId as string;
        updates.sessionStartedAt = event.timestamp;
        break;

      case 'session:end':
        updates.sessionId = null;
        updates.sessionStartedAt = null;
        updates.currentCommand = null;
        break;

      // Eventos de comando
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
          // Limpiar después de 3 segundos
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

// Selectores
export const selectCurrentCommand = (state: EventsState) => state.currentCommand;
export const selectRecentEvents = (state: EventsState) => state.recentEvents;
export const selectSessionInfo = (state: EventsState) => ({
  sessionId: state.sessionId,
  startedAt: state.sessionStartedAt,
});
```

---

## Nuevos Componentes UI

### Componentes Necesarios (Sólo Alto Nivel)

| Componente          | Responsabilidad              | Prioridad |
| ------------------- | ----------------------------- | ---------- |
| `CommandPanel`      | Muestra comando actual y estado | P0         |
| `ActivityFeed`      | Timeline de eventos recientes  | P0         |
| `SessionIndicator`  | Estado de la sesión activa     | P1         |
| `RetentionSettings` | Config de retención de eventos | P2         |

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
import { es } from 'date-fns/locale';

// Solo eventos de alto nivel (Decisión #2)
const EVENT_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  'agent:activated': { icon: User, color: 'text-purple-400', label: 'Agent activado' },
  'agent:deactivated': { icon: User, color: 'text-gray-400', label: 'Agent desactivado' },
  'command:start': { icon: Terminal, color: 'text-blue-400', label: 'Comando' },
  'command:complete': { icon: Terminal, color: 'text-green-400', label: 'Comando OK' },
  'command:error': { icon: AlertCircle, color: 'text-red-400', label: 'Error' },
  'story:status-change': { icon: Kanban, color: 'text-orange-400', label: 'Story' },
  'session:start': { icon: Play, color: 'text-green-400', label: 'Sesión iniciada' },
  'session:end': { icon: Square, color: 'text-gray-400', label: 'Sesión encerrada' },
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
        Ninguna actividad reciente
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
          locale: es,
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
import { es } from 'date-fns/locale';
import { Activity, Clock } from 'lucide-react';

export function SessionIndicator() {
  const { sessionId, startedAt } = useEventsStore(selectSessionInfo);

  if (!sessionId) {
    return (
      <div className="flex items-center gap-2 text-muted text-xs">
        <Activity className="w-3.5 h-3.5" />
        <span>Sin sesión activa</span>
      </div>
    );
  }

  const duration = startedAt
    ? formatDistanceToNow(new Date(startedAt), { locale: es })
    : '';

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-green-400">
        <Activity className="w-3.5 h-3.5" />
        <span>Sesión activa</span>
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

## Flujo de Datos Completo (Alto Nivel)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE DATOS COMPLETO (SOLO ALTO NIVEL)                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           1. ACCIÓN DEL USUARIO EN CLI                       │
│                                                                              │
│  $ claude                                                                    │
│  > @architect                          ← agent:activated                     │
│  🏛️ Aria (Visionaria) lista                                                 │
│  > *create-architecture                ← command:start                       │
│  [Claude working...]                                                         │
│  ✓ Architecture created                ← command:complete                    │
│  > *exit                               ← agent:deactivated                   │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  Hooks de Claude Code (Decisión #1)
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    2. EVENTOS ESCRITOS EN EL SISTEMA DE ARCHIVOS             │
│                                                                              │
│  .aiox/dashboard/events.jsonl (SOLO ALTO NIVEL)                             │
│  ─────────────────────────────────────────────────                          │
│  {"type":"session:start","data":{"sessionId":"uuid"},"ts":"..."}            │
│  {"type":"agent:activated","data":{"agentId":"architect"},"ts":"..."}       │
│  {"type":"command:start","data":{"command":"*create-architecture"},"ts":""}│
│  {"type":"command:complete","data":{"success":true},"ts":"..."}             │
│  {"type":"agent:deactivated","data":{"agentId":"architect"},"ts":"..."}     │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  Observador de archivo
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      3. ENDPOINT SSE TRANSMITE EVENTOS                       │
│                                                                              │
│  /api/events (Server-Sent Events)                                           │
│  ────────────────────────────────                                           │
│                                                                              │
│  Salida SSE (solo eventos de alto nivel):                                   │
│  data: {"type":"event:new","data":{"type":"agent:activated",...}}          │
│  data: {"type":"event:new","data":{"type":"command:start",...}}            │
│  data: {"type":"event:new","data":{"type":"command:complete",...}}         │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  EventSource
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       4. ALMACENES ACTUALIZAN ESTADO                         │
│                                                                              │
│  events-store (simplificado)                                                │
│  ─────────────────────────────────────                                      │
│  {                                                                          │
│    sessionId: "uuid",                                                       │
│    currentCommand: { name: '*create-architecture', status: 'complete' },   │
│    recentEvents: [agent:activated, command:start, command:complete, ...]   │
│  }                                                                          │
│                                                                              │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │  Re-renderizado de React
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5. COMPONENTES UI SE ACTUALIZAN                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Dashboard UI                                 │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │   │
│  │  │       CommandPanel          │  │       ActivityFeed          │   │   │
│  │  │  ─────────────────────────  │  │  ─────────────────────────  │   │   │
│  │  │                             │  │                             │   │   │
│  │  │  ✓ *create-architecture     │  │  14:32 Comando OK           │   │   │
│  │  │    Completado               │  │  14:30 Comando iniciado     │   │   │
│  │  │                             │  │  14:29 Agent activado Aria  │   │   │
│  │  │                             │  │  14:28 Sesión iniciada      │   │   │
│  │  └─────────────────────────────┘  └─────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                         StatusBar                            │    │   │
│  │  │  ● Conectado │ Sesión activa (5 min)  │ @architect (Aria)  │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementación por Fases (Simplificada)

### Fase 1: Fundación (P0)

| Elemento                          | Descripción                    | Esfuerzo |
| ----------------------------- | ------------------------------ | ------- |
| Integración de Hooks de Claude Code | Conectar a hooks nativos | 2h      |
| events.jsonl                  | Formato de alto nivel          | 1h      |
| SSE Mejorado                  | Watch events.jsonl             | 2h      |
| events-store                  | Almacén simplificado           | 1h      |

**Entregable:** Los eventos de alto nivel fluyen de la CLI al Dashboard

### Fase 2: UI Core (P1)

| Elemento                  | Descripción                   | Esfuerzo |
| --------------------- | ------------------------------ | ------- |
| CommandPanel          | Comando actual + estado        | 1h      |
| ActivityFeed          | Timeline simplificada          | 1h      |
| SessionIndicator      | Estado de la sesión            | 30min   |
| StatusBar integration | Integrar nuevos indicadores    | 1h      |

**Entregable:** El Dashboard muestra actividad de alto nivel en tiempo real

### Fase 3: Configuración (P2)

| Elemento                   | Descripción                         | Esfuerzo |
| ---------------------- | -------------------------------------- | ------- |
| RetentionSettings UI   | Toggle session/hours/persistent    | 1h      |
| Settings integration   | Persistencia de preferencias         | 1h      |
| localStorage/IndexedDB | Implementar modos de retención      | 2h      |

**Entregable:** Retención de eventos configurable por el usuario

---

## Decisiones Tomadas

### 1. Fuente de Eventos ✅

**Decisión:** Hooks de Claude Code

| Aspecto       | Detalle                                    |
| ------------- | ------------------------------------------ |
| Implementación | Usar hooks nativos de Claude Code         |
| Ventaja      | Automático, completo, sin wrapper adicional |
| Dependencia   | API de hooks de Claude Code               |

### 2. Nivel de Detalle ✅

**Decisión:** Solo alto nivel

| Eventos Incluidos              | Eventos Excluidos             |
| ------------------------------ | ----------------------------- |
| `agent:activated/deactivated`  | `tool:call` (Read/Write/Bash) |
| `command:start/complete/error` | `file:read/write/create`      |
| `session:start/end`            | `llm:thinking/responding`     |
| `story:status-change`          | Output streaming              |

**Justificación:** Enfoque en monitoreo, no debug. Menor volumen de datos, mejor rendimiento.

### 3. Retención de Eventos ✅

**Decisión:** Configurable por el usuario

```typescript
// settings-store.ts
interface EventRetentionSettings {
  mode: 'session' | 'hours' | 'persistent';
  hoursToKeep?: number; // cuando mode = 'hours'
  maxEvents?: number; // límite máximo en cualquier modo
}

// Valores por defecto
const DEFAULT_RETENTION: EventRetentionSettings = {
  mode: 'session',
  hoursToKeep: 24,
  maxEvents: 1000,
};
```

| Modo         | Comportamiento             | Almacenamiento |
| ------------ | ------------------------- | -------------- |
| `session`    | Limpia al cerrar dashboard | Memoria        |
| `hours`      | Mantiene últimas N horas   | localStorage   |
| `persistent` | Mantiene hasta límite      | IndexedDB      |

**UI:** Toggle en Settings → Events → Retention

---

_Documentación generada por @architect (Aria) - AIOX Core v2.0_
