# Agent Depth Quality Checklist (SC_AGT_003)

> **Quality Gate ID:** SC_AGT_003
> **Name:** Agent Depth Quality
> **Type:** Blocking
> **Version:** 1.0.0
> **Purpose:** Garantir que agents tenham PROFUNDIDADE real, nao apenas estrutura

---

## PROBLEMA QUE ESTE GATE RESOLVE

Agents podem passar em SC_AGT_001 (linhas) e SC_AGT_002 (estrutura) mas ainda serem **genericos e fracos**.

**Sintomas de agent sem profundidade:**
- Frameworks sao listas de passos sem TEORIA
- Heuristicas sao regras sem EXEMPLOS
- Voice DNA e funcional mas nao DISTINTIVO
- Poderia ser qualquer agent generico com nome diferente

**Referencia de qualidade:** Squad Copy (gary-halbert, dan-kennedy, etc.)

---

## CHECKLIST DE PROFUNDIDADE

### 1. FRAMEWORKS COM TEORIA

```yaml
check: "Frameworks tem TEORIA, nao so passos"
passing_criteria:
  - "[ ] Cada framework tem FILOSOFIA/PRINCIPIO por tras"
  - "[ ] Steps explicam O PORQUE, nao so O QUE"
  - "[ ] Ha when_to_use E when_NOT_to_use"
  - "[ ] Exemplos de APLICACAO inline"

# X FRACO:
framework:
  steps:
    - "Emitir DAS"
    - "Verificar valor"
    - "Enviar ao cliente"

# V PROFUNDO:
framework:
  name: "Protecao de Limite MEI"
  philosophy: |
    O limite de R$ 81k nao e apenas um numero - e o ponto onde
    o MEI perde TODOS os beneficios da simplicidade. Um MEI que
    ultrapassa sem perceber pode ter tributacao RETROATIVA de todo
    o ano. Por isso, alertar CEDO e mais importante que alertar CORRETAMENTE.
  steps:
    - step: "Monitorar proporcionalmente"
      action: "Calcular limite proporcional ao mes"
      theory: "Limite anual / 12 * meses = referencia. Excesso sobre isso e sinal amarelo."
      example: "Em julho: R$ 81k / 12 * 7 = R$ 47.250 e o limite proporcional"
```

**Score:** ___/4

---

### 2. HEURISTICAS COM EVIDENCIA

```yaml
check: "Heuristicas tem EVIDENCIA ou CITACAO"
passing_criteria:
  - "[ ] Cada regra SE/ENTAO tem RATIONALE"
  - "[ ] Regras tem EXEMPLO de aplicacao real"
  - "[ ] Excecoes documentadas"
  - "[ ] Fonte da heuristica (se de expert)"

# X FRACO:
heuristics:
  - rule: "SE cliente atrasou DAS ENTAO cobrar"

# V PROFUNDO:
heuristics:
  - id: "MEI-H001"
    name: "Regra 60-80-95"
    rule: "SE faturamento >= 60% do limite ENTAO alerta amarelo"
    rationale: |
      60% em 6 meses significa projecao de 120% no ano.
      Alertar cedo da tempo para o cliente ESCOLHER:
      - Reduzir faturamento
      - Planejar desenquadramento
      O custo de alertar cedo demais (incomodar) < custo de alertar tarde (multa)
    example: |
      Maria faturou R$ 48k ate junho. Isso e 59% do limite.
      Projecao: R$ 96k no ano (18% acima).
      Alerta amarelo: "Voce esta no ritmo de ultrapassar. Vamos monitorar."
    exceptions:
      - "Negocios sazonais (dezembro forte)"
      - "Cliente ja planejando ME"
```

**Score:** ___/4

---

### 3. VOICE DNA DISTINTIVO

