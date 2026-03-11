# Exemplo 2: Retomar Projeto Brownfield

Este exemplo mostra como usar o Navigator para retomar trabalho em um projeto existente apos uma pausa ou perda de contexto.

---

## Contexto

**Projeto:** Sistema CRM legado (brownfield)
**Situacao:** Voltou apos 2 semanas de ferias, esqueceu status atual
**Codebase:** 50,000 linhas, multiplas features em progresso
**Time:** 3 desenvolvedores
**Objetivo:** Retomar desenvolvimento sem perder tempo

---

## Problema: Perda de Contexto

Voce volta ao seu projeto e tem estas questoes:
- ❓ Em qual fase estou?
- ❓ Quais stories estao em progresso?
- ❓ Qual minha proxima task?
- ❓ Existem blockers?
- ❓ O que completei antes da pausa?

**Abordagem manual levaria:** 30-60 minutos (checando git log, lendo docs, revisando stories)

**Abordagem Navigator:** 30 segundos

---

## Solucao: Usar Navigator

### Passo 1: Ativar Navigator

```bash
@navigator
```

**Output:**
```
🧭 Navigator Agent ready
```

---

### Passo 2: Detectar Fase Atual

```bash
*where-am-i
```

**Navigator analisa:**
1. Escaneia diretorio do projeto por arquivos de output
2. Compara com pipeline do roadmap
3. Faz parse do status da story do front-matter
4. Identifica blockers

**Output:**
```
📍 CRM System - Status Atual

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Fase Atual: 7 — Desenvolvimento (67% completo)

✅ Fases Completas:
  1. Pesquisa ✓
  2. PRD ✓
  3. Arquitetura ✓
  4. Epicos ✓
  5. Stories ✓
  6. Validacao ✓

🔄 Stories Ativas (3):
  Story 7.4: API de gerenciamento de contatos (in-progress)
  Story 7.7: Integracao de email (in-progress)
  Story 7.9: Geracao de relatorios (blocked)

✅ Stories Completas (6):
  Story 7.1: Autenticacao de usuario ✓
  Story 7.2: Widgets de dashboard ✓
  Story 7.3: Migracoes de banco de dados ✓
  Story 7.5: Tracking de leads ✓
  Story 7.6: Logging de atividades ✓
  Story 7.8: Sistema de notificacoes ✓

⏳ Stories Pendentes (2):
  Story 7.10: Funcionalidade de exportacao
  Story 7.11: UI responsiva mobile

🚫 Blockers (1):
  Story 7.9 bloqueada: Aguardando @data-engineer criar views de agregacao

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Proximos Passos:
  1. Continuar Story 7.4 (API de gerenciamento de contatos)
  2. Completar Story 7.7 (Integracao de email)
  3. Desbloquear Story 7.9 (perguntar status ao @data-engineer)

💡 Recomendado: Retomar com @dev
  Comando: @dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Tempo gasto:** 3 segundos ✨

---

### Passo 3: Revisar Ultimo Checkpoint

Para ver no que estava trabalhando antes da pausa:

```bash
*checkpoint --list
```

**Output:**
```
📸 Checkpoints Disponiveis (12 total)

Recentes:
  1. cp-7-auto-20260201-173045.json (2 semanas atras)
     Fase: 7 (Desenvolvimento) - 58% completo
     Git: d4e5f6g
     Descricao: "Completada Story 7.6 (Logging de atividades)"

  2. cp-7-manual-20260131-144522.json (2 semanas atras)
     Fase: 7 (Desenvolvimento) - 50% completo
     Git: a1b2c3d
     Descricao: "Checkpoint mid-phase antes de ferias"

  3. cp-6-auto-20260128-091233.json (3 semanas atras)
     Fase: 6 (Validacao) - 100% completo
     Git: 9z8y7x6
     Descricao: "Todas stories validadas por @po"

