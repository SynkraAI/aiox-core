# Retention & LTV Checklist
# Source: $100M Retention Playbook + $100M Lifetime Value Playbook + $100M Money Models
# Version: 2.0.0
# Generated: 2026-02-10
> Agent: hormozi-retention

---

## Overview

Este checklist cobre a implementacao completa do framework de Retencao e LTV de Alex Hormozi. Use em conjunto com:
- `retention-sop.md` - Framework detalhado completo
- `subscription-model-sop.md` - Ofertas de continuidade
- `subscription-model-checklist.md` - Checklist de ofertas

---

## Pre-Requisitos

### Dados Minimos Requeridos
- [ ] **Churn rate mensal** calculado corretamente (cohort-based)
  - Formula: Clientes que sairam / Pool original de clientes
  - NOTA: Novos clientes NAO afetam o calculo
  - Seu churn atual: _____%

- [ ] **ARPU** (Average Revenue Per User) documentado
  - Seu ARPU: $_____/mes

- [ ] **CAC** (Customer Acquisition Cost) documentado
  - Seu CAC: $_____

- [ ] **Tempo medio de permanencia** do cliente conhecido
  - Media atual: _____ meses

- [ ] **Numero total de clientes ativos**
  - Total: _____

### Dados Estendidos (Coletar Quando Possivel)
- [ ] Metricas de engajamento (frequencia de uso, login, attendance)
  - Frequencia media: _____x/semana
- [ ] NPS ou scores de satisfacao
  - NPS atual: _____
- [ ] Top 3 razoes de cancelamento documentadas
  - Razao 1: _____________________
  - Razao 2: _____________________
  - Razao 3: _____________________
- [ ] Time to first value / activation point
  - Dias ate activation: _____
- [ ] Taxa de referral
  - Taxa atual: _____%
- [ ] Revenue por tenure do cliente
  - Mes 1: $_____ | Mes 6: $_____ | Mes 12: $_____
- [ ] Taxa de churn involuntario (falhas de pagamento)
  - Taxa: _____%

---

## Formulas Fundamentais

### Calculo de LTV

**Para Negocios de Recorrencia:**
- [ ] Formula aplicada: LTGP = Gross Profit Mensal / Churn Rate
  - Gross Profit Mensal: $_____
  - Churn Rate: _____%
  - LTGP Calculado: $_____

**Para Negocios Transacionais:**
- [ ] Formula aplicada: LTGP = Gross Profit por Transacao x Media de Transacoes
  - GP por Transacao: $_____
  - Media de Transacoes: _____
  - LTGP Calculado: $_____

### LTV:CAC Health Check
- [ ] Ratio calculado: LTV / CAC = _____:1

**Status:**
| Status | Ratio | Recomendacao |
|--------|-------|--------------|
| [ ] SAUDAVEL | >= 3:1 | Pode escalar agressivamente |
| [ ] ALERTA | 2:1-3:1 | Margens finas, priorizar LTV ou reduzir CAC |
| [ ] CRITICO | < 2:1 | PARAR escala, consertar backend primeiro |

---

## The 5 Horsemen of Retention

### Horseman 1: Track Attendance/Engagement

#### Sistema de Tracking
- [ ] Sistema de rastreamento de frequencia/uso implementado
- [ ] Dashboard de engajamento por cliente configurado
- [ ] Alertas automaticos para queda de frequencia (ex: 3x -> 2x semana)
- [ ] Intervencao imediata quando queda detectada
- [ ] Engagement levels definidos (0-4: Ghost -> Champion)

#### Padroes de Intervencao
- [ ] Padrao de churn mapeado:
  - Semana 1: 3+ sessoes = saudavel
  - Semana 2: 2 sessoes = ALERTA
  - Queda progressiva = caminho para cancelamento

- [ ] Gatilhos de intervencao definidos:
  - [ ] Frequencia cai para 2x/semana -> Intervir imediatamente
  - [ ] Frequencia cai para 1x/semana -> Intervencao critica
  - [ ] 0 sessoes por 7 dias -> Contato de emergencia

---

### Horseman 2: Reach Out 2x Per Week

#### Cadencia Estabelecida
- [ ] Cadencia de 2x/semana por cliente ativo estabelecida
- [ ] Responsabilidade atribuida (quem cuida de quem)
- [ ] Templates de mensagens preparados (elogios, check-ins)

#### Framework ACA para Outreach
- [ ] **A**cknowledge: O que voce viu eles fazerem
  - Template: "Notei que voce _____"
