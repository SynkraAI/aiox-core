# Phase 0: Discovery

> Socratic Gate + Ecosystem Scan + Onboarding

---

## Purpose

Entender O QUE o usuário quer antes de qualquer linha de código. Pense nessa fase como a consulta com o médico antes da cirurgia — ele não opera sem saber o que dói.

---

## Execution Steps

### Step 1: Show Banner

Display the Forge banner from `{FORGE_HOME}/personality.md`.

### Step 2: Project Awareness (AUTOMATIC — all modes)

Detect if running inside an existing project. Check for: `package.json`, `.git/`, `tsconfig.json`, `Cargo.toml`, `requirements.txt`, `go.mod`.

**If existing project detected:**

Run a quick scan (~10 seconds):

1. **Read `package.json`** (or equivalent) → stack, dependencies, scripts
2. **Run `ls` top-level** → folder structure
3. **Read `README.md`** or `.aios/INDEX.md` (first 50 lines) → project context
4. **Run `git log -5 --oneline`** → recent activity (se `.git/` existir; senão skip com nota "sem histórico git disponível")

Save results to working memory. This context will be:
- Injected into ALL agent dispatches (so @dev knows the stack, patterns, conventions)
- Used to skip redundant questions (if we know the stack, dont ask "stack preferida?")
- Used to detect brownfield mode (if project has substantial code, suggest `/forge scan`)

**If NO existing project detected:**
- Skip this step (greenfield mode)
- Proceed normally

