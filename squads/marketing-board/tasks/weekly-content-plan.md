# Task: Weekly Content Plan — OPES Marketing Arm

**Task ID**: weekly-content-plan
**Agent**: @marketing-ideation
**Version**: 1.0.0

---

## Purpose

Planejar 7 dias de conteúdo de uma vez, populando a queue do Content Map. Executar no domingo ou segunda para ter a semana inteira mapeada.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `semana` | date | No | Data de início da semana (default: próxima segunda) |
| `foco` | string | No | Tema prioritário da semana |

---

## Workflow

### Step 1: Revisão da Semana Anterior

```
1. Verificar outputs/hubs/marketing/ — posts da semana passada
2. Identificar temas usados (evitar repetição)
3. Se metrics-weekly foi executado, incorporar insights
```

### Step 2: Geração do Plano Semanal

```
Para cada dia (seg-sex):
1. Consultar calendário de temas (platform-specs.yaml)
2. Selecionar sub-topic do content-map.yaml
3. Gerar Big Idea + ângulo recomendado
4. Adicionar à queue
```

### Step 3: Apresentar Plano

```markdown
| Dia | Tema | Big Idea | Ângulo | Prova |
|-----|------|----------|--------|-------|
| Seg | OPES | [idea] | [angle] | [proof] |
| Ter | Nexialismo | [idea] | [angle] | [proof] |
| Qua | Jornada | [idea] | [angle] | [proof] |
| Qui | OPES | [idea] | [angle] | [proof] |
| Sex | Provocação | [idea] | [angle] | [proof] |
```

### Step 4: Aprovação e Salvamento

```
1. José aprova ou ajusta
2. Atualizar queue no content-map.yaml
3. Plano salvo e pronto para /daily-content
```

---

## Output

| Output | Path | Description |
|--------|------|-------------|
| Weekly Plan | `data/content-map.yaml` (queue section) | Queue atualizada com 5 ideias |

---

## Success Criteria

- [ ] 5 Big Ideas geradas (seg-sex)
- [ ] Sem repetição de temas da semana anterior
- [ ] Cada ideia tem prova disponível
- [ ] Queue atualizada no content-map.yaml
- [ ] José aprovou o plano

---

*Task v1.0.0 — Weekly Planning for OPES Marketing*
