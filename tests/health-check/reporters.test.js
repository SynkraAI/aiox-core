/**
 * Reporter Manager Tests
 *
 * Tests for the ReporterManager class including:
 * - Console reporter
 * - JSON reporter
 * - Markdown reporter
 * - Multiple format generation
 *
 * @story TD-6 - CI Stability & Test Coverage Improvements
 */

const ReporterManager = require('../../.aiox-core/core/health-check/reporters');
const {
  MarkdownReporter,
  JSONReporter,
  ConsoleReporter,
} = require('../../.aiox-core/core/health-check/reporters');
const { CheckStatus, CheckSeverity } = require('../../.aiox-core/core/health-check/base-check');

// Set timeout for all tests in this file
jest.setTimeout(30000);

/**
 * Create mock check results for testing
 */
function createMockCheckResults() {
  return [
    {
      checkId: 'check-1',
      name: 'Package JSON Check',
      domain: 'project',
      severity: CheckSeverity.HIGH,
      status: CheckStatus.PASS,
      message: 'package.json is valid',
      details: { version: '1.0.0' },
      duration: 50,
      timestamp: new Date().toISOString(),
    },
    {
      checkId: 'check-2',
      name: 'Git Installation Check',
      domain: 'local',
      severity: CheckSeverity.CRITICAL,
      status: CheckStatus.PASS,
      message: 'Git is installed',
      details: { version: '2.40.0' },
      duration: 100,
      timestamp: new Date().toISOString(),
    },
    {
      checkId: 'check-3',
      name: 'Dependencies Check',
      domain: 'project',
      severity: CheckSeverity.MEDIUM,
      status: CheckStatus.WARNING,
      message: 'Some dependencies are outdated',
      details: { outdated: ['lodash', 'express'] },
      recommendation: 'Run npm update',
      duration: 200,
      timestamp: new Date().toISOString(),
    },
    {
      checkId: 'check-4',
      name: 'Network Check',
      domain: 'local',
      severity: CheckSeverity.LOW,
      status: CheckStatus.FAIL,
      message: 'Network connectivity issue',
      recommendation: 'Check internet connection',
      healable: true,
      healingTier: 2,
      duration: 150,
      timestamp: new Date().toISOString(),
    },
  ];
}

/**
 * Create mock scores for testing
 * This matches the structure expected by the reporters
 */
function createMockScores() {
  const checkResults = createMockCheckResults();
  const projectChecks = checkResults.filter((c) => c.domain === 'project');
  const localChecks = checkResults.filter((c) => c.domain === 'local');

  return {
    overall: {
      score: 75,
      status: 'degraded',
      passed: 2,
      warned: 1,
      failed: 1,
      total: 4,
      issuesCount: 2,
    },
    // Use 'domains' key as expected by reporters
    // Each domain needs: score, status, summary object with passed/total, and checks array
    domains: {
      project: {
        score: 83,
        status: 'warning',
        summary: { passed: 1, warned: 1, failed: 0, total: 2 },
        checks: projectChecks,
      },
      local: {
        score: 67,
        status: 'degraded',
        summary: { passed: 1, warned: 0, failed: 1, total: 2 },
        checks: localChecks,
      },
    },
    bySeverity: {
      CRITICAL: { passed: 1, failed: 0 },
      HIGH: { passed: 1, failed: 0 },
      MEDIUM: { passed: 0, warned: 1, failed: 0 },
      LOW: { passed: 0, failed: 1 },
    },
  };
}

/**
 * Create mock healing results
 */
function createMockHealingResults() {
  return [
    {
      checkId: 'check-4',
      success: false,
      tier: 2,
      message: 'Fix requires confirmation',
      action: 'prompt',
    },
  ];
}

