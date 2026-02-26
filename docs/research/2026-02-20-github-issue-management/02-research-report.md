# GitHub Issue Management — Research Report

## 1. Issue Templates & Forms (Structured Input)

### Key Findings

GitHub Issue Forms substituem templates `.md` com formularios YAML estruturados em `.github/ISSUE_TEMPLATE/`:

- **5 tipos de elementos:** `textarea`, `input`, `dropdown`, `checkboxes`, `markdown` (display-only)
- **Keys obrigatorias:** `name`, `description`, `body` (array de fields)
- **Automacao integrada:** `labels`, `assignees`, `projects`, `title` no top-level do YAML
- **Validacao:** `required: true` funciona APENAS em repos publicos
- **Ordenacao:** prefixo numerico nos nomes: `1-bug.yml`, `2-feature-request.yml`
- **config.yml:** controla o template chooser, pode impedir issues sem template

### Exemplo: Bug Report Form

```yaml
name: Bug Report
description: File a bug report
title: "[Bug]: "
labels: ["bug", "needs-triage"]
assignees:
  - octocat
body:
  - type: markdown
    attributes:
      value: "Thanks for taking the time!"
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      placeholder: Describe the issue
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      value: |
        1.
        2.
        3.
    validations:
      required: true
  - type: dropdown
    id: version
    attributes:
      label: Version
      options:
        - "4.2.13 (Latest)"
        - "4.2.12"
        - "4.1.x"
      default: 0
    validations:
      required: true
  - type: textarea
    attributes:
      label: Error Output
      render: bash
  - type: checkboxes
    id: agreements
    attributes:
      label: Acknowledgments
      options:
        - label: "I searched for existing issues"
          required: true
```

---

## 2. Labeling Strategy (Taxonomy)

### Key Findings

Projetos maduros usam **taxonomia com prefixos** para labels:

