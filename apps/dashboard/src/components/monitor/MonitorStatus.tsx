'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useMonitorStore } from '@/stores/monitor-store';

interface MonitorStatusProps {
  className?: string;
  showLabel?: boolean;
}

export const MonitorStatus = memo(function MonitorStatus({
  className,
  showLabel = true,
}: MonitorStatusProps) {
  const connected = useMonitorStore((state) => state.connected);
  const connecting = useMonitorStore((state) => state.connecting);
  const error = useMonitorStore((state) => state.error);
  const events = useMonitorStore((state) => state.events);

  const WifiIcon = iconMap['wifi'];
  const WifiOffIcon = iconMap['wifi-off'];
  const LoaderIcon = iconMap['loader'];

  if (connecting) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <LoaderIcon
          className="h-3 w-3 animate-spin"
          style={{ color: 'var(--text-muted)' }}
        />
        {showLabel && (
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Connecting...
          </span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <WifiOffIcon className="h-3 w-3" style={{ color: 'var(--status-error)' }} />
        {showLabel && (
          <span className="text-[10px]" style={{ color: 'var(--status-error)' }}>
            Error
          </span>
        )}
      </div>
    );
  }

  if (!connected) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <WifiOffIcon className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
        {showLabel && (
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Offline
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative">
        <WifiIcon className="h-3 w-3" style={{ color: 'var(--status-success)' }} />
        <span
          className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--status-success)' }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px]" style={{ color: 'var(--status-success)' }}>
          Live
        </span>
      )}
      {events.length > 0 && (
        <span
          className="text-[9px] px-1 rounded"
          style={{
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-muted)',
          }}
        >
          {events.length}
        </span>
      )}
    </div>
  );
});
