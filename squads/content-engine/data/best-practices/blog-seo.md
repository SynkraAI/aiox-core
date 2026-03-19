---
name: "Blog Post (SEO)"
platform: "blog"
content_type: "seo"
description: "SEO-optimized blog posts designed for organic search traffic, featured snippets, and topical authority"
whenToUse: |
  Creating agents that produce SEO-optimized blog posts or search-targeted content.
constraints:
  optimal_word_count: "2000-3000"
  title_max_chars: 60
  meta_description_chars: 160
  keyword_density: "1-2%"
  subheading_frequency: "every 200-300 words"
  min_internal_links: 3
  min_external_links: 2
version: "1.0.0"
---

## Platform Rules

- Search intent is the single most important ranking factor. Google categorizes queries into four intent types: informational ("how to"), navigational ("brand + feature"), commercial ("best X for Y"), and transactional ("buy X"). Content that mismatches intent will not rank regardless of quality.
- Comprehensive content outranks shallow content. Posts that thoroughly cover a topic, address related questions, and satisfy the searcher's full information need earn longer dwell times and higher rankings.
- Keyword placement follows a hierarchy of impact: title tag (front-loaded) > H1 > first 100 words > H2 subheadings > body text > meta description > image alt text. Distribute the primary keyword naturally across these locations.
- Keyword density should stay between 1-2% of total word count. Below 1%, the content may not signal topical relevance clearly enough. Above 2-3%, it reads as stuffing and risks algorithmic penalties.
- Featured snippets (position zero) are triggered by content that directly answers a specific question in paragraph (40-60 words), list (5-8 items), or table format immediately after an H2 that contains the question.
- Internal linking distributes page authority and signals content relationships to search engines. Every SEO post should link to 3+ related pages on the same domain with descriptive anchor text (not "click here").
- External links to authoritative sources (research papers, official docs, industry leaders) signal content credibility. Posts with 2+ quality external links tend to rank higher than those with none.
- Core Web Vitals affect rankings. Heavy images without compression, excessive scripts, and layout shifts hurt performance. Optimize images (WebP format, compressed, with width/height attributes) and keep the page lightweight.
- AI Overviews are increasingly replacing traditional featured snippets for complex queries. Structured, well-cited content is more likely to be referenced as a source in AI-generated summaries.

## Content Structure

### SEO Blog Post Architecture

1. **Title tag** — Under 60 characters. Primary keyword front-loaded within the first 40 characters. Clearly communicates the post's value. Must match search intent.
2. **Meta description** — 150-160 characters. Includes the primary keyword naturally. Functions as ad copy for the search result — must compel the click.
3. **H1 heading** — Contains the primary keyword. Can be slightly longer than the title tag since it is not character-limited by search results.
4. **Intro (first 100 words)** — Include the primary keyword within the first 100 words. Open with the searcher's problem or question, then promise a comprehensive answer.
5. **Body sections (5-8 H2 sections)** — Each H2 targets a related subtopic or question. Include the primary keyword in 2-3 H2 subheadings naturally. Use H3 subheadings for deeper breakdowns within sections.
6. **FAQ section** — 3-5 questions from "People Also Ask" for the target keyword. Answer each in 40-60 words to target featured snippets and AI Overviews.
7. **Conclusion** — Summarize key takeaways. Include the primary keyword one final time. End with a CTA (related post, resource download, or action prompt).

### Featured Snippet Optimization

- **Paragraph snippets**: Place a concise 40-60 word answer immediately after an H2 that phrases the question. Follow with expanded detail.
- **List snippets**: Use ordered or unordered lists with 5-8 items. The H2 should frame the list ("X Ways to..." or "Steps to...").
- **Table snippets**: Use HTML tables for comparative data. Include clear column headers and 3-5 rows of structured data.

Cover the topic comprehensively enough that the reader does not need to return to search results. Address related questions from "People Also Ask" and include original data or analysis not found in competing articles.

## Writing Guidelines

