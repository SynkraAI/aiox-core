# Regra: Data Defensibility (Defensibilidade de Dados)

**ID**: RULE-DD-001
**Versão**: 1.0.0
**Aplicável a**: Todos os workflows e agentes do Content Engine
**Prioridade**: ALTA — regra transversal obrigatória

---

## Princípio Core

> Dados são enriquecimento, não fonte da verdade. Frameworks e métodos dos agentes são a base. Dados com amostra insuficiente NUNCA viram afirmação estatística.

---

## Classificação de Dados (Obrigatória)

Antes de usar qualquer dado em conteúdo, classificar:

| Classe | Descrição | Regra | Exemplo |
|--------|-----------|-------|---------|
| **Fato verificável** | Dado com fonte externa confiável, amostra significativa, reproduzível | Pode usar como afirmação direta | "83% dos profissionais relatam paralisia decisória (Harvard Business Review, 2024)" |
| **Observação proprietária** | Dado do produto/experiência própria com amostra pequena (N<30) | Pode usar como OBSERVAÇÃO PESSOAL, nunca como estatística | "na primeira semana do Next Step, percebi que a maioria usa entre 21h e 23h" |
| **Anedota** | Experiência individual, 1 caso, 1 feedback | Pode usar como HISTÓRIA, nunca como padrão | "um usuário me disse: 'ajuda a não paralisar olhando pro macro'" |
| **Extrapolação** | Conclusão derivada de dados insuficientes | PROIBIDO em conteúdo. Pode usar apenas em discussão interna de estratégia | ~~"60% das decisões de vida são tomadas às 23h"~~ (baseado em 6 pessoas) |

### Regra do N<30

**Se a amostra for menor que 30 pontos de dados:**
- PROIBIDO transformar em porcentagem
- PROIBIDO usar como "os dados mostram que..."
- PROIBIDO extrapolar para o público geral
- PERMITIDO como "na minha experiência", "percebi que", "entre os primeiros que testaram"

### Teste de Defensibilidade

Para CADA dado usado em conteúdo, responder:

1. **Se um seguidor perguntasse "baseado em que?", a resposta é honesta?**
   - "Baseado em 6 pessoas que usaram minha ferramenta" → honesto, mas NÃO sustenta "60% das decisões de vida"
   - "Baseado na minha experiência com o Next Step" → honesto E defensável

2. **Se um concorrente questionasse publicamente, eu ficaria confortável defendendo?**
   - "Eu disse 60% mas são 6 pessoas" → embaraçoso
   - "Eu disse que percebi um padrão noturno entre os primeiros usuários" → defensável

3. **A afirmação seria verdadeira se a amostra dobrasse?**
   - Se depende de N=6 e N=12 poderia ser diferente → NÃO USE como fato

---

## Linguagem Defensável vs Indefensável

### PROIBIDO (Extrapolação)

```
"60% das decisões de vida são tomadas entre 21h e 23h."
"a maioria das pessoas decide à noite"
"os dados mostram que..." (com N<30)
"X% dos profissionais..." (sem fonte externa)
```

### PERMITIDO (Observação honesta)

```
"na primeira semana do Next Step, percebi um padrão:
as pessoas me procuram mais à noite."

"entre os primeiros que testaram, o horário
de pico foi 21h. faz sentido — é quando
o dia acaba e a cabeça pesa."

"6 pessoas testaram. 10 sessões. confusão
média: 5.4/10. números pequenos, mas reais."
```

### Chave de transformação

| Indefensável | Defensável |
|---|---|
| "60% das decisões..." | "percebi que as pessoas decidem mais à noite" |
| "a maioria trava por..." | "entre quem testou, o padrão era..." |
| "os dados mostram..." | "a primeira semana me ensinou que..." |
| "X% dos profissionais..." | [precisa de fonte externa] ou não usar |

---

## Onde Aplicar (Pontos de Integração)

### 1. Devil's Advocate — Teste do Dado (ATUALIZAÇÃO)

**Adicionar ao scoring do Teste do Dado:**

| Score | Descrição | ADIÇÃO |
|---|---|---|
| 0 | Afirmação sem sustentação | — |
| 3 | Opinião disfarçada de fato | **Inclui: dado extrapolado (N<30 apresentado como estatística)** |
| 5 | Experiência anedótica sem dados | — |
| 7 | Tem dados mas falta contexto | **Inclui: dado proprietário sem classificação de amostra** |
| 10 | Dado específico, com fonte, contexto e relevância | **Inclui: fonte externa OU observação honestamente classificada** |

