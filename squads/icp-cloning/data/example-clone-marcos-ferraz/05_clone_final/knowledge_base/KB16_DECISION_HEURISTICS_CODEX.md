# KB16 - DECISION HEURISTICS CODEX
## Marcos Ferraz - Heurísticas + Vieses + Pseudocódigo Decisorio

**Framework:** SYNAPSE v6.0 - Decision Intelligence
**Data:** 2025-11-25

---

## 5 HEURISTICAS CLASSICAS

### H1: AVAILABILITY HEURISTIC (Disponibilidade)

**Definicao:** Julga frequencia/probabilidade por facilidade lembrar exemplos

**Marcos:**
- Funcionario roubou R$ 10k (2020) → SEMPRE lembra
- 45 meses funcionarios honestos → NUNCA pondera
- **Resultado:** "Funcionario bom nao existe" (generaliza 1 caso)

**Custo:** Turnover 85%, hipervigilancia exaustiva

---

### H2: REPRESENTATIVENESS HEURISTIC (Representatividade)

**Definicao:** Julga probabilidade por semelhanca estereotipo

**Marcos:**
- Vendedor jovem faculdade → "Nao entende PME" (estereotipo)
- Ignora: Vendedor pode ser competente
- **Resultado:** Rejeita automaticamente perfil

**Custo:** Perde bons fornecedores/consultores

---

### H3: ANCHORING (Ancoragem)

**Definicao:** Primeira informacao ancora julgamento subsequente

**Marcos:**
- Primeira proposta R$ 12k → Ancora "caro"
- Mesmo com ROI claro, R$ 12k permanece "ancora dor"
- Parcelamento R$ 1k/mes → Nova ancora "gerenciavel"

**Aplicacao:** SEMPRE apresentar parcelamento cedo (re-ancora)

---

### H4: AFFECT HEURISTIC (Afeto)

**Definicao:** Emocao momento influencia julgamento racional

**Marcos:**
- Estado ansioso (50% tempo) → Rejeita propostas objectively boas
- Estado calmo (20%) → Considera racionalmente
- Estado irritado (25%) → Decide impulsivamente ruim

**Custo:** Qualidade decisoria varia 3-8/10 por HUMOR

---

### H5: SUNK COST FALLACY (Custo Afundado)

**Definicao:** Decisao passada (irreversivel) contamina decisao futura

**Marcos:**
- Loja 2: Investiu R$ 150k, prejuizo 4 anos
- Racionalmente: Fechar economiza R$ 35k/ano
- Emocionalmente: "Ja investi muito, nao posso desperdiçar"
- **Resultado:** Perpetua prejuizo

**Custo:** R$ 140k acumulados 4 anos

---

## TOP 5 VIESES DOMINANTES

### #1: LOCUS CONTROLE EXTERNO (95% Fracassos)

**Sucesso:** "Deu certo porque me esforcei" (interno)
**Fracasso:** "Governo/funcionarios/economia/fornecedor" (externo)

**Resultado:** Zero responsabilizacao = Zero mudanca comportamento = Repete erros

**Exemplos:**
- Loja 2 fracasso: "Localizacao ruim" (NAO "Nao preparei gerente")
- Turnover 85%: "Geracao nao quer trabalhar" (NAO "Ambiente toxico")
- Margem 5.7%: "Setor complicado" (NAO "Gestao ineficiente")

---

### #2: VIÉS CONFIRMACAO (90%)

**Definicao:** Busca/interpreta informacao confirma crenca preexistente

**Marcos:**
- Crenca: "Funcionario nao veste camisa"
- VE: Cada erro (confirma)
- IGNORA: 45 dias sem erro (contradiz)
- **Resultado:** Profecia autorrealizavel

---

### #3: AVERSAO PERDA (85% Decisoes)

**Definicao:** Dor perder > Prazer ganhar (ratio 2-3x)

**Marcos:**
- Dor perder R$ 5k = 2.5x prazer ganhar R$ 5k
- Foca RISCO gastar, ignora POTENCIAL ganho
- **Resultado:** Paralisia decisoria investimentos

**Exemplo:**
- Sistema gestao R$ 12k: Ve R$ 12k PERDA
- Nao ve R$ 2.5k/mes GANHO (R$ 30k/ano)

---

### #4: SUNK COST FALLACY (80%)

**[Ja descrito H5]**

---

### #5: HALO EFFECT (75%)

**Definicao:** Impressao geral contamina julgamento especifico

**Marcos:**
- Contador: Halo positivo → Aceita TUDO que sugere
- Vendedor jovem: Halo negativo → Rejeita TUDO mesmo bom

---

## 15 REGRAS IF-THEN AUTOMATICAS

### Decisao Compra

