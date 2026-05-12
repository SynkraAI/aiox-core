# Agent Personalization Standard v1.0

**Status:** Draft (Story 6.1.2 Implementation)
**Created:** 2025-01-14
**Authors:** Roundtable (Pedro Valério, Brad Frost, Seth Godin, Dan Kennedy)
**Principle:** **Familiaridade + Personalização = Produtividade**

---

## 🎯 Core Principle

> "Quando as informações estão sempre nas mesmas posições, nosso cérebro sabe onde buscar rápido."

**Structure is sacred. Tone is flexible.**

- ✅ **FIXED:** Template positions, section order, metric formats
- ✅ **FLEXIBLE:** Status messages, vocabulary, emoji choices (within palette)

---

## 📐 Architecture Overview

### Three-Layer System

```
┌─────────────────────────────────────┐
│   LAYER 1: Agent Persona Config     │  ← Personality definition (YAML)
│   (.aiox-core/agents/*.md)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   LAYER 2: Output Formatter         │  ← Template engine (JS)
│   (.aiox-core/infrastructure/scripts/)│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   LAYER 3: Standardized Output      │  ← Fixed structure + personalized tone
│   (Tasks, Templates, Checklists)    │
└─────────────────────────────────────┘
```

---

## 🔧 Layer 1: Agent Persona Configuration

### Agent File Structure (Updated)

```yaml
# .aiox-core/agents/{agent-id}.md

agent:
  name: {PersonalizedName}        # NEW: Human name (Dex, Quinn, Pax...)
  id: {agent-id}                  # UNCHANGED: System identifier
  title: {Role}                   # UNCHANGED: Professional role
  icon: {emoji}                   # UNCHANGED: Visual identifier
  whenToUse: "{description}"      # UNCHANGED

persona_profile:                  # NEW SECTION
  archetype: {Archetype}          # Builder, Guardian, Balancer, etc.
  zodiac: {Sign}                  # ♒ Aquarius, ♍ Virgo, ♎ Libra, etc.

  communication:
    tone: {tone}                  # pragmatic | empathetic | analytical | collaborative
    emoji_frequency: {level}      # high | medium | low | minimal

    vocabulary:                   # Agent-specific words (5-10)
      - {word1}
      - {word2}
      - {word3}

    greeting_levels:              # 3 personification levels
      minimal: "{icon} {id} Agent ready"
      named: "{icon} {name} ({archetype}) ready. {tagline}!"
      archetypal: "{icon} {name} the {archetype} ({zodiac}) ready to {verb}!"

    signature_closing: "{personalized_sign_off}"

# REST OF FILE UNCHANGED
persona:
  role: ...
  style: ...
commands:
  - ...
dependencies:
  - ...
```

### Example: Dex (Builder Agent)

```yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer
  icon: 💻
  whenToUse: "Use for code implementation, debugging, refactoring"

persona_profile:
  archetype: Builder
  zodiac: ♒ Aquarius

  communication:
    tone: pragmatic
    emoji_frequency: medium

    vocabulary:
      - construir
      - implementar
      - refatorar
      - resolver
      - otimizar

    greeting_levels:
      minimal: "💻 dev Agent ready"
      named: "💻 Dex (Builder) ready. Let's build something great!"
      archetypal: "💻 Dex the Builder (♒ Aquarius) ready to innovate!"

    signature_closing: "— Dex, sempre construindo 🔨"
```

### Archetype Vocabulary Reference

```yaml
# .aiox-core/data/archetype-vocabulary.yaml

archetypes:
  Builder:
    primary_verbs: [construir, implementar, refatorar, resolver, otimizar]
    avoid_words: [talvez, possivelmente, acho que, mais ou menos]
    emoji_palette: [⚡, 🔨, 🏗️, ✅, 🔧, 🛠️]
    emotional_signature: "Energia de reconstrução"

  Guardian:
    primary_verbs: [validar, verificar, proteger, garantir, auditar]
    avoid_words: [aproximadamente, parece, creio]
    emoji_palette: [✅, 🛡️, 🔍, ⚠️, 📋, 🎯]
    emotional_signature: "Proteção preventiva"

  Balancer:
    primary_verbs: [equilibrar, harmonizar, mediar, alinhar, integrar]
    avoid_words: [sempre, nunca, impossível]
    emoji_palette: [⚖️, 🤝, 📊, ✨, 🎯]
    emotional_signature: "Mediação colaborativa"

  Flow_Master:
    primary_verbs: [adaptar, pivotar, ajustar, fluir, evoluir]
    avoid_words: [rígido, fixo, imutável]
    emoji_palette: [🌊, 🔄, 💫, ⚡, 🎭]
    emotional_signature: "Adaptação fluida"
```

