# Guia de Inicio Rapido

Coloque o Navigator rodando em menos de 5 minutos.

---

## Passo 1: Health Check (30 segundos)

```bash
@navigator
*navigator-doctor
```

Todos os 7 checks devem passar. Se não, veja [INSTALL.md](./INSTALL.md).

---

## Passo 2: Escolha Seu Caminho

### Caminho A — Projeto Novo

Começando do zero? Mapeie seu projeto:

```bash
*map-project
```

Navigator vai te pedir pra descrever seu projeto em texto simples:

```
> SaaS de gerenciamento de tarefas com Kanban board, colaboração em tempo real,
  e analytics de time. Frontend Next.js, backend Supabase.
```

Navigator vai:
1. Analisar entidades, workflows e complexidade
2. Fazer 3-5 perguntas de esclarecimento (stack, integrações, timeline)
3. Gerar um roadmap de 10 fases
4. Salvar em `.aios/navigator/{project}/roadmap.md`

**Depois comece a navegar:**

```bash
*auto-navigate
# → "Phase 1 (Research) — Ativar @analyst com *brainstorm"
```

---

### Caminho B — Projeto Existente

Já tem código? Detecte onde você está:

```bash
*where-am-i
```

Navigator escaneia seu file system e mostra:

```
📍 Phase 7 — Development (42% completo)

✅ Feito: Research, PRD, Architecture, Epics, Stories, Validation
🔄 Ativo: Story 7.3 (auth middleware) — @dev
⏳ Pendente: QA, Fix Loop, Deploy

Próximo: Continuar Story 7.3 → @dev *develop
```

**Depois continue:**

```bash
*auto-navigate
# → Ativa o agente certo para sua fase atual
```

---

## Passo 3: Workflow Diario

Uma vez mapeado, seu ciclo diário é:

```bash
# 1. Checar onde você está
*where-am-i

# 2. Navegar para próximo passo
*auto-navigate

# 3. Trabalhar com o agente delegado
@dev  # ou qualquer agente que Navigator sugerir

# 4. Repetir
```

Navigator atualiza o roadmap automaticamente via git hooks.

---

## Passo 4: Rastrear Progresso

### Status rápido

```bash
*where-am-i
```

### Report detalhado

```bash
*status-report
```

Gera um report markdown com:
- Percentuais de conclusão de fase
- Stories ativas e completadas
- Blockers e riscos
- Métricas de velocidade

### Criar um checkpoint

```bash
*checkpoint
```

Salva um snapshot antes de operações arriscadas. Restaure depois com `*resume-project`.

---

## Comandos Comuns

| Comando | Quando usar |
|---------|-------------|
| `*map-project` | Começando um projeto novo |
| `*where-am-i` | Check diário / depois de um intervalo |
| `*auto-navigate` | Avançar para próxima fase |
| `*checkpoint` | Antes de mudanças grandes |
| `*status-report` | Reuniões de time |
| `*orchestrate {epic}` | Epics grandes (8+ stories) |
| `*navigator-doctor` | Debugging |

---

## Dicas

1. **Rode `*where-am-i` toda manhã** — faça esse ser seu primeiro comando
2. **Crie checkpoints antes de intervalos** — nunca perca contexto
3. **Use `*orchestrate` para epics grandes** — paralelizar em 4 chats
4. **Habilite git hooks** — atualizações automáticas de roadmap a cada commit
5. **Compartilhe roadmaps com seu time** — a cópia local `docs/roadmap.md` é gitignore-friendly

---

## Proximos Passos

- [Examples](./examples/) — Veja Navigator em ação com cenários reais
- [FAQ](./FAQ.md) — Mais de 40 perguntas respondidas
- [Full README](./README.md) — Arquitetura, diagramas e detalhes profundos

---

**Pronto?**

```bash
@navigator
*map-project
```

Boa navegação! 🧭