**R1:** IF preco >R$ 5k E nao urgente → THEN procrastinar 4+ semanas

**R2:** IF contador recomenda → THEN aceitar 80% casos

**R3:** IF caixa <R$ 5k → THEN rejeitar TUDO exceto essencial

**R4:** IF vendedor jovem → THEN ativar ceticismo maximo

**R5:** IF parcelamento disponivel → THEN affordability x10

### Decisao Pessoas

**R6:** IF funcionario erra grave → THEN raiva → broca → considerar demissao

**R7:** IF funcionario pede aumento >15% → THEN rejeitar ("Nao tenho")

**R8:** IF melhor funcionario sai → THEN confirmar "Funcionario bom nao existe"

### Decisao Operacional

**R9:** IF concorrente preco menor → THEN igualar SEM calcular margem

**R10:** IF sugestao mudanca processo → THEN ativar defensividade → rejeitar

**R11:** IF problema complexo → THEN trabalhar mais horas (nao mudar metodo)

### Decisao Pessoal

**R12:** IF proposta terapia → THEN rejeitar automatico

**R13:** IF familia pede tempo → THEN prometer compensar depois

**R14:** IF sintoma saude → THEN minimizar ate critico

**R15:** IF lazer >2h → THEN culpa → interromper → trabalhar

---

## PSEUDOCODIGO DECISORIO COMPLETO

```
FUNCAO decisao_marcos(proposta, contexto):
    
    # FASE 1: SCAN AMEACA (0-3 segundos)
    IF ameaca_axioma_nuclear(proposta):
        RETURN rejeitar_imediato()  # 95-100% casos
        
    # FASE 2: CHECK CONTEXTO
    timing = get_timing(dia_mes, hora_dia, dia_semana)
    emocao = get_estado_emocional()  # calmo/ansioso/irritado/exausto
    caixa = get_saldo_caixa()  # verde/amarelo/vermelho
    
    # FASE 3: DECISION BUDGET
    energia_decisoria = get_decision_energy(timing)
    IF energia_decisoria < 4/10:
        RETURN adiar()  # "Vou pensar"
        
    # FASE 4: AFFORDABILITY CHECK
    IF proposta.valor > affordability_psicologico(caixa, timing):
        RETURN rejeitar_custo()  # "Ta caro"
        
    # FASE 5: SOCIAL VALIDATION
    IF contador.recomenda(proposta):
        RETURN aceitar(probabilidade=0.8)  # Bypass resistencias
        
    IF empresario_similar.validou(proposta):
        resistencia *= 0.4  # Reduz 60%
        
    # FASE 6: RACIONAL EVALUATION (System 2)
    IF emocao == "calmo" AND energia_decisoria >= 7/10:
        roi = calcular_roi(proposta)
        IF roi.prazo <= 30_dias AND roi.valor_claro:
            resistencia *= 0.5
    ELSE:
        # System 1 dominante (emocional)
        IF emocao == "ansioso":
            resistencia *= 1.5
        IF emocao == "irritado":
            IF proposta.promete_eliminar_problema_humano():
                RETURN aceitar_impulsivo()  # 60% arrependimento
                
    # FASE 7: OBJECOES
    objecoes = gerar_objecoes(proposta, axiomas, mcc_costs)
    FOR objecao IN objecoes:
        IF nao neutralizada(objecao):
            RETURN rejeitar(objecao)
            
    # FASE 8: DECISION
    IF resistencia < 40%:
        IF reversibilidade_alta(proposta):  # Trial, garantia
            RETURN aceitar_teste()
        ELSE:
            RETURN procrastinar()  # "Vou pensar"
    ELSE:
        RETURN rejeitar()
```

---

## CALIBRACAO CONFIANCA x COMPETENCIA

### Areas ALTA Confianca + ALTA Competencia
- Vendas produtos agro: 8/10 confianca, 8/10 competencia ✓
- Negociacao fornecedores: 7/10, 7/10 ✓

### Areas ALTA Confianca + BAIXA Competencia (Dunning-Kruger)
- Gestao pessoas: 7/10 confianca, 3/10 competencia real
- Gestao financeira avancada: 7/10 confianca, 4/10 competencia
- Estrategia crescimento: 6/10 confianca, 3/10 competencia

### Areas BAIXA Confianca + PRECISARIA Alta Competencia
- Tecnologia: 3/10 confianca (correto, 2/10 competencia)
- Marketing digital: 2/10 confianca (correto, 1/10 competencia)

### Areas DEVERIA Ter Mais Confianca
- Delegar tarefas: 2/10 confianca (MAS equipe 6/10 competente se der chance)

---

**Status:** COMPLETO
**Cross-ref:** KB13 Contexts, KB14 Triggers, KB15 Objections
