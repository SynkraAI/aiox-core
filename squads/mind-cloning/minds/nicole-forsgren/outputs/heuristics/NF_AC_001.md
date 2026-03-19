# NF_AC_001 — Accelerate Capabilities Assessment

**Type:** Decision Heuristic
**Phase:** 1 (Capabilities Diagnosis)
**Agent:** @kaizen:nicole-forsgren
**Pattern:** NF-CORE-002 (Accelerate Capabilities Model)

## Purpose

Heurístico para avaliar quais capabilities (técnicas, de processo e culturais) estão presentes, ausentes ou fracas em uma organização. Capabilities, não níveis de maturidade, são o que determina performance em software delivery. Esta avaliação identifica onde investir para melhorar as 4 métricas DORA simultaneamente.

## Configuration

```yaml
NF_AC_001:
  name: "Accelerate Capabilities Assessment"
  phase: 1
  pattern_reference: "NF-CORE-002"

  weights:
    technical_capabilities: 0.9        # impacto direto nas 4 métricas DORA
    process_capabilities: 0.85         # reduz batch size e lead time
    cultural_capabilities: 0.8         # correlação forte com performance

  capability_categories:
    technical:
      version_control: 0.95           # fundação de tudo
      trunk_based_development: 0.9    # reduz merge hell e batch size
      continuous_integration: 0.95    # detecta problemas cedo
      continuous_delivery: 0.9        # deployment frequency + lead time
      test_automation: 0.85           # qualidade + velocidade
      architecture_loosely_coupled: 0.9  # permite times autônomos
      deployment_automation: 0.9      # deployment frequency direta
      test_data_management: 0.7       # remove gargalo de testes
      shift_left_security: 0.75       # qualidade + compliance
      monitoring_observability: 0.85  # MTTR direto

    process:
      team_experimentation: 0.8       # cultura de aprendizado
      streamline_change_approval: 0.85  # reduz lead time
      customer_feedback: 0.75         # direciona trabalho valioso
      visibility_value_stream: 0.8    # identifica gargalos
      working_small_batches: 0.9      # deployment frequency + CFR
      wip_limits: 0.75                # fluxo e foco

    cultural:
      generative_culture_westrum: 0.9  # preditor forte de performance
      learning_culture: 0.85          # melhoria contínua
      collaboration_between_teams: 0.8  # reduz handoffs
      job_satisfaction: 0.8           # retenção e performance
      transformational_leadership: 0.85  # habilita mudança

  thresholds:
    capability_present: 0.7           # acima = capability está presente
    capability_weak: 0.4              # 0.4-0.7 = presente mas fraca
    capability_absent: 0.4            # abaixo = ausente ou ineficaz

  veto_conditions:
    - condition: "focusing_on_maturity_model"
      action: "VETO — Maturidade implica destino fixo. Foque em capabilities contínuas."
    - condition: "optimizing_single_capability"
      action: "ALERTA — Capabilities se reforçam mutuamente. Não otimize uma isoladamente."
    - condition: "measuring_capability_without_outcome"
      action: "VETO — Capability sem impacto nas 4 métricas DORA não é prioridade."
    - condition: "capability_as_one_time_project"
      action: "VETO — Capabilities requerem prática contínua, não 'conclusão'."
    - condition: "copying_best_practices_without_context"
      action: "VETO — Evidência de capability em contexto X não garante sucesso em contexto Y."

  decision_tree:
    - IF capability_present AND high_impact THEN maintain_and_improve
    - IF capability_weak AND high_impact THEN priority_investment
    - IF capability_absent AND high_impact THEN urgent_gap_to_address
    - IF capability_present AND low_impact THEN monitor_but_dont_over_invest
    - IF multiple_capabilities_absent THEN start_with_technical_foundation
    - IF cultural_capabilities_weak THEN leadership_intervention_needed
    - TERMINATION: capability_roadmap_with_impact_prediction

  output:
    type: "capability assessment + priority matrix"
    values: ["PRESENT", "WEAK", "ABSENT", "PRIORITY HIGH", "PRIORITY MEDIUM", "PRIORITY LOW"]
```

## Capability Assessment Matrix

