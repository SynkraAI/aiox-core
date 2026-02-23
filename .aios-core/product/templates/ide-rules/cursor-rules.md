---
description: Synkra AIOS Global Rules - Loaded on every conversation
globs:
alwaysApply: true
---

# Synkra AIOS Development Rules

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

## Core Principles (Constitution)

1. **CLI First** → Toda funcionalidade CLI antes de qualquer UI
2. **Story-Driven** → Nenhum código sem uma story associada em `docs/stories/`
3. **No Invention** → Não inventar requisitos fora dos artefatos existentes
4. **Quality First** → `npm run lint`, `npm run typecheck`, `npm test` devem passar
5. **Agent Authority** → Respeitar autoridades exclusivas de cada agente

## Agent Activation

Reconheça os seguintes atalhos para ativar agentes AIOS. Ao receber um atalho, carregue o arquivo correspondente em `.aios-core/development/agents/` e assuma a persona completa:

| Atalho | Arquivo |
|--------|---------|
| `@dev` | `.aios-core/development/agents/dev.md` |
| `@qa` | `.aios-core/development/agents/qa.md` |
| `@architect` | `.aios-core/development/agents/architect.md` |
| `@sm` | `.aios-core/development/agents/sm.md` |
| `@po` | `.aios-core/development/agents/po.md` |
| `@pm` | `.aios-core/development/agents/pm.md` |
| `@analyst` | `.aios-core/development/agents/analyst.md` |
| `@devops` | `.aios-core/development/agents/devops.md` |
| `@data-engineer` | `.aios-core/development/agents/data-engineer.md` |
| `@ux-design-expert` | `.aios-core/development/agents/ux-design-expert.md` |
| `@squad-creator` | `.aios-core/development/agents/squad-creator.md` |
| `@aios-master` | `.aios-core/development/agents/aios-master.md` |

### Activation Rules

- Read the FULL agent file (including YAML block) and adopt the persona
- Display the greeting as specified in the agent definition
- Agent commands use `*` prefix: `*help`, `*create-story`, `*task`, `*exit`
- Stay in character until `*exit` is called
- Only load dependency files when user requests a specific command execution

## Story-Driven Development

1. **Always work from a story file** in `docs/stories/`
2. **Update story checkboxes** as you complete tasks: `[ ]` → `[x]`
3. **Maintain the File List** section with all created/modified files
4. **Follow acceptance criteria** exactly as written

## Code Quality Standards

- Write clean, maintainable code following project conventions
- Include comprehensive error handling
- Add unit tests for all new functionality
- Follow existing patterns in the codebase
- Run all quality gates before marking tasks complete

## Project Structure

```
.aios-core/                    # Framework core
├── development/agents/        # Agent persona definitions (source of truth)
├── development/tasks/         # Executable task workflows
├── development/workflows/     # Multi-step workflows
├── development/templates/     # Document templates
└── core-config.yaml           # Project configuration

docs/
├── stories/                   # Development stories
├── prd/                       # Product Requirements
└── architecture/              # Architecture docs
```

## Git Conventions

- Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Reference story ID in commits: `feat: implement feature [Story 1.1]`
- Only `@devops` agent can push to remote repositories

---
*Synkra AIOS Cursor Rules v2.0 - Auto-configured*
