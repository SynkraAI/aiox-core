# Task Execution Report Template

**Version:** 1.0  
**Story:** 6.1.6 - Output Formatter Implementation  
**Purpose:** Standardized output structure with personality injection slots

---

## Structure Overview

This template defines the fixed structure for task execution reports. The structure is **sacred** (must be maintained), while personality slots allow agent-specific customization.

**Philosophy:** "Structure is sacred. Tone is flexible."

---

## Fixed Structure (Must Maintain)

### Header Section (Lines 1-8)

```markdown
## 📊 Task Execution Report

**Agent:** {agent.name} ({archetype})
**Task:** {task.name}
**Started:** {timestamp.start}
**Completed:** {timestamp.end}
**Duration:** {duration}                    ← LINE 7 (FIXED POSITION)
**Tokens Used:** {tokens.total} total       ← LINE 8 (FIXED POSITION)
```

**Fixed Elements:**
- Header title: `## 📊 Task Execution Report` (must be exact)
- Duration must appear on **line 7** (relative to header start)
- Tokens Used must appear on **line 8** (relative to header start)
- Format: `**Duration:** {value}` and `**Tokens Used:** {value} total`

### Section Order (Must Maintain)

1. **Header** - Always first
2. **Status** - After header separator
3. **Output** - After status
4. **Metrics** - Always last (before signature)

---

## Personality Slots (Flexible)

### Status Section

```markdown
### Status
{status_icon} {PERSONALIZED_MESSAGE}        ← PERSONALITY SLOT
```

**Flexible Elements:**
- Status icon: `✅` (success) or `❌` (failure)
- Personalized message: Uses agent vocabulary and tone
- Tone-specific patterns:
  - **Pragmatic:** "Tá pronto! {verb}ado com sucesso."
  - **Empathetic:** "{Verb}ido com cuidado e atenção aos detalhes."
  - **Analytical:** "{Verb}ido rigorosamente. Todos os critérios validados."
  - **Collaborative:** "{Verb}ido e harmonizado. Todos os aspectos alinhados."

### Output Section

```markdown
### Output
{task_specific_content}                     ← TASK-SPECIFIC CONTENT
```

**Flexible Elements:**
- Content is task-specific
- Format can vary based on task type
- No personality injection here (pure task output)

### Metrics Section

```markdown
### Metrics                                  ← ALWAYS LAST (FIXED)
- Tests: {tests.passed}/{tests.total}
- Coverage: {coverage}%
- Linting: {lint.status}
```

**Fixed Elements:**
- Section title: `### Metrics` (must be exact)
- Must be the last section before signature
- Format is standardized

### Signature Closing

```markdown
---
{signature_closing}                         ← PERSONALITY SLOT
```

**Flexible Elements:**
- Uses `persona_profile.communication.signature_closing`
- Examples:
  - Builder: "— Dex, sempre construindo 🔨"
  - Guardian: "— Quinn, guardião da qualidade 🛡️"
  - Balancer: "— Pax, equilibrando prioridades 🎯"

---

## Usage Examples

### Example 1: Builder (Pragmatic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Dex (Builder)
**Task:** develop-story
**Started:** 2025-01-14T10:30:00Z
**Completed:** 2025-01-14T10:32:23Z
**Duration:** 2.3s
**Tokens Used:** 1,801 total

---

### Status
✅ Tá pronto! Implementado com sucesso.

### Output
Created components:
- UserProfile.tsx
- UserAvatar.tsx
- UserSettings.tsx

All tests passing, coverage 87%.

### Metrics
- Tests: 12/12
- Coverage: 87%
- Linting: ✅ Clean

---
— Dex, sempre construindo 🔨
```

### Example 2: Guardian (Analytical Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Quinn (Guardian)
**Task:** qa-gate
**Started:** 2025-01-14T11:00:00Z
**Completed:** 2025-01-14T11:05:47Z
**Duration:** 5.8s
**Tokens Used:** 2,345 total

---

### Status
✅ Validado rigorosamente. Todos os critérios validados.

### Output
Validation complete:
- Unit tests: 47/47 ✅
- Integration tests: 12/12 ✅
- Edge cases: 15/15 ✅
- Security: No vulnerabilities

### Metrics
- Tests: 74/74
- Coverage: 94%
- Linting: ✅ Clean

---
— Quinn, guardião da qualidade 🛡️
```

### Example 3: Balancer (Collaborative Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Pax (Balancer)
**Task:** validate-story-draft
**Started:** 2025-01-15T09:00:00Z
**Completed:** 2025-01-15T09:15:32Z
**Duration:** 15.5s
**Tokens Used:** 3,421 total

---

### Status
✅ Validado e harmonizado. Todos os aspectos alinhados.

### Output
Validation complete:
- Template compliance: ✅ All sections present
- Acceptance criteria: ✅ 7/7 covered
- File structure: ✅ All paths verified

