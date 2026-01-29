# AIOS Monitor Server

Real-time event server for monitoring Claude Code activity in AIOS.

## Overview

The Monitor Server captures events from Claude Code hooks and broadcasts them via WebSocket to the AIOS Dashboard for real-time visualization.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│  Monitor Server │────▶│  AIOS Dashboard │
│   (CLI + Hooks) │     │  (Bun + SQLite) │     │  (Next.js + WS) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       stdin              HTTP POST              WebSocket
```

## Quick Start

### 1. Install Hooks

```bash
./scripts/install-monitor-hooks.sh
```

This installs Python hooks into `~/.claude/hooks/` that capture:

- `PreToolUse` - Before tool execution
- `PostToolUse` - After tool execution (with results)
- `UserPromptSubmit` - When user sends a prompt
- `Stop` - When Claude stops
- `SubagentStop` - When a subagent (Task) stops
- `Notification` - Claude notifications
- `PreCompact` - Before context compaction

### 2. Start the Server

```bash
cd apps/monitor-server
bun install
bun run dev
```

Server runs on `http://localhost:4001` by default.

### 3. Start the Dashboard

```bash
cd apps/dashboard
npm run dev
```

Navigate to `http://localhost:3000/monitor` to see real-time events.

## API Endpoints

| Endpoint                   | Method    | Description               |
| -------------------------- | --------- | ------------------------- |
| `POST /events`             | POST      | Receive events from hooks |
| `GET /events`              | GET       | Query events              |
| `GET /events/recent`       | GET       | Get recent events         |
| `GET /sessions`            | GET       | List all sessions         |
| `GET /sessions/:id`        | GET       | Get session details       |
| `GET /sessions/:id/events` | GET       | Get events for a session  |
| `GET /stats`               | GET       | Aggregated statistics     |
| `GET /transcripts`         | GET       | List Claude transcripts   |
| `WS /stream`               | WebSocket | Real-time event stream    |
| `GET /health`              | GET       | Health check              |

## Configuration

Environment variables:

| Variable       | Default                     | Description          |
| -------------- | --------------------------- | -------------------- |
| `MONITOR_PORT` | `4001`                      | Server port          |
| `MONITOR_DB`   | `~/.aios/monitor/events.db` | SQLite database path |

Hook environment variables:

| Variable                  | Default                 | Description                     |
| ------------------------- | ----------------------- | ------------------------------- |
| `AIOS_MONITOR_URL`        | `http://localhost:4001` | Monitor server URL              |
| `AIOS_MONITOR_TIMEOUT_MS` | `500`                   | HTTP timeout for sending events |

## Architecture

```
apps/monitor-server/
├── server/
│   ├── server.ts    # Main Bun server
│   ├── db.ts        # SQLite database layer
│   └── types.ts     # TypeScript types
├── package.json
└── README.md

.aios-core/monitor/hooks/
├── lib/
│   ├── send_event.py  # HTTP client
│   └── enrich.py      # Context enrichment
├── pre_tool_use.py
├── post_tool_use.py
├── user_prompt_submit.py
├── stop.py
├── subagent_stop.py
├── notification.py
└── pre_compact.py
```

## Event Schema

```typescript
interface Event {
  id: string;
  type: EventType;
  timestamp: number;
  session_id: string;
  project?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_result?: string;
  is_error?: boolean;
  duration_ms?: number;
  aios_agent?: string; // @dev, @architect, etc.
  aios_story_id?: string;
  aios_task_id?: string;
}
```

## Dashboard Integration

The AIOS Dashboard connects via WebSocket to receive real-time events:

```typescript
// apps/dashboard/src/hooks/use-monitor-events.ts
const ws = new WebSocket('ws://localhost:4001/stream');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'event') {
    // New event received
    addEvent(message.event);
  }
};
```

## Troubleshooting

### Events not appearing

1. Check if hooks are installed:

   ```bash
   ls ~/.claude/hooks/
   ```

2. Check if server is running:

   ```bash
   curl http://localhost:4001/health
   ```

3. Check server logs for errors

### WebSocket not connecting

1. Ensure `NEXT_PUBLIC_MONITOR_WS_URL` is set in Dashboard `.env`:

   ```
   NEXT_PUBLIC_MONITOR_WS_URL=ws://localhost:4001/stream
   ```

2. Check browser console for connection errors

### High memory usage

Events are stored in SQLite and automatically cleaned up after 24 hours. You can adjust retention:

```bash
# Manual cleanup
curl -X POST http://localhost:4001/cleanup?hours=12
```

## Development

```bash
# Run with watch mode
bun --watch run server/server.ts

# Run tests (if available)
bun test
```
