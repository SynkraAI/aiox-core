/**
 * Notification Manager
 *
 * Manages notifications for human review orchestration:
 * - Review request notifications
 * - Blocking notifications
 * - Review completion notifications
 *
 * @module core/quality-gates/notification-manager
 * @version 1.0.0
 * @story 3.5 - Human Review Orchestration (Layer 3)
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Notification Manager
 * Handles all notification-related functionality
 */
class NotificationManager {
  /**
   * Create a new notification manager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = config;
    this.notificationsPath = config.notificationsPath || '.aiox/notifications';
    this.channels = config.channels || ['console', 'file'];
    this.templates = this.loadTemplates();
    // Save queue for serializing concurrent writes to history file
    this.saveQueue = Promise.resolve();
  }

  /**
   * Load notification templates
   * @returns {Object} Template definitions
   */
  loadTemplates() {
    return {
      reviewRequest: {
        subject: '🔍 Human Review Required',
        priority: 'normal',
        format: 'markdown',
      },
      blocked: {
        subject: '🚫 Review Blocked - Fix Required',
        priority: 'high',
        format: 'markdown',
      },
      approved: {
        subject: '✅ Review Approved',
        priority: 'normal',
        format: 'markdown',
      },
      changesRequested: {
        subject: '📝 Changes Requested',
        priority: 'high',
        format: 'markdown',
      },
      reminder: {
        subject: '⏰ Review Reminder',
        priority: 'normal',
        format: 'markdown',
      },
    };
  }

  /**
   * Send review request notification
   * @param {Object} reviewRequest - Review request object
   * @returns {Promise<Object>} Notification result
   */
  async sendReviewRequest(reviewRequest) {
    const notification = {
      id: this.generateNotificationId(),
      type: 'review_request',
      template: 'reviewRequest',
      timestamp: new Date().toISOString(),
      recipient: reviewRequest.reviewer,
      subject: this.templates.reviewRequest.subject,
      content: this.formatReviewRequestContent(reviewRequest),
      metadata: {
        requestId: reviewRequest.id,
        estimatedTime: reviewRequest.estimatedTime,
        focusAreas: reviewRequest.focusAreas?.primary?.map((f) => f.area) || [],
      },
      status: 'sent',
    };

    // Send through enabled channels
    const results = await this.sendThroughChannels(notification);

    // Save notification record
    await this.saveNotification(notification);

    return {
      success: true,
      notificationId: notification.id,
      channels: results,
    };
  }

  /**
   * Send blocking notification
   * @param {Object} blockResult - Block result from orchestrator
   * @returns {Promise<Object>} Notification result
   */
  async sendBlockingNotification(blockResult) {
    const notification = {
      id: this.generateNotificationId(),
      type: 'blocked',
      template: 'blocked',
      timestamp: new Date().toISOString(),
      recipient: '@dev', // Notify developer to fix
      subject: this.templates.blocked.subject,
      content: this.formatBlockingContent(blockResult),
      metadata: {
        stoppedAt: blockResult.stoppedAt,
        issues: blockResult.issues?.length || 0,
        fixRecommendations: blockResult.fixFirst?.length || 0,
      },
      status: 'sent',
    };

    const results = await this.sendThroughChannels(notification);
    await this.saveNotification(notification);

    return {
      success: true,
      notificationId: notification.id,
      channels: results,
    };
  }

  /**
   * Send review completion notification
   * @param {Object} completedRequest - Completed review request
   * @returns {Promise<Object>} Notification result
   */
  async sendCompletionNotification(completedRequest) {
    const isApproved = completedRequest.status === 'approved';
    const template = isApproved ? 'approved' : 'changesRequested';

    const notification = {
      id: this.generateNotificationId(),
      type: completedRequest.status,
      template,
      timestamp: new Date().toISOString(),
      recipient: '@dev',
      subject: this.templates[template].subject,
      content: this.formatCompletionContent(completedRequest),
      metadata: {
        requestId: completedRequest.id,
        reviewer: completedRequest.reviewer,
        approved: isApproved,
      },
      status: 'sent',
    };

    const results = await this.sendThroughChannels(notification);
    await this.saveNotification(notification);

    return {
      success: true,
      notificationId: notification.id,
      channels: results,
    };
  }

  /**
   * Send review reminder
   * @param {Object} reviewRequest - Pending review request
   * @returns {Promise<Object>} Notification result
   */
  async sendReminder(reviewRequest) {
    const notification = {
      id: this.generateNotificationId(),
      type: 'reminder',
      template: 'reminder',
      timestamp: new Date().toISOString(),
      recipient: reviewRequest.reviewer,
      subject: this.templates.reminder.subject,
      content: this.formatReminderContent(reviewRequest),
      metadata: {
        requestId: reviewRequest.id,
        createdAt: reviewRequest.createdAt,
        expiresAt: reviewRequest.expiresAt,
      },
      status: 'sent',
    };

    const results = await this.sendThroughChannels(notification);
    await this.saveNotification(notification);

    return {
      success: true,
      notificationId: notification.id,
      channels: results,
    };
  }

