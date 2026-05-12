/**
 * Surface Checker - Determines when Bob should surface to ask human
 *
 * Story 11.4: Bob Surface Criteria
 *
 * This module evaluates codified criteria to determine when the AI
 * should interrupt and ask for human decision, ensuring consistent
 * behavior regardless of LLM reasoning.
 *
 * @module core/orchestration/surface-checker
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * @typedef {Object} SurfaceContext
 * @property {number} [estimated_cost] - Estimated cost in USD
 * @property {string} [risk_level] - Risk level ('LOW', 'MEDIUM', 'HIGH')
 * @property {string} [risk_details] - Details about the risk
 * @property {number} [valid_options_count] - Number of valid options available
 * @property {string} [options_with_tradeoffs] - Formatted options with trade-offs
 * @property {number} [errors_in_task] - Number of consecutive errors in current task
 * @property {string} [error_summary] - Summary of errors encountered
 * @property {string} [action_type] - Type of action being performed
 * @property {string} [action_description] - Description of the action
 * @property {string} [affected_files] - Files affected by destructive action
 * @property {string} [requested_scope] - Requested scope
 * @property {string} [approved_scope] - Approved scope
 * @property {string} [scope_difference] - Difference between scopes
 * @property {boolean} [requires_api_key] - Whether operation requires API key
 * @property {boolean} [requires_payment] - Whether operation requires payment
 * @property {boolean} [requires_external_service] - Whether operation requires external service
 * @property {string} [dependency_description] - Description of external dependency
 */

/**
 * @typedef {Object} SurfaceResult
 * @property {boolean} should_surface - Whether Bob should surface to ask human
 * @property {string|null} criterion_id - ID of the triggered criterion (null if no surface)
 * @property {string|null} criterion_name - Name of the triggered criterion
 * @property {string|null} action - Action to take (null if no surface)
 * @property {string|null} message - Interpolated message to display (null if no surface)
 * @property {string|null} severity - Severity level (null if no surface)
 * @property {boolean} can_bypass - Whether this criterion can be bypassed in YOLO mode
 */

/**
 * @typedef {Object} ActionConfig
 * @property {string} type - Action type
 * @property {string} prompt_type - Prompt type to use
 * @property {string|null} default - Default value
 * @property {number} timeout_seconds - Timeout in seconds
 * @property {string} on_timeout - Action on timeout
 * @property {Array<{value: string, label: string}>} [options] - Options for select prompts
 * @property {string} [required_input] - Required input for explicit confirm
 */

class SurfaceChecker {
  /**
   * Create a SurfaceChecker instance
   * @param {string} [criteriaPath] - Path to criteria YAML file (optional, uses default)
   */
  constructor(criteriaPath = null) {
    this.criteriaPath =
      criteriaPath ||
      path.join(__dirname, 'bob-surface-criteria.yaml');
    this.criteria = null;
    this._loaded = false;
  }

  /**
   * Load criteria from YAML file
   * @returns {boolean} Whether loading was successful
   */
  load() {
    try {
      if (!fs.existsSync(this.criteriaPath)) {
        console.warn(`[SurfaceChecker] Criteria file not found: ${this.criteriaPath}`);
        return false;
      }

      const content = fs.readFileSync(this.criteriaPath, 'utf8');
      this.criteria = yaml.load(content);
      this._loaded = true;
      return true;
    } catch (error) {
      console.error(`[SurfaceChecker] Failed to load criteria: ${error.message}`);
      return false;
    }
  }

  /**
   * Ensure criteria are loaded
   * @private
   */
  _ensureLoaded() {
    if (!this._loaded) {
      this.load();
    }
  }

