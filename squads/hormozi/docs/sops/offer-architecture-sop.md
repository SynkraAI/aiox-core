# SOP: Arquitetura de Ofertas (Money Models Framework)

> Extraído de: $100M Modelos (100 Million Dollar Money Models)
> Versão: 1.0
> Data: 2026-02-10
> Extrator: SOP Extractor Agent

---

## 1. Propósito

Construir um Modelo de Dinheiro completo - uma sequência deliberada de ofertas que transforma cada interação em múltiplas oportunidades de venda, gerando lucro suficiente em 30 dias para cobrir custos de aquisição e entrega, permitindo escala infinita.

[Fonte: Framework Completo, "Um Modelo de Dinheiro é uma sequência deliberada de ofertas... máquina que extrai o máximo valor em 30 dias ou menos"]

---

## 2. Escopo

**Aplica-se a:**
- Serviços e licenciamentos ($16k-$42k)
- Negócios locais (academias, clínicas, serviços)
- Produtos físicos (e-commerce, assinaturas)
- Produtos digitais (cursos, newsletters, software)

**NÃO aplica-se a:**
- Negócios sem produto validado (mínimo 10 clientes satisfeitos)
- Operações com margem bruta < 30%
- Negócios com churn > 10% mensal

[Fonte: Framework Completo, "Red Flags - NÃO está pronto se: Taxa de reembolso > 5%, Margem bruta < 30%, Churn > 10% mensal"]

---

## 3. Pré-condições

- [ ] Produto validado: pelo menos 10 clientes satisfeitos pagantes
- [ ] Custo de aquisição conhecido: CAC documentado e consistente
- [ ] Capacidade de entrega: consegue entregar 2x volume atual
- [ ] Sistema de cobrança: processador que aceita planos e recorrência
- [ ] Mentalidade: "Todo não é rejeição, é redirecionamento"
- [ ] Caixa mínimo: 3 meses de despesas OU linha de crédito
- [ ] Tracking instalado: métricas de conversão por estágio

[Fonte: Framework Completo, Seção 2.1 "Pré-Requisitos Absolutos"]

---

## 4. Processo de Arquitetura de Ofertas (4 Estágios)

### ESTÁGIO 1: GET MONEY - Ofertas de Atração

**Tipo Cognitivo:** Síntese + Criatividade
**Executor:** Human (estratégia) + Agent (implementação)

**Objetivo:** Transformar estranhos em clientes cobrindo CAC + COGs
**KPI:** Lucro de 30 dias > $0

[Fonte: Seção 1, "Modelos de dinheiro são uma sequência de ofertas... Ofertas de atração geram leads e os convertem em clientes"]

#### Step 1.1: Selecionar Tipo de Oferta de Atração

| Tipo | Quando Usar | Mecânica | Taxa Esperada |
|------|-------------|----------|---------------|
| **Ganhe Seu Dinheiro de Volta** | Atividades de começar/parar (fitness, negócios, habilidades) | Cliente paga, recebe de volta se cumprir critérios | 10% reembolso |
| **Sorteios** | Geração massiva de leads | Grande prêmio + bolsa parcial para todos | Alta conversão |
| **Oferta Isca** | Maximizar conversão geral | Isca básica vs Premium lado a lado | Ambos convertem |
| **Compre X, Ganhe Y Grátis** | Produtos físicos, serviços de prazo | Preço 3x normal, "2 grátis" | 5x volume |
| **Pague Menos Agora ou Mais Depois** | Workshops, trials | $0 agora/$297 depois vs $97 agora + bônus | Remove risco |

[Fonte: Seção 2, "Nesta seção, eu apresento minhas cinco formas favoritas de ganhar dinheiro oferecendo coisas gratuitas"]

#### Step 1.2: Configurar Oferta "Ganhe Seu Dinheiro de Volta"

**Critérios de Qualificação (3 características):**
1. **Fácil de rastrear:** Treine-os exatamente sobre o que precisam fazer
2. **Gerar resultados:** Critérios prováveis de levá-los aos resultados desejados
3. **Divulgar o negócio:** Postar progresso, marcar redes sociais, indicar

