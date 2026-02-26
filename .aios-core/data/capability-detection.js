#!/usr/bin/env node
// =============================================================================
// AIOS Capability Detection Module
// =============================================================================
// Detects Claude Code runtime capabilities for token optimization decisions.
// Runs at session initialization (not per-turn).
//
// Story: TOK-2 (Deferred/Search Capability-Aware Loading)
// ADR-7: Capability gate por runtime
//
// Usage:
//   node .aios-core/data/capability-detection.js
//
// Output:
//   .aios/runtime-capabilities.json
// =============================================================================

const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, '.aios', 'runtime-capabilities.json');

function detectToolSearch() {
  // Check Claude Code cached features for tool search availability
  const claudeJsonPath = path.join(os.homedir(), '.claude.json');
  try {
    const config = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf8'));
    const features = config.cachedGrowthBookFeatures || {};
    return {
      available: features.tengu_mcp_tool_search === true,
      source: 'cachedGrowthBookFeatures.tengu_mcp_tool_search',
      detectionMethod: 'claude-json-feature-flag'
    };
  } catch {
    return {
      available: false,
      source: 'detection-failed',
      detectionMethod: 'claude-json-feature-flag'
    };
  }
}

function detectDeferLoading() {
  // defer_loading is API-only (Python SDK mcp_toolset), NOT available in Claude Code CLI
  return {
    available: false,
    reason: 'defer_loading is API-only (Python SDK). Not exposed in Claude Code CLI.',
    source: 'ADR-7 / Codex CRITICO-1'
  };
}

function detectProjectMcps() {
  const mcpJsonPath = path.join(PROJECT_ROOT, '.mcp.json');
  try {
    const config = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf8'));
    const servers = config.mcpServers || {};
    return Object.entries(servers).map(([name, cfg]) => ({
      name,
      type: cfg.type || 'command',
      scope: 'project',
      source: '.mcp.json'
    }));
  } catch {
    return [];
  }
}

function detectGlobalMcps() {
  // Docker MCP Gateway catalog
  const dockerMcpConfigPath = path.join(os.homedir(), '.docker', 'mcp', 'config.yaml');
  const servers = [];

  try {
    const content = fs.readFileSync(dockerMcpConfigPath, 'utf8');
    // Simple YAML top-level key parsing (keys at indent 0 followed by colon)
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+):/);
      if (match) {
        servers.push({
          name: match[1],
          type: 'docker-gateway',
          scope: 'global',
          source: '~/.docker/mcp/config.yaml'
        });
      }
    }
  } catch {
    // Docker MCP not configured — not an error
  }

  // Direct MCPs in Claude Code (playwright, etc.)
  // These are registered via `claude mcp add` at user scope
  // Detection: check ~/.claude/settings.json or known conventions
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings.mcpServers) {
      for (const [name, cfg] of Object.entries(settings.mcpServers)) {
        servers.push({
          name,
          type: cfg.type || 'command',
          scope: 'global-settings',
          source: '~/.claude/settings.json'
        });
      }
    }
  } catch {
    // No global settings MCPs
  }

  return servers;
}

function detectDockerGateway() {
  const dockerMcpDir = path.join(os.homedir(), '.docker', 'mcp');
  const exists = fs.existsSync(dockerMcpDir);

  return {
    available: exists,
    configPath: exists ? dockerMcpDir : null,
    detectionMethod: 'filesystem-check'
  };
}

function loadToolRegistry() {
  const registryPath = path.join(PROJECT_ROOT, '.aios-core', 'data', 'tool-registry.yaml');
  try {
    const content = fs.readFileSync(registryPath, 'utf8');
    // Count tools by tier (simple regex parsing)
    const tier1 = (content.match(/tier: 1/g) || []).length;
    const tier2 = (content.match(/tier: 2/g) || []).length;
    const tier3 = (content.match(/tier: 3/g) || []).length;

    // 2-pass parsing: collect all fields per tool, then classify
    // (essential: may appear before mcp_server: in YAML)
    const tools = {};
    let currentTool = null;

    // Pass 1: collect all fields
    for (const line of content.split('\n')) {
      const toolMatch = line.match(/^ {2}([a-zA-Z0-9_-]+):$/);
      if (toolMatch) {
        currentTool = toolMatch[1];
        tools[currentTool] = {};
        continue;
      }
      if (!currentTool) continue;

      const tierMatch = line.match(/^\s+tier:\s*(\d)/);
      if (tierMatch) { tools[currentTool].tier = parseInt(tierMatch[1]); continue; }

      const mcpMatch = line.match(/^\s+mcp_server:\s*(.+)/);
      if (mcpMatch) { tools[currentTool].mcpServer = mcpMatch[1].trim(); continue; }

      const essentialMatch = line.match(/^\s+essential:\s*(true|false)/);
      if (essentialMatch) { tools[currentTool].essential = essentialMatch[1] === 'true'; continue; }
    }

    // Pass 2: classify Tier 3 tools with essential flag
    const essential = [];
    const nonEssential = [];
    for (const [name, fields] of Object.entries(tools)) {
      if (fields.tier !== 3 || fields.essential === undefined) continue;
      const scope = fields.mcpServer === 'project' ? 'project' : 'global';
      const entry = { name, scope };
      if (fields.essential) {
        essential.push(entry);
      } else {
        nonEssential.push(entry);
      }
    }

    return {
      available: true,
      totalTools: tier1 + tier2 + tier3,
      tier1Count: tier1,
      tier2Count: tier2,
      tier3Count: tier3,
      essential,
      nonEssential
    };
  } catch {
    return { available: false, totalTools: 0, tier1Count: 0, tier2Count: 0, tier3Count: 0, essential: [], nonEssential: [] };
  }
}

