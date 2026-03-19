# Workflow: Cover Art Direction Pipeline

## Metadata
- id: cover-art-direction
- version: 1.0.0
- type: multi-agent
- estimated_time: 15 min
- agents_involved: [@visual-director, @visual-technician, @visual-typographer, @visual-critic]
- parent_workflow: carousel-creation (Phase 3.6)

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este pipeline tem 5 steps sequenciais + 1 GATE. Se o GATE falhar, PARE. NÃO pule steps.**

---

## Purpose

Gerar prompt Nano Banana 3.0 (Gemini) para capa de carrossel Instagram com variedade visual garantida — usando debate entre agentes especializados, rotação de tipos e validação por 3 testes visuais.

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slide_copy_hook | string | yes | Copy do slide 1 (headline da capa) |
| topic | string | yes | Tema do carrossel |
| content_pillar | string | yes | Pilar de conteúdo (Educational, Inspirational, etc.) |
| cta_goal | string | yes | Objetivo do CTA |
| cover_type_override | string | no | Forçar tipo de capa específico (ignora rotação) |

## References (obrigatórias)
- `data/visual-rules.md` — 7 Princípios, 5 tipos de capa, checklist
- `data/visual-research.md` — Neurociência completa (25+ fontes)
- `templates/nano-banana-prompt-tmpl.md` — Template de 5 blocos
- `data/feed-rotation.yaml` — Tracker de rotação do feed

---

## Step 3.6.1: Cover Type Selection + Feed Context

**Agente**: Nenhum (determinístico)
**Tempo**: <2 min

1. Ler `data/feed-rotation.yaml`
2. **BLOQUEIO FÍSICO: Validar tracker não-vazio**
   - SE `covers[]` está vazio OU tem menos de 1 entrada → **PARAR IMEDIATAMENTE**
   - NÃO continuar o pipeline. NÃO assumir valores default.
   - Ação obrigatória: perguntar ao usuário: "Qual foi a cor/tipo/rosto do último post publicado?"
   - Popular o tracker com pelo menos 1 entrada ANTES de prosseguir
   - **VETO: Pipeline com tracker vazio = resultado sem contexto de feed = capa repetida**
3. Verificar últimos covers publicados
4. Aplicar mapping content_pillar → cover_type:

| Content Pillar / Tone | Cover Type | Tom |
|------------------------|------------|-----|
| Provocação, desafio de crença | Headline Bold sobre Navy | ESCURO |
| Clareza, instrução, lista, passo-a-passo | Headline Bold sobre Branco | CLARO |
| História pessoal, vulnerabilidade, confissão | Rosto + Headline | ESCURO ou CLARO |
| Dados, pesquisa, prova social, estatística | Número/Estatística Grande | ESCURO ou CLARO |
| Reflexão, filosofia, insight, frase-tese | Quote com Typewriter | ESCURO |
| **Lançamento, conquista, marco, data importante** | **Headline Bold sobre Gold** | **CLARO** |

5. Aplicar **regras de alternância de cor** (obrigatório):
   - Determinar se cover type selecionado é ESCURO ou CLARO
   - Se último post = ESCURO e selecionado = ESCURO → FORÇAR tipo CLARO (ex: "Headline Bold sobre Branco")
   - Se 2 últimos = mesma tonalidade → BLOQUEANTE, mudar obrigatoriamente
6. Verificar rotação de tipo:
   - Se tipo repetiu nos últimos 3 posts → BLOQUEAR, usar próximo na fila
   - Se cover_type_override fornecido → usar (ignorar rotação de tipo, MAS respeitar alternância de cor)
7. Verificar frequência de rosto:
   - Calcular % de has_face=true nos últimos 10 covers
   - Se < 30% → SINALIZAR: "próximo cover DEVE incluir rosto"
   - Se 3+ posts consecutivos sem rosto → FORÇAR rosto (flag: `force_face: true`)
8. Registrar decisão

**Output**: `selected_cover_type`, `cover_type_reasoning`, `rotation_context` (últimos 5 covers), `background_tone` (ESCURO/CLARO), `force_face` (true/false)

---

## Step 3.6.2: Visual Debate

**Agentes**: @visual-director + @visual-technician (PARALELO)
**Tempo**: ~5 min

