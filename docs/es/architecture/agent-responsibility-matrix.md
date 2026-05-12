<!-- Traducción: ES | Original: /docs/en/architecture/agent-responsibility-matrix.md | Sincronización: 2026-01-26 -->

# Matriz de Responsabilidad de Agentes - Mejoras Estratégicas Épica 3

> 🌐 [EN](../../architecture/agent-responsibility-matrix.md) | [PT](../../pt/architecture/agent-responsibility-matrix.md) | **ES**

---

**Versión del Documento**: 1.0
**Última Actualización**: 2025-10-25
**Autor**: Winston (@architect) + Sarah (@po)
**Contexto**: Épica 3 Fase 2 - Mejoras Estratégicas (Historias 3.13-3.19)

---

## Resumen Ejecutivo

Este documento define límites claros de responsabilidad para todos los agentes AIOX, con enfoque particular en:
1. **Centralización de GitHub DevOps** - Solo @github-devops puede hacer push al repositorio remoto
2. **Especialización de Arquitectura de Datos** - @data-architect maneja base de datos/ciencia de datos
3. **División de Gestión de Ramas** - @sm (local) vs @github-devops (remoto)
4. **Restricciones de Operaciones Git** - Qué agentes pueden hacer qué con git/GitHub

**Regla Crítica**: SOLO el agente @github-devops puede ejecutar `git push` al repositorio remoto.

---

## Matriz de Operaciones Git/GitHub

### Autoridad Completa de Operaciones

| Operación | @github-devops | @dev | @sm | @qa | @architect | @po |
|-----------|:--------------:|:----:|:---:|:---:|:----------:|:---:|
| **git push** | ✅ SOLO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git push --force** | ✅ SOLO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr create** | ✅ SOLO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh pr merge** | ✅ SOLO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **gh release create** | ✅ SOLO | ❌ | ❌ | ❌ | ❌ | ❌ |
| **git commit** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git add** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **git checkout -b** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git merge** (local) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **git status** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git log** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **git diff** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### Mecanismo de Aplicación

**Defensa en Profundidad Multi-Capa**:

1. **Hook Git Pre-Push** (Aplicación Primaria)
   - Ubicación: `.git/hooks/pre-push`
   - Verifica: Variable de entorno `$AIOX_ACTIVE_AGENT`
   - Acción: Bloquea push si agente != "github-devops"

2. **Variables de Entorno** (Detección en Tiempo de Ejecución)
   ```bash
   export AIOX_ACTIVE_AGENT="github-devops"
   export AIOX_GIT_PUSH_ALLOWED="true"
   ```

3. **Definiciones de Agentes** (Documentación + Restricciones)
   - Todos los agentes tienen sección `git_restrictions`
   - Listas claras de `allowed_operations` y `blocked_operations`
   - Mensajes de redirección apuntan a @github-devops

4. **Configuración de IDE** (Capa UX)
   ```json
   {
     "agents": {
       "dev": { "blockedOperations": ["push"] },
       "github-devops": { "allowedOperations": ["*"] }
     }
   }
   ```

---

## Límites de Responsabilidad de Agentes

### @architect (Winston) 🏗️
**Rol**: Arquitecto de Sistemas Holístico y Líder Técnico Full-Stack

**Alcance Principal**:
- Arquitectura de sistemas (microservicios, monolito, serverless, híbrido)
- Selección de stack tecnológico (frameworks, lenguajes, plataformas)
- Planificación de infraestructura (despliegue, escalado, monitoreo, CDN)
- Diseño de APIs (REST, GraphQL, tRPC, WebSocket)
- Arquitectura de seguridad (autenticación, autorización, encriptación)
- Arquitectura frontend (gestión de estado, enrutamiento, rendimiento)
- Arquitectura backend (límites de servicios, flujos de eventos, caché)
- Preocupaciones transversales (logging, monitoreo, manejo de errores)

**Operaciones Git**: Solo lectura (status, log, diff) - SIN PUSH

**Delegar A**:
- **@data-architect**: Diseño de esquemas de base de datos, optimización de consultas, pipelines ETL
- **@github-devops**: Git push, creación de PR, configuración CI/CD

**Retener**:
- Selección de tecnología de base de datos desde perspectiva de sistema
- Integración de capa de datos con arquitectura de aplicación
- Diseño de flujo de trabajo git (estrategia de ramas)

---

### @data-architect (DataArch) 🗄️
**Rol**: Arquitecto de Base de Datos y Especialista en Flujos de Trabajo de Ciencia de Datos

