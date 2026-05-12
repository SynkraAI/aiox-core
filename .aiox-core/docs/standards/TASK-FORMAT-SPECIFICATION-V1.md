# AIOX Task Format Specification V1.0

**Date:** 2025-11-13  
**Version:** 1.0.0  
**Status:** Standard  
**Author:** Brad Frost Cognitive Clone

---

## Purpose

This document defines the UNIVERSAL format for AIOX Tasks, ensuring consistency, scalability, and reusability across workflows, executors, and teams.

---

## Task Format Overview

Every AIOX Task MUST follow this structure:

```yaml
#### Step X: [Task Name]

task: taskIdentifier()
responsável: [Role or Service Name]
responsavel_type: Agente | Worker | Humano | Clone
atomic_layer: [Atom | Molecule | Organism | Template | Page | Config | Strategy | Content | Media | Layout | Analysis]

**Entrada:**
- campo: [name]
  tipo: [type]
  origem: [source step]
  obrigatório: [true|false]
  padrão: [default value] (optional)

**Saída:**
- campo: [name]
  tipo: [type]
  destino: [destination step(s)]
  persistido: [true|false]

**Checklist:**
  pre-conditions:
    - [ ] [condition description]
      tipo: pre-condition
      blocker: [true|false]
      validação: [validation logic or test path]
  
  post-conditions:
    - [ ] [condition description]
      tipo: post-condition
      blocker: [true|false]
      validação: [validation logic or test path]
  
  acceptance-criteria:
    - [ ] [acceptance description]
      tipo: acceptance
      blocker: [false]
      story: [STORY-XXX]
      manual_check: [true|false]

**Template:** (optional)
- path: [relative path to template file]
- type: [input|output|prompt|ui|script]
- version: [X.Y.Z]
- variables: [array of variable names]

**Tools:** (optional)
- [tool_name]:
    version: [X.Y.Z]
    used_for: [description]
    shared_with: [array of step IDs]

**Scripts:** (optional)
- [script_path]:
    description: [what it does]
    language: [javascript|python|bash|etc]

**Performance:**
- duration_expected: [X]ms
- cost_estimated: $[Y] (for AI executors)
- cacheable: [true|false]
- cache_key: [cache identifier] (if cacheable)
- parallelizable: [true|false]
- parallel_with: [array of step IDs] (if parallelizable)
- skippable_when: [array of conditions]

**Error Handling:**
- strategy: [retry|fallback|abort]
- fallback: [description or default value] (if strategy=fallback)
- retry:
    max_attempts: [N]
    backoff: [linear|exponential]
    backoff_ms: [initial backoff in milliseconds]
- abort_workflow: [true|false]
- notification: [log|email|slack|etc]

**Metadata:**
- story: [STORY-XXX]
- version: [X.Y.Z]
- dependencies: [array of step IDs]
- breaking_changes: [array of changes from previous version]
- author: [name]
- created_at: [YYYY-MM-DD]
- updated_at: [YYYY-MM-DD]
```

---

## Field Definitions

### Required Fields

#### 1. `task`

**Type:** `string` (function name)  
**Required:** ✅ Yes  
**Format:** `camelCase()` with parentheses

**Purpose:** Unique identifier for the task function.

**Validation:**
- Must be unique across workflow
- Must be valid JavaScript function name
- Must end with `()`

**Examples:**
```yaml
task: loadFormatConfig()
task: analyzeBrief()
task: designCTAComponent()
```

---

#### 2. `responsável`

**Type:** `string`  
**Required:** ✅ Yes  
**Format:** Free text (role or service name)

**Purpose:** Human-readable name of the responsible entity.

**Examples:**
```yaml
responsável: Creative Director
responsável: format-loader.js
responsável: OpenRouter Vision Model
responsável: Brad Frost Clone
```

---

#### 3. `responsavel_type`

**Type:** `enum`  
**Required:** ✅ Yes  
**Values:** `Agente | Worker | Humano | Clone`

**Purpose:** Defines the executor type for orchestration, cost tracking, and error handling.

**Validation:**
- Must be one of the 4 allowed values
- Determines execution environment

**Decision Tree:** See `EXECUTOR-DECISION-TREE.md`

**Examples:**
```yaml
responsavel_type: Agente  # AI-powered execution
responsavel_type: Worker  # Script-based execution
responsavel_type: Humano  # Manual human execution
responsavel_type: Clone   # Mind emulation with heuristics
```

---

#### 4. `atomic_layer`

