#!/usr/bin/env node
/**
 * build-design-md-index.js
 *
 * Builds D:/AIOS/.aios-core/data/design-md-index.yaml — searchable index of
 * brand DESIGN.md resources from the VoltAgent/awesome-design-md upstream.
 *
 * IMPORTANT: As of upstream commit 6dc4def, the actual DESIGN.md content was
 * migrated off-repo to `https://getdesign.md/{brand}/design-md`. The cloned
 * brand folders only contain stub READMEs pointing to those URLs. This script
 * therefore parses the upstream README.md catalog (which has full vertical +
 * tagline mapping for all brands) plus the local clone's brand folder list
 * (the subset actually shipping at clone time).
 *
 * Outputs:
 *   - YAML index keyed by vertical, with brand entries containing:
 *       id, name, path (clone path or remote URL), remote_url, primary_color,
 *       primary_font, tier, keywords
 *
 * Notes:
 *   - primary_color and primary_font are inferred heuristically from the
 *     brand tagline; we do NOT have access to the off-repo DESIGN.md tokens.
 *     When agents need exact tokens, they should fetch the remote_url.
 *   - Tier classification follows the mission spec (luxury / enterprise /
 *     saas / consumer / ai-platform).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AIOS_ROOT = path.resolve(__dirname, '..', '..', '..');
const LIBRARY_DIR = path.join(AIOS_ROOT, '.aios-core', 'development', 'data', 'design-md-library');
const README_PATH = path.join(LIBRARY_DIR, 'README.md');
const DESIGN_MD_DIR = path.join(LIBRARY_DIR, 'design-md');
const OUTPUT_PATH = path.join(AIOS_ROOT, '.aios-core', 'data', 'design-md-index.yaml');

// === TIER CLASSIFICATION (from mission spec) ============================
const TIER_MAP = {
  luxury: ['apple', 'tesla', 'ferrari', 'lamborghini', 'bmw', 'nike', 'bugatti', 'starbucks'],
  enterprise: ['ibm', 'nvidia', 'spacex', 'stripe', 'mongodb', 'clickhouse', 'supabase', 'posthog', 'hashicorp', 'mastercard'],
  saas: ['linear', 'linear.app', 'notion', 'cal', 'cal.com', 'zapier', 'cursor', 'vercel', 'raycast', 'warp', 'expo', 'figma', 'framer', 'webflow', 'mintlify', 'sentry', 'sanity', 'composio', 'intercom', 'lovable', 'opencode.ai', 'resend', 'semrush', 'superhuman', 'airtable', 'miro', 'clay'],
  consumer: ['spotify', 'airbnb', 'shopify', 'pinterest', 'uber', 'meta', 'playstation', 'theverge', 'wired', 'vodafone', 'renault'],
  'ai-platform': ['claude', 'cohere', 'mistral', 'mistral.ai', 'elevenlabs', 'ollama', 'minimax', 'replicate', 'runwayml', 'together', 'together.ai', 'voltagent', 'x.ai', 'xai'],
  fintech: ['binance', 'coinbase', 'kraken', 'revolut', 'wise']
};

function classifyTier(brandId) {
  const id = brandId.toLowerCase();
  for (const [tier, brands] of Object.entries(TIER_MAP)) {
    if (brands.includes(id)) return tier;
  }
  return 'unclassified';
}

// === VERTICAL HEADERS (from README.md sections) ==========================
const VERTICAL_KEY_MAP = {
  'AI & LLM Platforms': 'ai-llm-platforms',
  'Developer Tools & IDEs': 'developer-tools-ides',
  'Backend, Database & DevOps': 'backend-database-devops',
  'Productivity & SaaS': 'productivity-saas',
  'Design & Creative Tools': 'design-creative-tools',
  'Fintech & Crypto': 'fintech-crypto',
  'E-commerce & Retail': 'ecommerce-retail',
  'Media & Consumer Tech': 'media-consumer-tech',
  'Automotive': 'automotive'
};

const VERTICAL_DESCRIPTIONS = {
  'ai-llm-platforms': 'AI & LLM platforms with conversational/agentic UX',
  'developer-tools-ides': 'IDEs, code editors, and developer-facing platforms',
  'backend-database-devops': 'Backend, database, and DevOps infrastructure tools',
  'productivity-saas': 'Productivity and SaaS workspace applications',
  'design-creative-tools': 'Design tools, creative platforms, and visual builders',
  'fintech-crypto': 'Financial technology, banking, and cryptocurrency platforms',
  'ecommerce-retail': 'E-commerce platforms and retail brand experiences',
  'media-consumer-tech': 'Media outlets, consumer electronics, and entertainment',
  'automotive': 'Luxury and mass-market automotive brand experiences'
};

// === KEYWORD INFERENCE ===================================================
function inferKeywords(name, tagline) {
  const blob = `${name} ${tagline}`.toLowerCase();
  const keywords = new Set();
  const matchers = [
    { kw: 'dark', re: /\bdark\b/ },
    { kw: 'minimal', re: /\b(minimal|minimalism|sparse|stark)\b/ },
    { kw: 'cinematic', re: /\bcinemat/ },
    { kw: 'gradient', re: /\bgradient/ },
    { kw: 'editorial', re: /\beditorial\b/ },
    { kw: 'luxury', re: /\b(luxury|premium|cathedral|monumental)\b/ },
    { kw: 'monochrome', re: /\bmonochrome\b/ },
    { kw: 'photography', re: /\bphotograph/ },
    { kw: 'developer', re: /\bdeveloper/ },
    { kw: 'ai', re: /\bai\b|llm|agent/ },
    { kw: 'fintech', re: /\b(fintech|banking|trading|payment|crypto|exchange)\b/ },
    { kw: 'data-rich', re: /\bdata-(rich|dense|driven)\b|dashboard/ },
    { kw: 'serif', re: /\bserif\b/ },
    { kw: 'monospace', re: /\bmonospace\b/ },
    { kw: 'green', re: /\bgreen\b|emerald/ },
    { kw: 'purple', re: /\bpurple\b|ultraviolet/ },
    { kw: 'red', re: /\bred\b|coral|terracotta/ },
    { kw: 'blue', re: /\bblue\b/ },
    { kw: 'yellow', re: /\byellow\b|gold\b/ },
    { kw: 'orange', re: /\borange\b/ },
    { kw: 'conversational', re: /\b(conversational|chat)\b/ },
    { kw: 'enterprise', re: /\benterprise\b/ },
    { kw: 'terminal', re: /\bterminal\b/ },
    { kw: 'illustration', re: /\billustration\b/ },
    { kw: 'motion', re: /\bmotion\b|animation/ }
  ];
  for (const m of matchers) if (m.re.test(blob)) keywords.add(m.kw);
  return Array.from(keywords);
}

// Heuristic primary color inference from tagline color words
function inferPrimaryColor(tagline) {
  const t = tagline.toLowerCase();
  // Specific brand-color phrases first
  if (/\bferrari red\b/.test(t)) return '#FF2800';
  if (/\bmeta blue\b/.test(t)) return '#1877F2';
  if (/\bvodafone red\b/.test(t)) return '#E60000';
  if (/\bbinance yellow\b/.test(t)) return '#F0B90B';
  if (/\bmint(\s|-)/.test(t) || /acid-mint/.test(t)) return '#A6F3CC';
  if (/terracotta/.test(t)) return '#CC785C';
  if (/emerald/.test(t)) return '#10B981';
  if (/coral/.test(t)) return '#FF5A5F';
  if (/\bgold\b/.test(t)) return '#D4AF37';
  if (/\bcream\b/.test(t)) return '#F5F0E1';
  if (/cyan/.test(t)) return '#00D9FF';
  if (/\bneon green\b/.test(t)) return '#39FF14';
  if (/\bbright green\b/.test(t)) return '#00C853';
  if (/\bred\b/.test(t)) return '#E53935';
  if (/\bgreen\b/.test(t)) return '#22C55E';
  if (/\bpurple\b|ultraviolet/.test(t)) return '#7C3AED';
  if (/\borange\b/.test(t)) return '#F97316';
  if (/\byellow\b/.test(t)) return '#FACC15';
  if (/\bblue\b/.test(t)) return '#2563EB';
  if (/\bblack\b/.test(t)) return '#000000';
  if (/\bwhite\b/.test(t)) return '#FFFFFF';
  return null; // unknown — fetch from remote_url
}

// Heuristic primary font inference
function inferPrimaryFont(tagline) {
  const t = tagline.toLowerCase();
  if (/sf\s*pro/.test(t)) return 'SF Pro';
  if (/geist/.test(t)) return 'Geist';
  if (/futura/.test(t)) return 'Futura';
  if (/sodosans/.test(t)) return 'SoDoSans';
  if (/lambotype/.test(t)) return 'LamboType';
  if (/nouvelr/.test(t)) return 'NouvelR';
  if (/manuka/.test(t)) return 'Manuka';
  if (/universal\s*sans/.test(t)) return 'Universal Sans';
  if (/\bserif\b/.test(t)) return 'serif (custom)';
  if (/monospace/.test(t)) return 'monospace';
  return null;
}

// === README PARSER ======================================================
/**
 * Parses lines like:
 *   ### AI & LLM Platforms
 *   - [**Claude**](https://getdesign.md/claude/design-md) - Anthropic's AI assistant. Warm terracotta...
 */
