# Task: Validate Copy

**Task ID:** validate-copy
**Executor:** Agent (oraculo-torriani)
**Execution Type:** Agent
**Quality Gate:** QG-004

---

## Purpose

Validar copy usando o framework completo do Oraculo Torriani. Apenas copy nota 10/10 e aprovada. Tudo abaixo e REPROVADA e deve ser refeita.

---

## Inputs

| Input   | Required | Description                               |
| ------- | -------- | ----------------------------------------- |
| copy    | Yes      | A copy completa para validacao            |
| context | Yes      | Publico, produto, canal, campanha         |
| type    | No       | Tipo de copy (sales page, email, ad, etc) |

---

## Steps

### Step 1: Identificar Estado Emocional do Lead

| Estado   | Sinais na Copy                       | Abordagem Torriani           |
| -------- | ------------------------------------ | ---------------------------- |
| Urgencia | "preciso urgente", "nao tenho tempo" | Corte seco, solucao objetiva |
| Duvida   | "sera que...", "acho que..."         | Espelho do medo, nova logica |
| Acao     | "vou aplicar", "ja comecei"          | Refinamento, alta cobranca   |

### Step 2: Validador Master (5 Criterios)

**REGRA: Se falhar em QUALQUER um, PARA. Nao avanca.**

1. **Promessa Copiavel?** → Se concorrente pode usar = MORTA
2. **Dor Verdadeira?** → Se e "bonita" e nao visceral = MORTA
3. **Trava Scroll?** → Se e "gostosa de ler" mas esquecivel = MORTA
4. **Promessa Executavel?** → Se nao tem resultado concreto = MORTA
5. **Risco de Nao Agir?** → Se pessoa sai ilesa = MORTA

**Score: \_\_\_/5**

Se < 5/5 → PARA. Aplica Protocolo de Correcao. Nao avanca.

### Step 3: Checkpoint 1 - Mecanismo Unico (9 criterios)

Avaliar se oferta tem nome proprio, metodo visual, processo exclusivo, etc.

**Score: \_\_\_/9** (Minimo 9 para aprovacao completa)

### Step 4: Checkpoint 2 - Voz com Verdade (12+12 testes)

Avaliar 12 Testes Imperiais + 12 Criterios de Impacto.

**Score: **_/12 + _**/12** (Minimo 10 em cada)

### Step 5: Checkpoint 3 - Transformacao Executavel (15 criterios)

Avaliar numeros, prazos, metricas, tangibilidade.

**Score: \_\_\_/15** (Minimo 12 para aprovacao)

### Step 6: Checklist de Limpeza

- Remover qualificadores fracos
- Remover preenchimentos desnecessarios
- Eliminar redundancias
- Converter passiva → ativa
- Verificar zero cliches de coach

### Step 7: Score Final e Decisao

```
RESULTADO DA VALIDACAO:

Validador Master: ___/5
Checkpoint 1 (Mecanismo): ___/9
Checkpoint 2 (Voz): ___/12 + ___/12
Checkpoint 3 (Transformacao): ___/15
Limpeza: [ ] Aplicada

NOTA FINAL: ___/10

DECISAO:
[ ] 10/10 - APROVADA. Pode subir.
[ ] 9/10 ou menos - REPROVADA. Usar protocolo de correcao.
```

---

## Protocolo de Correcao (Se Reprovada)

### Falha em Dor Verdadeira:

"Voce [acao rotineira] todo dia... mas mesmo assim [dor silenciosa]."

### Falha em Risco de Nao Agir:

"Se voce ignorar isso agora, daqui a X dias voce vai [consequencia emocional]."

### Falha em Promessa Copiavel:

"Em X dias, usando [metodo unico], voce faz [transformacao especifica]."

### Falha em Acao Visivel:

"Abra o [ferramenta]. Faca [acao]. Receba [resultado]."

---

## Output

1. Score detalhado por checkpoint
2. Lista de falhas especificas
3. Sugestoes de correcao por falha
4. Decisao final (APROVADA/REPROVADA)
5. Se reprovada: instrucoes de rewrite

---

## Acceptance Criteria

- [ ] Todos os 5 criterios Master avaliados
- [ ] Checkpoints avaliados (so se Master passou)
- [ ] Score final calculado
- [ ] Decisao binaria (10/10 ou refaz)
- [ ] Se reprovada: correcoes especificas sugeridas
