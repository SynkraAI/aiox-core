# Sync Registry After Component Changes

> Task ID: ds-sync-registry
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0
> Source: Meeting Insights 2026-02-16 (#7)

## Description

Task obrigatória após qualquer mudança em componentes do design system.
Garante que todos os artefatos dependentes permanecem sincronizados.

**Princípio:** "Qualquer mudança estrutural requer sync de tudo que ficou ligado."

---

## AI-First Governance Gate (Obrigatório)

Antes de finalizar, executar protocolo:
- `squads/design/protocols/ai-first-governance.md`

Checklist mínimo:
- [ ] Validou fontes canônicas (`workspace/system/*`, `workspace/ui/registry.json`, `workspace/domains/design-system/*`)
- [ ] Classificou cada claim como `Implemented`, `Partially implemented` ou `Concept only`
- [ ] Não há contradição entre relatório e artefatos reais
- [ ] Itens não resolvidos foram explicitados

---

## Trigger Conditions

Execute esta task quando:

- [ ] Componente novo criado
- [ ] Componente existente modificado (props, variants, styles)
- [ ] Token alterado em `design-tokens-spec.yaml`
- [ ] Theme modificado
- [ ] Dependência de componente alterada

---

## Artefatos para Sincronizar

### 1. Registry (Obrigatório)

**Arquivo:** `workspace/ui/registry.json`

```json
{
  "name": "[component-name]",
  "type": "registry:ui",
  "files": ["path/to/component.tsx"],
  "dependencies": ["@radix-ui/...", "class-variance-authority"],
  "registryDependencies": ["button", "..."]
}
```

**Ações:**
- [ ] Adicionar entrada se componente novo
- [ ] Atualizar `files` se path mudou
- [ ] Atualizar `dependencies` se imports mudaram
- [ ] Atualizar `registryDependencies` se composição mudou

### 2. AI Metadata (Obrigatório)

**Arquivo:** `workspace/domains/design-system/metadata/components/[name].json`

```json
{
  "name": "Button",
  "description": "Interactive button component",
  "props": [...],
  "variants": [...],
  "accessibility": {...},
  "examples": [...]
}
```

**Ações:**
- [ ] Criar metadata se componente novo
- [ ] Atualizar props se interface mudou
- [ ] Atualizar variants se adicionou/removeu
- [ ] Atualizar examples se comportamento mudou

### 3. Storybook (Se existir)

**Arquivo:** `[component].stories.tsx`

**Ações:**
- [ ] Adicionar story se componente novo
- [ ] Atualizar stories se props mudaram
- [ ] Adicionar stories para novas variants

### 4. Documentação (Obrigatório)

**Ações:**
- [ ] Atualizar CHANGELOG.md com mudança
- [ ] Atualizar docs se API mudou
- [ ] Atualizar migration guide se breaking change

### 5. Type Exports (Se TypeScript)

**Arquivo:** `index.ts` do módulo

**Ações:**
- [ ] Adicionar export se componente novo
- [ ] Verificar que types são exportados

---

## Workflow

```
1. IDENTIFICAR MUDANÇA
   └── Qual componente? Qual tipo de mudança?

2. LISTAR DEPENDENTES
   └── Quem usa este componente?
   └── Quais artefatos referenciam?

3. ATUALIZAR ARTEFATOS
   └── registry.json
   └── metadata/components/*.json
   └── *.stories.tsx (se existir)
   └── CHANGELOG.md
   └── index.ts exports

4. VALIDAR SYNC
   └── TypeScript compila?
   └── Imports resolvem?
   └── Registry schema válido?

5. DOCUMENTAR
   └── O que mudou?
   └── Breaking changes?
   └── Migration necessária?
```

---

## Checklist de Validação

### Pre-Sync
- [ ] Mudança está completa (não parcial)
- [ ] Testes passam localmente
- [ ] Sem erros de TypeScript

### Post-Sync
- [ ] `registry.json` válido (JSON parse OK)
- [ ] Metadata tem todos campos obrigatórios
- [ ] Imports funcionam de todos entry points
- [ ] Changelog atualizado com data e descrição

### Quality Gate
- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] Nenhum `// @ts-ignore` adicionado
- [ ] Nenhum hardcoded value (cores, spacing)

---

## Exemplo de Execução

### Cenário: Adicionou variant "loading" ao Button

```markdown
## Mudança
- Componente: Button
- Tipo: Nova variant
- Arquivos alterados: button.tsx, button.variants.ts

## Sync Executado

### 1. registry.json
Sem mudança (mesmos files e deps)

### 2. metadata/components/button.json
```json
{
  "variants": [
    ...existing,
    {
      "name": "loading",
      "description": "Shows spinner, disables interaction",
      "props": { "isLoading": true }
    }
  ]
}
```

### 3. button.stories.tsx
Adicionada story "Loading State"

### 4. CHANGELOG.md
```
## [Unreleased]
### Added
- Button: variant `loading` com spinner integrado
```

### 5. Validação
- [x] typecheck passa
- [x] lint passa
- [x] registry válido
```

---

## Automação Futura

### CI/CD Integration

```yaml
# .github/workflows/design-system-sync.yml
on:
  push:
    paths:
      - 'workspace/ui/components/**'
      - 'workspace/system/**'

jobs:
  validate-sync:
    steps:
      - name: Validate registry.json
        run: npm run validate:registry

      - name: Validate metadata
        run: npm run validate:metadata

      - name: Check changelog updated
        run: |
          if ! git diff --name-only | grep -q "CHANGELOG.md"; then
            echo "CHANGELOG.md not updated!"
            exit 1
          fi
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run validate:registry
npm run validate:metadata
```

---

## Deliverables

- [ ] Todos artefatos sincronizados
- [ ] Changelog atualizado
- [ ] Validação passou
- [ ] Commit inclui todos arquivos alterados

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`
- `squads/design/checklists/ds-migration-readiness-checklist.md`

## Success Criteria

- [ ] Zero drift entre código e registry
- [ ] Zero drift entre código e metadata
- [ ] Changelog reflete todas mudanças
- [ ] CI/CD passa (quando implementado)

---

## Referências

- Meeting Insights: `docs/research/2026-02-16-ux-writing-governance-ds-ai/meeting-insights-2026-02-16.md`
- Registry Schema: Shadcn UI registry format
- Metadata Schema: `squads/design/templates/ds-ai-component-metadata-schema-tmpl.json`

---

*Task criada: 2026-02-16*
*Squad: Design*
*Insight Source: #7 Sync Obrigatório Após Mudanças Estruturais*


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
