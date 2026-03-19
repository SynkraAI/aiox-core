# Attention Audit

```yaml
id: attention-audit
execution_type: Agent
purpose: Audit attention economics across all platforms to identify where underpriced attention exists for Tiago's positioning, mapping optimal content formats per platform.
executor: @gary-vaynerchuk
inputs:
  - List of active platforms (Instagram, YouTube, TikTok, LinkedIn, Substack)
  - Current posting frequency per platform
  - Engagement metrics per platform (last 30 days)
  - Competitor/reference accounts in the same space
preconditions:
  - Tiago has accounts on target platforms
  - At least 30 days of content history available for analysis
steps:
  1. Audit each platform individually using Day Trading Attention framework:
     - Instagram: Reels reach vs. feed posts, Stories completion rate, carousel saves
     - YouTube: Shorts vs. long-form CTR, average view duration, subscriber conversion
     - TikTok: FYP reach, completion rate, comment quality
     - LinkedIn: Post impressions, comment depth, profile views from posts
     - Substack: Open rate, click rate, subscriber growth, free vs. paid engagement
  2. Identify underpriced attention opportunities:
     - Which platform gives most reach per effort right now?
     - Which format is algorithmically favored this month?
     - Where is the competition weakest for "clareza/direcionamento" niche?
  3. Map Platform-Native Rules per platform:
     - Instagram: Visual-first, hooks in first frame, trending audio
     - YouTube: Thumbnail + title = 80% of success, first 30s critical
     - TikTok: Raw/authentic beats polished, pattern interrupts
     - LinkedIn: Text-heavy, professional vulnerability, no links in post
     - Substack: Long-form depth, personal voice, email deliverability
  4. Assess volume vs. quality balance per platform:
     - Minimum viable posting frequency
     - Optimal posting frequency (diminishing returns threshold)
     - Content format that performs best on each
  5. Score each platform (1-10) on:
     - Audience fit (is Tiago's audience here?)
     - Effort-to-reach ratio
     - Conversion potential (path to Next Step)
     - Current traction
  6. Create prioritized platform stack:
     - Tier 1: Primary (daily effort)
     - Tier 2: Secondary (3x/week)
     - Tier 3: Experimental (1x/week)
outputs:
  - Platform Attention Report with:
    - Per-platform audit (metrics, rules, opportunities)
    - Underpriced attention map
    - Platform scores (audience fit, effort ratio, conversion, traction)
    - Prioritized platform stack (Tier 1/2/3)
    - Volume recommendations per platform
validation:
  - All 5 platforms audited with specific observations
  - Scores are justified with data or reasoning (not arbitrary)
  - Platform stack has clear Tier 1 recommendation with rationale
  - Volume recommendations are realistic for a one-person operation
  - At least 2 underpriced attention opportunities identified
```
