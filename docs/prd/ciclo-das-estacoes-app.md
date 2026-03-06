# PRD — Aplicativo Ciclo das Estações

**Produto:** Ciclo das Estações — PWA Full-Stack
**Organizacao:** Base Tríade | iAi ECOssistema Base Tríade
**Autor:** Morgan (@pm) com inputs de Bob (Eliezer)
**Data:** 2026-03-05
**Versao:** 1.0
**Status:** Draft

---

## 1. Visao Geral

### 1.1 Missao

Criar um aplicativo web progressivo (PWA) para gestão, venda de ingressos, captacao de leads e comunidade do programa "Ciclo das Estações" da Base Tríade — o primeiro programa de autocuidado cíclico voltado para terapeutas holisticos, aberto a qualquer pessoa interessada.

### 1.2 Problema

O paradoxo do "Curador Ferido" (arquetipo de Chiron): terapeutas holisticos absorvem a dor dos pacientes sem processar a propria. 44% relatam fadiga por compaixao, 30-60% apresentam sinais de burnout. Ninguem no Brasil oferece uma solucao ciclica, sazonal e comunitaria para isso.

### 1.3 Solucao

Plataforma digital que:
- Gerencia 8 eventos anuais (4 ciclos sazonais + 4 sabbats avulsos)
- Vende ingressos com pricing dinamico (early bird / regular / last minute)
- Capta e nutre leads automaticamente
- Oferece ferramentas de comunidade e jornada continua (GET137)
- Fornece admin completo e editavel para gestão sem dependencia tecnica

### 1.4 Publico-Alvo

- **Primario:** Terapeutas holisticos, facilitadores de bem-estar, praticantes de yoga, profissionais de saúde integrativa
- **Secundario:** Qualquer pessoa interessada em autocuidado cíclico e reconexão com a natureza
- **Nota:** O programa e VOLTADO PARA terapeutas, mas NAO EXCLUSIVO — aberto a todos

### 1.5 Metricas de Sucesso (Ano 1)

| KPI | Baseline | Meta |
|-----|----------|------|
| Passaportes Anuais vendidos | 0 | 15 |
| Participacoes ciclo avulso | 0 | 40 |
| Participacoes evento avulso | 0 | 60 |
| Leads captados | 0 | 500 |
| NPS pos-evento | - | >= 8.5 |
| Receita total | 0 | R$ 93.855 |

---

## 2. Stakeholders

| Papel | Quem | Responsabilidade |
|-------|------|------------------|
| Direcao e Estrategia | Bob (Eliezer Cardoso) | Visao, tecnologia, NH2CDI, espaco |
| Facilitadora Principal | Daniela Lopper (@podprana) | Podcaster, terapeuta, desenvolvimento pessoal |
| Facilitadora Principal | Milena Koch (@koch.milenar) | Terapeuta holistica, processos regenerativos |
| Gestoras | 3 vagas (a definir) | Operacao dos eventos |
| Facilitadores | Pool de 5+ terapeutas | Workshops sazonais |

---

## 3. Requisitos Funcionais

### FR-01: Gestão de Eventos (Admin)

**Principio: TUDO editavel pelo admin.**

O administrador deve poder criar, editar e gerenciar eventos sem conhecimento tecnico.

#### FR-01.1: CRUD de Eventos
- Criar evento com: nome, subtítulo, descrição (rich text), estação (Primavera/Verão/Outono/Inverno/Cross-Quarter), evento astronomico associado, elemento MTC, sistema de orgaos MTC
- Definir datas de inicio e fim (editavel)
- Definir capacidade maxima (editavel, de 1 até N — sem limite hardcoded)
- Definir local/venue (editavel, default: "Base Tríade - Barra Velha/SC")
- Toggle publicado/nao publicado
- Toggle esgotado (automatico quando vagas = 0, mas override manual)
- Listar práticas incluidas (array editavel)
- Upload de galeria de imagens com ordenacao drag-and-drop
- CRUD de FAQs por evento com ordenacao

