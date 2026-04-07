'use strict';

/**
 * Tests for the dashboard YAML parser — imports from production server.cjs.
 * Run: node skills/code-review-ping-pong/dashboard/server.test.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const { parseYaml, parseValue } = require('./server.cjs');

// ── Test harness ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ ${name}`);
    failed++;
  }
}

function assertEqual(actual, expected, name) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ ${name}`);
    console.error(`     expected: ${JSON.stringify(expected)}`);
    console.error(`     actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

console.log('\n  Parser YAML — Testes (importando de server.cjs)\n');

// Test 1: Simple key-value pairs
const simple = parseYaml('protocol: code-review-ping-pong\nversion: 1\nproject: "my app"');
assertEqual(simple.protocol, 'code-review-ping-pong', 'simple string value');
assertEqual(simple.version, 1, 'integer value');
assertEqual(simple.project, 'my app', 'quoted string value');

// Test 2: progress.yml summary (nested object)
const progress = parseYaml(`
protocol: code-review-ping-pong
updated: "2026-03-29"

summary:
  total_stages: 9
  completed: 1
  active: 1
  pending: 7
  completion_pct: 11
  total_issues_found: 15
  total_issues_fixed: 15
  total_rounds: 4

stages:
  - id: 1
    slug: scraping-apify
    status: complete
    final_score: 10
    rounds: 4
    issues_found: 15
    issues_fixed: 15
  - id: 2
    slug: workers
    status: active
    current_round: 2
    latest_score: 8
    issues_found: 7
    issues_fixed: 5
`);

assertEqual(progress.summary.total_stages, 9, 'nested summary.total_stages');
assertEqual(progress.summary.completion_pct, 11, 'nested summary.completion_pct');
assert(Array.isArray(progress.stages), 'stages is array');
assertEqual(progress.stages.length, 2, 'stages has 2 items');
assertEqual(progress.stages[0].slug, 'scraping-apify', 'stage 1 slug');
assertEqual(progress.stages[0].status, 'complete', 'stage 1 status');
assertEqual(progress.stages[0].final_score, 10, 'stage 1 final_score');
assertEqual(progress.stages[1].slug, 'workers', 'stage 2 slug');
assertEqual(progress.stages[1].status, 'active', 'stage 2 status');
assertEqual(progress.stages[1].latest_score, 8, 'stage 2 latest_score');

// Test 3: stages.yml with nested arrays (files, goals, constraints)
const stages = parseYaml(`
protocol: code-review-ping-pong
version: 1
project: "test project"
created: "2026-03-29"

stages:
  - id: 1
    slug: auth-module
    name: "Auth Module"
    status: active
    files:
      - src/auth/login.ts
      - src/auth/session.ts
    goals:
      - No security vulnerabilities
      - Full test coverage
    constraints:
      - Do not modify database layer
  - id: 2
    slug: api-routes
    name: "API Routes"
    status: pending
    files:
      - src/routes/users.ts
    goals:
      - Clean API design
    constraints: []
`);

assertEqual(stages.stages.length, 2, 'stages.yml has 2 stages');
assertEqual(stages.stages[0].slug, 'auth-module', 'stage 1 slug');
assertEqual(stages.stages[0].name, 'Auth Module', 'stage 1 name');
assert(Array.isArray(stages.stages[0].files), 'stage 1 files is array');
assertEqual(stages.stages[0].files.length, 2, 'stage 1 has 2 files');
assertEqual(stages.stages[0].files[0], 'src/auth/login.ts', 'stage 1 file 1');
assertEqual(stages.stages[0].goals.length, 2, 'stage 1 has 2 goals');
assertEqual(stages.stages[0].constraints.length, 1, 'stage 1 has 1 constraint');
assertEqual(stages.stages[1].constraints, [], 'stage 2 empty constraints');

// Test 4: Repeated line values (the indexOf bug scenario)
const repeated = parseYaml(`
stages:
  - id: 1
    status: complete
    rounds: 4
  - id: 2
    status: active
    rounds: 2
  - id: 3
    status: pending
    rounds: 0
`);

assertEqual(repeated.stages.length, 3, 'repeated values: 3 stages');
assertEqual(repeated.stages[0].status, 'complete', 'repeated: stage 1 complete');
assertEqual(repeated.stages[1].status, 'active', 'repeated: stage 2 active');
assertEqual(repeated.stages[2].status, 'pending', 'repeated: stage 3 pending');
assertEqual(repeated.stages[2].rounds, 0, 'repeated: stage 3 rounds = 0');

// Test 5: Boolean and null values
const booleans = parseYaml('enabled: true\ndisabled: false\nempty: null\ntilde: ~');
assertEqual(booleans.enabled, true, 'boolean true');
assertEqual(booleans.disabled, false, 'boolean false');
assertEqual(booleans.empty, null, 'null value');
assertEqual(booleans.tilde, null, 'tilde null');

// Test 6: Real stages template file
const templatePath = path.join(__dirname, '..', 'references', 'stages-template.yml');
if (fs.existsSync(templatePath)) {
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const template = parseYaml(templateContent);
  assertEqual(template.protocol, 'code-review-ping-pong', 'template: protocol');
  assertEqual(template.version, 1, 'template: version');
  assert(Array.isArray(template.stages), 'template: stages is array');
  assertEqual(template.stages.length, 2, 'template: 2 stages');
  assertEqual(template.stages[0].status, 'active', 'template: stage 1 active');
  assertEqual(template.stages[1].status, 'pending', 'template: stage 2 pending');
  console.log('  ✅ Real stages-template.yml parses correctly');
  passed++;
} else {
  console.log('  ⚠️  stages-template.yml not found, skipping');
}

// Test 7: Real progress template file
const progressPath = path.join(__dirname, '..', 'references', 'progress-template.yml');
if (fs.existsSync(progressPath)) {
  const progressContent = fs.readFileSync(progressPath, 'utf8');
  const progressTemplate = parseYaml(progressContent);
  assertEqual(progressTemplate.protocol, 'code-review-ping-pong', 'progress template: protocol');
  assertEqual(progressTemplate.summary.total_stages, 0, 'progress template: total_stages');
  assert(Array.isArray(progressTemplate.stages), 'progress template: stages is array');
  console.log('  ✅ Real progress-template.yml parses correctly');
  passed++;
} else {
  console.log('  ⚠️  progress-template.yml not found, skipping');
}

// Test 8: parseValue function directly
assertEqual(parseValue('42'), 42, 'parseValue integer');
assertEqual(parseValue('3.14'), 3.14, 'parseValue float');
assertEqual(parseValue('true'), true, 'parseValue true');
assertEqual(parseValue('false'), false, 'parseValue false');
assertEqual(parseValue('null'), null, 'parseValue null');
assertEqual(parseValue('hello'), 'hello', 'parseValue string');
assertEqual(parseValue('"quoted"'), 'quoted', 'parseValue quoted');

// ── Summary ───────────────────────────────────────────────────────────────

console.log(`\n  Resultado: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
