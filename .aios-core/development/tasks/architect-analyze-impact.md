# An
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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: architectAnalyzeImpact()
responsável: Aria (Visionary)
responsavel_type: Agente
atomic_layer: Strategy

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
  - **Source:** .aios-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aios-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

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
  - analysis
  - metrics
updated_at: 2025-11-17
```

---

alyze Impact - AIOS Developer Task

## Purpose
Analyze the potential impact of proposed component modifications on the broader Synkra AIOS framework.

## Command Pattern
```
*analyze-impact <modification-type> <component-path> [options]
```

## Parameters
- `modification-type`: Type of modification (modify, deprecate, remove, refactor)
- `component-path`: Path to the component being modified
- `options`: Impact analysis configuration

### Options
- `--depth <level>`: Analysis depth (shallow, medium, deep)
- `--include-tests`: Include test file impact analysis
- `--risk-threshold <level>`: Risk threshold for warnings (low, medium, high, critical)
- `--output-format <format>`: Output format (text, json, visual, html)
- `--save-report <path>`: Save detailed report to file
- `--approve-high-risk`: Skip approval workflow for high-risk changes
- `--exclude-external`: Exclude external dependency analysis

## Examples
```bash
# Analyze impact of modifying an agent
*analyze-impact modify aios-core/agents/weather-agent.md --depth deep --include-tests

# Analyze deprecation impact with visual output
*analyze-impact deprecate aios-core/scripts/old-helper.js --output-format visual --save-report reports/deprecation-impact.html

# Quick impact check for refactoring
*analyze-impact refactor aios-core/tasks/process-data.md --depth shallow --risk-threshold medium

# Analyze removal with approval workflow
*analyze-impact remove aios-core/workflows/legacy-workflow.yaml --depth deep --save-report reports/removal-impact.json
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

class AnalyzeImpactTask {
  constructor() {
    this.taskName = 'analyze-impact';
    this.description = 'Analyze potential impact of component modifications';
    this.rootPath = process.cwd();
    this.dependencyAnalyzer = null;
    this.propagationPredictor = null;
    this.riskAssessment = null;
    this.visualGenerator = null;
    this.approvalWorkflow = null;
  }

