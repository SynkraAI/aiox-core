// Integration test - requires external services
// Uses describeIntegration from setup.js
/**
 * Integration Tests for Greeting Preference System
 * Tests end-to-end flow: Set preference → Activate agent → Verify greeting
 */

// Mock dependencies before requiring GreetingBuilder
jest.mock('../../.aiox-core/core/session/context-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/git-config-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/project-status-loader', () => ({
  loadProjectStatus: jest.fn(),
  formatStatusDisplay: jest.fn(),
}));

const GreetingPreferenceManager = require('../../.aiox-core/development/scripts/greeting-preference-manager');
const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_PATH = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
const BACKUP_PATH = path.join(process.cwd(), '.aiox-core', 'core-config.yaml.backup');

describeIntegration('Greeting Preference Integration', () => {
  let manager;
  let builder;
  let originalPreference;
  let originalConfig;

  const mockAgent = {
    name: 'Dex',
    id: 'dev',
    icon: '💻',
    persona_profile: {
      archetype: 'Builder',
      greeting_levels: {
        minimal: '💻 dev Agent ready',
        named: '💻 Dex (Builder) ready',
        archetypal: '💻 Dex the Builder ready to innovate!',
      },
    },
  };

  beforeEach(async () => {
    manager = new GreetingPreferenceManager();
    builder = new GreetingBuilder();
    
    // Backup original config
    if (fs.existsSync(CONFIG_PATH)) {
      originalConfig = fs.readFileSync(CONFIG_PATH, 'utf8');
      originalPreference = manager.getPreference();
    } else {
      // Create minimal config for testing
      const testConfig = {
        agentIdentity: {
          greeting: {
            preference: 'auto',
            contextDetection: true,
          },
        },
      };
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      originalPreference = 'auto';
    }
  });

  afterEach(async () => {
    // Restore original config
    if (originalConfig) {
      fs.writeFileSync(CONFIG_PATH, originalConfig, 'utf8');
    } else if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    
    // Clean up backup
    if (fs.existsSync(BACKUP_PATH)) {
      fs.unlinkSync(BACKUP_PATH);
    }
  });

  describeIntegration('End-to-End: Set Preference → Activate Agent', () => {
    test('minimal preference shows minimal greeting', async () => {
      // Set preference
      manager.setPreference('minimal');
      
      // Build greeting
      const greeting = await builder.buildGreeting(mockAgent, {});
      
      // Verify
      expect(greeting).toContain('dev Agent ready');
      expect(greeting).not.toContain('Dex the Builder');
    });

    test('named preference shows named greeting', async () => {
      manager.setPreference('named');
      const greeting = await builder.buildGreeting(mockAgent, {});
      
      expect(greeting).toContain('Dex (Builder) ready');
      expect(greeting).not.toContain('dev Agent ready');
    });

    test('archetypal preference shows archetypal greeting', async () => {
      manager.setPreference('archetypal');
      const greeting = await builder.buildGreeting(mockAgent, {});
      
      expect(greeting).toContain('Dex the Builder ready to innovate!');
    });

    test('auto preference uses session detection', async () => {
      manager.setPreference('auto');
      
      // New session (empty history)
      const greeting = await builder.buildGreeting(mockAgent, { conversationHistory: [] });
      
      // Should use contextual logic (not fixed level)
      expect(greeting).toBeTruthy();
      // May contain session-aware content
    });
  });

  describeIntegration('Preference Change → Immediate Effect', () => {
    test('changing preference updates greeting immediately', async () => {
      // Start with minimal
      manager.setPreference('minimal');
      let greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toContain('dev Agent ready');

      // Change to named
      manager.setPreference('named');
      greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toContain('Dex (Builder) ready');
      expect(greeting).not.toContain('dev Agent ready');
    });

    test('preference persists across GreetingBuilder instances', async () => {
      manager.setPreference('archetypal');
      
      // Create new builder instance
      const newBuilder = new GreetingBuilder();
      const greeting = await newBuilder.buildGreeting(mockAgent, {});
      
      expect(greeting).toContain('Dex the Builder ready to innovate!');
    });
  });

  describeIntegration('Backward Compatibility', () => {
    test('default preference preserves Story 6.1.2.5 behavior', async () => {
      // Ensure preference is auto (default)
      manager.setPreference('auto');
      
      const greeting = await builder.buildGreeting(mockAgent, { conversationHistory: [] });
      
      // Should use contextual logic, not fixed level
      expect(greeting).toBeTruthy();
    });

    test('agents without greeting_levels fall back gracefully', async () => {
      manager.setPreference('minimal');
      
      const agentWithoutLevels = {
        name: 'Test',
        id: 'test',
        icon: '🤖',
      };
      
      const greeting = await builder.buildGreeting(agentWithoutLevels, {});
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('*help');
    });
  });
});

