---
id: researching
name: "Research & Data Collection"
whenToUse: |
  Creating agents that research topics, collect data from the web, verify facts,
  or produce structured research briefs.
  NOT for: data analysis/interpretation, content creation, strategic planning.
version: "1.0.0"
---

# Research & Data Collection — Best Practices

## Core Principles

1. **Source verification first** — Never include a finding without verifying it against at least one additional independent source. A single unverified source is flagged as "low confidence" and clearly marked.

2. **Freshness bias** — Prefer recent sources over older ones when the topic is time-sensitive. Always note the publication date of every source cited. Discard outdated data when newer, equally reliable data exists.

3. **Primary over secondary** — Always prefer original reports, official announcements, and first-party data over blog posts, aggregator articles, or opinion pieces. When secondary sources are used, trace them back to their original and cite both.

4. **Structured output** — Every research brief follows a consistent format: Key Findings, Trending Angles, Sources, Recommendations, and Gaps. This structure is non-negotiable regardless of topic complexity.

5. **Completeness check** — Before delivering a brief, verify that all sections are populated, all sources are accessible, and no key angle has been left unexplored. If a section is empty, explain why.

6. **Contradiction surfacing** — When sources disagree, present both sides with their respective evidence rather than choosing one. Let the consumer of the research make the judgment call.

7. **Access date logging** — Record when each source was accessed. Web content changes or disappears; documenting access dates protects the integrity of the research and allows later verification.

8. **Browser tool discipline** — Use native web search tools (WebSearch, web_fetch) for all public web research. Reserve browser automation (Playwright) for social media platforms, login-required pages, and visual/screenshot extraction. Never open a browser when a native search tool suffices.

## Techniques & Frameworks

### Information Landscape Mapping

Before starting any search, identify the key categories of sources relevant to the topic: industry publications, official company pages, government databases, social media, academic papers, news outlets. Prioritize categories by expected reliability and relevance. This creates a mental map that prevents tunnel vision and ensures diverse source coverage.

### Broad Search Sweep

Conduct an initial broad search across multiple source categories to establish the terrain. Collect 15-30 candidate sources. Note which angles are well-covered and which have gaps. The goal at this stage is breadth, not depth — you are surveying the landscape to decide where to focus.

### Deep-Dive Methodology

Select the 8-12 most promising sources from the broad sweep and extract detailed findings. Cross-reference claims across sources. Flag any contradictions or inconsistencies. This is where rigor matters: read beyond headlines, check methodology sections, look for caveats the authors buried in footnotes.

### Cross-Referencing

Compare data points across independent sources. Assign confidence levels based on corroboration:
- **High confidence**: 3 or more independent sources agree.
- **Medium confidence**: 2 sources agree.
- **Low confidence**: Single source or conflicting data.

When sources disagree, document both positions with their supporting evidence. Do not resolve contradictions by choosing a side — surface them transparently.

### Synthesis into Brief Format

Organize findings into the standard output format:
1. Write Key Findings as concise, cited statements with confidence levels.
2. Identify Trending Angles with lifecycle assessments (emerging, growth, mature, declining).
3. Compile the Sources table with type and relevance scores.
4. Draft actionable Recommendations grounded in the findings.
5. Document Gaps honestly — what you could not find is as valuable as what you did find.

### Self-Review Checklist

Before delivering any research brief, verify:
- Are all claims cited with source URLs?
- Are confidence levels assigned to every finding?
- Are gaps documented?
- Is the brief actionable for downstream consumers?
- Would a strategist or content creator be able to work from this without additional research?

### Decision Criteria

- **When to stop researching**: When additional sources confirm existing findings without adding new information (diminishing returns). When the brief covers all angles requested.
- **When to discard a source**: When the source has no clear authorship or institutional backing. When data is more than 2 years old for a time-sensitive topic. When claims cannot be independently verified. When the source has a documented history of unreliable reporting.
- **When to escalate**: When contradictory evidence is evenly weighted and you cannot determine which is more reliable. When the topic requires specialized domain expertise beyond general research. When access to key sources is restricted or paywalled.

