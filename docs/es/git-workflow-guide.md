<!--
  Traducción: ES
  Original: /docs/en/git-workflow-guide.md
  Última sincronización: 2026-01-26
-->

# Guía de Flujo de Trabajo Git de AIOX

> 🌐 [EN](../git-workflow-guide.md) | [PT](../pt/git-workflow-guide.md) | **ES**

---

_Story: 2.2-git-workflow-implementation.yaml_

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura de Defensa en Profundidad](#arquitectura-de-defensa-en-profundidad)
- [Capa 1: Validación Pre-commit](#capa-1-validación-pre-commit)
- [Capa 2: Validación Pre-push](#capa-2-validación-pre-push)
- [Capa 3: Pipeline CI/CD](#capa-3-pipeline-cicd)
- [Protección de Ramas](#protección-de-ramas)
- [Flujo de Trabajo Diario](#flujo-de-trabajo-diario)
- [Resolución de Problemas](#resolución-de-problemas)
- [Consejos de Rendimiento](#consejos-de-rendimiento)

## Descripción General

Synkra AIOX implementa una estrategia de validación de **Defensa en Profundidad** con tres capas progresivas que detectan problemas tempranamente y aseguran la calidad del código antes del merge.

### ¿Por Qué Tres Capas?

1. **Retroalimentación rápida** - Detectar problemas inmediatamente durante el desarrollo
2. **Validación local** - Sin dependencia de la nube para verificaciones básicas
3. **Validación autoritativa** - Puerta final antes del merge
4. **Consistencia de stories** - Asegurar que el desarrollo se alinee con las stories

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Pre-commit Hook (Local - <5s)                     │
│ ✓ ESLint (code quality)                                     │
│ ✓ TypeScript (type checking)                                │
│ ✓ Cache enabled                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-push Hook (Local - <2s)                       │
│ ✓ Story checkbox validation                                 │
│ ✓ Status consistency                                         │
│ ✓ Required sections                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: GitHub Actions CI (Cloud - 2-5min)                │
│ ✓ All lint/type checks                                      │
│ ✓ Full test suite                                           │
│ ✓ Code coverage (≥80%)                                      │
│ ✓ Story validation                                          │
│ ✓ Branch protection                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Merge Ready  │
                      └──────────────┘
```

## Arquitectura de Defensa en Profundidad

### Capa 1: Pre-commit (Local - Rápido)

**Objetivo de Rendimiento:** <5 segundos
**Disparador:** `git commit`
**Ubicación:** `.husky/pre-commit`

**Qué valida:**

- Calidad de código ESLint
- Verificación de tipos TypeScript
- Errores de sintaxis
- Problemas de importación

**Cómo funciona:**

```bash
# Se dispara automáticamente al hacer commit
git add .
git commit -m "feat: add feature"

# Ejecuta:
# 1. ESLint con caché (.eslintcache)
# 2. Compilación incremental de TypeScript (.tsbuildinfo)
```

**Beneficios:**

- ⚡ Retroalimentación rápida (<5s)
- 💾 Con caché para velocidad
- 🔒 Previene commits de código roto
- 🚫 Sin sintaxis inválida en el historial

### Capa 2: Pre-push (Local - Validación de Stories)

**Objetivo de Rendimiento:** <2 segundos
**Disparador:** `git push`
**Ubicación:** `.husky/pre-push`

**Qué valida:**

- Completitud de checkboxes de story vs estado
- Secciones requeridas de story presentes
- Consistencia de estado
- Registros del agente Dev

**Cómo funciona:**

```bash
# Se dispara automáticamente al hacer push
git push origin feature/my-feature

# Valida todos los archivos de story en docs/stories/
```

**Reglas de Validación:**

1. **Consistencia de Estado:**

```yaml
# ❌ Inválido: completado pero tareas incompletas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # ¡Error!

# ✅ Válido: todas las tareas completadas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **Secciones Requeridas:**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **Flujo de Estados:**

```
ready → in progress → Ready for Review → completed
```

### Capa 3: CI/CD (Nube - Autoritativo)

**Rendimiento:** 2-5 minutos
**Disparador:** Push a cualquier rama, creación de PR
**Plataforma:** GitHub Actions
**Ubicación:** `.github/workflows/ci.yml`

**Jobs:**

1. **ESLint** (job `lint`)
   - Se ejecuta en entorno limpio
   - Sin dependencia de caché

2. **TypeScript** (job `typecheck`)
   - Verificación completa de tipos
   - Sin compilación incremental

3. **Tests** (job `test`)
   - Suite completa de tests
   - Reporte de cobertura
   - Umbral del 80% obligatorio

4. **Validación de Stories** (job `story-validation`)
   - Todas las stories validadas
   - Consistencia de estado verificada

5. **Resumen de Validación** (job `validation-summary`)
   - Agrega todos los resultados
   - Bloquea el merge si alguno falla

**Monitoreo de Rendimiento:**

- Job de rendimiento opcional
- Mide tiempos de validación
- Solo informativo

## Capa 1: Validación Pre-commit

### Referencia Rápida

```bash
# Validación manual
npm run lint
npm run typecheck

# Auto-corrección de problemas de lint
npm run lint -- --fix

# Saltar hook (NO recomendado)
git commit --no-verify
```

### Configuración de ESLint

**Archivo:** `.eslintrc.json`

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "cache": true,
  "cacheLocation": ".eslintcache"
}
```

**Características clave:**

- Soporte para TypeScript
- Caché habilitado
- Advierte sobre console.log
- Ignora variables no usadas con prefijo `_`

### Configuración de TypeScript

**Archivo:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Características clave:**

- Target ES2022
- Modo estricto
- Compilación incremental
- Módulos CommonJS

### Optimización de Rendimiento

**Archivos de Caché:**

- `.eslintcache` - Resultados de ESLint
- `.tsbuildinfo` - Datos incrementales de TypeScript

**Primera ejecución:** ~10-15s (sin caché)
**Ejecuciones subsiguientes:** <5s (con caché)

**Invalidación de caché:**

- Cambios de configuración
- Actualizaciones de dependencias
- Eliminación de archivos

## Capa 2: Validación Pre-push

### Referencia Rápida

```bash
# Validación manual
node .aiox-core/utils/aiox-validator.js pre-push
node .aiox-core/utils/aiox-validator.js stories

# Validar una sola story
node .aiox-core/utils/aiox-validator.js story docs/stories/1.1-story.yaml

# Saltar hook (NO recomendado)
git push --no-verify
```

### Validador de Stories

**Ubicación:** `.aiox-core/utils/aiox-validator.js`

**Características:**

- Salida de terminal coloreada
- Indicadores de progreso
- Mensajes de error claros
- Advertencias para problemas potenciales

**Ejemplo de Salida:**

```
══════════════════════════════════════════════════════════
  Story Validation: 2.2-git-workflow-implementation.yaml
══════════════════════════════════════════════════════════

Story: 2.2 - Git Workflow with Multi-Layer Validation
Status: in progress

Progress: 12/15 tasks (80.0%)

✓ Story validation passed with warnings

Warning:
  • Consider updating status to 'Ready for Review'
```

### Reglas de Validación

#### 1. Formato de Checkbox

Formatos soportados:

- `[x]` - Completado (minúscula)
- `[X]` - Completado (mayúscula)
- `[ ]` - Incompleto

No reconocidos:

- `[o]`, `[*]`, `[-]` - No cuentan como completos

#### 2. Consistencia de Estado

| Estado             | Regla                               |
| ------------------ | ----------------------------------- |
| `ready`            | Ninguna tarea debería estar marcada |
| `in progress`      | Algunas tareas marcadas             |
| `Ready for Review` | Todas las tareas marcadas           |
| `completed`        | Todas las tareas marcadas           |

#### 3. Secciones Requeridas

Todas las stories deben tener:

```yaml
id: "X.X"
title: "Story Title"
description: "Story description"
status: "ready" | "in progress" | "Ready for Review" | "completed"
acceptance_criteria:
  - name: "Criterion"
    tasks:
      - "[ ] Task"
```

#### 4. Registro del Agente Dev

Recomendado pero no requerido:

```yaml
dev_agent_record:
  agent_model: 'claude-sonnet-4-5'
  implementation_date: '2025-01-23'
```

Advertencia si falta.

### Mensajes de Error

**Secciones Requeridas Faltantes:**

```
✗ Missing required sections: description, acceptance_criteria
```

**Inconsistencia de Estado:**

```
✗ Story marked as completed but only 12/15 tasks are checked
```

**Archivo No Existente:**

```
✗ Story file not found: docs/stories/missing.yaml
```

## Capa 3: Pipeline CI/CD

### Estructura del Workflow

**Archivo:** `.github/workflows/ci.yml`

**Jobs:**

1. **lint** - Validación ESLint
2. **typecheck** - Verificación TypeScript
3. **test** - Tests Jest con cobertura
4. **story-validation** - Consistencia de stories
5. **validation-summary** - Agregar resultados
6. **performance** (opcional) - Métricas de rendimiento

### Detalles de Jobs

#### Job ESLint

```yaml
- name: Run ESLint
  run: npm run lint
```

- Se ejecuta en Ubuntu latest
- Timeout: 5 minutos
- Usa caché de npm
- Falla con cualquier error de lint

#### Job TypeScript

```yaml
- name: Run TypeScript type checking
  run: npm run typecheck
```

- Se ejecuta en Ubuntu latest
- Timeout: 5 minutos
- Falla con errores de tipos

#### Job Test

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
```

- Se ejecuta en Ubuntu latest
- Timeout: 10 minutos
- Cobertura subida a Codecov
- Umbral de cobertura del 80% obligatorio

#### Job Validación de Stories

```yaml
- name: Validate story checkboxes
  run: node .aiox-core/utils/aiox-validator.js stories
```

- Se ejecuta en Ubuntu latest
- Timeout: 5 minutos
- Valida todas las stories

#### Job Resumen de Validación

```yaml
needs: [lint, typecheck, test, story-validation]
if: always()
```

- Se ejecuta después de todas las validaciones
- Verifica estados de todos los jobs
- Falla si cualquier validación falló
- Proporciona resumen

### Disparadores de CI

**Eventos de Push:**

- Rama `master`
- Rama `develop`
- Ramas `feature/**`
- Ramas `bugfix/**`

**Eventos de Pull Request:**

- Contra `master`
- Contra `develop`

### Ver Resultados de CI

```bash
# Ver checks del PR
gh pr checks

# Ver ejecuciones del workflow
gh run list

# Ver ejecución específica
gh run view <run-id>

# Re-ejecutar jobs fallidos
gh run rerun <run-id>
```

## Protección de Ramas

### Configuración

```bash
# Ejecutar script de configuración
node scripts/setup-branch-protection.js

# Ver protección actual
node scripts/setup-branch-protection.js --status
```

### Requisitos

- GitHub CLI (`gh`) instalado
- Autenticado con GitHub
- Acceso de administrador al repositorio

### Reglas de Protección

**Protección de Rama Master:**

1. **Verificaciones de Estado Requeridas:**
   - ESLint
   - TypeScript Type Checking
   - Jest Tests
   - Story Checkbox Validation

2. **Revisiones de Pull Request:**
   - 1 aprobación requerida
   - Descartar revisiones obsoletas en nuevos commits

3. **Reglas Adicionales:**
   - Historial lineal obligatorio (solo rebase)
   - Force pushes bloqueados
   - Eliminación de rama bloqueada
   - Reglas aplican a administradores

### Configuración Manual

Via GitHub CLI:

```bash
# Establecer verificaciones de estado requeridas
gh api repos/OWNER/REPO/branches/master/protection/required_status_checks \
  -X PUT \
  -f strict=true \
  -f contexts[]="ESLint" \
  -f contexts[]="TypeScript Type Checking"

# Requerir revisiones de PR
gh api repos/OWNER/REPO/branches/master/protection/required_pull_request_reviews \
  -X PUT \
  -f required_approving_review_count=1

# Bloquear force pushes
gh api repos/OWNER/REPO/branches/master/protection/allow_force_pushes \
  -X DELETE
```

## Flujo de Trabajo Diario

### Iniciando una Nueva Funcionalidad

```bash
# 1. Actualizar master
git checkout master
git pull origin master

# 2. Crear rama de funcionalidad
git checkout -b feature/my-feature

# 3. Hacer cambios
# ... editar archivos ...

# 4. Commit (dispara pre-commit)
git add .
git commit -m "feat: add my feature [Story X.X]"

# 5. Push (dispara pre-push)
git push origin feature/my-feature

# 6. Crear PR
gh pr create --title "feat: Add my feature" --body "Description"
```

### Actualizando una Story

```bash
# 1. Abrir archivo de story
code docs/stories/X.X-story.yaml

# 2. Marcar tareas completadas
# Cambiar: - "[ ] Task"
# A:       - "[x] Task"

# 3. Actualizar estado si es necesario
# Cambiar: status: "in progress"
# A:       status: "Ready for Review"

# 4. Commit de actualizaciones de story
git add docs/stories/X.X-story.yaml
git commit -m "docs: update story X.X progress"

# 5. Push (valida story)
git push
```

### Corrigiendo Fallos de Validación

**Errores de ESLint:**

```bash
# Auto-corregir problemas
npm run lint -- --fix

# Verificar problemas restantes
npm run lint

# Commit de correcciones
git add .
git commit -m "style: fix lint issues"
```

**Errores de TypeScript:**

```bash
# Ver todos los errores
npm run typecheck

# Corregir errores en código
# ... editar archivos ...

# Verificar corrección
npm run typecheck

# Commit de correcciones
git add .
git commit -m "fix: resolve type errors"
```

**Errores de Validación de Stories:**

```bash
# Verificar stories
node .aiox-core/utils/aiox-validator.js stories

# Corregir archivo de story
code docs/stories/X.X-story.yaml

# Verificar corrección
node .aiox-core/utils/aiox-validator.js story docs/stories/X.X-story.yaml

# Commit de corrección
git add docs/stories/
git commit -m "docs: fix story validation"
```

**Fallos de Tests:**

```bash
# Ejecutar tests
npm test

# Ejecutar test específico
npm test -- path/to/test.js

# Corregir tests fallidos
# ... editar archivos de test ...

# Ejecutar con cobertura
npm run test:coverage

# Commit de correcciones
git add .
git commit -m "test: fix failing tests"
```

### Haciendo Merge de un Pull Request

```bash
# 1. Asegurar que CI pasa
gh pr checks

# 2. Obtener aprobación
# (Esperar revisión de miembro del equipo)

# 3. Merge (squash)
gh pr merge --squash --delete-branch

# 4. Actualizar master local
git checkout master
git pull origin master
```

## Resolución de Problemas

### Hook No Se Ejecuta

**Síntomas:** Commit tiene éxito sin validación

**Soluciones:**

1. Verificar instalación de Husky:

```bash
npm run prepare
```

2. Verificar que existen archivos de hook:

```bash
ls -la .husky/pre-commit
ls -la .husky/pre-push
```

3. Verificar permisos de archivos (Unix):

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Hook Pre-commit Lento

**Síntomas:** Pre-commit toma >10 segundos

**Soluciones:**

1. Limpiar cachés:

```bash
rm .eslintcache .tsbuildinfo
git commit  # Reconstruye caché
```

2. Verificar cambios de archivos:

```bash
git status
# Commit de menos archivos a la vez
```

3. Actualizar dependencias:

```bash
npm update
```

### Validación de Story Falla

**Síntoma:** Pre-push falla con errores de story

**Problemas Comunes:**

1. **Desajuste de checkbox:**

```yaml
# Error: Estado completado pero tareas incompletas
status: 'completed'
tasks:
  - '[x] Task 1'
  - '[ ] Task 2' # ← Corregir esto


# Solución: Completar todas las tareas o cambiar estado
```

2. **Secciones faltantes:**

```yaml
# Error: Secciones requeridas faltantes
id: '1.1'
title: 'Story'
# Faltan: description, acceptance_criteria, status

# Solución: Agregar secciones faltantes
```

3. **YAML inválido:**

```yaml
# Error: Sintaxis YAML inválida
tasks:
  - "[ ] Task 1
  - "[ ] Task 2"  # ← Falta comilla de cierre arriba

# Solución: Corregir sintaxis YAML
```

### CI Falla pero Local Pasa

**Síntomas:** CI falla pero todas las validaciones locales pasan

**Causas Comunes:**

1. **Diferencias de caché:**

```bash
# Limpiar cachés locales
rm -rf node_modules .eslintcache .tsbuildinfo coverage/
npm ci
npm test
```

2. **Diferencias de entorno:**

```bash
# Usar misma versión de Node que CI (18)
nvm use 18
npm test
```

3. **Archivos sin commit:**

```bash
# Verificar cambios sin commit
git status

# Stash si es necesario
git stash
```

### Protección de Rama Bloquea Merge

**Síntomas:** No puede hacer merge del PR incluso con aprobaciones

**Verificar:**

1. **Checks requeridos pasan:**

```bash
gh pr checks
# Todos deben mostrar ✓
```

2. **Aprobaciones requeridas:**

```bash
gh pr view
# Verificar sección "Reviewers"
```

3. **Rama está actualizada:**

```bash
# Actualizar rama
git checkout feature-branch
git rebase master
git push --force-with-lease
```

## Consejos de Rendimiento

### Gestión de Caché

**Mantener cachés:**

- `.eslintcache` - Resultados de ESLint
- `.tsbuildinfo` - Info de build de TypeScript
- `coverage/` - Datos de cobertura de tests

**Agregar a .gitignore:**

```gitignore
.eslintcache
.tsbuildinfo
coverage/
```

### Desarrollo Incremental

**Mejores Prácticas:**

1. **Commits pequeños:**
   - Menos archivos = validación más rápida
   - Más fácil de debuggear fallos

2. **Probar durante el desarrollo:**

```bash
# Ejecutar validación manualmente antes del commit
npm run lint
npm run typecheck
npm test
```

3. **Corregir problemas inmediatamente:**
   - No dejar que los problemas se acumulen
   - Más fácil de corregir en contexto

### Optimización de CI

**Optimizaciones del workflow:**

1. **Jobs paralelos** - Todas las validaciones se ejecutan en paralelo
2. **Timeouts de jobs** - Fallan rápido en cuelgues
3. **Caché** - Dependencias npm cacheadas
4. **Jobs condicionales** - Job de rendimiento solo en PRs

### Rendimiento de Validación de Stories

**Rendimiento Actual:**

- Una sola story: <100ms
- Todas las stories: <2s (típico)

**Consejos de optimización:**

1. **Mantener stories enfocadas** - Una funcionalidad por story
2. **Limitar conteo de tareas** - Dividir stories grandes en más pequeñas
3. **YAML válido** - Errores de parsing ralentizan validación

## Temas Avanzados

### Saltando Validaciones

**Cuándo es apropiado:**

- Hotfixes de emergencia
- Cambios solo de documentación
- Cambios de configuración de CI

**Cómo saltar:**

```bash
# Saltar pre-commit
git commit --no-verify

# Saltar pre-push
git push --no-verify

# Saltar CI (no recomendado)
# Agregar [skip ci] al mensaje de commit
git commit -m "docs: update [skip ci]"
```

**Advertencia:** Solo saltar cuando sea absolutamente necesario. Las validaciones saltadas no detectarán problemas.

### Validación Personalizada

**Agregar validadores personalizados:**

1. **Crear función validadora:**

```javascript
// .aiox-core/utils/custom-validator.js
module.exports = async function validateCustom() {
  // Tu lógica de validación
  return { success: true, errors: [] };
};
```

2. **Agregar al hook:**

```bash
# .husky/pre-commit
node .aiox-core/utils/aiox-validator.js pre-commit
node .aiox-core/utils/custom-validator.js
```

3. **Agregar a CI:**

```yaml
# .github/workflows/ci.yml
- name: Custom validation
  run: node .aiox-core/utils/custom-validator.js
```

### Soporte para Monorepo

**Para monorepos:**

1. **Validaciones con alcance:**

```javascript
// Solo validar paquetes cambiados
const changedFiles = execSync('git diff --name-only HEAD~1').toString();
const packages = getAffectedPackages(changedFiles);
```

2. **Validación paralela de paquetes:**

```yaml
strategy:
  matrix:
    package: [package-a, package-b, package-c]
```

## Referencias

- **AIOX Validator:** [.aiox-core/utils/aiox-validator.js](../../.aiox-core/utils/aiox-validator.js)
- **CI Workflow:** [.github/workflows/ci.yml](../../.github/workflows/ci.yml)

---

**¿Preguntas? ¿Problemas?**

- [Abrir un Issue](https://github.com/SynkraAI/aiox-core/issues)
- [Unirse a Discord](https://discord.gg/gk8jAdXWmj)
