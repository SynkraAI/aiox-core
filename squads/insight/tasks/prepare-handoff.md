# Task: Prepare Handoff

**Task ID:** prepare-handoff
**Version:** 1.0
**Execution Type:** Hybrid
**Purpose:** Prepare structured briefing for handoff to other squads after lead converts
**Executor:** @insight-chief
**Estimated Time:** 5-10 min

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client_name` | string | Yes | Client name |
| `target_squad` | enum | Yes | `"production"`, `"automation"`, `"operations"` |
| `dossier` | object | Yes | Approved digital presence dossier |
| `opportunity_map` | object | Yes | Approved market opportunity map |
| `impact_report` | object | No | Pre-sales impact report |

---

## Preconditions

- [ ] Lead has converted to client
- [ ] Dossier and map passed QA checkpoint
- [ ] Target squad identified

---

## Steps

### Step 1: Select Handoff Template
```yaml
action: select_template
mapping:
  production:
    destination: "Squad 2 (Produção)"
    purpose: "Briefing para entregáveis: copy, landing, Maps, Ads"
    template: "handoff-production-tmpl"
  automation:
    destination: "Squad 3 (Automação)"
    purpose: "Setup de CRM, tracking, automações"
    template: "handoff-automation-tmpl"
  operations:
    destination: "Squad 4 (Operação)"
    purpose: "Priorização de onboarding, score de maturidade"
    template: "handoff-operations-tmpl"
```

### Step 2: Extract Key Data for Production
```yaml
condition: "target_squad == production"
extract:
  from_dossier:
    - "Score de maturidade (0-100)"
    - "Top gaps por canal"
    - "Concorrentes e seus pontos fortes"
    - "Canais ativos do cliente"
  from_map:
    - "Keywords de ouro (20%)"
    - "Quick wins priorizados"
    - "Awareness level do mercado"
    - "Canais recomendados (Unbound)"
  derived:
    - "Briefing de copy: tom, USP, CTAs baseados no awareness level"
    - "Briefing de Maps: gaps específicos a resolver"
    - "Briefing de Ads: keywords + CPC + budget recomendado"
    - "Briefing de site/landing: PageSpeed issues + CTAs + tracking"
```

### Step 3: Extract Key Data for Automation
```yaml
condition: "target_squad == automation"
extract:
  from_dossier:
    - "Canais ativos (onde o lead pode vir)"
    - "WhatsApp configurado?"
    - "Tracking instalado? (GA4, GTM)"
  from_map:
    - "Canais recomendados (Core Four)"
    - "Volume esperado de leads"
  derived:
    - "CRM setup: campos para o nicho"
    - "Tracking setup: eventos a rastrear"
    - "Automações prioritárias: follow-up WhatsApp, review request"
```

### Step 4: Extract Key Data for Operations
```yaml
condition: "target_squad == operations"
extract:
  from_dossier:
    - "Score de maturidade (0-100)"
    - "Nível de urgência dos gaps"
  from_map:
    - "Potencial de receita estimado"
    - "Complexidade do nicho"
  derived:
    - "Score de prioridade para onboarding"
    - "Recursos necessários estimados"
    - "Timeline recomendada"
```

### Step 5: Generate Briefing
```yaml
action: generate_briefing
sections:
  - "Header: Client name, niche, city, date, target squad"
  - "Context: Score, awareness level, main gaps"
  - "Priorities: Ordered list of what to do first"
  - "Data package: All relevant data for target squad"
  - "Constraints: Budget, timeline, client preferences"
  - "Success metrics: How to measure impact"
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Briefing | Structured markdown | Complete handoff package |
| Data package | Attached data | Dossier + map + report |
| Priority list | Ordered list | What target squad should do first |

---

## Veto Conditions

- Handoff without approved dossier → REJECT
- Missing target squad → REJECT
- Briefing without priorities → REJECT

---

## Acceptance Criteria

- [ ] Target squad identified
- [ ] Key data extracted from dossier + map
- [ ] Priorities ordered
- [ ] Briefing has all required sections
- [ ] Data package attached
- [ ] Success metrics defined