**Template:**
```
NOME DO PROGRAMA: [Resultado] em [Tempo] ou É Grátis
INVESTIMENTO: $[X] (reembolsável)

CRITÉRIOS PARA REEMBOLSO:
□ Comparecer a 100% das sessões
□ Completar 100% das tarefas
□ Postar progresso semanalmente
□ Participar da reunião final

COMO APLICAR CRÉDITO:
- Opção A: 100% para próximo programa
- Opção B: $[X/12] desconto por 12 meses
```

[Fonte: Seção 2, "Como Criar Seus Critérios de 'Ganhe Seu Dinheiro de Volta'"]

**Regra de Aplicação de Crédito:**
> "Evite dar três meses grátis antecipadamente. Em vez disso, aplique os $600 ao longo de 12 meses. $600 ÷ 12 = $50/mês de desconto."

[Fonte: Seção 2, "Como Você Aplica o Crédito na Loja"]

#### Step 1.3: Configurar Oferta Isca

**Estrutura:**
```
OFERTA DE ATRAÇÃO: [Benefício] em [Tempo]
├── OPÇÃO ISCA (Gratuita/Desconto)
│   └─ Treinos básicos, plano geral, sem suporte, sem garantia
└── OPÇÃO PREMIUM (Preço Cheio)
    └─ Ilimitado, personalizado, suporte individual, garantia
```

**Script de Permissão:**
> "Você está aqui para coisas grátis ou resultados duradouros?"

[Fonte: Seção 2, "Oferta Isca - Peça permissão para vender"]

#### Step 1.4: Configurar "Compre X, Ganhe Y Grátis"

**Fórmula Boot Factory:**
```
Preço unitário normal: $200
Oferta: Compre 1 por $600, ganhe 2 grátis
Resultado: 3 pares × $200 = $600 (mesma matemática, 5x vendas)
```

**Regra:** Mais coisas grátis do que pagas funciona melhor
- "Compre 2, ganhe 10" > "Compre 10, ganhe 2"

[Fonte: Seção 2, "A Boot Factory... $600 pelo par. Três vezes o preço de um único par porque vinham com mais dois pares"]

---

### ESTÁGIO 2: MORE MONEY - Ofertas de Upsell

**Tipo Cognitivo:** Análise + Execução
**Executor:** Hybrid (scripts padronizados + adaptação)

**Objetivo:** Maximizar lucro por cliente
**Meta:** 3-5x valor inicial
**KPI:** LTV de 30 dias > 3x CAC

[Fonte: Seção 3, "Upsells significam simplesmente o que oferecemos em seguida... frequentemente geram a maior parte do lucro"]

#### Step 2.1: Mapear Problema-Solução

**Framework "Você não pode ter X sem Y":**
```
OFERTA PRINCIPAL: [Solução A]
├── PROBLEMA CRIADO 1: [Nova necessidade]
│   └─ UPSELL 1: [Solução para problema 1]
├── PROBLEMA CRIADO 2: [Nova necessidade]
│   └─ UPSELL 2: [Solução para problema 2]
└── PROBLEMA CRIADO N: [Nova necessidade]
    └─ UPSELL N: [Solução para problema N]
```

**Exemplo Locadora de Carros:**
1. Carro alugado → Precisa combustível → Gasolina pré-paga
2. Carro alugado → Pode amassar → Seguro premium
3. Carro alugado → Checkout fixo → Devolução tardia
4. Carro alugado → Espaço pequeno → Upgrade de veículo

[Fonte: Seção 1, "A locadora pensou em cada nuance... meu aluguel de $19 se tornou um aluguel de $100"]

#### Step 2.2: Implementar Upsell Clássico

**Script:**
> "Ótimo! Agora que você tem [solução A], precisa resolver [problema B criado por A]. 90% dos nossos clientes que conseguem [resultado] também pegam [produto B]. Você não pode ter [resultado final] sem [produto B]. Quer adicionar por apenas $[X] ao invés dos $[2X] normais? ...Você não quer mais nada, quer?" [Não = Sim]

[Fonte: Seção 3, "O Upsell Clássico - Script"]

**Táticas Críticas:**
- **Faça-os dizer não para dizer sim:** "Você não quer mais nada, quer?" transforma não em sim
- **Surpreenda e encante:** Dê todos os bônus mesmo se compraram antes
- **BAMFAM:** Book a Meeting From a Meeting - sempre agende próximo encontro

[Fonte: Seção 3, "Notas importantes - Faça-os dizer não para dizer sim"]

#### Step 2.3: Implementar Menu Upsell (4 Táticas)

