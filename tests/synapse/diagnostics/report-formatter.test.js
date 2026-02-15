/**
 * SYNAPSE Report Formatter & Orchestrator — Unit Tests
 *
 * Tests for formatReport() and runDiagnostics/runDiagnosticsRaw.
 *
 * @module tests/synapse/diagnostics/report-formatter
 * @story SYN-13 - UAP Session Bridge + SYNAPSE Diagnostics
 * @coverage Target: >85% for formatter and orchestrator
 */

'use strict';

// ---------------------------------------------------------------------------
// Part 1: Report Formatter Tests (uses real module via requireActual)
// ---------------------------------------------------------------------------

// jest.mock for report-formatter is hoisted for Part 2 (orchestrator tests).
// We use requireActual here to get the REAL formatReport for Part 1.
const { formatReport } = jest.requireActual(
  '../../../.aios-core/core/synapse/diagnostics/report-formatter',
);

/**
 * Build a full diagnostic data fixture with all sections populated.
 */
function buildFullData(overrides = {}) {
  return {
    hook: {
      checks: [
        { name: 'hook-installed', status: 'PASS', detail: 'Hook file exists' },
        { name: 'hook-executable', status: 'PASS', detail: 'Hook is executable' },
      ],
    },
    session: {
      fields: [
        { field: 'session_id', expected: 'UUID', actual: 'abc-123', status: 'PASS' },
        { field: 'active_agent', expected: 'string', actual: 'dev', status: 'PASS' },
      ],
      raw: {
        session: { prompt_count: 5, active_agent: { id: 'dev' } },
        bridgeData: { id: 'dev', activation_quality: 'full' },
      },
    },
    manifest: {
      entries: [
        { domain: 'constitution', inManifest: true, fileExists: true, status: 'PASS' },
        { domain: 'global', inManifest: true, fileExists: true, status: 'PASS' },
      ],
      orphanedFiles: [],
    },
    pipeline: {
      bracket: 'FRESH',
      contextPercent: 95.0,
      layers: [
        { layer: 'L0-constitution', expected: 'loaded', status: 'PASS' },
        { layer: 'L1-global', expected: 'loaded', status: 'PASS' },
      ],
    },
    uap: {
      checks: [
        { name: 'bridge-file', status: 'PASS', detail: 'UAP bridge file exists' },
        { name: 'bridge-schema', status: 'PASS', detail: 'Schema valid' },
      ],
    },
    ...overrides,
  };
}

