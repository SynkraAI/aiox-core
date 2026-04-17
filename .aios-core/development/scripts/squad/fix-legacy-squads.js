#!/usr/bin/env node
// fix-legacy-squads.js
//
// Two jobs:
// 1) Generate minimal squad.yaml for legacy squads that are missing a manifest
//    (ai-science, design-terapeutico, growth, health-data, health-tech,
//     innovation, legal, therapy).
// 2) Enrich existing legacy manifests (customer-ops, marketing-ops,
//    product-research, sales-ops, executive-team, expert-council) with
//    skills/mcps blocks based on reports_to/description heuristics.
//
// Idempotent: skips squads already carrying 'skills:'.

'use strict';

const fs = require('fs');
const path = require('path');

const SQUADS_ROOT = path.join(__dirname, '..', '..', '..', '..', 'squads');

// Department classification for legacy squads (based on name/reports_to)
const LEGACY_DEPT = {
  'customer-ops': 'customer_success',
  'marketing-ops': 'growth',
  'product-research': 'research',
  'sales-ops': 'sales',
  'executive-team': 'executive',
  'expert-council': 'ai_strategy',
  'ai-science': 'ai_strategy',
  'design-terapeutico': 'design',
  growth: 'growth',
  'health-data': 'data',
  'health-tech': 'health',
  innovation: 'research',
  legal: 'legal',
  therapy: 'health',
};

const MANIFEST_SEED = {
  'ai-science': {
    description: 'AI research, scientific discovery, and experimental AI applications.',
    reports_to: 'ai_strategy_lead',
  },
  'design-terapeutico': {
    description: 'Therapeutic design squad: UX for mental health, accessibility, and compassionate interfaces.',
    reports_to: 'design_lead',
  },
  growth: {
    description: 'Growth loops, acquisition, activation, retention experiments.',
    reports_to: 'cmo',
  },
  'health-data': {
    description: 'Clinical/health data engineering: FHIR, SUS datasets, privacy, analytics.',
    reports_to: 'data_lead',
  },
  'health-tech': {
    description: 'Digital health products: telehealth, EMR integrations, regulatory.',
    reports_to: 'health_lead',
  },
  innovation: {
    description: 'Emerging technology exploration, R&D initiatives, future-facing bets.',
    reports_to: 'ceo',
  },
  legal: {
    description: 'Legal operations: LGPD, contracts, IP, compliance workflows.',
    reports_to: 'clo',
  },
  therapy: {
    description: 'Mental health therapy squad: clinical-AI, Serenity AI, Christian Dunker-grounded flows.',
    reports_to: 'health_lead',
  },
};

const CROSS_CUTTING = [
  'mind-clone-consultation',
  'quality-gates',
  'document-generation',
  'reporting',
  'problem-solving',
  'agent-handoff',
];