#### FR-01.2: Cronograma de Atividades por Evento
- CRUD de atividades: horário, título, descrição, duração (minutos), facilitador associado (opcional)
- Ordenacao drag-and-drop
- Atividades vinculadas a um evento especifico

#### FR-01.3: CRUD de Facilitadores
- Dados: nome, papel/título, bio (rich text), foto (upload), instagram, email, telefone
- Especialidades (array editavel)
- Toggle "destaque" para facilitadores principais
- Associar facilitadores a eventos (relacao N:N)
- Associar facilitador a atividades especificas

#### FR-01.4: Gestão de Tipos de Ingresso
- Criar multiplos tipos de ingresso por evento (ex: "Passaporte Sabado", "Surf Domingo")
- Definir precos editaveis:
  - Preco early bird (opcional) + data limite early bird
  - Preco regular (obrigatório)
  - Preco last minute (opcional) + data inicio last minute
- Definir descrição e lista de "inclui" (array editavel)
- Definir quantidade disponível (editavel)
- Contador de vendidos (automatico)
- Pricing calculado automaticamente pela data atual vs datas configuradas

#### FR-01.5: Gestão de Produtos (Passaportes e Guias)
- CRUD de produtos alem de ingressos: Passaporte Anual (R$ 1.997), Guia Farmacia Viva (R$ 97)
- Precos editaveis
- Descricao e beneficios editaveis
- Quantidade disponível (ou ilimitado)
- Parcelamento configuravel (número de parcelas, desconto a vista)

### FR-02: Inscrições e Checkout

#### FR-02.1: Fluxo de Inscrição
- Selecionar evento → escolher tipo de ingresso → preencher dados → pagamento
- Dados do participante: nome, email, telefone, CPF
- Campos opcionais: restricoes alimentares, primeira vez? (sim/nao)
- Gerar QR Code único por inscrição (funciona offline)
- Status da inscrição: PENDING → CONFIRMED → CANCELLED → REFUNDED → TRANSFERRED

#### FR-02.2: Pagamentos
- **PIX** via MercadoPago (prioritario — já integrado)
- **Cartao de crédito** via Stripe
- **Boleto** via MercadoPago
- Webhook unificado para confirmação automatica
- Timeout de pagamento configuravel (default: 30 min para PIX)
- Valores em centavos internamente, exibicao em reais

#### FR-02.3: Política de Cancelamento (editavel no admin)
- Defaults:
  - +15 dias antes: 80% reembolso
  - 7-14 dias antes: 50% reembolso
  - <7 dias: sem reembolso (transferência para outra pessoa permitida)
  - No-show: perdido
- Admin pode editar percentuais e prazos por evento
- Transferencia de inscrição para outro participante (sem custo)
- Contingencia climatica: reagendamento com 48h aviso, crédito integral ou 80% reembolso

#### FR-02.4: Hospedagem (Cross-selling)
- Ao finalizar inscrição, oferecer quartos na Sun House
- Quartos e precos editaveis no admin (default: R$ 250/noite)
- Opcoes: 4 quartos tematicos + Cabana Beija-Flor
- Integracao com checkout (adicionar ao carrinho)

### FR-03: Captacao de Leads

#### FR-03.1: Canais de Captacao
- Formulário de interesse na home (email + nome + estação de interesse)
- Quiz de Constituicao (Dosha/MTC) — captura rica com segmentacao
- Checkout abandonado — recuperacao automatica
- Exit intent — modal ao tentar sair da pagina
- Lista de espera para eventos esgotados
- Download de conteúdo rico (e-books, meditacoes)

#### FR-03.2: Dados do Lead
- Email (obrigatório), nome, telefone (opcionais)
- Source e UTM tracking (utm_source, utm_medium, utm_campaign)
- Estações de interesse (multi-select)
- Resultado do quiz de constituicao (JSON)
- Contadores: emails enviados, emails abertos

