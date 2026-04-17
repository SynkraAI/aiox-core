#!/usr/bin/env node
// migrate-task-format.js
//
// Upgrades legacy task markdown files to TASK-FORMAT-SPECIFICATION-V1.
// Parses: Task ID, Orchestrator, Purpose, Inputs (table), Steps, Output.
// Injects a YAML block with the 7 required fields after the H1 title.
// Idempotent: skips files that already contain a `task:` field.
//
// Usage:
//   node migrate-task-format.js [--dry-run] [--squad <name>]
// Defaults to processing all legacy squads listed below.

'use strict';

const fs = require('fs');
const path = require('path');

const SQUADS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'squads');

const LEGACY_SQUADS = [
  'ai-science',
  'customer-ops',
  'design-terapeutico',
  'executive-team',
  'expert-council',
  'growth',
  'health-data',
  'health-tech',
  'innovation',
  'legal',
  'marketing-ops',
  'product-research',
  'sales-ops',
  'therapy',
];

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const FORCE = argv.includes('--force');
const squadArg = argv.indexOf('--squad') >= 0 ? argv[argv.indexOf('--squad') + 1] : null;

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function titleize(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function hasV1Header(content) {
  // Check for any of the required fields in YAML/heading form
  return /^[#*-]*\s*task\s*:/im.test(content) && /^[#*-]*\s*responsavel|respons[aá]vel\s*:/im.test(content);
}

function extractField(content, fieldName) {
  const re = new RegExp(`\\*\\*${fieldName}[:\\*]*\\s*\\**\\s*(.+)`, 'i');
  const m = content.match(re);
  return m ? m[1].trim().replace(/^\*+|\*+$/g, '').trim() : null;
}

function extractPurpose(content) {
  // Rich format: **Purpose:** x
  const rich = extractField(content, 'Purpose');
  if (rich) return rich;
  // Simple format: ## Purpose\n<text>
  const m = content.match(/^##\s+Purpose\s*\n+([\s\S]+?)(?:\n##|\n---|$)/im);
  return m ? m[1].trim().split('\n')[0] : null;
}

function extractOrchestrator(content) {
  const o = extractField(content, 'Orchestrator');
  if (o) return o.replace(/^@/, '');
  return null;
}

function extractInputs(content) {
  // Parse markdown table with | Parameter | Type | Required | Description |
  const tableStart = content.match(/^\|\s*Parameter\s*\|[\s\S]+?(?=\n\n|\n---|\n##|$)/im);
  if (!tableStart) return [];
  const rows = tableStart[0].split('\n').filter((l) => l.startsWith('|'));
  if (rows.length < 3) return [];
  const inputs = [];
  for (let i = 2; i < rows.length; i++) {
    const cols = rows[i].split('|').map((c) => c.trim()).filter((c) => c !== '');
    if (cols.length < 3) continue;
    const [nameRaw, type, required, description] = cols;
    const name = nameRaw.replace(/`/g, '').trim();
    if (!name) continue;
    inputs.push({
      campo: name,
      tipo: (type || 'string').toLowerCase(),
      origem: 'User Input',
      obrigatorio: /yes|sim|true/i.test(required || ''),
      descricao: (description || '').trim(),
    });
  }
  return inputs;
}

function extractSteps(content) {
  // Primary: ### Step N: Title
  const steps = [];
  const regex = /^###\s+Step\s+(\d+)[:.]?\s*(.*)$/gim;
  let match;
  while ((match = regex.exec(content)) !== null) {
    steps.push(match[2].trim() || `Step ${match[1]}`);
  }
  if (steps.length > 0) return steps;
  // Fallback: numbered list under ## Steps (capture until next H2 or EOF)
  const stepSection = content.match(/##\s+Steps?\s*\n([\s\S]+?)(?=\n##\s|\n---\s*\n|$)/);
  if (!stepSection) return [];
  const lines = stepSection[1].split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*\d+\.\s+(.+)/);
    if (m) steps.push(m[1].trim());
  }
  // If no numbered list, try bullet list
  if (steps.length === 0) {
    for (const line of lines) {
      const m = line.match(/^\s*-\s+(.+)/);
      if (m) steps.push(m[1].trim());
    }
  }
  return steps;
}

function buildV1Block(meta) {
  const lines = [];
  lines.push('## Task Definition (AIOS Task Format V1.0)');
  lines.push('');
  lines.push('```yaml');
  lines.push(`task: ${meta.task}`);
  lines.push(`responsavel: ${meta.responsavel}`);
  lines.push(`responsavel_type: ${meta.responsavel_type}`);
  lines.push(`atomic_layer: ${meta.atomic_layer}`);
  lines.push('');
  lines.push('Entrada:');
  if (meta.inputs.length === 0) {
    lines.push('  - campo: context');
    lines.push('    tipo: object');
    lines.push('    origem: User Input');
    lines.push('    obrigatorio: true');
    lines.push('    descricao: Context required for task execution');
  } else {
    for (const i of meta.inputs) {
      lines.push(`  - campo: ${i.campo}`);
      lines.push(`    tipo: ${i.tipo}`);
      lines.push(`    origem: ${i.origem}`);
      lines.push(`    obrigatorio: ${i.obrigatorio}`);
      if (i.descricao) lines.push(`    descricao: ${i.descricao.replace(/"/g, "'")}`);
    }
  }
  lines.push('');
  lines.push('Saida:');
  lines.push('  - campo: report');
  lines.push('    tipo: document');
  lines.push('    destino: File system');
  lines.push('    persistido: true');
  lines.push('  - campo: success');
  lines.push('    tipo: boolean');
  lines.push('    destino: Return value');
  lines.push('    persistido: false');
  lines.push('');
  lines.push('Checklist:');
  if (meta.steps.length === 0) {
    lines.push('  - [ ] Task executed successfully');
    lines.push('  - [ ] Outputs produced as specified');
  } else {
    for (const s of meta.steps) {
      const clean = s.replace(/\*\*/g, '').replace(/^\s*-\s*/, '').trim();
      lines.push(`  - [ ] ${clean}`);
    }
  }
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

function insertAfterH1(content, block) {
  const h1Match = content.match(/^#\s+.+\n/m);
  if (!h1Match) return block + '\n' + content;
  const idx = h1Match.index + h1Match[0].length;
  // Preserve blank line after H1 if present
  const before = content.slice(0, idx);
  const rest = content.slice(idx).replace(/^\n+/, '\n');
  return before + '\n' + block + rest;
}

function stripExistingV1Block(content) {
  // Remove the block "## Task Definition (AIOS Task Format V1.0)" ... ``` ... ```
  return content.replace(
    /##\s+Task Definition \(AIOS Task Format V1\.0\)\s*\n+```yaml[\s\S]+?```\s*\n*/,
    '',
  );
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (hasV1Header(content)) {
    if (!FORCE) return { file: filePath, status: 'SKIPPED', reason: 'already v1' };
    content = stripExistingV1Block(content);
  }

  const base = path.basename(filePath, '.md');
  const taskName = kebabToCamel(base) + '()';
  const responsavel = extractOrchestrator(content) || 'squad-lead';
  const inputs = extractInputs(content);
  const steps = extractSteps(content);
  const purpose = extractPurpose(content);

  const meta = {
    task: taskName,
    responsavel,
    responsavel_type: 'Agente',
    atomic_layer: 'Organism',
    inputs,
    steps,
    purpose,
  };

  const block = buildV1Block(meta);
  const next = insertAfterH1(content, block);

  if (!DRY_RUN) fs.writeFileSync(filePath, next, 'utf8');

  return {
    file: filePath,
    status: DRY_RUN ? 'WOULD_MIGRATE' : 'MIGRATED',
    responsavel,
    inputs: inputs.length,
    steps: steps.length,
  };
}

function main() {
  const targetSquads = squadArg ? [squadArg] : LEGACY_SQUADS;
  const report = [];

  for (const name of targetSquads) {
    const tasksDir = path.join(SQUADS_ROOT, name, 'tasks');
    if (!fs.existsSync(tasksDir)) continue;
    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const full = path.join(tasksDir, f);
      try {
        const r = migrateFile(full);
        report.push({ squad: name, ...r });
      } catch (e) {
        report.push({ squad: name, file: f, status: 'ERROR', error: e.message });
      }
    }
  }

  const migrated = report.filter((r) => r.status === 'MIGRATED' || r.status === 'WOULD_MIGRATE').length;
  const skipped = report.filter((r) => r.status === 'SKIPPED').length;
  const errors = report.filter((r) => r.status === 'ERROR').length;

  console.log(`Task Format Migration -- ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}`);
  console.log('='.repeat(60));
  const bySquad = {};
  for (const r of report) {
    bySquad[r.squad] = bySquad[r.squad] || { migrated: 0, skipped: 0, errors: 0 };
    if (r.status.includes('MIGRATE')) bySquad[r.squad].migrated++;
    else if (r.status === 'SKIPPED') bySquad[r.squad].skipped++;
    else if (r.status === 'ERROR') bySquad[r.squad].errors++;
  }
  for (const [s, v] of Object.entries(bySquad)) {
    console.log(`  ${s.padEnd(24)} migrated=${v.migrated}  skipped=${v.skipped}  errors=${v.errors}`);
  }
  console.log('='.repeat(60));
  console.log(`Total: migrated=${migrated} skipped=${skipped} errors=${errors}`);
}

main();
