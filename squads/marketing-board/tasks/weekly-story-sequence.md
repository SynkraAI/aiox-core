# Task: Weekly Story Sequence — OPES Marketing Arm

**Task ID**: weekly-story-sequence
**Agent**: @marketing-ideation-ig (lead) + @marketing-cmo + @marketing-production + @marketing-designer
**Version**: 1.0.0
**Methodology**: Holistic Story Sequence Strategy (Nicolas Clay)
**Reference**: `outputs/research/biblioteca-maas/holistic-story-sequence-nicolas-clay.md`
**Workflow**: `workflows/story-sequence-pipeline.md`

---

## Purpose

Gerar 7 sequencias completas de Instagram Stories para a semana inteira, cada dia com framework psicologico diferente, seguindo a Holistic Story Sequence Strategy. Output: scripts de copy + composicao de camadas + preview para aprovacao.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `semana` | date | No | Data da segunda-feira (default: proxima segunda) |
| `foco` | string | No | Foco da semana: "perpetuo", "lancamento", "aquecimento" |
| `dia` | string | No | Se informado, regera apenas 1 dia especifico |

---

## Workflow

### Step 1: Contexto Estrategico (@marketing-cmo)

```
1. Ler data/story-sequence-bank.yaml
   - Verificar objecoes ja abordadas (objection_tracker)
   - Identificar provas disponiveis (proof_bank)
   - Listar historias nao usadas recentemente (story_bank)

2. Definir foco da semana:
   - Lancamento? → Stories mais agressivos, CTAs diretos
   - Perpetuo? → Balanco padrao Heavy/Light
   - Aquecimento? → Foco em educacao + conexao

3. Selecionar 2-3 objecoes prioritarias para quinta-feira
4. Definir qual oferta/CTA sera usada no ciclo

OUTPUT: Brief estrategico semanal
```

### Step 2: Ideacao das 7 Sequencias (@marketing-ideation-ig)

```
Para CADA dia da semana, aplicar o framework correspondente:

SEGUNDA — PAIN SEQUENCE (Light)
├── Bloco 1: Pain Hook — gancho na dor principal do avatar OPES
├── Bloco 2: Agitate — consequencias de nao resolver
├── Bloco 3: Proof — screenshot/dado que comprova o problema
├── Bloco 4: Desire — visao do estado desejado
└── Bloco 5: Break Objection — quebra barreira de entrada

TERCA — YOUR PROOF SEQUENCE (Heavy)
├── Bloco 1: Personal Win Hook — vitoria pessoal de Jose
├── Bloco 2: Pain — dificuldade que Jose enfrentou
├── Bloco 3: Agitate — profundar a dificuldade
├── Bloco 4: Proof — resultado inegavel de Jose
└── Bloco 5: Relatability Hook — "voce tambem pode"

QUARTA — CLIENT PROOF SEQUENCE (Heavy)
├── Bloco 1: Client Win Hook — resultado expressivo de cliente
├── Bloco 2: Relatability — quem e o cliente (identificacao)
├── Bloco 3: Pain — situacao antes do OPES
├── Bloco 4: Agitate — sofrimento que causava
└── Bloco 5: Proof — resultado final apos OPES

QUINTA — BREAK OBJECTION SEQUENCE (Heavy)
├── Bloco 1: Curiosity Hook — mito/duvida comum
├── Bloco 2: Break Obj — quebra direta da objecao
├── Bloco 3: Storytelling — historia de alguem que superou
├── Bloco 4: Shift Mind — nova verdade / mudanca de paradigma
└── Bloco 5: Action CTA — proximo passo concreto

SEXTA — EDUCATION SEQUENCE (Light)
├── Bloco 1: Pain Hook — problema que sera resolvido
├── Bloco 2: Educate — micro-ensinamento de alto valor
├── Bloco 3: Proof — prova que funciona
├── Bloco 4: Desire — desejo de ter a solucao completa
└── Bloco 5: Desire CTA — CTA baseado no desejo

SABADO — DIFFERENTIATION SEQUENCE (Light)
├── Bloco 1: Storytelling Hook — narrativa envolvente
├── Bloco 2: Different — Unique Mechanism do OPES
├── Bloco 3: Proof — resultado superior vs alternativas
├── Bloco 4: Desire — desejo pelo metodo exclusivo
└── Bloco 5: Break Objection — "sera que e para mim?"

DOMINGO — CONNECTION SEQUENCE (Light)
├── Bloco 1: Authentic Hook — pessoal, vulneravel, bastidores
├── Bloco 2: Storytelling — desenvolvimento da historia
├── Bloco 3: Storytelling — climax
├── Bloco 4: Proof — congruencia (vive o que fala)
└── Bloco 5: CTA — convite suave para semana juntos

Para cada sequencia:
- Definir conceito do hook (1 frase)
- Selecionar prova do proof_bank
- Selecionar historia do story_bank (se aplicavel)
- Marcar objecao do tracker (se quinta)
- Definir tom (Heavy ou Light)

OUTPUT: 7 conceitos de sequencia
```

### Step 3: Gate 1 — Validacao CMO (@marketing-cmo)

```
elicit: false (automatico)

Para CADA dia, verificar:
☐ Framework correto aplicado? (5 blocos na ordem certa)
☐ SVA premium servida? (fala com quem fatura R$30-200k)
☐ Ritmo Heavy/Light respeitado?
☐ Proof existe no banco? (nao e inventada)
☐ Historia e real? (nao e fabricada)
☐ Objecao de quinta nao foi abordada recentemente?

Score: ___/5 por dia
Se algum dia < 4/5 → devolver para @ideation-ig (max 2 loops)
Se todos ≥ 4/5 → APROVADO

OUTPUT: 7 sequencias aprovadas
```