function parseReadme(readmeContent) {
  const lines = readmeContent.split(/\r?\n/);
  const verticals = {};
  let currentVertical = null;

  const headerRe = /^###\s+(.+?)\s*$/;
  const brandRe = /^-\s*\[\*\*(.+?)\*\*\]\((https?:\/\/[^)]+)\)\s*[-—]\s*(.+)$/;

  for (const line of lines) {
    const h = headerRe.exec(line);
    if (h) {
      const verticalName = h[1].trim();
      const key = VERTICAL_KEY_MAP[verticalName];
      if (key) {
        currentVertical = key;
        if (!verticals[currentVertical]) {
          verticals[currentVertical] = {
            description: VERTICAL_DESCRIPTIONS[currentVertical] || verticalName,
            brands: []
          };
        }
      } else {
        currentVertical = null;
      }
      continue;
    }

    if (!currentVertical) continue;

    const b = brandRe.exec(line);
    if (b) {
      const name = b[1].trim();
      const url = b[2].trim();
      const tagline = b[3].trim();
      // Derive id from URL: getdesign.md/<id>/design-md
      const idMatch = /getdesign\.md\/([^/]+)\/design-md/.exec(url);
      const id = idMatch ? idMatch[1] : name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
      verticals[currentVertical].brands.push({
        id,
        name,
        tagline,
        remote_url: url
      });
    }
  }
  return verticals;
}

