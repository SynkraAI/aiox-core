/**
 * Generates a branded site folder with separated assets.
 * Output structure:
 *   output-dir/
 *   ├── index.html
 *   ├── css/styles.css
 *   └── js/main.js
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Generate a site folder from pre-built assets.
 * @param {{ html: string, css: string, js: string }} assets - From html-builder-web
 * @param {string} outputDir - Path to output directory
 * @returns {string} Resolved output directory path
 */
export function generateSite(assets, outputDir) {
  const resolvedDir = resolve(outputDir);

  if (existsSync(resolvedDir)) {
    console.log(`  Output directory already exists, overwriting: ${resolvedDir}`);
  }

  try {
    mkdirSync(join(resolvedDir, 'css'), { recursive: true });
    mkdirSync(join(resolvedDir, 'js'), { recursive: true });

    writeFileSync(join(resolvedDir, 'index.html'), assets.html, 'utf-8');
    writeFileSync(join(resolvedDir, 'css', 'styles.css'), assets.css, 'utf-8');
    writeFileSync(join(resolvedDir, 'js', 'main.js'), assets.js, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to generate site at "${resolvedDir}": ${err.message}`);
  }

  return resolvedDir;
}
