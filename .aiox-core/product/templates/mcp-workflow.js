/**
 * MCP Workflow Template
 * Synkra AIOX Framework
 * Version: 1.0.0
 *
 * This template demonstrates how to create Code Mode workflows
 * that execute in the Docker MCP sandbox for maximum token efficiency.
 *
 * Benefits of Code Mode:
 * - ~98.7% token reduction (processing happens in sandbox)
 * - Multi-MCP orchestration in single workflow
 * - Only final results return to LLM context
 * - Full JavaScript runtime available
 *
 * Usage:
 *   1. Copy this template to scripts/mcp-workflows/
 *   2. Customize the workflow function
 *   3. Run via: docker mcp exec ./workflow.js
 *   4. Or use *mcp-workflow task to generate
 *
 * Template Variables:
 *   {{WORKFLOW_NAME}} - Name of the workflow
 *   {{WORKFLOW_DESCRIPTION}} - Description
 *   {{INPUT_PARAMS}} - Input parameters
 *   {{OUTPUT_FORMAT}} - Output format specification
 */

'use strict';

// ============================================
// WORKFLOW METADATA
// ============================================

const WORKFLOW_META = {
  name: '{{WORKFLOW_NAME:-example-workflow}}',
  version: '1.0.0',
  description: '{{WORKFLOW_DESCRIPTION:-Example MCP workflow template}}',
  author: 'AIOX Framework',
  mcps_required: ['fs', 'fetch'], // MCPs used by this workflow
  estimated_duration: '10-30 seconds',
  token_savings: '~98.7%',
};

// ============================================
// MCP CLIENT INTERFACE
// ============================================

/**
 * MCP client interface (provided by Docker MCP runtime)
 * Available when running via: docker mcp exec
 */
const mcp = globalThis.mcp || {
  // Filesystem operations
  fs: {
    readFile: async (path) => { /* implementation provided by runtime */ },
    writeFile: async (path, content) => { /* implementation provided by runtime */ },
    listDirectory: async (path) => { /* implementation provided by runtime */ },
    exists: async (path) => { /* implementation provided by runtime */ },
  },
  // HTTP fetch operations
  fetch: {
    get: async (url, options) => { /* implementation provided by runtime */ },
    post: async (url, body, options) => { /* implementation provided by runtime */ },
  },
  // GitHub operations (if enabled)
  github: {
    getRepo: async (owner, repo) => { /* implementation provided by runtime */ },
    createIssue: async (owner, repo, title, body) => { /* implementation provided by runtime */ },
    listPRs: async (owner, repo, state) => { /* implementation provided by runtime */ },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract main content from HTML
 * Runs locally in sandbox (no tokens used)
 */
function extractMainContent(html) {
  // Simple extraction - customize for your needs
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return html;

  let content = bodyMatch[1];

  // Remove scripts and styles
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<[^>]+>/g, ' ');
  content = content.replace(/\s+/g, ' ').trim();

  return content;
}

/**
 * Summarize text to max words
 * Runs locally in sandbox (no tokens used)
 */
function summarize(text, maxWords = 500) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Simple keyword-based classification
 * For more advanced classification, use an LLM MCP
 */
function classifyContent(text, categories) {
  const lowerText = text.toLowerCase();
  const scores = {};

  // Simple keyword matching (customize for your use case)
  const keywords = {
    Technology: ['software', 'code', 'api', 'developer', 'programming', 'tech'],
    Business: ['revenue', 'market', 'customer', 'growth', 'sales', 'business'],
    Research: ['study', 'research', 'analysis', 'data', 'findings', 'report'],
    Other: [],
  };

  for (const category of categories) {
    scores[category] = 0;
    const categoryKeywords = keywords[category] || [];
    for (const keyword of categoryKeywords) {
      if (lowerText.includes(keyword)) {
        scores[category]++;
      }
    }
  }

  // Return category with highest score
  let maxScore = 0;
  let result = categories[categories.length - 1]; // Default to last (usually 'Other')

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      result = category;
    }
  }

  return result;
}

// ============================================
// MAIN WORKFLOW FUNCTION
// ============================================

/**
 * Main workflow: Scrape → Process → Classify → Output
 *
 * This workflow demonstrates:
 * 1. Using fetch MCP to get web content
 * 2. Processing content locally (no tokens)
 * 3. Classifying content with simple logic
 * 4. Using fs MCP to save results
 *
 * @param {Object} params - Workflow parameters
 * @param {string} params.url - URL to scrape
 * @param {string} params.outputPath - Path to save results
 * @param {string[]} params.categories - Classification categories
 * @returns {Object} Workflow result (only this returns to LLM context)
 */
async function runWorkflow(params) {
  const {
    url = 'https://example.com',
    outputPath = '/workspace/output.json',
    categories = ['Technology', 'Business', 'Research', 'Other'],
  } = params;

  const startTime = Date.now();

  try {
    // Step 1: Fetch content (uses fetch MCP)
    console.log(`[1/4] Fetching content from: ${url}`);
    const response = await mcp.fetch.get(url);
    const html = response.body || response.text || '';

    // Step 2: Extract and process (local, no tokens)
    console.log('[2/4] Extracting main content...');
    const content = extractMainContent(html);
    const summary = summarize(content, 500);

    // Step 3: Classify (local, no tokens)
    console.log('[3/4] Classifying content...');
    const category = classifyContent(summary, categories);

    // Step 4: Save results (uses fs MCP)
    console.log(`[4/4] Saving results to: ${outputPath}`);
    const result = {
      url,
      title: extractTitle(html),
      category,
      summary,
      wordCount: summary.split(/\s+/).length,
      timestamp: new Date().toISOString(),
      processingTime: `${Date.now() - startTime}ms`,
    };

    await mcp.fs.writeFile(outputPath, JSON.stringify(result, null, 2));

    // Return ONLY final result to LLM context
    // All processing happened in sandbox = ~98.7% token savings
    return {
      success: true,
      result: {
        url,
        category,
        wordCount: result.wordCount,
        outputPath,
        processingTime: result.processingTime,
      },
      tokensUsed: 0, // Processing was in sandbox
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      url,
      processingTime: `${Date.now() - startTime}ms`,
    };
  }
}

/**
 * Extract title from HTML
 */
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

// ============================================
// WORKFLOW EXECUTION
// ============================================

// Entry point when run via: docker mcp exec
if (typeof module !== 'undefined' && !module.parent) {
  // Parse command line arguments or use defaults
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    params[key] = value;
  }

  runWorkflow(params)
    .then((result) => {
      console.log('\n=== Workflow Complete ===');
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Workflow failed:', error);
      process.exit(1);
    });
}

// Export for testing and module use
module.exports = {
  runWorkflow,
  extractMainContent,
  summarize,
  classifyContent,
  WORKFLOW_META,
};
