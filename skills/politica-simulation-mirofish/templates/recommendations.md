# Template: Gerador de Recomendacoes Estrategicas

> Tom: consultor de campanha dando conselho pratico ao candidato.
> Cada recomendacao deve levar a uma acao concreta, nao a reflexao.
> Referencia: Spec Story 3.3, FR19

## Purpose

Transformar os dados agregados da simulacao em 3-5 recomendacoes estrategicas contextualizadas. Este template e o "so what?" dos dados — a ponte entre metricas e acao.

**Risco mitigado:** "Output nao acionavel para consultores" (Spec: probabilidade media, impacto critico). Recomendacoes genericas como "melhore a comunicacao" sao equivalentes a nao ter recomendacoes.

---

## Input

Carregar antes de gerar:

1. **`output/{run}/aggregation.yaml`** — metricas completas, especialmente:
   - `vulnerabilities` — pontos fracos que precisam de acao imediata
   - `clusters` — grupos de opiniao para segmentacao
   - `opinion_dynamics` — tendencias de mudanca
   - `argument_ranking` — argumentos de maior impacto
   - `sentiment_distribution.by_segment` — divergencias entre segmentos
2. **`output/{run}/config-snapshot.yaml`** — tema original da simulacao

---

## Processo de Geracao

### Passo 1: Identificar Prioridades

Analisar os dados agregados e classificar as oportunidades por urgencia:

| Fonte de dados | Tipo de oportunidade | Urgencia tipica |
|----------------|---------------------|-----------------|
| `vulnerabilities` com severity=critica | Contranarrativa defensiva | Critica |
| `vulnerabilities` com severity=alta | Contranarrativa preventiva | Alta |
| `clusters` com posicao predominante contra | Segmentos hostis a converter | Alta |
| `opinion_dynamics` com segmentos volateis | Segmentos persuadiveis | Media |
| `argument_ranking` com alto impact_score a favor | Argumentos para amplificar | Media |
| `clusters` com posicao predominante a favor | Base para consolidar | Baixa |

### Passo 2: Gerar 3-5 Recomendacoes

Para CADA recomendacao, preencher TODOS os campos:

```yaml
recomendacao:
  titulo: "{Verbo de acao + objetivo. Ex: Neutralizar argumento sobre aumento de imposto}"
  acao: >
    {O QUE fazer. Especifico e concreto. 2-4 frases.
     Ex: "Produzir material com simulacao de impacto real por faixa de renda,
     mostrando que familias com renda ate R$5.000 nao serao afetadas.
     Distribuir via WhatsApp e redes sociais com formato de infografico simples."}
  justificativa: >
    {POR QUE fazer. Baseado nos dados, nao em intuicao.
     Ex: "Este argumento teve impact_score 4 (o mais alto da simulacao),
     causando mudanca de opiniao em 40% do segmento classe-C-urbano.
     Sem resposta, este argumento sozinho pode virar a narrativa contra."}
  segmento_alvo: "{PARA QUEM direcionar. Ex: classe-C-urbano, especialmente mulheres 30-50 anos}"
  urgencia: "{critica | alta | media | baixa}"
  metricas_de_suporte:
    - "{dado especifico do aggregation.yaml que sustenta esta recomendacao}"
    - "{outro dado}"
```

### Passo 3: Ordenar por Urgencia

Apresentar recomendacoes na ordem:
1. Criticas primeiro (riscos imediatos)
2. Altas (oportunidades de alto impacto)
3. Medias (consolidacao e prevencao)
4. Baixas (otimizacao)

### Passo 4: Garantir Qualidade

Antes de finalizar, verificar cada recomendacao contra estes criterios:

| Criterio | Pergunta de verificacao | Se NAO → |
|----------|------------------------|----------|
| Especificidade | Um assessor consegue executar isso amanha? | Reescrever com mais detalhe |
| Base em dados | Ha numeros do aggregation.yaml sustentando? | Adicionar metricas ou descartar |
| Contextualizacao | E especifica ao tema da simulacao? | Reescrever sem generalidades |
| Segmentacao | Tem um publico-alvo definido? | Definir segmento especifico |
| Acionabilidade | Descreve O QUE, PARA QUEM e POR QUE? | Completar os 3 elementos |

---

## Regras Obrigatorias

1. **Pelo menos 1 recomendacao deve abordar a vulnerabilidade de maior impacto.** Se a maior vulnerabilidade e "vai aumentar imposto pra classe media" com severity=critica, DEVE haver uma recomendacao endereçando isso diretamente.

2. **Recomendacoes NAO podem ser genericas.** Exemplos PROIBIDOS:
   - "Melhore a comunicacao com a classe C" (generico)
   - "Considere o impacto nos jovens" (vago)
   - "Amplie o dialogo com segmentos indecisos" (academico)

3. **Recomendacoes DEVEM ser contextualizadas ao tema.** Se o tema e "reducao da maioridade penal", as recomendacoes devem falar sobre maioridade penal, nao sobre "politica criminal" em abstrato.

4. **Tom: conselheiro pratico, nao analista.** O leitor quer ouvir "faca X porque Y" e nao "observa-se uma tendencia que sugere a possibilidade de considerar X".

5. **Cada recomendacao e auto-contida.** O leitor deve entender a recomendacao sem precisar ler o resto do relatorio.

---

## Output Format (para insercao no report.md)

Gerar em markdown para insercao direta na Secao 6 do relatorio:

```markdown
## Recomendacoes Estrategicas

Com base na simulacao de cenario, estas sao as acoes prioritarias:

### 1. {titulo da recomendacao} {emoji urgencia: 🔴 critica, 🟠 alta, 🟡 media, 🟢 baixa}

**Acao:** {descricao da acao em 2-4 frases}

**Justificativa:** {por que, com dados}

**Segmento-alvo:** {publico especifico}

**Urgencia:** {nivel}

---

### 2. {titulo}

{... mesmo formato}

---

### 3. {titulo}

{... mesmo formato}

---

{3-5 recomendacoes no total}

### Nota sobre Implementacao

Estas recomendacoes sao baseadas em uma simulacao de cenario e devem ser validadas com dados de campo (pesquisa quali/quanti, focus groups, monitoramento de redes) antes de investimento significativo de recursos. A ordem de prioridade reflete a urgencia detectada na simulacao.
```

---

## Validacao do Output

- [ ] Entre 3 e 5 recomendacoes geradas
- [ ] Cada recomendacao tem TODOS os campos: titulo, acao, justificativa, segmento_alvo, urgencia
- [ ] Pelo menos 1 recomendacao aborda a vulnerabilidade de maior impact_score
- [ ] Nenhuma recomendacao e generica (teste: um assessor conseguiria executar amanha?)
- [ ] Recomendacoes sao contextualizadas ao tema especifico da simulacao
- [ ] Tom consultivo, sem jargao de AI
- [ ] Justificativas citam dados concretos do aggregation.yaml
- [ ] Ordenadas por urgencia (critica → baixa)