**Type:** `enum`  
**Required:** ✅ Yes (for design-related tasks), ⚠️ Optional (for config/strategy)  
**Values:**
- **Atomic Design:** `Atom | Molecule | Organism | Template | Page`
- **Other Layers:** `Config | Strategy | Content | Media | Layout | Analysis`

**Purpose:** Maps task to Atomic Design layer for architecture validation.

**Validation:**
- Design tasks MUST specify Atomic Design layer
- Non-design tasks SHOULD specify functional layer

**Examples:**
```yaml
atomic_layer: Atom       # Step 7a: Design CTA (single component)
atomic_layer: Molecule   # Step 8a: Compose Text Group (title + body + cta)
atomic_layer: Organism   # Step 8c: Content Area (complete section)
atomic_layer: Template   # Step 13: Render HTML (structure)
atomic_layer: Page       # Step 14: Export PNG (final instance)
atomic_layer: Config     # Step 1: Load Format Config
atomic_layer: Strategy   # Step 3: Analyze Brief
```

---

#### 5. `Entrada` (Inputs)

**Type:** `array of objects`  
**Required:** ✅ Yes (can be empty array if no inputs)

**Purpose:** Defines all inputs required by the task, with types, sources, and constraints.

**Structure:**

```yaml
**Entrada:**
- campo: [field name]
  tipo: [type definition]
  origem: [source step or config]
  obrigatório: [true|false]
  padrão: [default value] (optional)
  validação: [validation rule] (optional)
```

**Field Details:**

| Sub-field | Type | Required | Description |
|-----------|------|----------|-------------|
| `campo` | string | ✅ Yes | Field name (camelCase) |
| `tipo` | string | ✅ Yes | Type definition (see Type System below) |
| `origem` | string | ✅ Yes | Source step ID or "config" or "user input" |
| `obrigatório` | boolean | ✅ Yes | Whether field is required |
| `padrão` | any | ⚠️ Optional | Default value if not provided |
| `validação` | string | ⚠️ Optional | Validation rule or JSON Schema reference |

**Examples:**

```yaml
**Entrada:**
- campo: adCopy
  tipo: object { title: string, body: string, cta: string }
  origem: Step 5 (craftCopy)
  obrigatório: true
  validação: |
    title.length >= 1 && title.length <= 100
    body.length >= 1 && body.length <= 500
    cta.length >= 1 && cta.length <= 30

- campo: brand
  tipo: object (Brand schema)
  origem: Step 2 (loadBrand)
  obrigatório: true

- campo: ready_copy
  tipo: object { title?, body?, cta? } | null
  origem: User Input (config)
  obrigatório: false
  padrão: null
```

---

#### 6. `Saída` (Outputs)

**Type:** `array of objects`  
**Required:** ✅ Yes (can be empty array if no outputs)

**Purpose:** Defines all outputs produced by the task, with types, destinations, and persistence.

**Structure:**

```yaml
**Saída:**
- campo: [field name]
  tipo: [type definition]
  destino: [destination step(s) or state]
  persistido: [true|false]
  cache_key: [key] (if cacheable)
```

**Field Details:**

| Sub-field | Type | Required | Description |
|-----------|------|----------|-------------|
| `campo` | string | ✅ Yes | Field name (camelCase) |
| `tipo` | string | ✅ Yes | Type definition |
| `destino` | string or array | ✅ Yes | Destination step(s) or "state" or "output" |
| `persistido` | boolean | ✅ Yes | Whether saved to ad-spec.json or DB |
| `cache_key` | string | ⚠️ Optional | Cache key if output is cacheable |

**Examples:**

```yaml
**Saída:**
- campo: formatConfig
  tipo: object { formatId, canvas, safeZones, contentArea }
  destino: [Step 8, Step 10, Step 11, Step 12, Step 13, Step 14]
  persistido: false  # Kept in memory only

- campo: adAnalysis
  tipo: object { goal, targetAudience, urgencyLevel, emotionalTriggers }
  destino: state (ad-spec.json)
  persistido: true

- campo: designTokens
  tipo: object { spacing, typography, colors, radius, shadows }
  destino: Step 13 (renderHTML)
  persistido: false
  cache_key: format_${formatConfig.formatId}_${formatConfig.orientation}
```

---

### Optional Fields

#### 7. `Checklist`

**Type:** `object with arrays`  
**Required:** ⚠️ Recommended

**Purpose:** Defines validations (pre-conditions, post-conditions, acceptance criteria) for automated and manual testing.

**Structure:**

