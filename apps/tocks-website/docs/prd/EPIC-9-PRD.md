---
epic: 9
title: Tocks Awwwards Elevation — Phase 2 (Shared-Element Morph + R3F Configurator)
status: Draft
owner: "@architect (Aria)"
sponsor: "@design-lead (Nova)"
created: 2026-04-17
source_closure: docs/qa/EPIC-8-CLOSURE.md
brand_dna: docs/design/elevation-awwwards/00-brief-awwwards-elevation.md
direction: B (Gilded Noir Cinemático — continuation)
depends_on_epic: 8
blocks_epic: 10 (awwwards submission)
next_version: "16.2.4"
react_version: "19.2.4"
---

# Epic 9 PRD — Awwwards Elevation Phase 2

## 1. Executive Summary

Epic 8 elevou Tocks de commodity (FWA 4.6) para awwwards-ready (8.25). Duas dimensões permanecem em 7/10: **Interatividade signature** e **Content density luxury** — ambas BLOCKED-BY asset (Nano Banana 2 quota + hero video real). Nenhuma elevação incremental de tokens, tipografia ou motion CSS fechará o gap de 0.75 para 9.0: o próximo degrau é **interação irredutível**, não polish. Nova recomendou em `EPIC-8-CLOSURE.md` §10: shared-element morph (Approach B) e 3D configurador R3F.

Epic 9 implementa esses dois vetores como **Theme A (core)** e **Theme B (core)**, mais **Theme C (stretch/opt-in)** para blog copy v2 e progressive enhancement editorial. Entregue, desbloqueia submissão FWA-SOTD: site passa de "belíssimo em repouso" para "memorável em uso" — a diferença entre shortlist e SOTD. Effort estimado: 38–54 horas dev (4 stories core + 2 suporte + 1 QA + 1 blog opcional). Gate de merge: FWA avg ≥9.0 em 5 rotas, Lighthouse Perf ≥85 home / ≥90 demais, A11y ≥95, WCAG 2.3.3 (reduced-motion) PASS em todas as novas superfícies, bundle gzipped ≤350 KB first-load em `/colecao/[slug]`.

---

## 2. Business Value

| Vetor | Estado Epic 8 | Estado Epic 9 | Desbloqueio |
|-------|---------------|---------------|-------------|
| FWA média | 8.25/10 | **≥9.0/10** | SOTD eligibility (awwwards exige irredutível ≥9) |
| Interatividade signature | 7/10 BLOCKED | **9/10** via morph + configurador | 2 dimensões FWA fechadas |
| Content density luxury | 7/10 BLOCKED | **9/10** via 3D contextual + micro-copy editorial | idem |
| Commercial moat | Copy v2 "móveis de autor" | Configurador = **lead-gen qualificado** (seletor desce no funnel) | Designers/arquitetos salvam config → WhatsApp handoff com specs pré-preenchidas |
| Reference peer set | Roche Bobois / B&B Italia (estático) | **Herman Miller / Kvadrat / Poltrona Frau (configurator)** | Leap reputacional no segmento móveis high-ticket |

**Non-commercial upside:** o configurador R3F vira asset reusável para Bretda (bilhar high-ticket, mesma stack 3D) e Anipis (touch-points premium) — retorno além do Tocks.

---

## 3. Scope

### 3.1 In scope — core (must ship)

**Theme A — View-Transitions Approach B (Shared-Element Morph)**
- Product card image → product page hero morph usando React `<ViewTransition>` component (`name={`product-${slug}`}`).
- Share morph contract via `share="morph"` class para custom CSS (blur keyframe 3px mid-flight, 400ms duration).
- Header anchoring (`viewTransitionName: 'site-header'` + `animation: none`) — evita salto durante morph.
- Directional navigation tagging: `transitionTypes={['nav-forward']}` em cards de grid; `['nav-back']` no "← Coleção" do product layout.
- Reduced-motion: reusar bloco `@media (prefers-reduced-motion: reduce)` já adicionado em `globals.css` Patch #2c, estendido para `::view-transition-*(*)` selectors.

**Theme B — R3F Configurator**
- 3D model viewer para peças featured (subset inicial: **2 peças prioritárias** — a definir com Nova em open question Q1).
- Wood species swap: swap material map em runtime (3 espécies mínimo: freijó, ipê, jatobá).
- Finish selection: verniz fosco / verniz acetinado / verniz alto-brilho (3 roughness/metalness presets).
- Rotate 360° (auto-rotate opt-out + drag manual via OrbitControls).
- Ambient context: HDRI studio lighting + floor-shadow contact catcher; NÃO scene completa (deferido para Epic 10 se "room preview" sobrevive a user test).
- Model pipeline: GLB commissioned (ver ADR-002), dynamic import behind route segment, loading state = hero poster PNG fallback.

### 3.2 In scope — stretch (opt-in, usuário ratifica)

