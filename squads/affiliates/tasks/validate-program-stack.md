# validate-program-stack

## Metadata
```yaml
task_id: AFF_STR_002
agent: affiliate-strategist
type: analysis
complexity: medium
estimated_time: "1h-2h"
source: "Affiliate Lab Program Audit Framework — Matt Diggity"
```

## Purpose
Audit all available affiliate programs in a validated niche to produce a ranked stack of viable programs, ensuring revenue model viability before content production begins. A niche with poor program options fails regardless of traffic.

## Prerequisites
- Niche scorecard completed (AFF_STR_001) with GO or SOFT GO verdict
- Access to: Amazon Associates, ShareASale, Impact, CJ Affiliate, ClickBank, Awin, Hotmart (BR), Monetizze (BR)
- Niche primary keyword and product category confirmed

## Steps

1. **Enumerate candidate programs** — Search all major affiliate networks for programs in the niche.
   - Search by category AND by specific brand/product names
   - Include direct brand programs (often better terms than network listings)
   - Target minimum 8 candidate programs before filtering

2. **Collect raw data per program** — For each candidate, capture the full audit profile.
   - Commission rate (percentage or flat fee)
   - Cookie duration (hours or days)
   - Payout threshold and payment methods
   - Network / platform hosting the program
   - Program age (launched date)
   - EPC (if published by network)

3. **Assess reputation signals** — Validate each program beyond published terms.
   - Search "[program name] affiliate complaints" and "[program name] scam affiliate"
   - Check affiliate forums (AffiliateFix, Warrior Forum, Reddit r/juststart)
   - Look for payment dispute history or commission clawback reports

4. **Evaluate promotional materials** — Assess what tools the program provides.
   - Banner library (sizes, quality, recency)
   - Text link and deeplink support
   - Datafeed availability (for programmatic pages)
   - Dedicated affiliate manager access
   - Coupon and deal availability

5. **Calculate Program Score** — Apply weighted scoring to each program (see Framework).

6. **Apply viability filter** — Eliminate any program failing minimum thresholds.
   - Commission < 3% AND no flat-fee alternative → eliminate
   - Cookie < 24h AND no workaround → flag as supplementary only
   - Program age < 6 months → flag as unproven

7. **Rank and tier programs** — Group surviving programs into Primary / Secondary / Supplementary.
   - Primary: best commission + reputation + materials (2-3 programs)
   - Secondary: solid backup options (2-4 programs)
   - Supplementary: display-level, low-priority (0-3 programs)

8. **Verify minimum viable stack** — Confirm at least 3 viable programs before proceeding.
   - If < 3 viable: trigger VETO condition (see below)

9. **Document stack** — Write program stack report with full audit data and recommendations.

## Framework / Inline Structure

### Program Audit Scorecard (per program, max 25 pts)

| Dimension | Weight | Max Score | Scoring Criteria |
|-----------|--------|-----------|-----------------|
| Commission Rate | 5 | 5 | >30%=5, 15-30%=4, 10-15%=3, 5-10%=2, <5%=1 |
| Cookie Duration | 4 | 4 | 90d+=4, 30-89d=3, 7-29d=2, 1-6d=1, 24h=0 |
| EPC (if known) | 4 | 4 | >$2=4, $1-2=3, $0.50-1=2, <$0.50=1, unknown=2 |
| Reputation | 4 | 4 | Excellent=4, Good=3, Mixed=2, Poor=1, Unknown=2 |
| Promo Materials | 3 | 3 | Excellent=3, Adequate=2, Minimal=1, None=0 |
| Payout Terms | 3 | 3 | Net15=3, Net30=2, Net60=1, Net90+=0 |
| Program Age | 2 | 2 | 3yr+=2, 1-3yr=1, <1yr=0 |

**Tier Classification:**
- Primary: Score >= 18
- Secondary: Score 12-17
- Supplementary: Score < 12

### Risk Flags (append to each program profile)

```
RISK_HIGH_DEPENDENCY   — Program accounts for >40% of projected revenue
RISK_AMAZON_ONLY       — Niche dependent solely on Amazon Associates
RISK_UNPROVEN          — Program <6 months old
RISK_PAYMENT_DISPUTE   — Evidence of payment issues in forums
RISK_VOLATILE_RATE     — Commission rate changed >1x in past 24 months
```

## Veto Conditions

- **HARD VETO:** Fewer than 3 programs score >= 12 (Secondary tier or better) — niche has insufficient program depth; return to AFF_STR_001 with updated D5 score
- **HARD VETO:** Top program accounts for >70% of projected revenue AND has RISK_VOLATILE_RATE flag — single point of failure; cannot proceed without diversification plan
- **SOFT VETO:** All viable programs are on same network (e.g., all Amazon) — document concentration risk, require mitigation plan before GO

## Output

- **File:** `docs/research/{date}-program-stack-{niche-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Program Stack Audit — Example Output (YAML summary)
niche: "best air purifiers"
audit_date: "2026-02-18"
programs_evaluated: 11
programs_viable: 7

primary_programs:
  - name: "Levoit Direct Affiliate"
    network: ShareASale
    commission: "10%"
    cookie: "30d"
    epc: "$1.85"
    score: 22
    risk_flags: []
  - name: "Winix Affiliate Program"
    network: Impact
    commission: "8%"
    cookie: "45d"
    epc: "$1.40"
    score: 19
    risk_flags: []

secondary_programs:
  - name: "Amazon Associates"
    network: Amazon
    commission: "3%"
    cookie: "24h"
    epc: "$0.65"
    score: 14
    risk_flags: [RISK_AMAZON_ONLY, RISK_VOLATILE_RATE]
  - name: "Coway Affiliate"
    network: CJ
    commission: "7%"
    cookie: "30d"
    epc: "$1.10"
    score: 17
    risk_flags: []

supplementary_programs:
  - name: "Molekule"
    network: Impact
    commission: "5%"
    cookie: "14d"
    epc: "unknown"
    score: 11
    risk_flags: [RISK_UNPROVEN]

verdict: VIABLE
min_threshold_met: true  # 7 viable programs (min 3 required)
recommended_stack: ["Levoit Direct", "Winix", "Coway"]
next_step: "Run content-plan.md (AFF_SEO_002) and topical-map.md (AFF_SEO_003)"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