#### FR-03.3: Conversao
- Flag de conversao quando lead vira usuario registrado
- Data de conversao rastreada
- Funil visivel no admin

### FR-04: Perfil e Comunidade

#### FR-04.1: Perfil de Usuario
- Dados basicos: nome, email, telefone, CPF
- Role: USER | THERAPIST | FACILITATOR | ADMIN
- Foto de perfil

#### FR-04.2: Perfil de Terapeuta (opcional)
- Bio, modalidades (lista editavel pelo admin — ex: Reiki, Yoga, Ayurveda...), certificacoes
- Foto profissional, localizacao, website, instagram
- Historico de eventos frequentados

#### FR-04.3: Quiz de Constituicao (opcional)
- Algoritmo que determina Dosha (Vata/Pitta/Kapha) e Elemento MTC
- Sugere melhor estação para comecar
- Resultados salvos no perfil
- Pode ser refeito

#### FR-04.4: Ritual de Intencao Digital
- Usuario "planta" uma intencao antes do evento
- Notificacao para "colher" a intencao 3 meses depois (proximo ciclo)
- Intencoes podem ser publicas ou privadas
- Historico de intencoes por estação

#### FR-04.5: Depoimentos
- Pos-evento, convidar participante a deixar depoimento
- Rating (1-5), texto, foto opcional
- Moderacao: aprovacao pelo admin antes de publicar
- Toggle "destaque" para exibir na landing page

### FR-05: Comunicacao

#### FR-05.1: Email Transacional
- Confirmação de inscrição (com QR Code)
- Lembrete pre-evento (7 dias e 24h antes)
- Preparacao para o evento (o que trazer, como chegar)
- Feedback pos-evento (link para depoimento)
- Recuperacao de checkout abandonado

#### FR-05.2: Email Marketing (drip campaigns)
- Lead nurture: Boas-vindas → Conteudo sazonal → Oferta
- Ciclo lunar: email quinzenal na Lua Nova (plantar) e Lua Cheia (colher)

#### FR-05.3: WhatsApp (futuro)
- Avisos para inscritos via Twilio
- Conteudo semanal para Circulo de Guardioes

### FR-06: Dashboard Administrativo

#### FR-06.1: Visao Geral
- Graficos de vendas por evento
- Ocupacao por evento (vagas disponiveis vs vendidas)
- Receita total e por período
- Leads captados e taxa de conversao

#### FR-06.2: CRM de Participantes
- Lista de todos os participantes com filtros (evento, status, dosha, primeira vez)
- Historico de participacao por pessoa
- Anotacoes internas por participante
- Export CSV/Excel

#### FR-06.3: Gestão de Facilitadores
- CRUD completo (FR-01.3)
- Disponibilidade por evento
- Historico de participacao como facilitador

#### FR-06.4: Configuracoes Editaveis
- **Pricing:** todos os precos de todos os produtos
- **Capacidade:** por evento e por espaco
- **Datas:** de todos os eventos, early bird, last minute
- **Textos:** descricoes, FAQs, textos da landing page
- **Politica de cancelamento:** percentuais e prazos
- **Espacos:** nome, capacidade, descrição (Espaco de Eventos, Sun House, Cafe 007, Jardim Atlantico, Trilha Ecologica)
- **Integracoes:** chaves de API, webhooks, toggles de ativacao

### FR-07: PWA e Offline

#### FR-07.1: Progressive Web App
- Instalavel em Android e iOS
- Service Worker para cache de dados essenciais
- Ingresso (QR Code) funciona 100% offline
- Cronograma do evento acessivel offline

---

## 4. Requisitos Nao-Funcionais

### NFR-01: Performance
- LCP < 2.5s em 3G
- TTI < 3.5s em 3G
- Core Web Vitals no verde
- Cache com Redis (Upstash) para dados frequentes

