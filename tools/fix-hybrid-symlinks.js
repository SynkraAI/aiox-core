#!/usr/bin/env node

/**
 * fix-hybrid-symlinks.js
 *
 * Migra projetos HYBRID existentes para incluir symlinks de recursos globais:
 * - .aios/skills → ~/aios-core/skills
 * - .claude/commands → ~/aios-core/.claude/commands
 *
 * Usage:
 *   node tools/fix-hybrid-symlinks.js                    # Escaneia ~/CODE/Projects
 *   node tools/fix-hybrid-symlinks.js --dry-run          # Mostra o que seria feito
 *   node tools/fix-hybrid-symlinks.js --path /custom     # Escaneia path customizado
 *
 * Examples:
 *   node tools/fix-hybrid-symlinks.js --dry-run          # Visualizar impacto
 *   node tools/fix-hybrid-symlinks.js                    # Aplicar migração
 *   node tools/fix-hybrid-symlinks.js --path ~/CODE/Projects/meta-ads-prospector
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const AIOS_CORE_PATH = path.join(os.homedir(), 'aios-core');
const DEFAULT_SCAN_PATH = path.join(os.homedir(), 'CODE', 'Projects');

const SYMLINK_CONFIGS = [
  {
    name: 'skills',
    target: path.join(AIOS_CORE_PATH, '.aios', 'skills'),
    link: '.aios/skills',
    description: '45 skills globais (kaizen, deep-research, etc.)'
  },
  {
    name: 'commands',
    target: path.join(AIOS_CORE_PATH, '.claude', 'commands'),
    link: '.claude/commands',
    description: '30+ slash commands (/oalanicolas, /pedro-valerio, squads)'
  }
];

// ═══════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Detecta projetos HYBRID em um diretório base
 * @param {string} basePath - Diretório para escanear
 * @returns {Promise<string[]>} - Array de paths de projetos HYBRID
 */
async function detectHybridProjects(basePath) {
  const projects = [];

  try {
    const entries = await fs.readdir(basePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const projectPath = path.join(basePath, entry.name);
      const aiosIndexPath = path.join(projectPath, '.aios', 'INDEX.md');

      // Projeto HYBRID tem .aios/INDEX.md
      if (await fs.pathExists(aiosIndexPath)) {
        projects.push(projectPath);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`⚠️  Erro ao escanear ${basePath}:`, err.message);
    }
  }

  return projects;
}

/**
 * Cria symlinks faltantes em um projeto
 * @param {string} projectPath - Path do projeto
 * @param {boolean} dryRun - Se true, não cria symlinks (apenas reporta)
 * @returns {Promise<Object>} - Resultado da operação
 */
async function createMissingSymlinks(projectPath, dryRun = false) {
  const result = {
    project: path.basename(projectPath),
    path: projectPath,
    created: [],
    skipped: [],
    errors: []
  };

  for (const config of SYMLINK_CONFIGS) {
    const linkPath = path.join(projectPath, config.link);

    try {
      // Verificar se symlink já existe
      const exists = await fs.pathExists(linkPath);

      if (exists) {
        const stat = await fs.lstat(linkPath);

        if (stat.isSymbolicLink()) {
          const currentTarget = await fs.readlink(linkPath);
          const resolvedTarget = path.resolve(path.dirname(linkPath), currentTarget);

          if (resolvedTarget === config.target) {
            result.skipped.push({
              link: config.link,
              reason: 'Symlink correto já existe'
            });
            continue;
          } else {
            // Symlink existe mas aponta para lugar errado
            if (!dryRun) {
              await fs.remove(linkPath);
              await fs.symlink(config.target, linkPath);
            }
            result.created.push({
              link: config.link,
              action: dryRun ? 'WOULD_FIX' : 'FIXED',
              previousTarget: resolvedTarget
            });
            continue;
          }
        } else {
          // Existe mas não é symlink (pode ser diretório ou arquivo)
          result.errors.push({
            link: config.link,
            error: 'Path existe mas não é symlink (precisa remoção manual)'
          });
          continue;
        }
      }

      // Symlink não existe, criar
      if (!dryRun) {
        await fs.ensureDir(path.dirname(linkPath)); // Garantir que diretório pai existe
        await fs.symlink(config.target, linkPath);
      }

      result.created.push({
        link: config.link,
        action: dryRun ? 'WOULD_CREATE' : 'CREATED'
      });

    } catch (err) {
      result.errors.push({
        link: config.link,
        error: err.message
      });
    }
  }

  return result;
}

/**
 * Valida que symlinks existem e apontam para targets corretos
 * @param {string} projectPath - Path do projeto
 * @returns {Promise<Object>} - Resultado da validação
 */
