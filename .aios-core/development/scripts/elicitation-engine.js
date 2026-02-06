/**
 * Interactive Elicitation Engine for AIOS-FULLSTACK
 * Handles progressive disclosure and contextual validation for component creation
 * @module elicitation-engine
 */

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const SecurityChecker = require('./security-checker');
const ElicitationSessionManager = require('./elicitation-session-manager');
const chalk = require('chalk');

class ElicitationEngine {
  constructor() {
    this.securityChecker = new SecurityChecker();
    this.sessionManager = new ElicitationSessionManager();
    this.sessionData = {};
    this.sessionFile = null;
  }

  /**
   * Start a new elicitation session
   * @param {string} componentType - Type of component being created
   * @param {Object} options - Session options
   */
  async startSession(componentType, options = {}) {
    this.sessionData = {
      componentType,
      startTime: new Date().toISOString(),
      answers: {},
      currentStep: 0,
      options
    };
    
    if (options.saveSession) {
      this.sessionFile = path.join(
        process.cwd(), 
        '.aios-sessions', 
        `${componentType}-${Date.now()}.json`
      );
      await fs.ensureDir(path.dirname(this.sessionFile));
    }
  }

  /**
   * Run progressive elicitation workflow
   * @param {Array} steps - Array of elicitation steps
   * @returns {Promise<Object>} Collected answers
   */
  async runProgressive(steps) {
    // If mocked, return mocked answers immediately
    if (this.isMocked) {
      this.isMocked = false;
      return this.mockedAnswers;
    }
    
    console.log(chalk.blue(`\n🚀 Starting ${this.sessionData.componentType} creation wizard...\n`));
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      this.sessionData.currentStep = i;
      
      // Show step header
      console.log(chalk.yellow(`\n📋 Step ${i + 1}/${steps.length}: ${step.title}`));
      if (step.description) {
        console.log(chalk.gray(step.description));
      }
      
      // Check if step should be shown based on previous answers
      if (step.condition && !this.evaluateCondition(step.condition)) {
        continue;
      }
      
      // Run step questions
      const stepAnswers = await this.runStep(step);
      Object.assign(this.sessionData.answers, stepAnswers);
      
      // Save session after each step
      if (this.sessionFile) {
        await this.saveSession();
      }
      
      // Allow early exit if requested
      if (stepAnswers._exit) {
        console.log(chalk.yellow('\n⚠️  Elicitation cancelled by user'));
        return null;
      }
    }
    