### Step 4: Producao de Scripts (@marketing-production)

```
Para CADA dia, escrever 5 blocos de copy:

REGRAS GERAIS:
- Voz do Jose Carlos Amorim (casual, direto, real)
- Cada bloco = 1 story = 2-4 frases curtas MAX
- Hook (bloco 1) = frase unica, forte, visual
- Transicao natural entre blocos (leitor quer ver o proximo)
- CTA nunca parece propaganda — e convite natural
- Zero palavras da LLM blacklist

REGRAS POR TOM:
- Heavy (ter, qua, qui): Copy afiada, numeros, resultados, confronto
- Light (seg, sex, sab, dom): Casual, pessoal, como conversa com amigo

FORMATO POR BLOCO:
---
[DIA] — [NOME DA SEQUENCIA] ([TOM])

Story 1/5 — [Nome do Bloco]
Camada L1 (Texto): "[copy aqui]"
Camada L2 (Imagem): [sugestao de background]
Camada L3 (Prova): [screenshot especifico se aplicavel]
Camada L4 (Visual): [elemento grafico se aplicavel]

Story 2/5 — [Nome do Bloco]
...
---

OUTPUT: 35 blocos de copy (7 dias × 5 stories)
```

### Step 5: Composicao Visual (@marketing-designer)

```
Para CADA story (35 total), definir:

1. Background (L2):
   - Selecionar do album "Story Sequences"
   - Regra: NUNCA fundo vazio
   - Heavy days: fotos de resultados, setup, trabalho
   - Light days: fotos de lifestyle, viagem, dia-a-dia

2. Screenshot Overlay (L3):
   - Selecionar do proof_bank em story-sequence-bank.yaml
   - Posicao: canto inferior ou lateral
   - Opacidade: 85-95%

3. Elementos Visuais (L4):
   - Setas apontando para numeros
   - Circulos destacando resultados
   - Graficos simplificados (se educacao)
   - Estilo: Miro-like (rabisco + funcional)

4. Tipografia:
   - Usar brand-guide.yaml
   - Tamanho: legivel em mobile sem zoom
   - Destaque: bold nas palavras-chave

OUTPUT: 35 briefs visuais
```

### Step 6: Compilacao do Output

```
1. Salvar em: outputs/hubs/marketing/YYYY-WNN-story-sequence/
   ├── plano.md          (resumo da semana)
   ├── segunda.md        (PAIN — 5 stories)
   ├── terca.md          (YOUR PROOF — 5 stories)
   ├── quarta.md         (CLIENT PROOF — 5 stories)
   ├── quinta.md         (BREAK OBJECTION — 5 stories)
   ├── sexta.md          (EDUCATION — 5 stories)
   ├── sabado.md         (DIFFERENTIATION — 5 stories)
   └── domingo.md        (CONNECTION — 5 stories)

2. Usar template: templates/story-sequence-output.md
```

### Step 7: Gate 2 — Preview WhatsApp

```
elicit: true

Enviar para Jose via WhatsApp (UazAPI):

📱 STORY SEQUENCE — Semana WNN

SEG (Light) — PAIN
Hook: "[hook da segunda]"

TER (Heavy) — YOUR PROOF
Hook: "[hook da terca]"

QUA (Heavy) — CLIENT PROOF
Hook: "[hook da quarta]"

QUI (Heavy) — BREAK OBJECTION
Hook: "[hook da quinta]"
Objecao: "[objecao escolhida]"

SEX (Light) — EDUCATION
Hook: "[hook da sexta]"

SAB (Light) — DIFFERENTIATION
Hook: "[hook do sabado]"

DOM (Light) — CONNECTION
Hook: "[hook do domingo]"

Ritmo: 3H / 4L ✓
Provas: [N] screenshots selecionados
Historias: [N] usadas

✅ GO | ✏️ AJUSTAR | ❌ SKIP

Jose responde:
- GO → marcar como aprovado, salvar
- AJUSTAR → receber nota, reprocessar Step 4-6
- SKIP → cancelar semana
```

### Step 8: Atualizar Tracker

```
Se aprovado:
1. Atualizar objection_tracker em story-sequence-bank.yaml
   - Marcar objecao de quinta como "abordada" + data
2. Atualizar story_bank
   - Marcar historias usadas + data
3. Atualizar proof_bank
   - Registrar quais provas foram usadas
```

---

## Output

| Output | Path | Description |
|--------|------|-------------|
| Plano semanal | `outputs/hubs/marketing/YYYY-WNN-story-sequence/plano.md` | Overview 7 dias |
| Scripts (7 files) | `outputs/hubs/marketing/YYYY-WNN-story-sequence/{dia}.md` | Copy + camadas por dia |
| Tracker update | `data/story-sequence-bank.yaml` | Objecoes, historias, provas usadas |

---

## Success Criteria

- [ ] 7 sequencias geradas (seg-dom)
- [ ] Cada sequencia tem 5 blocos na ordem correta do framework
- [ ] Ritmo Heavy/Light respeitado (3H / 4L)
- [ ] Cada story tem 4 camadas definidas (L1-L4)
- [ ] Todas as provas existem no banco (nao inventadas)
- [ ] Todas as historias sao reais (nao fabricadas)
- [ ] Objecao de quinta nao repetida nas ultimas 4 semanas
- [ ] CMO aprovou com score ≥ 4/5 por dia
- [ ] Jose aprovou via WhatsApp
- [ ] Tracker atualizado

---

*Task v1.0.0 — Weekly Story Sequence for OPES Marketing (Nicolas Clay Method)*
