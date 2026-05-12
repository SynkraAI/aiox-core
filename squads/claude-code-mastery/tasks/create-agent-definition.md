# Task: Create Custom Subagent Definition

**Task ID:** create-agent-definition
**Version:** 1.0
**Purpose:** Create a purpose-built subagent definition file for use with the Agent tool
**Orchestrator:** @swarm-orchestrator (Nexus)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Agent file passes lint, loads correctly, and executes test prompt

---

## Overview

This task creates a custom subagent definition in `.claude/agents/` that can be invoked via the Agent tool. Subagents are specialized Claude instances with scoped instructions, model selection, and optional tool restrictions.

```
INPUT (agent_purpose + scope + complexity)
    |
[PHASE 1: PURPOSE DEFINITION]
    -> Define what the agent does and does not do
    -> Identify required tools and knowledge
    -> Determine isolation needs
    |
[PHASE 2: TYPE SELECTION]
    -> Choose subagent type (general, explore, plan)
    -> Select model (opus, sonnet, haiku)
    -> Define tool restrictions
    |
[PHASE 3: FILE CREATION]
    -> Create .claude/agents/{name}.md
    -> Write YAML frontmatter
    -> Write instruction body in markdown
    |
[PHASE 4: INSTRUCTION ENGINEERING]
    -> Write clear behavioral instructions
    -> Define output format expectations
    -> Add guardrails and constraints
    |
[PHASE 5: MODEL SELECTION]
    -> Match complexity to model tier
    -> Configure cost/quality tradeoff
    -> Set max_turns if needed
    |
[PHASE 6: VALIDATION]
    -> Test agent with Agent tool
    -> Verify tool access works as expected
    -> Check output quality
    |
OUTPUT: Agent definition file + test results
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| agent_name | string | User | yes | Kebab-case, no spaces (e.g., code-reviewer) |
| agent_purpose | string | User | yes | One-sentence description of what the agent does |
| complexity | enum | User or auto | yes | simple / standard / complex |
| tools_needed | array | User | no | List of tools the agent needs access to |
| output_format | string | User | no | Expected output structure (markdown, json, yaml) |

---

## Preconditions

1. `.claude/agents/` directory exists (create if not)
2. Understanding of the task the agent will perform
3. Claude Code is operational for testing

---

## Phase 1: Purpose Definition

**Goal:** Clearly scope what the agent will and will not do.

### Steps

1.1. Define the agent's primary responsibility in one sentence.
1.2. List 3-5 specific tasks the agent should handle.
1.3. List 2-3 things the agent should NOT do (anti-scope).
1.4. Identify what context the agent needs (files, project knowledge, etc.).

### Purpose Template

```
Agent: {name}
Does: {primary responsibility}
Tasks: {task1}, {task2}, {task3}
Does NOT: {anti1}, {anti2}
Needs: {context1}, {context2}
```

---

## Phase 2: Type Selection

**Goal:** Choose the right subagent configuration.

### Subagent Types

| Type | Tools Available | Best For |
|------|----------------|----------|
| **General-purpose** (default) | All tools | Implementation, analysis, complex tasks |
| **Explore** | Read, Glob, Grep, Bash(read-only) | Research, code search, documentation lookup |
| **Plan** | Read, Glob, Grep (no write) | Design, architecture, planning tasks |

### Steps

2.1. Match the agent's purpose to a type.
2.2. If none fit, use general-purpose with explicit `allowed-tools` restrictions.
2.3. Document the type decision and rationale.

---

## Phase 3: File Creation

**Goal:** Create the agent definition file with proper structure.

### Agent File Template

```markdown
---
name: {agent-name}
description: {one-line description}
model: {opus-4|sonnet-4|haiku-4}
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# {Agent Name}

## Role
{Detailed description of agent's role and expertise}

## Instructions
{Step-by-step behavioral instructions}

## Constraints
{What the agent must NOT do}

## Output Format
{Expected output structure}
```

### Steps

3.1. Create `.claude/agents/{name}.md` using the template above.
3.2. Fill in YAML frontmatter with name, description, model, and allowed-tools.
3.3. The frontmatter fields are:
   - `name`: Display name for the agent
   - `description`: Brief description shown in agent listings
   - `model`: Which Claude model to use (see Phase 5)
   - `allowed-tools`: Array of tools the agent can access (omit for all tools)

---

## Phase 4: Instruction Engineering

**Goal:** Write clear, effective instructions in the markdown body.

### Instruction Best Practices

1. **Be specific** -- "Analyze imports and suggest barrel files" not "Help with code"
2. **Set output expectations** -- Describe the exact format you want
3. **Add examples** -- Show input/output pairs when possible
4. **Define boundaries** -- What the agent should refuse or escalate
5. **Include context loading** -- Tell the agent what files to read first

### Instruction Sections

```markdown
## Role
You are a {role} specialized in {domain}. Your job is to {primary task}.

## Process
1. First, read {relevant files}
2. Then, analyze {what to look for}
3. Finally, produce {output format}

## Rules
- ALWAYS {mandatory behavior}
- NEVER {prohibited behavior}
- When unsure, {fallback behavior}

## Output Format
Return your analysis as:
{format specification}
```

4.1. Write the Role section with clear identity.
4.2. Write the Process section with numbered steps.
4.3. Write the Rules section with ALWAYS/NEVER constraints.
4.4. Write the Output Format section with structure specification.

---

## Phase 5: Model Selection

**Goal:** Choose the right model for cost and quality balance.

### Model Selection Guide

| Model | Cost | Speed | Best For |
|-------|------|-------|----------|
| **claude-opus-4** | High | Slow | Complex analysis, architecture decisions, nuanced writing |
| **claude-sonnet-4** | Medium | Medium | Standard tasks, code review, implementation |
| **claude-haiku-4** | Low | Fast | Simple lookups, formatting, repetitive tasks |

### Decision Matrix

```
Is the task complex with ambiguous inputs?
  YES -> opus
  NO  -> Does it require code generation or analysis?
    YES -> sonnet
    NO  -> Is it a simple lookup or formatting task?
      YES -> haiku
      NO  -> sonnet (safe default)
```

5.1. Evaluate task complexity against the matrix.
5.2. Set the `model` field in frontmatter.
5.3. Consider that subagents incur per-call costs -- haiku for high-frequency agents.

---

## Phase 6: Validation

**Goal:** Test that the agent works correctly.

### Steps

6.1. Invoke the agent using the Agent tool with a representative prompt.
6.2. Verify the agent:
   - Uses only its allowed tools
   - Follows its instructions
   - Produces output in the expected format
   - Stays within its defined scope
6.3. If the agent fails, iterate on instructions (most common fix).
6.4. Run 2-3 different test prompts to cover edge cases.

---

## Output Format

```yaml
agent_definition_result:
  file: ".claude/agents/{name}.md"
  name: "{agent-name}"
  type: "{general|explore|plan}"
  model: "{opus-4|sonnet-4|haiku-4}"
  tools_allowed: [...]
  test_results:
    - prompt: "Test prompt 1"
      status: "pass"
    - prompt: "Test prompt 2"
      status: "pass"
  ready: true
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| Agent purpose is too broad (covers 5+ unrelated domains) | HALT -- split into multiple agents |
| No clear output format defined | HALT -- define expected output before creation |
| Agent requires tools that do not exist | HALT -- verify tool availability first |
| Test prompts all fail | HALT -- rewrite instructions, do not ship broken agent |
| Agent name conflicts with existing agent | HALT -- choose unique name |
