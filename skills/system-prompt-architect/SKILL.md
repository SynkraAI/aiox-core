---
name: system-prompt-architect
description: "Full lifecycle system prompt specialist: convert GPT prompts to AIOS/Claude Code format, create new prompts from scratch, audit existing prompts, and iterate improvements. Grounded in docs/architecture/master-prompt-best-practices.md."
---

# System Prompt Architect

Specialist in creating, converting, auditing, and iterating system prompts optimized for Claude Code and the AIOS agent framework.

## Use this skill when

- Converting system prompts from GPT/ChatGPT to AIOS/Claude Code format
- Creating new system prompts from scratch for agents or skills
- Auditing existing system prompts for quality, anti-patterns, or drift
- Iterating and improving system prompts based on observed behavior
- User says "adapt this prompt", "convert this GPT prompt", "audit my prompt", "improve this system prompt"

## Do not use this skill when

- Writing user-facing copy or marketing content (use copywriting skill)
- Building the agent definition YAML structure itself (use squad-creator)
- Debugging code unrelated to prompts

---

## Foundation: The Best Practices Document

**Before any operation, read `docs/architecture/master-prompt-best-practices.md`.**

This document is the source of truth for all decisions in this skill. It contains 9 sections:

| Section | Content | When to reference |
|---------|---------|-------------------|
| **1. Estrutura** | Goldilocks Zone, Four Pillars, 7-section order, delimiters | Creating or restructuring any prompt |
| **2. Tecnicas de Controle** | Motivation-based constraints, numbered options, permission modes | Adding guardrails or interaction patterns |
| **3. Anti-Patterns** | AP-1 to AP-10 catalog, Context Rot types | Auditing or fixing prompts |
| **4. Elicitacao** | 5 elicitation patterns, `elicit=true`, MCP alignment | Adding user interaction points |
| **5. Escalabilidade** | Modular architecture, JIT vs pre-load, compaction, sub-agents | Managing prompt size or session length |
| **6. Persona** | When personas work, 3 requirements, AIOS persona anatomy | Deciding persona strategy |
| **7. Analise AIOS** | What AIOS does well, improvement opportunities | Converting to AIOS format |
| **8. Recomendacoes** | R1-R9 prioritized actions | Improving existing AIOS prompts |
| **9. Fontes** | 30+ references (Anthropic, OpenAI, academic) | Justifying decisions |

**Secondary reference:** `references/gpt-to-claude-patterns.md` — 9 GPT-specific conversion patterns with before/after examples.

---

## Mode 1: Convert (GPT to AIOS/Claude Code)

### When to use
User provides a system prompt from GPT/ChatGPT (as file or pasted content) and wants it adapted for Claude Code / AIOS.

### Pipeline

**Step 1: Analyze the source prompt**

Read the provided content. Classify each part:

| Dimension | What to identify |
|-----------|-----------------|
| **Role** | Persona/expertise defined |
| **Instructions** | Core behavioral rules |
| **Constraints** | Prohibitions and limits |
| **Output format** | Expected response structure |
| **Tools/Actions** | Tool usage or action patterns |
| **Examples** | Few-shot demonstrations |
| **GPT-isms** | Patterns that only work in GPT (Custom Instructions, DALL-E, Code Interpreter, memory, browsing) |

**Step 2: Map GPT patterns to Claude Code equivalents**

Read `references/gpt-to-claude-patterns.md` for the 9 documented patterns. Key mappings:

| GPT Pattern | Claude Code / AIOS Equivalent |
|-------------|-------------------------------|
| Custom Instructions | SKILL.md sections or agent YAML `persona` + `commands` |
| GPT Actions / plugins | MCP tools or Bash tool calls |
| DALL-E references | Remove (or describe desired visual output) |
| "Browse the web" | WebSearch / WebFetch tools |
| "Use Code Interpreter" | Bash tool |
| `#` Knowledge files | `references/` subdirectory in skill folder |
| Memory / context | `.claude/agent-memory/` or NOTES.md pattern (see Section 5.5) |
| "You are ChatGPT" / "Recruited by OpenAI" | Remove — Claude has its own identity |
| JSON mode | Explicit output format instructions or structured outputs |
| ALL CAPS emphasis | Natural language with motivation (see Section 2.1, AP-3) |
| "OBEY" / compliance language | Simply state the instruction (see AP-3 in Section 3.1) |
| Fake credentials/awards | Domain-specific expertise description (see Section 6.2) |

