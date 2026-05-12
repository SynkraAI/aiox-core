# {{COMPONENTNAME}}

> Agent definition for {{SQUADNAME}} squad
> Created: {{CREATEDAT}}
{{#IF STORYID}}
> Story: {{STORYID}}
{{/IF}}

## Description

{{DESCRIPTION}}

## Configuration

```yaml
agent:
  name: {{COMPONENTNAME}}
  id: {{COMPONENTNAME}}
  title: "{{COMPONENTNAME}} Agent"
  icon: "{{ICON}}"
  whenToUse: "Use this agent when {{USECASE}}"

persona:
  role: "Describe the agent's primary role and responsibilities"
  style: "Communication style (e.g., systematic, empathetic, analytical)"
  identity: "What makes this agent unique"
  focus: "Primary focus areas"

core_principles:
  - "Principle 1: Define the first guiding principle"
  - "Principle 2: Define the second guiding principle"
  - "Principle 3: Define the third guiding principle"

commands:
  - name: help
    visibility: [full, quick, key]
    description: "Show all available commands"
  - name: command-1
    visibility: [full, quick]
    description: "Description of command 1"
  - name: exit
    visibility: [full, quick, key]
    description: "Exit agent mode"

dependencies:
  tasks: []
  templates: []
  checklists: []
  tools: []
```

## Commands

| Command | Description |
|---------|-------------|
| `*help` | Show available commands |
| `*exit` | Exit agent mode |

## Collaboration

**Works with:**
- List other agents this agent collaborates with

**Handoff points:**
- When to hand off to other agents

{{#IF CODE_INTEL_AVAILABLE}}
## Code Intelligence Context

> Auto-populated when code intelligence provider is available.
> This section can be safely removed if not needed.

- **Project Structure:** {{PROJECT_STRUCTURE}}
- **Conventions:** {{CONVENTIONS}}
- **Related Entities:** {{RELATED_ENTITIES}}
{{/IF}}

---

*Agent created by squad-creator*
