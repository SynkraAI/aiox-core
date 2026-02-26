# Codex Handoff: Critical Analysis — Epic INS-4 (Installation Health)

**From:** @pm (Morgan)
**To:** Codex (Critical Reviewer)
**Date:** 2026-02-23
**Epic:** [INS-4 — Installation Health & Environment Sync](INDEX.md)
**Architect Handoff:** [handoff-architect-to-pm-epic-installation-health.md](../../handoffs/handoff-architect-to-pm-epic-installation-health.md)
**Objective:** Analise critica investigativa profunda no codigo real do projeto, installer e scripts para encontrar gaps, riscos ocultos e premissas incorretas no Epic INS-4 e suas 8 stories.

---

## 1. Contexto Executivo

O Epic INS-4 propoe 8 stories (~24 pontos) para corrigir 8 gaps no installer que impedem fresh installs/upgrades de entregar um ambiente completo. Os gaps foram identificados numa auditoria de alto nivel. **O Codex deve validar se esses gaps sao reais, se ha gaps NAO identificados, e se as solucoes propostas sao viaveis dado o codigo existente.**

### O Que Ja Foi Decidido

- Epic aprovado pelo PM com sizing ajustado (34 → 24 pontos)
- INS-4.7 (Smart Merge) scoped para fase 1 (add new keys only)
- 7 rules files (nao 5 como handoff original dizia)
- INS-4 Wave 1 antes de Epic TOK

### O Que o Codex Deve Questionar

- Viabilidade real de cada story no codebase atual
- Premissas sobre complexidade e sizing
- Gaps nao identificados na auditoria
- Conflitos com codigo existente (installer, validator, upgrader)
- Riscos de regressao

---

## 2. Mapa do Codebase (Alvos de Investigacao)

### 2.1 Entry Points do Installer

| Arquivo | Linhas | Funcao | Investigar |
|---------|--------|--------|------------|
| `bin/aios.js` | 1.141 | Router CLI principal, dispatch doctor/install/update | Como `runDoctor()` funciona? Que checks existem? Como `runWizard()` e chamado? |
| `bin/aios-init.js` | 1.230 | Installer legacy (DEPRECATED) | Ainda e fallback ativo? Que artefatos ele copia hoje? Ele gera settings.json? |

**Perguntas-chave:**
- O `bin/aios.js` delega para `packages/installer/src/wizard/index.js` — mas em que cenarios cai no fallback `aios-init.js`?
- O doctor atual em `aios.js` (linhas ~350-400) — quantos checks reais tem? O que valida?
- Existe duplicacao de logica entre `aios.js` doctor e `post-install-validator.js`?

### 2.2 Installer Package (47 files)

| Arquivo | Linhas | Investigar |
|---------|--------|------------|
| `packages/installer/src/wizard/index.js` | 861 | Fluxo completo de instalacao. Que artefatos copia? Chama IDE sync? Gera settings.json? |
| `packages/installer/src/wizard/ide-config-generator.js` | ? | Que configs de IDE gera? Inclui settings.json? |
| `packages/installer/src/installer/aios-core-installer.js` | 426 | Core installer logic. Como copia `.aios-core/`? |
| `packages/installer/src/installer/post-install-validator.js` | 1.522 | Validador pos-install. 1.5K linhas — O QUE valida? Checa settings.json? Rules? |
| `packages/installer/src/installer/brownfield-upgrader.js` | 438 | Upgrade logic. Como detecta user modifications? Que merge strategy usa? |
| `packages/installer/src/installer/manifest-signature.js` | 378 | Manifest com assinatura. INS-4.7 (merge) precisa respeitar isso? |
| `packages/installer/src/installer/file-hasher.js` | 234 | Hash comparison. Usado pelo upgrader — INS-4.7 precisa integrar? |
| `packages/installer/src/config/templates/core-config-template.js` | 197 | Template de core-config. Que keys define? INS-4.7 precisa atualizar? |

