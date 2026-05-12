#!/usr/bin/env node
// =============================================================================
// Tool Search Validation Script
// =============================================================================
// Validates that tool-registry.yaml keywords align with expected tool search
// queries. This is a static validation — actual Tool Search latency and accuracy
// are measured during interactive Claude Code sessions.
//
// Story: TOK-2 (AC: 5, 6, 7)
// =============================================================================

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, 'tool-registry.yaml');

// Test queries that should find specific tools (AC 7: 5+ test queries)
const TEST_QUERIES = [
  { query: 'search the web for information', expectedTool: 'exa', category: 'web-search' },
  { query: 'browser screenshot automation', expectedTool: 'playwright', category: 'browser-automation' },
  { query: 'scrape social media data', expectedTool: 'apify', category: 'web-scraping' },
  { query: 'analyze code dependencies', expectedTool: 'code-graph', category: 'code-intelligence' },
  { query: 'code analysis intelligence', expectedTool: 'nogic', category: 'code-intelligence' },
  { query: 'look up library documentation', expectedTool: 'context7', category: 'documentation' },
  { query: 'database query optimization', expectedTool: 'supabase', category: 'database' }
];

function parseKeywords(content) {
  // Extract tool name → keywords mapping from YAML
  const tools = {};
  let currentTool = null;
  let inKeywords = false;

  for (const line of content.split('\n')) {
    // Tool name (indented 2 spaces)
    const toolMatch = line.match(/^ {2}([a-zA-Z0-9_-]+):$/);
    if (toolMatch) {
      currentTool = toolMatch[1];
      tools[currentTool] = { keywords: [], category: null, tier: null, essential: null };
      inKeywords = false;
      continue;
    }

    if (!currentTool) continue;

    // Category
    const catMatch = line.match(/^\s+category:\s*(.+)/);
    if (catMatch) {
      tools[currentTool].category = catMatch[1].trim();
      continue;
    }

    // Tier
    const tierMatch = line.match(/^\s+tier:\s*(\d)/);
    if (tierMatch) {
      tools[currentTool].tier = parseInt(tierMatch[1]);
      continue;
    }

    // Essential
    const essentialMatch = line.match(/^\s+essential:\s*(true|false)/);
    if (essentialMatch) {
      tools[currentTool].essential = essentialMatch[1] === 'true';
      continue;
    }

    // Keywords section
    if (line.match(/^\s+keywords:/)) {
      inKeywords = true;
      continue;
    }

    // Keyword item
    if (inKeywords) {
      const kwMatch = line.match(/^\s+- (.+)/);
      if (kwMatch) {
        tools[currentTool].keywords.push(kwMatch[1].trim());
      } else if (!line.match(/^\s*$/)) {
        inKeywords = false;
      }
    }
  }

  return tools;
}

function matchQuery(query, tool) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const keywords = tool.keywords.map(k => k.toLowerCase());
  const category = (tool.category || '').toLowerCase();

  let score = 0;
  for (const word of queryWords) {
    for (const keyword of keywords) {
      if (keyword.includes(word) || word.includes(keyword)) {
        score++;
      }
    }
    if (category.includes(word)) {
      score++;
    }
  }

  return score;
}

function validate() {
  const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const tools = parseKeywords(content);

  console.log('=== Tool Search Validation ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of TEST_QUERIES) {
    const scores = {};
    for (const [name, tool] of Object.entries(tools)) {
      if (tool.keywords.length > 0 || tool.category) {
        scores[name] = matchQuery(test.query, tool);
      }
    }

    // Sort by score descending
    const ranked = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    const top3 = ranked.slice(0, 3).map(([name]) => name);
    const found = top3.includes(test.expectedTool);

    if (found) {
      console.log(`✅ "${test.query}" → found '${test.expectedTool}' in top-3 [${top3.join(', ')}]`);
      passed++;
    } else {
      console.log(`❌ "${test.query}" → expected '${test.expectedTool}' but got [${top3.join(', ')}]`);
      failed++;
    }
  }

  console.log(`\n--- Results: ${passed}/${TEST_QUERIES.length} passed, ${failed} failed ---`);

  // Essential server validation
  console.log('\n=== Essential Server Validation ===\n');
  const tier3Tools = Object.entries(tools).filter(([, t]) => t.tier === 3);
  const essential = tier3Tools.filter(([, t]) => t.essential === true);
  const nonEssential = tier3Tools.filter(([, t]) => t.essential === false);

  console.log(`Tier 3 tools: ${tier3Tools.length}`);
  console.log(`  Essential (never disable): ${essential.map(([n]) => n).join(', ')}`);
  console.log(`  Non-essential (can disable): ${nonEssential.map(([n]) => n).join(', ')}`);

  if (essential.length === 0) {
    console.log('⚠️  WARNING: No essential Tier 3 servers defined');
  }

  // 2-search-per-turn validation (AC 6)
  console.log('\n=== Search Limit Guidance ===\n');
  console.log('AC 6: Maximum 2 tool searches per turn');
  console.log('Implementation: CLAUDE.md guidance section (not programmatic hard limit)');
  console.log('Rationale: Claude Code manages Tool Search internally; guidance limits excessive use');

  const allPassed = failed === 0;
  console.log(`\n${allPassed ? '✅' : '❌'} Overall: ${allPassed ? 'PASS' : 'FAIL'}`);

  return allPassed;
}

if (require.main === module) {
  const result = validate();
  process.exit(result ? 0 : 1);
}

module.exports = { validate };