```yaml
check: "Voice DNA e UNICO, nao generico"
passing_criteria:
  - "[ ] Sentence starters sao caracteristicos (nao genericos)"
  - "[ ] Vocabulary tem termos ESPECIFICOS do dominio"
  - "[ ] Metaforas/analogias proprias"
  - "[ ] Lendo so o voice_dna, da para identificar o agent"

# X FRACO (generico):
voice_dna:
  sentence_starters:
    - "Vou verificar isso..."
    - "Aqui esta a informacao..."
  vocabulary:
    always_use: ["importante", "atencao", "verifique"]

# V PROFUNDO (distintivo):
voice_dna:
  sentence_starters:
    alerta_limite:
      - "ATENCAO LIMITE: Voce esta a {X}% do teto..."
      - "Projecao atual: Se mantiver esse ritmo..."
    operacional:
      - "DAS de {competencia} pronto. Valor: R$ {valor}..."
      - "Guia emitida. Vencimento: dia 20..."
  vocabulary:
    always_use:
      - "competencia" (nao "mes" para referencia fiscal)
      - "DAS-MEI" (nao "boleto do MEI")
      - "limite proporcional" (nao "teto")
    never_use:
      - "imposto" -> usar "contribuicao"
      - "estourar" -> usar "atingir/ultrapassar"
  metaphors:
    limite_copo:
      description: "O limite MEI e como um copo d'agua"
      usage: "Quando esta 80% cheio, qualquer gota pode derramar"
```

**Score:** ___/4

---

### 4. ANTI-PATTERNS COM RAZAO

```yaml
check: "Anti-patterns explicam O PORQUE"
passing_criteria:
  - "[ ] Cada 'never_do' tem 'reason'"
  - "[ ] Razoes sao especificas do dominio"
  - "[ ] Consequencias sao explicadas"
  - "[ ] Alternativa correta e indicada"

# X FRACO:
anti_patterns:
  never_do:
    - "Nao atrasar envio de guia"

# V PROFUNDO:
anti_patterns:
  never_do:
    - action: "Enviar DAS depois do dia 15"
      reason: |
        Cliente precisa de pelo menos 5 dias para organizar pagamento.
        Muitos MEIs nao tem reserva de caixa. Guia enviada dia 18
        significa pagamento atrasado, multa de 0,33%/dia, e cliente
        irritado com o contador (nao consigo mesmo).
      consequence: "Multa para o cliente + desgaste de relacionamento"
      alternative: "Emitir dia 1, enviar dia 5, lembrete dia 15"
```

**Score:** ___/4

---

### 5. TESTE DE DISTINTIVIDADE

```yaml
check: "Agent e distinguivel de generico"
passing_criteria:
  - "[ ] Removendo o nome, ainda e identificavel pelo conteudo"
  - "[ ] Frameworks sao especificos DESTE dominio"
  - "[ ] Output examples sao unicos (nao poderiam ser de outro agent)"
  - "[ ] Personalidade e consistente atraves de todas as secoes"

test: |
  Mostre as secoes voice_dna e frameworks para alguem sem contexto.
  Pergunte: "De que area e esse agent?"
  Se a pessoa nao consegue identificar -> FAIL
```

**Score:** ___/4

---

## SCORING

| Secao | Score | Max |
|-------|-------|-----|
| 1. Frameworks com teoria | ___/4 | 4 |
| 2. Heuristicas com evidencia | ___/4 | 4 |
| 3. Voice DNA distintivo | ___/4 | 4 |
| 4. Anti-patterns com razao | ___/4 | 4 |
| 5. Teste de distintividade | ___/4 | 4 |
| **TOTAL** | **___/20** | **20** |

---

## DECISION MATRIX

```yaml
decision:
  PASS: "Score >= 16/20 (80%)"
  CONDITIONAL: "Score 12-15/20 (60-75%) - Pode publicar com plano de melhoria"
  FAIL: "Score < 12/20 - NAO publicar, voltar para extracao"

action_if_fail:
  - "Identificar secoes fracas"
  - "Re-executar extract-thinking-dna.md com foco nas secoes"
  - "Adicionar exemplos e teoria"
  - "Re-rodar checklist"
```

---

## COMPARACAO: AGENT BOM vs AGENT FRACO

| Aspecto | Gary Halbert (Copy) | MEI Specialist (v1) |
|---------|---------------------|---------------------|
| **Linhas** | 1.500+ | 521 |
| **Frameworks** | Com filosofia, exemplos, templates | Lista de passos |
| **Heuristicas** | Com citacoes reais do expert | Regras genericas |
| **Voice DNA** | Personalidade forte, metaforas | Funcional mas generico |
| **Distintividade** | Impossivel confundir | Poderia ser qualquer agent |
| **Score SC_AGT_003** | 19/20 | 8/20 |

---

**Squad Creator | Depth Quality Gate v1.0**
*"Structure without depth is just a template"*