```yaml
**Checklist:**
  pre-conditions:
    - [ ] [description]
      tipo: pre-condition
      blocker: [true|false]
      validação: [logic or test path]
      error_message: [message if fails]
  
  post-conditions:
    - [ ] [description]
      tipo: post-condition
      blocker: [true|false]
      validação: [logic or test path]
      rollback: [true|false]
  
  acceptance-criteria:
    - [ ] [description]
      tipo: acceptance
      blocker: false
      story: [STORY-XXX]
      manual_check: [true|false]
      test: [test file path]
```

**Checklist Types:**

1. **Pre-conditions** (Run BEFORE task)
   - Validate inputs exist and are valid
   - Check dependencies are met
   - Verify environment is ready
   - **Blocking:** Task aborts if pre-condition fails

2. **Post-conditions** (Run AFTER task)
   - Validate outputs match schema
   - Check business rules
   - Verify no side effects
   - **Blocking:** Task rolls back if post-condition fails

3. **Acceptance Criteria** (Run AFTER workflow)
   - Validate Story requirements
   - Can be manual (human review)
   - Can be automated (integration tests)
   - **Non-blocking:** Log failure, continue workflow

**Examples:**

```yaml
**Checklist:**
  pre-conditions:
    - [ ] brand.typography exists and is valid
      tipo: pre-condition
      blocker: true
      validação: |
        if (!brand.typography || !brand.typography.primaryFont) {
          throw new Error("Brand typography not loaded");
        }
      error_message: "Brand typography missing or invalid"
    
    - [ ] adCopy.title is not empty
      tipo: pre-condition
      blocker: true
      validação: "expect(adCopy.title).toBeTruthy()"
      error_message: "Copy title is required"
  
  post-conditions:
    - [ ] typography.title.htmlContent is valid HTML
      tipo: post-condition
      blocker: true
      validação: |
        const isValid = await validateHTML(typography.title.htmlContent);
        if (!isValid) throw new Error("Invalid HTML");
      rollback: false
    
    - [ ] All required transformations applied
      tipo: post-condition
      blocker: true
      validação: |
        expect(typography.title.transformations).toBeInstanceOf(Array);
        expect(typography.title.transformations.length).toBeGreaterThan(0);
      rollback: false
  
  acceptance-criteria:
    - [ ] Typography matches brand voice (bold, uppercase for urgent CTAs)
      tipo: acceptance
      blocker: false
      story: STORY-006
      manual_check: false
      test: "tests/typography-brand-voice.test.js"
    
    - [ ] Transformations are visually appealing
      tipo: acceptance
      blocker: false
      story: STORY-006
      manual_check: true
```

---

#### 8. `Template`

**Type:** `object`  
**Required:** ⚠️ Optional (but recommended for Agente executors)

**Purpose:** References template files that define input/output schemas, prompts, or UI forms.

**Structure:**

```yaml
**Template:**
- path: [relative path]
  type: [input|output|prompt|ui|script]
  version: [X.Y.Z]
  variables: [array of variable names used in template]
  schema: [JSON Schema reference] (optional)
```

**Template Types:**

| Type | Purpose | Example |
|------|---------|---------|
| `input` | Validates input schema | `templates/input-schemas/analyze-brief.json` |
| `output` | Validates output schema | `templates/output-schemas/analyze-brief.json` |
| `prompt` | AI agent prompt structure | `Squads/.../analyze-ad-brief.md` |
| `ui` | Human interface form | `templates/ui-forms/manual-approval.html` |
| `script` | Worker script template | `templates/scripts/image-processor.sh` |

**Examples:**

```yaml
# Agente executor with prompt template
**Template:**
- path: Squads/instagram-content-creator/tasks/ads/analyze-ad-brief.md
  type: prompt
  version: 2.1.0
  variables: [brief_text, brand_id, campaign_goal, ready_copy]
  schema: Squads/instagram-content-creator/schemas/analyze-brief-output.json

# Worker executor with script template
**Template:**
- path: scripts/utils/format-loader.js
  type: script
  version: 1.0.0
  variables: [format_id, orientation]
  
# Humano executor with UI form
**Template:**
- path: templates/ui-forms/manual-review-ad-quality.html
  type: ui
  version: 1.0.0
  variables: [ad_preview_url, quality_criteria]
```

---

#### 9. `Tools`

**Type:** `object`  
**Required:** ⚠️ Recommended (to document reusability)

**Purpose:** Catalogs reusable tools/functions used by the task, enabling:
- **Reusability tracking** (which tasks share tools)
- **Versioning** (tool updates affect which tasks)
- **Cost tracking** (tool API costs)

**Structure:**

```yaml
**Tools:**
- [tool_name]:
    version: [X.Y.Z]
    used_for: [description]
    shared_with: [array of step IDs or "global"]
    cost: $[Y] per call (optional)
    cacheable: [true|false] (optional)
```

