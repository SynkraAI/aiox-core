# Spec Pipeline: Assess Complexity

> **Phase:** 2 - Assess
> **Owner Agent:** @architect
> **Pipeline:** spec-pipeline

---

## Purpose

Avaliar a complexidade de uma story/requisito para determinar quais fases do pipeline são necessárias. Classifica em SIMPLE, STANDARD ou COMPLEX, cada um ativando diferentes conjuntos de fases.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-assess

  elicit: false
  deterministic: true # Same inputs should yield same complexity
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: overrideComplexity
      type: enum
      values: [SIMPLE, STANDARD, COMPLEX]
      required: false
      description: Manual override for complexity

  outputs:
    - name: complexity.json
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      schema: complexity-schema

  verification:
    type: none # Assessment is advisory

  contextRequirements:
    projectContext: true
    filesContext: true # Need to analyze codebase
    implementationPlan: false
    spec: false
```

---

## Complexity Dimensions

### Dimension 1: Scope

```yaml
scope:
  description: 'Quantos arquivos/componentes serão afetados?'

  scoring:
    1: '1-2 arquivos, mudança localizada'
    2: '3-5 arquivos, um módulo'
    3: '6-10 arquivos, múltiplos módulos'
    4: '11-20 arquivos, cross-cutting'
    5: '20+ arquivos, arquitetura inteira'

  analysis:
    - Count files mentioned in requirements
    - Estimate based on feature type
    - Check existing patterns for similar features
```

### Dimension 2: Integration

```yaml
integration:
  description: 'Quantas integrações externas são necessárias?'

  scoring:
    1: 'Nenhuma integração externa'
    2: '1 API interna existente'
    3: '1-2 APIs externas ou nova API interna'
    4: '3+ APIs ou integração complexa (webhooks, eventos)'
    5: 'Orquestração de múltiplos sistemas'

  analysis:
    - Identify external services mentioned
    - Check for authentication requirements
    - Assess data flow complexity
```

### Dimension 3: Infrastructure

```yaml
infrastructure:
  description: 'Mudanças de infraestrutura necessárias?'

  scoring:
    1: 'Nenhuma mudança de infra'
    2: 'Configuração simples (env vars)'
    3: 'Nova dependência ou serviço'
    4: 'Mudança de banco de dados / schema'
    5: 'Nova infraestrutura (servidor, container, etc)'

  analysis:
    - Check for database changes
    - Identify new services needed
    - Assess deployment impact
```

### Dimension 4: Knowledge

```yaml
knowledge:
  description: 'Conhecimento necessário para implementar'

  scoring:
    1: 'Padrões existentes no codebase'
    2: 'Tecnologia conhecida, novo padrão'
    3: 'Nova biblioteca, documentação clara'
    4: 'Tecnologia nova para o time'
    5: 'Área de domínio desconhecida, pesquisa necessária'

  analysis:
    - Check existing patterns in codebase
    - Identify new technologies mentioned
    - Assess learning curve
```

### Dimension 5: Risk

```yaml
risk:
  description: 'Risco de impacto negativo'

  scoring:
    1: 'Baixo risco, feature isolada'
    2: 'Risco moderado, afeta poucos usuários'
    3: 'Risco médio, feature importante'
    4: 'Risco alto, afeta muitos usuários'
    5: 'Risco crítico, core do sistema'

  analysis:
    - Assess user impact
    - Check for security implications
    - Evaluate reversibility
```

---

## Classification Thresholds

```yaml
thresholds:
  SIMPLE:
    max_total: 8
    description: 'Tarefa direta, padrões existentes'
    pipeline_phases: [gather, spec, critique]
    typical_time: '< 1 dia'

  STANDARD:
    min_total: 9
    max_total: 15
    description: 'Complexidade moderada, alguma pesquisa'
    pipeline_phases: [gather, assess, research, spec, critique, plan]
    typical_time: '1-3 dias'

  COMPLEX:
    min_total: 16
    description: 'Alta complexidade, múltiplas iterações'
    pipeline_phases: [gather, assess, research, spec, critique_1, revise, critique_2, plan]
    typical_time: '3+ dias'

    flags:
      - Requires architectural review
      - Consider breaking into smaller stories
      - Spike may be needed
```

---

## Execution Flow

### Step 1: Load Requirements

```yaml
load:
  action: read_requirements_json
  path: docs/stories/{storyId}/spec/requirements.json
  validate: true
```

### Step 2: Analyze Codebase (if needed)

```yaml
codebase_analysis:
  enabled: true

  actions:
    - id: count_affected_files
      description: 'Estimate files that will be modified'
      method: |
        1. Parse functional requirements
        2. Identify components/modules mentioned
        3. Search codebase for related files
        4. Count unique files

    - id: check_patterns
      description: 'Check if similar patterns exist'
      method: |
        1. Extract key concepts from requirements
        2. Search for similar implementations
        3. Assess reusability

    - id: identify_integrations
      description: 'Find external integrations needed'
      method: |
        1. Parse requirements for external services
        2. Check existing integrations
        3. Identify new connections needed
