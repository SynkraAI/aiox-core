#!/usr/bin/env node
// validate-all-squads.js -- runs SquadValidator.validate() on every squad folder

'use strict';

const fs = require('fs');
const path = require('path');
const { SquadValidator } = require('./squad-validator');

const SQUADS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'squads');

async function main() {
  const validator = new SquadValidator();
  const dirs = fs
    .readdirSync(SQUADS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const rows = [];
  for (const name of dirs) {
    const squadPath = path.join(SQUADS_ROOT, name);
    try {
      const r = await validator.validate(squadPath);
      rows.push({
        squad: name,
        valid: r.valid,
        errors: r.errors.length,
        warnings: r.warnings.length,
        first_error: r.errors[0]?.message || r.errors[0]?.code || null,
      });
    } catch (e) {
      rows.push({ squad: name, valid: false, errors: 1, warnings: 0, first_error: e.message });
    }
  }

  console.log('Squad Validation Report');
  console.log('='.repeat(60));
  const valid = rows.filter((r) => r.valid).length;
  rows.forEach((r) => {
    const mark = r.valid ? 'OK  ' : 'FAIL';
    const n = r.squad.padEnd(28);
    console.log(`${mark} ${n} err=${r.errors} warn=${r.warnings}${r.first_error ? ' | ' + r.first_error : ''}`);
  });
  console.log('='.repeat(60));
  console.log(`Valid: ${valid}/${rows.length}`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
