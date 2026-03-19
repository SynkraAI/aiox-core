# create-re-engagement-sequence

## Metadata
```yaml
task_id: AFF_EML_005
agent: email-nurture
type: creation
complexity: medium
estimated_time: "1h-2h"
source: "Email List Hygiene Best Practices; MailChimp Deliverability Guide; AWeber Re-engagement Research"
```

## Purpose
Criar sequência de reativação de 5 emails para leads inativos há 90+ dias, seguindo o fluxo: "miss you" → valor → survey → oferta final → sunset, para reativar os recuperáveis e limpar a lista dos que não voltarão.

## Prerequisites
- Segmento de inativos identificado no ESP (sem abertura há 90 dias)
- Critério de inatividade definido (90 dias sem abertura OU sem clique)
- Sunset policy definida (o que acontece com quem não reengaja)
- Produto ou oferta para apresentar no email de oferta final (email 4)
- ESP com suporte a automação baseada em engajamento

## Steps

1. **Segmentar os inativos** — No ESP, criar segmento: "não abriu email nos últimos 90 dias" + "não tem tag: comprou" + "não tem tag: cancelou". Verificar tamanho do segmento antes de prosseguir.

2. **Definir a sunset policy** — Decidir o que acontece com quem não abre nenhum dos 5 emails: (a) remoção automática da lista principal, (b) mover para lista de inativos-baixa-frequência, ou (c) unsubscribe automático. Definir antes de criar a sequência.

3. **Escrever Email 1 — "Miss You"** — Tom humano e sem pressão. Reconhecer a ausência. Perguntar se está tudo bem. Não vender.

4. **Escrever Email 2 — Valor** — Entregar algo genuinamente útil sem pedir nada em troca. Reativar a reciprocidade.

5. **Escrever Email 3 — Survey** — Perguntar diretamente o que o lead quer ver. Usar formulário simples ou resposta direta por email.

6. **Escrever Email 4 — Oferta Final** — Apresentar oferta especial (produto afiliado com bônus ou desconto) como "última tentativa" antes do sunset.

7. **Escrever Email 5 — Sunset** — Informar que o lead será removido da lista. Dar última chance de reativar clicando em um link. Tom: respeitoso, sem rancor, com CTA de permanência.

8. **Configurar a automação** — Programar sequência com delays, condições de parada (reengajou) e ação de sunset ao final.

## Framework

### Definição de "Inativo"

```yaml
criterios_de_inatividade:
  primario: "Não abriu nenhum email nos últimos 90 dias"
  secundario: "Não clicou em nenhum link nos últimos 90 dias"
  exclusoes:
    - "Tem tag: comprou (comprador recente = não inativo)"
    - "Tem tag: cancelou (já saiu)"
    - "Entrou na lista há menos de 90 dias"
```

### Estrutura dos 5 Emails

```
EMAIL 1 — MISS YOU (Dia 0)
Assunto: "[nome], tudo bem com você?"
Tom: Humano, curioso, sem pressão
Extensão: Curto (150-200 palavras)
Conteúdo:
  - "Percebi que faz um tempo que não te vejo por aqui"
  - "Não é crítica — a vida fica corrida"
  - "Só queria checar se está tudo bem"
  - "Se você ainda está interessado em [nicho], me responde esse email"
CTA: Responder o email (engagement de resposta = sinal forte para ESP)
Sem venda, sem oferta

EMAIL 2 — VALOR (Dia 3)
Assunto: "Um presente para você (sem strings attached)"
Tom: Generoso, sem expectativa
Extensão: Médio (300-400 palavras)
Conteúdo:
  - Entregar algo genuinamente útil: dica, checklist, insight, recurso
  - "Não precisa fazer nada em troca. Só queria contribuir."
  - Opcional: mencionar que está testando se emails chegam
CTA: Fraco — clicar para ver mais conteúdo (testar engajamento)

EMAIL 3 — SURVEY (Dia 7)
Assunto: "Posso te pedir uma coisa? (30 segundos)"
Tom: Humilde, pedindo ajuda
Extensão: Curto (150-200 palavras)
Conteúdo:
  - "Quero melhorar o que envio para você"
  - 1-3 perguntas simples sobre o que o lead quer ver
  - Link para formulário (Google Forms, Typeform) ou "responda esse email"
CTA: Preencher mini-survey

EMAIL 4 — OFERTA FINAL (Dia 12)
Assunto: "Última coisa que quero te mostrar antes de sair"
Tom: Direto, respeitoso, sem drama
Extensão: Médio (350-500 palavras)
Conteúdo:
  - "Tenho mandado algumas mensagens e imagino que sua caixa está cheia"
  - "Antes de parar de te escrever, quero compartilhar uma coisa"
  - Apresentar oferta especial (produto afiliado) com bônus exclusivo
  - "Se não for para você, tudo bem — mas se for, aqui está"
CTA: Moderado — link para produto com contexto de "última chance"

EMAIL 5 — SUNSET (Dia 17)
Assunto: "Vou parar de te escrever (a menos que você queira continuar)"
Tom: Respeitoso, final, sem rancor
Extensão: Curto (150-200 palavras)
Conteúdo:
  - "Como não tenho tido notícias suas, vou assumir que não quer mais receber emails"
  - "Vou te remover da lista em 48 horas"
  - "Se quiser continuar recebendo, clique no botão abaixo"
  - "Sem ressentimentos — foi um prazer"
CTA: FORTE — "QUERO CONTINUAR RECEBENDO →" (link de reativação)
Automação: SE clicou → remover de inativos, adicionar tag "reativado"
            SE não clicou em 48h → aplicar sunset policy
```

