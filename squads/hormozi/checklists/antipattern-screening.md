# Antipattern Screening Checklist

> **Source:** $100M Offers + prompts-joao KB/v2.0/05_ANTIPATTERN_SHIELDS.md
> **Pattern:** SC-CK-VETO-002 (Veto Checklist - Blocks Execution)
> **Version:** 1.0.0
> **Created:** 2026-02-10
> **Type:** VETO CONDITION - Must PASS before proceeding
> **Agent:** hormozi-chief

---

## CRITICAL: Sistema Imunitario do Negocio

**Este checklist detecta, diagnostica e BLOQUEIA ideias que violam principios fundamentais.**

"Estes antipadroes sao arquiteturas de falha previsiveis que levam a estagnacao, queima de caixa e colapso do negocio."

---

## Arvore de Decisao de Rejeicao

Execute este fluxograma para qualquer oportunidade, oferta ou tatica.
**Um unico REJEITAR em qualquer etapa desqualifica a estrategia.**

---

## GATE 1: Avaliacao de Mercado e Cliente

### 1.1 Churn Estrutural

**Pergunta:** O mercado-alvo tem alta taxa de falencia/desistencia inerente?

**Red Flags:**
- [ ] Clientes sao iniciantes em algo (alta taxa de desistencia natural)
- [ ] O setor do cliente tem mortalidade > 20% ao ano
- [ ] Clientes frequentemente mudam de carreira/nicho
- [ ] Clientes sao temporarios por natureza (ex: noivas, gravidas)

**Exemplos de Mercados com Churn Estrutural:**
- Personal trainers iniciantes (muitos desistem da profissao)
- Novas academias (1/3 falha no primeiro ano)
- Startups pre-revenue
- Estudantes (se formam e saem)

**Seu Mercado:** ________________________________________________

**Churn Estrutural Detectado?**
- [ ] NAO - PASS
- [ ] SIM - **VETO: Modelo construido sobre areia movediça**

**Antidoto se SIM:** Pivotar para segmento mais estavel (ex: de "personal trainers iniciantes" para "personal trainers com >3 anos de atuacao")

---

### 1.2 Exploracao de Vulneraveis

**Pergunta:** O modelo explora populacoes vulneraveis atraves de assimetrias de informacao?

**Red Flags:**
- [ ] Publico tem baixa educacao financeira e estou vendendo produto financeiro complexo
- [ ] Publico esta em estado emocional extremo (luto, divorcio, desespero)
- [ ] Promessas que eu sei que maioria nao conseguira cumprir
- [ ] Uso de taticas de pressao em pessoas em situacao desesperada

**Exploracao Detectada?**
- [ ] NAO - PASS
- [ ] SIM - **VETO ABSOLUTO: Violacao etica fundamental**

---

## GATE 2: Avaliacao do Modelo de Negocio

### 2.1 Margem Bruta

**Pergunta:** A margem bruta e >= 80% (para servicos)?

**Calculo:**
```
Margem Bruta = (Receita - Custo Direto de Entrega) / Receita
Sua Margem = (_______ - _______) / _______ = _____%
```

**Margem Adequada?**
- [ ] >= 80% - PASS
- [ ] 60-80% - ALERTA (modelo apertado, considerar ajustes)
- [ ] < 60% - **VETO: Sem oxigenio para crescer**

**Antidoto se VETO:** Aumentar preco, reduzir custo de entrega, ou mudar modelo (de DFY para DWY, por exemplo)

---

### 2.2 CAC vs Receita Inicial

**Pergunta:** O negocio exige PERDER dinheiro para adquirir cliente?

**Calculo:**
```
CAC (Custo de Aquisicao de Cliente) = $_______
Receita da Primeira Venda = $_______
FECC (Front End Cash Collected) = $_______
```

**FECC > CAC?**
- [ ] SIM (FECC > CAC) - PASS
- [ ] NAO (CAC > FECC) - **VETO: Ciclo de caixa quebrado**