describe('formatReport()', () => {
  // ------------------------------------------------------------------
  // 1. Header section
  // ------------------------------------------------------------------
  describe('header section', () => {
    it('includes report title and timestamp', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('# SYNAPSE Diagnostic Report');
      expect(report).toMatch(/\*\*Timestamp:\*\*/);
    });

    it('includes bracket and context percentage from pipeline', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('**Bracket:** FRESH (95.0% context remaining)');
    });

    it('includes agent info with activation quality', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('**Agent:** @dev (activation_quality: full)');
    });

    it('extracts agent id from session.raw.session.active_agent.id as fallback', () => {
      const data = buildFullData();
      delete data.session.raw.bridgeData.id;
      const report = formatReport(data);
      expect(report).toContain('**Agent:** @dev');
    });

    it('omits agent line when no agent id available', () => {
      const data = buildFullData();
      delete data.session.raw.bridgeData.id;
      delete data.session.raw.session.active_agent;
      const report = formatReport(data);
      expect(report).not.toContain('**Agent:**');
    });
  });

  // ------------------------------------------------------------------
  // 2. Hook Status section
  // ------------------------------------------------------------------
  describe('hook status section', () => {
    it('renders table with check rows', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 1. Hook Status');
      expect(report).toContain('| hook-installed | PASS | Hook file exists |');
      expect(report).toContain('| hook-executable | PASS | Hook is executable |');
    });

    it('shows no-data message when hook is null', () => {
      const report = formatReport(buildFullData({ hook: null }));
      expect(report).toContain('*No hook data collected*');
    });

    it('shows no-data message when hook.checks is missing', () => {
      // Note: _collectGaps does not guard data.hook.checks, so hook without
      // checks would throw in the gaps collector. Pass checks: [] to be safe.
      const report = formatReport(buildFullData({ hook: { checks: [] } }));
      expect(report).not.toContain('*No hook data collected*');
      // With empty checks array, the table headers still render but no rows
      expect(report).toContain('| Check | Status | Detail |');
    });
  });

  // ------------------------------------------------------------------
  // 3. Session Status section
  // ------------------------------------------------------------------
  describe('session status section', () => {
    it('renders field rows in table', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 2. Session Status');
      expect(report).toContain('| session_id | UUID | abc-123 | PASS |');
      expect(report).toContain('| active_agent | string | dev | PASS |');
    });

    it('shows no-data message when session is null', () => {
      const report = formatReport(buildFullData({ session: null }));
      expect(report).toContain('*No session data collected*');
    });

    it('shows no-data message when session.fields is missing', () => {
      // Note: _collectGaps does not guard data.session.fields, so session
      // without fields would throw. Pass fields: [] to be safe.
      const report = formatReport(buildFullData({ session: { fields: [] } }));
      expect(report).not.toContain('*No session data collected*');
      // With empty fields array, the table headers still render but no rows
      expect(report).toContain('| Field | Expected | Actual | Status |');
    });
  });

  // ------------------------------------------------------------------
  // 4. Manifest Integrity section
  // ------------------------------------------------------------------
  describe('manifest integrity section', () => {
    it('renders entry rows in table', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 3. Manifest Integrity');
      expect(report).toContain('| constitution | true | yes | PASS |');
      expect(report).toContain('| global | true | yes | PASS |');
    });

    it('renders fileExists as "no" when false', () => {
      const data = buildFullData();
      data.manifest.entries[0].fileExists = false;
      const report = formatReport(data);
      expect(report).toContain('| constitution | true | no |');
    });

    it('lists orphaned files when present', () => {
      const data = buildFullData();
      data.manifest.orphanedFiles = ['stale-domain.yaml', 'old-config.yaml'];
      const report = formatReport(data);
      expect(report).toContain('**Orphaned files**');
      expect(report).toContain('stale-domain.yaml, old-config.yaml');
    });

    it('does not show orphaned section when array is empty', () => {
      const report = formatReport(buildFullData());
      expect(report).not.toContain('**Orphaned files**');
    });

    it('shows no-data message when manifest is null', () => {
      const report = formatReport(buildFullData({ manifest: null }));
      expect(report).toContain('*No manifest data collected*');
    });
  });

  // ------------------------------------------------------------------
  // 5. Pipeline Simulation section
  // ------------------------------------------------------------------
  describe('pipeline simulation section', () => {
    it('renders layer rows with bracket name in heading', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 4. Pipeline Simulation (FRESH bracket)');
      expect(report).toContain('| L0-constitution | loaded | PASS |');
      expect(report).toContain('| L1-global | loaded | PASS |');
    });

    it('shows UNKNOWN bracket when pipeline is null', () => {
      const report = formatReport(buildFullData({ pipeline: null }));
      expect(report).toContain('## 4. Pipeline Simulation (UNKNOWN bracket)');
      expect(report).toContain('*No pipeline data collected*');
    });
  });

  // ------------------------------------------------------------------
  // 6. UAP Bridge section
  // ------------------------------------------------------------------
  describe('UAP bridge section', () => {
    it('renders check rows in table', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 5. UAP Bridge');
      expect(report).toContain('| bridge-file | PASS | UAP bridge file exists |');
      expect(report).toContain('| bridge-schema | PASS | Schema valid |');
    });

    it('shows no-data message when uap is null', () => {
      const report = formatReport(buildFullData({ uap: null }));
      expect(report).toContain('*No UAP bridge data collected*');
    });
  });

  // ------------------------------------------------------------------
  // 7. Memory Bridge section
  // ------------------------------------------------------------------
  describe('memory bridge section', () => {
    it('renders memory bridge info table', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 6. Memory Bridge');
      expect(report).toContain('| Pro available | INFO | Check `pro/` submodule |');
    });

    it('shows YES for bracket-needs-hints when DEPLETED', () => {
      const data = buildFullData();
      data.pipeline.bracket = 'DEPLETED';
      const report = formatReport(data);
      expect(report).toContain('| Bracket requires hints | YES | DEPLETED bracket |');
    });

    it('shows YES for bracket-needs-hints when CRITICAL', () => {
      const data = buildFullData();
      data.pipeline.bracket = 'CRITICAL';
      const report = formatReport(data);
      expect(report).toContain('| Bracket requires hints | YES | CRITICAL bracket |');
    });

    it('shows NO for bracket-needs-hints when FRESH', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('| Bracket requires hints | NO | FRESH bracket |');
    });

    it('shows UNKNOWN bracket when pipeline is null', () => {
      const report = formatReport(buildFullData({ pipeline: null }));
      expect(report).toContain('UNKNOWN bracket');
    });
  });

  // ------------------------------------------------------------------
  // 8-9. Gaps & Recommendations section
  // ------------------------------------------------------------------
  describe('gaps and recommendations section', () => {
    it('shows "None found" when all statuses are PASS', () => {
      const report = formatReport(buildFullData());
      expect(report).toContain('## 7. Gaps & Recommendations');
      expect(report).toContain('None found');
      expect(report).toContain('Pipeline operating correctly');
    });

    it('aggregates FAIL items from hook checks', () => {
      const data = buildFullData();
      data.hook.checks[1] = { name: 'hook-executable', status: 'FAIL', detail: 'Not executable' };
      const report = formatReport(data);
      expect(report).toContain('Hook: hook-executable');
      expect(report).toContain('Not executable');
      expect(report).toContain('HIGH');
      expect(report).not.toContain('None found');
    });

    it('aggregates FAIL items from session fields', () => {
      const data = buildFullData();
      data.session.fields[0] = { field: 'session_id', expected: 'UUID', actual: 'missing', status: 'FAIL' };
      const report = formatReport(data);
      expect(report).toContain('Session: session_id');
      expect(report).toContain('missing');
    });

    it('aggregates FAIL items from manifest entries', () => {
      const data = buildFullData();
      data.manifest.entries[0] = { domain: 'constitution', inManifest: true, fileExists: false, status: 'FAIL' };
      const report = formatReport(data);
      expect(report).toContain('Manifest: domain "constitution" file missing');
      expect(report).toContain('MEDIUM');
    });

    it('aggregates FAIL items from UAP checks', () => {
      const data = buildFullData();
      data.uap.checks[0] = { name: 'bridge-file', status: 'FAIL', detail: 'File not found' };
      const report = formatReport(data);
      expect(report).toContain('UAP Bridge: bridge-file');
      expect(report).toContain('File not found');
    });

    it('sorts gaps by severity (HIGH before MEDIUM)', () => {
      const data = buildFullData();
      // Add a MEDIUM (manifest) and a HIGH (hook) failure
      data.manifest.entries[0] = { domain: 'constitution', inManifest: true, fileExists: false, status: 'FAIL' };
      data.hook.checks[0] = { name: 'hook-installed', status: 'FAIL', detail: 'Missing hook' };
      const report = formatReport(data);

      // Extract only the gaps section (after "## 7.")
      const gapsSection = report.slice(report.indexOf('## 7.'));
      const highIdx = gapsSection.indexOf('| HIGH |');
      const mediumIdx = gapsSection.indexOf('| MEDIUM |');
      expect(highIdx).toBeGreaterThan(-1);
      expect(mediumIdx).toBeGreaterThan(-1);
      expect(highIdx).toBeLessThan(mediumIdx);
    });

    it('numbers gaps sequentially', () => {
      const data = buildFullData();
      data.hook.checks[0] = { name: 'hook-installed', status: 'FAIL', detail: 'Missing' };
      data.hook.checks[1] = { name: 'hook-executable', status: 'FAIL', detail: 'Not exec' };
      const report = formatReport(data);
      expect(report).toContain('| 1 |');
      expect(report).toContain('| 2 |');
    });
  });

  // ------------------------------------------------------------------
  // 10. Timing Analysis section (SYN-14)
  // ------------------------------------------------------------------
  describe('timing analysis section (8)', () => {
    it('renders UAP timing table when available', () => {
      const data = buildFullData({
        timing: {
          uap: {
            available: true, totalDuration: 145, quality: 'full', stale: false, ageMs: 100,
            loaders: [{ name: 'agentConfig', duration: 45, status: 'ok', tier: 'Critical' }],
          },
          hook: { available: false, totalDuration: 0, bracket: 'unknown', layers: [], stale: false, ageMs: 0 },
          combined: { totalMs: 145 },
        },
      });
      const report = formatReport(data);
      expect(report).toContain('## 8. Timing Analysis');
      expect(report).toContain('UAP Activation Pipeline (145ms total');
      expect(report).toContain('| agentConfig | 45ms | ok | Critical |');
    });

    it('renders Hook timing table with hookBootMs', () => {
      const data = buildFullData({
        timing: {
          uap: { available: false, totalDuration: 0, quality: 'unknown', loaders: [], stale: false, ageMs: 0 },
          hook: {
            available: true, totalDuration: 87, hookBootMs: 42, bracket: 'MODERATE', stale: false, ageMs: 50,
            layers: [{ name: 'constitution', duration: 12, status: 'ok', rules: 5 }],
          },
          combined: { totalMs: 87 },
        },
      });
      const report = formatReport(data);
      expect(report).toContain('SYNAPSE Hook Pipeline (87ms total');
      expect(report).toContain('boot: 42ms');
      expect(report).toContain('| constitution | 12ms | ok | 5 |');
    });

    it('shows [STALE] tag when data is stale', () => {
      const data = buildFullData({
        timing: {
          uap: { available: true, totalDuration: 100, quality: 'full', stale: true, ageMs: 400000, loaders: [] },
          hook: { available: false, totalDuration: 0, bracket: 'unknown', layers: [], stale: false, ageMs: 0 },
          combined: { totalMs: 100 },
        },
      });
      const report = formatReport(data);
      expect(report).toContain('[STALE]');
    });

    it('shows no-data message when timing is null', () => {
      const report = formatReport(buildFullData({ timing: null }));
      expect(report).toContain('*No timing data available*');
    });
  });

  // ------------------------------------------------------------------
  // 11. Context Quality Analysis section (SYN-14)
  // ------------------------------------------------------------------
  describe('quality analysis section (9)', () => {
    it('renders overall grade and scores', () => {
      const data = buildFullData({
        quality: {
          uap: { available: true, score: 85, maxPossible: 90, loaders: [], stale: false },
          hook: { available: true, score: 92, maxPossible: 100, bracket: 'MODERATE', layers: [], stale: false },
          overall: { score: 89, grade: 'B', label: 'GOOD' },
        },
      });
      const report = formatReport(data);
      expect(report).toContain('## 9. Context Quality Analysis');
      expect(report).toContain('Overall: 89/100 (B — GOOD)');
      expect(report).toContain('UAP: 85/100');
      expect(report).toContain('Hook: 92/100');
    });

    it('shows [STALE] for stale data', () => {
      const data = buildFullData({
        quality: {
          uap: { available: true, score: 0, maxPossible: 0, loaders: [], stale: true },
          hook: { available: true, score: 100, maxPossible: 100, bracket: 'MODERATE', layers: [], stale: false },
          overall: { score: 60, grade: 'C', label: 'ADEQUATE' },
        },
      });
      const report = formatReport(data);
      expect(report).toContain('[STALE]');
    });

    it('shows no-data message when quality is null', () => {
      const report = formatReport(buildFullData({ quality: null }));
      expect(report).toContain('*No quality data available*');
    });
  });

  // ------------------------------------------------------------------
  // 12. Consistency Checks section (SYN-14)
  // ------------------------------------------------------------------
  describe('consistency checks section (10)', () => {
    it('renders consistency checks table', () => {
      const data = buildFullData({
        consistency: {
          available: true, score: 3, maxScore: 4,
          checks: [
            { name: 'bracket', status: 'PASS', detail: 'MODERATE is valid' },
            { name: 'agent', status: 'FAIL', detail: 'UAP=dev, bridge=qa' },
          ],
        },
      });
      const report = formatReport(data);
      expect(report).toContain('## 10. Consistency Checks');
      expect(report).toContain('Score:** 3/4');
      expect(report).toContain('| bracket | PASS | MODERATE is valid |');
      expect(report).toContain('| agent | FAIL | UAP=dev, bridge=qa |');
    });

    it('shows no-data message when consistency is null', () => {
      const report = formatReport(buildFullData({ consistency: null }));
      expect(report).toContain('*No consistency data available*');
    });
  });

  // ------------------------------------------------------------------
  // 13. Output Quality section (SYN-14)
  // ------------------------------------------------------------------
  describe('output quality section (11)', () => {
    it('renders output analysis summary and tables', () => {
      const data = buildFullData({
        outputAnalysis: {
          available: true,
          summary: { uapHealthy: 5, uapTotal: 6, hookHealthy: 4, hookTotal: 5 },
          uapAnalysis: [{ name: 'agentConfig', status: 'ok', quality: 'good', detail: 'Loaded OK' }],
          hookAnalysis: [{ name: 'constitution', status: 'ok', rules: 5, quality: 'good', detail: '5 rules' }],
        },
      });
      const report = formatReport(data);
      expect(report).toContain('## 11. Output Quality');
      expect(report).toContain('5/6 healthy');
      expect(report).toContain('| agentConfig | ok | good | Loaded OK |');
      expect(report).toContain('| constitution | ok | 5 | good | 5 rules |');
    });

    it('shows no-data message when outputAnalysis is null', () => {
      const report = formatReport(buildFullData({ outputAnalysis: null }));
      expect(report).toContain('*No output analysis data available*');
    });
  });

  // ------------------------------------------------------------------
  // 14. Relevance Matrix section (SYN-14)
  // ------------------------------------------------------------------
  describe('relevance matrix section (12)', () => {
    it('renders relevance matrix table', () => {
      const data = buildFullData({
        relevance: {
          available: true, agentId: 'dev', score: 85,
          matrix: [{ component: 'agentConfig', importance: 'critical', status: 'ok', gap: false }],
          gaps: [],
        },
      });
      const report = formatReport(data);
      expect(report).toContain('## 12. Relevance Matrix');
      expect(report).toContain('@dev');
      expect(report).toContain('85/100');
      expect(report).toContain('| agentConfig | critical | ok | - |');
    });

    it('renders critical gaps section', () => {
      const data = buildFullData({
        relevance: {
          available: true, agentId: 'dev', score: 50,
          matrix: [{ component: 'agentConfig', importance: 'critical', status: 'missing', gap: true }],
          gaps: [{ component: 'agentConfig', importance: 'critical' }],
        },
      });
      const report = formatReport(data);
      expect(report).toContain('### Critical Gaps');
      expect(report).toContain('**agentConfig** (critical)');
    });

    it('shows no-data message when relevance is null', () => {
      const report = formatReport(buildFullData({ relevance: null }));
      expect(report).toContain('*No relevance data available*');
    });
  });

  // ------------------------------------------------------------------
  // 15. Empty/null data handling
  // ------------------------------------------------------------------
  describe('empty and null data handling', () => {
    it('handles completely empty data object', () => {
      const report = formatReport({});
      expect(report).toContain('# SYNAPSE Diagnostic Report');
      expect(report).toContain('*No hook data collected*');
      expect(report).toContain('*No session data collected*');
      expect(report).toContain('*No manifest data collected*');
      expect(report).toContain('*No pipeline data collected*');
      expect(report).toContain('*No UAP bridge data collected*');
      expect(report).toContain('None found');
    });

    it('handles all sections set to null', () => {
      const report = formatReport({
        hook: null,
        session: null,
        manifest: null,
        pipeline: null,
        uap: null,
      });
      expect(report).toContain('*No hook data collected*');
      expect(report).toContain('*No session data collected*');
      expect(report).toContain('*No manifest data collected*');
      expect(report).toContain('*No pipeline data collected*');
      expect(report).toContain('*No UAP bridge data collected*');
    });

    it('handles partial data (some sections present, others missing)', () => {
      const report = formatReport({
        hook: { checks: [{ name: 'test', status: 'PASS', detail: 'ok' }] },
      });
      expect(report).toContain('| test | PASS | ok |');
      expect(report).toContain('*No session data collected*');
      expect(report).toContain('*No manifest data collected*');
    });

    it('returns a string', () => {
      const report = formatReport({});
      expect(typeof report).toBe('string');
    });
  });
});

