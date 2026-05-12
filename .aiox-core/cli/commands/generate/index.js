/**
 * Generate Command
 *
 * CLI command for generating documents using the Template Engine.
 * Supports: prd, adr, pmdr, dbdr, story, epic, task
 *
 * @module cli/commands/generate
 * @version 1.0.0
 * @story 3.9 - Template PMDR (AC3.9.8)
 */

'use strict';

const { Command } = require('commander');
const path = require('path');

// Lazy load TemplateEngine to avoid startup overhead
let TemplateEngine = null;

/**
 * Get TemplateEngine instance (lazy loaded)
 * @returns {Object} TemplateEngine class
 */
function getTemplateEngine() {
  if (!TemplateEngine) {
    const enginePath = path.join(__dirname, '..', '..', '..', 'product', 'templates', 'engine');
    const engine = require(enginePath);
    TemplateEngine = engine.TemplateEngine;
  }
  return TemplateEngine;
}

/**
 * Generate a document from template
 * @param {string} templateType - Template type (prd, adr, pmdr, etc.)
 * @param {Object} options - Command options
 */
async function generateDocument(templateType, options) {
  const Engine = getTemplateEngine();

  const engine = new Engine({
    interactive: !options.nonInteractive,
    baseDir: options.baseDir || process.cwd(),
  });

  // Validate template type
  if (!engine.supportedTypes.includes(templateType)) {
    console.error(`❌ Unsupported template type: ${templateType}`);
    console.log(`\nSupported types: ${engine.supportedTypes.join(', ')}`);
    process.exit(1);
  }

  try {
    console.log(`\n📝 Generating ${templateType.toUpperCase()} document...\n`);

    // Build context from options
    const context = {};
    if (options.title) context.title = options.title;
    if (options.number) context.number = parseInt(options.number, 10);
    if (options.status) context.status = options.status;
    if (options.owner) context.owner = options.owner;

    // Generate document
    const result = await engine.generate(templateType, context, {
      validate: !options.skipValidation,
      save: options.save,
      outputPath: options.output,
    });

    // Output result
    if (options.save && result.savedTo) {
      console.log(`\n✅ Document saved to: ${result.savedTo}`);
    } else if (!options.save) {
      console.log('\n--- Generated Document ---\n');
      console.log(result.content);
      console.log('\n--- End Document ---\n');
    }

    // Show validation warnings
    if (result.validation && !result.validation.isValid) {
      console.warn('\n⚠️  Validation warnings:');
      result.validation.errors.forEach(err => console.warn(`   - ${err}`));
    }

    // Show metadata
    if (options.verbose) {
      console.log('\n📊 Metadata:');
      console.log(`   Template: ${result.templateType}`);
      console.log(`   Generated: ${result.generatedAt}`);
      if (result.savedTo) console.log(`   Saved to: ${result.savedTo}`);
    }

  } catch (error) {
    console.error(`\n❌ Generation failed: ${error.message}`);
    if (options.verbose) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

/**
 * List available templates
 * @param {Object} options - Command options
 */
async function listTemplates(options) {
  const Engine = getTemplateEngine();
  const engine = new Engine({ interactive: false });

  try {
    const templates = await engine.listTemplates();

    console.log('\n📋 Available Templates:\n');

    if (options.json) {
      console.log(JSON.stringify(templates, null, 2));
    } else {
      templates.forEach(t => {
        const status = t.status === 'missing' ? '⚠️  (missing)' : '✅';
        console.log(`  ${status} ${t.type.padEnd(10)} - ${t.name} v${t.version}`);

        if (options.verbose && t.variables.length > 0) {
          console.log('     Variables:');
          t.variables.forEach(v => {
            const req = v.required ? '*' : ' ';
            console.log(`       ${req}${v.name} (${v.type})`);
          });
        }
      });
    }

    console.log('');
  } catch (error) {
    console.error(`❌ Error listing templates: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Show template info
 * @param {string} templateType - Template type
 * @param {Object} options - Command options
 */
async function showTemplateInfo(templateType, options) {
  const Engine = getTemplateEngine();
  const engine = new Engine({ interactive: false });

  try {
    const info = await engine.getTemplateInfo(templateType);

    if (options.json) {
      console.log(JSON.stringify(info, null, 2));
    } else {
      console.log(`\n📝 Template: ${info.name}`);
      console.log(`   Type: ${info.type}`);
      console.log(`   Version: ${info.version}`);
      console.log('\n   Variables:');
      info.variables.forEach(v => {
        const req = v.required ? '(required)' : '(optional)';
        console.log(`     - ${v.name}: ${v.type} ${req}`);
        if (v.description) console.log(`       ${v.description}`);
      });
      console.log('');
    }
  } catch (error) {
    console.error(`❌ Error getting template info: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create the generate command
 * @returns {Command} Commander command instance
 */
function createGenerateCommand() {
  const generate = new Command('generate')
    .description('Generate documents from templates (prd, adr, pmdr, dbdr, story, epic, task)')
    .argument('[type]', 'Template type to generate')
    .option('-t, --title <title>', 'Document title')
    .option('-n, --number <number>', 'Document number')
    .option('-s, --status <status>', 'Initial status')
    .option('-o, --owner <owner>', 'Document owner')
    .option('--output <path>', 'Output file path')
    .option('--save', 'Save to file (default location if --output not specified)')
    .option('--non-interactive', 'Disable interactive prompts')
    .option('--skip-validation', 'Skip schema validation')
    .option('--base-dir <dir>', 'Base directory for paths')
    .option('-v, --verbose', 'Show detailed output')
    .option('--json', 'Output as JSON')
    .action(async (type, options) => {
      if (!type) {
        // No type specified - show help
        generate.help();
        return;
      }
      await generateDocument(type, options);
    });

  // Add list subcommand
  generate
    .command('list')
    .description('List available templates')
    .option('-v, --verbose', 'Show variable details')
    .option('--json', 'Output as JSON')
    .action(listTemplates);

  // Add info subcommand
  generate
    .command('info <type>')
    .description('Show template information')
    .option('--json', 'Output as JSON')
    .action(showTemplateInfo);

  return generate;
}

module.exports = {
  createGenerateCommand,
  generateDocument,
  listTemplates,
  showTemplateInfo,
};
