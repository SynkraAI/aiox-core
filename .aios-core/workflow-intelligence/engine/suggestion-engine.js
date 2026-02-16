/**
 * @module SuggestionEngine
 * @description High-level suggestion engine for the *next task
 * @story WIS-3 - *next Task Implementation
 * @story WIS-5 - Pattern Capture Integration
 * @version 1.1.0
 *
 * @example
 * const { SuggestionEngine } = require('./suggestion-engine');
 * const engine = new SuggestionEngine();
 *
 * const context = await engine.buildContext({ storyOverride: 'path/to/story.md' });
 * const result = await engine.suggestNext(context);
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Lazy-loaded dependencies for performance
let wis = null;
let SessionContextLoader = null;
let learning = null;
let WorkflowStateManager = null;

/**
 * Default cache TTL for suggestions (5 minutes)
 * @type {number}
 */
const SUGGESTION_CACHE_TTL = 5 * 60 * 1000;

/**
 * Low confidence threshold for marking suggestions as "uncertain"
 * @type {number}
 */
const LOW_CONFIDENCE_THRESHOLD = 0.5;

/**
 * SuggestionEngine class for generating context-aware command suggestions
 */
class SuggestionEngine {
  /**
   * Create a SuggestionEngine instance
   * @param {Object} options - Configuration options
   * @param {number} options.cacheTTL - Cache time-to-live in milliseconds
   * @param {boolean} options.lazyLoad - Whether to lazy-load dependencies
   * @param {boolean} options.useLearnedPatterns - Whether to use learned patterns (default: true)
   * @param {number} options.learnedPatternBoost - Confidence boost for learned patterns (default: 0.15)
   */
  constructor(options = {}) {
    this.cacheTTL = options.cacheTTL || SUGGESTION_CACHE_TTL;
    this.lazyLoad = options.lazyLoad !== false;
    this.useLearnedPatterns = options.useLearnedPatterns !== false;
    this.learnedPatternBoost = options.learnedPatternBoost || 0.15;
    this.suggestionCache = null;
    this.cacheTimestamp = null;
    this.cacheKey = null;

    // Load dependencies immediately if not lazy loading
    if (!this.lazyLoad) {
      this._loadDependencies();
    }
  }

  /**
   * Lazy-load WIS and session dependencies
   * @private
   */
  _loadDependencies() {
    if (!wis) {
      try {
        wis = require('../index');
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load WIS module:', error.message);
        wis = null;
      }
    }

    if (!SessionContextLoader) {
      try {
        SessionContextLoader = require('../../core/session/context-loader');
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load SessionContextLoader:', error.message);
        SessionContextLoader = null;
      }
    }

    if (!learning && this.useLearnedPatterns) {
      try {
        learning = require('../learning');
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load learning module:', error.message);
        learning = null;
      }
    }

    if (!WorkflowStateManager) {
      try {
        ({ WorkflowStateManager } = require('../../development/scripts/workflow-state-manager'));
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load WorkflowStateManager:', error.message);
        WorkflowStateManager = null;
      }
    }
  }

  /**
   * Build context from multiple sources
   * @param {Object} options - Context building options
   * @param {string} options.storyOverride - Explicit story path (optional)
   * @param {boolean} options.autoDetect - Whether to auto-detect context (default: true)
   * @param {string} options.agentId - Current agent ID (optional)
   * @returns {Promise<Object>} Built context object
   */
  async buildContext(options = {}) {
    this._loadDependencies();

    const context = {
      agentId: options.agentId || this._detectCurrentAgent(),
      lastCommand: null,
      lastCommands: [],
      storyPath: null,
      branch: null,
      projectState: {},
    };

    // 1. Load session context if available
    if (options.autoDetect !== false && SessionContextLoader) {
      try {
        const loader = new SessionContextLoader();
        const sessionContext = loader.loadContext(context.agentId);

        context.lastCommands = sessionContext.lastCommands || [];
        context.lastCommand = context.lastCommands[context.lastCommands.length - 1] || null;
        context.storyPath = sessionContext.currentStory || null;
        context.workflowActive = sessionContext.workflowActive || null;
      } catch (error) {
        console.warn('[SuggestionEngine] Failed to load session context:', error.message);
      }
    }

    // 2. Story override takes precedence
    if (options.storyOverride) {
      const resolvedPath = this._resolveStoryPath(options.storyOverride);
      if (resolvedPath) {
        context.storyPath = resolvedPath;
      }
    }

    // 3. Detect git branch
    context.branch = this._detectGitBranch();

    // 4. Build project state
    context.projectState = await this._buildProjectState(context);

    return context;
  }