| Categoria | Prefixo | Cor | Exemplos |
|-----------|---------|-----|----------|
| Type | `type:` | Verde claro (#90EE90) | `type: bug`, `type: feature`, `type: docs` |
| Priority | `priority:` | Vermelho-amarelo gradient | `priority: P1` (critical) a `priority: P4` (low) |
| Status | `status:` | Cinza (#D3D3D3) | `status: needs-triage`, `status: needs-info`, `status: stale` |
| Area | `area:` | Azul claro (#ADD8E6) | `area: installer`, `area: core`, `area: synapse` |
| Community | (sem prefixo) | Roxo | `good first issue`, `help wanted` |

### Regras

- **Uma label por categoria** por issue (1 type, 1 priority, 1 status)
- **Default labels do GitHub** como base: bug, enhancement, documentation, question
- `good first issue` e `help wanted` populam paginas de contribuicao automaticamente
- freeCodeCamp e Kubernetes citados como implementacoes de referencia

### Priority Scale (P1-P4)

| Level | Descricao | SLA Target |
|-------|-----------|------------|
| P1 | Critical — bloqueia usuarios | 24h response |
| P2 | High — afeta maioria | 3 dias |
| P3 | Medium — afeta parte dos usuarios | 1 semana |
| P4 | Low — edge cases | Backlog |

---

## 3. Triage Automation

### Key Findings

Tres abordagens complementares:

#### A) GitHub Agentic Workflows (2026 — Novo)
- AI agents analisam issues sem labels, pesquisam contexto no codebase, aplicam labels e postam comentarios
- Configuracao via YAML frontmatter com permissions grants e output constraints
- Requer `lockdown: false` para repos publicos
- Reducao de 60-70% em triage manual reportada

```yaml
---
timeout-minutes: 5
on:
  issue:
    types: [opened, reopened]
permissions:
  issues: read
tools:
  github:
    toolsets: [issues, labels]
safe-outputs:
  add-labels:
    allowed: [bug, feature, enhancement, documentation,
              question, help-wanted, good-first-issue]
  add-comment: {}
---
```

#### B) github/issue-labeler v3.4 (Regex-based)
- Auto-label baseado em regex matching no body/title do issue
- Suporta versioned regex para evolucao de templates
- Label `broken-template` para issues que nao seguem o template

```yaml
name: Issue Labeler
on:
  issues:
    types: [opened, edited]
permissions:
  issues: write
  contents: read
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: github/issue-labeler@v3.4
        with:
          configuration-path: .github/labeler.yml
          enable-versioned-regex: 1
          repo-token: ${{ github.token }}
```

#### C) Hybrid (Recomendado)
- Issue Labeler para classificacao rapida via regex
- Agentic Workflows para analise semantica profunda
- Human review para decisoes finais

---

## 4. Stale Issue Management

### Key Findings

`actions/stale` v10 e o padrao da industria:

- **Dois estagios:** Stage 1 aplica label "stale" apos N dias; Stage 2 fecha apos M dias adicionais
- **Rate limiting:** `operations-per-run: 30` previne quota exhaustion
- **Exemptions:** por label, milestone, assignee, draft PRs
- **Auto-removal:** label stale removida automaticamente quando ha nova atividade
- **Close reason:** `not_planned` ou `completed`

```yaml
name: Close stale issues and PRs
on:
  schedule:
    - cron: '30 1 * * *'
jobs:
  stale:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
    steps:
      - uses: actions/stale@v10
        with:
          days-before-issue-stale: 30
          days-before-pr-stale: 45
          days-before-issue-close: 7
          days-before-pr-close: -1
          stale-issue-label: 'status: stale'
          stale-issue-message: |
            This issue has been automatically marked as stale due to 30 days of inactivity.
            It will be closed in 7 days if no further activity occurs.
            If this is still relevant, please comment to keep it open.
          exempt-issue-labels: 'priority: P1,priority: P2,status: in-progress'
          remove-stale-when-updated: true
          operations-per-run: 30
          close-issue-reason: 'not_planned'
```

---

## 5. Community & Contributor Experience

### Kubernetes Model (Reference)

| Metric | Threshold | Action |
|--------|-----------|--------|
| No SIG action | 30 days | Follow-up outreach |
| No reporter response | 20 days | Auto-close |
| Stale marker | 90 days | Auto-close via bot |

### Five-Step Triage Process (Kubernetes)

1. **Review** — Processar issues novos
2. **Categorize** — Tipo (support/bug/feature/duplicate)
3. **Prioritize** — Nivel P1-P4
4. **Route** — Atribuir a SIG/team via labels
5. **Follow-up** — Protocolos de acompanhamento

### CODEOWNERS para Routing

```
# Default owners
*       @oalanicolas

# Specific paths
/.aios-core/core/     @oalanicolas
/packages/installer/  @oalanicolas
/docs/                @oalanicolas
/.github/             @oalanicolas

# Patterns
*.test.js             @oalanicolas
```

### Tooling

- **CODEOWNERS:** Routing de PRs automatico, requer write access
- **GitHub Projects:** Kanban boards para tracking por area/sprint
- **Triage Party (Kubernetes):** Queries avancadas (regex, reactions, conversation direction)
- **Weekly triage meetings:** Entrada de baixa barreira para novos contribuidores

---

## 6. Decision Matrix

| Necessidade | Ferramenta | Complexidade | Impacto |
|-------------|-----------|--------------|---------|
| Issues estruturados | Issue Forms YAML | Baixa | Alto |
| Auto-labeling por conteudo | github/issue-labeler | Baixa | Medio |
| AI triage semantico | Agentic Workflows | Media | Alto |
| Gestao de stale issues | actions/stale | Baixa | Alto |
| Routing por area | CODEOWNERS + labels | Baixa | Medio |
| Welcome first-timers | welcome bot Action | Baixa | Medio |
| Label taxonomy | Prefixed labels setup | Baixa | Alto |

---

## Sources

1. GitHub Docs — Issue Forms Syntax (HIGH)
2. GitHub Docs — Form Schema Syntax (HIGH)
3. GitHub Agentic Workflows — Issue Triage (HIGH)
4. github/issue-labeler v3.4 (HIGH)
5. actions/stale v10 (HIGH)
6. Kubernetes Issue Triage Guidelines (HIGH)
7. GitHub Docs — CODEOWNERS (HIGH)
8. Rewind Blog — Best Practices for GitHub Issues (HIGH)
9. Dave Lunny — Sane GitHub Labels (HIGH)
10. CICube — Automating Stale Issues (HIGH)
