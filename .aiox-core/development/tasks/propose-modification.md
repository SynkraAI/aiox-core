---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: proposeModification()
responsável: Atlas (Decoder)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

checklists:
  - change-checklist.md
---

# Propose Modification - AIOX Developer Task

## Purpose
Create and submit modification proposals for collaborative review and approval within the Synkra AIOX framework.

## Command Pattern
```
*propose-modification <component-path> <modification-type> [options]
```

## Parameters
- `component-path`: Path to the component to modify
- `modification-type`: Type of modification (modify, refactor, deprecate, enhance)
- `options`: Additional proposal configuration

### Options
- `--title <title>`: Title for the proposal
- `--description <desc>`: Detailed description of changes
- `--priority <level>`: Priority level (low, medium, high, critical)
- `--tags <tags>`: Comma-separated tags for categorization
- `--assignees <users>`: Comma-separated list of reviewers
- `--draft`: Create as draft proposal
- `--link-issues <ids>`: Link related issues or tasks
- `--impact-analysis`: Include impact analysis report
- `--test-results`: Attach test results

## Examples
```bash
# Propose agent enhancement
*propose-modification aiox-core/agents/weather-agent.md enhance --title "Add caching support" --description "Implement response caching to reduce API calls" --priority medium

# Propose critical refactoring with impact analysis
*propose-modification aiox-core/scripts/core-utility.js refactor --title "Optimize performance" --priority critical --impact-analysis --assignees "alice,bob"

# Create draft proposal for workflow deprecation
*propose-modification aiox-core/workflows/legacy-workflow.yaml deprecate --draft --title "Deprecate legacy workflow" --link-issues "123,456"
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

class ProposeModificationTask {
  constructor() {
    this.taskName = 'propose-modification';
    this.description = 'Create modification proposals for collaborative review';
    this.rootPath = process.cwd();
    this.proposalSystem = null;
    this.impactAnalyzer = null;
    this.notificationService = null;
  }

  async execute(params) {
    try {
      console.log(chalk.blue('📝 AIOX Modification Proposal'));
      console.log(chalk.gray('Creating collaborative modification proposal\n'));

      // Parse and validate parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Validate target component
      const component = await this.validateComponent(config.componentPath);

      // Create proposal
      console.log(chalk.gray('Creating modification proposal...'));
      const proposal = await this.createProposal(component, config);

      // Run impact analysis if requested
      if (config.includeImpactAnalysis) {
        console.log(chalk.gray('Running impact analysis...'));
        proposal.impactAnalysis = await this.runImpactAnalysis(component, config);
      }

      // Attach test results if provided
      if (config.testResults) {
        console.log(chalk.gray('Attaching test results...'));
        proposal.testResults = await this.attachTestResults(config.testResults);
      }

      // Get proposal details from user
      const details = await this.getProposalDetails(proposal, config);
      Object.assign(proposal, details);

      // Submit proposal
      console.log(chalk.gray('Submitting proposal...'));
      const result = await this.submitProposal(proposal, config);

      // Notify assignees
      if (config.assignees.length > 0) {
        await this.notifyAssignees(result, config.assignees);
      }

      // Display success
      console.log(chalk.green('\n✅ Modification proposal created successfully'));
      console.log(chalk.gray(`   Proposal ID: ${result.proposalId}`));
      console.log(chalk.gray(`   Status: ${result.status}`));
      console.log(chalk.gray(`   Reviewers: ${config.assignees.join(', ') || 'None assigned'}`));
      
      if (result.webUrl) {
        console.log(chalk.blue(`   View proposal: ${result.webUrl}`));
      }

      return {
        success: true,
        proposalId: result.proposalId,
        status: result.status,
        component: component.path,
        modificationType: config.modificationType,
        priority: config.priority,
        assignees: config.assignees
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Proposal creation failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 2) {
      throw new Error('Usage: *propose-modification <component-path> <modification-type> [options]');
    }

    const config = {
      componentPath: params[0],
      modificationType: params[1],
      title: '',
      description: '',
      priority: 'medium',
      tags: [],
      assignees: [],
      isDraft: false,
      linkedIssues: [],
      includeImpactAnalysis: false,
      testResults: null
    };

    // Validate modification type
    const validTypes = ['modify', 'refactor', 'deprecate', 'enhance'];
    if (!validTypes.includes(config.modificationType)) {
      throw new Error(`Invalid modification type: ${config.modificationType}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Parse options
    for (let i = 2; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--draft') {
        config.isDraft = true;
      } else if (param === '--impact-analysis') {
        config.includeImpactAnalysis = true;
      } else if (param.startsWith('--title') && params[i + 1]) {
        config.title = params[++i];
      } else if (param.startsWith('--description') && params[i + 1]) {
        config.description = params[++i];
      } else if (param.startsWith('--priority') && params[i + 1]) {
        config.priority = params[++i];
      } else if (param.startsWith('--tags') && params[i + 1]) {
        config.tags = params[++i].split(',').map(t => t.trim());
      } else if (param.startsWith('--assignees') && params[i + 1]) {
        config.assignees = params[++i].split(',').map(a => a.trim());
      } else if (param.startsWith('--link-issues') && params[i + 1]) {
        config.linkedIssues = params[++i].split(',').map(id => id.trim());
      } else if (param.startsWith('--test-results') && params[i + 1]) {
        config.testResults = params[++i];
      }
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(config.priority)) {
      throw new Error(`Invalid priority: ${config.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }

    return config;
  }

  async initializeDependencies() {
    try {
      const ProposalSystem = require('../scripts/proposal-system');
      this.proposalSystem = new ProposalSystem({ rootPath: this.rootPath });

      const ImpactAnalyzer = require('../scripts/dependency-impact-analyzer');
      this.impactAnalyzer = new ImpactAnalyzer({ rootPath: this.rootPath });

      const NotificationService = require('../scripts/notification-service');
      this.notificationService = new NotificationService({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async validateComponent(componentPath) {
    const fullPath = path.resolve(this.rootPath, componentPath);
    
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        throw new Error(`Not a file: ${componentPath}`);
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const componentType = this.determineComponentType(fullPath, content);

      return {
        path: componentPath,
        fullPath: fullPath,
        type: componentType,
        content: content,
        lastModified: stats.mtime
      };

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Component not found: ${componentPath}`);
      }
      throw error;
    }
  }

  async createProposal(component, config) {
    const proposal = {
      proposalId: `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      componentPath: component.path,
      componentType: component.type,
      modificationType: config.modificationType,
      title: config.title || `${config.modificationType} ${component.path}`,
      description: config.description,
      priority: config.priority,
      status: config.isDraft ? 'draft' : 'pending_review',
      tags: config.tags,
      assignees: config.assignees,
      linkedIssues: config.linkedIssues,
      metadata: {
        createdBy: process.env.USER || 'aiox-developer',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1
      }
    };

    // Add modification type specific fields
    switch (config.modificationType) {
      case 'deprecate':
        proposal.deprecationInfo = {
          targetRemovalDate: null,
          migrationPath: null,
          affectedComponents: []
        };
        break;
      case 'enhance':
        proposal.enhancementInfo = {
          newCapabilities: [],
          performanceImpact: null,
          backwardCompatible: true
        };
        break;
      case 'refactor':
        proposal.refactorInfo = {
          scope: 'component', // component, module, system
          breakingChanges: false,
          codeQualityMetrics: {}
        };
        break;
    }

    return proposal;
  }

  async runImpactAnalysis(component, config) {
    try {
      const impact = await this.impactAnalyzer.analyzeDependencyImpact(component, {
        modificationType: config.modificationType,
        depth: 'deep'
      });

      return {
        affectedComponents: impact.affectedComponents.length,
        criticalDependencies: impact.impactCategories?.critical || [],
        riskLevel: this.calculateRiskLevel(impact),
        summary: this.generateImpactSummary(impact)
      };

    } catch (error) {
      console.warn(chalk.yellow(`Impact analysis failed: ${error.message}`));
      return null;
    }
  }

  async attachTestResults(testResultsPath) {
    try {
      const content = await fs.readFile(testResultsPath, 'utf-8');
      return {
        source: testResultsPath,
        content: content,
        attachedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(chalk.yellow(`Failed to attach test results: ${error.message}`));
      return null;
    }
  }

  async getProposalDetails(proposal, config) {
    const questions = [];

    // Title if not provided
    if (!config.title) {
      questions.push({
        type: 'input',
        name: 'title',
        message: 'Proposal title:',
        default: proposal.title,
        validate: input => input.length > 0 || 'Title is required'
      });
    }

    // Description if not provided
    if (!config.description) {
      questions.push({
        type: 'editor',
        name: 'description',
        message: 'Detailed description (opens editor):',
        default: this.getDescriptionTemplate(config.modificationType)
      });
    }

    // Modification-specific questions
    if (config.modificationType === 'deprecate') {
      questions.push({
        type: 'input',
        name: 'targetRemovalDate',
        message: 'Target removal date (YYYY-MM-DD):',
        validate: input => {
          if (!input) return true;
          return /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Invalid date format';
        }
      });
    }

    if (config.modificationType === 'enhance') {
      questions.push({
        type: 'checkbox',
        name: 'newCapabilities',
        message: 'Select new capabilities:',
        choices: [
          'Performance optimization',
          'New API endpoints',
          'Additional configuration options',
          'Extended error handling',
          'Improved logging',
          'New integrations',
          'Other'
        ]
      });
    }

    if (config.modificationType === 'refactor') {
      questions.push({
        type: 'confirm',
        name: 'breakingChanges',
        message: 'Will this refactoring introduce breaking changes?',
        default: false
      });
    }

    // Review timeline
    questions.push({
      type: 'list',
      name: 'reviewTimeline',
      message: 'Expected review timeline:',
      choices: [
        { name: 'Urgent (1-2 days)', value: 'urgent' },
        { name: 'Normal (3-5 days)', value: 'normal' },
        { name: 'Low priority (1 week+)', value: 'low' }
      ],
      default: 'normal'
    });

    const answers = await inquirer.prompt(questions);

    // Process answers
    const details = {
      title: answers.title || config.title,
      description: answers.description || config.description,
      reviewTimeline: answers.reviewTimeline
    };

    // Add modification-specific details
    if (config.modificationType === 'deprecate' && answers.targetRemovalDate) {
      details.deprecationInfo = {
        targetRemovalDate: answers.targetRemovalDate
      };
    }

    if (config.modificationType === 'enhance' && answers.newCapabilities) {
      details.enhancementInfo = {
        newCapabilities: answers.newCapabilities
      };
    }

    if (config.modificationType === 'refactor') {
      details.refactorInfo = {
        breakingChanges: answers.breakingChanges
      };
    }

    return details;
  }

  async submitProposal(proposal, config) {
    try {
      // Submit through proposal system
      const result = await this.proposalSystem.submitProposal(proposal);

      // Store in memory/database
      await this.storeProposal(proposal, result);

      return {
        proposalId: proposal.proposalId,
        status: proposal.status,
        webUrl: this.generateProposalUrl(proposal.proposalId),
        createdAt: proposal.metadata.createdAt
      };

    } catch (error) {
      throw new Error(`Failed to submit proposal: ${error.message}`);
    }
  }

  async storeProposal(proposal, result) {
    const proposalsDir = path.join(this.rootPath, '.aiox', 'proposals');
    await fs.mkdir(proposalsDir, { recursive: true });

    const proposalFile = path.join(proposalsDir, `${proposal.proposalId}.json`);
    await fs.writeFile(proposalFile, JSON.stringify(proposal, null, 2));

    // Update proposals index
    const indexFile = path.join(proposalsDir, 'index.json');
    let index = { proposals: [] };
    
    try {
      const existing = await fs.readFile(indexFile, 'utf-8');
      index = JSON.parse(existing);
    } catch (error) {
      // Index doesn't exist yet
    }

    index.proposals.push({
      proposalId: proposal.proposalId,
      title: proposal.title,
      componentPath: proposal.componentPath,
      modificationType: proposal.modificationType,
      status: proposal.status,
      priority: proposal.priority,
      createdAt: proposal.metadata.createdAt,
      createdBy: proposal.metadata.createdBy
    });

    await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
  }

  async notifyAssignees(result, assignees) {
    try {
      await this.notificationService.notifyUsers(assignees, {
        type: 'proposal_assigned',
        proposalId: result.proposalId,
        title: result.title,
        priority: result.priority,
        url: result.webUrl
      });

      console.log(chalk.gray(`   Notifications sent to: ${assignees.join(', ')}`));

    } catch (error) {
      console.warn(chalk.yellow(`Failed to send notifications: ${error.message}`));
    }
  }

  // Helper methods

  determineComponentType(filePath, content) {
    if (filePath.includes('/agents/')) return 'agent';
    if (filePath.includes('/tasks/')) return 'task';
    if (filePath.includes('/workflows/')) return 'workflow';
    if (filePath.includes('/utils/')) return 'util';
    return 'unknown';
  }

  calculateRiskLevel(impact) {
    const affectedCount = impact.affectedComponents.length;
    const criticalCount = impact.impactCategories?.critical?.length || 0;

    if (criticalCount > 0 || affectedCount > 20) return 'high';
    if (affectedCount > 10) return 'medium';
    return 'low';
  }

  generateImpactSummary(impact) {
    return {
      totalAffected: impact.affectedComponents.length,
      byCategory: {
        critical: impact.impactCategories?.critical?.length || 0,
        high: impact.impactCategories?.high?.length || 0,
        medium: impact.impactCategories?.medium?.length || 0,
        low: impact.impactCategories?.low?.length || 0
      }
    };
  }

  getDescriptionTemplate(modificationType) {
    const templates = {
      enhance: `## Enhancement Description

### Objective
[Describe what this enhancement aims to achieve]

### Implementation Details
[Explain how the enhancement will be implemented]

### Benefits
- [List expected benefits]

### Testing Plan
[Describe how the enhancement will be tested]`,

      refactor: `## Refactoring Description

### Current Issues
[Describe problems with current implementation]

### Proposed Changes
[Detail the refactoring approach]

### Expected Improvements
- [List expected improvements]

### Risk Assessment
[Identify potential risks]`,

      deprecate: `## Deprecation Description

### Reason for Deprecation
[Explain why this component should be deprecated]

### Migration Path
[Describe how users should migrate]

### Timeline
[Specify deprecation timeline]

### Affected Users
[Identify who will be affected]`,

      modify: `## Modification Description

### Changes Overview
[Summarize the modifications]

### Rationale
[Explain why these changes are needed]

### Implementation
[Detail how changes will be implemented]

### Validation
[Describe validation approach]`
    };

    return templates[modificationType] || templates.modify;
  }

  generateProposalUrl(proposalId) {
    // In a real implementation, this would generate actual web URLs
    return `http://aiox-framework.local/proposals/${proposalId}`;
  }
}

module.exports = ProposeModificationTask;
```

## Validation Rules

### Input Validation
- Component path must exist and be accessible
- Modification type must be valid
- Priority must be recognized level
- Assignees should be valid user identifiers
- Linked issues should be valid issue IDs

### Proposal Requirements
- Title and description are required (prompted if not provided)
- Draft proposals can be incomplete
- Non-draft proposals must have complete information
- Impact analysis is recommended for high priority changes

### Review Process
- Proposals start in 'draft' or 'pending_review' status
- Assignees are notified upon submission
- Review timeline expectations are set
- Modification type determines required fields

## Integration Points

### Proposal System
- Manages proposal lifecycle and storage
- Handles versioning and history tracking
- Coordinates review workflows
- Integrates with notification system

### Impact Analysis
- Optional but recommended for significant changes
- Provides risk assessment for reviewers
- Identifies affected components
- Helps prioritize review efforts

### Notification Service
- Notifies assigned reviewers
- Sends updates on proposal status changes
- Supports multiple notification channels
- Tracks notification delivery

## Security Considerations
- Validate all user inputs to prevent injection
- Ensure proper access control for proposals
- Sanitize file paths and content
- Log all proposal activities for audit
- Protect sensitive component information 