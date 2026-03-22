/**
 * Site generator for GSAP mode.
 * Creates a single HTML file with everything inline (Tailwind CDN + GSAP CDN + inline styles/scripts).
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate a GSAP site from parsed data.
 * @param {{ html: string }} siteData - Output from buildGSAPSite
 * @param {string} outputPath - Directory to write the site
 * @returns {string} The output directory path
 */
export function generateGSAPSite(siteData, outputPath) {
  // Create output directory
  mkdirSync(outputPath, { recursive: true });

  // Write the complete HTML file
  const htmlPath = join(outputPath, 'index.html');
  writeFileSync(htmlPath, siteData.html, 'utf-8');

  console.log(`✓ GSAP site generated: ${htmlPath}`);
  console.log(`  Single file output with Tailwind CDN + GSAP CDN`);
  console.log(`  Open ${htmlPath} in a browser to view`);

  return outputPath;
}
