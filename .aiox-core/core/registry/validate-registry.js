/**
 * Service Registry Validator
 *
 * Validates the service registry against schema and checks file paths.
 * Runs smoke tests REG-01 to REG-06.
 *
 * @module validate-registry
 * @version 1.0.0
 * @created Story 2.6 - Service Registry Creation
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * Smoke test definitions
 */
const SMOKE_TESTS = {
  'REG-01': {
    name: 'Registry Loads',
    description: 'Registry file loads without errors',
    priority: 'P0',
    test: async (ctx) => {
      try {
        JSON.parse(ctx.registryContent);
        return { passed: true };
      } catch (error) {
        return { passed: false, error: `JSON parse failed: ${error.message}` };
      }
    },
  },
  'REG-02': {
    name: 'Schema Valid',
    description: 'Registry validates against schema',
    priority: 'P0',
    test: async (ctx) => {
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(ctx.schema);
      const valid = validate(ctx.registry);
      if (!valid) {
        return {
          passed: false,
          error: 'Schema validation failed',
          details: validate.errors.slice(0, 5),
        };
      }
      return { passed: true };
    },
  },
  'REG-03': {
    name: 'Worker Count',
    description: 'Registry has 97+ workers',
    priority: 'P0',
    test: async (ctx) => {
      const count = ctx.registry.workers?.length || 0;
      if (count >= 97) {
        return { passed: true, details: `Found ${count} workers` };
      }
      return {
        passed: false,
        error: `Expected 97+ workers, found ${count}`,
      };
    },
  },
  'REG-04': {
    name: 'Paths Exist',
    description: 'All worker paths point to existing files',
    priority: 'P1',
    test: async (ctx) => {
      const missing = [];
      for (const worker of ctx.registry.workers || []) {
        const fullPath = path.join(ctx.baseDir, worker.path);
        try {
          await fs.access(fullPath);
        } catch {
          missing.push({ id: worker.id, path: worker.path });
        }
      }
      if (missing.length === 0) {
        return { passed: true };
      }
      return {
        passed: false,
        error: `${missing.length} paths not found`,
        details: missing.slice(0, 10),
      };
    },
  },
  'REG-05': {
    name: 'IDs Unique',
    description: 'All worker IDs are unique',
    priority: 'P1',
    test: async (ctx) => {
      const ids = ctx.registry.workers?.map(w => w.id) || [];
      const seen = new Set();
      const duplicates = [];
      for (const id of ids) {
        if (seen.has(id)) {
          duplicates.push(id);
        }
        seen.add(id);
      }
      if (duplicates.length === 0) {
        return { passed: true };
      }
      return {
        passed: false,
        error: `${duplicates.length} duplicate IDs found`,
        details: duplicates,
      };
    },
  },
  'REG-06': {
    name: 'Load Performance',
    description: 'Registry loads in < 500ms',
    priority: 'P1',
    test: async (ctx) => {
      const start = Date.now();
      JSON.parse(ctx.registryContent);
      const loadTime = Date.now() - start;
      if (loadTime < 500) {
        return { passed: true, details: `Load time: ${loadTime}ms` };
      }
      return {
        passed: false,
        error: `Load time ${loadTime}ms exceeds 500ms limit`,
      };
    },
  },
};

/**
 * Run all smoke tests
 */
