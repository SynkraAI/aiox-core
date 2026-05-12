'use strict';

const { CodeIntelProvider } = require('./provider-interface');

/**
 * Code Graph MCP tool name mapping.
 * Maps abstract capabilities to Code Graph MCP tool names.
 */
const TOOL_MAP = {
  findDefinition: 'find_definition',
  findReferences: 'find_references',
  findCallers: 'find_callers',
  findCallees: 'find_callees',
  analyzeDependencies: 'dependency_analysis',
  analyzeComplexity: 'complexity_analysis',
  analyzeCodebase: 'analyze_codebase',
  getProjectStats: 'project_statistics',
};

/**
 * CodeGraphProvider — Adapter for Code Graph MCP server.
 *
 * Translates the 8 abstract capabilities into Code Graph MCP tool calls.
 * Normalizes responses to match the provider-interface contract.
 */
class CodeGraphProvider extends CodeIntelProvider {
  constructor(options = {}) {
    super('code-graph', options);
    this._mcpServerName = options.mcpServerName || 'code-graph';
  }

  /**
   * Code Graph provider is available when mcpCallFn is configured.
   * @returns {boolean}
   */
  isAvailable() {
    return typeof this.options.mcpCallFn === 'function';
  }

  /**
   * Execute an MCP tool call via the configured server.
   * This method is the single point of MCP communication — all capabilities route through here.
   *
   * @param {string} toolName - MCP tool name (e.g. 'find_definition')
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object|null>} Tool result or null on failure
   * @private
   */
  async _callMcpTool(toolName, params = {}) {
    // MCP tool calls are executed via the Claude Code MCP protocol.
    // In production, this is invoked by the Claude Code runtime.
    // For testing, this method is mocked.
    //
    // The actual MCP call signature:
    //   mcp__<server>__<tool>(params)
    //
    // Since we run inside Claude Code agent context, the MCP call
    // is abstracted. Consumers of this module use the client layer
    // which handles the actual invocation.

    if (typeof this.options.mcpCallFn === 'function') {
      return await this.options.mcpCallFn(this._mcpServerName, toolName, params);
    }

    // No MCP call function configured — provider cannot operate
    return null;
  }

  async findDefinition(symbol, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.findDefinition, {
      symbol,
      ...options,
    });
    return this._normalizeDefinitionResult(result);
  }

  async findReferences(symbol, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.findReferences, {
      symbol,
      ...options,
    });
    return this._normalizeReferencesResult(result);
  }

  async findCallers(symbol, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.findCallers, {
      symbol,
      ...options,
    });
    return this._normalizeCallersResult(result);
  }

  async findCallees(symbol, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.findCallees, {
      symbol,
      ...options,
    });
    return this._normalizeCalleesResult(result);
  }

  async analyzeDependencies(path, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.analyzeDependencies, {
      path,
      ...options,
    });
    return this._normalizeDependenciesResult(result);
  }

  async analyzeComplexity(path, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.analyzeComplexity, {
      path,
      ...options,
    });
    return this._normalizeComplexityResult(result);
  }

  async analyzeCodebase(path, options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.analyzeCodebase, {
      path,
      ...options,
    });
    return this._normalizeCodebaseResult(result);
  }

  async getProjectStats(options = {}) {
    const result = await this._callMcpTool(TOOL_MAP.getProjectStats, options);
    return this._normalizeStatsResult(result);
  }

  // --- Normalization helpers ---
  // Normalize MCP responses to provider-interface contract format.
  // If result is null/undefined, return null (fallback).

  _normalizeDefinitionResult(result) {
    if (!result) return null;
    return {
      file: result.file ?? result.path ?? null,
      line: result.line != null ? result.line : (result.row != null ? result.row : null),
      column: result.column != null ? result.column : (result.col != null ? result.col : null),
      context: result.context || result.snippet || null,
    };
  }

  _normalizeReferencesResult(result) {
    if (!result) return null;
    const items = Array.isArray(result) ? result : result.references || result.results || [];
    return items.map((r) => ({
      file: r.file ?? r.path ?? null,
      line: r.line != null ? r.line : (r.row != null ? r.row : null),
      context: r.context || r.snippet || null,
    }));
  }

  _normalizeCallersResult(result) {
    if (!result) return null;
    const items = Array.isArray(result) ? result : result.callers || result.results || [];
    return items.map((r) => ({
      caller: r.caller || r.name || null,
      file: r.file ?? r.path ?? null,
      line: r.line != null ? r.line : (r.row != null ? r.row : null),
    }));
  }

  _normalizeCalleesResult(result) {
    if (!result) return null;
    const items = Array.isArray(result) ? result : result.callees || result.results || [];
    return items.map((r) => ({
      callee: r.callee || r.name || null,
      file: r.file ?? r.path ?? null,
      line: r.line != null ? r.line : (r.row != null ? r.row : null),
    }));
  }

  _normalizeDependenciesResult(result) {
    if (!result) return null;
    return {
      nodes: result.nodes || result.files || [],
      edges: result.edges || result.dependencies || [],
    };
  }

  _normalizeComplexityResult(result) {
    if (!result) return null;
    return {
      score: result.score != null ? result.score : (result.complexity != null ? result.complexity : 0),
      details: result.details || result.metrics || {},
    };
  }

  _normalizeCodebaseResult(result) {
    if (!result) return null;
    return {
      files: result.files || [],
      structure: result.structure || {},
      patterns: result.patterns || [],
    };
  }

  _normalizeStatsResult(result) {
    if (!result) return null;
    return {
      files: result.files != null ? result.files : (result.total_files != null ? result.total_files : 0),
      lines: result.lines != null ? result.lines : (result.total_lines != null ? result.total_lines : 0),
      languages: result.languages || {},
    };
  }
}

module.exports = { CodeGraphProvider, TOOL_MAP };
