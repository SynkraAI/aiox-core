'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const QUEST_ROOT = path.resolve(__dirname, '../../skills/quest');
const ENGINE = path.join(QUEST_ROOT, 'engine');
const PACKS_DIR = path.join(QUEST_ROOT, 'packs');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readPack(name) {
  const raw = readFile(path.join(PACKS_DIR, name));
  return yaml.load(raw);
}

function extractSection(content, headingPattern) {
  const regex = new RegExp(`^(#{1,6})\\s+${headingPattern}`, 'm');
  const match = content.match(regex);
  if (!match) return null;

  const level = match[1].length;
  const start = match.index + match[0].length;
  const rest = content.slice(start);

  const lines = rest.split('\n');
  let inCodeBlock = false;
  let endIndex = rest.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!inCodeBlock && new RegExp(`^#{1,${level}}\\s`).test(line)) {
      endIndex = lines.slice(0, i).join('\n').length;
      break;
    }
  }

  return rest.slice(0, endIndex).trim();
}

// ---------------------------------------------------------------------------
// Pre-load
// ---------------------------------------------------------------------------

let skillMd, bridgeMd, appDevPack, resumptionSection;

beforeAll(() => {
  skillMd = readFile(path.join(QUEST_ROOT, 'SKILL.md'));
  bridgeMd = readFile(path.join(ENGINE, 'forge-bridge.md'));
  appDevPack = readPack('app-development.yaml');
  resumptionSection = extractSection(skillMd, 'RESUMPTION');
});

// ===========================================================================
// Contract 1: forge_phase_map exists and is single source of truth
// ===========================================================================

describe('Reconciliation: forge_phase_map contract', () => {
  test('app-development pack declares forge_phase_map', () => {
    expect(appDevPack.pack.forge_phase_map).toBeDefined();
    expect(typeof appDevPack.pack.forge_phase_map).toBe('object');
  });

  test('forge_phase_map covers all 6 Forge phases (0-5)', () => {
    const map = appDevPack.pack.forge_phase_map;
    for (let i = 0; i <= 5; i++) {
      expect(map[i]).toBeDefined();
      expect(Array.isArray(map[i])).toBe(true);
      expect(map[i].length).toBeGreaterThan(0);
    }
  });

  test('forge_phase_map only contains required items (no condition field)', () => {
    const map = appDevPack.pack.forge_phase_map;
    const allItems = appDevPack.phases;

    // Build lookup of all items by id
    const itemLookup = {};
    for (const [, phase] of Object.entries(allItems)) {
      for (const item of phase.items) {
        itemLookup[item.id] = item;
      }
    }

    // Every item in forge_phase_map must exist and have no condition
    for (const [phaseNum, itemIds] of Object.entries(map)) {
      for (const id of itemIds) {
        const item = itemLookup[id];
        expect(item).toBeDefined();
        expect(item.condition).toBeUndefined();
      }
    }
  });

  test('SKILL.md references pack YAML as single source of truth (no hardcoded fallback)', () => {
    expect(resumptionSection).toBeDefined();

    // Must reference pack YAML as source of truth
    expect(resumptionSection).toMatch(/forge_phase_map/);
    expect(resumptionSection).toMatch(/pack\s*YAML/i);

    // Must NOT have hardcoded PHASE_MAP table
    expect(resumptionSection).not.toMatch(/PHASE_MAP\s*\(app-development\)\s*=/);
  });

  test('forge-bridge.md marks its table as reference copy, not canonical', () => {
    expect(bridgeMd).toMatch(/reference\s+copy/i);
    expect(bridgeMd).toMatch(/pack\s+YAML\s+wins/i);
  });

  test('forge-bridge.md says no fallback when forge_phase_map missing', () => {
    expect(bridgeMd).toMatch(/no\s+hardcoded\s+fallback/i);
  });
});

// ===========================================================================
// Contract 2: Conditional item guard in reconciliation algorithm
// ===========================================================================

