/**
 * Pagination Utility
 *
 * Handles pagination logic for CLI list commands.
 *
 * @module cli/commands/workers/utils/pagination
 * @version 1.0.0
 * @story 2.8-2.9 - Discovery CLI Info & List
 */

/**
 * Default pagination options
 */
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Paginate an array of items
 * @param {Array} items - Items to paginate
 * @param {object} options - Pagination options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Items per page
 * @returns {object} Paginated result
 */
function paginate(items, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(options.limit, 10) || DEFAULT_PAGE_SIZE),
  );

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      startIndex: startIndex + 1, // 1-based for display
      endIndex,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Format pagination info for display
 * @param {object} pagination - Pagination object from paginate()
 * @returns {string} Formatted pagination text
 */
function formatPaginationInfo(pagination) {
  const { startIndex, endIndex, totalItems, page, totalPages } = pagination;

  if (totalItems === 0) {
    return 'No items found.';
  }

  if (totalPages === 1) {
    return `Showing all ${totalItems} items.`;
  }

  return `Showing ${startIndex}-${endIndex} of ${totalItems} items (page ${page}/${totalPages})`;
}

/**
 * Format pagination navigation hint
 * @param {object} pagination - Pagination object
 * @returns {string} Navigation hint text
 */
function formatPaginationHint(pagination) {
  const hints = [];

  if (pagination.hasPrevPage) {
    hints.push(`--page=${pagination.page - 1} for previous`);
  }

  if (pagination.hasNextPage) {
    hints.push(`--page=${pagination.page + 1} for next`);
  }

  if (hints.length === 0) {
    return '';
  }

  return `Use ${hints.join(', ')}.`;
}

module.exports = {
  paginate,
  formatPaginationInfo,
  formatPaginationHint,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
