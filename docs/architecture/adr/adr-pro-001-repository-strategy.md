# ADR: Repository Strategy - Open Core Architecture

---

**ADR ID:** ADR-PRO-001
**Status:** Accepted
**Created:** 2026-02-05
**Author:** @architect (Aria)
**Story:** PRO-1 Investigation
**Deciders:** @architect (Aria), Stakeholder, @devops (Gage - pending review)

---

## Context

AIOS precisa evoluir de um produto unico open-source para um modelo **Open Core** com:

- **aios-core** (open-source, MIT + Commons Clause) - Framework base, agentes, CLI, squads comunitarios
- **aios-pro** (closed-source, proprietary) - Premium squads, session memory, usage metrics, enterprise integrations

### Problem Statement

O aios-core atualmente e publicado como um unico pacote npm (`aios-core@3.11.3`) que inclui todo o framework. Nao existe infraestrutura para:

- Codigo proprietario separado
- Features condicionais (pro vs core)
- Repositorios com permissoes de acesso diferenciadas
- Publicacao de multiplos pacotes (core + pro)

### Current State

| Aspecto | Estado Atual |
|---------|-------------|
| License | MIT + Commons Clause (venda ja restrita) |
| Repo structure | Single repo, single npm package |
| Workspaces | npm workspaces (`packages/*`), apenas `@aios/installer` |
| ee/pro directory | Nao existe |
| .gitmodules | Nao existe |
| Published files | `bin/`, `src/`, `packages/`, `.aios-core/`, `squads/`, `scripts/`, `tools/`, `templates/` |
| Apps (dashboard, monitor) | Excluidos do npm publish |
| CI/CD | Pipeline unica, semantic-release |

### Constraints

1. **aios-core DEVE funcionar 100% standalone** sem aios-pro
2. **Privacidade do codigo pro** desde o inicio (nao visivel publicamente)
3. **Push separado** por repositorio (aios-core publico, aios-pro privado)
4. **Contributor experience** nao deve degradar para quem trabalha apenas no core
5. **npm publish** deve suportar ambos pacotes independentemente

---

## Decision

### Chosen Approach: B - Monorepo + Private Git Submodule

```
SynkraAI/aios-core (public)          SynkraAI/aios-pro (private)
├── .aios-core/                       ├── package.json (@aios/pro)
├── bin/aios.js                       ├── LICENSE (Proprietary)
├── packages/                         ├── README.md
│   └── installer/                    ├── squads/
├── pro/ ── git submodule ──────────► │   ├── squad-saas/
├── squads/ (community)               │   ├── squad-ecommerce/
├── apps/                             │   └── squad-fintech/
├── docs/                             ├── memory/
├── tests/                            │   ├── persistent-store/
├── LICENSE (MIT+Commons)             │   ├── cross-session/
└── package.json                      │   └── analytics/
                                      ├── metrics/
                                      │   ├── dashboards/
                                      │   ├── cost-tracking/
                                      │   └── usage-analytics/
                                      └── integrations/
                                          ├── gitlab/
                                          ├── bitbucket/
                                          ├── jira/
                                          └── azure-devops/
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Submodule path** | `pro/` (root-level) | Separacao clara, fora do npm workspace, visibilidade direta |
| **Repo name** | `SynkraAI/aios-pro` | Nome claro e direto |
| **Initial scope** | 4 modulos (squads, memory, metrics, integrations) | Cobertura completa das features pro planejadas |
| **Pro detection** | Conditional loading (check if `pro/` exists) | aios-core funciona sem o submodule |

### Alternatives Considered

#### Approach A: Single Repo + `ee/` Directory (Rejected)

**Why rejected:** Codigo proprietario ficaria visivel publicamente no repositorio. Embora a Commons Clause proteja legalmente, o stakeholder priorizou **privacidade real do codigo** desde o inicio. O modelo PostHog/n8n funciona para projetos com equipes grandes e brand forte, mas o AIOS ainda esta em fase de crescimento.

#### Approach C: Two Separate Repos (Rejected)

**Why rejected:** Custo de manutencao desproporcional. CI/CD duplicado, versionamento independente com compatibility matrix, e CLI wrapper separado representam complexidade desnecessaria. GitLab mesmo migrou de repos separados para repo unico. O submodule oferece a mesma separacao com menor overhead.

---

## Implementation

### Phase 1: Repository Setup

```bash
# 1. Create private repo on GitHub
gh repo create SynkraAI/aios-pro --private --description "AIOS Pro: Premium features for Synkra AIOS"

# 2. Initialize aios-pro structure
# (done in SynkraAI/aios-pro repo)

# 3. Add submodule to aios-core
cd aios-core
git submodule add git@github.com:SynkraAI/aios-pro.git pro

