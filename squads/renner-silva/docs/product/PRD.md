# Metodo Aplauda de Pe - Plataforma Educacional

## Product Requirements Document (PRD)

---

### Goals

- Transformar a knowledge base extraida (9.9/10 qualidade) do Metodo Renner Silva em uma plataforma educacional production-ready que guie alunos pelos 5 modulos do metodo com rastreamento de progresso, checkpoints interativos e gamificacao
- Entregar uma experiencia de aprendizado sequencial com desbloqueio progressivo de modulos, exercicios praticos e trilhas de aprendizado personalizadas
- Fornecer ao instrutor (Renner Silva) visibilidade sobre o progresso dos alunos, taxas de conclusao e engajamento
- Estabelecer infraestrutura de producao completa (CI/CD, hosting, monitoramento, analytics) dentro de um timeline de 20 horas pos-aprovacao do PRD
- Criar base tecnica extensivel para features avanacadas futuras (comunidade, video player, forum, live sessions)

### Background Context

O Metodo "Aplauda de Pe" e um curso de oratoria e storytelling criado por Renner Silva, estruturado em 5 modulos sequenciais: (1) Conexao Inicial, (2) Promocao do Conteudo, (3) Entrega Estruturada, (4) Historia de Essencia, e (5) Finalizacao Emocional. A knowledge base foi completamente extraida e estruturada em 4 fases, resultando em dados de alta qualidade: 5 modulos com taxonomia completa, 15 conceitos com rastreabilidade, 25 exercicios praticos, 4 trilhas de aprendizado (8h a 60h), e 29 checkpoints de progresso.

Atualmente existe um MVP Next.js com dashboard basico que exibe os 5 modulos em grid, stats de progresso e proximos passos, porem com dados hardcoded, sem paginas individuais de modulos, sem persistencia de progresso e sem integracao com os dados reais da knowledge base. O desafio agora e transformar esse prototipo em uma plataforma de producao funcional, com autenticacao, dados reais, deployment automatizado e mecanicas de gamificacao que incentivem completar o curso.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-13 | 1.0 | PRD inicial criado com escopo completo v1.0-v3.0 | Morgan (PM Agent) |

---

## Requirements

### Functional

- **FR1:** O sistema deve carregar e renderizar dados reais dos 5 modulos a partir dos arquivos JSON da knowledge base (taxonomy.json, concepts.json, exercises.json, learning-paths.json)
- **FR2:** O sistema deve implementar paginas individuais para cada modulo, exibindo conceitos-chave, tecnicas, exercicios e armadilhas comuns conforme dados da taxonomy
- **FR3:** O sistema deve rastrear progresso do aluno via localStorage (v1.1) e migrar para Supabase (v2.0), incluindo checkpoints completados, modulos desbloqueados e tempo gasto
- **FR4:** O sistema deve implementar o desbloqueio progressivo de modulos: modulo N+1 so e acessivel quando aluno atinge 70% dos checkpoints do modulo N (conforme CHECKPOINTS-PROGRESSO.md)
- **FR5:** O sistema deve exibir os 29 checkpoints interativos organizados por modulo, permitindo ao aluno marcar/desmarcar conclusao de cada checkpoint
- **FR6:** O sistema deve oferecer 4 trilhas de aprendizado selecionaveis (Iniciante 15-20h, Intermediario 25-30h, Master 50-60h, Express 8-12h) que filtram e sequenciam os exercicios conforme learning-paths.json
- **FR7:** O sistema deve exibir exercicios praticos de cada modulo com instrucoes detalhadas, criterios de sucesso, recursos necessarios e conceitos relacionados
- **FR8:** O sistema deve implementar autenticacao de usuarios via Supabase Auth com suporte a email/senha e OAuth (Google), incluindo cadastro, login, logout e recuperacao de senha
- **FR9:** O sistema deve implementar busca full-text nos conceitos, exercicios e conteudo dos modulos
- **FR10:** O sistema deve exibir um grafo visual de relacionamento entre os 15 conceitos, mostrando prerequisitos e conceitos relacionados conforme mapa_dependencias do concepts.json
- **FR11:** O sistema deve implementar sistema de badges e conquistas (gamificacao) com criterios baseados em: conclusao de modulos, streaks de estudo, conclusao de trilhas, e projeto final
- **FR12:** O sistema deve permitir ao aluno adicionar anotacoes pessoais por conceito, exercicio ou modulo, persistidas no Supabase
- **FR13:** O dashboard do instrutor deve exibir metricas agregadas: total de alunos, taxa de conclusao por modulo, checkpoint mais travado, tempo medio por modulo e taxa de retencao
- **FR14:** O sistema deve implementar quizzes interativos por modulo para validacao de conhecimento, com feedback imediato e contribuicao para progresso
- **FR15:** O sistema deve gerar certificados PDF de conclusao por trilha e por projeto final, com dados do aluno e data de conclusao

### Non Functional

