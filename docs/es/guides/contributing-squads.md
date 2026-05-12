<!--
  Traduccion: ES
  Original: /docs/en/guides/contributing-squads.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Contribucion de Squads

> 🌐 [EN](../../guides/contributing-squads.md) | [PT](../../pt/guides/contributing-squads.md) | **ES**

---

Como contribuir squads al ecosistema AIOX.

## Descripcion General

Hay dos formas de compartir tu squad con la comunidad:

1. **Repositorio aiox-squads** - Squads gratuitos y de codigo abierto en GitHub
2. **Marketplace de Synkra** - Squads premium via API de Synkra

## Estandares de Calidad

Todos los squads contribuidos deben cumplir estos estandares:

### Requeridos

| Requisito | Descripcion |
|-------------|-------------|
| **Manifiesto valido** | `squad.yaml` pasa la validacion de JSON Schema |
| **Documentacion** | README.md con instrucciones de uso |
| **Licencia** | Licencia de codigo abierto (MIT, Apache 2.0, etc.) |
| **Compatibilidad AIOX** | `aiox.minVersion: "2.1.0"` o superior |
| **Arquitectura task-first** | Tareas como puntos de entrada principales |

### Recomendados

| Recomendacion | Descripcion |
|----------------|-------------|
| **Ejemplos** | Ejemplos de uso en README |
| **Pruebas** | Pruebas unitarias para funcionalidad critica |
| **Changelog** | Documentacion de historial de versiones |
| **Solucion de problemas** | Problemas comunes y soluciones |

## Convenciones de Nomenclatura

### Nombres de Squad

- Usar `kebab-case`: `my-awesome-squad`
- Ser descriptivo: `etl-data-pipeline` no `data1`
- Evitar nombres genericos: `helper-squad` es muy vago
- Sin numeros de version en el nombre: `my-squad` no `my-squad-v2`

### Prefijo (slashPrefix)

El `slashPrefix` en `squad.yaml` determina los prefijos de comandos:

```yaml
slashPrefix: etl  # Los comandos se convierten en *etl-extract, *etl-transform
```

Elige un prefijo unico y corto (2-5 caracteres).

## Requisitos del Manifiesto

### Campos Requeridos

```yaml
# Estos campos son REQUERIDOS
name: my-squad
version: 1.0.0              # Versionado semantico
description: Descripcion clara de lo que hace este squad

aiox:
  minVersion: "2.1.0"
  type: squad

components:
  agents: []                # Al menos un agente O tarea
  tasks: []
```

### Campos Recomendados

```yaml
# Estos campos son RECOMENDADOS
author: Tu Nombre <email@example.com>
license: MIT
slashPrefix: my

tags:
  - relevant
  - keywords

dependencies:
  node: []
  python: []
  squads: []
```

## Requisitos de Documentacion

### Estructura del README.md

```markdown
# Nombre del Squad

Descripcion breve (1-2 oraciones).

## Instalacion

Como instalar/agregar este squad.

## Uso

Ejemplos de uso basico.

## Comandos

| Comando | Descripcion |
|---------|-------------|
| *cmd1 | Que hace |
| *cmd2 | Que hace |

## Configuracion

Cualquier opcion de configuracion.

## Ejemplos

Ejemplos de uso detallados.

## Solucion de Problemas

Problemas comunes y soluciones.

## Licencia

Informacion de licencia.
```

## Publicando en aiox-squads

### Prerequisitos

1. Cuenta de GitHub
2. Squad validado: `*validate-squad --strict`
3. Nombre de squad unico (verificar squads existentes)

### Pasos

```bash
# 1. Validar tu squad
@squad-creator
*validate-squad my-squad --strict

# 2. Publicar (crea PR)
*publish-squad ./squads/my-squad
```

Esto:
1. Hara fork de `SynkraAI/aiox-squads` (si es necesario)
2. Creara branch con tu squad
3. Abrira PR para revision

### Proceso de Revision

1. **Verificaciones automaticas** - Validacion de esquema, verificacion de estructura
2. **Revision del mantenedor** - Revision de codigo, verificacion de calidad
3. **Merge** - Squad agregado al registro

Tiempo estimado: Usualmente 2-5 dias habiles.

## Publicando en el Marketplace de Synkra

### Prerequisitos

1. Cuenta de Synkra
2. Token de API configurado
3. Squad validado

### Pasos

```bash
# 1. Configurar token
export SYNKRA_API_TOKEN="your-token"

# 2. Sincronizar al marketplace
@squad-creator
*sync-squad-synkra ./squads/my-squad --public
```

### Opciones de Visibilidad

| Bandera | Efecto |
|------|--------|
| `--private` | Solo visible para tu workspace |
| `--public` | Visible para todos |

## Actualizando Squads Publicados

### Incremento de Version

Seguir versionado semantico:

- **MAJOR** (1.0.0 → 2.0.0): Cambios incompatibles
- **MINOR** (1.0.0 → 1.1.0): Nuevas caracteristicas, compatible hacia atras
- **PATCH** (1.0.0 → 1.0.1): Correcciones de errores

### Proceso de Actualizacion

```bash
# 1. Actualizar version en squad.yaml
# 2. Actualizar CHANGELOG.md
# 3. Validar
*validate-squad my-squad --strict

# 4. Re-publicar
*publish-squad ./squads/my-squad
# o
*sync-squad-synkra ./squads/my-squad
```

## Codigo de Conducta

### Hacer

- Proporcionar documentacion clara y precisa
- Probar tu squad antes de publicar
- Responder a issues y feedback
- Mantener dependencias al minimo
- Seguir convenciones de AIOX

### No Hacer

- Incluir codigo malicioso
- Almacenar credenciales en el codigo
- Copiar trabajo de otros sin atribucion
- Usar nombres o contenido ofensivo
- Spamear el registro con squads de prueba

## Obteniendo Ayuda

- **Preguntas**: [Discusiones de GitHub](https://github.com/SynkraAI/aiox-core/discussions)
- **Issues**: [Rastreador de Issues](https://github.com/SynkraAI/aiox-core/issues)
- **Guias**: Este documento

## Recursos Relacionados

- [Guia de Desarrollo de Squad](./squads-guide.md)
- [Guia de Migracion de Squad](./squad-migration.md)
- [Repositorio aiox-squads](https://github.com/SynkraAI/aiox-squads)

---

**Version:** 1.0.0 | **Actualizado:** 2025-12-26 | **Story:** SQS-8
