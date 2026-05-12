/**
 * User Profile Audit Tests - Story ACT-2
 *
 * Validates:
 * - AC1: GreetingPreferenceManager accounts for user_profile (bob forces minimal/named)
 * - AC3: validate-user-profile runs during activation pipeline
 * - AC4: Bob mode restricts command visibility to key-only across agents
 *
 * @story ACT-2 - Audit user_profile Impact Across Agents
 * @epic EPIC-ACT - Unified Agent Activation Pipeline
 */

// Mock fs before requiring any modules
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

jest.mock('js-yaml', () => ({
  load: jest.fn(),
  dump: jest.fn(),
}));

// Mock config-resolver
jest.mock('../../.aiox-core/core/config/config-resolver', () => ({
  resolveConfig: jest.fn(),
}));

// Mock infrastructure/scripts/validate-user-profile
jest.mock('../../.aiox-core/infrastructure/scripts/validate-user-profile', () => ({
  validateUserProfile: jest.fn(),
  loadAndValidateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
  isBobMode: jest.fn(),
  isAdvancedMode: jest.fn(),
  VALID_USER_PROFILES: ['bob', 'advanced'],
  DEFAULT_USER_PROFILE: 'advanced',
}));

// Mock other dependencies
jest.mock('../../.aiox-core/core/session/context-detector', () => {
  return jest.fn().mockImplementation(() => ({
    detectSessionType: jest.fn().mockReturnValue('new'),
  }));
});

jest.mock('../../.aiox-core/infrastructure/scripts/git-config-detector', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue({ configured: true, type: 'github', branch: 'main' }),
  }));
});

jest.mock('../../.aiox-core/development/scripts/workflow-navigator', () => {
  return jest.fn().mockImplementation(() => ({
    getNextSteps: jest.fn().mockReturnValue([]),
    detectWorkflowState: jest.fn().mockReturnValue(null),
  }));
});

jest.mock('../../.aiox-core/infrastructure/scripts/project-status-loader', () => ({
  loadProjectStatus: jest.fn().mockResolvedValue({
    branch: 'main',
    modifiedFiles: [],
    modifiedFilesTotalCount: 0,
    recentCommits: [],
    currentStory: null,
  }),
}));

jest.mock('../../.aiox-core/core/permissions', () => ({
  PermissionMode: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue(undefined),
    getBadge: jest.fn().mockReturnValue(''),
  })),
}));

const fs = require('fs');
const yaml = require('js-yaml');
const { resolveConfig } = require('../../.aiox-core/core/config/config-resolver');
const { validateUserProfile } = require('../../.aiox-core/infrastructure/scripts/validate-user-profile');

// Import modules under test after mocks
const GreetingPreferenceManager = require('../../.aiox-core/development/scripts/greeting-preference-manager');
const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');

jest.setTimeout(30000);

// ============================================================================
// AC1: GreetingPreferenceManager accounts for user_profile
// ============================================================================

