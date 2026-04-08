---
name: tier-s-checklist
description: |
  Checklist completo de boas práticas para elevar qualquer aplicação ao nível Tier-S de produção.
  Cobre infraestrutura, observabilidade, segurança, UX, IA e deploy.
  Aplica-se a: APIs, apps web, bots, CLIs, microsserviços, qualquer stack.
license: Complete terms in LICENSE.txt
allowed-tools: Read, Write, Edit, Glob, Grep, Bash

version: 1.0.0
category: design
tags: [SKILL]
---

# Tier-S Checklist

> Guia definitivo de boas práticas para colocar qualquer aplicação em nível de produção profissional. Baseado em padrões reais de projetos production-ready e lições aprendidas em campo.

---

## Quick Start

```
/tier-s-checklist                    # Auditar projeto atual contra o checklist
/tier-s-checklist --category infra   # Auditar apenas infraestrutura
/tier-s-checklist --generate         # Gerar configs base para o projeto atual
```

---

## Quando Usar

| Cenário | Exemplo |
|---------|---------|
| Novo projeto saindo do MVP | "Vou colocar em produção, o que falta?" |
| Auditoria de projeto existente | "Quero elevar o nível desse app" |
| Pré-deploy | "Antes de lançar, confere o que tá faltando" |
| Onboarding em projeto legado | "Herdei esse projeto, como deixo profissional?" |
| Referência para decisões técnicas | "Qual a melhor prática pra logging?" |

---

## Categorias

