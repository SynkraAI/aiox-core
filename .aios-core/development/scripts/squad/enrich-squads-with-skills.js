#!/usr/bin/env node
// enrich-squads-with-skills.js
//
// One-shot enrichment: adds `skills:` and `mcps:` blocks to squad-*/squad.yaml
// following domain affinity. Idempotent: if blocks already exist, skips.
//
// Usage: node .aios-core/development/scripts/squad/enrich-squads-with-skills.js [--dry-run]
//
// Author: Craft (squad-creator) + Orion (aios-master)
// Story: Squad Skills Enrichment (Apr/2026)

'use strict';

const fs = require('fs');
const path = require('path');

const SQUADS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'squads');
const DRY_RUN = process.argv.includes('--dry-run');

// Cross-cutting skills applied to every squad
const CROSS_CUTTING = [
  'mind-clone-consultation',
  'quality-gates',
  'document-generation',
  'reporting',
  'problem-solving',
  'agent-handoff',
];

// Domain → skills mapping (picked from .claude/skills/ + global plugin skills)
const DOMAIN_SKILLS = {
  ai_strategy: ['architect-first', 'ultraplan', 'brainstorming', 'mcp-builder', 'claude-api', 'thinkback'],
  behavioral_science: ['brainstorming', 'ultraplan', 'thinkback'],
  community: ['brand', 'canvas-design', 'banner-design'],
  content: ['brand', 'brand-guidelines', 'canvas-design', 'banner-design', 'pdf', 'video-editing', 'fal-ai-media', 'ultraplan'],
  customer_success: ['brainstorming', 'ultraplan'],
  data: ['ultraplan', 'bughunter', 'architect-first'],
  design: ['design-system', 'canvas-design', 'banner-design', 'ui-ux-pro-max', 'brand-guidelines', 'brand', 'theme-factory', 'frontend-patterns', 'web-artifacts-builder', 'fal-ai-media'],
  education: ['canvas-design', 'pdf', 'video-editing', 'brainstorming'],
  engineering: ['architect-first', 'bughunter', 'mcp-builder', 'ultraplan', 'frontend-patterns', 'claude-api', 'conventional-commits', 'cli-first', 'story-driven-development'],
  // squad-executive has department: null → key = 'executive'
  executive: ['ultraplan', 'brainstorming', 'thinkback', 'architect-first'],
  finance: ['ultraplan', 'pdf', 'thinkback'],
  growth: ['brand', 'brand-guidelines', 'banner-design', 'canvas-design', 'ultraplan', 'fal-ai-media'],
  health: ['ultraplan', 'pdf', 'brainstorming'],
  legal: ['pdf', 'ultraplan', 'document-generation'],
  operations: ['ultraplan', 'conventional-commits', 'cli-first'],
  people: ['brainstorming', 'ultraplan'],
  platform: ['architect-first', 'mcp-builder', 'bughunter', 'ultraplan', 'cli-first'],
  product: ['brainstorming', 'ultraplan', 'architect-first'],
  research: ['brainstorming', 'ultraplan', 'thinkback'],
  sales: ['brand', 'brand-guidelines', 'banner-design'],
  security: ['bughunter', 'architect-first', 'ultraplan', 'security-awareness'],
};

