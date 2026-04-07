# Phase 1: Spec Pipeline

> PRD + Architecture — a planta da casa

---

## Purpose

Antes de construir, você precisa da planta. Pense no @pm como o arquiteto que desenha a casa, no @architect como o engenheiro que calcula se a estrutura aguenta, e no @analyst como o cara que pesquisa o bairro antes de comprar o terreno. Sem essa fase, o pedreiro (@dev) decide tudo sozinho — e aí a casa fica torta.

---

## Execution Steps

### Step 0: Enter Phase (MANDATORY)

Execute runner.md Section 2, Step 1 ("Enter Phase") para N=1 antes de prosseguir.

### Step 1: PRD Creation (@pm)

Dispatch @pm via Agent tool:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-pm.md`
- Task: spec-gather-requirements + spec-write-spec
- Input:
  - User answers from Phase 0
  - Context pack (minds relevantes para o domínio)
  - App-builder project detection results
  - App-builder tech-stack recommendation
  - App-builder template (if matched): `skills/app-builder/templates/{template}/TEMPLATE.md`
  - Market research findings (se `state.json.discovery.market_research.executed == true`):
    * Classificação de soluções (base/componente/referência)
    * Table stakes e gaps identificados
    * Recomendação (build_on_existing, integrate_components, build_from_scratch)
    * `research_folder` path para detalhes completos
- Output: PRD document saved to `.aios/forge-runs/{run_id}/spec/prd.md`

**Se market_research.executed == true — @pm DEVE incorporar no PRD:**

1. **Seção "Análise de Mercado"** no PRD:
   - Soluções encontradas com classificação (base/componente/referência)
   - Table stakes → features marcadas como `[Table Stake]` no PRD
   - Gaps → features marcadas como `[Diferenciação]`
   - Se há solução base: explicar a estratégia (fork + customização vs construção)

2. **Tagueamento de features (OBRIGATÓRIO quando há market research):**
   - `[Table Stake]` = mercado inteiro faz, é obrigatório ter
   - `[Diferenciação]` = gap no mercado, oportunidade de destaque
   - `[Standard]` = comum mas não essencial (nice-to-have)

3. **Se `recommendation == "build_on_existing"`:**
   - Ler `market_research.selected_base` para saber QUAL solução foi escolhida (nome, stack, licença, cobertura)
   - PRD deve focar em **customização**, não construção do zero
   - Escopo muda: "O que precisamos ADICIONAR ao {selected_base.name}"
   - Isso reduz drasticamente o número de stories
   - Stack já vem definida em `selected_base.stack` (não re-decidir)
   - Incluir seção "Estratégia de Customização" no PRD: o que manter, o que adaptar, o que adicionar

4. **Se `recommendation == "integrate_components"`:**
   - PRD lista integrações externas como dependências (não como features a construir)
   - Ex: "Pagamento via Stripe" é uma integração, não um módulo inteiro

Show progress:
```
  🔄 @pm (Morgan) está montando o PRD...
  Pense no PM como o tradutor: ele pega sua ideia
  e transforma numa planta que os engenheiros entendem.
```

### Step 2: Architecture + Research (parallel)

Dispatch in PARALLEL (two Agent tool calls in one message):

**@architect:**
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-architect.md`
- Task: spec-assess-complexity
- Input: PRD from Step 1
- **Constraint — repo structure:** Read `state.json → tech_decisions.repo_structure`. When value is `monorepo_workspaces`, the architecture document MUST define `frontend/` and `backend/` as separate top-level directories. When `single_package`, use flat layout. The @architect owns the definitive directory tree — the scaffold plugin will use this output as source of truth for the CLAUDE.md `## Project Structure` section.
- Output: Complexity score + architecture document (including directory structure)
- Save to: `.aios/forge-runs/{run_id}/spec/architecture.md`

**@analyst (conditional — smart skip):**
- **SKIP para pesquisa de mercado** se `state.json.discovery.market_research.executed == true` — Phase 0 já fez via `/tech-search`. Pesquisar de novo seria redundante.
- **Ainda despachar** se o projeto precisa de pesquisa TÉCNICA específica (ex: "como funciona FHIR para prontuários", "qual a melhor lib de real-time para Node.js"). A distinção: mercado (já feito) vs técnico (pode ser necessário).
- Only dispatch if project involves unfamiliar technical domain OR needs deep technical research not covered by market analysis
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-analyst.md`
- Task: research (technical focus, not market)
- Input: PRD + specific technical questions
- Inject: relevant minds from context-pack (ex: @hormozi for growth, @munger for strategy)
- Output: Research brief
- Save to: `.aios/forge-runs/{run_id}/spec/research.md`

Show parallel progress:
```
  ┌──────────────┐    ┌──────────────┐
  │  @architect  │    │  @analyst    │
  │  Aria         │    │  Atlas       │
  │  🔄 design   │    │  🔄 research │
  └──────────────┘    └──────────────┘
