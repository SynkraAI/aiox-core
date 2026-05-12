<!--
  Traducción: ES
  Original: /docs/installation/README.md
  Última sincronización: 2026-02-01
-->

# Documentación de Instalación de Synkra AIOX

> 🌐 [EN](../../installation/README.md) | [PT](../../pt/installation/README.md) | **ES**

---

**Versión:** 2.1.1
**Última Actualización:** 2026-02-01

---

## Descripción General

Este directorio contiene documentación completa de instalación y configuración para Synkra AIOX.

---

## Índice de Documentación

### Guías por Plataforma

| Plataforma     | Guía                                        | Estado      |
| -------------- | ------------------------------------------- | ----------- |
| 🍎 **macOS**   | [Guía de Instalación macOS](./macos.md)     | ✅ Completa |
| 🐧 **Linux**   | [Guía de Instalación Linux](./linux.md)     | ✅ Completa |
| 🪟 **Windows** | [Guía de Instalación Windows](./windows.md) | ✅ Completa |

### Documentación General

| Documento                                     | Descripción                               | Audiencia          |
| --------------------------------------------- | ----------------------------------------- | ------------------ |
| [Quick Start (v4)](./v4-quick-start.md)   | Configuración rápida para nuevos usuarios | Principiantes      |
| [Solución de Problemas](./troubleshooting.md) | Problemas comunes y soluciones            | Todos los usuarios |
| [Preguntas Frecuentes](./faq.md)              | Preguntas frecuentes                      | Todos los usuarios |

---

## Enlaces Rápidos

### Nueva Instalación

```bash
npx aiox-core install
```

### Actualización

```bash
npx aiox-core install --force-upgrade
```

### ¿Tiene Problemas?

1. Consulte la [Guía de Solución de Problemas](./troubleshooting.md)
2. Busque en las [Preguntas Frecuentes](./faq.md)
3. Abra un [Issue en GitHub](https://github.com/SynkraAI/aiox-core/issues)

---

## Requisitos Previos

- Node.js 18.0.0+
- npm 9.0.0+
- Git 2.30+

---

## Plataformas Soportadas

| Plataforma    | Estado           |
| ------------- | ---------------- |
| Windows 10/11 | Soporte Completo |
| macOS 12+     | Soporte Completo |
| Ubuntu 20.04+ | Soporte Completo |
| Debian 11+    | Soporte Completo |

---

## IDEs Soportados

| IDE            | Activación de Agentes |
| -------------- | --------------------- |
| Claude Code    | `/dev`, `/qa`, etc.   |
| Cursor         | `@dev`, `@qa`, etc.   |
| Gemini CLI     | Mención en el prompt  |
| GitHub Copilot | Modos de chat         |

---

## Documentación Relacionada

- [Estándares de Código](../framework/coding-standards.md)
- [Stack Tecnológico](../framework/tech-stack.md)
- [Arquitectura](../architecture/)
- [Registro de Cambios](../CHANGELOG.md)

---

## Soporte

- **Issues de GitHub**: [aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **Documentación**: [docs/](../)
