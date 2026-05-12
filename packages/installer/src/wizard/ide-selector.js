/**
 * IDE Selector Module
 *
 * Story 1.4: IDE Selection
 * Provides multi-select IDE prompt for wizard
 *
 * @module wizard/ide-selector
 */

const inquirer = require('inquirer');
const { getIDEChoices, getIDEKeys } = require('../config/ide-configs');
const { colors } = require('../utils/aiox-colors');
const { t } = require('./i18n');

/**
 * Validate IDE selection (at least one required)
 * @param {string[]} selectedIDEs - Array of selected IDE keys
 * @returns {boolean|string} True if valid, error message if invalid
 */
function validateIDESelection(selectedIDEs) {
  if (!Array.isArray(selectedIDEs)) {
    return 'Invalid selection format';
  }

  if (selectedIDEs.length === 0) {
    return 'Please select at least one IDE';
  }

  // Validate all selected IDEs are valid
  const validIDEs = getIDEKeys();
  const invalidIDEs = selectedIDEs.filter((ide) => !validIDEs.includes(ide));

  if (invalidIDEs.length > 0) {
    return `Invalid IDE selections: ${invalidIDEs.join(', ')}`;
  }

  return true;
}

/**
 * Prompt user to select IDEs
 *
 * AC1: Multi-select prompt with 6 IDEs
 *
 * @returns {Promise<string[]>} Array of selected IDE keys
 *
 * @example
 * const selectedIDEs = await selectIDEs();
 * console.log(selectedIDEs); // ['cursor', 'github-copilot']
 */
async function selectIDEs() {
  const { selectedIDEs } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedIDEs',
      message: colors.primary(t('ideQuestion')) + colors.dim(`\n  (${t('ideHint')})`),
      choices: getIDEChoices(),
      validate: validateIDESelection,
      pageSize: 10,
    },
  ]);

  return selectedIDEs;
}

/**
 * Get IDE selection question for wizard integration
 * @returns {Object} Inquirer question object
 */
function getIDESelectionQuestion() {
  return {
    type: 'checkbox',
    name: 'selectedIDEs',
    message: colors.primary(t('ideQuestion')) + colors.dim(`\n  (${t('ideHint')})`),
    choices: getIDEChoices(),
    validate: validateIDESelection,
    pageSize: 10,
  };
}

module.exports = {
  selectIDEs,
  validateIDESelection,
  getIDESelectionQuestion,
};
