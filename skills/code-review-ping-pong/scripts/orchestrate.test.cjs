'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  buildCliCommand,
  getLatestRound,
  getNextStep,
  parseArgs,
  roundFileExists,
  validateRound,
} = require('./orchestrate.cjs');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  OK ${name}`);
    passed++;
    return;
  }

  console.error(`  FAIL ${name}`);
  failed++;
}

function assertEqual(actual, expected, name) {
  const ok = JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
  assert(ok, name);
  if (!ok) {
    console.error(`    expected: ${JSON.stringify(expected)}`);
    console.error(`    actual:   ${JSON.stringify(actual)}`);
  }
}

function normalize(value) {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalize(value[key]);
        return acc;
      }, {});
  }

  return value;
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

console.log('\n  Orchestrator tests\n');

assertEqual(
  buildCliCommand('claude', 'fix this'),
  {
    command: 'claude',
    args: ['--print', '--dangerously-skip-permissions', 'fix this'],
  },
  'claude uses print mode with positional prompt',
);

assertEqual(
  buildCliCommand('codex', 'review this'),
  {
    command: 'codex',
    args: ['exec', '--dangerously-bypass-approvals-and-sandbox', 'review this'],
  },
  'codex uses exec subcommand for non-interactive mode',
);

assertEqual(
  buildCliCommand('gemini', 'audit this'),
  {
    command: 'gemini',
    args: ['--prompt', 'audit this', '--approval-mode', 'yolo'],
  },
  'gemini binds prompt to the prompt flag',
);

assertEqual(
  parseArgs(['--max-rounds', '5', '--with-audit', '--timeout', '12']),
  {
    maxRounds: 5,
    withAudit: true,
    timeout: 12 * 60 * 1000,
  },
  'argument parser handles numeric and boolean flags',
);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ping-pong-orchestrate-'));
const ppDir = path.join(tempRoot, '.code-review-ping-pong');
fs.mkdirSync(ppDir, { recursive: true });

write(path.join(ppDir, 'round-1.md'), '---\nverdict: CONTINUE\nscore: 8\n---\n');
write(path.join(ppDir, 'round-2.md'), '---\nverdict: PERFECT\nscore: 10\n---\n');
write(
  path.join(ppDir, 'next-step.md'),
  [
    '# Next Step',
    '',
    '- current_round: 2',
    '- current_mode: REVIEW',
    '- cycle_state: WAITING_FOR_FIX',
    '- next_agent: CLAUDE CODE',
    '- next_mode: fix mode',
    '- expected_artifact: .code-review-ping-pong/round-2-fixed.md',
    '- blocking_reason: findings pending',
    '',
    '## Operator Prompt',
    '',
    'Abra o Claude e rode: fix mode',
  ].join('\n'),
);
write(
  path.join(ppDir, 'validate.cjs'),
  [
    '#!/usr/bin/env node',
    "'use strict';",
    'const fs = require(\'node:fs\');',
    'const path = require(\'node:path\');',
    'const target = path.resolve(process.cwd(), \'.code-review-ping-pong\', process.argv[2]);',
    'if (!fs.existsSync(target)) process.exit(1);',
  ].join('\n'),
);

assertEqual(getLatestRound(ppDir), 2, 'latest round ignores fixed and audit suffixes');
assertEqual(
  getNextStep(ppDir),
  {
    current_round: '2',
    current_mode: 'REVIEW',
    cycle_state: 'WAITING_FOR_FIX',
    next_agent: 'CLAUDE CODE',
    next_mode: 'fix mode',
  },
  'next-step parser extracts routing metadata',
);
assert(roundFileExists(ppDir, 2, 'review'), 'review round existence check');
assert(validateRound(ppDir, 'round-2.md'), 'validator runs from project root and resolves file');

fs.rmSync(tempRoot, { recursive: true, force: true });

console.log(`\n  Result: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
