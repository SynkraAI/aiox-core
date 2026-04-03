/**
 * DriftBaseline -- Agent Baseline Calculator and Store
 *
 * Computes and persists rolling baselines per agent for drift detection.
 * Tracks: response time, output length, error rate, tool call patterns.
 * Uses a rolling window (default 50 interactions) for statistical stability.
 *
 * Inspired by AgentDrift (Wu et al., 2026) -- arXiv:2603.12564
 *
 * @module corporation/monitors/drift-baseline
 * @version 1.0.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_WINDOW_SIZE = 50;
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../../hydra-data/drift');
const BASELINE_FILE = 'baselines.json';

// =====================================================
// DriftBaseline
// =====================================================

export class DriftBaseline {
  /**
   * @param {Object} [options]
   * @param {string} [options.dataDir] - Directory for baseline persistence
   * @param {number} [options.windowSize] - Rolling window size (default 50)
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || DEFAULT_DATA_DIR;
    this.windowSize = options.windowSize || DEFAULT_WINDOW_SIZE;

    /** @type {Map<string, Object>} agentId -> baseline data */
    this._baselines = new Map();
    this._loaded = false;
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  /**
   * Record an interaction for an agent. Updates the rolling window.
   *
   * @param {string} agentId - Agent identifier
   * @param {Object} interaction - Interaction metrics
   * @param {number} interaction.duration_ms - Response time in ms
   * @param {number} interaction.output_length - Output character count
   * @param {boolean} interaction.error - Whether interaction errored
   * @param {string[]} [interaction.tools_used] - Tools called during interaction
   * @param {string} [interaction.task_type] - Type of task performed
   * @param {string} [interaction.result] - Result status (success/failure/partial)
   */
  record(agentId, interaction) {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('agentId is required and must be a string');
    }
    if (!interaction || typeof interaction !== 'object') {
      throw new Error('interaction must be an object');
    }

    this._ensureLoaded();

    const entry = {
      timestamp: new Date().toISOString(),
      duration_ms: interaction.duration_ms ?? 0,
      output_length: interaction.output_length ?? 0,
      error: !!interaction.error,
      tools_used: Array.isArray(interaction.tools_used) ? interaction.tools_used : [],
      task_type: interaction.task_type || 'unknown',
      result: interaction.result || (interaction.error ? 'failure' : 'success'),
    };

    if (!this._baselines.has(agentId)) {
      this._baselines.set(agentId, {
        interactions: [],
        computed: null,
        updated_at: null,
      });
    }

    const baseline = this._baselines.get(agentId);
    baseline.interactions.push(entry);

    // Trim to window size
    if (baseline.interactions.length > this.windowSize) {
      baseline.interactions = baseline.interactions.slice(-this.windowSize);
    }

    // Recompute baseline stats
    baseline.computed = this._computeStats(baseline.interactions);
    baseline.updated_at = new Date().toISOString();

    return baseline.computed;
  }

  /**
   * Get the current baseline for an agent.
   *
   * @param {string} agentId
   * @returns {Object|null} Baseline stats or null if no data
   */
  getBaseline(agentId) {
    this._ensureLoaded();
    const baseline = this._baselines.get(agentId);
    if (!baseline || !baseline.computed) return null;
    return { ...baseline.computed, sample_size: baseline.interactions.length };
  }

  /**
   * Get baselines for all tracked agents.
   *
   * @returns {Object} Map of agentId -> baseline stats
   */
  getAllBaselines() {
    this._ensureLoaded();
    const result = {};
    for (const [agentId, baseline] of this._baselines) {
      if (baseline.computed) {
        result[agentId] = { ...baseline.computed, sample_size: baseline.interactions.length };
      }
    }
    return result;
  }

  /**
   * Check if an agent has enough data for a meaningful baseline.
   *
   * @param {string} agentId
   * @param {number} [minSamples=10] - Minimum interactions required
   * @returns {boolean}
   */
  hasBaseline(agentId, minSamples = 10) {
    this._ensureLoaded();
    const baseline = this._baselines.get(agentId);
    return !!(baseline && baseline.interactions.length >= minSamples);
  }

  /**
   * Get the last N interactions for an agent (for trend analysis).
   *
   * @param {string} agentId
   * @param {number} [n=10]
   * @returns {Object[]}
   */
  getRecentInteractions(agentId, n = 10) {
    this._ensureLoaded();
    const baseline = this._baselines.get(agentId);
    if (!baseline) return [];
    return baseline.interactions.slice(-n);
  }

  /**
   * Persist baselines to disk.
   */
  save() {
    this._ensureDir();
    const filePath = path.join(this.dataDir, BASELINE_FILE);
    const data = {};
    for (const [agentId, baseline] of this._baselines) {
      data[agentId] = baseline;
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Load baselines from disk.
   */
  load() {
    const filePath = path.join(this.dataDir, BASELINE_FILE);
    if (!fs.existsSync(filePath)) {
      this._loaded = true;
      return;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      this._baselines.clear();
      for (const [agentId, baseline] of Object.entries(data)) {
        this._baselines.set(agentId, baseline);
      }
    } catch {
      // Start fresh on corrupted data
      this._baselines.clear();
    }
    this._loaded = true;
  }

  /**
   * Clear all baseline data for an agent.
   *
   * @param {string} agentId
   */
  reset(agentId) {
    this._baselines.delete(agentId);
  }

  /**
   * Clear all baseline data.
   */
  resetAll() {
    this._baselines.clear();
  }

  // =====================================================
  // PRIVATE -- Statistics
  // =====================================================

  /**
   * Compute aggregate statistics from interaction window.
   * @private
   * @param {Object[]} interactions
   * @returns {Object} Computed stats
   */
  _computeStats(interactions) {
    if (interactions.length === 0) return null;

    const durations = interactions.map(i => i.duration_ms);
    const outputLengths = interactions.map(i => i.output_length);
    const errors = interactions.filter(i => i.error);

    // Tool usage frequency map
    const toolFrequency = {};
    for (const interaction of interactions) {
      for (const tool of interaction.tools_used) {
        toolFrequency[tool] = (toolFrequency[tool] || 0) + 1;
      }
    }

    // Task type distribution
    const taskDistribution = {};
    for (const interaction of interactions) {
      taskDistribution[interaction.task_type] = (taskDistribution[interaction.task_type] || 0) + 1;
    }

    return {
      avg_duration_ms: this._mean(durations),
      std_duration_ms: this._stddev(durations),
      median_duration_ms: this._median(durations),
      p95_duration_ms: this._percentile(durations, 0.95),
      avg_output_length: this._mean(outputLengths),
      std_output_length: this._stddev(outputLengths),
      error_rate: errors.length / interactions.length,
      error_count: errors.length,
      total_interactions: interactions.length,
      tool_frequency: toolFrequency,
      task_distribution: taskDistribution,
      avg_tools_per_interaction: this._mean(interactions.map(i => i.tools_used.length)),
    };
  }

  /**
   * @private
   * @param {number[]} values
   * @returns {number}
   */
  _mean(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * @private
   * @param {number[]} values
   * @returns {number}
   */
  _stddev(values) {
    if (values.length < 2) return 0;
    const avg = this._mean(values);
    const sumSq = values.reduce((sum, v) => sum + (v - avg) ** 2, 0);
    return Math.sqrt(sumSq / (values.length - 1));
  }

  /**
   * @private
   * @param {number[]} values
   * @returns {number}
   */
  _median(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * @private
   * @param {number[]} values
   * @param {number} p - Percentile (0-1)
   * @returns {number}
   */
  _percentile(values, p) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil(p * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  // =====================================================
  // PRIVATE -- File Operations
  // =====================================================

  /** @private */
  _ensureLoaded() {
    if (!this._loaded) {
      this.load();
    }
  }

  /** @private */
  _ensureDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export { DEFAULT_WINDOW_SIZE, DEFAULT_DATA_DIR };
