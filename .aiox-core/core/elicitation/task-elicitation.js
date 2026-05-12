/**
 * Task Creation Elicitation Workflow
 * Progressive disclosure for creating new tasks
 */

const taskElicitationSteps = [
  {
    title: 'Basic Task Information',
    description: 'Define the fundamental details of your task',
    help: 'A task is a reusable workflow that an agent can execute. It should have a clear purpose and outcome.',
    questions: [
      {
        type: 'input',
        name: 'taskId',
        message: 'What is the task ID?',
        examples: ['analyze-data', 'generate-report', 'validate-code'],
        validate: (input) => {
          if (!input) return 'Task ID is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'ID must be lowercase with hyphens only';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'taskTitle',
        message: 'What is the task title?',
        examples: ['Analyze Data Set', 'Generate Status Report', 'Validate Code Quality'],
        smartDefault: {
          type: 'fromAnswer',
          source: 'taskId',
          transform: (id) => id.split('-').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1),
          ).join(' '),
        },
      },
      {
        type: 'input',
        name: 'agentName',
        message: 'Which agent will own this task?',
        examples: ['data-analyst', 'report-generator', 'code-reviewer'],
      },
      {
        type: 'input',
        name: 'taskDescription',
        message: 'Describe the task purpose (2-3 sentences):',
        validate: (input) => input.length > 10 || 'Please provide a meaningful description',
      },
    ],
    required: ['taskId', 'taskTitle', 'agentName', 'taskDescription'],
  },

  {
    title: 'Task Context & Prerequisites',
    description: 'Define what\'s needed before the task can run',
    questions: [
      {
        type: 'confirm',
        name: 'requiresContext',
        message: 'Does this task require specific context or input?',
        default: true,
      },
      {
        type: 'input',
        name: 'contextDescription',
        message: 'What context/input is required?',
        when: (answers) => answers.requiresContext,
        examples: ['Data file path and format', 'Project configuration', 'User preferences'],
      },
      {
        type: 'checkbox',
        name: 'prerequisites',
        message: 'Select prerequisites for this task:',
        choices: [
          'Valid file path provided',
          'Required permissions granted',
          'Dependencies installed',
          'Configuration loaded',
          'Previous task completed',
          'User authentication',
          'Network connectivity',
        ],
      },
      {
        type: 'input',
        name: 'customPrerequisites',
        message: 'Any additional prerequisites? (comma-separated):',
        filter: (input) => input ? input.split(',').map(p => p.trim()) : [],
      },
    ],
  },

  {
    title: 'Task Workflow',
    description: 'Define how the task should be executed',
    questions: [
      {
        type: 'confirm',
        name: 'isInteractive',
        message: 'Is this an interactive task (requires user input)?',
        default: false,
      },
      {
        type: 'list',
        name: 'workflowType',
        message: 'What type of workflow is this?',
        choices: [
          { name: 'Sequential - Steps run in order', value: 'sequential' },
          { name: 'Conditional - Steps depend on conditions', value: 'conditional' },
          { name: 'Iterative - Steps may repeat', value: 'iterative' },
          { name: 'Parallel - Some steps run simultaneously', value: 'parallel' },
        ],
        default: 'sequential',
      },
      {
        type: 'input',
        name: 'stepCount',
        message: 'How many main steps does this task have?',
        default: '3',
        validate: (input) => {
          const num = parseInt(input);
          return (num > 0 && num <= 10) || 'Please enter a number between 1 and 10';
        },
        filter: (input) => parseInt(input),
      },
    ],
  },

  {
    title: 'Define Task Steps',
    description: 'Specify each step in the workflow',
    questions: [
      {
        type: 'input',
        name: 'steps',
        message: 'This will be handled dynamically based on stepCount',
        // Note: In implementation, this would generate dynamic questions
        // based on the stepCount from previous step
      },
    ],
    validators: [
      {
        type: 'custom',
        validate: (_answers) => {
          // This would be implemented to collect step details
          return true;
        },
      },
    ],
  },

  {
    title: 'Output & Success Criteria',
    description: 'Define what the task produces and how to measure success',
    questions: [
      {
        type: 'input',
        name: 'outputDescription',
        message: 'What does this task output/produce?',
        examples: ['Analysis report in markdown', 'Validated data file', 'Test results summary'],
      },
      {
        type: 'list',
        name: 'outputFormat',
        message: 'What format is the output?',
        choices: [
          'Text/Markdown',
          'JSON',
          'YAML',
          'CSV',
          'HTML',
          'File(s)',
          'Console output',
          'Other',
        ],
      },
      {
        type: 'input',
        name: 'outputFormatCustom',
        message: 'Specify the output format:',
        when: (answers) => answers.outputFormat === 'Other',
      },
      {
        type: 'checkbox',
        name: 'successCriteria',
        message: 'Select success criteria:',
        choices: [
          'All steps completed without errors',
          'Output file(s) created successfully',
          'Validation checks passed',
          'Performance within limits',
          'User confirmation received',
          'Tests passed',
        ],
      },
    ],
    required: ['outputDescription'],
  },

  {
    title: 'Error Handling',
    description: 'Configure how the task handles errors',
    questions: [
      {
        type: 'list',
        name: 'errorStrategy',
        message: 'How should the task handle errors?',
        choices: [
          { name: 'Fail fast - Stop on first error', value: 'fail-fast' },
          { name: 'Collect errors - Continue and report all', value: 'collect' },
          { name: 'Retry - Attempt recovery', value: 'retry' },
          { name: 'Fallback - Use alternative approach', value: 'fallback' },
        ],
        default: 'fail-fast',
      },
      {
        type: 'input',
        name: 'retryCount',
        message: 'How many retry attempts?',
        when: (answers) => answers.errorStrategy === 'retry',
        default: '3',
        validate: (input) => {
          const num = parseInt(input);
          return (num > 0 && num <= 5) || 'Please enter 1-5';
        },
      },
      {
        type: 'checkbox',
        name: 'commonErrors',
        message: 'Select common errors to handle:',
        choices: [
          'File not found',
          'Permission denied',
          'Invalid format',
          'Network timeout',
          'Resource busy',
          'Validation failed',
          'Dependency missing',
        ],
      },
    ],
  },

  {
    title: 'Security & Validation',
    description: 'Configure security checks and validation',
    condition: { field: 'taskId', operator: 'exists' },
    questions: [
      {
        type: 'confirm',
        name: 'enableSecurityChecks',
        message: 'Enable security validation for inputs?',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'securityChecks',
        message: 'Select security checks to apply:',
        when: (answers) => answers.enableSecurityChecks,
        choices: [
          'Input sanitization',
          'Path traversal prevention',
          'Command injection prevention',
          'File type validation',
          'Size limits',
          'Rate limiting',
        ],
        default: ['Input sanitization', 'Path traversal prevention'],
      },
      {
        type: 'confirm',
        name: 'enableExamples',
        message: 'Would you like to add usage examples?',
        default: false,
      },
    ],
  },
];

module.exports = taskElicitationSteps;