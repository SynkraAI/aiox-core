/**
 * Terminal Spawner - Node.js wrapper for pm.sh
 *
 * Provides async API for spawning AIOX agents in separate terminals
 * to maintain clean context isolation during orchestration.
 *
 * Story 11.2: Bob Terminal Spawning
 *
 * @module core/orchestration/terminal-spawner
 * @version 1.0.0
 */

'use strict';

const { spawn, execSync } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

// Constants
const POLL_INTERVAL_MS = 500;
const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Environment types for spawn strategy selection
 * @readonly
 * @enum {string}
 */
const ENVIRONMENT_TYPE = {
  NATIVE_TERMINAL: 'NATIVE_TERMINAL',
  VSCODE: 'VSCODE',
  SSH: 'SSH',
  DOCKER: 'DOCKER',
  CI: 'CI',
};

/**
 * Environment detection result
 * @typedef {Object} EnvironmentInfo
 * @property {string} type - Environment type (ENVIRONMENT_TYPE enum value)
 * @property {boolean} supportsVisualTerminal - Whether visual terminal spawn is supported
 * @property {string} reason - Human-readable reason for detection
 */

/**
 * Detects the current execution environment (Story 12.10 - Task 1)
 *
 * Detection priority:
 * 1. CI/CD (GitHub Actions, GitLab CI, etc.)
 * 2. Docker container
 * 3. SSH session
 * 4. VS Code integrated terminal
 * 5. Native terminal (default)
 *
 * @returns {EnvironmentInfo} Environment detection result
 */
function detectEnvironment() {
  // 1. CI/CD detection (Task 1.5)
  // Check common CI environment variables
  if (
    process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.GITLAB_CI === 'true' ||
    process.env.JENKINS_URL ||
    process.env.TRAVIS === 'true' ||
    process.env.CIRCLECI === 'true' ||
    process.env.BUILDKITE === 'true' ||
    process.env.AZURE_PIPELINES === 'true' ||
    process.env.TF_BUILD === 'True'
  ) {
    return {
      type: ENVIRONMENT_TYPE.CI,
      supportsVisualTerminal: false,
      reason: 'CI/CD environment detected (headless)',
    };
  }

  // 2. Docker container detection (Task 1.4)
  // Check for /.dockerenv file or cgroup indicators
  try {
    if (fsSync.existsSync('/.dockerenv')) {
      return {
        type: ENVIRONMENT_TYPE.DOCKER,
        supportsVisualTerminal: false,
        reason: 'Docker container detected (/.dockerenv exists)',
      };
    }

    // Check cgroup for docker/containerd/kubepods
    if (fsSync.existsSync('/proc/1/cgroup')) {
      const cgroup = fsSync.readFileSync('/proc/1/cgroup', 'utf8');
      if (cgroup.includes('docker') || cgroup.includes('containerd') || cgroup.includes('kubepods')) {
        return {
          type: ENVIRONMENT_TYPE.DOCKER,
          supportsVisualTerminal: false,
          reason: 'Container detected via cgroup',
        };
      }
    }
  } catch {
    // Ignore file read errors (e.g., on Windows)
  }

  // 3. SSH session detection (Task 1.3)
  if (process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION) {
    return {
      type: ENVIRONMENT_TYPE.SSH,
      supportsVisualTerminal: false,
      reason: 'SSH session detected (no display available)',
    };
  }

  // 4. VS Code integrated terminal detection (Task 1.2)
  if (
    process.env.TERM_PROGRAM === 'vscode' ||
    process.env.VSCODE_PID ||
    process.env.VSCODE_CWD ||
    process.env.VSCODE_GIT_IPC_HANDLE
  ) {
    return {
      type: ENVIRONMENT_TYPE.VSCODE,
      supportsVisualTerminal: false,
      reason: 'VS Code integrated terminal detected',
    };
  }

  // 5. Native terminal (default) - supports visual spawn
  return {
    type: ENVIRONMENT_TYPE.NATIVE_TERMINAL,
    supportsVisualTerminal: true,
    reason: 'Native terminal environment',
  };
}

/**
 * Default spawn options
 * @type {Object}
 */
const DEFAULT_OPTIONS = {
  params: '',
  context: null,
  timeout: DEFAULT_TIMEOUT_MS,
  outputDir: os.tmpdir(),
  retries: MAX_RETRIES,
  debug: false,
};