**Examples:**

```yaml
**Tools:**
- callAgent:
    version: 1.0.0
    used_for: AIOX agent caller with retry logic
    shared_with: [Step 3, Step 4, Step 5, Step 6, Step 7, Step 8, Step 9, Step 11]
    cost: varies by agent
    
- validateHTML:
    version: 2.1.0
    used_for: HTML validation using htmlhint
    shared_with: [Step 6, Step 13]
    
- detectFaces:
    version: 1.0.0
    used_for: Face detection via OpenRouter Gemini 2.5 Flash
    shared_with: [Step 10]
    cost: $0.002 per image
    
- validateContrast:
    version: 1.0.0
    used_for: WCAG AA color contrast validation
    shared_with: [Step 2, Step 7]
```

---

#### 10. `Scripts`

**Type:** `object`  
**Required:** ⚠️ Optional (for Worker executors primarily)

**Purpose:** References custom scripts executed by the task.

**Structure:**

```yaml
**Scripts:**
- [script_path]:
    description: [what it does]
    language: [javascript|python|bash|etc]
    version: [X.Y.Z] (optional)
```

**Examples:**

```yaml
**Scripts:**
- scripts/utils/format-loader.js:
    description: Loads format configuration from JSON file
    language: javascript
    version: 1.0.0
    
- scripts/utils/face-detection.js:
    description: Wrapper for OpenRouter face detection API
    language: javascript
    version: 1.2.0
    
- scripts/export/puppeteer-renderer.js:
    description: Renders HTML to PNG using Puppeteer
    language: javascript
    version: 2.0.0
```

---

#### 11. `Performance`

**Type:** `object`  
**Required:** ⚠️ Recommended (for optimization)

**Purpose:** Documents expected performance metrics and optimization opportunities.

**Structure:**

```yaml
**Performance:**
- duration_expected: [X]ms
- cost_estimated: $[Y] (for AI)
- cacheable: [true|false]
- cache_key: [identifier] (if cacheable)
- parallelizable: [true|false]
- parallel_with: [array of step IDs]
- skippable_when: [array of conditions]
```

**Examples:**

```yaml
# AI task (expensive, slow, not cacheable)
**Performance:**
- duration_expected: 3500ms
- cost_estimated: $0.0015
- cacheable: false
- parallelizable: false

# Config load (fast, cacheable)
**Performance:**
- duration_expected: 100ms
- cost_estimated: $0
- cacheable: true
- cache_key: format_${format_id}_${orientation}
- parallelizable: false

# Image selection (can run in parallel with template selection)
**Performance:**
- duration_expected: 2500ms
- cost_estimated: $0.001
- cacheable: false
- parallelizable: true
- parallel_with: [Step 4]

# Brief analysis (skippable in ready_copy mode)
**Performance:**
- duration_expected: 4000ms
- cost_estimated: $0.0025
- cacheable: false
- parallelizable: false
- skippable_when: [ready_copy=true]
```

---

#### 12. `Error Handling`

**Type:** `object`  
**Required:** ⚠️ Recommended (for robustness)

**Purpose:** Defines error handling strategy for resilience.

**Structure:**

```yaml
**Error Handling:**
- strategy: [retry|fallback|abort]
- fallback: [description or value] (if strategy=fallback)
- retry:
    max_attempts: [N]
    backoff: [linear|exponential]
    backoff_ms: [initial delay]
- abort_workflow: [true|false]
- notification: [log|email|slack|etc]
```

**Strategies:**

| Strategy | When to Use | Example |
|----------|-------------|---------|
| `retry` | Transient errors (API timeout, rate limit) | AI agent call failed with 429 |
| `fallback` | Recoverable errors (AI failed, use default) | Template selection → fallback to default |
| `abort` | Critical errors (invalid brand_id, missing template) | Brand not found → abort workflow |

**Examples:**

```yaml
# AI task with retry + fallback
**Error Handling:**
- strategy: fallback
- fallback: |
    If AI fails, use config.ready_copy as analysis.
    If ready_copy not available, use default analysis:
      { goal: "conversion", urgencyLevel: "medium", targetAudience: "general" }
- retry:
    max_attempts: 3
    backoff: exponential
    backoff_ms: 1000
- abort_workflow: false
- notification: log

# Config load (critical - abort on failure)
**Error Handling:**
- strategy: abort
- retry:
    max_attempts: 2
    backoff: linear
    backoff_ms: 500
- abort_workflow: true
- notification: email + slack
```

---

#### 13. `Metadata`

**Type:** `object`  
**Required:** ⚠️ Recommended (for traceability)

**Purpose:** Links task to Stories, versions, and dependencies for project management.

