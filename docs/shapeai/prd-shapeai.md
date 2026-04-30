# ShapeAI — Product Requirements Document (PRD)

**Versão:** 1.0 | **Data:** Abril 2026 | **Status:** Aprovado  
**Autor:** Morgan (@pm) | **Input:** Project Brief v1.0 (Atlas @analyst)

---

## Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| Abr 2026 | 1.0 | Versão inicial aprovada | Morgan (@pm) |

---

## 1. Goals and Background Context

### Goals

- Democratizar o acesso à avaliação corporal profissional via smartphone, sem hardware adicional
- Entregar análise personalizada de shape (pontos fortes + desenvolvimento) a partir de fotos com AR
- Gerar plano de treino específico para o perfil corporal identificado, com evolução mensal
- Atingir 10.000 usuários ativos em 6 meses e MRR de R$ 150K no Ano 1
- Converter ≥ 15% dos usuários Free para Pro

### Background Context

O mercado de fitness no Brasil concentra 40M+ de frequentadores de academia, a maioria sem acesso a avaliação corporal estruturada — o custo de uma avaliação profissional varia de R$ 150 a R$ 500 por sessão e depende de equipamentos especializados. Apps existentes (Freeletics, Nike Training, FitnessAI) oferecem treinos genéricos sem considerar o shape real do usuário, resultando em 80% de abandono nos primeiros 3 meses por falta de direcionamento personalizado.

O ShapeAI posiciona-se na interseção entre avaliação corporal profissional (cara, inacessível) e apps de treino genéricos (acessíveis, mas impessoais) — usando visão computacional e IA generativa para entregar personalização real a partir de uma foto, com o smartphone do usuário como único requisito. O foco inicial é exclusivamente B2C, priorizando a validação do produto com usuários finais antes de qualquer expansão para canais institucionais.

---

## 2. Requirements

### Functional Requirements

- **FR1:** O sistema deve permitir cadastro e login via email/senha e autenticação social (Google, Apple)
- **FR2:** O usuário deve poder inserir dados de perfil básicos: altura, peso, sexo biológico e objetivo principal (hipertrofia, emagrecimento, condicionamento)
- **FR3:** O app deve exibir guia de captura com overlay AR indicando posicionamento correto para foto frontal e foto de costas
- **FR4:** O sistema deve processar as fotos enviadas e retornar análise de shape com mapeamento de proporções musculares, postura e simetria estimada
- **FR5:** O sistema deve gerar relatório com seções de pontos fortes e pontos de desenvolvimento, usando linguagem positiva e técnica
- **FR6:** O sistema deve gerar plano de treino semanal de 4–6 semanas baseado no relatório de análise e objetivo do usuário
- **FR7:** O plano de treino deve detalhar exercícios, séries, repetições e descanso para cada sessão
- **FR8:** O usuário deve poder visualizar o histórico de análises anteriores com comparativo visual entre datas
- **FR9:** O modelo Freemium deve permitir 1 análise gratuita completa; análises subsequentes requerem assinatura ativa
- **FR10:** O sistema deve enviar notificação mensal convidando o usuário a realizar nova análise para acompanhar o progresso

### Non-Functional Requirements

- **NFR1:** A análise de foto deve ser concluída em ≤ 10 segundos após o envio
- **NFR2:** O app deve funcionar em iOS 16+ e Android 12+
- **NFR3:** Fotos corporais devem ser processadas e descartadas do servidor após análise — não armazenadas permanentemente sem consentimento explícito do usuário
- **NFR4:** O sistema deve estar em conformidade com LGPD (Brasil) e GDPR (Europa) para tratamento de dados biométricos
- **NFR5:** Todas as telas de resultado devem exibir disclaimer: "Esta análise é uma estimativa técnica e não substitui avaliação médica ou de profissional de educação física"
- **NFR6:** O app deve ter disponibilidade de ≥ 99.5% para as funções de análise e geração de plano
- **NFR7:** A captura de foto deve funcionar offline — o upload e processamento ocorrem quando há conectividade

---

## 3. User Interface Design Goals

### Overall UX Vision

App mobile com experiência clean, motivacional e científica — equilíbrio entre a precisão de uma ferramenta de análise e o encorajamento de um coach pessoal. Cada tela deve transmitir confiança nos dados sem intimidar o usuário. O fluxo principal (foto → relatório → plano) deve ser completável em menos de 5 minutos no primeiro acesso.

### Key Interaction Paradigms

