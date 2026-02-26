/**
 * core-config.yaml Template Generator
 * Story 1.6: Environment Configuration
 *
 * Generates YAML configuration file for AIOS framework
 *
 * @module core-config-template
 */

const yaml = require('js-yaml');

/**
 * Generate core-config.yaml content
 *
 * @param {Object} options - Configuration options
 * @param {string} options.projectType - Project type from Story 1.3 (GREENFIELD|BROWNFIELD|EXISTING_AIOS)
 * @param {Array<string>} [options.selectedIDEs] - Selected IDEs from Story 1.4
 * @param {Array<Object>} [options.mcpServers] - MCP server configurations from Story 1.5
 * @param {string} [options.aiosVersion] - AIOS version (default: 2.1.0)
 * @param {string} [options.userProfile] - User profile from Story 10.2 (bob|advanced)
 * @returns {string} core-config.yaml content
 */
function generateCoreConfig(options = {}) {
  const {
    projectType = 'GREENFIELD',
    selectedIDEs = [],
    mcpServers = [],
    aiosVersion = '2.1.0',
    userProfile = 'advanced', // Default for backward compatibility (Story 10.2)
  } = options;

  const config = {
    // Framework Version & Metadata
    markdownExploder: true,

    // Project Configuration (from Story 1.3)
    project: {
      type: projectType,
      installedAt: new Date().toISOString(),
      version: aiosVersion,
    },

    // User Profile Configuration (Story 10.2 - Epic 10: User Profile System)
    // PRD: AIOS v2.0 "Projeto Bob" - Seção 2
    // Controls which interface mode is active for the user
    // Options: bob (simplified) | advanced (full access)
    user_profile: userProfile,

    // Language: Delegated to Claude Code native settings.json (Story ACT-12)
    // See: ~/.claude/settings.json → { "language": "portuguese" }

    // IDE Configuration (from Story 1.4)
    ide: {
      selected: selectedIDEs.length > 0 ? selectedIDEs : ['claude-code', 'codex'],
      configs: {
        vscode: selectedIDEs.includes('vscode') || selectedIDEs.length === 0, // Legacy compatibility
        codex: selectedIDEs.includes('codex'),
        gemini: selectedIDEs.includes('gemini'),
        cursor: selectedIDEs.includes('cursor'),
        'github-copilot': selectedIDEs.includes('github-copilot'),
        antigravity: selectedIDEs.includes('antigravity'),
        zed: selectedIDEs.includes('zed'),
        'claude-desktop': selectedIDEs.includes('claude-desktop'),
        'claude-code': selectedIDEs.includes('claude-code'),
      },
    },

    // MCP Configuration (from Story 1.5)
    mcp: {
      enabled: mcpServers.length > 0,
      configLocation: '.claude/mcp.json',
      servers: mcpServers.map(server => server.name || server.id),
    },

    // QA Configuration
    qa: {
      qaLocation: 'docs/qa',
    },

    // PRD Configuration
    prd: {
      prdFile: 'docs/prd.md',
      prdVersion: 'v4',
      prdSharded: true,
      prdShardedLocation: 'docs/prd',
      epicFilePattern: 'epic-{n}*.md',
    },

    // Architecture Configuration
    architecture: {
      architectureFile: 'docs/architecture.md',
      architectureVersion: 'v4',
      architectureSharded: true,
      architectureShardedLocation: 'docs/architecture',
    },

    // Development Configuration
    customTechnicalDocuments: null,
    devLoadAlwaysFiles: [
      'docs/framework/coding-standards.md',
      'docs/framework/tech-stack.md',
      'docs/framework/source-tree.md',
    ],
    devLoadAlwaysFilesFallback: [
      'docs/architecture/padroes-de-codigo.md',
      'docs/architecture/pilha-tecnologica.md',
      'docs/architecture/arvore-de-origem.md',
    ],
    devDebugLog: '.ai/debug-log.md',
    devStoryLocation: 'docs/stories',

    // Slash Command Prefix
    slashPrefix: 'AIOS',

    // Framework Documentation Paths
    frameworkDocsLocation: 'docs/framework',
    projectDocsLocation: 'docs/architecture/project-decisions',

    // Lazy Loading Configuration
    lazyLoading: {
      enabled: true,
      heavySections: [
        'pvMindContext',
        'squads',
        'registry',
      ],
    },

    // Git Configuration
    git: {
      showConfigWarning: true,
      cacheTimeSeconds: 300,
    },

    // Decision Logging Configuration
    decisionLogging: {
      enabled: true,
      async: true,
      location: '.ai/',
      indexFile: 'decision-logs-index.md',
      format: 'adr',
      performance: {
        maxOverhead: 50,
      },
    },

    // Resource Locations
    toolsLocation: '.aios-core/tools',
    scriptsLocation: '.aios-core/scripts',
    dataLocation: '.aios-core/data',
    elicitationLocation: '.aios-core/elicitation',
    squadsLocation: 'squads',
    mindsLocation: 'outputs/minds',

    // Project Status Configuration
    projectStatus: {
      enabled: true,
      autoLoadOnAgentActivation: true,
      showInGreeting: true,
      cacheTimeSeconds: 60,
      components: {
        gitBranch: true,
        gitStatus: true,
        recentWork: true,
        currentEpic: true,
        currentStory: true,
      },
      statusFile: '.aios/project-status.yaml',
      maxModifiedFiles: 5,
      maxRecentCommits: 2,
    },

    // Boundary Protection (Epic BM — Boundary Mapping)
    // frameworkProtection: true enforces deny rules in settings.json for L1-L4 layers
    boundary: {
      frameworkProtection: true,
      // L1/L2 paths — blocked from editing in project mode
      protected: [
        '.aios-core/core/**',
        '.aios-core/development/tasks/**',
        '.aios-core/development/templates/**',
        '.aios-core/development/checklists/**',
        '.aios-core/development/workflows/**',
        '.aios-core/infrastructure/**',
        '.aios-core/constitution.md',
        'bin/aios.js',
        'bin/aios-init.js',
      ],
      // L3 paths — mutable exceptions (allowed even within .aios-core/)
      exceptions: [
        '.aios-core/data/**',
        '.aios-core/development/agents/*/MEMORY.md',
        '.aios-core/core/config/schemas/**',
        '.aios-core/core/config/template-overrides.js',
      ],
    },

    // Agent Identity Configuration
    agentIdentity: {
      greeting: {
        contextDetection: true,
        sessionDetection: 'hybrid',
        workflowDetection: 'hardcoded',
        performance: {
          gitCheckCache: true,
          gitCheckTTL: 300,
        },
      },
    },
  };

  // Convert to YAML with proper formatting
  return yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

module.exports = {
  generateCoreConfig,
};