  /**
   * Format review request content
   * @param {Object} reviewRequest - Review request
   * @returns {string} Formatted content
   */
  formatReviewRequestContent(reviewRequest) {
    const lines = [
      '# Human Review Required',
      '',
      `**Review ID:** ${reviewRequest.id}`,
      `**Assigned To:** ${reviewRequest.reviewer}`,
      `**Estimated Time:** ~${reviewRequest.estimatedTime} minutes`,
      `**Expires:** ${reviewRequest.expiresAt}`,
      '',
      '## Automated Review Summary',
      '',
      'Layers 1+2 have **passed** all automated checks.',
      '',
    ];

    // Add Layer 1 summary
    if (reviewRequest.automatedSummary?.layer1) {
      lines.push('### Layer 1: Pre-commit');
      reviewRequest.automatedSummary.layer1.checks.forEach((c) => {
        const icon = c.status === 'passed' ? '✅' : (c.status === 'skipped' ? '⏭️' : '❌');
        lines.push(`- ${icon} ${c.check}: ${c.message}`);
      });
      lines.push('');
    }

    // Add Layer 2 summary
    if (reviewRequest.automatedSummary?.layer2) {
      lines.push('### Layer 2: PR Automation');
      if (reviewRequest.automatedSummary.layer2.coderabbit) {
        const cr = reviewRequest.automatedSummary.layer2.coderabbit;
        lines.push(`- 🐰 CodeRabbit: ${cr.issues.critical} CRITICAL, ${cr.issues.high} HIGH, ${cr.issues.medium} MEDIUM`);
      }
      if (reviewRequest.automatedSummary.layer2.quinn) {
        const q = reviewRequest.automatedSummary.layer2.quinn;
        lines.push(`- 🧪 Quinn: ${q.suggestions} suggestions, ${q.blocking} blocking`);
      }
      lines.push('');
    }

    // Add focus areas
    lines.push('## Focus Areas (Strategic Review Only)');
    lines.push('');
    lines.push(`**You can skip:** ${reviewRequest.skipAreas.join(', ')}`);
    lines.push('');

    if (reviewRequest.focusAreas?.primary?.length > 0) {
      lines.push('### Primary Focus');
      reviewRequest.focusAreas.primary.forEach((area) => {
        lines.push(`#### ${area.area.charAt(0).toUpperCase() + area.area.slice(1)}`);
        lines.push(`> ${area.reason}`);
        if (area.questions?.length > 0) {
          lines.push('**Key questions:**');
          area.questions.forEach((q) => lines.push(`- [ ] ${q}`));
        }
        lines.push('');
      });
    }

    if (reviewRequest.focusAreas?.secondary?.length > 0) {
      lines.push('### Secondary Focus');
      reviewRequest.focusAreas.secondary.forEach((area) => {
        lines.push(`- **${area.area}:** ${area.reason}`);
      });
      lines.push('');
    }

    lines.push('---');
    lines.push('_Respond with approval or request changes._');

    return lines.join('\n');
  }

  /**
   * Format blocking content
   * @param {Object} blockResult - Block result
   * @returns {string} Formatted content
   */
  formatBlockingContent(blockResult) {
    const lines = [
      '# 🚫 Human Review Blocked',
      '',
      `**Stopped At:** ${blockResult.stoppedAt}`,
      `**Reason:** ${blockResult.reason}`,
      '',
      '## Issues to Fix',
      '',
    ];

    if (blockResult.issues?.length > 0) {
      blockResult.issues.forEach((issue) => {
        lines.push(`### ${issue.severity}: ${issue.check}`);
        lines.push(`${issue.message}`);
        lines.push('');
      });
    }

    if (blockResult.fixFirst?.length > 0) {
      lines.push('## How to Fix');
      lines.push('');
      blockResult.fixFirst.forEach((rec, idx) => {
        lines.push(`${idx + 1}. **${rec.issue}**`);
        lines.push(`   → ${rec.suggestion}`);
        lines.push('');
      });
    }

    lines.push('---');
    lines.push('_Fix these issues and re-run the quality gate pipeline._');

    return lines.join('\n');
  }

  /**
   * Format completion content
   * @param {Object} completedRequest - Completed request
   * @returns {string} Formatted content
   */
  formatCompletionContent(completedRequest) {
    const isApproved = completedRequest.status === 'approved';
    const icon = isApproved ? '✅' : '📝';
    const title = isApproved ? 'Review Approved' : 'Changes Requested';

    const lines = [
      `# ${icon} ${title}`,
      '',
      `**Review ID:** ${completedRequest.id}`,
      `**Reviewer:** ${completedRequest.reviewer}`,
      `**Completed At:** ${completedRequest.completedAt}`,
      `**Time Spent:** ${completedRequest.actualTime || 'Not recorded'} minutes`,
      '',
    ];

    if (completedRequest.reviewResult) {
      if (completedRequest.reviewResult.comments) {
        lines.push('## Reviewer Comments');
        lines.push('');
        lines.push(completedRequest.reviewResult.comments);
        lines.push('');
      }

      if (!isApproved && completedRequest.reviewResult.requestedChanges?.length > 0) {
        lines.push('## Requested Changes');
        lines.push('');
        completedRequest.reviewResult.requestedChanges.forEach((change, idx) => {
          lines.push(`${idx + 1}. ${change}`);
        });
        lines.push('');
      }
    }

    if (isApproved) {
      lines.push('---');
      lines.push('_This change is approved for merge. Proceed with @github-devops._');
    } else {
      lines.push('---');
      lines.push('_Address the requested changes and re-submit for review._');
    }

    return lines.join('\n');
  }

