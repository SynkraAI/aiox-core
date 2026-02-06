# AIOS Task Blocks System

> **Version:** 1.0.0
> **Purpose:** Atomic, reusable components for task workflows

## Overview

Blocks are small, focused units of functionality that can be included in multiple tasks. They follow the DRY (Don't Repeat Yourself) principle and provide consistent behavior across the AIOS framework.

## Directory Structure

```
.aios-core/development/tasks/blocks/
├── README.md                  # This file
├── context-loading.md         # Load project context (git, gotchas, config)
├── execution-pattern.md       # Task blocking patterns + anti-patterns
├── agent-prompt-template.md   # Standardized agent invocation template
├── execution-modes.md         # Standard YOLO/Interactive/Pre-Flight modes (future)
├── pre-post-conditions.md     # Standard validation blocks (future)
└── error-handling.md          # Common error patterns (future)
```

## How to Include a Block

### Method 1: Markdown Include Comment

Use HTML comments with Include directive:

```markdown
<!-- Include: blocks/context-loading.md -->
```

With parameters:

```markdown
<!-- Include: blocks/context-loading.md -->
<!-- Parameters: category=frontend, include_git=false -->
```

### Method 2: YAML Reference

In task frontmatter:

```yaml
---
blocks:
  - id: context-loading
    params:
      category: supabase
      include_gotchas: true
---
```

### Method 3: Programmatic (JavaScript)

```javascript
const { loadBlock, executeBlock } = require('.aios-core/utils/block-loader');

// Load block definition
const block = await loadBlock('context-loading');

// Execute with parameters
const result = await executeBlock(block, {
  category: 'auth',
  include_git: true
});
```

## Block Anatomy

Each block file follows this structure:

```markdown
# Block: {Name}

> **Block ID:** `{kebab-case-id}`
> **Version:** {semver}
> **Type:** Reusable Include Block

## Purpose
{One-line description}

## Input
{Table of parameters with types, defaults, descriptions}

## Output
{Table of output fields with types and descriptions}

## Execution Steps
{YAML or pseudocode defining the steps}

## Usage
{Examples of how to include the block}

## Files Accessed
{Table of files the block reads/writes}

## Error Handling
{Table of errors and behaviors}

## Notes
{Additional context}
```

## Naming Conventions

| Convention | Example | Description |
|------------|---------|-------------|
| Block ID | `context-loading` | Kebab-case, descriptive |
| File name | `context-loading.md` | Same as block ID with `.md` |
| Parameters | `include_git` | Snake_case for clarity |
| Outputs | `git.status` | Dot notation for nested |

## Design Principles

### 1. Single Responsibility
Each block does ONE thing well. If a block needs to do multiple things, split it.

### 2. Idempotent
Running a block multiple times produces the same result (for read operations).

### 3. Fail Gracefully
Blocks should not halt task execution on minor errors. Log warnings and provide defaults.

### 4. Under 50 Lines
Keep blocks concise. If a block exceeds 50 lines of content, consider splitting.

### 5. Clear Contract
Every block must define:
- Input parameters (with types and defaults)
- Output fields (with types)
- Files accessed
- Error behavior

## Available Blocks

| Block | Purpose | Used By |
|-------|---------|---------|
| `context-loading` | Load git state, gotchas, preferences, config | dev-develop-story, create-next-story, qa-review-story |
| `execution-pattern` | Task blocking patterns (sequential/parallel/mixed) + anti-patterns | enhance-workflow, execute-epic, deep-strategic-planning, refactor-workflow, clone-mind, mind-research, squad-creator, bob-orchestrator |
| `agent-prompt-template` | Standardized template for spawning AIOS agents | Any skill/task that invokes agents via Task tool |

## Lines Saved (ROI)

When a block is adopted, it replaces duplicated code across tasks:

| Block | Lines per task | Tasks using | Total lines saved |
|-------|----------------|-------------|-------------------|
| `context-loading` | ~15-20 | 8+ tasks | ~120-160 lines |
| `execution-pattern` | ~35 | 8+ skills | ~280 lines |
| `agent-prompt-template` | ~15-20 | 10+ skills | ~150-200 lines |
| `execution-modes` | ~25-30 | ALL tasks | ~2500+ lines |

## Creating a New Block

1. **Identify repetition**: Find a pattern appearing in 2+ tasks
2. **Extract the pattern**: Copy to `blocks/{name}.md`
3. **Parameterize**: Make configurable inputs
4. **Document**: Follow the block anatomy template
5. **Test**: Verify in at least 2 tasks
6. **Update this README**: Add to Available Blocks table

## Future Blocks (Candidates)

Based on task analysis, these patterns appear frequently:

| Pattern | Occurrences | Candidate Block |
|---------|-------------|-----------------|
| Execution Modes (YOLO/Interactive/Pre-Flight) | ALL tasks | `execution-modes.md` |
| Pre/Post Conditions | ALL tasks | `validation-conditions.md` |
| Performance Metrics | ALL tasks | `performance-metrics.md` |
| Error Handling Strategy | ALL tasks | `error-handling.md` |
| Tool Dependencies | 80%+ tasks | `tool-dependencies.md` |

---

*AIOS Task Blocks System v1.1.0*
*Blocks: context-loading, execution-pattern, agent-prompt-template (extracted from observed patterns)*
