/**
 * Unit Tests for Greeting Preference System
 *
 * Test Coverage:
 * - PreferenceManager: getPreference, setPreference, validation
 * - GreetingBuilder: buildFixedLevelGreeting, preference override
 * - All preference values (auto, minimal, named, archetypal)
 * - Error handling and fallbacks
 * - Config backup/restore
 */

const GreetingPreferenceManager = require('../../.aiox-core/development/scripts/greeting-preference-manager');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Mock dependencies for GreetingBuilder
jest.mock('../../.aiox-core/core/session/context-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/git-config-detector');
jest.mock('../../.aiox-core/infrastructure/scripts/project-status-loader', () => ({
  loadProjectStatus: jest.fn(),
  formatStatusDisplay: jest.fn(),
}));

const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');

// Mock fs operations for config file
const CONFIG_PATH = path.join(process.cwd(), '.aiox-core', 'core-config.yaml');
const BACKUP_PATH = path.join(process.cwd(), '.aiox-core', 'core-config.yaml.backup');
const TEST_CONFIG_PATH = path.join(__dirname, '..', 'fixtures', 'test-core-config.yaml');

describe('GreetingPreferenceManager', () => {
  let manager;
  let originalConfig;
  let testConfig;

  beforeEach(() => {
    manager = new GreetingPreferenceManager();
    
    // Backup original config if exists
    if (fs.existsSync(CONFIG_PATH)) {
      originalConfig = fs.readFileSync(CONFIG_PATH, 'utf8');
    }

    // Create test config
    testConfig = {
      agentIdentity: {
        greeting: {
          preference: 'auto',
          contextDetection: true,
          sessionDetection: 'hybrid',
        },
      },
    };
  });

  afterEach(() => {
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

  describe('getPreference', () => {
    test('returns default "auto" if not configured', () => {
      // Config doesn't exist or has no preference
      const preference = manager.getPreference();
      expect(['auto', 'minimal', 'named', 'archetypal']).toContain(preference);
    });

    test('returns configured preference', () => {
      testConfig.agentIdentity.greeting.preference = 'minimal';
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      const preference = manager.getPreference();
      expect(preference).toBe('minimal');
    });

    test('handles missing config file gracefully', () => {
      if (fs.existsSync(CONFIG_PATH)) {
        fs.unlinkSync(CONFIG_PATH);
      }
      
      const preference = manager.getPreference();
      expect(preference).toBe('auto');
    });
  });

  describe('setPreference', () => {
    test('sets valid preference successfully', () => {
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      const result = manager.setPreference('minimal');
      expect(result.success).toBe(true);
      expect(result.preference).toBe('minimal');
      
      // Verify config was updated
      const updatedConfig = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
      expect(updatedConfig.agentIdentity.greeting.preference).toBe('minimal');
    });

    test('throws error for invalid preference', () => {
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      expect(() => manager.setPreference('invalid')).toThrow('Invalid preference');
      expect(() => manager.setPreference('Auto')).toThrow('Invalid preference');
      expect(() => manager.setPreference('')).toThrow('Invalid preference');
    });

    test('accepts all valid preferences', () => {
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      expect(() => manager.setPreference('auto')).not.toThrow();
      expect(() => manager.setPreference('minimal')).not.toThrow();
      expect(() => manager.setPreference('named')).not.toThrow();
      expect(() => manager.setPreference('archetypal')).not.toThrow();
    });

    test('creates backup before modification', () => {
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      manager.setPreference('minimal');
      
      expect(fs.existsSync(BACKUP_PATH)).toBe(true);
      const backupConfig = yaml.load(fs.readFileSync(BACKUP_PATH, 'utf8'));
      expect(backupConfig.agentIdentity.greeting.preference).toBe('auto');
    });

    test('restores backup on YAML error', () => {
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      // Mock yaml.dump to throw error
      const originalDump = yaml.dump;
      yaml.dump = jest.fn(() => {
        throw new Error('YAML error');
      });
      
      expect(() => manager.setPreference('minimal')).toThrow();
      
      // Restore
      yaml.dump = originalDump;
      
      // Config should be restored
      const restoredConfig = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
      expect(restoredConfig.agentIdentity.greeting.preference).toBe('auto');
    });

    test('creates config structure if missing', () => {
      const minimalConfig = {};
      fs.writeFileSync(CONFIG_PATH, yaml.dump(minimalConfig), 'utf8');
      
      manager.setPreference('named');
      
      const updatedConfig = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8'));
      expect(updatedConfig.agentIdentity.greeting.preference).toBe('named');
    });
  });

  describe('getConfig', () => {
    test('returns complete greeting config', () => {
      testConfig.agentIdentity.greeting.preference = 'archetypal';
      testConfig.agentIdentity.greeting.showArchetype = false;
      fs.writeFileSync(CONFIG_PATH, yaml.dump(testConfig), 'utf8');
      
      const config = manager.getConfig();
      expect(config.preference).toBe('archetypal');
      expect(config.showArchetype).toBe(false);
      expect(config.contextDetection).toBe(true);
    });

    test('returns empty object if config missing', () => {
      if (fs.existsSync(CONFIG_PATH)) {
        fs.unlinkSync(CONFIG_PATH);
      }
      
      const config = manager.getConfig();
      expect(config).toEqual({});
    });
  });
});

describe('GreetingBuilder with Preferences', () => {
  let builder;
  let mockAgent;

  beforeEach(() => {
    builder = new GreetingBuilder();
    mockAgent = {
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
  });

  describe('buildFixedLevelGreeting', () => {
    test('builds minimal greeting', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'minimal');
      expect(greeting).toContain('💻 dev Agent ready');
      expect(greeting).toContain('*help');
    });

    test('builds named greeting', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'named');
      expect(greeting).toContain('💻 Dex (Builder) ready');
      expect(greeting).toContain('*help');
    });

    test('builds archetypal greeting', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'archetypal');
      expect(greeting).toContain('💻 Dex the Builder ready to innovate!');
      expect(greeting).toContain('*help');
    });

    test('includes help command hint', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'named');
      expect(greeting).toContain('*help');
    });

    test('falls back to simple greeting if no greeting_levels', () => {
      const agentWithoutLevels = {
        name: 'Test',
        id: 'test',
        icon: '🤖',
      };
      
      const greeting = builder.buildFixedLevelGreeting(agentWithoutLevels, 'minimal');
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('*help');
    });

    test('uses fallback for missing level', () => {
      const agentPartialLevels = {
        name: 'Test',
        id: 'test',
        icon: '🤖',
        persona_profile: {
          greeting_levels: {
            named: '🤖 Test ready',
          },
        },
      };
      
      const greeting = builder.buildFixedLevelGreeting(agentPartialLevels, 'minimal');
      expect(greeting).toContain('test Agent ready');
    });
  });

  describe('buildGreeting with preference override', () => {
    test('uses fixed level when preference set to minimal', async () => {
      // Mock preferenceManager to return 'minimal'
      builder.preferenceManager.getPreference = jest.fn().mockReturnValue('minimal');

      const greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toContain('dev Agent ready');
      expect(greeting).not.toContain('Dex the Builder');
    });

    test('uses fixed level when preference set to named', async () => {
      builder.preferenceManager.getPreference = jest.fn().mockReturnValue('named');

      const greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toContain('Dex (Builder) ready');
    });

    test('uses fixed level when preference set to archetypal', async () => {
      builder.preferenceManager.getPreference = jest.fn().mockReturnValue('archetypal');

      const greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toContain('Dex the Builder ready to innovate!');
    });

    test('uses session detection when preference is "auto"', async () => {
      builder.preferenceManager.getPreference = jest.fn().mockReturnValue('auto');

      const greeting = await builder.buildGreeting(mockAgent, { conversationHistory: [] });
      expect(greeting).toBeTruthy(); // Should use contextual logic
    });

    test('handles preference manager errors gracefully', async () => {
      builder.preferenceManager.getPreference = jest.fn().mockImplementation(() => {
        throw new Error('Config read failed');
      });

      const greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toBeTruthy(); // Should fallback to simple greeting
    });
  });
});

