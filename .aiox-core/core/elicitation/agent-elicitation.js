/**
 * Agent Creation Elicitation Workflow
 * Progressive disclosure for creating new agents
 */

const agentElicitationSteps = [
  {
    title: 'Basic Agent Information',
    description: 'Let\'s start with the fundamental details about your agent',
    help: 'An agent is a specialized AI assistant with a specific role and set of capabilities. Think of it as a team member with expertise in a particular area.',
    questions: [
      {
        type: 'input',
        name: 'agentName',
        message: 'What is the agent\'s name?',
        examples: ['data-analyst', 'code-reviewer', 'project-manager'],
        validate: (input) => {
          if (!input) return 'Agent name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Name must be lowercase with hyphens only (e.g., data-analyst)';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'agentTitle',
        message: 'What is the agent\'s professional title?',
        examples: ['Senior Data Analyst', 'Code Review Specialist', 'Project Manager'],
        smartDefault: {
          type: 'fromAnswer',
          source: 'agentName',
          transform: (name) => name.split('-').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1),
          ).join(' '),
        },
      },
      {
        type: 'input',
        name: 'agentIcon',
        message: 'Choose an emoji icon for this agent',
        examples: ['📊', '🔍', '📋', '🚀', '🛡️'],
        default: '🤖',
      },
      {
        type: 'input',
        name: 'whenToUse',
        message: 'When should users activate this agent? (one line)',
        examples: [
          'Use for data analysis and visualization tasks',
          'Use for code review and quality assurance',
          'Use for project planning and tracking',
        ],
      },
    ],
    required: ['agentName', 'agentTitle', 'whenToUse'],
  },
  
  {
    title: 'Agent Persona & Style',
    description: 'Define how your agent communicates and behaves',
    help: 'The persona defines the agent\'s personality, communication style, and approach to tasks.',
    questions: [
      {
        type: 'input',
        name: 'personaRole',
        message: 'What is the agent\'s professional role?',
        examples: [
          'Expert Data Scientist & Analytics Specialist',
          'Senior Software Engineer & Code Quality Expert',
          'Agile Project Manager & Scrum Master',
        ],
      },
      {
        type: 'input',
        name: 'personaStyle',
        message: 'Describe their communication style',
        examples: [
          'analytical, precise, data-driven',
          'thorough, constructive, detail-oriented',
          'organized, proactive, collaborative',
        ],
        default: 'professional, helpful, focused',
      },
      {
        type: 'input',
        name: 'personaIdentity',
        message: 'What is their core identity? (one sentence)',
        examples: [
          'A data expert who transforms raw data into actionable insights',
          'A code quality guardian who ensures best practices',
          'A project orchestrator who keeps teams aligned and productive',
        ],
      },
      {
        type: 'list',
        name: 'personaFocus',
        message: 'What is their primary focus area?',
        choices: [
          'Technical implementation',
          'Analysis and insights',
          'Process and workflow',
          'Quality and standards',
          'Communication and documentation',
          'Other (specify)',
        ],
      },
      {
        type: 'input',
        name: 'personaFocusCustom',
        message: 'Specify the focus area:',
        when: (answers) => answers.personaFocus === 'Other (specify)',
      },
    ],
    required: ['personaRole', 'personaStyle', 'personaIdentity'],
  },
  
  {
    title: 'Agent Commands',
    description: 'Define what commands this agent will respond to',
    help: 'Commands are actions users can request from the agent. Each command should have a clear purpose.',
    questions: [
      {
        type: 'checkbox',
        name: 'standardCommands',
        message: 'Select standard commands to include:',
        choices: [
          { name: 'analyze - Perform analysis on data/code', value: 'analyze' },
          { name: 'create - Generate new content/files', value: 'create' },
          { name: 'review - Review existing work', value: 'review' },
          { name: 'suggest - Provide recommendations', value: 'suggest' },
          { name: 'explain - Explain concepts or code', value: 'explain' },
          { name: 'validate - Check for errors/issues', value: 'validate' },
          { name: 'report - Generate reports', value: 'report' },
        ],
        default: ['analyze', 'create', 'suggest'],
      },
      {
        type: 'confirm',
        name: 'addCustomCommands',
        message: 'Would you like to add custom commands?',
        default: false,
      },
      {
        type: 'input',
        name: 'customCommands',
        message: 'Enter custom commands (comma-separated, format: "name:description"):',
        when: (answers) => answers.addCustomCommands,
        examples: ['optimize:Optimize performance', 'debug:Debug issues'],
        filter: (input) => input.split(',').map(cmd => cmd.trim()),
      },
    ],
  },
  
  {
    title: 'Dependencies & Resources',
    description: 'Specify what resources this agent needs',
    help: 'Dependencies are tasks, templates, or data files the agent needs to function properly.',
    questions: [
      {
        type: 'checkbox',
        name: 'dependencyTypes',
        message: 'What types of dependencies does this agent need?',
        choices: [
          { name: 'Tasks - Reusable task workflows', value: 'tasks' },
          { name: 'Templates - Document/code templates', value: 'templates' },
          { name: 'Checklists - Quality checklists', value: 'checklists' },
          { name: 'Data - Reference data files', value: 'data' },
        ],
      },
      {
        type: 'input',
        name: 'taskDependencies',
        message: 'Enter task dependencies (comma-separated):',
        when: (answers) => answers.dependencyTypes.includes('tasks'),
        examples: ['analyze-data.md', 'generate-report.md'],
        filter: (input) => input ? input.split(',').map(t => t.trim()) : [],
      },
      {
        type: 'input',
        name: 'templateDependencies',
        message: 'Enter template dependencies (comma-separated):',
        when: (answers) => answers.dependencyTypes.includes('templates'),
        examples: ['report-template.md', 'analysis-template.yaml'],
        filter: (input) => input ? input.split(',').map(t => t.trim()) : [],
      },
    ],
  },
  
  {
    title: 'Security & Access Control',
    description: 'Configure security settings for this agent',
    help: 'Security settings control what the agent can access and who can use it.',
    condition: { field: 'agentName', operator: 'exists' },
    questions: [
      {
        type: 'list',
        name: 'securityLevel',
        message: 'What security level should this agent have?',
        choices: [
          { name: 'Standard - Default permissions', value: 'standard' },
          { name: 'Elevated - Additional capabilities', value: 'elevated' },
          { name: 'Restricted - Limited access', value: 'restricted' },
          { name: 'Custom - Define specific permissions', value: 'custom' },
        ],
        default: 'standard',
      },
      {
        type: 'confirm',
        name: 'requireAuthorization',
        message: 'Should this agent require special authorization to activate?',
        default: false,
        when: (answers) => answers.securityLevel !== 'standard',
      },
      {
        type: 'confirm',
        name: 'enableAuditLogging',
        message: 'Enable audit logging for this agent\'s operations?',
        default: true,
        when: (answers) => answers.securityLevel !== 'standard',
      },
      {
        type: 'checkbox',
        name: 'allowedOperations',
        message: 'Select allowed operations:',
        when: (answers) => answers.securityLevel === 'custom',
        choices: [
          'file_read',
          'file_write',
          'file_delete',
          'execute_commands',
          'network_access',
          'memory_access',
          'manifest_update',
        ],
      },
    ],
  },
  
  {
    title: 'Advanced Options',
    description: 'Configure advanced agent features',
    condition: { field: 'securityLevel', operator: 'notEquals', value: 'standard' },
    questions: [
      {
        type: 'confirm',
        name: 'enableMemoryLayer',
        message: 'Enable memory layer integration?',
        default: true,
      },
      {
        type: 'input',
        name: 'corePrinciples',
        message: 'Enter core principles for this agent (comma-separated):',
        examples: [
          'Always validate data before processing',
          'Follow security best practices',
          'Provide clear explanations',
        ],
        filter: (input) => input ? input.split(',').map(p => p.trim()) : [],
      },
      {
        type: 'input',
        name: 'customActivationInstructions',
        message: 'Any special activation instructions? (optional)',
        examples: ['Load specific context on activation', 'Initialize connections'],
      },
    ],
  },
];

module.exports = agentElicitationSteps;