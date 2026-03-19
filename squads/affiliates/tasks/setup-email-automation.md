# setup-email-automation

## Metadata
```yaml
task_id: AFF_EML_003
agent: email-nurture
type: setup
complexity: high
estimated_time: "2h-4h"
source: "ActiveCampaign Automation Best Practices; ConvertKit Creator Playbook; Klaviyo Email Marketing Guide"
```

## Purpose
Configurar o sistema completo de automação de email para operação de afiliado, incluindo triggers, segmentos, flows principais (opt-in → welcome → click → purchase → re-engagement) e integrações com a plataforma afiliado.

## Prerequisites
- ESP escolhida e conta ativa (ActiveCampaign, Mailchimp, Brevo, ConvertKit, ou equivalente)
- Sequências de email escritas (welcome series, SOS ou ambas)
- Formulários de opt-in criados na landing page
- Integração entre landing page e ESP testada (webhook ou formulário nativo)
- Conta na plataforma afiliado com acesso ao dashboard (Hotmart, Eduzz, etc.)
- Domínio com SPF/DKIM configurado (ver `email-deliverability-audit.md`)

## Steps

1. **Configurar estrutura de listas e tags** — Criar arquitetura de organização: lista principal, tags por fonte de tráfego, tags por produto de interesse, tags por estágio de engajamento, tags de compra.

2. **Configurar o flow de Opt-in** — Criar automação que dispara ao opt-in: adicionar tag de fonte, iniciar welcome sequence, adicionar à lista principal, enviar confirmação (se double opt-in configurado).

3. **Configurar o flow de Welcome Sequence** — Importar os emails da welcome series ou SOS, configurar delays, condições de parada (compra) e tags de engajamento.

4. **Configurar o flow de Click (comportamental)** — Criar automação que dispara quando lead clica em link de afiliado: adicionar tag "interessado-produto-X", iniciar sequência de follow-up específica, aguardar conversão.

5. **Configurar o flow de Purchase (pós-compra)** — Criar automação que dispara ao receber confirmação de compra (via webhook do Hotmart/Eduzz ou tag manual): parar sequências de venda, iniciar sequência de boas-vindas ao comprador, aplicar tag "comprador".

6. **Configurar o flow de Re-engagement** — Criar automação para leads inativos (sem abertura há 90 dias): iniciar sequência de reativação, aplicar sunset policy.

7. **Configurar integrações** — Conectar ESP com: plataforma afiliado (webhook de compra), landing page (formulário), plataforma de quiz (se houver), CRM (se houver).

8. **Testar todos os flows** — Simular cada trigger manualmente, verificar que emails chegam, tags são aplicadas, fluxos de exclusão funcionam e webhooks disparam.

9. **Documentar a arquitetura** — Registrar toda a estrutura no arquivo de output para referência futura.

## Framework

### Arquitetura de Tags Recomendada

```yaml
estrutura_de_tags:
  # Fonte de tráfego (aplicada no opt-in)
  fontes:
    - "src-meta-ads"
    - "src-google-ads"
    - "src-organico-seo"
    - "src-youtube"
    - "src-tiktok"
    - "src-indicacao"

  # Lead magnet baixado
  lead_magnets:
    - "lm-checklist-[nome]"
    - "lm-ebook-[nome]"
    - "lm-quiz-[resultado]"
    - "lm-minicurso-[nome]"

  # Produto de interesse
  interesse:
    - "int-produto-a"
    - "int-produto-b"
    - "int-high-ticket"

  # Estágio de engajamento
  engajamento:
    - "eng-ativo-30d"      # abriu email últimos 30 dias
    - "eng-ativo-90d"      # abriu email últimos 90 dias
    - "eng-inativo-90d"    # não abriu em 90 dias
    - "eng-inativo-180d"   # candidato a sunset

  # Status de compra
  compra:
    - "comprou-produto-a"
    - "comprou-produto-b"
    - "cliente-ativo"
    - "cliente-reembolso"

  # Automações ativas
  automacoes:
    - "em-welcome-series"
    - "em-soap-opera"
    - "em-reengajamento"
    - "em-pos-compra"
```

### Mapa de Flows de Automação

