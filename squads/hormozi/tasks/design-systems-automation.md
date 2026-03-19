# design-systems-automation

## Metadata
```yaml
task_id: HZ_SCALE_003
agent: hormozi-scale
type: creation
complexity: medium
estimated_time: 45-60min
source: "Systems and Automation Playbooks — Tier-Based Implementation"
```

## Purpose
Design systems infrastructure and automation opportunities for scaling operations.

> "Automação antes de delegação. Automatize primeiro." — Pedro Valério

---

## Systems Hierarchy by Stage

### Tier 1: Critical (Must have to scale beyond founder)

| System | Purpose | Tools | KPI |
|--------|---------|-------|-----|
| CRM | Track all leads and customers | HubSpot, Salesforce, Close | No lead lost, all data tracked |
| Project Management | Track all tasks and deliverables | Asana, Monday, ClickUp | All work visible, nothing falls through |
| Communication | Internal and external | Slack, Email, Loom | Response time < 24 hours |

### Tier 2: Important (Need for efficiency at $1M+)

| System | Purpose | Tools | KPI |
|--------|---------|-------|-----|
| Scheduling | Automate booking and reminders | Calendly, Acuity | No-show rate < 20% |
| Billing | Automate payments and invoicing | Stripe, PayPal, QuickBooks | Failed payment recovery > 70% |
| Onboarding | Automate client onboarding | Trainual, Loom, Notion | Onboarding completion > 80% |

### Tier 3: Optimization (Nice to have for $3M+)

| System | Purpose | Tools | KPI |
|--------|---------|-------|-----|
| Reporting/BI | Automated dashboards | Google Data Studio, Tableau | Real-time visibility |
| Marketing Automation | Automated campaigns | ActiveCampaign, ConvertKit | Lead nurture automated |
| HR/People | Hiring, payroll, performance | Gusto, BambooHR | HR admin < 5 hours/week |

---

## Automation Opportunities Matrix

### Quadrant 1: HIGH IMPACT + EASY (Do First)
```
- Calendar booking (Calendly)
- Meeting reminders (email/SMS)
- Payment processing (Stripe)
- Email follow-ups (ActiveCampaign)
- Welcome sequences (email)
- Onboarding checklists
```

### Quadrant 2: HIGH IMPACT + HARD (Do Second)
```
- Sales calls → AI for booking, human for calls
- Customer success → AI for monitoring, human for intervention
- Content creation → AI for drafts, human for editing
- Hiring → AI for screening, human for interviews
```

### Quadrant 3: LOW IMPACT + EASY (Do Third)
```
- Social media posting
- Report generation
- File organization
- Data entry
```

### Quadrant 4: LOW IMPACT + HARD (Skip or Delegate)
```
- One-off tasks
- Complex decisions
- Creative work
```

---

## SOP Creation Framework

### SOP Header Template
```yaml
name: "[Task name]"
purpose: "[Why this task exists]"
owner: "[Who is responsible]"
frequency: "[How often]"
duration: "[How long it takes]"
tools_needed: "[What tools are required]"
```

### SOP Steps Rules
```
- One action per step
- Include screenshots
- Include decision trees
- Include exceptions

Example:
Step 1: Log into CRM at [URL]
Step 2: Filter leads by [criteria]
Step 3: For each lead, send email using template [X]
Step 4: Mark lead as [status] in CRM
```

### SOP Quality Check
```
[ ] Can a new hire follow this without asking questions?
[ ] Are all edge cases covered?
[ ] Is the expected outcome clear?
```

### SOP Maintenance
```
- Review frequency: Quarterly
- Update trigger: When process changes
- Version control: Date and editor on each update
```

---

## Execution Steps

### Step 1: Audit Current Systems
```
For each area (CRM, PM, Communication, etc.):
- Do we have a system?
- Is it being used consistently?
- Is data accurate?
```

### Step 2: Prioritize by Stage
```
- Under $300k: Tier 1 only
- $300k-$1M: Tier 1 + Tier 2
- $1M+: All tiers
```

### Step 3: Map Automation Opportunities
```
List all repetitive tasks:
- How often does it happen?
- How long does it take?
- Can it be automated?
```

### Step 4: Create SOPs for Non-Automatable
```
For tasks that need humans:
- Document the process
- Make it repeatable
- Train team
```

### Step 5: Implement in Order
```
1. Quadrant 1 automations
2. Tier 1 systems gaps
3. SOPs for critical processes
4. Quadrant 2 automations
5. Tier 2 systems
```

---

## Output Format

```markdown
## Systems & Automation Plan

### Current State Audit
| System | Status | Gap |
|--------|--------|-----|
| CRM | [Yes/No/Partial] | [What's missing] |
| PM | [Yes/No/Partial] | [What's missing] |
| ... | ... | ... |

### Automation Opportunities
**Quadrant 1 (Do Now):**
1. [Task] → [Automation tool]
2. [Task] → [Automation tool]

**Quadrant 2 (Do Next):**
1. [Task] → [Hybrid approach]

### SOPs Needed
1. [Process] - Owner: [Name]
2. [Process] - Owner: [Name]

### Implementation Timeline
- Week 1-2: [Actions]
- Week 3-4: [Actions]
- Month 2: [Actions]
```

---

## Anti-Patterns

❌ Automating before understanding the process
❌ Buying tools without clear KPIs
❌ Skipping Tier 1 to buy "shiny" Tier 3 tools
❌ No SOPs for human-dependent tasks
❌ Systems without owners
❌ Automating low-impact tasks first



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
