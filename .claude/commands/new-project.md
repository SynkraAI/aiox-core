Usuário quer criar um novo projeto. Siga os passos abaixo:

## Passo 0: Validação prévia

1. Pergunte o **nome do projeto** (kebab-case, ex: `meu-saas-app`)
2. **VALIDAR nome:** deve corresponder ao padrão `^[a-z0-9]+(-[a-z0-9]+)*$`
   - Se inválido, mostre erro e peça novamente: "Nome inválido. Use apenas letras minúsculas, números e hífens (ex: meu-app-2)."
3. **Verificar se projeto já existe:**
   - Verificar se `docs/projects/{nome}/` já existe
   - Verificar se há row com mesmo nome em `docs/projects/ACTIVE.md`
   - Se existir: PARAR e mostrar "Projeto '{nome}' já existe. Veja `docs/projects/{nome}/INDEX.md` ou escolha outro nome."

## Passo 1: Coletar informações

Use AskUserQuestion para perguntar:

1. **Descrição breve** (1 linha — será gravada no INDEX.md)
2. **Tipo** — opções (VALIDAR contra esta lista, rejeitar qualquer outra):
   - `squad` | `app` | `mind-clone` | `pipeline` | `knowledge` | `research`
3. **Squad/skill principal** (ou "nenhum ainda")
4. **Status inicial** — opções (VALIDAR, normalizar para exato):
   - `Em andamento` → emoji 🔄
   - `Pausado` → emoji ⏸️

Se o tipo escolhido for `app` ou `squad`, faça uma pergunta adicional:

5. **Onde o código vai ficar?** — opções:
   - `aios-core/` (padrão — projeto vive dentro do monorepo)
   - `~/CODE/Projects/{nome}/` (app externo independente)
   - Caminho customizado (usuário digita)
     - VALIDAR: path deve ser absoluto (começar com `/` ou `~/`)
     - Verificar se diretório pai existe
     - Se pai não existir, perguntar: "Diretório pai não existe. Criar?"

Tipos `mind-clone`, `pipeline`, `knowledge` e `research` NÃO precisam dessa pergunta — o código (se houver) fica em `aios-core/`.

### Validar squad (se informado)

Se squad informado ≠ "nenhum ainda":
- Verificar se `squads/{squad}/` existe
- Se NÃO existir, listar squads disponíveis em `squads/` e perguntar:
  "Squad '{x}' não encontrado. Escolha: (1) usar mesmo assim, (2) escolher da lista, (3) 'nenhum ainda'"

## Passo 1.5: Scan automático de arquivos existentes

Antes de criar, busque no codebase por arquivos que já existam relacionados ao projeto:
1. Stories em `docs/stories/active/` e `docs/stories/completed/` que contenham o nome do projeto
2. Epics em `docs/stories/epics/` que contenham o nome do projeto
3. Squads em `squads/{squad}/` (se squad informado)
4. Scripts em `tools/` que contenham o nome do projeto

Se encontrar algo, mostre ao usuário: "Encontrados {N} arquivos existentes relacionados a este projeto" e liste-os.
Eles serão incluídos na seção "Arquivos Chave" do INDEX.md.

## Passo 2: Criar estrutura

Após respostas:

1. Crie `docs/projects/{nome}/` com subpastas:
   - `research/` — pesquisas e deep research
   - `data/` — dados do projeto
   - `sessions/` — session files de checkpoint/resume
2. Adicione `.gitkeep` em cada subpasta vazia
3. Se o destino do código for externo (`~/CODE/Projects/{nome}/` ou customizado):
   - Crie o diretório base com `mkdir -p`
   - Crie um `.claude/CLAUDE.md` de ponte dentro do projeto externo (ver Passo 2.5)

## Passo 2.5: Criar ponte CLAUDE.md para projetos externos

**APENAS se o projeto vive FORA de aios-core** (path externo).

Crie `{project-path}/.claude/CLAUDE.md` com este conteúdo:

```markdown
# CLAUDE.md — {Nome Legível}

## Projeto AIOX
Este projeto é gerenciado pelo framework AIOX. A governança (INDEX, stories, sessions) vive centralizada em aios-core.

- **Governança:** ~/aios-core/docs/projects/{nome}/INDEX.md
- **Stories ativas:** ~/aios-core/docs/stories/active/
- **Sessions:** ~/aios-core/docs/projects/{nome}/sessions/
- **ACTIVE.md:** ~/aios-core/docs/projects/ACTIVE.md
- **Framework:** ~/aios-core/

## Ao iniciar sessão neste diretório
1. Leia `~/aios-core/docs/projects/{nome}/INDEX.md` para contexto completo
2. Verifique se há session file recente em `~/aios-core/docs/projects/{nome}/sessions/`
3. Ou use: `cd ~/aios-core && /resume {nome}`

## Ao finalizar sessão
1. Use: `cd ~/aios-core && /checkpoint`
2. Ou salve estado manualmente em `~/aios-core/docs/projects/{nome}/sessions/`

## Convenções deste projeto
{A definir — preencha com stack, lint rules, etc. conforme o projeto evolui}
```

