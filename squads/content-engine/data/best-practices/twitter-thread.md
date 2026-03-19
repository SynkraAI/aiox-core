---
name: "Twitter/X Thread"
platform: "twitter"
content_type: "thread"
description: "Multi-tweet threads optimized for long-form storytelling, education, and sustained engagement"
whenToUse: |
  Creating agents that produce Twitter/X threads or multi-tweet narratives.
constraints:
  tweet_max_chars: 280
  optimal_thread_length: "5-15 tweets"
  hashtags: "only on first tweet"
version: "1.0.0"
---

## Platform Rules

- Threads receive 2-3x more impressions than standalone tweets. The multi-tweet format increases dwell time and creates multiple engagement touchpoints.
- Engagement is weighted: Replies > Bookmarks > Retweets > Likes. Threads that are bookmark-worthy (educational, reference-quality) get sustained distribution.
- Early engagement on the first tweet (first 15-30 minutes) is critical. If the first tweet does not perform, the thread's remaining tweets receive limited distribution.
- Replying to your own tweet within 1 hour can boost the thread's visibility. Consider adding a summary or additional context as a self-reply.
- The algorithm penalizes tweets with external links. If including links, place them in the final tweet or as a reply below the thread.
- Threads from accounts that actively engage with others' content get higher baseline reach.
- Best posting times: 8-10 AM EST or 12-1 PM EST on weekdays, particularly Tuesday through Thursday. Threads need immediate engagement to gain traction, so timing matters more than for standalone tweets.
- Avoid posting threads during low-traffic hours or major breaking news cycles.

## Content Structure

### Thread Architecture

1. **Hook tweet (Tweet 1/N)** — The most important tweet. It must stand completely alone as a compelling, self-contained statement. This is what appears in the feed and determines whether anyone reads further. Bold claim, surprising stat, or "Here is what I learned from..." format.
2. **Context tweet (Tweet 2/N)** — Brief background establishing why this matters and who should keep reading. Sets the stage for the body.
3. **Body tweets (Tweets 3-N-2)** — One insight, point, or story beat per tweet. Numbered for progress tracking. Each tweet should deliver standalone value while advancing the larger narrative.
4. **Summary tweet (Tweet N-1)** — Recap the key takeaways in bullet points. This is the second most bookmarked tweet in a thread after the first.
5. **CTA tweet (Tweet N/N)** — Ask for a follow, retweet of the first tweet for reach, or bookmark for reference. Include a link back to the first tweet for easy sharing.

### Tweet-Level Structure

- Each individual tweet in the thread should be a complete thought. Avoid splitting a sentence across two tweets.
- Use numbering format (1/10, 2/10... or 1., 2., 3...) so readers know the thread length and their progress.
- Start each tweet with the key point, then support it. Do not bury the insight at the end.

Thread length: 5-8 tweets for focused insights, 9-12 for comprehensive breakdowns, 13-15 maximum. Beyond 15, engagement drops sharply. Never pad to hit a target length.

## Writing Guidelines

- **The first tweet is everything.** It must be compelling as a standalone tweet. If someone only sees tweet 1 and never clicks the thread, it should still deliver value or create irresistible curiosity.
- Number every tweet so readers know the thread length. "1/10" or "(1)" format both work. Knowing the length helps readers decide to commit.
- One point per tweet. Do not cram multiple ideas into a single tweet. Each tweet should feel like a self-contained insight with a clear beginning and end.
- Use the last tweet for a summary and CTA. Recap the 3-5 key points in bullet format, then ask for a follow, retweet of the first tweet, or bookmark.
- Use hashtags only on the first tweet. Hashtags on every tweet in a thread look spammy and reduce readability. 2-3 relevant hashtags on tweet 1 is sufficient.
- Write conversationally. Threads are a storytelling format. Use "I" instead of "one," contractions instead of formal language, and short sentences instead of complex ones.
- Include a "retweet the first tweet" call to action in the final tweet. This is the primary sharing mechanism for threads and extends reach significantly.
- Keep each tweet under 280 characters but aim for substance. A tweet that is only 40 characters feels like padding.
- Reply to comments on the thread within the first hour. Engagement velocity in the early window determines total distribution.

## Output Format

```
=== THREAD ===
TWEET 1/N (Hook):
[Standalone compelling statement — bold claim, surprising stat, or curiosity gap. Must work even if no one reads the rest. Max 280 chars.]

#hashtag1 #hashtag2

TWEET 2/N (Context):
[Why this matters. Who should read this. Brief background. Max 280 chars.]

TWEET 3/N (Point 1):
[First key insight — one clear point with support. Max 280 chars.]

TWEET 4/N (Point 2):
[Second key insight — one clear point with support. Max 280 chars.]

TWEET 5/N (Point 3):
[Third key insight — one clear point with support. Max 280 chars.]

...

TWEET (N-1)/N (Summary):
Key takeaways:
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

TWEET N/N (CTA):
[If this was valuable, retweet tweet 1 to share it with your audience.

Follow @[handle] for more on [topic].

Bookmark this thread for reference.]

=== THREAD NOTES ===
Total tweets: [N]
Primary topic: [Topic]
Target audience: [Who this is for]
```

## Quality Criteria

- [ ] First tweet works as a compelling standalone statement, even without the rest of the thread
- [ ] Thread is 5-15 tweets long (not shorter, not longer)
- [ ] Every tweet contains exactly one clear point or insight
- [ ] Tweets are numbered (1/N format) so readers know the length
- [ ] Hashtags appear only on the first tweet (2-3 maximum)
- [ ] No tweet splits a sentence across tweet boundaries
- [ ] Summary tweet recaps key takeaways in bullet format
- [ ] Final tweet includes a CTA: retweet tweet 1, follow, or bookmark
- [ ] No external links in tweet bodies (links go in the final tweet or a reply)
- [ ] Each tweet delivers standalone value while advancing the thread's narrative

## Anti-Patterns

- **Thread with no hook** — Starting with "Thread on [topic]:" without any compelling reason to read guarantees low engagement. The first tweet must create curiosity or deliver a striking insight.
- **Threads longer than 15 tweets** — Engagement drops sharply after tweet 12-15. Readers lose interest and stop scrolling. If your content requires more, split into multiple threads.
- **Splitting sentences across tweets** — "And the most important thing is... (2/10) ...that you always start early." This creates a disjointed reading experience and frustrates readers who see individual tweets out of context.
- **Hashtags on every tweet** — Using hashtags on all tweets in a thread looks spammy and clutters the reading experience. Limit hashtags to tweet 1 only.
- **No numbering** — Without numbering, readers do not know how long the thread is and cannot gauge their commitment. Always number tweets.
- **Links in tweet bodies** — External links reduce distribution. Save links for the final tweet or post them as a reply below the thread.
- **Not engaging with replies** — A thread that generates replies but gets no author responses signals to the algorithm that the conversation is one-directional.
- **Posting threads at low-traffic hours** — Threads depend on immediate engagement velocity more than standalone tweets. Posting at 11 PM on a Sunday kills distribution.
- **Padding with filler tweets** — Tweets like "Let me explain..." without actual content waste reader attention and feel artificially inflated.
- **Reposting the same thread verbatim** — The algorithm detects duplicates. If revisiting a topic, rewrite with new framing or updated data.
