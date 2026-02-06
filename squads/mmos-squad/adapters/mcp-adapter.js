/**
 * MCP Adapter - MMOS Squad
 *
 * Provides documented patterns for using MCP servers in MMOS tasks.
 * MCPs are called by Claude Code, not programmatically - this adapter
 * documents the patterns and provides validation helpers.
 *
 * Available MCPs:
 * - EXA (via docker-gateway): Web search, company research
 * - Context7 (via docker-gateway): Library documentation
 * - Playwright: Browser automation, testing
 *
 * @module mmos-squad/adapters/mcp-adapter
 * @version 1.0.0
 * @story STORY-10.8
 */

/**
 * MCPAdapter - Documentation and validation for MCP usage patterns
 *
 * IMPORTANT: This adapter does NOT call MCPs directly.
 * MCPs are invoked by Claude Code during task execution.
 * This adapter provides:
 * 1. Documentation of available MCP patterns
 * 2. Validation helpers for MCP parameters
 * 3. Usage examples for task authors
 */
class MCPAdapter {
  /**
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.silent=false] - Suppress logs
   * @param {string} [options.traceId] - Trace ID for logging
   */
  constructor(options = {}) {
    this.options = {
      silent: options.silent ?? false,
      traceId: options.traceId ?? `mmos-mcp-${Date.now()}`,
    };
  }

  // ============================================================
  // EXA MCP PATTERNS
  // ============================================================

  /**
   * Get EXA web search pattern for public figure detection
   *
   * MCP Tool: mcp__docker-gateway__web_search_exa
   *
   * @param {string} personName - Name to search for
   * @param {number} [numResults=10] - Number of results
   * @returns {Object} MCP call pattern
   *
   * @example
   * // In task markdown:
   * // Use EXA MCP for web search:
   * // mcp__docker-gateway__web_search_exa
   * // Query: "Daniel Kahneman"
   * // numResults: 10
   */
  getWebSearchPattern(personName, numResults = 10) {
    if (!personName || typeof personName !== 'string') {
      throw new Error('personName is required and must be a string');
    }

    return {
      mcp: 'mcp__docker-gateway__web_search_exa',
      params: {
        query: personName,
        numResults: numResults,
      },
      usage: 'Public figure detection, source discovery',
      detection_logic: {
        public: '5+ relevant results with name in title/description',
        no_public: '< 5 results or no relevant matches',
      },
    };
  }

  /**
   * Get EXA company research pattern for entrepreneurs
   *
   * MCP Tool: mcp__docker-gateway__web_search_exa
   *
   * @param {string} personName - Entrepreneur name
   * @param {string} [companyName] - Company name if known
   * @returns {Object} MCP call pattern
   */
  getCompanyResearchPattern(personName, companyName = null) {
    if (!personName || typeof personName !== 'string') {
      throw new Error('personName is required and must be a string');
    }

    const query = companyName
      ? `"${personName}" "${companyName}" founder CEO`
      : `"${personName}" entrepreneur founder company`;

    return {
      mcp: 'mcp__docker-gateway__web_search_exa',
      params: {
        query: query,
        numResults: 10,
      },
      usage: 'Entrepreneur detection, company research',
    };
  }

  /**
   * Get source discovery sweep pattern for viability assessment
   *
   * Combines multiple EXA searches to discover available sources.
   *
   * @param {string} mindName - Name of the person
   * @returns {Array<Object>} Array of search patterns
   */
  getSourceDiscoverySweep(mindName) {
    if (!mindName || typeof mindName !== 'string') {
      throw new Error('mindName is required and must be a string');
    }

    return [
      {
        category: 'books',
        mcp: 'mcp__docker-gateway__web_search_exa',
        params: { query: `"${mindName}" book author published`, numResults: 5 },
      },
      {
        category: 'interviews',
        mcp: 'mcp__docker-gateway__web_search_exa',
        params: { query: `"${mindName}" interview podcast`, numResults: 5 },
      },
      {
        category: 'articles',
        mcp: 'mcp__docker-gateway__web_search_exa',
        params: { query: `"${mindName}" article blog essay`, numResults: 5 },
      },
      {
        category: 'videos',
        mcp: 'mcp__docker-gateway__web_search_exa',
        params: { query: `"${mindName}" youtube video talk`, numResults: 5 },
      },
      {
        category: 'social',
        mcp: 'mcp__docker-gateway__web_search_exa',
        params: { query: `"${mindName}" twitter linkedin`, numResults: 3 },
      },
    ];
  }

  // ============================================================
  // CONTEXT7 MCP PATTERNS
  // ============================================================

  /**
   * Get Context7 library docs pattern for prompt best practices
   *
   * MCP Tools:
   * - mcp__docker-gateway__resolve-library-id
   * - mcp__docker-gateway__get-library-docs
   *
   * @param {string} topic - Topic to search for
   * @param {string} [libraryName='anthropic claude'] - Library to search
   * @returns {Object} MCP call pattern
   *
   * @example
   * // In task markdown:
   * // 1. First resolve library ID:
   * // mcp__docker-gateway__resolve-library-id
   * // libraryName: "anthropic claude"
   * //
   * // 2. Then get docs:
   * // mcp__docker-gateway__get-library-docs
   * // context7CompatibleLibraryID: "/anthropic/claude-docs"
   * // topic: "system prompts"
   */
  getLibraryDocsPattern(topic, libraryName = 'anthropic claude') {
    if (!topic || typeof topic !== 'string') {
      throw new Error('topic is required and must be a string');
    }

    return {
      step1: {
        mcp: 'mcp__docker-gateway__resolve-library-id',
        params: { libraryName: libraryName },
        description: 'Resolve library to Context7-compatible ID',
      },
      step2: {
        mcp: 'mcp__docker-gateway__get-library-docs',
        params: {
          context7CompatibleLibraryID: '{resolved_id}',
          topic: topic,
          tokens: 10000,
        },
        description: 'Fetch documentation for specific topic',
      },
      usage: 'System prompt best practices, LLM documentation',
    };
  }

