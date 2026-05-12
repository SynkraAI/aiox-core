import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, StatusBadge } from './shared';
import HealthScore from './HealthScore';
import './DomainCard.css';

const DOMAIN_ICONS = {
  project: '\uD83D\uDD27',   // wrench
  local: '\uD83D\uDCBB',     // laptop
  repository: '\uD83D\uDCE6', // package
  deployment: '\uD83D\uDE80', // rocket
  services: '\uD83D\uDD17'   // link
};

const DOMAIN_LABELS = {
  project: 'Project Coherence',
  local: 'Local Environment',
  repository: 'Repository Health',
  deployment: 'Deployment',
  services: 'Service Integration'
};

/**
 * Domain health card with score and issues summary
 */
function DomainCard({ domain, data }) {
  const navigate = useNavigate();

  const icon = DOMAIN_ICONS[domain] || '\u2699';
  const label = DOMAIN_LABELS[domain] || domain;

  const handleClick = () => {
    navigate(`/domain/${domain}`);
  };

  // Count issues by severity
  const issueCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  if (data?.checks) {
    data.checks.forEach(check => {
      if (check.status === 'failed' && check.severity) {
        const key = check.severity.toLowerCase();
        if (issueCounts.hasOwnProperty(key)) {
          issueCounts[key]++;
        }
      }
    });
  }

  const totalIssues = Object.values(issueCounts).reduce((a, b) => a + b, 0);
  const passedChecks = data?.checks?.filter(c => c.status === 'passed').length || 0;
  const totalChecks = data?.checks?.length || 0;

  return (
    <Card className="domain-card" onClick={handleClick}>
      <div className="domain-card-header">
        <span className="domain-icon">{icon}</span>
        <div className="domain-info">
          <h3 className="domain-name">{label}</h3>
          <span className="domain-stats">
            {passedChecks}/{totalChecks} checks passed
          </span>
        </div>
        <StatusBadge status={data?.status || 'healthy'} size="sm" />
      </div>

      <div className="domain-card-body">
        <HealthScore score={data?.score || 0} size="md" showLabel={false} />

        <div className="domain-issues">
          {totalIssues === 0 ? (
            <p className="no-issues">No issues found</p>
          ) : (
            <div className="issue-counts">
              {issueCounts.critical > 0 && (
                <div className="issue-count issue-count--critical">
                  <span className="count">{issueCounts.critical}</span>
                  <span className="label">Critical</span>
                </div>
              )}
              {issueCounts.high > 0 && (
                <div className="issue-count issue-count--high">
                  <span className="count">{issueCounts.high}</span>
                  <span className="label">High</span>
                </div>
              )}
              {issueCounts.medium > 0 && (
                <div className="issue-count issue-count--medium">
                  <span className="count">{issueCounts.medium}</span>
                  <span className="label">Medium</span>
                </div>
              )}
              {issueCounts.low > 0 && (
                <div className="issue-count issue-count--low">
                  <span className="count">{issueCounts.low}</span>
                  <span className="label">Low</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="domain-card-footer">
        <span className="view-details">View Details &rarr;</span>
      </div>
    </Card>
  );
}

export default DomainCard;
