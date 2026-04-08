---
name: quality-dashboard
description: "Dashboard unificado de qualidade que escaneia todo o ecossistema AIOS e gera um relatório com scores. É como um check-up médico do seu repositório — m"
  Dashboard unificado de qualidade para o ecossistema AIOS. Escaneia squads, tools, skills e minds,
  gerando relatório com scores de 0 a 10. Identifica componentes incompletos, duplicados e oportunidades
  de melhoria. Output em CLI, Markdown ou JSON.
version: 1.0.0
risk: safe
source: self
paths:
  - "tools/quality-dashboard/"
lazy_load: true
context_budget: 600

category: general
tags: [SKILL]
---

# Quality Dashboard

Dashboard unificado de qualidade que escaneia todo o ecossistema AIOS e gera um relatório com scores. É como um check-up médico do seu repositório — mede a saúde de cada componente e mostra onde precisa de atenção.

## When to Use This Skill

| Cenário | Exemplo |
|---------|---------|
| Visão geral da saúde do ecossistema | "Como estão os scores de qualidade?" |
| Identificar componentes incompletos | "Quais skills estão sem documentação?" |
| Auditoria antes de release | "Tudo está OK para publicar?" |
| Priorizar melhorias | "O que tem menor score para eu melhorar primeiro?" |
| Relatório de qualidade para documentação | "Gera um relatório em Markdown" |
| Verificar squad específico | "Como está o squad de copywriting?" |

## Do NOT Use This Skill When

| Cenário | Alternativa |
|---------|-------------|
| Quer corrigir os problemas encontrados | Use o agente apropriado (@dev, @sm, etc.) |
| Precisa de análise de código (lint, types) | Use `npm run lint` / `npm run typecheck` |
| Quer métricas de performance/runtime | Use ferramentas de APM |
| Precisa auditar segurança | Use `vulnerability-scanner` |
| Quer ver status de projetos | Consulte `docs/projects/ACTIVE.md` |

## Discovery Questions

<!-- Skill determinística — discovery mínimo -->

1. **Quer ver todas as categorias ou filtrar por uma?** — (squads, tools, skills, minds) *(opcional — default: todas)*
2. **Precisa de detalhe de algum componente específico?** — (ex: `--squad copywriting-squad`) *(opcional)*
3. **Em qual formato quer o output?** — (CLI, Markdown ou JSON) *(opcional — default: CLI)*

## Prerequisites

| Requisito | Como verificar | Notas |
|-----------|----------------|-------|
| Node.js 18+ | `node --version` | Já instalado no ambiente AIOS |
| Ecossistema AIOS | `ls squads/ skills/ tools/` | Dashboard escaneia esses diretórios |

**Zero dependências externas.** O script usa apenas Node.js stdlib.

## Workflow

### Phase 1: Scan

1. Executar o dashboard com os parâmetros desejados
2. O script escaneia automaticamente todos os diretórios do ecossistema

```bash
# Todas as categorias
node tools/quality-dashboard/cli.js

# Filtrar por categoria
node tools/quality-dashboard/cli.js --category skills

# Detalhe de um squad específico
node tools/quality-dashboard/cli.js --squad copywriting-squad
```

**Veto conditions:**
- Diretório raiz não é aios-core → PARAR, executar do diretório correto
- `cli.js` não encontrado → PARAR, verificar se `tools/quality-dashboard/` existe

**Completion criteria:** Dashboard executa sem erros e retorna output.

### Phase 2: Analyze

1. Ler o output do dashboard
2. Identificar componentes com score abaixo de 5 (zona crítica)
3. Identificar padrões: categorias inteiras com scores baixos vs problemas pontuais
4. Verificar se há componentes sem score (não detectados)

**Métricas avaliadas por componente:**

| Dimensão | O que verifica | Peso |
|----------|----------------|------|
| Documentação | README/SKILL.md existe e tem conteúdo | Alto |
| Estrutura | Arquivos esperados estão presentes | Alto |
| Configuração | config.yaml/frontmatter completo | Médio |
| Completude | Seções obrigatórias preenchidas | Médio |
| Consistência | Padrões seguidos (naming, paths) | Baixo |