```

### Step 3: Score Dimensions

```yaml
scoring:
  action: evaluate_each_dimension

  process: |
    For each dimension (scope, integration, infrastructure, knowledge, risk):
    1. Apply scoring criteria
    2. Document rationale
    3. Assign score 1-5
```

### Step 4: Calculate Result

```yaml
calculation:
  action: determine_complexity

  formula: |
    total_score = scope + integration + infrastructure + knowledge + risk

    if overrideComplexity:
      result = overrideComplexity
    else if total_score <= 8:
      result = SIMPLE
    else if total_score <= 15:
      result = STANDARD
    else:
      result = COMPLEX
```

### Step 5: Generate Output

```yaml
output:
  action: create_complexity_json

  template: |
    {
      "storyId": "{storyId}",
      "assessedAt": "{timestamp}",
      "assessedBy": "@architect",

      "result": "{SIMPLE|STANDARD|COMPLEX}",
      "overridden": false,

      "dimensions": {
        "scope": {
          "score": {1-5},
          "notes": "{rationale}"
        },
        "integration": {
          "score": {1-5},
          "notes": "{rationale}"
        },
        "infrastructure": {
          "score": {1-5},
          "notes": "{rationale}"
        },
        "knowledge": {
          "score": {1-5},
          "notes": "{rationale}"
        },
        "risk": {
          "score": {1-5},
          "notes": "{rationale}"
        }
      },

      "totalScore": {5-25},

      "pipelinePhases": ["{phases based on result}"],

      "flags": ["{warnings or recommendations}"],

      "estimatedEffort": "{typical_time}"
    }
```

---

## Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["storyId", "assessedAt", "result", "dimensions", "totalScore", "pipelinePhases"],
  "properties": {
    "storyId": { "type": "string" },
    "assessedAt": { "type": "string", "format": "date-time" },
    "assessedBy": { "type": "string", "default": "@architect" },
    "result": { "enum": ["SIMPLE", "STANDARD", "COMPLEX"] },
    "overridden": { "type": "boolean", "default": false },
    "dimensions": {
      "type": "object",
      "required": ["scope", "integration", "infrastructure", "knowledge", "risk"],
      "properties": {
        "scope": { "$ref": "#/definitions/dimension" },
        "integration": { "$ref": "#/definitions/dimension" },
        "infrastructure": { "$ref": "#/definitions/dimension" },
        "knowledge": { "$ref": "#/definitions/dimension" },
        "risk": { "$ref": "#/definitions/dimension" }
      }
    },
    "totalScore": { "type": "integer", "minimum": 5, "maximum": 25 },
    "pipelinePhases": { "type": "array", "items": { "type": "string" } },
    "flags": { "type": "array", "items": { "type": "string" } },
    "estimatedEffort": { "type": "string" }
  },
  "definitions": {
    "dimension": {
      "type": "object",
      "required": ["score", "notes"],
      "properties": {
        "score": { "type": "integer", "minimum": 1, "maximum": 5 },
        "notes": { "type": "string" }
      }
    }
  }
}
```

---

## Integration

### Command Integration (@architect)

```yaml
command:
  name: '*assess-complexity'
  syntax: '*assess-complexity {story-id} [--complexity=SIMPLE|STANDARD|COMPLEX]'
  agent: architect

  examples:
    - '*assess-complexity STORY-42'
    - '*assess-complexity STORY-42 --complexity=COMPLEX'
```

### Pipeline Integration

```yaml
pipeline:
  phase: assess
  previous_phase: gather
  next_phase: research

  requires:
    - requirements.json

  pass_to_next:
    - complexity.json
    - requirements.json

  skip_conditions:
    - 'overrideComplexity is provided' # Still runs but uses override
```

---

## Error Handling

```yaml
errors:
  - id: missing-requirements
    condition: 'requirements.json not found'
    action: 'Halt and instruct to run gather phase first'
    blocking: true

  - id: empty-requirements
    condition: 'functional requirements array is empty'
    action: 'Cannot assess - no requirements to analyze'
    blocking: true

  - id: override-mismatch
    condition: 'override significantly differs from calculated'
    action: 'Log warning but proceed with override'
    blocking: false
```

---

## Examples

### Example: Login Feature Assessment

**Input:** requirements.json with Google OAuth login

**Analysis:**

```
Scope:       3 (auth module, login page, user service)
Integration: 3 (Google OAuth API)
Infra:       2 (env vars for OAuth credentials)
Knowledge:   2 (OAuth pattern exists in codebase)
Risk:        3 (affects all users)
─────────────
Total:       13 → STANDARD
```

**Output:**

```json
{
  "storyId": "STORY-42",
  "assessedAt": "2026-01-28T10:30:00Z",
  "result": "STANDARD",
  "totalScore": 13,
  "pipelinePhases": ["gather", "assess", "research", "spec", "critique", "plan"]
}
```

---

## Metadata

```yaml
metadata:
  story: '3.2'
  epic: 'Epic 3 - Spec Pipeline'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - spec-pipeline
    - complexity
    - assessment
    - prompt-engineering
```