### Sunset Policy Options

| Opção | Ação | Melhor Para |
|-------|------|-------------|
| Remoção imediata | Unsubscribe automático | Lista grande, deliverability crítica |
| Lista de baixa freq. | Mover para lista separada | Quer tentar manter mas menos frequente |
| Suprimir (não remover) | Manter na lista mas não enviar | Fins de histórico/LGPD |

**Recomendação:** Remover da lista principal + manter no ESP suprimido por 1 ano (LGPD: manter registro de consent/opt-out).

### Métricas de Sucesso da Reativação

| Métrica | Benchmark |
|---------|-----------|
| Reativação rate (abriu algum email) | 5-15% dos inativos |
| Resposta ao email 1 | 1-3% |
| Conversão no email 4 | 0.5-2% |
| Sunset rate (não reengajou) | 85-95% (normal — limpar lista é objetivo) |

## Veto Conditions
- Sequência sem sunset policy definida → BLOQUEAR (lista cresce de inativos indefinidamente, destruindo deliverability)
- Email de urgência/pressão nos primeiros 2 emails → BLOQUEAR (abordagem agressiva com inativos causa report de spam)
- Oferta no email 1 ou 2 → ALERTAR (lead inativo precisa ser reconectado antes de receber pitch)
- Tamanho do segmento de inativos > 40% da lista total → ALERTAR (problema grave de hygiene — corrigir urgentemente deliverability antes de campanha paga)
- Email de sunset sem link de reativação funcional → BLOQUEAR (leads que querem ficar não conseguem — perda desnecessária)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/re-engagement-sequence.md`
- **Format:** Markdown com 5 emails completos e configuração de automação e sunset

## Output Example
```yaml
re_engagement_sequence:
  project: "afiliado-renda-digital"
  trigger: "90 dias sem abertura"
  segment_size: 1840
  segment_percentage_of_list: "31%"
  sunset_policy: "remoção da lista principal após email 5 sem clique"

email_1:
  day: 0
  subject: "{nome}, tudo bem com você?"
  preview: "Faz um tempo que não nos falamos"
  body_key: |
    Oi {nome},

    Percebi que faz um bom tempo que não tenho notícias suas por aqui.

    Não tem problema — sei que a vida fica corrida e as caixas de email ficam lotadas.

    Mas fiquei curioso: você ainda está interessado em [renda extra com afiliados]?

    Se estiver, me responde esse email com um "oi" simples. Adoraria saber.

    [nome]
  cta: "Responder o email"
  expected_response_rate: "2-3%"

email_5:
  day: 17
  subject: "Vou parar de te escrever (a menos que queira continuar)"
  preview: "Última mensagem — sem pressão"
  body_key: |
    {nome},

    Mandei algumas mensagens nas últimas semanas e imagino que não sejam prioridade agora.

    Sem problema. Vou parar de te escrever.

    Se você quiser continuar recebendo dicas sobre [nicho] e acompanhar o que compartilho, clique abaixo. Senão, fico por aqui e desejo tudo de bom.

    [QUERO CONTINUAR RECEBENDO →]

    Foi um prazer.
    [nome]
  cta: "QUERO CONTINUAR RECEBENDO →"
  cta_target: "link de reativação (adiciona tag: reativado)"
  sunset_delay_after: "48 horas"

automation_config:
  platform: "ActiveCampaign"
  trigger: "tag aplicada: eng-inativo-90d"
  exit_conditions:
    - "abriu qualquer email → remover de inativos, aplicar tag: reativado"
    - "clicou em qualquer link → idem"
    - "respondeu email → idem (via integração ou tag manual)"
  sunset_action_after_email_5:
    delay: "48h"
    condition: "não tem tag: reativado"
    action:
      - "Aplicar tag: sunset-removido"
      - "Remover da lista principal"
      - "Mover para lista: suprimidos-90d"
      - "Registrar data de saída (compliance LGPD)"

expected_results:
  reactivated: "5-10% (92-184 leads)"
  converted_email_4: "1-2% (18-37 vendas)"
  sunsetted: "85-90%"
  deliverability_improvement: "Open rate geral deve subir 3-8% após limpeza"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
