---
task: selfImprove()
responsavel: "KaizenChief"
responsavel_type: Agente
atomic_layer: Organism
Entrada:
  - nome: previous_reports
    tipo: object
    obrigatorio: true
  - nome: usage_data
    tipo: object
    obrigatorio: true
Saida:
  - nome: improvement_plan
    tipo: markdown
    obrigatorio: true
Checklist:
  - Coletar meta-dados (reports anteriores, usage, data health)
  - Diagnosticar eficacia em 4 dimensoes
  - Gerar plano de melhoria (max 3 por ciclo)
  - Auto-aplicar melhorias triviais
  - Reportar melhorias destrutivas para aprovacao humana
---

# Task: Self-Improvement (Meta-Análise)
# ID: KZ-TP-006
# Executor: kaizen-chief
# Trigger: *self-improve command ou weekly schedule

task:
  name: "Self-Improvement"
  status: ready
  responsible_executor: kaizen-chief
  execution_type: hybrid
  elicit: false

  description: |
    O Kaizen Squad analisa sua própria eficácia e aplica melhorias
    incrementais. Verifica quais recomendações foram implementadas, quais
    agentes estão subutilizados, e onde as heurísticas precisam de calibração.

  input:
    - "squads/kaizen/data/reports/ — relatórios anteriores"
    - "squads/kaizen/data/baselines/ — baseline atual"
    - "git log squads/kaizen/ — atividade do squad"
    - "squads/kaizen/CHANGELOG.md — histórico de mudanças"

  steps:
    - id: "1"
      name: "Rastrear recomendações anteriores"
      action: |
        1. Ler todos os relatórios em data/reports/
        2. Extrair recomendações de cada relatório
        3. Para cada: buscar evidência de implementação (git log, novos arquivos)
        4. Classificar: IMPLEMENTADA / IGNORADA / PARCIAL / PENDENTE

    - id: "2"
      name: "Analisar utilização dos agentes"
      action: |
        1. Verificar git log para ativações de cada agente
        2. Verificar quais comandos foram usados
        3. Identificar agentes nunca ativados → candidatos a remoção ou ajuste

    - id: "3"
      name: "Verificar saúde dos dados"
      action: |
        1. ecosystem-baseline.yaml: data da última atualização
        2. initial-radar.yaml: correspondência com realidade
        3. Heurísticas: alguma com threshold desatualizado?

    - id: "4"
      name: "Gerar plano de melhoria (max 3 itens)"
      action: |
        Para cada problema encontrado:
        - PROBLEMA com dados
        - AÇÃO específica (arquivo + mudança)
        - TIPO: CALIBRAR | TRIGGER | BASELINE | TEMPLATE | AGENTE
        - ESFORÇO: P/M/G
        Aplicar automaticamente se esforço P e não-destrutivo.
        Senão, reportar para aprovação.

    - id: "5"
      name: "Atualizar baseline"
      action: |
        Regenerar ecosystem-baseline.yaml com dados atuais:
        - Contar squads, agentes, tasks, workflows
        - Atualizar status de cada squad
        - Salvar com data atualizada

  output:
    format: "Self-Improvement Report"
    path: "data/reports/self-improve-{date}.md"

  acceptance_criteria:
    - "Todas as recomendações anteriores rastreadas"
    - "Utilização de cada agente verificada"
    - "Baseline atualizado com dados correntes"
    - "Max 3 melhorias propostas"
    - "Melhorias triviais auto-aplicadas com registro no CHANGELOG"
