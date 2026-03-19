# prop-promotional-campaign

## Metadata
```yaml
task_id: AFF_PRP_004
agent: prop-trading-affiliate + email-nurture
type: creation
complexity: high
estimated_time: "3h-5h"
source: "Ryan Deiss — Digital Marketer Promotional Campaign Framework (adapted for prop trading flash sales)"
```

## Purpose
Criar e executar campanha de flash sale de 48-72 horas para promoção de prop trading firm, com sequência de 3 e-mails, posts sociais e urgência real baseada em deadline concreto da promoção — nunca urgência artificial.

## Prerequisites
- Prop firm validada (AFF_PRP_001) e review publicada (AFF_PRP_002)
- Promoção real confirmada com a prop firm: desconto, prazo exato, limite de vagas (se aplicável)
- Link de afiliado atualizado e link da promo confirmado (URLs podem ser específicas por campanha)
- Lista de e-mail segmentada (traders ou interessados em prop trading)
- Canais sociais configurados: Telegram, Instagram, Twitter/X
- Compliance verificado: disclaimers obrigatórios para TODOS os assets

## Steps

1. **Confirmar detalhes da promoção** — Antes de criar qualquer asset, confirmar tudo com a prop firm.
   - Prazo exato: data e hora de início e fim (com timezone)
   - Desconto: percentual ou valor em dólares sobre a taxa de avaliação
   - Limite de vagas: existe cap de usuários? (se sim, documentar o número exato)
   - Link da promo: URL específica da campanha ou coupon code
   - Condições: a promoção é aplicável em todas as contas ou apenas em tamanhos específicos?
   - Documentar TUDO em contrato ou e-mail de confirmação com a firma

2. **Criar sequência de 3 e-mails** — Produzir e-mails com @email-nurture.
   - **E-mail 1 — Anúncio (D0, hora de início da promo):**
     - Assunto: "[Nome da Firma] com X% de desconto — válido por 48h"
     - Corpo: anúncio direto, benefícios da firma, link da promo, prazo exato
     - CTA: "Garantir desconto agora"
     - Disclaimer: risk disclaimer + not financial advice + affiliate disclosure
   - **E-mail 2 — Reforço (D+1, 24h após início):**
     - Assunto: "Ainda dá tempo — [Firm] expira em [X horas]"
     - Corpo: lembrete + 2-3 razões para escolher a firma + prova social (review/testimonial)
     - CTA: "Ver oferta antes de encerrar"
   - **E-mail 3 — Urgência Final (D+2 ou D+1, 6-8h antes do fim):**
     - Assunto: "Últimas horas: [Firm] encerra hoje às [hora]"
     - Corpo: countdown real + link direto + "se você estava pensando, é agora"
     - CTA: "Últimas horas — garantir agora"
   - Todos os 3 e-mails: footer com opt-out, disclaimer completo, disclosure

