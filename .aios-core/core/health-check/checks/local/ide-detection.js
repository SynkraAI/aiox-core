/**
 * IDE Detection Check
 *
 * Detects and validates IDE/editor configuration.
 *
 * @module aios-core/health-check/checks/local/ide-detection
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const fs = require('fs').promises;
const path = require('path');
const { BaseCheck, CheckSeverity, CheckDomain } = require('../../base-check');

/**
 * Supported IDEs and their indicators
 */
const IDE_INDICATORS = [
  {
    name: 'VS Code',
    directory: '.vscode',
    files: ['settings.json', 'extensions.json'],
  },
  {
    name: 'JetBrains (IntelliJ/WebStorm)',
    directory: '.idea',
    files: ['workspace.xml'],
  },
  {
    name: 'Cursor',
    directory: '.cursor',
    files: [],
  },
];

/**
 * IDE detection check
 *
 * @class IdeDetectionCheck
 * @extends BaseCheck
 */
class IdeDetectionCheck extends BaseCheck {
  constructor() {
    super({
      id: 'local.ide-detection',
      name: 'IDE Detection',
      description: 'Detects IDE/editor configuration',
      domain: CheckDomain.LOCAL,
      severity: CheckSeverity.INFO,
      timeout: 2000,
      cacheable: true,
      healingTier: 0,
      tags: ['ide', 'editor', 'development'],
    });
  }

  /**
   * Execute the check
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Check result
   */
  async execute(context) {
    const projectRoot = context.projectRoot || process.cwd();
    const detectedIdes = [];
    const configIssues = [];

    for (const ide of IDE_INDICATORS) {
      const dirPath = path.join(projectRoot, ide.directory);

      try {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          const detected = {
            name: ide.name,
            directory: ide.directory,
            files: [],
          };

          // Check for expected files
          for (const file of ide.files) {
            const filePath = path.join(dirPath, file);
            try {
              await fs.access(filePath);
              detected.files.push(file);
            } catch {
              // File not found
            }
          }

          detectedIdes.push(detected);

          // Validate VS Code settings
          if (ide.name === 'VS Code') {
            const settingsPath = path.join(dirPath, 'settings.json');
            try {
              const content = await fs.readFile(settingsPath, 'utf8');
              JSON.parse(content);
            } catch (error) {
              if (error instanceof SyntaxError) {
                configIssues.push('VS Code settings.json has invalid JSON');
              }
            }
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    // Check for Claude Code config
    const claudeDir = path.join(projectRoot, '.claude');
    try {
      await fs.access(claudeDir);
      detectedIdes.push({
        name: 'Claude Code',
        directory: '.claude',
        files: [],
      });
    } catch {
      // Not using Claude Code in this project
    }

    if (detectedIdes.length === 0) {
      return this.pass('No IDE configuration detected (using default settings)', {
        details: { message: 'Project is IDE-agnostic' },
      });
    }

    if (configIssues.length > 0) {
      return this.warning(`IDE configuration issues: ${configIssues.join(', ')}`, {
        recommendation: 'Fix configuration files for better IDE integration',
        details: {
          detected: detectedIdes,
          issues: configIssues,
        },
      });
    }

    const ideNames = detectedIdes.map((i) => i.name).join(', ');
    return this.pass(`Detected IDE(s): ${ideNames}`, {
      details: { detected: detectedIdes },
    });
  }
}

module.exports = IdeDetectionCheck;