**Modulo Merger existente (CRITICO para INS-4.7):**

| Arquivo | Funcao |
|---------|--------|
| `packages/installer/src/merger/index.js` (71 linhas) | Entry point do merger |
| `packages/installer/src/merger/strategies/base-merger.js` | Strategy base |
| `packages/installer/src/merger/strategies/env-merger.js` | Merge para .env |
| `packages/installer/src/merger/strategies/markdown-merger.js` | Merge para markdown |
| `packages/installer/src/merger/strategies/replace-merger.js` | Replace strategy |

**Perguntas-chave:**
- O merger modulo JA EXISTE com 7+ files. INS-4.7 propoe "smart merge" — ele pode REUSAR o merger existente ou precisa de algo novo?
- O `post-install-validator.js` tem 1.522 linhas — quantos checks faz? Ha sobreposicao com o doctor proposto em INS-4.1?
- O wizard `index.js` (861 linhas) — qual e o fluxo exato? Em que ponto da pipeline os novos artefatos (settings.json, rules, IDE sync) devem ser inseridos?
- `ide-config-generator.js` — ja gera algum settings.json ou so configs de IDE?

### 2.3 IDE Sync Engine

| Arquivo | Linhas | Investigar |
|---------|--------|------------|
| `.aios-core/infrastructure/scripts/ide-sync/index.js` | 540 | Orchestrador. Commands: sync, validate, report. Que IDEs suporta? |
| `.aios-core/infrastructure/scripts/ide-sync/agent-parser.js` | 295 | Parser de agentes. Que formato espera? |
| `.aios-core/infrastructure/scripts/ide-sync/validator.js` | 273 | Validacao. Que checks faz? |
| `.aios-core/infrastructure/scripts/ide-sync/transformers/*.js` | 4 files | Transformers: claude-code, cursor, antigravity, github-copilot |

**Perguntas-chave:**
- INS-4.5 propoe "chamar ide-sync do installer". O ide-sync tem API programatica ou so CLI?
- O ide-sync copia rules files? Copia settings.json? Ou so agents?
- O validator do ide-sync ja valida consistencia agents ↔ agent definitions?

### 2.4 Config System

| Arquivo | Linhas | Investigar |
|---------|--------|------------|
| `.aios-core/core/config/config-resolver.js` | 607 | Resolve config de todas as sources. Que sources? |
| `.aios-core/core/config/config-loader.js` | 279 | Loader YAML. Discovery de configs |
| `.aios-core/core/config/merge-utils.js` | 101 | Deep merge. INS-4.7 pode reusar? |
| `.aios-core/core/config/migrate-config.js` | 291 | Migracao de schema. INS-4.7 precisa disso? |

**Perguntas-chave:**
- `config-resolver.js` (607 linhas) — resolve boundary config? Sabe sobre frameworkProtection?
- `merge-utils.js` — que tipo de merge faz? E 3-way ou simples deep merge?
- `migrate-config.js` — ja existe logica de migracao de schema? INS-4.7 pode reusar?
- Ha validacao de schema em `core-config.yaml`? Ou e free-form YAML?

### 2.5 Entity Registry

| Arquivo | Linhas | Investigar |
|---------|--------|------------|
| `.aios-core/development/scripts/populate-entity-registry.js` | 650 | Scanner. Quanto demora? Que entidades descobre? |

**Perguntas-chave:**
- O populate script demora quanto para rodar? Se demora >30s, vai degradar UX do installer.
- Ele requer dependencias que podem nao estar instaladas no momento do install?
- Ele e idempotente? Pode rodar N vezes sem side effects?
- O pre-push hook ja chama `ids-pre-push.js` para sync — isso e redundante com INS-4.6?

### 2.6 Hooks Existentes

| Arquivo | Linhas | Conteudo |
|---------|--------|---------|
| `.husky/pre-commit` | 9 | Framework guard (BM-3) + manifest sync |
| `.husky/pre-push` | 5 | IDS registry sync (nao-bloqueante) |
| `.husky/post-commit` | 11 | Cache clear + IDS registry update |

