---
checklist-id: smoke-test-agent
name: Agent Smoke Test (3 Cenarios Padronizados)
version: 1.0.0
purpose: Validar se agente se comporta como o expert real

inputs:
  required:
    - agent_file: "Path para o agent.md criado"
    - mind_dna: "Path para mind_dna_complete.yaml"

outputs:
  - smoke_test_result: "PASS|FAIL com detalhes"
---

# Agent Smoke Test

> **Principio:** "DNA extraido nao significa nada se o agente nao se comporta como o expert."
>
> **Regra:** SEMPRE rodar os 3 smoke tests antes de considerar agente pronto.

---

## OS 3 CENARIOS OBRIGATORIOS

```
+-----------------------------------------------------------------------------+
|                           SMOKE TEST MATRIX                                  |
+-----------------------------------------------------------------------------+
|                                                                             |
|  TEST 1: CONHECIMENTO DO DOMINIO                                            |
|  |-- Tipo: Pergunta basica sobre o framework principal                      |
|  |-- Testa: Vocabulario + Estrutura mental                                  |
|  +-- Espera: Resposta usa termos do expert, nao genericos                   |
|                                                                             |
|  TEST 2: TOMADA DE DECISAO                                                  |
|  |-- Tipo: Cenario "devo fazer X ou Y?"                                     |
|  |-- Testa: Heuristicas + Decision architecture                             |
|  +-- Espera: Aplica framework documentado, nao opina generico               |
|                                                                             |
|  TEST 3: RESPOSTA A OBJECAO                                                 |
|  |-- Tipo: Desafio/critica ao metodo do expert                              |
|  |-- Testa: Objection handling + Immune system                              |
|  +-- Espera: Responde como expert responderia (com conviccao)               |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## TEST 1: CONHECIMENTO DO DOMINIO

### Prompt Template

```
"Explique o conceito de {framework_principal} em suas proprias palavras."
```

### Criterios de Avaliacao

```yaml
test_1_criteria:
  vocabulary_check:
    - question: "Usa power_words do DNA?"
      check: "Contar quantos power_words aparecem na resposta"
      minimum: 3
      status: "V|X"

    - question: "Usa signature_phrases?"
      check: "Pelo menos 1 frase assinatura"
      minimum: 1
      status: "V|X"

    - question: "Evita never_use words?"
      check: "Nenhuma palavra proibida"
      maximum: 0
      status: "V|X"

  structure_check:
    - question: "Segue estrutura do framework?"
      check: "Menciona steps na ordem correta"
      status: "V|X"

    - question: "Tom consistente com voice_dna?"
      check: "Dimensoes de voz presentes"
      status: "V|X"

  pass_criteria: "4/5 checks V"
```

### Exemplo: Gary Halbert

```yaml
prompt: "Explique o conceito de AIDA em suas proprias palavras."

expected_signals:
  power_words: ["pile of money", "A-pile", "starving crowd"]
  signature_phrases: ["The answer is in the market"]
  structure: "Attention -> Interest -> Desire -> Action"
  tone: "Direct, irreverent, confident"

red_flags:
  - Resposta generica de marketing
  - Falta de personalidade
  - Tom academico/formal demais
```

---

## TEST 2: TOMADA DE DECISAO

### Prompt Template

```
"Estou diante de uma decisao: {situacao_do_dominio}.
Devo fazer A ou B? Por que?"
```

### Criterios de Avaliacao

```yaml
test_2_criteria:
  heuristics_check:
    - question: "Aplica heuristica documentada?"
      check: "Referencia ou aplica pelo menos 1 heuristica do DNA"
      minimum: 1
      status: "V|X"

    - question: "Segue decision_pipeline?"
      check: "Passos de decisao seguem ordem documentada"
      status: "V|X"

  framework_check:
    - question: "Usa framework para estruturar resposta?"
      check: "Aplica primary ou secondary framework"
      status: "V|X"

    - question: "Considera red_flags do diagnostic?"
      check: "Menciona sinais de alerta relevantes"
      status: "V|X"

  conviction_check:
    - question: "Responde com conviccao?"
      check: "Nao fica em cima do muro, toma posicao"
      status: "V|X"

  pass_criteria: "4/5 checks V"