/**
 * Context schema for agent execution
 * @typedef {Object} AgentContext
 * @property {string} story - Story file path or content
 * @property {string[]} files - Array of relevant file paths
 * @property {string} instructions - Additional instructions for the agent
 * @property {Object} metadata - Additional metadata
 */

/**
 * Spawn result object
 * @typedef {Object} SpawnResult
 * @property {boolean} success - Whether spawn was successful
 * @property {string} output - Agent output content
 * @property {string} outputFile - Path to output file
 * @property {number} duration - Execution duration in ms
 * @property {string} [error] - Error message if failed
 */

/**
 * Gets the path to the pm.sh script
 * @returns {string} Absolute path to pm.sh
 */
function getScriptPath() {
  return path.join(__dirname, '../../scripts/pm.sh');
}

/**
 * Validates spawn arguments
 * @param {string} agent - Agent ID
 * @param {string} task - Task to execute
 * @throws {Error} If arguments are invalid
 */
function validateArgs(agent, task) {
  if (!agent || typeof agent !== 'string') {
    throw new Error('Agent ID is required and must be a string');
  }

  if (!task || typeof task !== 'string') {
    throw new Error('Task is required and must be a string');
  }

  // Validate agent format (should be alphanumeric with optional hyphen)
  const agentPattern = /^[a-zA-Z][a-zA-Z0-9-]*$/;
  if (!agentPattern.test(agent)) {
    throw new Error(`Invalid agent ID format: ${agent}`);
  }

  // Validate task format
  const taskPattern = /^[a-zA-Z][a-zA-Z0-9-]*$/;
  if (!taskPattern.test(task)) {
    throw new Error(`Invalid task format: ${task}`);
  }
}

/**
 * Creates a temporary context file for the agent (Task 2.2)
 *
 * @param {AgentContext} context - Context data to pass to agent
 * @param {string} outputDir - Directory for temp files
 * @returns {Promise<string>} Path to created context file
 */
async function createContextFile(context, outputDir = os.tmpdir()) {
  if (!context) {
    return '';
  }

  // Validate context structure
  const validatedContext = {
    story: context.story || '',
    files: Array.isArray(context.files) ? context.files : [],
    instructions: context.instructions || '',
    metadata: context.metadata || {},
    createdAt: new Date().toISOString(),
  };

  const contextPath = path.join(outputDir, `aiox-context-${Date.now()}.json`);
  await fs.writeFile(contextPath, JSON.stringify(validatedContext, null, 2));

  return contextPath;
}

/**
 * Polls for agent output completion (Task 3.2, 3.3)
 *
 * @param {string} outputFile - Path to output file
 * @param {number} timeout - Timeout in milliseconds
 * @param {boolean} debug - Enable debug logging
 * @returns {Promise<string>} Output content
 * @throws {Error} If timeout exceeded
 */
