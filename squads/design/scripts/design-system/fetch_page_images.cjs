#!/usr/bin/env node
/**
 * Fetch visual screenshots of all Figma pages via Images API
 * Saves PNG images for visual analysis
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Load .env
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .replace(/\r/g, '')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

const TOKEN = process.env.FIGMA_API_KEY;
const FILE_ID = process.env.FIGMA_FILE_ID;

if (!TOKEN || !FILE_ID) {
  console.error('Missing FIGMA_API_KEY or FIGMA_FILE_ID');
  process.exit(1);
}

const MANIFEST_PATH = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction', 'batch-manifest.json');
const IMAGES_DIR = path.join(ROOT, 'workspace', 'domains', 'design-system', 'extraction', 'images');

function figmaGet(endpoint) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.figma.com/v1' + endpoint;
    https.get(url, { headers: { 'X-Figma-Token': TOKEN }, timeout: 60000 }, (res) => {
      if (res.statusCode === 429) {
        const retryAfter = parseInt(res.headers['retry-after'] || '30', 10);
        reject(new Error(`RATE_LIMITED:${retryAfter}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          if (res.statusCode >= 400) {
            reject(new Error(`API ${res.statusCode}: ${body.err || body.message || 'unknown'}`));
          } else {
            resolve(body);
          }
        } catch (e) {
          reject(new Error('Parse failed'));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const follow = (u) => {
      const mod = u.startsWith('https') ? https : require('http');
      mod.get(u, { timeout: 120000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          res.resume();
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }
        const stream = fs.createWriteStream(destPath);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          resolve();
        });
        stream.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('=== FIGMA PAGE IMAGE FETCHER ===\n');

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const contentPages = manifest.pages.filter(p => p.status === 'success');

  console.log(`Content pages to fetch: ${contentPages.length}`);
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // Request one page at a time — large pages cause render timeouts in batches
  // Sort smallest-first for faster initial results, then tackle large pages
  const sortedPages = [...contentPages].sort((a, b) => (a.stats?.totalNodes || 0) - (b.stats?.totalNodes || 0));

  let fetched = 0;
  let errors = 0;
  const errorList = [];

  for (let i = 0; i < sortedPages.length; i++) {
    const page = sortedPages[i];
    const destPath = path.join(IMAGES_DIR, `${page.slug}.png`);
    const nodes = page.stats?.totalNodes || 0;

    // Skip if already downloaded
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
      console.log(`[${i + 1}/${sortedPages.length}] ✓ ${page.slug}: already exists`);
      fetched++;
      continue;
    }

    // Adaptive scale: very large pages get smaller scale
    let scale = 0.25;
    if (nodes > 50000) scale = 0.1;
    else if (nodes > 20000) scale = 0.15;

    console.log(`[${i + 1}/${sortedPages.length}] ${page.slug} (${nodes} nodes, scale=${scale})...`);

    let success = false;
    let retries = 0;
    const maxRetries = 2;

    while (!success && retries <= maxRetries) {
      try {
        const result = await figmaGet(`/images/${FILE_ID}?ids=${encodeURIComponent(page.nodeId)}&format=png&scale=${scale}`);

        if (result.err) {
          throw new Error(result.err);
        }

        const images = result.images || {};
        const imgUrl = images[page.nodeId];

        if (!imgUrl) {
          console.log('  ○ no image returned');
          break;
        }

        await downloadFile(imgUrl, destPath);
        const size = fs.statSync(destPath).size;
        console.log(`  ✓ ${Math.round(size / 1024)}KB`);
        fetched++;
        success = true;
      } catch (err) {
        if (err.message.startsWith('RATE_LIMITED:')) {
          const waitSec = parseInt(err.message.split(':')[1], 10);
          console.log(`  ⏳ Rate limited, waiting ${waitSec}s...`);
          await sleep(waitSec * 1000);
          retries++; // doesn't count as a retry
        } else if (err.message.includes('timeout') || err.message.includes('Render')) {
          // Try even smaller scale
          scale = Math.max(0.05, scale / 2);
          console.log(`  ⏳ Render timeout, retrying with scale=${scale}...`);
          retries++;
          await sleep(3000);
        } else {
          console.error(`  ✗ ${err.message}`);
          errorList.push({ slug: page.slug, error: err.message });
          errors++;
          break;
        }
      }
    }

    if (!success && retries > maxRetries) {
      console.error(`  ✗ Failed after ${maxRetries} retries`);
      errorList.push({ slug: page.slug, error: 'max retries exceeded' });
      errors++;
    }

    // Rate limit pause
    await sleep(1500);
  }

  console.log('\n=== DONE ===');
  console.log(`  Fetched: ${fetched}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Output: ${IMAGES_DIR}`);
}

main().catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
