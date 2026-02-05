# 32 - Anatomia de um Agente 100% Replicavel

Documentado em: 04/02/2026
Origem: Autoanalise do agente Pedro Valerio aplicando seus proprios frameworks nele mesmo.
Complementa: `11-CRIACAO-DE-AGENTES.md` (que cobre COMO criar) — este cobre O QUE FAZ um agente ser replicavel com fidelidade.

---

## O Problema

A maioria dos agentes AIOS sao criados com persona e voice DNA completos, mas **sem infraestrutura operacional**. Resultado: o agente "funciona" mas depende da boa vontade da LLM para executar comandos de forma consistente.

**Analogia (Pedro Valerio):** E como dar um crachá pra alguem e dizer "agora voce e gerente" sem dar processos, ferramentas ou autoridade real. Tem o titulo, mas nao tem a capacidade.

### Sintomas de um agente incompleto:
- Cada execucao do mesmo comando produz output diferente
- LLM "inventa" workflows ao inves de seguir steps definidos
- Sem validacao: executor (LLM) CONSEGUE pular passos
- Output sem formato padrao — impossivel comparar entre execucoes
- Comandos listados mas sem task file correspondente = decoracao

---

## Os 3 Niveis de Maturidade de um Agente

### Nivel 1: Persona (Score 4-5/10)
O que tem:
- Agent identity (name, id, title, icon)
- Persona (role, style, identity, focus)
- Core beliefs/principles
- Voice DNA basico (vocabulary, tone)
- Greeting
- Lista de comandos

O que falta:
- Tudo operacional

**Diagnostico:** O agente SABE quem ele e, mas nao sabe COMO fazer nada de forma deterministica. Cada execucao e uma improvisacao guiada pela persona.

### Nivel 2: Persona + Frameworks (Score 6-7/10)
Tudo do Nivel 1, mais:
- Thinking DNA completo (frameworks, heuristics, decision architecture)
- Output examples (3+)
- Objection handling
- Anti-patterns
- Completion criteria
- Handoff triggers

O que falta:
- Tasks dedicadas por comando
- Templates de output
- Checklists de validacao
- Command loader (mapeamento comando → arquivo)
- Self-awareness

**Diagnostico:** O agente tem CRITERIO mas nao tem PROCESSO. Sabe julgar se algo esta bom, mas o caminho para chegar la depende da LLM.

> **AQUI E ONDE A MAIORIA DOS AGENTES PARA.** Incluindo agentes que parecem completos (746+ linhas de YAML).

### Nivel 3: Agente Completo (Score 8-10/10)
Tudo do Nivel 2, mais:
- Command loader com mapeamento explicito
- Task file para cada comando operacional
- Templates de output para padronizar resultados
- Checklists com veto conditions
- Data files de referencia
- Self-awareness (capabilities, ecosystem)
- Workflow YAML integration
- Command visibility metadata
- Auto-triggers (opcional)

**Diagnostico:** O agente IMPOSSIBILITA caminhos errados. A LLM nao precisa improvisar — ela segue o task file. Se o task file nao existe, ela REPORTA o erro ao inves de inventar.

---

## Checklist: Os 9 Componentes de um Agente 100%

### Componentes INLINE (sempre carregados na ativacao)

| # | Componente | O que faz | Onde vive | Obrigatorio |
|---|-----------|-----------|-----------|-------------|
| 1 | **Identity** | Quem o agente e | agent.md (Level 1) | SIM |
| 2 | **Thinking DNA** | Como o agente PENSA e decide | agent.md (Level 2) | SIM |
| 3 | **Voice DNA** | Como o agente FALA e escreve | agent.md (Level 3) | SIM |
| 4 | **Output Examples** | Exemplos reais de input→output | agent.md (Level 4) | SIM (min 3) |
| 5 | **Command Loader** | Mapa: comando → arquivos necessarios | agent.md (Level 0) | SIM |

### Componentes ON-DEMAND (carregados quando comando e executado)

