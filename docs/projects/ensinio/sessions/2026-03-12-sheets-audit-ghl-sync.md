# Session 2026-03-12 — Sheets Audit + GHL Sync

## Projeto
- **Nome:** Ensinio WhatsApp Prospector
- **INDEX.md:** `docs/projects/ensinio/INDEX.md`

## O que foi feito

### 1. Auditoria completa da planilha (77 leads)
- Cruzou 3 fontes: planilha Google Sheets × lista de membros (screenshot) × chat export (9832 linhas)
- Fragmentou screenshot (12208px) em 12 pedaços de 1080px para OCR visual
- Identificou **9 telefones errados** (6 duplicados do +5511974830404 = número da Ci)
- Identificou **23 nomes incompletos** que precisavam de sobrenome
- Identificou **7 nomes com prefixos** profissionais (Engenheiro, Dra, etc.)
- Buscou nome real da pessoa ⚖️ (215 mensagens analisadas — nunca disse o nome)

### 2. Correção da planilha
- Separou coluna A (Nome) e B (Sobrenome) — antes tudo junto
- Completou 23 sobrenomes usando lista de membros + chat
- Corrigiu 9 telefones na coluna C
- Usou `tools/google-sheets-writer.js` para escrita direta (não tinha via MCP)
- Tratou problema do "+" sendo removido pelo Google Sheets (apostrophe prefix)

### 3. Sincronização GHL
- Criou `sync-sheets-to-ghl.js` — lê direto da planilha e sincroniza
- Implementou deduplicação: se contato existe, atualiza nome via PUT
- Implementou verificação de deals existentes antes de criar novos
- Endpoint `/opportunities/` agora funciona (era 404 antes — resolvido)
- Resultado: 75/77 OK (5 novos, 70 atualizados, 0 erros, 2 pulados)

### 4. Verificação cruzada final
- 67/77 números confirmados contra lista de membros
- 8 pessoas saíram do grupo — números originais não alterados
- 2 marcados VERIFICAR (Vinicius Soares, Patrícia de Pieri)

## Agente/Squad em uso
ensinio-whatsapp-prospector (operação direta, sem agent formal)

## Arquivos para contexto (próximo Claude DEVE ler)
- `docs/projects/ensinio/INDEX.md`
- `squads/ensinio-whatsapp-prospector/scripts/sync-sheets-to-ghl.js`
- `tools/google-sheets-writer.js`
- Planilha: https://docs.google.com/spreadsheets/d/124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI

## Decisões tomadas
- Sheets-First: planilha é source of truth, GHL sync é secundário
- Nomes com prefixo profissional → limpos para GHL (Engenheiro → removido)
- Pessoas sem nome (⚖️, Get and Go) → placeholder com contexto para SDR
- Telefones VERIFICAR → não sincronizados no GHL (melhor não criar com número errado)
- Endpoint `/opportunities/` funciona (o 404 anterior era outro problema)

## Próximo passo exato
1. SDR verifica 2 telefones pendentes (Vinicius Soares, Patrícia de Pieri)
2. SDR completa sobrenomes faltantes (15 leads)
3. SDR identifica ⚖️ (DDD 61) e Get and Go (nome real)
4. Rodar sync novamente após correções do SDR

## Arquivos modificados não commitados
- `docs/projects/ensinio/INDEX.md` (atualizado neste checkpoint)
- `docs/projects/ACTIVE.md` (atualizado neste checkpoint)
- `docs/projects/ensinio/sessions/2026-03-12-sheets-audit-ghl-sync.md` (este arquivo)