**Theme C — Progressive Enhancement editorial**
- C1: Scroll-jacked atelier chapter-by-chapter (val-head allowed ONLY aqui, opt-in via `prefers-reduced-motion: no-preference` + `@media (pointer: fine)` — desktop only).
- C2: Editorial cursor (hero hover = cursor custom SVG; desktop only; opt-out fácil).
- C3: Sound design (showroom ambient loop, mute-by-default, play button visible, `<audio>` HTML5 nativo — zero deps).
- C4: Blog copy v2 reposition — long-tail editorial tom "The Gentlewoman / Apartamento" (6–8 posts revisados; subject matter técnica mantida para SEO).

**Rationale stretch:** C1–C3 afetam percepção cinematic signature; se cortados, Theme A+B sozinhos já atingem FWA 9.0 (per scorecard §7). C4 é conteúdo editorial independente.

### 3.3 Out of scope — NON-goals (explicit no)

| Item | Razão |
|------|-------|
| Backend / API / CMS migration | Site é SSG. Adicionar CMS é outro projeto (Anipis-scale effort). |
| Internacionalização (i18n en-US) | Audiência core é pt-BR; mercado internacional destrava em Epic 10+. |
| E-commerce real (checkout, cart) | Conversão é via WhatsApp (confirmado em copy v2 Epic 8). Cart quebra posicionamento atelier. |
| Autenticação / área logada | Não há modelo de cliente recorrente. |
| AR (WebXR, ARKit overlay) | Out-of-budget performance. Debate para Epic 11+. |
| Mobile-first 3D (R3F em viewport <768px) | Fallback hero-image em mobile (ver S-9.6). Dispositivos touch não comportam orbit controls + GLB pesado sem UX degradada. |
| Substituir Patch #2c reduced-motion | Foundation Epic 8 é kill-switch global; Epic 9 **estende**, não substitui. |
| AI image gen como asset source (produto) | Ver ADR-002. Fidelidade material não atinge luxury grade. |

### 3.4 Escalation clauses (out-of-scope triggers)

- **R3F bundle exceeds 300 KB gzipped parsed** → Theme B deferido para Epic 10, Epic 9 fecha só com Theme A. Escalação automática para Nova + @architect re-design.
- **Nano Banana 2 quota não recarrega até 2026-05-01** → hero video permanece poster; Interatividade dimension dependente 100% de Theme A+B (ainda viável, mas scorecard atinge 8.8 vs 9.2 esperado).
- **GLB commissioned delivery atrasa >3 semanas** → Epic 9 separa S-9.3 (setup R3F + cube placeholder) e empurra S-9.4/5 para Epic 10.
- **Lighthouse Perf `/colecao/[slug]` < 80 pós Theme B** → Theme B rollback behind `?configurator=1` query flag; release 100% só quando perf ≥90.

---

## 4. Technical Dependencies

### 4.1 Next.js 16 contract (citations required)

| Feature | Doc path (node_modules/next/dist/docs/) | Usage |
|---------|-----------------------------------------|-------|
| `<ViewTransition>` component | `01-app/02-guides/view-transitions.md` | Theme A foundation — shared-element morph pattern (Step 1), Suspense reveals (Step 2 — não aplicado aqui), directional slides (Step 3), header anchoring (sub-section "Anchoring the header"). |
| `experimental.viewTransition` config | `01-app/03-api-reference/05-config/01-next-config-js/viewTransition.md` | Flag já `true` em `next.config.ts` (commit Epic 8 S-8.5). Nenhuma mudança necessária. |
| `<Link transitionTypes={[]}>` prop | `01-app/03-api-reference/02-components/link.md` §`transitionTypes` (L503–526) | Tag nav direction em product-card Link e "← Coleção" back-link. |
| `useRouter().push/replace(url, { transitionTypes })` | `01-app/03-api-reference/02-components/link.md` (mention at guide end) + React docs | Não usado neste Epic (todas as navegações são via `<Link>`); documentado para futuro. |
| Dynamic route params (`params: Promise<{slug}>`) | `01-app/03-api-reference/03-file-conventions/dynamic-routes.md` | Já em uso em `src/app/colecao/[slug]/page.tsx`; morph depende de `slug` estável. |
| `next/image` + view-transition-name interplay | `01-app/03-api-reference/02-components/image.md` + guide L69–71 | `<Image>` dentro de `<ViewTransition>` — guide demonstra padrão exato. |
| Upgrade notes Next 16 | `01-app/02-guides/upgrading/version-16.md` | Smoke-check: nenhuma API usada em Epic 9 está deprecated; confirmar antes de implementar (contract AGENTS.md). |

### 4.2 New dependencies (Theme B)

| Package | Version | Purpose | Bundle impact (estimated gzipped) |
|---------|---------|---------|-----------------------------------|
| `three` | ^0.168 (Three.js core) | WebGL engine | ~150 KB |
| `@react-three/fiber` | ^9.x (React 19 compatible) | React renderer for three.js | ~25 KB |
| `@react-three/drei` | ^10.x | Helpers (OrbitControls, Environment, useGLTF) | ~40 KB (tree-shaken subset) |
| **Total added (gzipped)** | — | — | **~215 KB** |
| **Budget ceiling Theme B** | — | — | **≤300 KB gzipped** (ADR-003) |

