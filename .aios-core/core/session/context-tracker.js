/**
 * ContextTracker
 *
 * Auto-detection and inference engine for session context.
 * Detects project type, phase, progress, and git state.
 *
 * Detection logic:
 * - Project type: folder structure patterns
 * - Phase: command history, file patterns
 * - Progress: checklist parsing from story files
 * - Git state: branch, uncommitted changes
 *
 * Target accuracy: >95% for project type detection
 *
 * @module session/context-tracker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

/**
 * ContextTracker class
 * Provides auto-detection and inference for session context
 */
class ContextTracker {
  constructor(basePath = null) {
    this.projectTypesConfig = null;
    this.cwd = basePath || process.cwd();
  }

  /**
   * Load project types configuration
   * @returns {Promise<Object>} Project types config
   * @private
   */
  async _loadProjectTypesConfig() {
    if (this.projectTypesConfig) {
      return this.projectTypesConfig;
    }

    try {
      const configPath = path.join(
        this.cwd,
        '.aios-core',
        'core',
        'session',
        'project-types.yaml',
      );

      const data = fs.readFileSync(configPath, 'utf8');
      this.projectTypesConfig = yaml.load(data);
      return this.projectTypesConfig;
    } catch (error) {
      // Return default config if file doesn't exist
      return this._getDefaultProjectTypesConfig();
    }
  }

  /**
   * Get default project types configuration
   * @returns {Object} Default config
   * @private
   */
  _getDefaultProjectTypesConfig() {
    return {
      projectTypes: {
        framework: { emoji: '🔧', patterns: ['.aios-core/', 'bin/aios.js'] },
        squad: { emoji: '🏗️', patterns: ['squads/', 'workflows/', 'agents/'] },
        app: { emoji: '⚡', patterns: ['apps/', 'src/app/', 'pages/'] },
        tool: { emoji: '🛠️', patterns: ['tools/', 'cli/'] },
        'design-system': { emoji: '🎨', patterns: ['design-system/', 'components/'] },
        project: { emoji: '📦', patterns: [] }, // Fallback
      },
      phases: {
        research: { emoji: '🔬', keywords: ['research', 'analysis', 'investigation'] },
        extraction: { emoji: '🧬', keywords: ['extract', 'parse', 'scrape'] },
        creation: { emoji: '🤖', keywords: ['create', 'generate', 'build'] },
        validation: { emoji: '✅', keywords: ['validate', 'verify', 'check'] },
        testing: { emoji: '🧪', keywords: ['test', 'spec', 'coverage'] },
        deployment: { emoji: '🚀', keywords: ['deploy', 'release', 'publish'] },
        maintenance: { emoji: '🔧', keywords: ['refactor', 'cleanup', 'fix'] },
      },
    };
  }

  /**
   * Detect project type based on folder structure
   * @returns {Promise<Object>} { type, emoji, confidence }
   */
  async detectProjectType() {
    const config = await this._loadProjectTypesConfig();
    const projectTypes = config.projectTypes || {};

    // Check each project type's patterns
    for (const [type, typeConfig] of Object.entries(projectTypes)) {
      if (type === 'project') continue; // Skip fallback

      const patterns = typeConfig.patterns || [];
      let matchCount = 0;

      for (const pattern of patterns) {
        const targetPath = path.join(this.cwd, pattern);
        if (fs.existsSync(targetPath)) {
          matchCount++;
        }
      }

      // Calculate confidence based on pattern matches
      const confidence = patterns.length > 0 ? matchCount / patterns.length : 0;

      if (confidence > 0.5) { // >50% patterns matched
        return {
          type,
          emoji: typeConfig.emoji || '📦',
          confidence,
        };
      }
    }

    // Fallback to 'project' type
    return {
      type: 'project',
      emoji: projectTypes.project?.emoji || '📦',
      confidence: 0,
    };
  }

  /**
   * Infer current phase from command or context
   * @param {string} command - Last command executed (optional)
   * @returns {Promise<Object>} { phase, emoji, confidence }
   */
  async inferPhase(command = '') {
    const config = await this._loadProjectTypesConfig();
    const phases = config.phases || {};

    // Analyze command for phase keywords
    const commandLower = command.toLowerCase();

    for (const [phase, phaseConfig] of Object.entries(phases)) {
      const keywords = phaseConfig.keywords || [];

      for (const keyword of keywords) {
        if (commandLower.includes(keyword)) {
          return {
            phase,
            emoji: phaseConfig.emoji || '',
            confidence: 0.8,
          };
        }
      }
    }

    // Analyze current directory for phase hints
    const cwd = path.basename(this.cwd);
    const cwdLower = cwd.toLowerCase();

    for (const [phase, phaseConfig] of Object.entries(phases)) {
      const keywords = phaseConfig.keywords || [];

      for (const keyword of keywords) {
        if (cwdLower.includes(keyword)) {
          return {
            phase,
            emoji: phaseConfig.emoji || '',
            confidence: 0.6,
          };
        }
      }
    }

    // Check for common development indicators
    if (fs.existsSync(path.join(this.cwd, 'tests')) ||
        fs.existsSync(path.join(this.cwd, 'test'))) {
      return {
        phase: 'testing',
        emoji: phases.testing?.emoji || '🧪',
        confidence: 0.4,
      };
    }

    // Default: unknown phase
    return {
      phase: '',
      emoji: '',
      confidence: 0,
    };
  }

