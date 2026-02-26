# Plan Pipeline: Create Context

> **Phase:** execution-context
> **Owner Agent:** @architect
> **Pipeline:** plan-pipeline

---

## Purpose

Gera os arquivos de contexto necessários para a fase de planejamento/implementação de uma story. Extrai informações do projeto (stack, convenções, padrões) e identifica arquivos relevantes para o escopo do story.

**Key Outputs:**

- `project-context.yaml` - Stack tecnológico, convenções, e padrões do projeto
- `files-context.yaml` - Arquivos relevantes para implementação do story

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: execution-context

  elicit: false # Runs automatically without user interaction
  deterministic: true # Same inputs should yield same context
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true
      description: ID da story sendo contextualizada

    - name: storyPath
      type: file
      path: docs/stories/{storyId}/**/*.md
      required: false
      description: Path alternativo para o story (se não seguir convenção)

    - name: specPath
      type: file
      path: docs/stories/{storyId}/spec/
      required: false
      description: Spec existente do story (se disponível)

    - name: forceRefresh
      type: boolean
      required: false
      default: false
      description: Força regeneração mesmo se contexto existir

  outputs:
    - name: project-context.yaml
      type: file
      path: docs/stories/{storyId}/plan/project-context.yaml
      schema: project-context-schema

    - name: files-context.yaml
      type: file
      path: docs/stories/{storyId}/plan/files-context.yaml
      schema: files-context-schema

  verification:
    type: schema
    schemaRef: context-schemas

  contextRequirements:
    projectContext: false # This task GENERATES project context
    filesContext: false # This task GENERATES files context
    implementationPlan: false
    spec: true # Needs spec to understand story scope
```

---

## Data Sources

### Source 1: Core Configuration

```yaml
source: core-config
location: .aios-core/core-config.yaml

extract:
  - project.type # EXISTING_AIOS, GREENFIELD, etc.
  - project.version # Framework version
  - ide.selected # Active IDEs
  - github.semantic_release.enabled
  - autoClaude.version # ADE version
  - devStoryLocation # Story path convention
  - scriptsLocation # Utility locations
```

### Source 2: Tech Stack Documentation

```yaml
source: tech-stack
locations:
  - docs/framework/tech-stack.md # Primary
  - docs/architecture/tech-stack.md # Fallback

extract:
  - runtime: 'Node.js version, package manager'
  - language: 'JavaScript/TypeScript standards'
  - dependencies: 'Core dependencies and versions'
  - testing: 'Testing framework (Jest, Vitest)'
  - linting: 'ESLint, Prettier configs'
  - build: 'Build tools and scripts'
```

### Source 3: Source Tree Documentation

```yaml
source: source-tree
locations:
  - docs/framework/source-tree.md # Primary
  - docs/architecture/source-tree.md # Fallback

extract:
  - directory_structure: 'Key directories and purposes'
  - file_patterns: 'Naming conventions'
  - placement_rules: 'Where to put new files'
```

### Source 4: Package Manifest

```yaml
source: package-json
location: package.json

extract:
  - name: 'Package name'
  - version: 'Current version'
  - dependencies: 'Production dependencies'
  - devDependencies: 'Development dependencies'
  - scripts: 'Available npm scripts'
```

### Source 5: TypeScript Configuration

```yaml
source: tsconfig
location: tsconfig.json

extract:
  - compilerOptions.target: 'JS target version'
  - compilerOptions.module: 'Module system'
  - compilerOptions.strict: 'Strict mode enabled'
  - paths: 'Path aliases'
```

---

## Execution Flow

### Step 1: Validate Inputs

```yaml
validation:
  action: validate_story_exists

  steps:
    - id: check-story-path
      description: 'Verify story directory exists'
      action: |
        Check if docs/stories/{storyId}/ exists
        OR if custom storyPath provided and exists

    - id: check-spec-exists
      description: 'Look for spec directory'
      action: |
        Check for docs/stories/{storyId}/spec/
        If not found, proceed with story-level analysis only

    - id: check-existing-context
      description: 'Check if context already exists'
      action: |
        If docs/stories/{storyId}/plan/project-context.yaml exists
        AND forceRefresh = false
        THEN skip regeneration (return existing)
