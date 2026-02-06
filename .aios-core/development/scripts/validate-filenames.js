#!/usr/bin/env node
/**
 * Validate Architecture and PRD Filenames
 *
 * Ensures all sharded documentation files follow English naming conventions
 * and don't contain Portuguese characters or untranslated terms.
 *
 * Usage:
 *   node .aios-core/utils/validate-filenames.js
 *   node .aios-core/utils/validate-filenames.js --fix
 */

const fs = require('fs');
const path = require('path');

// Portuguese characters that should not appear in filenames
const PORTUGUESE_CHARS = /[áàâãéêíóôõúüç]/i;

// Common Portuguese terms that should be translated
const PORTUGUESE_TERMS = {
  'visao': 'vision',
  'viso': 'vision',
  'produto': 'product',
  'problema': 'problem',
  'objetivos': 'objectives',
  'glossario': 'glossary',
  'glossrio': 'glossary',
  'terminologia': 'terminology',
  'premissas': 'assumptions',
  'restricoes': 'constraints',
  'restries': 'constraints',
  'stakeholders': 'stakeholders', // OK
  'requisitos': 'requirements',
  'arquitetura': 'architecture',
  'tecnologia': 'technology',
  'pilha': 'stack',
  'padroes': 'standards',
  'padres': 'standards',
  'estrutura': 'structure',
  'arvore': 'tree',
  'seguranca': 'security',
  'desempenho': 'performance',
  'escalabilidade': 'scalability',
  'confiabilidade': 'reliability',
  'conformidade': 'compliance',
  'riscos': 'risks',
  'tecnicos': 'technical',
  'tecnico': 'technical',
  'negocio': 'business',
  'negcios': 'business',
  'infraestrutura': 'infrastructure',
  'dados': 'data',
  'banco': 'database',
  'esquema': 'schema',
  'testes': 'tests',
  'estrategia': 'strategy',
  'estratgia': 'strategy',
  'metadados': 'metadata',
  'indice': 'index',
  'ndice': 'index',
  'decisoes': 'decisions',
  'decises': 'decisions',
  'decisao': 'decision',
  'deciso': 'decision'
};

// Expected standard filenames (architecture)
const STANDARD_FILES = [
  'tech-stack.md',
  'coding-standards.md',
  'source-tree.md',
  'project-structure.md',
  'unified-project-structure.md',
  'testing-strategy.md',
  'database-schema.md',
  'data-models.md',
  'api-design.md',
  'architecture-diagram.md'
];

class FilenameValidator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.errors = [];
    this.warnings = [];
  }

  validateDirectory(dir) {
    if (!fs.existsSync(dir)) {
      this.warnings.push(`Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      if (file === 'index.md') continue; // index.md is always OK

      this.validateFilename(file, dir);
    }
  }

  validateFilename(filename, directory) {
    const basename = path.basename(filename, '.md');

    // Check for Portuguese characters
    if (PORTUGUESE_CHARS.test(basename)) {
      this.errors.push({
        file: path.join(directory, filename),
        issue: 'Contains Portuguese characters (accents)',
        suggestion: this.removeAccents(basename) + '.md'
      });
      return;
    }

    // Check for Portuguese terms
    const lowerBasename = basename.toLowerCase();
    for (const [ptTerm, enTerm] of Object.entries(PORTUGUESE_TERMS)) {
      if (lowerBasename.includes(ptTerm) && !STANDARD_FILES.includes(filename)) {
        const suggested = lowerBasename.replace(new RegExp(ptTerm, 'g'), enTerm);
        this.errors.push({
          file: path.join(directory, filename),
          issue: `Contains Portuguese term: "${ptTerm}"`,
          suggestion: suggested + '.md'
        });
      }
    }
  }

  removeAccents(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  report() {
    console.log('\n📋 AIOS Filename Validation Report\n');
    console.log('=' .repeat(60));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All filenames are valid!\n');
      return true;
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      this.warnings.forEach(warning => {
        console.log(`   ${warning}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors found:\n');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.file}`);
        console.log(`      Issue: ${error.issue}`);
        console.log(`      Suggest: ${error.suggestion}\n`);
      });

      console.log(`\n${this.errors.length} filename(s) need correction.\n`);
      console.log('To fix these issues:');
      console.log('1. Re-run the shard task with updated translation rules');
      console.log('2. Or manually rename the files using the suggestions above');
      console.log('3. Or run: node .aios-core/utils/validate-filenames.js --fix\n');

      return false;
    }

    return true;
  }

  fix() {
    console.log('\n🔧 Fixing filename issues...\n');

    let fixed = 0;
    for (const error of this.errors) {
      const oldPath = error.file;
      const dir = path.dirname(oldPath);
      const newPath = path.join(dir, error.suggestion);

      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
        fixed++;
      } catch (err) {
        console.error(`❌ Failed to rename ${oldPath}: ${err.message}`);
      }
    }

    console.log(`\n✨ Fixed ${fixed} of ${this.errors.length} files.\n`);
  }

  validate() {
    console.log('🔍 Validating documentation filenames...\n');

    // Check docs/architecture/
    const archDir = path.join(this.projectRoot, 'docs', 'architecture');
    console.log(`Checking: ${archDir}`);
    this.validateDirectory(archDir);

    // Check docs/prd/
    const prdDir = path.join(this.projectRoot, 'docs', 'prd');
    console.log(`Checking: ${prdDir}`);
    this.validateDirectory(prdDir);

    return this.report();
  }
}

// Main execution
const projectRoot = process.cwd();
const shouldFix = process.argv.includes('--fix');

const validator = new FilenameValidator(projectRoot);
const isValid = validator.validate();

if (shouldFix && !isValid) {
  validator.fix();
  // Re-validate
  const validator2 = new FilenameValidator(projectRoot);
  validator2.validate();
}

process.exit(isValid ? 0 : 1);
