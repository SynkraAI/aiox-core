<!-- Tradução: PT-BR | Original: /docs/en/architecture/adr/ADR-COLLAB-2-proposed-configuration.md | Sincronização: 2026-01-26 -->

# ADR-COLLAB-2: Configuração Proposta - Workflow de Contribuição Externa

**Story:** COLLAB-1
**Data:** 2025-12-30
**Status:** Proposto
**Autor:** @devops (Gage) + @architect (Aria)

---

## Contexto

Seguindo a [Auditoria do Estado Atual](./ADR-COLLAB-1-current-state-audit.md), este documento propõe alterações de configuração específicas para habilitar contribuições externas seguras ao AIOX.

---

## Decisão

Implementar uma atualização de configuração em múltiplas fases para estabelecer workflows seguros de contribuidores externos.

---

## Configurações Propostas

### 1. Regras de Proteção de Branch

**Alvo:** branch `main`

```yaml
# Configuração proposta de proteção de branch
branch_protection:
  main:
    # Status checks (CI deve passar)
    required_status_checks:
      strict: true # Branch deve estar atualizada
      contexts:
        - lint # EXISTENTE
        - typecheck # EXISTENTE
        - build # EXISTENTE
        - test # ADICIONAR - garantir que testes passem
        - validation-summary # ADICIONAR - padrão alls-green

    # Revisões de pull request
    required_pull_request_reviews:
      dismiss_stale_reviews: true # EXISTENTE
      require_code_owner_reviews: true # ALTERAR de false
      require_last_push_approval: false # Manter false para OSS
      required_approving_review_count: 1 # ALTERAR de 0

    # Aplicação para admins
    enforce_admins: false # Permitir bypass de maintainer para emergências

    # Restrições de push
    allow_force_pushes: false # EXISTENTE
    allow_deletions: false # EXISTENTE
    block_creations: false # Manter false

    # Resolução de conversas
    required_conversation_resolution: true # ADICIONAR - todo feedback deve ser endereçado

    # Histórico linear (opcional)
    required_linear_history: false # Manter false - permitir merge commits

    # Assinaturas (opcional)
    required_signatures: false # Manter false por enquanto
```

**Comando de Implementação:**

```bash
gh api repos/SynkraAI/aiox-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test","validation-summary"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null \
  -F required_conversation_resolution=true
```

---

### 2. Configuração CodeRabbit

**Arquivo:** `.coderabbit.yaml` (diretório raiz)

