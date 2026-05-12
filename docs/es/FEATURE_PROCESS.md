<!--
  Traducción: ES
  Original: /docs/en/FEATURE_PROCESS.md
  Última sincronización: 2026-01-26
-->

# Proceso de Solicitud de Características

> 🌐 [EN](../FEATURE_PROCESS.md) | [PT](../pt/FEATURE_PROCESS.md) | **ES**

---

Este documento explica cómo proponer nuevas características para AIOX.

## Ideas Rápidas

Para ideas rápidas o pequeñas mejoras:

1. Abra una Discusión en la categoría "Ideas"
2. Describa el problema y la solución propuesta
3. La comunidad y los mantenedores discutirán
4. Si hay interés, puede ser promovida a RFC

## Proceso RFC (Para Características Significativas)

Para características más grandes que requieren decisiones de diseño:

### Cuándo Escribir un RFC

- Nuevas características principales
- Cambios que rompen compatibilidad
- Cambios arquitectónicos significativos
- Cambios que afectan a muchos usuarios

### Ciclo de Vida del RFC

1. **Borrador**: El autor escribe el RFC usando nuestra [Plantilla RFC](../../.github/RFC_TEMPLATE.md)
2. **En Revisión**: Período de comentarios de 2 semanas
3. **Decisión**: Los mantenedores aceptan/rechazan
4. **Implementación**: Si es aceptado, comienza la implementación

### Criterios de Aceptación

- Se alinea con la visión del proyecto
- Técnicamente factible
- Tiene una ruta de implementación clara
- Demanda de la comunidad demostrada
- Mantenible a largo plazo

## Votación

- Use reacciones :+1: para mostrar apoyo
- Las ideas más votadas son priorizadas
- Los mantenedores tienen la decisión final

## Cronograma

- Ideas: Sin cronograma fijo
- RFCs: Período mínimo de revisión de 2 semanas
- Implementación: Basado en capacidad del roadmap

## De Idea a Implementación

```text
Idea de la Comunidad (Discusión)
        │
        │ [Aprobada por mantenedores]
        ▼
Elemento del Backlog Interno
        │
        │ [Priorizado por Product Owner]
        ▼
Planificación de Sprint
        │
        │ [Implementado por Equipo de Desarrollo]
        ▼
Release (acreditado en CHANGELOG.md)
```

### ¿Quién Puede Agregar al Backlog?

El Product Owner (@po) es la única autoridad para agregar elementos al backlog interno.
Esto asegura una priorización adecuada y alineación con los objetivos del proyecto.

### Crédito al Contribuidor

Los contribuidores cuyas ideas son implementadas serán acreditados en:

- Las notas de release en CHANGELOG.md
- El PR que implementa la característica
- Nuestra página de contribuidores (si aplica)

## ¿Preguntas?

Pregunte en GitHub Discussions o Discord.

---

_Ver también: [Manual de la Comunidad](../../COMMUNITY.md) | [Guía de Contribución](../../CONTRIBUTING.md)_
