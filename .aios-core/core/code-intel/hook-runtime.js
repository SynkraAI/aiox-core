'use strict';

const path = require('path');
const { RegistryProvider } = require('./providers/registry-provider');

/** Cached provider instance (survives across hook invocations in same process). */
let _provider = null;
let _providerRoot = null;

/**
 * Get or create a RegistryProvider singleton.
 * Resets if projectRoot changes between calls.
 * @param {string} projectRoot - Project root directory
 * @returns {RegistryProvider}
 */
function getProvider(projectRoot) {
  if (!_provider || _providerRoot !== projectRoot) {
    _provider = new RegistryProvider({ projectRoot });
    _providerRoot = projectRoot;
  }
  return _provider;
}

/**
 * Resolve code intelligence context for a file being written/edited.
 *
 * Queries RegistryProvider for:
 * - Entity definition (path, layer, purpose, type)
 * - References (files that use this entity)
 * - Dependencies (entities this file depends on)
 *
 * @param {string} filePath - Absolute or relative path to the target file
 * @param {string} cwd - Project root / working directory
 * @returns {{ entity: Object|null, references: Array|null, dependencies: Object|null }|null}
 */
async function resolveCodeIntel(filePath, cwd) {
  if (!filePath || !cwd) return null;

  try {
    const provider = getProvider(cwd);
    if (!provider.isAvailable()) return null;

    // Normalize to relative path (registry uses relative paths)
    let relativePath = filePath;
    if (path.isAbsolute(filePath)) {
      relativePath = path.relative(cwd, filePath).replace(/\\/g, '/');
    } else {
      relativePath = filePath.replace(/\\/g, '/');
    }

    // Run all three queries in parallel
    const [definition, references, dependencies] = await Promise.all([
      provider.findDefinition(relativePath),
      provider.findReferences(relativePath),
      provider.analyzeDependencies(relativePath),
    ]);

    // Treat empty dependency graph as no data
    const hasUsefulDeps = dependencies && dependencies.nodes && dependencies.nodes.length > 0;

    // If nothing found at all, try searching by the file basename
    if (!definition && !references && !hasUsefulDeps) {
      const basename = path.basename(relativePath, path.extname(relativePath));
      const fallbackDef = await provider.findDefinition(basename);
      if (!fallbackDef) return null;

      const [fallbackRefs, fallbackDeps] = await Promise.all([
        provider.findReferences(basename),
        provider.analyzeDependencies(basename),
      ]);

      return {
        entity: fallbackDef,
        references: fallbackRefs,
        dependencies: fallbackDeps,
      };
    }

    return {
      entity: definition,
      references,
      dependencies,
    };
  } catch (_err) {
    // Guard against provider exceptions to avoid unhandled rejections in hook runtime
    return null;
  }
}

/**
 * Format code intelligence data as XML for injection into Claude context.
 *
 * @param {Object|null} intel - Result from resolveCodeIntel()
 * @param {string} filePath - Target file path (for display)
 * @returns {string|null} XML string or null if no data
 */
function formatAsXml(intel, filePath) {
  if (!intel) return null;

  const { entity, references, dependencies } = intel;

  // At least one piece of data must exist
  if (!entity && !references && !dependencies) return null;

  const lines = ['<code-intel-context>'];
  lines.push(`  <target-file>${escapeXml(filePath)}</target-file>`);

  // Entity definition
  if (entity) {
    lines.push('  <existing-entity>');
    if (entity.file) lines.push(`    <path>${escapeXml(entity.file)}</path>`);
    if (entity.context) lines.push(`    <purpose>${escapeXml(entity.context)}</purpose>`);
    lines.push('  </existing-entity>');
  }

  // References
  if (references && references.length > 0) {
    // Deduplicate by file path
    const uniqueRefs = [];
    const seen = new Set();
    for (const ref of references) {
      if (ref.file && !seen.has(ref.file)) {
        seen.add(ref.file);
        uniqueRefs.push(ref);
      }
    }

    lines.push(`  <referenced-by count="${uniqueRefs.length}">`);
    for (const ref of uniqueRefs.slice(0, 15)) {
      const ctx = ref.context ? ` context="${escapeXml(ref.context)}"` : '';
      lines.push(`    <ref file="${escapeXml(ref.file)}"${ctx} />`);
    }
    if (uniqueRefs.length > 15) {
      lines.push(`    <!-- ...and ${uniqueRefs.length - 15} more -->`);
    }
    lines.push('  </referenced-by>');
  }

  // Dependencies
  if (dependencies && dependencies.nodes && dependencies.nodes.length > 1) {
    // First node is the target itself, rest are dependencies
    const depNodes = dependencies.nodes.slice(1);
    lines.push(`  <dependencies count="${depNodes.length}">`);
    for (const dep of depNodes.slice(0, 10)) {
      const layer = dep.layer ? ` layer="${dep.layer}"` : '';
      lines.push(`    <dep name="${escapeXml(dep.name)}"${layer} />`);
    }
    if (depNodes.length > 10) {
      lines.push(`    <!-- ...and ${depNodes.length - 10} more -->`);
    }
    lines.push('  </dependencies>');
  }

  lines.push('</code-intel-context>');
  return lines.join('\n');
}

/**
 * Escape special XML characters.
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Reset cached provider (for testing).
 */
function _resetForTesting() {
  _provider = null;
  _providerRoot = null;
}

module.exports = {
  resolveCodeIntel,
  formatAsXml,
  escapeXml,
  getProvider,
  _resetForTesting,
};
