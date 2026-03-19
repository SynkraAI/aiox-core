# validate-produto-digital

## Metadata
```yaml
task_id: AFF_BR_003
agent: affiliate-br
type: analysis
complexity: medium
estimated_time: "30min-1h"
source: "Spencer Haws — NichePursuits Product Validation Framework (adapted for BR digital products)"
```

## Purpose
Pontuar produtos digitais brasileiros em 4 dimensões (gravity, comissão, reputação do produtor, taxa de reembolso) para produzir uma decisão objetiva de PROMOTE, CAUTIOUS ou SKIP antes de qualquer investimento de tempo ou tráfego.

## Prerequisites
- Produto candidato identificado (Hotmart, Kiwify, Monetizze ou similar)
- Acesso ao painel de afiliado na plataforma do produto
- Acesso a grupos de afiliados BR (Facebook, Telegram) para pesquisa de reputação
- Dados de gravity/temperatura disponíveis no marketplace (quando aplicável)

## Steps

1. **Coletar dados brutos do produto** — Reunir informações-base antes de pontuar.
   - Plataforma, nome do produto, produtor, ticket, % comissão
   - Temperatura/gravity visível no marketplace
   - Taxa de reembolso (quando disponível no painel)
   - Data de criação do produto e volume de vendas declarado

2. **Pontuar D1: Gravity (0-3)** — Avaliar tração e velocidade de vendas do produto.
   - Analisar temperatura/gravity na plataforma (Hotmart: termômetro, Monetizze: similar)
   - Pesquisar volume de afiliados ativos em grupos BR
   - Verificar frequência de menções em redes sociais (Instagram, TikTok)
   - Aplicar escala de pontuação (ver Framework)

3. **Pontuar D2: Comissão (0-3)** — Avaliar viabilidade financeira da comissão.
   - Calcular comissão líquida real após taxas da plataforma
   - Verificar se é comissão única ou recorrente
   - Comparar com benchmark do nicho
   - Aplicar escala de pontuação

4. **Pontuar D3: Reputação do Produtor (0-3)** — Auditar credibilidade do produtor.
   - Verificar avaliações na plataforma (estrelas + comentários)
   - Pesquisar nome do produtor + "reclamação" no Google e Reclame Aqui
   - Checar presença e engajamento nas redes sociais do produtor
   - Verificar histórico de pagamentos a afiliados em grupos BR
   - Aplicar escala de pontuação

5. **Pontuar D4: Taxa de Reembolso (0-3)** — Avaliar risco de chargeback e cancelamento.
   - Obter taxa de reembolso no painel (quando disponível)
   - Para produtos sem dado disponível: pesquisar em grupos de afiliados
   - Verificar política de reembolso (prazo, processo, gatilhos)
   - Aplicar escala de pontuação (reembolso > 10% = red flag automático)

6. **Calcular score total e emitir veredicto** — Somar pontuações e aplicar thresholds.
   - Score total = D1 + D2 + D3 + D4 (máximo 12 pontos)
   - Aplicar regra de veto automático (ver Veto Conditions)
   - Emitir veredicto: PROMOTE / CAUTIOUS / SKIP

7. **Documentar análise e próximos passos** — Registrar resultado no output file.
   - Listar pontos fortes e fracos do produto
   - Definir condições para revisão de veredicto CAUTIOUS
   - Indicar próxima task recomendada

## Framework

### Escala de Pontuação por Dimensão (0-3 cada, total máx 12)

#### D1: Gravity / Temperatura

| Pontos | Hotmart Temp | Indício de Mercado |
|--------|-------------|-------------------|
| 3 | >= 100 | Produto dominante no nicho, afiliados recorrentes, menções diárias |
| 2 | 60-99 | Boa tração, afiliados ativos, menções semanais |
| 1 | 20-59 | Tração moderada, produto testado mas não dominante |
| 0 | < 20 | Produto frio ou sem dados disponíveis |

#### D2: Comissão

