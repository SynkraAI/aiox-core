# Alex Hormozi - DNA Specialists

> **17 perfis cognitivos especializados extraídos do mind completo de Alex Hormozi**

## Estrutura Híbrida

Este mind combina duas abordagens complementares:

### 1. Mind Genérico (mmos-squad)
```
alex_hormozi/
├── artifacts/       → 16 análises cognitivas completas
├── docs/            → Documentação do mind
├── sources/         → 15 arquivos fonte originais
└── system_prompts/  → System prompts base
```

### 2. DNA Especializado (specialists/)
```
specialists/
├── hormozi-voice-dna.yaml      → Voice DNA canônico
├── hormozi-thinking-dna.yaml   → Arquitetura cognitiva
└── [15 domain specialists]     → DNA por domínio
```

---

## DNA Files (17 total)

### Core DNA (2)
| File | Descrição |
|------|-----------|
| `hormozi-voice-dna.yaml` | Padrões de voz canônicos, estilo de comunicação |
| `hormozi-thinking-dna.yaml` | Arquitetura cognitiva, mental models, raciocínio |

### Domain Specialists (15)

#### Tier 1: Core (Livros)
| File | Domínio | Frameworks |
|------|---------|------------|
| `hormozi-offers_dna.yaml` | Grand Slam Offers | Value Equation, MVN, Enhancement Stack, MAGIC Naming |
| `hormozi-leads_dna.yaml` | Lead Generation | Core Four, Lead Magnets, Rule of 100 |
| `hormozi-models_dna.yaml` | Money Models | Continuity, Upsells/Downsells, Subscription |

#### Tier 2: Execution (Playbooks)
| File | Domínio | Frameworks |
|------|---------|------------|
| `hormozi-hooks_dna.yaml` | Hook Creation | 121 Hook Formulas |
| `hormozi-ads_dna.yaml` | Paid Advertising | GOATed Ads Framework |
| `hormozi-pricing_dna.yaml` | Pricing Strategy | Anchoring, Value Stacking, Price Raises |
| `hormozi-copy_dna.yaml` | Sales Copy | AIDA, PAS, Landing Pages, VSLs |
| `hormozi-launch_dna.yaml` | Launch Sequences | War Room, Timeline, Contingency |
| `hormozi-retention_dna.yaml` | LTV Optimization | Churn Diagnosis, Onboarding, Engagement |

#### Tier 3: Strategic
| File | Domínio | Frameworks |
|------|---------|------------|
| `hormozi-advisor_dna.yaml` | Strategic Counsel | Business Diagnosis, Growth Decision |
| `hormozi-audit_dna.yaml` | Offer/LP Audits | Antipattern Detection, Quality Gates |
| `hormozi-closer_dna.yaml` | Sales Scripts | CLOSER Framework, Objection Handling |
| `hormozi-scale_dna.yaml` | Scaling | 9-Stage Roadmap, Constraint Analysis |
| `hormozi-workshop_dna.yaml` | Workshop Design | Workshop Framework |
| `hormozi-content_dna.yaml` | Content Strategy | Content Creation System |

---

## Estrutura de DNA File

Cada DNA file contém:

```yaml
version: "1.0"
entity_name: "Alex Hormozi"
agent_variant: "[Especialização]"
extraction_date: "2026-02-09"
fidelity_target: "90%+"

source_dna:
  complete: "squads/mind-cloning/minds/alex_hormozi/mind_dna_complete.yaml"
  voice: "squads/mind-cloning/minds/alex_hormozi/voice_dna.yaml"
  thinking: "squads/mind-cloning/minds/alex_hormozi/thinking_dna.yaml"

specialization:
  book_focus: "[Livro principal]"
  primary_frameworks: [...]
  knowledge_sources: [...]
  mental_models: [...]
  antipatterns: [...]
```

---

## Como Usar

### Carregar DNA Específico
```yaml
# No agent definition
dna_source: "squads/mmos-squad/minds/alex_hormozi/specialists/hormozi-offers_dna.yaml"
```

### Carregar Múltiplos DNA
```yaml
# Para agents que precisam de múltiplos domínios
dna_sources:
  - "specialists/hormozi-offers_dna.yaml"
  - "specialists/hormozi-pricing_dna.yaml"
  - "specialists/hormozi-copy_dna.yaml"
```

### Carregar Voice + Thinking + Domain
```yaml
# Recomendado para máxima fidelidade
dna_sources:
  - "specialists/hormozi-voice-dna.yaml"      # Base voice
  - "specialists/hormozi-thinking-dna.yaml"   # Base thinking
  - "specialists/hormozi-offers_dna.yaml"     # Domain specialist
```

---

## Origem

**Fonte:** Squad Hormozi v1.1.0
- Extraídos via MMOS Pipeline
- Fidelity target: 95% (source mind) → 90%+ (specialists)
- Baseado em 165+ arquivos fonte (165MB)
- 4 livros completos + 25 playbooks

**Data de integração:** 2026-02-12
**Integrado de:** `squads/hormozi/data/minds/`

---

## Relação com Hormozi Squad

Os DNA files aqui são **idênticos** aos usados pelo Hormozi Squad:
- `squads/hormozi/agents/` → Usam estes DNA files
- `squads/hormozi/data/minds/` → Fonte original (mantida sincronizada)
- `squads/mmos-squad/minds/alex_hormozi/specialists/` → Cópia para unificação

**Benefício:** Mind completo unificado com especialização granular por domínio.

---

## Versionamento

- **v1.0** - Integração inicial (17 DNA files) - 2026-02-12
- Fonte: Hormozi Squad v1.1.0

---

<\!-- Integrado do Hormozi Squad | MMOS-AIOS | 2026-02-12 -->
