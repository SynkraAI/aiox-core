#!/usr/bin/env node

/**
 * MCP Tools E2E Test
 *
 * Tests all 8 design system MCP tools with real data.
 * Run from repo root: node squads/design/scripts/design-system/test_mcp_tools.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Inline loader — mirrors server.ts logic without requiring tsx/esm
// ---------------------------------------------------------------------------

function readJson(relPath) {
  const full = path.join(ROOT, relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

const components = readJson('workspace/domains/design-system/metadata/components.json');
const registry = readJson('workspace/ui/registry.json');
const tokenRegistry = readJson('workspace/domains/design-system/metadata/tokens/index.json');
const guidelines = readJson('workspace/domains/design-system/metadata/guidelines/usage.json');

// ---------------------------------------------------------------------------
// Handler implementations (pure-JS mirrors of the TS handlers)
// ---------------------------------------------------------------------------

function listComponents() {
  return components.components.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    owner: c.agent_owner,
  }));
}

function getComponentById(id) {
  return components.components.find((c) => c.id === id) || null;
}

function searchComponents(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return components.components.filter((c) => {
    const haystack = [c.id, c.name, c.agent_owner, ...c.variants, ...c.tokens, ...c.a11y.wcag]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

function getA11yRequirements(id) {
  const c = getComponentById(id);
  return c ? c.a11y : null;
}

function getRegistryItem(name) {
  return (registry.items || []).find((i) => i.name === name) || null;
}

function getTokensByCategory(category) {
  return tokenRegistry.tokens.filter((t) => t.category === category.trim().toLowerCase());
}

function getTokensByTier(tier) {
  return tokenRegistry.tokens.filter((t) => t.tier === tier.trim().toLowerCase());
}

function listTokens() {
  return {
    tokens: tokenRegistry.tokens.map((t) => ({
      name: t.name,
      cssVariable: t.cssVariable,
      category: t.category,
      tier: t.tier,
    })),
    integrity: tokenRegistry.integrity,
  };
}

function getGuidelineForComponent(componentId) {
  return guidelines.guidelines.find((g) => g.component === componentId) || null;
}

function suggestComponent(useCase) {
  const normalized = useCase.trim().toLowerCase();
  if (!normalized) return [];
  const results = [];
  for (const g of guidelines.guidelines) {
    const reasons = [];
    let score = 0;
    for (const w of g.when_to_use) {
      if (w.toLowerCase().includes(normalized)) {
        score += 3;
        reasons.push('when_to_use: ' + w);
      }
    }
    const comp = components.components.find((c) => c.id === g.component);
    if (comp) {
      const name = comp.name.toLowerCase();
      if (name.includes(normalized) || normalized.includes(name)) {
        score += 2;
        reasons.push('name match: ' + comp.name);
      }
    }
    for (const wn of g.when_not_to_use) {
      if (wn.toLowerCase().includes(normalized)) {
        score -= 1;
        reasons.push('when_not_to_use: ' + wn);
      }
    }
    if (score > 0) results.push({ component: g.component, score, reasons });
  }
  return results.sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Tool dispatch (same switch as server.ts)
// ---------------------------------------------------------------------------

function callTool(name, args) {
  switch (name) {
    case 'design_system.list_components':
      return listComponents();
    case 'design_system.get_component':
      return getComponentById(String(args.id || ''));
    case 'design_system.search_components':
      return searchComponents(String(args.query || ''));
    case 'design_system.get_a11y_requirements':
      return getA11yRequirements(String(args.id || ''));
    case 'design_system.get_registry_entry':
      return getRegistryItem(String(args.name || ''));
    case 'design_system.get_tokens': {
      const category = args.category;
      const tier = args.tier;
      if (category && tier) {
        return getTokensByCategory(category).filter((t) => t.tier === tier.trim().toLowerCase());
      }
      if (category) return getTokensByCategory(category);
      if (tier) return getTokensByTier(tier);
      return listTokens();
    }
    case 'design_system.get_guidelines':
      return getGuidelineForComponent(String(args.component || ''));
    case 'design_system.suggest_component':
      return suggestComponent(String(args.use_case || ''));
    default:
      throw new Error('Unknown tool: ' + name);
  }
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------

const tests = [
  {
    tool: 'design_system.list_components',
    args: {},
    validate: (r) => Array.isArray(r) && r.length >= 5 && r[0].id === 'button',
  },
  {
    tool: 'design_system.get_component',
    args: { id: 'button' },
    validate: (r) => r !== null && r.id === 'button' && Array.isArray(r.variants),
  },
  {
    tool: 'design_system.search_components',
    args: { query: 'brad-frost' },
    validate: (r) => Array.isArray(r) && r.length > 0,
  },
  {
    tool: 'design_system.get_a11y_requirements',
    args: { id: 'input' },
    validate: (r) => r !== null && r.role === 'textbox' && r.wcag.length > 0,
  },
  {
    tool: 'design_system.get_registry_entry',
    args: { name: 'button' },
    validate: (r) => r !== null && r.name === 'button',
  },
  {
    tool: 'design_system.get_tokens',
    args: { category: 'color' },
    validate: (r) => Array.isArray(r) && r.length >= 20 && r.every((t) => t.category === 'color'),
  },
  {
    tool: 'design_system.get_guidelines',
    args: { component: 'button' },
    validate: (r) => r !== null && Array.isArray(r.when_to_use) && r.when_to_use.length > 0,
  },
  {
    tool: 'design_system.suggest_component',
    args: { use_case: 'form' },
    validate: (r) => Array.isArray(r) && r.length > 0 && r[0].score > 0,
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

for (const t of tests) {
  try {
    const result = callTool(t.tool, t.args);
    if (t.validate(result)) {
      console.log(`PASS: ${t.tool}`);
      passed++;
    } else {
      console.error(`FAIL: ${t.tool} — validation failed`);
      console.error('  Result:', JSON.stringify(result).slice(0, 200));
      failed++;
    }
  } catch (err) {
    console.error(`FAIL: ${t.tool} — ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed}/${passed + failed} tools passed`);

if (failed > 0) {
  process.exit(1);
}
