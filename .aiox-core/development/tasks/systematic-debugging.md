---
task: systematicDebugging()
agent: "@dev"
description: "Debugging sistematico em 4 fases — root cause ANTES de fix"
source: "Adaptado de obra/superpowers (systematic-debugging)"
---

## The Iron Law

```
NENHUM FIX SEM INVESTIGACAO DE ROOT CAUSE PRIMEIRO
```

Se nao completou a Fase 1, NAO pode propor fixes.

## Quando Usar

Qualquer problema tecnico:
- Test failures, bugs, comportamento inesperado
- Problemas de performance, build failures
- Problemas de integracao

**Usar ESPECIALMENTE quando:**
- Sob pressao de tempo (emergencias tornam o "chute" tentador)
- "So um fix rapido" parece obvio
- Ja tentou multiplos fixes sem sucesso
- Nao entende completamente o problema

## As 4 Fases

Completar CADA fase antes de avancar.

### Fase 1: Investigacao de Root Cause

**ANTES de tentar QUALQUER fix:**

1. **Ler mensagens de erro com atencao**
   - Nao pular erros ou warnings
   - Ler stack traces completamente
   - Anotar line numbers, file paths, error codes

2. **Reproduzir consistentemente**
   - Consegue triggerar de forma confiavel?
   - Quais os passos exatos?
   - Acontece toda vez?
   - Se nao reproduzivel → coletar mais dados, NAO chutar

3. **Checar mudancas recentes**
   - O que mudou que pode ter causado isso?
   - `git diff`, commits recentes
   - Novas dependencias, mudancas de config
   - Diferencas de ambiente

4. **Coletar evidencias em sistemas multi-componente**
   ```
   Para CADA fronteira de componente:
     - Logar dados que entram
     - Logar dados que saem
     - Verificar propagacao de env/config
     - Checar estado em cada camada

   Rodar UMA VEZ para coletar evidencias
   DEPOIS analisar para identificar componente que falha
   DEPOIS investigar esse componente especifico
   ```

5. **Rastrear fluxo de dados (backward tracing)**
   - Onde o valor errado se origina?
   - O que chamou isso com o valor errado?
   - Continuar rastreando ate encontrar a fonte
   - Corrigir na FONTE, nao no sintoma

### Fase 2: Analise de Padroes

1. **Encontrar exemplos funcionais**
   - Codigo similar que funciona no mesmo codebase
   - O que funciona que e parecido com o que esta quebrado?

2. **Comparar com referencias**
   - Ler implementacao de referencia COMPLETAMENTE
   - Nao skimming — ler cada linha

3. **Identificar diferencas**
   - O que e diferente entre funcionando e quebrado?
   - Listar TODA diferenca, por menor que seja

4. **Entender dependencias**
   - Que outros componentes sao necessarios?
   - Que settings, config, ambiente?

### Fase 3: Hipotese e Teste

1. **Formar UMA hipotese**
   - Declarar: "Acho que X e a root cause porque Y"
   - Ser especifico, nao vago

2. **Testar minimamente**
   - Menor mudanca possivel para testar hipotese
   - UMA variavel por vez
   - NAO corrigir multiplas coisas de uma vez

3. **Verificar antes de continuar**
   - Funcionou? Sim → Fase 4
   - Nao funcionou? Formar NOVA hipotese
   - NAO empilhar mais fixes

4. **Quando nao sabe**
   - Dizer "Nao entendo X"
   - NAO fingir que sabe

### Fase 4: Implementacao

1. **Criar test case que falha**
   - Reproducao mais simples possivel
   - Teste automatizado se possivel
   - DEVE existir antes de fixar

2. **Implementar UM fix**
   - Endereca a root cause identificada
   - UMA mudanca por vez
   - Sem melhorias "ja que estou aqui"
   - Sem refactoring junto

3. **Verificar fix**
   - Teste passa agora?
   - Nenhum outro teste quebrou?
   - Problema realmente resolvido?

4. **Se fix nao funcionar**
   - PARAR
   - Contar: quantos fixes ja tentou?
   - Se < 3: Voltar a Fase 1, re-analisar
   - **Se >= 3: PARAR e questionar a arquitetura**
   - NAO tentar Fix #4 sem discussao arquitetural

5. **Se 3+ fixes falharam: Questionar arquitetura**
   - Cada fix revela novo estado compartilhado/acoplamento?
   - Fixes requerem "refactoring massivo"?
   - Cada fix cria novos sintomas em outro lugar?
   - → Isso NAO e hipotese falha — e arquitetura errada
   - → Discutir com usuario antes de mais tentativas

## Red Flags — PARAR e Seguir o Processo

Se pegou pensando:
- "Fix rapido por agora, investigo depois"
- "Vou so mudar X e ver se funciona"
- "Adicionar varias mudancas e rodar testes"
- "Pular o teste, verifico manualmente"
- "Provavelmente e X, deixa eu corrigir"
- "Nao entendo completamente mas pode funcionar"
- "Mais uma tentativa de fix" (quando ja tentou 2+)

**TODOS significam: PARAR. Voltar a Fase 1.**

## Racionalizacoes Comuns

| Desculpa | Realidade |
|----------|-----------|
| "Problema e simples" | Problemas simples tem root causes tambem |
| "Emergencia, sem tempo" | Debugging sistematico e MAIS RAPIDO que chute |
| "Deixa tentar primeiro" | Primeiro fix define o padrao. Faca certo |
| "Escrevo teste depois" | Fixes sem teste nao se sustentam |
| "Varios fixes de uma vez economiza tempo" | Impossivel isolar o que funcionou |
| "Vejo o problema, deixa corrigir" | Ver sintomas ≠ entender root cause |

## Quick Reference

| Fase | Atividades | Criterio de Sucesso |
|------|-----------|---------------------|
| **1. Root Cause** | Ler erros, reproduzir, checar mudancas, coletar evidencias | Entender O QUE e POR QUE |
| **2. Padrao** | Encontrar exemplos funcionais, comparar | Identificar diferencas |
| **3. Hipotese** | Formar teoria, testar minimamente | Confirmada ou nova hipotese |
| **4. Implementacao** | Criar teste, fixar, verificar | Bug resolvido, testes passam |

## Tecnicas de Suporte

- **Backward Tracing** — Rastrear bugs de volta pela call stack ate a fonte original
- **Defense in Depth** — Adicionar validacao em multiplas camadas apos encontrar root cause
- **Condition-Based Waiting** — Substituir timeouts arbitrarios por polling de condicoes

## Impacto

- Approach sistematico: 15-30 min para fix
- Fixes aleatorios: 2-3 horas de thrashing
- Taxa de fix na primeira tentativa: 95% vs 40%
- Novos bugs introduzidos: quase zero vs frequente
