const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { validateYAML } = require('./yaml-validator');
const DependencyAnalyzer = require('./dependency-analyzer');
const SecurityChecker = require('./security-checker');

/**
 * Validates component modifications before applying them
 */
class ModificationValidator {
  constructor() {
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.securityChecker = new SecurityChecker();
    this.validationRules = {
      agent: this.validateAgentModification.bind(this),
      task: this.validateTaskModification.bind(this),
      workflow: this.validateWorkflowModification.bind(this),
      template: this.validateTemplateModification.bind(this)
    };
  }

  /**
   * Validate a component modification
   * @param {string} componentType - Type of component (agent, task, workflow, etc.)
   * @param {string} originalContent - Original component content
   * @param {string} modifiedContent - Modified component content
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with errors and warnings
   */
  async validateModification(_componentType, originalContent, modifiedContent, options = {}) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      breakingChanges: []
    };

    // Basic validation
    if (!originalContent || !modifiedContent) {
      result.valid = false;
      result.errors.push('Original or modified content is empty');
      return result;
    }

    // Run type-specific validation
    if (this.validationRules[componentType]) {
      const typeResult = await this.validationRules[componentType](
        originalContent,
        modifiedContent,
        options
      );
      this.mergeResults(result, typeResult);
    } else {
      result.warnings.push(`No specific validation rules for component type: ${componentType}`);
    }

    // Run security validation
    const securityResult = await this.validateSecurity(modifiedContent, componentType);
    this.mergeResults(result, securityResult);

    // Check for breaking changes
    const breakingChanges = await this.detectBreakingChanges(
      _componentType,
      originalContent,
      modifiedContent
    );
    result.breakingChanges = breakingChanges;

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate agent modifications
   * @private
   */
  async validateAgentModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Parse agent content
      const originalParts = this.parseAgentContent(originalContent);
      const modifiedParts = this.parseAgentContent(modifiedContent);

      // Validate YAML structure
      const yamlValidation = validateYAML(modifiedParts.yaml);
      if (!yamlValidation.valid) {
        result.valid = false;
        result.errors.push(`YAML validation failed: ${yamlValidation.error}`);
        return result;
      }

      const originalMeta = yaml.load(originalParts.yaml);
      const modifiedMeta = yaml.load(modifiedParts.yaml);

      // Check required fields
      const requiredFields = ['name', 'id', 'title', 'icon', 'whenToUse'];
      for (const field of requiredFields) {
        if (!modifiedMeta[field]) {
          result.errors.push(`Required field missing: ${field}`);
        }
      }

      // Validate dependencies
      if (modifiedMeta.dependencies) {
        const depValidation = await this.validateDependencies(modifiedMeta.dependencies);
        this.mergeResults(result, depValidation);
      }

      // Check command structure
      if (modifiedMeta.commands) {
        for (const [cmd, desc] of Object.entries(modifiedMeta.commands)) {
          if (!desc || typeof desc !== 'string') {
            result.errors.push(`Invalid command description for: ${cmd}`);
          }
        }
      }

      // Check for removed commands (breaking change)
      if (originalMeta.commands && modifiedMeta.commands) {
        const removedCommands = Object.keys(originalMeta.commands)
          .filter(cmd => !modifiedMeta.commands[cmd]);
        
        if (removedCommands.length > 0) {
          result.warnings.push(`Commands removed: ${removedCommands.join(', ')}`);
        }
      }

      // Validate markdown content
      const markdownValidation = this.validateMarkdown(modifiedParts.markdown);
      this.mergeResults(result, markdownValidation);

    } catch (_error) {
      result.valid = false;
      result.errors.push(`Failed to parse agent content: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate task modifications
   * @private
   */
  async validateTaskModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for required sections
    const requiredSections = ['## Purpose', '## Task Execution'];
    for (const section of requiredSections) {
      if (!modifiedContent.includes(section)) {
        result.errors.push(`Required section missing: ${section}`);
      }
    }

    // Validate elicitation blocks
    const elicitationBlocks = modifiedContent.match(/\[\[LLM:([\s\S]*?)\]\]/g) || [];
    for (const block of elicitationBlocks) {
      if (!block.includes(']]')) {
        result.errors.push('Unclosed elicitation block found');
      }
    }

    // Check for task flow consistency
    const taskSteps = modifiedContent.match(/###\s+\d+\.\s+/g) || [];
    const expectedSteps = taskSteps.length;
    for (let i = 1; i <= expectedSteps; i++) {
      if (!modifiedContent.includes(`### ${i}.`)) {
        result.warnings.push(`Task step ${i} appears to be missing or misnumbered`);
      }
    }

    // Validate output format if specified
    const outputMatch = modifiedContent.match(/## Output Format[\s\S]*?```([\s\S]*?)```/);
    if (outputMatch) {
      const outputFormat = outputMatch[1].trim();
      if (outputFormat.startsWith('json')) {
        try {
          // Extract JSON and validate
          const jsonContent = outputFormat.replace(/^json\s*/, '');
          JSON.parse(jsonContent);
        } catch (_error) {
          result.warnings.push('Output format contains invalid JSON example');
        }
      }
    }

    return result;
  }

  /**
   * Validate workflow modifications
   * @private
   */
  async validateWorkflowModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      const _originalWorkflow = yaml.load(originalContent);
      const modifiedWorkflow = yaml.load(modifiedContent);

      // Validate YAML structure
      const yamlValidation = validateYAML(modifiedContent);
      if (!yamlValidation.valid) {
        result.valid = false;
        result.errors.push(`YAML validation failed: ${yamlValidation.error}`);
        return result;
      }

      // Check required fields
      if (!modifiedWorkflow.name) {
        result.errors.push('Workflow name is required');
      }

      if (!modifiedWorkflow.phases || Object.keys(modifiedWorkflow.phases).length === 0) {
        result.errors.push('Workflow must have at least one phase');
      }

      // Validate phase structure
      const phaseSequences = [];
      for (const [phaseName, phase] of Object.entries(modifiedWorkflow.phases || {})) {
        if (!phase.sequence) {
          result.errors.push(`Phase '${phaseName}' missing sequence number`);
        } else {
          phaseSequences.push(phase.sequence);
        }

        if (!phase.agents || phase.agents.length === 0) {
          result.errors.push(`Phase '${phaseName}' must have at least one agent`);
        }

        // Validate agent references
        for (const agent of phase.agents || []) {
          const agentExists = await this.checkAgentExists(agent);
          if (!agentExists) {
            result.warnings.push(`Agent '${agent}' referenced in phase '${phaseName}' not found`);
          }
        }
      }

      // Check for sequence gaps
      phaseSequences.sort((a, b) => a - b);
      for (let i = 1; i < phaseSequences.length; i++) {
        if (phaseSequences[i] - phaseSequences[i-1] > 2) {
          result.warnings.push('Large gap in phase sequences detected');
        }
      }

      // Validate entry/exit criteria references
      for (const [phaseName, phase] of Object.entries(modifiedWorkflow.phases || {})) {
        if (phase.entry_criteria) {
          for (const criteria of phase.entry_criteria) {
            // Check if criteria references valid artifacts or phases
            const referencesValid = this.validateCriteriaReferences(
              criteria,
              modifiedWorkflow
            );
            if (!referencesValid) {
              result.warnings.push(
                `Entry criteria '${criteria}' in phase '${phaseName}' may reference non-existent artifact`
              );
            }
          }
        }
      }

    } catch (_error) {
      result.valid = false;
      result.errors.push(`Failed to parse workflow: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate template modifications
   * @private
   */
  async validateTemplateModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for placeholder consistency
    const placeholders = modifiedContent.match(/\{\{[^}]+\}\}/g) || [];
    const uniquePlaceholders = [...new Set(placeholders)];

    // Warn about unreplaced placeholders
    if (uniquePlaceholders.length > 0) {
      result.suggestions.push(
        `Template contains ${uniquePlaceholders.length} placeholders: ${uniquePlaceholders.join(', ')}`
      );
    }

    // Validate LLM instruction blocks
    const llmBlocks = modifiedContent.match(/\[\[LLM:([\s\S]*?)\]\]/g) || [];
    for (const block of llmBlocks) {
      if (block.length > 1000) {
        result.warnings.push('LLM instruction block exceeds recommended length (1000 chars)');
      }
    }

    return result;
  }

  /**
   * Validate dependencies exist
   * @private
   */
  async validateDependencies(dependencies) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    const baseDir = path.join(process.cwd(), 'aios-core');

    for (const [type, files] of Object.entries(dependencies)) {
      if (!Array.isArray(files)) continue;

      const typeDir = path.join(baseDir, type);
      
      for (const file of files) {
        const filePath = path.join(typeDir, file);
        try {
          await fs.access(filePath);
        } catch (_error) {
          result.warnings.push(`Dependency not found: ${type}/${file}`);
        }
      }
    }

    return result;
  }

  /**
   * Validate markdown content
   * @private
   */
  validateMarkdown(content) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check for broken internal links
    const internalLinks = content.match(/\[([^\]]+)\]\(#[^)]+\)/g) || [];
    for (const link of internalLinks) {
      const anchor = link.match(/#([^)]+)/)[1];
      const headingRegex = new RegExp(`^#+.*${anchor}`, 'mi');
      if (!headingRegex.test(content)) {
        result.warnings.push(`Broken internal link: ${link}`);
      }
    }

    // Check for code block closure
    const codeBlocks = content.split('```');
    if (codeBlocks.length % 2 === 0) {
      result.errors.push('Unclosed code block detected');
    }

    return result;
  }

  /**
   * Validate security concerns
   * @private
   */
  async validateSecurity(content, componentType) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    const securityIssues = await this.securityChecker.checkContent(content);
    
    if (securityIssues.length > 0) {
      for (const issue of securityIssues) {
        if (issue.severity === 'high') {
          result.errors.push(`Security issue: ${issue.message}`);
        } else {
          result.warnings.push(`Security concern: ${issue.message}`);
        }
      }
    }

    return result;
  }

  /**
   * Detect breaking changes
   * @private
   */
  async detectBreakingChanges(_componentType, originalContent, modifiedContent) {
    const breakingChanges = [];

    switch (_componentType) {
      case 'agent':
        // Check for removed commands
        try {
          const originalParts = this.parseAgentContent(originalContent);
          const modifiedParts = this.parseAgentContent(modifiedContent);
          const originalMeta = yaml.load(originalParts.yaml);
          const modifiedMeta = yaml.load(modifiedParts.yaml);

          if (originalMeta.commands && modifiedMeta.commands) {
            const removedCommands = Object.keys(originalMeta.commands)
              .filter(cmd => !modifiedMeta.commands[cmd]);
            
            if (removedCommands.length > 0) {
              breakingChanges.push({
                type: 'removed_commands',
                items: removedCommands,
                impact: 'Users relying on these commands will need to update their workflows'
              });
            }
          }
        } catch (_error) {
          // Ignore parsing errors here
        }
        break;

      case 'task':
        // Check for changed output format
        const originalOutput = originalContent.match(/## Output Format[\s\S]*?```[\s\S]*?```/);
        const modifiedOutput = modifiedContent.match(/## Output Format[\s\S]*?```[\s\S]*?```/);
        
        if (originalOutput && modifiedOutput && originalOutput[0] !== modifiedOutput[0]) {
          breakingChanges.push({
            type: 'output_format_changed',
            impact: 'Components consuming this task output may need updates'
          });
        }
        break;

      case 'workflow':
        // Check for removed phases
        try {
          const _originalWorkflow = yaml.load(originalContent);
          const modifiedWorkflow = yaml.load(modifiedContent);

          const originalPhases = Object.keys(originalWorkflow.phases || {});
          const modifiedPhases = Object.keys(modifiedWorkflow.phases || {});

          const removedPhases = originalPhases.filter(p => !modifiedPhases.includes(p));
          
          if (removedPhases.length > 0) {
            breakingChanges.push({
              type: 'removed_phases',
              items: removedPhases,
              impact: 'Projects using this workflow may fail at removed phases'
            });
          }
        } catch (_error) {
          // Ignore parsing errors here
        }
        break;
    }

    return breakingChanges;
  }

  /**
   * Parse agent content into YAML and markdown sections
   * @private
   */
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

  /**
   * Check if an agent exists
   * @private
   */
  async checkAgentExists(agentName) {
    const agentPath = path.join(process.cwd(), 'aios-core', 'agents', `${agentName}.md`);
    try {
      await fs.access(agentPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate criteria references
   * @private
   */
  validateCriteriaReferences(criteria, workflow) {
    // Simple check - could be enhanced
    const artifacts = new Set();
    
    for (const phase of Object.values(workflow.phases || {})) {
      if (phase.artifacts) {
        phase.artifacts.forEach(a => artifacts.add(a));
      }
    }

    // Check if criteria mentions any known artifact
    for (const artifact of artifacts) {
      if (criteria.toLowerCase().includes(artifact.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Merge validation results
   * @private
   */
  mergeResults(target, source) {
    target.errors.push(...(source.errors || []));
    target.warnings.push(...(source.warnings || []));
    target.suggestions.push(...(source.suggestions || []));
    
    if (source.valid === false) {
      target.valid = false;
    }
  }
}

module.exports = ModificationValidator;