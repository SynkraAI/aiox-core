/**
 * Pattern Library Loader for LP Generator.
 *
 * Loads design patterns (tokens, section styles, CSS snippets) from the
 * pattern library at design-system/patterns/ to inform LP generation.
 *
 * Usage:
 *   import { listPatternSites, loadSiteTokens, loadSectionPatterns } from './pattern-loader.mjs';
 *
 *   const sites = listPatternSites();         // ['stripe', 'linear', 'vercel', ...]
 *   const tokens = loadSiteTokens('stripe');   // { colors, typography, spacing, ... }
 *   const heroes = loadSectionPatterns('heroes'); // Markdown with CSS patterns
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATTERNS_DIR = resolve(__dirname, '..', '..', '..', 'design-system', 'patterns');
const TOKENS_DIR = resolve(PATTERNS_DIR, 'tokens');
const SECTIONS_DIR = resolve(PATTERNS_DIR, 'sections');

/**
 * List all available site names in the pattern library.
 * @returns {string[]} Array of site slugs
 */
export function listPatternSites() {
  if (!existsSync(TOKENS_DIR)) return [];
  return readdirSync(TOKENS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

/**
 * List all available section categories.
 * @returns {string[]} e.g. ['heroes', 'cta', 'pricing', ...]
 */
export function listSectionCategories() {
  if (!existsSync(SECTIONS_DIR)) return [];
  return readdirSync(SECTIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

/**
 * Load tokens.yaml for a specific site.
 * Returns parsed YAML as plain object, or null if not found.
 * @param {string} siteName - e.g. 'stripe', 'linear'
 * @returns {object|null}
 */
export function loadSiteTokens(siteName) {
  const tokensPath = resolve(TOKENS_DIR, siteName, 'tokens.yaml');
  if (!existsSync(tokensPath)) return null;

  try {
    const content = readFileSync(tokensPath, 'utf-8');
    // Simple YAML key-value parser (same approach as tokens-to-tailwind.mjs)
    return parseTokensYaml(content);
  } catch {
    return null;
  }
}

/**
 * Load section patterns (consolidated Markdown with CSS examples).
 * @param {string} category - e.g. 'heroes', 'cta', 'pricing'
 * @returns {string|null} Raw markdown content
 */
export function loadSectionPatterns(category) {
  const readmePath = resolve(SECTIONS_DIR, category, 'README.md');
  if (!existsSync(readmePath)) return null;

  try {
    return readFileSync(readmePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Load patterns for a specific site + section combination.
 * Extracts only the section mentioning that site from the category README.
 * @param {string} siteName - e.g. 'stripe'
 * @param {string} category - e.g. 'heroes'
 * @returns {string|null} Markdown section for that site
 */
export function loadSitePattern(siteName, category) {
  const content = loadSectionPatterns(category);
  if (!content) return null;

  // Extract the section for this site (## N. SiteName — ...)
  const siteLabel = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  const regex = new RegExp(`(## \\d+\\.\\s+${siteLabel}[\\s\\S]*?)(?=\\n## \\d+\\.|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Get a brand-compatible config from site tokens.
 * Converts extracted tokens into the same format that brands/*.yaml uses,
 * so the existing color-mapper and builder pipelines work seamlessly.
 * @param {string} siteName
 * @returns {object|null} Brand-compatible config
 */
export function siteTokensToBrand(siteName) {
  const tokens = loadSiteTokens(siteName);
  if (!tokens) return null;

  const colors = tokens.colors || {};
  const typography = tokens.typography || {};

  // Find most common colors by occurrence
  const sorted = Object.entries(colors)
    .map(([key, data]) => ({
      key,
      value: data.value || '',
      occurrences: parseInt(data.occurrences) || 0,
    }))
    .filter(c => c.value)
    .sort((a, b) => b.occurrences - a.occurrences);

  // Heuristic: darkest = background, lightest = text, most saturated = primary
  const byLuminosity = [...sorted].sort((a, b) => luminosity(a.value) - luminosity(b.value));
  const bySaturation = [...sorted].sort((a, b) => saturation(b.value) - saturation(a.value));

  // Normalize all values to hex before processing
  sorted.forEach(c => { c.value = normalizeToHex(c.value); });
  byLuminosity.forEach(c => { c.value = normalizeToHex(c.value); });
  bySaturation.forEach(c => { c.value = normalizeToHex(c.value); });

  const bg = byLuminosity[0]?.value || '#0a0a0a';
  const text = byLuminosity[byLuminosity.length - 1]?.value || '#fafafa';
  const primary = bySaturation[0]?.value || '#6366f1';
  const accent = bySaturation[1]?.value || primary;

  // Find font family
  const fontEntry = Object.values(typography)[0];
  const font = fontEntry?.['font-family']?.split(',')[0]?.replace(/['"]/g, '') || 'Inter';

  return {
    name: siteName,
    theme: luminosity(bg) < 0.2 ? 'dark' : 'light',
    font,
    display_font: font,
    colors: {
      primary,
      primary_light: lighten(primary, 0.2),
      accent,
      background: bg,
      card: luminosity(bg) < 0.2 ? lightenHex(bg, 0.04) : darkenHex(bg, 0.02),
      border: luminosity(bg) < 0.2 ? '#1a1a1a' : '#e5e5e5',
      text,
      text_muted: luminosity(bg) < 0.2 ? '#a1a1a1' : '#737373',
      white: luminosity(bg) < 0.2 ? '#ffffff' : '#000000',
      highlight: primary,
    },
    cover: {
      gradient_primary: `rgba(${hexToRgb(primary)},0.25)`,
      gradient_secondary: `rgba(${hexToRgb(accent)},0.10)`,
    },
    logos: { main: '', partner: '' },
    _source: 'pattern-library',
    _site: siteName,
  };
}

// --- Helpers ---

function normalizeToHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
  }
  return color;
}

function hexToRgb(hex) {
  const h = normalizeToHex(hex).replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function luminosity(hex) {
  try {
    const h = normalizeToHex(hex).replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const lum = (c) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  } catch { return 0.5; }
}

function saturation(hex) {
  try {
    const h = normalizeToHex(hex).replace('#', '');
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;
    const l = (max + min) / 2;
    const d = max - min;
    return l > 0.5 ? d / (2 - max - min) : d / (max + min);
  } catch { return 0; }
}

function lighten(hex, amount) {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lightenHex(hex, amount) {
  return lighten(hex, amount);
}

function darkenHex(hex, amount) {
  return lighten(hex, -amount);
}

function parseTokensYaml(content) {
  const result = { colors: {}, typography: {}, spacing: {}, shadows: {} };
  let currentSection = null;
  let currentItem = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (!line.startsWith(' ') && trimmed.endsWith(':') && !trimmed.includes('"')) {
      currentSection = trimmed.replace(':', '');
      currentItem = null;
      continue;
    }

    if (currentSection && line.startsWith('  ') && !line.startsWith('    ')) {
      const match = trimmed.match(/^"?([^"]+)"?:\s*(.*)$/);
      if (match) {
        currentItem = match[1];
        const value = match[2].replace(/^"/, '').replace(/"$/, '');
        if (!value) {
          if (!result[currentSection]) result[currentSection] = {};
          result[currentSection][currentItem] = {};
        }
      }
      continue;
    }

    if (currentSection && currentItem && line.startsWith('    ')) {
      const match = trimmed.match(/^([^:]+):\s*"?([^"]*)"?$/);
      if (match) {
        const [, key, val] = match;
        if (!result[currentSection]) result[currentSection] = {};
        if (!result[currentSection][currentItem]) result[currentSection][currentItem] = {};
        result[currentSection][currentItem][key.trim()] = val.trim();
      }
    }
  }
  return result;
}
