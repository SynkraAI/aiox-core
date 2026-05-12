<!-- Traducción: ES | Original: /docs/en/guides/squad-examples/README.md | Sincronización: 2026-01-26 -->

# Ejemplos de Squad

Este directorio contiene configuraciones de Squad de ejemplo para ayudarte a comenzar.

## Ejemplos Disponibles

### 1. Agente Simple (`simple-agent.yaml`)

Un ejemplo mínimo de agente enfocado en tareas de documentación. Es un excelente punto de partida para:

- Comprender la estructura del agente
- Aprender definiciones de comandos
- Patrones básicos de indicación del sistema

### 2. Squad de Procesador de Datos (`data-processor-squad.yaml`)

Un manifiesto de squad completo que muestra:

- Múltiples agentes trabajando juntos
- Definiciones de tareas con dependencias
- Orquestación de flujos de trabajo
- Dependencias externas de npm
- Opciones de configuración

## Usando Estos Ejemplos

### Copiar y Personalizar

```bash
# Copiar un ejemplo para comenzar tu squad
cp docs/guides/squad-examples/simple-agent.yaml my-squad/agents/my-agent.yaml

# Editar para adaptarse a tus necesidades
code my-squad/agents/my-agent.yaml
```

### Aprender Leyendo

Cada ejemplo incluye comentarios explicando:

- Por qué se utilizan ciertos patrones
- Mejores prácticas siendo demostradas
- Puntos de personalización comunes

## Crear el Tuyo Propio

1. Comienza con la [Plantilla de Squad](../../../../templates/squad/)
2. Consulta estos ejemplos para patrones
3. Sigue la [Guía de Squads](../squads-guide.md)

## Contribuyendo Ejemplos

¿Tienes un patrón de squad útil? ¡Nos encantaría tus contribuciones!

1. Crea tu ejemplo en este directorio
2. Agrega comentarios claros explicando el patrón
3. Actualiza este README con la descripción
4. Envía un PR siguiendo [CONTRIBUTING.md](../../../../CONTRIBUTING.md)

---

_AIOX Squads: Equipos de agentes de IA trabajando contigo_ 🤖
