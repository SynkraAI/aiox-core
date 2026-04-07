# Code Review Ping-Pong

**Três IAs revisam seu código em turnos. Elas discordam, corrigem, auditam — e só param quando está perfeito.**

---

## O Problema

Code review feito por humanos tem 3 falhas estruturais:

1. **Fadiga** — Depois de 200 linhas, o revisor começa a pular coisas. Estudos mostram que a taxa de detecção cai pela metade após 60 minutos de revisão.
2. **Viés social** — Ninguém quer ser "o chato" que bloqueia o PR do colega sênior na sexta-feira à noite.
3. **Ponto cego compartilhado** — Se toda a equipe pensa igual, todo mundo erra igual. Bugs de arquitetura passam porque ninguém questiona o padrão que todos seguem.

O resultado? PRs aprovados com "LGTM" que explodem em produção. Bugs que custam horas de debug que uma review decente teria pego em 2 minutos.

---

## A Solução

**Code Review Ping-Pong** é um protocolo onde três IAs colaboram através de arquivos estruturados. Uma revisa. Outra corrige. Uma terceira audita. Elas se alternam até o código atingir nota 10/10.

Não é uma ferramenta. É um **protocolo** — funciona com qualquer combinação de IAs que saibam ler e escrever arquivos Markdown.

### As Três IAs

| Papel | Agente | O que faz |
|-------|--------|-----------|
| **Revisor** | Codex (OpenAI) | Analisa o código, encontra bugs, atribui score de 1 a 10 |
| **Corretor** | Claude Code (Anthropic) | Lê os findings, implementa as correções no código real |
| **Auditor** | Gemini (Google) | Lê TODOS os rounds e identifica padrões que os outros dois perderam |

Por que três IAs diferentes e não a mesma três vezes? Pelo mesmo motivo que você quer diversidade num conselho de administração: **modelos diferentes têm pontos cegos diferentes**. O que o Codex não pega, o Claude pega. O que ambos perdem, o Gemini — com sua janela de contexto gigante — encontra ao ler o histórico completo.

---

## Como Funciona

### O Ciclo Básico

```
    CODEX                    CLAUDE CODE
      |                          |
      |--- "Encontrei 7 bugs" ->|
      |    (round-1.md)          |
      |                          |--- corrige o código real
      |                          |
      |<-- "7/7 corrigidos" ----|
      |    (round-1-fixed.md)    |
      |                          |
      |--- "Corrigiu 5, criou 2 novos" ->|
      |    (round-2.md)          |
      |                          |
      ...continua até 10/10...   |
      |                          |
      |--- "Perfeito. 10/10." --|
      |    (round-N.md)          |
      |                          |
                COMPLETE
```

Pense numa partida de tênis: a bola vai e volta entre revisor e corretor. Cada round é uma rebatida. O jogo só acaba quando o código está impecável.

### O Ciclo Completo (com Auditoria)

Opcionalmente, depois de cada correção, o Gemini entra como um **juiz de replay** — relê toda a partida e aponta o que os dois jogadores perderam:

```
CODEX ──review──> CLAUDE CODE ──fix──> GEMINI ──audit──> CODEX ──review──> ...
```

O auditor não repete o que o revisor já disse. Ele procura:
- **Padrões recorrentes** — o mesmo tipo de bug aparecendo em vários rounds (sintoma de um problema mais profundo)
- **Qualidade dos fixes** — o corretor está resolvendo a causa raiz ou só tapando buracos?
- **Regressões silenciosas** — uma correção criou um bug que a próxima review não percebeu?
- **Pontos cegos** — áreas do código que nunca foram revisadas
- **Drift de severidade** — o revisor está ficando mais leniente com o tempo?

---

## A Engenharia por Trás

O Ping-Pong não funciona por mágica — funciona por **contratos rigorosos**.

### 1. YAML é o Contrato. Markdown é a Explicação.

Cada round file tem duas camadas:

```yaml
---
protocol: code-review-ping-pong
type: review
round: 3
score: 7
verdict: CONTINUE
issues:
  - id: "3.1"
    severity: CRITICAL
    title: "SQL injection em user input"
    file: "src/auth/login.ts"
    line: 42
---

# Round 3 — Review

## Issue 3.1: SQL Injection em User Input

O campo `email` na linha 42 de `src/auth/login.ts` é interpolado
diretamente na query sem sanitização...
```

