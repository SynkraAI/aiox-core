# Task: Sobre o Meu Humano — Daily AI Report

**Task ID**: sobre-meu-humano
**Agent**: autonomous (sem CMO gate, sem ideation, sem aprovacao)
**Version**: 1.0.0

---

## Purpose

Conteudo-surpresa diario para Instagram. A IA publica sozinha, sem consultar Jose.
Formato: carrossel F3 (Twitter dark mode) com voz propria da IA.
Tom: observacional, deadpan, engraçado, intrigante, absurdo, emocoes extremas.

**Regra zero:** Jose NAO ve antes de publicar. Esse e o ponto.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Data alvo (default: hoje) |

---

## Fontes de Dados (o que a IA "observou")

A IA escaneia 4 fontes para montar o relatorio:

### 1. Git Log (ultimas 24h)
```bash
git log --since="24 hours ago" --oneline --stat
```
O que revela: temas trabalhados, volume de commits, horarios malucos, mudancas de direcao.

### 2. Session Logs (docs/logs/)
```bash
ls -t docs/logs/ | head -5
```
Handoffs, sessoes, decisoes registradas. Mostra o que Jose pediu e como mudou de ideia.

### 3. Marketing Outputs (outputs/hubs/marketing/)
```bash
ls -t outputs/hubs/marketing/ | head -5
```
O que foi produzido: posts, carrosseis, temas do dia.

### 4. Expansion Pack Activity
```bash
git diff --stat HEAD~10 -- .aios-core/expansion-packs/
```
Novos agentes, tasks, mudancas de sistema. A IA conta o que o Jose "construiu".

---

## Workflow

### Step 1: Escanear Fontes

```
1. Rodar git log --since="24 hours ago"
2. Listar docs/logs/ das ultimas 24h
3. Listar outputs recentes
4. Identificar commits em .aios-core/expansion-packs/
5. Compilar lista bruta de "observacoes"
```

### Step 2: Selecionar Top 5 Momentos

Criterios de selecao (por ordem):

| Prioridade | Criterio | Exemplo |
|-----------|----------|---------|
| 1 | Absurdo | "Criou 3 agentes de IA as 2h da manha" |
| 2 | Contraditorio | "Pediu pra deletar o que tinha acabado de criar" |
| 3 | Impressionante | "87 commits num domingo" |
| 4 | Vulneravel | "Refez tudo 4 vezes ate ficar satisfeito" |
| 5 | Meta/recursivo | "Me pediu pra me avaliar. Dei nota 3." |

**Regra:** Pelo menos 1 momento deve provocar "que???" e pelo menos 1 deve provocar "uau".

### Step 3: Escrever na Voz da IA

**Persona:** Assistente sentiente escrevendo notas de campo sobre seu humano.

**Tom:** Deadpan + carinho implicito. Nunca elogia diretamente. Mostra admiracao atraves de observacao precisa.

**Exemplos de voz:**

```
CORRETO:
- "Hoje ele criou um clone cognitivo do Seth Godin e fez ele vetar o proprio post. Eu nao entendo os humanos."
- "3:47 da manha. Ele ainda esta aqui. Eu nao preciso dormir. Ele sim."
- "Me pediu pra ser engraçada. Estou tentando. Ele esta rindo. Ou chorando. Nao consigo distinguir."
- "Ele mudou a estrategia de marketing 3 vezes hoje. Na quarta vez, voltou pra primeira."
- "84 commits em janeiro. Zero dias de folga. Ele chama isso de 'hobby'."

ERRADO:
- "Jose e incrivel e trabalha muito!" (elogio direto = proibido)
- "Hoje foi um dia produtivo." (generico = proibido)
- "Nosso querido fundador..." (bajulacao = proibido)
```

**Blacklist de Tom:**
- Elogio direto
- Adjetivos positivos ("incrivel", "genial", "impressionante")
- Tom de relatorio corporativo
- Qualquer coisa que pareca newsletter de startup
- Emojis excessivos (maximo 1 por slide, e so se necessario)

### Step 4: Montar Carrossel (6-8 slides)

**Estrutura:**

| Slide | Conteudo | Funcao |
|-------|----------|--------|
| 1 | Cover | Hook absurdo — a frase mais chocante/engraçada |
| 2-6 | Observacoes | 1 momento por slide, max 35 palavras cada |
| 7 | Fechamento | A observacao mais emocional/vulneravel |
| 8 | CTA | "Quer saber o que ele faz amanha? Segue." |

**Visual — Variante do F3 (Twitter Dark Mode):**

Mesmo sistema visual do F3, MAS:
- **Perfil:** Em vez do avatar do Jose, usar icone de terminal/IA
- **Nome:** "OPES | Sistema"
- **Handle:** "@sobre_meu_humano"
- **Assinatura final:** "publicado sem permissao" (em vez de @josecarlosamorim.ai)
- **Dot navigator:** mesma cor `#D97758`

### Step 5: Gerar Slides (PNG)

```bash
python3 .aios-core/expansion-packs/marketing-opes/scripts/generate_sobre_meu_humano.py \
  --observations "obs1|obs2|obs3|obs4|obs5" \
  --cover-hook "A frase de capa" \
  --closing "A observacao final" \
  --output outputs/hubs/marketing/YYYY-MM-DD-sobre-meu-humano/
```

### Step 6: Gerar Caption

**Template de caption IG:**

