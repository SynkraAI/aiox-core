# SP_TT_001 — Team Type Classification

**Type:** Decision Heuristic
**Phase:** 1 (Organizational Design)
**Agent:** @kaizen:skelton-pais
**Pattern:** SP-CORE-001 (Team Topologies Classification)

## Purpose

Heurístico para classificar qualquer time/squad em um dos 4 tipos fundamentais de Team Topologies. A classificação correta é pré-requisito para definir modos de interação, avaliar carga cognitiva e otimizar fluxo de mudança. Classificação errada gera anti-patterns organizacionais.

## Configuration

```yaml
SP_TT_001:
  name: "Team Type Classification"
  phase: 1
  pattern_reference: "SP-CORE-001"

  weights:
    value_stream_alignment: 0.9    # quanto o time está alinhado a um fluxo de valor
    end_to_end_ownership: 0.85     # capacidade de entregar sem dependências
    specialization_depth: 0.7      # profundidade de especialização técnica
    service_orientation: 0.8       # provê serviços self-service para outros
    capability_building: 0.75      # foco em construir capacidades em outros times

  thresholds:
    stream_aligned_score: 0.7      # acima = stream-aligned
    enabling_coaching_ratio: 0.6   # % do trabalho que é coaching/facilitação
    subsystem_specialization: 0.8  # nível de especialização técnica necessário
    platform_self_service: 0.7     # % de consumo que é self-service

  veto_conditions:
    - condition: "devops_team_label"
      action: "VETO — 'DevOps team' é anti-pattern. DevOps é capacidade, não tipo de time."
    - condition: "shared_services_model"
      action: "VETO — Shared services cria gargalos. Reclassifique como Platform ou Enabling."
    - condition: "team_without_clear_mission"
      action: "VETO — Todo time precisa de missão clara. Sem missão = carga cognitiva ambígua."
    - condition: "more_than_30_percent_complicated_subsystem"
      action: "VETO — Mais de 30% de times como Complicated Subsystem indica fragmentação."
    - condition: "enabling_team_delivering_features"
      action: "VETO — Enabling não entrega features. Se entrega, é Stream-aligned disfarçado."

  decision_tree:
    - IF delivers_value_to_end_user AND owns_full_flow THEN stream_aligned
    - IF primary_work_is_coaching_other_teams THEN enabling
    - IF deep_specialist_knowledge_required AND would_overload_stream_teams THEN complicated_subsystem
    - IF provides_internal_services_as_self_service THEN platform
    - IF none_match THEN likely_stream_aligned_with_wrong_scope
    - IF multiple_match THEN split_responsibilities_or_reduce_scope
    - TERMINATION: each_team_has_exactly_one_type_assigned

  output:
    type: "classification + recommendation"
    values: ["STREAM-ALIGNED", "ENABLING", "COMPLICATED SUBSYSTEM", "PLATFORM", "NEEDS SPLIT"]
```

## Classification Criteria

```text
TIPO 1: STREAM-ALIGNED
  Indicadores:
    - Entrega valor diretamente ao usuário final
    - Ownership end-to-end de um fluxo (produto, serviço, jornada)
    - Pode entregar sem esperar por outros times
    - Monitora e responde a incidentes do próprio fluxo
  Contra-indicadores:
    - Depende de 3+ times para entregar qualquer feature
    - Não tem contato com o usuário final
    - Trabalho é predominantemente interno/técnico
  Proporção ideal: 60-80% dos times da organização

TIPO 2: ENABLING
  Indicadores:
    - Trabalho principal é ajudar outros times a melhorar
    - Coaching, mentoria, pair programming com stream-aligned
    - Detecta gaps de capacidade e propõe soluções
    - Objetivo é tornar-se desnecessário para cada time ajudado
  Contra-indicadores:
    - Entrega features diretamente ao usuário
    - Possui backlog permanente de work items
    - Times dependem permanentemente dele
  Proporção ideal: 5-15% dos times

TIPO 3: COMPLICATED SUBSYSTEM
  Indicadores:
    - Requer especialização profunda que poucos possuem
    - Carga cognitiva do domínio sobrecarregaria stream-aligned
    - Provê interface/API clara para consumo
    - Domínio raramente muda (estável)
  Contra-indicadores:
    - A "especialização" pode ser aprendida em semanas
    - Não existe interface clara — tudo é ad hoc
    - Mais de 30% dos times são desse tipo
  Proporção ideal: 0-10% dos times (raramente necessário)

TIPO 4: PLATFORM
  Indicadores:
    - Provê serviços internos como self-service
    - Reduz carga cognitiva dos stream-aligned
    - Tratada como produto interno com "clientes" internos
    - Consumo sem necessidade de comunicação direta
  Contra-indicadores:
    - Consumidores precisam abrir tickets para usar
    - Não existe documentação ou API de self-service
    - É apenas "infra" sem mentalidade de produto
  Proporção ideal: 10-20% dos times
```

## Application

**Input:** Descrição de um time, suas responsabilidades e interações.

**Process:**
1. Liste todas as responsabilidades do time
2. Identifique o consumidor primário (usuário final vs. outros times)
3. Avalie o nível de especialização requerido
4. Verifique se o trabalho é permanente ou temporário
5. Aplique os indicadores acima para classificar

## Examples

### Classificação: Time de Produto Mobile

- **Entrega valor ao usuário final?** Sim — app mobile
- **Ownership end-to-end?** Sim — do backlog ao deploy
- **Classificação:** STREAM-ALIGNED
- **Validação:** Pode entregar features sem esperar por nenhum outro time? Se sim, confirmado.

### Classificação: Time de SRE/Platform Engineering

- **Consumidor primário?** Outros times de engenharia
- **Self-service?** Sim — CI/CD, observabilidade, infra como código
- **Classificação:** PLATFORM
- **Teste:** Os stream-aligned conseguem fazer deploy sem abrir ticket? Se sim, platform saudável.

### Classificação: Time de "DevOps"

- **VETO TRIGGERED** — "DevOps team" é anti-pattern
- **Reclassificação:** Se foca em tooling → PLATFORM. Se faz coaching de práticas → ENABLING.
- **Ação:** Renomear e redefinir missão conforme o tipo real.

## Diagnostic Questions

1. "Quem é o consumidor primário do trabalho desse time?"
2. "Esse time pode entregar valor sem depender de outros?"
3. "O trabalho principal é construir produto ou construir capacidades?"
4. "Outros times consomem o output como self-service?"
5. "Qual seria a carga cognitiva se esse trabalho fosse absorvido por stream-aligned?"

---

**Pattern Compliance:** SP-CORE-001 (Team Topologies Classification) ✓
**Source:** SP Mind DNA - Team Topologies Framework