describe('AC1: GreetingPreferenceManager bob mode override', () => {
  let manager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new GreetingPreferenceManager();
  });

  it('should force "named" when user_profile is bob and preference is auto', () => {
    const mockConfig = {
      user_profile: 'bob',
      agentIdentity: {
        greeting: {
          preference: 'auto',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference('bob');

    expect(result).toBe('named');
  });

  it('should force "named" when user_profile is bob and preference is archetypal', () => {
    const mockConfig = {
      user_profile: 'bob',
      agentIdentity: {
        greeting: {
          preference: 'archetypal',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference('bob');

    expect(result).toBe('named');
  });

  it('should allow "minimal" when user_profile is bob and preference is minimal', () => {
    const mockConfig = {
      user_profile: 'bob',
      agentIdentity: {
        greeting: {
          preference: 'minimal',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference('bob');

    expect(result).toBe('minimal');
  });

  it('should allow "named" when user_profile is bob and preference is named', () => {
    const mockConfig = {
      user_profile: 'bob',
      agentIdentity: {
        greeting: {
          preference: 'named',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference('bob');

    expect(result).toBe('named');
  });

  it('should NOT restrict preference when user_profile is advanced', () => {
    const mockConfig = {
      user_profile: 'advanced',
      agentIdentity: {
        greeting: {
          preference: 'archetypal',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference('advanced');

    expect(result).toBe('archetypal');
  });

  it('should return auto when advanced and preference is auto', () => {
    const mockConfig = {
      user_profile: 'advanced',
      agentIdentity: {
        greeting: {
          preference: 'auto',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference('advanced');

    expect(result).toBe('auto');
  });

  it('should read user_profile from config when not passed as parameter', () => {
    const mockConfig = {
      user_profile: 'bob',
      agentIdentity: {
        greeting: {
          preference: 'auto',
        },
      },
    };

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue(mockConfig);

    const result = manager.getPreference(); // No param

    expect(result).toBe('named');
  });

  it('should default to auto on config load error regardless of profile param', () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = manager.getPreference('bob');

    expect(result).toBe('auto');
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// AC3: validate-user-profile runs during activation pipeline
// ============================================================================

describe('AC3: validate-user-profile integrated into activation pipeline', () => {
  let builder;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: config returns advanced
    resolveConfig.mockReturnValue({
      config: { user_profile: 'advanced' },
    });

    // Default: validation passes
    validateUserProfile.mockReturnValue({
      valid: true,
      value: 'advanced',
      error: null,
      warning: null,
    });

    // Mock config loading for GreetingBuilder constructor
    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue({
      agentIdentity: { greeting: { preference: 'auto' } },
    });

    builder = new GreetingBuilder();
  });

  it('should call validateUserProfile during loadUserProfile()', () => {
    builder.loadUserProfile();

    expect(validateUserProfile).toHaveBeenCalledWith('advanced');
  });

  it('should use validated value from validateUserProfile', () => {
    resolveConfig.mockReturnValue({
      config: { user_profile: 'BOB' },
    });
    validateUserProfile.mockReturnValue({
      valid: true,
      value: 'bob',
      error: null,
      warning: null,
    });

    const result = builder.loadUserProfile();

    expect(result).toBe('bob');
  });

  it('should fall back to default when validation fails', () => {
    resolveConfig.mockReturnValue({
      config: { user_profile: 'invalid_value' },
    });
    validateUserProfile.mockReturnValue({
      valid: false,
      value: null,
      error: 'Invalid user_profile: "invalid_value"',
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const result = builder.loadUserProfile();

    expect(result).toBe('advanced');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('validation failed'),
    );
    consoleSpy.mockRestore();
  });

  it('should log warning from validation but continue', () => {
    resolveConfig.mockReturnValue({
      config: { user_profile: undefined },
    });

    // loadUserProfile returns default when no user_profile
    const result = builder.loadUserProfile();
    expect(result).toBe('advanced');
  });

  it('should gracefully handle resolveConfig failure', () => {
    resolveConfig.mockImplementation(() => {
      throw new Error('Config resolution failed');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const result = builder.loadUserProfile();

    expect(result).toBe('advanced');
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// AC4: Bob mode restricts command visibility
// ============================================================================

describe('AC4: Bob mode command visibility restrictions', () => {
  let builder;

  const mockAgentDev = {
    id: 'dev',
    name: 'Dex',
    icon: '\uD83D\uDCBB',
    commands: [
      { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show commands' },
      { name: 'develop', visibility: ['full', 'quick'], description: 'Implement story' },
      { name: 'apply-qa-fixes', visibility: ['quick', 'key'], description: 'Apply QA fixes' },
      { name: 'run-tests', visibility: ['quick', 'key'], description: 'Run tests' },
      { name: 'explain', visibility: ['full'], description: 'Explain' },
      { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit' },
    ],
  };

  const mockAgentPm = {
    id: 'pm',
    name: 'Bob',
    icon: '\uD83D\uDCCA',
    commands: [
      { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show commands' },
      { name: 'status', visibility: ['full', 'quick', 'key'], description: 'Project status' },
      { name: 'create-epic', visibility: ['full', 'quick'], description: 'Create epic' },
      { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit' },
    ],
  };

  const mockAgentNoVisibility = {
    id: 'qa',
    name: 'Quinn',
    icon: '\u2705',
    commands: [
      { name: 'help', description: 'Show commands' },
      { name: 'review', description: 'Review code' },
      { name: 'exit', description: 'Exit' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue({
      agentIdentity: { greeting: { preference: 'auto' } },
    });

    builder = new GreetingBuilder();
  });

  it('should return empty commands for bob mode non-PM agents', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentDev, 'new', 'bob');
    expect(commands).toEqual([]);
  });

  it('should return empty commands for bob mode agents without visibility metadata', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentNoVisibility, 'new', 'bob');
    expect(commands).toEqual([]);
  });

  it('should return full commands for PM agent in bob mode', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentPm, 'new', 'bob');
    // PM in bob mode uses normal filtering; 'new' session = 'full' visibility
    expect(commands.length).toBeGreaterThan(0);
  });

  it('should return commands with "full" visibility for advanced mode new session', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentDev, 'new', 'advanced');
    // 'new' session = 'full' visibility filter
    const allHaveFull = commands.every(
      (cmd) => cmd.visibility && cmd.visibility.includes('full'),
    );
    expect(allHaveFull).toBe(true);
    expect(commands.length).toBe(4); // help, develop, explain, exit
  });

  it('should return commands with "quick" visibility for advanced mode existing session', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentDev, 'existing', 'advanced');
    const allHaveQuick = commands.every(
      (cmd) => cmd.visibility && cmd.visibility.includes('quick'),
    );
    expect(allHaveQuick).toBe(true);
    expect(commands.length).toBe(5); // help, develop, apply-qa-fixes, run-tests, exit
  });

  it('should return commands with "key" visibility for advanced mode workflow session', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentDev, 'workflow', 'advanced');
    const allHaveKey = commands.every(
      (cmd) => cmd.visibility && cmd.visibility.includes('key'),
    );
    expect(allHaveKey).toBe(true);
    expect(commands.length).toBe(4); // help, apply-qa-fixes, run-tests, exit
  });

  it('should default userProfile to advanced when not provided', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentDev, 'new');
    // Should behave as advanced
    expect(commands.length).toBeGreaterThan(0);
  });

  it('should fall back to first 12 commands for agents without visibility metadata in advanced mode', () => {
    const commands = builder.filterCommandsByVisibility(mockAgentNoVisibility, 'new', 'advanced');
    // No visibility metadata, falls back to first 12
    expect(commands).toEqual(mockAgentNoVisibility.commands.slice(0, 12));
  });
});

// ============================================================================
// Integration: Bob mode full greeting flow
// ============================================================================

describe('Integration: Bob mode greeting flow', () => {
  let builder;

  const mockAgentDev = {
    id: 'dev',
    name: 'Dex',
    icon: '\uD83D\uDCBB',
    persona_profile: {
      archetype: 'Builder',
      communication: {
        greeting_levels: {
          minimal: '\uD83D\uDCBB dev Agent ready',
          named: "\uD83D\uDCBB Dex (Builder) ready. Let's build something great!",
          archetypal: '\uD83D\uDCBB Dex the Builder ready to innovate!',
        },
        signature_closing: '-- Dex',
      },
    },
    persona: { role: 'Full Stack Developer' },
    commands: [
      { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show commands' },
      { name: 'develop', visibility: ['full', 'quick'], description: 'Implement story' },
      { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit' },
    ],
  };

  const mockAgentPm = {
    id: 'pm',
    name: 'Bob',
    icon: '\uD83D\uDCCA',
    persona_profile: {
      archetype: 'Conductor',
      communication: {
        greeting_levels: {
          minimal: '\uD83D\uDCCA pm Agent ready',
          named: '\uD83D\uDCCA Bob (Conductor) ready.',
          archetypal: '\uD83D\uDCCA Bob the Conductor ready to orchestrate!',
        },
        signature_closing: '-- Bob',
      },
    },
    persona: { role: 'Product Manager' },
    commands: [
      { name: 'help', visibility: ['full', 'quick', 'key'], description: 'Show commands' },
      { name: 'exit', visibility: ['full', 'quick', 'key'], description: 'Exit' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Config: bob mode with auto preference
    fs.readFileSync.mockReturnValue('yaml content');
    yaml.load.mockReturnValue({
      user_profile: 'bob',
      agentIdentity: { greeting: { preference: 'auto' } },
    });

    resolveConfig.mockReturnValue({
      config: { user_profile: 'bob' },
    });

    validateUserProfile.mockReturnValue({
      valid: true,
      value: 'bob',
      error: null,
      warning: null,
    });

    builder = new GreetingBuilder();
  });

  it('should produce named greeting for non-PM agent in bob mode', async () => {
    const greeting = await builder.buildGreeting(mockAgentDev, {});

    // Bob mode forces named preference for non-PM
    expect(greeting).toContain('Dex');
    expect(greeting).toContain('*help');
  });

  it('should use contextual greeting for PM agent in bob mode', async () => {
    const greeting = await builder.buildGreeting(mockAgentPm, {});

    // PM bypasses bob restriction, auto preference used
    // Should get full contextual greeting (not just fixed named)
    expect(greeting).toBeTruthy();
    expect(greeting).toContain('Bob');
  });
});

// ============================================================================
// validate-user-profile standalone tests
// ============================================================================

describe('validate-user-profile standalone', () => {
  // Use unmocked version for these tests
  const actualValidateUserProfile = jest.requireActual(
    '../../.aiox-core/infrastructure/scripts/validate-user-profile',
  ).validateUserProfile;

  it('should validate "bob" as valid', () => {
    const result = actualValidateUserProfile('bob');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('bob');
  });

  it('should validate "advanced" as valid', () => {
    const result = actualValidateUserProfile('advanced');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('advanced');
  });

  it('should normalize case: "BOB" -> "bob"', () => {
    const result = actualValidateUserProfile('BOB');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('bob');
  });

  it('should normalize case: "ADVANCED" -> "advanced"', () => {
    const result = actualValidateUserProfile('ADVANCED');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('advanced');
  });

  it('should reject invalid values', () => {
    const result = actualValidateUserProfile('invalid');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid user_profile');
  });

  it('should handle null with warning and default', () => {
    const result = actualValidateUserProfile(null);
    expect(result.valid).toBe(true);
    expect(result.value).toBe('advanced');
    expect(result.warning).toBeTruthy();
  });

  it('should handle undefined with warning and default', () => {
    const result = actualValidateUserProfile(undefined);
    expect(result.valid).toBe(true);
    expect(result.value).toBe('advanced');
    expect(result.warning).toBeTruthy();
  });

  it('should reject non-string values', () => {
    const result = actualValidateUserProfile(123);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a string');
  });
});