describe('Reconciliation: condition_state guard', () => {
  test('SKILL.md algorithm blocks promotion of unresolved items', () => {
    // Must mention condition_state unresolved as a SKIP
    expect(resumptionSection).toMatch(/condition_state\s*==\s*"unresolved"/);
    expect(resumptionSection).toMatch(/SKIP/);
  });

  test('SKILL.md algorithm blocks promotion of not_applicable items', () => {
    expect(resumptionSection).toMatch(/condition_state\s*==\s*"not_applicable"/);
  });

  test('SKILL.md algorithm allows promotion only for absent or applicable condition_state', () => {
    expect(resumptionSection).toMatch(/condition_state\s+in\s+\[absent,\s*"applicable"\]/);
  });
});

// ===========================================================================
// Contract 3: Phase mapping consistency
// ===========================================================================

describe('Reconciliation: phase mapping consistency', () => {
  test('all items in forge_phase_map have required: true in pack', () => {
    const map = appDevPack.pack.forge_phase_map;
    const itemLookup = {};
    for (const [, phase] of Object.entries(appDevPack.phases)) {
      for (const item of phase.items) {
        itemLookup[item.id] = item;
      }
    }

    for (const [, itemIds] of Object.entries(map)) {
      for (const id of itemIds) {
        const item = itemLookup[id];
        expect(item.required).toBe(true);
      }
    }
  });

  test('no item appears in multiple phases of forge_phase_map', () => {
    const map = appDevPack.pack.forge_phase_map;
    const seen = new Set();

    for (const [, itemIds] of Object.entries(map)) {
      for (const id of itemIds) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
  });

  test('forge_phase_map items belong to the correct quest world', () => {
    // Phase 0 items should be in worlds 0-2 (Discovery covers early worlds)
    // Phase 5 items should be in worlds 6-7 (Deploy)
    const map = appDevPack.pack.forge_phase_map;

    const EXPECTED_WORLD_RANGES = {
      0: [1, 2],       // Discovery → worlds 1-2
      1: [2],           // Spec → world 2
      2: [3],           // Stories → world 3
      3: [4],           // Build → world 4
      4: [5],           // Integration → world 5
      5: [6, 7],        // Deploy → worlds 6-7
    };

    for (const [phaseNum, itemIds] of Object.entries(map)) {
      const allowedWorlds = EXPECTED_WORLD_RANGES[phaseNum];
      for (const id of itemIds) {
        const worldNum = parseInt(id.split('.')[0]);
        expect(allowedWorlds).toContain(worldNum);
      }
    }
  });
});

// ===========================================================================
// Contract 4: Reconciliation writes correct fields
// ===========================================================================

describe('Reconciliation: quest-log write contract', () => {
  test('SKILL.md sets checked_by to "forge" on reconciled items', () => {
    expect(resumptionSection).toMatch(/checked_by:\s*"forge"/);
  });

  test('SKILL.md uses phase.completed_at as timestamp', () => {
    expect(resumptionSection).toMatch(/phase\.completed_at/);
  });

  test('SKILL.md recalculates stats after sync', () => {
    expect(resumptionSection).toMatch(/[Rr]ecalculate\s+stats/);
  });

  test('SKILL.md does NOT call checklist check (bypasses Integration Gate)', () => {
    expect(resumptionSection).toMatch(/do\s+NOT\s+call\s+.*check/i);
  });
});

// ===========================================================================
// Contract 5: Partial reconciliation (Phase 3 Build)
// ===========================================================================

describe('Reconciliation: partial phase 3 support', () => {
  test('SKILL.md handles stories_completed > 0 when phase not completed', () => {
    expect(resumptionSection).toMatch(/stories_completed\s*>\s*0/);
  });

  test('SKILL.md reconciles 4.2 on partial build', () => {
    expect(resumptionSection).toMatch(/"4\.2"/);
  });
});

// ===========================================================================
// Contract 6: Project matching
// ===========================================================================

describe('Reconciliation: project matching', () => {
  test('SKILL.md matches by project path or basename', () => {
    expect(resumptionSection).toMatch(/project\.path/);
    expect(resumptionSection).toMatch(/basename/);
  });

  test('SKILL.md skips runs that dont match current pack', () => {
    expect(resumptionSection).toMatch(/skip\s+this\s+run/i);
  });
});