### NFR-02: Seguranca e Controle de Acesso (RBAC)

- Autenticacao via NextAuth.js v5 (Auth.js)
- LGPD compliant: dados sensiveis criptografados, consentimento explicito
- CPF criptografado em repouso
- Webhooks validados por assinatura (Stripe, MercadoPago)
- Rate limiting em endpoints publicos
- Senhas: mínimo 8 caracteres, hash bcrypt, reset via email com token expiravel (1h)
- Sessoes: JWT com refresh token, expiracao configuravel (default 7 dias)

#### Matriz de Permissoes por Role (RBAC)

5 niveis de acesso, do mais restrito ao mais amplo:

| Funcionalidade | VISITOR (sem login) | USER | THERAPIST | FACILITATOR | ADMIN |
|---------------|:---:|:---:|:---:|:---:|:---:|
| **Ver landing page / eventos publicos** | SIM | SIM | SIM | SIM | SIM |
| **Fazer quiz de constituicao** | SIM (vira lead) | SIM | SIM | SIM | SIM |
| **Comprar ingresso** | SIM (cria conta) | SIM | SIM | SIM | SIM |
| **Ver proprio perfil** | - | SIM | SIM | SIM | SIM |
| **Editar proprio perfil** | - | SIM | SIM | SIM | SIM |
| **Ver historico de inscrições** | - | SIM | SIM | SIM | SIM |
| **Cancelar/transferir inscrição** | - | SIM | SIM | SIM | SIM |
| **Plantar/colher intencoes** | - | SIM | SIM | SIM | SIM |
| **Escrever depoimento** | - | SIM | SIM | SIM | SIM |
| **Ver perfil terapeuta enriquecido** | - | - | SIM | SIM | SIM |
| **Editar perfil terapeuta** (bio, modalidades, certificacoes) | - | - | SIM | SIM | SIM |
| **Aparecer no mapa de facilitadores** | - | - | SIM | SIM | SIM |
| **Ver cronograma detalhado dos eventos que facilita** | - | - | - | SIM | SIM |
| **Ver lista de inscritos dos eventos que facilita** | - | - | - | SIM | SIM |
| **Marcar presenca (check-in) de participantes** | - | - | - | SIM | SIM |
| **CRUD de eventos** | - | - | - | - | SIM |
| **CRUD de facilitadores** | - | - | - | - | SIM |
| **CRUD de ingressos e precos** | - | - | - | - | SIM |
| **CRUD de atividades/cronograma** | - | - | - | - | SIM |
| **CRUD de produtos (passaportes, guias)** | - | - | - | - | SIM |
| **Editar política de cancelamento** | - | - | - | - | SIM |
| **Editar espacos e capacidades** | - | - | - | - | SIM |
| **Ver/exportar CRM de participantes** | - | - | - | - | SIM |
| **Ver dashboard de vendas/receita** | - | - | - | - | SIM |
| **Gerenciar leads** | - | - | - | - | SIM |
| **Aprovar/rejeitar depoimentos** | - | - | - | - | SIM |
| **Processar reembolsos** | - | - | - | - | SIM |
| **Editar configurações do sistema** | - | - | - | - | SIM |
| **Gerenciar usuarios e roles** | - | - | - | - | SIM |
| **Editar textos da landing page** | - | - | - | - | SIM |
| **Ver logs de auditoria** | - | - | - | - | SIM |

#### Regras de Negocio de Acesso

- **Promocao de role:** Apenas ADMIN pode promover usuarios (ex: USER → THERAPIST, THERAPIST → FACILITATOR)
- **Multi-role:** Um usuario tem UM role ativo. THERAPIST herda tudo de USER. FACILITATOR herda tudo de THERAPIST. ADMIN herda tudo.
- **ADMIN inicial:** Bob (Eliezer) — único SUPER_ADMIN que pode criar outros ADMINs
- **Facilitadoras (Daniela e Milena):** Role FACILITATOR (podem ver inscritos e fazer check-in dos eventos que facilitam) — promover para ADMIN se necessário
- **Gestoras (3 vagas):** Recebem role ADMIN quando definidas
- **Auto-cadastro:** Novo usuario entra como USER. Pode solicitar upgrade para THERAPIST (aprovacao manual pelo ADMIN)
- **Desativacao:** ADMIN pode desativar conta sem deletar (soft delete, LGPD compliant)