async function validateSymlinks(projectPath) {
  const result = {
    project: path.basename(projectPath),
    valid: [],
    invalid: [],
    missing: []
  };

  for (const config of SYMLINK_CONFIGS) {
    const linkPath = path.join(projectPath, config.link);

    try {
      const exists = await fs.pathExists(linkPath);

      if (!exists) {
        result.missing.push({
          link: config.link,
          expectedTarget: config.target
        });
        continue;
      }

      const stat = await fs.lstat(linkPath);

      if (!stat.isSymbolicLink()) {
        result.invalid.push({
          link: config.link,
          reason: 'Não é um symlink'
        });
        continue;
      }

      const currentTarget = await fs.readlink(linkPath);
      const resolvedTarget = path.resolve(path.dirname(linkPath), currentTarget);

      if (resolvedTarget !== config.target) {
        result.invalid.push({
          link: config.link,
          reason: `Aponta para ${resolvedTarget}, esperado ${config.target}`
        });
        continue;
      }

      // Validar que target existe e é acessível
      const targetExists = await fs.pathExists(config.target);

      if (!targetExists) {
        result.invalid.push({
          link: config.link,
          reason: `Target ${config.target} não existe`
        });
        continue;
      }

      // Tentar ler um arquivo de amostra através do symlink
      try {
        const files = await fs.readdir(linkPath);
        result.valid.push({
          link: config.link,
          target: config.target,
          filesCount: files.length
        });
      } catch (readErr) {
        result.invalid.push({
          link: config.link,
          reason: `Symlink existe mas não é legível: ${readErr.message}`
        });
      }

    } catch (err) {
      result.invalid.push({
        link: config.link,
        reason: err.message
      });
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const customPath = args.find(a => a.startsWith('--path='))?.split('=')[1] ||
                     (args.includes('--path') ? args[args.indexOf('--path') + 1] : null);

  console.log(`\n🔧 Fix HYBRID Projects Symlinks\n`);

  if (dryRun) {
    console.log(`⚠️  DRY-RUN Mode: Nenhuma alteração será feita\n`);
  }

  // Determinar path de scan
  const scanPath = customPath ? path.resolve(customPath) : DEFAULT_SCAN_PATH;

  console.log(`📂 Escaneando: ${scanPath}\n`);

  // Verificar se path existe
  if (!await fs.pathExists(scanPath)) {
    console.error(`❌ Path não encontrado: ${scanPath}\n`);
    process.exit(1);
  }

  // Detectar projetos HYBRID
  const stat = await fs.stat(scanPath);
  let projects;

  if (stat.isDirectory()) {
    const aiosIndex = path.join(scanPath, '.aios', 'INDEX.md');
    if (await fs.pathExists(aiosIndex)) {
      // Path é um projeto HYBRID
      projects = [scanPath];
    } else {
      // Path é diretório contendo projetos
      projects = await detectHybridProjects(scanPath);
    }
  } else {
    console.error(`❌ Path deve ser um diretório: ${scanPath}\n`);
    process.exit(1);
  }

  if (projects.length === 0) {
    console.log(`ℹ️  Nenhum projeto HYBRID encontrado em ${scanPath}\n`);
    process.exit(0);
  }

  console.log(`✅ ${projects.length} projeto(s) HYBRID encontrado(s)\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Processar cada projeto
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const projectPath of projects) {
    const result = await createMissingSymlinks(projectPath, dryRun);

    console.log(`📦 ${result.project}`);
    console.log(`   Path: ${result.path}`);

    if (result.created.length > 0) {
      console.log(`   ✅ Symlinks ${dryRun ? 'a criar' : 'criados'}: ${result.created.length}`);
      result.created.forEach(item => {
        const emoji = item.action.includes('CREATE') ? '🔗' : '🔄';
        console.log(`      ${emoji} ${item.link} ${item.action === 'FIXED' ? `(corrigido de ${item.previousTarget})` : ''}`);
      });
      totalCreated += result.created.length;
    }

    if (result.skipped.length > 0) {
      console.log(`   ⏭️  Já existem: ${result.skipped.length}`);
      totalSkipped += result.skipped.length;
    }

    if (result.errors.length > 0) {
      console.log(`   ❌ Erros: ${result.errors.length}`);
      result.errors.forEach(item => {
        console.log(`      ⚠️  ${item.link}: ${item.error}`);
      });
      totalErrors += result.errors.length;
    }

    console.log(``);
  }

  // Sumário final
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📊 Sumário:\n`);
  console.log(`   Projetos processados: ${projects.length}`);
  console.log(`   Symlinks ${dryRun ? 'a criar' : 'criados'}: ${totalCreated}`);
  console.log(`   Symlinks já existentes: ${totalSkipped}`);
  if (totalErrors > 0) {
    console.log(`   ⚠️  Erros encontrados: ${totalErrors}`);
  }

  if (dryRun && totalCreated > 0) {
    console.log(`\n💡 Execute sem --dry-run para aplicar as mudanças\n`);
  } else if (!dryRun && totalCreated > 0) {
    console.log(`\n🎉 Migração completa! Validando symlinks...\n`);

    // Validar todos os projetos
    for (const projectPath of projects) {
      const validation = await validateSymlinks(projectPath);
      const allValid = validation.valid.length === SYMLINK_CONFIGS.length &&
                      validation.invalid.length === 0 &&
                      validation.missing.length === 0;

      const status = allValid ? '✅' : '⚠️';
      console.log(`${status} ${validation.project}: ${validation.valid.length}/${SYMLINK_CONFIGS.length} symlinks válidos`);
    }

    console.log(`\n✅ Todos os projetos agora têm acesso aos recursos globais AIOS!\n`);
  } else {
    console.log(`\n✅ Nenhuma ação necessária\n`);
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════

main().catch((err) => {
  console.error('\n❌ Erro fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
