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

function readEngine(name) {
  return readFile(path.join(ENGINE, name));
}

function readPack(name) {
  const raw = readFile(path.join(PACKS_DIR, name));
  return yaml.load(raw);
}

/**
 * Extract a markdown section by heading level and title pattern.
 * Returns all text from that heading until the next heading of the
 * same or higher level (or EOF). Skips headings inside code blocks.
 */
function extractSection(content, headingPattern) {
  const regex = new RegExp(`^(#{1,6})\\s+${headingPattern}`, 'm');
  const match = content.match(regex);
  if (!match) return null;

  const level = match[1].length;
  const start = match.index + match[0].length;
  const rest = content.slice(start);

  // Find next heading of same or higher level, ignoring code blocks
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
      // Calculate byte offset
      endIndex = lines.slice(0, i).join('\n').length;
      break;
    }
  }

  return rest.slice(0, endIndex).trim();
}

// ---------------------------------------------------------------------------
// Pre-load all source files once
// ---------------------------------------------------------------------------

let skillMd, scannerMd, checklistMd, ceremonyMd, guideMd, xpSystemMd;
let packFiles;

beforeAll(() => {
  skillMd = readFile(path.join(QUEST_ROOT, 'SKILL.md'));
  scannerMd = readEngine('scanner.md');
  checklistMd = readEngine('checklist.md');
  ceremonyMd = readEngine('ceremony.md');
  guideMd = readEngine('guide.md');
  xpSystemMd = readEngine('xp-system.md');

  const packNames = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.yaml'));
  packFiles = packNames.map(name => ({
    name,
    data: readPack(name),
  }));
});

// ===========================================================================
// AC-1: Resumption Contract
// ===========================================================================

describe('AC-1: Resumption Contract', () => {
  let resumptionSection;

  beforeAll(() => {
    resumptionSection = extractSection(skillMd, 'RESUMPTION');
  });

  test('SKILL.md delegates stats to checklist.md §3', () => {
    expect(resumptionSection).toMatch(/checklist\.md.*§3/i);
  });

  test('SKILL.md delegates banner to ceremony.md §7', () => {
    expect(resumptionSection).toMatch(/ceremony\.md.*§7/i);
  });

  test('SKILL.md delegates mission selection to guide.md §2', () => {
    expect(resumptionSection).toMatch(/guide\.md.*§2/i);
  });

  test('SKILL.md delegates mission card to guide.md §3', () => {
    expect(resumptionSection).toMatch(/guide\.md.*§3/i);
  });

  test('ceremony.md §7 does NOT contain next_item logic', () => {
    const section7 = extractSection(ceremonyMd, '7\\..*');
    expect(section7).not.toBeNull();
    expect(section7).not.toMatch(/next_item/);
    // Must explicitly state that mission display is guide.md's job
    expect(section7).toMatch(/guide\.md/i);
  });
});

// ===========================================================================
// AC-2: Prerequisites Gate Contract
// ===========================================================================