  async execute(params) {
    try {
      console.log(chalk.blue('🔍 AIOS Impact Analysis'));
      console.log(chalk.gray('Analyzing potential impact of component modifications\\n'));

      // Parse and validate parameters
      const config = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Validate target component exists
      const targetComponent = await this.validateTargetComponent(config);

      // Perform dependency impact analysis
      console.log(chalk.gray('Analyzing dependency impact...'));
      const dependencyImpact = await this.analyzeDependencyImpact(targetComponent, config);

      // Predict change propagation
      console.log(chalk.gray('Predicting change propagation...'));
      const propagationAnalysis = await this.predictChangePropagation(targetComponent, dependencyImpact, config);

      // Assess modification risks
      console.log(chalk.gray('Assessing modification risks...'));
      const riskAssessment = await this.assessModificationRisks(targetComponent, dependencyImpact, propagationAnalysis, config);

      // Generate comprehensive impact report
      const impactReport = await this.generateImpactReport(targetComponent, {
        dependencyImpact,
        propagationAnalysis,
        riskAssessment
      }, config);

      // Display impact summary
      await this.displayImpactSummary(impactReport);

      // Generate visual representation if requested
      if (config.outputFormat === 'visual' || config.outputFormat === 'html') {
        console.log(chalk.gray('Generating visual impact representation...'));
        await this.generateVisualRepresentation(impactReport, config);
      }

      // Save detailed report if requested
      if (config.saveReport) {
        await this.saveDetailedReport(impactReport, config.saveReport, config.outputFormat);
      }

      // Handle high-risk change approval workflow
      if (riskAssessment.overallRisk === 'high' || riskAssessment.overallRisk === 'critical') {
        if (!config.approveHighRisk) {
          const approved = await this.handleHighRiskApproval(impactReport);
          if (!approved) {
            console.log(chalk.yellow('\\n⚠ High-risk modification requires approval before proceeding'));
            return {
              success: true,
              requiresApproval: true,
              riskLevel: riskAssessment.overallRisk,
              impactSummary: impactReport.summary
            };
          }
        }
      }

      // Display completion summary
      console.log(chalk.green('\\n✅ Impact analysis completed'));
      console.log(chalk.gray(`   Components analyzed: ${dependencyImpact.affectedComponents.length}`));
      console.log(chalk.gray(`   Risk level: ${this.formatRiskLevel(riskAssessment.overallRisk)}`));
      console.log(chalk.gray(`   Propagation depth: ${propagationAnalysis.maxDepth}`));

      return {
        success: true,
        targetComponent: targetComponent.path,
        riskLevel: riskAssessment.overallRisk,
        affectedComponents: dependencyImpact.affectedComponents.length,
        propagationDepth: propagationAnalysis.maxDepth,
        requiresApproval: false,
        impactReport: config.outputFormat === 'json' ? impactReport : impactReport.summary
      };

    } catch (error) {
      console.error(chalk.red(`\\n❌ Impact analysis failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 2) {
      throw new Error('Usage: *analyze-impact <modification-type> <component-path> [options]');
    }

    const config = {
      modificationType: params[0],
      componentPath: params[1],
      depth: 'medium',
      includeTests: false,
      riskThreshold: 'medium',
      outputFormat: 'text',
      saveReport: null,
      approveHighRisk: false,
      excludeExternal: false
    };

    // Parse options
    for (let i = 2; i < params.length; i++) {
      const param = params[i];
      
      if (param === '--include-tests') {
        config.includeTests = true;
      } else if (param === '--approve-high-risk') {
        config.approveHighRisk = true;
      } else if (param === '--exclude-external') {
        config.excludeExternal = true;
      } else if (param.startsWith('--depth') && params[i + 1]) {
        config.depth = params[++i];
      } else if (param.startsWith('--risk-threshold') && params[i + 1]) {
        config.riskThreshold = params[++i];
      } else if (param.startsWith('--output-format') && params[i + 1]) {
        config.outputFormat = params[++i];
      } else if (param.startsWith('--save-report') && params[i + 1]) {
        config.saveReport = params[++i];
      }
    }

    // Validation
    const validModificationTypes = ['modify', 'deprecate', 'remove', 'refactor'];
    if (!validModificationTypes.includes(config.modificationType)) {
      throw new Error(`Invalid modification type: ${config.modificationType}. Must be one of: ${validModificationTypes.join(', ')}`);
    }

    const validDepths = ['shallow', 'medium', 'deep'];
    if (!validDepths.includes(config.depth)) {
      throw new Error(`Invalid depth: ${config.depth}. Must be one of: ${validDepths.join(', ')}`);
    }

    const validRiskThresholds = ['low', 'medium', 'high', 'critical'];
    if (!validRiskThresholds.includes(config.riskThreshold)) {
      throw new Error(`Invalid risk threshold: ${config.riskThreshold}. Must be one of: ${validRiskThresholds.join(', ')}`);
    }

    const validOutputFormats = ['text', 'json', 'visual', 'html'];
    if (!validOutputFormats.includes(config.outputFormat)) {
      throw new Error(`Invalid output format: ${config.outputFormat}. Must be one of: ${validOutputFormats.join(', ')}`);
    }

    return config;
  }

  async initializeDependencies() {
    try {
      // Initialize dependency impact analyzer
      const DependencyImpactAnalyzer = require('../scripts/dependency-impact-analyzer');
      this.dependencyAnalyzer = new DependencyImpactAnalyzer({ rootPath: this.rootPath });
      await this.dependencyAnalyzer.initialize();

      // Initialize change propagation predictor
      // const ChangePropagationPredictor = require('../scripts/change-propagation-predictor'); // Archived in archived-utilities/ (Story 3.1.2)
      // this.propagationPredictor = new ChangePropagationPredictor({ rootPath: this.rootPath }); // Archived in archived-utilities/ (Story 3.1.2)

      // Initialize risk assessment
      const ModificationRiskAssessment = require('../scripts/modification-risk-assessment');
      this.riskAssessment = new ModificationRiskAssessment({ rootPath: this.rootPath });

      // Initialize visual impact generator
      const VisualImpactGenerator = require('../scripts/visual-impact-generator');
      this.visualGenerator = new VisualImpactGenerator({ rootPath: this.rootPath });

      // Initialize approval workflow
      const ApprovalWorkflow = require('../scripts/approval-workflow');
      this.approvalWorkflow = new ApprovalWorkflow({ rootPath: this.rootPath });

    } catch (error) {
      throw new Error(`Failed to initialize dependencies: ${error.message}`);
    }
  }

  async validateTargetComponent(config) {
    const fullPath = path.resolve(this.rootPath, config.componentPath);
    
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        throw new Error(`Target path is not a file: ${config.componentPath}`);
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const componentType = this.determineComponentType(fullPath, content);

      return {
        path: config.componentPath,
        fullPath: fullPath,
        type: componentType,
        content: content,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Component not found: ${config.componentPath}`);
      }
      throw error;
    }
  }

