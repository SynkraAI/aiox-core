# Run Design System Pipeline

> Task ID: ux-run-design-system-pipeline
> Agent: @ux-design-expert (Brad - Design System Architect)
> Version: 1.0.0

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Executa pipeline completo automaticamente
- Minimal user interaction
- **Best for:** Pipelines de CI/CD, releases automatizados

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Checkpoint entre cada step
- Mostra resultados e pede confirmação
- **Best for:** Primeira execução, validação manual

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Analisa projeto antes de executar
- Identifica potenciais problemas
- **Best for:** Projetos complexos, primeira migração

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: runDesignSystemPipeline()
responsável: Brad (Design System Architect)
responsavel_type: Agente
atomic_layer: Pipeline

**Entrada:**
- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid project directory (default: current)

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|preflight

- campo: skip_steps
  tipo: array
  origem: User Input
  obrigatório: false
  validação: Array of step ids to skip (build|document|a11y|roi)

- campo: output_dir
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Output directory (default: outputs/design-system/)

**Saída:**
- campo: pipeline_report
  tipo: object
  destino: File system
  persistido: true

- campo: build_artifacts
  tipo: object
  destino: File system
  persistido: true

- campo: documentation
  tipo: object
  destino: File system
  persistido: true

- campo: a11y_report
  tipo: object
  destino: File system
  persistido: true

- campo: roi_metrics
  tipo: object
  destino: File system
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Design System project exists with components
    tipo: pre-condition
    blocker: true
    validação: |
      Check for design-system/ or components/ui/ directory
    error_message: "Pre-condition failed: No Design System found in project"

  - [ ] Package.json exists with required dependencies
    tipo: pre-condition
    blocker: false
    validação: |
      Check for React, TypeScript, Tailwind dependencies
    error_message: "Warning: Some dependencies may be missing"

  - [ ] Build tools configured (vite, webpack, or similar)
    tipo: pre-condition
    blocker: true
    validação: |
      Check for build configuration files
    error_message: "Pre-condition failed: No build configuration found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All pipeline steps completed without critical errors
    tipo: post-condition
    blocker: true
    validação: |
      Verify each step exit code = 0 or has acceptable warnings
    error_message: "Post-condition failed: Pipeline had critical errors"

  - [ ] Output artifacts generated in expected locations
    tipo: post-condition
    blocker: true
    validação: |
      Check outputs/design-system/ contains expected files
    error_message: "Post-condition failed: Missing output artifacts"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Build step: Components compiled successfully
    tipo: acceptance-criterion
    blocker: true

  - [ ] Document step: Pattern Library documentation generated
    tipo: acceptance-criterion
    blocker: false

  - [ ] A11y step: WCAG AA audit completed (warnings OK, errors block)
    tipo: acceptance-criterion
    blocker: true

  - [ ] ROI step: Metrics calculated and report generated
    tipo: acceptance-criterion
    blocker: false
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** build-component
  - **Purpose:** Build individual components
  - **Source:** .aios-core/development/tasks/build-component.md

- **Tool:** generate-documentation
  - **Purpose:** Generate Pattern Library docs
  - **Source:** .aios-core/development/tasks/generate-documentation.md

- **Tool:** accessibility-audit
  - **Purpose:** Run WCAG compliance checks
  - **Source:** External: axe-core, pa11y, or similar

- **Tool:** calculate-roi
  - **Purpose:** Calculate ROI metrics
  - **Source:** .aios-core/development/tasks/calculate-roi.md

---

## Error Handling

**Strategy:** continue-on-warning

**Common Errors:**

1. **Error:** Build Failure
   - **Cause:** TypeScript errors, missing dependencies, invalid imports
   - **Resolution:** Fix errors and re-run build step only
   - **Recovery:** Show error details, suggest fixes, offer to skip to next step

2. **Error:** Documentation Generation Failed
   - **Cause:** Missing component metadata, invalid JSDoc
   - **Resolution:** Add missing metadata, fix JSDoc syntax
   - **Recovery:** Continue pipeline, flag for manual documentation

3. **Error:** Accessibility Violations (Critical)
   - **Cause:** WCAG AA violations in components
   - **Resolution:** Fix accessibility issues before proceeding
   - **Recovery:** Generate remediation report, block pipeline if critical

4. **Error:** ROI Calculation Failed
   - **Cause:** Missing baseline metrics, no consolidation data
   - **Resolution:** Run consolidation first or provide manual inputs
   - **Recovery:** Skip ROI, complete pipeline with partial results

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (full pipeline)
cost_estimated: $0.01-0.05
token_usage: ~5,000-15,000 tokens

step_breakdown:
  build: 1-3 min
  document: 2-5 min
  a11y: 1-3 min
  roi: 1-2 min
