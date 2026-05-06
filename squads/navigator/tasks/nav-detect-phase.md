---
task: Detect Current Phase (Internal)
responsavel: "@navigator"
responsavel_type: agent
atomic_layer: task
elicit: false
internal: true
Entrada: |
  - project_root: Path to project
  - pipeline_map: navigator-pipeline-map.yaml
Saida: |
  - current_phase: Phase object
  - completion_percentage: Number (0-100)
Checklist:
  - "[ ] Load pipeline map"
  - "[ ] For each phase, check output files exist"
  - "[ ] Parse story status from front-matter"
  - "[ ] Calculate completion based on outputs"
  - "[ ] Return most advanced phase"
veto_conditions:
  - "Pipeline map file missing → BLOCK (navigator-pipeline-map.yaml not found)"
  - "Pipeline map has invalid YAML syntax → BLOCK (run *navigator-doctor to fix)"
  - "Project root not an AIOS project (.aios-core/ missing) → BLOCK (run npx aios-core install)"
---

# nav-detect-phase (Internal)

Internal task used by other Navigator tasks to detect current phase.

## Usage

Called internally by:
- `*where-am-i`
- `*auto-navigate`
- `*update-roadmap`

## Algorithm

### Step 1: Load Pipeline Map

```javascript
const pipelineMap = yaml.load(
  fs.readFileSync('.aios-core/development/data/navigator-pipeline-map.yaml')
);
```

### Step 2: Check Outputs for Each Phase

```javascript
function checkPhaseOutputs(phase) {
  const outputs = phase.outputs.map(output => {
    const exists = glob.sync(output, { cwd: projectRoot }).length > 0;
    return { output, exists };
  });

  const allExist = outputs.every(o => o.exists);
  const someExist = outputs.some(o => o.exists);

  return {
    complete: allExist,
    partial: someExist && !allExist,
    percentage: (outputs.filter(o => o.exists).length / outputs.length) * 100
  };
}
```

### Step 3: Determine Current Phase

```javascript
function detectPhase(pipelineMap, projectRoot) {
  let currentPhase = pipelineMap.phases[0]; // Default to first

  for (const phase of pipelineMap.phases) {
    const status = checkPhaseOutputs(phase);

    if (status.complete) {
      // This phase is done, move to next
      currentPhase = pipelineMap.phases.find(p => p.id === phase.next_phase);
    } else if (status.partial) {
      // This phase is in progress
      currentPhase = phase;
      break;
    } else {
      // This phase hasn't started
      currentPhase = phase;
      break;
    }
  }

  return currentPhase;
}
```

### Step 4: Calculate Completion %

```javascript
function calculateCompletion(phase, projectRoot) {
  if (phase.outputs.includes('docs/stories/story-*.md')) {
    // Special case: count stories
    const allStories = glob.sync('docs/stories/story-*.md');
    const completedStories = allStories.filter(story => {
      const frontMatter = parseFrontMatter(story);
      return frontMatter.status === 'completed';
    });

    return (completedStories.length / allStories.length) * 100;
  }

  // Default: check if outputs exist
  return checkPhaseOutputs(phase).percentage;
}
```

## Implementation

```javascript
// .aios-core/development/scripts/navigator/phase-detector.js

const fs = require('fs');
const yaml = require('js-yaml');
const glob = require('glob');

function detectPhase(projectRoot, pipelineMap) {
  // 1. Load pipeline map if not provided
  if (!pipelineMap) {
    pipelineMap = yaml.load(
      fs.readFileSync('.aios-core/development/data/navigator-pipeline-map.yaml')
    );
  }

  // 2. Check each phase
  let currentPhase = pipelineMap.phases[0];
  let completion = 0;

  for (const phase of pipelineMap.phases) {
    const status = checkPhaseOutputs(phase, projectRoot);

    if (status.complete) {
      // Move to next
      const nextPhaseId = phase.next_phase;
      if (nextPhaseId) {
        currentPhase = pipelineMap.phases.find(p => p.id === nextPhaseId);
      }
    } else if (status.partial) {
      // In progress
      currentPhase = phase;
      completion = status.percentage;
      break;
    } else {
      // Not started
      currentPhase = phase;
      completion = 0;
      break;
    }
  }

  return {
    ...currentPhase,
    completion
  };
}

module.exports = { detectPhase, checkPhaseOutputs, calculateCompletion };
```

## Related

- **Script:** phase-detector.js
- **Data:** navigator-pipeline-map.yaml
- **Used by:** nav-where-am-i, nav-auto-navigate, nav-update-roadmap