### Instruções Compartilhadas (ambos recebem)
- Cover type selecionado: `{selected_cover_type}`
- Copy da capa: `{slide_copy_hook}`
- Tema: `{topic}`
- Tom de fundo: `{background_tone}` (ESCURO ou CLARO — respeitar obrigatoriamente)
- Referência obrigatória: `data/visual-rules.md`
- Contexto de rotação: `{rotation_context}`
- **REGRA**: Proposta DEVE ser diferente do último cover no rotation_context
- **REGRA**: TODOS os 7 Princípios devem ser considerados (e justificados se ausentes)
- **REGRA**: Preencher TODOS os 5 blocos do Nano Banana (ver template)
- **REGRA**: Cor de fundo DEVE respeitar `{background_tone}` (se CLARO, usar branco ou cinza claro; se ESCURO, usar navy ou cinza escuro)

### REGRA DE DIVERSIDADE OBRIGATÓRIA

Os dois conceitos DEVEM ser **estruturalmente diferentes**. Não basta variar detalhes — a abordagem base precisa divergir.

| Dimensão | Conceito A DEVE ser diferente de B em pelo menos 2 destas |
|----------|-----------------------------------------------------------|
| Presença de rosto | Com rosto vs sem rosto |
| Composição | Frontal vs overhead vs macro vs wide |
| Estilo | Cinematic vs editorial vs minimal vs abstract |
| Cenário | Ambiente real vs textura abstrata vs tipografia pura |

**Se `force_face: true`**: Um dos conceitos OBRIGATORIAMENTE deve incluir rosto (tipo "Rosto + Headline"). Instruções para rosto do Tiago:
- Enviar imagem de referência anexa ao prompt Nano Banana
- Incluir no prompt: "referência na imagem enviada, mantenha as características físicas originais (exclua apenas o óculos)"
- Expressão: contemplativa/vulnerável, NUNCA sorriso genérico
- Olhar: para baixo ou lateral (não direto para câmera, salvo provocação)

### @visual-director — Conceito A
**Foco**: Mood, atmosfera, storytelling visual
- Liderar com Bloco 1 (Art Direction) e Bloco 3 (Ambiente)
- Pensar como cinematógrafo: "qual é a cena que conta essa história?"
- Justificar: "por que esse conceito visual comunica a mensagem em 50ms?"
- **Se force_face=true**: este conceito DEVE incluir rosto

### @visual-technician — Conceito B
**Foco**: Técnica, composição, impacto visual
- Liderar com Bloco 2 (Técnica) e Bloco 5 (Design)
- Pensar como engenheiro visual: "como maximizar o impacto com a execução?"
- Justificar: "por que essa técnica maximiza engagement neste formato?"
- **Se force_face=true**: este conceito pode ser sem rosto (diversidade)

### Output de cada agente
```yaml
conceito:
  bloco_1: "..." # Art Direction
  bloco_2: "..." # Técnica
  bloco_3: "..." # Ambiente
  bloco_4: "..." # Texto (preliminar, será refinado em 3.6.4)
  bloco_5: "..." # Design
  justificativa: "..."
  auto_score: N/10
  principios_presentes: [1, 2, 3, 5, 6]  # quais dos 7
```

---

## Step 3.6.3: Visual Critic

**Agente**: @visual-critic
**Tempo**: ~3 min

### Recebe
- Conceito A + Conceito B
- `data/visual-rules.md`
- `rotation_context` (últimos 5 covers)

### Executa 4 Testes (Teste 0 compara A vs B, Testes 1-3 avaliam cada conceito)

#### Teste 0: Diversidade entre Conceitos (VETO power)
> "Os dois conceitos são estruturalmente diferentes? Diferem em pelo menos 2 das 4 dimensões?"

Checklist de dimensões:
- [ ] Presença de rosto: A ≠ B?
- [ ] Composição: A ≠ B? (frontal vs overhead vs macro vs wide)
- [ ] Estilo: A ≠ B? (cinematic vs editorial vs minimal vs abstract)
- [ ] Cenário: A ≠ B? (ambiente real vs textura abstrata vs tipografia pura)

- Contagem de dimensões diferentes: _/4
- **Se < 2 dimensões diferentes: VETO** — conceitos convergiram, devolver ao debate com instrução: "Conceito [A|B] deve mudar [dimensão] para garantir diversidade"
- **Se force_face=true E nenhum conceito tem rosto: VETO** — violação da regra de frequência facial

#### Teste 1: Repetição (VETO power)
> "Essa capa é distinguível das últimas 5? Feche os olhos e imagine o feed — essa capa QUEBRA o padrão ou se mistura?"

- Score: 1-10
- **Se < 6: VETO** — proposta descartada, volta ao debate com feedback

#### Teste 2: 7 Princípios
> "Quantos dos 7 princípios estão presentes?"

