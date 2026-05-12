/**
 * Unit Tests for SquadAnalyzer
 *
 * Test Coverage:
 * - analyze() returns complete analysis object
 * - loadManifest() loads and parses squad.yaml
 * - inventoryComponents() lists all component files
 * - calculateCoverage() computes correct metrics
 * - generateSuggestions() provides improvement hints
 * - formatReport() outputs console/markdown/json formats
 * - Error handling for missing squad, invalid manifest
 *
 * @see Story SQS-11: Squad Analyze & Extend
 */

const path = require('path');
const {
  SquadAnalyzer,
  SquadAnalyzerError,
  ErrorCodes,
  COMPONENT_DIRECTORIES,
} = require('../../../.aiox-core/development/scripts/squad/squad-analyzer');

// Test fixtures path
const FIXTURES_PATH = path.join(__dirname, 'fixtures');

describe('SquadAnalyzer', () => {
  let analyzer;
  let verboseAnalyzer;

  beforeEach(() => {
    analyzer = new SquadAnalyzer({ squadsPath: FIXTURES_PATH });
    verboseAnalyzer = new SquadAnalyzer({ squadsPath: FIXTURES_PATH, verbose: true });
  });

  describe('Constants', () => {
    it('should export ErrorCodes enum', () => {
      expect(ErrorCodes).toBeDefined();
      expect(ErrorCodes.SQUAD_NOT_FOUND).toBe('SQUAD_NOT_FOUND');
      expect(ErrorCodes.MANIFEST_NOT_FOUND).toBe('MANIFEST_NOT_FOUND');
      expect(ErrorCodes.YAML_PARSE_ERROR).toBe('YAML_PARSE_ERROR');
      expect(ErrorCodes.ANALYSIS_FAILED).toBe('ANALYSIS_FAILED');
    });

    it('should export COMPONENT_DIRECTORIES array', () => {
      expect(COMPONENT_DIRECTORIES).toBeDefined();
      expect(Array.isArray(COMPONENT_DIRECTORIES)).toBe(true);
      expect(COMPONENT_DIRECTORIES).toContain('agents');
      expect(COMPONENT_DIRECTORIES).toContain('tasks');
      expect(COMPONENT_DIRECTORIES).toContain('workflows');
      expect(COMPONENT_DIRECTORIES).toContain('templates');
      expect(COMPONENT_DIRECTORIES).toContain('tools');
    });
  });

  describe('Constructor', () => {
    it('should use default squads path when not specified', () => {
      const defaultAnalyzer = new SquadAnalyzer();
      expect(defaultAnalyzer.squadsPath).toBe('./squads');
    });

    it('should use custom squads path when specified', () => {
      expect(analyzer.squadsPath).toBe(FIXTURES_PATH);
    });

    it('should disable verbose mode by default', () => {
      expect(analyzer.verbose).toBe(false);
    });

    it('should enable verbose mode when specified', () => {
      expect(verboseAnalyzer.verbose).toBe(true);
    });
  });

  describe('SquadAnalyzerError', () => {
    it('should create error with code and message', () => {
      const error = new SquadAnalyzerError('TEST_ERROR', 'Test message', 'Test suggestion');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
      expect(error.name).toBe('SquadAnalyzerError');
    });

    it('should create squadNotFound error with static method', () => {
      const error = SquadAnalyzerError.squadNotFound('my-squad');
      expect(error.code).toBe(ErrorCodes.SQUAD_NOT_FOUND);
      expect(error.message).toContain('my-squad');
      expect(error.suggestion).toContain('*list-squads');
    });

    it('should create manifestNotFound error with static method', () => {
      const error = SquadAnalyzerError.manifestNotFound('/path/to/squad');
      expect(error.code).toBe(ErrorCodes.MANIFEST_NOT_FOUND);
      expect(error.message).toContain('squad.yaml');
    });
  });

  describe('analyze()', () => {
    it('should return complete analysis for valid squad', async () => {
      const result = await analyzer.analyze('analyze-test-squad');

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.inventory).toBeDefined();
      expect(result.coverage).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.squadPath).toBeDefined();
    });

    it('should include correct overview fields', async () => {
      const result = await analyzer.analyze('analyze-test-squad');

      expect(result.overview.name).toBe('analyze-test-squad');
      expect(result.overview.version).toBe('1.0.0');
      expect(result.overview.author).toBe('test');
    });

    it('should throw SquadAnalyzerError for non-existent squad', async () => {
      await expect(analyzer.analyze('non-existent-squad'))
        .rejects
        .toThrow(SquadAnalyzerError);
    });

    it('should respect suggestions option', async () => {
      const resultWithSuggestions = await analyzer.analyze('analyze-test-squad', { suggestions: true });
      const resultWithoutSuggestions = await analyzer.analyze('analyze-test-squad', { suggestions: false });

      expect(resultWithSuggestions.suggestions.length).toBeGreaterThanOrEqual(0);
      expect(resultWithoutSuggestions.suggestions).toHaveLength(0);
    });
  });

  describe('loadManifest()', () => {
    it('should load and parse squad.yaml', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const manifest = await analyzer.loadManifest(squadPath);

      expect(manifest).toBeDefined();
      expect(manifest.name).toBe('analyze-test-squad');
      expect(manifest.version).toBe('1.0.0');
    });

    it('should throw error for missing manifest', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'non-existent');

      await expect(analyzer.loadManifest(squadPath))
        .rejects
        .toThrow(SquadAnalyzerError);
    });
  });

  describe('inventoryComponents()', () => {
    it('should list all component files', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);

      expect(inventory).toBeDefined();
      expect(inventory.agents).toContain('lead-agent.md');
      expect(inventory.agents).toContain('helper-agent.md');
      expect(inventory.tasks).toContain('lead-agent-task1.md');
      expect(inventory.tasks).toContain('lead-agent-task2.md');
    });

    it('should return empty arrays for non-existent directories', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);

      expect(inventory.workflows).toEqual([]);
      expect(inventory.checklists).toEqual([]);
    });

    it('should include file objects in verbose mode', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await verboseAnalyzer.inventoryComponents(squadPath, true);

      expect(inventory.agents[0]).toHaveProperty('name');
      expect(inventory.agents[0]).toHaveProperty('path');
    });
  });

  describe('calculateCoverage()', () => {
    it('should calculate agent coverage correctly', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);
      const manifest = await analyzer.loadManifest(squadPath);
      const coverage = analyzer.calculateCoverage(inventory, manifest, squadPath);

      expect(coverage.agents).toBeDefined();
      expect(coverage.agents.total).toBe(2);
      expect(coverage.agents.withTasks).toBe(1); // Only lead-agent has tasks
      expect(coverage.agents.percentage).toBe(50);
    });

    it('should calculate task coverage correctly', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);
      const manifest = await analyzer.loadManifest(squadPath);
      const coverage = analyzer.calculateCoverage(inventory, manifest, squadPath);

      expect(coverage.tasks).toBeDefined();
      expect(coverage.tasks.total).toBe(2);
    });

    it('should calculate directory coverage correctly', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);
      const manifest = await analyzer.loadManifest(squadPath);
      const coverage = analyzer.calculateCoverage(inventory, manifest, squadPath);

      expect(coverage.directories).toBeDefined();
      expect(coverage.directories.populated).toBe(2); // agents and tasks
      expect(coverage.directories.total).toBe(8);
    });
  });

  describe('generateSuggestions()', () => {
    it('should suggest adding tasks for agents without tasks', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);
      const manifest = await analyzer.loadManifest(squadPath);
      const coverage = analyzer.calculateCoverage(inventory, manifest, squadPath);
      const suggestions = analyzer.generateSuggestions(inventory, coverage, manifest);

      const taskSuggestion = suggestions.find(s => s.category === 'tasks');
      expect(taskSuggestion).toBeDefined();
      expect(taskSuggestion.priority).toBe('high');
    });

    it('should suggest adding checklists when none exist', async () => {
      const squadPath = path.join(FIXTURES_PATH, 'analyze-test-squad');
      const inventory = await analyzer.inventoryComponents(squadPath);
      const manifest = await analyzer.loadManifest(squadPath);
      const coverage = analyzer.calculateCoverage(inventory, manifest, squadPath);
      const suggestions = analyzer.generateSuggestions(inventory, coverage, manifest);

      const checklistSuggestion = suggestions.find(s => s.category === 'checklists');
      expect(checklistSuggestion).toBeDefined();
    });
  });

  describe('formatReport()', () => {
    it('should format report as console output', async () => {
      const result = await analyzer.analyze('analyze-test-squad');
      const report = analyzer.formatReport(result, 'console');

      expect(report).toContain('Squad Analysis');
      expect(report).toContain('analyze-test-squad');
      expect(report).toContain('Overview');
      expect(report).toContain('Components');
      expect(report).toContain('Coverage');
    });

    it('should format report as JSON', async () => {
      const result = await analyzer.analyze('analyze-test-squad');
      const report = analyzer.formatReport(result, 'json');

      const parsed = JSON.parse(report);
      expect(parsed.overview).toBeDefined();
      expect(parsed.inventory).toBeDefined();
      expect(parsed.coverage).toBeDefined();
    });

    it('should format report as markdown', async () => {
      const result = await analyzer.analyze('analyze-test-squad');
      const report = analyzer.formatReport(result, 'markdown');

      expect(report).toContain('# Squad Analysis');
      expect(report).toContain('## Overview');
      expect(report).toContain('## Components');
      expect(report).toContain('| Property | Value |');
    });
  });

  describe('Performance', () => {
    it('should complete analysis within 500ms', async () => {
      const start = Date.now();
      await analyzer.analyze('analyze-test-squad');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