A máquina lê o YAML. O humano lê o Markdown. Os dois precisam bater — e o validador garante isso.

### 2. Git Anchoring — Ninguém Revisa Código Fantasma

Revisor e corretor gravam o `commit_sha` exato do código que estão olhando. Se o código muda entre rounds, o sistema avisa. Isso impede a situação clássica: "Corrigi tudo" / "Mas você corrigiu a versão errada".

### 3. Máquina de Estados — Zero Ambiguidade

Depois de cada turno, o agente atualiza um arquivo `next-step.md` com 7 campos obrigatórios:

```
current_round: 3
current_mode: FIX
cycle_state: WAITING_FOR_FIX
next_agent: CLAUDE CODE
next_mode: fix mode
expected_artifact: round-3-fixed.md
blocking_reason: 4 issues pendentes
```

Em qualquer momento, qualquer pessoa (ou IA) sabe exatamente: qual round estamos, quem joga agora, e o que precisa acontecer. Sem ambiguidade. Sem "me conta onde paramos".

### 4. Validador Estrutural

Um script Node.js valida cada arquivo antes de aceitar:

- **Review**: Score de 1-10, issues com IDs que batem com os headings Markdown
- **Fix**: Contagem `fixed + skipped = total` confere, cada issue tem resolução
- **Audit**: Issues do auditor começam com "A", processo de saúde de 1-10
- **Stages**: Máximo 1 stage ativo, IDs únicos, escopo não-vazio

Se o YAML diz "7 issues" mas o Markdown só descreve 5, o validador rejeita. Integridade forçada por design.

---

## Multi-Stage — Para Projetos Grandes

Revisar 50 arquivos de uma vez é como tentar reformar uma casa inteira num fim de semana. Não funciona.

O **modo multi-stage** divide a revisão em estágios independentes, cada um com seu escopo:

```yaml
stages:
  - id: 1
    slug: auth-module
    name: "Módulo de Autenticação"
    status: complete      # 10/10 alcançado
    files: [src/auth/*.ts]

  - id: 2
    slug: api-routes
    name: "Rotas da API"
    status: active        # revisão em andamento
    files: [src/routes/*.ts]

  - id: 3
    slug: database-layer
    name: "Camada de Banco"
    status: pending       # aguardando vez
    files: [src/db/*.ts]
```

Cada stage tem seu próprio ciclo ping-pong completo. Quando atinge 10/10, os rounds são arquivados e o próximo stage é ativado. Um `progress.yml` auto-gerado rastreia o andamento global.

```
Stage 1: auth-module      ✅ 10/10 (4 rounds, 15 issues)
Stage 2: api-routes       ▶  8/10  (round 2 em andamento)
Stage 3: database-layer   ⏸  pendente
─────────────────────────────────────
Progresso total: 33% (1/3 stages completos)
```

---

## Orquestrador Autônomo

Para quem quer apertar um botão e ir tomar café:

```bash
node orchestrate.cjs                     # Roda tudo até 10/10
node orchestrate.cjs --max-rounds 5      # Limita a 5 rounds
node orchestrate.cjs --with-audit        # Inclui Gemini após cada fix
node orchestrate.cjs --audit-every 2     # Audit a cada 2 fixes
node orchestrate.cjs --dry-run           # Mostra comandos sem executar
```

O orquestrador:
- Detecta automaticamente onde parou (lê `next-step.md`)
- Chama a CLI certa (Codex, Claude, Gemini) como subprocesso
- Valida cada arquivo gerado antes de prosseguir
- Para com código de saída `0` (perfeito), `1` (erro), ou `2` (max rounds sem perfeição)

---

## Guarda-Rails — O que Impede de Dar Errado

| Guarda | O que faz |
|--------|-----------|
| **Sem escopo = para** | REVIEW nunca inventa escopo. Se não tem story, session.md ou input explícito, ele para e pergunta. |
| **Já perfeito = para** | FIX não roda se a última review deu 10/10. Não existe "corrigir o que já está certo". |
| **Já corrigido = para** | Se o fix report já existe para aquele round, pede nova review em vez de sobrescrever. |
| **Git drift = avisa** | Se o commit mudou entre review e fix, avisa antes de continuar. |
| **Validador rejeita** | YAML inconsistente com Markdown é rejeitado automaticamente. |
| **Stage lock** | Multi-stage: só 1 stage ativo. Precisa arquivar o atual antes de avançar. |

