# Parallelization Analysis Gate

> Task ID: ds-parallelization-gate
> Agent: Design Chief
> Version: 1.0.0
> Heuristic: #11 - Paralelização só após análise de dependência

## Description

Gate obrigatório antes de distribuir trabalho em paralelo. Analisa dependências e identifica conflitos.

**Princípio:** Paralelizar sem análise = merge conflicts + retrabalho.

---

## When to Use

Execute ANTES de:
- Distribuir componentes para múltiplos agents
- Executar múltiplas tasks de design simultaneamente
- Modificar tokens que afetam múltiplos componentes
- Refatorar patterns compartilhados

---

## Input

```yaml
input:
  tasks_to_parallelize:
    - task_id: string
      scope:
        files: array
        tokens: array
        components: array

  execution_mode: enum  # "parallel" | "sequential" | "hybrid"
```

---

## Analysis Algorithm

```python
def analyze_parallelization(tasks):
    """
    Retorna quais tasks podem rodar em paralelo
    e quais devem ser sequenciais.
    """

    # 1. Extrair recursos de cada task
    resources = {}
    for task in tasks:
        resources[task.id] = {
            'reads': extract_reads(task),
            'writes': extract_writes(task)
        }

    # 2. Detectar conflitos
    conflicts = []
    for i, task_a in enumerate(tasks):
        for task_b in tasks[i+1:]:
            # Write-Write conflict
            if overlap(resources[task_a.id]['writes'],
                       resources[task_b.id]['writes']):
                conflicts.append({
                    'type': 'write-write',
                    'tasks': [task_a.id, task_b.id],
                    'resource': get_overlap(...)
                })

            # Read-Write conflict
            if overlap(resources[task_a.id]['reads'],
                       resources[task_b.id]['writes']):
                conflicts.append({
                    'type': 'read-write',
                    'tasks': [task_a.id, task_b.id],
                    'resource': get_overlap(...)
                })

    # 3. Separar parallelizable vs sequential
    if conflicts:
        return {
            'can_parallelize': False,
            'conflicts': conflicts,
            'recommendation': build_sequence(tasks, conflicts)
        }

    return {
        'can_parallelize': True,
        'parallel_groups': group_by_independence(tasks)
    }
```

---

## Execution Steps

1. Coletar escopo (`reads`/`writes`) de cada task candidata.
2. Rodar análise de conflito (`write-write`, `read-write`, dependências de token/composição).
3. Marcar tasks bloqueadas para execução paralela.
4. Gerar plano final: grupos paralelos seguros ou sequência ordenada.
5. Publicar evidências de conflito e decisão final de execução.

---

## Conflict Types

| Type | Description | Resolution |
|------|-------------|------------|
| **Write-Write** | Duas tasks escrevem no mesmo arquivo | Sequenciar |
| **Read-Write** | Uma task lê o que outra escreve | Ordenar (write primeiro) |
| **Token Dependency** | Componente depende de token sendo modificado | Sequenciar |
| **Component Composition** | Componente A usa componente B | B antes de A |

---

## Output

```yaml
output:
  analysis_result:
    can_parallelize: boolean
    conflicts: array

  execution_plan:
    # Se pode paralelizar
    parallel_groups:
      - group_id: 1
        tasks: ["task-a", "task-b"]
      - group_id: 2
        tasks: ["task-c"]
        depends_on: [1]

    # Se não pode
    sequence:
      - task_id: "task-a"
        reason: "Modifies shared tokens"
      - task_id: "task-b"
        depends_on: "task-a"
        reason: "Uses tokens from task-a"
```

---

## Example

### Input
```yaml
tasks_to_parallelize:
  - task_id: "update-button-tokens"
    scope:
      files: ["design-tokens-spec.yaml"]
      tokens: ["color.brand.primary"]
      components: []

  - task_id: "refactor-button-component"
    scope:
      files: ["button.tsx", "button.variants.ts"]
      tokens: ["color.brand.primary"]  # READS this token
      components: ["button"]

  - task_id: "create-card-component"
    scope:
      files: ["card.tsx"]
      tokens: ["color.surface.default"]
      components: ["card"]
```

### Output
```yaml
analysis_result:
  can_parallelize: false
  conflicts:
    - type: "read-write"
      tasks: ["update-button-tokens", "refactor-button-component"]
      resource: "color.brand.primary"
      reason: "refactor-button reads token that update-button writes"

execution_plan:
  sequence:
    - task_id: "update-button-tokens"
      order: 1
    - task_id: "refactor-button-component"
      order: 2
      depends_on: "update-button-tokens"

  parallel_safe:
    - task_id: "create-card-component"
      can_run_with: ["update-button-tokens", "refactor-button-component"]
```

---

## Veto Conditions

- [ ] Conflito write-write detectado sem resolução clara
- [ ] Dependência circular detectada
- [ ] Mais de 3 níveis de dependência (complexidade alta)

---

## Integration

### Com Task Runner
```javascript
// Antes de executar tasks em paralelo
const analysis = await runParallelizationGate(tasks);

if (!analysis.can_parallelize) {
  console.log('Conflicts detected:', analysis.conflicts);
  console.log('Running sequentially:', analysis.execution_plan.sequence);
  await runSequential(analysis.execution_plan.sequence);
} else {
  await runParallel(analysis.execution_plan.parallel_groups);
}
```

---

## Quality Gates

- [ ] Análise executada antes de qualquer paralelização
- [ ] Conflitos documentados com razão clara
- [ ] Plano de execução gerado automaticamente
- [ ] Zero merge conflicts após execução

---

*Task criada: 2026-02-16*
*Squad: Design*


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
