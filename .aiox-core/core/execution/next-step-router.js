#!/usr/bin/env node

/**
 * Next Step Router
 *
 * Após a execução de qualquer comando, determina e exibe o próximo passo.
 * Lê o Execution Contract e o resultado da execução para rotear.
 *
 * Lógica de roteamento:
 * 1. Se o contrato tem next_step → usa diretamente
 * 2. Se tem handoffs condicionais → avalia condições vs resultado
 * 3. Se a fase atual pertence a um workflow maior → mostra fase seguinte
 * 4. Se nada definido → sugere validação (*validate-*)
 *
 * @module next-step-router
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

let chalk;
try { chalk = require('chalk'); } catch {
  chalk = {
    green: s => s, red: s => s, yellow: s => s, cyan: s => s,
    gray: s => s, bold: s => s, dim: s => s, white: s => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           NEXT STEP ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

class NextStepRouter {

  /**
   * Determina o próximo passo baseado no contrato e resultado
   *
   * @param {ExecutionContract} contract
   * @param {ComplianceReport} report
   * @returns {Object} nextStep { command, agent, context, reason }
   */
  static route(contract, report) {

    // Regra 1: Se report FAIL e há gaps críticos → sugere corrigir gaps
    if (report.status === 'FAIL' && report.gaps.length > 0) {
      const criticalGap = report.gaps[0];
      return {
        command: null,
        agent: null,
        context: `Corrigir gap: "${criticalGap.phase}"`,
        reason: 'COMPLIANCE_FAIL',
        urgency: 'HIGH',
        suggestion: `Re-executar com foco em: ${criticalGap.phase}`,
      };
    }

    // Regra 2: Se contrato tem next_step explícito → usar
    if (contract.nextStep && contract.nextStep.command) {
      return {
        ...contract.nextStep,
        reason: 'CONTRACT_DEFINED',
        urgency: 'NORMAL',
        suggestion: `Executar: ${contract.nextStep.command}`,
      };
    }

    // Regra 3: Se tem handoffs condicionais → avaliar
    if (contract.handoffs.length > 0) {
      // Por padrão, pegar o primeiro handoff aplicável
      const handoff = contract.handoffs[0];
      return {
        command: null,
        agent: handoff.to,
        context: handoff.context,
        reason: 'HANDOFF_CONDITIONAL',
        urgency: 'NORMAL',
        suggestion: `Ativar agente: ${handoff.to} — ${handoff.when}`,
      };
    }

    // Regra 4: Se execução OK mas sem next_step → sugerir validação
    if (report.status === 'PASS') {
      return {
        command: `*validate-${contract.squad}`,
        agent: null,
        context: 'Execução completa, validação recomendada',
        reason: 'DEFAULT_VALIDATION',
        urgency: 'LOW',
        suggestion: `Validar output com: *validate-${contract.squad}`,
      };
    }

    // Regra 5: Fallback
    return {
      command: null,
      agent: null,
      context: 'Sem próximo passo definido no workflow',
      reason: 'NO_ROUTE',
      urgency: 'INFO',
      suggestion: 'Verificar workflow para definir next_step',
    };
  }

  /**
   * Formata próximo passo para terminal
   */
  static toTerminal(nextStep) {
    const lines = [];
    const bar = '━'.repeat(55);

    lines.push('');
    lines.push(chalk.cyan(bar));
    lines.push(chalk.cyan('▶ PRÓXIMO PASSO'));
    lines.push(chalk.cyan(bar));

    if (nextStep.urgency === 'HIGH') {
      lines.push(chalk.red(`⚠ ${nextStep.suggestion}`));
    } else {
      lines.push(chalk.bold(nextStep.suggestion));
    }

    if (nextStep.command) {
      lines.push(chalk.green(`  Comando: ${nextStep.command}`));
    }
    if (nextStep.agent) {
      lines.push(`  Agente: ${nextStep.agent}`);
    }
    if (nextStep.context) {
      lines.push(chalk.gray(`  Contexto: ${nextStep.context}`));
    }
    lines.push(chalk.dim(`  Motivo: ${nextStep.reason}`));
    lines.push(chalk.cyan(bar));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Gera bloco markdown do próximo passo
   */
  static toMarkdown(nextStep) {
    const lines = [];
    lines.push('## ▶ Próximo Passo');
    lines.push('');
    lines.push(`**Sugestão:** ${nextStep.suggestion}`);
    if (nextStep.command) lines.push(`**Comando:** \`${nextStep.command}\``);
    if (nextStep.agent) lines.push(`**Agente:** ${nextStep.agent}`);
    if (nextStep.context) lines.push(`**Contexto:** ${nextStep.context}`);
    lines.push(`**Motivo:** ${nextStep.reason}`);
    lines.push(`**Urgência:** ${nextStep.urgency}`);
    lines.push('');
    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                         WORKFLOW POSITION TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quando um comando faz parte de um workflow maior,
 * mostra a posição atual no workflow completo.
 */
class WorkflowPositionTracker {

  /**
   * Encontra workflows que referenciam a task/comando
   *
   * @param {string} taskName - Nome da task executada
   * @param {string} squadPath - Path do squad
   * @returns {Object|null} { workflow, currentPhase, totalPhases, nextPhase }
   */
  static findPosition(taskName, squadPath) {
    const workflowsDir = path.join(squadPath, 'workflows');
    if (!fs.existsSync(workflowsDir)) return null;

    let yaml;
    try { yaml = require('js-yaml'); } catch { return null; }

    const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
        const wf = yaml.load(content);
        if (!wf || !wf.phases) continue;

        // Procurar a task nas fases
        for (let i = 0; i < wf.phases.length; i++) {
          const phase = wf.phases[i];
          const tasks = phase.tasks || [];
          const taskFound = tasks.some(t => {
            const tName = typeof t === 'string' ? t : (t.name || t.task || '');
            return tName.includes(taskName) || taskName.includes(tName.replace('.md', ''));
          });

          if (taskFound) {
            const nextPhase = i + 1 < wf.phases.length ? wf.phases[i + 1] : null;
            return {
              workflow: wf.name || file,
              workflowFile: file,
              currentPhase: {
                index: i,
                name: phase.name || `Phase ${i}`,
                id: phase.id || `PHASE_${i}`,
              },
              totalPhases: wf.phases.length,
              nextPhase: nextPhase ? {
                index: i + 1,
                name: nextPhase.name || `Phase ${i + 1}`,
                id: nextPhase.id || `PHASE_${i + 1}`,
                tasks: (nextPhase.tasks || []).map(t =>
                  typeof t === 'string' ? t : (t.name || t.task || '')
                ),
              } : null,
              progress: `${i + 1}/${wf.phases.length}`,
            };
          }
        }
      } catch { continue; }
    }

    return null;
  }

  /**
   * Formata posição no workflow para terminal
   */
  static toTerminal(position) {
    if (!position) return '';

    const lines = [];
    lines.push('');
    lines.push(chalk.dim(`📍 Posição no workflow: ${position.workflow}`));
    lines.push(chalk.dim(`   Fase ${position.progress}: ${position.currentPhase.name}`));

    if (position.nextPhase) {
      lines.push(chalk.cyan(`   → Próxima fase: ${position.nextPhase.name}`));
      if (position.nextPhase.tasks.length > 0) {
        lines.push(chalk.gray(`     Tasks: ${position.nextPhase.tasks.join(', ')}`));
      }
    } else {
      lines.push(chalk.green(`   ✅ Última fase do workflow`));
    }

    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { NextStepRouter, WorkflowPositionTracker };