**Sequência:**
```
1. DESVENDA (Unselling)
   "Você não vai precisar deste [item irrelevante]."
   ✗ Riscar o que NÃO precisam

2. PRESCREVE
   "Você vai querer tomar [X] quantidade de [Y] após [Z]."
   ✓ Dizer exatamente o que precisam e como usar

3. UPSELL AB
   "Você prefere [Opção A] ou [Opção B]?"
   Remove opção de não comprar

4. CARTÃO EM ARQUIVO
   "Quer apenas usar o cartão em arquivo?"
   Reduz fricção de pagamento
```

[Fonte: Seção 3, "Menu Upsells - combinam até quatro táticas"]

**Exemplo Completo (Massagista):**
- **Desvenda:** "Temos massagem linfática, mas você não está grávida, certo? Podemos riscar."
- **Prescreve:** "Como seu ombro dói, vamos aquecer primeiro, trabalhar pontos-gatilho, depois alongamentos."
- **AB:** "Prefere fazer antes do trabalho ou no caminho para casa?"
- **Cartão em arquivo:** "Quer usar o cartão em arquivo?"

[Fonte: Seção 3, "Exemplos - Massagista"]

#### Step 2.4: Implementar Anchor Upsell

**Processo em 5 Passos:**
```
1. APRESENTE A ÂNCORA (coisa 5-10x mais cara)
2. OBTENHA O ENGASGO (espere o susto)
3. VENHA AO RESGATE ("Você se importa com [feature premium]?")
4. APRESENTE OFERTA PRINCIPAL (cliente sente alívio)
5. PEÇA PAGAMENTO ("Qual cartão prefere?")
```

**Caso Real (Loja de Ternos):**
- Âncora: Terno $16.000
- Cliente: Engasgo visível
- Resgate: "Você se importa com o designer?"
- Principal: Terno $2.200
- Resultado: 5x orçamento original + compras adicionais

[Fonte: Seção 3, "Anchor Upsell - História da loja de ternos"]

#### Step 2.5: Implementar Rollover Upsell

**Aplicações:**
| Situação | Como Usar | Resultado |
|----------|-----------|-----------|
| Clientes antigos (6+ meses) | Creditar compras passadas para nova oferta | Reengajamento |
| Clientes chateados | Rolar para nova tentativa em vez de reembolso | Salvamento |
| Clientes de concorrentes | Creditar o que pagam lá como desconto aqui | Aquisição |
| Clientes atuais | Rolar primeira compra para prazo mais longo | Retention |

**Fórmula de Precificação:**
```
Oferta de Upsell ≥ 4x Crédito Rollover
Resultado: Máximo 25% de desconto
```

[Fonte: Seção 3, "Rollover Upsell - Como precificar seu rollover upsell"]

---

### ESTÁGIO 3: RECUPERAR DINHEIRO - Ofertas de Downsell

**Tipo Cognitivo:** Julgamento + Adaptação
**Executor:** Human (vendedor treinado)

**Objetivo:** Transformar "nãos" em "sins"
**Meta:** Recuperar 40-60%
**KPI:** Conversão total > 50%

[Fonte: Seção 4, "Downsells lhe dão outra chance de conseguir um cliente transformando nãos em sins"]

#### Step 3.1: Regras do Downselling

1. **"Não" é específico, não universal** - rejeitaram ESTA oferta, não todas
2. **Downsells são trocas** - se der algo, receba algo
3. **Personalize, não pressione** - descubra preferências
4. **Mesma coisa de maneiras novas** - 100 formas de oferecer, não 100 produtos
5. **NUNCA baixe preço da mesma coisa** - destrói confiança
6. **Clientes falam sobre preço** - mantenha consistência

[Fonte: Seção 4, "As regras do downselling"]

#### Step 3.2: Downsell de Plano de Pagamento (7 Passos)

```
PASSO 1: Recompense pré-pagamento
"Normalmente $15, mas $10 se pré-pagar hoje."

PASSO 2: Financiamento externo
"Você prefere que eu decida seus termos ou você decide?" → Cartão de crédito

PASSO 3: Metade agora, metade depois
"Quando você recebe? Quer colocar metade hoje e o resto quando receber?"

PASSO 4: Verificar desejo real
"Em escala de 1-10, quanto você quer isso?"
- 8-10: Continue downselling
- ≤7: Venda algo diferente

PASSO 5: Três pagamentos
"Um terço agora, um terço nos próximos dois salários."

PASSO 6: Pagamentos uniformes
"$X por semana por Y semanas."

PASSO 7: Trial gratuito
Última opção, com penalidade (próxima seção).
```

