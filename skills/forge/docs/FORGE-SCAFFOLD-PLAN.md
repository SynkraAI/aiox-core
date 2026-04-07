# Plano: Forge Scaffold — CLAUDE.md automático + Setup AIOS

> **Status:** COMPLETO
> **Criado em:** 2026-04-04
> **Contexto:** O Forge gera código mas não gera a "certidão de nascimento" do projeto (.claude/CLAUDE.md). Além disso, não pergunta ao usuário se quer setup AIOS completo ou mínimo. Resultado: projetos nascem sem instruction files e sem governança.

---

## Problema

1. **Sem CLAUDE.md** — o @dev implementa sem saber convenções, import paths, naming, comandos. Cada agente "adivinha" as regras.
2. **Sem setup AIOS** — o Forge cria `.aios/forge-runs/` mas não cria `.aios/INDEX.md`, `memory/`, etc. O projeto fica "órfão" do ecossistema.
3. **Sem `.claude/settings.json`** — hooks do AIOS (Synapse, validadores) não são herdados automaticamente em projetos HYBRID.

---

## Solução: 2 Features

### Feature A: Plugin `forge-scaffold` — Gera CLAUDE.md automaticamente

**Tipo:** Plugin (priority 6, core band) + arquivo fonte

**Quando dispara:** `before:phase:3` (antes do @dev começar a codar)

**O que faz:**
1. Verifica se `.claude/CLAUDE.md` já existe no projeto
2. Se NÃO existe: gera um CLAUDE.md com base em:
   - `tech_decisions` do state.json (stack, ORM, DB, deploy)
   - Arquitetura definida pelo @architect (Phase 1)
   - Convenções padrão do AIOS (absolute imports, kebab-case, etc.)
   - Scripts do package.json (npm run dev, test, lint, build)
   - Template usado (se modo TEMPLATE)
3. Se JÁ existe: lê o existente e faz merge inteligente (adiciona seções faltantes sem sobrescrever)

**Conteúdo gerado:**

```markdown
# {project_name}

## Stack
- {framework} {version}
- {database}
- {ORM}
- TypeScript strict

## Comandos
- `npm run dev` — dev server
- `npm run build` — build produção
- `npm run test` — testes
- `npm run lint` — linter

## Convenções
- Absolute imports com @/ alias
- Componentes em src/components/ (PascalCase)
- Arquivos kebab-case
- 2-space indentation, single quotes, semicolons
- Wrap operations em try/catch com context

## Estrutura
{directory structure do architect ou template}

## Segurança
- Nunca commitar .env ou credenciais
- Validar input do usuário em todas as API routes
```

**Plugin schema:**

```yaml
plugin:
  name: forge-scaffold
  version: "1.0.0"
  description: "Generates .claude/CLAUDE.md and project scaffold before build starts"

activation:
  enabled: true
  modes:
    - FULL_APP
    - SINGLE_FEATURE
    - TEMPLATE
    - REPLAY

priority: 6  # Core band — runs before ecosystem scanner

hooks:
  - event: "before:phase:3"
    action: inject
    source: "{FORGE_HOME}/forge-scaffold.md"
    section: "1. Generate CLAUDE.md"
    description: |
      Check if .claude/CLAUDE.md exists.
      If not: generate from tech_decisions + architecture + conventions.
      If yes: merge missing sections without overwriting.

  - event: "before:phase:3"
    action: inject
    source: "{FORGE_HOME}/forge-scaffold.md"
    section: "2. Generate .gitignore"
    description: |
      Check if .gitignore exists.
      If not: generate with standard ignores (node_modules, .env, .next, etc.)
      If yes: check for missing critical entries (.env, credentials)

state_key: "forge_scaffold"
```

### Feature B: Setup AIOS na Phase 0

**Tipo:** Modificação da Phase 0 (phase-0-discovery.md)

**Quando:** No final da Phase 0 Discovery, antes de criar o state.json

**O que faz:**

