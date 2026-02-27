/**
 * Agent Definition Validator
 *
 * Validates agent definition YAML blocks against the JSON Schema
 * at ./schemas/agent-definition.schema.json.
 *
 * Integration points:
 * - Called by AgentConfigLoader.loadAgentDefinition() during activation
 * - Called by AgentConfigCheck (health-check) for batch validation
 * - Can be invoked via CLI: node agent-definition-validator.js [agentId|--all]
 *
 * Behavior:
 * - Missing required fields -> ValidationError (blocks loading)
 * - Unknown fields -> warning (logged, does not block)
 * - Schema enum mismatch -> ValidationError (blocks loading)
 *
 * @module core/config/agent-definition-validator
 * @version 1.0.0
 * @story W3.7 ACT-8: Agent Config Loading Governance
 */

const path = require('path');
const fs = require('fs');

// ============================================================================
//  SCHEMA LOADING
// ============================================================================

let _schemaCache = null;

/**
 * Load the agent definition JSON Schema (cached).
 * @returns {Object} Parsed JSON Schema object
 */
function loadSchema() {
  if (_schemaCache) {
    return _schemaCache;
  }

  const schemaPath = path.join(__dirname, 'schemas', 'agent-definition.schema.json');
  const content = fs.readFileSync(schemaPath, 'utf8');
  _schemaCache = JSON.parse(content);
  return _schemaCache;
}

/**
 * Clear the cached schema (useful for testing).
 */
function clearSchemaCache() {
  _schemaCache = null;
}

// ============================================================================
//  AJV INSTANCE
// ============================================================================

let _ajvInstance = null;
let _compiledValidate = null;

/**
 * Get or create the Ajv validator instance.
 * @returns {{ validate: Function }} Compiled Ajv validate function
 */
function getValidator() {
  if (_compiledValidate) {
    return _compiledValidate;
  }

  try {
    const Ajv = require('ajv');
    const ajv = new Ajv({ allErrors: true, strict: false });
    _ajvInstance = ajv;

    const schema = loadSchema();
    _compiledValidate = ajv.compile(schema);
    return _compiledValidate;
  } catch (error) {
    // ajv not available -- fall back to manual validation
    return null;
  }
}

/**
 * Reset the Ajv instance (useful for testing).
 */
function resetValidator() {
  _ajvInstance = null;
  _compiledValidate = null;
  clearSchemaCache();
}

// ============================================================================
//  CORE VALIDATION
// ============================================================================

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the definition passed validation
 * @property {Array<{path: string, message: string, severity: string}>} errors - Blocking errors
 * @property {Array<{path: string, message: string, severity: string}>} warnings - Non-blocking warnings
 * @property {string} agentId - Agent ID extracted from definition (if available)
 */

/**
 * Validate an agent definition object against the schema.
 *
 * @param {Object} definition - Parsed agent definition (from YAML block)
 * @param {Object} [options={}] - Validation options
 * @param {boolean} [options.strict=false] - If true, treat warnings as errors
 * @param {boolean} [options.collectWarnings=true] - If true, collect unknown-field warnings
 * @returns {ValidationResult}
 */