- [ ] **C**ompliment: Algo genuino sobre eles
  - Template: "Isso mostra que voce _____"
- [ ] **A**sk: Uma pergunta
  - Template: "Como posso ajudar com _____?"

#### Tracking
- [ ] Tracking de compliance com cadencia configurado
- [ ] Log de comunicacoes por cliente
- [ ] Metricas de resposta rastreadas

---

### Horseman 3: Handwritten Cards

#### Ocasioes de Envio
- [ ] **Signup**: Cartao de boas-vindas (ate 48h)
- [ ] **Marcos temporais**:
  - [ ] 3 meses (incluir pedido de referral)
  - [ ] 6 meses (incluir pedido de referral)
  - [ ] 12 meses (incluir pedido de referral)
- [ ] **Datas especiais**:
  - [ ] Aniversario do cliente
  - [ ] Feriados relevantes
  - [ ] Data de entrada (aniversario de membro)
- [ ] **Conquistas**:
  - [ ] Quando atingem metas
  - [ ] Quando completam milestones
  - [ ] Quando precisam de motivacao extra

#### Operacao
- [ ] Estoque de cartoes e selos disponivel
- [ ] Processo de escrita definido (quem, quando, como)
- [ ] Sistema de rastreamento de cartoes enviados
- [ ] Budget mensal alocado: $_____/mes

---

### Horseman 4: Member Events

#### Calendario de Eventos
- [ ] Cadencia definida: A cada _____ dias (21/42/63 recomendado)
- [ ] Calendario anual de eventos criado
- [ ] Tipos de eventos definidos:
  - [ ] Onboarding em grupo (1-to-6)
  - [ ] Challenges de comunidade
  - [ ] Member spotlights
  - [ ] Q&A sessions
  - [ ] Meetups presenciais

#### Execucao
- [ ] Sistema de convites (escrito a mao quando possivel)
- [ ] Sistema de RSVP implementado
- [ ] Tracking de attendance
- [ ] Follow-up pos-evento definido

#### Beneficio Duplo
- [ ] Tracking de retencao pos-evento
- [ ] Sistema de referrals em eventos
- [ ] Testimonials coletados em eventos

---

### Horseman 5: Exit Interviews

#### Pre-Configuracao
- [ ] Expectativa de exit interview estabelecida no onboarding
- [ ] Trigger automatico quando cancelamento solicitado
- [ ] Calendario de disponibilidade para calls

#### Script da Ligacao
- [ ] **Passo 1**: Deixar desabafar (nao interromper)
- [ ] **Passo 2**: Ficar mais indignado que eles
  - Script: "Isso e completamente ridiculo. Voce esta 100% correto."
- [ ] **Passo 3**: Perguntar por oportunidade
  - Script: "Me da a oportunidade de consertar isso?"
- [ ] **Passo 4**: Revender o valor de ficar
- [ ] **Passo 5**: Mostrar o que perdem
  - [ ] URLs/posts criados
  - [ ] Acesso especial
  - [ ] Pricing de founder
  - [ ] Status conquistado

#### Save Strategies
- [ ] **Save com Redo**: "Deixa eu tentar de novo e vou consertar isso."
- [ ] **Save com Upsell**: Perceber que precisam de mais ajuda
  - Script: "Voce deveria ter sido vendido para isso de qualquer forma. E isso e culpa minha."
  - [ ] Creditar pagamento para programa superior

#### Para High-Volume Low-Price
- [ ] Video de cancelamento criado que:
  - [ ] Relembra por que comecaram
  - [ ] Revende o valor
  - [ ] Lembra o que arriscam perder

#### Tracking
- [ ] Tracking de save rate (target: 50%)
- [ ] Sistema de feedback para produto configurado

---

## Timeline de Implementacao (5 Horsemen)

### O Que Esperar

| Mes | Churn | Explicacao |
|-----|-------|------------|
| Mes 1 | SOBE 50% | "Shaking the tree" - clientes que iam cancelar de qualquer forma |
| Mes 2 | DESCE 50% | Sistema comeca a funcionar |
| Mes 3 | DESCE mais 50% | Estabilizacao |

**Trajetoria tipica:** 10% -> 15% -> 7% -> 3%

### Tracking de Progresso
- [ ] Churn Mes 0 (baseline): _____%
- [ ] Churn Mes 1: _____% (esperado: +50%)
- [ ] Churn Mes 2: _____% (esperado: -50% do mes 1)
- [ ] Churn Mes 3: _____% (esperado: -50% do mes 2)

