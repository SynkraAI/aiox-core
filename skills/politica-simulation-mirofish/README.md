# politica-simulation-mirofish

Motor de predição por inteligência de enxame para simulação de opinião pública.

## O que é

Uma AIOS Skill que cria um painel virtual de agentes AI — cada um representando um perfil demográfico e psicográfico distinto do eleitorado brasileiro — e os coloca para deliberar sobre um tema político em múltiplas rodadas.

O agregado dessas opiniões simuladas gera um relatório com:
- Distribuição de sentimento (geral e por segmento)
- Argumentos-chave rankeados por frequência e impacto
- Vulnerabilidades narrativas
- Recomendações estratégicas

## Para quem

- Consultores políticos que precisam antecipar reações públicas
- Assessores de campanha que precisam testar posicionamentos
- Analistas que querem explorar cenários "e se?"

## Como funciona

```
Input (tema + preset)  →  Assembly (gera painel)  →  Deliberação (3 rodadas)  →  Agregação  →  Relatório
```

1. **Assembly:** Gera N agentes com perfis cognitivos diversos (vieses de Munger + princípios de Cialdini)
2. **Deliberação:** Agentes formam opinião individual (rodada 1), são expostos a argumentos alheios (rodada 2+), e consolidam posição (rodada 3)
3. **Agregação:** Calcula métricas de sentimento, impacto, vulnerabilidades e clusters
4. **Relatório:** Gera documento legível para não-técnicos com recomendações acionáveis

## Como rodar

```bash
# Simulação básica
/politica-simulation-mirofish "Reforma tributária"

# Com preset específico e mais agentes
/politica-simulation-mirofish "Privatização dos Correios" --preset sp-capital --agents 30

# Com documento de contexto
/politica-simulation-mirofish "Redução da maioridade penal" --context pesquisa-recente.md

# Reutilizar painel de simulação anterior (Story 4.1)
/politica-simulation-mirofish "Reforma tributária" --panel output/20260324-1530-reducao-maioridade/panel.yaml

# Cenários comparativos: mesmo painel, temas diferentes (Story 4.2)
/politica-simulation-mirofish --compare "Reforma tributária" "Privatização dos Correios" --panel output/20260324-1530/panel.yaml

# Preset customizado (Story 4.3)
/politica-simulation-mirofish "Tema" --preset jovens-primeiro-voto
```

## Estrutura de arquivos

```
skills/politica-simulation-mirofish/
├── SKILL.md                  # Entry point (orquestração)
├── config.yaml               # Configuração padrão
├── README.md                 # Este arquivo
├── presets/                  # Presets demográficos
│   ├── brasil-geral.yaml     # Brasil representativo (padrão)
│   ├── sp-capital.yaml       # São Paulo capital
│   ├── nordeste-evangelico.yaml
│   └── custom-template.yaml  # Template para presets customizados (Story 4.3)
├── templates/                # Templates de prompt
│   ├── agent-persona.md      # Geração de persona
│   ├── deliberation-round-1.md
│   ├── deliberation-round-n.md
│   ├── summarizer.md
│   ├── aggregator.md
│   ├── report-template.md    # Relatório final (Polish: Story 4.4)
│   ├── comparison-report.md  # Relatório comparativo (Story 4.2)
│   └── recommendations.md
├── data/                     # Dados de referência
│   ├── cognitive-biases.yaml
│   ├── influence-principles.yaml
│   └── demographic-archetypes.yaml
└── output/                   # Outputs das simulações
```

## Funcionalidades

| Funcionalidade | Comando | Epic |
|---|---|---|
| Simulação básica | `/politica-simulation-mirofish "Tema"` | 1-3 |
| Preset demográfico | `--preset nome` | 1 |
| Contexto externo | `--context arquivo.md` | 3 |
| Retomada | `--resume {run_id}` | 2 |
| Dry-run de painel | `--dry-run` | 2 |
| Reutilização de painel | `--panel path/panel.yaml` | 4.1 |
| Cenários comparativos | `--compare "T1" "T2"` | 4.2 |
| Preset customizado | `--preset meu-preset` | 4.3 |

## Disclaimer e Uso Ético

Esta ferramenta é **exploratória, não substitui pesquisa de opinião profissional**.

- Resultados baseados em perfis virtuais, não entrevistas reais
- LLMs têm viés demográfico (sobre-representam perfis urbanos/escolarizados)
- Resultados variam entre execuções (natureza estocástica)
- Máximo 50 agentes por simulação
- Use para gerar hipóteses — valide com pesquisa real antes de decisões de alto impacto
- Não use para desinformação, manipulação ou campanhas negativas