### NFR-03: Acessibilidade
- WCAG 2.1 AA
- Navegacao por teclado
- Screen reader friendly
- Contraste adequado em todas as paletas sazonais

### NFR-04: Responsividade
- Mobile-first (maioria do publico acessa por celular)
- Breakpoints: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

### NFR-05: SEO
- SSR/ISR para landing pages
- Meta tags dinamicas por evento
- Schema.org markup para eventos
- Sitemap automatico

### NFR-06: Observabilidade
- Analytics com PostHog
- Error tracking (Sentry)
- Logs estruturados

---

## 5. Restricoes e Premissas

### CON-01: Restricoes
- Hardware do proprietario: MacBook Air 2015 (8GB RAM, SSD 113GB) — ferramentas leves
- Budget de infra: Vercel (free/pro), Supabase (free tier inicial)
- Prazo MVP: 8 semanas para Ciclo 1 (Mai/2026)
- Zero dependencias externas não aprovadas

### CON-02: Premissas
- MercadoPago já possui conta ativa e integrada
- Dominio basetriade.com já existe e DNS e acessivel
- Facilitadoras (Daniela e Milena) validarao conteúdo antes do lancamento
- Sun House já opera independentemente (cross-selling e opcional)

---

## 6. Stack Tecnico

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | Next.js 15 (App Router) + React 18 | SSR/ISR, performance, SEO |
| Styling | Tailwind CSS 3.4 + shadcn/ui | Design system flexivel |
| Animacoes | Framer Motion 11 | Transicoes sazonais suaves |
| Backend | Next.js API Routes + Server Actions | Full-stack unificado |
| ORM | Prisma | Type-safe, migrations |
| Database | PostgreSQL 16 (Supabase) | Managed, RLS, realtime |
| Cache | Redis (Upstash) | Serverless, low-latency |
| Auth | NextAuth.js v5 (Auth.js) | Flexivel, multi-provider |
| Pagamentos | MercadoPago (PIX/Boleto) + Stripe (Cartao) | Cobertura completa BR |
| Email | Resend + React Email | Templates tipados |
| Hosting | Vercel | Edge, CDN, deploy automatico |
| Package Manager | pnpm | Rapido, disk-efficient |
| Monorepo | Turborepo | Build paralelo |
| Testes | Vitest + Playwright | Unit + e2e |
| CI/CD | GitHub Actions | Deploy automatico |

---

## 7. Design System

### 7.1 Paleta Sazonal

O tema do app muda dinamicamente conforme a estação ativa (atributo `data-season`).

| Estação | Primary | Secondary | Accent | Elemento MTC |
|---------|---------|-----------|--------|--------------|
| Primavera | #90EE90 (verde-menta) | #98D8C8 (jade) | #F7FFE0 | Madeira / Figado |
| Verão | #FFD700 (dourado) | #FFA500 (laranja-sol) | #FFFACD | Fogo / Coracao |
| Outono | #D2691E (terracota) | #CD853F (peru) | #F5DEB3 | Metal / Pulmao |
| Inverno | #4682B4 (azul-aco) | #5F9EA0 (cadet-blue) | #E0F6FF | Agua / Rim |

**Base Tríade (neutros):** #2d1810 (marrom-escuro), #d4a574 (dourado-terra), #8B4513 (siena)

### 7.2 Branding Obrigatorio

