/**
 * Squad Publisher Utility
 *
 * Publishes squads to the aiox-squads GitHub repository via Pull Request.
 * Requires GitHub CLI (gh) authentication.
 *
 * @module squad-publisher
 * @version 1.0.0
 * @see Story SQS-6: Download & Publish Tasks
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * Regex pattern for safe squad/branch names
 * Only allows alphanumerics, hyphens, underscores, and dots
 * @constant {RegExp}
 */
const SAFE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/**
 * Repository for aiox-squads
 * @constant {string}
 */
const AIOX_SQUADS_REPO = 'SynkraAI/aiox-squads';

/**
 * Error codes for SquadPublisherError
 * @enum {string}
 */
const PublisherErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SQUAD_NOT_FOUND: 'SQUAD_NOT_FOUND',
  MANIFEST_ERROR: 'MANIFEST_ERROR',
  GH_CLI_ERROR: 'GH_CLI_ERROR',
  PR_ERROR: 'PR_ERROR',
  FORK_ERROR: 'FORK_ERROR',
  SQUAD_EXISTS_IN_REGISTRY: 'SQUAD_EXISTS_IN_REGISTRY',
  INVALID_SQUAD_NAME: 'INVALID_SQUAD_NAME',
};

/**
 * Sanitize a string for safe use in shell commands and file paths
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
function sanitizeForShell(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  // Replace unsafe characters with hyphens, then collapse multiple hyphens
  return value
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate that a name is safe for use in shell commands
 * @param {string} name - Name to validate
 * @returns {boolean} True if safe
 */
function isValidName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  return SAFE_NAME_PATTERN.test(name);
}

/**
 * Custom error class for Squad Publisher operations
 * @extends Error
 */
class SquadPublisherError extends Error {
  /**
   * Create a SquadPublisherError
   * @param {string} code - Error code from PublisherErrorCodes
   * @param {string} message - Human-readable error message
   * @param {string} [suggestion] - Suggested fix for the error
   */
  constructor(code, message, suggestion) {
    super(message);
    this.name = 'SquadPublisherError';
    this.code = code;
    this.suggestion = suggestion || '';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SquadPublisherError);
    }
  }

  /**
   * Returns formatted error string
   * @returns {string}
   */
  toString() {
    let str = `[${this.code}] ${this.message}`;
    if (this.suggestion) {
      str += `\n  Suggestion: ${this.suggestion}`;
    }
    return str;
  }
}

/**
 * Squad Publisher class for publishing squads to aiox-squads repository
 */