```yaml
# yaml-language-server: $schema=https://coderabbit.ai/integrations/schema.v2.json
# Configuração CodeRabbit do AIOX
# Story: COLLAB-1

language: 'en-US'
tone: professional
early_access: false

reviews:
  # Configurações de revisão automática
  auto_review:
    enabled: true
    base_branches:
      - main
    drafts: false

  # Comportamento de revisão
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false

  # Instruções de revisão específicas por caminho
  path_instructions:
    # Definições de agentes - validação rigorosa
    '.aiox-core/development/agents/**':
      - 'Verificar se agente segue estrutura YAML de agente AIOX (persona_profile, commands, dependencies)'
      - 'Verificar se persona_profile inclui archetype, communication style e greeting_levels'
      - 'Validar se todos os comandos listados têm dependências de tarefa correspondentes'
      - 'Garantir que agente tem metadados de visibilidade apropriados para comandos'
      - 'Verificar segurança: sem credenciais hardcoded ou dados sensíveis'

    # Definições de tarefas
    '.aiox-core/development/tasks/**':
      - 'Verificar se tarefa segue formato de tarefa AIOX com pontos de elicitação claros'
      - 'Verificar se deliverables estão bem definidos'
      - 'Validar se quaisquer dependências referenciadas existem no codebase'
      - 'Garantir que tarefa tem orientação apropriada de tratamento de erros'

    # Definições de workflows
    '.aiox-core/development/workflows/**':
      - 'Verificar se estrutura YAML do workflow é válida'
      - 'Verificar se ordenação e dependências de passos fazem sentido lógico'
      - 'Validar se agentes e tarefas referenciados existem'

    # Arquivos de template
    '.aiox-core/product/templates/**':
      - 'Garantir que template segue convenções de template AIOX'
      - 'Verificar se sintaxe de placeholder é consistente'
      - 'Validar se template produz saída válida'

    # Configurações CI/CD
    '.github/**':
      - 'Revisar implicações de segurança'
      - 'Verificar tratamento adequado de secrets'
      - 'Validar sintaxe de workflow'
      - 'Garantir consistência com padrões de CI existentes'

    # Código JavaScript/TypeScript
    '**/*.js':
      - 'Verificar boas práticas de async/await'
      - 'Verificar se tratamento de erros é abrangente'
      - 'Procurar potenciais vulnerabilidades de segurança'
      - 'Garantir que código segue padrões de codificação AIOX'

    '**/*.ts':
      - 'Verificar se tipos TypeScript estão definidos corretamente'
      - "Verificar uso de tipo 'any' que deveria ser mais específico"
      - 'Garantir que exports estão tipados corretamente'

# Validação de título de PR (Conventional Commits)
auto_title_instructions: |
  Formato: "<type>(<scope>): <description>"

  Tipos: feat, fix, docs, style, refactor, test, chore, perf, ci, build
  Scope: Opcional, indica área afetada (agent, task, workflow, ci, docs)
  Description: Conciso (<= 72 chars), modo imperativo

  Exemplos:
  - feat(agent): add KISS validation to data-engineer
  - fix(task): resolve elicitation timeout issue
  - docs: update external contribution guide

# Configurações de chat
chat:
  auto_reply: true

# Configuração de ferramentas
tools:
  # Ferramentas de linting
  eslint:
    enabled: true
  markdownlint:
    enabled: true
  yamllint:
    enabled: true

  # Ferramentas de segurança
  gitleaks:
    enabled: true

# Configurações de comportamento
abort_on_close: true
```

---

### 3. Configuração CODEOWNERS

**Arquivo:** `.github/CODEOWNERS`

```codeowners
# AIOX Code Owners
# Story: COLLAB-1
# Última Atualização: 2025-12-30
#
# Formato: <padrão> <owners>
# Padrões posteriores têm precedência sobre anteriores
# Veja: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# ============================================
# Owner Padrão (fallback)
# ============================================
* @SynkraAI/maintainers

# ============================================
# Framework Core
# ============================================
# Definições de agentes - requer revisão do core team
.aiox-core/development/agents/ @SynkraAI/core-team

# Definições de tarefas - requer revisão do core team
.aiox-core/development/tasks/ @SynkraAI/core-team

# Definições de workflows - requer revisão do core team
.aiox-core/development/workflows/ @SynkraAI/core-team

# Templates - requer revisão de architect/core team
.aiox-core/product/templates/ @SynkraAI/core-team
templates/ @SynkraAI/core-team

# Utilitários core - requer revisão sênior
.aiox-core/core/ @SynkraAI/core-team
.aiox-core/cli/ @SynkraAI/core-team

# ============================================
# Infraestrutura
# ============================================
# CI/CD - requer aprovação de devops
.github/ @SynkraAI/devops

# Configurações Docker
.docker/ @SynkraAI/devops

# Arquivos de configuração
.aiox-core/core-config.yaml @SynkraAI/core-team
package.json @SynkraAI/maintainers
package-lock.json @SynkraAI/maintainers

# ============================================
# Documentação (Mais Permissivo)
# ============================================
# Docs gerais - maintainers podem aprovar
docs/ @SynkraAI/maintainers

# Decisões de arquitetura - requer core team
docs/architecture/ @SynkraAI/core-team
docs/framework/ @SynkraAI/core-team

# Stories - maintainers (docs de desenvolvimento interno)
docs/stories/ @SynkraAI/maintainers

# Guias - maintainers (amigável para contribuidores)
docs/guides/ @SynkraAI/maintainers

# ============================================
# Arquivos Sensíveis de Segurança
# ============================================
# Configurações de segurança
.github/CODEOWNERS @SynkraAI/core-team
.github/workflows/semantic-release.yml @SynkraAI/devops
.github/workflows/npm-publish.yml @SynkraAI/devops

# Arquivos de configuração raiz
.env* @SynkraAI/core-team
*.config.js @SynkraAI/maintainers
```