1. [Observabilidade](#1-observabilidade) — ver o que acontece
2. [Infraestrutura](#2-infraestrutura) — onde e como roda
3. [Banco de Dados](#3-banco-de-dados) — dados seguros e performáticos
4. [Segurança](#4-segurança) — proteger tudo
5. [Qualidade de Código](#5-qualidade-de-código) — manter limpo
6. [Deploy e CI/CD](#6-deploy-e-cicd) — entregar com confiança
7. [UX e Interação](#7-ux-e-interação) — experiência do usuário
8. [Integração com IA](#8-integração-com-ia) — LLMs e agentes
9. [Resiliência](#9-resiliência) — sobreviver a falhas
10. [Documentação](#10-documentação) — quem vem depois entende

---

## 1. Observabilidade

> "Se você não consegue ver, não consegue consertar."

### 1.1 Error Tracking (Sentry)
**O que é:** Câmera de segurança que grava todo erro automaticamente.

**Por que importa:** Sem error tracking, erros em produção passam despercebidos. Você descobre quando o usuário reclama, não quando o erro acontece.

**Checklist:**
- ☐ Sentry (ou equivalente) configurado
- ☐ Source maps enviados para stack traces legíveis
- ☐ Alertas configurados (email, Slack, Telegram)
- ☐ Releases tagueadas para rastrear qual deploy quebrou
- ☐ Performance monitoring ativo (traces)
- ☐ Dados sensíveis filtrados (tokens, senhas)

**Implementação (Node.js):**
```bash
npm install @sentry/node
```
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filtrar dados sensíveis
    return event;
  },
});
```

---

### 1.2 Logging Estruturado
**O que é:** Trocar diário bagunçado (`console.log`) por registros organizados com data, nível, módulo e dados.

**Por que importa:** `console.log("erro")` não ajuda ninguém às 3h da manhã. Log estruturado permite filtrar, buscar e correlacionar problemas.

**Checklist:**
- ☐ Logger dedicado (Pino, Winston, Loguru) ao invés de `console.log`
- ☐ Níveis de log: debug, info, warn, error, fatal
- ☐ Formato JSON em produção (para ferramentas de análise)
- ☐ Formato legível em desenvolvimento (para humanos)
- ☐ Rotação de arquivos (por tamanho ou data)
- ☐ Compressão de logs antigos
- ☐ Correlação de requests (request ID em todos os logs de uma operação)
- ☐ Dados sensíveis NUNCA logados (tokens, senhas, PII)

**Implementação (Node.js com Pino):**
```bash
npm install pino pino-pretty
```
```typescript
import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: process.env.NODE_ENV !== "production"
    ? { target: "pino-pretty" }
    : undefined,
});

// Uso
logger.info({ userId, action: "task_created" }, "Task criada com sucesso");
logger.error({ err, eventId }, "Falha ao deletar evento");
```

---

### 1.3 Métricas (Prometheus + Grafana)
**O que é:** Painel de instrumentos do carro, mas para a aplicação. Mostra velocidade, temperatura, consumo, tudo em tempo real.

**Por que importa:** Logs dizem "o que aconteceu". Métricas dizem "como está agora" e "qual a tendência". Sem métricas, você voa no escuro.

**Checklist:**
- ☐ Endpoint `/metrics` expondo métricas Prometheus
- ☐ Métricas de negócio (mensagens processadas, tasks criadas, eventos agendados)
- ☐ Métricas de infra (latência de API, tempo de resposta, filas)
- ☐ Métricas de sistema (CPU, memória, disco via node-exporter)
- ☐ Dashboards Grafana configurados
- ☐ Alertas para anomalias (latência alta, erro rate > X%)

**Implementação (Node.js):**
```bash
npm install prom-client
```
```typescript
import { Registry, Counter, Histogram, collectDefaultMetrics } from "prom-client";

const registry = new Registry();
collectDefaultMetrics({ register: registry });

const messagesProcessed = new Counter({
  name: "bot_messages_total",
  help: "Total messages processed",
  labelNames: ["type"], // idea, event, task, chat
  registers: [registry],
});

const apiLatency = new Histogram({
  name: "api_latency_seconds",
  help: "External API call duration",
  labelNames: ["provider"], // openai, google, groq
  registers: [registry],
});
```

---

### 1.4 Health Check Completo
**O que é:** Check-up médico automático que verifica se todas as partes da aplicação estão funcionando.

**Por que importa:** Um `/health` que só retorna `{ok: true}` é inútil. O banco pode estar fora e o endpoint ainda diz que está tudo bem.

**Checklist:**
- ☐ Verifica conectividade com banco de dados
- ☐ Verifica conectividade com Redis/cache
- ☐ Verifica APIs externas (Google, OpenAI, etc.)
- ☐ Verifica status das filas (BullMQ, etc.)
- ☐ Retorna tempo de resposta de cada dependência
- ☐ Retorna versão da aplicação e uptime
- ☐ HTTP 200 se tudo OK, 503 se algo crítico falhou

**Implementação:**
```typescript
app.get("/health", async (req, res) => {
  const checks = {
    database: await checkDb(),      // tenta um SELECT 1
    redis: await checkRedis(),      // tenta um PING
    google: await checkGoogle(),    // tenta listar calendários
    uptime: process.uptime(),
    version: pkg.version,
  };
  const healthy = checks.database && checks.redis;
  res.status(healthy ? 200 : 503).json(checks);
});
```

---

## 2. Infraestrutura

> "Infraestrutura boa é invisível. Só aparece quando falta."

### 2.1 Docker + Docker Compose
**O que é:** Empacotar a aplicação inteira numa caixa portátil que funciona em qualquer lugar.

**Por que importa:** "Na minha máquina funciona" deixa de ser problema. O ambiente é idêntico em dev, staging e produção.

**Checklist:**
- ☐ Dockerfile otimizado (multi-stage build, layer caching)
- ☐ `.dockerignore` configurado (node_modules, .env, .git)
- ☐ Usuário não-root dentro do container
- ☐ docker-compose com todos os serviços (app, db, redis, etc.)
- ☐ Volumes para persistência (dados do banco, logs)
- ☐ Networks separadas (app, monitoring)
- ☐ Limites de memória e CPU definidos

**Dockerfile modelo (Node.js):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
USER app
CMD ["node", "dist/index.js"]
```

---

### 2.2 Variáveis de Ambiente
**O que é:** Toda configuração que muda entre ambientes (dev, staging, prod) vive em variáveis de ambiente, nunca no código.

**Checklist:**
- ☐ Validação com schema (Zod, Joi, Pydantic)
- ☐ `.env.example` com todas as variáveis documentadas
- ☐ `.env` no `.gitignore` (NUNCA commitado)
- ☐ Secrets em vault (AWS Secrets Manager, Doppler) em produção
- ☐ Valores padrão sensatos para desenvolvimento
- ☐ Falha rápida se variável obrigatória estiver faltando

---

### 2.3 Graceful Shutdown
**O que é:** Quando a aplicação recebe sinal pra parar, ela termina o que está fazendo antes de desligar, em vez de cortar no meio.

**Checklist:**
- ☐ Handler para SIGINT e SIGTERM
- ☐ Para de aceitar novas requisições
- ☐ Espera requisições em andamento terminarem
- ☐ Fecha conexões com banco, Redis, filas
- ☐ Timeout de segurança (force kill após X segundos)
- ☐ Log de shutdown (para saber se foi limpo)

---

## 3. Banco de Dados

> "Dados são o ativo mais valioso. Trate com respeito."

### 3.1 Connection Pooling
**O que é:** Reutilizar conexões com o banco em vez de abrir uma nova a cada requisição. Como manter a linha do telefone aberta.

**Checklist:**
- ☐ Pool configurado com min/max connections
- ☐ Idle timeout para liberar conexões ociosas
- ☐ PgBouncer ou equivalente para alto volume
- ☐ Monitoramento de conexões ativas

---

### 3.2 Migrations
**O que é:** Controle de versão do banco de dados. Cada mudança no schema é um arquivo versionado que pode ser aplicado ou revertido.

**Checklist:**
- ☐ Ferramenta de migration configurada (Drizzle, Prisma, Alembic, Flyway)
- ☐ Migrations versionadas e commitadas no git
- ☐ Rollback testado (consegue voltar uma migration?)
- ☐ Migration roda automaticamente no deploy
- ☐ Nunca alterar banco manualmente em produção

---

### 3.3 Backup Automático
**O que é:** Tirar foto do banco automaticamente em intervalos regulares. Se der ruim, restaura a foto.

**Checklist:**
- ☐ Backup automático (cron ou serviço dedicado)
- ☐ Frequência adequada (30min para crítico, diário para baixo volume)
- ☐ Retenção definida (7 dias diários, 4 semanais, 6 mensais)
- ☐ Backup testado (consegue restaurar?)
- ☐ Backup armazenado em local diferente do servidor (S3, outro servidor)
- ☐ Compressão ativa
- ☐ Alerta se backup falhar

**Implementação (PostgreSQL):**
```bash
# Cron job diário
0 3 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +%Y%m%d).sql.gz

# Ou via Docker service (postgres-backup-local)
```

---

### 3.4 Índices e Performance
**Checklist:**
- ☐ Índices nas colunas usadas em WHERE e JOIN
- ☐ Índice composto para queries frequentes
- ☐ EXPLAIN ANALYZE nas queries lentas
- ☐ Monitoramento de queries lentas (pg_stat_statements)

---

## 4. Segurança

> "Segurança não é feature. É fundação."

### 4.1 Secrets Management
**Checklist:**
- ☐ Credenciais NUNCA no código ou git
- ☐ `.env` no `.gitignore`
- ☐ Tokens e API keys com permissões mínimas
- ☐ Rotação de secrets periódica
- ☐ Secrets diferentes por ambiente (dev, staging, prod)

---

### 4.2 Rate Limiting
**O que é:** Porteiro que controla quantas requisições por segundo são aceitas. Protege contra abuso e custos inesperados.

**Checklist:**
- ☐ Rate limit por usuário/IP
- ☐ Rate limit em endpoints de API
- ☐ Rate limit em chamadas a APIs externas (OpenAI, Google)
- ☐ Resposta 429 com header Retry-After
- ☐ Rate limit mais restritivo em operações custosas (IA, uploads)

---

### 4.3 Input Validation
**Checklist:**
- ☐ Validar TODA entrada do usuário (Zod, Joi)
- ☐ Sanitizar antes de inserir no banco
- ☐ Limitar tamanho de inputs (texto, arquivos)
- ☐ Proteger contra injection (SQL, XSS, command)

---

### 4.4 Autenticação e Autorização
**Checklist:**
- ☐ Tokens de API com escopo mínimo
- ☐ OAuth tokens com refresh automático
- ☐ Admin panel com RBAC (role-based access control)
- ☐ Sessões com expiração
- ☐ Logs de acesso administrativo

---

## 5. Qualidade de Código

> "Código limpo não é luxo. É a diferença entre manter e reescrever."

### 5.1 Linting e Formatação
**Checklist:**
- ☐ Linter configurado (ESLint, Ruff, Clippy)
- ☐ Formatter automático (Prettier, Black, Ruff)
- ☐ Pre-commit hooks (lint-staged + husky)
- ☐ Config compartilhada no repositório (não local)

---

### 5.2 Type Safety
**Checklist:**
- ☐ TypeScript strict mode (ou equivalente)
- ☐ `noEmit` check no CI
- ☐ Evitar `any` — usar tipos explícitos
- ☐ Schemas de validação runtime (Zod) para dados externos

---

### 5.3 Testes
**Checklist:**
- ☐ Testes unitários para lógica de negócio
- ☐ Testes de integração para fluxos críticos
- ☐ Testes rodam no CI antes de merge
- ☐ Cobertura mínima definida (70%+ para código novo)
- ☐ Mocks para serviços externos (APIs, banco)

---

### 5.4 Estrutura de Projeto
**Checklist:**
- ☐ Separação clara: handlers / services / database / utils
- ☐ Um módulo por domínio (calendar, tasks, ideas)
- ☐ Cada módulo com service.ts (lógica) + handlers.ts (interface)
- ☐ Configurações centralizadas
- ☐ Constantes extraídas (não hardcoded)

---

## 6. Deploy e CI/CD

> "Se o deploy dá medo, você está fazendo errado."

### 6.1 CI/CD Pipeline
**O que é:** Assistente automático que confere o código e faz deploy sem intervenção manual.

**Checklist:**
- ☐ Lint + type check em todo push
- ☐ Testes automáticos em todo PR
- ☐ Build automático
- ☐ Deploy automático para staging em merge para main
- ☐ Deploy para produção com aprovação manual (ou automático se testes passam)
- ☐ Rollback fácil (um comando)

**GitHub Actions modelo:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
```

---

### 6.2 Versionamento
**Checklist:**
- ☐ Conventional Commits (feat:, fix:, chore:)
- ☐ Changelog automático (ou manual por release)
- ☐ Tags de versão no git
- ☐ Commit de rollback identificável

---

### 6.3 Deploy Seguro
**Checklist:**
- ☐ Backup antes de deploy
- ☐ Migration roda antes do app reiniciar
- ☐ Health check confirma que o app subiu
- ☐ Rollback em menos de 1 minuto
- ☐ Zero-downtime deployment (PM2 reload, blue-green, rolling)

---

## 7. UX e Interação

> "A melhor interface é a que o usuário nem percebe."

### 7.1 Bots Telegram
**Checklist:**
- ☐ InlineKeyboard em TODA resposta que exige ação (NUNCA pedir pra digitar quando pode clicar)
- ☐ Botões contextuais baseados na ação realizada
- ☐ Mensagem de "processando" para operações longas
- ☐ Fallback amigável quando não entende
- ☐ Menu principal acessível com /menu
- ☐ Formatação visual: emojis de status, checklists, negrito
- ☐ Markdown compatível com Telegram (apenas *bold*, _italic_, code inline)
- ☐ Confirmação antes de ações destrutivas (deletar, cancelar)
- ☐ Mensagem de erro com sugestão de próximo passo

---

### 7.2 Geral (Apps e APIs)
**Checklist:**
- ☐ Feedback imediato para toda ação do usuário
- ☐ Estados de loading claros
- ☐ Mensagens de erro úteis (o que deu errado + o que fazer)
- ☐ Ações reversíveis quando possível (undo)
- ☐ Consistência visual (mesmo padrão em todo o app)

---

## 8. Integração com IA

> "IA é uma ferramenta poderosa que precisa de guardrails."

### 8.1 LLM / Agent
**Checklist:**
- ☐ Multi-provider com fallback (se OpenAI cair, usa Gemini)
- ☐ System prompt conciso e estruturado (LLMs menores se perdem com prompts longos)
- ☐ Pré-processamento de inputs (resolver datas relativas, normalizar texto)
- ☐ Pós-processamento de outputs (validar datas, corrigir formatos)
- ☐ Anti-hallucination: forçar uso de tools ao invés de inventar dados
- ☐ Max rounds/timeout para evitar loops infinitos
- ☐ Logging de tool calls para debug
- ☐ Custo monitorado (tokens consumidos por provider)

---

### 8.2 Tool Calling
**Checklist:**
- ☐ Cada tool com descrição clara e exemplos
- ☐ Validação de argumentos antes de executar
- ☐ Resultado estruturado (não texto livre)
- ☐ Erro retornado como dado (para o LLM tentar outra abordagem)
- ☐ Tools idempotentes quando possível

---

### 8.3 Contexto e Memória
**Checklist:**
- ☐ Contexto injetado com dados atuais (data, timezone, estado do usuário)
- ☐ Dados em formato que o LLM consiga usar (ISO para datas, não texto ambíguo)
- ☐ Limitar contexto para não estourar token limit
- ☐ Estado de conversa persistido (Redis ou banco, não memória)

---

## 9. Resiliência

> "Não é SE vai falhar. É QUANDO. Esteja preparado."

### 9.1 Fallbacks
**Checklist:**
- ☐ API principal fora? Usar provider alternativo
- ☐ Cache indisponível? Funcionar sem cache (mais lento, mas funciona)
- ☐ Fila cheia? Processar inline como fallback
- ☐ Feature flag para desligar features problemáticas sem redeploy

---

### 9.2 Retry e Circuit Breaker
**Checklist:**
- ☐ Retry com exponential backoff para APIs externas
- ☐ Circuit breaker para evitar cascata de falhas
- ☐ Timeout em toda chamada externa
- ☐ Dead letter queue para mensagens que falharam repetidamente

---

### 9.3 Automação Proativa
**Checklist:**
- ☐ Nudges para itens parados (tasks, ideias no inbox)
- ☐ Briefings automáticos (matinal, semanal)
- ☐ Alertas contextuais (deadline chegando, conflito detectado)
- ☐ Max 1 notificação por tipo por dia (não spammar)

---

## 10. Documentação

> "Código sem doc é presente pra você do futuro, e ele vai te odiar."

**Checklist:**
- ☐ README com setup em menos de 5 comandos
- ☐ `.env.example` completo e comentado
- ☐ Arquitetura documentada (diagrama ou texto)
- ☐ CLAUDE.md para assistentes de IA
- ☐ Handoff docs para sessões de trabalho
- ☐ Changelog mantido

---

## Checklist Resumido por Fase

### MVP (lançar rápido)
- ☑ Env validation
- ☑ Graceful shutdown
- ☑ `.env.example`
- ☑ Linter + formatter
- ☑ Health check básico

### Produção (usuários reais)
- ☐ Sentry error tracking
- ☐ Logging estruturado
- ☐ Backup automático
- ☐ Rate limiting
- ☐ Health check completo
- ☐ CI/CD básico

### Escala (crescimento)
- ☐ Prometheus + Grafana
- ☐ Docker + docker-compose
- ☐ Connection pooling
- ☐ Admin panel
- ☐ Data export
- ☐ Multi-idioma

### Tier-S (excelência)
- ☐ Tudo acima
- ☐ Zero-downtime deploy
- ☐ Distributed tracing
- ☐ Chaos testing
- ☐ SLA definido e monitorado
- ☐ Runbooks para incidentes
