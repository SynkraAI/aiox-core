# Spec Pipeline: Gather Requirements

> **Phase:** 1 - Gather
> **Owner Agent:** @pm
> **Pipeline:** spec-pipeline

---

## Purpose

Coletar e estruturar requisitos do usuário através de elicitation interativo. Transforma descrições informais em requisitos formais e categorizados.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-gather

  elicit: true
  deterministic: false # LLM creativity needed for understanding intent
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: ID da story sendo especificada

    - name: source
      type: enum
      values: [prd, user, existing]
      required: false
      default: user
      description: Fonte dos requisitos

    - name: prdPath
      type: string
      required: false
      description: Caminho para PRD se source=prd

    - name: existingSpec
      type: string
      required: false
      description: Spec existente se iterando

  outputs:
    - name: requirements.json
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      schema: requirements-schema

  verification:
    type: schema
    schemaRef: requirements-schema

  contextRequirements:
    projectContext: true
    filesContext: false
    implementationPlan: false
    spec: false
```

---

## Execution Flow

### Phase 1: Context Detection

```yaml
steps:
  - id: detect-source
    action: identify_requirement_source
    description: |
      Identificar de onde os requisitos vêm:
      1. PRD existente → extrair requisitos do documento
      2. User input → elicitar via perguntas
      3. Existing spec → iterar sobre spec anterior
```

### Phase 2: Elicitation (if source=user)

**CRITICAL: This phase requires user interaction. Do NOT skip.**

```yaml
elicitation:
  enabled: true
  format: structured-questions
  inspiration: GitHub Spec-Kit 9-category taxonomy

  questions:
    # === Original 5 Categories ===

    - id: q1-what
      category: functional
      question: 'O que o sistema deve FAZER? (funcionalidades principais)'
      follow_ups:
        - 'Quem são os usuários dessa funcionalidade?'
        - 'Qual o trigger/gatilho para essa ação?'

    - id: q2-constraints
      category: constraints
      question: 'Existem RESTRIÇÕES técnicas ou de negócio?'
      examples:
        - 'Tempo máximo de resposta'
        - 'Integrações obrigatórias'
        - 'Limitações de stack'

    - id: q3-nfr
      category: non-functional
      question: 'Requisitos NÃO-FUNCIONAIS importantes?'
      examples:
        - 'Performance (latência, throughput)'
        - 'Segurança (autenticação, autorização)'
        - 'Escalabilidade'

    - id: q4-success
      category: acceptance
      question: 'Como sabemos que está PRONTO? (critérios de aceite)'
      format: given-when-then

    - id: q5-assumptions
      category: assumptions
      question: 'Quais SUPOSIÇÕES estamos fazendo?'
      note: 'Documentar para validação posterior'

    # === New 4 Categories (SDD Adoption) ===

    - id: q6-domain
      category: domain-model
      question: 'Quais ENTIDADES e RELACIONAMENTOS existem?'
      follow_ups:
        - 'Quais são os objetos principais do domínio?'
        - 'Como eles se relacionam entre si?'
        - 'Quais atributos são obrigatórios?'
      examples:
        - 'User has many Orders'
        - 'Product belongs to Category'
        - 'Invoice references Order'

    - id: q7-interaction
      category: interaction-ux
      question: 'Como o USUÁRIO INTERAGE com o sistema?'
      follow_ups:
        - 'Qual o fluxo principal (happy path)?'
        - 'Quais telas ou componentes estão envolvidos?'
        - 'Existem estados de loading, erro, vazio?'
      examples:
        - 'User clicks button → modal opens → form submits → success toast'
        - 'Page loads → fetches data → displays list or empty state'

    - id: q8-edge-cases
      category: edge-cases
      question: 'O que acontece quando algo DÁ ERRADO?'
      follow_ups:
        - 'E se a rede falhar?'
        - 'E se o usuário não tiver permissão?'
        - 'E se os dados estiverem inválidos?'
        - 'E se o serviço externo estiver indisponível?'
      examples:
        - 'Timeout após 30s → retry automático → fallback para cache'
        - 'Validação falha → mostrar erros inline → não submeter'

    - id: q9-terminology
      category: terminology
      question: 'Existe GLOSSÁRIO ou termos específicos do domínio?'
      follow_ups:
        - 'Algum termo tem significado específico neste contexto?'
        - 'Existem sinônimos que devemos padronizar?'
      examples:
        - '"Cliente" vs "Usuário" vs "Account" - qual usar?'
        - '"Pedido" significa Order ou Request neste contexto?'
      note: 'Inconsistência terminológica causa bugs e confusão'
