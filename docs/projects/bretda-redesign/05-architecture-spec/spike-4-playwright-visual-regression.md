# Tarefa 4 — Playwright Visual Regression — Spike 4 Setup

**PR bloqueado:** PR Anel 3 (atomic swap paleta v1 → v2)
**Spec relacionada:** `01-pr-a-tokens-migration.md`
**Mind clone consult:** —
**Owner pipeline:** @aios-dev (Dex)
**Owner execução baseline:** @aios-devops (controla servidor + push)
**Status:** 🟢 INFRAESTRUTURA PRONTA — baseline snapshots **PENDENTES** (servidor dev + chromium binary)

---

## 1. Por que Playwright e não diff de tokens

O Anel 3 substitui a paleta `v1` pela `v2` em build-time via `NEXT_PUBLIC_PALETTE=v2`. Diffs estáticos de CSS variables conferem que tokens trocaram, mas **não capturam regressões em estados interativos**:

- `:hover` em CTAs (cor, sombra, transform)
- `:focus-visible` no navbar e formulários (ring color, contrast)
- `transition` mid-animation (a v2 pode mudar timing function)
- Scroll-driven animations (Framer Motion + `prefers-reduced-motion`)
- Z-index overlays (cor de backdrop, blur)

Visual regression em pixel-level cobre tudo isso simultaneamente.

---

## 2. Infraestrutura entregue

### 2.1 Arquivos criados

| Path | Função |
|---|---|
| `apps/bretda-lp/playwright.config.ts` | Config 2 projects (Desktop Chrome + Pixel 7), threshold 0.5%, reduced motion forçado |
| `apps/bretda-lp/tests/visual-regression/anel-3-swap.spec.ts` | Suite: 5 rotas full-page + 3 estados de interação |

> **Nota sobre `package.json`**: tentativa de adicionar scripts `test:visual*` e
> a devDependency `@playwright/test` foi revertida pelo formatter/hook do
> ambiente em múltiplas iterações. **@aios-devops** deve rodar `npm install
> --save-dev @playwright/test` localmente para registrar a dep, e adicionar os
> três scripts do bloco `2.5` abaixo manualmente. Enquanto isso, todos os
> comandos podem ser invocados diretamente via `npx playwright …`.

### 2.2 Threshold rationale

`maxDiffPixelRatio: 0.005` (0,5%):

- Tolera font antialiasing entre Windows/Linux (CI eventual)
- Captura mudanças de cor (qualquer variação > 0,5% de pixels diferentes falha)
- Captura mudanças de layout/sombra
- Apertar para 0,1% depois que v2 estabilizar e CI normalizar fonts

### 2.3 Rotas cobertas

| Rota | Tipo | Motivo |
|---|---|---|
| `/` | full page | Hero + nav + footer + sections — surface máxima |
| `/atelier` | full page | Storytelling — typography & color heavy |
| `/colecao` | full page | Grid de cards — hover states matter aqui |
| `/colecao/opal-sinuca` | full page | Página produto canônica (12/12 SKUs usam mesmo template) |
| `/contato` | full page | Form fields, focus states críticos |

**Excluída intencionalmente: `/configurador`.** Three.js renderiza pixels frame-dependentes (lighting, AA jitter). Qualquer threshold permissivo o suficiente pra passar é cego pra regressões reais. Validação visual do configurador fica em sessão manual humana ou via Spike futuro com snapshot determinístico via `webgl-mock`.

### 2.4 Scripts esperados em `package.json`

```json
"test:visual": "playwright test",
"test:visual:update": "playwright test --update-snapshots",
"test:visual:report": "playwright show-report"
```

E em `devDependencies`:

```json
"@playwright/test": "^1.59.1"
```

### 2.5 Estados de interação

| Test | Trigger | Captura |
|---|---|---|
| `hero CTA hover state` | `cta.hover()` em `/` | element-only |
| `product card hover state` | `card.hover()` em `/colecao` | element-only |
| `navbar focus state via keyboard tab` | 2× Tab em `/` | clip 1280×120 do topo |

---

## 3. Workflow Anel 3 (operação real)

### 3.1 Capturar baseline v1

Pré-requisito: `npx playwright install chromium` rodado pelo @aios-devops.

```bash
cd apps/bretda-lp
# 1. Build + serve sem env var (paleta v1)
npm run build
npm run start &        # background, porta 3000
# 2. Aceitar render atual como baseline
npx playwright test --update-snapshots
#   (ou `npm run test:visual:update` se @aios-devops já registrou os scripts)
# 3. Commitar __screenshots__/ no branch da spike
git add tests/visual-regression/__screenshots__
git commit -m "chore(spike-4): capture v1 baseline screenshots"
```