**Completion criteria:** Análise concluída com achados documentados.

### Phase 3: Report

1. Apresentar resumo ao usuário com formato conciso
2. Destacar top 3 componentes que mais precisam de atenção
3. Se solicitado, salvar relatório em arquivo

```bash
# Salvar como Markdown
node tools/quality-dashboard/cli.js --format markdown --output docs/quality-report.md

# Salvar como JSON (para processamento programático)
node tools/quality-dashboard/cli.js --format json --output docs/quality-report.json
```

**Completion criteria:** Usuário recebeu resumo com achados e próximos passos claros.

## Output Format

### CLI (padrão)

```
╔══════════════════════════════════════╗
║       AIOS Quality Dashboard        ║
╠══════════════════════════════════════╣
║ Category    │ Count │ Avg Score      ║
║─────────────┼───────┼────────────────║
║ Squads      │   12  │  7.2/10       ║
║ Skills      │   34  │  6.8/10       ║
║ Tools       │    8  │  8.1/10       ║
║ Minds       │   15  │  5.4/10       ║
╚══════════════════════════════════════╝
```

### Markdown

```markdown
# AIOS Quality Report — 2026-03-24

## Summary
| Category | Count | Avg Score |
|----------|-------|-----------|
| Squads   | 12    | 7.2/10    |
| Skills   | 34    | 6.8/10    |
| Tools    | 8     | 8.1/10    |
| Minds    | 15    | 5.4/10    |

## Top Issues
1. **mind/alex-hormozi** (3.2) — Missing personality.md
2. **skill/forge** (4.1) — Incomplete phases
3. **squad/etl** (4.5) — No config.yaml

## Recommendations
- ...
```

### JSON

```json
{
  "timestamp": "2026-03-24T12:00:00Z",
  "categories": {
    "squads": { "count": 12, "avg_score": 7.2, "items": [...] },
    "skills": { "count": 34, "avg_score": 6.8, "items": [...] }
  }
}
```

## Parameters

| Parâmetro | Flag | Valores | Default |
|-----------|------|---------|---------|
| Categoria | `--category` | `squads`, `tools`, `skills`, `minds` | Todas |
| Detalhe squad | `--squad` | Nome do squad | Nenhum |
| Formato | `--format` | `cli`, `markdown`, `json` | `cli` |
| Arquivo output | `--output` | Caminho do arquivo | stdout |

## CLI Reference

```bash
# Visão geral completa
node tools/quality-dashboard/cli.js

# Só skills
node tools/quality-dashboard/cli.js --category skills

# Detalhe de um squad
node tools/quality-dashboard/cli.js --squad ai-reels

# Salvar relatório
node tools/quality-dashboard/cli.js --format markdown --output docs/quality-report.md

# Output JSON para processamento
node tools/quality-dashboard/cli.js --format json --output docs/quality.json
```

## Safety / Veto Conditions

- **NUNCA** modificar arquivos de squads/tools/skills baseado nos resultados sem aprovação explícita do usuário
- **NUNCA** deletar ou remover componentes com score baixo
- **NUNCA** auto-corrigir scores criando arquivos placeholder vazios
- **NUNCA** executar o dashboard com flags destrutivas (não existem, mas por segurança)
- O dashboard é **read-only** — apenas lê e reporta, nunca modifica

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| `cli.js` não encontrado | Path errado | Executar de `~/aios-core/` |
| Score 0 em componente válido | Estrutura não reconhecida | Verificar se segue o padrão AIOS |
| Categoria vazia | Diretório sem componentes | Normal — categoria não populada |
| Erro de permissão | Arquivo protegido | Verificar permissões do diretório |
| Output truncado no terminal | Muitos componentes | Usar `--format markdown --output` para arquivo completo |

## Script Location

`tools/quality-dashboard/cli.js`
