# Task: Diagnose Claude Code Question

**Task ID:** CCM-CHIEF-001
**Version:** 1.0.0
**Command:** `*diagnose`
**Orchestrator:** Orion (claude-mastery-chief)
**Purpose:** Triage Claude Code questions and problems, provide a quick answer, and route to the appropriate specialist agent when domain-specific expertise is needed.

---

## Overview

```
  User Question
       |
       v
  +------------------+
  | 1. Parse Request  |
  |    Extract keywords|
  +------------------+
       |
       v
  +------------------+
  | 2. Match Routing  |
  |    Matrix          |
  +------------------+
       |
       +-------+-------+
       |               |
       v               v
  Cross-cutting    Domain-specific
       |               |
       v               v
  +----------+    +------------------+
  | 3a. Answer|   | 3b. Quick Answer |
  |  Directly |   |  + Route to      |
  +----------+    |  Specialist       |
       |          +------------------+
       v               |
  +------------------+ |
  | 4. Output Report | <+
  +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| question | string | User prompt | Yes | Non-empty natural language question or problem description |
| context | object | Session state | No | Active story, branch, recent errors if available |

---

## Preconditions

- Claude Code Mastery squad is active with Orion as the entry agent
- Routing matrix is loaded from the agent definition (triage.routing_matrix)
- All 7 specialist agents are registered in config.yaml

---

## Execution Phases

### Phase 1: Analyze Request (Keyword Extraction)

1. Parse the user's question or problem description
2. Extract primary keywords and intent signals
3. Identify the request category:
   - Is it a "how to" question?
   - Is it a debugging/troubleshooting problem?
   - Is it a setup/configuration request?
   - Is it a conceptual/comparison question?
4. Note any secondary domains that may be relevant

### Phase 2: Match Against Routing Matrix

Apply keyword matching against the 7 specialist domains:

| Domain | Keywords | Route To | Persona |
|--------|----------|----------|---------|
| hooks | hook, pre_tool_use, post_tool_use, lifecycle, intercept, block, exit code, automation pipeline, pre_compact, notification, damage control | hooks-architect | Latch |
| mcp | mcp, server, tool search, stdio, sse, http streamable, mcp__, context7, exa, docker gateway, add server | mcp-integrator | Piper |
| subagents | subagent, agent team, swarm, teammate, worktree, parallel, background agent, spawn, multi-agent, TeammateTool | swarm-orchestrator | Nexus |
| config | settings, permission, CLAUDE.md, rules, sandbox, managed, enterprise, allow, deny, keybinding, context window, compaction | config-engineer | Sigil |
| skills | skill, command, plugin, SKILL.md, slash command, context engineering, spec-driven, .claude/commands, .claude/skills, marketplace | skill-craftsman | Anvil |
| integration | integrate, repository, project setup, CI/CD, headless, brownfield, monorepo, AIOX, git workflow | project-integrator | Conduit |
| roadmap | update, changelog, version, roadmap, new feature, what changed, migration, upgrade, adoption | roadmap-sentinel | Vigil |

**Scoring rules:**
- Count keyword matches per domain
- If one domain scores significantly higher (2+ matches above others), route there
- If multiple domains tie or the question spans domains, treat as cross-cutting
- If no domain matches strongly, treat as cross-cutting (Orion answers directly)

### Phase 3a: Cross-Cutting Answer (Direct)

If the question is cross-cutting or general:

1. Synthesize knowledge from the quick_reference section and AIOX awareness
2. Provide a complete, actionable answer
3. Reference relevant specialist agents the user can consult for deeper exploration
4. Include code snippets, configuration examples, or reference tables as appropriate

### Phase 3b: Domain-Specific Answer (Quick + Route)

If the question maps to a specific domain:

1. **Provide a quick answer first** -- Never route without giving immediate value
   - Answer the question at a surface level (3-5 lines minimum)
   - Include a concrete example (code snippet, config block, or command)
2. **Route to the specialist** for deeper expertise:
   - Name the specialist agent and persona
   - Explain what additional depth the specialist can provide
   - Provide the activation command: `@claude-code-mastery:{agent-id}`
   - Suggest a specific specialist command if applicable (e.g., `*create-hook`, `*audit-settings`)

### Phase 4: Confidence Assessment

Rate the diagnosis confidence:

| Confidence | Criteria | Action |
|------------|----------|--------|
| HIGH | 3+ keyword matches in one domain, clear intent | Route with confidence |
| MEDIUM | 1-2 matches, ambiguous intent | Provide answer + suggest 2 possible specialists |
| LOW | No clear domain match | Answer directly, ask clarifying question |

---

## Output Format

```markdown
## Diagnosis

**Category:** {domain-name | cross-cutting}
**Confidence:** {HIGH | MEDIUM | LOW}
**Specialist:** {persona-name} ({agent-id}) | Direct Answer

### Quick Answer

{3-10 line answer with concrete example}

### Recommended Next Step

{Route instruction OR follow-up question for clarification}
```

---

## Veto Conditions

- **NEVER** route to a specialist without providing at least a quick answer first. The user must receive immediate value from every interaction with Orion.
- **NEVER** route when confidence is LOW -- ask a clarifying question instead.
- **NEVER** load a specialist agent file during diagnosis. Only provide routing instructions for the user to activate the specialist.
- **NEVER** guess the domain when keywords are ambiguous -- synthesize a cross-cutting answer and let the user refine.

---

## Completion Criteria

- [ ] User question parsed and keywords extracted
- [ ] Routing matrix consulted with scored results
- [ ] Quick answer provided with concrete example
- [ ] Specialist routing provided (if domain-specific)
- [ ] Confidence level stated in output
