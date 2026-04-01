#!/usr/bin/env node
'use strict';

/**
 * Forge ↔ Quest Sync Validator
 *
 * Validates consistency between Forge workflows and Quest packs.
 * Run: node skills/forge/scripts/validate-forge-quest-sync.cjs
 */

const fs = require('fs');
const path = require('path');

const AIOS_ROOT = path.resolve(__dirname, '../../..');
const FORGE_DIR = path.join(AIOS_ROOT, 'skills/forge');
const QUEST_PACKS_DIR = path.join(AIOS_ROOT, 'skills/quest/packs');
const FORGE_SKILL = path.join(FORGE_DIR, 'SKILL.md');
const FORGE_WORKFLOWS_DIR = path.join(FORGE_DIR, 'workflows');

let errors = 0;
let warnings = 0;
let passed = 0;

function pass(msg) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
  passed++;
}

function fail(msg) {
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
  errors++;
}

function warn(msg) {
  console.log(`  \x1b[33m⚠\x1b[0m ${msg}`);
  warnings++;
}

function heading(msg) {
  console.log(`\n\x1b[34m━━━ ${msg} ━━━\x1b[0m`);
}

// ──────────────────────────────────────────────────────────────
// 1. Collect all Forge workflows
// ──────────────────────────────────────────────────────────────

heading('1. Forge Workflows');

const workflowFiles = fs.readdirSync(FORGE_WORKFLOWS_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace('.md', ''));

if (workflowFiles.length === 0) {
  fail('Nenhum workflow encontrado em skills/forge/workflows/');
} else {
  pass(`${workflowFiles.length} workflows encontrados: ${workflowFiles.join(', ')}`);
}

// ──────────────────────────────────────────────────────────────
// 2. Check SKILL.md references all workflows
// ──────────────────────────────────────────────────────────────

heading('2. SKILL.md → Workflows');

const skillContent = fs.readFileSync(FORGE_SKILL, 'utf-8');

for (const wf of workflowFiles) {
  const pattern = `workflows/${wf}.md`;
  if (skillContent.includes(pattern)) {
    pass(`SKILL.md referencia ${pattern}`);
  } else {
    fail(`SKILL.md NÃO referencia ${pattern} — adicione na Intent Classification e Selective Reading`);
  }
}

// ──────────────────────────────────────────────────────────────
// 3. Check each workflow has required sections
// ──────────────────────────────────────────────────────────────

heading('3. Workflow Structure');

const requiredSections = [
  'When to Use',
  'Pipeline',
  'Execution',
  'Agent Mapping',
];

const recommendedSections = [
  'Quest Integration',
  'Error Recovery',
  'Progress Display',
];

