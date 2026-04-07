/**
 * Loads and validates brand YAML configuration files.
 * Converts brand colors to CSS custom properties.
 *
 * v2: Delegates to @aios/brand-schema for canonical loading and validation.
 * Maintains backward-compatible API (loadBrand, getBrandCSS, listBrands).
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRANDS_DIR = resolve(__dirname, '..', 'brands');

// Also check canonical brand-schema location
const CANONICAL_BRANDS_DIR = resolve(__dirname, '..', '..', '..', 'packages', 'brand-schema', 'brands');

const REQUIRED_FIELDS = ['name', 'theme', 'colors', 'typography'];
const REQUIRED_SEMANTIC_COLORS = ['primary', 'accent', 'background', 'text'];

/**
 * Load a brand config by name.
 * Searches both local brands/ and canonical packages/brand-schema/brands/.
 * @param {string} name - Brand name (matches filename without .yaml)
 * @returns {object} Validated brand config
 */
export function loadBrand(name) {
  let brandPath = resolve(BRANDS_DIR, `${name}.yaml`);

  // Fall back to canonical location
  if (!existsSync(brandPath) && existsSync(CANONICAL_BRANDS_DIR)) {
    brandPath = resolve(CANONICAL_BRANDS_DIR, `${name}.yaml`);
  }

  let raw;
  try {
    raw = readFileSync(brandPath, 'utf-8');
  } catch {
    const available = listBrands();
    throw new Error(`Brand "${name}" not found in brands/. Available: ${available.join(', ')}`);
  }

  const brand = yaml.load(raw);

  for (const field of REQUIRED_FIELDS) {
    if (!brand[field]) {
      throw new Error(`Brand "${name}" is missing required field "${field}". See SKILL.md for format.`);
    }
  }

  // Validate semantic colors (nested path: colors.semantic.*)
  const semantic = brand.colors?.semantic;
  if (!semantic) {
    throw new Error(`Brand "${name}" is missing colors.semantic. See SKILL.md for format.`);
  }
  for (const color of REQUIRED_SEMANTIC_COLORS) {
    if (!semantic[color]) {
      throw new Error(`Brand "${name}" is missing required color "colors.semantic.${color}".`);
    }
  }

  // Default cover gradients from primary color
  if (!brand.cover) {
    brand.cover = {};
  }
  if (!brand.cover.gradient_primary) {
    brand.cover.gradient_primary = `rgba(${hexToRgb(semantic.primary)},0.25)`;
  }
  if (!brand.cover.gradient_secondary) {
    const lighter = semantic.primary_hover || semantic.accent || semantic.primary;
    brand.cover.gradient_secondary = `rgba(${hexToRgb(lighter)},0.10)`;
  }

  // Default logos
  if (!brand.logos) {
    brand.logos = { main: '', partner: '' };
  }

  return brand;
}

/**
 * Convert hex color to r,g,b string.
 * @param {string} hex - Hex color like "#A855F7"
 * @returns {string} "168,85,247"
 */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

/**
 * Convert brand colors to CSS custom properties string.
 * Reads from colors.semantic (canonical format).
 * @param {object} brand - Brand config object
 * @returns {string} CSS :root block with custom properties
 */
export function getBrandCSS(brand) {
  const semantic = brand.colors?.semantic || brand.colors || {};
  const vars = Object.entries(semantic)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => {
      const cssKey = key.replace(/_/g, '-');
      return `    --${cssKey}: ${value};`;
    })
    .join('\n');

  return `:root {\n${vars}\n  }`;
}

/**
 * List all available brand names (from both local and canonical locations).
 * @returns {string[]} Array of brand names
 */
export function listBrands() {
  const local = existsSync(BRANDS_DIR)
    ? readdirSync(BRANDS_DIR).filter(f => f.endsWith('.yaml'))
    : [];
  const canonical = existsSync(CANONICAL_BRANDS_DIR)
    ? readdirSync(CANONICAL_BRANDS_DIR).filter(f => f.endsWith('.yaml'))
    : [];

  const all = new Set([...local, ...canonical]);
  return [...all].map(f => f.replace('.yaml', '')).sort();
}
