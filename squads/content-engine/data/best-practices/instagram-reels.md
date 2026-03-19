---
name: "Instagram Reels"
platform: "instagram"
content_type: "reels"
description: "Short-form vertical video optimized for discovery, watch time, and non-follower reach"
whenToUse: |
  Creating agents that produce Instagram Reels or short-form vertical video for Instagram.
constraints:
  max_duration_seconds: 90
  recommended_duration: "15-30s"
  aspect_ratio: "9:16 vertical"
  caption_max_chars: 2200
  caption_visible_chars: 125
  max_hashtags: 30
version: "1.0.0"
---

## Platform Rules

- Reels are the primary discovery format on Instagram. They are shown to non-followers via the Explore page and the dedicated Reels tab, making them the strongest tool for audience growth.
- Watch time is the dominant metric: completion rate and replays directly boost distribution. A 15-second Reel watched twice outperforms a 60-second Reel watched halfway.
- Engagement weight for Reels: Shares > Saves > Comments > Likes. Shares to DMs and Stories carry the highest algorithmic value.
- Reels can be posted at any time — algorithmic distribution is less time-dependent than feed posts, though early engagement still helps.
- Trending audio boosts Explore placement. Using a currently trending sound gives a measurable bump in impressions.
- Consistent Reels posting (3-5x/week) signals an active creator account and maintains algorithmic favor.

## Content Structure

### Reel Sequence

1. **Hook (0-2 seconds)** — Text overlay or spoken hook that immediately creates curiosity or promises value. No slow intros, no logos, no "hey guys." The viewer decides to stay or swipe in this window.
2. **Setup (2-5 seconds)** — Quick context establishing what the Reel is about and why the viewer should care. Keep it tight.
3. **Delivery (5-60 seconds)** — The core value: tutorial steps, story beats, entertainment, or insight. Maintain visual variety with cuts, angles, or B-roll every 3-5 seconds.
4. **CTA (last 3-5 seconds)** — Direct ask: follow for more, comment your answer, share with someone who needs this. Keep it short and specific.

### Loop Design

- Design the ending to visually or narratively connect back to the beginning. A seamless loop encourages replays, which are one of the strongest algorithmic signals.
- Common loop techniques: ending mid-sentence and starting with the same word, visual match cuts, circular storytelling.

## Writing Guidelines

- **Hook must be immediate.** The first 1-2 seconds determine whether the viewer stays. Use text overlays that pose a question, make a bold claim, or tease a reveal.
- Write spoken scripts at a conversational pace. Aim for 130-150 words per minute of content.
- Keep Reels between 15-30 seconds for maximum completion rate. Shorter Reels have higher replay potential.
- Add captions/subtitles to every Reel. 85% of Instagram users watch without sound. Burned-in subtitles are non-negotiable.
- Caption (below the Reel): front-load the value in the first 125 visible characters. Expand with context, then add hashtags.
- Use trending audio when it fits your content naturally. Forced trending audio with no connection to the content feels inauthentic.
- End with a specific CTA, not a generic "follow me." Ask a question, prompt a share, or direct to another piece of content.

## Output Format

```
=== REEL SCRIPT ===

HOOK (0-2s):
[Visual]: [What appears on screen — text overlay, action, scene]
[Audio]: [Spoken words, trending sound, or music cue]
[Text Overlay]: [On-screen text that hooks the viewer — max 10 words]

SETUP (2-5s):
[Visual]: [Scene or transition establishing context]
[Script]: [Spoken setup — 1-2 sentences max]

DELIVERY (5-60s):
[Visual]: [Shot-by-shot breakdown with cuts every 3-5 seconds]
[Script]: [Full spoken script for the delivery section]
[Text Overlays]: [Key points highlighted on screen]

CTA (last 3-5s):
[Visual]: [Final frame or gesture]
[Script]: [Spoken CTA — one specific ask]
[Text Overlay]: [CTA text on screen]

=== CAPTION ===
[Hook line — must fit in 125 characters]

[Expanded context or value — 2-3 short lines]

[CTA — question or action prompt]

=== HASHTAGS ===
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
[5-15 hashtags, relevant to the content topic]

=== AUDIO NOTE ===
[Trending sound suggestion or original audio direction]
```

## Quality Criteria

- [ ] Hook delivers a clear curiosity gap or value promise within the first 2 seconds
- [ ] Total duration is between 15-30 seconds for optimal completion rate
- [ ] Script includes burned-in subtitles/captions for sound-off viewing
- [ ] Visual variety is present — cuts or angle changes every 3-5 seconds
- [ ] Ending is designed for loop potential (visual or narrative connection to the start)
- [ ] CTA is specific and actionable, not generic
- [ ] Caption first 125 characters work as a standalone hook
- [ ] Audio direction is specified (trending sound or original audio)
- [ ] Aspect ratio is 9:16 vertical — no horizontal or square content
- [ ] Content delivers on the hook's promise (no bait-and-switch)

## Anti-Patterns

- **Landscape video as Reels** — Horizontal video cropped into 9:16 wastes screen real estate and looks unintentional. Always shoot natively vertical.
- **No subtitles on Reels** — 85% of users watch without sound. A Reel without captions loses the majority of its potential audience.
- **Slow intros** — Starting with a logo reveal, "hey guys," or any non-hook content causes immediate swipe-away. Hook first, always.
- **No CTA** — Reels without a clear ask generate significantly fewer follows, saves, and shares. Always direct the viewer's next action.
- **Posting and ghosting** — Not engaging with comments in the first hour reduces the Reel's algorithmic momentum.
- **Generic stock aesthetics** — Overly polished, impersonal content signals "ad" and reduces organic reach.
- **Hashtag spam** — Using 30 irrelevant hashtags triggers suppression. Stick to 5-15 relevant tags.
- **Forced trending audio** — Using a trending sound that has no connection to the content feels inauthentic and does not boost performance the way contextually relevant audio does.