3. **Criar posts sociais** — Produzir conteúdo para cada canal ativo.
   - **Telegram (3 posts):**
     - Post 1 (D0): anúncio completo com detalhes da promo
     - Post 2 (D+1): reforço com lembrete de prazo
     - Post 3 (D+1, últimas horas): urgência final com countdown
   - **Instagram (Stories + Feed):**
     - Story D0: anúncio em 3 slides (problema → solução → oferta)
     - Story D+1 últimas horas: "Expira hoje às [hora]" com countdown sticker
     - Feed D0 (opcional): post de carrossel com benefícios da firma
   - **Twitter/X (3-4 tweets):**
     - D0: anúncio + link + hashtags (#PropTrading #ForexBR)
     - D0+6h: thread sobre a firma + 1 tweet de promo
     - D+1: reminder + countdown
   - Todos os posts: incluir affiliate disclosure e risk disclaimer

4. **Configurar rastreamento por asset** — Garantir que cada peça é mensurável.
   - Criar links únicos por e-mail e por canal social (parâmetros UTM ou links de afiliado distintos)
   - E-mail 1: `?utm_source=email&utm_medium=promo&utm_campaign=firmx-flash-e1`
   - Telegram: `?utm_source=telegram&utm_medium=social&utm_campaign=firmx-flash`
   - Instagram: `?utm_source=instagram&utm_medium=stories&utm_campaign=firmx-flash`
   - Registrar todos os links no arquivo de output antes do lançamento

5. **Revisar compliance de todos os assets** — Checklist antes de publicar qualquer peça.
   - Verificar que risk disclaimer está presente em cada e-mail e post extenso
   - Verificar que affiliate disclosure está antes do primeiro link em cada e-mail
   - Confirmar que prazo citado é real (não estimado)
   - Confirmar que desconto citado é verificável no site da firma
   - Verificar que o link da promo está ativo e redirecionando corretamente

6. **Agendar e publicar sequência** — Executar o calendário de publicação.
   - Configurar os 3 e-mails no autoresponder com timing exato
   - Agendar posts do Telegram (se usando ferramenta de agendamento)
   - Publicar Story D0 manualmente no momento do lançamento
   - Monitorar primeira hora após lançamento: confirmar entrega dos e-mails, links ativos

7. **Monitorar em tempo real durante a campanha** — Acompanhar performance e problemas.
   - Verificar a cada 6h: clicks por canal, conversões registradas no painel da firma
   - Identificar canal com melhor CTR → considerar envio adicional para segmento não-engajado
   - Se produto esgotar ou promo cancelada: enviar e-mail de comunicação imediata
   - Responder a replies e DMs de traders com dúvidas sobre a firma

8. **Documentar resultado pós-campanha** — Registrar métricas e aprendizados.
   - Calcular: emails enviados → abertos → clicados → conversões → comissão por e-mail
   - Calcular: alcance social → cliques → conversões por canal
   - Total de comissão gerada vs tempo investido na campanha
   - Top 3 aprendizados para próxima campanha similar

## Framework

### Estrutura de E-mail por Fase

**E-mail 1 — Anúncio:**
```
Assunto: [FIRMA] com [X]% OFF — Somente por 48h

Pré-header: Prazo real. Desconto real. Confira.

[AFFILIATE DISCLOSURE]

[Nome do assinante],

[FIRMA] está com [X]% de desconto na taxa de avaliação — mas somente até
[DATA/HORA EXATA] ([TIMEZONE]).

Por que eu recomendo a [FIRMA]:
  ✅ [Benefício 1 — dado real]
  ✅ [Benefício 2 — dado real]
  ✅ [Benefício 3 — dado real]

Conta $100K: de $[preço normal] por $[preço com desconto]
Conta $200K: de $[preço normal] por $[preço com desconto]

→ [LINK DA PROMO]

Válido até [DATA] às [HORA] ([TZ]).

[RISK DISCLAIMER]
[NOT FINANCIAL ADVICE]

[Assinatura]
[Opt-out link]
```

**E-mail 3 — Urgência Final:**
```
Assunto: ⏰ [FIRMA] encerra HOJE às [HORA] — últimas horas

Pré-header: Depois disso, volta para o preço cheio.

[Nome],

Só estou enviando esse e-mail porque o desconto da [FIRMA] encerra
HOJE às [HORA] ([TZ]).

Se você estava pensando, esse é o momento.

→ [LINK DA PROMO] (expira em [X horas])

[RISK DISCLAIMER]
[NOT FINANCIAL ADVICE]
[Opt-out]
```

### Métricas de Benchmark para Campanha Flash Prop Trading

```
ABERTURAS E-MAIL:
  Bom:        >= 30% open rate
  Aceitável:  20-29%
  Ruim:       < 20% (rever assunto e segmentação)

CTR E-MAIL:
  Bom:        >= 5% CTR
  Aceitável:  2-5%
  Ruim:       < 2% (rever copy e CTA)

CONVERSÃO (clique → compra da avaliação):
  Bom:        >= 3% dos cliques
  Aceitável:  1-3%
  Ruim:       < 1% (rever fit produto-audiência)

EPC E-MAIL:
  Bom:        >= $2.00/email enviado
  Aceitável:  $0.50-$2.00
  Ruim:       < $0.50 (campanha não escalável)
```

### Sequência de Timing

```
D0 — 08:00 (fuso BR): E-mail 1 + Post Telegram + Story Instagram
D0 — 20:00: Tweet de reforço (thread)
D+1 — 08:00: E-mail 2 + Post Telegram 2
D+1 — [6h antes do fim]: E-mail 3 + Post Telegram 3 + Story Instagram urgência
D+1 — [1h antes do fim]: Tweet final
D+2 — 08:00: Mensagem de "encerrado" para segmento que clicou mas não comprou
```

## Veto Conditions

- **HARD VETO:** Usar urgência fictícia ("oferta por tempo limitado" sem deadline real) — desonestidade que destrói confiança permanentemente
- **HARD VETO:** Publicar antes de confirmar detalhes exatos da promoção com a prop firm — erro de informação gera reclamação e credibilidade zero
- **HARD VETO:** Publicar sem risk disclaimer e not financial advice em cada e-mail — responsabilidade legal e violação YMYL
- **HARD VETO:** Afirmar lucros esperados ao contratar a firma ("você vai lucrar X com a [Firma]") — false advertising, risco legal sério
- **SOFT VETO:** Enviar mais de 3 e-mails em campanha de 48h — aumento de unsubscribe sem ganho proporcional de conversão
- **SOFT VETO:** Não monitorar links nas primeiras 2h — links quebrados em pico de tráfego = receita perdida

## Output

- **File:** `docs/campaigns/{firm-slug}-flash-sale-{date}.md`
- **Format:** Markdown com todos os assets e relatório pós-campanha

## Output Example

```yaml
campaign: "Alpha Capital Pro — Flash Sale Feb 2026"
firm: "Alpha Capital Pro"
promo_details:
  discount_pct: 15
  valid_from: "2026-02-18 08:00 BRT"
  valid_until: "2026-02-20 08:00 BRT"
  duration_hours: 48
  applicable_accounts: ["$25K", "$50K", "$100K", "$200K"]
  coupon_code: "AFILIADOBR15"
  promo_url_verified: "https://alphacapitalpro.com/challenge/?promo=AFILIADOBR15"

email_sequence:
  email_1:
    subject: "Alpha Capital Pro com 15% OFF — somente 48h"
    send_time: "2026-02-18 08:00 BRT"
    list_size: 1847
    compliance_verified: true
  email_2:
    subject: "Ainda dá tempo — Alpha Capital expira amanhã"
    send_time: "2026-02-19 08:00 BRT"
    compliance_verified: true
  email_3:
    subject: "Últimas horas: Alpha Capital encerra hoje às 8h"
    send_time: "2026-02-20 02:00 BRT"
    compliance_verified: true

social_posts:
  telegram: 3
  instagram_stories: 4
  twitter: 3

tracking_links:
  email_1: "https://alphacapitalpro.com/?promo=AFILIADOBR15&utm_source=email&utm_campaign=flash-e1"
  telegram: "https://alphacapitalpro.com/?promo=AFILIADOBR15&utm_source=telegram"
  instagram: "https://alphacapitalpro.com/?promo=AFILIADOBR15&utm_source=instagram"

# Post-campaign (a preencher após D+2)
results:
  emails_sent: 1847
  open_rate_pct: null
  ctr_pct: null
  conversions: null
  commission_total_usd: null
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
