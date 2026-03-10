/**
 * Agent Immortality Protocol
 *
 * Story: 568 - Agent Immortality Protocol
 * Epic: Resilience — agentes que nunca morrem
 *
 * Sistema completo de self-healing e recuperacao de estado.
 * Quando um agente crasha, reconstrui automaticamente seu estado
 * a partir de checkpoints persistidos, snapshots de memoria e
 * fingerprints comportamentais.
 *
 * Features:
 * - Heartbeat Monitor com intervalos configuraveis
 * - State Snapshots periodicos e persistidos em disco
 * - Crash Detection via heartbeats perdidos
 * - Auto-Revival a partir do ultimo snapshot
 * - Behavioral Fingerprint com deteccao de anomalias pre-crash
 * - Grace Period antes de declarar agente morto
 * - Revival History com analise de causa
 * - Health Score composto (0-100)
 * - Cascade Protection contra falhas em cadeia
 * - Persistent State com serializacao de escrita
 *
 * @module aiox-core/resilience/agent-immortality
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  heartbeatIntervalMs: 5000,
  gracePeriodMs: 15000,
  snapshotIntervalMs: 30000,
  maxSnapshots: 10,
  maxRevivals: 5,
  revivalWindowMs: 300000, // 5 minutos
  fingerprintWindowSize: 50,
  anomalyThreshold: 2.0, // desvios padrao
  healthWarningThreshold: 50,
  snapshotDir: '.aiox/immortality',
  stateFile: '.aiox/immortality/protocol-state.json',
  schemaVersion: 'aiox-immortality-v1',
};

const Events = {
  HEARTBEAT: 'heartbeat',
  SNAPSHOT: 'snapshot',
  DEATH_DETECTED: 'death-detected',
  REVIVAL_STARTED: 'revival-started',
  REVIVAL_COMPLETE: 'revival-complete',
  ANOMALY_DETECTED: 'anomaly-detected',
  CASCADE_RISK: 'cascade-risk',
  HEALTH_WARNING: 'health-warning',
};

const AgentStatus = {
  REGISTERED: 'registered',
  ALIVE: 'alive',
  SUSPECT: 'suspect',
  DEAD: 'dead',
  REVIVING: 'reviving',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Deep clone seguro — structuredClone com fallback JSON
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * Gera ID unico
 * @returns {string}
 */
function generateId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `imm-${ts}-${rand}`;
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                         AGENT IMMORTALITY PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════════

class AgentImmortalityProtocol extends EventEmitter {
  /**
   * @param {string} projectRoot - Diretorio raiz do projeto
   * @param {Object} [options] - Opcoes de configuracao
   * @param {number} [options.heartbeatIntervalMs] - Intervalo do heartbeat em ms
   * @param {number} [options.gracePeriodMs] - Periodo de graca antes de declarar morte
   * @param {number} [options.snapshotIntervalMs] - Intervalo entre snapshots
   * @param {number} [options.maxSnapshots] - Numero maximo de snapshots por agente
   * @param {number} [options.maxRevivals] - Maximo de revivals por janela de tempo
   * @param {number} [options.revivalWindowMs] - Janela de tempo para contagem de revivals
   * @param {number} [options.fingerprintWindowSize] - Tamanho da janela de fingerprint
   * @param {number} [options.anomalyThreshold] - Limiar de anomalia em desvios padrao
   * @param {number} [options.healthWarningThreshold] - Limiar de alerta de saude (0-100)
   * @param {string} [options.snapshotDir] - Diretorio de snapshots
   * @param {string} [options.stateFile] - Arquivo de estado do protocolo
   */
  constructor(projectRoot, options = {}) {
    super();
    this.projectRoot = projectRoot ?? process.cwd();
    this.config = { ...DEFAULT_CONFIG, ...options };

    /** @type {Map<string, Object>} */
    this.agents = new Map();

    /** @type {Map<string, NodeJS.Timeout>} */
    this._heartbeatCheckers = new Map();

    /** @type {Map<string, NodeJS.Timeout>} */
    this._snapshotTimers = new Map();

    /** @type {Map<string, string[]>} */
    this._dependencies = new Map();

    /** @type {Promise<void>} */
    this._saveQueue = Promise.resolve();
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          AGENT REGISTRATION
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Registra um agente no protocolo
   * @param {string} agentId - Identificador unico do agente
   * @param {Object} [config] - Configuracao especifica do agente
   * @param {number} [config.heartbeatIntervalMs] - Override do intervalo de heartbeat
   * @param {number} [config.gracePeriodMs] - Override do grace period
   * @param {Function} [config.revivalFn] - Funcao customizada de revival
   * @returns {Object} Dados do agente registrado
   */
  registerAgent(agentId, config = {}) {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('agentId is required and must be a string');
    }

    if (this.agents.has(agentId)) {
      throw new Error(`Agent "${agentId}" is already registered`);
    }

    const agent = {
      id: agentId,
      status: AgentStatus.REGISTERED,
      config: { ...this.config, ...config },
      heartbeats: [],
      snapshots: [],
      revivalHistory: [],
      fingerprint: {
        metrics: [],
        baseline: null,
      },
      registeredAt: Date.now(),
      lastHeartbeat: null,
      lastSnapshot: null,
      errorCount: 0,
    };

    this.agents.set(agentId, agent);
    return deepClone(agent);
  }

