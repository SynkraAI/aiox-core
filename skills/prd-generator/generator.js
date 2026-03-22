#!/usr/bin/env node

/**
 * PRD Generator Skill
 *
 * Generates professional Product Requirements Documents from app ideas
 *
 * @version 1.0.0
 * @author AIOS Core
 */

const readline = require('readline');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

class PRDGenerator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.data = {};
  }

  /**
   * Ask user for input
   */
  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Log with color
   */
  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Collect app information
   */
  async collectInformation(mode = 'quick') {
    this.log('\n📝 Vamos criar o PRD do seu app!\n', 'cyan');
    this.log('Responda as perguntas abaixo (deixe em branco para pular):\n', 'gray');

    // Essential questions (always asked)
    this.data.appName = await this.prompt('1️⃣  Nome do app: ');
    this.data.problem = await this.prompt('2️⃣  Que problema ele resolve? ');
    this.data.target = await this.prompt('3️⃣  Quem é o público-alvo? ');
    this.data.features = await this.prompt('4️⃣  3 principais funcionalidades (separadas por vírgula): ');
    this.data.competitor = await this.prompt('5️⃣  Existe competidor similar? Qual? ');
    this.data.platform = await this.prompt('6️⃣  Plataforma (Web/Mobile/Desktop/Todos): ');
    this.data.tech = await this.prompt('7️⃣  Tecnologias específicas em mente? ');
    this.data.special = await this.prompt('8️⃣  Requisitos especiais? (tempo real, offline, etc): ');

    if (mode === 'complete') {
      this.log('\n📊 Modo completo - Perguntas adicionais:\n', 'blue');
      this.data.businessModel = await this.prompt('9️⃣  Modelo de negócio? (SaaS, Marketplace, etc): ');
      this.data.monetization = await this.prompt('🔟 Como vai monetizar? ');
      this.data.marketSize = await this.prompt('1️⃣1️⃣ Estimativa de tamanho de mercado? ');
      this.data.timeline = await this.prompt('1️⃣2️⃣ Timeline desejado para MVP? ');
      this.data.budget = await this.prompt('1️⃣3️⃣ Budget aproximado? ');
      this.data.team = await this.prompt('1️⃣4️⃣ Tamanho da equipe? ');
    }

    this.log('\n✅ Informações coletadas!\n', 'green');
  }

  /**
   * Display collected data
   */
  displaySummary() {
    this.log('📋 Resumo das Informações:', 'cyan');
    this.log('═══════════════════════════════════════\n', 'gray');

    const essentialData = {
      'App': this.data.appName || 'Não informado',
      'Problema': this.data.problem || 'Não informado',
      'Público-alvo': this.data.target || 'Não informado',
      'Funcionalidades': this.data.features || 'Não informado',
      'Competidor': this.data.competitor || 'Nenhum',
      'Plataforma': this.data.platform || 'Não informado',
      'Tecnologias': this.data.tech || 'A definir',
      'Requisitos especiais': this.data.special || 'Nenhum',
    };

    for (const [key, value] of Object.entries(essentialData)) {
      this.log(`${key}: ${value}`, 'blue');
    }

    this.log('\n═══════════════════════════════════════\n', 'gray');
  }

  /**
   * Main execution
   */
  async run() {
    try {
      this.log('\n📄 PRD Generator v1.0.0\n', 'magenta');

      // Ask for mode
      const modeInput = await this.prompt('Modo: (1) Rápido ou (2) Completo? [1]: ');
      const mode = modeInput === '2' ? 'complete' : 'quick';

      // Collect information
      await this.collectInformation(mode);

      // Display summary
      this.displaySummary();

      // Confirm
      const confirm = await this.prompt('Gerar PRD com essas informações? (s/n): ');

      if (confirm.toLowerCase() !== 's') {
        this.log('❌ Operação cancelada', 'yellow');
        this.rl.close();
        return null;
      }

      this.log('\n🎯 Gerando PRD completo...', 'cyan');
      this.log('📝 Aguarde o Claude processar as informações\n', 'gray');

      this.rl.close();

      // Return data for Claude to process
      return {
        mode,
        data: this.data,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.log(`\n❌ Erro: ${error.message}`, 'red');
      this.rl.close();
      throw error;
    }
  }
}

// Execute if called directly
if (require.main === module) {
  const generator = new PRDGenerator();
  generator.run()
    .then(result => {
      if (result) {
        console.log('\n✅ Dados coletados com sucesso!');
        console.log('\n📋 O Claude agora irá gerar o PRD completo...\n');
      }
    })
    .catch(error => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = PRDGenerator;
