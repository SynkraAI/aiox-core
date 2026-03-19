# design-lead-magnet

## Metadata
```yaml
task_id: AFF_FUN_003
agent: funnel-architect + email-nurture
type: creation
complexity: medium
estimated_time: "1h-3h"
source: "Russell Brunson — DotCom Secrets (Free Level da Value Ladder); Ryan Deiss — Lead Magnet Framework"
```

## Purpose
Criar o sistema completo de captura de leads para operação de afiliado: definir e estruturar o lead magnet ideal, a opt-in page e a thank you page, com meta de 25-45% de opt-in rate.

## Prerequisites
- Nicho e avatar do comprador definidos com clareza
- Produto(s) afiliado(s) que serão promovidos na sequência conhecidos
- Domínio/subdomínio disponível para a opt-in page
- Plataforma de email marketing ativa (Mailchimp, ActiveCampaign, Brevo, etc.)
- Funil geral mapeado (`design-affiliate-funnel.md` executado ou equivalente)

## Steps

1. **Definir o tipo de lead magnet** — Selecionar o formato mais adequado ao nicho e avatar usando o Framework de Seleção abaixo. O lead magnet deve resolver UM problema específico e imediato — não todos os problemas do avatar.

2. **Validar o tema do lead magnet** — Confirmar que o tema é: (a) altamente específico, (b) entregável em menos de 10 minutos de consumo, (c) conectado diretamente ao produto afiliado que será promovido no follow-up.

3. **Criar o conteúdo do lead magnet** — Produzir o material no formato escolhido. Qualidade importa: um lead magnet ruim gera opt-ins e destroça a reputação com a lista.

4. **Estruturar a opt-in page** — Criar página com: headline orientada ao resultado do lead magnet, bullets de benefícios (não features), formulário mínimo (nome + email, ou só email), CTA e prova social/contextual se disponível.

5. **Criar a thank you page** — Página pós opt-in com: confirmação de entrega, instrução clara sobre próximo passo (checar email / download direto), introdução do "próximo nível" (soft bridge para o produto afiliado ou próxima etapa do funil).

6. **Integrar com plataforma de email** — Configurar: formulário conectado à lista correta, tag de segmentação aplicada no opt-in, email de entrega do lead magnet configurado (imediato, automatizado).

7. **Testar o fluxo completo** — Fazer opt-in de teste, verificar recebimento do email de entrega, confirmar que a thank you page carrega corretamente, verificar tags no ESP.

8. **Documentar** — Registrar todas as decisões e configurações no arquivo de output.

## Framework

### Seleção do Tipo de Lead Magnet

| Tipo | Melhor Para | Tempo de Consumo | Opt-in Rate Típico |
|------|------------|-----------------|-------------------|
| Checklist | Avatares que precisam de ação rápida | < 5 min | 35-45% |
| Mini-curso (3-5 emails) | Nichos de educação/transformação | 3-5 dias | 25-35% |
| Calculator/Planilha | Finanças, saúde, produtividade | 5-10 min | 30-40% |
| Template pronto para usar | Marketing, negócios, produtividade | < 5 min | 35-45% |
| Quiz + resultado | Qualquer nicho (alta interatividade) | 3-5 min | 40-55% |
| eBook curto (5-15 páginas) | Nichos com avatar educado | 15-20 min | 20-30% |
| Vídeo-aula (15-20 min) | Nichos visuais (fitness, culinária) | 15-20 min | 25-35% |

### Fórmula da Opt-in Page de Alta Conversão

```
[HEADLINE — above the fold]
Formato: "Descubra/Obtenha/Aprenda {resultado específico} em {tempo realista}"
Ou: "O {formato} Gratuito que {audiência} Usa Para {resultado}"

[BULLETS — 3 a 5, orientados ao resultado]
- Formato: "Como {resultado}, mesmo se {objeção}"
- Começar com: "Descubra...", "Como...", "O segredo de...", "Por que..."
- NUNCA listar features: "PDF de 10 páginas" ≠ benefício

[FORMULÁRIO]
- Campos: máximo Nome + Email (só Email se possível)
- Label do botão: "{VERBO} + {Benefício}" — ex: "QUERO O CHECKLIST GRATUITO"
- Microcopy abaixo: "Sem spam. Cancele quando quiser."

[PROVA SOCIAL — opcional mas recomendado]
- Número de downloads: "Já baixado por +{N} pessoas"
- Depoimento rápido: 1 linha + foto
```

