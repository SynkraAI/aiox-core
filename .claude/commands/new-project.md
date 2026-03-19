Usuário quer criar um novo projeto. Siga os passos abaixo:

## Passo 0: Validação prévia

1. Pergunte o **nome do projeto** (kebab-case, ex: `meu-saas-app`)
2. **VALIDAR nome:** deve corresponder ao padrão `^[a-z0-9]+(-[a-z0-9]+)*$`
   - Se inválido, mostre erro e peça novamente: "Nome inválido. Use apenas letras minúsculas, números e hífens (ex: meu-app-2)."
3. **Verificar se projeto já existe:**
   - Verificar se `docs/projects/{nome}/` já existe
   - Verificar se há row com mesmo nome em `docs/projects/ACTIVE.md`
   - Se existir: PARAR e mostrar "Projeto '{nome}' já existe. Veja `docs/projects/{nome}/INDEX.md` ou escolha outro nome."

## Passo 0.5: Pre-flight Validation (BLOQUEADOR)

**ANTES de coletar informações**, execute validação prévia do destino.

Após determinar o `{project-path}` (no Passo 1, quando souber o destino):

```bash
node ~/aios-core/tools/validate-structure.js --dry-run {project-path}
```

**O que valida:**
1. Diretório pai existe
2. Sem conflito de nomes (INDEX.md já existente)
3. Permissões de escrita OK
4. Path é absoluto (se HYBRID)

**Se FALHAR (exit code 1):**
- Mostrar output do dry-run
- Se falha for "Projeto já existe" (INDEX.md encontrado):
  - Perguntar: "Projeto já existe. Quer sobrescrever? (Y/N)"
  - Se **Y**: Executar `node ~/aios-core/tools/rollback-project.js {project-path}` para limpar, depois continuar
  - Se **N**: PARAR e sugerir usar outro nome ou rodar `/resume` para continuar projeto existente
- Se falha for outro erro (permissões, path, etc.): BLOQUEAR e pedir correção

**Se PASSAR (exit code 0):** Continuar para Passo 2.

**Nota:** Este passo é executado DEPOIS do Passo 1 (precisa saber o destino), mas ANTES de criar qualquer arquivo.

**Idempotência:** Rodar /new-project 2x no mesmo path é SEGURO. O dry-run detecta e pergunta se quer sobrescrever.

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

### Como escolher o modo? (Decision Tree)

Antes de perguntar "Onde o código vai ficar?", mostre este guia:

**CENTRALIZED (padrão, 72% dos projetos):**
- Squads AIOX (expansion packs)
- Mind clones (vão pro catalog)
- Pipelines que viram skills
- Knowledge bases reutilizáveis
- Research interna do framework

**HYBRID (externo, 28% dos projetos):**
- Apps SaaS independentes
- Apps cliente (entrega externa)
- Projetos com repositório Git próprio
- Open source futuro
- Protótipos que podem virar produtos

**Na dúvida?** Use CENTRALIZED. É mais fácil migrar pra fora depois do que pra dentro.

5. **Onde o código vai ficar?** — opções:
   - `aios-core/` (padrão — projeto vive dentro do monorepo)
   - `~/CODE/Projects/{nome}/` (app externo independente)
   - Caminho customizado (usuário digita)
     - VALIDAR: path deve ser absoluto (começar com `/` ou `~/`)
     - Verificar se diretório pai existe
     - Se pai não existir, perguntar: "Diretório pai não existe. Criar?"

Tipos `mind-clone`, `pipeline`, `knowledge` e `research` NÃO precisam dessa pergunta — o código (se houver) fica em `aios-core/`.

### Pergunta adicional: squad associado? (para tipo `app`)

Se tipo = `app`, perguntar:

6. **Este projeto tem um squad AIOX associado?** — opções:
   - Não (padrão)
   - Sim (informar nome do squad)

Se **SIM**, o projeto é tratado como **app+squad**:
- Merge de checklists: inclui items de `app` E `squad` no Human Checklist do INDEX.md
- Merge de permissões: `copy-project-config.js` copia settings.json de `app/` como base e adiciona permissões de `squad/` (Task tool para agents)
- Seção "Squads Relacionados" é preenchida automaticamente no INDEX.md

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

