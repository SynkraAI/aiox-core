# KB Chunk 010: Good/Better/Best Release Slicing

**Source:** Patton - Release Planning
**Category:** Release Strategy
**Tags:** #release-slicing #incremental-delivery #prioritization

---

## Framework Overview

Rather than binary "in scope / out of scope," evaluate product fidelity levels explicitly: Good → Better → Best.

## The Three Levels

### GOOD (Walking Skeleton)
- **Definition:** Minimum end-to-end functionality
- **Completeness:** Across ALL activities
- **Depth:** Simple implementation
- **Value:** Users can complete core journey
- **Delivery:** Fastest time to market

### BETTER (Enhanced)
- **Definition:** Enhanced capabilities in high-value areas
- **Additions:** Improved UX, flexibility, options
- **Value:** Significantly better user experience
- **Delivery:** Competitive differentiation

### BEST (Full-Featured)
- **Definition:** Full-featured ideal state
- **Additions:** All nice-to-haves, complete vision
- **Value:** Market leader positioning
- **Delivery:** Longest development time

## How to Slice

1. **Identify Walking Skeleton** (GOOD)
   - Draw horizontal line through story map
   - Include minimum from each activity

2. **Add Enhancements** (BETTER)
   - Add depth to highest-value activities
   - Improve UX, add flexibility

3. **Add Full Features** (BEST)
   - Complete all remaining stories
   - All nice-to-haves included

## Decision Factors

- **Time to market pressure?** → Ship GOOD
- **Competitive differentiation needed?** → Build to BETTER
- **Market leader positioning?** → Deliver BEST

## Patton's Rule

"Better to have GOOD in customers' hands than BEST in development"

## Why This Works

- Makes trade-offs explicit and visual
- Enables informed business decisions
- Delivers value incrementally
- Validates assumptions with real users
- Reduces risk of building wrong thing

## Visual Representation

```
Story Map:
════════════════════════════ ← GOOD (Release 1)
────────────────────────────── ← BETTER (Release 2)
──────────────────────────────── ← BEST (Release 3)
```

---

**Provenance:** Patton source 03-release-slicing.md