```

### Phase 3: PRD Extraction (if source=prd)

```yaml
prd_extraction:
  enabled: true

  sections_to_extract:
    - user_stories: 'Extract user stories as functional requirements'
    - acceptance_criteria: 'Map to acceptance array'
    - constraints: 'Technical and business constraints'
    - nfrs: 'Non-functional requirements'

  validation:
    - Ensure all extracted items have clear descriptions
    - Flag ambiguous requirements for clarification
    - Cross-reference with PRD goals
```

### Phase 4: Structuring

```yaml
structuring:
  action: create_requirements_json

  template: |
    {
      "storyId": "{storyId}",
      "gatheredAt": "{timestamp}",
      "source": "{source}",
      "gatheredBy": "@pm",
      "elicitationVersion": "2.0",

      "functional": [
        {
          "id": "FR-{n}",
          "description": "{requirement}",
          "priority": "P0|P1|P2",
          "rationale": "{why}",
          "acceptance": ["AC-{n}"]
        }
      ],

      "nonFunctional": [
        {
          "id": "NFR-{n}",
          "category": "performance|security|scalability|usability",
          "description": "{requirement}",
          "metric": "{measurable_criteria}"
        }
      ],

      "constraints": [
        {
          "id": "CON-{n}",
          "type": "technical|business|regulatory",
          "description": "{constraint}",
          "impact": "{how_it_affects_solution}"
        }
      ],

      "assumptions": [
        {
          "id": "ASM-{n}",
          "description": "{assumption}",
          "risk_if_wrong": "{impact}",
          "validation_needed": true|false
        }
      ],

      "domainModel": [
        {
          "id": "DM-{n}",
          "entity": "{entity_name}",
          "attributes": ["{attr1}", "{attr2}"],
          "relationships": [
            {
              "type": "has_many|belongs_to|has_one",
              "target": "{other_entity}"
            }
          ]
        }
      ],

      "interactions": [
        {
          "id": "INT-{n}",
          "trigger": "{user_action}",
          "flow": ["{step1}", "{step2}", "{step3}"],
          "states": {
            "loading": "{loading_behavior}",
            "error": "{error_behavior}",
            "empty": "{empty_state}"
          }
        }
      ],

      "edgeCases": [
        {
          "id": "EC-{n}",
          "scenario": "{what_goes_wrong}",
          "handling": "{how_to_handle}",
          "severity": "critical|high|medium|low"
        }
      ],

      "terminology": [
        {
          "term": "{term}",
          "definition": "{meaning_in_this_context}",
          "synonyms": ["{alt1}", "{alt2}"],
          "avoid": ["{term_to_avoid}"]
        }
      ],

      "openQuestions": [
        {
          "id": "OQ-{n}",
          "question": "{question}",
          "blocking": true|false,
          "assignedTo": "@{agent}"
        }
      ]
    }