[Fonte: Seção 4, "Downsells de Plano de Pagamento - Exemplo de processo"]

**Downsell Gangorra (versão simplificada):**
> "Você prefere pagamentos mensais gigantes ou pequenos?" [Pequenos]
> "Normalmente custa $X, mas se pré-pagar hoje, zero pagamentos mensais. Funciona?"
> [Se não] "Quanto mais der agora, menores os pagamentos."

[Fonte: Seção 4, "Downselling gangorra"]

#### Step 3.3: Trial com Penalidade

**Estrutura:**
```
OFERTA: Trial gratuito SE cumprir termos
TERMOS: [Ações que fazem excelentes clientes]
PENALIDADE: Taxa se não cumprir

Processo:
1. Ofereça trial por ÚLTIMO
2. SEMPRE pegue cartão ("É assim que sempre fizemos")
3. Venda ficar e pagar ("Se trouxer resultado, ficará a longo prazo?")
4. Explique taxas APÓS pegar cartão
5. Torne check-ins obrigatórios (oportunidades de upsell)
```

[Fonte: Seção 4, "Trial com Penalidade - Como fazer downsell do trial"]

**Script:**
> "Que tal começarmos você gratuitamente? Só preciso do cartão para garantir comprometimento. Se fizer tudo certinho, não paga nada. Se pular algo, pequena taxa para mantê-lo no caminho. É assim que sempre fizemos. Justo?"

[Fonte: Framework Completo, "Script Trial com Penalidade"]

#### Step 3.4: Downsell de Recursos

**Tipos de Redução:**
- **Quantidade:** "Em vez de 4 sessões/mês, que tal 2?"
- **Qualidade:** "Em vez de couro, podemos fazer vinil"
- **Recurso inteiro:** "Removemos as chamadas, mantemos chat e e-mail"
- **DIY vs DFY:** "Em vez de eu pintar, alugo a máquina"

[Fonte: Seção 4, "Downsells de Recursos - Tipos"]

**Hack da Garantia (3x conversão):**
> "Se você não quiser a opção de receber seu dinheiro de volta, pode pagar menos. OU você pode manter sua garantia. Qual prefere?"

Resultado: Clientes veem valor da garantia → 75% compram preço cheio

[Fonte: Seção 4, "Downsells de Recursos - História dos 25% para 75%"]

---

### ESTÁGIO 4: MAX MONEY - Ofertas de Continuidade

**Tipo Cognitivo:** Síntese + Execução
**Executor:** Hybrid (sistema + vendedor)

**Objetivo:** Receita recorrente previsível
**Meta:** 80%+ em continuidade
**KPI:** Churn < 5% mensal

[Fonte: Seção 5, "Ofertas de continuidade fornecem valor contínuo pelo qual os clientes fazem pagamentos contínuos"]

#### Step 4.1: Bônus de Continuidade

**Estrutura:**
```
BÔNUS ÚNICO: Coisa de alto valor (> primeiro pagamento)
+
BÔNUS MENSAIS: Valor contínuo exclusivo para membros
+
DESCONTO: Incentivo para começar agora
```

**Exemplo:**
> "Receba todas as 40 newsletters passadas (valor $15.880) ao se tornar membro por $399/mês após trial de 30 dias. E se pagar hoje, desconto vitalício para $200/mês."

[Fonte: Seção 5, "Exemplos de fazer pessoas começarem em continuidade"]

#### Step 4.2: Precificação Continuidade vs Independente

**Fórmula (testada em milhares de academias):**

| % Escolhendo Continuidade | Multiplicador Independente |
|---------------------------|---------------------------|
| 50% | 1.33x |
| 60% | 1.66x |
| 70% | 2.00x |
| 80% | 2.33x |
| 90% | 2.66x |

**Exemplo ($199/mês continuidade):**
- Para 70% continuidade: Independente = $199 × 2 = $398/mês

[Fonte: Seção 5, "Precificação para continuidade versus dinheiro antecipado"]

#### Step 4.3: Oferta de Taxa Dispensada

