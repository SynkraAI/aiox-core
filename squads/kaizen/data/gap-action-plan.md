# Gap Action Plan — 2026-02-21

Gerado pelo Kaizen Squad (Capability Mapper + Pedro Valerio audit).

---

## Prioridade 5: Conectar API de Dados (Pre-requisito para Analytics Mind)

**Status**: Planejado
**Bloqueio**: Recrutar analytics mind SEM dados = agente no vacuo (PV_BS_001)

### Opcoes de API

| API | Custo | Dados | Complexidade |
|-----|-------|-------|-------------|
| Google Analytics Data API (GA4) | Gratis (quotas) | Page views, sessoes, fontes | Media |
| YouTube Analytics API | Gratis (OAuth) | Views, watch time, CTR | Media |
| Instagram Graph API | Gratis (ja integrado) | Reach, impressions, engagement | Baixa (ja existe) |
| Metabase (self-hosted) | Gratis (OSS) | Dashboard customizado | Alta (setup) |

### Recomendacao

1. **Fase 1**: Usar Instagram Graph API (ja integrado no instagram-spy) como fonte de metricas
2. **Fase 2**: Adicionar YouTube Analytics API quando canal tiver dados
3. **Fase 3**: GA4 quando site/newsletter tiver volume

### Pre-requisitos para Recrutar Analytics Mind

- [ ] Pelo menos 1 API de dados conectada e retornando metricas
- [ ] Template de relatorio de metricas definido
- [ ] 30+ dias de dados historicos disponiveis
- [ ] Handoff definido: analytics mind → content-engine (para decisoes)

---

## Prioridade 6: Automatizar Handoff Kaizen → Squad-Creator

**Status**: Planejado
**Problema**: Quando kaizen detecta gap, handoff para squad-creator e manual

### Design do Workflow Automatico

```text
kaizen *gaps → detecta gap CRITICAL
  → gera recruitment-brief.md automaticamente
    → salva em squads/kaizen/data/briefs/
      → notifica usuario: "Gap detectado. Brief pronto para squad-creator."
```

### Formato do Brief Automatico

```yaml
# recruitment-brief-{date}-{domain}.yaml
domain: "{domain}"
priority: CRITICAL|HIGH|MEDIUM
demand: "{N} stories/month"
coverage: "{N}%"
recommended_mind: "{expert_name}"
framework: "{framework_name}"
evolution_stage: Genesis|Custom|Product|Commodity
action: recruit|adopt_tool|reskill
generated_by: capability-mapper
generated_at: "{ISO date}"
```

### Implementacao

- [ ] Adicionar output automatico de brief no task detect-gaps.md
- [ ] Criar template recruitment-brief-tmpl.yaml
- [ ] Adicionar comando `*generate-brief` ao capability-mapper
- [ ] Testar fluxo end-to-end: *gaps → brief → squad-creator *create-agent

---

*Gerado por Kaizen Squad — Wardley Maps + 4R Model + Pedro Valerio Process Audit*
