# Regra: Recommendation Defensibility (Defensibilidade de Recomendações)

**ID**: RULE-RD-001
**Versão**: 1.1.0
**Aplicável a**: Todos os workflows e agentes do Kaizen Squad
**Prioridade**: ALTA — regra transversal obrigatória

---

## Princípio Core

> Recomendações são baseadas em EVIDÊNCIA, não opinião. Toda recomendação de novo agente, ferramenta ou mudança estrutural DEVE ter dados que a sustentem. Recomendações sem evidência são hipóteses, não ações.

---

## Classificação de Evidência (Obrigatória)

Antes de emitir qualquer recomendação, classificar a evidência:

| Classe | Descrição | Regra | Exemplo |
|--------|-----------|-------|---------|
| **Métrica objetiva** | Dado quantitativo medido automaticamente (DORA, throughput, custo) | Pode usar como base direta para ação | "Lead time médio do squad X: 14 dias (acima do threshold de 7)" |
| **Padrão observado** | Tendência identificada em 3+ ocorrências no ecossistema | Pode recomendar investigação ou trial | "3 dos últimos 5 épicos exigiram skills de video editing não cobertas" |
| **Sinal fraco** | Indicação com 1-2 ocorrências, sem padrão confirmado | Pode reportar como OBSERVAÇÃO, nunca como recomendação de ação | "1 story mencionou necessidade de API de transcrição" |
| **Especulação** | Conclusão sem dados de suporte | PROIBIDO em relatórios. Pode usar apenas em brainstorming interno | ~~"Provavelmente precisamos de um squad de SEO"~~ |

### Regra do N<3

**Se o padrão for baseado em menos de 3 ocorrências:**

- PROIBIDO transformar em recomendação de ação
- PROIBIDO classificar como "gap crítico"
- PROIBIDO sugerir investimento (novo agente, nova ferramenta)
- PERMITIDO como "sinal a monitorar", "observação para próxima análise"

### Regra de Verificação de Referência (GATE-RD-VERIFY)

**Aplicável a**: Toda recomendação de remover, arquivar, deprecar ou integrar.

Antes de recomendar "remover/arquivar X" ou "integrar X (órfão)":

1. **Executar `grep -r` no codebase** para verificar se X é referenciado por outros arquivos
2. **Se referenciado**: reclassificar como MONITORAR — o item NÃO é órfão/inativo
3. **Se NÃO referenciado**: confirmar com `git log --oneline -5 -- <arquivo>` que não houve atividade recente
4. **Documentar a evidência**: incluir no relatório o resultado do grep (N referências encontradas ou zero)

**Exemplos de falha que esta regra previne**:

- Recomendar "arquivar workflow X" quando X é sub-workflow de Y (grep revelaria a referência)
- Recomendar "integrar script órfão Z" quando Z já é chamado no workflow W (grep revelaria a referência)
- Recomendar "remover template T" quando T é registrado no config.yaml (grep revelaria a referência)

**Regra**: SEM grep, SEM recomendação de remoção/arquivamento.

---

### Teste de Defensibilidade

Para CADA recomendação no relatório, responder:

1. **Se o operador perguntasse "por que investir nisso?", a resposta tem dados?**
   - "Porque acho que vai ser útil" → indefensável
   - "Porque 4 dos 6 épicos ativos requerem capacidade X e nenhum agente cobre" → defensável

2. **Se a recomendação for ignorada, qual o impacto mensurável?**
   - "Nenhum impacto claro" → provavelmente especulação
   - "Lead time aumenta ~30% por retrabalho manual" → evidência sólida

3. **A recomendação ainda seria válida com dados da semana passada?**
   - Se depende de 1 evento recente → sinal fraco, não ação

---

## Níveis de Recomendação

| Nível | Evidência Mínima | Ação Sugerida | Exemplo |
|-------|-----------------|---------------|---------|
| **CRÍTICO** | Métrica em threshold + impacto no throughput | Ação imediata | "Bottleneck no squad X: task frequency caiu 60%" |
| **RECOMENDADO** | Padrão observado (N>=3) + gap confirmado | Planejar para próximo sprint | "Gap de YouTube SEO: 3 épicos precisaram, 0 agentes cobrem" |
| **SUGERIDO** | Padrão emergente (N>=2) + alinhamento estratégico | Avaliar no próximo ciclo | "2 stories mencionaram API Whisper — considerar trial" |
| **MONITORAR** | Sinal fraco (N=1) | Anotar e reavaliar | "1 menção a necessidade de analytics dashboard" |

---

## Onde Aplicar (Pontos de Integração)

### 1. Kaizen Chief — Síntese (Gate)

Antes de incluir no relatório semanal:

- [ ] Recomendação classificada por nível (CRÍTICO/RECOMENDADO/SUGERIDO/MONITORAR)
- [ ] Evidência documentada com dados específicos
- [ ] Zero especulações em recomendações de ação

### 2. Capability Mapper — Gap Detection

Gaps devem ter:

- Contagem de ocorrências (quantas stories/épicos demandaram a capacidade)
- Impacto estimado (em horas, retrabalho, ou throughput)
- Alternativa atual (como o gap está sendo contornado hoje)

### 3. Tech Radar — Movement Decisions

Movimentos entre rings devem ter:

- Pelo menos 2 fitness function results como evidência
- Comparação com alternativas existentes
- Custo estimado de adoção vs benefício projetado

### 4. Cost Analyst — ROI Calculations

ROI deve ser:

- Baseado em métricas reais (tempo, custo, throughput), não estimativas
- Com margem de erro declarada quando baseado em projeção
- Comparado com custo de não agir (status quo)

### 5. Performance Tracker — Alertas

Alertas devem ser:

- Baseados em thresholds definidos previamente (não ad-hoc)
- Com trend de pelo menos 2 períodos (não spike isolado)
- Com severity proporcional ao impacto no ecossistema

---

## Gate Universal de Recomendações

**GATE-RD: Recomendações Defensáveis**
Aplicável a TODO relatório do Kaizen Squad.

- [ ] Toda recomendação classificada por nível (CRÍTICO/RECOMENDADO/SUGERIDO/MONITORAR)
- [ ] Zero especulações em recomendações de ação
- [ ] Evidência documentada com dados específicos para cada recomendação
- [ ] Sinais fracos (N<3) não são apresentados como gaps críticos
- [ ] Se questionado, toda recomendação tem dados que a sustentam

**Status**: [GATE-PASS | GATE-FAIL]
**Data**: YYYY-MM-DD HH:MM

---

## Resumo Executivo para Agentes

| Agente | O que muda |
|--------|-----------|
| @kaizen-chief | Síntese só inclui recomendações que passam no GATE-RD |
| @topology-analyst | Classificações de team type precisam de evidência de interação |
| @performance-tracker | Alertas precisam de trend (2+ períodos), não spike isolado |
| @bottleneck-hunter | Constraint identification precisa de throughput data real |
| @capability-mapper | Gaps classificados por N de ocorrências, não por intuição |
| @tech-radar | Movimentos entre rings precisam de fitness function evidence |
| @cost-analyst | ROI com margem de erro quando baseado em projeção |
| Todos | Regra do N<3 é universal e não-negociável |

---

*Criada na fundação do squad para garantir que recomendações de investimento (novos agentes, ferramentas, APIs) sejam sempre baseadas em dados, protegendo o operador de decisões impulsivas.*
