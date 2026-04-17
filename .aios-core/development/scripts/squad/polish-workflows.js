#!/usr/bin/env node
// polish-workflows.js -- adds workflow.type and minimal handoff_prompts to
// migrated legacy workflows to quiet recommended-field warnings.
// Idempotent.

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SQUADS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'squads');
const TARGETS = ['executive-team', 'expert-council'];

function polish(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let doc;
  try {
    doc = yaml.load(raw);
  } catch (e) {
    return { file: filePath, status: 'PARSE_ERROR' };
  }
  if (!doc?.workflow) return { file: filePath, status: 'NO_WORKFLOW' };

  let changed = false;
  if (!doc.workflow.type) {
    doc.workflow.type = 'sequential';
    changed = true;
  }
  const seq = doc.workflow.sequence || [];
  const agents = [...new Set(seq.map((s) => s.agent).filter(Boolean))];
  if (!doc.workflow.handoff_prompts && agents.length > 1) {
    const hp = {};
    for (let i = 0; i < seq.length - 1; i++) {
      const from = seq[i];
      const to = seq[i + 1];
      if (from.agent && to.agent && from.agent !== to.agent) {
        hp[`${from.agent}_to_${to.agent}`] =
          `Handoff from ${from.agent} to ${to.agent}: pass artifacts from step "${from.id}" as input for "${to.id}".`;
      }
    }
    if (Object.keys(hp).length > 0) {
      doc.workflow.handoff_prompts = hp;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, yaml.dump(doc, { lineWidth: 120, noRefs: true }), 'utf8');
    return { file: filePath, status: 'POLISHED' };
  }
  return { file: filePath, status: 'SKIPPED' };
}

function main() {
  const report = [];
  for (const s of TARGETS) {
    const dir = path.join(SQUADS_ROOT, s, 'workflows');
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir)
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
      .forEach((f) => report.push(polish(path.join(dir, f))));
  }
  console.log('Workflow Polish Report');
  console.log('='.repeat(60));
  report.forEach((r) => console.log(JSON.stringify(r)));
}

main();
