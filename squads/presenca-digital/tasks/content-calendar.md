# content-calendar

> Gerar calendário editorial semanal ou mensal via Content OS de Justin Welsh — planejamento sistemático e distribuído por pilares e plataformas

---

## Task Definition

```yaml
task_name: "content-calendar"
status: active
responsible_executor: justin-welsh
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- `content-pillars.json` (output de content-strategy)
- Brand Voice Guidelines
- Período do calendário (1 semana / 2 semanas / 1 mês)
- Plataformas ativas e frequência desejada por plataforma
- Campanhas ou eventos especiais no período (lançamentos, datas comemorativas)

## Output

- `content-calendar.json` — calendário em formato machine-readable
- Documento Markdown com visualização do calendário por dia
- Resumo de cobertura: pilares vs. plataformas vs. formatos

## Action Items

1. Calcular capacidade de produção: total de peças no período por plataforma
2. Distribuir pilares proporcionalmente seguindo Content OS:
   - Pico principal: 40% das peças
   - Trails: 40% divididos proporcionalmente
   - Suportes: 20% das peças
3. Para cada dia, definir:
   - Plataforma e formato da peça
   - Pilar e tema específico
   - Referência ao agente criador responsável (create-post, create-carousel, etc.)
4. Inserir campanhas e eventos especiais nos dias corretos
5. Verificar variedade: sem repetição do mesmo formato em dias consecutivos na mesma plataforma
6. Gerar `content-calendar.json` com estrutura padronizada
7. Gerar documento Markdown com visualização por semana
8. Gerar resumo de cobertura

## Acceptance Criteria

- [ ] Todos os pilares cobertos proporcionalmente (pico 40%, trails 40%, suportes 20%)
- [ ] Sem lacunas no calendário para plataformas com frequência diária
- [ ] Variedade de formatos ao longo da semana
- [ ] Campanhas e eventos especiais inseridos corretamente
- [ ] `content-calendar.json` gerado com campos: date, platform, format, pillar, theme, task_ref
- [ ] Resumo de cobertura incluído
- [ ] Cada entrada referencia a task de criação correspondente

## Veto Conditions

- Calendário com mais de 3 dias consecutivos do mesmo pilar na mesma plataforma
- Pilares não cobertos proporcionalmente (desvio acima de 15%)
- Datas de campanha ignoradas ou conflitantes com conteúdo orgânico
- `content-calendar.json` ausente ou com campos faltantes
- Frequência planejada acima da capacidade de produção informada

## Output Example

```
CALENDÁRIO — SEMANA 12 (18-24 mar)
PLATAFORMAS: LinkedIn (5x) + Instagram (7x) + X (5x)
CAMPANHAS: Nenhuma

SEG 18/03
- LinkedIn | Post | Pico | "O custo invisível da inconsistência no conteúdo" → create-post
- Instagram | Stories | Suporte | Bastidores da semana → create-stories-sequence
- X | Post | Trail-1 | Monetização: modelo de assinatura vs. infoproduto → create-post

TER 19/03
- Instagram | Carrossel | Pico | "7 sinais que você está pronto para monetizar" → create-carousel
- X | Post | Trail-2 | Produtividade: o único sistema que uso → create-post

[...]

RESUMO DE COBERTURA:
Pico: 9 peças (41%) ✓
Trail-1 (Monetização): 5 peças (23%) ✓
Trail-2 (Produtividade): 4 peças (18%) ✓
Suporte: 4 peças (18%) ✓
```
