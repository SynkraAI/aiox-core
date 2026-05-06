---
task: Create Checkpoint
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - checkpoint_type: auto|manual
  - phase_id: Current phase ID
Saida: |
  - checkpoint_file: .aios/navigator/[project]/checkpoints/[date]-phase-[id].md
Checklist:
  - "[ ] Get current phase and status"
  - "[ ] Collect completed stories"
  - "[ ] Collect modified files (git log)"
  - "[ ] Generate checkpoint from template"
  - "[ ] Save to checkpoints/"
  - "[ ] Update roadmap with checkpoint reference"
veto_conditions:
  - "No roadmap exists for current project → BLOCK (run *map-project first)"
  - "No git repository detected → BLOCK (git init required for commit SHA tracking)"
  - "No .aios/navigator/{project}/ directory → BLOCK (project not mapped yet)"
---

# *checkpoint

Create checkpoint snapshot of current project state.

## Usage

```bash
@navigator
*checkpoint

# Auto-checkpoint (from hooks)
*checkpoint --auto
```

## Workflow

### Step 1: Collect State

```javascript
const state = {
  phase: await detectPhase(),
  completedStories: await getCompletedStories(),
  modifiedFiles: await getModifiedFiles(),
  gitLog: await getRecentCommits(10)
};
```

### Step 2: Generate Checkpoint

Use template `nav-checkpoint-tmpl.md`:

```javascript
const checkpoint = renderTemplate('nav-checkpoint-tmpl.md', {
  checkpoint_date: new Date().toISOString(),
  checkpoint_type: 'manual',
  phase_id: state.phase.id,
  phase_name: state.phase.name,
  completed_stories: state.completedStories,
  modified_files: state.modifiedFiles
});
```

### Step 3: Save Checkpoint

```javascript
const filename = `${dateString}-phase-${state.phase.id}.md`;
const checkpointPath = `.aios/navigator/${projectName}/checkpoints/${filename}`;
fs.writeFileSync(checkpointPath, checkpoint);
```

### Step 4: Update Roadmap

```javascript
await updateRoadmap({
  checkpoints: [
    ...existingCheckpoints,
    {
      date: dateString,
      phase: state.phase.id,
      description: `Phase ${state.phase.id} checkpoint`,
      path: checkpointPath
    }
  ]
});
```

## Output

```
📍 Checkpoint criado!

**Tipo:** Manual
**Fase:** 3 — Arquitetura
**Status:** 67% completo
**Stories concluídas:** 8
**Files modificados:** 23

**Salvo em:**
.aios/navigator/ecommerce-order-mgmt/checkpoints/2026-02-15-phase-3.md

Para restaurar:
@navigator
*load-checkpoint 2026-02-15-phase-3
```

## Implementation

```javascript
const { checkpointManager } = require('./scripts/navigator/checkpoint-manager');

async function createCheckpoint(type = 'manual') {
  // 1. Collect state
  const state = await collectCurrentState();

  // 2. Generate checkpoint
  const checkpoint = await checkpointManager.create({
    type,
    phase: state.phase,
    stories: state.completedStories,
    files: state.modifiedFiles,
    template: 'nav-checkpoint-tmpl.md'
  });

  // 3. Save
  const path = await checkpoint Manager.save(checkpoint);

  // 4. Update roadmap
  await updateRoadmapCheckpoints(checkpoint);

  return {
    checkpointId: checkpoint.id,
    path
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Template:** nav-checkpoint-tmpl.md
- **Script:** checkpoint-manager.js