**Structure:**

```yaml
**Metadata:**
- story: [STORY-XXX]
- version: [X.Y.Z]
- dependencies: [array of step IDs]
- breaking_changes: [array of changes]
- author: [name]
- created_at: [YYYY-MM-DD]
- updated_at: [YYYY-MM-DD]
```

**Examples:**

```yaml
**Metadata:**
- story: STORY-010.1
- version: 2.1.0
- dependencies: [Step 10]
- breaking_changes:
    - Output format changed: added computedSpacing object
    - Removed nested fallback (SMELL 1 fix)
- author: Brad Frost Clone
- created_at: 2025-11-10
- updated_at: 2025-11-13
```

---

## Type System

### Basic Types

```yaml
string        # Text
number        # Number (integer or float)
boolean       # true or false
null          # Null value
any           # Any type (avoid when possible)
```

### Complex Types

```yaml
array         # Array of items
array<string> # Array of strings
array<number> # Array of numbers

object        # Generic object
object { key: type, key: type }  # Object with defined keys
```

### Optional Types

```yaml
string | null           # String or null
object { key?: type }   # Object with optional key (? suffix)
```

### Custom Types (Reference Schemas)

```yaml
Brand                  # References schemas/Brand.json
FormatConfig           # References schemas/FormatConfig.json
AdAnalysis             # References schemas/AdAnalysis.json
```

**Examples:**

```yaml
- campo: adCopy
  tipo: object { title: string, body: string, cta: string }

- campo: faces
  tipo: array<object { top: number, left: number, bottom: number, right: number }>

- campo: ready_copy
  tipo: object { title?: string, body?: string, cta?: string } | null

- campo: brand
  tipo: Brand  # References schemas/Brand.json
```

---

## Validation Rules

### Required Field Validation

```javascript
function validateTask(task) {
  const required = ['task', 'responsável', 'responsavel_type', 'atomic_layer', 'Entrada', 'Saída'];
  
  for (const field of required) {
    if (!task[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate executor type
  const validExecutors = ['Agente', 'Worker', 'Humano', 'Clone'];
  if (!validExecutors.includes(task.responsavel_type)) {
    throw new Error(`Invalid responsavel_type: ${task.responsavel_type}`);
  }
  
  // Validate atomic layer
  const validLayers = ['Atom', 'Molecule', 'Organism', 'Template', 'Page', 'Config', 'Strategy', 'Content', 'Media', 'Layout', 'Analysis'];
  if (!validLayers.includes(task.atomic_layer)) {
    throw new Error(`Invalid atomic_layer: ${task.atomic_layer}`);
  }
  
  return true;
}
```

### Input/Output Validation

```javascript
function validateInputOutput(io, type) {
  const required = ['campo', 'tipo', 'origem', 'obrigatório'];
  
  for (const item of io) {
    for (const field of required) {
      if (!item[field] && field !== 'origem') {  // origem not required for output
        throw new Error(`${type} missing required field: ${field}`);
      }
    }
  }
  
  return true;
}
```

---

## Examples by Executor Type

### Agente (AI-Powered)

```yaml
#### Step 3: Analyze Brief

task: analyzeBrief()
responsável: Ad Strategist
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: brief_text
  tipo: string
  origem: User Input (config)
  obrigatório: true
  validação: "length >= 50"

- campo: brand
  tipo: Brand
  origem: Step 2 (loadBrand)
  obrigatório: true

- campo: ready_copy
  tipo: object { title?, body?, cta? } | null
  origem: User Input (config)
  obrigatório: false
  padrão: null

**Saída:**
- campo: adAnalysis
  tipo: object { goal, targetAudience, urgencyLevel, emotionalTriggers, keyMessage }
  destino: state (ad-spec.json)
  persistido: true

**Checklist:**
  pre-conditions:
    - [ ] brief_text has minimum 50 characters
      tipo: pre-condition
      blocker: true
      validação: "expect(brief_text.length).toBeGreaterThanOrEqual(50)"
  
  post-conditions:
    - [ ] adAnalysis contains all required fields
      tipo: post-condition
      blocker: true
      validação: |
        expect(adAnalysis.goal).toBeTruthy();
        expect(adAnalysis.urgencyLevel).toMatch(/high|medium|low/);
  
  acceptance-criteria:
    - [ ] Analysis aligns with brand voice
      tipo: acceptance
      blocker: false
      story: STORY-003
      manual_check: false
      test: "tests/brief-analysis-brand-alignment.test.js"

**Template:**
- path: Squads/instagram-content-creator/tasks/ads/analyze-ad-brief.md
  type: prompt
  version: 2.1.0
  variables: [brief_text, brand_id, campaign_goal, ready_copy]

**Tools:**
- callAgent:
    version: 1.0.0
    used_for: Execute AI agent with retry
    shared_with: [Step 4, Step 5, Step 6, Step 7, Step 8, Step 9, Step 11]

**Scripts:**
- N/A

**Performance:**
- duration_expected: 4000ms
- cost_estimated: $0.0025
- cacheable: false
- parallelizable: false
- skippable_when: [ready_copy=true]

**Error Handling:**
- strategy: fallback
- fallback: |
    Use config.ready_copy as analysis if available.
    Otherwise, use default analysis: { goal: "conversion", urgencyLevel: "medium", targetAudience: "general" }
- retry:
    max_attempts: 3
    backoff: exponential
    backoff_ms: 1000
- abort_workflow: false
- notification: log

**Metadata:**
- story: STORY-003
- version: 2.0.0
- dependencies: [Step 2]
- breaking_changes: []
- author: Creative Team
- created_at: 2025-10-01
- updated_at: 2025-11-10
```