- **Guided Flow:** Onboarding linear com progresso visível (steps 1/3, 2/3, 3/3)
- **Camera-First:** Captura de foto como ação central do app, com AR overlay para guiar o usuário
- **Card-based Results:** Relatório e plano apresentados em cards scrolláveis, não em texto corrido
- **Progressive Disclosure:** Detalhes técnicos da análise opcionais — usuário vê resumo por padrão, aprofunda se quiser

### Core Screens and Views

1. **Onboarding / Cadastro** — registro, dados básicos (altura, peso, objetivo)
2. **Home / Dashboard** — status da análise atual, CTA para nova análise, progresso resumido
3. **Captura de Foto** — câmera com AR overlay guiando posicionamento (frente e costas)
4. **Análise em Progresso** — loading screen com feedback visual enquanto IA processa
5. **Relatório de Shape** — pontos fortes, pontos de desenvolvimento, métricas visuais
6. **Plano de Treino** — visão semanal, detalhe de cada sessão com exercícios
7. **Histórico** — timeline de análises anteriores com comparativo visual
8. **Paywall / Assinatura** — apresentação dos planos Free vs Pro com CTA claro
9. **Perfil / Configurações** — dados do usuário, preferências, privacidade

### Accessibility

WCAG AA — garantir contraste adequado e suporte a leitores de tela nas telas principais.

### Branding

- Paleta: tons escuros com accent de energia (laranja ou verde-neon) — transmite performance e tecnologia
- Tipografia: sans-serif moderna, peso variável para hierarquia clara
- Iconografia: minimalista, estilo outline
- Tom visual: científico-motivacional (referência estética: Whoop ou Oura, não apps de dieta)

### Target Platforms

**Mobile Only** — iOS 16+ e Android 12+. Web não está no escopo do MVP.

---

## 4. Technical Assumptions

### Repository Structure

**Monorepo** — `apps/mobile` + `services/api-gateway` + `services/ai-engine` em repositório único.

### Service Architecture

| Serviço | Responsabilidade |
|---------|-----------------|
| `api-gateway` | REST API principal, auth, roteamento |
| `ai-engine` | Processamento de foto (Vision AI) + geração de relatório/plano (LLM) |
| `storage-service` | Gestão de fotos com política de retenção (descarte pós-análise) |
| `notification-service` | Push notifications mensais de re-análise |

### Testing Requirements

**Unit + Integration:**
- Unit tests para lógica de negócio (geração de plano, scoring de análise)
- Integration tests para fluxo foto → análise → relatório
- Testes de privacidade: verificar que fotos são descartadas após processamento

### Additional Technical Assumptions

- **Frontend Mobile:** React Native (Expo) — iOS + Android em codebase única
- **Backend:** Node.js (API Gateway) + Python (AI Engine)
- **Vision AI:** Google MediaPipe para body landmark detection
- **LLM:** Claude `claude-sonnet-4-6` via Anthropic API com prompt caching para geração de relatório e plano
- **Database:** PostgreSQL (dados estruturados) + AWS S3 (armazenamento temporário de fotos)
- **Auth:** Supabase Auth (email/senha + OAuth Google/Apple)
- **Infraestrutura:** AWS (ECS, RDS, S3)
- **Assinaturas:** RevenueCat (iOS App Store + Google Play)
- **Push Notifications:** Expo Push Notifications
- **Compliance:** DPA obrigatório pré-lançamento; disclaimer médico via componente global reutilizável

---

## 5. Epic List

| # | Épico | Goal |
|---|-------|------|
| 1 | Foundation & User Onboarding | Infraestrutura, CI/CD, autenticação e perfil do usuário |
| 2 | Shape Analysis Engine | Captura AR, análise Vision AI, relatório e plano de treino |
| 3 | Monetização Freemium | Enforcement de limite, paywall e integração com lojas |
| 4 | Histórico & Retenção | Timeline de análises, comparativo de progresso e notificações |

---

## 6. Epic Details

---

### Epic 1: Foundation & User Onboarding

**Goal:** Estabelecer a infraestrutura completa do projeto (monorepo, CI/CD, cloud, banco de dados) e entregar o fluxo de autenticação e criação de perfil — app funcional, testável e deployável desde o primeiro épico.

---

#### Story 1.1 — Project Foundation & Canary Deploy

*As a developer, I want a configured monorepo with CI/CD and a deployed canary screen, so that the team has a stable, automated foundation to build upon.*

