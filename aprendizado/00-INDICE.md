# Aprendizado AIOS - Indice Geral

## Status do Projeto
- **Data de inicio**: 30 de janeiro de 2026
- **Localizacao do projeto**: /home/feliperosa/AIOS-MASTER
- **Plataforma**: WSL2 Ubuntu 24.04
- **IDE principal**: Claude Code
- **Versao AIOS**: Core v2.1 / CLI v4.4.0

## Onde Paramos
- Estudamos 100% da documentacao do AIOS no GitHub
- Mapeamos a estrutura real do projeto (diferente da documentacao)
- Resolvemos o problema dos slash commands (symlinks criados)
- Criamos o curso completo de 22 partes
- Criamos Design System Squad completa (12 agentes, 4 workflows, score 8.20/10)
- Instalamos CodeRabbit CLI v0.3.5 com auth OK (fefsbenson/GitHub)
- CodeRabbit review BLOQUEADO por problema server-side (WebSocket 1006) — precisa onboarding em app.coderabbit.ai
- 4 de 5 quality gates funcionam (lint, test, typecheck, build)
- Proximo passo: resolver onboarding CodeRabbit no dashboard + avancar desenvolvimento

## Arquivos nesta pasta

| Arquivo | Conteudo |
|---------|----------|
| 00-INDICE.md | Este arquivo - mapa geral |
| 01-CONTEXTO-GERAL.md | O que e o AIOS, filosofia, inovacoes |
| 02-ESTRUTURA-REAL-DO-PROJETO.md | Estrutura de pastas REAL (nao a da doc) |
| 03-PROBLEMA-SLASH-COMMANDS.md | Problema encontrado e como foi resolvido |
| 04-CURSO-COMPLETO-PARTES-1-A-5.md | Partes 1 a 5 do curso |
| 05-CURSO-PARTE-6-ATUALIZADA.md | Parte 6 com os 3 novos passos |
| 06-CURSO-PARTES-7-A-14.md | Partes 7 a 14 do curso |
| 07-CURSO-PARTES-15-A-22.md | Partes 15 a 22 do curso |
| 08-DIFERENCAS-DOC-VS-REALIDADE.md | Tudo que a documentacao diz errado |
| 09-DECISOES-E-PREFERENCIAS.md | Decisoes tomadas pelo usuario |
| 10-PROXIMOS-PASSOS.md | O que falta fazer |
| 11-CRIACAO-DE-AGENTES.md | Como criar agentes: caminhos, estrutura, elicitacao, templates, squads |
| 12-PASSO-A-PASSO-CRIACAO-SQUAD.md | Fluxo completo: design -> create -> validate -> symlink -> usar |
| 13-CONTINUIDADE-ENTRE-SESSOES.md | Handoff, memoria, como retomar apos /clear |
| 14-HANDOFF-AUTOMATIZADO.md | Solucao: /handoff command + regras agressivas no CLAUDE.md |
| 15-USO-COMPLETO-DE-SQUADS.md | Guia completo: ativacao, comandos, symlinks, casos de uso, tabela resumo |
| 16-WORKFLOWS-COMO-FUNCIONAM.md | Workflows: estrutura YAML, 6 pre-definidos, como criar, squad vs AIOS, auto-detection |
| 17-GAPS-WORKFLOWS.md | 3 gaps identificados: targeting core/squad, validacao, automacao |
| 18-GAPS-WORKFLOWS-CORRIGIDOS.md | Correcoes aplicadas: 5 criados, 9 modificados, 3 novos comandos |
| 19-O-QUE-E-PULL-REQUEST.md | Conceito de PR, fluxo visual, passos praticos |
| 20-FLUXO-PR-PARA-SYNKRA.md | Setup do fork, fluxo de PR em 6 passos, comando /pr-synkra |
| 21-COMANDO-PR-SYNKRA.md | Slash command /pr-synkra: 7 passos automatizados, regras, como usar |
| 22-PR-SYNKRA-V2-QUALITY-GATES.md | /pr-synkra atualizado: 5 fases com analise de docs e quality gates |
| 23-GUIA-DEFINITIVO-WORKFLOWS.md | **GUIA DEFINITIVO** de workflows: supersede 16/17/18. Arquitetura, 7 workflows, 3 contextos (core/squad/hybrid), comandos, estado, validacao, patterns, exemplos praticos. Inclui GAP 1-4 |
| 24-CRIACAO-WORKFLOW-PARA-SQUAD.md | **PASSO A PASSO** criar workflow para squad: 3 fases (aios-master cria YAML, handoff, squad-creator registra nos agentes). Erros a evitar, checklist, fluxo visual, exemplo real pedro-full-validation |
| 25-ORQUESTRACAO-VS-HUMANO-VERDADE-SOBRE-AGENTES.md | **VERDADE FUNDAMENTAL**: Como agentes sao executados — persona-switching (orquestrador) vs ativacao direta (humano). Contaminacao de contexto, diluicao de persona, vies de confirmacao. Comparacao orquestrador vs humano. Caminho ideal: spawn real via Task tool. Gap arquitetural documentado |
| 26-RUNTIME-ENGINE-WORKFLOWS.md | **RUNTIME ENGINE**: Implementacao do spawn real de agentes via Task tool. Como usar `--mode=engine`, fluxo interno, elicitation pre-coletada, decision routing, tradeoffs guided vs engine, exemplo pratico com pedro-full-validation |
| 27-ORQUESTRACAO-AGENTES-PROBLEMA-E-SOLUCAO.md | **GUIA CONCEITUAL UNIVERSAL**: Consolida 25+26 em documento unico sem especificidades de squad/agente. Parte 1: o problema (persona-switching, contaminacao, vies, 3 formas de executar). Parte 2: a solucao (Runtime Engine, spawn real, decision routing, tradeoffs, exemplo pratico) |
| 28-CURSO-SQUAD-CREATOR.md | Curso Squad Creator v1.2.0: arquitetura, frameworks, hierarquia |
| 29-GESTAO-MULTIPLOS-PROJETOS-AIOS.md | **GESTAO MULTI-PROJETO**: Um AIOS por projeto (isolado) + repo pessoal de configs + sync.sh. Opcoes avaliadas, arquitetura recomendada, o que salvar vs nao salvar, script de sincronizacao, fluxo completo, regras criticas |
| 30-CRIACAO-DESIGN-SQUAD-COMPLETA.md | **CASE STUDY COMPLETO**: Criacao da Design System Squad do zero ao producao. 8 fases, 8 sessoes, 147 arquivos, 12 agentes (11 mind clones + orchestrator), 4 workflows, score 8.20/10. Pesquisa de 20→11 mentes, criacao paralela, validacao 4-tier, workflow registration. Padroes extraidos para futuras squads expert. Decisoes arquiteturais: design-chief coordena vs @aios-master executa (engine mode), 4-tier activation order, orchestrator funcional (nao clone), 8-field task format |
| 31-INSTALACAO-CODERABBIT-CLI-COMPLETA.md | **INSTALACAO END-TO-END**: Sessao completa 2026-02-04. Explicacao sistema AIOS + diagrama ASCII greenfield. Ativacao 4 agentes (@aios-master, @squad-architect, @devops, @aios-mentor). Instalacao CodeRabbit CLI v0.3.5 no WSL (libsecret, gnome-keyring, expect para OAuth). Auth OK (fefsbenson/GitHub). Review BLOQUEADO por WebSocket 1006 (server-side, precisa onboarding em app.coderabbit.ai). 4/5 quality gates funcionam. Self-healing @dev inativo ate resolver. Analise estrategica @aios-mentor: Pareto ao Cubo — eliminar debug do servidor, automatizar check, amplificar gates que funcionam. Dependencias instaladas: libsecret, gnome-keyring, expect. .bashrc configurado com dbus-launch |
| 32-ANATOMIA-AGENTE-100-PORCENTO-REPLICAVEL.md | **METODOLOGIA/BOAS PRATICAS**: Autoanalise do agente Pedro Valerio aplicando seus frameworks nele mesmo. 3 niveis de maturidade de agente (Persona → Frameworks → Completo). Os 9 componentes obrigatorios (Identity, Thinking DNA, Voice DNA, Output Examples, Command Loader, Tasks, Templates, Checklists, Data Files). Anatomia de task file com veto conditions. Command loader como peca-chave para determinismo. Formula de score de maturidade (0-10). Checklist pre-publicacao blocking/non-blocking. Pedro Valerio Test: "Se eu der pra outra LLM, ela executa igual?". Complementa aprendizado 11 (COMO criar) com O QUE FAZ ser replicavel |

## Como usar este material
Na proxima sessao do Claude Code, diga:
"Leia a pasta aprendizado/ e retome de onde paramos"