function validateAgentDefinition(definition, options = {}) {
  const strict = options.strict || false;
  const collectWarnings = options.collectWarnings !== false;

  const result = {
    valid: true,
    errors: [],
    warnings: [],
    agentId: definition?.agent?.id || 'unknown',
  };

  // ---- Phase 1: Structural checks (always run, even without Ajv) ----
  if (!definition || typeof definition !== 'object') {
    result.valid = false;
    result.errors.push({
      path: '/',
      message: 'Agent definition must be a non-null object',
      severity: 'error',
    });
    return result;
  }

  // Required top-level: agent
  if (!definition.agent) {
    result.valid = false;
    result.errors.push({
      path: '/agent',
      message: 'Missing required section "agent" -- every agent definition must have an "agent" object with name, id, title, and icon',
      severity: 'error',
    });
    return result;
  }

  // Required agent fields
  const requiredAgentFields = ['name', 'id', 'title', 'icon'];
  for (const field of requiredAgentFields) {
    const value = definition.agent[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      result.valid = false;
      result.errors.push({
        path: `/agent/${field}`,
        message: `Missing required field "agent.${field}" -- this field is needed for agent activation and greeting display`,
        severity: 'error',
      });
    }
  }

  // Validate agent.id pattern (lowercase, alphanumeric, hyphens)
  if (definition.agent.id && typeof definition.agent.id === 'string') {
    if (!/^[a-z][a-z0-9-]*$/.test(definition.agent.id)) {
      result.valid = false;
      result.errors.push({
        path: '/agent/id',
        message: `Invalid agent.id "${definition.agent.id}" -- must match pattern ^[a-z][a-z0-9-]*$ (lowercase, starts with letter, alphanumeric and hyphens only)`,
        severity: 'error',
      });
    }
  }

  // ---- Phase 2: persona_profile checks ----
  if (definition.persona_profile) {
    if (!definition.persona_profile.archetype) {
      result.valid = false;
      result.errors.push({
        path: '/persona_profile/archetype',
        message: 'Missing required field "persona_profile.archetype" -- defines the agent personality archetype (e.g., Builder, Guardian, Visionary)',
        severity: 'error',
      });
    }

    if (!definition.persona_profile.communication) {
      result.valid = false;
      result.errors.push({
        path: '/persona_profile/communication',
        message: 'Missing required field "persona_profile.communication" -- defines tone, vocabulary, and greeting levels',
        severity: 'error',
      });
    } else if (!definition.persona_profile.communication.tone) {
      result.valid = false;
      result.errors.push({
        path: '/persona_profile/communication/tone',
        message: 'Missing required field "persona_profile.communication.tone" -- defines the agent communication tone (e.g., pragmatic, analytical)',
        severity: 'error',
      });
    }
  }

  // ---- Phase 3: Ajv schema validation (if available) ----
  const validate = getValidator();
  if (validate) {
    const ajvValid = validate(definition);
    if (!ajvValid && validate.errors) {
      for (const err of validate.errors) {
        const errPath = err.instancePath || err.dataPath || '/';
        const message = _formatAjvError(err);

        // "additionalProperties" errors become warnings unless strict mode
        if (err.keyword === 'additionalProperties') {
          if (collectWarnings) {
            result.warnings.push({
              path: errPath,
              message,
              severity: 'warning',
            });
          }
          if (strict) {
            result.valid = false;
            result.errors.push({
              path: errPath,
              message,
              severity: 'error',
            });
          }
        } else {
          // All other Ajv errors are blocking
          result.valid = false;
          result.errors.push({
            path: errPath,
            message,
            severity: 'error',
          });
        }
      }
    }
  }

  // ---- Phase 4: Semantic warnings (non-blocking) ----
  if (collectWarnings) {
    // Warn if commands array is empty
    if (definition.commands && Array.isArray(definition.commands) && definition.commands.length === 0) {
      result.warnings.push({
        path: '/commands',
        message: 'Commands array is empty -- agent will have no available commands',
        severity: 'warning',
      });
    }

    // Warn if no dependencies defined
    if (!definition.dependencies) {
      result.warnings.push({
        path: '/dependencies',
        message: 'No dependencies section defined -- agent has no task, template, or tool dependencies',
        severity: 'warning',
      });
    }

    // Warn if persona_profile is completely missing
    if (!definition.persona_profile) {
      result.warnings.push({
        path: '/persona_profile',
        message: 'Missing persona_profile section -- agent will use default greeting levels',
        severity: 'warning',
      });
    }

    // Warn if activation-instructions is missing
    if (!definition['activation-instructions']) {
      result.warnings.push({
        path: '/activation-instructions',
        message: 'Missing activation-instructions -- agent may not activate correctly in IDE contexts',
        severity: 'warning',
      });
    }
  }

  return result;
}

/**
 * Format an Ajv error into a human-readable message.
 * @private
 * @param {Object} err - Ajv error object
 * @returns {string} Formatted error message
 */
function _formatAjvError(err) {
  const location = err.instancePath || '/';

  switch (err.keyword) {
    case 'required':
      return `Missing required property "${err.params.missingProperty}" at ${location}`;
    case 'type':
      return `Expected type "${err.params.type}" at ${location}, got ${typeof err.data}`;
    case 'enum':
      return `Invalid value at ${location} -- must be one of: ${err.params.allowedValues.join(', ')}`;
    case 'pattern':
      return `Value at ${location} does not match pattern ${err.params.pattern}`;
    case 'minLength':
      return `Value at ${location} must have at least ${err.params.limit} character(s)`;
    case 'additionalProperties':
      return `Unknown property "${err.params.additionalProperty}" at ${location} -- not defined in schema`;
    default:
      return `${err.message} at ${location}`;
  }
}

// ============================================================================
//  BATCH VALIDATION (All Agents)
// ============================================================================

/**
 * Validate all agent definition files in the agents directory.
 *
 * @param {string} [projectRoot=process.cwd()] - Project root path
 * @param {Object} [options={}] - Validation options
 * @returns {Object} Batch validation results
 */
