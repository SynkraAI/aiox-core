<!--
  Traduccion: ES
  Original: /docs/en/guides/squad-migration.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Migracion de Squad

> 🌐 [EN](../../guides/squad-migration.md) | [PT](../../pt/guides/squad-migration.md) | **ES**

---

Como migrar squads legacy al formato AIOX 2.1.

## Descripcion General

AIOX 2.1 introdujo un nuevo formato de squad con:

- Arquitectura task-first
- Validacion con JSON Schema
- Distribucion de tres niveles
- Manifiesto estandarizado (`squad.yaml`)

Los squads legacy que usan `config.yaml` o formatos antiguos necesitan migracion.

## Detectando Squads Legacy

### Senales de Formato Legacy

| Indicador             | Legacy        | Actual (2.1+)              |
| --------------------- | ------------- | -------------------------- |
| Archivo de manifiesto | `config.yaml` | `squad.yaml`               |
| Campo de tipo AIOX    | Faltante      | `aiox.type: squad`         |
| Version minima        | Faltante      | `aiox.minVersion: "2.1.0"` |
| Estructura            | Agent-first   | Task-first                 |

### Comando de Verificacion

```bash
@squad-creator
*validate-squad ./squads/legacy-squad
```

La salida indicara si se necesita migracion:

```
⚠️ Formato legacy detectado (config.yaml)
   Ejecutar: *migrate-squad ./squads/legacy-squad
```

## Comando de Migracion

### Vista Previa de Cambios (Recomendado Primero)

```bash
@squad-creator
*migrate-squad ./squads/legacy-squad --dry-run
```

Muestra lo que cambiara sin modificar archivos.

### Ejecutar Migracion

```bash
*migrate-squad ./squads/legacy-squad
```

### Salida Detallada

```bash
*migrate-squad ./squads/legacy-squad --verbose
```

Muestra el progreso detallado paso a paso.

## Que se Migra

### 1. Renombrado de Manifiesto

```
config.yaml → squad.yaml
```

### 2. Campos Agregados

```yaml
# Estos campos se agregan si faltan
aiox:
  minVersion: '2.1.0'
  type: squad
```

### 3. Normalizacion de Estructura

Los componentes se reorganizan en la estructura estandar:

```
Antes:
├── config.yaml
├── my-agent.yaml
└── my-task.yaml

Despues:
├── squad.yaml
├── agents/
│   └── my-agent.md
└── tasks/
    └── my-task.md
```

### 4. Conversion de Formato de Archivos

Los archivos YAML de agentes se convierten a formato Markdown:

```yaml
# Antes: my-agent.yaml
name: my-agent
role: Helper
```

```markdown
# Despues: agents/my-agent.md

# my-agent

ACTIVATION-NOTICE: ...

\`\`\`yaml
agent:
name: my-agent
...
\`\`\`
```

## Escenarios de Migracion

### Escenario 1: Squad Simple (solo config.yaml)

**Antes:**

```
my-squad/
├── config.yaml
└── README.md
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Despues:**

```
my-squad/
├── squad.yaml         # Renombrado + actualizado
├── README.md
└── .backup/           # Respaldo creado
    └── pre-migration-2025-12-26/
```

### Escenario 2: Squad con Agentes YAML

**Antes:**

```
my-squad/
├── config.yaml
├── agent.yaml
└── task.yaml
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Despues:**

```
my-squad/
├── squad.yaml
├── agents/
│   └── agent.md       # Convertido a MD
├── tasks/
│   └── task.md        # Convertido a MD
└── .backup/
```

### Escenario 3: Migracion Parcial (Ya Tiene Algunas Caracteristicas 2.1)

**Antes:**

```
my-squad/
├── squad.yaml         # Ya renombrado
├── agent.yaml         # Aun formato YAML
└── tasks/
    └── task.md        # Ya formato MD
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Resultado:**

- Agrega campos `aiox` faltantes al manifiesto
- Convierte archivos YAML restantes
- Omite archivos ya migrados

## Respaldo y Rollback

### Respaldo Automatico

Cada migracion crea un respaldo:

```
.backup/
└── pre-migration-{timestamp}/
    ├── config.yaml    # Manifiesto original
    ├── agent.yaml     # Archivos originales
    └── ...
```

### Rollback Manual

```bash
# Listar respaldos
ls ./squads/my-squad/.backup/

# Restaurar respaldo especifico
cp -r ./squads/my-squad/.backup/pre-migration-2025-12-26/. ./squads/my-squad/
```

### Rollback Programatico

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');

const migrator = new SquadMigrator();
await migrator.rollback('./squads/my-squad');
```

## Solucion de Problemas

### "Manifest not found"

```
Error: No manifest found (config.yaml or squad.yaml)
```

**Solucion:** Crear un manifiesto basico:

```yaml
# squad.yaml
name: my-squad
version: 1.0.0
description: Mi squad

aiox:
  minVersion: '2.1.0'
  type: squad

components:
  agents: []
  tasks: []
```

### "Invalid YAML syntax"

```
Error: YAML parse error at line 15
```

**Solucion:**

1. Verificar sintaxis YAML con un validador
2. Problemas comunes: tabs (usar espacios), comillas faltantes
3. Corregir errores, luego reintentar migracion

### "Backup failed"

```
Error: Could not create backup directory
```

**Solucion:**

1. Verificar permisos de escritura: `chmod 755 ./squads/my-squad`
2. Verificar espacio en disco
3. Intentar con sudo (si es apropiado)

### "Migration incomplete"

```
Warning: Some files could not be migrated
```

**Solucion:**

1. Ejecutar con `--verbose` para ver que archivos fallaron
2. Corregir manualmente los archivos problematicos
3. Re-ejecutar migracion

## Lista de Verificacion Post-Migracion

Despues de la migracion, verificar:

- [ ] `squad.yaml` existe y es valido
- [ ] `aiox.type` es `"squad"`
- [ ] `aiox.minVersion` es `"2.1.0"` o superior
- [ ] Todos los agentes estan en carpeta `agents/`
- [ ] Todas las tareas estan en carpeta `tasks/`
- [ ] Archivos de agentes estan en formato Markdown
- [ ] Archivos de tareas siguen TASK-FORMAT-SPEC-V1
- [ ] La validacion pasa: `*validate-squad --strict`

## Migracion Programatica

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');

const migrator = new SquadMigrator({
  verbose: true,
  dryRun: false,
  backupDir: '.backup',
});

// Verificar si se necesita migracion
const needsMigration = await migrator.needsMigration('./squads/my-squad');

// Ejecutar migracion
const result = await migrator.migrate('./squads/my-squad');

console.log(result);
// {
//   success: true,
//   changes: ['config.yaml → squad.yaml', ...],
//   backupPath: '.backup/pre-migration-...'
// }
```

## Recursos Relacionados

- [Guia de Desarrollo de Squad](./squads-guide.md)
- [Guia de Contribucion de Squads](./contributing-squads.md)
- [Agente @squad-creator](../../../.aiox-core/development/agents/squad-creator.md)

---

**Version:** 1.0.0 | **Actualizado:** 2025-12-26 | **Story:** SQS-8
