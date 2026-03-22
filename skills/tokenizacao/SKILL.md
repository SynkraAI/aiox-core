---
name: tokenizacao
description: Skill de auditoria e tokenização frontend para projetos React/Next.js. Executa análise abrangente de Tailwind CSS (v3/v4), Design Tokens (W3C DTCG), shadcn/ui, Performance (Core Web Vitals), Acessibilidade (WCAG 2.2) e DX. Gera relatório estruturado com recomendações priorizadas. Use quando precisar auditar qualidade de código frontend ou implementar sistema de design tokens.
license: MIT
---

# Tokenização - Frontend Quality Audit 2025

Skill executável para auditoria abrangente de projetos frontend modernos com foco em Design Tokens, Tailwind CSS, shadcn/ui, Performance e Acessibilidade.

## Quando Usar Esta Skill

Esta skill deve ser usada quando:

- ✅ Auditar projeto React/Next.js existente
- ✅ Implementar sistema de Design Tokens (W3C DTCG)
- ✅ Migrar de Tailwind v3 para v4
- ✅ Validar qualidade de código frontend
- ✅ Garantir conformidade WCAG 2.2
- ✅ Otimizar Core Web Vitals
- ✅ Estabelecer convenções de código para time

**NÃO use para:**
- ❌ Criar projeto do zero (use tech-preset `frontend-audit-2025`)
- ❌ Frameworks que não sejam React/Next.js
- ❌ Projetos sem requisitos de acessibilidade/performance

---

## PREMISSA FUNDAMENTAL (CRÍTICO)

**Você JÁ TEM ACESSO AO CÓDIGO (repositório inteiro).**

- ✅ **NUNCA peça** para o usuário colar arquivos/trechos
- ✅ **SEMPRE explore** o repo (estrutura, configs, implementação)
- ✅ **SE não tiver acesso**, diga explicitamente em 1 frase e PARE

**Se você realmente não conseguir acessar o repositório:**
> "Não tenho acesso ao código neste ambiente. Preciso de: [listar o que precisa]."

Depois PARE. **Não invente nada.**

---

## REGRAS ANTI-ALUCINAÇÃO (OBRIGATÓRIO)

### Princípios de Evidência

Toda afirmação sobre o código DEVE incluir:

```
📍 Caminho: path/to/file.tsx
📍 Símbolo: ComponentName | functionName | configKey
📍 Localização: "linha ~42" | "perto do topo" | "na exportação"
```

### 4 Regras Inegociáveis

1. **Trabalhe SOMENTE com o que está no repositório**
   - Nunca invente arquivos, rotas, APIs, dependências ou versões
   - Se não existe, diga: "Não encontrado. Seria necessário criar X em Y"

2. **Quando há incerteza**
   - Apresente opções com evidências de cada
   - Explique a recomendação baseada no que foi encontrado
   - Documente conflitos (ex: v3 e v4 coexistindo)

3. **Ao sugerir criar algo novo**
   - Por que é necessário?
   - Como você verificou duplicação/ausência?
   - Qual o impacto e risco?

4. **Formato de Referência Obrigatório**
   ```markdown
   ❌ BAD: "O componente Button usa classes conflitantes"

   ✅ GOOD:
   Problema: Classes Tailwind conflitantes no Button
   Evidência:
     - Caminho: components/ui/button.tsx
     - Símbolo: Button (linha ~15)
     - Código: className="p-2 px-4 p-4" (conflito: p-2 e p-4)
   Impacto: Último valor vence (p-4), comportamento inconsistente
   Solução: Usar cn() com twMerge para resolver conflitos
   ```

---

## Processo de Execução

### Fase 1: Discovery Automática

Execute em paralelo (use múltiplas tool calls):

```bash
# 1. Identificar stack
cat package.json | grep -E "(next|react|tailwind|typescript)"

# 2. Detectar Tailwind version
cat tailwind.config.* 2>/dev/null || echo "Config not found"
grep "@import \"tailwindcss\"" styles/*.css 2>/dev/null || echo "Not v4"

# 3. Verificar shadcn/ui
cat components.json 2>/dev/null || echo "shadcn not found"
ls components/ui/ 2>/dev/null || echo "No ui components"

# 4. Verificar Next.js structure
ls app/ 2>/dev/null && echo "App Router" || echo "Pages Router"

# 5. Verificar tooling
ls .prettierrc* 2>/dev/null || echo "Prettier not found"
ls .eslintrc* 2>/dev/null || echo "ESLint not found"
grep "prettier-plugin-tailwindcss" package.json || echo "Tailwind plugin not found"
```

