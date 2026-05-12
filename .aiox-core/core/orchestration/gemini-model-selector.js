/**
 * Gemini Model Selector
 * Story GEMINI-INT.16 - Dynamic Model Switching
 *
 * Automatically selects between Gemini Flash and Pro based on task complexity.
 */

const { TaskComplexityClassifier } = require('./task-complexity-classifier');

/**
 * Model configuration
 */
const MODELS = {
  flash: {
    id: 'gemini-2.0-flash',
    costPer1kTokens: 0.000125,
    maxTokens: 32000,
    bestFor: ['simple', 'medium'],
  },
  pro: {
    id: 'gemini-2.0-pro',
    costPer1kTokens: 0.00125,
    maxTokens: 128000,
    bestFor: ['complex'],
  },
};

/**
 * Agent-based model overrides
 * Keys match agent IDs (without @ prefix)
 */
const AGENT_OVERRIDES = {
  architect: 'pro',
  analyst: 'pro',
  qa: 'flash',
  pm: 'flash',
  dev: 'auto',
  devops: 'flash',
};

class GeminiModelSelector {
  constructor(config = {}) {
    this.classifier = new TaskComplexityClassifier();
    this.defaultModel = config.defaultModel || 'flash';
    this.agentOverrides = { ...AGENT_OVERRIDES, ...config.agentOverrides };
    this.qualityFallback = config.qualityFallback !== false;
    this.minQualityScore = config.minQualityScore || 0.6;

    // Usage tracking
    this.usage = {
      flash: { count: 0, tokens: 0, cost: 0 },
      pro: { count: 0, tokens: 0, cost: 0 },
    };
  }

  /**
   * Select model for a task
   * @param {Object} task - Task to analyze
   * @param {string} agentId - Agent handling the task
   * @returns {Object} Model selection
   */
  selectModel(task, agentId = null) {
    // Normalize agentId (remove @ prefix if present)
    const normalizedAgentId = agentId?.replace(/^@/, '') || null;

    // Check agent override first
    if (normalizedAgentId && this.agentOverrides[normalizedAgentId]) {
      const override = this.agentOverrides[normalizedAgentId];
      if (override !== 'auto') {
        return this._buildSelection(override, 'agent_override', normalizedAgentId);
      }
    }

    // Classify task complexity
    const complexity = this.classifier.classify(task);

    // Select based on complexity
    let model = this.defaultModel;

    if (complexity.level === 'complex' || complexity.score > 0.7) {
      model = 'pro';
    } else if (complexity.level === 'simple' || complexity.score < 0.3) {
      model = 'flash';
    }

    return this._buildSelection(model, 'complexity', complexity);
  }

  /**
   * Handle quality fallback
   * @param {string} originalModel - Model that was used
   * @param {number} qualityScore - Quality score of response
   * @returns {Object|null} Fallback recommendation or null
   */
  handleQualityFallback(originalModel, qualityScore) {
    if (!this.qualityFallback) return null;

    if (originalModel === 'flash' && qualityScore < this.minQualityScore) {
      return {
        shouldRetry: true,
        newModel: 'pro',
        reason: `Quality score ${qualityScore} below threshold ${this.minQualityScore}`,
      };
    }

    return null;
  }

  /**
   * Track model usage
   * @param {string} model - Model used
   * @param {number} tokens - Tokens consumed
   */
  trackUsage(model, tokens) {
    const modelKey = model.includes('flash') ? 'flash' : 'pro';
    const modelConfig = MODELS[modelKey];

    this.usage[modelKey].count++;
    this.usage[modelKey].tokens += tokens;
    this.usage[modelKey].cost += (tokens / 1000) * modelConfig.costPer1kTokens;
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    const total = {
      count: this.usage.flash.count + this.usage.pro.count,
      tokens: this.usage.flash.tokens + this.usage.pro.tokens,
      cost: this.usage.flash.cost + this.usage.pro.cost,
    };

    return {
      ...this.usage,
      total,
      flashRatio: total.count > 0 ? this.usage.flash.count / total.count : 0,
      costSavings: this._calculateCostSavings(),
    };
  }

  _buildSelection(model, reason, details) {
    const modelConfig = MODELS[model];
    return {
      model: modelConfig.id,
      modelKey: model,
      reason,
      details,
      config: modelConfig,
    };
  }

  _calculateCostSavings() {
    // Calculate how much was saved by using Flash instead of Pro
    const flashTokens = this.usage.flash.tokens;
    const proOnlyCost = (flashTokens / 1000) * MODELS.pro.costPer1kTokens;
    const actualCost = this.usage.flash.cost;
    return proOnlyCost - actualCost;
  }
}

module.exports = { GeminiModelSelector, MODELS, AGENT_OVERRIDES };
