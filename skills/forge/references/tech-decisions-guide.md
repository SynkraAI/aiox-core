# Tech Decisions Guide — Smart Defaults + Opt-Out

> Referência usada pelo Forge na Phase 0 (Pergunta 3: Stack).
> Filosofia: Forge DECIDE a melhor stack e EXPLICA por quê. Usuário só muda se precisar.
> É como o Waze: a rota já está traçada. Você pode mudar, mas 90% das vezes só aperta "Ir".

---

## Filosofia: Por Que Defaults e Não Perguntas

Um leigo diante de 6 perguntas técnicas vai:
- Escolher aleatoriamente
- Ficar inseguro ("será que escolhi certo?")
- Perder confiança no Forge ("pensei que ele ia cuidar disso")

É como perguntar pro paciente qual anestesia prefere. Ele não sabe — e não deveria precisar saber.
O médico escolhe a melhor e explica o que vai acontecer.

**Regra:** Forge analisa o projeto descrito pelo usuário e MONTA a stack ideal automaticamente.
Depois apresenta o resultado com explicações simples e pergunta "Quer mudar algo?"

---

## Como Funciona

### Passo 1: Forge Analisa o Projeto

Baseado na descrição do usuário + respostas da Pergunta 1 (mercado) e Pergunta 2 (público), o Forge classifica:

| Sinal no projeto | Impacto na decisão |
|-------------------|-------------------|
| Mencionou API externa (Facebook, Stripe, etc.) | Arquitetura separada (API obrigatória) |
| Mencionou agente AI / worker / background job | Arquitetura separada (API obrigatória) |
| Projeto parece pequeno (< 5 stories estimadas) | Fullstack junto é OK |
| Mencionou "precisa aparecer no Google" / SEO | Next.js (não SPA) |
| É dashboard / painel interno | Vite + React (SPA) é suficiente |
| Mencionou "app mobile depois" | Arquitetura separada (API obrigatória) |
| Mencionou site/LP existente pra herdar visual | Design: herdar tokens do site |
| Usuário disse "não quero gerenciar servidor" | Deploy: Vercel/Supabase (managed) |
| Projeto tem relações complexas (usuário→pedido→item) | PostgreSQL (nunca MongoDB) |
| Dados sem estrutura fixa / logs / catálogo mutável | MongoDB pode ser considerado |

### Passo 2: Forge Monta a Stack e Apresenta

O Forge apresenta a stack completa numa tabela com analogias simples.

**FORMATO OBRIGATÓRIO:**

```
Analisei o que você descreveu e montei a stack ideal pro seu projeto.
Cada escolha tem um motivo — vou explicar rapidinho:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔧 STACK RECOMENDADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🖥️ Frontend: Next.js + React
     O mais usado do mercado. É tipo o iPhone dos frameworks:
     não é o único, mas é o que mais gente usa, mais tutorial tem,
     e mais fácil de encontrar ajuda.

  🗄️ Banco de dados: PostgreSQL
     O banco mais robusto e confiável. Pense nele como um cofre
     de banco: seguro, organizado e aguenta desde 100 até
     100 milhões de registros sem reclamar.

  🔌 Acesso ao banco: Prisma (ORM)
     Um "tradutor" entre seu código e o banco. Você escreve código
     normal e ele converte pra linguagem do banco automaticamente.
     Se errar o nome de uma tabela, ele avisa ANTES de rodar.

  🏗️ Arquitetura: Frontend e Backend separados
     O visual (o que o usuário vê) e o motor (lógica, banco) são
     projetos separados que conversam por mensagens.
     É como cozinha separada no restaurante: se amanhã quiser
     fazer um app mobile, a cozinha já está pronta.
     {motivo_especifico}

  📦 Deploy: Docker
     Empacota TUDO (app + banco + configs) numa "caixa" que roda
     igual em qualquer lugar. É como mudança com contêiner: chegou
     no destino, abre e tá tudo funcionando.

  🎨 Design: shadcn/ui + Tailwind CSS
     Componentes visuais premium que você customiza 100%.
     É como roupa sob medida: fica perfeita porque foi ajustada
     pra você. Usado pela Vercel, Linear, Cal.com — apps que
     parecem caros.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> 1. **Tudo certo, segue!**
>    Confio na recomendação, bora construir
> 2. **Quero entender melhor alguma escolha**
>    Me explica mais sobre uma decisão específica
> 3. **Quero mudar algo**
>    Já sei o que quero diferente, me diz
> 4. Digitar outra coisa.
```