**If existing project but user ran `/forge` (full app) instead of `/forge feature`:**
- Warn: "Detectei que esse projeto já tem código. Você quer adicionar algo novo ou começar do zero?"
- If "adicionar": reclassify as SINGLE_FEATURE
- If "do zero": proceed as FULL_APP (user knows what they're doing)

### Step 3: Check Interrupted Runs

Glob `.aios/forge-runs/*/state.json`. For each file:
- Read and check `status` field
- Filtrar APENAS `status == "running"` — ignorar `completed`, `converted`, `saved`, `cancelled` (ver runner.md Section 6.0 para modelo completo de status)
- If any has `status == "running"`:
  - Show: "Encontrei um run interrompido: `{run_id}` (Phase {N}). Continuar ou começar novo?"
  - If resume: load state and jump to last phase
  - If new: proceed with Step 4

### Step 4: Onboarding + Socratic Gate (FUNDIDOS — uma única interação)

**Princípio:** Mínimo de perguntas, máximo de contexto. O usuário quer ver as coisas acontecendo, não responder questionário.

**Check project memory:**
- HYBRID: `{cwd}/.aios/memory/project-context.md`
- CENTRALIZED: `docs/projects/{name}/memory/project-context.md`

**Se project memory EXISTS:**
- Greet: "Fala, {name}! Bora continuar o {project}?"
- Pular direto para as perguntas de contextualização (só 2, sem onboarding)

**Se primeiro run (sem memory):**
- Adicionar UMA pergunta extra no início: "Como posso te chamar?"

#### Formato de apresentação (OBRIGATÓRIO)

**TODAS as perguntas DEVEM ser apresentadas como opções numeradas com título bold + descrição.**
Nunca use perguntas abertas soltas. Sempre ofereça opções pré-definidas + uma opção livre no final.

Formato padrão:

```
{Pergunta contextualizada}

> 1. **{Opção A}**
>    {Descrição curta de 1 linha explicando o que isso significa}
> 2. **{Opção B}**
>    {Descrição curta}
> 3. **{Opção C}**
>    {Descrição curta}
> 4. Digitar outra coisa.
```

Regras do formato:
- Título da opção em **bold**
- Descrição embaixo, indentada, em tom informal
- Última opção SEMPRE é "Digitar outra coisa." (escape valve)
- Máximo 5 opções por pergunta (incluindo a livre)
- Use `AskUserQuestion` para apresentar

#### Perguntas — UMA POR VEZ, formato de opções

Analise primeiro o que o usuário JÁ disse no comando. Se ele escreveu "/forge app de gestão de clínicas com agendamento e prontuários", você JÁ SABE o que o app faz. NÃO pergunte de novo.

Pule perguntas que já foram respondidas no comando. Faça as restantes UMA POR VEZ no formato acima.

**FULL_APP mode — Pergunta 1 (pesquisa de mercado — SEMPRE PRIMEIRA):**

Essa pergunta vem ANTES de qualquer outra. Pesquisar o que já existe no mercado simplifica todas as decisões seguintes (stack, arquitetura, features, diferencial).

```
Antes de montar o plano, quer que eu pesquise o que já existe no mercado?

> 1. **Pesquisar soluções parecidas**
>    Investigo os principais apps/tools do mercado que resolvem problema similar e trago um resumo
> 2. **Já conheço o mercado**
>    Já sei o que existe, me diz as referências e eu sigo
> 3. **Pular, vai direto**
>    Não precisa pesquisar, já tenho clareza do que quero
> 4. Digitar outra coisa.
```

**Se opção 1 escolhida:** Executar `/tech-search` (skill de deep research) com foco em:
- Top 5-10 soluções open-source e comerciais para o problema descrito
- Features comuns entre elas (table stakes)
- Gaps/oportunidades (o que nenhuma faz bem)
- Modelos de negócio (free, freemium, paid, open-source)
- Stack/tech choices (repos GitHub, stars, última atividade)

O output do `/tech-search` é salvo em `docs/research/` e serve como base para o PRD.

**Pós-processamento — Build vs Buy vs Integrate (OBRIGATÓRIO após tech-search):**

Após o `/tech-search` completar, NÃO prossiga direto. Execute esta análise:

1. **Ler os resultados:**
   - `docs/research/{folder}/README.md` — TL;DR + metadata (coverage_score, sources)
   - `docs/research/{folder}/02-research-report.md` — soluções encontradas com features
   - `docs/research/{folder}/03-recommendations.md` — ranking de alternativas

2. **Classificar cada solução em 3 categorias:**
   - **🏗️ Usar como base** — projeto open-source maduro (>1k stars, ativo nos últimos 6 meses) que cobre >60% do problema. Candidato a fork, self-host ou customização. Muda completamente a abordagem: em vez de construir do zero, customiza o existente.
   - **🔌 Integrar como componente** — lib, SDK ou API que resolve uma parte específica (ex: Stripe pra pagamento, Resend pra email, Cal.com embed pra agendamento). Não é a base do projeto, mas reduz escopo.
   - **📎 Referência apenas** — inspiração de UX, features ou modelo de negócio. Não dá pra usar código/serviço diretamente.

3. **Identificar table stakes e gaps:**
   - **Table stakes:** features que TODAS (ou quase todas) as soluções têm. É o baseline — se o projeto não tiver, está abaixo do mercado.
   - **Gaps:** o que nenhuma solução faz bem. Oportunidade de diferenciação — é aqui que o projeto pode se destacar.

4. **Salvar em state.json** (campo `discovery.market_research`):

```json
{
  "discovery": {
    "market_research": {
      "executed": true,
      "option_chosen": "pesquisar",
      "research_folder": "docs/research/{folder}/",
      "solutions": [
        {
          "name": "Cal.com",
          "category": "usar_como_base",
          "coverage_pct": 75,
          "license": "AGPL-3.0",
          "stars": 40000,
          "reason": "Open-source, cobre agendamento + calendário + integrações"
        },
        {
          "name": "Stripe",
          "category": "integrar_componente",
          "coverage_pct": null,
          "reason": "API de pagamentos — resolve billing sem construir do zero"
        },
        {
          "name": "Calendly",
          "category": "referencia",
          "coverage_pct": null,
          "reason": "UX de booking flow como inspiração"
        }
      ],
      "table_stakes": ["autenticação", "agendamento", "notificações por email"],
      "gaps": [
        { "gap": "IA para sugestão de horários", "opportunity": "high" },
        { "gap": "Integração com convênios brasileiros", "opportunity": "very_high" }
      ],
      "tech_patterns": { "frontend": "React", "backend": "Node.js", "db": "PostgreSQL" },
      "recommendation": null
    }
  }
}
```

> **Nota:** `recommendation` começa `null` e é preenchido no passo 6 abaixo.

5. **Apresentar resumo ao usuário:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 Análise de Mercado — Build vs Buy vs Integrate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🏗️ USAR COMO BASE (cobre >60%):
    {nome} — {coverage}% do problema (~{stars} ⭐, {license})

  🔌 INTEGRAR COMO COMPONENTE:
    {nome} — {o que resolve}
    {nome} — {o que resolve}

  📎 REFERÊNCIA:
    {nome} — {o que inspira}

  ━━ Table Stakes (todos fazem) ━━
  {lista de features obrigatórias}

  ━━ Oportunidades de Diferenciação ━━
  {gap} (oportunidade: {level})

  ━━ Stack mais comum no mercado ━━
  Frontend: {tech} | Backend: {tech} | DB: {tech}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

6. **Se houver solução classificada como "usar como base":** Forge DEVE perguntar:

```
Encontrei {nome} que cobre {X}% do que você precisa. É open-source ({license}), tem {stars} stars e está ativo.

> 1. **Usar como base**
>    Fork/self-host e customizar. A stack do projeto ({tech_patterns}) vira a nossa stack.
> 2. **Só como referência**
>    Prefiro construir do zero, mas vou me inspirar no que ele faz bem
> 3. Digitar outra coisa.
```

Salvar a resposta em `market_research.recommendation` E `market_research.selected_base`:
- Opção 1 → `recommendation: "build_on_existing"` + `selected_base: { name, category, coverage_pct, license, stars, reason, stack }` (copiar da solução escolhida em `solutions[]` e adicionar campo `stack` com as tecnologias do projeto base)
- Opção 2 → `recommendation: "build_from_scratch"`, `selected_base: null` (referência anotada)
- Opção 3 (digitar outra coisa) → interpretar a resposta do usuário. Se faz sentido como variação de 1 ou 2, mapear. Se ambíguo, perguntar: "Entendi {interpretação}. É isso?" — NUNCA deixar `recommendation` como `null`.

**Se houver MÚLTIPLAS soluções "usar como base":** apresentar todas como opções numeradas para o usuário escolher UMA. Só a escolhida vai para `selected_base`.

**Se NÃO houver solução "usar como base":** definir automaticamente:
- Se há soluções "integrar componente" → `recommendation: "integrate_components"`, `selected_base: null`
- Se só referências → `recommendation: "build_from_scratch"`, `selected_base: null`

**Impacto na Pergunta 3 (stack) — OVERRIDE do fluxo padrão:**

> **IMPORTANTE:** As regras abaixo têm PRECEDÊNCIA sobre a lógica padrão da Pergunta 3.
> Quando `recommendation == "build_on_existing"`, a Pergunta 3 NÃO deve ler `tech-decisions-guide.md` nem executar a "Lógica de Decisão Automática". O fluxo abaixo substitui completamente a Pergunta 3 nesse caso.

- Se `recommendation == "build_on_existing"`: a stack já está definida pela solução em `selected_base`. Forge apresenta: "A stack do {selected_base.name} é {selected_base.stack}. Quer manter ou mudar algo?" — Se o usuário aceitar, registrar em `tech_decisions` e pular para Pergunta 4. Se quiser mudar, abrir APENAS a decisão específica que ele quer alterar.
- Se `recommendation == "integrate_components"`: Forge executa lógica normal da Pergunta 3 (`tech-decisions-guide.md`), mas já sabe quais integrações precisa. Adiciona dependências identificadas na lista de `tech_decisions`.
- Se `recommendation == "build_from_scratch"`: fluxo normal da Pergunta 3, sem mudanças.

Apresentar resumo ao usuário e DEPOIS prosseguir para Pergunta 2.

**Se opção 2 escolhida:** Perguntar quais referências o usuário já conhece, anotar, e prosseguir. Salvar em state.json: `discovery.market_research.executed = false`, `option_chosen = "conhecimento"`, com as referências do usuário em `solutions` (categoria `"referencia"`).

**Se opção 3 escolhida:** Pular direto para Pergunta 2. Salvar em state.json: `discovery.market_research.executed = false`, `option_chosen = "pular"`.

---

**FULL_APP mode — Pergunta 2 (público/problema):**

```
Quem vai usar esse app e qual o principal problema que resolve?

> 1. **Eu mesmo**
>    Ferramenta pessoal pra resolver um problema meu do dia-a-dia
> 2. **Qualquer pessoa/empresa**
>    Produto aberto, qualquer um pode usar (SaaS, marketplace, etc.)
> 3. **Público específico/nicho**
>    Tipo: agências, clínicas, restaurantes, freelancers...
> 4. Digitar outra coisa.
```

**FULL_APP mode — Pergunta 3 (stack — Smart Defaults):**

> **GUARD — Build on Existing:** Se `market_research.recommendation == "build_on_existing"`, esta pergunta inteira é SUBSTITUÍDA pelo fluxo descrito na seção "Impacto na Pergunta 3" acima (pós-processamento da Pergunta 1). A stack vem da solução em `selected_base`. NÃO ler `tech-decisions-guide.md`, NÃO executar lógica de decisão automática, NÃO despachar forge-advisor. Apenas confirmar stack com o usuário e registrar em `tech_decisions`. Se o guard ativar, pular direto para Pergunta 4 após confirmação.

**Se o guard NÃO ativou** (recommendation é `"integrate_components"`, `"build_from_scratch"`, ou market research não foi executado):

**OBRIGATÓRIO:** Ler `{FORGE_HOME}/references/tech-decisions-guide.md` antes de apresentar.

> **Plugin-Enhanced:** Quando o plugin `forge-advisor` (priority 8) está ativo, ele injeta
> recomendações baseadas em evidências (learnings de runs anteriores + WebSearch) ANTES
> dos defaults do tech-decisions-guide.md. Recomendações do Advisor têm precedência sobre
> defaults estáticos quando baseadas em dados. Ver `{FORGE_HOME}/forge-advisor.md`.

**Filosofia:** Forge DECIDE a stack ideal automaticamente e APRESENTA com explicações simples.
O usuário NÃO precisa responder 6 perguntas técnicas — ele só valida ou muda.
É como o Waze: a rota já está traçada. Só aperta "Ir".

**Execução:**
1. Analisar a descrição do projeto + respostas das Perguntas 1 e 2
2. **Se `recommendation == "integrate_components"`:** incluir as integrações já identificadas (Stripe, Resend, etc.) como dependências pré-definidas na recomendação de stack
3. **Se forge-advisor plugin ativo:** usar recomendações do advisor (baseadas em learnings + dados de mercado)
4. **Se advisor NÃO ativo (fallback):** Usar a "Lógica de Decisão Automática" do `tech-decisions-guide.md`
5. Apresentar no formato do Passo 2 do guia (tabela com analogias e motivos)
6. Se o usuário quer entender mais: usar a seção "Alternativas por Decisão" do guia (se advisor ativo, WebSearch valida)
7. Se o usuário quer mudar: mostrar alternativas SÓ daquela decisão específica
8. Registrar TODAS as decisões no `state.json` campo `tech_decisions`
9. **Derivar `repo_structure` automaticamente** a partir de `architecture` (ver `tech-decisions-guide.md` tabela de derivação). Salvar no `state.json → tech_decisions.repo_structure`. Se o usuário fizer override explícito, respeitar.

**Regras:**
- Se o usuário JÁ mencionou stack no comando (ex: "quero Postgres"), respeitar e incorporar na recomendação
- NUNCA perguntar 6 coisas separadas — sempre apresentar a stack completa de uma vez
- Explicar cada escolha com analogia simples (1-2 linhas)
- Incluir o MOTIVO específico do projeto (não genérico) para decisões não-óbvias
- O guia tem a lógica completa de quando escolher cada opção

**FULL_APP mode — Pergunta 4 (MVP Scope — OBRIGATÓRIA):**

Essa pergunta é CRÍTICA. Ela garante que o usuário pense no mínimo viável ANTES de planejar tudo. É como aprender a andar antes de correr — sem MVP definido, o PRD vira uma lista de desejos infinita e o projeto nunca sai do papel.

```
Se esse app fosse um restaurante, qual seria o prato do dia 1? O mínimo que precisa funcionar pra alguém usar de verdade.

> 1. **Já tenho clareza do MVP**
>    Me diz em uma frase o que o MVP faz (ex: "Usuário cria conta e agenda consulta")
> 2. **Me ajuda a definir**
>    Eu descrevo tudo que quero e você me diz o que é MVP vs futuro
> 3. **Tudo é MVP**
>    O app é pequeno, não faz sentido separar
> 4. Digitar outra coisa.
```

**Se opção 1:** Registrar a frase do usuário como `mvp_scope`.
**Se opção 2:** Forge analisa a descrição e sugere divisão MVP vs post-MVP. Apresentar como lista e pedir confirmação.
**Se opção 3:** Registrar `mvp_scope: "all"` — todas as stories serão MVP (funciona pra projetos pequenos).

Salvar no state.json:
```json
{
  "mvp": {
    "scope": "Usuário cria conta e agenda consulta",
    "mode": "defined|assisted|all",
    "validated": false
  }
}
```

**Regra:** Se o projeto tem mais de ~5 stories estimadas E o usuário escolheu opção 3, Forge DEVE alertar:
```
Hm, esse projeto parece ter bastante coisa. Tem certeza que tudo é MVP?
Projetos grandes sem MVP definido tendem a nunca terminar.
Quer que eu sugira uma divisão?
```

---

**FULL_APP mode — Pergunta 5 (Core Atom — OBRIGATÓRIA):**

Essa pergunta é CRÍTICA. Ela define qual é a peça mais arriscada do sistema — a que precisa funcionar ANTES de qualquer outra coisa. Inspirado no Atomic Design do Brad Frost.

```
Qual é o "Core Atom" do seu app? A coisa mais básica e arriscada que, se não funcionar, invalida tudo.

> 1. **Integração externa**
>    Depende de uma API, serviço ou automação externa (ex: login no Instagram, pagamento, scraping)
> 2. **Processamento de dados**
>    Precisa processar/transformar dados de forma específica (ex: IA, parser, cálculo complexo)
> 3. **Operação técnica arriscada**
>    Algo que nunca fiz e não sei se funciona (ex: real-time, offline-first, P2P)
> 4. **Não tem risco técnico**
>    É um CRUD simples, já fiz antes, sem dependências críticas
> 5. Digitar outra coisa.
```

**Se opção 1, 2 ou 3:** Faça uma follow-up pedindo detalhes específicos:
```
Me descreve esse Core Atom em uma frase:
Ex: "Conseguir fazer login no Instagram via Playwright sem ser bloqueado"
```

**Se opção 4:** Registre `core_atom: "CRUD padrão"` e pule. Projetos sem risco técnico não precisam de Proof of Life.

Salvar no state.json:
```json
{
  "core_atom": {
    "description": "Login no Instagram via automação",
    "risk_level": "high",
    "type": "external_integration",
    "validated": false
  }
}
```

Se primeiro run, adicione antes de tudo: "Ah, e como posso te chamar?"

**Nota:** Em BUG_FIX e SINGLE_FEATURE modes, MVP não se aplica (são tarefas pontuais).

**SINGLE_FEATURE mode — Pergunta 1:**

```
Me dá um exemplo de uso real dessa feature:

> 1. **Usuário faz X e acontece Y**
>    Me descreve o fluxo principal (ex: "clica em exportar e baixa PDF")
> 2. **Melhoria no que já existe**
>    Algo que já funciona mas precisa mudar/melhorar
> 3. **Algo 100% novo**
>    Feature que não existe ainda no projeto
> 4. Digitar outra coisa.
```

**BUG_FIX mode — Pergunta 1:**

```
Me conta do bug:

> 1. **Tem mensagem de erro**
>    Cola a mensagem aqui que eu investigo
> 2. **Comportamento errado**
>    Deveria fazer X mas faz Y (sem erro visível)
> 3. **Quebrou do nada**
>    Tava funcionando e parou, não sei o que mudou
> 4. Digitar outra coisa.
```

#### Follow-up inteligente

Se alguma resposta for vaga, faça UMA follow-up específica — também no formato de opções numeradas.

Máximo 1 follow-up. Depois, prossiga com o melhor entendimento.

#### Se o usuário disser "só faz" ou "vai direto"

Respeite. Pule perguntas, use o que tem, e prossiga.
Registre no state.json: `discovery_mode: "minimal"`

### Step 5: AIOS Setup (FULL_APP + SINGLE_FEATURE only)

Detecta se o projeto tem estrutura AIOS e oferece setup. Pense nisso como a "matrícula" do projeto no ecossistema — sem ela, o projeto existe mas ninguém sabe dele.

**Check:**
1. Does `{PROJECT_DIR}/.aios/INDEX.md` exist?
2. If YES → skip this step (project already registered)
3. If NO → present options below

**Present using `AskUserQuestion`:**

```
Esse projeto não tem estrutura AIOS. Como quer configurar?

> 1. **Setup completo**
>    .aios/ + docs/stories/ + .claude/CLAUDE.md + memory. Pra projetos que você vai manter e evoluir.
> 2. **Setup mínimo**
>    Só .claude/CLAUDE.md. Pra projetos rápidos — o Forge cria o mínimo necessário.
> 3. **Sem setup**
>    Eu cuido disso depois. Forge roda sem criar estrutura no projeto.
> 4. Digitar outra coisa.
```

**Se opção 1 (completo):**

```
1. Create {PROJECT_DIR}/.aios/INDEX.md with:
   - Project name (from state.json or user input)
   - Status: Active
   - Created: {today}
   - Stack: {from tech_decisions, if available}

2. Create {PROJECT_DIR}/.aios/memory/ directory
3. Create {PROJECT_DIR}/.aios/memory/feedback/ directory

4. Create memory files (same templates as /new-project Passo 2.6):
   - `.aios/memory/project-context.md` — pre-fill with description, stack from tech_decisions
   - `.aios/memory/agents-used.md` — empty template for tracking
   - `.aios/memory/squads-config.md` — empty template for tracking

5. Create {PROJECT_DIR}/docs/stories/active/ directory
6. Create {PROJECT_DIR}/docs/stories/done/ directory

7. The .claude/CLAUDE.md will be generated by forge-scaffold plugin (before:phase:3)
   The plugin reads `{AIOS_HOME}/tools/templates/project-configs/base/.claude/CLAUDE.md` as base template.

8. Update {AIOS_HOME}/docs/projects/ACTIVE.md:
   - Add row: | {project_name} | Active | {path} | [INDEX]({path}/.aios/INDEX.md) |
```

**Se opção 2 (mínimo):**

```
1. The .claude/CLAUDE.md will be generated by forge-scaffold plugin (before:phase:3)
2. Forge creates .aios/forge-runs/ automatically when the run starts (no extra setup)
```

**Se opção 3 (sem setup):**

```
1. Proceed without creating anything
2. Forge creates .aios/forge-runs/ automatically when the run starts
```

**Save to state.json:**

```json
{
  "aios_setup": {
    "mode": "full|minimal|none",
    "index_created": true|false,
    "active_md_updated": true|false
  }
}
```

**Rules:**
- In QUICK mode, skip this step entirely (speed over ceremony)
- In BUG_FIX mode, skip this step (project already exists)
- If user said "só faz" in Step 4, default to option 2 (mínimo) without asking
- NEVER block the pipeline on this step — if anything fails, log and continue

### Step 5.5: Quest Gamification Toggle (ALL modes except QUICK)

Oferece ao usuário a opção de ativar o Quest Engine para gamificar o run. Pense nisso como escolher se quer jogar o modo campanha ou o modo livre — o resultado final é o mesmo, mas a experiência muda.

**Present using `AskUserQuestion`:**

```
Quer gamificar esse run com o Quest?

> 1. **Sim, com Quest!**
>    XP por story completa, barra de progresso, achievements. Torna o build mais visual e divertido.
> 2. **Não, só Forge**
>    Pipeline direto, sem gamificação. Puro e funcional.
> 3. Digitar outra coisa.
```

**Se opção 1 (Quest ativado):**

```
1. Set state.json:
   "quest_enabled": true,
   "quest_bootstrap": {
     "hero_name": "{user_name from Step 4}",
     "project_name": "{project_name}",
     "workflow": "{mode}",
     "requested_at": "{ISO 8601}"
   }

2. The quest-sync plugin will detect quest_enabled and start reporting
   progress events to state.json (plugins.quest_sync.*).

3. Quest's forge-bridge is responsible for reading quest_bootstrap from
   state.json and creating quest-log.yaml. Forge NEVER writes quest-log.yaml.
   See: skills/quest/engine/forge-bridge.md

4. Show: "Quest ativado! O Quest vai inicializar automaticamente quando o build começar."
```

**OWNERSHIP BOUNDARY (NON-NEGOTIABLE):**
- Forge writes: `state.json` → `quest_enabled`, `quest_bootstrap`, `plugins.quest_sync.*`
- Quest writes: `quest-log.yaml` → hero, pack, items, XP
- Forge NEVER creates or writes to `quest-log.yaml`
- Quest reads `state.json` to detect `quest_enabled` and bootstrap data

**Se opção 2 (sem Quest):**

```
1. Set state.json:
   "quest_enabled": false

2. quest-sync plugin stays silent (no overhead)
3. No quest-log.yaml created
```

**Save to state.json:**

```json
{
  "quest_enabled": true|false,
  "quest_bootstrap": { ... }  // only if quest_enabled == true
}
```

**Rules:**
- In QUICK mode, skip this step entirely (quest_enabled = false by default)
- If user said "só faz" in Step 4, skip (quest_enabled = false)
- Quest adds ZERO overhead to execution — it only adds visual feedback and XP tracking
- Quest NEVER blocks the pipeline — if Quest bootstrap fails, log and continue as Forge-only
- The quest-sync plugin checks `quest_enabled` OR `quest_source` to decide whether to report to state.json
- Forge NEVER creates quest-log.yaml — only Quest does (via forge-bridge bootstrap)

### Step 6: Ecosystem Scan (MANDATORY — Plugin-Driven)

> **PLUGIN-DRIVEN:** This step is executed automatically by the `ecosystem-scanner` plugin (priority 10).
> The plugin fires on `after:phase:0` and reads `{FORGE_HOME}/ecosystem-scanner.md`.
> See `{FORGE_HOME}/plugins/ecosystem-scanner.yaml` for details.
>
> **When the plugin system is active, DO NOT re-execute the scan below.**
> The instructions below are kept as reference documentation for the scan protocol.
> If the plugin system is NOT active (fallback mode), execute these steps manually.

Reference — Scan protocol (executed by plugin when active):

1. Read minds INDEX, skills frontmatters, squads READMEs
2. Match against project description + tech stack
3. Build context-pack.json
4. Show scan results to user

#### Step 6b: Deep Scan Offer

After showing the initial scan results, ALWAYS offer a deeper ecosystem sweep:

```
Encontrei {N} recursos relevantes no ecossistema. Quer que eu faça uma varredura mais profunda?

> 1. **Sim, varredura completa**
>    Escaneia TODOS os squads, skills, minds e workflows disponíveis — pode encontrar algo que eu não pensei
> 2. **Não, já está bom**
>    Sigo com o que já encontrei
> 3. **Tenho uma sugestão**
>    Eu sei de um squad/skill/mind específico que deveria ser usado
> 4. Digitar outra coisa.
```

**Se opção 1 (Deep Scan):**

Execute a FULL ecosystem sweep (slower but comprehensive):

```
# Scan EVERYTHING — not just routing matrix matches
1. Glob "squads/*/README.md" → read first 20 lines of EVERY squad
2. Glob "skills/*/SKILL.md" → read frontmatter of EVERY skill
3. Glob "squads/mind-cloning/minds/*/metadata.yaml" → read EVERY mind
4. Glob "skills/forge/workflows/*.md" → list ALL available workflows
5. For each resource found:
   - Score relevance (0-10) against project description
   - Keep score >= 3
6. Present full list to user:
   "Encontrei {N} recursos adicionais que podem ajudar:"
   - {resource_name} — {why_relevant} (score: {N}/10)
7. Ask: "Quer incluir algum desses no plano?"
```

**Se opção 2 (Skip):** Proceed with initial scan results.

**Se opção 3 (User suggestion):** User names specific resources. Add them to context-pack.json and proceed.

**Why this matters:** The user may know about squads or skills that the routing matrix doesn't match automatically. A new squad created yesterday won't be in the static routing matrix. The deep scan catches everything.

### Step 7: Project Detection (FULL_APP only)

For full app mode, also run project detection:
1. Read `skills/app-builder/project-detection.md`
2. Determine project type (SaaS, API, Mobile, etc.)
3. Read `skills/app-builder/tech-stack.md`
4. Suggest stack + template

### Step 8: Execution Plan + CHECKPOINT

**This is the most important step.** Forge MUST present a complete execution plan showing WHAT will be done, by WHOM, and in WHAT order — BEFORE executing anything.

The plan is built from:
1. The selected **workflow** (which defines phases)
2. The **ecosystem scan** (which found relevant squads/skills/minds)
3. The **project context** (from discovery questions)

Show the plan:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Plano de Execução
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 Projeto: {name}
  🎯 O que faz: {description}
  👥 Público: {audience}
  🔧 Stack: {stack}

  ━━━ PLANO DE EXECUÇÃO ━━━

  Fase 1: {phase_name}
    👤 Agente: @{agent_name}
    📦 Squad: /{squad_name} (se aplicável)
    🔧 Skill: /{skill_name} (se aplicável)
    📝 O que vai fazer: {description}

  Fase 2: {phase_name}
    👤 Agente: @{agent_name}
    📝 O que vai fazer: {description}

  ... (todas as fases do workflow)

  ━━━ RECURSOS DISPONÍVEIS ━━━

  🧠 Minds: {lista de minds relevantes do ecosystem scan}
  🎯 Squads: {lista de squads que serão usados}
  ⚡ Skills: {lista de skills que serão usadas}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Aprovar e executar
  2. Ajustar algo
  3. Parar aqui
```

**How to build the plan:**

1. Read the workflow file (`workflows/{mode}.md`)
2. Extract all phases from the `## Execution` section
3. For each phase, extract the agents from the `## Agent Mapping` table
4. Cross-reference with ecosystem scan results (context-pack.json)
5. Present the complete plan with ALL phases, agents, squads, and skills

**Rules:**
- NEVER start execution without showing the plan first
- The plan MUST list every phase and every agent/squad involved
- The plan MUST show ecosystem resources (minds, squads, skills) that will enrich the context
- If the user says "ajustar algo", modify the plan and re-present
- Only proceed to Step 9 after user approves (option 1)

Wait for user response before proceeding.

### Step 9: Initialize Run

**Bifurcação por mode — seguir EXATAMENTE um dos dois caminhos:**

#### Caminho A: DRY_RUN mode

DRY_RUN é simulação read-only. Cria o mínimo para manter estado da simulação, mas NUNCA bloqueia outros runs.

1. Generate run_id: `forge-{slug}-{YYYYMMDD-HHmm}`
2. Create run folder: `.aios/forge-runs/{run_id}/`
3. Save state.json com `mode: "DRY_RUN"` (atomic write)
4. Save context-pack.json do ecosystem scan
5. **NÃO checar `.lock`** — irrelevante para simulação
6. **NÃO criar `.lock`** — simulação não bloqueia nada
7. Prosseguir para o workflow `dry-run.md` (SIM-2+)

**Se o usuário escolher "Executar de verdade" (SIM-4 opção 1):** o workflow `dry-run.md` é responsável por criar um NOVO run via Caminho B abaixo, com novo run_id e novo timestamp. O dry-run original fica como registro da simulação.

#### Caminho B: Todos os outros modes (FULL_APP, SINGLE_FEATURE, BUG_FIX, etc.)

1. **Check for concurrent runs (LOCK):**
   - Check if `.aios/forge-runs/.lock` exists
   - If exists: read lock file to get active run_id
     - Check if that run's state.json has `status != "completed"`
     - If active: "Já existe um run em andamento (`{run_id}`). Quer esperar, cancelar o outro, ou forçar um novo?"
     - If completed/corrupted: remove stale lock and proceed
   - If not exists: proceed
2. Generate run_id: `forge-{slug}-{YYYYMMDD-HHmm}`
3. **Create lock file:** Write run_id to `.aios/forge-runs/.lock`
4. Create run folder: `.aios/forge-runs/{run_id}/`
5. Save state.json with initial state (atomic write)
6. Save context-pack.json from ecosystem scan

**Lock cleanup:** The lock file is removed in runner.md Completion Protocol (Step 7).

---

## Outputs

- `state.json` — initialized with Phase 0 complete
- `context-pack.json` — ecosystem scan results
- User approval to proceed
- Project memory updated (if first run)

---

## Veto Conditions

Phase 0 does NOT have veto conditions. If the user says "go", we go.
But if answers are too vague: ask ONE follow-up, then proceed with best guess.
