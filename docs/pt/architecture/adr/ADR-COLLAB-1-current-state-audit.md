<!-- Tradução: PT-BR | Original: /docs/en/architecture/adr/ADR-COLLAB-1-current-state-audit.md | Sincronização: 2026-01-26 -->

# ADR-COLLAB-1: Auditoria do Estado Atual - Proteção de Branch e Workflow de Contribuidores

**Story:** COLLAB-1
**Data:** 2025-12-30
**Status:** Aceito
**Autor:** @devops (Gage)

---

## Contexto

Um usuário da comunidade fez melhorias no agente `@data-engineer`. Esta auditoria documenta a configuração atual de segurança do repositório para identificar lacunas que poderiam permitir modificações não autorizadas na branch main.

---

## Decisão

Auditar o estado atual de:

1. Regras de proteção de branch
2. Workflows do GitHub Actions
3. Configuração CODEOWNERS
4. Status checks obrigatórios

---

## Estado Atual

### 1. Configurações de Proteção de Branch

**Fonte:** `gh api repos/SynkraAI/aiox-core/branches/main/protection`

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "lint", "typecheck"]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false,
    "required_approving_review_count": 0
  },
  "required_signatures": {
    "enabled": false
  },
  "enforce_admins": {
    "enabled": false
  },
  "required_linear_history": {
    "enabled": false
  },
  "allow_force_pushes": {
    "enabled": false
  },
  "allow_deletions": {
    "enabled": false
  },
  "required_conversation_resolution": {
    "enabled": false
  }
}
```

### 2. Configurações do Repositório

**Fonte:** `gh api repos/SynkraAI/aiox-core`

```json
{
  "name": "aiox-core",
  "default_branch": "main",
  "visibility": "public",
  "allow_forking": true,
  "has_discussions": true,
  "has_issues": true,
  "has_projects": true,
  "has_wiki": true
}
```

### 3. Workflows do GitHub Actions

**Fonte:** `gh api repos/SynkraAI/aiox-core/actions/workflows`

| Workflow                   | Estado | Caminho                                   |
| -------------------------- | ------ | ----------------------------------------- |
| CI                         | ativo  | .github/workflows/ci.yml                  |
| Test                       | ativo  | .github/workflows/test.yml                |
| PR Automation              | ativo  | .github/workflows/pr-automation.yml       |
| PR Labeling                | ativo  | .github/workflows/pr-labeling.yml         |
| Semantic Release           | ativo  | .github/workflows/semantic-release.yml    |
| Release                    | ativo  | .github/workflows/release.yml             |
| NPM Publish                | ativo  | .github/workflows/npm-publish.yml         |
| Welcome New Contributors   | ativo  | .github/workflows/welcome.yml             |
| macOS Testing              | ativo  | .github/workflows/macos-testing.yml       |
| Quarterly Gap Audit        | ativo  | .github/workflows/quarterly-gap-audit.yml |
| CodeQL                     | ativo  | dynamic/github-code-scanning/codeql       |

### 4. Configuração CODEOWNERS

**Fonte:** `.github/CODEOWNERS`

```codeowners
* @SynkraAI
```

**Análise:** Ownership único no nível da organização - sem ownership granular por caminho.

### 5. Configuração CodeRabbit

**Status:** `.coderabbit.yaml` NÃO ENCONTRADO

---

## Análise de Lacunas

### Severidade CRÍTICA

| Configuração                          | Atual     | Esperado | Risco                                    |
| ------------------------------------- | --------- | -------- | ---------------------------------------- |
| `required_approving_review_count`     | **0**     | **1**    | Código não revisado pode ser mergeado    |
| `require_code_owner_reviews`          | **false** | **true** | Sem validação de especialista do domínio |

**Impacto:** Qualquer colaborador com acesso de escrita pode mergear PRs sem aprovação, ignorando revisão de código.

### Severidade ALTA

| Configuração                    | Atual      | Esperado      | Risco                          |
| ------------------------------- | ---------- | ------------- | ------------------------------ |
| CodeRabbit `.coderabbit.yaml`   | Ausente    | Configurado   | Sem revisão automatizada de IA |
| Granularidade CODEOWNERS        | Nível org  | Específico por caminho | Sem roteamento de especialistas |

**Impacto:** Qualidade de revisão reduzida e sem feedback automatizado para contribuidores.

### Severidade MÉDIA

| Configuração                                | Atual        | Esperado   | Risco                              |
| ------------------------------------------- | ------------ | ---------- | ---------------------------------- |
| `test` nos checks obrigatórios              | Não exigido  | Exigido    | Testes podem ser pulados           |
| `required_conversation_resolution`          | false        | true       | Feedback pode ser ignorado         |
| `story-validation` nos checks obrigatórios  | Não exigido  | Opcional   | Consistência de story não exigida  |

**Impacto:** PRs podem ser mergeados com testes falhando ou feedback não endereçado.

### Severidade BAIXA

| Configuração              | Atual | Esperado | Risco                                |
| ------------------------- | ----- | -------- | ------------------------------------ |
| Assinaturas obrigatórias  | false | Opcional | Autenticidade de commit não verificada |
| Histórico linear exigido  | false | Opcional | Histórico de merge complexo          |

**Impacto:** Preocupações menores de rastreabilidade.

---

## Tabela Resumo

| Categoria                 | Status   | Ação Necessária        |
| ------------------------- | -------- | ---------------------- |
| Revisões de aprovação     | CRÍTICO  | Habilitar 1 obrigatória |
| Revisões de code owner    | CRÍTICO  | Habilitar              |
| Config CodeRabbit         | ALTA     | Criar                  |
| Detalhamento CODEOWNERS   | ALTA     | Aprimorar              |
| Test nos checks           | MÉDIA    | Adicionar              |
| Resolução de conversas    | MÉDIA    | Habilitar              |

---

## Avaliação de Risco

### Nível de Risco Atual: ALTO

Com `required_approving_review_count: 0`, qualquer colaborador pode:

1. Criar um PR
2. Mergear imediatamente sem nenhuma revisão
3. Ignorar toda supervisão humana

Isso é aceitável para desenvolvimento interno mas **não recomendado para contribuições externas**.

### Fatores Mitigantes

- Pipeline de CI (`lint`, `typecheck`, `build`) é obrigatório
- Force pushes estão desabilitados
- Deleções de branch estão desabilitadas
- Revisões obsoletas são descartadas (quando revisões são exigidas)

---

## Recomendações

### Fase 1: Imediato (CRÍTICO)

1. Definir `required_approving_review_count: 1`
2. Definir `require_code_owner_reviews: true`

**Comando:**

```bash
gh api repos/SynkraAI/aiox-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null
```

### Fase 2: Curto prazo (ALTA)

1. Criar `.coderabbit.yaml` com regras específicas do AIOX
2. Atualizar CODEOWNERS com caminhos granulares

### Fase 3: Médio prazo (MÉDIA)

1. Adicionar `test` aos status checks obrigatórios
2. Habilitar `required_conversation_resolution`

---

## Artefatos da Auditoria

Configurações exportadas salvas em:

- `.aiox/audit/branch-protection.json`
- `.aiox/audit/repo-settings.json`

---

## Consequências

### Positivas

- Visibilidade completa da postura de segurança atual
- Priorização clara de correções
- Recomendações baseadas em evidências

### Negativas

- Auditoria revela lacunas significativas
- Ação imediata necessária para contribuições externas seguras

### Neutras

- Pipeline de CI existente está bem configurado
- Workflow de fork está documentado em CONTRIBUTING.md

---

## Documentos Relacionados

- [contribution-workflow-research.md](../contribution-workflow-research.md)
- [ADR-COLLAB-2-proposed-configuration.md](./ADR-COLLAB-2-proposed-configuration.md)

---

_Auditoria conduzida como parte da investigação da Story COLLAB-1._