```

**Optimization Notes:**

- Run a11y checks in parallel with documentation generation
- Cache build artifacts between runs
- Skip unchanged components in incremental mode

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - build-component.md
  - generate-documentation.md
  - calculate-roi.md
tags:
  - pipeline
  - automation
  - design-system
  - quality
  - ci-cd
updated_at: 2025-01-30
```

---

## Description

Pipeline automatizado pós-migração para Design System. Executa sequencialmente: build de componentes atômicos → geração de documentação do Pattern Library → auditoria de acessibilidade WCAG AA → cálculo de ROI e savings.

Ideal para integração em CI/CD ou validação antes de releases.

## Prerequisites

- Design System configurado no projeto
- Componentes existentes para build
- Node.js 18+ instalado
- Dependências do projeto instaladas (npm install)

## Workflow

### Pipeline Sequence

```
┌──────┬───────────────────┬───────────────────────────────────────┐
│ Step │       ID          │                 Ação                  │
├──────┼───────────────────┼───────────────────────────────────────┤
│ 1    │ build             │ Build de componentes atômicos         │
├──────┼───────────────────┼───────────────────────────────────────┤
│ 2    │ document          │ Gerar documentação do Pattern Library │
├──────┼───────────────────┼───────────────────────────────────────┤
│ 3    │ a11y              │ Auditoria de acessibilidade (WCAG AA) │
├──────┼───────────────────┼───────────────────────────────────────┤
│ 4    │ roi               │ Cálculo de ROI e savings              │
└──────┴───────────────────┴───────────────────────────────────────┘
```

### Step 1: Build Components

```yaml
step: build
agent: @ux-design-expert
action: Build de componentes atômicos
```

**Execução:**

1. Identificar todos os componentes no Design System
2. Compilar tokens de design (cores, tipografia, espaçamentos)
3. Build de componentes atômicos (atoms → molecules → organisms)
4. Validar estrutura de arquivos e nomenclatura
5. Verificar TypeScript strict mode compliance
6. Gerar bundle de componentes

**Outputs:**

- `build_report.json` - Relatório de build
- `compiled_tokens/` - Tokens compilados
- `dist/` - Bundle de componentes

**Validation:**

- [ ] Build completo sem erros TypeScript
- [ ] Todos os tokens compilados
- [ ] Componentes exportados corretamente

### Step 2: Generate Documentation

```yaml
step: document
agent: @ux-design-expert
action: Gerar documentação do Pattern Library
requires: build
```

**Execução:**

1. Extrair metadata dos componentes (props, variants, types)
2. Gerar documentação de cada componente
3. Criar guia de estilo visual
4. Gerar código de exemplo para cada variante
5. Atualizar changelog de componentes
6. Build do Storybook (se configurado)

**Outputs:**

- `docs/pattern-library/` - Documentação completa
- `docs/api-reference/` - Referência de API
- `docs/style-guide.md` - Guia de estilo
- `storybook-static/` - Storybook build (se habilitado)

**Validation:**

- [ ] Todos os componentes documentados
- [ ] Exemplos de código funcionais
- [ ] Guia de estilo atualizado

### Step 3: Accessibility Audit

```yaml
step: a11y
agent: @ux-design-expert
action: Auditoria de acessibilidade (WCAG AA)
requires: document
```

**Execução:**

1. Executar axe-core em todos os componentes
2. Verificar contraste de cores (4.5:1 texto, 3:1 UI)
3. Validar navegação por teclado
4. Checar atributos ARIA e roles
5. Verificar focus states e indicadores visuais
6. Testar com múltiplos tamanhos de fonte

**WCAG 2.1 AA Checklist:**

- [ ] 1.4.3 Contrast (Minimum) - 4.5:1 for text
- [ ] 1.4.11 Non-text Contrast - 3:1 for UI
- [ ] 2.1.1 Keyboard - All functionality keyboard accessible
- [ ] 2.4.7 Focus Visible - Focus indicator visible
- [ ] 4.1.2 Name, Role, Value - ARIA attributes correct

**Outputs:**

- `a11y/audit-report.json` - Relatório completo
- `a11y/violations.md` - Lista de violações
- `a11y/remediation-plan.md` - Plano de correção

**Validation:**

- [ ] Zero violações críticas (Level A)
- [ ] Violações AA documentadas com plano de correção
- [ ] Navegação por teclado funcional

### Step 4: Calculate ROI

```yaml
step: roi
agent: @ux-design-expert
action: Cálculo de ROI e savings
requires: a11y
```

**Execução:**

1. Coletar métricas de componentes (quantidade, reuso)
2. Calcular tempo economizado em desenvolvimento
3. Estimar redução de inconsistências visuais
4. Projetar velocidade de entrega de features
5. Calcular custo de manutenção reduzido
6. Gerar dashboard de métricas

**Métricas Calculadas:**

- Horas dev economizadas/mês
- % de reuso de componentes
- Tempo médio para nova feature
- Redução de bugs visuais
- ROI ratio e breakeven point

**Outputs:**

