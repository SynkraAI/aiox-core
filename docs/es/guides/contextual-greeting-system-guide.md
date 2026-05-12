<!--
  Traducción: ES
  Original: /docs/en/guides/contextual-greeting-system-guide.md
  Última sincronización: 2026-01-26
-->

# Guía del Sistema de Saludo Contextual

> 🌐 [EN](../../guides/contextual-greeting-system-guide.md) | [PT](../../pt/guides/contextual-greeting-system-guide.md) | **ES**

---

**Story:** 6.1.2.5 - Contextual Agent Load System
**Estado:** Componentes Implementados, Integración Pendiente
**Fecha:** 2025-01-15

---

## Descripción General

El Sistema de Saludo Contextual es una mejora de UX que hace que los saludos de los agentes AIOX sean inteligentes y adaptativos, mostrando información y comandos relevantes basados en el contexto de la sesión.

## Lo Que Se Ha Implementado

### Componentes Core (Story 6.1.2.5)

1. **ContextDetector** (`.aiox-core/core/session/context-detector.js`)
   - Detecta tipo de sesión: `new`, `existing`, o `workflow`
   - Enfoque híbrido: historial de conversación (preferido) + archivo de sesión (fallback)
   - TTL de 1 hora para sesiones inactivas

2. **GitConfigDetector** (`.aiox-core/infrastructure/scripts/git-config-detector.js`)
   - Detecta configuración de git del proyecto
   - Caché con TTL de 5 minutos
   - Protección de timeout de 1000ms

3. **GreetingBuilder** (`.aiox-core/development/scripts/greeting-builder.js`)
   - Construye saludos contextuales basados en el tipo de sesión
   - Filtra comandos por visibilidad (full/quick/key)
   - Timeout de 150ms con fallback elegante

4. **WorkflowNavigator** (`.aiox-core/development/scripts/workflow-navigator.js`)
   - Detecta estado del workflow actual
   - Sugiere próximos comandos basado en el estado
   - Pre-popula comandos con contexto (story path, branch)

5. **Workflow Patterns** (`.aiox-core/data/workflow-patterns.yaml`)
   - 10 workflows comunes definidos
   - Transiciones de estado con sugerencias de próximos pasos
   - Patrones validados contra uso real del proyecto

### Pendiente (Story Futura - 6.1.4 o 6.1.6)

**Integración con Proceso de Activación:**
- Interceptar activación del agente (cuando escribes `@dev`, `@po`, etc.)
- Llamar GreetingBuilder automáticamente
- Inyectar saludo contextual en lugar del saludo estándar

## Tipos de Sesión

### 1. New Session (Sesión Nueva)

**Cuándo:** Primera interacción o después de 1 hora de inactividad

**Características:**
- Presentación completa (greeting archetypal)
- Descripción del rol del agente
- Estado del proyecto (si git está configurado)
- Comandos completos (hasta 12 comandos con visibility=full)

**Ejemplo:**
```
💻 Dex (Builder) ready. Let's build something solid!

**Role:** Full Stack Developer specializing in clean, maintainable code

📊 Project Status:
🌿 main
📝 5 modified files
📦 Last commit: feat: implement greeting system

**Available Commands:**
   - `*help`: Show all available commands
   - `*develop`: Implement story tasks
   - `*review-code`: Review code changes
   - `*run-tests`: Execute test suite
   - `*build`: Build for production
   ... (hasta 12 comandos)
```

### 2. Existing Session (Sesión Existente)

**Cuándo:** Continuando trabajo en la misma sesión

**Características:**
- Presentación resumida (greeting named)
- Estado del proyecto
- Contexto actual (última acción)
- Comandos rápidos (6-8 comandos con visibility=quick)

**Ejemplo:**
```
💻 Dex (Builder) ready.

📊 Project Status:
🌿 feature/story-6.1.2.5
📝 3 modified files

📌 **Last Action:** review-code

**Quick Commands:**
   - `*help`: Show help
   - `*develop`: Implement story
   - `*review-code`: Review code
   - `*run-tests`: Run tests
   - `*qa-gate`: Run quality gate
   ... (6-8 comandos más usados)
```

### 3. Workflow Session (Sesión en Workflow)

**Cuándo:** En medio de un workflow activo (ej: después de validar story)

**Características:**
- Presentación mínima (greeting minimal)
- Estado condensado del proyecto
- Contexto del workflow (working on X)
- **Sugerencias de próximos pasos** (NUEVO!)
- Comandos clave (3-5 comandos con visibility=key)

