# Memory Audit Skill

Auditoria completa do Memory System v2.0: estrutura, agentes, rules, hooks, tools.

## Uso

```bash
/memory-audit              # Auditoria completa
/memory-audit --fix        # Auditoria + bootstrap de projetos sem memory
```

---

## O Que Faz

Responde **18 perguntas** do checklist Memory System v2.0 em **6 categorias**:

1. **Estrutura** — project-context.md existe? preenchido? feedback real? user profile?
2. **Agentes Read** — todos os 11 agentes têm Read Protocol?
3. **Agentes Write** — todos os 11 agentes têm Write Protocol?
4. **Checkpoints** — regras de pause-and-listen definidas?
5. **Auto-Load** — hook SessionStart funciona? /checkpoint atualiza memory?
6. **Manutenção** — tools existem? /new-project cria memory?

Cada projeto recebe score individual (0-3): context existe + preenchido + feedback real.

---

## Execução

### Passo 1: Rodar health check

```bash
node tools/memory-health-check.js
```

Mostrar output completo ao usuário. Se `--json` for passado, adicionar flag.

### Passo 2: Analisar resultados

Se HEALTH SCORE < 100%:
- Listar checks que falharam (FAIL)
- Para cada FAIL, sugerir ação corretiva

Se projetos têm template vazio (context não preenchido):
- Não é erro — é falta de uso
- Sugerir: "Projetos com template vazio serão preenchidos conforme você trabalha neles"

### Passo 3: Auto-fix (se --fix)

Se o usuário passou `--fix`:

1. **Projetos sem memory/**: rodar `node tools/bootstrap-project-memory.js`
2. **Feedback antigo**: rodar `node tools/cleanup-old-feedback.js --dry-run` e mostrar resultado
3. **Agentes sem protocol**: listar quais agentes estão faltando e corrigir

### Passo 4: Salvar relatório

Salvar output em `docs/reports/memory-audit-YYYY-MM-DD.md`.

### Passo 5: Resumo

Mostrar ao usuário:

```
Memory Audit — {data}
Health Score: {score}%
Automated: {X}/{Y} PASS
Manual: {N} checks (validação com agentes reais)
Relatório: docs/reports/memory-audit-{data}.md
```

---

## Quando Usar

- Antes de começar um sprint (health check)
- Depois de criar vários projetos novos
- Periodicamente (1x por semana) para manter qualidade
- Após updates do framework

---

## Referências

- Plano completo: `docs/plans/memory-system-v2.md`
- Rule global: `.claude/rules/memory-protocol.md`
- Análise original: `docs/analysis/memory-system-deep-dive-2026-03-18.md`
- Tools: `tools/memory-health-check.js`, `tools/audit-project-memory.js`, `tools/bootstrap-project-memory.js`, `tools/cleanup-old-feedback.js`
