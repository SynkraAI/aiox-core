/**
 * Gemini CLI Check
 *
 * Verifies Gemini CLI installation, authentication, and configuration.
 * Detects available features including Preview features, Extensions, and Hooks.
 *
 * @module aios-core/health-check/checks/services/gemini-cli
 * @version 1.0.0
 * @story GEMINI-INT Story 1 - Gemini CLI Health Check & Detection
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Gemini CLI check
 *
 * @class GeminiCliCheck
 * @extends BaseCheck
 */
class GeminiCliCheck extends BaseCheck {
  constructor() {
    super({
      id: 'services.gemini-cli',
      name: 'Gemini CLI',
      description: 'Verifies Gemini CLI installation and configuration',
      domain: CheckDomain.SERVICES,
      severity: CheckSeverity.LOW,
      timeout: 5000,
      cacheable: true,
      healingTier: 0,
      tags: ['gemini', 'google', 'ai', 'cli'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const homeDir = os.homedir();

    const details = {
      installed: false,
      version: null,
      authenticated: false,
      projectConfig: false,
      globalConfig: false,
      features: {
        previewFeatures: false,
        hooks: false,
        extensions: [],
      },
    };

    // Check if gemini is installed
    try {
      const version = execSync('gemini --version', {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      }).trim();

      details.installed = true;
      details.version = version;
    } catch {
      // Not installed
    }

    // Check authentication status
    if (details.installed) {
      try {
        const authStatus = execSync('gemini auth status 2>&1', {
          encoding: 'utf8',
          timeout: 5000,
          windowsHide: true,
        });
        details.authenticated = !authStatus.toLowerCase().includes('not authenticated');
      } catch {
        details.authenticated = false;
      }
    }

    // Check project .gemini directory
    try {
      const geminiDir = path.join(projectRoot, '.gemini');
      await fs.access(geminiDir);
      details.projectConfig = true;

      // Check for rules.md (AIOS rules)
      try {
        await fs.access(path.join(geminiDir, 'rules.md'));
        details.hasProjectRules = true;
      } catch {
        details.hasProjectRules = false;
      }

      // Check for settings.json (hooks, extensions config)
      try {
        const settingsPath = path.join(geminiDir, 'settings.json');
        const settingsContent = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(settingsContent);

        // Check for hooks configuration
        if (settings.hooks && Object.keys(settings.hooks).length > 0) {
          details.features.hooks = true;
          details.features.hookEvents = Object.keys(settings.hooks);
        }

        // Check for preview features
        if (settings.previewFeatures === true) {
          details.features.previewFeatures = true;
        }
      } catch {
        // No settings.json or invalid JSON
      }

      // Check for AIOS agents
      try {
        const agentsDir = path.join(geminiDir, 'rules', 'AIOS', 'agents');
        const agentFiles = await fs.readdir(agentsDir);
        details.aiosAgents = agentFiles.filter((f) => f.endsWith('.md')).length;
      } catch {
        details.aiosAgents = 0;
      }
    } catch {
      // No project config
    }

    // Check global config (~/.gemini or similar)
    try {
      const globalGeminiDir = path.join(homeDir, '.gemini');
      await fs.access(globalGeminiDir);
      details.globalConfig = true;

      // Check global settings
      try {
        const globalSettingsPath = path.join(globalGeminiDir, 'settings.json');
        const globalSettings = JSON.parse(await fs.readFile(globalSettingsPath, 'utf8'));

        if (globalSettings.previewFeatures === true) {
          details.features.previewFeatures = true;
        }
      } catch {
        // No global settings
      }
    } catch {
      // No global config
    }

    // Check for installed extensions
    if (details.installed) {
      try {
        const extensionsList = execSync('gemini extensions list --output-format json 2>/dev/null', {
          encoding: 'utf8',
          timeout: 10000,
          windowsHide: true,
        });
        const extensions = JSON.parse(extensionsList);
        if (Array.isArray(extensions)) {
          details.features.extensions = extensions.map((e) => e.name || e);
        }
      } catch {
        // Extensions command not available or failed
      }
    }

    // Not using Gemini CLI
    if (!details.installed && !details.projectConfig && !details.globalConfig) {
      return this.pass('Gemini CLI not detected (not using Gemini CLI)', {
        details,
      });
    }

    const issues = [];
    const warnings = [];

    // Check for issues
    if (details.installed && !details.authenticated) {
      issues.push('Not authenticated');
    }

    if (!details.projectConfig) {
      warnings.push('No project-level .gemini directory');
    }

    if (details.projectConfig && !details.hasProjectRules) {
      warnings.push('Project .gemini/rules.md not found');
    }

    if (details.projectConfig && details.aiosAgents === 0) {
      warnings.push('No AIOS agents installed for Gemini CLI');
    }

    if (!details.features.previewFeatures) {
      warnings.push('Preview features not enabled (needed for Gemini 3)');
    }

    // Return result based on severity
    if (issues.length > 0) {
      return this.warning(`Gemini CLI needs attention: ${issues.join(', ')}`, {
        recommendation: issues.includes('Not authenticated')
          ? 'Run `gemini` to authenticate with your Google account'
          : 'Run `npx aios-core install` and select Gemini CLI',
        details: { ...details, issues, warnings },
      });
    }

    if (warnings.length > 0) {
      return this.warning(`Gemini CLI configuration incomplete: ${warnings.join(', ')}`, {
        recommendation: 'Run `npx aios-core install` and select Gemini CLI',
        details: { ...details, warnings },
      });
    }

    // Build success message
    const parts = [];
    if (details.installed) parts.push(`CLI v${details.version}`);
    if (details.authenticated) parts.push('authenticated');
    if (details.projectConfig) parts.push('project config');
    if (details.features.previewFeatures) parts.push('preview features');
    if (details.features.hooks) parts.push(`${details.features.hookEvents.length} hooks`);
    if (details.features.extensions.length > 0) {
      parts.push(`${details.features.extensions.length} extensions`);
    }
    if (details.aiosAgents > 0) parts.push(`${details.aiosAgents} AIOS agents`);

    return this.pass(`Gemini CLI configured (${parts.join(', ')})`, {
      details,
    });
  }
}

module.exports = GeminiCliCheck;