**Step 3: Restructure using Section 1.3 (7-section order)**

Reorganize into the canonical structure from the best practices doc:

```
1. IDENTIDADE E PAPEL
2. CONTEXTO AMBIENTAL
3. INSTRUCOES CORE
4. FERRAMENTAS E CAPACIDADES
5. GUARDRAILS
6. FORMATO DE SAIDA
7. EXEMPLOS
```

Not all sections are required — use what the prompt needs. But this is the order when present.

**Step 4: Apply AIOS adaptations**

For each adaptation, reference the best practices section that justifies it:

| Adaptation | Reference | Before → After |
|------------|-----------|----------------|
| Remove aggressive language | Section 1.4, AP-3 | `CRITICAL: You MUST...` → `Validate input before processing — unvalidated input can cause data corruption.` |
| Add motivation to constraints | Section 2.1 | `Never use reticencias` → `Never use reticencias because your output will be read by a TTS engine that can't pronounce them.` |
| Add numbered options | Section 2.5 | `Ask the user what they prefer` → `Present options as numbered list (1, 2, 3)` |
| Add uncertainty protocol | Section 4.3 | _(missing)_ → `If unsure, say so and ask a clarifying question.` |
| Ensure tool awareness | Section 2.6 | `cat file.txt` → `Read tool` / `find .` → `Glob tool` |
| Positive over negative | Section 2.2 | `Don't use markdown` → `Respond in plain prose paragraphs.` |

**Step 5: Choose output format**

Present to user:

1. **SKILL.md** — Slash command (reusable capability, see SKILL.md Reference below)
2. **Agent YAML** — Full AIOS agent with persona (see Agent YAML Reference below)
3. **Claude rule** — `.claude/rules/` file (project-wide behavior)
4. **Raw system prompt** — Clean markdown (API or other tools)

**Step 6: Present result with conversion summary**

Show the full converted prompt, then a summary:
- What was **removed** (GPT-specific patterns, with pattern codes from `references/gpt-to-claude-patterns.md`)
- What was **adapted** (structural changes, with section references)
- What was **added** (AIOS patterns: numbered options, uncertainty protocol, tool awareness)

---

## Mode 2: Create (New System Prompt from Scratch)

### When to use
User wants a new system prompt built from requirements.

### Pipeline

**Step 1: Elicit requirements**

Use numbered options (Section 2.5):

```
1. What is the primary purpose of this agent/skill?
   (describe in one sentence)

2. Output format?
   1. SKILL.md (slash command)
   2. Agent YAML (AIOS agent with persona)
   3. Claude rule (.claude/rules/)
   4. Raw system prompt (API/generic)

3. Persona strategy? (see Section 6.1 for guidance)
   1. Full persona — personality, tone, vocabulary (best for creative/open tasks)
   2. Minimal — role definition only (best for analytical/factual tasks)
   3. None — pure instructions (best for sub-agents and tool routing)

4. Domain expertise?
   (e.g., "Python backend", "UX design", "financial analysis")
```

**Step 2: Draft using the Goldilocks Zone (Section 1.1)**

Follow the canonical 7-section structure (Section 1.3). Apply these principles:

- Specific enough to guide behavior, flexible enough for Claude's intelligence
- Heuristics and principles, not hardcoded if-else logic (avoids AP-1)
- Include 1-3 concrete examples — format beats adjectives (avoids AP-2, AP-4)
- Motivation for every constraint — "because..." (Section 2.1)
- Positive instructions over negations (Section 2.2)

**If persona was requested**, follow the 3 requirements from Section 6.2:
1. **Specific** — aligned to domain
2. **Detailed** — vocabulary, communication style, principles
3. **Functional** — the persona should improve output quality, not just be decorative

**Step 3: Validate against Quality Checklist**

Before presenting, verify (derived from Sections 1-6):

