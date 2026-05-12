/**
 * Unified Hook Interface
 * Story GEMINI-INT.8 - Cross-CLI Hook Abstraction
 *
 * Write hooks once, run on both Claude Code and Gemini CLI.
 */

/**
 * Hook lifecycle event mapping between CLIs
 */
const EVENT_MAPPING = {
  // AIOX Event -> { claude: ClaudeEvent, gemini: GeminiEvent }
  sessionStart: { claude: null, gemini: 'SessionStart' },
  beforeAgent: { claude: 'PreToolUse', gemini: 'BeforeAgent' },
  beforeTool: { claude: 'PreToolUse', gemini: 'BeforeTool' },
  afterTool: { claude: 'PostToolUse', gemini: 'AfterTool' },
  sessionEnd: { claude: 'Stop', gemini: 'SessionEnd' },
};

/**
 * Base class for unified hooks
 */
class UnifiedHook {
  /**
   * Create a unified hook
   * @param {Object} config - Hook configuration
   * @param {string} config.name - Hook name
   * @param {string} config.event - AIOX event name
   * @param {string} [config.matcher='*'] - Tool/event matcher pattern
   */
  constructor(config) {
    this.name = config.name;
    this.event = config.event;
    this.matcher = config.matcher || '*';
    this.timeout = config.timeout || 5000;
  }

  /**
   * Execute the hook (override in subclass)
   * @param {HookContext} context - Execution context
   * @returns {Promise<HookResult>} Hook result
   */
  async execute(context) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Get Claude Code hook configuration
   * @returns {Object|null} Claude hook config or null if not supported
   */
  toClaudeConfig() {
    const claudeEvent = EVENT_MAPPING[this.event]?.claude;
    if (!claudeEvent) return null;

    // TODO: Restore when runners/ directory is implemented (Story MIS-2)
    // Runners not yet implemented - path .aiox-core/hooks/unified/runners/ does not exist
    return null;

    // return {
    //   event: claudeEvent,
    //   matcher: this.matcher,
    //   handler: `node .aiox-core/hooks/unified/runners/claude-runner.js ${this.name}`,
    // };
  }

  /**
   * Get Gemini CLI hook configuration
   * @returns {Object} Gemini hook config
   */
  toGeminiConfig() {
    const geminiEvent = EVENT_MAPPING[this.event]?.gemini;

    // TODO: Restore when runners/ directory is implemented (Story MIS-2)
    // Runners not yet implemented - path .aiox-core/hooks/unified/runners/ does not exist
    return null;

    // return {
    //   matcher: this.matcher,
    //   hooks: [
    //     {
    //       name: this.name,
    //       type: 'command',
    //       command: `node .aiox-core/hooks/unified/runners/gemini-runner.js ${this.name}`,
    //       timeout: this.timeout,
    //     },
    //   ],
    // };
  }
}

/**
 * Hook execution context
 * @typedef {Object} HookContext
 * @property {string} projectDir - Project directory
 * @property {string} sessionId - Session identifier
 * @property {string} [toolName] - Tool being executed (for tool hooks)
 * @property {Object} [toolArgs] - Tool arguments
 * @property {Object} [toolResult] - Tool result (for after hooks)
 * @property {string} provider - Current provider ('claude' or 'gemini')
 */

/**
 * Hook execution result
 * @typedef {Object} HookResult
 * @property {'allow'|'block'|'modify'} status - Result status
 * @property {string} [message] - Status message
 * @property {Object} [contextInjection] - Context to inject
 * @property {Object} [modifiedArgs] - Modified tool arguments
 */

/**
 * Create context from environment (works for both CLIs)
 * @param {string} provider - Provider name
 * @returns {HookContext} Execution context
 */
function createContext(provider) {
  const isGemini = provider === 'gemini';

  return {
    projectDir: isGemini
      ? process.env.GEMINI_PROJECT_DIR || process.cwd()
      : process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    sessionId: isGemini
      ? process.env.GEMINI_SESSION_ID || `session-${Date.now()}`
      : process.env.CLAUDE_SESSION_ID || `session-${Date.now()}`,
    provider,
  };
}

/**
 * Format result for CLI consumption
 * @param {HookResult} result - Hook result
 * @param {string} provider - Provider name
 * @returns {string} JSON string
 */
function formatResult(result, provider) {
  if (provider === 'gemini') {
    // Gemini expects specific format
    return JSON.stringify({
      status: result.status === 'block' ? 'block' : 'success',
      message: result.message,
      contextInjection: result.contextInjection,
    });
  }

  // Claude format
  return JSON.stringify({
    continue: result.status !== 'block',
    message: result.message,
    context: result.contextInjection,
  });
}

module.exports = {
  UnifiedHook,
  EVENT_MAPPING,
  createContext,
  formatResult,
};
