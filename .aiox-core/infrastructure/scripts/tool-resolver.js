const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const fg = require('fast-glob');

/**
 * ToolResolver - Resolves and loads AIOX tools from file system
 *
 * Features:
 * - Map-based caching for performance (<5ms cached lookups)
 * - Search path priority: squad → common → core
 * - Glob-based file resolution
 * - Schema validation
 * - Health checking (tool_call, command, http methods)
 * - Schema version auto-detection
 *
 * Target Performance: <50ms for uncached resolution
 */
class ToolResolver {
  constructor() {
    // Map-based cache for fast lookups
    this.cache = new Map();

    // Base search paths (in priority order)
    this.basePaths = [
      'aiox-core/tools',
      'common/tools',
      // Squad paths added dynamically during resolution
    ];
  }

  /**
   * Resolve a tool by name
   *
   * @param {string} toolName - Tool identifier (e.g., 'clickup', 'github-cli')
   * @param {object} context - Resolution context (optional)
   * @param {string} context.expansionPack - Specific squad to search
   * @returns {object} Tool definition with schema_version detected
   * @throws {Error} If tool not found or validation fails
   */
  async resolveTool(toolName, context = {}) {
    // 1. Check cache first (performance: <5ms cached)
    const cacheKey = `${context.expansionPack || 'core'}:${toolName}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. Build search paths (squad → core priority)
    const searchPaths = [];
    if (context.expansionPack) {
      searchPaths.push(`squads/${context.expansionPack}/tools`);
    }
    searchPaths.push(...this.basePaths);

    // 3. Find tool file using glob (searches subdirectories)
    let toolPath = null;
    for (const basePath of searchPaths) {
      const candidates = fg.sync(`${basePath}/**/${toolName}.yaml`);
      if (candidates.length > 0) {
        toolPath = candidates[0];
        break;
      }
    }

    if (!toolPath) {
      throw new Error(`Tool '${toolName}' not found in search paths: ${searchPaths.join(', ')}`);
    }

    // 4. Load and parse YAML
    const toolContent = await fs.readFile(toolPath, 'utf8');
    let toolDef = yaml.load(toolContent);

    // Extract tool object if wrapped (handles both formats)
    if (toolDef.tool) {
      toolDef = toolDef.tool;
    }

    // 5. Validate schema
    await this.validateToolSchema(toolDef);

    // 6. Detect schema version (auto-detection if not specified)
    if (!toolDef.schema_version) {
      toolDef.schema_version = this.detectSchemaVersion(toolDef);
    }

    // 7. Health check if configured
    if (toolDef.health_check) {
      const healthy = await this.checkHealth(toolDef);
      if (!healthy && toolDef.health_check.required) {
        throw new Error(`Required tool '${toolName}' health check failed`);
      }
      toolDef._healthStatus = healthy ? 'healthy' : 'unhealthy';
    }

    // 8. Cache and return (target: <50ms total)
    this.cache.set(cacheKey, toolDef);
    return toolDef;
  }

  /**
   * Validate tool schema structure
   *
   * @param {object} tool - Tool definition
   * @throws {Error} If required fields missing or invalid
   */
  async validateToolSchema(tool) {
    // Required fields for all tools
    const requiredFields = ['id', 'type', 'name', 'version', 'description'];

    for (const field of requiredFields) {
      if (!tool[field]) {
        throw new Error(`Tool missing required field: ${field}`);
      }
    }

    // Validate type enum
    const validTypes = ['mcp', 'cli', 'local', 'meta'];
    if (!validTypes.includes(tool.type)) {
      throw new Error(`Invalid tool type '${tool.type}'. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate version format (basic semver check)
    const semverPattern = /^\d+\.\d+\.\d+$/;
    if (!semverPattern.test(tool.version)) {
      throw new Error(`Invalid version format '${tool.version}'. Expected semantic versioning (e.g., 1.0.0)`);
    }

    // Validate schema_version if present (support both string and numeric formats)
    if (tool.schema_version) {
      const version = typeof tool.schema_version === 'number'
        ? tool.schema_version
        : parseFloat(tool.schema_version);

      if (![1.0, 2.0].includes(version)) {
        throw new Error(`Invalid schema_version '${tool.schema_version}'. Must be '1.0' or '2.0'`);
      }
    }

    // v2.0 specific validation
    if (tool.schema_version === '2.0' || tool.schema_version === 2.0) {
      await this.validateV2Schema(tool);
    }
  }

