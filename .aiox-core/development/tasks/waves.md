# Task: `*waves` - Wave Analysis

<!-- Story: WIS-4 - Wave Analysis Engine -->
<!-- Version: 1.0.0 -->
<!-- Created: 2025-12-25 -->

## Overview

Analyzes workflow task dependencies to identify waves of tasks that can execute in parallel. Shows optimization opportunities and critical path.

## Usage

```
*waves [workflow-name] [options]
```

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `workflow` | string | No | Workflow name to analyze (default: auto-detect from context) |

## Options

| Option | Type | Description |
|--------|------|-------------|
| `--visual` | flag | Show ASCII visualization of wave structure |
| `--json` | flag | Output as JSON format |
| `--help` | flag | Show this help message |

## Examples

```bash
# Analyze current workflow (auto-detected)
*waves

# Analyze specific workflow
*waves story_development

# Visual ASCII representation
*waves story_development --visual

# JSON output for programmatic use
*waves story_development --json
```

## Output

### Standard Output

```
Wave Analysis: story_development
════════════════════════════════════════

Wave 1 (parallel):
  └─ read-story
  └─ setup-branch

Wave 2:
  └─ implement

Wave 3 (parallel):
  └─ write-tests
  └─ update-docs

Wave 4:
  └─ run-tests

Total Sequential: 57min
Total Parallel:   42min
Optimization:     26% faster

Critical Path: read-story → implement → write-tests → run-tests
```

### Visual Output (--visual)

```
Wave Analysis: story_development
════════════════════════════════════════

Wave 1 ──┬── read-story (5min)
         └── setup-branch (2min)
              │
Wave 2 ──────── implement (30min)
              │
Wave 3 ──┬── write-tests (10min)
         └── update-docs (5min)
              │
Wave 4 ──────── run-tests (5min)

Total Sequential: 57min
Total Parallel:   42min
Optimization:     26% faster

Critical Path: read-story → implement → write-tests → run-tests
```

### JSON Output (--json)

```json
{
  "workflowId": "story_development",
  "totalTasks": 6,
  "waves": [
    {
      "waveNumber": 1,
      "tasks": ["read-story", "setup-branch"],
      "parallel": true,
      "dependsOn": [],
      "estimatedDuration": "5min"
    }
  ],
  "optimizationGain": "26%",
  "criticalPath": ["read-story", "implement", "write-tests", "run-tests"]
}
```

## Circular Dependency Handling

If circular dependencies are detected, the command will show an error:

```
❌ Circular Dependency Detected!

Cycle: task-a → task-b → task-c → task-a

Suggestion: Remove dependency from task-c to task-a
```

## Integration

### With `*next` Command

The `*waves` analysis integrates with the `*next` command to show wave context:

```
🧭 Workflow: story_development
📍 State: in_development (Wave 2 of 4)

Current Wave (parallel):
  ├─ `*write-tests` - Write unit tests ⏳
  └─ `*update-docs` - Update documentation ⏳

Next Wave (after current completes):
  └─ `*run-tests` - Execute test suite

💡 Tip: Run both current wave tasks in parallel to save ~15min
```

## Implementation

```javascript
// Task implementation
const { analyzeWaves, createWaveAnalyzer } = require('.aiox-core/workflow-intelligence');

async function executeWaves(args, options) {
  const workflowId = args[0] || await detectCurrentWorkflow();
  const analyzer = createWaveAnalyzer();

  try {
    const result = analyzer.analyzeWaves(workflowId);
    const output = analyzer.formatOutput(result, {
      visual: options.visual,
      json: options.json
    });
    console.log(output);
  } catch (error) {
    if (error.name === 'CircularDependencyError') {
      console.error('❌ Circular Dependency Detected!\n');
      console.error(`Cycle: ${error.cycle.join(' → ')}`);
      console.error(`\nSuggestion: ${error.getSuggestion()}`);
      process.exit(1);
    }
    throw error;
  }
}
```

## Performance

| Workflow Size | Analysis Time |
|--------------|---------------|
| Small (5 tasks) | <10ms |
| Medium (20 tasks) | <30ms |
| Large (50 tasks) | <50ms |

## Related Commands

- `*next` - Get next command suggestions (integrates wave context)
- `*workflow` - Show workflow status
- `*help` - Show all available commands

## Agent Integration

This task is available for:
- `@dev` - Developer Agent

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-25 | Initial implementation (WIS-4) |