1. Detecta se o projeto tem estrutura AIOS (`.aios/INDEX.md`)
2. Se NÃO tem, pergunta:

```
Esse projeto não tem estrutura AIOS. Como quer configurar?

> 1. **Setup completo** — .aios/ + docs/stories/ + .claude/CLAUDE.md + memory
>    Pra projetos que você vai manter e evoluir. Tracking completo.
> 2. **Setup mínimo** — só .claude/CLAUDE.md
>    Pra projetos rápidos. O Forge cria o mínimo necessário.
> 3. **Sem setup** — eu cuido disso depois
>    Forge roda sem criar estrutura no projeto.
```

3. Se opção 1 (completo):
   - Criar `.aios/INDEX.md` (governança local)
   - Criar `.aios/memory/` (pra project-context.md futuro)
   - Criar `docs/stories/active/` e `docs/stories/done/`
   - Criar `.claude/CLAUDE.md` (via forge-scaffold plugin)
   - Atualizar `docs/projects/ACTIVE.md` no aios-core (registro centralizado)

4. Se opção 2 (mínimo):
   - Criar `.claude/CLAUDE.md` (via forge-scaffold plugin)
   - Forge cria `.aios/forge-runs/` automaticamente quando precisar

5. Se opção 3 (sem setup):
   - Prosseguir sem criar nada
   - Forge cria `.aios/forge-runs/` automaticamente

---

## Arquivos a Criar

| Arquivo | Propósito |
|---------|-----------|
| `skills/forge/plugins/forge-scaffold.yaml` | Plugin (priority 6) |
| `skills/forge/forge-scaffold.md` | Protocolo de geração do CLAUDE.md + .gitignore |

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `skills/forge/phases/phase-0-discovery.md` | Novo step "AIOS Setup" antes de criar state.json |
| `skills/forge/SKILL.md` | §9: adicionar `forge-scaffold.md` |
| `skills/forge/plugins/SCHEMA.md` | Documentar o padrão de scaffold |

---

## Checklist

### Feature A — Plugin forge-scaffold

- [x] Criar `plugins/forge-scaffold.yaml` (priority 6, hooks before:phase:3)
- [x] Criar `forge-scaffold.md` com seções: Generate CLAUDE.md, Generate .gitignore
- [x] Definir template do CLAUDE.md gerado (baseado em tech_decisions + architecture)
- [x] Implementar lógica de merge (se CLAUDE.md já existe, não sobrescrever)
- [x] Atualizar `SKILL.md` §9 com forge-scaffold.md
- [x] Rodar `validate-plugins.cjs` — deve passar 14/14

### Feature B — Setup AIOS na Phase 0

- [x] Adicionar step "AIOS Setup" em `phase-0-discovery.md` (após Discovery, antes de state.json)
- [x] Implementar 3 opções (completo, mínimo, sem setup)
- [x] Opção 1 cria: .aios/INDEX.md, .aios/memory/, docs/stories/
- [x] Opção 1 atualiza docs/projects/ACTIVE.md no aios-core
- [x] Opção 2 delega pro forge-scaffold plugin
- [ ] Testar no forge-test-lab

---

## Verificação

1. `node skills/forge/scripts/validate-plugins.cjs` — 14/14 plugins
2. Rodar `/forge feature "adicionar campo de prioridade"` no forge-test-lab
3. Verificar que `.claude/CLAUDE.md` foi gerado automaticamente
4. Verificar que o conteúdo reflete a stack real do projeto
5. Rodar `/forge` em projeto novo (greenfield) e verificar que setup AIOS é oferecido

---

## Referências

- Padrão CLAUDE.md: `~/.claude/CLAUDE.md` (global) e `.claude/CLAUDE.md` (por projeto)
- Padrão AIOS setup: `bin/aiox-init.js` (setup interativo existente)
- Template de INDEX.md: `docs/projects/ensinio/INDEX.md`
- Regra de HYBRID mode: `.claude/rules/behavioral-rules.md` → "PROJECT STRUCTURE"
