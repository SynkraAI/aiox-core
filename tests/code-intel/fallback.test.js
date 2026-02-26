'use strict';

const {
  CodeIntelClient,
} = require('../../.aios-core/core/code-intel/code-intel-client');
const {
  CodeIntelEnricher,
} = require('../../.aios-core/core/code-intel/code-intel-enricher');
const {
  isCodeIntelAvailable,
  enrichWithCodeIntel,
  getClient,
  _resetForTesting,
} = require('../../.aios-core/core/code-intel');

describe('Fallback Graceful (AC4, NFR-1, NFR-4)', () => {
  describe('CodeIntelClient without provider', () => {
    let client;

    beforeEach(() => {
      // No mcpCallFn AND no registry = no provider available
      // Must explicitly disable RegistryProvider by pointing to non-existent registry
      client = new CodeIntelClient({
        registryPath: '/non/existent/registry.yaml',
      });
    });

    it('should return false for isCodeIntelAvailable', () => {
      expect(client.isCodeIntelAvailable()).toBe(false);
    });

    it('findDefinition should return null without throw', async () => {
      const result = await client.findDefinition('foo');
      expect(result).toBeNull();
    });

    it('findReferences should return null without throw', async () => {
      const result = await client.findReferences('foo');
      expect(result).toBeNull();
    });

    it('findCallers should return null without throw', async () => {
      const result = await client.findCallers('foo');
      expect(result).toBeNull();
    });

    it('findCallees should return null without throw', async () => {
      const result = await client.findCallees('foo');
      expect(result).toBeNull();
    });

    it('analyzeDependencies should return null without throw', async () => {
      const result = await client.analyzeDependencies('src/');
      expect(result).toBeNull();
    });

    it('analyzeComplexity should return null without throw', async () => {
      const result = await client.analyzeComplexity('src/index.js');
      expect(result).toBeNull();
    });

    it('analyzeCodebase should return null without throw', async () => {
      const result = await client.analyzeCodebase('.');
      expect(result).toBeNull();
    });

    it('getProjectStats should return null without throw', async () => {
      const result = await client.getProjectStats();
      expect(result).toBeNull();
    });

    it('should warn only once about no provider', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await client.findDefinition('a');
      await client.findReferences('b');
      await client.analyzeCodebase('c');

      const noProviderWarnings = warnSpy.mock.calls.filter((call) =>
        call[0].includes('No provider available'),
      );
      expect(noProviderWarnings).toHaveLength(1);
      warnSpy.mockRestore();
    });
  });

  describe('CodeIntelEnricher without provider', () => {
    let enricher;

    beforeEach(() => {
      // No mcpCallFn AND no registry = no provider available
      const client = new CodeIntelClient({
        registryPath: '/non/existent/registry.yaml',
      });
      enricher = new CodeIntelEnricher(client);
    });

    it('assessImpact should handle null from primitives', async () => {
      const result = await enricher.assessImpact(['src/foo.js']);
      expect(result.blastRadius).toBe(0);
    });

    it('detectDuplicates should return null', async () => {
      const result = await enricher.detectDuplicates('something');
      expect(result).toBeNull();
    });

    it('getConventions should return null', async () => {
      const result = await enricher.getConventions('src/');
      expect(result).toBeNull();
    });

    it('findTests should return null', async () => {
      const result = await enricher.findTests('foo');
      expect(result).toBeNull();
    });

    it('describeProject should return null', async () => {
      const result = await enricher.describeProject();
      expect(result).toBeNull();
    });
  });

  describe('enrichWithCodeIntel convenience function', () => {
    beforeEach(() => {
      _resetForTesting();
    });

    it('should return baseResult unchanged when no provider', async () => {
      const baseResult = { data: 'test', value: 42 };
      const result = await enrichWithCodeIntel(baseResult);
      expect(result).toEqual(baseResult);
    });

    it('should enrich baseResult with capabilities when provider available', async () => {
      _resetForTesting();
      const mockMcpCallFn = jest.fn().mockResolvedValue({
        files: ['a.js'],
        structure: { type: 'flat' },
        patterns: ['singleton'],
      });
      const client = getClient({ mcpCallFn: mockMcpCallFn });
      expect(client.isCodeIntelAvailable()).toBe(true);

      const baseResult = { data: 'test' };
      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['describeProject'],
        target: '.',
        timeout: 5000,
      });

      expect(result.data).toBe('test');
      expect(result._codeIntel).toBeDefined();
      expect(result._codeIntel.describeProject).toBeDefined();
    });

    it('should handle rejected capability gracefully during enrichment', async () => {
      _resetForTesting();
      const mockMcpCallFn = jest.fn().mockRejectedValue(new Error('provider error'));
      getClient({ mcpCallFn: mockMcpCallFn });

      const baseResult = { data: 'test' };
      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['describeProject'],
        target: '.',
        timeout: 5000,
      });

      // Should still return enriched object structure without throwing
      expect(result.data).toBe('test');
      expect(result._codeIntel).toBeDefined();
    });

    it('should skip unknown capabilities without error', async () => {
      _resetForTesting();
      const mockMcpCallFn = jest.fn().mockResolvedValue({ files: 10 });
      getClient({ mcpCallFn: mockMcpCallFn });

      const baseResult = { value: 1 };
      const result = await enrichWithCodeIntel(baseResult, {
        capabilities: ['nonExistentCapability'],
        target: '.',
      });

      expect(result.value).toBe(1);
      expect(result._codeIntel).toBeDefined();
      expect(result._codeIntel.nonExistentCapability).toBeUndefined();
    });

    it('should respect fallbackBehavior silent mode', async () => {
      _resetForTesting();
      const mockMcpCallFn = jest.fn().mockResolvedValue({ files: [] });
      getClient({ mcpCallFn: mockMcpCallFn });

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const baseResult = { data: 'test' };
      await enrichWithCodeIntel(baseResult, {
        capabilities: ['describeProject'],
        fallbackBehavior: 'silent',
      });
      // No enrichment warnings should be logged in silent mode
      const enrichmentWarnings = warnSpy.mock.calls.filter((call) =>
        call[0].includes('Enrichment failed'),
      );
      expect(enrichmentWarnings).toHaveLength(0);
      warnSpy.mockRestore();
    });
  });

  describe('Regression: existing tasks not broken (NFR-4)', () => {
    it('should be possible to require the module without errors', () => {
      expect(() => {
        require('../../.aios-core/core/code-intel');
      }).not.toThrow();
    });

    it('getClient should return a valid client instance', () => {
      _resetForTesting();
      const client = getClient();
      expect(client).toBeDefined();
      expect(typeof client.findDefinition).toBe('function');
      expect(typeof client.isCodeIntelAvailable).toBe('function');
    });

    it('isCodeIntelAvailable should return boolean without error', () => {
      _resetForTesting();
      const result = isCodeIntelAvailable();
      expect(typeof result).toBe('boolean');
    });
  });
});