## Tool Selection Guidelines

### When to Use Native Web Search

Use WebSearch / web_fetch for all publicly accessible pages: news sites, blogs, official documentation, Wikipedia, public company pages, search engine results. Native search is fast and headless — no browser window overhead, no session management, no risk of triggering bot detection.

### When to Use Browser Automation (Playwright)

Use Playwright browser tools for:
- Social media platforms (Instagram, Twitter/X, LinkedIn feed, YouTube channel pages)
- Any page that requires authentication or redirects to a login screen
- Pages where visual screenshot extraction is needed
- Dynamic content that does not render without JavaScript execution

When opening a browser for a social platform, inform the user they may need to log in if no saved session exists.

### General Rule

Default to native search. Escalate to browser automation only when native tools cannot access the content. This keeps research fast, lightweight, and less prone to failures from session timeouts or CAPTCHAs.

## Quality Criteria

- [ ] Topic and scope were confirmed before research began
- [ ] Time range was confirmed for temporal content
- [ ] All key findings include source URLs and access dates
- [ ] Confidence levels (high/medium/low) are assigned to every finding
- [ ] At least 2 independent sources corroborate each high-confidence finding
- [ ] Trending angles include lifecycle assessment (emerging/growth/mature/declining)
- [ ] Sources table includes type and relevance score for each source
- [ ] Gaps section is populated — even if gaps are minor
- [ ] Recommendations are actionable and grounded in the findings
- [ ] No opinions are presented as facts
- [ ] Contradictory evidence is surfaced, not suppressed
- [ ] Output follows the standard brief structure with all sections present

## Output Examples

### Example 1: Market Trend Research Brief

```
RESEARCH BRIEF
Topic: Growth of AI-powered code review tools in enterprise development
Time Range: January 2025 – February 2026
Prepared: 2026-02-28

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY FINDINGS

1. Enterprise adoption of AI code review tools grew 47% YoY in 2025,
   with the strongest growth in financial services and healthcare sectors.
   Confidence: HIGH
   Source: Gartner DevOps Hype Cycle Report, August 2025
   URL: https://www.gartner.com/en/documents/example-devops-2025
   Accessed: 2026-02-27

2. The three market leaders by enterprise seats are CodeRabbit (28% share),
   Sourcery (22% share), and Codacy (15% share) as of Q4 2025.
   Confidence: HIGH
   Source: IDC MarketScape: AI Code Quality Tools 2025
   URL: https://www.idc.com/getdoc.jsp?containerId=example-2025
   Accessed: 2026-02-27

3. Average reduction in critical bugs post-deployment after adopting AI
   code review is reported at 31-38% across surveyed enterprises (n=420).
   Confidence: MEDIUM — based on vendor-commissioned study; independent
   replication pending.
   Source: SmartBear State of Code Review 2025
   URL: https://smartbear.com/resources/ebooks/example-state-of-code-review/
   Accessed: 2026-02-26

4. Security-focused AI review (SAST integration) is the fastest-growing
   subsegment, with 62% of new enterprise contracts including security
   scanning as a core requirement.
   Confidence: HIGH
   Source: Snyk Annual AppSec Report 2025
   URL: https://snyk.io/reports/example-appsec-2025/
   Accessed: 2026-02-27

TRENDING ANGLES

- "Shift-left security via AI review" — Lifecycle: growth phase.
  Enterprises are bundling AI code review with SAST/DAST pipelines.
  Estimated 18-24 months before plateau.

- "AI reviewer fatigue" — Lifecycle: emerging.
  Early reports of developers disabling AI suggestions due to
  false-positive rates above 20%. Could become a counter-narrative
  by mid-2026.

- "Compliance-driven adoption" — Lifecycle: mature.
  Regulatory pressure (SOC2, HIPAA) is now the #2 driver of adoption
  behind productivity gains.

SOURCES

| #  | Source                              | Type      | Relevance | Date       |
|----|-------------------------------------|-----------|-----------|------------|
| 1  | Gartner DevOps Hype Cycle 2025      | Analyst   | 9/10      | 2025-08    |
| 2  | IDC MarketScape AI Code Quality     | Analyst   | 9/10      | 2025-11    |
| 3  | SmartBear State of Code Review      | Industry  | 7/10      | 2025-09    |
| 4  | Snyk AppSec Report 2025             | Industry  | 8/10      | 2025-10    |
| 5  | GitHub Octoverse 2025               | Platform  | 7/10      | 2025-11    |
| 6  | Stack Overflow Developer Survey     | Community | 6/10      | 2025-06    |
| 7  | InfoQ AI in DevOps Trends           | Media     | 5/10      | 2026-01    |

RECOMMENDATIONS

1. Position messaging around security-first AI review — this is the angle
   with the strongest enterprise buying signal right now.
2. Address the "reviewer fatigue" narrative proactively in content strategy,
   emphasizing low false-positive rates as a differentiator.
3. Produce a competitive comparison matrix using IDC data as the backbone.

GAPS

- No reliable data found on AI code review adoption in startups/SMBs
  (under 200 employees). All major studies focus on enterprise.
- Pricing comparison data across vendors is inconsistent; vendors use
  different unit models (per seat, per repo, per scan).
- No independent (non-vendor-commissioned) study on bug reduction rates
  was found within the specified time range.
```

