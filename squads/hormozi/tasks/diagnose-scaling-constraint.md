# diagnose-scaling-constraint

## Metadata
```yaml
task_id: HZ_SCALE_001
agent: hormozi-scale
type: diagnostic
complexity: medium
estimated_time: 30-45min
source: "Scaling Diagnostic — Constraint Identification"
```

## Purpose
Identify the current constraint preventing business growth and prescribe the right solution.

> "At any given time, ONE thing is the bottleneck. Find it, fix it, find the next one." — Alex Hormozi

---

## The Constraint Chain

```
LEADS → CONVERSION → DELIVERY → CAPACITY

Only ONE is the bottleneck at any time.
Solving the wrong one wastes resources.
```

---

## Diagnostic Questions

### Question Set 1: Leads
```
- How many new leads do you get per week?
- What's your cost per lead?
- Are your salespeople's calendars full?
- If you had 2x the leads tomorrow, could you handle them?
```

**If calendars are empty and you could handle more:**
→ LEADS is your constraint

### Question Set 2: Conversion
```
- What's your show rate?
- What's your close rate?
- What's your average deal size?
- Are you getting objections you can't handle?
```

**If you have enough leads but not enough sales:**
→ CONVERSION is your constraint

### Question Set 3: Delivery
```
- Are customers getting the promised result?
- What's your satisfaction/NPS score?
- What's your refund/churn rate?
- Are customers referring others?
```

**If you're selling but customers aren't succeeding:**
→ DELIVERY is your constraint

### Question Set 4: Capacity
```
- Can you serve more customers without breaking?
- Do you have team/systems to scale?
- What happens if volume doubles tomorrow?
- Are you personally the bottleneck?
```

**If everything works but you can't handle more:**
→ CAPACITY is your constraint

---

## Constraint Prescriptions

### If Constraint = LEADS
```
Symptom: Calendar empty, pipeline dry

Prescriptions (in order):
1. MORE of what already generates leads
2. Activate the Core Four (warm, content, cold, paid)
3. Optimize landing page conversion
4. Test new lead magnets

Agent to use: hormozi-leads
```

### If Constraint = CONVERSION
```
Symptom: Lots of leads, few sales

Prescriptions (in order):
1. Review and improve sales script (CLOSER)
2. Improve offer (Value Equation analysis)
3. Add more proof/social proof
4. Train/replace salespeople

Agents to use: hormozi-closer, hormozi-offers
```

### If Constraint = DELIVERY
```
Symptom: Customers not getting results

Prescriptions (in order):
1. Fix onboarding (first 30 days)
2. Add activation incentives
3. Implement 5 Horsemen of Retention
4. Create success milestones

Agent to use: hormozi-retention
```

### If Constraint = CAPACITY
```
Symptom: Can't handle more volume

Prescriptions (in order):
1. Document and systematize processes
2. Hire/train team members
3. Automate where possible
4. Consider raising prices to reduce volume

Agent to use: hormozi-scale
```

---

## Pre-Scaling Gates

Before scaling, verify:

### Gate 1: LTV:CAC ≥ 3:1
```
LTV = (ARPU × Gross Margin) / Churn Rate
CAC = (Sales + Marketing Cost) / New Customers

If LTV:CAC < 3:1 → Fix retention or reduce CAC first
```

### Gate 2: 30-Day Gross Profit Rule
```
30-day GP ≥ 2 × (CAC + COGS)

If not → Fix money model first
Agent: hormozi-models
```

### Gate 3: Churn ≤ 10%
```
Monthly Churn = Lost Customers / Starting Customers

If >10% → Fix product/delivery first
"You don't have a growth problem, you have a product problem"
Agent: hormozi-retention
```

---

## Execution Steps

### Step 1: Collect Data
```yaml
metrics_needed:
  leads:
    weekly_leads: ""
    cost_per_lead: ""
    calendar_fill_rate: ""

  conversion:
    show_rate: ""
    close_rate: ""
    average_deal: ""

  delivery:
    nps_score: ""
    refund_rate: ""
    churn_rate: ""

  capacity:
    current_customers: ""
    team_size: ""
    utilization: ""
```

### Step 2: Run Diagnostic Questions
Answer each question set honestly.

### Step 3: Identify Constraint
Which area has the clearest problem?

### Step 4: Verify Pre-Scaling Gates
Are all 3 gates passing?

### Step 5: Prescribe Solution
Match constraint to prescription.

### Step 6: Route to Specialist Agent
Use the appropriate Hormozi agent for fixes.

---

## Output Format

```markdown
## Scaling Diagnostic Report

### Current Metrics
[Data from Step 1]

### Constraint Identified
**[LEADS / CONVERSION / DELIVERY / CAPACITY]**

### Evidence
[Why this is the constraint]

### Pre-Scaling Gates
- LTV:CAC: [PASS/FAIL]
- 30-Day GP: [PASS/FAIL]
- Churn: [PASS/FAIL]

### Prescription
[Specific recommendations]

### Next Step
Use [hormozi-agent] to implement [solution].
```



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
