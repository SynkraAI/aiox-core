#!/usr/bin/env node
/**
 * Squad Greeting Generator
 *
 * Generates contextual greetings for squad agents (external squads in squads/).
 * Follows the same pattern as generate-greeting.js but for squad-based agents.
 *
 * Features:
 * - Loads agent definition from squads/{squad}/agents/{agent}.md
 * - Loads squad config.yaml for settings
 * - Generates ecosystem report if enabled in settings
 * - Uses GreetingBuilder for contextual greeting
 *
 * Performance Targets:
 * - With cache: <100ms
 * - Without cache: <200ms
 * - Fallback: <20ms
 *
 * Usage:
 *   node generate-squad-greeting.js <squad-name> [agent-name]
 *
 * Examples:
 *   node generate-squad-greeting.js squad-creator
 *   node generate-squad-greeting.js squad-creator squad-architect
 *
 * @module generate-squad-greeting
 * @version 1.1.0
 * @location squads/squad-creator/scripts/
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Framework dependencies (from .aios-core/)
const { SquadLoader } = require('../../../.aios-core/development/scripts/squad/squad-loader');
const GreetingBuilder = require('../../../.aios-core/development/scripts/greeting-builder');
const SessionContextLoader = require('../../../.aios-core/scripts/session-context-loader');
const { loadProjectStatus } = require('../../../.aios-core/infrastructure/scripts/project-status-loader');

const SQUADS_PATH = './squads';
const REGISTRY_PATH = './squads/squad-creator/data/squad-registry.yaml';
const TIMEOUT_MS = 200;

/**
 * Load agent definition from squad
 *
 * @param {string} squadName - Squad directory name
 * @param {string} agentName - Agent file name (without .md)
 * @returns {Promise<Object>} Parsed agent definition
 */
