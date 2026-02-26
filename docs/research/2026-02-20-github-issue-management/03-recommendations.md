# Recommendations for aios-core

## Context

O repositorio aios-core tem atualmente 27 issues abertos, todos com label `needs-triage`, sem templates estruturados, sem automacao de triage, e sem estrategia de labeling definida.

---

## Recommended Implementation Plan

### Phase 1: Foundation (Labels + Templates)

#### 1.1 Label Taxonomy

Criar taxonomia completa com prefixos:

```
type: bug          (#d73a4a, vermelho)
type: feature      (#a2eeef, azul claro)
type: enhancement  (#a2eeef, azul claro)
type: docs         (#0075ca, azul)
type: test         (#ededed, cinza)
type: chore        (#ededed, cinza)

priority: P1       (#b60205, vermelho escuro)
priority: P2       (#d93f0b, laranja)
priority: P3       (#fbca04, amarelo)
priority: P4       (#0e8a16, verde)

status: needs-triage    (#ededed, cinza)
status: needs-info      (#d876e3, roxo)
status: confirmed       (#0e8a16, verde)
status: in-progress     (#1d76db, azul)
status: stale           (#ffffff, branco)

area: core              (#006b75, teal)
area: installer         (#006b75, teal)
area: synapse           (#006b75, teal)
area: cli               (#006b75, teal)
area: pro               (#006b75, teal)
area: docs              (#006b75, teal)
area: health-check      (#006b75, teal)
area: devops            (#006b75, teal)

community: good first issue  (#7057ff, roxo)
community: help wanted       (#008672, verde escuro)

governance                   (#006b75, teal)
duplicate                    (#cfd3d7, cinza)
wontfix                      (#ffffff, branco)
```

#### 1.2 Issue Forms

Criar 4 templates em `.github/ISSUE_TEMPLATE/`:

1. `1-bug-report.yml` — Bug report com steps to reproduce, versao, error output
2. `2-feature-request.yml` — Feature request com problem statement, proposed solution, package scope
3. `3-test-coverage.yml` — Test coverage PR (para issues de teste recorrentes)
4. `config.yml` — Impedir issues sem template, link para Discussions

#### 1.3 CODEOWNERS

```
# .github/CODEOWNERS
*                        @oalanicolas
/.aios-core/core/        @oalanicolas
/packages/               @oalanicolas
/docs/                   @oalanicolas
/.github/                @oalanicolas
```

### Phase 2: Automation (GitHub Actions)

#### 2.1 Auto-Label on Issue Open

```yaml
# .github/workflows/issue-labeler.yml
name: Issue Labeler
on:
  issues:
    types: [opened, edited]
```

Usar `github/issue-labeler@v3.4` com regex matching.

#### 2.2 Stale Issue Management

```yaml
# .github/workflows/stale.yml
name: Manage Stale Issues
on:
  schedule:
    - cron: '30 1 * * *'
```

Usar `actions/stale@v10` com 30 dias stale, 7 dias close, exempt P1/P2.

#### 2.3 Welcome First-Time Contributors

Workflow que posta mensagem de boas-vindas no primeiro issue/PR de novos contribuidores.

### Phase 3: Triage Process

#### 3.1 Script de Triage Batch

Script Node.js para @devops executar triage em batch:
- Lista issues `needs-triage`
- Apresenta cada issue para classificacao
- Aplica labels via GitHub API
- Gera relatorio de triage

#### 3.2 Task de Triage para @devops

Nova task `.aios-core/development/tasks/github-issue-triage.md` com:
- Checklist de triage por issue
- Criterios de classificacao
- Workflow de resposta

#### 3.3 Checklist de Triage

Nova checklist `.aios-core/development/checklists/issue-triage-checklist.md`

---

## Mapping to Existing Tasks

| Existing Task | Relationship |
|--------------|-------------|
| `github-devops-repository-cleanup.md` | Complementar — cleanup inclui issues stale |
| `github-devops-github-pr-automation.md` | Paralelo — PR automation + Issue automation |
| `github-devops-pre-push-quality-gate.md` | Independente |
| `setup-github.md` | Extend — adicionar issue templates ao setup |

---

## Priority Order

1. **Label taxonomy** — fundacao para tudo mais
2. **Issue forms** — melhora qualidade de input imediatamente
3. **Stale management** — resolve backlog automaticamente
4. **Auto-labeler** — reduz trabalho manual de triage
5. **Triage task/script** — formaliza processo para @devops
6. **Welcome bot** — nice-to-have para contributor experience

---

## Next Steps

- `@pm` deve priorizar esta story no roadmap
- `@devops` deve implementar Labels + Templates + Actions
- `@dev` pode implementar script de triage batch
- Considerar epic dedicado se escopo crescer
