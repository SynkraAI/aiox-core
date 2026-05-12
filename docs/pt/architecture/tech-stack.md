<!-- Tradução: PT-BR | Original: /docs/en/architecture/tech-stack.md | Sincronização: 2026-01-26 -->

# Stack de Tecnologia AIOX

> 🌐 [EN](../../architecture/tech-stack.md) | **PT** | [ES](../../es/architecture/tech-stack.md)

---

> ⚠️ **DESCONTINUADO**: Este arquivo é mantido apenas para compatibilidade retroativa.
>
> **Versão oficial:** [docs/framework/tech-stack.md](../framework/tech-stack.md)
>
> Este arquivo será removido no Q2 2026 após consolidação completa em `docs/framework/`.

---

# Stack de Tecnologia AIOX

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** DESCONTINUADO - Veja docs/framework/tech-stack.md
**Aviso de Migração:** Este documento será migrado para o repositório `SynkraAI/aiox-core` no Q2 2026 (veja Decisão 005)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Runtime Core](#runtime-core)
- [Linguagens e Transpiladores](#linguagens-e-transpiladores)
- [Dependências Core](#dependências-core)
- [Ferramentas de Desenvolvimento](#ferramentas-de-desenvolvimento)
- [Framework de Testes](#framework-de-testes)
- [Build e Deploy](#build-e-deploy)
- [Integrações Externas](#integrações-externas)
- [Stack Futuro (Pós-Migração)](#stack-futuro-pós-migração)

---

## Visão Geral

AIOX é construído em JavaScript/TypeScript moderno com runtime Node.js, otimizado para desenvolvimento de CLI cross-platform com UX interativa e capacidades de orquestração de agentes.

**Filosofia:**

- Preferir **tecnologia consolidada** onde possível (dependências provadas e estáveis)
- Escolher **tecnologia inovadora** apenas onde necessário (performance, melhorias de DX)
- Minimizar dependências (reduzir risco de supply chain)
- Cross-platform primeiro (Windows, macOS, Linux)

---

## Runtime Core

### Node.js

```yaml
Versão: 18.0.0+
LTS: Sim (LTS Ativo até Abril 2025)
Razão: Suporte estável a async/await, fetch API, ES2022
```

**Por que Node.js 18+:**

- ✅ API `fetch()` nativa (sem necessidade de axios/node-fetch)
- ✅ Suporte a módulos ES2022 (top-level await)
- ✅ V8 10.2+ (melhorias de performance)
- ✅ Suporte LTS ativo (patches de segurança)
- ✅ Cross-platform (Windows/macOS/Linux)

**Gerenciador de Pacotes:**

```yaml
Principal: npm 9.0.0+
Alternativo: yarn/pnpm (escolha do usuário)
Lock File: package-lock.json
```

---

## Linguagens e Transpiladores

### JavaScript (Principal)

```yaml
Padrão: ES2022
Sistema de Módulos: CommonJS (require/module.exports)
Futuro: Migração para ESM planejada (Story 6.2.x)
```

**Por que ES2022:**

- ✅ Class fields e métodos privados
- ✅ Top-level await
- ✅ Error cause
- ✅ Método Array.at()
- ✅ Object.hasOwn()

### TypeScript (Definições de Tipos)

```yaml
Versão: 5.9.3
Uso: Apenas definições de tipos (arquivos .d.ts)
Compilação: Não utilizada (runtime JS puro)
Futuro: Migração completa para TypeScript considerada para Q2 2026
```

**Uso Atual de TypeScript:**

```typescript
// index.d.ts - Definições de tipos para API pública
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuração TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependências Core

### CLI e UX Interativa

#### @clack/prompts (^0.11.0)

**Propósito:** Prompts de CLI modernos com UX elegante
**Uso:** Wizard interativo, coleta de input do usuário
**Por que:** UX de classe mundial, animações de spinner, barras de progresso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Selecione o agente:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**Propósito:** Estilização de strings no terminal
**Uso:** Saída colorida, formatação
**Por que:** Cross-platform, zero dependências, API estável

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agente ativado com sucesso'));
console.log(chalk.red('❌ Tarefa falhou'));
```

#### picocolors (^1.1.1)

**Propósito:** Biblioteca de cores leve (alternativa mais rápida ao chalk)
**Uso:** Saída de cores crítica em performance
**Por que:** 14x menor que chalk, 2x mais rápido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Saída rápida'));
```

#### ora (^5.4.1)

**Propósito:** Spinners de terminal
**Uso:** Indicadores de carregamento, operações assíncronas
**Por que:** Spinners bonitos, customizáveis, amplamente usado

```javascript
const ora = require('ora');
const spinner = ora('Carregando agente...').start();
await loadAgent();
spinner.succeed('Agente carregado');
```

### Sistema de Arquivos e Operações de Path

#### fs-extra (^11.3.2)

**Propósito:** Operações aprimoradas de sistema de arquivos
**Uso:** Cópia de arquivos, criação de diretórios, leitura/escrita JSON
**Por que:** Baseado em promises, utilitários adicionais sobre `fs` nativo

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Propósito:** Pattern matching de arquivos
**Uso:** Encontrar arquivos por padrões (ex: `*.md`, `**/*.yaml`)
**Por que:** Rápido, suporta padrões gitignore

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### Processamento YAML

#### yaml (^2.8.1)

**Propósito:** Parsing e serialização YAML
**Uso:** Configs de agentes, workflows, templates
**Por que:** Rápido, compatível com spec, preserva comentários

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**Propósito:** Parser YAML alternativo (suporte legado)
**Uso:** Parsing de arquivos YAML antigos
**Por que:** API diferente, usado em código legado

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**Nota de Migração:** Consolidar para biblioteca YAML única (Story 6.2.x)

### Processamento Markdown

#### @kayvan/markdown-tree-parser (^1.5.0)

**Propósito:** Parsear markdown em AST
**Uso:** Parsing de stories, análise de estrutura de documentos
**Por que:** Leve, rápido, suporta GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### Execução de Processos

#### execa (^9.6.0)

**Propósito:** child_process aprimorado
**Uso:** Executar git, npm, ferramentas CLI externas
**Por que:** Cross-platform, baseado em promises, melhor tratamento de erros

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### Parsing de Linha de Comando

#### commander (^14.0.1)

**Propósito:** Framework CLI
**Uso:** Parsing de argumentos de linha de comando, subcomandos
**Por que:** Padrão da indústria, recursos ricos, suporte TypeScript

```javascript
const { Command } = require('commander');
const program = new Command();

program
  .command('agent <name>')
  .description('Ativar um agente')
  .action((name) => {
    console.log(`Ativando agente: ${name}`);
  });
```

#### inquirer (^8.2.6)

**Propósito:** Prompts interativos de linha de comando
**Uso:** Coleta de input do usuário, wizards
**Por que:** Tipos ricos de prompts, suporte a validação

```javascript
const inquirer = require('inquirer');
const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'agent',
    message: 'Selecione o agente:',
    choices: ['dev', 'qa', 'architect'],
  },
]);
```

### Sandboxing e Segurança

#### isolated-vm (^5.0.4)

**Propósito:** V8 isolate para execução JavaScript em sandbox
**Uso:** Execução segura de scripts de usuário, execução de tarefas
**Por que:** Isolamento de segurança, limites de memória, controle de timeout

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### Validação

#### validator (^13.15.15)

**Propósito:** Validadores e sanitizadores de strings
**Uso:** Validação de input (URLs, emails, etc.)
**Por que:** Abrangente, bem testado, sem dependências

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // URL válida
}
```

#### semver (^7.7.2)

**Propósito:** Parser e comparador de versionamento semântico
**Uso:** Verificação de versões, resolução de dependências
**Por que:** Padrão NPM, amplamente testado

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // Versão compatível
}
```

---

## Ferramentas de Desenvolvimento

### Linting

#### ESLint (^9.38.0)

**Propósito:** Linter JavaScript/TypeScript
**Configuração:** `.eslintrc.json`
**Plugins:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**Regras Principais:**

```javascript
{
  "rules": {
    "no-console": "off",           // Permitir console na CLI
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### Formatação

#### Prettier (^3.5.3)

**Propósito:** Formatador de código
**Configuração:** `.prettierrc`

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

#### yaml-lint (^1.7.0)

**Propósito:** Linter de arquivos YAML
**Uso:** Validar configs de agentes, workflows, templates

### Git Hooks

#### husky (^9.1.7)

**Propósito:** Gerenciamento de git hooks
**Uso:** Linting pré-commit, testes pré-push

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  }
}
```

#### lint-staged (^16.1.1)

**Propósito:** Executar linters em arquivos staged
**Configuração:**

```json
{
  "lint-staged": {
    "**/*.md": ["prettier --write"],
    "**/*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Framework de Testes

### Jest (^30.2.0)

**Propósito:** Framework de testes
**Uso:** Testes unitários, testes de integração, cobertura

```javascript
// Exemplo de teste
describe('AgentExecutor', () => {
  it('should load agent configuration', async () => {
    const agent = await loadAgent('dev');
    expect(agent.name).toBe('developer');
  });
});
```

**Configuração:**

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

#### @types/jest (^30.0.0)

**Propósito:** Definições de tipo TypeScript para Jest
**Uso:** Escrita de testes com type safety

---

## Build e Deploy

### Versionamento e Release

#### semantic-release (^25.0.2)

**Propósito:** Versionamento semântico automatizado e releases
**Uso:** Publicação automática no NPM, geração de changelog

**Plugins:**

- `@semantic-release/changelog` (^6.0.3) - Gerar CHANGELOG.md
- `@semantic-release/git` (^10.0.1) - Commitar ativos de release

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git"
    ]
  }
}
```

### Scripts de Build

```bash
# Build de pacotes
npm run build                  # Build de todos os pacotes
npm run build:agents           # Build apenas de agentes
npm run build:teams            # Build apenas de times

# Versionamento
npm run version:patch          # Incrementar versão patch
npm run version:minor          # Incrementar versão minor
npm run version:major          # Incrementar versão major

# Publicação
npm run publish:dry-run        # Testar publicação
npm run publish:preview        # Publicar com tag preview
npm run publish:stable         # Publicar com tag latest
```

---

## Integrações Externas

### Servidores MCP

AIOX integra com servidores Model Context Protocol (MCP):

```yaml
Servidores MCP:
  - clickup-direct: Integração ClickUp (gerenciamento de tarefas)
  - context7: Lookup de documentação
  - exa-direct: Busca web
  - desktop-commander: Operações de arquivos
  - docker-mcp: Gerenciamento Docker
  - ide: Integração VS Code/Cursor
```

**Configuração:** `.claude.json` ou `.cursor/settings.json`

### Ferramentas CLI

Ferramentas CLI externas usadas por agentes:

```yaml
GitHub CLI (gh):
  Versão: 2.x+
  Uso: Gerenciamento de repositório, criação de PR
  Instalar: https://cli.github.com

Railway CLI (railway):
  Versão: 3.x+
  Uso: Automação de deploy
  Instalar: npm i -g @railway/cli

Supabase CLI (supabase):
  Versão: 1.x+
  Uso: Migrações de banco de dados, gerenciamento de schema
  Instalar: npm i -g supabase

Git:
  Versão: 2.30+
  Uso: Controle de versão
  Obrigatório: Sim
```

### Serviços em Nuvem

```yaml
Railway:
  Propósito: Deploy de aplicações
  API: Railway CLI

Supabase:
  Propósito: Banco de dados PostgreSQL + Auth
  API: Supabase CLI + REST API

GitHub:
  Propósito: Hospedagem de repositório, CI/CD
  API: GitHub CLI (gh) + Octokit

CodeRabbit:
  Propósito: Revisão de código automatizada
  API: Integração via GitHub App
```

---

## Stack Futuro (Pós-Migração)

**Planejado para Q2-Q4 2026** (após reestruturação de repositório):

### Migração ESM

```javascript
// Atual: CommonJS
const agent = require('./agent');
module.exports = { executeAgent };

// Futuro: ES Modules
import { agent } from './agent.js';
export { executeAgent };
```

### TypeScript Completo

```typescript
// Migrar de JS + .d.ts para TypeScript completo
// Benefícios: Type safety, melhor refatoração, DX aprimorado
```

### Ferramentas de Build

```yaml
Bundler: esbuild ou tsup
Razão: Builds rápidos, tree-shaking, minificação
Alvo: Executável CLI único (opcional)
```

### Melhorias de Testes

```yaml
Testes E2E: Playwright (testes de automação de browser)
Testes de Performance: Benchmark.js (timing de workflows)
```

---

## Gerenciamento de Dependências

### Auditorias de Segurança

```bash
# Executar auditoria de segurança
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix

# Verificar pacotes desatualizados
npm outdated
```

### Política de Atualização

```yaml
Atualizações Major: Revisão trimestral (Q1, Q2, Q3, Q4)
Patches de Segurança: Imediato (até 48 horas)
Atualizações Minor: Revisão mensal
Redução de Dependências: Esforço contínuo
```

### Árvore de Dependências

```bash
# Visualizar árvore de dependências
npm ls --depth=2

# Encontrar pacotes duplicados
npm dedupe

# Analisar tamanho do bundle
npx cost-of-modules
```

---

## Matriz de Compatibilidade de Versões

| Componente       | Versão  | Compatibilidade | Notas                           |
| ---------------- | ------- | --------------- | ------------------------------- |
| **Node.js**      | 18.0.0+ | Obrigatório     | LTS Ativo                       |
| **npm**          | 9.0.0+  | Obrigatório     | Gerenciador de pacotes          |
| **TypeScript**   | 5.9.3   | Recomendado     | Definições de tipos             |
| **ESLint**       | 9.38.0  | Obrigatório     | Linting                         |
| **Prettier**     | 3.5.3   | Obrigatório     | Formatação                      |
| **Jest**         | 30.2.0  | Obrigatório     | Testes                          |
| **Git**          | 2.30+   | Obrigatório     | Controle de versão              |
| **GitHub CLI**   | 2.x+    | Opcional        | Gerenciamento de repositório    |
| **Railway CLI**  | 3.x+    | Opcional        | Deploy                          |
| **Supabase CLI** | 1.x+    | Opcional        | Gerenciamento de banco de dados |

---

## Considerações de Performance

### Tamanho do Bundle

```bash
# Tamanho do bundle de produção (minificado)
Total: ~5MB (inclui todas as dependências)

# Dependências críticas (sempre carregadas):
- commander: 120KB
- chalk: 15KB
- yaml: 85KB
- fs-extra: 45KB

# Dependências opcionais (carregamento lazy):
- inquirer: 650KB (apenas modo interativo)
- @clack/prompts: 180KB (apenas modo wizard)
```

### Tempo de Inicialização

```yaml
Cold Start: ~200ms (carregamento inicial)
Warm Start: ~50ms (módulos em cache)
Modo Yolo: ~100ms (pula validação)

Estratégia de Otimização:
  - Carregamento lazy de dependências pesadas
  - Cache de configs YAML parseadas
  - Usar require() condicionalmente
```

### Uso de Memória

```yaml
Baseline: 30MB (Node.js + AIOX core)
Execução de Agente: +10MB (por agente)
Processamento de Story: +20MB (parsing markdown)
Pico: ~100MB (workflow típico)
```

---

## Notas Específicas de Plataforma

### Windows

```yaml
Separadores de Path: Backslash (\) - normalizado para forward slash (/)
Fim de Linha: CRLF - Git configurado para conversão automática
Shell: PowerShell ou CMD - execa lida com cross-platform
Node.js: Instalador Windows de nodejs.org
```

### macOS

```yaml
Separadores de Path: Forward slash (/)
Fim de Linha: LF
Shell: zsh (padrão) ou bash
Node.js: Homebrew (brew install node@18) ou nvm
```

### Linux

```yaml
Separadores de Path: Forward slash (/)
Fim de Linha: LF
Shell: bash (padrão) ou zsh
Node.js: nvm, apt, yum ou binários oficiais
```

---

## Variáveis de Ambiente

```bash
# Configuração AIOX
AIOX_DEBUG=true                    # Habilitar logging de debug
AIOX_CONFIG_PATH=/custom/path      # Localização customizada de config
AIOX_YOLO_MODE=true               # Forçar modo yolo

# Node.js
NODE_ENV=production                # Modo produção
NODE_OPTIONS=--max-old-space-size=4096  # Aumentar limite de memória

# Serviços Externos
CLICKUP_API_KEY=pk_xxx            # Integração ClickUp
GITHUB_TOKEN=ghp_xxx              # Acesso à API GitHub
RAILWAY_TOKEN=xxx                 # Deploy Railway
SUPABASE_ACCESS_TOKEN=xxx         # Auth Supabase CLI
```

---

## Documentos Relacionados

- [Padrões de Codificação](./coding-standards.md)
- [Árvore de Código](./source-tree.md)

---

## Histórico de Versão

| Versão | Data       | Alterações                                                                                       | Autor            |
| ------ | ---------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| 1.0    | 2025-01-15 | Documentação inicial do tech stack                                                               | Aria (architect) |
| 1.1    | 2025-12-14 | Atualizado aviso de migração para SynkraAI/aiox-core, semantic-release para v25.0.2 [Story 6.10] | Dex (dev)        |

---

_Este é um padrão oficial do framework AIOX. Todas as escolhas de tecnologia devem estar alinhadas com este stack._