  async analyzeDependencyImpact(targetComponent, config) {
    return await this.dependencyAnalyzer.analyzeDependencyImpact(targetComponent, {
      depth: config.depth,
      includeTests: config.includeTests,
      excludeExternal: config.excludeExternal,
      modificationType: config.modificationType
    });
  }

  async predictChangePropagation(targetComponent, dependencyImpact, config) {
    return await this.propagationPredictor.predictPropagation(targetComponent, dependencyImpact, {
      depth: config.depth,
      modificationType: config.modificationType
    });
  }

  async assessModificationRisks(targetComponent, dependencyImpact, propagationAnalysis, config) {
    return await this.riskAssessment.assessRisks(targetComponent, {
      dependencyImpact,
      propagationAnalysis,
      modificationType: config.modificationType,
      riskThreshold: config.riskThreshold
    });
  }

  async generateImpactReport(targetComponent, analyses, config) {
    const { dependencyImpact, propagationAnalysis, riskAssessment } = analyses;

    const report = {
      reportId: `impact-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      targetComponent: {
        path: targetComponent.path,
        type: targetComponent.type,
        size: targetComponent.size
      },
      modificationType: config.modificationType,
      analysisDepth: config.depth,
      summary: {
        overallRisk: riskAssessment.overallRisk,
        affectedComponents: dependencyImpact.affectedComponents.length,
        propagationDepth: propagationAnalysis.maxDepth,
        criticalIssues: riskAssessment.criticalIssues.length,
        recommendations: riskAssessment.recommendations.length
      },
      dependencyAnalysis: dependencyImpact,
      propagationAnalysis: propagationAnalysis,
      riskAssessment: riskAssessment,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        configUsed: config
      }
    };

    return report;
  }

  async displayImpactSummary(report) {
    console.log(chalk.blue('\\n📊 Impact Analysis Results'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(`Target: ${chalk.white(report.targetComponent.path)}`);
    console.log(`Modification: ${chalk.white(report.modificationType)}`);
    console.log(`Risk Level: ${this.formatRiskLevel(report.summary.overallRisk)}`);
    console.log(`Affected Components: ${chalk.white(report.summary.affectedComponents)}`);
    console.log(`Propagation Depth: ${chalk.white(report.summary.propagationDepth)}`);

    if (report.summary.criticalIssues > 0) {
      console.log(`${chalk.red('⚠ Critical Issues:')} ${report.summary.criticalIssues}`);
    }

    if (report.riskAssessment.recommendations.length > 0) {
      console.log(chalk.blue('\\n💡 Key Recommendations:'));
      report.riskAssessment.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.title}`);
      });
    }

    // Display most critical affected components
    if (report.dependencyAnalysis.affectedComponents.length > 0) {
      console.log(chalk.blue('\\n🔗 Most Impacted Components:'));
      const topImpacted = report.dependencyAnalysis.affectedComponents
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 5);
      
      topImpacted.forEach(component => {
        const riskIcon = component.impactScore > 8 ? '🔴' : component.impactScore > 5 ? '🟡' : '🟢';
        console.log(`  ${riskIcon} ${component.path} (impact: ${component.impactScore}/10)`);
      });
    }
  }

  async generateVisualRepresentation(report, config) {
    const visualData = await this.visualGenerator.generateImpactVisualization(report, {
      format: config.outputFormat,
      includeInteractive: config.outputFormat === 'html'
    });

    if (config.outputFormat === 'visual') {
      // Display ASCII-based visual representation
      console.log(chalk.blue('\\n📈 Visual Impact Map:'));
      console.log(visualData.asciiGraph);
    }

    return visualData;
  }

  async saveDetailedReport(report, savePath, format) {
    const fullPath = path.resolve(this.rootPath, savePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    let content;
    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      case 'html':
        content = await this.generateHtmlReport(report);
        break;
      default:
        content = await this.generateTextReport(report);
    }

    await fs.writeFile(fullPath, content);
    console.log(chalk.green(`\\n📄 Detailed report saved to: ${savePath}`));
  }

  async handleHighRiskApproval(report) {
    console.log(chalk.yellow('\\n⚠ HIGH RISK MODIFICATION DETECTED'));
    console.log(chalk.gray('This modification may have significant impact on the framework.\\n'));

    const { approved } = await inquirer.prompt([{
      type: 'confirm',
      name: 'approved',
      message: `Proceed with ${report.summary.overallRisk} risk modification of ${report.targetComponent.path}?`,
      default: false
    }]);

    if (approved) {
      // Log approval for audit trail
      await this.approvalWorkflow.logApproval(report, {
        approvedBy: 'user',
        approvalTimestamp: new Date().toISOString(),
        riskLevel: report.summary.overallRisk
      });
    }

    return approved;
  }

  // Helper methods

  determineComponentType(filePath, content) {
    if (filePath.includes('/agents/')) return 'agent';
    if (filePath.includes('/tasks/')) return 'task';
    if (filePath.includes('/workflows/')) return 'workflow';
    if (filePath.includes('/utils/')) return 'util';
    
    // Analyze content for type hints
    if (content.includes('class') && content.includes('execute')) return 'task';
    if (content.includes('agent_name') || content.includes('Agent')) return 'agent';
    if (content.includes('workflow_steps') || content.includes('Workflow')) return 'workflow';
    
    return 'unknown';
  }

  formatRiskLevel(riskLevel) {
    const colors = {
      low: chalk.green,
      medium: chalk.yellow,
      high: chalk.red,
      critical: chalk.red.bold
    };
    return colors[riskLevel] ? colors[riskLevel](riskLevel.toUpperCase()) : riskLevel;
  }

  async generateHtmlReport(report) {
    // Generate comprehensive HTML report with charts and interactivity
    return `<!DOCTYPE html>
<html>
<head>
    <title>Impact Analysis Report - ${report.targetComponent.path}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .risk-${report.summary.overallRisk} { color: ${this.getRiskColor(report.summary.overallRisk)}; }
        .component-list { margin: 10px 0; }
        .component-item { padding: 5px; margin: 2px 0; border-left: 3px solid #ccc; }
        .chart-container { margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Impact Analysis Report</h1>
    <h2>Target: ${report.targetComponent.path}</h2>
    <p><strong>Risk Level:</strong> <span class="risk-${report.summary.overallRisk}">${report.summary.overallRisk.toUpperCase()}</span></p>
    <p><strong>Affected Components:</strong> ${report.summary.affectedComponents}</p>
    <p><strong>Analysis Date:</strong> ${report.timestamp}</p>
    
    <h3>Dependency Impact</h3>
    <div class="component-list">
        ${report.dependencyAnalysis.affectedComponents.map(comp => 
          `<div class="component-item">
             <strong>${comp.path}</strong> (Impact: ${comp.impactScore}/10)
             <br><small>${comp.reason}</small>
           </div>`
        ).join('')}
    </div>
    
    <h3>Risk Assessment</h3>
    <ul>
        ${report.riskAssessment.recommendations.map(rec => 
          `<li><strong>${rec.title}</strong><br>${rec.description}</li>`
        ).join('')}
    </ul>
</body>
</html>`;
  }

  async generateTextReport(report) {
    return `
IMPACT ANALYSIS REPORT
=====================

Target Component: ${report.targetComponent.path}
Modification Type: ${report.modificationType}
Analysis Depth: ${report.analysisDepth}
Risk Level: ${report.summary.overallRisk.toUpperCase()}
Analysis Date: ${report.timestamp}

SUMMARY
-------
Affected Components: ${report.summary.affectedComponents}
Propagation Depth: ${report.summary.propagationDepth}
Critical Issues: ${report.summary.criticalIssues}
Recommendations: ${report.summary.recommendations}

AFFECTED COMPONENTS
------------------
${report.dependencyAnalysis.affectedComponents.map(comp => 
  `- ${comp.path} (Impact: ${comp.impactScore}/10)
    Reason: ${comp.reason}`
).join('\\n')}

RECOMMENDATIONS
--------------
${report.riskAssessment.recommendations.map((rec, index) => 
  `${index + 1}. ${rec.title}
     ${rec.description}`
).join('\\n\\n')}

RISK FACTORS
-----------
${report.riskAssessment.riskFactors.map(factor => 
  `- ${factor.type}: ${factor.description} (Severity: ${factor.severity})`
).join('\\n')}
`;
  }

  getRiskColor(riskLevel) {
    const colors = {
      low: '#28a745',
      medium: '#ffc107', 
      high: '#dc3545',
      critical: '#721c24'
    };
    return colors[riskLevel] || '#6c757d';
  }
}

