Pipeline completo de criação de projeto: estrutura + epic + stories + validação.
Este comando orquestra vários agentes em sequência. Use quando quiser ir do zero ao "pronto para implementar".

**Para criar apenas a estrutura sem planejamento, use `/new-project`.**

---

## Fase 1: Criar estrutura do projeto

Execute `/new-project` normalmente (Passos 0-5).
Ao final, NÃO pergunte "quer começar a trabalhar?" — continue automaticamente para Fase 2.

Guarde as variáveis coletadas:
- `{nome}` — nome do projeto
- `{tipo}` — tipo escolhido
- `{descricao}` — descrição breve
- `{squad}` — squad informado
- `{path}` — project path

---

## Fase 2: Planejamento (condicionado ao tipo)

### Se tipo = `app` ou `squad` ou `pipeline`

Estes tipos precisam de planejamento formal (epic + stories).

**Passo 2.1: Criar Epic**

Ative o agente @pm e execute `*create-epic` passando contexto:
- Nome do projeto: `{nome}`
- Descrição: `{descricao}`
- Tipo: `{tipo}`
- Squad: `{squad}`

O @pm vai:
1. Fazer perguntas de escopo (requisitos, stakeholders, prioridades)
2. Gerar o PRD
3. Criar o epic com milestones

**IMPORTANTE:** Deixe o @pm conduzir a elicitação. NÃO invente requisitos.

**Passo 2.2: Criar Stories**

Após o epic estar pronto, ative o agente @sm e execute `*draft`:
- O @sm vai quebrar o epic em stories implementáveis
- Cada story terá: título, descrição, acceptance criteria, estimativa

**Passo 2.3: Validar Stories**

Após as stories estarem criadas, ative o agente @po e execute `*validate`:
- O @po aplica checklist de 10 pontos em cada story
- Stories que falharem voltam para @sm ajustar
- Ciclo continua até todas passarem

---

### Se tipo = `mind-clone`

Mind clones têm fluxo diferente — não precisam de epic formal.

**Passo 2.1: Coletar fontes**

Pergunte ao usuário:
1. Quem é o indivíduo a ser clonado?
2. Quais fontes estão disponíveis? (vídeos, podcasts, livros, textos, entrevistas)
3. Qual o objetivo do clone? (assistente, gerador de conteúdo, consultor)

Registre as respostas no INDEX.md do projeto (seção "Estado Atual").

**Passo 2.2: Sugerir squad**

Se squad = "nenhum ainda":
- Sugira: "Use o squad `mind-cloning` ou `squad-creator-pro` para o processo completo."

---

### Se tipo = `knowledge` ou `research`

Estes tipos são exploratórios — não precisam de stories.

**Passo 2.1: Definir escopo de pesquisa**

Pergunte ao usuário:
1. Quais são as perguntas principais da pesquisa?
2. Qual é a metodologia? (deep research, análise competitiva, estudo de mercado)
3. Quais fontes devem ser consultadas?

Registre as respostas no INDEX.md do projeto.

**Passo 2.2: Sugerir ferramentas**

Sugira conforme necessidade:
- Deep research → `/tech-search`
- Análise competitiva → `@analyst`
- Dados de mercado → MCP Exa/Apify

---

## Fase 3: Checkpoint e resumo

Após completar a Fase 2:

1. Atualize o INDEX.md com o estado atual (epic criado, stories validadas, etc.)
2. Mostre resumo final:

```
## Projeto: {nome} — Pipeline Completo ✅

**Estrutura:** docs/projects/{nome}/ criada
**ACTIVE.md:** Row #{número} adicionada
```

Para tipos `app`/`squad`/`pipeline`, adicione:
```
**Epic:** {nome do epic} criado em docs/stories/
**Stories:** {N} stories criadas e validadas
**Próximo passo:** `@dev` pode começar a implementar Story 1
```

Para tipos `mind-clone`/`knowledge`/`research`, adicione:
```
**Escopo:** Definido e registrado no INDEX.md
**Próximo passo:** {ação específica baseada no tipo}
```

3. Pergunte: "Quer começar a trabalhar no projeto agora?"
