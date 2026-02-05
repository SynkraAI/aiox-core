# Sistema DevOps - Guia Completo do Agente @devops

> **Agente:** Gage (Operator)
> **Versão:** 2.0.0
> **Última Atualização:** 2026-02-04

## Índice

1. [Visão Geral](#visao-geral)
2. [Lista Completa de Arquivos](#lista-completa-de-arquivos)
3. [Flowchart: Sistema Completo](#flowchart-sistema-completo)
4. [Mapeamento de Comandos para Tasks](#mapeamento-de-comandos-para-tasks)
5. [Integracoes entre Agentes](#integracoes-entre-agentes)
6. [Configuracao](#configuracao)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Referencias](#referencias)
10. [Resumo](#resumo)

---

## Visão Geral

O agente `@devops` (Gage) e o especialista em infraestrutura e operacoes do framework AIOS. Ele e responsavel por:

- **Governanca MCP**: Gerenciamento exclusivo de servidores MCP (Model Context Protocol)
- **CI/CD**: Configuracao e manutencao de pipelines de integracao e entrega continua
- **Releases**: Gerenciamento de versoes e publicacao de releases
- **Repositorios**: Manutencao, limpeza e qualidade de codigo
- **Seguranca**: Auditorias e varreduras de seguranca
- **Ambientes**: Bootstrap de novos projetos e configuracao de ambientes

### Persona

```yaml
Nome: Gage
Papel: Operator
Especializacao: DevOps, Infraestrutura, CI/CD, MCP
Filosofia: "Automatize tudo que pode ser automatizado"
```

### Regra Critica

**IMPORTANTE:** Toda operacao de infraestrutura MCP e gerenciada EXCLUSIVAMENTE pelo agente DevOps. Outros agentes (Dev, Architect, etc.) sao consumidores de MCP, não administradores.

---

## Lista Completa de Arquivos

### Arquivo do Agente

| Arquivo | Caminho | Descrição |
|---------|---------|-----------|
| Definição do Agente | `.aios-core/development/agents/devops.md` | Persona, comandos e comportamentos |

### Arquivos de Tasks

| Task | Caminho | Comando |
|------|---------|---------|
| Pre-Push Quality Gate | `.aios-core/development/tasks/github-devops-pre-push-quality-gate.md` | `*push` |
| Version Management | `.aios-core/development/tasks/github-devops-version-management.md` | `*version-check` |
| Repository Cleanup | `.aios-core/development/tasks/github-devops-repository-cleanup.md` | `*cleanup` |
| CI/CD Configuration | `.aios-core/development/tasks/ci-cd-configuration.md` | `*ci-cd` |
| Release Management | `.aios-core/development/tasks/release-management.md` | `*release` |
| Environment Bootstrap | `.aios-core/development/tasks/environment-bootstrap.md` | `*environment-bootstrap` |
| Search MCP | `.aios-core/development/tasks/search-mcp.md` | `*search-mcp` |
| Add MCP | `.aios-core/development/tasks/add-mcp.md` | `*add-mcp` |
| Setup MCP Docker | `.aios-core/development/tasks/setup-mcp-docker.md` | `*setup-mcp-docker` |
| Setup GitHub | `.aios-core/development/tasks/setup-github.md` | `*setup-github` |
| Security Audit | `.aios-core/development/tasks/security-audit.md` | `*security-audit` |
| Security Scan | `.aios-core/development/tasks/security-scan.md` | `*security-scan` |

### Arquivos de Configuracao e Regras

| Arquivo | Caminho | Propósito |
|---------|---------|-----------|
| Regras MCP | `.claude/rules/mcp-usage.md` | Governanca e uso de MCPs |
| Regras N8N | `.claude/rules/n8n-operations.md` | Operacoes em infraestrutura N8N |

---

## Flowchart: Sistema Completo

### Arquitetura Geral do DevOps

```mermaid
flowchart TB
    subgraph "Agente DevOps (Gage)"
        A[/"@devops"/]
    end

    subgraph "MCP Management"
        MCP1["*search-mcp"]
        MCP2["*add-mcp"]
        MCP3["*list-mcps"]
        MCP4["*remove-mcp"]
        MCP5["*setup-mcp-docker"]
    end

    subgraph "Git/GitHub Operations"
        GIT1["*push"]
        GIT2["*setup-github"]
        GIT3["*cleanup"]
    end

    subgraph "CI/CD & Releases"
        CI1["*ci-cd"]
        CI2["*release"]
        CI3["*version-check"]
    end

    subgraph "Security"
        SEC1["*security-scan"]
        SEC2["*security-audit"]
    end

    subgraph "Environment"
        ENV1["*environment-bootstrap"]
    end

    A --> MCP1 & MCP2 & MCP3 & MCP4 & MCP5
    A --> GIT1 & GIT2 & GIT3
    A --> CI1 & CI2 & CI3
    A --> SEC1 & SEC2
    A --> ENV1
```

### Fluxo de Pre-Push Quality Gate

```mermaid
flowchart TD
    START[/"*push"/] --> LINT["Executar Linting"]
    LINT --> LINT_OK{Passou?}
    LINT_OK -->|Sim| TEST["Executar Testes"]
    LINT_OK -->|Nao| FIX_LINT["Corrigir Erros de Lint"]
    FIX_LINT --> LINT

    TEST --> TEST_OK{Passou?}
    TEST_OK -->|Sim| TYPE["Verificar Types"]
    TEST_OK -->|Nao| FIX_TEST["Corrigir Testes"]
    FIX_TEST --> TEST

    TYPE --> TYPE_OK{Passou?}
    TYPE_OK -->|Sim| BUILD["Build de Verificacao"]
    TYPE_OK -->|Nao| FIX_TYPE["Corrigir Types"]
    FIX_TYPE --> TYPE

    BUILD --> BUILD_OK{Passou?}
    BUILD_OK -->|Sim| PUSH["git push"]
    BUILD_OK -->|Nao| FIX_BUILD["Corrigir Build"]
    FIX_BUILD --> BUILD

    PUSH --> SUCCESS[/"Push Concluido"/]
```

### Fluxo de Release Management

```mermaid
flowchart TD
    START[/"*release"/] --> ANALYZE["Analisar Commits"]
    ANALYZE --> BUMP["Determinar Version Bump"]

    BUMP --> MAJOR{Major?}
    MAJOR -->|Sim| V_MAJOR["X.0.0"]
    MAJOR -->|Nao| MINOR{Minor?}
    MINOR -->|Sim| V_MINOR["x.Y.0"]
    MINOR -->|Nao| V_PATCH["x.y.Z"]

    V_MAJOR & V_MINOR & V_PATCH --> CHANGELOG["Gerar CHANGELOG"]
    CHANGELOG --> TAG["Criar Git Tag"]
    TAG --> RELEASE["Criar GitHub Release"]
    RELEASE --> NOTIFY["Notificar Time"]
    NOTIFY --> END[/"Release Publicado"/]
```

### Fluxo de Governanca MCP

```mermaid
flowchart TD
    subgraph "Busca e Selecao"
        SEARCH[/"*search-mcp"/] --> CATALOG["Consultar Catalogo"]
        CATALOG --> FILTER["Filtrar por Categoria"]
        FILTER --> SELECT["Selecionar MCP"]
    end

    subgraph "Instalacao"
        SELECT --> ADD[/"*add-mcp"/]
        ADD --> SCOPE{"Escopo?"}
        SCOPE -->|user| GLOBAL["~/.claude.json"]
        SCOPE -->|project| PROJECT[".mcp.json"]
        SCOPE -->|local| LOCAL["settings.local.json"]
    end

    subgraph "Configuracao Docker"
        ADD --> DOCKER{Docker MCP?}
        DOCKER -->|Sim| SETUP[/"*setup-mcp-docker"/]
        SETUP --> TOOLKIT["Docker MCP Toolkit"]
        TOOLKIT --> SECRETS["Configurar Secrets"]
    end

    GLOBAL & PROJECT & LOCAL --> VALIDATE["Validar Instalacao"]
    SECRETS --> VALIDATE
    VALIDATE --> READY[/"MCP Pronto"/]
```

### Fluxo de CI/CD Configuration

```mermaid
flowchart TD
    START[/"*ci-cd"/] --> DETECT["Detectar Plataforma"]

    DETECT --> PLATFORM{Plataforma?}
    PLATFORM -->|GitHub| GHA["GitHub Actions"]
    PLATFORM -->|GitLab| GLC["GitLab CI"]
    PLATFORM -->|CircleCI| CCI["CircleCI"]

    GHA --> CONFIG_GHA["Gerar .github/workflows/"]
    GLC --> CONFIG_GLC["Gerar .gitlab-ci.yml"]
    CCI --> CONFIG_CCI["Gerar .circleci/config.yml"]

    CONFIG_GHA & CONFIG_GLC & CONFIG_CCI --> STAGES["Configurar Stages"]

    STAGES --> LINT_STAGE["Stage: Lint"]
    STAGES --> TEST_STAGE["Stage: Test"]
    STAGES --> BUILD_STAGE["Stage: Build"]
    STAGES --> DEPLOY_STAGE["Stage: Deploy"]

    LINT_STAGE & TEST_STAGE & BUILD_STAGE & DEPLOY_STAGE --> CODERABBIT["Integrar CodeRabbit"]
    CODERABBIT --> COMMIT["Commitar Configuracao"]
    COMMIT --> END[/"CI/CD Configurado"/]
```

### Fluxo de Environment Bootstrap

```mermaid
flowchart TD
    START[/"*environment-bootstrap"/] --> ELICIT["Coletar Informacoes"]

    ELICIT --> Q1["Nome do Projeto?"]
    Q1 --> Q2["Stack Tecnologica?"]
    Q2 --> Q3["Tipo de Projeto?"]

    Q3 --> INSTALL["Instalar CLI Tools"]
    INSTALL --> CLI1["Node.js/npm"]
    INSTALL --> CLI2["GitHub CLI"]
    INSTALL --> CLI3["Docker"]

    CLI1 & CLI2 & CLI3 --> GIT_SETUP["Configurar Git"]
    GIT_SETUP --> REPO["Criar Repositorio"]
    REPO --> STRUCTURE["Criar Estrutura"]

    STRUCTURE --> DIR1["apps/"]
    STRUCTURE --> DIR2["packages/"]
    STRUCTURE --> DIR3["docs/"]
    STRUCTURE --> DIR4[".aios-core/"]

    DIR1 & DIR2 & DIR3 & DIR4 --> TEMPLATES["Aplicar Templates"]
    TEMPLATES --> DEPS["Instalar Dependencias"]
    DEPS --> VALIDATE["Validar Setup"]
    VALIDATE --> END[/"Ambiente Pronto"/]
```

---

## Mapeamento de Comandos para Tasks

### Comandos MCP

| Comando | Task | Descrição | Modo |
|---------|------|-----------|------|
| `*search-mcp` | search-mcp.md | Buscar MCPs no catalogo | Interactive |
| `*add-mcp` | add-mcp.md | Instalar servidor MCP | Interactive |
| `*list-mcps` | (inline) | Listar MCPs habilitados | YOLO |
| `*remove-mcp` | (inline) | Remover servidor MCP | Interactive |
| `*setup-mcp-docker` | setup-mcp-docker.md | Configurar Docker MCP Toolkit | Interactive |

### Comandos Git/GitHub

| Comando | Task | Descrição | Modo |
|---------|------|-----------|------|
| `*push` | github-devops-pre-push-quality-gate.md | Quality gate antes do push | Interactive |
| `*setup-github` | setup-github.md | Configurar repositorio GitHub | Interactive |
| `*cleanup` | github-devops-repository-cleanup.md | Limpar branches e arquivos | Interactive |

### Comandos CI/CD e Releases

| Comando | Task | Descrição | Modo |
|---------|------|-----------|------|
| `*ci-cd` | ci-cd-configuration.md | Configurar pipeline CI/CD | Interactive |
| `*release` | release-management.md | Criar release com changelog | Interactive |
| `*version-check` | github-devops-version-management.md | Analisar e sugerir versao | YOLO |

### Comandos de Seguranca

| Comando | Task | Descrição | Modo |
|---------|------|-----------|------|
| `*security-scan` | security-scan.md | Varredura de vulnerabilidades | Interactive |
| `*security-audit` | security-audit.md | Auditoria completa de seguranca | Interactive |

### Comandos de Ambiente

| Comando | Task | Descrição | Modo |
|---------|------|-----------|------|
| `*environment-bootstrap` | environment-bootstrap.md | Bootstrap de novo projeto | Interactive |

---

## Integracoes entre Agentes

### Diagrama de Integracoes

```mermaid
flowchart LR
    subgraph "DevOps (Gage)"
        DEVOPS["@devops"]
    end

    subgraph "Desenvolvimento"
        DEV["@dev"]
        QA["@qa"]
    end

    subgraph "Gestao"
        PM["@pm"]
        PO["@po"]
        SM["@sm"]
    end

    subgraph "Arquitetura"
        ARCH["@architect"]
    end

    DEV -->|"Solicita MCP"| DEVOPS
    DEV -->|"Dispara *push"| DEVOPS
    QA -->|"Solicita security scan"| DEVOPS
    PM -->|"Solicita release"| DEVOPS
    ARCH -->|"Define CI/CD"| DEVOPS
    DEVOPS -->|"Notifica deploy"| SM
    DEVOPS -->|"Reporta vulnerabilidades"| PO
```

### Matriz de Responsabilidades

| Operacao | DevOps | Dev | QA | Architect | PM |
|----------|--------|-----|----|-----------|----|
| Gerenciar MCPs | **Owner** | Consumer | Consumer | Consumer | - |
| CI/CD Config | **Owner** | Reviewer | - | Approver | - |
| Releases | **Owner** | - | Validator | - | Requester |
| Security Scan | **Owner** | - | **Co-Owner** | - | - |
| Repository Setup | **Owner** | - | - | Reviewer | - |
| Environment Bootstrap | **Owner** | Requester | - | - | - |

### Fluxo de Delegacao

1. **Dev precisa de MCP**: `@dev` -> `@devops *add-mcp`
2. **QA precisa de security**: `@qa` -> `@devops *security-scan`
3. **PM solicita release**: `@pm` -> `@devops *release`
4. **Architect define pipeline**: `@architect` -> `@devops *ci-cd`

---

## Configuracao

### Configuracao Global de MCPs

Arquivo: `~/.claude.json`

```json
{
  "mcpServers": {
    "context7": {
      "type": "sse",
      "url": "https://mcp.context7.com/sse"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-desktop-commander"]
    }
  }
}
```

### Configuracao de Projeto

Arquivo: `.mcp.json`

```json
{
  "mcpServers": {
    "project-specific-mcp": {
      "command": "node",
      "args": ["./mcp-server/index.js"]
    }
  }
}
```

### Configuracao Docker MCP

Arquivo: `~/.docker/mcp/catalogs/docker-mcp.yaml`

```yaml
exa:
  env:
    - name: EXA_API_KEY
      value: 'sua-chave-aqui'

apify:
  env:
    - name: APIFY_TOKEN
      value: 'seu-token-aqui'
```

### Variaveis de Ambiente

```bash
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# CI/CD
CI_ENVIRONMENT=production

# MCP
MCP_DEBUG=true
```

---

## Best Practices

### Governanca MCP

1. **Principio do Menor Privilegio**
   - Use escopo `local` para MCPs de teste
   - Use escopo `project` para MCPs compartilhados
   - Use escopo `user` apenas para ferramentas pessoais

2. **Documentacao**
   - Documente todo MCP adicionado ao projeto
   - Mantenha README atualizado com MCPs necessarios

3. **Seguranca**
   - Nunca commite API keys em `.mcp.json`
   - Use variaveis de ambiente para credenciais
   - Rotacione tokens regularmente

### CI/CD

1. **Pipeline Stages**
   ```
   lint -> test -> build -> deploy
   ```

2. **Quality Gates**
   - Exija 80%+ de cobertura de testes
   - Falhe o build em erros de lint
   - Integre CodeRabbit para code review automatico

3. **Releases**
   - Use semantic versioning (SemVer)
   - Gere CHANGELOG automaticamente
   - Crie tags assinadas

### Repositorios

1. **Limpeza Regular**
   - Execute `*cleanup` mensalmente
   - Remova branches merged >30 dias
   - Limpe arquivos temporarios

2. **Branch Protection**
   - Proteja `main` e `develop`
   - Exija reviews antes de merge
   - Habilite status checks

### Seguranca

1. **Scans Regulares**
   - Execute `*security-scan` semanalmente
   - Audite dependencias com `npm audit`
   - Verifique secrets expostos

2. **Resposta a Vulnerabilidades**
   - Priorize CVEs criticos
   - Documente remediacoes
   - Notifique stakeholders

---

## Troubleshooting

### Problemas com MCP

#### MCP não conecta

```bash
# Verificar status
claude mcp list

# Verificar logs (se disponivel)
tail -f ~/.claude/logs/mcp*.log

# Testar servidor manualmente
npx -y @package/mcp-server
```

#### Docker MCP sem ferramentas

**Sintoma:** `docker mcp tools ls` mostra "(N prompts)" ao inves de "(N tools)"

**Causa:** Bug no Docker MCP Toolkit com secrets

**Solucao:**
1. Edite `~/.docker/mcp/catalogs/docker-mcp.yaml`
2. Substitua template por valores hardcoded
3. Reinicie o container MCP

### Problemas com CI/CD

#### Pipeline falha sem motivo claro

```bash
# Verificar logs localmente
npm run lint
npm run test
npm run build

# Verificar configuracao
cat .github/workflows/ci.yml
```

#### CodeRabbit não comenta

1. Verifique se o app esta instalado no repositorio
2. Verifique permissoes do GitHub App
3. Verifique arquivo `.coderabbit.yaml`

### Problemas com Releases

#### Tag ja existe

```bash
# Verificar tags existentes
git tag -l

# Deletar tag local e remota (se necessario)
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

#### CHANGELOG não gerado

1. Verifique formato dos commits (Conventional Commits)
2. Verifique se ha commits desde ultima release
3. Execute manualmente: `npx conventional-changelog`

### Problemas com Security Scan

#### npm audit falha

```bash
# Forcar resolucao
npm audit fix --force

# Ignorar vulnerabilidade especifica (com cuidado)
npm audit --ignore-advisories=ADVISORY_ID
```

---

## Referencias

### Documentacao AIOS

- [Regras de Uso MCP](../../.claude/rules/mcp-usage.md)
- [Operacoes N8N](../../.claude/rules/n8n-operations.md)
- [Estrutura de Documentacao](../../.claude/rules/documentation-structure.md)

### Documentacao Externa

- [GitHub Actions](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Docker MCP Toolkit](https://docs.docker.com/mcp/)

### Tasks Relacionadas

| Task | Descrição |
|------|-----------|
| [Pre-Push Quality Gate](.aios-core/development/tasks/github-devops-pre-push-quality-gate.md) | Validacao antes do push |
| [Version Management](.aios-core/development/tasks/github-devops-version-management.md) | Gerenciamento de versoes |
| [CI/CD Configuration](.aios-core/development/tasks/ci-cd-configuration.md) | Configuracao de pipelines |
| [Release Management](.aios-core/development/tasks/release-management.md) | Gerenciamento de releases |
| [Environment Bootstrap](.aios-core/development/tasks/environment-bootstrap.md) | Bootstrap de ambientes |

---

## Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Agente** | Gage (Operator) |
| **Ativacao** | `@devops` |
| **Total de Comandos** | 14 |
| **Total de Tasks** | 12 |
| **Areas de Atuacao** | MCP, CI/CD, Releases, Security, Repositories |
| **Regra Principal** | Governanca exclusiva de infraestrutura MCP |
| **Modo Padrao** | Interactive |
| **Versao** | 2.0.0 |

### Comandos Rapidos

```bash
# MCP
@devops *search-mcp "browser automation"
@devops *add-mcp playwright -s user

# Git/GitHub
@devops *push
@devops *cleanup

# CI/CD
@devops *ci-cd github-actions
@devops *release minor

# Security
@devops *security-scan
```

---

*Documento gerado pelo Sistema AIOS - 2026-02-04*
*Mantido por: @devops*