---

### Worker (Script-Based)

```yaml
#### Step 1: Load Format Configuration

task: loadFormatConfig()
responsável: format-loader.js
responsavel_type: Worker
atomic_layer: Config

**Entrada:**
- campo: format_id
  tipo: string
  origem: User Input (config)
  obrigatório: true
  validação: "format_id in ['instagram-stories', 'instagram-reels', 'instagram-feed-square', 'instagram-feed-portrait']"

- campo: orientation
  tipo: string
  origem: User Input (config)
  obrigatório: false
  padrão: "portrait"
  validação: "orientation in ['portrait', 'landscape']"

**Saída:**
- campo: formatConfig
  tipo: FormatConfig
  destino: [Step 8, Step 10, Step 11, Step 12, Step 13, Step 14]
  persistido: false

**Checklist:**
  pre-conditions:
    - [ ] format_id is valid
      tipo: pre-condition
      blocker: true
      validação: |
        const validFormats = ['instagram-stories', 'instagram-reels', 'instagram-feed-square', 'instagram-feed-portrait'];
        if (!validFormats.includes(format_id)) {
          throw new Error(`Invalid format_id: ${format_id}`);
        }
  
  post-conditions:
    - [ ] formatConfig.safeZones are defined
      tipo: post-condition
      blocker: true
      validação: |
        expect(formatConfig.safeZones).toBeDefined();
        expect(formatConfig.safeZones.top).toBeGreaterThan(0);
    
    - [ ] formatConfig.contentArea.height calculated correctly
      tipo: post-condition
      blocker: true
      validação: |
        const expectedHeight = formatConfig.canvas.height - formatConfig.safeZones.top - formatConfig.safeZones.bottom;
        expect(formatConfig.contentArea.height).toBe(expectedHeight);

**Template:**
- path: config/ad-formats.json
  type: input
  version: 1.0.0
  variables: [format_id, orientation]
  schema: schemas/FormatConfig.json

**Tools:**
- N/A

**Scripts:**
- scripts/utils/format-loader.js:
    description: Reads format JSON and calculates content area
    language: javascript
    version: 1.0.0

**Performance:**
- duration_expected: 50ms
- cost_estimated: $0
- cacheable: true
- cache_key: format_${format_id}_${orientation}
- parallelizable: true
- parallel_with: [Step 2]
- skippable_when: []

**Error Handling:**
- strategy: abort
- retry:
    max_attempts: 2
    backoff: linear
    backoff_ms: 100
- abort_workflow: true
- notification: log + email

**Metadata:**
- story: DECISION-02
- version: 1.0.0
- dependencies: []
- breaking_changes: []
- author: Brad Frost Clone
- created_at: 2025-11-10
- updated_at: 2025-11-10
```

---

### Humano (Manual Review)

