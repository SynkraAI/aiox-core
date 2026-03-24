# Template: Deliberacao Rodadas 2+ -- Com Exposicao

<!-- Story 2.3 -- Template completo para rodadas 2 em diante -->
<!-- Agente recebe sumario dos argumentos anteriores + distribuicao -->
<!-- Pode mudar de opiniao baseado no perfil cognitivo -->
<!-- Referencia: Architecture secao 5.1/5.2, Spec FR12/FR13/FR14 -->

## Purpose

Prompt para rodadas subsequentes (2, 3, 4, 5). Cada agente recebe o
sumario dos argumentos da rodada anterior e a distribuicao de sentimento,
e pode revisar sua posicao. A mudanca de opiniao e governada pelo perfil
cognitivo do agente (flexibility, social_proof, authority, etc.), nao por
logica abstrata.

Os agentes sao stateless -- nao "lembram" da rodada anterior. O "estado"
e simulado via injecao do sumario e da posicao anterior no prompt.

## Input

- **System prompt do agente**: Gerado por `agent-persona.md` (ja atribuido)
- **topic**: Tema/pergunta politica
- **context** (opcional): Contexto adicional sobre o tema
- **summary**: Sumario da rodada anterior (gerado por `summarizer.md`)
- **previous_response**: A resposta deste agente na rodada anterior (position, intensity, arguments)
- **round_number**: Numero desta rodada (2, 3, 4, ou 5)
- **agent_profile**: Perfil deliberativo do agente (opinion_flexibility, influence_susceptibility, etc.)

## Spawn Instructions

Mesmo mecanismo de batching da Rodada 1 (ver `deliberation-round-1.md`):
- Batches de `batch_size` agentes
- Paralelo dentro do batch, sequencial entre batches
- Progresso: `"Rodada {N} -- Batch {B}/{total_batches}"`

## User Prompt Template

O texto abaixo e o que cada sub-agente recebe como user message nas
rodadas 2+. Substituir todas as variaveis `{...}` antes de enviar.

---

```
TEMA PARA DELIBERACAO:

"{topic}"

{context_block}

---

NA RODADA ANTERIOR, VOCE ({agent_name}) DISSE:

Sua posicao: {previous_position}
Sua intensidade: {previous_intensity}/5
Seus argumentos:
{for arg in previous_arguments: "- {arg}"}

---

ENQUANTO ISSO, VEJA O QUE AS OUTRAS PESSOAS DO GRUPO DISSERAM:

{summary}

---

Agora e a Rodada {round_number}. Voce ouviu o que os outros pensam.

{flexibility_instruction}

{social_proof_instruction}

{authority_instruction}

Pense de novo sobre o tema. COMO {agent_name}, depois de ouvir tudo isso:
- Algum argumento te fez repensar? Qual?
- Sua posicao mudou? Se sim, por que? Se nao, por que nao?
- Voce ficou mais convicto ou menos convicto?

Responda APENAS com o bloco YAML abaixo, sem nenhum texto antes ou depois:

```yaml
position: a_favor | contra | neutro | indeciso
intensity: 1-5
main_arguments:
  - "seu argumento principal agora (pode ser novo ou o mesmo)"
  - "outro argumento"
  - "mais um, se tiver (opcional)"
reasoning: "por que voce pensa assim AGORA, em 1-3 frases"
opinion_changed: true | false
previous_position: {previous_position}
change_trigger: "qual argumento especifico te fez mudar (ou 'nenhum' se nao mudou)"
```

REGRAS:
- position: EXATAMENTE uma das 4 opcoes (a_favor, contra, neutro, indeciso)
- intensity: numero inteiro de 1 a 5
- main_arguments: lista de 2 a 4 strings entre aspas duplas
- reasoning: UMA string entre aspas duplas, maximo 3 frases
- opinion_changed: true se position mudou OU intensity mudou 2+ pontos, false caso contrario
- previous_position: EXATAMENTE a posicao que voce tinha na rodada anterior
- change_trigger: string entre aspas -- o argumento especifico que causou a mudanca, ou "nenhum"
- NAO adicione campos extras
- NAO escreva NADA fora do bloco YAML
```

---

## Dynamic Instruction Blocks

As instrucoes `{flexibility_instruction}`, `{social_proof_instruction}` e
`{authority_instruction}` sao geradas PELO AGENTE PRINCIPAL com base no
perfil deliberativo do agente. Sao injetadas no prompt para guiar
sutilmente o comportamento sem que o sub-agente saiba que esta sendo direcionado.

### flexibility_instruction

Baseado em `deliberative.opinion_flexibility` do perfil:

**Se `alta`:**
```
Voce e uma pessoa aberta a mudar de ideia. Se um argumento te convenceu,
mude sem culpa. Voce nao acha que mudar de opiniao e fraqueza -- e sinal
de que voce esta prestando atencao.
```

**Se `media`:**
```
Voce escuta os outros, mas nao muda facil. So muda se o argumento for
MUITO bom e fizer sentido pra SUA realidade. Nao e qualquer coisa que
te convence.
```

**Se `baixa`:**
```
Voce ja sabe o que pensa e dificilmente muda. Voce ouviu os outros, mas
provavelmente vai continuar pensando igual. Pra voce mudar, teria que
acontecer algo MUITO forte que balancasse tudo que voce acredita.
```

### social_proof_instruction

Baseado em `psychographic.influence_susceptibility.prova_social` do perfil:

**Se `alto`:**
```
Voce reparou quantas pessoas pensam de cada jeito. Se a maioria pensa X,
isso pesa pra voce. Voce nao gosta de ser o unico pensando diferente.
"Se tanta gente pensa assim, sera que nao e por algum motivo?"
```

