# Analyze Project Structure

**Purpose:** Analyze an existing AIOS project to understand its structure, services, patterns, and provide recommendations for implementing new features. This is Phase 1 of the Incremental Feature Workflow.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Quick scan with default recommendations
- Minimal user interaction
- **Best for:** Quick assessments, familiar projects

### 2. Interactive Mode - Balanced, Educational (3-5 prompts) **[DEFAULT]**
- Detailed analysis with explanation
- User input on feature requirements
- **Best for:** First-time analysis, new features

### 3. Comprehensive Mode - Full Analysis
- Complete project scan
- All patterns documented
- **Best for:** Large projects, major features

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: analyzeProjectStructure()
responsible: architect (Aria)
responsible_type: Agent
atomic_layer: Analysis
elicit: true

inputs:
- field: feature_description
  type: string
  source: User Input
  required: true
  validation: Non-empty string describing the feature to add

- field: project_path
  type: string
  source: User Input or cwd
  required: false
  validation: Valid directory path with .aios-core/

- field: executionMode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|comprehensive

outputs:
- field: project_analysis
  type: markdown
  destination: docs/architecture/project-analysis.md
  persisted: true

- field: recommended_approach
  type: markdown
  destination: docs/architecture/recommended-approach.md
  persisted: true

- field: service_inventory
  type: array
  destination: Memory
  persisted: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Project has .aios-core/ directory
    type: pre-condition
    blocker: true
    validation: |
      Check .aios-core/ directory exists in project root
    error_message: "Pre-condition failed: Not an AIOS project (.aios-core/ not found)"

  - [ ] Project path is accessible
    type: pre-condition
    blocker: true
    validation: |
      Verify project directory exists and is readable
    error_message: "Pre-condition failed: Project path not accessible"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project analysis document generated
    type: post-condition
    blocker: true
    validation: |
      Verify docs/architecture/project-analysis.md exists and is populated
    error_message: "Post-condition failed: Project analysis not generated"

  - [ ] Recommended approach document generated
    type: post-condition
    blocker: true
    validation: |
      Verify docs/architecture/recommended-approach.md exists and is populated
    error_message: "Post-condition failed: Recommended approach not generated"

  - [ ] Service inventory captured
    type: post-condition
    blocker: false
    validation: |
      Verify at least basic project structure was analyzed
    error_message: "Warning: Service inventory may be incomplete"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Project structure scanned
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert .aios-core/ configuration analyzed
    error_message: "Acceptance criterion not met: Project structure not scanned"

  - [ ] Service inventory complete
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert services in infrastructure/services/ listed
    error_message: "Acceptance criterion not met: Service inventory incomplete"

  - [ ] Pattern analysis performed
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert language, testing, and configuration patterns identified
    error_message: "Acceptance criterion not met: Pattern analysis not performed"

  - [ ] Recommendations generated
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert recommended_approach document has service type and implementation steps
    error_message: "Acceptance criterion not met: Recommendations not generated"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** filesystem
  - **Purpose:** Read project files and directory structure

- **Tool:** glob
  - **Purpose:** Find files matching patterns

- **Tool:** grep
  - **Purpose:** Search file contents for patterns

---

## Error Handling

**Strategy:** graceful-degradation

**Common Errors:**

1. **Error:** No .aios-core/ Directory
   - **Cause:** Not an AIOS project
   - **Resolution:** Initialize AIOS first or check directory
   - **Recovery:** Exit with clear message

2. **Error:** No Services Found
   - **Cause:** New project or services in different location
   - **Resolution:** Proceed with minimal analysis
   - **Recovery:** Generate analysis noting "No existing services"

3. **Error:** Permission Denied
   - **Cause:** Cannot read certain directories
   - **Resolution:** Skip inaccessible areas
   - **Recovery:** Note in analysis, continue with accessible files

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 30s-2min
cost_estimated: $0.001-0.003
token_usage: ~500-1,500 tokens
```

**Optimization Notes:**
- Directory scans are O(n) for service directories
- File reads are cached during analysis
- Pattern detection uses efficient regex

---

## Metadata

```yaml
story: WIS-15
version: 1.0.0
dependencies:
  - filesystem access
  - glob tool
tags:
  - analysis
  - architecture
  - incremental-feature
  - wis
created_at: 2025-12-23
updated_at: 2025-12-23
```

---

## Task Instructions

### Step 1: Elicitation - Gather Requirements

**Required Information:**

Present these prompts to the user:

```
1. "What feature/service needs to be added?"
   [TEXT INPUT - Required]
   Example: "TikTok API integration for creator management"

2. "Does this feature require external API integration?"
   [CHOICE: Yes / No / Unsure]

3. "Will this feature need database changes?"
   [CHOICE: Yes / No / Unsure]
