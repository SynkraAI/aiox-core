# Hormozi Squad — Migration Plan: Agent Conformity v2

> **Objetivo:** Alinhar 16 agents do Hormozi Squad com o padrão AIOS/HybridOps de activation
> **Auditor:** @pedro-valerio
> **Data:** 2026-02-10 (v2 — reescrito com dados auditados)
> **Referencia:**
> - AIOS Official: `aios-core/docs/architecture/greeting-system.md`
> - AIOS Official: `aios-core/docs/guides/contextual-greeting-system-guide.md`
> - AIOS Official: `aios-core/docs/aios-workflows/auto-worktree-workflow.md` (Shared Activation Pipeline)
> - Implementation ref: `squads/hybrid-ops-squad/agents/` (pattern compacto)
> - Implementation ref: `squads/advisory-board/agents/naval-ravikant.md` (gold standard)
> **Decisao:** `command_loader` DESCARTADO (experimento de 2/113 agents, nao e padrao)

---

## Auditoria Real (Dados Verificados)

### Status por Secao — 16 Agents

| Secao | Tem | Falta | Prioridade |
|-------|-----|-------|------------|
| `greeting_levels` | 0/16 | **16** | P1 — Padrao AIOS universal |
| `commands.visibility` | 0/16 | **16** | P1 — Filtra greeting por contexto |
| `signature_closing` | 0/16 | **16** | P1 — Identidade no footer |
| `voice_dna` | 10/16 | **6** | P2 — Tier 3 incompletos |
| `handoff_to` | 10/16 | **6** | P2 — Tier 3 incompletos |
| `objection_algorithms` | 10/16 | **6** | P2 — Tier 3 incompletos |
| `output_examples` | 10/16 | **6** | P2 — Tier 3 incompletos |
| `dependencies` | 16/16 | 0 | OK — mas sem checklists mapeados |
| `completion_criteria` | 16/16 | 0 | OK |

### Status por Agent

| Agent | Lines | greeting | visibility | sig_close | voice_dna | handoff | objection | examples | Tier |
|-------|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| hormozi-chief | 1638 | - | - | - | Y | Y | Y | Y | 0 |
| hormozi-offers | 2189 | - | - | - | Y | Y | Y | Y | 1 |
| hormozi-leads | 1012 | - | - | - | Y | Y | Y | Y | 1 |
| hormozi-models | 1337 | - | - | - | Y | Y | Y | Y | 1 |
| hormozi-pricing | 1758 | - | - | - | Y | Y | Y | Y | 2 |
| hormozi-hooks | 1759 | - | - | - | Y | Y | Y | Y | 2 |
| hormozi-ads | 1831 | - | - | - | Y | Y | Y | Y | 2 |
| hormozi-copy | 1963 | - | - | - | Y | Y | Y | Y | 2 |
| hormozi-launch | 1718 | - | - | - | Y | Y | Y | Y | 2 |
| hormozi-retention | 1434 | - | - | - | Y | Y | Y | Y | 2 |
| hormozi-advisor | 1697 | - | - | - | - | - | - | - | 3 |
| hormozi-audit | 2111 | - | - | - | - | - | - | - | 3 |
| hormozi-closer | 2411 | - | - | - | - | - | - | - | 3 |
| hormozi-content | 1937 | - | - | - | - | - | - | - | 3 |
| hormozi-scale | 2089 | - | - | - | - | - | - | - | 3 |
| hormozi-workshop | 2443 | - | - | - | - | - | - | - | 3 |

**Y** = presente | **-** = ausente

---

## Inventario de Assets

### Tasks por Agent (55 tasks — 100% assigned)

