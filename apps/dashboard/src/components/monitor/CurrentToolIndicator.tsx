'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useMonitorStore, selectCurrentTool } from '@/stores/monitor-store';

interface CurrentToolIndicatorProps {
  className?: string;
}

// Tool icons
const TOOL_ICONS: Record<string, string> = {
  Read: 'file-text',
  Write: 'file-plus',
  Edit: 'edit',
  Bash: 'terminal',
  Glob: 'search',
  Grep: 'search',
  Task: 'users',
  WebFetch: 'globe',
  WebSearch: 'search',
};

export const CurrentToolIndicator = memo(function CurrentToolIndicator({
  className,
}: CurrentToolIndicatorProps) {
  const currentTool = useMonitorStore(selectCurrentTool);
  const connected = useMonitorStore((state) => state.connected);

  if (!connected) {
    return null;
  }

  if (!currentTool) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 border rounded',
          className
        )}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--status-idle)' }}
        />
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Idle
        </span>
      </div>
    );
  }

  const toolName = currentTool.tool_name || 'Unknown';
  const iconName = TOOL_ICONS[toolName] || 'circle';
  const Icon = iconMap[iconName as keyof typeof iconMap] || iconMap['circle'];

  // Get summary based on tool
  let summary = '';
  const input = currentTool.tool_input || {};
  if (toolName === 'Read' && input.file_path) {
    summary = String(input.file_path).split('/').pop() || '';
  } else if (toolName === 'Write' && input.file_path) {
    summary = String(input.file_path).split('/').pop() || '';
  } else if (toolName === 'Bash' && input.command) {
    summary = String(input.command).slice(0, 30);
  } else if (toolName === 'Grep' && input.pattern) {
    summary = `"${String(input.pattern).slice(0, 15)}"`;
  } else if (toolName === 'Glob' && input.pattern) {
    summary = String(input.pattern).slice(0, 20);
  } else if (toolName === 'Task' && input.description) {
    summary = String(input.description).slice(0, 25);
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 border rounded animate-pulse',
        className
      )}
      style={{
        backgroundColor: 'var(--accent-gold-bg)',
        borderColor: 'var(--accent-gold)',
      }}
    >
      {/* Spinner */}
      <div className="relative h-4 w-4">
        <div
          className="absolute inset-0 border-2 rounded-full animate-spin"
          style={{
            borderColor: 'var(--accent-gold)',
            borderTopColor: 'transparent',
          }}
        />
      </div>

      {/* Tool info */}
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent-gold)' }} />
        <span className="text-[11px] font-medium" style={{ color: 'var(--accent-gold)' }}>
          {toolName}
        </span>
        {summary && (
          <span
            className="text-[10px] truncate font-mono"
            style={{ color: 'var(--text-secondary)' }}
          >
            {summary}
          </span>
        )}
      </div>
    </div>
  );
});
