/**
 * Doctor Text Formatter
 *
 * Formats doctor results as human-readable text output.
 *
 * @module aios-core/doctor/formatters/text
 * @story INS-4.1
 */

const STATUS_PREFIX = {
  PASS: '[PASS]',
  WARN: '[WARN]',
  FAIL: '[FAIL]',
  INFO: '[INFO]',
};

function formatText(output, options = {}) {
  const { quiet = false } = options;
  const lines = [];

  lines.push(`AIOS Doctor v${output.version} — Environment Health Check`);
  lines.push('');

  for (const result of output.checks) {
    const prefix = STATUS_PREFIX[result.status] || '[????]';
    lines.push(`  ${prefix} ${result.check}: ${result.message}`);
  }

  lines.push('');
  const { pass, warn, fail, info } = output.summary;
  lines.push(`Summary: ${pass} PASS | ${warn} WARN | ${fail} FAIL | ${info} INFO`);

  if (!quiet) {
    const fixable = output.checks.filter(
      (r) => (r.status === 'WARN' || r.status === 'FAIL') && r.fixCommand,
    );

    if (fixable.length > 0) {
      lines.push('');
      lines.push('Fix suggestions:');
      fixable.forEach((r, i) => {
        lines.push(`  ${i + 1}. [${r.status}] ${r.check}: Run \`${r.fixCommand}\``);
      });
    }
  }

  if (output.fixResults) {
    lines.push('');
    lines.push('Fix results:');
    for (const fr of output.fixResults) {
      const icon = fr.applied ? '✓' : '✗';
      lines.push(`  ${icon} ${fr.check}: ${fr.message}`);
    }
  }

  return lines.join('\n');
}

module.exports = { formatText };
