# Tokenização - Frontend Quality Audit 2025

**Versão:** 1.0.0
**Status:** ✅ Ativa
**Criado:** 2026-02-13

---

## 📋 Visão Geral

Skill executável para **auditoria abrangente** de projetos frontend React/Next.js com foco em:

- 🎨 **Design Tokens** (W3C DTCG - 3 camadas)
- 🎨 **Tailwind CSS** (v3/v4 - classes, conflitos, versão)
- 🧩 **shadcn/ui + Radix** (ownership, a11y, composição)
- ♿ **Acessibilidade** (WCAG 2.2 - focus, aria, keyboard)
- ⚡ **Performance** (Core Web Vitals - Server Components, bundle)
- 🛠️ **DX** (Prettier, ESLint, Husky, CI/CD)

**Output:** Relatório estruturado com recomendações priorizadas (Impacto x Esforço x Risco).

---

## 🚀 Como Usar

### Ativação Básica

```bash
# Auditar projeto atual
@architect /tokenizacao

# Ou via QA
@qa /tokenizacao
```

### Workflow Típico

1. **Ativar skill** com `@architect /tokenizacao`
2. **Discovery automática** - Detecta stack (Next.js, Tailwind v3/v4, shadcn, etc)
3. **Auditoria por categoria** - 6 categorias principais
4. **Relatório gerado** - Salvo em `docs/audits/frontend-audit-YYYY-MM-DD.md`
5. **Recomendações priorizadas** - Quick wins + roadmap

---

## 📂 Estrutura

```
tokenizacao/
├── SKILL.md                    # Skill executável principal
├── README.md                   # Este arquivo
├── assets/
│   ├── templates/
│   │   └── audit-report-template.md     # Template do relatório final
│   └── checklists/
│       ├── tailwind-audit-checklist.md  # Checklist Tailwind CSS
│       ├── tokens-audit-checklist.md    # Checklist Design Tokens
│       └── a11y-audit-checklist.md      # Checklist WCAG 2.2
└── references/
    └── tech-preset-link.md              # Link para tech-preset
```

---

## 🎯 O Que Audita

### 1. Tailwind CSS

- ✅ Versão (v3 JS config vs v4 CSS-first)
- ✅ Conflitos de classes (`p-2 p-3`)
- ✅ Overuse de arbitrary values (`[...]`)
- ✅ `@apply` usado com moderação
- ✅ Prettier plugin instalado
- ✅ Tokens semânticos vs hardcoded

### 2. Design Tokens (W3C DTCG)

- ✅ Hierarquia em 3 camadas (Primitives → Semantic → Component)
- ✅ Naming convention consistente
- ✅ Dark mode via tokens semânticos
- ✅ OKLCH colors (se Tailwind v4)
- ✅ Contraste validado (WCAG AA)

### 3. shadcn/ui + Radix

- ✅ Componentes em `/components/ui`
- ✅ `forwardRef` usado
- ✅ `data-state` presente
- ✅ `cn()` utility presente
- ✅ Integração com tema (CSS vars)

### 4. Acessibilidade (WCAG 2.2)

- ✅ `focus-visible` em interativos
- ✅ `sr-only` em botões com ícone
- ✅ Labels e aria
- ✅ Keyboard navigation
- ✅ Contraste 4.5:1 (texto normal)

### 5. Performance (Core Web Vitals)

- ✅ Server Components first
- ✅ `'use client'` apenas quando necessário
- ✅ Dynamic imports
- ✅ Next Image com `sizes`
- ✅ Suspense boundaries

### 6. Tooling & DX

- ✅ Prettier + tailwind plugin
- ✅ ESLint configurado
- ✅ Husky + lint-staged
- ✅ TypeScript strict mode
- ✅ CI/CD quality gates

---

## 📊 Formato do Relatório

O relatório gerado segue esta estrutura:

```markdown
# Auditoria Frontend - [Project Name]

1. Resumo Executivo (10 bullets)
2. Mapa do Projeto (stack detectado)
3. Estado do Tailwind e Tema
4. Diagnóstico por Categoria (6 seções)
5. Recomendações Prioritárias (tabela: impacto x esforço x risco)
6. Mudanças Recomendadas por Arquivo (snippets before/after)
7. Convenções Propostas do Projeto
8. Checklist de Qualidade para Novas Features
9. Próximos Passos (quick wins + roadmap)
```

**Localização:** `docs/audits/frontend-audit-YYYY-MM-DD.md`

---

## 🔗 Relação com Tech-Preset

Esta skill **referencia** o tech-preset `frontend-audit-2025.md`:

- **Tech-Preset:** Padrões de referência (usado em **planejamento**)
- **Skill:** Auditoria executável (usado em **execução**)

**Evita duplicação:** Skill usa preset como base de conhecimento.

```bash
# Ver tech-preset completo
cat .aios-core/data/tech-presets/frontend-audit-2025.md
```

---

## 🛠️ Checklists Incluídos

### Tailwind Audit Checklist
- Versão e configuração
- Padrões de uso (conflitos, arbitrary values, @apply)
- Organização e tooling
- Tokens semânticos vs hardcoded
- Tailwind v4 específico (CSS-first, OKLCH, container queries)

### Design Tokens Checklist
- Hierarquia 3 camadas
- W3C DTCG compliance
- Dark mode
- Contraste e acessibilidade
- OKLCH color space
- Naming conventions

### Acessibilidade Checklist
- Focus management
- Keyboard navigation
- Screen reader support (labels, ARIA)
- Contraste de cores (WCAG AA)
- Alternative text
- Forms (labels, validação, erros)
- Estados (loading, disabled)
- Motion e animações (reduced motion)

---

## 📚 Recursos

### Documentação
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [W3C Design Tokens (DTCG)](https://design-tokens.github.io/community-group/format/)
- [OKLCH Color Picker](https://oklch.com)

### Ferramentas
- [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [clsx + tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [class-variance-authority](https://cva.style/docs)
- [Radix UI](https://www.radix-ui.com)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🎓 Quando Usar

### ✅ USE quando

- Auditar projeto React/Next.js existente
- Implementar Design Tokens (3 camadas)
- Migrar Tailwind v3 → v4
- Validar WCAG 2.2 compliance
- Otimizar Core Web Vitals
- Estabelecer convenções de código

### ❌ NÃO use quando

- Criar projeto do zero (use tech-preset diretamente)
- Framework diferente de React/Next.js
- Projeto sem requisitos de a11y/performance

---

## 🔧 Opções Futuras (Roadmap)

```bash
# Modo strict (warnings = errors)
@architect /tokenizacao --strict

# Criar stories para fixes
@architect /tokenizacao --create-stories

# Apenas categoria específica
@architect /tokenizacao --category=tailwind
@architect /tokenizacao --category=tokens
@architect /tokenizacao --category=a11y
```

---

## 📝 Changelog

| Data       | Versão | Mudanças                                   |
| ---------- | ------ | ------------------------------------------ |
| 2026-02-13 | 1.0.0  | Versão inicial - Skill tokenizacao criada  |

---

## 🤝 Contribuir

Feedback e sugestões de melhorias são bem-vindos!

1. Teste a skill em seus projetos
2. Reporte issues encontrados
3. Sugira novas categorias de auditoria
4. Compartilhe casos de uso

---

_AIOS Skill - Tokenização & Frontend Quality Audit_
_CLI First | Observability Second | UI Third_
