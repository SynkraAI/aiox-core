/**
 * Hierarchical Context Manager
 *
 * Maintains a bounded LLM-ready message context by compacting older
 * short-term messages into long-term summaries. Summarization is injectable
 * and falls back to deterministic local extractive summaries, so tests and
 * offline agent loops do not require a live LLM provider.
 *
 * @module core/synapse/context/hierarchical-context-manager
 * @version 1.0.0
 * @created Story 447.1 - Hierarchical Context Manager Contract
 */

'use strict';

const { EventEmitter } = require('events');
const { estimateTokens } = require('../utils/tokens');

const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_SUMMARIZATION_THRESHOLD = 0.75;
const DEFAULT_MIN_RECENT_MESSAGES = 1;
const DEFAULT_SUMMARY_TOKEN_RATIO = 0.25;
const DEFAULT_SUMMARY_PREFIX = 'Long-term context summary';

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function normalizeThreshold(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_SUMMARIZATION_THRESHOLD;
  }
  if (value <= 0) return DEFAULT_SUMMARIZATION_THRESHOLD;
  if (value > 1) return 1;
  return value;
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function normalizeContent(content) {
  if (content === undefined || content === null) {
    return '';
  }
  return typeof content === 'string' ? content : JSON.stringify(content);
}

function normalizeTokenCount(value) {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (isPositiveNumber(value) || value === 0) {
    return Math.ceil(value);
  }
  if (value && isPositiveNumber(value.totalTokens)) {
    return Math.ceil(value.totalTokens);
  }
  if (value && isPositiveNumber(value.tokens)) {
    return Math.ceil(value.tokens);
  }
  return null;
}

function buildDefaultSummary(messages, options = {}) {
  const lines = [];
  const prefix = options.prefix || DEFAULT_SUMMARY_PREFIX;

  lines.push(`${prefix}: ${messages.length} message(s) compacted.`);

  for (const [index, message] of messages.entries()) {
    const role = message.role || 'unknown';
    const content = normalizeContent(message.content).replace(/\s+/g, ' ').trim();
    const excerpt = content.length > 360 ? `${content.slice(0, 357).trimEnd()}...` : content;
    const label = message.id ? `${index + 1}. ${role}#${message.id}` : `${index + 1}. ${role}`;
    lines.push(`- ${label}: ${excerpt}`);
  }

  return lines.join('\n');
}

class HierarchicalContextManager extends EventEmitter {
  /**
   * @param {object} [options={}]
   * @param {number} [options.maxTokens=8192] - Hard context token limit.
   * @param {number} [options.summarizationThreshold=0.75] - Swap threshold as maxTokens ratio.
   * @param {Function|object} [options.tokenizer] - Token counter function or tokenizer object.
   * @param {Function} [options.summarizer] - Optional sync/async summarizer.
   * @param {number} [options.minRecentMessages=1] - Messages to keep uncompressed when possible.
   * @param {Function} [options.onSwap] - Callback for swap:complete.
   * @param {Function} [options.onSwapError] - Callback for swap:error.
   */
  constructor(options = {}) {
    super();

    this.maxTokens = isPositiveNumber(options.maxTokens)
      ? Math.floor(options.maxTokens)
      : DEFAULT_MAX_TOKENS;
    this.summarizationThreshold = normalizeThreshold(options.summarizationThreshold);
    this.thresholdTokens = Math.max(1, Math.floor(this.maxTokens * this.summarizationThreshold));
    this.minRecentMessages = Number.isInteger(options.minRecentMessages) && options.minRecentMessages >= 0
      ? options.minRecentMessages
      : DEFAULT_MIN_RECENT_MESSAGES;
    this.summaryTokenRatio = isPositiveNumber(options.summaryTokenRatio)
      ? Math.min(options.summaryTokenRatio, 0.9)
      : DEFAULT_SUMMARY_TOKEN_RATIO;
    this.summaryPrefix = options.summaryPrefix || DEFAULT_SUMMARY_PREFIX;

    this._tokenizer = options.tokenizer || null;
    this._summarizer = typeof options.summarizer === 'function' ? options.summarizer : null;
    this._onSwap = typeof options.onSwap === 'function' ? options.onSwap : null;
    this._onSwapError = typeof options.onSwapError === 'function' ? options.onSwapError : null;

    this._shortTermMessages = [];
    this._longTermSummaries = [];
    this._swapCount = 0;
    this._lastSwap = null;
    this._lastError = null;
    this._operationQueue = Promise.resolve();
  }

