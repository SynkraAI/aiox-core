# Hoja de Ruta de AIOX

> 🇧🇷 [Versão em Português](ROADMAP-PT.md)

Este documento describe la dirección de desarrollo planificada para AIOX.

> Para seguimiento detallado, consulta nuestro [Proyecto de GitHub](https://github.com/orgs/SynkraAI/projects/1)

## Visión

AIOX tiene como objetivo ser el framework de agentes de IA de código abierto más completo, permitiendo a los desarrolladores construir aplicaciones sofisticadas impulsadas por IA con equipos especializados de agentes (Squads) e integración perfecta con IDEs.

## Enfoque Actual (Q1 2026)

### Lanzamiento v4.2

Estabilización del framework principal e infraestructura comunitaria:

- [x] Instalador híbrido (npx + asistente interactivo)
- [x] Arquitectura de 4 módulos (Core, Squads, MCP Ecosystem, Premium)
- [x] Sistema de Service Discovery
- [x] Quality Gates (3 capas: pre-commit, pre-push, CI/CD)
- [x] Template Engine
- [x] Integración con CodeRabbit para revisión automatizada de código
- [ ] Infraestructura de comunidad open-source (en progreso)

### Construcción de Comunidad

- [x] Configuración de GitHub Discussions
- [x] Guías de contribución (CONTRIBUTING.md, COMMUNITY.md)
- [x] Proceso de solicitud de características (FEATURE_PROCESS.md)
- [x] Hoja de ruta pública (¡este documento!)
- [ ] Registro de squads

## Próximamente (Q2 2026)

### Planificación v2.2

- Implementación de Memory Layer para persistencia de contexto de agentes
- Capacidades mejoradas de colaboración entre agentes
- Optimizaciones de rendimiento para grandes bases de código
- Mejor manejo y recuperación de errores

### Características Comunitarias

- Marketplace de Squads (equipos de agentes contribuidos por la comunidad)
- Sistema de reconocimiento de contribuidores
- Soporte de traducción (prioridad PT-BR)

## Exploración Futura

Estos elementos están siendo explorados pero aún no están comprometidos:

- Soporte multilenguaje para definiciones de agentes
- Opciones de despliegue en la nube para equipos distribuidos
- Constructor visual de workflows para usuarios no técnicos
- Marketplace de plugins para integraciones de terceros
- Análisis y telemetría mejorados (opt-in)

## Cómo Influir en la Hoja de Ruta

¡Damos la bienvenida a las opiniones de la comunidad sobre nuestra dirección! Así es como puedes participar:

### 1. Vota por Ideas

Reacciona con :+1: en [Ideas en Discussions](https://github.com/SynkraAI/aiox-core/discussions/categories/ideas) existentes para mostrar apoyo.

### 2. Propón Características

¿Tienes una nueva idea? Abre una [Discusión de Idea](https://github.com/SynkraAI/aiox-core/discussions/new?category=ideas) para compartirla con la comunidad.

### 3. Escribe un RFC

Para características significativas que necesitan un diseño detallado, [envía un RFC](/.github/RFC_TEMPLATE.md) siguiendo nuestro proceso estructurado.

### 4. Contribuye Directamente

¿Encontraste algo que quieres implementar? Consulta nuestra [Guía de Contribución](CONTRIBUTING.md) y [Proceso de Características](docs/FEATURE_PROCESS.md).

## Registro de Cambios

Para lo que ya se ha lanzado, consulta [CHANGELOG.md](CHANGELOG.md).

## Proceso de Actualización

Esta hoja de ruta es revisada y actualizada mensualmente por los mantenedores del proyecto.

**Proceso:**
1. Revisar progreso de los elementos actuales
2. Actualizar estado de elementos completados/en progreso
3. Agregar características recién aprobadas de las discusiones comunitarias
4. Eliminar elementos cancelados o despriorizados
5. Comunicar cambios significativos vía [Anuncios](https://github.com/SynkraAI/aiox-core/discussions/categories/announcements)

**Responsable:** agentes @pm (Morgan) o @po (Pax), con supervisión de mantenedores.

### Sincronización con Backlog Interno

Esta hoja de ruta pública está sincronizada con nuestra planificación interna de sprints:

| Hoja de Ruta Pública | Seguimiento Interno |
|----------------|-------------------|
| [Proyecto de GitHub](https://github.com/orgs/SynkraAI/projects/1) | `docs/stories/backlog.md` |
| Características de alto nivel | Stories detalladas por sprint |
| Cronograma trimestral | Ejecución basada en sprints |

**Checklist de Sincronización (Mensual):**
- [ ] Revisar sprints completados en `docs/stories/v4.0.4/`
- [ ] Actualizar estado de elementos del Proyecto de GitHub (Done/In Progress)
- [ ] Agregar nuevas características aprobadas del backlog al Proyecto
- [ ] Actualizar este ROADMAP.md con el progreso más reciente

## Descargo de Responsabilidad

Esta hoja de ruta representa nuestros planes actuales y está sujeta a cambios basados en retroalimentación de la comunidad, restricciones técnicas y prioridades estratégicas. Las fechas son trimestres estimados, no compromisos. Usamos trimestres en lugar de fechas específicas para mantener flexibilidad mientras proporcionamos visibilidad sobre nuestra dirección.

---

*Última actualización: 2025-12-10*