#### Assinatura Institucional (TODAS as paginas)
- **Footer:** `iAi · ECOssistema Base Tríade™` — presente em todas as paginas
- Separador oficial: interponto (·)
- TM = marca em processo de registro no INPI (quando concedido, trocar por ®)

#### Marca d'agua Base Tríade (TODAS as paginas)
- Logo Base Tríade como **marca d'agua subliminar** em todas as paginas
- Opacidade baixa (5-8%) para efeito subliminar sem prejudicar leitura
- Posicionamento: centro da pagina, fixed, z-index baixo (atras do conteúdo)
- CSS: `position: fixed; opacity: 0.05-0.08; pointer-events: none; z-index: 0;`
- Responsiva: escala proporcionalmente ao viewport
- Nao aparece em print (media query `@media print { display: none }`)

### 7.3 Tipografia
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

### 7.3 Componentes Sazonais
- `<SeasonalButton />`: cor muda com a estação ativa
- `<EventCard />`: gradiente sazonal + icone elemento MTC + badge status
- `<FacilitatorAvatar />`: borda dourada + icone especialidade
- `<IntentionRitual />`: interface imersiva para escrita de intencoes

---

## 8. Modelo de Dados

### 8.1 Entidades Principais

```
User (id, email, name, phone, cpf, role)
  ├── TherapistProfile (bio, modalities, certifications, location, instagram)
  ├── Constitution (vata, pitta, kapha, mtcElement, suggestedSeason)
  ├── Intention[] (season, text, isPublic, harvestedAt)
  ├── Registration[] → Event, TicketType, Payment
  ├── Testimonial[] → Event
  └── SeasonalTree (gamificacao)

Event (slug, season, name, dates, element, capacity, venue)
  ├── Activity[] (time, title, duration, facilitator)
  ├── EventFacilitator[] → Facilitator
  ├── TicketType[] (earlyBirdPrice, regularPrice, lastMinutePrice, dates, quantity)
  ├── Registration[]
  ├── Testimonial[]
  ├── Image[]
  └── FAQ[]

Facilitator (name, role, bio, photo, specialties, isFeatured)

Lead (email, name, source, utm, interestedSeasons, constitution)

Payment (amount, method, status, stripeId, mercadoPagoId, pixKey, boletoUrl)
```

### 8.2 Principio de Editabilidade

NENHUM valor de negocio e hardcoded. Todos os campos numericos, textuais e de configuração sao editaveis pelo admin:

| O que | Onde edita | Default |
|-------|-----------|---------|
| Capacidade do evento | Admin > Evento > Editar | 69 |
| Precos de ingressos | Admin > Evento > Ingressos | Variavel |
| Datas early bird/last minute | Admin > Evento > Ingressos | Variavel |
| Politica de cancelamento | Admin > Configuracoes | 80%/50%/0% |
| Prazos da política | Admin > Configuracoes | 15d/7d |
| Venue/local | Admin > Evento > Editar | Base Tríade |
| Textos da landing | Admin > Conteudo | Templates iniciais |
| Espacos (nome, capacidade) | Admin > Espacos | 5 espacos pre-cadastrados |
| Facilitadores | Admin > Facilitadores | Pool inicial |
| Produtos (precos, descrição) | Admin > Produtos | Conforme tabela |
| Hospedagem (quartos, precos) | Admin > Sun House | R$ 250/noite |
| Integracao API keys | Admin > Configuracoes | ENV vars |

---

## 9. Roadmap e Faseamento

### Fase 1 — MVP (Semanas 1-8) — Meta: Ciclo 1 Outono Mai/2026

#### Epic 1: Fundacao (Semanas 1-2)
- E1.1: Setup monorepo Turborepo + Next.js 15 + Prisma + Supabase
- E1.2: Schema do banco (Prisma) — todas as entidades
- E1.3: Auth (NextAuth.js v5) — login email/senha + Google
- E1.4: Design System base — paleta sazonal, componentes core
- E1.5: Admin layout e navegação