**Estrutura:**
```
OPÇÃO A (Mês a mês):
- Taxa de configuração: 3-5x mensalidade
- Cancele quando quiser

OPÇÃO B (Compromisso):
- Taxa DISPENSADA se comprometer 12 meses
- Pague taxa se quebrar compromisso
```

**Exemplo:**
```
Mensalidade: $1.000/mês
Taxa: $5.000

Opção A: $5.000 + $1.000 (primeiro mês) = $6.000 inicial
Opção B: $0 + $1.000 se comprometer 12 meses
```

[Fonte: Seção 5, "Oferta de Taxa Dispensada - Exemplo"]

**Hack Causa Reversa:**
> "Qual causa você absolutamente odeia? Se cancelar cedo, doamos sua taxa para eles."
> Resultado: 2 razões para ficar (dinheiro + causa)

[Fonte: Seção 5, "Taxas de cancelamento para uma causa"]

---

## 5. Regras de Decisão

```yaml
# Atração
DR-001: "Ofertas de atração cobrem CAC + COGs em 30 dias"
DR-002: "Gratuito e desconto são intercambiáveis"
DR-003: "Mais coisas grátis > menos coisas grátis"

# Upsell
DR-004: "Toda solução cria próximo problema = próximo upsell"
DR-005: "Ofereça upsells mais lucrativos primeiro"
DR-006: "Upsell no momento de maior necessidade"
DR-007: "BAMFAM - sempre agende próximo encontro"

# Downsell
DR-008: "Não = não para ESTA oferta, não todas"
DR-009: "NUNCA baixe preço da mesma coisa"
DR-010: "Personalize, não pressione"
DR-011: "100 formas de oferecer > 100 produtos"

# Continuidade
DR-012: "Bônus > primeiro pagamento em valor"
DR-013: "Taxa dispensada = 3-5x mensalidade"
DR-014: "Custo de sair > custo de ficar = retenção"

# Execução
DR-015: "Aperfeiçoe uma oferta de cada vez"
DR-016: "Simples escala, sofisticado falha"
DR-017: "Medir em trimestres, não semanas"
```

[Fonte: Seção 6, "Notas importantes"]

---

## 6. Exceções e Tratamento

### Taxas de Churn por Frequência de Cobrança

| Frequência | Churn Mensal | Implicação |
|------------|--------------|------------|
| Mensal | 10.7% | Maior flexibilidade, maior churn |
| Trimestral | 5.0% | Equilíbrio |
| Anual | 2.0% | Menor churn, maior compromisso |

**Regra:** Dobrar período = metade do churn

[Fonte: Seção 4, "ProfitWell - dados de 14.000 empresas"]

### Quando Parar Downselling

| Situação | Ação |
|----------|------|
| Score ≤7 em escala de desejo | Venda algo diferente |
| Cliente claramente não quer | Agende follow-up em 7 dias |
| Todos downsells recusados | Trial com penalidade (último recurso) |

[Fonte: Seção 4, "Passo quatro: Verifique se ainda querem a coisa"]

---

## 7. Outputs

- Modelo de dinheiro completo (4 estágios)
- Scripts para cada tipo de oferta
- Calculadora de lucro de 30 dias
- Matriz de precificação continuidade vs independente
- Checklists de implementação por estágio

---

## 8. Validação

**Antes de cada estágio:**
- [ ] Estágio anterior funcionando de forma confiável
- [ ] Métricas documentadas e consistentes
- [ ] Capacidade operacional para próximo nível
- [ ] Scripts testados com pelo menos 10 clientes

**Benchmarks de Performance:**
- **Ruim:** Lucro 30 dias negativo
- **Médio:** Lucro 30 dias = 1x CAC
- **Bom:** Lucro 30 dias = 2x CAC
- **Excelente:** Lucro 30 dias = 3x+ CAC

[Fonte: Framework Completo, "Benchmarks de Performance"]

---

## 9. Escalação

| Situação | Ação |
|----------|------|
| Conversão < 10% | Oferta não resolve problema real |
| Upsell < 20% | Timing errado ou irrelevante |
| Downsell < 30% | Ainda muito caro ou complexo |
| Churn > 10% | Expectativas desalinhadas |
| Lucro negativo | Aumentar preços ou cortar custos |

[Fonte: Framework Completo, "Checklist de Troubleshooting"]

---

## 10. Auditoria

**Frequência:** Semanal (leading), Mensal (lagging)

