# SYNAPSE Domains Reference

## What is a Domain?

A domain is a text file containing KEY=VALUE rules that SYNAPSE injects into prompts. Each domain maps to a specific layer (L0-L7) and is registered in the manifest file (`.synapse/manifest`).

Domains live in `.synapse/` and use a simple KEY=VALUE format with comments.

## Domain Types by Layer

| Layer | Type | Trigger | Example Files |
|-------|------|---------|---------------|
| L0 | Constitution | Always active (`ALWAYS_ON=true`, `NON_NEGOTIABLE=true`) | `constitution` |
| L1 | Global | Always active (`ALWAYS_ON=true`) | `global`, `context` |
| L2 | Agent-scoped | Active agent matches `AGENT_TRIGGER` | `agent-dev`, `agent-qa`, `agent-architect` |
| L3 | Workflow-scoped | Active workflow matches `WORKFLOW_TRIGGER` | `workflow-story-dev`, `workflow-epic-create` |
| L4 | Task context | Active task detected in session | (injected dynamically) |
| L5 | Squad discovery | Squad is active in session | (squad domains) |
| L6 | Keyword (RECALL) | User prompt contains keyword from `RECALL` field | (keyword-triggered domains) |
| L7 | Star-commands | User types `*command` in prompt | `commands` |

## KEY=VALUE Format

### Syntax Rules

```
# Comments start with #
# Empty lines are ignored

# Keys use SCREAMING_SNAKE_CASE with domain prefix
DOMAINPREFIX_RULE_0=First rule text
DOMAINPREFIX_RULE_1=Second rule text

# Grouped comments describe rule sections
# [section-name] COMMAND:
#   0. First behavior
#   1. Second behavior
```

### Key Naming Convention

```
{DOMAIN_KEY}_RULE_{INDEX}={RULE_TEXT}
```

- `DOMAIN_KEY`: Unique prefix matching manifest registration (e.g., `CONSTITUTION`, `GLOBAL`, `AGENT_DEV`)
- `RULE`: Literal word `RULE` (or `STATE`, `ALWAYS_ON`, etc. for manifest keys)
- `INDEX`: Zero-based integer or descriptive suffix
- `RULE_TEXT`: Plain text rule content

### Example: Agent Domain

```
# SYNAPSE Agent Domain: @dev (L2)
# Agent-scoped rules for developer agent
# Source: .aios-core/development/agents/dev.md

AGENT_DEV_RULE_0=Follow story tasks sequentially — read task, implement, test, mark [x]
AGENT_DEV_RULE_1=ONLY update Dev Agent Record sections in story files
AGENT_DEV_RULE_2=Run CodeRabbit pre-commit review before marking story complete
```

### Example: Workflow Domain

```
# SYNAPSE Workflow Domain: Story Development (L3)

WORKFLOW_STORY_DEV_RULE_0=Follow SDC phases: Create → Validate → Implement → QA Gate
WORKFLOW_STORY_DEV_RULE_1=Update story checkboxes as tasks complete
```

## Manifest Registration

Every domain must be registered in `.synapse/manifest`. The manifest uses the same KEY=VALUE format:

### Required Manifest Keys

| Key | Purpose | Example |
|-----|---------|---------|
| `{PREFIX}_STATE` | Domain active state (`active` or `inactive`) | `AGENT_DEV_STATE=active` |

### Optional Manifest Keys

| Key | Purpose | Example |
|-----|---------|---------|
| `{PREFIX}_ALWAYS_ON` | Domain always loaded (L0, L1) | `CONSTITUTION_ALWAYS_ON=true` |
| `{PREFIX}_NON_NEGOTIABLE` | Cannot be overridden (L0 only) | `CONSTITUTION_NON_NEGOTIABLE=true` |
| `{PREFIX}_AGENT_TRIGGER` | Activate when agent matches (L2) | `AGENT_DEV_AGENT_TRIGGER=dev` |
| `{PREFIX}_WORKFLOW_TRIGGER` | Activate when workflow matches (L3) | `WORKFLOW_STORY_DEV_WORKFLOW_TRIGGER=story_development` |
| `{PREFIX}_RECALL` | Keywords that trigger domain (L6) | `MYLIB_RECALL=react,hooks` |
| `{PREFIX}_EXCLUDE` | Agents/contexts to exclude from | `MYLIB_EXCLUDE=qa` |

### Current Manifest Domains

The manifest at `.synapse/manifest` registers:
- 1 Constitution domain (L0, NON_NEGOTIABLE, ALWAYS_ON)
- 2 Global domains (L1, ALWAYS_ON): `global`, `context`
- 1 Commands domain (L7): `commands`
- 12 Agent domains (L2): one per core agent (`agent-dev`, `agent-qa`, etc.)
- 3 Workflow domains (L3): `workflow-story-dev`, `workflow-epic-create`, `workflow-arch-review`

## Creating Custom Domains

Use the CRUD command to create a new domain:

```
*synapse create
```

This will:
1. Ask for domain name, layer, and description
2. Create the domain file in `.synapse/`
3. Add the manifest entry to `.synapse/manifest`
4. Validate the format is parseable by domain-loader

For the domain file template, see: `.claude/commands/synapse/templates/domain-template`

For the manifest entry template, see: `.claude/commands/synapse/templates/manifest-entry-template`

## Source Files

| File | Purpose |
|------|---------|
| `.synapse/manifest` | Central domain registry |
| `.synapse/*` | Domain content files |
| `.aios-core/core/synapse/domain/domain-loader.js` | Domain parser (SYN-1) |
