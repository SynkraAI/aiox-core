# Task: Extract State Transitions

Find and document all status/state change rules and workflows.

```yaml
task:
  id: extract-state-transitions
  name: "Extract State Transition Rules"
  executor: decoder
  elicit: false

  input:
    required:
      - code_block: "Code section to analyze"
      - language: "Programming language"

  execution:
    steps:
      - step: 1
        name: "Identify state fields"
        action: |
          Find variables that represent status/state:
          - Names containing: status, estado, situacao, flag, fase, etapa
          - Enum-like values (A/I/B, ATIVO/INATIVO)
          - Boolean flags that control behavior
          - 88-level conditions in COBOL

      - step: 2
        name: "Map transitions"
        action: |
          For each state field, document:
          - All possible values (states)
          - Valid transitions (from → to)
          - Trigger condition for each transition
          - Side effects (other fields/actions triggered)

      - step: 3
        name: "Build state diagram"
        action: |
          Create ASCII state diagram:
          [PENDENTE] --aprovado--> [ATIVO] --cancelado--> [CANCELADO]
                                    |
                                    +--bloqueado--> [BLOQUEADO]

      - step: 4
        name: "Identify lifecycle patterns"
        action: |
          Common patterns:
          - CRUD lifecycle (create/read/update/delete)
          - Approval workflow (draft → review → approved → published)
          - Financial lifecycle (aberto → pago → conciliado)
          - Order lifecycle (pedido → separacao → expedicao → entregue)

  output:
    data:
      - "state_fields: [{field, possible_values}]"
      - "transitions: [{from, to, trigger, side_effects}]"
      - "diagrams: [ascii_state_diagram]"
```
