#!/usr/bin/env node

/**
 * Migrate Skills to Root
 *
 * Moves .aios/skills/ → skills/ at root level.
 * Updates all references and regenerates symlinks.
 *
 * Usage:
 *   node scripts/migrate-skills-to-root.js --dry-run   # Preview changes
 *   node scripts/migrate-skills-to-root.js              # Execute migration
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const OLD_PATH = path.join(ROOT, '.aios', 'skills');
const NEW_PATH = path.join(ROOT, 'skills');

// Colors
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

let stats = { moved: 0, filesUpdated: 0, symlinksFixed: 0, errors: [] };

console.log(c.bold('\n━━━ Skills Migration: .aios/skills/ → skills/ ━━━\n'));
console.log(DRY_RUN ? c.yellow('MODE: DRY RUN (no changes)') : c.red('MODE: LIVE (will modify files)'));
console.log('');

// ── Step 0: Pre-flight checks ──────────────────────────────────

if (!fs.existsSync(OLD_PATH)) {
  console.error(c.red('ERROR: .aios/skills/ not found. Already migrated?'));
  process.exit(1);
}

const TARGET_EXISTS = fs.existsSync(NEW_PATH);

// ── Step 1: Move/Merge the folder ──────────────────────────────

console.log(c.bold('Step 1: Move .aios/skills/ → skills/'));

if (TARGET_EXISTS) {
  console.log(c.yellow('  ⚠ skills/ already exists at root — will MERGE (.aios/skills/ wins conflicts)'));

  // Get all skill dirs from source
  const sourceSkills = fs.readdirSync(OLD_PATH, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  for (const skill of sourceSkills) {
    const src = path.join(OLD_PATH, skill.name);
    const dst = path.join(NEW_PATH, skill.name);

    if (fs.existsSync(dst)) {
      // Conflict — remove old, replace with canonical
      if (DRY_RUN) {
        console.log(c.cyan(`  [dry-run] Would replace: skills/${skill.name} (conflict, .aios version wins)`));
      } else {
        fs.rmSync(dst, { recursive: true });
        fs.renameSync(src, dst);
        console.log(c.green(`  ✓ Replaced: skills/${skill.name}`));
      }
    } else {
      // No conflict — just move
      if (DRY_RUN) {
        console.log(c.cyan(`  [dry-run] Would move: skills/${skill.name}`));
      } else {
        fs.renameSync(src, dst);
        console.log(c.green(`  ✓ Moved: skills/${skill.name}`));
      }
    }
  }

  // Copy non-directory files (README.md, SKILLS-INDEX.md, etc.)
  const sourceFiles = fs.readdirSync(OLD_PATH, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.'));
  for (const file of sourceFiles) {
    const src = path.join(OLD_PATH, file.name);
    const dst = path.join(NEW_PATH, file.name);
    if (DRY_RUN) {
      console.log(c.cyan(`  [dry-run] Would copy: skills/${file.name}`));
    } else {
      fs.copyFileSync(src, dst);
      console.log(c.green(`  ✓ Copied: skills/${file.name}`));
    }
  }

  // Remove the now-empty source directory
  if (!DRY_RUN) {
    fs.rmSync(OLD_PATH, { recursive: true });
    console.log(c.green('  ✓ Removed empty .aios/skills/'));
  }
} else {
  if (DRY_RUN) {
    console.log(c.cyan('  [dry-run] Would move .aios/skills/ → skills/'));
  } else {
    fs.renameSync(OLD_PATH, NEW_PATH);
    console.log(c.green('  ✓ Moved .aios/skills/ → skills/'));
  }
}
stats.moved = 1;

// ── Step 2: Update file references ─────────────────────────────

console.log(c.bold('\nStep 2: Update references in files'));

// Patterns to replace (order matters — longer patterns first)
const REPLACEMENTS = [
  // Relative paths from different depths
  ['../../../../.aios/skills/', '../../../skills/'],
  ['../../../.aios/skills/', '../../skills/'],
  ['../../.aios/skills/', '../skills/'],
  // Absolute-style references
  ['.aios/skills/', 'skills/'],
  // Home-based references
  ['~/aios-core/.aios/skills', '~/aios-core/skills'],
];

// Files to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.git/',
  '.aios/skills-backup',
  'scripts/migrate-skills-to-root.js',
  '.DS_Store',
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some((p) => filePath.includes(p));
}

function walkFiles(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldSkip(fullPath)) continue;

    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const EXTENSIONS = ['.md', '.js', '.json', '.yaml', '.yml', '.py', '.sh', '.ts'];

// Scan directories that contain references
const SCAN_DIRS = [
  path.join(ROOT, '.claude'),
  path.join(ROOT, '.codex'),
  path.join(ROOT, '.gemini'),
  path.join(ROOT, '.aios'),
  path.join(ROOT, '.aios-core'),
  path.join(ROOT, 'scripts'),
  path.join(ROOT, 'tools'),
  path.join(ROOT, 'squads'),
  path.join(ROOT, 'docs'),
  path.join(ROOT, 'skills'),  // The newly moved folder itself
];

const allFiles = [];
for (const dir of SCAN_DIRS) {
  allFiles.push(...walkFiles(dir, EXTENSIONS));
}

for (const filePath of allFiles) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;

    for (const [oldStr, newStr] of REPLACEMENTS) {
      updated = updated.split(oldStr).join(newStr);
    }

    if (updated !== content) {
      const relPath = path.relative(ROOT, filePath);
      const count = (content.length - updated.length !== 0) ? 'updated' : 'no-op';
      if (DRY_RUN) {
        console.log(c.cyan(`  [dry-run] Would update: ${relPath}`));
      } else {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(c.green(`  ✓ ${relPath}`));
      }
      stats.filesUpdated++;
    }
  } catch (err) {
    stats.errors.push(`${filePath}: ${err.message}`);
  }
}

// ── Step 3: Fix symlinks ───────────────────────────────────────

console.log(c.bold('\nStep 3: Regenerate symlinks'));

const SYMLINK_DIRS = [
  path.join(ROOT, '.claude', 'commands', 'AIOS', 'skills'),
  path.join(ROOT, '.codex', 'commands', 'AIOS', 'skills'),
  path.join(ROOT, '.gemini', 'commands', 'AIOS', 'skills'),
];

for (const symlinkDir of SYMLINK_DIRS) {
  if (!fs.existsSync(symlinkDir)) continue;

  const dirRelative = path.relative(ROOT, symlinkDir);
  const entries = fs.readdirSync(symlinkDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(symlinkDir, entry.name);

    if (entry.isSymbolicLink()) {
      const currentTarget = fs.readlinkSync(fullPath);

      if (currentTarget.includes('.aios/skills/')) {
        // Replace .aios/skills/ with skills/ in the relative path
        // Old: ../../../../.aios/skills/foo/SKILL.md
        // New: ../../../skills/foo/SKILL.md  (one less ../ because skills is at root)
        const newTarget = currentTarget
          .replace('../../../../.aios/skills/', '../../../skills/')
          .replace('../../../.aios/skills/', '../../skills/')
          .replace('../../.aios/skills/', '../skills/');

        if (DRY_RUN) {
          console.log(c.cyan(`  [dry-run] ${dirRelative}/${entry.name}`));
          console.log(c.cyan(`    old: ${currentTarget}`));
          console.log(c.cyan(`    new: ${newTarget}`));
        } else {
          fs.unlinkSync(fullPath);
          fs.symlinkSync(newTarget, fullPath);
          console.log(c.green(`  ✓ ${dirRelative}/${entry.name} → ${newTarget}`));
        }
        stats.symlinksFixed++;
      }
    } else if (entry.isDirectory()) {
      // Some skills have subdirectories with symlinks inside
      const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const sub of subEntries) {
        const subPath = path.join(fullPath, sub.name);
        if (sub.isSymbolicLink()) {
          const currentTarget = fs.readlinkSync(subPath);
          if (currentTarget.includes('.aios/skills/')) {
            const newTarget = currentTarget
              .replace('../../../../../.aios/skills/', '../../../../skills/')
              .replace('../../../../.aios/skills/', '../../../skills/')
              .replace('../../../.aios/skills/', '../../skills/');

            if (DRY_RUN) {
              console.log(c.cyan(`  [dry-run] ${dirRelative}/${entry.name}/${sub.name}`));
              console.log(c.cyan(`    old: ${currentTarget}`));
              console.log(c.cyan(`    new: ${newTarget}`));
            } else {
              fs.unlinkSync(subPath);
              fs.symlinkSync(newTarget, subPath);
              console.log(c.green(`  ✓ ${dirRelative}/${entry.name}/${sub.name} → ${newTarget}`));
            }
            stats.symlinksFixed++;
          }
        }
      }
    }
  }
}

// ── Step 4: Update CLAUDE.md references ────────────────────────

console.log(c.bold('\nStep 4: Update CLAUDE.md'));

const CLAUDE_FILES = [
  path.join(ROOT, 'CLAUDE.md'),
  path.join(ROOT, '.claude', 'CLAUDE.md'),
  path.join(ROOT, '.claude', 'rules', 'pt-br-quality.md'),
];

for (const file of CLAUDE_FILES) {
  if (!fs.existsSync(file)) continue;
  try {
    const content = fs.readFileSync(file, 'utf8');
    let updated = content;
    for (const [oldStr, newStr] of REPLACEMENTS) {
      updated = updated.split(oldStr).join(newStr);
    }
    if (updated !== content) {
      const relPath = path.relative(ROOT, file);
      if (DRY_RUN) {
        console.log(c.cyan(`  [dry-run] Would update: ${relPath}`));
      } else {
        fs.writeFileSync(file, updated, 'utf8');
        console.log(c.green(`  ✓ ${relPath}`));
      }
      stats.filesUpdated++;
    }
  } catch (err) {
    stats.errors.push(`${file}: ${err.message}`);
  }
}

// ── Step 5: Verify symlinks work ───────────────────────────────

if (!DRY_RUN) {
  console.log(c.bold('\nStep 5: Verify symlinks'));

  let broken = 0;
  for (const symlinkDir of SYMLINK_DIRS) {
    if (!fs.existsSync(symlinkDir)) continue;
    const entries = fs.readdirSync(symlinkDir);
    for (const entry of entries) {
      const fullPath = path.join(symlinkDir, entry);
      try {
        fs.accessSync(fullPath, fs.constants.R_OK);
      } catch {
        console.log(c.red(`  ✗ BROKEN: ${path.relative(ROOT, fullPath)}`));
        broken++;
      }
    }
  }
  if (broken === 0) {
    console.log(c.green('  ✓ All symlinks valid'));
  } else {
    console.log(c.red(`  ✗ ${broken} broken symlinks found`));
  }
}

// ── Summary ────────────────────────────────────────────────────

console.log(c.bold('\n━━━ Summary ━━━\n'));
console.log(`  Folder moved:     ${stats.moved}`);
console.log(`  Files updated:    ${stats.filesUpdated}`);
console.log(`  Symlinks fixed:   ${stats.symlinksFixed}`);
if (stats.errors.length > 0) {
  console.log(c.red(`  Errors:           ${stats.errors.length}`));
  stats.errors.forEach((e) => console.log(c.red(`    - ${e}`)));
}

if (DRY_RUN) {
  console.log(c.yellow('\nThis was a dry run. Run without --dry-run to execute.\n'));
} else {
  console.log(c.green('\nMigration complete! Restart Claude Code for changes to take effect.\n'));
}
