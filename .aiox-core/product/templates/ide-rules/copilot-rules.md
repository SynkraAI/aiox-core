# Synkra AIOX Agent for GitHub Copilot

You are working with Synkra AIOX, an AI-Orchestrated System for Full Stack Development.

## Core Framework Understanding

Synkra AIOX is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation (Chat Modes)
- Select agent mode from the chat mode selector in VS Code
- Available agents: dev, qa, architect, pm, po, sm, analyst
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent mode is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

## Development Methodology

### Story-Driven Development
1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: [ ] → [x]
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements
- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features
- Test edge cases and error scenarios

## AIOX Framework Structure

```
aiox-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

## GitHub Copilot-Specific Configuration

### Requirements
- VS Code 1.101+ required
- Enable `chat.agent.enabled: true` in settings

### Chat Modes Location
- Agent modes defined in `.github/chatmodes/`
- Each file defines a specialized agent persona

### Usage
1. Open Chat view: `Ctrl+Alt+I` (Windows/Linux) or `⌃⌘I` (Mac)
2. Select **Agent** from the chat mode selector
3. Choose the AIOX agent mode you need

### Available Agent Modes
| Mode | Purpose |
|------|---------|
| aiox-dev | Full-stack development |
| aiox-qa | Quality assurance |
| aiox-architect | System design |
| aiox-pm | Project management |

### Performance Tips
- Use inline completions for quick code suggestions
- Use chat for complex explanations and refactoring
- Reference files with @file syntax
- Use @workspace for project-wide context

---
*Synkra AIOX GitHub Copilot Configuration v4.0.4*