// === LOCAL CLONE INVENTORY ==============================================
function listClonedBrands() {
  if (!fs.existsSync(DESIGN_MD_DIR)) return new Set();
  return new Set(
    fs.readdirSync(DESIGN_MD_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
  );
}

// === YAML EMITTER (zero-dep, simple, deterministic) =====================
function yamlEscape(s) {
  if (s === null || s === undefined) return '~';
  if (typeof s === 'number' || typeof s === 'boolean') return String(s);
  const str = String(s);
  // Quote if contains special chars, leading/trailing whitespace, or YAML special tokens
  if (str === '' || /[:\-?{}\[\],&*#!|>'"%@`\n]/.test(str) || /^\s|\s$/.test(str) || /^(true|false|null|yes|no|~)$/i.test(str)) {
    return JSON.stringify(str);
  }
  return str;
}

function emitYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const out = [];
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const entries = Object.entries(item);
        if (entries.length === 0) {
          out.push(`${pad}- {}`);
          continue;
        }
        const [firstKey, firstVal] = entries[0];
        if (firstVal && typeof firstVal === 'object') {
          out.push(`${pad}-`);
          out.push(emitYaml(item, indent + 1));
        } else {
          out.push(`${pad}- ${firstKey}: ${yamlEscape(firstVal)}`);
          for (const [k, v] of entries.slice(1)) {
            if (Array.isArray(v)) {
              if (v.length === 0) {
                out.push(`${pad}  ${k}: []`);
              } else {
                out.push(`${pad}  ${k}:`);
                out.push(emitYaml(v, indent + 2));
              }
            } else if (v && typeof v === 'object') {
              out.push(`${pad}  ${k}:`);
              out.push(emitYaml(v, indent + 2));
            } else {
              out.push(`${pad}  ${k}: ${yamlEscape(v)}`);
            }
          }
        }
      } else if (Array.isArray(item)) {
        out.push(`${pad}-`);
        out.push(emitYaml(item, indent + 1));
      } else {
        out.push(`${pad}- ${yamlEscape(item)}`);
      }
    }
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        if (v.length === 0) {
          out.push(`${pad}${k}: []`);
        } else {
          out.push(`${pad}${k}:`);
          out.push(emitYaml(v, indent + 1));
        }
      } else if (v && typeof v === 'object') {
        out.push(`${pad}${k}:`);
        out.push(emitYaml(v, indent + 1));
      } else {
        out.push(`${pad}${k}: ${yamlEscape(v)}`);
      }
    }
  } else {
    out.push(`${pad}${yamlEscape(obj)}`);
  }
  return out.join('\n');
}

