<!--
  Traduccion: ES
  Original: /docs/guides/ide-sync-guide.md
  Ultima sincronizacion: 2026-01-29
-->

# Guia de Sincronizacion de IDE

Sincroniza agentes, tasks, workflows y checklists de AIOS a traves de multiples configuraciones de IDE.

## Vision General

La task `*command` automatiza la sincronizacion de componentes AIOS a todos los directorios de IDE configurados (`.claude/`, `.cursor/`, `.gemini/`, etc.), eliminando operaciones de copia manuales.

## Inicio Rapido

### 1. Configuracion Inicial

Copiar la plantilla a la raiz de tu proyecto:

```bash
cp .aios-core/infrastructure/templates/aios-sync.yaml.template .aios-sync.yaml
```

### 2. Configurar IDEs

Editar `.aios-sync.yaml` para habilitar tus IDEs:

```yaml
active_ides:
  - claude # Claude Code (.claude/commands/)
  - cursor # Cursor IDE (.cursor/rules/)
  # - gemini    # Google Gemini (.gemini/)
```

### 3. Agregar Alias de Packs

Mapear tus directorios de squads a prefijos de comandos:

```yaml
pack_aliases:
  legal: Legal # squads/legal/ → .claude/commands/Legal/
  copy: Copy # squads/copy/ → .claude/commands/Copy/
  hr: HR # squads/hr/ → .claude/commands/HR/
```

## Uso

### Sincronizar Componentes Individuales

```bash
# Sincronizar un agente especifico
*command agent legal-chief

# Sincronizar una task especifica
*command task revisar-contrato

# Sincronizar un workflow especifico
*command workflow contract-review
```

### Sincronizar Squad Completo

```bash
# Sincronizar todos los componentes de un squad
*command squad legal
```

### Sincronizar Todos los Squads

```bash
# Sincronizar todo
*command sync-all
```

## Como Funciona

```
squads/legal/agents/legal-chief.md
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                 *command sync                        │
│                                                      │
│  1. Leer configuracion .aios-sync.yaml               │
│  2. Verificar si el componente existe en squads/     │
│  3. Aplicar transformaciones de wrapper (si es necesario) │
│  4. Copiar a cada destino de IDE activo              │
│  5. Validar archivos sincronizados                   │
│  6. Registrar operaciones                            │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  .claude/commands/Legal/agents/legal-chief.md        │
│  .cursor/rules/legal-chief.mdc                       │
│  .gemini/agents/legal-chief.md                       │
└──────────────────────────────────────────────────────┘
```

## Mapeos de Sincronizacion

Mapeos por defecto para tipos de componentes:

| Tipo de Componente | Claude | Cursor | Gemini | Windsurf |
| ------------------ | ------ | ------ | ------ | -------- |
| Agents             | ✅     | ✅     | ✅     | ✅       |
| Tasks              | ✅     | -      | -      | -        |
| Workflows          | ✅     | ✅     | -      | -        |
| Checklists         | ✅     | -      | -      | -        |
| Data               | ✅     | -      | -      | -        |

## Wrappers

Diferentes IDEs requieren diferentes formatos:

### Claude (Markdown)

No se necesita transformacion - los archivos se copian tal cual.

### Cursor (MDC)

Los archivos se envuelven con frontmatter:

```yaml
---
description: { extraido del agente }
globs: []
alwaysApply: false
---
{ contenido original }
```

## Estructura de Directorios

```
tu-proyecto/
├── .aios-sync.yaml           # Configuracion de sincronizacion
├── squads/                   # Fuente de verdad
│   └── legal/
│       ├── config.yaml
│       ├── agents/
│       ├── tasks/
│       └── checklists/
├── .claude/
│   └── commands/
│       └── Legal/           # Auto-sincronizado
│           ├── agents/
│           ├── tasks/
│           └── checklists/
├── .cursor/
│   └── rules/               # Auto-sincronizado (formato MDC)
└── .gemini/
    └── agents/              # Auto-sincronizado
```

## Mejores Practicas

1. **Nunca editar `.claude/commands/` directamente** - Siempre editar en `squads/` y sincronizar
2. **Usar nombres descriptivos** - Los nombres de agentes se convierten en slash commands
3. **Mantener config.yaml actualizado** - Requerido para sincronizacion correcta
4. **Ejecutar sync despues de cambios** - Asegurar que todos los IDEs esten sincronizados

## Solucion de Problemas

### Componente No Encontrado

```
Error: Component 'my-agent' not found in squads/
```

**Solucion**: Verificar que el agente existe en `squads/*/agents/my-agent.md`

### Falta Alias de Pack

```
Warning: No pack alias for 'new-squad'
```

**Solucion**: Agregar el alias a `.aios-sync.yaml`:

```yaml
pack_aliases:
  new-squad: NewSquad
```

### IDE No Sincroniza

Verificar que el IDE esta habilitado en la seccion `active_ides`.

## Relacionado

- [Vision General de Squads](./squads-overview.md)
- [Referencia de Agentes](../agent-reference-guide.md)
- [Arquitectura AIOS](../core-architecture.md)
