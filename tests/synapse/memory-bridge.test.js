/**
 * MemoryBridge Tests
 *
 * Tests for the MIS consumer that provides bracket-aware
 * memory retrieval for the SYNAPSE engine.
 *
 * @module tests/synapse/memory-bridge
 * @story SYN-10 - Pro Memory Bridge (Feature-Gated MIS Consumer)
 * @migrated INS-4.11 AC9 - Removed pro feature gate, uses open-source provider
 */

jest.setTimeout(10000);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetMemories = jest.fn(() => Promise.resolve([]));
const mockClearCache = jest.fn();

jest.mock('../../.aios-core/core/synapse/memory/synapse-memory-provider', () => ({
  SynapseMemoryProvider: jest.fn().mockImplementation(() => ({
    getMemories: mockGetMemories,
    clearCache: mockClearCache,
  })),
}));

// ---------------------------------------------------------------------------
// Import (after mocks)
// ---------------------------------------------------------------------------

const { MemoryBridge, BRACKET_LAYER_MAP, BRIDGE_TIMEOUT_MS } = require('../../.aios-core/core/synapse/memory/memory-bridge');

// =============================================================================
// MemoryBridge
// =============================================================================

describe('MemoryBridge', () => {
  let bridge;

  beforeEach(() => {
    bridge = new MemoryBridge();
    mockGetMemories.mockReset();
    mockClearCache.mockReset();
    mockGetMemories.mockResolvedValue([]);
  });

  // -------------------------------------------------------------------------
  // AC-1: Module exists and exports correctly
  // -------------------------------------------------------------------------

  describe('module structure', () => {
    test('exports MemoryBridge class', () => {
      expect(MemoryBridge).toBeDefined();
      expect(typeof MemoryBridge).toBe('function');
    });

    test('exports BRACKET_LAYER_MAP constant', () => {
      expect(BRACKET_LAYER_MAP).toBeDefined();
      expect(BRACKET_LAYER_MAP.FRESH).toBeDefined();
      expect(BRACKET_LAYER_MAP.MODERATE).toBeDefined();
      expect(BRACKET_LAYER_MAP.DEPLETED).toBeDefined();
      expect(BRACKET_LAYER_MAP.CRITICAL).toBeDefined();
    });

    test('exports BRIDGE_TIMEOUT_MS constant', () => {
      expect(BRIDGE_TIMEOUT_MS).toBe(15);
    });

    test('getMemoryHints returns array of hint objects', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'test hint', source: 'procedural', relevance: 0.8, tokens: 5 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(Array.isArray(hints)).toBe(true);
      if (hints.length > 0) {
        expect(hints[0]).toHaveProperty('content');
        expect(hints[0]).toHaveProperty('source');
        expect(hints[0]).toHaveProperty('relevance');
        expect(hints[0]).toHaveProperty('tokens');
      }
    });
  });

  // -------------------------------------------------------------------------
  // AC-2: Provider integration (no feature gate)
  // -------------------------------------------------------------------------

  describe('provider integration', () => {
    test('delegates to provider for memory retrieval', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'hint 1', source: 'procedural', relevance: 0.9, tokens: 5 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints.length).toBeGreaterThan(0);
    });

    test('returns [] when provider is not available', async () => {
      const b = new MemoryBridge();
      b._getProvider = () => null;

      const hints = await b.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // AC-3: Bracket-aware retrieval
  // -------------------------------------------------------------------------

  describe('bracket-aware retrieval', () => {
    test('FRESH bracket returns [] (no memory injection)', async () => {
      const hints = await bridge.getMemoryHints('dev', 'FRESH', 100);
      expect(hints).toEqual([]);
      expect(mockGetMemories).not.toHaveBeenCalled();
    });

    test('MODERATE bracket retrieves Layer 1 (max ~50 tokens)', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'short hint', source: 'procedural', relevance: 0.8, tokens: 10 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 200);
      expect(mockGetMemories).toHaveBeenCalledWith('dev', 'MODERATE', 50);
      expect(hints.length).toBe(1);
    });

    test('DEPLETED bracket retrieves Layer 2 (max ~200 tokens)', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'chunk hint', source: 'semantic', relevance: 0.6, tokens: 50 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'DEPLETED', 500);
      expect(mockGetMemories).toHaveBeenCalledWith('dev', 'DEPLETED', 200);
    });

    test('CRITICAL bracket retrieves Layer 3 (max ~1000 tokens)', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'full content', source: 'semantic', relevance: 0.5, tokens: 100 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'CRITICAL', 2000);
      expect(mockGetMemories).toHaveBeenCalledWith('dev', 'CRITICAL', 1000);
    });

    test('unknown bracket returns []', async () => {
      const hints = await bridge.getMemoryHints('dev', 'UNKNOWN', 100);
      expect(hints).toEqual([]);
    });

    test('token budget respects bracket max even if caller budget is higher', async () => {
      mockGetMemories.mockResolvedValue([]);
      await bridge.getMemoryHints('dev', 'MODERATE', 9999);
      expect(mockGetMemories).toHaveBeenCalledWith('dev', 'MODERATE', 50);
    });

    test('token budget uses caller budget when lower than bracket max', async () => {
      mockGetMemories.mockResolvedValue([]);
      await bridge.getMemoryHints('dev', 'CRITICAL', 500);
      expect(mockGetMemories).toHaveBeenCalledWith('dev', 'CRITICAL', 500);
    });
  });

  // -------------------------------------------------------------------------
  // AC-8: Performance + timeout
  // -------------------------------------------------------------------------

  describe('timeout and error handling', () => {
    test('returns [] on provider timeout', async () => {
      const fastBridge = new MemoryBridge({ timeout: 1 });
      mockGetMemories.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve([{ content: 'late', tokens: 5 }]), 100)),
      );

      const hints = await fastBridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });

    test('returns [] on provider error', async () => {
      mockGetMemories.mockRejectedValue(new Error('MIS failure'));

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });

    test('returns [] when provider constructor fails', async () => {
      bridge._reset();
      const origGet = bridge._getProvider;
      bridge._getProvider = () => null;

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);

      bridge._getProvider = origGet;
    });
  });

  // -------------------------------------------------------------------------
  // Token budget enforcement
  // -------------------------------------------------------------------------

  describe('token budget enforcement', () => {
    test('truncates hints that exceed budget', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'a'.repeat(100), source: 'p', relevance: 0.9, tokens: 25 },
        { content: 'b'.repeat(100), source: 'p', relevance: 0.8, tokens: 25 },
        { content: 'c'.repeat(100), source: 'p', relevance: 0.7, tokens: 25 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      // Budget is min(50, 100) = 50; first two hints = 50 tokens, third excluded
      expect(hints.length).toBe(2);
    });

    test('returns empty array when hints have no content', async () => {
      mockGetMemories.mockResolvedValue([]);
      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      expect(hints).toEqual([]);
    });

    test('estimates tokens from content when tokens property missing', async () => {
      mockGetMemories.mockResolvedValue([
        { content: 'hello world', source: 'p', relevance: 0.9 },
      ]);

      const hints = await bridge.getMemoryHints('dev', 'MODERATE', 100);
      if (hints.length > 0) {
        expect(hints[0].tokens).toBe(Math.ceil('hello world'.length / 4));
      }
    });
  });

  // -------------------------------------------------------------------------
  // Cache management
  // -------------------------------------------------------------------------

  describe('cache management', () => {
    test('clearCache delegates to provider', () => {
      bridge._getProvider();
      bridge.clearCache();
      expect(mockClearCache).toHaveBeenCalled();
    });

    test('clearCache is no-op without provider', () => {
      expect(() => bridge.clearCache()).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // _reset for testing
  // -------------------------------------------------------------------------

  describe('_reset', () => {
    test('clears internal state', () => {
      bridge._getProvider();
      bridge._reset();
      expect(bridge._initialized).toBe(false);
      expect(bridge._provider).toBeNull();
    });
  });
});

// =============================================================================
// BRACKET_LAYER_MAP
// =============================================================================

describe('BRACKET_LAYER_MAP', () => {
  test('FRESH maps to layer 0 with 0 tokens', () => {
    expect(BRACKET_LAYER_MAP.FRESH).toEqual({ layer: 0, maxTokens: 0 });
  });

  test('MODERATE maps to layer 1 with ~50 tokens', () => {
    expect(BRACKET_LAYER_MAP.MODERATE).toEqual({ layer: 1, maxTokens: 50 });
  });

  test('DEPLETED maps to layer 2 with ~200 tokens', () => {
    expect(BRACKET_LAYER_MAP.DEPLETED).toEqual({ layer: 2, maxTokens: 200 });
  });

  test('CRITICAL maps to layer 3 with ~1000 tokens', () => {
    expect(BRACKET_LAYER_MAP.CRITICAL).toEqual({ layer: 3, maxTokens: 1000 });
  });
});
