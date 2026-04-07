'use strict';

/**
 * Forge Reconciler — Runtime module for Quest↔Forge auto-reconciliation.
 *
 * Reads Forge state.json files, compares with quest-log.yaml, and promotes
 * items that Forge has completed. Implements the algorithm from SKILL.md Step 2.
 *
 * Single source of truth for phase-to-items mapping: pack YAML `forge_phase_map`.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ---------------------------------------------------------------------------
// Mode-to-pack mapping (from SKILL.md Step 2.2b)
// ---------------------------------------------------------------------------

const MODE_TO_PACK = {
  'FULL_APP': 'app-development',
  'SINGLE_FEATURE': 'app-development',
  'LANDING_PAGE': 'app-development',
  'BUG_FIX': 'app-development',
  'SQUAD_UPGRADE': 'app-development',
  'DESIGN_SYSTEM': 'design-system-forge',
};

// ---------------------------------------------------------------------------
// Core reconciliation function
// ---------------------------------------------------------------------------

/**
 * Reconcile Quest state with Forge state.
 *
 * @param {object} options
 * @param {string} options.projectPath - Absolute path to project root
 * @param {string} options.questLogPath - Path to quest-log.yaml
 * @param {string} options.forgeRunsDir - Path to .aios/forge-runs/
 * @param {string} options.packsDir - Path to skills/quest/packs/
 * @returns {{ synced_count: number, items_synced: string[], run_id: string|null, quest_log: object|null }}
 */
