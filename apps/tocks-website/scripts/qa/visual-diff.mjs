// S-7.3 / AC-5 — Pixelmatch baseline vs current.
//
// Baselines in docs/design/approved-variants/*.png are low-res vertical thumbnails
// (e.g. 125x512) — they capture aesthetic intent, not 1440x900 production framing.
// Current screenshots are 1440 x fullPage. To compare like-with-like we resize the
// current screenshot to the baseline's dimensions (preserves layout proportions for
// the structural diff that matters at this gate).
//
// Memory hygiene: process ONE pair at a time, free buffers between iterations.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';

const PAIRS = [
  { name: 'home', baseline: 'home.png', current: 'home-current.png' },
  // Berlin baseline vs Tenro Luxo current — content differs intentionally.
  { name: 'produto', baseline: 'produto-berlin.png', current: 'produto-current.png' },
  { name: 'contato', baseline: 'contato.png', current: 'contato-current.png' },
];

const BASELINE_DIR = path.resolve('docs/design/approved-variants');
const CURRENT_DIR = path.resolve('docs/qa/visual');

const results = [];

for (const pair of PAIRS) {
  const baselinePath = path.join(BASELINE_DIR, pair.baseline);
  const currentPath = path.join(CURRENT_DIR, pair.current);

  // Read baseline first to learn target dimensions.
  let baselineBuf = await fs.readFile(baselinePath);
  let basePng = PNG.sync.read(baselineBuf);
  baselineBuf = null;

  const targetW = basePng.width;
  const targetH = basePng.height;

  // Resize current to baseline dims using sharp (memory-light streaming pipeline).
  const resizedCurrentBuf = await sharp(currentPath)
    .resize(targetW, targetH, { fit: 'fill' })
    .png()
    .toBuffer();
  let currPng = PNG.sync.read(resizedCurrentBuf);

  const diff = new PNG({ width: targetW, height: targetH });
  const diffPixels = pixelmatch(
    basePng.data,
    currPng.data,
    diff.data,
    targetW,
    targetH,
    { threshold: 0.1, includeAA: false }
  );
  const diffPercent = (diffPixels / (targetW * targetH)) * 100;

  // Free input PNGs BEFORE encoding diff to keep memory flat.
  basePng = null;
  currPng = null;

  const diffPath = path.join(CURRENT_DIR, `${pair.name}-diff.png`);
  await fs.writeFile(diffPath, PNG.sync.write(diff));

  results.push({
    name: pair.name,
    baseline: pair.baseline,
    current: pair.current,
    targetDim: { w: targetW, h: targetH },
    diffPixels,
    diffPercent: Number(diffPercent.toFixed(3)),
    diffPath: path.relative(process.cwd(), diffPath),
  });

  if (typeof global.gc === 'function') global.gc();
}

console.log(JSON.stringify(results, null, 2));