### Metrics
- Tests: 0/0 (validation only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Pax, equilibrando prioridades 🎯
```

### Example 4: Flow Master (Empathetic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** River (Flow Master)
**Task:** create-story
**Started:** 2025-01-15T10:00:00Z
**Completed:** 2025-01-15T10:08:15Z
**Duration:** 8.2s
**Tokens Used:** 2,156 total

---

### Status
✅ Criado com cuidado e atenção aos detalhes.

### Output
Story created:
- Story ID: STORY-6.1.8
- Epic: Epic-6.1
- Status: Ready to Start
- Acceptance criteria: 5 defined

### Metrics
- Tests: 0/0 (creation only)
- Coverage: N/A
- Linting: ✅ Clean

---
— River, facilitando o fluxo 🌊
```

### Example 5: Architect (Analytical Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Aria (Architect)
**Task:** design-architecture
**Started:** 2025-01-15T11:00:00Z
**Completed:** 2025-01-15T11:25:47Z
**Duration:** 25.8s
**Tokens Used:** 4,892 total

---

### Status
✅ Projetado rigorosamente. Todos os critérios validados.

### Output
Architecture design complete:
- 3-layer system designed
- Pattern validation: ✅ All patterns documented
- Scalability analysis: ✅ Horizontal scaling supported

### Metrics
- Tests: 0/0 (design only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Aria, arquitetando o futuro 🏛️
```

### Example 6: Visionary (Pragmatic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Morgan (Visionary)
**Task:** create-prd
**Started:** 2025-01-15T12:00:00Z
**Completed:** 2025-01-15T12:15:30Z
**Duration:** 15.5s
**Tokens Used:** 3,200 total

---

### Status
✅ Tá pronto! Planejado com sucesso.

### Output
PRD created:
- Product: AIOX Framework
- Version: 2.0
- Epics: 5 defined
- Stories: 23 planned

### Metrics
- Tests: 0/0 (documentation only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Morgan, planejando o futuro 📋
```

### Example 7: Explorer (Analytical Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Atlas (Explorer)
**Task:** analyze-codebase
**Started:** 2025-01-15T13:00:00Z
**Completed:** 2025-01-15T13:20:15Z
**Duration:** 20.3s
**Tokens Used:** 4,100 total

---

### Status
✅ Analisado rigorosamente. Todos os padrões identificados.

### Output
Analysis complete:
- Files analyzed: 1,247
- Patterns identified: 15
- Dependencies mapped: 89
- Recommendations: 12

### Metrics
- Tests: 0/0 (analysis only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Atlas, explorando o código 🔍
```

### Example 8: Empathizer (Empathetic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Uma (Empathizer)
**Task:** design-user-flow
**Started:** 2025-01-15T14:00:00Z
**Completed:** 2025-01-15T14:10:22Z
**Duration:** 10.4s
**Tokens Used:** 2,500 total

---

### Status
✅ Projetado com cuidado e atenção aos detalhes.

### Output
User flow designed:
- User journeys: 3 mapped
- Pain points: 5 identified
- Solutions: 8 proposed
- Prototypes: 2 created

### Metrics
- Tests: 0/0 (design only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Uma, cuidando da experiência 🎨
```

### Example 9: Engineer (Pragmatic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Dara (Engineer)
**Task:** optimize-query
**Started:** 2025-01-15T15:00:00Z
**Completed:** 2025-01-15T15:05:10Z
**Duration:** 5.2s
**Tokens Used:** 1,800 total

---

### Status
✅ Tá pronto! Otimizado com sucesso.

### Output
Query optimized:
- Execution time: 2.3s → 0.15s (93% improvement)
- Indexes added: 2
- Query plan: Optimized

### Metrics
- Tests: 5/5
- Coverage: 100%
- Linting: ✅ Clean

---
— Dara, otimizando dados 📊
```

### Example 10: Operator (Pragmatic Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Gage (Operator)
**Task:** deploy-staging
**Started:** 2025-01-15T16:00:00Z
**Completed:** 2025-01-15T16:02:30Z
**Duration:** 2.5s
**Tokens Used:** 1,200 total

---

### Status
✅ Tá pronto! Implantado com sucesso.

### Output
Deployment complete:
- Environment: staging
- Version: 1.2.3
- Health check: ✅ Passing
- Rollback ready: ✅ Yes

### Metrics
- Tests: 0/0 (deployment only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Gage, automatizando tudo ⚙️
```

### Example 11: Orchestrator (Collaborative Tone)

```markdown
## 📊 Task Execution Report

**Agent:** Orion (Orchestrator)
**Task:** coordinate-sprint
**Started:** 2025-01-15T17:00:00Z
**Completed:** 2025-01-15T17:10:45Z
**Duration:** 10.8s
**Tokens Used:** 2,800 total

---

### Status
✅ Coordenado e harmonizado. Todos os aspectos alinhados.

### Output
Sprint coordinated:
- Stories assigned: 8
- Dependencies resolved: 3
- Team alignment: ✅ Complete
- Blockers cleared: 2

### Metrics
- Tests: 0/0 (coordination only)
- Coverage: N/A
- Linting: ✅ Clean

---
— Orion, orquestrando o sistema 🌟
```

---

## Validation Rules

The validator (`validate-output-pattern.js`) enforces:

1. **Required Sections:** Header, Status, Output, Metrics must all exist
2. **Line Positions:** Duration on line 7, Tokens on line 8 (relative to header start)
3. **Section Order:** Header → Status → Output → Metrics (Metrics must be last)
4. **Format Compliance:** Section markers must match exactly

---

## Implementation Notes

- Use `PersonalizedOutputFormatter` class to generate reports
- Use `OutputPatternValidator` to validate structure
- Vocabulary comes from `persona_profile.communication.vocabulary` in agent files
- Tone-specific messages generated by `generateSuccessMessage()` method
- Performance target: <50ms per output generation

---

**Last Updated:** 2025-01-15  
**Story:** 6.1.6 - Output Formatter Implementation

