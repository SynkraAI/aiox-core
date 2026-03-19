# Broadcast Email — {BROADCAST_NAME}

> **Template:** broadcast-email-tmpl.md
> **Version:** 1.0.0
> **Used by:** `tasks/write-broadcast-email.md`
> **Agent:** email-nurture (Andre Chaperon), copy-vendas (Leandro Ladeira)
> **Format:** Two variants — VALUE broadcast and PITCH broadcast

---

<!-- BROADCAST CONFIG
Segment: {SEGMENT} (all list / buyers / prospects / tag:{TAG_NAME})
Send Date: {SEND_DATE}
Send Time: {SEND_TIME} ({TIMEZONE})
Email Platform: {EMAIL_PLATFORM}
Goal: {BROADCAST_GOAL}
-->

---

## Ratio Guidance

Andre Chaperon's principle: **give before you ask.**

Recommended ratio: **3:1** (three value emails for every one pitch email).

Sending too many pitches burns your list. Sending only value delays revenue.
Balance is tracked in the monthly social/email calendar.

---

## VARIANT A — VALUE Broadcast

*(Educational, no pitch. Builds trust, opens loops, drives engagement.)*

---

**Subject:** {VA_SUBJECT}

<!-- Value subject patterns:
- "[Number] things I learned about [topic] this week"
- "The [surprising thing] about [topic] nobody talks about"
- "Quick tip: [specific actionable thing]"
- "[Question your reader is asking themselves]"
-->

**Preview Text:** {VA_PREVIEW}

**Tags triggered on open:** {VA_OPEN_TAG}
**Tags triggered on click:** {VA_CLICK_TAG}

---

**Body:**

{VA_HOOK}

<!-- 1-2 sentences. Make them want to keep reading. Curiosity, empathy, or surprise. -->

{VA_CONTEXT}

<!-- Brief setup. Why are you sharing this today? What prompted it? -->

{VA_MAIN_CONTENT_BLOCK_1}

<!-- Teach one thing. Specific. Actionable. Not too long (emails aren't blog posts). -->

{VA_MAIN_CONTENT_BLOCK_2}

<!-- Optional second point or supporting evidence. -->

{VA_INSIGHT_OR_TAKEAWAY}

<!-- The "so what?" — what should the reader do or think differently about because of this email? -->

**The key takeaway:** {VA_KEY_TAKEAWAY_BOLD}

{VA_OPTIONAL_RESOURCE_LINK}

<!-- If you reference a post, tool, or resource, link to it here. Keep it ONE link. -->

{VA_SOFT_CLOSE}

<!-- "What's your take? Hit reply." or a question to invite engagement. -->

{VA_SIGN_OFF}

*P.S. {VA_PS}*
<!-- Optional. Use to tease next email or add one more tip. -->

---

**Value Email Production Checklist:**
- [ ] Single topic — no tangents
- [ ] One link max (or zero links)
- [ ] No affiliate CTA in the body
- [ ] Ends with engagement prompt (reply / question)
- [ ] Under 400 words for most audiences
- [ ] Subject line creates curiosity without bait-and-switch

---

## VARIANT B — PITCH Broadcast

*(Revenue-focused. Direct offer with clear affiliate CTA.)*

---

**Subject:** {VB_SUBJECT}

<!-- Pitch subject patterns:
- "This closes tonight at midnight"
- "[First name], I have something for you"
- "The best [product category] deal I've seen this month"
- "I'm sharing my affiliate discount for [product]"
-->

**Preview Text:** {VB_PREVIEW}

**Tags triggered on click:** {VB_CLICK_TAG}
**Tags triggered on non-open (for follow-up):** {VB_NONOPEN_TAG}

---

**Body:**

{VB_HOOK}

<!-- Grab attention fast. Reference a pain point or the offer directly. -->

{VB_CONTEXT_PARAGRAPH}

<!-- Brief context: why this offer, why now, why you're sharing it. -->

{VB_OFFER_DESCRIPTION}

<!-- What is the product/offer. Be specific. Don't assume they know it. -->

**Here's what you get:**
- {VB_BENEFIT_1}
- {VB_BENEFIT_2}
- {VB_BENEFIT_3}

{VB_SOCIAL_PROOF}

<!-- Quick testimonial, your own result, or endorsement. 1-3 sentences. -->

{VB_URGENCY_MECHANISM}

<!-- Real deadline: enrollment closes, price increases, bonus expires.
Be specific: "This offer closes on [DATE] at [TIME] [TIMEZONE]"
Do NOT use fake urgency. -->

**[{VB_PRIMARY_CTA_TEXT}]({AFFILIATE_LINK})**

{VB_OBJECTION_NUDGE}

<!-- Address the most likely objection in 1-2 sentences. -->

**[{VB_SECONDARY_CTA_TEXT}]({AFFILIATE_LINK})**

{VB_SIGN_OFF}

*P.S. {VB_PS}*
<!-- Restate the deadline or the key benefit. -->

---

**Pitch Email Production Checklist:**
- [ ] Subject line creates urgency or curiosity
- [ ] Offer is clearly described in first 150 words
- [ ] At least 2 CTA links (one early, one at end)
- [ ] Deadline is specific (date + time + timezone)
- [ ] Social proof included
- [ ] Affiliate disclosure present (footer or inline)
- [ ] Unsubscribe works

---

## Affiliate Disclosure (include in footer or inline)

*This email contains affiliate links. I may earn a commission if you purchase through my links at no extra cost to you.*

---

## Follow-Up Automation (for Pitch broadcasts)

| Trigger | Delay | Action |
|---------|-------|--------|
| No open | 24h | Resend with different subject |
| Opened but no click | 24h | Send objection-handling email |
| Clicked but no purchase | 48h | Send FAQ / reassurance email |
| Purchased | Immediate | Move to buyer sequence, remove from pitch list |

---

*Template by email-nurture — Affiliates Squad v1.0*
*Framework: Andre Chaperon (3:1 ratio principle) + Leandro Ladeira (Venda Todo Santo Dia)*
