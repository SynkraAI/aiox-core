# Spec Pipeline: Research Dependencies

---
execution_mode: programmatic  # TOK-3: PTC-eligible (Bash batch) — multi-search + filter in single block
---

> **Phase:** 3 - Research
> **Owner Agent:** @analyst
> **Pipeline:** spec-pipeline

---

## Purpose

Pesquisar e validar dependências externas necessárias para implementação. Usa Context7 para documentação de bibliotecas e EXA para pesquisa web. Produz lista de dependências verificadas com links e exemplos.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-research

  elicit: false
  deterministic: false # Research results may vary
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: true

  outputs:
    - name: research.json
      type: file
      path: docs/stories/{storyId}/spec/research.json
      schema: research-schema

  tools:
    - context7 # Primary: library documentation
    - exa # Fallback: web search
    - codebase # Check existing implementations

  verification:
    type: manual
    note: 'Research findings should be reviewed'

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: false
```

---

## Skip Conditions

```yaml
skip_conditions:
  - condition: "complexity.result === 'SIMPLE'"
    reason: 'Simple tasks use existing patterns, no research needed'
    action: 'Generate minimal research.json with existing dependencies only'

  - condition: 'no external dependencies identified in requirements'
    reason: 'Pure internal implementation'
    action: "Generate research.json noting 'no external dependencies'"
```

---

## Execution Flow

### Step 1: Extract Research Targets

```yaml
extract_targets:
  action: parse_requirements_for_dependencies

  patterns:
    - Libraries: "zustand", "tanstack-query", "zod"
    - APIs: "OAuth", "Stripe API", "SendGrid"
    - Concepts: "real-time sync", "optimistic updates"
    - Infrastructure: "Redis", "PostgreSQL", "Vercel"

  output:
    - name: research_targets[]
      properties:
        - target: string
        - type: library|api|concept|infrastructure
        - mentioned_in: requirement_id[]
```

### Step 2: Check Existing Codebase

```yaml
codebase_check:
  action: search_existing_implementations

  for_each: research_target

  search:
    - package.json: 'Check if already installed'
    - imports: 'Check if already used'
    - patterns: 'Find similar implementations'

  output:
    - existing: boolean
    - version: string (if existing)
    - usage_examples: string[] (file:line references)
```

### Step 3: Research via Context7

```yaml
context7_research:
  action: lookup_library_documentation
  tool: context7

  for_each: research_target where type === 'library'

  process:
    1. resolve-library-id:
      - Query: '{target} library documentation'
      - Select: Most relevant match

    2. query-docs:
      - Query: 'How to {use case from requirements}'
      - Extract: Setup instructions, code examples

  output:
    - verified: boolean
    - source: 'context7'
    - docs_url: string
    - relevant_patterns: string[]
    - code_examples: string[]
```

### Step 4: Fallback to EXA (if needed)

```yaml
exa_fallback:
  action: web_search
  tool: exa

  condition: 'context7 returned no results OR target is API/concept'

  for_each: unverified_target

  queries:
    - '{target} documentation 2024'
    - '{target} {framework} integration example'
    - '{target} best practices'

  output:
    - verified: boolean (mark as false if uncertain)
    - source: 'exa'
    - urls: string[]
    - summary: string
```

### Step 5: Check Technical Preferences

```yaml
preferences_check:
  action: validate_against_tech_preferences
  file: .aios-core/development/data/technical-preferences.md

  validation:
    - Is dependency in preferred list?
    - Are there preferred alternatives?
    - Any known conflicts?

  output:
    - preferred: boolean
    - alternatives: string[] (if not preferred)
    - conflicts: string[] (if any)
```

### Step 6: Generate Research Output

```yaml
generate_output:
  action: create_research_json

  template: |
    {
      "storyId": "{storyId}",
      "researchedAt": "{timestamp}",
      "researchedBy": "@analyst",
      "complexity": "{complexity.result}",

      "dependencies": [
        {
          "name": "{dependency_name}",
          "type": "library|api|service",
          "version": "{recommended_version}",
          "verified": true|false,
          "source": "context7|exa|codebase",

          "existing": {
            "installed": true|false,
            "currentVersion": "{version}",
            "usageLocations": ["{file:line}"]
          },

          "documentation": {
            "url": "{docs_url}",
            "relevantSections": ["{section_names}"]
          },

          "patterns": [
            {
              "name": "{pattern_name}",
              "description": "{when_to_use}",
              "codeExample": "{code}"
            }
          ],

          "compatibility": {
            "preferred": true|false,
            "alternatives": ["{alt_libraries}"],
            "conflicts": ["{known_conflicts}"]
          }
        }
      ],

      "unverifiedClaims": [
        {
          "claim": "{statement_from_requirements}",
          "reason": "{why_not_verified}",
          "action": "needs_validation|acceptable_risk|blocked"
        }
      ],

      "recommendations": [
        {
          "type": "prefer|avoid|consider",
          "subject": "{dependency}",
          "rationale": "{why}"
        }
      ],

      "researchNotes": "{additional_context}"
    }
