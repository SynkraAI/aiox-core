# Referência de Comandos

> **Documento de referência.** Consulte quando precisar saber como usar um comando.
>
> **Primeira vez?** Comece por [POR-ONDE-COMECAR.md](./POR-ONDE-COMECAR.md).

---

## Comandos de Criação

### `*create-squad`

Cria um squad completo através do workflow guiado.

```bash
*create-squad

# Ou especificando domínio direto
*create-squad copywriting
*create-squad legal --mode quality
```

**Parâmetros:**
| Param | Descrição | Default |
|-------|-----------|---------|
| `domain` | Área do squad | (pergunta) |
| `--mode` | yolo, quality, hybrid | yolo |
| `--materials` | Path para materiais | (nenhum) |

**Fluxo:**
1. Pre-flight (escolha de modo)
2. Research (3-5 iterações)
3. Aprovar minds
4. Clone + Create agents
5. Validação + Dashboard

---

### `*create-agent`

Cria um agent individual para um squad existente.

```bash
*create-agent {agent-name} --squad {squad-name}
*create-agent {agent-name} --squad {squad-name} --tier 1
```

**Parâmetros:**
| Param | Descrição | Default |
|-------|-----------|---------|
| `name` | Nome do agent (kebab-case) | (obrigatório) |
| `--squad` | Squad de destino | (obrigatório) |
| `--tier` | 0, 1, 2, 3, orchestrator | (pergunta) |
| `--based-on` | Mind para clonar | (nenhum) |

**Nota:** Se `--based-on` especificado, roda `*clone-mind` primeiro.

---

### `*create-workflow`

Cria workflow multi-fase (preferido sobre tasks standalone).

```bash
*create-workflow high-ticket-copy --squad copy
```

**Quando usar:**
- Operação tem 3+ fases
- Múltiplos agents envolvidos
- Precisa checkpoints entre fases

---

### `*create-task`

Cria task atômica (quando workflow é overkill).

```bash
*create-task write-headline --squad copy
```

**Quando usar:**
- Operação single-session
- Um agent só é suficiente
- Não precisa checkpoints

---

### `*create-template`

Cria template de output para squad.

```bash
*create-template sales-page-tmpl --squad copy
```

---

## Comandos de Mind Cloning

### `*clone-mind`

Executa clonagem completa (Voice + Thinking DNA).

```bash
*clone-mind "Gary Halbert" --domain copywriting
*clone-mind "Dan Kennedy" --domain marketing --focus voice
```

**Parâmetros:**
| Param | Descrição | Default |
|-------|-----------|---------|
| `name` | Nome do expert | (obrigatório) |
| `--domain` | Área de expertise | (obrigatório) |
| `--focus` | voice, thinking, both | both |
| `--sources` | Path para materiais | (nenhum) |
| `--auto-acquire` | true, false | true |

**Output:**
```
squads/mind-cloning/minds/{slug}/
├── sources_inventory.yaml
├── voice_dna.yaml
├── thinking_dna.yaml
├── mind_dna_complete.yaml
├── smoke_test_result.yaml
└── quality_dashboard.md
```

---

### `*extract-voice-dna`

Extrai apenas Voice DNA (comunicação/escrita).

```bash
*extract-voice-dna "Gary Halbert" --sources ./materials/
```

**O que extrai:**
- Power words
- Signature phrases
- Stories/anecdotes
- Writing style
- Tone dimensions
- Anti-patterns
- Immune system

---

### `*extract-thinking-dna`

Extrai apenas Thinking DNA (frameworks/decisões).

```bash
*extract-thinking-dna "Dan Kennedy" --sources ./materials/
```

**O que extrai:**
- Recognition patterns
- Primary framework
- Secondary frameworks
- Heuristics
- Decision architecture
- Objection handling
- Handoff triggers

---

### `*update-mind`

Atualiza mind existente com novas fontes (brownfield).

```bash
*update-mind gary_halbert --sources ./new-materials/
*update-mind dan_kennedy --focus thinking
```

**Parâmetros:**
| Param | Descrição | Default |
|-------|-----------|---------|
| `slug` | Slug do mind existente | (obrigatório) |
| `--sources` | Path para novas fontes | (nenhum) |
| `--focus` | voice, thinking, both | both |
| `--mode` | merge, replace, selective | merge |

**Output:**
- DNA atualizado
- Diff report do que mudou
- Quality impact

---

### `*auto-acquire-sources`

Busca fontes automaticamente na web.

```bash
*auto-acquire-sources "Gary Halbert" --domain copywriting
```

**O que busca:**
- YouTube transcripts
- Book summaries
- Podcast appearances
- Articles/blogs

---

## Comandos de Validação

### `*validate-squad`

Valida squad inteiro com análise por componente.

```bash
*validate-squad copy
*validate-squad legal --verbose
```

**Valida:**
- Estrutura de diretórios
- Todos os agents
- Workflows e tasks
- Templates e checklists
- Quality scores

---

### `*validate-agent`

Valida agent individual contra AIOS 6-level structure.

```bash
*validate-agent squads/{squad-name}/agents/{agent-name}.md
```

**Critérios:**
- Lines >= 300
- voice_dna presente
- output_examples >= 3
- anti_patterns definidos
- completion_criteria

---

### `*validate-task`

Valida task contra Task Anatomy (8 campos).

```bash
*validate-task squads/{squad-name}/tasks/{task-name}.md
```

---

### `*validate-workflow`

Valida workflow (fases, checkpoints).

```bash
*validate-workflow squads/{squad-name}/workflows/{workflow-name}.yaml
```

---

### `*quality-dashboard`

Gera dashboard de qualidade para mind ou squad.

