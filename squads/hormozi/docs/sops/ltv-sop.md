# SOP: Framework de LTV (Lifetime Value) Hormozi

> Extraido de: $100M Money Models - Alex Hormozi
> Versao: 1.0
> Data: 2026-02-10
> Extrator: Hormozi Models Agent (Money Model Engineer)

---

## Tabela de Extracao - Referencias do Material Original

| Elemento | Fonte no Original | Linha Aprox. |
|----------|-------------------|--------------|
| 4 Pilares do Money Model | Framework Completo | 24-46 |
| Framework GMMM | Framework Completo | 52-67 |
| Matriz de Ofertas 4x3 | Framework Completo | 69-78 |
| 7 Mudancas de Paradigma | Framework Completo | 82-88 |
| Churn por Billing Frequency | Secao 4 Downsell | 115-116 |
| Lucro em 30 Dias Formula | Framework Completo | 476-487 |
| Pricing Continuidade vs Standalone | Framework Completo | 489-500 |
| Upsell Classico | Secao 3 Upsell | 27-93 |
| Menu Upsell | Secao 3 Upsell | 94-198 |
| Anchor Upsell | Secao 3 Upsell | 199-263 |
| Rollover Upsell | Secao 3 Upsell | 266-349 |
| Downsell Plano Pagamento | Secao 4 Downsell | 34-119 |
| Trial com Penalidade | Secao 4 Downsell | 122-208 |
| Downsell de Recursos | Secao 4 Downsell | 211-331 |
| Bonus de Continuidade | Secao 5 Continuidade | 19-137 |
| Desconto de Continuidade | Secao 5 Continuidade | 113-120 |
| Taxa Dispensada | Secao 5 Continuidade | 139-203 |
| Car Rental 5.2x | Framework Completo | 459 |
| Hamburger 11.6x | Secao 3 Upsell | 11 |
| Boot Factory 5x | Framework Completo | 415-418 |
| Suit Store 5x | Secao 3 Upsell | 205-217 |
| 14,000 empresas ProfitWell | Secao 4 Downsell | 115 |

---

## 1. Proposito

Maximizar o Lifetime Value (LTV) de cada cliente atraves de uma sequencia deliberada de ofertas que:
1. Recupera CAC em 30 dias
2. Atinge ratio LTGP:CAC de 3:1 ou superior
3. Mantem churn abaixo de 5% mensal

**Insight Central:**
> "Voce pode tosquiar uma ovelha por toda a vida, mas so pode esfola-la uma vez." - John, mentor de Alex Hormozi

---

## 2. Escopo

**Aplica-se a:**
- Negocios com produtos/servicos recorrentes
- Ofertas de ticket medio a alto ($500+)
- Empresas com CAC documentado
- Modelos B2B e B2C com ciclo de venda definido

**NAO aplica-se a:**
- Commodities sem diferenciacao
- Negocios sem capacidade de entrega escalavel
- Modelos com margem bruta < 30%
- Taxa de reembolso > 5%

---

## 3. Pre-condicoes

### Validacao de Negocio
- [ ] Produto validado: pelo menos 10 clientes satisfeitos pagantes
- [ ] Custo de aquisicao conhecido: CAC documentado e consistente
- [ ] Capacidade de entrega: consegue entregar 2x volume atual
- [ ] Sistema de cobranca: processador que aceita planos e recorrencia
- [ ] Caixa minimo: 3 meses de despesas OU linha de credito
- [ ] Tracking instalado: metricas de conversao por estagio

### Red Flags - NAO esta pronto se:
- Taxa de reembolso > 5%
- Nao consegue explicar valor em 30 segundos
- Nao tem depoimentos/casos de sucesso
- Margem bruta < 30%
- Churn > 10% mensal

---

## 4. Framework GMMM (Get Money, More Money, Max Money)

### Visao Geral

```
ESTAGIO 1: GET MONEY (Ofertas de Atracao)
├─ Objetivo: Transformar estranhos em clientes
├─ Meta: Cobrir CAC + COGs
└─ KPI: Lucro de 30 dias > $0

ESTAGIO 2: MORE MONEY (Upsells + Downsells)
├─ Objetivo: Maximizar lucro por cliente
├─ Meta: 3-5x valor inicial
└─ KPI: LTV de 30 dias > 3x CAC

ESTAGIO 3: MAX MONEY (Continuidade)
├─ Objetivo: Receita recorrente previsivel
├─ Meta: 80%+ em continuidade
└─ KPI: Churn < 5% mensal
```

### Matriz de Ofertas 4x3