## Passo 2: Criar estrutura (bifurcação por modo)

### Se destino INTERNO (aios-core/) — modo CENTRALIZED

1. Crie `docs/projects/{nome}/` com subpastas:
   - `research/` — pesquisas e deep research
   - `data/` — dados do projeto
   - `sessions/` — session files de checkpoint/resume
   - `memory/` — memória persistente do projeto
   - `memory/feedback/` — feedback do usuário por tópico
2. Adicione `.gitkeep` em cada subpasta vazia
3. Crie `docs/projects/{nome}/memory/project-context.md` usando template (ver Passo 2.6)
4. Crie `docs/projects/{nome}/memory/agents-used.md` usando template (ver Passo 2.6)
5. Crie `docs/projects/{nome}/memory/squads-config.md` usando template (ver Passo 2.6)
6. `index_path` = `docs/projects/{nome}/INDEX.md`

### Se destino EXTERNO (fora de aios-core/) — modo HYBRID

1. Crie o diretório do projeto com `mkdir -p {project-path}`
2. Crie `.aios/` dentro do projeto com subpastas:
   - `.aios/sessions/` — session files de checkpoint/resume
   - `.aios/stories/active/` — stories ativas
   - `.aios/stories/completed/` — stories concluídas
   - `.aios/epics/` — epics do projeto
   - `.aios/memory/` — memória persistente do projeto
   - `.aios/memory/feedback/` — feedback do usuário por tópico
3. Adicione `.gitkeep` em cada subpasta vazia
3b. Crie memory files usando templates (ver Passo 2.6):
   - `.aios/memory/project-context.md`
   - `.aios/memory/agents-used.md`
   - `.aios/memory/squads-config.md`
4. **Criar symlinks de recursos globais:**
   ```bash
   # Skills globais
   cd {project-path}/.aios && ln -s ~/aios-core/.aios/skills skills

   # Commands globais (slash commands e squads)
   cd {project-path}/.claude && ln -s ~/aios-core/.claude/commands commands
   ```
   Isso permite que o projeto acesse automaticamente:
   - **45 skills globais** (kaizen, deep-research, tech-search, etc.)
   - **30+ slash commands** (/oalanicolas, /pedro-valerio, squads, etc.)
5. `index_path` = `{project-path}/.aios/INDEX.md`
6. **NÃO** criar `docs/projects/{nome}/` em aios-core (elimina duplicação)
7. Criar `.claude/CLAUDE.md` de ponte (ver Passo 2.5)

## Passo 2.5: Criar ponte CLAUDE.md para projetos externos

**APENAS se o projeto vive FORA de aios-core** (path externo).

Crie `{project-path}/.claude/CLAUDE.md` com este conteúdo:

```markdown
# CLAUDE.md — {Nome Legível}

## Projeto AIOX
Este projeto usa governança híbrida AIOX. INDEX, stories e sessions vivem localmente em `.aios/`.

## Governança
- **INDEX.md:** `.aios/INDEX.md` (governança local)
- **Stories ativas:** `.aios/stories/active/`
- **Sessions:** `.aios/sessions/`
- **Skills:** `.aios/skills` (symlink → `~/aios-core/.aios/skills` — acesso a todas as skills do framework)
- **ACTIVE.md:** `~/aios-core/docs/projects/ACTIVE.md` (registry central)
- **Framework:** `~/aios-core/`

## Ao iniciar sessão neste diretório
1. Leia `.aios/INDEX.md` para contexto completo
2. Verifique se há session file recente em `.aios/sessions/`
3. Ou use: `/resume {nome}`

## Ao finalizar sessão
1. Use: `/checkpoint` (detecta automaticamente modo HYBRID)
2. INDEX.md e session são salvos em `.aios/` local

## Estilo de comunicação
- **Tom:** explique como se fosse para um adolescente curioso de 15 anos. Inteligente, mas sem jargão
- **Metáforas obrigatórias:** sempre usar analogias do cotidiano para conceitos técnicos ou abstratos
- **Concisão:** se dá pra explicar em 3 linhas, não use 10
- **Estrutura pós-tarefa:** O que fiz, Por quê, Próximo passo, Erros (se houver)

## Convenções deste projeto
{A definir — preencha com stack, lint rules, etc. conforme o projeto evolui}
```

