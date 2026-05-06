---
task: Detect Current Phase
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - project_context: Auto-detected from current directory
  - stories_status: Parsed from docs/stories/
  - git_status: Current git status
Saida: |
  - current_phase: Phase ID and name
  - progress_percentage: Completion %
  - next_steps: List of recommended actions
  - blockers: List of blockers (if any)
Checklist:
  - "[ ] Load project roadmap"
  - "[ ] Scan docs/stories/ for completed stories"
  - "[ ] Parse story front-matter YAML"
  - "[ ] Calculate phase completion %"
  - "[ ] Detect current phase from outputs"
  - "[ ] Identify blockers (missing inputs)"
  - "[ ] Suggest next agent/command"
  - "[ ] Display formatted status"
veto_conditions:
  - "No roadmap exists for current project → BLOCK (run *map-project first)"
  - "Pipeline map missing or invalid → BLOCK (run *navigator-doctor to fix)"
  - "No docs/stories/ directory found → WARN (phase detection will rely on output files only)"
---

# *where-am-i

Detect current project phase and show next steps.

## Usage

```bash
@navigator
*where-am-i
```

## Workflow

### Step 1: Load Roadmap

```javascript
const roadmapPath = findRoadmap(); // Central or local
const roadmap = await parseRoadmap(roadmapPath);
```

### Step 2: Scan Stories

```bash
# Find all stories
find docs/stories -name "story-*.md"

# Parse front-matter YAML
---
id: story-2.3
epic: epic-2
status: completed
---
```

### Step 3: Calculate Progress

```javascript
const completedStories = stories.filter(s => s.status === 'completed');
const totalStories = stories.length;
const progress = (completedStories.length / totalStories) * 100;
```

### Step 4: Detect Phase

```javascript
const { detectPhase } = require('.aios-core/development/scripts/navigator/phase-detector');
const currentPhase = await detectPhase(projectRoot, pipelineMap);
```

### Step 5: Identify Blockers

```javascript
// Check if phase inputs exist
const missingInputs = phase.inputs.filter(input => !fs.existsSync(input));
const blockers = missingInputs.map(input => ({
  type: 'missing_input',
  description: `Missing required file: ${input}`
}));
```

### Step 6: Display Status

```
🧭 Navigator — Where Am I?

**Projeto:** E-commerce Order Management
**Fase Atual:** 3 — Arquitetura (🔄 Em Progresso)
**Progresso:** 67% completo (8/12 stories)

✅ **Fases Concluídas:**
- [x] 1. Pesquisa
- [x] 2. PRD

🔄 **Fase Atual:**
- [ ] 3. Arquitetura (67%)
  - Epic: docs/stories/epic-1.md
  - Stories ativas: story-1.1.md, story-1.2.md
  - Última atualização: 3 horas atrás

⏳ **Próximas Fases:**
- [ ] 4. Épicos
- [ ] 5. Stories
- [ ] 6-10. ...

📍 **Próximo Passo:**
Agente: @architect
Comando: *create-full-stack-architecture

🚨 **Blockers:**
Nenhum blocker ativo.

💡 **Sugestão:**
Use *auto-navigate para continuar automaticamente.
```

## Implementation

```javascript
async function whereAmI() {
  const projectRoot = process.cwd();

  // Load roadmap
  const roadmap = await loadRoadmap(projectRoot);

  // Detect phase
  const phaseDetector = require('./scripts/navigator/phase-detector');
  const currentPhase = await phaseDetector.detectPhase(projectRoot);

  // Calculate progress
  const stories = await scanStories(`${projectRoot}/docs/stories`);
  const progress = calculateProgress(stories, currentPhase);

  // Identify blockers
  const blockers = await identifyBlockers(currentPhase);

  // Format output
  return formatStatus({
    project: roadmap.name,
    currentPhase,
    progress,
    blockers,
    nextStep: getNextStep(currentPhase)
  });
}
```

## Related

- **Agent:** @navigator (Vega)
- **Script:** phase-detector.js
- **Command:** *auto-navigate (to continue)
