<!--
  Traduccion: ES
  Original: /docs/guides/permission-modes.md
  Ultima sincronizacion: 2026-01-29
-->

# Guia de Modos de Permisos

> Controla cuanta autonomia tienen los agentes AIOX sobre tu sistema.

---

## Vision General

Los Modos de Permisos te permiten controlar el nivel de autonomia que tienen los agentes AIOX. Ya sea que estes explorando un nuevo codebase o ejecutando builds completamente autonomos, hay un modo para tu flujo de trabajo.

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 EXPLORE         │  ⚠️ ASK             │  ⚡ AUTO           │
│  Navegacion segura  │  Confirmar cambios  │  Autonomia total  │
├─────────────────────────────────────────────────────────────┤
│  Read: ✅            │  Read: ✅            │  Read: ✅          │
│  Write: ❌           │  Write: ⚠️ confirmar│  Write: ✅         │
│  Execute: ❌         │  Execute: ⚠️ confirm│  Execute: ✅       │
│  Delete: ❌          │  Delete: ⚠️ confirmar│  Delete: ✅        │
└─────────────────────────────────────────────────────────────┘
```

---

## Inicio Rapido

```bash
# Verificar modo actual
*mode

# Cambiar a modo explore (seguro)
*mode explore

# Cambiar a modo ask (equilibrado - por defecto)
*mode ask

# Cambiar a modo auto (yolo)
*mode auto
# o
*yolo
```

---

## Modos Explicados

### 🔍 Modo Explore

**Mejor para:** Primera exploracion, aprender un codebase, auditorias de solo lectura

```
*mode explore
```

En modo Explore:

- ✅ Leer cualquier archivo
- ✅ Buscar en el codebase
- ✅ Ejecutar comandos de solo lectura (git status, ls, etc.)
- ❌ No puede escribir o editar archivos
- ❌ No puede ejecutar comandos potencialmente destructivos
- ❌ No puede ejecutar operaciones de build/deploy

**Ejemplos de operaciones bloqueadas:**

- Herramientas `Write` / `Edit`
- `git push`, `git commit`
- `npm install`
- `rm`, `mv`, `mkdir`

---

### ⚠️ Modo Ask (Por Defecto)

**Mejor para:** Desarrollo diario, equilibrio entre seguridad y productividad

```
*mode ask
```

En modo Ask:

- ✅ Leer cualquier archivo
- ⚠️ Operaciones de escritura requieren confirmacion
- ⚠️ Operaciones de ejecucion requieren confirmacion
- ⚠️ Operaciones destructivas requieren aprobacion explicita

**Flujo de confirmacion:**

```
⚠️ Confirmacion Requerida

Operacion: write
Herramienta: Edit

Archivo: `src/components/Button.tsx`

[Proceder] [Omitir] [Cambiar a Auto]
```

---

### ⚡ Modo Auto

**Mejor para:** Usuarios avanzados, builds autonomos, flujos de trabajo confiables

```
*mode auto
# o
*yolo
```

En modo Auto:

- ✅ Acceso completo de lectura
- ✅ Acceso completo de escritura
- ✅ Acceso completo de ejecucion
- ✅ Sin confirmaciones requeridas

**Advertencia:** Usar con precaucion. El agente puede modificar y eliminar archivos sin preguntar.

---

## Indicador de Modo

Tu modo actual siempre es visible en el saludo del agente:

```
🏛️ Aria (Architect) listo! [⚠️ Ask]

Comandos Rapidos:
...
```

La insignia muestra:

- `[🔍 Explore]` - Modo solo lectura
- `[⚠️ Ask]` - Modo confirmacion (por defecto)
- `[⚡ Auto]` - Modo autonomia total

---

## Configuracion

El modo se persiste en `.aiox/config.yaml`:

```yaml
permissions:
  mode: ask # explore | ask | auto