```

### Step 2: Extract Project Context

```yaml
project_extraction:
  action: gather_project_info

  steps:
    - id: read-core-config
      description: 'Parse .aios-core/core-config.yaml'
      action: |
        1. Load YAML file
        2. Extract project metadata
        3. Extract IDE configuration
        4. Extract framework settings

    - id: read-tech-stack
      description: 'Parse tech-stack documentation'
      action: |
        1. Try docs/framework/tech-stack.md first
        2. Fallback to docs/architecture/tech-stack.md
        3. Extract runtime, language, testing info
        4. Note any deprecated warnings

    - id: read-source-tree
      description: 'Parse source-tree documentation'
      action: |
        1. Try docs/framework/source-tree.md first
        2. Fallback to docs/architecture/source-tree.md
        3. Extract directory structure patterns
        4. Extract file naming conventions

    - id: read-package-json
      description: 'Parse package.json'
      action: |
        1. Load package.json
        2. Extract name, version
        3. Identify key dependencies
        4. List available npm scripts

    - id: read-tsconfig
      description: 'Parse tsconfig.json (if exists)'
      action: |
        1. Check if tsconfig.json exists
        2. Extract compiler options
        3. Extract path aliases
        4. Note strict mode settings
```

### Step 3: Analyze Story Scope

```yaml
scope_analysis:
  action: determine_relevant_files

  steps:
    - id: parse-story-content
      description: 'Extract story requirements'
      action: |
        1. Read story markdown file
        2. Extract acceptance criteria
        3. Identify mentioned components/modules
        4. List any explicit file references

    - id: parse-spec-if-exists
      description: 'Extract spec requirements'
      action: |
        1. If spec/requirements.json exists, load it
        2. Extract functional requirements
        3. Extract technical constraints
        4. Note any architecture decisions

    - id: identify-affected-areas
      description: 'Map story to codebase areas'
      action: |
        Based on story content, identify:
        - Components likely to be modified
        - Services/APIs involved
        - Database/schema changes
        - Test files needed

    - id: search-similar-patterns
      description: 'Find existing similar implementations'
      action: |
        1. Extract key concepts from story
        2. Search codebase for similar patterns
        3. Identify reusable components
        4. Note exemplar implementations
```

### Step 3.5: Code Intelligence: Implementation Context (Optional — Auto-skip if unavailable)

> **Condition:** Only execute if `isCodeIntelAvailable()` returns true.
> If no code intelligence provider is available, skip this step silently and proceed to Step 4.

When code intelligence is available, enrich the context with real symbol definitions, dependencies, and test references:

```javascript
const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
const { getImplementationContext } = require('.aios-core/core/code-intel/helpers/planning-helper');

if (isCodeIntelAvailable()) {
  // Extract key symbols from story analysis (step 3)
  const symbols = extractedComponents; // From step 3 scope analysis

  const context = await getImplementationContext(symbols);

  // Enrich files-context.yaml with:
  // - context.definitions: exact file + line for each symbol definition
  // - context.dependencies: dependency graph per symbol
  // - context.relatedTests: test files referencing each symbol
}
```

**If data is available, add to files-context.yaml:**

```yaml
codeIntelligence:
  definitions:
    - symbol: '{symbol}'
      file: '{definition.file}'
      line: {definition.line}
  dependencies:
    - symbol: '{symbol}'
      deps: {dependency graph}
  relatedTests:
    - symbol: '{symbol}'
      tests:
        - file: '{test.file}'
          line: {test.line}
```

> **Note:** Partial results are accepted — if findDefinition succeeds but analyzeDependencies fails for a symbol, the definition is still included.

---

### Step 4: Generate Outputs

```yaml
output_generation:
  action: create_context_files

  steps:
    - id: ensure-plan-directory
      description: 'Create plan directory if needed'
      action: |
        mkdir -p docs/stories/{storyId}/plan/

    - id: generate-project-context
      description: 'Create project-context.yaml'
      template: project-context-template

    - id: generate-files-context
      description: 'Create files-context.yaml'
      template: files-context-template

    - id: validate-outputs
      description: 'Validate generated files'
      action: |
        1. Parse generated YAML files
        2. Validate against schemas
        3. Check for required fields