class SquadPublisher {
  /**
   * Create a SquadPublisher instance
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.dryRun=false] - Simulate without creating PR
   * @param {string} [options.repo] - Target repository (default: SynkraAI/aiox-squads)
   */
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.repo = options.repo || AIOX_SQUADS_REPO;
  }

  /**
   * Log message if verbose mode is enabled
   * @private
   * @param {string} message - Message to log
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadPublisher] ${message}`);
    }
  }

  /**
   * Check GitHub CLI authentication
   *
   * @returns {Promise<{authenticated: boolean, username: string|null}>}
   *
   * @example
   * const publisher = new SquadPublisher();
   * const auth = await publisher.checkAuth();
   * if (!auth.authenticated) {
   *   console.log('Please run: gh auth login');
   * }
   */
  async checkAuth() {
    this._log('Checking GitHub CLI authentication');

    try {
      const result = execSync('gh auth status', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Extract username from output (supports hyphenated GitHub usernames)
      const usernameMatch = result.match(/Logged in to .* as ([\w-]+)/);
      const username = usernameMatch ? usernameMatch[1] : null;

      this._log(`Authenticated as: ${username || 'unknown'}`);
      return { authenticated: true, username };
    } catch {
      this._log('Not authenticated with GitHub CLI');
      return { authenticated: false, username: null };
    }
  }

  /**
   * Publish squad to aiox-squads repository
   *
   * @param {string} squadPath - Path to squad directory
   * @param {Object} [options={}] - Publish options
   * @param {string} [options.category='community'] - Category: 'official' or 'community'
   * @returns {Promise<{prUrl: string, branch: string, manifest: object}>}
   * @throws {SquadPublisherError} AUTH_REQUIRED if not authenticated
   * @throws {SquadPublisherError} VALIDATION_FAILED if squad validation fails
   * @throws {SquadPublisherError} SQUAD_NOT_FOUND if squad path doesn't exist
   *
   * @example
   * const publisher = new SquadPublisher();
   * const result = await publisher.publish('./squads/my-squad');
   * console.log(`PR created: ${result.prUrl}`);
   *
   * // Dry run
   * const dryPublisher = new SquadPublisher({ dryRun: true });
   * const preview = await dryPublisher.publish('./squads/my-squad');
   */
  async publish(squadPath, options = {}) {
    const category = options.category || 'community';

    this._log(`Publishing squad from: ${squadPath}`);
    this._log(`Category: ${category}`);
    this._log(`Dry run: ${this.dryRun}`);

    // 1. Check if squad path exists
    if (!(await this._pathExists(squadPath))) {
      throw new SquadPublisherError(
        PublisherErrorCodes.SQUAD_NOT_FOUND,
        `Squad not found at: ${squadPath}`,
        'Check the path and ensure squad exists',
      );
    }

    // 2. Validate squad
    const validation = await this._validateSquad(squadPath);
    if (!validation.valid) {
      throw new SquadPublisherError(
        PublisherErrorCodes.VALIDATION_FAILED,
        `Squad validation failed:\n${validation.errors.map((e) => e.message).join('\n')}`,
        'Run *validate-squad to see all issues',
      );
    }

    // 3. Load manifest
    const manifest = await this._loadManifest(squadPath);
    if (!manifest || !manifest.name) {
      throw new SquadPublisherError(
        PublisherErrorCodes.MANIFEST_ERROR,
        'Failed to load squad manifest or missing name',
        'Ensure squad.yaml has required fields: name, version',
      );
    }

    const squadName = manifest.name;

    // 3.1 Validate squad name is safe for shell commands
    if (!isValidName(squadName)) {
      throw new SquadPublisherError(
        PublisherErrorCodes.INVALID_SQUAD_NAME,
        `Invalid squad name: "${squadName}". Only alphanumerics, hyphens, underscores, and dots allowed.`,
        'Update squad.yaml name field to use only safe characters',
      );
    }

    const branchName = `squad/${squadName}`;

    this._log(`Squad name: ${squadName}`);
    this._log(`Branch: ${branchName}`);

    // 4. Check GitHub auth
    const auth = await this.checkAuth();
    if (!auth.authenticated) {
      throw new SquadPublisherError(
        PublisherErrorCodes.AUTH_REQUIRED,
        'GitHub CLI not authenticated',
        'Run: gh auth login',
      );
    }

    // 5. Generate PR body
    const prTitle = `Add squad: ${squadName}`;
    const prBody = this.generatePRBody(manifest, category);

    // 6. Dry run - return preview
    if (this.dryRun) {
      this._log('Dry run mode - not creating actual PR');
      return {
        prUrl: '[dry-run] PR would be created',
        branch: branchName,
        manifest,
        preview: {
          title: prTitle,
          body: prBody,
          repo: this.repo,
          category,
        },
      };
    }

    // 7. Create actual PR
    const prUrl = await this._createPR(squadPath, manifest, branchName, prTitle, prBody);

    this._log(`PR created: ${prUrl}`);
    return { prUrl, branch: branchName, manifest };
  }

  /**
   * Generate PR body with squad metadata
   *
   * @param {Object} manifest - Squad manifest
   * @param {string} [category='community'] - Squad category
   * @returns {string} Markdown-formatted PR body
   */
  generatePRBody(manifest, category = 'community') {
    const components = manifest.components || {};
    const tasksCount = components.tasks?.length || 0;
    const agentsCount = components.agents?.length || 0;
    const workflowsCount = components.workflows?.length || 0;
    const checklistsCount = components.checklists?.length || 0;
    const templatesCount = components.templates?.length || 0;

    return `## New Squad: ${manifest.name}

**Version:** ${manifest.version || '1.0.0'}
**Author:** ${manifest.author || 'Unknown'}
**Category:** ${category}
**Description:** ${manifest.description || 'No description provided'}

### Components

| Type | Count |
|------|-------|
| Tasks | ${tasksCount} |
| Agents | ${agentsCount} |
| Workflows | ${workflowsCount} |
| Checklists | ${checklistsCount} |
| Templates | ${templatesCount} |

### Dependencies

${manifest.dependencies?.length > 0 ? manifest.dependencies.map((d) => `- ${d}`).join('\n') : 'None specified'}

### Pre-submission Checklist

- [x] Squad follows AIOX task-first architecture
- [x] Documentation is complete (squad.yaml has all required fields)
- [x] Squad validated locally with \`*validate-squad\`
- [ ] No sensitive data included (API keys, credentials, etc.)
- [ ] All files use kebab-case naming convention

### Testing

Tested locally with:
\`\`\`bash
@squad-creator
*validate-squad ${manifest.name}
\`\`\`

---
*Submitted via \`*publish-squad\` from AIOX-FullStack*`;
  }

  /**
   * Create PR using GitHub CLI
   * @private
   * @param {string} squadPath - Path to squad
   * @param {Object} manifest - Squad manifest
   * @param {string} branchName - Branch name
   * @param {string} title - PR title
   * @param {string} body - PR body
   * @returns {Promise<string>} PR URL
   */
  async _createPR(squadPath, manifest, branchName, title, body) {
    const squadName = manifest.name;
    // Sanitize values for commit message (safety layer even though name is validated)
    const safeVersion = sanitizeForShell(manifest.version) || '1.0.0';
    const safeAuthor = sanitizeForShell(manifest.author) || 'Unknown';

    try {
      // Step 1: Fork the repository (if not already forked)
      this._log('Checking/creating fork...');
      try {
        // Use spawnSync with array args to prevent shell injection
        const forkResult = spawnSync('gh', ['repo', 'fork', this.repo, '--clone=false'], {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        if (forkResult.error) {
          throw forkResult.error;
        }
      } catch {
        // Fork may already exist, that's OK
        this._log('Fork already exists or created');
      }

      // Step 2: Clone the fork to a temp directory
      const tempDir = path.join(process.cwd(), '.tmp-squad-publish');
      await this._cleanupTemp(tempDir);
      await fs.mkdir(tempDir, { recursive: true });

      this._log(`Cloning fork to: ${tempDir}`);
      // Use spawnSync with array args
      const cloneResult = spawnSync('gh', ['repo', 'clone', this.repo, tempDir, '--', '--depth', '1'], {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (cloneResult.status !== 0) {
        throw new Error(cloneResult.stderr || 'Clone failed');
      }

      // Step 3: Create branch
      this._log(`Creating branch: ${branchName}`);
      // Use spawnSync with array args - branchName is validated
      const checkoutResult = spawnSync('git', ['checkout', '-b', branchName], {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (checkoutResult.status !== 0) {
        throw new Error(checkoutResult.stderr || 'Checkout failed');
      }

      // Step 4: Copy squad files
      const targetSquadDir = path.join(tempDir, 'packages', squadName);
      await fs.mkdir(targetSquadDir, { recursive: true });
      await this._copyDir(squadPath, targetSquadDir);

      this._log(`Copied squad to: ${targetSquadDir}`);

      // Step 5: Update registry.json (add to community section)
      const registryPath = path.join(tempDir, 'registry.json');
      await this._updateRegistry(registryPath, manifest);

      // Step 6: Commit changes
      this._log('Committing changes...');
      spawnSync('git', ['add', '.'], {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Build commit message with sanitized values
      const commitMessage = `Add squad: ${squadName}\n\nVersion: ${safeVersion}\nAuthor: ${safeAuthor}`;
      // Use spawnSync with -m flag and message as separate arg
      const commitResult = spawnSync('git', ['commit', '-m', commitMessage], {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (commitResult.status !== 0) {
        throw new Error(commitResult.stderr || 'Commit failed');
      }

      // Step 7: Push branch
      this._log('Pushing to fork...');
      // Use spawnSync with array args - branchName is validated
      const pushResult = spawnSync('git', ['push', '-u', 'origin', branchName], {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (pushResult.status !== 0) {
        throw new Error(pushResult.stderr || 'Push failed');
      }

      // Step 8: Create PR
      this._log('Creating PR...');
      const prBodyFile = path.join(tempDir, 'pr-body.md');
      await fs.writeFile(prBodyFile, body);

      // Use spawnSync with array args - title contains validated squadName
      const prResult = spawnSync(
        'gh',
        ['pr', 'create', '--repo', this.repo, '--title', title, '--body-file', prBodyFile, '--base', 'main'],
        {
          cwd: tempDir,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );
      if (prResult.status !== 0) {
        throw new Error(prResult.stderr || 'PR creation failed');
      }

      const prUrl = (prResult.stdout || '').trim();

      // Step 9: Cleanup
      await this._cleanupTemp(tempDir);

      return prUrl;
    } catch (error) {
      throw new SquadPublisherError(
        PublisherErrorCodes.PR_ERROR,
        `Failed to create PR: ${error.message}`,
        'Check GitHub CLI is working: gh auth status',
      );
    }
  }

  /**
   * Update registry.json with new squad
   * @private
   * @param {string} registryPath - Path to registry.json
   * @param {Object} manifest - Squad manifest
   */
  async _updateRegistry(registryPath, manifest) {
    let registry;

    try {
      const content = await fs.readFile(registryPath, 'utf-8');
      registry = JSON.parse(content);
    } catch {
      // Create new registry if doesn't exist
      registry = {
        version: '1.0.0',
        squads: {
          official: [],
          community: [],
        },
      };
    }

    // Ensure structure
    if (!registry.squads) {
      registry.squads = {};
    }
    if (!registry.squads.community) {
      registry.squads.community = [];
    }

    // Check if squad already exists
    const exists = registry.squads.community.some((s) => s.name === manifest.name);
    if (exists) {
      // Update existing entry
      registry.squads.community = registry.squads.community.map((s) =>
        s.name === manifest.name
          ? {
            name: manifest.name,
            version: manifest.version || '1.0.0',
            description: manifest.description || '',
            author: manifest.author || 'Unknown',
          }
          : s,
      );
    } else {
      // Add new entry
      registry.squads.community.push({
        name: manifest.name,
        version: manifest.version || '1.0.0',
        description: manifest.description || '',
        author: manifest.author || 'Unknown',
      });
    }

    // Sort alphabetically
    registry.squads.community.sort((a, b) => a.name.localeCompare(b.name));

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
    this._log('Updated registry.json');
  }

  /**
   * Validate squad
   * @private
   * @param {string} squadPath - Path to squad
   * @returns {Promise<{valid: boolean, errors: Array}>}
   */
  async _validateSquad(squadPath) {
    try {
      const { SquadValidator } = require('./squad-validator');
      const validator = new SquadValidator({ verbose: this.verbose });
      return await validator.validate(squadPath);
    } catch (error) {
      this._log(`Validation error: ${error.message}`);
      return {
        valid: false,
        errors: [{ message: `Validation failed: ${error.message}` }],
      };
    }
  }

  /**
   * Load squad manifest
   * @private
   * @param {string} squadPath - Path to squad
   * @returns {Promise<Object|null>}
   */
  async _loadManifest(squadPath) {
    try {
      const { SquadLoader } = require('./squad-loader');
      const loader = new SquadLoader();
      return await loader.loadManifest(squadPath);
    } catch (error) {
      this._log(`Failed to load manifest: ${error.message}`);
      return null;
    }
  }

  /**
   * Copy directory recursively
   * @private
   * @param {string} src - Source path
   * @param {string} dest - Destination path
   */
  async _copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this._copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Clean up temp directory
   * @private
   * @param {string} tempDir - Temp directory path
   */
  async _cleanupTemp(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Check if path exists
   * @private
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async _pathExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = {
  SquadPublisher,
  SquadPublisherError,
  PublisherErrorCodes,
  AIOX_SQUADS_REPO,
  SAFE_NAME_PATTERN,
  sanitizeForShell,
  isValidName,
};
