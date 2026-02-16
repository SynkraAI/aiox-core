/**
 * Skill Dispatcher - Dispatches to AIOS Skills instead of generic Task calls
 *
 * Maps agent IDs to Skill invocations and prepares structured payloads.
 * Used by WorkflowOrchestrator to invoke specialized agents with full personas.
 *
 * Responsibilities:
 * - Map agent IDs to AIOS Skill names
 * - Build dispatch payloads with context
 * - Parse and normalize skill outputs
 *
 * @module core/orchestration/skill-dispatcher
 * @version 1.0.0
 */

/**
 * @typedef {import('./tech-stack-detector').TechStackProfile} TechStackProfile
 */

/**
 * @typedef {Object} DispatchPayload
 * @property {string} skill - Full skill name (e.g., 'AIOS:agents:architect')
 * @property {string} args - Arguments string for the skill
 * @property {Object} context - Execution context
 */

/**
 * @typedef {Object} SkillResult
 * @property {string} status - 'success' | 'failed' | 'skipped'
 * @property {string} [output_path] - Path to generated output file
 * @property {string} [summary] - Brief summary of execution
 * @property {string[]} [findings] - Array of findings/discoveries
 * @property {Object} [next_phase_context] - Context to pass to next phase
 * @property {string} timestamp - ISO timestamp
 */

/**
 * Dispatches workflow phases to AIOS Skills
 */
/**
 * Primary agents (not aliases) - used by getAvailableAgents()
 * Aliases like 'ux-expert' and 'github-devops' are excluded
 */
const PRIMARY_AGENTS = new Set([
  'architect',
  'data-engineer',
  'dev',
  'qa',
  'pm',
  'po',
  'sm',
  'analyst',
  'ux-design-expert',
  'devops',
  'aios-master',
]);

/**
 * Dispatches workflow phases to AIOS Skills
 */
class SkillDispatcher {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = options;

    /**
     * Mapping from agent IDs to full Skill names
     * These correspond to files in .claude/commands/AIOS/agents/
     */
    this.skillMapping = {
      // Core development agents
      architect: 'AIOS:agents:architect',
      'data-engineer': 'AIOS:agents:data-engineer',
      dev: 'AIOS:agents:dev',
      qa: 'AIOS:agents:qa',

      // Product agents
      pm: 'AIOS:agents:pm',
      po: 'AIOS:agents:po',
      sm: 'AIOS:agents:sm',
      analyst: 'AIOS:agents:analyst',

      // Specialized agents
      'ux-design-expert': 'AIOS:agents:ux-design-expert',
      'ux-expert': 'AIOS:agents:ux-design-expert', // Alias
      devops: 'AIOS:agents:devops',
      'github-devops': 'AIOS:agents:devops', // Alias

      // Master agent
      'aios-master': 'AIOS:agents:aios-master',
    };

