# Agent Activation Checklist

# ID: KZ-QC-002
# Used by: kaizen-chief antes de delegar análise a qualquer agente

## Pré-Ativação (QG-KZ-ACT)

### Contexto do Agente

- [ ] Agente existe em `squads/kaizen/agents/`
- [ ] Agente tem persona completa (role, style, identity, focus)
- [ ] Agente tem frameworks operacionais documentados
- [ ] Agente tem heurísticas com IDs únicos (IN_XX_NNN)
- [ ] Agente tem anti-patterns definidos

### Dados de Entrada

- [ ] Inputs necessários para a task estão disponíveis
- [ ] Dados vêm de filesystem scans reais (não suposições)
- [ ] Período de análise está definido (semanal, mensal, sob demanda)
- [ ] Baseline anterior existe para comparação (se não for primeira execução)

### Routing Correto

- [ ] Request foi roteado ao agente correto via routing_table
- [ ] Agente tem o framework adequado para o tipo de análise
- [ ] Não há sobreposição com outro agente ativo na mesma dimensão
- [ ] Dependências entre tiers respeitadas (Tier 0 antes de Tier 1)

### Pós-Ativação

- [ ] Output segue o template designado
- [ ] Findings têm evidência documentada (RULE-RD-001)
- [ ] Action items são específicos e acionáveis
- [ ] Handoff para próximo agente/chief está definido

## Veto Conditions (Auto-Fail)

- Input baseado em suposições (sem scan real) → BLOQUEAR ativação
- Agente sem framework para o tipo de análise → REDIRECIONAR para agente correto
- Tier 1 ativado sem Tier 0 completo → BLOQUEAR até diagnóstico concluído
- Output sem evidência → REJEITAR e solicitar reexecução
