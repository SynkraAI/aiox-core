# link-building-outreach

## Metadata
```yaml
task_id: AFF_SEO_009
agent: seo-content
type: creation
complexity: medium
estimated_time: "2h-4h per campaign cycle"
source: "White-Hat Link Acquisition Playbook — Guest Post + Niche Edit + HARO Framework"
```

## Purpose
Execute structured link building campaigns using guest posting, niche edits, and HARO/journalist outreach with documented templates, response rate tracking, and quality filters — ensuring every acquired link is contextually relevant, dofollow, and contributes positively to the Diggity Anchor Ratio targets defined in AFF_SEO_004.

## Prerequisites
- Link strategy (AFF_SEO_004) completed — monthly link targets and anchor budget confirmed
- Site has published content on the topic (required for outreach credibility)
- Email account with good sending reputation (G Suite preferred; not shared hosting email)
- Outreach tool set up: Pitchbox, Mailshake, Hunter.io, or manual Gmail with tracking
- Author bio page exists on the site (required for guest post pitches)
- HARO signup: helpareporter.com (free) for journalist source requests

## Steps

1. **Select campaign type** — Based on link strategy phase, determine which outreach type to run.
   - Phase 1: HARO + unlinked mention outreach
   - Phase 2: Guest post + niche edit outreach
   - Phase 3: All methods concurrently at scale
   - Multiple campaign types can run simultaneously if capacity allows

2. **Build prospect list — Guest Post** — Find sites accepting guest contributions in the niche.
   - Google search operators: `[niche keyword] "write for us"` | `"guest post" "niche keyword"` | `"contribute" "niche keyword"`
   - Ahrefs Content Explorer: find niche topics with "authored by" bylines on external posts
   - Filter out: DR < 20, no organic traffic, obvious PBNs (100+ outbound links per page)
   - Target: 30-50 qualified prospects per guest post campaign

3. **Build prospect list — Niche Edit** — Find existing content to add a link into.
   - Search for existing articles that would naturally reference your content
   - Search operators: `[niche keyword] inurl:blog` | `"useful resources" [niche]` | `[topic] "helpful links"`
   - Competitor backlink analysis: where do competitors have links? Can we get a link on the same page?
   - Target: 20-40 qualified prospects per niche edit campaign

4. **Find contact emails** — Locate editor or webmaster emails for each prospect.
   - Hunter.io: domain email finder (10 free/month)
   - Snov.io: alternative email finder
   - Manual: check About page, Contact page, social profiles (LinkedIn, Twitter)
   - Record email confidence score — only use "high confidence" emails for outreach

5. **Personalize outreach at scale** — Write custom opening line for each email.
   - Reference specific article they published, a recent update, or a specific point they made
   - Never use generic opening: "I love your blog" or "Great content on {site}"
   - Tools: Pitchbox or Mailshake allow custom field merge for personalization variables
   - Minimum personalization: {{custom_first_line}} variable per prospect (2-3 sentence personal observation)

6. **Send initial outreach batch** — Launch first wave of emails.
   - Batch size: 15-25 per day (avoid spam triggers from high daily volume)
   - Sending time: Tuesday-Thursday, 9am-11am in recipient's timezone (highest open rates)
   - Spacing: minimum 60 seconds between sends in same batch

7. **Track all outreach metrics** — Log every email and response in tracking sheet.
   - Sent date, prospect URL, DR, email address, open status, reply status, outcome
   - Update daily during active campaign
   - Calculate open rate, reply rate, link acquisition rate weekly

8. **Follow up on non-responses** — Send single follow-up after 7 days.
   - One follow-up only — never send more than 2 total emails to same prospect
   - Follow-up tone: friendly, brief, acknowledges they may be busy
   - No follow-up for bounced emails or unsubscribes (update list immediately)

9. **Negotiate and close** — Respond to positive replies and close the link.
   - For guest posts: send topic pitches (3 options), confirm link placement expectations upfront
   - For niche edits: confirm anchor text and link placement in the existing article
   - For HARO: respond within 1 hour of query (speed matters for selection)
   - Confirm all link terms before submitting content or payment

10. **Deliver and verify** — Submit content (if guest post) and verify link goes live.
    - Verify: link is dofollow, correct anchor text, links to correct URL on your site
    - Record in link tracking system with Ahrefs verification
    - Add to anchor text budget tracker (AFF_SEO_004 anchor ratio)

11. **Evaluate campaign performance** — After each campaign cycle, calculate efficiency.
    - Cost per link (if any payments made)
    - Time per link acquired
    - Average DR of acquired links
    - Anchor text profile contribution (did it move the needle toward Diggity Ratio targets?)

## Framework / Inline Structure

### Guest Post Outreach Template

```
Subject: Guest post idea for [their site name]: [specific topic angle]

Hi [First Name],

[PERSONALIZATION: Specific observation about their site, a recent article, or a gap you noticed]

I write about [niche topic] and noticed you cover similar content. I'd love to contribute
a guest post to [their site].

A few ideas that might fit your audience:
  1. [Article idea 1 — specific title]
  2. [Article idea 2 — specific title]
  3. [Article idea 3 — specific title]

I've previously written for [cite 1-2 comparable sites — establishes credibility].
You can see my work here: [link to author profile or best piece].

Happy to write something specific to your editorial guidelines.

Best,
[Name]
[Site URL]
```

