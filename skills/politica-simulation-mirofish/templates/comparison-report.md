# Template: Relatório Comparativo de Cenários

<!-- Implementado na Story 4.2 -->
<!-- Tom: consultor de campanha, sem jargão de AI -->
<!-- Referência: Spec FR24 — Cenários Comparativos -->

## Propósito

Gerar relatório comparativo quando o modo `--compare` é utilizado: mesmo painel virtual,
temas diferentes. Permite visualizar como a opinião do mesmo grupo muda conforme o tema
ou enquadramento da questão.

---

## Template de Relatório

Ao gerar o relatório comparativo, usar exatamente esta estrutura:

---

# Relatório Comparativo de Cenários

**Temas analisados:** {lista de temas}
**Painel:** {panel_path} — {n} agentes
**Data da simulação:** {data}
**Simulação gerada por:** politica-simulation-mirofish | Exploratório — não substitui pesquisa de opinião profissional

---

## Sumário Executivo

- **Tema com maior apoio:** {tema} ({x}% a favor)
- **Tema com maior rejeição:** {tema} ({x}% contra)
- **Tema mais divisivo:** {tema} (diferença entre a favor e contra: {delta}pp)
- **Segmento mais volátil:** {segmento} — mudou de posição predominante em {n} de {total} cenários
- **Conclusão principal:** {2-3 frases resumindo o padrão geral observado}

---

## 1. Distribuição de Sentimento por Cenário

| Posição | {Tema 1} | {Tema 2} | {Tema 3} | Delta máx. |
|---------|----------|----------|----------|------------|
| A favor | {x}% | {x}% | {x}% | {delta}pp |
| Contra | {x}% | {x}% | {x}% | {delta}pp |
| Neutro | {x}% | {x}% | {x}% | {delta}pp |
| Indeciso | {x}% | {x}% | {x}% | {delta}pp |

**Interpretação:** {1-2 frases sobre o padrão de distribuição entre os temas}

### Distribuição por Segmento

Para cada segmento do painel, mostrar como a posição predominante variou entre os temas:

| Segmento | {Tema 1} | {Tema 2} | {Tema 3} | Estabilidade |
|----------|----------|----------|----------|--------------|
| {seg-1} | {posição} | {posição} | {posição} | Estável / Volátil |
| {seg-2} | ... | ... | ... | ... |
| ... | | | | |

**Segmentos mais voláteis (mudaram de posição entre cenários):**
- {segmento}: {posição no tema 1} → {posição no tema 2}
- {segmento}: {posição no tema 1} → {posição no tema 3}

---

## 2. Argumentos — Transversais vs. Específicos

### Argumentos Transversais (aparecem em todos os cenários)

Argumentos que o painel usa independentemente do tema — revelam valores estruturais do grupo:

| Argumento | Frequência T1 | Frequência T2 | Frequência T3 | Posição |
|-----------|--------------|--------------|--------------|---------|
| {argumento 1} | {n}% | {n}% | {n}% | {a favor / contra} |
| {argumento 2} | ... | ... | ... | ... |
| ... | | | | |

**O que isso revela:** {1-2 frases sobre valores estruturais do grupo}

### Argumentos Específicos por Tema

**{Tema 1} — argumentos exclusivos:**
- {argumento}: usado por {n}% dos agentes neste tema
- {argumento}: ...

**{Tema 2} — argumentos exclusivos:**
- {argumento}: ...

**{Tema 3} — argumentos exclusivos (se houver):**
- {argumento}: ...

---

## 3. Segmentos que Mudam de Posição entre Cenários

Segmentos mais suscetíveis ao enquadramento da questão — os "persuadíveis" por tema:

### {Segmento que mais muda}

| Cenário | Posição predominante | Intensidade média | Principal argumento |
|---------|---------------------|-------------------|---------------------|
| {Tema 1} | {posição} | {alta/média/baixa} | {argumento} |
| {Tema 2} | {posição} | ... | ... |
| {Tema 3} | {posição} | ... | ... |

