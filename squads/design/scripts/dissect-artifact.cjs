#!/usr/bin/env node
/**
 * Design Artifact Dissector
 * @module design/scripts/dissect-artifact
 * @version 1.0.0
 *
 * Pixel-level design extraction using Playwright.
 * Downloads HTML, extracts ALL CSS, maps complete DOM tree,
 * captures screenshots, and generates comprehensive design tokens.
 *
 * Usage:
 *   node dissect-artifact.js <url|path> [options]
 *
 * Options:
 *   --name, -n       Artifact name (required, e.g. "landing-page")
 *   --output, -o     Output directory (default: outputs/design-system/scans/{name})
 *   --viewport, -v   Viewport: widthxheight (default: 1440x900)
 *   --mobile         Also capture mobile viewport (375x812)
 *   --full-page      Capture full-page screenshot (default: true)
 *   --timeout, -t    Navigation timeout in seconds (default: 30)
 *   --help, -h       Show help
 *
 * Output structure:
 *   {output}/
 *   ├── source.html              # Raw HTML source
 *   ├── screenshot-desktop.png   # Full-page desktop screenshot
 *   ├── screenshot-mobile.png    # Full-page mobile screenshot (if --mobile)
 *   ├── stylesheets/             # All external CSS files downloaded
 *   ├── dom-tree.json            # Complete DOM tree with computed styles
 *   ├── extracted-css.json       # All CSS rules organized by type
 *   ├── tokens.yaml              # Auto-generated design tokens
 *   ├── components.json          # Detected component patterns
 *   └── manifest.json            # Scan metadata and summary
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(args) {
  const parsed = {
    target: null,
    name: null,
    output: null,
    viewport: { width: 1440, height: 900 },
    mobile: false,
    fullPage: true,
    timeout: 30,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--name' || arg === '-n') {
      parsed.name = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      parsed.output = args[++i];
    } else if (arg === '--viewport' || arg === '-v') {
      const [w, h] = (args[++i] || '1440x900').split('x').map(Number);
      parsed.viewport = { width: w || 1440, height: h || 900 };
    } else if (arg === '--mobile') {
      parsed.mobile = true;
    } else if (arg === '--no-full-page') {
      parsed.fullPage = false;
    } else if (arg === '--timeout' || arg === '-t') {
      parsed.timeout = parseInt(args[++i]) || 30;
    } else if (!arg.startsWith('-') && !parsed.target) {
      parsed.target = arg;
    }
  }

  return parsed;
}

function showHelp() {
  console.log(`
Design Artifact Dissector v1.0.0

Usage:
  node dissect-artifact.js <url|path> --name <artifact-name> [options]

Arguments:
  url|path           URL or local file path to dissect

Options:
  --name, -n         Artifact name (required, e.g. "landing-page")
  --output, -o       Output directory (default: outputs/design-system/scans/{name})
  --viewport, -v     Viewport: WxH (default: 1440x900)
  --mobile           Also capture mobile viewport (375x812)
  --no-full-page     Only capture visible viewport
  --timeout, -t      Navigation timeout in seconds (default: 30)
  --help, -h         Show this help

Examples:
  node dissect-artifact.js https://stripe.com --name stripe-home
  node dissect-artifact.js ./mockup.html --name dashboard-v2 --mobile
  node dissect-artifact.js https://linear.app --name linear-landing -v 1920x1080
`);
}

// ---------------------------------------------------------------------------
// DOM Extraction (runs in browser context)
// ---------------------------------------------------------------------------

/**
 * Extracts complete design data from the page.
 * This function runs inside the browser via page.evaluate().
 */