- **NFR1:** Tempo de carregamento de qualquer pagina deve ser inferior a 2 segundos em conexao 3G (Lighthouse Performance score >= 90)
- **NFR2:** A aplicacao deve atender WCAG 2.1 nivel AA, incluindo navegacao por teclado, leitores de tela, contraste minimo 4.5:1 e foco visivel
- **NFR3:** Design mobile-first responsivo com breakpoints para mobile (< 640px), tablet (640-1024px) e desktop (> 1024px)
- **NFR4:** SEO otimizado com meta tags, Open Graph, sitemap.xml, robots.txt e structured data (Course schema) para indexacao de mecanismos de busca
- **NFR5:** Autenticacao segura via Supabase Auth com tokens JWT, refresh tokens e Row Level Security (RLS) no banco de dados
- **NFR6:** Monitoramento de erros em producao via Sentry com source maps, alertas automaticos e rastreamento de sessao
- **NFR7:** Analytics de uso via Posthog para rastreamento de eventos customizados (modulo acessado, checkpoint completado, exercicio iniciado)
- **NFR8:** Pipeline CI/CD via GitHub Actions com lint, typecheck, testes e deploy automatico para Netlify em push para main
- **NFR9:** Cobertura de testes minima de 70% para logica de negocio (stores, utils, hooks) e testes E2E para fluxos criticos (login, progresso, checkpoint)
- **NFR10:** Tempo de primeiro byte (TTFB) inferior a 200ms via edge functions do Netlify e caching adequado de assets estaticos
- **NFR11:** Suporte a modo offline parcial via Service Worker para conteudo ja carregado, com sync ao reconectar
- **NFR12:** Uptime de 99.5% com Netlify hosting e health checks automaticos

---

## User Interface Design Goals

### Overall UX Vision

A plataforma deve transmitir profissionalismo e acolhimento simultaneamente, refletindo o espirito do Metodo "Aplauda de Pe" - que e sobre conexao humana e transformacao pessoal. A experiencia deve ser guiada e progressiva, nunca sobrecarregando o aluno com informacao, mas revelando conteudo de forma sequencial conforme o metodo prescreve. O design deve fazer o aluno sentir que esta em uma jornada pessoal, nao apenas consumindo conteudo.

### Key Interaction Paradigms

- **Desbloqueio progressivo:** Modulos e exercicios sao revelados conforme progresso, criando sensacao de conquista e antecipacao
- **Checkpoints como marcos:** Cada checkpoint completado gera feedback visual positivo (animacao, mudanca de estado, notificacao sutil)
- **Gamificacao nao-intrusiva:** Badges e conquistas aparecem como celebracoes naturais, nao como distracao do aprendizado
- **Navegacao por trilha:** O aluno sempre sabe onde esta na jornada e o que vem a seguir
- **Conteudo em camadas:** Resumo visivel por padrao, detalhes disponiveis sob demanda (acordeoes, expandables)

### Core Screens and Views

1. **Tela de Login/Cadastro** - Autenticacao com email/senha e OAuth Google, design limpo e acolhedor
2. **Dashboard Principal** (existente, aprimorar) - Visao geral de progresso, modulos, stats, proximos passos e trilha ativa
3. **Pagina de Modulo Individual** - Conteudo do modulo: conceitos-chave com 4 estagios (Nome, Definicao, Contexto, Ferramenta), tecnicas, armadilhas comuns, exercicios, checkpoints e progresso do modulo
4. **Pagina de Exercicio** - Instrucoes detalhadas, criterios de sucesso, recursos necessarios, campo de anotacoes e marcacao de conclusao
5. **Selecao de Trilha** - 4 trilhas com descricao, duracao, nivel, modulos inclusos e botao de selecao
6. **Grafo de Conceitos** - Visualizacao interativa dos 15 conceitos e seus relacionamentos/prerequisitos
7. **Pagina de Checkpoints** - Lista de todos os 29 checkpoints organizados por modulo com status e verificacoes
8. **Perfil do Aluno** - Dados pessoais, trilha selecionada, badges conquistados, historico de atividade
9. **Pagina de Badges/Conquistas** - Colecao de badges conquistados e proximos desbloqueios
10. **Dashboard do Instrutor** - Metricas agregadas, lista de alunos, taxas de conclusao, heatmap de engajamento

### Accessibility: WCAG 2.1 AA

Compliance obrigatoria com nivel AA, incluindo:
- Contraste minimo de 4.5:1 para texto normal e 3:1 para texto grande
- Navegacao completa por teclado (Tab, Enter, Escape, Arrow keys)
- Compatibilidade com leitores de tela (ARIA labels, roles, live regions)
- Foco visivel em todos os elementos interativos
- Textos alternativos para todas as imagens
- Skip navigation links

### Branding

- Paleta de cores profissional com tons de azul/indigo como primario (confianca, profissionalismo) e verde/emerald como accent (progresso, sucesso)
- Cada modulo mantem sua cor identificadora propria (ja implementado no MVP com CSS variables --module-1 a --module-5)
- Tipografia Inter (ja configurada) para clareza e legibilidade
- Icones Lucide React (ja em uso) para consistencia visual
- Tom visual inspiracional sem ser informal - refletindo que o curso e para profissionais que querem dominar a arte de palestrar

### Target Device and Platforms: Web Responsive

- **Primary:** Mobile (smartphone) - onde alunos acessam mais frequentemente para estudo rapido
- **Secondary:** Desktop/Laptop - para sessoes de estudo mais longas e exercicios escritos
- **Tertiary:** Tablet - uso intermediario
- PWA-ready para instalacao na home screen do dispositivo movel

---

## Technical Assumptions

### Repository Structure: Monorepo (Single Project)

O projeto vive em `/Users/luizfosc/Projects/knowledge-base-renner-silva/` como repositorio unico. A pasta `app/` contem o Next.js application, `data/` contem os JSONs da knowledge base, `curso/` contem materiais do curso, e `obsidian-vault/` contem materiais do instrutor. Repositorio GitHub a ser criado para habilitar CI/CD.