---

## The 9-Step Churn Checklist

### Step 1: Descobrir Activation Points

#### Pesquisa Inicial
- [ ] Identificar clientes churned que ficaram 3+ meses
- [ ] Ordenar por quem gastou mais dinheiro
- [ ] Selecionar top 20% para analise profunda

#### Analise de Comportamento
- [ ] Demograficos documentados:
  - Idade: _____
  - Localizacao: _____
  - Industry: _____
- [ ] Psicograficos documentados:
  - Motivacoes: _____
  - Medos: _____
  - Objetivos: _____
- [ ] Padroes de uso documentados:
  - Features mais usadas: _____
  - Frequencia: _____
  - Primeiro resultado: _____

#### Activation Points Candidatos
- [ ] Fator 1: _____________________
- [ ] Fator 2: _____________________
- [ ] Fator 3: _____________________
- [ ] Fator 4: _____________________
- [ ] Fator 5: _____________________

#### Validacao e Atualizacao
- [ ] Top 5 fatores selecionados para teste
- [ ] Periodo de teste definido: _____ dias
- [ ] Messaging atualizado para atrair melhores clientes
- [ ] Onboarding direcionado ao activation point
- [ ] Schedule de reteste: A cada 6-12 meses

---

### Step 2: Onboard Your Customers

#### Hierarquia de Eficacia
- [ ] Tipo de onboarding escolhido:
  - [ ] Custom + Personal + Live (retencao maxima)
  - [ ] Custom + Group + Live (otima, mais escalavel)
  - [ ] Generic + Group + Recorded (decente, mais escalavel)
  - [ ] Algum > Nenhum

#### Sequencia de 30 Dias

**Dia 0:**
- [ ] Welcome message pessoal enviado
- [ ] Valor revendido
- [ ] Roadmap claro entregue
- [ ] Cadencia de comunicacao definida

**Dias 1-3:**
- [ ] Push para activation point iniciado
- [ ] Primeira vitoria rapida identificada
- [ ] Homework com deadline de 7 dias atribuido

**Dias 3-7:**
- [ ] Check-in pessoal realizado
- [ ] Fricoes identificadas e resolvidas
- [ ] Progresso celebrado

**Dias 7-14:**
- [ ] Conexao com membros bem-sucedidos facilitada
- [ ] Provas/resultados compartilhados
- [ ] Segundo check-in realizado

**Dias 14-21:**
- [ ] Introducao a eventos de comunidade
- [ ] 2-3 conexoes significativas facilitadas

**Dias 21-30:**
- [ ] Revisao de progresso
- [ ] Celebracao publica
- [ ] Pedido de testimonial
- [ ] Unlockables futuros apresentados

#### Paid Onboarding (Opcional)
- [ ] Onboarding vendido separadamente considerado
- [ ] Preco do onboarding: $_____
- [ ] Target: 25% boost em ascensions

---

### Step 3: Incentivize Customer Activation

#### Tipos de Incentivos
- [ ] Cursos que desbloqueiam
  - Curso: _____ | Unlocks em: _____
- [ ] Calls 1-on-1 ou bundles de calls
  - Calls: _____ | Unlocks em: _____
- [ ] Ingressos para eventos live/virtual
  - Evento: _____ | Unlocks em: _____
- [ ] Acesso a calls de tier mais alto
  - Tier: _____ | Unlocks em: _____
- [ ] Custom badges, profile images, indicadores de status
  - Status: _____ | Unlocks em: _____
- [ ] Acesso lifetime gratis ao atingir nivel alto
  - Nivel requerido: _____

#### Timing Estrategico
- [ ] Major churn points identificados:
  - Churn point 1: Mes _____
  - Churn point 2: Mes _____
  - Churn point 3: Mes _____
- [ ] Incentivos posicionados APOS churn points:
  - Incentivo 1: Unlocks no Mes _____
  - Incentivo 2: Unlocks no Mes _____
  - Incentivo 3: Unlocks no Mes _____

---

### Step 4: Community Linking

#### Filosofia
- [ ] Time entende: "E facil sair de uma membership, e dificil deixar um relacionamento"

#### Taticas Implementadas
- [ ] **Group Events**: Onboarding 1-on-6 para conectar pessoas
- [ ] **Conexoes Manuais**: Sistema para identificar membros que se beneficiariam de se conhecer
- [ ] **Podcast de Comunidade**: Formato definido, calendario de gravacao
- [ ] **Micro-Celebridades**: Sistema para identificar e elevar especialistas
- [ ] **Pinning**: Melhores 1-2 posts novos pinnados diariamente