function determineStrategy(toolSearch, deferLoading, dockerGateway) {
  // ADR-7 Strategy Hierarchy:
  // 1. Best case: Tool Search auto-mode → deferred MCP schemas automatically
  // 2. Fallback 1: MCP discipline — disable non-essential MCP servers
  // 3. Fallback 2: CLAUDE.md guidance — instruct to prefer native tools

  if (toolSearch.available) {
    return {
      primary: 'tool-search-auto',
      description: 'Claude Code Tool Search is active. Tier 3 MCP tools are automatically deferred via tool_search.',
      fallbacks: ['mcp-discipline', 'claudemd-guidance']
    };
  }

  if (dockerGateway.available) {
    return {
      primary: 'mcp-discipline',
      description: 'Tool Search not available. Using MCP discipline: disable non-essential servers in .mcp.json.',
      fallbacks: ['claudemd-guidance']
    };
  }

  return {
    primary: 'claudemd-guidance',
    description: 'Neither Tool Search nor Docker Gateway available. Using CLAUDE.md guidance for tool selection priority.',
    fallbacks: []
  };
}

function run() {
  const timestamp = new Date().toISOString();

  const toolSearch = detectToolSearch();
  const deferLoading = detectDeferLoading();
  const projectMcps = detectProjectMcps();
  const globalMcps = detectGlobalMcps();
  const dockerGateway = detectDockerGateway();
  const toolRegistry = loadToolRegistry();

  const strategy = determineStrategy(toolSearch, deferLoading, dockerGateway);

  const capabilities = {
    version: '1.0.0',
    generatedAt: timestamp,
    generatedBy: 'capability-detection.js',
    story: 'TOK-2',

    methodology: {
      toolSearchLatency: 'Managed internally by Claude Code — not programmatically measurable. Guidance-level enforcement via CLAUDE.md.',
      mcpCountUnit: 'servers (not individual tools). TOK-1.5 baseline uses tool count (e.g., Apify = 7 tools = 1 server).'
    },

    runtime: {
      toolSearch,
      deferLoading,
      dockerGateway
    },

    mcpServers: {
      project: projectMcps,
      global: globalMcps,
      totalCount: projectMcps.length + globalMcps.length,
      countUnit: 'servers'
    },

    toolRegistry,

    strategy,

    // Essential/non-essential derived from tool-registry.yaml (single source of truth)
    essentialServers: toolRegistry.essential.length > 0
      ? toolRegistry.essential
      : [{ name: 'nogic', scope: 'project' }, { name: 'code-graph', scope: 'project' }],

    nonEssentialServers: toolRegistry.nonEssential.length > 0
      ? toolRegistry.nonEssential
      : []
  };

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(capabilities, null, 2));
  console.log(`✅ Runtime capabilities detected and saved to ${OUTPUT_PATH}`);
  console.log(`   Strategy: ${strategy.primary} — ${strategy.description}`);
  console.log(`   Tool Search: ${toolSearch.available ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
  console.log(`   MCPs: ${projectMcps.length} project + ${globalMcps.length} global = ${projectMcps.length + globalMcps.length} total`);
  console.log(`   Tool Registry: ${toolRegistry.totalTools} tools (T1:${toolRegistry.tier1Count} T2:${toolRegistry.tier2Count} T3:${toolRegistry.tier3Count})`);

  return capabilities;
}

// Execute
if (require.main === module) {
  run();
}

module.exports = { run, detectToolSearch, detectProjectMcps, detectGlobalMcps, detectDockerGateway };