# 4. Configure .gitmodules
# [submodule "pro"]
#   path = pro
#   url = git@github.com:SynkraAI/aios-pro.git
#   branch = main

# 5. Update .gitignore to handle submodule gracefully
echo "# Pro submodule is optional" >> .gitignore
```

### Phase 2: Conditional Loading in CLI

```javascript
// bin/utils/pro-detector.js
const fs = require('fs');
const path = require('path');

function isProAvailable() {
  const proPath = path.join(__dirname, '..', '..', 'pro', 'package.json');
  return fs.existsSync(proPath);
}

function loadProModule(moduleName) {
  if (!isProAvailable()) return null;
  try {
    return require(path.join(__dirname, '..', '..', 'pro', moduleName));
  } catch {
    return null;
  }
}

module.exports = { isProAvailable, loadProModule };
```

### Phase 3: npm Publish Configuration

**aios-core/package.json** - `pro/` excluded from publish:
```json
{
  "files": [
    "bin/",
    "src/",
    "packages/",
    ".aios-core/",
    "squads/",
    "scripts/",
    "tools/",
    "templates/",
    ".claude/CLAUDE.md",
    ".claude/rules/",
    "README.md",
    "LICENSE"
  ]
}
```

**aios-pro/package.json** - published separately as `@aios/pro`:
```json
{
  "name": "@aios/pro",
  "version": "1.0.0",
  "private": false,
  "peerDependencies": {
    "aios-core": ">=3.12.0"
  },
  "files": [
    "squads/",
    "memory/",
    "metrics/",
    "integrations/",
    "LICENSE",
    "README.md"
  ]
}
```

### Phase 4: CI/CD Adjustments

**aios-core CI** (public):
```yaml
# .github/workflows/ci.yml
# Clone WITHOUT submodule (default behavior)
# Tests run without pro/ - validates standalone operation

jobs:
  test-core:
    steps:
      - uses: actions/checkout@v4
        # No submodule checkout - tests core standalone
```

**aios-pro CI** (private, separate workflow):
```yaml
# aios-pro/.github/workflows/ci.yml
# Clone WITH aios-core as context

jobs:
  test-pro:
    steps:
      - uses: actions/checkout@v4
      - name: Clone aios-core for integration testing
        run: |
          git clone https://github.com/SynkraAI/aios-core.git ../aios-core
          ln -s $(pwd) ../aios-core/pro
      - name: Run pro tests
        run: npm test
```

### Phase 5: Developer Workflow

**Core developer (open-source contributor):**
```bash
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core
npm install
# pro/ does not exist - works perfectly without it
```

**Pro developer (team member with access):**
```bash
git clone --recurse-submodules https://github.com/SynkraAI/aios-core.git
cd aios-core
npm install
# pro/ is populated with aios-pro content
```

**Existing clone, adding pro:**
```bash
cd aios-core
git submodule update --init pro
```

---

## Consequences

### Positive

- **Real code privacy**: Pro code lives in private repo, not visible on public GitHub
- **Clean separation**: `pro/` is clearly identifiable, not mixed with core code
- **aios-core standalone**: Works perfectly without submodule (default clone)
- **Independent push**: `cd pro && git push` pushes to aios-pro; `git push` pushes to aios-core
- **npm workspace compatible**: `pro/` can be added to workspaces when needed
- **Industry-validated**: Cal.com uses this exact pattern in production

### Negative

- **Git submodule complexity**: Developers need to understand submodule commands
- **CI/CD dual setup**: Two separate CI pipelines needed
- **Submodule state management**: `pro/` can get out of sync with committed SHA
- **Clone friction for pro developers**: Need `--recurse-submodules` flag

### Mitigations

| Risk | Mitigation |
|------|------------|
| Submodule complexity | Provide `aios setup --pro` CLI command for one-command setup |
| CI/CD dual setup | Share reusable GitHub Actions across repos |
| State sync | Pre-commit hook to warn about uncommitted submodule changes |
| Clone friction | Document in CONTRIBUTING.md; add to @devops bootstrap |

---

## Dependencies

- **Blocks:** PRO-5 (aios-pro Repository Bootstrap)
- **Informs:** PRO-3 (Configuration Hierarchy), PRO-6 (Feature Gating)
- **Requires:** @devops (Gage) for GitHub repo creation and CI/CD setup

---

## Review Status

- [x] @architect (Aria) - Author and architecture review
- [x] Stakeholder - Decision on approach B (submodule from day 1)
- [ ] @devops (Gage) - CI/CD feasibility and implementation review

---

**Decision Date:** 2026-02-05
**Next Steps:** PRO-5 (aios-pro Repository Bootstrap) by @devops