function extractDesignData() {
  const result = {
    stylesheets: [],
    inlineStyles: [],
    cssRules: {
      colors: new Map(),
      typography: new Map(),
      spacing: new Map(),
      borders: new Map(),
      shadows: new Map(),
      gradients: [],
      animations: [],
      transitions: [],
      mediaQueries: [],
      customProperties: new Map(),
      gridLayouts: [],
      flexLayouts: [],
    },
    domTree: null,
    components: [],
    summary: {},
  };

  // ---- 1. Extract all CSS custom properties (CSS variables) ----
  const rootStyles = getComputedStyle(document.documentElement);
  for (let i = 0; i < rootStyles.length; i++) {
    const prop = rootStyles[i];
    if (prop.startsWith('--')) {
      result.cssRules.customProperties.set(prop, rootStyles.getPropertyValue(prop).trim());
    }
  }

  // ---- 2. Extract all stylesheet rules ----
  for (const sheet of document.styleSheets) {
    const sheetData = {
      href: sheet.href || '(embedded)',
      rules: [],
    };

    try {
      for (const rule of sheet.cssRules) {
        sheetData.rules.push({
          type: rule.type,
          selector: rule.selectorText || null,
          cssText: rule.cssText,
          media: rule.media ? Array.from(rule.media) : null,
        });

        // Collect media queries
        if (rule.type === CSSRule.MEDIA_RULE) {
          result.cssRules.mediaQueries.push({
            condition: rule.conditionText || rule.media.mediaText,
            ruleCount: rule.cssRules.length,
            rules: Array.from(rule.cssRules).map(r => ({
              selector: r.selectorText,
              cssText: r.cssText,
            })),
          });
        }

        // Collect animations
        if (rule.type === CSSRule.KEYFRAMES_RULE) {
          result.cssRules.animations.push({
            name: rule.name,
            cssText: rule.cssText,
          });
        }
      }
    } catch (e) {
      // Cross-origin stylesheets can't be read
      sheetData.error = 'Cross-origin: unable to read rules';
    }

    result.stylesheets.push(sheetData);
  }

  // ---- 3. Walk the DOM tree ----
  const STYLE_PROPS = [
    // Colors
    'color', 'background-color', 'background-image', 'background',
    'border-color', 'border-top-color', 'border-right-color',
    'border-bottom-color', 'border-left-color', 'outline-color',
    // Typography
    'font-family', 'font-size', 'font-weight', 'font-style',
    'line-height', 'letter-spacing', 'text-align', 'text-decoration',
    'text-transform', 'word-spacing', 'white-space',
    // Spacing
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    // Layout
    'display', 'position', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'overflow', 'overflow-x', 'overflow-y', 'z-index',
    // Flex
    'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
    'align-content', 'gap', 'row-gap', 'column-gap',
    'flex-grow', 'flex-shrink', 'flex-basis', 'order',
    // Grid
    'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
    'grid-column', 'grid-row', 'grid-gap',
    // Border
    'border-width', 'border-style', 'border-radius',
    'border-top-left-radius', 'border-top-right-radius',
    'border-bottom-left-radius', 'border-bottom-right-radius',
    // Shadow
    'box-shadow', 'text-shadow',
    // Transform
    'transform', 'opacity',
    // Transition/Animation
    'transition', 'animation',
    // Other
    'cursor', 'pointer-events', 'user-select', 'box-sizing',
    'object-fit', 'object-position', 'aspect-ratio',
    'backdrop-filter', 'filter', 'mix-blend-mode',
    'clip-path', 'mask',
  ];

  let nodeCount = 0;
  const MAX_NODES = 5000;

  function walkDOM(element, depth = 0) {
    if (nodeCount >= MAX_NODES) return null;
    nodeCount++;

    const computed = getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    // Extract only non-default / meaningful computed styles
    const styles = {};
    for (const prop of STYLE_PROPS) {
      const val = computed.getPropertyValue(prop).trim();
      if (val && val !== 'none' && val !== 'normal' && val !== 'auto' && val !== '0px' && val !== 'rgba(0, 0, 0, 0)') {
        styles[prop] = val;
      }
    }

    // Collect unique values
    if (styles['color']) result.cssRules.colors.set(styles['color'], (result.cssRules.colors.get(styles['color']) || 0) + 1);
    if (styles['background-color'] && styles['background-color'] !== 'rgba(0, 0, 0, 0)') {
      result.cssRules.colors.set(styles['background-color'], (result.cssRules.colors.get(styles['background-color']) || 0) + 1);
    }
    if (styles['background-image'] && styles['background-image'].includes('gradient')) {
      result.cssRules.gradients.push(styles['background-image']);
    }
    if (styles['font-family']) {
      const key = `${styles['font-size']}/${styles['font-weight']}/${styles['font-family']}`;
      result.cssRules.typography.set(key, (result.cssRules.typography.get(key) || 0) + 1);
    }
    if (styles['box-shadow']) result.cssRules.shadows.set(styles['box-shadow'], (result.cssRules.shadows.get(styles['box-shadow']) || 0) + 1);
    if (styles['transition']) result.cssRules.transitions.push(styles['transition']);
    if (styles['display'] === 'grid') {
      result.cssRules.gridLayouts.push({
        columns: styles['grid-template-columns'],
        rows: styles['grid-template-rows'],
        gap: styles['gap'] || styles['grid-gap'],
      });
    }
    if (styles['display'] === 'flex') {
      result.cssRules.flexLayouts.push({
        direction: styles['flex-direction'],
        wrap: styles['flex-wrap'],
        justify: styles['justify-content'],
        align: styles['align-items'],
        gap: styles['gap'],
      });
    }

    // Spacing values
    ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'gap'].forEach(prop => {
      if (styles[prop] && styles[prop] !== '0px') {
        result.cssRules.spacing.set(styles[prop], (result.cssRules.spacing.get(styles[prop]) || 0) + 1);
      }
    });

    // Border values
    if (styles['border-width'] && styles['border-width'] !== '0px') {
      const key = `${styles['border-width']} ${styles['border-style']} ${styles['border-color']}`;
      result.cssRules.borders.set(key, (result.cssRules.borders.get(key) || 0) + 1);
    }

    const node = {
      tag: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: element.className && typeof element.className === 'string'
        ? element.className.split(/\s+/).filter(Boolean)
        : [],
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      styles,
      attributes: {},
      text: null,
      children: [],
    };

    // Capture key attributes
    for (const attr of ['href', 'src', 'alt', 'role', 'aria-label', 'data-testid', 'type', 'placeholder']) {
      if (element.hasAttribute(attr)) {
        node.attributes[attr] = element.getAttribute(attr);
      }
    }

    // Inline styles
    if (element.style.cssText) {
      node.inlineStyle = element.style.cssText;
      result.inlineStyles.push({
        selector: `${node.tag}${node.id ? '#' + node.id : ''}${node.classes.length ? '.' + node.classes[0] : ''}`,
        cssText: element.style.cssText,
      });
    }

    // Text content (direct text only, not children)
    const directText = Array.from(element.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .filter(Boolean)
      .join(' ');
    if (directText) node.text = directText.substring(0, 200);

    // Recurse children (elements only)
    for (const child of element.children) {
      if (['script', 'style', 'noscript', 'svg', 'path'].includes(child.tagName.toLowerCase())) continue;
      const childNode = walkDOM(child, depth + 1);
      if (childNode) node.children.push(childNode);
    }

    return node;
  }

  result.domTree = walkDOM(document.body);
  result.summary.nodeCount = nodeCount;

  // ---- 4. Detect component patterns ----
  const componentSelectors = [
    { pattern: 'nav, [role="navigation"]', type: 'navigation' },
    { pattern: 'header, [role="banner"]', type: 'header' },
    { pattern: 'footer, [role="contentinfo"]', type: 'footer' },
    { pattern: 'main, [role="main"]', type: 'main-content' },
    { pattern: 'aside, [role="complementary"]', type: 'sidebar' },
    { pattern: 'form', type: 'form' },
    { pattern: 'button, [role="button"], input[type="submit"]', type: 'button' },
    { pattern: 'a.btn, a.button, a.cta, a[class*="btn"], a[class*="button"]', type: 'cta-link' },
    { pattern: 'input, textarea, select', type: 'form-input' },
    { pattern: '[class*="card"], [class*="Card"]', type: 'card' },
    { pattern: '[class*="modal"], [class*="Modal"], [role="dialog"]', type: 'modal' },
    { pattern: '[class*="hero"], [class*="Hero"]', type: 'hero' },
    { pattern: '[class*="dropdown"], [class*="Dropdown"], [class*="menu"]', type: 'dropdown' },
    { pattern: '[class*="tab"], [role="tablist"]', type: 'tabs' },
    { pattern: '[class*="accordion"]', type: 'accordion' },
    { pattern: '[class*="toast"], [class*="notification"], [class*="alert"]', type: 'notification' },
    { pattern: '[class*="badge"], [class*="tag"], [class*="chip"]', type: 'badge' },
    { pattern: '[class*="avatar"]', type: 'avatar' },
    { pattern: '[class*="tooltip"]', type: 'tooltip' },
    { pattern: 'img, picture, [class*="image"], [class*="Image"]', type: 'image' },
    { pattern: 'video, [class*="video"]', type: 'video' },
    { pattern: '[class*="slider"], [class*="carousel"], [class*="swiper"]', type: 'carousel' },
    { pattern: '[class*="grid"], [class*="Grid"]', type: 'grid-layout' },
    { pattern: 'table, [class*="table"]', type: 'table' },
    { pattern: '[class*="breadcrumb"]', type: 'breadcrumb' },
    { pattern: '[class*="pagination"]', type: 'pagination' },
    { pattern: '[class*="progress"]', type: 'progress' },
    { pattern: '[class*="skeleton"], [class*="loading"]', type: 'skeleton' },
  ];

  for (const { pattern, type } of componentSelectors) {
    try {
      const elements = document.querySelectorAll(pattern);
      if (elements.length > 0) {
        const samples = Array.from(elements).slice(0, 3).map(el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            classes: el.className && typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean).slice(0, 5) : [],
            rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
            styles: {
              display: cs.display,
              background: cs.backgroundColor,
              color: cs.color,
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
              borderRadius: cs.borderRadius,
              boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
            },
          };
        });

        result.components.push({
          type,
          count: elements.length,
          samples,
        });
      }
    } catch (e) {
      // Invalid selector, skip
    }
  }

  // ---- 5. Convert Maps to objects for serialization ----
  const mapToSorted = (map) => {
    const entries = Array.from(map.entries());
    entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([value, count]) => ({ value, count }));
  };

  return {
    stylesheets: result.stylesheets,
    inlineStyles: result.inlineStyles,
    cssRules: {
      colors: mapToSorted(result.cssRules.colors),
      typography: mapToSorted(result.cssRules.typography),
      spacing: mapToSorted(result.cssRules.spacing),
      borders: mapToSorted(result.cssRules.borders),
      shadows: mapToSorted(result.cssRules.shadows),
      gradients: [...new Set(result.cssRules.gradients)],
      animations: result.cssRules.animations,
      transitions: [...new Set(result.cssRules.transitions)].slice(0, 50),
      mediaQueries: result.cssRules.mediaQueries,
      customProperties: Object.fromEntries(result.cssRules.customProperties),
      gridLayouts: result.cssRules.gridLayouts.slice(0, 20),
      flexLayouts: result.cssRules.flexLayouts.slice(0, 50),
    },
    domTree: result.domTree,
    components: result.components,
    summary: result.summary,
  };
}

