# create-campaign

> Criar campanha semanal de conteúdo com Copy Andromeda e um dos 7 gatilhos de natanael-oliveira — sequência coordenada com objetivo de conversão

---

## Task Definition

```yaml
task_name: "create-campaign"
status: active
responsible_executor: natanael-oliveira
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- `content-pillars.json` (output de content-strategy)
- Brand Voice Guidelines
- Objetivo da campanha: awareness, geração de leads, venda, lançamento
- Produto ou oferta da campanha (quando aplicável)
- Duração da campanha (padrão: 7 dias)
- Gatilho psicológico prioritário (ou deixar para o agente selecionar)

## Output

- Plano de campanha com sequência diária de peças
- Cada peça: plataforma, formato, texto/roteiro completo
- Gatilho aplicado com justificativa
- Métricas de sucesso sugeridas

## Action Items

1. Definir objetivo primário e secundário da campanha
2. Selecionar 1 gatilho dos 7 do Copy Andromeda mais adequado ao objetivo:
   - Escassez, Urgência, Prova Social, Autoridade, Reciprocidade, Curiosidade, Identidade
3. Mapear a jornada da campanha em 3 fases: Aquecimento → Ativação → Conversão
4. Para cada dia da campanha, definir:
   - Plataforma(s) prioritária(s)
   - Formato (post, stories, carrossel, reel, e-mail)
   - Tema/ângulo alinhado com o gatilho escolhido
   - Texto ou roteiro completo da peça
5. Garantir coerência narrativa entre todas as peças da semana
6. Sugerir métricas de sucesso por objetivo
7. Revisar alinhamento com Brand Voice Guidelines

## Acceptance Criteria

- [ ] Objetivo da campanha definido explicitamente
- [ ] Gatilho selecionado com justificativa
- [ ] 3 fases da campanha (Aquecimento, Ativação, Conversão) identificadas
- [ ] Mínimo 5 peças de conteúdo com texto/roteiro completo
- [ ] Coerência narrativa: todas as peças da semana contam uma história conectada
- [ ] Métricas de sucesso sugeridas e alinhadas ao objetivo
- [ ] Tom alinhado com Brand Voice Guidelines

## Veto Conditions

- Campanha sem objetivo de conversão claro
- Gatilho aplicado de forma forçada ou incompatível com o público
- Peças isoladas sem narrativa conectada entre os dias
- CTA divergente entre as peças (confunde o público)
- Ausência de fase de aquecimento (campanha começa com venda direta)

## Output Example

```
CAMPANHA: Lançamento de Mentoria — 7 dias
OBJETIVO: 50 inscrições na mentoria de gestão para criadores
GATILHO: Prova Social + Escassez

FASE 1 — AQUECIMENTO (Dias 1-2)
Dia 1 | Instagram | Carrossel
Tema: "5 criadores que transformaram conteúdo em negócio usando esse método"
[texto completo do carrossel]

Dia 2 | LinkedIn | Post
Tema: "O padrão que encontrei nos criadores que cresceram mais rápido"
[texto completo do post]

FASE 2 — ATIVAÇÃO (Dias 3-5)
Dia 3 | Stories + E-mail
Tema: Depoimento de aluno anterior — resultado específico
[roteiro dos stories + corpo do e-mail]

[...]

FASE 3 — CONVERSÃO (Dias 6-7)
Dia 6 | Reel + E-mail
Tema: "As vagas estão acabando" — escassez real
[roteiro do reel + e-mail de urgência]

MÉTRICAS: Taxa de abertura do e-mail >35%, CTR dos stories >8%, conversão na página >5%
```
