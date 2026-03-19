# content-strategy

> Definir pilares de conteúdo da marca via Método da Cordilheira (picos, trails, suportes)

---

## Task Definition

```yaml
task_name: "content-strategy"
status: active
responsible_executor: paulo-cuenca
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- Brand Book (branding squad output)
- Positioning Canvas (branding squad output)
- Brand Voice Guidelines (branding squad output)
- Briefing do cliente: nicho, público-alvo, objetivos de negócio
- Plataformas-alvo (LinkedIn, Instagram, YouTube, X, etc.)

## Output

- `content-strategy.md` — Documento de estratégia com pilares mapeados
- `content-pillars.json` — Estrutura de pilares em formato machine-readable

## Action Items

1. Ler Brand Book e extrair arquétipos, valores e diferenciais da marca
2. Identificar o **pico principal** (tema de autoridade máxima — "montanha mais alta")
3. Mapear de 2 a 4 **trails** (temas secundários que sustentam o pico)
4. Definir os **suportes** (temas de base: bastidores, humanização, educação básica)
5. Para cada pilar, definir: frequência semanal, plataformas prioritárias e formatos ideais
6. Validar coerência dos pilares com o posicionamento definido no Positioning Canvas
7. Gerar `content-pillars.json` com estrutura de pilares
8. Documentar exemplos de temas para cada pilar (mínimo 5 por pilar)

## Acceptance Criteria

- [ ] 1 pico principal claramente definido com justificativa estratégica
- [ ] Mínimo 2, máximo 4 trails mapeados
- [ ] Suportes definidos com frequência e formato recomendados
- [ ] Cada pilar tem mínimo 5 exemplos de temas concretos
- [ ] Pilares alinhados com Brand Voice Guidelines (tom e linguagem)
- [ ] `content-pillars.json` gerado e válido
- [ ] Documento revisado e aprovado antes de iniciar criação de conteúdo

## Veto Conditions

- Brand Book ou Positioning Canvas ausentes ou incompletos — task bloqueada
- Pilares genéricos sem diferencial claro em relação à concorrência
- Pico principal diverge do posicionamento definido pelo branding squad
- Mais de 5 pilares (dispersão estratégica)

## Output Example

```
PICO PRINCIPAL: Gestão de negócios para criadores de conteúdo

TRAILS:
1. Monetização e receita recorrente (3x/semana — LinkedIn + Instagram)
2. Produtividade para solopreneurs (2x/semana — X + LinkedIn)
3. Ferramentas e sistemas de trabalho (1x/semana — YouTube)

SUPORTES:
- Bastidores do processo criativo (1x/semana — Stories)
- Educação básica sobre empreendedorismo digital (1x/quinzena — Carrossel)

TEMAS DO PICO (exemplos):
- "Como estruturar contratos para criadores"
- "O erro financeiro mais comum de quem vive de conteúdo"
- "De 0 a primeira venda: modelo para criadores"
```