#### Epic 2: Core (Semanas 3-4)
- E2.1: CRUD de Eventos (admin) — todos campos editaveis
- E2.2: CRUD de Facilitadores (admin)
- E2.3: CRUD de Tipos de Ingresso (admin) — pricing dinamico
- E2.4: CRUD de Atividades/Cronograma (admin)
- E2.5: Pagina publica do evento (SSR)
- E2.6: Landing page com captacao de leads

#### Epic 3: Checkout (Semanas 5-6)
- E3.1: Fluxo de inscrição (seleção → dados → pagamento)
- E3.2: Integracao MercadoPago (PIX + Boleto)
- E3.3: Integracao Stripe (Cartao)
- E3.4: Webhooks de confirmação
- E3.5: Geracao QR Code (offline-first)
- E3.6: Politica de cancelamento (editavel)
- E3.7: Cross-selling Sun House no checkout

#### Epic 4: Comunicacao e Polish (Semanas 7-8)
- E4.1: Email transacional (confirmação, lembretes, feedback)
- E4.2: Dashboard admin — visao geral, vendas, ocupacao
- E4.3: CRM de participantes (lista, filtros, export)
- E4.4: PWA manifest + Service Worker (QR offline)
- E4.5: SEO (meta tags, schema.org, sitemap)
- E4.6: Testes e2e dos fluxos criticos
- E4.7: Checklist de lancamento

### Fase 2 — Comunidade (Pos-lancamento)
- Quiz de Constituicao completo (Dosha/MTC)
- Perfil de terapeuta enriquecido
- Ritual de Intencao Digital
- Depoimentos com moderacao
- Calendario Lunar automatico (suncalc)
- Mapa de facilitadores (geolocalizacao)

### Fase 3 — Gamificacao e Jornada
- Árvore das Estações (SVG animado, Framer Motion)
- Badges: Iniciado → Peregrino → Guardiao
- Jornada GET137 (7 fases de 20 dias)
- Circulos locais
- Buddy system

### Fase 4 — Integracoes
- WhatsApp via Twilio
- Integracao Sun House (reservas)
- Integracao EUprime (gamificacao cruzada)
- SSO Base Tríade
- Email marketing drip campaigns

---

## 10. Dados de Referencia (Seed)

### 10.1 Evento Template: Renascenca (Primavera 2025)

| Campo | Valor |
|-------|-------|
| Nome | Renascenca |
| Estação | Primavera |
| Evento Astronomico | Equinocio de Primavera |
| Data | 18 de Outubro 2025 |
| Elemento MTC | Madeira |
| Orgao MTC | Figado |
| Venue | Base Tríade - Barra Velha/SC |

**Ingressos:**
- Passaporte Sabado: R$ 287 (inclui refeicoes, workshops, materiais)
- Surf Domingo: R$ 88 (inclui aula e equipamento)

**Facilitadores Primavera:**
- Lionara Artn (Yoga)
- Lia Cristina (Nutricao)
- Juliana Coimbra (Ayurveda)
- Gabriela Vilela (Ginecologia Natural)
- Cassiano Darela (Sound Healing)
- Giorgia Sell (Surf)

### 10.2 Calendario Anual 2026-2027

| Data | Ancora Astronomica | Evento | Tipo |
|------|--------------------|--------|------|
| ~20 Mar | Equinocio de Outono | Ciclo Outono | 2 dias |
| 1 Mai | Beltane | Fogueira Sagrada | 1 dia |
| ~20 Jun | Solsticio de Inverno | Ciclo Inverno | 2 dias |
| 1 Ago | Lughnasadh | Colheita e Gratidao | 1 dia |
| ~20 Set | Equinocio de Primavera | Ciclo Primavera | 2 dias |
| 1 Nov | Samhain | Ancestralidade | 1 dia |
| ~20 Dez | Solsticio de Verão | Ciclo Verão | 2 dias |
| 1 Fev | Imbolc | Renovacao | 1 dia |

