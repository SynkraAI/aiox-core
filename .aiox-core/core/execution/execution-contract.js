#!/usr/bin/env node

/**
 * Execution Contract Builder
 *
 * Lê a definição de uma task/workflow e extrai o "contrato de execução":
 * - Fases obrigatórias
 * - Quality gates
 * - Veto conditions
 * - Próximo passo (next_step / handoff_to)
 * - Checklists associadas
 *
 * Gera um execution_contract.yaml que serve de input para o Compliance Auditor.
 *
 * @module execution-contract
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Optional YAML parser
let yaml;
try {
  yaml = require('js-yaml');
} catch {
  yaml = null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXECUTION CONTRACT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estrutura do Execution Contract
 *
 * Um contrato define O QUE deveria acontecer quando um comando é executado.
 * É extraído automaticamente da task/workflow definition.
 */
class ExecutionContract {
  constructor(source) {
    this.source = source;           // Arquivo de origem (task.md ou workflow.yaml)
    this.command = '';               // Comando que disparou (*create-carousel, etc)
    this.squad = '';                 // Squad de origem
    this.phases = [];                // Fases obrigatórias [{id, name, required, checklist}]
    this.qualityGates = [];          // Quality gates [{id, name, type, criteria}]
    this.vetoConditions = [];        // Veto conditions [{id, condition, action}]
    this.nextStep = null;            // Próximo passo {command, agent, context}
    this.handoffs = [];              // Handoff options [{to, when, context}]
    this.expectedOutputs = [];       // Outputs esperados [{name, format, path}]
    this.checklists = [];            // Checklists associadas [{name, path, required}]
    this.estimatedTime = null;       // Tempo estimado
    this.createdAt = new Date().toISOString();
  }

  /**
   * Converte contrato para YAML (para persistência)
   */
  toYaml() {
    if (!yaml) return JSON.stringify(this, null, 2);
    return yaml.dump({
      execution_contract: {
        source: this.source,
        command: this.command,
        squad: this.squad,
        created_at: this.createdAt,
        phases: this.phases,
        quality_gates: this.qualityGates,
        veto_conditions: this.vetoConditions,
        next_step: this.nextStep,
        handoffs: this.handoffs,
        expected_outputs: this.expectedOutputs,
        checklists: this.checklists,
        estimated_time: this.estimatedTime,
      },
    });
  }

