Inicio de sessao ou usuario quer retomar trabalho. Execute os passos abaixo SEM carregar squads/skills:

**Argumento opcional:** O usuario pode passar o nome do projeto direto: `/resume {projeto}`
Se `$ARGUMENTS` estiver preenchido, use-o como nome do projeto e PULE para o Passo 2.

## Passo 1: Mostrar projetos ativos (pular se argumento fornecido)
- Leia `docs/projects/ACTIVE.md`
- Mostre todos os projetos ordenados por data da ultima sessao (mais recentes primeiro):

```
# | Projeto | Status | Agente/Squad | Ultima Sessao | Proximo Passo
```

- Use AskUserQuestion para o usuario escolher qual projeto retomar

## Passo 2: Carregar contexto do projeto
Apos o usuario escolher (ou usar o argumento fornecido):

1. Leia `docs/projects/{projeto}/INDEX.md`
2. Verifique se existe session file recente em `docs/projects/{projeto}/sessions/`
   - Se sim, leia o mais recente (por data no nome do arquivo)
   - Se nao, use apenas o INDEX.md
3. Se o session file lista "Arquivos para contexto", leia esses arquivos (max 5)

## Passo 3: Resumo de contexto
Apresente ao usuario de forma concisa:

```
## Projeto: {nome}
**Status:** {estado atual}
**Ultima sessao:** {data} — {o que foi feito}
**Agente/Squad:** {qual estava ativo}
**Decisoes ja tomadas:** {lista, para nao refazer}
**Proximo passo:** {acao exata}
```

## Passo 4: Aguardar confirmacao
- Pergunte: "Quer continuar com esse proximo passo, ou fazer algo diferente?"
- NAO execute nada sem confirmacao explicita do usuario
- Se o usuario quiser ativar um agente/squad, ai sim carregue o recurso necessario
