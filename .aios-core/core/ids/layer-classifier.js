/**
 * Layer Classifier — Entity Registry Layer Classification (L1-L4)
 *
 * Pure function module that classifies entity paths into boundary layers.
 * Used by: populate-entity-registry.js, registry-updater.js
 *
 * Layer Model:
 *   L1 (Framework Core)      — .aios-core/core/, bin/, constitution.md
 *   L2 (Framework Templates)  — .aios-core/development/, infrastructure/, product/
 *   L3 (Project Config)       — .aios-core/data/, MEMORY.md, .claude/, *-config.yaml
 *   L4 (Project Runtime)      — docs/, tests/, packages/, everything else (fallback)
 *
 * Rule ordering: most specific first. First match wins.
 *
 * @module layer-classifier
 * @see Story BM-5
 */

const LAYER_RULES = [
  // --- L1: Framework Core ---
  { layer: 'L1', test: (p) => p.startsWith('.aios-core/core/') },
  { layer: 'L1', test: (p) => p.startsWith('bin/') },
  { layer: 'L1', test: (p) => p === '.aios-core/constitution.md' },

  // --- L3: Project Config (before L2 to catch MEMORY.md inside agents/) ---
  { layer: 'L3', test: (p) => p.startsWith('.aios-core/data/') },
  { layer: 'L3', test: (p) => p.endsWith('/MEMORY.md') || p === 'MEMORY.md' },
  { layer: 'L3', test: (p) => p.startsWith('.claude/') },
  { layer: 'L3', test: (p) => p === 'core-config.yaml' || p === 'project-config.yaml' },
  { layer: 'L3', test: (p) => p.endsWith('-config.yaml') && !p.includes('/') },

  // --- L2: Framework Templates ---
  { layer: 'L2', test: (p) => p.startsWith('.aios-core/development/') },
  { layer: 'L2', test: (p) => p.startsWith('.aios-core/infrastructure/') },
  { layer: 'L2', test: (p) => p.startsWith('.aios-core/product/') },

  // --- L4: Project Runtime (fallback — safest default for unknown files) ---
];

/**
 * Classify an entity path into a boundary layer (L1-L4).
 *
 * @param {string} entityPath — Relative path from repo root (forward slashes)
 * @returns {'L1' | 'L2' | 'L3' | 'L4'} The boundary layer
 */
function classifyLayer(entityPath) {
  if (typeof entityPath !== "string") return "L4";

  // Normalize: forward slashes, no leading ./ or /
  const normalized = entityPath
    .replace(/\\/g, '/')
    .replace(/^\.\//,'')
    .replace(/^\//,'');

  for (const rule of LAYER_RULES) {
    if (rule.test(normalized)) {
      return rule.layer;
    }
  }

  // Fallback: L4 (Project Runtime)
  return 'L4';
}

module.exports = { classifyLayer, LAYER_RULES };
