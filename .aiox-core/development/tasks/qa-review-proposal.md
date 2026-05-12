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
task: qaReviewProposal()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist

- campo: criteria
  tipo: array
  origem: config
  obrigatório: true
  validação: Non-empty validation criteria

- campo: strict
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: true

**Saída:**
- campo: validation_result
  tipo: boolean
  destino: Return value
  persistido: false

- campo: errors
  tipo: array
  destino: Memory
  persistido: false

- campo: report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Validation rules loaded; target available for validation
    tipo: pre-condition
    blocker: true
    validação: |
      Check validation rules loaded; target available for validation
    error_message: "Pre-condition failed: Validation rules loaded; target available for validation"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation executed; results accurate; report generated
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation executed; results accurate; report generated
    error_message: "Post-condition failed: Validation executed; results accurate; report generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Validation rules applied; pass/fail accurate; actionable feedback
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert validation rules applied; pass/fail accurate; actionable feedback
    error_message: "Acceptance criterion not met: Validation rules applied; pass/fail accurate; actionable feedback"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** validation-engine
  - **Purpose:** Rule-based validation and reporting
  - **Source:** .aiox-core/utils/validation-engine.js

- **Tool:** schema-validator
  - **Purpose:** JSON/YAML schema validation
  - **Source:** ajv or similar

---

## Scripts

**Agent-specific code for this task:**

- **Script:** run-validation.js
  - **Purpose:** Execute validation rules and generate report
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/run-validation.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Validation Criteria Missing
   - **Cause:** Required validation rules not defined
   - **Resolution:** Ensure validation criteria loaded from config
   - **Recovery:** Use default validation rules, log warning

2. **Error:** Invalid Schema
   - **Cause:** Target does not match expected schema
   - **Resolution:** Update schema or fix target structure
   - **Recovery:** Detailed validation error report

3. **Error:** Dependency Missing
   - **Cause:** Required dependency for validation not found
   - **Resolution:** Install missing dependencies
   - **Recovery:** Abort with clear dependency list

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - quality-assurance
  - testing
updated_at: 2025-11-17
```

---

checklists:
  - change-checklist.md
---

# Review Proposal - AIOX Developer Task

## Purpose
Review and provide feedback on modification proposals submitted through the collaborative modification system.

## Command Pattern
```
*review-proposal <proposal-id> [options]
```

## Parameters
- `proposal-id`: ID of the proposal to review
- `options`: Review configuration

### Options
- `--action <action>`: Review action (approve, reject, request-changes, comment)
- `--comment <text>`: Review comment or feedback
- `--conditions <text>`: Conditions for approval
- `--suggestions <file>`: File containing suggested changes
- `--priority <level>`: Update proposal priority
- `--assignees <users>`: Add/change assignees
- `--fast-review`: Skip detailed analysis

## Examples
```bash
# Approve proposal with conditions
*review-proposal proposal-1234567-abc123 --action approve --comment "Looks good with minor changes" --conditions "Add comprehensive tests before merging"

# Request changes with suggestions
*review-proposal proposal-1234567-def456 --action request-changes --comment "Need security improvements" --suggestions security-review.md

# Add comment without decision
*review-proposal proposal-1234567-ghi789 --action comment --comment "Please clarify the impact on API consumers"
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

class ReviewProposalTask {
  constructor() {
    this.taskName = 'review-proposal';
    this.description = 'Review modification proposals';
    this.rootPath = process.cwd();
    this.proposalSystem = null;
    this.impactAnalyzer = null;
    this.notificationService = null;
    this.diffGenerator = null;
  }

