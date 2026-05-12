# Mode Selection Best Practices

**Quick Reference Guide**
**Version**: 1.0.0
**Last Updated**: 2025-10-31

---

## Quick Mode Selector

### By Story Complexity

| Complexity | Estimated Hours | Mode | Rationale |
|-----------|----------------|------|-----------|
| **Trivial** | < 2h | YOLO | Fast, straightforward |
| **Simple** | 2-4h | YOLO or Interactive | Depends on familiarity |
| **Moderate** | 4-8h | Interactive | Balance needed |
| **Complex** | 8-16h | Interactive or Pre-Flight | Needs careful decisions |
| **Very Complex** | > 16h | Pre-Flight | Requires planning |

### By Story Type

```
Documentation     → YOLO
Bug Fix (Simple)  → YOLO
Bug Fix (Complex) → Interactive
Feature (Small)   → YOLO or Interactive
Feature (Large)   → Pre-Flight
Refactoring       → Interactive
Infrastructure    → Pre-Flight
Architecture      → Pre-Flight
Experiment        → YOLO
```

### By Risk Level

```
Low Risk    → YOLO
Medium Risk → Interactive
High Risk   → Pre-Flight
Critical    → Pre-Flight + Team Review
```

---

## Mode Characteristics

### YOLO Mode 🚀

**Characteristics**:
- Autonomous decision-making
- Decision logging
- 0-1 user prompts
- Fastest execution

**Best For**:
- Stories with clear requirements
- Experienced developers
- Time-sensitive work
- Batch processing multiple stories
- Non-critical systems

**Not Recommended For**:
- Ambiguous requirements
- Critical architectural decisions
- Learning new framework areas
- Team collaboration needed

**Time Savings**: ~30-50% faster than Interactive

---

### Interactive Mode 💬

**Characteristics**:
- Decision checkpoints
- Educational explanations
- 5-10 user prompts
- Balanced speed/control

**Best For**:
- Most stories (default for a reason)
- Learning framework patterns
- Collaborative development
- Moderate complexity

**Not Recommended For**:
- When maximum speed is critical
- Very ambiguous stories
- No time for interaction

**Time Investment**: Baseline (this is the standard)

---

### Pre-Flight Planning Mode ✈️

**Characteristics**:
- Upfront questionnaire
- Comprehensive planning
- Zero execution interruptions
- All decisions documented

**Best For**:
- Ambiguous requirements
- Multiple architectural decisions
- Team consensus needed
- Critical systems
- Setting precedents

**Not Recommended For**:
- Simple, clear stories
- When speed is priority
- Solo development of straightforward work

**Time Investment**: +20-40% upfront, -15-25% execution (net: ~even to slight increase)

---

## Decision Matrix

### Use YOLO When...

✅ ALL of these are true:
- Requirements are crystal clear
- You've done similar work before
- Story is low/medium risk
- You're comfortable with autonomous decisions

❌ ANY of these are true:
- Requirements are ambiguous
- It's your first time in this area
- Story is high risk
- Team input is needed

### Use Interactive When...

✅ AT LEAST ONE is true:
- You want to learn
- Requirements are mostly clear
- Moderate complexity
- You want control over key decisions

✅ **Use as default** when unsure

### Use Pre-Flight When...

✅ AT LEAST ONE is true:
- Multiple architectural decisions
- Requirements have gaps
- Team consensus required
- Critical system changes

---

## Anti-Patterns

### ❌ Don't Do This

**Using YOLO for critical systems**
```
❌ *develop-yolo 4.1  # Authentication system rewrite
```
**Why**: Critical decisions need human oversight

**Using Pre-Flight for simple bug fixes**
```
❌ *develop-preflight 3.99  # Fix typo in documentation
```
**Why**: Overkill - wastes time on trivial work

**Ignoring decision logs in YOLO mode**
```
❌ Run YOLO mode and never review .ai/decision-log-*.md
```
**Why**: Miss opportunity to verify autonomous choices

**Rushing through Interactive checkpoints**
```
❌ User: [1] [1] [1] [1]  # Just picking first option every time
```
**Why**: Defeats the purpose of decision checkpoints

---

## Best Practices by Role

### Junior Developers

**Primary Mode**: Interactive
**Reasoning**: Educational value, learn patterns

**Mode Usage**:
- Interactive: 80%
- Pre-Flight: 15% (when stuck)
- YOLO: 5% (documentation, trivial fixes)

**Tips**:
- Ask "why" during explanations
- Don't skip decision checkpoint explanations
- Use Pre-Flight when overwhelmed

### Mid-Level Developers

**Primary Mode**: Interactive
**Secondary Mode**: YOLO for simple work

**Mode Usage**:
- Interactive: 60%
- YOLO: 30%
- Pre-Flight: 10% (complex stories)

**Tips**:
- Use YOLO for familiar patterns
- Use Interactive for new areas
- Use Pre-Flight for architectural work

### Senior Developers

**Primary Mode**: YOLO
**Secondary Mode**: Interactive for collaboration

**Mode Usage**:
- YOLO: 60%
- Interactive: 25%
- Pre-Flight: 15% (critical decisions)

**Tips**:
- Review decision logs after YOLO
- Use Interactive when mentoring
- Use Pre-Flight for cross-team alignment

### Architects

**Primary Mode**: Pre-Flight
**Secondary Mode**: Interactive

