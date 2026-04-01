# Forge — Guia para Criar Novos Workflows

> Leia este arquivo quando quiser adicionar um novo workflow ao Forge.
> Segue o padrão dos workflows existentes e garante integração com Quest.

---

## Visão Geral da Arquitetura

O Forge tem 3 camadas:

```
CAMADA 1: ENTRY (SKILL.md)
  → Intent Classification → detecta MODO → carrega WORKFLOW

CAMADA 2: WORKFLOWS (workflows/*.md)
  → Cada workflow define QUAIS fases rodar, agentes, quality gates

CAMADA 3: ENGINE (compartilhada)
  → runner.md, personality.md, state management, resume, error recovery
```

**Pra adicionar um workflow novo:** 1 arquivo + 2 edições + 1 pack (opcional).

---

## Passo a Passo: Criar Workflow Novo

### 1. Criar o arquivo `workflows/{nome}.md`

Seguir este template:

```markdown
# Workflow: {Nome Human-Readable}

> {Uma frase descrevendo o pipeline}

---

## When to Use

- User runs `/forge {trigger} {input}` or `/forge {trigger} "{description}"`
- Quest delegates a {pack-name} pack mission to Forge
- Scope: {o que esse workflow entrega}

---

## Pipeline

Phase 0 -> Phase 1 -> Phase 2 -> ... -> Phase N
{Nome0}    {Nome1}    {Nome2}           {NomeN}

ALL phases execute for a full run. Individual missions from Quest may
only trigger a subset.

---

## Execution

### Phase 0: Discovery

Read `{FORGE_HOME}/phases/phase-0-discovery.md` with {NOME} adjustments:
- {Pergunta específica 1}
- {Pergunta específica 2}
- Ecosystem scan: {o que verificar}
- CHECKPOINT: {o que confirmar com o usuário}

### Phase 1: {Nome da Fase}

**Agents:** {lista de agentes}

{Passos numerados com o que cada agente faz}

**Output:** {o que essa fase produz}

**Quality gate:** {critério de aprovação}

### Phase N: {Última Fase}

Read `{FORGE_HOME}/phases/phase-5-deploy.md` (se aplicável):
- CHECKPOINT: confirm push
- **@devops** — Deploy + PR
- **@qa** — Validação final

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0     | (Forge core)  | —          |
| 1     | @{agent}      | @{agent}   |
| ...   | ...           | ...        |

---

## Progress Display

  ✅ {Fase0}  ->  🔄 {Fase1}  ->  ○ {Fase2}  ->  ...

---

## Quest Integration

When invoked by Quest (via forge-bridge), Forge receives the specific
mission context.

| Quest World | Forge Phase | Notes |
|---|---|---|
| W0: {Nome} | Phase 0 | {nota} |
| W1: {Nome} | Phase 1 | {nota} |
| ... | ... | ... |

---

## Error Recovery

Inherits from `{FORGE_HOME}/runner.md` Section 4, with additions:

{Erros específicos do domínio e como tratar}
```

### 2. Editar `SKILL.md` — Intent Classification (§2)

Adicionar 1 linha na tabela de comandos:

```
/forge {trigger} {input}             -> {MODO_NOME} ({descrição curta})
```

Adicionar 1 linha na Detection Rules table:

```
| **{MODO_NOME}** | Prefix `{trigger}`, or words like "{palavra1}", "{palavra2}" | `{FORGE_HOME}/workflows/{nome}.md` ({fases resumidas}) |
```

### 3. Editar `SKILL.md` — Selective Reading Rule (§9)

Adicionar 1 linha na tabela de leitura seletiva:

```
| `{FORGE_HOME}/workflows/{nome}.md` | Mode = {MODO_NOME} |
```

### 4. (Opcional) Criar Pack no Quest

Se quiser gamificar esse workflow, criar `skills/quest/packs/{nome}.yaml` com:

```yaml
pack:
  id: {nome}
  forge_workflow: "{nome}"   # ← OBRIGATÓRIO: aponta pro workflow do Forge
  version: "1.0.0"
  name: "{Nome Human-Readable}"
  # ... levels, phases, items, achievements
```

**Regra:** O campo `forge_workflow` DEVE existir e DEVE apontar para um arquivo
existente em `skills/forge/workflows/{valor}.md`.

### 5. Rodar validação

```bash
node skills/forge/scripts/validate-forge-quest-sync.cjs
```

Esse script verifica que Forge e Quest estão consistentes (ver detalhes abaixo).

---

## Checklist de Novo Workflow

- [ ] `workflows/{nome}.md` criado seguindo o template
- [ ] Cada fase tem: agentes, outputs, quality gates
- [ ] Phase 0 (Discovery) tem perguntas específicas do domínio
- [ ] Agent Mapping table completa
- [ ] Quest Integration table (se tem pack)
- [ ] Error Recovery com cenários específicos do domínio
- [ ] `SKILL.md` § Intent Classification atualizado (comando + triggers)
- [ ] `SKILL.md` § Selective Reading Rule atualizado
- [ ] Pack YAML criado (se gamificado) com `forge_workflow` correto
- [ ] `validate-forge-quest-sync.cjs` passa sem erros

---

## O que é Herdado Automaticamente

Não precisa reimplementar:

| Componente | Fonte | Já funciona |
|---|---|---|
| State machine (INIT→PHASE→COMPLETE) | `runner.md` | ✅ |
| Visual/personality/banners | `personality.md` | ✅ |
| State persistence (.aios/forge-runs/) | `runner.md` §4 | ✅ |
| Resume de runs interrompidos | `SKILL.md` §3 | ✅ |
| Error recovery (retry, escalate) | `runner.md` §4 | ✅ |
| Ecosystem scan | `ecosystem-scanner.md` | ✅ |
| Memory protocol | `runner.md` (lê project-context.md) | ✅ |
| Deploy genérico | `phases/phase-5-deploy.md` | ✅ |

---

## Referência: Workflows Existentes

| Workflow | Arquivo | Modo | Fases |
|---|---|---|---|
| Full App | `full-app.md` | FULL_APP | Discovery→Spec→Stories→Build→Integration→Deploy |
| Single Feature | `single-feature.md` | SINGLE_FEATURE | Discovery→Build→Deploy |
| Bug Fix | `bug-fix.md` | BUG_FIX | Discovery→Build(light)→Deploy |
| Brownfield | `brownfield.md` | BROWNFIELD | Scan→Diagnose→Plan |
| Design System | `design-system.md` | DESIGN_SYSTEM | Discovery→Extract→Tokens→Components→Pages→Deploy |
| Squad Upgrade | `squad-upgrade.md` | SQUAD_UPGRADE | Diagnose→DNA→Quality→Workflows→Validate |

---

## Regras de Ouro

1. **1 workflow = 1 arquivo** — toda lógica específica do domínio vive dentro do workflow
2. **Não duplique engine** — use runner.md, personality.md, phase-0, phase-5. Não reimplemente
3. **Forge é executor, Quest é gamificador** — o workflow nunca menciona XP, achievements, levels
4. **Cada fase tem quality gate** — sem gate, a fase não está completa
5. **Agent mapping é obrigatório** — o usuário nunca precisa saber qual agente chamar
6. **forge_workflow no pack** — se tem pack no Quest, DEVE ter forge_workflow apontando pro workflow