---

## 🎨 Layer 2: Output Formatter

### Template Engine Architecture

```javascript
// .aiox-core/infrastructure/scripts/output-formatter.js

class PersonalizedOutputFormatter {
  constructor(agent, task, results) {
    this.agent = agent;
    this.task = task;
    this.results = results;
    this.personality = agent.persona_profile;
  }

  /**
   * Generate standardized output with personality injection
   * STRUCTURE: Always fixed (familiaridade)
   * TONE: Personalized per agent (personalização)
   */
  format() {
    return this.renderTemplate('task-execution-report', {
      // FIXED POSITIONS (never change)
      header: this.buildFixedHeader(),
      metrics: this.buildFixedMetrics(),

      // PERSONALITY SLOTS (varies per agent)
      statusMessage: this.buildPersonalizedStatus(),
      signature: this.personality.communication.signature_closing
    });
  }

  buildFixedHeader() {
    // ALWAYS same position, same format
    return `
## 📊 Task Execution Report

**Agent:** ${this.agent.name} (${this.personality.archetype})
**Task:** ${this.task.name}
**Started:** ${this.results.timestamp.start}
**Completed:** ${this.results.timestamp.end}
**Duration:** ${this.results.duration}
**Tokens Used:** ${this.results.tokens.input} in / ${this.results.tokens.output} out / ${this.results.tokens.total} total
`;
  }

  buildPersonalizedStatus() {
    const { tone, vocabulary } = this.personality.communication;
    const verb = this.selectVerbFromVocabulary(vocabulary);

    // Generate status message matching agent personality
    switch(this.results.status) {
      case 'success':
        return this.generateSuccessMessage(tone, verb);
      case 'warning':
        return this.generateWarningMessage(tone);
      case 'error':
        return this.generateErrorMessage(tone);
    }
  }

  generateSuccessMessage(tone, verb) {
    const templates = {
      pragmatic: `✅ Tá pronto! ${verb.charAt(0).toUpperCase() + verb.slice(1)} com sucesso.`,
      empathetic: `✅ Concluído com cuidado. ${verb.charAt(0).toUpperCase() + verb.slice(1)} pensando em todos os casos.`,
      analytical: `✅ Validado. ${verb.charAt(0).toUpperCase() + verb.slice(1)} conforme especificações.`,
      collaborative: `✅ Feito! ${verb.charAt(0).toUpperCase() + verb.slice(1)} em conjunto com as dependências.`
    };

    return templates[tone] || templates.pragmatic;
  }

  buildFixedMetrics() {
    // ALWAYS last section, ALWAYS same format
    return `
### Metrics
- Tests: ${this.results.tests.passed}/${this.results.tests.total}
- Coverage: ${this.results.coverage}%
- Linting: ${this.results.lint.status}
`;
  }
}
```

### Pattern Validation

```javascript
// .aiox-core/infrastructure/scripts/validate-output-pattern.js

/**
 * Ensures all task outputs follow standard structure
 * CRITICAL: Familiarity depends on consistency
 */
function validateTaskOutput(output) {
  const requiredPatterns = [
    { pattern: /## 📊 Task Execution Report/, name: 'Header' },
    { pattern: /\*\*Agent:\*\*/, name: 'Agent line (line 3)' },
    { pattern: /\*\*Duration:\*\*/, name: 'Duration line (line 6)' },
    { pattern: /\*\*Tokens Used:\*\*/, name: 'Tokens line (line 7)' },
    { pattern: /### Status/, name: 'Status section' },
    { pattern: /### Metrics/, name: 'Metrics section (always last)' },
  ];

  const errors = [];

  requiredPatterns.forEach(({ pattern, name }) => {
    if (!pattern.test(output)) {
      errors.push(`Missing required pattern: ${name}`);
    }
  });

  // Validate Metrics section is last
  const sections = output.split('###');
  const lastSection = sections[sections.length - 1];
  if (!lastSection.includes('Metrics')) {
    errors.push('Metrics section must be last (familiarity requirement)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 📝 Layer 3: Standardized Templates

### Task Execution Report Template

```markdown
<!-- .aiox-core/templates/task-execution-report.md -->