**Notas:**
- `{motivo_especifico}` é preenchido pelo Forge baseado na análise. Exemplos:
  - "Você mencionou um agente AI — ele precisa acessar os mesmos dados que o dashboard, então separar é obrigatório."
  - "Se amanhã quiser um app mobile, a API já está pronta."
  - "Seu projeto é grande (+8 stories), separar agora evita refatorar tudo depois."

### Passo 3: Se o Usuário Quer Entender Mais (Opção 2)

Perguntar QUAL decisão quer entender. Então usar o conteúdo da seção "Explicações Detalhadas" abaixo para dar contexto completo com alternativas.

### Passo 4: Se o Usuário Quer Mudar (Opção 3)

Perguntar O QUE quer mudar. Então mostrar as alternativas daquela decisão específica (ver seção "Alternativas por Decisão" abaixo) com analogias.

---

## Lógica de Decisão Automática

### Framework Frontend

```
SE projeto precisa de SEO (site público, landing page, blog):
  → Next.js + React

SE projeto é dashboard/painel interno SEM necessidade de SEO:
  → Vite + React (SPA) — mais leve e rápido

SE usuário mencionou Angular ou time usa Angular:
  → Angular

DEFAULT:
  → Next.js + React
```

### Banco de Dados

```
SE projeto tem relações entre entidades (usuário→pedido→item):
  → PostgreSQL

SE usuário mencionou "não quero gerenciar servidor/infra":
  → Supabase (PostgreSQL gerenciado)

SE projeto é protótipo/pessoal/offline:
  → SQLite

SE dados são 100% sem estrutura fixa E sem relações:
  → MongoDB (raro — quase nunca é o caso)

DEFAULT:
  → PostgreSQL
```

### ORM

```
SE banco é PostgreSQL ou MySQL:
  → Prisma (melhor DX, mais seguro, comunidade maior)

SE usuário tem experiência com SQL e quer mais controle:
  → Drizzle

SE banco é MongoDB:
  → Mongoose (ou Prisma com adapter MongoDB)

SE banco é SQLite:
  → Prisma (suporta SQLite nativamente)

DEFAULT:
  → Prisma
```

### Arquitetura

```
SE projeto menciona agente AI, worker, ou background job:
  → Separados com API (OBRIGATÓRIO — worker precisa acessar dados sem passar pelo frontend)

SE projeto prevê app mobile no futuro:
  → Separados com API (OBRIGATÓRIO — mobile vai consumir a mesma API)

SE projeto é grande (>= 5 stories estimadas):
  → Separados com API (mais organizado, mais fácil de manter)

SE projeto é pequeno (< 5 stories) E sem workers E sem plano mobile:
  → Fullstack junto (Next.js Server Actions)

DEFAULT:
  → Separados com API (mais flexível)
```

### Deploy

```
SE projeto usa banco de dados próprio (não gerenciado):
  → Docker (dev local) + Docker/VPS (produção)

SE projeto é frontend-only ou usa Supabase:
  → Vercel (frontend) + Supabase (backend gerenciado)

SE usuário mencionou "não quero gerenciar servidor":
  → Vercel + serviço gerenciado

DEFAULT:
  → Docker (dev local sempre) + decisão de produção na Phase 5
```

### Design Library

