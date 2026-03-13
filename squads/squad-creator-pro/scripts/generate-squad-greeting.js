#!/usr/bin/env node
/**
 * Squad Greeting Generator (Pro Wrapper)
 *
 * Thin wrapper that delegates to squad-creator's canonical implementation
 * with squad-creator-pro specific configuration.
 *
 * @module generate-squad-greeting
 * @version 2.0.0
 * @location squads/squad-creator-pro/scripts/
 */

const { generateSquadGreeting } = require('../../squad-creator/scripts/generate-squad-greeting');

// Pro-specific configuration
const SQUADS_PATH = './squads';
const REGISTRY_PATH = './squads/squad-creator-pro/data/squad-registry.yaml';
const TIMEOUT_MS = 200;

// CLI interface
if (require.main === module) {
  const squadName = process.argv[2];
  const agentName = process.argv[3];

  if (!squadName) {
    console.error('Usage: node generate-squad-greeting.js <squad-name> [agent-name]');
    console.error('\nExamples:');
    console.error('  node generate-squad-greeting.js squad-creator-pro');
    console.error('  node generate-squad-greeting.js squad-creator-pro squad-chief');
    process.exit(1);
  }

  const opts = {
    squadsPath: SQUADS_PATH,
    registryPath: REGISTRY_PATH,
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Greeting timeout')), TIMEOUT_MS),
  );

  Promise.race([generateSquadGreeting(squadName, agentName, opts), timeoutPromise])
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      const fallbackGreeting = `🎨 ${agentName || squadName} ready\n\nType \`*help\` to see available commands.`;
      console.log(fallbackGreeting);
      process.exit(1);
    });
}

module.exports = { generateSquadGreeting };