| Agent | Tasks | Count |
|-------|-------|:---:|
| hormozi-offers | architect-offer-stack, create-bonus-stack, create-grand-slam-offer, create-guarantee-stack, create-offer-name, design-scarcity-urgency, diagnose-business-stage, diagnose-value-equation, validate-market-selection | 9 |
| hormozi-retention | create-engagement-scoring, create-exit-interview-system, create-nurture-sequence, design-customer-journey, design-onboarding-sequence, diagnose-churn-rate, discover-activation-points, implement-5-horsemen, optimize-ltv-cac-ratio | 9 |
| hormozi-launch | create-contingency-plan, create-launch-narrative, create-launch-timeline, design-launch-value-stack, plan-launch-evento, run-launch-post-mortem, setup-affiliate-program, setup-war-room | 8 |
| hormozi-models | calculate-30-day-profit, create-downsell-sequence, create-upsell-page, create-upsell-sequence, design-continuity-offer, design-money-model, design-subscription-model | 7 |
| hormozi-leads | build-marketing-machine, create-lead-magnet, design-core-four-strategy, execute-rule-of-100, generate-fast-cash | 5 |
| hormozi-copy | create-email-sequence, create-landing-page, create-registration-page, create-sales-page, create-vsl-script | 5 |
| hormozi-scale | build-scaling-team, design-systems-automation, diagnose-scaling-constraint | 3 |
| hormozi-ads | create-ad-angles, create-ad-campaign | 2 |
| hormozi-pricing | create-pricing-strategy, execute-price-raise | 2 |
| hormozi-advisor | design-brand-identity | 1 |
| hormozi-closer | create-closer-script | 1 |
| hormozi-content | create-content-unit | 1 |
| hormozi-hooks | create-hook-set | 1 |
| hormozi-workshop | design-workshop | 1 |
| hormozi-chief | *(router — sem tasks proprias)* | 0 |
| hormozi-audit | *(usa checklists)* | 0 |

### Checklists (45 — TODOS orfaos, sem `agent:` field)

**Mapeamento proposto por afinidade de nome:**

| Agent | Checklists Propostos |
|-------|---------------------|
| hormozi-offers | value-equation-checklist, guarantees-checklist, naming-framework-checklist, bonuses-checklist, scarcity-urgency-checklist, offer-architecture-checklist |
| hormozi-retention | retention-checklist, churn-diagnosis-checklist, customer-journey-checklist, lead-nurture-checklist, ltv-checklist, onboarding-30-day-checklist, exit-interview-checklist, engagement-scoring-checklist, activation-point-checklist, 5-horsemen-checklist |
| hormozi-models | money-model-checklist, upsell-strategy-checklist, upsell-sequence-checklist, downsell-strategy-checklist, subscription-model-checklist |
| hormozi-leads | core-four-checklist, lead-magnet-checklist, marketing-machine-checklist, fast-cash-checklist |
| hormozi-copy | landing-page-checklist, sales-page-checklist, vsl-script-checklist, email-campaign-checklist, registration-page-checklist, upsell-page-checklist |
| hormozi-pricing | pricing-checklist, pricing-framework-checklist, price-raise-checklist |
| hormozi-ads | goated-ads-checklist, ad-angles-checklist |
| hormozi-launch | launch-checklist, affiliates-referrals-checklist |
| hormozi-hooks | hooks-checklist |
| hormozi-content | content-creation-checklist, branding-checklist |
| hormozi-workshop | workshop-launch-checklist |
| hormozi-chief *(shared)* | antipattern-screening, golden-ratios-veto, market-validation-veto |

### Workflows (9 — mapeamento por nome)

| Workflow | Agent Principal |
|----------|----------------|
| wf-grand-slam-offer.yaml | hormozi-offers |
| wf-context-diagnosis.yaml | hormozi-chief |
| wf-opportunity-screening.yaml | hormozi-chief |
| wf-growth-decision.yaml | hormozi-chief |
| wf-lead-magnet-pipeline.yaml | hormozi-leads |
| wf-money-model-design.yaml | hormozi-models |
| wf-paid-ads-campaign.yaml | hormozi-ads |
| wf-full-launch-sequence.yaml | hormozi-launch |
| wf-scaling-diagnostic.yaml | hormozi-scale |

---

## Plano de Execucao

### Fase 1: Padrao Universal (16 agents) — ~2h

**Objetivo:** Alinhar TODOS os agents com o padrao AIOS de activation.
**Referencia:** HybridOps `process-architect.md` (92 linhas, pattern compacto)

**Para CADA agent, adicionar:**

#### 1.1 greeting_levels (3 linhas)

> **Source:** `aios-core/docs/guides/contextual-greeting-system-guide.md` Section "Tipos de Sessao"

```yaml
persona_profile:
  communication:
    greeting_levels:
      minimal: "{icon} {agent-id} ready"
      named: "{icon} {agent-name} ({role}) ready"
      archetypal: "{icon} {agent-name} — {identity_statement}"
```

**Exemplos concretos:**

