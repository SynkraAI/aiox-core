/**
 * Wizard Questions Definitions
 *
 * Modular question system for AIOS installation wizard
 * Questions from Stories 1.3-1.6 will be added here
 *
 * @module wizard/questions
 */

const { colors } = require('../utils/aios-colors');
const { createInquirerValidator, validateProjectType } = require('./validators');
const { t, getLanguageChoices, setLanguage: _setLanguage } = require('./i18n');

/**
 * Get language selection question (first question)
 * @returns {Object} Inquirer question object
 */
function getLanguageQuestion() {
  return {
    type: 'list',
    name: 'language',
    message: '🌐 Language:',
    choices: getLanguageChoices(),
    default: 'en',
  };
}

/**
 * Get project type question (Story 1.3)
 * Uses i18n for translation
 *
 * @returns {Object} Inquirer question object
 */
function getProjectTypeQuestion() {
  return {
    type: 'list',
    name: 'projectType',
    message: colors.primary(t('projectTypeQuestion')),
    choices: [
      {
        name: colors.highlight(t('greenfield')) + colors.dim(` (${t('greenfieldDesc')})`),
        value: 'greenfield',
      },
      {
        name: t('brownfield') + colors.dim(` (${t('brownfieldDesc')})`),
        value: 'brownfield',
      },
    ],
    default: 0,
    validate: createInquirerValidator(validateProjectType),
  };
}

/**
 * Get IDE selection questions (Story 1.4)
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getIDEQuestions() {
  const { getIDESelectionQuestion } = require('./ide-selector');
  return [getIDESelectionQuestion()];
}

/**
 * Get package manager selection question (Story 1.7)
 *
 * @param {string} detectedPM - Auto-detected package manager
 * @returns {Object} Inquirer question object
 */
function getPackageManagerQuestion(detectedPM = 'npm') {
  return {
    type: 'list',
    name: 'packageManager',
    message: colors.primary('Which package manager should be used?'),
    choices: [
      {
        name: detectedPM === 'npm' ? colors.highlight('npm') + colors.dim(' (detected)') : 'npm',
        value: 'npm',
      },
      {
        name: detectedPM === 'yarn' ? colors.highlight('yarn') + colors.dim(' (detected)') : 'yarn',
        value: 'yarn',
      },
      {
        name: detectedPM === 'pnpm' ? colors.highlight('pnpm') + colors.dim(' (detected)') : 'pnpm',
        value: 'pnpm',
      },
      {
        name: detectedPM === 'bun' ? colors.highlight('bun') + colors.dim(' (detected)') : 'bun',
        value: 'bun',
      },
    ],
    default: ['npm', 'yarn', 'pnpm', 'bun'].indexOf(detectedPM) || 0,
  };
}

/**
 * Get MCP selection questions (Story 1.5 / 1.8 Integration)
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getMCPQuestions() {
  return [
    {
      type: 'checkbox',
      name: 'selectedMCPs',
      message: colors.primary('Select MCPs to install (project-level):'),
      choices: [
        {
          name:
            colors.highlight('Browser (Puppeteer)') + colors.dim(' - Web automation and testing'),
          value: 'browser',
          checked: true,
        },
        {
          name: colors.highlight('Context7') + colors.dim(' - Library documentation search'),
          value: 'context7',
          checked: true,
        },
        {
          name: colors.highlight('Exa') + colors.dim(' - Advanced web search'),
          value: 'exa',
          checked: true,
        },
        {
          name: colors.highlight('Desktop Commander') + colors.dim(' - File system access'),
          value: 'desktop-commander',
          checked: true,
        },
      ],
      validate: () => {
        // Allow empty selection (user can skip MCP installation)
        return true;
      },
    },
    // Note: API keys are configured later via aios-master or directly in .env
  ];
}

/**
 * Get environment configuration questions (Story 1.6)
 *
 * DESIGN NOTE: Environment configuration uses its own prompt system
 * via @clack/prompts in packages/installer/src/config/configure-environment.js
 *
 * API key prompts are NOT part of wizard questions to keep the
 * environment module self-contained and testable independently.
 *
 * The wizard calls configureEnvironment() directly after IDE selection
 * in src/wizard/index.js (Task 1.6.7)
 *
 * @returns {Object[]} Empty array - prompts handled in environment module
 */
