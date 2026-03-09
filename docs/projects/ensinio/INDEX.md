# Ensinio — Project Index

## Estado Atual
- **Squad:** `ensinio-whatsapp-prospector` v3.0.0 — 4 melhorias implementadas
- **Status:** Squad atualizado, pronto para teste com ZIP real
- **Bloqueadores:** Nenhum

## Última Sessão
- **Data:** 2026-03-09 ~13:30
- **Agente/Squad:** ensinio-whatsapp-prospector (direto, sem agente AIOS)
- **O que foi feito:**
  1. Avaliou se WhatsApp prospector deveria ser app ou squad (decisão: manter squad)
  2. Implementou 4 melhorias no squad v3.0.0:
     - Phase 2b: Phone Resolution interativa (phone-books per group)
     - ICP + Red Flags Intelligence (ensinio-mind v1.1)
     - Multi-grupo batch pipeline
     - Scoring v2.1 enriquecido
  3. Corrigiu acentuação PT-BR em todos os arquivos

## Próximo Passo
- Testar pipeline com ZIP real de grupo de WhatsApp
- Verificar se skill `pt-br-accentuation` precisa ser adicionada como pre-condition no workflow

## Histórico
| Data | Sessão | Resumo |
|------|--------|--------|
| 2026-03-09 | Squad v3.0.0 | 4 melhorias: phone resolution, ICP/red flags, batch, scoring v2.1 + correção acentuação |

## Squads Relacionados
- `ensinio-whatsapp-prospector` — Pipeline de prospecção via WhatsApp
- `ensinio-mind` — Source of truth do conhecimento Ensinio (v1.1)
- `ensinio-prospector` — Prospecção geral (consome ensinio-mind)
