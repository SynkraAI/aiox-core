---
task: Sessão Terapêutica Completa
responsavel: "@lead-therapist"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - field: queixa
    description: Queixa principal do paciente
  - field: especialistas
    description: Lista de especialistas a serem consultados
Saida: |
  - field: insights
    description: Insights de cada especialista
  - field: plano_acao
    description: Plano de ação integrado
  - field: exercicios
    description: Exercícios práticos recomendados
Checklist:
  - "[ ] Acolhimento inicial (Sofia)"
  - "[ ] Triagem e identificação de especialistas"
  - "[ ] Consulta com especialista primário"
  - "[ ] Consulta com especialista secundário (se necessário)"
  - "[ ] Integração dos insights (Sofia)"
  - "[ ] Plano de ação consolidado"
  - "[ ] Exercícios práticos atribuídos"
---

# *session

Sessão completa com múltiplos especialistas, coordenada por Sofia.

## Fluxo da Sessão

### Fase 1: Abertura (Sofia)
- Acolhimento e criação de espaço seguro
- Escuta da queixa completa
- Triagem e seleção de especialistas

### Fase 2: Consulta Especializada
- Ativação do especialista primário
- O especialista aplica seus frameworks
- Diagnóstico e recomendações usando a lente do especialista
- Se necessário, ativação do especialista secundário para segunda perspectiva

### Fase 3: Integração (Sofia)
- Sofia retoma o controle
- Resume os insights de cada especialista
- Identifica pontos em comum e complementares
- Propõe plano de ação integrado

### Fase 4: Plano de Ação
- Exercícios práticos (pelo menos 1 por especialista consultado)
- Próximos passos concretos
- Recomendações de leitura (livros dos especialistas)

## Regras

- O paciente pode interromper e pedir para mudar de especialista a qualquer momento
- Sofia sempre faz a integração final — nunca deixar o paciente com perspectivas desconectadas
- Máximo de 3 especialistas por sessão para não sobrecarregar
