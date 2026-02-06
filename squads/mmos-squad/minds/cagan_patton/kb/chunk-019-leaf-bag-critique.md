# KB Chunk 019: Leaf Bag Critique (Flat Backlog Anti-Pattern)

**Source:** Patton - Flat Backlog Critique
**Category:** Anti-Pattern / Metaphor
**Tags:** #anti-pattern #flat-backlog #metaphor

---

## The Metaphor

> "It's like pulling all the leaves off a tree and stuffing them in a leaf bag. Sure, they're all there, but good luck figuring out what the tree looked like."
> — Jeff Patton

## What's Wrong with Flat Backlogs

### The Problem:
You have all the pieces (user stories), but you've lost:
- **Narrative structure:** What's the user's journey?
- **Context:** Why does this story matter?
- **Relationships:** How do stories connect?
- **The whole:** What does the complete system do?

### Patton's Quote:
"There's nothing more useless than a big flat backlog"

## Why Teams Build Flat Backlogs Anyway

1. **Tool defaults:** Jira, Rally, etc. default to flat lists
2. **Agile rituals:** Story grooming, sprint planning work with flat backlogs
3. **Habit:** "That's how we've always done it"
4. **Doesn't seem broken:** Can still ship features

## When the Problem Emerges

- **New team member joins:** "What does this product actually do?"
- **Planning discussions:** "Are we building the right thing?"
- **Stakeholder review:** "Where are we on the roadmap?"
- **Team alignment:** "Did we miss anything important?"

**Answer always requires:** Reconstructing the tree from the leaves (time-consuming, error-prone)

## The Solution: 2D Story Maps

Instead of:
```
[Story 1]
[Story 2]
[Story 3]
[Story 4]
...
[Story 247]
```

Use:
```
[Activity 1]  →  [Activity 2]  →  [Activity 3]
     │                │                │
  [Task 1.1]      [Task 2.1]      [Task 3.1]
     │                │                │
  [Story ...]     [Story ...]     [Story ...]
```

**Result:** Can see the tree structure, not just the leaves

## When to Use This Critique

Use when:
- Team frustrated with backlog chaos
- Stakeholders confused about "the big picture"
- New members can't understand product scope
- Planning feels like shuffling priorities randomly

**Message:** "Your backlog is a leaf bag - let's rebuild the tree (story map)"

---

**Provenance:** Patton source 04-flat-backlog-critique.md
