# Weekly Plan

```yaml
id: weekly-plan
execution_type: Agent
purpose: Create a 7-Day Sprint content plan that balances documenting real moments with strategic content creation, following the 80/20 rule for maximum impact with minimum effort.
executor: @caleb-ralston
inputs:
  - Last week's content performance metrics (views, engagement, saves, shares)
  - Brand audit results or brand positioning context
  - Tiago's schedule and availability for the week
  - Any upcoming events, launches, or deadlines
preconditions:
  - Brand positioning is defined (thesis, audience, tone)
  - ICP research disponivel (`data/icp-research.md`) — dores, desejos, comportamento digital, dados reais
  - Content pillars are established (or use defaults from content-philosophy task)
  - Access to analytics from previous week
steps:
  1. Review last week's metrics:
     - Identify top 3 performing pieces (why did they work?)
     - Identify bottom 3 (why did they underperform?)
     - Extract patterns (topic, format, time posted, hook style)
  2. Mine 3 real moments from Tiago's week using "Document vs Create":
     - Conversations with clients (anonymized insights)
     - Personal realizations or observations
     - Behind-the-scenes of Next Step sessions
  3. Validate themes against ICP pains and desires:
     - Cross-reference each topic with ICP dores verbalizadas (Secao 1.2)
     - Ensure at least 1 piece per week addresses a purchase trigger (Secao 1.6)
     - Check: would the ICP SAVE this? (ICP salva: frameworks praticos, listas "pare de fazer X")
     - Check: would the ICP IGNORE this? (ICP ignora: motivacional generico, hustle porn, conselhos vagos)
  4. Apply 80/20 Rule to content mix:
     - 80% proven formats/topics (what already works)
     - 20% experimental (new format, new angle, new platform)
  5. Assign content types per day:
     - Monday: Pillar content (long-form or video)
     - Tuesday: Repurposed micro-content
     - Wednesday: Story-driven post (personal narrative)
     - Thursday: Educational/tactical post
     - Friday: Contrarian take or hot take
     - Saturday: Community engagement (reply, duet, stitch)
     - Sunday: Reflection or week-ahead teaser
  6. For each day, specify:
     - Content type (post, reel, carousel, story, newsletter)
     - Platform (primary + repurpose targets)
     - Topic/angle (1 sentence)
     - Hook direction (not full hook, just the approach)
  7. Set review checkpoint for mid-week (Wednesday evening)
  8. Define 1 weekly KPI to track (e.g., saves this week, DMs received)
outputs:
  - 7-day content calendar (markdown table) with:
    - Day, content type, platform, topic, hook direction
    - 3 documented moments marked for content
    - Weekly KPI target
    - Mid-week review date
validation:
  - All 7 days have assigned content
  - Mix includes both "document" and "create" content
  - 80/20 split is visible (majority proven, minority experimental)
  - Each entry has platform + format specified
  - Weekly KPI is measurable and specific
  - At least 1 content piece directly promotes Next Step
```