  /**
   * Carrega contrato de YAML
   */
  static fromYaml(content) {
    const data = yaml ? yaml.load(content) : JSON.parse(content);
    const ec = data.execution_contract || data;
    const contract = new ExecutionContract(ec.source);
    Object.assign(contract, {
      command: ec.command || '',
      squad: ec.squad || '',
      phases: ec.phases || [],
      qualityGates: ec.quality_gates || [],
      vetoConditions: ec.veto_conditions || [],
      nextStep: ec.next_step || null,
      handoffs: ec.handoffs || [],
      expectedOutputs: ec.expected_outputs || [],
      checklists: ec.checklists || [],
      estimatedTime: ec.estimated_time || null,
      createdAt: ec.created_at || new Date().toISOString(),
    });
    return contract;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                         CONTRACT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extrai um ExecutionContract de uma task (.md) ou workflow (.yaml)
 */
class ContractBuilder {

  /**
   * Build contract from a task markdown file
   * Parses YAML frontmatter + markdown sections
   */
  static fromTask(taskPath) {
    const content = fs.readFileSync(taskPath, 'utf8');
    const contract = new ExecutionContract(taskPath);

    // Extrair YAML block se existir
    const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)```/);
    let taskDef = {};
    if (yamlMatch && yaml) {
      try { taskDef = yaml.load(yamlMatch[1]) || {}; } catch { /* ignore */ }
    }

    // Extrair nome do comando
    contract.command = taskDef.task_name || path.basename(taskPath, '.md');
    contract.squad = ContractBuilder._detectSquad(taskPath);

    // Extrair fases dos action_items ou steps
    const steps = taskDef.action_items || taskDef.steps || [];
    contract.phases = steps.map((step, i) => ({
      id: `STEP_${i + 1}`,
      name: typeof step === 'string' ? step : (step.name || step.description || `Step ${i + 1}`),
      required: step.required !== false,
      status: 'pending',
      checklist: step.checklist || null,
    }));

    // Extrair quality gates
    if (taskDef.quality_gate) {
      contract.qualityGates.push({
        id: 'QG_TASK',
        name: taskDef.quality_gate.name || 'Task Quality Gate',
        type: taskDef.quality_gate.type || 'blocking',
        criteria: taskDef.quality_gate.criteria || [],
      });
    }

    // Extrair veto conditions
    if (taskDef.veto_conditions) {
      contract.vetoConditions = (Array.isArray(taskDef.veto_conditions)
        ? taskDef.veto_conditions
        : [taskDef.veto_conditions]
      ).map((v, i) => ({
        id: `VETO_${i + 1}`,
        condition: typeof v === 'string' ? v : v.condition,
        action: typeof v === 'string' ? 'HALT' : (v.action || 'HALT'),
      }));
    }

    // Extrair next step / handoff
    if (taskDef.handoff) {
      contract.nextStep = {
        command: taskDef.handoff.to || null,
        agent: null,
        context: taskDef.handoff.trigger || '',
      };
    }
    if (taskDef.handoff_to) {
      contract.handoffs = (Array.isArray(taskDef.handoff_to)
        ? taskDef.handoff_to
        : [taskDef.handoff_to]
      ).map(h => ({
        to: h.agent || h.to || '',
        when: h.when || '',
        context: h.context || '',
      }));
    }

    // Extrair next_steps ou next_action
    if (taskDef.next_steps) {
      const ns = Array.isArray(taskDef.next_steps) ? taskDef.next_steps[0] : taskDef.next_steps;
      contract.nextStep = {
        command: ns.task || ns.command || ns,
        agent: ns.agent || null,
        context: ns.input || ns.context || '',
      };
    }
    if (taskDef.next_action && !contract.nextStep) {
      contract.nextStep = {
        command: taskDef.next_action,
        agent: null,
        context: '',
      };
    }

    // Extrair outputs esperados
    if (taskDef.output) {
      const outputs = Array.isArray(taskDef.output) ? taskDef.output : [taskDef.output];
      contract.expectedOutputs = outputs.map(o => ({
        name: typeof o === 'string' ? o : (o.name || o.file || ''),
        format: typeof o === 'string' ? 'any' : (o.format || 'any'),
        path: typeof o === 'string' ? '' : (o.path || ''),
      }));
    }

    // Extrair fases do markdown (## headings como fases)
    if (contract.phases.length === 0) {
      const headings = content.match(/^##\s+(?:Phase|Fase|Step|Etapa|Passo)\s*\d*[.:]\s*(.+)/gim);
      if (headings) {
        contract.phases = headings.map((h, i) => ({
          id: `PHASE_${i + 1}`,
          name: h.replace(/^##\s+(?:Phase|Fase|Step|Etapa|Passo)\s*\d*[.:]\s*/i, '').trim(),
          required: true,
          status: 'pending',
          checklist: null,
        }));
      }
    }

    // Extrair checklists referenciadas
    const checklistRefs = content.match(/checklists?\/[\w-]+\.md/g);
    if (checklistRefs) {
      contract.checklists = [...new Set(checklistRefs)].map(ref => ({
        name: path.basename(ref, '.md'),
        path: ref,
        required: true,
      }));
    }

    return contract;
  }

  /**
   * Build contract from a workflow YAML file
   */
  static fromWorkflow(workflowPath) {
    const content = fs.readFileSync(workflowPath, 'utf8');
    if (!yaml) throw new Error('js-yaml necessário para parsear workflows');

    const wf = yaml.load(content) || {};
    const contract = new ExecutionContract(workflowPath);

    contract.command = wf.name || wf.workflow_name || path.basename(workflowPath, '.yaml');
    contract.squad = ContractBuilder._detectSquad(workflowPath);

    // Extrair fases do workflow
    const phases = wf.phases || wf.steps || [];
    if (Array.isArray(phases)) {
      contract.phases = phases.map((p, i) => ({
        id: p.id || `PHASE_${i}`,
        name: p.name || p.title || `Phase ${i}`,
        required: p.required !== false,
        status: 'pending',
        agent: p.agent || p.responsible || null,
        tasks: (p.tasks || []).map(t => typeof t === 'string' ? t : (t.name || t.task || '')),
        checkpoint: p.checkpoint || null,
        checklist: null,
      }));
    }

    // Extrair quality gates
    if (wf.quality_gates) {
      const gates = typeof wf.quality_gates === 'object' && !Array.isArray(wf.quality_gates)
        ? Object.entries(wf.quality_gates).map(([id, g]) => ({ id, ...g }))
        : wf.quality_gates;
      contract.qualityGates = gates.map(g => ({
        id: g.id || g.name,
        name: g.name || g.id,
        type: g.type || 'blocking',
        criteria: g.conditions || g.criteria || [],
        transition: g.transition || '',
      }));
    }

    // Extrair veto conditions de cada fase
    for (const phase of contract.phases) {
      if (phase.checkpoint && phase.checkpoint.veto_conditions) {
        for (const v of phase.checkpoint.veto_conditions) {
          contract.vetoConditions.push({
            id: `VETO_${phase.id}`,
            condition: typeof v === 'string' ? v : v.condition,
            action: 'HALT',
            phase: phase.id,
          });
        }
      }
    }

    // Extrair next steps
    if (wf.next_steps) {
      const ns = Array.isArray(wf.next_steps) ? wf.next_steps[0] : wf.next_steps;
      contract.nextStep = {
        command: ns.task || ns.command || ns,
        agent: ns.agent || null,
        context: ns.input || '',
      };
    }

    // Extrair error handling
    if (wf.error_handling) {
      contract.errorHandling = wf.error_handling;
    }

    return contract;
  }

  /**
   * Auto-detect: task ou workflow?
   */
  static build(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.yaml' || ext === '.yml') {
      return ContractBuilder.fromWorkflow(filePath);
    }
    return ContractBuilder.fromTask(filePath);
  }

  /**
   * Detecta squad a partir do path
   */
  static _detectSquad(filePath) {
    const match = filePath.match(/squads\/([^/]+)\//);
    return match ? match[1] : 'unknown';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = { ExecutionContract, ContractBuilder };
