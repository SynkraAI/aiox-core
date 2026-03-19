# Leandro Ladeira — Mind Clone + Squad

## Metadata
- **Tipo:** Mind Clone + Squad Creation
- **Squad alvo:** `squads/leandro-ladeira/`
- **Agente/Squad em uso:** `/squad-creator-pro:squad-chief` + `/mind-cloning`
- **Criado:** 2026-03-07
- **Última sessão:** 2026-03-08 às 01:15

## Objetivo

Criar mind clone completo do Leandro Ladeira baseado em 4 cursos transcritos (186 .md, 44.451 linhas) + 10 documentos de apoio, e gerar squad deployável com tasks, workflows e templates.

## Fontes

| Curso | Arquivos | Linhas | Temas |
|-------|----------|--------|-------|
| **Venda Todo Santo Dia (VTSD)** | 102 .md | ~25K | Sales system, Google Ads, Copy, Recovery |
| **Stories 10x** | 36 .md | ~8K | Viral growth, 37 dispositivos engenharia social |
| **Stories 10x AO VIVO** | 20 .md | ~5K | Live teaching, Q&A, case studies |
| **CPLs Lightcopy** | 3 .md | ~2K | Copywriting para produtos digitais |
| **Documentos de apoio** | 9 PDFs + 1 XLSX | QA 8.71/10 | Resumos, planilhas, dispositivos |

**Path dos materiais:** `squads/_imports/knowledge-base/+PROJETOS Palestras + Mágicas/LUIZFOSC/CURSOS E TRANSCRIÇÕES/Leandro Ladeira`

## Frameworks Documentados Detectados

- **Big Ideas** — Conceito central de posicionamento de produto
- **M.O.E.R** — Framework de validação
- **Stories 10x** — Growth viral com 37 dispositivos de engenharia social
- **VME (Validação pelo Menor Esforço)** — Validação de produto
- **Google Ads Masterclass** — 30 aulas de tráfego pago (search + display)
- **Sales Recovery** — 5 metodologias de recuperação (Saveleads)
- **13 Niche Playbooks** — Estratégias replicáveis por nicho

## Estado Atual

- **Fase:** 7/? — YouTube Enrichment em andamento (captions prontas, ETL pendente)
- **Status:** 🔄 Clone v1.0 APROVADO (85-90%). YouTube captions baixadas (56 vídeos, ~2M palavras). ETL + re-extração pendente para v2.0 (90%+ Elite)
- **Decisões tomadas:**
  - QUALITY mode (não YOLO) — materiais abundantes justificam
  - Arquitetura: Orchestrator + Tier 0 (clone principal) + Tasks especializadas por curso
  - 195 arquivos catalogados: 38 VOICE, 67 THINKING, 90 BOTH
  - 13 frameworks documentados detectados
  - Voice DNA: 10 arquivos prioritários selecionados (análises de nicho = ouro para voz)
  - Thinking DNA: 15 arquivos prioritários selecionados (M.O.E.R, 5 Fases, Big Idea, etc.)

## Plano de Execução (6 Fases)

| Fase | Ação | Output | Status |
|------|------|--------|--------|
| 0. Discovery | Mapear materiais e frameworks | Mapeamento completo | ✅ |
| 1. Source Curation | Classificar 195 arquivos (Voice vs Thinking) | `sources-map.yaml` | ✅ |
| 2. Voice DNA | Extrair estilo, frases assinatura, tom | `voice_dna_raw.md` (38KB) | ✅ |
| 3. Thinking DNA | Extrair frameworks, heurísticas, decisões | `thinking_dna_raw.md` (52KB) | ✅ |
| 4. Agent Creation | Criar agent com DNA completo | `leandro-ladeira.md` (39KB, 949 lines) | ✅ |
| 5. Squad Architecture | config.yaml + README.md | `squads/leandro-ladeira/` | ✅ |
| 6. Validation | 3/3 smoke tests PASS (avg 9.7/10) | Fidelidade 85-90% | ✅ |

## Arquitetura Planejada

| Tier | Agent | Foco |
|------|-------|------|
| **Orchestrator** | `leandro-ladeira-chief` | Roteamento e diagnóstico |
| **Tier 0** | `leandro-ladeira` | Clone principal (Voice + Thinking DNA completo) |
| **Tier 1** | Tasks especializadas | VTSD, Stories 10x, Google Ads, Copywriting |

## Próximo Passo

**Fase 7: YouTube Enrichment Pipeline** — em andamento:
1. ✅ Deep Search: 56 vídeos YouTube mapeados (entrevistas, podcasts, palestras, episódios)
2. ✅ Download captions + conversão .md: 56 arquivos, 1.973.029 palavras
3. ⬜ ETL Squad: `@etl-chief *batch --purpose squad-building` (captions → markdown estruturado)
4. ⬜ Re-extração DNA + incorporação ao squad leandro-ladeira (v2.0 → 90%+ Elite)

**Path dos .md do YouTube:** `squads/_imports/knowledge-base/.../Leandro Ladeira/Transcrição videos YT/`

## Histórico

| Data | Ação |
|------|------|
| 2026-03-07 | Discovery completa: 186 .md + 10 docs mapeados, 6 frameworks detectados, plano de 6 fases definido |
| 2026-03-07 | Fase 1 completa: 195 arquivos curados em sources-map.yaml (38 VOICE, 67 THINKING, 90 BOTH). 13 frameworks mapeados |
| 2026-03-07 | Fases 2-3 iniciadas: Voice DNA (10 files) + Thinking DNA (15 files) em extração paralela via Sonnet |
| 2026-03-07 | Fases 2-3 completas: Voice DNA 38KB (80+ citações), Thinking DNA 52KB (8 frameworks, 15+ heurísticas) |
| 2026-03-07 | Fase 4-5 completa: Agent 39KB (949 lines) + config.yaml + README.md criados em squads/leandro-ladeira/ |
| 2026-03-07 | Fase 6 completa: 3/3 smoke tests PASS — T1: 8/8 (domain), T2: 7/7 (decision), T3: 8/8 (objection). Avg 9.7/10 |
| 2026-03-08 | Fase 7 iniciada: Deep Search YouTube (56 vídeos) + download captions (56/56 OK) + conversão .md (1.973.029 palavras) |
