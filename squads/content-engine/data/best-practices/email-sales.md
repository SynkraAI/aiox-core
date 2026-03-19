---
name: "Sales Email"
platform: "email"
content_type: "sales"
description: "Direct response sales emails optimized for a single conversion action using persuasion frameworks"
whenToUse: |
  Creating agents that produce sales emails, cold outreach, or direct response email campaigns.
constraints:
  subject_line_max_chars: 60
  optimal_word_count: "100-300"
  cta_count: 1
version: "1.0.0"
---

## Platform Rules

- Sales emails live or die by the subject line. Open rates above 60% are achievable with well-crafted, personalized subject lines of 4-7 words. Generic subject lines land in spam or get ignored.
- Deliverability is the invisible prerequisite. HTML-heavy cold emails, attachments, and image-loaded templates trigger spam filters. Plain-text formatting with minimal links outperforms designed templates for cold outreach.
- Reply rate is the primary success metric, not open rate. A 3-5% positive reply rate is a strong baseline. Well-targeted campaigns with deep personalization can reach 15-30% reply rates.
- Cold emails must comply with CAN-SPAM, GDPR, and local regulations. Include a physical address and unsubscribe mechanism. Non-compliance risks fines and domain blacklisting.
- Send volume matters: limit cold outreach to 35-40 emails per day per sending address to protect domain reputation. Warming up new domains over 2-4 weeks is mandatory before scaling.
- Follow-up cadence drives results. 80% of conversions happen after the initial email. Follow up on days 3-4, 7-10, and 14. After 4-5 follow-ups with no response, stop.
- Warm emails (to existing leads or subscribers) tolerate slightly longer formats and HTML design. Cold emails must be short, plain-text, and hyper-personalized.
- Best send times for sales emails: 8-10 AM or 1-3 PM on Tuesday, Wednesday, or Thursday in the recipient's time zone. Monday mornings and Friday afternoons underperform.

## Content Structure

### Sales Email Architecture (PAS Framework)

1. **Subject line** — 4-7 words. Specific to the recipient's situation. Creates just enough curiosity to earn the open without resorting to clickbait or deception.
2. **Opener (1-2 sentences)** — Personalized reference to the recipient's company, role, recent activity, or shared connection. Must demonstrate that this is not a mass email.
3. **Problem/Pain (2-3 sentences)** — Articulate a specific problem the recipient likely faces. Use their industry language, not yours. The reader should think "yes, that is exactly my situation."
4. **Solution (2-3 sentences)** — Position your offer as the bridge from their pain to their desired outcome. Focus on the result, not the features. One specific proof point (metric, case study, or name-drop).
5. **Social proof (1-2 sentences)** — A concrete result: "[Company similar to theirs] achieved [specific outcome] in [timeframe]." Numbers and named companies outperform vague claims.
6. **CTA (1 sentence)** — One single, low-friction ask. Not "buy now" — instead, "Would a 15-minute call this week make sense?" The ask must match the relationship stage.
7. **PS line** — The second most-read line after the subject. Use it for urgency, a secondary proof point, or a personal note that reinforces the value proposition.

### Alternative Frameworks

- **AIDA**: Attention (subject + opener), Interest (pain point), Desire (solution + proof), Action (CTA).
- **Before/After/Bridge**: Before (current state), After (desired outcome), Bridge (your solution).
- **Star/Story/Solution**: Star (the prospect), Story (the challenge they face), Solution (your offer).

## Writing Guidelines

- **Personalize the first line or lose the reader.** "I noticed your team just launched X" or "Saw your post about Y" demonstrates genuine research. "Hope this finds you well" signals a template and gets deleted.
- Keep cold emails under 150 words. Every word beyond 150 reduces reply probability. Shorter emails look like personal messages, not sales blasts.
- One CTA per email, always. Multiple asks ("book a call, check our website, download this guide, follow us on LinkedIn") create decision paralysis and dilute the conversion path.
- Match your CTA to the relationship temperature. Cold: "Worth a quick chat?" Warm: "Ready to see how this works for your team?" Hot: "Should I send the proposal?"
- Write the PS line. It is the second most-read part of any email. Use it for urgency ("We are only taking 3 more clients this quarter"), a testimonial, or a personal touch.
- Use plain text for cold emails. HTML templates, embedded images, and fancy formatting signal "marketing email" and reduce deliverability and reply rates.
- Avoid attachments in cold emails. They trigger spam filters and create friction. Link to a hosted resource if you must share a document.
- Write in short sentences and short paragraphs (1-2 sentences each). Dense paragraphs look like effort to process and get skimmed or skipped.
- A/B test subject lines aggressively. Test curiosity vs. direct benefit, question vs. statement, and with vs. without the recipient's name. Small subject line changes can swing open rates by 20-30%.