**Acceptance Criteria:**
1. Monorepo configurado com estrutura: `apps/mobile`, `services/api-gateway`, `services/ai-engine`
2. App React Native (Expo) inicializa sem erros em iOS e Android
3. API Gateway (Node.js) responde `GET /health` com `{ status: "ok" }` em < 200ms
4. Pipeline CI/CD configurado (GitHub Actions) com jobs de lint, typecheck e testes para cada serviço
5. Ambientes de staging e produção provisionados na AWS (ECS + RDS PostgreSQL + S3)
6. Canary screen exibida no app com texto "ShapeAI — Coming Soon" confirma deploy mobile funcional

---

#### Story 1.2 — User Authentication

*As a new user, I want to create an account and log in via email or social login, so that I can access my personal data securely.*

**Acceptance Criteria:**
1. Telas de Sign Up e Login implementadas com campos de email/senha e validação de formulário
2. Autenticação via Google OAuth funcional em iOS e Android
3. Autenticação via Apple Sign In funcional em iOS
4. Supabase Auth integrado — tokens JWT gerenciados automaticamente com refresh silencioso
5. Usuário autenticado é redirecionado para onboarding (primeiro acesso) ou Home (acessos subsequentes)
6. Fluxo de "Esqueci minha senha" funcional via email de recuperação
7. Sessão persiste após fechar e reabrir o app

---

#### Story 1.3 — User Profile Onboarding

*As a new user, I want to fill in my physical profile and fitness goal after signing up, so that the app can personalize my experience from the start.*

**Acceptance Criteria:**
1. Fluxo de onboarding exibido obrigatoriamente no primeiro acesso pós-cadastro com indicador de progresso (step 1/2, 2/2)
2. Campos obrigatórios: altura (cm), peso (kg), sexo biológico (M/F), objetivo principal (hipertrofia / emagrecimento / condicionamento)
3. Validação de inputs: altura entre 100–250cm, peso entre 30–300kg
4. Dados de perfil salvos no PostgreSQL vinculados ao `user_id` do Supabase
5. Tela de edição de perfil acessível via Configurações para atualização posterior
6. Usuário sem perfil completo não avança para a Home — fluxo de onboarding é bloqueante

---

### Epic 2: Shape Analysis Engine

**Goal:** Implementar o núcleo do produto — captura guiada por AR, processamento via Vision AI e geração de relatório de shape com plano de treino personalizado via LLM. Ao final deste épico, o usuário completa o fluxo central de valor do ShapeAI do início ao fim.

---

#### Story 2.1 — AR Camera Capture & Photo Upload

*As a user, I want guided AR overlays to help me position my body correctly for photos, so that the app captures accurate images for analysis.*

**Acceptance Criteria:**
1. Tela de câmera abre com overlay AR exibindo silhueta de referência para foto frontal e foto de costas
2. Instruções textuais exibidas na tela indicam: distância recomendada (2–3m), iluminação, roupa adequada
3. Botão de captura habilitado apenas quando câmera detecta figura humana na área do overlay (via MediaPipe básico on-device)
4. Usuário captura mínimo 2 fotos (frente + costas) — app não avança com menos
5. Preview das fotos capturadas exibido com opção de recapturar individualmente antes de enviar
6. Fotos enviadas para AWS S3 com URL temporária (TTL 24h) — não armazenadas permanentemente
7. Upload com indicador de progresso; falhas de rede exibem mensagem de erro com opção de retry
8. Foto capturada offline é enfileirada e enviada automaticamente quando conectividade é restaurada

---

#### Story 2.2 — Vision AI Body Analysis

*As a user, I want my photos to be analyzed by AI to map my muscle proportions and posture, so that I receive objective data about my physique.*

**Acceptance Criteria:**
1. `ai-engine` (Python) recebe URLs das fotos do S3 e processa via MediaPipe Pose para extração de body landmarks
2. Sistema calcula métricas de: proporções musculares (ombro/cintura/quadril), simetria bilateral e desvios de postura
3. Score normalizado (0–100) gerado para cada grupo muscular principal (ombros, peito, costas, braços, core, pernas)
4. Resultado bruto da análise salvo no PostgreSQL vinculado ao `user_id` e timestamp
5. Tela de "Análise em progresso" exibida com feedback visual animado durante processamento
6. Processamento completo em ≤ 10 segundos em condições normais de rede
7. Em caso de falha (foto ilegível, baixa qualidade), mensagem clara orienta o usuário a recapturar
8. Fotos deletadas do S3 imediatamente após extração dos landmarks — política de retenção zero

