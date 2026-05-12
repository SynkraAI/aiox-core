import React from 'react';
import './StatusBadge.css';

const STATUS_CONFIG = {
  healthy: { label: 'Healthy', icon: '\u2713' },
  degraded: { label: 'Degraded', icon: '\u26A0' },
  warning: { label: 'Warning', icon: '\u26A0' },
  critical: { label: 'Critical', icon: '\u2717' },
  passed: { label: 'Passed', icon: '\u2713' },
  failed: { label: 'Failed', icon: '\u2717' },
  skipped: { label: 'Skipped', icon: '-' }
};

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', priority: 1 },
  HIGH: { label: 'High', priority: 2 },
  MEDIUM: { label: 'Medium', priority: 3 },
  LOW: { label: 'Low', priority: 4 },
  INFO: { label: 'Info', priority: 5 }
};

/**
 * Status badge component for displaying health/check status
 */
function StatusBadge({ status, severity, size = 'md', showIcon = true }) {
  if (severity) {
    const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.INFO;
    return (
      <span className={`badge badge--severity-${severity.toLowerCase()} badge--${size}`}>
        {config.label}
      </span>
    );
  }

  const config = STATUS_CONFIG[status] || { label: status, icon: '?' };

  return (
    <span className={`badge badge--${status} badge--${size}`}>
      {showIcon && <span className="badge-icon">{config.icon}</span>}
      <span className="badge-label">{config.label}</span>
    </span>
  );
}

export default StatusBadge;
