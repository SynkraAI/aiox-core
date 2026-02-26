<!-- Traduccion: ES | Original: /docs/en/CHANGELOG.md | Sincronizacion: 2026-01-26 -->

# Registro de Cambios

> 🌐 [EN](../CHANGELOG.md) | [PT](../pt/CHANGELOG.md) | **ES**

---

Todos los cambios notables en Synkra AIOS seran documentados en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto sigue [Versionado Semantico](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2025-01-24

### Agregado

- **Asistente de Instalacion Interactivo**: Configuracion guiada paso a paso con seleccion de componentes
- **Soporte Multi-IDE**: Agregado soporte para 4 IDEs (Claude Code, Cursor, Gemini CLI, GitHub Copilot)
- **Sistema de Squads**: Complementos modulares incluyendo HybridOps para integracion con ClickUp
- **Pruebas Multiplataforma**: Cobertura completa de pruebas para Windows, macOS y Linux
- **Manejo de Errores y Rollback**: Rollback automatico en caso de fallo de instalacion con sugerencias de recuperacion
- **Mejoras de Agentes**:
  - Registro de decisiones en modo yolo para el agente `dev`
  - Comandos de gestion de backlog para el agente `qa`
  - Integracion con CodeRabbit para revision automatizada de codigo
  - Saludos contextuales con estado del proyecto
- **Suite de Documentacion**:
  - Guia de Solucion de Problemas con 23 problemas documentados
  - FAQ con 22 preguntas y respuestas
  - Guia de Migracion v2.0 a v4.0.4

### Cambiado

- **Estructura de Directorios**: Renombrado `.legacy-core/` a `.aios-core/`
- **Formato de Configuracion**: Mejorado `core-config.yaml` con nuevas secciones para git, projectStatus y opciones de sharding
- **Formato de Agentes**: Actualizado esquema YAML de agentes con persona_profile, visibilidad de comandos y campos whenToUse
- **Configuracion de IDE**: Agentes de Claude Code movidos a `.claude/commands/AIOS/agents/`
- **Ubicaciones de Archivos**:
  - `docs/architecture/coding-standards.md` → `docs/framework/coding-standards.md`
  - `docs/architecture/tech-stack.md` → `docs/framework/tech-stack.md`
  - `.aios-core/utils/` → `.aios-core/scripts/`

### Corregido

- Fallos de instalacion en Windows con rutas largas
- Politica de ejecucion de PowerShell bloqueando scripts
- Problemas de permisos de npm en Linux/macOS
- Configuracion de IDE no aplicandose despues de la instalacion

### Obsoleto

- Proceso de instalacion manual (usar `npx aios-core install` en su lugar)
- Nombre de directorio `.legacy-core/` (migrado automaticamente)

### Seguridad

- Agregada validacion de directorio de instalacion para prevenir modificaciones en directorios del sistema
- Mejorado manejo de variables de entorno y claves API

---

## [2.0.0] - 2024-12-01

### Agregado

- Lanzamiento publico inicial de Synkra AIOS
- 11 agentes de IA especializados (dev, qa, architect, pm, po, sm, analyst, ux-expert, data-engineer, devops, db-sage)
- Sistema de flujos de trabajo con mas de 60 tareas predefinidas
- Sistema de plantillas con mas de 20 plantillas de documentos
- Metodologia de desarrollo basada en historias
- Integracion basica con Claude Code

### Problemas Conocidos

- Instalacion manual requerida (2-4 horas)
- Soporte multiplataforma limitado
- Sin asistente interactivo

---

## [1.0.0] - 2024-10-15

### Agregado

- Lanzamiento interno inicial
- Framework principal de agentes
- Ejecucion basica de tareas

---

## Notas de Migracion

### Actualizar de 2.0.x a 2.1.x


**Actualizacion rapida:**

```bash
npx aios-core install --force-upgrade
```

**Cambios clave:**
1. Directorio renombrado: `.legacy-core/` → `.aios-core/`
2. Actualizar `core-config.yaml` con nuevos campos
3. Volver a ejecutar la configuracion del IDE

---

## Enlaces

- [Solucion de Problemas](./installation/troubleshooting.md)
- [FAQ](./installation/faq.md)
- [Repositorio GitHub](https://github.com/SynkraAI/aios-core)
- [Rastreador de Issues](https://github.com/SynkraAI/aios-core/issues)