async function runSmokeTests(registryPath, schemaPath, baseDir) {
  console.log('Running Registry Smoke Tests');
  console.log('='.repeat(50));

  // Load registry content
  let registryContent, registry, schema;
  try {
    registryContent = await fs.readFile(registryPath, 'utf8');
    registry = JSON.parse(registryContent);
    schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load files:', error.message);
    return { allPassed: false, p0Failed: true, results: {} };
  }

  const ctx = { registryContent, registry, schema, baseDir };
  const results = {};
  let p0Failed = false;
  let p1Failed = false;

  for (const [testId, testDef] of Object.entries(SMOKE_TESTS)) {
    console.log(`\n[${testId}] ${testDef.name} (${testDef.priority})`);
    console.log(`  ${testDef.description}`);

    try {
      const result = await testDef.test(ctx);
      results[testId] = {
        ...testDef,
        ...result,
      };

      if (result.passed) {
        console.log('  Result: PASSED');
        if (result.details) {
          console.log(`  Details: ${JSON.stringify(result.details)}`);
        }
      } else {
        console.log('  Result: FAILED');
        console.log(`  Error: ${result.error}`);
        if (result.details) {
          console.log(`  Details: ${JSON.stringify(result.details).slice(0, 200)}`);
        }

        if (testDef.priority === 'P0') {
          p0Failed = true;
        } else {
          p1Failed = true;
        }
      }
    } catch (error) {
      console.log('  Result: ERROR');
      console.log(`  Error: ${error.message}`);
      results[testId] = {
        ...testDef,
        passed: false,
        error: error.message,
      };
      if (testDef.priority === 'P0') {
        p0Failed = true;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));

  const passed = Object.values(results).filter(r => r.passed).length;
  const total = Object.keys(results).length;

  console.log(`Tests: ${passed}/${total} passed`);
  console.log(`P0 Status: ${p0Failed ? 'FAILED' : 'PASSED'}`);
  console.log(`P1 Status: ${p1Failed ? 'FAILED' : 'PASSED'}`);

  return {
    allPassed: !p0Failed && !p1Failed,
    p0Failed,
    p1Failed,
    results,
  };
}

/**
 * Validate registry fields
 */
async function validateFields(registryPath) {
  console.log('\nValidating registry fields...');

  const content = await fs.readFile(registryPath, 'utf8');
  const registry = JSON.parse(content);

  const issues = [];

  for (const worker of registry.workers) {
    // Check required fields
    if (!worker.id) {
      issues.push({ id: worker.name, issue: 'Missing ID' });
    }
    if (!worker.name) {
      issues.push({ id: worker.id, issue: 'Missing name' });
    }
    if (!worker.description || worker.description === 'No description available') {
      issues.push({ id: worker.id, issue: 'Missing or default description' });
    }
    if (!worker.path) {
      issues.push({ id: worker.id, issue: 'Missing path' });
    }
    if (!worker.taskFormat) {
      issues.push({ id: worker.id, issue: 'Missing taskFormat' });
    }

    // Check ID format
    if (worker.id && !/^[a-z0-9-]+$/.test(worker.id)) {
      issues.push({ id: worker.id, issue: 'Invalid ID format (must be kebab-case)' });
    }

    // Check path format
    if (worker.path && !worker.path.startsWith('.aiox-core/')) {
      issues.push({ id: worker.id, issue: 'Invalid path prefix (must start with .aiox-core/)' });
    }
  }

  if (issues.length === 0) {
    console.log('All fields valid!');
  } else {
    console.log(`Found ${issues.length} field issues:`);
    issues.slice(0, 20).forEach(i => {
      console.log(`  - ${i.id}: ${i.issue}`);
    });
    if (issues.length > 20) {
      console.log(`  ... and ${issues.length - 20} more`);
    }
  }

  return issues;
}

/**
 * CLI entry point
 */
async function main() {
  const baseDir = process.argv[2] || process.cwd();
  const registryPath = path.join(baseDir, '.aiox-core/core/registry/service-registry.json');
  const schemaPath = path.join(baseDir, '.aiox-core/core/registry/registry-schema.json');

  console.log('Service Registry Validator');
  console.log('='.repeat(50));
  console.log(`Base directory: ${baseDir}`);
  console.log(`Registry: ${registryPath}`);
  console.log(`Schema: ${schemaPath}`);

  // Check files exist
  try {
    await fs.access(registryPath);
  } catch {
    console.error(`\nError: Registry file not found at ${registryPath}`);
    console.error('Run build-registry.js first to generate the registry.');
    process.exit(1);
  }

  try {
    await fs.access(schemaPath);
  } catch {
    console.error(`\nError: Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  // Run smoke tests
  const testResults = await runSmokeTests(registryPath, schemaPath, baseDir);

  // Run field validation
  const _fieldIssues = await validateFields(registryPath);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('FINAL RESULT');
  console.log('='.repeat(50));

  if (testResults.p0Failed) {
    console.log('STATUS: FAILED (P0 tests failed)');
    process.exit(1);
  } else if (testResults.p1Failed) {
    console.log('STATUS: WARNING (P1 tests failed, but P0 passed)');
    process.exit(0);
  } else {
    console.log('STATUS: PASSED (All tests passed)');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runSmokeTests,
  validateFields,
  SMOKE_TESTS,
};