  async execute(params) {
    try {
      console.log(chalk.blue('📋 AIOX Proposal Review'));
      console.log(chalk.gray('Reviewing modification proposal\n'));

      // Parse and validate parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Load proposal
      console.log(chalk.gray('Loading proposal...'));
      const proposal = await this.loadProposal(config.proposalId);

      // Display proposal summary
      await this.displayProposalSummary(proposal);

      // Perform review analysis if not fast review
      let reviewAnalysis = null;
      if (!config.fastReview) {
        console.log(chalk.gray('Analyzing proposal impact...'));
        reviewAnalysis = await this.analyzeProposal(proposal);
        await this.displayReviewAnalysis(reviewAnalysis);
      }

      // Get review details
      const reviewDetails = await this.getReviewDetails(proposal, reviewAnalysis, config);

      // Process review
      console.log(chalk.gray('Processing review...'));
      const result = await this.processReview(proposal, reviewDetails, config);

      // Update proposal status
      await this.updateProposalStatus(proposal, result);

      // Notify relevant parties
      await this.notifyReviewComplete(proposal, result);

      // Display success
      console.log(chalk.green('\n✅ Review submitted successfully'));
      console.log(chalk.gray(`   Proposal: ${proposal.proposalId}`));
      console.log(chalk.gray(`   Action: ${result.action}`));
      console.log(chalk.gray(`   Reviewer: ${result.reviewer}`));
      
      if (result.nextSteps) {
        console.log(chalk.blue('\n📌 Next Steps:'));
        result.nextSteps.forEach((step, index) => {
          console.log(chalk.gray(`   ${index + 1}. ${step}`));
        });
      }

      return {
        success: true,
        proposalId: proposal.proposalId,
        reviewAction: result.action,
        reviewStatus: result.status,
        reviewer: result.reviewer,
        timestamp: result.timestamp
      };

    } catch (error) {
      console.error(chalk.red(`\n❌ Review failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 1) {
      throw new Error('Usage: *review-proposal <proposal-id> [options]');
    }

    const config = {
      proposalId: params[0],
      action: null,
      comment: '',
      conditions: '',
      suggestions: null,
      priority: null,
      assignees: [],
      fastReview: false
    };

    // Parse options
    for (let i = 1; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--fast-review') {
        config.fastReview = true;
      } else if (param.startsWith('--action') && params[i + 1]) {
        config.action = params[++i];
      } else if (param.startsWith('--comment') && params[i + 1]) {
        config.comment = params[++i];
      } else if (param.startsWith('--conditions') && params[i + 1]) {
        config.conditions = params[++i];
      } else if (param.startsWith('--suggestions') && params[i + 1]) {
        config.suggestions = params[++i];
      } else if (param.startsWith('--priority') && params[i + 1]) {
        config.priority = params[++i];
      } else if (param.startsWith('--assignees') && params[i + 1]) {
        config.assignees = params[++i].split(',').map(a => a.trim());
      }
    }

    // Validate action if provided
    if (config.action) {
      const validActions = ['approve', 'reject', 'request-changes', 'comment'];
      if (!validActions.includes(config.action)) {
        throw new Error(`Invalid action: ${config.action}. Must be one of: ${validActions.join(', ')}`);
      }
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

      // const DiffGenerator = require('../scripts/diff-generator'); // Archived in archived-utilities/ (Story 3.1.2)
      // this.diffGenerator = new DiffGenerator({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async loadProposal(proposalId) {
    try {
      const proposalFile = path.join(this.rootPath, '.aiox', 'proposals', `${proposalId}.json`);
      const content = await fs.readFile(proposalFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Proposal not found: ${proposalId}`);
      }
      throw error;
    }
  }