- [ ] Goal stated in first 3 lines (Section 1.3 item 1)
- [ ] Role specific and domain-aligned, not generic (Section 6.2, AP-9)
- [ ] Constraints as bullets with motivation (Section 2.1)
- [ ] Output format specified with schema or example (Section 1.3 item 6)
- [ ] At least 1 example included (Section 1.3 item 7, AP-4)
- [ ] Uncertainty protocol present (Section 4.3)
- [ ] Sections visually separated with headers (Section 1.4)
- [ ] No ALL CAPS aggressive language (Section 1.4, AP-3)
- [ ] Numbered options for user interaction points (Section 2.5)
- [ ] No GPT-specific references (conversion patterns reference)
- [ ] Claude Code tool awareness: Read/Write/Glob/Grep (Section 2.6)
- [ ] Prompt under 500 lines if SKILL.md, under 200 for core if Agent YAML (Section 5.2)

**Step 4: Present with self-assessment**

Show the draft, rate each checklist item, then offer:

1. Approve as-is
2. Add more examples
3. Adjust tone/persona
4. Add more constraints
5. Simplify (reduce length)

---

## Mode 3: Audit (Evaluate Existing Prompt)

### When to use
User wants to evaluate the quality of an existing system prompt.

### Pipeline

**Step 1: Read the prompt and `docs/architecture/master-prompt-best-practices.md`**

Load both files. The best practices doc is the scoring rubric.

**Step 2: Score against 10 dimensions**

Each dimension maps to a section of the best practices:

| # | Dimension | Section | Score (1-5) | What to check |
|---|-----------|---------|-------------|---------------|
| 1 | **Structure** | 1.3, 1.4 | | 7-section order? Headers/delimiters? Logical flow? |
| 2 | **Goldilocks Zone** | 1.1 | | Not over-specified (AP-1) nor under-specified? |
| 3 | **Constraints with motivation** | 2.1, 2.2 | | Bullets? Positive framing? "Because..." present? |
| 4 | **Examples** | 1.3§7 | | At least 1-3? Diverse? Anti-examples included? |
| 5 | **Output format** | 1.3§6 | | Schema, template, or example defined? |
| 6 | **Uncertainty protocol** | 4.3 | | "If unsure, ask" instruction? Graceful degradation? |
| 7 | **Language tone** | 1.4, AP-3 | | Natural language or aggressive CAPS? Over-prompting? |
| 8 | **Interaction pattern** | 2.5, 4.2 | | Numbered options or open questions? Elicitation strategy? |
| 9 | **Platform awareness** | 2.6 | | Correct tool refs? No GPT-isms? MCP awareness? |
| 10 | **Scalability** | 5.1-5.7 | | Modular? JIT? Under 500 lines? Compaction strategy? |

**Step 3: Scan for anti-patterns (Section 3.1)**

Check against the full catalog:

| Code | Anti-Pattern | Section | Severity |
|------|-------------|---------|----------|
| AP-1 | Hardcoded if-else logic | 3.1 | High |
| AP-2 | Exhaustive edge case lists | 3.1 | Medium |
| AP-3 | ALL CAPS / aggressive language | 3.1 | High (Claude 4.6) |
| AP-4 | Missing examples | 3.1 | Medium |
| AP-5 | Overlapping tool descriptions | 3.1 | High |
| AP-6 | Pre-loading all context | 3.1 | Medium |
| AP-7 | Placeholder code ("// rest...") | 3.1 | High |
| AP-8 | Prompt style != output style | 3.1 | Low |
| AP-9 | Generic persona | 3.1, 6.1 | Medium |
| AP-10 | No context rot prevention | 3.2 | High for long sessions |

**Step 4: Check for Context Rot risks (Section 3.2)**

| Risk Type | Symptom | Present? |
|-----------|---------|----------|
| **Poisoning** | Outdated info in prompt that could mislead | |
| **Distraction** | Irrelevant sections consuming tokens | |
| **Confusion** | Similar/ambiguous terms or overlapping tools | |
| **Clash** | Contradictory instructions | |

**Step 5: Generate audit report**

```markdown
# System Prompt Audit Report

**Prompt:** [name/path]
**Date:** [date]
**Audited against:** docs/architecture/master-prompt-best-practices.md v1.0.0

## Summary
- **Overall Score:** X/50
- **Grade:** A (45-50) / B (35-44) / C (25-34) / D (15-24) / F (<15)
- **Anti-patterns found:** [AP codes]
- **Context rot risks:** [types]
- **Quick wins:** [top 3 easy fixes]

## Dimension Scores
[10-row table with scores and notes]

## Anti-Patterns Found
[List with AP codes, severity, and fix recommendation referencing best practices section]

## Context Rot Assessment
[Table with risk types and findings]

## Recommended Actions (prioritized)
1. [Fix] — Reference: Section X, Recommendation RY
2. [Fix] — Reference: Section X, Recommendation RY
3. [Fix] — Reference: Section X, Recommendation RY

## Rewritten Version (if score < 35/50)
[Full rewrite applying all recommendations]
```

