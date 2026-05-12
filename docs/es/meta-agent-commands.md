<!--
  Traduccion: ES
  Original: /docs/en/meta-agent-commands.md
  Ultima sincronizacion: 2026-01-26
-->

# Referencia de Comandos del Meta-Agente

> 🌐 [EN](../meta-agent-commands.md) | [PT](../pt/meta-agent-commands.md) | **ES**

---

Guia de referencia completa para todos los comandos del meta-agente de Synkra AIOX.

## Tabla de Contenidos

1. [Sintaxis de Comandos](#sintaxis-de-comandos)
2. [Comandos Principales](#comandos-principales)
3. [Gestion de Agentes](#gestion-de-agentes)
4. [Operaciones de Tareas](#operaciones-de-tareas)
5. [Comandos de Workflow](#comandos-de-workflow)
6. [Generacion de Codigo](#generacion-de-codigo)
7. [Analisis y Mejora](#analisis-y-mejora)
8. [Capa de Memoria](#capa-de-memoria)
9. [Auto-Modificacion](#auto-modificacion)
10. [Comandos del Sistema](#comandos-del-sistema)
11. [Comandos Avanzados](#comandos-avanzados)

## Sintaxis de Comandos

Todos los comandos del meta-agente siguen este patron:

```
*command-name [required-param] [--optional-flag value]
```

- Los comandos comienzan con `*` (asterisco)
- Los parametros en `[]` son requeridos
- Los flags comienzan con `--` y pueden tener valores
- Se pueden combinar multiples flags

### Ejemplos

```bash
*create-agent my-agent
*analyze-code src/app.js --depth full
*generate-tests --type unit --coverage 80
```

## Comandos Principales

### *help

Muestra todos los comandos disponibles u obtiene ayuda para un comando especifico.

```bash
*help                    # Mostrar todos los comandos
*help create-agent       # Ayuda para comando especifico
*help --category agents  # Comandos por categoria
```

### *status

Muestra el estado actual del sistema y los agentes activos.

```bash
*status                  # Estado basico
*status --detailed       # Informacion detallada del sistema
*status --health        # Resultados de verificacion de salud
```

### *config

Ver o modificar configuracion.

```bash
*config                  # Ver configuracion actual
*config --set ai.model gpt-4      # Establecer valor de config
*config --reset         # Restablecer a valores por defecto
*config --export        # Exportar configuracion
```

### *version

Muestra informacion de version.

```bash
*version                # Version actual
*version --check-update # Verificar actualizaciones
*version --changelog    # Mostrar changelog
```

## Gestion de Agentes

### *create-agent

Crea un nuevo agente de IA.

```bash
*create-agent <name> [options]

Opciones:
  --type <type>         Tipo de agente: assistant, analyzer, generator, specialist
  --template <name>     Usar plantilla: basic, advanced, custom
  --capabilities        Constructor interactivo de capacidades
  --from-file <path>    Crear desde definicion YAML

Ejemplos:
*create-agent code-reviewer --type analyzer
*create-agent api-builder --template advanced
*create-agent custom-bot --from-file agents/template.yaml
```

### *list-agents

Lista todos los agentes disponibles.

```bash
*list-agents                      # Listar todos los agentes
*list-agents --active            # Solo agentes activos
*list-agents --type analyzer     # Filtrar por tipo
*list-agents --detailed          # Mostrar detalles completos
```

### *activate

Activa un agente para su uso.

```bash
*activate <agent-name>            # Activar agente individual
*activate agent1 agent2          # Activar multiples
*activate --all                  # Activar todos los agentes
*activate --type assistant       # Activar por tipo
```

### *deactivate

Desactiva un agente.

```bash
*deactivate <agent-name>         # Desactivar agente individual
*deactivate --all               # Desactivar todos los agentes
*deactivate --except agent1     # Desactivar todos excepto el especificado
```

### *modify-agent

Modifica configuracion de agente existente.

```bash
*modify-agent <name> [options]

Opciones:
  --add-capability <name>        Agregar nueva capacidad
  --remove-capability <name>     Eliminar capacidad
  --update-instructions         Actualizar instrucciones
  --version <version>           Actualizar version
  --interactive                 Modificacion interactiva

Ejemplos:
*modify-agent helper --add-capability translate
*modify-agent analyzer --update-instructions
*modify-agent bot --interactive
```

### *delete-agent

Elimina un agente (con confirmacion).

```bash
*delete-agent <name>            # Eliminar agente individual
*delete-agent --force          # Omitir confirmacion
*delete-agent --backup         # Crear respaldo antes de eliminar
```

### *clone-agent

Crea una copia de un agente existente.

```bash
*clone-agent <source> <target>  # Clon basico
*clone-agent bot bot-v2 --modify  # Clonar y modificar
```

## Operaciones de Tareas

### *create-task

Crea una nueva tarea reutilizable.

```bash
*create-task <name> [options]

Opciones:
  --type <type>           Tipo de tarea: command, automation, analysis
  --description <text>    Descripcion de la tarea
  --parameters           Definir parametros interactivamente
  --template <name>      Usar plantilla de tarea

Ejemplos:
*create-task validate-input --type command
*create-task daily-backup --type automation
*create-task code-metrics --template analyzer
```

### *list-tasks

Lista las tareas disponibles.

```bash
*list-tasks                     # Listar todas las tareas
*list-tasks --type automation  # Filtrar por tipo
*list-tasks --recent          # Tareas usadas recientemente
*list-tasks --search <query>  # Buscar tareas
```

### *run-task

Ejecuta una tarea especifica.

```bash
*run-task <task-name> [params]

Ejemplos:
*run-task validate-input --data "user input"
*run-task generate-report --format pdf
*run-task backup-database --incremental
```

### *schedule-task

Programa la ejecucion de una tarea.

```bash
*schedule-task <task> <schedule>

Formatos de programacion:
  --cron "0 0 * * *"           Expresion cron
  --every "1 hour"             Intervalo
  --at "14:30"                 Hora especifica
  --on "monday,friday"         Dias especificos

Ejemplos:
*schedule-task cleanup --cron "0 2 * * *"
*schedule-task report --every "6 hours"
*schedule-task backup --at "03:00" --on "sunday"
```

### *modify-task

Actualiza la configuracion de una tarea.

```bash
*modify-task <name> [options]

Opciones:
  --add-param <name>           Agregar parametro
  --update-logic              Actualizar implementacion
  --change-type <type>        Cambiar tipo de tarea
  --rename <new-name>         Renombrar tarea
```

## Comandos de Workflow

### *create-workflow

Crea un workflow automatizado.

```bash
*create-workflow <name> [options]

Opciones:
  --steps                Constructor interactivo de pasos
  --trigger <type>      Tipo de disparador: manual, schedule, event
  --template <name>     Usar plantilla de workflow
  --from-file <path>    Importar desde YAML

Ejemplos:
*create-workflow ci-pipeline --trigger push
*create-workflow daily-tasks --trigger "schedule:0 9 * * *"
*create-workflow deployment --template standard-deploy
```

### *list-workflows

Muestra los workflows disponibles.

```bash
*list-workflows                 # Todos los workflows
*list-workflows --active       # Actualmente en ejecucion
*list-workflows --scheduled    # Workflows programados
*list-workflows --failed       # Ejecuciones fallidas
```

### *run-workflow

Ejecuta un workflow.

```bash
*run-workflow <name> [options]

Opciones:
  --params <json>             Parametros del workflow
  --skip-steps <steps>        Omitir pasos especificos
  --dry-run                   Vista previa sin ejecucion
  --force                     Forzar ejecucion aunque este ejecutandose

Ejemplos:
*run-workflow deploy --params '{"env":"staging"}'
*run-workflow backup --skip-steps "upload"
*run-workflow test-suite --dry-run
```

### *stop-workflow

Detiene un workflow en ejecucion.

```bash
*stop-workflow <name>          # Detener workflow especifico
*stop-workflow --all          # Detener todos los workflows
*stop-workflow --force        # Forzar detencion
```

### *workflow-status

Verifica el estado de ejecucion del workflow.

```bash
*workflow-status <name>        # Estado de workflow individual
*workflow-status --all        # Estados de todos los workflows
*workflow-status --history    # Historial de ejecucion
```

## Generacion de Codigo

### *generate-component

Genera nuevos componentes con asistencia de IA.

```bash
*generate-component <name> [options]

Opciones:
  --type <type>              Tipo de componente: react, vue, angular, web-component
  --features <list>          Caracteristicas del componente
  --style <type>             Estilizado: css, scss, styled-components
  --tests                    Generar pruebas
  --storybook               Generar historias de Storybook
  --template <name>         Usar plantilla de componente

Ejemplos:
*generate-component UserProfile --type react --features "avatar,bio,stats"
*generate-component DataTable --type vue --tests --storybook
*generate-component CustomButton --template material-ui
```

### *generate-api

Genera endpoints de API.

```bash
*generate-api <resource> [options]

Opciones:
  --operations <list>        Operaciones CRUD: create,read,update,delete
  --auth                     Agregar autenticacion
  --validation              Agregar validacion de entrada
  --docs                    Generar documentacion de API
  --tests                   Generar pruebas de API
  --database <type>         Tipo de base de datos: postgres, mongodb, mysql

Ejemplos:
*generate-api users --operations crud --auth --validation
*generate-api products --database mongodb --docs
*generate-api analytics --operations "read" --tests
```

### *generate-tests

Genera suites de pruebas.

```bash
*generate-tests [target] [options]

Opciones:
  --type <type>             Tipo de prueba: unit, integration, e2e
  --framework <name>        Framework de pruebas: jest, mocha, cypress
  --coverage <percent>      Porcentaje de cobertura objetivo
  --mocks                   Generar datos mock
  --fixtures               Generar fixtures de prueba

Ejemplos:
*generate-tests src/utils/ --type unit --coverage 90
*generate-tests src/api/ --type integration --mocks
*generate-tests --type e2e --framework cypress
```

### *generate-documentation

Genera documentacion.

```bash
*generate-documentation [target] [options]

Opciones:
  --format <type>           Formato: markdown, html, pdf
  --type <type>            Tipo de doc: api, user-guide, technical
  --include-examples       Agregar ejemplos de codigo
  --diagrams              Generar diagramas
  --toc                   Generar tabla de contenidos

Ejemplos:
*generate-documentation src/ --type api --format markdown
*generate-documentation --type user-guide --include-examples
*generate-documentation components/ --diagrams --toc
```

## Analisis y Mejora

### *analyze-framework

Analiza toda la base de codigo.

```bash
*analyze-framework [options]

Opciones:
  --depth <level>          Profundidad de analisis: surface, standard, deep
  --focus <areas>          Areas de enfoque: performance, security, quality
  --report-format <type>   Formato: console, json, html
  --save-report <path>     Guardar reporte de analisis
  --compare-previous      Comparar con analisis anterior

Ejemplos:
*analyze-framework --depth deep
*analyze-framework --focus "performance,security"
*analyze-framework --save-report reports/analysis.json
```

### *analyze-code

Analiza archivos de codigo especificos.

```bash
*analyze-code <path> [options]

Opciones:
  --metrics               Mostrar metricas de codigo
  --complexity           Analizar complejidad
  --dependencies         Analizar dependencias
  --suggestions          Obtener sugerencias de mejora
  --security             Analisis de seguridad

Ejemplos:
*analyze-code src/app.js --metrics --complexity
*analyze-code src/api/ --security --suggestions
*analyze-code package.json --dependencies
```

### *improve-code-quality

Mejora la calidad del codigo con asistencia de IA.

```bash
*improve-code-quality <path> [options]

Opciones:
  --focus <aspects>        Enfoque: readability, performance, maintainability
  --refactor-level <level> Nivel: minor, moderate, major
  --preserve-logic        No cambiar funcionalidad
  --add-comments          Agregar comentarios explicativos
  --fix-eslint           Corregir problemas de linting

Ejemplos:
*improve-code-quality src/utils.js --focus readability
*improve-code-quality src/legacy/ --refactor-level major
*improve-code-quality src/api.js --fix-eslint --add-comments
```

### *suggest-refactoring

Obtiene sugerencias de refactorizacion.

```bash
*suggest-refactoring <path> [options]

Opciones:
  --type <type>           Tipo de refactorizacion: extract, inline, rename
  --scope <level>         Alcance: function, class, module, project
  --impact-analysis      Mostrar impacto de cambios
  --preview              Vista previa de cambios
  --auto-apply          Aplicar sugerencias automaticamente

Ejemplos:
*suggest-refactoring src/helpers.js --type extract
*suggest-refactoring src/models/ --scope module
*suggest-refactoring src/app.js --preview --impact-analysis
```

### *detect-patterns

Detecta patrones de codigo y anti-patrones.

```bash
*detect-patterns [path] [options]

Opciones:
  --patterns <list>       Patrones especificos a detectar
  --anti-patterns        Enfocarse en anti-patrones
  --suggest-fixes        Sugerir mejoras de patrones
  --severity <level>     Severidad minima: low, medium, high

Ejemplos:
*detect-patterns --anti-patterns --suggest-fixes
*detect-patterns src/ --patterns "singleton,factory"
*detect-patterns --severity high
```

## Capa de Memoria

### *memory

Operaciones de la capa de memoria.

```bash
*memory <operation> [options]

Operaciones:
  status                 Mostrar estado de capa de memoria
  search <query>        Busqueda semantica
  rebuild               Reconstruir indice de memoria
  clear-cache          Limpiar cache de memoria
  optimize             Optimizar rendimiento de memoria
  export <path>        Exportar datos de memoria
  import <path>        Importar datos de memoria

Ejemplos:
*memory status
*memory search "flujo de autenticacion"
*memory rebuild --verbose
*memory optimize --aggressive
```

### *learn

Aprende de cambios de codigo y patrones.

```bash
*learn [options]

Opciones:
  --from <source>         Fuente: recent-changes, commits, patterns
  --period <time>         Periodo de tiempo: "1 week", "1 month"
  --focus <areas>         Areas de enfoque para aprendizaje
  --update-patterns      Actualizar reconocimiento de patrones
  --save-insights        Guardar insights de aprendizaje

Ejemplos:
*learn --from recent-changes
*learn --from commits --period "1 week"
*learn --focus "error-handling,api-calls"
```

### *remember

Almacena informacion importante en memoria.

```bash
*remember <key> <value> [options]

Opciones:
  --type <type>          Tipo de info: pattern, preference, rule
  --context <context>    Contexto para la memoria
  --expires <time>       Tiempo de expiracion
  --priority <level>     Prioridad: low, normal, high

Ejemplos:
*remember coding-style "use-functional-components" --type preference
*remember api-pattern "always-validate-input" --context security
*remember temp-fix "skip-test-x" --expires "1 week"
```

### *forget

Elimina informacion de la memoria.

```bash
*forget <key>              # Olvidar clave especifica
*forget --pattern <regex>  # Olvidar por patron
*forget --older-than <time> # Olvidar memorias antiguas
*forget --type <type>      # Olvidar por tipo
```

## Auto-Modificacion

### *improve-self

Auto-mejora del meta-agente.

```bash
*improve-self [options]

Opciones:
  --aspect <area>         Area de mejora: speed, accuracy, features
  --based-on <data>      Basarse en: usage, feedback, analysis
  --preview              Vista previa de mejoras
  --backup              Crear respaldo antes de cambios
  --test-improvements   Probar mejoras antes de aplicar

Ejemplos:
*improve-self --aspect accuracy --based-on feedback
*improve-self --preview --test-improvements
*improve-self --aspect features --backup
```

### *evolve

Evoluciona capacidades basandose en uso.

```bash
*evolve [options]

Opciones:
  --strategy <type>      Estrategia de evolucion: conservative, balanced, aggressive
  --focus <areas>        Areas de enfoque para evolucion
  --generations <num>    Numero de ciclos de evolucion
  --fitness-metric      Definir metricas de aptitud
  --rollback-point     Crear punto de rollback

Ejemplos:
*evolve --strategy balanced
*evolve --focus "code-generation,analysis" --generations 3
*evolve --fitness-metric "task-success-rate" --rollback-point
```

### *adapt

Adapta a necesidades especificas del proyecto.

```bash
*adapt [options]

Opciones:
  --to <context>         Adaptarse a: project-type, team-style, domain
  --learn-from <source>  Aprender de: codebase, commits, reviews
  --adaptation-level     Nivel: minimal, moderate, full
  --preserve <aspects>   Preservar comportamientos especificos

Ejemplos:
*adapt --to project-type --learn-from codebase
*adapt --to team-style --adaptation-level moderate
*adapt --to domain --preserve "core-functions"
```

### *optimize-performance

Optimiza el rendimiento del meta-agente.

```bash
*optimize-performance [options]

Opciones:
  --target <metric>      Objetivo: speed, memory, accuracy
  --profile             Perfilar antes de optimizar
  --benchmark          Ejecutar benchmarks
  --aggressive         Optimizacion agresiva
  --safe-mode         Solo optimizacion segura

Ejemplos:
*optimize-performance --target speed --profile
*optimize-performance --target memory --safe-mode
*optimize-performance --benchmark --aggressive
```

## Comandos del Sistema

### *backup

Crea respaldo del sistema.

```bash
*backup [options]

Opciones:
  --include <items>      Items: config, agents, memory, all
  --exclude <items>     Excluir items especificos
  --destination <path>  Destino del respaldo
  --compress           Comprimir respaldo
  --encrypt           Encriptar respaldo

Ejemplos:
*backup --include all --compress
*backup --include "agents,config" --destination backups/
*backup --exclude memory --encrypt
```

### *restore

Restaura desde respaldo.

```bash
*restore <backup-file> [options]

Opciones:
  --items <list>        Items especificos a restaurar
  --preview            Vista previa de operacion de restauracion
  --force             Forzar restauracion sin confirmacion
  --merge             Fusionar con datos existentes

Ejemplos:
*restore backups/backup-2024-01-01.zip
*restore backup.tar.gz --items "agents,config"
*restore latest-backup --preview
```

### *update

Actualiza Synkra AIOX.

```bash
*update [options]

Opciones:
  --check              Solo verificar actualizaciones
  --version <version>  Actualizar a version especifica
  --beta              Incluir versiones beta
  --force            Forzar actualizacion
  --backup          Crear respaldo antes de actualizar

Ejemplos:
*update --check
*update --version 2.0.0 --backup
*update --beta --force
```

### *uninstall

Desinstala componentes o sistema completo.

```bash
*uninstall [component] [options]

Opciones:
  --keep-data         Mantener datos de usuario
  --keep-config      Mantener configuracion
  --complete         Desinstalacion completa
  --dry-run         Vista previa de desinstalacion

Ejemplos:
*uninstall agent-name
*uninstall --complete --keep-data
*uninstall memory-layer --dry-run
```

### *doctor

Diagnosticos y reparacion del sistema.

```bash
*doctor [options]

Opciones:
  --fix              Auto-corregir problemas detectados
  --deep            Escaneo profundo del sistema
  --report <path>   Guardar reporte de diagnostico
  --component <name> Verificar componente especifico

Ejemplos:
*doctor
*doctor --fix
*doctor --deep --report diagnosis.json
*doctor --component memory-layer
```

## Comandos Avanzados

### *export

Exporta configuraciones, agentes o datos.

```bash
*export <type> [options]

Tipos:
  config              Exportar configuracion
  agents             Exportar agentes
  workflows          Exportar workflows
  memory            Exportar datos de memoria
  all              Exportar todo

Opciones:
  --format <type>     Formato: json, yaml, archive
  --destination <path> Destino de exportacion
  --include-sensitive Incluir datos sensibles
  --pretty          Formato legible

Ejemplos:
*export config --format yaml
*export agents --destination exports/agents/
*export all --format archive --destination backup.zip
```

### *import

Importa configuraciones, agentes o datos.

```bash
*import <file> [options]

Opciones:
  --type <type>       Tipo de importacion: config, agents, workflows
  --merge            Fusionar con existente
  --replace         Reemplazar existente
  --validate       Validar antes de importar
  --dry-run       Vista previa de importacion

Ejemplos:
*import agents.json --type agents --merge
*import config.yaml --replace --validate
*import backup.zip --dry-run
```

### *benchmark

Ejecuta benchmarks de rendimiento.

```bash
*benchmark [suite] [options]

Suites:
  all               Ejecutar todos los benchmarks
  generation       Velocidad de generacion de codigo
  analysis        Rendimiento de analisis
  memory          Operaciones de memoria
  e2e            Workflows end-to-end

Opciones:
  --iterations <num>   Numero de iteraciones
  --compare <baseline> Comparar con baseline
  --save-results      Guardar resultados de benchmark
  --profile          Incluir datos de perfilado

Ejemplos:
*benchmark all --iterations 10
*benchmark generation --compare v1.0.0
*benchmark memory --profile --save-results
```

### *debug

Operaciones del modo debug.

```bash
*debug <command> [options]

Comandos:
  enable              Habilitar modo debug
  disable            Deshabilitar modo debug
  logs <level>       Mostrar logs de debug
  trace <operation>  Rastrear operacion especifica
  breakpoint <location> Establecer breakpoint

Opciones:
  --verbose          Salida detallada
  --filter <pattern> Filtrar salida de debug
  --save <path>     Guardar sesion de debug

Ejemplos:
*debug enable --verbose
*debug logs error --filter "api"
*debug trace create-agent --save debug-session.log
```

### *plugin

Gestion de plugins.

```bash
*plugin <operation> [options]

Operaciones:
  install <name>      Instalar plugin
  remove <name>      Eliminar plugin
  list              Listar plugins instalados
  search <query>    Buscar plugins disponibles
  create <name>     Crear nuevo plugin

Opciones:
  --version <ver>     Version del plugin
  --source <url>     Fuente del plugin
  --enable          Habilitar despues de instalar
  --dev            Modo desarrollo

Ejemplos:
*plugin install code-formatter --enable
*plugin create my-custom-plugin --dev
*plugin search "testing"
*plugin list --detailed
```

## Atajos de Comandos

Los comandos comunes tienen atajos:

```bash
*h     → *help
*s     → *status
*la    → *list-agents
*lt    → *list-tasks
*lw    → *list-workflows
*ca    → *create-agent
*ct    → *create-task
*cw    → *create-workflow
*a     → *analyze-framework
*i     → *improve-code-quality
```

## Encadenamiento de Comandos

Encadena multiples comandos:

```bash
# Usando && para ejecucion secuencial
*analyze-framework && *suggest-improvements && *generate-report

# Usando pipes para flujo de datos
*analyze-code src/ | *improve-code-quality | *generate-tests

# Usando ; para ejecucion independiente
*backup ; *update ; *doctor --fix
```

## Modo Interactivo

Ingresa al modo interactivo para comandos continuos:

```bash
*interactive

AIOX> create-agent helper
AIOX> activate helper
AIOX> helper translate "Hello" --to spanish
AIOX> exit
```

## Variables de Entorno

Controla el comportamiento con variables de entorno:

```bash
AIOX_AI_PROVIDER=openai          # Proveedor de IA
AIOX_AI_MODEL=gpt-4             # Modelo de IA
AIOX_LOG_LEVEL=debug            # Nivel de log
AIOX_TELEMETRY=disabled         # Configuracion de telemetria
AIOX_TIMEOUT=30000             # Timeout de comando (ms)
AIOX_MEMORY_CACHE=true         # Cache de memoria
```

## Manejo de Errores

Respuestas de error comunes y soluciones:

```bash
# Permiso denegado
*sudo <command>                 # Ejecutar con permisos elevados

# Comando no encontrado
*help <command>                # Verificar nombre correcto del comando
*update                       # Actualizar a ultima version

# Error de timeout
*config --set timeout 60000   # Aumentar timeout
*<command> --async           # Ejecutar asincronamente

# Error de memoria
*memory clear-cache          # Limpiar cache de memoria
*optimize-performance --target memory
```

---

**Consejos Pro:**

1. Usa `*help <command>` liberalmente - proporciona ejemplos detallados
2. El autocompletado con Tab funciona para comandos y parametros
3. El historial de comandos esta disponible con flechas arriba/abajo
4. Usa `--dry-run` para previsualizar operaciones peligrosas
5. Combina comandos con pipes y cadenas para workflows poderosos

Recuerda: El meta-agente aprende de tus patrones de uso. Cuanto mas lo uses, mejor se vuelve anticipando tus necesidades!