describe('AC-2: Prerequisites Gate Contract', () => {
  test('scanner.md defines §6.5.1 Prerequisites Gate', () => {
    expect(scannerMd).toMatch(/6\.5\.1.*Prerequisites/i);
  });

  test('design-system-forge.yaml defines valid prerequisites', () => {
    const dsPack = packFiles.find(p => p.name === 'design-system-forge.yaml');
    expect(dsPack).toBeDefined();

    const prereqs = dsPack.data?.detection?.prerequisites;
    expect(prereqs).toBeDefined();
    expect(Array.isArray(prereqs)).toBe(true);
    expect(prereqs.length).toBeGreaterThan(0);

    // Each prerequisite must have condition + message
    for (const prereq of prereqs) {
      expect(prereq).toHaveProperty('condition');
      expect(prereq).toHaveProperty('message');
      expect(typeof prereq.condition).toBe('string');
      expect(typeof prereq.message).toBe('string');
    }
  });

  test('prerequisites use only valid scanner functions', () => {
    const validFunctions = [
      'has_file', 'has_dir', 'has_file_matching',
      'has_remote', 'has_content', 'file_count', 'inside_path',
    ];
    const functionPattern = /(\w+)\s*\(/g;

    for (const pack of packFiles) {
      const prereqs = pack.data?.detection?.prerequisites;
      if (!prereqs) continue;

      for (const prereq of prereqs) {
        let match;
        while ((match = functionPattern.exec(prereq.condition)) !== null) {
          expect(validFunctions).toContain(match[1]);
        }
      }
    }
  });

  test('scanner.md shows block message when prerequisite fails', () => {
    const section = extractSection(scannerMd, '6\\.5\\.1.*');
    expect(section).not.toBeNull();
    expect(section).toMatch(/BLOCK/i);
  });
});

// ===========================================================================
// AC-3: Expansion Pack Gate Contract
// ===========================================================================

describe('AC-3: Expansion Pack Gate Contract', () => {
  test('expansion packs define parent_pack and parent_item', () => {
    const expansions = packFiles.filter(p => p.data?.pack?.type === 'expansion');
    expect(expansions.length).toBeGreaterThan(0);

    for (const pack of expansions) {
      expect(pack.data.pack).toHaveProperty('parent_pack');
      expect(pack.data.pack).toHaveProperty('parent_item');
      expect(typeof pack.data.pack.parent_pack).toBe('string');
    }
  });

  test('expansion parent_pack references an existing pack', () => {
    const packIds = packFiles.map(p => p.data?.pack?.id).filter(Boolean);
    const expansions = packFiles.filter(p => p.data?.pack?.type === 'expansion');

    for (const pack of expansions) {
      expect(packIds).toContain(pack.data.pack.parent_pack);
    }
  });

  test('scanner.md validates parent_pack identity (meta.pack == parent_pack)', () => {
    const section = extractSection(scannerMd, '6\\.5\\.2.*');
    expect(section).not.toBeNull();
    expect(section).toMatch(/meta\.pack/);
    expect(section).toMatch(/parent_pack/);
    // Must check pack identity, not just item
    expect(section).toMatch(/quest_log_pack\s*!=\s*pack\.parent_pack/);
  });

  test('scanner.md validates parent_item status is done', () => {
    const section = extractSection(scannerMd, '6\\.5\\.2.*');
    expect(section).toMatch(/parent_item/);
    expect(section).toMatch(/status\s*!=\s*"done"/);
  });

  test('SKILL.md considers args.pack in resumption', () => {
    const resumption = extractSection(skillMd, 'RESUMPTION');
    expect(resumption).toMatch(/args\.pack/);
    expect(resumption).toMatch(/--pack/);
  });

  test('checklist.md §3 contains pack mismatch flow', () => {
    // Section 3 should mention mismatch handling
    expect(checklistMd).toMatch(/meta\.pack.*scanner/i);
    expect(checklistMd).toMatch(/mismatch|Mismatch/i);
  });
});

// ===========================================================================
// AC-4: Pack Version Migration Contract
// ===========================================================================

describe('AC-4: Pack Version Migration Contract', () => {
  test('checklist.md §3 incorporates version migration', () => {
    // §3 must reference pack version check as part of read flow
    const section3 = extractSection(checklistMd, '3\\. Read Quest-log');
    expect(section3).not.toBeNull();
    expect(section3).toMatch(/pack.*version/i);
    expect(section3).toMatch(/§3\.5|3\.5/);
  });

  test('§3.5 defines new_items handling', () => {
    const section35 = extractSection(checklistMd, '3\\.5.*');
    expect(section35).not.toBeNull();
    expect(section35).toMatch(/new_items/);
  });

  test('§3.5 defines orphaned_items handling', () => {
    const section35 = extractSection(checklistMd, '3\\.5.*');
    expect(section35).toMatch(/orphaned_items/);
  });

  test('§3.5 requires user confirmation', () => {
    const section35 = extractSection(checklistMd, '3\\.5.*');
    expect(section35).toMatch(/confirm|s\/n|user/i);
  });

  test('§3.5 updates meta.pack_version', () => {
    const section35 = extractSection(checklistMd, '3\\.5.*');
    expect(section35).toMatch(/meta\.pack_version/);
  });

  test('orphaned items rule is consistent with edge cases', () => {
    const section35 = extractSection(checklistMd, '3\\.5.*');
    // §3.5 must state orphaned items are ignored in stats
    expect(section35).toMatch(/ignored.*stats|ignore.*stats/i);
  });
});

// ===========================================================================
// AC-5: XP System Contract
// ===========================================================================

describe('AC-5: XP System Contract', () => {
  test('xp-system.md defines base_item_xp separately from total_xp', () => {
    expect(xpSystemMd).toMatch(/base_item_xp/);
    expect(xpSystemMd).toMatch(/total_xp\s*=\s*base_item_xp/);
  });

  test('total_xp >= N condition uses base_item_xp', () => {
    // The section about total_xp >= N must reference base_item_xp
    const section = extractSection(xpSystemMd, '`total_xp >= N`');
    if (!section) {
      // Try alternate heading format
      expect(xpSystemMd).toMatch(/total_xp\s*>=\s*N.*base_item_xp/s);
    } else {
      expect(section).toMatch(/base_item_xp/);
    }
  });

  test('execution order calculates streak before achievement evaluation', () => {
    const section9 = extractSection(xpSystemMd, '9\\. Execution Order');
    expect(section9).not.toBeNull();

    const streakPos = section9.indexOf('streak');
    const achievementPos = section9.indexOf('achievement');
    expect(streakPos).toBeLessThan(achievementPos);
  });

  test('execution order calculates base_item_xp before achievements', () => {
    const section9 = extractSection(xpSystemMd, '9\\. Execution Order');
    expect(section9).not.toBeNull();

    const basePos = section9.indexOf('base_item_xp');
    const achievementPos = section9.indexOf('achievement');
    expect(basePos).toBeGreaterThan(-1);
    expect(basePos).toBeLessThan(achievementPos);
  });
});

// ===========================================================================
// AC-6: Regression Guards
// ===========================================================================

describe('AC-6: Regression Guards', () => {
  test('ceremony.md §7 must NOT mention next_item', () => {
    const section7 = extractSection(ceremonyMd, '7\\..*');
    expect(section7).not.toBeNull();
    expect(section7).not.toMatch(/next_item/);
  });

  test('scanner.md must NOT reference pack_history', () => {
    expect(scannerMd).not.toMatch(/pack_history/);
  });

  test('expansion gate must validate parent_pack, not just parent_item', () => {
    const section = extractSection(scannerMd, '6\\.5\\.2.*');
    expect(section).not.toBeNull();
    // Must have parent_pack validation BEFORE parent_item
    const packCheck = section.indexOf('parent_pack');
    const itemCheck = section.indexOf('parent_item');
    expect(packCheck).toBeGreaterThan(-1);
    expect(packCheck).toBeLessThan(itemCheck);
  });

  test('SKILL.md resumption must NOT ignore args.pack', () => {
    const resumption = extractSection(skillMd, 'RESUMPTION');
    expect(resumption).toMatch(/args\.pack/);
  });

  test('checklist.md §3 must include version migration call', () => {
    const section3 = extractSection(checklistMd, '3\\. Read Quest-log');
    expect(section3).not.toBeNull();
    expect(section3).toMatch(/version/i);
    expect(section3).toMatch(/§3\.5|3\.5/);
  });
});
