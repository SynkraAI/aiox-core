/**
 * AIOS Monitor Store
 *
 * Zustand store for managing real-time Claude Code events.
 * Connects to the monitor-server via WebSocket for live updates.
 */

import { create } from 'zustand';

// Event types from monitor server
export type EventType =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'UserPromptSubmit'
  | 'Stop'
  | 'SubagentStop'
  | 'Notification'
  | 'PreCompact'
  | 'SessionStart';

export interface MonitorEvent {
  id: string;
  type: EventType;
  timestamp: number;
  session_id: string;
  project?: string;
  cwd?: string;
  agent?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_result?: string;
  is_error?: boolean;
  duration_ms?: number;
  aios_agent?: string;
  aios_story_id?: string;
  aios_task_id?: string;
  data?: Record<string, unknown>;
}

export interface MonitorSession {
  id: string;
  project: string;
  cwd: string;
  start_time: number;
  last_activity: number;
  status: 'active' | 'idle' | 'completed';
  event_count: number;
  tool_calls: number;
  errors: number;
  aios_agent?: string;
  aios_story_id?: string;
}

export interface MonitorStats {
  total: number;
  by_type: { type: string; count: number }[];
  by_tool: { tool_name: string; count: number }[];
  errors: number;
  success_rate: string;
  sessions_active: number;
}

interface MonitorState {
  // Connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;

  // Data
  events: MonitorEvent[];
  sessions: MonitorSession[];
  stats: MonitorStats | null;

  // Filters
  selectedSessionId: string | null;
  eventTypeFilter: EventType | null;
  toolFilter: string | null;

  // Actions
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  addEvent: (event: MonitorEvent) => void;
  setEvents: (events: MonitorEvent[]) => void;
  setSessions: (sessions: MonitorSession[]) => void;
  setStats: (stats: MonitorStats) => void;
  setSelectedSessionId: (id: string | null) => void;
  setEventTypeFilter: (type: EventType | null) => void;
  setToolFilter: (tool: string | null) => void;
  clearEvents: () => void;
}

const MAX_EVENTS = 500; // Keep last 500 events in memory

export const useMonitorStore = create<MonitorState>((set) => ({
  // Initial state
  connected: false,
  connecting: false,
  error: null,
  events: [],
  sessions: [],
  stats: null,
  selectedSessionId: null,
  eventTypeFilter: null,
  toolFilter: null,

  // Actions
  setConnected: (connected) => set({ connected }),
  setConnecting: (connecting) => set({ connecting }),
  setError: (error) => set({ error }),

  addEvent: (event) =>
    set((state) => {
      // Prevent duplicate events by checking ID
      if (state.events.some((e) => e.id === event.id)) {
        return state;
      }
      return {
        events: [event, ...state.events].slice(0, MAX_EVENTS),
      };
    }),

  setEvents: (events) =>
    set((state) => {
      // Merge with existing events, avoiding duplicates
      const existingIds = new Set(state.events.map((e) => e.id));
      const newEvents = events.filter((e) => !existingIds.has(e.id));
      // Sort by timestamp descending (newest first)
      const merged = [...newEvents, ...state.events]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_EVENTS);
      return { events: merged };
    }),
  setSessions: (sessions) => set({ sessions }),
  setStats: (stats) => set({ stats }),
  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),
  setEventTypeFilter: (eventTypeFilter) => set({ eventTypeFilter }),
  setToolFilter: (toolFilter) => set({ toolFilter }),
  clearEvents: () => set({ events: [] }),
}));

// Selectors
export const selectFilteredEvents = (state: MonitorState): MonitorEvent[] => {
  let filtered = state.events;

  if (state.selectedSessionId) {
    filtered = filtered.filter((e) => e.session_id === state.selectedSessionId);
  }

  if (state.eventTypeFilter) {
    filtered = filtered.filter((e) => e.type === state.eventTypeFilter);
  }

  if (state.toolFilter) {
    filtered = filtered.filter((e) => e.tool_name === state.toolFilter);
  }

  return filtered;
};

export const selectActiveSession = (state: MonitorState): MonitorSession | undefined => {
  return state.sessions.find((s) => s.status === 'active');
};

export const selectCurrentTool = (state: MonitorState): MonitorEvent | undefined => {
  // Find the most recent PreToolUse that doesn't have a matching PostToolUse
  const preToolUses = state.events.filter((e) => e.type === 'PreToolUse');
  const postToolUses = state.events.filter((e) => e.type === 'PostToolUse');

  for (const pre of preToolUses) {
    const hasPost = postToolUses.some(
      (post) =>
        post.tool_name === pre.tool_name &&
        post.session_id === pre.session_id &&
        post.timestamp > pre.timestamp
    );
    if (!hasPost) {
      return pre;
    }
  }

  return undefined;
};
