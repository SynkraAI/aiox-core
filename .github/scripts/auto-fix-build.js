#!/usr/bin/env node

/**
 * Auto-Fix Build Failures via Claude API
 * Runs on build failure, calls Claude to diagnose and fix
 */

const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const MODEL = 'claude-opus-4-6';

async function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'content-length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response.content[0].text);
        } catch (e) {
          reject(new Error(`Failed to parse Claude response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getBuildErrors() {
  try {
    console.log('[Auto-Fix] Getting build errors...');
    const result = execSync('npm ci && cd packages/aios-lovable-mcp && npm run build 2>&1', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return null; // Build succeeded
  } catch (error) {
    return error.stdout + error.stderr;
  }
}

function getProjectContext() {
  const dockerfile = fs.readFileSync('Dockerfile', 'utf-8');
  const packageJson = JSON.parse(fs.readFileSync('packages/aios-lovable-mcp/package.json', 'utf-8'));

  return {
    dockerfile: dockerfile.substring(0, 1000),
    packageJson,
    nodeVersion: packageJson.engines?.node || 'not specified'
  };
}

async function main() {
  console.log('[Auto-Fix] Starting build error diagnosis...');

  const buildError = getBuildErrors();
  if (!buildError) {
    console.log('[Auto-Fix] ✅ Build succeeded - no fixes needed');
    process.exit(0);
  }

  console.log('[Auto-Fix] ❌ Build failed - calling Claude...');

  const context = getProjectContext();

  const prompt = `You are a Node.js/TypeScript expert helping fix a build failure in AIOS (AI-Orchestrated System).

PROJECT CONTEXT:
- Project: aios-lovable-mcp (MCP server for Lovable integration)
- Language: TypeScript
- Runtime: Node.js ${context.nodeVersion}
- Framework: @modelcontextprotocol/sdk

DOCKERFILE (first 1000 chars):
\`\`\`
${context.dockerfile}
\`\`\`

BUILD ERROR:
\`\`\`
${buildError.substring(0, 2000)}
\`\`\`

Please:
1. Identify the root cause of the build failure
2. Suggest the specific fix(es) needed
3. Return ONLY the file changes in this exact format:

FILE: path/to/file
\`\`\`
<new file content>
\`\`\`

Be concise and focus on the minimum necessary changes to fix the build.`;

  try {
    const suggestion = await callClaude(prompt);
    console.log('\n[Auto-Fix] Claude suggestion:');
    console.log(suggestion);

    // Parse and apply fixes
    const files = suggestion.match(/FILE: (.+?)\n\`\`\`\n([\s\S]+?)\n\`\`\`/g) || [];

    if (files.length === 0) {
      console.log('[Auto-Fix] No files to fix - manual review needed');
      process.exit(1);
    }

    for (const fileMatch of files) {
      const match = fileMatch.match(/FILE: (.+?)\n\`\`\`\n([\s\S]+?)\n\`\`\`/);
      if (match) {
        const filePath = match[1].trim();
        const content = match[2];

        console.log(`[Auto-Fix] Fixing ${filePath}...`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
      }
    }

    // Test if fixes work
    console.log('[Auto-Fix] Testing fixes...');
    try {
      execSync('npm ci && cd packages/aios-lovable-mcp && npm run build', { stdio: 'inherit' });
      console.log('[Auto-Fix] ✅ Build successful after fixes!');

      // Commit and push
      execSync('git config --global user.name "Claude Auto-Fix"');
      execSync('git config --global user.email "claude@railway.app"');
      execSync('git add -A');
      execSync('git commit -m "fix: auto-fixed build failure via Claude [skip ci]"');
      console.log('[Auto-Fix] ✅ Changes committed');
    } catch (testError) {
      console.error('[Auto-Fix] ❌ Fixes did not resolve the issue');
      console.error(testError.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('[Auto-Fix] ❌ Claude API error:', error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[Auto-Fix] Fatal error:', err);
  process.exit(1);
});
