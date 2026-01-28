/**
 * Unit Tests: Report Generator
 * Story 1.8 - Task 1.8.5 (QA Fix - Coverage Improvement)
 */

const { generateReport } = require('../../../../src/wizard/validation/report-generator');

describe('Report Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    it('should generate report for successful validation', async () => {
      // Given
      const validationResults = {
        timestamp: new Date().toISOString(),
        components: {
          files: {
            success: true,
            checks: [{ component: 'IDE Config', status: 'success', message: 'Created' }],
            errors: [],
            warnings: [],
          },
          configs: {
            success: true,
            checks: [],
            errors: [],
            warnings: [],
          },
          mcps: {
            success: true,
            healthChecks: [],
            errors: [],
            warnings: [],
          },
          dependencies: {
            success: true,
            checks: [],
            errors: [],
            warnings: [],
          },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Installation Validation Report');
      expect(report).toContain('Overall Status');
      expect(report).toContain('All checks passed');
    });

    it('should generate report with high severity warnings', async () => {
      // Given - only high/critical severity warnings are shown
      const validationResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [{ component: 'mcps', severity: 'high', message: 'MCP health check timeout' }],
        overallStatus: 'warning',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Warnings');
      expect(report).toContain('MCP health check timeout');
    });

    it('should generate report with errors', async () => {
      // Given
      const validationResults = {
        components: {
          files: { success: false, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [{ component: 'files', severity: 'critical', message: '.env file missing' }],
        warnings: [],
        overallStatus: 'failed',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Errors');
      expect(report).toContain('.env file missing');
      expect(report).toContain('FAILED');
    });

    it('should generate report with mixed results', async () => {
      // Given
      const validationResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: false, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [{ component: 'configs', severity: 'high', message: 'YAML parse error' }],
        warnings: [{ component: 'dependencies', severity: 'high', message: '3 vulnerabilities' }],
        overallStatus: 'partial',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Errors');
      expect(report).toContain('Warnings');
      expect(report).toContain('YAML parse error');
      expect(report).toContain('3 vulnerabilities');
    });

    it('should format file validation results correctly', async () => {
      // Given
      const validationResults = {
        components: {
          files: {
            success: true,
            checks: [
              {
                component: 'IDE Config',
                file: '.cursor/settings.json',
                status: 'success',
                message: 'Created',
              },
              { component: 'Environment', file: '.env', status: 'success', message: 'Created' },
            ],
            errors: [],
            warnings: [],
          },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('IDE Config');
      expect(report).toContain('.cursor/settings.json');
      expect(report).toContain('Environment');
      expect(report).toContain('.env');
    });

    it('should format config validation results correctly', async () => {
      // Given
      const validationResults = {
        components: {
          files: {
            success: true,
            checks: [
              {
                component: 'Environment',
                file: '.env',
                status: 'success',
                message: 'Validated (5 variables)',
              },
              {
                component: 'Core Config',
                file: 'core-config.yaml',
                status: 'success',
                message: 'Valid YAML',
              },
            ],
            errors: [],
            warnings: [],
          },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Environment Configuration');
      expect(report).toContain('Core Configuration');
      expect(report).toContain('Valid YAML');
    });

    it('should format MCP health check results correctly', async () => {
      // Given
      const validationResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: {
            success: true,
            healthChecks: [
              { mcp: 'browser', status: 'success', message: 'Healthy', responseTime: 250 },
              { mcp: 'context7', status: 'success', message: 'Healthy', responseTime: 180 },
              { mcp: 'exa', status: 'warning', message: 'Timeout', responseTime: 5000 },
            ],
            errors: [],
            warnings: [],
          },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('browser');
      expect(report).toContain('context7');
      expect(report).toContain('exa');
      expect(report).toContain('250ms');
      expect(report).toContain('180ms');
    });

    it('should format dependency validation results correctly', async () => {
      // Given
      const validationResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: {
            success: true,
            checks: [
              { component: 'Dependencies', status: 'success', message: '247 packages installed' },
            ],
            errors: [],
            warnings: [],
          },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Dependencies');
      expect(report).toContain('247 packages');
    });

    it('should display overall status correctly for each state', async () => {
      // Given - Test success and warning (both show "All checks passed!")
      const successResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };
      let report = await generateReport(successResults);
      expect(report).toContain('Overall Status');
      expect(report).toContain('All checks passed');

      // Test warning (also shows "All checks passed!")
      successResults.overallStatus = 'warning';
      report = await generateReport(successResults);
      expect(report).toContain('All checks passed');

      // Test partial
      const partialResults = {
        ...successResults,
        errors: [{ message: 'test' }],
        overallStatus: 'partial',
      };
      report = await generateReport(partialResults);
      expect(report).toContain('PARTIAL');

      // Test failed
      const failedResults = {
        ...successResults,
        errors: [{ message: 'test' }],
        overallStatus: 'failed',
      };
      report = await generateReport(failedResults);
      expect(report).toContain('FAILED');
    });

    it('should list warnings section only for high/critical severity warnings', async () => {
      // Given - low severity warnings (should NOT be shown)
      const lowSeverityResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [
          { component: 'mcps', severity: 'low', message: 'Low Warning' },
          { component: 'deps', severity: 'medium', message: 'Medium Warning' },
        ],
        overallStatus: 'warning',
      };

      let report = await generateReport(lowSeverityResults);
      expect(report).not.toContain('Warnings');
      expect(report).not.toContain('Low Warning');

      // Given - high severity warnings (SHOULD be shown)
      const highSeverityResults = {
        ...lowSeverityResults,
        warnings: [
          { component: 'mcps', severity: 'high', message: 'High Warning 1' },
          { component: 'deps', severity: 'critical', message: 'Critical Warning 2' },
        ],
      };

      report = await generateReport(highSeverityResults);
      expect(report).toContain('Warnings');
      expect(report).toContain('High Warning 1');
      expect(report).toContain('Critical Warning 2');
    });

    it('should list errors section when errors present', async () => {
      // Given
      const validationResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [
          { component: 'files', severity: 'critical', message: 'Error 1' },
          { component: 'configs', severity: 'high', message: 'Error 2' },
        ],
        warnings: [],
        overallStatus: 'failed',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Errors');
      expect(report).toContain('Error 1');
      expect(report).toContain('Error 2');
    });

    it('should display next steps section only for errors', async () => {
      // Given - success case (no next steps shown)
      const successResults = {
        components: {
          files: { success: true, checks: [], errors: [], warnings: [] },
          configs: { success: true, checks: [], errors: [], warnings: [] },
          mcps: { success: true, healthChecks: [], errors: [], warnings: [] },
          dependencies: { success: true, checks: [], errors: [], warnings: [] },
        },
        errors: [],
        warnings: [],
        overallStatus: 'success',
      };

      const successReport = await generateReport(successResults);
      expect(successReport).not.toContain('Next Steps');
      expect(successReport).toContain('All checks passed');

      // Given - error case (next steps shown)
      const errorResults = {
        ...successResults,
        errors: [{ message: 'Test error', severity: 'high' }],
        overallStatus: 'failed',
      };

      const errorReport = await generateReport(errorResults);
      expect(errorReport).toContain('Next Steps');
    });

    it('should handle empty validation results', async () => {
      // Given
      const validationResults = {
        components: {},
        errors: [],
        warnings: [],
        overallStatus: 'unknown',
      };

      // When
      const report = await generateReport(validationResults);

      // Then
      expect(report).toContain('Installation Validation Report');
      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
    });
  });
});