**Isolation strategy:** R3F imports via `dynamic(() => import('...'), { ssr: false })` confinados à rota `/colecao/[slug]`. Home e `/colecao` NÃO carregam three.js. First-load JS em rotas sem configurador não regride vs Epic 8 baseline.

### 4.3 Existing dependencies (confirmed in Epic 8)

- `gsap` ^3.15.0 + `@gsap/react` ^2.1.2 (ScrollTrigger isolado em `/atelier`; Theme C1 reutiliza).
- `lenis` ^1.3.23 (smooth-scroll; interação com view-transitions a verificar — ver risco R-3).
- `framer-motion` ^12.38.0 (not used em Theme A — view-transitions são native API; mantido disponível caso necessário para configurador UI, mas prefer-native).
- `next` 16.2.4, `react` 19.2.4, `react-dom` 19.2.4 (React 19 requerido para `<ViewTransition>`).

### 4.4 Asset pipeline dependencies

- **GLB models:** 2 peças featured (TBD Nova). Lead time estimado: 2–3 semanas (ver Q2 open question).
- **Material textures:** wood diffuse + normal + roughness maps per espécie (3×3 = 9 textures ~512×512 KTX2 compressed). Lead time: 1 semana.
- **HDRI environment:** 1 studio HDR (2K equirectangular, ~500 KB). Pode ser Poly Haven CC0 — NÃO bloqueia delivery.
- **Hero video (continuing from Epic 8):** Nano Banana 2 quota OR Midjourney/Flux alternative (ver S-9.8 QA gate).

---

## 5. Risk Register

Risco é pontuado P (Probability) × I (Impact) com escala 1–5. Mitigation é o que fazemos antes; contingency é plano B.

| ID | Risk | P | I | Score | Mitigation (pre) | Contingency (post) |
|----|------|--:|--:|------:|-------------------|---------------------|
| **R-1** | Bundle R3F excede 300 KB gzipped em `/colecao/[slug]` | 3 | 5 | 15 | Dynamic import `{ ssr: false }` por rota; drei tree-shake explicit (import só `OrbitControls`, `Environment`, `useGLTF` — não o barrel); Three.js examples via `three/examples/jsm/...` paths específicos; webpack bundle analyzer gate no CI (adicionar em S-9.8). | Rollback Theme B behind `?configurator=1` query flag; defer S-9.4/5 para Epic 10; re-assess com `babylon.js` ou `model-viewer` (Google web component ~50 KB). |
| **R-2** | GLB commissioned atrasa/não entrega em tempo útil | 3 | 4 | 12 | Nova confirmar fornecedor em open question Q2 ANTES de S-9.3 kickoff; budget lead time 3 semanas; iniciar S-9.3 com cube-placeholder GLB (drei `Box`) para validar pipeline; pagamento milestone-based. | Epic 9 ships com 1 peça real + 1 peça placeholder shimmer (comunica "em breve" no UI); Epic 10 preenche. |
| **R-3** | Lenis smooth-scroll conflita com view-transitions (scroll snapshot captura posição smooth-interpolated, causa salto visual) | 3 | 3 | 9 | Testar cedo (S-9.1 smoke test): navegação com lenis ativo + `<ViewTransition>` em dev; medir visual glitch com Playwright `page.video()`. | Desabilitar lenis durante transição (`lenis.stop()` em `onNavigate` event) ou remover lenis de rotas com morph (lenis fica só em `/atelier`). |
| **R-4** | Safari não suporta view-transitions API completa (crossfade sim, shared-element parcial) | 2 | 3 | 6 | Guide Next 16 §NOTE L41: "without browser support, your application works normally, the transitions simply do not animate". Confirmado graceful degradation. Aceitar Safari-sem-morph como tier-2 experience. | Nada — degradação silenciosa é by-design. Adicionar `@supports (view-transition-name: auto)` feature detection CSS se precisar estilizar fallback. |
| **R-5** | WCAG 2.3.3 regression — Motion from Interactions (morph + auto-rotate 3D) viola users com motion-sensitivity | 4 | 5 | 20 | Patch #2c cobre `::view-transition-*(*)` automaticamente (CSS cascade); 3D auto-rotate OFF por default (usuário inicia); OrbitControls sem damping agressivo; `prefers-reduced-motion: reduce` desabilita auto-rotate mesmo se usuário clicou. QA gate S-9.8 audit 33+ surfaces (igual Epic 8 protocol). | Qualquer offender = merge blocker, não-negociável (Art. V Quality First). |
| **R-6** | Mobile UX degradada — 3D configurator inusável em viewport <768px ou touch de baixo-end | 4 | 4 | 16 | Theme B **mobile fallback obrigatório** (S-9.6 explicit story): viewport <768px vê hero-image + grid de variantes clicáveis (não 3D); detecção via `useMediaQuery` + CSS `@media (max-width: 767px)`. | — |
| **R-7** | FWA scorecard não atinge 9.0 mesmo com Theme A+B (human perception gap) | 2 | 5 | 10 | 5-second test Epic 8 (roteiro em `docs/qa/s-8.6-5second-test.md`) executado ANTES de Epic 9 kickoff — input direciona Theme C inclusion; Nova ratifica scorecard intermediário após S-9.5 (mid-epic gate) em vez de só no fim. | Se scorecard mid-epic <8.7, Theme C1 (scroll-jacked atelier) upgraded de stretch para core para fechar gap memorabilidade. |
| **R-8** | Lighthouse Perf home regride abaixo de 85 (já em threshold de AC-8 Epic 8) por side-effects view-transitions | 2 | 4 | 8 | Home NÃO carrega R3F (isolation §4.2); view-transitions CSS é <1 KB; morph ativa só em navegação, não em initial load. LCP independente de morph. | Se regride, remover `transitionTypes` prop de links da home (manter apenas no product-card em `/colecao`); home volta a Approach A (root fade). |
| **R-9** | React 19 `<ViewTransition>` API instável/em flux (React experimental → stable timing) | 2 | 3 | 6 | React 19.2.4 já em uso Epic 8 (confirmed stable); Next 16 guide L46 cita `import { ViewTransition } from 'react'` como canonical. | Monitorar React release notes; lockfile commit evita drift; upgrade opt-in. |
| **R-10** | Segurança — GLB com embedded script / XSS via glTF extension | 1 | 5 | 5 | GLB commissioned de fornecedor conhecido (não user-uploaded); parsing via `useGLTF` drei (validated pipeline); CSP header `script-src 'self'` no deploy Vercel bloquearia execution residual. | GLB upload user-facing NUNCA (out-of-scope §3.3 confirma). |

