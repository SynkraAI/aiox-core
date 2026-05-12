---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Greenfield projects, quick setup

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Brownfield projects, complex configurations

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Critical projects, enterprise setups

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: setupProjectDocs()
responsible: dev (Developer)
responsible_type: Agent
atomic_layer: Documentation

inputs:
- field: targetDir
  type: string
  source: User Input or cwd
  required: false
  validation: Valid directory path

- field: projectName
  type: string
  source: User Input or package.json
  required: false
  validation: Non-empty string

- field: mode
  type: string
  source: User Input
  required: false
  validation: greenfield|brownfield|framework-dev

- field: executionMode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|pre-flight

outputs:
- field: docs_generated
  type: array
  destination: docs/architecture/
  persisted: true

- field: core_config
  type: file
  destination: .aiox-core/core-config.yaml
  persisted: true

- field: gitignore
  type: file
  destination: .gitignore
  persisted: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target directory exists and is writable
    type: pre-condition
    blocker: true
    validation: |
      Check target directory exists and has write permissions
    error_message: "Pre-condition failed: Target directory not accessible"

  - [ ] Documentation Integrity module is available
    type: pre-condition
    blocker: true
    validation: |
      Verify .aiox-core/infrastructure/scripts/documentation-integrity/index.js exists
    error_message: "Pre-condition failed: Documentation Integrity module not found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project docs created in docs/architecture/
    type: post-condition
    blocker: true
    validation: |
      Verify source-tree.md, coding-standards.md, tech-stack.md exist in docs/architecture/
    error_message: "Post-condition failed: Documentation files not created"

  - [ ] core-config.yaml created with valid deployment section
    type: post-condition
    blocker: true
    validation: |
      Verify .aiox-core/core-config.yaml exists and has deployment configuration
    error_message: "Post-condition failed: core-config.yaml not properly configured"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All documentation files generated from templates
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert docs contain project-specific content, not placeholders
    error_message: "Acceptance criterion not met: Docs contain unresolved placeholders"

  - [ ] .gitignore properly configured for project
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert .gitignore includes AIOX ignores and tech stack ignores
    error_message: "Acceptance criterion not met: .gitignore incomplete"

  - [ ] Configuration-Driven Architecture pattern applied
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert core-config.yaml contains project-specific values
    error_message: "Acceptance criterion not met: core-config.yaml not configuration-driven"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** documentation-integrity
  - **Purpose:** Mode detection, doc generation, config generation
  - **Source:** .aiox-core/infrastructure/scripts/documentation-integrity/index.js

- **Tool:** deployment-config-loader
  - **Purpose:** Load and validate deployment configuration
  - **Source:** .aiox-core/infrastructure/scripts/documentation-integrity/deployment-config-loader.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** mode-detector.js
  - **Purpose:** Detect installation mode from project markers
  - **Language:** JavaScript
  - **Location:** .aiox-core/infrastructure/scripts/documentation-integrity/mode-detector.js

- **Script:** doc-generator.js
  - **Purpose:** Generate project documentation from templates
  - **Language:** JavaScript
  - **Location:** .aiox-core/infrastructure/scripts/documentation-integrity/doc-generator.js

- **Script:** config-generator.js
  - **Purpose:** Generate core-config.yaml
  - **Language:** JavaScript
  - **Location:** .aiox-core/infrastructure/scripts/documentation-integrity/config-generator.js

- **Script:** gitignore-generator.js
  - **Purpose:** Generate or merge .gitignore
  - **Language:** JavaScript
  - **Location:** .aiox-core/infrastructure/scripts/documentation-integrity/gitignore-generator.js

---

## Error Handling

**Strategy:** fallback-defaults

**Common Errors:**

1. **Error:** Mode Detection Failed
   - **Cause:** Unable to determine project type from markers
   - **Resolution:** Use default mode (greenfield) or prompt user
   - **Recovery:** Provide mode selection options

2. **Error:** Template Not Found
   - **Cause:** Template file missing from templates directory
   - **Resolution:** Check template paths in templates/project-docs/
   - **Recovery:** Use inline fallback templates

3. **Error:** Config Write Failed
   - **Cause:** Permission denied or disk full
   - **Resolution:** Check directory permissions
   - **Recovery:** Output config to console for manual creation

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-3 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~500-2,000 tokens
```

**Optimization Notes:**
- Uses template-based generation for fast execution
- Minimal file I/O with batched writes
- Configuration-Driven Architecture reduces runtime decisions

---

## Metadata

```yaml
story: 6.9
version: 1.0.0
dependencies:
  - documentation-integrity module
tags:
  - documentation
  - setup
  - configuration
updated_at: 2025-12-14
```

---

tools:
  - filesystem        # Read/write project files
  - documentation-integrity  # Core module for this task
---

# Setup Project Documentation

## Purpose

Generate project-specific documentation and configuration using the Documentation Integrity System. This task creates the foundational docs that enable AI agents to understand project structure, coding standards, and deployment configuration.

## Task Instructions

### 1. Detect Installation Mode

First, determine the installation mode based on project markers:

```javascript
const { detectInstallationMode, collectMarkers } = require('./.aiox-core/infrastructure/scripts/documentation-integrity');

