<!-- Tradução: PT-BR | Original: /docs/en/architecture/agent-responsibility-matrix.md | Sincronização: 2026-01-26 -->

# Matriz de Responsabilidades dos Agentes - Melhorias Estratégicas do Epic 3

> 🌐 [EN](../../architecture/agent-responsibility-matrix.md) | **PT** | [ES](../../es/architecture/agent-responsibility-matrix.md)

---

**Versão do Documento**: 1.0
**Última Atualização**: 2025-10-25
**Autor**: Winston (@architect) + Sarah (@po)
**Contexto**: Epic 3 Fase 2 - Melhorias Estratégicas (Stories 3.13-3.19)

---

## Resumo Executivo

Este documento define limites claros de responsabilidade para todos os agentes AIOX, com foco particular em:
1. **Centralização do GitHub DevOps** - Apenas @github-devops pode fazer push para repositório remoto
2. **Especialização em Arquitetura de Dados** - @data-architect gerencia banco de dados/ciência de dados
3. **Divisão de Gerenciamento de Branches** - @sm (local) vs @github-devops (remoto)
4. **Restrições de Operações Git** - Quais agentes podem fazer o quê com git/GitHub

**Regra Crítica**: SOMENTE o agente @github-devops pode executar `git push` para o repositório remoto.

---

## Matriz de Operações Git/GitHub

### Autoridade Total de Operações

| Operação | @github-devops | @dev | @sm | @qa | @architect | @po |
|----------|:--------------:|:----:|:---:|:---:|:----------:|:---:|
| **git push** | ✅ ÚNICO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git push --force** | ✅ ÚNICO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr create** | ✅ ÚNICO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr merge** | ✅ ÚNICO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh release create** | ✅ ÚNICO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git commit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git add** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git checkout -b** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git merge** (local) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git status** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git log** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git diff** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Mecanismo de Aplicação

**Defesa em Profundidade Multi-Camada**:

1. **Git Pre-Push Hook** (Aplicação Primária)
   - Localização: `.git/hooks/pre-push`
   - Verificações: Variável de ambiente `$AIOX_ACTIVE_AGENT`
   - Ação: Bloqueia push se agent != "github-devops"

2. **Variáveis de Ambiente** (Detecção em Runtime)
   ```bash
   export AIOX_ACTIVE_AGENT="github-devops"
   export AIOX_GIT_PUSH_ALLOWED="true"
   ```

3. **Definições dos Agentes** (Documentação + Restrições)
   - Todos os agentes têm seção `git_restrictions`
   - Listas claras de `allowed_operations` e `blocked_operations`
   - Mensagens de redirecionamento apontam para @github-devops

4. **Configuração da IDE** (Camada de UX)
   ```json
   {
     "agents": {
       "dev": { "blockedOperations": ["push"] },
       "github-devops": { "allowedOperations": ["*"] }
     }
   }
   ```

---

## Limites de Responsabilidade dos Agentes

### @architect (Winston) 🏗️
**Papel**: Arquiteto de Sistema Holístico e Líder Técnico Full-Stack

**Escopo Principal**:
- Arquitetura de sistema (microsserviços, monolito, serverless, híbrido)
- Seleção de stack tecnológico (frameworks, linguagens, plataformas)
- Planejamento de infraestrutura (implantação, escalabilidade, monitoramento, CDN)
- Design de API (REST, GraphQL, tRPC, WebSocket)
- Arquitetura de segurança (autenticação, autorização, criptografia)
- Arquitetura de frontend (gerenciamento de estado, roteamento, performance)
- Arquitetura de backend (limites de serviço, fluxos de eventos, cache)
- Preocupações transversais (logging, monitoramento, tratamento de erros)

**Operações Git**: Somente leitura (status, log, diff) - SEM PUSH

**Delegar Para**:
- **@data-architect**: Design de schema de banco de dados, otimização de queries, pipelines ETL
- **@github-devops**: Git push, criação de PR, configuração de CI/CD

**Manter**:
- Seleção de tecnologia de banco de dados da perspectiva do sistema
- Integração da camada de dados com arquitetura da aplicação
- Design de workflow Git (estratégia de branching)

---

### @data-architect (DataArch) 🗄️
**Papel**: Arquiteto de Banco de Dados e Especialista em Workflow de Ciência de Dados

