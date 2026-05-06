# Evidence Analysis Methodology

## Overview

This reference provides systematic methodologies for analyzing each type of evidence commonly found in Brazilian civil litigation cases.

---

## Audio Evidence Analysis

### Transcription Standards

| Element | Requirement |
|---------|------------|
| Speaker ID | Identify each speaker consistently |
| Timestamps | Mark at beginning of each speaker turn |
| Unclear segments | Mark as `[INAUDIVEL]` |
| Uncertain words | Suffix with `[?]` |
| Emotional context | Note in brackets: `[tom ameacador]`, `[rindo]` |
| Background sounds | Note if legally relevant |

### Key Extraction Points

For each audio, extract and highlight:

1. **Admissions** - Party admitting facts against their interest
2. **Promises** - Commitments made (especially unmet)
3. **Contradictions** - Statements that contradict other evidence
4. **Threats** - Any coercive language
5. **Timelines** - Dates and deadlines mentioned
6. **Financial figures** - Any amounts discussed
7. **Third parties** - Names and roles mentioned

### Contradiction Matrix

Build a matrix showing contradictions across multiple audios:

```markdown
| Topic | Statement 1 (date) | Statement 2 (date) | Contradiction |
|-------|-------------------|-------------------|---------------|
| [Topic] | "[quote]" ([date]) | "[quote]" ([date]) | [description] |
```

---

## Contract Analysis

### Clause-by-Clause Review Template

For each clause:

```markdown
### Clausula [N]: [Title]

**Texto:** [Exact clause text]

**Obrigacao:** [Who must do what]

**Cumprimento:** [Was it fulfilled? By whom?]

**Descumprimento:** [What was breached, when, by whom]

**Consequencia contratual:** [Penalty specified in contract]

**Consequencia legal:** [Applicable CC/CPC articles]
```

### Key Contract Elements to Identify

| Element | Why It Matters |
|---------|---------------|
| Payment terms | Basis for mora calculation |
| Deadlines | Breach timeline |
| Penalty clauses | Multa contratual |
| Responsibility allocation | Risk assignment |
| Insurance requirements | Additional breach if not obtained |
| Foro selection | Jurisdiction |
| Termination conditions | Rescission grounds |
| Force majeure | Defense limitation |

### Abusive Clause Detection

Flag clauses that may be considered abusive under CDC or CC:

- Unilateral modification rights
- Excessive penalties against one party only
- Waiver of essential rights
- Limitation of liability for willful misconduct
- Arbitration clauses in adhesion contracts

---

## Payment Analysis

### Payment Reconciliation Template

```markdown
| # | Date | Description | Amount Due | Amount Paid | Difference | Status |
|---|------|-------------|-----------|-------------|------------|--------|
| 1 | [date] | [description] | R$ X | R$ Y | R$ Z | [paid/partial/unpaid] |
```

### Irregularity Detection

Check each payment for:

1. **Timing** - Was it on time per contract?
2. **Amount** - Does it match contractual obligation?
3. **Payer** - Is the paying entity the contracted party?
4. **Recipient** - Is the receiving party correct?
5. **Method** - Does payment method match contract?
6. **Documentation** - Is there proper receipt/record?

### Interest and Correction Calculation

For each unpaid or late amount:

```text
Base amount: R$ [X]
Date due: [date]
Date of calculation: [date]
Days overdue: [N]
Monetary correction (INPC): [factor]
Interest (1%/month): [factor]
Corrected amount: R$ [Y]
```

---

## Photographic Evidence Analysis

### Photo Description Template

For each photo:

```markdown
### [Filename]

**Date:** [date from metadata or context]
**Location:** [if determinable]
**Subject:** [what is shown]
**Evidentiary value:**
- [What it proves or contradicts]
- [Comparison with opponent claims]
**Technical details:** [camera, resolution if relevant]
```

### Photo Categories

| Category | What to Look For |
|----------|-----------------|
| Property/Asset condition | Size, quality, quantity indicators |
| Documents | Legibility, authenticity markers |
| Vehicles/Equipment | License plates, brand, model, load |
| Scale/Weighing | Readings, calibration marks |
| Locations | GPS data, landmarks, timestamps |

### Comparative Analysis

When photos exist from different dates:
1. Create a before/after comparison
2. Document changes over time
3. Cross-reference with timeline
4. Identify contradictions with opponent claims

---

## Expert Report (Laudo Pericial) Analysis

### Key Extraction Points

1. **Expert credentials** - Name, registration number, specialty
2. **Methodology used** - Standards applied (ABNT, industry norms)
3. **Key findings** - Values, measurements, conditions
4. **Market comparisons** - How values were determined
5. **Implicit calculations** - Derived values (price per unit, etc.)
6. **Date of evaluation** - Critical for temporal context
7. **Scope limitations** - What was NOT evaluated

### Value Comparison Framework

```markdown
| Parameter | Contract Value | Expert Value | Market Value | Ratio |
|-----------|---------------|-------------|-------------|-------|
| [Item] | R$ [X] | R$ [Y] | R$ [Z] | [X:Y:Z] |
```

---

## Communication Analysis (WhatsApp, Email, SMS)

### Message Categorization

| Category | Examples | Legal Relevance |
|----------|---------|----------------|
| Demands | Payment requests, deadline notices | Proof of notification |
| Admissions | "I know I owe..." | Evidence against party |
| Promises | "I'll pay next week" | Broken commitments |
| Threats | "If you don't..." | Bad faith / coercion |
| Contradictions | Changing stories | Credibility attack |
| Instructions | "Send money to X account" | Irregularity evidence |

### Screenshot Authentication

For WhatsApp/message screenshots:
- Note the phone number visible
- Check message timestamps
- Verify read receipts (blue ticks)
- Cross-reference with other evidence timeline
- Note if messages were deleted (visible in some screenshots)

---

## Consolidated Timeline Template

```markdown
## Timeline

| Date | Event | Evidence | Category |
|------|-------|----------|----------|
| [YYYY-MM-DD] | [Description] | [Doc reference] | [contract/payment/communication/breach] |
```

### Timeline Categories

Use consistent color-coding or emoji markers:

- Contract events (celebration, amendments)
- Performance events (deliveries, extractions, payments)
- Breach events (missed payments, violations)
- Communication events (demands, responses, threats)
- Legal events (notifications, expert reports, lawsuits)
- Silence periods (gaps with no communication)

---

## Evidence Strength Assessment

Rate each piece of evidence:

| Strength | Description | Examples |
|----------|-------------|---------|
| Strong | Direct, unambiguous proof | Signed contract, bank statement, official receipt |
| Moderate | Supports claim but needs corroboration | Audio recording, photo, message screenshot |
| Weak | Circumstantial or indirect | Third-party statements, social media posts |
| Contested | Opponent likely to challenge | Informal agreements, verbal promises |

### Evidence Chain Rule

For critical factual claims, aim for:
- At least 2 pieces of evidence from different sources
- At least 1 "strong" evidence item
- Corroboration between evidence types (e.g., audio + document)
