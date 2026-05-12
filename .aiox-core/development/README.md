# Development Module

The Development module contains all agent-related assets: agent definitions, team configurations, tasks, workflows, and supporting scripts.

## Structure

```
development/
├── agents/           # 11 agent persona definitions
├── agent-teams/      # 5 team configurations
├── tasks/            # 115+ task definitions
├── workflows/        # 7 workflow definitions
└── scripts/          # 24 supporting scripts
```

## Agents (11 files)

| Agent | ID | Description |
|-------|-----|------------|
| AIOX Master | `aiox-master` | Framework orchestrator |
| Analyst | `analyst` | Business analyst |
| Architect | `architect` | Technical architect |
| Data Engineer | `data-engineer` | Data engineering |
| Developer | `dev` | Full-stack developer |
| DevOps | `devops` | DevOps engineer |
| Product Manager | `pm` | Product manager |
| Product Owner | `po` | Product owner |
| QA | `qa` | Quality assurance |
| Scrum Master | `sm` | Scrum master |
| UX Expert | `ux-design-expert` | UX designer |

### Activation

Agents are activated via IDE commands (`@agent-name`) or by loading the Markdown definition file.

```javascript
const { AgentConfigLoader } = require('./scripts/agent-config-loader');
const loader = new AgentConfigLoader('dev');
const config = await loader.loadAgent('dev');
```

## Agent Teams (5 files)

Pre-configured agent team compositions:

| Team | Agents | Use Case |
|------|--------|----------|
| `team-all` | All 11 agents | Full development team |
| `team-fullstack` | dev, qa, architect, devops | Full-stack projects |
| `team-ide-minimal` | dev, qa | Minimal IDE setup |
| `team-no-ui` | dev, architect, devops, data-engineer | Backend/API projects |
| `team-qa-focused` | qa, dev, architect | Quality-focused work |

## Tasks (115+ files)

Task definitions for agent workflows. Each task is a Markdown file with YAML frontmatter defining execution parameters.

### Categories

- **Story Management:** create-story, validate-story, sync-story
- **Code Operations:** review-code, generate-tests, refactor
- **Documentation:** create-doc, update-readme, document-api
- **Process:** execute-checklist, correct-course, handoff

### Example Usage

```javascript
const fs = require('fs');
const task = fs.readFileSync('./tasks/create-story.md', 'utf-8');
// Parse and execute task workflow
```

## Workflows (7 files)

Multi-step development workflows:

| Workflow | Description |
|----------|-------------|
| `greenfield-fullstack.yaml` | New full-stack project |
| `greenfield-service.yaml` | New backend service |
| `greenfield-ui.yaml` | New frontend project |
| `brownfield-fullstack.yaml` | Existing full-stack enhancement |
| `brownfield-service.yaml` | Existing backend enhancement |
| `brownfield-ui.yaml` | Existing frontend enhancement |

## Scripts (24 files)

Supporting JavaScript modules:

| Script | Purpose |
|--------|---------|
| `agent-config-loader.js` | Load and parse agent definitions |
| `greeting-builder.js` | Build contextual agent greetings |
| `story-manager.js` | Manage story files and updates |
| `decision-recorder.js` | Record agent decisions |
| `workflow-navigator.js` | Navigate between workflow steps |
| `task-identifier-resolver.js` | Resolve task references |

### Key APIs

```javascript
// Greeting Builder
const GreetingBuilder = require('./scripts/greeting-builder');
const builder = new GreetingBuilder();
const greeting = await builder.buildGreeting(agentDef, context);

// Story Manager
const StoryManager = require('./scripts/story-manager');
const story = await StoryManager.loadStory(storyId);
await story.updateTask(taskId, { status: 'completed' });
```

## Dependencies

This module depends on:
- `../core/` - Configuration, session management, elicitation
- `../scripts/` - Infrastructure utilities (git, PM tools)

## Migration Notes

This module was created as part of ADR-002 modular architecture migration. Previously, these files were scattered across multiple directories.

**Reference:** [ADR-002-migration-map.md](../../docs/architecture/decisions/ADR-002-migration-map.md)

## Testing

Run development module tests:

```bash
npm test -- --grep "DEVELOPMENT"
```

Smoke tests:
- DEV-01: Agent Load
- DEV-02: Agent Config Parse
- DEV-03: Greeting Build
- DEV-04: Task Load
- DEV-05: Workflow Load
- DEV-06: Team Config
- DEV-07: Story Management
- DEV-08: Decision Log
- DEV-09: Agent Exit Hooks
