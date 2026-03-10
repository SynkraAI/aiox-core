/**
 * Workflow Validator
 *
 * Validates workflow YAML files against AIOX workflow conventions:
 * 1. YAML syntax
 * 2. Required fields (workflow.id, workflow.name, sequence)
 * 3. Phase sequence integrity
 * 4. Agent reference existence
 * 5. Artifact flow (requires/creates chain)
 * 6. Circular dependency detection
 * 7. Conditional logic validation
 * 8. Handoff prompt completeness
 * 9. Mermaid diagram syntax (basic)
 *
 * Follows SquadValidator pattern for consistent validation UX.
 *
 * @module workflow-validator
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Error codes for workflow validation
 * @enum {string}
 */
const WorkflowValidationErrorCodes = {
  WF_FILE_NOT_FOUND: 'WF_FILE_NOT_FOUND',
  WF_YAML_PARSE_ERROR: 'WF_YAML_PARSE_ERROR',
  WF_MISSING_REQUIRED_FIELD: 'WF_MISSING_REQUIRED_FIELD',
  WF_INVALID_SEQUENCE: 'WF_INVALID_SEQUENCE',
  WF_AGENT_NOT_FOUND: 'WF_AGENT_NOT_FOUND',
  WF_ARTIFACT_CHAIN_BROKEN: 'WF_ARTIFACT_CHAIN_BROKEN',
  WF_CIRCULAR_DEPENDENCY: 'WF_CIRCULAR_DEPENDENCY',
  WF_INVALID_CONDITIONAL: 'WF_INVALID_CONDITIONAL',
  WF_MISSING_HANDOFF: 'WF_MISSING_HANDOFF',
  WF_INVALID_MERMAID: 'WF_INVALID_MERMAID',
  WF_AGENT_AMBIGUOUS: 'WF_AGENT_AMBIGUOUS',
};

/**
 * Workflow Validator class
 */
