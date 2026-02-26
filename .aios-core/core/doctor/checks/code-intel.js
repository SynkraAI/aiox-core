/**
 * Doctor Check: Code Intelligence
 *
 * Validates code-intel provider status by actually testing provider detection.
 * Checks: module exists → registry-provider available → primitives work.
 *
 * @module aios-core/doctor/checks/code-intel
 * @story INS-4.1, CODEINTEL-RP-001
 */

const path = require('path');
const fs = require('fs');

const name = 'code-intel';

async function run(context) {
  const codeIntelDir = path.join(context.projectRoot, '.aios-core', 'core', 'code-intel');

  // Check 1: Module exists
  if (!fs.existsSync(codeIntelDir)) {
    return {
      check: name,
      status: 'INFO',
      message: 'Code-intel module not found (optional)',
      fixCommand: null,
    };
  }

  // Check 2: Try to load and detect provider
  try {
    const indexPath = path.join(codeIntelDir, 'index.js');
    if (!fs.existsSync(indexPath)) {
      return {
        check: name,
        status: 'WARN',
        message: 'Code-intel index.js not found',
        fixCommand: null,
      };
    }

    // Clear require cache to get fresh state
    const resolvedIndex = require.resolve(indexPath);
    delete require.cache[resolvedIndex];

    const { getClient, isCodeIntelAvailable, _resetForTesting } = require(indexPath);

    // Reset singleton to test fresh detection
    _resetForTesting();

    // Initialize client (triggers provider auto-detection)
    const client = getClient({ projectRoot: context.projectRoot });
    const available = isCodeIntelAvailable();
    const metrics = client.getMetrics();

    // Clean up singleton after test
    _resetForTesting();

    if (!available) {
      // Check if entity-registry.yaml exists but provider still failed
      const registryPath = path.join(context.projectRoot, '.aios-core', 'data', 'entity-registry.yaml');
      if (fs.existsSync(registryPath)) {
        const stat = fs.statSync(registryPath);
        const sizeKB = Math.round(stat.size / 1024);
        return {
          check: name,
          status: 'WARN',
          message: `Registry exists (${sizeKB}KB) but provider detection failed — may be empty or malformed`,
          fixCommand: 'node .aios-core/development/scripts/populate-entity-registry.js',
        };
      }

      return {
        check: name,
        status: 'INFO',
        message: 'No provider available (no registry, no MCP) — graceful fallback active',
        fixCommand: 'node .aios-core/development/scripts/populate-entity-registry.js',
      };
    }

    // Provider is available — report details
    const provider = metrics.activeProvider;
    const cbState = metrics.circuitBreakerState;

    if (provider === 'registry') {
      // Read entity count from registry metadata
      const registryPath = path.join(context.projectRoot, '.aios-core', 'data', 'entity-registry.yaml');
      let entityInfo = '';
      if (fs.existsSync(registryPath)) {
        const content = fs.readFileSync(registryPath, 'utf8');
        const sizeKB = Math.round(fs.statSync(registryPath).size / 1024);
        // Extract entityCount from metadata header (avoids full YAML parse)
        const countMatch = content.match(/entityCount:\s*(\d+)/);
        const entityCount = countMatch ? countMatch[1] : '?';
        entityInfo = `, ${entityCount} entities, ${sizeKB}KB`;
      }

      return {
        check: name,
        status: 'PASS',
        message: `RegistryProvider (T1) active, 5/8 primitives${entityInfo}, CB: ${cbState}`,
        fixCommand: null,
      };
    }

    if (provider === 'code-graph') {
      return {
        check: name,
        status: 'PASS',
        message: `CodeGraphProvider (T3/MCP) active, 8/8 primitives, CB: ${cbState}`,
        fixCommand: null,
      };
    }

    // Unknown provider (custom)
    return {
      check: name,
      status: 'PASS',
      message: `Provider '${provider}' active, CB: ${cbState}`,
      fixCommand: null,
    };
  } catch (error) {
    return {
      check: name,
      status: 'WARN',
      message: `Provider detection error: ${error.message}`,
      fixCommand: null,
    };
  }
}

module.exports = { name, run };