function getEnvironmentQuestions() {
  // Environment config prompts handled in configure-environment.js
  // No wizard questions needed for this story
  return [];
}

/**
 * Get Expansion Pack selection questions
 *
 * Available expansion packs for v2.1:
 * - expansion-creator: Tools to create custom expansion packs
 * - etl: ETL pipeline for knowledge base creation
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getExpansionPackQuestions() {
  return [
    {
      type: 'checkbox',
      name: 'selectedExpansionPacks',
      message: colors.primary('Select Expansion Packs to install (optional):'),
      choices: [
        {
          name:
            colors.highlight('expansion-creator') +
            colors.dim(' - Tools to create custom expansion packs'),
          value: 'expansion-creator',
          checked: false,
        },
        {
          name: colors.highlight('etl') + colors.dim(' - ETL pipeline for knowledge base creation'),
          value: 'etl',
          checked: false,
        },
      ],
      validate: () => {
        // Allow empty selection (user can skip expansion pack installation)
        return true;
      },
    },
  ];
}

/**
 * Get Tech Preset selection question
 *
 * Tech presets provide pre-configured architecture patterns and standards
 * for different technology stacks.
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getTechPresetQuestion() {
  return [
    {
      type: 'list',
      name: 'selectedTechPreset',
      message: colors.primary('Select a Tech Preset for architecture patterns:'),
      choices: [
        {
          name:
            colors.highlight('nextjs-react') +
            colors.dim(' - Next.js 14+, React, TypeScript, Tailwind, Zustand'),
          value: 'nextjs-react',
        },
        {
          name: 'None' + colors.dim(' - Let AIOS decide based on project'),
          value: 'none',
        },
      ],
      default: 0,
    },
  ];
}

/**
 * Build complete question sequence
 * Allows conditional questions based on previous answers
 *
 * @param {Object} context - Context with previous answers
 * @returns {Object[]} Array of questions
 */
function buildQuestionSequence(_context = {}) {
  const questions = [];

  // Language selection (first question)
  questions.push(getLanguageQuestion());

  // Story 1.2: Foundation (project type only)
  questions.push(getProjectTypeQuestion());

  // Story 1.4: IDE Selection
  questions.push(...getIDEQuestions());

  // Story 1.5/1.8: MCP Selection
  // DISABLED: MCPs are advanced config that can confuse beginners
  // TODO: Remove entirely in future version - each project has unique MCP needs
  // questions.push(...getMCPQuestions());

  // Expansion Pack Selection (v2.1) - DISABLED: Squads replaced expansion-packs (OSR-8)
  // TODO: Remove entirely in future version
  // questions.push(...getExpansionPackQuestions());

  // Tech Preset Selection
  questions.push(...getTechPresetQuestion());

  // Story 1.7: Package Manager - Auto-detected (no question needed)
  // The wizard will auto-detect and use the appropriate package manager
  // See detectPackageManager() in dependency-installer.js

  // Story 1.6: Environment Configuration
  // Note: Env config prompts handled directly in configureEnvironment()
  // See src/wizard/index.js integration (after IDE config step)

  // Future: Conditional questions based on projectType
  // if (context.projectType === 'greenfield') { ... }

  return questions;
}

/**
 * Get question by ID
 * Useful for testing individual questions
 *
 * @param {string} questionId - Question identifier
 * @returns {Object|null} Question object or null if not found
 */
function getQuestionById(questionId) {
  const questionMap = {
    projectType: getProjectTypeQuestion(),
    // Future questions will be added here
  };

  return questionMap[questionId] || null;
}

module.exports = {
  getLanguageQuestion,
  getProjectTypeQuestion,
  getIDEQuestions,
  getMCPQuestions,
  getExpansionPackQuestions,
  getTechPresetQuestion,
  getEnvironmentQuestions,
  getPackageManagerQuestion,
  buildQuestionSequence,
  getQuestionById,
};