// ---------------------------------------------------------------------------
// Token Generation
// ---------------------------------------------------------------------------

function generateTokensYaml(data, meta) {
  const lines = [];
  lines.push(`# Design Tokens - ${meta.name}`);
  lines.push('# Extracted by dissect-artifact.js v1.0.0');
  lines.push(`# Source: ${meta.target}`);
  lines.push(`# Date: ${meta.timestamp}`);
  lines.push('');
  lines.push('metadata:');
  lines.push('  version: "1.0.0"');
  lines.push(`  source: "${meta.target}"`);
  lines.push(`  generated_at: "${meta.timestamp}"`);
  lines.push(`  node_count: ${data.summary.nodeCount}`);
  lines.push('');

  // Colors
  lines.push('colors:');
  if (data.cssRules.colors.length === 0) {
    lines.push('  # No colors extracted');
  }
  for (const { value, count } of data.cssRules.colors.slice(0, 40)) {
    const safeName = value.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    lines.push(`  "${safeName}":`);
    lines.push(`    value: "${value}"`);
    lines.push(`    occurrences: ${count}`);
  }
  lines.push('');

  // Typography
  lines.push('typography:');
  if (data.cssRules.typography.length === 0) {
    lines.push('  # No typography extracted');
  }
  for (const { value, count } of data.cssRules.typography.slice(0, 20)) {
    const [size, weight, family] = value.split('/');
    const name = `${size}_${weight}`.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  "${name}":`);
    lines.push(`    font-size: "${size}"`);
    lines.push(`    font-weight: "${weight}"`);
    lines.push(`    font-family: "${family}"`);
    lines.push(`    occurrences: ${count}`);
  }
  lines.push('');

  // Spacing
  lines.push('spacing:');
  if (data.cssRules.spacing.length === 0) {
    lines.push('  # No spacing extracted');
  }
  for (const { value, count } of data.cssRules.spacing.slice(0, 20)) {
    const name = value.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  "${name}":`);
    lines.push(`    value: "${value}"`);
    lines.push(`    occurrences: ${count}`);
  }
  lines.push('');

  // Shadows
  if (data.cssRules.shadows.length > 0) {
    lines.push('shadows:');
    data.cssRules.shadows.slice(0, 10).forEach(({ value, count }, i) => {
      lines.push(`  shadow_${i + 1}:`);
      lines.push(`    value: "${value.replace(/"/g, '\\"')}"`);
      lines.push(`    occurrences: ${count}`);
    });
    lines.push('');
  }

  // Borders
  if (data.cssRules.borders.length > 0) {
    lines.push('borders:');
    data.cssRules.borders.slice(0, 10).forEach(({ value, count }, i) => {
      lines.push(`  border_${i + 1}:`);
      lines.push(`    value: "${value.replace(/"/g, '\\"')}"`);
      lines.push(`    occurrences: ${count}`);
    });
    lines.push('');
  }

  // Gradients
  if (data.cssRules.gradients.length > 0) {
    lines.push('gradients:');
    data.cssRules.gradients.slice(0, 10).forEach((val, i) => {
      lines.push(`  gradient_${i + 1}: "${val.replace(/"/g, '\\"')}"`);
    });
    lines.push('');
  }

  // CSS Custom Properties
  const customProps = Object.entries(data.cssRules.customProperties);
  if (customProps.length > 0) {
    lines.push('custom_properties:');
    for (const [prop, val] of customProps.slice(0, 50)) {
      lines.push(`  "${prop}": "${val.replace(/"/g, '\\"')}"`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// External stylesheet downloader
// ---------------------------------------------------------------------------

async function downloadStylesheets(page, outputDir) {
  const stylesheetDir = path.join(outputDir, 'stylesheets');
  fs.mkdirSync(stylesheetDir, { recursive: true });

  const stylesheetUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => link.href)
      .filter(href => href && href.startsWith('http'));
  });

  const downloaded = [];
  for (const url of stylesheetUrls) {
    try {
      const response = await page.request.get(url);
      const body = await response.text();
      const filename = url.split('/').pop().split('?')[0] || 'stylesheet.css';
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80);
      const filePath = path.join(stylesheetDir, safeName);
      fs.writeFileSync(filePath, body);
      downloaded.push({ url, file: safeName, size: body.length });
      console.error(`  Downloaded: ${safeName} (${body.length} bytes)`);
    } catch (e) {
      downloaded.push({ url, error: e.message });
      console.error(`  Failed: ${url} (${e.message})`);
    }
  }

  // Also extract embedded <style> tags
  const embeddedStyles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('style'))
      .map((el, i) => ({ index: i, cssText: el.textContent }))
      .filter(s => s.cssText.trim().length > 0);
  });

  for (const { index, cssText } of embeddedStyles) {
    const filePath = path.join(stylesheetDir, `embedded-${index}.css`);
    fs.writeFileSync(filePath, cssText);
    downloaded.push({ embedded: true, file: `embedded-${index}.css`, size: cssText.length });
    console.error(`  Extracted: embedded-${index}.css (${cssText.length} bytes)`);
  }

  return downloaded;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.target) {
    console.error('Error: URL or file path is required');
    console.error('Usage: node dissect-artifact.js <url|path> --name <name>');
    process.exit(1);
  }

  if (!args.name) {
    console.error('Error: --name is required');
    console.error('Usage: node dissect-artifact.js <url|path> --name <name>');
    process.exit(1);
  }

  // Determine if target is URL or file
  const isUrl = args.target.startsWith('http://') || args.target.startsWith('https://');
  const target = isUrl ? args.target : `file://${path.resolve(args.target)}`;

  // Output directory
  const projectRoot = path.resolve(__dirname, '../../..');
  const outputDir = args.output || path.join(projectRoot, 'outputs', 'design-system', 'scans', args.name);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'stylesheets'), { recursive: true });

  const timestamp = new Date().toISOString();
  console.error('\n=== Design Artifact Dissector v1.0.0 ===');
  console.error(`Target: ${args.target}`);
  console.error(`Name: ${args.name}`);
  console.error(`Output: ${outputDir}`);
  console.error(`Viewport: ${args.viewport.width}x${args.viewport.height}`);
  console.error('');

  let browser;
  try {
    // Launch browser
    console.error('1/7 Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: args.viewport,
      deviceScaleFactor: 2, // Retina
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Navigate
    console.error('2/7 Loading page...');
    await page.goto(target, {
      waitUntil: 'networkidle',
      timeout: args.timeout * 1000,
    });

    // Wait extra for JS rendering
    await page.waitForTimeout(2000);

    // Save raw HTML
    console.error('3/7 Saving HTML source...');
    const html = await page.content();
    fs.writeFileSync(path.join(outputDir, 'source.html'), html);
    console.error(`  Saved: source.html (${html.length} bytes)`);

    // Download all stylesheets
    console.error('4/7 Downloading stylesheets...');
    const stylesheetManifest = await downloadStylesheets(page, outputDir);

    // Take screenshots
    console.error('5/7 Capturing screenshots...');
    await page.screenshot({
      path: path.join(outputDir, 'screenshot-desktop.png'),
      fullPage: args.fullPage,
      type: 'png',
    });
    console.error('  Saved: screenshot-desktop.png');

    if (args.mobile) {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(outputDir, 'screenshot-mobile.png'),
        fullPage: args.fullPage,
        type: 'png',
      });
      console.error('  Saved: screenshot-mobile.png');

      // Reset to desktop for extraction
      await page.setViewportSize(args.viewport);
      await page.waitForTimeout(500);
    }

    // Extract design data
    console.error('6/7 Extracting design data (DOM walk + computed styles)...');
    const designData = await page.evaluate(extractDesignData);

    // Save extracted data
    fs.writeFileSync(
      path.join(outputDir, 'dom-tree.json'),
      JSON.stringify(designData.domTree, null, 2),
    );
    console.error(`  Saved: dom-tree.json (${designData.summary.nodeCount} nodes)`);

    fs.writeFileSync(
      path.join(outputDir, 'extracted-css.json'),
      JSON.stringify(designData.cssRules, null, 2),
    );
    console.error('  Saved: extracted-css.json');

    fs.writeFileSync(
      path.join(outputDir, 'components.json'),
      JSON.stringify(designData.components, null, 2),
    );
    console.error(`  Saved: components.json (${designData.components.length} component types)`);

    // Generate tokens
    console.error('7/7 Generating design tokens...');
    const tokensYaml = generateTokensYaml(designData, {
      name: args.name,
      target: args.target,
      timestamp,
    });
    fs.writeFileSync(path.join(outputDir, 'tokens.yaml'), tokensYaml);
    console.error('  Saved: tokens.yaml');

    // Generate manifest
    const manifest = {
      version: '1.0.0',
      name: args.name,
      source: args.target,
      timestamp,
      viewport: args.viewport,
      output: outputDir,
      files: {
        html: { file: 'source.html', size: html.length },
        screenshots: ['screenshot-desktop.png', ...(args.mobile ? ['screenshot-mobile.png'] : [])],
        stylesheets: stylesheetManifest,
        domTree: { file: 'dom-tree.json', nodeCount: designData.summary.nodeCount },
        extractedCss: 'extracted-css.json',
        components: { file: 'components.json', count: designData.components.length },
        tokens: 'tokens.yaml',
      },
      summary: {
        nodeCount: designData.summary.nodeCount,
        uniqueColors: designData.cssRules.colors.length,
        typographyVariants: designData.cssRules.typography.length,
        spacingValues: designData.cssRules.spacing.length,
        shadows: designData.cssRules.shadows.length,
        gradients: designData.cssRules.gradients.length,
        animations: designData.cssRules.animations.length,
        mediaQueries: designData.cssRules.mediaQueries.length,
        customProperties: Object.keys(designData.cssRules.customProperties).length,
        gridLayouts: designData.cssRules.gridLayouts.length,
        flexLayouts: designData.cssRules.flexLayouts.length,
        componentTypes: designData.components.length,
        totalComponents: designData.components.reduce((sum, c) => sum + c.count, 0),
        stylesheetCount: stylesheetManifest.length,
        inlineStyles: designData.inlineStyles.length,
      },
    };

    fs.writeFileSync(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
    );

    // ---- Print summary to stdout (for agent consumption) ----
    console.log(JSON.stringify(manifest, null, 2));

    console.error('\n=== Dissection Complete ===');
    console.error(`Output: ${outputDir}`);
    console.error('');
    console.error('Summary:');
    console.error(`  Nodes scanned:      ${manifest.summary.nodeCount}`);
    console.error(`  Unique colors:      ${manifest.summary.uniqueColors}`);
    console.error(`  Typography:         ${manifest.summary.typographyVariants} variants`);
    console.error(`  Spacing values:     ${manifest.summary.spacingValues}`);
    console.error(`  Shadows:            ${manifest.summary.shadows}`);
    console.error(`  Gradients:          ${manifest.summary.gradients}`);
    console.error(`  Animations:         ${manifest.summary.animations}`);
    console.error(`  Media queries:      ${manifest.summary.mediaQueries}`);
    console.error(`  CSS variables:      ${manifest.summary.customProperties}`);
    console.error(`  Grid layouts:       ${manifest.summary.gridLayouts}`);
    console.error(`  Flex layouts:       ${manifest.summary.flexLayouts}`);
    console.error(`  Component types:    ${manifest.summary.componentTypes}`);
    console.error(`  Total components:   ${manifest.summary.totalComponents}`);
    console.error(`  Stylesheets:        ${manifest.summary.stylesheetCount}`);
    console.error(`  Inline styles:      ${manifest.summary.inlineStyles}`);

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    if (error.message.includes('Executable doesn\'t exist')) {
      console.error('\nPlaywright browsers not installed. Run:');
      console.error('  npx playwright install chromium');
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
