# Analysis Quality Checklist — Per Dimension

# ID: KZ-QC-003
# Used by: kaizen-chief para validar qualidade de cada dimensão da análise

## Validação por Dimensão

### 1. Estrutura (topology-analyst)

- [ ] Todos os squads ativos inventariados
- [ ] Tipo de team topology classificado (stream-aligned, enabling, complicated-subsystem, platform)
- [ ] Cognitive load score calculado por squad
- [ ] Interações entre squads mapeadas (collaboration, X-as-a-Service, facilitating)
- [ ] Evidência de interação baseada em git log / file references

### 2. Performance (performance-tracker)

- [ ] DORA metrics calculadas com dados reais de git log
- [ ] BSC scored com justificativa por dimensão (financial, customer, process, learning)
- [ ] OKR status verificado contra stories/PRDs
- [ ] Classificação Elite/High/Medium/Low aplicada por squad
- [ ] Trends comparados com período anterior (não spike isolado)

### 3. Bottlenecks (bottleneck-hunter)

- [ ] System constraint identificado com throughput data
- [ ] 5 Focusing Steps aplicados (Identify, Exploit, Subordinate, Elevate, Repeat)
- [ ] OMTM definido para o constraint
- [ ] Impacto no pipeline quantificado
- [ ] Alternativas de resolução listadas com trade-offs

### 4. Capabilities (capability-mapper)

- [ ] Capability matrix construída (domínio → agente → squad)
- [ ] Requirement matrix extraída de stories/PRDs ativos
- [ ] Gaps classificados por N de ocorrências (RULE-RD-001)
- [ ] 4R analysis aplicada (Recruit, Retain, Reskill, Redesign)
- [ ] Cada gap tem score impacto x urgência

### 5. Technology Radar (tech-radar)

- [ ] Todas as ferramentas categorizadas em 4 quadrantes (APIs, MCPs, Libraries, Models)
- [ ] Ring placement com evidência (Adopt >3 usos, Trial 1-3, Assess gap, Hold issues)
- [ ] Movimentos documentados com rationale
- [ ] Fitness functions executadas por squad
- [ ] Consolidação de ferramentas duplicadas avaliada

### 6. Custos (cost-analyst)

- [ ] Custo estimado por squad com breakdown (agentes, tokens, APIs)
- [ ] Waste identificado com savings potencial
- [ ] ROI calculado para cada recomendação com margem de erro
- [ ] Forecast baseado em trend de 2+ períodos
- [ ] FinOps phases aplicadas (Inform, Optimize, Operate)

## Gate de Qualidade Global

- [ ] Todas as 6 dimensões cobertas (nenhuma omitida)
- [ ] Dados de filesystem scans reais em todas as dimensões
- [ ] Recomendações passam no GATE-RD (RULE-RD-001)
- [ ] Max 5 recomendações priorizadas no relatório final
- [ ] Executive summary em max 3 frases

## Veto Conditions

- Dimensão sem dados reais → BLOQUEAR e refazer scan
- Recomendação sem evidência de N>=3 → REBAIXAR para MONITORAR
- Mais de 5 recomendações no relatório → CORTAR por menor impacto
- Dimensão inteira omitida → NOTAR explicitamente no relatório