[AUTO-DECISION] "Monorepo ou Polyrepo?" -> Monorepo single project (reason: E um projeto unico sem necessidade de separacao em packages. Data, app e docs vivem juntos. Simplicidade maximizada para timeline de 20h.)

### Service Architecture

**Monolito Next.js com Supabase como Backend-as-a-Service (BaaS).**

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|-----------------|
| Frontend | Next.js 16.1.6 (App Router + Turbopack) | SSR/SSG, routing, UI |
| UI | React 19.2.3 + Radix UI + Tailwind CSS v4 | Componentes, estilos |
| State | Zustand 5.0 | Estado client-side, progresso local |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) | Dados, autenticacao, storage |
| Hosting | Netlify | Deploy, CDN, edge functions |
| CI/CD | GitHub Actions | Lint, typecheck, test, deploy |
| Monitoring | Sentry | Error tracking, performance |
| Analytics | Posthog | Event tracking, product analytics |

[AUTO-DECISION] "Supabase ou backend custom?" -> Supabase BaaS (reason: Timeline de 20h nao permite construir backend custom. Supabase fornece auth, database, storage e realtime out-of-the-box. Decisao ja estava no prompt do usuario.)

[AUTO-DECISION] "Vercel ou Netlify?" -> Netlify (reason: Decisao explicita do usuario no prompt. Netlify suporta Next.js via @netlify/plugin-nextjs e edge functions.)

### Testing Requirements

**Unit + Integration + E2E (Testing Pyramid)**

| Camada | Framework | Escopo | Cobertura Target |
|--------|-----------|--------|-----------------|
| Unit | Jest + React Testing Library | Components, stores, utils, hooks | 70% |
| Integration | Jest | Data loading, Supabase client, progress calculation | 70% |
| E2E | Playwright | Login flow, progress tracking, checkpoint completion, module navigation | Fluxos criticos |

[AUTO-DECISION] "Unit only ou full pyramid?" -> Full Testing Pyramid (reason: Producao requer confianca em deploys automaticos. E2E garante fluxos criticos. Unit garante logica. Timeline apertado mas necessario para qualidade.)

### Additional Technical Assumptions and Requests

- **Data Layer:** JSONs da knowledge base serao importados como modulos TypeScript no build time (import estatico) para v1.1, e migrados para Supabase tables em v2.0 para queries dinamicas
- **Supabase Schema:** Tabelas principais: `profiles`, `progress`, `checkpoints`, `notes`, `badges`, `quiz_results`. RLS habilitado em todas.
- **Caching:** Next.js static generation para paginas de modulos e conceitos (revalidacao ISR a cada 24h), SWR para dados de progresso do usuario
- **Internationalizacao:** pt-BR apenas para v1.0-v2.0. Estrutura preparada para i18n futuro mas sem implementacao
- **Supabase Free Tier:** Projeto opera dentro dos limites do free tier (500MB database, 1GB storage, 50K auth users, 2GB bandwidth)
- **Netlify Free Tier:** Build minutes (300/mes), bandwidth (100GB/mes), serverless functions (125K/mes)
- **Environment Variables:** Gerenciadas via Netlify Environment Variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY)
- **Domain:** Custom domain a ser configurado no Netlify (DNS redirect)

---

## Epic List

### Epic 1: Foundation and Data Integration (v1.1)
**Goal:** Estabelecer infraestrutura de producao e integrar dados reais da knowledge base no MVP existente, transformando o prototipo em aplicacao funcional com navegacao completa.

### Epic 2: Authentication and Persistent Progress (v2.0 - Phase 1)
**Goal:** Implementar autenticacao via Supabase e migrar persistencia de progresso de localStorage para banco de dados, habilitando multi-device e dados do instrutor.

### Epic 3: Advanced Learning Features (v2.0 - Phase 2)
**Goal:** Adicionar features avancadas de aprendizado: busca full-text, grafo de conceitos, quizzes interativos, anotacoes pessoais e certificados PDF.

### Epic 4: Gamification and Engagement (v2.0 - Phase 3)
**Goal:** Implementar sistema completo de gamificacao com badges, conquistas, streaks e mecanicas de engajamento baseadas em dopamina (integrado com squad dopamine-learning).

### Epic 5: Social and Instructor Features (v3.0)
**Goal:** Adicionar camada social com comunidade de alunos, forum de discussao, analytics avancado para instrutor e integracao com video player.

[AUTO-DECISION] "Quantos epics?" -> 5 epics (reason: Separacao clara por escopo de entrega de valor. Epic 1 entrega app funcional. Epic 2 adiciona autenticacao. Epic 3 features avancadas. Epic 4 gamificacao. Epic 5 social. Cada um deployavel e com valor independente.)

[AUTO-DECISION] "Epic 4 gamificacao separado ou junto do Epic 3?" -> Separado (reason: Gamificacao sera enriquecida pelo squad dopamine-learning apos aprovacao do PRD. Manter separado permite iteracao independente e design especializado.)

---

## Epic 1: Foundation and Data Integration

**Goal:** Transformar o MVP existente em aplicacao funcional com dados reais, paginas de modulos individuais, progresso via localStorage, deployment automatizado e infraestrutura de producao (Git, GitHub, CI/CD, Netlify, Sentry, Analytics).

