// =============================================================================
// schema-filter.js — Schema-type filter for MCP tool responses
// =============================================================================
// Selects only whitelisted fields from JSON objects or arrays of objects.
// Optionally truncates serialized output to max_tokens.
//
// Usage (stdin):
//   echo '[{"name":"John","ssn":"123"}]' | node schema-filter.js --fields name
//
// Usage (programmatic):
//   const { filterSchema } = require('./schema-filter');
//   const result = filterSchema(data, { fields: ['name', 'url'] });
// =============================================================================

'use strict';

const fs = require('fs');
const { CHARS_PER_TOKEN } = require('./constants');

/**
 * Project whitelisted fields from an object.
 * @param {Object} obj - Source object
 * @param {string[]} fields - Fields to keep
 * @returns {Object} Projected object
 */
function projectFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj;

  const result = {};
  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }
  return result;
}

/**
 * Apply schema filter to input data.
 * @param {Object|Object[]} input - Parsed JSON input
 * @param {Object} options - Filter options
 * @param {string[]} options.fields - Fields to whitelist
 * @param {number} [options.max_tokens] - Optional token limit for output
 * @returns {{ filtered: Object|Object[], original_length: number, filtered_length: number, reduction_pct: number }}
 */
function filterSchema(input, options = {}) {
  const fields = options.fields || [];

  if (!fields.length) {
    // No fields specified — pass through unfiltered
    const serialized = JSON.stringify(input, null, 2);
    return {
      filtered: input,
      original_length: serialized.length,
      filtered_length: serialized.length,
      reduction_pct: 0,
    };
  }

  const originalSerialized = JSON.stringify(input, null, 2);
  const originalLength = originalSerialized.length;

  let filtered;
  if (Array.isArray(input)) {
    filtered = input.map((item) => projectFields(item, fields));
  } else {
    filtered = projectFields(input, fields);
  }

  let filteredSerialized = JSON.stringify(filtered, null, 2);

  // Apply max_tokens truncation if specified
  if (options.max_tokens) {
    const maxChars = options.max_tokens * CHARS_PER_TOKEN;
    if (filteredSerialized.length > maxChars) {
      // For arrays, truncate by removing trailing items to keep valid JSON
      if (Array.isArray(filtered)) {
        while (JSON.stringify(filtered, null, 2).length > maxChars && filtered.length > 1) {
          filtered.pop();
        }
        filteredSerialized = JSON.stringify(filtered, null, 2);
        if (filteredSerialized.length > maxChars) {
          filteredSerialized = filteredSerialized.slice(0, maxChars) + '\n... [truncated]';
        }
      } else {
        // For objects, hard truncate with marker (object already field-projected)
        filteredSerialized = filteredSerialized.slice(0, maxChars) + '\n... [truncated]';
      }
    }
  }

  const filteredLength = filteredSerialized.length;
  const reductionPct = originalLength > 0
    ? Math.round((1 - filteredLength / originalLength) * 100)
    : 0;

  return {
    filtered,
    original_length: originalLength,
    filtered_length: filteredLength,
    reduction_pct: reductionPct,
  };
}

// ---------------------------------------------------------------------------
// CLI entrypoint
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--fields' && argv[i + 1]) {
      args.fields = argv[i + 1].split(',');
      i++;
    } else if (argv[i] === '--input' && argv[i + 1]) {
      args.input = argv[i + 1];
      i++;
    } else if (argv[i] === '--max-tokens' && argv[i + 1]) {
      args.max_tokens = parseInt(argv[i + 1], 10);
      i++;
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  let inputData;
  if (args.input) {
    inputData = fs.readFileSync(args.input, 'utf8');
  } else if (!process.stdin.isTTY) {
    inputData = fs.readFileSync(0, 'utf8');
  } else {
    console.error('Usage: echo \'[{"a":1,"b":2}]\' | node schema-filter.js --fields a');
    process.exit(1);
  }

  try {
    inputData = JSON.parse(inputData);
  } catch (err) {
    console.error('Error: Input must be valid JSON.', err.message);
    process.exit(1);
  }

  const result = filterSchema(inputData, {
    fields: args.fields,
    max_tokens: args.max_tokens,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { filterSchema, projectFields, CHARS_PER_TOKEN };
