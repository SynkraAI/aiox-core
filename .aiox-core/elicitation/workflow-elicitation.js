/**
 * Workflow Creation Elicitation Workflow
 * Progressive disclosure for creating new workflows
 */

const workflowElicitationSteps = [
  {
    title: 'Basic Workflow Information',
    description: 'Define the core details of your workflow',
    help: 'A workflow orchestrates multiple tasks and agents to achieve a complex goal.',
    questions: [
      {
        type: 'input',
        name: 'workflowId',
        message: 'What is the workflow ID?',
        examples: ['data-pipeline', 'release-process', 'quality-check'],
        validate: (input) => {
          if (!input) return 'Workflow ID is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'ID must be lowercase with hyphens only';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'workflowName',
        message: 'What is the workflow name?',
        examples: ['Data Processing Pipeline', 'Software Release Process', 'Quality Assurance Workflow'],
        smartDefault: {
          type: 'fromAnswer',
          source: 'workflowId',
          transform: (id) => id.split('-').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1),
          ).join(' '),
        },
      },
      {
        type: 'input',
        name: 'workflowDescription',
        message: 'Describe the workflow purpose:',
        validate: (input) => input.length > 20 || 'Please provide a detailed description',
      },
      {
        type: 'list',
        name: 'workflowType',
        message: 'What type of workflow is this?',
        choices: [
          { name: 'Sequential - Steps run one after another', value: 'sequential' },
          { name: 'Parallel - Multiple steps can run simultaneously', value: 'parallel' },
          { name: 'Conditional - Steps depend on conditions', value: 'conditional' },
          { name: 'Hybrid - Mix of sequential and parallel', value: 'hybrid' },
        ],
        default: 'sequential',
      },
    ],
    required: ['workflowId', 'workflowName', 'workflowDescription', 'workflowType'],
  },

  {
    title: 'Workflow Triggers',
    description: 'Define what starts this workflow',
    questions: [
      {
        type: 'checkbox',
        name: 'triggerTypes',
        message: 'How can this workflow be triggered?',
        choices: [
          { name: 'Manual - User command', value: 'manual' },
          { name: 'Schedule - Time-based', value: 'schedule' },
          { name: 'Event - System event', value: 'event' },
          { name: 'Webhook - External trigger', value: 'webhook' },
          { name: 'File - File system change', value: 'file' },
          { name: 'Completion - After another workflow', value: 'completion' },
        ],
        default: ['manual'],
      },
      {
        type: 'input',
        name: 'schedulePattern',
        message: 'Enter schedule pattern (cron format):',
        when: (answers) => answers.triggerTypes.includes('schedule'),
        examples: ['0 9 * * *', '*/30 * * * *', '0 0 * * SUN'],
        default: '0 9 * * *',
      },
      {
        type: 'input',
        name: 'eventTriggers',
        message: 'Which events trigger this workflow? (comma-separated):',
        when: (answers) => answers.triggerTypes.includes('event'),
        examples: ['file.created', 'task.completed', 'error.detected'],
        filter: (input) => input ? input.split(',').map(e => e.trim()) : [],
      },
    ],
  },

  {
    title: 'Workflow Inputs',
    description: 'Define input parameters for the workflow',
    questions: [
      {
        type: 'confirm',
        name: 'hasInputs',
        message: 'Does this workflow require input parameters?',
        default: true,
      },
      {
        type: 'input',
        name: 'inputCount',
        message: 'How many input parameters?',
        when: (answers) => answers.hasInputs,
        default: '2',
        validate: (input) => {
          const num = parseInt(input);
          return (num > 0 && num <= 10) || 'Please enter 1-10';
        },
        filter: (input) => parseInt(input),
      },
      // Note: Dynamic input collection would be implemented here
      {
        type: 'confirm',
        name: 'validateInputs',
        message: 'Add input validation rules?',
        when: (answers) => answers.hasInputs,
        default: true,
      },
    ],
  },

  {
    title: 'Workflow Steps',
    description: 'Define the steps in your workflow',
    questions: [
      {
        type: 'input',
        name: 'stepCount',
        message: 'How many steps in this workflow?',
        default: '3',
        validate: (input) => {
          const num = parseInt(input);
          return (num > 0 && num <= 20) || 'Please enter 1-20';
        },
        filter: (input) => parseInt(input),
      },
      {
        type: 'list',
        name: 'stepDefinitionMethod',
        message: 'How would you like to define steps?',
        choices: [
          { name: 'Quick mode - Basic step info only', value: 'quick' },
          { name: 'Detailed mode - Full step configuration', value: 'detailed' },
          { name: 'Import - Use existing task definitions', value: 'import' },
        ],
        default: 'quick',
      },
      // Note: Dynamic step collection would be implemented here
    ],
  },

  {
    title: 'Step Dependencies & Flow',
    description: 'Configure how steps relate to each other',
    condition: { field: 'workflowType', operator: 'notEquals', value: 'sequential' },
    questions: [
      {
        type: 'confirm',
        name: 'hasStepDependencies',
        message: 'Do steps have dependencies on other steps?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'allowParallel',
        message: 'Can some steps run in parallel?',
        when: (answers) => answers.workflowType !== 'sequential',
        default: true,
      },
      {
        type: 'input',
        name: 'maxParallel',
        message: 'Maximum parallel executions:',
        when: (answers) => answers.allowParallel,
        default: '3',
        validate: (input) => {
          const num = parseInt(input);
          return (num > 0 && num <= 10) || 'Please enter 1-10';
        },
      },
    ],
  },

  {
    title: 'Error Handling & Recovery',
    description: 'Configure workflow error behavior',
    questions: [
      {
        type: 'list',
        name: 'globalErrorStrategy',
        message: 'How should the workflow handle errors?',
        choices: [
          { name: 'Abort - Stop entire workflow on error', value: 'abort' },
          { name: 'Continue - Log error and continue', value: 'continue' },
          { name: 'Rollback - Undo completed steps', value: 'rollback' },
          { name: 'Compensate - Run compensation steps', value: 'compensate' },
        ],
        default: 'abort',
      },
      {
        type: 'confirm',
        name: 'enableNotifications',
        message: 'Send notifications on workflow events?',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'notificationEvents',
        message: 'Which events should trigger notifications?',
        when: (answers) => answers.enableNotifications,
        choices: [
          'Workflow started',
          'Workflow completed',
          'Workflow failed',
          'Step failed',
          'Waiting for input',
          'Performance threshold exceeded',
        ],
        default: ['Workflow failed', 'Workflow completed'],
      },
    ],
  },

  {
    title: 'Outputs & Results',
    description: 'Define what the workflow produces',
    questions: [
      {
        type: 'input',
        name: 'outputDescription',
        message: 'What does this workflow produce?',
        examples: ['Processed data files', 'Deployment status report', 'Quality metrics'],
        validate: (input) => input.length > 10 || 'Please describe the output',
      },
      {
        type: 'checkbox',
        name: 'outputTypes',
        message: 'What types of output does it generate?',
        choices: [
          'Status report',
          'Data files',
          'Metrics/statistics',
          'Logs',
          'Notifications',
          'Database updates',
          'API responses',
        ],
      },
      {
        type: 'confirm',
        name: 'saveOutputs',
        message: 'Should outputs be saved for later reference?',
        default: true,
      },
    ],
    required: ['outputDescription'],
  },

  {
    title: 'Security & Permissions',
    description: 'Configure workflow security settings',
    questions: [
      {
        type: 'confirm',
        name: 'requireAuth',
        message: 'Require authorization to run this workflow?',
        default: false,
      },
      {
        type: 'checkbox',
        name: 'allowedRoles',
        message: 'Which roles can execute this workflow?',
        when: (answers) => answers.requireAuth,
        choices: [
          'admin',
          'developer',
          'analyst',
          'reviewer',
          'operator',
          'viewer',
        ],
        default: ['admin', 'developer'],
      },
      {
        type: 'confirm',
        name: 'enableAuditLog',
        message: 'Enable audit logging for this workflow?',
        default: true,
      },
      {
        type: 'checkbox',
        name: 'securityFeatures',
        message: 'Additional security features:',
        choices: [
          'Encrypt sensitive data',
          'Mask credentials in logs',
          'Validate all inputs',
          'Sandbox execution',
          'Rate limiting',
        ],
        when: (answers) => answers.requireAuth,
      },
    ],
  },
];

module.exports = workflowElicitationSteps;