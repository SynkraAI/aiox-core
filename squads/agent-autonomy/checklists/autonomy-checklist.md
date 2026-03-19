# Autonomy Checklist

Checklist de validação de autonomia para agentes. Usar após auditoria ou criação.

## Planning (Peso: 0.35)

- [ ] **P1 — Task Decomposition**: Agente consegue quebrar tarefas complexas em sub-tarefas?
- [ ] **P2 — Self-Reflection**: Agente avalia sua própria performance e corrige erros?
- [ ] **P3 — Goal Persistence**: Agente mantém foco no objetivo ao longo de múltiplos steps?

## Memory (Peso: 0.30)

- [ ] **M1 — Working Memory**: Agente gerencia eficientemente o context window?
- [ ] **M2 — Long-Term Memory**: Agente persiste aprendizados entre sessões?
- [ ] **M3 — Cross-Agent Memory**: Agente preserva contexto em handoffs?

## Tool Use (Peso: 0.35)

- [ ] **T1 — Tool Coverage**: Agente tem tools suficientes para suas tarefas?
- [ ] **T2 — Tool Quality (ACI)**: Tools seguem os 5 princípios ACI?
- [ ] **T3 — Error Recovery**: Agente lida com falhas de tools graciosamente?

## Failure Modes

- [ ] **FM-1**: Sem context saturation (quality não degrada ao longo da conversa)
- [ ] **FM-2**: Sem tool brittleness (retry rate baixo, tool selection precisa)
- [ ] **FM-3**: Sem reasoning drift (steps relevantes, sem tangentes)
- [ ] **FM-4**: Sem evaluator absence (agente sabe quando completou)

## Autonomia Geral

- [ ] Agente completa 80%+ das tasks sem intervenção humana
- [ ] Det vs prob claramente separados (LLM decide, código executa)
- [ ] Halt condition definida (max steps + progress check)
- [ ] Escalation criteria definidos (quando pedir ajuda vs insistir)
- [ ] Security check: lethal trifecta score < 3

## Scoring

- **Items passed / 18 total**
- **Threshold**: >= 13/18 para L3+, >= 15/18 para L4+, >= 17/18 para L5

## Actions on Fail

| Items falhados | Ação |
|---------------|------|
| P1-P3 | → reasoning-engineer (configurar reasoning pattern) |
| M1-M3 | → agent-architect (redesenhar memory strategy) |
| T1-T3 | → tool-smith (criar/melhorar tools) |
| FM-1 a FM-4 | → autonomy-auditor (diagnóstico detalhado) |
| Autonomia geral | → agent-architect (redesign completo) |
