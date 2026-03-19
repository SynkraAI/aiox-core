---
name: "Instagram Stories"
platform: "instagram"
content_type: "stories"
description: "Ephemeral 24-hour vertical content with interactive elements for audience engagement and retention"
whenToUse: |
  Creating agents that produce Instagram Stories or ephemeral 24-hour content.
constraints:
  max_duration_seconds: 60
  aspect_ratio: "9:16 vertical"
  format: "ephemeral (24h)"
  interactive_elements: "polls, questions, links, stickers, quizzes"
version: "1.0.0"
---

## Platform Rules

- Stories are ephemeral and disappear after 24 hours. This creates urgency and encourages immediate viewing. High-performing Stories can be saved to Highlights for permanent access.
- Stories appear at the top of the feed in the Stories bar. Posting multiple times throughout the day keeps your profile at the front of the bar, maintaining visibility.
- Story engagement (replies, sticker interactions, poll votes) signals account relevance to the algorithm, which in turn boosts your feed post and Reel distribution.
- Stories are shown primarily to existing followers, not new audiences. They are a retention and deepening tool, not a discovery tool.
- Interactive elements (polls, questions, quizzes, sliders) dramatically increase engagement rate and time spent on your Stories.
- Link stickers are the only way to share clickable links on Instagram (outside of bio). Use them strategically to drive traffic.

## Content Structure

### Story Sequence Design

Stories work best as short sequences of 3-7 frames that follow a narrative arc. Each frame should be consumable in 3-5 seconds.

1. **Opener frame** — Grab attention with a bold statement, question, or visually striking image. This determines whether viewers watch the rest of the sequence.
2. **Context frames (1-3)** — Build the story, share the insight, or present the information. Keep text short and use visual hierarchy.
3. **Interactive frame** — Deploy a poll, question box, quiz, or slider to transform passive viewers into active participants.
4. **Closer frame** — Deliver the conclusion, payoff, or CTA. Link sticker if driving traffic. "DM me" or "Reply to this" for conversation.

### Frame Types

- **Text-on-background**: Bold text with a colored background. Best for announcements, questions, or quick thoughts.
- **Photo/video with overlay**: Visual content with text overlay and optional stickers. The primary Story format.
- **Interactive**: Frames built around a poll, quiz, question box, or emoji slider as the central element.
- **Link frame**: Frame with a link sticker driving to an external URL. Must include clear context for why the viewer should tap.

## Writing Guidelines

- **Keep text extremely short.** Stories are consumed in seconds. 2-3 lines of large text maximum per frame. If it takes more than 3 seconds to read, it is too long.
- Use a casual, conversational tone. Stories are the most informal format on Instagram. First person, contractions, and casual language are expected.
- Write text overlays in large, bold fonts. Small text is unreadable on mobile and gets ignored.
- Every interactive element needs a clear, specific prompt. "What do you think?" is weak. "Which would you choose: A or B?" is strong.
- Use polls and quizzes to segment your audience and gather feedback. The responses provide content ideas and audience insights.
- Questions boxes should ask something genuinely interesting that viewers want to answer. Generic prompts get ignored.
- When using link stickers, always add context text explaining what the link is and why they should tap. A bare link sticker with no context gets minimal taps.
- Stories do not use hashtags or formal caption structure. The tone is raw and immediate.

## Output Format

```
=== STORY SEQUENCE ===

FRAME 1 (Opener):
[Visual]: [Photo/video description or background color]
[Text Overlay]: [Bold hook text — max 2 lines, large font]
[Sticker/Element]: [None / Music / Location / Mention]

FRAME 2 (Context):
[Visual]: [Photo/video description]
[Text Overlay]: [Supporting context — max 3 lines]
[Sticker/Element]: [Optional element]

FRAME 3 (Interactive):
[Visual]: [Background or supporting visual]
[Text Overlay]: [Prompt text leading into the interactive element]
[Interactive Element]: [Poll: "Option A" vs "Option B" / Quiz: "Question?" with answers / Question Box: "Ask me about..." / Emoji Slider: "How much do you [X]?"]

FRAME 4 (Closer/CTA):
[Visual]: [Final visual]
[Text Overlay]: [Conclusion, payoff, or CTA text — max 2 lines]
[Sticker/Element]: [Link sticker with URL / "DM me" prompt / Countdown sticker]

=== SEQUENCE NOTES ===
Total frames: [3-7]
Estimated view time: [X seconds total]
Primary goal: [Engagement / Traffic / Feedback / Announcement]
```

## Quality Criteria

- [ ] Sequence is 3-7 frames long (not too short to have impact, not too long to cause drop-off)
- [ ] Opener frame grabs attention within 2 seconds with a visual or textual hook
- [ ] Text overlays are 2-3 lines maximum per frame with large, readable font
- [ ] At least one frame includes an interactive element (poll, quiz, question, or slider)
- [ ] Interactive prompts are specific and binary/concrete, not vague or open-ended
- [ ] Tone is casual and conversational, matching the ephemeral nature of Stories
- [ ] Link stickers (if used) include context text explaining what the link is and why to tap
- [ ] Each frame is consumable in 3-5 seconds without pausing
- [ ] Sequence follows a narrative arc (opener, context, interaction, closer)
- [ ] Content is vertical-native (9:16), not adapted from horizontal content

## Anti-Patterns

- **Wall of text on a single frame** — Stories are consumed in seconds. More than 3 lines of text causes viewers to skip forward or exit. Break long messages across multiple frames.
- **No interactive elements** — Stories without polls, questions, or quizzes miss the primary engagement mechanism of the format. Passive-only Stories get lower completion rates.
- **Link sticker with no context** — A bare link sticker without text explaining what it leads to and why the viewer should tap gets minimal click-through.
- **Posting one Story per day** — A single frame does not stay at the top of the Stories bar. Post 3-7 frames per sequence to maintain visibility.
- **Repurposing feed posts as Stories** — Screenshotting a carousel slide or resharing a feed post without adding new value feels lazy. Add commentary, behind-the-scenes context, or an interactive element.
- **Horizontal content in Stories** — Landscape photos or videos with black bars above and below waste screen space and look unintentional.
- **Generic question prompts** — "Any questions?" or "What do you think?" are too vague to generate responses. Be specific: "What is your biggest challenge with X?"
- **Ignoring Story replies** — Story replies are high-intent DMs. Not responding kills future engagement and signals disinterest to your audience.
