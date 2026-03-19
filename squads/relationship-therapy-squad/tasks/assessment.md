---
task: Avaliação Relacional
responsavel: "@lead-therapist"
responsavel_type: agent
atomic_layer: task
elicit: true
Entrada: |
  - field: relato
    description: Relato detalhado da situação relacional
Saida: |
  - field: diagnostico
    description: Análise multi-perspectiva da situação
  - field: areas_foco
    description: Áreas que precisam de atenção
  - field: recomendacoes
    description: Especialistas e abordagens recomendadas
Checklist:
  - "[ ] Coletar relato completo"
  - "[ ] Analisar sob lente de apego (Amir Levine)"
  - "[ ] Analisar sob lente de comunicação (Gottman)"
  - "[ ] Analisar sob lente emocional (Sue Johnson)"
  - "[ ] Analisar sob lente de desejo (Esther Perel)"
  - "[ ] Verificar sinais de toxicidade (Dr. Ramani)"
  - "[ ] Consolidar diagnóstico multi-perspectiva"
  - "[ ] Priorizar áreas de foco"
---

# *assessment

Avaliação completa da situação relacional usando múltiplas lentes teóricas.

## Processo

1. **Coleta de Dados**
   - História do relacionamento
   - Padrões de comunicação
   - Dinâmica de conflito
   - Vida sexual e intimidade
   - Histórico familiar relevante
   - Tentativas anteriores de resolver

2. **Análise Multi-Lente**

   | Lente | Especialista | Pergunta-Chave |
   |---|---|---|
   | Apego | @amir-levine | Qual estilo de apego de cada parceiro? |
   | Comunicação | @gottman | Quais Cavaleiros estão presentes? |
   | Vínculo | @sue-johnson | Qual Diálogo Demoníaco domina? |
   | Desejo | @esther-perel | Como está a tensão segurança vs. aventura? |
   | Toxicidade | @dr-ramani | Há padrões narcísicos ou abusivos? |
   | Vulnerabilidade | @brene-brown | Há armadura emocional impedindo conexão? |
   | Sistema Nervoso | @deb-dana | Onde cada pessoa está na escada polivagal? |

3. **Diagnóstico Integrado**
   - Priorizar as 3 áreas mais urgentes
   - Sequenciar as intervenções (o que fazer primeiro)
   - Recomendar especialistas e exercícios

## Output

Relatório estruturado com:
- Situação atual (resumo)
- Padrões identificados (por lente)
- Áreas de foco prioritárias (1-3)
- Plano de ação recomendado
- Exercícios práticos imediatos
