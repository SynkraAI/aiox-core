#!/usr/bin/env node

'use strict';

/**
 * Installed Project Skills E2E Smoke
 *
 * Packs the local aiox-core package, installs it into a temporary brownfield
 * project, runs the installed CLI, and validates that skills are materialized
 * and activatable from the installed project rather than from the source repo.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const rootPackageJson = require(path.join(repoRoot, 'package.json'));
const packageInstallRelativePath = path.join('node_modules', ...rootPackageJson.name.split('/'));
const { getSkillId } = require(
  path.join(repoRoot, '.aiox-core', 'infrastructure', 'scripts', 'codex-skills-sync', 'index')
);
function parseTimeoutEnv(name, fallbackMs) {
  const parsed = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMs;
}

const verbose = process.env.AIOX_E2E_VERBOSE === '1';
const keepTemp = process.env.AIOX_E2E_KEEP_TEMP === '1';
const agentSet = (process.env.AIOX_E2E_AGENT_SET || 'dev,qa,aiox-master')
  .split(',')
  .map((agent) => agent.trim())
  .filter(Boolean);
const defaultCommandTimeoutMs = parseTimeoutEnv('AIOX_E2E_COMMAND_TIMEOUT_MS', 120000);
const npmInstallTimeoutMs = parseTimeoutEnv('AIOX_E2E_NPM_INSTALL_TIMEOUT_MS', 420000);
const npmInstallFlags = ['--no-audit', '--fund=false'];
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-pack-'));
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-installed-skills-'));
const projectRoot = path.join(tempRoot, 'project');
const requiredCorePackages = ['fast-glob', 'fs-extra', 'js-yaml', 'semver', 'ajv', 'tar', 'chalk'];

function log(message) {
  console.log(`[installed-skills-e2e] ${message}`);
}

function fail(message, details = '') {
  const suffix = details ? `\n${details}` : '';
  throw new Error(`${message}${suffix}`);
}

function run(command, args, options = {}) {
  const cwd = options.cwd || repoRoot;
  const env = { ...process.env, ...(options.env || {}) };
  const label = `${command} ${args.join(' ')}`;

  if (verbose) {
    log(`$ ${label} (cwd=${cwd})`);
  }

  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: 'utf8',
    timeout: options.timeout || defaultCommandTimeoutMs,
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.error) {
    fail(`Command failed to start: ${label}`, result.error.message);
  }

  if (verbose && result.stdout) process.stdout.write(result.stdout);
  if (verbose && result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    fail(
      `Command failed (${result.status}): ${label}`,
      [result.stdout && `STDOUT:\n${result.stdout}`, result.stderr && `STDERR:\n${result.stderr}`]
        .filter(Boolean)
        .join('\n\n')
    );
  }

  return result.stdout || '';
}

function runInstalledCli(args, options = {}) {
  return run(npxBin, ['--no-install', 'aiox-core', ...args], options);
}

function assertPathExists(relativePath, type = 'any') {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`Missing expected installed path: ${relativePath}`);
  }

  const stat = fs.statSync(absolutePath);
  if (type === 'file' && !stat.isFile()) {
    fail(`Expected file but found non-file: ${relativePath}`);
  }
  if (type === 'dir' && !stat.isDirectory()) {
    fail(`Expected directory but found non-directory: ${relativePath}`);
  }

  return absolutePath;
}

function assertAbsolutePathExists(absolutePath, type = 'any') {
  if (!fs.existsSync(absolutePath)) {
    fail(`Missing expected path: ${absolutePath}`);
  }

  const stat = fs.statSync(absolutePath);
  if (type === 'file' && !stat.isFile()) {
    fail(`Expected file but found non-file: ${absolutePath}`);
  }
  if (type === 'dir' && !stat.isDirectory()) {
    fail(`Expected directory but found non-directory: ${absolutePath}`);
  }

  return absolutePath;
}

function assertNoSourceRepoLeak(relativePath) {
  const absolutePath = assertPathExists(relativePath, 'file');
  const content = fs.readFileSync(absolutePath, 'utf8');

  if (content.includes(repoRoot)) {
    fail(`Installed artifact leaks source repo path: ${relativePath}`);
  }

  return content;
}

function assertContains(content, expected, relativePath) {
  if (!content.includes(expected)) {
    fail(`Expected ${relativePath} to contain: ${expected}`);
  }
}

function parseDoctorJson(output) {
  try {
    return JSON.parse(output);
  } catch {
    fail('Doctor --json did not return parseable JSON', output);
  }
}

function cleanup() {
  if (keepTemp) {
    log(`Keeping temp root: ${tempRoot}`);
    log(`Keeping pack dir: ${packDir}`);
    return;
  }

  fs.rmSync(tempRoot, { recursive: true, force: true });
  fs.rmSync(packDir, { recursive: true, force: true });
}

async function main() {
  log(`Repo root: ${repoRoot}`);
  log(`Temp project: ${projectRoot}`);

  fs.mkdirSync(projectRoot, { recursive: true });

  log('Packing local aiox-core package');
  run('npm', ['pack', '--pack-destination', packDir], { cwd: repoRoot, timeout: 180000 });
  const tarballs = fs.readdirSync(packDir).filter((entry) => entry.endsWith('.tgz'));
  if (tarballs.length !== 1) {
    fail(`Expected exactly one packed tarball, found ${tarballs.length}`, tarballs.join('\n'));
  }
  const tarballPath = path.join(packDir, tarballs[0]);

  log('Creating brownfield test project');
  run('npm', ['init', '-y'], { cwd: projectRoot });

  log('Installing packed aiox-core tarball');
  run('npm', ['install', tarballPath, ...npmInstallFlags], {
    cwd: projectRoot,
    timeout: npmInstallTimeoutMs,
  });

  const cliPath = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    `aiox-core${process.platform === 'win32' ? '.cmd' : ''}`
  );
  const packagedCoreDir = path.join(projectRoot, packageInstallRelativePath, '.aiox-core');
  assertPathExists(path.join(packageInstallRelativePath, 'bin', 'aiox.js'), 'file');
  assertPathExists(path.join('node_modules', '.bin', 'aiox-core'), 'any');
  if (process.platform === 'win32') {
    assertPathExists(path.join('node_modules', '.bin', path.basename(cliPath)), 'file');
  }

  log('Validating packaged .aiox-core dependencies');
  assertAbsolutePathExists(path.join(packagedCoreDir, 'package.json'), 'file');
  run('npm', ['install', '--omit=dev', '--ignore-scripts', ...npmInstallFlags], {
    cwd: packagedCoreDir,
    timeout: npmInstallTimeoutMs,
  });
  for (const packageName of requiredCorePackages) {
    assertAbsolutePathExists(path.join(packagedCoreDir, 'node_modules', packageName), 'dir');
  }

  log('Running installed aiox install in CI mode');
  runInstalledCli(['install', '--ci', '--yes', '--ide', 'claude-code'], {
    cwd: projectRoot,
    timeout: 240000,
    env: {
      CI: '1',
      AIOX_INSTALL_FORCE: '1',
      AIOX_INSTALL_QUIET: '1',
    },
  });
  // TODO(Story 124.7): add a hermetic `aiox update` smoke once the scoped
  // package can be resolved from the publish workflow or a local registry.

  log('Validating installed skill and agent artifacts');
  assertPathExists('.aiox-core', 'dir');
  assertPathExists('.aiox-core/development/agents', 'dir');
  assertPathExists('.claude/skills/AIOX/agents', 'dir');
  assertPathExists('.codex/agents', 'dir');
  assertPathExists('.codex/skills', 'dir');

  for (const agent of agentSet) {
    const claudeSkill = `.claude/skills/AIOX/agents/${agent}/SKILL.md`;
    const codexAgent = `.codex/agents/${agent}.md`;
    const codexSkillId = getSkillId(agent);
    const codexSkill = `.codex/skills/${codexSkillId}/SKILL.md`;
    const sourceAgent = `.aiox-core/development/agents/${agent}.md`;

    assertPathExists(sourceAgent, 'file');

    const claudeSkillContent = assertNoSourceRepoLeak(claudeSkill);
    assertContains(claudeSkillContent, 'activation_type: pipeline', claudeSkill);
    assertContains(
      claudeSkillContent,
      `Source: .aiox-core/development/agents/${agent}.md`,
      claudeSkill
    );

    const codexAgentContent = assertNoSourceRepoLeak(codexAgent);
    assertContains(codexAgentContent, `id: ${agent}`, codexAgent);

    const codexSkillContent = assertNoSourceRepoLeak(codexSkill);
    assertContains(codexSkillContent, `name: ${codexSkillId}`, codexSkill);
    assertContains(codexSkillContent, `.aiox-core/development/agents/${agent}.md`, codexSkill);
  }

  log(`Activating installed agents: ${agentSet.join(', ')}`);
  const greetingScript = path.join(
    projectRoot,
    '.aiox-core',
    'development',
    'scripts',
    'generate-greeting.js'
  );
  assertPathExists('.aiox-core/development/scripts/generate-greeting.js', 'file');

  for (const agent of agentSet) {
    const greeting = run('node', [greetingScript, agent], { cwd: projectRoot, timeout: 30000 });
    if (!/Agent .*ready|Agent .*loaded|ready/i.test(greeting)) {
      fail(`Activation smoke did not produce a ready signal for ${agent}`, greeting);
    }
    if (!/Available Commands|\*help/.test(greeting)) {
      fail(`Activation smoke did not expose commands/help for ${agent}`, greeting);
    }
  }

  log('Running installed doctor --json');
  const doctorOutput = runInstalledCli(['doctor', '--json'], {
    cwd: projectRoot,
    timeout: 120000,
  });
  const doctor = parseDoctorJson(doctorOutput);
  if (!doctor.summary || doctor.summary.fail > 0) {
    fail('Installed doctor reported FAIL results', JSON.stringify(doctor, null, 2));
  }

  log(`PASS: installed project skills E2E completed for ${agentSet.length} agents`);
}

main()
  .catch((error) => {
    console.error(`\n[installed-skills-e2e] FAIL: ${error.message}`);
    if (!keepTemp) {
      console.error(
        '[installed-skills-e2e] Re-run with AIOX_E2E_KEEP_TEMP=1 to preserve temp files.'
      );
    } else {
      console.error(`[installed-skills-e2e] Temp root preserved: ${tempRoot}`);
    }
    process.exitCode = 1;
  })
  .finally(cleanup);