```
SE usuário mencionou site/LP existente pra herdar visual:
  → Herdar tokens + shadcn/ui como base

SE projeto é dashboard/painel com muitos componentes:
  → shadcn/ui + Tailwind (premium, customizável)

SE projeto é MVP rápido sem preocupação visual:
  → shadcn/ui + Tailwind (defaults bonitos sem esforço)

DEFAULT:
  → shadcn/ui + Tailwind CSS
```

---

## Alternativas por Decisão

Usado quando o usuário diz "quero mudar algo" ou "quero entender melhor".

### Frontend — Alternativas

| Opção | Analogia | Quando faz sentido |
|-------|----------|-------------------|
| **Next.js + React** | Canivete suíço: faz tudo, o mais popular | Maioria dos projetos |
| **Vite + React (SPA)** | Versão básica do carro: leve, faz o que precisa | Dashboards internos, sem SEO |
| **Angular** | Carro automático completo: tudo incluso, mais pesado | Times grandes, projetos enterprise |
| **Astro** | Bicicleta elétrica: super leve, perfeita pra sites estáticos | Sites de conteúdo, blogs, docs |
| **SvelteKit** | Carro esportivo: rápido e leve, mas menos mecânicos disponíveis | Projetos performance-critical |

### Banco — Alternativas

| Opção | Analogia | Quando faz sentido |
|-------|----------|-------------------|
| **PostgreSQL** | Cofre de banco: seguro, organizado, aguenta tudo | Quase sempre (padrão) |
| **Supabase** | Cofre alugado: Postgres sem a dor de cabeça de manter | Projetos sem time de infra |
| **MySQL** | Conta poupança: funciona, mas rende menos | Legado, WordPress, times que já usam |
| **SQLite** | Caderninho: simples, local, sem servidor | Protótipos, apps pessoais, offline |
| **MongoDB** | Gaveta: rápido pra guardar, difícil de achar | Logs, dados sem estrutura fixa |

### ORM — Alternativas

| Opção | Analogia | Quando faz sentido |
|-------|----------|-------------------|
| **Prisma** | Tradutor fluente: traduz tudo automaticamente e avisa se errar | Padrão, melhor pra iniciantes |
| **Drizzle** | Dicionário: você monta as frases, ele ajuda | Devs experientes querendo controle |
| **SQL direto** | Carro manual: mais rápido se sabe dirigir, perigoso se não | Só pra quem domina SQL |

### Arquitetura — Alternativas

| Opção | Analogia | Quando faz sentido |
|-------|----------|-------------------|
| **Separados (API)** | Cozinha separada: mais flexível, reusa pra mobile | Projetos médios/grandes, com workers |
| **Fullstack junto** | Food truck: tudo junto, rápido pra começar | Projetos pequenos, MVP rápido |
| **Monorepo** | Prédio comercial: mesma pasta, andares independentes | Times organizados, código compartilhado |

> **⚠️ REGRA DE ESTRUTURA:** Quando `repo_structure` for `monorepo_workspaces` (default para "Separados" e "Monorepo"), frontend e backend DEVEM ficar em diretórios separados na raiz do projeto:
>
> ```
> {project}/
> ├── frontend/    # Next.js, React, etc.
> ├── backend/     # FastAPI, Express, NestJS, etc.
> ├── shared/      # Types, utils compartilhados (se aplicável)
> ├── docker-compose.yml
> └── README.md
> ```
>
> É como restaurante: cozinha e salão têm seu próprio espaço. Food truck (fullstack junto) mistura — mas num restaurante de verdade, cada um tem seu canto.
>
> **Exceção:** Se `repo_structure` for `single_package` (fullstack junto), a estrutura flat é aceita. MAS se houver backend significativo (workers, queues, scraping, AI), Forge DEVE sugerir upgrade para `monorepo_workspaces`.

### Deploy — Alternativas