```
           | Quantidade | Qualidade | Diferente   |
-----------|------------|-----------|-------------|
Atracao    | Mais       | Premium   | Novo        |
Upsell     | Dobro      | Melhor    | Complementar|
Downsell   | Menos      | Inferior  | Alternativa |
Continuidade| Ilimitado | Mantida   | Recorrente  |
```

---

## 5. Os 4 Pilares do LTV

### Pilar 1: Lucro em 30 Dias

**Definicao:** Fazer lucro suficiente para cobrir custos de aquisicao + entrega em 30 dias ou menos.

**Por que e essencial:** Permite usar cartao de credito como capital de giro infinito.

**Consequencia de ignorar:** Ficar sem caixa, parar publicidade, morrer lentamente.

**Formula:**
```
L30 = (P1 x C1) + Sum(Un x Cn x Vn) - CAC - COGS

Onde:
L30 = Lucro em 30 dias
P1 = Preco oferta inicial
C1 = Taxa conversao inicial
Un = Preco upsell n
Cn = Taxa conversao upsell n
Vn = Volume ofertas upsell n
CAC = Custo de aquisicao
COGS = Custo de entrega
```

### Pilar 2: Sequencia Problema-Solucao

**Definicao:** Toda solucao cria um novo problema que requer outra solucao.

**Por que e essencial:** Cria oportunidades naturais de upsell sem parecer forcado.

**Consequencia de ignorar:** Perder 80% do lucro potencial de cada cliente.

**Exemplo:**
- Carro alugado -> precisa seguro (problema criado)
- Desafio fitness -> precisa suplementos (problema criado)
- Software -> precisa treinamento (problema criado)

### Pilar 3: Ancoragem de Valor

**Definicao:** Apresentar primeiro a opcao mais cara para fazer outras parecerem baratas.

**Por que e essencial:** Psicologicamente recalibra percepcao de valor.

**Consequencia de ignorar:** Clientes compram sempre a opcao mais barata.

**Caso Real - Loja de Ternos:**
- Orcamento do cliente: $500
- Primeiro terno apresentado: $16,000
- Segundo terno apresentado: $2,200
- Cliente comprou: $2,200 + $300 acessorios = $2,500 (5x orcamento)

### Pilar 4: Friccao Zero

**Definicao:** Remover toda barreira entre decisao e pagamento.

**Por que e essencial:** 50% das vendas morrem na friccao do pagamento.

**Consequencia de ignorar:** Perder metade das vendas ja fechadas.

**Tecnica - Cartao em Arquivo:**
- NAO pergunte: "Voce quer comprar?"
- PERGUNTE: "Qual cartao voce quer usar?"

---

## 6. ESTAGIO I: Ofertas de Atracao (Get Cash)

### Oferta #1: Ganhe Seu Dinheiro de Volta

**Formula:**
```
INVESTIMENTO INICIAL (100% reembolsavel)
+ CRITERIOS CLAROS DE QUALIFICACAO
+ PRAZO DEFINIDO
= RISCO PERCEBIDO ZERO
= 2-3X MAIS CONVERSOES
```

**Sistema de 5 Passos:**

1. **Definir Investimento**
   - Valor: 3-5x seu custo de entrega
   - Sweet spot: $300-$3,000 (B2C) | $3,000-$30,000 (B2B)
   - Regra: Alto o suficiente para filtrar, baixo o suficiente para ser acessivel

2. **Estabelecer Criterios (3 Modelos)**
   - Modelo A - BASEADO EM RESULTADOS: Perder X quilos em Y semanas
   - Modelo B - BASEADO EM ACOES: Comparecer 100% sessoes, completar 100% tarefas
   - Modelo C - HIBRIDO (MAIS EFICAZ): Acoes obrigatorias (70%) + Resultado minimo (30%)

3. **Estruturar Timeline**
   - Curto (21-28 dias): Maxima urgencia
   - Medio (6-8 semanas): Equilibrio ideal
   - Longo (12-16 semanas): Transformacoes profundas

4. **Aplicar Credito (3 Opcoes)**
   - Opcao A: 100% aplicado na proxima compra imediatamente
   - Opcao B: Credito distribuido ($600 = $50/mes por 12 meses)
   - Opcao C: Cliente escolhe entre A ou B

5. **Script Magico (Todos Ganham)**
   > "Sei que voce esta tentando atingir [meta curto prazo], mas qual e sua meta de longo prazo? ...Para mostrar o quanto quero que voce alcance isso, vou creditar este programa para o proximo QUER VOCE ATINJA SUA META OU NAO. Como isso soa?"

**Numeros Reais:**
- Academia Danny: $500 desafio -> cliente atingiu meta -> usou reembolso para comprar mais -> fotos antes/depois geraram 13 indicacoes
- Academia Alex: $600 desafio -> 34:1 ROI em 48 horas
- 70% dos vencedores convertem para continuidade

