<!--
  Traducción: ES
  Original: /docs/en/installation/faq.md
  Última sincronización: 2026-01-26
-->

# Preguntas Frecuentes de Synkra AIOX

> 🌐 [EN](../../installation/faq.md) | [PT](../../pt/installation/faq.md) | **ES**

---

**Versión:** 2.1.0
**Última Actualización:** 2025-01-24

---

## Tabla de Contenidos

- [Preguntas de Instalación](#preguntas-de-instalación)
- [Actualizaciones y Mantenimiento](#actualizaciones-y-mantenimiento)
- [Uso Offline y en Entornos Aislados](#uso-offline-y-en-entornos-aislados)
- [IDE y Configuración](#ide-y-configuración)
- [Agentes y Flujos de Trabajo](#agentes-y-flujos-de-trabajo)
- [Squads](#squads)
- [Uso Avanzado](#uso-avanzado)

---

## Preguntas de Instalación

### P1: ¿Por qué npx en lugar de npm install -g?

**Respuesta:** Recomendamos `npx aiox-core install` en lugar de instalación global por varias razones:

1. **Siempre la Última Versión**: npx obtiene la última versión automáticamente
2. **Sin Contaminación Global**: No agrega a sus paquetes npm globales
3. **Aislamiento de Proyecto**: Cada proyecto puede tener su propia versión
4. **Sin Problemas de Permisos**: Evita problemas comunes de permisos npm globales
5. **Compatible con CI/CD**: Funciona perfectamente en pipelines automatizados

**Si prefiere instalación global:**

```bash
npm install -g aiox-core
aiox-core install
```

---

### P2: ¿Cuáles son los requisitos del sistema?

**Respuesta:**

| Componente      | Mínimo                            | Recomendado     |
| -------------- | ---------------------------------- | --------------- |
| **Node.js**    | 18.0.0                             | 20.x LTS        |
| **npm**        | 9.0.0                              | 10.x            |
| **Espacio en Disco** | 100 MB                             | 500 MB          |
| **RAM**        | 2 GB                               | 8 GB            |
| **SO**         | Windows 10, macOS 12, Ubuntu 20.04 | Últimas versiones |

**Verifique su sistema:**

```bash
node --version  # Debe ser 18+
npm --version   # Debe ser 9+
```

---

### P3: ¿Puedo instalar AIOX en un proyecto existente?

**Respuesta:** ¡Sí! AIOX está diseñado tanto para proyectos nuevos como existentes.

**Para proyectos existentes:**

```bash
cd /path/to/existing-project
npx aiox-core install
```

El instalador:

- Creará el directorio `.aiox-core/` (archivos del framework)
- Creará la configuración del IDE (`.claude/`, `.cursor/`, etc.)
- NO modificará su código fuente existente
- NO sobrescribirá documentación existente a menos que lo elija

**Importante:** Si tiene un directorio `.claude/` o `.cursor/` existente, el instalador preguntará antes de modificar.

---

### P4: ¿Cuánto tiempo toma la instalación?

**Respuesta:**

| Escenario                | Tiempo          |
| ----------------------- | ------------- |
| **Primera instalación**  | 2-5 minutos   |
| **Actualizar existente**     | 1-2 minutos   |
| **Solo paquete de expansión** | 30-60 segundos |

Factores que afectan el tiempo de instalación:

- Velocidad de conexión a internet
- Estado de la caché de npm
- Número de IDEs seleccionados
- Paquetes de expansión seleccionados

---

### P5: ¿Qué archivos crea AIOX en mi proyecto?

**Respuesta:** AIOX crea la siguiente estructura:

```
your-project/
├── .aiox-core/                 # Núcleo del framework (200+ archivos)
│   ├── agents/                 # 11+ definiciones de agentes
│   ├── tasks/                  # 60+ flujos de trabajo de tareas
│   ├── templates/              # 20+ plantillas de documentos
│   ├── checklists/             # Listas de verificación de validación
│   ├── scripts/                # Scripts de utilidad
│   └── core-config.yaml        # Configuración del framework
│
├── .claude/                    # Claude Code (si se seleccionó)
│   └── commands/AIOX/agents/   # Comandos slash de agentes
│
├── .cursor/                    # Cursor (si se seleccionó)
│   └── rules/                  # Reglas de agentes
│
├── docs/                       # Estructura de documentación
│   ├── stories/                # Historias de desarrollo
│   ├── architecture/           # Documentos de arquitectura
│   └── prd/                    # Requisitos de producto
│
└── Squads/            # (si se instaló)
    └── hybrid-ops/             # Paquete HybridOps
```

---

## Actualizaciones y Mantenimiento

### P6: ¿Cómo actualizo AIOX a la última versión?

**Respuesta:**

```bash
# Actualizar vía npx (recomendado)
npx aiox-core update

# O reinstalar la última
npx aiox-core install --force-upgrade

# Verificar versión actual
npx aiox-core status
```

**Qué se actualiza:**

- Archivos de `.aiox-core/` (agentes, tareas, plantillas)
- Configuraciones del IDE
- Paquetes de expansión (si están instalados)

**Qué se preserva:**

- Sus modificaciones personalizadas en `core-config.yaml`
- Su documentación (`docs/`)
- Su código fuente

---

### P7: ¿Con qué frecuencia debo actualizar?

**Respuesta:** Recomendamos:

| Tipo de Actualización          | Frecuencia   | Comando                     |
| -------------------- | ----------- | --------------------------- |
| **Parches de seguridad** | Inmediatamente | `npx aiox-core update` |
| **Actualizaciones menores**    | Mensualmente     | `npx aiox-core update` |
| **Versiones mayores**   | Trimestralmente   | Revise el changelog primero      |

**Verificar actualizaciones:**

```bash
npm show aiox-core version
npx aiox-core status
```

---

### P8: ¿Puedo revertir a una versión anterior?

**Respuesta:** Sí, varias opciones:

**Opción 1: Reinstalar versión específica**

```bash
npx aiox-core@1.1.0 install --force-upgrade
```

**Opción 2: Usar Git para restaurar**

```bash
# Si .aiox-core está rastreado en git
git checkout HEAD~1 -- .aiox-core/
```

**Opción 3: Restaurar desde copia de seguridad**

```bash
# El instalador crea copias de seguridad
mv .aiox-core .aiox-core.failed
mv .aiox-core.backup .aiox-core
```

---

## Uso Offline y en Entornos Aislados

### P9: ¿Puedo usar AIOX sin internet?

**Respuesta:** Sí, con algo de preparación:

**Configuración inicial (requiere internet):**

```bash
# Instalar una vez con internet
npx aiox-core install

# Empaquetar para uso offline
tar -czvf aiox-offline.tar.gz .aiox-core/ .claude/ .cursor/
```

**En máquina aislada:**

```bash
# Extraer el paquete
tar -xzvf aiox-offline.tar.gz

# Los agentes de AIOX funcionan sin internet
# (No requieren llamadas a API externas)
```

**Limitaciones sin internet:**

- No se puede actualizar a nuevas versiones
- Las integraciones MCP (ClickUp, GitHub) no funcionarán
- No se puede obtener documentación de bibliotecas (Context7)

---

### P10: ¿Cómo transfiero AIOX a un entorno aislado?

**Respuesta:**

1. **En máquina conectada:**

   ```bash
   # Instalar y empaquetar
   npx aiox-core install
   cd your-project
   tar -czvf aiox-transfer.tar.gz .aiox-core/ .claude/ .cursor/ docs/
   ```

2. **Transferir el archivo** vía USB, transferencia segura, etc.

3. **En máquina aislada:**

   ```bash
   cd your-project
   tar -xzvf aiox-transfer.tar.gz
   ```

4. **Configurar IDE manualmente** si es necesario (las rutas pueden diferir)

---

## IDE y Configuración

### P11: ¿Qué IDEs soporta AIOX?

**Respuesta:**

| IDE                | Estado       | Activación de Agentes    |
| ------------------ | ------------ | ------------------- |
| **Claude Code**    | Soporte Completo | `/dev`, `/qa`, etc. |
| **Cursor**         | Soporte Completo | `@dev`, `@qa`, etc. |
| **Gemini CLI**     | Soporte Completo | Mención en prompt   |
| **GitHub Copilot** | Soporte Completo | Modos de chat          |

**Agregar soporte para un nuevo IDE:** Abra un issue en GitHub con la especificación de agentes/reglas del IDE.

---

### P12: ¿Puedo configurar AIOX para múltiples IDEs?

**Respuesta:** ¡Sí! Seleccione múltiples IDEs durante la instalación:

**Interactivo:**

```
? ¿Qué IDE(s) quiere configurar?
❯ ◉ Cursor
  ◉ Claude Code
```

**Línea de comandos:**

```bash
```

Cada IDE obtiene su propio directorio de configuración:

- `.cursor/rules/` para Cursor
- `.claude/commands/` para Claude Code

---

### P13: ¿Cómo configuro AIOX para un nuevo miembro del equipo?

**Respuesta:**

Si `.aiox-core/` está commiteado en su repositorio:

```bash
# El nuevo miembro solo clona
git clone your-repo
cd your-repo

# Opcionalmente configurar su IDE preferido
npx aiox-core install --ide cursor
```

Si `.aiox-core/` no está commiteado:

```bash
git clone your-repo
cd your-repo
npx aiox-core install
```

**Mejor práctica:** Commitear `.aiox-core/` para compartir configuraciones de agentes consistentes.

---

## Agentes y Flujos de Trabajo

### P14: ¿Qué agentes están incluidos?

**Respuesta:** AIOX incluye 11+ agentes especializados:

| Agente           | Rol                 | Ideal Para                        |
| --------------- | -------------------- | ------------------------------- |
| `dev`           | Desarrollador Full-Stack | Implementación de código, depuración  |
| `qa`            | Ingeniero QA          | Pruebas, revisión de código            |
| `architect`     | Arquitecto de Sistemas     | Diseño, decisiones de arquitectura  |
| `pm`            | Gerente de Proyecto      | Planificación, seguimiento              |
| `po`            | Product Owner        | Backlog, requisitos           |
| `sm`            | Scrum Master         | Facilitación, gestión de sprints |
| `analyst`       | Analista de Negocios     | Análisis de requisitos           |
| `ux-expert`     | Diseñador UX          | Diseño de experiencia de usuario          |
| `data-engineer` | Ingeniero de Datos        | Pipelines de datos, ETL             |
| `devops`        | Ingeniero DevOps      | CI/CD, despliegue               |
| `db-sage`       | Arquitecto de Base de Datos   | Diseño de esquemas, consultas          |

---

### P15: ¿Cómo creo un agente personalizado?

**Respuesta:**

1. **Copiar un agente existente:**

   ```bash
   cp .aiox-core/agents/dev.md .aiox-core/agents/my-agent.md
   ```

2. **Editar el frontmatter YAML:**

   ```yaml
   agent:
     name: MyAgent
     id: my-agent
     title: Mi Agente Personalizado
     icon: 🔧

   persona:
     role: Experto en [su dominio]
     style: [estilo de comunicación]
   ```

3. **Agregar a la configuración del IDE:**

   ```bash
   npx aiox-core install --ide claude-code
   ```

4. **Activar:** `/my-agent` o `@my-agent`

---

### P16: ¿Qué es el "modo yolo"?

**Respuesta:** El modo yolo es un modo de desarrollo autónomo donde el agente:

- Implementa tareas de la historia sin confirmación paso a paso
- Toma decisiones autónomamente basándose en los requisitos de la historia
- Registra todas las decisiones en `.ai/decision-log-{story-id}.md`
- Se puede detener en cualquier momento

**Habilitar modo yolo:**

```bash
/dev
*develop-yolo docs/stories/your-story.md
```

**Cuándo usar:**

- Para historias bien definidas con criterios de aceptación claros
- Cuando confía en la toma de decisiones del agente
- Para tareas repetitivas

**Cuándo NO usar:**

- Para cambios arquitectónicos complejos
- Cuando los requisitos son ambiguos
- Para código crítico de producción

---

## Squads

### P17: ¿Qué son los Squads?

**Respuesta:** Los paquetes de expansión son complementos opcionales que extienden las capacidades de AIOX:

| Paquete           | Características                                                       |
| -------------- | -------------------------------------------------------------- |
| **hybrid-ops** | Integración con ClickUp, automatización de procesos, flujos de trabajo especializados |

**Instalar un Squad:**

```bash
npx aiox-core install --Squads hybrid-ops
```

**Listar paquetes disponibles:**

```bash
npx aiox-core install
```

---

### P18: ¿Puedo crear mi propio Squad?

**Respuesta:** ¡Sí! Los paquetes de expansión siguen esta estructura:

```
my-expansion/
├── pack.yaml           # Manifiesto del paquete
├── README.md           # Documentación
├── agents/             # Agentes personalizados
│   └── my-agent.md
├── tasks/              # Tareas personalizadas
│   └── my-task.md
├── templates/          # Plantillas personalizadas
│   └── my-template.yaml
└── workflows/          # Flujos de trabajo personalizados
    └── my-workflow.yaml
```

**Ejemplo de pack.yaml:**

```yaml
name: my-expansion
version: 1.0.0
description: Mi Squad personalizado
dependencies:
  aiox-core: ">=1.0.0"
agents:
  - my-agent
tasks:
  - my-task
```

---

## Uso Avanzado

### P19: ¿Cómo integro AIOX con CI/CD?

**Respuesta:**

**Ejemplo de GitHub Actions:**

```yaml
name: CI with AIOX
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npx aiox-core install --full --ide claude-code
      - run: npm test
```

**Ejemplo de GitLab CI:**

```yaml
test:
  image: node:18
  script:
    - npx aiox-core install --full
    - npm test
```

---

### P20: ¿Cómo personalizo core-config.yaml?

**Respuesta:** El archivo `core-config.yaml` controla el comportamiento del framework:

```yaml
# Fragmentación de documentos
prd:
  prdSharded: true
  prdShardedLocation: docs/prd

# Ubicación de historias
devStoryLocation: docs/stories

# Archivos cargados por el agente dev
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md

# Configuración de Git
git:
  showConfigWarning: true
  cacheTimeSeconds: 300

# Estado del proyecto en saludos de agentes
projectStatus:
  enabled: true
  showInGreeting: true
```

**Después de editar, reinicie su IDE para aplicar los cambios.**

---

### P21: ¿Cómo contribuyo a AIOX?

**Respuesta:**

1. **Haga fork del repositorio:** https://github.com/SynkraAI/aiox-core

2. **Cree una rama de feature:**

   ```bash
   git checkout -b feature/my-feature
   ```

3. **Haga cambios siguiendo los estándares de código:**
   - Lea `docs/framework/coding-standards.md`
   - Agregue pruebas para nuevas funcionalidades
   - Actualice la documentación

4. **Envíe un pull request:**
   - Describa sus cambios
   - Enlace a issues relacionados
   - Espere la revisión

**Tipos de contribuciones bienvenidas:**

- Corrección de errores
- Nuevos agentes
- Mejoras de documentación
- Paquetes de expansión
- Integraciones de IDE

---

### P22: ¿Dónde puedo obtener ayuda?

**Respuesta:**

| Recurso            | Enlace                                                       |
| ------------------- | ---------------------------------------------------------- |
| **Documentación**   | `docs/` en su proyecto                                    |
| **Solución de Problemas** | [troubleshooting.md](./troubleshooting.md)                 |
| **Issues de GitHub**   | https://github.com/SynkraAI/aiox-core/issues |
| **Código Fuente**     | https://github.com/SynkraAI/aiox-core        |

**Antes de pedir ayuda:**

1. Revise estas FAQ
2. Revise la [Guía de Solución de Problemas](./troubleshooting.md)
3. Busque issues existentes en GitHub
4. Incluya información del sistema y mensajes de error en su pregunta

---

## Documentación Relacionada

- [Guía de Solución de Problemas](./troubleshooting.md)
- [Estándares de Código](../framework/coding-standards.md)