```

---

## Output Templates

### project-context.yaml Template

```yaml
# Auto-generated by @architect *create-context
# Story: {storyId}
# Generated: {timestamp}

project:
  name: '{package.name}'
  version: '{package.version}'
  type: '{core-config.project.type}'

  stack:
    runtime: '{tech-stack.runtime}'
    language: '{tech-stack.language}'
    testing: '{tech-stack.testing}'
    linting: '{tech-stack.linting}'

  conventions:
    naming:
      files: '{source-tree.file_patterns.files}'
      directories: '{source-tree.file_patterns.directories}'
      components: '{extracted from codebase analysis}'
    imports:
      style: '{tsconfig.paths based or relative}'
      alias: '{tsconfig.paths if present}'

  patterns:
    state: '{detected state management pattern}'
    api: '{detected API pattern}'
    components: '{detected component pattern}'
    testing: '{detected testing pattern}'

  scripts:
    test: '{package.scripts.test}'
    lint: '{package.scripts.lint}'
    build: '{package.scripts.build}'
    dev: '{package.scripts.dev}'

  directories:
    source: '{main source directory}'
    tests: '{test directory}'
    stories: '{devStoryLocation}'
    agents: '{scriptsLocation.development or .aios-core/development/agents}'

metadata:
  generatedBy: '@architect'
  generatedAt: '{ISO timestamp}'
  sources:
    - '.aios-core/core-config.yaml'
    - 'docs/framework/tech-stack.md'
    - 'docs/framework/source-tree.md'
    - 'package.json'
    - 'tsconfig.json'
```

### files-context.yaml Template

```yaml
# Auto-generated by @architect *create-context
# Story: {storyId}
# Generated: {timestamp}

storyId: '{storyId}'
storyPath: 'docs/stories/{storyId}/'
specAvailable: { true|false }

relevantFiles:
  # Files that should be modified
  toModify:
    - path: '{detected file path}'
      purpose: '{why this file is relevant}'
      confidence: high|medium|low
      reason: '{detection reason}'

  # Files with similar patterns to follow
  exemplars:
    - path: '{similar implementation path}'
      purpose: '{what pattern to follow}'
      keyPatterns:
        - '{pattern 1}'
        - '{pattern 2}'

  # Files to be aware of (dependencies, configs)
  dependencies:
    - path: '{dependency file}'
      relationship: '{how it relates to the story}'

  # Test files needed
  tests:
    - path: '{test file path}'
      type: unit|integration|e2e
      status: exists|needed

searchQueries:
  # Queries used to find relevant files
  - query: '{search query used}'
    results: { number of results }

storyAnalysis:
  # Summary of story scope
  components:
    - '{component 1}'
    - '{component 2}'
  modules:
    - '{module 1}'
  estimatedFiles:
    new: { count }
    modified: { count }
    deleted: { count }

metadata:
  generatedBy: '@architect'
  generatedAt: '{ISO timestamp}'
  storyParsed: true|false
  specParsed: true|false
