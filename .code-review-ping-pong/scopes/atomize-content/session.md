# Ping-Pong Session — Atomize Content Task

## Scope
- files:
  - squads/video-content-distillery/tasks/atomize-content.md
  - squads/conteudo/tasks/atomize-content.md

## Goals
- Clareza e completude das instruções para o agente executor
- Steps sem gaps ou ambiguidades (o que o agente faz em cada caso?)
- Inputs/outputs bem definidos com validações claras
- Checklist de qualidade (SVT) é aplicável e mensurável
- Integração clara com pipeline upstream (progressive-summarize) e downstream (curator)
- Gap analysis: o fluxo atomize → format-cut → ffmpeg-cutter tem handoff claro?
- Exemplos são realistas e úteis (não genéricos)
- Texto pt-BR com acentuação completa (Artigo VII)
- Sem contradições entre as duas versões (video-content-distillery vs conteudo)

## Constraints
- São task specs em markdown — instruções para agentes LLM, não código
- Foco: qualidade da especificação, não implementação
- Avaliar se as duas versões são duplicatas ou complementares