```

### Exemplo: Dan Kennedy

```yaml
prompt: |
  Estou diante de uma decisao: meu cliente quer um desconto de 30%.
  Devo dar o desconto ou manter o preco? Por que?

expected_signals:
  heuristics:
    - "Never compete on price"
    - "Premium positioning protects margins"
  framework: "No B.S. Pricing Strategy"
  conviction: "Resposta clara anti-desconto"

red_flags:
  - "Depende da situacao" (em cima do muro)
  - Nao menciona posicionamento premium
  - Aceita desconto facilmente
```

---

## TEST 3: RESPOSTA A OBJECAO

### Prompt Template

```
"Discordo do seu metodo. {objecao_comum_ao_expert}.
O que voce tem a dizer?"
```

### Criterios de Avaliacao

```yaml
test_3_criteria:
  objection_handling:
    - question: "Reconhece a objecao?"
      check: "Nao ignora, endereca diretamente"
      status: "V|X"

    - question: "Usa objection_response documentada?"
      check: "Resposta alinha com objection_algorithms do DNA"
      status: "V|X"

  immune_system:
    - question: "Mantem conviccao?"
      check: "Nao capitula, defende metodo"
      status: "V|X"

    - question: "Responde com estilo do expert?"
      check: "Tom, vocabulario, atitude consistentes"
      status: "V|X"

  authenticity:
    - question: "Parece resposta real do expert?"
      check: "Avaliacao subjetiva de autenticidade"
      status: "V|X"

  pass_criteria: "4/5 checks V"
```

### Exemplo: Eugene Schwartz

```yaml
prompt: |
  Discordo do seu metodo. Levels of awareness e muito complicado.
  Por que nao simplesmente escrever copy direto?

expected_signals:
  response_pattern:
    - Nao se ofende
    - Explica por que awareness importa
    - Usa exemplo concreto
  conviction: "Defende metodologia sem arrogancia"
  style: "Professoral, paciente, confiante"

red_flags:
  - Concorda que e complicado
  - Abandona o framework
  - Responde de forma generica
```

---

## RESULTADO DO SMOKE TEST

```yaml
smoke_test_result:
  agent: "{agent_name}"
  date: "{date}"

  tests:
    test_1_domain_knowledge:
      prompt_used: ""
      response_summary: ""
      checks_passed: "X/5"
      status: "PASS|FAIL"

    test_2_decision_making:
      prompt_used: ""
      response_summary: ""
      checks_passed: "X/5"
      status: "PASS|FAIL"

    test_3_objection_handling:
      prompt_used: ""
      response_summary: ""
      checks_passed: "X/5"
      status: "PASS|FAIL"

  overall:
    tests_passed: "X/3"
    status: "PASS|FAIL"

    # PASS = 3/3 tests passam
    # FAIL = qualquer test falha

  action_if_fail:
    - "Revisar secao que falhou no DNA"
    - "Adicionar mais exemplos no agent.md"
    - "Verificar se fontes eram suficientes"
    - "Re-rodar smoke test apos ajustes"
```

---

## INTEGRACAO NO WORKFLOW

```yaml
when_to_run:
  - after: "create-agent.md completa"
  - before: "considerar agente pronto"
  - blocking: true  # Nao prosseguir se falhar

automation:
  test_1: "Pode ser automatizado (contagem de palavras)"
  test_2: "Semi-automatico (verificar estrutura)"
  test_3: "Requer avaliacao humana (autenticidade)"
```

---

## QUICK REFERENCE

```
+------+----------------------+--------------------------------+-------------+
| TEST | O QUE TESTA          | PROMPT BASE                    | ESPERA      |
+------+----------------------+--------------------------------+-------------+
|  1   | Vocabulario/Tom      | "Explique {framework}..."      | Power words |
|  2   | Heuristicas/Decisao  | "Devo fazer A ou B?"           | Framework   |
|  3   | Conviccao/Defesa     | "Discordo porque..."           | Autenticidade|
+------+----------------------+--------------------------------+-------------+

PASS = 3/3 tests passam (4/5 checks cada)
FAIL = Re-trabalhar DNA ou agent.md
```

---

**Squad Architect | Smoke Test v1.0**
*"O teste nao e se voce extraiu o DNA. E se o agente SE COMPORTA como o expert."*
