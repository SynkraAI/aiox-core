# Guía de Inicio Rápido AIOS v4

> 🌐 [EN](../../installation/v4-quick-start.md) | [PT](../../pt/installation/v4-quick-start.md) | **ES**

---

**Versión:** 2.1
**Última Actualización:** 2026-01-26
**Tiempo para Completar:** 5 minutos

---

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm 9+ instalado (`npm --version`)
- [ ] Git instalado (`git --version`)
- [ ] GitHub CLI (`gh`) instalado y autenticado (`gh auth status`)
- [ ] Un IDE con IA o Claude Code CLI

---

## Paso 1: Instalar AIOS Core

### Opción A: Wizard de Instalación npx (Recomendado)

```bash
# Ejecutar el wizard de instalación interactivo
npx aios-core@latest

# O crear un nuevo proyecto con nombre específico
npx aios-core@latest init mi-proyecto
cd mi-proyecto
```

### Opción B: Clonar Repositorio (Desarrollo)

```bash
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core
npm install
```

---

## Paso 2: Verificar Instalación

Ejecuta el comando de diagnóstico:

```bash
npx aios-core@latest doctor
```

O si está instalado globalmente:

```bash
aios doctor
```

### Verificación Manual

```bash
# Verificar que la estructura core existe
ls -la .aios-core/

# Verificar directorios principales
ls .aios-core/core/
ls .aios-core/development/agents/
```

Estructura esperada:

```
.aios-core/
├── core/               # Core del framework (registry, health-check, orchestration)
├── development/        # Agentes, tareas, workflows
├── product/            # Templates, checklists
└── infrastructure/     # Scripts, herramientas, integraciones
```

---

## Paso 3: Activar Tu Primer Agente

AIOS usa agentes especializados para diferentes tareas. En tu IDE con IA o Claude Code CLI, escribe:

```
@aios-master
```

El agente te saludará y mostrará comandos disponibles:

```
🎯 AIOS Master listo!
Escribe *help para ver comandos disponibles.
```

### Prueba Estos Comandos

| Comando   | Descripción                            |
| --------- | -------------------------------------- |
| `*help`   | Mostrar todos los comandos disponibles |
| `*status` | Mostrar estado del proyecto            |
| `*agents` | Listar todos los agentes disponibles   |

---

## Paso 4: Explorar Agentes Disponibles

| Agente              | Activación           | Propósito                           |
| ------------------- | -------------------- | ----------------------------------- |
| `@dev` (Dex)        | Desarrollo           | Implementación de código, debugging |
| `@qa` (Quinn)       | Calidad              | Pruebas y validación                |
| `@architect` (Aria) | Arquitectura         | Diseño de sistema y documentación   |
| `@pm` (Sage)        | Product Manager      | Requisitos y planificación          |
| `@devops` (Gage)    | DevOps               | Git push, creación de PR, CI/CD     |
| `@po` (Maven)       | Product Owner        | Creación de stories y backlog       |
| `@sm` (River)       | Scrum Master         | Gestión de sprint                   |
| `@analyst` (Nova)   | Analista de Negocios | Análisis de requisitos              |

### Ejemplo: Activar Agente Desarrollador

```
@dev
```

El agente desarrollador (Dex) se activará con un saludo mostrando:

- Estado del proyecto
- Comandos rápidos
- Opciones de colaboración entre agentes

---

## Paso 5: Crear Tu Primera Story

Las stories dirigen el desarrollo en AIOS. Activa el Product Owner y crea una:

```
@po *create-story
```

Sigue los prompts para definir:

1. Título de la story
2. Descripción
3. Criterios de aceptación
4. Prioridad

---

## Referencia Rápida

### Comandos de Agente

Todos los comandos de agente usan el prefijo `*`:

```
*help          # Mostrar ayuda
*status        # Mostrar estado
*exit          # Salir del agente actual
```

### Comandos CLI

```bash
# Instalación y setup
npx aios-core@latest           # Ejecutar wizard
npx aios-core@latest doctor    # Ejecutar diagnósticos
npx aios-core@latest info      # Mostrar info del sistema

# Desarrollo
npm run lint                           # Verificar estilo de código
npm run typecheck                      # Verificar tipos TypeScript
npm test                               # Ejecutar pruebas unitarias
npm run validate:structure             # Validar estructura AIOS
```

### Estructura del Proyecto

```
tu-proyecto/
├── .aios-core/                    # Core del framework
│   ├── core/                      # Módulos core
│   │   ├── registry/              # Registro de servicios (200+ workers)
│   │   ├── health-check/          # Sistema de health check
│   │   ├── orchestration/         # Orquestación de workflows
│   │   └── quality-gates/         # Capas de validación de calidad
│   ├── development/               # Assets de desarrollo
│   │   ├── agents/                # Definiciones de agentes (12 agentes)
│   │   ├── tasks/                 # Workflows de tareas (~140 tareas)
│   │   └── workflows/             # Workflows multi-etapa
│   ├── product/                   # Assets de producto
│   │   ├── templates/             # Templates de documentos
│   │   └── checklists/            # Checklists de validación
│   └── infrastructure/            # Infraestructura
│       ├── scripts/               # Scripts utilitarios (~80)
│       ├── integrations/          # Adaptadores de PM tools
│       └── templates/             # Templates de configuración
├── .claude/                       # Configuración Claude Code
│   ├── commands/AIOS/agents/      # Skills de agentes
│   └── rules/                     # Reglas de agentes
├── docs/                          # Documentación
│   └── stories/                   # Stories de desarrollo
└── src/                           # Tu código fuente
```

---

## Próximos Pasos

1. **Lee la guía completa:** [Comenzando](../getting-started.md)
2. **Entiende la arquitectura:** [Arquitectura Core](../core-architecture.md)
3. **Aprende sobre agentes:** [Definiciones de Agentes](../../../.aios-core/development/agents/)
4. **Únete a la comunidad:** [Discord](https://discord.gg/gk8jAdXWmj)

---

## Solución de Problemas

### Errores "Comando no encontrado"

```bash
# Asegúrate que Node.js está en el PATH
node --version

# Limpia el cache npm si persisten problemas
npm cache clean --force
```

### Agente no responde

1. Asegúrate de estar en un IDE con IA (Cursor, VS Code con Claude, etc.) o Claude Code CLI
2. Verifica que estás usando sintaxis correcta: `@nombre-del-agente`
3. Verifica que el archivo del agente existe: `ls .aios-core/development/agents/`

### Errores de permisos

```bash
# Corregir permisos npm (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# O usa un gestor de versiones Node (recomendado)
# nvm, fnm, o volta
```

### Estructura AIOS no encontrada

```bash
# Reinstalar AIOS en el proyecto actual
npx aios-core@latest install

# O clonar de nuevo
git clone https://github.com/SynkraAI/aios-core.git
```

---

## Obtener Ayuda

- **Documentación:** [Repositorio GitHub](https://github.com/SynkraAI/aios-core)
- **GitHub Issues:** [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Comunidad Discord:** [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)

---

**¡Bienvenido a AIOS! ¡Feliz coding!**
