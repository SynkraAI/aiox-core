#!/usr/bin/env node
/**
 * Validate Skills Symlink
 *
 * Verifica se um projeto HYBRID tem acesso correto às skills globais do AIOS.
 * Uso: node tools/validate-skills-symlink.js [project-path]
 *
 * Se nenhum path for fornecido, usa o cwd.
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const projectPath = args[0] ? path.resolve(args[0]) : process.cwd();
const aioscorePath = path.join(require('os').homedir(), 'aios-core');

console.log('🔍 Validando skills symlink...\n');
console.log(`📁 Projeto: ${projectPath}`);
console.log(`🏠 AIOS Core: ${aioscorePath}\n`);

let exitCode = 0;

// Check 1: .aios/ directory exists
const aiosDir = path.join(projectPath, '.aios');
if (!fs.existsSync(aiosDir)) {
  console.error('❌ Diretório .aios/ não encontrado');
  console.error('   Este projeto não parece ser HYBRID.\n');
  process.exit(1);
}
console.log('✅ Diretório .aios/ existe');

// Check 2: skills symlink exists
const skillsSymlink = path.join(aiosDir, 'skills');
if (!fs.existsSync(skillsSymlink)) {
  console.error('❌ Symlink .aios/skills não encontrado');
  console.error('   Execute: cd .aios && ln -s ~/aios-core/skills skills\n');
  process.exit(1);
}
console.log('✅ Symlink .aios/skills existe');

// Check 3: symlink points to correct target
const stats = fs.lstatSync(skillsSymlink);
if (!stats.isSymbolicLink()) {
  console.error('❌ .aios/skills não é um symlink');
  console.error('   Remova e crie novamente: ln -s ~/aios-core/skills .aios/skills\n');
  exitCode = 1;
} else {
  const linkTarget = fs.readlinkSync(skillsSymlink);
  const expectedTarget = path.join(aioscorePath, '.aios/skills');
  const resolvedTarget = path.resolve(aiosDir, linkTarget);

  if (resolvedTarget !== expectedTarget) {
    console.warn(`⚠️  Symlink aponta para: ${linkTarget}`);
    console.warn(`   Esperado: ${expectedTarget}`);
    exitCode = 1;
  } else {
    console.log(`✅ Symlink aponta para: ${linkTarget}`);
  }
}

// Check 4: target directory exists and is readable
if (!fs.existsSync(skillsSymlink)) {
  console.error('❌ Destino do symlink não existe ou não é acessível');
  console.error('   Verifique se ~/aios-core/skills existe\n');
  process.exit(1);
}
console.log('✅ Destino do symlink é acessível');

// Check 5: count skills
try {
  const skills = fs.readdirSync(skillsSymlink).filter(name => {
    const skillPath = path.join(skillsSymlink, name);
    return fs.statSync(skillPath).isDirectory();
  });

  console.log(`✅ ${skills.length} skills disponíveis\n`);

  // Check for specific expected skills
  const expectedSkills = ['tech-search', 'god-mode', 'synapse', 'app-builder'];
  const missingSkills = expectedSkills.filter(skill => !skills.includes(skill));

  if (missingSkills.length > 0) {
    console.warn('⚠️  Skills esperadas não encontradas:');
    missingSkills.forEach(skill => console.warn(`   - ${skill}`));
    console.warn('');
    exitCode = 1;
  } else {
    console.log('✅ Skills principais encontradas:');
    expectedSkills.forEach(skill => console.log(`   - ${skill}`));
    console.log('');
  }

  // List first 10 skills
  console.log('📋 Primeiras 10 skills disponíveis:');
  skills.slice(0, 10).forEach((skill, i) => {
    console.log(`   ${i + 1}. ${skill}`);
  });
  if (skills.length > 10) {
    console.log(`   ... e mais ${skills.length - 10} skills\n`);
  } else {
    console.log('');
  }

} catch (err) {
  console.error('❌ Erro ao ler skills:', err.message);
  exitCode = 1;
}

// Final status
if (exitCode === 0) {
  console.log('🎉 Validação completa! Skills globais estão acessíveis.\n');
  console.log('💡 Para usar as skills:');
  console.log('   1. Reinicie o Claude Code neste projeto');
  console.log('   2. Digite / para ver o autocomplete de skills\n');
} else {
  console.log('⚠️  Validação completa com avisos. Verifique os itens acima.\n');
}

process.exit(exitCode);