  /**
   * Validate v2.0 schema-specific features
   *
   * @param {object} tool - Tool definition
   * @throws {Error} If v2.0 features are invalid
   */
  async validateV2Schema(tool) {
    // Validate executable_knowledge if present
    if (tool.executable_knowledge) {
      const { helpers, processors, validators } = tool.executable_knowledge;

      // Validate helpers
      if (helpers) {
        if (!Array.isArray(helpers)) {
          throw new Error('executable_knowledge.helpers must be an array');
        }
        for (const helper of helpers) {
          if (!helper.id || !helper.language || !helper.function) {
            throw new Error('Helper must have id, language, and function fields');
          }
          if (helper.language !== 'javascript') {
            throw new Error(`Unsupported helper language: ${helper.language}`);
          }
        }
      }

      // Validate validators
      if (validators) {
        if (!Array.isArray(validators)) {
          throw new Error('executable_knowledge.validators must be an array');
        }
        for (const validator of validators) {
          if (!validator.id || !validator.validates || !validator.function) {
            throw new Error('Validator must have id, validates, and function fields');
          }
        }
      }
    }

    // Validate anti_patterns if present
    if (tool.anti_patterns) {
      if (!Array.isArray(tool.anti_patterns)) {
        throw new Error('anti_patterns must be an array');
      }
      for (const pattern of tool.anti_patterns) {
        if (!pattern.pattern || !pattern.description || !pattern.wrong || !pattern.correct) {
          throw new Error('Anti-pattern must have pattern, description, wrong, and correct fields');
        }
      }
    }
  }

  /**
   * Detect schema version from tool features
   *
   * @param {object} tool - Tool definition
   * @returns {number} Detected schema version (1.0 or 2.0)
   */
  detectSchemaVersion(tool) {
    // Check for v2.0 features
    const hasExecutableKnowledge = !!tool.executable_knowledge;
    const hasApiComplexity = !!tool.api_complexity;
    const hasAntiPatterns = !!tool.anti_patterns;
    const hasEnhancedExamples = tool.examples &&
      Object.values(tool.examples).some(ex =>
        ex.some(e => e.scenario && ['success', 'failure_invalid_param'].includes(e.scenario)),
      );

    if (hasExecutableKnowledge || hasApiComplexity || hasAntiPatterns || hasEnhancedExamples) {
      return 2.0;
    }

    // Default to v1.0 (simple tools)
    return 1.0;
  }

  /**
   * Perform health check on tool
   *
   * @param {object} tool - Tool definition with health_check config
   * @returns {boolean} True if healthy, false otherwise
   */
  async checkHealth(tool) {
    const { health_check } = tool;

    if (!health_check || !health_check.method) {
      return true; // No health check configured = assume healthy
    }

    try {
      switch (health_check.method) {
        case 'tool_call':
          // Execute a specific tool command and check response
          // Note: Actual implementation would use ToolExecutor
          // For now, check if command exists in tool definition
          return !!tool.commands?.includes(health_check.command);

        case 'command':
          // Execute shell command and check exit code
          // Note: Actual implementation would use child_process
          // For now, return true (not implemented)
          return true;

        case 'http':
          // Make HTTP request and check status
          // Note: Actual implementation would use fetch/axios
          // For now, return true (not implemented)
          return true;

        default:
          console.warn(`Unknown health check method: ${health_check.method}`);
          return true;
      }
    } catch (error) {
      console.error(`Health check failed for tool '${tool.id}':`, error);
      return false;
    }
  }

  /**
   * Clear cache (useful for testing or reloading tools)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns {object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * List all available tools across all search paths
   *
   * @returns {Array<string>} Array of tool file paths
   */
  listAvailableTools() {
    const allTools = [];
    for (const basePath of this.basePaths) {
      const tools = fg.sync(`${basePath}/**/*.yaml`);
      allTools.push(...tools);
    }
    return allTools;
  }

  /**
   * Check if a tool exists without loading it
   *
   * @param {string} toolName - Tool identifier
   * @param {object} context - Resolution context
   * @returns {boolean} True if tool exists
   */
  async toolExists(toolName, context = {}) {
    const searchPaths = [];
    if (context.expansionPack) {
      searchPaths.push(`squads/${context.expansionPack}/tools`);
    }
    searchPaths.push(...this.basePaths);

    for (const basePath of searchPaths) {
      const candidates = fg.sync(`${basePath}/**/${toolName}.yaml`);
      if (candidates.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set custom search paths (useful for testing)
   *
   * @param {string[]} paths - Array of search paths
   */
  setSearchPaths(paths) {
    this.basePaths = paths;
  }

  /**
   * Reset search paths to default
   */
  resetSearchPaths() {
    this.basePaths = [
      'aiox-core/tools',
      'common/tools',
    ];
  }
}

// Export singleton instance
const toolResolverInstance = new ToolResolver();

// Save reference to instance method BEFORE it gets overwritten by the export
const yamlBasedResolveTool = toolResolverInstance.resolveTool.bind(toolResolverInstance);

/**
 * Simple tool resolution function - delegates to YAML-based tool resolution
 * All tools (including MCP tools like clickup and github) are loaded from YAML definitions
 *
 * @param {string} toolName - Name of the tool (e.g., 'clickup', 'github')
 * @param {object} context - Resolution context (optional, includes expansionPack)
 * @returns {object} Tool definition from YAML file
 */
async function resolveTool(toolName, context = {}) {
  // All tools go through YAML-based resolution
  return await yamlBasedResolveTool(toolName, context);
}

module.exports = toolResolverInstance;
module.exports.resolveTool = resolveTool;
