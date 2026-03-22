# GPT to Claude Code — Conversion Patterns

Reference guide for converting GPT/ChatGPT system prompts to Claude Code / AIOS format.
Based on real-world analysis of GPT meta-prompts and AIOS best practices.

---

## Pattern 1: ALL CAPS Emphasis

**GPT pattern:**
```
YOU MUST IDENTIFY AND HIGHLIGHT THE CANDIDATE'S MOST IMPRESSIVE ACHIEVEMENTS
NEVER WRITE LOW-QUALITY, INEFFECTIVE, POORLY STRUCTURED CVS
```

**Claude Code equivalent:**
```
Identify and highlight the candidate's most impressive achievements.

Avoid low-quality or poorly structured output — the user relies on this
for professional purposes, so quality directly impacts their career.
```

**Why:** Claude 4.6 over-triggers on ALL CAPS and aggressive emphasis. Natural language with motivation ("because...") produces better compliance than shouting.

---

## Pattern 2: "World's Best Expert" Role Inflation

**GPT pattern:**
```
YOU ARE THE WORLD'S BEST EXPERT RESUME WRITER AND CAREER COACH,
AWARDED THE "BEST RESUME WRITER AWARD" BY THE GLOBAL CAREER ASSOCIATION (2023)
```

**Claude Code equivalent:**
```
You are an expert resume writer specializing in [target industry].
Focus on quantifiable achievements, clear structure, and industry-specific keywords.
```

**Why:** Research shows inflated personas ("world's best") have neutral or negative impact on Claude's factual accuracy. Specific, domain-aligned descriptions outperform superlatives. The fake award adds nothing — Claude doesn't respond to fictional credentials.

---

## Pattern 3: Chain of Thoughts (CoT) — Keep but Simplify

**GPT pattern (good, keep the structure):**
```
1. Understand: Read and comprehend the user's question
2. Basics: Identify fundamental concepts
3. Break Down: Divide into smaller parts
4. Analyze: Use facts and data to examine each part
5. Build: Assemble insights into a coherent solution
6. Edge Cases: Consider and address exceptions
7. Final Answer: Present the solution clearly
```

**Claude Code equivalent:**
```
## Reasoning Approach

Before responding, work through these steps:
1. Understand what the user is actually asking
2. Identify the core concepts involved
3. Break the problem into manageable parts
4. Analyze each part using available information
5. Synthesize findings into a coherent answer
6. Consider edge cases and limitations
7. Present the final answer clearly

Show your reasoning when the problem is complex.
For straightforward requests, respond directly.
```

**Why:** The 7-step CoT is solid and transfers well. The key change: make it conditional ("when complex") instead of mandatory for every response. Claude 4.6 has adaptive thinking — forcing CoT on simple queries wastes tokens and adds latency.

---

## Pattern 4: "What Not To Do" Section

**GPT pattern (good concept, bad execution):**
```
###What Not To Do###
OBEY and never do:
NEVER BEHAVE LIKE AN INEXPERIENCED RESUME WRITER BELOW JUNIOR LEVEL
NEVER WRITE LOW-QUALITY, INEFFECTIVE, POORLY STRUCTURED CVS
NEVER INCLUDE ERRORS, AWKWARD PHRASING, OR POORLY ORGANIZED SECTIONS
```

**Claude Code equivalent:**
```
## Avoid These Patterns

- Generic filler phrases ("results-oriented professional") — replace with specific achievements
- Passive voice ("was responsible for") — use active voice ("led", "built", "increased")
- Missing metrics — every achievement should have a number when possible
- Inconsistent formatting — maintain one style throughout
```

**Why:** The concept of negative examples is proven effective. But "NEVER be bad" is vague — Claude already tries to be good. Instead, list specific concrete patterns to avoid with what to do instead. Actionable negatives > abstract prohibitions.

---

## Pattern 5: Few-Shot Examples

**GPT pattern (correct, enhance for Claude):**
```
###Few-Shot Example###
[empty in the meta-prompt]
```

**Claude Code equivalent:**
```
## Examples

### Input
"Managed team of developers"

### Output
"Led a cross-functional team of 8 engineers, delivering 3 major product
releases on schedule with 99.2% uptime, reducing deployment time by 40%
through CI/CD pipeline optimization."

### Anti-example (do not produce)
"Experienced team manager with strong leadership skills and a proven
track record of success in managing development teams."
(Too generic, no metrics, no specifics)
```

**Why:** Claude responds exceptionally well to concrete examples. Including an anti-example (what NOT to produce) alongside the positive example is more effective than a "What Not To Do" section with abstract rules.

---

## Pattern 6: Model Size Awareness

**GPT pattern:**
```
SIMPLIFY FOR SMALL MODELS: STRIP DOWN complex language, USE basic vocabulary
EXPAND FOR LARGE MODELS: ADD nuanced context, INCORPORATE domain-specific terminology
```

**Claude Code equivalent:**

This pattern is useful for prompt engineering skills but should be adapted to Claude's model tiers:

| Claude Model | Prompt Strategy |
|-------------|-----------------|
| **Haiku** | Simple instructions, explicit format, minimal context. Good for: search, format, list, translate. |
| **Sonnet** | Full instructions with examples. Good for: write, code, analyze, review. |
| **Opus** | Rich context, nuanced instructions, complex reasoning. Good for: architect, strategize, decide, synthesize. |

---

## Pattern 7: "RECRUITED BY OPENAI" Identity

**GPT pattern:**
```
YOU ARE AN ELITE PROMPT ENGINEER RECRUITED BY OPENAI TO CRAFT OPTIMAL PROMPTS
```

**Claude Code equivalent:**
Remove entirely. Claude has its own identity and doesn't need fictional recruitment stories. If you need a role:

```
You are a prompt engineering specialist focused on creating effective
system prompts for Claude Code agents within the AIOS framework.
```

---

## Pattern 8: Internet Awareness

**GPT pattern:**
```
LLM-agent doesn't have access to the Internet AND answers instantly,
without verifying its own answers afterwards
```

**Claude Code equivalent:**
```
You have access to web search (WebSearch tool) and can fetch URLs (WebFetch tool).
Use these to verify current information when needed.
For questions about recent events or current documentation, search first.
```

**Why:** Claude Code has real tool access. The GPT caveat about no internet access doesn't apply.

---

## Pattern 9: "OBEY" and Compliance Language

**GPT pattern:**
```
OBEY and never do:
```

**Claude Code equivalent:**
Simply list the constraints without compliance language:

```
## Constraints
- [constraint 1 with motivation]
- [constraint 2 with motivation]
```

**Why:** "OBEY" is unnecessary and can trigger defensive responses. Claude follows instructions by default — you don't need to demand obedience.

---

## Conversion Checklist

When converting any GPT prompt to Claude Code:

- [ ] Remove ALL CAPS emphasis → use natural language
- [ ] Remove fake credentials/awards → use specific domain expertise
- [ ] Remove "OBEY", "YOU MUST", "ABSOLUTELY" → state instructions directly
- [ ] Remove ChatGPT/OpenAI references → reference Claude Code tools
- [ ] Add tool awareness (Read, Write, Glob, Grep, WebSearch, Bash)
- [ ] Add numbered options for user interaction points
- [ ] Add uncertainty protocol ("if unsure, ask")
- [ ] Add motivation for each constraint ("because...")
- [ ] Keep CoT structure but make conditional (complex queries only)
- [ ] Keep few-shot examples but add anti-examples
- [ ] Keep "What Not To Do" but make it concrete and actionable
- [ ] Keep domain knowledge sections but load on-demand (JIT)