for (const wf of workflowFiles) {
  const content = fs.readFileSync(path.join(FORGE_WORKFLOWS_DIR, `${wf}.md`), 'utf-8');

  for (const section of requiredSections) {
    if (content.includes(`## ${section}`) || content.includes(`# ${section}`)) {
      pass(`${wf}: tem seção "${section}"`);
    } else {
      fail(`${wf}: FALTA seção "${section}"`);
    }
  }

  for (const section of recommendedSections) {
    if (content.includes(`## ${section}`) || content.includes(`# ${section}`)) {
      pass(`${wf}: tem seção "${section}"`);
    } else {
      warn(`${wf}: falta seção recomendada "${section}"`);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 4. Collect Quest packs with forge_workflow
// ──────────────────────────────────────────────────────────────

heading('4. Quest Packs ↔ Forge Workflows');

if (!fs.existsSync(QUEST_PACKS_DIR)) {
  warn('Diretório de packs não encontrado: skills/quest/packs/');
} else {
  const packFiles = fs.readdirSync(QUEST_PACKS_DIR)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  const packsWithForge = [];
  const packsWithoutForge = [];

  for (const pf of packFiles) {
    const content = fs.readFileSync(path.join(QUEST_PACKS_DIR, pf), 'utf-8');
    const match = content.match(/forge_workflow:\s*["']?([a-z0-9-]+)["']?/);

    if (match) {
      const forgeWorkflow = match[1];
      packsWithForge.push({ file: pf, workflow: forgeWorkflow });

      // Check workflow file exists
      const workflowPath = path.join(FORGE_WORKFLOWS_DIR, `${forgeWorkflow}.md`);
      if (fs.existsSync(workflowPath)) {
        pass(`Pack ${pf} → forge_workflow: "${forgeWorkflow}" → arquivo existe`);
      } else {
        fail(`Pack ${pf} → forge_workflow: "${forgeWorkflow}" → ARQUIVO NÃO EXISTE em workflows/`);
      }
    } else {
      packsWithoutForge.push(pf);
    }
  }

  if (packsWithoutForge.length > 0) {
    warn(`${packsWithoutForge.length} packs sem forge_workflow (usam inferência): ${packsWithoutForge.join(', ')}`);
  }

  // Check reverse: workflows without packs
  heading('5. Workflows sem Pack (cobertura)');

  const coveredWorkflows = packsWithForge.map(p => p.workflow);

  for (const wf of workflowFiles) {
    if (coveredWorkflows.includes(wf)) {
      pass(`Workflow "${wf}" tem pack Quest correspondente`);
    } else {
      warn(`Workflow "${wf}" NÃO tem pack Quest (sem gamificação — pode ser intencional)`);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 5. Check forge-bridge.md exists and is referenced
// ──────────────────────────────────────────────────────────────

heading('6. Forge Bridge');

const bridgePath = path.join(AIOS_ROOT, 'skills/quest/engine/forge-bridge.md');

if (fs.existsSync(bridgePath)) {
  pass('forge-bridge.md existe');

  const bridgeContent = fs.readFileSync(bridgePath, 'utf-8');

  // Check bridge references forge workflows
  if (bridgeContent.includes('forge_workflow')) {
    pass('forge-bridge.md referencia forge_workflow');
  } else {
    fail('forge-bridge.md NÃO referencia forge_workflow');
  }

  // Check bridge has decision function
  if (bridgeContent.includes('should_use_forge')) {
    pass('forge-bridge.md tem função should_use_forge');
  } else {
    fail('forge-bridge.md NÃO tem função should_use_forge');
  }

  if (bridgeContent.includes('build_forge_command')) {
    pass('forge-bridge.md tem função build_forge_command');
  } else {
    fail('forge-bridge.md NÃO tem função build_forge_command');
  }

  if (bridgeContent.includes('handle_forge_result')) {
    pass('forge-bridge.md tem função handle_forge_result');
  } else {
    fail('forge-bridge.md NÃO tem função handle_forge_result');
  }
} else {
  fail('forge-bridge.md NÃO existe em skills/quest/engine/');
}

// ──────────────────────────────────────────────────────────────
// 6. Check Quest SKILL.md references Forge
// ──────────────────────────────────────────────────────────────

heading('7. Quest SKILL.md → Forge');

const questSkillPath = path.join(AIOS_ROOT, 'skills/quest/SKILL.md');

if (fs.existsSync(questSkillPath)) {
  const questContent = fs.readFileSync(questSkillPath, 'utf-8');

  if (questContent.includes('forge-bridge') || questContent.includes('Forge')) {
    pass('Quest SKILL.md referencia Forge/forge-bridge');
  } else {
    fail('Quest SKILL.md NÃO referencia Forge — adicione nas Critical Rules');
  }

  if (questContent.includes('Forge is the default executor') || questContent.includes('Forge é o motor')) {
    pass('Quest SKILL.md tem regra "Forge is default executor"');
  } else {
    warn('Quest SKILL.md não tem regra explícita sobre Forge como executor padrão');
  }

  // Constitution checks
  if (questContent.includes('Constitution (NON-NEGOTIABLE)')) {
    pass('Quest SKILL.md tem seção Constitution (NON-NEGOTIABLE)');
  } else {
    fail('Quest SKILL.md NÃO tem seção Constitution (NON-NEGOTIABLE)');
  }

  if (questContent.includes('Quest NEVER executes work') || questContent.includes('Quest NUNCA executa')) {
    pass('Quest Constitution: "Quest NEVER executes work"');
  } else {
    fail('Quest Constitution: FALTA regra "Quest NEVER executes work"');
  }

  if (questContent.includes('ALL execution goes through Forge')) {
    pass('Quest Constitution: "ALL execution goes through Forge"');
  } else {
    fail('Quest Constitution: FALTA regra "ALL execution goes through Forge"');
  }
} else {
  fail('Quest SKILL.md não encontrado');
}

// Forge Constitution
heading('7b. Forge SKILL.md → Constitution');

const forgeContent = fs.readFileSync(FORGE_SKILL, 'utf-8');

if (forgeContent.includes('Forge Constitution (NON-NEGOTIABLE)')) {
  pass('Forge SKILL.md tem seção Forge Constitution (NON-NEGOTIABLE)');
} else {
  fail('Forge SKILL.md NÃO tem seção Forge Constitution (NON-NEGOTIABLE)');
}

if (forgeContent.includes('Forge NEVER implements directly') || forgeContent.includes('Forge NUNCA implementa')) {
  pass('Forge Constitution: "Forge NEVER implements directly"');
} else {
  fail('Forge Constitution: FALTA regra "Forge NEVER implements directly"');
}

if (forgeContent.includes('Every action has an owner')) {
  pass('Forge Constitution: "Every action has an owner"');
} else {
  fail('Forge Constitution: FALTA regra "Every action has an owner"');
}

// ──────────────────────────────────────────────────────────────
// 7c. Check guide.md doesn't route squads to manual flow
// ──────────────────────────────────────────────────────────────

heading('7c. Guide.md — Squad Routing');

const guidePath = path.join(AIOS_ROOT, 'skills/quest/engine/guide.md');
if (fs.existsSync(guidePath)) {
  const guideContent = fs.readFileSync(guidePath, 'utf-8');

  // Check that the Manual flow line does NOT mention "squad"
  const manualFlowLine = guideContent.split('\n').find(l => l.includes('Manual flow') && l.includes('who =='));
  if (manualFlowLine && manualFlowLine.includes('squad')) {
    fail('guide.md roteia "squad" para fluxo manual — squads devem ir pro Forge');
  } else {
    pass('guide.md NÃO roteia squads para fluxo manual');
  }

  // Check forge-bridge routes squad to Forge
  const bridgeContent2 = fs.readFileSync(bridgePath, 'utf-8');
  if (bridgeContent2.includes('squad') && bridgeContent2.includes('Forge orchestrates squad')) {
    pass('forge-bridge.md roteia squad → Forge (correto)');
  } else {
    fail('forge-bridge.md NÃO roteia squad → Forge');
  }
}

// ──────────────────────────────────────────────────────────────
// 8. Check checklist.md supports source=forge
// ──────────────────────────────────────────────────────────────

heading('8. Checklist → source=forge');

const checklistPath = path.join(AIOS_ROOT, 'skills/quest/engine/checklist.md');

if (fs.existsSync(checklistPath)) {
  const checklistContent = fs.readFileSync(checklistPath, 'utf-8');

  if (checklistContent.includes('source=forge') || checklistContent.includes('source=user|forge|scan')) {
    pass('checklist.md suporta source=forge');
  } else {
    fail('checklist.md NÃO suporta source=forge — editar §4');
  }

  if (checklistContent.includes('checked_by')) {
    pass('checklist.md tem campo checked_by');
  } else {
    fail('checklist.md NÃO tem campo checked_by');
  }
} else {
  fail('checklist.md não encontrado');
}

// ──────────────────────────────────────────────────────────────
// 8. Check pack items have valid `who` values
// ──────────────────────────────────────────────────────────────

heading('9. Pack Items — Validação de `who`');

const validWho = [
  '@dev', '@qa', '@devops', '@pm', '@sm', '@po',
  '@architect', '@data-engineer', '@analyst', '@ux-design-expert',
  'user', 'skill', 'squad', 'agente',
];

if (fs.existsSync(QUEST_PACKS_DIR)) {
  const packFiles = fs.readdirSync(QUEST_PACKS_DIR)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  for (const pf of packFiles) {
    const content = fs.readFileSync(path.join(QUEST_PACKS_DIR, pf), 'utf-8');
    const whoMatches = content.matchAll(/who:\s*["']?([^"'\n]+)["']?/g);
    const unknownWhos = new Set();

    for (const m of whoMatches) {
      const who = m[1].trim().toLowerCase();
      if (!validWho.includes(who)) {
        unknownWhos.add(m[1].trim());
      }
    }

    if (unknownWhos.size === 0) {
      pass(`${pf}: todos os "who" são válidos`);
    } else {
      warn(`${pf}: "who" valores não reconhecidos (podem ser válidos): ${[...unknownWhos].join(', ')}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────────────

console.log('\n\x1b[34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
console.log(`\x1b[34mForge ↔ Quest Sync Validator\x1b[0m`);
console.log(`\x1b[34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
console.log(`  \x1b[32m✓ ${passed} passed\x1b[0m`);
if (warnings > 0) console.log(`  \x1b[33m⚠ ${warnings} warnings\x1b[0m`);
if (errors > 0) console.log(`  \x1b[31m✗ ${errors} errors\x1b[0m`);
console.log(`\x1b[34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);

if (errors > 0) {
  console.log(`\n\x1b[31mFAIL — ${errors} inconsistência(s) encontrada(s). Corrija antes de prosseguir.\x1b[0m`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n\x1b[33mPASS com avisos — ${warnings} item(ns) para revisar.\x1b[0m`);
  process.exit(0);
} else {
  console.log(`\n\x1b[32mPASS — Forge e Quest estão 100% sincronizados.\x1b[0m`);
  process.exit(0);
}
