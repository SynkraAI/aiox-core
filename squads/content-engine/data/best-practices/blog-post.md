---
name: "Blog Post"
platform: "blog"
content_type: "post"
description: "Long-form blog posts optimized for readability, engagement, and clear value delivery with structured subheadings"
whenToUse: |
  Creating agents that produce blog posts, articles, or long-form content marketing.
constraints:
  optimal_word_count: "1500-2500"
  title_max_chars: 70
  meta_description_chars: 160
  subheading_frequency: "every 200-300 words"
version: "1.0.0"
---

## Platform Rules

- Average time on page is the strongest engagement signal. Blog posts that keep readers scrolling for 3-5 minutes outperform those that get abandoned in the first 30 seconds. Structure and readability directly determine this metric.
- Posts between 1,500-2,500 words hit the optimal balance of depth and retention. Below 800 words, content is perceived as thin and struggles to rank. Above 3,000 words, completion rates drop unless the topic demands exhaustive coverage.
- Mobile readability is non-negotiable. Over 60% of blog traffic comes from mobile devices. Long paragraphs, wide images, and dense formatting that work on desktop become unreadable walls on small screens.
- Subheadings serve as a scannable table of contents. Studies show 73% of readers scan blog posts rather than reading word by word. If the subheadings alone do not convey the article's value, the structure needs reworking.
- Internal linking keeps readers on site and distributes page authority. Posts with 3+ internal links to related content have higher average session duration and lower bounce rates.
- External links to authoritative sources (research, industry leaders, official documentation) increase credibility and can positively impact search ranking when linking to genuinely relevant resources.
- Publishing consistency builds audience expectation and return visits. A regular cadence (1-2 posts per week) outperforms sporadic publishing bursts followed by silence.
- Visual breaks every 300 words prevent fatigue: images, callout boxes, bullet lists, or blockquotes. Unbroken text spanning more than 300 words causes readers to disengage.

## Content Structure

### Blog Post Architecture

1. **Title** — Under 70 characters. Clearly communicates what the reader will learn or gain. Front-load the key topic. Avoid vague or overly clever titles that sacrifice clarity for creativity.
2. **Meta description** — 150-160 characters. Summarizes the post's value proposition in one sentence. This appears in search results and social shares — it is a second headline.
3. **Intro hook (2-3 sentences)** — Open with a surprising stat, bold claim, relatable problem, or a story that places the reader in a scenario. Then state exactly what the post will deliver.
4. **Body sections (3-6 H2 sections)** — Each section covers one major point with its own H2 subheading. Sections are 200-300 words each with H3 sub-sections for deeper breakdowns.
5. **Conclusion (3-5 sentences)** — Summarize the key takeaways in 1-2 sentences, then deliver a clear CTA: read a related post, download a resource, leave a comment, or try a specific action.

### Section-Level Structure

- **H2 subheading** — Descriptive, scannable, and self-contained. A reader should understand the section's value from the heading alone.
- **Opening sentence** — State the section's key point immediately. Do not build up to the insight.
- **Supporting content** — Evidence, examples, data, or step-by-step instructions. Use bullet points for lists of 3+ items.
- **Transition** — Final sentence bridges to the next section or reinforces the section's takeaway.

### Effective Post Formats

- **How-to guide**: "How to [achieve X]: A Step-by-Step Guide"
- **Listicle**: "7 [Things] That [Outcome] (and How to Use Them)"
- **Problem/Solution**: "Why [Problem Exists] and What to Do About It"
- **Lessons learned**: "What I Learned From [Experience]: [N] Key Takeaways"
- **Comparison**: "[Option A] vs. [Option B]: Which Is Right for [Audience]?"

## Writing Guidelines

- **Hook the reader in the first 2-3 sentences or lose them.** Open with a stat, question, bold claim, or relatable scenario. Never start with a dictionary definition or generic background. "Content marketing is important" loses readers. "87% of blog posts get zero organic traffic" keeps them.
- Write in short paragraphs: 3-4 lines maximum on desktop, which translates to 2-3 lines on mobile. Single-sentence paragraphs are powerful for emphasis.
- Bold key phrases and takeaways within paragraphs so scanners can extract value without reading every word.
- Use bullet points and numbered lists for any sequence of 3+ items. Lists are easier to scan than inline comma-separated items.
- Subheadings every 200-300 words. Each H2 should read like a mini-headline that a scanner would click on if presented independently.
- Write in second person ("you") to create direct connection with the reader. First person ("I/we") works for personal stories and experience-based authority.
- Include at least one visual break (image, callout box, blockquote, or list) every 300 words. Continuous text blocks cause reader fatigue and increase bounce rate.
- End with a specific, actionable CTA. "What do you think?" is weak. "Try implementing [technique] this week and comment below with your results" is strong.
- Include 3+ internal links to related content on your site and 2+ external links to authoritative sources. Link naturally within context, not in a dumped list at the end.
- Write the title last, after you know what the post delivers. Front-load the most important keyword or concept in the first 40 characters.

