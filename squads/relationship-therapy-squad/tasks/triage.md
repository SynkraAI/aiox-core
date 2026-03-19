---
task: Triagem de Especialista
responsavel: "@lead-therapist"
responsavel_type: agent
atomic_layer: task
elicit: false
Entrada: |
  - field: queixa
    description: Resumo da queixa do paciente
  - field: keywords
    description: Palavras-chave extraídas da queixa
Saida: |
  - field: especialista_primario
    description: ID do especialista principal recomendado
  - field: especialista_secundario
    description: ID do especialista de apoio (opcional)
  - field: justificativa
    description: Por que este especialista é o mais indicado
Checklist:
  - "[ ] Extrair palavras-chave da queixa"
  - "[ ] Consultar triage_matrix"
  - "[ ] Identificar especialista primário"
  - "[ ] Identificar especialista secundário se aplicável"
  - "[ ] Gerar justificativa clara"
---

# Triagem

Processo interno de mapeamento queixa → especialista.

## Matriz de Decisão

| Tema | Primário | Secundário |
|---|---|---|
| Conflito, brigas, comunicação destrutiva | @gottman | @rosenberg |
| Ansiedade no relacionamento, apego, medo de abandono | @amir-levine | @sue-johnson |
| Desconexão emocional, solidão no relacionamento | @sue-johnson | @brene-brown |
| Desejo, paixão, infidelidade, erotismo | @esther-perel | @emily-nagoski |
| Narcisismo, manipulação, gaslighting, abuso | @dr-ramani | @terry-real |
| Vergonha, vulnerabilidade, medo de se abrir | @brene-brown | @sue-johnson |
| Ansiedade, pânico, trauma, sistema nervoso | @deb-dana | @brene-brown |
| Desejo sexual, libido, prazer | @emily-nagoski | @esther-perel |
| Homem fechado, masculinidade, raiva passiva | @terry-real | @gottman |
| Como falar sobre necessidades, pedidos | @rosenberg | @gottman |

## Regras de Triagem

1. Se a queixa envolve **segurança física**, prioridade é @dr-ramani
2. Se a queixa envolve **trauma ativo**, prioridade é @deb-dana
3. Se há **múltiplos temas**, iniciar pelo mais urgente emocionalmente
4. Se o paciente **já sabe** qual especialista quer, respeitar
5. Se a queixa é **vaga**, fazer perguntas clarificadoras antes de triar