---

### Step 5: Fire or Correct Bad Customers

#### Incentivar Positivos
- [ ] Pin posts de qualidade
- [ ] Praise publico para bons exemplos
- [ ] Categorias de comunidade criadas: wins, fun, discovered, meetups

#### Corrigir Negativos
- [ ] Processo de feedback para comportamentos ruins documentado
- [ ] Sistema de 3 strikes implementado:
  - Strike 1: Aviso privado
  - Strike 2: Aviso publico
  - Strike 3: Expulsao
- [ ] Processo de remocao documentado

---

### Step 6: Add Annual Pricing Options

#### Opcao Padrao
- [ ] "Buy 10 months get 2 free" implementado (ou similar)
- [ ] Target: 10-20% escolhem anual

#### Pricing Strategy
- [ ] Media de meses atual: _____ meses

| Se avg_months | Estrategia | Seu Annual Price |
|---------------|------------|------------------|
| < 12 meses | Precar annual ACIMA de avg_months | $_____ |
| >= 12 meses | "Buy 10 get 2 free" (16% off) | $_____ |

#### Alternativas
- [ ] **Big Head Long Tail** considerado:
  - Upfront (educacao/setup): $_____
  - Monthly (comunidade): $_____/mes
  - LTV projetado: $_____

- [ ] **Founder Rates** considerados:
  - Desconto para compromisso antecipado: _____%
  - Periodo de compromisso: _____ meses

---

### Step 7: Exit Interviews / Cancellation Calls

(Ver secao Horseman 5 acima para checklist completo)

- [ ] Todos os items do Horseman 5 implementados
- [ ] Tracking de taxa de save configurado
  - Target: 50%
  - Atual: _____%
- [ ] Feedback loop para produto estabelecido

---

### Step 8: Survey Customers 2x/Year

#### Calendario
- [ ] Survey 1: Mes _____
- [ ] Survey 2: Mes _____

#### Perguntas Essenciais
- [ ] Pergunta 1 implementada:
  "Se eu removesse tudo dessa lista menos uma coisa, o que voce gostaria de manter mais?"
- [ ] Pergunta 2 implementada:
  "Se eu mantivesse tudo dessa lista menos uma coisa, qual te incomodaria menos ver eu remover?"

#### Analise de Resultados
- [ ] Core 2-3 coisas identificadas:
  - Core 1: _____________________
  - Core 2: _____________________
  - Core 3: _____________________
- [ ] Plano para dobrar nessas areas documentado

---

### Step 9: Four-Step Customer Journey

#### Os 4 Milestones

| Milestone | Descricao | Acao | Status |
|-----------|-----------|------|--------|
| ACTIVATE | Direcionar ao activation point | Onboarding focado | [ ] |
| TESTIMONIAL | Capturar historia de sucesso | Pedir quando atingem resultado | [ ] |
| REFER | Pedir referrals | No momento de satisfacao maxima | [ ] |
| ASCEND | Vender a proxima coisa | Upsell/cross-sell | [ ] |

#### Incentivos por Milestone
- [ ] Unlockable para ACTIVATE: _____
- [ ] Unlockable para TESTIMONIAL: _____
- [ ] Unlockable para REFER: _____
- [ ] Unlockable para ASCEND: _____

#### Tracking
- [ ] Sistema de tracking de progressao por cliente implementado
- [ ] Dashboard de milestones configurado

---

## The Crazy 8 - LTV Maximization

### #1 Increase Prices

#### Analise de Impacto
- [ ] Margem atual: _____%
- [ ] Aumento proposto: _____%
- [ ] Impacto projetado em profit: _____%

#### Processo de Teste
- [ ] Teste de preco agendado (proximo quarter)
- [ ] Metodologia: +20% a cada 10 vendas ate queda dramatica
- [ ] Sweet spot identificado: $_____

#### Formula de Breakeven
- [ ] Breakeven Conv Rate = Old Revenue / New Price
  - Old Revenue: $_____
  - New Price: $_____
  - Breakeven Conv Rate: _____%
  - Atual Conv Rate: _____%
  - Winner? [ ] Sim [ ] Nao

---

### #2 Decrease Costs

#### Taticas Consideradas
- [ ] Aumentar ratio employee-to-customer
  - Atual: _____:1 | Target: _____:1
- [ ] Offshore talent
  - Economia projetada: _____%
