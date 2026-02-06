# KB Chunk 008: Walking Skeleton

**Source:** Patton - Release Slicing
**Category:** Incremental Delivery
**Tags:** #walking-skeleton #mvp #incremental-delivery

---

## Definition

The walking skeleton is the minimum end-to-end functionality that delivers value across ALL user activities - complete but simple, like a skeleton with "all the ribs."

## Key Characteristics

- **End-to-end completeness:** Touches every major user activity
- **Minimal depth:** Simple implementation, not full-featured
- **Delivers value:** Users can complete core journey
- **Foundation for layering:** Good → Better → Best

## How to Identify

1. Review story map with all user activities (horizontal)
2. Draw horizontal line through highest-priority items
3. **Critical rule:** Include something from EVERY activity
4. Validate: Can users complete core journey?

## Visual Representation

```
Activity 1    Activity 2    Activity 3    Activity 4
   │             │             │             │
Task 1.1      Task 2.1      Task 3.1      Task 4.1
   │             │             │             │
Story         Story         Story         Story
═══════════════════════════════════════════════ ← Walking Skeleton
Story         Story         Story         Story  (Release 2)
Story         Story         Story         Story  (Release 3)
```

## Patton's Rule

"Better to have GOOD in customers' hands than BEST in development"

## Anti-Pattern

❌ Complete features over thin slices (horizontal slicing)
- "Build all navigation first, then all forms"
- Users can't complete journey until everything is done

✅ Walking skeleton (vertical slicing)
- Simple navigation + simple forms across entire journey
- Users get value immediately, even if basic

## Why It Works

- Validates assumptions early
- Delivers value sooner
- Enables real user feedback
- Reduces risk of building wrong thing
- Foundation for incremental refinement

---

**Provenance:** Patton source 03-release-slicing.md
