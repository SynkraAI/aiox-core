<!--
  Traducción: ES
  Original: /docs/en/guides/project-status-feature.md
  Última sincronización: 2026-01-26
-->

# Funcionalidad de Estado del Proyecto - Guía de Usuario

> 🌐 [EN](../../guides/project-status-feature.md) | [PT](../../pt/guides/project-status-feature.md) | **ES**

---

**Funcionalidad:** Contexto Dinámico del Estado del Proyecto para Activación de Agentes
**Versión:** 1.0
**Story:** 6.1.2.4
**Creado:** 2025-01-14

---

## Descripción General

La funcionalidad de Estado del Proyecto muestra automáticamente tu contexto de trabajo actual cuando cualquier agente AIOX se activa. Esto incluye:

- **Rama de Git** en la que estás actualmente
- **Archivos modificados** en tu directorio de trabajo
- **Commits recientes** (últimos 2)
- **Story/Epic actual** (si alguna story está InProgress)

Esto te da contexto inmediato sobre tu trabajo sin ejecutar manualmente `git status` o buscar stories activas.

---

## Ejemplo de Visualización

Cuando activas un agente (ej: `/dev`), verás:

```
💻 Dex (Builder) ready. Let's build something great!

Current Project Status:
  - Branch: main
  - Modified: story-6.1.2.4.md, po.md
  - Recent: chore: cleanup Utils Registry, Phase 4: Open-Source Preparation

Type *help to see available commands!
```

---

## Configuración

### Prerrequisitos

- **Repositorio Git** - El proyecto debe estar inicializado con `git init`
- **Framework AIOX-FullStack** instalado
- **Node.js 18+** con paquetes requeridos

### Configuración Inicial

Ejecuta el comando de inicialización via el agente @devops:

```bash
/devops
*init-project-status
```

Esto:
1. Detecta tu repositorio git
2. Habilita `projectStatus` en `core-config.yaml`
3. Crea el archivo de caché `.aiox/project-status.yaml`
4. Agrega el archivo de caché a `.gitignore`
5. Prueba la visualización del estado

**Configuración Manual Alternativa:**

Si prefieres configuración manual:

1. Editar `.aiox-core/core-config.yaml`:
   ```yaml
   projectStatus:
     enabled: true
     autoLoadOnAgentActivation: true
     showInGreeting: true
     cacheTimeSeconds: 60
   ```

2. Crear directorio `.aiox/`:
   ```bash
   mkdir .aiox
   ```

3. Agregar a `.gitignore`:
   ```gitignore
   .aiox/project-status.yaml
   ```

---

## Configuración

### Opciones Completas de Configuración

Ubicación: `.aiox-core/core-config.yaml`

```yaml
projectStatus:
  enabled: true                      # Habilitar/deshabilitar funcionalidad
  autoLoadOnAgentActivation: true    # Cargar al activar agente
  showInGreeting: true               # Mostrar en saludo
  cacheTimeSeconds: 60               # TTL del caché (segundos)
  components:                        # Alternar componentes individuales
    gitBranch: true                  # Mostrar nombre de rama
    gitStatus: true                  # Mostrar archivos modificados
    recentWork: true                 # Mostrar commits recientes
    currentEpic: true                # Mostrar epic actual
    currentStory: true               # Mostrar story actual
  statusFile: .aiox/project-status.yaml  # Ubicación del archivo de caché
  maxModifiedFiles: 5                # Límite de archivos modificados mostrados
  maxRecentCommits: 2                # Límite de commits mostrados
```

### Ejemplos de Personalización

**Mostrar solo rama y story:**
```yaml
projectStatus:
  enabled: true
  components:
    gitBranch: true
    gitStatus: false      # Ocultar archivos modificados
    recentWork: false     # Ocultar commits
    currentEpic: false
    currentStory: true
```

**Aumentar TTL de caché a 5 minutos:**
```yaml
projectStatus:
  cacheTimeSeconds: 300
```

**Mostrar más commits y archivos:**
```yaml
projectStatus:
  maxModifiedFiles: 10
  maxRecentCommits: 5
```

---

## Cómo Funciona

### Recolección de Estado

Cuando un agente se activa, el sistema:

1. **Verifica caché** - Busca `.aiox/project-status.yaml`
2. **Valida TTL** - ¿El caché tiene menos de 60 segundos?
3. **Retorna cacheado** - Si es válido, usa estado cacheado (rápido)
4. **Genera fresco** - Si expiró, ejecuta comandos git y escanea stories
5. **Actualiza caché** - Guarda nuevo estado para próxima activación

### Comandos Git Utilizados

```bash
# Check if git repo
git rev-parse --is-inside-work-tree

# Get branch (modern git >= 2.22)
git branch --show-current

# Get branch (fallback for older git)
git rev-parse --abbrev-ref HEAD

# Get modified files
git status --porcelain

# Get recent commits
git log -2 --oneline --no-decorate
```

### Detección de Story

Escanea `docs/stories/` buscando archivos que contengan:
```markdown
**Status:** InProgress
**Story ID:** STORY-X.Y.Z
**Epic:** Epic X.Y - Name
```

Solo muestra stories con status: `InProgress` o `In Progress`.

---

## Rendimiento

### Benchmarks

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| **Primera Carga** | 80-100ms | Ejecuta comandos git + escaneo de archivos |
| **Carga Cacheada** | 5-10ms | Lee YAML del caché |
| **Cache Miss** | 80-100ms | TTL expirado, regenera |
| **Overhead del Agente** | <100ms | Agregado al tiempo de activación |

### Estrategia de Caché

- **TTL del Caché:** 60 segundos (configurable)
- **Ubicación del Caché:** `.aiox/project-status.yaml`
- **Formato del Caché:** YAML con objeto de estado + timestamp
- **Invalidación:** Automática después de que expira el TTL

**¿Por qué 60 segundos?**
- Suficientemente largo para evitar llamadas git repetidas durante cambio de agentes
- Suficientemente corto para reflejar cambios recientes
- Balance óptimo entre rendimiento y frescura

---

## Agentes Afectados

Los 11 agentes AIOX muestran estado del proyecto:

1. **@dev** (Dex - Builder)
2. **@po** (Pax - Balancer)
3. **@qa** (Quinn - Guardian)
4. **@sm** (River - Facilitator)
5. **@pm** (Morgan - Strategist)
6. **@architect** (Aria - Visionary)
7. **@analyst** (Atlas - Decoder)
8. **@devops** (Gage - Operator)
9. **@data-engineer** (Dara - Sage)
10. **@ux-design-expert** (Uma - Empathizer)
11. **@aiox-master** (Orion - Orchestrator)

---

## Solución de Problemas

### Estado No Se Muestra

**Síntoma:** El agente se activa sin mostrar estado

**Verificar:**
1. ¿`projectStatus.enabled: true` en core-config.yaml?
2. ¿Es un repositorio git? (`git rev-parse --is-inside-work-tree`)
3. ¿Existe `.aiox-core/infrastructure/scripts/project-status-loader.js`?
4. ¿Hay errores en la salida de activación del agente?

**Solución:**
```bash
# Re-run initialization
/devops
*init-project-status
```

### Datos de Estado Obsoletos

**Síntoma:** El estado muestra datos antiguos

**Causa:** El caché no se invalida correctamente

**Solución:**
```bash
# Manually clear cache
rm .aiox/project-status.yaml

# Or restart agent session
```

### Comandos Git Fallan

**Síntoma:** La rama muestra "unknown", archivos faltantes

**Verificar:**
1. ¿Git está en PATH? (`git --version`)
2. ¿La versión de git es >= 2.0? (2.22+ recomendado)
3. ¿Repositorio corrupto? (`git fsck`)

**Fallback:** El sistema usa comandos git más antiguos automáticamente si los comandos modernos fallan.

### Problemas de Rendimiento

**Síntoma:** Activación del agente > 200ms consistentemente

**Causa:** Repositorio grande o I/O de disco lento

**Solución:**
```yaml
# Reduce data collected
projectStatus:
  maxModifiedFiles: 3    # Default: 5
  maxRecentCommits: 1     # Default: 2
  components:
    recentWork: false     # Disable commits
```

### Proyectos Sin Git

**Comportamiento Esperado:**
```
Current Project Status:
  (Not a git repository)
```

Esto es normal e inofensivo. Los agentes funcionan normalmente sin git.

---

## Uso Avanzado

### Deshabilitar para Agentes Específicos

Actualmente, el estado se muestra en todos los agentes. Para deshabilitar globalmente:

```yaml
projectStatus:
  enabled: false
```

