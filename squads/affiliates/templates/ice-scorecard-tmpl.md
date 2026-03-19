# ICE Scorecard — {PROJECT_OR_PERIOD}

> **Template:** ice-scorecard-tmpl.md
> **Version:** 1.0.0
> **Used by:** `tasks/prioritize-experiments.md`, `tasks/monthly-review.md`
> **Agent:** growth-optimizer (Sean Ellis — ICE Scoring Framework)
> **Format:** Experiment/action prioritization using Impact, Confidence, Ease

---

<!-- CONFIG
Project/Niche: {PROJECT_NAME}
Period: {PERIOD}
Decision Maker: {DECISION_MAKER}
Date: {SCORING_DATE}
-->

---

## ICE Scoring Guide

**Formula:** ICE Score = (Impact + Confidence + Ease) / 3

| Dimension | Scale | What to Score |
|-----------|-------|---------------|
| **Impact** | 1–10 | How much will this move the North Star Metric if it works? |
| **Confidence** | 1–10 | How confident are we it will work? (data, tests, evidence) |
| **Ease** | 1–10 | How easy is it to implement? (time, resources, complexity) |

**Scoring guidance:**

| Score | Impact | Confidence | Ease |
|-------|--------|-----------|------|
| 10 | 10x growth potential | Proven by A/B test | < 1 hour |
| 7–9 | Significant uplift (>20%) | Strong analogies/data | < 1 day |
| 4–6 | Moderate impact (5–20%) | Reasonable hypothesis | < 1 week |
| 1–3 | Minimal impact (<5%) | Speculation only | > 1 week |

---

## Decision Thresholds

| ICE Score | Decision | Action |
|-----------|---------|--------|
| >= 7.0 | **EXECUTE** | Prioritize immediately — this quarter |
| 5.0 – 6.9 | **SCHEDULE** | Plan for next sprint/month |
| 3.0 – 4.9 | **BACKLOG** | Keep for low-bandwidth periods |
| < 3.0 | **DISCARD** | Not worth the opportunity cost |

---

## Scorecard

| # | Experiment / Action | Impact (1–10) | Confidence (1–10) | Ease (1–10) | ICE Score | Priority | Owner | Deadline |
|---|--------------------|--------------:|------------------:|------------:|:---------:|---------|-------|---------|
| 1 | {EXP_1} | {I1} | {C1} | {E1} | {ICE_1} | {PRIO_1} | {OWNER_1} | {DL_1} |
| 2 | {EXP_2} | {I2} | {C2} | {E2} | {ICE_2} | {PRIO_2} | {OWNER_2} | {DL_2} |
| 3 | {EXP_3} | {I3} | {C3} | {E3} | {ICE_3} | {PRIO_3} | {OWNER_3} | {DL_3} |
| 4 | {EXP_4} | {I4} | {C4} | {E4} | {ICE_4} | {PRIO_4} | {OWNER_4} | {DL_4} |
| 5 | {EXP_5} | {I5} | {C5} | {E5} | {ICE_5} | {PRIO_5} | {OWNER_5} | {DL_5} |
| 6 | {EXP_6} | {I6} | {C6} | {E6} | {ICE_6} | {PRIO_6} | {OWNER_6} | {DL_6} |
| 7 | {EXP_7} | {I7} | {C7} | {E7} | {ICE_7} | {PRIO_7} | {OWNER_7} | {DL_7} |
| 8 | {EXP_8} | {I8} | {C8} | {E8} | {ICE_8} | {PRIO_8} | {OWNER_8} | {DL_8} |
| 9 | {EXP_9} | {I9} | {C9} | {E9} | {ICE_9} | {PRIO_9} | {OWNER_9} | {DL_9} |
| 10 | {EXP_10} | {I10} | {C10} | {E10} | {ICE_10} | {PRIO_10} | {OWNER_10} | {DL_10} |

*ICE Score = Average of three dimensions. Sort descending by ICE Score.*

---

## Sorted Priority Queue

*(Auto-fill after scoring — highest ICE first)*

### EXECUTE (ICE >= 7.0)

| Rank | Experiment | ICE | Owner | Deadline |
|------|-----------|-----|-------|---------|
| 1 | {TOP_EXP_1} | {TOP_ICE_1} | {TOP_OWNER_1} | {TOP_DL_1} |
| 2 | {TOP_EXP_2} | {TOP_ICE_2} | {TOP_OWNER_2} | {TOP_DL_2} |
| 3 | {TOP_EXP_3} | {TOP_ICE_3} | {TOP_OWNER_3} | {TOP_DL_3} |

### SCHEDULE (ICE 5.0–6.9)

| Rank | Experiment | ICE | Owner | Deadline |
|------|-----------|-----|-------|---------|
| 1 | {SCHED_EXP_1} | {SCHED_ICE_1} | {SCHED_OWNER_1} | {SCHED_DL_1} |
| 2 | {SCHED_EXP_2} | {SCHED_ICE_2} | {SCHED_OWNER_2} | {SCHED_DL_2} |

### BACKLOG (ICE 3.0–4.9)

| Experiment | ICE | Notes |
|-----------|-----|-------|
| {BKL_EXP_1} | {BKL_ICE_1} | {BKL_NOTES_1} |
| {BKL_EXP_2} | {BKL_ICE_2} | {BKL_NOTES_2} |

### DISCARDED (ICE < 3.0)

| Experiment | ICE | Reason Discarded |
|-----------|-----|-----------------|
| {DISC_EXP_1} | {DISC_ICE_1} | {DISC_REASON_1} |

---

## Scoring Notes & Assumptions

{SCORING_NOTES}

<!-- Document key assumptions behind high or controversial scores.
Example: "EXP_3 received Confidence 8 based on A/B test result from competitor site (Ahrefs SERP data showing 34% CTR lift from headline change similar to our planned test)." -->

---

## North Star Metric Context

**This project's North Star:** {NORTH_STAR_METRIC}
**Current value:** {NSM_CURRENT}
**Target (90 days):** {NSM_TARGET}

All Impact scores are calibrated against this North Star. An Impact-10 experiment would move the NSM by {NSM_10X_DEFINITION}.

---

## Review Schedule

| Review | Date | Attendees |
|--------|------|----------|
| Week 1 check-in | {WEEK1_DATE} | {ATTENDEES} |
| Month-end review | {MONTH_END_DATE} | {ATTENDEES} |
| Quarter retrospective | {QUARTER_DATE} | {ATTENDEES} |

---

*Scorecard by growth-optimizer — Affiliates Squad v1.0*
*Framework: Sean Ellis — ICE Scoring (Growth Hacking methodology)*
