# Execution Pipeline: Create Implementation Plan

> **Phase:** 1 - Plan
> **Owner Agent:** @architect
> **Pipeline:** execution-pipeline

---

## Purpose

Gerar planos de implementacao executaveis a partir de specs aprovados. Transforma o spec.md em uma sequencia de subtasks atomicas, cada uma com verificacao, formando um roadmap deterministico para o coder.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: execution-plan

  elicit: true # User approval for plan before execution
  deterministic: true # Same spec should yield same plan structure
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: ID da story sendo planejada

    - name: spec
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      required: true
      description: Spec aprovado para implementacao

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: false
      description: Resultado da avaliacao de complexidade

    - name: research
      type: file
      path: docs/stories/{storyId}/spec/research.json
      required: false
      description: Dependencias pesquisadas

  outputs:
    - name: implementation.yaml
      type: file
      path: docs/stories/{storyId}/plan/implementation.yaml
      schema: implementation-schema

  verification:
    type: schema
    schemaRef: implementation-schema

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: true
```

---

## Core Rules

```yaml
rules:
  subtask_isolation:
    description: 'Cada subtask deve ser atomica e verificavel'
    constraints:
      - '1 servico por subtask (frontend, backend, infra, database)'
      - 'Maximo 3 arquivos por subtask'
      - 'Cada subtask DEVE ter verificacao definida'

  service_types:
    - frontend: 'UI components, stores, hooks, pages'
    - backend: 'API routes, services, controllers'
    - database: 'Migrations, seeds, schema changes'
    - infra: 'Config files, CI/CD, environment'

  verification_types:
    - command: 'Shell command that returns exit code 0 on success'
    - api: 'HTTP request with expected response'
    - browser: 'Visual/interaction verification via Playwright'
    - e2e: 'End-to-end test suite'
    - manual: 'Human verification required'

  phase_structure:
    description: 'Fases agrupam subtasks logicamente'
    typical_phases:
      - setup: 'Initial configuration, dependencies'
      - implementation: 'Core feature code'
      - testing: 'Unit and integration tests'
      - integration: 'Connecting components'
      - polish: 'Documentation, cleanup'
```

---

## Output Schema

```yaml
# implementation.yaml schema
$schema: 'http://json-schema.org/draft-07/schema#'
type: object
required:
  - storyId
  - createdAt
  - createdBy
  - status
  - complexity
  - phases

properties:
  storyId:
    type: string
    pattern: "^[A-Z]+-\\d+$|^story-\\d+(\\.\\d+)?$"
    description: 'Story identifier'

  createdAt:
    type: string
    format: date-time
    description: 'Plan creation timestamp'

  createdBy:
    type: string
    default: '@architect'
    description: 'Agent that created the plan'

  status:
    type: string
    enum: [pending, in_progress, completed, blocked]
    default: pending
    description: 'Overall plan status'

  complexity:
    type: string
    enum: [SIMPLE, STANDARD, COMPLEX]
    description: 'From complexity assessment or inferred'

  estimatedEffort:
    type: string
    description: 'Total estimated time'

  dependencies:
    type: array
    items:
      type: object
      properties:
        name:
          type: string
        version:
          type: string
        purpose:
          type: string
    description: 'External dependencies to install'

  phases:
    type: array
    minItems: 1
    items:
      $ref: '#/definitions/phase'

definitions:
  phase:
    type: object
    required: [id, name, subtasks]
    properties:
      id:
        type: string
        pattern: "^phase-\\d+$"
      name:
        type: string
        minLength: 2
      description:
        type: string
      subtasks:
        type: array
        minItems: 1
        items:
          $ref: '#/definitions/subtask'

  subtask:
    type: object
    required: [id, description, service, files, verification, status]
    properties:
      id:
        type: string
        pattern: "^\\d+\\.\\d+$"
        description: 'Phase.Subtask number (e.g., 1.1, 2.3)'
      description:
        type: string
        minLength: 10
        description: 'Clear description of what to implement'
      service:
        type: string
        enum: [frontend, backend, database, infra]
      files:
        type: array
        minItems: 1
        maxItems: 3
        items:
          type: string
        description: 'Files to create or modify'
      verification:
        $ref: '#/definitions/verification'
      status:
        type: string
        enum: [pending, in_progress, completed, failed, blocked]
        default: pending
      dependencies:
        type: array
        items:
          type: string
        description: 'Subtask IDs that must complete first'
      notes:
        type: string
        description: 'Additional context for the coder'

  verification:
    type: object
    required: [type]
    properties:
      type:
        type: string
        enum: [command, api, browser, e2e, manual]
      command:
        type: string
        description: 'Shell command for type=command'
      url:
        type: string
        description: 'URL for type=api'
      expectedStatus:
        type: integer
        description: 'HTTP status for type=api'
      testFile:
        type: string
        description: 'Test file path for type=e2e'
      instructions:
        type: string
        description: 'Instructions for type=manual'