function validateAllAgents(projectRoot, options = {}) {
  const agentsDir = path.join(projectRoot || process.cwd(), '.aios-core', 'development', 'agents');
  const yaml = require('js-yaml');

  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    warnings: 0,
    agents: {},
  };

  let files;
  try {
    files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  } catch (error) {
    return {
      ...results,
      error: `Cannot read agents directory: ${error.message}`,
    };
  }

  for (const file of files) {
    results.total++;
    const filePath = path.join(agentsDir, file);
    const agentId = file.replace('.md', '');

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract YAML block
      const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
      if (!yamlMatch) {
        results.invalid++;
        results.agents[agentId] = {
          valid: false,
          errors: [{
            path: '/',
            message: `No YAML block found in ${file}`,
            severity: 'error',
          }],
          warnings: [],
        };
        continue;
      }

      let definition;
      try {
        definition = yaml.load(yamlMatch[1]);
      } catch (parseError) {
        results.invalid++;
        results.agents[agentId] = {
          valid: false,
          errors: [{
            path: '/',
            message: `YAML parse error in ${file}: ${parseError.message}`,
            severity: 'error',
          }],
          warnings: [],
        };
        continue;
      }

      const validationResult = validateAgentDefinition(definition, options);
      results.agents[agentId] = validationResult;

      if (validationResult.valid) {
        results.valid++;
      } else {
        results.invalid++;
      }

      if (validationResult.warnings.length > 0) {
        results.warnings += validationResult.warnings.length;
      }
    } catch (error) {
      results.invalid++;
      results.agents[agentId] = {
        valid: false,
        errors: [{
          path: '/',
          message: `Failed to read ${file}: ${error.message}`,
          severity: 'error',
        }],
        warnings: [],
      };
    }
  }

  return results;
}

// ============================================================================
//  EXPORTS
// ============================================================================

module.exports = {
  validateAgentDefinition,
  validateAllAgents,
  loadSchema,
  clearSchemaCache,
  resetValidator,
};

// ============================================================================
//  CLI ENTRY POINT
// ============================================================================

if (require.main === module) {
  const arg = process.argv[2];

  if (!arg || arg === '--help') {
    console.log(`
Agent Definition Validator — validates agent YAML blocks against schema

Usage:
  node agent-definition-validator.js --all              Validate all agents
  node agent-definition-validator.js <agent-id>         Validate specific agent
  node agent-definition-validator.js --strict --all     Treat warnings as errors

Options:
  --all       Validate all agent files in .aios-core/development/agents/
  --strict    Treat unknown fields as errors (default: warnings only)
  --help      Show this help
`);
    process.exit(0);
  }

  const strict = process.argv.includes('--strict');
  const projectRoot = process.cwd();

  if (arg === '--all' || process.argv[3] === '--all') {
    const results = validateAllAgents(projectRoot, { strict });

    console.log(`\nAgent Definition Validation Results`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Total: ${results.total} | Valid: ${results.valid} | Invalid: ${results.invalid} | Warnings: ${results.warnings}\n`);

    for (const [agentId, result] of Object.entries(results.agents)) {
      const status = result.valid ? 'PASS' : 'FAIL';
      const warnCount = (result.warnings || []).length;
      console.log(`  [${status}] @${agentId}${warnCount > 0 ? ` (${warnCount} warnings)` : ''}`);

      for (const err of (result.errors || [])) {
        console.log(`    ERROR: ${err.message}`);
      }
      for (const warn of (result.warnings || [])) {
        console.log(`    WARN:  ${warn.message}`);
      }
    }

    process.exit(results.invalid > 0 ? 1 : 0);
  } else {
    // Validate specific agent
    const agentId = arg.replace('--strict', '').trim() || process.argv[3];
    const yaml = require('js-yaml');
    const agentPath = path.join(projectRoot, '.aios-core', 'development', 'agents', `${agentId}.md`);

    try {
      const content = fs.readFileSync(agentPath, 'utf8');
      const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);

      if (!yamlMatch) {
        console.error(`No YAML block found in ${agentId}.md`);
        process.exit(1);
      }

      const definition = yaml.load(yamlMatch[1]);
      const result = validateAgentDefinition(definition, { strict });

      console.log(`\nValidation: @${agentId}`);
      console.log(`Status: ${result.valid ? 'VALID' : 'INVALID'}`);

      if (result.errors.length > 0) {
        console.log(`\nErrors (${result.errors.length}):`);
        for (const err of result.errors) {
          console.log(`  - [${err.path}] ${err.message}`);
        }
      }

      if (result.warnings.length > 0) {
        console.log(`\nWarnings (${result.warnings.length}):`);
        for (const warn of result.warnings) {
          console.log(`  - [${warn.path}] ${warn.message}`);
        }
      }

      process.exit(result.valid ? 0 : 1);
    } catch (error) {
      console.error(`Failed to validate @${agentId}: ${error.message}`);
      process.exit(1);
    }
  }
}