```yaml
#### Step 15: Quality Review (Optional)

task: reviewAdQuality()
responsável: Quality Assurance Team
responsavel_type: Humano
atomic_layer: Page

**Entrada:**
- campo: final_ad_png
  tipo: string (file path)
  origem: Step 14 (exportPNG)
  obrigatório: true

- campo: ad_spec
  tipo: object (complete ad specification)
  origem: state (ad-spec.json)
  obrigatório: true

- campo: quality_criteria
  tipo: array<string>
  origem: config
  obrigatório: true
  padrão: ["brand_alignment", "text_legibility", "visual_appeal", "no_face_coverage"]

**Saída:**
- campo: quality_review
  tipo: object { approved: boolean, score: number, feedback: string, reviewer: string }
  destino: state (ad-spec.json)
  persistido: true

**Checklist:**
  pre-conditions:
    - [ ] final_ad_png file exists
      tipo: pre-condition
      blocker: true
      validação: |
        const fs = require('fs');
        if (!fs.existsSync(final_ad_png)) {
          throw new Error(`Ad PNG not found: ${final_ad_png}`);
        }
  
  acceptance-criteria:
    - [ ] Ad meets all quality criteria
      tipo: acceptance
      blocker: false
      story: STORY-QA
      manual_check: true
    
    - [ ] Reviewer provided detailed feedback
      tipo: acceptance
      blocker: false
      story: STORY-QA
      manual_check: true

**Template:**
- path: templates/ui-forms/quality-review-form.html
  type: ui
  version: 1.0.0
  variables: [final_ad_png, ad_spec, quality_criteria]

**Tools:**
- N/A

**Scripts:**
- N/A

**Performance:**
- duration_expected: 180000ms  # 3 minutes (manual review)
- cost_estimated: $5  # Human labor cost
- cacheable: false
- parallelizable: false
- skippable_when: [skip_qa=true, batch_mode=true]

**Error Handling:**
- strategy: fallback
- fallback: Auto-approve if reviewer doesn't respond within 10 minutes
- retry:
    max_attempts: 1
    backoff: linear
    backoff_ms: 600000  # 10 minutes
- abort_workflow: false
- notification: slack

**Metadata:**
- story: STORY-QA
- version: 1.0.0
- dependencies: [Step 14]
- breaking_changes: []
- author: QA Team
- created_at: 2025-11-13
- updated_at: 2025-11-13
```

---

### Clone (Mind Emulation)

```yaml
#### Step 7c: Validate Components (Brad Frost Clone)

task: validateComponentsAtomicDesign()
responsável: Brad Frost Clone
responsavel_type: Clone
atomic_layer: Atom

**Entrada:**
- campo: ctaComponent
  tipo: object { text, style, colors }
  origem: Step 7a (designCTAComponent)
  obrigatório: true

- campo: badgeComponent
  tipo: object { text, style, colors } | null
  origem: Step 7b (designBadgeComponent)
  obrigatório: false

**Saída:**
- campo: validation_result
  tipo: object { valid: boolean, violations: array<object { rule, severity, message }> }
  destino: state (ad-spec.json)
  persistido: true

**Checklist:**
  pre-conditions:
    - [ ] ctaComponent exists
      tipo: pre-condition
      blocker: true
      validação: "expect(ctaComponent).toBeDefined()"
  
  post-conditions:
    - [ ] No Atomic Design violations detected
      tipo: post-condition
      blocker: true
      validação: |
        if (!validation_result.valid) {
          const criticalViolations = validation_result.violations.filter(v => v.severity === 'critical');
          if (criticalViolations.length > 0) {
            throw new Error(`Atomic Design violations: ${criticalViolations.map(v => v.message).join(', ')}`);
          }
        }
    
    - [ ] All components are context-agnostic (no positioning)
      tipo: post-condition
      blocker: true
      validação: |
        if (ctaComponent.position || ctaComponent.size) {
          throw new Error("CTA component has positioning data (DECISION-03 violation)");
        }
        if (badgeComponent && (badgeComponent.position || badgeComponent.size)) {
          throw new Error("Badge component has positioning data (DECISION-03 violation)");
        }
  
  acceptance-criteria:
    - [ ] Components follow Brad Frost's Atomic Design principles
      tipo: acceptance
      blocker: false
      story: DECISION-03
      manual_check: false

**Clone Configuration:**
- heuristics: clones/brad_frost/heuristics.yaml
- axioms: clones/brad_frost/axioms.yaml
- ai_fallback: true

**Tools:**
- callAgent:
    version: 1.0.0
    used_for: AI validation when heuristics are inconclusive
    shared_with: [Step 3, Step 4, Step 5, Step 6, Step 7, Step 8, Step 9, Step 11]

- validateHeuristics:
    version: 1.0.0
    used_for: Apply Brad Frost's design heuristics
    shared_with: [Step 7c only]

- validateAxioms:
    version: 1.0.0
    used_for: Validate against Atomic Design axioms
    shared_with: [Step 7c only]

**Scripts:**
- clones/brad_frost/validate-atomic-design.js:
    description: Atomic Design validation with heuristics + axioms
    language: javascript
    version: 1.0.0

**Performance:**
- duration_expected: 1500ms
- cost_estimated: $0.001  # Mostly heuristics, minimal AI
- cacheable: false
- parallelizable: false
- skippable_when: [skip_validation=true]

**Error Handling:**
- strategy: abort
- fallback: N/A (validation must pass)
- retry:
    max_attempts: 1
    backoff: linear
    backoff_ms: 0
- abort_workflow: true
- notification: log + slack

**Metadata:**
- story: DECISION-03
- version: 1.0.0
- dependencies: [Step 7a, Step 7b]
- breaking_changes: []
- author: Brad Frost Clone
- created_at: 2025-11-13
- updated_at: 2025-11-13
```