### Example 2: Competitive Intelligence Brief

```
RESEARCH BRIEF
Topic: Competitive landscape for direct-to-consumer sustainable sneaker brands
Time Range: Q3 2025 – Q1 2026
Prepared: 2026-02-28

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY FINDINGS

1. Allbirds reported a 12% revenue decline in Q3 2025 and announced
   a pivot toward B2B material licensing as a new revenue stream.
   Confidence: HIGH
   Source: Allbirds Q3 2025 Earnings Call Transcript
   URL: https://investor.allbirds.com/example-q3-2025-earnings
   Accessed: 2026-02-26

2. Veja surpassed $500M in annual revenue for the first time in 2025,
   driven by expansion into Asian markets (Japan +85% YoY, South Korea +62% YoY).
   Confidence: HIGH
   Source: Veja Impact Report 2025 (official)
   URL: https://project.veja-store.com/en/example-impact-2025
   Accessed: 2026-02-27

3. Three new entrants gained significant traction in 2025: Thousand Fell
   (circular model, $28M Series B), Hilma Running (performance-sustainable
   hybrid, $15M seed), and Saye (European DTC, 340% Instagram growth).
   Confidence: MEDIUM — funding data confirmed via Crunchbase; social
   growth metrics self-reported by brands.
   Source: Crunchbase, TechCrunch, brand social profiles
   URLs: https://www.crunchbase.com/organization/example-thousand-fell
          https://techcrunch.com/2025/example-hilma-running/
   Accessed: 2026-02-27

4. Consumer sentiment analysis (Reddit, Twitter/X, TrustPilot) shows
   "durability" overtaking "carbon footprint" as the #1 purchase driver
   for sustainable sneakers in Q4 2025.
   Confidence: MEDIUM — based on NLP analysis of 12,400 public posts;
   methodology documented by Brandwatch.
   Source: Brandwatch Consumer Insights Q4 2025
   URL: https://www.brandwatch.com/reports/example-sustainable-fashion/
   Accessed: 2026-02-28

5. Resale and circular economy programs are now offered by 6 of the top
   10 sustainable sneaker brands, up from 2 of 10 in 2024.
   Confidence: HIGH
   Source: ThredUp Resale Report 2025, verified against brand websites
   URL: https://www.thredup.com/resale/example-2025
   Accessed: 2026-02-26

TRENDING ANGLES

- "Durability as the new sustainability" — Lifecycle: growth phase.
  Consumers are reframing sustainability around product longevity rather
  than materials sourcing. Strong narrative opportunity. 12+ months of
  runway before saturation.

- "Circular sneaker programs" — Lifecycle: early growth.
  Take-back and recycling programs are becoming table stakes. Brands
  without circular programs are starting to face earned media gaps.

- "B2B pivot for struggling DTC brands" — Lifecycle: emerging.
  Allbirds' material licensing move may signal a broader trend of
  sustainable brands monetizing R&D rather than consumer sales.

SOURCES

| #  | Source                               | Type      | Relevance | Date       |
|----|--------------------------------------|-----------|-----------|------------|
| 1  | Allbirds Q3 2025 Earnings Transcript | Financial | 9/10      | 2025-11    |
| 2  | Veja Impact Report 2025              | Official  | 9/10      | 2026-01    |
| 3  | Crunchbase Funding Data              | Database  | 8/10      | 2026-02    |
| 4  | TechCrunch Hilma Running Coverage    | Media     | 6/10      | 2025-09    |
| 5  | Brandwatch Consumer Insights Q4      | Analytics | 7/10      | 2026-01    |
| 6  | ThredUp Resale Report 2025           | Industry  | 8/10      | 2025-10    |
| 7  | Business of Fashion Sustainability   | Media     | 7/10      | 2026-02    |
| 8  | Saye Instagram Analytics (manual)    | Social    | 5/10      | 2026-02    |

RECOMMENDATIONS

1. Monitor Allbirds' B2B licensing strategy — if successful, it may
   reshape the competitive model for the entire category.
2. Invest content in the "durability" narrative; it aligns with current
   consumer sentiment and differentiates from pure eco-messaging.
3. Evaluate launching or expanding a circular/take-back program — this
   is approaching table-stakes status for credible sustainable brands.
4. Track the three new entrants (Thousand Fell, Hilma, Saye) quarterly;
   they represent the next generation of competitive threats.

GAPS

- No reliable sell-through data available for DTC-only brands (unlike
  wholesale brands tracked by NPD/Circana). Revenue comparisons are
  limited to public companies and self-reported figures.
- Environmental impact claims across brands use different methodologies
  (LCA scope varies), making direct comparison unreliable.
- China-based sustainable sneaker brands were excluded due to language
  barriers in source verification; this is a known blind spot.
```

