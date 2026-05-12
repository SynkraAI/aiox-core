/**
 * Batch Component Creator for Synkra AIOX
 * Creates multiple related components in a single operation
 * @module batch-creator
 */

const fs = require('fs-extra');
const path = require('path');
const ComponentGenerator = require('./component-generator');
const ElicitationEngine = require('../../core/elicitation/elicitation-engine');
const DependencyAnalyzer = require('./dependency-analyzer');
const TransactionManager = require('./transaction-manager');
const chalk = require('chalk');
const inquirer = require('inquirer');

class BatchCreator {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.componentGenerator = new ComponentGenerator({ rootPath: this.rootPath });
    this.elicitationEngine = new ElicitationEngine();
    this.dependencyAnalyzer = new DependencyAnalyzer({ rootPath: this.rootPath });
    this.transactionManager = new TransactionManager({ rootPath: this.rootPath });
    
    // Transaction tracking
    this.transaction = {
      id: null,
      components: [],
      files: [],
      manifests: [],
    };
  }

  /**
   * Create a suite of related components
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Batch creation result
   */
  async createSuite(options = {}) {
    let transactionId = null;
    
    try {
      console.log(chalk.blue('\n🚀 Starting batch component creation...\n'));
      
      // Start transaction with TransactionManager
      transactionId = await this.transactionManager.beginTransaction({
        type: 'batch_component_creation',
        description: 'Create multiple related components',
        user: process.env.USER || 'system',
        metadata: {
          batchType: options.type || 'custom',
          componentCount: options.componentCount || 'unknown',
        },
        rollbackOnError: true,
      });
      
      this.transaction.id = transactionId;
      this.transaction.startTime = new Date().toISOString();
      
      // Run suite elicitation
      const suiteConfig = await this.runSuiteElicitation();
      if (!suiteConfig) {
        // Rollback empty transaction
        await this.transactionManager.rollbackTransaction(transactionId);
        return { success: false, error: 'Suite creation cancelled' };
      }
      
      // Validate dependencies
      const validation = await this.dependencyAnalyzer.validateDependencies(suiteConfig.components);
      if (!validation.valid) {
        console.log(chalk.yellow('\n⚠️  Dependency issues detected'));
        
        // Prompt for missing dependencies
        if (validation.resolutions.length > 0) {
          const missingDeps = validation.issues.flatMap(issue => issue.missing || []);
          const additionalComponents = await this.dependencyAnalyzer.promptForMissingDependencies(missingDeps);
          
          // Add missing dependencies to suite config
          if (additionalComponents.length > 0) {
            suiteConfig.components.unshift(...additionalComponents);
            console.log(chalk.blue(`\n📦 Added ${additionalComponents.length} dependencies to creation queue`));
          }
        }
      }
      
      // Get creation order based on dependencies
      let orderedComponents;
      try {
        orderedComponents = await this.dependencyAnalyzer.getCreationOrder(suiteConfig.components);
      } catch (error) {
        console.log(chalk.red(`\n❌ ${error.message}`));
        return { success: false, error: error.message };
      }
      
      // Create components in dependency order
      const results = await this.createComponentsInOrder(
        { ...suiteConfig, components: orderedComponents },
        options,
      );
      
      // Verify all succeeded
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.log(chalk.red('\n❌ Some components failed to create'));
        
        // Offer rollback
        const { rollback } = await inquirer.prompt([{
          type: 'confirm',
          name: 'rollback',
          message: 'Do you want to rollback all changes?',
          default: true,
        }]);
        
        if (rollback) {
          await this.rollbackTransaction();
          return {
            success: false,
            error: 'Batch creation failed and rolled back',
            details: failed,
          };
        }
      }
      
      console.log(chalk.green('\n✅ Suite created successfully!'));
      console.log(chalk.gray(`📦 Components: ${results.length}`));
      
      // Commit transaction
      await this.transactionManager.commitTransaction(transactionId);
      
      // Complete transaction log (legacy support)
      this.transaction.endTime = new Date().toISOString();
      this.transaction.status = 'completed';
      await this.saveTransactionLog();
      
      return {
        success: true,
        transaction: transactionId,
        components: results,
      };
      
    } catch (error) {
      console.error(chalk.red(`\n❌ Batch creation failed: ${error.message}`));
      
      // Rollback transaction if we started one
      if (transactionId) {
        try {
          await this.transactionManager.rollbackTransaction(transactionId);
        } catch (rollbackError) {
          console.error(chalk.red(`❌ Rollback failed: ${rollbackError.message}`));
        }
      }
      
      // Legacy transaction log
      this.transaction.endTime = new Date().toISOString();
      this.transaction.status = 'failed';
      this.transaction.error = error.message;
      await this.saveTransactionLog();
      
      return {
        success: false,
        error: error.message,
        transactionId,
      };
    }
  }

  /**
   * Run suite elicitation workflow
   * @private
   */
  async runSuiteElicitation() {
    const { suiteType } = await inquirer.prompt([{
      type: 'list',
      name: 'suiteType',
      message: 'What type of suite do you want to create?',
      choices: [
        { name: 'Complete Agent Package (agent + tasks + workflow)', value: 'agent-package' },
        { name: 'Workflow Suite (workflow + required tasks)', value: 'workflow-suite' },
        { name: 'Task Collection (multiple related tasks)', value: 'task-collection' },
        { name: 'Custom Suite (define your own)', value: 'custom' },
      ],
    }]);
    
    switch (suiteType) {
      case 'agent-package':
        return await this.elicitAgentPackage();
      case 'workflow-suite':
        return await this.elicitWorkflowSuite();
      case 'task-collection':
        return await this.elicitTaskCollection();
      case 'custom':
        return await this.elicitCustomSuite();
      default:
        return null;
    }
  }

  /**
   * Elicit agent package configuration
   * @private
   */
  async elicitAgentPackage() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'agentName',
        message: 'Agent name (lowercase-hyphenated):',
        validate: name => /^[a-z][a-z0-9-]*$/.test(name) || 'Invalid name format',
      },
      {
        type: 'input',
        name: 'agentTitle',
        message: 'Agent title:',
      },
      {
        type: 'input',
        name: 'agentDescription',
        message: 'Agent description:',
      },
      {
        type: 'checkbox',
        name: 'includeCommands',
        message: 'Which standard commands to include?',
        choices: ['analyze', 'create', 'review', 'suggest', 'report'],
      },
      {
        type: 'confirm',
        name: 'includeWorkflow',
        message: 'Include a workflow for this agent?',
        default: true,
      },
    ]);
    
    const components = [{
      type: 'agent',
      config: {
        agentName: answers.agentName,
        agentTitle: answers.agentTitle,
        whenToUse: answers.agentDescription,
        // ... other agent config
      },
    }];
    
    // Add tasks for each command
    answers.includeCommands.forEach(command => {
      components.push({
        type: 'task',
        config: {
          taskId: `${command}-${answers.agentName}`,
          taskTitle: `${command} for ${answers.agentTitle}`,
          agentName: answers.agentName,
          // ... other task config
        },
      });
    });
    
    // Add workflow if requested
    if (answers.includeWorkflow) {
      components.push({
        type: 'workflow',
        config: {
          workflowId: `${answers.agentName}-workflow`,
          workflowName: `${answers.agentTitle} Workflow`,
          workflowType: 'standard',
          // ... other workflow config
        },
      });
    }
    
    return { components };
  }


  /**
   * Create components in dependency order
   * @private
   */
  async createComponentsInOrder(suiteConfig, options) {
    const created = new Set();
    const results = [];
    const totalComponents = suiteConfig.components.length;
    const createdCount = 0;
    
    // Progress bar setup
    const ProgressBar = require('progress');
    const progressBar = new ProgressBar('Creating components [:bar] :percent :current/:total', {
      complete: '█',
      incomplete: '░',
      width: 30,
      total: totalComponents,
    });
    
    // Create all components in order (already sorted by dependency analyzer)
    for (const component of suiteConfig.components) {
      const componentName = component.config.agentName || component.config.taskId || component.config.workflowId;
      console.log(chalk.cyan(`\n📦 Creating ${component.type}: ${componentName}`));
      
      const result = await this.createSingleComponent(component, options);
      results.push(result);
      
      if (result.success) {
        this.transaction.components.push(result);
        this.transaction.files.push(result.path);
        console.log(chalk.green('   ✓ Created successfully'));
      } else {
        console.log(chalk.red(`   ✗ Failed: ${result.error}`));
      }
      
      // Update progress
      progressBar.tick();
    }
    
    // Complete progress bar
    progressBar.terminate();
    
    return results;
  }

  /**
   * Create a single component
   * @private
   */
  async createSingleComponent(component, options) {
    try {
      // Mock the elicitation answers
      await this.elicitationEngine.mockSession(component.config);
      
      // Use component generator with transaction
      const result = await this.componentGenerator.generateComponent(
        component.type,
        {
          ...options,
          skipPreview: true, // Skip individual previews in batch mode
          skipManifest: true, // Handle manifest updates at the end
          transactionId: this.transaction.id, // Pass transaction ID
        },
      );
      
      // Record component creation in transaction
      if (result.success) {
        await this.transactionManager.recordOperation(this.transaction.id, {
          type: 'component_created',
          target: 'component',
          path: result.path,
          metadata: {
            componentType: component.type,
            componentId: result.name,
            variables: result.variables,
          },
        });
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        type: component.type,
        error: error.message,
      };
    }
  }

  /**
   * Rollback all changes in transaction
   * @private
   */
  async rollbackTransaction() {
    console.log(chalk.yellow('\n⚙️  Rolling back changes...'));
    
    try {
      // Use TransactionManager for rollback
      const rollbackResult = await this.transactionManager.rollbackTransaction(
        this.transaction.id,
        { continueOnError: true },
      );
      
      if (rollbackResult) {
        console.log(chalk.green('✅ Rollback completed'));
        console.log(chalk.gray(`   Successful: ${rollbackResult.successful.length}`));
        console.log(chalk.gray(`   Failed: ${rollbackResult.failed.length}`));
        console.log(chalk.gray(`   Warnings: ${rollbackResult.warnings.length}`));
        
        if (rollbackResult.failed.length > 0) {
          console.log(chalk.red('\n❌ Some rollback operations failed:'));
          rollbackResult.failed.forEach(failure => {
            console.log(chalk.red(`   - ${failure.operation}: ${failure.error}`));
          });
        }
      }
    } catch (error) {
      console.error(chalk.red(`❌ Rollback error: ${error.message}`));
    }
  }

  /**
   * Elicit workflow suite configuration
   * @private
   */
  async elicitWorkflowSuite() {
    // Implementation for workflow suite elicitation
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'workflowId',
        message: 'Workflow ID (lowercase-hyphenated):',
        validate: id => /^[a-z][a-z0-9-]*$/.test(id) || 'Invalid ID format',
      },
      {
        type: 'input',
        name: 'workflowName',
        message: 'Workflow name:',
      },
      {
        type: 'number',
        name: 'stepCount',
        message: 'How many steps in the workflow?',
        default: 3,
      },
    ]);
    
    const components = [{
      type: 'workflow',
      config: {
        workflowId: answers.workflowId,
        workflowName: answers.workflowName,
        workflowType: 'standard',
        stepCount: answers.stepCount,
      },
    }];
    
    // Add tasks for each step
    for (let i = 1; i <= answers.stepCount; i++) {
      const { taskName } = await inquirer.prompt([{
        type: 'input',
        name: 'taskName',
        message: `Task name for step ${i}:`,
        default: `${answers.workflowId}-step-${i}`,
      }]);
      
      components.push({
        type: 'task',
        config: {
          taskId: taskName,
          taskTitle: `Step ${i} of ${answers.workflowName}`,
          agentName: 'aiox-developer', // Default to meta-agent
        },
      });
    }
    
    return { components };
  }

  /**
   * Elicit task collection configuration
   * @private
   */
  async elicitTaskCollection() {
    const { taskCount } = await inquirer.prompt([{
      type: 'number',
      name: 'taskCount',
      message: 'How many tasks to create?',
      default: 3,
    }]);
    
    const components = [];
    
    for (let i = 1; i <= taskCount; i++) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'taskId',
          message: `Task ${i} ID:`,
          validate: id => /^[a-z][a-z0-9-]*$/.test(id) || 'Invalid ID format',
        },
        {
          type: 'input',
          name: 'taskTitle',
          message: `Task ${i} title:`,
        },
        {
          type: 'input',
          name: 'agentName',
          message: `Task ${i} agent:`,
          default: 'aiox-developer',
        },
      ]);
      
      components.push({
        type: 'task',
        config: answers,
      });
    }
    
    return { components };
  }

  /**
   * Elicit custom suite configuration
   * @private
   */
  async elicitCustomSuite() {
    const components = [];
    let addMore = true;
    
    while (addMore) {
      const { componentType } = await inquirer.prompt([{
        type: 'list',
        name: 'componentType',
        message: 'Add component type:',
        choices: ['agent', 'task', 'workflow', '(done)'],
      }]);
      
      if (componentType === '(done)') {
        addMore = false;
        continue;
      }
      
      // Get minimal config for each type
      const config = await this.getMinimalConfig(componentType);
      components.push({ type: componentType, config });
    }
    
    return { components };
  }

  /**
   * Initialize transaction log
   * @private
   */
  async initTransactionLog() {
    const logDir = path.join(this.rootPath, 'aiox-core', 'logs', 'transactions');
    await fs.ensureDir(logDir);
    
    this.transactionLogPath = path.join(logDir, `${this.transaction.id}.json`);
    await this.saveTransactionLog();
  }

  /**
   * Save transaction log
   * @private
   */
  async saveTransactionLog() {
    await fs.writeJson(this.transactionLogPath, this.transaction, { spaces: 2 });
  }

  /**
   * Get minimal configuration for component type
   * @private
   */
  async getMinimalConfig(componentType) {
    switch (componentType) {
      case 'agent':
        const agentAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'agentName',
            message: 'Agent name:',
            validate: name => /^[a-z][a-z0-9-]*$/.test(name) || 'Invalid format',
          },
          {
            type: 'input',
            name: 'agentTitle',
            message: 'Agent title:',
          },
        ]);
        return agentAnswers;
        
      case 'task':
        const taskAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'taskId',
            message: 'Task ID:',
            validate: id => /^[a-z][a-z0-9-]*$/.test(id) || 'Invalid format',
          },
          {
            type: 'input',
            name: 'taskTitle',
            message: 'Task title:',
          },
          {
            type: 'input',
            name: 'agentName',
            message: 'Agent name:',
            default: 'aiox-developer',
          },
        ]);
        return taskAnswers;
        
      case 'workflow':
        const workflowAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'workflowId',
            message: 'Workflow ID:',
            validate: id => /^[a-z][a-z0-9-]*$/.test(id) || 'Invalid format',
          },
          {
            type: 'input',
            name: 'workflowName',
            message: 'Workflow name:',
          },
        ]);
        return workflowAnswers;
    }
  }
}

module.exports = BatchCreator;