```bash
*quality-dashboard gary_halbert
*quality-dashboard copy
```

**Métricas:**
- Sources count & tier ratio
- Voice score
- Thinking score
- Fidelity estimate
- Gaps & recommendations

---

## Comandos de Especialistas

### `@oalanicolas` - Mind Cloning Specialist

Ativa o especialista em clonagem de mentes (DNA Mental™ 8-Layer).

```bash
# Dentro do squad-creator
@oalanicolas

# Ou diretamente
/squad-creator @oalanicolas
```

**Comandos exclusivos:**
| Comando | Descrição |
|---------|-----------|
| `*extract-dna` | Extrai Voice + Thinking DNA de um mind |
| `*assess-sources` | Avalia qualidade das fontes (ouro vs bronze) |
| `*design-clone` | Desenha arquitetura de clone |
| `*validate-clone` | Valida fidelidade do clone |
| `*diagnose-clone` | Diagnostica problemas de fidelidade |

**Quando usar:**
- Extração de DNA (voice, thinking)
- Curadoria de fontes
- Validação de fidelidade
- Problemas de autenticidade do clone

---

### `@pedro-valerio` - Process Specialist

Ativa o especialista em processos, tarefas e checklists.

```bash
# Dentro do squad-creator
@pedro-valerio

# Ou diretamente
/squad-creator @pedro-valerio
```

**Comandos exclusivos:**
| Comando | Descrição |
|---------|-----------|
| `*audit` | Audita workflows/tasks |
| `*design-heuristic` | Desenha heurística de decisão |
| `*find-automation` | Identifica oportunidades de automação |
| `*gap-analysis` | Análise de gaps em processos |
| `*veto-check` | Define condições de veto |

**Quando usar:**
- Design de workflows
- Criação de checklists
- Definição de veto conditions
- Automação de processos
- Validação de tasks

---

### Specialist Selection

```
┌─────────────────────────────────────────────────────────────────┐
│                 QUANDO USAR CADA ESPECIALISTA                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Preciso extrair DNA de um expert"                             │
│  → @oalanicolas                                                 │
│                                                                 │
│  "As fontes estão boas?"                                        │
│  → @oalanicolas                                                 │
│                                                                 │
│  "Clone não está autêntico"                                     │
│  → @oalanicolas                                                 │
│                                                                 │
│  "Preciso criar um workflow"                                    │
│  → @pedro-valerio                                               │
│                                                                 │
│  "Quero adicionar veto conditions"                              │
│  → @pedro-valerio                                               │
│                                                                 │
│  "Checklist está completo?"                                     │
│  → @pedro-valerio                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comandos de Tool Discovery

### `*discover-tools`

Pesquisa MCPs, APIs, CLIs, Libraries e GitHub projects para um domínio.

```bash
*discover-tools {domain}
*discover-tools squad-creator
*discover-tools copywriting
```

**O que pesquisa:**
- MCP Servers (Model Context Protocol)
- APIs REST/GraphQL
- CLI tools
- Libraries (Python, Node)
- GitHub projects

**Output:**
- Matriz de priorização (Impacto vs Esforço)
- Quick wins identificados
- Plano de integração

**Documentação:** Ver [TOOL-RECOMMENDATIONS.md](./TOOL-RECOMMENDATIONS.md)

---

### `*show-tools`

Exibe o registro global de ferramentas (instaladas e recomendadas).

```bash
*show-tools
```

**Mostra:**
- Ferramentas instaladas
- Ferramentas recomendadas por prioridade
- Capabilities disponíveis

---

### `*add-tool`

Adiciona ferramenta descoberta às dependências do squad.

```bash
*add-tool mcp-youtube-transcript
*add-tool firecrawl-mcp
```

**Nota:** Delegado para @devops para instalação real no `.mcp.json`.

---

## Comandos Utilitários

### `*list-squads`

Lista todos os squads criados.

```bash
*list-squads
```

**Output:**
```
┌──────────┬─────────────┬────────┬───────────┐
│ Squad    │ Agents      │ Score  │ Status    │
├──────────┼─────────────┼────────┼───────────┤
│ copy     │ 6           │ 8.2    │ ✅ Active │
│ legal    │ 4           │ 7.8    │ ✅ Active │
│ data     │ 3           │ 6.5    │ ⚠️ Draft  │
└──────────┴─────────────┴────────┴───────────┘
```

---

### `*show-registry`

Mostra registro de squads (existentes, padrões, gaps).

```bash
*show-registry
```

---

### `*squad-analytics`

Dashboard detalhado de analytics por squad.

```bash
*squad-analytics
*squad-analytics copy
```

**Mostra:**
- Agents por tier
- Tasks por tipo
- Workflows
- Templates
- Checklists
- Usage stats

---

### `*refresh-registry`

Escaneia squads/ e atualiza registro.

```bash
*refresh-registry
```

**Quando usar:**
- Após criar squad manualmente
- Após mover/renomear squads
- Sincronizar estado

---

### `*help`

Mostra lista de comandos disponíveis.

```bash
*help
```

---

### `*exit`

Desativa o Squad Architect.

```bash
*exit
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMANDOS MAIS USADOS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CRIAR                                                          │
│  *create-squad {domain}     Criar squad completo               │
│  *clone-mind {name}         Clonar expert específico           │
│                                                                 │
│  VALIDAR                                                        │
│  *validate-squad {name}     Validar squad existente            │
│  *quality-dashboard {name}  Ver métricas de qualidade          │
│                                                                 │
│  GERENCIAR                                                      │
│  *list-squads               Ver squads disponíveis             │
│  *refresh-registry          Atualizar registro                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Squad Architect | Commands Reference v1.0**