**Output esperado:**
```yaml
stack:
  framework: Next.js 14.2.0 (App Router)
  react: 19.0.0
  typescript: 5.3.0
  tailwind: 3.4.0 (detected via tailwind.config.ts)
  shadcn: true (components.json found)

tooling:
  prettier: true
  tailwind_plugin: false ❌
  eslint: true
  husky: false ❌
```

---

### Fase 2: Auditoria por Categoria

Para cada categoria, siga o formato:

```markdown
## Categoria X: Nome

### Estado Atual
[O que você encontrou - COM EVIDÊNCIAS]

### Problemas Detectados
[Lista de issues - COM CAMINHO + SÍMBOLO + CÓDIGO]

### Recomendações
[O que fazer - COM EXEMPLO DE CÓDIGO]
```

#### A) Tailwind CSS

**Checklist:**
- [ ] Versão detectada (v3 vs v4)
- [ ] Conflitos de classes (ex: `p-2 p-3`)
- [ ] Overuse de arbitrary values (`[...]`)
- [ ] Classes ordenadas (prettier-plugin-tailwindcss)
- [ ] `@apply` usado com moderação (apenas componentes DS, 3+ ocorrências)
- [ ] Tokens semânticos vs hardcoded values

**Se v4 detectado:**
- [ ] CSS-first config (`@import "tailwindcss"` + `@theme`)
- [ ] Renomes críticos (`outline-none` → `outline-hidden`)
- [ ] Container queries usadas (se aplicável)
- [ ] OKLCH colors (se aplicável)

**Ferramenta de busca:**
```bash
# Encontrar conflitos de classes comuns
grep -r "className.*p-[0-9].*p-[0-9]" --include="*.tsx" --include="*.jsx"

# Encontrar arbitrary values
grep -r "\[.*\]" --include="*.tsx" --include="*.jsx" | grep className

# Verificar @apply overuse
grep -r "@apply" --include="*.css"
```

---

#### B) Design Tokens (W3C DTCG)

**Checklist:**
- [ ] Sistema de tokens existe?
- [ ] Hierarquia em 3 camadas:
  - [ ] Layer 1: Primitives (raw values: `blue-500`, `spacing-4`)
  - [ ] Layer 2: Semantic (meaning: `text-primary`, `spacing-input`)
  - [ ] Layer 3: Component (context: `button-primary-bg-default`)
- [ ] Dark mode suportado via tokens semânticos
- [ ] Contrastes validados (mínimo 3:1 em estados interativos)
- [ ] W3C DTCG compliance (se usando tokens.json)

**Exemplo de estrutura ideal:**
```css
/* tokens/primitives.css (Layer 1) */
@theme {
  --color-blue-500: oklch(0.55 0.22 250);
  --spacing-4: 1rem;
}

/* tokens/semantic.css (Layer 2) */
@theme {
  --color-text-primary: var(--color-blue-900);
  --spacing-input-padding: var(--spacing-4);
}

/* tokens/component.css (Layer 3) */
@theme {
  --button-primary-bg-default: var(--color-blue-500);
  --button-primary-bg-hover: var(--color-blue-900);
}
```

**Ferramenta de busca:**
```bash
# Encontrar hardcoded colors
grep -r "bg-blue-[0-9]" --include="*.tsx" --include="*.jsx"
grep -r "text-gray-[0-9]" --include="*.tsx" --include="*.jsx"

# Verificar tokens CSS
find . -name "*.css" -exec grep -l "@theme\|--color-\|--spacing-" {} \;
```

---

#### C) shadcn/ui + Radix UI

**Checklist:**
- [ ] Componentes em `/components/ui`
- [ ] `forwardRef` usado consistentemente
- [ ] `data-state` presente (Radix primitives)
- [ ] Integração com tema (CSS vars)
- [ ] `cn()` utility presente e usada
- [ ] Acessibilidade (focus, aria, keyboard)

**Ferramenta de busca:**
```bash
# Verificar forwardRef usage
grep -r "React.forwardRef" components/ui/

# Verificar cn() usage
grep -r "cn(" components/ui/

# Verificar data-state
grep -r "data-state" components/ui/
```

---

#### D) Acessibilidade (WCAG 2.2)

**Checklist:**
- [ ] `focus-visible` em todos interativos (NUNCA `outline-none` sem substituição)
- [ ] `sr-only` em botões com ícone
- [ ] Labels e aria quando necessário
- [ ] Keyboard navigation em dialogs/menus
- [ ] Estados disabled/loading acessíveis

**Ferramenta de busca:**
```bash
# Encontrar outline-none sem foco alternativo
grep -r "outline-none" --include="*.tsx" --include="*.jsx" | \
  grep -v "focus-visible"

# Encontrar botões com ícone sem label
grep -r "<button.*<.*Icon" --include="*.tsx" --include="*.jsx" | \
  grep -v "sr-only\|aria-label"
```