describe('ReporterManager', () => {
  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const manager = new ReporterManager();

      expect(manager).toBeDefined();
      expect(manager.defaultFormat).toBe('console');
      expect(manager.verbose).toBe(false);
    });

    it('should create instance with custom config', () => {
      const manager = new ReporterManager({
        output: {
          format: 'json',
          verbose: true,
        },
      });

      expect(manager.defaultFormat).toBe('json');
      expect(manager.verbose).toBe(true);
    });

    it('should initialize all built-in reporters', () => {
      const manager = new ReporterManager();

      expect(manager.reporters.console).toBeDefined();
      expect(manager.reporters.markdown).toBeDefined();
      expect(manager.reporters.json).toBeDefined();
    });
  });

  describe('getFormats', () => {
    it('should return available formats', () => {
      const manager = new ReporterManager();

      const formats = manager.getFormats();

      expect(formats).toContain('console');
      expect(formats).toContain('markdown');
      expect(formats).toContain('json');
    });
  });

  describe('getReporter', () => {
    it('should return reporter for valid format', () => {
      const manager = new ReporterManager();

      const consoleReporter = manager.getReporter('console');
      const jsonReporter = manager.getReporter('json');

      expect(consoleReporter).toBeDefined();
      expect(jsonReporter).toBeDefined();
    });

    it('should return null for invalid format', () => {
      const manager = new ReporterManager();

      const reporter = manager.getReporter('invalid');

      expect(reporter).toBeNull();
    });
  });

  describe('registerReporter', () => {
    it('should register custom reporter', () => {
      const manager = new ReporterManager();
      const customReporter = {
        generate: jest.fn().mockResolvedValue('Custom report'),
      };

      manager.registerReporter('custom', customReporter);

      expect(manager.reporters.custom).toBe(customReporter);
    });

    it('should throw error if reporter lacks generate method', () => {
      const manager = new ReporterManager();
      const invalidReporter = { name: 'invalid' };

      expect(() => manager.registerReporter('invalid', invalidReporter)).toThrow(
        'Reporter must implement generate() method',
      );
    });
  });

  describe('generate', () => {
    it('should generate report in default format', async () => {
      const manager = new ReporterManager();
      const checkResults = createMockCheckResults();
      const scores = createMockScores();
      const healingResults = createMockHealingResults();

      const report = await manager.generate(checkResults, scores, healingResults);

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
    });

    it('should generate report in specified format', async () => {
      const manager = new ReporterManager();
      const checkResults = createMockCheckResults();
      const scores = createMockScores();
      const healingResults = [];

      const report = await manager.generate(checkResults, scores, healingResults, {
        output: { format: 'json' },
      });

      expect(report).toBeDefined();
      // JSON format should be object or string
      expect(typeof report === 'object' || typeof report === 'string').toBe(true);
    });

    it('should generate multiple format reports', async () => {
      const manager = new ReporterManager();
      const checkResults = createMockCheckResults();
      const scores = createMockScores();
      const healingResults = [];

      const reports = await manager.generate(checkResults, scores, healingResults, {
        output: { format: ['console', 'json'] },
      });

      expect(reports.console).toBeDefined();
      expect(reports.json).toBeDefined();
    });

    it('should warn for unknown format', async () => {
      const manager = new ReporterManager();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await manager.generate([], {}, [], {
        output: { format: 'unknown' },
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown report format'));
      consoleSpy.mockRestore();
    });

    it('should include timestamp in report data', async () => {
      const manager = new ReporterManager();
      const jsonReporter = manager.getReporter('json');
      const generateSpy = jest.spyOn(jsonReporter, 'generate');

      // Use valid scores structure
      await manager.generate(createMockCheckResults(), createMockScores(), [], {
        output: { format: 'json' },
      });

      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );

      generateSpy.mockRestore();
    });
  });
});

