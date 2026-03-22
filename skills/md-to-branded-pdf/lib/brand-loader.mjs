/**
 * Loads and validates brand YAML configuration files.
 * Converts brand colors to CSS custom properties.
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRANDS_DIR = resolve(__dirname, '..', 'brands');

const REQUIRED_FIELDS = ['name', 'theme', 'colors', 'font'];
const REQUIRED_COLORS = ['primary', 'primary_light', 'accent', 'background', 'card', 'border', 'text', 'text_muted', 'white'];

/**
 * Load a brand config by name.
 * @param {string} name - Brand name (matches filename without .yaml)
 * @returns {object} Validated brand config
 */
export function loadBrand(name) {
  const brandPath = resolve(BRANDS_DIR, `${name}.yaml`);

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

  for (const color of REQUIRED_COLORS) {
    if (!brand.colors[color]) {
      throw new Error(`Brand "${name}" is missing required color "${color}". See SKILL.md for format.`);
    }
  }

  // Default cover gradients from primary color
  if (!brand.cover) {
    brand.cover = {};
  }
  if (!brand.cover.gradient_primary) {
    brand.cover.gradient_primary = `rgba(${hexToRgb(brand.colors.primary)},0.25)`;
  }
  if (!brand.cover.gradient_secondary) {
    brand.cover.gradient_secondary = `rgba(${hexToRgb(brand.colors.primary_light)},0.10)`;
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
 * @param {object} brand - Brand config object
 * @returns {string} CSS :root block with custom properties
 */
export function getBrandCSS(brand) {
  const { colors } = brand;
  const vars = Object.entries(colors)
    .map(([key, value]) => {
      const cssKey = key.replace(/_/g, '-');
      return `    --${cssKey}: ${value};`;
    })
    .join('\n');

  return `:root {\n${vars}\n  }`;
}

/**
 * List all available brand names.
 * @returns {string[]} Array of brand names
 */
export function listBrands() {
  return readdirSync(BRANDS_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => f.replace('.yaml', ''));
}
