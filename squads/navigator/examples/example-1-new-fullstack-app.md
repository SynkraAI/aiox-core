# Exemplo 1: Novo App Fullstack (Plataforma E-commerce)

Este exemplo mostra como usar o Navigator para configurar e navegar por um projeto fullstack de e-commerce completo do zero.

---

## Contexto

**Projeto:** Plataforma de e-commerce com frontend Next.js e backend Node.js
**Features:** Catalogo de produtos, carrinho de compras, checkout, gerenciamento de pedidos
**Time:** Desenvolvedor solo
**Timeline:** 8 semanas

---

## Passo 1: Ativar Navigator

```bash
@navigator
```

**Output:**
```
🧭 Navigator Agent ready

Available commands:
  *map-project - Map new project from description
  *where-am-i - Detect current phase
  *auto-navigate - Autonomous navigation
  ...
```

---

## Passo 2: Mapear o Projeto

```bash
*map-project
```

**Navigator pergunta:**
```
📋 Describe your project:
```

**Seu input:**
```
Plataforma de e-commerce com as seguintes features:

Frontend:
- Next.js 14 com App Router
- Listagem de produtos com filtros e busca
- Carrinho de compras com persistencia local
- Fluxo de checkout com integracao Stripe
- Autenticacao de usuario (email/senha)

Backend:
- Node.js + Express API
- Banco de dados PostgreSQL
- Endpoints RESTful para produtos, pedidos, usuarios
- Autenticacao JWT
- Processamento de pagamento com Stripe

Tech Stack:
- Frontend: Next.js, TypeScript, Tailwind CSS, Zustand
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL
- Deployment: Vercel (frontend), Railway (backend)
```

**Navigator gera:**
```
✅ Roadmap gerado!

📁 Salvo em:
  - .aios/navigator/ecommerce-platform/roadmap.md
  - docs/roadmap.md (copia local)

📊 10 fases mapeadas:
  1. Pesquisa → @analyst
  2. PRD → @pm
  3. Arquitetura → @architect
  4. Epicos → @pm
  5. Stories → @sm
  6. Validacao → @po
  7. Desenvolvimento → @dev
  8. QA & Testes → @qa
  9. Fix Loop → @dev
  10. Deploy → @devops

🚀 Ponto de partida detectado: Fase 1 (Pesquisa)
```

---

## Passo 3: Revisar o Roadmap Gerado

```bash
*show-roadmap
```

**Output (trecho):**
```yaml
---
project_name: ecommerce-platform
version: 1.0.0
created_at: 2026-02-15T14:30:00Z
phases:
  - id: 1
    name: Pesquisa
    agent: "@analyst"
    icon: "🔍"
    command: "*research"
    description: "Market research, competitor analysis, user personas"
    inputs: []
    outputs:
      - "docs/research/market-analysis.md"
      - "docs/research/competitor-analysis.md"
      - "docs/research/user-personas.md"
    next_phase: 2

  - id: 2
    name: PRD
    agent: "@pm"
    icon: "📋"
    command: "*create-prd"
    description: "Product Requirements Document"
    inputs:
      - "docs/research/**/*.md"
    outputs:
      - "docs/prd/prd.yaml"
    next_phase: 3

  # ... fases 3-10
---
```

---

## Passo 4: Comecar Fase 1 (Pesquisa)

```bash
*auto-navigate
```

**Output do Navigator:**
```
📍 Fase Atual: 1 — Pesquisa (0% completo)
🤖 Proximo Agent: @analyst

🎯 Comando sugerido:
  @analyst *research

💡 O que fazer:
  1. Pesquisar tendencias de mercado de e-commerce
  2. Analisar competidores (Shopify, WooCommerce, etc.)
  3. Definir user personas (compradores, vendedores, admins)

📂 Outputs esperados:
  - docs/research/market-analysis.md
  - docs/research/competitor-analysis.md
  - docs/research/user-personas.md
```

**Executar:**
```bash
@analyst
*research
```

---

## Passo 5: Completar Fase 1

Depois que @analyst completa a pesquisa, checar progresso:

```bash
@navigator
*where-am-i
```

**Output:**
```
📍 Fase Atual: 1 — Pesquisa (100% completo) ✅

📂 Outputs encontrados:
  ✅ docs/research/market-analysis.md
  ✅ docs/research/competitor-analysis.md
  ✅ docs/research/user-personas.md

✨ Pronto para avancar para Fase 2
```

---

## Passo 6: Criar Checkpoint (Opcional)

```bash
*checkpoint
```