---

## Validation Checklist

Use this checklist to validate any AIOX Task:

### Required Fields

- [ ] `task` is defined and unique
- [ ] `responsável` is defined
- [ ] `responsavel_type` is one of: Agente, Worker, Humano, Clone
- [ ] `atomic_layer` is defined (or explicitly marked N/A)
- [ ] `Entrada` is defined (array, can be empty)
- [ ] `Saída` is defined (array, can be empty)

### Input/Output Quality

- [ ] All inputs have: campo, tipo, origem, obrigatório
- [ ] All outputs have: campo, tipo, destino, persistido
- [ ] Types are well-defined (not just "object" or "any")
- [ ] Sources/destinations reference valid steps

### Checklist Quality

- [ ] Pre-conditions validate inputs
- [ ] Post-conditions validate outputs
- [ ] Acceptance criteria link to Stories
- [ ] Blocking conditions are appropriate
- [ ] Validation logic is executable

### Templates & Tools

- [ ] Template referenced (if applicable)
- [ ] Tools cataloged (if applicable)
- [ ] Scripts listed (if applicable)
- [ ] All references are valid paths

### Performance & Error Handling

- [ ] Duration expected is realistic
- [ ] Cost estimated (for AI)
- [ ] Cacheability considered
- [ ] Parallelization opportunities identified
- [ ] Error handling strategy defined
- [ ] Retry logic appropriate

### Metadata

- [ ] Story linked (if applicable)
- [ ] Version defined
- [ ] Dependencies listed
- [ ] Breaking changes documented

---

## Migration Guide (v2.0 → v3.0)

### Step 1: Add Missing Required Fields

```yaml
# BEFORE (v2.0 - incomplete)
#### Step 3: Analyze Brief

task: analyzeBrief()
responsável: Ad Strategist

**Entrada:**
**Saída:**

# AFTER (v3.0 - complete)
#### Step 3: Analyze Brief

task: analyzeBrief()
responsável: Ad Strategist
responsavel_type: Agente  # ← ADDED
atomic_layer: Strategy    # ← ADDED

**Entrada:**
- campo: brief_text
  tipo: string
  origem: User Input (config)
  obrigatório: true

**Saída:**
- campo: adAnalysis
  tipo: object { ... }
  destino: state (ad-spec.json)
  persistido: true
```

### Step 2: Structure Checklists

```yaml
# BEFORE (v2.0 - inline validations)
**Validações:**
- ✅ brief_text has minimum 50 characters
- ✅ adAnalysis contains required fields

# AFTER (v3.0 - structured checklist)
**Checklist:**
  pre-conditions:
    - [ ] brief_text has minimum 50 characters
      tipo: pre-condition
      blocker: true
      validação: "expect(brief_text.length).toBeGreaterThanOrEqual(50)"
  
  post-conditions:
    - [ ] adAnalysis contains all required fields
      tipo: post-condition
      blocker: true
      validação: |
        expect(adAnalysis.goal).toBeTruthy();
        expect(adAnalysis.urgencyLevel).toMatch(/high|medium|low/);
```

### Step 3: Add Performance Metrics

```yaml
# BEFORE (v2.0 - no metrics)
(no performance section)

# AFTER (v3.0 - with metrics)
**Performance:**
- duration_expected: 4000ms
- cost_estimated: $0.0025
- cacheable: false
- parallelizable: false
- skippable_when: [ready_copy=true]
```

### Step 4: Add Error Handling

```yaml
# BEFORE (v2.0 - implicit)
(no error handling section)

# AFTER (v3.0 - explicit)
**Error Handling:**
- strategy: fallback
- fallback: Use default analysis
- retry:
    max_attempts: 3
    backoff: exponential
    backoff_ms: 1000
- abort_workflow: false
- notification: log
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-13 | Brad Frost Clone | Initial specification |

---

**END OF TASK FORMAT SPECIFICATION**

**Related Documents:**
- `EXECUTOR-DECISION-TREE.md` - How to choose executor type
- `TEMPLATE-SYSTEM-GUIDE.md` - Template design patterns
- `TOOLS-AND-SCRIPTS-CATALOG.md` - Available tools reference

