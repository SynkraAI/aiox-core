# Template: BRAIN.yaml (L1 Entry Point)

## Minimal (SOLO)

```yaml
# BRAIN.yaml — Knowledge Graph Entry Point
# This file is a POINTER. Keep it under 500 tokens.

identity:
  name: "{Your Name / Business Name}"
  domain: "{What you do}"
  target: "{Who you serve}"

products:
  - name: "{Product Name}"
    type: "{digital_course | saas | service | physical}"
    price: "{price}"
    promise: "{Core promise in one sentence}"
    # Full spec: entities/products/{slug}.yaml

personas:
  - name: "{ICP Name}"
    summary: "{One line description}"
    # Full spec: entities/personas/{slug}.yaml

# Pointers (don't put content here, reference files)
paths:
  schema: "schema/entities.yaml"
  products: "entities/products/"
  personas: "entities/personas/"
```

## Standard (MEDIUM)

```yaml
# BRAIN.yaml — Knowledge Graph Entry Point

identity:
  name: "{Business Name}"
  domain: "{Industry / Niche}"
  mission: "{One sentence}"
  stage: "{pre-revenue | early | growth | scale}"

products:
  - id: "prod-001"
    name: "{Product}"
    price: "{price}"
    status: "{draft | active | retired}"
    path: "entities/products/prod-001.yaml"

personas:
  - id: "icp-001"
    name: "{Persona Name}"
    summary: "{One line}"
    path: "entities/personas/icp-001.yaml"

brand:
  path: "entities/brand/design-system.yaml"

paths:
  schema: "schema/entities.yaml"
  products: "entities/products/"
  personas: "entities/personas/"
  brand: "entities/brand/"
```

## Full (ENTERPRISE)

```yaml
# BRAIN.yaml — Knowledge Graph Entry Point

identity:
  name: "{Organization}"
  domain: "{Industry}"
  mission: "{Mission statement}"
  stage: "{stage}"
  north_star: "{Key metric}"

products:
  - id: "prod-001"
    name: "{Product A}"
    price: "{price}"
    status: active
    persona: "icp-001"
    path: "entities/products/prod-001.yaml"
  - id: "prod-002"
    name: "{Product B}"
    price: "{price}"
    status: draft
    persona: "icp-002"
    path: "entities/products/prod-002.yaml"

personas:
  - id: "icp-001"
    name: "{Primary ICP}"
    path: "entities/personas/icp-001.yaml"
  - id: "icp-002"
    name: "{Secondary ICP}"
    path: "entities/personas/icp-002.yaml"

brand:
  design_system: "entities/brand/design-system.yaml"
  voice: "entities/brand/voice-dna.yaml"

relationships:
  path: "schema/relationships.yaml"

paths:
  schema: "schema/"
  products: "entities/products/"
  personas: "entities/personas/"
  brand: "entities/brand/"
  campaigns: "entities/campaigns/"
```

---

## Entity Templates

### Product Entity (entities/products/{slug}.yaml)

```yaml
id: "prod-001"
name: "{Product Name}"
type: "{digital_course | saas | service | coaching | physical}"
status: "{draft | active | retired}"
price:
  amount: 0
  currency: "USD"
  model: "{one-time | subscription | tiered}"
promise: "{Core transformation in one sentence}"
features:
  - "{Feature 1}"
  - "{Feature 2}"
guarantee: "{Guarantee description}"
created: "{YYYY-MM-DD}"
owner: "{who maintains this}"
```

### Persona Entity (entities/personas/{slug}.yaml)

```yaml
id: "icp-001"
name: "{Persona Name}"
demographics:
  age_range: "{25-35}"
  location: "{Region/Country}"
  income: "{Range}"
  occupation: "{Role}"
psychographics:
  goals:
    - "{Primary goal}"
    - "{Secondary goal}"
  fears:
    - "{Primary fear}"
    - "{Secondary fear}"
  desires:
    - "{Primary desire}"
  frustrations:
    - "{Current frustration}"
  values:
    - "{Core value}"
awareness_level: "{unaware | problem_aware | solution_aware | product_aware | most_aware}"
sophistication_level: "{1-5}"
created: "{YYYY-MM-DD}"
owner: "{who maintains this}"
```
