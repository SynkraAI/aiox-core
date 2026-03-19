# create-product-launch-sequence

## Metadata
```yaml
task_id: AFF_EML_004
agent: email-nurture
type: creation
complexity: high
estimated_time: "2h-4h"
source: "Jeff Walker — Product Launch Formula (PLF); Frank Kern — List Control; André Chaperon — Autoresponder Madness"
```

## Purpose
Criar a sequência de 7-10 emails para lançamento de produto afiliado (ou lançamento conjunto com produtor), cobrindo as fases: teaser → story → reveal → proof → FAQ → urgency → deadline → last call.

## Prerequisites
- Produto afiliado com período de lançamento definido (data de abertura e fechamento do carrinho)
- Comissão especial de lançamento confirmada com o produtor (se houver)
- Bônus exclusivos de afiliado definidos (o que você oferece além do produto base)
- Lista de leads segmentada (leads que não compraram ainda + leads novos)
- Dados de lançamentos anteriores do produto (se disponíveis): open rate, conversão, EPC de lançamento
- Data de início da sequência (pelo menos 14 dias antes da abertura do carrinho)

## Steps

1. **Mapear o calendário do lançamento** — Definir datas precisas de cada fase: pré-lançamento (teaser + story), abertura do carrinho, mid-launch, fechamento e last calls.

2. **Definir os bônus exclusivos de afiliado** — Identificar o que você (afiliado) oferece além do produto base. Bônus devem ser: complementares ao produto, entregáveis por você, de alto valor percebido.

3. **Escrever a fase de Pré-Lançamento (emails 1-3)** — Teaser, história e revelação. Objetivo: criar antecipação máxima antes da abertura do carrinho.

4. **Escrever a fase de Abertura (emails 4-5)** — Reveal da oferta + prova social. O momento de apresentar o produto completo com todos os benefícios.

5. **Escrever a fase de Mid-Launch (emails 6-7)** — FAQ e objeções. Resolver dúvidas dos indecisos.

6. **Escrever a fase de Fechamento (emails 8-10)** — Urgência, deadline e last call. Pressão máxima ética nos últimos dias/horas.

7. **Configurar a automação por segmento** — Separar: leads que nunca ouviram falar do produto (mais emails), leads que já clicaram (menos emails), leads que já compraram (EXCLUIR da sequência).

8. **Testar e validar** — Verificar todos os emails, links, datas de urgência e segmentação.

## Framework

### Calendário Padrão de Lançamento (14 dias)

```
DIA -7 até -1 (Pré-Lançamento — carrinho FECHADO)
──────────────────────────────────────────────────
Email 1 (D-7): TEASER — "Algo está chegando"
Email 2 (D-4): STORY — "A história por trás do {produto}"
Email 3 (D-1): REVEAL + ANTECIPAÇÃO — "Abre amanhã. Aqui está o que vem por aí"

DIA 0 (ABERTURA DO CARRINHO)
────────────────────────────
Email 4 (D+0, manhã): ABERTURA — "ABERTO: {produto} + meus bônus exclusivos"
Email 4b (D+0, noite): ABERTURA REMINDER — "Ainda aberto — {N} horas iniciais"

DIA 1-5 (MID-LAUNCH)
─────────────────────
Email 5 (D+2): PROOF — "Resultados reais de quem já usou"
Email 6 (D+4): FAQ — "As dúvidas mais frequentes (com respostas honestas)"

DIA 6-7 (FECHAMENTO — últimas 48h)
────────────────────────────────────
Email 7 (D+6, tarde): URGENCY — "Fecha em 48 horas"
Email 8 (D+7, manhã): DEADLINE — "Fecha hoje à meia-noite"
Email 9 (D+7, tarde): LAST CALL — "6 horas restantes"
Email 10 (D+7, 21h): FINAL — "Última chance — 3 horas"
```

### Estrutura por Email

**Email 1 — TEASER**
```
Assunto: "Algo está chegando [data] e você precisa saber"
Objetivo: Criar curiosidade + antecipação
Conteúdo:
- 1 parágrafo: anunciar que em X dias algo especial abre
- 1 parágrafo: problema que resolve (sem nomear o produto)
- Open loop forte: "Semana que vem te conto mais"
Extensão: Curto (150-200 palavras)
```

**Email 2 — STORY**
```
Assunto: "A história por trás do método que muda [resultado]"
Objetivo: Construir crença e conexão emocional com o produto
Conteúdo:
- História do criador do produto (humanizar)
- O problema que ele próprio enfrentou
- Como o produto nasceu da solução desse problema
- Antecipar a abertura: "Em X dias, você vai poder..."
Extensão: Médio (400-600 palavras)
```

**Email 3 — REVEAL + ANTECIPAÇÃO**
```
Assunto: "[{produto}] abre amanhã — veja o que está incluso"
Objetivo: Maximizar a antecipação — maior open rate da série
Conteúdo:
- Nomear o produto pela primeira vez
- Listar o que está incluso (bullet points rápidos)
- Mencionar seus bônus exclusivos de afiliado
- "Amanhã de manhã você recebe o link"
Extensão: Médio (300-400 palavras)
```