**Perguntas-chave:**
- INS-4.6 menciona "instala pre-push hook que atualiza registry incrementalmente" — mas `.husky/pre-push` JA FAZ ISSO (`ids-pre-push.js`). Duplicacao?
- O framework guard (pre-commit) depende de `bin/utils/framework-guard.js` — este arquivo existe?
- Se o installer nao instala hooks (gap 5), como eles chegam no projeto? Via `husky install`?

### 2.7 Settings.json Atual

`.claude/settings.json` contem ~60+ deny rules cobrindo todos os subdiretorios de `.aios-core/core/` (L1), com allow exceptions para `config/schemas/` e `config/template-overrides.js`.

**Perguntas-chave:**
- Quantas deny rules no total? Quantas allow rules?
- O INS-4.2 (generator) precisa replicar exatamente essas rules a partir de `core-config.yaml` — o `core-config.yaml` atual tem TODAS essas paths listadas na secao `boundary`?
- Se o core-config NAO lista todos os paths, de onde vem as rules? Sao hardcoded?

---

## 3. Pontos de Investigacao por Story

### INS-4.1: `aios doctor`

1. **Ler `bin/aios.js` linhas 350-450** — entender o doctor atual. Quantos checks reais? E so placeholder?
2. **Comparar com `post-install-validator.js`** (1.522 linhas) — ha sobreposicao? O doctor deveria CHAMAR o validator ou ser independente?
3. **O doctor propoe 12 checks.** O validator ja faz checks semelhantes? Quais?
4. **O `--fix` flag e seguro?** Que operacoes de fix sao irreversiveis?
5. **Proposta diz `bin/aios-doctor.js` + `.aios-core/core/doctor/`** — mas `core/` e L1 (deny rules). Onde vai o codigo? Se for em `core/`, precisa de allow exception ou contributor mode.

### INS-4.2: Settings.json Generator

1. **Ler `core-config.yaml` secao `boundary`** — que paths lista? Coincide com settings.json atual?
2. **Se o config NAO lista todos os paths**, o generator precisa de uma fonte alternativa (ex: scan de `.aios-core/core/` dirs dinamicamente?)
3. **O generator precisa preservar customizacoes do usuario** — como distingue secao gerada de secao manual? Precisa de marcadores no JSON?
4. **Idempotencia** — rodar N vezes deve produzir mesmo resultado. JSON nao tem ordem garantida de keys — isso importa?

### INS-4.3: Installer Settings + Rules

1. **Ler o fluxo do wizard** (`packages/installer/src/wizard/index.js` 861 linhas) — em que ponto insere a geracao de settings.json e copia de rules?
2. **O `aios-core-installer.js` (426 linhas)** — como copia `.aios-core/`? Usa manifest? Ha step hooks para executar scripts pos-copia?
3. **As rules files (7) estao em `.claude/rules/`** — essas vem do repo dev ou de um template? Se vem do repo, precisam ser copiadas do `.aios-core/` source para o projeto target.
4. **Para projetos (nao framework-dev):** rules files devem ser copiadas. Para framework-dev: rules files ja existem no repo. O installer precisa distinguir modos?

### INS-4.4: CLAUDE.md Template v5

1. **Ler template atual** em `.aios-core/product/templates/ide-rules/claude-rules.md` — que secoes tem? Que secoes faltam?
2. **O CLAUDE.md atual do projeto** (`.claude/CLAUDE.md`, 354 linhas) ja foi customizado manualmente — como o template v5 se reconcilia com customizacoes existentes?
3. **Marcadores `<!-- FRAMEWORK-OWNED -->` e `<!-- PROJECT-CUSTOMIZED -->`** ja existem no CLAUDE.md — o installer respeita esses marcadores ao atualizar?
4. **Ha um merger existente** (`packages/installer/src/merger/strategies/markdown-merger.js`) — ele pode ser reusado para merge seletivo de secoes FRAMEWORK-OWNED?

