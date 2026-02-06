const yaml = require('js-yaml');
const { _createHash } = require('crypto');
const DiffGenerator = require('./diff-generator');
const ModificationValidator = require('./modification-validator');

/**
 * Generates structured commit messages following conventional commit standards
 * for AIOS framework modifications
 */
class CommitMessageGenerator {
  constructor(options = {}) {
    this.diffGenerator = new DiffGenerator();
    this.validator = new ModificationValidator();
    
    // Conventional commit types
    this.commitTypes = {
      feat: 'A new feature',
      fix: 'A bug fix',
      docs: 'Documentation only changes',
      style: 'Changes that do not affect the meaning of the code',
      refactor: 'A code change that neither fixes a bug nor adds a feature',
      perf: 'A code change that improves performance',
      test: 'Adding missing tests or correcting existing tests',
      build: 'Changes that affect the build system or external dependencies',
      ci: 'Changes to CI configuration files and scripts',
      chore: 'Other changes that don\'t modify src or test files',
      revert: 'Reverts a previous commit'
    };
    
    // Component-specific actions
    this.componentActions = {
      agent: {
        enhance: 'Enhanced capabilities or features',
        fix: 'Fixed issues or bugs',
        update: 'Updated configuration or metadata',
        refactor: 'Refactored implementation',
        deprecate: 'Marked features as deprecated',
        remove: 'Removed deprecated features'
      },
      task: {
        improve: 'Improved task flow or logic',
        fix: 'Fixed task execution issues',
        update: 'Updated task steps or output',
        optimize: 'Optimized performance',
        clarify: 'Clarified instructions or prompts'
      },
      workflow: {
        restructure: 'Restructured workflow phases',
        add: 'Added new phases or transitions',
        update: 'Updated phase configuration',
        optimize: 'Optimized workflow execution',
        fix: 'Fixed workflow issues'
      }
    };
    
    // Keywords for categorizing changes
    this.changeKeywords = {
      feat: ['add', 'new', 'implement', 'introduce', 'create'],
      fix: ['fix', 'resolve', 'correct', 'repair', 'patch'],
      refactor: ['refactor', 'restructure', 'reorganize', 'improve structure'],
      perf: ['optimize', 'performance', 'speed up', 'efficiency'],
      docs: ['document', 'docs', 'readme', 'comment', 'clarify']
    };
  }

  /**
   * Generate commit message for a modification
   * @param {Object} modification - Modification details
   * @returns {Promise<Object>} Generated commit message and metadata
   */
  async generateCommitMessage(modification) {
    const {
      componentType,
      componentName,
      originalContent,
      modifiedContent,
      userIntent = '',
      metadata = {}
    } = modification;

    try {
      // Analyze the changes
      const analysis = await this.analyzeModification(
        componentType,
        originalContent,
        modifiedContent
      );
      
      // Determine commit type and action
      const commitType = this.determineCommitType(analysis, userIntent);
      const action = this.determineAction(componentType, analysis, userIntent);
      
      // Generate summary
      const summary = this.generateSummary(
        componentType,
        componentName,
        action,
        analysis,
        userIntent
      );
      
      // Generate detailed description
      const details = this.generateDetails(analysis, metadata);
      
      // Check for breaking changes
      const breakingChanges = await this.detectBreakingChanges(
        componentType,
        originalContent,
        modifiedContent
      );
      
      // Construct the full message
      const message = this.constructMessage({
        type: commitType,
        scope: componentType,
        summary,
        body: details,
        breaking: breakingChanges,
        metadata
      });
      
      return {
        message,
        type: commitType,
        scope: componentType,
        summary,
        analysis,
        breakingChanges
      };
      
    } catch (_error) {
      throw new Error(`Failed to generate commit message: ${error.message}`);
    }
  }

