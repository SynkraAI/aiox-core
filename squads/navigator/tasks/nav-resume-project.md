---
task: Resume Existing Project
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - project_name: Name of project to resume (optional)
Saida: |
  - loaded_roadmap: Roadmap object
  - session_context: Full context
  - next_action: Suggested command
Checklist:
  - "[ ] List available projects (.aios/navigator/)"
  - "[ ] Load selected project roadmap"
  - "[ ] Run nav-where-am-i internally"
  - "[ ] Display project status"
  - "[ ] Offer quick actions (continue/review/restart)"
veto_conditions:
  - "No projects found in .aios/navigator/ → BLOCK (no mapped projects to resume, use *map-project)"
  - "Selected project roadmap is corrupted/unreadable → BLOCK (suggest *navigator-doctor)"
  - "Selected project has no checkpoints and no stories → WARN (limited context available for resume)"
---

# *resume-project

Resume existing project with full context restoration.

## Usage

```bash
@navigator
*resume-project

# Or specify project name
*resume-project ecommerce-order-mgmt
```

## Workflow

### Step 1: List Projects

```javascript
const projects = fs.readdirSync('.aios/navigator/');

console.log('Available projects:');
projects.forEach((project, i) => {
  const roadmap = loadRoadmap(project);
  console.log(`${i+1}. ${project} (${roadmap.status})`);
});
```

Output:
```
Available projects:
1. ecommerce-order-mgmt (Em Progresso)
2. aios-core (Em Progresso)
3. dashboard (Concluído)

Which project to resume? [1-3]
>
```

### Step 2: Load Roadmap

```javascript
const projectName = projects[selectedIndex];
const roadmapPath = `.aios/navigator/${projectName}/roadmap.md`;
const roadmap = await parseRoadmap(roadmapPath);
```

### Step 3: Run Where Am I

```javascript
const status = await whereAmI(projectName);
```

### Step 4: Display Context

```
🧭 Resuming: E-commerce Order Management

**Status:** Em Progresso
**Última atividade:** 3 horas atrás
**Fase atual:** 3 — Arquitetura (67%)

**Última story:** story-1.2.md
**Último commit:** feat: add product schema

**Checkpoints disponíveis:**
- 2026-02-14: Fase 2 concluída (PRD)
- 2026-02-15: Fase 3 em progresso

**Quick Actions:**
1. Continue — *auto-navigate
2. Review roadmap — *show-roadmap
3. Create checkpoint — *checkpoint
4. Status report — *status-report

What would you like to do? [1-4]
>
```

### Step 5: Execute Action

```javascript
const actions = {
  1: 'auto-navigate',
  2: 'show-roadmap',
  3: 'checkpoint',
  4: 'status-report'
};

const selectedAction = actions[userChoice];
await executeCommand(selectedAction);
```

## Implementation

```javascript
async function resumeProject(projectName) {
  // List projects if not specified
  if (!projectName) {
    const projects = await listProjects();
    projectName = await selectProject(projects);
  }

  // Load roadmap
  const roadmap = await loadRoadmap(projectName);

  // Get current status
  const status = await whereAmI(projectName);

  // Load recent activity
  const recentActivity = await getRecentActivity(projectName);

  // Display context
  displayResumeContext({
    roadmap,
    status,
    recentActivity
  });

  // Offer quick actions
  const action = await promptQuickActions();
  await executeAction(action, projectName);

  return {
    projectName,
    roadmap,
    status
  };
}
```

## Related

- **Agent:** @navigator (Vega)
- **Task:** nav-where-am-i.md
- **Command:** *auto-navigate