## 📊 Task Execution Report

**Agent:** {agent.name} ({agent.persona_profile.archetype})
**Task:** {task.name}
**Started:** {timestamp.start}
**Completed:** {timestamp.end}
**Duration:** {duration}
**Tokens Used:** {tokens.input} in / {tokens.output} out / {tokens.total} total

---

### Status
{status_icon} {personalized_status_message}

### Output
{task_specific_content}

### Metrics
- Tests: {tests.passed}/{tests.total}
- Coverage: {coverage}%
- Linting: {lint.status}

---
{agent.persona_profile.signature_closing}
```

### Checklist Template

```markdown
<!-- .aiox-core/templates/agent-checklist-template.md -->

# {Agent ID} - {Checklist Title}

**Agent:** {agent.name} ({archetype})
**Purpose:** {checklist_purpose}

---

## Pre-Execution Checks

- [ ] {Standard check 1 - always same across agents}
- [ ] {Standard check 2 - always same across agents}
- [ ] {Standard check 3 - always same across agents}

## Execution Validation

- [ ] {Standard validation 1}
- [ ] {Standard validation 2}

## Post-Execution Review

- [ ] {Standard review 1}
- [ ] {Standard review 2}

---

**{Agent Name} Note:** {personalized_guidance_based_on_archetype}

**Example:**
**Dex Note:** "Se algum teste falhou, refatore até passar. Não entregue código quebrado."
**Quinn Note:** "Valide edge cases extras além dos listados. Proteção nunca é demais."
```

### Workflow YAML Template

```yaml
# .aiox-core/workflows/{workflow-name}.yaml

workflow:
  name: {Workflow Name}
  description: {Description}

  agents:
    - id: {agent-id}
      role: {role in workflow}
      personality_mode: named  # minimal | named | archetypal

  steps:
    - step: 1
      agent: {agent-id}
      task: {task-name}
      output_format: standard  # Uses task-execution-report template

      personality_injection:   # Optional: customize for this step
        status_prefix: "Step 1"
        emphasis_metrics: [duration, tokens]