  /**
   * Get suggestions for next commands based on context
   * @param {Object} context - Current session context
   * @returns {Promise<Object>} Suggestion result
   */
  async suggestNext(context) {
    this._loadDependencies();
    const runtimeNext = this._getRuntimeNextRecommendation(context);

    // Check cache first
    const cacheKey = this._generateCacheKey(context);
    if (this._isCacheValid(cacheKey)) {
      return this._withRuntimeRecommendation(this.suggestionCache, runtimeNext);
    }

    // Default result for when WIS is not available
    const defaultResult = {
      workflow: null,
      currentState: null,
      confidence: 0,
      suggestions: [],
      isUncertain: true,
      message: 'Unable to determine workflow context',
    };

    if (!wis) {
      return this._withRuntimeRecommendation(defaultResult, runtimeNext);
    }

    try {
      // Get suggestions from WIS
      const suggestions = wis.getSuggestions(context);

      if (!suggestions || suggestions.length === 0) {
        return this._withRuntimeRecommendation({
          ...defaultResult,
          message: 'No matching workflow found for current context',
        }, runtimeNext);
      }

      // Get workflow match info
      const commands = context.lastCommands || (context.lastCommand ? [context.lastCommand] : []);
      const match = wis.matchWorkflow(commands);

      // Calculate overall confidence
      const _avgConfidence =
        suggestions.length > 0
          ? suggestions.reduce((sum, s) => sum + (s.confidence || 0), 0) / suggestions.length
          : 0;

      // Format base suggestions
      let formattedSuggestions = suggestions.map((s, index) => ({
        command: `*${s.command}`,
        args: this._interpolateArgs(s.args_template, context),
        description: s.description || '',
        confidence: Math.round((s.confidence || 0) * 100) / 100,
        priority: s.priority || index + 1,
        source: 'workflow',
      }));

      // Apply learned pattern boost (WIS-5)
      if (this.useLearnedPatterns && learning) {
        formattedSuggestions = this._applyLearnedPatternBoost(formattedSuggestions, context);
      }

      // Re-sort after boost
      formattedSuggestions.sort((a, b) => b.confidence - a.confidence);

      // Recalculate average confidence
      const finalAvgConfidence =
        formattedSuggestions.length > 0
          ? formattedSuggestions.reduce((sum, s) => sum + s.confidence, 0) /
            formattedSuggestions.length
          : 0;

      // Build result
      let result = {
        workflow: match?.name || suggestions[0]?.workflow || null,
        currentState: suggestions[0]?.state || null,
        confidence: Math.round(finalAvgConfidence * 100) / 100,
        suggestions: formattedSuggestions,
        isUncertain: finalAvgConfidence < LOW_CONFIDENCE_THRESHOLD,
        message: null,
      };

      result = this._withRuntimeRecommendation(result, runtimeNext);

      // Cache the result
      this._cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      console.error('[SuggestionEngine] Error getting suggestions:', error.message);
      return {
        ...defaultResult,
        message: `Error: ${error.message}`,
      };
    }
  }

  /**
   * Build runtime execution signals for deterministic next-action recommendation
   * @param {Object} context - Current session context
   * @returns {Object} Normalized runtime signals
   * @private
   */
  _buildRuntimeSignals(context = {}) {
    const projectState = context.projectState || {};
    const hasUncommitted =
      typeof projectState.hasUncommittedChanges === 'boolean'
        ? projectState.hasUncommittedChanges
        : false;

    const baseSignals = {
      story_status:
        projectState.story_status || projectState.storyStatus || (projectState.activeStory ? 'in_progress' : 'unknown'),
      qa_status: projectState.qa_status || projectState.qaStatus || 'unknown',
      ci_status:
        projectState.ci_status ||
        projectState.ciStatus ||
        (projectState.failingTests ? 'failed' : 'unknown'),
      has_uncommitted_changes: hasUncommitted,
    };

    return {
      ...baseSignals,
      ...(context.executionSignals || {}),
    };
  }