**Leading Indicators (Diário):**
- Ofertas feitas por dia: Meta 10+
- Taxa de show-up: Meta > 80%
- Conversão Estágio 1: Meta > 25%
- Aceitação primeiro upsell: Meta > 30%

**Lagging Indicators (Mensal):**
- CAC: < $500
- LTV 30 dias: > $1,500
- Lucro 30 dias: > $1,000
- Churn mensal: < 5%

[Fonte: Framework Completo, "Métricas e KPIs"]

---

## 11. Histórico e Referências

**Caso de Referência:** Gym Launch
- Mês 3: $476k/mês (oferta isca)
- Mês 14: $2.3M/mês (menu upsells + downsells)
- Mês 20: $4.4M/mês (integração Prestige Labs)

[Fonte: Seção 6, "Olhando para trás na evolução do Modelo de Dinheiro"]

---

## Appendix A: Scripts Completos

### Script Upsell Clássico
```
"Ótimo! Agora que você tem [solução A], precisa resolver [problema B].
90% dos nossos clientes que conseguem [resultado] também pegam [produto B].
Você não pode ter [resultado final] sem [produto B].
Quer adicionar por apenas $[X] ao invés dos $[2X] normais?
...Você não quer mais nada, quer?"
```
[Fonte: Framework Completo]

### Script Downsell Gangorra
```
"Você prefere pagamentos mensais gigantes ou pequenos?"
[Cliente: Pequenos]
"Normalmente custa $[X], mas se pré-pagar hoje, zero pagamentos mensais. Funciona?"
[Se não]
"Quanto mais der agora, menores seus pagamentos. Qual valor funciona hoje?"
```
[Fonte: Framework Completo]

### Script Trial com Penalidade
```
"Que tal começarmos você gratuitamente?
Só preciso do cartão para garantir comprometimento.
Se fizer tudo certinho, não paga nada.
Se pular algo, pequena taxa para mantê-lo no caminho.
É assim que sempre fizemos. Justo?"
```
[Fonte: Framework Completo]

### Script Menu Upsell (Suplementos)
```
[DESVENDA]
"Você não vai precisar disso aqui [riscar produto].
E como você não está tentando ganhar peso, isso também não [riscar]."

[PRESCREVE]
"Então você precisa tomar dois desses pela manhã,
três desses após o treino, e um desses à noite."

[AB]
"Você prefere chocolate ou baunilha?"

[CARTÃO]
"Quer usar o cartão que tem em arquivo?"
```
[Fonte: Seção 3, Menu Upsells]

### Script Anchor Upsell
```
[APRESENTAR ÂNCORA]
"Nossa opção premium inclui [features], por $[preço alto]."

[ESPERAR ENGASGO - silêncio]

[RESGATE]
"Você se importa muito com [feature premium]?"
"Nem um pouco."

[APRESENTAR PRINCIPAL]
"Então este aqui serve perfeitamente. $[preço 5-10x menor]."

[FECHAR]
"Qual cartão você prefere usar?"
```
[Fonte: Seção 3, Anchor Upsell]

---

## Appendix B: Templates de Ofertas

### Template Ganhe Seu Dinheiro de Volta
```
PROGRAMA: [Nome] - [Resultado] em [Tempo]
INVESTIMENTO: $[X]

CRITÉRIOS (ganhe tudo de volta se):
☐ [Critério 1 - ação mensurável]
☐ [Critério 2 - ação mensurável]
☐ [Critério 3 - ação mensurável]
☐ [Critério 4 - reunião de check-in]

APLICAÇÃO DO CRÉDITO:
○ 100% para [próximo programa]
○ $[X/12]/mês por 12 meses
```
[Fonte: Seção 2]

### Template Sorteio
```
GRANDE PRÊMIO: [Coisa principal] - Valor $[X]
PRAZO: [3-7 dias]

PARA PARTICIPAR:
1. Informações de contato
2. Responder: "Por que você merece ganhar?"

OFERTA PROMOCIONAL (todos os outros):
"Você não ganhou o grande prêmio, MAS se qualificou para
bolsa parcial de $[Y] (valor de $[X])!"

DESCONTO: 10-30% das margens brutas
```
[Fonte: Seção 2]

