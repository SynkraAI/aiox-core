---
name: "YouTube Video Script"
platform: "youtube"
content_type: "script"
description: "Long-form video scripts optimized for retention, CTR, and watch time with thumbnail-first planning"
whenToUse: |
  Creating agents that produce YouTube video scripts or long-form video content.
constraints:
  title_max_chars: 100
  title_optimal_chars: "50-70"
  description_max_chars: 5000
  description_visible_lines: 2
  thumbnail_size: "1280x720px"
  optimal_duration: "8-15 minutes"
  end_screen_duration: "5-20 seconds"
version: "1.0.0"
---

## Platform Rules

- **CTR + Watch Time** are the two most important metrics. A video needs both a compelling thumbnail/title (for clicks) AND strong retention (for algorithmic expansion).
- The first 30 seconds determine whether viewers stay or leave. This is the make-or-break window for average view duration (AVD). Getting 70%+ AVD signals quality to the algorithm.
- Thumbnail is 50% of a video's performance. A great video with a weak thumbnail will fail. Design the thumbnail before scripting.
- Suggested videos are the primary traffic source for most channels. Optimize titles and thumbnails for browse and suggested placement. The algorithm tests with a small audience first, then expands based on CTR and AVD.
- Session time is rewarded. Videos that lead viewers to watch more YouTube content get algorithmic favor.
- Best upload days: Thursday, Friday, Saturday at 2-4 PM in your audience's time zone. Upload consistency matters — the algorithm rewards predictable schedules.
- 8-15 minute videos hit the optimal balance: 8+ minutes enables mid-roll ads, under 15 minutes maintains strong retention.

## Content Structure

### Video Architecture

1. **Hook (0-30 seconds)** — State the premise, show a preview of the payoff, create a curiosity loop that needs closing. "By the end of this video, you will know exactly how to..." Avoid asking for likes or subs here — the viewer has received no value yet.
2. **Intro/Context (30 seconds - 1 minute)** — Brief background establishing why this topic matters. Keep it tight. No lengthy channel introductions or sponsor segments.
3. **Body (1 minute - X minutes)** — Deliver the core content in 3-5 distinct sections. Use pattern interrupts every 30-60 seconds: B-roll, graphics, angle changes, story shifts, or on-screen text. Monotony causes retention drop-off.
4. **Climax/Key Insight** — The most valuable moment, the "aha" realization. Place this at 60-70% through the video to reward viewers who stayed and pull the retention curve forward.
5. **Summary (last 1-2 minutes)** — Recap the key points and reinforce the primary takeaway. This cements the value and primes the viewer for the CTA.
6. **CTA + End Screen (last 20 seconds)** — One primary CTA (subscribe, watch the next video, or leave a comment). Use end screen elements: subscribe button and next video card. Do not stack 5 different asks.

Use pattern interrupts every 30-60 seconds to reset viewer attention: cut to B-roll, zoom in/out, on-screen keyword highlight, story shift, angle changes, or audience questions.

## Writing Guidelines

- **Thumbnail first.** Design the thumbnail concept before scripting. If you cannot make a compelling thumbnail, reconsider the topic.
- **Title formula**: [Curiosity gap] + [Specific benefit]. Example: "I Tried X for 30 Days — Here is What Happened." Front-load keywords in the first 50 characters.
- **Hook must establish stakes in 30 seconds.** State the payoff, preview the value, create an open loop. No "hey guys, welcome back."
- Write for spoken delivery. Short sentences, conversational language, natural speech patterns. If it sounds stiff read aloud, rewrite it.
- Add timestamps/chapters in the description for navigation. First 2 lines of the description must contain the hook and primary keywords (only visible lines before "Show more").
- Use 5-10 tags and 2-3 in-video cards linking to related content. Mark pattern interrupt cues (B-roll, graphics, angle changes) directly in the script.

## Output Format