// Recommended MCPs per department
const DOMAIN_MCPS = {
  ai_strategy: ['aios-brain-bridge', 'mcp-memory-service'],
  behavioral_science: ['aios-brain-bridge'],
  community: ['aios-brain-bridge'],
  content: ['aios-brain-bridge', 'mcp-image-studio', 'mcp-design-studio'],
  customer_success: ['aios-brain-bridge', 'mcp-memory-service'],
  data: ['aios-brain-bridge', 'mcp-memory-service'],
  design: ['aios-brain-bridge', 'mcp-design-studio', 'mcp-image-studio', 'stitch', 'nano-banana-2', '21st-dev-magic'],
  education: ['aios-brain-bridge'],
  engineering: ['aios-brain-bridge', 'mcp-memory-service', 'context7'],
  executive: ['aios-brain-bridge', 'mcp-memory-service'],
  finance: ['aios-brain-bridge'],
  growth: ['aios-brain-bridge', 'mcp-ads-bridge', 'mcp-design-studio'],
  health: ['aios-brain-bridge'],
  legal: ['aios-brain-bridge'],
  operations: ['aios-brain-bridge', 'mcp-memory-service'],
  people: ['aios-brain-bridge'],
  platform: ['aios-brain-bridge', 'mcp-memory-service'],
  product: ['aios-brain-bridge', 'mcp-memory-service'],
  research: ['aios-brain-bridge'],
  sales: ['aios-brain-bridge', 'mcp-ads-bridge'],
  security: ['aios-brain-bridge'],
};

function parseDept(content) {
  const m = content.match(/^department:\s*(\S+)/m);
  if (!m) return null;
  const v = m[1].trim();
  return v === 'null' ? 'executive' : v;
}

function alreadyEnriched(content) {
  return /^skills:/m.test(content) || /^mcps:/m.test(content);
}

function buildBlock(dept) {
  const domainSkills = DOMAIN_SKILLS[dept] || [];
  const mcps = DOMAIN_MCPS[dept] || ['aios-brain-bridge'];
  const lines = [];
  lines.push('');
  lines.push('# Skills — injected 2026-04-17 by enrich-squads-with-skills.js');
  lines.push('# Cross-cutting skills apply to all squads. Domain skills are curated per department.');
  lines.push('skills:');
  lines.push('  cross_cutting:');
  CROSS_CUTTING.forEach((s) => lines.push(`    - ${s}`));
  lines.push('  domain:');
  domainSkills.forEach((s) => lines.push(`    - ${s}`));
  lines.push('');
  lines.push('# MCPs — recommended servers for this squad');
  lines.push('mcps:');
  lines.push('  recommended:');
  mcps.forEach((m) => lines.push(`    - ${m}`));
  lines.push('');
  return lines.join('\n');
}

function main() {
  const entries = fs.readdirSync(SQUADS_ROOT, { withFileTypes: true });
  const squadDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('squad-'))
    .map((e) => e.name)
    .sort();

  let enriched = 0;
  let skipped = 0;
  let missing = 0;
  const report = [];

  for (const name of squadDirs) {
    const manifest = path.join(SQUADS_ROOT, name, 'squad.yaml');
    if (!fs.existsSync(manifest)) {
      missing++;
      report.push({ squad: name, status: 'MISSING' });
      continue;
    }
    const content = fs.readFileSync(manifest, 'utf8');
    if (alreadyEnriched(content)) {
      skipped++;
      report.push({ squad: name, status: 'SKIPPED (already has skills/mcps)' });
      continue;
    }
    const dept = parseDept(content);
    if (!dept) {
      report.push({ squad: name, status: 'NO_DEPT' });
      continue;
    }
    const block = buildBlock(dept);
    const next = content.replace(/\s*$/, '\n') + block;
    if (!DRY_RUN) {
      fs.writeFileSync(manifest, next, 'utf8');
    }
    enriched++;
    report.push({
      squad: name,
      status: DRY_RUN ? 'WOULD_ENRICH' : 'ENRICHED',
      dept,
      skills: (DOMAIN_SKILLS[dept] || []).length + CROSS_CUTTING.length,
      mcps: (DOMAIN_MCPS[dept] || []).length,
    });
  }

  console.log(`\nSquad Skills Enrichment — ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}`);
  console.log('─'.repeat(60));
  report.forEach((r) => console.log(JSON.stringify(r)));
  console.log('─'.repeat(60));
  console.log(`Enriched: ${enriched} | Skipped: ${skipped} | Missing: ${missing}`);
}

main();