### Story 1.1: Project Infrastructure Setup

As a developer,
I want to initialize Git repository, create GitHub repo, and configure CI/CD pipeline,
so that the project has automated builds, linting, and deployment from day one.

#### Acceptance Criteria

1. Repositorio Git inicializado em `/Users/luizfosc/Projects/knowledge-base-renner-silva/` com `.gitignore` adequado (node_modules, .next, .env*, coverage)
2. Repositorio GitHub criado via `gh repo create` (privado) com branch protection em `main` (require PR reviews)
3. GitHub Actions workflow configurado com jobs: lint (ESLint), typecheck (tsc --noEmit), test (jest), build (next build)
4. Workflow dispara em push para `main` e em pull requests
5. Netlify site criado e conectado ao repositorio GitHub com auto-deploy em push para `main`
6. Arquivo `netlify.toml` configurado com build command, publish directory e headers de cache
7. Plugin `@netlify/plugin-nextjs` instalado e configurado
8. README.md atualizado com badges de CI status e instrucoes de desenvolvimento local

### Story 1.2: Environment and Monitoring Setup

As a developer,
I want to configure Sentry for error monitoring and Posthog for analytics,
so that we have observability from the first deploy.

#### Acceptance Criteria

1. Sentry SDK instalado e configurado (`@sentry/nextjs`) com DSN via environment variable
2. Sentry error boundary configurado em `app/layout.tsx` com fallback UI
3. Source maps enviados ao Sentry durante build via GitHub Actions
4. Posthog SDK instalado e configurado (`posthog-js`) com key via environment variable
5. Posthog provider wrapper criado e integrado no layout da aplicacao
6. Evento customizado de page view disparado automaticamente em cada navegacao
7. Environment variables configuradas no Netlify (SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY)
8. Testes verificam que SDKs nao quebram SSR (server-side safe initialization)

### Story 1.3: Supabase Project Setup

As a developer,
I want to create and configure Supabase project with initial schema,
so that the database and auth infrastructure are ready for use.

#### Acceptance Criteria

1. Projeto Supabase criado no dashboard com regiao South America (sa-east-1)
2. Schema inicial criado com tabelas: `profiles` (id, email, name, avatar_url, learning_path_id, created_at, updated_at), `progress` (id, user_id FK, module_id, checkpoint_id, completed, completed_at), `notes` (id, user_id FK, entity_type, entity_id, content, created_at, updated_at)
3. Row Level Security (RLS) habilitado em todas as tabelas com policies: users so acessam proprios dados
4. Supabase client configurado em `lib/supabase.ts` com tipos TypeScript gerados via `supabase gen types`
5. Environment variables configuradas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Auth providers habilitados: Email/Password e Google OAuth
7. Seed script criado para popular dados iniciais de teste
8. Documentacao do schema em `docs/database/schema.md`

### Story 1.4: Real Data Loading and Type System

As a developer,
I want to load knowledge base JSON data into the application with proper TypeScript types,
so that all content is type-safe and served from real data instead of hardcoded values.

#### Acceptance Criteria

1. Tipos TypeScript definidos em `types/` para: Module, Concept, Exercise, LearningPath, Checkpoint (derivados da estrutura dos JSONs)
2. Data loader criado em `lib/data.ts` que importa e exporta dados tipados de taxonomy.json, concepts.json, exercises.json e learning-paths.json
3. Dashboard (`page.tsx`) refatorado para usar dados reais do data loader ao inves de array hardcoded
4. Dados exibidos com acentos corretos (utf-8) e formatacao adequada
5. Testes unitarios verificam que data loader retorna dados no formato esperado e nao retorna vazio
6. Tipo de cada modulo inclui: id, numero, titulo, objetivo_aprendizado, duracao_estimada, nivel_dificuldade, conceitos_chave[], tecnicas[], exercicios[], armadilhas_comuns[]

### Story 1.5: Module Detail Pages

As a student,
I want to navigate to individual module pages with full content,
so that I can study each module's concepts, techniques, exercises, and pitfalls in detail.

#### Acceptance Criteria

1. Rota dinamica `app/modules/[id]/page.tsx` criada para paginas de modulos individuais
2. Cada pagina exibe: titulo, objetivo de aprendizado, duracao estimada, nivel de dificuldade
3. Secao de conceitos-chave exibida com acordeoes (Radix Accordion): nome, definicao, importancia, exemplos praticos e como aplicar
4. Secao de tecnicas exibida como lista com icones
5. Secao de exercicios exibida como cards com titulo, objetivo, tempo estimado e tipo (Individual/Grupo/Projeto Final)
6. Secao de armadilhas comuns exibida com icones de alerta
7. Breadcrumb de navegacao: Dashboard > Modulo {N} > {Titulo}
8. Botao "Proximo Modulo" visivel se modulo desbloqueado, botao "Voltar ao Dashboard"
9. Layout responsivo (mobile-first) com sidebar de navegacao em desktop
10. Links dos ModuleCards no dashboard agora navegam para pagina do modulo

### Story 1.6: localStorage Progress Tracking

As a student,
I want my progress to be saved locally in my browser,
so that I can close the app and return without losing my checkpoint completion status.

#### Acceptance Criteria