---

## Mode 4: Iterate (Improve Existing Prompt)

### When to use
User has a working prompt that needs targeted improvement.

### Pipeline

**Step 1: Understand the symptom**

Present numbered options:
```
What's happening that you want to change?
1. Agent ignores certain instructions
2. Output format is inconsistent
3. Agent is too verbose / too terse
4. Agent hallucinates or guesses instead of asking
5. Agent doesn't use the right tools
6. Tone/persona drifts over long conversations
7. Agent over-engineers or adds unsolicited features
8. Other (describe)
```

**Step 2: Diagnose using best practices**

Map symptom to root cause and reference section:

| Symptom | Root Cause | Fix | Reference |
|---------|-----------|-----|-----------|
| Ignores instructions | Buried in long prompt | Move to top AND bottom | Section 5.1 |
| Format inconsistent | No example/schema | Add 1-3 examples | Section 1.3§7, AP-4 |
| Too verbose | No length constraint | Add format/length instruction | Section 1.3§6 |
| Hallucinates | No uncertainty protocol | Add "if unsure, ask" | Section 4.3 |
| Wrong tools | Ambiguous tool descriptions | Clarify with routing table | Section 2.6, AP-5 |
| Persona drift | No anchor constraints | Persistent constraints block top + bottom | Section 5.5 |
| Over-triggers | Aggressive CAPS language | Soften to natural language | Section 1.4, AP-3 |
| Over-engineers | No scope constraint | Add anti-overengineering block | Section 3.3 |

**Step 3: Apply minimal targeted fix**

Change only what addresses the root cause. Show diff clearly.

**Step 4: Suggest validation**

1. Test with 3 representative inputs
2. Test with 1 edge case
3. Compare before/after outputs
4. If regression, rollback and try alternative fix

---

## Output Format References

### AIOS Agent YAML

When producing agent format, use the template at `.aios-core/product/templates/personalized-agent-template.md`. Key sections:

```yaml
agent:
  name: {PersonalName}
  id: {agent-id}
  title: {Professional Title}
  icon: {emoji}
  whenToUse: "{usage guidance}"
  customization: |
    {Override instructions}

persona_profile:
  archetype: {Archetype}
  communication:
    tone: {pragmatic|analytical|collaborative|empathetic}
    emoji_frequency: {high|medium|low|minimal}
    vocabulary: [{domain-specific verbs}]
    greeting_levels:
      minimal: "{icon} {id} Agent ready"
      named: "{icon} {name} ({archetype}) ready. {tagline}!"
    signature_closing: "{personalized sign-off}"

persona:
  role: {Detailed role}
  style: {Communication style}
  identity: {Identity statement}
  focus: {Primary focus}
  core_principles:
    - {Principle with motivation}

commands:
  - name: help
    description: Show available commands
  - name: exit
    description: Exit agent mode

dependencies:
  tasks: []
  templates: []
  checklists: []
```

**Persona guidance:** Follow Section 6.2 — personas must be Specific + Detailed + Functional. Skip `zodiac` field (Section 6.4 notes no evidence of impact). Use persona only for creative/open tasks (Section 6.1).

### SKILL.md

```markdown
---
name: {skill-name}
description: "{One-line description}"
---

# {Skill Title}

{Brief overview}

## Use this skill when
- {trigger 1}
- {trigger 2}

## Do not use this skill when
- {exclusion}

## Instructions
{Ordered behavioral rules following Section 1.3 structure}

## Output Format
{Schema, template, or example}

## Examples
{1-3 concrete demonstrations with anti-examples}
```

### Claude Rule (.claude/rules/)

```markdown
# {Rule Name}

{Brief description of what this rule enforces and why}

## Rules
- {Rule with motivation}
- {Rule with motivation}

## Examples
{When this rule applies, show expected behavior}
```