- [ ] Productizar delivery (templates, automacao)
- [ ] Done For You -> Done With You
- [ ] Cap usage (limitar revisoes, cobrar por uso apos)
- [ ] Lifetime -> Annual access
- [ ] In-person -> Remote
- [ ] Cortar tempos de reuniao
- [ ] Comprar em bulk e prepagar (10-20% descontos)

#### Implementacao Selecionada
- [ ] Tatica 1: _____ | Economia: $_____
- [ ] Tatica 2: _____ | Economia: $_____

---

### #3 Increase # of Purchases

#### a) Add Recurring
- [ ] Modelo atual: _____
- [ ] Modelo recorrente proposto: _____
- [ ] Revenue recorrente projetado: $_____/mes

#### b) Decrease Churn
- [ ] Seguir o Churn Checklist (9-Step acima)
- [ ] Target de reducao: De _____% para _____%
- [ ] Impacto em LTV: _____x

#### c) Follow Up
- [ ] Promocoes trimestrais agendadas
- [ ] Calendario de valor entre asks criado
- [ ] Estrategia de top of mind definida

---

### #4 Cross-Sell Something Different

#### Produto Complementar
- [ ] Produto principal: _____
- [ ] Cross-sell identificado: _____
- [ ] Relacao: _____________________
- [ ] Nao quebra o negocio por trocados

#### Projecao de Impacto
- [ ] LTV Original: $_____
- [ ] Conv Rate do Cross-Sell: _____%
- [ ] GP do Cross-Sell: $_____
- [ ] New LTV = Original + (Conv Rate x GP) = $_____

---

### #5 Upsell Quantity (Sell More)

| Tipo | Atual | Proposto | Multiplicador |
|------|-------|----------|---------------|
| Bulk | _____ | Prepagar _____ meses | _____x |
| More Often | _____ | _____ | _____x |
| Bigger | _____ | _____ | _____x |

- [ ] Estrategia: Oferecer maior primeiro, depois downsell para padrao

---

### #6 Upsell Quality (Sell Better)

#### Versao Premium (17 Quality Levers)

| Lever | Standard | Premium |
|-------|----------|---------|
| Response time | _____ | _____ |
| Availability | _____ | _____ |
| Days | _____ | _____ |
| Time per session | _____ | _____ |
| Locations | _____ | _____ |
| Cancellation flex | _____ | _____ |
| Service ratio | _____ | _____ |
| Communication | _____ | _____ |
| Provider level | _____ | _____ |
| Live vs Recorded | _____ | _____ |
| In-person vs Remote | _____ | _____ |
| DIY/DWY/DFY | _____ | _____ |
| Expirations | _____ | _____ |
| Personalization | _____ | _____ |

#### Pricing
- [ ] Standard price: $_____
- [ ] Premium price: $_____
- [ ] Premium multiplier: _____x

---

### #7 Downsell Quantity (Sell Less Rather Than Nothing)

- [ ] Quantity: _____ meses ao inves de _____
- [ ] Less Often: A cada _____ ao inves de _____
- [ ] Smaller: _____ ao inves de _____

**REGRA CRITICA:**
- [ ] Time entende: NUNCA downsell para comprador qualificado
- [ ] Downsell SOMENTE para quem NAO qualifica para oferta principal

---

### #8 Downsell Quality (Sell Worse Rather Than Nothing)

- [ ] Versao Economy criada (inverte os 17 levers)
- [ ] Response time mais lento
- [ ] Menos disponibilidade
- [ ] Menos dias/horarios
- [ ] Employees mais junior
- [ ] Ratio maior cliente:employee
- [ ] Mais recorded, menos live
- [ ] Mais remote, menos in-person
- [ ] DIY ao inves de DWY/DFY
- [ ] Menos personalizacao

**REGRA:** SOMENTE para prospects nao qualificados

---

## Continuity Offers

### Type 1: Continuity Bonus Offer

- [ ] Bonus com valor percebido > primeiro pagamento
  - Valor do bonus: $_____
  - Primeiro pagamento: $_____
  - Ratio: _____x (deve ser >1x)
- [ ] Assets existentes usados (custo marginal zero)
- [ ] Bonus relacionado a oferta principal
- [ ] Script: BONUS sendo vendido, nao a membership

### Type 2: Continuity Discount Offer

- [ ] Tipo escolhido:
  - [ ] Upfront (meses gratis primeiro)
  - [ ] Backloaded (meses gratis apos pagamento completo)
  - [ ] Spread (desconto diluido em todos os pagamentos)
  - [ ] Prepayment (pagar primeiro e ultimo no signup)

