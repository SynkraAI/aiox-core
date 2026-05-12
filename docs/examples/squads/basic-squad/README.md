# Basic Squad Example

A minimal squad demonstrating the essential structure required for AIOX squads.

## Structure

```
basic-squad/
├── squad.yaml          # Squad manifest
├── README.md           # This file
├── agents/
│   └── greeter-agent.md
└── tasks/
    └── greet-user.md
```

## Usage

```bash
# Load this squad
@squad-creator
*load-squad ./docs/examples/squads/basic-squad

# Activate the agent
@basic-greeter

# Run the greeting task
*greet "World"
```

## What This Demonstrates

1. **Minimal manifest** - Only required fields
2. **Single agent** - One focused persona
3. **Single task** - One executable workflow
4. **Task-first architecture** - Task is the entry point

## Extending This Example

To add more functionality:

1. Add more tasks in `tasks/`
2. Add workflows for multi-step processes
3. Add tools for custom integrations

See [Squad Development Guide](../../../guides/squads-guide.md) for details.