**Total aggregated risk score: 107.** Scores ≥12 (R-1, R-2, R-5, R-6) requerem mitigation validada antes de kickoff da story relevante.

---

## 6. Architecture Decision Records (ADRs)

### ADR-001 — React `<ViewTransition>` component vs CSS-only `view-transition-name`

**Context.** Next 16 guide demonstra dois patterns: (a) `<ViewTransition name="...">` React component (novo React 19), (b) CSS-only `view-transition-name: my-element` em style/className. Epic 8 S-8.5a usou CSS-only root fade (Approach A). Epic 9 precisa shared-element morph cross-route — duas rotas, mesma identity.

**Options.**
1. **CSS-only persistent names.** Hard-code `view-transition-name: product-{slug}` em CSS gerado/dinâmico. Funciona, mas dificulta unmount/lifecycle — se dois nodes com mesmo name estiverem montados em transição, browser erra.
2. **React `<ViewTransition name="...">` component.** Declarativo, integra com transitions/Suspense automaticamente (guide L49), handle unmount via React reconciliation.

**Decision.** Opção 2 (`<ViewTransition>` component) para shared-element morph. Opção 1 reservada para header anchoring (header é estático, não precisa de React awareness).

**Rationale.**
- Guide L59–91 é explícito: shared-element pattern é `<ViewTransition>` com `name` prop matching cross-route. Usar CSS-only aqui re-inventa o que React 19 já fornece.
- Lifecycle: React garante que `name` só está presente quando elemento montado; elimina classe de bugs "name duplicado" em navegação rápida.
- Consistência com Suspense reveals (guide Step 2) caso futuramente precisemos.

**Trade-offs.**
- (+) Type-safe, fix declarativo, zero re-hydration issues.
- (+) Interop explícita com `useTransition`/`Suspense` (guide L49 cita ativação).
- (−) Acopla a React 19 stable (risco R-9 baixo).
- (−) Ligeiramente mais verbose que inline style (~3 linhas extra por elemento morph).

**Consequences.**
- Product card image wrapped em `<ViewTransition name={`product-${slug}`} share="morph">`.
- Product page hero image idem, mesmo name.
- Header continua CSS-only (`style={{ viewTransitionName: 'site-header' }}`) per guide L296–313 — static elements are fine for CSS-only.

**Validation.** S-9.1 smoke test: morph round-trip home → product → back, reduced-motion on/off, Safari/Chrome/Firefox.

---

### ADR-002 — R3F model source strategy: commissioned GLB vs AI-generated

**Context.** Theme B precisa de 3D models fieis às peças reais (featured products). Três caminhos: (a) commissioned de artista 3D, (b) photogrammetry de peça física, (c) AI-gen (Luma, Meshy, Tripo3D).

**Options.**
1. **Commissioned GLB (artist + Blender).** Lead time 2–3 semanas/peça, custo R$1.5–4k/peça, fidelidade controlável (material accuracy, topology, UV), PBR maps customizáveis.
2. **Photogrammetry (Polycam / RealityCapture).** Lead time 3–5 dias, custo R$200–800/peça, fidelidade alta mas topology ruim (dense mesh, retopo necessário), PBR inferido (não separável).
3. **AI-gen (Luma Genie / Meshy v4).** Lead time minutos, custo $5–50, fidelidade baixa-média, topology caótica, material separation inexistente.

**Decision.** Opção 1 (commissioned GLB). Opção 2 como fallback se Opção 1 atrasa >3 semanas (ver R-2 contingency). Opção 3 rejeitada para produção.