  /**
   * Remove um agente do protocolo
   * @param {string} agentId - Identificador do agente
   */
  unregisterAgent(agentId) {
    this._assertAgentExists(agentId);
    this.stopMonitoring(agentId);
    this._dependencies.delete(agentId);

    // Limpa dependencias que apontam para este agente
    for (const [id, deps] of this._dependencies.entries()) {
      const filtered = deps.filter(d => d !== agentId);
      if (filtered.length > 0) {
        this._dependencies.set(id, filtered);
      } else {
        this._dependencies.delete(id);
      }
    }

    this.agents.delete(agentId);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          MONITORING
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Inicia monitoramento de um agente
   * @param {string} agentId - Identificador do agente
   */
  startMonitoring(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);

    if (this._heartbeatCheckers.has(agentId)) {
      return; // Ja monitorando
    }

    agent.status = AgentStatus.ALIVE;
    agent.lastHeartbeat = Date.now();

    // Checker de heartbeat — verifica se o agente ainda pulsa
    const interval = agent.config.heartbeatIntervalMs ?? this.config.heartbeatIntervalMs;
    const checker = setInterval(() => {
      this._checkHeartbeat(agentId);
    }, interval);

    this._heartbeatCheckers.set(agentId, checker);

    // Timer de snapshot automatico
    const snapInterval = agent.config.snapshotIntervalMs ?? this.config.snapshotIntervalMs;
    const snapTimer = setInterval(() => {
      if (agent.status === AgentStatus.ALIVE && agent.heartbeats.length > 0) {
        const lastHb = agent.heartbeats[agent.heartbeats.length - 1];
        if (lastHb?.stateData) {
          this.createSnapshot(agentId, lastHb.stateData);
        }
      }
    }, snapInterval);

    this._snapshotTimers.set(agentId, snapTimer);
  }

