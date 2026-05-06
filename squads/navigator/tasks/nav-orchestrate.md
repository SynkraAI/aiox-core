---
task: Multi-Chat Orchestration
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - epic_id: ID of epic to orchestrate
  - stories_in_epic: Auto-loaded from epic file
Saida: |
  - orchestration_plan: Markdown file
  - chat_prompts: Ready-to-copy prompts
Checklist:
  - "[ ] Load epic and stories"
  - "[ ] Analyze story dependencies"
  - "[ ] Determine waves (parallel groups)"
  - "[ ] Generate coordinator prompt (@sm)"
  - "[ ] Generate dev prompts (wave 1, 2, 3)"
  - "[ ] Use orchestration template"
  - "[ ] Display ready-to-copy prompts"
veto_conditions:
  - "Epic file does not exist at specified path → BLOCK (provide valid epic file)"
  - "Epic has fewer than 3 stories → BLOCK (orchestration overkill, use sequential execution)"
  - "Stories have no dependency metadata → WARN (waves cannot be optimized, all stories in single wave)"
  - "No roadmap exists → BLOCK (run *map-project first to establish project context)"
---

# *orchestrate

Generate multi-chat orchestration prompts for complex epics.

## Usage

```bash
@navigator
*orchestrate epic-1
```

## Workflow

### Step 1: Load Epic

```javascript
const epicPath = `docs/stories/${epicId}.md`;
const epic = await parseEpic(epicPath);
const stories = await loadStoriesForEpic(epicId);
```

### Step 2: Analyze Dependencies

```javascript
const dependencyGraph = buildDependencyGraph(stories);
const waves = assignToWaves(stories, dependencyGraph);
```

Example:
```
Wave 1: story-1.1, story-1.2 (no dependencies)
Wave 2: story-1.3, story-1.4 (depend on Wave 1)
Wave 3: story-1.5 (depends on Wave 2)
```

### Step 3: Generate Coordinator Prompt

Use template `nav-orchestration-tmpl.md`:

```javascript
const coordinatorPrompt = renderTemplate('nav-orchestration-tmpl.md', {
  epic_id: epic.id,
  epic_name: epic.title,
  stories: stories,
  waves: waves
});
```

### Step 4: Generate Dev Prompts

```javascript
const devPrompts = waves.map((wave, i) =>
  renderDevPrompt(wave, i+1)
);
```

### Step 5: Display Output

```
🎬 Multi-Chat Orchestration Ready!

**Epic:** epic-1 — E-commerce Core Features
**Stories:** 6
**Waves:** 3
**Estimated duration:** 2-3 days

📋 COPY THE PROMPTS BELOW TO SEPARATE CLAUDE CODE CHATS:

═══════════════════════════════════════════════════════
CHAT 1: Coordenador (@sm)
═══════════════════════════════════════════════════════

@sm

Você é o coordenador deste epic multi-chat...

[... full prompt ...]

═══════════════════════════════════════════════════════
CHAT 2: Dev Wave 1
═══════════════════════════════════════════════════════

@dev

Você faz parte de uma execução multi-chat...

[... full prompt ...]

═══════════════════════════════════════════════════════

Continue for CHAT 3 and CHAT 4...
```

## Implementation

```javascript
async function orchestrate(epicId) {
  // 1. Load epic
  const epic = await loadEpic(epicId);
  const stories = await loadStoriesForEpic(epicId);

  // 2. Analyze dependencies
  const dependencyGraph = analyzeDependencies(stories);
  const waves = assignToWaves(stories, dependencyGraph);

  // 3. Generate prompts
  const prompts = await generateOrchestrationPrompts({
    epic,
    stories,
    waves,
    template: 'nav-orchestration-tmpl.md'
  });

  // 4. Display
  displayOrchestrationPlan(prompts);

  // 5. Save plan
  const planPath = `.aios/navigator/${projectName}/orchestration-${epicId}.md`;
  await savePlan(planPath, prompts);

  return {
    epicId,
    wavesCount: waves.length,
    planPath
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Template:** nav-orchestration-tmpl.md
- **Script:** orchestrator.js
