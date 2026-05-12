<!-- Tradução: PT-BR | Original: /docs/en/architecture/contribution-workflow-research.md | Sincronização: 2026-01-26 -->

# Pesquisa de Workflow de Contribuição Externa

> 🌐 [EN](../../architecture/contribution-workflow-research.md) | **PT** | [ES](../../es/architecture/contribution-workflow-research.md)

---

**Story:** COLLAB-1
**Data:** 2025-12-30
**Autor:** @dev (Dex) + @devops (Gage)
**Status:** Completo

---

## Resumo Executivo

Este documento consolida as descobertas de pesquisa sobre melhores práticas para workflows de contribuidores externos em projetos open source, especificamente para habilitar contribuições seguras da comunidade para agentes e tarefas do AIOX.

---

## 1. Melhores Práticas de Proteção de Branch no GitHub

### 1.1 Recomendações da Indústria

Baseado em pesquisa da [GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule), [DEV Community](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3), e [Legit Security](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following):

| Regra de Proteção                   | Recomendação              | Justificativa                                  |
| ----------------------------------- | ------------------------- | ---------------------------------------------- |
| **Reviews de pull request obrigatórios** | Habilitar com 1-2 revisores | Previne código não revisado de ser mergeado   |
| **Exigir reviews de code owner**    | Habilitar                 | Garante que especialistas de domínio revisem mudanças relevantes |
| **Descartar reviews obsoletas**     | Habilitar                 | Força re-review após novas mudanças            |
| **Status checks obrigatórios**      | CI deve passar            | Captura falhas de build/teste antes do merge   |
| **Exigir resolução de conversas**   | Habilitar                 | Garante que todo feedback seja endereçado      |
| **Restringir force pushes**         | Desabilitar force push    | Previne reescrita de histórico                 |
| **Exigir histórico linear**         | Opcional                  | Histórico git mais limpo (considerar para monorepos) |

### 1.2 Insights Principais

> "Colaboradores com acesso de escrita a um repositório têm permissões completas de escrita em todos os seus arquivos e histórico. Embora isso seja bom para colaboração, nem sempre é desejável."

**Ponto Crítico:** Proteção de branch é uma das considerações de segurança mais importantes. Pode prevenir que código indesejado seja enviado para produção.

### 1.3 Configurações Recomendadas para Open Source

```yaml
branch_protection:
  require_pull_request_reviews:
    required_approving_review_count: 1 # Pelo menos 1 aprovação
    dismiss_stale_reviews: true # Re-review após mudanças
    require_code_owner_reviews: true # Aprovação de especialista de domínio
    require_last_push_approval: false # Opcional para OSS

  required_status_checks:
    strict: true # Branch deve estar atualizado
    contexts:
      - lint
      - typecheck
      - build
      - test # Crítico para qualidade

  restrictions:
    users: []
    teams: ['maintainers']

  allow_force_pushes: false
  allow_deletions: false
  required_conversation_resolution: true # Endereçar todo feedback
```

---

## 2. Melhores Práticas de Configuração do CodeRabbit

### 2.1 Documentação Oficial