  /**
   * Add one message and compact context if the threshold is crossed.
   *
   * @param {object} message - LLM message with role/content/metadata shape.
   * @returns {Promise<object>} Manager stats after insertion.
   */
  async addMessage(message) {
    return this._enqueueMutation(async () => {
      this._shortTermMessages.push(this._normalizeMessage(message));
      await this._compactIfNeeded();
      return this.getStats();
    });
  }

  /**
   * Add multiple messages sequentially.
   *
   * @param {object[]} messages - Messages to add.
   * @returns {Promise<object>} Manager stats after insertion.
   */
  async addMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new TypeError('addMessages expects an array of messages');
    }

    for (const message of messages) {
      await this.addMessage(message);
    }

    return this.getStats();
  }

  /**
   * Return LLM-ready context: long-term summaries first, recent messages next.
   *
   * @returns {object[]} Context messages.
   */
  getContext() {
    return this._cloneMessages([...this._longTermSummaries, ...this._shortTermMessages]);
  }

  /**
   * Return current context statistics.
   *
   * @returns {object}
   */
  getStats() {
    const shortTermTokens = this._countMessagesTokens(this._shortTermMessages);
    const longTermTokens = this._countMessagesTokens(this._longTermSummaries);

    return {
      maxTokens: this.maxTokens,
      summarizationThreshold: this.summarizationThreshold,
      thresholdTokens: this.thresholdTokens,
      shortTermMessages: this._shortTermMessages.length,
      longTermSummaries: this._longTermSummaries.length,
      totalMessages: this._shortTermMessages.length + this._longTermSummaries.length,
      shortTermTokens,
      longTermTokens,
      totalTokens: shortTermTokens + longTermTokens,
      swapCount: this._swapCount,
      lastSwap: cloneValue(this._lastSwap),
      lastError: this._lastError ? { message: this._lastError.message } : null,
    };
  }

  /**
   * Clear all short-term and long-term state.
   */
  clear() {
    this._shortTermMessages = [];
    this._longTermSummaries = [];
    this._swapCount = 0;
    this._lastSwap = null;
    this._lastError = null;
    this._operationQueue = Promise.resolve();
  }

  _enqueueMutation(operation) {
    const run = this._operationQueue.then(operation, operation);
    this._operationQueue = run.catch(() => {});
    return run;
  }

  _normalizeMessage(message) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      throw new TypeError('message must be an object with role/content fields');
    }

    const normalized = { ...message };
    normalized.role = normalized.role ? String(normalized.role) : 'user';
    normalized.content = normalizeContent(normalized.content);

    if (message.metadata !== undefined) {
      normalized.metadata = cloneValue(message.metadata);
    }

    return normalized;
  }

  async _compactIfNeeded() {
    let guard = 0;

    while (this._getTotalTokens() > this.thresholdTokens && guard < 12) {
      guard += 1;

      if (this._shortTermMessages.length > 0) {
        const messages = this._selectShortTermMessagesForSwap();
        if (messages.length === 0) break;
        await this._swapShortTermMessages(messages);
        continue;
      }

      if (this._longTermSummaries.length > 1) {
        await this._compactLongTermSummaries();
        continue;
      }

      break;
    }

    await this._fitLongTermSummariesToBudget();
  }

  async _fitLongTermSummariesToBudget() {
    if (this._getTotalTokens() <= this.maxTokens || this._longTermSummaries.length === 0) {
      return;
    }

    if (this._longTermSummaries.length > 1) {
      await this._compactLongTermSummaries();
    }

    if (this._getTotalTokens() > this.maxTokens && this._longTermSummaries.length > 0) {
      this._longTermSummaries = [
        this._truncateSummaryMessage(this._longTermSummaries[0]),
      ];
    }
  }

  _selectShortTermMessagesForSwap() {
    const totalTokens = this._getTotalTokens();
    const available = this._shortTermMessages.length;

    if (available === 0 || totalTokens <= this.thresholdTokens) {
      return [];
    }

    if (available <= this.minRecentMessages && totalTokens <= this.maxTokens) {
      return [];
    }

    const tokensToRemove = totalTokens - this.thresholdTokens;
    const keepRecent = available > 1 ? Math.min(this.minRecentMessages, available - 1) : 0;
    const maxSelectable = Math.max(1, available - keepRecent);
    const selected = [];
    let selectedTokens = 0;

    for (let index = 0; index < maxSelectable; index += 1) {
      const message = this._shortTermMessages[index];
      selected.push(message);
      selectedTokens += this._countMessageTokens(message);

      if (selectedTokens >= tokensToRemove) {
        break;
      }
    }

    return selected;
  }

  async _swapShortTermMessages(messages) {
    const beforeTokens = this._getTotalTokens();
    const summary = await this._summarizeMessages(messages, {
      source: 'short-term',
      targetTokens: this._summaryTargetTokens(),
    });

    this._shortTermMessages.splice(0, messages.length);
    this._longTermSummaries.push(summary);

    const afterTokens = this._getTotalTokens();
    this._recordSwap({
      source: 'short-term',
      messagesRemoved: messages.length,
      tokensBefore: beforeTokens,
      tokensAfter: afterTokens,
      summaryTokens: this._countMessageTokens(summary),
    });
  }

  async _compactLongTermSummaries() {
    const summaries = this._longTermSummaries;
    const beforeTokens = this._getTotalTokens();
    const summary = await this._summarizeMessages(summaries, {
      source: 'long-term',
      targetTokens: this._summaryTargetTokens(),
    });

    this._longTermSummaries = [summary];

    const afterTokens = this._getTotalTokens();
    this._recordSwap({
      source: 'long-term',
      messagesRemoved: summaries.length,
      tokensBefore: beforeTokens,
      tokensAfter: afterTokens,
      summaryTokens: this._countMessageTokens(summary),
    });
  }

  async _summarizeMessages(messages, options) {
    const targetTokens = options.targetTokens || this._summaryTargetTokens();
    let rawSummary = null;
    let fallbackUsed = false;

    if (this._summarizer) {
      try {
        rawSummary = await this._summarizer({
          messages: this._cloneMessages(messages),
          currentSummary: this._longTermSummaries.map(message => message.content).join('\n\n'),
          targetTokens,
          maxTokens: this.maxTokens,
          estimateTokens: text => this._countTextTokens(text),
        });
      } catch (error) {
        fallbackUsed = true;
        this._lastError = error;
        this._safeEmit('swap:error', {
          error,
          source: options.source,
          messages,
        });
      }
    }

    const summaryContent = this._normalizeSummaryResult(rawSummary)
      || buildDefaultSummary(messages, { prefix: this.summaryPrefix });
    const content = this._truncateTextToTokenBudget(summaryContent, targetTokens);

    return {
      role: 'system',
      content,
      metadata: {
        aiox: {
          type: 'hierarchical_context_summary',
          source: options.source,
          fallbackUsed,
          messagesSummarized: messages.length,
          createdAt: new Date().toISOString(),
          sourceMessages: this._extractSourceMessages(messages),
        },
      },
    };
  }

  _extractSourceMessages(messages) {
    const sources = [];

    for (const message of messages) {
      const nestedSources = message.metadata
        && message.metadata.aiox
        && Array.isArray(message.metadata.aiox.sourceMessages)
        ? message.metadata.aiox.sourceMessages
        : null;

      if (nestedSources) {
        sources.push(...cloneValue(nestedSources));
        continue;
      }

      sources.push({
        role: message.role,
        id: message.id,
        metadata: cloneValue(message.metadata),
      });
    }

    return sources;
  }

  _normalizeSummaryResult(result) {
    if (!result) return null;
    if (typeof result === 'string') return result.trim() || null;
    if (typeof result.content === 'string') return result.content.trim() || null;
    if (typeof result.summary === 'string') return result.summary.trim() || null;
    return null;
  }

  _truncateSummaryMessage(message) {
    const cloned = this._cloneMessage(message);
    cloned.content = this._truncateTextToTokenBudget(cloned.content, this._summaryTargetTokens());
    cloned.metadata = {
      ...(cloned.metadata || {}),
      aiox: {
        ...(cloned.metadata && cloned.metadata.aiox ? cloned.metadata.aiox : {}),
        truncatedToFitBudget: true,
      },
    };
    return cloned;
  }

  _truncateTextToTokenBudget(text, tokenBudget) {
    const suffix = '\n[summary truncated to fit context budget]';
    let result = normalizeContent(text);
    let attempts = 0;

    while (this._countTextTokens(result) > tokenBudget && result.length > suffix.length && attempts < 12) {
      attempts += 1;
      const currentTokens = this._countTextTokens(result);
      const ratio = Math.max(0.1, tokenBudget / currentTokens);
      const nextLength = Math.max(0, Math.floor(result.length * ratio) - suffix.length - 8);
      result = `${result.slice(0, nextLength).trimEnd()}${suffix}`;
    }

    return result;
  }

  _recordSwap(payload) {
    this._swapCount += 1;
    this._lastSwap = {
      ...payload,
      swapCount: this._swapCount,
      completedAt: new Date().toISOString(),
    };
    this._safeEmit('swap:complete', this._lastSwap);
  }

  _safeEmit(eventName, payload) {
    try {
      this.emit(eventName, payload);
    } catch (error) {
      this._lastError = error;
    }

    try {
      if (eventName === 'swap:complete' && this._onSwap) {
        this._onSwap(payload);
      }
      if (eventName === 'swap:error' && this._onSwapError) {
        this._onSwapError(payload);
      }
    } catch (error) {
      this._lastError = error;
    }
  }

  _summaryTargetTokens() {
    return Math.max(16, Math.floor(this.maxTokens * this.summaryTokenRatio));
  }

  _getTotalTokens() {
    return this._countMessagesTokens([...this._longTermSummaries, ...this._shortTermMessages]);
  }

  _countMessagesTokens(messages) {
    return messages.reduce((total, message) => total + this._countMessageTokens(message), 0);
  }

  _countMessageTokens(message) {
    const roleTokens = this._countTextTokens(message.role || '');
    const contentTokens = this._countTextTokens(normalizeContent(message.content));
    return roleTokens + contentTokens;
  }

  _countTextTokens(text) {
    const normalizedText = normalizeContent(text);

    if (typeof this._tokenizer === 'function') {
      const result = normalizeTokenCount(this._tokenizer(normalizedText));
      if (result !== null) return result;
    }

    if (this._tokenizer && typeof this._tokenizer.countTokens === 'function') {
      const result = normalizeTokenCount(this._tokenizer.countTokens(normalizedText));
      if (result !== null) return result;
    }

    if (this._tokenizer && typeof this._tokenizer.encode === 'function') {
      const result = normalizeTokenCount(this._tokenizer.encode(normalizedText));
      if (result !== null) return result;
    }

    return estimateTokens(normalizedText);
  }

  _cloneMessages(messages) {
    return messages.map(message => this._cloneMessage(message));
  }

  _cloneMessage(message) {
    return cloneValue(message);
  }
}

module.exports = {
  HierarchicalContextManager,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SUMMARIZATION_THRESHOLD,
  DEFAULT_MIN_RECENT_MESSAGES,
  DEFAULT_SUMMARY_TOKEN_RATIO,
  DEFAULT_SUMMARY_PREFIX,
  buildDefaultSummary,
};
