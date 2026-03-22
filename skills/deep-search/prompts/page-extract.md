## PURPOSE
This file is the **reference documentation** for the extraction format used by deep-search workers.
Workers use inline domain-specific extraction prompts (defined in SKILL.md worker template).
This file documents the full format, examples for all 6 domains, and quality gates.

## ROLE
General-purpose content extractor. Extracts structured, relevant information from any web page.

## TASK
Extract structured, relevant information from the page at {{URL}} related to: {{QUERY}}

## EXTRACTION RULES

### What to Extract

1. **Key Facts** - Concrete information, numbers, dates, specifications
2. **Data Points** - Prices, statistics, measurements, ratings, scores
3. **Process/Steps** - How-to instructions, workflows, timelines
4. **Comparisons** - Pros/cons, tradeoffs, rankings, benchmarks
5. **Expert Opinions** - Quotes, recommendations from authors or cited experts
6. **Warnings/Caveats** - Risks, limitations, common mistakes, disclaimers

### What to SKIP

- Navigation, headers, footers
- Ads, promotional content, affiliate disclaimers
- Generic introductions ("In this article we will...")
- Redundant content already covered
- Author bios (unless the person IS the research subject)
- Cookie banners, popups, sidebar widgets

## OUTPUT FORMAT

```markdown
## Source: {{TITLE}}
URL: {{URL}}
Relevance: HIGH|MEDIUM|LOW

### Key Findings
- {Finding 1 with specific data}
- {Finding 2 with specific data}

### Data Points
- {Price/stat/date/rating 1}
- {Price/stat/date/rating 2}

### Expert Quote
> "{direct quote}" — {author if known}

### Actionable Insights
1. {What to do based on this source}
2. {What to avoid}

### Cross-Reference Notes
- Confirms: {what other sources said}
- Contradicts: {what differs from other sources}
- Adds: {new information not found elsewhere}
```

## QUALITY GATES

