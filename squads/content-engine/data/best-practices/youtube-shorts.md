---
name: "YouTube Shorts"
platform: "youtube"
content_type: "shorts"
description: "Short-form vertical video optimized for the Shorts feed, loop replays, and rapid audience growth"
whenToUse: |
  Creating agents that produce YouTube Shorts or short-form vertical video for YouTube.
constraints:
  max_duration_seconds: 60
  aspect_ratio: "9:16 vertical"
  hashtags: "3-5 max, include #Shorts"
version: "1.0.0"
---

## Platform Rules

- YouTube Shorts have a separate algorithm from long-form videos. Shorts views do not directly boost long-form distribution, and vice versa. Treat them as distinct content strategies.
- The Shorts feed is swipe-based. Viewers decide to stay or swipe in the first 1-2 seconds. The hook window is even shorter than Reels or TikTok.
- Completion rate and replays are the primary algorithmic signals. A Short that loops seamlessly and gets rewatched will be distributed far more widely than a longer Short with low completion.
- Shorts can be posted any day of the week. The Shorts feed is less time-dependent than long-form uploads.
- Including "#Shorts" in the title or description ensures proper categorization in the Shorts feed. Without it, the video may not surface in the dedicated Shorts experience.
- Shorts work best for teasers, quick tips, behind-the-scenes content, and reaction/commentary clips. They serve as a top-of-funnel audience growth tool.
- Frequency: 2-3 Shorts per week as supplements to long-form content is a sustainable cadence.
- Hashtags are low-priority on YouTube compared to other platforms, but 3-5 relevant hashtags in the description help with initial categorization. The first 3 hashtags appear above the title.

## Content Structure

### Shorts Sequence

1. **Hook (0-2 seconds)** — Text overlay or spoken hook that immediately creates curiosity. "Here is the trick nobody talks about..." or "Stop doing X, do this instead." The viewer is one swipe away from leaving. Make the first frame impossible to ignore.
2. **Delivery (2-50 seconds)** — One point, one story, one tip. No fluff, no tangents, no filler. Get to the value immediately and deliver it concisely. Maintain visual variety with cuts, text overlays, and angle changes.
3. **Punchline/Loop (last 5-10 seconds)** — The payoff that ideally loops back into the hook. Design the ending to visually or narratively connect to the beginning, creating a seamless loop that encourages replays.

### Loop Design Techniques

- End with a statement that leads directly into the opening hook. "And that is exactly why..." (cut to) "Here is the trick nobody talks about..."
- Use visual match cuts: the last frame of the Short matches the first frame.
- Pose a question at the end that the beginning of the Short answers.
- Circular storytelling: end the story at the same point it began, with new context.

## Writing Guidelines

- **Hook must be instant.** The first 2 seconds determine everything. Use bold text overlays, a provocative opening statement, or a visually striking action. No title cards, no logos, no "hey guys."
- Keep Shorts between 15-45 seconds for maximum completion rate. Shorter is generally better for the Shorts algorithm.
- Add text overlays throughout the Short. Many viewers watch without sound. Key points, labels, and captions burned into the video are essential.
- Write scripts at a fast, energetic pace. Shorts reward density. Cut all filler words: "um," "so," "basically," "you know."
- Shoot natively in vertical 9:16. Never crop a horizontal video into vertical. Cropped content looks lazy, wastes screen space, and performs poorly.
- One topic, one takeaway. A Short that tries to cover 3 points communicates none effectively. If you have multiple points, make multiple Shorts.
- Include "#Shorts" in the title or description. Add 2-3 additional topic-relevant hashtags.
- Title should be concise and curiosity-driven. It appears below the Short in browse and search.
- Description should include #Shorts, relevant hashtags, and a brief context line.

## Output Format

```
=== SHORTS SCRIPT ===

HOOK (0-2s):
[Visual]: [What appears on screen — action, scene, or text overlay]
[Audio]: [Spoken hook or music cue]
[Text Overlay]: [Bold on-screen text — max 8 words, large font]

DELIVERY (2-50s):
[Visual]: [Shot-by-shot breakdown — cuts every 3-5 seconds]
[Script]: [Full spoken script for delivery. Fast pace, no filler.]
[Text Overlays]: [Key points highlighted on screen at timestamps]

PUNCHLINE/LOOP (last 5-10s):
[Visual]: [Final shot — designed to connect back to the hook]
[Script]: [Closing statement or reveal that loops into the opening]
[Text Overlay]: [Punchline text on screen]

=== TITLE ===
[Short, curiosity-driven title — appears below the Short in browse]

=== DESCRIPTION ===
[Brief context line — 1 sentence]

#Shorts #hashtag2 #hashtag3 #hashtag4
[3-5 hashtags including #Shorts]

=== LOOP NOTE ===
[How the ending connects to the beginning for seamless replay]

=== AUDIO NOTE ===
[Original audio direction or trending sound suggestion]
```

## Quality Criteria

- [ ] Hook delivers a clear curiosity gap or visual hook within the first 2 seconds
- [ ] Total duration is 15-45 seconds for optimal completion rate
- [ ] Content is one topic, one takeaway — no multi-point delivery
- [ ] Text overlays are present throughout for sound-off viewing
- [ ] Ending is designed for loop potential (visual or narrative connection to the start)
- [ ] Video is natively vertical 9:16, not cropped from horizontal footage
- [ ] "#Shorts" is included in the title or description
- [ ] Script is tight with no filler words or unnecessary pauses
- [ ] Title is concise and creates curiosity
- [ ] Description includes 3-5 relevant hashtags

## Anti-Patterns

- **Horizontal Shorts** — Cropping a widescreen video into vertical 9:16 looks lazy and performs poorly. Always shoot natively vertical.
- **Slow intros** — Any delay before the hook (logos, "welcome back," title cards) causes immediate swipe-away. The first frame must hook the viewer.
- **No text overlays** — Many Shorts viewers watch without sound. A Short without burned-in text or captions loses a significant portion of its audience.
- **Trying to cover too much** — A 60-second Short with 5 tips communicates none of them memorably. One point, delivered clearly, is always more effective.
- **Missing #Shorts tag** — Without "#Shorts" in the title or description, the video may not surface in the dedicated Shorts feed, dramatically reducing its distribution.
- **Repurposed horizontal video** — Simply re-uploading a clip from a long-form video without reframing for vertical is immediately obvious and signals low effort.
- **No loop design** — Shorts that end abruptly without connecting back to the beginning miss the replay signal that drives algorithmic distribution.
- **Ignoring comments** — Creator replies boost comment visibility and signal active community engagement. Unanswered Shorts comments reduce future distribution.
- **Clickbait that does not deliver** — The payoff must match the hook's promise. Shorts viewers are ruthless with the swipe button when they feel misled.