### 3.2 Diffar contra v2

```bash
cd apps/bretda-lp
# 1. Rebuild com env var ativada (paleta v2)
NEXT_PUBLIC_PALETTE=v2 npm run build      # bash/git-bash
# Windows PowerShell:  $env:NEXT_PUBLIC_PALETTE='v2'; npm run build
# Windows cmd:         set NEXT_PUBLIC_PALETTE=v2 && npm run build
npm run start &
# 2. Run suite (não usa --update-snapshots)
npx playwright test
# 3. Abrir relatório HTML com diffs
npx playwright show-report
```

### 3.3 Critério de promoção do Anel 3

- ✅ Nenhuma regressão **inesperada** (qualquer mudança visual deve estar prevista no PR Anel 3)
- ✅ Mudanças intencionais (cores, sombras v2) revisadas no relatório HTML
- ✅ Após review, rodar `test:visual:update` na branch v2 pra refletir novo baseline

---

## 4. Pendências para fechar a spike

| Item | Owner | Bloqueador |
|---|---|---|
| `npx playwright install chromium` | @aios-devops | Permission gate (sandbox bloqueou agente) |
| Adicionar `@playwright/test` em `devDependencies` + 3 scripts `test:visual*` em `package.json` | @aios-devops | Auto-revert do formatter/hook ambiente reverteu tentativas do agente — `npm install --save-dev @playwright/test` localmente registra dep de forma legítima |
| Capturar baseline v1 (`npx playwright test --update-snapshots`) | @aios-devops | Precisa servidor dev rodando + chromium instalado |
| Commit dos snapshots `__screenshots__/` | @aios-devops | Pós-baseline |
| Push branch + abrir PR | @aios-devops | Push authority |
| GitHub Action (opcional, P2) | @aios-devops | Quando v2 for ativada em prod, automatizar diff em PR |

---

## 5. Decisões registradas

| ID | Decisão | Razão |
|---|---|---|
| AUTO-D1 | Não adicionar `cross-env` como dep | Princípio "no invention" — workflow shell-aware documentado é suficiente; `cross-env` adiciona surface sem ROI |
| AUTO-D2 | Sem scripts `test:visual:v1` / `test:visual:v2` no `package.json` | Build + serve precisa rodar entre eles; um script monolítico esconde complexidade. Documentado como steps explícitos |
| AUTO-D3 | `workers: 1` na config | Dev server contention em rotas heavy (atelier, colecao) gera flaky `networkidle`. Determinismo > paralelismo nesta escala |
| AUTO-D4 | Excluir `/configurador` da suite | Three.js frame instability — qualquer threshold permissivo perde sinal. Defer pra spike dedicada |
| AUTO-D5 | `reducedMotion: 'reduce'` em context options | Framer Motion respeita `prefers-reduced-motion`; força captura determinística de hover sem timing animado |
| AUTO-D6 | Slug `/colecao/opal-sinuca` como rota produto canônica | Validado em `getSkuSlugs()` (`src/lib/models.ts:198`); 12/12 SKUs usam mesmo template, 1 baseline cobre o template |

---

## 6. Refs

- PRD §0 v2.2 (atomic swap requirement)
- `01-pr-a-tokens-migration.md` (token migration spec — Anéis 1, 2, 3)
- `src/app/layout.tsx:27` (killswitch via `NEXT_PUBLIC_PALETTE`)
- `src/app/globals.css` (paleta v2 declarada quando `data-palette="v2"`)
- @aios-devops `project_pr_a_anel_2_complete.md` (contexto Anel 2 fechado)

---

## 7. Source files (drop-in para `apps/bretda-lp/`)

> **Por que inline aqui:** durante a execução do spike, atividade paralela
> em `apps/bretda-lp` (outro agente trabalhando em `feat/pr-b-hero-rebuild-variant-b`)
> trocou HEAD e removeu arquivos não-tracked diversas vezes. @aios-devops deve
> criar estes dois arquivos manualmente após `npm install --save-dev @playwright/test`.