Da [CodeRabbit Docs](https://docs.coderabbit.ai/getting-started/yaml-configuration) e [awesome-coderabbit](https://github.com/coderabbitai/awesome-coderabbit):

**Elementos Principais de Configuração:**

| Elemento                    | Propósito                      | Recomendação                           |
| --------------------------- | ------------------------------ | -------------------------------------- |
| `language`                  | Idioma de resposta             | Corresponder ao idioma do projeto (pt-BR ou en-US) |
| `reviews.auto_review`       | Reviews automáticos de PR      | Habilitar para OSS                     |
| `reviews.path_instructions` | Regras de review customizadas por caminho | Essencial para validação de agent/task |
| `chat.auto_reply`           | Responder a comentários        | Habilitar para melhor experiência do contribuidor |

### 2.2 Exemplos do Mundo Real

**TEN Framework (.coderabbit.yaml):**

```yaml
language: 'en-US'
reviews:
  profile: 'chill'
  high_level_summary: true
  auto_review:
    enabled: true
tools:
  ruff:
    enabled: true
  gitleaks:
    enabled: true
```

**Projeto PHARE:**

```yaml
path_instructions:
  '**/*.cpp':
    - 'Verificar memory leaks'
    - 'Verificar thread safety'
tools:
  shellcheck:
    enabled: true
  markdownlint:
    enabled: true
```

**NVIDIA NeMo RL:**

```yaml
auto_title_instructions: |
  Formato: "<categoria>: <título>"
  Categorias: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  Título deve ter <= 80 caracteres
```

### 2.3 Recomendações Específicas para AIOX

Para contribuições de agent/task, o CodeRabbit deve validar:

1. **Estrutura YAML do agente** - persona_profile, commands, dependencies
2. **Formato de task** - elicitation points, deliverables
3. **Documentação** - Atualizações de README, referências de guias
4. **Segurança** - Sem secrets hardcoded, permissões apropriadas

---

## 3. Melhores Práticas de CODEOWNERS

### 3.1 Padrões da Indústria

Da [Harness Blog](https://www.harness.io/blog/mastering-codeowners), [Satellytes](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/), e [GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners):

**Princípios Principais:**

| Princípio            | Descrição                                  |
| -------------------- | ------------------------------------------ |
| **Último match vence** | Padrões posteriores sobrescrevem anteriores |
| **Usar wildcards**   | Consolidar entradas com `*` e `**`         |
| **Teams sobre usuários** | Mais fácil de manter quando pessoas mudam |
| **Granularidade**    | Balancear entre muito amplo e muito específico |

### 3.2 Padrões de Monorepo

```codeowners
# Owner padrão (fallback)
* @org/maintainers

# Ownership de diretório (mais específico)
/src/auth/ @org/security-team
/src/api/ @org/backend-team
/src/ui/ @org/frontend-team

# Ownership por tipo de arquivo
*.sql @org/dba-team
Dockerfile @org/devops-team

# Arquivos críticos (requerem review sênior)
/.github/ @org/core-team
/security/ @org/security-team
```

### 3.3 Estrutura Específica do AIOX

```codeowners
# Padrão - requer review de maintainer
* @SynkraAI/maintainers

# Definições de agentes - requer core team
.aiox-core/development/agents/ @SynkraAI/core-team

# Definições de tasks - requer core team
.aiox-core/development/tasks/ @SynkraAI/core-team

# CI/CD - requer aprovação devops
.github/ @SynkraAI/devops

# Documentação - mais permissivo para contribuidores
docs/ @SynkraAI/maintainers

# Templates - requer review de architect
templates/ @SynkraAI/core-team
.aiox-core/product/templates/ @SynkraAI/core-team
```

---

## 4. GitHub Actions Required Checks

### 4.1 Melhores Práticas

Da [GitHub Docs](https://docs.github.com/articles/about-status-checks) e discussões da comunidade:

**Insight Crítico:**

> "Se uma verificação falha, o GitHub previne o merge do PR. No entanto, jobs pulados reportam 'Success' e não previnem merge."

**Padrão de Solução (job alls-green):**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    # ...

  test:
    runs-on: ubuntu-latest
    # ...

  alls-green:
    name: Todas Verificações Passaram
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: always()
    steps:
      - name: Verificar se todos os jobs passaram
        run: |
          if [ "${{ needs.lint.result }}" != "success" ]; then exit 1; fi
          if [ "${{ needs.test.result }}" != "success" ]; then exit 1; fi
```

### 4.2 Verificações Obrigatórias Recomendadas

| Verificação           | Tipo       | Prioridade         |
| --------------------- | ---------- | ------------------ |
| `lint`                | Obrigatório| ALTA               |
| `typecheck`           | Obrigatório| ALTA               |
| `build`               | Obrigatório| ALTA               |
| `test`                | Obrigatório| ALTA               |
| `story-validation`    | Opcional   | MÉDIA              |
| `ide-sync-validation` | Opcional   | BAIXA              |
| `alls-green`          | Obrigatório| ALTA (job resumo)  |

---

## 5. Exemplos de Workflow de Contribuição OSS

### 5.1 Next.js

Do [Next.js Contribution Guide](https://nextjs.org/docs/community/contribution-guide):

- Workflow de fork e PR
- Verificação automatizada de formatação Prettier
- Requer review de PR de maintainers
- Usa Turborepo para gerenciamento de monorepo

### 5.2 Prisma

Do [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md):

**Requisitos Principais:**

- Assinatura de CLA obrigatória
- Mensagens de commit estruturadas
- Testes devem cobrir mudanças
- Tamanho do bundle monitorado (<6MB)
- CI/CD deve passar (lint, test, cross-platform)

**Workflow:**

1. Clonar repositório
2. Criar branch de feature
3. Fazer mudanças + testes
4. Submeter PR com descrição
5. Assinar CLA
6. Aguardar review

### 5.3 Padrões Comuns

| Padrão               | Adoção                  | Recomendação       |
| -------------------- | ----------------------- | ------------------ |
| Workflow de fork     | Muito comum             | Adotar             |
| Assinatura de CLA    | Comum em OSS corporativo| Opcional por agora |
| Conventional commits | Muito comum             | Já adotado         |
| Aprovações obrigatórias | Universal            | Adotar (1 aprovação)|
| CODEOWNERS           | Comum                   | Adotar (granular)  |
| CodeRabbit/AI review | Crescendo               | Adotar             |

---

## 6. Considerações de Segurança

### 6.1 Workflow de Fork vs Branch Direta

| Aspecto                | Workflow de Fork     | Branch Direta       |
| ---------------------- | -------------------- | ------------------- |
| **Segurança**          | Maior (isolado)      | Menor (repo compartilhado) |
| **Acesso do contribuidor** | Não precisa escrita | Acesso de escrita necessário |
| **CI/CD**              | Roda no contexto do fork | Roda no repo principal |
| **Secrets**            | Protegidos           | Acessíveis          |
| **Complexidade**       | Ligeiramente maior   | Menor               |

**Recomendação:** Workflow de fork para contribuidores externos (já documentado em CONTRIBUTING.md)

### 6.2 Protegendo Secrets em PRs

- Nunca expor secrets em logs de CI
- Usar `pull_request_target` com cuidado
- Limitar escopos de secrets
- Auditar autores de PR para padrões suspeitos

---

## 7. Recomendações para AIOX

### 7.1 Ações Imediatas (CRÍTICO)

1. **Habilitar reviews de aprovação obrigatórios** (`required_approving_review_count: 1`)
2. **Habilitar reviews de code owner** (`require_code_owner_reviews: true`)
3. **Adicionar `test` aos status checks obrigatórios**

### 7.2 Ações de Curto Prazo (ALTO)

1. **Criar `.coderabbit.yaml`** com instruções de path específicas do AIOX
2. **Atualizar CODEOWNERS** com ownership granular
3. **Habilitar resolução de conversas obrigatória**

### 7.3 Ações de Médio Prazo (MÉDIO)

1. **Criar templates de PR especializados** para contribuições de agent/task
2. **Aprimorar CONTRIBUTING.md** com checklist de contribuição de agente
3. **Adicionar guia de onboarding de contribuidor**

### 7.4 Baixa Prioridade (BOM TER)

1. **Adicionar bot de CLA** para proteção legal
2. **Implementar automação de PR obsoleto**
3. **Adicionar dashboard de métricas de contribuição**

---

## 8. Fontes

### Proteção de Branch

- [GitHub Docs: Managing Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [DEV Community: Best Practices for Branch Protection](https://dev.to/n3wt0n/best-practices-for-branch-protection-2pe3)
- [Legit Security: GitHub Security Best Practices](https://www.legitsecurity.com/blog/github-security-best-practices-your-team-should-be-following)

### CodeRabbit

- [CodeRabbit YAML Configuration](https://docs.coderabbit.ai/getting-started/yaml-configuration)
- [awesome-coderabbit Repository](https://github.com/coderabbitai/awesome-coderabbit)
- [TEN Framework .coderabbit.yaml](https://github.com/TEN-framework/ten-framework/blob/main/.coderabbit.yaml)

### CODEOWNERS

- [Harness: Mastering CODEOWNERS](https://www.harness.io/blog/mastering-codeowners)
- [GitHub Docs: About Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Satellytes: Monorepo CODEOWNERS](https://www.satellytes.com/blog/post/monorepo-codeowner-github-enterprise/)

### GitHub Actions

- [GitHub Docs: About Status Checks](https://docs.github.com/articles/about-status-checks)
- [GitHub Blog: Required Workflows](https://github.blog/enterprise-software/devops/introducing-required-workflows-and-configuration-variables-to-github-actions/)

### Exemplos OSS

- [Next.js Contribution Guide](https://nextjs.org/docs/community/contribution-guide)
- [Prisma CONTRIBUTING.md](https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md)

---

_Documento gerado como parte da investigação da Story COLLAB-1._
