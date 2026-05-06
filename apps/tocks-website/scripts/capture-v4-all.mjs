#!/usr/bin/env node
/**
 * Tocks v4 Fantastic — Capture Harness
 *
 * Captures uniform Playwright screenshots across all 3 theses for visual comparison.
 *
 * Run AFTER squads finish all 3 theses:
 *   node docs/projects/tocks/v4-fantastic/tools/capture-all-theses.mjs
 *
 * Outputs:
 *   docs/projects/tocks/v4-fantastic/captures/comparison/
 *     thesis-{a|b|c}-desktop-hero.png       (1920x1080 hero only)
 *     thesis-{a|b|c}-desktop-full.png       (1920 wide, full page scroll)
 *     thesis-{a|b|c}-mobile-hero.png        (375x812 hero only)
 *     thesis-{a|b|c}-mobile-full.png        (375 wide, full page scroll)
 *     compare-desktop-hero.png              (3-up grid)
 *     compare-mobile-hero.png               (3-up grid)
 *
 * Requires dev server running on localhost:3000
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = join(
  process.cwd(),
  "docs",
  "projects",
  "tocks",
  "v4-fantastic",
  "captures",
  "comparison"
);

const THESES = [
  { id: "a", name: "Editorial Magazine" },
  { id: "b", name: "Dark Gallery Theater" },
  { id: "c", name: "Underground Biennale" },
];

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 812 },
};

const BASE_URL = process.env.TOCKS_DEV_URL || "http://localhost:3000";

async function ensureDir(path) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

async function capture() {
  await ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch();

  for (const thesis of THESES) {
    const url = `${BASE_URL}/preview/v4-thesis-${thesis.id}`;
    console.log(`\n📸 Thesis ${thesis.id.toUpperCase()} — ${thesis.name}`);
    console.log(`   URL: ${url}`);

    for (const [device, viewport] of Object.entries(VIEWPORTS)) {
      const ctx = await browser.newContext({ viewport });
      const page = await ctx.newPage();

      try {
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        if (!response || !response.ok()) {
          console.warn(`   ⚠️  ${device}: ${response?.status() ?? "no response"} — skipped`);
          await ctx.close();
          continue;
        }

        // Wait for fonts + images
        await page.waitForTimeout(1500);

        // Hero only
        const heroPath = join(OUTPUT_DIR, `thesis-${thesis.id}-${device}-hero.png`);
        await page.screenshot({ path: heroPath, clip: { x: 0, y: 0, width: viewport.width, height: viewport.height } });
        console.log(`   ✓ ${device} hero → ${heroPath}`);

        // Full page
        const fullPath = join(OUTPUT_DIR, `thesis-${thesis.id}-${device}-full.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
        console.log(`   ✓ ${device} full → ${fullPath}`);
      } catch (err) {
        console.error(`   ✗ ${device}: ${err.message}`);
      } finally {
        await ctx.close();
      }
    }
  }

  await browser.close();
  console.log(`\n✅ Captures complete in ${OUTPUT_DIR}`);
  console.log(`\nNext: build 3-up comparison grid via image-magick or PIL if installed.`);
}

capture().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