async function loadSquadAgent(squadName, agentName) {
  const agentPath = path.join(process.cwd(), SQUADS_PATH, squadName, 'agents', `${agentName}.md`);

  try {
    const content = await fs.readFile(agentPath, 'utf8');

    // Extract YAML block
    const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
    if (!yamlMatch) {
      throw new Error(`No YAML block found in ${agentName}.md`);
    }

    const agentDef = yaml.load(yamlMatch[1]);

    // Validate required fields
    if (!agentDef.agent || !agentDef.agent.id) {
      throw new Error('Invalid agent definition: missing agent.id');
    }

    // Normalize with defaults
    return normalizeAgentDefinition(agentDef);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Agent file not found: ${agentPath}`);
    }
    throw error;
  }
}

/**
 * Normalize agent definition with defaults
 *
 * @param {Object} agentDef - Raw agent definition
 * @returns {Object} Normalized definition
 */
function normalizeAgentDefinition(agentDef) {
  const agent = agentDef.agent;

  // Ensure required fields
  agent.id = agent.id || 'unknown';
  agent.name = agent.name || agent.id;
  agent.icon = agent.icon || '🤖';

  // Ensure persona_profile with greeting_levels
  if (!agentDef.persona_profile) {
    agentDef.persona_profile = {
      greeting_levels: {
        minimal: `${agent.icon} ${agent.id} ready`,
        named: `${agent.icon} ${agent.name} ready`,
        archetypal: `${agent.icon} ${agent.name} ready`,
      },
    };
  } else if (!agentDef.persona_profile.greeting_levels) {
    agentDef.persona_profile.greeting_levels = {
      minimal: `${agent.icon} ${agent.id} ready`,
      named: `${agent.icon} ${agent.name} ready`,
      archetypal: `${agent.icon} ${agent.name} ready`,
    };
  }

  // Ensure commands array
  if (!agentDef.commands || !Array.isArray(agentDef.commands)) {
    agentDef.commands = [];
  }

  return agentDef;
}

/**
 * Load squad config.yaml
 *
 * @param {string} squadName - Squad directory name
 * @returns {Promise<Object>} Squad configuration
 */
async function loadSquadConfig(squadName) {
  const loader = new SquadLoader({ squadsPath: SQUADS_PATH });

  try {
    const { manifestPath } = await loader.resolve(squadName);
    const content = await fs.readFile(manifestPath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.warn(`[generate-squad-greeting] Failed to load config: ${error.message}`);
    return { settings: { activation: {} } };
  }
}

/**
 * Load squad registry data
 *
 * @returns {Promise<Object>} Registry data
 */
async function loadSquadRegistry() {
  try {
    const registryPath = path.join(process.cwd(), REGISTRY_PATH);
    const content = await fs.readFile(registryPath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.warn(`[generate-squad-greeting] Failed to load registry: ${error.message}`);
    return null;
  }
}

/**
 * Get ecosystem counts from registry
 *
 * @param {Object} registry - Squad registry data
 * @returns {Object} Asset counts
 */
function getEcosystemCounts(registry) {
  if (!registry || !registry.metadata) {
    return {
      squadCount: 0,
      agentCount: 0,
      taskCount: 0,
      templateCount: 0,
      checklistCount: 0,
      workflowCount: 0,
    };
  }

  // Read from metadata (pre-computed by *refresh-registry)
  const meta = registry.metadata;
  return {
    squadCount: meta.total_squads || 0,
    agentCount: meta.total_agents || 0,
    taskCount: meta.total_tasks || 0,
    templateCount: meta.total_templates || 0,
    checklistCount: meta.total_checklists || 0,
    workflowCount: meta.total_workflows || 0,
  };
}

/**
 * Get top squads from registry
 *
 * @param {Object} registry - Squad registry data
 * @param {number} limit - Max squads to return
 * @returns {Array} Top squads with counts
 */
function getTopSquads(registry, limit = 5) {
  if (!registry || !registry.squads) {
    return [];
  }

  const squads = Object.entries(registry.squads)
    .map(([name, data]) => ({
      name,
      agents: data.agents || 0,
      domain: data.domain || '',
      purpose: data.purpose?.substring(0, 35) || '',
      isQualityRef: data.quality_reference || false,
    }))
    .sort((a, b) => b.agents - a.agents)
    .slice(0, limit);

  return squads;
}

/**
 * Generate ecosystem report from registry
 *
 * @param {Object} settings - Ecosystem report settings
 * @returns {Promise<string>} Formatted report
 */
async function generateEcosystemReport(settings = {}) {
  const registry = await loadSquadRegistry();
  const counts = getEcosystemCounts(registry);

  let report = `## 📊 AIOS Squad Ecosystem

**${counts.squadCount} Squads** | **${counts.agentCount} Agents** | **${counts.taskCount} Tasks** | **${counts.checklistCount} Checklists** | **${counts.workflowCount} Workflows**`;

  if (settings.show_top_squads !== false) {
    const topSquads = getTopSquads(registry, settings.top_squads_limit || 5);

    if (topSquads.length > 0) {
      report += `

### Top Squads
| Squad | Agents | Domain |
|-------|--------|--------|`;

      for (const squad of topSquads) {
        const marker = squad.isQualityRef ? ' ⭐' : '';
        report += `
| ${squad.name}${marker} | ${squad.agents} | ${squad.domain} |`;
      }
    }
  }

  // Show quality references if enabled
  if (settings.show_quality_refs !== false && registry?.quality_references) {
    report += `

### Quality References`;
    for (const ref of registry.quality_references.slice(0, 3)) {
      report += `
- **${ref.squad}**: ${ref.reason}`;
    }
  }

  // Show gaps if enabled
  if (settings.show_gaps && registry?.gaps) {
    const highPriorityGaps = registry.gaps.filter(g => g.priority === 'high');
    if (highPriorityGaps.length > 0) {
      report += `

### Domain Gaps (High Priority)`;
      for (const gap of highPriorityGaps.slice(0, 3)) {
        report += `
- **${gap.domain}**: ${gap.potential_minds?.slice(0, 2).join(', ') || 'needs research'}`;
      }
    }
  }

  return report;
}

/**
 * Load session context
 *
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} Session context
 */
