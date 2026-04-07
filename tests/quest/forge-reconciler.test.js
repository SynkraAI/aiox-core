'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

const {
  reconcile,
  matchesProject,
  syncItem,
  recalculateStats,
  MODE_TO_PACK,
} = require('../../skills/quest/engine/forge-reconciler.cjs');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PACKS_DIR = path.resolve(__dirname, '../../skills/quest/packs');

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'quest-reconciler-'));
}

function writeJson(dir, relativePath, data) {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  return fullPath;
}

function writeYaml(dir, relativePath, data) {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, yaml.dump(data, { lineWidth: -1, noRefs: true }));
  return fullPath;
}

function makeQuestLog(projectPath, overrides = {}) {
  return {
    meta: {
      project: 'TestProject',
      project_path: projectPath,
      pack: 'app-development',
      pack_version: '2.2.0',
      hero_name: 'Tester',
      hero_title: '',
      created: '2026-04-06T00:00:00Z',
      last_updated: '2026-04-06T00:00:00Z',
    },
    stats: {
      total_xp: 0,
      level: 1,
      level_name: 'Apprentice Builder',
      streak: 0,
      items_done: 0,
      items_total: 10,
      items_skipped: 0,
      items_unused: 0,
      percent: 0,
    },
    achievements: [],
    integration_results: {},
    items: {
      '1.1': { status: 'pending' },
      '1.2': { status: 'pending', condition_state: 'unresolved' },
      '2.1': { status: 'pending' },
      '2.2': { status: 'detected', detected_at: '2026-04-06T00:00:00Z' },
      '2.3': { status: 'pending', condition_state: 'applicable' },
      '2.7': { status: 'pending' },
      '2.8': { status: 'pending' },
      '3.1': { status: 'pending' },
      '4.2': { status: 'pending' },
      '4.3': { status: 'pending' },
      ...overrides,
    },
  };
}