class WorkflowValidator {
  /**
   * @param {Object} [options={}]
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.strict=false] - Treat warnings as errors
   * @param {string} [options.agentsPath] - Path to core agents directory for reference checking
   * @param {string|null} [options.squadAgentsPath=null] - Path to squad agents directory for hybrid resolution
   */
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.strict = options.strict || false;
    this.agentsPath = options.agentsPath || path.join(process.cwd(), '.aiox-core', 'development', 'agents');
    this.squadAgentsPath = options.squadAgentsPath || null;
  }

  /**
   * @private
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[WorkflowValidator] ${message}`);
    }
  }

  /**
   * Validate a workflow file
   * @param {string} workflowPath - Absolute or relative path to workflow YAML
   * @returns {Promise<Object>} { valid, errors, warnings, suggestions }
   */
  async validate(workflowPath) {
    this._log(`Validating workflow: ${workflowPath}`);

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // 1. Check file exists
    const fileResult = await this._checkFileExists(workflowPath);
    if (!fileResult.exists) {
      result.valid = false;
      result.errors.push({
        code: WorkflowValidationErrorCodes.WF_FILE_NOT_FOUND,
        message: `Workflow file not found: ${workflowPath}`,
        suggestion: 'Check the file path or create the workflow first',
      });
      return result;
    }

    // 2. Parse YAML
    const parseResult = await this.validateYamlSyntax(workflowPath);
    this._mergeResults(result, parseResult);
    if (!parseResult.data) {
      return result; // Can't continue without parsed data
    }

    const workflow = this._normalizeWorkflowDocument(parseResult.data);

    // 3. Required fields
    const fieldsResult = this.validateRequiredFields(workflow, workflowPath);
    this._mergeResults(result, fieldsResult);

    const phaseSequence = this._getPhaseSequence(workflow);

    // 4. Phase sequence
    if (phaseSequence.length > 0) {
      const sequenceResult = this.validatePhaseSequence(phaseSequence);
      this._mergeResults(result, sequenceResult);

      // 5. Agent references
      const agentResult = await this.validateAgentReferences(phaseSequence);
      this._mergeResults(result, agentResult);

      // 6. Artifact flow
      const artifactResult = this.validateArtifactFlow(phaseSequence);
      this._mergeResults(result, artifactResult);

      // 7. Circular dependencies
      const circularResult = this.detectCircularDeps(phaseSequence);
      this._mergeResults(result, circularResult);

      // 8. Conditional logic
      const conditionalResult = this.validateConditionalLogic(phaseSequence);
      this._mergeResults(result, conditionalResult);
    }

    // 9. Handoff prompts
    const handoffResult = this.validateHandoffPrompts(workflow, phaseSequence);
    this._mergeResults(result, handoffResult);

    // 10. Mermaid diagram
    const mermaidResult = this.validateMermaidDiagram(workflow);
    this._mergeResults(result, mermaidResult);

    // Strict mode: warnings become errors
    if (this.strict && result.warnings.length > 0) {
      result.errors.push(...result.warnings);
      result.warnings = [];
      result.valid = false;
    }

    this._log(`Validation complete: ${result.valid ? 'VALID' : 'INVALID'}`);
    return result;
  }

  /**
   * Validate YAML syntax
   * @param {string} workflowPath
   * @returns {Promise<Object>} Result with parsed data
   */
  async validateYamlSyntax(workflowPath) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [], data: null };

    try {
      const content = await fs.readFile(workflowPath, 'utf-8');
      const data = yaml.load(content);
      if (!data || typeof data !== 'object') {
        result.valid = false;
        result.errors.push({
          code: WorkflowValidationErrorCodes.WF_YAML_PARSE_ERROR,
          message: 'Workflow file is empty or not a valid YAML object',
          suggestion: 'Ensure the file contains valid YAML with a workflow: root key',
        });
      } else {
        result.data = data;
      }
    } catch (error) {
      result.valid = false;
      result.errors.push({
        code: WorkflowValidationErrorCodes.WF_YAML_PARSE_ERROR,
        message: `YAML parse error: ${error.message}`,
        suggestion: 'Fix YAML syntax — check indentation, colons, and special characters',
      });
    }

    return result;
  }

  /**
   * Validate required fields
   * @param {Object} workflow - Parsed workflow object
   * @param {string} filePath - For error reporting
   * @returns {Object} Validation result
   */
  validateRequiredFields(workflow, filePath) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };
    const filename = path.basename(filePath);

    const wf = workflow.workflow;
    if (!wf || typeof wf !== 'object') {
      result.valid = false;
      result.errors.push({
        code: WorkflowValidationErrorCodes.WF_MISSING_REQUIRED_FIELD,
        message: 'Missing workflow payload (expected workflow.id, workflow.name, and sequence/phases)',
        file: filename,
        suggestion: 'Add workflow: root key or canonical top-level id/name/sequence|phases',
      });
      return result;
    }

    const requiredFields = ['id', 'name'];

    for (const field of requiredFields) {
      if (!wf[field]) {
        result.valid = false;
        result.errors.push({
          code: WorkflowValidationErrorCodes.WF_MISSING_REQUIRED_FIELD,
          message: `Missing required field: workflow.${field}`,
          file: filename,
          suggestion: `Add "${field}:" under the workflow: key`,
        });
      }
    }

    const hasSequence = Array.isArray(wf.sequence) && wf.sequence.length > 0;
    const hasPhases = Array.isArray(wf.phases) && wf.phases.length > 0;
    if (!hasSequence && !hasPhases) {
      result.valid = false;
      result.errors.push({
        code: WorkflowValidationErrorCodes.WF_MISSING_REQUIRED_FIELD,
        message: 'Missing or empty workflow execution array ("sequence" or "phases")',
        file: filename,
        suggestion: 'Add workflow.sequence (official) with at least one step; phases is compatibility only',
      });
    } else if (!hasSequence && hasPhases) {
      result.warnings.push({
        code: WorkflowValidationErrorCodes.WF_MISSING_REQUIRED_FIELD,
        message: 'Workflow uses workflow.phases without workflow.sequence',
        file: filename,
        suggestion: 'Prefer workflow.sequence as canonical execution contract (keep phases only as supplemental metadata)',
      });
    }

    // Warnings for recommended fields
    const recommendedFields = ['description', 'type'];
    for (const field of recommendedFields) {
      if (!wf[field]) {
        result.warnings.push({
          code: WorkflowValidationErrorCodes.WF_MISSING_REQUIRED_FIELD,
          message: `Missing recommended field: workflow.${field}`,
          file: filename,
          suggestion: `Consider adding "${field}:" for better documentation`,
        });
      }
    }

    return result;
  }

  /**
   * Validate phase sequence integrity
   * @param {Array} sequence - Workflow sequence array
   * @returns {Object} Validation result
   */
  validatePhaseSequence(sequence) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    if (!Array.isArray(sequence)) return result;

    // Check that each step has an agent or is a control flow entry
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];

      // Control flow entries (repeat_development_cycle, workflow_end) are valid
      if (step.repeat_development_cycle || step.workflow_end) {
        continue;
      }

      if (!step.agent) {
        result.warnings.push({
          code: WorkflowValidationErrorCodes.WF_INVALID_SEQUENCE,
          message: `Step ${i + 1} has no "agent:" field`,
          suggestion: 'Each step should specify an agent responsible for that phase',
        });
      }

      // Check that step has at least one action indicator
      const hasAction = step.creates || step.updates || step.validates || step.action;
      if (!hasAction) {
        result.warnings.push({
          code: WorkflowValidationErrorCodes.WF_INVALID_SEQUENCE,
          message: `Step ${i + 1} (agent: ${step.agent || 'unknown'}) has no action (creates/updates/validates/action)`,
          suggestion: 'Add creates:, updates:, validates:, or action: to define what this step does',
        });
      }
    }

    return result;
  }

  /**
   * Validate agent references exist as .md files.
   * Supports hybrid resolution when squadAgentsPath is set:
   * - Checks squad agents first, then core agents (squad-first, core-fallback)
   * - Warns when agent exists in both contexts (WF_AGENT_AMBIGUOUS)
   * - Supports explicit prefix: "core:architect" or "squad:validator"
   * When squadAgentsPath is null, behavior is identical to pre-hybrid (backward compat).
   *
   * @param {Array} sequence
   * @returns {Promise<Object>} Validation result
   */
  async validateAgentReferences(sequence) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    if (!Array.isArray(sequence)) return result;

    const agents = new Set();
    for (const step of sequence) {
      if (step.agent) {
        // Handle compound agents like "analyst/pm"
        const agentNames = step.agent.split('/').map(a => a.trim());
        for (const a of agentNames) {
          agents.add(a);
        }
      }
    }

    // Skip meta-agent names
    const metaAgents = new Set(['various']);

    for (const agent of agents) {
      if (metaAgents.has(agent)) continue;

      // Parse explicit prefix (e.g., "core:architect" or "squad:validator")
      let explicitContext = null;
      let agentName = agent;
      if (agent.includes(':')) {
        const parts = agent.split(':');
        if (parts[0] === 'core' || parts[0] === 'squad') {
          explicitContext = parts[0];
          agentName = parts.slice(1).join(':');
        }
      }

      // Sanitize agent name to prevent path traversal
      if (!agentName || agentName.includes('..') || agentName.includes('/') || agentName.includes('\\')) {
        result.warnings.push({
          code: WorkflowValidationErrorCodes.WF_AGENT_NOT_FOUND,
          message: `Agent "${agent}" has an invalid name`,
          suggestion: 'Use simple agent identifiers without path segments',
        });
        continue;
      }

      if (this.squadAgentsPath) {
        // Hybrid mode: check both contexts
        const coreFile = path.join(this.agentsPath, `${agentName}.md`);
        const squadFile = path.join(this.squadAgentsPath, `${agentName}.md`);

        if (explicitContext === 'core') {
          const coreExists = await this._checkFileExists(coreFile);
          if (!coreExists.exists) {
            result.warnings.push({
              code: WorkflowValidationErrorCodes.WF_AGENT_NOT_FOUND,
              message: `Agent "${agent}" (explicit core) not found at ${coreFile}`,
              suggestion: `Create ${agentName}.md in core agents/ or check the agent name`,
            });
          }
        } else if (explicitContext === 'squad') {
          const squadExists = await this._checkFileExists(squadFile);
          if (!squadExists.exists) {
            result.warnings.push({
              code: WorkflowValidationErrorCodes.WF_AGENT_NOT_FOUND,
              message: `Agent "${agent}" (explicit squad) not found at ${squadFile}`,
              suggestion: `Create ${agentName}.md in squad agents/ or check the agent name`,
            });
          }
        } else {
          // No prefix: squad-first, core-fallback
          const squadExists = await this._checkFileExists(squadFile);
          const coreExists = await this._checkFileExists(coreFile);

          if (squadExists.exists && coreExists.exists) {
            result.warnings.push({
              code: WorkflowValidationErrorCodes.WF_AGENT_AMBIGUOUS,
              message: `Agent "${agentName}" exists in both core and squad contexts`,
              suggestion: `Use explicit prefix "core:${agentName}" or "squad:${agentName}" to disambiguate`,
            });
          } else if (!squadExists.exists && !coreExists.exists) {
            result.warnings.push({
              code: WorkflowValidationErrorCodes.WF_AGENT_NOT_FOUND,
              message: `Agent "${agentName}" not found in core (${coreFile}) or squad (${squadFile})`,
              suggestion: `Create ${agentName}.md in either agents directory or check the agent name`,
            });
          }
        }
      } else {
        // Core-only mode (backward compatible): check only core agents
        const agentFile = path.join(this.agentsPath, `${agentName}.md`);
        const exists = await this._checkFileExists(agentFile);
        if (!exists.exists) {
          result.warnings.push({
            code: WorkflowValidationErrorCodes.WF_AGENT_NOT_FOUND,
            message: `Agent "${agentName}" not found at ${agentFile}`,
            suggestion: `Create ${agentName}.md in agents/ or check the agent name`,
          });
        }
      }
    }

    return result;
  }

  /**
   * Validate artifact flow — every requires: should have a preceding creates:
   * @param {Array} sequence
   * @returns {Object} Validation result
   */
  validateArtifactFlow(sequence) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    if (!Array.isArray(sequence)) return result;

    const createdArtifacts = new Set();

    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];

      // Track created artifacts
      if (step.creates) {
        createdArtifacts.add(step.creates);
      }

      // Check required artifacts
      if (step.requires) {
        const required = step.requires;
        // Handle both string and special values
        if (typeof required === 'string' && !required.startsWith('all_') && !required.startsWith('sharded_')) {
          if (!createdArtifacts.has(required)) {
            result.warnings.push({
              code: WorkflowValidationErrorCodes.WF_ARTIFACT_CHAIN_BROKEN,
              message: `Step ${i + 1} (agent: ${step.agent || 'unknown'}) requires "${required}" but no prior step creates it`,
              suggestion: 'Add a creates: entry in a preceding step or fix the artifact name',
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Detect circular dependencies using topological sort on requires/creates graph
   * @param {Array} sequence
   * @returns {Object} Validation result
   */
  detectCircularDeps(sequence) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    if (!Array.isArray(sequence)) return result;

    const artifactToStep = new Map();

    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      if (step.creates) {
        artifactToStep.set(step.creates, i);
      }
    }

    // Build edges: step that requires → step that creates
    const edges = new Map();
    for (let i = 0; i < sequence.length; i++) {
      edges.set(i, []);
    }

    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      if (step.requires && typeof step.requires === 'string') {
        const creatorStep = artifactToStep.get(step.requires);
        if (creatorStep !== undefined && creatorStep !== i) {
          // Step i depends on creatorStep
          edges.get(i).push(creatorStep);
        }
      }
    }

    // Detect cycles with DFS
    const visited = new Set();
    const inStack = new Set();

    const hasCycle = (node) => {
      visited.add(node);
      inStack.add(node);

      for (const neighbor of (edges.get(node) || [])) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (inStack.has(neighbor)) {
          return true;
        }
      }

      inStack.delete(node);
      return false;
    };

    for (let i = 0; i < sequence.length; i++) {
      if (!visited.has(i)) {
        if (hasCycle(i)) {
          result.valid = false;
          result.errors.push({
            code: WorkflowValidationErrorCodes.WF_CIRCULAR_DEPENDENCY,
            message: 'Circular dependency detected in artifact requires/creates chain',
            suggestion: 'Review the requires/creates relationships and break the cycle',
          });
          break;
        }
      }
    }

    return result;
  }

  /**
   * Validate conditional logic references
   * @param {Array} sequence
   * @returns {Object} Validation result
   */
  validateConditionalLogic(sequence) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    if (!Array.isArray(sequence)) return result;

    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      if (step.condition) {
        // Conditions should be descriptive identifiers
        if (typeof step.condition !== 'string' || step.condition.trim().length === 0) {
          result.warnings.push({
            code: WorkflowValidationErrorCodes.WF_INVALID_CONDITIONAL,
            message: `Step ${i + 1} has empty or invalid condition`,
            suggestion: 'Conditions should be descriptive identifiers (e.g., "architecture_suggests_prd_changes")',
          });
        }
      }
    }

    return result;
  }

  /**
   * Validate handoff prompts exist for transitions
   * @param {Object} workflow - Full parsed workflow
   * @param {Array|null} phaseSequence - Optional resolved phase sequence
   * @returns {Object} Validation result
   */
  validateHandoffPrompts(workflow, phaseSequence = null) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    const wf = workflow.workflow;
    const sequence = Array.isArray(phaseSequence) ? phaseSequence : this._getPhaseSequence(workflow);
    if (!wf || !Array.isArray(sequence) || sequence.length === 0) return result;

    // Count agent transitions (where one agent hands off to another)
    let transitionCount = 0;
    let prevAgent = null;
    for (const step of sequence) {
      if (step.agent && step.agent !== prevAgent) {
        if (prevAgent) transitionCount++;
        prevAgent = step.agent;
      }
    }

    // Check for handoff_prompts section
    if (transitionCount > 0 && !wf.handoff_prompts) {
      result.warnings.push({
        code: WorkflowValidationErrorCodes.WF_MISSING_HANDOFF,
        message: `Workflow has ${transitionCount} agent transitions but no handoff_prompts section`,
        suggestion: 'Add handoff_prompts: with guidance for each agent transition',
      });
    }

    return result;
  }

  /**
   * Validate Mermaid diagram syntax (basic check)
   * @param {Object} workflow - Full parsed workflow
   * @returns {Object} Validation result
   */
  validateMermaidDiagram(workflow) {
    const result = { valid: true, errors: [], warnings: [], suggestions: [] };

    const wf = workflow.workflow;
    if (!wf || !wf.flow_diagram) return result;

    const diagram = wf.flow_diagram;

    // Basic checks
    if (!diagram.includes('graph') && !diagram.includes('flowchart')) {
      result.warnings.push({
        code: WorkflowValidationErrorCodes.WF_INVALID_MERMAID,
        message: 'Mermaid diagram missing graph/flowchart declaration',
        suggestion: 'Start diagram with "graph TD" or "flowchart TD"',
      });
    }

    // Check for unbalanced brackets
    const openBrackets = (diagram.match(/\[/g) || []).length;
    const closeBrackets = (diagram.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      result.warnings.push({
        code: WorkflowValidationErrorCodes.WF_INVALID_MERMAID,
        message: `Mermaid diagram has unbalanced brackets (${openBrackets} open, ${closeBrackets} close)`,
        suggestion: 'Check for missing [ or ] in node definitions',
      });
    }

    return result;
  }

  /**
   * Format validation result for display (same pattern as SquadValidator)
   * @param {Object} result
   * @param {string} workflowPath
   * @returns {string}
   */
  formatResult(result, workflowPath) {
    const lines = [];

    lines.push(`Validating workflow: ${workflowPath}`);
    lines.push('');

    if (result.errors.length > 0) {
      lines.push(`Errors: ${result.errors.length}`);
      for (const err of result.errors) {
        const filePart = err.file ? ` (${err.file})` : '';
        lines.push(`  - [${err.code}]${filePart}: ${err.message}`);
        if (err.suggestion) {
          lines.push(`    Suggestion: ${err.suggestion}`);
        }
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push(`Warnings: ${result.warnings.length}`);
      for (const warn of result.warnings) {
        const filePart = warn.file ? ` (${warn.file})` : '';
        lines.push(`  - [${warn.code}]${filePart}: ${warn.message}`);
        if (warn.suggestion) {
          lines.push(`    Suggestion: ${warn.suggestion}`);
        }
      }
      lines.push('');
    }

    if (result.suggestions.length > 0) {
      lines.push(`Suggestions: ${result.suggestions.length}`);
      for (const sug of result.suggestions) {
        lines.push(`  - ${sug}`);
      }
      lines.push('');
    }

    if (result.valid) {
      if (result.warnings.length > 0) {
        lines.push('Result: VALID (with warnings)');
      } else {
        lines.push('Result: VALID');
      }
    } else {
      lines.push('Result: INVALID');
    }

    return lines.join('\n');
  }

  // ============ Private Helper Methods ============

  /**
   * @private
   */
  async _checkFileExists(filePath) {
    try {
      await fs.access(filePath);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  }

  /**
   * @private
   */
  _mergeResults(target, source) {
    target.errors.push(...(source.errors || []));
    target.warnings.push(...(source.warnings || []));
    target.suggestions.push(...(source.suggestions || []));
    if (source.errors && source.errors.length > 0) {
      target.valid = false;
    }
  }

  /**
   * Normalize workflow payload to keep backward compatibility across
   * workflow-wrapped and top-level workflow documents.
   * @private
   * @param {Object} data
   * @returns {Object}
   */
  _normalizeWorkflowDocument(data) {
    if (!data || typeof data !== 'object') {
      return { workflow: null };
    }

    if (data.workflow && typeof data.workflow === 'object') {
      const normalizedWorkflow = { ...data.workflow };
      if (!normalizedWorkflow.phases && Array.isArray(data.phases)) {
        normalizedWorkflow.phases = data.phases;
      }
      return { ...data, workflow: normalizedWorkflow };
    }

    const normalizedWorkflow = {
      id: data.id,
      name: data.name,
      version: data.version,
      description: data.description,
      type: data.type,
      orchestrator: data.orchestrator,
      sequence: Array.isArray(data.sequence) ? data.sequence : undefined,
      phases: Array.isArray(data.phases) ? data.phases : undefined,
      handoff_prompts: data.handoff_prompts,
      flow_diagram: data.flow_diagram,
    };

    return {
      ...data,
      workflow: normalizedWorkflow,
    };
  }

  /**
   * Resolve executable entries from canonical workflow.sequence[], with
   * workflow.phases[] as compatibility fallback.
   * @private
   * @param {Object} workflow
   * @returns {Array}
   */
  _getPhaseSequence(workflow) {
    const wf = workflow && workflow.workflow ? workflow.workflow : null;
    if (!wf) return [];

    if (Array.isArray(wf.sequence) && wf.sequence.length > 0) {
      return wf.sequence;
    }

    if (Array.isArray(wf.phases) && wf.phases.length > 0) {
      return wf.phases;
    }

    return [];
  }
}

module.exports = {
  WorkflowValidator,
  WorkflowValidationErrorCodes,
};
