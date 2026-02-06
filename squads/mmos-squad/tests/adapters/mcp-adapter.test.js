/**
 * MCP Adapter Unit Tests
 *
 * Tests for the MCPAdapter class that provides MCP usage patterns.
 *
 * @story STORY-10.8
 */

const { MCPAdapter, createMCPAdapter } = require('../../adapters/mcp-adapter');

describe('MCPAdapter', () => {
  let adapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = createMCPAdapter({ silent: true });
  });

  describe('Factory Function', () => {
    it('should create adapter instance via factory', () => {
      const instance = createMCPAdapter();
      expect(instance).toBeInstanceOf(MCPAdapter);
    });

    it('should accept options', () => {
      const instance = createMCPAdapter({ silent: true, traceId: 'test-123' });
      expect(instance.options.silent).toBe(true);
      expect(instance.options.traceId).toBe('test-123');
    });

    it('should auto-generate traceId if not provided', () => {
      const instance = createMCPAdapter({});
      expect(instance.options.traceId).toMatch(/^mmos-mcp-\d+$/);
    });
  });

  describe('getWebSearchPattern', () => {
    it('should return valid EXA pattern', () => {
      const pattern = adapter.getWebSearchPattern('Daniel Kahneman');

      expect(pattern.mcp).toBe('mcp__docker-gateway__web_search_exa');
      expect(pattern.params.query).toBe('Daniel Kahneman');
      expect(pattern.params.numResults).toBe(10);
      expect(pattern.usage).toBe('Public figure detection, source discovery');
      expect(pattern.detection_logic).toBeDefined();
    });

    it('should accept custom numResults', () => {
      const pattern = adapter.getWebSearchPattern('Test Person', 20);

      expect(pattern.params.numResults).toBe(20);
    });

    it('should throw error for invalid personName', () => {
      expect(() => adapter.getWebSearchPattern(null)).toThrow('personName is required');
      expect(() => adapter.getWebSearchPattern('')).toThrow('personName is required');
      expect(() => adapter.getWebSearchPattern(123)).toThrow('personName is required');
    });
  });

  describe('getCompanyResearchPattern', () => {
    it('should return pattern without company name', () => {
      const pattern = adapter.getCompanyResearchPattern('Elon Musk');

      expect(pattern.mcp).toBe('mcp__docker-gateway__web_search_exa');
      expect(pattern.params.query).toContain('"Elon Musk"');
      expect(pattern.params.query).toContain('entrepreneur founder company');
    });

    it('should return pattern with company name', () => {
      const pattern = adapter.getCompanyResearchPattern('Elon Musk', 'Tesla');

      expect(pattern.params.query).toContain('"Elon Musk"');
      expect(pattern.params.query).toContain('"Tesla"');
      expect(pattern.params.query).toContain('founder CEO');
    });

    it('should throw error for invalid personName', () => {
      expect(() => adapter.getCompanyResearchPattern(null)).toThrow('personName is required');
    });
  });

  describe('getSourceDiscoverySweep', () => {
    it('should return 5 search patterns', () => {
      const patterns = adapter.getSourceDiscoverySweep('Dave Ramsey');

      expect(patterns).toHaveLength(5);
      expect(patterns.map((p) => p.category)).toEqual(['books', 'interviews', 'articles', 'videos', 'social']);
    });

    it('should have correct MCP for all patterns', () => {
      const patterns = adapter.getSourceDiscoverySweep('Test Person');

      patterns.forEach((pattern) => {
        expect(pattern.mcp).toBe('mcp__docker-gateway__web_search_exa');
        expect(pattern.params.query).toContain('"Test Person"');
        expect(pattern.params.numResults).toBeGreaterThan(0);
      });
    });

    it('should throw error for invalid mindName', () => {
      expect(() => adapter.getSourceDiscoverySweep(null)).toThrow('mindName is required');
    });
  });

  describe('getLibraryDocsPattern', () => {
    it('should return two-step Context7 pattern', () => {
      const pattern = adapter.getLibraryDocsPattern('system prompts');

      expect(pattern.step1.mcp).toBe('mcp__docker-gateway__resolve-library-id');
      expect(pattern.step1.params.libraryName).toBe('anthropic claude');

      expect(pattern.step2.mcp).toBe('mcp__docker-gateway__get-library-docs');
      expect(pattern.step2.params.topic).toBe('system prompts');
      expect(pattern.step2.params.tokens).toBe(10000);
    });

    it('should accept custom library name', () => {
      const pattern = adapter.getLibraryDocsPattern('hooks', 'react');

      expect(pattern.step1.params.libraryName).toBe('react');
    });

    it('should throw error for invalid topic', () => {
      expect(() => adapter.getLibraryDocsPattern(null)).toThrow('topic is required');
    });
  });

  describe('getPlaywrightPattern', () => {
    it('should return fidelity test pattern', () => {
      const pattern = adapter.getPlaywrightPattern('fidelity');

      expect(pattern.steps).toHaveLength(3);
      expect(pattern.steps[0].mcp).toBe('mcp__playwright__browser_navigate');
      expect(pattern.steps[1].mcp).toBe('mcp__playwright__browser_type');
      expect(pattern.steps[2].mcp).toBe('mcp__playwright__browser_snapshot');
      expect(pattern.usage).toContain('fidelity testing');
      expect(pattern.metrics).toBeDefined();
    });

    it('should return blind test pattern', () => {
      const pattern = adapter.getPlaywrightPattern('blind');

      expect(pattern.steps).toHaveLength(3);
      expect(pattern.usage).toContain('Blind testing');
      expect(pattern.scoring).toBeDefined();
    });

    it('should return interaction pattern', () => {
      const pattern = adapter.getPlaywrightPattern('interaction');

      expect(pattern.steps).toHaveLength(3);
      expect(pattern.steps[1].mcp).toBe('mcp__playwright__browser_click');
      expect(pattern.usage).toContain('browser interaction');
    });

    it('should throw error for invalid testType', () => {
      expect(() => adapter.getPlaywrightPattern('invalid')).toThrow('testType must be one of');
    });
  });

  describe('Validation Helpers', () => {
    describe('isValidMCPToolName', () => {
      it('should validate docker-gateway tools', () => {
        expect(adapter.isValidMCPToolName('mcp__docker-gateway__web_search_exa')).toBe(true);
        expect(adapter.isValidMCPToolName('mcp__docker-gateway__get-library-docs')).toBe(true);
      });

      it('should validate playwright tools', () => {
        expect(adapter.isValidMCPToolName('mcp__playwright__browser_navigate')).toBe(true);
        expect(adapter.isValidMCPToolName('mcp__playwright__browser_snapshot')).toBe(true);
      });

      it('should reject invalid tool names', () => {
        expect(adapter.isValidMCPToolName('invalid_tool')).toBe(false);
        expect(adapter.isValidMCPToolName('mcp__unknown__tool')).toBe(false);
      });
    });

    describe('getAvailableMCPTools', () => {
      it('should return categorized tools', () => {
        const tools = adapter.getAvailableMCPTools();

        expect(tools.exa).toContain('mcp__docker-gateway__web_search_exa');
        expect(tools.context7).toContain('mcp__docker-gateway__resolve-library-id');
        expect(tools.context7).toContain('mcp__docker-gateway__get-library-docs');
        expect(tools.playwright).toContain('mcp__playwright__browser_navigate');
        expect(tools.playwright.length).toBeGreaterThanOrEqual(5);
      });
    });
  });
});