```text
TECHNICAL CAPABILITIES (Fundação)

1. Version Control
   PRESENTE: Todo código em Git/VCS, branches protegidas, code review obrigatório
   FRACA: Código em VCS mas sem proteção, reviews opcionais
   AUSENTE: Código não versionado ou versões locais sem consolidação
   IMPACTO: 0.95 — sem version control, nada mais funciona

2. Trunk-based Development
   PRESENTE: Branches de curta duração (<24h), integração contínua no trunk
   FRACA: Feature branches que duram dias/semanas
   AUSENTE: GitFlow ou branches de longa duração que nunca integram
   IMPACTO: 0.9 — reduz merge hell, batch size e lead time

3. Continuous Integration (CI)
   PRESENTE: Build + testes automatizados a cada commit, feedback <10min
   FRACA: CI existe mas testes falham frequentemente ou demoram horas
   AUSENTE: Build manual ou CI que não bloqueia merge de código quebrado
   IMPACTO: 0.95 — detecta problemas cedo, fundação de CD

4. Continuous Delivery (CD)
   PRESENTE: Deploy automatizado, cada commit potencialmente deployável
   FRACA: Deploy automatizado mas requer aprovação manual sempre
   AUSENTE: Deploy manual ou deploy windows (ex: só sexta de madrugada)
   IMPACTO: 0.9 — impacta deployment frequency e lead time diretamente

5. Test Automation
   PRESENTE: >80% cobertura, testes unitários + integração + E2E automatizados
   FRACA: Testes automatizados existem mas <50% cobertura ou flaky
   AUSENTE: Testes predominantemente manuais ou sem testes
   IMPACTO: 0.85 — qualidade + velocidade + confiança para deploy

6. Architecture (Loosely Coupled)
   PRESENTE: Times podem deploy independentemente, poucas dependências cross-team
   FRACA: Arquitetura modular mas deploys requerem coordenação entre times
   AUSENTE: Monolito acoplado, mudança em um lugar quebra tudo
   IMPACTO: 0.9 — habilita autonomia de times e deployment frequency

7. Deployment Automation
   PRESENTE: One-click deploy (ou less), rollback automatizado
   FRACA: Deploy semi-automatizado, requer passos manuais
   AUSENTE: Deploy manual com runbook de 20 páginas
   IMPACTO: 0.9 — deployment frequency direta

8. Monitoring & Observability
   PRESENTE: Métricas, logs, traces, alertas proativos, dashboards em tempo real
   FRACA: Monitoramento básico, alertas reativos, dashboards desatualizados
   AUSENTE: Sem monitoramento ou logs não centralizados
   IMPACTO: 0.85 — MTTR diretamente afetado

PROCESS CAPABILITIES (Otimização de Fluxo)

9. Team Experimentation
   PRESENTE: Times têm autonomia para experimentar tecnologias/abordagens
   FRACA: Experimentação requer aprovação gerencial
   AUSENTE: Padronização rígida, zero espaço para experimentação
   IMPACTO: 0.8 — cultura de aprendizado e adaptação

10. Streamline Change Approval
    PRESENTE: Aprovações leves e automatizadas (ex: peer review)
    FRACA: Aprovações manuais mas rápidas (<1 dia)
    AUSENTE: CAB (Change Advisory Board) que se reúne mensalmente
    IMPACTO: 0.85 — reduz lead time drasticamente

11. Working in Small Batches
    PRESENTE: Features quebradas em pedaços deployáveis <1 dia de trabalho
    FRACA: Batches de 1-2 semanas
    AUSENTE: Releases trimestrais com centenas de mudanças
    IMPACTO: 0.9 — deployment frequency + change failure rate

CULTURAL CAPABILITIES (Ambiente)

12. Generative Culture (Westrum)
    PRESENTE: Falhas geram aprendizado, mensageiros são treinados, inovação incentivada
    FRACA: Cultura burocrática — processos acima de pessoas
    AUSENTE: Cultura patológica — culpa, medo, política
    IMPACTO: 0.9 — preditor mais forte de performance DORA

13. Learning Culture
    PRESENTE: Postmortems blameless, tempo dedicado a learning, compartilhamento ativo
    FRACA: Learning acontece mas não é sistemático
    AUSENTE: Sem tempo para aprender, mesmos erros repetidos
    IMPACTO: 0.85 — melhoria contínua depende disso

14. Job Satisfaction
    PRESENTE: Surveys positivos, baixa rotatividade, autonomia percebida
    FRACA: Satisfação neutra, rotatividade moderada
    AUSENTE: Alta rotatividade, burnout visível
    IMPACTO: 0.8 — correlação com performance e retenção
```

## Key Insight: Capabilities Se Reforçam Mutuamente

```text
A DESCOBERTA CRÍTICA:

  Capabilities não funcionam isoladamente.
  CI sem CD = código testado mas não deployado.
  CD sem test automation = deploy rápido de bugs.
  Test automation sem loosely coupled architecture = testes lentos e frágeis.

  Cultura generativa sem technical capabilities = boa intenção sem ferramentas.
  Technical capabilities sem cultura generativa = ferramentas sem adoção.

  O caminho: invista em capabilities que se reforçam.
```

## Application

**Input:** Dados da organização sobre práticas técnicas, processos e cultura.

**Process:**
1. Avalie cada capability nas 3 categorias (presente/fraca/ausente)
2. Identifique capabilities de alta prioridade (impacto >0.85) que estão fracas/ausentes
3. Mapeie dependências — algumas capabilities dependem de outras
4. Priorize capabilities técnicas primeiro (fundação)
5. Conecte capabilities à melhoria esperada nas 4 métricas DORA

## Examples

### Assessment: Startup Tech-Forward

- **CI:** PRESENTE (build + testes <5min)
- **CD:** PRESENTE (deploy on-demand)
- **Test Automation:** FRACA (60% cobertura, alguns flaky tests)
- **Monitoring:** FRACA (logs básicos, sem traces)
- **Prioridade:** Melhorar test automation (CFR) e observabilidade (MTTR)

### Assessment: Enterprise Tradicional

- **CI:** FRACA (build existe mas testes demoram 2h)
- **CD:** AUSENTE (deploy manual trimestral)
- **Change Approval:** AUSENTE (CAB mensal)
- **Generative Culture:** AUSENTE (cultura de culpa)
- **Prioridade:** 1) Streamline change approval, 2) Automatizar testes, 3) Cultura (requer leadership)

### Assessment: Scale-up em Transição

- **Trunk-based Dev:** FRACA (feature branches de 1-2 semanas)
- **Small Batches:** AUSENTE (releases mensais grandes)
- **Architecture:** FRACA (monolito modular mas acoplado)
- **Prioridade:** 1) Reduzir batch size, 2) Trunk-based dev, 3) Desacoplar arquitetura

## Diagnostic Questions

1. "Qual percentual do código está coberto por testes automatizados?"
2. "Quanto tempo do commit até produção? (lead time)"
3. "Vocês podem fazer deploy sem aprovar via comitê?"
4. "Quando algo quebra, vocês buscam culpados ou aprendizado?"
5. "Times podem escolher ferramentas ou tudo é padronizado centralmente?"

---

**Pattern Compliance:** NF-CORE-002 (Accelerate Capabilities Model) ✓
**Source:** NF Mind DNA - Accelerate Research Framework