### INS-4.5: IDE Sync Integration

1. **Ler `ide-sync/index.js`** — tem API programatica (funcao exportada) ou so CLI (process.argv)?
2. **O wizard ja chama algo de IDE config** (`ide-config-generator.js`) — qual a relacao com ide-sync? Duplicacao? Complementar?
3. **Que formatos o ide-sync produz?** Markdown para Claude Code, MDC para Cursor? Que transformacao faz?
4. **O ide-sync valida que todos os 10 agents existem** ou so copia o que encontrar?

### INS-4.6: Entity Registry on Install

1. **Ler `populate-entity-registry.js`** (650 linhas) — quanto demora? Que dependencias precisa?
2. **O pre-push hook (`ids-pre-push.js`)** ja faz update incremental do registry. INS-4.6 propoe "instalar pre-push hook que atualiza incrementalmente" — **isso JA EXISTE**. Duplicacao?
3. **O sanity check ">= 500 entidades"** — e valido para qualquer projeto ou so para aios-core? Um projeto novo pode ter <100 entidades legitimamente.
4. **O scanner precisa do codebase copiado primeiro** — em que momento do install flow ele roda? Se roda antes de copiar `.aios-core/`, vai falhar.

### INS-4.7: Config Smart Merge

1. **O merger module ja existe** em `packages/installer/src/merger/` com 7 files. Que strategies tem? Alguma para YAML?
2. **O brownfield-upgrader.js** ja tem logica de "detect user-modified files" — INS-4.7 pode integrar com isso?
3. **O `config-resolver.js`** (607 linhas) resolve config de multiplas sources. Ele faz merge? INS-4.7 pode reusar?
4. **O `migrate-config.js`** (291 linhas) migra schema. INS-4.7 precisa rodar apos migracao ou antes?
5. **Fase 1 (add new keys only)** — o merger existente ja tem `strategies/replace-merger.js` — ele pode ser adaptado?

### INS-4.8: Health Check Task

1. **Existe um modulo `.aios-core/core/health-check/`** (mencionado nas deny rules do settings.json). Que conteudo tem? INS-4.8 pode reusar?
2. **A task propoe "executa aios doctor internamente"** — como um agente (que roda dentro do Claude Code) executa um CLI command? Via `Bash` tool? Via require()?
3. **O aios-master tem tasks em `.aios-core/development/tasks/`** — existe alguma task de health-check la?

---

## 4. Riscos que o Codex Deve Investigar

### 4.1 Sobreposicao Doctor vs Validator

O `post-install-validator.js` tem **1.522 linhas** com validacao extensa (manifest, signatures, file integrity). O doctor proposto em INS-4.1 quer fazer 12 checks. Ha risco de duplicacao massiva. **O Codex deve determinar:**
- Quantos checks o validator ja faz?
- O doctor deveria ser uma CAMADA SOBRE o validator ou independente?
- Faz sentido refatorar o validator para ser reutilizavel pelo doctor?

### 4.2 Merger ja Existente

O modulo `packages/installer/src/merger/` tem 7 files com strategies para env, markdown, e replace. INS-4.7 propoe "smart merge para core-config.yaml" (YAML). **O Codex deve determinar:**
- Ha uma YAML merge strategy? Se nao, quanto trabalho e criar uma?
- O merger existente segue um pattern de strategy — INS-4.7 pode adicionar `yaml-merger.js`?
- O sizing de 3 pontos e realista dado o pattern existente?

### 4.3 Boundary L1 para Doctor Code

INS-4.1 propoe criar `bin/aios-doctor.js` + `.aios-core/core/doctor/`. Mas `.aios-core/core/` e L1 com deny rules. **O Codex deve determinar:**
- O doctor code pode ir em `.aios-core/core/doctor/` (L1) sendo que estamos em modo framework-dev?
- Para projetos: o doctor code vem pre-instalado dentro de `.aios-core/core/` — portanto deny rules nao impedem EXECUCAO, so EDICAO. Confirmar.
- Ha precedente de outros modulos em `.aios-core/core/` (health-check, graph-dashboard)?

