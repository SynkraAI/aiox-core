# 🔍 Insight Squad — Research, Diagnosis & Reporting

Squad de market intelligence para negócios locais brasileiros.
Pesquisa presença digital, mapeia oportunidades de mercado e transforma dados em relatórios narrativos que vendem.

## Quick Start

```
@insight-chief    → Orquestrador (triage, routing, QA)
@digital-profiler → Dossiê de presença digital
@market-scout     → Mapa de oportunidades
@data-storyteller → Relatórios narrativos
```

## Agentes

| Agente | Tier | Tipo | Papel |
|--------|------|------|-------|
| **insight-chief** | Orchestrator | Funcional | Triage, routing, QA checkpoint, handoff |
| **digital-profiler** | Tier 1 | Funcional (niche-aware) | Dossiê de presença digital com score 0-100 |
| **market-scout** | Tier 1 | Composite (8 minds) | Mapa de oportunidades com keywords + ICE score |
| **data-storyteller** | Tier 1 | Composite (6 minds) | Reports narrativos (pré-venda, semanal, mensal) |

## Elite Minds Integrados

### market-scout (8 frameworks)

| Mind | Framework | Função |
|------|-----------|--------|
| Conrado Adolpho | 8Ps do Marketing Digital | Workflow principal (27k+ PMEs BR) |
| Rafael Kiso | Unbound Marketing | Classificação de canais |
| Perry Marshall | 80/20 + Power Triangle | Priorização matemática |
| Marcus Sheridan | They Ask, You Answer (Big 5) | Mapeamento de demanda |
| Tim Soulo | Business Potential Score | Scoring de keywords |
| Alex Hormozi | Value Equation + Core Four | Qualidade da oportunidade |
| Sean Ellis | ICE Score | Priorização de ações |
| Eugene Schwartz | 5 Awareness Levels | Maturidade do mercado |

### data-storyteller (6 frameworks)

| Mind | Framework | Função |
|------|-----------|--------|
| Cole Nussbaumer Knaflic | 6-Step Storytelling with Data | Processo de criação |
| Brent Dykes | Data + Narrative + Visuals | Equilíbrio da tríade |
| Randy Olson | ABT (And-But-Therefore) | Estrutura narrativa |
| Edward Tufte | Data-Ink Ratio | Quality gate visual |
| Chip & Dan Heath | SUCCESs | Stickiness check |
| Alberto Cairo | 5 Qualities | Truthfulness audit |

## Fluxos Principais

### Novo Lead (Pré-venda)
```
Lead → insight-chief (triage)
         ├→ digital-profiler (dossiê)     ← paralelo
         └→ market-scout (mapa)           ← paralelo
              └→ data-storyteller (report de impacto)
                   └→ insight-chief (QA)
                        └→ Operador usa como arma de vendas
```

### Recorrência
```
Semanal:    data-storyteller → dashboard interno → operador
Mensal:     data-storyteller → report narrativo → QA → cliente
Trimestral: profiler + scout + storyteller → relatório de evolução
```

## ICP (Ideal Customer Profile)

- **Segmento:** Negócios locais brasileiros
- **Tamanho:** 5-30 funcionários
- **Ticket:** > R$ 500

## Stack

| Ferramenta | Função | Custo |
|------------|--------|-------|
| Exa MCP | Busca semântica | Configurado |
| Brave Search API | Busca SERP | 2k/mês grátis |
| Google Places API | Dados Maps | 10k/mês grátis |
| Google Ads API | Keywords, CPC | 2,880 ops/dia |
| Lighthouse CLI | Performance sites | Grátis |
| Google Workspace | Output (Sheets, Docs, Drive) | Grátis |

## Output Conventions

Todos os artefatos gerados pelo squad são salvos em `outputs/insight/{client-slug}/`:

```
outputs/insight/{client-slug}/
├── dossie-presenca-digital.md      ← @digital-profiler
├── mapa-oportunidades.md           ← @market-scout
├── report-impacto.md               ← @data-storyteller (pré-venda)
├── report-mensal-{YYYY-MM}.md      ← @data-storyteller (recorrente)
├── dashboard-semanal-{YYYY-MM-DD}.md ← @data-storyteller (interno)
└── report-trimestral-{YYYY-QN}.md  ← @data-storyteller (evolução)
```

**Regras:**
- `{client-slug}` = nome do cliente em lowercase, sem acentos, hifenizado (ex: `clinica-sorrir`)
- Nome do arquivo = tipo do documento, fixo (não inclui data no nome)
- Documentos recorrentes incluem período no sufixo (`-2026-02`, `-2026-Q1`)
- NUNCA salvar outputs dentro de `squads/insight/` — essa pasta é código do squad, não dados

## Comandos

### @insight-chief (Orquestrador)

| Comando | Descrição |
|---------|-----------|
| `*new-lead {nome} {cidade} {nicho}` | Diagnóstico completo (profiler + scout + storyteller) |
| `*profile {nome}` | Rodar apenas digital-profiler |
| `*scout {nicho} {cidade}` | Rodar apenas market-scout |
| `*report-impact {lead}` | Report de impacto para pré-venda |
| `*report-monthly {cliente}` | Relatório mensal |
| `*report-quarterly {cliente}` | Relatório trimestral de evolução |
| `*dashboard-weekly` | Dashboard semanal interno |
| `*review {output}` | QA checkpoint em output |
| `*approve {output}` | Aprovar output |
| `*handoff {squad} {cliente}` | Preparar handoff para outro squad |
| `*status` | Pipeline atual |
| `*autonomy` | Nível de autonomia |

### @digital-profiler

| Comando | Descrição |
|---------|-----------|
| `*profile {nome} {cidade} {nicho}` | Dossiê completo |
| `*profile-quick {nome} {cidade} {nicho}` | Análise rápida (Site + Maps + Instagram) |
| `*compare {nome1} {nome2} {nome3}` | Comparativo entre negócios |
| `*score {nome}` | Recalcular score |
| `*gaps {nome}` | Gaps priorizados |

### @market-scout

| Comando | Descrição |
|---------|-----------|
| `*scout {nicho} {cidade}` | Mapa completo de oportunidades |
| `*scout-quick {nicho} {cidade}` | Mapa rápido (keywords + competição) |
| `*keywords {nicho} {cidade}` | Pesquisa de keywords scored |
| `*competition {nicho} {cidade}` | Cenário competitivo |
| `*seasonality {nicho}` | Sazonalidade e tendências |
| `*opportunities {nicho} {cidade}` | Oportunidades com ICE score |

### @data-storyteller

| Comando | Descrição |
|---------|-----------|
| `*report-impact {lead}` | Report de impacto (pré-venda) |
| `*report-monthly {cliente}` | Relatório mensal |
| `*report-quarterly {cliente}` | Relatório trimestral |
| `*dashboard-weekly` | Dashboard semanal |
| `*check-abt {report}` | Verificar estrutura ABT |
| `*check-success {report}` | Aplicar SUCCESs test |
| `*check-tufte {report}` | Aplicar Data-Ink Ratio |
| `*check-cairo {report}` | Rodar 5 Qualities |

## Instalação

```bash
# Copiar agents para IDE commands
cp squads/insight/agents/*.md .claude/commands/insight/agents/
```

## Plano Completo

Ver `docs/squads/insight-plan.md` para o plano detalhado com decisões registradas.

---

*Squad Insight v1.0.0 — Pesquisar > Diagnosticar > Apresentar.*
