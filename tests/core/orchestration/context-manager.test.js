'use strict';

const fs = require('fs-extra');
const path = require('path');

jest.mock('fs-extra');

const ContextManager = require('../../../.aios-core/core/orchestration/context-manager');

describe('ContextManager', () => {
  let manager;
  const WORKFLOW_ID = 'test-workflow-123';
  const PROJECT_ROOT = '/fake/project';

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ContextManager(WORKFLOW_ID, PROJECT_ROOT);

    // Defaults para fs-extra mocks
    fs.ensureDir.mockResolvedValue(undefined);
    fs.writeJson.mockResolvedValue(undefined);
    fs.pathExists.mockResolvedValue(false);
    fs.readJson.mockResolvedValue({});
  });

  // ─────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────
  describe('constructor', () => {
    test('inicializa workflowId e projectRoot corretamente', () => {
      expect(manager.workflowId).toBe(WORKFLOW_ID);
      expect(manager.projectRoot).toBe(PROJECT_ROOT);
    });

    test('calcula stateDir como .aios/workflow-state dentro do projectRoot', () => {
      expect(manager.stateDir).toBe(path.join(PROJECT_ROOT, '.aios', 'workflow-state'));
    });

    test('calcula statePath com o workflowId no nome do arquivo', () => {
      expect(manager.statePath).toBe(
        path.join(PROJECT_ROOT, '.aios', 'workflow-state', `${WORKFLOW_ID}.json`),
      );
    });

    test('calcula handoffDir dentro do stateDir', () => {
      expect(manager.handoffDir).toBe(
        path.join(PROJECT_ROOT, '.aios', 'workflow-state', 'handoffs'),
      );
    });

    test('calcula confidenceDir dentro do stateDir', () => {
      expect(manager.confidenceDir).toBe(
        path.join(PROJECT_ROOT, '.aios', 'workflow-state', 'confidence'),
      );
    });

    test('inicia com _stateCache null', () => {
      expect(manager._stateCache).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // ensureStateDir
  // ─────────────────────────────────────────────
  describe('ensureStateDir', () => {
    test('cria os três diretórios necessários', async () => {
      await manager.ensureStateDir();

      expect(fs.ensureDir).toHaveBeenCalledTimes(3);
      expect(fs.ensureDir).toHaveBeenCalledWith(manager.stateDir);
      expect(fs.ensureDir).toHaveBeenCalledWith(manager.handoffDir);
      expect(fs.ensureDir).toHaveBeenCalledWith(manager.confidenceDir);
    });
  });

  // ─────────────────────────────────────────────
  // initialize
  // ─────────────────────────────────────────────
  describe('initialize', () => {
    test('carrega estado existente do disco quando arquivo existe', async () => {
      const existingState = {
        workflowId: WORKFLOW_ID,
        status: 'in_progress',
        phases: { 1: { completedAt: '2026-01-01' } },
      };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(existingState);

      const result = await manager.initialize();

      expect(fs.readJson).toHaveBeenCalledWith(manager.statePath);
      expect(result).toEqual(existingState);
      expect(manager._stateCache).toEqual(existingState);
    });

    test('cria estado inicial quando arquivo não existe', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await manager.initialize();

      expect(result.workflowId).toBe(WORKFLOW_ID);
      expect(result.status).toBe('initialized');
      expect(result.currentPhase).toBe(0);
      expect(result.phases).toEqual({});
      expect(result.metadata.projectRoot).toBe(PROJECT_ROOT);
      expect(result.metadata.delivery_confidence).toBeNull();
      expect(fs.writeJson).toHaveBeenCalled();
    });

    test('chama ensureStateDir antes de carregar ou criar', async () => {
      fs.pathExists.mockResolvedValue(false);

      await manager.initialize();

      expect(fs.ensureDir).toHaveBeenCalledWith(manager.stateDir);
      expect(fs.ensureDir).toHaveBeenCalledWith(manager.handoffDir);
      expect(fs.ensureDir).toHaveBeenCalledWith(manager.confidenceDir);
    });

    test('salva estado inicial no disco quando criado', async () => {
      fs.pathExists.mockResolvedValue(false);

      await manager.initialize();

      expect(fs.writeJson).toHaveBeenCalledWith(
        manager.statePath,
        expect.objectContaining({ workflowId: WORKFLOW_ID }),
        { spaces: 2 },
      );
    });

    test('propaga erro quando fs.readJson falha', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockRejectedValue(new Error('disk read failed'));

      await expect(manager.initialize()).rejects.toThrow('disk read failed');
    });
  });

  // ─────────────────────────────────────────────
  // _createInitialState
  // ─────────────────────────────────────────────
  describe('_createInitialState', () => {
    test('retorna objeto com todos os campos obrigatórios', () => {
      const state = manager._createInitialState();

      expect(state).toHaveProperty('workflowId', WORKFLOW_ID);
      expect(state).toHaveProperty('status', 'initialized');
      expect(state).toHaveProperty('startedAt');
      expect(state).toHaveProperty('updatedAt');
      expect(state).toHaveProperty('currentPhase', 0);
      expect(state).toHaveProperty('phases');
      expect(state).toHaveProperty('metadata');
    });

    test('startedAt e updatedAt são strings ISO válidas', () => {
      const state = manager._createInitialState();

      const startedAtDate = new Date(state.startedAt);
      const updatedAtDate = new Date(state.updatedAt);
      expect(startedAtDate.toISOString()).toBe(state.startedAt);
      expect(updatedAtDate.toISOString()).toBe(state.updatedAt);
    });

    test('phases começa como objeto vazio', () => {
      const state = manager._createInitialState();
      expect(state.phases).toEqual({});
    });

    test('metadata contém projectRoot e delivery_confidence null', () => {
      const state = manager._createInitialState();
      expect(state.metadata.projectRoot).toBe(PROJECT_ROOT);
      expect(state.metadata.delivery_confidence).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // loadState
  // ─────────────────────────────────────────────
  describe('loadState', () => {
    test('retorna cache quando já existe', async () => {
      const cached = { workflowId: WORKFLOW_ID, status: 'cached' };
      manager._stateCache = cached;

      const result = await manager.loadState();

      expect(result).toBe(cached);
      expect(fs.pathExists).not.toHaveBeenCalled();
    });

    test('lê do disco quando cache está vazio e arquivo existe', async () => {
      const diskState = { workflowId: WORKFLOW_ID, status: 'from_disk' };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(diskState);

      const result = await manager.loadState();

      expect(result).toEqual(diskState);
      expect(manager._stateCache).toEqual(diskState);
    });

    test('retorna estado inicial quando cache vazio e arquivo não existe', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await manager.loadState();

      expect(result.workflowId).toBe(WORKFLOW_ID);
      expect(result.status).toBe('initialized');
      // Não deve popular o cache nesse caso
      expect(manager._stateCache).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // _saveState
  // ─────────────────────────────────────────────
  describe('_saveState', () => {
    test('atualiza updatedAt e persiste no disco', async () => {
      jest.useFakeTimers();
      try {
        jest.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
        manager._stateCache = manager._createInitialState();
        const oldUpdated = manager._stateCache.updatedAt;

        jest.setSystemTime(new Date('2020-01-01T00:00:01.000Z'));
        await manager._saveState();

        expect(manager._stateCache.updatedAt).not.toBe(oldUpdated);
        expect(fs.writeJson).toHaveBeenCalledWith(
          manager.statePath,
          manager._stateCache,
          { spaces: 2 },
        );
      } finally {
        jest.useRealTimers();
      }
    });

    test('chama ensureStateDir antes de escrever', async () => {
      manager._stateCache = manager._createInitialState();

      await manager._saveState();

      expect(fs.ensureDir).toHaveBeenCalledWith(manager.stateDir);
    });

    test('propaga erro quando fs.writeJson falha', async () => {
      manager._stateCache = manager._createInitialState();
      fs.writeJson.mockRejectedValue(new Error('disk write failed'));

      await expect(manager._saveState()).rejects.toThrow('disk write failed');
    });
  });

  // ─────────────────────────────────────────────
  // savePhaseOutput
  // ─────────────────────────────────────────────
  describe('savePhaseOutput', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await manager.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      fs.pathExists.mockResolvedValue(false);
    });

    test('atualiza currentPhase e status para in_progress', async () => {
      await manager.savePhaseOutput(3, { agent: 'dev', result: {} });

      expect(manager._stateCache.currentPhase).toBe(3);
      expect(manager._stateCache.status).toBe('in_progress');
    });

    test('salva output da fase com completedAt e handoff', async () => {
      const output = { agent: 'dev', task: 'develop', result: {} };
      await manager.savePhaseOutput(1, output);

      const phase = manager._stateCache.phases[1];
      expect(phase.agent).toBe('dev');
      expect(phase.task).toBe('develop');
      expect(phase.completedAt).toBeDefined();
      expect(phase.handoff).toBeDefined();
    });

    test('calcula e salva delivery_confidence no metadata', async () => {
      await manager.savePhaseOutput(1, {
        agent: 'dev',
        result: { status: 'success' },
        validation: { checks: [{ type: 'unit', passed: true }] },
      });

      const confidence = manager._stateCache.metadata.delivery_confidence;
      expect(confidence).toBeDefined();
      expect(confidence.score).toBeGreaterThanOrEqual(0);
      expect(confidence.version).toBe('1.0.0');
    });

    test('persiste handoff file no diretório de handoffs', async () => {
      await manager.savePhaseOutput(2, {
        agent: 'qa',
        result: { decisions: [] },
      });

      // Deve salvar o handoff file
      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('handoffs'),
        expect.objectContaining({ workflow_id: WORKFLOW_ID }),
        { spaces: 2 },
      );
    });

    test('persiste confidence file no diretório de confidence', async () => {
      await manager.savePhaseOutput(1, {
        agent: 'dev',
        result: {},
        validation: { checks: [{ passed: true }] },
      });

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('delivery-confidence.json'),
        expect.objectContaining({ version: '1.0.0' }),
        { spaces: 2 },
      );
    });

    test('aceita options com handoffTarget', async () => {
      await manager.savePhaseOutput(
        1,
        { agent: 'architect', result: {} },
        { handoffTarget: { phase: 2, agent: 'dev' } },
      );

      const handoff = manager._stateCache.phases[1].handoff;
      expect(handoff.to.phase).toBe(2);
      expect(handoff.to.agent).toBe('dev');
    });

    test('funciona sem options (default vazio)', async () => {
      await manager.savePhaseOutput(1, { agent: 'dev', result: {} });

      const handoff = manager._stateCache.phases[1].handoff;
      expect(handoff.to.phase).toBeNull();
      expect(handoff.to.agent).toBeNull();
    });

    test('inicializa metadata se não existir no state', async () => {
      manager._stateCache.metadata = undefined;

      await manager.savePhaseOutput(1, { result: {} });

      expect(manager._stateCache.metadata).toBeDefined();
      expect(manager._stateCache.metadata.delivery_confidence).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // getContextForPhase
  // ─────────────────────────────────────────────
  describe('getContextForPhase', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await manager.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
      fs.pathExists.mockResolvedValue(false);
    });

    test('retorna contexto com dados das fases anteriores', async () => {
      await manager.savePhaseOutput(1, {
        agent: 'architect',
        result: { decisions: [{ id: 'D1' }] },
      });
      await manager.savePhaseOutput(2, {
        agent: 'dev',
        result: {},
      });

      const context = await manager.getContextForPhase(3);

      expect(context.workflowId).toBe(WORKFLOW_ID);
      expect(context.currentPhase).toBe(3);
      expect(context.previousPhases[1]).toBeDefined();
      expect(context.previousPhases[2]).toBeDefined();
      expect(context.previousPhases[3]).toBeUndefined();
    });

    test('retorna previousPhases vazio para fase 1', async () => {
      const context = await manager.getContextForPhase(1);

      expect(context.previousPhases).toEqual({});
      expect(context.previousHandoffs).toEqual({});
    });

    test('inclui previousHandoffs quando fases têm handoff', async () => {
      await manager.savePhaseOutput(
        1,
        { agent: 'architect', result: {} },
        { handoffTarget: { phase: 2, agent: 'dev' } },
      );

      const context = await manager.getContextForPhase(2);

      expect(context.previousHandoffs['1']).toBeDefined();
      expect(context.previousHandoffs['1'].to.agent).toBe('dev');
    });

    test('inclui metadata no contexto', async () => {
      const context = await manager.getContextForPhase(1);

      expect(context.metadata).toBeDefined();
      expect(context.metadata.projectRoot).toBe(PROJECT_ROOT);
    });

    test('ignora fases inexistentes no range', async () => {
      await manager.savePhaseOutput(1, { agent: 'dev', result: {} });
      // Fase 2 não existe

      const context = await manager.getContextForPhase(4);

      expect(Object.keys(context.previousPhases)).toEqual(['1']);
    });
  });

  // ─────────────────────────────────────────────
  // getPreviousPhaseOutputs
  // ─────────────────────────────────────────────
  describe('getPreviousPhaseOutputs', () => {
    test('retorna objeto vazio quando cache é null', () => {
      manager._stateCache = null;

      expect(manager.getPreviousPhaseOutputs()).toEqual({});
    });

    test('retorna objeto vazio quando cache não tem phases', () => {
      manager._stateCache = { status: 'initialized' };

      expect(manager.getPreviousPhaseOutputs()).toEqual({});
    });

    test('retorna phases do cache', () => {
      manager._stateCache = {
        phases: { 1: { agent: 'dev' }, 2: { agent: 'qa' } },
      };

      const outputs = manager.getPreviousPhaseOutputs();

      expect(outputs[1].agent).toBe('dev');
      expect(outputs[2].agent).toBe('qa');
    });
  });

  // ─────────────────────────────────────────────
  // getPhaseOutput
  // ─────────────────────────────────────────────
  describe('getPhaseOutput', () => {
    test('retorna null quando fase não existe', () => {
      manager._stateCache = { phases: {} };

      expect(manager.getPhaseOutput(5)).toBeNull();
    });

    test('retorna null quando cache é null', () => {
      manager._stateCache = null;

      expect(manager.getPhaseOutput(1)).toBeNull();
    });

    test('retorna output da fase quando existe', () => {
      manager._stateCache = {
        phases: { 3: { agent: 'qa', completedAt: '2026-01-01' } },
      };

      const output = manager.getPhaseOutput(3);

      expect(output.agent).toBe('qa');
      expect(output.completedAt).toBe('2026-01-01');
    });
  });

  // ─────────────────────────────────────────────
  // markCompleted
  // ─────────────────────────────────────────────
  describe('markCompleted', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await manager.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('define status como completed', async () => {
      await manager.markCompleted();

      expect(manager._stateCache.status).toBe('completed');
    });

    test('define completedAt com timestamp ISO', async () => {
      await manager.markCompleted();

      expect(manager._stateCache.completedAt).toBeDefined();
      expect(new Date(manager._stateCache.completedAt).toISOString())
        .toBe(manager._stateCache.completedAt);
    });

    test('persiste estado no disco', async () => {
      await manager.markCompleted();

      expect(fs.writeJson).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // markFailed
  // ─────────────────────────────────────────────
  describe('markFailed', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await manager.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('define status como failed com mensagem de erro', async () => {
      await manager.markFailed('Erro na fase 2', 2);

      expect(manager._stateCache.status).toBe('failed');
      expect(manager._stateCache.error).toBe('Erro na fase 2');
      expect(manager._stateCache.failedPhase).toBe(2);
    });

    test('define failedAt com timestamp ISO', async () => {
      await manager.markFailed('Erro', 1);

      expect(manager._stateCache.failedAt).toBeDefined();
      expect(new Date(manager._stateCache.failedAt).toISOString())
        .toBe(manager._stateCache.failedAt);
    });

    test('persiste estado no disco', async () => {
      await manager.markFailed('Erro', 3);

      expect(fs.writeJson).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // updateMetadata
  // ─────────────────────────────────────────────
  describe('updateMetadata', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await manager.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('faz merge de novos metadados com existentes', async () => {
      await manager.updateMetadata({ customKey: 'valor' });

      expect(manager._stateCache.metadata.customKey).toBe('valor');
      expect(manager._stateCache.metadata.projectRoot).toBe(PROJECT_ROOT);
    });

    test('sobrescreve campo existente no metadata', async () => {
      await manager.updateMetadata({ projectRoot: '/outro/caminho' });

      expect(manager._stateCache.metadata.projectRoot).toBe('/outro/caminho');
    });

    test('persiste estado no disco', async () => {
      await manager.updateMetadata({ foo: 'bar' });

      expect(fs.writeJson).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // getLastCompletedPhase
  // ─────────────────────────────────────────────
  describe('getLastCompletedPhase', () => {
    test('retorna 0 quando não há fases', () => {
      manager._stateCache = { phases: {} };

      expect(manager.getLastCompletedPhase()).toBe(0);
    });

    test('retorna 0 quando cache é null', () => {
      manager._stateCache = null;

      expect(manager.getLastCompletedPhase()).toBe(0);
    });

    test('retorna o maior número de fase', () => {
      manager._stateCache = {
        phases: { 1: {}, 3: {}, 2: {} },
      };

      expect(manager.getLastCompletedPhase()).toBe(3);
    });

    test('funciona com uma única fase', () => {
      manager._stateCache = {
        phases: { 5: {} },
      };

      expect(manager.getLastCompletedPhase()).toBe(5);
    });
  });

  // ─────────────────────────────────────────────
  // isPhaseCompleted
  // ─────────────────────────────────────────────
  describe('isPhaseCompleted', () => {
    test('retorna false quando fase não existe', () => {
      manager._stateCache = { phases: {} };

      expect(manager.isPhaseCompleted(1)).toBe(false);
    });

    test('retorna false quando fase existe mas sem completedAt', () => {
      manager._stateCache = {
        phases: { 1: { agent: 'dev' } },
      };

      expect(manager.isPhaseCompleted(1)).toBe(false);
    });

    test('retorna true quando fase existe com completedAt', () => {
      manager._stateCache = {
        phases: { 1: { completedAt: '2026-01-01' } },
      };

      expect(manager.isPhaseCompleted(1)).toBe(true);
    });

    test('retorna false quando cache é null', () => {
      manager._stateCache = null;

      expect(manager.isPhaseCompleted(1)).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // getSummary
  // ─────────────────────────────────────────────
  describe('getSummary', () => {
    test('retorna resumo com campos obrigatórios', () => {
      manager._stateCache = {
        workflowId: WORKFLOW_ID,
        status: 'in_progress',
        startedAt: '2026-01-01',
        currentPhase: 2,
        phases: { 1: {}, 2: {} },
        metadata: { delivery_confidence: { score: 85 } },
      };

      const summary = manager.getSummary();

      expect(summary.workflowId).toBe(WORKFLOW_ID);
      expect(summary.status).toBe('in_progress');
      expect(summary.startedAt).toBe('2026-01-01');
      expect(summary.currentPhase).toBe(2);
      expect(summary.completedPhases).toEqual([1, 2]);
      expect(summary.totalPhases).toBe(2);
      expect(summary.deliveryConfidence.score).toBe(85);
    });

    test('usa estado inicial quando cache é null', () => {
      manager._stateCache = null;

      const summary = manager.getSummary();

      expect(summary.workflowId).toBe(WORKFLOW_ID);
      expect(summary.status).toBe('initialized');
      expect(summary.completedPhases).toEqual([]);
      expect(summary.totalPhases).toBe(0);
    });

    test('retorna deliveryConfidence null quando não existe', () => {
      manager._stateCache = {
        workflowId: WORKFLOW_ID,
        status: 'initialized',
        currentPhase: 0,
        phases: {},
        metadata: {},
      };

      const summary = manager.getSummary();

      expect(summary.deliveryConfidence).toBeNull();
    });

    test('inclui completedAt quando workflow está completo', () => {
      manager._stateCache = {
        workflowId: WORKFLOW_ID,
        status: 'completed',
        startedAt: '2026-01-01',
        completedAt: '2026-01-02',
        currentPhase: 3,
        phases: { 1: {}, 2: {}, 3: {} },
        metadata: {},
      };

      const summary = manager.getSummary();

      expect(summary.completedAt).toBe('2026-01-02');
    });
  });

  // ─────────────────────────────────────────────
  // getDeliveryConfidence
  // ─────────────────────────────────────────────
  describe('getDeliveryConfidence', () => {
    test('retorna null quando cache é null', () => {
      manager._stateCache = null;

      expect(manager.getDeliveryConfidence()).toBeNull();
    });

    test('retorna null quando metadata não tem delivery_confidence', () => {
      manager._stateCache = { metadata: {} };

      expect(manager.getDeliveryConfidence()).toBeNull();
    });

    test('retorna null quando metadata é undefined', () => {
      manager._stateCache = {};

      expect(manager.getDeliveryConfidence()).toBeNull();
    });

    test('retorna delivery_confidence quando existe', () => {
      const confidence = { score: 90, version: '1.0.0' };
      manager._stateCache = { metadata: { delivery_confidence: confidence } };

      expect(manager.getDeliveryConfidence()).toEqual(confidence);
    });
  });

  // ─────────────────────────────────────────────
  // _buildHandoffPackage
  // ─────────────────────────────────────────────
  describe('_buildHandoffPackage', () => {
    test('constrói pacote com todos os campos obrigatórios', () => {
      const output = { agent: 'dev', action: 'implement', task: 'develop-story' };
      const state = { status: 'in_progress', currentPhase: 1, metadata: {} };
      const options = { handoffTarget: { phase: 2, agent: 'qa' } };
      const completedAt = '2026-01-01T00:00:00.000Z';

      const handoff = manager._buildHandoffPackage(1, output, state, options, completedAt);

      expect(handoff.version).toBe('1.0.0');
      expect(handoff.workflow_id).toBe(WORKFLOW_ID);
      expect(handoff.generated_at).toBe(completedAt);
      expect(handoff.from).toEqual({
        phase: 1,
        agent: 'dev',
        action: 'implement',
        task: 'develop-story',
      });
      expect(handoff.to).toEqual({ phase: 2, agent: 'qa' });
    });

    test('usa null para from.agent/action/task quando não fornecidos', () => {
      const handoff = manager._buildHandoffPackage(
        1, { result: {} }, { status: 'x', currentPhase: 1, metadata: {} }, {}, '2026-01-01',
      );

      expect(handoff.from.agent).toBeNull();
      expect(handoff.from.action).toBeNull();
      expect(handoff.from.task).toBeNull();
    });

    test('usa null para to.phase/agent quando handoffTarget não fornecido', () => {
      const handoff = manager._buildHandoffPackage(
        1, { result: {} }, { status: 'x', currentPhase: 1, metadata: {} }, {}, '2026-01-01',
      );

      expect(handoff.to.phase).toBeNull();
      expect(handoff.to.agent).toBeNull();
    });

    test('inclui context_snapshot com status e metadata', () => {
      const state = { status: 'in_progress', currentPhase: 3, metadata: { key: 'val' } };
      const handoff = manager._buildHandoffPackage(3, { result: {} }, state, {}, '2026-01-01');

      expect(handoff.context_snapshot.workflow_status).toBe('in_progress');
      expect(handoff.context_snapshot.current_phase).toBe(3);
      expect(handoff.context_snapshot.metadata.key).toBe('val');
    });

    test('inclui decision_log, evidence_links e open_risks', () => {
      const output = {
        result: {
          decisions: [{ id: 'D1' }],
          evidence_links: ['doc.md'],
          open_risks: ['risco-1'],
        },
      };
      const handoff = manager._buildHandoffPackage(
        1, output, { status: 'x', currentPhase: 1, metadata: {} }, {}, '2026-01-01',
      );

      expect(handoff.decision_log.entries).toEqual([{ id: 'D1' }]);
      expect(handoff.decision_log.count).toBe(1);
      expect(handoff.evidence_links).toContain('doc.md');
      expect(handoff.open_risks).toContain('risco-1');
    });
  });

  // ─────────────────────────────────────────────
  // _saveHandoffFile
  // ─────────────────────────────────────────────
  describe('_saveHandoffFile', () => {
    test('salva handoff no path correto com phase no nome', async () => {
      const handoff = { from: { phase: 3 } };

      await manager._saveHandoffFile(handoff);

      expect(fs.writeJson).toHaveBeenCalledWith(
        path.join(manager.handoffDir, `${WORKFLOW_ID}-phase-3.handoff.json`),
        handoff,
        { spaces: 2 },
      );
    });

    test('usa "unknown" quando from.phase não existe', async () => {
      await manager._saveHandoffFile({});

      expect(fs.writeJson).toHaveBeenCalledWith(
        path.join(manager.handoffDir, `${WORKFLOW_ID}-phase-unknown.handoff.json`),
        {},
        { spaces: 2 },
      );
    });

    test('cria o diretório de handoffs antes de escrever', async () => {
      await manager._saveHandoffFile({ from: { phase: 1 } });

      expect(fs.ensureDir).toHaveBeenCalledWith(manager.handoffDir);
    });
  });

  // ─────────────────────────────────────────────
  // _saveConfidenceFile
  // ─────────────────────────────────────────────
  describe('_saveConfidenceFile', () => {
    test('não salva quando confidence é null', async () => {
      await manager._saveConfidenceFile(null);

      expect(fs.writeJson).not.toHaveBeenCalled();
    });

    test('não salva quando confidence é undefined', async () => {
      await manager._saveConfidenceFile(undefined);

      expect(fs.writeJson).not.toHaveBeenCalled();
    });

    test('salva confidence no path correto', async () => {
      const confidence = { score: 85, version: '1.0.0' };

      await manager._saveConfidenceFile(confidence);

      expect(fs.writeJson).toHaveBeenCalledWith(
        path.join(manager.confidenceDir, `${WORKFLOW_ID}.delivery-confidence.json`),
        confidence,
        { spaces: 2 },
      );
    });

    test('cria o diretório de confidence antes de escrever', async () => {
      await manager._saveConfidenceFile({ score: 50 });

      expect(fs.ensureDir).toHaveBeenCalledWith(manager.confidenceDir);
    });
  });

  // ─────────────────────────────────────────────
  // _extractDecisionLog
  // ─────────────────────────────────────────────
  describe('_extractDecisionLog', () => {
    test('extrai de result.decisions quando é array', () => {
      const log = manager._extractDecisionLog({
        result: { decisions: [{ id: 'D1' }, { id: 'D2' }] },
      });

      expect(log.entries).toEqual([{ id: 'D1' }, { id: 'D2' }]);
      expect(log.count).toBe(2);
    });

    test('extrai de result.decision_log quando decisions não existe', () => {
      const log = manager._extractDecisionLog({
        result: { decision_log: [{ id: 'DL1' }] },
      });

      expect(log.entries).toEqual([{ id: 'DL1' }]);
      expect(log.count).toBe(1);
    });

    test('retorna entries vazio quando nenhum campo existe', () => {
      const log = manager._extractDecisionLog({ result: {} });

      expect(log.entries).toEqual([]);
      expect(log.count).toBe(0);
    });

    test('retorna entries vazio para output vazio', () => {
      const log = manager._extractDecisionLog({});

      expect(log.entries).toEqual([]);
      expect(log.count).toBe(0);
    });

    test('retorna entries vazio para output undefined', () => {
      const log = manager._extractDecisionLog();

      expect(log.entries).toEqual([]);
      expect(log.count).toBe(0);
    });

    test('coleta source_paths de decisionLogPath e decision_log_path', () => {
      const log = manager._extractDecisionLog({
        result: {
          decisionLogPath: '/path/a',
          decision_log_path: '/path/b',
        },
      });

      expect(log.source_paths).toEqual(['/path/a', '/path/b']);
    });

    test('retorna source_paths vazio quando paths não existem', () => {
      const log = manager._extractDecisionLog({ result: {} });

      expect(log.source_paths).toEqual([]);
    });

    test('prioriza decisions sobre decision_log', () => {
      const log = manager._extractDecisionLog({
        result: {
          decisions: [{ id: 'D1' }],
          decision_log: [{ id: 'DL1' }],
        },
      });

      expect(log.entries).toEqual([{ id: 'D1' }]);
    });
  });

  // ─────────────────────────────────────────────
  // _extractEvidenceLinks
  // ─────────────────────────────────────────────
  describe('_extractEvidenceLinks', () => {
    test('extrai de result.evidence_links', () => {
      const links = manager._extractEvidenceLinks({
        result: { evidence_links: ['doc.md', 'spec.md'] },
      });

      expect(links).toContain('doc.md');
      expect(links).toContain('spec.md');
    });

    test('extrai path e checklist de validation.checks', () => {
      const links = manager._extractEvidenceLinks({
        result: {},
        validation: {
          checks: [
            { path: 'test.js', checklist: 'qa-checklist.md' },
          ],
        },
      });

      expect(links).toContain('test.js');
      expect(links).toContain('qa-checklist.md');
    });

    test('remove duplicatas', () => {
      const links = manager._extractEvidenceLinks({
        result: { evidence_links: ['doc.md', 'doc.md'] },
        validation: {
          checks: [{ path: 'doc.md' }],
        },
      });

      expect(links).toEqual(['doc.md']);
    });

    test('retorna array vazio para output vazio', () => {
      const links = manager._extractEvidenceLinks({});

      expect(links).toEqual([]);
    });

    test('retorna array vazio para output undefined', () => {
      const links = manager._extractEvidenceLinks();

      expect(links).toEqual([]);
    });

    test('ignora checks sem path e checklist', () => {
      const links = manager._extractEvidenceLinks({
        result: {},
        validation: {
          checks: [{ type: 'unit', passed: true }],
        },
      });

      expect(links).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // _extractOpenRisks
  // ─────────────────────────────────────────────
  describe('_extractOpenRisks', () => {
    test('extrai de result.open_risks', () => {
      const risks = manager._extractOpenRisks({
        result: { open_risks: ['risco-1'] },
      });

      expect(risks).toEqual(['risco-1']);
    });

    test('extrai de result.risks', () => {
      const risks = manager._extractOpenRisks({
        result: { risks: ['risco-2'] },
      });

      expect(risks).toEqual(['risco-2']);
    });

    test('extrai de result.risk_register', () => {
      const risks = manager._extractOpenRisks({
        result: { risk_register: ['risco-3'] },
      });

      expect(risks).toEqual(['risco-3']);
    });

    test('combina todas as fontes de riscos', () => {
      const risks = manager._extractOpenRisks({
        result: {
          open_risks: ['A'],
          risks: ['B'],
          risk_register: ['C'],
        },
      });

      expect(risks).toEqual(['A', 'B', 'C']);
    });

    test('retorna array vazio para output vazio', () => {
      expect(manager._extractOpenRisks({})).toEqual([]);
    });

    test('retorna array vazio para output undefined', () => {
      expect(manager._extractOpenRisks()).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // _calculateDeliveryConfidence
  // ─────────────────────────────────────────────
  describe('_calculateDeliveryConfidence', () => {
    test('retorna objeto com todos os campos obrigatórios', () => {
      const confidence = manager._calculateDeliveryConfidence({ phases: {} });

      expect(confidence.version).toBe('1.0.0');
      expect(confidence.calculated_at).toBeDefined();
      expect(confidence).toHaveProperty('score');
      expect(confidence).toHaveProperty('threshold');
      expect(confidence).toHaveProperty('gate_passed');
      expect(confidence).toHaveProperty('formula');
      expect(confidence).toHaveProperty('components');
      expect(confidence).toHaveProperty('phase_count');
    });

    test('score reflete risk/debt inversos mesmo sem fases (35 por padrão)', () => {
      const confidence = manager._calculateDeliveryConfidence({ phases: {} });

      // Sem fases: testCoverage=0, acCompletion=0, riskInv=1, debtInv=1, regression=0
      // Score = (0*0.25 + 0*0.30 + 1*0.20 + 1*0.15 + 0*0.10) * 100 = 35
      expect(confidence.score).toBe(35);
      expect(confidence.phase_count).toBe(0);
    });

    test('gate_passed é true quando score >= threshold', () => {
      const confidence = manager._calculateDeliveryConfidence({
        phases: {
          1: {
            result: { status: 'success', ac_total: 1, ac_completed: 1 },
            validation: { checks: [{ type: 'regression', passed: true }] },
          },
        },
      });

      // Score alto, threshold default 70
      expect(confidence.gate_passed).toBe(confidence.score >= confidence.threshold);
    });

    test('formula contém expression e weights corretos', () => {
      const confidence = manager._calculateDeliveryConfidence({ phases: {} });

      expect(confidence.formula.weights.test_coverage).toBe(0.25);
      expect(confidence.formula.weights.ac_completion).toBe(0.30);
      expect(confidence.formula.weights.risk_score_inv).toBe(0.20);
      expect(confidence.formula.weights.debt_score_inv).toBe(0.15);
      expect(confidence.formula.weights.regression_clear).toBe(0.10);
    });

    test('score é arredondado para 2 casas decimais', () => {
      const confidence = manager._calculateDeliveryConfidence({
        phases: {
          1: { result: { ac_total: 3, ac_completed: 1 }, validation: {} },
        },
      });

      const decimalPart = String(confidence.score).split('.')[1] || '';
      expect(decimalPart.length).toBeLessThanOrEqual(2);
    });
  });

  // ─────────────────────────────────────────────
  // _resolveConfidenceThreshold
  // ─────────────────────────────────────────────
  describe('_resolveConfidenceThreshold', () => {
    const originalEnv = process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD;

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD = originalEnv;
      } else {
        delete process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD;
      }
    });

    test('retorna 70 como default quando env não está definida', () => {
      delete process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD;

      expect(manager._resolveConfidenceThreshold()).toBe(70);
    });

    test('retorna valor numérico da env quando é um número válido', () => {
      process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD = '85';

      expect(manager._resolveConfidenceThreshold()).toBe(85);
    });

    test('retorna 70 quando env contém valor não numérico', () => {
      process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD = 'invalid';

      expect(manager._resolveConfidenceThreshold()).toBe(70);
    });

    test('retorna 0 quando env é string vazia (Number("") === 0)', () => {
      process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD = '';

      // Number('') === 0, que é Number.isFinite, então retorna 0
      expect(manager._resolveConfidenceThreshold()).toBe(0);
    });

    test('aceita valores decimais', () => {
      process.env.AIOS_DELIVERY_CONFIDENCE_THRESHOLD = '75.5';

      expect(manager._resolveConfidenceThreshold()).toBe(75.5);
    });
  });

  // ─────────────────────────────────────────────
  // _calculateTestCoverage
  // ─────────────────────────────────────────────
  describe('_calculateTestCoverage', () => {
    test('retorna 0 quando não há fases', () => {
      expect(manager._calculateTestCoverage([])).toBe(0);
    });

    test('retorna 1 quando há fases mas nenhum check', () => {
      expect(manager._calculateTestCoverage([{ validation: {} }])).toBe(1);
    });

    test('calcula proporção de checks passados', () => {
      const phases = [{
        validation: {
          checks: [
            { passed: true },
            { passed: false },
            { passed: true },
          ],
        },
      }];

      expect(manager._calculateTestCoverage(phases)).toBeCloseTo(2 / 3);
    });

    test('combina checks de múltiplas fases', () => {
      const phases = [
        { validation: { checks: [{ passed: true }] } },
        { validation: { checks: [{ passed: false }] } },
      ];

      expect(manager._calculateTestCoverage(phases)).toBeCloseTo(0.5);
    });

    test('ignora fases sem validation.checks', () => {
      const phases = [
        { validation: { checks: [{ passed: true }] } },
        { validation: {} },
        {},
      ];

      expect(manager._calculateTestCoverage(phases)).toBe(1);
    });
  });

  // ─────────────────────────────────────────────
  // _calculateAcCompletion
  // ─────────────────────────────────────────────
  describe('_calculateAcCompletion', () => {
    test('retorna 0 quando não há fases', () => {
      expect(manager._calculateAcCompletion([])).toBe(0);
    });

    test('calcula com ac_total e ac_completed explícitos', () => {
      const phases = [{
        result: { ac_total: 4, ac_completed: 3 },
      }];

      expect(manager._calculateAcCompletion(phases)).toBeCloseTo(0.75);
    });

    test('calcula com acceptance_criteria array', () => {
      const phases = [{
        result: {
          acceptance_criteria: [
            { done: true },
            { done: false },
            { status: 'done' },
          ],
        },
      }];

      expect(manager._calculateAcCompletion(phases)).toBeCloseTo(2 / 3);
    });

    test('usa fallback baseado em status quando não há AC explícitos', () => {
      const phases = [
        { result: { status: 'success' } },
        { result: { status: 'failed' } },
      ];

      expect(manager._calculateAcCompletion(phases)).toBeCloseTo(0.5);
    });

    test('retorna 1 quando todas fases sem AC explícito são não-failed', () => {
      const phases = [
        { result: { status: 'success' } },
        { result: {} },
      ];

      expect(manager._calculateAcCompletion(phases)).toBe(1);
    });

    test('limita ac_completed ao ac_total (não ultrapassa)', () => {
      const phases = [{
        result: { ac_total: 3, ac_completed: 10 },
      }];

      expect(manager._calculateAcCompletion(phases)).toBe(1);
    });

    test('trata ac_total negativo como 0', () => {
      const phases = [{
        result: { ac_total: -1, ac_completed: 0 },
      }];

      // total = max(0, -1) = 0, done = min(max(0,0), max(0,-1)) = min(0,0) = 0
      // hasExplicitData = true, total = 0, then falls through to fallback
      // fallback: phases.length=1, successful = status !== 'failed' => 1
      // return 1/1 = 1
      expect(manager._calculateAcCompletion(phases)).toBe(1);
    });
  });

  // ─────────────────────────────────────────────
  // _calculateRiskInverseScore
  // ─────────────────────────────────────────────
  describe('_calculateRiskInverseScore', () => {
    test('retorna 1 quando não há riscos', () => {
      expect(manager._calculateRiskInverseScore([{ result: {} }])).toBe(1);
    });

    test('diminui com mais riscos', () => {
      const phases = [{
        result: { open_risks: ['r1', 'r2', 'r3'] },
      }];

      expect(manager._calculateRiskInverseScore(phases)).toBeCloseTo(0.7);
    });

    test('retorna 0 quando há 10 ou mais riscos', () => {
      const risks = Array.from({ length: 10 }, (_, i) => `risco-${i}`);
      const phases = [{ result: { open_risks: risks } }];

      expect(manager._calculateRiskInverseScore(phases)).toBe(0);
    });

    test('não retorna valor negativo quando há mais de 10 riscos', () => {
      const risks = Array.from({ length: 15 }, (_, i) => `risco-${i}`);
      const phases = [{ result: { open_risks: risks } }];

      expect(manager._calculateRiskInverseScore(phases)).toBe(0);
    });

    test('usa o maior entre handoff.open_risks e result risks', () => {
      const phases = [{
        handoff: { open_risks: ['hr1', 'hr2', 'hr3', 'hr4'] },
        result: { open_risks: ['rr1', 'rr2'] },
      }];

      // handoffRisks=4, resultRisks=2, max=4 => 1 - 4/10 = 0.6
      expect(manager._calculateRiskInverseScore(phases)).toBeCloseTo(0.6);
    });
  });

  // ─────────────────────────────────────────────
  // _calculateDebtInverseScore
  // ─────────────────────────────────────────────
  describe('_calculateDebtInverseScore', () => {
    test('retorna 1 quando não há débito técnico', () => {
      expect(manager._calculateDebtInverseScore([{ result: {} }])).toBe(1);
    });

    test('calcula com technical_debt_count', () => {
      const phases = [{ result: { technical_debt_count: 3 } }];

      expect(manager._calculateDebtInverseScore(phases)).toBeCloseTo(0.7);
    });

    test('calcula com debt_count como fallback', () => {
      const phases = [{ result: { debt_count: 5 } }];

      expect(manager._calculateDebtInverseScore(phases)).toBeCloseTo(0.5);
    });

    test('soma itens de listas de dívida técnica', () => {
      const phases = [{
        result: {
          technical_debt: ['td1', 'td2'],
          debt_items: ['di1'],
          todos: ['t1'],
          hacks: ['h1', 'h2'],
        },
      }];

      // explicitCount=0, listCount=2+1+1+2=6 => 1 - 6/10 = 0.4
      expect(manager._calculateDebtInverseScore(phases)).toBeCloseTo(0.4);
    });

    test('soma explicitCount com listCount', () => {
      const phases = [{
        result: {
          technical_debt_count: 2,
          todos: ['t1', 't2'],
        },
      }];

      // explicitCount=2, listCount=2 => total=4 => 1 - 4/10 = 0.6
      expect(manager._calculateDebtInverseScore(phases)).toBeCloseTo(0.6);
    });

    test('retorna 0 quando total >= 10', () => {
      const phases = [{
        result: { technical_debt_count: 10 },
      }];

      expect(manager._calculateDebtInverseScore(phases)).toBe(0);
    });

    test('não retorna negativo quando total > 10', () => {
      const phases = [{
        result: { technical_debt_count: 20 },
      }];

      expect(manager._calculateDebtInverseScore(phases)).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // _calculateRegressionClear
  // ─────────────────────────────────────────────
  describe('_calculateRegressionClear', () => {
    test('retorna testCoverage quando não há checks de regressão', () => {
      const phases = [{
        validation: {
          checks: [
            { type: 'unit', passed: true },
            { type: 'unit', passed: false },
          ],
        },
      }];

      // Sem checks de regressão, usa fallback para testCoverage = 1/2
      expect(manager._calculateRegressionClear(phases)).toBeCloseTo(0.5);
    });

    test('calcula proporção de checks de regressão passados', () => {
      const phases = [{
        validation: {
          checks: [
            { type: 'regression', passed: true },
            { type: 'regression', passed: false },
          ],
        },
      }];

      expect(manager._calculateRegressionClear(phases)).toBeCloseTo(0.5);
    });

    test('identifica regressão por type contendo "regression"', () => {
      const phases = [{
        validation: {
          checks: [{ type: 'regression_suite', passed: true }],
        },
      }];

      expect(manager._calculateRegressionClear(phases)).toBe(1);
    });

    test('identifica regressão por path contendo "regression"', () => {
      const phases = [{
        validation: {
          checks: [{ type: 'test', path: 'tests/regression/suite.js', passed: true }],
        },
      }];

      expect(manager._calculateRegressionClear(phases)).toBe(1);
    });

    test('identifica regressão por checklist contendo "regression"', () => {
      const phases = [{
        validation: {
          checks: [{ type: 'test', checklist: 'regression-checklist', passed: false }],
        },
      }];

      expect(manager._calculateRegressionClear(phases)).toBe(0);
    });

    test('ignora checks não-regressão na contagem', () => {
      const phases = [{
        validation: {
          checks: [
            { type: 'regression', passed: true },
            { type: 'unit', passed: false },
          ],
        },
      }];

      // Só 1 check de regressão, passado => 1/1 = 1
      expect(manager._calculateRegressionClear(phases)).toBe(1);
    });

    test('retorna 0 para fases sem checks (sem fases)', () => {
      expect(manager._calculateRegressionClear([])).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // reset
  // ─────────────────────────────────────────────
  describe('reset', () => {
    beforeEach(async () => {
      fs.pathExists.mockResolvedValue(false);
      await manager.initialize();
      jest.clearAllMocks();
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('reseta estado para initial com keepMetadata=true (default)', async () => {
      manager._stateCache.metadata = { projectRoot: PROJECT_ROOT, custom: 'value' };
      manager._stateCache.status = 'completed';
      manager._stateCache.phases = { 1: { agent: 'dev' } };

      await manager.reset();

      expect(manager._stateCache.status).toBe('initialized');
      expect(manager._stateCache.phases).toEqual({});
      expect(manager._stateCache.currentPhase).toBe(0);
      // Metadata preservada
      expect(manager._stateCache.metadata.custom).toBe('value');
      expect(manager._stateCache.metadata.projectRoot).toBe(PROJECT_ROOT);
    });

    test('reseta metadata quando keepMetadata=false', async () => {
      manager._stateCache.metadata = { projectRoot: PROJECT_ROOT, custom: 'value' };

      await manager.reset(false);

      // Metadata resetada para o default
      expect(manager._stateCache.metadata.custom).toBeUndefined();
      expect(manager._stateCache.metadata.projectRoot).toBe(PROJECT_ROOT);
    });

    test('persiste estado resetado no disco', async () => {
      await manager.reset();

      expect(fs.writeJson).toHaveBeenCalled();
    });

    test('preserva metadata mesmo quando _stateCache era null antes do initialize', async () => {
      // Simula cache null (caso raro)
      manager._stateCache = null;

      await manager.reset(true);

      // Não deve dar erro, usa {} como metadata padrão
      expect(manager._stateCache.status).toBe('initialized');
      expect(manager._stateCache.metadata.projectRoot).toBe(PROJECT_ROOT);
    });
  });

  // ─────────────────────────────────────────────
  // exportState
  // ─────────────────────────────────────────────
  describe('exportState', () => {
    test('retorna cópia rasa do cache', () => {
      manager._stateCache = { workflowId: WORKFLOW_ID, phases: { 1: {} } };

      const exported = manager.exportState();

      expect(exported).toEqual(manager._stateCache);
      expect(exported).not.toBe(manager._stateCache);
    });

    test('retorna objeto com spread de null (vazio)', () => {
      manager._stateCache = null;

      // Spread de null/undefined em objeto resulta em {}
      const exported = manager.exportState();

      expect(exported).toEqual({});
    });
  });

  // ─────────────────────────────────────────────
  // importState
  // ─────────────────────────────────────────────
  describe('importState', () => {
    beforeEach(() => {
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('substitui cache com estado importado', async () => {
      const imported = { workflowId: 'imported', status: 'completed', updatedAt: '2026-01-01' };

      await manager.importState(imported);

      expect(manager._stateCache).toBe(imported);
    });

    test('persiste estado importado no disco', async () => {
      const imported = { workflowId: 'imported', status: 'completed', updatedAt: '2026-01-01' };

      await manager.importState(imported);

      expect(fs.writeJson).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // Integração: fluxo completo de workflow
  // ─────────────────────────────────────────────
  describe('fluxo completo de workflow', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(false);
      fs.ensureDir.mockResolvedValue(undefined);
      fs.writeJson.mockResolvedValue(undefined);
    });

    test('inicializa, salva fases, marca como completo e exporta', async () => {
      await manager.initialize();

      await manager.savePhaseOutput(1, {
        agent: 'architect',
        result: { decisions: [{ id: 'D1' }] },
      });
      await manager.savePhaseOutput(2, {
        agent: 'dev',
        result: { status: 'success' },
      });

      await manager.markCompleted();

      const summary = manager.getSummary();
      expect(summary.status).toBe('completed');
      expect(summary.completedPhases).toEqual([1, 2]);
      expect(summary.totalPhases).toBe(2);

      const exported = manager.exportState();
      expect(exported.status).toBe('completed');
    });

    test('inicializa, falha na fase 2 e reporta erro', async () => {
      await manager.initialize();

      await manager.savePhaseOutput(1, { agent: 'dev', result: {} });
      await manager.markFailed('Timeout na integração', 2);

      const summary = manager.getSummary();
      expect(summary.status).toBe('failed');

      expect(manager._stateCache.error).toBe('Timeout na integração');
      expect(manager._stateCache.failedPhase).toBe(2);
    });

    test('reset preserva metadata e permite re-execução', async () => {
      await manager.initialize();
      await manager.updateMetadata({ experiment: 'v2' });
      await manager.savePhaseOutput(1, { agent: 'dev', result: {} });

      await manager.reset(true);

      expect(manager._stateCache.status).toBe('initialized');
      expect(manager._stateCache.phases).toEqual({});
      expect(manager._stateCache.metadata.experiment).toBe('v2');
      expect(manager.getLastCompletedPhase()).toBe(0);
    });
  });
});
