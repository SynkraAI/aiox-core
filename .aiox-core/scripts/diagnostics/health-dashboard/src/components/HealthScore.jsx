import React from 'react';
import './HealthScore.css';

/**
 * Get status and color based on score
 */
function getScoreStatus(score) {
  if (score >= 90) return { status: 'healthy', color: '#22c55e', label: 'Healthy' };
  if (score >= 70) return { status: 'degraded', color: '#eab308', label: 'Degraded' };
  if (score >= 50) return { status: 'warning', color: '#f97316', label: 'Warning' };
  return { status: 'critical', color: '#ef4444', label: 'Critical' };
}

/**
 * Circular health score indicator
 */
function HealthScore({ score, size = 'lg', showLabel = true, animate = true }) {
  const { status, color, label } = getScoreStatus(score);

  // Calculate SVG parameters
  const sizes = {
    sm: { width: 80, strokeWidth: 6, fontSize: '1.25rem' },
    md: { width: 120, strokeWidth: 8, fontSize: '1.75rem' },
    lg: { width: 180, strokeWidth: 10, fontSize: '2.5rem' },
    xl: { width: 220, strokeWidth: 12, fontSize: '3rem' }
  };

  const config = sizes[size] || sizes.lg;
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const center = config.width / 2;

  return (
    <div className={`health-score health-score--${size}`}>
      <svg
        className="health-score-svg"
        width={config.width}
        height={config.width}
        viewBox={`0 0 ${config.width} ${config.width}`}
      >
        {/* Background circle */}
        <circle
          className="health-score-bg"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className={`health-score-progress ${animate ? 'health-score-progress--animated' : ''}`}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={config.strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="health-score-content">
        <span
          className="health-score-value"
          style={{ fontSize: config.fontSize, color }}
        >
          {score}
        </span>
        {showLabel && (
          <span className={`health-score-label health-score-label--${status}`}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export default HealthScore;
