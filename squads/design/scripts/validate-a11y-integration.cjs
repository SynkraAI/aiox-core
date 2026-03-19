#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '../../..');

const requiredPaths = [
  'docs/design-system/accessibility/manifest.json',
  'docs/design-system/accessibility/sources/wcag-22-criteria.pt-BR.md',
  'docs/design-system/accessibility/checklists/wcag-22-master-checklist.md',
  'scripts/accessibility/generate_wcag_checklist.cjs',
  'scripts/accessibility/validate_a11y_checklists.cjs',
  'squads/design/checklists/ds-accessibility-wcag-checklist.md',
  'squads/design/checklists/ds-a11y-release-gate-checklist.md',
  'squads/design/tasks/ds-govern-a11y-compliance.md',
];

let failed = false;
for (const rel of requiredPaths) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error(`FAIL missing file: ${rel}`);
    failed = true;
  }
}

if (failed) process.exit(1);

const cmd = spawnSync('npm', ['run', 'validate:a11y-checklists'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (cmd.status !== 0) {
  process.exit(cmd.status || 1);
}

console.log('PASS design squad accessibility integration');