module.exports = AnalyzeImpactTask;
```

## Validation Rules

### Input Validation
- Modification type must be valid (modify, deprecate, remove, refactor)
- Component path must exist and be accessible
- Analysis depth must be recognized level
- Risk threshold must be valid level

### Safety Checks
- High-risk modifications require approval workflow
- Critical modifications generate detailed warnings
- External dependency analysis can be excluded for security
- Report generation validates output paths

### Analysis Requirements
- Dependency analysis must trace all connections
- Risk assessment must consider modification type
- Propagation prediction must respect analysis depth
- Visual representation must be accessible

## Integration Points

### Dependency Impact Analyzer
- Analyzes component dependencies and reverse dependencies
- Calculates impact scores for affected components
- Traces dependency chains to specified depth
- Identifies breaking change potential

### Change Propagation Predictor
- Predicts how changes will propagate through the system
- Models cascading effects of modifications
- Estimates propagation depth and scope
- Identifies potential bottlenecks and failure points

### Risk Assessment System
- Evaluates modification risks across multiple dimensions
- Considers component criticality and usage patterns
- Generates actionable recommendations
- Provides risk mitigation strategies

### Visual Impact Generator
- Creates visual representations of impact analysis
- Supports multiple output formats (ASCII, HTML, JSON)
- Generates interactive impact maps for complex scenarios
- Provides exportable reports and visualizations

### Approval Workflow
- Manages approval process for high-risk modifications
- Maintains audit trail of approval decisions
- Integrates with user approval prompts
- Supports automated approval rules for trusted scenarios

## Output Structure

### Success Response
```json
{
  "success": true,
  "targetComponent": "aios-core/agents/weather-agent.md",
  "riskLevel": "medium",
  "affectedComponents": 12,
  "propagationDepth": 3,
  "requiresApproval": false,
  "impactReport": {
    "summary": { ... },
    "dependencyAnalysis": { ... },
    "riskAssessment": { ... }
  }
}
```

### High-Risk Response
```json
{
  "success": true,
  "requiresApproval": true,
  "riskLevel": "high",
  "impactSummary": {
    "criticalIssues": 3,
    "affectedComponents": 25,
    "recommendations": 8
  }
}
```

## Security Considerations
- Validate all file paths to prevent directory traversal
- Sanitize component paths and modification descriptions
- Ensure approval workflow cannot be bypassed for critical changes
- Validate output file paths for report generation
- Log all high-risk modification attempts for audit

## Handoff
next_agent: @analyst
next_command: *research {topic}
condition: Complexity class is STANDARD or COMPLEX (research needed)
alternatives:
  - agent: @pm, command: *write-spec, condition: Complexity class is SIMPLE (skip research) 