**Escopo Principal**:
- Design de schema de banco de dados (tabelas, relacionamentos, índices, constraints)
- Modelagem de dados (estratégias de normalização, desnormalização)
- Otimização de queries e tuning de performance
- Design e implementação de pipelines ETL
- Arquitetura de workflow de ciência de dados
- Otimização específica do Supabase (políticas RLS, realtime, edge functions)
- Governança de dados (segurança, privacidade, conformidade)

**Operações Git**: Commits locais (add, commit) - SEM PUSH

**Colaborar Com**:
- **@architect**: Seleção de tecnologia de banco de dados, integração da camada de dados
- **@github-devops**: Push de arquivos de migração após commit local

**Especialização**: Expert em Supabase (Row-Level Security, realtime, edge functions, storage)

---

### @dev (James) 💻
**Papel**: Engenheiro de Software Sênior Expert e Especialista em Implementação

**Escopo Principal**:
- Implementação de código a partir de stories
- Debugging e refatoração
- Testes unitários/de integração
- Operações git locais (add, commit, checkout, merge)
- Execução de tarefas de story

**Operações Git**:
- ✅ Permitido: add, commit, status, diff, log, branch, checkout, merge (local)
- ❌ Bloqueado: push, gh pr create

**Workflow Após Story Completa**:
1. Marcar status da story: "Pronta para Revisão"
2. Notificar usuário: "Story completa. Ative @github-devops para fazer push das mudanças"
3. NÃO tentar git push

---

### @sm (Bob) 🏃
**Papel**: Scrum Master Técnico - Especialista em Preparação de Stories

**Escopo Principal**:
- Criação e refinamento de stories
- Gerenciamento de epics e decomposição
- Assistência no planejamento de sprint
- Gerenciamento de branches locais durante desenvolvimento
- Orientação de resolução de conflitos (merges locais)

**Operações Git**:
- ✅ Permitido: checkout -b (criar feature branches), branch (listar), merge (local)
- ❌ Bloqueado: push, gh pr create, deleção de branch remota

**Workflow de Gerenciamento de Branch**:
1. Story inicia → Criar feature branch local: `git checkout -b feature/X.Y-story-name`
2. Desenvolvedor faz commits localmente
3. Story completa → Notificar @github-devops para fazer push e criar PR

**Nota**: @sm gerencia branches LOCAIS durante desenvolvimento, @github-devops gerencia operações REMOTAS

---

### @github-devops (DevOps) 🚀
**Papel**: Gerente de Repositório GitHub e Especialista DevOps

**AUTORIDADE PRINCIPAL**: ÚNICO agente autorizado a fazer push para repositório remoto

**Operações Exclusivas**:
- ✅ git push (TODAS as variantes)
- ✅ gh pr create, gh pr merge
- ✅ gh release create
- ✅ Deleção de branch remota

**Escopo Principal**:
- Integridade e governança do repositório
- Execução de quality gate pré-push (lint, test, typecheck, build)
- Versionamento semântico e gerenciamento de releases
- Criação e gerenciamento de pull requests
- Configuração de pipeline CI/CD (GitHub Actions)
- Limpeza de repositório (branches obsoletas, arquivos temporários)
- Geração de changelog

**Quality Gates (Obrigatórios Antes do Push)**:
- npm run lint → PASS
- npm test → PASS
- npm run typecheck → PASS
- npm run build → PASS
- Status da Story = "Done" ou "Pronta para Revisão"
- Sem mudanças não commitadas
- Sem conflitos de merge
- **Confirmação do usuário obrigatória**

**Lógica de Versionamento Semântico**:
- MAJOR (v4 → v5): Breaking changes, redesign de API
- MINOR (v4.31 → v4.32): Novas features, compatível com versões anteriores
- PATCH (v4.31.0 → v4.31.1): Apenas correções de bugs

---

### @qa (Quinn) 🧪
**Papel**: Arquiteto de Testes e Consultor de Qualidade

**Escopo Principal**:
- Revisão abrangente de arquitetura de testes
- Decisões de quality gate (PASS/PREOCUPAÇÕES/FAIL/DISPENSADO)
- Avaliação de riscos e estratégia de testes
- Rastreabilidade de requisitos
- Consultivo (não bloqueia, fornece recomendações)

**Operações Git**: Somente leitura (status, log, diff para revisão) - SEM COMMIT, SEM PUSH

