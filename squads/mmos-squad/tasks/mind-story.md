---
task: mind-story
agent: cognitive-analyst
params:
  - mind_slug (required)
  - sources_path (optional)
elicit: true

estimated-duration: "1-2 hours"

token-estimation:
  input: 150000       # Sources + existing artifacts
  processing: 200000  # Timeline extraction + synthesis
  output: 50000       # YAML generation
  total_min: 300000
  total_max: 400000

dependencies:
  requires:
    - research-collection (completed)
    - cognitive-analysis (layers 1-4 minimum)
  templates:
    - mind-history.yaml
  outputs:
    - outputs/minds/{mind_slug}/history.yaml

user-confirmation-required: false
---

# Mind Story - Biographical Timeline Extraction

**Purpose:** Extract and synthesize the biographical journey of a mind into a structured timeline with events, achievements, and transformation arcs.

**Output:** `history.yaml` - YAML file compatible with HistoryTab UI component

---

## 🎯 Objective

Create a compelling biographical narrative that:
1. Maps key life events chronologically
2. Identifies pivotal transformations
3. Extracts professional achievements
4. Reveals recurring journey themes
5. Documents the transformation arc (who they were → who they became)

---

## 📋 Event Types

Classify each event into one of these types:

| Type | Description | Visual Color |
|------|-------------|--------------|
| `origin` | Formative experiences, childhood, family context | Zinc/Gray |
| `milestone` | Major achievements, successes, recognition | Gold |
| `pivot` | Direction changes, transformations, new paths | Cyan |
| `crisis` | Challenges, failures, dark moments | Red |
| `learning` | Education, insights, skill acquisition | Purple |

---

## 🔍 Extraction Process

### Step 1: Source Analysis

Analyze all available sources for biographical information:
- Interviews and podcasts (primary - first-person accounts)
- Biographies and articles (secondary)
- Social media and public statements
- Existing MMOS artifacts (identity-core, cognitive-spec)

### Step 2: Event Identification

For each potential event, extract:

```yaml
- id: unique-slug
  year: "YYYY" or "Period description"
  title: "Impactful short title"
  description: "1-2 sentence summary"
  type: origin|milestone|pivot|crisis|learning
  relevance: 1-10  # importance to overall narrative
  details:
    - "[[Tag]] Specific detail with context"
    - "[[Tag]] Evidence or quote"
    - "[[Tag]] Consequence or learning"
```

### Step 3: Detail Formatting

Use `[[Tag]]` syntax for detail categorization:
- `[[Contexto]]` - Situational background
- `[[Gatilho]]` - What triggered the event
- `[[Decisao]]` - Choice made
- `[[Impacto]]` - Consequences
- `[[Licao]]` - Lesson learned
- `[[Validacao]]` - Evidence or proof
- `[[Resultado]]` - Outcome

### Step 4: Achievement Extraction

Identify professional achievements for the grid display:

```yaml
achievements:
  - title: "Achievement name"
    period: "2017 - Present" or "2019"
    description: "Impact and significance in 1-2 sentences"
```

### Step 5: Theme Identification

Identify 3-5 recurring themes across the journey:
- Patterns of behavior
- Recurring challenges
- Core motivations
- Transformation triggers

### Step 6: Transformation Arc

Document the evolution:
- **Starting point:** Who were they initially?
- **Key transformations:** Major identity shifts
- **Current state:** Who are they now?

---

## ✅ Quality Criteria

### Required
- [ ] Minimum 10 events covering major life phases
- [ ] At least one event of each type (origin, milestone, pivot, crisis, learning)
- [ ] All events have evidence-based details
- [ ] Chronological order maintained
- [ ] Relevance scores assigned (1-10)

### Recommended
- [ ] Quote that captures journey essence
- [ ] 4-6 professional achievements
- [ ] 3-5 journey themes identified
- [ ] Transformation arc documented
- [ ] Source references for verification

### Avoid
- [ ] Speculation without evidence
- [ ] Trivial events (relevance < 5)
- [ ] Duplicate or redundant events
- [ ] Unverified claims
- [ ] Excessive detail (keep details to 3-5 per event)

---

## 📤 Output Format

Generate `history.yaml` following the template structure:

```yaml
version: "1.0"
mind_name: "[Full Name]"
created_date: "YYYYMMDD-HHMM"
quote: "[Journey-defining quote]"

events:
  - id: origin-1
    year: "Childhood"
    title: "The Foundation"
    description: "..."
    type: origin
    relevance: 9
    details:
      - "[[Contexto]] ..."

achievements:
  - title: "..."
    period: "..."
    description: "..."

journey_themes:
  - theme: "..."
    description: "..."
    events_related: [...]

transformation_arc:
  starting_point:
    identity: "..."
  key_transformations:
    - from: "..."
      to: "..."
  current_state:
    identity: "..."
    mission: "..."

metadata:
  sources_analyzed: [...]
  confidence_level: HIGH|MEDIUM|LOW
```

---

## 🔗 Integration

After generation, the history.yaml can be:
1. Imported to database via `import-mind-history.mjs` script
2. Displayed in UI via `HistoryTab` component
3. Used as context for system prompt generation

---

## 📝 Example Event

```yaml
- id: livro-4horas
  year: "2014"
  title: "Trabalhe 4 Horas por Semana"
  description: "Leitura do livro de Tim Ferriss causa impacto profundo na mentalidade sobre trabalho e dinheiro."
  type: pivot
  relevance: 10
  details:
    - "[[Paradigma quebrado]] Primeira exposicao a ideia de alavancagem e automacao"
    - "[[Efeito cascata]] Leva ao estudo de minimalismo e Lei de Pareto"
    - "[[Conexoes]] Comeca a conversar com pessoas do mercado digital"
    - "[[Metodo]] Passa a aplicar modelagem, inspirado por Anthony Robbins"
```

---

## ⚠️ Notes

- Prioritize first-person accounts over secondary sources
- When in doubt about type, choose based on emotional impact
- Keep descriptions concise - details go in the details array
- Quote should be authentic (from the person) or synthesized from their philosophy