## Passo 2.6: Criar memory files (templates)

Criar os 3 arquivos de memória usando os templates de `docs/analysis/memory-templates-2026-03-18.md`.

**Para CENTRALIZED:** criar em `docs/projects/{nome}/memory/`
**Para HYBRID:** criar em `{project-path}/.aios/memory/`

### project-context.md
Preencher automaticamente com dados coletados nos passos anteriores:
- **Stack Técnica:** extraída do tipo do projeto (app→Node.js/React, squad→N/A, etc.)
- **Contexto de Negócio:** usar a descrição breve do Passo 1
- **Decisões de Arquitetura:** deixar "(A ser preenchido durante desenvolvimento)"
- **Escolhas Técnicas Permanentes:** deixar "(A ser preenchido)"
- **Regras de Ouro:** deixar "(A ser preenchido)"

### agents-used.md
Preencher com squad informado (se houver), caso contrário deixar vazio para preenchimento futuro.

### squads-config.md
Deixar template mínimo — será preenchido conforme squads são usados.

**IMPORTANTE:** Estes arquivos são a "memória do projeto". Agents devem ler `memory/project-context.md` ao entrar no projeto para saber contexto sem perguntar.

---

## Passo 2.7: Criar estrutura de organização Epic/Story

**SEMPRE executar este passo** para todo projeto (CENTRALIZED ou HYBRID).

### Determinar se epics/ é necessário

| Tipo | Criar epics/? | Razão |
|------|--------------|-------|
| `app` | SIM | Milestones de features |
| `squad` | SIM | Versões e releases |
| `pipeline` | NÃO | Batch processing, iterativo |
| `mind-clone` | NÃO | Coleta iterativa, sem milestones |
| `knowledge` | NÃO | Incremental, sem deadlines |
| `research` | NÃO | Discovery-driven, não milestone-driven |

Execute o script:
```bash
# Para app/squad (com epics):
node ~/aios-core/tools/create-epic-structure.js {project-path}

# Para pipeline/mind-clone/knowledge/research (sem epics):
node ~/aios-core/tools/create-epic-structure.js {project-path} --skip-epics
```

Onde `{project-path}` é:
- **CENTRALIZED:** `.` (cwd já está em aios-core)
- **HYBRID:** `{project-path}` (path absoluto do projeto externo)

Isso cria automaticamente:
- `docs/stories/active/`, `docs/stories/done/`
- `docs/stories/epics/` (apenas se tipo = app ou squad)
- `docs/sessions/YYYY-MM/`
- `docs/HANDOFFS-INDEX.md`
- `docs/INDEX.md` (template — será sobrescrito no Passo 3)
- `docs/README.md`

**IMPORTANTE:** Se o projeto for HYBRID (externo), o script cria em `{project-path}/docs/`. Se for CENTRALIZED, cria em `docs/projects/{nome}/`.

**Após rodar o script:**
- Verificar que todos os diretórios foram criados
- O INDEX.md gerado pelo script será SOBRESCRITO no Passo 3 com versão customizada

## Passo 2.8: Configurar .claude/ (NOVO)

**SEMPRE executar este passo** para todo projeto (CENTRALIZED ou HYBRID).

Execute o script helper:

```bash
node ~/aios-core/tools/copy-project-config.js {destination} {type} "{project_name}" {mode}
```

**Parâmetros:**
- `{destination}` — Caminho do destino:
  - **CENTRALIZED:** `docs/projects/{nome}/`
  - **HYBRID:** `{project-path}/` (path absoluto)
- `{type}` — Tipo do projeto: `app`, `squad`, `mind-clone`, `pipeline`, `knowledge`, `research`
- `{project_name}` — Nome legível (entre aspas, ex: "My App")
- `{mode}` — Modo de governança: `HYBRID` ou `CENTRALIZED`

**Exemplo CENTRALIZED:**
```bash
node ~/aios-core/tools/copy-project-config.js docs/projects/my-knowledge knowledge "My Knowledge Base" CENTRALIZED
```