  async displayProposalSummary(proposal) {
    console.log(chalk.blue('\n📄 Proposal Summary'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(`ID: ${chalk.white(proposal.proposalId)}`);
    console.log(`Title: ${chalk.white(proposal.title)}`);
    console.log(`Component: ${chalk.white(proposal.componentPath)}`);
    console.log(`Type: ${chalk.white(proposal.modificationType)}`);
    console.log(`Priority: ${this.formatPriority(proposal.priority)}`);
    console.log(`Status: ${this.formatStatus(proposal.status)}`);
    console.log(`Created by: ${chalk.white(proposal.metadata.createdBy)}`);
    console.log(`Created at: ${chalk.white(new Date(proposal.metadata.createdAt).toLocaleString())}`);
    
    if (proposal.assignees && proposal.assignees.length > 0) {
      console.log(`Assignees: ${chalk.white(proposal.assignees.join(', '))}`);
    }
    
    if (proposal.tags && proposal.tags.length > 0) {
      console.log(`Tags: ${chalk.gray(proposal.tags.join(', '))}`);
    }

    console.log(chalk.blue('\n📝 Description:'));
    console.log(chalk.gray(proposal.description || 'No description provided'));

    // Show modification-specific info
    if (proposal.modificationType === 'deprecate' && proposal.deprecationInfo) {
      console.log(chalk.yellow('\n⚠️ Deprecation Info:'));
      console.log(`Target removal: ${proposal.deprecationInfo.targetRemovalDate || 'Not specified'}`);
    }

    if (proposal.modificationType === 'enhance' && proposal.enhancementInfo) {
      console.log(chalk.green('\n✨ Enhancement Info:'));
      console.log(`New capabilities: ${proposal.enhancementInfo.newCapabilities.join(', ')}`);
    }

    if (proposal.modificationType === 'refactor' && proposal.refactorInfo) {
      console.log(chalk.blue('\n🔧 Refactor Info:'));
      console.log(`Breaking changes: ${proposal.refactorInfo.breakingChanges ? 'Yes' : 'No'}`);
    }
  }

  async analyzeProposal(proposal) {
    const analysis = {
      codeQuality: await this.analyzeCodeQuality(proposal),
      impact: proposal.impactAnalysis || null,
      conflicts: await this.checkForConflicts(proposal),
      testCoverage: await this.analyzeTestCoverage(proposal),
      securityIssues: await this.checkSecurityIssues(proposal),
      recommendations: []
    };

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  async analyzeCodeQuality(proposal) {
    try {
      const component = await fs.readFile(
        path.resolve(this.rootPath, proposal.componentPath), 
        'utf-8'
      );

      const quality = {
        complexity: this.calculateComplexity(component),
        maintainability: this.assessMaintainability(component),
        documentation: this.checkDocumentation(component),
        codeStyle: this.checkCodeStyle(component)
      };

      return quality;
    } catch (error) {
      return {
        error: `Could not analyze code quality: ${error.message}`
      };
    }
  }

  async checkForConflicts(proposal) {
    // Check for other pending proposals on the same component
    const indexFile = path.join(this.rootPath, '.aiox', 'proposals', 'index.json');
    
    try {
      const content = await fs.readFile(indexFile, 'utf-8');
      const index = JSON.parse(content);
      
      const conflicts = index.proposals.filter(p => 
        p.proposalId !== proposal.proposalId &&
        p.componentPath === proposal.componentPath &&
        (p.status === 'pending_review' || p.status === 'approved')
      );

      return {
        hasConflicts: conflicts.length > 0,
        conflictingProposals: conflicts
      };
    } catch (error) {
      return {
        hasConflicts: false,
        conflictingProposals: []
      };
    }
  }

  async analyzeTestCoverage(proposal) {
    // Check if component has tests
    const testPaths = [
      path.join(this.rootPath, 'tests', 'unit', proposal.componentType, `${path.basename(proposal.componentPath, path.extname(proposal.componentPath))}.test.js`),
      path.join(this.rootPath, 'tests', 'integration', proposal.componentType, `${path.basename(proposal.componentPath, path.extname(proposal.componentPath))}.test.js`)
    ];

    let hasTests = false;
    for (const testPath of testPaths) {
      try {
        await fs.access(testPath);
        hasTests = true;
        break;
      } catch (error) {
        // Test file doesn't exist
      }
    }

    return {
      hasTests: hasTests,
      recommendation: hasTests ? 
        'Component has test coverage' : 
        'Component lacks test coverage - tests should be added'
    };
  }

  async checkSecurityIssues(proposal) {
    try {
      const component = await fs.readFile(
        path.resolve(this.rootPath, proposal.componentPath), 
        'utf-8'
      );

      const issues = [];

      // Check for common security patterns
      if (component.includes('eval(') || component.includes('Function(')) {
        issues.push('Uses dynamic code execution (eval/Function)');
      }

      if (component.includes('innerHTML') || component.includes('dangerouslySetInnerHTML')) {
        issues.push('Potential XSS vulnerability with innerHTML usage');
      }

      if (component.includes('exec(') || component.includes('spawn(')) {
        issues.push('Executes external processes - needs security review');
      }

      if (component.includes('fs.') && proposal.modificationType === 'enhance') {
        issues.push('File system operations in enhancement - verify path validation');
      }

      return {
        hasIssues: issues.length > 0,
        issues: issues
      };
    } catch (error) {
      return {
        hasIssues: false,
        issues: []
      };
    }
  }

  async displayReviewAnalysis(analysis) {
    console.log(chalk.blue('\n🔍 Review Analysis'));
    console.log(chalk.gray('━'.repeat(50)));

    // Code Quality
    if (analysis.codeQuality && !analysis.codeQuality.error) {
      console.log(chalk.blue('\n📊 Code Quality:'));
      console.log(`  Complexity: ${this.formatScore(analysis.codeQuality.complexity)}`);
      console.log(`  Maintainability: ${this.formatScore(analysis.codeQuality.maintainability)}`);
      console.log(`  Documentation: ${this.formatScore(analysis.codeQuality.documentation)}`);
      console.log(`  Code Style: ${this.formatScore(analysis.codeQuality.codeStyle)}`);
    }

    // Impact Analysis
    if (analysis.impact) {
      console.log(chalk.blue('\n💥 Impact Summary:'));
      console.log(`  Affected components: ${analysis.impact.affectedComponents || 'Unknown'}`);
      console.log(`  Risk level: ${this.formatRiskLevel(analysis.impact.riskLevel || 'Unknown')}`);
    }

    // Conflicts
    if (analysis.conflicts.hasConflicts) {
      console.log(chalk.yellow('\n⚠️ Conflicts Detected:'));
      analysis.conflicts.conflictingProposals.forEach(conflict => {
        console.log(`  - ${conflict.proposalId}: ${conflict.title} (${conflict.status})`);
      });
    } else {
      console.log(chalk.green('\n✅ No conflicts detected'));
    }

    // Test Coverage
    console.log(chalk.blue('\n🧪 Test Coverage:'));
    console.log(`  ${analysis.testCoverage.recommendation}`);

    // Security Issues
    if (analysis.securityIssues.hasIssues) {
      console.log(chalk.red('\n🔒 Security Concerns:'));
      analysis.securityIssues.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    } else {
      console.log(chalk.green('\n🔒 No security issues detected'));
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      console.log(chalk.blue('\n💡 Recommendations:'));
      analysis.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  async getReviewDetails(proposal, analysis, config) {
    const details = {
      action: config.action,
      comment: config.comment,
      conditions: config.conditions,
      suggestions: null,
      priority: config.priority,
      assignees: config.assignees
    };

    // Load suggestions if provided
    if (config.suggestions) {
      try {
        details.suggestions = await fs.readFile(config.suggestions, 'utf-8');
      } catch (error) {
        console.warn(chalk.yellow(`Could not load suggestions file: ${error.message}`));
      }
    }

    // Interactive review if action not provided
    if (!details.action) {
      const questions = await this.buildReviewQuestions(proposal, analysis);
      const answers = await inquirer.prompt(questions);
      Object.assign(details, answers);
    }

    // Set reviewer info
    details.reviewer = process.env.USER || 'aiox-reviewer';
    details.reviewTimestamp = new Date().toISOString();

    return details;
  }

  async buildReviewQuestions(proposal, analysis) {
    const questions = [];

    // Main action
    questions.push({
      type: 'list',
      name: 'action',
      message: 'Review action:',
      choices: [
        { name: '✅ Approve', value: 'approve' },
        { name: '❌ Reject', value: 'reject' },
        { name: '🔄 Request Changes', value: 'request-changes' },
        { name: '💬 Add Comment Only', value: 'comment' }
      ]
    });

    // Comment
    questions.push({
      type: 'editor',
      name: 'comment',
      message: 'Review comment:',
      default: this.getCommentTemplate(proposal, analysis)
    });

    // Approval conditions
    questions.push({
      type: 'input',
      name: 'conditions',
      message: 'Conditions for approval (if any):',
      when: (answers) => answers.action === 'approve'
    });

    // Priority update
    questions.push({
      type: 'list',
      name: 'priority',
      message: 'Update priority?',
      choices: [
        { name: 'Keep current', value: null },
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Critical', value: 'critical' }
      ],
      default: 0
    });

    // Additional assignees
    questions.push({
      type: 'input',
      name: 'additionalAssignees',
      message: 'Add additional reviewers (comma-separated):',
      when: (answers) => answers.action === 'request-changes',
      filter: (input) => input ? input.split(',').map(a => a.trim()) : []
    });

    return questions;
  }

  async processReview(proposal, reviewDetails, config) {
    const review = {
      reviewId: `review-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      proposalId: proposal.proposalId,
      action: reviewDetails.action,
      status: this.getReviewStatus(reviewDetails.action),
      reviewer: reviewDetails.reviewer,
      timestamp: reviewDetails.reviewTimestamp,
      comment: reviewDetails.comment,
      conditions: reviewDetails.conditions,
      suggestions: reviewDetails.suggestions,
      metadata: {
        reviewDuration: this.calculateReviewDuration(proposal),
        analysisPerformed: !config.fastReview
      }
    };

    // Store review
    await this.storeReview(proposal, review);

    // Determine next steps
    review.nextSteps = this.determineNextSteps(proposal, review);

    return review;
  }

  async storeReview(proposal, review) {
    const reviewsDir = path.join(this.rootPath, '.aiox', 'proposals', 'reviews');
    await fs.mkdir(reviewsDir, { recursive: true });

    const reviewFile = path.join(reviewsDir, `${review.reviewId}.json`);
    await fs.writeFile(reviewFile, JSON.stringify(review, null, 2));

    // Update proposal with review reference
    if (!proposal.reviews) {
      proposal.reviews = [];
    }
    proposal.reviews.push({
      reviewId: review.reviewId,
      reviewer: review.reviewer,
      action: review.action,
      timestamp: review.timestamp
    });
  }

  async updateProposalStatus(proposal, review) {
    // Update status based on review action
    switch (review.action) {
      case 'approve':
        proposal.status = 'approved';
        proposal.approvedBy = review.reviewer;
        proposal.approvalTimestamp = review.timestamp;
        break;
      case 'reject':
        proposal.status = 'rejected';
        proposal.rejectedBy = review.reviewer;
        proposal.rejectionTimestamp = review.timestamp;
        break;
      case 'request-changes':
        proposal.status = 'changes_requested';
        proposal.lastReviewTimestamp = review.timestamp;
        break;
      case 'comment':
        // Status remains unchanged for comments
        proposal.lastCommentTimestamp = review.timestamp;
        break;
    }

    // Update priority if changed
    if (review.priority) {
      proposal.priority = review.priority;
    }

    // Update assignees if changed
    if (review.assignees && review.assignees.length > 0) {
      proposal.assignees = [...new Set([...proposal.assignees, ...review.assignees])];
    }

    // Update metadata
    proposal.metadata.lastModified = new Date().toISOString();
    proposal.metadata.version++;

    // Save updated proposal
    const proposalFile = path.join(this.rootPath, '.aiox', 'proposals', `${proposal.proposalId}.json`);
    await fs.writeFile(proposalFile, JSON.stringify(proposal, null, 2));

    // Update index
    await this.updateProposalIndex(proposal);
  }

  async updateProposalIndex(proposal) {
    const indexFile = path.join(this.rootPath, '.aiox', 'proposals', 'index.json');
    
    try {
      const content = await fs.readFile(indexFile, 'utf-8');
      const index = JSON.parse(content);
      
      const proposalIndex = index.proposals.findIndex(p => p.proposalId === proposal.proposalId);
      if (proposalIndex !== -1) {
        index.proposals[proposalIndex].status = proposal.status;
        index.proposals[proposalIndex].priority = proposal.priority;
        index.proposals[proposalIndex].lastModified = proposal.metadata.lastModified;
      }
      
      await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
    } catch (error) {
      console.warn(chalk.yellow(`Failed to update proposal index: ${error.message}`));
    }
  }

  async notifyReviewComplete(proposal, review) {
    try {
      const notifications = [];

      // Notify proposal creator
      notifications.push({
        recipient: proposal.metadata.createdBy,
        type: 'review_complete',
        proposalId: proposal.proposalId,
        reviewAction: review.action,
        reviewer: review.reviewer
      });

      // Notify assignees if action requires it
      if (review.action === 'request-changes' && proposal.assignees) {
        proposal.assignees.forEach(assignee => {
          notifications.push({
            recipient: assignee,
            type: 'changes_requested',
            proposalId: proposal.proposalId,
            reviewer: review.reviewer,
            comment: review.comment
          });
        });
      }

      // Send notifications
      for (const notification of notifications) {
        await this.notificationService.sendNotification(notification);
      }

      console.log(chalk.gray(`   Notifications sent: ${notifications.length}`));

    } catch (error) {
      console.warn(chalk.yellow(`Failed to send notifications: ${error.message}`));
    }
  }

  // Helper methods

  calculateComplexity(component) {
    // Simple complexity calculation based on code patterns
    const functionCount = (component.match(/function\s+\w+/g) || []).length;
    const methodCount = (component.match(/\w+\s*\([^)]*\)\s*{/g) || []).length;
    const conditionalCount = (component.match(/if\s*\(|switch\s*\(/g) || []).length;
    const loopCount = (component.match(/for\s*\(|while\s*\(|\.forEach|\.map/g) || []).length;
    
    const complexity = functionCount + methodCount + conditionalCount + loopCount;
    
    if (complexity > 50) return { score: 'high', value: complexity };
    if (complexity > 20) return { score: 'medium', value: complexity };
    return { score: 'low', value: complexity };
  }

  assessMaintainability(component) {
    // Check for maintainability indicators
    const hasComments = component.includes('//') || component.includes('/*');
    const hasJSDoc = component.includes('/**');
    const hasErrorHandling = component.includes('try') || component.includes('catch');
    const hasModularStructure = component.includes('module.exports') || component.includes('export');
    
    let score = 0;
    if (hasComments) score += 25;
    if (hasJSDoc) score += 25;
    if (hasErrorHandling) score += 25;
    if (hasModularStructure) score += 25;
    
    return { score: score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor', value: score };
  }

  checkDocumentation(component) {
    const docPatterns = [
      /\/\*\*[\s\S]*?\*\//g, // JSDoc
      /#+\s+\w+/g, // Markdown headers
      /@param/g, // Parameter documentation
      /@returns/g, // Return documentation
      /@example/g // Example documentation
    ];
    
    let docScore = 0;
    docPatterns.forEach(pattern => {
      const matches = component.match(pattern);
      if (matches) docScore += matches.length;
    });
    
    return { score: docScore > 10 ? 'good' : docScore > 5 ? 'fair' : 'poor', value: docScore };
  }

  checkCodeStyle(component) {
    // Basic code style checks
    const issues = [];
    
    if (component.includes('\t')) {
      issues.push('Uses tabs instead of spaces');
    }
    
    const lines = component.split('\n');
    const longLines = lines.filter(line => line.length > 120).length;
    if (longLines > 0) {
      issues.push(`${longLines} lines exceed 120 characters`);
    }
    
    if (!component.includes('use strict') && !component.includes('"use strict"')) {
      issues.push('Missing strict mode declaration');
    }
    
    return { 
      score: issues.length === 0 ? 'good' : issues.length <= 2 ? 'fair' : 'poor',
      issues: issues 
    };
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // Code quality recommendations
    if (analysis.codeQuality && !analysis.codeQuality.error) {
      if (analysis.codeQuality.complexity.score === 'high') {
        recommendations.push('Consider refactoring to reduce code complexity');
      }
      if (analysis.codeQuality.documentation.score === 'poor') {
        recommendations.push('Add comprehensive documentation and JSDoc comments');
      }
      if (analysis.codeQuality.maintainability.score === 'poor') {
        recommendations.push('Improve code maintainability with better structure and error handling');
      }
    }

    // Test coverage recommendations
    if (!analysis.testCoverage.hasTests) {
      recommendations.push('Add unit tests before approving this modification');
    }

    // Security recommendations
    if (analysis.securityIssues.hasIssues) {
      recommendations.push('Address security concerns before approval');
    }

    // Conflict recommendations
    if (analysis.conflicts.hasConflicts) {
      recommendations.push('Resolve conflicts with other pending proposals');
    }

    return recommendations;
  }

  getCommentTemplate(proposal, analysis) {
    let template = `## Review for: ${proposal.title}\n\n`;
    template += `### Summary\n[Provide your overall assessment]\n\n`;
    
    if (analysis && analysis.recommendations.length > 0) {
      template += `### Recommendations\n`;
      analysis.recommendations.forEach((rec, index) => {
        template += `${index + 1}. ${rec}\n`;
      });
      template += '\n';
    }
    
    template += `### Details\n[Add specific feedback and suggestions]\n`;
    
    return template;
  }

  formatPriority(priority) {
    const colors = {
      low: chalk.gray,
      medium: chalk.yellow,
      high: chalk.red,
      critical: chalk.red.bold
    };
    return colors[priority] ? colors[priority](priority.toUpperCase()) : priority;
  }

  formatStatus(status) {
    const statusMap = {
      draft: chalk.gray('DRAFT'),
      pending_review: chalk.yellow('PENDING REVIEW'),
      approved: chalk.green('APPROVED'),
      rejected: chalk.red('REJECTED'),
      changes_requested: chalk.yellow('CHANGES REQUESTED'),
      in_progress: chalk.blue('IN PROGRESS'),
      completed: chalk.green('COMPLETED')
    };
    return statusMap[status] || status;
  }

  formatScore(score) {
    if (typeof score === 'object') {
      const colors = {
        good: chalk.green,
        fair: chalk.yellow,
        poor: chalk.red,
        low: chalk.green,
        medium: chalk.yellow,
        high: chalk.red
      };
      const color = colors[score.score] || chalk.gray;
      return color(`${score.score.toUpperCase()} (${score.value})`);
    }
    return score;
  }

  formatRiskLevel(level) {
    const colors = {
      low: chalk.green,
      medium: chalk.yellow,
      high: chalk.red,
      critical: chalk.red.bold
    };
    return colors[level] ? colors[level](level.toUpperCase()) : level;
  }

  getReviewStatus(action) {
    const statusMap = {
      'approve': 'approved',
      'reject': 'rejected',
      'request-changes': 'changes_requested',
      'comment': 'commented'
    };
    return statusMap[action] || action;
  }

  calculateReviewDuration(proposal) {
    const created = new Date(proposal.metadata.createdAt);
    const now = new Date();
    const duration = now - created;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  determineNextSteps(proposal, review) {
    const steps = [];

    switch (review.action) {
      case 'approve':
        steps.push('Proposal approved and ready for implementation');
        steps.push('Assignees will be notified to begin work');
        if (review.conditions) {
          steps.push(`Ensure conditions are met: ${review.conditions}`);
        }
        break;
      
      case 'reject':
        steps.push('Proposal has been rejected');
        steps.push('Creator should address feedback before resubmission');
        break;
      
      case 'request-changes':
        steps.push('Changes have been requested');
        steps.push('Proposal creator should address feedback');
        steps.push('Resubmit for review after making changes');
        break;
      
      case 'comment':
        steps.push('Comment added to proposal');
        steps.push('No status change - review still pending');
        break;
    }

    return steps;
  }
}

module.exports = ReviewProposalTask;
```

## Validation Rules

### Review Validation
- Proposal must exist and be accessible
- Review action must be valid
- Reviewer must have appropriate permissions
- Cannot review own proposals (in production)
- Cannot approve high-risk changes without conditions

### Status Transitions
- Draft → Pending Review (on submission)
- Pending Review → Approved/Rejected/Changes Requested
- Changes Requested → Pending Review (on update)
- Approved → In Progress (on implementation start)
- In Progress → Completed (on implementation finish)

### Review Requirements
- All reviews must include comments
- Approvals may include conditions
- Rejections must include reasons
- Change requests should include specific feedback

## Integration Points

### Proposal System
- Loads and updates proposal data
- Manages proposal lifecycle
- Tracks review history
- Handles status transitions

### Impact Analysis
- Provides risk assessment for review
- Identifies affected components
- Helps inform review decisions
- Highlights critical issues

### Notification Service
- Notifies proposal creator of review
- Alerts assignees of changes requested
- Sends approval confirmations
- Tracks notification delivery

### Diff Generator
- Shows proposed changes clearly
- Highlights modifications
- Assists in code review
- Supports multiple diff formats

## Security Considerations
- Validate reviewer permissions
- Audit all review actions
- Prevent unauthorized status changes
- Protect sensitive proposal information
- Log all review activities for compliance 