  /**
   * Get deterministic runtime-first recommendation if signals are available
   * @param {Object} context - Current session context
   * @returns {Object|null} Runtime recommendation or null
   * @private
   */
  _getRuntimeNextRecommendation(context = {}) {
    if (!WorkflowStateManager) {
      return null;
    }

    try {
      const manager = new WorkflowStateManager();
      const runtimeSignals = this._buildRuntimeSignals(context);
      const recommendation = manager.getNextActionRecommendation(runtimeSignals, {
        story: context.storyPath || '',
      });

      if (!recommendation || recommendation.state === 'unknown') {
        return null;
      }

      return recommendation;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Merge runtime-first deterministic recommendation into suggestion result.
   * @param {Object} result - Suggestion result
   * @param {Object|null} runtimeNext - Runtime recommendation
   * @returns {Object} Enhanced result
   * @private
   */
  _withRuntimeRecommendation(result, runtimeNext) {
    if (!result || !runtimeNext) {
      return result;
    }

    const runtimeSuggestion = {
      command: runtimeNext.command,
      args: '',
      description: runtimeNext.rationale,
      confidence: runtimeNext.confidence,
      priority: 0,
      source: 'runtime_first',
      agent: runtimeNext.agent,
      executionState: runtimeNext.state,
    };

    const existing = Array.isArray(result.suggestions) ? result.suggestions : [];
    const normalizedRuntimeCommand = String(runtimeSuggestion.command || '').trim().toLowerCase();
    const deduped = existing.filter(
      (s) => String((s.command || '') + (s.args ? ` ${s.args}` : '')).trim().toLowerCase() !== normalizedRuntimeCommand,
    );

    return {
      ...result,
      suggestions: [runtimeSuggestion, ...deduped],
      confidence: Math.max(result.confidence || 0, runtimeNext.confidence || 0),
      isUncertain: false,
      runtimeState: runtimeNext.state,
    };
  }

  /**
   * Detect current active agent from environment or session
   * @returns {string} Agent ID
   * @private
   */
  _detectCurrentAgent() {
    // Check environment variable first
    if (process.env.AIOS_CURRENT_AGENT) {
      return process.env.AIOS_CURRENT_AGENT.replace('@', '');
    }

    // Default to 'dev' if unknown
    return 'dev';
  }

  /**
   * Resolve and validate story path
   * @param {string} storyPath - Story path to resolve
   * @returns {string|null} Resolved path or null if invalid
   * @private
   */
  _resolveStoryPath(storyPath) {
    if (!storyPath) return null;

    // Handle relative paths
    const resolved = path.isAbsolute(storyPath)
      ? storyPath
      : path.resolve(process.cwd(), storyPath);

    // Validate file exists
    try {
      if (fs.existsSync(resolved)) {
        return resolved;
      }
    } catch (_error) {
      // File doesn't exist
    }

    console.warn(`[SuggestionEngine] Story path not found: ${storyPath}`);
    return null;
  }

  /**
   * Detect current git branch
   * @returns {string|null} Branch name or null
   * @private
   */
  _detectGitBranch() {
    try {
      const gitHeadPath = path.join(process.cwd(), '.git', 'HEAD');
      if (fs.existsSync(gitHeadPath)) {
        const content = fs.readFileSync(gitHeadPath, 'utf8').trim();
        if (content.startsWith('ref: refs/heads/')) {
          return content.replace('ref: refs/heads/', '');
        }
      }
    } catch (_error) {
      // Git not available or not a git repo
    }
    return null;
  }

  /**
   * Build project state object
   * @param {Object} context - Current context
   * @returns {Promise<Object>} Project state
   * @private
   */
  async _buildProjectState(context) {
    const state = {
      activeStory: !!context.storyPath,
      hasUncommittedChanges: false,
      failingTests: false,
      workflowPhase: null,
    };

    // Check for uncommitted changes
    try {
      const gitStatusPath = path.join(process.cwd(), '.git', 'index');
      if (fs.existsSync(gitStatusPath)) {
        // Simple check - if there are modified files in git status
        // For production, would use git status command
        state.hasUncommittedChanges = true; // Assume true for now
      }
    } catch (_error) {
      // Ignore
    }

    // Infer workflow phase from last command
    if (context.lastCommand) {
      const cmd = context.lastCommand.toLowerCase();
      if (cmd.includes('develop') || cmd.includes('implement')) {
        state.workflowPhase = 'development';
      } else if (cmd.includes('review') || cmd.includes('qa')) {
        state.workflowPhase = 'review';
      } else if (cmd.includes('push') || cmd.includes('pr') || cmd.includes('deploy')) {
        state.workflowPhase = 'deployment';
      } else if (cmd.includes('create') || cmd.includes('story') || cmd.includes('epic')) {
        state.workflowPhase = 'planning';
      }
    }

    return state;
  }

  /**
   * Interpolate argument templates with context values
   * @param {string} argsTemplate - Template string with ${var} placeholders
   * @param {Object} context - Context for interpolation
   * @returns {string} Interpolated arguments
   * @private
   */
  _interpolateArgs(argsTemplate, context) {
    if (!argsTemplate) return '';

    return argsTemplate
      .replace(/\$\{story_path\}/g, context.storyPath || '')
      .replace(/\$\{epic_path\}/g, context.epicPath || '')
      .replace(/\$\{doc_path\}/g, context.docPath || '')
      .replace(/\$\{file_path\}/g, context.filePath || '')
      .replace(/\$\{feature_name\}/g, context.featureName || '')
      .replace(/\$\{topic\}/g, context.topic || '')
      .replace(/\$\{branch\}/g, context.branch || '')
      .trim();
  }

  /**
   * Generate cache key from context
   * @param {Object} context - Context object
   * @returns {string} Cache key
   * @private
   */
  _generateCacheKey(context) {
    const keyParts = [
      context.agentId || '',
      context.lastCommand || '',
      (context.lastCommands || []).slice(-3).join(','),
      context.storyPath || '',
      context.branch || '',
    ];
    return keyParts.join('|');
  }

  /**
   * Check if cache is valid for given key
   * @param {string} key - Cache key
   * @returns {boolean} True if cache is valid
   * @private
   */
  _isCacheValid(key) {
    if (!this.suggestionCache || !this.cacheTimestamp || !this.cacheKey) {
      return false;
    }
    if (this.cacheKey !== key) {
      return false;
    }
    return Date.now() - this.cacheTimestamp < this.cacheTTL;
  }

  /**
   * Cache suggestion result
   * @param {string} key - Cache key
   * @param {Object} result - Result to cache
   * @private
   */
  _cacheResult(key, result) {
    this.suggestionCache = result;
    this.cacheTimestamp = Date.now();
    this.cacheKey = key;
  }

  /**
   * Apply learned pattern boost to suggestions
   * @param {Object[]} suggestions - Base suggestions
   * @param {Object} context - Session context
   * @returns {Object[]} Boosted suggestions
   * @private
   */
  _applyLearnedPatternBoost(suggestions, context) {
    if (!learning) {
      return suggestions;
    }

    try {
      // Get commands to match against
      const lastCommands = context.lastCommands || [];
      if (lastCommands.length === 0 && context.lastCommand) {
        lastCommands.push(context.lastCommand);
      }

      if (lastCommands.length === 0) {
        return suggestions;
      }

      // Find matching learned patterns
      const matchingPatterns = learning.findMatchingPatterns(lastCommands);

      if (!matchingPatterns || matchingPatterns.length === 0) {
        return suggestions;
      }

      // Build a map of command -> boost based on learned patterns
      const boostMap = new Map();

      for (const pattern of matchingPatterns) {
        // Find the next command in the pattern after the current position
        const patternSeq = pattern.sequence || [];
        const matchIndex = this._findSequencePosition(lastCommands, patternSeq);

        if (matchIndex >= 0 && matchIndex < patternSeq.length - 1) {
          const nextCommand = patternSeq[matchIndex + 1];
          const currentBoost = boostMap.get(nextCommand) || 0;

          // Calculate boost based on pattern quality
          const occurrenceBoost = Math.min(pattern.occurrences * 0.02, 0.1);
          const successBoost = (pattern.successRate || 1) * 0.05;
          const similarityBoost = (pattern.similarity || 0.5) * 0.05;

          const totalBoost =
            this.learnedPatternBoost + occurrenceBoost + successBoost + similarityBoost;
          boostMap.set(nextCommand, Math.max(currentBoost, totalBoost));
        }
      }

      // Apply boosts to suggestions
      return suggestions.map((suggestion) => {
        const cmdNormalized = suggestion.command.replace(/^\*/, '').toLowerCase();
        const boost = boostMap.get(cmdNormalized) || 0;

        if (boost > 0) {
          return {
            ...suggestion,
            confidence: Math.min(1.0, suggestion.confidence + boost),
            source: 'learned_pattern',
            learnedBoost: Math.round(boost * 100) / 100,
          };
        }

        return suggestion;
      });
    } catch (error) {
      console.warn('[SuggestionEngine] Failed to apply learned pattern boost:', error.message);
      return suggestions;
    }
  }

  /**
   * Find position of a subsequence in a pattern sequence
   * @param {string[]} subseq - Subsequence to find
   * @param {string[]} pattern - Full pattern sequence
   * @returns {number} End index of match, or -1 if not found
   * @private
   */
  _findSequencePosition(subseq, pattern) {
    if (!subseq || !pattern || subseq.length === 0) {
      return -1;
    }

    // Normalize for comparison
    const normalizedSubseq = subseq.map((c) => c.toLowerCase().replace(/^\*/, ''));
    const normalizedPattern = pattern.map((c) => c.toLowerCase().replace(/^\*/, ''));

    // Find where the subsequence ends in the pattern
    for (let i = 0; i <= normalizedPattern.length - normalizedSubseq.length; i++) {
      let matches = true;
      for (let j = 0; j < normalizedSubseq.length; j++) {
        if (normalizedPattern[i + j] !== normalizedSubseq[j]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return i + normalizedSubseq.length - 1;
      }
    }

    // Try partial match (last command matches)
    const lastCmd = normalizedSubseq[normalizedSubseq.length - 1];
    for (let i = 0; i < normalizedPattern.length; i++) {
      if (normalizedPattern[i] === lastCmd) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Invalidate the cache
   */
  invalidateCache() {
    this.suggestionCache = null;
    this.cacheTimestamp = null;
    this.cacheKey = null;
  }

  /**
   * Get fallback suggestions when WIS is unavailable
   * @param {Object} context - Context object
   * @returns {Object} Fallback suggestions
   */
  getFallbackSuggestions(context) {
    const agent = context.agentId || 'dev';

    // Agent-specific fallback suggestions
    const fallbacks = {
      dev: [
        {
          command: '*help',
          args: '',
          description: 'Show available commands',
          confidence: 0.3,
          priority: 1,
        },
        {
          command: '*run-tests',
          args: '',
          description: 'Run test suite',
          confidence: 0.25,
          priority: 2,
        },
        {
          command: '*develop',
          args: '',
          description: 'Start development mode',
          confidence: 0.2,
          priority: 3,
        },
      ],
      po: [
        {
          command: '*help',
          args: '',
          description: 'Show available commands',
          confidence: 0.3,
          priority: 1,
        },
        {
          command: '*backlog-review',
          args: '',
          description: 'Review backlog',
          confidence: 0.25,
          priority: 2,
        },
        {
          command: '*create-story',
          args: '',
          description: 'Create new story',
          confidence: 0.2,
          priority: 3,
        },
      ],
      qa: [
        {
          command: '*help',
          args: '',
          description: 'Show available commands',
          confidence: 0.3,
          priority: 1,
        },
        {
          command: '*run-tests',
          args: '',
          description: 'Run test suite',
          confidence: 0.25,
          priority: 2,
        },
        {
          command: '*review-qa',
          args: '',
          description: 'Start QA review',
          confidence: 0.2,
          priority: 3,
        },
      ],
      sm: [
        {
          command: '*help',
          args: '',
          description: 'Show available commands',
          confidence: 0.3,
          priority: 1,
        },
        {
          command: '*create-next-story',
          args: '',
          description: 'Create next story',
          confidence: 0.25,
          priority: 2,
        },
        {
          command: '*validate-story-draft',
          args: '',
          description: 'Validate story',
          confidence: 0.2,
          priority: 3,
        },
      ],
      default: [
        {
          command: '*help',
          args: '',
          description: 'Show available commands',
          confidence: 0.3,
          priority: 1,
        },
        {
          command: '*status',
          args: '',
          description: 'Show project status',
          confidence: 0.2,
          priority: 2,
        },
      ],
    };

    return {
      workflow: null,
      currentState: null,
      confidence: 0.25,
      suggestions: fallbacks[agent] || fallbacks.default,
      isUncertain: true,
      message: 'Using fallback suggestions - context unclear',
    };
  }
}

/**
 * Create a new SuggestionEngine instance
 * @param {Object} options - Configuration options
 * @returns {SuggestionEngine} New engine instance
 */
function createSuggestionEngine(options = {}) {
  return new SuggestionEngine(options);
}

module.exports = {
  SuggestionEngine,
  createSuggestionEngine,
  SUGGESTION_CACHE_TTL,
  LOW_CONFIDENCE_THRESHOLD,
};