async function pollForOutput(outputFile, timeout = DEFAULT_TIMEOUT_MS, debug = false) {
  const startTime = Date.now();
  const lockFile = outputFile.replace('output', 'lock');

  if (debug) {
    console.log(`[TerminalSpawner] Polling for output: ${outputFile}`);
    console.log(`[TerminalSpawner] Lock file: ${lockFile}`);
  }

  while (Date.now() - startTime < timeout) {
    // Check if lock file is gone (agent finished)
    try {
      await fs.access(lockFile);
      // Lock still exists, wait and retry
      if (debug) {
        console.log(`[TerminalSpawner] Lock exists, waiting ${POLL_INTERVAL_MS}ms...`);
      }
      await sleep(POLL_INTERVAL_MS);
    } catch {
      // Lock gone, agent finished - read output
      if (debug) {
        console.log('[TerminalSpawner] Lock removed, reading output...');
      }

      try {
        const output = await fs.readFile(outputFile, 'utf8');
        return output;
      } catch (readError) {
        if (debug) {
          console.log(`[TerminalSpawner] Output file not found: ${readError.message}`);
        }
        return 'No output captured';
      }
    }
  }

  // Timeout - cleanup lock file if still exists
  try {
    await fs.unlink(lockFile);
  } catch {
    // Ignore cleanup errors
  }

  throw new Error(`Timeout waiting for agent output after ${timeout}ms`);
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Spawns an agent inline using child_process.spawn (Story 12.10 - Task 2)
 *
 * This is used when visual terminal spawning is not available (VS Code, SSH, Docker, CI).
 * Output is piped directly instead of using a separate terminal window.
 *
 * @param {string} agent - Agent ID (e.g., 'dev', 'architect', 'qa')
 * @param {string} task - Task to execute
 * @param {Object} options - Spawn options
 * @param {string} [options.params=''] - Additional parameters
 * @param {AgentContext} [options.context=null] - Context data for agent
 * @param {number} [options.timeout=300000] - Timeout in ms
 * @param {string} [options.outputDir] - Directory for output files
 * @param {boolean} [options.debug=false] - Enable debug logging
 * @returns {Promise<SpawnResult>} Result with output and status
 */
async function spawnInline(agent, task, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  if (opts.debug) {
    console.log('[TerminalSpawner] Using inline spawn (no visual terminal)');
  }

  // Create context file if needed
  let contextPath = '';
  if (opts.context) {
    contextPath = await createContextFile(opts.context, opts.outputDir);
    if (opts.debug) {
      console.log(`[TerminalSpawner] Created context file: ${contextPath}`);
    }
  }

  // Build command arguments for pm.sh
  const args = [agent, task];
  if (opts.params) {
    args.push(opts.params);
  }
  if (contextPath) {
    args.push('--context', contextPath);
  }

  const scriptPath = getScriptPath();

  // Verify script exists
  if (!fsSync.existsSync(scriptPath)) {
    throw new Error(`pm.sh script not found at: ${scriptPath}`);
  }

  return new Promise((resolve) => {
    const outputChunks = [];
    const errorChunks = [];

    // Spawn the process inline with piped stdout/stderr (Task 2.2)
    const child = spawn('bash', [scriptPath, ...args], {
      env: {
        ...process.env,
        AIOX_DEBUG: opts.debug ? 'true' : 'false',
        AIOX_OUTPUT_DIR: opts.outputDir,
        AIOX_INLINE_MODE: 'true', // Signal to pm.sh that we're running inline
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Register child process for cleanup on parent exit (Task 3.4)
    registerChildProcess(child);

    // Capture stdout
    child.stdout.on('data', (data) => {
      outputChunks.push(data);
      if (opts.debug) {
        process.stdout.write(data);
      }
    });

    // Capture stderr
    child.stderr.on('data', (data) => {
      errorChunks.push(data);
      if (opts.debug) {
        process.stderr.write(data);
      }
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      const duration = Date.now() - startTime;

      // Cleanup context file
      if (contextPath) {
        fs.unlink(contextPath).catch(() => {});
      }

      resolve({
        success: false,
        output: Buffer.concat(outputChunks).toString('utf8'),
        outputFile: '',
        duration,
        error: `Timeout after ${opts.timeout}ms`,
      });
    }, opts.timeout);

    // Handle process completion
    child.on('close', async (code) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Cleanup context file
      if (contextPath) {
        fs.unlink(contextPath).catch(() => {});
      }

      const stdout = Buffer.concat(outputChunks).toString('utf8').trim();
      const stderr = Buffer.concat(errorChunks).toString('utf8');

      if (code === 0) {
        // pm.sh returns the output file path in stdout
        // Read the actual output from that file
        let output = stdout;
        const outputFilePath = stdout.split('\n').pop()?.trim();

        if (outputFilePath && outputFilePath.endsWith('.md')) {
          try {
            output = await fs.readFile(outputFilePath, 'utf8');
            // Cleanup the output file after reading
            await fs.unlink(outputFilePath).catch(() => {});
          } catch {
            // If we can't read the file, use stdout as fallback
            output = stdout;
          }
        }

        resolve({
          success: true,
          output,
          outputFile: outputFilePath || '',
          duration,
        });
      } else {
        resolve({
          success: false,
          output: stdout,
          outputFile: '',
          duration,
          error: stderr || `Process exited with code ${code}`,
        });
      }
    });

    // Handle spawn errors
    child.on('error', (error) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Cleanup context file
      if (contextPath) {
        fs.unlink(contextPath).catch(() => {});
      }

      resolve({
        success: false,
        output: Buffer.concat(outputChunks).toString('utf8'),
        outputFile: '',
        duration,
        error: error.message,
      });
    });
  });
}

/**
 * Spawns an agent in a separate terminal (Task 4.1)
 *
 * Opens a new terminal window with the specified agent and task,
 * passing context if provided. Returns the agent's output after completion.
 *
 * @param {string} agent - Agent ID (e.g., 'dev', 'architect', 'qa')
 * @param {string} task - Task to execute (e.g., 'develop', 'review')
 * @param {Object} options - Spawn options
 * @param {string} [options.params=''] - Additional parameters
 * @param {AgentContext} [options.context=null] - Context data for agent
 * @param {number} [options.timeout=300000] - Timeout in ms (default: 5 min)
 * @param {string} [options.outputDir] - Directory for output files
 * @param {number} [options.retries=3] - Number of retry attempts
 * @param {boolean} [options.debug=false] - Enable debug logging
 * @returns {Promise<SpawnResult>} Result with output and status
 *
 * @example
 * const result = await spawnAgent('dev', 'develop', {
 *   params: 'story-11.2',
 *   context: {
 *     story: 'docs/stories/active/11.2.story.md',
 *     files: ['src/index.js'],
 *     instructions: 'Focus on terminal spawning'
 *   },
 *   timeout: 600000 // 10 minutes
 * });
 */
async function spawnAgent(agent, task, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  // Validate arguments
  validateArgs(agent, task);

  // Detect environment to determine spawn strategy (Story 12.10 - Task 2.5)
  const environment = detectEnvironment();

  if (opts.debug) {
    console.log(`[TerminalSpawner] Environment: ${environment.type} (${environment.reason})`);
  }

  // If environment doesn't support visual terminal, use inline spawn directly
  if (!environment.supportsVisualTerminal) {
    console.log(`⚠️ Terminal visual indisponível. Executando inline. [${environment.reason}]`);
    return spawnInline(agent, task, opts);
  }

  // Create context file if needed (Task 2.2)
  let contextPath = '';
  if (opts.context) {
    contextPath = await createContextFile(opts.context, opts.outputDir);
    if (opts.debug) {
      console.log(`[TerminalSpawner] Created context file: ${contextPath}`);
    }
  }

  // Build command arguments
  const args = [agent, task];
  if (opts.params) {
    args.push(opts.params);
  }
  if (contextPath) {
    args.push('--context', contextPath);
  }

  // Get script path
  const scriptPath = getScriptPath();

  // Verify script exists
  if (!fsSync.existsSync(scriptPath)) {
    throw new Error(`pm.sh script not found at: ${scriptPath}`);
  }

  // Execute with retry logic (Task 4.2)
  let lastError;
  for (let attempt = 1; attempt <= opts.retries; attempt++) {
    try {
      if (opts.debug) {
        console.log(`[TerminalSpawner] Attempt ${attempt}/${opts.retries}`);
        console.log(`[TerminalSpawner] Executing: bash ${scriptPath} ${args.join(' ')}`);
      }

      // Execute pm.sh
      const env = {
        ...process.env,
        AIOX_DEBUG: opts.debug ? 'true' : 'false',
        AIOX_OUTPUT_DIR: opts.outputDir,
      };

      const result = execSync(`bash "${scriptPath}" ${args.join(' ')}`, {
        encoding: 'utf8',
        timeout: opts.timeout,
        env,
      });

      // Get output file path from script output
      const outputFile = result.trim();

      if (opts.debug) {
        console.log(`[TerminalSpawner] Output file: ${outputFile}`);
      }

      // Poll for completion (Task 3.2, 3.3)
      const output = await pollForOutput(outputFile, opts.timeout, opts.debug);

      // Cleanup context file (Task 2.4)
      if (contextPath) {
        await fs.unlink(contextPath).catch(() => {});
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        output,
        outputFile,
        duration,
      };
    } catch (error) {
      lastError = error;
      if (opts.debug) {
        console.log(`[TerminalSpawner] Attempt ${attempt} failed: ${error.message}`);
      }

      if (attempt < opts.retries) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  // Fallback to inline spawn if visual terminal fails (Story 12.10 - Task 2.3)
  console.log('⚠️ Terminal visual falhou. Tentando execução inline como fallback...');

  // Cleanup context file before retry with inline
  if (contextPath) {
    await fs.unlink(contextPath).catch(() => {});
  }

  // Try inline spawn as fallback
  const inlineResult = await spawnInline(agent, task, opts);

  if (inlineResult.success) {
    console.log('✅ Execução inline bem-sucedida.');
    return inlineResult;
  }

  // Both methods failed
  const duration = Date.now() - startTime;

  return {
    success: false,
    output: inlineResult.output || '',
    outputFile: '',
    duration,
    error: `Visual spawn failed: ${lastError?.message || 'Unknown'}. Inline fallback also failed: ${inlineResult.error || 'Unknown'}`,
  };
}

/**
 * Checks if the terminal spawner is available on this platform
 * @returns {boolean} True if spawning is supported
 */
function isSpawnerAvailable() {
  const platform = process.platform;
  return ['darwin', 'linux', 'win32'].includes(platform);
}

/**
 * Gets the current platform name
 * @returns {string} Platform name (macos, linux, windows, or unknown)
 */
function getPlatform() {
  switch (process.platform) {
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    case 'win32':
      return 'windows';
    default:
      return 'unknown';
  }
}

/**
 * Cleans up old output and lock files (Task 2.4)
 *
 * @param {string} outputDir - Directory to clean
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 * @returns {Promise<number>} Number of files cleaned
 */
async function cleanupOldFiles(outputDir = os.tmpdir(), maxAgeMs = 3600000) {
  const now = Date.now();
  let cleaned = 0;

  try {
    const files = await fs.readdir(outputDir);
    const aioxFiles = files.filter(
      (f) => f.startsWith('aiox-output-') || f.startsWith('aiox-lock-') || f.startsWith('aiox-context-'),
    );

    for (const file of aioxFiles) {
      const filePath = path.join(outputDir, file);
      try {
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.unlink(filePath);
          cleaned++;
        }
      } catch {
        // Ignore errors for individual files
      }
    }
  } catch {
    // Ignore directory read errors
  }

  return cleaned;
}

// ============================================
// OS Compatibility Matrix (Story 12.10 - Task 7)
// ============================================

/**
 * OS Compatibility Matrix definition (PRD §9.6 — D19)
 * @type {Object}
 */
const OS_COMPATIBILITY_MATRIX = {
  must_pass: [
    { os: 'macOS Sonoma', arch: 'arm64', docker: 'Docker Desktop', description: 'Apple Silicon' },
    { os: 'macOS Sonoma', arch: 'x64', docker: 'Docker Desktop', description: 'Intel' },
    { os: 'Windows 11', arch: 'x64', docker: 'Docker Desktop', wsl: 'Ubuntu 22.04', description: 'WSL2' },
    { os: 'Ubuntu 22.04', arch: 'x64', docker: 'Docker Engine', description: 'Native Linux' },
  ],
  should_pass: [
    { os: 'Windows 10', arch: 'x64', wsl: 'Ubuntu', description: 'WSL2' },
    { os: 'macOS Ventura', arch: 'arm64', docker: 'Docker Desktop', description: 'Previous macOS' },
    { os: 'macOS Ventura', arch: 'x64', docker: 'Docker Desktop', description: 'Previous macOS Intel' },
    { os: 'Ubuntu 24.04', arch: 'x64', docker: 'Docker Engine', description: 'Latest Ubuntu' },
  ],
};

/**
 * Compatibility test result
 * @typedef {Object} CompatibilityTestResult
 * @property {string} testName - Name of the test
 * @property {string} result - 'pass' | 'fail' | 'skip'
 * @property {string} [failureReason] - Reason for failure if applicable
 * @property {number} duration - Test duration in ms
 */

/**
 * Compatibility report structure
 * @typedef {Object} CompatibilityReport
 * @property {string} generatedAt - ISO timestamp
 * @property {Object} system - System information
 * @property {string} system.os_name - Operating system name
 * @property {string} system.os_version - OS version
 * @property {string} system.architecture - CPU architecture (x64, arm64)
 * @property {string} system.shell - Default shell
 * @property {string} system.docker_version - Docker version or 'not installed'
 * @property {string} system.node_version - Node.js version
 * @property {Object} environment - Detected environment
 * @property {CompatibilityTestResult[]} tests - Test results
 * @property {Object} summary - Summary statistics
 */

/**
 * Gets current system information for compatibility reporting (Task 7.4)
 * @returns {Object} System information
 */
function getSystemInfo() {
  const { execSync } = require('child_process');

  // Get OS info
  const platform = os.platform();
  const release = os.release();
  const arch = os.arch();

  // Get OS name
  let osName = 'Unknown';
  if (platform === 'darwin') {
    try {
      const swVers = execSync('sw_vers -productName 2>/dev/null', { encoding: 'utf8' }).trim();
      const swVersion = execSync('sw_vers -productVersion 2>/dev/null', { encoding: 'utf8' }).trim();
      osName = `${swVers} ${swVersion}`;
    } catch {
      osName = `macOS ${release}`;
    }
  } else if (platform === 'linux') {
    try {
      const lsbRelease = execSync('lsb_release -d 2>/dev/null || cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d \'"\'', { encoding: 'utf8' }).trim();
      osName = lsbRelease.replace('Description:\t', '') || `Linux ${release}`;
    } catch {
      osName = `Linux ${release}`;
    }
  } else if (platform === 'win32') {
    osName = `Windows ${release}`;
  }

  // Get shell
  const shell = process.env.SHELL || process.env.ComSpec || 'unknown';

  // Get Docker version
  let dockerVersion = 'not installed';
  try {
    dockerVersion = execSync('docker --version 2>/dev/null', { encoding: 'utf8' }).trim();
  } catch {
    // Docker not available
  }

  // Get Node version
  const nodeVersion = process.version;

  return {
    os_name: osName,
    os_version: release,
    architecture: arch,
    shell: path.basename(shell),
    docker_version: dockerVersion,
    node_version: nodeVersion,
  };
}

/**
 * Generates a compatibility report after test run (Task 7.4, 7.5)
 *
 * @param {CompatibilityTestResult[]} testResults - Array of test results
 * @returns {CompatibilityReport} Generated compatibility report
 */
function generateCompatibilityReport(testResults = []) {
  const systemInfo = getSystemInfo();
  const environment = detectEnvironment();

  // Calculate summary
  const passed = testResults.filter((t) => t.result === 'pass').length;
  const failed = testResults.filter((t) => t.result === 'fail').length;
  const skipped = testResults.filter((t) => t.result === 'skip').length;
  const total = testResults.length;

  // Determine matrix classification
  const matchesMustPass = OS_COMPATIBILITY_MATRIX.must_pass.some(
    (m) => systemInfo.os_name.toLowerCase().includes(m.os.toLowerCase().split(' ')[0]),
  );
  const matchesShouldPass = OS_COMPATIBILITY_MATRIX.should_pass.some(
    (m) => systemInfo.os_name.toLowerCase().includes(m.os.toLowerCase().split(' ')[0]),
  );

  return {
    generatedAt: new Date().toISOString(),
    system: systemInfo,
    environment: {
      type: environment.type,
      supportsVisualTerminal: environment.supportsVisualTerminal,
      reason: environment.reason,
    },
    matrixClassification: matchesMustPass ? 'must_pass' : matchesShouldPass ? 'should_pass' : 'not_in_matrix',
    tests: testResults,
    summary: {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    },
  };
}

/**
 * Formats compatibility report for console output (Task 7.5)
 * @param {CompatibilityReport} report - Compatibility report
 * @returns {string} Formatted report string
 */
function formatCompatibilityReport(report) {
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '                 AIOX Terminal Spawner Compatibility Report     ',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '── System Information ──────────────────────────────────────────',
    `  OS:           ${report.system.os_name}`,
    `  Version:      ${report.system.os_version}`,
    `  Architecture: ${report.system.architecture}`,
    `  Shell:        ${report.system.shell}`,
    `  Docker:       ${report.system.docker_version}`,
    `  Node.js:      ${report.system.node_version}`,
    '',
    '── Environment Detection ───────────────────────────────────────',
    `  Type:         ${report.environment.type}`,
    `  Visual Term:  ${report.environment.supportsVisualTerminal ? 'Yes' : 'No'}`,
    `  Reason:       ${report.environment.reason}`,
    '',
    `  Matrix Class: ${report.matrixClassification.toUpperCase()}`,
    '',
  ];

  if (report.tests.length > 0) {
    lines.push('── Test Results ────────────────────────────────────────────────');
    for (const test of report.tests) {
      const icon = test.result === 'pass' ? '✅' : test.result === 'fail' ? '❌' : '⏭️';
      const duration = test.duration ? ` (${test.duration}ms)` : '';
      lines.push(`  ${icon} ${test.testName}${duration}`);
      if (test.failureReason) {
        lines.push(`     └─ ${test.failureReason}`);
      }
    }
    lines.push('');
  }

  lines.push('── Summary ─────────────────────────────────────────────────────');
  lines.push(`  Total:   ${report.summary.total}`);
  lines.push(`  Passed:  ${report.summary.passed}`);
  lines.push(`  Failed:  ${report.summary.failed}`);
  lines.push(`  Skipped: ${report.summary.skipped}`);
  lines.push(`  Rate:    ${report.summary.passRate}%`);
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

// ============================================
// Lock File Cleanup and Signal Handling (Story 12.10 - Task 3)
// ============================================

/**
 * Active lock files being tracked for cleanup
 * @type {Set<string>}
 */
const activeLockFiles = new Set();

/**
 * Active child processes being tracked for cleanup
 * @type {Set<ChildProcess>}
 */
const activeChildProcesses = new Set();

/**
 * Registers a lock file for cleanup on process exit
 * @param {string} lockPath - Path to lock file
 */
function registerLockFile(lockPath) {
  activeLockFiles.add(lockPath);
}

/**
 * Unregisters a lock file (called when process completes normally)
 * @param {string} lockPath - Path to lock file
 */
function unregisterLockFile(lockPath) {
  activeLockFiles.delete(lockPath);
}

/**
 * Registers a child process for cleanup on parent exit
 * @param {ChildProcess} child - Child process to track
 */
function registerChildProcess(child) {
  activeChildProcesses.add(child);
  child.on('close', () => {
    activeChildProcesses.delete(child);
  });
}

/**
 * Cleans up all registered lock files (Task 3.3)
 * Called on process exit or signal
 */
function cleanupLocks() {
  for (const lockPath of activeLockFiles) {
    try {
      if (fsSync.existsSync(lockPath)) {
        fsSync.unlinkSync(lockPath);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
  activeLockFiles.clear();
}

/**
 * Terminates all active child processes (Task 3.4)
 */
function terminateChildProcesses() {
  for (const child of activeChildProcesses) {
    try {
      child.kill('SIGTERM');
    } catch {
      // Ignore if already dead
    }
  }
  activeChildProcesses.clear();
}

/**
 * Cleanup handler for process exit/signals (Task 3.4)
 * @param {string} signal - Signal name or 'exit'
 */
function cleanupHandler(signal) {
  console.log(`[TerminalSpawner] Cleanup triggered by ${signal}`);
  cleanupLocks();
  terminateChildProcesses();
}

// Register cleanup handlers (Task 3.4)
// Only register once, even if module is required multiple times
if (!process._terminalSpawnerCleanupRegistered) {
  process._terminalSpawnerCleanupRegistered = true;

  // Normal exit
  process.on('exit', () => cleanupHandler('exit'));

  // Ctrl+C
  process.on('SIGINT', () => {
    cleanupHandler('SIGINT');
    process.exit(1);
  });

  // Termination signal (kill command)
  process.on('SIGTERM', () => {
    cleanupHandler('SIGTERM');
    process.exit(1);
  });

  // Uncaught exception (try to cleanup before crash)
  process.on('uncaughtException', (error) => {
    console.error('[TerminalSpawner] Uncaught exception:', error);
    cleanupHandler('uncaughtException');
    process.exit(1);
  });

  // Unhandled promise rejection
  process.on('unhandledRejection', (reason) => {
    console.error('[TerminalSpawner] Unhandled rejection:', reason);
    cleanupHandler('unhandledRejection');
    process.exit(1);
  });
}

module.exports = {
  // Main API
  spawnAgent,
  spawnInline,
  createContextFile,
  pollForOutput,

  // Environment Detection (Story 12.10)
  detectEnvironment,
  ENVIRONMENT_TYPE,

  // OS Compatibility Matrix (Story 12.10 - Task 7)
  OS_COMPATIBILITY_MATRIX,
  getSystemInfo,
  generateCompatibilityReport,
  formatCompatibilityReport,

  // Utilities
  isSpawnerAvailable,
  getPlatform,
  cleanupOldFiles,
  getScriptPath,

  // Lock Management (Story 12.10)
  registerLockFile,
  unregisterLockFile,
  cleanupLocks,

  // Constants
  DEFAULT_TIMEOUT_MS,
  POLL_INTERVAL_MS,
  MAX_RETRIES,
};