### Template Compre X, Ganhe Y Grátis
```
OFERTA NORMAL: $[X] por unidade
QUANTIDADE PADRÃO: [N] unidades

OFERTA ESPECIAL:
Compre [1-2] por $[X × (N+Y)]
Ganhe [Y] GRÁTIS

RESULTADO: [N+Y] unidades pelo preço que parece [1-2]
```
[Fonte: Seção 2]

---

## Appendix C: Matriz de Ofertas 4x3

```
           | Quantidade | Qualidade | Diferente |
-----------|------------|-----------|-----------|
Atração    |    Mais    |  Premium  |   Novo    |
Upsell     |   Dobro    |  Melhor   |Complementar|
Downsell   |   Menos    | Inferior  |Alternativa|
Continuid. | Ilimitado  | Mantida   | Recorrente|
```
[Fonte: Framework Completo, "Matriz de Ofertas 4x3"]

---

## Appendix D: Referências de Fonte

### Estrutura do Livro $100M Modelos

| Seção | Título | Conteúdo Principal |
|-------|--------|-------------------|
| Framework | Framework Completo de Implementação | Visão geral, pilares, processo |
| Seção 1 | O que é um Modelo de Dinheiro? | Definição, 4 tipos de ofertas |
| Seção 2 | Ofertas de Atração | 5 tipos de ofertas de atração |
| Seção 3 | Ofertas de Upsell | 4 tipos de upsell |
| Seção 4 | Ofertas de Downsell | 3 tipos de downsell |
| Seção 5 | Ofertas de Continuidade | 3 tipos de continuidade |
| Seção 6 | Faça seu Modelo | Integração e implementação |

### Conceitos Fundamentais

| Elemento | Seção | Citação Literal |
|----------|-------|-----------------|
| Definição Modelo de Dinheiro | Seção 1 | "Um modelo de dinheiro é uma sequência de ofertas" |
| 4 Tipos de Ofertas | Seção 1 | "Ofertas de atração, upsell, downsell e continuidade" |
| Regra dos 30 Dias | Seção 1 | "Faça lucro suficiente para cobrir seus custos em 30 dias ou menos" |
| Cartão como Capital | Seção 1 | "Qualquer negócio pode conseguir dinheiro sem juros por 30 dias na forma de cartão de crédito" |
| Framework GMMM | Framework | "Get Money, More Money, Max Money" |

### Ofertas de Atração (5 Tipos)

| Oferta | Seção | Citação/Descrição |
|--------|-------|-------------------|
| Ganhe Seu Dinheiro de Volta | Seção 2 | "Se você fizer X ou alcançar Y em Z dias, pode ter de graça" |
| Sorteios | Seção 2 | "Muitos entrarão, muitos ganharão" |
| Oferta Isca | Seção 2 | "Qual você acha que vai te dar os melhores resultados?" |
| Compre X, Ganhe Y Grátis | Seção 2 | "Compre um par por $600, ganhe dois grátis" |
| Pague Menos Agora | Seção 2 | "Tempo é dinheiro" |

### Ofertas de Upsell (4 Tipos)

| Oferta | Seção | Citação/Descrição |
|--------|-------|-------------------|
| Upsell Clássico | Seção 3 | "Você não pode ter X sem Y" |
| Menu Upsell | Seção 3 | "Você não precisa disso, você precisa disto" |
| Anchor Upsell | Seção 3 | "A única coisa pior que oferta de $1000 para orçamento de $100 é oferta de $100 para orçamento de $1000" |
| Rollover Upsell | Seção 3 | "Quer apenas rolar para frente?" |

### Ofertas de Downsell (3 Tipos)

| Oferta | Seção | Citação/Descrição |
|--------|-------|-------------------|
| Plano de Pagamento | Seção 4 | "Quanto você pode dar de entrada hoje?" |
| Trial com Penalidade | Seção 4 | "Se você fizer X, Y, Z, vou deixar você começar de graça" |
| Downsell de Recursos | Seção 4 | "Por que não tentamos isso em vez disso?" |

### Ofertas de Continuidade (3 Tipos)

| Oferta | Seção | Citação/Descrição |
|--------|-------|-------------------|
| Bônus de Continuidade | Seção 5 | "Se você gostou disso, vai adorar o que tenho em seguida" |
| Desconto de Continuidade | Seção 5 | Precificação 1.33x-2.66x para % de continuidade |
| Taxa Dispensada | Seção 5 | "Mês a mês com taxa ou dispenso se comprometer por um ano" |