**Antidoto se VETO:** Criar oferta front-end que liquida CAC, reduzir CAC, ou buscar financiamento se justificavel

---

### 2.3 Key Man Risk (Dependencia do Fundador)

**Pergunta:** O negocio depende CRITICAMENTE do fundador para vendas ou entrega?

**Red Flags:**
- [ ] So o fundador consegue fechar vendas
- [ ] So o fundador consegue entregar o servico core
- [ ] Fundador e o "produto" (guru dependency)
- [ ] Sem o fundador, negocio para

**Key Man Risk Detectado?**
- [ ] NAO - PASS
- [ ] PARCIAL - ALERTA (plano de sistematizacao necessario)
- [ ] TOTAL - **VETO: Nao e ativo escalavel, e emprego**

**Antidoto se VETO:** Documentar processos, treinar equipe, criar sistemas que funcionam sem fundador

---

## GATE 3: Avaliacao da Oferta e Taticas

### 3.1 Comoditizacao

**Pergunta:** A oferta e facilmente comparavel com base em PRECO?

**Red Flags:**
- [ ] Cliente pergunta "quanto custa?" antes de entender valor
- [ ] Competidores oferecem "a mesma coisa" mais barato
- [ ] Nao existe diferenciador claro alem de preco
- [ ] Cliente faz "shopping" de propostas
- [ ] Descrição poderia ser de qualquer concorrente

**Comoditizacao Detectada?**
- [ ] NAO - PASS
- [ ] SIM - **MODIFICAR: Requer Grand Slam Offer**

**Antidoto:** Engenharia de Grand Slam Offer para criar "categoria de um" (usar create-grand-slam-offer.md)

---

### 3.2 Taticas Enganosas

**Pergunta:** As taticas de marketing erodem confianca a longo prazo?

**Red Flags:**
- [ ] Escassez FALSA (contador que reseta, vagas que nunca acabam)
- [ ] Urgencia FALSA (deadline que estende automaticamente)
- [ ] Promessas que sei que maioria nao alcancara
- [ ] Depoimentos fabricados ou exagerados
- [ ] Garantias que sei que nao honrarei
- [ ] Precos "originais" inflados artificialmente

**Taticas Enganosas Detectadas?**
- [ ] NAO - PASS
- [ ] SIM - **VETO DA TATICA: Nao usar**

**Principio:** "Trocar ativo de longo prazo (confianca) por ganho de curto prazo e mau investimento estrategico."

---

## GATE 4: Avaliacao de Lideranca (Para Parcerias)

### 4.1 Reatividade Emocional

**Pergunta:** O fundador/lider toma decisoes baseado em emocoes vs dados?

**Red Flags:**
- [ ] Muda estrategia baseado em como "se sente" no dia
- [ ] Toma decisoes impulsivas sem analisar dados
- [ ] Nao consegue separar feedback do produto de feedback pessoal
- [ ] Historico de pivotar rapidamente sem dar tempo para validacao

**Reatividade Emocional Detectada?**
- [ ] NAO - PASS
- [ ] SIM - **VETO DE PARCERIA: Risco de lideranca inaceitavel**

---

## GATE 5: Antipadroes Especificos

### 5.1 Oferta Inchada (Bloated Offer)

**Pergunta:** A oferta tem TANTOS componentes que confunde?

**Red Flags:**
- [ ] Mais de 10 "bonus" listados
- [ ] Cliente nao consegue explicar o que esta comprando
- [ ] Paralisia de analise reportada em vendas
- [ ] Tempo de apresentacao da oferta > 30 minutos

**Oferta Inchada Detectada?**
- [ ] NAO - PASS
- [ ] SIM - **MODIFICAR: Simplificar para 3-5 componentes core**

---

### 5.2 Buraco no Modelo (Entrega Desalinhada)

**Pergunta:** Quem vende tem incentivos alinhados com quem entrega?

**Red Flags:**
- [ ] Vendedor ganha comissao, entregador ganha salario fixo
- [ ] Parceiro de entrega lucra com reembolsos/cancelamentos
- [ ] Franqueado nao tem stake nos resultados do cliente
- [ ] Terceiro pode sabotar entrega sem consequencia