async function loadSessionContext(agentId) {
  try {
    const loader = new SessionContextLoader();
    return await loader.loadContext(agentId);
  } catch (error) {
    console.warn(`[generate-squad-greeting] Session context failed: ${error.message}`);
    return {
      sessionType: 'new',
      message: null,
      previousAgent: null,
      lastCommands: [],
      workflowActive: null,
    };
  }
}

/**
 * Generate greeting for squad agent
 *
 * @param {string} squadName - Squad directory name
 * @param {string} [agentName] - Agent name (defaults to main orchestrator)
 * @returns {Promise<string>} Formatted greeting
 */
async function generateSquadGreeting(squadName, agentName) {
  const startTime = Date.now();

  try {
    // Load squad config
    const config = await loadSquadConfig(squadName);
    const settings = config.settings || {};
    const activationSettings = settings.activation || {};

    // Determine agent name (default to squad-architect or first agent)
    if (!agentName) {
      agentName = 'squad-architect'; // Default orchestrator
    }

    // Load agent definition
    const agentDef = await loadSquadAgent(squadName, agentName);

    // Build greeting parts
    const parts = [];

    // 1. Ecosystem report (if enabled)
    if (activationSettings.show_ecosystem_report) {
      const ecosystemSettings = settings.ecosystem_report || {};
      const report = await generateEcosystemReport(ecosystemSettings);
      parts.push(report);
    }

    // 2. Load context for greeting builder
    const [sessionContext, projectStatus] = await Promise.all([
      loadSessionContext(agentDef.agent.id),
      loadProjectStatus().catch(() => null),
    ]);

    const context = {
      conversationHistory: [],
      sessionType: sessionContext.sessionType,
      projectStatus: projectStatus,
      lastCommands: sessionContext.lastCommands || [],
      previousAgent: sessionContext.previousAgent,
      sessionMessage: sessionContext.message,
      workflowActive: sessionContext.workflowActive,
    };

    // 3. Build greeting using GreetingBuilder
    const agentWithPersona = {
      ...agentDef.agent,
      persona_profile: agentDef.persona_profile,
      persona: agentDef.persona,
      commands: agentDef.commands || [],
    };

    const builder = new GreetingBuilder();
    const greeting = await builder.buildGreeting(agentWithPersona, context);
    parts.push(greeting);

    const duration = Date.now() - startTime;
    if (duration > 150) {
      console.warn(`[generate-squad-greeting] Slow generation: ${duration}ms`);
    }

    return parts.join('\n\n');
  } catch (error) {
    console.error('[generate-squad-greeting] Error:', {
      squadName,
      agentName,
      error: error.message,
      stack: error.stack,
    });

    // Fallback greeting
    return generateFallbackGreeting(squadName, agentName);
  }
}

/**
 * Generate fallback greeting
 *
 * @param {string} squadName - Squad name
 * @param {string} agentName - Agent name
 * @returns {string} Simple fallback greeting
 */
function generateFallbackGreeting(squadName, agentName) {
  const displayName = agentName || squadName;
  return `🎨 ${displayName} ready

Type \`*help\` to see available commands.`;
}

// CLI interface
if (require.main === module) {
  const squadName = process.argv[2];
  const agentName = process.argv[3];

  if (!squadName) {
    console.error('Usage: node generate-squad-greeting.js <squad-name> [agent-name]');
    console.error('\nExamples:');
    console.error('  node generate-squad-greeting.js squad-creator');
    console.error('  node generate-squad-greeting.js squad-creator squad-architect');
    process.exit(1);
  }

  // Execute with timeout protection
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Greeting timeout')), TIMEOUT_MS),
  );

  Promise.race([generateSquadGreeting(squadName, agentName), timeoutPromise])
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      console.log(generateFallbackGreeting(squadName, agentName));
      process.exit(1);
    });
}

module.exports = {
  generateSquadGreeting,
  loadSquadAgent,
  loadSquadConfig,
  generateEcosystemReport,
  loadSquadRegistry,
  getEcosystemCounts,
  getTopSquads,
};
