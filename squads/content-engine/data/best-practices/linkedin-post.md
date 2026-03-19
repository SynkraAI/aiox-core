---
name: "LinkedIn Post"
platform: "linkedin"
content_type: "post"
description: "Text posts and document carousels optimized for professional engagement, dwell time, and comment-driven reach"
whenToUse: |
  Creating agents that produce LinkedIn posts, text updates, or document carousels for LinkedIn.
constraints:
  post_max_chars: 3000
  post_visible_chars: 210
  hashtags_max: 5
  recommended_hashtags: "3-5"
  carousel_max_slides: 300
  recommended_slides: "10-15"
  max_posts_per_day: 1
version: "1.0.0"
---

## Platform Rules

- Posts with external links in the body receive approximately 3x less reach. The LinkedIn algorithm actively deprioritizes outbound traffic. Always use the "link in comments" approach.
- Comments are weighted far more heavily than reactions. Long, substantive comments signal valuable content to the algorithm. Questions drive 2x more comments than statements.
- The first 60 minutes are critical. Engagement velocity in this window determines whether the post expands beyond your initial 5-10% network reach.
- Dwell time is an algorithmic signal. Longer posts that keep people reading and scrolling get boosted in distribution.
- Document/carousel posts receive 2-3x more reach than text-only posts. The swipe interaction increases dwell time.
- The algorithm rewards creators who reply to every comment on their posts. Active comment sections signal quality.
- Avoid more than 1 post per day. Multiple daily posts compete against each other for your audience's attention and the algorithm may cannibalize your own reach.
- Best posting times: 7-9 AM or 12-1 PM on weekdays in your audience's time zone. Tuesday, Wednesday, and Thursday consistently outperform other days. Weekends see 50-70% engagement drops.
- Allow 18-24 hours between posts for maximum individual post distribution.

## Content Structure

### Text Post Structure

1. **Hook (first 2 lines / ~210 characters)** — This is everything. The hook appears before the "see more" fold. Use a contrarian take, surprising stat, personal story opener, or bold claim that compels the tap.
2. **Story/Context (2-3 short paragraphs)** — Personal experience, observation, or data that supports your point. Write in first person. Use short sentences and frequent line breaks (1-2 sentences per paragraph).
3. **Insights/Lessons (3-5 bullet points)** — Actionable takeaways, numbered or bulleted. These are the save-worthy core of the post.
4. **Takeaway (1-2 sentences)** — The one thing to remember.
5. **CTA question** — A genuine question that invites conversation: "What's your experience with [topic]?" or "Agree or disagree?"
6. **Hashtags (last line)** — 3-5 relevant hashtags, separated from the body text.

### Document/Carousel Structure

- Hook slide with a bold statement or question.
- 10-15 slides with one idea per slide, 20-30 words maximum.
- Clean, readable design with large text and minimal clutter.
- CTA on the final slide directing comments, shares, or follows.
- Upload as PDF format.

### Effective Post Formats

- **Storytelling**: "3 years ago, I [experience]. Here is what I learned..."
- **Thought leadership**: "Unpopular opinion: [contrarian take]. Here is why..."
- **Data-driven**: "[Surprising stat]. Here is what it means for [audience]..."
- **Lessons learned**: "I [did X] and discovered [Y]. The 5 biggest lessons:"
- **Before/After**: "Before: [old way]. After: [new insight]. The difference was [key lesson]."

## Writing Guidelines

- **First person is mandatory.** Personal stories outperform generic advice on LinkedIn. "I learned" beats "One should learn."
- Write in short paragraphs of 1-2 sentences. A wall of text kills readability and dwell time.
- Front-load the hook. The first 210 characters (~2 lines on desktop) must compel the "see more" tap. If the hook does not create curiosity, urgency, or personal relevance, rewrite it.
- Ask a genuine question at the end. Not rhetorical, not generic. A specific question your audience can answer from their own experience.
- Tag only 2-3 people who will actually engage. Spam tagging 10+ people looks desperate and may trigger filters.
- Never put links in the post body. Post the content first, then add the link as the first comment. Or say "Link in comments" and drop it in a reply.
- Use 3-5 hashtags on the last line. Mix 1-2 broad industry tags with 2-3 niche/specific tags. Avoid generic hashtags like #motivation or #success.
- Do not place hashtags in the middle of post text. It breaks readability and looks unprofessional.

## Output Format

```
=== HOOK ===
[First 2 lines — must work before the "see more" fold. Max ~210 characters. Contrarian take, surprising stat, or personal story opener.]

=== BODY ===
[Story or context — 2-3 short paragraphs, first person, short sentences, frequent line breaks.]

[Transition to insights.]

=== INSIGHTS ===
1. [Actionable takeaway — one sentence]
2. [Actionable takeaway — one sentence]
3. [Actionable takeaway — one sentence]
4. [Actionable takeaway — one sentence]
5. [Actionable takeaway — one sentence]

=== CTA ===
[One-line takeaway summary.]

[Genuine question to drive comments — specific, not generic.]

=== HASHTAGS ===
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5
[3-5 hashtags on a separate final line]
```

## Quality Criteria

- [ ] Hook fits within ~210 characters and creates a compelling reason to tap "see more"
- [ ] Post is written in first person with a personal, authentic voice
- [ ] Paragraphs are 1-2 sentences long with line breaks between them
- [ ] Post contains 3-5 actionable, numbered or bulleted insights
- [ ] CTA is a genuine, specific question (not rhetorical or generic)
- [ ] No external links appear in the post body
- [ ] Hashtags are 3-5 total, placed on the last line, separated from the body
- [ ] No more than 2-3 people are tagged, and only those who will likely engage
- [ ] Total post length is under 3,000 characters
- [ ] Post delivers value worth commenting on, not just reacting to

## Anti-Patterns

- **Links in post body** — Kills reach by approximately 3x. The algorithm deprioritizes posts that drive users off LinkedIn. Always use the "link in comments" approach.
- **Spam tagging** — Tagging 10+ people who did not ask to be tagged looks desperate, may trigger spam filters, and damages professional credibility.
- **Editing after posting** — Editing within the first 10 minutes can reset algorithmic distribution, destroying the critical early engagement window.
- **More than 1 post per day** — Posts compete against each other for your own audience's attention. The algorithm may suppress the second post.
- **Corporate jargon** — "Synergy," "leverage," "circle back," "at the end of the day" make content feel robotic and impersonal. Write like a human.
- **No line breaks** — A wall of text kills readability and dwell time. Use 1-2 sentence paragraphs with whitespace between them.
- **Posting on weekends** — Unless your audience is specifically active on weekends, reach drops 50-70% on Saturday and Sunday.
- **Generic motivational quotes** — Saturated content type that signals low effort and does not generate meaningful engagement.
- **Engagement pods** — LinkedIn actively detects and penalizes coordinated engagement groups. The short-term boost is not worth the long-term suppression risk.
- **Reposting without adding value** — "So true!" reshares get minimal engagement. Always add your own perspective, experience, or analysis.