*Nota: Deshabilitar por agente aún no está implementado (ver Mejoras Futuras).*

### Ubicación Personalizada del Archivo de Estado

```yaml
projectStatus:
  statusFile: .custom/my-status.yaml
```

No olvides actualizar `.gitignore`.

### Acceso Programático

```javascript
const { loadProjectStatus, formatStatusDisplay } = require('./.aiox-core/infrastructure/scripts/project-status-loader.js');

// Get raw status object
const status = await loadProjectStatus();
console.log(status);

// Get formatted display string
const display = formatStatusDisplay(status);
console.log(display);

// Clear cache manually
const { clearCache } = require('./.aiox-core/infrastructure/scripts/project-status-loader.js');
await clearCache();
```

---

## Rollback

### Deshabilitar Funcionalidad

1. **Editar config:**
   ```yaml
   projectStatus:
     enabled: false
   ```

2. **Limpiar caché:**
   ```bash
   rm .aiox/project-status.yaml
   ```

3. **Reiniciar agentes** - Nuevas activaciones no mostrarán estado

### Eliminación Completa

Para eliminar completamente la funcionalidad:

```bash
# Remove script
rm .aiox-core/infrastructure/scripts/project-status-loader.js

# Remove task
rm .aiox-core/tasks/init-project-status.md

# Remove cache
rm .aiox/project-status.yaml

# Remove tests
rm .aiox-core/infrastructure/scripts/__tests__/project-status-loader.test.js

# Remove config section from core-config.yaml
# (manually edit file)

# Revert agent files to pre-6.1.2.4 state
git revert <commit-hash>
```

---

## Compatibilidad de Versión de Git

### Recomendado: git >= 2.22

Usa comando moderno:
```bash
git branch --show-current
```

### Soportado: git >= 2.0

Fallback a:
```bash
git rev-parse --abbrev-ref HEAD
```

### Mínimo: git 2.0+

Versiones más antiguas pueden funcionar pero no están probadas.

**Verifica tu versión:**
```bash
git --version
```

---

## Mejoras Futuras

Mejoras potenciales (aún no implementadas):

- [ ] Toggle de estado por agente (ej: deshabilitar solo para @qa)
- [ ] Indicadores de estado con colores (verde limpio, amarillo modificado, rojo conflictos)
- [ ] Porcentaje de progreso de story (tareas completadas / total)
- [ ] Tiempo estimado para completar story actual
- [ ] Detección de múltiples stories (mostrar todas las InProgress)
- [ ] Componentes de estado personalizados via plugins
- [ ] Observación de archivos en tiempo real (eliminar delay de caché)

---

## Preguntas Frecuentes

**P: ¿Esto ralentizará la activación del agente?**
R: La carga inicial agrega ~100ms. Las cargas cacheadas agregan ~10ms. Esto es mínimo y vale la pena por el beneficio del contexto.

**P: ¿Puedo deshabilitar para agentes específicos?**
R: Aún no. Puedes deshabilitar globalmente via `projectStatus.enabled: false`.

**P: ¿Qué pasa si no estoy usando git?**
R: El estado muestra "(Not a git repository)" y los agentes funcionan normalmente.

**P: ¿Con qué frecuencia se actualiza el estado?**
R: Cada 60 segundos por defecto (configurable via `cacheTimeSeconds`).

**P: ¿Esto funciona en Windows/Linux/macOS?**
R: Sí, probado en todas las plataformas.

**P: ¿Puedo personalizar el formato del estado?**
R: Aún no. El formato está fijo en `project-status-loader.js:formatStatusDisplay()`.

**P: ¿El caché se comparte entre agentes?**
R: Sí, todos los agentes usan el mismo archivo de caché (`.aiox/project-status.yaml`).

---

## Documentación Relacionada

- **Story:** `docs/stories/aiox migration/story-6.1.2.4-project-status-context.md`
- **Config:** `.aiox-core/core-config.yaml` (sección projectStatus)
- **Script:** `.aiox-core/infrastructure/scripts/project-status-loader.js`
- **Init Task:** `.aiox-core/tasks/init-project-status.md`
- **Tests:** `.aiox-core/infrastructure/scripts/__tests__/project-status-loader.test.js`

---

**Versión:** 1.0
**Estado:** Listo para Producción
**Última Actualización:** 2025-01-14
