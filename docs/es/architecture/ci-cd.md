<!-- Traducción: ES | Original: /docs/en/architecture/ci-cd.md | Sincronización: 2026-01-26 -->

# Arquitectura CI/CD

> 🌐 [EN](../../architecture/ci-cd.md) | [PT](../../pt/architecture/ci-cd.md) | **ES**

---

> Historia 6.1: Optimización de Costos de GitHub Actions

## Descripción General

AIOX-Core utiliza GitHub Actions para integración continua y despliegue. Este documento describe la arquitectura de flujos de trabajo optimizada implementada en la Historia 6.1.

## Jerarquía de Flujos de Trabajo

```text
┌─────────────────────────────────────────────────────────────────┐
│                     EVENTOS DE ACTIVACIÓN                       │
├─────────────────────────────────────────────────────────────────┤
│  Pull Request → ci.yml (requerido) + pr-automation.yml (métricas) │
│  Push a main → ci.yml + semantic-release.yml + test.yml        │
│                 + cross-platform (condicional en ci.yml)        │
│  Tag v*       → release.yml → npm-publish.yml                   │
└─────────────────────────────────────────────────────────────────┘
```

**Nota:** Los PRs solo ejecutan ci.yml y pr-automation.yml (~12 trabajos). Las pruebas extendidas (test.yml) se ejecutan solo en push a main.

## Flujos de Trabajo Activos

| Flujo de Trabajo          | Propósito                                          | Activador               | Crítico |
| ------------------------- | -------------------------------------------------- | ----------------------- | ------- |
| `ci.yml`                  | Validación CI principal (lint, typecheck, test)    | PR, push a main         | Sí      |
| `pr-automation.yml`       | Reporte de cobertura y métricas                    | Solo PR                 | No      |
| `semantic-release.yml`    | Versionado automático y changelog                  | Push a main             | Sí      |
| `test.yml`                | Pruebas extendidas (seguridad, build, integración) | Solo push a main        | No      |
| `macos-testing.yml`       | Pruebas específicas de macOS (Intel + ARM)         | Filtrado por ruta       | No      |
| `release.yml`             | Creación de GitHub Release                         | Tag v\*                 | Sí      |
| `npm-publish.yml`         | Publicación de paquete NPM                         | Release publicado       | Sí      |
| `pr-labeling.yml`         | Auto-etiquetado de PRs                             | PR abierto/sincronizado | No      |
| `quarterly-gap-audit.yml` | Auditoría programada                               | Cron                    | No      |
| `welcome.yml`             | Bienvenida a contribuidores nuevos                 | PR                      | No      |

## Estrategias de Optimización

### 1. Control de Concurrencia

Todos los flujos de trabajo usan grupos de concurrencia para prevenir ejecuciones duplicadas:

```yaml
concurrency:
  group: <workflow>-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true  # Para flujos de trabajo CI
  # O
  cancel-in-progress: false  # Para flujos de trabajo de release/publish
```

### 2. Filtros de Ruta

Los flujos de trabajo omiten ejecuciones innecesarias para cambios solo de documentación:

```yaml
paths-ignore:
  - 'docs/**'
  - '*.md'
  - '.aiox/**'
  - 'squads/**'
  - 'LICENSE'
  - '.gitignore'
```

### 3. Pruebas Multiplataforma Condicionales

La matriz multiplataforma (3 SO x 3 versiones de Node = 7 trabajos después de exclusiones) solo se ejecuta en push a main:

```yaml
cross-platform:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
      node: ['18', '20', '22']
      exclude:
        - os: macos-latest
          node: '18' # SIGSEGV de isolated-vm
        - os: macos-latest
          node: '20' # SIGSEGV de isolated-vm
```

### 4. Validación Consolidada

Fuente única de verdad para validación:

- **ci.yml** maneja toda la validación (lint, typecheck, test)
- **semantic-release.yml** depende de la protección de rama (sin CI duplicado)
- **pr-automation.yml** se enfoca solo en métricas/cobertura

## Reducción de Minutos Facturables

| Antes           | Después        | Ahorro |
| --------------- | -------------- | ------ |
| ~340 min/semana | ~85 min/semana | ~75%   |

### Desglose:

- Concurrencia: 40% de reducción (cancela ejecuciones obsoletas)
- Filtros de ruta: 30% de reducción (omite PRs solo de documentación)
- Multiplataforma consolidado: 25% de reducción (7 vs 16 trabajos)
- Flujos de trabajo redundantes eliminados: 5% de reducción

## Estrategia de Ramas

Todos los flujos de trabajo apuntan solo a la rama `main`:

- Sin ramas `master` o `develop`
- Ramas de características → PR a main
- Releases vía semantic-release en main

## Verificaciones de Estado Requeridas

Para protección de rama en `main`:

1. `CI / ESLint`
2. `CI / TypeScript Type Checking`
3. `CI / Jest Tests`
4. `CI / Validation Summary`

## Solución de Problemas

### ¿El flujo de trabajo no se ejecuta?

1. Verifica si las rutas están en `paths-ignore`
2. Verifica que la rama coincida con el activador
3. Verifica el grupo de concurrencia (puede estar cancelado)

### ¿El release no se publica?

1. Verifica que el secreto `NPM_TOKEN` esté configurado
2. Verifica la configuración de semantic-release
3. Verifica el formato de commits convencionales

### ¿Fallan las pruebas de macOS?

- Node 18/20 en macOS tienen problemas de SIGSEGV con isolated-vm
- Solo Node 22 se ejecuta en macOS (por diseño)

## Documentación Relacionada

- [Facturación de GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-github-actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
