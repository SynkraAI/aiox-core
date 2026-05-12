import { useState, useEffect, useCallback } from 'react';

const DEFAULT_REPORT_PATH = '../../.aiox/reports/health-check-latest.json';

/**
 * Custom hook for loading health check data
 */
function useHealthData(options = {}) {
  const { reportPath = DEFAULT_REPORT_PATH, autoLoad = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load from file system (for Electron) or fetch (for web)
      let reportData;

      if (typeof window !== 'undefined' && window.electronAPI) {
        // Electron environment
        reportData = await window.electronAPI.readFile(reportPath);
      } else {
        // Web environment - fetch from public folder or API
        const response = await fetch('/api/health-report');
        if (!response.ok) {
          // Fallback to sample data if API not available
          reportData = getSampleData();
        } else {
          reportData = await response.json();
        }
      }

      setData(reportData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load health data:', err);
      // Use sample data as fallback
      setData(getSampleData());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [reportPath]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}

/**
 * Get sample data for development/demo
 */
function getSampleData() {
  return {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'full',
    duration: '12s',
    overall: {
      score: 87,
      status: 'healthy',
      issuesCount: 5,
      autoFixedCount: 2,
    },
    domains: {
      project: {
        score: 95,
        status: 'healthy',
        checks: [
          { id: 'PC-001', name: 'Config file exists', status: 'passed', duration: '5ms' },
          { id: 'PC-002', name: 'Tasks references valid', status: 'passed', duration: '45ms' },
          {
            id: 'PC-003',
            name: 'coding-standards.md exists',
            status: 'failed',
            severity: 'MEDIUM',
            message: 'File not found',
            autoFix: { available: true, tier: 2, action: 'create-from-template' },
          },
          { id: 'PC-004', name: 'tech-stack.md exists', status: 'passed', duration: '3ms' },
          { id: 'PC-005', name: 'source-tree.md exists', status: 'passed', duration: '4ms' },
          { id: 'PC-006', name: 'No orphan files', status: 'passed', duration: '120ms' },
          { id: 'PC-007', name: 'Manifests valid YAML', status: 'passed', duration: '85ms' },
          {
            id: 'PC-008',
            name: 'Templates reference valid paths',
            status: 'passed',
            duration: '65ms',
          },
        ],
      },
      local: {
        score: 90,
        status: 'healthy',
        checks: [
          { id: 'LE-001', name: 'Node.js installed', status: 'passed', duration: '15ms' },
          { id: 'LE-002', name: 'npm available', status: 'passed', duration: '12ms' },
          { id: 'LE-003', name: 'Git installed', status: 'passed', duration: '8ms' },
          { id: 'LE-004', name: 'GitHub CLI authenticated', status: 'passed', duration: '250ms' },
          { id: 'LE-005', name: 'MCPs responding', status: 'passed', duration: '180ms' },
          {
            id: 'LE-006',
            name: 'CLAUDE.md valid',
            status: 'failed',
            severity: 'LOW',
            message: 'Missing recommended sections',
            autoFix: { available: true, tier: 3, action: 'show-guide' },
          },
          { id: 'LE-007', name: 'IDE rules configured', status: 'passed', duration: '25ms' },
          { id: 'LE-008', name: 'Required env vars set', status: 'passed', duration: '10ms' },
        ],
      },
      repository: {
        score: 85,
        status: 'degraded',
        checks: [
          { id: 'RH-001', name: 'GitHub Actions valid', status: 'passed', duration: '450ms' },
          {
            id: 'RH-002',
            name: 'No failed workflows',
            status: 'failed',
            severity: 'HIGH',
            message: '2 workflows failed in last 10 runs',
            autoFix: { available: false, tier: 3 },
          },
          { id: 'RH-003', name: 'Branch protection on main', status: 'passed', duration: '320ms' },
          {
            id: 'RH-004',
            name: 'Required secrets configured',
            status: 'passed',
            duration: '150ms',
          },
          { id: 'RH-005', name: 'No stale PRs', status: 'passed', duration: '280ms' },
          {
            id: 'RH-006',
            name: 'Dependencies up to date',
            status: 'failed',
            severity: 'MEDIUM',
            message: '3 outdated dependencies',
            autoFix: { available: true, tier: 2, action: 'npm-update' },
          },
          {
            id: 'RH-007',
            name: 'No critical vulnerabilities',
            status: 'passed',
            duration: '1200ms',
          },
          { id: 'RH-008', name: '.gitignore complete', status: 'passed', duration: '8ms' },
        ],
      },
      deployment: {
        score: 80,
        status: 'degraded',
        checks: [
          { id: 'DE-001', name: 'Deployment mode detected', status: 'passed', duration: '5ms' },
          { id: 'DE-002', name: 'Environment vars per env', status: 'passed', duration: '35ms' },
          {
            id: 'DE-003',
            name: 'Remote connection healthy',
            status: 'skipped',
            message: 'N/A for local mode',
          },
          {
            id: 'DE-004',
            name: 'SSL certificates valid',
            status: 'skipped',
            message: 'N/A for local mode',
          },
          {
            id: 'DE-005',
            name: 'Service endpoints responding',
            status: 'failed',
            severity: 'HIGH',
            message: 'API endpoint timeout',
            autoFix: { available: false, tier: 3 },
          },
        ],
      },
      services: {
        score: 95,
        status: 'healthy',
        checks: [
          { id: 'SI-001', name: 'Backlog manager operational', status: 'passed', duration: '45ms' },
          { id: 'SI-002', name: 'GitHub API accessible', status: 'passed', duration: '320ms' },
          { id: 'SI-003', name: 'MCP servers healthy', status: 'passed', duration: '180ms' },
          { id: 'SI-004', name: 'Memory layer status', status: 'passed', duration: '90ms' },
        ],
      },
    },
    issues: {
      critical: [],
      high: [
        {
          checkId: 'RH-002',
          name: 'Failed workflows',
          message: '2 workflows failed in last 10 runs',
          domain: 'repository',
        },
        {
          checkId: 'DE-005',
          name: 'Service endpoints',
          message: 'API endpoint timeout',
          domain: 'deployment',
        },
      ],
      medium: [
        {
          checkId: 'PC-003',
          name: 'coding-standards.md',
          message: 'File not found',
          domain: 'project',
          autoFix: { tier: 2, action: 'create-from-template' },
        },
        {
          checkId: 'RH-006',
          name: 'Dependencies',
          message: '3 outdated dependencies',
          domain: 'repository',
          autoFix: { tier: 2, action: 'npm-update' },
        },
      ],
      low: [
        {
          checkId: 'LE-006',
          name: 'CLAUDE.md',
          message: 'Missing recommended sections',
          domain: 'local',
          autoFix: { tier: 3, action: 'show-guide' },
        },
      ],
    },
    autoFixed: [
      {
        checkId: 'RH-008',
        action: 'added-node_modules-to-gitignore',
        backup: '.aiox/backups/gitignore.1704380400',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        checkId: 'PC-001',
        action: 'recreated-config',
        backup: '.aiox/backups/config.yaml.1704376800',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    techDebt: [
      {
        id: 'DEBT-001',
        title: 'Update GitHub Actions to v4',
        priority: 'MEDIUM',
        effort: '30min',
        domain: 'repository',
        checkId: 'RH-006',
      },
      {
        id: 'DEBT-002',
        title: 'Add missing documentation sections',
        priority: 'LOW',
        effort: '1h',
        domain: 'project',
        checkId: 'PC-003',
      },
      {
        id: 'DEBT-003',
        title: 'Configure CLAUDE.md properly',
        priority: 'LOW',
        effort: '15min',
        domain: 'local',
        checkId: 'LE-006',
      },
    ],
    history: {
      trend: [
        { date: '2025-12-28', score: 78 },
        { date: '2025-12-29', score: 82 },
        { date: '2025-12-30', score: 85 },
        { date: '2025-12-31', score: 84 },
        { date: '2026-01-01', score: 86 },
        { date: '2026-01-02', score: 85 },
        { date: '2026-01-03', score: 87 },
      ],
      previousScore: 85,
      scoreDelta: 2,
    },
  };
}

export default useHealthData;