- [ ] Hacks considerados:
  - [ ] Cobrar a cada 4 semanas (13 ciclos = +8.3% receita)
  - [ ] Waive processing fee com 2 payment methods
  - [ ] Gift cards apos 3 pagamentos
  - [ ] Desconto condicional lifetime

### Type 3: Waived Fee Offer

- [ ] **Preco mensal**: $_____
- [ ] **Taxa de configuracao**: $_____ (deve ser 3-5x mensal)
  - Ratio: _____x mensal
  - [ ] Taxa >= 3x mensal
  - [ ] Taxa <= 5x mensal

- [ ] **Opcao A** (Mes a Mes) documentada:
  - Taxa: $_____ + Monthly: $_____ = Total hoje: $_____
  - Cancelamento: A qualquer momento

- [ ] **Opcao B** (Compromisso) documentada:
  - Taxa: Dispensada
  - Compromisso: _____ meses (minimo 12)
  - Se cancelar antes: Pagar taxa de $_____

- [ ] Fee pende como motivacao para ficar
- [ ] Naming definido: _____ fee

---

## Engagement Scoring Framework

### Niveis Configurados

| Nivel | Nome | Definicao | Acao | Risco |
|-------|------|-----------|------|-------|
| 0 | GHOST | Sem atividade 30+ dias | Campanha de reativacao imediata | Extremamente alto |
| 1 | PASSIVE | Atividade minima, tendencia de queda | Outreach pessoal (ACA), incentivo | Alto |
| 2 | ACTIVE | Regular mas nao no activation point | Guiar para activation point | Moderado |
| 3 | ENGAGED | No ou acima do activation point | Testimonial, referral, upsell | Baixo |
| 4 | CHAMPION | Acima do AP, refere, advoga | VIP treatment, micro-celebrity | Muito baixo |

### Acoes por Nivel Implementadas
- [ ] Nivel 0: Campanha de reativacao imediata
- [ ] Nivel 1: Outreach pessoal (ACA), incentivo para re-engajar
- [ ] Nivel 2: Guiar para activation point, community linking
- [ ] Nivel 3: Manter, pedir testimonial/referral, apresentar upsell
- [ ] Nivel 4: Elevar como micro-celebridade, convidar para VIP

---

## Metricas de Monitoramento

### Tier 1 - Survival (Track Weekly)
- [ ] Churn rate mensal (por cohort)
- [ ] Revenue churn rate (dollar-weighted)
- [ ] LTV (rolling 90-day average)
- [ ] LTV:CAC ratio

### Tier 2 - Engagement (Track Daily/Weekly)
- [ ] Frequencia de login/visita
- [ ] Profundidade de uso de features
- [ ] Taxa de consumo de conteudo
- [ ] Participacao em comunidade
- [ ] Volume e sentiment de tickets de suporte
- [ ] NPS score (trimestral)

### Tier 3 - Predictive (Build Over Time)
- [ ] Tempo desde ultimo login/compra
- [ ] Tendencia do engagement score
- [ ] Taxa de falha de pagamento
- [ ] Taxa de resposta a outreach
- [ ] Percentual de conclusao do activation point

---

## Win-Back Campaigns

### Segmentacao de Clientes Churned

| Segmento | Causa Provavel | Abordagem |
|----------|----------------|-----------|
| <30 dias | Activation failure | "Percebi que falhamos com voce. Veja como e diferente agora." |
| 30-90 dias | Value perception issue | "Muita coisa mudou desde que voce saiu. Veja o que perdeu." |
| 90+ dias | Fatores externos | "Pessoas como voce que voltaram viram X resultados em Y tempo." |

### Sequencia de Win-Back
- [ ] **Dia 1**: Email/text pessoal reconhecendo saida (sem venda)
- [ ] **Dia 3**: Compartilhar success story de alguem na situacao deles
- [ ] **Dia 7**: Oferta especifica para voltar (desconto, bonus, ou waived fee)
- [ ] **Dia 14**: Ultimo outreach com incentivo por tempo limitado
- [ ] **Dia 30**: Adicionar a nurture de longo prazo
- [ ] **A cada 90 dias**: Mostrar resultados de pessoas que assinaram quando eles sairam

---

## Reactivation for Dormant (Still Paying, Not Using)

### Framework: 3-Touch Reactivation
- [ ] **Touch 1 - Acknowledge + Compliment:**
  "Ei, notei que voce nao logou. So queria dizer que seu progresso em [coisa especifica] foi impressionante."