  // ============================================================
  // PLAYWRIGHT MCP PATTERNS
  // ============================================================

  /**
   * Get Playwright browser automation pattern for testing
   *
   * MCP Tools:
   * - mcp__playwright__browser_navigate
   * - mcp__playwright__browser_snapshot
   * - mcp__playwright__browser_type
   * - mcp__playwright__browser_click
   *
   * @param {string} testType - Type of test ('fidelity', 'blind', 'interaction')
   * @returns {Object} MCP call pattern
   */
  getPlaywrightPattern(testType) {
    const validTypes = ['fidelity', 'blind', 'interaction'];
    if (!validTypes.includes(testType)) {
      throw new Error(`testType must be one of: ${validTypes.join(', ')}`);
    }

    const patterns = {
      fidelity: {
        steps: [
          {
            mcp: 'mcp__playwright__browser_navigate',
            params: { url: '{test_harness_url}' },
            description: 'Navigate to test harness',
          },
          {
            mcp: 'mcp__playwright__browser_type',
            params: {
              text: '{test_prompt}',
              ref: '{input_ref}',
              element: 'Chat input field',
              submit: true,
            },
            description: 'Send test prompt',
          },
          {
            mcp: 'mcp__playwright__browser_snapshot',
            params: {},
            description: 'Capture response for analysis',
          },
        ],
        usage: 'Automated fidelity testing against test harness',
        metrics: ['signature_phrase_usage', 'tone_consistency', 'framework_application', 'value_alignment'],
      },
      blind: {
        steps: [
          {
            mcp: 'mcp__playwright__browser_navigate',
            params: { url: '{blind_test_url}' },
            description: 'Navigate to blind test interface',
          },
          {
            mcp: 'mcp__playwright__browser_type',
            params: {
              text: '{diagnostic_prompt}',
              ref: '{input_ref}',
              element: 'Chat input',
              submit: true,
            },
            description: 'Send diagnostic prompt',
          },
          {
            mcp: 'mcp__playwright__browser_snapshot',
            params: {},
            description: 'Capture for blind evaluation',
          },
        ],
        usage: 'Blind testing without knowing which clone is being tested',
        scoring: {
          identification_accuracy: 'Can evaluator identify the clone?',
          preference_rating: 'Which response is preferred?',
          fidelity_markers: 'Signature phrases, frameworks used',
        },
      },
      interaction: {
        steps: [
          {
            mcp: 'mcp__playwright__browser_navigate',
            params: { url: '{url}' },
            description: 'Navigate to target URL',
          },
          {
            mcp: 'mcp__playwright__browser_click',
            params: { element: '{element_description}', ref: '{ref}' },
            description: 'Click target element',
          },
          {
            mcp: 'mcp__playwright__browser_snapshot',
            params: {},
            description: 'Capture page state',
          },
        ],
        usage: 'General browser interaction for data collection',
      },
    };

    return patterns[testType];
  }

  // ============================================================
  // VALIDATION HELPERS
  // ============================================================

  /**
   * Validate MCP tool name format
   *
   * @param {string} toolName - Tool name to validate
   * @returns {boolean} True if valid format
   */
  isValidMCPToolName(toolName) {
    // Valid formats:
    // - mcp__docker-gateway__*
    // - mcp__playwright__*
    const validPrefixes = ['mcp__docker-gateway__', 'mcp__playwright__'];
    return validPrefixes.some((prefix) => toolName.startsWith(prefix));
  }

  /**
   * Get all available MCP tool names
   *
   * @returns {Object} Categorized list of MCP tools
   */
  getAvailableMCPTools() {
    return {
      exa: ['mcp__docker-gateway__web_search_exa'],
      context7: ['mcp__docker-gateway__resolve-library-id', 'mcp__docker-gateway__get-library-docs'],
      playwright: [
        'mcp__playwright__browser_navigate',
        'mcp__playwright__browser_snapshot',
        'mcp__playwright__browser_type',
        'mcp__playwright__browser_click',
        'mcp__playwright__browser_close',
        'mcp__playwright__browser_tabs',
        'mcp__playwright__browser_wait_for',
      ],
    };
  }

  /**
   * Log MCP usage (for debugging)
   * @private
   */
  _log(message) {
    if (!this.options.silent) {
      console.log(`[MCP-Adapter:${this.options.traceId}] ${message}`);
    }
  }
}

/**
 * Factory function
 * @param {Object} [options] - Configuration options
 * @returns {MCPAdapter}
 */
function createMCPAdapter(options = {}) {
  return new MCPAdapter(options);
}

module.exports = {
  MCPAdapter,
  createMCPAdapter,
};
