#!/usr/bin/env node
/**
 * Unified Greeting Generator
 * 
 * Orchestrates all greeting components for optimal performance:
 * - Agent definition (via expanded agent-config-loader.js)
 * - Session context (session-context-loader.js)
 * - Project status (project-status-loader.js)
 * - User preferences (greeting-preference-manager.js)
 * - Contextual adaptation (greeting-builder.js)
 * 
 * Performance Targets:
 * - With cache: <50ms
 * - Without cache: <150ms (timeout protection)
 * - Fallback: <10ms
 * 
 * Usage: node generate-greeting.js <agent-id>
 * 
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

const GreetingBuilder = require('./greeting-builder');
const SessionContextLoader = require('./session-context-loader');
const { loadProjectStatus } = require('./project-status-loader');
const { AgentConfigLoader } = require('./agent-config-loader');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');

/**
 * Generate unified greeting for agent activation
 * 
 * @param {string} agentId - Agent identifier (e.g., 'qa', 'dev')
 * @returns {Promise<string>} Formatted greeting string
 * @throws {Error} If agent file not found or invalid
 * 
 * @example
 * const greeting = await generateGreeting('qa');
 * console.log(greeting);
 */
async function generateGreeting(agentId) {
  const startTime = Date.now();
  
  try {
    // Load core config
    const coreConfigPath = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
    const coreConfigContent = await fs.readFile(coreConfigPath, 'utf8');
    const coreConfig = yaml.parse(coreConfigContent);
    
    // Load everything in parallel using expanded AgentConfigLoader
    const loader = new AgentConfigLoader(agentId);
    
    const [complete, sessionContext, projectStatus] = await Promise.all([
      loader.loadComplete(coreConfig), // Loads config + definition
      loadSessionContext(agentId),
      loadProjectStatus(),
    ]);
    
    // Build unified context
    const context = {
      conversationHistory: [], // Not available in Claude Code
      sessionType: sessionContext.sessionType, // Pre-detected
      projectStatus: projectStatus, // Pre-loaded
      lastCommands: sessionContext.lastCommands || [],
      previousAgent: sessionContext.previousAgent,
      sessionMessage: sessionContext.message,
      workflowActive: sessionContext.workflowActive,
      sessionStory: sessionContext.currentStory || null, // Session's current story (more accurate than git)
    };
    
    // Ensure agent has persona_profile and persona from definition
    const agentWithPersona = {
      ...complete.agent,
      persona_profile: complete.persona_profile || complete.definition?.persona_profile,
      persona: complete.definition?.persona || complete.persona,
      commands: complete.commands || complete.definition?.commands || [],
    };
    
    // Generate greeting using GreetingBuilder
    const builder = new GreetingBuilder();
    const greeting = await builder.buildGreeting(agentWithPersona, context);
    
    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`[generate-greeting] Slow generation: ${duration}ms`);
    }
    
    return greeting;
    
  } catch (error) {
    console.error('[generate-greeting] Error:', {
      agentId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Fallback: Simple greeting
    return generateFallbackGreeting(agentId);
  }
}

/**
 * Load session context for agent
 * @private
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} Session context
 */
async function loadSessionContext(agentId) {
  try {
    const loader = new SessionContextLoader();
    return loader.loadContext(agentId);
  } catch (error) {
    console.warn('[generate-greeting] Session context failed:', error.message);
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
 * Generate fallback greeting if everything fails
 * @private
 * @param {string} agentId - Agent ID
 * @returns {string} Simple fallback greeting
 */
function generateFallbackGreeting(agentId) {
  return `✅ ${agentId} Agent ready\n\nType \`*help\` to see available commands.`;
}

// CLI interface
if (require.main === module) {
  const agentId = process.argv[2];
  
  if (!agentId) {
    console.error('Usage: node generate-greeting.js <agent-id>');
    console.error('\nExamples:');
    console.error('  node generate-greeting.js qa');
    console.error('  node generate-greeting.js dev');
    process.exit(1);
  }
  
  generateGreeting(agentId)
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      console.log(generateFallbackGreeting(agentId));
      process.exit(1);
    });
}

module.exports = { generateGreeting };