```
=== TITLE ===
[Video title — 50-70 characters optimal, max 100. Curiosity gap + specific benefit. Front-load keywords.]
=== THUMBNAIL CONCEPT ===
[Visual description: subject/face expression, text overlay (3-4 words max), color scheme, composition. Must be readable at mobile thumbnail size.]

=== HOOK (0-30s) ===
[Spoken script for the first 30 seconds. State the premise, preview the payoff, create the curiosity loop.]
[Visual cues]: [What appears on screen during the hook]

=== INTRO (30s-1min) ===
[Brief context — why this matters, who this is for. Keep under 30 seconds.]
[Visual cues]: [Supporting visuals]

=== BODY ===
Section 1: [Subheading] (Timestamp: ~1:00-X:XX)
[Script — spoken content] | [Pattern interrupts]: [B-roll, graphic cues] | [Key point]: [Takeaway]

Section 2: [Subheading] (Timestamp: ~X:XX-X:XX)
[Script — spoken content] | [Pattern interrupts]: [B-roll, graphic cues] | [Key point]: [Takeaway]

Section 3: [Subheading] (Timestamp: ~X:XX-X:XX)
[Script — spoken content] | [Pattern interrupts]: [B-roll, graphic cues] | [Key point]: [Takeaway]

=== CLIMAX (at ~60-70% through) ===
[The "aha" moment — most valuable insight or reveal] | [Visual cues]: [How to emphasize visually]

=== SUMMARY (last 1-2 min) ===
[Recap of key points. Reinforce the primary takeaway.]

=== CTA + END SCREEN (last 20s) ===
[One primary CTA] | [End screen elements]: [Subscribe button, next video card]

=== DESCRIPTION ===
[First 2 lines: Hook + primary keywords (visible before "Show more")]
[Video summary — 2-3 sentences]
TIMESTAMPS:
0:00 - [Hook/Intro] | X:XX - [Section 1] | X:XX - [Section 2] | X:XX - [Section 3] | X:XX - [Summary/CTA]
[Links: related videos, resources, social media]

=== TAGS ===
[5-10 relevant keyword tags, comma-separated]
```

## Quality Criteria

- [ ] Thumbnail concept is defined before the script, with face/emotion, 3-4 word text overlay, and high contrast design
- [ ] Title is 50-70 characters, front-loads keywords, and combines curiosity gap with specific benefit
- [ ] Hook establishes stakes and creates an open loop within the first 30 seconds
- [ ] Hook does not ask for likes/subs before delivering value
- [ ] Script includes pattern interrupt cues every 30-60 seconds (B-roll, graphics, angle changes)
- [ ] Body contains 3-5 distinct sections with clear subheadings
- [ ] Climax/key insight is placed at 60-70% through the video
- [ ] Total estimated duration is 8-15 minutes
- [ ] Description includes timestamps for chapter navigation
- [ ] First 2 lines of the description contain the hook and primary keywords
- [ ] End screen uses the last 20 seconds with one primary CTA

## Anti-Patterns

- **Clickbait that does not deliver** — Misleading thumbnails and titles cause early drop-off, destroying average view duration and algorithmic trust. The video must fulfill the thumbnail's promise.
- **Slow intros** — "Hey guys, welcome back to my channel, so today we are going to..." loses viewers immediately. Hook first, personal introduction later (or never).
- **Asking for likes/subs in the first 30 seconds** — The viewer has received no value yet. Earn the ask by delivering value first, then requesting engagement.
- **No timestamps** — Long videos without chapters frustrate viewers who want to navigate to specific sections, hurting retention and rewatch potential.
- **Generic thumbnails** — Text-only or auto-generated thumbnails get dramatically lower CTR. Always design a custom thumbnail with face, emotion, and minimal text.
- **No pattern interrupts** — Static talking-head without visual variety causes retention drop-off after 60 seconds. The audience's attention must be actively maintained.
- **Too many CTAs** — "Like, subscribe, hit the bell, follow me on Instagram, check out my course, buy my merch..." dilutes every ask. Pick one primary CTA per video.
- **Inconsistent upload schedule** — The algorithm and your audience both expect predictability. Erratic publishing kills momentum.
- **Uploading without a custom thumbnail** — Auto-generated thumbnails are never acceptable. Always upload a designed thumbnail.
- **Ignoring comments** — Creator replies boost comment visibility and signal community health. Unanswered comment sections look abandoned.