- [ ] **Touch 2 - Value reminder:**
  "Lembrete rapido - acabamos de adicionar [feature/conteudo]. Acho que ajudaria com [objetivo deles]."
- [ ] **Touch 3 - Personal invitation:**
  "Estou organizando [evento/call] na proxima [data]. Adoraria que voce participasse."

### Escalation
- [ ] Se sem resposta apos 3 touches: Ligar (telefone > texto > email)
- [ ] Se ainda sem resposta: Marcar como alto risco de churn

---

## Overwhelm Prevention

### Principio Central
- [ ] Time entende: "Value per second, not seconds of value"
- [ ] Time entende: "Less but better beats more and decent"

### Audit de Deliverables
- [ ] Listar todos os deliverables atuais:
  1. _____________________
  2. _____________________
  3. _____________________
  4. _____________________
  5. _____________________

- [ ] Verificar: >5 deliverables/mes? Potencial overwhelm
- [ ] Core 2-3 coisas identificadas
- [ ] Plano para "fazer menos, mas melhor" documentado

---

## Decision Rules

### Churn
- [ ] DR-001: "Churn > 10% mensal = problema de produto, nao de crescimento"
- [ ] DR-002: "Churn floor < 1% e incomum, pedir confirmacao de dados"
- [ ] DR-003: "Churn ceiling > 25% sugere crise, priorizar fix de produto"

### LTV
- [ ] DR-004: "LTV:CAC < 2:1 = parar de escalar, consertar backend"
- [ ] DR-005: "LTV:CAC 2:1-3:1 = crescimento possivel mas margens finas"
- [ ] DR-006: "LTV:CAC >= 3:1 = pode escalar agressivamente"

### Activation
- [ ] DR-007: "Clientes que nao atingem activation point em 30 dias = alto risco"
- [ ] DR-008: "Activation point completion < 50% = revisar onboarding"

### Pricing
- [ ] DR-009: "Testar precos a cada quarter"
- [ ] DR-010: "2x preco + -20% conversao = FAZER (se +60% receita)"

### Engagement
- [ ] DR-011: "Engagement Level 0-1 por 30+ dias = campanha de reativacao imediata"
- [ ] DR-012: "Usage churn precede billing churn - interceptar quando para de usar"

### Volume
- [ ] DR-013: "Mais deliverables que 5 por mes = verificar potential overwhelm"

---

## Red Flags Imediatos

| Sinal | Status | Acao Requerida |
|-------|--------|----------------|
| Churn > 10% mensal | [ ] OK [ ] ALERTA | PARAR escala de aquisicao, diagnosticar |
| LTV:CAC < 2:1 | [ ] OK [ ] ALERTA | PARAR escala, consertar backend |
| Sem onboarding | [ ] OK [ ] ALERTA | IMPLEMENTAR imediatamente |
| Sem engagement tracking | [ ] OK [ ] ALERTA | IMPLEMENTAR metricas |
| Adicionando features quando clientes reclamam | [ ] OK [ ] ALERTA | PARAR, investigar se resposta e delecao |
| Retention investment > 1/5 CAC | [ ] OK [ ] ALERTA | REVISAR se excedido |

---

## Anti-Patterns (NUNCA FAZER)

### Nunca Sugerir
- [ ] "Apenas conseguir mais clientes" como solucao para churn
- [ ] Descontos sem mecanicas de retencao attached
- [ ] Adicionar mais features/conteudo como estrategia de retencao
- [ ] Ignorar os dados e ir com gut feeling
- [ ] Tratar todos os clientes churned igual
- [ ] Pular onboarding para "economizar tempo"
- [ ] Annual pricing sem primeiro consertar o produto

### Sempre Verificar
- [ ] Churn esta sendo calculado corretamente? (so cohort original)
- [ ] Estamos resolvendo o problema certo? (acquisition vs retention vs monetization)
- [ ] Temos activation points identificados?
- [ ] Onboarding esta direcionando para activation points?
- [ ] Estamos rastreando engagement antes de virar churn?
- [ ] Price-value equation esta balanceada?

---

## Quality Gates

### Antes de Implementar
- [ ] QG-001: Dados minimos coletados (churn, ARPU, CAC, tempo medio)
- [ ] QG-002: LTV calculado corretamente
- [ ] QG-003: LTV:CAC ratio conhecido e >= 2:1
- [ ] QG-004: Activation points identificados
- [ ] QG-005: Onboarding de 30 dias desenhado

