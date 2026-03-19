# Task: Diagnose Clone

**Command:** `*diagnose-clone`
**Load:** `data/an-clone-anti-patterns.yaml`

## Purpose

Diagnosticar por que um clone esta fraco, mapeando sintomas para causas raiz e prescrevendo tratamento.

## Workflow

### Step 1: Identify Symptoms

Perguntar ao usuario: "O que esta errado com o clone?"

Sintomas comuns:

- "Responde generico" → provavelmente falta Framework
- "Nao parece a pessoa" → fontes bronze ou sem Voice DNA
- "Se perde em conversas longas" → prompt monolitico, precisa estagios
- "Quebra facil" → sem veto conditions, immune system fraco
- "Inventa coisas" → sem Swipe File, sem limites
- "Muito robótico" → sem contradicoes produtivas, sem storytelling

### Step 2: Map to Root Cause

Usar `an-clone-anti-patterns.yaml` para diagnosticar:

| Sintoma           | Causa Raiz Provavel | Anti-pattern              |
| ----------------- | ------------------- | ------------------------- |
| Generico          | Falta Framework     | So Playbook, sem SE/ENTAO |
| Nao parece pessoa | Fontes bronze       | Volume sem curadoria      |
| Se perde          | Prompt monolitico   | Sem estagios              |
| Quebra facil      | Sem immune system   | Sem veto conditions       |
| Inventa           | Sem Swipe File      | Sem exemplos reais        |
| Robótico          | Sem paradoxos       | Contradictions resolvidas |

### Step 3: Verify Trinity

Checklist rapido:

- [ ] Tem Playbook? (passo a passo)
- [ ] Tem Framework? (SE/ENTAO)
- [ ] Tem Swipe File? (exemplos reais)
- [ ] Fontes sao ouro ou bronze?
- [ ] Quanto % do tempo foi curadoria?

### Step 4: Prescribe Treatment

Para cada causa raiz, prescrever acao especifica:

| Causa           | Tratamento                             | Prioridade |
| --------------- | -------------------------------------- | ---------- |
| Falta Framework | Extrair regras SE/ENTAO de entrevistas | URGENTE    |
| Fontes bronze   | Reclassificar, buscar ouro             | URGENTE    |
| Sem estagios    | Mapear contextos, criar stages         | ALTA       |
| Sem Swipe       | Coletar exemplos reais                 | ALTA       |
| Sem immune      | Definir veto conditions                | MEDIA      |
| Sem paradoxos   | Mapear contradictions produtivas       | MEDIA      |

### Step 5: Generate Report

```yaml
diagnosis_report:
  clone: "{nome}"
  symptoms: [{ lista }]
  root_causes:
    - cause: "{causa}"
      evidence: "{evidencia}"
      severity: "critico|alto|medio"
  trinity_status:
    playbook: "presente|ausente|parcial"
    framework: "presente|ausente|parcial"
    swipe_file: "presente|ausente|parcial"
  source_quality: "ouro|mixed|bronze"
  treatment:
    - action: "{o que fazer}"
      priority: "urgente|alta|media"
      effort: "{estimativa}"
  prognosis: "Com essas acoes, fidelidade deve subir de {X}% para {Y}%"
```

## Completion Criteria

- [ ] Sintomas identificados
- [ ] Causas raiz mapeadas
- [ ] Trindade verificada
- [ ] Tratamento prescrito com prioridades
- [ ] Report de diagnostico gerado
