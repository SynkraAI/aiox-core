# Phase 0: Discovery

> Socratic Gate + Ecosystem Scan + Onboarding

---

## Purpose

Entender O QUE o usuario quer antes de qualquer linha de codigo. Pense nessa fase como a consulta com o medico antes da cirurgia — ele nao opera sem saber o que doi.

---

## Execution Steps

### Step 1: Show Banner

Display the Forge banner from `personality.md`.

### Step 2: Check Interrupted Runs

Glob `.aios/forge-runs/*/state.json`. For each file:
- Read and check `status` field
- If any has `status != "completed"`:
  - Show: "Encontrei um run interrompido: `{run_id}` (Phase {N}). Continuar ou comecar novo?"
  - If resume: load state and jump to last phase
  - If new: proceed with Step 3

### Step 3: Onboarding + Socratic Gate (FUNDIDOS — uma unica interacao)

**Principio:** Minimo de perguntas, maximo de contexto. O usuario quer ver as coisas acontecendo, nao responder questionario.

**Check project memory:**
- HYBRID: `{cwd}/.aios/memory/project-context.md`
- CENTRALIZED: `docs/projects/{name}/memory/project-context.md`

**Se project memory EXISTS:**
- Greet: "Fala, {name}! Bora continuar o {project}?"
- Pular direto para as perguntas de contextualizacao (so 2, sem onboarding)

**Se primeiro run (sem memory):**
- Adicionar UMA pergunta extra no inicio: "Como posso te chamar?"

#### Perguntas — AGRUPADAS em um unico bloco

Use `AskUserQuestion` UMA VEZ com todas as perguntas juntas. NAO faca uma por vez.

**FULL_APP mode:**

Analise primeiro o que o usuario JA disse no comando. Se ele escreveu "/forge app de gestao de clinicas com agendamento e prontuarios", voce JA SABE o que o app faz. NAO pergunte de novo.

Perguntas (pule as que ja foram respondidas no comando):

```
Me conta rapidinho pra eu montar o plano:

1. Quem vai usar e qual o principal problema que resolve?
2. Tem referencia? (app parecido, site, Figma, ou "nao")
3. Stack preferida ou deixa comigo?
```

Se primeiro run, adicione no inicio: "Ah, e como posso te chamar?"

**SINGLE_FEATURE mode:**
```
Pra eu entender a feature:

1. Me da um exemplo de uso real (tipo: "usuario clica em X e acontece Y")
2. Isso muda algo que ja existe ou e 100% novo?
```

**BUG_FIX mode:**
```
Me conta do bug:

1. O que deveria acontecer vs o que esta acontecendo?
2. Tem mensagem de erro? (cola aqui se tiver)
```

#### Follow-up inteligente

Se alguma resposta for vaga, faca UMA follow-up especifica:
- AskUserQuestion: "Quando voce diz 'vendas', e de produtos fisicos, digitais ou servicos?"

Maximo 1 follow-up. Depois, prossiga com o melhor entendimento.

#### Se o usuario disser "so faz" ou "vai direto"

Respeite. Pule perguntas, use o que tem, e prossiga.
Registre no state.json: `discovery_mode: "minimal"`

### Step 5: Ecosystem Scan (MANDATORY)

Read `skills/forge/ecosystem-scanner.md` and execute the full scan protocol:

1. Read minds INDEX, skills frontmatters, squads READMEs
2. Match against project description + tech stack
3. Build context-pack.json
4. Show scan results to user

### Step 6: Project Detection (FULL_APP only)

For full app mode, also run project detection:
1. Read `skills/app-builder/project-detection.md`
2. Determine project type (SaaS, API, Mobile, etc.)
3. Read `skills/app-builder/tech-stack.md`
4. Suggest stack + template

### Step 7: Scope Summary + CHECKPOINT

Show a summary of everything understood:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Discovery Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 Projeto: {name}
  🎯 O que faz: {description}
  👥 Publico: {audience}
  🔧 Stack sugerida: {stack} (template: {template})
  🧠 Consultores: {minds list}
  ⚡ Skills: {skills list}

  1. Aprovar e continuar
  2. Ajustar algo
  3. Parar aqui
```

Wait for user response before proceeding.

### Step 8: Initialize Run

1. Generate run_id: `forge-{slug}-{YYYYMMDD-HHmm}`
2. Create run folder: `.aios/forge-runs/{run_id}/`
3. Save state.json with initial state
4. Save context-pack.json from ecosystem scan

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