**Ejemplo:**
```
⚖️ Pax ready.

📊 🌿 main | 📝 5 modified | 📖 STORY-6.1.2.5

📌 **Context:** Working on Story 6.1.2.5

**Story validated! Next steps:**

1. `*develop-yolo story-6.1.2.5.md` - Autonomous mode (no interruptions)
2. `*develop-interactive story-6.1.2.5.md` - Interactive mode with checkpoints
3. `*develop-preflight story-6.1.2.5.md` - Plan first, then execute

**Key Commands:**
   - `*help`: Show help
   - `*validate-story-draft`: Validate story
   - `*backlog-summary`: Quick backlog status
```

## Sistema de Visibilidad de Comandos

### Metadatos de Comandos

Cada comando ahora tiene un atributo `visibility` que controla cuándo aparece:

```yaml
commands:
  - name: help
    visibility: [full, quick, key]  # Siempre visible
    description: "Show all available commands"

  - name: develop
    visibility: [full, quick, key]  # Comando principal
    description: "Implement story tasks"

  - name: review-code
    visibility: [full, quick]  # Usado frecuentemente, pero no crítico
    description: "Review code changes"

  - name: build
    visibility: [full]  # Menos usado, solo en new session
    description: "Build for production"

  - name: qa-gate
    visibility: [key]  # Crítico en workflows, pero no siempre necesario
    description: "Run quality gate"
```

### Guías de Categorización

**`full` (12 comandos)** - New Session
- Todos los comandos disponibles
- Muestra capacidades completas del agente
- Ideal para descubrimiento

**`quick` (6-8 comandos)** - Existing Session
- Comandos usados frecuentemente
- Enfocado en productividad
- Elimina comandos raramente usados

**`key` (3-5 comandos)** - Workflow Session
- Comandos críticos para el workflow actual
- Mínima distracción
- Máxima eficiencia

## Navegación de Workflows

### Workflows Definidos

**10 workflows comunes:**

1. **story_development** - Validate -> Develop -> QA -> Deploy
2. **epic_creation** - Create epic -> Create stories -> Validate
3. **backlog_management** - Review -> Prioritize -> Schedule
4. **architecture_review** - Analyze -> Document -> Review
5. **git_workflow** - Quality gate -> PR -> Merge
6. **database_workflow** - Design -> Migrate -> Test
7. **code_quality_workflow** - Assess -> Refactor -> Test
8. **documentation_workflow** - Research -> Document -> Sync
9. **ux_workflow** - Design -> Implement -> Validate
10. **research_workflow** - Brainstorm -> Analyze -> Document

### Transiciones de Estado

Cada workflow define transiciones entre estados con:
- **Trigger:** Comando que se completa exitosamente
- **Greeting Message:** Mensaje contextual
- **Next Steps:** Sugerencias de próximos comandos con args pre-populados

**Ejemplo (Story Development):**

```yaml
story_development:
  transitions:
    validated:
      trigger: "validate-story-draft completed successfully"
      greeting_message: "Story validated! Ready to implement."
      next_steps:
        - command: develop-yolo
          args_template: "${story_path}"
          description: "Autonomous YOLO mode (no interruptions)"
        - command: develop-interactive
          args_template: "${story_path}"
          description: "Interactive mode with checkpoints (default)"
        - command: develop-preflight
          args_template: "${story_path}"
          description: "Plan everything upfront, then execute"
```

## Cómo Probar Ahora

### Opción 1: Script de Prueba Automático

```bash
node .aiox-core/development/scripts/test-greeting-system.js
```

Este script prueba los 4 escenarios:
1. New session greeting (Dev)
2. Existing session greeting (Dev)
3. Workflow session greeting (PO)
4. Simple greeting fallback

### Opción 2: Prueba Manual via Node REPL

```javascript
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();

// Mock agent
const mockAgent = {
  name: 'Dex',
  icon: '💻',
  persona_profile: {
    greeting_levels: {
      named: '💻 Dex (Builder) ready!'
    }
  },
  persona: { role: 'Developer' },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'] }
  ]
};

// Test new session
builder.buildGreeting(mockAgent, { conversationHistory: [] })
  .then(greeting => console.log(greeting));
```

### Opción 3: Esperar Integración Completa

Cuando la integración con el proceso de activación esté implementada (Story 6.1.4/6.1.6), el sistema funcionará automáticamente al activar cualquier agente:

```
@dev              → Saludo contextual automático
@po               → Saludo contextual automático
@qa               → Saludo contextual automático
```

## Archivos Relacionados

### Scripts Core
- `.aiox-core/core/session/context-detector.js` - Detección de tipo de sesión
- `.aiox-core/infrastructure/scripts/git-config-detector.js` - Detección de git config
- `.aiox-core/development/scripts/greeting-builder.js` - Construcción del saludo
- `.aiox-core/development/scripts/workflow-navigator.js` - Navegación de workflow
- `.aiox-core/development/scripts/agent-exit-hooks.js` - Hooks de salida (para persistencia)

### Archivos de Datos
- `.aiox-core/data/workflow-patterns.yaml` - Definiciones de workflows

### Tests
- `tests/unit/context-detector.test.js` - 23 tests
- `tests/unit/git-config-detector.test.js` - 19 tests
- `tests/unit/greeting-builder.test.js` - 23 tests
- `tests/integration/performance.test.js` - Validación de rendimiento

### Configuración
- `.aiox-core/core-config.yaml` - Configuración global (secciones git + agentIdentity)

### Agentes (Actualizados)
- `.aiox-core/agents/dev.md` - Metadatos de visibilidad de comandos
- `.aiox-core/agents/po.md` - Metadatos de visibilidad de comandos
- `.aiox-core/agents/*.md` - 9 agentes restantes (actualización pendiente)

## Próximos Pasos

### Inmediato (Arreglar Problemas de Tests)
1. Arreglar problemas de configuración de tests (1-2 horas)
2. Ejecutar suite completa de tests
3. Ejecutar tests de rendimiento

### Corto Plazo (Story 6.1.4 o 6.1.6)
1. Implementar integración con proceso de activación de agentes
2. Actualizar los 9 agentes restantes con metadatos de visibilidad de comandos
3. Probar con activaciones reales de agentes

### Largo Plazo (Story 6.1.2.6)
1. Implementar aprendizaje dinámico de patrones de workflow
2. Agregar priorización de comandos basada en uso
3. Implementar hints de colaboración entre agentes

## Métricas de Rendimiento

**Objetivo (de Story 6.1.2.5):**
- Latencia P50: <100ms
- Latencia P95: <130ms
- Latencia P99: <150ms (límite duro)

**Esperado (basado en revisión de código):**
- Git config (cache hit): <5ms
- Git config (cache miss): <50ms
- Detección de contexto: <50ms
- I/O de archivo de sesión: <10ms
- Matching de workflow: <20ms
- **Total P99:** ~100-120ms (bien por debajo del límite)

**Optimizaciones:**
- Ejecución paralela (Promise.all)
- Caching basado en TTL
- Protección de timeout
- Salida temprana en cache hit

## Compatibilidad Hacia Atrás

**100% Compatible Hacia Atrás:**
- Agentes sin metadatos de visibilidad muestran todos los comandos (máximo 12)
- Fallback elegante a saludo simple en cualquier error
- Cero cambios breaking en el proceso de activación
- Migración gradual (Fase 1: dev/po -> Fase 2: 9 restantes)

## Preguntas Frecuentes

**P: ¿Por qué el saludo no es contextual cuando activo un agente ahora?**
R: La integración con el proceso de activación aún no se ha implementado. Los componentes existen pero no se llaman automáticamente todavía.

**P: ¿Cuándo se hará la integración?**
R: En una story futura (probablemente 6.1.4 o 6.1.6). Depende del sistema de configuración de agentes.

**P: ¿Cómo puedo probar ahora?**
R: Usa el script de prueba: `node .aiox-core/development/scripts/test-greeting-system.js`

**P: ¿Qué pasa si un agente no tiene metadatos de visibilidad?**
R: Fallback: muestra todos los comandos (máximo 12). No rompe nada.

**P: ¿Cómo agrego metadatos de visibilidad a mis comandos?**
R: Mira la sección "Sistema de Visibilidad de Comandos" arriba y los ejemplos en los agentes dev.md y po.md.

**P: ¿Puedo deshabilitar el saludo contextual?**
R: Sí, via config: `core-config.yaml` -> `agentIdentity.greeting.contextDetection: false`

---

**Documento Actualizado:** 2025-01-15
**Autor:** Quinn (QA) + Dex (Dev)
**Story:** 6.1.2.5 - Contextual Agent Load System