**Base do Calculo:**
```
Investimento: $600
Custo de entrega: $120
10% pedem reembolso: -$60
90% ficam (na media): $540 receita
Liquido primeiros 30 dias: $540 - $120 = $420 lucro
Custo por lead (se CAC $100): $420 / $100 = 4.2:1 LTGP:CAC em 30 dias
```

### Oferta #2: Sorteios (Giveaways)

**Como Funciona:**
Muitos entram para ganhar. Um ganha. O resto recebe "bolsa parcial" (desconto).

**Sistema de 6 Passos:**

1. **Escolher Premio Principal**
   - Premio = Exatamente o que quer vender depois
   - Valor Percebido = 10-20x seu ticket medio

2. **Criar Oferta Promocional (O SEGREDO)**
   - "Bolsa Parcial" = 30-50% desconto no total
   - Mas APRESENTE como 70-90% desconto
   - Math: $10,000 premio -> "bolsa parcial" $7,000 -> cliente paga $3,000

3. **Estruturar Captura**
   - Obrigatorio: Nome, Email, Telefone, Pergunta Qualificadora
   - Pergunta Magica: "Por que voce merece ganhar?"

4. **Definir Timeline**
   - Dias 1-3: Promocao massiva
   - Dias 4-5: "Ultimas vagas"
   - Dia 6: "Ultimo dia!"
   - Dia 7: Anunciar vencedor
   - Dias 7-14: Converter "perdedores"

5. **Executar Anuncio**
   - Publico: Post celebrando vencedor
   - Privado: Email/SMS "perdedores" - ONDE ESTA O DINHEIRO

6. **Converter os "Perdedores" (Master Script)**
   > "Oi [Nome], primeiro PARABENS! Suas respostas foram TAO BOAS que consegui uma bolsa parcial de $[X]! Normalmente $[cheio], com bolsa apenas $[preco real]. Preciso resposta ate [amanha], apenas [3] bolsas parciais. Pode aproveitar?"

**Hacks:**
- VENCEDOR DUPLO: "Se alguem que voce indicou ganhar, voce tambem ganha!" = 3-5x participantes
- The Economist Play em bolsas: A ($59), B ($125), A+B ($125) -> 80% escolhem combo

**Base do Calculo:**
```
Custo premio: $5,000 | Marketing: $2,000 | Total: $7,000
500 participantes -> 200 compram a $3,000 (40%) = $600,000
ROI: $600,000 / $7,000 = 85.7:1
```

### Oferta #3: Oferta Isca (Decoy)

**Como Funciona:**
Versao basica gratuita/barata vs versao premium completa. Isca existe APENAS para fazer premium parecer obvio.

**Construcao:**
- **ISCA:** Remova suporte, garantias, bonus, prioridade, personalizacao. Mantenha APENAS funcao core. Preco: Custo + 10% margem.
- **PREMIUM:** Adicione tudo. 1-on-1, garantia, todos bonus, acesso vitalicio. Preco: 3-5x isca.

**Script de Apresentacao:**
> "Voce esta aqui para coisas gratis ou resultados duradouros?" [99% dizem resultados]
> "BASICO $497: [minimalista] - Voce esta por conta propria."
> "PREMIUM $1,997: [impressionante] - Garantimos seu sucesso."
> "Qual te leva ao seu objetivo 10x mais rapido?"

**Base do Calculo:**
```
100 prospects: 25 isca a $497 = $12,425 | 60 premium a $1,997 = $119,820
Total: $132,245 vs oferta unica $997: ~30 compradores = $29,910 -> 4.4x lift
```

### Oferta #4: Compre X Ganhe Y Gratis

**Como Funciona:**
Mesma matematica, frame diferente -> 5x mais vendas.
"Compre 1 par $600, ganhe 2 gratis" vs "$200/par" = mesma margem, 5x volume

**Configuracoes por Margem:**
```
< 30% margem:  Compre 2, Ganhe 1 (fisico)
30-60% margem: Compre 1, Ganhe 1 (servicos)
60-80% margem: Compre 1, Ganhe 2 (digital)
> 80% margem:  Compre 1, Ganhe 3+ (software)
```

**Caso Real - Boot Factory Nashville:**
"Compre 1, ganhe 2 gratis" a $600 -> 5x vendas, dominio de mercado por decadas

### Oferta #5: Pague Menos Agora ou Pague Mais Depois

**Como Funciona:**
- Opcao A (DEPOIS): $0 hoje, $497 amanha. Risco zero. Cartao em arquivo.
- Opcao B (AGORA): $297 hoje (40% menos) + bonus exclusivos.
- 60% escolhem pagar agora.