---

#### E) Performance (Core Web Vitals)

**Checklist:**
- [ ] Server Components usados quando possível (App Router)
- [ ] `'use client'` apenas quando necessário
- [ ] Dynamic imports para non-critical
- [ ] Next Image com `sizes` apropriados
- [ ] Suspense boundaries para loading states
- [ ] Memoization usado com cuidado (apenas quando profiling mostrar necessidade)

**Ferramenta de busca:**
```bash
# Encontrar 'use client' desnecessários (sem hooks/eventos)
grep -l "use client" --include="*.tsx" --include="*.jsx" | \
  xargs grep -L "useState\|useEffect\|onClick"

# Verificar Next Image usage
grep -r "<Image" --include="*.tsx" --include="*.jsx" | \
  grep -v "sizes="
```

---

#### F) Tooling & DX

**Checklist:**
- [ ] Prettier instalado
- [ ] `prettier-plugin-tailwindcss` instalado e configurado
- [ ] ESLint configurado
- [ ] Husky + lint-staged (pre-commit hooks)
- [ ] TypeScript strict mode
- [ ] CI/CD com quality gates

**Instalação recomendada:**
```bash
npm install -D prettier prettier-plugin-tailwindcss
npm install -D @ianvs/prettier-plugin-sort-imports  # opcional
npm install -D husky lint-staged
```

---

### Fase 3: Geração de Relatório

**Formato de Output Obrigatório:**

```markdown
# Auditoria Frontend - [Project Name]

**Data:** YYYY-MM-DD
**Auditor:** @architect + /tokenizacao skill
**Versão da Skill:** 1.0.0

---

## 1. Resumo Executivo

[Máximo 10 bullets - highlights principais]

- ✅ Item positivo 1
- ❌ Item crítico 1
- ⚠️ Item de atenção 1

---

## 2. Mapa do Projeto

**Stack Detectado:**
- Framework: [name + version]
- React: [version]
- Tailwind: [version + tipo de config]
- shadcn/ui: [presente/ausente]

**Estrutura:**
- App Router: [sim/não]
- Design System: [presente/ausente]
- Tokens: [presente/ausente + camadas]

---

## 3. Estado do Tailwind e Tema

[Detalhes sobre configuração, versão, tokens, dark mode]

---

## 4. Diagnóstico por Categoria

### 4.1 Tailwind CSS

**Estado Atual:**
[O que você encontrou]

**Problemas Detectados:**
| ID | Problema | Evidência | Impacto |
|----|----------|-----------|---------|
| TW-1 | [descrição] | [caminho:linha] | Alto/Médio/Baixo |

**Recomendações:**
[Lista numerada com snippets]

### 4.2 Design Tokens

[Mesmo formato]

### 4.3 shadcn/ui + Radix

[Mesmo formato]

### 4.4 Acessibilidade (WCAG 2.2)

[Mesmo formato]

### 4.5 Performance (Core Web Vitals)

[Mesmo formato]

### 4.6 Tooling & DX

[Mesmo formato]

---

## 5. Recomendações Prioritárias

| ID | Item | Impacto | Esforço | Risco | Arquivos Afetados |
|----|------|---------|---------|-------|-------------------|
| 1 | Instalar prettier-plugin-tailwindcss | Alto | Baixo | Baixo | package.json, .prettierrc |
| 2 | Implementar Design Tokens (3 camadas) | Alto | Alto | Médio | styles/tokens/*, components/** |

**Legenda:**
- Impacto: Alto (melhoria significativa) | Médio | Baixo
- Esforço: Alto (>8h) | Médio (2-8h) | Baixo (<2h)
- Risco: Alto (pode quebrar) | Médio | Baixo (seguro)

---

## 6. Mudanças Recomendadas por Arquivo

### `components/ui/button.tsx`

**Problemas:**
- Conflitos de classes: `p-2 px-4 p-4` (linha ~15)
- Sem `forwardRef` (não compõe com Radix)
- Hardcoded `bg-blue-500` (deveria usar token)

**Recomendação:**
```typescript
// BEFORE
export function Button({ children, ...props }) {
  return <button className="p-2 px-4 p-4 bg-blue-500" {...props}>{children}</button>
}

// AFTER
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      size: {
        default: 'px-4 py-2',
      },
    },
  }
)

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

---

## 7. Convenções Propostas do Projeto

**Tailwind:**
- ✅ Sempre usar `cn()` para composição de classes
- ✅ Preferir tokens semânticos (`bg-primary`) sobre hardcoded (`bg-blue-500`)
- ✅ Usar `cva` para variantes type-safe
- ❌ Evitar `@apply` exceto em componentes do DS (3+ ocorrências)

