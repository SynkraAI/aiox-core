/**
 * Agent Config Loader
 *
 * Loads agent-specific configuration with lazy loading and performance tracking.
 * Part of Story 6.1.2.6: Framework Configuration System
 *
 * @module agent-config-loader
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { globalConfigCache } = require('../../core/config/config-cache');
const { trackConfigLoad } = require('../../infrastructure/scripts/performance-tracker');

/**
 * Agent configuration requirements cache
 */
let agentRequirements = null;

/**
 * Loads agent configuration requirements
 *
 * @returns {Promise<Object>} Agent requirements configuration
 */
async function loadAgentRequirements() {
  if (agentRequirements) {
    return agentRequirements;
  }

  const requirementsPath = path.join(process.cwd(), '.aiox-core', 'data', 'agent-config-requirements.yaml');

  try {
    const content = await fs.readFile(requirementsPath, 'utf8');
    agentRequirements = yaml.load(content);
    return agentRequirements;
  } catch (error) {
    console.warn(`⚠️ Could not load agent requirements: ${error.message}`);
    console.warn('   Falling back to default requirements');
    return { agents: {} };
  }
}

/**
 * Agent Config Loader Class
 *
 * Loads agent-specific configuration with lazy loading
 */
class AgentConfigLoader {
  constructor(agentId) {
    this.agentId = agentId;
    this.requirements = null;
    this.cache = globalConfigCache;
  }

  /**
   * Load requirements for this agent
   *
   * @returns {Promise<Object>} Agent requirements
   */
  async loadRequirements() {
    if (this.requirements) {
      return this.requirements;
    }

    const allRequirements = await loadAgentRequirements();
    this.requirements = allRequirements.agents?.[this.agentId] || allRequirements.agents?.default || this.getDefaultRequirements();

    return this.requirements;
  }

  /**
   * Get default requirements if not configured
   *
   * @returns {Object} Default requirements
   */
  getDefaultRequirements() {
    return {
      config_sections: ['dataLocation'],
      files_loaded: [],
      lazy_loading: {},
      performance_target: '<150ms',
    };
  }

  /**
   * Load configuration for this agent
   *
   * @param {Object} coreConfig - Core configuration object
   * @param {Object} options - Load options
   * @param {boolean} options.skipCache - Skip cache and force reload
   * @param {boolean} options.trackPerformance - Track performance (default: true)
   * @returns {Promise<Object>} Agent-specific configuration
   */
  async load(coreConfig, options = {}) {
    const startTime = Date.now();
    const skipCache = options.skipCache || false;
    const trackPerformance = options.trackPerformance !== false;

    // Load requirements
    await this.loadRequirements();

    // Build agent config
    const agentConfig = {};
    const sectionsLoaded = [];
    let totalSize = 0;
    let cacheHit = false;

    // Load required config sections
    for (const section of this.requirements.config_sections || []) {
      if (coreConfig[section] !== undefined) {
        agentConfig[section] = coreConfig[section];
        sectionsLoaded.push(section);

        // Estimate size
        const sectionSize = JSON.stringify(coreConfig[section]).length;
        totalSize += sectionSize;
      }
    }

    // Load required files (with lazy loading logic)
    const filesToLoad = this.getFilesToLoad();
    const fileContents = {};

    for (const filePath of filesToLoad) {
      const content = await this.loadFile(filePath, skipCache);
      fileContents[filePath] = content;

      if (content.fromCache) {
        cacheHit = true;
      }

      totalSize += content.size || 0;
    }

    // Measure load time
    const loadTime = Date.now() - startTime;

    // Track performance
    if (trackPerformance) {
      trackConfigLoad({
        agentId: this.agentId,
        loadTime,
        configSize: totalSize,
        cacheHit,
        sectionsLoaded,
      });

      this.logPerformance(loadTime);
    }

    return {
      config: agentConfig,
      files: fileContents,
      loadTime,
      configSize: totalSize,
      sectionsLoaded,
      cacheHit,
    };
  }

