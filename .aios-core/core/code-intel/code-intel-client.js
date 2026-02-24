'use strict';

const { CodeGraphProvider } = require('./providers/code-graph-provider');
const { RegistryProvider } = require('./providers/registry-provider');

// --- Constants (adjustable, not hardcoded magic numbers) ---
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_MS = 60000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Circuit breaker states
const CB_CLOSED = 'CLOSED';
const CB_OPEN = 'OPEN';
const CB_HALF_OPEN = 'HALF-OPEN';

/**
 * CodeIntelClient — Central entry point for code intelligence.
 *
 * Features:
 * - Provider auto-detection and registry
 * - Circuit breaker pattern (threshold 3, reset 60s)
 * - Session cache (Map-based, TTL 5min)
 * - Graceful fallback (returns null without throw when no provider available)
 * - Latency logging per capability
 * - Cache hit/miss counters
 */
class CodeIntelClient {
  constructor(options = {}) {
    this._providers = [];
    this._activeProvider = null;
    this._options = options;

    // Circuit breaker state
    this._cbState = CB_CLOSED;
    this._cbFailures = 0;
    this._cbOpenedAt = null;

    // Session cache
    this._cache = new Map();

    // Metrics
    this._cacheHits = 0;
    this._cacheMisses = 0;
    this._latencyLog = [];

    // Warning dedup
    this._noProviderWarned = false;

    // Auto-register default providers
    this._registerDefaultProviders(options);
  }

  /**
   * Register default providers based on configuration.
   * Provider priority: RegistryProvider FIRST (native, T1), then CodeGraphProvider (MCP, T3).
   * First provider with isAvailable() === true wins.
   * @private
   */
  _registerDefaultProviders(options) {
    // RegistryProvider — native, T1, always available when registry exists
    const registryProvider = new RegistryProvider({
      registryPath: options.registryPath || null,
      projectRoot: options.projectRoot || null,
    });
    this._providers.push(registryProvider);

    // Code Graph MCP — T3, available when mcpCallFn is configured
    const codeGraphProvider = new CodeGraphProvider({
      mcpServerName: options.mcpServerName || 'code-graph',
      mcpCallFn: options.mcpCallFn || null,
    });
    this._providers.push(codeGraphProvider);
  }

  /**
   * Register an additional provider.
   * @param {import('./providers/provider-interface').CodeIntelProvider} provider
   */
  registerProvider(provider) {
    this._providers.push(provider);
    // Reset active provider so next call re-detects
    this._activeProvider = null;
  }

  /**
   * Detect and return the first available provider.
   * Uses polymorphic isAvailable() — first provider that returns true wins.
   * @returns {import('./providers/provider-interface').CodeIntelProvider|null}
   * @private
   */
  _detectProvider() {
    if (this._activeProvider) return this._activeProvider;

    for (const provider of this._providers) {
      try {
        if (typeof provider.isAvailable === 'function' && provider.isAvailable()) {
          this._activeProvider = provider;
          return provider;
        }
      } catch (_err) {
        // Provider threw during availability check — treat as unavailable
      }
    }

    return null;
  }

  /**
   * Check if code intelligence is available.
   * @returns {boolean}
   */
  isCodeIntelAvailable() {
    return this._detectProvider() !== null;
  }