**Matrix por Ticket:**
```
Baixo (<$500):   Depois 100%, Agora 60% (40% off)
Medio ($500-2k): Depois 100%, Agora 50% (50% off)
Alto (>$2k):     Depois 100%, Agora 40% (60% off)
```

**Base do Calculo:**
```
100 prospects: 60 pagam $297 = $17,820 | 40 pagam depois $497 (80% completam) = $15,904
Total: $33,724 vs oferta unica $497: ~40 compradores = $19,880 -> 1.7x lift
```

---

## 7. ESTAGIO II: Ofertas de Upsell (More Cash)

### Oferta #6: Upsell Classico

**Formula:** "Voce nao pode ter X sem Y"

**Exemplo - Aluguel de Carro:**
- Carro alugado -> seguro -> gasolina -> checkout tardio = 5.2x ($19 -> $100)

**Exemplo - Hamburguer:**
- Hamburguer -> batatas -> bebida -> supersize = 11.6x ($0.25 -> $3.00 lucro)

**Taticas Chave:**
1. Upsells mais lucrativos primeiro
2. "Voce nao quer mais nada, quer?" (Nao = Sim)
3. Surprise and delight: de TODOS bonus mesmo se aceitarem antes
4. Hiper-compra: casamentos, bebes, novos hobbies -> abrace upsells
5. Bonus gratis CRIAM problemas que upsells resolvem
6. Quanto mais rapido acesso, maior o valor
7. Agrupe upsells e NOMEIE (pacote transformacao)
8. BAMFAM: Book A Meeting From A Meeting = 5x mais oportunidades
9. Integre upsells na entrega de outras ofertas

**Numeros Reais:**
- 19 pitches falhados -> "chocolate ou baunilha?" -> venda instantanea -> $5-10k/dia
- Win-back: 200 videos personalizados -> $1.9M ARR
- Media 2-4x aumento LTV quando bem posicionado

### Oferta #7: Menu Upsell

**Formula:** Unsell -> Prescribe -> A/B -> Cartao em Arquivo

1. **UNSELLING:** Risque o que NAO precisam -> constroi boa vontade -> 25% para 75% conversao
2. **PRESCRICAO:** Diga o que precisam, como usar, quando, quanto
3. **A/B:** "Chocolate ou baunilha?" remove "sim/nao" -> ambas escolhas = venda
4. **CARTAO EM ARQUIVO:** "Usar o cartao em arquivo?" -> 40% aumento conversao

**The Economist Play:**
A ($59), B ($125), A+B ($125) -> 80% escolhem combo

**Numeros Reais:**
- $0 para $5-10k/dia vendas suplemento usando menu upsell
- 80%+ conversao quando feito corretamente
- Unselling: 25% -> 75% conversao (3x)

### Oferta #8: Anchor Upsell

**Formula:** Premium primeiro -> Engasgo -> Resgate -> Oferta principal -> Pagamento

**Passos:**
1. Apresente a ancora (5-10x preco)
2. Espere o engasgo
3. Venha ao resgate: "Voce se importa muito com [feature premium]?"
4. Apresente oferta principal
5. Pergunte como querem pagar

**CRITICO:** Trate ancora como oferta REAL. Se falsa, perdem confianca.

> "A unica coisa pior que fazer oferta de $1,000 para pessoa com orcamento de $100 e fazer oferta de $100 para pessoa com orcamento de $1,000."

**Base do Calculo:**
```
Sem ancora: 30 compram a $2,200 = $66,000
Com ancora: 15 premium a $16k + 45 principal a $2.2k = $240k + $99k = $339k
Lift: 5.1x receita
```

### Oferta #9: Rollover Upsell

**Formula:** Credite compra anterior para proxima compra maior

**4 Situacoes:**
1. REENGAJAR clientes antigos (6+ meses)
2. RESGATAR clientes chateados (em vez de reembolso)
3. ROUBAR clientes insatisfeitos de concorrentes
4. UPSELL clientes atuais (distribua credito)

**Precificacao:** Upsell pelo menos 4x o credito -> maximo 25% desconto

**Hack - Jogada do Cartao-Presente:**
- Venda cartoes-presente de $200 por $20
- Limite a dois por cliente, so podem usar em outros
- Quando vierem, role cartao para oferta de $1,000+
- Clientes PAGAM VOCE para indicar amigos

**Numeros Reais:**
- 200 videos personalizados -> 20% aceitaram -> $1.9M extra ARR
- Um dia gravando -> $480k/ano receita liquida nova

---

## 8. ESTAGIO III: Ofertas de Downsell (Turn No's into Yes's)