### Estrutura da Thank You Page

```
[CONFIRMAÇÃO]
Headline: "Pronto! Seu {lead magnet} está a caminho."
Instrução: "Cheque seu email — incluindo pasta de spam."

[PRÓXIMO PASSO — soft bridge]
Headline: "Enquanto isso, deixa eu te mostrar uma coisa..."
Conteúdo: Story de 2-3 parágrafos que conecta o lead magnet ao produto afiliado
CTA: Botão para a bridge page ou direto para o produto (warm, já optou)

[INSTRUÇÃO DE DELIVERY — se download direto]
Botão: "BAIXAR AGORA → " (link para o arquivo)
```

### Critérios de Qualidade do Lead Magnet

| Critério | Alvo |
|----------|------|
| Resolve UM problema específico | Obrigatório |
| Consumível em < 10 minutos | Obrigatório para checklist/template |
| Conectado ao produto afiliado | Obrigatório |
| Título orientado ao resultado | Obrigatório |
| Nível de qualidade "surpreende" | Recomendado |

## Veto Conditions
- Lead magnet genérico ("7 Dicas Para Ter Sucesso") sem especificidade de nicho → BLOQUEAR (opt-in rate despenca para < 10%)
- Opt-in page com mais de 2 campos além de email → ALERTAR (cada campo adicional reduz conversão em ~10%)
- Lead magnet sem conexão clara com o produto afiliado que será promovido → ALERTAR (a lista captada não converterá para o produto)
- Thank you page sem next step → ALERTAR (oportunidade desperdiçada — lead está mais engajado neste momento)
- Formulário sem integração com ESP testada → BLOQUEAR (opt-ins se perdem, lista não cresce)
- Opt-in rate abaixo de 15% após 100 visitas → BLOQUEAR publicidade até otimizar

## Output
- **File:** `outputs/affiliates/{projeto-slug}/lead-magnet-system.md`
- **Format:** Markdown com estruturas de página e especificações do lead magnet

## Output Example
```yaml
lead_magnet_system:
  project: "afiliado-renda-extra-digital"
  niche: "renda extra online para iniciantes"
  avatar: "CLT 28-40 anos querendo renda extra, nunca vendeu online"

lead_magnet:
  type: checklist
  title: "Checklist: 10 Passos Para Sua Primeira Venda Como Afiliado em 7 Dias"
  format: "PDF 1 página + versão mobile"
  delivery: "email imediato pós opt-in"
  connected_to: "Curso Afiliado do Zero — Hotmart (produto promovido no follow-up)"
  estimated_consumption_time: "5 minutos"

optin_page:
  headline: "Descubra os 10 Passos Que Afiliados Iniciantes Usam Para Fazer a Primeira Venda em 7 Dias"
  subheadline: "Checklist gratuito — baixe agora e comece hoje"
  bullets:
    - "Como escolher o produto certo (sem perder semanas testando os errados)"
    - "O método de divulgação que funciona sem gastar em anúncios"
    - "Como escrever sua primeira mensagem de venda (mesmo sem experiência)"
  form_fields: ["email"]
  cta_button: "QUERO O CHECKLIST GRATUITO"
  microcopy: "Sem spam. Cancele quando quiser."
  social_proof: "Já baixado por +2.300 iniciantes"
  target_optin_rate: "35-40%"

thank_you_page:
  headline: "Pronto! Seu checklist está a caminho."
  instruction: "Verifique seu email agora (inclusive pasta de spam)."
  next_step:
    headline: "Enquanto você aguarda, deixa eu te mostrar o próximo passo..."
    story_hook: "Quando eu segui esse checklist pela primeira vez, tive minha primeira venda em 5 dias. Mas foi só quando descobri um sistema completo que as vendas ficaram consistentes..."
    cta_button: "VER O SISTEMA COMPLETO →"
    cta_target: "bridge page para produto afiliado"

email_delivery:
  trigger: "opt-in confirmado"
  delay: "imediato"
  subject: "Aqui está seu checklist (+ um bônus)"
  preview_text: "Os 10 passos para sua primeira venda estão aqui"
  body_summary: "Entrega do PDF + introdução da sequência SOAP Opera"
  attachment: "checklist-primeira-venda.pdf"

metrics:
  target_optin_rate: "35%"
  target_email_open_rate: "> 50% (email de entrega)"
  target_ctr_thank_you_to_bridge: "> 20%"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