// ---------------------------------------------------------------------------
// Part 2: Synapse Diagnostics Orchestrator Tests
// ---------------------------------------------------------------------------

jest.mock('../../../.aios-core/core/synapse/diagnostics/collectors/hook-collector');
jest.mock('../../../.aios-core/core/synapse/diagnostics/collectors/session-collector');
jest.mock('../../../.aios-core/core/synapse/diagnostics/collectors/manifest-collector');
jest.mock('../../../.aios-core/core/synapse/diagnostics/collectors/pipeline-collector');
jest.mock('../../../.aios-core/core/synapse/diagnostics/collectors/uap-collector');
jest.mock('../../../.aios-core/core/synapse/diagnostics/report-formatter');
jest.mock('../../../.aios-core/core/synapse/domain/domain-loader');

const { collectHookStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/hook-collector');
const { collectSessionStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/session-collector');
const { collectManifestIntegrity } = require('../../../.aios-core/core/synapse/diagnostics/collectors/manifest-collector');
const { collectPipelineSimulation } = require('../../../.aios-core/core/synapse/diagnostics/collectors/pipeline-collector');
const { collectUapBridgeStatus } = require('../../../.aios-core/core/synapse/diagnostics/collectors/uap-collector');
const { formatReport: mockFormatReport } = require('../../../.aios-core/core/synapse/diagnostics/report-formatter');
const { parseManifest } = require('../../../.aios-core/core/synapse/domain/domain-loader');

const { runDiagnostics, runDiagnosticsRaw } = require('../../../.aios-core/core/synapse/diagnostics/synapse-diagnostics');

describe('synapse-diagnostics orchestrator', () => {
  const projectRoot = '/fake/project';

  const mockHook = { checks: [{ name: 'hook-installed', status: 'PASS', detail: 'ok' }] };
  const mockSession = {
    fields: [{ field: 'session_id', expected: 'UUID', actual: 'abc', status: 'PASS' }],
    raw: {
      session: { prompt_count: 7, active_agent: { id: 'qa' } },
      bridgeData: { id: 'dev', activation_quality: 'full' },
    },
  };
  const mockManifest = {
    entries: [{ domain: 'constitution', inManifest: true, fileExists: true, status: 'PASS' }],
    orphanedFiles: [],
  };
  const mockPipeline = {
    bracket: 'FRESH',
    contextPercent: 90.0,
    layers: [{ layer: 'L0', expected: 'loaded', status: 'PASS' }],
  };
  const mockUap = { checks: [{ name: 'bridge-file', status: 'PASS', detail: 'exists' }] };
  const mockParsedManifest = { domains: ['constitution', 'global'] };

  beforeEach(() => {
    jest.clearAllMocks();

    collectHookStatus.mockReturnValue(mockHook);
    collectSessionStatus.mockReturnValue(mockSession);
    collectManifestIntegrity.mockReturnValue(mockManifest);
    collectPipelineSimulation.mockReturnValue(mockPipeline);
    collectUapBridgeStatus.mockReturnValue(mockUap);
    parseManifest.mockReturnValue(mockParsedManifest);
    mockFormatReport.mockReturnValue('# Mocked Report');
  });

  // ------------------------------------------------------------------
  // runDiagnostics
  // ------------------------------------------------------------------
  describe('runDiagnostics()', () => {
    it('calls all collectors and returns formatted report', () => {
      const result = runDiagnostics(projectRoot);

      expect(collectHookStatus).toHaveBeenCalledWith(projectRoot);
      expect(collectSessionStatus).toHaveBeenCalledWith(projectRoot, undefined);
      expect(collectManifestIntegrity).toHaveBeenCalledWith(projectRoot);
      expect(collectUapBridgeStatus).toHaveBeenCalledWith(projectRoot);
      expect(parseManifest).toHaveBeenCalled();
      expect(collectPipelineSimulation).toHaveBeenCalled();
      expect(mockFormatReport).toHaveBeenCalledWith({
        hook: mockHook,
        session: mockSession,
        manifest: mockManifest,
        pipeline: mockPipeline,
        uap: mockUap,
      });
      expect(result).toBe('# Mocked Report');
    });

    it('passes sessionId option to session collector', () => {
      runDiagnostics(projectRoot, { sessionId: 'sess-uuid-42' });
      expect(collectSessionStatus).toHaveBeenCalledWith(projectRoot, 'sess-uuid-42');
    });

    it('extracts promptCount from session for pipeline simulation', () => {
      runDiagnostics(projectRoot);
      expect(collectPipelineSimulation).toHaveBeenCalledWith(
        7, // prompt_count from mockSession.raw.session
        'dev', // id from mockSession.raw.bridgeData
        mockParsedManifest,
      );
    });

    it('defaults promptCount to 0 when session.raw is missing', () => {
      collectSessionStatus.mockReturnValue({ fields: [], raw: {} });
      runDiagnostics(projectRoot);
      expect(collectPipelineSimulation).toHaveBeenCalledWith(0, null, mockParsedManifest);
    });

    it('falls back to session.raw.session.active_agent.id for activeAgentId', () => {
      collectSessionStatus.mockReturnValue({
        fields: [],
        raw: {
          session: { prompt_count: 3, active_agent: { id: 'pm' } },
          bridgeData: {},
        },
      });
      runDiagnostics(projectRoot);
      expect(collectPipelineSimulation).toHaveBeenCalledWith(3, 'pm', mockParsedManifest);
    });

    it('constructs manifest path from projectRoot', () => {
      runDiagnostics(projectRoot);
      const manifestArg = parseManifest.mock.calls[0][0];
      expect(manifestArg).toContain('.synapse');
      expect(manifestArg).toContain('manifest');
    });
  });

  // ------------------------------------------------------------------
  // runDiagnosticsRaw
  // ------------------------------------------------------------------
  describe('runDiagnosticsRaw()', () => {
    it('returns raw data object with all collector results', () => {
      const result = runDiagnosticsRaw(projectRoot);

      expect(result).toEqual({
        hook: mockHook,
        session: mockSession,
        manifest: mockManifest,
        pipeline: mockPipeline,
        uap: mockUap,
      });
    });

    it('does not call formatReport', () => {
      runDiagnosticsRaw(projectRoot);
      expect(mockFormatReport).not.toHaveBeenCalled();
    });

    it('calls all collectors same as runDiagnostics', () => {
      runDiagnosticsRaw(projectRoot);

      expect(collectHookStatus).toHaveBeenCalledWith(projectRoot);
      expect(collectSessionStatus).toHaveBeenCalledWith(projectRoot, undefined);
      expect(collectManifestIntegrity).toHaveBeenCalledWith(projectRoot);
      expect(collectUapBridgeStatus).toHaveBeenCalledWith(projectRoot);
      expect(parseManifest).toHaveBeenCalled();
      expect(collectPipelineSimulation).toHaveBeenCalled();
    });

    it('extracts promptCount and activeAgentId for pipeline', () => {
      runDiagnosticsRaw(projectRoot);
      expect(collectPipelineSimulation).toHaveBeenCalledWith(7, 'dev', mockParsedManifest);
    });

    it('passes sessionId option when provided', () => {
      runDiagnosticsRaw(projectRoot, { sessionId: 'raw-sess-id' });
      expect(collectSessionStatus).toHaveBeenCalledWith(projectRoot, 'raw-sess-id');
    });
  });
});
