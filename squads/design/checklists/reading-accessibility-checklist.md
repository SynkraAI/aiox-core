# Reading Accessibility Checklist

> Use este checklist para validar experiências de leitura digital.
> Referência: `squads/super-agentes/data/high-retention-reading-guide.md`

---

## 1. Tipografia — CRÍTICO

### Tamanho de Fonte
- [ ] Body text ≥ 16px (WCAG mínimo)
- [ ] Ideal para leitura: 18-21px
- [ ] Captions/footnotes ≥ 11px
- [ ] Labels/metadata ≥ 13px

### Altura de Linha
- [ ] Body text: line-height ≥ 1.5
- [ ] Ideal para leitura: 1.6
- [ ] Headings: 1.25-1.375
- [ ] Código: 1.5-1.625

### Comprimento de Linha
- [ ] Máximo WCAG: 80ch
- [ ] Ideal: 65ch
- [ ] Mobile: 35-50ch
- [ ] Desktop: 60-75ch

### Peso de Fonte
- [ ] Body text: ≥ 400 (Regular)
- [ ] Nunca usar light (300) para body
- [ ] Headings: 600-700

### Espaçamento de Letras
- [ ] Letter-spacing: ~0.012em (0.12x)
- [ ] Mobile: considerar 0.016em
- [ ] Ajustável pelo usuário

### Alinhamento
- [ ] Texto alinhado à esquerda (NUNCA justificado)
- [ ] Headings podem ser centralizados
- [ ] Sem ALL CAPS em blocos de texto
- [ ] Sem itálico em blocos longos

### Escalabilidade
- [ ] Texto pode ser ampliado até 200% sem perda
- [ ] Zoom funciona sem quebrar layout
- [ ] Sem texto em imagens (exceto logos)

---

## 2. Cor e Contraste — WCAG

### Contraste de Texto
- [ ] Texto normal: ≥ 4.5:1 (AA)
- [ ] Texto grande (≥18px bold ou ≥24px): ≥ 3:1
- [ ] Ideal para leitura prolongada: 7:1 (AAA)
- [ ] Links vs texto ao redor: ≥ 3:1

