<!-- Tradução: PT-BR | Original: /docs/en/architecture/hcs-check-specifications.md | Sincronização: 2026-01-26 -->

# Especificações de Verificação do HCS

> 🌐 [EN](../../architecture/hcs-check-specifications.md) | **PT** | [ES](../../es/architecture/hcs-check-specifications.md)

---

**Versão:** 1.0
**Status:** Proposto
**Criado:** 2025-12-30
**Story:** Investigação HCS-1
**Autor:** @architect (Aria) via @dev (Dex)

---

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Verificação](#arquitetura-de-verificação)
- [Domínio 1: Coerência do Projeto](#domínio-1-coerência-do-projeto)
- [Domínio 2: Ambiente Local](#domínio-2-ambiente-local)
- [Domínio 3: Saúde do Repositório](#domínio-3-saúde-do-repositório)
- [Domínio 4: Ambiente de Implantação](#domínio-4-ambiente-de-implantação)
- [Domínio 5: Integração de Serviços](#domínio-5-integração-de-serviços)
- [Matriz de Verificação IDE/CLI](#matriz-de-verificação-idecli)
- [Extensão de Verificação Customizada](#extensão-de-verificação-customizada)
- [Considerações de Performance](#considerações-de-performance)

---

## Visão Geral

O Sistema de Verificação de Saúde (HCS) realiza verificações diagnósticas em 5 domínios, totalizando mais de 33 verificações individuais. Cada verificação possui:

- **ID Único:** Para rastreamento e relatórios
- **Severidade:** CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Nível de Auto-Recuperação:** 1 (silencioso), 2 (com confirmação), 3 (guia manual), N/A
- **Modo:** quick (apenas verificações rápidas), full (todas as verificações)
- **Duração Alvo:** Tempo de execução esperado

### Resumo da Contagem de Verificações

| Domínio                 | Total de Verificações | Modo Rápido | Modo Completo |
| ----------------------- | --------------------- | ----------- | ------------- |
| Coerência do Projeto    | 8                     | 4           | 8             |
| Ambiente Local          | 8                     | 5           | 8             |
| Saúde do Repositório    | 8                     | 3           | 8             |
| Ambiente de Implantação | 5                     | 2           | 5             |
| Integração de Serviços  | 4                     | 4           | 4             |
| **Total**               | **33**                | **18**      | **33**        |

---

## Arquitetura de Verificação

### Decisão de Arquitetura: Padrão Híbrido

Baseado em pesquisa da indústria, o HCS usa uma **arquitetura híbrida** combinando:

1. **Verificações baseadas em código** para funcionalidade core (performance, lógica complexa)
2. **Verificações baseadas em YAML** para extensibilidade (verificações customizadas, específicas do projeto)

```
┌─────────────────────────────────────────────────────────────┐
│                    Motor de Health Check                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │ Verificações Core   │    │ Verificações Custom │        │
│  │      (JS)           │    │      (YAML)         │        │
│  │                     │    │                     │        │
│  │  • Coerência Projeto│    │  • Específicas proj │        │
│  │  • Ambiente Local   │    │  • Convenções equipe│        │
│  │  • Saúde Repositório│    │  • Testes integração│        │
│  └──────────┬──────────┘    └───────────┬─────────┘        │
│             │                           │                   │
│             └───────────┬───────────────┘                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Executor de Verificações            │  │
│  │  • Execução paralela    • Cache                      │  │
│  │  • Tratamento timeout   • Agregação de resultados    │  │
│  └───────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Auto-Recuperação                    │  │
│  │  Nível 1 → Auto   Nível 2 → Confirmar   Nível 3 → Guia│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Interface de Verificação

```javascript
// Interface core de verificação (JavaScript)
class BaseCheck {
  constructor(options) {
    this.id = options.id; // ex: "PC-001"
    this.name = options.name; // Nome legível por humanos
    this.domain = options.domain; // project | local | repo | deploy | services
    this.severity = options.severity; // CRITICAL | HIGH | MEDIUM | LOW | INFO
    this.tier = options.tier; // 1 | 2 | 3 | null
    this.mode = options.mode; // quick | full
    this.timeout = options.timeout || 5000; // ms
  }

  // Sobrescrever na subclasse
  async check(context) {
    // Retorna { passed: boolean, message: string, details?: any }
    throw new Error('Não implementado');
  }

  // Opcional: lógica de recuperação
  async heal(context) {
    return { healed: false, message: 'Nenhuma correção automática disponível' };
  }
}
```

```yaml
# Definição de verificação customizada (YAML)
id: CUSTOM-001
name: Verificação de convenções de código da equipe
domain: project
severity: LOW
tier: 3
mode: full
timeout: 3000

check:
  type: file-pattern
  pattern: 'src/**/*.ts'
  rule: no-console-log
  message: 'Declarações console.log encontradas em código de produção'

heal:
  type: manual-guide
  steps:
    - 'Remover declarações console.log ou usar logging apropriado'
    - 'Executar: eslint --fix src/'
```

---

## Domínio 1: Coerência do Projeto

**Propósito:** Verificar se os arquivos do framework AIOX estão corretamente configurados e consistentes.

### Verificações

| ID     | Nome                           | Severidade | Nível | Modo  | Timeout | Descrição                                            |
| ------ | ------------------------------ | ---------- | ----- | ----- | ------- | ---------------------------------------------------- |
| PC-001 | Config existe                  | CRITICAL   | 1     | quick | 100ms   | `.aiox/config.yaml` existe e é YAML válido           |
| PC-002 | Referências de agentes válidas | HIGH       | 3     | full  | 2s      | Tarefas referenciam agentes existentes               |
| PC-003 | Coding standards existe        | MEDIUM     | 2     | full  | 100ms   | `docs/framework/coding-standards.md` existe          |
| PC-004 | Tech stack existe              | MEDIUM     | 2     | full  | 100ms   | `docs/framework/tech-stack.md` existe                |
| PC-005 | Source tree existe             | MEDIUM     | 2     | full  | 100ms   | `docs/framework/source-tree.md` existe               |
| PC-006 | Sem arquivos órfãos            | LOW        | 3     | full  | 5s      | Todos os arquivos em `.aiox-core/` são referenciados |
| PC-007 | Manifestos válidos             | HIGH       | 3     | quick | 1s      | Todos os manifestos YAML parseiam corretamente       |
| PC-008 | Caminhos de templates válidos  | MEDIUM     | 3     | full  | 2s      | Templates referenciam arquivos existentes            |

### Detalhes de Implementação

```javascript
// PC-001: Config existe
class ConfigExistsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'PC-001',
      name: 'Config existe',
      domain: 'project',
      severity: 'CRITICAL',
      tier: 1,
      mode: 'quick',
      timeout: 100,
    });
  }

  async check(context) {
    const configPath = path.join(context.projectRoot, '.aiox', 'config.yaml');

    if (!(await fs.pathExists(configPath))) {
      return {
        passed: false,
        message: '.aiox/config.yaml não encontrado',
        autoFixAvailable: true,
      };
    }

    try {
      const content = await fs.readFile(configPath, 'utf8');
      yaml.parse(content);
      return { passed: true, message: 'Arquivo de config válido' };
    } catch (error) {
      return {
        passed: false,
        message: `YAML inválido: ${error.message}`,
        autoFixAvailable: true,
      };
    }
  }

  async heal(context) {
    const templatePath = '.aiox-core/infrastructure/templates/core-config/config-template.yaml';
    const configPath = path.join(context.projectRoot, '.aiox', 'config.yaml');

    await fs.ensureDir(path.dirname(configPath));
    await fs.copy(templatePath, configPath);

    return { healed: true, message: 'Config recriado a partir do template' };
  }
}
```

---

## Domínio 2: Ambiente Local

**Propósito:** Verificar se o ambiente de desenvolvimento está corretamente configurado.

### Verificações

| ID     | Nome                       | Severidade | Nível | Modo  | Timeout | Descrição                               |
| ------ | -------------------------- | ---------- | ----- | ----- | ------- | --------------------------------------- |
| LE-001 | Versão do Node.js          | CRITICAL   | 3     | quick | 500ms   | Node.js 18+ instalado                   |
| LE-002 | Gerenciador de pacotes     | CRITICAL   | 3     | quick | 500ms   | npm/yarn/pnpm disponível                |
| LE-003 | Git configurado            | CRITICAL   | 3     | quick | 500ms   | Git instalado com config de usuário     |
| LE-004 | GitHub CLI autenticado     | HIGH       | 3     | full  | 2s      | `gh auth status` passa                  |
| LE-005 | MCPs respondendo           | HIGH       | 1     | quick | 5s      | Servidores MCP estão saudáveis          |
| LE-006 | CLAUDE.md válido           | MEDIUM     | 2     | quick | 500ms   | Seções obrigatórias presentes           |
| LE-007 | Regras da IDE configuradas | LOW        | 2     | full  | 1s      | Regras VS Code/Cursor existem           |
| LE-008 | Vars de ambiente definidas | HIGH       | 3     | full  | 500ms   | Vars de ambiente obrigatórias definidas |

### Detalhes de Implementação

```javascript
// LE-001: Verificação de versão do Node.js
class NodeVersionCheck extends BaseCheck {
  constructor() {
    super({
      id: 'LE-001',
      name: 'Versão do Node.js',
      domain: 'local',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'quick',
      timeout: 500,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('node', ['--version']);
      const version = stdout.trim().replace('v', '');
      const major = parseInt(version.split('.')[0], 10);

      if (major >= 18) {
        return {
          passed: true,
          message: `Node.js ${version} instalado`,
          details: { version, major },
        };
      }

      return {
        passed: false,
        message: `Node.js ${version} está abaixo do mínimo (18.0.0)`,
        guide: {
          title: 'Atualizar Node.js',
          steps: [
            'Visite https://nodejs.org/en/download/',
            'Baixe Node.js 18 LTS ou superior',
            'Execute o instalador',
            'Reinicie seu terminal',
          ],
        },
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Node.js não encontrado',
        guide: {
          title: 'Instalar Node.js',
          steps: [
            'Visite https://nodejs.org/en/download/',
            'Baixe Node.js 18 LTS',
            'Execute o instalador',
            'Verifique com: node --version',
          ],
        },
      };
    }
  }
}

// LE-005: Verificação de saúde do MCP
class McpHealthCheck extends BaseCheck {
  constructor() {
    super({
      id: 'LE-005',
      name: 'MCPs respondendo',
      domain: 'local',
      severity: 'HIGH',
      tier: 1,
      mode: 'quick',
      timeout: 5000,
    });
  }

  async check(context) {
    const mcpConfig = await this.loadMcpConfig();
    const results = [];

    for (const [name, config] of Object.entries(mcpConfig.mcpServers || {})) {
      try {
        const healthy = await this.pingMcp(name, config);
        results.push({ name, healthy, error: null });
      } catch (error) {
        results.push({ name, healthy: false, error: error.message });
      }
    }

    const unhealthy = results.filter((r) => !r.healthy);

    if (unhealthy.length === 0) {
      return {
        passed: true,
        message: `Todos os ${results.length} MCPs saudáveis`,
        details: { mcps: results },
      };
    }

    return {
      passed: false,
      message: `${unhealthy.length}/${results.length} MCPs não saudáveis`,
      details: { mcps: results },
      autoFixAvailable: true,
    };
  }

  async heal(context) {
    // Tentar reiniciar MCPs não saudáveis
    const unhealthy = context.details.mcps.filter((m) => !m.healthy);

    for (const mcp of unhealthy) {
      try {
        await this.restartMcp(mcp.name);
        console.log(`  Reiniciado: ${mcp.name}`);
      } catch (error) {
        console.error(`  Falha ao reiniciar ${mcp.name}: ${error.message}`);
      }
    }

    return { healed: true, message: 'MCPs não saudáveis reiniciados' };
  }
}
```

---

## Domínio 3: Saúde do Repositório

**Propósito:** Verificar a saúde do repositório Git e integração com GitHub.

### Verificações

| ID     | Nome                     | Severidade | Nível | Modo  | Timeout | Descrição                                            |
| ------ | ------------------------ | ---------- | ----- | ----- | ------- | ---------------------------------------------------- |
| RH-001 | Workflows válidos        | HIGH       | 3     | full  | 2s      | YAML do GitHub Actions é válido                      |
| RH-002 | Sem workflows falhando   | MEDIUM     | 3     | full  | 5s      | Últimos 10 workflows passaram                        |
| RH-003 | Proteção de branch       | MEDIUM     | 3     | full  | 2s      | Branch principal está protegido                      |
| RH-004 | Secrets configurados     | HIGH       | 3     | full  | 2s      | Secrets obrigatórios existem                         |
| RH-005 | Sem PRs obsoletos        | LOW        | 3     | full  | 3s      | Nenhum PR com mais de 30 dias                        |
| RH-006 | Dependências atualizadas | MEDIUM     | 2     | full  | 5s      | Nenhuma dep desatualizada com problemas de segurança |
| RH-007 | Sem vulnerabilidades     | CRITICAL   | 3     | quick | 10s     | `npm audit` passa                                    |
| RH-008 | Gitignore completo       | LOW        | 1     | quick | 100ms   | Padrões obrigatórios em .gitignore                   |

### Detalhes de Implementação

```javascript
// RH-007: Verificação de vulnerabilidades de segurança
class VulnerabilityCheck extends BaseCheck {
  constructor() {
    super({
      id: 'RH-007',
      name: 'Sem vulnerabilidades',
      domain: 'repository',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'quick',
      timeout: 10000,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('npm', ['audit', '--json'], {
        cwd: context.projectRoot,
      });

      const audit = JSON.parse(stdout);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};

      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;

      if (critical === 0 && high === 0) {
        return {
          passed: true,
          message: 'Nenhuma vulnerabilidade crítica ou alta',
          details: { vulnerabilities },
        };
      }

      return {
        passed: false,
        message: `Encontradas ${critical} críticas, ${high} altas vulnerabilidades`,
        details: { vulnerabilities, audit },
        guide: {
          title: 'Vulnerabilidades de Segurança Detectadas',
          steps: [
            'Execute: npm audit para detalhes',
            'Execute: npm audit fix para correções automáticas',
            'Para mudanças que quebram: npm audit fix --force (use com cautela)',
            'Revise detalhes do CVE antes de atualizar',
          ],
          urgency: critical > 0 ? 'IMEDIATO' : 'ALTO',
        },
      };
    } catch (error) {
      return {
        passed: false,
        message: `Auditoria falhou: ${error.message}`,
        details: { error: error.message },
      };
    }
  }
}
```

---

## Domínio 4: Ambiente de Implantação

**Propósito:** Verificar configuração de implantação e saúde do ambiente externo.

### Verificações

| ID     | Nome                 | Severidade | Nível | Modo  | Timeout | Descrição                              |
| ------ | -------------------- | ---------- | ----- | ----- | ------- | -------------------------------------- |
| DE-001 | Modo de implantação  | INFO       | N/A   | quick | 100ms   | Detectar local/staging/prod            |
| DE-002 | Vars por ambiente    | HIGH       | 3     | full  | 500ms   | Vars específicas do ambiente definidas |
| DE-003 | Conexão remota       | HIGH       | 3     | full  | 5s      | Consegue alcançar alvo de implantação  |
| DE-004 | Certificados SSL     | CRITICAL   | 3     | full  | 5s      | Certificados válidos e não expirando   |
| DE-005 | Endpoints de serviço | HIGH       | 3     | full  | 10s     | Endpoints de API respondendo           |

### Detalhes de Implementação

```javascript
// DE-004: Verificação de certificado SSL
class SslCertificateCheck extends BaseCheck {
  constructor() {
    super({
      id: 'DE-004',
      name: 'Certificados SSL',
      domain: 'deployment',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'full',
      timeout: 5000,
    });
  }

  async check(context) {
    const endpoints = context.deploymentConfig?.endpoints || [];

    if (endpoints.length === 0) {
      return {
        passed: true,
        message: 'Nenhum endpoint HTTPS configurado',
        details: { skipped: true },
      };
    }

    const results = [];
    const warningDays = 30; // Avisar se expirando em 30 dias

    for (const endpoint of endpoints) {
      if (!endpoint.startsWith('https://')) continue;

      try {
        const certInfo = await this.checkCertificate(endpoint);
        const daysUntilExpiry = Math.floor(
          (new Date(certInfo.validTo) - new Date()) / (1000 * 60 * 60 * 24)
        );

        results.push({
          endpoint,
          valid: certInfo.valid,
          validTo: certInfo.validTo,
          daysUntilExpiry,
          warning: daysUntilExpiry <= warningDays,
        });
      } catch (error) {
        results.push({
          endpoint,
          valid: false,
          error: error.message,
        });
      }
    }

    const invalid = results.filter((r) => !r.valid);
    const expiring = results.filter((r) => r.warning && r.valid);

    if (invalid.length > 0) {
      return {
        passed: false,
        message: `${invalid.length} certificado(s) SSL inválido(s)`,
        details: { results },
        guide: {
          title: 'Certificados SSL Inválidos',
          steps: [
            'Verificar configuração do certificado',
            'Verificar propriedade do domínio',
            'Contatar equipe de TI/DevOps',
          ],
          urgency: 'IMEDIATO',
        },
      };
    }

    if (expiring.length > 0) {
      return {
        passed: false,
        message: `${expiring.length} certificado(s) expirando em breve`,
        details: { results },
        guide: {
          title: 'Aviso de Expiração de Certificado SSL',
          steps: results
            .filter((r) => r.warning)
            .map((r) => `${r.endpoint}: Expira em ${r.daysUntilExpiry} dias`),
          urgency: 'ALTO',
        },
      };
    }

    return {
      passed: true,
      message: 'Todos os certificados SSL válidos',
      details: { results },
    };
  }
}
```

---

## Domínio 5: Integração de Serviços

**Propósito:** Verificar se integrações de serviços externos estão funcionando.

### Verificações

| ID     | Nome                | Severidade | Nível | Modo  | Timeout | Descrição                                   |
| ------ | ------------------- | ---------- | ----- | ----- | ------- | ------------------------------------------- |
| SI-001 | Gerenciador backlog | HIGH       | 1     | quick | 3s      | ClickUp/GitHub Issues acessível             |
| SI-002 | API do GitHub       | HIGH       | 1     | quick | 3s      | API do GitHub respondendo                   |
| SI-003 | Servidores MCP      | MEDIUM     | 1     | quick | 5s      | Servidores MCP operacionais                 |
| SI-004 | Camada de memória   | LOW        | 1     | quick | 2s      | Status da camada de memória (se habilitado) |

### Detalhes de Implementação

```javascript
// SI-002: Verificação da API do GitHub
class GitHubApiCheck extends BaseCheck {
  constructor() {
    super({
      id: 'SI-002',
      name: 'API do GitHub',
      domain: 'services',
      severity: 'HIGH',
      tier: 1,
      mode: 'quick',
      timeout: 3000,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('gh', ['api', 'user', '--jq', '.login'], {
        timeout: 3000,
      });

      return {
        passed: true,
        message: `GitHub autenticado como ${stdout.trim()}`,
        details: { user: stdout.trim() },
      };
    } catch (error) {
      if (error.message.includes('not logged in')) {
        return {
          passed: false,
          message: 'GitHub CLI não autenticado',
          guide: {
            title: 'Autenticar GitHub CLI',
            steps: [
              'Execute: gh auth login',
              'Siga os prompts para autenticar',
              'Verifique com: gh auth status',
            ],
          },
        };
      }

      return {
        passed: false,
        message: `Erro na API do GitHub: ${error.message}`,
        autoFixAvailable: true,
      };
    }
  }

  async heal(context) {
    // Tentar atualizar autenticação
    try {
      await execa('gh', ['auth', 'refresh']);
      return { healed: true, message: 'Autenticação do GitHub atualizada' };
    } catch (error) {
      return { healed: false, message: 'Re-autenticação manual necessária' };
    }
  }
}
```

---

## Matriz de Verificação IDE/CLI

### Métodos de Detecção

| IDE/CLI         | Arquivo de Config            | Método de Detecção  | Validação                  |
| --------------- | ---------------------------- | ------------------- | -------------------------- |
| **VS Code**     | `.vscode/settings.json`      | Arquivo existe      | JSON schema                |
| **Cursor**      | `.cursorrules`               | Arquivo existe      | Padrões de conteúdo        |
| **Claude Code** | `.claude/CLAUDE.md`          | Arquivo existe      | Seções obrigatórias        |
| **MCPs**        | `.claude.json` / `.mcp.json` | Arquivo existe      | Ping de saúde MCP          |
| **Git**         | `.gitconfig`                 | `git config --list` | Configurações obrigatórias |
| **GitHub CLI**  | N/A                          | `gh auth status`    | Verificação de auth        |
| **Node.js**     | N/A                          | `node --version`    | Versão >= 18               |
| **npm**         | `package.json`               | `npm --version`     | Versão >= 9                |

### Validação do CLAUDE.md

```javascript
// Seções obrigatórias no CLAUDE.md
const requiredSections = [
  'Project Overview', // ou 'AIOX-FULLSTACK Development Rules'
  'Agent System', // ou 'Workflow Execution'
  'Git Conventions', // ou 'Best Practices'
];

async function validateClaudeMd(content) {
  const missing = [];

  for (const section of requiredSections) {
    const pattern = new RegExp(`^#+\\s*${section}`, 'im');
    if (!pattern.test(content)) {
      // Verificar nomes alternativos
      const altPattern = new RegExp(`^#+\\s*(${getAlternatives(section).join('|')})`, 'im');
      if (!altPattern.test(content)) {
        missing.push(section);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
```

### Verificações de Configuração da IDE

```yaml
# .aiox-core/health-check/checks/ide-checks.yaml
checks:
  - id: IDE-VSCODE
    name: 'Configuração do VS Code'
    detection:
      - file: '.vscode/settings.json'
      - file: '.vscode/extensions.json'
    validation:
      type: json-schema
      schema: '.aiox-core/schemas/vscode-settings.json'
    autoFix:
      tier: 2
      action: 'create-from-template'
      template: '.aiox-core/infrastructure/templates/ide/vscode-settings.json'

  - id: IDE-CURSOR
    name: 'Configuração do Cursor'
    detection:
      - file: '.cursorrules'
      - directory: '.cursor/rules/'
    validation:
      type: content-pattern
      patterns:
        - 'You are'
        - 'AIOX'
    autoFix:
      tier: 2
      action: 'create-from-template'

  - id: IDE-CLAUDE
    name: 'Configuração do Claude Code'
    detection:
      - file: '.claude/CLAUDE.md'
    validation:
      type: section-check
      sections: ['Agent System', 'Git Conventions']
    autoFix:
      tier: 2
      action: 'merge-template'
```

---

## Extensão de Verificação Customizada

### Verificações Customizadas Baseadas em YAML

Usuários podem definir verificações específicas do projeto em `.aiox/custom-checks.yaml`:

```yaml
# .aiox/custom-checks.yaml
version: 1.0

checks:
  # Verificação de existência de arquivo
  - id: CUSTOM-001
    name: 'README existe'
    type: file-exists
    path: 'README.md'
    severity: MEDIUM
    tier: 2
    mode: quick
    autoFix:
      action: create-from-template
      template: '.aiox-core/infrastructure/templates/project-docs/readme-template.md'

  # Verificação de padrão de conteúdo
  - id: CUSTOM-002
    name: 'Sem comentários TODO em produção'
    type: content-pattern
    glob: 'src/**/*.{js,ts}'
    pattern: 'TODO|FIXME|HACK'
    negate: true # Falhar se padrão encontrado
    severity: LOW
    tier: 3
    mode: full
    message: 'Encontrados comentários TODO/FIXME - considere resolver antes do release'

  # Verificação de comando
  - id: CUSTOM-003
    name: 'TypeScript compila'
    type: command
    command: 'npm run typecheck'
    expectedExitCode: 0
    severity: HIGH
    tier: 3
    mode: full
    timeout: 30000

  # Verificação de saúde HTTP
  - id: CUSTOM-004
    name: 'API interna acessível'
    type: http-health
    url: 'https://api.internal.example.com/health'
    method: GET
    expectedStatus: 200
    timeout: 5000
    severity: HIGH
    tier: 3
    mode: full

  # Validação de JSON schema
  - id: CUSTOM-005
    name: 'Package.json válido'
    type: json-schema
    path: 'package.json'
    schema: '.aiox-core/schemas/package-json.json'
    severity: CRITICAL
    tier: 3
    mode: quick
```

### Tipos de Verificação Customizada

| Tipo              | Descrição                              | Parâmetros                        |
| ----------------- | -------------------------------------- | --------------------------------- |
| `file-exists`     | Verificar se arquivo existe            | `path`                            |
| `dir-exists`      | Verificar se diretório existe          | `path`                            |
| `content-pattern` | Buscar padrão em arquivos              | `glob`, `pattern`, `negate`       |
| `command`         | Executar comando e verificar exit code | `command`, `expectedExitCode`     |
| `http-health`     | Verificação de saúde de endpoint HTTP  | `url`, `method`, `expectedStatus` |
| `json-schema`     | Validar JSON contra schema             | `path`, `schema`                  |
| `yaml-valid`      | Verificar se YAML é parseável          | `path`                            |
| `env-var`         | Verificar variável de ambiente         | `name`, `pattern`                 |

---

## Considerações de Performance

### Ordem de Execução

```javascript
// Ordem de prioridade para verificações (estratégia fail-fast)
const checkPriority = {
  CRITICAL: 1, // Executar primeiro, parar se falhar
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5, // Executar por último, nunca falha
};

// Modo rápido executa apenas prioridade 1-2
// Modo completo executa todas as prioridades
```

### Grupos de Execução Paralela

```javascript
// Verificações que podem rodar em paralelo (sem dependências)
const parallelGroups = [
  // Grupo 1: Verificações rápidas de arquivo
  ['PC-001', 'PC-003', 'PC-004', 'PC-005', 'RH-008'],

  // Grupo 2: Verificações de versão
  ['LE-001', 'LE-002', 'LE-003'],

  // Grupo 3: Verificações de rede (pool compartilhado)
  ['LE-005', 'SI-001', 'SI-002', 'SI-003'],

  // Grupo 4: Verificações custosas (executar por último)
  ['RH-007', 'PC-002', 'PC-006'],
];
```

### Estratégia de Cache

```javascript
const checkCache = new Map();

// Configuração de cache por tipo de verificação
const cacheConfig = {
  'file-exists': { ttl: 60000, key: 'path' }, // 1 min
  'content-pattern': { ttl: 300000, key: 'glob+pattern' }, // 5 min
  command: { ttl: 0 }, // Sem cache
  'http-health': { ttl: 30000, key: 'url' }, // 30 seg
  'node-version': { ttl: 3600000 }, // 1 hora
};
```

### Tratamento de Timeout

```javascript
async function runCheckWithTimeout(check, context) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Verificação excedeu timeout')), check.timeout);
  });

  try {
    const result = await Promise.race([check.check(context), timeoutPromise]);
    return result;
  } catch (error) {
    return {
      passed: false,
      message: `Verificação falhou: ${error.message}`,
      timedOut: error.message === 'Verificação excedeu timeout',
    };
  }
}
```

---

## Documentos Relacionados

- [ADR: Arquitetura do HCS](./adr/adr-hcs-health-check-system.md)
- [Modos de Execução do HCS](./hcs-execution-modes.md)
- [Especificação de Auto-Recuperação do HCS](./hcs-self-healing-spec.md)

---

_Documento criado como parte da Investigação Story HCS-1_
