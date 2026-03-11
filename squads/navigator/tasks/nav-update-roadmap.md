---
task: Update Roadmap
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - trigger_type: manual|auto|hook
  - changed_files: List of changed files
Saida: |
  - updated_roadmap: Updated markdown
  - sync_status: boolean
Checklist:
  - "[ ] Detect changes in docs/stories/"
  - "[ ] Re-calculate phase status"
  - "[ ] Update metrics (velocity, commits)"
  - "[ ] Update Context Anchors"
  - "[ ] Sync central ↔ local"
  - "[ ] Create checkpoint if phase changed"
veto_conditions:
  - "No roadmap exists to update → BLOCK (run *map-project first to create roadmap)"
  - "Central and local roadmaps have unresolved sync conflict → BLOCK (resolve conflict manually first)"
  - "Pipeline map missing or invalid → BLOCK (run *navigator-doctor to fix)"
---

# *update-roadmap

Update roadmap manually or auto-triggered by git hook.

## Usage

```bash
@navigator
*update-roadmap

# Auto (from git hook)
*update-roadmap --auto

# With specific files
*update-roadmap --files story-2.3.md,story-2.4.md
```

## Workflow

### Step 1: Detect Changes

```javascript
const changedFiles = trigger === 'hook'
  ? parseGitDiff()
  : await detectStoryChanges();
```

### Step 2: Re-calculate Phase Status

```javascript
const { phaseDetector } = require('./scripts/navigator/phase-detector');
const newPhase = await phaseDetector.detectPhase(projectRoot);

const phaseChanged = newPhase.id !== currentPhase.id;
```

### Step 3: Update Metrics

```javascript
const metrics = {
  totalStories: await countAllStories(),
  completedStories: await countCompletedStories(),
  totalCommits: await getCommitCount(),
  lastCommit: await getLastCommitInfo(),
  velocity: await calculateVelocity()
};
```

### Step 4: Update Context Anchors

```javascript
const recentFiles = await getRecentlyModifiedFiles(10);
const contextAnchors = {
  main_docs: await getMainDocuments(),
  recent_files: recentFiles
};
```

### Step 5: Sync Roadmaps

```javascript
const { syncRoadmap } = require('./scripts/navigator/roadmap-sync');
await syncRoadmap(projectName);
```

### Step 6: Create Checkpoint if Phase Changed

```javascript
if (phaseChanged) {
  await createCheckpoint({
    type: 'auto',
    phase: newPhase.id,
    description: `Transitioned to phase ${newPhase.id}`
  });
}
```

## Output

```
✅ Roadmap atualizado!

**Changes detected:**
- story-2.3.md: status updated to 'completed'
- story-2.4.md: modified

**Phase status:**
- Current: 3 — Arquitetura (75% → 83%)
- Phase transition: No

**Metrics updated:**
- Stories: 10/12 (83%)
- Commits: +3 (total: 50)
- Velocity: 2.7 stories/week (↑)

**Sync status:** ✓ Central ↔ Local synchronized

Use *show-roadmap to see updated roadmap.
```

## Implementation

```javascript
async function updateRoadmap(trigger = 'manual', options = {}) {
  // 1. Detect changes
  const changes = await detectChanges(trigger, options);

  // 2. Re-calculate phase
  const newPhase = await detectPhase();
  const phaseChanged = newPhase.id !== currentPhase.id;

  // 3. Update metrics
  const metrics = await updateMetrics();

  // 4. Update context
  const context = await updateContextAnchors();

  // 5. Render updated roadmap
  const roadmap = await renderTemplate('nav-roadmap-tmpl.md', {
    ...currentRoadmap,
    last_updated: new Date().toISOString(),
    current_phase: newPhase,
    metrics,
    context
  });

  // 6. Sync
  await syncRoadmap(projectName);

  // 7. Checkpoint if needed
  if (phaseChanged) {
    await createCheckpoint({ type: 'auto', phase: newPhase.id });
  }

  return {
    phaseChanged,
    metrics
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Script:** roadmap-sync.js, phase-detector.js
- **Hook:** .husky/post-commit