```

---

## Output Schemas

### project-context-schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["project", "metadata"],
  "properties": {
    "project": {
      "type": "object",
      "required": ["name", "stack"],
      "properties": {
        "name": { "type": "string" },
        "version": { "type": "string" },
        "type": { "type": "string" },
        "stack": {
          "type": "object",
          "properties": {
            "runtime": { "type": "string" },
            "language": { "type": "string" },
            "testing": { "type": "string" },
            "linting": { "type": "string" }
          }
        },
        "conventions": { "type": "object" },
        "patterns": { "type": "object" },
        "scripts": { "type": "object" },
        "directories": { "type": "object" }
      }
    },
    "metadata": {
      "type": "object",
      "required": ["generatedBy", "generatedAt"],
      "properties": {
        "generatedBy": { "type": "string" },
        "generatedAt": { "type": "string", "format": "date-time" },
        "sources": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

### files-context-schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["storyId", "relevantFiles", "metadata"],
  "properties": {
    "storyId": { "type": "string" },
    "storyPath": { "type": "string" },
    "specAvailable": { "type": "boolean" },
    "relevantFiles": {
      "type": "object",
      "properties": {
        "toModify": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["path", "purpose"],
            "properties": {
              "path": { "type": "string" },
              "purpose": { "type": "string" },
              "confidence": { "enum": ["high", "medium", "low"] },
              "reason": { "type": "string" }
            }
          }
        },
        "exemplars": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["path", "purpose"],
            "properties": {
              "path": { "type": "string" },
              "purpose": { "type": "string" },
              "keyPatterns": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "dependencies": { "type": "array" },
        "tests": { "type": "array" }
      }
    },
    "searchQueries": { "type": "array" },
    "storyAnalysis": { "type": "object" },
    "metadata": {
      "type": "object",
      "required": ["generatedBy", "generatedAt"],
      "properties": {
        "generatedBy": { "type": "string" },
        "generatedAt": { "type": "string", "format": "date-time" },
        "storyParsed": { "type": "boolean" },
        "specParsed": { "type": "boolean" }
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
  name: '*create-context'
  syntax: '*create-context {story-id} [--force]'
  agent: architect

  examples:
    - '*create-context 4.2'
    - '*create-context STORY-42 --force'
    - '*create-context aios-migration/story-6.1.2.5'

  options:
    - name: --force
      description: Force regeneration even if context exists
      default: false
```

### Pipeline Integration

```yaml
pipeline:
  phase: execution-context
  standalone: true # Can run independently

  # When run as part of plan-pipeline:
  previous_phase: spec-critique # Or spec-write if no critique
  next_phase: plan-implementation

  pass_to_next:
    - project-context.yaml
    - files-context.yaml

  # Can also be triggered standalone before implementation
  triggers:
    - 'Before *develop-story if context missing'
    - 'Manual via *create-context'
```

### Usage in Implementation Plan

```yaml
consumption:
  by_task: plan-implementation
  usage: |
    The implementation plan task reads these context files to:
    1. Understand project conventions when generating code
    2. Identify files to create/modify
    3. Find exemplar patterns to follow
    4. Know which tests to create

  by_agent: dev
  usage: |
    @dev reads context before implementing to:
    1. Follow naming conventions
    2. Use correct import styles
    3. Know where to place new files
    4. Reference similar implementations
```

---

## Error Handling

```yaml
errors:
  - id: story-not-found
    condition: 'Story directory does not exist'
    action: 'Halt and report story not found'
    blocking: true
    message: "Story '{storyId}' not found. Check path and try again."

  - id: core-config-missing
    condition: '.aios-core/core-config.yaml not found'
    action: 'Use defaults, warn user'
    blocking: false
    fallback: |
      Use sensible defaults:
      - project.type: UNKNOWN
      - ide.selected: [claude-code]

  - id: tech-stack-missing
    condition: 'No tech-stack.md found in any location'
    action: 'Infer from package.json'
    blocking: false
    fallback: |
      Analyze package.json to determine:
      - Runtime from engines.node
      - Testing from devDependencies (jest/vitest)
      - Language from typescript presence

  - id: no-relevant-files
    condition: 'Could not identify any relevant files'
    action: 'Generate minimal context, flag for review'
    blocking: false
    output: |
      Generate context with empty relevantFiles.toModify
      Set confidence: low on all findings
      Add warning in metadata

  - id: parse-error
    condition: 'YAML/JSON parse error'
    action: 'Report specific file and error, halt'
    blocking: true
```

---

## Examples

### Example 1: Basic Story Context Generation

**Input:** `*create-context 4.2`

**Execution:**

