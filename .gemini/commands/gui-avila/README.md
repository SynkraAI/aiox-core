# Squad Gui Ávila

Mind clone de **Guilherme Ávila (Gui Ávila)** — ilusionista profissional (22 anos), economista comportamental, co-fundador e CEO do Ensinio, educador de automação e no-code.

**Fidelity:** Elite 91% | Voice: 9/10 | Thinking: 9/9 | Smoke Tests: 3/3 PASS (9.0 avg)

---

## Quick Start

```bash
# Ativar via slash command
/gui-avila

# Ou usar alias
/gui
```

O agente vai cumprimentar e mostrar os comandos disponíveis. Basta escolher o que precisa.

---

## Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `*automation-diagnostic` | Diagnosticar gargalos e prescrever automações | Passo >10h/semana em tarefas manuais |
| `*clickup-setup` | Organizar vida e projetos no ClickUp | Quero me organizar mas tá tudo bagunça |
| `*chatbot-setup` | Criar agente IA no WhatsApp/Instagram | Perco tempo respondendo leads |
| `*ensinio-setup` | Montar escola online (white-label) | Quero monetizar meu conhecimento |
| `*automation-blueprint` | Desenhar sistema completo de automação | Preciso de visão sistêmica do negócio |
| `*help` | Ver todos os comandos | |
| `*exit` | Sair do modo Gui Ávila | |

---

## Architecture

```
Squad: gui-avila
├── agents/
│   └── gui-avila.md          # Agent T0 (diagnóstico + execução)
├── tasks/
│   ├── automation-diagnostic.md
│   ├── clickup-setup.md
│   ├── chatbot-setup.md
│   ├── ensinio-setup.md
│   └── automation-blueprint.md
├── checklists/
│   └── automation-quality-checklist.md
├── workflows/
│   └── wf-automation-consulting.yaml   # Pipeline: diagnóstico → blueprint → implementação
├── templates/
│   ├── diagnostic-report-tmpl.md       # Template de relatório de diagnóstico
│   └── automation-blueprint-tmpl.md    # Template de blueprint de automação
├── data/
│   └── dna/                   # Mind DNA extraído
│       ├── mind_dna_complete.yaml
│       ├── voice_dna.yaml
│       ├── thinking_dna.yaml
│       ├── sources_inventory.yaml
│       ├── smoke_test_result.yaml
│       ├── quality_dashboard.md
│       └── [extraction files]
├── config.yaml
└── README.md
```

**Tipo:** Expert (mind clone de pessoa real)
**Entry Agent:** gui-avila (T0 — único agent, faz diagnóstico e execução)

---

## Core Frameworks

| Framework | Use |
|-----------|-----|
| **Sistemas Reversos** | Efeito antes do método — definir resultado antes de escolher ferramenta |
| **4 Níveis de Entrega** | Monetizar mesmo conhecimento em 4 faixas (grátis → R$30K+) |
| **Anatomia do Número** | 4 componentes de qualquer entrega (Método, Efeito, Apresentação, Estrutura) |
| **Pirâmide Mágica** | Hierarquia: Personagem > Efeito > Método > Apresentação |
| **3x3 YouTube** | Estrutura de vídeo: Intro[3] + Corpo[3] + Conclusão[3] |
| **Persuasion Toolkit** | 101 técnicas do livro Shortcuts (top 10 mapeadas) |

---

## Tool Stack

**Primary:** ClickUp, Make.com, ManyChat, Ensinio
**Secondary:** Go High Level, n8n, TLDV, Whimsical, ActiveCampaign, Tally

---

## DNA Sources

- **145 fontes** (112 YouTube + 2 livros + LinkedIn + Blog + Landing Pages + Depoimentos)
- **769.563 palavras** analisadas (591K transcripts + 178K livros)
- Livros: "A Arte Mágica" (2012), "Shortcuts — Aperte os Gatilhos" (2019)

---

## Collaboration

| Need | Agent |
|------|-------|
| Copy de vendas / VSL | `@copywriting-squad` |
| Plano de conteúdo semanal | `@content-engine` |
| Palestras e storytelling | `@luiz-fosc` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-03-07 | Workflow, templates, validation score 9.0+ |
| 1.3.0 | 2026-03-07 | Tasks, checklist, README, entry_agent field |
| 1.2.0 | 2026-03-07 | Voice DNA enrichment, social extraction |
| 1.1.0 | 2026-03-07 | Thinking DNA, book extractions |
| 1.0.0 | 2026-03-07 | Initial mind clone with Voice + Thinking DNA |

---

*AIOS Squad — Gui Ávila Mind Clone v1.4.0*
