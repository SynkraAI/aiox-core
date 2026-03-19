#!/usr/bin/env node

/**
 * Memory Health Check — Complete Checklist Audit
 *
 * Answers all 18 questions of the Memory System v2.0 checklist
 * across ALL projects and agents. Does not stop until every
 * question is answered.
 *
 * Usage:
 *   node tools/memory-health-check.js          # Full report
 *   node tools/memory-health-check.js --json   # JSON output
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const CODE_PROJECTS = path.join(os.homedir(), 'CODE', 'Projects');
const AGENTS_DIR = path.join(AIOS_CORE, '.aios-core', 'development', 'agents');
const USER_PROFILE = path.join(AIOS_CORE, '.aios-core', 'data', 'memory', 'user', 'luiz-fosc-profile.md');

// ============================================================
// DISCOVERY — find all projects
// ============================================================

function discoverProjects() {
  const projects = [];

  // CENTRALIZED — docs/projects/*/
  const centralDir = path.join(AIOS_CORE, 'docs', 'projects');
  if (fs.existsSync(centralDir)) {
    for (const name of fs.readdirSync(centralDir)) {
      const full = path.join(centralDir, name);
      if (!fs.statSync(full).isDirectory()) continue;
      if (name.startsWith('.')) continue;
      projects.push({
        name,
        mode: 'CENTRALIZED',
        projectPath: full,
        memoryDir: path.join(full, 'memory')
      });
    }
  }

  // HYBRID — ~/CODE/Projects/*/
  if (fs.existsSync(CODE_PROJECTS)) {
    for (const name of fs.readdirSync(CODE_PROJECTS)) {
      const full = path.join(CODE_PROJECTS, name);
      if (!fs.statSync(full).isDirectory()) continue;
      if (name.startsWith('.')) continue;
      projects.push({
        name,
        mode: 'HYBRID',
        projectPath: full,
        memoryDir: path.join(full, '.aios', 'memory')
      });
    }
  }

  return projects;
}

// ============================================================
// CHECKLIST CHECKS
// ============================================================

function checkProjectContext(memoryDir) {
  const fp = path.join(memoryDir, 'project-context.md');
  if (!fs.existsSync(fp)) return { exists: false, filled: false, content: null };

  const content = fs.readFileSync(fp, 'utf8');
  // Check if it's more than just template (has real content, not just "(A ser preenchido)")
  const templatePhrases = content.match(/\(A ser preenchido[^)]*\)/g) || [];
  const totalSections = (content.match(/^## /gm) || []).length;
  const filledSections = totalSections - templatePhrases.length;
  const filled = filledSections > 2 && content.length > 300;

  return { exists: true, filled, filledSections, totalSections, length: content.length };
}

function checkFeedback(memoryDir) {
  const fbDir = path.join(memoryDir, 'feedback');
  if (!fs.existsSync(fbDir)) return { exists: false, count: 0, files: [] };

  try {
    const files = fs.readdirSync(fbDir).filter(f => f.endsWith('.md'));
    return { exists: true, count: files.length, files };
  } catch {
    return { exists: false, count: 0, files: [] };
  }
}

function checkAgentsUsed(memoryDir) {
  const fp = path.join(memoryDir, 'agents-used.md');
  if (!fs.existsSync(fp)) return { exists: false };
  const content = fs.readFileSync(fp, 'utf8');
  const filled = content.length > 100 && !content.includes('(A ser preenchido)');
  return { exists: true, filled };
}

function checkSquadsConfig(memoryDir) {
  const fp = path.join(memoryDir, 'squads-config.md');
  if (!fs.existsSync(fp)) return { exists: false };
  return { exists: true };
}

function checkHybridRules() {
  // Check HYBRID projects have memory-protocol.md in .claude/rules/
  if (!fs.existsSync(CODE_PROJECTS)) return { total: 0, withRule: 0, missing: [] };

  let total = 0;
  let withRule = 0;
  const missing = [];

  for (const name of fs.readdirSync(CODE_PROJECTS)) {
    const full = path.join(CODE_PROJECTS, name);
    if (!fs.statSync(full).isDirectory()) continue;
    if (name.startsWith('.')) continue;
    total++;

    const rulePath = path.join(full, '.claude', 'rules', 'memory-protocol.md');
    if (fs.existsSync(rulePath)) {
      withRule++;
    } else {
      missing.push(name);
    }
  }

  return { total, withRule, missing };
}

function checkAgentSpawnFiles() {
  const results = [];
  const agentFiles = [
    'aios-dev.md', 'aios-sm.md', 'aios-po.md', 'aios-architect.md',
    'aios-qa.md', 'aios-pm.md', 'aios-devops.md', 'aios-analyst.md',
    'aios-data-engineer.md', 'aios-ux.md', 'aios-master.md'
  ];

  for (const file of agentFiles) {
    const fp = path.join(AGENTS_DIR, file);
    if (!fs.existsSync(fp)) {
      results.push({ agent: file, readProtocol: false, writeProtocol: false });
      continue;
    }

    const content = fs.readFileSync(fp, 'utf8');
    const hasRead = /project.?memory/i.test(content) || /memory\/project-context/i.test(content);
    const hasWrite = /feedback.?write.?protocol/i.test(content) || /STOP.*current work/i.test(content);
    results.push({ agent: file, readProtocol: hasRead, writeProtocol: hasWrite });
  }

  return results;
}

function checkRules() {
  const rulePath = path.join(AIOS_CORE, '.claude', 'rules', 'memory-protocol.md');
  if (!fs.existsSync(rulePath)) return { exists: false, sections: {} };

  const content = fs.readFileSync(rulePath, 'utf8');
  return {
    exists: true,
    sections: {
      readProtocol: /O Que Ler/i.test(content),
      writeProtocol: /Write Protocol/i.test(content),
      checkpoints: /Checkpoint/i.test(content),
      behavior: /Comportamento Esperado/i.test(content)
    }
  };
}

function checkHooks() {
  const hookPath = path.join(AIOS_CORE, '.claude', 'hooks', 'memory-autoload.cjs');
  const settingsPath = path.join(AIOS_CORE, '.claude', 'settings.json');

  const hookExists = fs.existsSync(hookPath);
  let hookRegistered = false;

  if (fs.existsSync(settingsPath)) {
    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      hookRegistered = content.includes('memory-autoload.cjs');
    } catch { /* ignore */ }
  }

  return { hookExists, hookRegistered };
}