**Rationale.**
- **Fidelidade material é o core do posicionamento.** Configurador precisa swap entre freijó/ipê/jatobá — isso requer UV maps separáveis e materials named. AI-gen produz mesh-soup sem UV layout coerente.
- **Brand risk.** Cliente-alvo (designers, arquitetos) **percebe** 3D ruim instantaneamente — AI-gen projeta "startup" onde queremos "atelier autoral". Contradição com posicionamento móveis de autor.
- **Performance.** Commissioned = retopo otimizado (~5–15k tris); AI-gen frequentemente 100k+ tris (bundle + GPU bloat).
- **Longevidade.** GLBs commissioned são reusáveis 5+ anos (formato estável); AI-gen precisa re-gen a cada feature update (inconsistente).

**Trade-offs.**
- (+) Fidelidade, performance, reusabilidade, brand.
- (−) Lead time 2–3 semanas é risco (R-2 P=3/I=4).
- (−) Custo maior upfront (estimado R$3–8k total para 2 peças).

**Consequences.**
- S-9.3 inicia com cube-placeholder GLB (drei `<Box />` ou standard cube.glb) para pipeline validation, NÃO bloqueia desenvolvimento.
- S-9.4 (wood + finish) depende de GLB real — Nova trigger procurement em paralelo ao kickoff Epic 9.
- Atelier fornece spec por peça (dimensões precisas, wood grain direction reference, detalhes de marcenaria a preservar).

**Validation.** Mid-epic gate após S-9.3: Nova + @design-lead validam pipeline com placeholder; GO/NO-GO para procurement quando pipeline verde.

---

### ADR-003 — Performance budget: JS bundle target ≤350 KB gzipped first-load em `/colecao/[slug]`

**Context.** Epic 8 baseline first-load JS em `/colecao/[slug]` é ~135 KB gzipped (Next 16 + React 19 + Tailwind runtime + site components). Theme B adiciona three.js ecosystem (~215 KB gzipped per §4.2). Soma teórica: 135 + 215 = 350 KB.

**Options.**
1. **≤250 KB** (aggressive). Exige code-splitting R3F aggressive + sem drei. Custo-benefício ruim (perde-se Environment / OrbitControls prontos).
2. **≤350 KB** (realistic). Permite drei subset, mantém Epic 8 baseline + R3F delta.
3. **≤500 KB** (permissive). Tira pressure mas permite regressão imperceptível que compõe.

**Decision.** Opção 2 (≤350 KB gzipped first-load no route `/colecao/[slug]`). Rotas sem configurador (home, `/colecao`, `/atelier`, `/contato`) mantêm baseline atual — **zero regressão permitida**.

**Rationale.**
- Web.dev "Interactive in <3s em 4G slow" requer ~170 KB total (JS + critical CSS). Já excedemos isso globalmente; configurador route aceita budget maior porque é opt-in de alta intenção (usuário chegou ao produto específico).
- Lighthouse Perf ≥85 é achievable com 350 KB gzipped se LCP é image-first (hero poster carrega pre-3D, 3D é post-interactive).
- 350 KB gzipped ≈ 1.1 MB parsed — aceitável em 4G (~8s download), mas 3D render só inicia após user interaction, não bloqueia FCP/LCP.

**Trade-offs.**
- (+) Viabilidade técnica (R3F + drei cabem).
- (+) Rota-isolada: não afeta rotas sem configurador.
- (−) `/colecao/[slug]` Perf score pode cair de 92 (Epic 8) para 85–88 (estimativa). Trade é aceitável — feature value justifica.

**Consequences.**
- CI gate (adicionar em S-9.8): `next build` output parse → falha se `/colecao/[slug]` first-load JS > 350 KB gzipped.
- Bundle analyzer gerado por build (adicionar `@next/bundle-analyzer` opt-in) — consultado em QA.
- Rotas home/colecao/atelier/contato: threshold atual mantido (home 85, demais 90).

**Validation.** S-9.8 QA gate inclui Lighthouse full run em 6 rotas + bundle analyzer JSON diff vs Epic 8 baseline.

---

### ADR-004 — Asset pipeline: shared CDN (Vercel Image) vs atelier-hosted storage

**Context.** Epic 9 adiciona assets pesados: GLB (5–15 MB each), wood textures (9×512KB ~= 4.5 MB), HDRI (500 KB), possível hero video real (3–8 MB). Storage/delivery decisão.

**Options.**
1. **Vercel Blob + Next Image optimization.** Gerenciado, CDN-backed, automatic WebP/AVIF para raster. GLB não passa por image optimization (serve bruto).
2. **Cloudflare R2 + próprio CDN.** Mais controle, custo menor em scale, mas operação extra (setup, signed URLs se needed).
3. **Self-hosted na origin Vercel (`/public` + Next static).** Simples, zero external deps, mas bundles tudo em deploy artifact (Vercel limit 100 MB; pode estourar com GLBs).

**Decision.** Opção 1 (Vercel Blob para GLBs/HDRI/video; Next Image já em uso para raster).

