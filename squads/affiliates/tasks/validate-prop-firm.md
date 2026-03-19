# validate-prop-firm

## Metadata
```yaml
task_id: AFF_PRP_001
agent: prop-trading-affiliate
type: analysis
complexity: high
estimated_time: "2h-4h"
source: "FPA (Forex Peace Army) Firm Evaluation Criteria + ESMA Guidelines (adapted for prop trading affiliates)"
```

## Purpose
Avaliar a legitimidade, solidez financeira e condições operacionais de uma prop trading firm antes de qualquer promoção como afiliado, protegendo a credibilidade do canal e os traders que serão referenciados.

## Prerequisites
- Nome da prop firm e URL oficial do site
- Acesso a bases de regulação: ASIC, FCA, CySEC, FSCA (verificação de licença)
- Acesso ao Forex Peace Army (forexpeacearmy.com) para reviews históricas
- Acesso a grupos e fóruns de trading (Reddit r/Forex, r/Daytrading, grupos Telegram/Discord BR)
- Conta de teste ou acesso ao material de divulgação para verificar regras de trading

## Steps

1. **Verificar regulação e entidade legal** — Confirmar status regulatório da firma.
   - Identificar país de incorporação e regulador associado
   - Acessar portal do regulador e buscar licença da empresa:
     - ASIC (Austrália): asic.gov.au/check
     - FCA (UK): register.fca.org.uk
     - CySEC (Chipre): cysec.gov.cy/entities/
     - FSCA (África do Sul): fsca.co.za
   - Verificar: licença ativa, data de emissão, tipo de atividade autorizada, status atual (não cancelado/suspenso)
   - Documentar: número da licença, entidade regulada, data de verificação

2. **Verificar histórico de pagamentos** — Auditar track record de pagamentos a traders.
   - Pesquisar nome da firma + "payout" + "proof" no YouTube e Twitter/X
   - Verificar no Forex Peace Army: histórico de reclamações, nota geral, volume de reviews
   - Pesquisar em grupos de trading BR e internacionais: "Nome da Firma legit?" ou "pagou?"
   - Buscar evidências de: pagamentos negados, mudanças abruptas de regras pós-avaliação, retenção indevida de lucros
   - Documentar: nota FPA, número de reviews, reclamações abertas, resolve ratio

3. **Analisar política de reembolso da avaliação** — Entender condições de reembolso de taxa.
   - Verificar: taxa de avaliação é reembolsável na aprovação?
   - Verificar: condições de reembolso (prazo, exigências, forma)
   - Avaliar: algumas firms cobram taxa recorrente de conta — entender modelo completo
   - Documentar política exata e comparar com padrão do mercado

4. **Auditar regras de trading** — Verificar se as regras são razoáveis e executáveis.
   - **Drawdown:** máximo diário e máximo total (drawdown fixo vs trailing — importante)
   - **Profit Target:** meta de lucro para aprovação (% sobre capital)
   - **Time Limit:** dias mínimos e máximos de avaliação
   - **Instrumentos permitidos:** Forex, índices, commodities, cripto (se permitido)
   - **News trading:** permitido ou bloqueado nas janelas de notícia?
   - **Consistency Rule:** alguma restrição de % máxima de lucro em um único dia?
   - **Weekend Holding:** pode manter posições no fim de semana?
   - Comparar com benchmarks do mercado (ver Framework)

5. **Avaliar plataforma de trading** — Verificar qualidade da execução.
   - Plataforma disponível: MT4, MT5, cTrader, plataforma proprietária
   - Spread e comissão nas contas funded (verificar tabela de condições)
   - Slippage reportado por usuários em grupos
   - Disponibilidade 24/5 e estabilidade (verificar relatórios de downtime)

6. **Avaliar suporte e comunicação** — Testar qualidade do suporte.
   - Enviar pergunta técnica ao suporte via chat ou e-mail
   - Registrar: tempo de resposta, qualidade da resposta, disponibilidade de suporte BR (português)
   - Verificar se há suporte em PT-BR (importante para audiência brasileira)
   - Verificar presença em Discord/Telegram oficial da firma

7. **Calcular score final e emitir veredicto** — Consolidar análise em decisão.
   - Pontuar cada dimensão (ver Framework)
   - Aplicar regras de red flag automático
   - Emitir veredicto: APROVADO / CONDICIONAL / REJEITADO

8. **Documentar análise completa** — Registrar resultado no output file.
   - Salvar com data de verificação (validade: 90 dias — condições mudam)
   - Incluir links de evidência para cada claim (pagamentos, reviews, regulação)
   - Definir periodicidade de re-validação (trimestral mínimo)

## Framework

### Dimensões de Avaliação e Pontuação (0-10 por dimensão)

