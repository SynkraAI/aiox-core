# Template: Deliberacao Rodada 1 -- Opiniao Individual

<!-- Story 2.1 -- Template completo para a primeira rodada de deliberacao -->
<!-- Cada agente forma opiniao SEM ver argumentos de outros -->
<!-- Referencia: Spec secao 3.8, FR10/FR11/FR13, Architecture secao 5.1 -->

## Purpose

Prompt para a primeira rodada de deliberacao. Cada agente recebe apenas
seu perfil (via system prompt gerado por `agent-persona.md`) + o tema +
contexto opcional, e forma opiniao individual "pura", sem exposicao a
outros agentes. Esta rodada captura a reacao genuina de cada perfil
demografico antes de qualquer influencia social.

## Input

- **System prompt do agente**: Gerado por `agent-persona.md` (ja atribuido ao sub-agente)
- **topic**: Tema/pergunta politica (obrigatorio)
- **context** (opcional): Documento ou texto com contexto adicional sobre o tema

## Spawn Instructions

O agente principal (Claude Code) deve spawnar sub-agentes em paralelo
usando o Agent tool. O processo segue o ciclo de vida:
SPAWN -> PROMPT -> RESPOND -> CAPTURE -> TERMINATE

### Batching

Para paineis com mais de `batch_size` agentes (default: 10 conforme `config.yaml`):

1. Dividir o painel em batches de `batch_size` agentes
2. Cada batch executa em paralelo internamente (todos os agentes do batch ao mesmo tempo)
3. Batches sao sequenciais entre si (batch 2 comeca apos batch 1 terminar)
4. Mostrar progresso: `"Rodada 1 -- Batch {B}/{total_batches} -- Agente {A}/{batch_size}"`

### Spawn Pattern

Para cada agente no batch, usar o Agent tool com:

- **System prompt**: O prompt completo gerado por `agent-persona.md` para este agente
- **User prompt**: O conteudo abaixo (secao "User Prompt Template"), com variaveis substituidas

## User Prompt Template

O texto abaixo e o que cada sub-agente recebe como user message. Substituir
`{topic}` e `{context_block}` antes de enviar.

---

```
TEMA PARA DELIBERACAO:

"{topic}"

{context_block}

---

Voce acabou de ouvir esse tema pela primeira vez. Ninguem te perguntou antes.
Ninguem te disse o que pensar. E so voce e o que voce sabe da vida.

Pense como VOCE -- {agent_name} -- pensaria de verdade.
Nao como um comentarista de TV. Nao como um professor.
Como VOCE, na sua casa, no seu bairro, com sua experiencia.

Responda APENAS com o bloco YAML abaixo, sem nenhum texto antes ou depois:

```yaml
position: a_favor | contra | neutro | indeciso
intensity: 1-5
main_arguments:
  - "seu argumento principal, na SUA linguagem"
  - "outro argumento que te convence"
  - "mais um, se tiver (opcional)"
reasoning: "por que voce pensa assim, em 1-3 frases, do seu jeito"
```

REGRAS:
- position: EXATAMENTE uma das 4 opcoes (a_favor, contra, neutro, indeciso)
- intensity: numero inteiro de 1 (quase tanto faz) a 5 (visceral, com raiva/paixao)
- main_arguments: lista de 2 a 4 strings entre aspas duplas
- reasoning: UMA string entre aspas duplas, maximo 3 frases
- NAO adicione campos extras
- NAO escreva NADA fora do bloco YAML
- NAO use linguagem academica se voce nao e academico
- NAO seja "equilibrado" se voce nao e equilibrado -- se voce e radical, SEJA radical
```

---

## Context Block Generation

Se `context` foi fornecido, montar o `{context_block}` assim:

```
CONTEXTO ADICIONAL (informacoes sobre o tema):

{conteudo do contexto, resumido em no maximo 200 palavras}

Use esse contexto como informacao de fundo. Voce NAO precisa concordar com nada
do que esta escrito -- forme sua propria opiniao baseada em quem voce e.
```

Se `context` nao foi fornecido, `{context_block}` fica vazio (string vazia).

## Output Parsing

Apos cada sub-agente responder, o agente principal deve:

1. Extrair o bloco YAML da resposta (procurar por ```yaml ... ``` ou conteudo YAML direto)
2. Validar campos obrigatorios: `position`, `intensity`, `main_arguments`, `reasoning`
3. Validar valores:
   - `position` deve ser uma das 4 opcoes validas
   - `intensity` deve ser inteiro entre 1 e 5
   - `main_arguments` deve ter entre 2 e 4 itens
4. Se parsing falhar: marcar agente como `status: error` com `error_detail` descritivo
5. Se agente nao responder (timeout): marcar como `status: timeout`
6. Se parsing ok: marcar como `status: success`

## Round Output Structure

Salvar em `output/{run}/rounds/round-1.yaml`:

```yaml
round: 1
type: individual
timestamp: "{ISO timestamp}"
total_agents: {N}
successful: {count de status success}
failed: {count de status error + timeout}
failure_rate: {failed / total_agents}
aborted: false  # true se failure_rate > 0.30

responses:
  - agent_id: agent-001
    agent_name: "Maria Silva"
    segment: classe-c-urbano
    status: success  # success | error | timeout
    error_detail: null  # preenchido se status != success
    response:
      position: contra
      intensity: 4
      main_arguments:
        - "argumento 1"
        - "argumento 2"
      reasoning: "explicacao"

  - agent_id: agent-002
    agent_name: "Joao Santos"
    segment: classe-de-periferia
    status: error
    error_detail: "YAML malformado: campo position ausente"
    response: null

  # ... demais agentes
```

## Failure Handling

- **Output malformado**: Marcar como `status: error`, registrar `error_detail`, NAO bloquear rodada
- **Timeout de agente**: Marcar como `status: timeout`, NAO bloquear rodada
- **>30% de falhas** (`failure_rate > 0.30`): ABORTAR rodada, setar `aborted: true`, alertar usuario:
  ```
  ERRO: Rodada 1 abortada. {failed}/{total_agents} agentes falharam ({failure_rate}%).
  Threshold maximo: 30%. Verifique os logs de erro em output/{run}/rounds/round-1.yaml.
  Possivel causa: template de persona gerando outputs nao-YAML. Revise agent-persona.md.
  ```
- **Falha entre batches**: Salvar dados parciais, reportar e continuar com proximo batch

## Progress Messages

Durante execucao, mostrar ao usuario:

```
=== FASE 2: DELIBERACAO ===
Rodada 1 de {total_rounds} -- Opiniao Individual
Painel: {total_agents} agentes | Batches: {total_batches} de {batch_size}

[Batch 1/{total_batches}] Spawnando {batch_size} agentes...
[Batch 1/{total_batches}] Concluido: {success} ok, {failed} falhas
[Batch 2/{total_batches}] Spawnando {batch_size} agentes...
[Batch 2/{total_batches}] Concluido: {success} ok, {failed} falhas

Rodada 1 completa: {total_success}/{total_agents} agentes responderam
Distribuicao preliminar: A favor {x}% | Contra {y}% | Neutro {z}% | Indeciso {w}%
Salvando checkpoint: output/{run}/rounds/round-1.yaml
```