**Email 4 — ABERTURA**
```
Assunto: "🚀 ABERTO: [{produto}] + [seu bônus exclusivo]"
Objetivo: Converter os mais prontos imediatamente
Conteúdo:
- Abertura direta: "Está aberto!"
- Stack de valor completo (produto + seus bônus de afiliado)
- Preço + condições especiais de lançamento
- Garantia
- CTA urgente e claro
Extensão: Médio-longo (500-700 palavras)
```

**Email 5 — PROOF**
```
Assunto: "O que acontece quando você [resultado do produto]"
Objetivo: Remover dúvida com prova social
Conteúdo:
- 3 depoimentos específicos (foto + nome + resultado numérico)
- Contexto de cada depoimento (perfil da pessoa — relatable)
- CTA secundário para o produto
Extensão: Médio (400-500 palavras)
```

**Email 6 — FAQ**
```
Assunto: "Suas perguntas sobre [{produto}] respondidas com honestidade"
Objetivo: Converter os indecisos — remover objeções específicas
Conteúdo:
- Listar 5-7 perguntas reais (ou prováveis) do avatar
- Responder com honestidade — inclusive objeções legítimas
- "Não é para todo mundo se..." (qualificar negativamente aumenta conversão)
- CTA no final
Extensão: Longo (600-800 palavras)
```

**Emails 7-10 — URGÊNCIA PROGRESSIVA**
```
Padrão para cada email de fechamento:
- Número exato de horas/vagas restantes (REAL)
- Recordar o que se perde se não agir
- Recordar seus bônus de afiliado (exclusivos, somem ao fechar)
- CTA mais direto e urgente a cada email
- Extensão: Curto a médio (200-400 palavras)
```

### Bônus de Afiliado — Framework de Seleção

```
Critérios para bônus vencedor:
✓ Complementa o produto (não duplica)
✓ Entregável por você (não por terceiros)
✓ Valor percebido alto (> 30% do preço do produto)
✓ Fácil de entregar (template, arquivo, acesso, chamada)
✓ Resolve a maior objeção do produto

Exemplos de bônus de afiliado eficazes:
- Template pronto para usar o que o produto ensina
- Chamada de 30min 1:1 para implementação
- Acesso a grupo privado de compradores
- Mini-curso complementar (próprio)
- Planilha/calculadora exclusiva
```

## Veto Conditions
- Sequência sem segmentação para quem já comprou → BLOQUEAR (comprador recebe email "compre agora" = chargeback + descadastro)
- Urgência falsa (prazo que não existe ou se renova) → BLOQUEAR (destrói confiança de longo prazo — o lead descobre e para de acreditar em todos os emails futuros)
- Bônus de afiliado prometido que não pode ser entregue por você → BLOQUEAR (calúnia + perda de credibilidade com lista)
- Mais de 2 emails em um único dia fora do período de fechamento → ALERTAR (overload causa descadastros)
- Teaser sem nomear data específica de abertura → ALERTAR (curiosidade sem âncora temporal gera menos antecipação)
- FAQ sem responder objeções reais do avatar → ALERTAR (perguntas genéricas não convertem indecisos)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/launch-sequence-{produto-slug}.md`
- **Format:** Markdown com calendário, todos os emails completos e configuração de automação

## Output Example
```yaml
launch_sequence:
  project: "afiliado-fitness-digital"
  product: "Programa Emagreça em 30 Dias"
  launch_period: "2026-03-10 a 2026-03-17"
  cart_open: "2026-03-10 09:00 BRT"
  cart_close: "2026-03-17 23:59 BRT"

affiliate_bonuses:
  - name: "Templates de Bridge Page para Fitness (5 modelos)"
    value: "R$197"
    deliverable: "PDF via email após confirmação de compra"
    relevance: "Complementa o módulo de divulgação do curso"
  - name: "Consultoria de 30 minutos via Zoom"
    value: "R$300"
    deliverable: "Link de agendamento enviado por email"
    relevance: "Remove objeção de 'não sei como começar'"

calendar:
  day_minus_7:
    date: "2026-03-03"
    email: "EMAIL 1 — TEASER"
    subject: "Algo especial abre dia 10 de março"
  day_minus_4:
    date: "2026-03-06"
    email: "EMAIL 2 — STORY"
    subject: "A história por trás do método de emagrecimento mais honesto do Brasil"
  day_0_morning:
    date: "2026-03-10 09:00"
    email: "EMAIL 4 — ABERTURA"
    subject: "🚀 ABERTO: Emagreça em 30 Dias + Meus Bônus Exclusivos"
  day_7_final:
    date: "2026-03-17 21:00"
    email: "EMAIL 10 — FINAL"
    subject: "3 horas. Depois disso, fecha para sempre."

segmentation:
  exclusions:
    - "tag: comprou-emagreca-30-dias"
    - "tag: cliente-reembolso"
  priority_segments:
    - segment: "Clicou em link de afiliado mas não comprou"
      extra_email: "Email de depoimento específico para esse perfil"
    - segment: "Abriu > 3 emails da série mas não clicou"
      action: "Enviar FAQ personalizado"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