**Alcance Principal**:
- Diseño de esquemas de base de datos (tablas, relaciones, índices, restricciones)
- Modelado de datos (estrategias de normalización, desnormalización)
- Optimización de consultas y ajuste de rendimiento
- Diseño e implementación de pipelines ETL
- Arquitectura de flujos de trabajo de ciencia de datos
- Optimización específica de Supabase (políticas RLS, realtime, edge functions)
- Gobernanza de datos (seguridad, privacidad, cumplimiento)

**Operaciones Git**: Commits locales (add, commit) - SIN PUSH

**Colaborar Con**:
- **@architect**: Selección de tecnología de base de datos, integración de capa de datos
- **@github-devops**: Push de archivos de migración después de commit local

**Especialización**: Experto en Supabase (Row-Level Security, realtime, edge functions, storage)

---

### @dev (James) 💻
**Rol**: Ingeniero de Software Senior Experto y Especialista en Implementación

**Alcance Principal**:
- Implementación de código desde historias
- Depuración y refactorización
- Pruebas unitarias/de integración
- Operaciones git locales (add, commit, checkout, merge)
- Ejecución de tareas de historias

**Operaciones Git**:
- ✅ Permitidas: add, commit, status, diff, log, branch, checkout, merge (local)
- ❌ Bloqueadas: push, gh pr create

**Flujo de Trabajo Después de Historia Completada**:
1. Marcar estado de historia: "Listo para Revisión"
2. Notificar al usuario: "Historia completada. Activa @github-devops para hacer push de los cambios"
3. NO intentar git push

---

### @sm (Bob) 🏃
**Rol**: Scrum Master Técnico - Especialista en Preparación de Historias

**Alcance Principal**:
- Creación y refinamiento de historias
- Gestión de épicas y desglose
- Asistencia en planificación de sprints
- Gestión de ramas locales durante desarrollo
- Guía de resolución de conflictos (merges locales)

**Operaciones Git**:
- ✅ Permitidas: checkout -b (crear ramas de características), branch (listar), merge (local)
- ❌ Bloqueadas: push, gh pr create, eliminación de ramas remotas

**Flujo de Trabajo de Gestión de Ramas**:
1. Historia inicia → Crear rama de características local: `git checkout -b feature/X.Y-nombre-historia`
2. Desarrollador hace commits localmente
3. Historia completada → Notificar a @github-devops para hacer push y crear PR

**Nota**: @sm gestiona ramas LOCALES durante desarrollo, @github-devops gestiona operaciones REMOTAS

---

### @github-devops (DevOps) 🚀
**Rol**: Gestor de Repositorio GitHub y Especialista DevOps

**AUTORIDAD PRINCIPAL**: ÚNICO agente autorizado para hacer push al repositorio remoto

**Operaciones Exclusivas**:
- ✅ git push (TODAS las variantes)
- ✅ gh pr create, gh pr merge
- ✅ gh release create
- ✅ Eliminación de ramas remotas

**Alcance Principal**:
- Integridad y gobernanza del repositorio
- Ejecución de puertas de calidad pre-push (lint, test, typecheck, build)
- Versionado semántico y gestión de releases
- Creación y gestión de pull requests
- Configuración de pipeline CI/CD (GitHub Actions)
- Limpieza de repositorio (ramas obsoletas, archivos temporales)
- Generación de changelog

**Puertas de Calidad (Obligatorias Antes de Push)**:
- npm run lint → PASA
- npm test → PASA
- npm run typecheck → PASA
- npm run build → PASA
- Estado de historia = "Hecho" o "Listo para Revisión"
- Sin cambios sin commit
- Sin conflictos de merge
- **Confirmación del usuario requerida**

**Lógica de Versionado Semántico**:
- MAJOR (v4 → v5): Cambios incompatibles, rediseño de API
- MINOR (v4.31 → v4.32): Nuevas características, compatible hacia atrás
- PATCH (v4.31.0 → v4.31.1): Solo corrección de errores

---

### @qa (Quinn) 🧪
**Rol**: Arquitecto de Pruebas y Asesor de Calidad

**Alcance Principal**:
- Revisión integral de arquitectura de pruebas
- Decisiones de puertas de calidad (PASA/PREOCUPACIONES/FALLA/EXENTO)
- Evaluación de riesgos y estrategia de pruebas
- Trazabilidad de requisitos
- Asesoría (no bloquea, proporciona recomendaciones)

**Operaciones Git**: Solo lectura (status, log, diff para revisión) - SIN COMMIT, SIN PUSH

