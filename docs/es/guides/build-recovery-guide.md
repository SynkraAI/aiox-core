<!--
  Traduccion: ES
  Original: /docs/guides/build-recovery-guide.md
  Ultima sincronizacion: 2026-01-29
-->

# Guia de Recuperacion de Build

> **Story:** 8.4 - Build Recovery & Resume
> **Epic:** Epic 8 - Autonomous Build Engine

---

## Vision General

El sistema de Recuperacion de Build permite que los builds autonomos se reanuden desde checkpoints despues de fallos o interrupciones. En lugar de comenzar de nuevo, los builds continuan desde el ultimo punto exitoso.

---

## Caracteristicas Clave

| Caracteristica               | Descripcion                                       |
| ---------------------------- | ------------------------------------------------- |
| **Checkpoints**              | Auto-guardados despues de cada subtask completada |
| **Resume**                   | Continuar desde el ultimo checkpoint              |
| **Monitoreo de Estado**      | Progreso del build en tiempo real                 |
| **Deteccion de Abandonados** | Alertas para builds inactivos (>1 hora)           |
| **Notificaciones de Fallo**  | Alertas cuando esta atascado o max iteraciones    |
| **Registro de Intentos**     | Historial completo para debugging                 |

---

## Comandos

### Verificar Estado del Build

```bash
# Build individual
*build-status story-8.4

# Todos los builds activos
*build-status --all
```

### Reanudar Build Fallido

```bash
*build-resume story-8.4
```

### Ver Registro de Intentos

```bash
*build-log story-8.4

# Filtrar por subtask
*build-log story-8.4 --subtask 2.1

# Limitar salida
*build-log story-8.4 --limit 20
```

### Limpiar Builds Abandonados

```bash
*build-cleanup story-8.4

# Forzar limpieza (incluso builds activos)
*build-cleanup story-8.4 --force
```

---

## Esquema de Estado del Build

El estado del build se almacena en `plan/build-state.json`:

```json
{
  "storyId": "story-8.4",
  "status": "in_progress",
  "startedAt": "2026-01-29T10:00:00Z",
  "lastCheckpoint": "2026-01-29T11:30:00Z",
  "currentPhase": "phase-2",
  "currentSubtask": "2.3",
  "completedSubtasks": ["1.1", "1.2", "2.1", "2.2"],
  "checkpoints": [...],
  "metrics": {
    "totalSubtasks": 10,
    "completedSubtasks": 4,
    "totalAttempts": 6,
    "totalFailures": 2
  }
}
```

---

## Valores de Estado

| Estado        | Descripcion                    |
| ------------- | ------------------------------ |
| `pending`     | Build creado pero no iniciado  |
| `in_progress` | Build actualmente ejecutandose |
| `paused`      | Build pausado manualmente      |
| `abandoned`   | Sin actividad por >1 hora      |
| `failed`      | Build fallo (puede reanudarse) |
| `completed`   | Build finalizado exitosamente  |

---

## Sistema de Checkpoints

Los checkpoints se guardan automaticamente despues de cada subtask completada:

```
plan/
├── build-state.json        # Archivo de estado principal
├── build-attempts.log      # Registro de intentos
└── checkpoints/            # Snapshots de checkpoints
    ├── cp-lxyz123-abc.json
    ├── cp-lxyz124-def.json
    └── ...
```

Cada checkpoint contiene:

- Timestamp
- ID de Subtask
- Commit de Git (si esta disponible)
- Archivos modificados
- Duracion y conteo de intentos

---

## Integracion con Epic 5

La Recuperacion de Build se integra con el Sistema de Recuperacion (Epic 5):

| Componente            | Uso                           |
| --------------------- | ----------------------------- |
| `stuck-detector.js`   | Detecta fallos circulares     |
| `recovery-tracker.js` | Rastrea historial de intentos |

Cuando los builds quedan atascados (3+ fallos consecutivos), el sistema:

1. Genera sugerencias basadas en patrones de error
2. Crea notificacion para revision humana
3. Marca subtask como "stuck"

---

## Deteccion de Build Abandonado

Los builds se marcan como abandonados si:

- El estado es `in_progress`
- Sin checkpoint por >1 hora (configurable)

Para detectar y manejar:

```bash
# Verificar si esta abandonado
*build-status story-8.4  # Muestra advertencia si esta abandonado

# Limpiar
*build-cleanup story-8.4
```

---

## Uso Programatico

```javascript
const { BuildStateManager, BuildStatus } = require('.aios-core/core/execution/build-state-manager');

// Crear manager
const manager = new BuildStateManager('story-8.4', {
  planDir: './plan',
});

// Crear o cargar estado
const state = manager.loadOrCreateState({ totalSubtasks: 10 });

// Iniciar subtask
manager.startSubtask('1.1', { phase: 'phase-1' });

// Completar subtask (auto-checkpoint)
manager.completeSubtask('1.1', {
  duration: 5000,
  filesModified: ['src/file.js'],
});

// Registrar fallo
const result = manager.recordFailure('1.2', {
  error: 'TypeScript error',
  attempt: 1,
});

// Verificar si esta atascado
if (result.isStuck) {
  console.log('Sugerencias:', result.suggestions);
}

// Reanudar build
const context = manager.resumeBuild();

// Obtener estado
const status = manager.getStatus();
console.log(`Progreso: ${status.progress.percentage}%`);
```

---

## Configuracion

La configuracion por defecto puede ser sobrescrita:

```javascript
const manager = new BuildStateManager('story-8.4', {
  config: {
    maxIterations: 10, // Max intentos por subtask
    globalTimeout: 1800000, // 30 minutos
    abandonedThreshold: 3600000, // 1 hora
    autoCheckpoint: true, // Auto-guardar checkpoints
  },
});
```

---

## Solucion de Problemas

### "No build state found"

El build no ha iniciado aun. Ejecutar `*build story-id` para iniciar.

### "Build already completed"

No se pueden reanudar builds completados. Iniciar un nuevo build si es necesario.

### "Worktree missing"

El worktree aislado fue eliminado. Opciones:

1. Recrear worktree y reanudar
2. Comenzar de nuevo con nuevo build

### Build Atascado

Si el build esta atascado (mismo error repitiendose):

1. Revisar sugerencias en notificaciones
2. Revisar registro de intentos: `*build-log story-id`
3. Intentar enfoque diferente o escalar

---

## Mejores Practicas

1. **Verificar estado regularmente** durante builds largos
2. **Revisar logs** al debuggear fallos
3. **Limpiar builds abandonados** para liberar recursos
4. **Usar checkpoints** - no deshabilitar auto-checkpoint
5. **Monitorear notificaciones** para alertas de atascado

---

_Guia para Story 8.4 - Build Recovery & Resume_
_Parte de Epic 8 - Autonomous Build Engine_
