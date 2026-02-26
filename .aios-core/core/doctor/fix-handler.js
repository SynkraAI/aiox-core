/**
 * Doctor Fix Handler
 *
 * Maps check names to fix functions. Supports --fix and --dry-run modes.
 * All fix operations are idempotent.
 *
 * @module aios-core/doctor/fix-handler
 * @story INS-4.1
 */

const path = require('path');
const fs = require('fs');

const { EXPECTED_RULES } = require('./checks/rules-files');
const { EXPECTED_AGENTS } = require('./checks/agent-memory');

/**
 * Apply fixes for WARN/FAIL results
 *
 * @param {Array} results - Check results
 * @param {Object} context - Doctor context
 * @returns {Array} Fix results
 */
async function applyFixes(results, context) {
  const { projectRoot, frameworkRoot, options } = context;
  const { dryRun = false } = options;
  const fixResults = [];

  for (const result of results) {
    if (result.status !== 'WARN' && result.status !== 'FAIL') {
      continue;
    }

    const fixer = FIX_MAP[result.check];
    if (!fixer) {
      fixResults.push({
        check: result.check,
        applied: false,
        message: 'No auto-fix available',
      });
      continue;
    }

    try {
      if (dryRun) {
        const description = fixer.describe(result, { projectRoot, frameworkRoot });
        fixResults.push({
          check: result.check,
          applied: false,
          message: `[DRY RUN] Would: ${description}`,
        });
      } else {
        const fixMessage = await fixer.apply(result, { projectRoot, frameworkRoot });
        fixResults.push({
          check: result.check,
          applied: true,
          message: fixMessage,
        });
      }
    } catch (error) {
      fixResults.push({
        check: result.check,
        applied: false,
        message: `Fix failed: ${error.message}`,
      });
    }
  }

  return fixResults;
}

const FIX_MAP = {
  'rules-files': {
    describe(result, { projectRoot, frameworkRoot }) {
      const rulesSource = path.join(frameworkRoot, '.claude', 'rules');
      const rulesTarget = path.join(projectRoot, '.claude', 'rules');
      return `Copy missing rules from ${rulesSource} to ${rulesTarget}`;
    },
    async apply(result, { projectRoot, frameworkRoot }) {
      const rulesSource = path.join(frameworkRoot, '.claude', 'rules');
      const rulesTarget = path.join(projectRoot, '.claude', 'rules');

      if (!fs.existsSync(rulesTarget)) {
        fs.mkdirSync(rulesTarget, { recursive: true });
      }

      let copied = 0;
      for (const file of EXPECTED_RULES) {
        const targetFile = path.join(rulesTarget, file);
        const sourceFile = path.join(rulesSource, file);

        if (!fs.existsSync(targetFile) && fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, targetFile);
          copied++;
        }
      }

      return `Copied ${copied} missing rules files`;
    },
  },

  'agent-memory': {
    describe() {
      return 'Create missing MEMORY.md stubs for agents';
    },
    async apply(result, { projectRoot }) {
      const agentsDir = path.join(projectRoot, '.aios-core', 'development', 'agents');
      let created = 0;

      for (const agent of EXPECTED_AGENTS) {
        const memoryPath = path.join(agentsDir, agent, 'MEMORY.md');
        const agentDir = path.join(agentsDir, agent);

        if (!fs.existsSync(memoryPath)) {
          if (!fs.existsSync(agentDir)) {
            fs.mkdirSync(agentDir, { recursive: true });
          }
          fs.writeFileSync(memoryPath, `# ${agent} Agent Memory\n\n_Created by aios doctor --fix_\n`);
          created++;
        }
      }

      return `Created ${created} MEMORY.md stubs`;
    },
  },

  'claude-md': {
    describe() {
      return 'Regenerate CLAUDE.md with missing sections';
    },
    async apply() {
      return 'CLAUDE.md regeneration requires npx aios-core install --force';
    },
  },

  'settings-json': {
    describe() {
      return 'Regenerate settings.json with boundary deny rules';
    },
    async apply(result, { frameworkRoot }) {
      const generatorPath = path.join(
        frameworkRoot,
        'packages',
        'installer',
        'src',
        'generators',
        'generate-settings-json',
      );

      try {
        const generator = require(generatorPath);
        if (typeof generator.generateSettingsJson === 'function') {
          await generator.generateSettingsJson();
          return 'settings.json regenerated';
        }
      } catch {
        // Generator not available
      }

      return 'settings.json regeneration requires npx aios-core install --force';
    },
  },
};

module.exports = { applyFixes };