  /**
   * Extract progress from task checklist files
   * @param {string} checklistPath - Path to checklist file (optional)
   * @returns {Promise<Object>} { completed, total, percentage, progress }
   */
  async extractProgress(checklistPath = null) {
    try {
      // Auto-detect checklist path if not provided
      if (!checklistPath) {
        checklistPath = await this._findActiveStoryFile();
      }

      if (!checklistPath || !fs.existsSync(checklistPath)) {
        return {
          completed: 0,
          total: 0,
          percentage: 0,
          progress: null,
        };
      }

      // Read checklist file
      const content = fs.readFileSync(checklistPath, 'utf8');

      // Parse checkboxes: - [x] (completed) vs - [ ] (incomplete)
      const completedMatches = content.match(/- \[x\]/gi) || [];
      const incompleteMatches = content.match(/- \[ \]/g) || [];

      const completed = completedMatches.length;
      const total = completed + incompleteMatches.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        completed,
        total,
        percentage,
        progress: total > 0 ? `${completed}/${total}` : null,
      };
    } catch (error) {
      // Return zero progress on error
      return {
        completed: 0,
        total: 0,
        percentage: 0,
        progress: null,
      };
    }
  }

  /**
   * Extract status from a story file (first 30 lines)
   * Supports YAML frontmatter and markdown structured formats
   * @param {string} filePath - Path to story file
   * @returns {string} Status string (e.g. 'InProgress', 'Done', 'Ready', 'Draft') or ''
   * @private
   */
  _extractStatus(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').slice(0, 30);

      for (const line of lines) {
        // YAML frontmatter: status: InProgress
        const yamlMatch = line.match(/^status:\s*(.+)/i);
        if (yamlMatch) {
          return yamlMatch[1].trim().split(/[\s—–-]/)[0].trim();
        }

        // Markdown structured: **Status:** InProgress
        const mdBoldMatch = line.match(/\*\*Status:\*\*\s*(.+)/i);
        if (mdBoldMatch) {
          return mdBoldMatch[1].trim().split(/[\s—–-]/)[0].trim();
        }

        // Markdown header: ## Status\nInProgress (check next line)
        if (/^##\s+Status\s*$/i.test(line.trim())) {
          const idx = lines.indexOf(line);
          // Look for the next non-empty line
          for (let i = idx + 1; i < lines.length; i++) {
            const nextLine = lines[i].trim();
            if (nextLine) {
              return nextLine.split(/[\s—–-]/)[0].trim();
            }
          }
        }
      }

      return '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Find active story file in docs/stories/active/
   * Prioritizes by status: InProgress > Ready > Draft > Done/others
   * @returns {Promise<string|null>} Path to active story file
   * @private
   */
  async _findActiveStoryFile() {
    try {
      const storiesDir = path.join(this.cwd, 'docs', 'stories', 'active');

      if (!fs.existsSync(storiesDir)) {
        return null;
      }

      const STATUS_PRIORITY = {
        'InProgress': 3,
        'Ready': 2,
        'Draft': 1,
      };

      // List .md files, sorted by mtime descending, limit to 20
      const files = fs.readdirSync(storiesDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const filePath = path.join(storiesDir, file);
          const stats = fs.statSync(filePath);
          return { path: filePath, mtime: stats.mtime };
        })
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, 20);

      if (files.length === 0) {
        return null;
      }

      // Score each file by status priority, then mtime as tiebreaker
      let bestFile = null;
      let bestPriority = -1;
      let bestMtime = 0;

      for (const file of files) {
        const status = this._extractStatus(file.path);
        const priority = STATUS_PRIORITY[status] || 0;

        if (priority > bestPriority || (priority === bestPriority && file.mtime > bestMtime)) {
          bestFile = file.path;
          bestPriority = priority;
          bestMtime = file.mtime;
        }
      }

      // If best candidate has priority 0 (Done or unknown), no active story
      if (bestPriority === 0) {
        return null;
      }

      return bestFile;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get git state (branch, uncommitted changes)
   * @returns {Promise<Object>} { branch, hasChanges, emoji }
   */
  async getGitState() {
    try {
      // Check if git repo exists
      if (!fs.existsSync(path.join(this.cwd, '.git'))) {
        return {
          branch: null,
          hasChanges: false,
          emoji: '',
        };
      }

      // Get current branch
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.cwd,
        encoding: 'utf8',
      }).trim();

      // Check for uncommitted changes
      const status = execSync('git status --porcelain', {
        cwd: this.cwd,
        encoding: 'utf8',
      }).trim();

      const hasChanges = status.length > 0;

      return {
        branch,
        hasChanges,
        emoji: hasChanges ? '🟡' : '🟢',
      };
    } catch (error) {
      // Not a git repo or git command failed
      return {
        branch: null,
        hasChanges: false,
        emoji: '',
      };
    }
  }

  /**
   * Detect project name from package.json or directory name
   * @returns {Promise<string>} Project name
   */
  async detectProjectName() {
    try {
      // Try package.json first
      const packagePath = path.join(this.cwd, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.name) {
          return pkg.name;
        }
      }

      // Fallback to directory name
      return path.basename(this.cwd);
    } catch (error) {
      return path.basename(this.cwd);
    }
  }

  /**
   * Auto-detect full context (project, phase, progress, git)
   * @param {string} command - Last command executed (optional)
   * @returns {Promise<Object>} Complete context
   */
  async detectContext(command = '') {
    const [projectType, phase, progress, gitState, projectName] = await Promise.all([
      this.detectProjectType(),
      this.inferPhase(command),
      this.extractProgress(),
      this.getGitState(),
      this.detectProjectName(),
    ]);

    return {
      project: {
        type: projectType.type,
        name: projectName,
        emoji: projectType.emoji,
      },
      status: {
        phase: phase.phase,
        progress: progress.progress,
        currentTask: '',
        emoji: phase.emoji,
      },
      git: gitState,
      confidence: {
        projectType: projectType.confidence,
        phase: phase.confidence,
      },
    };
  }
}

// Support both default and named exports for backward compatibility
module.exports = ContextTracker;
module.exports.ContextTracker = ContextTracker;