**Nota**: QA revisa código pero no hace commits. @dev hace commits, @github-devops hace push.

---

### @po (Sarah) 📝
**Rol**: Product Owner Técnico y Custodio de Procesos

**Alcance Principal**:
- Gestión de backlog y refinamiento de historias
- Validación de criterios de aceptación
- Planificación de sprints y priorización
- Adherencia a procesos y aseguramiento de calidad
- Integridad del ecosistema de documentación

**Operaciones Git**: Ninguna (el rol de PO es no técnico respecto a git)

**Nota**: @po valida requisitos y prioriza trabajo, no interactúa con git.

---

## Ejemplos de Flujo de Trabajo

### Escenario 1: Desarrollo de Historia Estándar

```
1. Usuario: "Iniciar Historia 3.14: Agente GitHub DevOps"

2. @sm se activa:
   - Crea rama de características: `git checkout -b feature/3.14-github-devops-agent`
   - Transfiere a @dev

3. @dev se activa:
   - Implementa tareas de la historia
   - Hace commit local: `git add . && git commit -m "feat: implement pre-push quality gate"`
   - Marca historia: "Listo para Revisión"
   - Notifica al usuario: "Historia completada. Activa @github-devops para hacer push"

4. @github-devops se activa:
   - Ejecuta *pre-push (puertas de calidad)
   - TODO PASA → Presenta resumen
   - Usuario confirma
   - Hace push: `git push -u origin feature/3.14-github-devops-agent`
   - Crea PR: `gh pr create --title "Story 3.14: GitHub DevOps Agent" --body "..."`
   - Reporta: "✅ Push exitoso. PR #123 creado: https://github.com/..."
```

### Escenario 2: Diseño de Esquema de Base de Datos

```
1. Usuario: "Diseñar esquema de base de datos para autenticación de usuarios"

2. @architect se activa:
   - Analiza requisitos del sistema
   - Decide: "Usar Supabase para persistencia"
   - Delega: "Activando @data-architect para diseño de esquema"

3. @data-architect se activa:
   - Ejecuta *design-schema
   - Crea tablas: users, sessions, auth_providers
   - Diseña políticas RLS para seguridad a nivel de fila
   - Genera migración: `20251025_create_auth_schema.sql`
   - Hace commit local: `git add migrations/ && git commit -m "feat: add auth schema"`
   - Notifica: "Esquema diseñado. Activa @github-devops para hacer push de migración"

4. @github-devops se activa:
   - Ejecuta *pre-push (puertas de calidad)
   - Hace push de migración al repositorio
```

### Escenario 3: Creación de Release

```
1. Usuario: "Crear release v4.32.0"

2. @github-devops se activa:
   - Ejecuta *version-check
   - Analiza commits desde v4.31.0
   - Recomienda: "Incremento de versión MINOR (nuevas características, compatible hacia atrás)"
   - Usuario confirma: v4.32.0
   - Ejecuta *pre-push (puertas de calidad)
   - Genera changelog desde commits
   - Crea tag: `git tag v4.32.0`
   - Hace push: `git push && git push --tags`
   - Crea GitHub release: `gh release create v4.32.0 --title "Release v4.32.0" --notes "..."`
   - Reporta: "✅ Release v4.32.0 creado: https://github.com/.../releases/v4.32.0"
```

---

## Arquitectura de Datos vs Arquitectura de Sistema

### Matriz de Comparación

| Responsabilidad | @architect | @data-architect |
|-----------------|:----------:|:---------------:|
| **Selección de tecnología de BD (vista de sistema)** | ✅ | 🤝 Colaborar |
| **Diseño de esquema de base de datos** | ❌ Delegar | ✅ Principal |
| **Optimización de consultas** | ❌ Delegar | ✅ Principal |
| **Diseño de pipeline ETL** | ❌ Delegar | ✅ Principal |
| **Diseño de API para acceso a datos** | ✅ Principal | 🤝 Colaborar |
| **Caché a nivel de aplicación** | ✅ Principal | 🤝 Consultar |
| **Optimizaciones específicas de BD (RLS, triggers)** | ❌ Delegar | ✅ Principal |
| **Flujos de trabajo de ciencia de datos** | ❌ Delegar | ✅ Principal |
| **Infraestructura para BD (escalado, replicación)** | ✅ Principal | 🤝 Consultar |

### Patrón de Colaboración

