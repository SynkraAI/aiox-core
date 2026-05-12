<!--
  Traducción: ES
  Original: /docs/en/GUIDING-PRINCIPLES.md
  Última sincronización: 2026-01-26
-->

# Principios Rectores del Método AIOX

> 🌐 [EN](../GUIDING-PRINCIPLES.md) | [PT](../pt/GUIDING-PRINCIPLES.md) | **ES**

---

El Método AIOX es un framework de lenguaje natural para el desarrollo de software asistido por IA. Estos principios aseguran que las contribuciones mantengan la efectividad del método.

## Principios Fundamentales

### 1. Los Agentes Dev Deben Ser Ligeros

- **Minimizar las dependencias del agente dev**: Los agentes de desarrollo que trabajan en IDEs deben tener una sobrecarga de contexto mínima
- **Reservar el contexto para el código**: Cada línea cuenta - los agentes dev deben enfocarse en codificar, no en documentación
- **Los agentes web pueden ser más grandes**: Los agentes de planificación (PRD Writer, Architect) usados en la interfaz web pueden tener tareas y dependencias más complejas
- **Archivos pequeños, cargados bajo demanda**: Múltiples archivos pequeños y enfocados son mejores que archivos grandes con muchas ramas

### 2. Lenguaje Natural Primero

- **Todo es markdown**: Agentes, tareas, plantillas - todo escrito en inglés simple
- **Sin código en el núcleo**: El framework en sí no contiene código de programación, solo instrucciones en lenguaje natural
- **Plantillas autocontenidas**: Las plantillas se definen como archivos YAML con secciones estructuradas que incluyen metadatos, configuración de flujo de trabajo e instrucciones detalladas para la generación de contenido

### 3. Diseño de Agentes y Tareas

- **Los agentes definen roles**: Cada agente es una persona con experiencia específica (ej., Desarrollador Frontend, Desarrollador API)
- **Las tareas son procedimientos**: Instrucciones paso a paso que un agente sigue para completar el trabajo
- **Las plantillas son salidas**: Documentos estructurados con instrucciones integradas para la generación
- **Las dependencias importan**: Declarar explícitamente solo lo que se necesita

## Guías Prácticas

### Cuándo Agregar al Núcleo

- Solo necesidades universales de desarrollo de software
- No infla los contextos del agente dev
- Sigue los patrones existentes de agente/tarea/plantilla

### Cuándo Crear Squads

- Necesidades específicas de dominio más allá del desarrollo de software
- Dominios no técnicos (negocios, bienestar, educación, creatividad)
- Dominios técnicos especializados (juegos, infraestructura, móvil)
- Documentación pesada o bases de conocimiento
- Cualquier cosa que inflara los agentes del núcleo

Vea la [Visión General de Squads](../guides/squads-overview.md) para ejemplos detallados e ideas.

### Reglas de Diseño de Agentes

1. **Agentes Web/Planificación**: Pueden tener contexto más rico, múltiples tareas, plantillas extensas
2. **Agentes Dev**: Dependencias mínimas, enfocados en generación de código, conjuntos de tareas ligeros
3. **Todos los Agentes**: Persona clara, experiencia específica, capacidades bien definidas

### Reglas de Escritura de Tareas

1. Escribir procedimientos claros paso a paso
2. Usar formato markdown para legibilidad
3. Mantener las tareas del agente dev enfocadas y concisas
4. Las tareas de planificación pueden ser más elaboradas
5. **Preferir múltiples tareas pequeñas sobre una tarea grande con ramificaciones**
   - En lugar de una tarea con muchas rutas condicionales
   - Crear múltiples tareas enfocadas que el agente pueda elegir
   - Esto mantiene la sobrecarga de contexto mínima
6. **Reutilizar tareas comunes** - No crear nuevas tareas de creación de documentos
   - Usar la tarea existente `create-doc`
   - Pasar la plantilla YAML apropiada con secciones estructuradas
   - Esto mantiene la consistencia y reduce la duplicación

### Reglas de Plantillas

Las plantillas siguen la especificación de [Plantilla de Documento AIOX](../../common/utils/aiox-doc-template.md) usando formato YAML:

1. **Estructura**: Las plantillas se definen en YAML con metadatos claros, configuración de flujo de trabajo y jerarquía de secciones
2. **Separación de Responsabilidades**: Las instrucciones para LLMs están en campos `instruction`, separadas del contenido
3. **Reutilizabilidad**: Las plantillas son agnósticas al agente y pueden usarse a través de diferentes agentes
4. **Componentes Clave**:
   - Bloque `template` para metadatos (id, name, version, configuración de salida)
   - Bloque `workflow` para configuración de modo de interacción
   - Array `sections` definiendo la estructura del documento con subsecciones anidadas
   - Cada sección tiene campos `id`, `title` e `instruction`
5. **Características Avanzadas**:
   - Sustitución de variables usando sintaxis `{{variable_name}}`
   - Secciones condicionales con campo `condition`
   - Secciones repetibles con `repeatable: true`
   - Permisos de agente con campos `owner` y `editors`
   - Arrays de ejemplos para orientación (nunca incluidos en la salida)
6. **Salida Limpia**: La estructura YAML asegura que toda la lógica de procesamiento permanezca separada del contenido generado

## Recuerde

- El poder está en la orquestación de lenguaje natural, no en el código
- Los agentes dev codifican, los agentes de planificación planifican
- Mantener los agentes dev ligeros para máxima eficiencia de codificación
- Los paquetes de expansión manejan dominios especializados
