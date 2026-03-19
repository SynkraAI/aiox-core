# Task: Generate Rule Map

Create visual ASCII map of domains, modules, and rule relationships.

```yaml
task:
  id: generate-rule-map
  name: "Generate Visual Rule Map"
  executor: cartographer
  elicit: false

  input:
    required:
      - catalog: "Rule catalog (YAML or parsed)"

  execution:
    steps:
      - step: 1
        name: "Domain overview map"
        action: |
          Generate ASCII tree showing all domains and module counts:

          SISTEMA LEGADO — Mapa de Regras
          |
          +-- FIN (Financeiro) ........... 47 regras
          |   +-- CALC (Calculos) ........ 12 regras
          |   +-- PAG (Pagamentos) ....... 18 regras
          |   +-- REC (Recebimentos) ..... 17 regras
          |
          +-- TRB (Tributario) ........... 31 regras
          |   +-- ICMS ................... 15 regras
          |   +-- ISS .................... 8 regras
          |   +-- PIS .................... 8 regras
          ...

      - step: 2
        name: "Dependency graph"
        action: |
          Show key dependency relationships:

          FIN-CALC-001 (ICMS import) --depends--> TRB-ICMS-003 (aliquota base)
          FIN-CALC-001 (ICMS import) --depends--> CAD-PROD-012 (NCM lookup)
          COM-PREC-005 (pricing) ------depends--> FIN-CALC-001 (ICMS import)

      - step: 3
        name: "Severity heatmap"
        action: |
          Show rule concentration by severity:

          Domain     | Critica | Importante | Informativa | Total
          -----------|---------|------------|-------------|------
          FIN        |    12   |     23     |     12      |   47
          TRB        |    18   |      8     |      5      |   31
          ...

  output:
    files:
      - "catalog/domain-map.md"
```
