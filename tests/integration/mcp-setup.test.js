/**
 * STORY-2.11: MCP Setup Integration Tests
 * Tests the complete MCP setup flow including CLI commands
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

describe('MCP Setup Integration', () => {
  const cliIndexPath = path.join(__dirname, '../../.aiox-core/cli/index.js');
  let tempDir;
  let originalHome;

  beforeAll(() => {
    // Create a temporary directory for test isolation
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
    originalHome = os.homedir();
  });

  afterAll(() => {
    // Cleanup temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('CLI Module Loading', () => {
    it('should load mcp command module without errors', () => {
      expect(() => {
        require('../../.aiox-core/cli/commands/mcp');
      }).not.toThrow();
    });

    it('should export createMcpCommand function', () => {
      const mcpModule = require('../../.aiox-core/cli/commands/mcp');
      expect(typeof mcpModule.createMcpCommand).toBe('function');
    });

    it('should load all mcp subcommand modules', () => {
      expect(() => {
        require('../../.aiox-core/cli/commands/mcp/setup');
        require('../../.aiox-core/cli/commands/mcp/link');
        require('../../.aiox-core/cli/commands/mcp/status');
        require('../../.aiox-core/cli/commands/mcp/add');
      }).not.toThrow();
    });
  });

  describe('Core Module Loading', () => {
    it('should load os-detector module', () => {
      const osDetector = require('../../.aiox-core/core/mcp/os-detector');

      expect(osDetector.detectOS).toBeDefined();
      expect(osDetector.isWindows).toBeDefined();
      expect(osDetector.getGlobalAioxDir).toBeDefined();
      expect(osDetector.getGlobalMcpDir).toBeDefined();
    });

    it('should load global-config-manager module', () => {
      const configManager = require('../../.aiox-core/core/mcp/global-config-manager');

      expect(configManager.createGlobalStructure).toBeDefined();
      expect(configManager.createGlobalConfig).toBeDefined();
      expect(configManager.readGlobalConfig).toBeDefined();
      expect(configManager.addServer).toBeDefined();
    });

    it('should load symlink-manager module', () => {
      const symlinkManager = require('../../.aiox-core/core/mcp/symlink-manager');

      expect(symlinkManager.createLink).toBeDefined();
      expect(symlinkManager.removeLink).toBeDefined();
      expect(symlinkManager.checkLinkStatus).toBeDefined();
    });

    it('should load config-migrator module', () => {
      const configMigrator = require('../../.aiox-core/core/mcp/config-migrator');

      expect(configMigrator.detectProjectConfig).toBeDefined();
      expect(configMigrator.analyzeMigration).toBeDefined();
      expect(configMigrator.executeMigration).toBeDefined();
    });

    it('should load mcp index module with all exports', () => {
      const mcp = require('../../.aiox-core/core/mcp');

      // OS Detector exports
      expect(mcp.detectOS).toBeDefined();
      expect(mcp.isWindows).toBeDefined();

      // Config Manager exports
      expect(mcp.createGlobalConfig).toBeDefined();
      expect(mcp.addServer).toBeDefined();

      // Symlink Manager exports
      expect(mcp.createLink).toBeDefined();
      expect(mcp.LINK_STATUS).toBeDefined();

      // Config Migrator exports
      expect(mcp.MIGRATION_OPTION).toBeDefined();
    });
  });

  describe('OS Detection', () => {
    const { detectOS, isWindows, isMacOS, isLinux, getOSInfo } = require('../../.aiox-core/core/mcp/os-detector');

    it('should detect current OS correctly', () => {
      const osType = detectOS();
      const platform = os.platform();

      if (platform === 'win32') {
        expect(osType).toBe('windows');
        expect(isWindows()).toBe(true);
      } else if (platform === 'darwin') {
        expect(osType).toBe('macos');
        expect(isMacOS()).toBe(true);
      } else if (platform === 'linux') {
        expect(osType).toBe('linux');
        expect(isLinux()).toBe(true);
      }
    });

    it('should provide complete OS info', () => {
      const info = getOSInfo();

      expect(info).toHaveProperty('type');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('arch');
      expect(info).toHaveProperty('homeDir');
    });
  });

  describe('Server Templates', () => {
    const { getAvailableTemplates, getServerTemplate, SERVER_TEMPLATES } = require('../../.aiox-core/core/mcp/global-config-manager');

    it('should have standard server templates', () => {
      const templates = getAvailableTemplates();

      expect(templates).toContain('context7');
      expect(templates).toContain('exa');
      expect(templates).toContain('github');
    });

    it('should return valid template for context7', () => {
      const template = getServerTemplate('context7');

      expect(template).toBeDefined();
      expect(template.type).toBe('sse');
      expect(template.url).toContain('context7');
      expect(template.enabled).toBe(true);
    });

    it('should return valid template for exa', () => {
      const template = getServerTemplate('exa');

      expect(template).toBeDefined();
      expect(template.command).toBe('npx');
      expect(template.args).toContain('-y');
      expect(template.env).toHaveProperty('EXA_API_KEY');
    });

    it('should return null for unknown template', () => {
      const template = getServerTemplate('nonexistent-server');
      expect(template).toBeNull();
    });
  });

  describe('Path Generation', () => {
    const {
      getGlobalAioxDir,
      getGlobalMcpDir,
      getGlobalConfigPath,
      getServersDir,
      getCacheDir,
      getCredentialsDir,
    } = require('../../.aiox-core/core/mcp/os-detector');

    it('should generate correct global AIOX directory path', () => {
      const aioxDir = getGlobalAioxDir();

      expect(aioxDir).toContain('.aiox');
      expect(path.isAbsolute(aioxDir)).toBe(true);
    });

    it('should generate correct MCP directory path', () => {
      const mcpDir = getGlobalMcpDir();

      expect(mcpDir).toContain('.aiox');
      expect(mcpDir).toContain('mcp');
    });

    it('should generate correct config file path', () => {
      const configPath = getGlobalConfigPath();

      expect(configPath).toContain('global-config.json');
    });

    it('should generate correct servers directory path', () => {
      const serversDir = getServersDir();

      expect(serversDir).toContain('servers');
    });

    it('should generate correct cache directory path', () => {
      const cacheDir = getCacheDir();

      expect(cacheDir).toContain('cache');
    });

    it('should generate correct credentials directory path', () => {
      const credDir = getCredentialsDir();

      expect(credDir).toContain('credentials');
    });
  });

  describe('Link Status Constants', () => {
    const { LINK_STATUS } = require('../../.aiox-core/core/mcp/symlink-manager');

    it('should have all required status values', () => {
      expect(LINK_STATUS).toHaveProperty('LINKED', 'linked');
      expect(LINK_STATUS).toHaveProperty('NOT_LINKED', 'not_linked');
      expect(LINK_STATUS).toHaveProperty('BROKEN', 'broken');
      expect(LINK_STATUS).toHaveProperty('DIRECTORY', 'directory');
      expect(LINK_STATUS).toHaveProperty('ERROR', 'error');
    });
  });

  describe('Migration Options Constants', () => {
    const { MIGRATION_OPTION } = require('../../.aiox-core/core/mcp/config-migrator');

    it('should have all required migration options', () => {
      expect(MIGRATION_OPTION).toHaveProperty('MIGRATE', 'migrate');
      expect(MIGRATION_OPTION).toHaveProperty('KEEP_PROJECT', 'keep_project');
      expect(MIGRATION_OPTION).toHaveProperty('MERGE', 'merge');
    });
  });

  describe('Default Config Structure', () => {
    const { DEFAULT_CONFIG } = require('../../.aiox-core/core/mcp/global-config-manager');

    it('should have correct version', () => {
      expect(DEFAULT_CONFIG.version).toBe('1.0');
    });

    it('should have servers object', () => {
      expect(DEFAULT_CONFIG.servers).toBeDefined();
      expect(typeof DEFAULT_CONFIG.servers).toBe('object');
    });

    it('should have defaults with timeout and retries', () => {
      expect(DEFAULT_CONFIG.defaults).toBeDefined();
      expect(DEFAULT_CONFIG.defaults.timeout).toBe(30000);
      expect(DEFAULT_CONFIG.defaults.retries).toBe(3);
    });
  });

  describe('CLI Help Output', () => {
    const { createMcpCommand } = require('../../.aiox-core/cli/commands/mcp');

    it('should create command with proper structure', () => {
      const mcpCommand = createMcpCommand();

      expect(mcpCommand.name()).toBe('mcp');
      expect(mcpCommand.description()).toContain('MCP');
    });

    it('should have all subcommands registered', () => {
      const mcpCommand = createMcpCommand();
      const subcommandNames = mcpCommand.commands.map(cmd => cmd.name());

      expect(subcommandNames).toContain('setup');
      expect(subcommandNames).toContain('link');
      expect(subcommandNames).toContain('status');
      expect(subcommandNames).toContain('add');
    });
  });
});

describe('MCP CLI Command Registration', () => {
  it('should have mcp command in main CLI', () => {
    const { createProgram } = require('../../.aiox-core/cli/index');
    const program = createProgram();

    const commandNames = program.commands.map(cmd => cmd.name());
    expect(commandNames).toContain('mcp');
  });

  it('should include mcp in help text', () => {
    const { createProgram } = require('../../.aiox-core/cli/index');
    const program = createProgram();

    const helpInfo = program.helpInformation();
    expect(helpInfo).toContain('mcp');
  });
});