```
FLOW 1: OPT-IN → WELCOME
────────────────────────
Trigger: Formulário enviado OU tag "opt-in-[lead-magnet]" aplicada
│
├── Adicionar tag: "src-[fonte]" + "lm-[lead-magnet]"
├── Adicionar tag: "em-welcome-series"
├── Aguardar 5 minutos (evitar emails simultâneos)
├── Iniciar Welcome Series (7 emails) OU SOS (5 emails)
└── Condição de saída: tag "comprou-[produto]" → ir para FLOW 4

FLOW 2: CLICK → FOLLOW-UP COMPORTAMENTAL
──────────────────────────────────────────
Trigger: Clique em link de afiliado rastreado
│
├── Adicionar tag: "int-produto-[x]"
├── Aguardar 2 dias
├── SE não tem tag "comprou-produto-x":
│   ├── Enviar email de follow-up (depoimento + urgência suave)
│   ├── Aguardar 3 dias
│   └── SE ainda não comprou: adicionar à fila de broadcast prioritário
└── SE tem tag "comprou-produto-x": não fazer nada

FLOW 3: INATIVIDADE → RE-ENGAGEMENT
──────────────────────────────────────
Trigger: 90 dias sem abrir email
│
├── Adicionar tag: "eng-inativo-90d"
├── Remover tag: "eng-ativo-30d", "eng-ativo-90d"
├── Iniciar sequência de reativação (5 emails — ver create-re-engagement-sequence.md)
└── SE não reengajou em 30 dias: adicionar tag "eng-inativo-180d" → sunset

FLOW 4: COMPRA → PÓS-COMPRA
────────────────────────────
Trigger: Webhook de compra da plataforma afiliado OU tag manual
│
├── Parar: FLOW 1, FLOW 2, FLOW 3 (se ativos)
├── Adicionar tag: "comprou-[produto]", "cliente-ativo"
├── Remover: tags de sequências de venda ativas
├── Aguardar 1 hora
├── Enviar email de boas-vindas ao comprador
├── Aguardar 3 dias
├── Enviar email de verificação (está usando o produto?)
└── Iniciar sequência de upsell/cross-sell para próximo nível da Value Ladder
```

### Configuração de Webhook (Hotmart → ESP)

```yaml
hotmart_webhook_config:
  evento: "PURCHASE_COMPLETE"
  url_webhook: "https://[seu-esp].com/webhook/[token]"
  campos_mapeados:
    email_comprador: "subscriber.email"
    nome_comprador: "subscriber.first_name"
    produto_comprado: "product.name"
    valor_pago: "purchase.price.value"
  acao_no_esp:
    - "Aplicar tag: comprou-[produto-slug]"
    - "Aplicar tag: cliente-ativo"
    - "Iniciar automação: FLOW 4"

hotmart_webhook_config_reembolso:
  evento: "PURCHASE_REFUNDED"
  acao_no_esp:
    - "Remover tag: comprou-[produto-slug]"
    - "Remover tag: cliente-ativo"
    - "Aplicar tag: cliente-reembolso"
    - "Parar automação pós-compra"
```

### Métricas de Saúde da Automação

| Métrica | Benchmark | Crítico |
|---------|-----------|---------|
| Email 1 open rate | > 50% | < 30% |
| Sequência completion rate | > 60% | < 40% |
| Click-through rate médio | > 3% | < 1% |
| Unsubscribe rate por email | < 0.3% | > 1% |
| Spam complaint rate | < 0.1% | > 0.3% |

## Veto Conditions
- Flows sem condição de saída para quem já comprou → BLOQUEAR (lead que comprou recebe email "compre agora" = experiência horrível e chargeback)
- Webhook de compra não testado antes de ligar o tráfego → BLOQUEAR (compradores não entram no flow pós-compra = perda de upsell e retenção)
- Tags de fonte de tráfego não aplicadas → ALERTAR (impossível otimizar sem saber de onde vêm os melhores leads)
- Flow de re-engagement sem sunset policy → ALERTAR (lista inflada com inativos destrói deliverability)
- Double opt-in sem fluxo de confirmação testado → ALERTAR (leads se perdem na confirmação — verificar)
- Múltiplas automações rodando simultaneamente no mesmo lead sem exclusão → ALERTAR (lead recebe emails contraditórios e em excesso)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/email-automation-architecture.md`
- **Format:** Markdown com mapa de flows, estrutura de tags e checklist de configuração

## Output Example
```yaml
email_automation_architecture:
  project: "afiliado-fitness-digital"
  esp: "ActiveCampaign"
  total_flows: 4
  total_tags: 18
  integration_hotmart: true

flows_configured:
  flow_1_optin:
    name: "Opt-in → Welcome Series"
    status: "ATIVO"
    trigger: "Tag: opt-in-checklist-fitness"
    emails: 7
    estimated_duration: "11 dias"
    exit_condition: "tag: comprou-programa-fitness"
    tested: true

  flow_2_click:
    name: "Clique → Follow-up Comportamental"
    status: "ATIVO"
    trigger: "Link clicado: link-afiliado-programa-fitness"
    emails: 2
    exit_condition: "tag: comprou-programa-fitness"
    tested: true

  flow_3_reengagement:
    name: "Inativo 90d → Re-engagement"
    status: "ATIVO"
    trigger: "90 dias sem abertura"
    emails: 5
    sunset_condition: "sem abertura em 30d após início"
    tested: true

  flow_4_purchase:
    name: "Compra → Pós-venda"
    status: "ATIVO"
    trigger: "Webhook Hotmart: PURCHASE_COMPLETE"
    emails: 4
    next_ladder_offer: "programa-avancado-fitness"
    tested: true

webhook_config:
  hotmart_purchase_url: "https://[ac-webhook-url]/[token]"
  hotmart_refund_url: "https://[ac-webhook-url]/[token-refund]"
  status: "CONFIGURADO E TESTADO"

tag_architecture:
  total_tags: 18
  documented: true
  naming_convention: "[categoria]-[descricao]-[detalhe]"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
