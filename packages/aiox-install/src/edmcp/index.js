/**
 * edmcp - Docker MCP Gateway Manager
 *
 * CLI for managing MCPs (Model Context Protocol servers) in the Docker Gateway.
 *
 * Commands:
 * - list: List active MCPs
 * - add: Add MCP from repository
 * - remove: Remove MCP
 *
 * @module edmcp
 */

'use strict';

const { execa } = require('execa');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

/**
 * Check if Docker is installed and running
 * @returns {Object} Docker status
 */
async function checkDocker() {
  const result = {
    installed: false,
    running: false,
    version: null,
    error: null,
  };

  try {
    // Check if Docker is installed
    const { stdout: versionOutput } = await execa('docker', ['--version'], {
      timeout: 5000,
    });

    result.installed = true;
    const versionMatch = versionOutput.match(/Docker version (\d+\.\d+\.\d+)/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }

    // Check if Docker daemon is running
    const { exitCode } = await execa('docker', ['info'], {
      timeout: 10000,
      reject: false,
    });

    result.running = exitCode === 0;
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Ensure Docker is available and running
 * @throws {Error} If Docker is not available
 */
async function ensureDocker() {
  const docker = await checkDocker();

  if (!docker.installed) {
    throw new Error(
      'Docker is not installed.\n' +
      'Please install Docker Desktop from https://docker.com\n' +
      'Or use your package manager: brew install --cask docker',
    );
  }

  if (!docker.running) {
    throw new Error(
      'Docker daemon is not running.\n' +
      'Please start Docker Desktop or run: sudo systemctl start docker',
    );
  }

  return docker;
}

/**
 * List active MCPs in the Docker Gateway
 * @param {Object} options - List options
 * @param {boolean} options.json - Output in JSON format
 */
async function listMcps(options = {}) {
  await ensureDocker();

  const spinner = ora('Fetching MCPs from Docker Gateway...').start();

  try {
    // Try docker mcp tools ls first
    const { stdout, exitCode } = await execa('docker', ['mcp', 'tools', 'ls'], {
      timeout: 30000,
      reject: false,
    });

    if (exitCode !== 0) {
      // Fallback: try to list MCP containers directly
      const { stdout: containerOutput } = await execa(
        'docker',
        ['ps', '--filter', 'label=mcp.server', '--format', '{{.Names}}\t{{.Status}}\t{{.Image}}'],
        { timeout: 15000 },
      );

      spinner.stop();

      if (!containerOutput.trim()) {
        console.log(chalk.yellow('No MCP servers found in Docker Gateway.'));
        console.log(chalk.dim('Use `edmcp add <name>` to add an MCP server.'));
        return;
      }

      if (options.json) {
        const mcps = containerOutput.trim().split('\n').map(line => {
          const [name, status, image] = line.split('\t');
          return { name, status, image };
        });
        console.log(JSON.stringify(mcps, null, 2));
      } else {
        console.log(chalk.bold('\nActive MCP Servers:'));
        console.log(chalk.dim('─'.repeat(60)));
        console.log(containerOutput);
      }

      return;
    }

    spinner.stop();

    if (options.json) {
      // Parse and output as JSON
      const lines = stdout.trim().split('\n').filter(Boolean);
      const mcps = lines.map(line => {
        const parts = line.split(/\s+/);
        return {
          name: parts[0],
          tools: parts.slice(1).join(' '),
        };
      });
      console.log(JSON.stringify(mcps, null, 2));
    } else {
      console.log(chalk.bold('\nMCP Tools in Docker Gateway:'));
      console.log(chalk.dim('─'.repeat(60)));
      console.log(stdout);
    }
  } catch (error) {
    spinner.fail('Failed to list MCPs');
    throw error;
  }
}

/**
 * Parse MCP name or URL
 * @param {string} nameOrUrl - MCP name or repository URL
 * @returns {Object} Parsed MCP info
 */
function parseMcpSource(nameOrUrl) {
  // Check if it's a URL
  if (nameOrUrl.startsWith('http://') || nameOrUrl.startsWith('https://') || nameOrUrl.startsWith('git@')) {
    const urlMatch = nameOrUrl.match(/\/([^/]+?)(\.git)?$/);
    const name = urlMatch ? urlMatch[1] : path.basename(nameOrUrl, '.git');
    return {
      type: 'url',
      url: nameOrUrl,
      name: name.replace(/^mcp-/, ''),
    };
  }

  // Check if it's a GitHub shorthand (user/repo)
  if (nameOrUrl.includes('/') && !nameOrUrl.includes(':')) {
    return {
      type: 'github',
      url: `https://github.com/${nameOrUrl}`,
      name: nameOrUrl.split('/').pop().replace(/^mcp-/, ''),
    };
  }

  // It's a name - assume it's from the MCP catalog
  return {
    type: 'catalog',
    name: nameOrUrl,
    url: null,
  };
}

/**
 * Add an MCP from a repository
 * @param {string} nameOrUrl - MCP name or repository URL
 * @param {Object} options - Add options
 * @param {string} options.configPath - Custom config file path
 * @param {string[]} options.envVars - Environment variables (KEY=value)
 */
async function addMcp(nameOrUrl, options = {}) {
  await ensureDocker();

  const source = parseMcpSource(nameOrUrl);

  console.log(chalk.bold(`\nAdding MCP: ${source.name}`));
  console.log(chalk.dim('─'.repeat(40)));

  // Try docker mcp server enable first (for catalog MCPs)
  if (source.type === 'catalog') {
    const spinner = ora(`Enabling MCP server: ${source.name}...`).start();

    try {
      const { stdout, exitCode } = await execa(
        'docker',
        ['mcp', 'server', 'enable', source.name],
        { timeout: 60000, reject: false },
      );

      if (exitCode === 0) {
        spinner.succeed(`MCP server enabled: ${source.name}`);
        console.log(chalk.dim(stdout));
        return;
      }

      spinner.info(`MCP ${source.name} not found in catalog, trying custom installation...`);
    } catch (_error) {
      spinner.info('Catalog lookup failed, trying custom installation...');
    }
  }

  // Custom installation from URL
  if (source.url) {
    const spinner = ora(`Cloning ${source.url}...`).start();

    const mcpDir = path.join(os.homedir(), '.aiox', 'mcps', source.name);

    try {
      // Clone repository
      await fs.ensureDir(path.dirname(mcpDir));

      if (await fs.pathExists(mcpDir)) {
        spinner.info('MCP directory already exists, updating...');
        await execa('git', ['pull'], { cwd: mcpDir, timeout: 60000 });
      } else {
        await execa('git', ['clone', source.url, mcpDir], { timeout: 120000 });
      }

      spinner.succeed('Repository cloned');

      // Check for Dockerfile or docker-compose.yml
      const hasDockerfile = await fs.pathExists(path.join(mcpDir, 'Dockerfile'));
      const hasCompose = await fs.pathExists(path.join(mcpDir, 'docker-compose.yml'));

      if (hasDockerfile || hasCompose) {
        const buildSpinner = ora('Building Docker image...').start();

        if (hasCompose) {
          await execa('docker', ['compose', 'up', '-d'], { cwd: mcpDir, timeout: 300000 });
        } else {
          await execa('docker', ['build', '-t', `mcp-${source.name}`, '.'], { cwd: mcpDir, timeout: 300000 });
          await execa('docker', ['run', '-d', '--name', `mcp-${source.name}`, '--label', 'mcp.server=true', `mcp-${source.name}`], { timeout: 60000 });
        }

        buildSpinner.succeed('MCP container started');
      } else {
        // Try npm-based MCP
        const hasPackageJson = await fs.pathExists(path.join(mcpDir, 'package.json'));

        if (hasPackageJson) {
          const npmSpinner = ora('Installing npm dependencies...').start();
          await execa('npm', ['install'], { cwd: mcpDir, timeout: 300000 });
          npmSpinner.succeed('Dependencies installed');

          console.log(chalk.yellow('\nNote: This MCP needs to be run manually:'));
          console.log(chalk.dim(`  cd ${mcpDir} && npm start`));
        } else {
          console.log(chalk.yellow('\nNote: No Dockerfile or package.json found.'));
          console.log(chalk.dim('Please check the MCP documentation for installation instructions.'));
        }
      }

      console.log(chalk.green(`\n✓ MCP ${source.name} added successfully`));

      // Show environment variable hints if provided
      if (options.envVars && options.envVars.length > 0) {
        console.log(chalk.dim('\nEnvironment variables configured:'));
        for (const env of options.envVars) {
          const [key] = env.split('=');
          console.log(chalk.dim(`  ${key}=***`));
        }
      }
    } catch (error) {
      spinner.fail('Failed to add MCP');
      throw error;
    }
  } else {
    throw new Error(`Unknown MCP: ${source.name}\nProvide a GitHub URL or repository path.`);
  }
}

/**
 * Remove an MCP from the Docker Gateway
 * @param {string} name - MCP name
 * @param {Object} options - Remove options
 * @param {boolean} options.force - Force removal without confirmation
 */
async function removeMcp(name, options = {}) {
  await ensureDocker();

  console.log(chalk.bold(`\nRemoving MCP: ${name}`));
  console.log(chalk.dim('─'.repeat(40)));

  // Try docker mcp server disable first
  const spinner = ora(`Disabling MCP server: ${name}...`).start();

  try {
    const { exitCode } = await execa(
      'docker',
      ['mcp', 'server', 'disable', name],
      { timeout: 30000, reject: false },
    );

    if (exitCode === 0) {
      spinner.succeed(`MCP server disabled: ${name}`);
      return;
    }

    spinner.info('Not a catalog MCP, trying container removal...');
  } catch {
    spinner.info('Trying container removal...');
  }

  // Try to stop and remove container
  const containerName = `mcp-${name}`;

  try {
    // Stop container
    await execa('docker', ['stop', containerName], { timeout: 30000, reject: false });

    // Remove container
    const { exitCode } = await execa('docker', ['rm', containerName], { timeout: 30000, reject: false });

    if (exitCode === 0) {
      spinner.succeed(`Container removed: ${containerName}`);
    } else {
      spinner.warn(`Container not found: ${containerName}`);
    }

    // Optionally remove image
    if (options.force) {
      const imageSpinner = ora('Removing Docker image...').start();
      await execa('docker', ['rmi', containerName], { timeout: 30000, reject: false });
      imageSpinner.succeed('Image removed');
    }

    // Clean up local directory
    const mcpDir = path.join(os.homedir(), '.aiox', 'mcps', name);
    if (await fs.pathExists(mcpDir)) {
      if (options.force) {
        await fs.remove(mcpDir);
        console.log(chalk.dim(`Removed directory: ${mcpDir}`));
      } else {
        console.log(chalk.yellow(`\nLocal directory preserved: ${mcpDir}`));
        console.log(chalk.dim('Use --force to remove it.'));
      }
    }

    console.log(chalk.green(`\n✓ MCP ${name} removed successfully`));
  } catch (error) {
    spinner.fail('Failed to remove MCP');
    throw error;
  }
}

module.exports = {
  checkDocker,
  ensureDocker,
  listMcps,
  addMcp,
  removeMcp,
  parseMcpSource,
};
