/**
 * Unit tests for config-migrator module
 *
 * Tests MCP configuration migration from project-level to global,
 * including detection, analysis, merging, execution, and rollback.
 */

const fs = require('fs');
const path = require('path');

// Mock dependencies before require
jest.mock('../../../.aios-core/core/mcp/global-config-manager');
jest.mock('../../../.aios-core/core/mcp/symlink-manager');

const {
  readGlobalConfig,
  writeGlobalConfig,
  globalConfigExists,
  createGlobalStructure,
  createGlobalConfig,
} = require('../../../.aios-core/core/mcp/global-config-manager');

const {
  getProjectMcpPath,
  checkLinkStatus,
  LINK_STATUS,
  createLink,
} = require('../../../.aios-core/core/mcp/symlink-manager');

const {
  MIGRATION_OPTION,
  detectProjectConfig,
  analyzeMigration,
  mergeServers,
  executeMigration,
  restoreFromBackup,
} = require('../../../.aios-core/core/mcp/config-migrator');

describe('config-migrator', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // Default mocks (re-estabelecidos após resetAllMocks)
    getProjectMcpPath.mockReturnValue('/project/.aios-core/tools/mcp');
    checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
    globalConfigExists.mockReturnValue(false);
  });

  // ============================================================
  // MIGRATION_OPTION constants
  // ============================================================
  describe('MIGRATION_OPTION', () => {
    test('has MIGRATE option', () => {
      expect(MIGRATION_OPTION.MIGRATE).toBe('migrate');
    });

    test('has KEEP_PROJECT option', () => {
      expect(MIGRATION_OPTION.KEEP_PROJECT).toBe('keep_project');
    });

    test('has MERGE option', () => {
      expect(MIGRATION_OPTION.MERGE).toBe('merge');
    });
  });

  // ============================================================
  // detectProjectConfig
  // ============================================================
  describe('detectProjectConfig', () => {
    let existsSyncSpy;
    let readFileSyncSpy;

    beforeEach(() => {
      existsSyncSpy = jest.spyOn(fs, 'existsSync');
      readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
    });

    afterEach(() => {
      existsSyncSpy.mockRestore();
      readFileSyncSpy.mockRestore();
    });

    test('returns found:false when no config files exist', () => {
      existsSyncSpy.mockReturnValue(false);

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(false);
      expect(result.path).toBeNull();
      expect(result.config).toBeNull();
      expect(result.serverCount).toBe(0);
    });

    test('detects config at .aios-core/tools/mcp/global-config.json', () => {
      const configPath = path.join('/project', '.aios-core', 'tools', 'mcp', 'global-config.json');
      const config = { servers: { ctx7: { type: 'sse' }, exa: { type: 'stdio' } } };

      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify(config));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(true);
      expect(result.path).toBe(configPath);
      expect(result.serverCount).toBe(2);
      expect(result.config).toEqual(config);
    });

    test('detects config at .claude/mcp.json', () => {
      const configPath = path.join('/project', '.claude', 'mcp.json');
      const config = { servers: { myserver: {} } };

      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify(config));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(true);
      expect(result.path).toBe(configPath);
      expect(result.serverCount).toBe(1);
    });

    test('detects config at root mcp.json', () => {
      const configPath = path.join('/project', 'mcp.json');
      const config = { servers: {} };

      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify(config));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(true);
      expect(result.serverCount).toBe(0);
    });

    test('detects legacy mcpServers format in .claude.json', () => {
      const claudeConfig = path.join('/project', '.claude.json');
      const config = { mcpServers: { legacy: { command: 'node' } } };

      existsSyncSpy.mockImplementation((p) => p === claudeConfig);
      readFileSyncSpy.mockReturnValue(JSON.stringify(config));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(true);
      expect(result.isLegacyFormat).toBe(true);
      expect(result.serverCount).toBe(1);
      expect(result.config.servers).toEqual(config.mcpServers);
    });

    test('ignores .claude.json without mcpServers', () => {
      const claudeConfig = path.join('/project', '.claude.json');
      existsSyncSpy.mockImplementation((p) => p === claudeConfig);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ theme: 'dark' }));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(false);
    });

    test('ignores .claude.json with empty mcpServers', () => {
      const claudeConfig = path.join('/project', '.claude.json');
      existsSyncSpy.mockImplementation((p) => p === claudeConfig);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ mcpServers: {} }));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(false);
    });

    test('skips files with invalid JSON', () => {
      const firstPath = path.join('/project', '.aios-core', 'tools', 'mcp', 'global-config.json');
      const secondPath = path.join('/project', '.aios-core', 'mcp.json');
      const validConfig = { servers: { s1: {} } };

      existsSyncSpy.mockImplementation((p) => p === firstPath || p === secondPath);
      readFileSyncSpy.mockImplementation((p) => {
        if (p === firstPath) return 'not json!!!';
        if (p === secondPath) return JSON.stringify(validConfig);
        throw new Error('not found');
      });

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(true);
      expect(result.path).toBe(secondPath);
    });

    test('counts servers correctly when no servers key', () => {
      const configPath = path.join('/project', 'mcp.json');
      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: '1.0' }));

      const result = detectProjectConfig('/project');
      expect(result.found).toBe(true);
      expect(result.serverCount).toBe(0);
    });

    test('uses process.cwd() as default project root', () => {
      existsSyncSpy.mockReturnValue(false);
      const result = detectProjectConfig();
      expect(result.found).toBe(false);
      // Just verify it doesn't throw
    });
  });

  // ============================================================
  // analyzeMigration
  // ============================================================
  describe('analyzeMigration', () => {
    let existsSyncSpy;
    let readFileSyncSpy;

    beforeEach(() => {
      existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
    });

    afterEach(() => {
      existsSyncSpy.mockRestore();
      readFileSyncSpy.mockRestore();
    });

    test('detects already_linked scenario', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.LINKED });

      const result = analyzeMigration('/project');
      expect(result.scenario).toBe('already_linked');
      expect(result.recommendedOption).toBeNull();
      expect(result.message).toContain('already linked');
    });

    test('detects fresh_install scenario', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);

      const result = analyzeMigration('/project');
      expect(result.scenario).toBe('fresh_install');
      expect(result.recommendedOption).toBe(MIGRATION_OPTION.MIGRATE);
    });

    test('detects link_only scenario (global exists, no project)', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(true);

      const result = analyzeMigration('/project');
      expect(result.scenario).toBe('link_only');
      expect(result.recommendedOption).toBe(MIGRATION_OPTION.MIGRATE);
      expect(result.message).toContain('Global config exists');
    });

    test('detects migrate_to_global scenario (project exists, no global)', () => {
      const configPath = path.join('/project', 'mcp.json');
      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ servers: { s: {} } }));
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);

      const result = analyzeMigration('/project');
      expect(result.scenario).toBe('migrate_to_global');
      expect(result.recommendedOption).toBe(MIGRATION_OPTION.MIGRATE);
      expect(result.message).toContain('1 servers');
    });

    test('detects merge_required scenario (both exist)', () => {
      const configPath = path.join('/project', 'mcp.json');
      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ servers: { a: {}, b: {} } }));
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(true);

      const result = analyzeMigration('/project');
      expect(result.scenario).toBe('merge_required');
      expect(result.recommendedOption).toBe(MIGRATION_OPTION.MERGE);
      expect(result.message).toContain('2 servers');
    });

    test('returns analysis with all expected fields', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);

      const result = analyzeMigration('/project');
      expect(result).toHaveProperty('scenario');
      expect(result).toHaveProperty('recommendedOption');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('projectConfig');
      expect(result).toHaveProperty('hasGlobalConfig');
      expect(result).toHaveProperty('linkStatus');
    });
  });

  // ============================================================
  // mergeServers
  // ============================================================
  describe('mergeServers', () => {
    test('adds new servers from incoming', () => {
      const existing = { server1: { type: 'sse' } };
      const incoming = { server2: { type: 'stdio' } };

      const result = mergeServers(existing, incoming);
      expect(result.servers.server1).toEqual({ type: 'sse' });
      expect(result.servers.server2).toEqual({ type: 'stdio' });
      expect(result.stats.added).toBe(1);
      expect(result.stats.kept).toBe(1);
    });

    test('skips duplicate servers by default', () => {
      const existing = { server1: { type: 'sse', url: 'old' } };
      const incoming = { server1: { type: 'sse', url: 'new' } };

      const result = mergeServers(existing, incoming);
      expect(result.servers.server1.url).toBe('old');
      expect(result.stats.skipped).toBe(1);
      expect(result.stats.conflicts).toHaveLength(1);
      expect(result.stats.conflicts[0]).toEqual({ name: 'server1', action: 'skipped' });
    });

    test('overwrites duplicates when overwrite option is set', () => {
      const existing = { server1: { url: 'old' } };
      const incoming = { server1: { url: 'new' } };

      const result = mergeServers(existing, incoming, { overwrite: true });
      expect(result.servers.server1.url).toBe('new');
      expect(result.stats.conflicts).toHaveLength(1);
      expect(result.stats.conflicts[0]).toEqual({ name: 'server1', action: 'overwritten' });
    });

    test('handles empty existing', () => {
      const result = mergeServers({}, { s1: {}, s2: {} });
      expect(result.stats.kept).toBe(0);
      expect(result.stats.added).toBe(2);
      expect(Object.keys(result.servers)).toHaveLength(2);
    });

    test('handles empty incoming', () => {
      const result = mergeServers({ s1: {} }, {});
      expect(result.stats.kept).toBe(1);
      expect(result.stats.added).toBe(0);
    });

    test('handles both empty', () => {
      const result = mergeServers({}, {});
      expect(result.stats.kept).toBe(0);
      expect(result.stats.added).toBe(0);
      expect(Object.keys(result.servers)).toHaveLength(0);
    });

    test('defaults to empty objects when called with no args', () => {
      const result = mergeServers();
      expect(result.stats.kept).toBe(0);
      expect(result.stats.added).toBe(0);
    });

    test('handles mixed new and duplicate servers', () => {
      const existing = { a: { v: 1 }, b: { v: 2 } };
      const incoming = { b: { v: 3 }, c: { v: 4 } };

      const result = mergeServers(existing, incoming);
      expect(result.stats.kept).toBe(2);
      expect(result.stats.added).toBe(1);
      expect(result.stats.skipped).toBe(1);
      expect(result.servers.a.v).toBe(1);
      expect(result.servers.b.v).toBe(2); // kept original
      expect(result.servers.c.v).toBe(4);
    });

    test('does not mutate original objects', () => {
      const existing = { s1: { url: 'a' } };
      const incoming = { s2: { url: 'b' } };
      const existingCopy = JSON.parse(JSON.stringify(existing));

      mergeServers(existing, incoming);
      expect(existing).toEqual(existingCopy);
    });
  });

  // ============================================================
  // executeMigration
  // ============================================================
  describe('executeMigration', () => {
    let existsSyncSpy;
    let readFileSyncSpy;
    let renameSyncSpy;

    beforeEach(() => {
      existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
      renameSyncSpy = jest.spyOn(fs, 'renameSync').mockImplementation(() => {});
    });

    afterEach(() => {
      existsSyncSpy.mockRestore();
      readFileSyncSpy.mockRestore();
      renameSyncSpy.mockRestore();
    });

    test('returns success for already_linked scenario', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.LINKED });

      const result = executeMigration('/project');
      expect(result.success).toBe(true);
      expect(result.action).toBe('none');
    });

    test('returns success for KEEP_PROJECT option', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });

      const result = executeMigration('/project', MIGRATION_OPTION.KEEP_PROJECT);
      expect(result.success).toBe(true);
      expect(result.action).toBe('none');
      expect(result.message).toContain('Keeping project-level');
    });

    test('creates global structure on fresh install', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);
      createGlobalStructure.mockReturnValue({ success: true });
      createGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });

      const result = executeMigration('/project', MIGRATION_OPTION.MIGRATE);
      expect(createGlobalStructure).toHaveBeenCalled();
      expect(result.results.structureCreated).toBe(true);
    });

    test('creates global config with project servers on migrate', () => {
      const configPath = path.join('/project', 'mcp.json');
      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ servers: { s1: {} } }));
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);
      createGlobalStructure.mockReturnValue({ success: true });
      createGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });

      const result = executeMigration('/project', MIGRATION_OPTION.MIGRATE);
      expect(createGlobalConfig).toHaveBeenCalledWith({ s1: {} });
      expect(result.results.serversMigrated).toBe(1);
    });

    test('merges servers on MERGE option', () => {
      const configPath = path.join('/project', 'mcp.json');
      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ servers: { new: {} } }));
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(true);
      readGlobalConfig.mockReturnValue({ version: '1.0', servers: { existing: {} } });
      writeGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });

      const result = executeMigration('/project', MIGRATION_OPTION.MERGE);
      expect(writeGlobalConfig).toHaveBeenCalled();
      expect(result.results.serversMigrated).toBe(1);
      expect(result.results.mergeStats).toBeDefined();
    });

    test('handles null readGlobalConfig on merge', () => {
      existsSyncSpy.mockReturnValue(false);
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(true);
      readGlobalConfig.mockReturnValue(null);
      writeGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });

      const result = executeMigration('/project', MIGRATION_OPTION.MERGE);
      expect(result.success).toBe(true);
    });

    test('creates symlink after migration', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);
      createGlobalStructure.mockReturnValue({ success: true });
      createGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });

      const result = executeMigration('/project', MIGRATION_OPTION.MIGRATE);
      expect(createLink).toHaveBeenCalledWith('/project', { force: true });
      expect(result.results.linkCreated).toBe(true);
    });

    test('reports errors when structure creation fails', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);
      // Shape real: createGlobalStructure retorna objetos { dir, error }
      createGlobalStructure.mockReturnValue({
        success: false,
        errors: [{ dir: '/global', error: 'disk full' }],
      });
      createGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });

      const result = executeMigration('/project', MIGRATION_OPTION.MIGRATE);
      // NOTA: config-migrator usa .join(', ') em objetos, resultando em [object Object]
      // Isso é um bug no source — os errors deveriam ser mapeados antes do join
      expect(result.results.errors).toContainEqual(expect.stringContaining('Structure creation failed'));
    });

    test('returns failure when config creation fails', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);
      createGlobalStructure.mockReturnValue({ success: true });
      createGlobalConfig.mockReturnValue({ success: false, error: 'permission denied' });

      const result = executeMigration('/project', MIGRATION_OPTION.MIGRATE);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('permission denied'));
    });

    test('returns failure when write fails on merge', () => {
      existsSyncSpy.mockReturnValue(false);
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(true);
      readGlobalConfig.mockReturnValue({ version: '1.0', servers: {} });
      writeGlobalConfig.mockReturnValue({ success: false, error: 'write error' });

      const result = executeMigration('/project', MIGRATION_OPTION.MERGE);
      expect(result.success).toBe(false);
    });

    test('reports errors when link creation fails', () => {
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.NOT_LINKED });
      globalConfigExists.mockReturnValue(false);
      createGlobalStructure.mockReturnValue({ success: true });
      createGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: false, error: 'symlink error' });

      const result = executeMigration('/project', MIGRATION_OPTION.MIGRATE);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('symlink error'));
    });

    test('backs up project directory when DIRECTORY status', () => {
      const configPath = path.join('/project', 'mcp.json');
      const projectMcpPath = '/project/.aios-core/tools/mcp';
      existsSyncSpy.mockImplementation((p) => p === configPath || p === projectMcpPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ servers: {} }));
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.DIRECTORY });
      globalConfigExists.mockReturnValue(true);
      readGlobalConfig.mockReturnValue({ version: '1.0', servers: {} });
      writeGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });
      getProjectMcpPath.mockReturnValue('/project/.aios-core/tools/mcp');

      const result = executeMigration('/project', MIGRATION_OPTION.MERGE);
      expect(renameSyncSpy).toHaveBeenCalledWith(
        '/project/.aios-core/tools/mcp',
        expect.stringContaining('.backup.'),
      );
      expect(result.results.backupPath).toContain('.backup.');
    });

    test('handles backup failure gracefully', () => {
      const configPath = path.join('/project', 'mcp.json');
      existsSyncSpy.mockImplementation((p) => p === configPath);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ servers: {} }));
      checkLinkStatus.mockReturnValue({ status: LINK_STATUS.DIRECTORY });
      globalConfigExists.mockReturnValue(true);
      readGlobalConfig.mockReturnValue({ version: '1.0', servers: {} });
      writeGlobalConfig.mockReturnValue({ success: true });
      createLink.mockReturnValue({ success: true });
      getProjectMcpPath.mockReturnValue('/project/.aios-core/tools/mcp');
      renameSyncSpy.mockImplementation(() => { throw new Error('rename failed'); });

      const result = executeMigration('/project', MIGRATION_OPTION.MERGE);
      expect(result.results.errors).toContainEqual(expect.stringContaining('Backup failed'));
    });

    test('propaga exceções de analyzeMigration (chamado antes do try/catch)', () => {
      // analyzeMigration (linha 184) é chamado ANTES do try/catch (linha 213),
      // então exceções propagam como unhandled. Isso documenta o comportamento
      // atual — idealmente deveria retornar { success: false, errors: [...] }.
      checkLinkStatus.mockImplementation(() => { throw new Error('unexpected'); });

      expect(() => executeMigration('/project')).toThrow('unexpected');
    });
  });

  // ============================================================
  // restoreFromBackup
  // ============================================================
  describe('restoreFromBackup', () => {
    let existsSyncSpy;
    let lstatSyncSpy;
    let unlinkSyncSpy;
    let rmSyncSpy;
    let renameSyncSpy;

    beforeEach(() => {
      existsSyncSpy = jest.spyOn(fs, 'existsSync');
      lstatSyncSpy = jest.spyOn(fs, 'lstatSync');
      unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      rmSyncSpy = jest.spyOn(fs, 'rmSync').mockImplementation(() => {});
      renameSyncSpy = jest.spyOn(fs, 'renameSync').mockImplementation(() => {});
      getProjectMcpPath.mockReturnValue('/project/.aios-core/tools/mcp');
    });

    afterEach(() => {
      existsSyncSpy.mockRestore();
      lstatSyncSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
      rmSyncSpy.mockRestore();
      renameSyncSpy.mockRestore();
    });

    test('returns error when backup not found', () => {
      existsSyncSpy.mockReturnValue(false);

      const result = restoreFromBackup('/backup/path');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Backup not found');
    });

    test('removes existing symlink before restore', () => {
      existsSyncSpy.mockReturnValue(true);
      lstatSyncSpy.mockReturnValue({ isSymbolicLink: () => true });

      const result = restoreFromBackup('/backup/path', '/project');
      expect(unlinkSyncSpy).toHaveBeenCalledWith('/project/.aios-core/tools/mcp');
      expect(renameSyncSpy).toHaveBeenCalledWith('/backup/path', '/project/.aios-core/tools/mcp');
      expect(result.success).toBe(true);
      expect(result.restored).toBe('/project/.aios-core/tools/mcp');
    });

    test('removes existing directory before restore', () => {
      existsSyncSpy.mockReturnValue(true);
      lstatSyncSpy.mockReturnValue({ isSymbolicLink: () => false });

      const result = restoreFromBackup('/backup/path', '/project');
      expect(rmSyncSpy).toHaveBeenCalledWith('/project/.aios-core/tools/mcp', { recursive: true });
      expect(result.success).toBe(true);
    });

    test('restores when no existing path to remove', () => {
      existsSyncSpy.mockImplementation((p) => {
        if (p === '/backup/path') return true;
        return false; // project mcp path doesn't exist
      });

      const result = restoreFromBackup('/backup/path', '/project');
      expect(unlinkSyncSpy).not.toHaveBeenCalled();
      expect(rmSyncSpy).not.toHaveBeenCalled();
      expect(renameSyncSpy).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    test('handles rename error during restore', () => {
      existsSyncSpy.mockReturnValue(true);
      lstatSyncSpy.mockReturnValue({ isSymbolicLink: () => true });
      renameSyncSpy.mockImplementation(() => { throw new Error('permission denied'); });

      const result = restoreFromBackup('/backup/path', '/project');
      expect(result.success).toBe(false);
      expect(result.error).toBe('permission denied');
    });

    test('handles lstat error gracefully', () => {
      existsSyncSpy.mockReturnValue(true);
      lstatSyncSpy.mockImplementation(() => { throw new Error('stat failed'); });

      const result = restoreFromBackup('/backup/path', '/project');
      expect(result.success).toBe(false);
      expect(result.error).toBe('stat failed');
    });
  });
});