    /**
     * Agent personas for human-readable output
     */
    this.agentPersonas = {
      architect: { name: 'Aria', title: 'System Architect' },
      'data-engineer': { name: 'Dara', title: 'Database Architect' },
      dev: { name: 'Dex', title: 'Senior Developer' },
      qa: { name: 'Quinn', title: 'QA Guardian' },
      pm: { name: 'Priya', title: 'Project Manager' },
      po: { name: 'Oscar', title: 'Product Owner' },
      sm: { name: 'Sam', title: 'Scrum Master' },
      analyst: { name: 'Alex', title: 'Business Analyst' },
      'ux-design-expert': { name: 'Brad', title: 'UX Design Expert' },
      'ux-expert': { name: 'Brad', title: 'UX Design Expert' },
      devops: { name: 'Gage', title: 'DevOps Engineer' },
      'aios-master': { name: 'Orion', title: 'Master Orchestrator' },
    };
  }

  /**
   * Get the full Skill name for an agent
   * @param {string} agentId - Agent identifier (e.g., 'architect')
   * @returns {string} Full skill name (e.g., 'AIOS:agents:architect')
   */
  getSkillName(agentId) {
    return this.skillMapping[agentId] || `AIOS:agents:${agentId}`;
  }

  /**
   * Get persona info for an agent
   * @param {string} agentId - Agent identifier
   * @returns {Object} Persona with name and title
   */
  getAgentPersona(agentId) {
    return (
      this.agentPersonas[agentId] || { name: agentId, title: 'AIOS Agent' }
    );
  }

  /**
   * Build the dispatch payload for a Skill invocation
   * @param {Object} params - Dispatch parameters
   * @param {string} params.agentId - Agent identifier
   * @param {string} params.prompt - Full prompt from SubagentPromptBuilder
   * @param {Object} params.phase - Phase configuration from workflow
   * @param {Object} params.context - Execution context
   * @param {TechStackProfile} [params.techStackProfile] - Tech stack detection results
   * @returns {DispatchPayload}
   */
  buildDispatchPayload(params) {
    const { agentId, prompt, phase, context, techStackProfile } = params;

    return {
      skill: this.getSkillName(agentId),
      args: this._buildArgsString(phase, context, techStackProfile),
      context: {
        // Phase info
        phase: phase.phase,
        phaseName: phase.phase_name,
        step: phase.step,
        action: phase.action,

        // Task and output
        task: phase.task,
        creates: phase.creates,
        checklist: phase.checklist,
        template: phase.template,

        // Full prompt for the agent
        prompt,

        // Tech stack profile for context-aware execution
        techStack: techStackProfile,

        // Workflow context
        workflowId: context.workflowId,
        yoloMode: context.yoloMode || false,
        previousPhases: context.previousPhases || {},
        executionProfile: context.executionProfile || null,
        executionPolicy: context.executionPolicy || null,
      },
    };
  }

  /**
   * Build command arguments string for skill invocation
   * @private
   * @param {Object} phase - Phase configuration
   * @param {Object} context - Execution context
   * @param {TechStackProfile} techStackProfile - Tech stack profile
   * @returns {string}
   */
  _buildArgsString(phase, context, techStackProfile) {
    const args = [];

    // Add task reference if present
    if (phase.task) {
      args.push(`--task="${phase.task}"`);
    }

    // Add output path if present
    if (phase.creates) {
      const output = Array.isArray(phase.creates)
        ? phase.creates[0]
        : phase.creates;
      args.push(`--output="${output}"`);
    }

    // Add workflow context
    args.push(`--phase=${phase.phase}`);

    if (context.yoloMode) {
      args.push('--yolo');
    }

    // Add tech stack flags if profile is available
    if (techStackProfile) {
      if (techStackProfile.hasDatabase) {
        args.push('--has-database');
        if (techStackProfile.database.type) {
          args.push(`--db-type="${techStackProfile.database.type}"`);
        }
      }

      if (techStackProfile.hasFrontend) {
        args.push('--has-frontend');
        if (techStackProfile.frontend.framework) {
          args.push(`--frontend="${techStackProfile.frontend.framework}"`);
        }
      }

      if (techStackProfile.hasTypeScript) {
        args.push('--typescript');
      }
    }

    return args.join(' ');
  }

  /**
   * Parse and normalize output from a Skill execution
   * @param {any} skillResult - Raw result from Skill execution
   * @param {Object} phase - Phase configuration for defaults
   * @returns {SkillResult}
   */
  parseSkillOutput(skillResult, phase = {}) {
    const timestamp = new Date().toISOString();

    // Handle null/undefined
    if (skillResult === null || skillResult === undefined) {
      return {
        status: 'failed',
        summary: 'No result returned from skill',
        timestamp,
      };
    }

    // Already structured JSON object
    if (typeof skillResult === 'object' && skillResult.status) {
      return {
        ...skillResult,
        timestamp: skillResult.timestamp || timestamp,
      };
    }

    // String result - try to extract JSON
    if (typeof skillResult === 'string') {
      // Try to find JSON block in markdown
      const jsonMatch = skillResult.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return {
            status: parsed.status || 'success',
            output_path: parsed.output_path || phase.creates,
            summary: parsed.summary,
            findings: parsed.findings,
            next_phase_context: parsed.next_phase_context,
            timestamp,
          };
        } catch {
          // JSON parsing failed, continue to default handling
        }
      }

      // Try to parse entire result as JSON
      try {
        const parsed = JSON.parse(skillResult);
        return {
          status: parsed.status || 'success',
          ...parsed,
          timestamp,
        };
      } catch {
        // Not JSON, treat as summary
      }

      // Plain text result - assume success
      return {
        status: 'success',
        output_path: phase.creates,
        summary: skillResult.substring(0, 500), // Truncate for summary
        timestamp,
      };
    }

    // Unknown result type - wrap in default structure
    return {
      status: 'success',
      output: skillResult,
      output_path: phase.creates,
      timestamp,
    };
  }

  /**
   * Create a skip result for phases that won't execute
   * @param {Object} phase - Phase configuration
   * @param {string} reason - Skip reason
   * @returns {SkillResult}
   */
  createSkipResult(phase, reason) {
    return {
      status: 'skipped',
      reason,
      phase: phase.phase,
      phaseName: phase.phase_name,
      agent: phase.agent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format dispatch info for logging
   * @param {DispatchPayload} payload - Dispatch payload
   * @returns {string} Formatted log message
   */
  formatDispatchLog(payload) {
    const agentId = payload.skill.split(':').pop();
    const persona = this.getAgentPersona(agentId);

    return [
      `Dispatching to ${persona.name} (@${agentId})`,
      `  Skill: ${payload.skill}`,
      `  Phase: ${payload.context.phase} - ${payload.context.phaseName}`,
      `  Task: ${payload.context.task || 'N/A'}`,
      `  Output: ${payload.context.creates || 'N/A'}`,
    ].join('\n');
  }

  /**
   * Get all available primary agent IDs (excludes aliases)
   * @returns {string[]}
   */
  getAvailableAgents() {
    return Object.keys(this.skillMapping).filter((k) => PRIMARY_AGENTS.has(k));
  }

  /**
   * Check if an agent ID is valid
   * @param {string} agentId
   * @returns {boolean}
   */
  isValidAgent(agentId) {
    return agentId in this.skillMapping || agentId.startsWith('AIOS:');
  }
}

module.exports = SkillDispatcher;