### Regras de Downselling

1. **Nao significa nao para ESTA oferta, nao todas**
2. **Downsells sao TROCAS** - de algo, receba algo
3. **Personalize, nao pressione**
4. **Mesma coisa de maneiras NOVAS**
5. **NUNCA baixe preco da mesma coisa** - mude oferta com preco
6. **Clientes falam sobre preco** - consistencia importa

### Oferta #10: Downsell de Plano de Pagamento

**Processo de 7 Passos (pare quando comprarem):**

1. **Recompense pagar integralmente** (preco COM juros -> pre-pagar = desconto)
2. **Financiamento terceiros / cartao credito / layaway**
   - "Voce prefere que EU decida seus termos ou VOCE decide?" -> "Eu decido" -> cartao
3. **Metade agora, metade depois** (alinhe com dia pagamento)
4. **CHECK:** Escala 1-10. 8+ continue. 7- mude para downsell recursos
5. **Divida em tres pagamentos**
6. **Espalhe uniformemente** (ex: 16 semanas = 16 pagamentos)
7. **Trial gratuito** (-> Trial com Penalidade)

**Tecnica Gangorra:**
> "Pagamentos mensais gigantes ou pequenos?" -> "Pequenos"
> "Pre-pague hoje: desconto massivo + zero mensais. Funciona?"
> Se nao: "Quanto mais der agora = menores mensais."

**Dados de Churn (14,000 empresas via ProfitWell):**
```
Mensal:     10.7% churn/mes
Trimestral: 5% churn/mes
Anual:      2% churn/mes

REGRA: Dobrar periodo = metade do churn. Sempre comece alto.
```

**Base do Calculo:**
```
Sem plano: 30 compram a $1,000 = $30,000
Com plano downsell: 30 integral + 20 planos (80% completam) = $30k + $16k = $46,000
Lift: 53% aumento receita
```

### Oferta #11: Trial com Penalidade

**Formula:** "Se voce fizer X, Y, Z, deixo voce comecar de graca."

**5 Passos:**

1. **Ofereca trial POR ULTIMO** (so apos principal rejeitada)
2. **SEMPRE pegue cartao** ("Qual cartao?" / "E como sempre fizemos")
3. **Venda ficar e pagar** ("Se funcionar, voce ficara a longo prazo?")
4. **Explique taxas APOS cartao** (nao antes -> mais resistencia)
5. **Check-ins OBRIGATORIOS** (suas oportunidades de upsell)

**Pos-Trial:**
- **Gostou:** Facil upsell para servico maior/mais longo
- **Odiou:** "Voce esta certo, estou irritado. Suas necessidades combinam com nosso premium." (50% compram)
- **Nao usou:** Contate multiplas vezes, dispense taxa se encontrarem

**Base do Calculo:**
```
100 leads: 30 compram principal $1,000 + 40 trial
8 falham criterios ($200 penalidade) + 24 convertem ($500/mes)
30 dias: $30,000 + $1,600 + $12,000 = $43,600 -> 45% lift
```

### Oferta #12: Downsell de Recursos

**Formula:** Remova recurso -> baixe preco -> "E agora?"

**O Hack da Garantia:**
```
Oferta completa $1,000 com garantia: 25 compram
Remova garantia, $600: alguns compram ISSO
MAS muitos reconsideram -> compram COMPLETA $1,000 porque AGORA veem valor da garantia
Resultado: 35 completa + 40 sem = 75 total (era 25) -> triplicou taxa fechamento
```

**O Que Remover (maior valor primeiro para triggerar re-upsell):**
- Quantidade, qualidade, nivel servico, disponibilidade, velocidade
- Ratio, comunicacao, provedor, ao vivo vs gravado
- DIY vs DFY, personalizacao, seguro/garantia, recursos inteiros

**Base do Calculo:**
```
Antes: 25 x $1,000 = $25,000
Depois: 35 x $1,000 + 40 x $600 = $59,000 -> 2.36x lift
40% dos compradores downsell eventualmente fazem upgrade
```

---

## 9. ESTAGIO IV: Ofertas de Continuidade (Max Cash)

### Oferta #13: Bonus de Continuidade

**Formula:** Bonus incrivel para assinar hoje. Valor bonus > primeiro pagamento.

**Tipos:**
- **Produtos:** "$800 em brinquedos gratis com $59/mes racao cachorro"
- **Servicos:** "$1,000 acelerador gratis com $100/mes membresia"
- **Digital:** "Todas 40 newsletters passadas ($15,880) com $399/mes assinatura"

