# Deep Research Prompt Template

> Generated automatically by the /deep-research skill

---

## Prompt for Deep Research

```
TOPIC: "{{TOPIC}}"

RESEARCH TYPE: {{RESEARCH_TYPE}}

CONTEXT: {{CONTEXT}}

SCOPE:
1. FUNDAMENTALS: What is this about? Core concepts, definitions, history/origin.
2. EVIDENCE & DATA: What does the data say? Statistics, studies, market data, documented results.
3. PERSPECTIVES: What do experts think? Multiple viewpoints, debates, expert opinions, key publications.
4. APPLICATIONS: How is this applied? Real-world examples, case studies, frameworks, methodologies.
5. TRENDS: What's current? Emerging patterns, predictions, recent developments (2025/2026).
6. RISKS & GAPS: What are the limitations? Challenges, criticisms, pitfalls, unknowns.

REQUIREMENTS:
{{REQUIREMENTS}}

SOURCES TO RESEARCH:
- Expert blogs, books, and publications
- YouTube talks, interviews, and podcasts
- Industry reports and market data
- Academic papers and studies (if applicable)
- News outlets and journalism
- Case studies and real-world examples
- Community discussions and forums

RESULTS EXPECTED:
1. Overview and context of the topic
2. Key findings organized by dimension (evidence, perspectives, applications)
3. Expert recommendations and frameworks
4. Practical next steps with prioritization
5. Complete references with URLs for deeper reading
```

---

## Type-Specific Scope Extensions

### Market Research
```
ADDITIONAL SCOPE:
- Market size (TAM/SAM/SOM) with sources
- Growth rate and CAGR
- Key players and market share
- Target segments and demographics
- Pricing models and revenue benchmarks
- Regulatory considerations
```

### People/Biography
```
ADDITIONAL SCOPE:
- Career trajectory and key milestones
- Core methodology and frameworks
- Published works (books, courses, talks)
- Key quotes and signature ideas
- Influence and legacy
- Criticisms and controversies
```

### Books/Content
```
ADDITIONAL SCOPE:
- Reading order recommendations
- Key takeaways per book
- Author credentials and methodology
- Comparative analysis (which book for what goal)
- Complementary resources (courses, talks, podcasts)
- Target audience per recommendation
```

### Strategy/Business
```
ADDITIONAL SCOPE:
- Framework step-by-step breakdown
- Implementation examples with results
- Prerequisites and conditions for success
- Common mistakes and anti-patterns
- Metrics to track effectiveness
- Tools and resources needed
```

### Competitive Analysis
```
ADDITIONAL SCOPE:
- Competitor feature matrix
- Pricing comparison
- Market positioning map
- Strengths/weaknesses analysis
- Customer reviews and sentiment
- Strategic gaps and opportunities
```

### Industry/Ecosystem
```
ADDITIONAL SCOPE:
- Value chain mapping
- Key players and relationships
- Regulatory landscape
- Entry barriers
- Technology enablers
- Future disruption vectors
```

---

## Variables

| Variable | Description |
|----------|-----------|
| `{{TOPIC}}` | Refined topic as strategic title |
| `{{RESEARCH_TYPE}}` | Auto-detected or user-specified type |
| `{{CONTEXT}}` | Description of purpose and practical objectives |
| `{{REQUIREMENTS}}` | Specific requirements (geographic scope, language, depth) |