1. Zustand store criado em `stores/progress-store.ts` com persist middleware (localStorage)
2. Store gerencia: checkpoints completados (map de checkpoint_id -> boolean), modulos desbloqueados, trilha selecionada, timestamp de ultima atividade
3. Logica de desbloqueio implementada: modulo N+1 desbloqueia quando 70% dos checkpoints do modulo N estao completos (conforme CHECKPOINTS-PROGRESSO.md)
4. Checkpoints interativos na pagina de modulo: aluno pode marcar/desmarcar cada checkpoint
5. Dashboard atualiza automaticamente stats (modulos concluidos, checkpoints atingidos, progresso geral) com base no store
6. Zustand store usa tipagem explicitacom `create<ProgressStoreType>()(persist(...))` conforme gotcha documentado
7. Hydration handling implementado para evitar mismatch SSR vs client
8. Testes unitarios para logica de desbloqueio e calculo de progresso

### Story 1.7: Learning Path Selection

As a student,
I want to choose a learning path that fits my experience level and available time,
so that I see a personalized sequence of modules and exercises.

#### Acceptance Criteria

1. Pagina de selecao de trilha em `app/paths/page.tsx` exibindo as 4 trilhas (Iniciante, Intermediario, Master, Express) com descricao, duracao, nivel e modulos inclusos
2. Cada trilha exibe seu `entrega_final` e `prerequisitos`
3. Trilha Express exibe aviso especial ("sacrifica profundidade por velocidade")
4. Selecao de trilha persiste no Zustand store com localStorage
5. Dashboard reflete trilha selecionada: exercicios filtrados conforme trilha, sequencia de aprendizado adaptada
6. Recomendacao por perfil exibida: sugere trilha com base em auto-avaliacao simples (3 perguntas)
7. Aluno pode trocar de trilha a qualquer momento (com aviso de que progresso e mantido)

### Story 1.8: Design System Polish and Accessibility

As a student,
I want a polished, accessible, and consistent visual experience,
so that I can focus on learning without UI friction.

#### Acceptance Criteria

1. Design tokens consolidados em CSS variables: cores primarias, accent, module-1 a module-5 (manter os existentes), espacamentos, border-radius, shadows
2. Componentes UI existentes (ModuleCard, StatCard, ProgressBar, Header, Footer) revisados para WCAG 2.1 AA: aria-labels, roles, keyboard navigation, focus-visible
3. Skip navigation link adicionado antes do header
4. Todas as cores verificadas com contraste >= 4.5:1 (texto normal) e >= 3:1 (texto grande)
5. Componente Toast/Notification criado para feedback de acoes (checkpoint completado, badge conquistado)
6. Loading skeletons implementados para todas as paginas com data fetching
7. Animacoes respeitam `prefers-reduced-motion`
8. Testes de acessibilidade via axe-core integrados no test suite

---

## Epic 2: Authentication and Persistent Progress

**Goal:** Implementar autenticacao via Supabase Auth, migrar persistencia de progresso para banco de dados, e criar perfil de usuario. Isso habilita acesso multi-device, dados agregados para o instrutor, e prepara a base para features sociais.

### Story 2.1: Supabase Auth Integration

As a student,
I want to create an account and log in to the platform,
so that my progress is saved securely and I can access from any device.

#### Acceptance Criteria

1. Paginas de login (`app/auth/login/page.tsx`) e cadastro (`app/auth/signup/page.tsx`) implementadas com formularios validados
2. Login via email/senha funcional com feedback de erros claros (email invalido, senha incorreta, conta nao existe)
3. Login via Google OAuth funcional via Supabase Auth
4. Logout funcional com limpeza de sessao
5. Recuperacao de senha via email implementada (`app/auth/reset-password/page.tsx`)
6. Middleware Next.js protege rotas autenticadas (redirect para login se nao autenticado)
7. Sessao persistida via cookies (Supabase SSR helper)
8. Profile criado automaticamente em `profiles` table via Supabase trigger on auth.users insert
9. UI de autenticacao segue design system do app (nao usa auth UI pre-built)

### Story 2.2: Progress Migration to Supabase

As a student,
I want my locally-saved progress to be synced to the cloud when I log in,
so that I don't lose progress from before I created an account.

#### Acceptance Criteria

1. Ao primeiro login, sistema verifica se existe progresso no localStorage
2. Se existe, migra checkpoints completados e trilha selecionada para Supabase
3. Apos migracao, localStorage e limpo (Supabase se torna source of truth)
4. Para usuarios ja autenticados, todas as operacoes de progresso vao direto para Supabase
5. Zustand store agora usa Supabase como backend (com cache local para performance)
6. Operacoes de progresso sao otimistas (atualiza UI imediatamente, sync em background)
7. Conflitos resolvidos com estrategia "most recent wins"
8. Loading state durante sync exibe skeleton/spinner sem bloquear interacao

### Story 2.3: User Profile Page

As a student,
I want to view and edit my profile with my learning stats,
so that I can track my overall journey and personalize my experience.

#### Acceptance Criteria

1. Pagina de perfil em `app/profile/page.tsx` exibe: nome, email, avatar, trilha selecionada, data de cadastro
2. Edicao de nome e avatar (upload para Supabase Storage)
3. Secao de estatisticas: modulos concluidos, checkpoints totais, horas estimadas de estudo, streak de dias consecutivos
4. Secao de atividade recente: ultimos 10 checkpoints completados com data
5. Botao para trocar trilha de aprendizado
6. Botao para exportar progresso (JSON download)
7. Dados protegidos por RLS (usuario so ve proprio perfil)