```

---

## Execution Flow

### Step 1: Load and Validate Inputs

```yaml
load_inputs:
  action: gather_artifacts

  required:
    - spec.md: "Must exist and be approved (status not 'rejected')"

  optional:
    - complexity.json: 'Use STANDARD if missing'
    - research.json: 'Dependencies from research phase'

  validation:
    - Spec must have Implementation Checklist section
    - Spec must have Files to Modify/Create section
    - If complexity.json exists, use its result
```

### Step 2: Extract Implementation Requirements

```yaml
extraction:
  action: analyze_spec

  from_spec:
    - implementation_checklist: 'Section 9 of spec template'
    - files_to_modify: 'Section 5 of spec template'
    - files_to_create: 'Section 5 of spec template'
    - dependencies: 'Section 4 of spec template'
    - testing_strategy: 'Section 6 of spec template'

  from_complexity:
    - estimated_effort: 'complexity.estimatedEffort'
    - complexity_level: 'complexity.result'
    - scope_score: 'complexity.dimensions.scope.score'
```

### Step 3: Determine Phase Structure

```yaml
phase_structure:
  action: organize_into_phases

  strategy: |
    Based on complexity:

    SIMPLE (score <= 8):
      - phase-1: Setup + Implementation combined
      - phase-2: Testing

    STANDARD (score 9-15):
      - phase-1: Setup
      - phase-2: Implementation
      - phase-3: Testing
      - phase-4: Integration

    COMPLEX (score >= 16):
      - phase-1: Setup
      - phase-2: Core Implementation
      - phase-3: Secondary Implementation
      - phase-4: Testing
      - phase-5: Integration
      - phase-6: Polish

  grouping_rules:
    - Group files by service type
    - Database changes always in early phase
    - Tests follow their implementation
    - Integration connects multiple services
```

### Step 4: Generate Subtasks

```yaml
subtask_generation:
  action: create_subtasks

  rules:
    single_service: |
      Each subtask targets ONE service:
      - frontend: React/Vue/Angular components
      - backend: API endpoints, services
      - database: Migrations, seeds
      - infra: Config, CI/CD

    file_limit: |
      Maximum 3 files per subtask.
      If more files needed, split into multiple subtasks.

    dependency_order: |
      1. Database changes first (schemas, migrations)
      2. Backend services second (APIs, business logic)
      3. Frontend third (UI, state management)
      4. Integration last (connecting all pieces)

  id_convention: |
    {phase_number}.{subtask_number}
    Examples: 1.1, 1.2, 2.1, 2.2, 3.1

  description_format: |
    Action + Target + Purpose
    Example: "Create authStore module for user session management"
```

### Step 5: Assign Verification

```yaml
verification_assignment:
  action: define_verification_for_each_subtask

  type_selection:
    command:
      when: 'TypeScript/lint/build tasks'
      examples:
        - 'npm run typecheck'
        - 'npm run lint'
        - 'npm run build'
        - "npm test -- --grep '{pattern}'"

    api:
      when: 'Backend endpoint implementation'
      template:
        type: api
        url: 'http://localhost:3000/api/{endpoint}'
        method: POST|GET|PUT|DELETE
        expectedStatus: 200|201|204

    browser:
      when: 'UI component with visual interaction'
      template:
        type: browser
        url: 'http://localhost:3000/{page}'
        actions:
          - 'Click login button'
          - 'Verify redirect'

    e2e:
      when: 'Full flow verification'
      template:
        type: e2e
        testFile: 'tests/e2e/{feature}.spec.ts'
        command: "npm run test:e2e -- --grep '{pattern}'"

    manual:
      when: 'Cannot be automated'
      template:
        type: manual
        instructions: 'Verify {feature} works as expected'
```

### Step 6: Build Implementation Plan

```yaml
build_plan:
  action: assemble_implementation_yaml

  template: |
    storyId: "{storyId}"
    createdAt: "{timestamp}"
    createdBy: "@architect"
    status: pending
    complexity: "{SIMPLE|STANDARD|COMPLEX}"
    estimatedEffort: "{from complexity or calculated}"

    dependencies:
      - name: "{dependency}"
        version: "{version}"
        purpose: "{why needed}"

    phases:
      - id: phase-1
        name: "{phase_name}"
        description: "{what this phase accomplishes}"
        subtasks:
          - id: "1.1"
            description: "{action + target + purpose}"
            service: "{frontend|backend|database|infra}"
            files:
              - "{file_path_1}"
              - "{file_path_2}"
            verification:
              type: "{command|api|browser|e2e|manual}"
              command: "{if type=command}"
            status: pending
            notes: "{optional context for coder}"
