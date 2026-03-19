#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TASKS_DIR = path.join(ROOT, 'squads/design/tasks');
const CHECKLISTS_DIR = path.join(ROOT, 'squads/design/checklists');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(TASKS_DIR)) fail('Missing squads/design/tasks directory');
  if (!fs.existsSync(CHECKLISTS_DIR)) fail('Missing squads/design/checklists directory');

  const checklistNames = new Set(
    fs.readdirSync(CHECKLISTS_DIR).filter((f) => f.endsWith('.md')),
  );

  const taskFiles = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith('.md'));
  const missingSection = [];
  const missingBindings = [];
  const invalidRefs = [];

  for (const taskFile of taskFiles) {
    const full = path.join(TASKS_DIR, taskFile);
    const content = fs.readFileSync(full, 'utf8');

    const sectionMatch = content.match(
      /## Related Checklists\s*\n([\s\S]*?)(?:\n## |\n---|\n\*Task criada:|\n\*Task:|$)/,
    );

    if (!sectionMatch) {
      missingSection.push(taskFile);
      continue;
    }

    const sectionBody = sectionMatch[1];
    const refs = Array.from(
      sectionBody.matchAll(/`squads\/design\/checklists\/([^`]+\.md)`/g),
    ).map((m) => m[1]);

    if (refs.length === 0) {
      missingBindings.push(taskFile);
      continue;
    }

    for (const ref of refs) {
      if (!checklistNames.has(ref)) {
        invalidRefs.push(`${taskFile} -> ${ref}`);
      }
    }
  }

  if (missingSection.length || missingBindings.length || invalidRefs.length) {
    console.error('ERROR: Task checklist binding validation failed.');
    if (missingSection.length) {
      console.error('Missing `## Related Checklists` section:');
      for (const t of missingSection) console.error(` - ${t}`);
    }
    if (missingBindings.length) {
      console.error('No checklist refs in `## Related Checklists`:');
      for (const t of missingBindings) console.error(` - ${t}`);
    }
    if (invalidRefs.length) {
      console.error('Invalid checklist refs:');
      for (const r of invalidRefs) console.error(` - ${r}`);
    }
    process.exit(1);
  }

  console.log(`PASS: validated checklist bindings for ${taskFiles.length} tasks`);
}

main();
