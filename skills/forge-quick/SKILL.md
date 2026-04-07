---
name: forge-quick
description: |
  Fast-track do Forge. Descreve, constrói, checa e entrega — sem cerimônia.
  Wrapper direto para `/forge quick`. Use quando quiser implementar algo rápido
  num projeto existente sem passar por discovery, stories ou QA formal.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
argument-hint: "descrição do que implementar"
version: 1.0.0
category: orchestration
tags: [pipeline, development, automation, forge, quick]
---

# Forge Quick — Atalho direto

> Este skill é um entry point direto para o modo quick do Forge.

## Execução

1. Capture a descrição do argumento do usuário (tudo após `/forge-quick`)
2. Delegue para o Forge com modo QUICK:
   - Read `~/aios-core/skills/forge/SKILL.md` (sections 0 and 1 only — path resolution + personality)
   - Read `~/aios-core/skills/forge/workflows/quick.md` (the complete workflow)
   - Read `~/aios-core/skills/forge/config.yaml` (defaults)
   - Read `~/aios-core/skills/forge/runner.md` (execution engine)
3. Execute o workflow quick.md exatamente como documentado

**Importante:** Este skill NÃO reimplementa nada. Ele apenas roteia para o Forge com `mode = QUICK` já classificado, pulando a etapa de intent classification.

## Exemplo

```
/forge-quick "add dark mode toggle"
```

É equivalente a:

```
/forge quick "add dark mode toggle"
```