const DOMAIN_SKILLS = {
  ai_strategy: ['architect-first', 'ultraplan', 'brainstorming', 'mcp-builder', 'claude-api', 'thinkback'],
  behavioral_science: ['brainstorming', 'ultraplan', 'thinkback'],
  community: ['brand', 'canvas-design', 'banner-design'],
  content: ['brand', 'brand-guidelines', 'canvas-design', 'banner-design', 'pdf', 'video-editing', 'fal-ai-media'],
  customer_success: ['brainstorming', 'ultraplan'],
  data: ['ultraplan', 'bughunter', 'architect-first'],
  design: ['design-system', 'canvas-design', 'banner-design', 'ui-ux-pro-max', 'brand-guidelines', 'brand', 'theme-factory', 'frontend-patterns', 'web-artifacts-builder', 'fal-ai-media'],
  education: ['canvas-design', 'pdf', 'video-editing', 'brainstorming'],
  engineering: ['architect-first', 'bughunter', 'mcp-builder', 'ultraplan', 'frontend-patterns', 'claude-api', 'conventional-commits', 'cli-first', 'story-driven-development'],
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

function listDirs(p) {
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function buildSkillsBlock(dept) {
  const domainSkills = DOMAIN_SKILLS[dept] || [];
  const mcps = DOMAIN_MCPS[dept] || ['aios-brain-bridge'];
  const lines = [];
  lines.push('');
  lines.push('# Skills -- injected 2026-04-17 by fix-legacy-squads.js');
  lines.push('skills:');
  lines.push('  cross_cutting:');
  CROSS_CUTTING.forEach((s) => lines.push(`    - ${s}`));
  lines.push('  domain:');
  domainSkills.forEach((s) => lines.push(`    - ${s}`));
  lines.push('');
  lines.push('# MCPs -- recommended for this squad');
  lines.push('mcps:');
  lines.push('  recommended:');
  mcps.forEach((m) => lines.push(`    - ${m}`));
  lines.push('');
  return lines.join('\n');
}

function buildMinimalManifest(name, seed, dept, subdirs) {
  const components = [];
  // NOTE: validator joins as path.join(squadPath, dir, file) so component
  // entries must be bare filenames, NOT `dir/filename`.
  const readList = (subdir, extFilter) => {
    const full = path.join(SQUADS_ROOT, name, subdir);
    return fs
      .readdirSync(full)
      .filter((f) => (extFilter ? extFilter(f) : true));
  };

  if (subdirs.includes('agents')) {
    components.push(['agents', readList('agents', (f) => f.endsWith('.md'))]);
  }
  if (subdirs.includes('tasks')) {
    components.push(['tasks', readList('tasks', (f) => f.endsWith('.md') || f.endsWith('.yaml'))]);
  }
  if (subdirs.includes('workflows')) {
    components.push(['workflows', readList('workflows', (f) => f.endsWith('.yaml') || f.endsWith('.md'))]);
  }
  if (subdirs.includes('templates')) {
    components.push(['templates', readList('templates')]);
  }
  if (subdirs.includes('checklists')) {
    components.push(['checklists', readList('checklists')]);
  }
  if (subdirs.includes('data')) {
    components.push(['data', readList('data')]);
  }

  const lines = [];
  lines.push(`name: ${name}`);
  lines.push('version: "1.0.0"');
  lines.push(`description: "${seed.description}"`);
  lines.push('compatibility: ">=4.0.0"');
  if (seed.reports_to) lines.push(`reports_to: ${seed.reports_to}`);
  lines.push(`department: ${dept}`);
  lines.push('');
  lines.push('# Components -- discovered from filesystem at 2026-04-17');
  lines.push('components:');
  for (const [key, list] of components) {
    if (list.length === 0) continue;
    lines.push(`  ${key}:`);
    list.forEach((p) => lines.push(`    - "${p}"`));
  }
  return lines.join('\n') + '\n';
}

function hasSkills(content) {
  return /^skills:/m.test(content);
}

function main() {
  const all = listDirs(SQUADS_ROOT);
  const report = [];

  for (const name of all) {
    if (name.startsWith('squad-')) continue; // new squads already handled
    const dept = LEGACY_DEPT[name];
    if (!dept) {
      report.push({ squad: name, status: 'UNKNOWN_DEPT' });
      continue;
    }

    const manifestPath = path.join(SQUADS_ROOT, name, 'squad.yaml');
    const subdirs = listDirs(path.join(SQUADS_ROOT, name));

    if (!fs.existsSync(manifestPath)) {
      // Job 1: generate minimal manifest
      const seed = MANIFEST_SEED[name];
      if (!seed) {
        report.push({ squad: name, status: 'NO_SEED' });
        continue;
      }
      let manifest = buildMinimalManifest(name, seed, dept, subdirs);
      manifest += buildSkillsBlock(dept);
      fs.writeFileSync(manifestPath, manifest, 'utf8');
      report.push({ squad: name, status: 'GENERATED+ENRICHED', dept });
    } else {
      // Job 2: append skills block if not present
      const content = fs.readFileSync(manifestPath, 'utf8');
      if (hasSkills(content)) {
        report.push({ squad: name, status: 'SKIPPED', reason: 'already has skills' });
        continue;
      }
      const next = content.replace(/\s*$/, '\n') + buildSkillsBlock(dept);
      fs.writeFileSync(manifestPath, next, 'utf8');
      report.push({ squad: name, status: 'ENRICHED', dept });
    }
  }

  console.log('Legacy Squad Fix Report');
  console.log('='.repeat(60));
  report.forEach((r) => console.log(JSON.stringify(r)));
  console.log('='.repeat(60));
}

main();
