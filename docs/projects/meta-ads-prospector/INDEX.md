# Meta Ads Prospector — Project Index

## Estado Atual
- **Tipo:** Pipeline CLI de prospeccao
- **Local:** `~/CODE/Projects/meta-ads-prospector/`
- **Squad:** ensinio-mind (dados de ICP/scoring)
- **Status:** v2.0 — Pipeline Apify + dual scoring implementado. APIFY_TOKEN configurado. Pronto para teste.
- **Bloqueadores:** Nenhum

## Ultima Sessao
- **Data:** 2026-03-11
- **Agente/Squad:** @analyst (research) + @dev (implementacao)
- **O que foi feito:**
  1. Research: dark post comments tools (AdSpy $149, PowerAdSpy free, BigSpy $9)
  2. Confirmado: Ad Library ID != Post ID, sem conversao programatica
  3. Research: Apify viabilidade (200 perfis em 4-6min, $0.52, anti-ban automatico)
  4. Implementado 3 modos Playwright (scraper.js): ig, manual, ads
  5. Redesenhado pipeline para Apify + dual scoring (ensinio-mind):
     - `src/lib/apify.js` — Cliente REST API (batches de 25, delays 90s)
     - `src/lib/scorer.js` — Dual scoring (client 0-10 + partner 0-10)
     - `src/lib/messenger.js` — Mensagens personalizadas (tom Antonio/Fosc)
     - `src/pipeline.js` — 4 steps: comments → profiles → scoring → CSV
  6. APIFY_TOKEN configurado no .env

## Proximo Passo
- Testar pipeline com um post real do Instagram:
  `cd ~/CODE/Projects/meta-ads-prospector && node src/pipeline.js --posts "URL_DO_POST"`
- Validar scoring e mensagens geradas
- Testar modo --fast (sem enriquecimento de perfis)

## Squads Relacionados
- `ensinio-mind` — ICP, red flags, scoring criteria, message rules
- `ensinio-whatsapp-prospector` — Pipeline WhatsApp (integracao futura)

## Arquivos Chave
| Arquivo | Local | Conteudo |
|---------|-------|---------|
| `src/pipeline.js` | CODE/Projects | Pipeline Apify (PRINCIPAL) |
| `src/lib/apify.js` | CODE/Projects | Cliente Apify REST API |
| `src/lib/scorer.js` | CODE/Projects | Dual scoring |
| `src/lib/messenger.js` | CODE/Projects | Gerador de mensagens |
| `src/scraper.js` | CODE/Projects | Playwright fallback (3 modos) |
| `INDEX.md` | CODE/Projects | Estado do projeto (copia local) |
| `.env` | CODE/Projects | APIFY_TOKEN (NAO commitar) |

## Historico
| Data | Acao |
|------|------|
| 2026-03-11 | Projeto criado. Brainstorming + MVP Playwright + PRD |
| 2026-03-11 | Descoberta: dark posts sem comentarios. Pivo para IG Posts |
| 2026-03-11 | Research: dark post tools + Apify viabilidade |
| 2026-03-11 | v2.0: Pipeline Apify + dual scoring + mensagens personalizadas |
| 2026-03-11 | APIFY_TOKEN configurado. Pronto para teste |