```

### Step 3: Spec Finalization (@pm)

Dispatch @pm again:
- Input: PRD + architecture + research (if available)
- Task: Finalize spec with implementation plan
- Output: Final spec with:
  - Epic definition
  - Story breakdown (high-level, detailed stories come in Phase 2)
  - Tech stack confirmed
  - Architecture decisions
- Save to: `.aios/forge-runs/{run_id}/spec/spec-final.md`

### Step 4: MVP Definition Gate (MANDATORY)

**ANTES de qualquer critique, validar que o MVP está definido.**

Check state.json for `mvp` field from Phase 0:

- If `mvp.mode` is "defined" or "assisted":
  - PRD DEVE ter seção "MVP Scope" preenchida com lista clara de features MVP
  - PRD DEVE ter seção "Post-MVP" separada com features futuras
  - Cada feature DEVE estar marcada como `[MVP]` ou `[POST-MVP]`
  - Se faltando: BLOQUEAR e pedir para @pm completar
- If `mvp.mode` is "all":
  - PRD pode ter tudo como MVP (projeto pequeno)
  - MAS se o PRD resultar em > 5 stories, Forge DEVE alertar e sugerir divisão

**Por que isso importa:** Um PRD sem MVP definido é como um mapa sem "você está aqui". Não importa quão bom o mapa é — sem saber o ponto de partida, você se perde. O MVP é o "você está aqui" do projeto.

**Veto Condition:**
```
Se mvp.mode in ["defined", "assisted"] AND seção MVP Scope ausente no PRD:
  → BLOQUEAR
  → Retornar para @pm com instrução: "Defina a seção MVP Scope no PRD"
```

### Step 4b: Core Atom Gate (MANDATORY)

**Após MVP, validar que o Core Atom está definido.**

Check state.json for `core_atom` field from Phase 0:
- If `core_atom.risk_level` is "high" or "medium":
  - PRD DEVE ter seção "Core Atom" preenchida
  - Proof of Life (PoL) DEVE estar definido com comando CLI
  - Core Atom DEVE estar DENTRO do escopo MVP (se é arriscado, é a primeira coisa a validar)
  - Se faltando: BLOQUEAR e pedir para @pm completar
- If `core_atom` is "CRUD padrão" or `risk_level` is "low":
  - Seção Core Atom pode ser simplificada
  - PoL não é obrigatório

**Veto Condition:**
```
Se core_atom.risk_level in ["high", "medium"] AND seção Core Atom incompleta:
  → BLOQUEAR
  → Retornar para @pm com instrução: "Preencha a seção Core Atom do PRD"

Se core_atom.risk_level in ["high", "medium"] AND Core Atom NÃO está no MVP:
  → ALERTAR: "O Core Atom é a coisa mais arriscada. Se não está no MVP, quando vai ser validado?"
  → Sugerir mover para MVP
```

### Step 5: Spec Critique (@qa)

Dispatch @qa:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-qa.md`
- Task: spec-critique
- Input: Final spec
- Scoring: 1-5 scale on completeness, clarity, testability, feasibility
- **Score MVP Definition**: Is MVP scope clear? Features properly tagged [MVP] vs [POST-MVP]? MVP is small enough to deliver fast but complete enough to validate the idea?
- **Score Core Atom section** (if applicable): Is PoL testable? Risks documented? Core Atom inside MVP?
- Veto: Average score < 4.0
  - If veto: return to @pm with @qa's feedback (max 2 iterations)
  - After 2: proceed with concerns noted
- Output: Critique report

### Step 5: CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Spec Pipeline Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 PRD: {title} ({N} páginas)
  🏗️ Arquitetura: {stack} ({complexity_level})
  📊 Stories previstas: ~{N} stories ({M} MVP + {K} post-MVP)
  🎯 MVP: {mvp_scope_summary}
  ✅ QA Score: {score}/5.0

  Resumo: {2-3 sentence summary}

  1. Aprovar e criar stories
  2. Ajustar spec (me diz o que mudar)
  3. Parar aqui (salvo o progresso)
```

### Step 6: Update State

Save to state.json:
```json
{
  "phases": {
    "1": {
      "status": "completed",
      "spec_path": ".aios/forge-runs/{run_id}/spec/spec-final.md",
      "architecture_path": ".aios/forge-runs/{run_id}/spec/architecture.md",
      "complexity": "STANDARD",
      "qa_score": 4.2,
      "estimated_stories": 8
    }
  }
}
```

---

## Outputs

- `spec/prd.md` — Product Requirements Document
- `spec/architecture.md` — Architecture decisions + complexity assessment
- `spec/research.md` — Research brief (if applicable)
- `spec/spec-final.md` — Consolidated spec with implementation plan
- User approval to proceed to Phase 2

---

## Ecosystem Context Injection

In this phase, inject from context-pack:
- **Minds with strategic expertise** (if project involves business decisions)
- **App-builder templates** (for stack and scaffolding guidance)
- **Domain-specific skills** (ex: nextjs-react-expert for React projects)

Do NOT inject implementation-level skills yet — those come in Phase 3.