| Agent | minimal | named | archetypal |
|-------|---------|-------|-----------|
| hormozi-chief | `hormozi-chief ready` | `Hormozi Chief (Master Orchestrator) ready` | `Hormozi Chief — the $100M Mind Command Center` |
| hormozi-offers | `hormozi-offers ready` | `Hormozi Offers (Grand Slam Engineer) ready` | `Hormozi Offers — Make them feel stupid saying no` |
| hormozi-leads | `hormozi-leads ready` | `Hormozi Leads (Core Four Strategist) ready` | `Hormozi Leads — Find the Starving Crowd` |
| hormozi-hooks | `hormozi-hooks ready` | `Hormozi Hooks (Scroll-Stop Engineer) ready` | `Hormozi Hooks — Own the first 5 seconds` |
| hormozi-pricing | `hormozi-pricing ready` | `Hormozi Pricing (Value-Based Strategist) ready` | `Hormozi Pricing — Premium is mandatory` |

#### 1.2 commands.visibility (1 tag por command)

> **Source:** `aios-core/docs/guides/contextual-greeting-system-guide.md` Section "Command Visibility System"
> **Regra oficial:** `full` = 12 max (new session) | `quick` = 6-8 (existing) | `key` = 3-5 (workflow)

```yaml
commands:
  - name: {primary_command}
    visibility: [full, quick, key]    # Greeting + help + atalho
  - name: {secondary_command}
    visibility: [full, quick]         # Greeting + help
  - name: {tertiary_command}
    visibility: [full]                # So no *help
  - name: help
    visibility: [full, quick, key]
  - name: exit
    visibility: [full, key]
```

#### 1.3 signature_closing (1 linha)

| Agent | signature_closing |
|-------|------------------|
| hormozi-chief | `— The math has to make sense.` |
| hormozi-offers | `— Make them an offer so good they feel stupid saying no.` |
| hormozi-leads | `— Find the starving crowd. They are already hungry.` |
| hormozi-models | `— The model has to work on paper before it works in life.` |
| hormozi-pricing | `— Premium pricing is not greed. It is a growth strategy.` |
| hormozi-hooks | `— Own the first 5 seconds or own nothing.` |
| hormozi-ads | `— Data first. Feelings never.` |
| hormozi-copy | `— Proof beats promise. Always.` |
| hormozi-launch | `— 50-60% of sales happen in the last 4 hours.` |
| hormozi-retention | `— The fortune is in the follow-up.` |
| hormozi-advisor | `— Here is what I would do in your shoes.` |
| hormozi-audit | `— Diagnosis before prescription.` |
| hormozi-closer | `— Objections are requests for more information.` |
| hormozi-content | `— Give away the secrets. Sell the implementation.` |
| hormozi-scale | `— Systems deliver. Founders strategize.` |
| hormozi-workshop | `— Sell from the stage. Deliver in the room.` |

#### 1.4 dependencies.checklists (mapear orfaos)

Adicionar a secao `checklists:` dentro do `dependencies:` existente de cada agent, usando o mapeamento da secao "Inventario de Assets" acima.

```yaml
dependencies:
  tasks:
    - create-grand-slam-offer.md   # (ja existe)
  checklists:                       # (ADICIONAR)
    - value-equation-checklist.md
    - guarantees-checklist.md
  data:
    - minds/hormozi-offers_dna.yaml # (ja existe)
```

---

### Fase 2: Completar Tier 3 (6 agents) — ~3h

**Agents:** hormozi-advisor, hormozi-audit, hormozi-closer, hormozi-content, hormozi-scale, hormozi-workshop

**Para CADA um, adicionar:**

| Secao | O que | Source |
|-------|-------|--------|
| `voice_dna` | vocabulary.always_use (5+), never_use (3+), sentence_starters, metaphors, behavioral_states | Extrair dos DNA files existentes em `squads/mind-cloning/minds/hormozi/outputs/` |
| `handoff_to` | Tabela agent → quando → contexto | Mapear dos workflows existentes |
| `objection_algorithms` | 3+ objecoes com responses | Derivar do hormozi-chief como base |
| `output_examples` | 3+ exemplos input→output completos | Criar baseado nas tasks do agent |

**Prerequisito para voice_dna:** Verificar se os DNA files existem para esses 6 agents.

```
squads/mind-cloning/minds/hormozi/outputs/hormozi-advisor_dna.yaml   → verificar
squads/mind-cloning/minds/hormozi/outputs/hormozi-audit_dna.yaml     → verificar
squads/mind-cloning/minds/hormozi/outputs/hormozi-closer_dna.yaml    → verificar
squads/mind-cloning/minds/hormozi/outputs/hormozi-content_dna.yaml   → verificar
squads/mind-cloning/minds/hormozi/outputs/hormozi-scale_dna.yaml     → verificar
squads/mind-cloning/minds/hormozi/outputs/hormozi-workshop_dna.yaml  → verificar
```

