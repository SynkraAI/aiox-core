#!/usr/bin/env node
/**
 * Settings Format Validator
 *
 * Valida e corrige automaticamente o formato de .claude/settings.json
 * em projetos HYBRID para prevenir erro "Expected record, but received array".
 *
 * Problema comum:
 *   ❌ "hooks": []  (array - formato antigo)
 *   ✅ "hooks": {}  (objeto - formato correto)
 *
 * Execução:
 *   - Via hook SessionStart (automático)
 *   - Manualmente: node .claude/hooks/validate-settings-format.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Valida e corrige o formato do settings.json
 * @param {string} settingsPath - Caminho completo para settings.json
 * @returns {boolean} - true se arquivo está válido/foi corrigido, false se erro
 */
function validateAndFixSettings(settingsPath) {
  if (!fs.existsSync(settingsPath)) {
    return true; // Arquivo não existe, tudo bem
  }

  try {
    const content = fs.readFileSync(settingsPath, 'utf8');
    const settings = JSON.parse(content);

    // Verifica se hooks é array (formato errado)
    if (Array.isArray(settings.hooks)) {
      console.error(`${RED}✗ ERRO:${RESET} ${settingsPath}`);
      console.error(`  ${YELLOW}hooks${RESET} está como array [] (formato antigo)`);
      console.error(`  ${GREEN}Corrigindo para objeto {}...${RESET}`);

      // Corrige: converte array vazio para objeto vazio
      settings.hooks = {};

      // Salva arquivo corrigido
      fs.writeFileSync(
        settingsPath,
        JSON.stringify(settings, null, 2) + '\n',
        'utf8'
      );

      console.log(`${GREEN}✓ Corrigido!${RESET} hooks agora é objeto {}\n`);
      return true;
    }

    // Formato já está correto
    return true;
  } catch (error) {
    console.error(`${RED}✗ ERRO ao validar ${settingsPath}:${RESET}`);
    console.error(`  ${error.message}\n`);
    return false;
  }
}

/**
 * Detecta projetos HYBRID e valida seus settings.json
 */
function validateAllProjects() {
  const results = {
    checked: 0,
    fixed: 0,
    errors: 0
  };

  // 1. Valida aios-core
  const aioscoreSettings = path.join(__dirname, '..', 'settings.json');
  results.checked++;
  if (!validateAndFixSettings(aioscoreSettings)) {
    results.errors++;
  }

  // 2. Detecta projetos HYBRID
  const hybridProjects = [];

  // Procura em ~/CODE/Projects/
  const codeProjectsDir = path.join(process.env.HOME, 'CODE', 'Projects');
  if (fs.existsSync(codeProjectsDir)) {
    const projects = fs.readdirSync(codeProjectsDir, { withFileTypes: true });
    for (const project of projects) {
      if (project.isDirectory()) {
        const projectPath = path.join(codeProjectsDir, project.name);
        const aiosIndexPath = path.join(projectPath, '.aios', 'INDEX.md');
        if (fs.existsSync(aiosIndexPath)) {
          hybridProjects.push(projectPath);
        }
      }
    }
  }

  // 3. Valida settings.json de cada projeto HYBRID
  for (const projectPath of hybridProjects) {
    const settingsPath = path.join(projectPath, '.claude', 'settings.json');
    results.checked++;

    if (fs.existsSync(settingsPath)) {
      const beforeSize = fs.readFileSync(settingsPath, 'utf8');
      const valid = validateAndFixSettings(settingsPath);
      const afterSize = fs.readFileSync(settingsPath, 'utf8');

      if (!valid) {
        results.errors++;
      } else if (beforeSize !== afterSize) {
        results.fixed++;
      }
    }
  }

  return results;
}

/**
 * Main execution
 */
function playRandomBanner() {
  const bannersDir = path.join(__dirname, '..', '..', 'banners');
  try {
    const files = fs.readdirSync(bannersDir)
      .filter(f => f.endsWith('.sh'));
    if (files.length === 0) return;
    const picked = files[Math.floor(Math.random() * files.length)];
    const bannerPath = path.join(bannersDir, picked);
    execSync(`bash "${bannerPath}"`, { stdio: 'inherit', timeout: 4500 });
  } catch {
    // Banner failed or timed out — not critical, continue
  }
}

function main() {
  playRandomBanner();

  const results = validateAllProjects();

  if (results.fixed > 0) {
    console.log(`${YELLOW}⚠ Settings corrigidos: ${results.fixed} arquivo(s)${RESET}`);
  }

  if (results.errors > 0) {
    console.log(`${RED}✗ Erros: ${results.errors}${RESET}`);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { validateAndFixSettings, validateAllProjects };