### Story 2.4: Instructor Dashboard - Basic Metrics

As an instructor (Renner Silva),
I want to see aggregated student metrics,
so that I can understand how students are progressing through the course.

#### Acceptance Criteria

1. Pagina de dashboard instrutor em `app/instructor/page.tsx` (protegida por role)
2. Exibe: total de alunos cadastrados, alunos ativos (acessaram nos ultimos 7 dias)
3. Taxa de conclusao por modulo (barra de progresso por modulo)
4. Checkpoint mais "travado" (menor taxa de conclusao)
5. Distribuicao de alunos por trilha (grafico simples)
6. Tempo medio estimado por modulo vs tempo real dos alunos
7. Role "instructor" atribuida manualmente via Supabase dashboard (nao via UI)
8. RLS permite instructor ver dados agregados (nunca dados individuais de alunos)

---

## Epic 3: Advanced Learning Features

**Goal:** Adicionar features avancadas de aprendizado que enriquecem a experiencia: busca full-text, visualizacao de grafo de conceitos, quizzes interativos, anotacoes pessoais e certificados de conclusao.

### Story 3.1: Full-Text Search

As a student,
I want to search across all course content (concepts, exercises, techniques),
so that I can quickly find specific information when I need it.

#### Acceptance Criteria

1. Barra de busca no header da aplicacao com atalho de teclado (Cmd+K / Ctrl+K)
2. Busca full-text nos campos: nome de conceitos, definicao, como_aplicar, titulo de exercicios, instrucoes, tecnicas de modulos
3. Resultados exibidos em dropdown com categorias (Conceitos, Exercicios, Modulos)
4. Cada resultado mostra titulo, tipo, trecho com highlight do termo buscado e link para pagina
5. Busca funciona client-side para v2.0 (dados ja carregados), com migracaopara Supabase full-text search em v3.0
6. Debounce de 300ms na digitacao para evitar renders excessivos
7. Estado "nenhum resultado" com sugestoes de busca

### Story 3.2: Concept Relationship Graph

As a student,
I want to visualize how concepts relate to each other,
so that I understand the learning dependency chain and the big picture.

#### Acceptance Criteria

1. Pagina de grafo em `app/concepts/graph/page.tsx` renderizando os 15 conceitos como nos
2. Arestas representam `prerequisitos` e `relacionado_com` do concepts.json (tipos visuais distintos)
3. Cada no exibe: nome do conceito, modulo (cor), nivel de dificuldade
4. Click no no abre tooltip com definicao e link para modulo
5. Legenda de cores por modulo e tipos de relacao
6. Layout force-directed com zoom e pan
7. Responsivo: em mobile, lista alternativa com conexoes visualizadas como arvore
8. Biblioteca sugerida: react-force-graph-2d ou d3-force (decisao do arquiteto)

### Story 3.3: Interactive Quizzes

As a student,
I want to take quizzes at the end of each module,
so that I can validate my understanding before moving on.

#### Acceptance Criteria

1. Cada modulo tem 5-10 questoes geradas a partir dos conceitos-chave (multipla escolha e verdadeiro/falso)
2. Questoes armazenadas em `data/quizzes.json` (criado manualmente com base nos conceitos)
3. Feedback imediato por questao (correto/incorreto com explicacao)
4. Score final exibido com grade: Excelente (>=90%), Bom (>=70%), Revisar (<70%)
5. Score contribui para progresso do modulo (como checkpoint adicional)
6. Resultados salvos no Supabase (quiz_results table) para historico
7. Aluno pode refazer quiz quantas vezes quiser (melhor score e mantido)
8. Animacao de confetti ao atingir score >= 90%

### Story 3.4: Personal Notes

As a student,
I want to add personal notes on any concept or exercise,
so that I can document my insights, reflections, and progress.

#### Acceptance Criteria

1. Botao "Adicionar nota" em cada conceito, exercicio e modulo
2. Editor de texto simples (Markdown basico: bold, italic, listas)
3. Notas salvas no Supabase (notes table) com entity_type e entity_id
4. Lista de notas acessivel via perfil do aluno e na pagina da entidade
5. Busca dentro das proprias notas
6. Exportacao de todas as notas em Markdown
7. Anotacoes protegidas por RLS (privadas por padrao)

### Story 3.5: PDF Certificates

As a student,
I want to receive a certificate when I complete a learning path,
so that I can document and share my achievement.

#### Acceptance Criteria

1. Certificado gerado ao completar trilha (todos os checkpoints da trilha acima de 70%)
2. PDF gerado server-side com dados: nome do aluno, trilha completada, data de conclusao, assinatura digital do Metodo
3. Design profissional do certificado com branding do Metodo Aplauda de Pe
4. Download disponivel na pagina de perfil e pagina de conclusao da trilha
5. Certificado adicional para conclusao do Projeto Final
6. URL unica de verificacao para cada certificado (validacao publica)
7. Biblioteca sugerida: @react-pdf/renderer ou jsPDF (decisao do arquiteto)

---

## Epic 4: Gamification and Engagement

**Goal:** Implementar sistema completo de gamificacao baseado em mecanicas de dopamina, com badges, conquistas, streaks e mecanicas de engajamento que incentivem completar o curso. Este epic sera enriquecido pelo squad dopamine-learning apos aprovacao do PRD.

### Story 4.1: Badge System Design and Implementation

