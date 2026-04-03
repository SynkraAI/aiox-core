/**
 * @module checkpoint
 * @description Checkpoint/resume state for pipeline source groups.
 * Saves progress between source groups so failed runs can resume.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} CheckpointData
 * @property {string} runId - Unique run identifier
 * @property {string} startedAt - ISO timestamp
 * @property {string[]} completedGroups - Groups that completed successfully
 * @property {string[]} pendingGroups - Groups not yet processed
 * @property {string} lastCheckpoint - ISO timestamp of last checkpoint save
 */

export class Checkpoint {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.checkpointFile] - Path to checkpoint file
   */
  constructor(options = {}) {
    this.checkpointFile = options.checkpointFile ??
      path.resolve(__dirname, '../../hydra-data/state/checkpoint.json');
  }

  /**
   * Start a new run checkpoint.
   * @param {string[]} allGroups - All source group names
   * @returns {CheckpointData}
   */
  startRun(allGroups) {
    const runId = `run-${createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 8)}`;
    const data = {
      runId,
      startedAt: new Date().toISOString(),
      completedGroups: [],
      pendingGroups: [...allGroups],
      lastCheckpoint: new Date().toISOString(),
    };
    this._save(data);
    return data;
  }

  /**
   * Mark a source group as completed.
   * @param {string} group - Group name
   */
  markCompleted(group) {
    const data = this.load();
    if (!data) return;

    if (!data.completedGroups.includes(group)) {
      data.completedGroups.push(group);
    }
    data.pendingGroups = data.pendingGroups.filter((g) => g !== group);
    data.lastCheckpoint = new Date().toISOString();
    this._save(data);
  }

  /**
   * Check if a group has already been completed.
   * @param {string} group - Group name
   * @returns {boolean}
   */
  isCompleted(group) {
    const data = this.load();
    if (!data) return false;
    return data.completedGroups.includes(group);
  }

  /**
   * Load existing checkpoint data.
   * @returns {CheckpointData|null}
   */
  load() {
    try {
      if (!fs.existsSync(this.checkpointFile)) return null;
      return JSON.parse(fs.readFileSync(this.checkpointFile, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Check if there is a resumable checkpoint.
   * @returns {boolean}
   */
  hasResumable() {
    const data = this.load();
    if (!data) return false;
    return data.pendingGroups.length > 0;
  }

  /**
   * Get pending groups from a checkpoint.
   * @returns {string[]}
   */
  getPendingGroups() {
    const data = this.load();
    if (!data) return [];
    return data.pendingGroups;
  }

  /**
   * Clear checkpoint (called on successful pipeline completion).
   */
  clear() {
    try {
      if (fs.existsSync(this.checkpointFile)) {
        fs.unlinkSync(this.checkpointFile);
      }
    } catch {
      // Best effort
    }
  }

  /** @private */
  _save(data) {
    try {
      const dir = path.dirname(this.checkpointFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.checkpointFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Non-critical
    }
  }
}