### Modo Claro
- [ ] Fundo: off-white (#FAFAFA a #F5F5F5)
- [ ] NÃO usar branco puro (#FFFFFF) para body
- [ ] Texto: #212121 a #424242

### Modo Escuro
- [ ] Fundo: #121212 a #1E1E1E
- [ ] NUNCA usar preto puro (#000000)
- [ ] Texto: #E0E0E0 a #EDEDED
- [ ] NUNCA usar branco puro (#FFFFFF)
- [ ] Evitar contraste 21:1 (causa halation)

### Opções de Tema
- [ ] Tema claro disponível
- [ ] Tema escuro disponível
- [ ] Tema sépia/creme disponível (ideal para 2+ horas)
- [ ] Opção "seguir sistema" (prefers-color-scheme)

### Links
- [ ] Distinguíveis além da cor (sublinhado, peso, ícone)
- [ ] Contraste ≥ 3:1 com texto ao redor
- [ ] Estado visitado diferenciado
- [ ] Estado hover visível

### Highlights
- [ ] Opacidade 40% para manter legibilidade
- [ ] Múltiplas cores disponíveis
- [ ] Contraste mantido sobre highlight

---

## 3. Acessibilidade Cognitiva

### Parágrafos
- [ ] 3-4 sentenças por parágrafo (máx 5)
- [ ] Uma ideia principal por parágrafo
- [ ] Evitar blocos de texto >5 linhas

### Headings
- [ ] A cada 3-5 parágrafos
- [ ] Hierarquia lógica (H1 → H2 → H3)
- [ ] Descritivos do conteúdo
- [ ] Facilitam escaneamento

### Estrutura
- [ ] TL;DR/resumo no início (long-form)
- [ ] Table of Contents (>5 seções)
- [ ] Seções expansíveis/colapsáveis
- [ ] Pirâmide invertida (conclusão primeiro)

### Navegação
- [ ] Skip links disponíveis
- [ ] Landmarks ARIA (main, nav, article)
- [ ] Navegação por teclado funcional
- [ ] Ordem de tab lógica

---

## 4. Elementos de UI para Leitura

### Indicador de Progresso
- [ ] Barra de progresso visível (topo ou lateral)
- [ ] Ou: porcentagem numérica
- [ ] Ou: "X min restantes"
- [ ] Scroll depth rastreado

### Tempo de Leitura
- [ ] Exibido para artigos >500 palavras
- [ ] Formato: "X min de leitura"
- [ ] Cálculo: palavras ÷ 200

### Salvar Posição
- [ ] Posição de leitura salva automaticamente
- [ ] "Continue de onde parou" funcional
- [ ] Histórico de leituras disponível

### Anotações
- [ ] Highlight em múltiplas cores
- [ ] Notas marginais ou inline
- [ ] Exportar anotações

---

## 5. Responsividade

### Mobile (< 640px)
- [ ] Font size: 16px
- [ ] Line length: 35-50ch
- [ ] Padding lateral: ≥ 16px
- [ ] Line height: 1.6-1.7
- [ ] Touch targets: ≥ 44x44px

### Tablet (640-1023px)
- [ ] Font size: 17px
- [ ] Line length: 55-70ch
- [ ] Padding: 24px

### Desktop (≥ 1024px)
- [ ] Font size: 18px
- [ ] Line length: 60-75ch
- [ ] Padding: 32px

### Large (≥ 1280px)
- [ ] Font size: 18-21px
- [ ] Line length: 65-80ch
- [ ] Padding: 40px

---

## 6. Preferências do Sistema

### Motion
- [ ] Respeita prefers-reduced-motion
- [ ] Animações podem ser desabilitadas
- [ ] Sem auto-scroll obrigatório
- [ ] Sem parallax distratora

### Contraste
- [ ] Respeita prefers-contrast
- [ ] Opção de alto contraste disponível

### Tema
- [ ] Respeita prefers-color-scheme
- [ ] Override manual disponível

### Mídia
- [ ] Sem auto-play obrigatório
- [ ] Controles de mídia acessíveis

---

## 7. Suporte a Dislexia

- [ ] Opção de fonte sans-serif
- [ ] Opção OpenDyslexic ou similar
- [ ] Texto NUNCA justificado
- [ ] Line height aumentável (até 1.8)
- [ ] Letter spacing aumentável
- [ ] Word spacing aumentável
- [ ] Fundos sem padrões/texturas
- [ ] Tema sépia disponível

---

## 8. Suporte a Baixa Visão

- [ ] Zoom 200% funcional
- [ ] Alto contraste disponível
- [ ] Font size customizável
- [ ] Alt text em todas imagens
- [ ] Sem texto em imagens
- [ ] Focus visível (outline/ring)

---

## 9. Validação de Contraste

### Ferramentas
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Coolors Contrast Checker: https://coolors.co/contrast-checker

### Comandos de Validação
```bash
# Verificar cores hardcoded que podem ter baixo contraste
grep -rn "#[0-9A-Fa-f]\{6\}" {path}/ --include="*.tsx" --include="*.css"

# Verificar uso de branco/preto puros (evitar em dark mode)
grep -rn "#FFFFFF\|#000000" {path}/ --include="*.tsx" --include="*.css"
```

---

## 10. Métricas de Sucesso

| Métrica | Critério | Check |
|---------|----------|-------|
| Font size body | ≥16px | [ ] |
| Line height | ≥1.5 | [ ] |
| Line length | ≤80ch | [ ] |
| Contraste AA | ≥4.5:1 | [ ] |
| Contraste AAA | ≥7:1 | [ ] |
| Temas disponíveis | ≥2 | [ ] |
| Zoom 200% | Funcional | [ ] |
| Progress indicator | Visível | [ ] |
| Skip links | Disponível | [ ] |
| Keyboard nav | Funcional | [ ] |

---

## 11. Comandos de Validação Rápida

```bash
# 1. Verificar font sizes hardcoded
grep -rn "font-size:" {path}/ | grep -E "1[0-5]px|[0-9]px"

# 2. Verificar line-heights baixos
grep -rn "line-height:" {path}/ | grep -E "1\.[0-4]|1$"

# 3. Verificar text-align: justify
grep -rn "text-align:\s*justify" {path}/

# 4. Verificar ALL CAPS
grep -rn "text-transform:\s*uppercase" {path}/

# 5. Verificar branco/preto puros
grep -rn "#FFFFFF\|#000000\|rgb(255,\s*255,\s*255)\|rgb(0,\s*0,\s*0)" {path}/

# 6. Verificar prefers-reduced-motion
grep -rn "prefers-reduced-motion" {path}/

# 7. Verificar prefers-color-scheme
grep -rn "prefers-color-scheme" {path}/
```

---

*Checklist v1.0.0 — Baseado em WCAG 2.1/2.2, Apple HIG, Material Design 3, e práticas de publishers.*