    return this.sessionData.answers;
  }

  /**
   * Run a single elicitation step
   * @private
   */
  async runStep(step) {
    const questions = step.questions.map(q => this.enhanceQuestion(q, step));
    
    // Add contextual help if available
    if (step.help) {
      questions.unshift({
        type: 'confirm',
        name: '_showHelp',
        message: 'Would you like to see help for this step?',
        default: false
      });
    }
    
    const answers = await inquirer.prompt(questions);
    
    // Show help if requested
    if (answers._showHelp && step.help) {
      console.log(chalk.cyan('\n💡 ' + step.help));
      delete answers._showHelp;
      return this.runStep(step); // Re-run the step
    }
    
    // Validate answers
    const validation = await this.validateStepAnswers(answers, step);
    if (!validation.valid) {
      console.log(chalk.red('\n❌ Validation errors:'));
      validation.errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
      return this.runStep(step); // Re-run the step
    }
    
    return answers;
  }

  /**
   * Enhance a question with smart defaults and validation
   * @private
   */
  enhanceQuestion(question, step) {
    const enhanced = { ...question };
    
    // Add smart defaults based on previous answers
    if (question.smartDefault) {
      enhanced.default = this.getSmartDefault(question.smartDefault);
    }
    
    // Add validation with security checks
    const originalValidate = enhanced.validate;
    enhanced.validate = async (input) => {
      // Type validation
      if (typeof input !== 'string' && question.type === 'input') {
        return 'Invalid input type';
      }
      
      // Security validation using the refactored SecurityChecker
      // Note: SecurityChecker.checkCode expects string input for validation
      const securityResult = this.securityChecker.checkCode(String(input));
      if (!securityResult.valid) {
        return `Security check failed: ${securityResult.errors[0]?.message || 'Invalid input'}`;
      }
      
      // Original validation
      if (originalValidate) {
        const result = await originalValidate(input);
        if (result !== true) return result;
      }
      
      // Step-specific validation
      if (step.validation && step.validation[question.name]) {
        const validator = step.validation[question.name];
        const result = await this.runValidator(validator, input);
        if (result !== true) return result;
      }
      
      return true;
    };
    
    // Add examples to message if available
    if (question.examples && question.examples.length > 0) {
      enhanced.message += chalk.gray(` (e.g., ${question.examples.join(', ')})`);
    }
    
    return enhanced;
  }

  /**
   * Get smart default value based on previous answers
   * @private
   */
  getSmartDefault(smartDefaultConfig) {
    const { type, source, transform } = smartDefaultConfig;
    
    switch (type) {
      case 'fromAnswer':
        const value = this.sessionData.answers[source];
        return transform ? transform(value) : value;
        
      case 'generated':
        return this.generateDefault(smartDefaultConfig);
        
      case 'conditional':
        const condition = this.evaluateCondition(smartDefaultConfig.condition);
        return condition ? smartDefaultConfig.ifTrue : smartDefaultConfig.ifFalse;
        
      default:
        return undefined;
    }
  }

  /**
   * Generate a default value
   * @private
   */
  generateDefault(config) {
    switch (config.generator) {
      case 'kebabCase':
        const source = this.sessionData.answers[config.source] || '';
        return source.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
      case 'timestamp':
        return new Date().toISOString();
        
      case 'version':
        return '1.0.0';
        
      default:
        return '';
    }
  }

  /**
   * Evaluate a condition based on answers
   * @private
   */
  evaluateCondition(condition) {
    const { field, operator, value } = condition;
    const fieldValue = this.sessionData.answers[field];
    
    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'includes':
        return Array.isArray(fieldValue) && fieldValue.includes(value);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return true;
    }
  }

  /**
   * Validate step answers
   * @private
   */
  async validateStepAnswers(answers, step) {
    const errors = [];
    
    // Check required fields
    if (step.required) {
      for (const field of step.required) {
        if (!answers[field]) {
          errors.push(`${field} is required`);
        }
      }
    }
    
    // Run custom validators
    if (step.validators) {
      for (const validator of step.validators) {
        const result = await this.runValidator(validator, answers);
        if (result !== true) {
          errors.push(result);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Run a validator function
   * @private
   */
  async runValidator(validator, value) {
    if (typeof validator === 'function') {
      return validator(value);
    }
    
    if (typeof validator === 'object') {
      switch (validator.type) {
        case 'regex':
          const regex = new RegExp(validator.pattern);
          return regex.test(value) || validator.message;
          
        case 'length':
          if (validator.min && value.length < validator.min) {
            return `Must be at least ${validator.min} characters`;
          }
          if (validator.max && value.length > validator.max) {
            return `Must be at most ${validator.max} characters`;
          }
          return true;
          
        case 'unique':
          const exists = await this.checkExists(validator.path, value);
          return !exists || `${value} already exists`;
          
        default:
          return true;
      }
    }
    
    return true;
  }

  /**
   * Check if a component already exists
   * @private
   */
  async checkExists(pathTemplate, name) {
    const filePath = pathTemplate.replace('{name}', name);
    return fs.pathExists(filePath);
  }

  /**
   * Save current session to file
   * @private
   */
  async saveSession() {
    if (this.sessionFile) {
      await fs.writeJson(this.sessionFile, this.sessionData, { spaces: 2 });
    }
  }

  /**
   * Load a saved session
   * @param {string} sessionPath - Path to session file
   */
  async loadSession(sessionPath) {
    this.sessionData = await fs.readJson(sessionPath);
    this.sessionFile = sessionPath;
    return this.sessionData;
  }

  /**
   * Get session summary
   * @returns {Object} Summary of current session
   */
  getSessionSummary() {
    return {
      componentType: this.sessionData.componentType,
      completedSteps: this.sessionData.currentStep + 1,
      answers: Object.keys(this.sessionData.answers).length,
      duration: this.sessionData.startTime ? 
        Date.now() - new Date(this.sessionData.startTime).getTime() : 0
    };
  }

  /**
   * Mock a session with predefined answers for batch creation
   * @param {Object} answers - Predefined answers
   */
  async mockSession(answers) {
    this.mockedAnswers = answers;
    this.isMocked = true;
  }

  /**
   * Complete elicitation session
   * @param {string} status - Completion status
   */
  async completeSession(status) {
    if (this.currentSession) {
      this.currentSession.status = status;
      this.currentSession.completedAt = new Date().toISOString();
      
      if (this.currentSession.saveSession) {
        await this.sessionManager.saveSession(this.currentSession);
      }
    }
  }
}

module.exports = ElicitationEngine;