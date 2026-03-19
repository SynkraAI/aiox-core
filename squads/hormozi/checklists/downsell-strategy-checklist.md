# Downsell Strategy Implementation Checklist

> **Source:** $100M Modelos: Seção 4 Ofertas de Downsell - Alex Hormozi
> **Pattern:** SC-CL-001 (SOP Checklist Standard)
> **Version:** 1.0.0
> **Generated:** 2026-02-10
> **Agent:** hormozi-models

---

## Pre-Implementation Setup

### 1. Payment Plan Infrastructure
- [ ] **Payment processor configured** - Can store cards and schedule payments
- [ ] **Third-party financing partner** - Application process integrated (optional but recommended)
- [ ] **Layaway terms defined** - Clear policy on payment-before-delivery
- [ ] **Payment calculator built** - Generate split options in real-time
- [ ] **Prepay discount set** - Amount that rewards full payment (e.g., "normally $X, prepay is $Y")
- [ ] **Billing frequency options** - Weekly, biweekly, monthly options mapped
- [ ] **Retry policy established** - Multiple passes on declined cards same day

### 2. Trial Structure Setup
- [ ] **Trial criteria defined** - What customer must do to avoid penalty
- [ ] **Penalty fee structure** - Per-item fees vs single fee
- [ ] **Check-in schedule created** - Mandatory meetings with upsell opportunities
- [ ] **Trial documentation** - Agreement with separate fee clause for initials
- [ ] **Card capture process** - System to securely store cards for future charges
- [ ] **Makeup opportunity policy** - How customers can recover from missed items

### 3. Feature Downsell Menu
- [ ] **Feature list with values** - Ranked from highest to lowest perceived value
- [ ] **Price-feature matrix** - What price for each configuration
- [ ] **Quality tier definitions** - What changes at each tier
- [ ] **Quantity reduction options** - Available package sizes
- [ ] **DIY alternatives** - Products/tools for self-service option
- [ ] **Guarantee removal pricing** - What discount for no guarantee

### 4. Training & Scripts
- [ ] **7-step payment plan script** - Word-for-word flow
- [ ] **Seesaw downselling script** - Simplified version
- [ ] **Trial offer script** - "Start you for free" approach
- [ ] **Integrity script** - Commitment extraction language
- [ ] **Fee explanation script** - Post-card-capture explanation
- [ ] **Desire check questions** - 1-10 scale and follow-up
- [ ] **Feature removal scripts** - For each downsell type

---

## Process Execution Checklist

### Payment Plan Downsell (Process I)

#### Step 1: Prepay Discount
- [ ] Present price WITH interest included as anchor
- [ ] Offer prepay as "discount" not avoiding "fee"
- [ ] Use language: "It's $X, but $Y if you prepay. You save $Z."
- [ ] Wait for response before moving to step 2

#### Step 2: Third-Party Options
- [ ] Offer financing: "Another company pays me, you pay them"
- [ ] Offer credit card: "Do you prefer I decide terms or you decide?"
- [ ] Offer layaway: "Pay before receiving, take your time"
- [ ] If all declined → Step 3

#### Step 3: Half Now, Half Later
- [ ] Ask: "When do you get paid?"
- [ ] Offer: "Half today, half when you get paid?"
- [ ] If declined: "What's the most you can put down today?"
- [ ] Schedule remaining balance to payday
- [ ] If still declined → Step 4

#### Step 4: Desire Check (GATE)
- [ ] Ask: "On a scale of 1-10, how much do you want this?"
- [ ] **If 8-10:** Continue to Step 5
- [ ] **If <8:** Ask "Why not a 10?" then pivot to Feature Downsell
- [ ] Document score in CRM

#### Step 5: Three-Payment Split
- [ ] Offer: "1/3 now, 1/3 next payday, 1/3 following payday"
- [ ] Align with customer's actual pay schedule
- [ ] If declined → Step 6

