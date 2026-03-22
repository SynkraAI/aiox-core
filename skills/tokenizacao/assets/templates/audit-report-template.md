# Auditoria Frontend - [PROJECT_NAME]

**Data:** [YYYY-MM-DD]
**Auditor:** @architect + /tokenizacao skill
**Versão da Skill:** 1.0.0

---

## 1. Resumo Executivo

[Máximo 10 bullets - highlights principais]

- ✅ [Item positivo]
- ❌ [Item crítico]
- ⚠️ [Item de atenção]

---

## 2. Mapa do Projeto

**Stack Detectado:**
- Framework: [name + version]
- React: [version]
- TypeScript: [version + strict mode?]
- Tailwind: [version + tipo de config (v3 JS / v4 CSS-first)]
- shadcn/ui: [presente/ausente]
- State Management: [Zustand/Redux/Context/None]
- Data Fetching: [SWR/TanStack Query/fetch/None]

**Estrutura:**
- Routing: [App Router / Pages Router]
- Design System: [presente/ausente]
- Tokens: [presente/ausente + camadas detectadas]
- Tooling: [Prettier/ESLint/Husky/CI]

**Configs Encontrados:**
- `tailwind.config.*`: [path]
- `components.json`: [presente/ausente]
- `.prettierrc*`: [presente/ausente]
- `tsconfig.json`: [strict: true/false]

---

## 3. Estado do Tailwind e Tema

**Versão:** [3.x.x / 4.x.x]

**Configuração:**
```[language]
[snippet do config encontrado]
```

**Tokens/Theme:**
- Primitives (Layer 1): [presente/ausente]
- Semantic (Layer 2): [presente/ausente]
- Component (Layer 3): [presente/ausente]

**Dark Mode:**
- Implementado: [sim/não]
- Método: [class / media / manual]
- Tokens semânticos: [sim/não]

---

## 4. Diagnóstico por Categoria

### 4.1 Tailwind CSS

**Estado Atual:**
[O que você encontrou - COM EVIDÊNCIAS]

**Problemas Detectados:**

| ID | Problema | Evidência | Impacto |
|----|----------|-----------|---------|
| TW-1 | [descrição] | [caminho:linha + código] | Alto/Médio/Baixo |
| TW-2 | [descrição] | [caminho:linha + código] | Alto/Médio/Baixo |

**Recomendações:**

1. **[Nome da recomendação]**
   ```[language]
   // BEFORE
   [código atual]

   // AFTER
   [código recomendado]
   ```
   **Arquivos afetados:** [lista]
   **Esforço:** [Alto/Médio/Baixo]

---

### 4.2 Design Tokens

**Estado Atual:**
[O que você encontrou]

**Problemas Detectados:**

| ID | Problema | Evidência | Impacto |
|----|----------|-----------|---------|
| DT-1 | [descrição] | [caminho:linha] | Alto/Médio/Baixo |

**Recomendações:**

[Mesmo formato de 4.1]

---

### 4.3 shadcn/ui + Radix

**Estado Atual:**
[O que você encontrou]

**Problemas Detectados:**

| ID | Problema | Evidência | Impacto |
|----|----------|-----------|---------|
| UI-1 | [descrição] | [caminho:linha] | Alto/Médio/Baixo |

**Recomendações:**

[Mesmo formato]

---

### 4.4 Acessibilidade (WCAG 2.2)

**Estado Atual:**
[O que você encontrou]

**Problemas Detectados:**

| ID | Problema | Evidência | WCAG Criterion | Impacto |
|----|----------|-----------|----------------|---------|
| A11Y-1 | [descrição] | [caminho:linha] | [1.4.1 / 2.1.1 / etc] | Alto/Médio/Baixo |

**Recomendações:**

[Mesmo formato]

---

### 4.5 Performance (Core Web Vitals)

**Estado Atual:**
[O que você encontrou]

**Problemas Detectados:**

| ID | Problema | Evidência | Metric Impacted | Impacto |
|----|----------|-----------|-----------------|---------|
| PERF-1 | [descrição] | [caminho:linha] | LCP/CLS/INP | Alto/Médio/Baixo |

**Recomendações:**

[Mesmo formato]

---

### 4.6 Tooling & DX

**Estado Atual:**
[O que você encontrou]

**Problemas Detectados:**

| ID | Problema | Evidência | Impacto |
|----|----------|-----------|---------|
| DX-1 | [descrição] | [caminho] | Alto/Médio/Baixo |

