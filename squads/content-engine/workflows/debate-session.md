# Workflow: Debate Session

## Metadata
- id: debate-session
- version: 1.0.0
- type: multi-agent
- estimated_time: 30-45 min
- agents_involved: [varia por tipo de conteudo + @devil-advocate + @nicolas-cole + @oraculo-torriani]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 6 fases sequenciais. Cada fase tem um GATE de saída. Se o GATE falhar, PARE. NÃO pule fases. NÃO avance sem completar TODOS os items do GATE.**

**Se você está lendo este workflow, siga estas regras:**
1. Execute as fases na ORDEM (1 → 2 → 3 → 4 → 5 → 5.5 → 6)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NÃO, PARE e corrija
4. Escreva "GATE-PASS: [fase] [score] [data]" antes de avançar
5. Se não há evidência de fases anteriores, Torriani REPROVA automaticamente

---

## Proposito
Garantir que todo conteudo de alto impacto passe por debate estruturado entre multiplos agentes antes da publicacao. Tres perspectivas criativas + um ataque de qualidade + uma validacao final = conteudo robusto e anti-generico.

## Quando Aplicar

| Tipo de Conteudo | Debate | Formato |
|-----------------|--------|---------|
| Feed posts | OBRIGATORIO | Debate completo (3 opinicoes) |
| Carrosseis | OBRIGATORIO | Debate completo (3 opinicoes) |
| Reels | OBRIGATORIO | Debate completo (3 opinicoes) |
| Stories | NAO | Producao direta (1 agente + checklist) |
| Adaptacoes mid-week | PARCIAL | Debate rapido (2 opinicoes + devil's advocate) |

## Pares de Agentes por Tipo de Conteudo

| Tipo | Agente A | Agente B |
|------|----------|----------|
| Copy de carrossel | @nicolas-cole | @alex-hormozi |
| Script de reel | @george-blackman | @nicolas-cole |
| Frase estatica | @nicolas-cole | @dan-koe |
| Landing page / email | @joanna-wiebe | @stefan-georgi |

## Inputs

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| tema | string | sim | Tema do conteudo a ser produzido |
| formato | string | sim | Tipo de conteudo (carrossel, reel, post, email, landing) |
| plataforma | string | sim | Plataforma alvo (Instagram, LinkedIn, YouTube, etc.) |
| anc_tag | string | sim | Tag do funil ANC — Attract, Nurture ou Convert |
| brief | object | sim | Brief completo com contexto, publico, objetivo |
| sprint_context | object | nao | Contexto do sprint semanal (tema da semana, emocional arc) |

## Fases

### Fase 1: BRIEF + DATA RESEARCH (10 min)
- **Responsavel**: Quem ativa o workflow (lead ou agente designado)
- **Acoes**:
  1. Definir tema, formato e plataforma
  2. Definir tag ANC (Attract / Nurture / Convert)
  3. Estabelecer contexto do sprint (se aplicavel)
  4. **PESQUISA DE DADOS (SEMPRE obrigatória — sem exceção)**:
     a. Pesquisar dados INTERNOS: métricas de ferramentas, produtos, banco de dados, resultados reais
     b. Pesquisar dados EXTERNOS: fontes confiáveis online (estudos, pesquisas, relatórios oficiais)
     c. Usar ferramentas disponíveis: EXA (web search), WebSearch, WebFetch
     d. Compilar "banco de dados aprovado" para o brief com: dado, fonte, URL, ano
     e. Se tema não requer dados quantitativos: registrar `dados_verificados: N/A — tema não requer dados` no output
     f. **REGRA: Se não encontrar dados reais → mudar o contexto/ângulo. NUNCA inventar dados.**
     g. **VETO: Brief sem campo dados_verificados (preenchido OU N/A) = GATE-FAIL automático**
  5. Distribuir brief + dados verificados para Agente A e Agente B simultaneamente
- **Output**: brief_completo, dados_verificados[]
- **Regra**: O brief deve ser identico para ambos os agentes — mesma informacao, sem vantagem
- **Regra**: Dados no brief DEVEM ter fonte verificável. Agentes NÃO podem inventar estatísticas

---
### GATE-1: Brief Completo
**OBRIGATÓRIO antes de avançar para Fase 2**

Preencha TODOS os items abaixo. Se qualquer item for NÃO, PARE.

- [ ] Tema definido e específico
- [ ] Formato definido (carrossel, reel, post, email, landing)
- [ ] Plataforma definida
- [ ] Tag ANC definida (Attract, Nurture ou Convert)
- [ ] Pesquisa de dados realizada (campo `dados_verificados` preenchido OU marcado `N/A`)
- [ ] **Nenhum dado inventado** — todos com fonte + URL + ano (ou N/A se tema não requer)
- [ ] Brief idêntico preparado para ambos os agentes (incluindo dados verificados)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/5
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: corrija o brief. NÃO distribua para os agentes.
---

### Fase 2: AGENTE A — Versao 1 (10 min)
- **Agente**: Definido pela tabela de pares (coluna Agente A)
- **Inputs**: brief_completo
- **Acoes**:
  1. Produzir versao completa (copy + direcao de arte, se aplicavel)
  2. Aplicar seus frameworks nativos ao conteudo
  3. Entregar versao pronta para debate
- **Output**: versao_a (copy completa + art direction)
- **Regra**: Agente A trabalha sem ver o trabalho de Agente B

---
### GATE-2: Versão A Entregue
**OBRIGATÓRIO antes de avançar para Fase 3**

- [ ] Versão A é completa (copy + art direction, se aplicável)
- [ ] Versão A aplicou frameworks nativos do agente
- [ ] Versão A é entrega final (não rascunho)
- [ ] Agente A NÃO viu trabalho do Agente B

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: Agente A deve completar a versão. NÃO avance.
---

### Fase 3: AGENTE B — Versao Alternativa (10 min)
- **Agente**: Definido pela tabela de pares (coluna Agente B)
- **Inputs**: brief_completo (mesmo que Agente A)
- **Acoes**:
  1. Produzir versao alternativa com abordagem diferente
  2. Aplicar seus frameworks nativos (diferentes de A)
  3. Entregar versao pronta para debate
- **Output**: versao_b (copy completa + art direction)
- **Regra**: Agente B trabalha sem ver o trabalho de Agente A. A abordagem DEVE ser diferente — se A foi emocional, B vai analitico; se A foi storytelling, B vai dados.

---
### GATE-3: Versão B Entregue
**OBRIGATÓRIO antes de avançar para Fase 4**

- [ ] Versão B é completa (copy + art direction, se aplicável)
- [ ] Versão B aplicou frameworks nativos do agente (diferentes de A)
- [ ] Versão B tem abordagem DIFERENTE de A (evidência explícita)
- [ ] Agente B NÃO viu trabalho do Agente A

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: Agente B deve completar a versão. NÃO avance.
---

### Fase 4: DEVIL'S ADVOCATE — Ataque (10 min)
- **Agente**: @devil-advocate
- **Inputs**: versao_a, versao_b, brief_completo
- **Acoes**:
  1. Aplicar Teste da Substituicao em ambas as versoes
  2. Aplicar Teste do Dado em ambas as versoes
  3. Aplicar Teste do Scroll em ambas as versoes
  4. Mapear fraquezas de cada versao com severidade
  5. Identificar o que eh forte em cada versao
  6. Produzir relatorio de debate com recomendacao de consolidacao
- **Output**: relatorio_debate (scores, fraquezas, forcas, recomendacao)
- **Perguntas obrigatorias**:
  - "O que eh fraco e generico em cada versao?"
  - "O que falta de dados/evidencias?"
  - "Qual hook para o scroll de verdade?"
  - "Qual versao tem mais especificidade?"
  - "O que pegar de A e o que pegar de B?"
- **Regra**: Atacar AMBAS igualmente. Sem favoritos. Fraqueza eh fraqueza.

---
### GATE-4: Devil's Advocate Executado
**OBRIGATÓRIO antes de avançar para Fase 5**

- [ ] Teste da Substituição aplicado em AMBAS as versões
- [ ] Teste do Dado aplicado em AMBAS as versões
- [ ] Teste do Scroll aplicado em AMBAS as versões
- [ ] Relatório de debate produzido com forças e fraquezas

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: Devil's Advocate deve completar todos os testes. NÃO avance.
---

### Fase 5: CONSOLIDACAO — Smart Merge (10 min)
- **Agente**: @nicolas-cole (consolidador padrao)
- **Inputs**: versao_a, versao_b, relatorio_debate
- **Acoes**:
  1. Ler relatorio do Devil's Advocate
  2. Selecionar o melhor hook entre as duas versoes
  3. Selecionar o melhor corpo entre as duas versoes
  4. Integrar as defesas recomendadas pelo Devil's Advocate
  5. Produzir versao consolidada final
- **Output**: versao_consolidada (copy final + art direction)
- **Regra**: A consolidacao pega o MELHOR de cada versao, nao eh uma media. Hook de A + corpo de B eh valido. O relatorio do Devil's Advocate guia o que manter e o que descartar.

---
### GATE-5: Consolidação Completa
**OBRIGATÓRIO antes de avançar para Fase 6**

- [ ] Relatório do Devil's Advocate foi usado como guia
- [ ] Melhor hook selecionado entre as duas versões
- [ ] Melhor corpo selecionado entre as duas versões
- [ ] Defesas recomendadas pelo Devil's Advocate integradas
- [ ] Versão consolidada é peça completa (não rascunho)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/5
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: volte para consolidação. NÃO submeta ao Torriani.
---

### Fase 5.5: QA VISUAL (5 min)
- **Agente**: @qa ou agente responsável pela arte
- **Inputs**: versao_consolidada (PNGs renderizados)
- **Ações**:
  1. Renderizar slides finais via render.ts (se não renderizados)
  2. Executar checklist `squads/content-engine/checklists/visual-qa.md` nos PNGs
  3. Executar script automatizado: `bash squads/content-engine/scripts/run-qa-gate.sh <batch.json> <output-dir>`
  4. Registrar score
- **Output**: visual_qa_score, visual_qa_report
- **Regra**: Se render não executado, executar antes do checklist.

---
### GATE-VISUAL: QA Visual
**OBRIGATÓRIO antes de avançar para Fase 6**

Executar: `squads/content-engine/checklists/visual-qa.md`

- [ ] Seção 1: Tokens & Consistência (5/5)
- [ ] Seção 2: Hierarquia Visual (4/4)
- [ ] Seção 3: Legibilidade (4/4)
- [ ] Seção 4: Integridade do Render (3/3)

**Score**: _/16 x 10 = _/10
**Status**: [GATE-PASS | GATE-FAIL]
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL (score < 8.0): voltar para Fase 5 (Consolidação) com feedback visual.
Se Seção 4 (Integridade) falha: BLOQUEANTE independente do score.
NÃO submeta ao Torriani sem GATE-VISUAL PASS.

**Escalação visual**: 2 falhas GATE-VISUAL consecutivas = escalar para humano (mesma regra de escalação do Torriani).
---

### Fase 6: VALIDACAO TORRIANI (5 min)
- **Agente**: @oraculo-torriani
- **Inputs**: versao_consolidada
- **Acoes**:
  1. Executar Validador Master (5 criterios nao-negociaveis)
  2. Se Master aprovar: executar Checkpoints relevantes
  3. Emitir score final
- **Output**: veredito_final (aprovado/reprovado + score + feedback)
- **Regra**: Score minimo para aprovacao = 8/10 media geral. Abaixo disso, volta para iteracao.
- **Regra de evidência**: Se não há evidência de que as Fases 1-5 foram executadas (sem GATE-PASS registrados), REPROVADO automaticamente. Emita: "REPROVADO: Sem evidência de debate completo. Execute todas as fases."

---
### GATE-6: Torriani Validou
**GATE FINAL — determina se conteúdo está aprovado**

- [ ] Validador Master executado (5 critérios)
- [ ] Checkpoints relevantes executados (se Master passou)
- [ ] Score final calculado
- [ ] Score >= 8/10

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Torriani Score**: _/10
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: consulte Regras de Iteração abaixo. NÃO publique.
GATE-PASS: escreva "GATE-PASS: debate [score_torriani] [data]"
---

## Regras de Iteracao

| Cenario | Acao |
|---------|------|
| Torriani aprova (>= 8/10) | Conteudo aprovado. Vai para publicacao. |
| Torriani reprova (1a vez) | Volta para Fase 5 (Consolidacao) com feedback. |
| Torriani reprova (2a vez) | Volta para Fase 5 com feedback refinado. Ultima tentativa. |
| Torriani reprova (3a vez) | ESCALAR para Tiago (decisao humana). Nao iterar mais. |

---
### REJECTION TRACKER
**OBRIGATÓRIO: Preencha esta tabela a cada submissão ao Torriani.**

| # | Score | Feedback Torriani | Data | Status |
|---|-------|-------------------|------|--------|
| 1 | —     | —                 | —    | —      |
| 2 | —     | —                 | —    | —      |
| 3 | —     | —                 | —    | ESCALAR|

**REGRA IMPERATIVA:**
1. Preencha uma linha a cada submissão ao Torriani
2. Na linha 1: registre score e feedback da 1a submissão
3. Na linha 2: registre score e feedback da 2a submissão (se houver)
4. Na linha 3: se Status = REPROVADO, **PARE IMEDIATAMENTE** e escale

**Na 3a rejeição, envie esta mensagem de escalation:**

```
══════════════════════════════════════════
ESCALATION: [nome da peça] reprovada 3x
══════════════════════════════════════════
Scores: [score1], [score2], [score3]
Feedback resumido:
1. [feedback da 1a rejeição]
2. [feedback da 2a rejeição]
3. [feedback da 3a rejeição]
──────────────────────────────────────────
Decisão necessária: aprovar, reescrever
manualmente, ou descartar.
══════════════════════════════════════════
```

**PARE. NÃO itere mais. Aguarde decisão humana.**
---

**Limite de iteracoes**: maximo 2 rodadas de correcao (ou seja, 3 submissoes totais: 1 original + 2 revisoes). Na 3a reprovacao consecutiva, eh decisao humana (escalar para Tiago).

## Tempo Maximo

| Debate completo | 30-45 min |
|----------------|-----------|
| Debate rapido (mid-week) | 15-25 min |

Se ultrapassar o tempo, o lead decide: publicar a melhor versao disponivel ou escalar.

## Outputs

| Entregavel | Formato | Descricao |
|------------|---------|-----------|
| versao_a | markdown | Versao do Agente A |
| versao_b | markdown | Versao do Agente B |
| relatorio_debate | markdown | Analise do Devil's Advocate |
| versao_consolidada | markdown | Versao final apos merge |
| veredito_final | markdown | Aprovacao/reprovacao do Torriani |
| decision_log | markdown | Registro de decisoes para o tracker |

## Quality Gates

- [ ] Brief identico enviado para ambos os agentes
- [ ] Agente A e Agente B trabalharam sem ver o trabalho um do outro
- [ ] Devil's Advocate aplicou os 3 testes em ambas as versoes
- [ ] Consolidacao usou o relatorio do Devil's Advocate como guia
- [ ] GATE-VISUAL passou (score >= 8.0/10, seção 4 sem falha)
- [ ] Torriani validou a versao consolidada
- [ ] Score minimo >= 8/10 atingido (ou escalado para humano)
- [ ] Maximo 2 iteracoes respeitado
- [ ] Tempo total <= 45 min

## Debate Rapido (Mid-Week)

Versao simplificada para adaptacoes mid-week:

1. **BRIEF**: Mesmo formato, com contexto da adaptacao
2. **2 AGENTES**: Apenas 2 agentes relevantes (sem par obrigatorio)
3. **DEVIL'S ADVOCATE**: Ataque focado — pergunta principal: "Por que NAO mudar?" (prevenir reacao exagerada)
4. **CONSOLIDACAO**: Merge rapido pelo agente mais relevante
5. **SEM TORRIANI**: Validacao simplificada pelo lead do sprint

Tempo maximo: 15-25 min.