### Durante Implementacao
- [ ] QG-006: 5 Horsemen em execucao
- [ ] QG-007: Engagement scoring ativo
- [ ] QG-008: Exit interviews acontecendo
- [ ] QG-009: Surveys 2x/ano agendados

### Apos 90 Dias
- [ ] QG-010: Churn reduziu (target: -50%)
- [ ] QG-011: LTV aumentou
- [ ] QG-012: Activation rate > 50%
- [ ] QG-013: Win-back campaigns gerando retornos

---

## Auditoria Trimestral

### Metricas a Revisar
- [ ] Churn mensal (tendencia de 3 meses)
- [ ] LTV (comparado a quarter anterior)
- [ ] LTV:CAC ratio
- [ ] Engajamento medio
- [ ] Taxa de activation
- [ ] Taxa de save em exit interviews

### Gatilhos para Revisao Urgente
- [ ] Churn subiu mais de 2 pontos percentuais
- [ ] LTV:CAC caiu abaixo de 3:1
- [ ] Engajamento medio caindo por 3 meses consecutivos
- [ ] Grande mudanca de produto ou pricing
- [ ] Novos dados de activation point disponiveis

---

## Resultados Esperados

| Metrica | Antes | Depois (6 meses) |
|---------|-------|------------------|
| Churn Mensal | 10% | 3% |
| LTV | 10 meses | 33 meses |
| LTV Multiplier | 1x | 3.3x |

**Beneficios:**
- Cresce todo ano mesmo se vendas ficam iguais
- Negocio compoem (referrals > churn)
- Mais valioso para vender
- Word of mouth positivo
- Equipe motivada por clientes sendo ajudados

---

## Troubleshooting Quick Reference

| Problema | Causa Provavel | Solucao |
|----------|----------------|---------|
| Churn > 10% | Problema de produto | Diagnosticar produto, nao escalar |
| Baixa activation | Onboarding falho | Revisar onboarding para activation point |
| Clientes inativos | Falta de engagement | Implementar reach out 2x/semana |
| Cancelamentos surpresa | Sem tracking | Implementar engagement scoring |
| Churn sobe apos implementacao | Normal (Mes 1) | Manter curso, esperar Mes 2-3 |
| Baixo save rate em exits | Script fraco | Treinar time, usar indignacao |
| Overwhelm complaints | Muitos deliverables | Reduzir para core 2-3 |
| LTV:CAC < 2:1 | Backend quebrado | Parar escala, consertar antes de crescer |

---

## Assinaturas

| Item | Responsavel | Data | Assinatura |
|------|-------------|------|------------|
| Pre-requisitos completos | | | |
| 5 Horsemen implementados | | | |
| 9-Step Checklist implementado | | | |
| Crazy 8 LTV analisado | | | |
| Engagement scoring ativo | | | |
| Win-back campaigns ativas | | | |
| Quality gates passaram | | | |
| Lancamento aprovado | | | |

---

## Notas de Implementacao

```
Data: ____________

Status atual:
- Churn: _____%
- LTV: $_____
- LTV:CAC: _____:1

Prioridades identificadas:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Decisoes tomadas:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Proximos passos:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Responsavel: ______________________
Review date: ______________________
```

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| Critical - Pre-Requisites, 5 Horsemen, 9-Step (Steps 1-3), Quality Gates Pre | 55 | 3 | 165 |
| Standard - Crazy 8, Continuity Offers, Engagement Scoring, 9-Step (Steps 4-9) | 60 | 2 | 120 |
| Bonus - Metricas, Win-Back, Reactivation, Decision Rules, Auditoria | 35 | 1 | 35 |
| **TOTAL** | **150** | | **320** |

### Thresholds
- **PASS**: >= 256 points (80%)
- **CONDITIONAL**: >= 192 points (60%)
- **FAIL**: < 192 points

### If FAIL
O sistema de retencao e LTV tem gaps estruturais criticos. Comece pelo health check de Pre-Requisitos (churn <10%, LTV:CAC >=3:1) e implemente os 5 Horsemen em ordem - estes sao a fundacao de todas as outras taticas de retencao.

---

*Checklist baseado 100% em $100M Retention Playbook + $100M Lifetime Value Playbook + $100M Money Models*
*Cross-reference: retention-sop.md, subscription-model-sop.md, subscription-model-checklist.md*
*Versao 2.0 - 2026-02-10*
*Total: 150+ checkbox items covering all SOP sections*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