```

---

## Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["storyId", "researchedAt", "dependencies"],
  "properties": {
    "storyId": { "type": "string" },
    "researchedAt": { "type": "string", "format": "date-time" },
    "researchedBy": { "type": "string", "default": "@analyst" },
    "complexity": { "enum": ["SIMPLE", "STANDARD", "COMPLEX"] },
    "dependencies": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "type", "verified", "source"],
        "properties": {
          "name": { "type": "string" },
          "type": { "enum": ["library", "api", "service", "infrastructure"] },
          "version": { "type": "string" },
          "verified": { "type": "boolean" },
          "source": { "enum": ["context7", "exa", "codebase", "manual"] },
          "existing": { "type": "object" },
          "documentation": { "type": "object" },
          "patterns": { "type": "array" },
          "compatibility": { "type": "object" }
        }
      }
    },
    "unverifiedClaims": { "type": "array" },
    "recommendations": { "type": "array" },
    "researchNotes": { "type": "string" }
  }
}
```

---

## Integration

### Command Integration (@analyst)

```yaml
command:
  name: '*research-deps'
  syntax: '*research-deps {story-id} [--force]'
  agent: analyst

  flags:
    --force: 'Research even if complexity is SIMPLE'

  examples:
    - '*research-deps STORY-42'
    - '*research-deps STORY-42 --force'
```

### Pipeline Integration

```yaml
pipeline:
  phase: research
  previous_phase: assess
  next_phase: spec

  requires:
    - requirements.json
    - complexity.json

  pass_to_next:
    - research.json
    - requirements.json
    - complexity.json

  skip_conditions:
    - "complexity.result === 'SIMPLE' AND not --force"
```

### Tool Configuration

```yaml
tools:
  context7:
    priority: 1
    timeout: 30s
    fallback_to: exa

  exa:
    priority: 2
    max_results: 5
    type: auto
```

---

## Error Handling

```yaml
errors:
  - id: context7-unavailable
    condition: 'Context7 MCP not responding'
    action: 'Use EXA as primary, log warning'
    blocking: false

  - id: no-docs-found
    condition: 'No documentation found for dependency'
    action: 'Mark as unverified, add to unverifiedClaims'
    blocking: false

  - id: conflicting-dependency
    condition: 'Dependency conflicts with existing'
    action: "Add to recommendations with 'avoid' type"
    blocking: false

  - id: all-tools-failed
    condition: 'Both Context7 and EXA failed'
    action: 'Generate minimal output with manual research flag'
    blocking: false
```

---

## Examples

### Example: Zustand Research

**Target:** zustand (state management)

**Context7 Query:**

```
resolve-library-id: "zustand state management"
→ /pmndrs/zustand

query-docs: "How to create a store with zustand"
→ Returns setup examples, middleware patterns
```

**Output Entry:**

```json
{
  "name": "zustand",
  "type": "library",
  "version": "^4.5.0",
  "verified": true,
  "source": "context7",
  "existing": {
    "installed": false,
    "currentVersion": null
  },
  "documentation": {
    "url": "https://docs.pmnd.rs/zustand/",
    "relevantSections": ["Getting Started", "Middleware"]
  },
  "patterns": [
    {
      "name": "createStore",
      "description": "Basic store creation",
      "codeExample": "const useStore = create((set) => ({ count: 0 }))"
    }
  ],
  "compatibility": {
    "preferred": true,
    "alternatives": ["jotai", "recoil"],
    "conflicts": []
  }
}
```

---

## Metadata

```yaml
metadata:
  story: '3.3'
  epic: 'Epic 3 - Spec Pipeline'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - spec-pipeline
    - research
    - dependencies
    - context7
    - exa
```