**Pricing Standalone vs Continuidade:**
```
50% continuidade: Standalone = 1.33x mensal
60% continuidade: Standalone = 1.66x mensal
70% continuidade: Standalone = 2.00x mensal
80% continuidade: Standalone = 2.33x mensal
90% continuidade: Standalone = 2.66x mensal
```

**Upsell Apos Entrada:** Pre-pago em bloco (compre 5 ganhe 1 gratis)
- 1 em 8 pegando = 50% mais lucro 30 dias

**Numeros Reais:**
- Academia: Antes 17% continuidade efetiva. Apos bonus: 40% direto. 2.35x lift.
- 8 de 40 pegam pre-pago anual -> boost massivo caixa

**Base do Calculo:**
```
40 entram $99/mes (custo bonus $50 cada = $2,000)
8 pre-pagam anual $990
Mensal: $3,168 + $660 = $3,828/mes -> $45,936/ano
vs desafio-apenas: $20,196/ano -> 2.27x lift ARR
```

### Oferta #14: Desconto de Continuidade

**Formula:** Tempo gratis com compromisso
- "3 meses gratis com commit 12 meses" -> 25% off efetivo
- "Compre 6 meses, ganhe 6 meses gratis" -> 50% off, dobra compromisso

**4 Formatos de Anuncio:**
1. Percentual: 25% off
2. Dolar: $300 off
3. Porcao gratis: 3 meses gratis
4. Total: 12 meses por $900 (riscado $1,200)

**Base do Calculo:**
```
Mes-a-mes $99: media 10 meses = $990 LTV
Commit 12 meses $75/mes: garantido $900 + 60% renovam = $1,440 media LTV -> 45% lift
```

### Oferta #15: Taxa Dispensada

**Formula:** Taxa setup com mes-a-mes OU dispensada com commit anual

```
Opcao A: $5,000 setup + $1,000/mes, cancele quando quiser
Opcao B: $0 setup, commit 12 meses a $1,000/mes
Sair cedo -> paga taxa dispensada

85% escolhem compromisso. Churn <5%.
```

**Por Que Funciona:**
- Pessoas COMECAM para evitar taxa
- Pessoas FICAM porque sair > ficar
- Apos compromisso: taxa desaparece para sempre (equitativo)

**Cancelamento Baseado em Causa (Avancado):**
> "Qual causa voce absolutamente ODEIA?"
> "Se cancelar cedo, doando sua taxa para eles."
> Dupla aversao = 50% reducao churn adicional

**Setup:**
- Duracao: 12 meses minimo
- Taxa: 3-5x mensal
- Saida antecipada: paga taxa dispensada
- Se >5% querem sair cedo -> investigue produto, nao pricing

**Base do Calculo:**
```
85 anual $1,000/mes = $1,020,000
15 mes-a-mes $5,000 setup + $15,000/mes
Ano 1: $1,020k + $75k + $120k = $1,215,000
Sem taxa: 100 x $1,000 x media 6 meses = $600,000 -> 2x+ lift
```

---

## 10. Health Check System

### LTGP:CAC Analysis

```
LTGP:CAC > 3:1 -> "Escalar agressivamente. Modelo imprimindo dinheiro.
  Invista cada centavo em aquisicao. Use cartao como capital infinito.
  O unico erro agora e nao escalar rapido o suficiente."

LTGP:CAC 2-3:1 -> "Otimizar Money Model. Ganhando dinheiro mas
  deixando na mesa. Provavelmente faltam upsells ou continuity fraca.
  Adicione pelo menos 2 ofertas na sequencia."

LTGP:CAC < 2:1 -> "PARAR E CONSERTAR URGENTE. Modelo sangrando.
  Cada cliente novo custando mais que deveria. Redesenhe sequencia
  de ofertas ANTES de gastar mais um centavo em marketing."
```

### 30-Day CAC Recovery

```
CAC Recovery < 30 dias -> "Negocio saudavel. Pode usar cartao
  como capital de giro infinito. Continue escalando."

CAC Recovery > 30 dias -> "RISCO DE FALENCIA. Gastando mais rapido
  do que ganha. A cada dia acima de 30, acumula divida operacional.
  82% dos negocios morrem por falta de cash flow, nao de clientes."
```

### Churn Rate Analysis

```
Churn < 5% mensal -> "Excepcional. Produto forte, entrega forte.
  Foque em aquisicao e upsells."

Churn 5-10% mensal -> "Saudavel mas melhoravel. Considere ofertas de
  taxa dispensada e bonus de continuity para reduzir."

Churn > 10% mensal -> "PROBLEMA CRITICO. Ou vendendo produto
  errado, entregando mal, ou atraindo cliente errado.
  Nao adianta otimizar Money Model se produto nao entrega."
```

### Benchmarks de Performance