```
1. Check docs/stories/4.2/ exists ✓
2. Check docs/stories/4.2/spec/ exists → No spec found
3. Read .aios-core/core-config.yaml ✓
4. Read docs/framework/tech-stack.md ✓
5. Read docs/framework/source-tree.md ✓
6. Read package.json ✓
7. Read tsconfig.json ✓
8. Parse story content for scope
9. Search codebase for similar patterns
10. Generate outputs
```

**Output:** `docs/stories/4.2/plan/project-context.yaml`

```yaml
project:
  name: 'aios-core'
  version: '2.3.0'
  type: EXISTING_AIOS

  stack:
    runtime: 'Node.js 18+'
    language: 'JavaScript ES2022 (TypeScript for types)'
    testing: 'Jest 30.x'
    linting: 'ESLint 9.x + Prettier 3.x'

  conventions:
    naming:
      files: 'kebab-case'
      directories: 'kebab-case'
      components: 'PascalCase'
    imports:
      style: 'CommonJS (require/module.exports)'
      alias: 'None (relative paths)'

  patterns:
    state: 'N/A (CLI tool)'
    api: 'Commander.js for CLI, execa for subprocesses'
    components: 'Markdown with YAML frontmatter'
    testing: 'Jest with describe/it blocks'

  scripts:
    test: 'jest'
    lint: 'eslint . --fix'
    build: 'npm run build'
    dev: 'node bin/aios.js'

  directories:
    source: '.aios-core/'
    tests: 'tests/'
    stories: 'docs/stories'
    agents: '.aios-core/development/agents'

metadata:
  generatedBy: '@architect'
  generatedAt: '2026-01-28T12:00:00Z'
  sources:
    - '.aios-core/core-config.yaml'
    - 'docs/framework/tech-stack.md'
    - 'docs/framework/source-tree.md'
    - 'package.json'
    - 'tsconfig.json'
```

### Example 2: Story with Spec Available

**Input:** `*create-context STORY-42` (with spec/requirements.json present)

**Additional Output:** `docs/stories/STORY-42/plan/files-context.yaml`

```yaml
storyId: 'STORY-42'
storyPath: 'docs/stories/STORY-42/'
specAvailable: true

relevantFiles:
  toModify:
    - path: '.aios-core/development/tasks/spec-gather-requirements.md'
      purpose: 'Update task to include new elicitation method'
      confidence: high
      reason: 'Mentioned in acceptance criteria AC-1'

    - path: '.aios-core/core/elicitation/elicitation-engine.js'
      purpose: 'Add new question type'
      confidence: medium
      reason: 'Inferred from requirement FR-2'

  exemplars:
    - path: '.aios-core/development/tasks/spec-assess-complexity.md'
      purpose: 'Follow same V3 autoClaude format'
      keyPatterns:
        - 'autoClaude section with version 3.0'
        - 'inputs/outputs YAML structure'
        - 'Error handling section'

    - path: '.aios-core/core/elicitation/session/session-manager.js'
      purpose: 'Similar state management pattern'
      keyPatterns:
        - 'Class-based structure'
        - 'Async methods'
        - 'Event emission'

  dependencies:
    - path: '.aios-core/core-config.yaml'
      relationship: 'May need new config key'

  tests:
    - path: 'tests/unit/elicitation-engine.test.js'
      type: unit
      status: exists

    - path: 'tests/integration/spec-pipeline.test.js'
      type: integration
      status: needed

searchQueries:
  - query: 'elicitation'
    results: 12
  - query: 'spec-pipeline'
    results: 5

storyAnalysis:
  components:
    - 'ElicitationEngine'
    - 'SpecPipeline'
  modules:
    - 'core/elicitation'
    - 'development/tasks'
  estimatedFiles:
    new: 1
    modified: 3
    deleted: 0

metadata:
  generatedBy: '@architect'
  generatedAt: '2026-01-28T12:00:00Z'
  storyParsed: true
  specParsed: true
```

---

## Metadata

```yaml
metadata:
  story: '4.2'
  epic: 'Epic 4 - Execution Engine'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - plan-pipeline
    - context-generation
    - project-analysis
    - prompt-engineering
    - deterministic
```
