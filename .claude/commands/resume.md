Início de sessão ou usuário quer retomar trabalho. Execute os passos abaixo SEM carregar squads/skills:

**Argumento opcional:** O usuário pode passar o nome do projeto direto: `/resume {projeto}`
Se `$ARGUMENTS` estiver preenchido, use-o como nome do projeto e PULE para o Passo 2.
- **VALIDAR argumento:** Verificar se `docs/projects/{argumento}/` existe
  - Se NÃO existir: mostrar "Projeto '{argumento}' não encontrado." e cair no Passo 1 (listar projetos)

## Passo 1: Mostrar projetos ativos (pular se argumento válido fornecido)

- Leia `docs/projects/ACTIVE.md`
- Se ACTIVE.md não existir ou estiver vazio: mostrar "Nenhum projeto ativo encontrado. Use `/new-project` para criar um." e PARAR
- Mostre todos os projetos ordenados por data da última sessão (mais recentes primeiro):

```
# | Projeto | Status | Agente/Squad | Última Sessão | Próximo Passo
```

- Use AskUserQuestion para o usuário escolher qual projeto retomar

## Passo 2: Carregar contexto do projeto

Após o usuário escolher (ou usar o argumento fornecido):

1. Leia `docs/projects/{projeto}/INDEX.md`
   - Se não existir: mostrar "INDEX.md ausente para '{projeto}'. Rode `/new-project` para criar a estrutura." e PARAR
2. Extraia o campo **Project Path** (se existir) — será usado no Passo 3
3. Verifique se existe session file recente em `docs/projects/{projeto}/sessions/`
   - Se sim, leia o mais recente (por data no nome do arquivo, considerar sufixos `-02`, `-03`)
   - Se falhar ao ler (arquivo corrompido/truncado): avisar "⚠️ Session file corrompido, usando apenas INDEX.md" e continuar
   - Se não houver session files, use apenas o INDEX.md
4. Se o session file lista "Arquivos para contexto", leia esses arquivos (máximo 5 primeiros)
   - Se algum arquivo não existir mais: pular e avisar "⚠️ Arquivo {path} não encontrado (pode ter sido deletado)"
   - Se houver mais de 5 listados: ler apenas os 5 primeiros e avisar "Listados mais de 5 arquivos, lendo os 5 primeiros."

## Passo 3: Resumo de contexto

Apresente ao usuário de forma concisa:

```
## Projeto: {nome}
**Tipo:** {tipo, se disponível no INDEX.md}
**Status:** {estado atual}
**Última sessão:** {data} — {o que foi feito}
**Agente/Squad:** {qual estava ativo}
**Decisões já tomadas:** {lista, para não refazer}
**Próximo passo:** {ação exata}
```

Se o projeto tem **Project Path** externo (extraído no Passo 2), adicione:

```
**Working Directory:** `{project path}`
⚠️ O código deste projeto vive fora de aios-core. Considere trocar o working directory para trabalhar nele.
```

Adicione informação de git se disponível:

```
**Git:** branch `{branch atual}` — {N arquivos modificados, ou "limpo"}
**Última atividade:** há {X dias/horas desde a última sessão}
```

Se última sessão foi há mais de 7 dias, adicione: "⚠️ Contexto pode estar desatualizado — revise antes de continuar."

## Passo 4: Aguardar confirmação

- Pergunte: "Quer continuar com esse próximo passo, ou fazer algo diferente?"
- NÃO execute nada sem confirmação explícita do usuário
- Se o usuário quiser ativar um agente/squad, aí sim carregue o recurso necessário
