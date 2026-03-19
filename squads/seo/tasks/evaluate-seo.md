# evaluate-seo

## Task: Full SEO Evaluation (Score 0-100)

### Metadata
- **executor:** seo-chief (orchestrates all agents)
- **elicit:** true
- **mode:** parallel-then-aggregate
- **output:** seo-audit-report.md + seo-scores.json

### Inputs Required
```
target: URL or local project path to evaluate
focus_keyphrases: (optional) primary keyphrase per page
language: (optional, default: auto-detect)
```

### Elicitation
```
What is the target website or project path?
> [user provides URL or path]

Do you have specific focus keyphrases for each page? (optional — I can auto-detect)
> [user provides or skips]
```

### Execution Steps

#### Step 1: Page Discovery
- Crawl the site/project to identify all pages
- List pages with their URLs and detected page types
- Present page list to user for confirmation

#### Step 2: Parallel Agent Evaluation
Deploy all 7 specialist agents in parallel, each evaluating their domain:

| Agent | Category | Max Score |
|-------|----------|-----------|
| on-page-optimizer | On-Page SEO | /25 |
| technical-auditor | Technical SEO | /20 |
| schema-architect | Schema/Structured Data | /15 |
| content-quality-assessor | Content Quality (E-E-A-T) | /15 |
| performance-engineer | Performance (CWV) | /10 |
| ai-visibility-optimizer | AI Visibility (GEO) | /10 |
| site-architect | Site Architecture | /5 |

Each agent returns:
- Category score (0-max)
- Per-check breakdown with status (PASS/WARN/FAIL)
- List of issues found with severity
- List of fixable items

#### Step 3: Score Aggregation
- Sum all category scores for total (0-100)
- Assign grade: A+ (90+), A (80+), B (70+), C (50+), D (30+), F (0-29)
- Rank issues by impact (points recoverable x ease of fix)
- Identify quick wins (fixable automatically)

#### Step 4: Present Results
Use the seo-score-template to present:
- Overall score and grade
- Category breakdown table
- Top issues by impact
- Quick wins list
- Detailed findings per category

### Output Format
```markdown
# SEO Evaluation Report
**Target:** {url}
**Date:** {date}
**Score:** {total}/100 (Grade: {grade})

## Score Breakdown
| Category | Score | Max | Status |
|----------|-------|-----|--------|
| On-Page SEO | {score} | /25 | {emoji} |
| Technical SEO | {score} | /20 | {emoji} |
| Schema/Structured Data | {score} | /15 | {emoji} |
| Content Quality (E-E-A-T) | {score} | /15 | {emoji} |
| Performance (CWV) | {score} | /10 | {emoji} |
| AI Visibility (GEO) | {score} | /10 | {emoji} |
| Site Architecture | {score} | /5 | {emoji} |

## Top Issues (by impact)
1. {issue} — {points_recoverable} pts recoverable
2. ...

## Quick Wins (auto-fixable)
- {fix_1}
- {fix_2}

## Detailed Findings
### On-Page SEO ({score}/25)
{per_check_breakdown}
...
```

### Veto Conditions
- Cannot score without crawling at least 1 page
- Cannot present score without per-category breakdown
- Cannot skip any of the 7 categories
- Score MUST equal sum of category scores (no rounding tricks)

### Completion Criteria
- All 7 agents returned their category scores
- Total score calculated and grade assigned
- Issues ranked by impact
- Report generated in markdown format
- User can see exactly WHY each score was given