**Exemplo HYBRID:**
```bash
node ~/aios-core/tools/copy-project-config.js ~/CODE/Projects/my-app app "My App" HYBRID
```

**Exemplo app+squad (merge de tipos):**
```bash
node ~/aios-core/tools/copy-project-config.js ~/CODE/Projects/meta-ads app "Meta Ads" HYBRID --merge-types app,squad
```

**O que o script faz:**
1. Copia template `base/.claude/` completo
2. Sobrescreve `settings.json` com override específico do tipo (se existir)
   - Se `--merge-types` for usado, faz deep merge dos settings.json de TODOS os tipos especificados
   - Arrays são combinados removendo duplicatas (ex: allow de app + allow de squad)
3. Substitui todos os placeholders no `CLAUDE.md`
4. **Copia `memory-protocol.md`** de `~/aios-core/.claude/rules/memory-protocol.md` para `{destination}/.claude/rules/`
   - Isso garante que squads e agentes invocados no projeto saibam ler/gravar memória
5. Valida que todos os arquivos obrigatórios foram criados

**Saída esperada (modo normal):**
```
✅ Copiando base template...
✅ Aplicando override para tipo: app
✅ Placeholders substituídos em CLAUDE.md
🔍 Validando estrutura criada...
   ✅ .claude/settings.json
   ✅ .claude/CLAUDE.md
   ✅ .claude/rules/behavioral-rules.md
   ✅ .claude/rules/project-rules.md
🎉 Configuração .claude/ criada com sucesso!
```

**Saída esperada (modo merge):**
```
✅ Copiando base template...
🔀 Fazendo merge de tipos: app + squad

   ✅ Merged: app
   ✅ Merged: squad

✅ settings.json merged salvo.
✅ Placeholders substituídos em CLAUDE.md
🔍 Validando estrutura criada...
   ✅ .claude/settings.json (merged)
   ...
🎉 Configuração .claude/ criada com sucesso!
📝 Tipos merged: app + squad
```

## Passo 3: Gerar INDEX.md

Crie o INDEX.md em `{index_path}` seguindo este formato:

```markdown
# {Nome Legível} — Project Index

## Estado Atual
- **Tipo:** {tipo}
- **Descrição:** {descrição breve coletada no Passo 1}
- **Squad:** `{squad}` (ou "A definir")
- **Local:** {ver regras abaixo}
- **Status:** {status descritivo}
- **Bloqueadores:** Nenhum
```

Regras para o campo **Local** (SEMPRE incluir, nunca omitir):
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

## Metrics

**Last Updated:** {data de hoje}

| Métrica | Valor | Meta |
|---------|-------|------|
| Stories Ativas | 0 | - |
| Stories Concluídas | 0 | - |
| Epics Ativos | 0 | - |
| Tempo Médio por Story | - | - |
| Coverage de Testes | - | >80% |
| Bugs Abertos | 0 | <5 |

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

**Usar script automatizado** que valida header e adiciona row:

```bash
node ~/aios-core/tools/append-to-active.js \
  --project {nome} \
  --mode {HYBRID|CENTRALIZED} \
  --path {link-index}
```

Onde:
- `{nome}` = nome do projeto (kebab-case)
- `{mode}` = HYBRID ou CENTRALIZED (determinado no Passo 1)
- `{link-index}`:
  - **CENTRALIZED:** `{nome}/INDEX.md`
  - **HYBRID:** `{path-absoluto}/.aios/INDEX.md`

**O que o script faz:**
- ✅ Valida header do ACTIVE.md (corrige se corrompido)
- ✅ Detecta se projeto já existe
- ✅ Calcula número sequencial automaticamente
- ✅ Adiciona row com emoji correto (📦 CENTRALIZED, 🏠 HYBRID)
- ✅ Formata igual às rows existentes

**Exemplo:**
```bash
# CENTRALIZED
node ~/aios-core/tools/append-to-active.js --project ensinio-v2 --mode CENTRALIZED --path ensinio-v2/INDEX.md

# HYBRID
node ~/aios-core/tools/append-to-active.js --project meta-ads --mode HYBRID --path ~/CODE/Projects/meta-ads/.aios/INDEX.md
```

## Passo 5: Confirmar e sugerir próximo passo