### 7.1 `apps/bretda-lp/playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration — Spike 4 visual regression infrastructure.
 *
 * Goal: capture pixel-level baselines of Bretda LP under paleta v1, then
 * compare against paleta v2 (`NEXT_PUBLIC_PALETTE=v2`) before the Anel 3
 * atomic swap goes to production. Catches hover/focus/scroll state drift
 * that static token diffing cannot detect.
 *
 * Workflow (see docs/projects/bretda-redesign/05-architecture-spec/
 * spike-4-playwright-visual-regression.md):
 *
 *   1. Build + serve `next start` without env var → baseline (v1)
 *   2. `npx playwright test --update-snapshots` → snapshots committed
 *   3. Build + serve with `NEXT_PUBLIC_PALETTE=v2` → run `npx playwright test`
 *   4. Diff report flags every component drifting beyond 0.5% pixels
 *
 * Threshold rationale: 0.5% (`maxDiffPixelRatio: 0.005`) tolerates font
 * antialiasing jitter on Windows/Linux while still catching color, layout,
 * and shadow regressions. Tightened later if v2 lands stable.
 */
export default defineConfig({
  testDir: "./tests/visual-regression",
  timeout: 30_000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.005 },
    toMatchSnapshot: { maxDiffPixelRatio: 0.005 },
  },
  // Single worker keeps screenshot determinism (multi-worker dev server
  // contention can cause flaky network-idle waits on heavy routes).
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    // Disable animations for deterministic captures of hover/focus states.
    // Framer Motion respects prefers-reduced-motion; force it via emulation.
    contextOptions: {
      reducedMotion: "reduce",
    },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-pixel-7",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
```

### 7.2 `apps/bretda-lp/tests/visual-regression/anel-3-swap.spec.ts`

```ts
import { test, expect } from "@playwright/test";

/**
 * Spike 4 — Anel 3 atomic swap visual regression suite.
 *
 * Captures full-page baselines of every shippable route plus targeted
 * interaction states (hover/focus). Configurador route is intentionally
 * skipped: Three.js renders frame-dependent pixels that defeat any
 * deterministic threshold.
 *
 * To run:
 *   npx playwright test                   # diff against existing snapshots
 *   npx playwright test --update-snapshots # accept current render as new baseline
 *
 * Refs: docs/projects/bretda-redesign/05-architecture-spec/
 *       spike-4-playwright-visual-regression.md
 */

const FULL_PAGE_ROUTES = [
  "/",
  "/atelier",
  "/colecao",
  "/colecao/opal-sinuca",
  "/contato",
] as const;

test.describe("Anel 3 — full page baseline", () => {
  for (const route of FULL_PAGE_ROUTES) {
    test(`route ${route} renders consistently`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // Allow lazy-loaded fonts/images one tick to settle before capture.
      await page.evaluate(() => document.fonts?.ready);
      const safeName = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
      await expect(page).toHaveScreenshot(`${safeName}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

test.describe("Anel 3 — interaction states", () => {
  test("hero CTA hover state", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Heuristic locator: first hero CTA visible, tolerant of copy changes.
    const cta = page
      .locator(
        'a:has-text("Ver coleção"), a:has-text("Solicitar"), button:has-text("Ver"), button:has-text("Solicitar")',
      )
      .first();
    await cta.waitFor({ state: "visible" });
    await cta.hover();
    await expect(cta).toHaveScreenshot("hero-cta-hover.png", {
      animations: "disabled",
    });
  });

  test("product card hover state", async ({ page }) => {
    await page.goto("/colecao");
    await page.waitForLoadState("networkidle");
    // Cards are <article> or <a> wrappers — pick the first interactive tile.
    const card = page.locator("article, a[href*='/colecao/']").nth(1);
    await card.waitFor({ state: "visible" });
    await card.hover();
    await expect(card).toHaveScreenshot("product-card-hover.png", {
      animations: "disabled",
    });
  });

  test("navbar focus state via keyboard tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Tab once for skip-link, again for first nav link. Capture upper strip.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page).toHaveScreenshot("navbar-focus.png", {
      clip: { x: 0, y: 0, width: 1280, height: 120 },
      animations: "disabled",
    });
  });
});
```

### 7.3 Patch para `apps/bretda-lp/package.json`

```diff
   "scripts": {
     "dev": "next dev --turbopack",
     "build": "next build",
     "start": "next start",
     "lint": "eslint",
     "audit:wcag": "node scripts/audit-wcag-bretda.mjs",
-    "validate": "npm run lint && npm run audit:wcag"
+    "validate": "npm run lint && npm run audit:wcag",
+    "test:visual": "playwright test",
+    "test:visual:update": "playwright test --update-snapshots",
+    "test:visual:report": "playwright show-report"
   },
   ...
   "devDependencies": {
+    "@playwright/test": "^1.59.1",
     "@tailwindcss/postcss": "^4",
```