```

### Step 6.5: Code Intelligence: Impact Analysis (Optional — Auto-skip if unavailable)

> **Condition:** Only execute if `isCodeIntelAvailable()` returns true.
> If no code intelligence provider is available, skip this step silently and proceed to Step 7.

When code intelligence is available, enrich each subtask with blast radius and risk assessment:

```javascript
const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
const { getImplementationImpact } = require('.aios-core/core/code-intel/helpers/planning-helper');

if (isCodeIntelAvailable()) {
  // For each subtask, analyze the files it modifies
  for (const subtask of allSubtasks) {
    const impact = await getImplementationImpact(subtask.files);
    if (impact) {
      subtask.codeIntelligence = {
        blastRadius: impact.blastRadius,
        riskLevel: impact.riskLevel, // 'LOW' | 'MEDIUM' | 'HIGH'
        references: impact.references,
      };

      // If HIGH risk, add warning note to subtask
      if (impact.riskLevel === 'HIGH') {
        subtask.notes = (subtask.notes || '') +
          ` ⚠️ HIGH blast radius (${impact.blastRadius} refs) — consider additional review.`;
      }
    }
  }
}
```

**If data is available, add to each subtask in implementation.yaml:**

```yaml
subtasks:
  - id: '1.1'
    description: '...'
    codeIntelligence:
      blastRadius: 12
      riskLevel: 'MEDIUM'
      references:
        - file: 'src/module-a.js'
        - file: 'tests/module-a.test.js'
```

**Risk Level Thresholds:**
- **LOW:** 0-4 references affected
- **MEDIUM:** 5-15 references affected
- **HIGH:** >15 references affected — add risk note to subtask

> **Note:** Risk data is advisory. It enriches the plan but does not block execution.

---

### Step 7: Validate Plan

```yaml
validation:
  action: verify_plan_completeness

  checks:
    - All spec files covered by at least one subtask
    - All subtasks have verification
    - No subtask has more than 3 files
    - Each subtask has single service
    - Dependency order is logical
    - Phase IDs are sequential

  output:
    valid: boolean
    issues: string[]
```

### Step 8: Elicit Approval

```yaml
elicitation:
  enabled: true
  format: plan-review

  presentation: |
    ## Implementation Plan for {storyId}

    **Complexity:** {complexity}
    **Phases:** {phase_count}
    **Total Subtasks:** {subtask_count}
    **Estimated Effort:** {effort}

    ### Phase Summary
    {for each phase: name, subtask count, services involved}

    ### Subtask Preview
    {first 3 subtasks with details}

    ---
    **Options:**
    1. Approve plan and save
    2. Show all subtasks in detail
    3. Adjust complexity/phase structure
    4. Add/remove subtasks
    5. Modify verification methods
    6. Start over with different approach
```

### Step 9: Save Output

```yaml
save_output:
  action: write_implementation_yaml
  path: docs/stories/{storyId}/plan/implementation.yaml

  create_directory: true
  overwrite: false # Prompt if exists
```

---

## Integration

### Command Integration (@architect)

```yaml
command:
  name: '*create-plan'
  syntax: '*create-plan {story-id} [--complexity=SIMPLE|STANDARD|COMPLEX]'
  agent: architect

  examples:
    - '*create-plan STORY-42'
    - '*create-plan story-4.1'
    - '*create-plan STORY-42 --complexity=COMPLEX'
```

### Pipeline Integration

```yaml
pipeline:
  phase: exec-plan
  previous_phase: spec-critique (approved)
  next_phase: exec-context

  requires:
    - spec.md (approved)

  optional:
    - complexity.json
    - research.json

  pass_to_next:
    - implementation.yaml

  skip_conditions: [] # Plan is always required
```

---

## Error Handling

```yaml
errors:
  - id: missing-spec
    condition: 'spec.md not found'
    action: 'Halt - cannot create plan without spec'
    blocking: true

  - id: empty-implementation-checklist
    condition: 'No implementation checklist in spec'
    action: 'Warn and generate basic checklist from files section'
    blocking: false

  - id: too-many-files
    condition: 'Subtask would have > 3 files'
    action: 'Split into multiple subtasks automatically'
    blocking: false

  - id: missing-verification
    condition: 'Cannot determine verification type'
    action: 'Default to type=command with typecheck'
    blocking: false

  - id: circular-dependency
    condition: 'Subtask dependencies form a cycle'
    action: 'Halt and report circular dependency'
    blocking: true
