'use strict';

const path = require('path');
const {
  parseArgs,
  lintContent,
  runSemanticLint,
} = require('../../scripts/semantic-lint');

describe('semantic-lint', () => {
  it('parses staged/json/file arguments', () => {
    const parsed = parseArgs(['--staged', '--json', 'docs/file.md']);
    expect(parsed.staged).toBe(true);
    expect(parsed.json).toBe(true);
    expect(parsed.files).toEqual(['docs/file.md']);
  });

  it('detects deprecated terms with severities', () => {
    const findings = lintContent(
      'This expansion pack uses permission mode. Legacy workflow state term.',
      'docs/sample.md',
    );

    expect(findings.some((item) => item.ruleId === 'deprecated-expansion-pack')).toBe(true);
    expect(findings.some((item) => item.ruleId === 'deprecated-permission-mode')).toBe(true);
    expect(findings.some((item) => item.ruleId === 'legacy-workflow-state-term')).toBe(true);
  });

  it('fails when error-level terms are present', () => {
    const result = runSemanticLint(
      { projectRoot: '/tmp/project', targets: ['docs/sample.md'] },
      {
        collectFiles: () => [path.join('/tmp/project', 'docs', 'sample.md')],
        readFile: () => 'Use expansion pack here.',
      },
    );

    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('passes when only warning-level term is present', () => {
    const result = runSemanticLint(
      { projectRoot: '/tmp/project', targets: ['docs/sample.md'] },
      {
        collectFiles: () => [path.join('/tmp/project', 'docs', 'sample.md')],
        readFile: () => 'Use workflow state wording for migration note.',
      },
    );

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