const targetDir = process.cwd(); // or specified directory
const detected = detectInstallationMode(targetDir);
const markers = collectMarkers(targetDir);

console.log(`Detected Mode: ${detected.mode}`);
console.log(`Confidence: ${detected.confidence}`);
console.log(`Reason: ${detected.reason}`);
```

**Mode Descriptions:**

| Mode | Description | Actions |
|------|-------------|---------|
| `framework-dev` | Contributing to aiox-core itself | Skip project setup, use existing config |
| `greenfield` | New empty project | Full scaffolding, deployment config wizard |
| `brownfield` | Existing project | Analyze and adapt, merge configurations |

### 2. Elicit Deployment Configuration (Greenfield/Brownfield)

For greenfield and brownfield projects, gather deployment preferences:

**Key Questions:**

1. **Deployment Workflow:**
   - `staging-first`: All changes go to staging before production
   - `direct-to-main`: Feature branches merge directly to main

2. **Deployment Platform:**
   - `Vercel`: Vercel deployment
   - `AWS`: AWS (S3/CloudFront, ECS, Lambda)
   - `Railway`: Railway.app
   - `Docker`: Docker-based deployment
   - `None`: No deployment platform configured

3. **Branch Configuration:**
   - Staging branch name (default: `staging`)
   - Production branch name (default: `main`)

4. **Quality Gates:**
   - Enable lint check? (default: yes)
   - Enable typecheck? (default: yes for TypeScript projects)
   - Enable tests? (default: yes)
   - Enable security scan? (default: no)

### 3. Generate Documentation

Using the gathered context, generate project documentation:

```javascript
const { buildDocContext, generateDocs } = require('./.aiox-core/infrastructure/scripts/documentation-integrity');

const context = buildDocContext(projectName, mode, markers, {
  // Custom overrides if needed
});

const result = generateDocs(targetDir, context, {
  dryRun: false,  // Set true to preview
});

console.log(`Generated ${result.filesCreated.length} documentation files`);
```

**Files Generated:**

| File | Purpose |
|------|---------|
| `docs/architecture/source-tree.md` | Project structure documentation |
| `docs/architecture/coding-standards.md` | Coding conventions and patterns |
| `docs/architecture/tech-stack.md` | Technology stack reference |

### 4. Generate Core Configuration

Create the core-config.yaml with deployment settings:

```javascript
const { buildConfigContext, generateConfig, DeploymentWorkflow, DeploymentPlatform } = require('./.aiox-core/infrastructure/scripts/documentation-integrity');

const configContext = buildConfigContext(projectName, mode, {
  workflow: DeploymentWorkflow.STAGING_FIRST,
  platform: DeploymentPlatform.VERCEL,
  stagingBranch: 'staging',
  productionBranch: 'main',
  qualityGates: {
    lint: true,
    typecheck: true,
    tests: true,
    security: false,
  },
});

const configResult = generateConfig(targetDir, mode, configContext);
```

### 5. Generate/Merge .gitignore

Handle .gitignore based on project state:

```javascript
const { generateGitignoreFile, hasAioxIntegration } = require('./.aiox-core/infrastructure/scripts/documentation-integrity');

const gitignoreResult = generateGitignoreFile(targetDir, markers, {
  projectName,
  merge: mode === 'brownfield',  // Merge with existing for brownfield
});

console.log(`Gitignore ${gitignoreResult.mode}: ${gitignoreResult.path}`);
```

### 6. Verify Configuration-Driven Architecture

Confirm the deployment config can be loaded by other tasks:

```javascript
const { loadDeploymentConfig, validateDeploymentConfig } = require('./.aiox-core/infrastructure/scripts/documentation-integrity');

const deployConfig = loadDeploymentConfig(targetDir);
const validation = validateDeploymentConfig(deployConfig);

if (validation.isValid) {
  console.log('Configuration-Driven Architecture ready');
  console.log(`Workflow: ${deployConfig.workflow}`);
  console.log(`Platform: ${deployConfig.platform}`);
} else {
  console.error('Configuration validation failed:', validation.errors);
}
```

## Success Criteria

- [ ] Installation mode correctly detected
- [ ] Project documentation generated in `docs/architecture/`
- [ ] `core-config.yaml` created with deployment section
- [ ] `.gitignore` properly configured (created or merged)
- [ ] Configuration passes validation
- [ ] No unresolved template placeholders in generated files

## Output

After successful execution:

```text
Project Documentation Setup Complete
=====================================
Mode: greenfield
Project: my-awesome-app

Generated Files:
  ✓ docs/architecture/source-tree.md
  ✓ docs/architecture/coding-standards.md
  ✓ docs/architecture/tech-stack.md
  ✓ .aiox-core/core-config.yaml
  ✓ .gitignore (created)

Deployment Configuration:
  Workflow: staging-first
  Platform: vercel
  Quality Gates: lint, typecheck, tests
```

## Notes

- This task implements the Configuration-Driven Architecture pattern
- Tasks read project-specific values from `core-config.yaml`
- For brownfield projects, existing configurations are preserved
- Use `*analyze-brownfield` task first for complex existing projects