```

---

## Examples

### Example 1: SIMPLE Story - Add Environment Variable

**Input:** spec.md with single new env var

**Generated Plan:**

```yaml
storyId: STORY-100
createdAt: 2026-01-28T10:00:00Z
createdBy: '@architect'
status: pending
complexity: SIMPLE
estimatedEffort: '< 1 hour'

phases:
  - id: phase-1
    name: Implementation
    subtasks:
      - id: '1.1'
        description: Add API_KEY to environment configuration
        service: infra
        files:
          - .env.example
          - src/config/env.ts
        verification:
          type: command
          command: npm run typecheck
        status: pending

  - id: phase-2
    name: Testing
    subtasks:
      - id: '2.1'
        description: Add test for env variable validation
        service: backend
        files:
          - tests/config.test.ts
        verification:
          type: command
          command: npm test -- --grep "env"
        status: pending
```

### Example 2: STANDARD Story - Google OAuth Login

**Input:** spec.md with OAuth implementation

**Generated Plan:**

```yaml
storyId: STORY-42
createdAt: 2026-01-28T10:00:00Z
createdBy: '@architect'
status: pending
complexity: STANDARD
estimatedEffort: '1-2 days'

dependencies:
  - name: google-auth-library
    version: '^9.0.0'
    purpose: OAuth token handling
  - name: '@auth/core'
    version: '^0.18.0'
    purpose: Session management

phases:
  - id: phase-1
    name: Setup
    description: Install dependencies and configure OAuth
    subtasks:
      - id: '1.1'
        description: Install and configure Google OAuth dependencies
        service: infra
        files:
          - package.json
          - .env.example
        verification:
          type: command
          command: npm install && npm run typecheck
        status: pending

      - id: '1.2'
        description: Create OAuth configuration module
        service: backend
        files:
          - src/config/oauth.ts
        verification:
          type: command
          command: npm run typecheck
        status: pending

  - id: phase-2
    name: Backend Implementation
    description: Implement OAuth flow on server side
    subtasks:
      - id: '2.1'
        description: Implement OAuth callback handler
        service: backend
        files:
          - src/api/auth/google/callback.ts
          - src/services/authService.ts
        verification:
          type: api
          url: 'http://localhost:3000/api/auth/google/callback'
          expectedStatus: 302
        status: pending
        dependencies: ['1.2']

      - id: '2.2'
        description: Implement user session management
        service: backend
        files:
          - src/services/sessionService.ts
          - src/middleware/auth.ts
        verification:
          type: command
          command: npm test -- --grep "session"
        status: pending
        dependencies: ['2.1']

  - id: phase-3
    name: Frontend Implementation
    description: Implement OAuth UI components
    subtasks:
      - id: '3.1'
        description: Create auth store for session state
        service: frontend
        files:
          - src/stores/authStore.ts
        verification:
          type: command
          command: npm run typecheck
        status: pending

      - id: '3.2'
        description: Implement Google login button component
        service: frontend
        files:
          - src/components/GoogleLoginButton.tsx
          - src/components/GoogleLoginButton.module.css
        verification:
          type: browser
          url: 'http://localhost:3000/login'
          actions:
            - 'Verify Google login button is visible'
        status: pending
        dependencies: ['3.1']

  - id: phase-4
    name: Testing
    description: Add comprehensive tests for OAuth flow
    subtasks:
      - id: '4.1'
        description: Write unit tests for auth services
        service: backend
        files:
          - tests/services/authService.test.ts
          - tests/services/sessionService.test.ts
        verification:
          type: command
          command: npm test -- --grep "auth"
        status: pending
        dependencies: ['2.2']

      - id: '4.2'
        description: Write E2E test for complete login flow
        service: frontend
        files:
          - tests/e2e/auth.spec.ts
        verification:
          type: e2e
          testFile: tests/e2e/auth.spec.ts
          command: npm run test:e2e -- --grep "Google login"
        status: pending
        dependencies: ['3.2', '4.1']
```

---

## Quality Checks

```yaml
quality_gates:
  - id: file-coverage
    description: 'All spec files are covered'
    check: 'Every file in spec sections 5.1 and 5.2 appears in a subtask'

  - id: verification-coverage
    description: 'All subtasks have verification'
    check: 'verification object exists for every subtask'

  - id: service-isolation
    description: 'Single service per subtask'
    check: 'service field is one of: frontend, backend, database, infra'

  - id: file-limit
    description: 'File count within limits'
    check: 'Each subtask has 1-3 files'

  - id: dependency-validity
    description: 'Dependencies reference existing subtasks'
    check: 'All dependency IDs exist in the plan'
```

---

## Metadata

```yaml
metadata:
  story: '4.1'
  epic: 'Epic 4 - Execution Engine'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - execution-pipeline
    - implementation-plan
    - prompt-engineering
    - code-generation
```