```
RUIM:      Lucro 30 dias negativo
MEDIO:     Lucro 30 dias = 1x CAC
BOM:       Lucro 30 dias = 2x CAC
EXCELENTE: Lucro 30 dias = 3x+ CAC
```

---

## 11. D.I.E. Framework

```
DIAGNOSE -> IMPLEMENT -> EVALUATE

DIAGNOSE: Onde esta o problema?
  Pergunte: "CAC, ticket medio, conversao, churn, billing cycle?"
  Calcule: LTGP:CAC, 30-day recovery, churn rate
  Identifique: Qual dos 4 estagios quebrado ou faltando?

IMPLEMENT: Qual Money Model resolve?
  CAC > 30-day revenue -> Conserte Oferta Atracao
  Margens baixas -> Adicione Upsells
  Conversao < 20% -> Adicione Downsells
  Sem previsibilidade -> Adicione Continuidade

EVALUATE: Numeros em 30 dias
  30-day cash: $X -> $Y
  CAC payback: X -> Y dias
  LTGP:CAC: X:1 -> Y:1
```

---

## 12. Cash First Hierarchy

```
1. CONSERTE ATRACAO (se CAC > 30-day revenue)
   -> Perdendo dinheiro por cliente. Nada mais importa.

2. ADICIONE UPSELLS (se cobriu mas margens baixas)
   -> Classico primeiro -> Menu -> Anchor -> Rollover

3. ADICIONE DOWNSELLS (se conversao < 20%)
   -> Plano Pagamento primeiro -> Trial Penalidade -> Recursos

4. ADICIONE CONTINUIDADE (se 1-3 funcionam)
   -> Bonus primeiro -> Taxa Dispensada -> Desconto
```

---

## 13. 10 Verdades Contra-Intuitivas

1. **Gratis custa mais que pago** (gratis 40% show-up, $1 = 80%, $10 = 90%)
2. **Mais ofertas = mais vendas** (9 sequenciais = 3x conversao vs 1)
3. **Preco maior = menos churn** (14,000 empresas provam)
4. **Penalidades aumentam satisfacao** (80% conclusao vs 20%)
5. **Comecar caro = vender mais barato** ($16k ancora -> $2.2k parece negocio)
6. **Dificultar saida = facilitar permanencia** (sair > ficar = retencao)
7. **Dar para receber mais** (margem zero front-end OK se upsells compensam)
8. **Vender o que NAO precisam** (unselling: 25% -> 75% conversao)
9. **Esconder preco ate fim** (valor primeiro = 3x conversao)
10. **Menos escolha = mais compra** ("Chocolate ou baunilha?" > "Quer comprar?")

---

## 14. 10 Erros Fatais

1. **Mesma coisa mais barata** -> confianca destruida
2. **Pular upsell** -> perde 80% lucro
3. **Desistir no primeiro nao** -> perde 60% vendas
4. **Sem cartao em trials** -> 90% somem
5. **Tempo demais para decidir** -> momentum morre
6. **Explicar antes de ancorar** -> efeito perdido
7. **Muito complexo** -> paralisia
8. **Sem follow-up** -> perde 40%
9. **Aceitar "nao tenho dinheiro"** -> sempre ofereca plano
10. **Tudo de uma vez** -> sistema quebra (um estagio por trimestre)

---

## 15. Timeline de Implementacao

### FASE 1: FUNDACAO (Semanas 1-4)

```
Semana 1: Descoberta e Mapeamento
- [ ] Seg-Ter: Mapear jornada atual (cada touchpoint)
- [ ] Qua-Qui: Identificar 10 problemas criados pela solucao
- [ ] Sex-Dom: Escolher 1 oferta atracao e criar materiais

Semana 2: Teste de Atracao
- [ ] Seg-Ter: Testar oferta com 10 prospects
- [ ] Qua-Qui: Ajustar baseado em objecoes
- [ ] Sex-Dom: Documentar script vencedor

Semana 3: Primeiro Upsell
- [ ] Seg-Ter: Criar upsell classico "nao pode ter X sem Y"
- [ ] Qua-Qui: Testar com todos que compraram
- [ ] Sex-Dom: Medir taxa aceitacao (meta: 30%)

Semana 4: Downsell Basico
- [ ] Seg-Ter: Implementar plano pagamento simples
- [ ] Qua-Qui: Oferecer para todos os "naos"
- [ ] Sex-Dom: Calcular lucro 30 dias total
```

### FASE 2: OTIMIZACAO (Semanas 5-8)

```
Semana 5-6: Menu de Ofertas
- Criar 3 niveis servico (minimo, padrao, premium)
- Implementar unselling para personalizacao
- Adicionar upsell AB em cada categoria

Semana 7-8: Otimizacao de Conversao
- Anchor com premium 5x preco
- Trial com penalidade para hesitantes
- Rollover para clientes antigos
```

