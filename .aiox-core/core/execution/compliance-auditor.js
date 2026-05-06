#!/usr/bin/env node

/**
 * Compliance Auditor
 *
 * Compara o Execution Contract (o que DEVERIA acontecer) com o que
 * realmente FOI FEITO durante a execução de um comando.
 *
 * Gera um relatório de aderência como o "Blind Spot Detection" da foto:
 * - Fases feitas vs puladas
 * - Quality gates passados vs falhados
 * - Veto conditions respeitadas
 * - Gaps sistêmicos detectados
 * - Próximo passo sugerido
 *
 * @module compliance-auditor
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

let yaml;
try { yaml = require('js-yaml'); } catch { yaml = null; }

let chalk;
try { chalk = require('chalk'); } catch {
  chalk = {
    green: s => s, red: s => s, yellow: s => s, cyan: s => s,
    gray: s => s, bold: s => s, dim: s => s, white: s => s,
    bgRed: s => s, bgGreen: s => s, bgYellow: s => s,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//                           EXECUTION RESULT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registro do que foi executado (preenchido durante/após execução)
 */
class ExecutionResult {
  constructor(contractSource) {
    this.contractSource = contractSource;
    this.startedAt = new Date().toISOString();
    this.completedAt = null;
    this.phaseResults = {};     // { PHASE_ID: { status: 'done'|'skipped'|'partial', details: '' } }
    this.gateResults = {};      // { GATE_ID: { passed: true|false, score: N, details: '' } }
    this.vetoTriggered = [];    // [{ id, reason }]
    this.outputsGenerated = []; // [{ name, path }]
    this.notes = [];            // Notas livres do executor
  }

  markPhase(phaseId, status, details = '') {
    this.phaseResults[phaseId] = { status, details, timestamp: new Date().toISOString() };
  }

  markGate(gateId, passed, score = null, details = '') {
    this.gateResults[gateId] = { passed, score, details, timestamp: new Date().toISOString() };
  }

  triggerVeto(vetoId, reason) {
    this.vetoTriggered.push({ id: vetoId, reason, timestamp: new Date().toISOString() });
  }

  addOutput(name, outputPath) {
    this.outputsGenerated.push({ name, path: outputPath });
  }

