# SEO Expert Squad

Post-design SEO optimization squad for AIOS-built websites. Evaluates, optimizes, and reports — like Yoast/RankMath but as intelligent agents.

## Workflow

```
Phase 1: AUDIT          Phase 2: OPTIMIZE       Phase 3: REPORT
Score 0-100         -->  Apply all fixes     -->  Re-score + Before/After
(all agents evaluate)    (agents fix issues)      (comparison report)
```

## Scoring System (0-100)

| Category | Weight | Agent | Based On |
|----------|--------|-------|----------|
| On-Page SEO | 25 pts | on-page-optimizer | Joost de Valk + Bhanu Ahluwalia |
| Technical SEO | 20 pts | technical-auditor | Dan Sharp + Cyrus Shepard |
| Schema/Structured Data | 15 pts | schema-architect | Jason Barnard |
| Content Quality (E-E-A-T) | 15 pts | content-quality-assessor | Marie Haynes + Koray GUBUR |
| Performance (CWV) | 10 pts | performance-engineer | Google Core Web Vitals |
| AI Visibility (GEO) | 10 pts | ai-visibility-optimizer | Mike King + GEO Research |
| Site Architecture | 5 pts | site-architect | Bruce Clay |

## Grade Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A+ | Excellent — competitive advantage |
| 80-89 | A | Great — minor improvements possible |
| 70-79 | B | Good — some optimization needed |
| 50-69 | C | Needs Work — significant gaps |
| 30-49 | D | Poor — major issues |
| 0-29 | F | Critical — fundamental SEO missing |

## Agents (8)

| Agent | Tier | Role | Mind Source |
|-------|------|------|------------|
| seo-chief | T0 | Orchestrator, scoring, reporting | Aleyda Solis |
| on-page-optimizer | T1 | Meta tags, titles, keywords, readability | Joost de Valk + Bhanu Ahluwalia |
| technical-auditor | T1 | Crawlability, links, canonicals, indexability | Dan Sharp + Cyrus Shepard |
| schema-architect | T1 | JSON-LD, structured data, entity SEO | Jason Barnard |
| content-quality-assessor | T2 | E-E-A-T, trust signals, topical authority | Marie Haynes + Koray GUBUR |
| performance-engineer | T2 | Core Web Vitals, Lighthouse, speed | Google CWV Framework |
| ai-visibility-optimizer | T2 | GEO, llms.txt, machine readability | Mike King + GEO Research |
| site-architect | T2 | URL structure, siloing, internal linking | Bruce Clay |

## Commands

- `*seo-audit-optimize` — Full cycle: evaluate, optimize, report
- `*seo-evaluate` — Audit only, score 0-100
- `*seo-optimize` — Optimize only (requires prior audit)
- `*seo-report` — Generate before/after report

## Usage

After finishing website design:
1. Activate: `@seo:seo-chief`
2. Run: `*seo-audit-optimize`
3. Review the 0-100 score and improvement report
