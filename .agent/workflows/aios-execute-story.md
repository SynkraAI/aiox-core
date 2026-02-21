---
description: [AIOS] Executar uma História de Desenvolvimento (Story) com o Agente Dev
---
# AIOS: Execution Engine Workflow

Este workflow de alto nível serve para guiar o Antigravity na execução profunda (Execution Engine) de histórias criadas pelos agentes de planejamento do AIOS Core. O foco é contexto, validação e execução cirúrgica.

## Processo Autônomo (The Engine)

1. **Assimilação de Contexto**: Identifique o arquivo da História de Desenvolvimento (`.aios/stories/` ou requisitado). Analise o status e qual tarefa deve ser iniciada.
// turbo
2. **Ativação Dev**: Leia `.aios-core/rules.md` para assumir o perfil de engenheiro primário da Story.
3. **Mapeamento Prévio da Base**: Use buscas via grep e listagens para auditar a saúde da arquitetura que você irá tocar na Tarefa (Subtask) atual. Garanta que a sua compreensão abrange o fluxo `Controller -> Service -> Repo` (ou equivalente).
4. **Execução Subtask**: Crie ou modifique rigorosamente os arquivos baseando-se nas specs. Submeta pacotes pequenos e lógicos.
5. **Autocorreção (Self-Critique)**: Analise os diffs ou saídas de linter e verifique se as premissas da Spec foram atendidas ou se algo quebrou silenciosamente.
// turbo
6. **Handoff (Evolução)**: Como dev AIOS, atualize os checkboxes da sua Subtask no `.md` com `[x]`. Informe o usuário do sucesso e, se a story fechou inteira, mude o status principal da spec e notifique-o que o QA (`aios-qa-review`) deve agir em seguida.
