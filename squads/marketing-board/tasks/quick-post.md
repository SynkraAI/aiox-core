# Task: Quick Post — Insight Direto para Publicação

**Task ID**: quick-post
**Agent**: @marketing-cmo → @marketing-production → @marketing-designer → @marketing-distribution → @auto-publish
**Version**: 1.0.0

---

## Purpose

O José fornece o insight/ideia diretamente e o pipeline roda end-to-end até a publicação. Sem etapa de ideação — o usuário É a ideação. Inclui visualização Big Brother LIVE.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `insight` | string | **Yes** | A ideia/insight que o José quer transformar em post |
| `angulo` | string | No | Ângulo preferido (confessional/tutorial/provocação). Se omitido, CMO decide. |
| `plataforma` | string | No | "ig", "linkedin" ou "ambos" (default: ambos) |
| `auto` | boolean | No | Se true, pula confirmações intermediárias |

---

## Elicitation

```yaml
elicit: true
points:
  - step: 0
    condition: "insight not provided"
    question: "Qual insight/ideia tu quer transformar em post?"
    type: text
  - step: 0
    condition: "angulo not provided"
    question: "Qual ângulo?"
    type: choice
    options:
      - "1. Confessional (vulnerabilidade + bastidor)"
      - "2. Provocação (contrarian take)"
      - "3. Tutorial (como funciona)"
      - "4. Deixa o CMO decidir"
```

---

## Workflow

### Step 0: Receber Insight do José

```
1. José fornece o insight via argumento ou elicitation
2. Limpar eventos Big Brother: python3 emit_event.py --clear
3. Abrir LIVE no Big Brother (se não estiver aberto)
```

**EMIT:**
```bash
python3 "$E" --clear
python3 "$E" ideation start "Insight recebido do Jose" step=2
python3 "$E" ideation think "[resumo do insight]"
python3 "$E" ideation say "Jose mandou direto. Levando pro CMO." to=cmo
```

### Step 1: CMO Validation (@marketing-cmo) ⛔

```
1. @cmo recebe o insight do José
2. Aplica 3 filtros:
   a. SVA: "Para quem ESPECIFICAMENTE?"
   b. Purple Cow: "Compartilhável sem pedir?"
   c. Permission: "Constrói confiança?"
3. Resultado:
   ✅ APROVADO → Avança
   🔄 REESCREVER → Sugere ajuste ao José
   ❌ VETADO → Explica por quê e pede outro insight
```

**EMIT:**
```bash
python3 "$E" cmo think "Avaliando insight..."
python3 "$E" cmo gate "[resultado]" step=2.5 result=approved from=ideation
# ou result=vetoed
python3 "$E" ideation walk_from_gate "Aprovado" nextAgent=production
```

### Step 2: Produção (@marketing-production)

```
1. Escrever post na voz do José
2. Checklist de qualidade:
   - Hook ≤10 palavras
   - Começa com cena real
   - Zero blacklist LLM
   - Prova real incluída
   - Voz autêntica José
3. Apresentar post para José confirmar (se auto != true)
```

**EMIT:**
```bash
python3 "$E" production start "Escrevendo post..." step=3
python3 "$E" production think "[processo]"
python3 "$E" production say "Post pronto" to=designer
```

### Step 3: Direção Visual (@marketing-designer)

```
1. Decision Tree → formato visual (F1-F5)
2. Visual Brief + prompts Gemini
```

**EMIT:**
```bash
python3 "$E" designer start "Definindo visual..." step=3.5
python3 "$E" designer think "[decisao formato]"
python3 "$E" designer say "Visual Brief pronto" to=distribution
```

### Step 4: Distribuição (@marketing-distribution)

```
1. Adaptar para Instagram (≤2200 chars, casual, hashtags)
2. Adaptar para LinkedIn (≤3000 chars, profissional)
3. Verificar que são DIFERENTES
```

**EMIT:**
```bash
python3 "$E" distribution start "Adaptando plataformas..." step=4
python3 "$E" distribution think "[adaptacao]"
python3 "$E" distribution walk_to_gate "Pedindo autorizacao" gate=6
```

### Step 5: Gate 6 — Publish Authorization ⛔

```
1. Verificar compliance
2. Autorizar publicação
```

**EMIT:**
```bash
python3 "$E" gate6 think "Verificando..."
python3 "$E" gate6 gate "Publish autorizado" step=6 result=approved from=distribution
python3 "$E" distribution walk_from_gate "Seguindo" nextAgent=metrics
```

### Step 6: Salvar + Publicar

```
1. Salvar em outputs/hubs/marketing/YYYY-MM-DD.md
2. Gerar imagem via Nano Banana Pro (se carrossel/imagem)
3. Publicar via publish.py (LinkedIn + Instagram)
4. Notificar via WhatsApp
```

### Step 7: Metrics + Complete

```
1. Registrar IDs de publicação
2. Finalizar pipeline
```

**EMIT:**
```bash
python3 "$E" metrics start "Registrando..." step=7
python3 "$E" metrics think "Dados salvos"
python3 "$E" system complete "Pipeline completo."
```

---

## Exemplo de Uso

### Direto com insight
```
/quick-post insight="Gastei 6 meses construindo algo que ninguém queria comprar. O erro não foi técnico — foi ego."
```

### Com ângulo definido
```
/quick-post insight="Meu advisory board de IA foi mais sincero que meus amigos" angulo=confessional
```

### Modo rápido (sem confirmações)
```
/quick-post insight="Contratei 0 pessoas e opero como 6" auto=true
```

### Sem argumentos (elicitation)
```
/quick-post
```
→ Pergunta o insight e o ângulo via AskUserQuestion.

---

## Success Criteria

- [ ] Insight do José recebido
- [ ] CMO aprovou (Purple Cow ≥ 4/5)
- [ ] Post escrito na voz do José (checklist OK)
- [ ] Visual Brief gerado (ou texto puro justificado)
- [ ] Versão IG + LinkedIn (DIFERENTES)
- [ ] Salvo em outputs/hubs/marketing/YYYY-MM-DD.md
- [ ] Publicado no LinkedIn via API
- [ ] Publicado no Instagram via API
- [ ] Big Brother LIVE acompanhou todo o processo

---

*Task v1.0.0 — Quick Post: Do Insight à Publicação*
*José → CMO → Produção → Designer → Distribuição → Publish*
