/**
 * Search Filters Module
 *
 * Implements filtering logic for search results.
 * Supports category and tag-based filtering.
 *
 * @module cli/commands/workers/search-filters
 * @version 1.0.0
 * @story 2.7 - Discovery CLI Search
 */

/**
 * Apply filters to search results
 * @param {Array} results - Search results array
 * @param {object} filters - Filter options
 * @param {string} [filters.category] - Category filter
 * @param {string[]} [filters.tags] - Tags filter (AND logic)
 * @returns {Array} Filtered results
 */
function applyFilters(results, filters = {}) {
  let filtered = [...results];

  // Apply category filter
  if (filters.category) {
    const categoryLower = filters.category.toLowerCase();
    filtered = filtered.filter(worker => {
      const workerCategory = (worker.category || '').toLowerCase();
      return workerCategory === categoryLower ||
             workerCategory.includes(categoryLower);
    });
  }

  // Apply tag filters (AND logic - worker must have ALL specified tags)
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(worker => {
      const workerTags = (worker.tags || []).map(t => t.toLowerCase());
      return filters.tags.every(tag =>
        workerTags.some(wt => wt === tag.toLowerCase() || wt.includes(tag.toLowerCase())),
      );
    });
  }

  return filtered;
}

/**
 * Filter by category
 * @param {Array} results - Search results
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered results
 */
function filterByCategory(results, category) {
  if (!category) return results;

  const categoryLower = category.toLowerCase();
  return results.filter(worker => {
    const workerCategory = (worker.category || '').toLowerCase();
    return workerCategory === categoryLower;
  });
}

/**
 * Filter by tags (AND logic)
 * @param {Array} results - Search results
 * @param {string[]} tags - Tags to filter by
 * @returns {Array} Filtered results
 */
function filterByTags(results, tags) {
  if (!tags || tags.length === 0) return results;

  const tagsLower = tags.map(t => t.toLowerCase());

  return results.filter(worker => {
    const workerTags = new Set((worker.tags || []).map(t => t.toLowerCase()));
    return tagsLower.every(tag => workerTags.has(tag));
  });
}

/**
 * Filter by tags (OR logic - worker must have at least one tag)
 * @param {Array} results - Search results
 * @param {string[]} tags - Tags to filter by
 * @returns {Array} Filtered results
 */
function filterByAnyTag(results, tags) {
  if (!tags || tags.length === 0) return results;

  const tagsLower = tags.map(t => t.toLowerCase());

  return results.filter(worker => {
    const workerTags = new Set((worker.tags || []).map(t => t.toLowerCase()));
    return tagsLower.some(tag => workerTags.has(tag));
  });
}

/**
 * Filter by subcategory
 * @param {Array} results - Search results
 * @param {string} subcategory - Subcategory to filter by
 * @returns {Array} Filtered results
 */
function filterBySubcategory(results, subcategory) {
  if (!subcategory) return results;

  const subcategoryLower = subcategory.toLowerCase();
  return results.filter(worker => {
    const workerSubcategory = (worker.subcategory || '').toLowerCase();
    return workerSubcategory === subcategoryLower;
  });
}

/**
 * Filter by task format
 * @param {Array} results - Search results
 * @param {string} taskFormat - Task format (e.g., 'TASK-FORMAT-V1')
 * @returns {Array} Filtered results
 */
function filterByTaskFormat(results, taskFormat) {
  if (!taskFormat) return results;

  return results.filter(worker =>
    worker.taskFormat === taskFormat,
  );
}

/**
 * Filter by executor type
 * @param {Array} results - Search results
 * @param {string} executorType - Executor type (e.g., 'Worker', 'Agent')
 * @returns {Array} Filtered results
 */
function filterByExecutorType(results, executorType) {
  if (!executorType) return results;

  return results.filter(worker => {
    const executorTypes = worker.executorTypes || [];
    return executorTypes.includes(executorType);
  });
}

/**
 * Combine multiple filters
 * @param {Array} results - Search results
 * @param {object[]} filterList - Array of filter objects {type, value}
 * @returns {Array} Filtered results
 */
function applyMultipleFilters(results, filterList) {
  let filtered = results;

  for (const filter of filterList) {
    switch (filter.type) {
      case 'category':
        filtered = filterByCategory(filtered, filter.value);
        break;
      case 'tags':
        filtered = filterByTags(filtered, filter.value);
        break;
      case 'anyTag':
        filtered = filterByAnyTag(filtered, filter.value);
        break;
      case 'subcategory':
        filtered = filterBySubcategory(filtered, filter.value);
        break;
      case 'taskFormat':
        filtered = filterByTaskFormat(filtered, filter.value);
        break;
      case 'executorType':
        filtered = filterByExecutorType(filtered, filter.value);
        break;
    }
  }

  return filtered;
}

module.exports = {
  applyFilters,
  filterByCategory,
  filterByTags,
  filterByAnyTag,
  filterBySubcategory,
  filterByTaskFormat,
  filterByExecutorType,
  applyMultipleFilters,
};