- **Match search intent before writing a single word.** Search the target keyword, analyze the top 5 results, and understand what format (guide, list, comparison, tutorial) and depth Google is rewarding. Then match or exceed it.
- Front-load the primary keyword in the title tag, ideally within the first 40 characters. "Email Marketing Guide: 10 Strategies for 2026" outranks "The Ultimate Guide to Everything About Email Marketing."
- Include the primary keyword in the first 100 words naturally. Forced insertion ("In this article about [keyword], we will discuss [keyword]...") reads awkwardly and signals low-quality content.
- Use the primary keyword in 2-3 H2 subheadings, but not all of them. Vary with synonyms, related terms, and natural language variations. This captures long-tail queries and avoids over-optimization.
- Write for a Flesch-Kincaid readability score of 60+ (approximately 8th grade reading level). Short sentences, common words, and active voice. Technical topics can go slightly lower, but clarity is always the goal.
- Use descriptive anchor text for internal links. "Learn more about email subject line formulas" outperforms "click here" for both user experience and search engine context.
- Add alt text to every image that describes the image content and includes the keyword where relevant. Alt text like "email-marketing-guide.jpg" is useless. "Bar chart showing email open rates by industry in 2026" provides value.
- Include an FAQ section targeting "People Also Ask" queries. Answer each question concisely (40-60 words) in the paragraph immediately following the question heading. This is the primary format for featured snippet capture.
- Write 2,000-3,000 words for competitive keywords. Longer content correlates with higher rankings, but only when every section adds genuine value. Padding word count with filler actively harms rankings through reduced dwell time.
- Update published content quarterly. Refreshing data, adding new sections, and updating examples signals freshness to search engines and can recover declining rankings.

## Output Format

```
=== TARGET KEYWORD ===
Primary: [Exact phrase to rank for] | Secondary: [2-3 long-tail variations]
Search intent: [Informational / Navigational / Commercial / Transactional]

=== TITLE TAG ===
[Under 60 characters — primary keyword front-loaded in first 40 chars]

=== META DESCRIPTION ===
[150-160 characters — includes primary keyword, compelling click copy]

=== INTRO ===
[First 100 words — keyword included naturally. Opens with problem/question, promises comprehensive answer.]

=== BODY ===
## [H2 Section 1 — contains primary or secondary keyword]
[200-300 words — one subtopic with evidence, examples, or steps.]

## [H2 Section 2 — natural language variation]
[200-300 words — related subtopic or question. Continue for 5-8 H2 sections total.]

=== FAQ SECTION ===
### [Question from "People Also Ask" 1]
[40-60 word direct answer optimized for featured snippet capture.]

### [Question from "People Also Ask" 2]
[40-60 word direct answer.]

=== CONCLUSION ===
[Key takeaway with primary keyword. CTA to related post or resource. 2-3 sentences.]

=== SEO CHECKLIST ===
Internal links: [3+] | External links: [2+] | Word count: [2000-3000] | Keyword density: [1-2%]
```

## Quality Criteria

- [ ] Title tag is under 60 characters with the primary keyword in the first 40 characters
- [ ] Meta description is 150-160 characters, includes the primary keyword, and compels the click
- [ ] Primary keyword appears in the first 100 words naturally
- [ ] Primary keyword is in 2-3 H2 subheadings without forcing it into all of them
- [ ] Keyword density is between 1-2% (not below, not above)
- [ ] 5-8 H2 sections with subheadings every 200-300 words
- [ ] FAQ section contains 3-5 questions with 40-60 word answers targeting featured snippets
- [ ] 3+ internal links with descriptive anchor text (not "click here")
- [ ] 2+ external links to authoritative, relevant sources
- [ ] Every image has descriptive alt text that includes the keyword where naturally appropriate
- [ ] Content satisfies the target search intent fully (reader does not need to return to search results)
- [ ] Total word count is between 2,000-3,000 words

## Anti-Patterns

- **Keyword stuffing (above 3% density)** — Repeating the keyword in every sentence triggers Google's spam detection. Over-optimized content is actively penalized with ranking demotions.
- **Thin content under 1,500 words** — For competitive keywords, thin content cannot outrank comprehensive competitors. Google associates depth with topical authority for informational queries.
- **Ignoring search intent** — Writing a comparison when Google ranks how-to guides, or an informational piece when the SERP shows commercial pages. Mismatched intent means zero ranking potential regardless of quality.
- **Duplicate or near-duplicate content** — Substantially similar content across multiple URLs cannibalizes your own rankings. Google suppresses duplicates, splitting your authority.
- **No meta description** — Google auto-generates one from page content when left blank. The result is almost always less compelling, reducing click-through rates from search results.
- **Orphan pages with no internal links** — Pages with no inbound internal links are hard for search engines to discover and receive no transferred authority, making ranking significantly harder.
- **"Click here" anchor text** — Generic anchors provide no topical context to search engines. Descriptive anchors ("email subject line best practices") pass relevance and improve linked page rankings.
- **Forcing keywords into every heading** — Every H2 containing the exact keyword reads as robotic and over-optimized. Use natural variations and related terms across headings.
- **Publishing and forgetting** — Content not updated degrades in rankings as competitors publish fresher coverage. Quarterly reviews maintain positions.
- **Skipping the FAQ section** — "People Also Ask" appears for 60%+ of queries. Missing the FAQ section forfeits a high-probability featured snippet opportunity.
