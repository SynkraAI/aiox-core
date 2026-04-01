# Workflow: Brownfield (Projeto Existente)

> Scan + Diagnose + Plan — entrar num projeto e entender antes de mexer

---

## When to Use

- User runs `/forge scan`
- User runs `/forge` dentro de um projeto que já existe
- Forge detecta projeto existente (package.json, .git) e nenhum run anterior

---

## Pipeline

```
Phase 0 (Discovery + Project Awareness) -> Diagnostic Report -> Action Plan -> User decides next
```

Este workflow NÃO implementa nada. Ele analisa, diagnostica, e pergunta ao usuário o que fazer.
Depois que o usuário decide, despacha para o workflow adequado (full-app, single-feature, ou bug-fix).

---

## Execution

### Phase 0: Discovery + Project Awareness

Read `{FORGE_HOME}/phases/phase-0-discovery.md`, mas com estas diferenças:

1. **Project Awareness roda PRIMEIRO** (antes das perguntas)
2. Socratic Gate adaptado: perguntas sobre o projeto existente, não sobre criar algo novo

Perguntas brownfield:
```
Vi que o projeto já existe. Me conta:

1. O que você quer fazer aqui? (nova feature, corrigir bug, refatorar, entender o código)
2. Tem algo específico que te incomoda ou que você quer melhorar?
```

### Diagnostic Phase (única deste workflow)

Dispatch `@architect` via Agent tool para fazer o assessment:

1. **Stack Analysis:**
   - Ler `package.json` → dependências, scripts, versões
   - Ler `tsconfig.json` ou equivalente → configuração
   - Identificar: framework, ORM, auth, styling, test framework

2. **Code Structure:**
   - `ls` top-level → organização de pastas
   - Contar arquivos por tipo (`.ts`, `.tsx`, `.css`, etc.)
   - Identificar patterns: monorepo? feature-based? layer-based?

3. **Health Check:**
   - `npm run lint` → quantos erros?
   - `npm run typecheck` → quantos erros?
   - `npm test` → quantos testes? passando?
   - `git log -10 --oneline` → atividade recente

4. **Documentation:**
   - Tem README? CLAUDE.md? .aios/INDEX.md?
   - Tem stories ativas? (`docs/stories/active/`)
   - Tem tests? Qual cobertura?

### Report

Mostrar ao usuário:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔍 Diagnostic Report — {project name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 Stack: Next.js 14 + Prisma + Tailwind + Clerk
  📁 Estrutura: Feature-based (src/features/)
  📊 Tamanho: ~120 arquivos, ~8K linhas

  ✅ Lint: 0 erros
  ⚠️ TypeCheck: 3 erros
  ✅ Tests: 24 passando, 0 falhando
  📝 Cobertura: ~45%

  🔎 Pontos de atenção:
  - 3 erros de TypeScript em src/features/auth/
  - Sem README atualizado
  - 2 dependencies desatualizadas (major version)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Action Plan

Baseado no diagnóstico + o que o usuário disse que quer:

```
  O que posso fazer por você:

  1. 🔧 Corrigir os 3 erros de TypeScript (/forge fix)
  2. ✨ Implementar uma feature nova (/forge feature)
  3. 🏗️ Refatorar uma área do código
  4. 📋 Criar stories para melhorias identificadas
  5. 🔍 Mergulhar mais fundo em uma área específica

  Qual desses? (ou me diz outra coisa)
```

Quando o usuário escolhe, o Forge:
1. **Criar state.json ANTES do routing** (CRITICAL — sem isso o workflow destino quebra):
   - Generate run_id: `forge-{slug}-{YYYYMMDD-HHmm}`
   - Create run folder: `.aios/forge-runs/{run_id}/`
   - Write state.json with: mode = workflow destino, status = "running", current_phase = 0
   - Copy context-pack.json from scan results
   - Save diagnostic report path in state.json
2. Salvar o diagnostic report em `.aios/forge-runs/{run_id}/diagnostic.md`
3. Despachar para o workflow correto (feature, fix, etc.)
4. O Project Awareness + diagnostic ficam no context-pack — os agentes vão saber sobre o projeto

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| Scan + Diagnose | @architect | — |
| Route to workflow | (Forge core) | — |

---

## Outputs

- Diagnostic report (stack, health, structure)
- Action plan options
- Project context saved for subsequent runs
- User decision → routes to appropriate workflow
