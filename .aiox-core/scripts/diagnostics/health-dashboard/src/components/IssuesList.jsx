import React, { useState } from 'react';
import { StatusBadge } from './shared';
import './IssuesList.css';

const TIER_LABELS = {
  1: 'Auto-Fix Available',
  2: 'Confirm to Fix',
  3: 'Manual Guide'
};

/**
 * List of issues with actions
 */
function IssuesList({ issues = {}, onAction, maxItems = 10 }) {
  const [filter, setFilter] = useState('all');

  // Flatten issues from severity groups
  const allIssues = [];
  ['critical', 'high', 'medium', 'low'].forEach(severity => {
    if (issues[severity]) {
      issues[severity].forEach(issue => {
        allIssues.push({ ...issue, severity: severity.toUpperCase() });
      });
    }
  });

  // Filter issues
  const filteredIssues = filter === 'all'
    ? allIssues
    : allIssues.filter(i => i.severity.toLowerCase() === filter);

  // Limit display
  const displayedIssues = filteredIssues.slice(0, maxItems);
  const hasMore = filteredIssues.length > maxItems;

  const handleAction = (issue, action) => {
    if (onAction) {
      onAction(issue, action);
    }
  };

  return (
    <div className="issues-list">
      <div className="issues-header">
        <h3 className="issues-title">Issues ({allIssues.length})</h3>
        <div className="issues-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn filter-btn--critical ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical
          </button>
          <button
            className={`filter-btn filter-btn--high ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High
          </button>
          <button
            className={`filter-btn filter-btn--medium ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Medium
          </button>
        </div>
      </div>

      {displayedIssues.length === 0 ? (
        <div className="issues-empty">
          <span className="empty-icon">\u2713</span>
          <p>No issues found</p>
        </div>
      ) : (
        <ul className="issues-items">
          {displayedIssues.map((issue, index) => (
            <li key={issue.checkId || index} className="issue-item">
              <div className="issue-main">
                <div className="issue-info">
                  <span className="issue-id">{issue.checkId}</span>
                  <span className="issue-name">{issue.name || issue.message}</span>
                </div>
                <div className="issue-meta">
                  <StatusBadge severity={issue.severity} size="sm" />
                  {issue.domain && (
                    <span className="issue-domain">{issue.domain}</span>
                  )}
                </div>
              </div>

              {issue.message && issue.name && (
                <p className="issue-message">{issue.message}</p>
              )}

              {issue.autoFix && (
                <div className="issue-actions">
                  <span className="fix-tier">
                    Tier {issue.autoFix.tier}: {TIER_LABELS[issue.autoFix.tier]}
                  </span>
                  {issue.autoFix.tier === 1 && (
                    <button
                      className="action-btn action-btn--fix"
                      onClick={() => handleAction(issue, 'autofix')}
                    >
                      Auto-Fix
                    </button>
                  )}
                  {issue.autoFix.tier === 2 && (
                    <button
                      className="action-btn action-btn--confirm"
                      onClick={() => handleAction(issue, 'confirm')}
                    >
                      Review & Fix
                    </button>
                  )}
                  {issue.autoFix.tier === 3 && (
                    <button
                      className="action-btn action-btn--guide"
                      onClick={() => handleAction(issue, 'guide')}
                    >
                      View Guide
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="issues-more">
          <span>+ {filteredIssues.length - maxItems} more issues</span>
        </div>
      )}
    </div>
  );
}

export default IssuesList;