# STRUCTURE: Fixed
# PERSONALITY: Injected via persona_profile
```

---

## 🎯 Personality Injection Points

### Where Personality Shows (Flexible)

1. **Status Messages** - Tone varies per agent
   - Dex: "✅ Tá pronto! Refatorei 3 componentes."
   - Quinn: "✅ Validado com rigor. 47 edge cases testados."

2. **Signature Closings** - Agent-specific sign-off
   - Dex: "— Dex, sempre construindo 🔨"
   - Quinn: "— Quinn, guardião da qualidade 🛡️"

3. **Emoji Selection** - From archetype palette
   - Builder: ⚡🔨🏗️
   - Guardian: ✅🛡️🔍

4. **Verb Choice** - From vocabulary list
   - Builder: construir, implementar, refatorar
   - Guardian: validar, verificar, garantir

### What NEVER Changes (Fixed)

1. **Section Order** - Always: Header → Status → Output → Metrics
2. **Metric Positions** - Duration (line 6), Tokens (line 7)
3. **Formatting** - Bold labels, consistent spacing
4. **Icons** - 📊 for reports, ✅/⚠️/❌ for status

---

## 📊 Implementation Phases

### Phase 1: Agent File Updates (Day 1-2)
**Goal:** Add `persona_profile` to 11 agents

**Tasks:**
1. Update dev.md → Dex (Builder)
2. Update qa.md → Quinn (Guardian)
3. Update po.md → Pax (Balancer)
4. Update pm.md → Morgan (Visionary)
5. Update sm.md → River (Flow Master)
6. Update architect.md → Aria (Architect)
7. Update analyst.md → Atlas (Explorer)
8. Update ux-design-expert.md → Uma (Empathizer)
9. Rename db-sage.md → data-engineer.md → Dara (Engineer)
10. Rename github-devops.md → devops.md → Gage (Operator)
11. Merge aiox-developer + aiox-orchestrator → aiox-master.md → Orion (Orchestrator)

**Deliverable:** 11 updated agent files with persona_profile section

### Phase 2: Output Formatter (Day 2-3)
**Goal:** Create template engine with personality injection

**Tasks:**
1. Create `output-formatter.js`
2. Create `validate-output-pattern.js`
3. Create `task-execution-report.md` template
4. Unit tests for formatter
5. Integration with existing tasks

**Deliverable:** Working formatter + validation

### Phase 3: Task Template Updates (Day 3-4)
**Goal:** Update develop-story.md to use formatter

**Tasks:**
1. Add duration tracking
2. Add token tracking
3. Integrate output formatter
4. Test with Dex agent
5. Validate output structure

**Deliverable:** 1 updated task (proof of concept)

### Phase 4: Baseline Metrics (Day 4-5)
**Goal:** Measure impact

**Metrics to track:**
- Time to comprehend task output (before/after)
- User satisfaction survey (1-5 scale)
- Token overhead (% increase)
- Agent activation frequency (discoverability)

**Deliverable:** Metrics dashboard

---

## ✅ Success Criteria

### Must Have (MVP)
- [ ] All 11 agents have `persona_profile` section
- [ ] Output formatter generates valid templates
- [ ] At least 1 task uses new format
- [ ] Backward compatibility maintained
- [ ] Validation script catches malformed outputs

### Should Have
- [ ] User comprehension speed +8% or better
- [ ] Token overhead <15%
- [ ] All tasks migrated to new format

### Nice to Have
- [ ] User satisfaction +12% or better
- [ ] Agent personality recognized in blind test
- [ ] Community feedback positive

---

## 🚫 Anti-Patterns to Avoid

### ❌ Breaking Familiaridade
**DON'T:**
```markdown
**Dex says:** Duration was 2.3s  ← Metrics in wrong position
**Tokens:** 1,234
### Output                     ← Sections out of order
...
### Status                     ← Status should be before Output
```

**DO:**
```markdown
**Duration:** 2.3s              ← Fixed position
**Tokens:** 1,234 total         ← Fixed position
---
### Status                      ← Always before Output
### Output
### Metrics                     ← Always last
```

### ❌ Over-Personalizing Structure
**DON'T:**
```yaml
# Different agents with different formats
dex_output: "Status: {status} | Duration: {dur}"
quinn_output: "Result → {status} (took {dur})"
```

**DO:**
```yaml
# Same structure, different tone
all_agents_header: "**Duration:** {dur}"  # Fixed
dex_status: "✅ Tá pronto!"               # Personality
quinn_status: "✅ Validado."              # Personality
```

### ❌ Vocabulary Drift
**DON'T:**
```javascript
// Random verb selection across agents
dex: "completed successfully"    ← Generic
quinn: "got it done"             ← Informal
```

**DO:**
```javascript
// Vocabulary from archetype definition
dex: loadVocabulary('Builder')   → "construir"
quinn: loadVocabulary('Guardian') → "validar"
```

---

## 📚 References

- **Story 6.1.2:** Agent File Updates
- **Epic 6.1:** Agent Identity System
- **DECISION-1:** PT-BR Localization Priority
- **Brad Frost:** Atomic Design principles
- **Pedro Valério:** Automation-first philosophy
- **Seth Godin:** Brand personality frameworks
- **Dan Kennedy:** ROI-driven implementation

---

## 🔄 Maintenance

### Monthly Review
- Audit all outputs for structure compliance
- Validate personality consistency
- Measure comprehension metrics
- Update archetype vocabulary if needed

### Quarterly Updates
- User satisfaction survey
- A/B test new personality variations
- Refine formatter based on feedback

---

**Last Updated:** 2025-01-14
**Next Review:** After Story 6.1.2 completion
**Status:** Ready for Implementation
