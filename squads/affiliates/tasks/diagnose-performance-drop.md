# diagnose-performance-drop

## Metadata
```yaml
task_id: AFF_ANL_004
agent: performance-analyst + growth-optimizer
type: analysis
complexity: high
estimated_time: "1h-3h"
source: "Avinash Kaushik — Root Cause Analysis Framework + SEO Traffic Drop Diagnosis (Lily Ray, Glenn Gabe)"
```

## Purpose
Identificar a causa raiz de uma queda de performance no negócio de afiliados através de uma árvore de decisão estruturada, distinguindo entre queda de tráfego, queda de conversão e queda de EPC, e prescrevendo ações corretivas específicas para cada cenário.

## Prerequisites
- Rastreamento configurado e validado (AFF_ANL_001)
- Acesso ao GA4 com comparativo de pelo menos L30D vs L30D anterior
- Acesso ao Google Search Console
- Acesso ao dashboard nativo da plataforma de afiliados
- Queda identificada e quantificada (ex: "receita caiu 30% na última semana")

## Steps

1. **Quantificar e isolar a queda** — Antes de qualquer diagnóstico, definir com precisão:
   - Qual métrica caiu (tráfego, EPC, CR, receita)?
   - Em quanto caiu (% e valor absoluto)?
   - Quando começou (data exata ou janela)?
   - Afeta todos os produtos/páginas ou um subconjunto?
   - É queda sustentada ou flutuação pontual?

2. **Aplicar Árvore de Decisão Primária** — Usar o framework abaixo para classificar o tipo de queda e direcionar a investigação para o ramo correto.

3. **Investigar Ramo A: Queda de Tráfego** — Se sessões caíram > 20%:
   - Verificar Google Search Console: impressões e posições caíram?
     - SIM → Investigar: atualização de algoritmo recente (Semrush Sensor, Search Engine Roundtable), penalidade manual (Search Console > Segurança e ações manuais), perda de backlinks (Ahrefs > Lost Backlinks)
     - NÃO no GSC → Queda é de tráfego pago ou canal específico
   - Verificar canal por canal no GA4: qual canal perdeu volume?
   - Campanhas pagas: orçamento alterado? CPM subiu? Frequência excessiva?
   - Email: queda de open rate ou limpeza de lista?

4. **Investigar Ramo B: Queda de CR (tráfego estável, vendas caíram)** — Se sessões estáveis mas conversões caíram:
   - Verificar se houve mudança na página de vendas do produtor (sem aviso prévio)
   - Verificar se oferta mudou (preço, bônus, garantia)
   - Verificar sazonalidade do nicho: período de menor demanda?
   - Verificar competição: novo concorrente forte entrou no SERP ou em ads?
   - Testar o funil completo manualmente: link de afiliado ainda funciona? Página carrega?

5. **Investigar Ramo C: Queda de EPC (tráfego e CR estáveis, receita caiu)** — Se cliques e conversões estáveis mas receita caiu:
   - Verificar no painel da plataforma: comissão do produto foi alterada?
   - Verificar se AOV (Average Order Value) caiu: clientes comprando produto mais barato?
   - Verificar se programa de afiliados alterou regras de cookie ou janela de atribuição
   - Verificar se há fraude de cookie stuffing ou afiliados concorrentes roubando cookie

6. **Verificar fatores sazonais e externos** — Antes de concluir diagnóstico, cruzar com:
   - Google Trends para o nicho/keyword principal: queda de demanda estrutural?
   - Calendário: feriados, datas comemorativas, events (Black Friday acabou?)
   - Macro: crises econômicas, regulações, eventos de mercado relevantes

7. **Testar hipótese principal** — Escolher a hipótese de maior probabilidade e elaborar teste rápido de validação (48-72h). Não executar múltiplas correções simultaneamente — impossibilita isolamento da causa.

8. **Definir ação corretiva** — Com causa raiz identificada ou hipótese forte:
   - SEO drop por algoritmo → auditoria de conteúdo, recuperação de E-E-A-T
   - Produto do produtor mudou → contatar produtor, testar produto alternativo
   - Comissão cortada → renegociar ou substituir produto
   - Seasonal → escalar outros canais para compensar, aguardar recuperação

9. **Implementar e monitorar** — Executar ação corretiva. Definir KPI de recuperação e janela de monitoramento (7-14 dias mínimo).

10. **Documentar diagnóstico** — Registrar causa identificada, ações tomadas, resultado da recuperação e aprendizados para prevenção futura.

## Framework

### Árvore de Decisão Principal