Mostre ao usuário a estrutura criada:

### Para projetos CENTRALIZED:
```
docs/projects/{nome}/
├── INDEX.md
├── HANDOFFS-INDEX.md
├── README.md
├── memory/
│   ├── project-context.md   # Contexto persistente do projeto
│   ├── agents-used.md       # Histórico de agents/squads
│   ├── squads-config.md     # Config de squads neste projeto
│   └── feedback/            # Feedback do usuário por tópico
│       └── .gitkeep
├── stories/
│   ├── active/       # Stories em progresso
│   ├── done/         # Stories concluídas
│   └── epics/        # Epics (projetos grandes)
├── sessions/
│   └── 2026-03/      # Handoffs organizados por ano-mês
├── research/
│   └── .gitkeep
└── data/
    └── .gitkeep
```

### Para projetos HYBRID:
```
{project-path}/
├── .aios/
│   ├── INDEX.md
│   ├── skills -> ~/aios-core/.aios/skills  # Symlink para skills globais
│   ├── memory/
│   │   ├── project-context.md   # Contexto persistente do projeto
│   │   ├── agents-used.md       # Histórico de agents/squads
│   │   ├── squads-config.md     # Config de squads neste projeto
│   │   └── feedback/            # Feedback do usuário por tópico
│   │       └── .gitkeep
│   ├── sessions/
│   │   └── .gitkeep
│   ├── stories/
│   │   ├── active/
│   │   │   └── .gitkeep
│   │   └── completed/
│   │       └── .gitkeep
│   └── epics/
│       └── .gitkeep
├── .claude/
│   └── CLAUDE.md
└── docs/
    ├── INDEX.md (link → ../.aios/INDEX.md)
    ├── HANDOFFS-INDEX.md
    ├── README.md
    ├── stories/
    │   ├── active/
    │   ├── done/
    │   └── epics/
    └── sessions/
        └── 2026-03/
```