**Análise:** {Por que este segmento responde diferentemente a cada tema?}

### {Outros segmentos voláteis}

{Mesma estrutura para cada segmento que variou significativamente}

---

## 4. Qual Tema Gera Maior Resistência?

Ranking do tema mais ao menos resistido pelo painel:

1. **{Tema mais resistido}** — {x}% contra | Argumentos dominantes: {lista}
2. **{Tema intermediário}** — {x}% contra | Argumentos dominantes: {lista}
3. **{Tema menos resistido}** — {x}% contra | Argumentos dominantes: {lista}

**Implicação estratégica:** {1-2 frases sobre qual tema/enquadramento gera menor resistência e por quê}

---

## 5. Recomendações Comparativas

Com base nos padrões observados entre os cenários:

**Enquadramento com menor resistência:** {tema/enquadramento mais eficaz para este painel}

**Segmentos-chave a trabalhar:**
- {segmento}: responde melhor ao enquadramento de {tema X} por causa de {razão}
- {segmento}: consistentemente {posição} independentemente do tema — prioridade baixa para persuasão

**Argumentos transversais a evitar/usar:**
- Evitar: {argumento transversal que gera rejeição consistente}
- Usar: {argumento transversal que gera apoio consistente}

**Próximos passos sugeridos:**
1. {ação concreta baseada nos dados}
2. {ação concreta}
3. {ação concreta}

---

## Metodologia

Este relatório comparativo foi gerado pelo **politica-simulation-mirofish** em modo `--compare`.

**Como funciona:**
- O mesmo painel de {n} agentes virtuais foi submetido a {n_temas} simulações independentes
- Cada simulação rodou com {rounds} rodadas de deliberação
- Os dados individuais de cada cenário estão preservados nas subpastas de auditoria
- O painel foi carregado de: `{panel_path}`

**Limitações desta análise comparativa:**
- Variações entre cenários refletem respostas do modelo de linguagem, não pesquisa real
- Diferenças pequenas (< 5pp) podem ser ruído estocástico, não tendência real
- Para maior confiabilidade, repetir cada cenário 2-3 vezes e comparar a média

---

## Aviso Legal e Disclaimer

> **Esta análise é uma simulação exploratória gerada por inteligência artificial.**
>
> 1. **Não substitui pesquisa de opinião:** Os resultados são baseados em agentes virtuais com perfis
>    simulados, não em entrevistas com cidadãos reais. Não use como única base para decisões.
>
> 2. **Limitações metodológicas:** Modelos de linguagem têm vieses demográficos conhecidos
>    (tendência a sobre-representar perfis urbanos, escolarizados e progressistas). Os resultados
>    podem não refletir com precisão grupos marginalizados ou de baixa escolaridade.
>
> 3. **Uso ético:** Esta ferramenta é destinada a análise exploratória e planejamento estratégico.
>    Não deve ser usada para manipulação, desinformação ou campanha negativa.
>
> 4. **Valide os resultados:** Confirme padrões relevantes com pesquisa quantitativa ou qualitativa
>    real antes de tomar decisões de alto impacto.

---

*Gerado por politica-simulation-mirofish | Simulação exploratória — não substitui pesquisa de opinião profissional*

---

## Instruções de Preenchimento (para o modelo de linguagem)

Ao usar este template, o modelo deve:

1. **Calcular deltas reais** entre os `aggregation.yaml` de cada cenário
2. **Identificar argumentos transversais** comparando as listas de top argumentos de cada cenário
   (usar similaridade semântica, não apenas correspondência textual exata)
3. **Classificar estabilidade de segmento** como "Estável" se a posição predominante não mudou
   entre cenários, "Volátil" se mudou em pelo menos um cenário
4. **Não inventar dados** — se um campo não puder ser calculado, indicar "Dados insuficientes"
5. **Manter tom de consultor** — sem jargão de AI, focado em implicações práticas