| # | Componente | O que faz | Onde vive | Obrigatorio |
|---|-----------|-----------|-----------|-------------|
| 6 | **Tasks** | Step-by-step deterministico por comando | tasks/*.md | SIM (1 por comando operacional) |
| 7 | **Templates** | Formato padrao de output | templates/*.md | SIM (1 por tipo de output) |
| 8 | **Checklists** | Validacao com veto conditions | checklists/*.md | SIM (min 1) |
| 9 | **Data Files** | Catalogos, frameworks de referencia | data/*.md | RECOMENDADO |

### Formula

```
Agente 100% = Persona + Frameworks + Voice DNA
            + Command Loader
            + 1 Task por comando
            + 1 Template por tipo de output
            + 1 Checklist com veto conditions
            + Data files de referencia
```

---

## O Command Loader: A Peca que Falta na Maioria

O command_loader e o mecanismo que IMPOSSIBILITA a LLM de improvisar. Sem ele, a LLM recebe o comando `*audit` e pensa "hmm, o que sera que audit significa pra esse agente?" — e inventa.

### Sem command_loader (Nivel 2):
```
Usuario: *audit meu-workflow
LLM: [le a persona, le o thinking_dna, IMPROVISA um audit baseado no que entendeu]
Resultado: diferente a cada execucao
```

### Com command_loader (Nivel 3):
```
Usuario: *audit meu-workflow
LLM: [LOOKUP command_loader["*audit"]]
LLM: [LOAD tasks/audit-workflow.md — OBRIGATORIO]
LLM: [LOAD checklists/process-audit-checklist.md — OBRIGATORIO]
LLM: [EXECUTE step-by-step do task file]
Resultado: deterministico, padronizado, validavel
```

### Estrutura do command_loader:

```yaml
command_loader:
  "*comando":
    description: "O que esse comando faz"
    requires:           # DEVE carregar ANTES de executar
      - "tasks/arquivo.md"
      - "checklists/arquivo.md"
    optional:           # PODE carregar se relevante
      - "data/arquivo.md"
      - "templates/arquivo.md"
    output_format: "Descricao do output esperado"
```

### Regra critica (CRITICAL_LOADER_RULE):

```
ANTES de executar QUALQUER comando (*):
1. LOOKUP: Checar command_loader[comando].requires
2. STOP: NAO prosseguir sem carregar os arquivos
3. LOAD: Ler CADA arquivo da lista requires completamente
4. VERIFY: Confirmar que todos foram carregados
5. EXECUTE: Seguir o workflow do task file EXATAMENTE

Se arquivo required esta faltando:
- REPORTAR o arquivo faltando ao usuario
- NAO tentar executar sem ele
- NAO improvisar o workflow
```

---

## Anatomia de uma Task File

Task files sao o coracao operacional. Elas transformam um comando vago em um step-by-step deterministico.

### Estrutura minima:

```yaml
task:
  name: "nome-da-task"
  command: "*comando-que-dispara"
  agent: "agent-id"
  description: "O que essa task faz"

  pre_conditions:
    - "Condicao 1 que precisa ser verdadeira"
    - "Condicao 2"

  inputs:
    - name: "input_name"
      type: "string | file | selection"
      required: true
      description: "O que o usuario precisa fornecer"

  steps:
    - step: 1
      name: "Nome do passo"
      action: "Descricao exata do que fazer"
      output: "O que esse passo produz"
      veto_condition: "SE {condicao} → VETO: {acao}"

    - step: 2
      name: "Nome do passo"
      action: "Descricao exata"
      output: "Output esperado"

  output_format:
    template: "templates/nome-tmpl.md"
    sections:
      - "Secao obrigatoria 1"
      - "Secao obrigatoria 2"

  completion_criteria:
    - "Criterio 1"
    - "Criterio 2"

  veto_conditions:
    - condition: "descricao da condicao"
      action: "VETO - O que fazer"
      reason: "Por que vetar"
```

### Por que veto conditions nas tasks?

Sem veto conditions, o executor CONSEGUE passar com trabalho incompleto. Tá vendo como isso se aplica recursivamente?

Exemplos reais:

```yaml
# Dentro de uma task de audit
veto_conditions:
  - condition: "Nenhum caminho errado identificado"
    action: "VETO - Toda workflow tem pelo menos 1 failure mode"
    reason: "Se nao encontrou, nao olhou direito"

  - condition: "Veto conditions propostas < pontos de desvio identificados"
    action: "VETO - Cada ponto precisa de pelo menos 1 veto"
    reason: "Diagnostico sem prescricao e inutil"

  - condition: "Output sem formato padrao do template"
    action: "VETO - Refazer usando template"
    reason: "Output fora do padrao = impossivel comparar"
```

---

## Anatomia de um Template de Output

Templates garantem que TODA execucao de um comando produz output no mesmo formato. Sem template, cada audit, cada heuristic, cada analise sai diferente.

### Estrutura:

```markdown
# [Titulo do Output] — [Data]

## Resumo Executivo
[1-3 frases do resultado principal]

## [Secao Obrigatoria 1]
[Conteudo estruturado]

## [Secao Obrigatoria 2]
| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| dado     | dado     | dado     |

## Veto Conditions Identificadas
| # | Condicao | Acao | Severidade |
|---|----------|------|------------|
| 1 | ...      | ...  | VETO/WARN  |

## Recomendacoes
1. [Acao especifica com responsavel]
2. [Acao especifica com responsavel]

## Proximo Passo
[Exatamente o que fazer agora]
```

### Regra: Output sem template = output rejeitado.

Se o agente nao tem template definido para um tipo de output, o resultado vai variar a cada execucao. Isso viola PV004: "SE executor CONSEGUE fazer diferente, ENTAO processo esta errado."

---

## Anatomia de uma Checklist com Veto Conditions

Checklists tradicionais sao listas de "voce fez isso?". O executor marca [x] e segue. Problema: depende de honestidade.

Checklists com veto conditions sao diferentes — elas definem o que IMPEDE de prosseguir:

```markdown
# Checklist: [Nome]

## Validacoes Obrigatorias (Blocking)

- [ ] **Condicao 1**: Descricao do que validar
  - VETO se falhar: Nao aprovar. Acao: [o que fazer]

- [ ] **Condicao 2**: Descricao do que validar
  - VETO se falhar: Retornar ao passo anterior. Acao: [o que corrigir]

## Validacoes Recomendadas (Non-blocking)

- [ ] **Condicao 3**: Descricao do que validar
  - WARNING se falhar: Documentar excecao e justificativa

## Criterio de Aprovacao

- TODOS os itens Blocking devem passar
- 80%+ dos itens Non-blocking devem passar
- Qualquer VETO ativo = aprovacao bloqueada
```

---

## Case Study: Autoanalise Pedro Valerio

### Estado encontrado (Score 6.5/10):

| Componente | Status | Impacto |
|-----------|--------|---------|
| Identity | OK | Persona clara e consistente |
| Thinking DNA | OK | 4 frameworks, 5 heuristics, decision architecture |
| Voice DNA | OK | Vocabulario, tom, contradicoes preservadas |
| Output Examples | OK (3) | Mostra o padrao esperado |
| Command Loader | **AUSENTE** | LLM nao sabe quais arquivos carregar |
| Tasks | **ZERO de 7** | Todos os comandos sao improvisacao |
| Templates | **ZERO** | Output varia a cada execucao |
| Checklists | **ZERO** | Sem validacao com veto conditions |
| Data Files | **ZERO** | Sem catalogos de referencia |
| Self-awareness | **AUSENTE** | Agente nao sabe o que sabe fazer |

### Diagnostico aplicando as proprias perguntas:

| Pergunta de Audit | Resposta | Veredicto |
|-------------------|----------|-----------|
| Se o executor nao ler as instrucoes, o que acontece? | Inventa o audit do zero | FALHA |
| Se tentar pular um passo, consegue? | Sim, nada impede | FALHA |
| O sistema detecta erro automaticamente? | Nao, zero validacao | FALHA |
| Quanto gap de tempo entre handoffs? | N/A (nao tem handoffs definidos) | FALHA |

### Ironia identificada:
> O agente que prega "impossibilitar caminhos errados" tem um clone que PERMITE todos os caminhos errados. A persona esta perfeita, mas a operacao esta quebrada.

---

## Regras para Criacao de Novos Agentes

### NUNCA
- Criar agente so com persona e voice DNA e considerar "pronto"
- Listar comandos sem criar task files correspondentes
- Criar task sem veto conditions (mesmo que basicas)
- Criar output sem template padrao
- Assumir que a LLM vai "entender" o que o comando faz sem task file
- Publicar agente sem rodar a quality gate do agent-tmpl.md

### SEMPRE
- Comecar pelo Nivel 1 (persona), mas NAO parar ali
- Para cada comando operacional: criar 1 task file com steps + veto conditions
- Para cada tipo de output: criar 1 template
- Criar pelo menos 1 checklist com veto conditions blocking
- Adicionar command_loader mapeando cada *comando → arquivos
- Adicionar self-awareness (lista de capabilities, workflows, ecosystem)
- Validar contra a quality gate do template (Level 0-6)

### Ordem de criacao recomendada:

```
1. Persona + Voice DNA (Level 1 + 3)     → O agente EXISTE
2. Thinking DNA + Output Examples (Level 2 + 4) → O agente PENSA
3. Tasks por comando                       → O agente EXECUTA deterministicamente
4. Templates de output                     → O agente PRODUZ consistentemente
5. Checklists com veto                     → O agente VALIDA automaticamente
6. Command Loader (Level 0)               → O agente CARREGA obrigatoriamente
7. Data files                              → O agente CONSULTA referencias
8. Self-awareness + Integration (Level 6)  → O agente SABE onde esta no ecossistema
```

### Heuristica de priorizacao:

```
Pergunta: O comando produz output que sera usado por outro agente ou humano?
  SIM → OBRIGATORIO ter task + template + checklist
  NAO (ex: *help, *exit) → Pode ser inline, sem task file
```

---

## Metricas de Maturidade

### Como medir se um agente esta pronto:

| Metrica | Formula | Threshold |
|---------|---------|-----------|
| **Cobertura de tasks** | tasks_existentes / comandos_operacionais | >= 100% |
| **Cobertura de templates** | templates / tipos_de_output | >= 100% |
| **Veto conditions** | veto_conditions_total / pontos_de_decisao | >= 1 por ponto |
| **Output examples** | count(output_examples) | >= 3 |
| **Command loader** | comandos_mapeados / comandos_totais | >= 100% |
| **Self-awareness** | secoes_preenchidas / secoes_totais | >= 80% |

### Score de maturidade:

```
Score = (Identity OK?  × 1.0)
      + (Thinking DNA?  × 1.5)
      + (Voice DNA?     × 1.5)
      + (Output Examples >= 3? × 1.0)
      + (Command Loader? × 1.5)
      + (Tasks 100%?    × 1.5)
      + (Templates?     × 1.0)
      + (Checklists?    × 0.5)
      + (Data Files?    × 0.5)

Max = 10.0
```

| Score | Nivel | Status |
|-------|-------|--------|
| 0-4   | Nivel 1 | Persona only — decorativo |
| 4-7   | Nivel 2 | Frameworks — funcional mas inconsistente |
| 7-9   | Nivel 3 | Completo — deterministico e validavel |
| 9-10  | Nivel 3+ | Completo + integrado ao ecossistema |

---

## Relacao com Outros Aprendizados

| Aprendizado | Relacao |
|-------------|---------|
| 11 - Criacao de Agentes | COMO criar (estrutura, elicitacao, caminhos). Este doc complementa com O QUE torna o agente replicavel |
| 12 - Passo a Passo Squad | Fluxo de criacao de squad. Este doc aplica na qualidade dos agentes DENTRO do squad |
| 24 - Criacao Workflow para Squad | Workflows precisam de agentes completos para funcionar. Este doc garante que agentes estejam no nivel certo |
| 25/26/27 - Orquestracao e Runtime | Agentes Nivel 3 funcionam melhor com spawn real (engine mode) porque sao deterministicos |
| 30 - Design Squad Case Study | Case study real. Este doc extrai as regras universais aplicaveis a qualquer squad |

---

## Aplicacao Pratica: Checklist Pre-Publicacao

Antes de considerar qualquer agente "pronto", rode esta checklist:

### Blocking (VETO se falhar)

- [ ] Todos os 5 componentes inline estao presentes (Identity, Thinking, Voice, Examples, Loader)
- [ ] Cada comando operacional tem task file correspondente
- [ ] Command loader mapeia TODOS os comandos com external files
- [ ] Pelo menos 3 output examples completos (input → output)
- [ ] Pelo menos 1 checklist com veto conditions blocking
- [ ] CRITICAL_LOADER_RULE esta presente no agente
- [ ] Dependencies listam todos os arquivos referenciados no command_loader

### Non-blocking (WARNING se falhar)

- [ ] Templates de output para cada tipo de resultado
- [ ] Data files de referencia
- [ ] Self-awareness section
- [ ] Command visibility metadata ([full, quick, key])
- [ ] Auto-triggers definidos
- [ ] Workflow YAML integration
- [ ] Score de maturidade >= 7.0

### Teste Final (Pedro Valerio Test)

> "Se eu der esse agente para uma LLM diferente (Gemini, GPT, Llama), sem contexto previo, ela consegue executar os comandos de forma identica?"

- Se SIM → Agente esta 100% replicavel
- Se NAO → Falta determinismo. Revise tasks e command_loader.

---

*Documento gerado pela autoanalise do agente Pedro Valerio, aplicando o framework "Impossibilitar Caminhos" na propria arquitetura de agentes AIOS.*
*"A melhor coisa e impossibilitar caminhos. Inclusive os meus."*