Mostre também:
- Path do INDEX.md
- Row adicionada no ACTIVE.md (#{número})
- Modo: CENTRALIZED ou HYBRID

## Passo 6: Validação Automática de Qualidade

Execute a validação de estrutura automaticamente:

```bash
node ~/aios-core/tools/validate-structure.js {project-path}
```

**Onde `{project-path}` é:**
- **CENTRALIZED:** `docs/projects/{nome}/`
- **HYBRID:** `{project-path}/` (path absoluto do projeto externo)

**O que a validação checa:**
1. ✅ Estrutura base existe (docs/stories, docs/sessions, INDEX.md, etc.)
2. ✅ Stories em active/ seguem naming (STORY-X.Y-nome.md)
3. ✅ Epics seguem naming (EPIC-N-nome/)
4. ✅ INDEX.md tem seção Metrics com Last Updated
5. ✅ Sessions organizadas por YYYY-MM
6. ✅ Stories concluídas em done/

**Se a validação falhar:**
- Mostrar output do script (indica qual check falhou)
- Tentar corrigir o problema identificado automaticamente (1 tentativa)
- Se a segunda tentativa também falhar, executar **ROLLBACK AUTOMÁTICO**:

### Rollback Automático (se validação falhar 2x)

Execute o script de rollback:

```bash
node ~/aios-core/tools/rollback-project.js {project-path}
```

**O que o script faz:**
1. Pede confirmação antes de deletar (⚠️ "Isso vai DELETAR a estrutura criada em: {path}. Continuar? (Y/N)")
2. Se confirmado, remove NA ORDEM INVERSA:
   - `.claude/` criado pelo copy-project-config.js
   - `docs/INDEX.md`, `docs/HANDOFFS-INDEX.md`, `docs/sessions`, `docs/stories` criados pelo create-epic-structure.js
   - `.aios/`, `research/`, `data/` criados no Passo 2
   - Row do ACTIVE.md criada no Passo 4 (automaticamente detecta e remove)
3. Pergunta se deve remover diretório do projeto se ficou vazio
4. Mostra: "✅ Rollback completo! N itens removidos."
5. Sugere: "💡 Corrija o problema e rode /new-project novamente."

Se usuário cancelar: "❌ Rollback cancelado. Estrutura mantida com problemas."

**Se passar:**
- Mostrar: "🎉 Estrutura validada! 6/6 checks passaram."

### Sugestão inteligente por tipo

Baseado no tipo do projeto, sugira o próximo passo concreto:

| Tipo | Sugestão |
|------|----------|
| `app` | "Próximo passo: `@pm *create-epic` para definir escopo e criar PRD." |
| `squad` | "Próximo passo: Criar `squads/{nome}/README.md` com escopo do squad, depois `@sm *draft` para primeira story." |
| `mind-clone` | "Próximo passo: Coletar fontes do indivíduo (vídeos, textos, entrevistas). Use `@analyst` para research." |
| `pipeline` | "Próximo passo: Mapear steps do pipeline (inputs → processamento → outputs). Use `@architect` para design." |
| `knowledge` | "Próximo passo: Organizar fontes e definir estrutura da knowledge base. Use `@analyst` para research." |
| `research` | "Próximo passo: Definir perguntas de pesquisa e metodologia. Use `/tech-search` para deep research." |

Se o tipo for `app` e o destino for externo (`~/CODE/Projects/` ou customizado):
- Adicione: "Quer iniciar o scaffold com app-builder?"

### Pergunta automática: continuar com planejamento?

**SEMPRE pergunte ao final** (para TODOS os tipos):

"✅ Estrutura criada! Quer continuar com o planejamento completo agora?"

**Se tipo = `app`, `squad` ou `pipeline`:**
- Explique: "Isso vai criar automaticamente: Epic → Stories → Validação (@pm + @sm + @po)"
- Opções:
  1. ✅ Sim, pipeline completo (recomendado)
  2. ⏭️ Não, vou criar manualmente depois
  3. 📝 Criar só o epic (sem stories)

**Se tipo = `mind-clone`, `knowledge` ou `research`:**
- Explique: "Isso vai coletar informações e definir escopo de pesquisa"
- Opções:
  1. ✅ Sim, continuar com setup
  2. ⏭️ Não, vou configurar manualmente

---

**Se usuário escolher "Sim" (opção 1):**
- Execute a **Fase 2** abaixo (planejamento completo)

**Se usuário escolher "Não" (opção 2):**
- Mostre a sugestão inteligente por tipo (tabela acima) e PARE

**Se usuário escolher "Criar só o epic" (opção 3, apenas para app/squad/pipeline):**
- Execute apenas o Passo 2.1 da Fase 2 (criar epic)
- PARE após o epic estar criado

---

## Fase 2: Planejamento Automático (executado se usuário escolher "Sim")

Esta fase só é executada se o usuário optar por continuar. Caso contrário, o comando termina no Passo 6.

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

Registre as respostas no INDEX.md do projeto em `{index_path}` (seção "Estado Atual").

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

Registre as respostas no INDEX.md do projeto em `{index_path}`.

**Passo 2.2: Sugerir ferramentas**

Sugira conforme necessidade:
- Deep research → `/tech-search`
- Análise competitiva → `@analyst`
- Dados de mercado → MCP Exa/Apify

---

## Fase 3: Checkpoint e resumo final

Após completar a Fase 2 (ou pular se usuário escolheu "Não"):

1. Atualize o INDEX.md em `{index_path}` com o estado atual (epic criado, stories validadas, etc.)
2. Mostre resumo final:

```
## Projeto: {nome} — Criação Completa ✅

**Modo:** {CENTRALIZED ou HYBRID}
**INDEX.md:** {index_path}
**ACTIVE.md:** Row #{número} adicionada
```

Para tipos `app`/`squad`/`pipeline` (se Fase 2 foi executada), adicione:
```
**Epic:** {nome do epic} criado em docs/stories/
**Stories:** {N} stories criadas e validadas
**Próximo passo:** `@dev` pode começar a implementar Story 1
```

Para tipos `mind-clone`/`knowledge`/`research` (se Fase 2 foi executada), adicione:
```
**Escopo:** Definido e registrado no INDEX.md
**Próximo passo:** {ação específica baseada no tipo}
```

3. Se Fase 2 NÃO foi executada (usuário escolheu "Não"), mostre apenas:
```
**Estrutura criada!** Use as sugestões acima para os próximos passos.
```
