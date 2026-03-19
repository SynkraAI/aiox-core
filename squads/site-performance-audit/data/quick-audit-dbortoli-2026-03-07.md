# Quick Audit — dbortoli.com.br

**Data:** 2026-03-07 | **Lighthouse:** 13.0.1 | **Estrategia:** Mobile + Desktop

---

## Category Scores

| Categoria | Mobile | Desktop |
|-----------|:------:|:-------:|
| Performance | 48 | 75 |
| Accessibility | 85 | 87 |
| Best Practices | 69 | 73 |
| SEO | 92 | 92 |

## Core Web Vitals (Lab)

| Metrica | Mobile | Desktop | Status |
|---------|:------:|:-------:|:------:|
| **LCP** | 12.9s | 2.8s | Poor / NI |
| **CLS** | 0.211 | 0.035 | NI / Good |
| **TBT** (proxy INP) | 120ms | 20ms | Good / Good |
| **FCP** | 5.6s | 1.3s | Poor / NI |
| **Speed Index** | 6.7s | 2.7s | NI / NI |

## Dados de Campo (CrUX - usuarios reais, p75)

| Metrica | Valor | Status |
|---------|:-----:|:------:|
| **TTFB** | 4,132ms | SLOW |
| **FCP** | 5,119ms | SLOW |
| **LCP** | 6,816ms | SLOW |
| **CLS** | 0.34 | SLOW |
| **INP** | 183ms | FAST |

> 4 de 5 metricas CrUX no vermelho. Apenas INP esta bom.

## CrUX Origin-level (p75)

| Metrica | Valor | Status |
|---------|:-----:|:------:|
| **TTFB** | 3,791ms | SLOW |
| **FCP** | 4,719ms | SLOW |
| **LCP** | 6,268ms | SLOW |
| **CLS** | 0.31 | SLOW |
| **INP** | 206ms | AVERAGE |

## Insights (ordenados por severidade)

| # | Insight | Economia Estimada |
|---|---------|:-----------------:|
| 1 | Render blocking requests | 4,160ms (mobile) / 1,020ms (desktop) |
| 2 | Improve image delivery | 794 KiB (mobile) / 40 KiB (desktop) |
| 3 | Use efficient cache lifetimes | 479 KiB |
| 4 | Document request latency | 430ms (mobile) / 800ms (desktop) |
| 5 | LCP request discovery | LCP nao preloaded |
| 6 | Font display | 30-70ms |
| 7 | Layout shift culprits (mobile) | CLS source |
| 8 | Network dependency tree | Chain de dependencias longa |
| 9 | Legacy JavaScript | 8 KiB |
| 10 | Forced reflow (desktop) | Layout thrashing |
| 11 | LCP breakdown (desktop) | LCP sub-parts analysis |

## Diagnosticos

| # | Diagnostico | Detalhe |
|---|-------------|:-------:|
| 1 | Reduce unused CSS | 163 KiB removiveis |
| 2 | Reduce unused JavaScript | 135 KiB removiveis |
| 3 | Enormous network payloads | 2,667 KiB total |
| 4 | Images without width/height | Causa CLS |
| 5 | Minify JavaScript | 2 KiB |

## Diagnostico Rapido - Top Hipoteses

1. **TTFB altissimo (4.1s no campo)** — Servidor demora demais para responder. Lab mostra 0ms (cache CDN), mas usuarios reais enfrentam 4+ segundos. Causa raiz principal.

2. **Render-blocking resources massivos** — 4.16s de bloqueio no mobile. CSS e JS impedem o primeiro render.

3. **LCP nao e discoverable** — Recurso LCP nao esta no HTML inicial, carregado via JS/CSS. Sem preload, browser descobre tarde -> 12.9s no mobile.

4. **Imagens sem otimizacao** — 794 KiB em savings, imagens sem width/height (causa CLS), payloads totais de 2.6 MB.

5. **CSS/JS nao utilizado** — ~300 KiB de codigo morto (163 KiB CSS + 135 KiB JS).

## Quick Wins

| # | Acao | Impacto | Esforco |
|---|------|---------|---------|
| 1 | Investigar e corrigir TTFB (hosting/backend) | Critico | Medio |
| 2 | Preload do LCP element | Alto | Baixo |
| 3 | Defer/async JS render-blocking | Alto | Baixo |
| 4 | Adicionar width/height nas imagens | Medio | Baixo |
| 5 | Converter imagens para WebP/AVIF | Medio | Baixo |