function reconcile(options) {
  const { projectPath, questLogPath, forgeRunsDir, packsDir } = options;

  const result = {
    synced_count: 0,
    items_synced: [],
    run_id: null,
    quest_log: null,
  };

  // 1. Read quest-log
  let questLog;
  try {
    const raw = fs.readFileSync(questLogPath, 'utf8');
    questLog = yaml.load(raw);
  } catch (err) {
    return result; // quest-log unreadable, skip silently
  }

  if (!questLog || !questLog.meta || !questLog.items) {
    return result;
  }

  // 2. Find forge runs
  let stateFiles;
  try {
    if (!fs.existsSync(forgeRunsDir)) {
      return result;
    }
    const runs = fs.readdirSync(forgeRunsDir);
    stateFiles = runs
      .map(run => path.join(forgeRunsDir, run, 'state.json'))
      .filter(f => fs.existsSync(f));
  } catch (err) {
    return result; // directory unreadable, skip silently
  }

  if (stateFiles.length === 0) {
    return result;
  }

  // 3. Load pack and forge_phase_map
  const packId = questLog.meta.pack;
  const packPath = path.join(packsDir, `${packId}.yaml`);
  let pack;
  try {
    const raw = fs.readFileSync(packPath, 'utf8');
    pack = yaml.load(raw);
  } catch (err) {
    return result; // pack unreadable, skip
  }

  const phaseMap = pack && pack.pack && pack.pack.forge_phase_map;
  if (!phaseMap) {
    return result; // no forge_phase_map, skip reconciliation
  }

  // 4. Process each state.json
  for (const stateFile of stateFiles) {
    let state;
    try {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch (err) {
      continue; // corrupted state.json, skip
    }

    // 4a. Match pack
    const statePack = MODE_TO_PACK[state.mode];
    if (statePack !== packId) {
      continue;
    }

    // 4b. Match project
    if (!matchesProject(state, questLog.meta.project_path, projectPath)) {
      continue;
    }

    result.run_id = state.run_id || path.basename(path.dirname(stateFile));

    // 4c. Reconcile completed phases
    if (state.phases) {
      for (const [phaseNum, phaseData] of Object.entries(state.phases)) {
        if (phaseData.status !== 'completed') {
          continue;
        }

        const itemIds = phaseMap[phaseNum];
        if (!itemIds || !Array.isArray(itemIds)) {
          continue;
        }

        for (const itemId of itemIds) {
          const synced = syncItem(
            questLog.items, itemId, phaseData.completed_at
          );
          if (synced) {
            result.synced_count++;
            result.items_synced.push(itemId);
          }
        }
      }

      // 4d. Partial phase 3 reconciliation
      const phase3 = state.phases['3'] || state.phases[3];
      if (phase3 && phase3.status !== 'completed' && phase3.stories_completed > 0) {
        const synced = syncItem(questLog.items, '4.2', null);
        if (synced) {
          result.synced_count++;
          result.items_synced.push('4.2');
        }
      }
    }
  }

  // 5. Recalculate stats if anything changed
  if (result.synced_count > 0) {
    recalculateStats(questLog, pack);
    questLog.meta.last_updated = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    result.quest_log = questLog;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a Forge run matches the current project.
 */
function matchesProject(state, questLogPath, cwd) {
  if (!state.project || !state.project.path) {
    return false;
  }

  const statePath = state.project.path;

  // Exact match
  if (statePath === questLogPath || statePath === cwd) {
    return true;
  }

  // Basename match
  const stateBase = path.basename(statePath);
  const questBase = path.basename(questLogPath || '');
  const cwdBase = path.basename(cwd || '');

  return stateBase === questBase || stateBase === cwdBase;
}

/**
 * Try to sync a single item from pending/detected to done.
 * Returns true if the item was synced.
 */
function syncItem(items, itemId, completedAt) {
  const current = items[itemId];
  if (!current) {
    return false;
  }

  // Guard: never promote unresolved or not_applicable conditional items
  if (current.condition_state === 'unresolved') {
    return false;
  }
  if (current.condition_state === 'not_applicable') {
    return false;
  }

  // Only promote pending or detected items
  if (current.status !== 'pending' && current.status !== 'detected') {
    return false;
  }

  // Additional guard: condition_state must be absent or "applicable"
  if (current.condition_state && current.condition_state !== 'applicable') {
    return false;
  }

  // Promote to done
  const updated = {
    status: 'done',
    completed_at: completedAt || new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    checked_by: 'forge',
  };

  // Preserve condition_state if applicable
  if (current.condition_state === 'applicable') {
    updated.condition_state = 'applicable';
  }

  items[itemId] = updated;
  return true;
}

/**
 * Recalculate quest-log stats from items and pack.
 */
function recalculateStats(questLog, pack) {
  const items = questLog.items;
  const phases = pack.phases;

  // Build XP lookup from pack
  const xpLookup = {};
  for (const [, phase] of Object.entries(phases)) {
    for (const item of phase.items) {
      xpLookup[item.id] = item.xp || 0;
    }
  }

  let totalXp = 0;
  let itemsDone = 0;
  let itemsSkipped = 0;
  let itemsUnused = 0;
  let itemsTotal = 0;

  for (const [id, item] of Object.entries(items)) {
    if (item.status === 'unused') {
      itemsUnused++;
      continue; // unused excluded from total
    }

    itemsTotal++;

    if (item.status === 'done') {
      itemsDone++;
      totalXp += xpLookup[id] || 0;
    } else if (item.status === 'skipped') {
      itemsSkipped++;
    }
  }

  // Achievement bonuses
  if (questLog.achievements && Array.isArray(questLog.achievements)) {
    const achievements = pack.achievements || [];
    for (const unlocked of questLog.achievements) {
      const def = achievements.find(a => a.id === unlocked.id);
      if (def && def.xp_bonus) {
        totalXp += def.xp_bonus;
      }
    }
  }

  // Level from pack
  const levels = pack.levels || {};
  let level = 1;
  let levelName = 'Unknown';
  const sortedLevels = Object.entries(levels)
    .map(([k, v]) => ({ num: parseInt(k), ...v }))
    .sort((a, b) => b.xp - a.xp);

  for (const lvl of sortedLevels) {
    if (totalXp >= lvl.xp) {
      level = lvl.num;
      levelName = lvl.name;
      break;
    }
  }

  questLog.stats = {
    total_xp: totalXp,
    level,
    level_name: levelName,
    streak: questLog.stats ? questLog.stats.streak || 0 : 0,
    items_done: itemsDone,
    items_total: itemsTotal,
    items_skipped: itemsSkipped,
    items_unused: itemsUnused,
    percent: itemsTotal > 0 ? Math.round((itemsDone / itemsTotal) * 100) : 0,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

/**
 * Run reconciliation and optionally write the updated quest-log.
 *
 * Usage: node forge-reconciler.cjs <project-path> [--dry-run] [--packs-dir <path>]
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const projectPath = args.find(a => !a.startsWith('--')) || process.cwd();

  let packsDir = path.resolve(__dirname, '../packs');
  const packsDirIdx = args.indexOf('--packs-dir');
  if (packsDirIdx !== -1 && args[packsDirIdx + 1]) {
    packsDir = path.resolve(args[packsDirIdx + 1]);
  }

  const questLogPath = path.join(projectPath, '.aios', 'quest-log.yaml');
  const forgeRunsDir = path.join(projectPath, '.aios', 'forge-runs');

  if (!fs.existsSync(questLogPath)) {
    console.log('No quest-log.yaml found. Nothing to reconcile.');
    process.exit(0);
  }

  const result = reconcile({
    projectPath,
    questLogPath,
    forgeRunsDir,
    packsDir,
  });

  if (result.synced_count === 0) {
    console.log('No items to reconcile.');
    process.exit(0);
  }

  console.log(`Synced ${result.synced_count} items from Forge run ${result.run_id}:`);
  for (const id of result.items_synced) {
    console.log(`  - ${id}`);
  }

  if (!dryRun && result.quest_log) {
    const output = yaml.dump(result.quest_log, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    });
    fs.writeFileSync(questLogPath, output, 'utf8');
    console.log(`Updated ${questLogPath}`);
  } else if (dryRun) {
    console.log('(dry-run — no files written)');
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  reconcile,
  matchesProject,
  syncItem,
  recalculateStats,
  MODE_TO_PACK,
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
