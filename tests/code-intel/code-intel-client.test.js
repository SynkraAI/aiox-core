'use strict';

const {
  CodeIntelClient,
  CIRCUIT_BREAKER_THRESHOLD,
  CIRCUIT_BREAKER_RESET_MS,
  CACHE_TTL_MS,
  CB_CLOSED,
  CB_OPEN,
  CB_HALF_OPEN,
} = require('../../.aios-core/core/code-intel/code-intel-client');

describe('CodeIntelClient', () => {
  let client;
  let mockMcpCallFn;

  beforeEach(() => {
    mockMcpCallFn = jest.fn();
    // Disable RegistryProvider to test MCP provider in isolation
    client = new CodeIntelClient({
      mcpCallFn: mockMcpCallFn,
      registryPath: '/non/existent/registry.yaml',
    });
  });

  describe('Provider Detection (AC3)', () => {
    it('should detect provider when mcpCallFn is configured', () => {
      expect(client.isCodeIntelAvailable()).toBe(true);
    });

    it('should not detect provider when mcpCallFn is missing and no registry', () => {
      const noProviderClient = new CodeIntelClient({
        registryPath: '/non/existent/registry.yaml',
      });
      expect(noProviderClient.isCodeIntelAvailable()).toBe(false);
    });
  });

  describe('8 Primitive Capabilities (AC3)', () => {
    it('should expose findDefinition', async () => {
      mockMcpCallFn.mockResolvedValue({ file: 'a.js', line: 1, column: 0, context: '' });
      const result = await client.findDefinition('foo');
      expect(result).toBeTruthy();
      expect(mockMcpCallFn).toHaveBeenCalled();
    });

    it('should expose findReferences', async () => {
      mockMcpCallFn.mockResolvedValue([{ file: 'a.js', line: 1, context: '' }]);
      const result = await client.findReferences('foo');
      expect(result).toBeTruthy();
    });

    it('should expose findCallers', async () => {
      mockMcpCallFn.mockResolvedValue({ callers: [] });
      const result = await client.findCallers('foo');
      expect(result).toBeDefined();
    });

    it('should expose findCallees', async () => {
      mockMcpCallFn.mockResolvedValue({ callees: [] });
      const result = await client.findCallees('foo');
      expect(result).toBeDefined();
    });

    it('should expose analyzeDependencies', async () => {
      mockMcpCallFn.mockResolvedValue({ nodes: [], edges: [] });
      const result = await client.analyzeDependencies('src/');
      expect(result).toBeDefined();
    });

    it('should expose analyzeComplexity', async () => {
      mockMcpCallFn.mockResolvedValue({ score: 5, details: {} });
      const result = await client.analyzeComplexity('src/index.js');
      expect(result).toBeDefined();
    });

    it('should expose analyzeCodebase', async () => {
      mockMcpCallFn.mockResolvedValue({ files: [], structure: {}, patterns: [] });
      const result = await client.analyzeCodebase('.');
      expect(result).toBeDefined();
    });

    it('should expose getProjectStats', async () => {
      mockMcpCallFn.mockResolvedValue({ files: 100, lines: 10000, languages: {} });
      const result = await client.getProjectStats();
      expect(result).toBeDefined();
    });
  });

  describe('Circuit Breaker (AC5)', () => {
    it('should start in CLOSED state', () => {
      expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
    });

    it('should open after 3 consecutive failures', async () => {
      mockMcpCallFn.mockRejectedValue(new Error('timeout'));

      await client.findDefinition('a');
      await client.findDefinition('b');
      await client.findDefinition('c');

      expect(client.getCircuitBreakerState()).toBe(CB_OPEN);
    });

    it('should return null when circuit is open (fallback)', async () => {
      mockMcpCallFn.mockRejectedValue(new Error('timeout'));

      // Trigger 3 failures to open circuit
      await client.findDefinition('a');
      await client.findDefinition('b');
      await client.findDefinition('c');

      // Reset mock to succeed — but circuit is open
      mockMcpCallFn.mockResolvedValue({ file: 'ok.js', line: 1, column: 0, context: '' });
      const result = await client.findDefinition('d');
      expect(result).toBeNull();
    });

    it('should transition to HALF-OPEN after reset timer', async () => {
      mockMcpCallFn.mockRejectedValue(new Error('timeout'));

      await client.findDefinition('a');
      await client.findDefinition('b');
      await client.findDefinition('c');
      expect(client.getCircuitBreakerState()).toBe(CB_OPEN);

      // Simulate time passing
      client._cbOpenedAt = Date.now() - CIRCUIT_BREAKER_RESET_MS - 1;
      expect(client.getCircuitBreakerState()).toBe(CB_HALF_OPEN);
    });

    it('should close after success in HALF-OPEN state', async () => {
      mockMcpCallFn.mockRejectedValue(new Error('timeout'));

      await client.findDefinition('a');
      await client.findDefinition('b');
      await client.findDefinition('c');

      // Simulate reset timer expired
      client._cbOpenedAt = Date.now() - CIRCUIT_BREAKER_RESET_MS - 1;
      client._cbState = CB_HALF_OPEN;

      // Next call succeeds
      mockMcpCallFn.mockResolvedValue({ file: 'ok.js', line: 1, column: 0, context: '' });
      await client.findDefinition('e');
      expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
    });

    it('should reset failure count on success', async () => {
      mockMcpCallFn
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ file: 'ok.js', line: 1, column: 0, context: '' });

      await client.findDefinition('a');
      await client.findDefinition('b');
      await client.findDefinition('c'); // success — resets counter
      expect(client.getCircuitBreakerState()).toBe(CB_CLOSED);
    });
  });

  describe('Session Cache (AC6)', () => {
    it('should cache results for identical calls', async () => {
      mockMcpCallFn.mockResolvedValue({ file: 'a.js', line: 1, column: 0, context: '' });

      const result1 = await client.findDefinition('foo');
      const result2 = await client.findDefinition('foo');

      expect(mockMcpCallFn).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should not cache for different params', async () => {
      mockMcpCallFn.mockResolvedValue({ file: 'a.js', line: 1, column: 0, context: '' });

      await client.findDefinition('foo');
      await client.findDefinition('bar');

      expect(mockMcpCallFn).toHaveBeenCalledTimes(2);
    });

    it('should evict expired entries', async () => {
      mockMcpCallFn.mockResolvedValue({ file: 'a.js', line: 1, column: 0, context: '' });

      await client.findDefinition('foo');

      // Manually expire the cache entry
      const cacheEntry = client._cache.values().next().value;
      cacheEntry.timestamp = Date.now() - CACHE_TTL_MS - 1;

      await client.findDefinition('foo');
      expect(mockMcpCallFn).toHaveBeenCalledTimes(2);
    });

    it('should track cache hit/miss counters', async () => {
      mockMcpCallFn.mockResolvedValue({ file: 'a.js', line: 1, column: 0, context: '' });

      await client.findDefinition('foo'); // miss
      await client.findDefinition('foo'); // hit
      await client.findDefinition('bar'); // miss

      const metrics = client.getMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheMisses).toBe(2);
      expect(metrics.cacheHitRate).toBeCloseTo(1 / 3);
    });
  });

  describe('Latency Logging (NFR-2)', () => {
    it('should log latency for each capability call', async () => {
      mockMcpCallFn.mockResolvedValue({ file: 'a.js', line: 1, column: 0, context: '' });

      await client.findDefinition('foo');
      await client.findReferences('bar');

      const metrics = client.getMetrics();
      expect(metrics.latencyLog).toHaveLength(2);
      expect(metrics.latencyLog[0].capability).toBe('findDefinition');
      expect(metrics.latencyLog[1].capability).toBe('findReferences');
      expect(typeof metrics.latencyLog[0].durationMs).toBe('number');
    });
  });

  describe('isCodeIntelAvailable (AC8)', () => {
    it('should return true when provider has mcpCallFn', () => {
      expect(client.isCodeIntelAvailable()).toBe(true);
    });

    it('should return false when no provider configured', () => {
      const bareClient = new CodeIntelClient({
        registryPath: '/non/existent/registry.yaml',
      });
      expect(bareClient.isCodeIntelAvailable()).toBe(false);
    });
  });

  describe('Metrics', () => {
    it('should return comprehensive metrics object', async () => {
      const metrics = client.getMetrics();
      expect(metrics).toHaveProperty('cacheHits');
      expect(metrics).toHaveProperty('cacheMisses');
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics).toHaveProperty('circuitBreakerState');
      expect(metrics).toHaveProperty('latencyLog');
      expect(metrics).toHaveProperty('providerAvailable');
      expect(metrics).toHaveProperty('activeProvider');
    });
  });
});
