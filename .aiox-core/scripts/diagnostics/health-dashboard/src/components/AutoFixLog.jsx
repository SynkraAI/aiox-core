import React from 'react';
import './AutoFixLog.css';

/**
 * Self-healing / auto-fix history log
 */
function AutoFixLog({ items = [], maxItems = 5 }) {
  const displayedItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  if (items.length === 0) {
    return (
      <div className="autofix-log">
        <h3 className="autofix-title">Auto-Fixed Issues</h3>
        <div className="autofix-empty">
          <span className="empty-icon">\u26A0</span>
          <p>No auto-fixes applied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="autofix-log">
      <h3 className="autofix-title">
        Auto-Fixed Issues
        <span className="autofix-count">{items.length}</span>
      </h3>

      <ul className="autofix-items">
        {displayedItems.map((item, index) => (
          <li key={item.checkId || index} className="autofix-item">
            <div className="autofix-icon">\u2713</div>
            <div className="autofix-content">
              <div className="autofix-header">
                <span className="autofix-id">{item.checkId}</span>
                <span className="autofix-action">{item.action}</span>
              </div>
              {item.backup && (
                <div className="autofix-backup">
                  Backup: <code>{item.backup}</code>
                </div>
              )}
              {item.timestamp && (
                <div className="autofix-time">
                  {formatTime(item.timestamp)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="autofix-more">
          <span>+ {items.length - maxItems} more fixes</span>
        </div>
      )}
    </div>
  );
}

function formatTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

export default AutoFixLog;