| Dimensão | Peso | Critério de Pontuação Máxima |
|---------|------|------------------------------|
| Regulação | 25% | Licença ativa ASIC/FCA/CySEC, sem pendências |
| Histórico de Pagamentos | 30% | FPA nota >= 4.0, sem reclamações abertas graves |
| Política de Reembolso | 10% | Taxa totalmente reembolsável na aprovação |
| Regras de Trading | 20% | Drawdown razoável, sem regras abusivas |
| Plataforma e Suporte | 15% | MT5/cTrader, spreads competitivos, suporte PT-BR |

**Score máximo: 10.0**

### Benchmarks de Regras de Trading (referência de mercado)

| Regra | Padrão Razoável | Red Flag |
|-------|----------------|---------|
| Drawdown Máximo Total | 8-12% | > 15% ou < 4% (muito restritivo) |
| Drawdown Máximo Diário | 4-5% | > 6% ou < 2% (impossível de operar) |
| Profit Target Fase 1 | 8-10% | > 15% (inalcançável em prazo razoável) |
| Profit Target Fase 2 | 5% | > 10% |
| Prazo Avaliação | 30-60 dias | < 14 dias (muito curto) |
| Profit Split (funded) | 70-90% | < 70% não vale a pena |
| Taxa de Avaliação (10K) | $99-$199 | > $300 sem reembolso |

### Red Flags Automáticos

```
HARD RED FLAGS (qualquer um = REJEITADO):
  ❌ Sem regulação identificável em nenhuma jurisdição reconhecida
  ❌ Firma com < 12 meses de operação + sem afiliação com grupo regulado
  ❌ Reclamações confirmadas de pagamentos negados sem justificativa (> 3 casos)
  ❌ Regras de trading alteradas retroativamente após aprovação do trader
  ❌ Taxa de avaliação não reembolsável + sem evidência de conta funded real

SOFT RED FLAGS (requerem investigação extra):
  ⚠️ Regulação apenas em jurisdições offshore sem supervisão real (Vanuatu, SVG)
  ⚠️ Firma < 2 anos sem track record extenso de pagamentos
  ⚠️ Consistency Rule extremamente restritiva (max 30% do lucro em 1 dia)
  ⚠️ Sem suporte em PT-BR para mercado brasileiro
```

### Thresholds de Decisão

```
APROVADO     Score >= 7.0 + zero hard red flags = promover com afiliado
CONDICIONAL  Score 5.0-6.9 + zero hard flags = promover com ressalvas documentadas
REJEITADO    Score < 5.0 OU qualquer hard red flag = NÃO PROMOVER
```

## Veto Conditions

- **HARD VETO:** Firma sem nenhuma licença regulatória verificável — não promover sob nenhuma circunstância
- **HARD VETO:** Firma com < 12 meses + zero evidência de funded traders ativos — sem track record suficiente
- **HARD VETO:** Qualquer evidência confirmada de não-pagamento de trader aprovado nos últimos 6 meses
- **HARD VETO:** Regras de trailing drawdown que tornam a conta funded impossível de operar (verificar com calculadora)
- **SOFT VETO:** Score 5.0-6.9 — promover apenas com seção explícita de riscos na review, nunca como recomendação principal

## Output

- **File:** `docs/research/{date}-prop-firm-validation-{firm-slug}.md`
- **Format:** Markdown com scorecard completo, evidências e veredicto

## Output Example

```yaml
validation_date: "2026-02-18"
firm_name: "Alpha Capital Pro"
website: "https://alphacapitalpro.com"
validity_period: "90 dias (re-validar em 2026-05-18)"

regulation:
  regulator: "FSCA"
  license_number: "FSP12345"
  jurisdiction: "South Africa"
  status: "Active"
  verified_at: "https://fsca.co.za/entities/FSP12345"
  score: 7  # FSCA = reconhecido mas tier 2 vs FCA/ASIC

payout_history:
  fpa_rating: 4.2
  fpa_reviews: 187
  open_complaints: 1  # Resolvido em 7 dias
  payment_evidence: "15+ proofs no Twitter (links documentados)"
  score: 8

refund_policy:
  evaluation_fee_refundable: true
  refund_condition: "Após aprovação da fase 2 e primeira retirada"
  score: 8

trading_rules:
  max_drawdown_total: 10
  max_drawdown_daily: 5
  profit_target_phase1: 10
  profit_target_phase2: 5
  evaluation_days_min: 5
  evaluation_days_max: 60
  profit_split: 80
  trailing_drawdown: false  # Drawdown fixo — mais justo
  news_trading: true
  weekend_holding: false
  consistency_rule: false
  score: 9

platform:
  software: "MT5"
  spread_eurusd: "0.8 pips (conta funded)"
  support_pt_br: true
  support_response_time_h: 3
  score: 8

final_score: 8.0
verdict: APROVADO

red_flags_hard: []
red_flags_soft:
  - "FSCA jurisdição tier 2 (não FCA/ASIC)"
  - "Weekend holding proibido — limitação para traders que seguram posições"

next_step: "Executar AFF_PRP_002 (create-prop-review) para Alpha Capital Pro"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