Se existirem, extrair voice_dna de la. Se nao, marcar como blocker e escalar pra @oalanicolas para extraction.

---

### Fase 3: Checklist Ownership (45 checklists) — ~1h

Adicionar `agent:` field no metadata YAML de cada checklist orfao.

```yaml
## Metadata
agent: hormozi-offers    # ADICIONAR
type: validation
```

---

## O que foi DESCARTADO do plano original (v1)

| Item | Motivo do Descarte |
|------|-------------------|
| `command_loader` | Experimento de 2/113 agents. Nao e padrao do sistema. |
| `CRITICAL_LOADER_RULE` | Enforcement sem pipeline que execute. Over-engineering. |
| `IDE-FILE-RESOLUTION` | Ja presente em 14/16 agents Hormozi. Gap minimo. |
| `REQUEST-RESOLUTION` | Ja presente em 14/16 agents Hormozi. Gap minimo. |

---

## Validacao Pos-Migracao

### Checklist por Agent (Fase 1)

```yaml
fase_1_validation:
  - [ ] greeting_levels presente (minimal + named + archetypal)
  - [ ] Pelo menos 2 commands com visibility: [quick]
  - [ ] Pelo menos 1 command com visibility: [key]
  - [ ] signature_closing presente
  - [ ] dependencies.checklists mapeado
```

### Checklist por Agent (Fase 2 — so Tier 3)

```yaml
fase_2_validation:
  - [ ] voice_dna.vocabulary.always_use (5+ itens)
  - [ ] voice_dna.vocabulary.never_use (3+ itens)
  - [ ] voice_dna.sentence_starters (3+ patterns)
  - [ ] handoff_to (pelo menos 2 agents mapeados)
  - [ ] objection_algorithms (3+ objecoes)
  - [ ] output_examples (3+ exemplos completos)
```

### Validacao Rapida (grep)

```bash
# Fase 1 — rodar pra cada agent
grep -c "greeting_levels:" squads/hormozi/agents/hormozi-{agent}.md
grep -c "visibility:" squads/hormozi/agents/hormozi-{agent}.md
grep -c "signature_closing:" squads/hormozi/agents/hormozi-{agent}.md

# Fase 2 — so Tier 3
grep -c "voice_dna:" squads/hormozi/agents/hormozi-{agent}.md
grep -c "handoff_to:" squads/hormozi/agents/hormozi-{agent}.md
grep -c "objection_algorithms:" squads/hormozi/agents/hormozi-{agent}.md
grep -c "output_examples:" squads/hormozi/agents/hormozi-{agent}.md
```

---

## Metricas de Sucesso

| Metrica | Antes | Depois |
|---------|-------|--------|
| greeting_levels | 0/16 | 16/16 |
| commands.visibility | 0/16 | 16/16 |
| signature_closing | 0/16 | 16/16 |
| voice_dna | 10/16 | 16/16 |
| handoff_to | 10/16 | 16/16 |
| objection_algorithms | 10/16 | 16/16 |
| output_examples | 10/16 | 16/16 |
| Checklists com owner | 0/45 | 45/45 |
| Conformidade estimada | 70% | 98% |

---

## Ordem de Execucao

```
Fase 1.1: greeting_levels em 16 agents ........... ✅ DONE
Fase 1.2: commands.visibility em 16 agents ....... ✅ DONE
Fase 1.3: signature_closing em 16 agents ......... ✅ DONE
Fase 1.4: dependencies.checklists em 16 agents ... ✅ DONE
Fase 2:   Completar 6 agents Tier 3 .............. ✅ DONE
Fase 3:   Agent field em 45 checklists ........... ✅ DONE (ja existia)
                                          STATUS: COMPLETO
```

---

_Plano v2 criado por @pedro-valerio | 2026-02-10_
_Corrigido com dados auditados via grep real nos 16 agents_
_Padrao de referencia: AIOS UnifiedActivationPipeline + HybridOps agents_
_Plano v1 descartado: dados incorretos em 3/5 metricas BLOCKING_
_Execucao completa: 2026-02-10 | 62 files, +1886/-317 linhas_

<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
