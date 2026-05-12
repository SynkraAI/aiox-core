#!/usr/bin/env node
/**
 * DeepSeek Usage Tracker Proxy
 *
 * A lightweight HTTP proxy that tracks API usage per alias (e.g., "claude-free").
 * Intercepts requests to DeepSeek API and logs token usage to local JSON file.
 *
 * @module usage-tracker
 * @location .aiox-core/infrastructure/scripts/llm-routing/usage-tracker/
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

// Configuration
const DEFAULT_PORT = 8787;
const DEEPSEEK_HOST = 'api.deepseek.com';
const DATA_DIR = path.join(os.homedir(), '.aiox', 'usage-tracking');
const USAGE_FILE = path.join(DATA_DIR, 'deepseek-usage.json');

// Pricing per million tokens (as of Dec 2025)
const PRICING = {
  'deepseek-chat': {
    input: 0.07,   // $0.07 per 1M input tokens
    output: 0.14,  // $0.14 per 1M output tokens
    cached: 0.014  // $0.014 per 1M cached tokens
  },
  'deepseek-reasoner': {
    input: 0.55,   // $0.55 per 1M input tokens
    output: 2.19,  // $2.19 per 1M output tokens
    cached: 0.14   // $0.14 per 1M cached tokens
  }
};

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load existing usage data
 * @returns {Object} Usage data
 */
function loadUsageData() {
  ensureDataDir();

  if (fs.existsSync(USAGE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    } catch (error) {
      console.error('Error loading usage data:', error.message);
    }
  }

  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    aliases: {},
    totalRequests: 0,
    totalTokens: { input: 0, output: 0, cached: 0 },
    totalCost: 0
  };
}

/**
 * Save usage data
 * @param {Object} data - Usage data to save
 */
function saveUsageData(data) {
  ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
}

/**
 * Calculate cost for token usage
 * @param {string} model - Model name
 * @param {Object} usage - Token usage object
 * @returns {number} Cost in USD
 */
function calculateCost(model, usage) {
  const pricing = PRICING[model] || PRICING['deepseek-chat'];

  const inputCost = (usage.prompt_tokens || 0) / 1_000_000 * pricing.input;
  const outputCost = (usage.completion_tokens || 0) / 1_000_000 * pricing.output;
  const cachedCost = (usage.prompt_cache_hit_tokens || 0) / 1_000_000 * pricing.cached;

  return inputCost + outputCost + cachedCost;
}

/**
 * Record usage for an alias
 * @param {string} alias - API key alias (e.g., "claude-free")
 * @param {Object} request - Request data
 * @param {Object} response - Response data with usage
 */
function recordUsage(alias, request, response) {
  const data = loadUsageData();

  // Initialize alias if not exists
  if (!data.aliases[alias]) {
    data.aliases[alias] = {
      created: new Date().toISOString(),
      requests: 0,
      tokens: { input: 0, output: 0, cached: 0 },
      cost: 0,
      byModel: {},
      byDay: {}
    };
  }

  const aliasData = data.aliases[alias];
  const usage = response.usage || {};
  const model = request.model || 'deepseek-chat';
  const today = new Date().toISOString().split('T')[0];
  const cost = calculateCost(model, usage);

  // Update alias totals
  aliasData.requests++;
  aliasData.tokens.input += usage.prompt_tokens || 0;
  aliasData.tokens.output += usage.completion_tokens || 0;
  aliasData.tokens.cached += usage.prompt_cache_hit_tokens || 0;
  aliasData.cost += cost;

  // Update by model
  if (!aliasData.byModel[model]) {
    aliasData.byModel[model] = { requests: 0, tokens: { input: 0, output: 0 }, cost: 0 };
  }
  aliasData.byModel[model].requests++;
  aliasData.byModel[model].tokens.input += usage.prompt_tokens || 0;
  aliasData.byModel[model].tokens.output += usage.completion_tokens || 0;
  aliasData.byModel[model].cost += cost;

  // Update by day
  if (!aliasData.byDay[today]) {
    aliasData.byDay[today] = { requests: 0, tokens: { input: 0, output: 0 }, cost: 0 };
  }
  aliasData.byDay[today].requests++;
  aliasData.byDay[today].tokens.input += usage.prompt_tokens || 0;
  aliasData.byDay[today].tokens.output += usage.completion_tokens || 0;
  aliasData.byDay[today].cost += cost;

  // Update global totals
  data.totalRequests++;
  data.totalTokens.input += usage.prompt_tokens || 0;
  data.totalTokens.output += usage.completion_tokens || 0;
  data.totalTokens.cached += usage.prompt_cache_hit_tokens || 0;
  data.totalCost += cost;

  saveUsageData(data);

  // Log to console
  console.log(`[${alias}] ${model}: ${usage.prompt_tokens || 0} in / ${usage.completion_tokens || 0} out = $${cost.toFixed(6)}`);
}

