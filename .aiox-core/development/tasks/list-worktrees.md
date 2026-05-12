# list-worktrees

**Task ID:** list-worktrees
**Version:** 1.0
**Created:** 2026-01-28 (Story 1.3)
**Agent:** @devops (Gage)

---

## Execution Modes

**Single Mode:** YOLO (always autonomous, read-only operation)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: listWorktrees()
responsável: Gage (DevOps)
responsavel_type: Agente
atomic_layer: Atom

inputs:
  - campo: format
    tipo: enum
    origem: User Input
    obrigatório: false
    validação: 'table | json | minimal'
    default: table

  - campo: filter
    tipo: enum
    origem: User Input
    obrigatório: false
    validação: 'all | active | stale'
    default: all

outputs:
  - campo: worktrees
    tipo: WorktreeInfo[]
    destino: Return value
    persistido: false

  - campo: formatted_output
    tipo: string
    destino: Console
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Current directory is a git repository
    tipo: pre-condition
    blocker: true
    validação: git rev-parse --is-inside-work-tree
    error_message: "Not a git repository."

  - [ ] WorktreeManager is available
    tipo: pre-condition
    blocker: true
    validação: Script exists at .aiox-core/infrastructure/scripts/worktree-manager.js
    error_message: "WorktreeManager not found."
```

---

## Description

Lists all AIOX-managed worktrees with their current status, uncommitted changes, and age. Provides visibility into parallel development activities.

**Features:**

- Shows all active worktrees managed by AIOX
- Displays uncommitted changes count
- Highlights stale worktrees (> 30 days)
- Multiple output formats (table, json, minimal)

---

## Inputs

| Parameter | Type | Required | Default | Description                         |
| --------- | ---- | -------- | ------- | ----------------------------------- |
| `format`  | enum | No       | `table` | Output format: table, json, minimal |
| `filter`  | enum | No       | `all`   | Filter: all, active, stale          |

---

## Elicitation

```yaml
elicit: false
```

Read-only operation, runs autonomously.

---

## Steps

### Step 1: Validate Git Repository

**Action:** Verify current directory is a git repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

**Exit Condition:** If not a git repo:

```
❌ Not a git repository.
```

---

### Step 2: Load Worktrees

**Action:** Get all AIOX-managed worktrees

```javascript
const WorktreeManager = require('./.aiox-core/infrastructure/scripts/worktree-manager.js');
const manager = new WorktreeManager();
const worktrees = await manager.list();
```

---

### Step 3: Apply Filter

**Action:** Filter worktrees based on status

```javascript
let filtered = worktrees;
if (filter === 'active') {
  filtered = worktrees.filter((w) => w.status === 'active');
} else if (filter === 'stale') {
  filtered = worktrees.filter((w) => w.status === 'stale');
}
```

---

### Step 4: Format Output

**Action:** Format based on requested format

#### Table Format (default)

```javascript
const output = manager.formatList(filtered);
console.log(output);
```

**Example Output:**

```
📁 Active Worktrees (3/10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 STORY-42     │ auto-claude/STORY-42      │ 3 uncommitted   │ 2h ago
🟡 STORY-43     │ auto-claude/STORY-43      │ clean           │ 1d ago
⚫ STORY-40     │ auto-claude/STORY-40      │ clean           │ 35d ago (stale)
```

**Legend:**

- 🟢 Active with uncommitted changes
- 🟡 Active and clean
- ⚫ Stale (> 30 days old)

#### JSON Format

```javascript
console.log(JSON.stringify(filtered, null, 2));
```

**Example Output:**

```json
[
  {
    "storyId": "STORY-42",
    "path": "/abs/path/.aiox/worktrees/STORY-42",
    "branch": "auto-claude/STORY-42",
    "createdAt": "2026-01-28T10:00:00.000Z",
    "uncommittedChanges": 3,
    "status": "active"
  }
]
```

#### Minimal Format

```javascript
filtered.forEach((w) => console.log(w.storyId));
```

**Example Output:**

```
STORY-42
STORY-43
STORY-40
```

---

### Step 5: Display Summary

**Action:** Show summary counts (table format only)

```
───────────────────────────────────────────────────
Total: 3  │  Active: 2  │  Stale: 1  │  Limit: 10

💡 Run *cleanup-worktrees to remove stale worktrees
```

---

### Step 6: Handle Empty

**Action:** If no worktrees found

```
📁 No Active Worktrees

No AIOX-managed worktrees found.

Create one with:
  *create-worktree {storyId}

Example:
  *create-worktree STORY-42
```

---

## Outputs

### Return Value

```typescript
interface WorktreeInfo[] {
  storyId: string;
  path: string;
  branch: string;
  createdAt: Date;
  uncommittedChanges: number;
  status: 'active' | 'stale';
}
```

### Console Output

Formatted list based on `format` parameter.

---

## Validation

- [ ] Returns array (empty if no worktrees)
- [ ] Each worktree has valid storyId, path, branch
- [ ] Status correctly identifies stale worktrees (> 30 days)
- [ ] Uncommitted changes count is accurate

---

## Error Handling

### Not a Git Repository

**Error:**

```
❌ Not a git repository.
```

**Resolution:** Navigate to a git repository.

### WorktreeManager Not Found

**Error:**

```
❌ WorktreeManager not found.
   Ensure AIOX is properly installed.
```

**Resolution:** Check AIOX installation.

---

## Performance Notes

- **List time:** ~200-500ms (git worktree list + status checks)
- **No disk writes:** Read-only operation
- **Caching:** None (always fresh data)

---

## Dependencies

### Scripts

- `.aiox-core/infrastructure/scripts/worktree-manager.js`

### Git Commands Used

- `git worktree list --porcelain` - List all worktrees
- `git status --porcelain` - Check uncommitted changes per worktree

---

## Related

- **Story:** 1.3 - CLI Commands for Worktree Management
- **Tasks:** `create-worktree.md`, `remove-worktree.md`, `cleanup-worktrees.md`

---

## Command Registration

This task is exposed as CLI command `*list-worktrees` in @devops agent:

```yaml
commands:
  - 'list-worktrees': List all active worktrees with status
  - 'list-worktrees --json': Output as JSON
  - 'list-worktrees --stale': Show only stale worktrees
```

---

**Status:** ✅ Production Ready
**Tested On:** Windows, Linux, macOS
**Git Requirement:** git >= 2.5 (worktree support)