**Output:**
```
📸 Checkpoint criado!

ID: cp-1-manual-20260215-143500
Path: .aios/navigator/ecommerce-platform/checkpoints/cp-1-manual-20260215-143500.json

Snapshot inclui:
  - Phase: 1 (Pesquisa)
  - Completion: 100%
  - Outputs: 3 arquivos
  - Git commit: a1b2c3d
```

---

## Passo 7: Avancar para Fase 2 (PRD)

```bash
*auto-navigate
```

**Output:**
```
📍 Fase Atual: 2 — PRD (0% completo)
🤖 Proximo Agent: @pm

🎯 Comando sugerido:
  @pm *create-prd

💡 O que fazer:
  1. Revisar outputs da pesquisa
  2. Definir features e prioridades do produto
  3. Criar documento PRD

📂 Outputs esperados:
  - docs/prd/prd.yaml
```

**Executar:**
```bash
@pm
*create-prd
```

---

## Passo 8: Continuar Pelo Pipeline

Repetir o ciclo para as fases restantes:

**Fase 3:** @architect projeta arquitetura
**Fase 4:** @pm quebra em epics
**Fase 5:** @sm cria user stories
**Fase 6:** @po valida stories
**Fase 7:** @dev implementa codigo
**Fase 8:** @qa roda testes
**Fase 9:** @dev corrige issues (se houver)
**Fase 10:** @devops faz deploy para producao

---

## Passo 9: Acompanhar Progresso a Qualquer Momento

Durante o desenvolvimento, checar status:

```bash
@navigator
*status-report
```

**Output:**
```
📊 E-commerce Platform - Status Report
Gerado: 2026-02-15 16:45:00

📍 Fase Atual: 7 — Desenvolvimento (42% completo)

✅ Fases Completas:
  1. Pesquisa (100%)
  2. PRD (100%)
  3. Arquitetura (100%)
  4. Epicos (100%)
  5. Stories (100%)
  6. Validacao (100%)

🔄 Em Progresso:
  7. Desenvolvimento (42%)
     - ✅ Story 7.1: API de listagem de produtos (done)
     - ✅ Story 7.2: API de carrinho de compras (done)
     - 🔄 Story 7.3: API de checkout (in progress)
     - ⏳ Story 7.4: API de autenticacao de usuario (pending)
     - ⏳ Story 7.5: Componentes frontend (pending)

⏳ Fases Pendentes:
  8. QA & Testes
  9. Fix Loop (se necessario)
  10. Deploy

🚫 Blockers: Nenhum

📅 Proximos Passos:
  1. Completar Story 7.3 (API checkout)
  2. Implementar Story 7.4 (autenticacao usuario)
  3. Construir componentes frontend (Story 7.5)
  4. Avancar para Fase 8 (QA)
```

---

## Passo 10: Deploy Final

Depois que QA passa:

```bash
@navigator
*auto-navigate
```

**Output:**
```
📍 Fase Atual: 10 — Deploy (0% completo)
🤖 Proximo Agent: @devops

🎯 Comando sugerido:
  @devops *deploy

💡 O que fazer:
  1. Push do codigo para GitHub
  2. Deploy frontend no Vercel
  3. Deploy backend no Railway
  4. Configurar variaveis de ambiente
  5. Rodar smoke tests de producao

📂 Outputs esperados:
  - .github/workflows/deploy.yml
  - URLs de producao no log de deployment
```

---

## Resultado Final

```
🎉 Projeto Completo!

📊 Resumo:
  - Total de fases: 10/10 (100%)
  - Tempo total: 7 semanas
  - Stories completas: 34
  - Linhas de codigo: ~15,000
  - Checkpoints criados: 12

🌐 URLs de Producao:
  - Frontend: https://ecommerce-platform.vercel.app
  - Backend API: https://ecommerce-api.railway.app
  - Admin panel: https://admin.ecommerce-platform.vercel.app

📁 Repositorio:
  - https://github.com/username/ecommerce-platform
```

---

## Principais Aprendizados

1. **Roadmap economiza tempo** - Caminho claro da pesquisa ao deploy
2. **Deteccao de fase previne confusao** - Sempre sabe onde esta
3. **Handoffs de agente sao suaves** - Navigator delega para o especialista certo
4. **Checkpoints habilitam recuperacao** - Retomar apos pausas sem perda de contexto
5. **Tracking de progresso gera confianca** - Ver avanco tangivel

---

## Proximos Passos

- Usar `*orchestrate` para execucao paralela de stories
- Criar pipeline customizado para diferentes tipos de projeto
- Compartilhar roadmap com stakeholders
- Arquivar projeto completo para referencia

---

*Exemplo completado em 2026-02-15 usando Navigator v1.0.0*