```

---

## Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["storyId", "gatheredAt", "source", "functional"],
  "properties": {
    "storyId": { "type": "string" },
    "gatheredAt": { "type": "string", "format": "date-time" },
    "source": { "enum": ["prd", "user", "existing"] },
    "gatheredBy": { "type": "string", "default": "@pm" },
    "elicitationVersion": { "type": "string", "default": "2.0" },
    "functional": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "description", "priority"],
        "properties": {
          "id": { "type": "string", "pattern": "^FR-\\d+$" },
          "description": { "type": "string", "minLength": 10 },
          "priority": { "enum": ["P0", "P1", "P2"] },
          "rationale": { "type": "string" },
          "acceptance": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "nonFunctional": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "description", "category"],
        "properties": {
          "id": { "type": "string", "pattern": "^NFR-\\d+$" },
          "description": { "type": "string", "minLength": 10 },
          "category": { "enum": ["performance", "security", "scalability", "usability", "reliability"] }
        }
      }
    },
    "constraints": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "description"],
        "properties": {
          "id": { "type": "string", "pattern": "^CON-\\d+$" },
          "description": { "type": "string", "minLength": 10 },
          "type": { "enum": ["technical", "business", "regulatory"] }
        }
      }
    },
    "assumptions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "description"],
        "properties": {
          "id": { "type": "string", "pattern": "^ASM-\\d+$" },
          "description": { "type": "string", "minLength": 10 },
          "risk": { "enum": ["low", "medium", "high"] }
        }
      }
    },
    "domainModel": {
      "type": "array",
      "description": "Entities and relationships (SDD q6)",
      "items": {
        "type": "object",
        "required": ["entity", "description"],
        "properties": {
          "entity": { "type": "string" },
          "description": { "type": "string" },
          "relationships": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "interactions": {
      "type": "array",
      "description": "UX flows and states (SDD q7)",
      "items": {
        "type": "object",
        "required": ["flow", "description"],
        "properties": {
          "flow": { "type": "string" },
          "description": { "type": "string" },
          "states": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "edgeCases": {
      "type": "array",
      "description": "Failure scenarios (SDD q8)",
      "items": {
        "type": "object",
        "required": ["scenario", "handling"],
        "properties": {
          "scenario": { "type": "string" },
          "handling": { "type": "string" },
          "severity": { "enum": ["low", "medium", "high", "critical"] }
        }
      }
    },
    "terminology": {
      "type": "array",
      "description": "Domain glossary (SDD q9)",
      "items": {
        "type": "object",
        "required": ["term", "definition"],
        "properties": {
          "term": { "type": "string" },
          "definition": { "type": "string" },
          "aliases": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "openQuestions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["question"],
        "properties": {
          "question": { "type": "string" },
          "priority": { "enum": ["low", "medium", "high"] },
          "blocksProgress": { "type": "boolean" }
        }
      }
    }
  }
}
```

---

## Integration

### Command Integration (@pm)

```yaml
command:
  name: '*gather-requirements'
  syntax: '*gather-requirements {story-id} [--source=prd|user] [--prd=path]'
  agent: pm

  examples:
    - '*gather-requirements STORY-42'
    - '*gather-requirements STORY-42 --source=prd --prd=docs/prd/feature-x.md'
```

### Pipeline Integration

```yaml
pipeline:
  phase: gather
  next_phase: assess

  pass_to_next:
    - requirements.json

  skip_conditions: [] # Gather is always required
```

---

## Error Handling

```yaml
errors:
  - id: no-requirements
    condition: 'functional array is empty after elicitation'
    action: 'Re-prompt user for at least one functional requirement'
    blocking: true

  - id: ambiguous-requirement
    condition: 'requirement description < 10 characters'
    action: 'Ask for clarification'
    blocking: false

  - id: missing-acceptance
    condition: 'functional requirement has no acceptance criteria'
    action: 'Generate suggested acceptance criteria for review'
    blocking: false
```

---

## Examples

### Example 1: User Elicitation

**Input:** "Quero adicionar login com Google"

**Elicitation:**

```
Q1: O que o sistema deve FAZER?
→ Permitir que usuários façam login usando conta Google

Q2: Existem RESTRIÇÕES?
→ Deve usar OAuth 2.0, não armazenar senhas

Q3: Requisitos NÃO-FUNCIONAIS?
→ Login deve completar em < 3 segundos

Q4: Como sabemos que está PRONTO?
→ Given usuário na página de login
   When clica em "Login com Google"
   Then é redirecionado para Google OAuth
   And após autorização, está logado no sistema
```

**Output:** `docs/stories/STORY-42/spec/requirements.json`

---

## Metadata

```yaml
metadata:
  story: '3.1'
  epic: 'Epic 3 - Spec Pipeline'
  created: '2026-01-28'
  updated: '2025-01-30'
  author: '@architect (Aria)'
  version: '2.0.0'
  changelog:
    - version: '2.0.0'
      date: '2025-01-30'
      changes:
        - 'Expanded elicitation from 5 to 9 categories (SDD adoption)'
        - 'Added: Domain Model (q6), Interaction/UX (q7), Edge Cases (q8), Terminology (q9)'
        - 'Updated JSON template with new sections'
        - 'Added elicitationVersion field for backwards compatibility'
  tags:
    - spec-pipeline
    - requirements
    - elicitation
    - prompt-engineering
    - sdd-adoption
  inspiration: GitHub Spec-Kit 9-category taxonomy
```

## Handoff
next_agent: @architect
next_command: *analyze-impact
condition: Requirements gathered (requirements.json created)
alternatives:
  - agent: @pm, command: *write-spec, condition: SIMPLE complexity, skip assessment
