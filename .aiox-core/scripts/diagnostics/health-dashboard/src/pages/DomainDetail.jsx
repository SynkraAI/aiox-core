import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, StatusBadge, TrendChart, HealthScore } from '../components';
import { useHealthData } from '../hooks';
import './DomainDetail.css';

const DOMAIN_LABELS = {
  project: 'Project Coherence',
  local: 'Local Environment',
  repository: 'Repository Health',
  deployment: 'Deployment',
  services: 'Service Integration'
};

const DOMAIN_DESCRIPTIONS = {
  project: 'Validates AIOX configuration files, task definitions, agent references, and template integrity.',
  local: 'Checks development environment prerequisites including Node.js, Git, IDE configuration, and environment variables.',
  repository: 'Monitors GitHub Actions, branch protection, dependencies, and security vulnerabilities.',
  deployment: 'Verifies deployment configuration, environment variables, and service endpoints.',
  services: 'Tests connectivity to external services including GitHub API, MCP servers, and the memory layer.'
};

/**
 * Domain detail page with full check results
 */
function DomainDetail() {
  const { domainId } = useParams();
  const { data, loading, refresh } = useHealthData();

  if (loading && !data) {
    return (
      <div className="domain-loading">
        <div className="loading-spinner"></div>
        <p>Loading domain data...</p>
      </div>
    );
  }

  const domainData = data?.domains?.[domainId];

  if (!domainData) {
    return (
      <div className="domain-not-found">
        <h2>Domain not found</h2>
        <p>The domain "{domainId}" does not exist.</p>
        <Link to="/" className="back-link">&larr; Back to Dashboard</Link>
      </div>
    );
  }

  const label = DOMAIN_LABELS[domainId] || domainId;
  const description = DOMAIN_DESCRIPTIONS[domainId] || '';
  const checks = domainData.checks || [];
  const passedCount = checks.filter(c => c.status === 'passed').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;
  const skippedCount = checks.filter(c => c.status === 'skipped').length;

  return (
    <div className="domain-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link>
        <span className="separator">/</span>
        <span className="current">{label}</span>
      </nav>

      {/* Header */}
      <div className="domain-header">
        <div className="domain-info">
          <h1>{label}</h1>
          <p className="domain-description">{description}</p>
        </div>
        <div className="domain-score">
          <HealthScore score={domainData.score || 0} size="lg" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <Card className="summary-card summary-card--passed">
          <div className="summary-value">{passedCount}</div>
          <div className="summary-label">Passed</div>
        </Card>
        <Card className="summary-card summary-card--failed">
          <div className="summary-value">{failedCount}</div>
          <div className="summary-label">Failed</div>
        </Card>
        <Card className="summary-card summary-card--skipped">
          <div className="summary-value">{skippedCount}</div>
          <div className="summary-label">Skipped</div>
        </Card>
        <Card className="summary-card">
          <div className="summary-value">{checks.length}</div>
          <div className="summary-label">Total Checks</div>
        </Card>
      </div>

      {/* Checks Table */}
      <section className="checks-section">
        <h2>All Checks</h2>
        <div className="checks-table-wrapper">
          <table className="checks-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Check Name</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Duration</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check, index) => (
                <tr key={check.id || index} className={`check-row check-row--${check.status}`}>
                  <td className="check-id">
                    <code>{check.id}</code>
                  </td>
                  <td className="check-name">{check.name}</td>
                  <td className="check-status">
                    <StatusBadge status={check.status} size="sm" />
                  </td>
                  <td className="check-severity">
                    {check.severity ? (
                      <StatusBadge severity={check.severity} size="sm" />
                    ) : (
                      <span className="na">-</span>
                    )}
                  </td>
                  <td className="check-duration">
                    {check.duration || '-'}
                  </td>
                  <td className="check-details">
                    {check.message && (
                      <span className="check-message">{check.message}</span>
                    )}
                    {check.autoFix?.available && (
                      <span className="autofix-available">
                        Tier {check.autoFix.tier} fix available
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions */}
      <div className="domain-actions">
        <button className="action-btn action-btn--primary" onClick={refresh}>
          Re-run Checks
        </button>
        <Link to="/" className="action-btn action-btn--secondary">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default DomainDetail;
