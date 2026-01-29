/**
 * AIOS Monitor - Event Types
 *
 * Types for Claude Code hook events captured by the monitor.
 */

export type EventType =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'UserPromptSubmit'
  | 'Stop'
  | 'SubagentStop'
  | 'Notification'
  | 'PreCompact'
  | 'SessionStart';

export interface Event {
  id: string;
  type: EventType;
  timestamp: number;
  session_id: string;

  // Common fields
  project?: string;
  cwd?: string;
  agent?: string;

  // Tool fields
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_result?: string;
  is_error?: boolean;
  duration_ms?: number;

  // AIOS-specific fields
  aios_agent?: string; // @dev, @architect, @qa, etc.
  aios_story_id?: string;
  aios_task_id?: string;

  // Full data
  data?: Record<string, unknown>;
}

export interface Session {
  id: string;
  project: string;
  cwd: string;
  start_time: number;
  last_activity: number;
  status: 'active' | 'idle' | 'completed';
  event_count: number;
  tool_calls: number;
  errors: number;

  // AIOS tracking
  aios_agent?: string;
  aios_story_id?: string;
}

export interface EventPayload {
  type: EventType;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface Stats {
  total: number;
  by_type: { type: string; count: number }[];
  by_tool: { tool_name: string; count: number }[];
  errors: number;
  success_rate: string;
  sessions_active: number;
}

export interface SessionAnalytics {
  session_id: string;
  session_start: string;
  duration_seconds: number;
  turns: number;
  avg_context: number;
  tokens: {
    input: number;
    output: number;
    cache_read: number;
    cache_creation: number;
    billed: number;
  };
  cost: {
    api: number;
    total: number;
  };
  tools: {
    total_calls: number;
    breakdown: Record<string, number>;
  };
  skills: Record<string, number>;
  agents: Record<string, number>;
  file_path: string;
  file_mtime: number;
}
