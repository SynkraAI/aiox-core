// =============================================================================
// field-filter.js — Field-type filter for MCP tool responses (array data)
// =============================================================================
// Projects specified columns from arrays of objects and limits row count.
// Analogous to SQL: SELECT field1, field2 FROM data LIMIT max_rows
//
// Usage (stdin):
//   echo '[{"a":1,"b":2,"c":3}]' | node field-filter.js --fields a,b --max-rows 10
//
// Usage (programmatic):
//   const { filterFields } = require('./field-filter');
//   const result = filterFields(data, { fields: ['a','b'], max_rows: 10 });
// =============================================================================

'use strict';

const fs = require('fs');

/**
 * Apply field filter to array data.
 * @param {Object[]} input - Array of objects
 * @param {Object} options - Filter options
 * @param {string[]} options.fields - Columns to project
 * @param {number} [options.max_rows] - Maximum rows to include
 * @returns {{ filtered: Object[], original_length: number, filtered_length: number, reduction_pct: number, rows_original: number, rows_filtered: number }}
 */
function filterFields(input, options = {}) {
  const fields = options.fields || [];
  const maxRows = options.max_rows || Infinity;

  // Ensure input is an array
  const data = Array.isArray(input) ? input : [input];

  const originalSerialized = JSON.stringify(data, null, 2);
  const originalLength = originalSerialized.length;
  const rowsOriginal = data.length;

  // Limit rows
  const sliced = data.slice(0, maxRows);

  // Project fields
  let filtered;
  if (fields.length > 0) {
    filtered = sliced.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const projected = {};
      for (const field of fields) {
        if (field in item) {
          projected[field] = item[field];
        }
      }
      return projected;
    });
  } else {
    filtered = sliced;
  }

  const filteredSerialized = JSON.stringify(filtered, null, 2);
  const filteredLength = filteredSerialized.length;
  const reductionPct = originalLength > 0
    ? Math.round((1 - filteredLength / originalLength) * 100)
    : 0;

  return {
    filtered,
    original_length: originalLength,
    filtered_length: filteredLength,
    reduction_pct: reductionPct,
    rows_original: rowsOriginal,
    rows_filtered: filtered.length,
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
    } else if (argv[i] === '--max-rows' && argv[i + 1]) {
      args.max_rows = parseInt(argv[i + 1], 10);
      i++;
    } else if (argv[i] === '--input' && argv[i + 1]) {
      args.input = argv[i + 1];
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
    console.error('Usage: echo \'[{"a":1}]\' | node field-filter.js --fields a --max-rows 10');
    process.exit(1);
  }

  try {
    inputData = JSON.parse(inputData);
  } catch (err) {
    console.error('Error: Input must be valid JSON.', err.message);
    process.exit(1);
  }

  const result = filterFields(inputData, {
    fields: args.fields,
    max_rows: args.max_rows,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { filterFields };
