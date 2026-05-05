# `.out-of-scope/` — Knowledge Base of Rejected Approaches

**Pattern adopted from:** [mattpocock/skills](https://github.com/mattpocock/skills) — searchable rejection memory.

---

## Why this folder exists

When something gets **rejected, paused, deleted, or proven not to work**, the knowledge tends to live in:
- A Slack message (gone)
- A commit message (hard to grep)
- MEMORY.md (overflow at 34KB and counting)
- Someone's head (lost cross-session)

This folder makes that knowledge **searchable** so the next agent doesn't propose the same dead-end.

---

## When to write a file here

Create a `{slug}.md` here when:

1. **Conclave / mind clones rejected an approach** with documented reasoning
2. **You tried it, it failed, root cause is non-obvious** (don't just say "didn't work")
3. **You paused something and may unpause later** — note the trigger condition
4. **A user correction overrode an approach** the squad almost defaulted to
5. **A vertical / market / segment is documented "do not enter"**

**Don't write here for:**
- Trivial bugs already fixed (commit message is enough)
- Backlog items deferred for time (use issue tracker)
- Anything sensitive (credentials, PII)

---

## File format

```markdown
# {Title — what was rejected}

**Status:** REJECTED / PAUSED / DEPRECATED
**Decided:** {ISO date}
**Decided by:** {agent / mind clone / user}
**Project:** {project-id}

## What was proposed
1-3 sentences. Concrete enough that a future agent grep-ing for the keyword finds it.

## Why it was rejected
The reasoning — not just "user said no". Include incident links, mind clone votes, data points.

## Trigger to revisit
What would have to change for this to be re-evaluated? (e.g., "if Meta CAPI hit-rate <40% for 14d", "if user explicitly asks again")

## Related
- Memory keys: `feedback_*`, `session_*`
- Cross-rejections: `./other-slug.md`
```

---

## Search patterns

```bash
# Pre-action check (before proposing anything)
grep -ri "{keyword}" .out-of-scope/

# Per-project rejections
grep -l "Project: tocks" .out-of-scope/*.md

# Recently revisable
grep -r "Trigger to revisit" .out-of-scope/ | head -20
```

---

## Index (alphabetical)

- `bretda-meta-events-with-value.md` — server-side `value` field cost real revenue
- `luxury-redesign-without-benchmark.md` — squad luxury design 4× failed without visual benchmark
- `meta-bulk-create-activate-fresh-account.md` — Meta API anti-spam blocks bulk-create+activate
- `mocked-database-tests.md` — integration tests must hit real DB
- `polymarket-non-weather-verticals.md` — politics/sports/finance empata mid-price
- `polymarket-synth-markets.md` — synth (capital travado) deletado no pivot
- `tocks-pivot-outcome-conversions.md` — 5/5 mind clones rejeitaram, OUTCOME_CONVERSIONS site
- `tocks-shopping-google-ads.md` — pausado, 1 conv/14d com bug conv_value=0
- `vorza-ai-creatives-generic.md` — 1ª rodada criativos AI rejeitada "aparência barata"
