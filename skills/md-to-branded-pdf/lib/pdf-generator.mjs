/**
 * Puppeteer wrapper for HTML-to-PDF generation.
 * Key insight: margin 0 in Puppeteer + internal CSS padding
 * eliminates white borders on dark themes.
 */

import puppeteer from 'puppeteer';
import { writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

/**
 * Generate a PDF from an HTML string.
 * @param {string} html - Complete HTML document
 * @param {string} outputPath - Path for the output PDF
 */
export async function generatePDF(html, outputPath) {
  const tempHtml = resolve(tmpdir(), `branded-pdf-${randomBytes(6).toString('hex')}.html`);
  writeFileSync(tempHtml, html, 'utf-8');

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${tempHtml}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts to load (replaces fixed 2s delay)
    await page.waitForFunction(() => document.fonts.ready.then(() => true), { timeout: 10000 });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    console.log(`PDF generated: ${outputPath}`);
  } finally {
    await browser.close();
    try { unlinkSync(tempHtml); } catch { /* ignore cleanup errors */ }
  }
}