## Output Format

```
=== SUBJECT LINE ===
[4-7 words — specific to recipient, creates curiosity. Max 60 characters.]

=== OPENER ===
[Personalized first line — reference to recipient's company, role, recent activity, or shared connection. 1-2 sentences.]

=== PROBLEM / PAIN ===
[Specific pain point the recipient faces — in their industry language. 2-3 sentences.]

=== SOLUTION ===
[Your offer as the bridge from pain to desired outcome — result-focused, not feature-focused. One proof point. 2-3 sentences.]

=== PROOF ===
[Concrete social proof — named company, specific metric, defined timeframe. 1-2 sentences.]

=== CTA ===
[Single, low-friction ask appropriate to the relationship stage. 1 sentence.]

=== PS ===
P.S. [Urgency element, secondary proof point, or personal note. 1-2 sentences.]

=== EMAIL NOTES ===
Target recipient: [Role / company type]
Relationship stage: [Cold / Warm / Hot]
Primary goal: [Reply / Book call / Purchase]
Follow-up cadence: [Day 3-4 / Day 7-10 / Day 14]
```

## Quality Criteria

- [ ] Subject line is 4-7 words and specific to the recipient (not a generic template)
- [ ] Opener references something specific about the recipient (company, role, activity, or connection)
- [ ] Problem statement uses the recipient's industry language, not internal jargon
- [ ] Solution focuses on outcomes and results, not product features
- [ ] Social proof includes a named company or specific metric with a timeframe
- [ ] Exactly one CTA that matches the relationship stage (not "buy now" for cold outreach)
- [ ] PS line is present and adds urgency, proof, or a personal touch
- [ ] Total word count is under 300 words (under 150 for cold emails)
- [ ] Email is formatted as plain text with no HTML, images, or attachments (for cold outreach)
- [ ] Unsubscribe mechanism and physical address are included (CAN-SPAM / GDPR compliance)

## Anti-Patterns

- **Generic opener ("Hope this finds you well")** — This phrase instantly signals a mass template. Recipients delete these emails reflexively. Always lead with a personalized, specific reference that proves human effort.
- **Multiple CTAs** — "Book a call, visit our website, download the guide, and follow us on LinkedIn" dilutes every action. Each additional CTA reduces the conversion probability of the primary ask.
- **Feature dumping** — Listing product features instead of articulating outcomes. "We have AI-powered analytics with real-time dashboards" means nothing. "We helped [Company] cut reporting time by 70%" means everything.
- **Long paragraphs in cold emails** — Dense 4-5 sentence paragraphs look like work to read. On mobile (where most emails are first seen), a long paragraph fills the entire screen and triggers an immediate delete.
- **HTML-heavy cold emails** — Designed templates with images, buttons, and formatting trigger spam filters, reduce deliverability, and signal "marketing blast." Plain text outperforms for cold outreach.
- **Attachments in cold emails** — Files attached to cold emails trigger spam filters and create security concerns. Many corporate email systems strip or quarantine attachments from unknown senders.
- **No follow-up** — Sending one email and giving up leaves 80% of potential conversions on the table. A structured follow-up sequence (days 3, 7, 14) is essential for results.
- **Selling in the first cold email** — The goal of a cold email is to start a conversation, not close a deal. Asking for a purchase in the first contact feels aggressive and signals a lack of understanding of the sales process.
- **Ignoring send limits** — Blasting 500+ cold emails per day from a single domain destroys sender reputation. Domain blacklisting takes weeks to recover from and affects all emails from that domain, including internal ones.