### 10.3 Produtos

| Produto | Preco | Descricao |
|---------|-------|-----------|
| Passaporte Anual Guardiao | R$ 1.997 | 4 ciclos + comunidade + lives + buddy system |
| Ciclo Avulso | R$ 597 | 1 imersao de 2 dias com pernoite |
| Evento Avulso | R$ 297 | 1 dia tematico (sabbats) |
| Guia Farmacia Viva | R$ 97 | Guia ilustrado plantas medicinais Mata Atlantica |

### 10.4 Espacos

| Espaco | Capacidade | Uso |
|--------|-----------|-----|
| Espaco de Eventos | 69 | Workshops, rodas, cerimônias |
| Sun House | 4 quartos + Cabana Beija-Flor | Pernoite |
| Cafe 007 | Hub de experiências | Refeicoes conscientes |
| Jardim Atlantico | Contemplativo | Meditacao, yoga |
| Trilha Ecologica | 600m, Rio Itajuba | Banho de Floresta, Farmacia Viva |

### 10.5 Distribuicao Financeira — Formula Diamante

| Destino | % |
|---------|---|
| Reinvestimento | 30% |
| Reserva | 30% |
| Operacional | 40% |

---

## 11. Riscos e Mitigacao

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| MercadoPago muda API | Media | Alto | Abstracoes no gateway, fallback Stripe |
| Baixa adesao inicial | Media | Alto | Beta gratuito para founders, embaixadores |
| Problemas de conexao no evento (natureza) | Alta | Medio | PWA offline-first, QR Code local |
| LGPD — dados de saúde (Dosha) | Media | Alto | Consentimento explicito, criptografia, anonimizacao |
| Hardware limitado (dev) | Alta | Medio | Stack leve, Vercel managed, sem Docker local |

---

## 12. Aprovacoes Pendentes

- [ ] Bob: validar escopo MVP vs Fase 2
- [ ] Daniela Lopper: validar dados de facilitadores e conteúdo
- [ ] Milena Koch: validar dados de facilitadores e conteúdo
- [ ] Definir gestoras (3 vagas) e nivel de acesso admin
- [ ] Definir subdominio do app (app.basetriade.com ou ciclo.basetriade.com)
- [ ] Confirmar Supabase como provider PostgreSQL
- [ ] Definir se Passaporte Anual e parcelavel (quantas vezes, desconto a vista)

---

## Apendice A: Política de Cancelamento (Defaults Editaveis)

| Prazo | Reembolso | Transferencia |
|-------|-----------|---------------|
| +15 dias antes do evento | 80% | Sim, sem custo |
| 7-14 dias antes | 50% | Sim, sem custo |
| < 7 dias | 0% | Sim, sem custo |
| No-show | 0% | Nao |
| Contingencia climatica (org. cancela) | 100% crédito ou 80% reembolso | N/A |

Todos os percentuais e prazos sao editaveis pelo admin por evento.

---

## Apendice B: Jornada GET137 (Fase 2+)

| Fase | Dias | Atividade |
|------|------|-----------|
| Intencao | 20 | Qual ferida quer curar em si mesmo? |
| Purificacao | 20 | Protocolo diario de limpeza energetica |
| Alinhamento | 20 | Meditacao + pranayama (audio guiado) |
| Alimentacao | 20 | Nutricao sazonal + estudo de nova pratica |
| Manifestação | 20 | Aplicar aprendizados nos atendimentos |
| Observacao | 20 | Registrar mudancas (diario + grupo) |
| Transmutacao | 17 | Integrar no proximo Ciclo presencial |

**Total: 137 dias = distancia entre estações.**

---

*PRD criado por Morgan (@pm) — iAi ECOssistema Base Tríade*
*Baseado em: Prompt DORA (spec tecnica), Documento Estrategico (reuniao marco 2026), Evento Renascenca (referencia)*