// === MAIN ===============================================================
function main() {
  if (!fs.existsSync(README_PATH)) {
    console.error(`README not found at ${README_PATH}`);
    process.exit(1);
  }
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const verticals = parseReadme(readme);
  const cloned = listClonedBrands();

  let totalBrands = 0;
  let parseFailures = [];

  // Enrich each brand
  for (const [verticalKey, vertical] of Object.entries(verticals)) {
    const enrichedBrands = [];
    for (const b of vertical.brands) {
      try {
        const tier = classifyTier(b.id);
        const primary_color = inferPrimaryColor(b.tagline);
        const primary_font = inferPrimaryFont(b.tagline);
        const keywords = inferKeywords(b.name, b.tagline);
        const localPath = cloned.has(b.id)
          ? `design-md-library/design-md/${b.id}/`
          : null;

        enrichedBrands.push({
          id: b.id,
          name: b.name,
          path: localPath,           // null if not in local clone
          remote_url: b.remote_url,
          primary_color,
          primary_font,
          tier,
          tagline: b.tagline,
          keywords
        });
        totalBrands++;
      } catch (err) {
        parseFailures.push({ id: b.id, error: err.message });
      }
    }
    vertical.brands = enrichedBrands;
  }

  const index = {
    version: 1,
    generated_at: new Date().toISOString(),
    upstream: {
      repo: 'VoltAgent/awesome-design-md',
      url: 'https://github.com/VoltAgent/awesome-design-md',
      cloned_to: 'design-md-library/'
    },
    spec_reference: {
      package: '@google/design.md',
      version: '0.1.1',
      spec_file: '.aios-core/development/data/design-md-spec.md',
      cli: 'npx @google/design.md (lint|diff|export|spec)'
    },
    notes: [
      'Upstream repo migrated DESIGN.md content off-repo to https://getdesign.md/{id}/design-md.',
      'Brand entries with non-null path have a stub README in the local clone; full DESIGN.md must be fetched from remote_url.',
      'primary_color and primary_font are heuristic inferences from taglines, not authoritative. For exact tokens fetch remote_url.'
    ],
    total_brands: totalBrands,
    locally_cloned: cloned.size,
    parse_failures: parseFailures,
    verticals
  };

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const yaml = emitYaml(index);
  fs.writeFileSync(OUTPUT_PATH, yaml + '\n', 'utf8');

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Verticals: ${Object.keys(verticals).length}`);
  console.log(`Total brands indexed: ${totalBrands}`);
  console.log(`Locally cloned brand folders: ${cloned.size}`);
  if (parseFailures.length) {
    console.log(`Parse failures: ${parseFailures.length}`);
    for (const f of parseFailures) console.log(`  - ${f.id}: ${f.error}`);
  }
}

main();
