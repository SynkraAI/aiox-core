<!-- Traduccion: ES | Original: /docs/en/architecture/adr/ADR-COLLAB-1-current-state-audit.md | Sincronizacion: 2026-01-26 -->

# ADR-COLLAB-1: Auditoria de Estado Actual - Proteccion de Ramas y Flujo de Contribuidores

**Historia:** COLLAB-1
**Fecha:** 2025-12-30
**Estado:** Aceptado
**Autor:** @devops (Gage)

---

## Contexto

Un usuario de la comunidad realizo mejoras al agente `@data-engineer`. Esta auditoria documenta la configuracion de seguridad actual del repositorio para identificar brechas que podrian permitir modificaciones no autorizadas a la rama principal.

---

## Decision

Auditar el estado actual de:

1. Reglas de proteccion de ramas
2. Workflows de GitHub Actions
3. Configuracion de CODEOWNERS
4. Verificaciones de estado requeridas

---

## Estado Actual

### 1. Configuracion de Proteccion de Ramas

**Fuente:** `gh api repos/SynkraAI/aiox-core/branches/main/protection`

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "lint", "typecheck"]
  },
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false,
    "required_approving_review_count": 0
  },
  "required_signatures": {
    "enabled": false
  },
  "enforce_admins": {
    "enabled": false
  },
  "required_linear_history": {
    "enabled": false
  },
  "allow_force_pushes": {
    "enabled": false
  },
  "allow_deletions": {
    "enabled": false
  },
  "required_conversation_resolution": {
    "enabled": false
  }
}
```

### 2. Configuracion del Repositorio

**Fuente:** `gh api repos/SynkraAI/aiox-core`

```json
{
  "name": "aiox-core",
  "default_branch": "main",
  "visibility": "public",
  "allow_forking": true,
  "has_discussions": true,
  "has_issues": true,
  "has_projects": true,
  "has_wiki": true
}
```

### 3. Workflows de GitHub Actions

**Fuente:** `gh api repos/SynkraAI/aiox-core/actions/workflows`

| Workflow                 | Estado | Ruta                                      |
| ------------------------ | ------ | ----------------------------------------- |
| CI                       | activo | .github/workflows/ci.yml                  |
| Test                     | activo | .github/workflows/test.yml                |
| PR Automation            | activo | .github/workflows/pr-automation.yml       |
| PR Labeling              | activo | .github/workflows/pr-labeling.yml         |
| Semantic Release         | activo | .github/workflows/semantic-release.yml    |
| Release                  | activo | .github/workflows/release.yml             |
| NPM Publish              | activo | .github/workflows/npm-publish.yml         |
| Welcome New Contributors | activo | .github/workflows/welcome.yml             |
| macOS Testing            | activo | .github/workflows/macos-testing.yml       |
| Quarterly Gap Audit      | activo | .github/workflows/quarterly-gap-audit.yml |
| CodeQL                   | activo | dynamic/github-code-scanning/codeql       |

### 4. Configuracion de CODEOWNERS

**Fuente:** `.github/CODEOWNERS`

```codeowners
* @SynkraAI
```

**Analisis:** Propiedad unica a nivel de organizacion - sin propiedad granular basada en rutas.

### 5. Configuracion de CodeRabbit

**Estado:** `.coderabbit.yaml` NO ENCONTRADO

---

## Analisis de Brechas

### Severidad CRITICA

| Configuracion                     | Actual    | Esperado  | Riesgo                            |
| --------------------------------- | --------- | --------- | --------------------------------- |
| `required_approving_review_count` | **0**     | **1**     | Codigo sin revisar puede mergearse |
| `require_code_owner_reviews`      | **false** | **true**  | Sin validacion de expertos        |

**Impacto:** Cualquier colaborador con acceso de escritura puede mergear PRs sin aprobacion, evitando la revision de codigo.

### Severidad ALTA

| Configuracion               | Actual         | Esperado      | Riesgo                     |
| --------------------------- | -------------- | ------------- | -------------------------- |
| CodeRabbit `.coderabbit.yaml` | Faltante     | Configurado   | Sin revision AI automatizada |
| Granularidad de CODEOWNERS  | Nivel de org   | Por ruta      | Sin enrutamiento de expertos |

**Impacto:** Calidad de revision reducida y sin feedback automatizado para contribuidores.

### Severidad MEDIA

| Configuracion                         | Actual       | Esperado  | Riesgo                         |
| ------------------------------------- | ------------ | --------- | ------------------------------ |
| `test` en verificaciones requeridas   | No requerido | Requerido | Tests pueden omitirse          |
| `required_conversation_resolution`    | false        | true      | Feedback puede ignorarse       |
| `story-validation` en verificaciones  | No requerido | Opcional  | Consistencia de historias no aplicada |

**Impacto:** Los PRs pueden mergearse con tests fallando o feedback sin abordar.

### Severidad BAJA

| Configuracion           | Actual | Esperado | Riesgo                            |
| ----------------------- | ------ | -------- | --------------------------------- |
| Firmas requeridas       | false  | Opcional | Autenticidad de commits no verificada |
| Historial lineal requerido | false | Opcional | Historial de merge complejo      |

**Impacto:** Preocupaciones menores de trazabilidad.

---

## Tabla Resumen

| Categoria                   | Estado   | Accion Requerida   |
| --------------------------- | -------- | ------------------ |
| Revisiones aprobadoras      | CRITICO  | Habilitar 1 requerida |
| Revisiones de code owner    | CRITICO  | Habilitar          |
| Config de CodeRabbit        | ALTO     | Crear              |
| Detalle de CODEOWNERS       | ALTO     | Mejorar            |
| Test en verificaciones      | MEDIO    | Agregar            |
| Resolucion de conversacion  | MEDIO    | Habilitar          |

---

## Evaluacion de Riesgo

### Nivel de Riesgo Actual: ALTO

Con `required_approving_review_count: 0`, cualquier colaborador puede:

1. Crear un PR
2. Mergear inmediatamente sin ninguna revision
3. Evadir toda supervision humana

Esto es aceptable para desarrollo interno pero **no recomendado para contribuciones externas**.

### Factores Mitigantes

- Pipeline de CI (`lint`, `typecheck`, `build`) es requerido
- Force pushes estan deshabilitados
- Eliminacion de ramas esta deshabilitada
- Revisiones obsoletas se descartan (cuando las revisiones son requeridas)

---

## Recomendaciones

### Fase 1: Inmediato (CRITICO)

1. Establecer `required_approving_review_count: 1`
2. Establecer `require_code_owner_reviews: true`

**Comando:**

```bash
gh api repos/SynkraAI/aiox-core/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["lint","typecheck","build","test"]}' \
  -F enforce_admins=false \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -F restrictions=null
```

### Fase 2: Corto plazo (ALTO)

1. Crear `.coderabbit.yaml` con reglas especificas de AIOX
2. Actualizar CODEOWNERS con rutas granulares

### Fase 3: Mediano plazo (MEDIO)

1. Agregar `test` a verificaciones de estado requeridas
2. Habilitar `required_conversation_resolution`

---

## Artefactos de Auditoria

Configuraciones exportadas guardadas en:

- `.aiox/audit/branch-protection.json`
- `.aiox/audit/repo-settings.json`

---

## Consecuencias

### Positivas

- Visibilidad completa de la postura de seguridad actual
- Priorizacion clara de correcciones
- Recomendaciones basadas en evidencia

### Negativas

- La auditoria revela brechas significativas
- Se requiere accion inmediata para contribuciones externas seguras

### Neutrales

- El pipeline de CI existente esta bien configurado
- El flujo de fork esta documentado en CONTRIBUTING.md

---

## Documentos Relacionados

- [contribution-workflow-research.md](../contribution-workflow-research.md)
- [ADR-COLLAB-2-proposed-configuration.md](./ADR-COLLAB-2-proposed-configuration.md)

---

_Auditoria realizada como parte de la investigacion de la Historia COLLAB-1._
