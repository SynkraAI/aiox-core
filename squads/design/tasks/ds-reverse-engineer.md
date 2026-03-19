# Reverse Engineer Validated System

> Task ID: ds-reverse-engineer
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> Heuristic: #9 - Engenharia reversa do validado > criar do zero

## Description

Extrair padrões de design systems validados (Shopify, Vercel, ClickMax, etc) em vez de criar do zero.

**Princípio:** Sistemas com milhões de usuários já validaram UX. Extrair > inventar.

---

## Input Contract

```yaml
input:
  source_url: string          # URL do sistema a analisar
  source_type: enum           # "public_site" | "figma" | "storybook" | "github"
  focus_areas:                # Áreas de interesse
    - tokens
    - components
    - patterns
    - interactions
  output_format: enum         # "report" | "tokens" | "components" | "full"
```

## Output Contract

```yaml
output:
  analysis_report:
    source: string
    extraction_date: date
    patterns_found: array
    tokens_extracted: object
    components_identified: array
    recommendations: array
  artifacts:
    - path: string
      type: string
```

---

## Workflow

### Phase 1: Capture

```bash
# Para sites públicos
node infrastructure/services/etl/bin/fetch-page.js <url> --format json

# Para Storybook
# Navegar e capturar via Playwright

# Para Figma
# Usar Figma API ou MCP
```

**Deliverable:** Raw data capturado

### Phase 2: Extract

1. **Tokens**
   - Cores (primitives + semantic)
   - Spacing scale
   - Typography scale
   - Border radius
   - Shadows

2. **Components**
   - Lista de componentes identificados
   - Variantes por componente
   - Estados (hover, focus, disabled, error)

3. **Patterns**
   - Layout patterns
   - Navigation patterns
   - Form patterns
   - Feedback patterns

**Deliverable:** Structured extraction

### Phase 3: Analyze

1. Comparar com nosso `design-tokens-spec.yaml`
2. Identificar gaps
3. Identificar conflitos
4. Priorizar adoção

**Deliverable:** Gap analysis report

### Phase 4: Propose

1. Propor tokens para adicionar/modificar
2. Propor componentes para criar
3. Propor patterns para adotar
4. Estimar esforço

**Deliverable:** Adoption proposal

---

## Veto Conditions

- [ ] Source não é acessível
- [ ] Source requer autenticação não disponível
- [ ] Extração viola ToS do source
- [ ] Padrões extraídos conflitam com brand guidelines

---

## Quality Gates

- [ ] Extraction é reproduzível (script documentado)
- [ ] Tokens extraídos validam contra schema
- [ ] Gap analysis tem priorização clara
- [ ] Proposal tem estimativa de esforço

---

## Example Output

```yaml
# extraction-report-vercel-2026-02-16.yaml
source: "vercel.com/dashboard"
extraction_date: "2026-02-16"

tokens_extracted:
  colors:
    background: "#000000"
    foreground: "#FFFFFF"
    accents:
      blue: "#0070F3"
      cyan: "#50E3C2"
  spacing:
    base: "4px"
    scale: [4, 8, 16, 24, 32, 48, 64]
  radius:
    sm: "4px"
    md: "6px"
    lg: "8px"

components_identified:
  - name: "Button"
    variants: ["primary", "secondary", "ghost", "danger"]
    sizes: ["sm", "md", "lg"]
  - name: "Card"
    variants: ["default", "hover", "selected"]

patterns_identified:
  - name: "Dashboard Layout"
    description: "Sidebar + main content"
  - name: "Empty State"
    description: "Icon + title + description + CTA"

recommendations:
  - priority: "high"
    action: "Adopt spacing scale (matches our 4px base)"
  - priority: "medium"
    action: "Consider accent color palette"
```

---

## References

- Meeting Insights: Heuristic #9
- Design Tokens Spec: `squads/design/data/design-tokens-spec.yaml`
- ETL Service: `infrastructure/services/etl/`

---

*Task criada: 2026-02-16*
*Squad: Design*


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
