---
task: suggestTools()
responsavel: "ToolSmith"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: agent_id_or_spec
    tipo: string
    obrigatorio: true
  - nome: tool_type
    tipo: string
    obrigatorio: false
Saida:
  - nome: tool_spec_or_implementation
    tipo: markdown
    obrigatorio: true
Checklist:
  - Necessidade da tool identificada
  - ACI checklist 6/6
  - Security check lethal trifecta < 3
  - Output testavel
  - Docs incluidos
---

# Task: Suggest Tools

## Metadata

- **id**: AA-T005
- **name**: suggest-tools
- **primary_agent**: tool-smith
- **secondary**: ecosystem-scout
- **trigger**: `*build-tool <spec>` ou `*suggest-tools <agent-id>`
- **inputs**: agent-id ou especificação de necessidade
- **outputs**: tool spec ou tool implementada

## Description

Sugerir e/ou construir tools que habilitam autonomia para um agente. Segue o princípio "encontrar antes de construir" — primeiro pesquisa soluções existentes, depois constrói se necessário.

## Pre-conditions

- [ ] Necessidade de tool identificada (via audit ou request direto)
- [ ] Agente alvo identificado (quem vai usar a tool)

## Steps

### Step 1: Understand the Need

Classificar a necessidade:

| Tipo | Descrição | Output |
|------|-----------|--------|
| Ação externa | API, DB, filesystem | MCP server ou function |
| Processo repetível | Multi-step automatizável | Script bash/Python |
| Contexto persistente | Conhecimento de domínio | Documento .md |
| Output consistente | Formato padronizado | Template |
| Auto-validação | Agente valida próprio output | Checklist + validator |

### Step 2: Search Existing Solutions

**Primeiro, SEMPRE pesquisar** — delegar ao ecosystem-scout:

1. Buscar lib/repo existente que resolve
2. Buscar MCP server existente
3. Buscar pattern/template reutilizável

Se encontrado: avaliar com rubric (5 dimensões) e recomendar.

### Step 3: Build (se necessário)

Se nada encontrado ou inadequado, construir seguindo ACI:

**ACI Checklist obrigatória:**

- [ ] **ACI-1 — Single Responsibility**: faz exatamente 1 coisa?
- [ ] **ACI-2 — Descriptive Parameters**: parâmetros auto-evidentes?
- [ ] **ACI-3 — Token-Efficient Returns**: retorno < 500 tokens?
- [ ] **ACI-4 — Idempotency**: safe to call twice?
- [ ] **ACI-5 — Comprehensive Docs**: docs com o quê, quando, exemplos, edge cases?
- [ ] **ACI-6 — Anti-Hardcode (Dynamic-First)**: sem paths/IDs/limites hardcoded? Config via env vars/tokens/referências?

**Poka-yoke obrigatório:**

- [ ] Aceita paths absolutos E relativos
- [ ] Normaliza inputs (trim, lowercase)
- [ ] Retorna sugestões em erros
- [ ] Defaults sensatos

### Step 4: Security Check

Verificar Lethal Trifecta:

- [ ] Acessa dados privados? (S/N)
- [ ] Processa input não-confiável? (S/N)
- [ ] Comunica externamente? (S/N)

| Score | Ação |
|-------|------|
| 3/3 | BLOCK — redesenhar para remover 1 condição |
| 2/3 | WARN — adicionar guardrails |
| 0-1/3 | OK |

### Step 5: Deliver

Entregar um dos seguintes conforme o tipo:

- **Tool (MCP/function)**: código + schema + docs + testes
- **Script**: arquivo executável + docs de uso
- **Documento .md**: estruturado conforme tipo (KB, checklist, rubric, template)
- **Template**: com placeholders documentados + exemplo preenchido

## Post-conditions

- [ ] ACI checklist: 6/6
- [ ] Security check: lethal trifecta < 3
- [ ] Output testável/usável
- [ ] Docs incluídos

## Quality Gate

- **QG-005**: Tool Quality