### Casos de Estudo Detalhados

| Caso | Seção | Resultado |
|------|-------|-----------|
| Locadora de Carros | Seção 1 | $19 → $100 (5x aumento) |
| Gym Launch | Seção 6 | $0 → $476k → $1.5M → $2.3M → $4.4M/mês |
| Boot Factory | Seção 2 | Mesma margem, 5x volume |
| Vendedor de Casacos | Seção 3 | "Você não quer mais nada, quer?" = vendas extras |
| Suplementos Academia | Seção 3 | "Chocolate ou baunilha?" = primeira venda após 19 fracassos |
| Loja de Ternos | Seção 3 | $500 orçamento → $2,500 compra (5x) |
| Software RH | Seção 4 | Trial com penalidade para onboarding |
| Certificação Fitness | Seção 2 | Grande prêmio + bolsas parciais |

### Estatísticas e Benchmarks

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Churn Mensal | 10.7% | ProfitWell, 14.000 empresas |
| Churn Trimestral | 5.0% | ProfitWell |
| Churn Anual | 2.0% | ProfitWell |
| Show-up Gratuito | 40% | Framework Completo |
| Show-up $1 | 80% | Framework Completo |
| Show-up $10 | 90% | Framework Completo |
| Reembolso Esperado | ~10% | Seção 2 |
| Conversão Fria | 10-25% | Framework Completo |
| Aceitação Upsell | 30-50% | Framework Completo |
| Recuperação Downsell | 40-60% | Framework Completo |

### Fórmulas

| Fórmula | Seção | Uso |
|---------|-------|-----|
| L30 = (P1 × C1) + Σ(Un × Cn × Vn) - CAC - COGS | Framework | Lucro 30 dias |
| Preço Standalone = Mensal × Multiplicador | Seção 5 | % continuidade desejada |
| Taxa Dispensada = 3-5x Mensalidade | Seção 5 | Estrutura de compromisso |
| Rollover ≤ 25% da oferta | Seção 3 | Precificação rollover |

### Citações Memoráveis

| Citação | Contexto | Seção |
|---------|----------|-------|
| "Você pode tosquiar uma ovelha por toda a vida, mas só pode esfolá-la uma vez" | Valor de cliente recorrente | Seção 5 |
| "Não significa não para esta coisa, não para tudo" | Continuar após rejeição | Seção 4 |
| "Você não pode ter X sem Y" | Framework de upsell | Seção 3 |
| "É assim que sempre fizemos" | Justificar processos | Seção 4 |
| "Você quer batatas fritas com isso?" | Upsell simples bilionário | Seção 3 |
| "Chocolate ou baunilha?" | Remove opção de não comprar | Seção 3 |
| "O limite não existe" | Potencial de ofertas | Seção 1 |

### Hacks e Táticas

| Hack | Descrição | Seção |
|------|-----------|-------|
| "Não-Sim" | "Você não quer mais nada, quer?" | Seção 3 |
| Unselling | Riscar o que NÃO precisam | Seção 3 |
| BAMFAM | Book a Meeting From a Meeting | Seção 3 |
| Trial $1 | Justifica pedir cartão | Seção 4 |
| Causa Reversa | Taxa vai para causa que odeia | Seção 5 |
| Rollover Competidor | Creditar pagamentos do concorrente | Seção 3 |
| Jogada Economist | A ($59), B ($125), A+B ($125) | Seção 3 |
| Cartão em Arquivo | "Qual cartão quer usar?" | Seção 3 |

### Multiplicadores Documentados

| Contexto | Multiplicador | Fonte |
|----------|---------------|-------|
| Aluguel de carro | 5x ($19→$100) | Seção 1 |
| Hambúrguer com upsells | 11.6x ($0.25→$3 lucro) | Seção 3 |
| Academia com suplementos | 3x valor médio | Seção 3 |
| Licenciamento vs DIY | 10x preço | Framework |
| Anchor (terno) | 5x orçamento | Seção 3 |
| Boot Factory | 5x volume | Seção 2 |

---

**Validation Score: 11/11 parts complete**
**Source References: 72 elements mapped**
**SOP ready for implementation.**

---

*SOP extraído pelo SOP Extractor Agent em 2026-02-10*
*Baseado 100% em conteúdo original de Alex Hormozi - $100M Modelos*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