| Opção | Analogia | Quando faz sentido |
|-------|----------|-------------------|
| **Docker** | Contêiner de mudança: tudo junto, roda igual em qualquer lugar | Padrão, projetos sérios |
| **Vercel/Netlify** | Venda online: sem loja física, plataforma cuida de tudo | Sites, apps sem backend pesado |
| **VPS** | Galpão alugado: controle total, mais trabalho | Backend pesado, custo otimizado |

### Design — Alternativas

| Opção | Analogia | Quando faz sentido |
|-------|----------|-------------------|
| **shadcn/ui + Tailwind** | Roupa sob medida: bonita e customizável | Padrão, melhor custo-benefício |
| **Material UI** | Roupa de loja de departamento: serve em todos, igual em todos | Quando quer "cara de Google" |
| **Chakra UI** | Fast fashion boa: bonita, acessível, adaptável | Meio-termo esforço/resultado |
| **Tailwind puro** | Tecido + agulha: liberdade total, trabalho total | Quando já tem design system |
| **Herdar de site existente** | Alfaiate com referência: copia o estilo que já funciona | Quando tem LP/site pra replicar |

---

## Registro das Decisões

Todas as decisões são salvas no `state.json`:

```json
{
  "tech_decisions": {
    "framework": "nextjs",
    "database": "postgresql",
    "orm": "prisma",
    "architecture": "separated_api",
    "repo_structure": "monorepo_workspaces",
    "deploy": "docker",
    "design_library": "shadcn",
    "design_inherit_from": null,
    "decided_by": "forge",
    "user_overrides": [],
    "reasoning": {
      "architecture": "Projeto menciona agente AI — separar é obrigatório",
      "repo_structure": "frontend/ e backend/ como workspaces independentes",
      "database": "Dados relacionais (campanha→métricas) — Postgres é ideal"
    }
  }
}
```

**Campo `repo_structure`** — decisão de como o repositório é organizado (separado de `architecture`):

| Valor | Significado | Estrutura de diretórios |
|-------|------------|------------------------|
| `monorepo_workspaces` | Frontend e backend como workspaces na raiz | `frontend/` + `backend/` + `shared/` |
| `single_package` | Tudo num único package.json | Flat (Next.js com API routes, por exemplo) |
| `multi_repo` | Repos separados (raro) | N/A — cada repo tem sua estrutura |

**Regra de derivação automática:**
- Se `architecture == "separated_api"` → default `repo_structure = "monorepo_workspaces"`
- Se `architecture == "fullstack_together"` → default `repo_structure = "single_package"`
- Se `architecture == "monorepo"` → default `repo_structure = "monorepo_workspaces"`
- Usuário pode override qualquer combinação

- `decided_by`: "forge" (automático) ou "user" (se mudou algo)
- `user_overrides`: lista das decisões que o usuário alterou manualmente
- `reasoning`: por que o Forge escolheu cada opção (injetado nos agentes)

Essas decisões são injetadas no contexto de TODOS os agentes a partir da Phase 1:
- **@pm** usa para montar o PRD com a stack correta
- **@architect** usa para desenhar a arquitetura
- **@dev** usa para implementar com as tecnologias certas
- **@devops** usa para configurar CI/CD e deploy

---

## Advisor Integration

Quando o plugin `forge-advisor` (priority 8) está ativo, os defaults estáticos acima servem como **fallback**. O Advisor injeta recomendações baseadas em evidências ANTES das decision trees rodarem.

**Ordem de precedência:**
1. **Escolha explícita do usuário** — sempre vence
2. **Recomendação do Advisor** — baseada em learnings de runs anteriores (success rate, user overrides, error patterns)
3. **Contexto do projeto** — decisões estabelecidas em `project-context.md`
4. **Defaults deste guia** — decision trees estáticas (fallback final)

**Quando o Advisor NÃO está ativo** (plugin desabilitado, ou primeiro run sem learnings):
Os defaults deste guia são usados normalmente, sem mudança.

**Referência:** `{FORGE_HOME}/forge-advisor.md` e `{FORGE_HOME}/plugins/forge-advisor.yaml`