**Teams GitHub Necessários:**

- `@SynkraAI/maintainers` - Maintainers gerais (acesso de escrita)
- `@SynkraAI/core-team` - Desenvolvedores core do framework
- `@SynkraAI/devops` - CI/CD e infraestrutura

---

### 4. Atualização de Status Checks Obrigatórios

**Checks Atuais:** `lint`, `typecheck`, `build`

**Checks Propostos:**

| Check                | Workflow Fonte | Prioridade  | Notas                          |
| -------------------- | -------------- | ----------- | ------------------------------ |
| `lint`               | ci.yml         | Obrigatório | Validação ESLint               |
| `typecheck`          | ci.yml         | Obrigatório | Verificação TypeScript         |
| `build`              | ci.yml         | Obrigatório | Verificação de build           |
| `test`               | ci.yml         | Obrigatório | Suíte de testes Jest           |
| `validation-summary` | ci.yml         | Obrigatório | Padrão alls-green              |
| `story-validation`   | ci.yml         | Opcional    | Validação de checkbox de story |

**Nota:** O job `validation-summary` em ci.yml age como padrão "alls-green", garantindo que todos os outros jobs passaram.

---

### 5. Templates de PR

**Arquivo:** `.github/PULL_REQUEST_TEMPLATE/agent_contribution.md`

```markdown
## Contribuição de Agente

### Informações do Agente

- **Nome do Agente:**
- **ID do Agente:**
- **Tipo de Agente:** (core | expansion | community)

### Alterações Realizadas

- [ ] Nova definição de agente
- [ ] Agente existente atualizado
- [ ] Novos comandos adicionados
- [ ] Novas dependências de tarefa

### Checklist

#### Obrigatório

- [ ] Agente segue estrutura YAML de agente AIOX
- [ ] `persona_profile` está completo (archetype, communication, greeting_levels)
- [ ] Todos os comandos têm dependências de tarefa correspondentes
- [ ] Sem credenciais hardcoded ou dados sensíveis
- [ ] Testes adicionados/atualizados (se aplicável)
- [ ] Documentação atualizada

#### Opcional

- [ ] README do agente atualizado
- [ ] Exemplo de uso fornecido

### Testes

Descreva como você testou essas alterações:

### Issues Relacionadas

Fixes #

---

_Ao submeter este PR, confirmo que li as [Diretrizes de Contribuição](../../../../CONTRIBUTING.md)_
```

**Arquivo:** `.github/PULL_REQUEST_TEMPLATE/task_contribution.md`

```markdown
## Contribuição de Tarefa

### Informações da Tarefa

- **Nome da Tarefa:**
- **Arquivo da Tarefa:**
- **Agente(s) Relacionado(s):**

### Alterações Realizadas

- [ ] Nova definição de tarefa
- [ ] Tarefa existente atualizada
- [ ] Novos pontos de elicitação

### Checklist

#### Obrigatório

- [ ] Tarefa segue formato de tarefa AIOX
- [ ] Pontos de elicitação são claros e acionáveis
- [ ] Deliverables estão bem definidos
- [ ] Orientação de tratamento de erros incluída
- [ ] Dependências referenciadas existem

#### Opcional

- [ ] Exemplo de workflow fornecido
- [ ] Documentação atualizada

### Testes

Descreva como você testou esta tarefa:

### Issues Relacionadas

Fixes #

---

_Ao submeter este PR, confirmo que li as [Diretrizes de Contribuição](../../../../CONTRIBUTING.md)_
```

---