Isso permite que o Claude Code tenha contexto quando o working directory está no projeto externo.

## Passo 3: Gerar INDEX.md

Crie `docs/projects/{nome}/INDEX.md` seguindo este formato:

```markdown
# {Nome Legível} — Project Index

## Estado Atual
- **Tipo:** {tipo}
- **Descrição:** {descrição breve coletada no Passo 1}
- **Squad:** `{squad}` (ou "A definir")
- **Project Path:** {ver regras abaixo}
- **Status:** {status descritivo}
- **Bloqueadores:** Nenhum
```

Regras para o campo **Project Path** (SEMPRE incluir, nunca omitir):
- Se o projeto vive FORA de `aios-core/` → path absoluto (ex: `~/CODE/Projects/meu-app/`)
- Se o projeto vive DENTRO de `aios-core/` → path relativo à raiz (ex: `squads/meu-squad/`, `packages/meu-pkg/`)
- Se o projeto não tem código (tipo: mind-clone, research, knowledge) → `docs/projects/{nome}/`

Restante do INDEX.md:

```markdown
## Última Sessão
- **Data:** {data de hoje}
- **Agente/Squad:** {squad informado ou "Nenhum"}
- **O que foi feito:**
  1. Projeto criado

## Próximo Passo
- A definir — aguardar primeira sessão de trabalho

## Squads Relacionados
- `{squad}` — {descrição breve do squad, lida do README.md se existir}

## Arquivos Chave
| Arquivo | Conteúdo |
|---------|---------|
| INDEX.md | Este arquivo |
{incluir arquivos encontrados no Passo 1.5, se houver}

## Human Checklist
{selecionar checklist baseado no tipo — ver seção abaixo}

## Histórico
| Data | Ação |
|------|------|
| {data de hoje} | Projeto criado |
```

### Seleção de Human Checklist por tipo

Leia `squads/navigator/data/human-checklist-templates.md` e selecione a seção correspondente ao tipo do projeto:
- `app` → seção "Type: app"
- `squad` → seção "Type: squad"
- `mind-clone` → seção "Type: mind-clone"
- `pipeline` → seção "Type: pipeline"
- `knowledge` → seção "Type: knowledge"
- `research` → usar "Type: knowledge" como fallback

Copie o conteúdo markdown da seção selecionada para dentro do INDEX.md.
Se o arquivo `human-checklist-templates.md` não existir, usar checklist mínimo:
```
### A cada sessão
- [ ] `/checkpoint` — Salvar estado antes de sair
```

### Squads no INDEX.md

Se o usuário informou um squad que existe em `squads/`:
- Ler `squads/{squad}/README.md` para extrair descrição real
- Usar na seção "Squads Relacionados"

Se squad não existe ou é "nenhum ainda":
- Omitir seção "Squads Relacionados" ou usar "A definir"

## Passo 4: Atualizar ACTIVE.md

1. Verificar se `docs/projects/ACTIVE.md` existe
2. Se NÃO existir, criar com header padrão:
   ```
   # Projetos Ativos

   | # | Projeto | Status | Agente/Squad | Última Sessão | Próximo Passo |
   |---|---------|--------|-------------|---------------|---------------|
   ```
3. Ler arquivo (agora garantido que existe)
4. Verificar se projeto já está na tabela (NÃO deveria, pois Passo 0 bloqueou)
5. Calcular próximo número sequencial: `max(números existentes) + 1`
6. Adicionar nova row com emoji de status (🔄 ou ⏸️)
7. Formatar igual às rows existentes

## Passo 5: Confirmar e sugerir próximo passo

Mostre ao usuário:
- Estrutura criada:
  ```
  docs/projects/{nome}/
  ├── INDEX.md
  ├── research/
  │   └── .gitkeep
  ├── data/
  │   └── .gitkeep
  └── sessions/
      └── .gitkeep
  ```
- Path do INDEX.md
- Row adicionada no ACTIVE.md (#{número})

### Sugestão inteligente por tipo

Baseado no tipo do projeto, sugira o próximo passo concreto:

| Tipo | Sugestão |
|------|----------|
| `app` | "Próximo passo: `@pm *create-epic` para definir escopo e criar PRD, ou `/new-project-full` para o pipeline completo." |
| `squad` | "Próximo passo: Criar `squads/{nome}/README.md` com escopo do squad, depois `@sm *draft` para primeira story." |
| `mind-clone` | "Próximo passo: Coletar fontes do indivíduo (vídeos, textos, entrevistas). Use `@analyst` para research." |
| `pipeline` | "Próximo passo: Mapear steps do pipeline (inputs → processamento → outputs). Use `@architect` para design." |
| `knowledge` | "Próximo passo: Organizar fontes e definir estrutura da knowledge base. Use `@analyst` para research." |
| `research` | "Próximo passo: Definir perguntas de pesquisa e metodologia. Use `/tech-search` para deep research." |

Se o tipo for `app` e o destino for externo (`~/CODE/Projects/` ou customizado):
- Adicione: "Quer iniciar o scaffold com app-builder?"

Ao final, sempre pergunte: "Quer executar o próximo passo sugerido agora?"