### FASE 3: ESCALA (Semanas 9-12)

```
Semana 9-10: Continuidade Dominante
- Migrar 60%+ para recorrencia
- Implementar bonus massivos
- Taxa dispensada para compromissos

Semana 11-12: Automacao e Escala
- CRM com triggers automaticos
- Scripts documentados para equipe
- Dobrar volume mantendo conversao
```

---

## 16. Regras de Decisao

```yaml
# Health Check
DR-001: "LTGP:CAC > 3:1 -> Escalar agressivamente"
DR-002: "LTGP:CAC 2-3:1 -> Otimizar (adicionar ofertas)"
DR-003: "LTGP:CAC < 2:1 -> PARAR e consertar"

# 30-Day Cash
DR-004: "CAC recovery < 30 dias -> Modelo saudavel"
DR-005: "CAC recovery > 30 dias -> Risco falencia"

# Churn
DR-006: "Churn < 5% -> Foque aquisicao"
DR-007: "Churn 5-10% -> Adicione continuidade"
DR-008: "Churn > 10% -> Problema de produto"

# Sequencia
DR-009: "Sempre apresente premium primeiro (anchor)"
DR-010: "Ofereca ate ouvir sim (7-10 ofertas normal)"
DR-011: "Cartao primeiro, explicacao depois"
DR-012: "Billing mais longo = menos churn"
```

---

## 17. Troubleshooting

| Sintoma | Causa Provavel | Solucao |
|---------|---------------|---------|
| Conversao < 10% | Oferta errada | Mude para outro tipo atracao |
| Upsell < 20% | Timing/relevancia | Mova para momento diferente |
| Downsell < 30% | Muito caro/complexo | Simplifique opcoes |
| Churn > 10% | Produto nao entrega | Conserte produto primeiro |
| Lucro negativo | Poucas ofertas | Adicione ofertas ou aumente precos |

---

## 18. Outputs do Framework

- Sequencia completa de ofertas (Atracao -> Upsell -> Downsell -> Continuidade)
- Scripts validados para cada tipo de oferta
- Calculadora de unit economics
- Health check dashboard
- Timeline de implementacao por fase

---

## Appendix A: Scripts Chave

### Script Upsell Classico
> "Otimo! Agora que voce tem [solucao A], precisa resolver [problema B criado por A]. 90% dos nossos clientes que conseguem [resultado] tambem pegam [produto B]. Voce nao pode ter [resultado final] sem [produto B]. Quer adicionar por apenas $[X] ao inves dos $[2X] normais? ...Voce nao quer mais nada, quer?" [Nao = Sim]

### Script Downsell Gangorra
> "Prefere pagamentos mensais gigantes ou pequenos?" [Cliente: Pequenos]
> "Normalmente custa $[X], mas se pre-pagar hoje, zero pagamentos mensais. Funciona?"
> [Se nao] "Quanto mais der agora, menores seus pagamentos. Qual valor funciona hoje?"

### Script Trial com Penalidade
> "Que tal comecarmos voce gratuitamente? So preciso do cartao para garantir comprometimento. Se fizer tudo certinho, nao paga nada. Se pular algo, pequena taxa para manter no caminho. E assim que sempre fizemos. Justo?"

### Script Anchor
> "Temos duas opcoes. Primeiro, nosso [premium] por $[5-10x]. Inclui [tudo].
> [Espere engasgo] Voce se importa muito com [feature premium]?"
> [Cliente: Nao] "Perfeito. Entao nosso [principal] por $[X] e exatamente o que precisa. Qual cartao prefere?"

---

## Appendix B: Casos de Referencia

| Caso | Metrica | Resultado |
|------|---------|-----------|
| Gym Launch | $0 -> receita | $4.4M/mes em 20 meses |
| Prestige Labs | $0 -> receita | $1.7M em 7 semanas |
| ALAN Network | Academias | 32 -> 4,000 |
| Car Rental | Ticket | $19 -> $100 (5.2x) |
| Hamburger | Lucro | $0.25 -> $3 (11.6x) |
| Boot Factory | Volume | 5x vendas |
| Suit Store | Budget | $500 -> $2,500 (5x) |
| Win-back Videos | ARR | 200 videos -> $1.9M |

---

**Validation Score: 11/11 partes completas**
**Source References: 70+ elementos mapeados**
**Blueprint pronto para squad creation.**

---

*SOP extraido pelo Hormozi Models Agent em 2026-02-10*
*Baseado 100% em conteudo original de Alex Hormozi - $100M Money Models*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
