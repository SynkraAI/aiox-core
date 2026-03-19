# Legacy Modernization Assessment — {System Name}

**Based on:** Robert Seacord (SEI), Grace Lewis (CMU), Barbara von Halle (Decision Model)

---

## System Profile

| Field | Value |
|-------|-------|
| System Name | {system_name} |
| Business Domain | {domain} |
| Age | {years} years (launched {YYYY}) |
| Total LOC | {count} |
| Primary Language(s) | {COBOL/Java/C#/PL-SQL/ABAP/etc} |
| Platform | {mainframe/AS400/Unix/Windows/etc} |
| Database | {DB2/Oracle/SQL Server/etc} |
| Team Size | {count} developers |
| Avg Developer Tenure | {years} years |
| Documentation Quality | Excellent/Good/Fair/Poor/None |
| Active Users | {count} |
| Business Criticality | Mission-Critical/High/Medium/Low |

---

## Executive Summary

{2-3 paragraphs describing:
- Current state of the system
- Why modernization is being considered
- Key findings from this assessment
- High-level recommendation}

---

## Risk Assessment Matrix (Seacord Framework)

### Technical Risks

| Risk Category | Severity | Likelihood | Impact | Mitigation |
|--------------|----------|-----------|--------|------------|
| **Code Quality** | | | | |
| Dead code | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Spaghetti code | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Tight coupling | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Technology Obsolescence** | | | | |
| Language EOL | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Platform EOL | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Vendor support | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Maintenance Burden** | | | | |
| Skill shortage | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| High defect rate | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Slow delivery | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Scalability** | | | | |
| Performance | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Capacity limits | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Security** | | | | |
| Unpatched vulnerabilities | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Compliance gaps | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |

**Overall Technical Risk Score:** {High/Medium/Low} ({0-100})

---

### Business Risks

| Risk Category | Severity | Likelihood | Impact | Mitigation |
|--------------|----------|-----------|--------|------------|
| **Market Competitiveness** | | | | |
| Time to market | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Feature velocity | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Cost** | | | | |
| Maintenance cost | {High/Med/Low} | {High/Med/Low} | ${amount}/year | {mitigation} |
| Opportunity cost | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Regulatory Compliance** | | | | |
| Audit failures | {High/Med/Low} | {High/Med/Low} | {regulation} | {mitigation} |
| Non-compliance fines | {High/Med/Low} | {High/Med/Low} | ${amount} risk | {mitigation} |
| **Business Agility** | | | | |
| Inflexible processes | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| Integration barriers | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |

**Overall Business Risk Score:** {High/Medium/Low} ({0-100})

---

### Operational Risks

| Risk Category | Severity | Likelihood | Impact | Mitigation |
|--------------|----------|-----------|--------|------------|
| **Availability** | | | | |
| Unplanned downtime | {High/Med/Low} | {High/Med/Low} | {hrs/year} | {mitigation} |
| Recovery time | {High/Med/Low} | {High/Med/Low} | {hrs} RTO | {mitigation} |
| **Knowledge Transfer** | | | | |
| Single points of failure | {High/Med/Low} | {High/Med/Low} | {count} people | {mitigation} |
| Tribal knowledge | {High/Med/Low} | {High/Med/Low} | {description} | {mitigation} |
| **Dependencies** | | | | |
| External system coupling | {High/Med/Low} | {High/Med/Low} | {count} systems | {mitigation} |
| Data migration complexity | {High/Med/Low} | {High/Med/Low} | {TB} data | {mitigation} |

**Overall Operational Risk Score:** {High/Medium/Low} ({0-100})

---

## Modernization Options Analysis (Seacord/Lewis Framework)

### Option 1: Replace (Greenfield Rewrite)

**Description:** Build new system from scratch, sunset legacy.

| Dimension | Score (1-10) | Notes |
|-----------|--------------|-------|
| **Feasibility** | | |
| Technical complexity | {score} | {notes} |
| Business risk | {score} | {notes} |
| Resource availability | {score} | {notes} |
| **Cost** | | |
| Initial investment | {score} | ${amount} estimated |
| Ongoing cost | {score} | ${amount}/year |
| **Time** | | |
| Estimated duration | {score} | {months} |
| Time to value | {score} | {months} |
| **Business Value** | | |
| Feature parity | {score} | {notes} |
| Innovation opportunity | {score} | {notes} |
| Competitive advantage | {score} | {notes} |

**Pros:**
- {pro 1}
- {pro 2}

**Cons:**
- {con 1}
- {con 2}

**Risk Level:** {High/Medium/Low}

---

### Option 2: Refactor (Incremental Modernization)

**Description:** Gradually improve codebase while maintaining operations.

| Dimension | Score (1-10) | Notes |
|-----------|--------------|-------|
| **Feasibility** | | |
| Technical complexity | {score} | {notes} |
| Business risk | {score} | {notes} |
| Resource availability | {score} | {notes} |
| **Cost** | | |
| Initial investment | {score} | ${amount} estimated |
| Ongoing cost | {score} | ${amount}/year |
| **Time** | | |
| Estimated duration | {score} | {months} |
| Time to value | {score} | {months} |
| **Business Value** | | |
| Feature parity | {score} | {notes} |
| Innovation opportunity | {score} | {notes} |
| Competitive advantage | {score} | {notes} |

**Refactoring Strategy:**
1. {Step 1: e.g., extract business rules}
2. {Step 2: e.g., modularize monolith}
3. {Step 3: e.g., migrate to services}

**Pros:**
- {pro 1}
- {pro 2}

**Cons:**
- {con 1}
- {con 2}

**Risk Level:** {High/Medium/Low}

---

### Option 3: Replatform (Lift and Shift)

**Description:** Move to modern platform with minimal code changes.

| Dimension | Score (1-10) | Notes |
|-----------|--------------|-------|
| **Feasibility** | | |
| Technical complexity | {score} | {notes} |
| Business risk | {score} | {notes} |
| Resource availability | {score} | {notes} |
| **Cost** | | |
| Initial investment | {score} | ${amount} estimated |
| Ongoing cost | {score} | ${amount}/year |
| **Time** | | |
| Estimated duration | {score} | {months} |
| Time to value | {score} | {months} |
| **Business Value** | | |
| Feature parity | {score} | {notes} |
| Innovation opportunity | {score} | {notes} |
| Competitive advantage | {score} | {notes} |

**Platform Options:**
- {Option A: e.g., cloud IaaS}
- {Option B: e.g., containerization}
- {Option C: e.g., managed service}

**Pros:**
- {pro 1}
- {pro 2}

**Cons:**
- {con 1}
- {con 2}

**Risk Level:** {High/Medium/Low}

---

### Option 4: Encapsulate (Service Wrapper)

**Description:** Wrap legacy system with modern APIs, preserve core.

| Dimension | Score (1-10) | Notes |
|-----------|--------------|-------|
| **Feasibility** | | |
| Technical complexity | {score} | {notes} |
| Business risk | {score} | {notes} |
| Resource availability | {score} | {notes} |
| **Cost** | | |
| Initial investment | {score} | ${amount} estimated |
| Ongoing cost | {score} | ${amount}/year |
| **Time** | | |
| Estimated duration | {score} | {months} |
| Time to value | {score} | {months} |
| **Business Value** | | |
| Feature parity | {score} | {notes} |
| Innovation opportunity | {score} | {notes} |
| Competitive advantage | {score} | {notes} |

**Encapsulation Strategy:**
- {Strategy: e.g., API gateway}
- {Strategy: e.g., strangler fig pattern}

**Pros:**
- {pro 1}
- {pro 2}

**Cons:**
- {con 1}
- {con 2}

**Risk Level:** {High/Medium/Low}

---

### Option 5: Retire (Decommission)

**Description:** Eliminate system, migrate functionality elsewhere.

| Dimension | Score (1-10) | Notes |
|-----------|--------------|-------|
| **Feasibility** | | |
| Business acceptance | {score} | {notes} |
| Alternative solutions | {score} | {notes} |
| Data migration | {score} | {notes} |
| **Cost** | | |
| Migration cost | {score} | ${amount} estimated |
| Cost savings | {score} | ${amount}/year |
| **Time** | | |
| Migration duration | {score} | {months} |
| **Business Impact** | | |
| Operational disruption | {score} | {notes} |
| Feature loss | {score} | {notes} |

**Retirement Plan:**
- {Step 1}
- {Step 2}

**Pros:**
- {pro 1}
- {pro 2}

**Cons:**
- {con 1}
- {con 2}

**Risk Level:** {High/Medium/Low}

---

## Business Rules Portability Score

**Based on:** Extracted business rules from Phase 1-6 analysis.

| Metric | Value | Impact on Modernization |
|--------|-------|------------------------|
| Total Rules Extracted | {count} | — |
| Rules in Normalized Form (von Halle) | {count} ({%}) | {Higher = easier to port} |
| Rules Decoupled from Code | {count} ({%}) | {Higher = easier to port} |
| Rules Externalized (DMN/BPMN ready) | {count} ({%}) | {Higher = easier to port} |
| Rule Complexity (avg conditions per rule) | {average} | {Lower = easier to port} |
| Rule Families Identified | {count} | {More families = better organized} |

**Portability Score:** {0-100} — {Excellent/Good/Fair/Poor}

### Implications

- **If score ≥ 80:** Business rules are highly portable. Consider **Replace** or **Refactor** with rules engine.
- **If score 60-79:** Moderate portability. **Refactor** or **Encapsulate** recommended.
- **If score 40-59:** Low portability. **Encapsulate** first, then refactor rules incrementally.
- **If score < 40:** Rules deeply embedded in code. **Replatform** or long-term **Refactor** required.

### Business Rules Modernization Strategy

{Based on portability score, recommend:
- Should rules be externalized to a business rules engine (BRMS)?
- Should rules be implemented in a decision service?
- Can rules be expressed in DMN and executed by a modern engine?
- What is the migration path for rules?}

---

## Recommended Strategy

### Primary Recommendation: {Option Name}

**Rationale:**
{2-3 paragraphs explaining:
- Why this option best fits the system's profile
- How it addresses the key risks identified
- Why it's superior to other options
- How business rules portability influences this choice}

**Success Criteria:**
1. {Criterion 1}
2. {Criterion 2}
3. {Criterion 3}

**Prerequisites:**
- {Prerequisite 1}
- {Prerequisite 2}

**Estimated Effort:** {person-months} over {timeline}
**Estimated Cost:** ${amount} (initial) + ${amount}/year (ongoing)
**Expected ROI:** {months} to break even, {%} improvement in {metric}

---

## Migration Roadmap Outline

### Phase 1: Foundation ({timeline})

**Objectives:**
- {Objective 1}
- {Objective 2}

**Key Activities:**
- {Activity 1}
- {Activity 2}

**Deliverables:**
- {Deliverable 1}
- {Deliverable 2}

**Resource Requirements:**
- {count} developers
- {count} architects
- ${amount} budget

**Risks:**
- {Risk 1} — Mitigation: {mitigation}
- {Risk 2} — Mitigation: {mitigation}

---

### Phase 2: {Phase Name} ({timeline})

**Objectives:**
- {Objective 1}
- {Objective 2}

**Key Activities:**
- {Activity 1}
- {Activity 2}

**Deliverables:**
- {Deliverable 1}
- {Deliverable 2}

**Dependencies:**
- {Phase 1 completion}
- {External dependency}

**Resource Requirements:**
- {count} developers
- ${amount} budget

**Risks:**
- {Risk 1} — Mitigation: {mitigation}

---

### Phase 3: {Phase Name} ({timeline})

**Objectives:**
- {Objective 1}
- {Objective 2}

**Key Activities:**
- {Activity 1}
- {Activity 2}

**Deliverables:**
- {Deliverable 1}
- {Deliverable 2}

**Resource Requirements:**
- {count} developers
- ${amount} budget

---

### Phase 4: Decommission Legacy ({timeline})

**Objectives:**
- Retire legacy system
- Transition to new system

**Key Activities:**
- Data migration
- User training
- Cutover plan execution
- Post-migration validation

**Success Criteria:**
- Zero data loss
- <{hours} downtime
- {percentage}% user adoption

---

## Alternative Scenarios

### If Budget is Constrained

**Recommended Approach:** {alternative option}
**Rationale:** {why this works with limited budget}
**Trade-offs:** {what you sacrifice}

### If Timeline is Aggressive

**Recommended Approach:** {alternative option}
**Rationale:** {why this is faster}
**Trade-offs:** {what you sacrifice}

### If Business Continuity is Paramount

**Recommended Approach:** {alternative option}
**Rationale:** {why this minimizes disruption}
**Trade-offs:** {what you sacrifice}

---

## Appendices

### A. Technology Stack Comparison

| Component | Legacy | Modern Option 1 | Modern Option 2 |
|-----------|--------|----------------|----------------|
| Language | {current} | {option 1} | {option 2} |
| Platform | {current} | {option 1} | {option 2} |
| Database | {current} | {option 1} | {option 2} |
| Integration | {current} | {option 1} | {option 2} |

### B. Vendor/Tool Evaluation

{If COTS/SaaS replacement considered, list vendors evaluated}

| Vendor | Product | Fit Score (1-10) | Cost | Pros | Cons |
|--------|---------|-----------------|------|------|------|
| {vendor} | {product} | {score} | ${amount} | {pros} | {cons} |

### C. Case Studies

**Similar Modernizations:**
- {Company/System 1}: {approach}, {outcome}, {lessons learned}
- {Company/System 2}: {approach}, {outcome}, {lessons learned}

### D. References

- Seacord, Robert C. *Modernizing Legacy Systems.* SEI, 2003.
- Lewis, Grace A. *Modernization of Legacy Systems.* CMU/SEI, 2019.
- von Halle, Barbara. *Business Rules Applied.* Wiley, 2001.
- Fowler, Martin. *Refactoring: Improving the Design of Existing Code.* Addison-Wesley, 2018.
- Evans, Eric. *Domain-Driven Design.* Addison-Wesley, 2003.

---

**Assessment Date:** {YYYY-MM-DD}
**Assessment Team:**
- {Name}, {Role}
- {Name}, {Role}

**Document Version:** {version}
**Next Review Date:** {YYYY-MM-DD}
