# f1-qa-foundations

> **Phase 1, Step 4** — QA gate de foundations e tokens. BLOQUEANTE para Phase 2.

## Metadata

```yaml
task:
  id: f1-qa-foundations
  phase: 1
  step: 4
  agent: ds-foundations-lead
  depends_on: f1-apply-foundations
  blocking: true
  gate: true
  next: f2-ingest-base-components (se PASS)
```

## Objetivo

Validar que todos os tokens foram aplicados corretamente em `globals.css`, que nenhum componente shadcn ficou orfao, e que dark mode e acessibilidade de contraste estao ok.

## QA Checklist

### Token Completude

- [ ] Todos os 18 core tokens shadcn presentes em `:root` (`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`)
- [ ] `--radius` presente em `:root`
- [ ] 5 chart tokens presentes (`--chart-1` through `--chart-5`)
- [ ] 8 sidebar tokens presentes
- [ ] Nenhum token shadcn original removido sem substituto

### Formato de Valores

- [ ] Todos os valores de cor em formato OKLch valido
- [ ] OKLch L entre 0 e 1
- [ ] OKLch C >= 0 (tipicamente 0 a 0.4)
- [ ] OKLch H entre 0 e 360 (quando C > 0)
- [ ] Valores alpha em formato `/ percentage` quando usado

### Dark Mode

- [ ] Todos os tokens de `:root` tem correspondente em `.dark`
- [ ] Valores dark sao visualmente distintos dos light
- [ ] Inversao logica correta (background claro → escuro, foreground escuro → claro)

### @theme inline Bridge

- [ ] Todas as `--color-*` vars mapeiam para `var(--*)` correspondente
- [ ] Extensoes (warning, info, success) tem bridge em `@theme inline`
- [ ] Radius scale mantido (`--radius-sm` through `--radius-4xl`)
- [ ] Font vars mantidas (`--font-sans`, `--font-mono`)

### Acessibilidade — Contraste WCAG AA

Verificar contraste minimo (4.5:1 para texto normal, 3:1 para texto grande):

- [ ] `--foreground` sobre `--background` >= 4.5:1
- [ ] `--primary-foreground` sobre `--primary` >= 4.5:1
- [ ] `--secondary-foreground` sobre `--secondary` >= 4.5:1
- [ ] `--muted-foreground` sobre `--muted` >= 3:1 (texto atenuado)
- [ ] `--accent-foreground` sobre `--accent` >= 4.5:1
- [ ] `--card-foreground` sobre `--card` >= 4.5:1
- [ ] `--popover-foreground` sobre `--popover` >= 4.5:1
- [ ] `--destructive` sobre `--background` >= 3:1 (feedback color)

**Repetir checks acima para dark mode.**

### Integridade Estrutural

- [ ] Imports inalterados (`@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`)
- [ ] `@custom-variant dark` inalterado
- [ ] `@layer base` block inalterado
- [ ] Arquivo CSS parseia sem erros de sintaxe

### Componentes

- [ ] Nenhum componente shadcn referencia variavel inexistente
- [ ] `npm run dev` executa sem erros (se possivel verificar)

## Verdicts

| Verdict | Condicao | Acao |
|---------|----------|------|
| **PASS** | Todos os checks criticos ok | Prosseguir para Phase 2 |
| **PASS com observacoes** | Checks criticos ok, warnings em contraste | Documentar e prosseguir |
| **FAIL** | Qualquer token ausente, valor invalido, ou estrutura quebrada | Retornar para f1-apply-foundations |

## Output

Report de QA com resultado por check e verdict final.

## Related Checklists

- `squads/design/checklists/token-mapping-checklist.md`
