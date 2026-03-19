# Context Contract for Design Tasks

> Task ID: ds-context-contract
> Agent: Design Chief
> Version: 1.0.0
> Heuristic: #10 - IA nasce do zero a cada janela

## Description

Definir contrato de contexto mínimo que toda task de design deve receber para executar sem ambiguidade.

**Princípio:** IA não tem memória entre sessões. Contexto explícito > implícito.

---

## Context Contract Schema

Toda task de design DEVE receber:

```yaml
# Obrigatório
context:
  project:
    name: string              # Nome do projeto
    type: enum                # "greenfield" | "brownfield" | "migration"
    stack: array              # ["react", "tailwind", "shadcn"]

  design_system:
    business_slug: string     # BU dona do DS
    status: enum              # "configured" | "not_configured" | "not_applicable"
    config_path: string       # Path para workspace/businesses/{bu}/design-system/config.yaml
    loader_path: string       # Path para squads/design/scripts/load-context.cjs

  scope:
    components: array         # Componentes envolvidos
    tokens: array             # Tokens envolvidos
    surfaces: array           # S1, S2, S3

# Opcional
  constraints:
    wcag_level: enum          # "A" | "AA" | "AAA"
    browser_support: array    # ["chrome", "firefox", "safari"]
    breakpoints: array        # ["mobile", "tablet", "desktop"]

  references:
    figma_url: string
    storybook_url: string
    production_url: string
```

---

## Implementation

## Execution Steps

1. Definir contrato de campos obrigatórios/opcionais para a task alvo.
2. Injetar seção `Context Requirements` no header da task.
3. Carregar defaults do contexto via loader padrão.
4. Validar pré-condições de contexto antes da execução da task.
5. Registrar gaps e bloquear execução quando campo obrigatório estiver ausente.

### 1. Task Header Template

Todas as tasks em `squads/design/tasks/` devem incluir:

```markdown
## Context Requirements

Este task requer o seguinte contexto:

| Campo | Obrigatório | Default |
|-------|-------------|---------|
| project.name | ✅ | — |
| project.type | ✅ | — |
| design_system.tokens_path | ✅ | `squads/design/data/design-tokens-spec.yaml` |
| design_system.registry_path | ✅ | `workspace/ui/registry.json` |
| scope.components | ✅ | — |
| constraints.wcag_level | ❌ | "AA" |
```

### 2. Context Loader Script

```javascript
// squads/design/scripts/load-context.cjs
module.exports = {
  loadContext(taskId) {
    return {
      design_system: {
        loader_path: 'squads/design/scripts/load-context.cjs',
        resolver_path: 'squads/design/scripts/design-system/resolve_business_design_system.cjs',
        workspace_config_path: 'workspace/workspace.yaml'
      },
      defaults: {
        wcag_level: 'AA',
        surfaces: ['S1', 'S2']
      }
    };
  }
};
```

### 3. Validation

Antes de executar qualquer task:

```yaml
validation:
  - check: context.project.name exists
    error: "Project name is required"
  - check: context.scope.components is not empty
    error: "At least one component must be in scope"
  - check: context.design_system.loader_path is readable
    error: "Design context loader not found"
```

---

## Usage Example

```markdown
## Invocação com Contexto

@brad-frost Execute ds-build-component

**Context:**
- project.name: "Lendário App"
- project.type: "brownfield"
- scope.components: ["Button", "Input"]
- scope.surfaces: ["S1"]
- constraints.wcag_level: "AA"
```

---

## Default Context File

Criar arquivo de contexto padrão por projeto:

```yaml
# workspace/workspace.yaml + workspace/businesses/{bu}/design-system/config.yaml
businesses:
  aiox:
    capabilities:
      design_system:
        status: configured
```

---

## Quality Gates

- [ ] Toda task tem seção "Context Requirements"
- [ ] Context loader script existe e funciona
- [ ] Default context file existe
- [ ] Validation falha graciosamente com mensagens claras

## Output

- `workspace/workspace.yaml` + `workspace/businesses/{bu}/design-system/config.yaml` validados contra o contrato
- Matriz de campos obrigatórios/opcionais por task (`Context Requirements`) atualizada
- Relatório de conformidade de contexto por task (pass/fail + gaps)

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-migration-readiness-checklist.md`

---

*Task criada: 2026-02-16*
*Squad: Design*


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