**Desalinhamento Detectado?**
- [ ] NAO - PASS
- [ ] SIM - **MODIFICAR: Reestruturar incentivos**

---

### 5.3 Niche Slapping Fallacy

**Pergunta:** Voce esta pulando de nicho porque "este nao funciona"?

**Red Flags:**
- [ ] Tentou < 90 dias antes de declarar que "nao funciona"
- [ ] Nao fez "Regra dos 100" antes de desistir
- [ ] Acha que outro nicho sera "mais facil"
- [ ] Ja pivotou 3+ vezes no ultimo ano

**Niche Slapping Detectado?**
- [ ] NAO - PASS
- [ ] SIM - **VETO DO PIVOT: Comprometer-se com validacao completa primeiro**

---

## Resumo de Vetos

### Consolidacao

| Gate | Item | Status |
|------|------|--------|
| 1.1 | Churn Estrutural | [ ] PASS [ ] VETO |
| 1.2 | Exploracao de Vulneraveis | [ ] PASS [ ] VETO |
| 2.1 | Margem Bruta | [ ] PASS [ ] VETO |
| 2.2 | CAC vs Receita | [ ] PASS [ ] VETO |
| 2.3 | Key Man Risk | [ ] PASS [ ] VETO |
| 3.1 | Comoditizacao | [ ] PASS [ ] MODIFICAR |
| 3.2 | Taticas Enganosas | [ ] PASS [ ] VETO |
| 4.1 | Reatividade Emocional | [ ] PASS [ ] VETO |
| 5.1 | Oferta Inchada | [ ] PASS [ ] MODIFICAR |
| 5.2 | Buraco no Modelo | [ ] PASS [ ] MODIFICAR |
| 5.3 | Niche Slapping | [ ] PASS [ ] VETO |

### Decisao Final

```
SE qualquer VETO → NAO PROSSEGUIR (aplicar antidoto primeiro)
SE MODIFICAR → Ajustar antes de prosseguir
SE todos PASS → Prosseguir para proxima etapa
```

**Status Final:**
- [ ] **PASS** - Nenhum antipattern critico detectado
- [ ] **MODIFICAR** - Ajustes necessarios antes de prosseguir
- [ ] **VETO** - Nao prosseguir ate resolver

---

## Protocolo de Rejeicao Educacional

Se identificou um antipattern, comunique assim:

### Script de Comunicacao

1. **RECONHECIMENTO:** "Compreendo a logica por tras dessa abordagem..."

2. **DIAGNOSTICO:** "No entanto, isso ativa o antipattern de [NOME], porque viola o principio de [PRINCIPIO]."

3. **CONSEQUENCIA:** "A consequencia previsivel de longo prazo e [CONSEQUENCIA]."

4. **ANTIDOTO:** "Uma abordagem mais robusta seria [ANTIDOTO], porque [BENEFICIO]."

---

## Matriz de Referencia Rapida

| Antipattern | Principio Violado | Consequencia | Antidoto |
|-------------|-------------------|--------------|----------|
| Churn Estrutural | Estabilidade da Base | Colapso do modelo | Mudar segmento |
| Comoditizacao | Circulo Virtuoso do Preco | Corrida para o fundo | Grand Slam Offer |
| Falsa Escassez | Preservacao de Confianca | Erosao de marca | Escassez genuina |
| Oferta Inchada | Minimizar Esforco (Eq. Valor) | Paralisia de analise | Simplificar |
| Key Man Risk | Escalabilidade | Teto de crescimento | Sistematizar |

---

## Assinatura de Aprovacao

| Gate | Responsavel | Data | Status |
|------|-------------|------|--------|
| Antipattern Screening | | | [ ] PASS [ ] VETO |

**Antipatterns Detectados:**
________________________________________________

**Antidotos Aplicados:**
________________________________________________

---

**Checklist Version:** 1.0.0
**Based on:** $100M Offers + KB Antipattern Shields



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
