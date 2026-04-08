#!/usr/bin/env node

/**
 * Frontmatter Enrich — Upgrade weak agent descriptions
 *
 * Finds agents with generic descriptions ("Agente X do ecossistema AIOS",
 * "Agent ID: X") and replaces them with descriptions extracted from the
 * file's actual content (persona sections, role_tagline, greeting, etc.)
 *
 * Usage:
 *   node tools/frontmatter-enrich-descriptions.js              # Dry run
 *   node tools/frontmatter-enrich-descriptions.js --apply       # Apply
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const CORE_AGENTS = path.join(AIOS_CORE, '.aios-core', 'development', 'agents');
const SQUADS_DIR = path.join(AIOS_CORE, 'squads');
const apply = process.argv.includes('--apply');

function isWeakDescription(desc) {
  if (!desc) return true;
  const clean = desc.replace(/[\"']/g, '').trim();
  return (
    clean.match(/^Agente .+ do ecossistema AIOS/) ||
    clean.match(/^Agent ID:/) ||
    clean.length < 15
  );
}

function extractBetterDescription(content, agentName, squadName) {
  // Strategy 1: role_tagline in YAML block
  const taglineMatch = content.match(/role_tagline:\s*["']?([^"'\n]{10,150})/);
  if (taglineMatch) return cleanDesc(taglineMatch[1]);

  // Strategy 2: tagline or subtitle field
  const subtitleMatch = content.match(/(?:tagline|subtitle|summary):\s*["']?([^"'\n]{10,150})/i);
  if (subtitleMatch) return cleanDesc(subtitleMatch[1]);

  // Strategy 3: Persona > Expertise or Description section
  const expertiseMatch = content.match(/(?:expertise|especialidade|domain|foco):\s*["']?([^"'\n]{10,150})/i);
  if (expertiseMatch) return cleanDesc(expertiseMatch[1]);

  // Strategy 4: First meaningful line after "## Persona" or "## Identity"
  const personaSectionMatch = content.match(/##\s*(?:Persona|Identity|Identidade|Who|Quem)[^\n]*\n+([^\n#]{15,200})/i);
  if (personaSectionMatch) return cleanDesc(personaSectionMatch[1]);

  // Strategy 5: "You are..." pattern
  const youAreMatch = content.match(/You are (?:the |a )?([^.]{10,150})\./i);
  if (youAreMatch) return cleanDesc(youAreMatch[1]);

  // Strategy 6: "Eu sou..." or "Sou o/a..." pattern
  const euSouMatch = content.match(/(?:Eu sou|Sou (?:o|a|um|uma))\s+([^.]{10,150})\./i);
  if (euSouMatch) return cleanDesc(euSouMatch[1]);

  // Strategy 7: Greeting content (often has role description)
  const greetMatch = content.match(/greeting[^:]*:\s*\|?\s*\n\s*["']?([^"'\n]{10,100})/);
  if (greetMatch) {
    const g = cleanDesc(greetMatch[1]);
    if (g.length > 20 && !g.includes('ready') && !g.includes('Ready')) return g;
  }

  // Strategy 8: First line after blockquote in content body
  const bqMatch = content.match(/^>\s*(.{15,150})$/m);
  if (bqMatch) {
    const bq = cleanDesc(bqMatch[1]);
    if (!bq.includes('crafted by') && !bq.includes('Version')) return bq;
  }

  // Strategy 9: "description:" field inside embedded YAML
  const embeddedDescMatch = content.match(/^\s{2,}description:\s*["']?([^"'\n]{15,150})/m);
  if (embeddedDescMatch) return cleanDesc(embeddedDescMatch[1]);

  // Strategy 10: Purpose or Mission section
  const purposeMatch = content.match(/##\s*(?:Purpose|Mission|Propósito|Missão)[^\n]*\n+([^\n#]{15,200})/i);
  if (purposeMatch) return cleanDesc(purposeMatch[1]);

  // Strategy 11: Look for "specialist in" / "especialista em" patterns
  const specialistMatch = content.match(/(?:specialist|especialista|expert|authority)\s+(?:in|em)\s+([^.]{10,100})/i);
  if (specialistMatch) return `Especialista em ${cleanDesc(specialistMatch[1])}`;

  // Strategy 12: For mind clones, look for the person's actual description
  const mindCloneMatch = content.match(/(?:Clone|Mind clone|Réplica)\s+(?:de|of|mental de)\s+([^.—\n]{10,120})/i);
  if (mindCloneMatch) return `Clone mental de ${cleanDesc(mindCloneMatch[1])}`;

  // Strategy 13: commands section — infer from command names
  const commandsMatch = content.match(/\*(\w[\w-]+).*?[—–-]\s*([^\n]{10,100})/g);
  if (commandsMatch && commandsMatch.length >= 2) {
    const cmds = commandsMatch.slice(0, 3).map((m) => {
      const parts = m.match(/[—–-]\s*(.+)/);
      return parts ? parts[1].trim() : '';
    }).filter(Boolean);
    if (cmds.length > 0) return cmds.join('. ').slice(0, 150);
  }

  // Fallback: construct from name + squad
  if (squadName) {
    return `Agente especializado do squad ${squadName}.`;
  }
  return null; // No improvement found
}

function cleanDesc(text) {
  return text
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^["'>\s]+/, '')
    .replace(/["'\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function processFile(filePath, squadName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const trimmed = content.trimStart();

  if (!trimmed.startsWith('---')) return null;
  const endIdx = trimmed.indexOf('---', 3);
  if (endIdx === -1) return null;

  const fmBlock = trimmed.slice(3, endIdx);
  const descMatch = fmBlock.match(/description:\s*["']?(.+?)["']?\s*$/m);
  if (!descMatch) return null;

  const currentDesc = descMatch[1].trim();
  if (!isWeakDescription(currentDesc)) return null;

  const agentName = path.basename(filePath, '.md');
  const bodyContent = trimmed.slice(endIdx + 3);
  const betterDesc = extractBetterDescription(bodyContent, agentName, squadName);

  if (!betterDesc || betterDesc.length < 15) return null;

  // Build new content
  const oldLine = descMatch[0];
  const newLine = `description: "${betterDesc.replace(/"/g, '\\"')}"`;
  const newFmBlock = fmBlock.replace(oldLine, newLine);
  const newContent = `---${newFmBlock}---${trimmed.slice(endIdx + 3)}`;

  return {
    name: agentName,
    squad: squadName || 'core',
    path: filePath,
    oldDesc: currentDesc.slice(0, 60),
    newDesc: betterDesc.slice(0, 80) + (betterDesc.length > 80 ? '...' : ''),
    newContent,
  };
}

function main() {
  const changes = [];

  // Core agents
  if (fs.existsSync(CORE_AGENTS)) {
    for (const f of fs.readdirSync(CORE_AGENTS)) {
      if (!f.endsWith('.md')) continue;
      const fp = path.join(CORE_AGENTS, f);
      if (fs.statSync(fp).isDirectory()) continue;
      const result = processFile(fp, null);
      if (result) changes.push(result);
    }
  }

  // Squad agents
  for (const sq of fs.readdirSync(SQUADS_DIR)) {
    const ad = path.join(SQUADS_DIR, sq, 'agents');
    if (!fs.existsSync(ad) || !fs.statSync(ad).isDirectory()) continue;
    for (const f of fs.readdirSync(ad)) {
      if (!f.endsWith('.md')) continue;
      const fp = path.join(ad, f);
      if (fs.statSync(fp).isDirectory()) continue;
      const result = processFile(fp, sq);
      if (result) changes.push(result);
    }
  }

  if (changes.length === 0) {
    console.log('No weak descriptions found to enrich.');
    return;
  }

  const noImprovement = 189 - changes.length;
  console.log(`\n${apply ? 'APPLYING' : 'DRY RUN'}: ${changes.length} descriptions to enrich (${noImprovement} could not be improved)\n`);

  const groups = {};
  for (const c of changes) {
    if (!groups[c.squad]) groups[c.squad] = [];
    groups[c.squad].push(c);
  }

  let applied = 0;
  for (const [squad, items] of Object.entries(groups)) {
    console.log(`  \x1b[35m[${squad}]\x1b[0m (${items.length})`);
    for (const c of items) {
      const prefix = apply ? '\x1b[32m✓\x1b[0m' : '\x1b[33m~\x1b[0m';
      console.log(`    ${prefix} ${c.name}`);
      console.log(`      \x1b[31m-\x1b[0m ${c.oldDesc}`);
      console.log(`      \x1b[32m+\x1b[0m ${c.newDesc}`);

      if (apply) {
        fs.writeFileSync(c.path, c.newContent, 'utf-8');
        applied++;
      }
    }
  }

  console.log(`\n${apply ? `Done! Enriched ${applied}` : `Preview of ${changes.length}`} descriptions.`);
  if (!apply) console.log('Run with --apply to write changes.');
}

main();
