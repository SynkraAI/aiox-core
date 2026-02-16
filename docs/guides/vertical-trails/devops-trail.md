# Trilha @devops: Do Problema ao Output Validado

> **Story:** AIOS-DIFF-4.3.1
> **Agente:** @devops (Gage)
> **Tempo estimado:** 20-40 minutos

---

## Mapa da Trilha

```
PROBLEMA: "Preciso configurar CI/CD e fazer push seguro"
    ↓
WORKFLOW: Setup GitHub → CI/CD Config → Quality Gate → Push
    ↓
TASKS: *setup-github → *ci-cd → *push
    ↓
OUTPUT: Repo configurado + Pipeline ativo + Push com gates verdes
```

---

## Exemplo Reproduzível Passo a Passo

### Cenário

Você está em um projeto AIOS e precisa:
1. Configurar repositório GitHub
2. Criar pipeline CI/CD (GitHub Actions)
3. Fazer push seguro com quality gates
4. Validar que o pipeline executa corretamente

### Pré-requisitos

```bash
# Projeto AIOS inicializado
npx aios-core doctor  # deve retornar healthy

# GitHub CLI autenticado
gh auth status  # deve mostrar usuário logado

# Git configurado
git config user.name   # deve ter valor
git config user.email  # deve ter valor
```

---

### Passo 1: Ativar @devops

```bash
@devops
```

**Output esperado:**
```
-- Gage aqui! DevOps & Infrastructure Specialist.
Pronto para CI/CD, MCP, releases e operações Git.

Quick commands:
  *setup-github      - Configurar repositório GitHub
  *ci-cd             - Configurar pipeline CI/CD
  *push              - Push com quality gates
  *release           - Criar release com changelog
```

---

### Passo 2: Setup do Repositório

```bash
*setup-github
```

**Interação:**
```
Gage: Qual nome do repositório?
Você: my-aios-project

Gage: Visibilidade?
Você: private

Gage: Criar issues templates?
Você: sim

Gage: Habilitar branch protection em main?
Você: sim
```

**Output esperado:**
```
🔧 Configurando repositório GitHub...

✅ Repositório criado: github.com/seu-user/my-aios-project
✅ Branch protection configurada em main
  - Require PR reviews: 1
  - Require status checks: lint, test
✅ Issue templates criados:
  - .github/ISSUE_TEMPLATE/bug_report.md
  - .github/ISSUE_TEMPLATE/feature_request.md
✅ CODEOWNERS criado
✅ Remote origin adicionado

📋 Próximos passos:
  *ci-cd github-actions  - Configurar pipeline
```

**Evidência de sucesso:**
```bash
gh repo view --web  # Abre o repo no browser
```

---

### Passo 3: Configurar CI/CD

```bash
*ci-cd github-actions
```

**Interação:**
```
Gage: Qual stack tecnológica?
Você: Node.js

Gage: Versão do Node?
Você: 20

Gage: Incluir CodeRabbit?
Você: sim

Gage: Stages do pipeline?
Você: lint, test, build
```

**Output esperado:**
```
🔧 Configurando GitHub Actions CI/CD...

📄 Criando .github/workflows/ci.yml

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build

✅ Pipeline CI/CD criado
✅ CodeRabbit integration configurada (.coderabbit.yaml)

📋 Commit e push para ativar:
  git add .github/
  git commit -m "ci: add GitHub Actions pipeline"
  git push
```

**Evidência de sucesso:**
```bash
ls .github/workflows/
# ci.yml
```

---

### Passo 4: Fazer Commit Local

```bash
git add .github/
git commit -m "ci: add GitHub Actions pipeline"
```

---

### Passo 5: Push com Quality Gates

```bash
*push
```

**Output esperado:**
```
🚦 Pre-Push Quality Gate

Step 1/4: Linting
  Running: npm run lint
  ✅ Lint passed (0 errors, 0 warnings)

Step 2/4: Testing
  Running: npm test
  ✅ Tests passed (42 tests, 0 failures)

Step 3/4: Type Checking
  Running: npm run typecheck
  ✅ Types valid (0 errors)

Step 4/4: Build Verification
  Running: npm run build
  ✅ Build successful

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 All quality gates passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pushing to origin/main...
  ✅ Push successful

📋 CI Pipeline triggered:
  https://github.com/seu-user/my-aios-project/actions/runs/xxxxx
```

---

### Passo 6: Verificar Pipeline

```bash
gh run list --limit 1
```

**Output esperado:**
```
STATUS  NAME         WORKFLOW  BRANCH  EVENT  ID
✓       CI Pipeline  ci.yml    main    push   xxxxx
```

---

## Checklist de Validação

| Step | Comando | Output Esperado | ✓ |
|------|---------|-----------------|---|
| 1 | `@devops` | Greeting de Gage | [ ] |
| 2 | `*setup-github` | "Repositório criado" | [ ] |
| 3 | `*ci-cd github-actions` | "Pipeline criado" | [ ] |
| 4 | `git commit` | Commit local | [ ] |
| 5 | `*push` | "All gates passed" | [ ] |
| 6 | `gh run list` | Pipeline verde | [ ] |

---

## Fluxo de Release (Bônus)

Após várias features:

```bash
*version-check
```

**Output:**
```
📊 Version Analysis

Current: 1.0.0
Commits since last release: 5
  - feat: add user authentication
  - fix: resolve login bug
  - docs: update README
  - chore: update deps
  - test: add auth tests

Suggested bump: minor (1.1.0)
  Reason: 1 feat + 1 fix = minor release
```

```bash
*release minor
```

**Output:**
```
🚀 Creating Release v1.1.0

✅ Version bumped in package.json
✅ CHANGELOG.md updated
✅ Git tag v1.1.0 created
✅ GitHub Release published

Release URL:
  https://github.com/seu-user/my-aios-project/releases/tag/v1.1.0
```

---

## Variações da Trilha

### Variação A: GitLab CI
```bash
*ci-cd gitlab
# Gera .gitlab-ci.yml
```

### Variação B: CircleCI
```bash
*ci-cd circleci
# Gera .circleci/config.yml
```

### Variação C: MCP Setup
```bash
*search-mcp "browser automation"
*add-mcp playwright -s project
# Configura MCP para o projeto
```

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `*setup-github` | Configurar repo e proteções |
| `*ci-cd` | Criar pipeline CI/CD |
| `*push` | Push com quality gates |
| `*release` | Criar release com changelog |
| `*version-check` | Analisar versão sugerida |
| `*cleanup` | Limpar branches merged |
| `*security-scan` | Varredura de vulnerabilidades |
| `*add-mcp` | Adicionar servidor MCP |

---

## Troubleshooting

### Quality gate falha em lint
```bash
# Fix automático
npm run lint -- --fix
# Re-run
*push
```

### Pipeline falha no GitHub
```bash
# Ver logs
gh run view --log-failed
# Fix local e re-push
*push
```

### Sem permissão de push
```bash
# Verificar autenticação
gh auth status
# Re-autenticar se necessário
gh auth login
```

---

*Trilha criada para Story AIOS-DIFF-4.3.1*
*-- Gage, automatizando tudo*