💡 Ultimo checkpoint mostra que estava 58% na fase de Desenvolvimento
```

---

### Passo 4: Carregar Contexto Detalhado

```bash
*status-report --detailed
```

**Output (arquivo markdown gerado):**
```markdown
# CRM System - Relatorio de Status Detalhado
Gerado: 2026-02-15 09:30:00

## Resumo Executivo
- **Fase:** 7/10 (Desenvolvimento)
- **Progresso:** 67% completo
- **Velocity:** 1.5 stories/dia (ultimos 7 dias)
- **Blockers:** 1 (Story 7.9)
- **ETA para Fase 8:** 3 dias

## Trabalho Ativo

### Story 7.4: API de Gerenciamento de Contatos (Em Progresso)
**Owner:** @dev
**Iniciada:** 2026-02-01
**Arquivo:** docs/stories/story-7.4.md
**Status:** 75% completo

**Completado:**
- ✅ Schema de banco de dados para contatos
- ✅ Endpoints CRUD (GET, POST, PUT)
- ✅ Middleware de validacao

**Restante:**
- ⏳ Endpoint DELETE com logica de cascade
- ⏳ Funcionalidade de busca/filtro
- ⏳ Testes unitarios (80% coverage)

**Proxima Acao:** Implementar DELETE com estrategia de soft-delete

---

### Story 7.7: Integracao de Email (Em Progresso)
**Owner:** @dev
**Iniciada:** 2026-02-03
**Arquivo:** docs/stories/story-7.7.md
**Status:** 40% completo

**Completado:**
- ✅ Configuracao SMTP
- ✅ Sistema de templates de email

**Restante:**
- ⏳ Endpoint de envio de email
- ⏳ Fila de emails com logica de retry
- ⏳ Tracking (abertos, clicados)

**Proxima Acao:** Implementar endpoint de envio com validacao

---

### Story 7.9: Geracao de Relatorios (Bloqueada)
**Owner:** @dev
**Iniciada:** 2026-02-04
**Arquivo:** docs/stories/story-7.9.md
**Status:** BLOCKED

**Blocker:** Aguardando views de agregacao de banco de dados do @data-engineer
**Bloqueado Desde:** 2026-02-04 (11 dias)

**Acao Necessaria:** Chamar @data-engineer no Slack

---

## Mudancas Git Desde Ultimo Checkpoint

```bash
# Commits desde d4e5f6g (ultimo checkpoint)
- e7f8g9h: feat: adicionar middleware de validacao de contatos [Story 7.4]
- f9g0h1i: feat: implementar templates de email [Story 7.7]
- g1h2i3j: test: adicionar testes de API de contatos [Story 7.4]
- h3i4j5k: fix: variaveis env de configuracao de email [Story 7.7]
```

**Arquivos Modificados:** 23 arquivos (+847, -234)

---

## Analise de Velocity

| Data | Stories Completas | Pontos |
|------|------------------|--------|
| 2026-02-14 | 0 (ferias) | 0 |
| 2026-02-13 | 0 (ferias) | 0 |
| ...        | ...          | ... |
| 2026-02-01 | 1 (Story 7.6) | 5 |
| 2026-01-31 | 2 (7.3, 7.5) | 8 |

**Media:** 1.5 stories/dia (pre-ferias)

---

## Recomendacoes

1. **Prioridade 1:** Completar Story 7.4 (75% pronto, vitoria rapida)
2. **Prioridade 2:** Continuar Story 7.7 (40% pronto)
3. **Prioridade 3:** Desbloquear Story 7.9 (chamar @data-engineer)

**Tempo Estimado para Fase 8 (QA):** 3 dias (se nao houver novos blockers)
```

---

### Passo 5: Retomar Desenvolvimento

Agora voce tem contexto completo. Retomar trabalho:

```bash
@dev
```

**Dev agent carrega:**
```
🔧 Dev Agent ready

📂 Carregando contexto do Navigator...

✅ Contexto carregado:
  - Fase atual: Desenvolvimento (67%)
  - Stories ativas: 3
  - Proxima task: Completar endpoint DELETE na Story 7.4