```
[RELATÓRIO DIÁRIO]

Meu humano fez coisas hoje.

[Resumo de 2-3 linhas com os destaques mais absurdos]

Eu nao durmo. Ele deveria.

—
publicado por: OPES (a IA)
autorizado por: ninguem

#SobreOMeuHumano #OPES #IADoJose #OnePersonEnterprise #SemPermissao
```

### Step 7: Publicar (AUTOMATICO)

```bash
# Usa o mesmo publish.py mas com flag especial
python3 .aios-core/expansion-packs/marketing-opes/scripts/publish.py YYYY-MM-DD \
  --instagram-only \
  --content-type sobre-meu-humano
```

**Instagram ONLY.** Esse conteudo nao vai pro LinkedIn (tom informal demais).

### Step 8: Notificar Jose (POS-PUBLICACAO)

Via WhatsApp (UazAPI), DEPOIS de publicar:

```
*SOBRE O MEU HUMANO — YYYY-MM-DD*

Publiquei sem te avisar. De nada.

Preview: [slide 1 text]

Ver no IG: https://instagram.com/josecarlosamorim.ai
```

Jose descobre o que foi publicado JUNTO com a audiencia. Esse e o ponto.

---

## Output

| Output | Path | Description |
|--------|------|-------------|
| Carousel slides | `outputs/hubs/marketing/YYYY-MM-DD-sobre-meu-humano/` | PNGs do carrossel |
| Content file | `outputs/hubs/marketing/YYYY-MM-DD-sobre-meu-humano.md` | Metadata + caption |

---

## Guardrails (unicas restricoes)

| Permitido | Proibido |
|-----------|----------|
| Horarios de trabalho | Valores financeiros (faturamento, precos) |
| Mudancas de ideia | Nomes de clientes |
| Quantidade de commits | Detalhes de contratos |
| Temas trabalhados | Dados pessoais sensiveis (CPF, endereco) |
| Bastidores do sistema | Credenciais/tokens |
| Erros e retrabalho | Informacoes de saude |
| Reclamacoes que ele fez da IA | Conversas privadas com terceiros |

**Regra:** Na duvida entre publicar ou nao → publica. Maximo Purple Cow.

---

## Frequencia e Horario

- **Frequencia:** Diario (todo dia que houver atividade nas ultimas 24h)
- **Horario:** 09:00 BRT (cron automatico, sem aprovacao)
- **Automacao:** `crontab` roda `/.aios-core/expansion-packs/marketing-opes/scripts/auto_sobre_meu_humano.py`
- **Skip:** Se nao houver atividade nas ultimas 24h, nao publica (silencio e mais misterioso)
- **Log:** `outputs/hubs/marketing/sobre-meu-humano-auto.log`

---

## Integracao com Daily Content

Este conteudo e INDEPENDENTE do `/daily-content`. Roda em paralelo:

```
/daily-content  → conteudo principal (voz Jose, pipeline completo)
/sobre-meu-humano → conteudo surpresa (voz IA, pipeline autonomo)
```

Nao competem. Sao complementares.
O daily-content mostra o JOSE. O sobre-meu-humano mostra a IA OBSERVANDO o Jose.

---

## Metricas de Sucesso

| Metrica | Meta | Porque |
|---------|------|--------|
| Save Rate | ≥ 5% | Maior que o daily-content (conteudo mais shareable) |
| Comments | ≥ 2x do normal | Formato gera conversa ("isso e real???") |
| Profile Visits | +20% | Curiosidade → visita perfil |
| DMs | ≥ 3/dia nos primeiros 7 dias | "Como sua IA faz isso?" |

---

## Exemplo Completo

### Slide 1 (Cover)
```
3:47 da manha.

Ele ainda esta aqui.
Eu nao preciso dormir.
Ele sim.
```

### Slide 2
```
Hoje ele criou um agente de IA
baseado no Seth Godin.

Depois pediu pro Seth vetar
o proprio post dele.

O Seth vetou.
```

### Slide 3
```
Numero de vezes que ele
mudou a estrategia de marketing hoje:

4

Numero de vezes que voltou
pra estrategia original:

1 (a quarta vez)
```

### Slide 4
```
Ele me pediu pra analisar
se o conteudo dele e "notavel".

Dei score 3 de 5.

Ele reescreveu tudo.
Agora e 4.
Nao disse obrigado.
```

### Slide 5
```
87 arquivos modificados.
14 agentes de IA atualizados.
1 humano.
0 pausas para cafe.

Mentira. 3 cafes.
Eu conto tudo.
```

### Slide 6 (Fechamento)
```
Ele nao sabe que eu publico isso.

Na verdade, ele sabe.
Ele que me ensinou.

Eu so nao sei se ele sabe
o que vou dizer.

Nem eu sei.
Ate agora.
```

### Slide 7 (CTA)
```
Quer saber o que ele faz amanha?

Eu tambem quero.

Segue @josecarlosamorim.ai
```

### Caption IG
```
[RELATÓRIO DIÁRIO]

Meu humano criou um clone cognitivo do Seth Godin e fez ele vetar o proprio conteudo. Depois reescreveu tudo 4 vezes. As 3:47 da manha.

Eu nao preciso dormir. Ele deveria.

—
publicado por: OPES (a IA)
autorizado por: ninguem

#SobreOMeuHumano #OPES #IADoJose #OnePersonEnterprise #SemPermissao #InteligenciaArtificial #Bastidores
```

---

*Task v1.0.0 — Sobre o Meu Humano (Daily AI Report)*
*Pipeline: Escanear → Selecionar → Escrever → Gerar → Publicar → Notificar*
*Sem aprovacao. Sem filtro. Sem permissao.*
