/**
 * Doctor Check: Rules Files
 *
 * Validates 7 .claude/rules/*.md files present.
 *
 * @module aios-core/doctor/checks/rules-files
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const name = 'rules-files';

const EXPECTED_RULES = [
  'agent-authority.md',
  'workflow-execution.md',
  'story-lifecycle.md',
  'ids-principles.md',
  'coderabbit-integration.md',
  'mcp-usage.md',
  'agent-memory-imports.md',
];

async function run(context) {
  const rulesDir = path.join(context.projectRoot, '.claude', 'rules');

  if (!fs.existsSync(rulesDir)) {
    return {
      check: name,
      status: 'FAIL',
      message: `Rules directory not found (expected ${EXPECTED_RULES.length} files)`,
      fixCommand: 'aios doctor --fix',
    };
  }

  const missing = EXPECTED_RULES.filter(
    (file) => !fs.existsSync(path.join(rulesDir, file)),
  );

  if (missing.length === 0) {
    return {
      check: name,
      status: 'PASS',
      message: `All ${EXPECTED_RULES.length} rules files present`,
      fixCommand: null,
    };
  }

  const present = EXPECTED_RULES.length - missing.length;
  const severity = missing.length > 3 ? 'FAIL' : 'WARN';

  return {
    check: name,
    status: severity,
    message: `Missing ${missing.length} of ${EXPECTED_RULES.length} rules (${missing.join(', ')})`,
    fixCommand: 'aios doctor --fix',
  };
}

module.exports = { name, run, EXPECTED_RULES };
