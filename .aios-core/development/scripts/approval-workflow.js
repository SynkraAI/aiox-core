const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Approval workflow for AIOS-FULLSTACK framework
 * Manages approval process for high-impact modifications
 */
class ApprovalWorkflow {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.approvalThresholds = {
      low: { auto_approve: true, requires_review: false },
      medium: { auto_approve: false, requires_review: true },
      high: { auto_approve: false, requires_review: true, requires_approval: true },
      critical: { auto_approve: false, requires_review: true, requires_approval: true, requires_multiple_approvers: true }
    };
    this.approvalHistory = [];
    this.pendingApprovals = new Map();
    this.approvalRules = new Map();
    this.initializeApprovalRules();
  }

  /**
   * Initialize default approval rules
   */
  initializeApprovalRules() {
    // Component type rules
    this.approvalRules.set('agent_modification', {
      risk_threshold: 'medium',
      required_approvers: 1,
      timeout_hours: 24,
      auto_approve_conditions: ['low_risk', 'has_tests', 'non_breaking']
    });

    this.approvalRules.set('workflow_modification', {
      risk_threshold: 'medium', 
      required_approvers: 1,
      timeout_hours: 48,
      auto_approve_conditions: ['low_risk', 'has_tests']
    });

    this.approvalRules.set('core_util_modification', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 72,
      auto_approve_conditions: ['minimal_risk', 'comprehensive_tests']
    });

    // Modification type rules
    this.approvalRules.set('component_removal', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 168, // 1 week
      auto_approve_conditions: [] // Never auto-approve removals
    });

    this.approvalRules.set('breaking_change', {
      risk_threshold: 'low',
      required_approvers: 2,
      timeout_hours: 96,
      auto_approve_conditions: []
    });
  }

  /**
   * Process approval request for impact report
   */
  async processApprovalRequest(impactReport, options = {}) {
    const requestId = `approval-${Date.now()}`;
    
    try {
      console.log(chalk.blue(`🔍 Processing approval request for: ${impactReport.targetComponent.path}`));
      
      const _config = {
        skip_approval: options.skip_approval || false,
        auto_approve_low_risk: options.auto_approve_low_risk !== false,
        timeout_hours: options.timeout_hours || 24,
        required_approvers: options.required_approvers,
        ...options
      };

      // Determine approval requirements
      const approvalRequirements = await this.determineApprovalRequirements(impactReport, config);
      
      // Check if modification can be auto-approved
      const autoApprovalResult = await this.checkAutoApproval(impactReport, approvalRequirements);
      
      if (autoApprovalResult.can_auto_approve) {
        const approvalResult = await this.executeAutoApproval(impactReport, autoApprovalResult, requestId);
        return approvalResult;
      }

      // Manual approval required
      const approvalResult = await this.executeManualApproval(
        impactReport, 
        approvalRequirements, 
        config, 
        requestId
      );

      return approvalResult;

    } catch (_error) {
      console.error(chalk.red(`Approval process failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Determine approval requirements based on impact analysis
   */
  async determineApprovalRequirements(impactReport, config) {
    const requirements = {
      approval_needed: false,
      risk_level: impactReport.riskAssessment.overallRisk,
      risk_score: impactReport.riskAssessment.riskScore,
      required_approvers: 1,
      timeout_hours: 24,
      review_criteria: [],
      blocking_issues: []
    };

    const riskLevel = impactReport.riskAssessment.overallRisk;
    const thresholds = this.approvalThresholds[riskLevel];

    // Basic approval requirements from risk level
    if (thresholds) {
      requirements.approval_needed = !thresholds.auto_approve;
      requirements.requires_review = thresholds.requires_review;
      requirements.requires_approval = thresholds.requires_approval;
      requirements.requires_multiple_approvers = thresholds.requires_multiple_approvers;
    }

    // Component-specific rules
    const componentRule = this.getComponentApprovalRule(impactReport.targetComponent);
    if (componentRule) {
      requirements.required_approvers = Math.max(requirements.required_approvers, componentRule.required_approvers);
      requirements.timeout_hours = Math.max(requirements.timeout_hours, componentRule.timeout_hours);
    }

    // Modification-specific rules
    const modificationRule = this.getModificationApprovalRule(impactReport.modificationType);
    if (modificationRule) {
      requirements.required_approvers = Math.max(requirements.required_approvers, modificationRule.required_approvers);
      requirements.timeout_hours = Math.max(requirements.timeout_hours, modificationRule.timeout_hours);
    }

    // Critical issues that block auto-approval
    if (impactReport.riskAssessment.criticalIssues.length > 0) {
      requirements.approval_needed = true;
      requirements.blocking_issues = impactReport.riskAssessment.criticalIssues.map(issue => issue.description);
    }

    // High-impact propagation
    if (impactReport.propagationAnalysis.criticalPaths?.length > 2) {
      requirements.approval_needed = true;
      requirements.review_criteria.push('Multiple critical propagation paths require review');
    }

    // Many affected components
    if (impactReport.summary.affectedComponents > 20) {
      requirements.approval_needed = true;
      requirements.review_criteria.push('Large number of affected components requires careful review');
    }

    // Breaking changes
    const hasBreakingChanges = impactReport.propagationAnalysis.directEffects?.some(
      effect => effect.changeType?.severity === 'breaking'
    ) || false;

    if (hasBreakingChanges) {
      requirements.approval_needed = true;
      requirements.required_approvers = Math.max(requirements.required_approvers, 2);
      requirements.review_criteria.push('Breaking changes require multiple approvers');
    }

    // Security-sensitive modifications
    if (impactReport.riskAssessment.riskDimensions?.security_risk?.score >= 6) {
      requirements.approval_needed = true;
      requirements.review_criteria.push('Security-sensitive modification requires approval');
    }

    return requirements;
  }

  /**
   * Check if modification can be auto-approved
   */
  async checkAutoApproval(impactReport, requirements) {
    const result = {
      can_auto_approve: false,
      reasons: [],
      conditions_met: [],
      conditions_failed: []
    };

    // Never auto-approve if manual approval is explicitly needed
    if (requirements.approval_needed) {
      result.reasons.push('Manual approval explicitly required due to risk level or critical issues');
      return result;
    }

    // Never auto-approve critical risk modifications
    if (impactReport.riskAssessment.overallRisk === 'critical') {
      result.reasons.push('Critical risk level requires manual approval');
      return result;
    }

    // Never auto-approve component removals
    if (impactReport.modificationType === 'remove') {
      result.reasons.push('Component removal always requires manual approval');
      return result;
    }

    // Check auto-approval conditions
    const autoApprovalConditions = await this.evaluateAutoApprovalConditions(impactReport);
    
    if (autoApprovalConditions.all_conditions_met) {
      result.can_auto_approve = true;
      result.conditions_met = autoApprovalConditions.met_conditions;
      result.reasons.push('All auto-approval conditions satisfied');
    } else {
      result.conditions_failed = autoApprovalConditions.failed_conditions;
      result.reasons.push('Auto-approval conditions not met');
    }

    return result;
  }

  /**
   * Evaluate auto-approval conditions
   */
  async evaluateAutoApprovalConditions(impactReport) {
    const conditions = {
      low_risk: impactReport.riskAssessment.overallRisk === 'low',
      minimal_impact: impactReport.summary.affectedComponents <= 5,
      no_critical_issues: impactReport.riskAssessment.criticalIssues.length === 0,
      no_breaking_changes: !this.hasBreakingChanges(impactReport),
      has_tests: await this.componentHasTests(impactReport.targetComponent),
      small_change: this.isSmallChange(impactReport),
      no_security_risk: impactReport.riskAssessment.riskDimensions?.security_risk?.score < 5
    };

    const metConditions = Object.entries(conditions)
      .filter(([condition, met]) => met)
      .map(([condition]) => condition);

    const failedConditions = Object.entries(conditions)
      .filter(([condition, met]) => !met)
      .map(([condition]) => condition);

    // Require at least 5 out of 7 conditions for auto-approval
    const requiredConditions = 5;
    const allConditionsMet = metConditions.length >= requiredConditions;

    return {
      all_conditions_met: allConditionsMet,
      met_conditions: metConditions,
      failed_conditions: failedConditions,
      condition_score: `${metConditions.length}/${Object.keys(conditions).length}`
    };
  }

  /**
   * Execute auto-approval
   */
  async executeAutoApproval(impactReport, autoApprovalResult, requestId) {
    const approval = {
      request_id: requestId,
      target_component: impactReport.targetComponent.path,
      modification_type: impactReport.modificationType,
      approval_status: 'auto_approved',
      approval_type: 'automatic',
      risk_level: impactReport.riskAssessment.overallRisk,
      auto_approval_reasons: autoApprovalResult.reasons,
      conditions_met: autoApprovalResult.conditions_met,
      approved_by: 'system_auto_approval',
      approved_at: new Date().toISOString(),
      valid_until: this.calculateExpirationTime(24), // Auto-approvals valid for 24 hours
      metadata: {
        impact_summary: impactReport.summary,
        approval_confidence: this.calculateApprovalConfidence(autoApprovalResult)
      }
    };

    // Log approval
    await this.logApproval(approval);

    console.log(chalk.green(`✅ Auto-approved: ${impactReport.targetComponent.path}`));
    console.log(chalk.gray(`   Risk level: ${impactReport.riskAssessment.overallRisk}`));
    console.log(chalk.gray(`   Conditions met: ${autoApprovalResult.conditions_met.length}`));

    return approval;
  }

  /**
   * Execute manual approval process
   */
  async executeManualApproval(impactReport, requirements, config, requestId) {
    console.log(chalk.yellow(`\n⚠️  MANUAL APPROVAL REQUIRED`));
    console.log(chalk.gray(`Component: ${impactReport.targetComponent.path}`));
    console.log(chalk.gray(`Risk Level: ${impactReport.riskAssessment.overallRisk.toUpperCase()}`));
    console.log(chalk.gray(`Affected Components: ${impactReport.summary.affectedComponents}`));
    
    if (requirements.blocking_issues.length > 0) {
      console.log(chalk.red(`\nBlocking Issues:`));
      requirements.blocking_issues.forEach((issue, index) => {
        console.log(chalk.red(`  ${index + 1}. ${issue}`));
      });
    }

    if (requirements.review_criteria.length > 0) {
      console.log(chalk.yellow(`\nReview Criteria:`));
      requirements.review_criteria.forEach((criteria, index) => {
        console.log(chalk.yellow(`  ${index + 1}. ${criteria}`));
      });
    }

    // Display key recommendations
    if (impactReport.riskAssessment.recommendations.length > 0) {
      console.log(chalk.blue(`\nKey Recommendations:`));
      impactReport.riskAssessment.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(chalk.blue(`  ${index + 1}. ${rec.title}`));
        console.log(chalk.gray(`     ${rec.description}`));
      });
    }

    // Approval prompt
    const approvalQuestions = await this.buildApprovalQuestions(impactReport, requirements);
    const approvalAnswers = await inquirer.prompt(approvalQuestions);

    const approval = {
      request_id: requestId,
      target_component: impactReport.targetComponent.path,
      modification_type: impactReport.modificationType,
      approval_status: approvalAnswers.approved ? 'approved' : 'rejected',
      approval_type: 'manual',
      risk_level: impactReport.riskAssessment.overallRisk,
      approved_by: approvalAnswers.approver_name || 'user',
      approved_at: new Date().toISOString(),
      approval_reason: approvalAnswers.approval_reason,
      conditions_acknowledged: approvalAnswers.conditions_acknowledged || false,
      valid_until: this.calculateExpirationTime(requirements.timeout_hours),
      requirements_met: requirements,
      metadata: {
        impact_summary: impactReport.summary,
        approval_answers: approvalAnswers
      }
    };

    // Add approval conditions if approved
    if (approvalAnswers.approved) {
      approval.approval_conditions = approvalAnswers.approval_conditions;
      approval.monitoring_required = approvalAnswers.monitoring_required || false;
      approval.rollback_plan_required = approvalAnswers.rollback_plan || false;
    } else {
      approval.rejection_reason = approvalAnswers.rejection_reason;
      approval.recommended_actions = approvalAnswers.recommended_actions;
    }

    // Log approval decision
    await this.logApproval(approval);

    if (approvalAnswers.approved) {
      console.log(chalk.green(`\n✅ Manual approval granted`));
      console.log(chalk.gray(`   Approved by: ${approval.approved_by}`));
      console.log(chalk.gray(`   Valid until: ${new Date(approval.valid_until).toLocaleString()}`));
      
      if (approval.approval_conditions) {
        console.log(chalk.blue(`   Conditions: ${approval.approval_conditions}`));
      }
    } else {
      console.log(chalk.red(`\n❌ Approval rejected`));
      console.log(chalk.gray(`   Reason: ${approval.rejection_reason}`));
    }

    return approval;
  }

  /**
   * Build approval question flow
   */
  async buildApprovalQuestions(impactReport, requirements) {
    const questions = [];

    // Main approval question
    questions.push({
      type: 'confirm',
      name: 'approved',
      message: `Approve ${impactReport.modificationType} of ${impactReport.targetComponent.path}?`,
      default: false
    });

    // Conditional questions based on approval
    questions.push({
      type: 'input',
      name: 'approver_name',
      message: 'Enter your name/identifier:',
      when: (answers) => answers.approved,
      validate: (input) => input.length > 0 || 'Name is required'
    });

    questions.push({
      type: 'input',
      name: 'approval_reason',
      message: 'Reason for approval:',
      when: (answers) => answers.approved,
      default: 'Impact analysis reviewed and acceptable'
    });

    // High-risk additional questions
    if (requirements.risk_level === 'high' || requirements.risk_level === 'critical') {
      questions.push({
        type: 'confirm',
        name: 'conditions_acknowledged',
        message: 'Do you acknowledge all risk factors and recommendations?',
        when: (answers) => answers.approved,
        default: false
      });

      questions.push({
        type: 'input',
        name: 'approval_conditions',
        message: 'Enter any approval conditions or requirements:',
        when: (answers) => answers.approved && answers.conditions_acknowledged,
        default: 'Standard monitoring and rollback procedures apply'
      });

      questions.push({
        type: 'confirm',
        name: 'monitoring_required',
        message: 'Require enhanced monitoring after deployment?',
        when: (answers) => answers.approved,
        default: true
      });

      questions.push({
        type: 'confirm',
        name: 'rollback_plan',
        message: 'Require documented rollback plan?',
        when: (answers) => answers.approved,
        default: true
      });
    }

    // Rejection questions
    questions.push({
      type: 'input',
      name: 'rejection_reason',
      message: 'Reason for rejection:',
      when: (answers) => !answers.approved,
      validate: (input) => input.length > 0 || 'Rejection reason is required'
    });

    questions.push({
      type: 'input',
      name: 'recommended_actions', 
      message: 'Recommended actions before resubmission:',
      when: (answers) => !answers.approved,
      default: 'Address critical issues and reduce risk factors'
    });

    return questions;
  }

  /**
   * Log approval decision for audit trail
   */
  async logApproval(approval) {
    // Add to approval history
    this.approvalHistory.push({
      request_id: approval.request_id,
      component: approval.target_component,
      status: approval.approval_status,
      risk_level: approval.risk_level,
      approved_by: approval.approved_by,
      timestamp: approval.approved_at
    });

    // Write to audit log file
    try {
      const logDir = path.join(this.rootPath, '.aios', 'audit');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFile = path.join(logDir, 'approval_log.jsonl');
      const logEntry = JSON.stringify(approval) + '\n';
      
      await fs.appendFile(logFile, logEntry);
      
      console.log(chalk.gray(`   Approval logged to audit trail`));

    } catch (_error) {
      console.warn(chalk.yellow(`Failed to write approval log: ${error.message}`));
    }
  }

  // Helper methods

  getComponentApprovalRule(component) {
    if (component.type === 'agent') {
      return this.approvalRules.get('agent_modification');
    } else if (component.type === 'workflow') {
      return this.approvalRules.get('workflow_modification');
    } else if (component.type === 'util' && component.path.includes('core')) {
      return this.approvalRules.get('core_util_modification');
    }
    return null;
  }

  getModificationApprovalRule(modificationType) {
    if (modificationType === 'remove') {
      return this.approvalRules.get('component_removal');
    }
    return null;
  }

  hasBreakingChanges(impactReport) {
    return impactReport.propagationAnalysis.directEffects?.some(
      effect => effect.changeType?.severity === 'breaking'
    ) || false;
  }

  async componentHasTests(component) {
    const testPaths = [
      path.join(this.rootPath, 'tests', 'unit', component.type, `${component.name}.test.js`),
      path.join(this.rootPath, 'tests', 'integration', component.type, `${component.name}.integration.test.js`),
      path.join(this.rootPath, 'test', `${component.name}.test.js`)
    ];

    for (const testPath of testPaths) {
      try {
        await fs.access(testPath);
        return true;
      } catch (_error) {
        // File doesn't exist, continue
      }
    }

    return false;
  }

  isSmallChange(impactReport) {
    return impactReport.summary.affectedComponents <= 3 && 
           impactReport.summary.propagationDepth <= 2;
  }

  calculateExpirationTime(hours) {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toISOString();
  }

  calculateApprovalConfidence(autoApprovalResult) {
    const conditionsMet = autoApprovalResult.conditions_met.length;
    const totalConditions = 7; // Based on evaluateAutoApprovalConditions
    return Math.round((conditionsMet / totalConditions) * 100);
  }

  /**
   * Check if approval is still valid
   */
  isApprovalValid(approval) {
    const now = new Date();
    const validUntil = new Date(approval.valid_until);
    return now < validUntil;
  }

  /**
   * Get approval history
   */
  getApprovalHistory(options = {}) {
    const history = {
      total_approvals: this.approvalHistory.length,
      approval_stats: this.calculateApprovalStats(),
      recent_approvals: this.approvalHistory.slice(-10)
    };

    if (options.component) {
      history.component_approvals = this.approvalHistory.filter(
        approval => approval.component === options.component
      );
    }

    if (options.risk_level) {
      history.risk_level_approvals = this.approvalHistory.filter(
        approval => approval.risk_level === options.risk_level
      );
    }

    return history;
  }

  calculateApprovalStats() {
    const stats = {
      approved: 0,
      rejected: 0,
      auto_approved: 0,
      by_risk_level: { low: 0, medium: 0, high: 0, critical: 0 }
    };

    this.approvalHistory.forEach(approval => {
      if (approval.status === 'approved') stats.approved++;
      else if (approval.status === 'rejected') stats.rejected++;
      else if (approval.status === 'auto_approved') stats.auto_approved++;

      stats.by_risk_level[approval.risk_level]++;
    });

    return stats;
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals() {
    return Array.from(this.pendingApprovals.values());
  }

  /**
   * Clear expired approvals
   */
  clearExpiredApprovals() {
    const now = new Date();
    let clearedCount = 0;

    for (const [requestId, approval] of this.pendingApprovals) {
      if (new Date(approval.valid_until) < now) {
        this.pendingApprovals.delete(requestId);
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      console.log(chalk.gray(`Cleared ${clearedCount} expired approvals`));
    }

    return clearedCount;
  }
}

module.exports = ApprovalWorkflow;