```

---

## Clasificacion de Operaciones

El sistema clasifica las operaciones en 4 tipos:

| Tipo        | Ejemplos                                        |
| ----------- | ----------------------------------------------- |
| **read**    | `Read`, `Glob`, `Grep`, `git status`, `ls`      |
| **write**   | `Write`, `Edit`, `mkdir`, `touch`, `git commit` |
| **execute** | `npm install`, `npm run`, ejecucion de tasks    |
| **delete**  | `rm`, `git reset --hard`, `DROP TABLE`          |

### Comandos Seguros (Siempre Permitidos)

Estos comandos siempre estan permitidos, incluso en modo Explore:

```bash
# Git (solo lectura)
git status, git log, git diff, git branch

# Sistema de archivos (solo lectura)
ls, pwd, cat, head, tail, wc, find, grep

# Informacion de paquetes
npm list, npm outdated, npm audit

# Informacion del sistema
node --version, npm --version, uname, whoami
```

### Comandos Destructivos (Precaucion Extra)

Estos activan la clasificacion de delete y requieren aprobacion explicita incluso en modo Ask:

```bash
rm -rf
git reset --hard
git push --force
DROP TABLE
DELETE FROM
TRUNCATE
```

---

## Integracion con ADE

El Autonomous Development Engine (ADE) respeta los modos de permisos:

| Modo        | Comportamiento ADE              |
| ----------- | ------------------------------- |
| **Explore** | Solo planifica, sin ejecucion   |
| **Ask**     | Agrupa operaciones para aprobar |
| **Auto**    | Ejecucion autonoma completa     |

### Aprobacion por Lotes en Modo Ask

Al ejecutar flujos de trabajo autonomos, las operaciones se agrupan:

```
⚠️ Confirmacion por Lotes

Las siguientes 5 operaciones seran ejecutadas:
- write: Crear src/components/NewFeature.tsx
- write: Actualizar src/index.ts
- execute: npm install lodash
- write: Agregar tests/newFeature.test.ts
- execute: npm test

[Aprobar Todo] [Revisar Cada Una] [Cancelar]
```

---

## Mejores Practicas

### Para Nuevos Usuarios

1. Comenzar con `*mode explore` para navegar de forma segura
2. Cambiar a `*mode ask` cuando esten listos para hacer cambios
3. Usar `*mode auto` solo cuando tengan confianza

### Para CI/CD

Configurar modo en automatizacion:

```yaml
# .github/workflows/aiox.yml
- name: Run AIOX
  run: |
    echo "permissions:\n  mode: auto" > .aiox/config.yaml
    aiox run build
```

### Para Equipos

- Por defecto usar modo `ask` en entornos compartidos
- Usar `explore` para revisiones de codigo
- Reservar `auto` para cuentas de automatizacion designadas

---

## Solucion de Problemas

### "Operacion bloqueada en modo Explore"

Cambiar a un modo menos restrictivo:

```
*mode ask
```

### El modo no persiste

Verificar que `.aiox/config.yaml` existe y es escribible:

```bash
ls -la .aiox/config.yaml
```

### Confirmaciones muy frecuentes

Cambiar a modo Auto:

```
*mode auto
```

O usar aprobacion por lotes en flujos de trabajo ADE.

---

## Referencia de API

```javascript
const { PermissionMode, OperationGuard } = require('./.aiox-core/core/permissions');

// Cargar modo actual
const mode = new PermissionMode();
await mode.load();
console.log(mode.currentMode); // 'ask'
console.log(mode.getBadge()); // '[⚠️ Ask]'

// Cambiar modo
await mode.setMode('auto');

// Verificar operacion
const guard = new OperationGuard(mode);
const result = await guard.guard('Bash', { command: 'rm -rf node_modules' });
// { proceed: false, needsConfirmation: true, operation: 'delete', ... }
```

---

_Modos de Permisos - Inspirado en [Craft Agents OSS](https://github.com/lukilabs/craft-agents-oss)_