function makeForgeState(projectPath, overrides = {}) {
  return {
    run_id: 'forge-test-001',
    mode: 'FULL_APP',
    status: 'running',
    project: { name: 'TestProject', path: projectPath },
    phases: {
      0: { status: 'completed', completed_at: '2026-04-06T10:00:00Z' },
      1: { status: 'pending' },
      2: { status: 'pending' },
      3: { status: 'pending', stories_completed: 0 },
      4: { status: 'pending' },
      5: { status: 'pending' },
    },
    ...overrides,
  };
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ===========================================================================
// Unit tests: syncItem
// ===========================================================================

describe('syncItem', () => {
  test('promotes pending item to done', () => {
    const items = { '1.1': { status: 'pending' } };
    const synced = syncItem(items, '1.1', '2026-04-06T10:00:00Z');

    expect(synced).toBe(true);
    expect(items['1.1'].status).toBe('done');
    expect(items['1.1'].checked_by).toBe('forge');
    expect(items['1.1'].completed_at).toBe('2026-04-06T10:00:00Z');
  });

  test('promotes detected item to done', () => {
    const items = { '2.2': { status: 'detected', detected_at: '2026-04-06T00:00:00Z' } };
    const synced = syncItem(items, '2.2', '2026-04-06T10:00:00Z');

    expect(synced).toBe(true);
    expect(items['2.2'].status).toBe('done');
    expect(items['2.2'].detected_at).toBeUndefined();
  });

  test('skips already done item', () => {
    const items = { '1.1': { status: 'done', completed_at: '2026-04-05T00:00:00Z', checked_by: 'scan' } };
    const synced = syncItem(items, '1.1', '2026-04-06T10:00:00Z');

    expect(synced).toBe(false);
    expect(items['1.1'].checked_by).toBe('scan'); // unchanged
  });

  test('blocks unresolved conditional item', () => {
    const items = { '1.2': { status: 'pending', condition_state: 'unresolved' } };
    const synced = syncItem(items, '1.2', '2026-04-06T10:00:00Z');

    expect(synced).toBe(false);
    expect(items['1.2'].status).toBe('pending');
  });

  test('blocks not_applicable conditional item', () => {
    const items = { '1.2': { status: 'pending', condition_state: 'not_applicable' } };
    const synced = syncItem(items, '1.2', '2026-04-06T10:00:00Z');

    expect(synced).toBe(false);
  });

  test('allows applicable conditional item', () => {
    const items = { '2.3': { status: 'pending', condition_state: 'applicable' } };
    const synced = syncItem(items, '2.3', '2026-04-06T10:00:00Z');

    expect(synced).toBe(true);
    expect(items['2.3'].status).toBe('done');
    expect(items['2.3'].condition_state).toBe('applicable'); // preserved
  });

  test('skips nonexistent item', () => {
    const items = {};
    const synced = syncItem(items, '99.99', '2026-04-06T10:00:00Z');

    expect(synced).toBe(false);
  });
});

// ===========================================================================
// Unit tests: matchesProject
// ===========================================================================

describe('matchesProject', () => {
  test('matches exact path', () => {
    const state = { project: { path: '/home/user/project' } };
    expect(matchesProject(state, '/home/user/project', '/home/user/project')).toBe(true);
  });

  test('matches basename when full paths differ', () => {
    const state = { project: { path: '/other/path/LEADHUNTER' } };
    expect(matchesProject(state, '/home/user/LEADHUNTER', '/home/user/LEADHUNTER')).toBe(true);
  });

  test('rejects different project', () => {
    const state = { project: { path: '/home/user/other-project' } };
    expect(matchesProject(state, '/home/user/my-project', '/home/user/my-project')).toBe(false);
  });

  test('handles missing project field', () => {
    const state = {};
    expect(matchesProject(state, '/home/user/project', '/home/user/project')).toBe(false);
  });
});

// ===========================================================================
// Integration tests: reconcile
// ===========================================================================

describe('reconcile (integration)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('reconciles items from completed Forge phase 0', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState(tmpDir);

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    // Phase 0 maps to ["1.1"] in app-development forge_phase_map
    expect(result.synced_count).toBe(1);
    expect(result.items_synced).toContain('1.1');
    expect(result.run_id).toBe('forge-test-001');
    expect(result.quest_log).not.toBeNull();
    expect(result.quest_log.items['1.1'].status).toBe('done');
    expect(result.quest_log.items['1.1'].checked_by).toBe('forge');
  });

  test('reconciles multiple phases at once', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState(tmpDir, {
      phases: {
        0: { status: 'completed', completed_at: '2026-04-06T10:00:00Z' },
        1: { status: 'completed', completed_at: '2026-04-06T11:00:00Z' },
        2: { status: 'completed', completed_at: '2026-04-06T12:00:00Z' },
        3: { status: 'pending', stories_completed: 0 },
        4: { status: 'pending' },
        5: { status: 'pending' },
      },
    });

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    // Phase 0: 1.1 | Phase 1: 2.2, 2.7, 2.8 | Phase 2: 3.1
    // Note: 2.3 has condition_state but it's "applicable" in fixture, so it should sync from phase 1
    // But 2.3 is NOT in forge_phase_map (it's conditional), so it won't sync
    expect(result.synced_count).toBeGreaterThanOrEqual(5);
    expect(result.items_synced).toContain('1.1');
    expect(result.items_synced).toContain('2.2');
    expect(result.items_synced).toContain('2.7');
    expect(result.items_synced).toContain('2.8');
    expect(result.items_synced).toContain('3.1');
  });

  test('does NOT reconcile unresolved conditional items', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState(tmpDir);

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    // 1.2 has condition_state: unresolved — must NOT be synced
    expect(result.items_synced).not.toContain('1.2');
    // Verify it's still pending
    if (result.quest_log) {
      expect(result.quest_log.items['1.2'].status).toBe('pending');
    }
  });

  test('skips already done items without re-promoting', () => {
    const questLog = makeQuestLog(tmpDir, {
      '1.1': { status: 'done', completed_at: '2026-04-05T00:00:00Z', checked_by: 'scan' },
    });
    const forgeState = makeForgeState(tmpDir);

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    expect(result.items_synced).not.toContain('1.1');
  });

  test('skips Forge runs from different projects', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState('/completely/different/project');

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    expect(result.synced_count).toBe(0);
  });

  test('skips Forge runs with mismatched mode/pack', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState(tmpDir, { mode: 'DESIGN_SYSTEM' });

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    expect(result.synced_count).toBe(0);
  });

  test('handles partial phase 3 (stories_completed > 0)', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState(tmpDir, {
      phases: {
        0: { status: 'completed', completed_at: '2026-04-06T10:00:00Z' },
        1: { status: 'pending' },
        2: { status: 'pending' },
        3: { status: 'running', stories_completed: 3, stories_total: 12 },
        4: { status: 'pending' },
        5: { status: 'pending' },
      },
    });

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    // Phase 0 reconciles 1.1, partial phase 3 reconciles 4.2
    expect(result.items_synced).toContain('1.1');
    expect(result.items_synced).toContain('4.2');
  });

  test('returns null quest_log when nothing to sync', () => {
    const questLog = makeQuestLog(tmpDir, {
      '1.1': { status: 'done', completed_at: '2026-04-05T00:00:00Z', checked_by: 'forge' },
    });
    const forgeState = makeForgeState(tmpDir);

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    expect(result.quest_log).toBeNull();
  });

  test('recalculates stats after reconciliation', () => {
    const questLog = makeQuestLog(tmpDir);
    const forgeState = makeForgeState(tmpDir);

    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);
    writeJson(tmpDir, '.aios/forge-runs/run-001/state.json', forgeState);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    expect(result.quest_log.stats.items_done).toBeGreaterThan(0);
    expect(result.quest_log.stats.total_xp).toBeGreaterThan(0);
    expect(result.quest_log.stats.percent).toBeGreaterThan(0);
  });

  test('handles missing forge-runs directory gracefully', () => {
    const questLog = makeQuestLog(tmpDir);
    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'), // doesn't exist
      packsDir: PACKS_DIR,
    });

    expect(result.synced_count).toBe(0);
    expect(result.quest_log).toBeNull();
  });

  test('handles corrupted state.json gracefully', () => {
    const questLog = makeQuestLog(tmpDir);
    writeYaml(tmpDir, '.aios/quest-log.yaml', questLog);

    const corruptPath = path.join(tmpDir, '.aios/forge-runs/run-bad/state.json');
    fs.mkdirSync(path.dirname(corruptPath), { recursive: true });
    fs.writeFileSync(corruptPath, '{ invalid json !!!');

    const result = reconcile({
      projectPath: tmpDir,
      questLogPath: path.join(tmpDir, '.aios/quest-log.yaml'),
      forgeRunsDir: path.join(tmpDir, '.aios/forge-runs'),
      packsDir: PACKS_DIR,
    });

    expect(result.synced_count).toBe(0);
  });
});

