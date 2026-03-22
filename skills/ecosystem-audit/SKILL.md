# Ecosystem Audit Skill

Auditoria completa do ecossistema AIOS: projetos, squads, agents, stories, minds e tools.

## Uso

```bash
/ecosystem-audit
```

ou com escopo específico:

```bash
/ecosystem-audit --scope=projects
/ecosystem-audit --scope=squads
/ecosystem-audit --scope=all
```

---

## O Que Faz

Auditoria em **6 dimensões**:

1. **Projects** — Configurações `.claude/` + INDEX.md + stories
2. **Squads** — README, agents, tasks, workflows
3. **Agents** — Definições em `.aios-core/development/agents/`
4. **Skills** — Estrutura em `skills/`
5. **Minds** — Clones em `squads/mind-cloning/minds/`
6. **Tools** — Scripts em `tools/`

Cada dimensão recebe um **score de qualidade (0-10)** baseado em critérios específicos.

---

## Output

Gera relatório completo em `docs/reports/ecosystem-audit-YYYY-MM-DD.md`:

```markdown
# Ecosystem Audit Report

**Data:** 2026-03-18
**Score Global:** 8.5/10

## 📊 Resumo por Dimensão

| Dimensão | Score | Status | Issues |
|----------|-------|--------|--------|
| Projects | 10.0/10 | ✅ EXCELLENT | 0 |
| Squads | 8.2/10 | ⚠️ NEEDS_WORK | 5 |
| Agents | 9.5/10 | ✅ APPROVED | 1 |
| Skills | 7.8/10 | ⚠️ NEEDS_WORK | 8 |
| Minds | 9.0/10 | ✅ APPROVED | 2 |
| Tools | 8.5/10 | ✅ APPROVED | 3 |

## 🚨 Action Items (19 total)

### P0 (CRÍTICO) — 3 items
1. Squad negotiation: 10 arquivos phantom (README referencia, não existe)
2. Squad relationship-therapy: Zero safety guards (harm risk)
3. Skill deep-research: Broken imports

### P1 (ALTO) — 5 items
...

### P2 (MÉDIO) — 11 items
...
```

---

## Implementação

### 1. Projects Audit

Reutiliza `tools/audit-project-configs.js`:
- Valida `.claude/` de todos os projetos
- Verifica INDEX.md presente
- Valida stories ativas (sem broken links)

Score = (projetos OK / total) × 10

### 2. Squads Audit

Para cada squad em `squads/`:
- README.md existe e completo (> 500 chars)
- Agents definidos (`agents/*.md` ou referenciados)
- Tasks organizadas (`tasks/*.md`)
- Workflows YAML (se aplicável)

Score = média ponderada:
- README: 30%
- Agents: 30%
- Tasks: 25%
- Workflows: 15%

### 3. Agents Audit

Para cada agent em `.aios-core/development/agents/`:
- Arquivo `.md` presente
- Seções obrigatórias: Role, Capabilities, Commands
- Integração com squads (bidirectional link)

Score = (agents válidos / total) × 10

### 4. Skills Audit

Para cada skill em `skills/`:
- `SKILL.md` presente
- Seções obrigatórias: Usage, Implementation
- Slash command correspondente em `.claude/commands/`

Score = (skills válidos / total) × 10

### 5. Minds Audit

Para cada mind em `squads/mind-cloning/minds/`:
- `sources/` directory presente
- `outputs/` directory presente
- `README.md` com status

Score baseado em status:
- `complete`: 10
- `partial`: 5
- `sources-only`: 2

### 6. Tools Audit

Para cada script em `tools/`:
- Executável (`chmod +x`)
- Comentário header com usage
- Testável (smoke test passa)

Score = (tools válidos / total) × 10

---

## Action Items Generation

Para cada issue encontrado, gerar action item com:
- **Prioridade:** P0 (CRÍTICO), P1 (ALTO), P2 (MÉDIO)
- **Dimensão:** Projects/Squads/Agents/Skills/Minds/Tools
- **Descrição:** O que está errado
- **Fix:** Como corrigir
- **Esforço:** Horas estimadas
- **Blocker:** Se bloqueia produção

Priorização automática:
- **P0:** Zero safety, broken imports, missing critical files
- **P1:** Incomplete docs, broken links, missing tests
- **P2:** Style issues, optimization opportunities

---

## Exemplo de Uso

```
User: /ecosystem-audit

Claude:
🔍 Auditando ecossistema AIOS...

[1/6] Projects... ✅ 17/17 (10.0/10)
[2/6] Squads... ⚠️ 25/30 (8.2/10)
[3/6] Agents... ✅ 10/10 (9.5/10)
[4/6] Skills... ⚠️ 35/45 (7.8/10)
[5/6] Minds... ✅ 22/25 (9.0/10)
[6/6] Tools... ✅ 8/10 (8.5/10)

📊 Score Global: 8.5/10

🚨 19 action items identificados:
   3 P0 (CRÍTICO)
   5 P1 (ALTO)
   11 P2 (MÉDIO)

🔗 Relatório completo: docs/reports/ecosystem-audit-2026-03-18.md

💡 Próximo passo:
   1. Review P0 items (crítico!)
   2. Criar stories para cada P0/P1
   3. Re-audit após correções
```

---

## Flags Opcionais

| Flag | Efeito |
|------|--------|
| `--scope=projects` | Audita apenas projetos |
| `--scope=squads` | Audita apenas squads |
| `--scope=all` | Audita todas as 6 dimensões (default) |
| `--fix` | Oferece auto-fix para issues simples |
| `--create-stories` | Cria stories automaticamente para P0/P1 |

---

## Auto-Fix Capabilities

Issues que podem ser corrigidos automaticamente:

- **Projects:** Criar `.claude/` faltante
- **Squads:** Gerar README template
- **Skills:** Criar slash command em `.claude/commands/`
- **Tools:** Adicionar `chmod +x`

Issues que precisam de intervenção manual:

- **Agents:** Definir capabilities específicas
- **Minds:** Completar sources
- **Squads:** Implementar workflows complexos

---

## Integração com Epic Audit

Este skill é a versão automatizada do **Squad Audit Epic (2026-03-12)**.

Diferenças:
- Epic: Manual, 10 squads, 40 análises, 7 stories criadas
- Skill: Automático, 30 squads, 6 dimensões, action items gerados

---

## Scripts Utilizados

| Script | Função |
|--------|--------|
| `tools/audit-project-configs.js` | Audita projetos |
| `tools/audit-squads.js` | Audita squads (CRIAR) |
| `tools/audit-agents.js` | Audita agents (CRIAR) |
| `tools/audit-skills.js` | Audita skills (CRIAR) |
| `tools/audit-minds.js` | Audita minds (CRIAR) |
| `tools/audit-tools.js` | Audita tools (CRIAR) |

---

## Próximos Passos

1. **Implementar scripts faltantes** (audit-squads.js, etc.)
2. **Definir critérios de scoring** para cada dimensão
3. **Testar com 5 squads** para validar lógica
4. **Integrar com CI/CD** (rodar no pre-push)

---

**Criado:** 2026-03-18
**Versão:** 1.0 (parcial — requer scripts adicionais)
**Maintainer:** @devops