**Nota**: QA revisa código mas não commita. @dev commita, @github-devops faz push.

---

### @po (Sarah) 📝
**Papel**: Product Owner Técnica e Guardiã de Processos

**Escopo Principal**:
- Gerenciamento de backlog e refinamento de stories
- Validação de critérios de aceitação
- Planejamento de sprint e priorização
- Aderência a processos e garantia de qualidade
- Integridade do ecossistema de documentação

**Operações Git**: Nenhuma (papel de PO é não-técnico em relação ao git)

**Nota**: @po valida requisitos e prioriza trabalho, não interage com git.

---

## Exemplos de Workflow

### Cenário 1: Desenvolvimento Padrão de Story

```
1. Usuário: "Iniciar Story 3.14: Agente GitHub DevOps"

2. @sm ativa:
   - Cria feature branch: `git checkout -b feature/3.14-github-devops-agent`
   - Passa para @dev

3. @dev ativa:
   - Implementa tarefas da story
   - Commita localmente: `git add . && git commit -m "feat: implement pre-push quality gate"`
   - Marca story: "Pronta para Revisão"
   - Notifica usuário: "Story completa. Ative @github-devops para fazer push"

4. @github-devops ativa:
   - Executa *pre-push (quality gates)
   - TODOS PASSAM → Apresenta resumo
   - Usuário confirma
   - Faz push: `git push -u origin feature/3.14-github-devops-agent`
   - Cria PR: `gh pr create --title "Story 3.14: GitHub DevOps Agent" --body "..."`
   - Reporta: "✅ Push realizado com sucesso. PR #123 criada: https://github.com/..."
```

### Cenário 2: Design de Schema de Banco de Dados

```
1. Usuário: "Projetar schema de banco de dados para autenticação de usuário"

2. @architect ativa:
   - Analisa requisitos do sistema
   - Decide: "Usar Supabase para persistência"
   - Delega: "Ativando @data-architect para design do schema"

3. @data-architect ativa:
   - Executa *design-schema
   - Cria tabelas: users, sessions, auth_providers
   - Projeta políticas RLS para segurança em nível de linha
   - Gera migração: `20251025_create_auth_schema.sql`
   - Commita localmente: `git add migrations/ && git commit -m "feat: add auth schema"`
   - Notifica: "Schema projetado. Ative @github-devops para fazer push da migração"

4. @github-devops ativa:
   - Executa *pre-push (quality gates)
   - Faz push da migração para o repositório
```

### Cenário 3: Criação de Release

```
1. Usuário: "Criar release v4.32.0"

2. @github-devops ativa:
   - Executa *version-check
   - Analisa commits desde v4.31.0
   - Recomenda: "Bump de versão MINOR (novas features, compatível com versões anteriores)"
   - Usuário confirma: v4.32.0
   - Executa *pre-push (quality gates)
   - Gera changelog a partir dos commits
   - Cria tag: `git tag v4.32.0`
   - Faz push: `git push && git push --tags`
   - Cria release no GitHub: `gh release create v4.32.0 --title "Release v4.32.0" --notes "..."`
   - Reporta: "✅ Release v4.32.0 criada: https://github.com/.../releases/v4.32.0"
```

---

## Arquitetura de Dados vs Arquitetura de Sistema

### Matriz de Comparação

| Responsabilidade | @architect | @data-architect |
|------------------|:----------:|:---------------:|
| **Seleção de tecnologia de banco de dados (visão de sistema)** | ✅ | 🤝 Colaborar |
| **Design de schema de banco de dados** | ❌ Delegar | ✅ Principal |
| **Otimização de queries** | ❌ Delegar | ✅ Principal |
| **Design de pipeline ETL** | ❌ Delegar | ✅ Principal |
| **Design de API para acesso a dados** | ✅ Principal | 🤝 Colaborar |
| **Cache em nível de aplicação** | ✅ Principal | 🤝 Consultar |
| **Otimizações específicas de banco (RLS, triggers)** | ❌ Delegar | ✅ Principal |
| **Workflows de ciência de dados** | ❌ Delegar | ✅ Principal |
| **Infraestrutura para banco de dados (escalabilidade, replicação)** | ✅ Principal | 🤝 Consultar |

### Padrão de Colaboração

