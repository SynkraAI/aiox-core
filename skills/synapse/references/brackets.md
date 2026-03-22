# SYNAPSE Context Brackets Reference

## Overview

Context brackets control how much content SYNAPSE injects per prompt based on how much context window remains. As the conversation progresses and context fills up, SYNAPSE adapts by changing which layers are active and how many tokens it injects.

The bracket system is implemented in `.aios-core/core/synapse/context/context-tracker.js`.

## The 4 Brackets

| Bracket | Context Remaining | Token Budget | Behavior |
|---------|-------------------|-------------|----------|
| **FRESH** | 60-100% | ~800 tokens | Lean injection — essentials only |
| **MODERATE** | 40-60% | ~1500 tokens | Standard injection — all layers active |
| **DEPLETED** | 25-40% | ~2000 tokens | Reinforcement — reinforce critical rules, memory hints enabled |
| **CRITICAL** | <25% | ~2500 tokens | Handoff warning — recommend session handoff, document state |

## How Brackets Are Calculated

The context tracker estimates remaining context using:

```
contextPercent = 100 - ((promptCount * avgTokensPerPrompt) / maxContext * 100)
```

**Default values:**
- `avgTokensPerPrompt`: 1500
- `maxContext`: 200000 (Claude's context window)

**Bracket assignment:**
- `contextPercent >= 60` → FRESH
- `contextPercent >= 40` → MODERATE
- `contextPercent >= 25` → DEPLETED
- `contextPercent < 25` → CRITICAL

Invalid or NaN input defaults to CRITICAL (fail-safe).

## Layer Activation per Bracket

| Bracket | Active Layers | Memory Hints | Handoff Warning |
|---------|---------------|-------------|-----------------|
| **FRESH** | L0, L1, L2, L7 | No | No |
| **MODERATE** | L0-L7 (all) | No | No |
| **DEPLETED** | L0-L7 (all) | Yes | No |
| **CRITICAL** | L0-L7 (all) | Yes | Yes |

**Key behavior:**
- **FRESH**: Only core layers (Constitution, Global, Agent, Star-Commands) — saves tokens early
- **MODERATE**: Full layer stack activated — normal operation
- **DEPLETED**: Memory hints from MIS enabled (when pro available) to reinforce context
- **CRITICAL**: Handoff warning injected, recommending session continuation in new window

## Bracket-Specific Rules

The `.synapse/context` domain file contains rules that vary by bracket:

### FRESH Rules
- Minimize injected rules to essentials only
- Avoid redundant context — agent has full conversation history
- Full layer stack available but lean injection

### MODERATE Rules
- All layers active at normal priority
- Monitor token usage — consider summarizing long outputs
- Prefer concise code examples over verbose explanations

### DEPLETED Rules
- Reinforce critical rules and constraints
- Prefer concise responses to save tokens
- Skip optional layers (L6 keyword domains) to conserve
- Summarize progress before each action

### CRITICAL Rules
- Recommend session handoff
- Summarize current state for new session continuation
- Only inject L0 Constitution and L1 Global rules — skip other layers
- Document incomplete work in story file

## Token Budget Enforcement

The output formatter (`.aios-core/core/synapse/output/formatter.js`) enforces token budgets:

1. Each bracket has a max token budget (800 / 1500 / 2000 / 2500)
2. Sections are rendered in priority order (CONSTITUTION first, SUMMARY last)
3. When budget is exceeded, sections are truncated from the end (lowest priority first)

**Truncation order** (last removed first):
```
SUMMARY → KEYWORD → SQUAD → TASK → WORKFLOW → AGENT → CONSTITUTION
```

Constitution (L0) is never truncated.

## Source Files

| File | Purpose |
|------|---------|
| `.aios-core/core/synapse/context/context-tracker.js` | Bracket calculation, token budgets, layer configs |
| `.synapse/context` | Bracket-specific context rules (L1) |
| `.aios-core/core/synapse/output/formatter.js` | Token budget enforcement + truncation |