---

#### Story 2.3 — Shape Report Generation

*As a user, I want to receive a detailed report of my body strengths and development points, so that I understand what to focus on in my training.*

**Acceptance Criteria:**
1. Claude API (`claude-sonnet-4-6`) recebe scores da análise + perfil do usuário e gera relatório estruturado em português
2. Relatório contém seção "Pontos de Destaque" (top 3 grupos musculares mais desenvolvidos) com descrição positiva e técnica
3. Relatório contém seção "Oportunidades de Desenvolvimento" (top 3 grupos prioritários) com linguagem encorajadora — nunca negativa
4. Prompt caching ativado no Claude API para template base do relatório — reduz latência e custo em re-análises
5. Tela de Relatório exibe cards scrolláveis com ícones musculares, scores visuais e descrições geradas
6. Disclaimer médico exibido de forma visível no topo da tela de resultado
7. Relatório salvo no PostgreSQL associado à análise — acessível no histórico futuramente
8. Tempo total foto → relatório na tela ≤ 15 segundos

---

#### Story 2.4 — Personalized Workout Plan Generation

*As a user, I want a personalized workout plan generated from my shape analysis, so that I train exactly what my body needs to develop.*

**Acceptance Criteria:**
1. Claude API gera plano de treino de 4 semanas com base nos scores da análise + objetivo do usuário
2. Plano estruturado em dias de treino semanais (3x, 4x ou 5x por semana conforme objetivo)
3. Cada sessão detalha: grupo muscular foco, lista de exercícios com nome, séries, repetições e tempo de descanso
4. Exercícios priorizados conforme pontos de desenvolvimento identificados no relatório (Story 2.3)
5. Tela de Plano de Treino exibe visão semanal navegável com cards por dia e detalhe expandível por sessão
6. Plano salvo no PostgreSQL vinculado à análise correspondente
7. Usuário pode navegar entre Relatório e Plano via abas na mesma tela sem nova chamada à API
8. Plano gerado em ≤ 10 segundos adicionais após o relatório

---

### Epic 3: Monetização Freemium

**Goal:** Implementar o modelo de negócio do ShapeAI — controle do limite gratuito, paywall e integração com sistema de assinaturas para iOS e Android. Ao final deste épico, o app está pronto para gerar receita real.

---

#### Story 3.1 — Freemium Enforcement & Paywall Trigger

*As a product, I want to track and enforce the free analysis limit per user, so that the monetization model is respected and users are prompted to subscribe at the right moment.*

**Acceptance Criteria:**
1. Sistema rastreia contagem de análises completadas por `user_id` no PostgreSQL
2. Usuários no plano Free têm limite de 1 análise completa (relatório + plano)
3. Ao tentar iniciar segunda análise sem assinatura, usuário é redirecionado para tela de Paywall antes da captura de foto
4. Badge "Free" / "Pro" exibido discretamente na Home indicando plano atual do usuário
5. Usuário Pro não encontra nenhuma barreira no fluxo de análise — limite não se aplica
6. Lógica de enforcement executada no backend (API Gateway) — não apenas no cliente
7. Análise iniciada mas não completada (ex: erro de rede) não é contabilizada no limite

---

#### Story 3.2 — Paywall UI & Plan Presentation

*As a free user, I want to see a clear comparison between Free and Pro plans, so that I can make an informed decision about subscribing.*

**Acceptance Criteria:**
1. Tela de Paywall exibe comparativo visual entre planos Free e Pro em formato de cards
2. Benefícios Pro listados com clareza: análises ilimitadas, histórico completo, notificações de progresso
3. Preço do plano Pro exibido de forma destacada: mensal (R$ 39,90) e anual (R$ 299,90 — destaque de economia)
4. CTA primário "Assinar Pro" leva ao fluxo de compra nativo (Story 3.3)
5. Opção "Continuar grátis" disponível — fecha o paywall sem bloquear o usuário no app
6. Tela de Paywall acessível também via menu de Perfil / Configurações
7. Layout adaptado para diferentes tamanhos de tela (iPhone SE ao Pro Max, Android compact ao tablet)

---

#### Story 3.3 — Subscription Purchase & RevenueCat Integration

*As a user, I want to purchase a Pro subscription through my device's native store, so that I can unlock unlimited analyses securely and conveniently.*

