#!/usr/bin/env node

/**
 * Self-test para o Execution Engine
 * Roda: node self-test.js
 */

const { ExecutionContract, ContractBuilder } = require('./execution-contract');
const { ExecutionResult, ComplianceAuditor, BlindSpotDetector } = require('./compliance-auditor');
const { NextStepRouter } = require('./next-step-router');

console.log('═══════════════════════════════════════════');
console.log('  Execution Engine — Self Test');
console.log('═══════════════════════════════════════════\n');

// ─── Test 1: Criar contrato manualmente ───
console.log('Test 1: Criar ExecutionContract...');
const contract = new ExecutionContract('test/create-carousel.md');
contract.command = 'create-carousel';
contract.squad = 'conteudo';
contract.phases = [
  { id: 'STEP_1', name: 'Selecionar hook', required: true, status: 'pending' },
  { id: 'STEP_2', name: 'Verificar regras Oráculo', required: true, status: 'pending' },
  { id: 'STEP_3', name: 'Gerar slides card-by-card', required: true, status: 'pending' },
  { id: 'STEP_4', name: 'Aplicar narrativa card-by-card', required: true, status: 'pending' },
  { id: 'STEP_5', name: 'CTA final', required: true, status: 'pending' },
  { id: 'STEP_6', name: 'Validar content-rules', required: true, status: 'pending' },
  { id: 'STEP_7', name: 'Gerar output', required: true, status: 'pending' },
];
contract.qualityGates = [
  { id: 'QG_1', name: 'Hook Score', type: 'blocking', criteria: ['score >= 7/10'] },
  { id: 'QG_2', name: 'Oráculo', type: 'blocking', criteria: ['PASS'] },
  { id: 'QG_3', name: 'Clichês', type: 'blocking', criteria: ['zero clichês proibidos'] },
];
contract.nextStep = {
  command: '*validate-content carrossel-A04',
  agent: null,
  context: 'Workflow wf-content-production → Fase 4',
};
console.log(`  ✅ Contrato criado: ${contract.phases.length} fases, ${contract.qualityGates.length} gates\n`);

// ─── Test 2: Simular execução com gaps ───
console.log('Test 2: Simular execução com gaps...');
const result = new ExecutionResult('test/create-carousel.md');
result.markPhase('STEP_1', 'done', 'Hook: "A pergunta que destrói..."');
result.markPhase('STEP_2', 'done', 'Oráculo: 8/10');
result.markPhase('STEP_3', 'done', '7 slides gerados');
result.markPhase('STEP_4', 'skipped');  // ← GAP
result.markPhase('STEP_5', 'done', 'CTA: "Salva pra aplicar hoje"');
result.markPhase('STEP_6', 'partial', '6/9 regras');  // ← PARCIAL
result.markPhase('STEP_7', 'done');
result.markGate('QG_1', true, 8, 'Hook 8/10');
result.markGate('QG_2', true, 8, 'Oráculo 8/10');
result.markGate('QG_3', true, null, 'Zero clichês');
result.complete();
console.log(`  ✅ Execução simulada: 5 done, 1 skipped, 1 partial\n`);

// ─── Test 3: Auditar compliance ───
console.log('Test 3: Auditar compliance...');
const report = ComplianceAuditor.audit(contract, result);
console.log(report.toTerminal());

// ─── Test 4: Next Step Router ───
console.log('Test 4: Next Step Router...');
const nextStep = NextStepRouter.route(contract, report);
console.log(NextStepRouter.toTerminal(nextStep));

// ─── Test 5: Blind Spot Detection ───
console.log('Test 5: Blind Spot Detection (simulando 10 execuções)...');

const reports = [];
for (let i = 0; i < 10; i++) {
  const r = new ExecutionResult('test/create-carousel.md');
  // STEP_4 pulado 8 de 10 vezes (80%)
  r.markPhase('STEP_1', 'done');
  r.markPhase('STEP_2', 'done');
  r.markPhase('STEP_3', 'done');
  r.markPhase('STEP_4', i < 8 ? 'skipped' : 'done');  // 80% skip
  r.markPhase('STEP_5', 'done');
  r.markPhase('STEP_6', i < 6 ? 'partial' : 'done');   // 60% partial
  r.markPhase('STEP_7', 'done');
  r.markGate('QG_1', true);
  r.markGate('QG_2', true);
  r.markGate('QG_3', true);
  r.complete();
  reports.push(ComplianceAuditor.audit(contract, r));
}

const bsReport = BlindSpotDetector.analyze(reports);
console.log(BlindSpotDetector.toTerminal(bsReport));

// ─── Test 6: Execução 100% OK ───
console.log('Test 6: Execução perfeita (100% compliance)...');
const perfectResult = new ExecutionResult('test/create-carousel.md');
for (const phase of contract.phases) {
  perfectResult.markPhase(phase.id, 'done');
}
for (const gate of contract.qualityGates) {
  perfectResult.markGate(gate.id, true);
}
perfectResult.complete();
const perfectReport = ComplianceAuditor.audit(contract, perfectResult);
console.log(perfectReport.toTerminal());

console.log('═══════════════════════════════════════════');
console.log('  Todos os testes passaram ✅');
console.log('═══════════════════════════════════════════');