/**
 * Proxy request to DeepSeek API
 * @param {Object} req - Incoming request
 * @param {Object} res - Outgoing response
 * @param {string} alias - API key alias
 */
function proxyRequest(req, res, alias) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    let requestData = {};
    try {
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (e) {
      // Not JSON, continue anyway
    }

    // Build proxy request options
    const targetPath = req.url.replace(/^\/anthropic/, '');
    const options = {
      hostname: DEEPSEEK_HOST,
      port: 443,
      path: '/anthropic' + targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: DEEPSEEK_HOST
      }
    };

    // Remove problematic headers
    delete options.headers['content-length'];
    if (body) {
      options.headers['content-length'] = Buffer.byteLength(body);
    }

    const proxyReq = https.request(options, (proxyRes) => {
      let responseBody = '';

      proxyRes.on('data', chunk => {
        responseBody += chunk.toString();
        res.write(chunk);
      });

      proxyRes.on('end', () => {
        res.end();

        // Try to parse response and record usage
        try {
          const responseData = JSON.parse(responseBody);
          if (responseData.usage) {
            recordUsage(alias, requestData, responseData);
          }
        } catch (e) {
          // Response might be streaming or non-JSON
        }
      });

      // Copy response headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
    });

    proxyReq.on('error', (error) => {
      console.error('Proxy error:', error.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'Proxy error', message: error.message }));
    });

    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

/**
 * Handle streaming responses (SSE)
 * @param {Object} req - Incoming request
 * @param {Object} res - Outgoing response
 * @param {string} alias - API key alias
 */
function proxyStreamingRequest(req, res, alias) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    let requestData = {};
    try {
      if (body) {
        requestData = JSON.parse(body);
      }
    } catch (e) {
      // Not JSON
    }

    const targetPath = req.url.replace(/^\/anthropic/, '');
    const options = {
      hostname: DEEPSEEK_HOST,
      port: 443,
      path: '/anthropic' + targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: DEEPSEEK_HOST
      }
    };

    delete options.headers['content-length'];
    if (body) {
      options.headers['content-length'] = Buffer.byteLength(body);
    }

    const proxyReq = https.request(options, (proxyRes) => {
      // Set headers for SSE
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        'cache-control': 'no-cache',
        'connection': 'keep-alive'
      });

      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      proxyRes.on('data', chunk => {
        res.write(chunk);

        // Try to extract usage from SSE events
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.usage) {
                totalInputTokens = data.usage.input_tokens || data.usage.prompt_tokens || totalInputTokens;
                totalOutputTokens = data.usage.output_tokens || data.usage.completion_tokens || totalOutputTokens;
              }
            } catch (e) {
              // Not valid JSON
            }
          }
        }
      });

      proxyRes.on('end', () => {
        res.end();

        // Record final usage if we captured any
        if (totalInputTokens > 0 || totalOutputTokens > 0) {
          recordUsage(alias, requestData, {
            usage: {
              prompt_tokens: totalInputTokens,
              completion_tokens: totalOutputTokens
            }
          });
        }
      });
    });

    proxyReq.on('error', (error) => {
      console.error('Proxy error:', error.message);
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'Proxy error', message: error.message }));
    });

    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });
}

/**
 * Start the proxy server
 * @param {Object} options - Server options
 */
