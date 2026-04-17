#!/usr/bin/env node
// wrap-legacy-workflows.js -- wraps flat legacy workflow yaml under a `workflow:` root
// to satisfy the new workflow-validator (AIOS v2.1 format).
// Idempotent: detects and skips already-wrapped files.

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SQUADS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'squads');

function wrapFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let doc;
  try {
    doc = yaml.load(raw);
  } catch (e) {
    return { file: filePath, status: 'PARSE_ERROR', error: e.message };
  }
  if (!doc || typeof doc !== 'object') return { file: filePath, status: 'EMPTY' };
  if (doc.workflow) return { file: filePath, status: 'SKIPPED' };

  const base = path.basename(filePath, path.extname(filePath));
  const wrapped = {
    workflow: {
      id: doc.id || base,
      name: doc.name || base,
      version: doc.version || '1.0.0',
      description: doc.description || '',
      sequence: doc.steps || doc.sequence || [],
      ...(doc.trigger ? { trigger: doc.trigger } : {}),
    },
  };

  const out = yaml.dump(wrapped, { lineWidth: 120, noRefs: true });
  fs.writeFileSync(filePath, out, 'utf8');
  return { file: filePath, status: 'WRAPPED' };
}

function main() {
  const targets = [];
  const squads = ['executive-team', 'expert-council'];
  for (const s of squads) {
    const dir = path.join(SQUADS_ROOT, s, 'workflows');
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir)
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
      .forEach((f) => targets.push(path.join(dir, f)));
  }

  const report = targets.map(wrapFile);
  console.log('Wrap Legacy Workflows Report');
  console.log('='.repeat(60));
  report.forEach((r) => console.log(JSON.stringify(r)));
}

main();
