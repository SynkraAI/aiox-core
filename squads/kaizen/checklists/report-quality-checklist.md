# Report Quality Checklist
# ID: KZ-QC-001
# Used by: kaizen-chief before publishing any report

## Pre-Publication Quality Gate (QG-KZ-003)

### Structure
- [ ] Report has executive summary (max 3 sentences)
- [ ] All 6 dimensions covered (structure, performance, bottlenecks, capabilities, tech radar, cost)
- [ ] Each section has findings with evidence
- [ ] Prioritized recommendations section present

### Recommendations Quality
- [ ] Max 5 recommendations (cut lowest impact if >5)
- [ ] Each recommendation has ACTION (what to do)
- [ ] Each recommendation has EVIDENCE (which agent flagged, data)
- [ ] Each recommendation has COST (estimated effort)
- [ ] Each recommendation has ROI (from cost-analyst)
- [ ] No recommendation without evidence (veto: remove if missing)

### Data Quality
- [ ] All data from filesystem scans (not assumptions)
- [ ] Agent counts verified via ls/glob
- [ ] Activity dates from git log (not estimated)
- [ ] Heuristic thresholds applied consistently
- [ ] Metrics calculated (not guessed)

### Formatting
- [ ] Template applied correctly (weekly-report-tmpl.md)
- [ ] Tables formatted and aligned
- [ ] Trends marked with arrows (up/down/stable)
- [ ] Severity levels consistent (HIGH/MEDIUM/LOW)
- [ ] Report date and period clearly stated

### Completeness
- [ ] All active squads analyzed (none missing)
- [ ] Idle squads flagged (not silently omitted)
- [ ] Inter-squad interactions mapped
- [ ] ONE THING focus identified for next week
- [ ] Carry-over from last week listed

## Veto Conditions (Auto-Fail)

- ANY recommendation without evidence → REMOVE from report
- MORE than 5 recommendations → CUT lowest impact
- NO executive summary → BLOCK publication
- Data from assumptions instead of scans → REDO analysis
- Missing dimension (any of the 6) → NOTE gap in report