**Rationale.**
- Atual infra Tocks é 100% Vercel (deploy, build, preview). Adicionar R2 introduz split-brain ops.
- Vercel Blob: R$ cost acceptable em early stage (< 5 GB storage + < 100 GB bandwidth/mês projetado).
- GLB: servido com `Cache-Control: public, max-age=31536000, immutable` via Blob response headers → CDN cache perfect hit rate.
- `/public` alternativa rejeitada: Vercel deploy limit 100 MB, e git repo não deve carregar 20–50 MB de GLBs (bloat).
- Migration off Vercel (futuro) é straightforward (Blob → R2 é copy).

**Trade-offs.**
- (+) Ops simples, single vendor.
- (+) Native Next integration.
- (−) Lock-in médio (mitigado por assets serem static GLB/HDR/MP4 — standard formats, portáveis).
- (−) Custo marginal maior que R2 em escala (não-relevante para volume atual).

**Consequences.**
- S-9.3 inclui uploader script: `.env` `BLOB_READ_WRITE_TOKEN`, `scripts/upload-assets.ts` CLI puro (CLI First art. I).
- `useGLTF('/api/asset/{slug}.glb')` ou direct Blob URL — decisão @dev em S-9.3.
- DNS/CSP: `img-src` e `media-src` no Vercel Security Headers incluem `blob.vercel-storage.com`.

**Validation.** S-9.3 smoke: GLB carrega via Blob URL, Cache-Control headers corretos, no CORS block.

---

## 7. Acceptance Criteria — Epic-level

Epic 9 é considerado PASS se todas as condições abaixo são verdadeiras simultaneamente no QA gate final (S-9.8):

### 7.1 FWA dimensions (target ≥9.0 média)

| Dimensão | Epic 8 | Epic 9 target | Critério |
|----------|-------:|--------------:|----------|
| Originalidade visual | 8 | **9** | Gold detail + morph choreography recebem 1 pt criativo (Nova ratifica) |
| Hierarquia tipográfica | 9 | **9** | Mantém (sem regressão) |
| Motion craft | 8 | **9** | Morph + 3D orbit = signature moment (val-head review) |
| Storytelling | 9 | **9** | Mantém (configurador é complemento, não substitui narrativa atelier) |
| Technical polish | 9 | **9** | Lighthouse thresholds hit (§7.2) |
| Brand voice | 9 | **9** | Mantém; C4 (se shipped) sobe para 10 |
| Interatividade signature | 7 | **10** | Morph (5) + 3D configurator (5) = signature irredutível |
| Content density luxury | 7 | **9** | 3D contextual + material info per peça; C4 blog reforça |
| **MÉDIA** | **8.25** | **≥9.1** | — |

### 7.2 Lighthouse (mobile)

| Rota | Perf | A11y | BP | SEO | LCP | CLS |
|------|-----:|-----:|---:|----:|----:|----:|
| `/` | ≥85 | ≥95 | ≥95 | ≥95 | ≤2.5s | ≤0.05 |
| `/colecao` | ≥90 | ≥95 | ≥95 | ≥95 | ≤2.7s | ≤0.05 |
| `/colecao/[slug]` **com configurador** | **≥85** | ≥95 | ≥95 | ≥95 | ≤3.0s | ≤0.05 |
| `/atelier` | ≥90 | ≥95 | ≥95 | ≥95 | ≤2.7s | ≤0.05 |
| `/contato` | ≥90 | ≥95 | ≥95 | ≥95 | ≤3.2s | ≤0.05 |
| `/blog/[slug]` (se C4 shipped) | ≥90 | ≥95 | ≥95 | ≥95 | ≤2.5s | ≤0.05 |

### 7.3 Accessibility (axe-core)

- **0 critical** em todas as rotas.
- **0 novel serious** (permite 17 existentes em `/atelier` backlog FIX-3/6/6b; resolver se possível, não bloqueante).
- Configurador: controles teclado-navegáveis (Tab reach todos os material swatches, ENTER seleciona, ESC exits orbit mode), ARIA `role="region" aria-label="Configurador 3D"`, visible focus indicator sobre canvas.
- Content warning: configurador tem `aria-live="polite"` anunciando mudança de material ("Acabamento alterado para verniz fosco").

### 7.4 WCAG 2.3.3 (Animation from Interactions)

