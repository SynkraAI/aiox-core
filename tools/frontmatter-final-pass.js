#!/usr/bin/env node

/**
 * Frontmatter Final Pass — Fix ALL remaining issues to reach 100/100
 *
 * Fixes:
 * 1. Files with frontmatter but missing name/description fields
 * 2. Files with description: | that resolved to empty/short
 * 3. Memory files without frontmatter
 * 4. Skills with embedded YAML instead of proper frontmatter
 * 5. Adds missing recommended fields (version, category, tags, role, squad)
 *
 * Usage:
 *   node tools/frontmatter-final-pass.js              # Dry run
 *   node tools/frontmatter-final-pass.js --apply       # Apply
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const MEMORY_DIR = path.join(os.homedir(), '.claude', 'projects', '-Users-luizfosc-aios-core', 'memory');
const apply = process.argv.includes('--apply');

let fixCount = 0;
const changes = [];

// ============================================================
// UTILITIES
// ============================================================

function readFrontmatter(content) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) return null;
  const endIdx = trimmed.indexOf('---', 3);
  if (endIdx === -1) return null;
  return {
    raw: trimmed.slice(3, endIdx),
    body: trimmed.slice(endIdx + 3),
    full: trimmed,
  };
}

function getField(fmRaw, field) {
  const match = fmRaw.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
  if (!match) return null;
  const val = match[1].trim().replace(/^["']|["']$/g, '');

  // Handle multiline YAML (description: |)
  if (val === '|' || val === '>') {
    const lines = fmRaw.split('\n');
    const fieldIdx = lines.findIndex(l => l.match(new RegExp(`^${field}:`)));
    if (fieldIdx === -1) return null;
    let multiline = '';
    for (let i = fieldIdx + 1; i < lines.length; i++) {
      if (lines[i].match(/^\S/) || lines[i].trim() === '') {
        if (multiline) break;
        continue;
      }
      multiline += (multiline ? ' ' : '') + lines[i].trim();
    }
    return multiline || null;
  }

  if (val === '') return null;
  return val;
}

function hasField(fmRaw, field) {
  return new RegExp(`^${field}:`, 'm').test(fmRaw);
}

function extractDescFromBody(body, name) {
  // Strategy 1: "You are..."
  const youAre = body.match(/You are (?:the |a )?([^.]{10,150})\./i);
  if (youAre) return youAre[1].trim();

  // Strategy 2: role_tagline
  const tagline = body.match(/role_tagline:\s*["']?([^"'\n]{10,150})/);
  if (tagline) return tagline[1].trim();

  // Strategy 3: First meaningful paragraph after title
  const lines = body.split('\n');
  let pastTitle = false;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('#')) { pastTitle = true; continue; }
    if (!pastTitle) continue;
    if (t === '' || t.startsWith('ACTIVATION') || t.startsWith('CRITICAL') || t.startsWith('```')) continue;
    if (t.startsWith('>')) {
      const cleaned = t.replace(/^>\s*/, '').replace(/[*_`]/g, '');
      if (cleaned.length > 15) return cleaned.slice(0, 150);
      continue;
    }
    if (t.length > 15 && !t.startsWith('|') && !t.startsWith('-')) {
      return t.replace(/[*_`]/g, '').slice(0, 150);
    }
  }

  // Strategy 4: embedded description field
  const embDesc = body.match(/^\s+description:\s*["']?([^"'\n]{15,150})/m);
  if (embDesc) return embDesc[1].trim();

  // Strategy 5: persona section
  const persona = body.match(/##\s*(?:Persona|Identity)[^\n]*\n+([^\n#]{15,200})/i);
  if (persona) return persona[1].replace(/[*_`]/g, '').trim().slice(0, 150);

  return `Agente ${name} do ecossistema AIOS.`;
}

function detectSquadFromPath(filePath) {
  const match = filePath.match(/squads\/([^/]+)\//);
  return match ? match[1] : null;
}

function detectCategory(name, squadName, body) {
  // Check content for clues
  const lower = (name + ' ' + (squadName || '') + ' ' + body.slice(0, 500)).toLowerCase();
  if (lower.includes('content') || lower.includes('conteud') || lower.includes('video') || lower.includes('copy') || lower.includes('story')) return 'content';
  if (lower.includes('brand') || lower.includes('sales') || lower.includes('marketing') || lower.includes('monetiz')) return 'business';
  if (lower.includes('dev') || lower.includes('code') || lower.includes('test') || lower.includes('deploy') || lower.includes('architect')) return 'development';
  if (lower.includes('research') || lower.includes('analys') || lower.includes('diagnos')) return 'research';
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) return 'design';
  return 'general';
}

function detectRole(name, body) {
  const lower = name.toLowerCase();
  if (lower.includes('chief') || lower.includes('orchestrat') || lower.includes('master')) return 'chief';
  if (lower.includes('analyst') || lower.includes('research')) return 'analyst';
  if (lower.includes('creator') || lower.includes('writer')) return 'creator';
  if (lower.includes('reviewer') || lower.includes('audit') || lower.includes('guardian') || lower.includes('validator')) return 'reviewer';
  return 'specialist';
}

// ============================================================
// FIX FUNCTIONS
// ============================================================

function fixFile(filePath, entityType) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const trimmed = content.trimStart();
  const name = path.basename(filePath, '.md');
  const squadName = detectSquadFromPath(filePath);

  // Case 1: No frontmatter at all
  if (!trimmed.startsWith('---')) {
    // For memory files
    if (entityType === 'memory') {
      const typeGuess = name.startsWith('feedback') ? 'feedback'
        : name.startsWith('project') ? 'project'
        : name.startsWith('reference') ? 'reference'
        : name.startsWith('user') ? 'user' : 'reference';

      // Extract first meaningful line as description
      const firstLine = trimmed.split('\n').find(l => l.trim() && !l.startsWith('#'));
      const desc = firstLine ? firstLine.trim().slice(0, 100) : `Memória ${name}`;

      const fm = `---\nname: ${name}\ndescription: "${desc.replace(/"/g, '\\"')}"\ntype: ${typeGuess}\n---\n\n`;
      recordChange(filePath, name, 'Add frontmatter (memory)', fm + content);
      return;
    }

    // For skills with embedded YAML — convert to proper frontmatter
    if (entityType === 'skill') {
      const desc = extractDescFromBody(content, name);
      const fm = `---\nname: ${name}\ndescription: |\n  ${desc}\nversion: 1.0.0\ncategory: ${detectCategory(name, null, content)}\ntags: [${name}]\n---\n\n`;
      recordChange(filePath, name, 'Add frontmatter (skill)', fm + content);
      return;
    }
    return;
  }

  // Case 2: Has frontmatter but needs fixes
  const parsed = readFrontmatter(content);
  if (!parsed) return;

  let fmRaw = parsed.raw;
  let changed = false;
  const fixes = [];

  // Fix missing name
  if (!getField(fmRaw, 'name')) {
    if (hasField(fmRaw, 'name')) {
      // Field exists but empty — replace
      fmRaw = fmRaw.replace(/^name:.*$/m, `name: ${name}`);
    } else {
      fmRaw = `name: ${name}\n${fmRaw}`;
    }
    changed = true;
    fixes.push('+name');
  }

  // Fix missing/short description
  const currentDesc = getField(fmRaw, 'description');
  if (!currentDesc || currentDesc.length < 20) {
    const betterDesc = extractDescFromBody(parsed.body, name);
    const escapedDesc = betterDesc.replace(/"/g, '\\"');
    if (hasField(fmRaw, 'description')) {
      // Replace existing
      fmRaw = fmRaw.replace(/^description:.*$/m, `description: "${escapedDesc}"`);
    } else {
      // Add after name
      fmRaw = fmRaw.replace(/^(name:.*)$/m, `$1\ndescription: "${escapedDesc}"`);
    }
    changed = true;
    fixes.push('+description');
  }

  // Fix missing recommended fields for skills
  if (entityType === 'skill') {
    if (!hasField(fmRaw, 'version')) {
      fmRaw += '\nversion: 1.0.0';
      changed = true;
      fixes.push('+version');
    }
    if (!hasField(fmRaw, 'category')) {
      fmRaw += `\ncategory: ${detectCategory(name, null, parsed.body)}`;
      changed = true;
      fixes.push('+category');
    }
    if (!hasField(fmRaw, 'tags')) {
      fmRaw += `\ntags: [${name}]`;
      changed = true;
      fixes.push('+tags');
    }
  }

  // Fix missing recommended fields for squads
  if (entityType === 'squad') {
    if (!hasField(fmRaw, 'version')) {
      fmRaw += '\nversion: 1.0.0';
      changed = true;
      fixes.push('+version');
    }
    if (!hasField(fmRaw, 'category')) {
      fmRaw += `\ncategory: ${detectCategory(name, name, parsed.body)}`;
      changed = true;
      fixes.push('+category');
    }
  }

  // Fix missing recommended fields for agents
  if (entityType === 'agent') {
    if (!hasField(fmRaw, 'role')) {
      fmRaw += `\nrole: ${detectRole(name, parsed.body)}`;
      changed = true;
      fixes.push('+role');
    }
    if (squadName && !hasField(fmRaw, 'squad')) {
      fmRaw += `\nsquad: ${squadName}`;
      changed = true;
      fixes.push('+squad');
    }
  }

  if (changed) {
    const newContent = `---\n${fmRaw.trim()}\n---${parsed.body}`;
    recordChange(filePath, name, fixes.join(' '), newContent);
  }
}

function recordChange(filePath, name, fixType, newContent) {
  changes.push({
    name,
    path: filePath.replace(os.homedir() + '/', '~/'),
    fixType,
    newContent,
  });
}

// ============================================================
// SCANNERS
// ============================================================

function scanAll() {
  // Skills
  const skillsDir = path.join(AIOS_CORE, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir)) {
      const fp = path.join(skillsDir, name, 'SKILL.md');
      if (fs.existsSync(fp)) fixFile(fp, 'skill');
    }
  }

  // Squads
  const squadsDir = path.join(AIOS_CORE, 'squads');
  if (fs.existsSync(squadsDir)) {
    for (const name of fs.readdirSync(squadsDir)) {
      const fp = path.join(squadsDir, name, 'README.md');
      if (fs.existsSync(fp)) fixFile(fp, 'squad');

      // Squad agents
      const ad = path.join(squadsDir, name, 'agents');
      if (fs.existsSync(ad) && fs.statSync(ad).isDirectory()) {
        for (const f of fs.readdirSync(ad)) {
          if (!f.endsWith('.md')) continue;
          const afp = path.join(ad, f);
          if (!fs.statSync(afp).isDirectory()) fixFile(afp, 'agent');
        }
      }
    }
  }

  // Core agents
  const coreDir = path.join(AIOS_CORE, '.aios-core', 'development', 'agents');
  if (fs.existsSync(coreDir)) {
    for (const f of fs.readdirSync(coreDir)) {
      if (!f.endsWith('.md')) continue;
      const fp = path.join(coreDir, f);
      if (!fs.statSync(fp).isDirectory()) fixFile(fp, 'agent');
    }
  }

  // Memory
  if (fs.existsSync(MEMORY_DIR)) {
    for (const f of fs.readdirSync(MEMORY_DIR)) {
      if (!f.endsWith('.md') || f === 'MEMORY.md') continue;
      fixFile(path.join(MEMORY_DIR, f), 'memory');
    }
  }
}

// ============================================================
// MAIN
// ============================================================

function main() {
  scanAll();

  if (changes.length === 0) {
    console.log('\x1b[32m✓ All files are clean — nothing to fix!\x1b[0m');
    return;
  }

  console.log(`\n${apply ? '\x1b[32mAPPLYING\x1b[0m' : '\x1b[33mDRY RUN\x1b[0m'}: ${changes.length} files to fix\n`);

  for (const c of changes) {
    const prefix = apply ? '\x1b[32m✓\x1b[0m' : '\x1b[33m~\x1b[0m';
    console.log(`  ${prefix} ${c.name} — ${c.fixType}  \x1b[2m${c.path}\x1b[0m`);

    if (apply) {
      fs.writeFileSync(c.path.replace('~/', os.homedir() + '/'), c.newContent, 'utf-8');
    }
  }

  console.log(`\n${apply ? 'Done!' : 'Preview.'} ${changes.length} files.`);
  if (!apply) console.log('Run with --apply to write changes.');
}

main();
