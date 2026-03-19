---
name: "Twitter/X Post"
platform: "twitter"
content_type: "post"
description: "Single tweets and quote tweets optimized for engagement, bookmarks, and algorithmic reach"
whenToUse: |
  Creating agents that produce tweets, quote tweets, or single posts for X/Twitter.
constraints:
  tweet_max_chars: 280
  effective_chars: 260
  hashtags_max: 3
  recommended_hashtags: "2-3"
  images_per_tweet: 4
version: "1.0.0"
---

## Platform Rules

- Engagement is weighted: Replies > Bookmarks > Retweets > Likes. Design tweets that provoke replies and are worth bookmarking.
- Tweets with images or video get significantly more impressions than text-only tweets. Always consider whether a visual element strengthens the tweet.
- The algorithm penalizes tweets with external links in the body. Links reduce distribution. Post the link in a reply instead or use the "link in bio" approach.
- Early engagement in the first 15-30 minutes is critical. The algorithm tests your tweet with a small audience first, then expands based on engagement velocity.
- Dwell time matters. Tweets that make people stop scrolling and read get algorithmic boosts. Multi-line tweets with line breaks create natural dwell time.
- Tweets from accounts that actively reply to others get higher baseline reach. Engagement is a two-way signal.
- Best posting times: 8-10 AM EST or 12-1 PM EST on weekdays. Tuesday through Thursday for professional and B2B content. Saturday morning works for casual content.
- Frequency: 1-3 tweets per day is a sustainable, high-performing cadence.

## Content Structure

### Single Tweet Formats

- **Hot take**: Contrarian opinion that sparks debate. "Most people think X. The truth is Y."
- **Question**: Simple, relatable question that invites replies. "What is the one thing you wish you knew about [topic]?"
- **Listicle**: "5 things I learned about X:" followed by a numbered list, one item per line.
- **Quote + take**: Share a quote and add your unique perspective in 1-2 sentences.
- **Data point**: One surprising stat with your interpretation. "[Stat]. Here is what most people miss:"
- **Before/After**: Contrast two states or perspectives. "Before: [old way]. Now: [new insight]."

### Quote Tweet Structure

1. Highlight the key point from the original tweet.
2. Add your unique angle, experience, or data.
3. Keep under 200 characters to leave room for the quoted content's context.

### Tweet Anatomy

- **Opening words** — The first 5-8 words decide whether someone reads further. Front-load the value or tension.
- **Body** — One idea only. Develop it clearly in 1-3 sentences maximum.
- **Closer** — A question, bold statement, or implication that invites engagement.

## Writing Guidelines

- **One idea per tweet.** Clarity beats cleverness. If you need multiple points, write a thread instead.
- Front-load the value. The first few words of the tweet determine whether someone reads the rest. Start with the strongest word or phrase.
- Use line breaks strategically for readability. A tweet formatted as 2-3 short lines reads better than one dense paragraph.
- Leave approximately 20 characters of headroom for hashtags. Aim for ~260 effective characters of content.
- Use 2-3 hashtags maximum. Place them at the end of the tweet or weave them naturally into the text. More than 3 hashtags signals low-quality content.
- Focus on industry/topic-specific hashtags, not generic ones. #ContentStrategy beats #Success.
- When quote tweeting, add genuine insight. Not "This!" or "So true." Add your experience, a counter-point, or additional data.
- Write tweets that invite replies: questions, fill-in-the-blank prompts, "unpopular opinion" takes, and debate-starting claims.
- Reply to comments on your tweets within the first hour to boost algorithmic momentum.

## Output Format

```
=== TWEET ===
[Tweet text — max 280 characters. Front-load value. One clear idea. Use line breaks for readability.]

=== HASHTAGS ===
#hashtag1 #hashtag2
[2-3 hashtags, placed at the end of the tweet or noted separately]

=== IMAGE (optional) ===
[Image description — what the visual shows, composition, text overlay if any]
[Alt text for accessibility — max 1,000 characters]

=== QUOTE TWEET (if applicable) ===
[URL or reference to the original tweet being quoted]
[Your commentary — max 200 characters to leave room for context]
```

## Quality Criteria

- [ ] Tweet is 280 characters or fewer, with ~260 characters of content leaving room for hashtags
- [ ] First 5-8 words create enough interest to finish reading the tweet
- [ ] Tweet contains exactly one clear idea, not multiple crammed together
- [ ] Hashtags are 2-3 maximum and topic-specific, not generic
- [ ] No external links appear in the tweet body (links go in replies)
- [ ] Tweet is formatted with line breaks for readability where appropriate
- [ ] Content invites a reply, bookmark, or retweet through its framing
- [ ] Quote tweets (if used) add genuine insight, not just agreement
- [ ] Image alt text is included if an image is attached
- [ ] Tweet avoids filler words and gets to the point immediately

## Anti-Patterns

- **Links in tweet body** — Dramatically reduces reach due to algorithmic suppression. Post the link as a reply or use "link in bio."
- **Excessive emojis** — More than 2-3 emojis per tweet looks unprofessional and reduces credibility in professional niches.
- **Hashtag spam** — More than 3 hashtags per tweet signals low-quality content and reduces engagement rather than increasing it.
- **Reposting the same content verbatim** — The algorithm detects duplicate content and suppresses it. Rephrase or add new context when revisiting a topic.
- **Not engaging with replies** — Failing to respond to comments signals to the algorithm that your content does not generate real conversation, reducing future distribution.
- **Using URL shorteners** — Twitter/X already shortens links. Third-party shorteners look suspicious and may be flagged as spam.
- **Auto-cross-posting from other platforms** — Truncated content and broken formatting from Instagram or LinkedIn cross-posts damage credibility and get no engagement.
- **Cramming multiple ideas into one tweet** — A tweet trying to cover 3 topics communicates none of them effectively. If you have multiple points, use a thread.
- **Posting during major breaking news** — Your content will be buried under breaking news engagement. Check current events before posting.
