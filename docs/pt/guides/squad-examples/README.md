<!-- Traducao: PT-BR | Original: /docs/en/guides/squad-examples/README.md | Sincronizacao: 2026-01-26 -->

# Exemplos de Squads

Este diretorio contem exemplos de configuracoes de Squads para ajudar voce a comecar.

## Exemplos Disponiveis

### 1. Agente Simples (`simple-agent.yaml`)

Um exemplo minimo de agente focado em tarefas de documentacao. Otimo ponto de partida para:

- Entender a estrutura de agentes
- Aprender definicoes de comandos
- Padroes basicos de prompts de sistema

### 2. Squad Processador de Dados (`data-processor-squad.yaml`)

Um manifesto completo de squad mostrando:

- Multiplos agentes trabalhando juntos
- Definicoes de tarefas com dependencias
- Orquestracao de workflows
- Dependencias externas npm
- Opcoes de configuracao

## Usando Estes Exemplos

### Copiar e Personalizar

```bash
# Copiar um exemplo para iniciar seu squad
cp docs/guides/squad-examples/simple-agent.yaml my-squad/agents/my-agent.yaml

# Editar para atender suas necessidades
code my-squad/agents/my-agent.yaml
```

### Aprender Lendo

Cada exemplo inclui comentarios explicando:

- Por que certos padroes sao usados
- Boas praticas sendo demonstradas
- Pontos comuns de personalizacao

## Criando o Seu Proprio

1. Comece com o [Template de Squad](../../../../templates/squad/)
2. Use estes exemplos como referencia para padroes
3. Siga o [Guia de Squads](../squads-guide.md)

## Contribuindo com Exemplos

Tem um padrao de squad util? Aceitamos contribuicoes!

1. Crie seu exemplo neste diretorio
2. Adicione comentarios claros explicando o padrao
3. Atualize este README com a descricao
4. Envie um PR seguindo o [CONTRIBUTING.md](../../../../CONTRIBUTING.md)

---

_AIOX Squads: Equipes de agentes de IA trabalhando com voce_
