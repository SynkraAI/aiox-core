'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useMonitorStore, selectFilteredEvents, type MonitorEvent, type EventType } from '@/stores/monitor-store';

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
}

// Event type styling
const EVENT_STYLES: Record<EventType, { icon: string; color: string; bg: string }> = {
  PreToolUse: { icon: 'play', color: 'var(--accent-gold)', bg: 'var(--accent-gold-bg)' },
  PostToolUse: { icon: 'check', color: 'var(--status-success)', bg: 'rgba(34, 197, 94, 0.1)' },
  UserPromptSubmit: { icon: 'message', color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.1)' },
  Stop: { icon: 'square', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
  SubagentStop: { icon: 'users', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
  Notification: { icon: 'bell', color: 'var(--status-warning)', bg: 'rgba(234, 179, 8, 0.1)' },
  PreCompact: { icon: 'archive', color: 'var(--text-tertiary)', bg: 'var(--bg-hover)' },
  SessionStart: { icon: 'zap', color: 'var(--status-success)', bg: 'rgba(34, 197, 94, 0.1)' },
};

// Tool name abbreviations for common tools
const TOOL_ABBREV: Record<string, string> = {
  Read: 'RD',
  Write: 'WR',
  Edit: 'ED',
  Bash: 'SH',
  Glob: 'GL',
  Grep: 'GR',
  Task: 'TK',
  WebFetch: 'WF',
  WebSearch: 'WS',
};

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const EventItem = memo(function EventItem({ event }: { event: MonitorEvent }) {
  const style = EVENT_STYLES[event.type];
  const Icon = iconMap[style.icon as keyof typeof iconMap] || iconMap['circle'];

  // Get tool info
  const toolName = event.tool_name || '';
  const toolAbbrev = TOOL_ABBREV[toolName] || toolName.slice(0, 2).toUpperCase();

  // Get summary based on event type
  let summary = '';
  if (event.type === 'PreToolUse' || event.type === 'PostToolUse') {
    const input = event.tool_input || {};
    if (toolName === 'Read' && input.file_path) {
      summary = String(input.file_path).split('/').pop() || '';
    } else if (toolName === 'Write' && input.file_path) {
      summary = String(input.file_path).split('/').pop() || '';
    } else if (toolName === 'Bash' && input.command) {
      summary = String(input.command).slice(0, 40);
    } else if (toolName === 'Grep' && input.pattern) {
      summary = `"${String(input.pattern).slice(0, 20)}"`;
    } else if (toolName === 'Glob' && input.pattern) {
      summary = String(input.pattern);
    } else if (toolName === 'Task' && input.description) {
      summary = String(input.description).slice(0, 30);
    }
  } else if (event.type === 'UserPromptSubmit') {
    const prompt = event.data?.user_prompt || '';
    summary = String(prompt).slice(0, 50);
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-2 border-b transition-colors hover:bg-[var(--bg-hover)]',
        event.is_error && 'bg-[rgba(239,68,68,0.05)]'
      )}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center h-5 w-5 rounded shrink-0 mt-0.5"
        style={{ backgroundColor: style.bg }}
      >
        <Icon className="h-3 w-3" style={{ color: style.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Tool badge */}
          {toolName && (
            <span
              className="px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider rounded"
              style={{
                backgroundColor: event.is_error ? 'rgba(239,68,68,0.1)' : 'var(--bg-elevated)',
                color: event.is_error ? 'var(--status-error)' : 'var(--text-secondary)',
                border: `1px solid ${event.is_error ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'}`,
              }}
            >
              {toolAbbrev}
            </span>
          )}

          {/* Event type */}
          <span className="text-[10px] uppercase tracking-wider" style={{ color: style.color }}>
            {event.type.replace(/([A-Z])/g, ' $1').trim()}
          </span>

          {/* Duration */}
          {event.duration_ms && (
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {formatDuration(event.duration_ms)}
            </span>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div
            className="text-[11px] truncate mt-0.5 font-mono"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {summary}
          </div>
        )}

        {/* Error */}
        {event.is_error && event.tool_result && (
          <div
            className="text-[10px] mt-1 truncate"
            style={{ color: 'var(--status-error)' }}
          >
            {event.tool_result.slice(0, 100)}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="text-[9px] shrink-0" style={{ color: 'var(--text-muted)' }}>
        {formatTimestamp(event.timestamp)}
      </div>
    </div>
  );
});

export const ActivityFeed = memo(function ActivityFeed({
  className,
  maxItems = 50,
}: ActivityFeedProps) {
  const events = useMonitorStore(selectFilteredEvents);
  const connected = useMonitorStore((state) => state.connected);

  const displayEvents = useMemo(() => events.slice(0, maxItems), [events, maxItems]);

  const ActivityIcon = iconMap['activity'];
  const WifiOffIcon = iconMap['wifi-off'];

  if (!connected) {
    return (
      <div className={cn('flex flex-col h-full', className)} style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <WifiOffIcon className="h-8 w-8 mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-sm font-light mb-1" style={{ color: 'var(--text-tertiary)' }}>
            Monitor Disconnected
          </h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Start the monitor server to see real-time activity.
          </p>
          <code className="mt-3 px-3 py-1.5 text-[10px] font-mono rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
            cd apps/monitor-server && bun run dev
          </code>
        </div>
      </div>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <div className={cn('flex flex-col h-full', className)} style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ActivityIcon className="h-8 w-8 mb-4" style={{ color: 'var(--border)' }} />
          <h3 className="text-sm font-light mb-1" style={{ color: 'var(--text-tertiary)' }}>
            Waiting for Activity
          </h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Events will appear here as you use Claude Code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)} style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex-1 overflow-y-auto">
        {displayEvents.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 border-t flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {displayEvents.length} events
        </span>
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--status-success)' }}
          />
          <span className="text-[10px]" style={{ color: 'var(--status-success)' }}>
            Live
          </span>
        </div>
      </div>
    </div>
  );
});