  /**
   * Evaluate a condition against the context
   * @param {string} condition - Condition expression
   * @param {SurfaceContext} context - Context to evaluate against
   * @returns {boolean} Whether condition is met
   */
  evaluateCondition(condition, context) {
    // Handle comparison operators
    // Pattern: field operator value
    // Supported: >, <, >=, <=, ==, !=

    // Greater than
    const gtMatch = condition.match(/^(\w+)\s*>\s*(\d+(?:\.\d+)?)$/);
    if (gtMatch) {
      const [, field, value] = gtMatch;
      return (context[field] || 0) > parseFloat(value);
    }

    // Greater than or equal
    const gteMatch = condition.match(/^(\w+)\s*>=\s*(\d+(?:\.\d+)?)$/);
    if (gteMatch) {
      const [, field, value] = gteMatch;
      return (context[field] || 0) >= parseFloat(value);
    }

    // Less than
    const ltMatch = condition.match(/^(\w+)\s*<\s*(\d+(?:\.\d+)?)$/);
    if (ltMatch) {
      const [, field, value] = ltMatch;
      return (context[field] || 0) < parseFloat(value);
    }

    // Less than or equal
    const lteMatch = condition.match(/^(\w+)\s*<=\s*(\d+(?:\.\d+)?)$/);
    if (lteMatch) {
      const [, field, value] = lteMatch;
      return (context[field] || 0) <= parseFloat(value);
    }

    // Equality with string
    const eqStrMatch = condition.match(/^(\w+)\s*==\s*['"](\w+)['"]$/);
    if (eqStrMatch) {
      const [, field, value] = eqStrMatch;
      return context[field] === value;
    }

    // Equality with number
    const eqNumMatch = condition.match(/^(\w+)\s*==\s*(\d+(?:\.\d+)?)$/);
    if (eqNumMatch) {
      const [, field, value] = eqNumMatch;
      return context[field] === parseFloat(value);
    }

    // IN operator for destructive actions
    const inMatch = condition.match(/^(\w+)\s+IN\s+(\w+)$/);
    if (inMatch) {
      const [, field, listName] = inMatch;
      const list = this.criteria?.criteria?.[listName] || [];
      return Array.isArray(list) && list.includes(context[field]);
    }

    // Scope comparison (requested_scope > approved_scope)
    if (condition === 'requested_scope > approved_scope') {
      const requested = context.requested_scope || '';
      const approved = context.approved_scope || '';
      // Compare by length or explicit scope_expanded flag
      return context.scope_expanded === true || requested.length > approved.length;
    }

    // OR conditions
    if (condition.includes(' OR ')) {
      const parts = condition.split(' OR ').map((p) => p.trim());
      return parts.some((part) => this.evaluateCondition(part, context));
    }

    // AND conditions
    if (condition.includes(' AND ')) {
      const parts = condition.split(' AND ').map((p) => p.trim());
      return parts.every((part) => this.evaluateCondition(part, context));
    }

    // Boolean field check
    if (/^[a-z_]+$/.test(condition)) {
      return Boolean(context[condition]);
    }

    // Unknown condition - log warning and return false (safe default)
    console.warn(`[SurfaceChecker] Unknown condition format: ${condition}`);
    return false;
  }

  /**
   * Interpolate message template with context values
   * @param {string} template - Message template with ${var} placeholders
   * @param {SurfaceContext} context - Context with values
   * @returns {string} Interpolated message
   */
  interpolateMessage(template, context) {
    if (!template) return '';

    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
      if (key in context) {
        const value = context[key];
        // Format numbers with 2 decimal places if they're currency
        if (typeof value === 'number' && key.includes('cost')) {
          return value.toFixed(2);
        }
        return String(value ?? '');
      }
      return match; // Keep original if not found
    });
  }

