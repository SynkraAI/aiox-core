/**
 * Component Generator for Synkra AIOX
 * Generates agents, tasks, and workflows using templates
 * @module component-generator
 */

const fs = require('fs-extra');
const path = require('path');
const TemplateEngine = require('./template-engine');
const TemplateValidator = require('./template-validator');
const SecurityChecker = require('./security-checker');
const YAMLValidator = require('./yaml-validator');
const ElicitationEngine = require('../../core/elicitation/elicitation-engine');
// const ComponentPreview = require('./component-preview'); // Archived in archived-utilities/ (Story 3.1.2)
// const ManifestPreview = require('./manifest-preview'); // Archived in archived-utilities/ (Story 3.1.3)
const ComponentMetadata = require('./component-metadata');
const TransactionManager = require('./transaction-manager');
const chalk = require('chalk');

class ComponentGenerator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.templatesPath = path.join(this.rootPath, 'aiox-core', 'templates');
    this.outputPaths = {
      agent: path.join(this.rootPath, 'aiox-core', 'agents'),
      task: path.join(this.rootPath, 'aiox-core', 'tasks'),
      workflow: path.join(this.rootPath, 'aiox-core', 'workflows'),
    };
    
    this.templateEngine = new TemplateEngine();
    this.templateValidator = new TemplateValidator();
    this.securityChecker = new SecurityChecker();
    this.yamlValidator = new YAMLValidator();
    this.elicitationEngine = new ElicitationEngine();
    // this.componentPreview = new ComponentPreview(); // Archived in utils-archive/ (Story 3.1.2)
    // this.manifestPreview = new ManifestPreview(this.rootPath); // Archived in utils-archive/ (Story 3.1.3)
    this.componentMetadata = new ComponentMetadata({ rootPath: this.rootPath });
    this.transactionManager = new TransactionManager({ rootPath: this.rootPath });
  }

  /**
   * Generate a component using templates and elicitation
   * @param {string} componentType - Type of component (agent, task, workflow)
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result
   */
  async generateComponent(componentType, options = {}) {
    let transactionId = null;
    
    try {
      console.log(chalk.blue(`\n🚀 Starting ${componentType} generation...\n`));
      
      // Start transaction if not in batch mode
      if (!options.transactionId) {
        transactionId = await this.transactionManager.beginTransaction({
          type: 'component_creation',
          description: `Create ${componentType}`,
          rollbackOnError: true,
        });
      } else {
        transactionId = options.transactionId;
      }
      
      // Load appropriate elicitation workflow
      const elicitationSteps = await this.loadElicitationWorkflow(componentType);
      
      // Start elicitation session
      await this.elicitationEngine.startSession(componentType, {
        saveSession: options.saveSession !== false,
      });
      
      // Run elicitation to gather answers
      const answers = await this.elicitationEngine.runProgressive(elicitationSteps);
      if (!answers) {
        if (!options.transactionId) {
          await this.transactionManager.rollbackTransaction(transactionId);
        }
        return { success: false, error: 'Elicitation cancelled' };
      }
      
      // Process answers into template variables
      const variables = this.processAnswersToVariables(componentType, answers);
      
      // Validate variables
      const validation = this.validateVariables(componentType, variables);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Load template
      let templatePath = path.join(this.templatesPath, `${componentType}-template.yaml`);
      if (componentType === 'task') {
        templatePath = templatePath.replace('.yaml', '.md');
      }
      
      const template = await fs.readFile(templatePath, 'utf8');
      
      // Process template with variables
      const content = this.templateEngine.process(template, variables);
      
      // Security validation
      const securityCheck = this.securityChecker.checkCode(content);
      if (!securityCheck.valid) {
        throw new Error(`Security check failed: ${securityCheck.errors.join(', ')}`);
      }
      
      // Generate output path
      const outputPath = this.getOutputPath(componentType, variables);
      
      // Generate preview
      const previewMetadata = {
        name: variables.AGENT_NAME || variables.TASK_ID || variables.WORKFLOW_ID,
        path: outputPath,
        type: componentType,
      };
      
      const preview = await this.componentPreview.generatePreview(
        componentType, 
        content, 
        previewMetadata,
      );
      
      // Show preview statistics
      const stats = this.componentPreview.getPreviewStats(content, componentType);
      console.log(chalk.gray('\n📊 Component Statistics:'));
      console.log(chalk.gray(`   Lines: ${stats.lines} | Size: ${stats.size} bytes`));
      if (stats.commands !== undefined) {
        console.log(chalk.gray(`   Commands: ${stats.commands} | Dependencies: ${stats.dependencies}`));
      }
      if (stats.steps !== undefined) {
        console.log(chalk.gray(`   Steps: ${stats.steps} | Triggers: ${stats.triggers}`));
      }
      
      // Confirm with preview
      const proceed = options.skipPreview || await this.componentPreview.confirmWithPreview(preview, {
        message: `Create this ${componentType}?`,
      });
      
      if (!proceed) {
        await this.elicitationEngine.completeSession('cancelled');
        return { success: false, error: 'Component creation cancelled by user' };
      }
      
      // Check if already exists
      if (await fs.pathExists(outputPath)) {
        const overwrite = options.force || await this.confirmOverwrite(outputPath);
        if (!overwrite) {
          return { success: false, error: 'Component already exists' };
        }
      }
      
      // Save preview if requested
      if (options.savePreview) {
        const previewPath = outputPath.replace(/\.(yaml|md)$/, '.preview.txt');
        await this.componentPreview.savePreviewToFile(preview, previewPath);
        console.log(chalk.gray(`📄 Preview saved to: ${previewPath}`));
      }
      
      // Write file with transaction tracking
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, content, 'utf8');
      
      // Record file creation in transaction
      await this.transactionManager.recordOperation(transactionId, {
        type: 'create',
        target: 'file',
        path: outputPath,
        content: content,
        metadata: { componentType, componentId: variables.AGENT_NAME || variables.TASK_ID || variables.WORKFLOW_ID },
      });
      
      // Create task files for agent commands if needed
      if (componentType === 'agent' && !options.skipTaskCreation) {
        await this.createAgentCommandTasks(variables, { ...options, transactionId });
      }
      
      // Update manifest if not skipped
      if (!options.skipManifest) {
        const componentInfo = {
          id: variables.AGENT_NAME || variables.TASK_ID || variables.WORKFLOW_ID,
          name: variables.AGENT_TITLE || variables.TASK_TITLE || variables.WORKFLOW_NAME,
          description: variables.WHEN_TO_USE || variables.TASK_DESCRIPTION || variables.WORKFLOW_DESCRIPTION,
        };
        
        const manifestUpdated = await this.manifestPreview.interactiveManifestUpdate(
          componentType,
          componentInfo,
        );
        
        if (!manifestUpdated) {
          console.log(chalk.yellow('\n⚠️  Component created but manifest not updated'));
        }
      }
      
      // Create component metadata
      const componentId = variables.AGENT_NAME || variables.TASK_ID || variables.WORKFLOW_ID;
      const metadata = await this.componentMetadata.createMetadata(
        componentType,
        {
          id: componentId,
          name: variables.AGENT_TITLE || variables.TASK_TITLE || variables.WORKFLOW_NAME,
          description: variables.WHEN_TO_USE || variables.TASK_DESCRIPTION || variables.WORKFLOW_DESCRIPTION,
          ...variables,
        },
        {
          creator: process.env.USER || 'system',
          description: `Created ${componentType} via template system`,
          tags: options.tags || ['generated', componentType],
        },
      );
      
      console.log(chalk.gray(`📊 Metadata created with ID: ${metadata.id}`));
      
      // Track dependencies if present
      if (componentType === 'agent' && variables.COMMANDS) {
        for (const command of variables.COMMANDS) {
          const taskId = this.commandToTaskId(command.COMMAND_NAME);
          await this.componentMetadata.trackRelationship(
            { type: 'agent', id: componentId },
            { type: 'task', id: taskId },
            'depends-on',
          );
        }
      }
      
      // Complete session
      await this.elicitationEngine.completeSession('success');
      
      // Commit transaction if we started it
      if (!options.transactionId && transactionId) {
        await this.transactionManager.commitTransaction(transactionId);
      }
      
      console.log(chalk.green(`\n✅ ${componentType} generated successfully!`));
      console.log(chalk.gray(`📁 Location: ${outputPath}`));
      
      return {
        success: true,
        path: outputPath,
        componentType,
        name: componentId,
        variables,
        metadata,
        transactionId,
      };
      
    } catch (error) {
      console.error(chalk.red(`\n❌ Generation failed: ${error.message}`));
      
      // Rollback transaction if we started it
      if (!options.transactionId && transactionId) {
        try {
          await this.transactionManager.rollbackTransaction(transactionId);
          console.log(chalk.yellow('🔄 Changes have been rolled back'));
        } catch (rollbackError) {
          console.error(chalk.red(`❌ Rollback failed: ${rollbackError.message}`));
        }
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process elicitation answers into template variables
   * @private
   */
  processAnswersToVariables(componentType, answers) {
    const variables = {};
    
    switch (componentType) {
      case 'agent':
        // Basic info
        variables.AGENT_NAME = answers.agentName;
        variables.AGENT_ID = answers.agentName;
        variables.AGENT_TITLE = answers.agentTitle;
        variables.AGENT_ICON = answers.agentIcon;
        variables.WHEN_TO_USE = answers.whenToUse;
        
        // Persona
        variables.PERSONA_ROLE = answers.personaRole;
        variables.PERSONA_STYLE = answers.personaStyle;
        variables.PERSONA_IDENTITY = answers.personaIdentity;
        variables.PERSONA_FOCUS = answers.personaFocusCustom || answers.personaFocus;
        
        // Commands
        const commands = [];
        if (answers.standardCommands && answers.standardCommands.length > 0) {
          commands.push(...answers.standardCommands.map(cmd => ({
            COMMAND_NAME: cmd,
            COMMAND_DESCRIPTION: this.getStandardCommandDescription(cmd),
          })));
        }
        if (answers.customCommands && Array.isArray(answers.customCommands)) {
          commands.push(...answers.customCommands.map(cmd => {
            const [name, desc] = cmd.split(':');
            return {
              COMMAND_NAME: name ? name.trim() : 'custom',
              COMMAND_DESCRIPTION: desc ? desc.trim() : 'Custom command',
            };
          }));
        }
        variables.COMMANDS = commands;
        variables.EACH_COMMANDS = commands;
        
        // Dependencies
        if (answers.dependencyTypes && answers.dependencyTypes.length > 0) {
          variables.IF_DEPENDENCIES = true;
          if (answers.taskDependencies && answers.taskDependencies.length > 0) {
            variables.IF_TASKS = true;
            variables.EACH_TASK_DEPS = answers.taskDependencies;
          }
          if (answers.templateDependencies && answers.templateDependencies.length > 0) {
            variables.IF_TEMPLATES = true;
            variables.EACH_TEMPLATE_DEPS = answers.templateDependencies;
          }
        }
        
        // Security
        if (answers.securityLevel !== 'standard') {
          variables.IF_SECURITY_CONFIG = true;
          variables.SECURITY_AUTHORIZATION = answers.requireAuthorization ? 'required' : 'optional';
          variables.AUDIT_LOGGING = answers.enableAuditLogging || false;
          if (answers.allowedOperations) {
            variables.EACH_ALLOWED_OPS = answers.allowedOperations;
          }
        }
        
        // Advanced
        if (answers.corePrinciples && answers.corePrinciples.length > 0) {
          variables.IF_CORE_PRINCIPLES = true;
          variables.EACH_PRINCIPLES = answers.corePrinciples;
        }
        
        if (answers.customActivationInstructions) {
          variables.IF_ACTIVATION_INSTRUCTIONS = true;
          variables.ACTIVATION_INSTRUCTIONS = answers.customActivationInstructions;
        }
        
        // Customization
        if (answers.customBehavior) {
          variables.IF_CUSTOMIZATION = true;
          variables.CUSTOMIZATION = answers.customBehavior;
        }
        break;
        
      case 'task':
        variables.TASK_TITLE = answers.taskTitle;
        variables.TASK_ID = answers.taskId;
        variables.AGENT_NAME = answers.agentName;
        variables.VERSION = '1.0';
        variables.TASK_DESCRIPTION = answers.taskDescription;
        
        if (answers.requiresContext) {
          variables.IF_CONTEXT_REQUIRED = true;
          variables.CONTEXT_DESCRIPTION = answers.contextDescription;
        }
        
        // Prerequisites
        const prereqs = [...(answers.prerequisites || []), ...(answers.customPrerequisites || [])];
        variables.EACH_PREREQUISITES = prereqs;
        
        // Workflow
        if (answers.isInteractive) {
          variables.IF_INTERACTIVE_ELICITATION = true;
          variables.ELICIT_STEP_1 = 'Gather required information';
          variables.ELICIT_STEP_2 = 'Validate and process inputs';
          variables.ELICIT_STEP_3 = 'Review and confirm actions';
        }
        
        // Steps (simplified for now)
        const steps = [];
        for (let i = 1; i <= (answers.stepCount || 3); i++) {
          steps.push({
            STEP_NUMBER: i,
            STEP_TITLE: `Step ${i}`,
            STEP_DESCRIPTION: `Implementation for step ${i}`,
            IF_STEP_VALIDATION: true,
            STEP_VALIDATION: 'Validate step completion',
          });
        }
        variables.EACH_STEPS = steps;
        
        // Output
        variables.OUTPUT_DESCRIPTION = answers.outputDescription;
        if (answers.outputFormat && answers.outputFormat !== 'Other') {
          variables.IF_OUTPUT_FORMAT = true;
          variables.OUTPUT_FORMAT_TYPE = answers.outputFormat.toLowerCase();
          variables.OUTPUT_FORMAT_TEMPLATE = '// Output template here';
        }
        
        // Success criteria
        variables.EACH_SUCCESS_CRITERIA = answers.successCriteria || [];
        
        // Error handling
        if (answers.commonErrors && answers.commonErrors.length > 0) {
          variables.IF_ERROR_HANDLING = true;
          variables.EACH_ERROR_CASES = answers.commonErrors.map(err => ({
            ERROR_CASE: err,
            ERROR_HANDLING: `Handle ${err} appropriately`,
          }));
        }
        
        // Security
        if (answers.securityChecks && answers.securityChecks.length > 0) {
          variables.IF_SECURITY_NOTES = true;
          variables.EACH_SECURITY_ITEMS = answers.securityChecks;
        }
        
        // Notes
        variables.EACH_NOTES = ['Generated using Synkra AIOX template system'];
        break;
        
      case 'workflow':
        variables.WORKFLOW_ID = answers.workflowId;
        variables.WORKFLOW_NAME = answers.workflowName;
        variables.WORKFLOW_DESCRIPTION = answers.workflowDescription;
        variables.WORKFLOW_VERSION = '1.0';
        variables.WORKFLOW_TYPE = answers.workflowType;
        
        // Metadata
        variables.AUTHOR = process.env.USER || 'Synkra AIOX';
        variables.CREATED_DATE = new Date().toISOString();
        variables.LAST_MODIFIED = new Date().toISOString();
        variables.EACH_TAGS = ['generated', componentType];
        
        // Triggers
        if (answers.triggerTypes && answers.triggerTypes.length > 0) {
          variables.IF_TRIGGERS = true;
          variables.EACH_TRIGGERS = answers.triggerTypes.map(type => ({
            TRIGGER_TYPE: type,
            TRIGGER_CONDITION: this.getTriggerCondition(type, answers),
          }));
        }
        
        // Inputs
        if (answers.hasInputs) {
          variables.IF_INPUTS = true;
          // Simplified for now
          variables.EACH_INPUTS = [];
        }
        
        // Steps
        const workflowSteps = [];
        for (let i = 1; i <= (answers.stepCount || 3); i++) {
          workflowSteps.push({
            STEP_ID: `step-${i}`,
            STEP_NAME: `Step ${i}`,
            STEP_TYPE: 'task',
          });
        }
        variables.EACH_STEPS = workflowSteps;
        
        // Outputs
        if (answers.outputTypes && answers.outputTypes.length > 0) {
          variables.IF_OUTPUTS = true;
          variables.EACH_OUTPUTS = answers.outputTypes.map((type, idx) => ({
            OUTPUT_NAME: `output-${idx + 1}`,
            OUTPUT_TYPE: type,
            OUTPUT_DESCRIPTION: `${type} output`,
            OUTPUT_SOURCE: `step-${answers.stepCount || 3}.result`,
          }));
        }
        
        // Error handling
        if (answers.globalErrorStrategy) {
          variables.IF_ERROR_HANDLING = true;
          variables.GLOBAL_ERROR_ACTION = answers.globalErrorStrategy;
          variables.NOTIFICATION_ENABLED = answers.enableNotifications || false;
          if (answers.notificationEvents) {
            variables.IF_NOTIFICATION_CHANNELS = true;
            variables.EACH_CHANNELS = ['console', 'log'];
          }
        }
        
        // Security
        if (answers.requireAuth) {
          variables.IF_SECURITY = true;
          variables.AUTH_REQUIRED = true;
          if (answers.allowedRoles) {
            variables.IF_ALLOWED_ROLES = true;
            variables.EACH_ROLES = answers.allowedRoles;
          }
          variables.AUDIT_LOGGING = answers.enableAuditLog || false;
        }
        break;
    }
    
    return variables;
  }

  /**
   * Validate variables for template
   * @private
   */
  validateVariables(componentType, variables) {
    const requiredFields = {
      agent: ['AGENT_NAME', 'AGENT_ID', 'AGENT_TITLE'],
      task: ['TASK_TITLE', 'TASK_ID', 'AGENT_NAME'],
      workflow: ['WORKFLOW_ID', 'WORKFLOW_NAME', 'WORKFLOW_TYPE'],
    };
    
    const errors = [];
    const required = requiredFields[componentType] || [];
    
    for (const field of required) {
      if (!variables[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Naming convention validation
    const nameField = {
      agent: 'AGENT_NAME',
      task: 'TASK_ID',
      workflow: 'WORKFLOW_ID',
    }[componentType];
    
    if (variables[nameField] && !/^[a-z][a-z0-9-]*$/.test(variables[nameField])) {
      errors.push(`Invalid naming convention for ${nameField}: must be lowercase with hyphens`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get output path for component
   * @private
   */
  getOutputPath(componentType, variables) {
    const name = variables.AGENT_NAME || variables.TASK_ID || variables.WORKFLOW_ID;
    const extension = componentType === 'workflow' ? 'yaml' : 'md';
    return path.join(this.outputPaths[componentType], `${name}.${extension}`);
  }

  /**
   * Load elicitation workflow
   * @private
   */
  async loadElicitationWorkflow(componentType) {
    const workflowPath = path.join(
      this.rootPath,
      'aiox-core',
      'elicitation',
      `${componentType}-elicitation.js`,
    );
    
    if (!await fs.pathExists(workflowPath)) {
      throw new Error(`Elicitation workflow not found for ${componentType}`);
    }
    
    return require(workflowPath);
  }

  /**
   * Get standard command description
   * @private
   */
  getStandardCommandDescription(command) {
    const descriptions = {
      analyze: 'Perform analysis on data or code',
      create: 'Generate new content or files',
      review: 'Review existing work for quality',
      suggest: 'Provide recommendations and improvements',
      explain: 'Explain concepts or code in detail',
      validate: 'Check for errors and issues',
      report: 'Generate comprehensive reports',
    };
    
    return descriptions[command] || 'Execute command';
  }

  /**
   * Get trigger condition based on type
   * @private
   */
  getTriggerCondition(type, answers) {
    switch (type) {
      case 'manual':
        return 'User executes workflow command';
      case 'schedule':
        return answers.schedulePattern || '0 9 * * *';
      case 'event':
        return answers.eventTriggers ? answers.eventTriggers.join(' OR ') : 'system.event';
      case 'webhook':
        return 'HTTP webhook received';
      case 'file':
        return 'File system change detected';
      case 'completion':
        return 'Previous workflow completed';
      default:
        return 'Trigger condition';
    }
  }

  /**
   * Confirm overwrite of existing file
   * @private
   */
  async confirmOverwrite(filePath) {
    const { default: inquirer } = await import('inquirer');
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `File ${path.basename(filePath)} already exists. Overwrite?`,
      default: false,
    }]);
    
    return overwrite;
  }

  /**
   * Create task files for agent commands
   * @private
   */
  async createAgentCommandTasks(variables, options) {
    if (!variables.COMMANDS || variables.COMMANDS.length === 0) {
      return;
    }
    
    const inquirer = require('inquirer');
    const tasksToCreate = [];
    const existingTasks = [];
    
    // Check which tasks need to be created
    for (const command of variables.COMMANDS) {
      const taskId = this.commandToTaskId(command.COMMAND_NAME);
      const taskPath = path.join(this.rootPath, 'aiox-core', 'tasks', `${taskId}.md`);
      
      if (await fs.pathExists(taskPath)) {
        existingTasks.push(taskId);
      } else {
        tasksToCreate.push({
          taskId,
          command: command.COMMAND_NAME,
          description: command.COMMAND_DESCRIPTION,
          agentName: variables.AGENT_NAME,
        });
      }
    }
    
    if (existingTasks.length > 0) {
      console.log(chalk.blue(`\n📋 Found existing tasks: ${existingTasks.join(', ')}`));
    }
    
    if (tasksToCreate.length === 0) {
      return;
    }
    
    // Prompt to create missing tasks
    console.log(chalk.yellow(`\n⚠️  ${tasksToCreate.length} command task(s) need to be created`));
    
    const { createTasks } = await inquirer.prompt([{
      type: 'confirm',
      name: 'createTasks',
      message: `Create ${tasksToCreate.length} missing task file(s)?`,
      default: true,
    }]);
    
    if (!createTasks) {
      return;
    }
    
    // Create each task
    console.log(chalk.blue('\n📝 Creating command tasks...'));
    
    for (const taskInfo of tasksToCreate) {
      try {
        // Mock elicitation session for task
        await this.elicitationEngine.mockSession({
          taskId: taskInfo.taskId,
          taskTitle: `${taskInfo.description} for ${variables.AGENT_TITLE}`,
          taskDescription: `Handles the ${taskInfo.command} command for the ${variables.AGENT_NAME} agent`,
          agentName: taskInfo.agentName,
          command: taskInfo.command,
          prerequisites: [],
          interactiveElicitation: false,
          contextRequired: ['Current project state', 'User request'],
          workflow: [
            'Parse command parameters',
            'Execute main logic',
            'Return results',
          ],
          validation: ['Input validation', 'Result verification'],
          errorHandling: ['Invalid parameters', 'Execution failures'],
          outputFormat: 'Formatted response',
        });
        
        // Generate task
        const result = await this.generateComponent('task', {
          ...options,
          skipPreview: true,
          skipManifest: true,
        });
        
        if (result.success) {
          console.log(chalk.green(`   ✓ Created task: ${taskInfo.taskId}`));
        } else {
          console.log(chalk.red(`   ✗ Failed to create task: ${taskInfo.taskId}`));
        }
      } catch (error) {
        console.log(chalk.red(`   ✗ Error creating task ${taskInfo.taskId}: ${error.message}`));
      }
    }
  }

  /**
   * Convert command name to task ID
   * @private
   */
  commandToTaskId(command) {
    // Remove asterisk if present
    const cleanCommand = command.replace(/^\*/, '');
    
    // Handle common patterns
    if (cleanCommand.startsWith('create-') || 
        cleanCommand.startsWith('update-') || 
        cleanCommand.startsWith('delete-') ||
        cleanCommand.startsWith('get-') ||
        cleanCommand.startsWith('list-')) {
      return cleanCommand;
    }
    
    // Convert camelCase to hyphenated
    return cleanCommand
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }
}

module.exports = ComponentGenerator;