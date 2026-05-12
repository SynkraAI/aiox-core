<!-- Traducción: ES | Original: /docs/en/architecture/hcs-execution-modes.md | Sincronización: 2026-01-26 -->

# Especificación de Modos de Ejecución HCS

> 🌐 [EN](../../architecture/hcs-execution-modes.md) | [PT](../../pt/architecture/hcs-execution-modes.md) | **ES**

---

**Versión:** 1.0
**Estado:** Propuesto
**Creado:** 2025-12-30
**Historia:** Investigación HCS-1
**Autor:** @architect (Aria) vía @dev (Dex)

---

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Hallazgos de Investigación](#hallazgos-de-investigación)
- [Matriz de Comparación de Modos de Ejecución](#matriz-de-comparación-de-modos-de-ejecución)
- [Configuración Recomendada](#configuración-recomendada)
- [Especificaciones de Modos](#especificaciones-de-modos)
- [Directrices de Implementación](#directrices-de-implementación)

---

## Resumen Ejecutivo

Este documento define los modos de ejecución para el Sistema de Verificación de Salud de AIOX (HCS), basado en investigación de mejores prácticas de la industria de Kubernetes, VS Code, Terraform, npm/yarn, y patrones CLI "doctor" (Flutter, Homebrew, WP-CLI).

### Recomendaciones Clave

1. **Modo Principal:** Manual bajo demanda (comando `*health-check`)
2. **Modo Secundario:** Integración CI programada (trigger post-merge)
3. **Modo Opcional:** Verificaciones en segundo plano del IDE (para usuarios avanzados)
4. **NO Recomendado:** Hooks pre-commit (muy lentos, crean fricción)

---

## Hallazgos de Investigación

### Patrones de la Industria Analizados

| Sistema                     | Patrón de Verificación de Salud         | Disparador               | Hallazgo Clave                                              |
| --------------------------- | --------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| **Kubernetes**              | Sondas de Liveness/Readiness/Startup    | Periódico (configurable) | Diferenciar entre "vivo" y "listo para servir"              |
| **VS Code**                 | Bisección de extensiones, integridad    | Bajo demanda + fondo     | Aislamiento previene fallas en cascada                      |
| **Terraform**               | Detección de drift con `terraform plan` | Manual + CI programado   | Detectar vs. remediar son pasos separados                   |
| **npm/yarn**                | Integridad de lockfile, `npm audit`     | Al instalar + manual     | Hashes criptográficos previenen manipulación                |
| **Flutter/Homebrew doctor** | Comando CLI `doctor`                    | Bajo demanda             | Salida categorizada (✅ ⚠️ ❌) con correcciones accionables |

### Lecciones Clave Aprendidas

1. **Patrón de Sondas Kubernetes:**
   - Liveness: "¿Está vivo?" → Reiniciar si está muerto
   - Readiness: "¿Puede servir tráfico?" → Remover del balanceador si no está listo
   - Startup: "¿Ha terminado de iniciar?" → Deshabilitar otras sondas hasta que esté listo
   - **Aplicable a HCS:** Usar diferentes categorías de verificación con niveles de severidad apropiados

2. **Patrón de Extensiones VS Code:**
   - Extensiones corren en proceso aislado → falla no colapsa VS Code
   - Verificaciones de integridad en segundo plano detectan instalaciones corruptas
   - Extensiones maliciosas se auto-remueven vía lista de bloqueo
   - **Aplicable a HCS:** Auto-reparación no debe arriesgar estabilidad del sistema

3. **Patrón de Drift Terraform:**
   - `terraform plan` detecta drift sin modificar
   - Remediación es un paso separado con `terraform apply`
   - Plans programados en CI proporcionan monitoreo continuo
   - **Aplicable a HCS:** Detección y remediación deben ser pasos separados y controlables

4. **Patrón de Integridad npm/yarn:**
   - Hashes criptográficos en lockfile verifican integridad de paquetes
   - `npm audit` corre separadamente de install
   - `--update-checksums` permite recuperación controlada
   - **Aplicable a HCS:** Respaldos antes de cualquier modificación de auto-reparación

5. **Patrón CLI Doctor (Flutter, Homebrew, WP-CLI):**
   - Ejecución bajo demanda, no bloquea flujos de trabajo
   - Salida categorizada: éxito, advertencia, error
   - Sugerencias accionables con comandos para copiar y pegar
   - Extensible vía verificaciones personalizadas (WP-CLI `doctor.yml`)
   - **Aplicable a HCS:** Modelo de ejecución principal

---

## Matriz de Comparación de Modos de Ejecución

| Modo                         | Disparador         | Duración | Impacto UX               | Caso de Uso                 | Recomendación     |
| ---------------------------- | ------------------ | -------- | ------------------------ | --------------------------- | ----------------- |
| **Manual** (`*health-check`) | Comando de usuario | 10-60s   | Ninguno (usuario inicia) | Diagnóstico bajo demanda    | ✅ **Principal**  |
| **Hook pre-commit**          | `git commit`       | 10-30s   | Alta fricción            | Detectar problemas temprano | ❌ No recomendado |
| **Hook post-commit**         | Después de commit  | 10-60s   | Fricción media           | Validación local            | ⚠️ Opcional       |
| **CI Programado**            | Cron/workflow      | 60-300s  | Ninguno                  | Monitoreo continuo          | ✅ **Secundario** |
| **Trigger post-merge**       | Merge de PR        | 60-120s  | Ninguno                  | Validación post-cambio      | ✅ **Terciario**  |
| **Fondo IDE**                | Guardar/intervalo  | 5-15s    | Indicadores sutiles      | Feedback en tiempo real     | ⚠️ Solo avanzados |
| **Al instalar/bootstrap**    | `npx aiox install` | 60-120s  | Esperado                 | Validación de setup         | ✅ **Requerido**  |

### Evaluación Detallada

#### ✅ Manual (`*health-check`) - PRINCIPAL

**Pros:**

- Controlado por usuario, sin fricción en flujo de trabajo
- Capacidad de diagnóstico completa
- Soporta todos los modos (rápido, completo, específico de dominio)
- Sigue patrón doctor de Flutter/Homebrew

**Contras:**

- Puede olvidarse
- Reactivo en lugar de proactivo

**Veredicto:** Modo de ejecución principal. Siempre disponible vía comando `*health-check`.

#### ❌ Hook Pre-commit - NO RECOMENDADO

**Pros:**

- Detecta problemas antes del commit
- Feedback inmediato

**Contras:**

- Retraso de 10-30s en cada commit es inaceptable
- Desarrolladores lo saltarán con `--no-verify`
- Crea fricción en desarrollo de ritmo rápido
- Lección de Kubernetes: No mezclar "liveness" con "readiness"

**Veredicto:** No implementar. Pre-commit debe reservarse para verificaciones rápidas (<5s).

#### ⚠️ Hook Post-commit - OPCIONAL

**Pros:**

- No bloquea (corre después del commit)
- Ciclo de feedback local

**Contras:**

- Aún añade retraso al flujo de trabajo
- Resultados pueden ignorarse
- Sin capacidad de prevenir commits malos

**Veredicto:** Opcional para usuarios avanzados. No habilitado por defecto.

#### ✅ CI Programado - SECUNDARIO

**Pros:**

- Monitoreo continuo sin fricción para desarrollador
- Patrón Terraform: "terraform plan" en horario
- Detecta drift con el tiempo
- Datos históricos de tendencias

**Contras:**

- Feedback retrasado
- Requiere infraestructura CI

**Veredicto:** Modo secundario recomendado. Ejecución diaria programada en CI.

**Ejemplo de workflow GitHub Actions:**

```yaml
name: Health Check (Programado)
on:
  schedule:
    - cron: '0 6 * * *' # Diario a las 6 AM
  workflow_dispatch: # Trigger manual

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx aiox health-check --mode=full --report
      - uses: actions/upload-artifact@v4
        with:
          name: health-report
          path: .aiox/reports/health-check-*.md
```

#### ✅ Trigger Post-merge - TERCIARIO

**Pros:**

- Timing inteligente: después de que aterrizan cambios
- No bloquea al autor del PR
- Valida salud de integración

**Contras:**

- Feedback retrasado
- Puede perder problemas en desarrollo

**Veredicto:** Recomendado para rama main. Se dispara después del merge de PR.

#### ⚠️ Fondo IDE - SOLO USUARIOS AVANZADOS

**Pros:**

- Feedback en tiempo real
- Mejor UX posible mientras se trabaja

**Contras:**

- Complejo de implementar
- Puede impactar rendimiento del IDE
- Lección VS Code: Aislamiento de extensiones es crucial

**Veredicto:** Opcional para usuarios avanzados. Requiere implementación cuidadosa para evitar problemas de rendimiento.

#### ✅ Al Instalar/Bootstrap - REQUERIDO

**Pros:**

- Valida que el entorno está correctamente configurado
- Experiencia de primera ejecución
- Detecta dependencias faltantes inmediatamente

**Contras:**

- Solo una vez

**Veredicto:** Requerido. Parte de `npx aiox install` y `*bootstrap-setup`.

---

## Configuración Recomendada

### Configuración Por Defecto

```yaml
# .aiox-core/core-config.yaml
healthCheck:
  enabled: true

  modes:
    # Principal: Manual bajo demanda
    manual:
      enabled: true
      command: '*health-check'
      defaultMode: 'quick' # quick | full | domain
      autoFix: true # Habilitar auto-reparación por defecto

    # Secundario: CI programado
    scheduled:
      enabled: true
      frequency: 'daily' # daily | weekly | on-push
      ciProvider: 'github-actions' # github-actions | gitlab-ci | none
      mode: 'full'
      reportArtifact: true

    # Terciario: Post-merge
    postMerge:
      enabled: true
      branches: ['main', 'develop']
      mode: 'quick'

    # Opcional: Fondo IDE
    ideBackground:
      enabled: false # Solo opt-in
      interval: 300 # segundos (5 minutos)
      mode: 'quick'

    # Opcional: Post-commit
    postCommit:
      enabled: false # Solo opt-in
      mode: 'quick'

    # Requerido: Al instalar
    onInstall:
      enabled: true
      mode: 'full'
      failOnCritical: true

  performance:
    quickModeTimeout: 10 # segundos
    fullModeTimeout: 60 # segundos
    parallelChecks: true
    cacheResults: true
    cacheTTL: 300 # segundos
```

### Configuración de Modos

| Configuración         | Modo Rápido       | Modo Completo        | Modo Dominio             |
| --------------------- | ----------------- | -------------------- | ------------------------ |
| **Checks ejecutados** | Solo críticos     | Todos los checks     | Dominio específico       |
| **Duración objetivo** | <10 segundos      | <60 segundos         | <30 segundos             |
| **Auto-reparación**   | Solo Nivel 1      | Todos los niveles    | Específico del dominio   |
| **Detalle reporte**   | Resumen           | Reporte completo     | Reporte de dominio       |
| **Caso de uso**       | Validación rápida | Diagnóstico profundo | Troubleshooting dirigido |

---

## Especificaciones de Modos

### 1. Modo Manual (`*health-check`)

```bash
# Verificación rápida (por defecto)
*health-check

# Verificación completa exhaustiva
*health-check --mode=full

# Verificación específica de dominio
*health-check --domain=repository

# Deshabilitar auto-reparación
*health-check --no-fix

# Generar solo reporte
*health-check --report-only
```

**Parámetros:**

| Parámetro            | Valores                                | Defecto | Descripción                     |
| -------------------- | -------------------------------------- | ------- | ------------------------------- |
| `--mode`             | quick, full, domain                    | quick   | Exhaustividad de verificación   |
| `--domain`           | project, local, repo, deploy, services | all     | Filtro de dominio               |
| `--fix` / `--no-fix` | boolean                                | true    | Habilitar auto-reparación       |
| `--report`           | boolean                                | true    | Generar reporte markdown        |
| `--json`             | boolean                                | false   | Salida JSON para automatización |
| `--verbose`          | boolean                                | false   | Mostrar salida detallada        |

### 2. Modo CI Programado

**Integración GitHub Actions:**

```yaml
# .github/workflows/health-check.yml
name: AIOX Health Check

on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC diario
  workflow_dispatch:
    inputs:
      mode:
        description: 'Modo de verificación'
        required: false
        default: 'full'
        type: choice
        options:
          - quick
          - full

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run Health Check
        run: |
          npx aiox health-check \
            --mode=${{ inputs.mode || 'full' }} \
            --report \
            --json

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: health-check-report-${{ github.run_id }}
          path: .aiox/reports/

      - name: Post to Slack (on failure)
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ AIOX Health Check Falló",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Health check detectó problemas. <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|Ver Reporte>"
                  }
                }
              ]
            }
```

### 3. Trigger Post-Merge

```yaml
# Agregar al workflow CI existente
on:
  push:
    branches: [main, develop]

jobs:
  post-merge-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx aiox health-check --mode=quick
```

### 4. Modo Fondo IDE (Opcional)

**Integración VS Code (futuro):**

```json
// .vscode/settings.json
{
  "aiox.healthCheck.enabled": true,
  "aiox.healthCheck.interval": 300,
  "aiox.healthCheck.mode": "quick",
  "aiox.healthCheck.showNotifications": true
}
```

**Indicador de Barra de Estado:**

- 🟢 Saludable (puntaje > 80)
- 🟡 Degradado (puntaje 50-80)
- 🔴 No saludable (puntaje < 50)

---

## Directrices de Implementación

### Orden de Prioridad

1. **Fase 1 (HCS-2):** Modo manual + Modo al instalar
2. **Fase 2 (HCS-3):** Integración CI programada
3. **Fase 3 (Futuro):** Modo fondo IDE, hooks post-commit

### Objetivos de Rendimiento

| Modo     | Duración Objetivo | Duración Máxima |
| -------- | ----------------- | --------------- |
| Rápido   | 5 segundos        | 10 segundos     |
| Completo | 30 segundos       | 60 segundos     |
| Dominio  | 10 segundos       | 30 segundos     |

### Estrategia de Caché

Basado en patrón Terraform:

```javascript
// Cachear verificaciones costosas
const checkCache = new Map();
const CACHE_TTL = 300000; // 5 minutos

async function runCheck(check) {
  const cacheKey = `${check.id}-${check.inputs.hash}`;
  const cached = checkCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const result = await check.execute();
  checkCache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}
```

### Ejecución Paralela

Basado en patrón Kubernetes (ejecutar verificaciones independientes concurrentemente):

```javascript
// Agrupar verificaciones por dependencia
const checkGroups = [
  ['project', 'local'], // Independientes, ejecutar en paralelo
  ['repository', 'services'], // Independientes, ejecutar en paralelo
  ['deploy'], // Puede depender de otros
];

async function runAllChecks() {
  const results = {};

  for (const group of checkGroups) {
    const groupResults = await Promise.all(group.map((domain) => runDomainChecks(domain)));
    Object.assign(results, ...groupResults);
  }

  return results;
}
```

---

## Documentos Relacionados

- [ADR: Arquitectura HCS](./adr/adr-hcs-health-check-system.md)
- [Especificación de Auto-reparación HCS](./hcs-self-healing-spec.md)
- [Especificaciones de Verificaciones HCS](./hcs-check-specifications.md)

---

## Fuentes de Investigación

- [Kubernetes Health Probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
- [Terraform Drift Detection](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift)
- [npm Lockfile Integrity](https://medium.com/node-js-cybersecurity/lockfile-poisoning-and-how-hashes-verify-integrity-in-node-js-lockfiles)
- [VS Code Extension Health](https://code.visualstudio.com/blogs/2021/02/16/extension-bisect)
- [Flutter Doctor Pattern](https://quickcoder.org/flutter-doctor/)
- [WP-CLI Doctor Command](https://github.com/wp-cli/doctor-command)

---

_Documento creado como parte de la Historia HCS-1 Investigación_
