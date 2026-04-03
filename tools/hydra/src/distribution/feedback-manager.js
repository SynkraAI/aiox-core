/**
 * @module feedback-manager
 * @description Feedback Loop (Story 5.6) — Manages relevance feedback from operators
 * for mind clone routing. Adjusts routing weights automatically.
 *
 * Feedback is stored per-clone in YAML files.
 * Routing adjustments (boosts/penalties) are computed from feedback history
 * and written to routing-adjustments.yaml for the content router to consume.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../hydra-data');

const VALID_RATINGS = ['useful', 'irrelevant', 'partially-relevant'];

/**
 * @typedef {Object} FeedbackEntry
 * @property {string} content_id
 * @property {string} rating - useful | irrelevant | partially-relevant
 * @property {string} timestamp
 * @property {string} [comment]
 */

/**
 * Feedback Manager for routing relevance feedback.
 */
export class FeedbackManager {
  /**
   * @param {Object} [options]
   * @param {string} [options.dataDir] - Hydra data directory
   * @param {number} [options.boostIncrement=0.05]
   * @param {number} [options.penaltyIncrement=0.05]
   * @param {number} [options.minRelevanceFloor=0.2]
   * @param {number} [options.irrelevantThreshold=0.5]
   * @param {number} [options.resetIntervalDays=30]
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || DEFAULT_DATA_DIR;
    this.feedbackDir = path.join(this.dataDir, 'feedback');
    this.boostIncrement = options.boostIncrement ?? 0.05;
    this.penaltyIncrement = options.penaltyIncrement ?? 0.05;
    this.minRelevanceFloor = options.minRelevanceFloor ?? 0.2;
    this.irrelevantThreshold = options.irrelevantThreshold ?? 0.5;
    this.resetIntervalDays = options.resetIntervalDays ?? 30;
  }

  /**
   * Ensure feedback directory exists.
   * @private
   */
  _ensureDir() {
    if (!fs.existsSync(this.feedbackDir)) {
      fs.mkdirSync(this.feedbackDir, { recursive: true });
    }
  }

  /**
   * Get feedback file path for a clone.
   * @param {string} cloneId
   * @returns {string}
   */
  _feedbackPath(cloneId) {
    return path.join(this.feedbackDir, `${cloneId}.yaml`);
  }

  /**
   * Load feedback for a clone.
   * @param {string} cloneId
   * @returns {{ clone_id: string, feedback: FeedbackEntry[] }}
   */
  loadFeedback(cloneId) {
    const filePath = this._feedbackPath(cloneId);
    if (!fs.existsSync(filePath)) {
      return { clone_id: cloneId, feedback: [] };
    }
    try {
      const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
      return data || { clone_id: cloneId, feedback: [] };
    } catch {
      return { clone_id: cloneId, feedback: [] };
    }
  }

