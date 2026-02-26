// =============================================================================
// index.js — Filter engine entry point
// =============================================================================
// Reads tool-registry.yaml, looks up filter config for a given tool,
// and dispatches to the appropriate filter (content, schema, field).
//
// Usage:
//   node .aios-core/utils/filters/index.js --tool exa --input response.json
//   echo '{"data":"..."}' | node .aios-core/utils/filters/index.js --tool exa
//
// Programmatic:
//   const { applyFilter, loadFilterConfig } = require('./index');
//   const result = applyFilter('exa', inputData);
// =============================================================================

'use strict';

const fs = require('fs');
const path = require('path');
const { filterContent } = require('./content-filter');
const { filterSchema } = require('./schema-filter');
const { filterFields } = require('./field-filter');

// Registry path relative to project root
const REGISTRY_PATH = path.join(__dirname, '..', '..', 'data', 'tool-registry.yaml');

/**
 * Load filter configuration for a tool from tool-registry.yaml.
 * @param {string} toolName - Tool name (case-sensitive, matches registry key)
 * @param {string} [registryPath] - Override registry path (for testing)
 * @returns {Object|null} Filter config or null if not found
 */
function loadFilterConfig(toolName, registryPath) {
  const regPath = registryPath || REGISTRY_PATH;

  let yaml;
  try {
    yaml = require('js-yaml');
  } catch (_) {
    // js-yaml not available — try yaml package
    try {
      yaml = require('yaml');
      const content = fs.readFileSync(regPath, 'utf8');
      const registry = yaml.parse(content);
      const tool = registry.tools && registry.tools[toolName];
      return (tool && tool.filter) || null;
    } catch (__) {
      return null;
    }
  }

  try {
    const content = fs.readFileSync(regPath, 'utf8');
    const registry = yaml.load(content);
    const tool = registry.tools && registry.tools[toolName];
    return (tool && tool.filter) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Apply the appropriate filter to input data based on tool's registry config.
 * @param {string} toolName - Tool name
 * @param {*} input - Input data (string, object, or array)
 * @param {Object} [overrideConfig] - Override filter config (skip registry lookup)
 * @param {string} [registryPath] - Override registry path
 * @returns {{ filtered: *, original_length: number, filtered_length: number, reduction_pct: number, filter_type: string }}
 */
function applyFilter(toolName, input, overrideConfig, registryPath) {
  const config = overrideConfig || loadFilterConfig(toolName, registryPath);

  if (!config) {
    // No filter config — pass through
    const serialized = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    return {
      filtered: input,
      original_length: serialized.length,
      filtered_length: serialized.length,
      reduction_pct: 0,
      filter_type: 'none',
    };
  }

  const filterType = config.type;

  switch (filterType) {
    case 'content':
      return {
        ...filterContent(input, {
          max_tokens: config.max_tokens,
          extract: config.extract,
        }),
        filter_type: 'content',
      };

    case 'schema':
      return {
        ...filterSchema(input, {
          fields: config.fields,
          max_tokens: config.max_tokens,
        }),
        filter_type: 'schema',
      };

    case 'field':
      return {
        ...filterFields(input, {
          fields: config.fields,
          max_rows: config.max_rows,
        }),
        filter_type: 'field',
      };

    default:
      // Unknown filter type — pass through
      const serialized = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
      return {
        filtered: input,
        original_length: serialized.length,
        filtered_length: serialized.length,
        reduction_pct: 0,
        filter_type: 'unknown',
      };
  }
}

// ---------------------------------------------------------------------------
// CLI entrypoint
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--tool' && argv[i + 1]) {
      args.tool = argv[i + 1];
      i++;
    } else if (argv[i] === '--input' && argv[i + 1]) {
      args.input = argv[i + 1];
      i++;
    } else if (argv[i] === '--registry' && argv[i + 1]) {
      args.registry = argv[i + 1];
      i++;
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  if (!args.tool) {
    console.error('Usage: node index.js --tool <tool-name> [--input <file>] [--registry <path>]');
    process.exit(1);
  }

  let inputData;
  if (args.input) {
    inputData = fs.readFileSync(args.input, 'utf8');
  } else if (!process.stdin.isTTY) {
    inputData = fs.readFileSync(0, 'utf8');
  } else {
    console.error('Error: Provide input via --input file or stdin pipe.');
    process.exit(1);
  }

  try {
    inputData = JSON.parse(inputData);
  } catch (_) {
    // treat as raw text
  }

  const result = applyFilter(args.tool, inputData, null, args.registry);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { applyFilter, loadFilterConfig };