  /**
   * Execute a capability with circuit breaker, cache, and fallback.
   * @param {string} capability - One of the 8 primitive capability names
   * @param {Array} args - Arguments to pass to the capability
   * @returns {Promise<*>} Result or null on fallback
   */
  async _executeCapability(capability, args) {
    const startTime = Date.now();

    // Check provider availability
    const provider = this._detectProvider();
    if (!provider) {
      if (!this._noProviderWarned) {
        console.warn('[code-intel] No provider available. Code intelligence features disabled.');
        this._noProviderWarned = true;
      }
      return null;
    }

    // Check cache
    const cacheKey = `${capability}:${JSON.stringify(args)}`;
    const cached = this._getFromCache(cacheKey);
    if (cached !== undefined) {
      this._cacheHits++;
      this._logLatency(capability, Date.now() - startTime, true);
      return cached;
    }
    this._cacheMisses++;

    // Check circuit breaker
    if (this._cbState === CB_OPEN) {
      if (Date.now() - this._cbOpenedAt >= CIRCUIT_BREAKER_RESET_MS) {
        this._cbState = CB_HALF_OPEN;
      } else {
        this._logLatency(capability, Date.now() - startTime, false);
        return null;
      }
    }

    // Execute capability
    try {
      const result = await provider[capability](...args);
      this._onSuccess();
      this._putInCache(cacheKey, result);
      this._logLatency(capability, Date.now() - startTime, false);
      return result;
    } catch (_error) {
      this._onFailure();
      this._logLatency(capability, Date.now() - startTime, false);
      return null;
    }
  }

  // --- Circuit breaker helpers ---

  _onSuccess() {
    this._cbFailures = 0;
    if (this._cbState === CB_HALF_OPEN) {
      this._cbState = CB_CLOSED;
    }
  }

  _onFailure() {
    this._cbFailures++;
    if (this._cbFailures >= CIRCUIT_BREAKER_THRESHOLD) {
      this._cbState = CB_OPEN;
      this._cbOpenedAt = Date.now();
    }
  }

  getCircuitBreakerState() {
    // Re-check if open timer expired
    if (this._cbState === CB_OPEN && Date.now() - this._cbOpenedAt >= CIRCUIT_BREAKER_RESET_MS) {
      this._cbState = CB_HALF_OPEN;
    }
    return this._cbState;
  }

  // --- Cache helpers ---

  _getFromCache(key) {
    const entry = this._cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this._cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  _putInCache(key, value) {
    // Evict expired entries periodically (every 50 puts)
    if (this._cache.size > 0 && this._cache.size % 50 === 0) {
      this._evictExpired();
    }
    this._cache.set(key, { value, timestamp: Date.now() });
  }

  _evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this._cache) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        this._cache.delete(key);
      }
    }
  }

  // --- Latency logging ---

  _logLatency(capability, durationMs, isCacheHit) {
    this._latencyLog.push({
      capability,
      durationMs,
      isCacheHit,
      timestamp: Date.now(),
    });
  }

  // --- Metrics ---

  getMetrics() {
    return {
      cacheHits: this._cacheHits,
      cacheMisses: this._cacheMisses,
      cacheHitRate:
        this._cacheHits + this._cacheMisses > 0
          ? this._cacheHits / (this._cacheHits + this._cacheMisses)
          : 0,
      circuitBreakerState: this.getCircuitBreakerState(),
      latencyLog: this._latencyLog,
      providerAvailable: this.isCodeIntelAvailable(),
      activeProvider: this._activeProvider ? this._activeProvider.name : null,
    };
  }

  // --- 8 Primitive Capabilities (public API) ---

  async findDefinition(symbol, options) {
    return this._executeCapability('findDefinition', [symbol, options]);
  }

  async findReferences(symbol, options) {
    return this._executeCapability('findReferences', [symbol, options]);
  }

  async findCallers(symbol, options) {
    return this._executeCapability('findCallers', [symbol, options]);
  }

  async findCallees(symbol, options) {
    return this._executeCapability('findCallees', [symbol, options]);
  }

  async analyzeDependencies(path, options) {
    return this._executeCapability('analyzeDependencies', [path, options]);
  }

  async analyzeComplexity(path, options) {
    return this._executeCapability('analyzeComplexity', [path, options]);
  }

  async analyzeCodebase(path, options) {
    return this._executeCapability('analyzeCodebase', [path, options]);
  }

  async getProjectStats(options) {
    return this._executeCapability('getProjectStats', [options]);
  }
}

module.exports = {
  CodeIntelClient,
  CIRCUIT_BREAKER_THRESHOLD,
  CIRCUIT_BREAKER_RESET_MS,
  CACHE_TTL_MS,
  CB_CLOSED,
  CB_OPEN,
  CB_HALF_OPEN,
};
