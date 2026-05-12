# Learned Patterns Management

## Purpose

View, manage, and review learned workflow patterns captured by the Workflow Intelligence System (WIS). Patterns are learned from successful workflow executions and boost suggestion confidence.

## Task Definition (AIOX Task Format V1.0)

```yaml
task: patterns()
agent: "@dev"
responsável: Dex (Developer)
responsavel_type: Agente
atomic_layer: Workflow

elicit: false

inputs:
  - name: subcommand
    type: enum
    required: false
    default: list
    options: [list, stats, prune, review]
    description: Action to perform

  - name: status
    type: enum
    required: false
    options: [pending, active, promoted, deprecated]
    description: Filter patterns by status

  - name: limit
    type: number
    required: false
    default: 10
    description: Maximum patterns to display

  - name: help
    type: flag
    required: false
    default: false
    description: Show usage documentation

outputs:
  - name: patterns
    type: array
    destino: Console
    persistido: false

  - name: stats
    type: object
    destino: Console
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Learning module is available
    tipo: pre-condition
    blocker: true
    validação: Check workflow-intelligence/learning module loads
    error_message: "Pattern learning module not available."

  - [ ] Pattern storage exists
    tipo: pre-condition
    blocker: false
    validação: Check .aiox-core/data/learned-patterns.yaml exists
    error_message: "No patterns stored yet."
```

---

## Implementation Steps

### Step 1: Check Help Flag
```javascript
if (args.help) {
  displayHelp();
  return;
}
```

### Step 2: Load Learning Module
```javascript
const learning = require('.aiox-core/workflow-intelligence/learning');
const store = learning.getDefaultStore();
```

### Step 3: Execute Subcommand

#### List Patterns
```javascript
if (args.subcommand === 'list' || !args.subcommand) {
  const data = store.load();
  let patterns = data.patterns;

  // Filter by status if provided
  if (args.status) {
    patterns = patterns.filter(p => p.status === args.status);
  }

  // Sort by occurrences (descending)
  patterns.sort((a, b) => (b.occurrences || 1) - (a.occurrences || 1));

  // Limit results
  patterns = patterns.slice(0, args.limit || 10);

  displayPatternList(patterns);
}
```

#### Show Stats
```javascript
if (args.subcommand === 'stats') {
  const stats = store.getStats();
  displayStats(stats);
}
```

#### Prune Patterns
```javascript
if (args.subcommand === 'prune') {
  const result = store.prune();
  console.log(`✓ Pruned ${result.pruned} patterns. ${result.remaining} remaining.`);
}
```

#### Review Patterns
```javascript
if (args.subcommand === 'review') {
  const pendingPatterns = store.getByStatus('pending');

  if (pendingPatterns.length === 0) {
    console.log('No patterns pending review.');
    return;
  }

  // Interactive review (uses elicitation)
  for (const pattern of pendingPatterns) {
    const action = await promptReviewAction(pattern);
    if (action === 'quit') break;

    store.updateStatus(pattern.id, action === 'promote' ? 'active' : action);
    console.log(`✓ Pattern ${action}d.`);
  }
}
```

---

## Help Text

```text
Usage: *patterns [subcommand] [options]

Manage learned workflow patterns.

Subcommands:
  list     List all learned patterns (default)
  stats    Show pattern statistics
  prune    Remove stale/low-value patterns
  review   Interactive review of pending patterns

Options:
  --status <status>  Filter by status (pending, active, promoted, deprecated)
  --limit <n>        Limit results (default: 10)
  --help             Show this help message

Examples:
  *patterns                          # List top 10 patterns
  *patterns list --status active     # List active patterns only
  *patterns stats                    # Show statistics
  *patterns prune                    # Remove stale patterns
  *patterns review                   # Review pending patterns

Pattern Lifecycle:
  1. pending  - Newly captured, awaiting review
  2. active   - Validated, used in suggestions
  3. promoted - High-value, prioritized in suggestions
  4. deprecated - Marked for removal
```

---

## Output Formats

### List Output
```text
Learned Patterns (15 total)
═══════════════════════════

Top Patterns by Occurrence:
1. validate-story-draft → develop → review-qa
   Occurrences: 12 | Success: 95% | Status: promoted
   Workflow: story_development | Last seen: 2h ago

2. develop → review-qa → apply-qa-fixes
   Occurrences: 8 | Success: 88% | Status: active
   Workflow: story_development | Last seen: 1d ago

3. create-story → validate-story-draft → develop
   Occurrences: 6 | Success: 100% | Status: active
   Workflow: story_creation | Last seen: 3d ago

Showing 3 of 15 patterns. Use --limit to see more.
```

### Stats Output
```text
Pattern Learning Statistics
═══════════════════════════

Storage:
  Total patterns: 15
  Max patterns: 100
  Utilization: 15%

By Status:
  Pending: 3
  Active: 9
  Promoted: 2
  Deprecated: 1

Quality:
  Avg success rate: 92%
  Total occurrences: 45

Storage file: .aiox-core/data/learned-patterns.yaml
Last updated: 2025-12-26T10:30:00Z
```

### Review Output
```text
*patterns review

Patterns Pending Review (3)
═══════════════════════════

Pattern #1: develop → run-tests → review-qa
Occurrences: 4 | Success Rate: 100% | First Seen: 2 days ago
[P]romote  [S]kip  [D]eprecate  [Q]uit

> p

✓ Pattern promoted to active status

Pattern #2: create-story → develop
Occurrences: 2 | Success Rate: 50% | First Seen: 5 days ago
[P]romote  [S]kip  [D]eprecate  [Q]uit

> d

✓ Pattern deprecated

Review complete. 1 promoted, 0 skipped, 1 deprecated.
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Output displayed correctly
    tipo: post-condition
    blocker: false
    validação: Verify console output matches expected format

  - [ ] Storage updated for prune/review
    tipo: post-condition
    blocker: true
    validação: Check learned-patterns.yaml was modified
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Learning module not found | Missing dependency | Show error message |
| Storage file corrupt | Invalid YAML | Reset to empty, show warning |
| No patterns found | Empty storage | Show "no patterns" message |
| Review cancelled | User quit | Save any changes made |

**Error Recovery Strategy:**
```javascript
try {
  const stats = store.getStats();
  displayStats(stats);
} catch (error) {
  console.error(`⚠️ Error reading patterns: ${error.message}`);
  console.log('Try running: rm .aiox-core/data/learned-patterns.yaml');
}
```

---

## Performance

```yaml
duration_expected: <50ms
cost_estimated: $0.00 (local file only)
token_usage: 0

optimizations:
  - Cached pattern loading (5s TTL)
  - Lazy parsing of YAML
  - Streamed display for large lists
```

---

## Metadata

```yaml
story: WIS-5
version: 1.0.0
created: 2025-12-26
author: "@dev (Dex)"
dependencies:
  modules:
    - workflow-intelligence/learning
  tasks: []
tags:
  - workflow-intelligence
  - patterns
  - learning
  - management
```