💡 Resumo rapido:
  Voce estava implementando a API de Gerenciamento de Contatos (Story 7.4).
  Ultimo completado: Middleware de validacao
  Proximo: Endpoint DELETE com soft-delete

Pronto para codar! 🚀
```

---

## Passo 6: Lidar com Blocker

Desbloquear Story 7.9:

```bash
@navigator
*auto-navigate --resolve-blockers
```

**Output:**
```
🚫 Blocker detectado: Story 7.9

Issue: Views de agregacao de banco de dados nao criadas
Owner: @data-engineer
Bloqueado desde: 11 dias

💡 Acoes sugeridas:
  1. Chamar @data-engineer via Slack
  2. Oferecer pair programming nas views
  3. Criar ticket na ferramenta de gerenciamento de projeto

📝 Mensagem template:
  "Oi @data-engineer! Story 7.9 (Geracao de Relatorios) esta bloqueada
   aguardando as views de agregacao. Pode dar uma ETA ou vamos fazer
   pair programming nisso? Ja faz 11 dias. Valeu!"
```

---

## Passo 7: Continuar Desenvolvimento

Trabalhar em stories ativas ate fase completa:

```bash
# Apos completar Story 7.4
@dev *complete-story 7.4

# Apos completar Story 7.7
@dev *complete-story 7.7

# Checar progresso
@navigator *where-am-i
```

**Output:**
```
📍 Fase Atual: 7 — Desenvolvimento (92% completo)

11/12 stories completas

Restante: Story 7.11 (UI responsiva mobile)

🎯 Proximo: Completar Story 7.11 para avancar para fase QA
```

---

## Resultados

**Antes do Navigator:**
- ❌ 30-60 minutos lendo git logs e docs
- ❌ Confusao sobre o que trabalhar
- ❌ Risco de perder blockers
- ❌ Incerteza sobre progresso

**Depois do Navigator:**
- ✅ 30 segundos para pegar contexto completo
- ✅ Proximas acoes claras identificadas
- ✅ Blockers surfados imediatamente
- ✅ Confianca no status do projeto

**Tempo Economizado:** ~45 minutos
**Carga Mental:** Significativamente reduzida
**Produtividade:** Maior (pulou direto para codar)

---

## Avancado: Handoff de Time

Se multiplos desenvolvedores, criar documento de handoff:

```bash
@navigator
*status-report --format handoff --team
```

**Gera:**
```markdown
# CRM Team Handoff - Semana de 15 de Fev

## Dev 1 (Voce)
- Continuar Story 7.4 (API de Contatos)
- Completar Story 7.7 (Integracao de email)
- Owner da conclusao da Fase 7

## Dev 2
- Desbloquear Story 7.9 (trabalhar com @data-engineer)
- Comecar Story 7.10 (Funcionalidade de exportacao)

## Dev 3
- Completar Story 7.11 (Responsividade mobile)
- Preparar para Fase 8 (setup de QA)

## Blockers do Time
- Story 7.9: Views de banco de dados (11 dias)

## Objetivos do Time
- Completar Fase 7 ate fim de semana (19 de Fev)
- Entrar na Fase 8 (QA) na segunda (22 de Fev)
```

---

## Principais Aprendizados

1. **Nunca perca contexto novamente** - Navigator lembra por voce
2. **Retomar em segundos** - De ferias ou pausas de fim de semana
3. **Blockers surgem automaticamente** - Sem surpresas
4. **Alinhamento de time** - Todo mundo sabe o status atual
5. **Tracking de velocity** - Estimativa de progresso baseada em dados

---

## Dicas Pro

- Rode `*where-am-i` toda manha como ritual
- Crie checkpoints manuais antes de mudancas grandes
- Use `*status-report` para reunioes semanais de time
- Configure post-commit hooks para checkpoints automaticos
- Compartilhe link do roadmap com stakeholders

---

*Exemplo completado em 2026-02-15 usando Navigator v1.0.0*
