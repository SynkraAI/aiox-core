/**
 * Decision Log Generator for AIOX Framework
 *
 * Generates decision logs for yolo mode execution to track autonomous
 * decisions, files modified, tests run, and rollback information.
 *
 * @module decision-log-generator
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Calculates duration between start and end time
 *
 * @param {Object} context - Execution context
 * @returns {string} Formatted duration string
 */
function calculateDuration(context) {
  if (!context.endTime) {
    const elapsed = Date.now() - context.startTime;
    return formatDuration(elapsed) + ' (in progress)';
  }

  const duration = context.endTime - context.startTime;
  return formatDuration(duration);
}

/**
 * Formats milliseconds into human-readable duration
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Generates markdown list of key decisions (ADR format - AC3, AC7)
 *
 * @param {Array} decisions - Array of decision objects
 * @returns {string} Formatted markdown list
 */
function generateDecisionsList(decisions) {
  if (!decisions || decisions.length === 0) {
    return '*No autonomous decisions recorded.*';
  }

  let markdown = '';
  decisions.forEach((decision, index) => {
    markdown += `### Decision ${index + 1}: ${decision.description}\n\n`;
    markdown += `**Timestamp:** ${new Date(decision.timestamp).toISOString()}\n\n`;

    // Decision classification (AC7)
    if (decision.type) {
      markdown += `**Type:** ${decision.type}\n\n`;
    }
    if (decision.priority) {
      markdown += `**Priority:** ${decision.priority}\n\n`;
    }

    markdown += `**Reason:** ${decision.reason}\n\n`;

    if (decision.alternatives && decision.alternatives.length > 0) {
      markdown += '**Alternatives Considered:**\n';
      decision.alternatives.forEach(alt => {
        markdown += `- ${alt}\n`;
      });
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Generates markdown list of files modified
 *
 * @param {Array} filesModified - Array of file paths
 * @returns {string} Formatted markdown list
 */
function generateFilesList(filesModified) {
  if (!filesModified || filesModified.length === 0) {
    return '*No files modified.*';
  }

  let markdown = '';
  filesModified.forEach(file => {
    const fileName = typeof file === 'string' ? file : file.path;
    const action = file.action || 'modified';
    markdown += `- \`${fileName}\` (${action})\n`;
  });

  return markdown;
}

/**
 * Generates markdown list of tests run
 *
 * @param {Array} testsRun - Array of test objects
 * @returns {string} Formatted markdown list
 */
function generateTestsList(testsRun) {
  if (!testsRun || testsRun.length === 0) {
    return '*No tests recorded.*';
  }

  let markdown = '';
  testsRun.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    markdown += `- ${status}: \`${test.name}\``;

    if (test.duration) {
      markdown += ` (${test.duration}ms)`;
    }

    if (!test.passed && test.error) {
      markdown += `\n  - Error: ${test.error}`;
    }

    markdown += '\n';
  });

  return markdown;
}

/**
 * Generates markdown list of files for rollback
 *
 * @param {Array} filesModified - Array of file paths
 * @returns {string} Formatted markdown list
 */
function generateRollbackFilesList(filesModified) {
  if (!filesModified || filesModified.length === 0) {
    return '*No files to rollback.*';
  }

  let markdown = '';
  filesModified.forEach(file => {
    const fileName = typeof file === 'string' ? file : file.path;
    markdown += `- ${fileName}\n`;
  });

  return markdown;
}

/**
 * Generates decision log for yolo mode execution
 *
 * @param {string} storyId - Story ID (e.g., "6.1.2.6")
 * @param {Object} context - Execution context
 * @param {string} context.agentId - Agent ID executing the story
 * @param {string} context.storyPath - Path to story file
 * @param {number} context.startTime - Start timestamp
 * @param {number} [context.endTime] - End timestamp
 * @param {string} context.status - Execution status
 * @param {Array} [context.decisions] - Array of decision objects
 * @param {Array} [context.filesModified] - Array of file paths modified
 * @param {Array} [context.testsRun] - Array of test results
 * @param {Object} [context.metrics] - Performance metrics
 * @param {string} [context.commitBefore] - Git commit hash before execution
 * @returns {Promise<string>} Path to decision log file
 */
async function generateDecisionLog(storyId, context) {
  // Ensure .ai directory exists
  const aiDir = '.ai';
  try {
    await fs.access(aiDir);
  } catch (_error) {
    await fs.mkdir(aiDir, { recursive: true });
  }

  const logPath = path.join(aiDir, `decision-log-${storyId}.md`);

  // Format timestamps
  const startTime = new Date(context.startTime).toISOString();
  const endTime = context.endTime ? new Date(context.endTime).toISOString() : 'In Progress';

  // ADR-compliant template structure (AC3)
  const template = `# Decision Log: Story ${storyId}

**Generated:** ${new Date().toISOString()}
**Agent:** ${context.agentId}
**Mode:** Yolo (Autonomous Development)
**Story:** ${context.storyPath}
**Rollback:** \`git reset --hard ${context.commitBefore || 'HEAD'}\`

---

## Context

**Story Implementation:** ${storyId}
**Execution Time:** ${calculateDuration(context)}
**Status:** ${context.status}
**Started:** ${startTime}
**Completed:** ${endTime}

**Files Modified:** ${context.filesModified?.length || 0} files
**Tests Run:** ${context.testsRun?.length || 0} tests
**Decisions Made:** ${context.decisions?.length || 0} autonomous decisions

---

## Decisions Made

${generateDecisionsList(context.decisions)}

---

## Rationale & Alternatives

The decisions above were made autonomously during yolo mode development. Each decision includes:
- The specific choice made (Decision)
- Why that choice was optimal (Reason)
- What other options were considered (Alternatives)
- Classification by type and priority (AC7)

---

## Implementation Changes

### Files Modified

${generateFilesList(context.filesModified)}

### Test Results

${generateTestsList(context.testsRun)}

---

## Consequences & Rollback

### Rollback Instructions

If you need to undo these changes:

\`\`\`bash
# Full rollback to state before execution
git reset --hard ${context.commitBefore || 'HEAD'}

# Selective file rollback
git checkout ${context.commitBefore || 'HEAD'} -- <file-path>
\`\`\`

### Affected Files

${generateRollbackFilesList(context.filesModified)}

### Performance Impact

${context.metrics ? `
- Agent Load Time: ${context.metrics.agentLoadTime || 'N/A'}ms
- Task Execution Time: ${context.metrics.taskExecutionTime || 'N/A'}ms
- Logging Overhead: Minimal (async, non-blocking)
` : '*No performance metrics recorded.*'}

---

*This is an Architecture Decision Record (ADR) auto-generated by AIOX Decision Logging System*
*Story 6.1.2.6.2 - Decision Log Automation Infrastructure*
`;

  await fs.writeFile(logPath, template, 'utf8');

  return logPath;
}

module.exports = {
  generateDecisionLog,
  calculateDuration,
  generateDecisionsList,
  generateFilesList,
  generateTestsList,
  generateRollbackFilesList,
};
