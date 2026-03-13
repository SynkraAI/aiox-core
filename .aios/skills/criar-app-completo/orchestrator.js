#!/usr/bin/env node

/**
 * Criar App Completo - Orchestrator
 *
 * End-to-end workflow: Ideia → PRD → Arquivo Obsidian → App Preenchido
 *
 * @version 1.0.0
 * @author AIOS Core
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

class AppCompleto {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || 'quick',
      silent: options.silent || false,
      silentIdea: options.silentIdea || null,
      template: options.template || null,
      obsidianPath: options.obsidianPath || null,
    };

    this.vaultPath = null;
    this.appsFolder = null;
    this.templatePath = null;
  }

  /**
   * Log with color
   */
  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Load Obsidian configuration
   */
  loadObsidianConfig() {
    const configPath = path.join(process.cwd(), '.aios', 'config', 'obsidian.json');

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      this.vaultPath = config.vaultPath;
      this.appsFolder = config.appsFolder || 'APPS para Criar';
      this.templatePath = config.templatePath || '+Templates/Template para novo App.md';
    } else {
      // Default paths for macOS Obsidian
      this.vaultPath = '/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc';
      this.appsFolder = 'APPS para Criar';
      this.templatePath = '+Templates/Template para novo App.md';
    }

    // Override with options if provided
    if (this.options.obsidianPath) {
      this.vaultPath = this.options.obsidianPath;
    }

    this.log(`📂 Vault: ${this.vaultPath}`, 'gray');
    this.log(`📁 Apps Folder: ${this.appsFolder}`, 'gray');
    this.log(`📄 Template: ${this.templatePath}\n`, 'gray');
  }

  /**
   * Step 1: Generate PRD
   */
  async generatePRD() {
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    this.log('  PASSO 1: Gerar PRD', 'cyan');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    if (this.options.silent && this.options.silentIdea) {
      this.log('🤖 Modo silencioso: gerando PRD automaticamente...', 'blue');

      // Parse silent idea into structured data
      const data = {
        appName: this.extractAppName(this.options.silentIdea),
        problem: this.options.silentIdea,
        target: 'A definir',
        features: 'A definir',
        platform: 'Web',
        tech: 'A definir',
      };

      return {
        mode: 'silent',
        data,
        timestamp: new Date().toISOString(),
      };
    }

    // Run PRD generator script
    const generatorPath = path.join(__dirname, '..', 'prd-generator', 'generator.js');

    try {
      execSync(`node ${generatorPath}`, { stdio: 'inherit' });

      // Script should have saved data to temp file
      const tempPath = path.join(process.cwd(), '.aios', 'tmp', 'prd-data.json');

      if (fs.existsSync(tempPath)) {
        const data = JSON.parse(fs.readFileSync(tempPath, 'utf-8'));
        return data;
      } else {
        throw new Error('PRD generator não salvou dados');
      }
    } catch (error) {
      this.log(`\n❌ Erro ao gerar PRD: ${error.message}`, 'red');
      throw error;
    }
  }

  /**
   * Extract app name from idea
   */
  extractAppName(idea) {
    // Try to find app name in idea
    const patterns = [
      /app (?:de |para )?([^,.]+)/i,
      /sistema (?:de |para )?([^,.]+)/i,
      /plataforma (?:de |para )?([^,.]+)/i,
      /clone (?:do |de |da )?([^,.]+)/i,
    ];

    for (const pattern of patterns) {
      const match = idea.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Novo App';
  }

  /**
   * Step 2: Create Obsidian file
   */
  createObsidianFile(prdData, prdContent) {
    this.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    this.log('  PASSO 2: Criar Arquivo no Obsidian', 'cyan');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    const appName = prdData.data.appName || 'Novo App';
    const sanitizedName = appName.replace(/[/\\?%*:|"<>]/g, '-');

    const appFilePath = path.join(this.vaultPath, this.appsFolder, `${sanitizedName}.md`);
    const templateFullPath = path.join(this.vaultPath, this.templatePath);

    // Read template
    if (!fs.existsSync(templateFullPath)) {
      throw new Error(`Template não encontrado: ${templateFullPath}`);
    }

    let template = fs.readFileSync(templateFullPath, 'utf-8');

    // Replace title
    template = template.replace(/# {{TITLE}}/, `# ${appName}`);

    // Insert PRD
    const prdSection = template.match(/# PRD DO APP[\s\S]*?```+\n\n```+/);
    if (prdSection) {
      const replacement = `# PRD DO APP\n(Colocar aqui o PRD completo do app, que a IA irá preencher tudo abaixo automaticamente)\n\`\`\`\`\`\`\`\n\n${prdContent}\n\n\`\`\`\`\`\`\``;
      template = template.replace(prdSection[0], replacement);
    }

    // Ensure directory exists
    const appDir = path.dirname(appFilePath);
    fs.mkdirSync(appDir, { recursive: true });

    // Write file
    fs.writeFileSync(appFilePath, template, 'utf-8');

    this.log(`✅ Arquivo criado: ${sanitizedName}.md`, 'green');
    this.log(`📍 Local: ${appFilePath}\n`, 'gray');

    return appFilePath;
  }

  /**
   * Step 3: Fill app automatically
   */
  async fillApp(appFilePath) {
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    this.log('  PASSO 3: Preencher App Automaticamente', 'cyan');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    this.log('🤖 O Claude irá processar e preencher todas as seções...', 'blue');
    this.log('📋 Aguarde enquanto o PRD é analisado e o app é estruturado\n', 'gray');

    // Save path for Claude to use
    const taskData = {
      filePath: appFilePath,
      timestamp: new Date().toISOString(),
      mode: 'auto-fill',
    };

    const tempPath = path.join(process.cwd(), '.aios', 'tmp', 'app-filler-task.json');
    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.writeFileSync(tempPath, JSON.stringify(taskData, null, 2));

    this.log('✅ Dados preparados para Claude processar', 'green');
    this.log(`📍 Task file: ${tempPath}\n`, 'gray');

    return taskData;
  }

  /**
   * Main execution
   */
  async run() {
    try {
      this.log('\n🚀 Criar App Completo v1.0.0\n', 'magenta');
      this.log('Workflow: Ideia → PRD → Obsidian → App Preenchido\n', 'cyan');

      // Load configuration
      this.loadObsidianConfig();

      // Step 1: Generate PRD
      const prdData = await this.generatePRD();

      // At this point, Claude should have generated full PRD
      // For now, we'll create a placeholder
      const prdContent = `[PRD será gerado pelo Claude com base nos dados coletados]

Dados fornecidos:
${JSON.stringify(prdData.data, null, 2)}`;

      // Step 2: Create Obsidian file
      const appFilePath = this.createObsidianFile(prdData, prdContent);

      // Step 3: Prepare for auto-fill
      const taskData = await this.fillApp(appFilePath);

      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
      this.log('  ✅ WORKFLOW PREPARADO', 'green');
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'green');

      this.log('📱 App criado:', 'blue');
      this.log(`   ${prdData.data.appName || 'Novo App'}`, 'cyan');
      this.log(`   ${appFilePath}\n`, 'gray');

      this.log('🎯 Próximo passo:', 'yellow');
      this.log('   O Claude irá:', 'gray');
      this.log('   1. Gerar PRD completo (20 seções)', 'gray');
      this.log('   2. Analisar e extrair requisitos', 'gray');
      this.log('   3. Preencher todas as seções do app', 'gray');
      this.log('   4. Configurar metadados (prioridade, complexidade)', 'gray');
      this.log('   5. Gerar roadmap e checklists\n', 'gray');

      return {
        success: true,
        prdData,
        appFilePath,
        taskData,
      };

    } catch (error) {
      this.log(`\n❌ Erro: ${error.message}`, 'red');
      throw error;
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'quick',
    silent: false,
    silentIdea: null,
    template: null,
    obsidianPath: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mode=complete') {
      options.mode = 'complete';
    } else if (arg === '--mode=quick') {
      options.mode = 'quick';
    } else if (arg === '--silent' && args[i + 1]) {
      options.silent = true;
      options.silentIdea = args[i + 1];
      i++;
    } else if (arg.startsWith('--template=')) {
      options.template = arg.split('=')[1];
    } else if (arg.startsWith('--vault=')) {
      options.obsidianPath = arg.split('=')[1];
    }
  }

  return options;
}

// Execute if called directly
if (require.main === module) {
  const options = parseArgs();
  const orchestrator = new AppCompleto(options);

  orchestrator.run()
    .then(result => {
      console.log('\n✅ Orchestrator finalizado com sucesso!');
      console.log('\n🤖 Agora o Claude irá completar o processo...\n');
    })
    .catch(error => {
      console.error('\n❌ Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = AppCompleto;
