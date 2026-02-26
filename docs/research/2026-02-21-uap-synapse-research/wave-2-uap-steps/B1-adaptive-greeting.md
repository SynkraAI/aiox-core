# B1 — Adaptive Greeting / Verbosity (GreetingPreferenceManager)

**Research Block:** B1
**Wave:** 2 — UAP Steps
**Story:** NOG-9 (UAP & SYNAPSE Deep Research)
**Date:** 2026-02-21
**Researcher:** Claude (tech-search execution)

---

## Executive Summary

The AIOS `GreetingPreferenceManager` resolves greeting level (`auto/minimal/named/archetypal`) based on user profile (`beginner/intermediate/advanced`). This research examined how leading AI CLI tools handle adaptive verbosity, progressive disclosure, first-run vs. returning user detection, and user profiling.

**Key finding:** No existing AI CLI tool implements a formal "greeting preference manager" as a first-class concept. The space is fragmented — verbosity exists as a technical flag, not as a UX-aware personalization layer. AIOS has an opportunity to establish a best practice by combining user profile detection with adaptive greeting resolution in a single coherent subsystem.

---

## Research Question 1: Adaptive Output Verbosity in AI CLI Tools

### Claude Code (Anthropic)

Claude Code provides a `--verbose` flag for full turn-by-turn output (useful for debugging) and a `--debug` flag with optional category filtering. There is no tiered verbosity mapped to user expertise.

