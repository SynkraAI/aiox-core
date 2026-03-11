Contexto acabando ou usuário pediu checkpoint. Execute TODOS os passos abaixo SEM carregar squads/skills:

## Passo 0: Mudanças não commitadas

- Rode `git diff --stat` via Bash
- Se comando falhar (repo corrompido, sem git), continue com aviso: "⚠️ Git status indisponível — pulando verificação de mudanças."
- Se houver mudanças não commitadas:
  - **Se o agente atual é @dev:** pergunte "Quer fazer commit ou stash antes do checkpoint?"
    - Se sim, faça commit com mensagem `chore: checkpoint session` ou `git stash`
  - **Se o agente atual NÃO é @dev:** apenas registre os arquivos modificados no session file
    - Mostre: "⚠️ Existem mudanças não commitadas. Apenas @dev pode fazer commits. Registrando no session file..."

## Passo 1: Identificar projeto ativo

- Rode `git log --oneline -5` via Bash
- Analise o contexto da conversa para identificar o projeto ativo
- Se trabalhou em mais de 1 projeto, pergunte qual é o foco principal
- **VALIDAR:** Verificar se `docs/projects/{projeto}/` existe
  - Se NÃO existir: pergunte "Projeto '{projeto}' não encontrado em docs/projects/. Quer criar com `/new-project`?"
  - **NUNCA** criar INDEX.md avulso sem a estrutura completa do `/new-project`

## Passo 2: Atualizar INDEX.md do projeto

- Leia `docs/projects/{projeto}/INDEX.md`
- Se INDEX.md NÃO existir: PARAR e orientar "INDEX.md ausente. Rode `/new-project {projeto}` primeiro para criar a estrutura correta."
- Extraia o campo **Project Path** (se existir) — será usado no Passo 4
- Atualize as seções:
  - **Estado Atual**: reflita o estado real agora
  - **Última Sessão**: data/hora agora, agente/squad usado, o que foi feito (detalhado)
  - **Próximo Passo**: ação concreta para retomar
  - **Histórico**: adicione 1 linha com data e resumo

## Passo 3: Atualizar ACTIVE.md

- Leia `docs/projects/ACTIVE.md`
- Se NÃO existir, criar com header padrão:
  ```
  # Projetos Ativos

  | # | Projeto | Status | Agente/Squad | Última Sessão | Próximo Passo |
  |---|---------|--------|-------------|---------------|---------------|
  ```
- Atualize a row do projeto: status, agente/squad, última sessão, próximo passo
- Se o projeto não está na tabela, adicione uma nova row (calcular `max(#) + 1`)

## Passo 4: Salvar session file

**Naming:** `YYYY-MM-DD-{seq}.md` onde `{seq}` é um sufixo sequencial:
- Verificar se já existe `docs/projects/{projeto}/sessions/YYYY-MM-DD*.md`
- Se não existir nenhum: usar `YYYY-MM-DD.md` (sem sufixo)
- Se já existir: usar `YYYY-MM-DD-02.md`, `YYYY-MM-DD-03.md`, etc.

Criar o session file com:

```markdown
# Session {data}

## Projeto
- **Nome:** {nome do projeto}
- **INDEX.md:** `docs/projects/{projeto}/INDEX.md`
```

Se o projeto tem **Project Path** externo (extraído no Passo 2), adicione:

```markdown
## Working Directory
- **Path:** `{project path}`
- Arquivos do projeto real vivem neste diretório, fora de aios-core.
```

Restante do session file:

```markdown
## O que foi feito
{descrição detalhada com contexto suficiente para retomar}

## Agente/Squad em uso
{agente ou squad ativo nesta sessão}

## Arquivos para contexto (próximo Claude DEVE ler)
- `{arquivo 1}`
- `{arquivo 2}`
- `{arquivo 3}`
```

**IMPORTANTE:** Liste no máximo 5 arquivos essenciais. O `/resume` lerá até 5.

Se o projeto tem Project Path externo, use paths absolutos para arquivos fora de aios-core.

```markdown
## Decisões tomadas
- {decisão 1 — para não refazer}
- {decisão 2}

## Próximo passo exato
{comando ou ação específica}

## Arquivos modificados não commitados
{lista ou "Nenhum — tudo commitado"}
```

## Passo 5: Health check rápido dos instruction files

- Conte as linhas de: `~/.claude/CLAUDE.md`, `.claude/CLAUDE.md`, MEMORY.md do projeto
- Conte as linhas dos rules em `.claude/rules/` que NÃO têm frontmatter com campo `paths:`
- Some tudo = **total always-loaded**
- Se total > 500 linhas, mostre WARNING:

```
⚠️ Instruction files cresceram: {total} linhas (limite: 500)
   Rode `/audit-instructions` para diagnóstico completo.
```

- Se total <= 500, mostre apenas: `Instructions: {total}/500 linhas — OK`

## Passo 6: Confirmação

Mostre ao usuário:
- ✅/❌ INDEX.md atualizado
- ✅/❌ ACTIVE.md atualizado
- ✅/❌ Session file salvo em `docs/projects/{projeto}/sessions/{nome-arquivo}.md`
- Instructions health: {total}/500

Ao final, SEMPRE mostre a dica de retomada:

```
Para retomar este projeto na próxima sessão, digite:
/resume {projeto}
```

Onde `{projeto}` é o nome exato da pasta em `docs/projects/`.
