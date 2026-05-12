'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

/**
 * CreationHelper — Code intelligence helper for squad-creator and artefact creation tasks.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 *
 * Functions:
 *   - getCodebaseContext(targetPath) — project structure + conventions for agent creation
 *   - checkDuplicateArtefact(name, description) — duplicate detection before artefact creation
 *   - enrichRegistryEntry(entityName, entityPath) — pre-populate usedBy/dependencies for entity registry
 */

/**
 * Get codebase context for enriching agent/artefact creation.
 * Combines describeProject + getConventions to provide full awareness.
 * Used by squad-creator when creating new agents — advisory, never blocks creation.
 *
 * @param {string} [targetPath='.'] - Path to analyze
 * @returns {Promise<{project: Object, conventions: Object}|null>} Codebase context or null
 */
async function getCodebaseContext(targetPath) {
  const path = targetPath || '.';
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();

    // Per-capability try/catch — partial results accepted
    let project = null;
    let conventions = null;

    try {
      project = await enricher.describeProject(path);
    } catch { /* skip — partial result ok */ }

    try {
      conventions = await enricher.getConventions(path);
    } catch { /* skip — partial result ok */ }

    // Return null only if we got nothing at all
    if (!project && !conventions) return null;

    return {
      project,
      conventions,
    };
  } catch {
    return null;
  }
}

/**
 * Check for duplicate artefacts before creating a new one.
 * Combines detectDuplicates + findReferences for comprehensive detection.
 * Used by task creation workflows — returns advisory warning, never blocks.
 *
 * @param {string} name - Name of the artefact to create
 * @param {string} description - Description of the artefact
 * @returns {Promise<{duplicates: Array, references: Array, warning: string}|null>} Duplicate info or null
 */
async function checkDuplicateArtefact(name, description) {
  if (!name && !description) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const client = getClient();

    // Per-capability try/catch — partial results accepted
    let dupes = null;
    let refs = null;

    try {
      const searchText = description || name;
      dupes = await enricher.detectDuplicates(searchText, { path: '.' });
    } catch { /* skip — partial result ok */ }

    try {
      refs = await client.findReferences(name);
    } catch { /* skip — partial result ok */ }

    const hasMatches = (dupes && dupes.matches && dupes.matches.length > 0) ||
      (refs && refs.length > 0);

    if (!hasMatches) return null;

    return {
      duplicates: dupes ? (dupes.matches || []) : [],
      references: refs || [],
      warning: _formatDuplicateWarning(name, dupes, refs),
    };
  } catch {
    return null;
  }
}

/**
 * Enrich an entity registry entry with real dependency data.
 * Combines findReferences + analyzeDependencies to pre-populate usedBy/dependencies.
 * Used during entity auto-registration — advisory, registry works without it.
 *
 * @param {string} entityName - Name of the entity being registered
 * @param {string} entityPath - File path of the entity
 * @returns {Promise<{usedBy: Array, dependencies: Object}|null>} Registry enrichment data or null
 */
async function enrichRegistryEntry(entityName, entityPath) {
  if (!entityName && !entityPath) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const client = getClient();

    // Per-capability try/catch — partial results accepted
    let usedBy = null;
    let dependencies = null;

    try {
      const refs = await client.findReferences(entityName);
      if (refs && refs.length > 0) {
        usedBy = refs.map((ref) => ref.file).filter(Boolean);
        // Deduplicate
        usedBy = [...new Set(usedBy)];
      }
    } catch { /* skip — partial result ok */ }

    try {
      if (entityPath) {
        const deps = await client.analyzeDependencies(entityPath);
        if (deps) {
          dependencies = deps;
        }
      }
    } catch { /* skip — partial result ok */ }

    // Return null only if we got nothing at all
    if (!usedBy && !dependencies) return null;

    return {
      usedBy: usedBy || [],
      dependencies: dependencies || { nodes: [], edges: [] },
    };
  } catch {
    return null;
  }
}

/**
 * Format a human-readable duplicate warning message.
 * @param {string} name - Artefact name
 * @param {Object|null} dupes - Result from detectDuplicates
 * @param {Array|null} refs - Result from findReferences
 * @returns {string} Formatted warning message
 * @private
 */
function _formatDuplicateWarning(name, dupes, refs) {
  const parts = [];

  if (dupes && dupes.matches && dupes.matches.length > 0) {
    const firstMatch = dupes.matches[0];
    const location = firstMatch.file || firstMatch.path || 'unknown';
    parts.push(`Similar artefact exists: ${location}`);
  }

  if (refs && refs.length > 0) {
    parts.push(`"${name}" already referenced in ${refs.length} location(s)`);
  }

  parts.push('Consider extending instead of creating new (IDS Article IV-A)');

  return parts.join('. ') + '.';
}

module.exports = {
  getCodebaseContext,
  checkDuplicateArtefact,
  enrichRegistryEntry,
  // Exposed for testing
  _formatDuplicateWarning,
};
