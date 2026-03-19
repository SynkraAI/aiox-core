---
name: "Email Newsletter"
platform: "email"
content_type: "newsletter"
description: "Recurring email newsletters optimized for open rates, click-throughs, and subscriber retention"
whenToUse: |
  Creating agents that produce email newsletters or recurring subscriber content.
constraints:
  subject_line_max_chars: 60
  subject_line_optimal: "30-50"
  preview_text_chars: 90
  optimal_word_count: "200-500"
  cta_buttons_max: 2
version: "1.0.0"
---

## Platform Rules

- Subject lines are the single largest driver of open rates. Emails with 30-50 character subject lines consistently outperform longer ones. On mobile (60%+ of opens), subject lines are truncated at approximately 35-40 characters.
- Preview text (preheader) is the second line of defense. If left blank, email clients auto-fill it with the first line of body text, which is often "View in browser" or navigation — a wasted opportunity. Always write custom preview text that extends the subject line's promise.
- Above-the-fold content determines whether a reader scrolls or deletes. The key message, value proposition, or hook must be visible without scrolling on both desktop and mobile.
- Single-column layouts are mandatory for mobile readability. Multi-column designs break on most mobile clients and create a frustrating reading experience.
- Average email open rates range from 20-43% depending on industry. Click-through rates average 2-5%. Every element of the email should be optimized for these two metrics.
- Send time matters: emails sent between 9-11 AM or 3-7 PM in the recipient's time zone consistently outperform other windows. Tuesday, Wednesday, and Thursday are the strongest days.
- Consistent send cadence (weekly, biweekly) builds habit and expectation. Irregular sending degrades open rates over time as subscribers forget who you are.
- Deliverability depends on sender reputation. High bounce rates, spam complaints, and low engagement signal poor list hygiene and push emails to spam folders.

## Content Structure

### Newsletter Architecture

1. **Subject line** — 30-50 characters. Must create curiosity, promise a benefit, or signal urgency. Personalization ({{name}} or segment reference) increases open rates by 10-20%.
2. **Preview text** — 60-90 characters. Extends the subject line, never repeats it. Provides additional context or a secondary hook that complements the subject.
3. **Header** — Brand logo, issue number or date. Brief and recognizable. Do not clutter with navigation links.
4. **Featured content** — The primary story, tip, or insight. This is the above-the-fold value delivery. 100-150 words maximum with a clear visual (image or graphic).
5. **Body sections** — 2-3 secondary content blocks. Each has a subheading, 50-100 words, and an optional link to full content. Separated by visual dividers.
6. **Primary CTA** — One prominent button with action-oriented text ("Read the full guide", "Get your template", "Watch the interview"). Placed after the featured content.
7. **Footer** — Unsubscribe link (legally required), preference center, social links, company address. Keep compact.

### Subject Line Formulas

- **Curiosity gap**: "The metric we stopped tracking (and why)"
- **Benefit-first**: "3 templates to cut your writing time in half"
- **Urgency**: "Last 48 hours: the resource we are retiring"
- **Personalization**: "{{name}}, your weekly content briefing"
- **Number-driven**: "5 lessons from 100 failed launches"

## Writing Guidelines

- **Write the subject line last.** After you know what the email delivers, craft a subject line that accurately promises it. Clickbait subjects that do not deliver destroy trust and increase unsubscribes.
- Preview text must complement the subject line, not repeat it. Subject: "3 mistakes killing your open rates" + Preview: "Plus: the free tool we use to fix them" — together they create a stronger open incentive.
- Keep total word count between 200-500 words. Newsletters that exceed 500 words see declining click-through rates as readers skim and abandon.
- Use subheadings to break content into scannable sections. A reader should understand the email's value from subheadings alone without reading body text.
- One primary CTA button per email. A secondary text link is acceptable, but two competing buttons with equal visual weight create decision paralysis and reduce clicks on both.
- Write CTA button text as a verb phrase: "Download the checklist" not "Click here." Button text should tell the reader exactly what they get.
- Use short paragraphs (2-3 sentences maximum). Email is a scanning medium, not a reading medium.
- Include alt text on every image. Many email clients block images by default. Alt text ensures the message is comprehensible even without visuals loading.
- Personalize beyond the name: reference the subscriber's segment, past behavior, or interests when possible. "As a marketing subscriber..." outperforms generic content.

## Output Format

```
=== SUBJECT LINE ===
[30-50 characters — curiosity, benefit, urgency, or personalization hook]

=== PREVIEW TEXT ===
[60-90 characters — extends the subject line, never repeats it]

=== HEADER ===
[Brand name / logo placeholder | Issue #X or Date]

=== FEATURED CONTENT ===
[Primary story, tip, or insight — 100-150 words. Above-the-fold value delivery.]

[Optional: image or graphic description]

=== BODY ===
### [Section 1 Heading]
[50-100 words — secondary content with optional link]

### [Section 2 Heading]
[50-100 words — secondary content with optional link]

### [Section 3 Heading]
[50-100 words — secondary content with optional link]

=== CTA ===
[Primary CTA button text — action verb phrase, e.g., "Read the full guide"]
[CTA URL]

=== FOOTER ===
[Unsubscribe link | Preference center | Social links | Company address]
```

## Quality Criteria

- [ ] Subject line is 30-50 characters and creates a clear reason to open
- [ ] Preview text is 60-90 characters and extends (not repeats) the subject line
- [ ] Key message is visible above the fold without scrolling on mobile
- [ ] Layout is single-column and mobile-responsive
- [ ] Total word count is between 200-500 words
- [ ] One primary CTA button with verb-phrase text (not "Click here")
- [ ] No more than 2 CTA elements total (1 button + 1 optional text link)
- [ ] Every image includes descriptive alt text
- [ ] Content is scannable via subheadings without reading body text
- [ ] Unsubscribe link is present and functional in the footer

## Anti-Patterns

- **Clickbait subject lines** — Subject lines that promise something the email does not deliver cause unsubscribes and spam reports. Each false promise permanently damages sender reputation and deliverability.
- **Image-heavy emails with no alt text** — Many email clients (especially Outlook and corporate environments) block images by default. An email that is mostly images with no alt text displays as a blank white box, wasting the send entirely.
- **Multiple competing CTAs** — Three buttons with equal visual weight ("Read this," "Buy that," "Sign up here") create decision paralysis. Click-through rates drop on all CTAs when they compete for attention.
- **No plain-text fallback** — Some email clients and accessibility tools render only plain text. Without a plain-text version, your email may display as raw HTML code or be completely unreadable.
- **Exceeding 500 words** — Newsletter engagement drops sharply past 500 words. Readers scan emails in 8-10 seconds. If the content requires more depth, link to a full article and keep the email as a teaser.
- **Repeating subject line in preview text** — The preview text is a second headline, not an echo. Repeating the subject line wastes the most valuable real estate for driving opens.
- **Inconsistent send schedule** — Irregular sending (weekly, then nothing for a month, then three in a week) erodes subscriber trust and trains email clients to deprioritize your messages.
- **Generic "Dear subscriber" opening** — Impersonal greetings signal mass email. Even basic {{name}} personalization measurably improves engagement and reduces the perception of spam.
- **Sending without list hygiene** — Keeping inactive subscribers (no opens in 90+ days) on your list degrades sender reputation. Regularly prune or re-engage inactive contacts.