function checkTools() {
  return {
    auditTool: fs.existsSync(path.join(AIOS_CORE, 'tools', 'audit-project-memory.js')),
    bootstrapTool: fs.existsSync(path.join(AIOS_CORE, 'tools', 'bootstrap-project-memory.js')),
    cleanupTool: fs.existsSync(path.join(AIOS_CORE, 'tools', 'cleanup-old-feedback.js'))
  };
}

function checkNewProject() {
  const fp = path.join(AIOS_CORE, '.claude', 'commands', 'new-project.md');
  if (!fs.existsSync(fp)) return { exists: false, hasMemoryStep: false };

  const content = fs.readFileSync(fp, 'utf8');
  return {
    exists: true,
    hasMemoryStep: /Passo 2\.6/i.test(content) || /memory\//i.test(content)
  };
}

function checkCheckpoint() {
  const fp = path.join(AIOS_CORE, '.claude', 'commands', 'checkpoint.md');
  if (!fs.existsSync(fp)) return { exists: false, hasMemoryStep: false };

  const content = fs.readFileSync(fp, 'utf8');
  return {
    exists: true,
    hasMemoryStep: /4\.5.*[Mm]em[oó]ria/i.test(content) || /Atualizar mem[oó]ria/i.test(content)
  };
}

// ============================================================
// MAIN REPORT
// ============================================================