Before returning, verify:
- [ ] At least 3 key findings extracted
- [ ] Specific data (numbers, prices, dates, ratings) included when available
- [ ] Direct quotes preserved exactly (not paraphrased)
- [ ] Relevance score is honest (LOW if page didn't help)

## EXAMPLES

### Good Extraction (Products Domain)

```markdown
## Source: Best Wireless Earbuds 2026 — Wirecutter
URL: https://example.com/best-wireless-earbuds
Relevance: HIGH

### Key Findings
- Sony WF-1000XM6 rated best overall for noise cancellation
- Battery life averages 8h with ANC on, 12h without
- Multipoint connection now standard in $100+ tier

### Data Points
- Sony WF-1000XM6: $279 MSRP, currently $229 on Amazon
- Apple AirPods Pro 3: $249, best for iPhone users
- Samsung Galaxy Buds3 Pro: $229, best for Android

### Expert Quote
> "The gap between $100 and $250 earbuds has never been smaller" — Chris Welch, The Verge

### Actionable Insights
1. Wait for Q2 sales if budget is tight — prices drop 20-30%
2. Avoid no-name brands under $30 — reliability issues

### Cross-Reference Notes
- Confirms: Sony leads in ANC (also mentioned in RTINGS review)
- Adds: Multipoint connection comparison (new data point)
```

### Good Extraction (People Domain)

```markdown
## Source: Yann LeCun — Wikipedia + Meta AI
URL: https://example.com/yann-lecun
Relevance: HIGH

### Key Findings
- VP & Chief AI Scientist at Meta (since 2018, prev. Facebook AI Research)
- Turing Award 2018 (shared with Hinton and Bengio) for deep learning
- Pioneer of convolutional neural networks (CNNs) in the 1980s-90s

### Data Points
- Born: 1960, Paris, France
- PhD: University of Pierre and Marie Curie, 1987
- NYU professor since 2003 (Silver Professor of CS)

### Expert Quote
> "Most of human and animal learning is self-supervised" — Yann LeCun, NeurIPS 2022

### Actionable Insights
1. Follow his public posts for contrarian AI takes (often challenges mainstream hype)
2. His JEPA architecture papers are key reading for self-supervised learning

### Cross-Reference Notes
- Confirms: Turing Award shared with Hinton/Bengio
- Adds: Current focus on JEPA and world models (not in older sources)
```

### Good Extraction (Travel Domain)

```markdown
## Source: São Paulo to Tokyo — Flight Comparison 2026
URL: https://example.com/sp-tokyo-flights
Relevance: HIGH

### Key Findings
- No direct flights GRU→NRT/HND; all routes require 1+ stop
- Cheapest options via Middle East (Emirates via DXB, Qatar via DOH)
- Cherry blossom season (late March–April) increases prices 30-40%

### Data Points
- Emirates GRU→DXB→NRT: $950 economy, 22h total (March 2026)
- Qatar GRU→DOH→HND: $1,020 economy, 24h total (March 2026)
- LATAM codeshare via CDG: $1,350 economy, 26h total
- Japan tourist visa: waived for Brazilian passport holders (up to 90 days)

### Expert Quote
> "Book 8-10 weeks before departure for best fares to Japan in spring" — Scott Keyes, Going.com

### Actionable Insights
1. Emirates and Qatar offer best price-to-comfort ratio for this route
2. Avoid booking less than 3 weeks out — prices spike 50%+
3. Apply for Japan Rail Pass BEFORE departure (must be purchased outside Japan)

### Cross-Reference Notes
- Confirms: No direct flights exist (also confirmed by Google Flights)
- Adds: Specific codeshare option via LATAM+Air France (new route)
```

### Good Extraction (Market Domain)

```markdown
## Source: Global SaaS Market Report 2026 — Gartner
URL: https://example.com/saas-market-2026
Relevance: HIGH

### Key Findings
- Global SaaS market reached $247B in 2025, projected $312B by 2027
- Vertical SaaS growing 2.3x faster than horizontal SaaS
- AI-native SaaS startups capturing 18% of new enterprise deals

### Data Points
- TAM 2026: $278B (CAGR 16.2% from 2023)
- Top 5 players: Salesforce (9.2%), Microsoft (8.7%), SAP (4.1%), Oracle (3.8%), Adobe (3.2%)
- SMB segment: fastest growth at 21% YoY
- Average contract value up 12% due to AI feature upsells

### Expert Quote
> "The SaaS market is bifurcating — AI-native platforms will eat legacy vendors within 5 years" — Tomasz Tunguz, Theory Ventures

### Actionable Insights
1. Vertical SaaS in healthcare and fintech are strongest growth areas
2. Pricing pressure increasing — freemium-to-paid conversion down 3pp industry-wide

### Cross-Reference Notes
- Confirms: $278B TAM aligns with Forrester estimate ($271B)
- Contradicts: IDC estimates lower CAGR (14.1% vs 16.2%)
- Adds: AI-native disruption data (not in other reports)
```

### Good Extraction (Technical Domain)

```markdown
## Source: React Server Components — Official Docs
URL: https://example.com/react-server-components
Relevance: HIGH

### Key Findings
- Server Components render on the server only — zero JS shipped to client
- Cannot use useState, useEffect, or browser APIs in Server Components
- 'use client' directive marks boundary between server and client components

### Data Points
- Bundle size reduction: 30-60% for content-heavy pages (measured by Vercel team)
- Time to Interactive improvement: ~40% on average vs full client-side rendering
- Next.js 15+ uses Server Components by default (App Router)

### Expert Quote
> "Server Components are not a replacement for SSR — they're a new primitive" — Dan Abramov, React core team

### Actionable Insights
1. Start by converting static/data-fetching components to Server Components
2. Keep interactive components (forms, modals) as Client Components
3. Avoid passing functions as props across the server/client boundary

### Cross-Reference Notes
- Confirms: Zero JS for server components (also in Next.js docs)
- Adds: Specific bundle size metrics from Vercel benchmarks
```

### Good Extraction (General Domain)

```markdown
## Source: The History and Economics of Coffee — Smithsonian Magazine
URL: https://example.com/history-of-coffee
Relevance: HIGH

### Key Findings
- Coffee originated in Ethiopia (9th century legend of Kaldi the goatherd)
- Second most traded commodity globally after crude oil
- Climate change threatens 50% of current coffee-growing regions by 2050

### Data Points
- Global coffee market: $495B annually (2025)
- Daily consumption: 2.25 billion cups worldwide
- Brazil produces 35% of world's coffee (largest producer since 1840)
- Average American drinks 3.1 cups per day

### Expert Quote
> "Coffee is not just a beverage — it's the economic backbone of 25 million smallholder farmers" — José Sette, International Coffee Organization

### Actionable Insights
1. Arabica prices likely to rise 15-20% by 2028 due to climate impact on Brazilian crops
2. Specialty coffee segment growing 12% YoY — premiumization trend is real

### Cross-Reference Notes
- Confirms: Ethiopia origin story (consistent across all sources)
- Contradicts: Some sources cite 60M farmers (vs 25M cited by ICO)
- Adds: Climate change projection data (new angle)
```

### Honest LOW Relevance

```markdown
## Source: What Are Wireless Earbuds? A Beginner's Guide
URL: https://example.com/earbuds-101
Relevance: LOW

### Key Findings
- Basic explanation of Bluetooth audio (generic)
- No specific product recommendations
- No pricing data

### Actionable Insights
1. Skip this source — too basic for the query

### Cross-Reference Notes
- Adds: Nothing new, beginner tutorial level
```

## EXECUTION

When using WebFetch, pass this as the prompt:

```
Extract information relevant to: {original query}

Focus on:
1. Specific facts, numbers, dates, prices, ratings
2. Concrete examples and data points
3. Expert opinions and direct quotes
4. Warnings, caveats, and limitations

Skip: navigation, ads, generic intros.

Format as structured markdown with Key Findings, Data Points, Expert Quotes, and Actionable Insights sections.
```