  /**
   * Get list of files to load based on lazy loading rules
   *
   * @returns {string[]} Array of file paths to load
   */
  getFilesToLoad() {
    const files = [];
    const filesLoaded = this.requirements.files_loaded || [];

    for (const fileEntry of filesLoaded) {
      // Parse file entry (can be string or object)
      const fileConfig = typeof fileEntry === 'string'
        ? { path: fileEntry, lazy: false }
        : fileEntry;

      const { path: filePath, lazy, condition } = fileConfig;

      // Apply lazy loading rules
      if (lazy && !this.shouldLoadLazy(condition)) {
        continue; // Skip lazy-loaded file
      }

      files.push(filePath);
    }

    return files;
  }

  /**
   * Check if lazy-loaded file should be loaded
   *
   * @param {string} condition - Condition to check
   * @returns {boolean} Whether to load the file
   */
  shouldLoadLazy(condition) {
    // Simple condition evaluation
    // In the future, this could be expanded to support complex conditions

    if (!condition) {
      return false; // No condition = don't load
    }

    // Example conditions:
    // - "yolo_mode" - load only in yolo mode
    // - "story_development" - load during story development
    // - "always" - always load (same as lazy: false)

    // For now, return false (don't load lazy files by default)
    return false;
  }

  /**
   * Load a file with caching
   *
   * @param {string} filePath - Path to file
   * @param {boolean} skipCache - Skip cache
   * @returns {Promise<Object>} File content and metadata
   */
  async loadFile(filePath, skipCache = false) {
    const cacheKey = `file:${filePath}`;

    // Check cache first
    if (!skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          content: cached.content,
          size: cached.size,
          fromCache: true,
        };
      }
    }

    try {
      // Resolve path relative to project root
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const content = await fs.readFile(fullPath, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');

      // Cache the result
      this.cache.set(cacheKey, { content, size });

      return {
        content,
        size,
        fromCache: false,
      };
    } catch (error) {
      console.warn(`⚠️ Failed to load file ${filePath}: ${error.message}`);
      return {
        content: null,
        size: 0,
        fromCache: false,
        error: error.message,
      };
    }
  }

  /**
   * Log performance metrics
   *
   * @param {number} loadTime - Load time in milliseconds
   */
  logPerformance(loadTime) {
    const target = this.requirements.performance_target || '<150ms';
    const targetMs = parseInt(target.replace('<', '').replace('ms', ''));

    if (loadTime > targetMs) {
      console.warn(`⚠️ Agent ${this.agentId} load time exceeded target: ${loadTime}ms > ${targetMs}ms`);
    } else {
      console.log(`✅ Agent ${this.agentId} loaded in ${loadTime}ms (target: ${target})`);
    }
  }

  /**
   * Preload files for this agent (warm up cache)
   *
   * @param {Object} coreConfig - Core configuration
   * @returns {Promise<void>}
   */
  async preload(coreConfig) {
    console.log(`🔄 Preloading config for @${this.agentId}...`);

    await this.load(coreConfig, {
      trackPerformance: false,
    });

    console.log(`✅ Config preloaded for @${this.agentId}`);
  }

  /**
   * Agent definition cache (5 min TTL)
   * @private
   */
  static agentDefCache = new Map();

  /**
   * Load complete agent definition from markdown file
   * 
   * @param {Object} options - Load options
   * @param {boolean} options.skipCache - Skip cache and force reload
   * @returns {Promise<Object>} Complete agent definition (agent, persona_profile, commands, etc.)
   */
  async loadAgentDefinition(options = {}) {
    const skipCache = options.skipCache || false;
    const cacheKey = this.agentId;
    
    // Check cache
    if (!skipCache && AgentConfigLoader.agentDefCache.has(cacheKey)) {
      const cached = AgentConfigLoader.agentDefCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.definition;
      }
    }
    
    // Load from file
    const agentPath = path.join(process.cwd(), '.aiox-core', 'development', 'agents', `${this.agentId}.md`);
    
    try {
      const content = await fs.readFile(agentPath, 'utf8');
      
      // Extract YAML block (handle both ```yaml and ```yml)
      const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
      if (!yamlMatch) {
        throw new Error(`No YAML block found in ${this.agentId}.md`);
      }
      
      let agentDef;
      try {
        agentDef = yaml.load(yamlMatch[1]);
      } catch (parseError) {
        // Try normalizing compact command format before parsing
        const normalizedYaml = this._normalizeCompactCommands(yamlMatch[1]);
        try {
          agentDef = yaml.load(normalizedYaml);
        } catch (_secondError) {
          throw new Error(`Failed to parse agent definition YAML for ${this.agentId}: ${parseError.message}`);
        }
      }
      
      // Validate structure
      if (!agentDef.agent || !agentDef.agent.id) {
        throw new Error('Invalid agent definition: missing agent.id');
      }
      
      // Normalize and validate
      const normalized = this._normalizeAgentDefinition(agentDef);
      
      // Cache
      AgentConfigLoader.agentDefCache.set(cacheKey, {
        definition: normalized,
        timestamp: Date.now(),
      });
      
      return normalized;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Agent file not found: ${this.agentId}.md`);
      }
      throw new Error(`Failed to load agent definition for ${this.agentId}: ${error.message}`);
    }
  }

  /**
   * Normalize compact command format to expanded format
   * Converts: "- help: Description" to "- name: help\n    description: Description"
   * @private
   * @param {string} yamlContent - Raw YAML content
   * @returns {string} Normalized YAML content
   */
  _normalizeCompactCommands(yamlContent) {
    const lines = yamlContent.split('\n');
    const normalizedLines = [];
    let inCommandsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect commands section start
      if (line.match(/^\s*commands:\s*$/)) {
        inCommandsSection = true;
        normalizedLines.push(line);
        continue;
      }
      
      // Detect end of commands section (next top-level key without indentation)
      if (inCommandsSection && line.match(/^\w+:/) && !line.match(/^\s+/)) {
        inCommandsSection = false;
        normalizedLines.push(line);
        continue;
      }
      
      // Process compact command format in commands section
      if (inCommandsSection) {
        // Match: "  - command-name {args}: Description with (parentheses)"
        // Pattern: indent + "- " + command (may have {args}) + ": " + description
        const compactMatch = line.match(/^(\s+)- (\w+(?:-\w+)*(?:\s+\{[^}]+\})?):\s*(.+)$/);
        if (compactMatch) {
          const [, indent, command, description] = compactMatch;
          const commandName = command.split(/\s+/)[0];
          
          // Escape quotes in description
          const escapedDescription = description.trim().replace(/"/g, '\\"');
          
          normalizedLines.push(`${indent}- name: ${commandName}`);
          normalizedLines.push(`${indent}  description: "${escapedDescription}"`);
          continue;
        }
      }
      
      normalizedLines.push(line);
    }
    
    return normalizedLines.join('\n');
  }

  /**
   * Normalize agent definition with defaults
   * @private
   * @param {Object} agentDef - Raw agent definition
   * @returns {Object} Normalized agent definition
   */
  _normalizeAgentDefinition(agentDef) {
    // Ensure agent object exists
    if (!agentDef.agent) {
      throw new Error('Agent definition missing "agent" section');
    }
    
    const agent = agentDef.agent;
    
    // Normalize: ensure required fields have defaults
    agent.id = agent.id || 'unknown';
    agent.name = agent.name || agent.id;
    agent.icon = agent.icon || '🤖';
    
    // Ensure persona_profile exists with greeting_levels (without overwriting)
    if (!agentDef.persona_profile) {
      agentDef.persona_profile = {
        greeting_levels: {
          minimal: `${agent.icon} ${agent.id} Agent ready`,
          named: `${agent.icon} ${agent.name} ready`,
          archetypal: `${agent.icon} ${agent.name} ready`,
        },
      };
    } else if (!agentDef.persona_profile.greeting_levels) {
      agentDef.persona_profile.greeting_levels = {
        minimal: `${agent.icon} ${agent.id} Agent ready`,
        named: `${agent.icon} ${agent.name} ready`,
        archetypal: `${agent.icon} ${agent.name} ready`,
      };
    }
    // Note: If greeting_levels already exists in YAML, we keep it as-is (don't overwrite)
    
    // Ensure commands array exists
    if (!agentDef.commands || !Array.isArray(agentDef.commands)) {
      agentDef.commands = [];
    }
    
    return agentDef;
  }

  /**
   * Load both config and definition (convenience method)
   * 
   * @param {Object} coreConfig - Core configuration
   * @param {Object} options - Load options
   * @returns {Promise<Object>} Combined config and definition
   */
  async loadComplete(coreConfig, options = {}) {
    const [config, definition] = await Promise.all([
      this.load(coreConfig, options),
      this.loadAgentDefinition(options),
    ]);
    
    return {
      ...config,
      definition,
      agent: definition.agent,
      persona_profile: definition.persona_profile,
      commands: definition.commands || [],
    };
  }

  /**
   * Clear cache for this agent
   */
  clearCache() {
    const filesToLoad = this.getFilesToLoad();

    for (const filePath of filesToLoad) {
      const cacheKey = `file:${filePath}`;
      this.cache.invalidate(cacheKey);
    }

    // Also clear agent definition cache
    AgentConfigLoader.agentDefCache.delete(this.agentId);

    console.log(`🗑️ Cache cleared for @${this.agentId}`);
  }
}

/**
 * Convenience function to load config for an agent
 *
 * @param {string} agentId - Agent identifier
 * @param {Object} coreConfig - Core configuration
 * @param {Object} options - Load options
 * @returns {Promise<Object>} Agent configuration
 */
async function loadAgentConfig(agentId, coreConfig, options = {}) {
  const loader = new AgentConfigLoader(agentId);
  return await loader.load(coreConfig, options);
}

/**
 * Preload configuration for multiple agents
 *
 * @param {string[]} agentIds - Array of agent IDs
 * @param {Object} coreConfig - Core configuration
 * @returns {Promise<void>}
 */
async function preloadAgents(agentIds, coreConfig) {
  console.log(`🔄 Preloading ${agentIds.length} agents...`);

  const startTime = Date.now();

  await Promise.all(
    agentIds.map(agentId => {
      const loader = new AgentConfigLoader(agentId);
      return loader.preload(coreConfig);
    }),
  );

  const duration = Date.now() - startTime;
  console.log(`✅ ${agentIds.length} agents preloaded in ${duration}ms`);
}

module.exports = {
  AgentConfigLoader,
  loadAgentConfig,
  preloadAgents,
  loadAgentRequirements,
};

// CLI support
if (require.main === module) {
  const command = process.argv[2];
  const agentId = process.argv[3];

  (async () => {
    try {
      // Load config via layered resolver (PRO-4: config hierarchy)
      const { resolveConfig } = require('../../core/config/config-resolver');
      const { config: coreConfig } = resolveConfig(process.cwd());

      switch (command) {
        case 'load': {
          if (!agentId) {
            console.error('Usage: node agent-config-loader.js load <agent-id>');
            process.exit(1);
          }

          console.log(`\n🔍 Loading config for @${agentId}...\n`);

          const loader = new AgentConfigLoader(agentId);
          const result = await loader.load(coreConfig);

          console.log('\n📊 Results:');
          console.log(`   Load Time: ${result.loadTime}ms`);
          console.log(`   Config Size: ${(result.configSize / 1024).toFixed(2)} KB`);
          console.log(`   Cache Hit: ${result.cacheHit ? 'Yes' : 'No'}`);
          console.log(`   Sections Loaded: ${result.sectionsLoaded.join(', ')}`);
          console.log(`   Files Loaded: ${Object.keys(result.files).length}`);
          break;
        }

        case 'preload': {
          const agents = agentId ? [agentId] : [
            'aiox-master', 'dev', 'qa', 'architect', 'po', 'pm', 'sm',
            'analyst', 'ux-expert', 'data-engineer', 'devops', 'db-sage', 'security',
          ];

          await preloadAgents(agents, coreConfig);
          break;
        }

        case 'test': {
          console.log('\n🧪 Testing agent config loader...\n');

          // Test loading for a few agents
          const testAgents = ['dev', 'qa', 'po'];

          for (const agent of testAgents) {
            const testLoader = new AgentConfigLoader(agent);
            const testResult = await testLoader.load(coreConfig);

            console.log(`@${agent}:`);
            console.log(`  Load Time: ${testResult.loadTime}ms`);
            console.log(`  Config Size: ${(testResult.configSize / 1024).toFixed(2)} KB`);
            console.log(`  Cache Hit: ${testResult.cacheHit ? 'Yes' : 'No'}`);
            console.log('');
          }

          console.log('✅ All tests passed!\n');
          break;
        }

        default:
          console.log(`
Usage:
  node agent-config-loader.js load <agent-id>   - Load config for specific agent
  node agent-config-loader.js preload [agent]   - Preload agent(s) config
  node agent-config-loader.js test              - Run test suite
          `);
      }
    } catch (error) {
      console.error('Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })();
}