## Plano de Implementação

### Fase 1: Segurança Crítica (Dia 1)

| Item                   | Ação                 | Rollback                                              |
| ---------------------- | -------------------- | ----------------------------------------------------- |
| Revisões obrigatórias  | Definir count para 1 | `gh api -X PUT ... required_approving_review_count:0` |
| Revisões de code owner | Habilitar            | `gh api -X PUT ... require_code_owner_reviews:false`  |

**Risco:** Baixo - são proteções aditivas

### Fase 2: Revisão Automatizada (Dia 2-3)

| Item                 | Ação                             | Rollback        |
| -------------------- | -------------------------------- | --------------- |
| Config CodeRabbit    | Criar `.coderabbit.yaml`         | Deletar arquivo |
| Testar em feature PR | Abrir PR de teste                | N/A             |
| Validar integração   | Verificar comentários CodeRabbit | N/A             |

**Risco:** Baixo - CodeRabbit não é bloqueante por padrão

### Fase 3: Documentação (Dia 3-5)

| Item            | Ação                    | Rollback     |
| --------------- | ----------------------- | ------------ |
| CODEOWNERS      | Atualizar granularidade | `git revert` |
| Templates de PR | Criar templates         | `git revert` |
| Guia externo    | Criar guia              | `git revert` |

**Risco:** Muito baixo - apenas documentação

### Fase 4: Hardening de CI (Dia 5-7)

| Item                              | Ação                         | Rollback            |
| --------------------------------- | ---------------------------- | ------------------- |
| Adicionar `test` aos obrigatórios | Atualizar proteção de branch | Remover de contexts |
| Resolução de conversas            | Habilitar                    | Desabilitar         |

**Risco:** Médio - poderia bloquear PRs legítimos se testes forem flaky

---

## Procedimentos de Rollback

### Rollback de Emergência (Proteção de Branch)

```bash
# Remover toda proteção de branch (apenas emergência)
gh api -X DELETE repos/SynkraAI/aiox-core/branches/main/protection

# Restaurar proteção mínima
gh api repos/SynkraAI/aiox-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":0}' \
  -F restrictions=null
```

### Rollback CodeRabbit

```bash
# Simplesmente deletar o arquivo de config
rm .coderabbit.yaml
git add -A && git commit -m "chore: rollback CodeRabbit config"
git push
```

### Rollback CODEOWNERS

```bash
# Restaurar ownership simples
echo "* @SynkraAI" > .github/CODEOWNERS
git add -A && git commit -m "chore: rollback CODEOWNERS"
git push
```

---

## Critérios de Sucesso

| Métrica                         | Alvo                    | Medição                         |
| ------------------------------- | ----------------------- | ------------------------------- |
| Todos PRs requerem aprovação    | 100%                    | Auditoria de proteção de branch |
| CodeRabbit revisa PRs           | 100%                    | Dashboard CodeRabbit            |
| Nenhum merge não autorizado     | 0 incidentes            | Auditoria de segurança          |
| Sucesso de contribuidor externo | Primeiro PR em 1 semana | GitHub insights                 |
| Tempo até primeira revisão      | <24 horas               | Métricas de PR                  |

---

## Consequências

### Positivas

- Workflow seguro de contribuição externa
- Revisão de código automatizada com CodeRabbit
- Ownership claro com CODEOWNERS
- Qualidade consistente de PR com templates

### Negativas

- Processo de merge levemente mais lento (requer aprovação)
- Disponibilidade de maintainer se torna crítica
- Curva de aprendizado para novo feedback do CodeRabbit

### Neutras

- Teams precisam ser criados na organização GitHub
- Manutenção regular de CODEOWNERS necessária

---

## Documentos Relacionados

- [ADR-COLLAB-1-current-state-audit.md](./ADR-COLLAB-1-current-state-audit.md)
- [contribution-workflow-research.md](../contribution-workflow-research.md)

---

_Design de configuração concluído como parte da investigação da Story COLLAB-1._
