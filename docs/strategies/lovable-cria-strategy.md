# Lovable Cria - Quiz Strategy Document

**Story:** LOV-1 Lovable Quiz Integration Setup
**Phase:** 1 - Strategic Foundation
**Author:** @pm (Bob/Morgan)
**Date:** 2026-02-22
**Status:** Active

---

## 1. Core Value Proposition

### Why This Quiz Exists

The "Metodo Cria" quiz exists to interrupt the scroll of someone who quietly suspects they could build something online -- but has never started. It converts passive curiosity into active self-identification by answering the question: **"What kind of digital creator am I?"**

### Why Someone Stops Scrolling

People stop for **self-knowledge wrapped in validation**. The hook is not "take our quiz" -- it is "discover something about yourself you already feel but cannot name." The quiz mirrors back their ambition in a structured way, making the abstract ("I want digital freedom") feel concrete ("You are a Builder archetype -- here is your path").

### Fear/Pain Addressed

| Pain Point | Emotional Weight | Quiz Response |
|------------|-----------------|---------------|
| Job instability / layoff anxiety | HIGH | "You already sense the system is fragile. This quiz maps your exit." |
| Imposter syndrome | CRITICAL | "You do not need permission. Your profile proves you have the raw material." |
| Analysis paralysis | HIGH | "Stop researching. Your result gives you ONE clear next step." |
| Side income pressure | MEDIUM | "Your answers reveal which digital model fits your life right now." |
| Social comparison | MEDIUM | "Your path is not their path. See YOUR archetype." |

### Transformation Promise

**Before quiz:** "I want to do something online but I do not know what, where to start, or if I am capable."
**After quiz:** "I know my creator archetype, I have a clear first step, and someone is ready to guide me."

The quiz does not sell a course. It sells **clarity** -- the most valuable currency for someone stuck in ambiguity.

---

## 2. Target Audience Psychology

### Primary Persona: "O Inquieto Digital"

**Demographics:**
- Age: 25-40
- Location: Brazil (tier 1 and tier 2 cities)
- Income: R$3,000 - R$10,000/month (employed but not satisfied)
- Education: Some college or complete, not necessarily in tech
- Device: Mobile-first (85%+ will take quiz on phone)

**Psychographics:**
- Consumes content about entrepreneurship but has not started
- Follows digital creators on Instagram/YouTube
- Has downloaded free PDFs, watched webinars, maybe bought one cheap course
- Feels informed but paralyzed -- "I know a lot but I have done nothing"
- Values autonomy over wealth (freedom > money as primary motivator)
- Distrusts overpromise ("fique rico rapido" fatigue)

### Emotional State Map

```
Current State                    Desired State
--------------                   ---------------
Employed but unfulfilled    -->  Building something of their own
Consuming content           -->  Creating content/products
Comparing to others         -->  Following their own path
Afraid to start             -->  Taking the first step with confidence
Scattered ideas             -->  One clear direction
Alone in the journey        -->  Guided and supported
```

### Objections to Overcome (In Quiz Flow)

| Objection | Where Addressed | How |
|-----------|----------------|-----|
| "This is just another quiz that leads to a sales pitch" | Opening copy | Frame as self-discovery, no mention of product |
| "I do not have time" | Quiz length indicator | "2 minutes. 7 questions. 1 revelation." |
| "Results will be generic" | Result page | Hyper-specific archetype with personalized next step |
| "I am not tech-savvy enough" | Question framing | Questions about preferences/personality, NOT skills |
| "Why should I give my WhatsApp?" | CTA framing | "Receive your complete profile + first action step" |

---

## 3. Conversion Architecture

### Funnel Structure

```
[Ad / Organic Post]
       |
   Landing Page (Quiz Cover)
       |  Target: 70% click "Start"
       |
   7 Questions (progressive engagement)
       |  Target: 85% completion once started
       |
   Result Page (Archetype Reveal)
       |  Target: 90% read full result
       |
   Lead Capture (Email + WhatsApp)
       |  Target: 60% email, 80% WhatsApp of those who see CTA
       |
   Thank You + WhatsApp Deep Link
       |  Target: 70% actually message
       |
   [WhatsApp Automation Sequence]
```

### Primary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Visitor-to-start rate | 70% | Clicks "Comecar" / page views |
| Quiz completion rate | 85% | Finished / started |
| Overall conversion (visitor to lead) | 15%+ | Leads / page views |
| Email capture rate | 60% | Of those who see result |
| WhatsApp opt-in rate | 80% | Of those who provide email |
| WhatsApp message rate | 70% | Actually send first message |
| Average time on quiz | 90-120 seconds | Analytics |