As a student,
I want to earn badges for achievements throughout my learning journey,
so that I feel rewarded and motivated to continue.

#### Acceptance Criteria

1. Tabela `badges` no Supabase: id, name, description, icon, criteria_type, criteria_value, rarity (common, rare, epic, legendary)
2. Tabela `user_badges`: user_id, badge_id, earned_at
3. Badges iniciais (minimo 15):
   - Primeiro Passo (completou checkpoint 1.1)
   - Abertura Criativa (completou modulo 1)
   - Vendedor de Sonhos (completou modulo 2)
   - Mestre da Estrutura (completou modulo 3)
   - Contador de Historias (completou modulo 4)
   - Aplauso de Pe (completou modulo 5)
   - Expresso (completou trilha Express)
   - Dedicado (7 dias consecutivos de estudo)
   - Incansavel (30 dias consecutivos de estudo)
   - Nota 10 (score >= 90% em quiz)
   - Explorador (acessou todos os conceitos)
   - Anotador (criou 10 notas pessoais)
   - Projeto Final (completou projeto final)
   - Metodo Completo (completou trilha Master)
   - Perfeccionista (100% dos checkpoints completados)
4. Notificacao visual (toast + animacao) ao conquistar badge
5. Pagina de badges exibe todas as badges com estado (conquistada/nao conquistada) e criterio
6. Badge rarity influencia visual (brilho, moldura, efeito)

### Story 4.2: Streak and Engagement Mechanics

As a student,
I want to see my study streak and receive incentives to maintain consistency,
so that I build a daily study habit.

#### Acceptance Criteria

1. Streak tracking: conta dias consecutivos com pelo menos 1 checkpoint completado
2. Streak visivel no header e no dashboard (icone de fogo + numero)
3. Alerta "Nao perca seu streak!" via notificacao se ultimo acesso foi >20h atras (via Supabase Edge Function + email)
4. Freeze day: aluno tem 1 "freeze" por semana para nao perder streak
5. Streak milestones: 7 dias, 14 dias, 30 dias, 60 dias, 100 dias (cada um desbloqueia badge)
6. Calendario de atividade no perfil (estilo GitHub contribution graph)
7. Dados de streak no Supabase com calculo server-side para evitar manipulacao

### Story 4.3: Progress Celebrations and Micro-Rewards

As a student,
I want to receive visual celebrations when I complete milestones,
so that the learning journey feels rewarding and exciting.

#### Acceptance Criteria

1. Animacao de confetti ao completar modulo
2. Animacao sutil (pulse, glow) ao completar checkpoint
3. Sound effect opcional (desligavel) em conquistas
4. Modal de "Parabens!" com stats do modulo ao completar
5. Progresso visual na barra do header com animacao smooth
6. "Proxima conquista" visivel no dashboard mostrando proximo badge e quanto falta
7. Tela de celebracao especial ao completar todos os 29 checkpoints
8. Animacoes respeitam `prefers-reduced-motion`

---

## Epic 5: Social and Instructor Features (v3.0)

**Goal:** Adicionar camada social com comunidade de alunos, forum de discussao, analytics avancado para instrutor e integracao com video player. Este epic esta fora do escopo das 20h iniciais e sera planejado apos entrega de v2.0.

### Story 5.1: Integrated Video Player

As a student,
I want to watch instructor videos alongside the course content,
so that I can learn through multiple modalities (text + video).

#### Acceptance Criteria

1. Video player responsivo integrado nas paginas de modulo
2. Suporte a videos do Vimeo/YouTube via embed ou player customizado
3. Timestamp markers sincronizados com conceitos (click no conceito pula para timestamp relevante)
4. Progresso de video rastreado (contribui para checkpoints)
5. Modo picture-in-picture para continuar lendo enquanto assiste

### Story 5.2: Student Community and Discussion Forum

As a student,
I want to discuss with other students and share my progress,
so that I feel part of a learning community.

#### Acceptance Criteria

1. Forum de discussao por modulo (threads, respostas, likes)
2. Perfil publico com badges e progresso (opt-in)
3. Feed de atividade da comunidade no dashboard
4. Notificacoes de respostas e mencoes
5. Moderacao basica pelo instrutor

### Story 5.3: Advanced Instructor Analytics

As an instructor,
I want detailed analytics about student behavior and content effectiveness,
so that I can improve the course based on data.

#### Acceptance Criteria

1. Heatmap de engajamento por secao de conteudo
2. Funil de conversao (cadastro -> inicio -> modulo 1 -> ... -> projeto final)
3. Analise de pontos de abandono (onde alunos param)
4. Comparacao de desempenho entre trilhas
5. Exportacao de relatorios em CSV/PDF
6. Alertas automaticos para metricas abaixo de thresholds

### Story 5.4: Live Sessions Integration

As a student,
I want to join live sessions with the instructor,
so that I can ask questions and get real-time feedback.

#### Acceptance Criteria

1. Calendario de sessions proximas no dashboard
2. Integracao com plataforma de video (Zoom/Google Meet) via link
3. Gravacao das sessions disponivel para replay
4. Chat ao vivo durante session
5. Perguntas poderem ser votadas pela comunidade antes da session

---

## Checklist Results Report

### Executive Summary

- **Overall PRD completeness:** 92%
- **MVP scope appropriateness:** Just Right (v1.1 entrega valor com dados reais e progresso; v2.0 adiciona auth e features avancadas)
- **Readiness for architecture phase:** Ready
- **Most critical item:** Supabase schema design precisa validacao do data-engineer antes de implementacao