**Mode Usage**:
- Pre-Flight: 50% (architectural stories)
- Interactive: 40%
- YOLO: 10% (simple changes)

**Tips**:
- Share Pre-Flight questionnaires with team
- Document architectural decisions
- Use YOLO for documentation updates only

---

## Time-Based Guidelines

### When You Have...

**< 30 minutes**:
- Use YOLO for trivial fixes only
- Don't start complex stories

**30 minutes - 2 hours**:
- YOLO for simple, clear stories
- Interactive for moderate stories (might not finish)

**2-4 hours** (half day):
- YOLO for multiple simple stories
- Interactive for 1-2 moderate stories
- Pre-Flight analysis (don't execute yet)

**4-8 hours** (full day):
- Any mode for any single story
- YOLO batch processing
- Interactive for learning focus
- Pre-Flight with execution for complex

**Multiple days**:
- Pre-Flight for complex stories
- Interactive for collaborative work
- YOLO + review sessions

---

## Quality vs. Speed Trade-offs

### Maximum Quality (Minimize Risk)

```
Pre-Flight → Thorough Planning → Team Review → Careful Execution
```

**Use for**: Production systems, critical features, architectural changes

### Balanced Quality/Speed

```
Interactive → Thoughtful Decisions → Individual Review → Complete Execution
```

**Use for**: Most development work

### Maximum Speed (Accept Calculated Risk)

```
YOLO → Auto Decisions → Post-Review → Fast Execution
```

**Use for**: Non-critical work, documentation, experiments

---

## Team Collaboration

### Solo Development

**Recommended**: Match mode to story complexity
- Simple → YOLO
- Moderate → Interactive
- Complex → Pre-Flight (self-review)

### Pair Programming

**Recommended**: Interactive mode
- Checkpoints facilitate discussion
- Educational for both developers
- Decisions documented

### Team Features

**Recommended**: Pre-Flight mode
- Share questionnaire with team first
- Get consensus before execution
- Document decisions for future reference

### Critical Systems

**Recommended**: Pre-Flight + Architecture Review
1. Pre-Flight questionnaire
2. Team review of plan
3. Architecture approval
4. Execute with zero ambiguity

---

## Metrics to Track

### After YOLO Mode

- Review decision log quality
- Count decisions you agree/disagree with
- Note any decisions you'd change
- Track: Would you have made same choices?

**Goal**: > 90% agreement with autonomous decisions

### After Interactive Mode

- Time spent at decision checkpoints
- Number of options considered
- Learning takeaways documented

**Goal**: Learn 1-2 new patterns per story

### After Pre-Flight Mode

- Plan accuracy (did execution match plan?)
- Number of mid-execution surprises
- Team consensus quality

**Goal**: < 5% deviation from plan during execution

---

## Continuous Improvement

### Weekly Reflection

Ask yourself:
1. Which mode did I use most? Was it appropriate?
2. What decisions would I have made differently?
3. Where did I waste time? Where did I save time?
4. What patterns am I learning?

### Monthly Review

Review your decision logs:
1. Are YOLO decisions getting better?
2. Are Interactive checkpoints still valuable?
3. Is Pre-Flight planning accurate?

### Team Retro

Discuss as team:
1. Are we using modes effectively?
2. What mode preferences do team members have?
3. Should we standardize certain story types?

---

## Common Questions

### Q: Can I switch modes mid-story?

**A**: No. Mode is selected at story start. If you cancel, you can resume with a different mode, but this is not recommended (leads to inconsistent execution).

### Q: What if I pick the wrong mode?

**A**: Cancel and restart with the correct mode. Story progress is saved.

### Q: Can I create custom modes?

**A**: Not yet. These 3 modes cover most use cases. Share feedback if you have ideas for additional modes.

### Q: Should our team standardize on one mode?

**A**: No. Use the right mode for each story. Team consistency should be in decision quality, not mode selection.

### Q: What if Pre-Flight questionnaire has too many questions?

**A**: This means story requirements are very ambiguous. Consider:
1. Refining the story with PO before development
2. Breaking story into smaller pieces
3. Proceeding with Pre-Flight (it's doing its job)

---

## Mode Selection Flowchart

```
                        START
                          |
                   Is story clear?
                     /        \
                   YES         NO
                   /             \
            Are you expert?    Pre-Flight ✈️
              /      \
            YES      NO
            /          \
        YOLO 🚀    Interactive 💬


Alternative (Simple):

Clear + Expert     → YOLO 🚀
Clear + Learning   → Interactive 💬
Ambiguous + Any    → Pre-Flight ✈️
When in doubt      → Interactive 💬 (default)
```

---

## Summary

| Scenario | Mode | Why |
|----------|------|-----|
| Trivial bug fix | YOLO | Fast, clear |
| Documentation | YOLO | Low risk, clear |
| Learning new area | Interactive | Educational |
| Moderate feature | Interactive | Balanced |
| Ambiguous story | Pre-Flight | Need clarity |
| Architectural decision | Pre-Flight | Critical |
| Team collaboration | Interactive or Pre-Flight | Discussion needed |
| Time-sensitive | YOLO | Speed priority |
| **When unsure** | **Interactive** 💬 | **Safe default** |

---

**Key Takeaway**: There is no "best" mode - only the right mode for your current context.

---

**Version**: 1.0.0
**Story**: 3.13 - Developer Experience Enhancement
**Last Updated**: 2025-10-31