Notable: A high-volume community feature request ([Issue #21246](https://github.com/anthropics/claude-code/issues/21246), closed as duplicate of #9340) proposed:

```bash
claude --verbosity quiet    # Minimal output
claude --verbosity normal   # Current behavior (default)
claude --verbosity verbose  # Extra detail (debugging)
```

With per-tool granularity:

```json
// .claude/settings.json
{
  "output": {
    "showDiffs": "summary",
    "showFileReads": "truncate",
    "maxOutputLines": 50
  }
}
```

This has not been implemented as of February 2026. The issue has generated multiple duplicate requests (#17734, #17043, #21520, #21892), confirming strong user demand. There is **no first-run vs. returning-user distinction** and **no user expertise tier** in the current implementation.

**Verbosity persistence bug:** The `--verbose` setting [fails to persist across sessions](https://github.com/anthropics/claude-code/issues/7012) — requiring users to re-specify it on every launch. This is an active UX deficiency.

### Aider

Aider supports `--verbose` (also via `AIDER_VERBOSE` env var or `.aider.conf.yml`). Additional display controls include `--show-diffs`, `--pretty` (colorized output), and `--dark-mode`/`--light-mode`. There is **no quiet mode**, no user profile concept, and no greeting or onboarding mechanism. Configuration is explicit and static.

### Codex CLI (OpenAI)

Codex CLI includes a `model_verbosity` setting (`low/medium/high`) that applies to the GPT-5 Responses API. Users can suppress reasoning output (`hide_agent_reasoning: true`) and use named profiles:

```toml
# config.toml
model_verbosity = "medium"
hide_agent_reasoning = false

[profiles.quiet]
model_verbosity = "low"
hide_agent_reasoning = true
```

The profile system allows users to switch verbosity contexts (`codex --profile quiet`). This is the closest analogue to a configurable user-tier concept in the field, but it is **explicitly user-managed** — there is no automatic detection of expertise.

A community discussion ([#3946](https://github.com/openai/codex/discussions/3946)) reported that `model_verbosity = "low"` had no effect on tool call output — confirming that verbosity control remains fragmented and unreliable.

### Gemini CLI (Google)

Gemini CLI features a **deliberate first-run onboarding experience**: theme selection prompt followed by authentication method selection. Preferences are persisted at `~/.gemini/settings.json`. The `/settings` command allows in-session modification. Debug mode is available via `DEBUG=true` env var or F12 in the TUI. There is **no expertise-based adaptive verbosity** — all users see the same output after onboarding.

Notably, Gemini CLI has the most developed first-run vs. returning-user distinction in the category. The theme and auth preference stored on first run effectively marks the user as "returning" on subsequent sessions and skips the onboarding prompts.

### GitHub Copilot CLI

Now using the new agentic Copilot CLI (as of October 2025, the `gh copilot` extension was deprecated). The new Copilot CLI features "an adorable animated banner" on first launch. It supports custom agent profiles with configurable expertise/behavior but does not expose tiered verbosity to end users.

### Cursor IDE

Cursor adapts suggestions to coding style over time but does not offer a formal "user level" setting. The "Ask Mode" is described as suitable for new hires learning a codebase. Adaptation is implicit and model-driven, not explicitly tiered.

---

## Research Question 2: Best Practices for Adaptive UX in Developer Tools

### Progressive Disclosure (NN/g canonical definition)

Progressive disclosure defers advanced features to secondary UI contexts, keeping primary UI focused on essentials. It serves both novices (not overwhelmed) and experts (features accessible when needed).

**In CLI context (from [CLIG.dev](https://clig.dev/)):**

- Default to concise help text (summary + 1-2 examples) when no args provided
- Full help via `--help` flag (secondary level)
- Man page via `--man` (tertiary level)
- Treat error messages as teachable moments with corrective suggestions
- Use `-q`/`--quiet` for suppressing non-essential output
- Detect TTY context to switch between human-readable and machine-parseable output automatically

**Signal-to-noise principle (CLIG.dev):** "The more irrelevant output you produce, the longer it's going to take the user to figure out what they did wrong." This directly supports adaptive output reduction for experts who need precision over verbosity.

### Ubuntu CLI Verbosity Levels Specification

The [Ubuntu CLI verbosity standard](https://discourse.ubuntu.com/t/cli-verbosity-levels/26973) defines a 5-tier model:

| Mode | Flag | Audience | Analogy |
|------|------|----------|---------|
| Quiet | `--quiet`/`-q` | Automation/CI | No output unless error |
| Brief | (default) | General users | `printf()` — clear results |
| Verbose | `--verbose`/`-v` | Power users | `logf()` — transaction audit |
| Debug | `--debug` | Developers | `debugf()` — internal execution |
| Trace | (tool-specific) | Framework authors | `tracing` — system-level flow |

Recommended flag format: `--verbosity={quiet|brief|verbose|debug|trace}`

Key principle: **not all commands need all verbosity modes** — tools should only expose tiers relevant to their context.

### Symfony Console (PHP reference implementation)

[Symfony's console verbosity system](https://symfony.com/doc/current/console/verbosity.html) is the most implementation-complete reference found. It provides a 6-level hierarchy:

```php
OutputInterface::VERBOSITY_SILENT    // -2: suppress all including errors
OutputInterface::VERBOSITY_QUIET     // -1: suppress output, show errors
OutputInterface::VERBOSITY_NORMAL    //  0: default - useful messages only
OutputInterface::VERBOSITY_VERBOSE   //  1: increased detail
OutputInterface::VERBOSITY_VERY_VERBOSE // 2: non-essential informative messages
OutputInterface::VERBOSITY_DEBUG     //  3: all messages for debugging
```

Environment variable `SHELL_VERBOSITY` enables global control. This is the gold standard for typed, structured verbosity in CLI output.

### Cognitive Load Theory Applied to Developer Onboarding

Research on Adaptive Explainable AI ([ResearchGate 2025](https://www.researchgate.net/publication/393345967_Adaptive_Explainable_AI_Personalizing_Machine_Explanations_Based_on_User_Expertise_Levels)) demonstrates:

- Adaptive explanations improve understanding by **+27%** vs. static
- Trust calibration improves by **+19%**
- Decision-making accuracy improves by **+22%**
- Cognitive load efficiency is **35% higher** in adaptive groups

This validates the theoretical foundation for AIOS's `GreetingPreferenceManager` — adapting greeting verbosity to user profile has measurable UX benefit beyond aesthetics.

---

## Research Question 3: Greeting / Welcome Customization in AI Coding Assistants

### Survey of First-Run Implementations

| Tool | First-Run Detection | Greeting | Returning User |
|------|---------------------|---------|----------------|
| Claude Code | None detected | None | No distinction |
| Aider | None | None | No distinction |
| Codex CLI | None | None | Profile-based (manual) |
| Gemini CLI | Theme + auth prompt | Theme picker | Skips onboarding |
| GitHub Copilot CLI | None | Animated banner | No distinction |
| Goose (block/goose) | None | None | --verbose flag only |
| Fish Shell | `fish_greeting` function | "Welcome to fish..." | Same greeting always |

**Finding:** Gemini CLI is the only AI coding tool with a genuine first-run/returning-user distinction at the greeting layer. Its approach is UI-preference-focused (theme), not capability/verbosity-focused. No tool adapts greeting content based on detected user expertise.

### Fish Shell `fish_greeting` Pattern

Fish shell implements a customizable greeting via a `fish_greeting` function called on every interactive shell start. The function is overridable — users can inject time-of-day, system stats, or any dynamic content:

```fish
function fish_greeting
    echo "Welcome back, $USER. Sessions today: "(count *.log)"."
end
```

Key design principle: `fish_greeting` is only called in interactive contexts (not `scp`, not scripts). This is directly analogous to AIOS needing to suppress greeting output in `--print` / pipe / non-interactive contexts.

**Gap identified:** Fish has the mechanism but no intelligence layer. AIOS can combine the mechanism (configurable greeting function) with an intelligence layer (profile-based resolution).

---

## Research Question 4: User Profiling in CLI Tools (Beginner / Intermediate / Advanced)

### Dominant Pattern: Explicit Configuration

The field relies almost entirely on **explicit user configuration** — users must self-select their verbosity level. There is no tool found that automatically infers expertise level from usage patterns.

**Explicit configuration approaches:**

1. **Flag-based (transient):** `--verbose`, `-v`, `--quiet` — must be specified each invocation
2. **Config file (persistent):** stored in `~/.tool/config.toml`, `~/.gemini/settings.json`, `.claude/settings.json`
3. **Profile-based (Codex CLI):** named profiles in config, switched via `--profile <name>`
4. **Environment variable:** `AIDER_VERBOSE`, `SHELL_VERBOSITY`, `DEBUG`

### Emerging Pattern: Implicit Inference

Research points to implicit inference becoming viable in 2025:

**Usage-based signals:**
- Session count (first-time vs. returning)
- Command frequency and complexity
- Help page access patterns
- Error rate and recovery behavior

**Interaction-based signals (from adaptive XAI research):**
- Speed of task completion
- Whether user reads full output or scrolls past
- Use of advanced flags or only basic commands
- Configuration file presence (indicates experience)

**Current gap:** No production AI CLI tool implements implicit expertise inference. The AIOS approach of resolving from explicit user profile (`beginner/intermediate/advanced`) stored in config is the **current industry best practice** — and an improvement over tools that offer no personalization.

### Comparable Pattern: Azure CLI Interactive Mode

Azure CLI's `az interactive` mode provides contextual guidance and autocomplete — effectively a "beginner mode" that can be toggled. This is the closest to explicit mode-switching in enterprise CLI tools, though it's not automatically applied based on detected expertise.

---

## Research Question 5: Open-Source Adaptive Greeting Systems

### Codex CLI Agent Skills — Progressive Disclosure Pattern

The [Codex Skills](https://developers.openai.com/codex/skills/) system implements progressive disclosure at the content level:

- On startup: load **only names and descriptions** of skills (lightweight)
- On request: load **full SKILL.md** file (heavyweight, on-demand)
- Mode skills can be set to appear in a "Mode Commands" section (e.g., `expert-mode`, `review-mode`)

This pattern maps to AIOS greeting: show minimal metadata by default, expand to full archetypal greeting only when profile warrants it.

### Claude Code Router — Progressive Disclosure for Agent Tools

A [community blog post](https://github.com/musistudio/claude-code-router/blob/main/blog/en/progressive-disclosure-of-agent-tools-from-the-perspective-of-cli-tool-style.md) documents the progressive disclosure approach for Claude Code:

```
Entry level:     --help → domains list
Intermediate:    domain --help → sub-commands
Advanced:        sub-command --help → full option reference
```

This mirrors the greeting tier concept: entry-level users get summary, advanced users unlock detail.

### Adobe Brackets Preferences System (Reference Architecture)

The [Adobe Brackets preferences system](https://github.com/adobe/brackets/wiki/Preferences-System) demonstrates scope-aware user preferences:

```javascript
prefs.set("greeting", "Namaste", { location: { scope: "user" } })
prefs.set("greeting", "Welcome", { location: { scope: "project" } })
```

Scopes: `user` (global) → `project` (repo) → `session` (transient). This scope hierarchy directly applies to AIOS's greeting preference resolution.

### Symfony Console — Best Implementation Reference

For code-level implementation, [Symfony's approach](https://symfony.com/doc/current/console/verbosity.html) is the industry reference:

```php
// Check level before emitting output
if ($output->isVerbose()) {
    $output->writeln('Extended greeting details...');
}

// Or pass level as constant to writeln
$output->writeln('Minimal greeting', OutputInterface::VERBOSITY_QUIET);
$output->writeln('Named greeting', OutputInterface::VERBOSITY_NORMAL);
$output->writeln('Archetypal greeting', OutputInterface::VERBOSITY_VERBOSE);
```

The JavaScript equivalent for AIOS could be:

```javascript
class GreetingPreferenceManager {
  resolve(userProfile) {
    const map = {
      beginner: 'archetypal',    // Full persona greeting
      intermediate: 'named',     // Name + brief context
      advanced: 'minimal',       // Just the agent name
      auto: this._infer(userProfile)
    };
    return map[userProfile.greetingLevel] ?? map.auto;
  }

  _infer(profile) {
    if (profile.sessionCount < 3) return 'archetypal';
    if (profile.sessionCount < 20) return 'named';
    return 'minimal';
  }
}
```

---

## Specific Projects and Tools Found

| Tool/Resource | URL | Relevance |
|--------------|-----|-----------|
| Claude Code verbosity feature request | [Issue #21246](https://github.com/anthropics/claude-code/issues/21246) | Shows unmet demand for verbosity control |
| Claude Code verbose persistence bug | [Issue #7012](https://github.com/anthropics/claude-code/issues/7012) | Shows fragility of current verbosity |
| Codex CLI verbosity discussion | [Discussion #3946](https://github.com/openai/codex/discussions/3946) | Verbosity flags not working as expected |
| Aider options reference | [aider.chat/docs/config/options.html](https://aider.chat/docs/config/options.html) | --verbose only, no greeting system |
| Gemini CLI configuration | [google-gemini/gemini-cli config docs](https://google-gemini.github.io/gemini-cli/docs/get-started/configuration.html) | Best first-run vs returning-user pattern |
| Gemini CLI themes | [geminicli.com/docs/cli/themes](https://geminicli.com/docs/cli/themes/) | Preference persistence to settings.json |
| Claude Code CLI reference | [code.claude.com/docs/en/cli-reference](https://code.claude.com/docs/en/cli-reference) | --verbose flag, no user profile |
| CLIG.dev (CLI Guidelines) | [clig.dev](https://clig.dev/) | TTY detection, quiet/verbose, progressive disclosure |
| Ubuntu verbosity specification | [discourse.ubuntu.com](https://discourse.ubuntu.com/t/cli-verbosity-levels/26973) | 5-tier verbosity model |
| Symfony Console verbosity | [symfony.com/doc](https://symfony.com/doc/current/console/verbosity.html) | Best code-level reference implementation |
| Fish shell fish_greeting | [fishshell.com/docs](https://fishshell.com/docs/current/cmds/fish_greeting.html) | Customizable greeting, interactive-only |
| Progressive disclosure UX | [NN/g](https://www.nngroup.com/articles/progressive-disclosure/) | Canonical UX reference |
| Adaptive XAI personalization | [ResearchGate 2025](https://www.researchgate.net/publication/393345967_Adaptive_Explainable_AI_Personalizing_Machine_Explanations_Based_on_User_Expertise_Levels) | +27% comprehension improvement |
| CLI progressive disclosure (blog) | [claude-code-router blog](https://github.com/musistudio/claude-code-router/blob/main/blog/en/progressive-disclosure-of-agent-tools-from-the-perspective-of-cli-tool-style.md) | Progressive disclosure for agent tools |
| Codex Skills (progressive disclosure) | [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills/) | Load detail on demand |
| Zapier CLI best practices | [zapier.com/engineering/how-to-cli](https://zapier.com/engineering/how-to-cli/) | -v flag, config file patterns |

---

## Code Examples and Patterns

### Pattern 1: TTY-Based Context Detection (CLIG.dev)

The most fundamental adaptive pattern — detect whether output is going to a human or a machine:

```javascript
const isInteractive = process.stdout.isTTY;

function greetAgent(agent, userProfile) {
  if (!isInteractive) return; // No greeting in pipe/script contexts

  const level = greetingManager.resolve(userProfile);
  return agent.greet(level);
}
```

### Pattern 2: Config-File-Based Profile (Gemini CLI pattern)

Persist user preferences on first run, resolve on subsequent runs:

```javascript
// ~/.aios/preferences.json
{
  "greetingLevel": "auto",
  "sessionCount": 42,
  "firstRunAt": "2026-01-15T10:23:00Z",
  "lastRunAt": "2026-02-21T09:00:00Z",
  "userProfile": "advanced"
}
```

Resolution logic:

```javascript
function resolveGreetingLevel(prefs) {
  if (prefs.greetingLevel !== 'auto') return prefs.greetingLevel;

  // Implicit inference fallback
  if (prefs.sessionCount < 3) return 'archetypal';
  if (prefs.sessionCount < 20) return 'named';
  return 'minimal';
}
```

### Pattern 3: Symfony-Inspired Verbosity Constants

Map greeting levels to constants for type safety:

```javascript
const GREETING_LEVEL = {
  NONE: 0,       // No greeting (--quiet, CI contexts)
  MINIMAL: 1,    // Agent name only ("Dex ready.")
  NAMED: 2,      // Name + role ("Dex (Dev) | Story NOG-9")
  ARCHETYPAL: 3, // Full persona activation with lore
};

class GreetingPreferenceManager {
  constructor(userProfile, config) {
    this._profile = userProfile;
    this._config = config;
  }

  resolve() {
    const override = this._config.get('greetingLevel');
    if (override && override !== 'auto') {
      return GREETING_LEVEL[override.toUpperCase()] ?? GREETING_LEVEL.NAMED;
    }
    return this._infer();
  }

  _infer() {
    const { type, sessionCount } = this._profile;
    if (type === 'advanced' || sessionCount > 20) return GREETING_LEVEL.MINIMAL;
    if (type === 'intermediate' || sessionCount > 3) return GREETING_LEVEL.NAMED;
    return GREETING_LEVEL.ARCHETYPAL;
  }
}
```

### Pattern 4: Scoped Preference Override (Adobe Brackets pattern)

```javascript
// Resolution order: session > project > user > system default
const greetingLevel =
  session.get('greetingLevel') ??
  project.get('greetingLevel') ??
  user.get('greetingLevel') ??
  'auto';
```

### Pattern 5: Codex Skills Progressive Disclosure Mapping

```javascript
// Load greeting metadata on agent startup (lightweight)
const greetingMeta = {
  'dex': { name: 'Dex', role: 'Dev' },
  'quinn': { name: 'Quinn', role: 'QA' },
};

// Load full persona only when archetypal level is resolved
async function getGreeting(agentId, level) {
  if (level === GREETING_LEVEL.ARCHETYPAL) {
    return await loadFullPersona(agentId); // On-demand
  }
  return greetingMeta[agentId]; // Already in memory
}
```

---

## Relevance to AIOS GreetingPreferenceManager

### Current State Assessment

The AIOS `GreetingPreferenceManager` already implements a concept (profile-based greeting resolution) that **no existing AI CLI tool provides**. The field offers:

- Verbosity flags (all tools) — but not mapped to user expertise
- First-run detection (Gemini CLI) — but only for UI theme preferences
- Persona configuration (Copilot CLI) — but not greeting-level specific
- Config file persistence (all tools) — but manual, not adaptive

### Specific Improvements Suggested by Research

1. **Add TTY detection** — suppress greeting entirely when not in interactive context (CLIG.dev pattern)
2. **Add session counter** — increment on each interactive launch; use for implicit `auto` resolution
3. **Add scope hierarchy** — session > project > user > default (Adobe Brackets pattern)
4. **Add `--quiet`/`--greeting=none` CLI flag** — for CI/automation contexts (Ubuntu spec)
5. **Persist `greetingLevel` preference** — explicitly set preference should survive across sessions (fix Claude Code's persistence bug pattern)
6. **Lazy-load archetypal content** — only load full persona text when `archetypal` level is resolved (Codex Skills pattern)

---

## Prioritized Recommendations

### P0 — Critical (Correctness)

**P0.1: TTY-Based Suppression**
- Suppress greeting output entirely when `!process.stdout.isTTY` (pipe/script contexts)
- Prevents greeting from polluting programmatic output
- Reference: CLIG.dev, Claude Code `--print` mode

**P0.2: Persistent Preference Storage**
- The resolved greeting preference must persist across sessions in `~/.aios/preferences.json` or equivalent
- Current risk: if preference is resolved in memory only, it resets on each run (Claude Code's known bug)

### P1 — High (Core Enhancement)

**P1.1: Implicit `auto` Resolution via Session Count**
- When `greetingLevel = 'auto'`, infer from `sessionCount`:
  - `< 3`: `archetypal` (new user, build rapport)
  - `3-20`: `named` (familiar, professional)
  - `> 20`: `minimal` (expert, efficiency-first)
- Reference: Adaptive XAI research (+27% comprehension), Codex profile system

**P1.2: CLI Flag Override**
- Expose `--greeting=minimal|named|archetypal|none` flag
- Allow one-time override without modifying stored config
- Reference: Ubuntu verbosity spec, CLIG.dev

**P1.3: Greeting Preference API in Config**
- Add `greetingLevel` to `.aios-core/core-config.yaml` or user settings
- Document auto/minimal/named/archetypal as valid values
- Reference: Gemini CLI `settings.json`, Codex `config.toml` profiles

### P2 — Medium (Quality of Life)

**P2.1: Scope Hierarchy for Override**
- Support: `session CLI flag > project .claude/settings.json > user ~/.aios/preferences.json > default`
- Allows project-level greeting configuration (e.g., always minimal in CI projects)
- Reference: Adobe Brackets preferences scoping

**P2.2: Lazy Loading for Archetypal Persona Content**
- Archetypal greeting content (persona lore, ASCII art, full activation text) should be loaded on demand, not on every startup
- Reduces startup latency for non-archetypal users
- Reference: Codex Skills progressive disclosure

**P2.3: Session Count Tracking**
- Increment session counter in preferences file on each interactive launch
- Expose `aios info --session-count` for transparency
- Use counter as primary signal for `auto` resolution

### P3 — Low (Future / Research)

**P3.1: Behavioral Signal Collection**
- Track: help page access frequency, command complexity, error rate
- Use as secondary signals for implicit expertise inference
- Reference: Adaptive XAI research, user modeling surveys

**P3.2: User-Adjustable Level via Command**
- `aios config set greeting minimal` — modify stored preference without editing YAML
- Reference: Gemini CLI `/settings` in-session command, `fish_greeting` pattern

**P3.3: Time-of-Day / Context Variants**
- Fish shell pattern: greeting can vary by time of day, git repo context, etc.
- Low priority but aligns with archetypal persona depth

---

## Gaps and Unknowns

1. **No industry precedent for expertise-adaptive greeting** — AIOS is pioneering this. Absence of prior art is both an opportunity and a risk (no battle-tested patterns to copy).

2. **Async resolution not yet studied** — The current `GreetingPreferenceManager` is noted as a "simple sync lookup." If profile is fetched from a remote source (future), async resolution will be needed. No research found on async greeting pattern in CLIs.

3. **Multi-agent greeting coordination** — When multiple agents activate in sequence (epic execution), do all greet? Does the first greeting suppress subsequent ones? Not studied; no industry analogue found.

4. **A/B testing for greeting effectiveness** — No CLI tool found that A/B tests greeting verbosity. Unclear if `archetypal` greetings improve retention vs. `minimal` — the XAI research suggests it matters, but direct CLI evidence is absent.

---

## Sources

- [Claude Code Feature Request: Output Verbosity Controls](https://github.com/anthropics/claude-code/issues/21246)
- [Claude Code Verbose Persistence Bug](https://github.com/anthropics/claude-code/issues/7012)
- [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [Codex CLI Verbosity Discussion](https://github.com/openai/codex/discussions/3946)
- [Aider Options Reference](https://aider.chat/docs/config/options.html)
- [Gemini CLI Configuration](https://google-gemini.github.io/gemini-cli/docs/get-started/configuration.html)
- [Gemini CLI Themes](https://geminicli.com/docs/cli/themes/)
- [CLI Guidelines (CLIG.dev)](https://clig.dev/)
- [Ubuntu CLI Verbosity Levels Specification](https://discourse.ubuntu.com/t/cli-verbosity-levels/26973)
- [Symfony Console Verbosity Documentation](https://symfony.com/doc/current/console/verbosity.html)
- [Fish Shell fish_greeting Documentation](https://fishshell.com/docs/current/cmds/fish_greeting.html)
- [Progressive Disclosure — NN/g](https://www.nngroup.com/articles/progressive-disclosure/)
- [Adaptive Explainable AI Research — ResearchGate 2025](https://www.researchgate.net/publication/393345967_Adaptive_Explainable_AI_Personalizing_Machine_Explanations_Based_on_User_Expertise_Levels)
- [Claude Code Router — Progressive Disclosure Blog](https://github.com/musistudio/claude-code-router/blob/main/blog/en/progressive-disclosure-of-agent-tools-from-the-perspective-of-cli-tool-style.md)
- [Codex CLI Agent Skills](https://developers.openai.com/codex/skills/)
- [Zapier CLI Best Practices](https://zapier.com/engineering/how-to-cli/)
- [Adobe Brackets Preferences System](https://github.com/adobe/brackets/wiki/Preferences-System)
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)
- [Goose AI Agent CLI](https://github.com/block/goose)
- [Rethinking CLI Interfaces for AI](https://www.notcheckmark.com/2025/07/rethinking-cli-interfaces-for-ai/)
- [Personalized Explainable AI: Dynamic Adjustment for Novice and Expert Users](https://www.researchgate.net/publication/396115896_Personalized_Explainable_AI_Dynamic_Adjustment_of_Explanations_for_Novice_and_Expert_Users)