### Niche Edit Outreach Template

```
Subject: Small suggestion for your [article title] post

Hi [First Name],

[PERSONALIZATION: Genuine compliment on a specific point in their article]

I noticed your article doesn't mention [relevant resource/angle]. I recently
published something on [topic] that covers [specific unique angle] — might be a
useful addition for your readers: [your URL]

If it's a fit, I'd appreciate a link — and if not, no worries at all!

[Name]
[Site URL]
```

### HARO Response Template

```
[HARO query details noted at top of response]

SOURCE INFO:
Name: [Full name]
Title: [Relevant title/role]
Site: [URL]
Email: [Contact email]

RESPONSE:

[Answer the journalist's specific question in 2-5 sentences — be direct and quotable]

[Add one supporting fact or data point — journalists prefer specifics]

[Optional: offer to provide more detail, additional sources, or a brief call]

Word count: ~150-250 (never more — journalists are busy)
```

### Link Quality Acceptance Criteria

```
ACCEPT (all must pass):
  [ ] DR >= 20 (target DR 30+)
  [ ] Site has real organic traffic (verify in Ahrefs)
  [ ] Link is dofollow (no sponsored/nofollow for link building purposes)
  [ ] Content on the linking page is topically relevant to your niche
  [ ] Anchor text matches your Diggity Ratio budget allocation
  [ ] No more than 50 outbound links on the linking page

REJECT (any one triggers rejection):
  [ ] Site-wide or footer link placement
  [ ] Links from non-relevant niche with no contextual connection
  [ ] PBN signals: no contact page, generic "our blog" content, thin site
  [ ] Requested unnatural anchor text (exact match without editorial context)
  [ ] Site is on Google's blocklist (check with Moz Spam Score > 60)
```

### Campaign Tracking Dashboard Fields

```
| Campaign | Type | Prospect URL | DR | Contact Email | Sent | Opened | Replied | Outcome | Link URL | Anchor | Cost |
|----------|------|--------------|----|--------------|------|--------|---------|---------|----------|--------|------|

Outcome options: LINKED | DECLINED | NO_RESPONSE | PENDING | IN_NEGOTIATION

Campaign Types: GUEST_POST | NICHE_EDIT | HARO | UNLINKED_MENTION
```

### Response Rate Benchmarks (2025-2026)

```
GUEST POST outreach:
  Open rate:     25-40%
  Reply rate:    5-15%
  Link rate:     3-8% of emails sent

NICHE EDIT outreach:
  Open rate:     20-35%
  Reply rate:    8-15%
  Link rate:     4-10% of emails sent

HARO responses:
  Selection rate: 5-15% of responses sent
  (Speed is the key variable — respond within 1 hour)

UNLINKED MENTION reclaim:
  Reply rate:    15-25%
  Link rate:     8-18% (warmest leads — they already know the site)
```

## Veto Conditions

- **HARD VETO:** Any prospect requests a "paid link" without editorial context or content requirement — do not pay for placed links with no editorial process; document and blacklist the domain (Google considers paid links without nofollow a violation)
- **HARD VETO:** Anchor text requested by prospect is exact-match keyword AND current profile already has exact match > 8% — decline the link or negotiate anchor text change; do not accept over-optimizing anchors
- **SOFT VETO:** Open rate < 15% after 25+ sends — campaign messaging is broken; pause, rewrite templates, re-test before continuing at scale

## Output

- **File:** `docs/seo/outreach/campaign-{date}-{campaign-type}.md` + tracking spreadsheet
- **Format:** Markdown + CSV/Spreadsheet

## Output Example

```yaml
# Outreach Campaign Report — Example Output (YAML summary)
campaign_id: "AFF-OUT-2026-001"
campaign_type: "GUEST_POST"
niche: "air purifiers"
campaign_period: "2026-02-01 to 2026-02-28"
phase: "Phase 2"

prospect_pipeline:
  identified: 54
  qualified: 41
  emails_found: 38
  emails_sent: 38

response_metrics:
  open_rate: "34%"
  reply_rate: "13%"
  positive_replies: 5
  declines: 3
  no_response: 30

outcomes:
  links_acquired: 4
  link_conversion_rate: "10.5%"  # 4/38
  articles_written: 4
  avg_dr_acquired: 36

anchor_text_used:
  - "air purifier buying guide" (partial match)
  - "airpureexpert.com" (naked URL)
  - "best air purifiers for allergies" (partial match)
  - "this review" (generic)
  note: "All within Diggity Ratio budget allocation"

cost:
  tools: "$49 (Hunter.io monthly)"
  content_writing: "$180 (4 articles × $45)"
  total: "$229"
  cost_per_link: "$57.25"

next_campaign:
  type: "NICHE_EDIT"
  target_start: "2026-03-01"
  target_links: 5-8
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
