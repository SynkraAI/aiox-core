# Navigator Examples

Este diretorio contem exemplos praticos demonstrando como usar o Navigator em diferentes cenarios.

---

## Navegacao Rapida

| Exemplo | Cenario | Complexidade | Tempo de Leitura |
|---------|---------|--------------|------------------|
| [Exemplo 1](#exemplo-1-novo-app-fullstack) | Setup de projeto novo | Iniciante | 10 min |
| [Exemplo 2](#exemplo-2-retomar-projeto-brownfield) | Retomar apos pausa | Intermediario | 8 min |
| [Exemplo 3](#exemplo-3-orquestracao-de-epic-multi-chat) | Execucao paralela | Avancado | 15 min |
| [Exemplo Roadmap](#exemplo-roadmap) | Estrutura de roadmap | Referencia | 5 min |
| [Exemplo Checkpoint](#exemplo-checkpoint) | Formato de checkpoint | Referencia | 3 min |

---

## Exemplo 1: Novo App Fullstack

**Arquivo:** [example-1-new-fullstack-app.md](./example-1-new-fullstack-app.md)

**Cenario:** Comecar uma nova plataforma de e-commerce do zero

**O que voce vai aprender:**
- Como mapear um novo projeto com `*map-project`
- Revisar roadmaps gerados
- Navegar pelas 10 fases
- Criar checkpoints manualmente
- Acompanhar progresso com `*status-report`
- Fazer deploy para producao

**Comandos Principais:**
```bash
@navigator
*map-project
*where-am-i
*auto-navigate
*checkpoint
*status-report
```

**Use quando:**
- Comecar um novo projeto
- Precisar de um roadmap completo
- Quiser seguir a metodologia AIOS
- Desenvolvedor solo ou time pequeno

---

## Exemplo 2: Retomar Projeto Brownfield

**Arquivo:** [example-2-resume-brownfield.md](./example-2-resume-brownfield.md)

**Cenario:** Voltar a um projeto existente depois de 2 semanas de ferias

**O que voce vai aprender:**
- Detectar a fase atual instantaneamente
- Ver stories ativas e completas
- Identificar blockers automaticamente
- Revisar historico de checkpoints
- Retomar desenvolvimento sem perder tempo

**Comandos Principais:**
```bash
@navigator
*where-am-i
*checkpoint --list
*status-report --detailed
```

**Use quando:**
- Perdeu o contexto (ferias, fim de semana, troca de contexto)
- Trabalhando em multiplos projetos
- Precisar de um overview rapido do status
- Onboarding em projeto existente

**Tempo Economizado:** ~45 minutos vs recuperacao manual de contexto

---

## Exemplo 3: Orquestracao de Epic Multi-Chat

**Arquivo:** [example-3-multi-chat-epic.md](./example-3-multi-chat-epic.md)

**Cenario:** Executar epic de 12 stories em paralelo em 4 chats do Claude Code

**O que voce vai aprender:**
- Analisar dependencias de stories
- Dividir trabalho em waves (grupos de dependencia)
- Gerar prompts para multiplos chats
- Coordenar execucao paralela
- Fazer merge de trabalho de multiplos chats

**Comandos Principais:**
```bash
@navigator
*orchestrate epic-3.2
```

**Use quando:**
- Epics grandes (8+ stories)
- Quiser economizar tempo (50% mais rapido)
- Stories tem dependencias claras
- Confortavel com git branching

**Tempo Economizado:** 16 horas em um epic de 36 horas

---

## Exemplo Roadmap (Anotado)

**Arquivo:** [example-roadmap.md](./example-roadmap.md)

**Proposito:** Entender estrutura e sintaxe de roadmap

**O que voce vai aprender:**
- Formato YAML de front-matter
- Definicoes de fase (inputs, outputs, agents)
- Regras de transicao (auto-advance, blocked, loop)
- Configuracao de checkpoint
- Metadata e estimativas

**Use como:**
- Template para seus proprios roadmaps
- Referencia ao customizar pipelines
- Ferramenta de aprendizado para anatomia de roadmap

**Destaques:**
- Exemplo completo de 10 fases
- Comentarios inline explicando cada campo
- Melhores praticas para padroes glob
- Exemplos de logica de transicao

---

## Exemplo Checkpoint (JSON)

**Arquivo:** [example-checkpoint.json](./example-checkpoint.json)

**Proposito:** Entender estrutura de dados de checkpoint

**O que voce vai ver:**
- Metadata de checkpoint (ID, timestamp, type)
- Informacao de fase e % de conclusao
- Detalhes de commit git
- Status de stories (completas, em progresso, pendentes)
- Metricas (velocity, estatisticas de codigo, time tracking)
- Informacoes de ambiente

**Use como:**
- Referencia para formato de checkpoint
- Entender o que o Navigator rastreia
- Debug de problemas de checkpoint
- Construir tooling customizado

**Campos Principais:**
```json
{
  "checkpointId": "cp-{phase}-{type}-{timestamp}",
  "phase": { "id": 7, "completion": 67 },
  "stories": { "completed": 30, "inProgress": 3, "pending": 12 },
  "git": { "commit": "...", "branch": "..." },
  "metrics": { "velocity": {...}, "codeStats": {...} }
}
```

---

## Caminho de Aprendizado

### Iniciante (Novo no Navigator)
1. Ler [Exemplo 1](./example-1-new-fullstack-app.md) - Workflow completo
2. Ler [Exemplo Roadmap](./example-roadmap.md) - Entender estrutura
3. Testar Navigator em um projeto pequeno

### Intermediario (Ja usou Navigator antes)
1. Ler [Exemplo 2](./example-2-resume-brownfield.md) - Recuperacao de contexto
2. Praticar `*where-am-i` diariamente
3. Configurar checkpoints automaticos

### Avancado (Power User)
1. Ler [Exemplo 3](./example-3-multi-chat-epic.md) - Execucao paralela
2. Customizar pipelines para seu stack
3. Criar templates de roadmap reutilizaveis

---

## Projetos de Exemplo

Todos os exemplos referenciam projetos realistas:

| Projeto | Tipo | Tech Stack | Stories |
|---------|------|------------|---------|
| E-commerce Platform | Greenfield | Next.js + Node.js | 34 |
| CRM System | Brownfield | React + Express | 45 |
| SaaS Analytics Dashboard | Feature Epic | Next.js + PostgreSQL | 12 |
| Task Management SaaS | Template | Next.js + Prisma | 45 |

---

## Padroes Comuns

### Padrao 1: Comecar Novo Projeto
```bash
@navigator
*map-project
# Descrever projeto
*show-roadmap
# Revisar e customizar
*auto-navigate
# Seguir delegacoes
```

### Padrao 2: Checar Status
```bash
@navigator
*where-am-i
# Ver fase atual, stories, blockers
```

### Padrao 3: Criar Checkpoint
```bash
@navigator
*checkpoint
# Snapshot manual antes de mudancas grandes
```

### Padrao 4: Gerar Relatorio
```bash
@navigator
*status-report --detailed
# Compartilhar com time ou stakeholders
```

### Padrao 5: Orquestrar Epic
```bash
@navigator
*orchestrate epic-{id}
# Pegar prompts para chats paralelos
```

---

## Dicas & Truques

### Dica 1: Ritual Diario
Rode `*where-am-i` toda manha para comecar com contexto:
```bash
@navigator
*where-am-i
```

### Dica 2: Antes de Pausa Longa
Crie checkpoint manual antes de ferias:
```bash
@navigator
*checkpoint
# Adicionar descricao do estado atual
```

### Dica 3: Relatorios Semanais
Gere status report para reunioes de time:
```bash
@navigator
*status-report --format markdown > weekly-report.md
```

### Dica 4: Pipelines Customizados
Copie `example-roadmap.md` e adapte para seu tech stack:
```bash
cp squads/navigator/examples/example-roadmap.md .aios/navigator/my-project/roadmap.md
# Editar fases, agents, outputs para seu projeto
```

### Dica 5: Integracao Git
Habilite auto-checkpoints via git hooks:
```bash
node squads/navigator/scripts/install-hooks.js install
# Checkpoints criados automaticamente apos commits
```

---

## Troubleshooting Examples

### "Onde estou travado?"
```bash
@navigator
*where-am-i
# Checar secao "Blockers"
```

### "Por que a fase nao avanca?"
```bash
# Verificar se todos outputs existem
ls docs/stories/story-*.md
# Comparar com lista de outputs do roadmap
```

### "Como pular uma fase?"
```bash
# Editar roadmap.md, mudar next_phase
# Ou usar regras de transicao para pular condicionalmente
```

### "Posso voltar para fase anterior?"
```bash
# Carregar checkpoint daquela fase
@navigator
*checkpoint --list
*checkpoint --restore cp-5-manual-20260201-100000
```

---

## Contribuindo Exemplos

Tem um otimo exemplo de Navigator? Contribua!

1. Criar novo arquivo: `example-N-your-scenario.md`
2. Seguir formato existente (Context → Steps → Results → Takeaways)
3. Incluir detalhes realistas do projeto
4. Adicionar ao indice deste README
5. Submeter PR para aios-core

---

## Recursos Adicionais

- **README Principal:** [../README.md](../README.md) - Documentacao completa do Navigator
- **Squad Manifest:** [../squad.yaml](../squad.yaml) - Configuracao do squad
- **Workflows:** [../workflows/](../workflows/) - Workflows YAML multi-step
- **Checklists:** [../checklists/](../checklists/) - Checklists de validacao

---

**Navigator Examples** - Aprender fazendo 🧭

*Last updated: 2026-02-15*
