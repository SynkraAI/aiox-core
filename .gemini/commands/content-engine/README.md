# Content Engine v2 — START HERE

Sistema unificado de 20 agentes especializados em estrategia, copywriting, debate e validacao de conteudo. 3 camadas: Estrategia, Producao e Qualidade.

---

## Quick Start

| O que voce quer fazer? | Workflow | Tempo estimado |
|------------------------|----------|----------------|
| Criar um carrossel Instagram | `workflows/carousel-creation.md` | ~1-2h |
| Criar um post ou peca de conteudo | `workflows/content-piece.md` | ~30-45min |
| Transformar newsletter em posts sociais | `workflows/newsletter-to-social.md` | ~2-3h |

---

## Arquitetura: 3 Camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTENT ENGINE v2                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CAMADA 1 — ESTRATEGIA (planejar)                                  │
│  ┌───────────────┐ ┌──────────────────┐ ┌────────────────┐         │
│  │ @caleb-ralston │ │ @eugene-schwartz │ │ @dan-koe       │         │
│  │ Brand Journey  │ │ 5 Levels of     │ │ Art of Focus   │         │
│  │ Accordion      │ │ Awareness       │ │ Content Phil.  │         │
│  └───────────────┘ └──────────────────┘ └────────────────┘         │
│                                                                     │
│  CAMADA 2 — PRODUCAO (criar com debate)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ @nicolas-cole │ │ @alex-hormozi│ │ @george-     │               │
│  │ Atomic Essays │ │ Hook-Retain- │ │  blackman    │               │
│  │ Headline Eng. │ │ Reward       │ │ YTSP Scripts │               │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤               │
│  │ @joanna-wiebe│ │ @stefan-     │ │ @justin-welsh│               │
│  │ Conversion   │ │  georgi      │ │ ContentOS    │               │
│  │ Copy         │ │ RMBC / VSL   │ │ Repurposing  │               │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤               │
│  │ @vanessa-lau │ │ @gary-       │ │ @dan-kennedy │               │
│  │ ANC Funnel   │ │  vaynerchuk  │ │ Direct       │               │
│  │ 9 Pillars    │ │ Day Trading  │ │ Response     │               │
│  ├──────────────┤ │ Attention    │ ├──────────────┤               │
│  │ @gary-halbert│ ├──────────────┤ │ @david-ogilvy│               │
│  │ Sales Letters│ │ @claude-     │ │ Brand Ads    │               │
│  └──────────────┘ │  hopkins     │ └──────────────┘               │
│                   │ Scientific   │                                  │
│                   │ Advertising  │                                  │
│                   └──────────────┘                                  │
│                                                                     │
│  CAMADA 3 — QUALIDADE (validar + desafiar)                         │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐       │
│  │ @devil-advocate   │ │ @oraculo-torriani│ │ @copy-chief  │       │
│  │ Teste Substituicao│ │ Master Validator │ │ Copy QA      │       │
│  │ Teste Dado/Scroll │ │ Score >= 7 ou 10 │ │ Sub-Router   │       │
│  └──────────────────┘ └──────────────────┘ └──────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Workflows