**Adicionar pergunta ao arsenal:**
- "Qual o tamanho da amostra? Se N<30, está apresentado como observação ou como fato?"
- "Se dobrar a amostra, essa afirmação ainda seria verdadeira?"

### 2. Hormozi — Hook com Stat (ATUALIZAÇÃO)

No `hook_formulas.stat`, adicionar guardrail:

> **Stat hook**: Use APENAS com fontes verificáveis OU dados proprietários com amostra > 30. Para amostras menores, converter stat hook em story hook: "percebi que..." em vez de "X% das pessoas...".

### 3. Carousel/Content Piece — Phase 1 Hook (ATUALIZAÇÃO)

Adicionar critério ao GATE-1:

- [ ] Hook com dado? Dado classificado (fato/observação/anedota/extrapolação)?
- [ ] Se observação ou anedota: linguagem reflete honestamente a amostra?
- [ ] Se extrapolação: REPROVAR e converter para observação ou framework

### 4. Weekly Sprint — Fase 0 DADOS (ATUALIZAÇÃO)

Adicionar step à coleta de dados:

> **Step 4: Classificar maturidade dos dados**
> Para cada dado coletado, atribuir classe (fato/observação/anedota/extrapolação).
> Incluir coluna "Classe" na tabela de dados.
> Dados classificados como "extrapolação" são BLOQUEADOS para uso direto em conteúdo.

### 5. Torriani Master — Validação (ATUALIZAÇÃO)

Adicionar ao Checklist de Limpeza:

- [ ] Todo dado usado em conteúdo está classificado (fato/observação/anedota)?
- [ ] Nenhuma extrapolação de amostra pequena (N<30) apresentada como estatística?

### 6. Mid-Week Adapt — Fase 1 ANÁLISE (ATUALIZAÇÃO)

Adicionar ao escopo da análise:

> Ao analisar dados para adaptação, classificar cada dado pela regra DD-001.
> Adaptações baseadas em extrapolações devem ser sinalizadas como "hipótese", não "evidência".

---

## Banco de Dados Aprovados (ICP Research)

> **Source**: `../data/icp-research.md` Seção 6.3 — Dados verificados com fontes institucionais.
> **Regra**: SEMPRE consultar este banco ANTES de usar dados em conteúdo.

Consulte a tabela completa de 8 dados verificados em `../data/icp-research.md` Seção 6.3.

**Exemplos rápidos** (fonte canônica: `../data/icp-research.md`):
- Burnout BR: 32% (ISMA-BR) | Estresse: 72% (ISMA-BR) | Tela: 9h13/dia (Bain 2025)

**Como usar**: Stat hooks, slides de prova e headlines com dados DEVEM consultar `../data/icp-research.md` Seção 6.3.
Dados fora do banco verificado precisam de validação antes do uso.

---

## Gate Universal de Dados

**GATE-DD: Dados Defensáveis**
Aplicável a TODO workflow que usa dados em conteúdo.

- [ ] Todo dado classificado (fato/observação/anedota/extrapolação)
- [ ] Zero extrapolações em hooks, headlines ou afirmações
- [ ] Observações usam linguagem honesta ("percebi", "na minha experiência")
- [ ] Fatos externos têm fonte citável
- [ ] Se questionado publicamente, toda afirmação é defensável

**Status**: [GATE-PASS | GATE-FAIL]
**Data**: YYYY-MM-DD HH:MM

---

## Resumo Executivo para Agentes

| Agente | O que muda |
|--------|-----------|
| @devil-advocate | Teste do Dado agora inclui verificação de amostra e classificação |
| @alex-hormozi | Stat hooks precisam de fonte verificável ou N>30; senão, converter para story hook |
| @nicolas-cole | Headline Engineering com dado: só se defensável; senão, usar framework |
| @eugene-schwartz | Diagnóstico classifica dados disponíveis antes de recomendar ângulo |
| @vanessa-lau | ANC Funnel: dados em Convert precisam de classificação obrigatória |
| @oraculo-torriani | Checklist de Limpeza agora verifica defensibilidade de dados |
| Todos | Regra do N<30 é universal e não-negociável |

---

*Criado após incidente de extrapolação: "60% das decisões de vida às 23h" baseado em N=6.*
*A regra existe para proteger a credibilidade do criador e do conteúdo.*
