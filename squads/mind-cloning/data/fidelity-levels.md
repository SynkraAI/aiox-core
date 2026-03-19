# Fidelity Levels

Reference data for clone fidelity classification.

---

## Fidelity Scale

| Level | Fidelity | Sources Required | Voice Score | Thinking Score |
|-------|----------|-----------------|-------------|---------------|
| **Basic** | 60-75% | Web only (auto-acquired) | 6/10 | 5/9 |
| **Intermediate** | 75-85% | Curated (manual selection) | 7/10 | 6/9 |
| **Premium** | 85-95% | Extensive (books + interviews) | 9/10 | 8/9 |
| **Elite** | 93-97% | Crown jewel (direct access) | 10/10 | 9/9 |

---

## Level Descriptions

### Basic (60-75%)
- **Sources:** Primarily web-acquired, mostly Tier 2-3
- **Voice:** Captures general tone and common phrases
- **Thinking:** Identifies main framework, basic heuristics
- **Limitation:** May confuse expert's views with third-party interpretations
- **Use case:** Quick persona for brainstorming, not for serious representation

### Intermediate (75-85%)
- **Sources:** Curated mix of Tier 1-2, some user materials
- **Voice:** Captures vocabulary, stories, and tone dimensions accurately
- **Thinking:** Maps frameworks and key heuristics with rationale
- **Limitation:** May miss subtleties, contradictions underrepresented
- **Use case:** Content creation assistance, teaching aid

### Premium (85-95%)
- **Sources:** Extensive Tier 0-1, books fully processed
- **Voice:** Near-complete voice genome including immune system and contradictions
- **Thinking:** Complete cognitive architecture with veto heuristics and blind spots
- **Limitation:** May still miss very private/unpublished thinking patterns
- **Use case:** Professional representation, decision support, mentoring

### Elite (93-97%)
- **Sources:** Crown jewel - direct access, private materials, verified by someone who knows the expert
- **Voice:** Full voice DNA with paradoxes preserved and validated
- **Thinking:** Complete decision architecture with edge cases and handoff triggers
- **Limitation:** Still an approximation - 100% fidelity is impossible
- **Use case:** High-stakes representation, authorized digital twin

---

## Why 100% is Impossible

- Humans are non-deterministic - same input, different output on different days
- Internal state (mood, energy, context) affects responses unpredictably
- Experts evolve - today's clone may not match tomorrow's expert
- Some knowledge is tacit - even the expert can't articulate it
- Context-dependent behavior can't be fully captured in rules

**Target:** A clone that people who know the expert would recognize as "that's definitely them" in 9 out of 10 interactions.

---

## Calculating Fidelity

```
voice_percentage = (voice_score / 10) * 100
thinking_percentage = (thinking_score / 9) * 100
raw_fidelity = (voice_percentage * 0.5) + (thinking_percentage * 0.5)

# Apply source quality multiplier
if tier_0_sources >= 3: multiplier = 1.05
elif tier_1_sources >= 8: multiplier = 1.02
elif tier_1_sources >= 5: multiplier = 1.00
else: multiplier = 0.95

final_fidelity = min(97, raw_fidelity * multiplier)
```

**Note:** Fidelity is capped at 97% - anything higher would be a false claim.
