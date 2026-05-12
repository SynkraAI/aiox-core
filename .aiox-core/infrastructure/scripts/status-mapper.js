// File: common/utils/status-mapper.js

/**
 * Status Mapper - Bidirectional status mapping between AIOX and ClickUp
 *
 * This module provides utilities for:
 * - Mapping AIOX story statuses to ClickUp custom field values
 * - Mapping ClickUp story-status values back to AIOX statuses
 * - Handling ClickUp-specific statuses (e.g., "Ready for Dev")
 *
 * CRITICAL: Stories use ClickUp custom field "story-status", NOT native status.
 * Epics use the native ClickUp status field (Planning, In Progress, Done).
 */

const STATUS_MAPPING = {
  AIOX_TO_CLICKUP: {
    'Draft': 'Draft',
    'Ready for Review': 'Ready for Review',
    'Review': 'Review',
    'In Progress': 'In Progress',
    'Done': 'Done',
    'Blocked': 'Blocked',
  },
  CLICKUP_TO_AIOX: {
    'Draft': 'Draft',
    'Ready for Dev': 'Ready for Review',  // ClickUp-specific status
    'Ready for Review': 'Ready for Review',
    'Review': 'Review',
    'In Progress': 'In Progress',
    'Done': 'Done',
    'Blocked': 'Blocked',
  },
};

/**
 * Maps an AIOX story status to ClickUp story-status custom field value
 *
 * @param {string} aioxStatus - Local .md file status
 * @returns {string} ClickUp story-status value
 */
function mapStatusToClickUp(aioxStatus) {
  const mapped = STATUS_MAPPING.AIOX_TO_CLICKUP[aioxStatus];

  if (!mapped) {
    console.warn(`Unknown AIOX status: ${aioxStatus}, using as-is`);
    return aioxStatus;
  }

  return mapped;
}

/**
 * Maps a ClickUp story-status custom field value to AIOX story status
 *
 * @param {string} clickupStatus - ClickUp story-status value
 * @returns {string} Local .md file status
 */
function mapStatusFromClickUp(clickupStatus) {
  const mapped = STATUS_MAPPING.CLICKUP_TO_AIOX[clickupStatus];

  if (!mapped) {
    console.warn(`Unknown ClickUp status: ${clickupStatus}, using as-is`);
    return clickupStatus;
  }

  return mapped;
}

/**
 * Validates if a status is a valid AIOX story status
 *
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
function isValidAIOXStatus(status) {
  return Object.keys(STATUS_MAPPING.AIOX_TO_CLICKUP).includes(status);
}

/**
 * Validates if a status is a valid ClickUp story-status value
 *
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
function isValidClickUpStatus(status) {
  return Object.keys(STATUS_MAPPING.CLICKUP_TO_AIOX).includes(status);
}

/**
 * Gets all valid AIOX story statuses
 *
 * @returns {string[]} Array of valid statuses
 */
function getValidAIOXStatuses() {
  return Object.keys(STATUS_MAPPING.AIOX_TO_CLICKUP);
}

/**
 * Gets all valid ClickUp story-status values
 *
 * @returns {string[]} Array of valid statuses
 */
function getValidClickUpStatuses() {
  return Object.keys(STATUS_MAPPING.CLICKUP_TO_AIOX);
}

module.exports = {
  mapStatusToClickUp,
  mapStatusFromClickUp,
  isValidAIOXStatus,
  isValidClickUpStatus,
  getValidAIOXStatuses,
  getValidClickUpStatuses,
  STATUS_MAPPING, // Export for testing
};