```
RECEITA CAIU > 15%?
│
├── TRÁFEGO CAIU > 20%?
│   ├── SIM → Ramo A: Diagnóstico de Tráfego
│   │   ├── GSC impressions caíram? → SEO Issue (algoritmo, penalidade, backlinks)
│   │   ├── Apenas canal pago? → Ads Issue (budget, CPM, audience)
│   │   └── Apenas email? → Email Issue (deliverability, lista)
│   │
│   └── NÃO (tráfego estável) → Ir para próxima pergunta
│
├── CLIQUES EM LINKS AFILIADO CAÍRAM > 20%?
│   ├── SIM → Ramo B: Diagnóstico de CR (Consideration → Decision)
│   │   ├── Mudança na bridge/review page? → A/B test urgente
│   │   ├── Mudança na oferta do produtor? → Contatar produtor
│   │   └── Sazonalidade? → Google Trends
│   │
│   └── NÃO (cliques estáveis) → Ir para próxima pergunta
│
└── EPC / COMISSÃO CAIU > 15%?
    └── SIM → Ramo C: Diagnóstico de EPC/Comissão
        ├── Plataforma alterou comissão? → Verificar painel
        ├── AOV caiu? → Produto mais barato sendo vendido
        └── Cookie window mudou? → Verificar TOS da plataforma
```

### Tempo de Diagnóstico Esperado por Causa

| Causa | Tempo para Confirmar | Tempo para Resolver |
|-------|--------------------|--------------------|
| Atualização de algoritmo SEO | 24-72h (monitorar ondas) | 4-12 semanas |
| Penalidade manual | 1h (Search Console) | 2-8 semanas |
| Comissão cortada pela plataforma | 30 min (painel) | Imediato (trocar produto) |
| Página do produtor alterada | 30 min (visitar o link) | Imediato (negociar ou trocar) |
| Bug no funil / link quebrado | 30 min (testar) | Imediato (corrigir) |
| Sazonalidade | 24h (Google Trends) | Aguardar ou diversificar |
| Competição nova | 48h (análise SERP) | 4-8 semanas (conteúdo) |

### Sinais de Alerta Rápido por Ramo

**Ramo A (Tráfego):**
- GSC: queda de impressões coincide com datas de core updates conhecidas
- GA4: queda isolada em um canal específico (não sistêmica)
- Semrush Sensor: volatilidade alta na data da queda

**Ramo B (CR):**
- Funil testado manualmente: link funciona, mas página do produtor diferente
- Novo artigo de comparação de concorrente subiu no SERP
- Benchmark de CR histôrico: CR atual < 60% do histórico = problema estrutural

**Ramo C (EPC):**
- Dashboard da plataforma: data de alteração de comissão coincide com queda
- Receita por venda caiu, mas número de vendas estável = AOV problem

## Veto Conditions

- **HARD VETO:** Executar múltiplas ações corretivas simultaneamente — impossibilita identificar qual ação resolveu; testar uma por vez
- **HARD VETO:** Concluir diagnóstico em menos de 48h de dados pós-queda — flutuações normais podem simular quedas reais
- **SOFT VETO:** Assumir que queda é sazonal sem verificar Google Trends e calendário — sazonalidade é hipótese, não dado
- **ALERTA:** Queda em todos os canais simultaneamente sem causa externa clara — sinal de problema técnico no rastreamento antes de qualquer conclusão de negócio

## Output

- **File:** `outputs/affiliates/{projeto-slug}/drop-diagnosis-{YYYY-MM-DD}.md`
- **Format:** Markdown com árvore de decisão preenchida, hipótese, ações e monitoramento

## Output Example

```yaml
drop_diagnosis:
  project: "afiliado-fitness-br"
  detected_on: "2026-02-10"
  diagnosed_on: "2026-02-18"
  analysts: ["performance-analyst", "growth-optimizer"]

symptom:
  metric_affected: "receita semanal"
  drop_value: "-38%"
  drop_absolute: "de R$1.820 para R$1.127"
  period: "semana de 10-16/02 vs 03-09/02"
  scope: "produto único: Programa Emagreça em Casa (Hotmart)"

decision_tree_path:
  - question: "Tráfego caiu > 20%?"
    answer: "NÃO — sessões: -4% (dentro do normal)"
  - question: "Cliques em links afiliado caíram > 20%?"
    answer: "NÃO — cliques no link: -7%"
  - question: "EPC / comissão caiu > 15%?"
    answer: "SIM — EPC: R$2.10 → R$1.29 (-38.6%)"

root_cause:
  ramo: "C — EPC / Comissão"
  hipotese: "Plataforma Hotmart reduziu comissão do produto"
  confirmacao: "Verificado em 18/02 no painel Hotmart: comissão caiu de 40% para 25% em 08/02 sem comunicação ao afiliado"
  confidence: "CONFIRMADO"

actions:
  immediate:
    - action: "Contatar produtor para entender redução de comissão e negociar retorno a 40%"
      deadline: "2026-02-19"
      owner: "affiliates-chief"
    - action: "Identificar produto substituto no mesmo nicho com comissão >= 35%"
      deadline: "2026-02-21"
      owner: "growth-optimizer"
  medium_term:
    - action: "Diversificar para 3+ produtos no funil para reduzir dependência de comissão única"
      deadline: "2026-03-15"
      owner: "funnel-architect"

monitoring:
  kpi: "EPC semanal"
  target: "> R$1.70 em 14 dias"
  review_date: "2026-03-04"

lesson_learned: "Monitorar painel da plataforma semanalmente. Configurar alerta automático para variação de EPC > 20% semana a semana."
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