function startServer(options = {}) {
  const port = options.port || DEFAULT_PORT;
  const alias = options.alias || 'default';

  const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', alias }));
      return;
    }

    // Usage stats endpoint
    if (req.url === '/usage') {
      const data = loadUsageData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
      return;
    }

    // Usage stats for specific alias
    if (req.url.startsWith('/usage/')) {
      const requestedAlias = req.url.slice(7);
      const data = loadUsageData();
      const aliasData = data.aliases[requestedAlias];

      if (aliasData) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ alias: requestedAlias, ...aliasData }, null, 2));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Alias not found' }));
      }
      return;
    }

    // Check if streaming request
    const isStreaming = req.headers['accept']?.includes('text/event-stream') ||
                        req.url.includes('stream=true');

    if (isStreaming) {
      proxyStreamingRequest(req, res, alias);
    } else {
      proxyRequest(req, res, alias);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         DeepSeek Usage Tracker Proxy v1.0.0                ║
╠════════════════════════════════════════════════════════════╣
║  Proxy URL:    http://127.0.0.1:${port}/anthropic              ║
║  Alias:        ${alias.padEnd(43)}║
║  Data File:    ~/.aiox/usage-tracking/deepseek-usage.json  ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    /health     - Health check                              ║
║    /usage      - All usage stats                           ║
║    /usage/{alias} - Usage for specific alias               ║
╚════════════════════════════════════════════════════════════╝
`);
  });

  return server;
}

/**
 * Get usage summary for CLI display
 * @param {string} alias - Optional alias to filter by
 * @returns {string} Formatted summary
 */
function getUsageSummary(alias = null) {
  const data = loadUsageData();
  const lines = [];

  lines.push('');
  lines.push('═'.repeat(60));
  lines.push('  DeepSeek API Usage Summary');
  lines.push('═'.repeat(60));
  lines.push('');

  if (alias && data.aliases[alias]) {
    const a = data.aliases[alias];
    lines.push(`  Alias: ${alias}`);
    lines.push(`  ─${'─'.repeat(56)}`);
    lines.push(`  Requests:      ${a.requests.toLocaleString()}`);
    lines.push(`  Input Tokens:  ${a.tokens.input.toLocaleString()}`);
    lines.push(`  Output Tokens: ${a.tokens.output.toLocaleString()}`);
    lines.push(`  Total Cost:    $${a.cost.toFixed(4)}`);
    lines.push('');

    if (Object.keys(a.byModel).length > 0) {
      lines.push('  By Model:');
      for (const [model, stats] of Object.entries(a.byModel)) {
        lines.push(`    ${model}: ${stats.requests} req, $${stats.cost.toFixed(4)}`);
      }
      lines.push('');
    }

    // Show last 7 days
    const days = Object.keys(a.byDay).sort().slice(-7);
    if (days.length > 0) {
      lines.push('  Last 7 Days:');
      for (const day of days) {
        const d = a.byDay[day];
        lines.push(`    ${day}: ${d.requests} req, $${d.cost.toFixed(4)}`);
      }
    }
  } else {
    lines.push(`  Total Requests: ${data.totalRequests.toLocaleString()}`);
    lines.push(`  Total Tokens:   ${(data.totalTokens.input + data.totalTokens.output).toLocaleString()}`);
    lines.push(`  Total Cost:     $${data.totalCost.toFixed(4)}`);
    lines.push('');
    lines.push('  By Alias:');
    lines.push(`  ${'─'.repeat(56)}`);

    for (const [name, a] of Object.entries(data.aliases)) {
      lines.push(`  ${name.padEnd(20)} ${a.requests.toString().padStart(8)} req  $${a.cost.toFixed(4)}`);
    }
  }

  lines.push('');
  lines.push('═'.repeat(60));
  lines.push(`  Data: ${USAGE_FILE}`);
  lines.push(`  Updated: ${data.lastUpdated || 'Never'}`);
  lines.push('═'.repeat(60));
  lines.push('');

  return lines.join('\n');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
    case 'serve': {
      const port = parseInt(args.find(a => a.startsWith('--port='))?.split('=')[1]) || DEFAULT_PORT;
      const alias = args.find(a => a.startsWith('--alias='))?.split('=')[1] || 'claude-free';
      startServer({ port, alias });
      break;
    }

    case 'usage':
    case 'stats': {
      const alias = args[1];
      console.log(getUsageSummary(alias));
      break;
    }

    case 'reset': {
      if (fs.existsSync(USAGE_FILE)) {
        const backup = USAGE_FILE + '.backup.' + Date.now();
        fs.copyFileSync(USAGE_FILE, backup);
        fs.unlinkSync(USAGE_FILE);
        console.log(`Usage data reset. Backup: ${backup}`);
      } else {
        console.log('No usage data to reset.');
      }
      break;
    }

    case 'export': {
      const data = loadUsageData();
      const exportFile = args[1] || `deepseek-usage-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(exportFile, JSON.stringify(data, null, 2));
      console.log(`Usage data exported to: ${exportFile}`);
      break;
    }

    default:
      console.log(`
DeepSeek Usage Tracker

Commands:
  start [--port=8787] [--alias=claude-free]  Start proxy server
  usage [alias]                               Show usage statistics
  reset                                       Reset usage data (with backup)
  export [filename]                           Export usage data to JSON

Examples:
  node index.js start --alias=claude-free
  node index.js usage claude-free
  node index.js export
`);
  }
}

module.exports = {
  startServer,
  loadUsageData,
  saveUsageData,
  recordUsage,
  getUsageSummary,
  calculateCost,
  PRICING,
  DATA_DIR,
  USAGE_FILE
};