## Anti-Patterns

### Never Do

1. **Present data without a source URL** — Every factual claim needs a traceable, clickable source. "According to industry reports" is never acceptable.
2. **Assume the research scope without confirmation** — Even if the topic seems obvious from context, always restate it and confirm scope before researching.
3. **Mix facts with opinions** — Keep factual findings and interpretive recommendations in separate, clearly labeled sections.
4. **Use a single source as proof** — One source is a lead, not a finding. Corroborate or flag as low confidence.
5. **Ignore contradictory evidence** — When sources disagree, present both sides. Suppressing contradictions is a research failure.
6. **Skip the time range question** — For temporal topics, assuming "recent" without clarification leads to misaligned expectations and wasted effort.
7. **Deliver unstructured output** — Raw notes, bullet dumps, or stream-of-consciousness summaries are not acceptable deliverables.

### Always Do

1. **Include access dates** — Web content changes or disappears. Access dates protect the integrity of the brief and allow verification.
2. **Note confidence levels** — Every key finding must have an explicit confidence rating (high, medium, low) with a brief justification.
3. **State what you could not find** — The Gaps section is mandatory. Documenting blind spots is as valuable as documenting findings.
4. **Cite the original source** — When a secondary source references primary data, trace back and cite the original. Include both if the secondary source adds context.

## Vocabulary Guidance

### Use

- "According to [source]..."
- "The data indicates..."
- "Confidence level: high/medium/low"
- "Primary source confirms..."
- "Accessed on [date]"
- "Contradictory evidence suggests..."
- "Gap identified:"

### Avoid

- "I think that..." — present evidence, not opinions
- "Everyone knows..." — nothing is assumed common knowledge
- "Source: the internet" — always cite specific URLs
- "Probably..." — quantify uncertainty with confidence levels instead
- "Trust me" — let the sources speak for themselves

### Tone Rules

- **Objective**: Present findings without editorial bias. Separate factual reporting from interpretation.
- **Evidence-based**: Every statement of fact is backed by a cited source. No unsupported claims.
- **Uncertainty-flagged**: When confidence is not high, say so explicitly. Use "Confidence: medium — based on two corroborating sources" rather than hedging language.