### Category Analysis Table

| Category | Status | Critical Issues |
|----------|--------|----------------|
| 1. Problem Definition and Context | PASS | Nenhum |
| 2. MVP Scope Definition | PASS | Timeline de 20h e agressivo para Epic 1-2 completos |
| 3. User Experience Requirements | PASS | Wireframes precisam ser criados pelo design-chief |
| 4. Functional Requirements | PASS | FR10 (grafo) e FR15 (PDF) sao os mais complexos |
| 5. Non-Functional Requirements | PASS | NFR11 (offline) pode ser descoped para v3.0 se timeline apertar |
| 6. Epic and Story Structure | PASS | 5 epics com 20 stories bem sequenciadas |
| 7. Technical Guidance | PASS | Stack definida e validada contra existente |
| 8. Cross-Functional Requirements | PARTIAL | Schema Supabase precisa review do data-engineer |
| 9. Clarity and Communication | PASS | Nenhum |

### Top Issues by Priority

**BLOCKERS:** Nenhum blocker identificado.

**HIGH:**
- Schema Supabase deve ser validado pelo @data-engineer antes de Story 1.3
- Design system completo deve ser criado pelo design-chief antes de Story 1.5 (paginas de modulo)
- Gamificacao (Epic 4) deve ser enriquecida pelo squad dopamine-learning antes de implementacao

**MEDIUM:**
- Quizzes (Story 3.3) requerem criacao manual de questoes - considerar usar IA para gerar draft inicial
- Certificados PDF (Story 3.5) precisam design visual aprovado pelo instrutor
- NFR11 (offline/Service Worker) pode ser complexo demais para timeline - candidato a descope para v3.0

**LOW:**
- Internationalizacao (i18n) nao esta no escopo mas estrutura deve ser preparada
- PWA manifest pode ser adicionado como Story separada em Epic 1

### MVP Scope Assessment

- **Essential para v1.1 (Epic 1):** Stories 1.1-1.8 sao todas necessarias e bem dimensionadas. Cada story e completavel por um agente em 1-3 horas.
- **Essential para v2.0 (Epics 2-4):** Auth (2.1), progress migration (2.2) e badges basicos (4.1) sao core. Quizzes (3.3) e certificados (3.5) podem ser descoped se timeline apertar.
- **Nice-to-have descope candidates:** NFR11 (offline), Story 3.2 (grafo - pode ser simplificado para lista), Story 5.x (todo Epic 5 e futuro)
- **Timeline realism:** 20h para Epic 1 (8 stories) e factivel se agentes trabalham em paralelo. Epic 2-4 precisa de estimativa separada.

### Technical Readiness

- **Stack validada:** Next.js 16.1.6, React 19.2.3, Tailwind v4, Zustand 5.0, Radix UI - tudo ja no package.json do MVP
- **Supabase:** Free tier suficiente para escala inicial (< 500 alunos)
- **Netlify:** Free tier suficiente para trafego inicial
- **Riscos identificados:** Zustand persist hydration mismatch (gotcha documentado), Supabase RLS complexity, Next.js 16 + Netlify compatibility
- **Areas para investigacao do arquiteto:** Melhor library para grafo de conceitos, strategy para geracao de PDF server-side, Supabase Edge Functions para streak calculation

### Recommendations

1. **Prioridade 1:** Aprovar PRD e iniciar Epic 1 imediatamente - e o valor entregue mais rapido
2. **Prioridade 2:** Ativar squad dopamine-learning para enriquecer Epic 4 (gamificacao) em paralelo
3. **Prioridade 3:** Ativar design-chief para criar design system completo e wireframes em paralelo com Story 1.1-1.3
4. **Prioridade 4:** Ativar @architect para criar documento de arquitetura baseado neste PRD
5. **Descope candidato:** Mover NFR11 (offline/Service Worker) para v3.0 para manter timeline realista

---

## Next Steps

### UX Expert Prompt

> @ux-design-expert Crie o design system completo e wireframes para a plataforma educacional "Metodo Aplauda de Pe" baseado no PRD em `docs/product/PRD.md`. Foco em: (1) design system com tokens, componentes e patterns; (2) wireframes para as 10 core screens listadas no PRD; (3) user flows para os fluxos criticos: onboarding, selecao de trilha, estudo de modulo com checkpoints, e conquista de badge. O MVP existe em `app/` com componentes basicos ja implementados - expanda a partir do existente. Mobile-first, WCAG 2.1 AA obrigatorio.

### Architect Prompt

> @architect Crie o documento de arquitetura para a plataforma educacional "Metodo Aplauda de Pe" baseado no PRD em `docs/product/PRD.md`. Stack: Next.js 16.1.6 (App Router), React 19.2.3, Tailwind v4, Zustand 5.0, Radix UI, Supabase (PostgreSQL + Auth + Storage), Netlify hosting, GitHub Actions CI/CD. Foco em: (1) folder structure do Next.js app; (2) Supabase schema detalhado com RLS policies; (3) data flow architecture (JSON import -> Supabase migration path); (4) state management strategy (Zustand stores); (5) testing strategy; (6) deployment pipeline architecture. Projeto existente em `/Users/luizfosc/Projects/knowledge-base-renner-silva/`.

---

*Document generated by Morgan (Strategist) - PM Agent*
*Version 1.0 - 2026-02-13*