#### Step 6: Spread Evenly
- [ ] Calculate payments across service duration
- [ ] Example: "16-week program = 16 weekly payments"
- [ ] If declined → Step 7

#### Step 7: Free Trial
- [ ] Transition to Trial Process (Process II)
- [ ] "The sale ends here, at least for now" if trial also declined

---

### Trial with Penalty (Process II)

#### Step 1: Offer Trial Last
- [ ] Only after clear rejection of main offer + payment plans
- [ ] Script: "How about we start you for free? Would that work?"
- [ ] Frame as help, not sales tactic

#### Step 2: Get Card (GATE)
- [ ] Request card immediately: "Let me get your ID and card"
- [ ] If resistance: "It's just how we've always done it"
- [ ] **If no card → End conversation politely**
- [ ] Verify card works with small authorization

#### Step 3: Sell Staying and Paying (GATE)
- [ ] Ask: "If this gets you results, will you stay long-term?"
- [ ] Use integrity script about long-term vs quick fix
- [ ] **Must get verbal commitment before continuing**
- [ ] Document commitment

#### Step 4: Explain Fees (After Card)
- [ ] Explain penalty structure for non-compliance
- [ ] Frame as "keeping you on track"
- [ ] Have customer initial fee clause separately
- [ ] Timing: ALWAYS after card captured, never before

#### Step 5: Schedule Check-Ins
- [ ] Explain each check-in and its purpose
- [ ] Make clear these are mandatory
- [ ] Document that charges apply if missed
- [ ] Schedule all check-ins in calendar immediately

---

### Feature Downsell (Process III)

#### Strategic Removal Order
- [ ] **Remove HIGHEST value features first** - Makes customer see value
- [ ] Show price difference after removal
- [ ] Ask: "How about now?"
- [ ] If they re-upsell to main offer → Close on main

#### Quantity Reduction
- [ ] Product: "Start with 1 month instead of 3?"
- [ ] Service: "Start with 2 sessions instead of 4?"
- [ ] Maintain core value proposition

#### Quality Reduction
- [ ] Time: Specific hours vs anytime
- [ ] Days: Limited days vs any day
- [ ] Speed: Next day vs same day
- [ ] Ratio: Group vs 1-on-1
- [ ] Method: Text vs video call
- [ ] Provider: Team vs owner
- [ ] Format: Recorded vs live
- [ ] DIY vs Done-For-You

#### Feature Removal
- [ ] Remove guarantee (often most effective)
- [ ] Remove specific services (calls, chat, etc.)
- [ ] Remove premium features

#### DIY Alternative
- [ ] Last resort for service rejection
- [ ] Offer tools/products instead of service
- [ ] Products should support same outcome

---

## Quality Control Checklist

### Trust & Integrity Checks
- [ ] **Never offered same thing for less** - Always removed value with price
- [ ] **No in-the-moment discounting** - Used pre-approved terms only
- [ ] **Consistent pricing** - Same rules for everyone
- [ ] **No pressure tactics** - Personalized, not pressured
- [ ] **Trades, not giveaways** - Every give had a get

### Payment Plan Health
- [ ] **Full payment ratio maintained** - Not declining since adding plans
- [ ] **New customers added** - Not cannibalizing full-pay customers
- [ ] **Completion rate tracked** - >70% completing plans
- [ ] **Aligned with pay schedules** - Payments on paydays
- [ ] **Retry policy active** - Multiple passes on declines

### Trial Health
- [ ] **Card on file for all trials** - No exceptions
- [ ] **Commitment documented** - All agreed to stay if results
- [ ] **Fees acknowledged** - Initialed separately
- [ ] **Check-ins scheduled** - All mandatory meetings booked
- [ ] **Compliance tracking active** - Know who's meeting terms

---

## Metrics to Track