Checklist:
- [ ] P1: Cor única dominante
- [ ] P2: Alta luminosidade
- [ ] P3: Baixa saturação
- [ ] P4: Background amplo (>40%)
- [ ] P5: Textura sutil
- [ ] P6: Texto no 1o segundo
- [ ] P7: Alternância claro/escuro

- Score: N/7
- Se < 5/7: FLAG para consolidação

#### Teste 3: 50ms
> "Em 50ms, o que o cérebro processa? A hierarquia visual está correta?"

- Análise: rosto > contraste > texto > cor
- Score: 1-10
- Se < 7: sugestão de ajuste

### Output
```yaml
critic_report:
  conceito_a:
    repetition_score: N/10
    principles_score: N/7
    fifty_ms_score: N/10
    total: N/10  # média ponderada
    veto: false
    weak_points: ["..."]
  conceito_b:
    repetition_score: N/10
    principles_score: N/7
    fifty_ms_score: N/10
    total: N/10
    veto: false
    weak_points: ["..."]
  winner: "A" | "B" | "merge"
  merge_instructions: "Se merge, quais elementos de cada"
```

---

## Step 3.6.4: Typography Direction

**Agente**: @visual-typographer
**Tempo**: ~2 min

### Recebe
- Conceito vencedor (ou merge)
- Copy da capa (headline exata)
- Cover type selecionado
- `data/visual-rules.md` (Fórmula de Capa, Indicadores)
- `templates/nano-banana-prompt-tmpl.md` (Bloco 4 reference)

### Responsabilidades

1. **Posicionamento**: onde na imagem (lower third, center, top)
2. **Hierarquia**: qual linha é maior, qual recebe accent gold
3. **Overlay**: cor e opacidade sobre a imagem
4. **Indicadores**: seta → e counter N/N
5. **Gemini-friendly**: linguagem natural, texto entre aspas, "Text is clear and readable"

### Output
- `bloco_4_final`: Bloco 4 completo do Nano Banana
- `typography_adjustments`: ajustes nos outros blocos (se necessário)

---

## Step 3.6.5: Consolidation + Template Fill

**Agente**: Orchestrator (Content Engine)
**Tempo**: ~2 min

### Steps
1. Pegar conceito vencedor (ou fazer merge conforme instruções do critic)
2. Aplicar correções dos weak_points
3. Substituir Bloco 4 pelo output do typographer
4. Aplicar typography_adjustments aos outros blocos
5. Validar contra Checklist Rápido (`visual-rules.md`)
6. Montar prompt final no formato Nano Banana
7. **NÃO atualizar feed-rotation.yaml aqui** — atualização ocorre SOMENTE após GATE-PASS (ver abaixo)

### Output
- Prompt Nano Banana completo (5 blocos formatados)
- Metadados do cover (tipo, conceito, scores)

---

## GATE-COVER: Art Direction da Capa

**OBRIGATÓRIO antes de continuar**

- [ ] Feed rotation tracker validado contra feed real (não vazio se já existem posts)
- [ ] Cover type selecionado via rotação (não repetido nos últimos 3)
- [ ] **Alternância de cor respeitada** (ESCURO/CLARO alternando entre posts)
- [ ] 2 conceitos propostos independentemente **com abordagens estruturalmente diferentes**
- [ ] **Se force_face=true**: pelo menos 1 conceito inclui rosto
- [ ] Visual critic executou 4 testes (Teste 0: Diversidade + Testes 1-3)
- [ ] Nenhum VETO (diversidade, repetição, ou 50ms)
- [ ] Score do conceito vencedor >= 7/10
- [ ] Typography direction aplicada (Bloco 4 completo)
- [ ] Prompt Nano Banana completo (5 blocos)
- [ ] Checklist Rápido de visual-rules.md PASSED
- [ ] feed-rotation.yaml **será** atualizado pós-GATE (NÃO antes)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/9
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: voltar ao step que falhou.
Se VETO de diversidade (Teste 0): devolver ao debate com instrução de mudança de dimensão.
Se VETO de repetição (Teste 1): forçar cover type diferente e re-debate.
GATE-PASS: escreva "GATE-PASS: cover-art-direction [data]"

---

## Pós-GATE: Atualizar Feed Rotation

**SOMENTE executar após GATE-PASS confirmado.**

1. Atualizar `data/feed-rotation.yaml` com dados do cover aprovado
2. Campos obrigatórios: id, date, type, style, mood, has_face, palette, conceito_score, conceito, headline
3. Inserir no topo de `covers[]` (mais recente primeiro)
4. Manter max 10 entradas no histórico

**VETO: NUNCA atualizar o tracker antes do GATE-PASS. Dados de covers não aprovados NÃO entram no tracker.**