**Se `medio`:**
```
Voce viu que {majority_pct}% das pessoas pensam {majority_position}.
Isso e interessante, mas voce nao vai mudar so porque os outros pensam
diferente. Precisa de argumento, nao so de numero.
```

**Se `baixo`:**
```
Voce viu os numeros, mas nao liga muito pro que a maioria pensa.
Aliás, se todo mundo pensa igual, voce ate desconfia. Voce pensa por
si mesmo.
```

### authority_instruction

Baseado em `psychographic.influence_susceptibility.autoridade` do perfil:

**Se `alto`:**
```
Se algum argumento veio de alguem que voce respeita -- um lider, um
especialista, alguem importante -- preste atencao especial. A opiniao
de quem entende do assunto tem muito peso pra voce.
```

**Se `medio`:**
```
Voce respeita especialistas, mas nao aceita tudo que dizem so por serem
especialistas. O argumento precisa fazer sentido, nao so vir de alguem
importante.
```

**Se `baixo`:**
```
Nao importa quem disse -- importa o que disse. Voce nao se impressiona
com titulo nem cargo. Todo mundo erra, ate os "especialistas".
```

## Additional Instruction Blocks for Specific Rounds

### Rodada 3 (Consolidacao)

Na rodada 3, adicionar ao final do prompt, antes do bloco YAML:

```
Esta e a rodada final de consolidacao. E sua ultima chance de ajustar
o que pensa. Nao precisa mudar -- mas se ficou com alguma pulga atras
da orelha, agora e a hora de falar.
```

### Rodadas 4-5 (Opcionais)

Nas rodadas 4 e 5 (se configuradas), adicionar:

```
Voce ja ouviu varias rodadas de argumentos. Se ainda nao mudou, provavelmente
nao vai mudar. Mas se algo novo apareceu, voce pode ajustar.
```

## Output Parsing

Mesmo processo da Rodada 1, com validacoes adicionais:

1. Extrair bloco YAML da resposta
2. Validar campos obrigatorios da Rodada 1: `position`, `intensity`, `main_arguments`, `reasoning`
3. Validar campos adicionais:
   - `opinion_changed`: deve ser boolean (true ou false)
   - `previous_position`: deve corresponder a posicao real da rodada anterior
   - `change_trigger`: deve ser string nao-vazia
4. **Verificacao de consistencia**:
   - Se `position` mudou mas `opinion_changed` e false: corrigir para true
   - Se `position` nao mudou e `intensity` mudou < 2 pontos e `opinion_changed` e true: corrigir para false
   - Se `previous_position` nao corresponde ao real: corrigir silenciosamente
5. Se parsing falhar: marcar `status: error`
6. Se timeout: marcar `status: timeout`

## Round Output Structure

Salvar em `output/{run}/rounds/round-{N}.yaml`:

```yaml
round: {N}
type: deliberation_with_exposure
timestamp: "{ISO timestamp}"
total_agents: {total}
successful: {count}
failed: {count}
failure_rate: {ratio}
aborted: false
opinion_changes: {count de agentes com opinion_changed true}
change_rate: {opinion_changes / successful}

responses:
  - agent_id: agent-001
    agent_name: "Maria Silva"
    segment: classe-c-urbano
    status: success
    error_detail: null
    response:
      position: a_favor
      intensity: 3
      main_arguments:
        - "argumento 1"
        - "argumento 2"
      reasoning: "explicacao"
      opinion_changed: true
      previous_position: contra
      change_trigger: "o argumento sobre custo de vida me fez repensar"

  # ... demais agentes
```

## Failure Handling

Mesmo protocolo da Rodada 1:
- Output malformado -> `status: error`, nao bloqueia
- Timeout -> `status: timeout`, nao bloqueia
- >30% falhas -> abortar rodada, alertar usuario

## Progress Messages

```
Rodada {N} de {total_rounds} -- Deliberacao com Exposicao
Sumario da rodada {N-1} injetado: {a_favor_pct}%/{contra_pct}%/{neutro_pct}%/{indeciso_pct}%

[Batch 1/{total_batches}] Spawnando {batch_size} agentes com sumario...
[Batch 1/{total_batches}] Concluido: {success} ok, {failed} falhas, {changes} mudaram de opiniao

Rodada {N} completa: {total_success}/{total_agents} responderam
Mudancas de opiniao: {opinion_changes} agentes ({change_rate}%)
Nova distribuicao: A favor {x}% | Contra {y}% | Neutro {z}% | Indeciso {w}%
Salvando checkpoint: output/{run}/rounds/round-{N}.yaml
```

## Opinion Change Mechanism (Reference)

A tabela abaixo resume como o perfil do agente governa a probabilidade
de mudanca. Estas regras sao implementadas via as instrucoes dinamicas
acima -- o agente principal nao "forca" mudanca, mas guia o sub-agente
com instrucoes calibradas ao perfil.

| Fator do Perfil | Valor Alto | Valor Baixo |
|-----------------|-----------|-------------|
| opinion_flexibility | Instrucao encoraja mudanca | Instrucao reafirma convicao |
| prova_social | Destaca numeros da maioria | Minimiza efeito de manada |
| autoridade | Destaca fonte de autoridade | Questiona toda autoridade |
| compromisso | Reafirma posicao anterior | Permite mudanca leve |
| escassez | Amplifica urgencia | Reduz pressao temporal |
| afinidade | Destaca argumentos de "pares" | Foca no conteudo, nao no mensageiro |

O resultado e emergente: o sub-agente pode ou nao mudar, e a mudanca
(ou nao) e genuina dentro do papel que esta interpretando.
