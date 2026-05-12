#!/usr/bin/env node
/**
 * Greeting Configuration CLI
 *
 * Standalone CLI for managing greeting preferences.
 * Usage:
 *   node .aiox-core/scripts/greeting-config-cli.js get greeting
 *   node .aiox-core/scripts/greeting-config-cli.js set greeting.preference minimal
 */

const GreetingPreferenceManager = require('./greeting-preference-manager');

const command = process.argv[2];
const subcommand = process.argv[3];
const value = process.argv[4];

(async () => {
  try {
    const manager = new GreetingPreferenceManager();

    switch (command) {
      case 'get':
        if (subcommand === 'greeting') {
          const config = manager.getConfig();

          console.log('📊 Agent Greeting Configuration\n');
          console.log(`Preference: ${config.preference || 'auto'} (auto|minimal|named|archetypal)`);
          console.log(`Context Detection: ${config.contextDetection !== false ? 'enabled' : 'disabled'}`);
          console.log(`Session Detection: ${config.sessionDetection || 'hybrid'}`);
          console.log(`Workflow Detection: ${config.workflowDetection || 'hardcoded'}`);
          console.log(`Show Archetype: ${config.showArchetype !== false ? 'yes' : 'no'}`);
          console.log(`Locale: ${config.locale || 'en-US'}`);

          console.log('\n💡 Examples:');
          console.log('  - "auto": Session-aware greetings (default)');
          console.log('  - "minimal": Always minimal greeting');
          console.log('  - "named": Always named greeting');
          console.log('  - "archetypal": Always archetypal greeting');
        } else {
          console.error('Usage: node greeting-config-cli.js get greeting');
          process.exit(1);
        }
        break;

      case 'set':
        if (subcommand === 'greeting.preference' && value) {
          const result = manager.setPreference(value);
          console.log(`✅ Greeting preference set to: ${result.preference}`);

          if (value === 'auto') {
            console.log('\n📌 Using automatic session-aware greetings:');
            console.log('  - New session → Full greeting (archetypal level)');
            console.log('  - Existing session → Quick greeting (named level)');
            console.log('  - Workflow session → Minimal greeting + suggestions');
          } else {
            console.log(`\n📌 Using fixed level: ${value} for all sessions`);
          }
        } else {
          console.error('Usage: node greeting-config-cli.js set greeting.preference <auto|minimal|named|archetypal>');
          console.error('\nExamples:');
          console.error('  node greeting-config-cli.js set greeting.preference auto');
          console.error('  node greeting-config-cli.js set greeting.preference minimal');
          process.exit(1);
        }
        break;

      default:
        console.log(`
Usage:
  node greeting-config-cli.js get greeting
  node greeting-config-cli.js set greeting.preference <auto|minimal|named|archetypal>

Examples:
  node greeting-config-cli.js get greeting
  node greeting-config-cli.js set greeting.preference auto
  node greeting-config-cli.js set greeting.preference minimal
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
})();