// ===========================================================================
// recalculateStats
// ===========================================================================

describe('recalculateStats', () => {
  test('calculates XP from done items', () => {
    const pack = yaml.load(
      fs.readFileSync(path.join(PACKS_DIR, 'app-development.yaml'), 'utf8')
    );
    const questLog = {
      items: {
        '1.1': { status: 'done' },  // 30 XP
        '2.1': { status: 'done' },  // 35 XP
        '2.2': { status: 'pending' },
      },
      stats: {},
      achievements: [],
    };

    recalculateStats(questLog, pack);

    expect(questLog.stats.total_xp).toBe(65);
    expect(questLog.stats.items_done).toBe(2);
    expect(questLog.stats.level).toBe(1);
  });

  test('excludes unused items from total', () => {
    const pack = yaml.load(
      fs.readFileSync(path.join(PACKS_DIR, 'app-development.yaml'), 'utf8')
    );
    const questLog = {
      items: {
        '1.1': { status: 'done' },
        '1.2': { status: 'unused' },
        '2.1': { status: 'pending' },
      },
      stats: {},
      achievements: [],
    };

    recalculateStats(questLog, pack);

    expect(questLog.stats.items_unused).toBe(1);
    expect(questLog.stats.items_total).toBe(2); // unused excluded
  });
});