  complete() {
    this.completedAt = new Date().toISOString();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                         COMPLIANCE REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Relatório de compliance gerado pelo auditor
 */
class ComplianceReport {
  constructor(command, squad) {
    this.command = command;
    this.squad = squad;
    this.generatedAt = new Date().toISOString();
    this.adherenceScore = 0;        // 0-100%
    this.totalPhases = 0;
    this.completedPhases = 0;
    this.skippedPhases = 0;
    this.partialPhases = 0;
    this.gatesPassed = 0;
    this.gatesFailed = 0;
    this.vetosTriggered = 0;
    this.gaps = [];                  // [{ phase, issue, impact, reference }]
    this.nextStep = null;            // { command, agent, context }
    this.blindSpots = [];            // Padrões detectados
    this.status = 'unknown';        // PASS | PARTIAL | FAIL
  }

  /**
   * Formata relatório como terminal output (estilo da foto)
   */
  toTerminal() {
    const lines = [];
    const bar = '━'.repeat(55);

    lines.push('');
    lines.push(chalk.cyan(bar));
    lines.push(chalk.cyan(`📊 Compliance Report: ${this.command}`));
    lines.push(chalk.cyan(bar));
    lines.push('');

    // Score de aderência
    const scoreColor = this.adherenceScore >= 80 ? chalk.green
      : this.adherenceScore >= 60 ? chalk.yellow
      : chalk.red;
    lines.push(`Aderência: ${scoreColor(`${this.adherenceScore}%`)} (${this.completedPhases}/${this.totalPhases} completos)`);
    lines.push('');

    // Gaps detectados
    if (this.gaps.length > 0) {
      lines.push(chalk.red('❌ GAPS DETECTADOS:'));
      for (const gap of this.gaps) {
        if (gap.status === 'skipped') {
          lines.push(chalk.red(`  ✗ ${gap.phase} — NÃO EXECUTADO`));
        } else if (gap.status === 'partial') {
          lines.push(chalk.yellow(`  ⚠ ${gap.phase} — PARCIAL`));
        }
        if (gap.reference) {
          lines.push(chalk.gray(`    → Ref: ${gap.reference}`));
        }
        if (gap.impact) {
          lines.push(chalk.gray(`    → Impacto: ${gap.impact}`));
        }
      }
      lines.push('');
    }

    // Quality Gates
    if (this.gatesPassed + this.gatesFailed > 0) {
      lines.push(chalk.white('✅ QUALITY GATES:'));
      // Gates details would come from detailed report
      lines.push(chalk.green(`  ${this.gatesPassed} PASS`) +
        (this.gatesFailed > 0 ? chalk.red(` / ${this.gatesFailed} FAIL`) : ''));
      lines.push('');
    }

    // Vetos
    if (this.vetosTriggered > 0) {
      lines.push(chalk.bgRed(' ⛔ VETO TRIGGERED '));
      lines.push(chalk.red(`  ${this.vetosTriggered} veto condition(s) disparadas`));
      lines.push('');
    }

    // Próximo passo
    lines.push(chalk.cyan(bar));
    if (this.nextStep) {
      lines.push(chalk.cyan('▶ PRÓXIMO PASSO:'));
      if (this.nextStep.command) {
        lines.push(chalk.bold(`  Comando: ${this.nextStep.command}`));
      }
      if (this.nextStep.agent) {
        lines.push(`  Agente: ${this.nextStep.agent}`);
      }
      if (this.nextStep.context) {
        lines.push(chalk.gray(`  Contexto: ${this.nextStep.context}`));
      }
    } else {
      lines.push(chalk.green('✅ Execução completa. Sem próximos passos pendentes.'));
    }
    lines.push(chalk.cyan(bar));
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Formata como Markdown (para persistência em docs/sessions/)
   */
  toMarkdown() {
    const lines = [];

    lines.push(`# Compliance Report: ${this.command}`);
    lines.push('');
    lines.push(`**Squad:** ${this.squad}`);
    lines.push(`**Data:** ${this.generatedAt}`);
    lines.push(`**Status:** ${this.status}`);
    lines.push(`**Aderência:** ${this.adherenceScore}%`);
    lines.push('');

    // Resumo
    lines.push('## Resumo');
    lines.push('');
    lines.push(`| Métrica | Valor |`);
    lines.push(`|---------|-------|`);
    lines.push(`| Fases totais | ${this.totalPhases} |`);
    lines.push(`| Completas | ${this.completedPhases} |`);
    lines.push(`| Parciais | ${this.partialPhases} |`);
    lines.push(`| Puladas | ${this.skippedPhases} |`);
    lines.push(`| Gates PASS | ${this.gatesPassed} |`);
    lines.push(`| Gates FAIL | ${this.gatesFailed} |`);
    lines.push(`| Vetos disparados | ${this.vetosTriggered} |`);
    lines.push('');

    // Gaps
    if (this.gaps.length > 0) {
      lines.push('## Gaps Detectados');
      lines.push('');
      for (const gap of this.gaps) {
        const icon = gap.status === 'skipped' ? '❌' : '⚠️';
        lines.push(`### ${icon} ${gap.phase}`);
        lines.push('');
        lines.push(`- **Status:** ${gap.status}`);
        if (gap.reference) lines.push(`- **Referência:** ${gap.reference}`);
        if (gap.impact) lines.push(`- **Impacto:** ${gap.impact}`);
        lines.push('');
      }
    }

    // Próximo passo
    lines.push('## Próximo Passo');
    lines.push('');
    if (this.nextStep) {
      if (this.nextStep.command) lines.push(`**Comando:** \`${this.nextStep.command}\``);
      if (this.nextStep.agent) lines.push(`**Agente:** ${this.nextStep.agent}`);
      if (this.nextStep.context) lines.push(`**Contexto:** ${this.nextStep.context}`);
    } else {
      lines.push('Nenhum próximo passo definido.');
    }
    lines.push('');

    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                         COMPLIANCE AUDITOR
// ═══════════════════════════════════════════════════════════════════════════════

class ComplianceAuditor {

  /**
   * Audita uma execução contra seu contrato
   *
   * @param {ExecutionContract} contract - O que deveria acontecer
   * @param {ExecutionResult} result - O que realmente aconteceu
   * @returns {ComplianceReport}
   */
  static audit(contract, result) {
    const report = new ComplianceReport(contract.command, contract.squad);

    // Contar fases
    report.totalPhases = contract.phases.length;

    for (const phase of contract.phases) {
      const phaseResult = result.phaseResults[phase.id];

      if (!phaseResult || phaseResult.status === 'skipped') {
        report.skippedPhases++;
        if (phase.required) {
          report.gaps.push({
            phase: phase.name,
            status: 'skipped',
            reference: phase.checklist || null,
            impact: `Fase obrigatória "${phase.name}" não foi executada`,
          });
        }
      } else if (phaseResult.status === 'partial') {
        report.partialPhases++;
        report.gaps.push({
          phase: phase.name,
          status: 'partial',
          reference: phase.checklist || null,
          impact: phaseResult.details || `Fase "${phase.name}" executada parcialmente`,
        });
      } else if (phaseResult.status === 'done' || phaseResult.status === 'completed') {
        report.completedPhases++;
      }
    }

    // Auditar quality gates
    for (const gate of contract.qualityGates) {
      const gateResult = result.gateResults[gate.id];
      if (gateResult && gateResult.passed) {
        report.gatesPassed++;
      } else {
        report.gatesFailed++;
        if (gate.type === 'blocking') {
          report.gaps.push({
            phase: `Quality Gate: ${gate.name}`,
            status: 'failed',
            reference: null,
            impact: gateResult ? gateResult.details : 'Gate não verificado',
          });
        }
      }
    }

    // Auditar vetos
    report.vetosTriggered = result.vetoTriggered.length;

    // Calcular score de aderência
    if (report.totalPhases > 0) {
      const completed = report.completedPhases + (report.partialPhases * 0.5);
      report.adherenceScore = Math.round((completed / report.totalPhases) * 100);
    }

    // Definir status
    if (report.adherenceScore >= 90 && report.gatesFailed === 0) {
      report.status = 'PASS';
    } else if (report.adherenceScore >= 60) {
      report.status = 'PARTIAL';
    } else {
      report.status = 'FAIL';
    }

    // Copiar próximo passo do contrato
    report.nextStep = contract.nextStep;

    // Se há handoffs condicionais, escolher baseado no resultado
    if (contract.handoffs.length > 0 && !report.nextStep) {
      report.nextStep = {
        command: null,
        agent: contract.handoffs[0].to,
        context: contract.handoffs[0].context,
      };
    }

    return report;
  }

  /**
   * Audita SEM ExecutionResult — modo "post-mortem"
   * Analisa o output gerado vs o que o contrato esperava
   *
   * @param {ExecutionContract} contract
   * @param {Object} observations - { phases_observed: string[], outputs_found: string[] }
   * @returns {ComplianceReport}
   */
  static postMortem(contract, observations = {}) {
    const result = new ExecutionResult(contract.source);

    const observedPhases = observations.phases_observed || [];
    const observedOutputs = observations.outputs_found || [];

    // Marcar fases baseado nas observações
    for (const phase of contract.phases) {
      const phaseName = phase.name.toLowerCase();
      const wasObserved = observedPhases.some(op =>
        op.toLowerCase().includes(phaseName) || phaseName.includes(op.toLowerCase())
      );

      if (wasObserved) {
        result.markPhase(phase.id, 'done');
      } else {
        result.markPhase(phase.id, 'skipped');
      }
    }

    // Marcar outputs
    for (const output of observedOutputs) {
      result.addOutput(path.basename(output), output);
    }

    result.complete();
    return ComplianceAuditor.audit(contract, result);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                         BLIND SPOT DETECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analisa múltiplos ComplianceReports para detectar padrões sistêmicos.
 * Inspirado no "Copy Blind Spot Detection System" da foto.
 *
 * Detecta:
 * - Fases consistentemente puladas (>60% das execuções)
 * - Quality gates que sempre falham
 * - Workflows que nunca chegam ao final
 */
class BlindSpotDetector {

  /**
   * Analisa múltiplos relatórios de um mesmo comando/squad
   *
   * @param {ComplianceReport[]} reports - Histórico de relatórios
   * @returns {Object} blindSpotReport
   */
  static analyze(reports) {
    if (reports.length < 3) {
      return { sufficient_data: false, message: 'Mínimo 3 execuções para detectar padrões' };
    }

    const phaseSkipCounts = {};
    const phasePartialCounts = {};
    const gateFailCounts = {};
    let totalReports = reports.length;

    // Agregar dados
    for (const report of reports) {
      for (const gap of report.gaps) {
        const key = gap.phase;
        if (gap.status === 'skipped') {
          phaseSkipCounts[key] = (phaseSkipCounts[key] || 0) + 1;
        } else if (gap.status === 'partial') {
          phasePartialCounts[key] = (phasePartialCounts[key] || 0) + 1;
        } else if (gap.status === 'failed') {
          gateFailCounts[key] = (gateFailCounts[key] || 0) + 1;
        }
      }
    }

    // Detectar blind spots (>60% das vezes)
    const threshold = 0.6;
    const blindSpots = [];

    for (const [phase, count] of Object.entries(phaseSkipCounts)) {
      const rate = count / totalReports;
      if (rate >= threshold) {
        blindSpots.push({
          type: 'PHASE_CONSISTENTLY_SKIPPED',
          phase,
          rate: Math.round(rate * 100),
          occurrences: `${count}/${totalReports}`,
          severity: rate >= 0.8 ? 'CRITICAL' : 'HIGH',
          recommendation: `Tornar "${phase}" um BLOCKING gate ou remover se desnecessário`,
        });
      }
    }

    for (const [phase, count] of Object.entries(phasePartialCounts)) {
      const rate = count / totalReports;
      if (rate >= threshold) {
        blindSpots.push({
          type: 'PHASE_CONSISTENTLY_PARTIAL',
          phase,
          rate: Math.round(rate * 100),
          occurrences: `${count}/${totalReports}`,
          severity: 'MEDIUM',
          recommendation: `Simplificar ou dividir "${phase}" em sub-tarefas menores`,
        });
      }
    }

    for (const [gate, count] of Object.entries(gateFailCounts)) {
      const rate = count / totalReports;
      if (rate >= threshold) {
        blindSpots.push({
          type: 'GATE_CONSISTENTLY_FAILING',
          gate,
          rate: Math.round(rate * 100),
          occurrences: `${count}/${totalReports}`,
          severity: 'CRITICAL',
          recommendation: `Revisar critérios de "${gate}" — pode estar muito restritivo ou faltando capacitação`,
        });
      }
    }

    // Calcular score médio de aderência
    const avgAdherence = Math.round(
      reports.reduce((sum, r) => sum + r.adherenceScore, 0) / totalReports
    );

    return {
      sufficient_data: true,
      total_executions: totalReports,
      avg_adherence: avgAdherence,
      blind_spots: blindSpots,
      blind_spots_count: blindSpots.length,
      systemic_gap: blindSpots.length > 0
        ? `${blindSpots.length} gap(s) sistêmico(s) detectado(s) em ${totalReports} execuções`
        : 'Nenhum gap sistêmico detectado',
    };
  }

  /**
   * Formata blind spot report para terminal
   */
  static toTerminal(bsReport) {
    if (!bsReport.sufficient_data) {
      return chalk.gray(`\n${bsReport.message}\n`);
    }

    const lines = [];
    const bar = '━'.repeat(55);

    lines.push('');
    lines.push(chalk.cyan(bar));
    lines.push(chalk.cyan('🔍 Blind Spot Detection'));
    lines.push(chalk.cyan(bar));
    lines.push('');
    lines.push(`Execuções analisadas: ${bsReport.total_executions}`);
    lines.push(`Aderência média: ${bsReport.avg_adherence}%`);
    lines.push('');

    if (bsReport.blind_spots.length === 0) {
      lines.push(chalk.green('✅ Nenhum gap sistêmico detectado.'));
    } else {
      lines.push(chalk.red(`⚠️ ${bsReport.blind_spots_count} GAP(S) SISTÊMICO(S):`));
      lines.push('');

      for (const bs of bsReport.blind_spots) {
        const sevColor = bs.severity === 'CRITICAL' ? chalk.bgRed
          : bs.severity === 'HIGH' ? chalk.red
          : chalk.yellow;

        lines.push(sevColor(` ${bs.severity} `) + ` ${bs.phase || bs.gate}`);
        lines.push(chalk.gray(`  → ${bs.type.replace(/_/g, ' ')} em ${bs.rate}% das execuções (${bs.occurrences})`));
        lines.push(chalk.cyan(`  → Recomendação: ${bs.recommendation}`));
        lines.push('');
      }
    }

    lines.push(chalk.cyan(bar));
    return lines.join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  ExecutionResult,
  ComplianceReport,
  ComplianceAuditor,
  BlindSpotDetector,
};
