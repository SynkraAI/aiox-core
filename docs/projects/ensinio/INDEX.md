# Ensinio — Project Index

## Estado Atual
- **Squad:** `ensinio-whatsapp-prospector` v4.0.0 — pipeline completo com GHL
- **Epic:** [EPIC-ENSINIO-APP](../../stories/epics/epic-ensinio-prospector-app/EPIC.md) — Evolução Squad → App
- **Local:** `docs/projects/ensinio/`
- **Status:** Squad operacional, epic de evolução para app em Draft
- **Resultados:** 178 contatos, 77 qualificados, 20 HOT prospects (score 9-10)
- **Phone Resolution:** 77/77 prospects com telefone resolvido (100% coverage)
- **Outreach:** 77/77 mensagens personalizadas com WhatsApp links
- **Google Sheets:** Scripts prontos (TSV + Apps Script), MCP OAuth configurado

## Dados do Projeto
- **Phone-book:** `squads/ensinio-whatsapp-prospector/data/phone-books/mentoria-50k.json`
- **Outputs:** `squads/ensinio-whatsapp-prospector/data/outputs/mentoria-50k/`
  - `EXECUTIVE-SUMMARY.md` — Resumo executivo com Top 5 e action plan
  - `analysis-results-FINAL.md` — Relatório detalhado
  - `analysis-results.md` — Análise completa (2025 linhas, todos os 77 prospects)
  - `outreach-messages.md` — 77 mensagens personalizadas com WhatsApp links
  - `unique-quotes-top20.md` — Quotes fingerprint para busca no WhatsApp
  - `outreach-sheets-final.tsv` — Dados formatados para Google Sheets (7 colunas)
  - `populate-sheet.gs` — Google Apps Script para popular planilha automaticamente
- **Planilha:** `https://docs.google.com/spreadsheets/d/124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`
- **Scripts:** `squads/ensinio-whatsapp-prospector/scripts/`
  - `generate-sheets-csv.js` — Gera TSV com 12 colunas (formato expandido)
  - `generate-sheets-paste.js` — Gera TSV com 7 colunas (formato planilha padrão)
  - `generate-apps-script.js` — Gera Apps Script com dados embutidos

## Última Sessão (2026-03-12 — LATEST)
- **Data:** 2026-03-12 ~20:30 (Noite)
- **Agente/Squad:** @squad-chief + @media-processor → Ensinio Mind Enrichment
- **O que foi feito:**
  1. ✅ Processado vídeo YouTube via media-processor pipeline
     - URL: https://www.youtube.com/watch?v=JF0rWYPm1zc
     - Extração: Captions pt-BR (12min 34s)
  2. ✅ Atualizado ensinio-mind (v2.1.0 — Mind DNA Enrichment)
     - Voice DNA: +3 signature phrases (com [SOURCE:])
     - Thinking DNA: +2 heuristics (com QUANDO usar)
     - Fidelity: 88→91/100 | Coverage: 92%→98%
  3. ✅ Documentação completa atualizada:
     - `squads/ensinio-mind/README.md` (v2.1.0)
     - `docs/projects/ensinio/INDEX.md` (sessão adicionada)
  4. ✅ Gerado quality-dashboard para monitoramento
  5. ✅ Commit pronto para push (delegado para @devops)

---

## Sessão Anterior (GHL Integration)
- **Data:** 2026-03-12 ~18:30
- **Agente/Squad:** Epic EPIC-ENSINIO-APP + GHL Sync Investigation
- **Resumo:**
  1. ✅ Criado Epic EPIC-ENSINIO-APP com 4 milestones (M0→M4)
  2. ✅ 5 stories M0 criadas e validadas com @po (READY FOR IMPLEMENTATION)
  3. ✅ Investigado endpoint `/opportunities/` 404 → encontrado problema: faltava trailing slash
  4. ✅ Testado fluxo de deduplicação com test-ghl-single.js → **SUCCESS HTTP 201**
  5. ✅ Descoberto: lookup endpoint `/contacts/lookup/phone/` NÃO funciona (404)
  6. ✅ Solução: tentar criar → se 400, extrair contactId do erro meta
  7. ✅ Blocker GHL documentado em ADR-001-tech-stack.md + M0.4 story

## Próximo Passo
- **READY TO EXECUTE** — tudo pronto para sync dos 77:
  1. Reescrever sync-mentoria-ghl-v2.js com lógica de deduplicação (usar test-ghl-single.js como referência)
  2. Executar: `node scripts/sync-mentoria-ghl-v2.js` (esperado: 77 opportunities, 0 duplicatas)
  3. Popular Google Sheets com resultado
  4. Paralelo: Iniciar M0.1 (Smart Name Parser) para resolver problema de nomes concatenados

## Histórico
| Data | Sessão | Resumo |
|------|--------|--------|
| 2026-03-12 | GHL Integration v4.0 | API GHL validada, pipeline v4.0 com sync (contact+deal+msg), tag prompt, image-first phone resolution |
| 2026-03-10 (2) | Phone Resolution + Sheets | 77/77 telefones resolvidos, scripts Google Sheets, MCP OAuth configurado |
| 2026-03-10 (1) | Outreach completo | 57 novas mensagens (score 3-6), total 77/77 prospects cobertos |
| 2026-03-09 (3) | Phone Resolution + Outreach | 20/20 telefones resolvidos, 20 mensagens personalizadas escritas |
| 2026-03-09 (2) | Pipeline real MENTORIA 50K | Parse+Score de 9708 linhas: 178 contatos, 77 qualificados, 20 HOT |
| 2026-03-09 (1) | Squad v3.0.0 | 4 melhorias: phone resolution, ICP/red flags, batch, scoring v2.1 |

## Epic & Stories
- **Epic:** [EPIC-ENSINIO-APP](../../stories/epics/epic-ensinio-prospector-app/EPIC.md) — 4 milestones (M0→M4), ~20 stories
- **ADR:** [ADR-001 Tech Stack](../../stories/epics/epic-ensinio-prospector-app/ADR-001-tech-stack.md) — Decisões arquiteturais
- **Stories M0:** `docs/stories/active/story-M0.*` — Fundação técnica (5 stories)

## Squads Relacionados
- `ensinio-whatsapp-prospector` — Pipeline de prospecção via WhatsApp (v4.0, base do app)
- `ensinio-mind` — Source of truth do conhecimento Ensinio (v1.1)
- `ensinio-prospector` — Prospecção geral (consome ensinio-mind)