  /**
   * Check if Bob should surface to ask human
   * @param {SurfaceContext} context - Current execution context
   * @returns {SurfaceResult} Result indicating whether to surface and how
   */
  shouldSurface(context) {
    this._ensureLoaded();

    // Default result - no surface needed
    const noSurface = {
      should_surface: false,
      criterion_id: null,
      criterion_name: null,
      action: null,
      message: null,
      severity: null,
      can_bypass: true,
    };

    if (!this.criteria || !this.criteria.criteria) {
      return noSurface;
    }

    // Get evaluation order
    const evaluationOrder = this.criteria.evaluation_order || Object.keys(this.criteria.criteria);

    // Evaluate criteria in order (first match wins)
    for (const criterionKey of evaluationOrder) {
      const criterion = this.criteria.criteria[criterionKey];

      // Skip if it's not a criterion object (e.g., destructive_actions list)
      if (!criterion || !criterion.condition || !criterion.id) {
        continue;
      }

      const conditionMet = this.evaluateCondition(criterion.condition, context);

      if (conditionMet) {
        return {
          should_surface: true,
          criterion_id: criterion.id,
          criterion_name: criterion.name || criterionKey,
          action: criterion.action,
          message: this.interpolateMessage(criterion.message, context),
          severity: criterion.severity || 'info',
          can_bypass: criterion.bypass !== false,
        };
      }
    }

    return noSurface;
  }

  /**
   * Get action configuration for a given action name
   * @param {string} actionName - Name of the action
   * @returns {ActionConfig|null} Action configuration or null if not found
   */
  getActionConfig(actionName) {
    this._ensureLoaded();

    if (!this.criteria || !this.criteria.actions) {
      return null;
    }

    return this.criteria.actions[actionName] || null;
  }

  /**
   * Get all criteria definitions
   * @returns {Object} Criteria definitions
   */
  getCriteria() {
    this._ensureLoaded();
    return this.criteria?.criteria || {};
  }

  /**
   * Get the list of destructive actions
   * @returns {string[]} List of destructive action types
   */
  getDestructiveActions() {
    this._ensureLoaded();
    return this.criteria?.criteria?.destructive_actions || [];
  }

  /**
   * Check if an action type is destructive
   * @param {string} actionType - Action type to check
   * @returns {boolean} Whether the action is destructive
   */
  isDestructiveAction(actionType) {
    const destructiveActions = this.getDestructiveActions();
    return destructiveActions.includes(actionType);
  }

  /**
   * Get criteria metadata
   * @returns {Object} Metadata from criteria file
   */
  getMetadata() {
    this._ensureLoaded();
    return this.criteria?.metadata || {};
  }

  /**
   * Validate that criteria file is properly formatted
   * @returns {{valid: boolean, errors: string[]}} Validation result
   */
  validate() {
    this._ensureLoaded();

    const errors = [];

    if (!this.criteria) {
      errors.push('Criteria file not loaded');
      return { valid: false, errors };
    }

    if (!this.criteria.version) {
      errors.push('Missing version field');
    }

    if (!this.criteria.criteria) {
      errors.push('Missing criteria section');
    } else {
      // Validate each criterion
      const criteriaEntries = Object.entries(this.criteria.criteria);
      for (const [key, criterion] of criteriaEntries) {
        // Skip non-criterion entries (like destructive_actions list)
        if (Array.isArray(criterion)) continue;
        if (!criterion || typeof criterion !== 'object') continue;

        if (!criterion.id) {
          errors.push(`Criterion '${key}' missing id field`);
        }
        if (!criterion.condition) {
          errors.push(`Criterion '${key}' missing condition field`);
        }
        if (!criterion.action) {
          errors.push(`Criterion '${key}' missing action field`);
        }
        if (!criterion.message) {
          errors.push(`Criterion '${key}' missing message field`);
        }
      }
    }

    if (!this.criteria.actions) {
      errors.push('Missing actions section');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Create a SurfaceChecker instance and load criteria
 * @param {string} [criteriaPath] - Optional custom path to criteria file
 * @returns {SurfaceChecker} Loaded SurfaceChecker instance
 */
function createSurfaceChecker(criteriaPath = null) {
  const checker = new SurfaceChecker(criteriaPath);
  checker.load();
  return checker;
}

/**
 * Convenience function to check if should surface
 * @param {SurfaceContext} context - Execution context
 * @param {string} [criteriaPath] - Optional custom path to criteria file
 * @returns {SurfaceResult} Surface check result
 */
function shouldSurface(context, criteriaPath = null) {
  const checker = createSurfaceChecker(criteriaPath);
  return checker.shouldSurface(context);
}

module.exports = {
  SurfaceChecker,
  createSurfaceChecker,
  shouldSurface,
};
