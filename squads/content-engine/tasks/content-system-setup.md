# Content System Setup

```yaml
id: content-system-setup
execution_type: Agent
purpose: Build a repeatable content production system (ContentOS) that enables Tiago to batch-create, schedule, and publish consistently without daily decision fatigue.
executor: @justin-welsh
inputs:
  - Content pillars from content-philosophy task
  - Platform distribution plan
  - Tiago's available time blocks for content creation
  - Existing tools and accounts (scheduling tools, design tools)
preconditions:
  - Content pillars defined (3 pillars minimum)
  - Platform priorities established (Tier 1/2/3)
  - Weekly plan template exists
steps:
  1. Define content categories using Content Matrix:
     - Row: Content pillars (3 pillars)
     - Column: Content formats (educational, story, contrarian, tactical, promotional)
     - Result: 15 content category combinations to rotate through
  2. Create the Idea Bank system:
     - Capture method: Where ideas go when they happen (notes app, voice memo)
     - Processing cadence: Weekly review of raw ideas
     - Categorization: Tag each idea with pillar + format
     - Minimum buffer: Always have 2 weeks of ideas banked
  3. Set batching schedule:
     - 1 batch session per week (2-3 hours)
     - Session structure: 30 min ideation → 90 min writing → 30 min editing
     - Output target: 5-7 content pieces per batch
     - Separate creation from publishing (never same-day)
  4. Build content templates:
     - Post template: Hook → Context → Insight → CTA
     - Carousel template: Cover → 5-7 slides → CTA slide
     - Newsletter template: Cold open → 3 sections → Personal close
     - Video script template: Hook → Setup → Payoff → CTA
     - Story template: Situation → Tension → Resolution → Lesson
  5. Set up automation and tools:
     - Scheduling tool recommendation (based on platforms)
     - Content calendar (Notion, spreadsheet, or tool-native)
     - Analytics review cadence (weekly, 15 min)
     - Engagement time blocks (2x daily, 15 min each)
  6. Define the weekly content rhythm:
     - Monday: Review metrics + plan week
     - Tuesday: Batch creation session
     - Wednesday: Edit + schedule
     - Thursday-Sunday: Publish + engage (auto-scheduled)
  7. Set system review cadence:
     - Monthly: What's working, what's not
     - Quarterly: Pillar and format rotation audit
outputs:
  - ContentOS Setup Document with:
    - Content Matrix (15 category grid)
    - Idea Bank structure and process
    - Batching schedule with time blocks
    - 5 content templates (ready to use)
    - Tool stack recommendations
    - Weekly rhythm calendar
    - Review cadence
validation:
  - Content Matrix covers all 3 pillars x 5 formats
  - Templates are specific to Tiago's voice (not generic)
  - Batching schedule fits within realistic time constraints
  - System can run on autopilot after initial setup
  - All recommended tools are free or low-cost
  - Weekly rhythm has built-in flexibility (not rigid)
```
