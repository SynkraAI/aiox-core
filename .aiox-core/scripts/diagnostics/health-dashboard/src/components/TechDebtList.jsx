import React from 'react';
import { StatusBadge } from './shared';
import './TechDebtList.css';

/**
 * Technical debt recommendations list
 */
function TechDebtList({ items = [], maxItems = 5 }) {
  const displayedItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  if (items.length === 0) {
    return (
      <div className="tech-debt-list">
        <h3 className="tech-debt-title">Technical Debt</h3>
        <div className="tech-debt-empty">
          <span className="empty-icon">\u2728</span>
          <p>No technical debt recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-debt-list">
      <h3 className="tech-debt-title">
        Technical Debt
        <span className="tech-debt-count">{items.length}</span>
      </h3>

      <ul className="tech-debt-items">
        {displayedItems.map((item, index) => (
          <li key={item.id || index} className="tech-debt-item">
            <div className="tech-debt-header">
              <span className="tech-debt-id">{item.id}</span>
              <StatusBadge severity={item.priority} size="sm" />
            </div>

            <h4 className="tech-debt-name">{item.title}</h4>

            <div className="tech-debt-meta">
              {item.domain && (
                <span className="tech-debt-domain">{item.domain}</span>
              )}
              {item.effort && (
                <span className="tech-debt-effort">
                  <span className="effort-icon">\u23F1</span>
                  {item.effort}
                </span>
              )}
              {item.checkId && (
                <span className="tech-debt-check">From: {item.checkId}</span>
              )}
            </div>

            {item.description && (
              <p className="tech-debt-description">{item.description}</p>
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="tech-debt-more">
          <span>+ {items.length - maxItems} more recommendations</span>
        </div>
      )}
    </div>
  );
}

export default TechDebtList;
