#!/usr/bin/env node

/**
 * Ecosystem Audit — Complete AIOS Audit
 *
 * Audits 6 dimensions: Projects, Squads, Agents, Skills, Minds, Tools
 * Generates comprehensive report with scoring and action items.
 *
 * Usage:
 *   node tools/ecosystem-audit.js
 *   node tools/ecosystem-audit.js --scope=squads
 *   node tools/ecosystem-audit.js --fix
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const REPORT_DIR = path.join(AIOS_CORE, 'docs/reports');

// ============================================================================
// DIMENSION 1: PROJECTS
// ============================================================================

function auditProjects() {
  console.log('\n[1/6] Auditando Projects...');

  try {
    const projectAudit = require('./audit-project-configs.js');
    const parsed = projectAudit.parseActiveProjects();
    const projects = parsed.projects || parsed; // Support both old and new format
    const results = projects.map(proj => projectAudit.validateClaudeConfig(proj));

  const ok = results.filter(r => r.ok).length;
  const total = projects.length;
  const score = total > 0 ? (ok / total * 10).toFixed(1) : 0;

  const issues = [];
  results.forEach((result, i) => {
    if (!result.ok) {
      const proj = projects[i];
      result.issues.forEach(issue => {
        const message = issue.message || issue; // Support both old and new format
        const severity = issue.severity || 'MEDIUM';

        const priorityMap = {
          'CRITICAL': 'P0',
          'HIGH': 'P1',
          'MEDIUM': 'P2',
          'LOW': 'P2'
        };

        issues.push({
          priority: priorityMap[severity] || 'P2',
          dimension: 'Projects',
          project: proj.name,
          description: message,
          fix: message.includes('MISSING') ? 'Run /new-project to create config' : 'Update config files',
          effort: '0.5h'
        });
      });
    }
  });

    console.log(`   ✅ ${ok}/${total} projetos OK (Score: ${score}/10)`);

    return {
      dimension: 'Projects',
      score: parseFloat(score),
      total,
      ok,
      status: score >= 9.0 ? 'EXCELLENT' : score >= 7.0 ? 'APPROVED' : 'NEEDS_WORK',
      issues
    };
  } catch (error) {
    console.log(`   ❌ Erro ao auditar projetos: ${error.message}`);
    return {
      dimension: 'Projects',
      score: 0,
      total: 0,
      ok: 0,
      status: 'ERROR',
      issues: [{
        priority: 'P0',
        dimension: 'Projects',
        project: 'audit-project-configs.js',
        description: `Error: ${error.message}`,
        fix: 'Fix audit-project-configs.js module',
        effort: '1h'
      }]
    };
  }
}

// ============================================================================
// DIMENSION 2: SQUADS
// ============================================================================

function auditSquads() {
  console.log('\n[2/6] Auditando Squads...');

  const squadsDir = path.join(AIOS_CORE, 'squads');
  const squads = fs.readdirSync(squadsDir)
    .filter(name => {
      const squadPath = path.join(squadsDir, name);
      return fs.statSync(squadPath).isDirectory();
    });

  const results = squads.map(name => {
    const squadPath = path.join(squadsDir, name);
    const readmePath = path.join(squadPath, 'README.md');
    const agentsPath = path.join(squadPath, 'agents');
    const tasksPath = path.join(squadPath, 'tasks');
    const workflowsPath = path.join(squadPath, 'workflows');

    let readmeScore = 0;
    let agentsScore = 0;
    let tasksScore = 0;
    let workflowsScore = 0;

    const squadIssues = [];

    // README check (30%)
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      if (content.length > 500) {
        readmeScore = 30;
      } else {
        readmeScore = 15;
        squadIssues.push({
          priority: 'P2',
          dimension: 'Squads',
          project: name,
          description: 'README.md too short (< 500 chars)',
          fix: 'Expand README with usage, capabilities, and examples',
          effort: '1h'
        });
      }
    } else {
      squadIssues.push({
        priority: 'P1',
        dimension: 'Squads',
        project: name,
        description: 'Missing README.md',
        fix: 'Create README with squad overview',
        effort: '1h'
      });
    }

    // Agents check (30%)
    if (fs.existsSync(agentsPath)) {
      const agentFiles = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));
      if (agentFiles.length > 0) {
        agentsScore = 30;
      } else {
        agentsScore = 15;
        squadIssues.push({
          priority: 'P2',
          dimension: 'Squads',
          project: name,
          description: 'agents/ directory empty',
          fix: 'Add agent definitions',
          effort: '2h'
        });
      }
    } else {
      squadIssues.push({
        priority: 'P2',
        dimension: 'Squads',
        project: name,
        description: 'Missing agents/ directory',
        fix: 'Create agents/ and add agent definitions',
        effort: '2h'
      });
    }

    // Tasks check (25%)
    if (fs.existsSync(tasksPath)) {
      const taskFiles = fs.readdirSync(tasksPath).filter(f => f.endsWith('.md'));
      if (taskFiles.length > 0) {
        tasksScore = 25;
      } else {
        tasksScore = 12;
      }
    }

    // Workflows check (15%)
    if (fs.existsSync(workflowsPath)) {
      const workflowFiles = fs.readdirSync(workflowsPath).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      if (workflowFiles.length > 0) {
        workflowsScore = 15;
      } else {
        workflowsScore = 7;
      }
    }

    const totalScore = readmeScore + agentsScore + tasksScore + workflowsScore;

    return {
      name,
      score: totalScore / 10,
      issues: squadIssues
    };
  });

  const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1);
  const allIssues = results.flatMap(r => r.issues);

  console.log(`   ✅ ${squads.length} squads (Score médio: ${avgScore}/10)`);

  return {
    dimension: 'Squads',
    score: parseFloat(avgScore),
    total: squads.length,
    ok: results.filter(r => r.score >= 8.0).length,
    status: avgScore >= 9.0 ? 'EXCELLENT' : avgScore >= 7.0 ? 'APPROVED' : 'NEEDS_WORK',
    issues: allIssues
  };
}

// ============================================================================
// DIMENSION 3: AGENTS
// ============================================================================

function auditAgents() {
  console.log('\n[3/6] Auditando Agents...');

  const agentsDir = path.join(AIOS_CORE, '.aios-core/development/agents');
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

  const results = agentFiles.map(file => {
    const filePath = path.join(agentsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const agentIssues = [];

    // Check for identity: frontmatter OR H1 title OR ## Role/Mission section
    const hasFrontmatter = content.startsWith('---');
    const hasH1Title = /^# .+/m.test(content);
    const hasRoleSection = /## (Role|Mission|Identity|Persona)/i.test(content);
    const hasIdentity = hasFrontmatter || hasH1Title || hasRoleSection;

    if (!hasIdentity) {
      agentIssues.push({
        priority: 'P2',
        dimension: 'Agents',
        project: file,
        description: 'Missing agent identity (no frontmatter, title, or role section)',
        fix: 'Add YAML frontmatter or ## Role section',
        effort: '0.5h'
      });
    }

    // Check for purpose: router, commands, capabilities, or substantial content
    const hasPurpose = content.includes('Task Router')
      || content.includes('Mission Router')
      || content.includes('## Commands')
      || content.includes('## Capabilities')
      || content.includes('## Scope')
      || content.includes('## Responsibilities')
      || content.includes('*help')
      || content.length > 500;

    if (!hasPurpose) {
      agentIssues.push({
        priority: 'P2',
        dimension: 'Agents',
        project: file,
        description: 'Agent file too thin (no router, commands, or substantial content)',
        fix: 'Add capabilities, commands, or task router',
        effort: '1h'
      });
    }

    const valid = hasIdentity && hasPurpose;

    return { file, valid, issues: agentIssues };
  });

  const ok = results.filter(r => r.valid).length;
  const total = agentFiles.length;
  const score = total > 0 ? (ok / total * 10).toFixed(1) : 0;
  const allIssues = results.flatMap(r => r.issues);

  console.log(`   ✅ ${ok}/${total} agents válidos (Score: ${score}/10)`);

  return {
    dimension: 'Agents',
    score: parseFloat(score),
    total,
    ok,
    status: score >= 9.0 ? 'EXCELLENT' : score >= 7.0 ? 'APPROVED' : 'NEEDS_WORK',
    issues: allIssues
  };
}

// ============================================================================
// DIMENSION 4: SKILLS
// ============================================================================

function auditSkills() {
  console.log('\n[4/6] Auditando Skills...');

  const skillsDir = path.join(AIOS_CORE, '.aios/skills');
  const skills = fs.readdirSync(skillsDir)
    .filter(name => {
      const skillPath = path.join(skillsDir, name);
      return fs.statSync(skillPath).isDirectory();
    });

  const results = skills.map(name => {
    const skillPath = path.join(skillsDir, name);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const readmePath = path.join(skillPath, 'README.md');

    const skillIssues = [];

    // SKILL.md is the standard (README.md is supplementary, not a substitute)
    const hasSkillMd = fs.existsSync(skillMdPath);
    const hasReadme = fs.existsSync(readmePath);

    if (!hasSkillMd) {
      skillIssues.push({
        priority: hasReadme ? 'P2' : 'P1',
        dimension: 'Skills',
        project: name,
        description: hasReadme ? 'Missing SKILL.md (has README.md but standard is SKILL.md)' : 'Missing SKILL.md',
        fix: 'Create SKILL.md with usage and implementation',
        effort: '1h'
      });
      if (!hasReadme) return { name, valid: false, issues: skillIssues };
    }

    // Read primary doc (SKILL.md preferred, fallback README.md)
    const docPath = hasSkillMd ? skillMdPath : readmePath;
    const content = fs.readFileSync(docPath, 'utf8');

    // Check for usage info (flexible: many equivalent section names)
    const hasUsage = /## (Usage|Uso|Quick Start|How|Como|Getting Started|Ativação|Activate)/i.test(content)
      || content.includes('/') && content.includes('```');

    // Check for description of what it does (flexible)
    const hasDescription = /## (Implementation|Implementação|Architecture|Arquitetura|How it Works|Como Funciona|Overview|O que|What|Pipeline|Workflow)/i.test(content)
      || content.length > 1000;

    if (!hasUsage && !hasDescription) {
      skillIssues.push({
        priority: 'P2',
        dimension: 'Skills',
        project: name,
        description: 'Documentation too thin (no usage or description sections)',
        fix: 'Add Usage and description sections',
        effort: '0.5h'
      });
    }

    const valid = hasSkillMd && (hasUsage || hasDescription);

    return { name, valid, issues: skillIssues };
  });

  const ok = results.filter(r => r.valid).length;
  const total = skills.length;
  const score = total > 0 ? (ok / total * 10).toFixed(1) : 0;
  const allIssues = results.flatMap(r => r.issues);

  console.log(`   ✅ ${ok}/${total} skills válidos (Score: ${score}/10)`);

  return {
    dimension: 'Skills',
    score: parseFloat(score),
    total,
    ok,
    status: score >= 9.0 ? 'EXCELLENT' : score >= 7.0 ? 'APPROVED' : 'NEEDS_WORK',
    issues: allIssues
  };
}

// ============================================================================
// DIMENSION 5: MINDS
// ============================================================================

function auditMinds() {
  console.log('\n[5/6] Auditando Minds...');

  const mindsDir = path.join(AIOS_CORE, 'squads/mind-cloning/minds');
  const minds = fs.readdirSync(mindsDir)
    .filter(name => {
      const mindPath = path.join(mindsDir, name);
      return fs.statSync(mindPath).isDirectory() && name !== '.DS_Store';
    });

  const results = minds.map(name => {
    const mindPath = path.join(mindsDir, name);
    const sourcesPath = path.join(mindPath, 'sources');
    const outputsPath = path.join(mindPath, 'outputs');
    const readmePath = path.join(mindPath, 'README.md');

    const mindIssues = [];

    let status = 'sources-only';
    let score = 2;

    if (fs.existsSync(sourcesPath)) {
      if (fs.existsSync(outputsPath)) {
        const outputs = fs.readdirSync(outputsPath);
        const hasDNA = outputs.some(f => f.includes('dna') && f.endsWith('.yaml'));

        if (hasDNA) {
          // Check completeness
          const hasVoice = outputs.some(f => f.includes('voice'));
          const hasThinking = outputs.some(f => f.includes('thinking'));

          if (hasVoice && hasThinking) {
            status = 'complete';
            score = 10;
          } else {
            status = 'partial';
            score = 5;
            mindIssues.push({
              priority: 'P2',
              dimension: 'Minds',
              project: name,
              description: 'Partial DNA (missing voice or thinking)',
              fix: 'Complete DNA extraction',
              effort: '3h'
            });
          }
        } else {
          mindIssues.push({
            priority: 'P2',
            dimension: 'Minds',
            project: name,
            description: 'outputs/ exists but no DNA files',
            fix: 'Extract DNA from sources',
            effort: '4h'
          });
        }
      } else {
        mindIssues.push({
          priority: 'P1',
          dimension: 'Minds',
          project: name,
          description: 'Missing outputs/ directory',
          fix: 'Create outputs/ and extract DNA',
          effort: '4h'
        });
      }
    } else {
      mindIssues.push({
        priority: 'P0',
        dimension: 'Minds',
        project: name,
        description: 'Missing sources/ directory',
        fix: 'Add sources or remove mind directory',
        effort: '0.5h'
      });
      score = 0;
    }

    return { name, status, score, issues: mindIssues };
  });

  const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1);
  const complete = results.filter(r => r.status === 'complete').length;
  const allIssues = results.flatMap(r => r.issues);

  console.log(`   ✅ ${complete}/${minds.length} minds completos (Score médio: ${avgScore}/10)`);

  return {
    dimension: 'Minds',
    score: parseFloat(avgScore),
    total: minds.length,
    ok: complete,
    status: avgScore >= 9.0 ? 'EXCELLENT' : avgScore >= 7.0 ? 'APPROVED' : 'NEEDS_WORK',
    issues: allIssues
  };
}

// ============================================================================
// DIMENSION 6: TOOLS
// ============================================================================

function auditTools() {
  console.log('\n[6/6] Auditando Tools...');

  const toolsDir = path.join(AIOS_CORE, 'tools');
  const tools = fs.readdirSync(toolsDir)
    .filter(name => name.endsWith('.js') || name.endsWith('.sh'));

  const results = tools.map(name => {
    const toolPath = path.join(toolsDir, name);
    const content = fs.readFileSync(toolPath, 'utf8');
    const stats = fs.statSync(toolPath);

    const toolIssues = [];

    // Check executable
    const isExecutable = (stats.mode & 0o111) !== 0;
    if (!isExecutable) {
      toolIssues.push({
        priority: 'P2',
        dimension: 'Tools',
        project: name,
        description: 'Not executable (missing chmod +x)',
        fix: `Run: chmod +x tools/${name}`,
        effort: '0.1h'
      });
    }

    // Check header comment (accept Usage:, @description, JSDoc, or any substantial header)
    const hasHeader = content.includes('Usage:')
      || content.includes('usage:')
      || content.includes('@description')
      || content.includes('@param')
      || /^\/\*\*[\s\S]*?\*\//m.test(content); // JSDoc block
    if (!hasHeader) {
      toolIssues.push({
        priority: 'P2',
        dimension: 'Tools',
        project: name,
        description: 'Missing header comment (Usage/JSDoc)',
        fix: 'Add header comment with usage instructions',
        effort: '0.25h'
      });
    }

    const valid = isExecutable && hasHeader;

    return { name, valid, issues: toolIssues };
  });

  const ok = results.filter(r => r.valid).length;
  const total = tools.length;
  const score = total > 0 ? (ok / total * 10).toFixed(1) : 0;
  const allIssues = results.flatMap(r => r.issues);

  console.log(`   ✅ ${ok}/${total} tools válidos (Score: ${score}/10)`);

  return {
    dimension: 'Tools',
    score: parseFloat(score),
    total,
    ok,
    status: score >= 9.0 ? 'EXCELLENT' : score >= 7.0 ? 'APPROVED' : 'NEEDS_WORK',
    issues: allIssues
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport(results) {
  const date = new Date().toISOString().split('T')[0];
  const globalScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1);
  const allIssues = results.flatMap(r => r.issues);

  const p0 = allIssues.filter(i => i.priority === 'P0');
  const p1 = allIssues.filter(i => i.priority === 'P1');
  const p2 = allIssues.filter(i => i.priority === 'P2');

  let report = `# Ecosystem Audit Report\n\n`;
  report += `**Data:** ${date}\n`;
  report += `**Score Global:** ${globalScore}/10\n\n`;

  // Summary table
  report += `## 📊 Resumo por Dimensão\n\n`;
  report += `| Dimensão | Score | Status | Issues |\n`;
  report += `|----------|-------|--------|--------|\n`;
  results.forEach(r => {
    const emoji = r.status === 'EXCELLENT' ? '✅' : r.status === 'APPROVED' ? '✅' : '⚠️';
    report += `| ${r.dimension} | ${r.score}/10 | ${emoji} ${r.status} | ${r.issues.length} |\n`;
  });
  report += `\n`;

  // Action items
  report += `## 🚨 Action Items (${allIssues.length} total)\n\n`;

  if (p0.length > 0) {
    report += `### P0 (CRÍTICO) — ${p0.length} items\n\n`;
    p0.forEach((item, i) => {
      report += `${i + 1}. **${item.dimension} / ${item.project}:** ${item.description}\n`;
      report += `   - **Fix:** ${item.fix}\n`;
      report += `   - **Esforço:** ${item.effort}\n\n`;
    });
  }

  if (p1.length > 0) {
    report += `### P1 (ALTO) — ${p1.length} items\n\n`;
    p1.forEach((item, i) => {
      report += `${i + 1}. **${item.dimension} / ${item.project}:** ${item.description}\n`;
      report += `   - **Fix:** ${item.fix}\n`;
      report += `   - **Esforço:** ${item.effort}\n\n`;
    });
  }

  if (p2.length > 0) {
    report += `### P2 (MÉDIO) — ${p2.length} items\n\n`;
    p2.forEach((item, i) => {
      report += `${i + 1}. **${item.dimension} / ${item.project}:** ${item.description}\n`;
      report += `   - **Fix:** ${item.fix}\n`;
      report += `   - **Esforço:** ${item.effort}\n\n`;
    });
  }

  // Detailed breakdown
  report += `## 📋 Detalhamento por Dimensão\n\n`;
  results.forEach(r => {
    report += `### ${r.dimension}\n\n`;
    report += `- **Score:** ${r.score}/10\n`;
    report += `- **Status:** ${r.status}\n`;
    report += `- **Total:** ${r.total}\n`;
    report += `- **OK:** ${r.ok}\n`;
    report += `- **Issues:** ${r.issues.length}\n\n`;
  });

  return report;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log('🔍 Auditando ecossistema AIOS...');

  const results = [];

  // Run all audits
  results.push(auditProjects());
  results.push(auditSquads());
  results.push(auditAgents());
  results.push(auditSkills());
  results.push(auditMinds());
  results.push(auditTools());

  // Generate report
  console.log('\n📊 Gerando relatório...\n');
  const report = generateReport(results);

  // Save report
  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(REPORT_DIR, `ecosystem-audit-${date}.md`);
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(reportPath, report);

  // Print summary
  const globalScore = (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1);
  const allIssues = results.flatMap(r => r.issues);
  const p0 = allIssues.filter(i => i.priority === 'P0').length;
  const p1 = allIssues.filter(i => i.priority === 'P1').length;
  const p2 = allIssues.filter(i => i.priority === 'P2').length;

  console.log(`📊 Score Global: ${globalScore}/10\n`);
  console.log(`🚨 ${allIssues.length} action items identificados:`);
  console.log(`   ${p0} P0 (CRÍTICO)`);
  console.log(`   ${p1} P1 (ALTO)`);
  console.log(`   ${p2} P2 (MÉDIO)\n`);
  console.log(`🔗 Relatório completo: ${reportPath}\n`);

  // Suggest next steps
  console.log(`💡 Próximo passo:`);
  if (p0 > 0) {
    console.log(`   1. Review ${p0} P0 items (crítico!)`);
    console.log(`   2. Criar stories para cada P0/P1`);
  } else if (p1 > 0) {
    console.log(`   1. Review ${p1} P1 items`);
    console.log(`   2. Priorizar correções`);
  } else {
    console.log(`   ✅ Ecossistema em excelente estado!`);
    console.log(`   🔧 Considere otimizar ${p2} P2 items quando possível`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  auditProjects,
  auditSquads,
  auditAgents,
  auditSkills,
  auditMinds,
  auditTools,
  generateReport
};