  /**
   * Save feedback for a clone.
   * @param {string} cloneId
   * @param {{ clone_id: string, feedback: FeedbackEntry[] }} data
   */
  saveFeedback(cloneId, data) {
    this._ensureDir();
    const filePath = this._feedbackPath(cloneId);
    fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: -1 }), 'utf-8');
  }

  /**
   * Add feedback for a content item routed to a clone.
   * @param {string} cloneId
   * @param {string} contentId
   * @param {string} rating - useful | irrelevant | partially-relevant
   * @param {string} [comment]
   * @returns {{ success: boolean, error?: string }}
   */
  addFeedback(cloneId, contentId, rating, comment) {
    if (!VALID_RATINGS.includes(rating)) {
      return { success: false, error: `Invalid rating "${rating}". Must be one of: ${VALID_RATINGS.join(', ')}` };
    }

    if (!cloneId || !contentId) {
      return { success: false, error: 'Clone ID and content ID are required' };
    }

    const data = this.loadFeedback(cloneId);

    // Check for duplicate
    const existing = data.feedback.find(f => f.content_id === contentId);
    if (existing) {
      existing.rating = rating;
      existing.timestamp = new Date().toISOString();
      if (comment) existing.comment = comment;
    } else {
      const entry = {
        content_id: contentId,
        rating,
        timestamp: new Date().toISOString(),
      };
      if (comment) entry.comment = comment;
      data.feedback.push(entry);
    }

    this.saveFeedback(cloneId, data);
    return { success: true };
  }

  /**
   * Compute routing adjustments from all feedback.
   * @returns {Object} Adjustments keyed by clone ID
   */
  computeAdjustments() {
    this._ensureDir();
    const adjustments = {};

    let files;
    try {
      files = fs.readdirSync(this.feedbackDir).filter(f => f.endsWith('.yaml') && f !== 'routing-adjustments.yaml');
    } catch {
      return adjustments;
    }

    for (const file of files) {
      const cloneId = file.replace('.yaml', '');
      const data = this.loadFeedback(cloneId);
      if (!data.feedback || data.feedback.length === 0) continue;

      // Filter to recent feedback (within reset interval)
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.resetIntervalDays);
      const recentFeedback = data.feedback.filter(f => new Date(f.timestamp) >= cutoff);

      if (recentFeedback.length === 0) continue;

      const adj = { keyword_boosts: {}, keyword_penalties: {} };

      // Count ratings
      const usefulCount = recentFeedback.filter(f => f.rating === 'useful').length;
      const irrelevantCount = recentFeedback.filter(f => f.rating === 'irrelevant').length;
      const total = recentFeedback.length;

      // If too many irrelevant, raise minimum threshold for this clone
      const irrelevantRatio = irrelevantCount / total;
      if (irrelevantRatio > this.irrelevantThreshold) {
        adj.min_relevance_override = 0.35; // Raise from default 0.3
      }

      // Simple boost/penalty: aggregate by rating
      // Useful items boost the clone, irrelevant items penalize
      if (usefulCount > 0) {
        adj.general_boost = Math.min(usefulCount * this.boostIncrement, 0.3);
      }
      if (irrelevantCount > 0) {
        adj.general_penalty = -Math.min(irrelevantCount * this.penaltyIncrement, 0.3);
      }

      adjustments[cloneId] = adj;
    }

    return adjustments;
  }

  /**
   * Save computed adjustments to routing-adjustments.yaml.
   * @returns {{ path: string, saved: boolean, error?: string }}
   */
  saveAdjustments() {
    this._ensureDir();
    const adjustments = this.computeAdjustments();
    const filePath = path.join(this.feedbackDir, 'routing-adjustments.yaml');

    try {
      const data = {
        adjustments,
        computed_at: new Date().toISOString(),
        reset_interval_days: this.resetIntervalDays,
      };
      fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: -1 }), 'utf-8');
      return { path: filePath, saved: true };
    } catch (error) {
      return { path: '', saved: false, error: error.message };
    }
  }

  /**
   * Reset all adjustments (monthly reset).
   * @returns {{ reset: boolean, error?: string }}
   */
  resetAdjustments() {
    const filePath = path.join(this.feedbackDir, 'routing-adjustments.yaml');
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { reset: true };
    } catch (error) {
      return { reset: false, error: error.message };
    }
  }

  /**
   * Get feedback stats for display.
   * @returns {{ totalClones: number, totalFeedback: number, usefulCount: number, irrelevantCount: number }}
   */
  getStats() {
    this._ensureDir();
    let totalFeedback = 0;
    let usefulCount = 0;
    let irrelevantCount = 0;

    let files;
    try {
      files = fs.readdirSync(this.feedbackDir).filter(f => f.endsWith('.yaml') && f !== 'routing-adjustments.yaml');
    } catch {
      return { totalClones: 0, totalFeedback: 0, usefulCount: 0, irrelevantCount: 0 };
    }

    for (const file of files) {
      const cloneId = file.replace('.yaml', '');
      const data = this.loadFeedback(cloneId);
      if (!data.feedback) continue;
      totalFeedback += data.feedback.length;
      usefulCount += data.feedback.filter(f => f.rating === 'useful').length;
      irrelevantCount += data.feedback.filter(f => f.rating === 'irrelevant').length;
    }

    return {
      totalClones: files.length,
      totalFeedback,
      usefulCount,
      irrelevantCount,
    };
  }
}
