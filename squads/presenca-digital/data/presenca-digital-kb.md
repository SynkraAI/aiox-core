# Knowledge Base — Squad presenca-digital

Documento de onboarding e referência rápida para qualquer agente ou humano que interaja com este squad.

---

## O que este squad faz

O squad `presenca-digital` é responsável por **criar conteúdo** para múltiplas plataformas digitais. Ele opera na segunda camada da arquitetura de 3 squads:

```
branding (fundação, 1x) → presenca-digital (criação, semanal) → growth-ops (operação, contínuo — futuro)
```

**O squad cria. Não publica.** A publicação é responsabilidade do futuro squad `growth-ops`.

**Inputs:** brand guidelines, posicionamento, pilares de conteúdo (vêm do squad `branding`)
**Outputs:** posts, carrosséis, roteiros de vídeo, scripts de reels, artigos, newsletters, campanhas

---

## Agentes (9)

| Agente | Tier | Especialidade Principal |
|--------|------|------------------------|
| `chief` | — | Orquestração, roteamento, qualidade final |
| `paulo-cuenca` | T0 | Estratégia de conteúdo, pilares, calendário |
| `justin-welsh` | T1 | LinkedIn growth, conteúdo para criadores solo |
| `ross-simmonds` | T1 | Distribuição, repurposing estratégico, SEO de conteúdo |
| `natanael-oliveira` | T1 | Roteiros de vídeo em português, estrutura Chicote |
| `brendan-kane` | T1 | Hook engineering, padrão de 3 segundos |
| `nicolas-cole` | T2 | Long-form LinkedIn, storytelling profissional |
| `camilo-coutinho` | T2 | Conteúdo para empreendedores brasileiros, Instagram |
| `vanessa-lau` | T2 | Multi-plataforma, repurposing, conteúdo para criadores |

**Hierarquia de ativação:**
- T0 (paulo-cuenca) define a estratégia e o calendário
- T1 (justin-welsh, ross-simmonds, natanael-oliveira, brendan-kane) criam conteúdo especializado
- T2 (nicolas-cole, camilo-coutinho, vanessa-lau) executam formatos específicos
- `chief` orquestra e valida antes de entregar

---

## Frameworks Utilizados

| Framework | Origem | Aplicação |
|-----------|--------|-----------|
| Hook Point (3s test) | Brendan Kane | Todo conteúdo — validação de hooks |
| Chicote | Natanael Oliveira | Roteiros de vídeo curto em pt-BR |
| CEQCOM | Storytelling estruturado | Roteiros longos e posts de profundidade |
| Pillar Content System | Ross Simmonds | Distribuição de 1 peça em múltiplos formatos |
| Content Flywheel | Justin Welsh | Crescimento orgânico LinkedIn |
| PSP (Problema-Solução-Prova) | Nicolas Cole | Long-form LinkedIn e artigos |

---

## Como Ativar

### Ativar o squad chief
```
@presenca-digital/chief
```

### Ativar um agente específico
```
@presenca-digital/paulo-cuenca
@presenca-digital/nicolas-cole
@presenca-digital/vanessa-lau
```

### Fluxo recomendado para um batch semanal
1. `@paulo-cuenca` — define pilares e calendário da semana
2. `@chief` — roteia para os agentes corretos por plataforma
3. Agentes T1/T2 — criam as peças
4. `@chief` — aplica checklists de qualidade
5. Entrega para revisão humana ou squad growth-ops

---

## Integração com o Squad Branding (Upstream)

O squad presenca-digital **consome** os seguintes artefatos do squad `branding`:

| Artefato | Localização | Como Usar |
|----------|-------------|-----------|
| Brand Voice Guidelines | `squads/branding/data/brand-voice-guidelines.md` | Tom de voz de todo conteúdo |
| Brand Book | `squads/branding/data/brand-book.md` | Identidade visual e verbal |
| Positioning Statement | `squads/branding/data/positioning-statement.md` | Mensagem central de todas as peças |
| Pilares de Conteúdo | `squads/branding/data/` | Temas estratégicos do calendário |

**Regra crítica:** Nenhum agente do presenca-digital pode inventar guidelines de brand. Se o artefato não existe no squad branding, escalar para o usuário antes de prosseguir.

---

## Estrutura de Arquivos

```
squads/presenca-digital/
├── agents/           # 9 agents YAML
├── checklists/       # 6 checklists de qualidade
│   ├── content-quality-checklist.md
│   ├── platform-specs-checklist.md
│   ├── brand-coherence-checklist.md
│   ├── hook-quality-checklist.md
│   ├── video-script-checklist.md
│   └── smoke-tests.md
├── data/             # Dados e referências
│   ├── content-formats-guide.md
│   ├── hashtag-strategy.md
│   ├── hook-patterns-library.md
│   ├── platform-specs.md
│   └── presenca-digital-kb.md  ← este arquivo
├── tasks/            # Tasks executáveis (a criar)
├── workflows/        # Workflows (a criar)
└── squad.yaml        # Definição do squad
```

---

## Limites e Fronteiras

| O squad FAZ | O squad NÃO FAZ |
|-------------|-----------------|
| Cria conteúdo em múltiplos formatos | Publica conteúdo em plataformas |
| Adapta conteúdo por plataforma | Define identidade de marca (papel do branding) |
| Sugere calendário editorial | Aprova estratégia de negócios |
| Aplica checklists de qualidade | Gerencia anúncios pagos |
| Faz repurposing de conteúdo | Monitora métricas de performance |

---

## Status do Squad

- **Fase atual:** PHASE 4 — Integration (tasks, workflows, templates, checklists)
- **Commit de criação:** `a2834e4`
- **Upstream:** squad `branding`
- **Downstream:** squad `growth-ops` (futuro)
