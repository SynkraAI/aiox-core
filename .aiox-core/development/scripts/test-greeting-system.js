#!/usr/bin/env node

/**
 * Test Script for Contextual Greeting System
 *
 * Tests the greeting builder with different scenarios
 * Run: node .aiox-core/scripts/test-greeting-system.js
 */

const GreetingBuilder = require('./greeting-builder');
const _fs = require('fs');
const _path = require('path');
const _yaml = require('js-yaml');

// Mock agent definition (simulates @dev)
const mockDevAgent = {
  name: 'Dex',
  id: 'dev',
  title: 'Full Stack Developer',
  icon: '💻',
  persona_profile: {
    archetype: 'Builder',
    zodiac: '♒ Aquarius',
    greeting_levels: {
      minimal: '💻 Dex ready',
      named: '💻 Dex (Builder) ready. Let\'s build something solid!',
      archetypal: '💻 Dex the Builder (♒ Aquarius) ready to construct excellence!',
    },
  },
  persona: {
    role: 'Full Stack Developer specializing in clean, maintainable code',
  },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show all available commands with descriptions' },
    { name: 'develop', visibility: ['full', 'quick', 'key'], description: 'Implement story tasks (modes: yolo, interactive, preflight)' },
    { name: 'review-code', visibility: ['full', 'quick'], description: 'Review uncommitted code changes for quality and standards' },
    { name: 'run-tests', visibility: ['full', 'quick'], description: 'Execute test suite and show results' },
    { name: 'build', visibility: ['full'], description: 'Build the project for production' },
    { name: 'debug', visibility: ['full'], description: 'Start debugging session with breakpoints' },
    { name: 'refactor', visibility: ['full'], description: 'Refactor code for better maintainability' },
    { name: 'performance', visibility: ['full'], description: 'Analyze and optimize performance' },
    { name: 'security', visibility: ['full'], description: 'Run security audit and fix vulnerabilities' },
    { name: 'qa-gate', visibility: ['key'], description: 'Run quality gate before commit' },
    { name: 'commit', visibility: ['key'], description: 'Create git commit with conventional format' },
    { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit dev mode' },
  ],
};

// Mock PO agent
const mockPoAgent = {
  name: 'Pax',
  id: 'po',
  title: 'Product Owner',
  icon: '⚖️',
  persona_profile: {
    archetype: 'Balancer',
    zodiac: '♎ Libra',
    greeting_levels: {
      minimal: '⚖️ Pax ready',
      named: '⚖️ Pax (Balancer) ready. Let\'s prioritize together!',
      archetypal: '⚖️ Pax the Balancer (♎ Libra) ready to harmonize requirements!',
    },
  },
  persona: {
    role: 'Product Owner focused on value delivery and stakeholder alignment',
  },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show available commands' },
    { name: 'validate-story-draft', visibility: ['full', 'quick', 'key'], description: 'Validate story quality and completeness' },
    { name: 'create-next-story', visibility: ['full', 'quick'], description: 'Create next story in backlog' },
    { name: 'backlog-summary', visibility: ['quick', 'key'], description: 'Quick backlog status summary' },
    { name: 'backlog-prioritize', visibility: ['full'], description: 'Prioritize backlog items' },
    { name: 'sync-story', visibility: ['full'], description: 'Sync story to ClickUp' },
    { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit PO mode' },
  ],
};

async function testGreetings() {
  console.log('🧪 Testing Contextual Greeting System\n');
  console.log('═'.repeat(80));

  const builder = new GreetingBuilder();

  // Test 1: New Session Greeting (Dev)
  console.log('\n📝 TEST 1: New Session (@dev activation)\n');
  console.log('─'.repeat(80));
  try {
    const newSessionGreeting = await builder.buildGreeting(mockDevAgent, {
      conversationHistory: [], // Empty history = new session
    });
    console.log(newSessionGreeting);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: Existing Session Greeting (Dev)
  console.log('\n\n📝 TEST 2: Existing Session (@dev with history)\n');
  console.log('─'.repeat(80));
  try {
    const existingSessionGreeting = await builder.buildGreeting(mockDevAgent, {
      conversationHistory: [
        { content: 'Hello' },
        { content: '*help' },
        { content: 'Show me the code' },
      ],
      lastCommand: 'review-code',
    });
    console.log(existingSessionGreeting);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Workflow Session Greeting (PO)
  console.log('\n\n📝 TEST 3: Workflow Session (@po after validate-story-draft)\n');
  console.log('─'.repeat(80));
  try {
    const workflowSessionGreeting = await builder.buildGreeting(mockPoAgent, {
      conversationHistory: [
        { content: '*validate-story-draft story-6.1.2.5.md' },
        { content: 'Story validated successfully!' },
      ],
    });
    console.log(workflowSessionGreeting);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Simple Greeting (Fallback)
  console.log('\n\n📝 TEST 4: Simple Greeting (Fallback)\n');
  console.log('─'.repeat(80));
  const simpleGreeting = builder.buildSimpleGreeting(mockDevAgent);
  console.log(simpleGreeting);

  console.log('\n' + '═'.repeat(80));
  console.log('\n✅ All tests completed!\n');
}

// Run tests
testGreetings().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
