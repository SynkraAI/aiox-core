# Task: Classify Rule

Assign domain, module, severity, and unique ID to an extracted rule.

```yaml
task:
  id: classify-rule
  name: "Classify Business Rule"
  executor: cartographer
  elicit: false

  input:
    required:
      - rule: "Extracted rule object"
      - taxonomy: "Current domain taxonomy"

  execution:
    steps:
      - step: 1
        name: "Determine domain"
        action: |
          Analyze rule content to assign primary domain:
          1. Check source file path for domain clues
          2. Check variable/entity names
          3. Match keywords against domain taxonomy
          4. If ambiguous, check related rules for context
          Assign domain prefix (FIN, TRB, RH, LOG, COM, etc.)

      - step: 2
        name: "Determine module"
        action: |
          Within the domain, identify the specific module:
          - FIN: CALC (calculations), PAG (payments), REC (receivables)
          - TRB: ICMS, ISS, IPI, PIS, COFINS, IR
          - RH: FERI (vacation), SAL (salary), BENE (benefits)
          - LOG: ESTO (inventory), EXPE (shipping), COMP (purchasing)
          Generate 3-4 character module code.

      - step: 3
        name: "Assign ID"
        action: |
          Generate unique ID: {DOMAIN}-{MODULE}-{SEQ}
          Sequential number within domain-module.
          Check for existing IDs to avoid duplicates.

      - step: 4
        name: "Assign severity"
        action: |
          critica: Financial impact, compliance, data integrity
          importante: Operational impact, user experience
          informativa: Documentation, behavior description

      - step: 5
        name: "Tag rule"
        action: |
          Add relevant tags for search and filtering.
          Use standardized tag vocabulary when possible.

  output:
    data:
      - "classified_rule: {rule_id, domain, module, severity, tags}"
```