  /**
   * Analyze modification to understand changes
   * @private
   */
  async analyzeModification(componentType, originalContent, modifiedContent) {
    const analysis = {
      componentType,
      changeType: null,
      modifications: [],
      additions: [],
      deletions: [],
      statistics: {
        linesAdded: 0,
        linesRemoved: 0,
        filesChanged: 1
      },
      semanticChanges: []
    };

    // Generate diff for analysis
    const diff = this.diffGenerator.generateUnifiedDiff(
      originalContent,
      modifiedContent,
      `${componentType}.before`,
      `${componentType}.after`
    );

    // Parse diff to extract changes
    const lines = diff.split('\n');
    let _currentSection = null;
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        analysis.statistics.linesAdded++;
        analysis.additions.push(line.substring(1));
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        analysis.statistics.linesRemoved++;
        analysis.deletions.push(line.substring(1));
      } else if (line.startsWith('@@')) {
        currentSection = this.extractSectionName(line);
      }
    }

    // Analyze semantic changes based on component type
    switch (componentType) {
      case 'agent':
        analysis.semanticChanges = await this.analyzeAgentChanges(
          originalContent,
          modifiedContent
        );
        break;
      case 'task':
        analysis.semanticChanges = await this.analyzeTaskChanges(
          originalContent,
          modifiedContent
        );
        break;
      case 'workflow':
        analysis.semanticChanges = await this.analyzeWorkflowChanges(
          originalContent,
          modifiedContent
        );
        break;
    }

    // Determine overall change type
    if (analysis.statistics.linesRemoved === 0 && analysis.statistics.linesAdded > 0) {
      analysis.changeType = 'addition';
    } else if (analysis.statistics.linesAdded === 0 && analysis.statistics.linesRemoved > 0) {
      analysis.changeType = 'deletion';
    } else {
      analysis.changeType = 'modification';
    }

    return analysis;
  }

  /**
   * Analyze agent-specific changes
   * @private
   */
  async analyzeAgentChanges(originalContent, modifiedContent) {
    const changes = [];
    
    try {
      const originalParts = this.parseAgentContent(originalContent);
      const modifiedParts = this.parseAgentContent(modifiedContent);
      const originalMeta = yaml.load(originalParts.yaml);
      const modifiedMeta = yaml.load(modifiedParts.yaml);

      // Check command changes
      if (originalMeta.commands || modifiedMeta.commands) {
        const originalCmds = Object.keys(originalMeta.commands || {});
        const modifiedCmds = Object.keys(modifiedMeta.commands || {});
        
        const added = modifiedCmds.filter(cmd => !originalCmds.includes(cmd));
        const removed = originalCmds.filter(cmd => !modifiedCmds.includes(cmd));
        const modified = originalCmds.filter(cmd => 
          modifiedCmds.includes(cmd) && 
          originalMeta.commands[cmd] !== modifiedMeta.commands[cmd]
        );
        
        if (added.length > 0) {
          changes.push({ type: 'commands_added', items: added });
        }
        if (removed.length > 0) {
          changes.push({ type: 'commands_removed', items: removed });
        }
        if (modified.length > 0) {
          changes.push({ type: 'commands_modified', items: modified });
        }
      }

      // Check dependency changes
      if (originalMeta.dependencies || modifiedMeta.dependencies) {
        const depChanges = this.compareDependencies(
          originalMeta.dependencies || {},
          modifiedMeta.dependencies || {}
        );
        if (depChanges.length > 0) {
          changes.push(...depChanges);
        }
      }

      // Check metadata changes
      const metadataFields = ['title', 'icon', 'whenToUse', 'description'];
      for (const field of metadataFields) {
        if (originalMeta[field] !== modifiedMeta[field]) {
          changes.push({
            type: 'metadata_changed',
            field,
            from: originalMeta[field],
            to: modifiedMeta[field]
          });
        }
      }

    } catch (_error) {
      // If parsing fails, return generic change
      changes.push({ type: 'content_modified' });
    }

    return changes;
  }

  /**
   * Analyze task-specific changes
   * @private
   */
  async analyzeTaskChanges(originalContent, modifiedContent) {
    const changes = [];

    // Check section changes
    const sections = ['## Purpose', '## Task Execution', '## Output Format'];
    for (const section of sections) {
      const originalSection = this.extractSection(originalContent, section);
      const modifiedSection = this.extractSection(modifiedContent, section);
      
      if (originalSection !== modifiedSection) {
        changes.push({
          type: 'section_modified',
          section: section.replace('## ', ''),
          contentChanged: true
        });
      }
    }

    // Check elicitation blocks
    const originalElicits = (originalContent.match(/\[\[LLM:[\s\S]*?\]\]/g) || []).length;
    const modifiedElicits = (modifiedContent.match(/\[\[LLM:[\s\S]*?\]\]/g) || []).length;
    
    if (originalElicits !== modifiedElicits) {
      changes.push({
        type: 'elicitation_changed',
        from: originalElicits,
        to: modifiedElicits
      });
    }

    // Check task steps
    const originalSteps = (originalContent.match(/### \d+\./g) || []).length;
    const modifiedSteps = (modifiedContent.match(/### \d+\./g) || []).length;
    
    if (originalSteps !== modifiedSteps) {
      changes.push({
        type: 'steps_changed',
        from: originalSteps,
        to: modifiedSteps
      });
    }

    return changes;
  }

  /**
   * Analyze workflow-specific changes
   * @private
   */
  async analyzeWorkflowChanges(originalContent, modifiedContent) {
    const changes = [];

    try {
      const originalWorkflow = yaml.load(originalContent);
      const modifiedWorkflow = yaml.load(modifiedContent);

      // Check phase changes
      const originalPhases = Object.keys(originalWorkflow.phases || {});
      const modifiedPhases = Object.keys(modifiedWorkflow.phases || {});
      
      const added = modifiedPhases.filter(p => !originalPhases.includes(p));
      const removed = originalPhases.filter(p => !modifiedPhases.includes(p));
      
      if (added.length > 0) {
        changes.push({ type: 'phases_added', items: added });
      }
      if (removed.length > 0) {
        changes.push({ type: 'phases_removed', items: removed });
      }

      // Check phase modifications
      for (const phase of originalPhases) {
        if (modifiedPhases.includes(phase)) {
          const originalPhase = originalWorkflow.phases[phase];
          const modifiedPhase = modifiedWorkflow.phases[phase];
          
          if (JSON.stringify(originalPhase) !== JSON.stringify(modifiedPhase)) {
            changes.push({
              type: 'phase_modified',
              phase,
              details: this.comparePhases(originalPhase, modifiedPhase)
            });
          }
        }
      }

    } catch (_error) {
      changes.push({ type: 'structure_modified' });
    }

    return changes;
  }

  /**
   * Determine commit type based on analysis
   * @private
   */
  determineCommitType(analysis, userIntent) {
    const intent = userIntent.toLowerCase();
    
    // Check user intent first
    for (const [type, keywords] of Object.entries(this.changeKeywords)) {
      if (keywords.some(keyword => intent.includes(keyword))) {
        return type;
      }
    }

    // Analyze semantic changes
    const semanticTypes = analysis.semanticChanges.map(change => change.type);
    
    if (semanticTypes.some(type => type.includes('added') || type.includes('new'))) {
      return 'feat';
    }
    
    if (semanticTypes.some(type => type.includes('fixed') || type.includes('corrected'))) {
      return 'fix';
    }
    
    if (semanticTypes.some(type => type.includes('performance') || type.includes('optimized'))) {
      return 'perf';
    }
    
    if (analysis.changeType === 'modification' && 
        analysis.statistics.linesAdded > 0 && 
        analysis.statistics.linesRemoved > 0) {
      return 'refactor';
    }

    // Default to chore for other changes
    return 'chore';
  }

  /**
   * Determine action verb based on changes
   * @private
   */
  determineAction(componentType, analysis, userIntent) {
    const actions = this.componentActions[componentType] || {};
    const intent = userIntent.toLowerCase();
    
    // Check if user intent matches known actions
    for (const [action, description] of Object.entries(actions)) {
      if (intent.includes(action) || intent.includes(description.toLowerCase())) {
        return action;
      }
    }

    // Determine from semantic changes
    const changeTypes = analysis.semanticChanges.map(c => c.type);
    
    if (changeTypes.includes('commands_added') || changeTypes.includes('phases_added')) {
      return 'enhance';
    }
    
    if (changeTypes.includes('commands_removed') || changeTypes.includes('phases_removed')) {
      return 'remove';
    }
    
    if (changeTypes.some(t => t.includes('modified'))) {
      return 'update';
    }

    return 'update'; // Default action
  }

  /**
   * Generate commit summary
   * @private
   */
  generateSummary(componentType, componentName, action, analysis, userIntent) {
    // Use user intent if it's concise
    if (userIntent && userIntent.length < 50) {
      return userIntent.toLowerCase();
    }

    // Generate based on analysis
    const _changeCount = analysis.semanticChanges.length;
    const primaryChange = analysis.semanticChanges[0];
    
    if (primaryChange) {
      switch (primaryChange.type) {
        case 'commands_added':
          return `add ${primaryChange.items.join(', ')} command${primaryChange.items.length > 1 ? 's' : ''}`;
        case 'commands_removed':
          return `remove ${primaryChange.items.join(', ')} command${primaryChange.items.length > 1 ? 's' : ''}`;
        case 'phases_added':
          return `add ${primaryChange.items.join(', ')} phase${primaryChange.items.length > 1 ? 's' : ''}`;
        case 'phases_removed':
          return `remove ${primaryChange.items.join(', ')} phase${primaryChange.items.length > 1 ? 's' : ''}`;
        case 'metadata_changed':
          return `update ${primaryChange.field}`;
        default:
          return `${action} ${componentName}`;
      }
    }

    return `${action} ${componentName}`;
  }

  /**
   * Generate detailed commit body
   * @private
   */
  generateDetails(analysis, metadata) {
    const details = [];
    
    // Add statistics
    if (analysis.statistics.linesAdded > 0 || analysis.statistics.linesRemoved > 0) {
      details.push(
        `Changed: +${analysis.statistics.linesAdded} -${analysis.statistics.linesRemoved} lines`
      );
    }

    // Add semantic changes
    for (const change of analysis.semanticChanges) {
      switch (change.type) {
        case 'commands_added':
          details.push(`Added commands: ${change.items.join(', ')}`);
          break;
        case 'commands_removed':
          details.push(`Removed commands: ${change.items.join(', ')}`);
          break;
        case 'commands_modified':
          details.push(`Modified commands: ${change.items.join(', ')}`);
          break;
        case 'phases_added':
          details.push(`Added phases: ${change.items.join(', ')}`);
          break;
        case 'phases_removed':
          details.push(`Removed phases: ${change.items.join(', ')}`);
          break;
        case 'phase_modified':
          details.push(`Modified phase '${change.phase}': ${change.details.join(', ')}`);
          break;
        case 'metadata_changed':
          details.push(`Updated ${change.field}: "${change.from}" → "${change.to}"`);
          break;
        case 'section_modified':
          details.push(`Updated ${change.section} section`);
          break;
        case 'elicitation_changed':
          details.push(`Elicitation blocks: ${change.from} → ${change.to}`);
          break;
        case 'steps_changed':
          details.push(`Task steps: ${change.from} → ${change.to}`);
          break;
      }
    }

    // Add metadata information
    if (metadata.reason) {
      details.push(`\nReason: ${metadata.reason}`);
    }
    
    if (metadata.impact) {
      details.push(`Impact: ${metadata.impact}`);
    }
    
    if (metadata.relatedIssues && metadata.relatedIssues.length > 0) {
      details.push(`\nRelated: ${metadata.relatedIssues.join(', ')}`);
    }

    return details;
  }

  /**
   * Detect breaking changes
   * @private
   */
  async detectBreakingChanges(componentType, originalContent, modifiedContent) {
    const validation = await this.validator.validateModification(
      componentType,
      originalContent,
      modifiedContent
    );
    
    return validation.breakingChanges || [];
  }

  /**
   * Construct the full commit message
   * @private
   */
  constructMessage(parts) {
    const { type, scope, summary, body, breaking, metadata } = parts;
    
    // Header
    let message = `${type}(${scope}): ${summary}`;
    
    // Body
    if (body && body.length > 0) {
      message += '\n\n' + body.join('\n');
    }
    
    // Breaking changes
    if (breaking && breaking.length > 0) {
      message += '\n\nBREAKING CHANGE:';
      for (const change of breaking) {
        message += `\n- ${change.impact}`;
        if (change.items) {
          message += ` (${change.items.join(', ')})`;
        }
      }
    }
    
    // Footer
    const footer = [];
    
    if (metadata.approvedBy) {
      footer.push(`Approved-by: ${metadata.approvedBy}`);
    }
    
    if (metadata.reviewedBy) {
      footer.push(`Reviewed-by: ${metadata.reviewedBy}`);
    }
    
    footer.push('Generated-by: aios-developer meta-agent');
    
    if (footer.length > 0) {
      message += '\n\n' + footer.join('\n');
    }
    
    return message;
  }

  /**
   * Generate commit message for batch modifications
   * @param {Array} modifications - Array of modifications
   * @returns {Promise<Object>} Batch commit message
   */
  async generateBatchCommitMessage(modifications) {
    const summaries = [];
    const allBreaking = [];
    const stats = {
      agents: 0,
      tasks: 0,
      workflows: 0,
      total: modifications.length
    };
    
    // Process each modification
    for (const mod of modifications) {
      const result = await this.generateCommitMessage(mod);
      summaries.push(`- ${result.scope}: ${result.summary}`);
      allBreaking.push(...result.breakingChanges);
      
      // Count by type
      stats[`${mod.componentType}s`]++;
    }
    
    // Determine overall type
    const hasBreaking = allBreaking.length > 0;
    const type = hasBreaking ? 'feat!' : 'chore';
    
    // Construct message
    let message = `${type}: batch update ${stats.total} components`;
    
    message += '\n\nModifications:';
    message += '\n' + summaries.join('\n');
    
    message += '\n\nSummary:';
    if (stats.agents > 0) message += `\n- ${stats.agents} agent(s)`;
    if (stats.tasks > 0) message += `\n- ${stats.tasks} task(s)`;
    if (stats.workflows > 0) message += `\n- ${stats.workflows} workflow(s)`;
    
    if (hasBreaking) {
      message += '\n\nBREAKING CHANGES:';
      for (const breaking of allBreaking) {
        message += `\n- ${breaking.impact}`;
      }
    }
    
    message += '\n\nGenerated-by: aios-developer meta-agent';
    
    return {
      message,
      type,
      stats,
      breakingChanges: allBreaking
    };
  }

  /**
   * Suggest commit message improvements
   * @param {string} message - Original commit message
   * @returns {Object} Suggestions for improvement
   */
  suggestImprovements(message) {
    const suggestions = [];
    const lines = message.split('\n');
    const header = lines[0];
    
    // Check header format
    const headerMatch = header.match(/^(\w+)(\([\w-]+\))?: (.+)$/);
    if (!headerMatch) {
      suggestions.push({
        type: 'format',
        issue: 'Header doesn\'t follow conventional format',
        suggestion: 'Use format: type(_scope): subject'
      });
    } else {
      const [, type, scope, subject] = headerMatch;
      
      // Check type
      if (!this.commitTypes[type]) {
        suggestions.push({
          type: 'type',
          issue: `Unknown commit type: ${type}`,
          suggestion: `Use one of: ${Object.keys(this.commitTypes).join(', ')}`
        });
      }
      
      // Check subject length
      if (subject.length > 50) {
        suggestions.push({
          type: 'length',
          issue: 'Subject line too long',
          suggestion: 'Keep subject under 50 characters'
        });
      }
      
      // Check subject format
      if (subject[0] === subject[0].toUpperCase()) {
        suggestions.push({
          type: 'case',
          issue: 'Subject should not be capitalized',
          suggestion: 'Use lowercase for subject'
        });
      }
      
      if (subject.endsWith('.')) {
        suggestions.push({
          type: 'punctuation',
          issue: 'Subject should not end with period',
          suggestion: 'Remove trailing period'
        });
      }
    }
    
    // Check body
    if (lines.length > 1) {
      if (lines[1] !== '') {
        suggestions.push({
          type: 'spacing',
          issue: 'Missing blank line after header',
          suggestion: 'Add blank line between header and body'
        });
      }
      
      // Check line length in body
      for (let i = 2; i < lines.length; i++) {
        if (lines[i].length > 72 && !lines[i].startsWith('BREAKING')) {
          suggestions.push({
            type: 'line-length',
            issue: `Line ${i + 1} exceeds 72 characters`,
            suggestion: 'Wrap body text at 72 characters'
          });
        }
      }
    }
    
    return {
      valid: suggestions.length === 0,
      suggestions,
      improvedMessage: this.applyImprovements(message, suggestions)
    };
  }

  /**
   * Apply improvements to commit message
   * @private
   */
  applyImprovements(message, suggestions) {
    let improved = message;
    
    for (const suggestion of suggestions) {
      switch (suggestion.type) {
        case 'case':
          improved = improved.replace(/^(\w+)(\([\w-]+\))?: (.)/, (match, type, scope, firstChar) => 
            `${type}${scope || ''}: ${firstChar.toLowerCase()}`
          );
          break;
        case 'punctuation':
          improved = improved.replace(/^(.+)\.$/, '$1');
          break;
        case 'spacing':
          const lines = improved.split('\n');
          if (lines.length > 1 && lines[1] !== '') {
            lines.splice(1, 0, '');
            improved = lines.join('\n');
          }
          break;
      }
    }
    
    return improved;
  }

  // Utility methods
  parseAgentContent(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      throw new Error('Invalid agent content format');
    }
    return {
      yaml: match[1],
      markdown: match[2]
    };
  }

  extractSection(content, sectionHeader) {
    const regex = new RegExp(`${sectionHeader}[\\s\\S]*?(?=\\n##|$)`, 'i');
    const match = content.match(regex);
    return match ? match[0] : '';
  }

  extractSectionName(diffLine) {
    const match = diffLine.match(/@@ .* @@ (.+)/);
    return match ? match[1] : 'unknown';
  }

  compareDependencies(original, modified) {
    const changes = [];
    const types = ['tasks', 'workflows', 'agents'];
    
    for (const type of types) {
      const originalDeps = original[type] || [];
      const modifiedDeps = modified[type] || [];
      
      const added = modifiedDeps.filter(d => !originalDeps.includes(d));
      const removed = originalDeps.filter(d => !modifiedDeps.includes(d));
      
      if (added.length > 0) {
        changes.push({ type: `${type}_dependencies_added`, items: added });
      }
      if (removed.length > 0) {
        changes.push({ type: `${type}_dependencies_removed`, items: removed });
      }
    }
    
    return changes;
  }

  comparePhases(originalPhase, modifiedPhase) {
    const details = [];
    
    if (originalPhase.sequence !== modifiedPhase.sequence) {
      details.push(`sequence ${originalPhase.sequence}→${modifiedPhase.sequence}`);
    }
    
    const originalAgents = originalPhase.agents || [];
    const modifiedAgents = modifiedPhase.agents || [];
    
    if (JSON.stringify(originalAgents) !== JSON.stringify(modifiedAgents)) {
      details.push('agents changed');
    }
    
    if (JSON.stringify(originalPhase.artifacts) !== JSON.stringify(modifiedPhase.artifacts)) {
      details.push('artifacts changed');
    }
    
    return details;
  }
}

module.exports = CommitMessageGenerator;