```

**Store responses for recommendation generation.**

---

### Step 2: Project Structure Scan

**Scan the following locations:**

```javascript
// Core AIOS structure
const scanLocations = {
  aiosCore: '.aios-core/',
  services: '.aios-core/infrastructure/services/',
  squads: '.aios-core/squads/',
  agents: '.aios-core/development/agents/',
  tasks: '.aios-core/development/tasks/',
  data: '.aios-core/data/'
};
```

**For each location, identify:**
- Directory exists (boolean)
- Files/subdirectories present
- Key configuration files

**Service Inventory:**

For each service in `infrastructure/services/`:
1. Service name (directory name)
2. Language (JS vs TS - check for .ts files)
3. Has tests (check for __tests__/ or *.test.* files)
4. Has README (check for README.md)
5. Entry point (index.ts or index.js)

---

### Step 3: Pattern Analysis

**Analyze the following patterns:**

#### 3.1 Language Usage
```javascript
// Count file extensions
const languagePatterns = {
  typescript: glob('**/*.ts').length,
  javascript: glob('**/*.js').length,
  ratio: typescript / (typescript + javascript)
};

// Determine primary language
const primaryLanguage = ratio > 0.5 ? 'TypeScript' : 'JavaScript';
```

#### 3.2 Testing Approach
```javascript
// Check for test frameworks
const testingPatterns = {
  jest: exists('jest.config.js') || exists('jest.config.ts'),
  vitest: exists('vitest.config.ts'),
  mocha: exists('.mocharc.js'),
  hasTests: glob('**/*.test.{ts,js}').length > 0 ||
            glob('**/*.spec.{ts,js}').length > 0
};

// Determine testing framework
const testFramework = jest ? 'Jest' : vitest ? 'Vitest' : 'None detected';
```

#### 3.3 Documentation Style
```javascript
// Check documentation patterns
const docPatterns = {
  hasReadmes: glob('**/README.md').length,
  hasJSDoc: grep('@param|@returns|@example', '**/*.{ts,js}').length > 0,
  hasTypedoc: exists('typedoc.json')
};
```

#### 3.4 Configuration Patterns
```javascript
// Check configuration approaches
const configPatterns = {
  envVars: exists('.env.example') || exists('.env.local'),
  configFile: exists('aios.config.js') || exists('.aios-core/core-config.yaml'),
  envPrefix: grep('process.env', '**/*.{ts,js}').length > 0
};
```

---

### Step 4: Generate Recommendations

Based on elicitation responses and pattern analysis:

#### 4.1 Service Type Recommendation

| User Response | Detected Pattern | Recommendation |
|---------------|------------------|----------------|
| External API = Yes | Existing API services | **API Integration** |
| External API = No, DB = Yes | Data services exist | **Utility Service** |
| Unsure | No clear pattern | **Utility Service** (default) |
| Agent tooling mentioned | Squads configured | **Agent Tool (MCP)** |

#### 4.2 File Structure Suggestion

Based on existing service patterns, suggest structure:

```
.aios-core/infrastructure/services/{service-name}/
├── README.md           # Documentation
├── index.ts            # Entry point (factory + exports)
├── client.ts           # HTTP client (if API integration)
├── types.ts            # TypeScript interfaces
├── errors.ts           # Error classes
├── __tests__/          # Test directory
│   └── index.test.ts
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

#### 4.3 Agent Assignment

| Service Type | Primary Agent | Support Agent |
|--------------|---------------|---------------|
| API Integration | @dev | @qa |
| Utility Service | @dev | @architect |
| Agent Tool | @dev | @devops |
| Database-heavy | @data-engineer | @dev |

---

### Step 5: Generate Output Documents

#### 5.1 Project Analysis Document

Generate `docs/architecture/project-analysis.md`:

```markdown
# Project Analysis: {feature_name}

**Generated:** {date}
**Generated By:** @architect (Aria)
**Story:** WIS-15

---

## Project Structure

| Aspect | Value |
|--------|-------|
| Framework | AIOS-FullStack |
| Primary Language | {primaryLanguage} |
| Existing Services | {serviceCount} |
| Testing Framework | {testFramework} |
| Configuration | {configApproach} |

---

## Existing Services

| Service | Type | Language | Tests | README |
|---------|------|----------|-------|--------|
{for each service}
| {name} | {type} | {language} | {hasTests} | {hasReadme} |
{end for}

---

## Pattern Summary

### Language Distribution
- **TypeScript:** {tsCount} files ({tsPercent}%)
- **JavaScript:** {jsCount} files ({jsPercent}%)

### Testing
- **Framework:** {testFramework}
- **Test Files:** {testFileCount}
- **Coverage:** {coverageNote}

### Configuration
- **Environment Variables:** {envVarsUsed}
- **Config Files:** {configFilesUsed}

---

## Squad Configuration

{if squads exist}
| Squad | Agents | Services |
|-------|--------|----------|
{for each squad}
| {squadName} | {agentCount} | {serviceCount} |
{end for}
{else}
No squads configured.
{end if}
```

