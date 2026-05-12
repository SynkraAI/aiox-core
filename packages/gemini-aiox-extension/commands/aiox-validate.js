#!/usr/bin/env node
/**
 * AIOX Validate Command - Validate installation and skills
 */

const path = require('path');

async function main() {
  const projectDir = process.cwd();

  console.log('🔍 AIOX Validation\n');

  try {
    const validatorPath = path.join(
      projectDir,
      '.aiox-core',
      'development',
      'scripts',
      'skill-validator.js',
    );

    const { SkillValidator } = require(validatorPath);
    const validator = new SkillValidator();
    const results = await validator.validateAll();

    console.log(validator.generateReport(results));
  } catch (error) {
    console.log('❌ Validation failed:', error.message);
    console.log('\nMake sure AIOX is installed: npx aiox-core install');
  }
}

main();