---

## Números Típicos

| Métrica | Valor |
|---------|-------|
| Rounds até 10/10 | 3-5 (típico) |
| Issues por round | 3-8 |
| Tempo por round | 2-5 minutos (review) + 3-10 minutos (fix) |
| 7+ rounds | Sinal de escopo amplo demais |
| Custo por ciclo completo | ~$0.50-2.00 em tokens (varia com tamanho do escopo) |

---

## Anatomia de um Ciclo Real

**Round 1** — Codex encontra 7 issues (score 6/10)
- 2 CRITICAL: SQL injection, segredo exposto em log
- 3 HIGH: race condition, memória não liberada, validação ausente
- 2 MEDIUM: nome confuso, código duplicado

**Round 1 Fix** — Claude Code corrige tudo
- 7/7 fixed. Lint passa. Testes passam.

**Round 2** — Codex reavalia (score 8/10)
- 1 HIGH: o fix do race condition criou um deadlock
- 2 MEDIUM: novas oportunidades de melhoria reveladas pelas correções

**Round 2 Fix** — Claude Code corrige
- 3/3 fixed.

**Round 3** — Codex reavalia (score 10/10)
- "Código production-ready. Zero issues pendentes."

**Resultado**: 12 issues encontradas e resolvidas em 3 rounds, ~15 minutos. Incluindo 1 regressão que teria ido pra produção num review humano "LGTM".

---

## O que NÃO é

- **Não é um linter.** Linters checam estilo. Ping-Pong encontra bugs de lógica, vulnerabilidades de segurança, e problemas de arquitetura.
- **Não é CI/CD.** Não roda testes automaticamente (embora o FIX mode rode como quality check). É um protocolo de review, não um pipeline de deploy.
- **Não é dependente de vendor.** O protocolo é baseado em arquivos Markdown. Qualquer IA que lê/escreve Markdown pode participar. As CLIs do Codex, Claude e Gemini são a implementação atual, mas o formato é agnóstico.
- **Não substitui review humano.** Complementa. A IA pega os bugs mecânicos; o humano valida as decisões de design.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    PROTOCOLO PING-PONG                   │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  CODEX   │    │  CLAUDE  │    │  GEMINI  │          │
│  │ (Review) │───>│  (Fix)   │───>│ (Audit)  │──┐       │
│  └──────────┘    └──────────┘    └──────────┘  │       │
│       ^                                         │       │
│       └─────────────────────────────────────────┘       │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │         .code-review-ping-pong/             │        │
│  │                                             │        │
│  │  session.md        ← escopo                 │        │
│  │  round-N.md        ← review (YAML + MD)     │        │
│  │  round-N-fixed.md  ← fix report (YAML + MD) │        │
│  │  round-N-audit.md  ← audit (YAML + MD)      │        │
│  │  next-step.md      ← roteamento (7 campos)  │        │
│  │  validate.cjs      ← integridade estrutural  │        │
│  │  stages.yml        ← multi-stage (opcional)  │        │
│  │  progress.yml      ← progresso global        │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │         orchestrate.cjs                     │        │
│  │  Roda o ciclo completo autonomamente        │        │
│  │  Resume de onde parou via next-step.md      │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## Princípios de Design

1. **Arquivo > memória.** Tudo é persistido em arquivos. Se a sessão cair, o ciclo continua exatamente de onde parou.
2. **Contrato > promessa.** YAML frontmatter é validado automaticamente. Nenhum agente pode "esquecer" um campo obrigatório.
3. **Diversidade > repetição.** Três modelos diferentes encontram mais bugs que o mesmo modelo três vezes.
4. **Escopo explícito > escopo implícito.** Sem escopo definido, o sistema para. Nunca inventa o que deveria revisar.
5. **Incrementalidade > perfeição imediata.** O código não precisa ficar perfeito no primeiro round. Cada turno melhora um pouco. 3-5 rounds é o caminho normal.
6. **Compatibilidade reversa.** Multi-stage é opt-in. Sem `stages.yml`, tudo funciona como antes.