#### 5.2 Recommended Approach Document

Generate `docs/architecture/recommended-approach.md`:

```markdown
# Recommended Approach: {feature_name}

**Generated:** {date}
**Generated By:** @architect (Aria)
**Story:** WIS-15

---

## Feature Requirements

**Description:** {feature_description}
**API Integration Required:** {apiRequired}
**Database Changes Required:** {dbRequired}

---

## Service Type

**Recommendation:** {serviceType}

**Rationale:** {rationale based on analysis}

---

## Suggested Structure

```
.aios-core/infrastructure/services/{service_name}/
├── README.md
├── index.ts
├── client.ts          {if apiIntegration}
├── types.ts
├── errors.ts
├── __tests__/
│   └── index.test.ts
├── package.json
└── tsconfig.json
```

---

## Implementation Steps

1. **Scaffold Service**
   - Use `*create-service` task to generate structure
   - Select type: {serviceType}

2. **Implement Core Logic**
   - Create {mainModules}
   - Follow existing patterns from {referenceService}

3. **Add Tests**
   - Use {testFramework}
   - Target >70% coverage

4. **Documentation**
   - Update README.md
   - Add JSDoc comments

5. **Integration**
   - {integrationSteps based on type}

---

## Agent Assignment

| Role | Agent | Responsibilities |
|------|-------|------------------|
| Primary | @{primaryAgent} | {primaryResponsibilities} |
| Support | @{supportAgent} | {supportResponsibilities} |

---

## Dependencies

{list of dependencies based on service type}

---

## Next Steps

After this analysis:
1. Review and approve this approach
2. Run `*create-service {service_name}` to scaffold
3. Implement following the steps above
```

---

### Step 5.5: Code Intelligence: Dependency & Complexity (Optional — Auto-skip if unavailable)

> **Condition:** Only execute if `isCodeIntelAvailable()` returns true.
> If no code intelligence provider is available, skip this step silently and proceed to Step 6.

When code intelligence is available, enrich the analysis with real dependency and complexity data:

```javascript
const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
const { getDependencyGraph, getComplexityAnalysis } = require('.aios-core/core/code-intel/helpers/planning-helper');

if (isCodeIntelAvailable()) {
  const depGraph = await getDependencyGraph(projectPath);
  const complexity = await getComplexityAnalysis(serviceEntryPoints);

  // Add to project-analysis.md:
  // - depGraph.dependencies: real module dependency graph
  // - depGraph.summary: { totalDeps, depth }
  // - complexity.perFile: complexity score per file
  // - complexity.average: average complexity across analyzed files
}
```

**If data is available, add these sections to the analysis documents:**

**Dependency Graph (Code Intelligence):**

| Metric | Value |
|--------|-------|
| Total Dependencies | {{depGraph.summary.totalDeps}} |
| Dependency Depth | {{depGraph.summary.depth}} |

{{depGraph.dependencies key relationships}}

**Complexity Metrics (Code Intelligence):**

| File | Complexity Score |
|------|-----------------|
{{for each complexity.perFile}}
| {{file}} | {{complexity.score}} |
{{end for}}

**Average Complexity:** {{complexity.average}}

> **Note:** These metrics are from real code analysis, not estimates.

---

### Step 6: Present Results

Display summary to user:

```
=== Project Analysis Complete ===

Project: {projectName}
Services Found: {serviceCount}
Primary Language: {primaryLanguage}
Testing: {testFramework}

=== Recommendation ===

Feature: {feature_name}
Service Type: {serviceType}
Primary Agent: @{primaryAgent}

Documents Generated:
  1. docs/architecture/project-analysis.md
  2. docs/architecture/recommended-approach.md

Next Steps:
  1. Review the recommended approach
  2. Run `*create-service {service_name}` to scaffold
  3. Begin implementation with @{primaryAgent}

Would you like me to proceed with `*create-service`?
```

---

## Success Criteria

- [ ] Feature requirements captured from user
- [ ] Project structure scanned completely
- [ ] All existing services inventoried
- [ ] Language and testing patterns identified
- [ ] Service type recommendation provided
- [ ] File structure suggestion based on patterns
- [ ] Agent assignment recommended
- [ ] project-analysis.md generated
- [ ] recommended-approach.md generated

---

## Integration with Other Tasks

This task is typically followed by:

1. **`*create-service`** - Scaffold the new service (WIS-11)
2. **`*create-integration`** - For API integrations (WIS-12)
3. **`*extend-squad-tools`** - Add to squad if needed (WIS-13)

---

## Notes

- This task is read-only; no project files are modified
- Run this BEFORE creating new services
- Recommendations are suggestions, not requirements
- For large projects, analysis may take 1-2 minutes
- Always review generated documents before proceeding