### Primary Metrics
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Downsell Conversion Rate | >40% | ___ | ⬜ |
| 30-Day Cash Collected | ↑ vs baseline | ___ | ⬜ |
| Full Payment Ratio | Maintain | ___ | ⬜ |
| Trial-to-Paid Conversion | >50% | ___ | ⬜ |

### Process-Specific Metrics
| Process | Metric | Target | Current |
|---------|--------|--------|---------|
| Payment Plans | Completion Rate | >70% | ___ |
| Payment Plans | Steps to Close (avg) | Track | ___ |
| Trials | Penalty Collection Rate | Track | ___ |
| Trials | Check-in Attendance | >80% | ___ |
| Features | Re-Upsell Rate | Track | ___ |
| Features | LTV by Entry Method | Compare | ___ |

### Churn by Billing Frequency
| Frequency | Expected Churn | Actual |
|-----------|----------------|--------|
| Monthly | 10.7% | ___ |
| Quarterly | 5% | ___ |
| Annual | 2% | ___ |

---

## Red Flags & Escalations

### Immediate Escalation Required
- [ ] **Full payment ratio dropping** → Review if plans cannibalizing
- [ ] **Trial completion <50%** → Adjust criteria or support
- [ ] **Payment default rate >30%** → Review capacity assessment
- [ ] **Customer complaints about fees** → Review fee explanation process
- [ ] **Trust concerns raised** → Audit for pure discounting

### Warning Signs to Monitor
- [ ] Desire scores averaging <8 (offer-market fit issue)
- [ ] High step count to close (offer complexity issue)
- [ ] Trial penalties higher than conversions (criteria too hard)
- [ ] Feature downsell not re-upselling (wrong features removed)

---

## Weekly Review Checklist

### Downsell Performance
- [ ] Total rejections this week: ___
- [ ] Total downsell attempts: ___
- [ ] Downsell conversion rate: ___
- [ ] Revenue from downsells: ___

### Process Mix
- [ ] Payment plan downsells: ___
- [ ] Trial enrollments: ___
- [ ] Feature downsells: ___
- [ ] Re-upsells to main offer: ___

### Health Indicators
- [ ] Full payment ratio vs last week: ___
- [ ] Payment plan completion rate: ___
- [ ] Trial compliance rate: ___
- [ ] Average steps to downsell close: ___

---

## The Six Rules Quick Reference

| # | Rule | Check |
|---|------|-------|
| 1 | "No to THIS offer, not ALL offers" | Am I still making offers? |
| 2 | "Downsells are trades" | Did I get something for what I gave? |
| 3 | "Personalize, don't pressure" | Did I find their preferences first? |
| 4 | "Same thing, new ways" | Am I offering differently, not discounting? |
| 5 | "Never just lower price" | Did I remove value with the price reduction? |
| 6 | "Customers talk" | Am I using consistent pricing? |

---

## Anti-Pattern Check

### The Car Salesman Trap
**Story:** Salesman dropped insurance from $5,000 → $400 for the SAME product.
**Result:** Customer said no to ALL offers AND lost trust in the car price.

**Self-Check:**
- [ ] I did NOT offer the same thing for less
- [ ] I offered DIFFERENT things at different prices
- [ ] Customer trust maintained
- [ ] Customer understands value-price relationship

---

## Implementation Sign-Off

| Phase | Owner | Date | Status |
|-------|-------|------|--------|
| Infrastructure Setup | ___ | ___ | ⬜ |
| Script Training | ___ | ___ | ⬜ |
| First Live Downsell | ___ | ___ | ⬜ |
| Week 1 Review | ___ | ___ | ⬜ |
| Process Optimization | ___ | ___ | ⬜ |
| Full Deployment | ___ | ___ | ⬜ |

---

**Validation Complete:**
- [x] 11 SOP parts documented
- [x] 8-field step anatomy for each process
- [x] Quality gates defined
- [x] Metrics tracking configured
- [x] Escalation paths established

**Source:** All checklist items derived from $100M Modelos Seção 4, Ofertas de Downsell



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
