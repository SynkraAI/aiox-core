# Tech Preset Reference

Esta skill utiliza o tech-preset `frontend-audit-2025` como base de conhecimento.

## Localização

**Arquivo:** `.aios-core/data/tech-presets/frontend-audit-2025.md`

## O Que Contém

O tech-preset inclui:

1. **Design Patterns** - Composição cn + cva, Design Tokens 3 camadas, Server Components first
2. **Project Structure** - Next.js App Router + Tailwind v4 ideal structure
3. **Tech Stack** - Versões recomendadas de React, Next.js, Tailwind, shadcn/ui, etc
4. **Coding Standards** - Naming conventions, regras críticas, anti-alucinação
5. **Testing Strategy** - Test pyramid, what to test, coverage goals
6. **Accessibility (WCAG 2.2)** - Focus management, ARIA, keyboard navigation
7. **Performance Guidelines** - Core Web Vitals, Server Components, bundle optimization

## Quando Consultar

### Durante Auditoria (Skill /tokenizacao)

Use o tech-preset para:
- Comparar padrões encontrados vs recomendados
- Validar implementação de Design Patterns
- Verificar conformidade com Coding Standards
- Gerar recomendações baseadas em best practices

### Durante Planejamento (Tech-Preset diretamente)

Use o tech-preset quando:
- Criar PRD para projeto frontend novo
- Definir arquitetura frontend
- Estabelecer convenções de time

## Como Referenciar

```bash
# Carregar tech-preset durante auditoria
@architect "Audite este projeto seguindo o preset frontend-audit-2025"

# Ou via skill diretamente
@architect /tokenizacao
```

## Evitar Duplicação

**IMPORTANTE:** Esta skill NÃO duplica conteúdo do tech-preset.

- **Skill (`/tokenizacao`):** Processo executável de auditoria + checklists + templates
- **Tech-Preset:** Padrões de referência + best practices + exemplos de código

A skill REFERENCIA o preset durante execução, não repete o conteúdo.

---

_Para ver o conteúdo completo do tech-preset:_
```bash
cat .aios-core/data/tech-presets/frontend-audit-2025.md
```