### 4.4 IDE Sync API vs CLI

INS-4.5 assume que ide-sync pode ser chamado programaticamente do installer. **O Codex deve verificar:**
- `ide-sync/index.js` exporta funcoes ou so tem CLI parsing?
- Se e so CLI, INS-4.5 precisa refatorar para exportar API — isso aumenta sizing.

### 4.5 Entity Registry Timing

INS-4.6 propoe rodar populate-entity-registry.js no install. **O Codex deve verificar:**
- O script demora quanto? Se >30s, degrada UX severamente.
- Pode rodar em background (nao bloqueante)?
- Depende de packages npm instalados? Se sim, precisa rodar APOS npm install.

### 4.6 Settings.json Source of Truth

INS-4.2 assume que `core-config.yaml` boundary section e a source of truth para deny rules. **O Codex deve verificar:**
- O `core-config.yaml` atual lista TODOS os paths que aparecem em `settings.json`? Ou ha paths hardcoded?
- Se ha divergencia, o generator precisa de uma segunda fonte ou o config precisa ser enriquecido primeiro.

### 4.7 Husky Hooks no Fresh Install

Os hooks existem em `.husky/`. **O Codex deve verificar:**
- Em fresh install, `npx aios-core install` instala hooks? Ou depende de `npx husky install` separado?
- Se o usuario nao roda `npm install` (so `npx aios-core install`), os hooks existem?
- O `package.json` tem `prepare: "husky install"`?

### 4.8 Regressao no Installer Existente

O installer funciona hoje (com gaps). INS-4 insere novos steps. **O Codex deve verificar:**
- Ha testes do installer existentes? Que coverage tem?
- Quantos testes unitarios/integracao em `packages/installer/tests/`?
- O wizard tem testes? O upgrader tem testes?
- Se nao ha testes, INS-4 precisa incluir regression tests — e os pontos cobrem isso?

---

## 5. Perguntas Diretas para o Codex

1. **O sizing de 24 pontos e realista?** Ou esta sub/superestimado dado o codebase existente?
2. **Ha gaps que a auditoria NAO encontrou?** Algo no codigo que contradiz as premissas do epic?
3. **As 3 waves fazem sentido?** Ou a ordem deveria ser diferente dado dependencias reais no codigo?
4. **INS-4.1 (doctor) e INS-4.2 (generator) sao realmente independentes?** Ou ha dependencia implicita?
5. **INS-4.7 fase 1 (add new keys) e simples o suficiente para 3 pontos?** Dado o merger existente e as complexidades de YAML?
6. **O epic precisa de stories adicionais** que nao foram propostas?
7. **Ha dead code ou modulos abandonados** no installer que deveriam ser limpos antes de adicionar novos steps?
8. **A proposta e viavel com `frameworkProtection: false`** (modo framework-dev) e com `frameworkProtection: true` (modo projeto)?

---

## 6. Formato de Entrega Esperado

O Codex deve entregar `CODEX-CRITICAL-ANALYSIS.md` no diretorio do epic (`docs/stories/epics/epic-installation-health/`) com:

1. **Veredito executivo** — GO / GO com condicoes / NO-GO
2. **Achados por severidade** — CRITICO / ALTO / MEDIO
3. **Resposta a cada uma das 8 perguntas** da secao 5
4. **Ajustes recomendados por story** — sizing, escopo, dependencias
5. **Gaps nao identificados** — se encontrar
6. **Riscos adicionais** com mitigacao

---

*Handoff gerado por @pm (Morgan) em 2026-02-23*
*Baseado em: Epic INS-4 INDEX.md, Architect Handoff, Codebase Map (47 installer files, 90+ infrastructure scripts, 68 development scripts)*

--- Morgan, planejando o futuro