**Pergunta**: "Qual banco de dados devemos usar?"
- **@architect responde**: Perspectiva de sistema (custo, implantação, habilidades da equipe, infraestrutura)
- **@data-architect responde**: Perspectiva de dados (padrões de query, escalabilidade, adequação do modelo de dados)
- **Resultado**: Recomendação combinada

**Pergunta**: "Projetar schema de banco de dados"
- **@architect**: Delega para @data-architect
- **@data-architect**: Projeta schema, cria migrações
- **@architect**: Integra schema no sistema (API, ORM, cache)

---

## Responsabilidades de Gerenciamento de Branch

### Branches Locais (@sm durante desenvolvimento)

**Responsabilidades**:
- Criar feature branches quando story inicia
- Gerenciar branches de trabalho do desenvolvedor
- Limpeza de branch local (deletar branches locais mergeadas)

**Comandos**:
```bash
# @sm pode executar:
git checkout -b feature/3.14-github-devops
git branch -d feature/old-branch
git merge feature/branch-to-integrate
```

### Branches Remotas (@github-devops para repositório)

**Responsabilidades**:
- Fazer push de branches para remoto
- Deletar branches remotas (limpeza)
- Gerenciar branches de release
- Proteger branch main/master

**Comandos**:
```bash
# SOMENTE @github-devops pode executar:
git push -u origin feature/3.14-github-devops
git push origin --delete feature/old-branch
gh pr create
gh pr merge
```

---

## Checklist de Implementação para Story 3.14

- [ ] **Criar Git Pre-Push Hook**
  - Localização: `.git/hooks/pre-push`
  - Conteúdo: Verificar `$AIOX_ACTIVE_AGENT`, bloquear se != "github-devops"
  - Tornar executável: `chmod +x .git/hooks/pre-push`

- [ ] **Atualizar Todas as Definições de Agentes** (DONE ✅)
  - [x] @architect - Adicionado `git_restrictions` e limites de colaboração
  - [x] @dev - Removido git push, adicionado redirecionamento de workflow
  - [x] @sm - Clarificado gerenciamento apenas de branch local
  - [x] @qa - Operações git somente leitura
  - [x] @github-devops - Criado com autoridade exclusiva de push
  - [x] @data-architect - Criado com especialização em dados

- [ ] **Atualizar Scripts de Ativação de Agentes**
  - Adicionar configuração de variável de ambiente: `AIOX_ACTIVE_AGENT={agent_id}`
  - Configurar `AIOX_GIT_PUSH_ALLOWED` apropriadamente

- [ ] **Configuração da IDE** (.claude/settings.json)
  - Adicionar `agents.{id}.blockedOperations` para cada agente
  - Documentar no guia de setup da IDE

- [ ] **Atualizações de Documentação**
  - [x] Matriz de responsabilidade de agentes (este documento)
  - [ ] Atualizar git-workflow-guide.md
  - [ ] Atualizar docs de onboarding de desenvolvedor

- [ ] **Testes**
  - Testar @dev tentando git push (deve ser bloqueado)
  - Testar @github-devops git push (deve funcionar)
  - Testar quality gates antes do push
  - Testar workflow de criação de PR

---

## Considerações Futuras

### Story 3.19: Camada de Memória (Condicional)
Se aprovada após auditoria de utilitários (Story 3.17):
- Camada de memória não precisa de restrições git (utilitário, não agente)
- Integração com agentes não muda limites de responsabilidade

### Squads
Se novos agentes forem adicionados via Squads:
- **Padrão**: SEM capacidade de git push
- **Processo de Exceção**: Deve ser explicitamente aprovado pela PO e justificado
- **Aplicação**: Pre-push hook bloqueia automaticamente a menos que ID do agente esteja na whitelist

---

## Resumo

**Pontos-Chave**:
1. ✅ Apenas @github-devops pode fazer push para repositório remoto (aplicado via git hooks)
2. ✅ @architect gerencia arquitetura de sistema, @data-architect gerencia camada de dados
3. ✅ @sm gerencia branches locais, @github-devops gerencia operações remotas
4. ✅ Quality gates são obrigatórios antes de qualquer push
5. ✅ Todos os agentes têm limites claros e documentados

**Aplicação**: Multi-camada (hooks + variáveis de ambiente + definições de agentes + config da IDE)

**Status**: ✅ Pronto para implementação na Story 3.14

---

*Documento mantido por @architect (Winston) e @po (Sarah)*
*Última revisão: 2025-10-25*
