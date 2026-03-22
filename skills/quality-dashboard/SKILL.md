---
name: quality-dashboard
description: Unified quality dashboard for the AIOS ecosystem
version: 1.0.0
risk_level: low
trigger: /quality-dashboard
---

# Quality Dashboard Skill

Executa o quality dashboard que escaneia todo o ecossistema AIOS (squads, tools, skills, minds) e gera um relatório de qualidade com scores de 0 a 10.

## Workflow

1. Executar: `node tools/quality-dashboard/cli.js`
2. Para filtrar por categoria: `node tools/quality-dashboard/cli.js --category <squads|tools|skills|minds>`
3. Para detalhe de um squad: `node tools/quality-dashboard/cli.js --squad <nome>`
4. Para salvar relatório: `node tools/quality-dashboard/cli.js --format markdown --output docs/quality-report.md`

## Veto Conditions

- NEVER modify squad/tool/skill files based on dashboard results without explicit user approval
- NEVER delete or remove components flagged as low-score
- NEVER auto-fix scores by creating empty placeholder files

## Completion Criteria

- Dashboard executa sem erros
- Todas as 4 categorias aparecem com contagem e score
- Output formatado corretamente no formato solicitado (cli/markdown/json)

## Parameters

| Parameter | Flag | Values | Default |
|-----------|------|--------|---------|
| Category | `--category` | squads, tools, skills, minds | all |
| Squad detail | `--squad` | squad name | none |
| Format | `--format` | cli, markdown, json | cli |
| Output file | `--output` | file path | stdout |