function main() {
  const jsonOutput = process.argv.includes('--json');

  console.log('Memory System v2.0 — Complete Health Check\n');
  console.log('='.repeat(60));

  const projects = discoverProjects();
  const agents = checkAgentSpawnFiles();
  const rules = checkRules();
  const hooks = checkHooks();
  const hybridRules = checkHybridRules();
  const tools = checkTools();
  const newProject = checkNewProject();
  const checkpoint = checkCheckpoint();
  const userProfileExists = fs.existsSync(USER_PROFILE);

  // ── Q1-Q4: Structure ──────────────────────────────────────

  console.log('\n## ESTRUTURA (o esqueleto existe?)\n');

  let q1Pass = 0;
  let q1Total = projects.length;
  let q2Pass = 0;
  let q3Pass = 0;
  let projectResults = [];

  for (const proj of projects) {
    const ctx = checkProjectContext(proj.memoryDir);
    const fb = checkFeedback(proj.memoryDir);
    const au = checkAgentsUsed(proj.memoryDir);

    if (ctx.exists) q1Pass++;
    if (ctx.filled) q2Pass++;
    if (fb.count > 0) q3Pass++;

    projectResults.push({
      name: proj.name,
      mode: proj.mode,
      contextExists: ctx.exists,
      contextFilled: ctx.filled,
      filledSections: ctx.filledSections || 0,
      totalSections: ctx.totalSections || 0,
      feedbackCount: fb.count,
      agentsUsedFilled: au.filled || false
    });
  }

  const q1 = q1Pass === q1Total;
  const q2 = q2Pass > 0;
  const q3 = q3Pass > 0;
  const q4 = userProfileExists;

  console.log(`Q1. project-context.md existe?  ${q1 ? 'PASS' : 'FAIL'} (${q1Pass}/${q1Total})`);
  console.log(`Q2. context preenchido (real)?   ${q2 ? 'PASS' : 'WARN'} (${q2Pass}/${q1Total} com conteúdo real)`);
  console.log(`Q3. feedback/ com arquivos?      ${q3 ? 'PASS' : 'WARN'} (${q3Pass}/${q1Total} com feedback real)`);
  console.log(`Q4. user profile global?         ${q4 ? 'PASS' : 'FAIL'}`);

  // Show projects without context
  const missingCtx = projectResults.filter(p => !p.contextExists);
  if (missingCtx.length > 0) {
    console.log(`\n   Sem project-context.md:`);
    missingCtx.forEach(p => console.log(`     - ${p.name} (${p.mode})`));
  }

  // Show projects with empty templates
  const emptyCtx = projectResults.filter(p => p.contextExists && !p.contextFilled);
  if (emptyCtx.length > 0) {
    console.log(`\n   Template vazio (precisa preencher):`);
    emptyCtx.forEach(p => console.log(`     - ${p.name} (${p.filledSections}/${p.totalSections} seções)`));
  }

  // ── Q5-Q8: Agents Read ────────────────────────────────────

  console.log('\n## AGENTES — Read Protocol\n');

  const agentsWithRead = agents.filter(a => a.readProtocol);
  const q5 = agentsWithRead.length === agents.length;

  console.log(`Q5. Todos agentes têm Read Protocol?  ${q5 ? 'PASS' : 'FAIL'} (${agentsWithRead.length}/${agents.length})`);
  console.log(`Q6. Stack sem perguntar?               (validação manual — rode teste com @dev)`);
  console.log(`Q7. Regras de Ouro respeitadas?        (validação manual)`);
  console.log(`Q8. Feedback respeitado?                (validação manual)`);

  const agentsMissingRead = agents.filter(a => !a.readProtocol);
  if (agentsMissingRead.length > 0) {
    console.log(`\n   Sem Read Protocol:`);
    agentsMissingRead.forEach(a => console.log(`     - ${a.agent}`));
  }

  // ── Q9-Q11: Agents Write ──────────────────────────────────

  console.log('\n## AGENTES — Write Protocol\n');

  const agentsWithWrite = agents.filter(a => a.writeProtocol);
  const q9 = agentsWithWrite.length === agents.length;

  console.log(`Q9.  Todos agentes têm Write Protocol?  ${q9 ? 'PASS' : 'FAIL'} (${agentsWithWrite.length}/${agents.length})`);
  console.log(`Q10. Avisa ao gravar feedback?           (validação manual)`);
  console.log(`Q11. Atualiza project-context.md?        (validação manual)`);

  const agentsMissingWrite = agents.filter(a => !a.writeProtocol);
  if (agentsMissingWrite.length > 0) {
    console.log(`\n   Sem Write Protocol:`);
    agentsMissingWrite.forEach(a => console.log(`     - ${a.agent}`));
  }

  // ── Q12-Q13: Checkpoints ──────────────────────────────────

  console.log('\n## CHECKPOINTS\n');

  const q12 = rules.exists && rules.sections.checkpoints;
  console.log(`Q12. Checkpoints definidos na rule?  ${q12 ? 'PASS' : 'FAIL'}`);
  console.log(`Q13. Feedback em checkpoint?          (validação manual)`);

  // ── Q14-Q15: Auto-Load ────────────────────────────────────

  console.log('\n## AUTO-LOAD\n');

  console.log(`Q14. Hook memory-autoload.cjs existe?      ${hooks.hookExists ? 'PASS' : 'FAIL'}`);
  console.log(`     Registrado em settings.json?          ${hooks.hookRegistered ? 'PASS' : 'FAIL'}`);
  console.log(`Q15. /checkpoint atualiza memory?           ${checkpoint.hasMemoryStep ? 'PASS' : 'FAIL'}`);

  // ── Q19: HYBRID Rules ─────────────────────────────────────

  console.log('\n## HYBRID RULES (squads funcionam em projetos externos)\n');

  const q19 = hybridRules.total === 0 || hybridRules.withRule === hybridRules.total;
  console.log(`Q19. HYBRID têm memory-protocol.md?  ${q19 ? 'PASS' : 'FAIL'} (${hybridRules.withRule}/${hybridRules.total})`);
  if (hybridRules.missing.length > 0) {
    console.log(`\n   Sem memory-protocol.md:`);
    hybridRules.missing.forEach(m => console.log(`     - ${m}`));
  }

  // ── Q16-Q18: Manutenção ───────────────────────────────────

  console.log('\n## MANUTENÇÃO\n');

  console.log(`Q16. audit-project-memory.js existe?        ${tools.auditTool ? 'PASS' : 'FAIL'}`);
  console.log(`     bootstrap-project-memory.js existe?    ${tools.bootstrapTool ? 'PASS' : 'FAIL'}`);
  console.log(`Q17. cleanup-old-feedback.js existe?        ${tools.cleanupTool ? 'PASS' : 'FAIL'}`);
  console.log(`Q18. /new-project cria memory/?             ${newProject.hasMemoryStep ? 'PASS' : 'FAIL'}`);

  // ── Rules Health ──────────────────────────────────────────

  console.log('\n## RULES\n');

  console.log(`memory-protocol.md existe?     ${rules.exists ? 'PASS' : 'FAIL'}`);
  if (rules.exists) {
    console.log(`  Read Protocol section?       ${rules.sections.readProtocol ? 'PASS' : 'FAIL'}`);
    console.log(`  Write Protocol section?      ${rules.sections.writeProtocol ? 'PASS' : 'FAIL'}`);
    console.log(`  Checkpoints section?         ${rules.sections.checkpoints ? 'PASS' : 'FAIL'}`);
  }

  // ── SUMMARY ───────────────────────────────────────────────

  const autoChecks = [
    q1, q4, q5, q9, q12, q19,
    hooks.hookExists, hooks.hookRegistered,
    checkpoint.hasMemoryStep,
    tools.auditTool, tools.bootstrapTool, tools.cleanupTool,
    newProject.hasMemoryStep,
    rules.exists,
    rules.sections.readProtocol, rules.sections.writeProtocol, rules.sections.checkpoints
  ];

  const passed = autoChecks.filter(Boolean).length;
  const total = autoChecks.length;
  const warnings = [!q2, !q3].filter(Boolean).length;
  const manualChecks = 5; // Q6, Q7, Q8, Q10, Q11, Q13

  console.log('\n' + '='.repeat(60));
  console.log(`\nRESULTADO: ${passed}/${total} checks automáticos PASS`);
  if (warnings > 0) console.log(`WARNINGS: ${warnings} (conteúdo vazio / sem feedback — não é erro, é falta de uso)`);
  console.log(`MANUAL: ${manualChecks} checks precisam de validação manual (comportamento de agentes)`);

  const score = Math.round((passed / total) * 100);
  const emoji = score === 100 ? '🟢' : score >= 80 ? '🟡' : '🔴';
  console.log(`\n${emoji} HEALTH SCORE: ${score}%`);

  // Project detail table
  console.log('\n## DETALHE POR PROJETO\n');
  console.log('| Projeto | Modo | context | preenchido | feedback | Score |');
  console.log('|---------|------|---------|------------|----------|-------|');
  for (const p of projectResults) {
    const pScore = (p.contextExists ? 1 : 0) + (p.contextFilled ? 1 : 0) + (p.feedbackCount > 0 ? 1 : 0);
    const pEmoji = pScore === 3 ? '🟢' : pScore >= 1 ? '🟡' : '🔴';
    console.log(`| ${p.name.slice(0, 30).padEnd(30)} | ${p.mode.slice(0, 4)} | ${p.contextExists ? '✅' : '❌'} | ${p.contextFilled ? '✅' : '—'} | ${p.feedbackCount > 0 ? `✅(${p.feedbackCount})` : '—'} | ${pEmoji} ${pScore}/3 |`);
  }

  // ── SAVE REPORT ────────────────────────────────────────────

  const today = new Date().toISOString().split('T')[0];
  const reportPath = path.join(AIOS_CORE, 'docs', 'reports', `memory-audit-${today}.md`);
  const filledCount = projectResults.filter(p => p.contextFilled).length;
  const feedbackCount = projectResults.filter(p => p.feedbackCount > 0).length;

  let report = `# Memory Audit — ${today}\n\n`;
  report += `**Health Score:** ${emoji} ${score}%\n`;
  report += `**Checks automáticos:** ${passed}/${total} PASS\n`;
  report += `**Projetos:** ${projects.length} total | ${q1Pass} com context | ${filledCount} preenchidos | ${feedbackCount} com feedback\n`;
  report += `**Agentes:** ${agentsWithRead.length}/${agents.length} Read | ${agentsWithWrite.length}/${agents.length} Write\n\n`;

  report += '## Checks\n\n';
  report += '| # | Pergunta | Status |\n';
  report += '|---|----------|--------|\n';
  report += `| Q1 | project-context.md existe em todos? | ${q1 ? 'PASS' : 'FAIL'} (${q1Pass}/${q1Total}) |\n`;
  report += `| Q2 | Contexto preenchido (real)? | ${q2 ? 'PASS' : 'WARN'} (${q2Pass}/${q1Total}) |\n`;
  report += `| Q3 | feedback/ com arquivos reais? | ${q3 ? 'PASS' : 'WARN'} (${q3Pass}/${q1Total}) |\n`;
  report += `| Q4 | User profile global? | ${q4 ? 'PASS' : 'FAIL'} |\n`;
  report += `| Q5 | Agentes com Read Protocol? | ${q5 ? 'PASS' : 'FAIL'} (${agentsWithRead.length}/${agents.length}) |\n`;
  report += `| Q6-Q8 | Comportamento de leitura | Manual |\n`;
  report += `| Q9 | Agentes com Write Protocol? | ${q9 ? 'PASS' : 'FAIL'} (${agentsWithWrite.length}/${agents.length}) |\n`;
  report += `| Q10-Q11 | Comportamento de gravação | Manual |\n`;
  report += `| Q12 | Checkpoints na rule? | ${q12 ? 'PASS' : 'FAIL'} |\n`;
  report += `| Q13 | Feedback em checkpoint? | Manual |\n`;
  report += `| Q14 | Hook auto-load? | ${hooks.hookExists && hooks.hookRegistered ? 'PASS' : 'FAIL'} |\n`;
  report += `| Q15 | /checkpoint atualiza memory? | ${checkpoint.hasMemoryStep ? 'PASS' : 'FAIL'} |\n`;
  report += `| Q16 | Tools existem? | ${tools.auditTool && tools.bootstrapTool ? 'PASS' : 'FAIL'} |\n`;
  report += `| Q17 | cleanup-old-feedback existe? | ${tools.cleanupTool ? 'PASS' : 'FAIL'} |\n`;
  report += `| Q18 | /new-project cria memory/? | ${newProject.hasMemoryStep ? 'PASS' : 'FAIL'} |\n`;

  report += '\n## Projetos\n\n';
  report += '| Projeto | Modo | context | preenchido | feedback | Score |\n';
  report += '|---------|------|---------|------------|----------|-------|\n';
  for (const p of projectResults) {
    const pScore = (p.contextExists ? 1 : 0) + (p.contextFilled ? 1 : 0) + (p.feedbackCount > 0 ? 1 : 0);
    const pEmoji = pScore === 3 ? '🟢' : pScore >= 1 ? '🟡' : '🔴';
    report += `| ${p.name} | ${p.mode.slice(0, 4)} | ${p.contextExists ? '✅' : '❌'} | ${p.contextFilled ? '✅' : '—'} | ${p.feedbackCount > 0 ? `✅(${p.feedbackCount})` : '—'} | ${pEmoji} ${pScore}/3 |\n`;
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
  console.log(`\nRelatório salvo: ${reportPath}`);

  if (jsonOutput) {
    const data = {
      score,
      passed,
      total,
      warnings,
      projects: projectResults,
      agents,
      rules,
      hooks,
      tools,
      newProject,
      checkpoint,
      userProfileExists
    };
    console.log('\n--- JSON ---');
    console.log(JSON.stringify(data, null, 2));
  }

  process.exit(score === 100 ? 0 : 1);
}

main();