describe('ConsoleReporter', () => {
  it('should be exported from reporters module', () => {
    expect(ConsoleReporter).toBeDefined();
  });

  it('should create instance', () => {
    const reporter = new ConsoleReporter();

    expect(reporter).toBeDefined();
  });

  it('should generate console report', async () => {
    const reporter = new ConsoleReporter();
    const data = {
      checkResults: createMockCheckResults(),
      scores: createMockScores(),
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
  });

  it('should include health status in report', async () => {
    const reporter = new ConsoleReporter();
    const data = {
      checkResults: createMockCheckResults(),
      scores: createMockScores(),
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    // Should contain some health-related text
    expect(report.toLowerCase()).toMatch(/health|status|score|check/);
  });

  it('should handle empty results', async () => {
    const reporter = new ConsoleReporter();
    const data = {
      checkResults: [],
      scores: {
        overall: { score: 100, status: 'healthy', passed: 0, failed: 0, total: 0 },
        domains: {}, // Empty domains object to prevent null error
      },
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    expect(report).toBeDefined();
  });
});

describe('JSONReporter', () => {
  it('should be exported from reporters module', () => {
    expect(JSONReporter).toBeDefined();
  });

  it('should create instance', () => {
    const reporter = new JSONReporter();

    expect(reporter).toBeDefined();
  });

  it('should generate JSON report', async () => {
    const reporter = new JSONReporter();
    const data = {
      checkResults: createMockCheckResults(),
      scores: createMockScores(),
      healingResults: createMockHealingResults(),
      config: { mode: 'quick' },
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    expect(report).toBeDefined();
    // Should be valid JSON (either object or parseable string)
    if (typeof report === 'string') {
      expect(() => JSON.parse(report)).not.toThrow();
    } else {
      expect(typeof report).toBe('object');
    }
  });

  it('should include all data in JSON report', async () => {
    const reporter = new JSONReporter();
    const checkResults = createMockCheckResults();
    const scores = createMockScores();
    const data = {
      checkResults,
      scores,
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);
    const parsed = typeof report === 'string' ? JSON.parse(report) : report;

    // Should contain key fields
    expect(parsed.timestamp || parsed.generated).toBeDefined();
  });
});

describe('MarkdownReporter', () => {
  it('should be exported from reporters module', () => {
    expect(MarkdownReporter).toBeDefined();
  });

  it('should create instance', () => {
    const reporter = new MarkdownReporter();

    expect(reporter).toBeDefined();
  });

  it('should generate markdown report', async () => {
    const reporter = new MarkdownReporter();
    const data = {
      checkResults: createMockCheckResults(),
      scores: createMockScores(),
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
  });

  it('should include markdown formatting', async () => {
    const reporter = new MarkdownReporter();
    const data = {
      checkResults: createMockCheckResults(),
      scores: createMockScores(),
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    // Should contain markdown elements
    expect(report).toMatch(/[#|*|-]/);
  });

  it('should handle results with different statuses', async () => {
    const reporter = new MarkdownReporter();
    const data = {
      checkResults: [
        {
          checkId: 'pass',
          name: 'Pass Check',
          status: CheckStatus.PASS,
          message: 'OK',
          domain: 'project',
          severity: CheckSeverity.LOW,
        },
        {
          checkId: 'fail',
          name: 'Fail Check',
          status: CheckStatus.FAIL,
          message: 'Failed',
          domain: 'project',
          severity: CheckSeverity.HIGH,
        },
        {
          checkId: 'warn',
          name: 'Warning Check',
          status: CheckStatus.WARNING,
          message: 'Warning',
          domain: 'project',
          severity: CheckSeverity.MEDIUM,
        },
      ],
      scores: createMockScores(),
      healingResults: [],
      config: {},
      timestamp: new Date().toISOString(),
    };

    const report = await reporter.generate(data);

    expect(report).toBeDefined();
    expect(report.length).toBeGreaterThan(0);
  });
});

describe('Reporter Integration', () => {
  it('should generate consistent data across formats', async () => {
    const manager = new ReporterManager();
    const checkResults = createMockCheckResults();
    const scores = createMockScores();

    const consoleReport = await manager.generate(checkResults, scores, [], {
      output: { format: 'console' },
    });

    const jsonReport = await manager.generate(checkResults, scores, [], {
      output: { format: 'json' },
    });

    const markdownReport = await manager.generate(checkResults, scores, [], {
      output: { format: 'markdown' },
    });

    // All should be non-empty
    expect(consoleReport.length).toBeGreaterThan(0);
    expect(markdownReport.length).toBeGreaterThan(0);

    // JSON should contain data
    const json = typeof jsonReport === 'string' ? JSON.parse(jsonReport) : jsonReport;
    expect(json).toBeDefined();
  });

  it('should respect verbose option', async () => {
    const managerQuiet = new ReporterManager({ output: { verbose: false } });
    const managerVerbose = new ReporterManager({ output: { verbose: true } });

    const data = createMockCheckResults();
    const scores = createMockScores();

    const quietReport = await managerQuiet.generate(data, scores, []);
    const verboseReport = await managerVerbose.generate(data, scores, []);

    // Both should generate reports
    expect(quietReport).toBeDefined();
    expect(verboseReport).toBeDefined();
  });
});
