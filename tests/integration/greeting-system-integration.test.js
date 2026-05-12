// Integration test - requires external services
// Uses describeIntegration from setup.js
/**
 * Integration Tests for Unified Greeting System
 * 
 * Tests the complete greeting workflow across all components:
 * - agent-config-loader.js
 * - greeting-builder.js
 * - generate-greeting.js
 * - session-context-loader.js
 * - project-status-loader.js
 * 
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

const assert = require('assert');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const TEST_AGENTS = ['qa', 'dev', 'pm'];
const PERFORMANCE_TARGET_MS = 150;

describeIntegration('Unified Greeting System Integration', () => {
  describeIntegration('End-to-End Greeting Generation', () => {
    for (const agentId of TEST_AGENTS) {
      it(`should generate greeting for ${agentId} agent`, async function() {
        this.timeout(5000);
        
        try {
          const { stdout, stderr } = await execPromise(
            `node .aiox-core/development/scripts/generate-greeting.js ${agentId}`,
          );
          
          // Verify output contains expected elements
          assert.ok(stdout.length > 0, 'Greeting should not be empty');
          assert.ok(stdout.includes('ready') || stdout.includes('Ready'), 'Should include ready status');
          
          // Check for stderr warnings (acceptable)
          if (stderr && stderr.includes('[generate-greeting]')) {
            console.log(`  ⚠️ Warning: ${stderr.trim()}`);
          }
          
        } catch (error) {
          assert.fail(`Failed to generate greeting for ${agentId}: ${error.message}`);
        }
      });
    }
  });
  
  describeIntegration('Performance Validation', () => {
    it('should complete within target time', async function() {
      this.timeout(5000);
      
      const startTime = Date.now();
      
      try {
        await execPromise('node .aiox-core/development/scripts/generate-greeting.js qa');
        const duration = Date.now() - startTime;
        
        console.log(`  ⏱️ Generation time: ${duration}ms (target: <${PERFORMANCE_TARGET_MS}ms)`);
        
        if (duration > PERFORMANCE_TARGET_MS) {
          console.log('  ⚠️ Performance degradation detected');
        }
        
        // Soft assertion - log warning but don't fail
        assert.ok(duration < 500, 'Should complete within 500ms hard limit');
        
      } catch (error) {
        assert.fail(`Performance test failed: ${error.message}`);
      }
    });
  });
  
  describeIntegration('Agent Configuration Loading', () => {
    it('should load complete agent definition', async () => {
      const { AgentConfigLoader } = require('../../.aiox-core/development/scripts/agent-config-loader');
      const yaml = require('js-yaml');
      const fs = require('fs');
      
      const coreConfig = yaml.load(
        fs.readFileSync('.aiox-core/core-config.yaml', 'utf8'),
      );
      
      const loader = new AgentConfigLoader('qa');
      const complete = await loader.loadComplete(coreConfig);
      
      // Verify structure
      assert.ok(complete.agent, 'Should have agent object');
      assert.ok(complete.persona_profile, 'Should have persona_profile');
      assert.ok(complete.commands, 'Should have commands array');
      
      // Verify agent properties
      assert.strictEqual(complete.agent.id, 'qa');
      assert.ok(complete.agent.name);
      assert.ok(complete.agent.icon);
      
      // Verify persona_profile
      assert.ok(complete.persona_profile.greeting_levels);
      assert.ok(complete.persona_profile.greeting_levels.minimal);
      assert.ok(complete.persona_profile.greeting_levels.named);
      
      // Verify commands
      assert.ok(Array.isArray(complete.commands));
      assert.ok(complete.commands.length > 0);
    });
  });
  
  describeIntegration('Greeting Builder Integration', () => {
    it('should build greeting with all sections', async () => {
      const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');
      
      const mockAgent = {
        id: 'test',
        name: 'Test Agent',
        icon: '🧪',
        persona_profile: {
          greeting_levels: {
            minimal: '🧪 test ready',
            named: '🧪 Test Agent ready',
          },
        },
        persona: {
          role: 'Test Engineer',
        },
        commands: [
          { name: 'help', description: 'Show help' },
          { name: 'test', description: 'Run tests' },
        ],
      };
      
      const mockContext = {
        sessionType: 'new',
        projectStatus: {
          branch: 'main',
          modifiedFiles: 0,
          recentCommit: 'Initial commit',
        },
      };
      
      const builder = new GreetingBuilder();
      const greeting = await builder.buildGreeting(mockAgent, mockContext);
      
      // Verify greeting structure
      assert.ok(greeting.includes('Test Agent'), 'Should include agent name');
      assert.ok(greeting.includes('Test Engineer'), 'Should include role');
      assert.ok(greeting.includes('*help'), 'Should include commands');
      assert.ok(greeting.includes('main'), 'Should include branch');
    });
  });
  
  describeIntegration('Compact Command Format Normalization', () => {
    it('should normalize compact commands during parsing', async () => {
      const { AgentConfigLoader } = require('../../.aiox-core/development/scripts/agent-config-loader');
      const yaml = require('js-yaml');
      const fs = require('fs');
      
      const coreConfig = yaml.load(
        fs.readFileSync('.aiox-core/core-config.yaml', 'utf8'),
      );
      
      const loader = new AgentConfigLoader('qa');
      const complete = await loader.loadComplete(coreConfig);
      
      // Verify commands are properly parsed
      const commands = complete.commands;
      assert.ok(commands.length > 0, 'Should have commands');
      
      // Check first few commands have name and description
      for (let i = 0; i < Math.min(3, commands.length); i++) {
        const cmd = commands[i];
        assert.ok(cmd.name, `Command ${i} should have name`);
        assert.ok(cmd.description, `Command ${i} should have description`);
        assert.strictEqual(typeof cmd.name, 'string');
        assert.strictEqual(typeof cmd.description, 'string');
      }
    });
  });
  
  describeIntegration('Error Recovery', () => {
    it('should provide fallback greeting on failure', async function() {
      this.timeout(5000);
      
      try {
        const { stdout } = await execPromise(
          'node .aiox-core/development/scripts/generate-greeting.js nonexistent-agent 2>&1',
        );
        
        // Should still produce output (fallback)
        assert.ok(stdout.includes('ready'), 'Should provide fallback greeting');
        
      } catch (error) {
        // Even on error, should have output
        assert.ok(
          error.stdout && error.stdout.includes('ready'),
          'Should provide fallback even on error',
        );
      }
    });
  });
});

// Run tests if called directly
if (require.main === module) {
  console.log('Running Greeting System Integration Tests...\n');
  console.log('This requires the full AIOX environment.\n');
  
  const tests = [
    {
      name: 'Generate greeting for QA agent',
      fn: async () => {
        const { stdout } = await execPromise('node .aiox-core/development/scripts/generate-greeting.js qa 2>&1');
        return stdout.includes('Quinn') || stdout.includes('ready');
      },
    },
    {
      name: 'Generate greeting for Dev agent',
      fn: async () => {
        const { stdout } = await execPromise('node .aiox-core/development/scripts/generate-greeting.js dev 2>&1');
        return stdout.includes('Dex') || stdout.includes('ready');
      },
    },
    {
      name: 'Performance within limits',
      fn: async () => {
        const start = Date.now();
        await execPromise('node .aiox-core/development/scripts/generate-greeting.js qa 2>&1');
        const duration = Date.now() - start;
        console.log(`    ⏱️ Duration: ${duration}ms`);
        return duration < 500;
      },
    },
  ];
  
  let passed = 0;
  let failed = 0;
  
  (async () => {
    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          console.log(`✅ ${test.name}`);
          passed++;
        } else {
          console.log(`❌ ${test.name}`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message.split('\n')[0]}`);
        failed++;
      }
    }
    
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  })();
}