- `roi/roi-analysis.md` - Análise completa
- `roi/executive-summary.md` - Resumo executivo
- `roi/metrics-dashboard.json` - Dados para dashboard

**Validation:**

- [ ] Métricas de reuso calculadas
- [ ] ROI ratio positivo
- [ ] Executive summary gerado

---

## Output

### Final Pipeline Report

```yaml
# pipeline-report.yaml
pipeline:
  id: design-system-build-quality
  executed_at: '2025-01-30T14:00:00Z'
  mode: interactive
  duration: '8m 32s'

steps:
  build:
    status: success
    duration: '2m 15s'
    components_built: 24
    tokens_compiled: 156
    errors: 0
    warnings: 2

  document:
    status: success
    duration: '3m 45s'
    pages_generated: 28
    examples_created: 72
    storybook: enabled

  a11y:
    status: success
    duration: '1m 22s'
    components_audited: 24
    violations_critical: 0
    violations_serious: 3
    violations_minor: 8
    wcag_level: 'AA (with warnings)'

  roi:
    status: success
    duration: '1m 10s'
    monthly_savings: '$12,400'
    reuse_rate: '78%'
    roi_ratio: '8.2x'

summary:
  total_duration: '8m 32s'
  overall_status: success
  quality_score: 94/100
  next_steps:
    - 'Fix 3 serious a11y violations'
    - 'Review ROI with stakeholders'
    - 'Schedule production release'
```

---

## Success Criteria

- [ ] Pipeline executa todos os 4 steps sem erros críticos
- [ ] Build gera bundle de componentes válido
- [ ] Documentação cobre 100% dos componentes
- [ ] Zero violações críticas de acessibilidade (WCAG A)
- [ ] ROI report gerado com métricas válidas
- [ ] Pipeline report salvo em outputs/

---

## Examples

### Example 1: Execução Completa (YOLO Mode)

```bash
*run-design-system-pipeline --mode=yolo
```

Output:

```
🚀 Brad: Iniciando Design System Pipeline (YOLO mode)...

[1/4] 🏗️ BUILD
  ✓ Compilando tokens... 156 tokens
  ✓ Building componentes... 24 components
  ✓ Bundle gerado: dist/design-system.js (142kb)
  ⏱️ 2m 15s

[2/4] 📚 DOCUMENT
  ✓ Gerando Pattern Library... 28 páginas
  ✓ API Reference... 24 componentes
  ✓ Storybook build... 72 stories
  ⏱️ 3m 45s

[3/4] ♿ A11Y AUDIT
  ✓ Executando axe-core... 24 componentes
  ✓ Contraste de cores... PASS
  ✓ Navegação keyboard... PASS
  ⚠️ 3 violações serious (ver remediation-plan.md)
  ⏱️ 1m 22s

[4/4] 💰 ROI
  ✓ Calculando métricas...
  ✓ Monthly savings: $12,400
  ✓ ROI ratio: 8.2x
  ✓ Breakeven: 1.2 months
  ⏱️ 1m 10s

═══════════════════════════════════════════
✅ PIPELINE COMPLETO
═══════════════════════════════════════════
📊 Quality Score: 94/100
⏱️ Total: 8m 32s
📁 Outputs: outputs/design-system/

Brad says: "Pipeline limpo. Ship it! 🚢"
```

### Example 2: Execução Interativa

```bash
*run-design-system-pipeline
```

Output:

```
🚀 Brad: Iniciando Design System Pipeline (Interactive mode)...

[1/4] 🏗️ BUILD
  Componentes encontrados: 24
  Tokens encontrados: 156

  Continuar com build? (Y/n): Y

  ✓ Build completo!

  Resultado:
  - Components: 24/24 ✓
  - Tokens: 156/156 ✓
  - Warnings: 2 (non-blocking)

  Prosseguir para documentação? (Y/n): Y

[2/4] 📚 DOCUMENT
  ...
```

### Example 3: Skip Steps

```bash
*run-design-system-pipeline --skip=document,roi
```

Executa apenas: build → a11y

---

## Integration

### CI/CD Integration

```yaml
# .github/workflows/design-system.yml
name: Design System Quality
on:
  push:
    paths:
      - 'src/components/**'
      - 'design-system/**'

jobs:
  quality-pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Design System Pipeline
        run: npx aios-core task run-design-system-pipeline --mode=yolo
```

### NPM Script

```json
{
  "scripts": {
    "ds:pipeline": "npx aios-core task run-design-system-pipeline",
    "ds:pipeline:ci": "npx aios-core task run-design-system-pipeline --mode=yolo"
  }
}
```

---

## Notes

- Pipeline é idempotente - pode ser executado múltiplas vezes
- Resultados são incrementais quando possível
- Modo YOLO ideal para CI/CD
- Modo Interactive ideal para desenvolvimento local
- A11y violations serious não bloqueiam, mas devem ser corrigidas antes do release
- ROI é opcional mas recomendado para justificar investimento