  /**
   * Format reminder content
   * @param {Object} reviewRequest - Pending request
   * @returns {string} Formatted content
   */
  formatReminderContent(reviewRequest) {
    const createdAt = new Date(reviewRequest.createdAt);
    const now = new Date();
    const hoursPending = Math.round((now - createdAt) / (1000 * 60 * 60));

    return [
      '# ⏰ Review Reminder',
      '',
      `**Review ID:** ${reviewRequest.id}`,
      `**Pending For:** ${hoursPending} hours`,
      `**Estimated Time:** ~${reviewRequest.estimatedTime} minutes`,
      '',
      'A human review has been waiting for your attention.',
      '',
      `**Focus Areas:** ${reviewRequest.focusAreas?.primary?.map((f) => f.area).join(', ') || 'General review'}`,
      '',
      '---',
      '_Please complete this review at your earliest convenience._',
    ].join('\n');
  }

  /**
   * Send notification through enabled channels
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} Channel results
   */
  async sendThroughChannels(notification) {
    const results = {};

    for (const channel of this.channels) {
      try {
        switch (channel) {
          case 'console':
            results[channel] = await this.sendToConsole(notification);
            break;
          case 'file':
            results[channel] = await this.sendToFile(notification);
            break;
          default:
            results[channel] = { success: false, error: 'Unknown channel' };
        }
      } catch (error) {
        results[channel] = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * Send notification to console
   * @param {Object} notification - Notification
   * @returns {Object} Result
   */
  async sendToConsole(notification) {
    console.log('\n' + '═'.repeat(60));
    console.log(`📬 ${notification.subject}`);
    console.log('═'.repeat(60));
    console.log(`To: ${notification.recipient}`);
    console.log(`Time: ${notification.timestamp}`);
    console.log('─'.repeat(60));
    console.log(notification.content);
    console.log('═'.repeat(60) + '\n');

    return { success: true };
  }

  /**
   * Send notification to file
   * @param {Object} notification - Notification
   * @returns {Promise<Object>} Result
   */
  async sendToFile(notification) {
    const notificationDir = this.notificationsPath;
    const filePath = path.join(notificationDir, `${notification.id}.md`);

    const content = [
      '---',
      `id: ${notification.id}`,
      `type: ${notification.type}`,
      `recipient: ${notification.recipient}`,
      `timestamp: ${notification.timestamp}`,
      `status: ${notification.status}`,
      '---',
      '',
      notification.content,
    ].join('\n');

    await fs.mkdir(notificationDir, { recursive: true });
    await fs.writeFile(filePath, content);

    return { success: true, path: filePath };
  }

  /**
   * Save notification to history (thread-safe via queue)
   * @param {Object} notification - Notification
   * @returns {Promise<void>}
   */
  async saveNotification(notification) {
    // Chain the save operation onto the queue to serialize concurrent writes
    this.saveQueue = this.saveQueue.then(async () => {
      const historyPath = path.join(this.notificationsPath, 'history.json');

      let history = [];
      try {
        const content = await fs.readFile(historyPath, 'utf8');
        history = JSON.parse(content);
      } catch {
        // No history file
      }

      history.push({
        id: notification.id,
        type: notification.type,
        recipient: notification.recipient,
        timestamp: notification.timestamp,
        status: notification.status,
      });

      // Keep only last 100 notifications
      if (history.length > 100) {
        history = history.slice(-100);
      }

      await fs.mkdir(this.notificationsPath, { recursive: true });
      await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    }).catch((err) => {
      // Log but don't break the queue for future saves
      console.error('Failed to save notification to history:', err.message);
    });

    // Wait for this save to complete
    await this.saveQueue;
  }

  /**
   * Generate unique notification ID
   * @returns {string} Notification ID
   */
  generateNotificationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `notif-${timestamp}-${random}`;
  }

  /**
   * Get notification history
   * @param {Object} filter - Filter options
   * @returns {Promise<Array>} Notification history
   */
  async getHistory(filter = {}) {
    const historyPath = path.join(this.notificationsPath, 'history.json');

    try {
      const content = await fs.readFile(historyPath, 'utf8');
      let history = JSON.parse(content);

      if (filter.type) {
        history = history.filter((n) => n.type === filter.type);
      }
      if (filter.recipient) {
        history = history.filter((n) => n.recipient === filter.recipient);
      }
      if (filter.since) {
        const sinceTime = new Date(filter.since).getTime();
        history = history.filter((n) => new Date(n.timestamp).getTime() >= sinceTime);
      }

      return history;
    } catch {
      return [];
    }
  }
}

module.exports = { NotificationManager };
