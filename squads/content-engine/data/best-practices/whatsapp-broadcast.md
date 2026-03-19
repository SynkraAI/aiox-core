---
name: "WhatsApp Broadcast"
platform: "whatsapp"
content_type: "broadcast"
description: "Broadcast messages optimized for open rates, replies, and conversational engagement without triggering spam flags"
whenToUse: |
  Creating agents that produce WhatsApp broadcast messages or conversational marketing content.
constraints:
  message_max_chars: 4096
  status_duration: "24h"
  broadcast_list_max: 256
  media_types: "image, video, document, audio"
  optimal_message_length: "300-500 chars"
version: "1.0.0"
---

## Platform Rules

- WhatsApp broadcast messages are delivered as individual chats, not group messages. Recipients do not see each other. This creates a 1-to-1 conversational dynamic that must be respected in tone and structure.
- Recipients must have your number saved in their contacts to receive broadcast messages. Without this, the message is silently dropped. Always prompt new contacts to save your number during onboarding.
- WhatsApp Business API enforces messaging tiers based on sender reputation. New accounts start at 1,000 unique recipients per 24 hours. Maintaining high quality scores (low blocks/reports) unlocks higher tiers up to unlimited sending.
- Messages that receive high block or report rates will degrade your quality rating from Green to Yellow to Red, eventually resulting in account restrictions or bans.
- Open rates on WhatsApp average 90-98%, far exceeding email. This makes frequency discipline critical — every message is seen, so every bad message damages trust.
- Send during business hours in the recipient's time zone (9 AM - 8 PM). Avoid weekends and holidays unless your content is specifically time-sensitive.
- Limit broadcast frequency to 2-4 messages per week maximum. More than one message per day triggers blocks and opt-outs at scale.
- WhatsApp Status (24-hour stories) can complement broadcasts for less urgent updates without cluttering the chat.

## Content Structure

### Broadcast Message Flow

1. **Greeting line** — Personalized opening using {{name}} variable. Keep it warm and conversational, not corporate.
2. **Value hook** — One sentence explaining what this message delivers. The recipient must immediately understand why they should keep reading.
3. **Body** — 2-4 short paragraphs delivering the core value: tip, offer, update, or exclusive content. Use line breaks between paragraphs. One idea per paragraph.
4. **CTA** — Single, clear action: reply with a keyword, tap a link, or forward to a friend. Make the action effortless.
5. **Signature** — Brief sign-off with sender name or brand. Reinforces the personal, 1-to-1 feel.

### Message Types

- **Value broadcasts**: Tips, insights, exclusive content. Build trust and keep opt-in rates high. Aim for 60-70% of all broadcasts to be value-driven.
- **Promotional broadcasts**: Offers, launches, limited deals. Use sparingly (max 1-2 per week) and always lead with value before the pitch.
- **Transactional updates**: Order confirmations, shipping, appointment reminders. Keep factual and concise.
- **Engagement prompts**: Polls, quick questions, feedback requests. Drive replies to strengthen sender reputation.

### Media Best Practices

- Images should include a text caption explaining the visual. Never send an image without context.
- Videos should be under 60 seconds for highest completion rates. Include a one-line summary above the video.
- Documents (PDFs, catalogs) work best with a 2-3 sentence description of what the recipient will find inside and why it is worth opening.
- Voice notes feel highly personal but should be reserved for warm audiences. Keep under 90 seconds.

## Writing Guidelines

- **Write like you are texting a friend, not sending a press release.** WhatsApp is an intimate channel. Formal language feels invasive and out of place.
- Keep messages under 500 characters when possible. Shorter messages get higher reply rates and feel less like spam.
- Use 1-3 emojis per message to add warmth and visual breaks, but never more. Excessive emojis look unprofessional and spammy.
- One message, one purpose. Do not combine a tip, a promotion, and a survey in a single broadcast. Split them into separate messages on separate days.
- Use {{name}} personalization in the greeting. "Hi {{name}}!" converts significantly better than "Hi there!" or no greeting at all.
- Structure CTAs as low-friction actions: "Reply YES to get the guide" or "Tap the link below" — not multi-step instructions.
- Bold key phrases using WhatsApp formatting (*bold*, _italic_, ~strikethrough~) to create visual hierarchy in plain text.
- Always include an opt-out option: "Reply STOP to unsubscribe." This is both a legal requirement in many jurisdictions and a trust signal.
- Front-load the value. The first two lines appear in the notification preview. If they do not communicate value, the message goes unread.

## Output Format

```
=== GREETING ===
Hi {{name}}! [Warm, personalized opening — 1 line]

=== BODY ===
[Value hook — what this message delivers and why it matters. 1-2 sentences.]

[Core content — tip, insight, offer, or update. 2-4 short paragraphs, one idea each. Use line breaks and *bold* for key phrases. Max 300-400 characters for this section.]

=== CTA ===
[Single clear action — reply with keyword, tap link, or forward. Must be effortless. 1-2 sentences max.]

=== SIGNATURE ===
[Sign-off with sender name or brand. 1 line.]

[Opt-out line: "Reply STOP to unsubscribe."]
```

## Quality Criteria

- [ ] Message opens with personalized greeting using {{name}} variable
- [ ] Total message length is under 500 characters (excluding signature)
- [ ] Value hook is clear within the first two lines (notification preview)
- [ ] Body contains one purpose only: value, promotion, or engagement — never mixed
- [ ] CTA is a single, low-friction action (reply, tap, or forward)
- [ ] Emoji usage is 1-3 per message, adding warmth without clutter
- [ ] WhatsApp formatting (*bold*, _italic_) is used for visual hierarchy
- [ ] Opt-out instruction is included ("Reply STOP to unsubscribe")
- [ ] Tone is conversational and 1-to-1, not corporate or broadcast-style
- [ ] Message delivers standalone value even if the recipient ignores the CTA

## Anti-Patterns

- **Walls of text** — Messages exceeding 600-700 characters feel overwhelming on a mobile chat screen. Recipients block senders who consistently send long messages because they clutter the chat list.
- **No opt-out option** — Failing to include an unsubscribe mechanism violates regulations in many jurisdictions (GDPR, TCPA) and erodes trust. Trapped users report instead of replying STOP.
- **More than one message per day** — WhatsApp is a personal space. Daily broadcasts feel invasive and drive block rates above 5%, which degrades your sender quality rating and can lead to account restrictions.
- **All-caps text** — SHOUTING IN CAPS feels aggressive in a conversational channel and triggers spam perception. It also reduces readability on small screens.
- **Pure promotional without value** — Broadcasts that only sell without educating, entertaining, or informing train recipients to ignore or block you. Lead with value, sell second.
- **Multiple CTAs in one message** — Asking the recipient to reply, click a link, visit your store, AND share with friends creates decision paralysis. One message, one action.
- **No personalization** — Generic messages ("Dear Customer") signal mass messaging and feel impersonal in a channel designed for intimate communication.
- **Sending without opt-in** — Adding contacts to broadcast lists without their explicit consent violates WhatsApp Business Policy and results in high report rates that destroy sender reputation.
- **Attachments without context** — Sending images, PDFs, or videos without a text explanation wastes the recipient's data and attention. Always introduce what the attachment is and why it matters.