  /**
   * Para monitoramento de um agente
   * @param {string} agentId - Identificador do agente
   */
  stopMonitoring(agentId) {
    const checker = this._heartbeatCheckers.get(agentId);
    if (checker) {
      clearInterval(checker);
      this._heartbeatCheckers.delete(agentId);
    }

    const snapTimer = this._snapshotTimers.get(agentId);
    if (snapTimer) {
      clearInterval(snapTimer);
      this._snapshotTimers.delete(agentId);
    }

    const agent = this.agents.get(agentId);
    if (agent && agent.status === AgentStatus.ALIVE) {
      agent.status = AgentStatus.REGISTERED;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          HEARTBEAT
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Registra heartbeat de um agente
   * @param {string} agentId - Identificador do agente
   * @param {Object} [stateData] - Dados de estado opcionais
   * @returns {Object} Registro do heartbeat
   */
  heartbeat(agentId, stateData = null) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    const now = Date.now();

    const record = {
      id: generateId(),
      timestamp: now,
      stateData: stateData ? deepClone(stateData) : null,
      interval: agent.lastHeartbeat ? now - agent.lastHeartbeat : 0,
    };

    agent.heartbeats.push(record);
    agent.lastHeartbeat = now;

    // Manter janela fixa de heartbeats
    const windowSize = agent.config.fingerprintWindowSize ?? this.config.fingerprintWindowSize;
    if (agent.heartbeats.length > windowSize * 2) {
      agent.heartbeats = agent.heartbeats.slice(-windowSize);
    }

    // Atualizar fingerprint com metrica do intervalo
    if (record.interval > 0) {
      this._updateFingerprint(agentId, record.interval);
    }

    // Se estava morto ou suspeito, restaurar para vivo
    if (agent.status === AgentStatus.DEAD || agent.status === AgentStatus.SUSPECT) {
      agent.status = AgentStatus.ALIVE;
    }

    this.emit(Events.HEARTBEAT, { agentId, record: deepClone(record) });
    return deepClone(record);
  }

  /**
   * Retorna o ultimo heartbeat de um agente
   * @param {string} agentId - Identificador do agente
   * @returns {Object|null} Ultimo heartbeat ou null
   */
  getLastHeartbeat(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    if (agent.heartbeats.length === 0) return null;
    return deepClone(agent.heartbeats[agent.heartbeats.length - 1]);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          SNAPSHOTS
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Cria snapshot do estado do agente
   * @param {string} agentId - Identificador do agente
   * @param {Object} state - Estado a ser salvo
   * @returns {Object} Metadados do snapshot
   */
  createSnapshot(agentId, state) {
    this._assertAgentExists(agentId);
    if (!state || typeof state !== 'object') {
      throw new Error('state must be a non-null object');
    }

    const agent = this.agents.get(agentId);
    const snapshot = {
      id: generateId(),
      agentId,
      state: deepClone(state),
      timestamp: Date.now(),
      healthScore: this._calculateHealthScore(agent),
    };

    agent.snapshots.push(snapshot);
    agent.lastSnapshot = snapshot.timestamp;

    // Limitar numero de snapshots
    const maxSnaps = agent.config.maxSnapshots ?? this.config.maxSnapshots;
    if (agent.snapshots.length > maxSnaps) {
      agent.snapshots = agent.snapshots.slice(-maxSnaps);
    }

    // Persistir em disco (serializado)
    this._persistSnapshot(agentId, snapshot);

    this.emit(Events.SNAPSHOT, { agentId, snapshot: deepClone(snapshot) });
    return { id: snapshot.id, agentId, timestamp: snapshot.timestamp, healthScore: snapshot.healthScore };
  }

  /**
   * Retorna o snapshot mais recente de um agente
   * @param {string} agentId - Identificador do agente
   * @returns {Object|null} Snapshot mais recente ou null
   */
  getLatestSnapshot(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    if (agent.snapshots.length === 0) return null;
    return deepClone(agent.snapshots[agent.snapshots.length - 1]);
  }

  /**
   * Lista snapshots de um agente
   * @param {string} agentId - Identificador do agente
   * @param {Object} [opts] - Opcoes de listagem
   * @param {number} [opts.limit] - Limite de resultados
   * @param {number} [opts.since] - Timestamp minimo
   * @returns {Object[]} Lista de snapshots
   */
  listSnapshots(agentId, opts = {}) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    let snaps = [...agent.snapshots];

    if (opts.since) {
      snaps = snaps.filter(s => s.timestamp >= opts.since);
    }

    if (opts.limit) {
      snaps = snaps.slice(-opts.limit);
    }

    return snaps.map(s => deepClone(s));
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          REVIVAL
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Revive um agente morto a partir do ultimo snapshot
   * @param {string} agentId - Identificador do agente
   * @returns {Object} Resultado do revival
   */
  async reviveAgent(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);

    // Verificar limite de revivals na janela
    const windowMs = agent.config.revivalWindowMs ?? this.config.revivalWindowMs;
    const maxRevivals = agent.config.maxRevivals ?? this.config.maxRevivals;
    const now = Date.now();
    const recentRevivals = agent.revivalHistory.filter(
      r => (now - r.timestamp) < windowMs
    );

    if (recentRevivals.length >= maxRevivals) {
      const result = {
        success: false,
        agentId,
        reason: 'max-revivals-exceeded',
        message: `Agent "${agentId}" exceeded max revivals (${maxRevivals}) in time window`,
        timestamp: now,
      };
      return result;
    }

    this.emit(Events.REVIVAL_STARTED, { agentId, timestamp: now });
    agent.status = AgentStatus.REVIVING;

    const latestSnapshot = agent.snapshots.length > 0
      ? agent.snapshots[agent.snapshots.length - 1]
      : null;

    // Tentar revival customizado ou usar snapshot
    let revivalState = null;
    let revivalMethod = 'snapshot';

    if (typeof agent.config.revivalFn === 'function') {
      try {
        revivalState = await agent.config.revivalFn(agentId, latestSnapshot);
        revivalMethod = 'custom';
      } catch {
        // Fallback para snapshot se funcao customizada falhar
        revivalState = latestSnapshot?.state ?? null;
        revivalMethod = 'snapshot-fallback';
      }
    } else {
      revivalState = latestSnapshot?.state ?? null;
    }

    const revivalRecord = {
      id: generateId(),
      agentId,
      timestamp: now,
      method: revivalMethod,
      snapshotId: latestSnapshot?.id ?? null,
      previousStatus: AgentStatus.DEAD,
      restoredState: revivalState !== null,
      errorCount: agent.errorCount,
    };

    agent.revivalHistory.push(revivalRecord);
    agent.status = AgentStatus.ALIVE;
    agent.lastHeartbeat = now;
    agent.errorCount = 0;

    this.emit(Events.REVIVAL_COMPLETE, {
      agentId,
      record: deepClone(revivalRecord),
      state: revivalState ? deepClone(revivalState) : null,
    });

    return {
      success: true,
      agentId,
      method: revivalMethod,
      snapshotId: latestSnapshot?.id ?? null,
      state: revivalState ? deepClone(revivalState) : null,
      timestamp: now,
    };
  }

  /**
   * Retorna historico de revivals de um agente
   * @param {string} agentId - Identificador do agente
   * @returns {Object[]} Historico de revivals
   */
  getRevivalHistory(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    return agent.revivalHistory.map(r => deepClone(r));
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          HEALTH SCORE
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Calcula e retorna o health score de um agente (0-100)
   * @param {string} agentId - Identificador do agente
   * @returns {number} Health score entre 0 e 100
   */
  getHealthScore(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    return this._calculateHealthScore(agent);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                      BEHAVIORAL FINGERPRINT
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Retorna a fingerprint comportamental de um agente
   * @param {string} agentId - Identificador do agente
   * @returns {Object} Fingerprint com metricas e baseline
   */
  getBehavioralFingerprint(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    return deepClone(agent.fingerprint);
  }

  /**
   * Detecta anomalias no comportamento de um agente
   * @param {string} agentId - Identificador do agente
   * @returns {Object} Resultado da deteccao de anomalias
   */
  detectAnomalies(agentId) {
    this._assertAgentExists(agentId);
    const agent = this.agents.get(agentId);
    const fp = agent.fingerprint;

    if (!fp.baseline || fp.metrics.length < 3) {
      return { hasAnomalies: false, anomalies: [], message: 'Insufficient data for anomaly detection' };
    }

    const anomalies = [];
    const threshold = agent.config.anomalyThreshold ?? this.config.anomalyThreshold;

    // Verificar intervalos de heartbeat
    const recentMetrics = fp.metrics.slice(-5);
    for (const metric of recentMetrics) {
      const deviation = Math.abs(metric - fp.baseline.mean) / (fp.baseline.stdDev || 1);
      if (deviation > threshold) {
        anomalies.push({
          type: 'heartbeat-interval',
          value: metric,
          expected: fp.baseline.mean,
          deviation: Math.round(deviation * 100) / 100,
          severity: deviation > threshold * 2 ? 'critical' : 'warning',
        });
      }
    }

    // Verificar tendencia de degradacao
    if (recentMetrics.length >= 3) {
      const trend = this._calculateTrend(recentMetrics);
      if (trend > 0.5) {
        anomalies.push({
          type: 'degradation-trend',
          value: Math.round(trend * 100) / 100,
          message: 'Heartbeat intervals increasing steadily — potential degradation',
          severity: trend > 1.0 ? 'critical' : 'warning',
        });
      }
    }

    const result = {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      message: anomalies.length > 0
        ? `${anomalies.length} anomaly(ies) detected for agent "${agentId}"`
        : 'No anomalies detected',
    };

    if (anomalies.length > 0) {
      this.emit(Events.ANOMALY_DETECTED, { agentId, ...result });
    }

    return result;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                      CASCADE PROTECTION
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Declara dependencia entre agentes
   * @param {string} agentId - Agente dependente
   * @param {string} dependsOnId - Agente do qual depende
   */
  declareDependency(agentId, dependsOnId) {
    this._assertAgentExists(agentId);
    this._assertAgentExists(dependsOnId);

    if (agentId === dependsOnId) {
      throw new Error('An agent cannot depend on itself');
    }

    const deps = this._dependencies.get(agentId) ?? [];
    if (!deps.includes(dependsOnId)) {
      deps.push(dependsOnId);
      this._dependencies.set(agentId, deps);
    }
  }

  /**
   * Calcula o risco de cascata para um agente
   * @param {string} agentId - Identificador do agente
   * @returns {Object} Analise de risco de cascata
   */
  getCascadeRisk(agentId) {
    this._assertAgentExists(agentId);

    // Encontrar todos os agentes que dependem deste (direta e indiretamente)
    const dependents = this._findDependents(agentId);
    const agent = this.agents.get(agentId);

    // Avaliar risco com base no status e numero de dependentes
    const isHealthy = agent.status === AgentStatus.ALIVE;
    const healthScore = this._calculateHealthScore(agent);

    let riskLevel = 'low';
    if (dependents.length > 3 && !isHealthy) {
      riskLevel = 'critical';
    } else if (dependents.length > 1 && !isHealthy) {
      riskLevel = 'high';
    } else if (dependents.length > 0 && healthScore < 50) {
      riskLevel = 'medium';
    }

    const result = {
      agentId,
      dependents,
      dependentCount: dependents.length,
      riskLevel,
      agentStatus: agent.status,
      healthScore,
    };

    if (riskLevel === 'critical' || riskLevel === 'high') {
      this.emit(Events.CASCADE_RISK, result);
    }

    return result;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PERSISTENCE
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Salva estado completo do protocolo em disco
   * @returns {Promise<void>}
   */
  async saveState() {
    this._saveQueue = this._saveQueue.then(async () => {
      const filePath = path.resolve(this.projectRoot, this.config.stateFile);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = {
        schemaVersion: this.config.schemaVersion,
        savedAt: new Date().toISOString(),
        agents: {},
        dependencies: {},
      };

      for (const [id, agent] of this.agents.entries()) {
        data.agents[id] = {
          id: agent.id,
          status: agent.status,
          registeredAt: agent.registeredAt,
          lastHeartbeat: agent.lastHeartbeat,
          lastSnapshot: agent.lastSnapshot,
          errorCount: agent.errorCount,
          snapshotCount: agent.snapshots.length,
          revivalCount: agent.revivalHistory.length,
          healthScore: this._calculateHealthScore(agent),
        };
      }

      for (const [id, deps] of this._dependencies.entries()) {
        data.dependencies[id] = [...deps];
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    });

    await this._saveQueue;
  }

  /**
   * Carrega estado do protocolo do disco
   * @returns {Promise<Object|null>} Estado carregado ou null
   */
  async loadState() {
    const filePath = path.resolve(this.projectRoot, this.config.stateFile);

    try {
      if (!fs.existsSync(filePath)) return null;
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      if (data.schemaVersion !== this.config.schemaVersion) return null;
      return data;
    } catch {
      return null;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          STATS
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Retorna estatisticas gerais do protocolo
   * @returns {Object} Estatisticas
   */
  getStats() {
    const stats = {
      totalAgents: this.agents.size,
      byStatus: {},
      totalRevivals: 0,
      totalSnapshots: 0,
      totalHeartbeats: 0,
      monitoringActive: this._heartbeatCheckers.size,
      dependencyEdges: 0,
    };

    for (const agent of this.agents.values()) {
      stats.byStatus[agent.status] = (stats.byStatus[agent.status] ?? 0) + 1;
      stats.totalRevivals += agent.revivalHistory.length;
      stats.totalSnapshots += agent.snapshots.length;
      stats.totalHeartbeats += agent.heartbeats.length;
    }

    for (const deps of this._dependencies.values()) {
      stats.dependencyEdges += deps.length;
    }

    return stats;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  //                          PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Verifica se o agente existe; lanca erro se nao
   * @param {string} agentId
   * @private
   */
  _assertAgentExists(agentId) {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent "${agentId}" is not registered`);
    }
  }

  /**
   * Verifica heartbeat de um agente e detecta morte
   * @param {string} agentId
   * @private
   */
  _checkHeartbeat(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const now = Date.now();
    const gracePeriod = agent.config.gracePeriodMs ?? this.config.gracePeriodMs;
    const elapsed = now - (agent.lastHeartbeat ?? agent.registeredAt);

    if (elapsed > gracePeriod) {
      if (agent.status === AgentStatus.ALIVE || agent.status === AgentStatus.SUSPECT) {
        agent.status = AgentStatus.DEAD;
        agent.errorCount++;

        this.emit(Events.DEATH_DETECTED, {
          agentId,
          lastHeartbeat: agent.lastHeartbeat,
          elapsed,
          errorCount: agent.errorCount,
          timestamp: now,
        });

        // Verificar risco de cascata
        const dependents = this._findDependents(agentId);
        if (dependents.length > 0) {
          this.emit(Events.CASCADE_RISK, {
            agentId,
            dependents,
            dependentCount: dependents.length,
            riskLevel: dependents.length > 3 ? 'critical' : 'high',
            agentStatus: AgentStatus.DEAD,
            healthScore: 0,
          });
        }

        // Auto-revival
        this.reviveAgent(agentId).catch(() => {
          // Revival falhou silenciosamente — ja emitido evento
        });
      }
    } else if (elapsed > gracePeriod * 0.6) {
      if (agent.status === AgentStatus.ALIVE) {
        agent.status = AgentStatus.SUSPECT;
        const healthScore = this._calculateHealthScore(agent);
        const warningThreshold = agent.config.healthWarningThreshold ?? this.config.healthWarningThreshold;
        if (healthScore < warningThreshold) {
          this.emit(Events.HEALTH_WARNING, {
            agentId,
            healthScore,
            status: AgentStatus.SUSPECT,
            timestamp: now,
          });
        }
      }
    }
  }

  /**
   * Atualiza fingerprint comportamental com nova metrica
   * @param {string} agentId
   * @param {number} metric - Intervalo do heartbeat
   * @private
   */
  _updateFingerprint(agentId, metric) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const fp = agent.fingerprint;
    const windowSize = agent.config.fingerprintWindowSize ?? this.config.fingerprintWindowSize;

    fp.metrics.push(metric);
    if (fp.metrics.length > windowSize) {
      fp.metrics = fp.metrics.slice(-windowSize);
    }

    // Recalcular baseline se temos metricas suficientes
    if (fp.metrics.length >= 5) {
      const mean = fp.metrics.reduce((a, b) => a + b, 0) / fp.metrics.length;
      const variance = fp.metrics.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / fp.metrics.length;
      const stdDev = Math.sqrt(variance);

      fp.baseline = {
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        sampleSize: fp.metrics.length,
        updatedAt: Date.now(),
      };
    }
  }

  /**
   * Calcula health score composto (0-100)
   * @param {Object} agent - Dados do agente
   * @returns {number} Score entre 0 e 100
   * @private
   */
  _calculateHealthScore(agent) {
    // Peso: heartbeat regularity (40%), error rate (30%), memoria estavel (30%)
    let heartbeatScore = 100;
    let errorScore = 100;
    let stabilityScore = 100;

    // Heartbeat regularity
    if (agent.heartbeats.length >= 2) {
      const intervals = [];
      for (let i = 1; i < agent.heartbeats.length; i++) {
        intervals.push(agent.heartbeats[i].timestamp - agent.heartbeats[i - 1].timestamp);
      }
      const expectedInterval = agent.config.heartbeatIntervalMs ?? this.config.heartbeatIntervalMs;
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const deviation = Math.abs(avgInterval - expectedInterval) / expectedInterval;
      heartbeatScore = Math.max(0, Math.round(100 * (1 - Math.min(deviation, 1))));
    } else if (agent.heartbeats.length === 0) {
      heartbeatScore = 0;
    }

    // Error rate (baseado no historico de revivals)
    if (agent.revivalHistory.length > 0) {
      const recentRevivals = agent.revivalHistory.filter(
        r => (Date.now() - r.timestamp) < (agent.config.revivalWindowMs ?? this.config.revivalWindowMs)
      );
      const maxRevivals = agent.config.maxRevivals ?? this.config.maxRevivals;
      errorScore = Math.max(0, Math.round(100 * (1 - recentRevivals.length / maxRevivals)));
    }

    // Estabilidade (baseada no desvio padrao do fingerprint)
    if (agent.fingerprint.baseline) {
      const cv = agent.fingerprint.baseline.mean > 0
        ? agent.fingerprint.baseline.stdDev / agent.fingerprint.baseline.mean
        : 0;
      stabilityScore = Math.max(0, Math.round(100 * (1 - Math.min(cv, 1))));
    }

    // Status penalty
    let statusPenalty = 0;
    if (agent.status === AgentStatus.DEAD) statusPenalty = 50;
    else if (agent.status === AgentStatus.SUSPECT) statusPenalty = 20;
    else if (agent.status === AgentStatus.REVIVING) statusPenalty = 30;

    const weighted = (heartbeatScore * 0.4) + (errorScore * 0.3) + (stabilityScore * 0.3);
    return Math.max(0, Math.min(100, Math.round(weighted - statusPenalty)));
  }

  /**
   * Calcula tendencia de uma serie de metricas
   * @param {number[]} values - Valores da serie
   * @returns {number} Coeficiente de tendencia (positivo = crescente)
   * @private
   */
  _calculateTrend(values) {
    if (values.length < 2) return 0;
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const denominator = (n * sumX2) - (sumX * sumX);
    if (denominator === 0) return 0;

    const slope = ((n * sumXY) - (sumX * sumY)) / denominator;
    const mean = sumY / n;

    // Normalizar pelo valor medio para obter taxa de variacao
    return mean > 0 ? slope / mean : 0;
  }

  /**
   * Encontra todos os agentes que dependem (direta ou indiretamente) de um agente
   * @param {string} agentId - Agente alvo
   * @returns {string[]} IDs dos agentes dependentes
   * @private
   */
  _findDependents(agentId) {
    const dependents = new Set();
    const visited = new Set();

    const search = (targetId) => {
      for (const [id, deps] of this._dependencies.entries()) {
        if (visited.has(id)) continue;
        if (deps.includes(targetId)) {
          dependents.add(id);
          visited.add(id);
          search(id); // Busca recursiva para dependentes indiretos
        }
      }
    };

    search(agentId);
    return [...dependents];
  }

  /**
   * Persiste snapshot em disco (serializado via promise chain)
   * @param {string} agentId
   * @param {Object} snapshot
   * @private
   */
  _persistSnapshot(agentId, snapshot) {
    this._saveQueue = this._saveQueue.then(() => {
      try {
        const dir = path.resolve(
          this.projectRoot,
          this.config.snapshotDir,
          agentId
        );

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, `${snapshot.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
      } catch {
        // Falha silenciosa na persistencia — nao bloqueia o fluxo
        if (this.listenerCount('error') > 0) {
          this.emit('error', new Error(`Failed to persist snapshot for agent "${agentId}"`));
        }
      }
    });
  }

  /**
   * Destroi o protocolo — para todos os monitoramentos e limpa recursos
   */
  destroy() {
    for (const agentId of this.agents.keys()) {
      this.stopMonitoring(agentId);
    }
    this.agents.clear();
    this._dependencies.clear();
    this.removeAllListeners();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

module.exports = AgentImmortalityProtocol;
module.exports.AgentImmortalityProtocol = AgentImmortalityProtocol;
module.exports.Events = Events;
module.exports.AgentStatus = AgentStatus;
module.exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