- **0 reduced-motion offenders** em 5+ rotas (Epic 8 protocol, 33+ surfaces).
- `prefers-reduced-motion: reduce` → view-transitions `animation-duration: 0s` (CSS Patch #2c já cobre; estender para `::view-transition-group(*)` se necessário).
- R3F auto-rotate desabilitado se `prefers-reduced-motion: reduce` (query em runtime via `window.matchMedia`).
- Mobile fallback (S-9.6) sem qualquer motion beyond Epic 8 baseline.

### 7.5 Bundle budget

- `/colecao/[slug]` first-load JS ≤ **350 KB gzipped** (ADR-003).
- Rotas non-configurator: regressão ≤ +5 KB vs Epic 8 baseline.
- CI gate: bundle-size check em GitHub Actions (adicionar em S-9.8).

### 7.6 Browser matrix

- **Tier 1 (full experience):** Chrome ≥115, Edge ≥115. Full morph + 3D.
- **Tier 2 (graceful):** Safari ≥17, Firefox ≥120. Morph parcial (browser-decided), 3D funciona (WebGL2 universal).
- **Tier 3 (no-op degrade):** Safari <17 / Firefox <120. View-transitions instant (no animation); 3D still works (fallback to hero-image se WebGL2 missing).
- **Mobile fallback:** viewport <768px → hero-image only, configurador grid de swatches clicáveis (no WebGL).

### 7.7 Copy / content gates

- C4 (se shipped): 6–8 blog posts re-escritos em tom editorial; 0 hits de `!` em títulos; metadata preservada SEO-wise (long-tail mantém "mesa de bilhar" onde semanticamente correto).
- Configurador labels pt-BR consistentes com `BRAND_COPY`: wood names em pt-BR (freijó, ipê, jatobá); finish labels ("fosco", "acetinado", "alto-brilho").

---

## 8. Sequencing & Dependencies

### 8.1 Dependency graph

```
S-9.1 (VT foundation)
  ├─→ S-9.2 (morph animation)  ──┐
  │                                ├─→ S-9.8 (QA + FWA closure)
  S-9.3 (R3F setup)               │
    ├─→ S-9.4 (wood+finish)      ─┤
    │     └─→ S-9.5 (rotate+HDR) ─┤
    └─→ S-9.6 (mobile fallback)  ─┘
                                    ┌─→ S-9.7 (blog copy v2) [stretch]
```

### 8.2 Suggested order

| Order | Story | Rationale | Parallelism |
|-------|-------|-----------|------------|
| 1 | **S-9.1** | Foundation morph — unblocks S-9.2 | — |
| 2 | **S-9.3** | R3F setup com cube placeholder — unblocks Theme B chain AND runs parallel to S-9.1 (independent surfaces) | PARALLEL with S-9.1 |
| 3 | **S-9.2** | Morph animation polish — depends S-9.1 | — |
| 4 | **S-9.6** | Mobile fallback — needs contract from S-9.3 but independent UI | PARALLEL with S-9.2/S-9.4 |
| 5 | **S-9.4** | Wood + finish swap — depends S-9.3 + real GLB arriving | Depends on GLB procurement |
| 6 | **S-9.5** | 360° rotate + ambient HDR — depends S-9.4 | — |
| 7 | **S-9.7** | Blog copy v2 [stretch] | Fully parallel; can start anytime |
| 8 | **S-9.8** | QA + FWA scorecard closure | Must be LAST |

### 8.3 Critical path

`S-9.1 → S-9.2 → S-9.8` (Theme A only) = **~18 hours** of dev if nothing blocks.
`S-9.3 → S-9.4 → S-9.5 → S-9.6 → S-9.8` (Theme B) = **~30 hours** dev + procurement lead time 2–3 weeks.

**Total Epic 9 low range:** 38h (Theme A+B core, skip C, no procurement delay).
**Total Epic 9 high range:** 54h (Theme A+B+C, includes buffer for R-1/R-2/R-3 mitigations).

---

## 9. Mind Clone consultation targets (per decision)

| Decision surface | Primary clones | Why |
|------------------|---------------|-----|
| ADR-001 (`<ViewTransition>` vs CSS) | **martin-fowler**, **werner-vogels** | Architecture decision: declarative vs imperative, coupling trade-offs |
| Motion contract (morph easing, 400ms duration, blur 3px) | **val-head** | Motion craft authority; she shaped Epic 8 Patch #2c |
| Copy/editorial tone consistency (C4 blog + configurador labels) | **tobias-van-schneider** | Editorial voice; already verbatim cited in Epic 8 closure |
| Configurador UX (affordance, disclosure, mental model) | **don-norman** | UX patterns for novel interactions in high-intent context |
| Performance budget (ADR-003) | **brendan-gregg** | Perf engineering authority, bundle analysis heuristics |
| R3F/3D perception (novelty vs gimmick) | **don-norman** + **val-head** (dual) | Novelty fatigue risk in luxury; gesture/interaction feel |
| Asset pipeline (ADR-004) | **kelsey-hightower**, **werner-vogels** | Infra/storage trade-offs |

**Execution:** `@pm` ou `@architect` executa consultations via brain-bridge MCP ANTES de kickoff das stories respectivas (S-9.1 → val-head morph duration; S-9.3 → brendan-gregg budget; S-9.4 → don-norman UX; S-9.7 → tobias-van-schneider copy).

---

## 10. Open Questions for @design-lead (Nova)

Questões cuja resposta muda escopo. **@dev NÃO inicia story afetada até Nova responder.**

**Q1 — Configurador scope: which peças featured?**
- Proposta: 2 peças flagship (Tenro, Luxo?) — confirma com Nova. Tem preference para terceira peça? Se yes, +1 GLB (= +2–3 semanas procurement, budget +R$2k).
- Impact: S-9.3 GLB count, S-9.4 material coverage (scope de espécies), budget ADR-003 (cache warming).

**Q2 — GLB fornecedor: have we sourced?**
- Opções: (a) artista 3D brasileiro via Behance/ArtStation (lead 2–3 wk, R$1.5–3k); (b) Turbosquid/Sketchfab licensed model + retopo (lead 1 wk, R$500–1.5k, mas fidelidade incerta); (c) photogrammetry de peça física (requer peça no estúdio + lead 1 wk + retopo R$800–2k).
- Impact: R-2 mitigation, S-9.3 kickoff timing, Epic 9 end-date.

**Q3 — Theme C1 (scroll-jacked atelier): ship OU cut?**
- Val-head Epic 8 aprovou atelier chapters SEM scroll-jacking (current state). C1 adiciona opt-in scroll-lock por chapter. Risco: user test feedback pode voltar negativo.
- Impact: S-9 stub list; se YES, adiciona 4–6h em S-9.7 ou novo S-9.9.

**Q4 — Theme C2 (custom cursor) + C3 (sound): ship OU cut?**
- C2+C3 são "awwwards gimmicks clássicos" — incrementam FWA mas são polish arriscado se mal-executado. Epic 8 não tocou neles.
- Impact: scope Epic 9 vs Epic 10. Recomendação Aria: **cut** — perseguir Theme A+B qualitativamente vale mais que +2 vetores medianos.

**Q5 — Configurador: "save config + send to WhatsApp" feature?**
- User configura wood/finish → botão "Quero essa configuração" abre WhatsApp com specs pré-preenchidas na mensagem. Converte configurador em lead-gen instrument vs brinquedo passivo.
- Impact: S-9.5 ou S-9.6 ganha AC para geração de URL WhatsApp parametrizada. Effort: +2h.
- Recomendação Aria: **YES ship**. Lead-gen value > polish; confirma commercial narrative.

**Q6 — 5-second test Epic 8: executed? results?**
- `docs/qa/s-8.6-5second-test.md` entregue mas execução depende de @pm recrutar 5 candidatos. Se ainda não rodou, Epic 9 escopo pode mudar com input.
- Impact: Theme C inclusion/cut decision.

**Q7 — Escalation trigger R-1 (bundle > 300 KB): quem autoriza rollback de Theme B?**
- Proposta: mid-epic gate após S-9.3 (pipeline smoke + bundle analyzer snapshot). Aria + Nova joint call.
- Impact: processo Epic 9 governance.

**Nova responde as 7 em `docs/prd/EPIC-9-PRD-NOVA-RESPONSES.md` (crear se não existir) ou inline nos comments do PR Epic 9 planning.**

---

## 11. Non-goals detalhados (clarification)

Item que parece in-scope mas NÃO está:

- **"Configurator Room view" (scene com sofá + tapete + mesa posicionada no ambiente).** Deferido Epic 10; Epic 9 entrega studio HDR + mesa isolada.
- **Hero video real substituição.** Dependência Nano Banana 2 é backlog Epic 8 (§10 closure). Se destravar durante Epic 9, é hot-swap fora de escopo stories.
- **Nova provenance fields (serial number, certificate of authenticity).** Content feature, não architecture — @pm trata separadamente.
- **Pricing dynamic (configurador muda preço).** Requires backend; out-of-scope §3.3 confirmed. Pricing permanece estático em `PRODUCTS` data file.
- **Tests de regressão visual automatizados (pixelmatch cross-viewport).** Já existe em `tests/qa/` de Epic 8; manter, não expandir em Epic 9 (scope creep).

---

## 12. Artifacts produced by Epic 9 (at close)

Stories, ADRs, e documentação compõem:

- `docs/prd/EPIC-9-PRD.md` — este documento
- `docs/stories/S-9.1-viewtransition-foundation-stub.md` → full story (drafted by @pm)
- `docs/stories/S-9.2-card-product-morph-stub.md` → full story
- `docs/stories/S-9.3-r3f-setup-stub.md` → full story
- `docs/stories/S-9.4-configurador-wood-finish-stub.md` → full story
- `docs/stories/S-9.5-rotate-ambient-stub.md` → full story
- `docs/stories/S-9.6-mobile-fallback-stub.md` → full story
- `docs/stories/S-9.7-blog-copy-v2-stub.md` → full story (if C4 ratified)
- `docs/stories/S-9.8-epic9-qa-closure-stub.md` → full story
- `docs/qa/EPIC-9-CLOSURE.md` — final closure report (generated at S-9.8)
- `docs/qa/s-9.8-fwa-scorecard.md` — post-Epic-9 FWA ratings
- `docs/qa/s-9.8-lighthouse.json` — per-route Lighthouse
- `docs/qa/s-9.8-axe.json` — per-route axe
- `docs/qa/s-9.8-bundle-analyzer.html` — bundle size report
- `tests/qa/s-9.8-epic9-closure-gate.mjs` — reusable harness

---

## 13. Revision notes

- **v0.1 Draft 2026-04-17** — Aria (@architect) initial draft post-Epic 8 closure. Awaits Nova Q1–Q7 responses.

---

*@architect (Aria) — 2026-04-17. Tocks Epic 9 PRD Draft. Trade-offs explicitos, decisões com rationale, risks com mitigation. Karpathy rules respeitados: suposições listadas nas open questions §10, mudanças cirurgicas no scope §3, critério de sucesso verificável §7.*
