#!/usr/bin/env node
/**
 * Unified Greeting Generator - CLI Wrapper
 *
 * Story ACT-6: Refactored as thin wrapper around ActivationRuntime.
 *
 * ARCHITECTURE NOTE:
 * This file is now a thin CLI wrapper that delegates to the
 * ActivationRuntime for all context loading and greeting generation.
 * Previously, this file orchestrated its own parallel loading of
 * AgentConfigLoader, SessionContextLoader, and ProjectStatusLoader.
 * Now ALL agents (not just 3) can use the same unified pipeline.
 *
 * Performance Targets:
 * - With cache: <50ms
 * - Without cache: <200ms (timeout protection in pipeline)
 * - Fallback: <10ms
 *
 * Usage: node generate-greeting.js <agent-id>
 *
 * Used by: @devops, @data-engineer, @ux-design-expert (CLI invocation pattern)
 * Note: All 12 agents now activate through ActivationRuntime.
 *
 * @see activation-runtime.js for the runtime entrypoint
 * @see unified-activation-pipeline.js for pipeline internals
 * @see greeting-builder.js for core greeting logic
 *
 * Part of Story 6.1.4: Unified Greeting System Integration
 * Part of Story ACT-6: Unified Activation Pipeline
 */

'use strict';

const { ActivationRuntime } = require('./activation-runtime');

/**
 * Generate unified greeting for agent activation.
 *
 * Delegates to ActivationRuntime.activate() which handles:
 * - Parallel loading of config, session, project status, git, permissions
 * - Sequential context detection and workflow state
 * - Greeting generation via GreetingBuilder
 *
 * @param {string} agentId - Agent identifier (e.g., 'qa', 'dev')
 * @returns {Promise<string>} Formatted greeting string
 *
 * @example
 * const greeting = await generateGreeting('qa');
 * console.log(greeting);
 */
async function generateGreeting(agentId) {
  try {
    const runtime = new ActivationRuntime();
    const result = await runtime.activate(agentId);

    if (result.duration > 100) {
      console.warn(`[generate-greeting] Slow generation: ${result.duration}ms`);
    }

    return result.greeting;

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
 * Generate fallback greeting if everything fails
 * @private
 * @param {string} agentId - Agent ID
 * @returns {string} Simple fallback greeting
 */
function generateFallbackGreeting(agentId) {
  return `\u2705 ${agentId} Agent ready\n\nType \`*help\` to see available commands.`;
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