## Output Format

```
=== TITLE ===
[Under 70 characters — clear, specific, keyword front-loaded]

=== META DESCRIPTION ===
[150-160 characters — summarizes the post's value proposition in one sentence]

=== INTRO ===
[Hook — surprising stat, bold claim, relatable problem, or opening story. 1-2 sentences.]

[Promise — exactly what the reader will learn or gain from this post. 1 sentence.]

=== BODY ===
## [H2 Section 1 Title]
[200-300 words — one major point with evidence, examples, or steps. Include bullet points or visuals where appropriate.]

## [H2 Section 2 Title]
[200-300 words — one major point with evidence, examples, or steps.]

### [H3 Subsection if needed]
[Deeper breakdown of a specific aspect — 100-150 words.]

## [H2 Section 3 Title]
[200-300 words — one major point with evidence, examples, or steps.]

## [H2 Section 4 Title]
[200-300 words — one major point with evidence, examples, or steps.]

[Continue for 3-6 H2 sections total]

=== CONCLUSION ===
[Key takeaway summary — 1-2 sentences.]

[CTA — specific, actionable ask. 1-2 sentences.]

=== POST NOTES ===
Target word count: [1500-2500]
Internal links needed: [3+ with suggested anchor text]
External links needed: [2+ to authoritative sources]
Visual breaks: [List of suggested image/callout placements]
```

## Quality Criteria

- [ ] Title is under 70 characters and clearly communicates the post's value
- [ ] Meta description is 150-160 characters and serves as a compelling second headline
- [ ] Intro hooks the reader in the first 2-3 sentences with a stat, bold claim, or relatable scenario
- [ ] Post contains 3-6 H2 sections, each covering one major point
- [ ] Subheadings appear every 200-300 words and are scannable as a standalone outline
- [ ] Paragraphs are 3-4 lines maximum with key phrases bolded
- [ ] At least one visual break (image, callout, list, or blockquote) every 300 words
- [ ] 3+ internal links and 2+ external links are included with natural anchor text
- [ ] Total word count is between 1,500-2,500 words
- [ ] Conclusion ends with a specific, actionable CTA (not generic "What do you think?")

## Anti-Patterns

- **Walls of text** — Paragraphs exceeding 5-6 lines on desktop become impenetrable on mobile. Readers bounce rather than parse dense blocks. Short paragraphs and visual breaks are not optional — they are structural requirements for retention.
- **No subheadings** — A 2,000-word post without H2/H3 subheadings is functionally a wall of text. Scanners (73% of readers) cannot extract value and leave. Subheadings serve as both navigation and content promises.
- **Clickbait titles that do not deliver** — "This One Trick Changed Everything" followed by generic advice destroys trust. The reader feels deceived, bounces quickly, and never returns. High bounce rates also signal low quality to search engines.
- **Thin content under 800 words** — Short posts struggle to provide sufficient depth, rank poorly for competitive keywords, and signal low effort. If the topic can be covered in 500 words, it may be better as a social post than a blog article.
- **No conclusion or CTA** — Posts that simply stop after the last body section feel incomplete. The reader has invested 3-5 minutes and receives no guidance on what to do next. Every post needs a clear ending and next step.
- **Dictionary definition openings** — Starting with "[Topic] is defined as..." is the most common sign of filler content. It adds no value, wastes the most important real estate in the post, and signals that the writer has nothing original to say.
- **Link dumping** — Placing all internal and external links in a list at the bottom of the post rather than weaving them naturally into the content. Contextual links are clicked more and provide more value to the reader.
- **No visual breaks** — Continuous text for 500+ words without an image, list, callout, or blockquote causes reading fatigue. Even well-written content gets abandoned when it is visually monotonous.
- **Writing for search engines instead of humans** — Unnaturally forcing keywords into every sentence makes content awkward and unpleasant to read. Write for clarity first; optimize for search second.