**Design Tokens:**
- ✅ 3 camadas obrigatórias (Primitives → Semantic → Component)
- ✅ Naming convention: `--{category}-{concept}-{variant}-{state}`
- ✅ Dark mode via tokens semânticos

**Acessibilidade:**
- ✅ `focus-visible:outline-hidden` + ring em todos interativos
- ✅ `sr-only` em botões com ícone
- ✅ Keyboard navigation em componentes complexos

**Performance:**
- ✅ Server Components first (App Router)
- ✅ `'use client'` apenas quando necessário
- ✅ Dynamic imports para non-critical

---

## 8. Checklist de Qualidade para Novas Features

Use este checklist ANTES de cada commit:

### Componentes
- [ ] API consistente (variants/sizes/states)
- [ ] Tipagem TypeScript clara
- [ ] Sem duplicação de componentes existentes
- [ ] `forwardRef` se compõe com outros

### Tokens
- [ ] Nenhum hardcode de cor/spacing/typo fora do sistema de tokens
- [ ] Justificativa explícita se hardcode for necessário

### Tailwind
- [ ] Classes sem conflitos
- [ ] Uso de `cn()` para composição
- [ ] `cva` para variantes type-safe quando aplicável

### Acessibilidade
- [ ] `focus-visible` em interativos
- [ ] Labels/aria quando necessário
- [ ] Keyboard navigation funciona
- [ ] `sr-only` em ícones sem texto

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

### Evidência
- [ ] Toda mudança mapeada a arquivos reais
- [ ] Referências incluem: caminho + símbolo + localização

---

## 9. Próximos Passos

**Quick Wins (< 2h):**
1. [Item 1]
2. [Item 2]

**Melhorias de Médio Prazo (2-8h):**
1. [Item 1]
2. [Item 2]

**Roadmap de Longo Prazo (> 8h):**
1. [Item 1]
2. [Item 2]

---

_Relatório gerado por: AIOS Skill `/tokenizacao` v1.0.0_
_Baseado em: Tech Preset `frontend-audit-2025`_
_Data: YYYY-MM-DD_
```

---

### Fase 4: Salvamento do Relatório

```bash
# Criar diretório de auditorias se não existir
mkdir -p docs/audits

# Salvar relatório com timestamp
# Nome: frontend-audit-YYYY-MM-DD.md
```

**Notificar o usuário:**
```
✅ Auditoria completa!

📊 Relatório salvo em: docs/audits/frontend-audit-2026-02-13.md

📈 Resumo:
- Problemas críticos: X
- Melhorias recomendadas: Y
- Quick wins: Z

Próximos passos sugeridos:
1. [Quick win prioritário]
2. [Melhoria de impacto alto]
```

---

## Comandos de Ativação

### Básico
```bash
@architect /tokenizacao
@qa /tokenizacao
```

### Com Opções (Futuro)
```bash
# Modo strict (warnings = errors)
@architect /tokenizacao --strict

# Criar stories para fixes prioritários
@architect /tokenizacao --create-stories

# Apenas categoria específica
@architect /tokenizacao --category=tailwind
@architect /tokenizacao --category=tokens
@architect /tokenizacao --category=a11y
```

---

## Referências

### Tech Preset
- **Arquivo:** `.aios-core/data/tech-presets/frontend-audit-2025.md`
- **Uso:** Consultar padrões de referência (Design Patterns, Coding Standards, etc)

### Checklists
- `assets/checklists/tailwind-audit-checklist.md` - Checklist específico Tailwind
- `assets/checklists/tokens-audit-checklist.md` - Checklist Design Tokens
- `assets/checklists/a11y-audit-checklist.md` - Checklist WCAG 2.2

### Templates
- `assets/templates/audit-report-template.md` - Template do relatório final

---

## Troubleshooting

### "Não consigo acessar o repositório"
- Verifique se você está dentro do projeto
- Confirme que tem permissões de leitura
- Se Claude Code não tem acesso, solicite explicitamente

### "Muitos arquivos para analisar"
- Foque em hotspots: `components/ui/`, `app/`, `styles/`
- Use sampling: analise 3-5 componentes representativos
- Priorize arquivos modificados recentemente (`git log --since="1 month ago"`)

### "Conflito entre v3 e v4"
- Detecte qual versão está ATIVA (package.json + config file)
- Documente coexistência se houver
- Recomende migração incremental se necessário

---

## Changelog

| Data       | Versão | Mudanças                          |
| ---------- | ------ | --------------------------------- |
| 2026-02-13 | 1.0.0  | Versão inicial da skill           |

---

_AIOS Skill - Tokenização & Frontend Quality Audit_
_CLI First | Observability Second | UI Third_
