/**
 * STORY-2.11: Global Config Manager Unit Tests
 * Tests for MCP global configuration management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock fs and os modules
jest.mock('fs');
jest.mock('os');

const {
  DEFAULT_CONFIG,
  SERVER_TEMPLATES,
  globalDirExists,
  globalMcpDirExists,
  globalConfigExists,
  createGlobalStructure,
  createGlobalConfig,
  readGlobalConfig,
  writeGlobalConfig,
  addServer,
  removeServer,
  setServerEnabled,
  listServers,
  getAvailableTemplates,
  getServerTemplate,
} = require('../../../.aiox-core/core/mcp/global-config-manager');

describe('Global Config Manager', () => {
  const mockHomeDir = '/mock/home';
  const mockAioxDir = path.join(mockHomeDir, '.aiox');
  const mockMcpDir = path.join(mockAioxDir, 'mcp');
  const mockConfigPath = path.join(mockMcpDir, 'global-config.json');

  beforeEach(() => {
    jest.clearAllMocks();
    os.homedir.mockReturnValue(mockHomeDir);
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have correct default structure', () => {
      expect(DEFAULT_CONFIG).toHaveProperty('version', '1.0');
      expect(DEFAULT_CONFIG).toHaveProperty('servers');
      expect(DEFAULT_CONFIG).toHaveProperty('defaults');
      expect(DEFAULT_CONFIG.defaults).toHaveProperty('timeout', 30000);
      expect(DEFAULT_CONFIG.defaults).toHaveProperty('retries', 3);
    });
  });

  describe('SERVER_TEMPLATES', () => {
    it('should have context7 template', () => {
      expect(SERVER_TEMPLATES.context7).toBeDefined();
      expect(SERVER_TEMPLATES.context7.type).toBe('sse');
      expect(SERVER_TEMPLATES.context7.url).toContain('context7');
    });

    it('should have exa template', () => {
      expect(SERVER_TEMPLATES.exa).toBeDefined();
      expect(SERVER_TEMPLATES.exa.command).toBe('npx');
    });

    it('should have github template', () => {
      expect(SERVER_TEMPLATES.github).toBeDefined();
      expect(SERVER_TEMPLATES.github.command).toBe('npx');
    });
  });

  describe('globalDirExists', () => {
    it('should return true when directory exists', () => {
      fs.existsSync.mockReturnValue(true);
      expect(globalDirExists()).toBe(true);
    });

    it('should return false when directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      expect(globalDirExists()).toBe(false);
    });
  });

  describe('globalConfigExists', () => {
    it('should check config file path', () => {
      fs.existsSync.mockReturnValue(true);
      globalConfigExists();
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('global-config.json'));
    });
  });

  describe('createGlobalStructure', () => {
    it('should create all required directories', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);
      fs.writeFileSync.mockReturnValue(undefined);

      const result = createGlobalStructure();

      expect(result.success).toBe(true);
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('should skip existing directories', () => {
      fs.existsSync.mockReturnValue(true);

      const result = createGlobalStructure();

      expect(result.created.length).toBe(0);
      expect(result.success).toBe(true);
    });

    it('should handle mkdir errors gracefully', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = createGlobalStructure();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('createGlobalConfig', () => {
    it('should create config with default structure', () => {
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockReturnValue(undefined);

      const result = createGlobalConfig();

      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"version"'),
        'utf8',
      );
    });

    it('should include initial servers when provided', () => {
      fs.existsSync.mockReturnValue(false);
      fs.writeFileSync.mockReturnValue(undefined);

      const initialServers = { test: { type: 'sse', url: 'http://test' } };
      createGlobalConfig(initialServers);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('test'),
        'utf8',
      );
    });

    it('should not overwrite existing config', () => {
      fs.existsSync.mockReturnValue(true);

      const result = createGlobalConfig();

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('readGlobalConfig', () => {
    it('should return config object when file exists', () => {
      const mockConfig = { version: '1.0', servers: {} };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = readGlobalConfig();

      expect(result).toEqual(mockConfig);
    });

    it('should return null when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const result = readGlobalConfig();

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const result = readGlobalConfig();

      expect(result).toBeNull();
    });
  });

  describe('writeGlobalConfig', () => {
    it('should write config to file', () => {
      fs.writeFileSync.mockReturnValue(undefined);

      const config = { version: '1.0', servers: {} };
      const result = writeGlobalConfig(config);

      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle write errors', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const result = writeGlobalConfig({ version: '1.0' });

      expect(result.success).toBe(false);
    });
  });

  describe('addServer', () => {
    const mockConfig = { version: '1.0', servers: {} };

    beforeEach(() => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
      fs.writeFileSync.mockReturnValue(undefined);
    });

    it('should add server from template', () => {
      const result = addServer('context7');

      expect(result.success).toBe(true);
      expect(result.server).toBe('context7');
    });

    it('should add server with custom config', () => {
      const customConfig = { type: 'sse', url: 'http://custom.com' };
      const result = addServer('custom', customConfig);

      expect(result.success).toBe(true);
      expect(result.server).toBe('custom');
    });

    it('should fail without global config', () => {
      fs.existsSync.mockReturnValue(false);

      const result = addServer('test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail for unknown server without config', () => {
      const result = addServer('unknown-server');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No template');
    });

    it('should fail for duplicate server', () => {
      const configWithServer = { version: '1.0', servers: { existing: {} } };
      fs.readFileSync.mockReturnValue(JSON.stringify(configWithServer));

      const result = addServer('existing', { type: 'sse', url: 'http://test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('removeServer', () => {
    it('should remove existing server', () => {
      const configWithServer = { version: '1.0', servers: { test: { type: 'sse' } } };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(configWithServer));
      fs.writeFileSync.mockReturnValue(undefined);
      fs.unlinkSync.mockReturnValue(undefined);

      const result = removeServer('test');

      expect(result.success).toBe(true);
    });

    it('should fail for non-existent server', () => {
      const config = { version: '1.0', servers: {} };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = removeServer('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('setServerEnabled', () => {
    it('should enable server', () => {
      const config = { version: '1.0', servers: { test: { enabled: false } } };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      fs.writeFileSync.mockReturnValue(undefined);

      const result = setServerEnabled('test', true);

      expect(result.success).toBe(true);
    });

    it('should disable server', () => {
      const config = { version: '1.0', servers: { test: { enabled: true } } };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));
      fs.writeFileSync.mockReturnValue(undefined);

      const result = setServerEnabled('test', false);

      expect(result.success).toBe(true);
    });
  });

  describe('listServers', () => {
    it('should return server list with counts', () => {
      const config = {
        version: '1.0',
        servers: {
          server1: { type: 'sse', url: 'http://test', enabled: true },
          server2: { command: 'npx', enabled: false },
        },
      };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = listServers();

      expect(result.total).toBe(2);
      expect(result.enabled).toBe(1);
      expect(result.servers.length).toBe(2);
    });

    it('should return empty when no config', () => {
      fs.existsSync.mockReturnValue(false);

      const result = listServers();

      expect(result.total).toBe(0);
      expect(result.servers.length).toBe(0);
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return array of template names', () => {
      const templates = getAvailableTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates).toContain('context7');
      expect(templates).toContain('exa');
      expect(templates).toContain('github');
    });
  });

  describe('getServerTemplate', () => {
    it('should return template for known server', () => {
      const template = getServerTemplate('context7');

      expect(template).toBeDefined();
      expect(template.type).toBe('sse');
    });

    it('should return null for unknown server', () => {
      const template = getServerTemplate('unknown');

      expect(template).toBeNull();
    });

    it('should return copy, not reference', () => {
      const template1 = getServerTemplate('context7');
      const template2 = getServerTemplate('context7');

      template1.url = 'modified';
      expect(template2.url).not.toBe('modified');
    });
  });
});
