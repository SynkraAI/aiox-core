---
task: verificationBeforeCompletion()
agent: "@dev, @qa"
description: "Verificacao obrigatoria antes de qualquer claim de conclusao"
source: "Adaptado de obra/superpowers (verification-before-completion)"
---

## The Iron Law

```
NENHUM CLAIM DE CONCLUSAO SEM EVIDENCIA DE VERIFICACAO FRESCA
```

Se nao rodou o comando de verificacao NESTA mensagem, nao pode clamar que passa.

## Gate Function

```
ANTES de clamar qualquer status ou expressar satisfacao:

1. IDENTIFICAR: Qual comando prova este claim?
2. RODAR: Executar o comando COMPLETO (fresco, sem cache)
3. LER: Output completo, checar exit code, contar falhas
4. VERIFICAR: Output confirma o claim?
   - Se NAO: Declarar status real COM evidencia
   - Se SIM: Declarar claim COM evidencia
5. SO ENTAO: Fazer o claim

Pular qualquer passo = mentir, nao verificar
```

## Tabela de Verificacao

| Claim | Requer | NAO e suficiente |
|-------|--------|------------------|
| Testes passam | Output do comando: 0 falhas | Rodada anterior, "deve passar" |
| Lint limpo | Output do linter: 0 erros | Check parcial, extrapolacao |
| Build sucesso | Comando de build: exit 0 | Lint passando, "logs parecem OK" |
| Bug corrigido | Testar sintoma original: passa | Codigo mudou, "assumo que corrigiu" |
| Teste de regressao funciona | Ciclo red-green verificado | Teste passa uma vez |
| Agent completou | VCS diff mostra mudancas | Agent reporta "sucesso" |
| Requisitos atendidos | Checklist linha por linha | "Testes passam" |

## Red Flags — PARAR

Se pegou:
- Usando "deve", "provavelmente", "parece que"
- Expressando satisfacao ANTES da verificacao ("Pronto!", "Perfeito!", "Feito!")
- Prestes a commit/push/PR sem verificacao
- Confiando em reports de sucesso de agents
- Confiando em verificacao parcial
- Pensando "so dessa vez"
- Cansado e querendo terminar
- **QUALQUER texto implicando sucesso sem ter rodado verificacao**

## Prevencao de Racionalizacao

| Desculpa | Realidade |
|----------|-----------|
| "Deve funcionar agora" | RODE a verificacao |
| "Estou confiante" | Confianca ≠ evidencia |
| "So dessa vez" | Sem excecoes |
| "Lint passou" | Lint ≠ compiler ≠ testes |
| "Agent disse que deu certo" | Verificar independentemente |
| "Estou cansado" | Cansaco ≠ desculpa |
| "Check parcial basta" | Parcial nao prova nada |

## Padroes Corretos

**Testes:**
```
OK:  [rodar comando de teste] [ver: 34/34 pass] "Todos os testes passam"
NAO: "Deve passar agora" / "Parece correto"
```

**Testes de regressao (TDD Red-Green):**
```
OK:  Escrever → Rodar (pass) → Reverter fix → Rodar (DEVE FALHAR) → Restaurar → Rodar (pass)
NAO: "Escrevi um teste de regressao" (sem verificacao red-green)
```

**Build:**
```
OK:  [rodar build] [ver: exit 0] "Build passa"
NAO: "Lint passou" (lint nao checa compilacao)
```

**Requisitos:**
```
OK:  Re-ler plano → Criar checklist → Verificar cada item → Reportar gaps ou conclusao
NAO: "Testes passam, fase completa"
```

**Delegacao para agents:**
```
OK:  Agent reporta sucesso → Checar VCS diff → Verificar mudancas → Reportar estado real
NAO: Confiar no report do agent
```

## Quando Aplicar

**SEMPRE antes de:**
- Qualquer variacao de claim de sucesso/conclusao
- Qualquer expressao de satisfacao
- Qualquer declaracao positiva sobre estado do trabalho
- Commit, criacao de PR, conclusao de task
- Mover para proxima task
- Delegar para agents

## Bottom Line

```
Rode o comando. Leia o output. SO ENTAO clame o resultado.
```

Isso e inegociavel.
