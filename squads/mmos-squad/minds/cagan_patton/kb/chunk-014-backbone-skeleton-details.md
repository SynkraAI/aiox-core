# KB Chunk 014: Backbone → Skeleton → Details Hierarchy

**Source:** Patton - Story Map Structure
**Category:** Decomposition Pattern
**Tags:** #story-mapping #hierarchy #structure

---

## The Three Levels

### Level 1: Backbone (User Activities)
- **What:** High-level things users DO
- **Arrangement:** Left-to-right in journey sequence
- **Granularity:** 5-10 major activities typically
- **Example:** [Find Product] → [Purchase] → [Receive] → [Use] → [Get Support]

**Purpose:** Establish user journey narrative

### Level 2: Skeleton (User Tasks)
- **What:** Specific steps within each activity
- **Arrangement:** Vertically under activities, top = important
- **Granularity:** 3-8 tasks per activity typically
- **Example:** Under [Purchase] → Select items, Add to cart, Enter payment, Confirm order

**Purpose:** Detail what users do within each activity

### Level 3: Details (User Stories)
- **What:** How system enables each task
- **Arrangement:** Vertically under tasks, prioritized
- **Granularity:** Multiple stories per task
- **Format:** "As a [user], I want [capability] so that [value]"

**Purpose:** Implementation specifics

## Visual Hierarchy

```
┌─────────────────────────────────────────┐
│ BACKBONE: [Activity 1] → [Activity 2]  │
│                                         │
│ SKELETON:   Task 1.1       Task 2.1    │
│             Task 1.2       Task 2.2    │
│                │              │         │
│ DETAILS:    Story 1.1.1   Story 2.1.1  │
│             Story 1.1.2   Story 2.1.2  │
│             Story 1.2.1   Story 2.2.1  │
└─────────────────────────────────────────┘
```

## Why This Hierarchy Works

1. **Top-down understanding:** Start with big picture (backbone)
2. **Progressive detail:** Add specificity as needed
3. **Context preservation:** Stories connected to journey
4. **Shared vocabulary:** Team speaks same language (activities, tasks, stories)

## How to Build

### Step 1: Identify Backbone
"What are the big things users do?"
- Brainstorm activities
- Arrange in sequence
- Validate: Does this tell the story?

### Step 2: Flesh Out Skeleton
"What specific steps happen in each activity?"
- Break activities into tasks
- Prioritize vertically
- Validate: Is this the right level of detail?

### Step 3: Add Details
"How does the system enable each task?"
- Write user stories
- Stack by priority
- Validate: Can we build from this?

---

**Provenance:** Patton source 01-user-story-mapping.md