**Acceptance Criteria:**
1. RevenueCat SDK integrado no app React Native e configurado com produtos do App Store (iOS) e Google Play (Android)
2. Fluxo de compra nativo iniciado ao tocar "Assinar Pro" — sheet nativa da App Store / Google Play abre sem sair do app
3. Compra bem-sucedida atualiza status do usuário para Pro no banco de dados via webhook RevenueCat → API Gateway
4. Status Pro refletido no app em ≤ 5 segundos após confirmação da compra
5. Restore de compras funcional: botão "Restaurar compra" na tela de Paywall
6. Cancelamento de assinatura gerenciado pela loja nativa — acesso Pro mantido até fim do período pago
7. Usuário com assinatura expirada é rebaixado automaticamente para Free com notificação informativa
8. Modo sandbox de testes configurado para QA validar fluxo de compra sem cobrança real

---

### Epic 4: Histórico & Retenção

**Goal:** Entregar o loop de retenção do ShapeAI — histórico visual de análises, comparativo de progresso entre datas e notificação mensal de re-análise. Ao final deste épico, o produto está completo para o MVP.

---

#### Story 4.1 — Analysis History Timeline

*As a user, I want to see all my past analyses organized by date, so that I can track my fitness journey over time.*

**Acceptance Criteria:**
1. Tela de Histórico exibe lista cronológica inversa de todas as análises realizadas pelo usuário
2. Cada item da lista mostra: data da análise, thumbnail da foto frontal e resumo dos top 2 pontos de desenvolvimento
3. Tap em qualquer item da lista abre o relatório e plano de treino completos daquela análise (read-only)
4. Análise atual (mais recente) destacada visualmente com badge "Atual"
5. Estado vazio exibido com CTA para realizar primeira análise
6. Histórico carregado com paginação (10 itens por página)
7. Tela de Histórico acessível via tab de navegação principal do app

---

#### Story 4.2 — Progress Comparison

*As a user, I want to compare two analyses side by side, so that I can see clearly how my physique has evolved.*

**Acceptance Criteria:**
1. Na tela de Histórico, usuário pode selecionar 2 análises para comparação via modo de seleção múltipla
2. Tela de Comparação exibe fotos frontais das duas análises lado a lado com datas visíveis
3. Comparativo de scores por grupo muscular exibido em formato de barras com delta (▲ +12 ombros)
4. Seção "O que mudou" gerada pelo LLM destacando principais evoluções e pontos que ainda precisam de atenção
5. Botão de compartilhamento gera imagem estática do comparativo para redes sociais (feature exclusiva Pro)
6. Usuário Free pode visualizar comparativo mas compartilhamento requer assinatura Pro

---

#### Story 4.3 — Monthly Re-analysis Push Notification

*As a user, I want to receive a monthly reminder to take new photos, so that I stay consistent and track my progress over time.*

**Acceptance Criteria:**
1. App solicita permissão de push notification durante onboarding com explicação do valor
2. Notificação agendada 30 dias após cada análise completada (relativa à última análise, não calendário fixo)
3. Texto da notificação varia entre 3 templates para evitar repetição
4. Tap na notificação abre o app diretamente na tela de captura de foto (deep link)
5. Usuário pode desativar notificações via Configurações do app sem desativar notificações do sistema
6. Notificação não enviada se usuário já realizou análise nos últimos 25 dias (janela de tolerância)
7. Integração com Expo Push Notifications funcional em iOS e Android

---

## 7. Next Steps

### UX Expert Prompt

> @ux-design-expert — PRD do ShapeAI aprovado. Inicie o design de arquitetura de UX usando `docs/shapeai/prd-shapeai.md` como input. Foco nas telas de captura AR (Story 2.1), tela de Relatório (Story 2.3) e Paywall (Story 3.2). Mobile Only, iOS + Android.

### Architect Prompt

> @architect — PRD do ShapeAI aprovado. Inicie a arquitetura técnica usando `docs/shapeai/prd-shapeai.md` como input. Decisões críticas: (1) on-device vs server-side para MediaPipe, (2) estrutura de dados para scores de análise no PostgreSQL, (3) pipeline de deleção de fotos pós-processamento para compliance LGPD. Monorepo, React Native + Node.js + Python + AWS.

---

*Gerado por Morgan (@pm) — AIOS Product Manager Agent*  
*Input: Project Brief ShapeAI v1.0 (Atlas @analyst)*  
*Synkra AIOS v4.0*