**Recomendações:**

[Mesmo formato]

---

## 5. Recomendações Prioritárias

| ID | Item | Impacto | Esforço | Risco | Arquivos Afetados |
|----|------|---------|---------|-------|-------------------|
| 1 | [recomendação] | Alto | Baixo | Baixo | [lista] |
| 2 | [recomendação] | Alto | Médio | Médio | [lista] |
| 3 | [recomendação] | Médio | Baixo | Baixo | [lista] |

**Legenda:**
- **Impacto:** Alto (melhoria significativa) | Médio | Baixo
- **Esforço:** Alto (>8h) | Médio (2-8h) | Baixo (<2h)
- **Risco:** Alto (pode quebrar funcionalidade) | Médio | Baixo (seguro)

---

## 6. Mudanças Recomendadas por Arquivo

### `[caminho/arquivo.tsx]`

**Problemas:**
- [Problema 1] (linha ~X)
- [Problema 2] (linha ~Y)

**Recomendação:**
```[language]
// BEFORE (linha ~X)
[código atual]

// AFTER (recomendado)
[código sugerido]
```

**Justificativa:** [Por que esta mudança?]

---

### `[outro/arquivo.tsx]`

[Mesmo formato]

---

## 7. Convenções Propostas do Projeto

### Tailwind
- ✅ [Convenção 1]
- ✅ [Convenção 2]
- ❌ [Anti-pattern a evitar 1]

### Design Tokens
- ✅ [Convenção 1]
- ✅ [Convenção 2]

### Acessibilidade
- ✅ [Convenção 1]
- ✅ [Convenção 2]

### Performance
- ✅ [Convenção 1]
- ✅ [Convenção 2]

---

## 8. Checklist de Qualidade para Novas Features

Use este checklist ANTES de cada commit:

### Componentes
- [ ] API consistente (variants/sizes/states)
- [ ] Tipagem TypeScript clara
- [ ] Sem duplicação de componentes existentes
- [ ] `forwardRef` se compõe com outros
- [ ] Documentação/comentários quando necessário

### Tokens
- [ ] Nenhum hardcode de cor/spacing/typo fora do sistema de tokens
- [ ] Justificativa explícita se hardcode for necessário

### Tailwind
- [ ] Classes sem conflitos
- [ ] Uso de `cn()` para composição
- [ ] `cva` para variantes type-safe quando aplicável
- [ ] Classes ordenadas (prettier-plugin-tailwindcss)

### Acessibilidade
- [ ] `focus-visible` em interativos
- [ ] Labels/aria quando necessário
- [ ] Keyboard navigation funciona
- [ ] `sr-only` em ícones sem texto
- [ ] Contraste suficiente (WCAG AA: 4.5:1 para texto)

### UX
- [ ] Loading state consistente
- [ ] Empty state tratado
- [ ] Error state tratado
- [ ] Success feedback claro
- [ ] Responsivo mobile-first

### Performance
- [ ] Evitar re-renders óbvios
- [ ] Keys estáveis em listas
- [ ] Effects com deps corretas
- [ ] Code splitting quando necessário
- [ ] Next Image com `sizes` (se aplicável)

### Evidência (Anti-Alucinação)
- [ ] Toda mudança mapeada a arquivos reais
- [ ] Referências incluem: caminho + símbolo + localização

---

## 9. Próximos Passos

### Quick Wins (< 2h)
1. [Item 1 - impacto alto, esforço baixo]
2. [Item 2]
3. [Item 3]

### Melhorias de Médio Prazo (2-8h)
1. [Item 1]
2. [Item 2]
3. [Item 3]

### Roadmap de Longo Prazo (> 8h)
1. [Item 1 - ex: Implementar Design Tokens completo]
2. [Item 2 - ex: Migrar Tailwind v3 → v4]
3. [Item 3]

---

## 10. Recursos e Referências

### Documentação
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C Design Tokens (DTCG)](https://design-tokens.github.io/community-group/format/)

### Ferramentas Recomendadas
- [Tailwind Prettier Plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [class-variance-authority](https://cva.style/docs)
- [Radix UI](https://www.radix-ui.com)

---

_Relatório gerado por: AIOS Skill `/tokenizacao` v1.0.0_
_Baseado em: Tech Preset `frontend-audit-2025`_
_Data: [YYYY-MM-DD]_