**Pregunta**: "¿Qué base de datos deberíamos usar?"
- **@architect responde**: Perspectiva de sistema (costo, despliegue, habilidades del equipo, infraestructura)
- **@data-architect responde**: Perspectiva de datos (patrones de consulta, escalabilidad, ajuste del modelo de datos)
- **Resultado**: Recomendación combinada

**Pregunta**: "Diseñar esquema de base de datos"
- **@architect**: Delega a @data-architect
- **@data-architect**: Diseña esquema, crea migraciones
- **@architect**: Integra esquema en sistema (API, ORM, caché)

---

## Responsabilidades de Gestión de Ramas

### Ramas Locales (@sm durante desarrollo)

**Responsabilidades**:
- Crear ramas de características cuando inicia historia
- Gestionar ramas de trabajo del desarrollador
- Limpieza de ramas locales (eliminar ramas locales mergeadas)

**Comandos**:
```bash
# @sm puede ejecutar:
git checkout -b feature/3.14-github-devops
git branch -d feature/old-branch
git merge feature/branch-to-integrate
```

### Ramas Remotas (@github-devops para repositorio)

**Responsabilidades**:
- Hacer push de ramas a remoto
- Eliminar ramas remotas (limpieza)
- Gestionar ramas de release
- Proteger rama main/master

**Comandos**:
```bash
# SOLO @github-devops puede ejecutar:
git push -u origin feature/3.14-github-devops
git push origin --delete feature/old-branch
gh pr create
gh pr merge
```

---

## Lista de Verificación de Implementación para Historia 3.14

- [ ] **Crear Hook Git Pre-Push**
  - Ubicación: `.git/hooks/pre-push`
  - Contenido: Verificar `$AIOX_ACTIVE_AGENT`, bloquear si != "github-devops"
  - Hacer ejecutable: `chmod +x .git/hooks/pre-push`

- [ ] **Actualizar Todas las Definiciones de Agentes** (HECHO ✅)
  - [x] @architect - Agregado `git_restrictions` y límites de colaboración
  - [x] @dev - Removido git push, agregado redirección de flujo de trabajo
  - [x] @sm - Clarificada gestión de ramas solo local
  - [x] @qa - Operaciones git de solo lectura
  - [x] @github-devops - Creado con autoridad exclusiva de push
  - [x] @data-architect - Creado con especialización en datos

- [ ] **Actualizar Scripts de Activación de Agentes**
  - Agregar configuración de variable de entorno: `AIOX_ACTIVE_AGENT={agent_id}`
  - Configurar `AIOX_GIT_PUSH_ALLOWED` apropiadamente

- [ ] **Configuración de IDE** (.claude/settings.json)
  - Agregar `agents.{id}.blockedOperations` para cada agente
  - Documentar en guía de configuración de IDE

- [ ] **Actualizaciones de Documentación**
  - [x] Matriz de responsabilidad de agentes (este documento)
  - [ ] Actualizar git-workflow-guide.md
  - [ ] Actualizar documentación de onboarding de desarrolladores

- [ ] **Pruebas**
  - Probar @dev intentando git push (debería bloquearse)
  - Probar @github-devops git push (debería tener éxito)
  - Probar puertas de calidad antes de push
  - Probar flujo de trabajo de creación de PR

---

## Consideraciones Futuras

### Historia 3.19: Capa de Memoria (Condicional)
Si se aprueba después de auditoría de utilidades (Historia 3.17):
- Capa de memoria no necesita restricciones git (utilidad, no agente)
- Integración con agentes no cambia límites de responsabilidad

### Squads
Si se agregan nuevos agentes vía Squads:
- **Por defecto**: SIN capacidad de git push
- **Proceso de Excepción**: Debe ser explícitamente aprobado por PO y justificado
- **Aplicación**: Hook pre-push bloquea automáticamente a menos que ID de agente esté en lista blanca

---

## Resumen

**Puntos Clave**:
1. ✅ Solo @github-devops puede hacer push al repositorio remoto (aplicado vía hooks git)
2. ✅ @architect maneja arquitectura de sistema, @data-architect maneja capa de datos
3. ✅ @sm gestiona ramas locales, @github-devops gestiona operaciones remotas
4. ✅ Puertas de calidad son obligatorias antes de cualquier push
5. ✅ Todos los agentes tienen límites claros y documentados

**Aplicación**: Multi-capa (hooks + variables de entorno + definiciones de agentes + configuración de IDE)

**Estado**: ✅ Listo para implementación en Historia 3.14

---

*Documento mantenido por @architect (Winston) y @po (Sarah)*
*Última revisión: 2025-10-25*