### Secondary Metrics

| Metric | Purpose |
|--------|---------|
| Drop-off by question | Identify friction points |
| Archetype distribution | Validate question design balance |
| Geographic split | Inform ad targeting |
| Device split | Confirm mobile-first assumption |
| Time-of-day completion | Optimize ad scheduling |

---

## 4. Quiz Architecture

### Archetype Framework

[AUTO-DECISION] How many archetypes? --> 4 archetypes (reason: fewer than 4 feels generic, more than 5 creates decision fatigue and complicates result page design; 4 maps cleanly to a 2x2 matrix)

**Proposed Archetypes (2x2 Matrix):**

| | Action-Oriented | Reflection-Oriented |
|---|---|---|
| **People-Focused** | O Comunicador (The Communicator) | O Mentor (The Mentor) |
| **Product-Focused** | O Construtor (The Builder) | O Estrategista (The Strategist) |

Each archetype gets:
- A name and one-line identity statement
- 3 strengths relevant to digital business
- 1 primary digital business model recommendation
- 1 concrete first action step
- A "famous example" for social proof

### Question Strategy (7 Questions)

| # | Purpose | Type | Example Theme |
|---|---------|------|---------------|
| 1 | Warm-up / engagement | Scenario | "Saturday morning, no obligations. What do you do?" |
| 2 | Communication style | Preference | "How do you prefer to share what you know?" |
| 3 | Risk tolerance | Scenario | "A friend proposes a side project. Your reaction?" |
| 4 | Value driver | Ranking | "What matters most: freedom, impact, money, recognition?" |
| 5 | Work style | Preference | "Do you prefer to work alone or with people?" |
| 6 | Content relationship | Behavior | "When you learn something new, what do you do with it?" |
| 7 | Identity / commitment | Emotional | "What sentence resonates most with you?" |

[AUTO-DECISION] Question format? --> Mix of scenario + preference (reason: pure personality quizzes feel clinical; scenarios create emotional engagement and reduce "right answer" gaming)

---

## 5. Technical Integration Notes

### Lovable Export Requirements

- Single-page React app (quiz + result on same page, no routing needed)
- State management: local useState (no external store)
- Responsive: mobile-first, 375px minimum
- Form submission: POST to webhook endpoint (n8n or Supabase edge function)
- WhatsApp deep link: `https://wa.me/55XXXXXXXXXXX?text=encoded-message`
- Analytics events: page_view, quiz_start, question_N, quiz_complete, lead_capture

### Data Capture Schema

```
{
  email: string (required)
  whatsapp: string (optional but prompted)
  archetype: string (computed)
  answers: number[] (raw scores)
  source: string (utm params)
  timestamp: ISO string
  device: string (mobile/desktop)
}
```

---

## 6. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low completion rate (<60%) | Medium | High | A/B test question count (5 vs 7), add progress bar |
| WhatsApp opt-in below 50% | Low | High | Test CTA copy variants, ensure result feels incomplete without WA |
| Generic-feeling results | Medium | Medium | Invest in copy specificity per archetype, add personalized stats |
| Mobile UX friction | Low | High | Lovable mobile preview mandatory before launch |
| LGPD compliance gap | Medium | High | Add consent checkbox, link to privacy policy |
| Ad platform rejection | Low | Medium | Avoid income claims in ad copy, focus on self-discovery |

---

## 7. Auto-Decisions Log

| Question | Decision | Reason |
|----------|----------|--------|
| Number of archetypes | 4 | Clean 2x2 matrix, avoids decision fatigue, manageable copy workload |
| Question count | 7 | Sweet spot: enough for valid archetype mapping, short enough for mobile completion |
| Question format | Scenario + preference mix | Higher engagement than pure personality scales |
| Language | PT-BR casual | Target audience, cultural fit, trust building |
| Primary CTA | WhatsApp over email | Higher engagement rates in BR market, instant connection |
| Quiz model | Single-page (no routing) | Simpler Lovable export, faster load, no navigation abandonment |

---

## Next Steps

1. **@ux (Phase 2):** Use this document as creative brief for Lovable wireframe
2. **Copy writer:** Use `/docs/strategies/copy-direction.md` for all quiz text
3. **@dev:** Use Technical Integration Notes for implementation spec
4. **Post-launch:** Validate metrics against targets within 72 hours, iterate

---

*Strategy by @pm | Metodo Cria Quiz | LOV-1*