| Pontos | Comissão Líquida por Venda | Modelo |
|--------|--------------------------|--------|
| 3 | > R$150 ou recorrente > R$50/mês | Alta margem ou LTV elevado |
| 2 | R$60-R$150 por venda | Margem adequada para tráfego pago |
| 1 | R$20-R$60 por venda | Margem para tráfego orgânico apenas |
| 0 | < R$20 por venda | Inviável economicamente |

#### D3: Reputação do Produtor

| Pontos | Avaliação Plataforma | Presença Online | Reclamações |
|--------|---------------------|----------------|-------------|
| 3 | >= 4.5 estrelas (50+ avaliações) | Forte, engajamento alto | Zero Reclame Aqui crítico |
| 2 | 4.0-4.4 estrelas | Presença sólida | Reclamações pontuais, resolvidas |
| 1 | 3.5-3.9 estrelas | Presença básica | Algumas reclamações sem resolução |
| 0 | < 3.5 ou sem avaliações | Presença fraca ou nula | Múltiplas reclamações graves |

#### D4: Taxa de Reembolso

| Pontos | Taxa de Reembolso | Risco |
|--------|------------------|-------|
| 3 | <= 3% | Excelente — produto entrega o prometido |
| 2 | 3.1-6% | Aceitável — monitorar tendência |
| 1 | 6.1-10% | Atenção — investigar causas antes de escalar |
| 0 | > 10% | RED FLAG — não promover sem investigação profunda |

### Thresholds de Decisão

```
PROMOTE  >= 9/12  — Produto aprovado. Iniciar campanha (AFF_BR_004).
CAUTIOUS  6- 8   — Promover com cautela. Definir condições de saída.
SKIP      < 6    — Não promover. Documentar razão e rejeitar produto.
```

### Red Flag Automático

Qualquer das condições abaixo força SKIP independentemente do score total:
- Taxa de reembolso > 10%
- Produtor com nota < 3.5 E mais de 20 avaliações
- Reclamação de não-pagamento de afiliados confirmada em grupo BR
- Produto com menos de 30 dias de existência (sem track record)

## Veto Conditions

- **HARD VETO:** Taxa de reembolso > 10% confirmada — SKIP obrigatório, sem exceção
- **HARD VETO:** Relato confirmado de não-pagamento ao afiliado (qualquer valor) nos últimos 6 meses
- **HARD VETO:** Produto com evidência de prática enganosa (promessas sem base, depoimentos falsos identificados)
- **SOFT VETO:** Score < 6 — emitir SKIP com recomendação de alternativas no mesmo nicho
- **SOFT VETO:** Produto com < 60 dias e sem dados de reembolso — aguardar 60 dias antes de pontuar D4

## Output

- **File:** `docs/research/{date}-product-validation-{product-slug}.md`
- **Format:** Markdown com scorecard e veredicto

## Output Example

```yaml
validation_date: "2026-02-18"
platform: Hotmart
product_name: "Curso Forex para Iniciantes"
producer: "Ricardo Almeida"
ticket_brl: 297.00
commission_pct: 40
commission_net_brl: 103.93

scores:
  d1_gravity:
    value: 2
    notes: "Temperatura 78, afiliados ativos em 2 grupos Telegram, menções semanais"
  d2_commission:
    value: 2
    notes: "R$103,93 líquido — adequado para orgânico, apertado para pago"
  d3_producer_reputation:
    value: 3
    notes: "4.8 estrelas (120 avaliações), 45K seguidores Instagram, zero Reclame Aqui"
  d4_refund_rate:
    value: 2
    notes: "4.1% — aceitável, monitorar se escalar tráfego pago"

total_score: 9
max_score: 12
verdict: PROMOTE

strengths:
  - Reputação do produtor excelente
  - Score de gravity sólido para o nicho Forex
  - Taxa de reembolso dentro do aceitável

weaknesses:
  - Margem apertada para tráfego pago (ROI sensível ao CPL)
  - Cookie 30 dias — adequado mas funil precisa ser rápido

conditions_if_cautious: null

next_step: "Executar AFF_BR_004 (create-campanha-br) com foco em tráfego orgânico prioritário"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