| Workflow | Arquivo | Quando usar | Tempo |
|----------|---------|-------------|-------|
| Debate Session | `workflows/debate-session.md` | Debate estruturado entre agentes (A vs B + devil's advocate + consolidacao) | 30-45min |
| Carousel Creation | `workflows/carousel-creation.md` | Criar carrossel completo para Instagram (com debate) | 1-2h |
| Content Piece | `workflows/content-piece.md` | Produzir 1 peca de conteudo (post, reel, static) com debate se for feed | 30-45min |
| Newsletter to Social | `workflows/newsletter-to-social.md` | Transformar newsletter/Substack em distribuicao social multi-plataforma | 2-3h |
| YouTube to Everything | `workflows/youtube-to-everything.md` | Repurposing de video YouTube para todas as plataformas | 2-3h |
| Weekly Sprint | `workflows/weekly-sprint.md` | Sprint semanal completo: dados, contexto, macro, micro, copy, review (6 fases) | 4-6h |
| Mid-Week Adapt | `workflows/mid-week-adapt.md` | Adaptacao mid-week com analise de metricas + debate rapido + reescrita | 1-2h |

---

## Agentes

| Agente | Camada | Especialidade | Frameworks principais |
|--------|--------|---------------|----------------------|
| @caleb-ralston | 1 - Estrategia | Brand Strategy, Diagnostico | Brand Journey, Accordion Method, 7-Day Sprint |
| @eugene-schwartz | 3 - Qualidade | Diagnostico de Awareness | 5 Levels of Awareness, 5 Levels of Market Sophistication |
| @dan-koe | 1 - Estrategia | Content Philosophy, One-Person Business | Art of Focus, Newsletter-First |
| @alex-hormozi | 1 - Estrategia | Hooks, Leads, Content at Scale | Hook-Retain-Reward, Core Four, Rule of 100 |
| @nicolas-cole | 2 - Producao | Digital Writing, Debate Consolidator | Atomic Essays, Headline Engineering, Rate of Revelation |
| @george-blackman | 2 - Producao | YouTube Scripts | YTSP 5-Phase, Setup-Tension-Payoff |
| @joanna-wiebe | 2 - Producao | Conversion Copy | Voice of Customer, Message Mining |
| @stefan-georgi | 2 - Producao | Long-Form, VSL | RMBC Method, Mechanism Discovery |
| @vanessa-lau | 2 - Producao | Instagram Strategy, Repurposing | ANC Funnel, 9 Content Pillars, 1-to-54 |
| @justin-welsh | 2 - Producao | Content Systems, Solopreneur | ContentOS, LinkedInOS, Content Matrix |
| @gary-vaynerchuk | 1 - Estrategia | Atencao e Distribuicao | Day Trading Attention, Platform-Native |
| @gary-halbert | 2 - Producao | Direct Response, Sales Letters | A-Pile, Starving Crowd, Emotional Hooks |
| @claude-hopkins | 2 - Producao | Scientific Advertising | Preemptive Claims, Reason-Why Copy |
| @dan-kennedy | 2 - Producao | Direct Response Marketing | Direct Response |
| @david-ogilvy | 2 - Producao | Brand Advertising | Brand Advertising |
| @devil-advocate | 3 - Qualidade | Quality Challenger | Teste da Substituicao, Teste do Dado, Teste do Scroll |
| @oraculo-torriani | 3 - Qualidade | Master Validator, QA Guardian | 5 Criterios Inegociaveis, Scoring |
| @copy-chief | 3 - Qualidade | Sub-Router de Copy (vendas/conversao) | Routing especializado |
| @content-engine | Orquestrador | Router principal | Sabe quando usar estrategia vs producao vs qualidade |
| @social-strategist | 2 - Producao | Social Strategy | Estrategia de redes sociais |

---

## Quality Gates

| Gate | Nome | O que valida | Tipo |
|------|------|-------------|------|
| QG-001 | Request Classification | Brief completo: tema + formato + plataforma + ANC definidos | Routing |
| QG-002 | Diagnosis Complete | Diagnostico de awareness + sophistication concluido (Schwartz) | Blocking |
| QG-003 | Debate Complete | Debate completo: 2+ versoes + devil's advocate + consolidacao | Blocking |
| QG-004 | Torriani Validation | Score >= 8/10 (debate) ou >= 7/10 (social direto) | Blocking |
| QG-005 | Output Final | Copy formatada + art direction + render batch prontos | Blocking |

O fluxo obrigatorio para conteudo de feed e: QG-001 -> QG-002 -> QG-003 -> QG-004 -> QG-005. Stories e conteudo rapido podem pular QG-003 (debate).

---

## Exemplos de Invocacao

### Via Slash Command (IDE)

```text
/content-engine:carousel "obesidade mental"
/content-engine:post "clareza vem antes de disciplina"
/content-engine:weekly-sprint
/content-engine:newsletter "decisoes em contextos confusos"
/content-engine:youtube "por que voce nao precisa de mais disciplina"
/content-engine:strategist
```

### Via Squad Chief

```text
*route "quero criar um carrossel sobre obesidade mental"
*carousel "3 erros de quem confunde ocupacao com progresso"
*weekly-sprint
*brand-audit
*attention-audit
```

### Ativacao direta de agente

```text
*agent nicolas-cole → "escreve um post sobre clareza vs disciplina"
*agent alex-hormozi → "cria hooks para o tema obesidade mental"
*agent george-blackman → "roteiro de 10min sobre falso produtivo"
*agent oraculo-torriani → "valida esta copy: [texto]"
*agent devil-advocate → "ataca esta headline: [headline]"
```

---

## Error Handling

### Falhas comuns e como resolver

| Erro | Causa | Resolucao |
|------|-------|-----------|
| Agent nao encontrado | ID incorreto no routing | Verifique `config.yaml` secao `layers` para IDs validos |
| Debate sem consolidacao | Consolidator nao definido | Cada debate precisa de `consolidator` em `config.yaml > debate.agent_pairs` |
| Torriani reprovou 3x | Copy abaixo do threshold | Escalar para decisao humana (Tiago). Ver `debate.limits.escalation` |
| Score Torriani < 7 (social) | Critérios não-negociáveis falharam | Consultar seção Autocorreção do `torriani-master-checklist.md` |
| Score Torriani < 10 (vendas) | Copy de vendas abaixo do padrao | Voltar para debate com correcoes especificas do checklist |
| Quality Gate bloqueado | Gate anterior nao passou | Os gates sao sequenciais: QG-001 → 002 → 003 → 004 → 005. Resolva o gate anterior primeiro |
| Task sem executor | Campo `executor` faltando na task | Adicione `executor: @agent-id` no YAML da task |
| Workflow travado na fase N | Dependencia nao resolvida | Verifique outputs da fase anterior. Cada fase depende dos outputs da anterior |
| Debate em loop infinito | Agents não convergem | Max 2 rounds (`debate.limits.max_rounds`). Após isso, consolidator decide |
| Render falhou (visual-qa) | Chrome headless, fonts, JSON batch | Verifique: Chrome instalado, fonts em `/fonts/`, JSON batch valido |

### Escalacao

1. **Auto-correcao** — Consulte a secao "Auto-Correcao" do checklist relevante
2. **Retry com correcoes** — Aplique as correcoes e rode o gate novamente
3. **Escalacao humana** — Se falhar 3x no mesmo gate, escale para Tiago

---

## Estrutura de Arquivos

```
squads/content-engine/
├── agents/          # 20 agentes (.md cada)
├── checklists/      # Checklists de validacao
├── config.yaml      # Configuracao do squad
├── data/            # Dados e referencias
├── tasks/           # Task definitions
├── templates/       # Templates de conteudo
└── workflows/       # 7 workflows (.md cada)
```
