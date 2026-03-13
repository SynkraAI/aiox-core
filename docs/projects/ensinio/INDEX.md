# Ensinio — Project Index

## Estado Atual
- **Squad:** `ensinio-whatsapp-prospector` v5.0 — Sheets-First + GHL Sync
- **Epic:** [EPIC-ENSINIO-APP](../../stories/epics/epic-ensinio-prospector-app/EPIC.md) — Evolução Squad → App
- **Local:** `docs/projects/ensinio/`
- **Status:** Planilha auditada, nomes corrigidos, GHL sincronizado
- **Resultados:** 77 leads, 75 sincronizados no GHL, 2 pendentes (VERIFICAR)
- **Phone Resolution:** 67/77 verificados na lista de membros, 8 de saídos do grupo, 2 VERIFICAR
- **Outreach:** 77/77 mensagens personalizadas com WhatsApp links
- **Google Sheets:** Planilha com Nome/Sobrenome/Telefone separados, dados auditados
- **GHL:** 75 contatos + deals sincronizados (5 novos, 70 nomes atualizados)

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
- **Data:** 2026-03-12 ~22:00 (Noite)
- **Agente/Squad:** ensinio-whatsapp-prospector (direto, sem agent formal)
- **O que foi feito:**
  1. ✅ Auditoria completa de 77 leads: cruzou planilha × lista de membros × chat
  2. ✅ Corrigiu 9 telefones errados (6 duplicados do +5511974830404 + 3 outros)
  3. ✅ Completou 23 nomes com sobrenomes (Katia→Katia Tavares, etc.)
  4. ✅ Separou Nome/Sobrenome em colunas distintas na planilha
  5. ✅ Removeu prefixos profissionais (Engenheiro, Dra, Psicóloga, etc.)
  6. ✅ Criou `sync-sheets-to-ghl.js` — lê da planilha e sincroniza com GHL
  7. ✅ Sincronizou 75/77 leads no GHL (5 novos contatos+deals, 70 nomes atualizados)
  8. ✅ Verificação cruzada: 67 números confirmados, 8 de saídos do grupo, 2 VERIFICAR

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
- **Verificar 2 telefones pendentes:** Vinicius Soares e Patrícia de Pieri (saíram do grupo)
- **Resolver 2 nomes:** ⚖️ (DDD 61, jurídica) e Get and Go (empresa mini mercado)
- **SDR:** Completar sobrenomes faltantes (Eduardo, Alexandra, Ci, Jovito, etc.)
- **Opcional:** Implementar Phase 8 (populate-sheet-v5.md) e Phase 9 (sync-to-ghl-v5.md) do pipeline v5.0

## Histórico
| Data | Sessão | Resumo |
|------|--------|--------|
| 2026-03-12 (3) | Sheets Audit + GHL Sync | Auditoria 77 leads, 9 telefones corrigidos, 23 nomes completados, 75 sincronizados no GHL |
| 2026-03-12 (2) | GHL Integration v4.0 | API GHL validada, pipeline v4.0 com sync (contact+deal+msg), tag prompt, image-first phone resolution |
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
