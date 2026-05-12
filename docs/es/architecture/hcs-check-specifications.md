<!-- Traducción: ES | Original: /docs/en/architecture/hcs-check-specifications.md | Sincronización: 2026-01-26 -->

# Especificaciones de Verificaciones HCS

> 🌐 [EN](../../architecture/hcs-check-specifications.md) | [PT](../../pt/architecture/hcs-check-specifications.md) | **ES**

---

**Versión:** 1.0
**Estado:** Propuesto
**Creado:** 2025-12-30
**Historia:** Investigación HCS-1
**Autor:** @architect (Aria) vía @dev (Dex)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura de Verificaciones](#arquitectura-de-verificaciones)
- [Dominio 1: Coherencia del Proyecto](#dominio-1-coherencia-del-proyecto)
- [Dominio 2: Entorno Local](#dominio-2-entorno-local)
- [Dominio 3: Salud del Repositorio](#dominio-3-salud-del-repositorio)
- [Dominio 4: Entorno de Despliegue](#dominio-4-entorno-de-despliegue)
- [Dominio 5: Integración de Servicios](#dominio-5-integración-de-servicios)
- [Matriz de Verificación IDE/CLI](#matriz-de-verificación-idecli)
- [Extensión de Verificaciones Personalizadas](#extensión-de-verificaciones-personalizadas)
- [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)

---

## Descripción General

El Sistema de Verificación de Salud (HCS) realiza verificaciones diagnósticas en 5 dominios, totalizando más de 33 verificaciones individuales. Cada verificación tiene:

- **ID Único:** Para seguimiento y reportes
- **Severidad:** CRITICAL, HIGH, MEDIUM, LOW, INFO
- **Nivel de Auto-reparación:** 1 (silencioso), 2 (con confirmación), 3 (guía manual), N/A
- **Modo:** quick (solo verificaciones rápidas), full (todas las verificaciones)
- **Duración Objetivo:** Tiempo de ejecución esperado

### Resumen de Conteo de Verificaciones

| Dominio                  | Total Verificaciones | Modo Rápido | Modo Completo |
| ------------------------ | -------------------- | ----------- | ------------- |
| Coherencia del Proyecto  | 8                    | 4           | 8             |
| Entorno Local            | 8                    | 5           | 8             |
| Salud del Repositorio    | 8                    | 3           | 8             |
| Entorno de Despliegue    | 5                    | 2           | 5             |
| Integración de Servicios | 4                    | 4           | 4             |
| **Total**                | **33**               | **18**      | **33**        |

---

## Arquitectura de Verificaciones

### Decisión de Arquitectura: Patrón Híbrido

Basado en investigación de la industria, HCS usa una **arquitectura híbrida** combinando:

1. **Verificaciones basadas en código** para funcionalidad core (rendimiento, lógica compleja)
2. **Verificaciones basadas en YAML** para extensibilidad (verificaciones personalizadas, específicas del proyecto)

```
┌─────────────────────────────────────────────────────────────┐
│                    Motor de Health Check                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Checks Core (JS)   │    │ Checks Custom (YAML) │       │
│  │                      │    │                       │       │
│  │  • Coherencia Proy.  │    │  • Específicos proy.  │       │
│  │  • Entorno Local     │    │  • Convenciones equipo│       │
│  │  • Salud Repositorio │    │  • Tests integración  │       │
│  └──────────┬───────────┘    └───────────┬───────────┘       │
│             │                            │                   │
│             └────────────┬───────────────┘                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Check Runner                         │  │
│  │  • Ejecución paralela    • Caché                      │  │
│  │  • Manejo de timeout     • Agregación de resultados   │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Auto-reparación                      │  │
│  │  Nivel 1 → Auto    Nivel 2 → Confirmar   Nivel 3 → Guía│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Interfaz de Verificación

```javascript
// Interfaz core de verificación (JavaScript)
class BaseCheck {
  constructor(options) {
    this.id = options.id; // ej., "PC-001"
    this.name = options.name; // Nombre legible
    this.domain = options.domain; // project | local | repo | deploy | services
    this.severity = options.severity; // CRITICAL | HIGH | MEDIUM | LOW | INFO
    this.tier = options.tier; // 1 | 2 | 3 | null
    this.mode = options.mode; // quick | full
    this.timeout = options.timeout || 5000; // ms
  }

  // Sobrescribir en subclase
  async check(context) {
    // Retorna { passed: boolean, message: string, details?: any }
    throw new Error('No implementado');
  }

  // Opcional: lógica de reparación
  async heal(context) {
    return { healed: false, message: 'Sin auto-corrección disponible' };
  }
}
```

```yaml
# Definición de verificación personalizada (YAML)
id: CUSTOM-001
name: Verificación de convenciones de codificación del equipo
domain: project
severity: LOW
tier: 3
mode: full
timeout: 3000

check:
  type: file-pattern
  pattern: 'src/**/*.ts'
  rule: no-console-log
  message: 'Declaraciones console.log encontradas en código de producción'

heal:
  type: manual-guide
  steps:
    - 'Eliminar declaraciones console.log o usar logging apropiado'
    - 'Ejecutar: eslint --fix src/'
```

---

## Dominio 1: Coherencia del Proyecto

**Propósito:** Verificar que los archivos del framework AIOX están correctamente configurados y son consistentes.

### Verificaciones

| ID     | Nombre                      | Severidad | Nivel | Modo  | Timeout | Descripción                                         |
| ------ | --------------------------- | --------- | ----- | ----- | ------- | --------------------------------------------------- |
| PC-001 | Config existe               | CRITICAL  | 1     | quick | 100ms   | `.aiox/config.yaml` existe y es YAML válido         |
| PC-002 | Referencias agentes válidas | HIGH      | 3     | full  | 2s      | Tareas referencian agentes existentes               |
| PC-003 | Estándares codificación     | MEDIUM    | 2     | full  | 100ms   | `docs/framework/coding-standards.md` existe         |
| PC-004 | Tech stack existe           | MEDIUM    | 2     | full  | 100ms   | `docs/framework/tech-stack.md` existe               |
| PC-005 | Source tree existe          | MEDIUM    | 2     | full  | 100ms   | `docs/framework/source-tree.md` existe              |
| PC-006 | Sin archivos huérfanos      | LOW       | 3     | full  | 5s      | Todos archivos en `.aiox-core/` están referenciados |
| PC-007 | Manifiestos válidos         | HIGH      | 3     | quick | 1s      | Todos los manifiestos YAML se parsean correctamente |
| PC-008 | Rutas plantillas válidas    | MEDIUM    | 3     | full  | 2s      | Plantillas referencian archivos existentes          |

### Detalles de Implementación

```javascript
// PC-001: Config existe
class ConfigExistsCheck extends BaseCheck {
  constructor() {
    super({
      id: 'PC-001',
      name: 'Config existe',
      domain: 'project',
      severity: 'CRITICAL',
      tier: 1,
      mode: 'quick',
      timeout: 100,
    });
  }

  async check(context) {
    const configPath = path.join(context.projectRoot, '.aiox', 'config.yaml');

    if (!(await fs.pathExists(configPath))) {
      return {
        passed: false,
        message: '.aiox/config.yaml no encontrado',
        autoFixAvailable: true,
      };
    }

    try {
      const content = await fs.readFile(configPath, 'utf8');
      yaml.parse(content);
      return { passed: true, message: 'Archivo de config válido' };
    } catch (error) {
      return {
        passed: false,
        message: `YAML inválido: ${error.message}`,
        autoFixAvailable: true,
      };
    }
  }

  async heal(context) {
    const templatePath = '.aiox-core/infrastructure/templates/core-config/config-template.yaml';
    const configPath = path.join(context.projectRoot, '.aiox', 'config.yaml');

    await fs.ensureDir(path.dirname(configPath));
    await fs.copy(templatePath, configPath);

    return { healed: true, message: 'Config recreado desde plantilla' };
  }
}
```

---

## Dominio 2: Entorno Local

**Propósito:** Verificar que el entorno de desarrollo está correctamente configurado.

### Verificaciones

| ID     | Nombre                  | Severidad | Nivel | Modo  | Timeout | Descripción                               |
| ------ | ----------------------- | --------- | ----- | ----- | ------- | ----------------------------------------- |
| LE-001 | Versión Node.js         | CRITICAL  | 3     | quick | 500ms   | Node.js 18+ instalado                     |
| LE-002 | Gestor de paquetes      | CRITICAL  | 3     | quick | 500ms   | npm/yarn/pnpm disponible                  |
| LE-003 | Git configurado         | CRITICAL  | 3     | quick | 500ms   | Git instalado con config de usuario       |
| LE-004 | GitHub CLI auth         | HIGH      | 3     | full  | 2s      | `gh auth status` pasa                     |
| LE-005 | MCPs respondiendo       | HIGH      | 1     | quick | 5s      | Servidores MCP saludables                 |
| LE-006 | CLAUDE.md válido        | MEDIUM    | 2     | quick | 500ms   | Secciones requeridas presentes            |
| LE-007 | Reglas IDE configuradas | LOW       | 2     | full  | 1s      | Reglas VS Code/Cursor existen             |
| LE-008 | Variables entorno set   | HIGH      | 3     | full  | 500ms   | Variables de entorno requeridas definidas |

### Detalles de Implementación

```javascript
// LE-001: Verificación versión Node.js
class NodeVersionCheck extends BaseCheck {
  constructor() {
    super({
      id: 'LE-001',
      name: 'Versión Node.js',
      domain: 'local',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'quick',
      timeout: 500,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('node', ['--version']);
      const version = stdout.trim().replace('v', '');
      const major = parseInt(version.split('.')[0], 10);

      if (major >= 18) {
        return {
          passed: true,
          message: `Node.js ${version} instalado`,
          details: { version, major },
        };
      }

      return {
        passed: false,
        message: `Node.js ${version} está por debajo del mínimo (18.0.0)`,
        guide: {
          title: 'Actualizar Node.js',
          steps: [
            'Visitar https://nodejs.org/en/download/',
            'Descargar Node.js 18 LTS o posterior',
            'Ejecutar el instalador',
            'Reiniciar tu terminal',
          ],
        },
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Node.js no encontrado',
        guide: {
          title: 'Instalar Node.js',
          steps: [
            'Visitar https://nodejs.org/en/download/',
            'Descargar Node.js 18 LTS',
            'Ejecutar el instalador',
            'Verificar con: node --version',
          ],
        },
      };
    }
  }
}

// LE-005: Verificación de salud MCP
class McpHealthCheck extends BaseCheck {
  constructor() {
    super({
      id: 'LE-005',
      name: 'MCPs respondiendo',
      domain: 'local',
      severity: 'HIGH',
      tier: 1,
      mode: 'quick',
      timeout: 5000,
    });
  }

  async check(context) {
    const mcpConfig = await this.loadMcpConfig();
    const results = [];

    for (const [name, config] of Object.entries(mcpConfig.mcpServers || {})) {
      try {
        const healthy = await this.pingMcp(name, config);
        results.push({ name, healthy, error: null });
      } catch (error) {
        results.push({ name, healthy: false, error: error.message });
      }
    }

    const unhealthy = results.filter((r) => !r.healthy);

    if (unhealthy.length === 0) {
      return {
        passed: true,
        message: `Todos los ${results.length} MCPs saludables`,
        details: { mcps: results },
      };
    }

    return {
      passed: false,
      message: `${unhealthy.length}/${results.length} MCPs no saludables`,
      details: { mcps: results },
      autoFixAvailable: true,
    };
  }

  async heal(context) {
    // Intentar reiniciar MCPs no saludables
    const unhealthy = context.details.mcps.filter((m) => !m.healthy);

    for (const mcp of unhealthy) {
      try {
        await this.restartMcp(mcp.name);
        console.log(`  Reiniciado: ${mcp.name}`);
      } catch (error) {
        console.error(`  Falló reinicio de ${mcp.name}: ${error.message}`);
      }
    }

    return { healed: true, message: 'MCPs no saludables reiniciados' };
  }
}
```

---

## Dominio 3: Salud del Repositorio

**Propósito:** Verificar la salud del repositorio Git e integración con GitHub.

### Verificaciones

| ID     | Nombre                 | Severidad | Nivel | Modo  | Timeout | Descripción                                |
| ------ | ---------------------- | --------- | ----- | ----- | ------- | ------------------------------------------ |
| RH-001 | Workflows válidos      | HIGH      | 3     | full  | 2s      | GitHub Actions YAML es válido              |
| RH-002 | Sin workflows fallidos | MEDIUM    | 3     | full  | 5s      | Últimos 10 workflows pasaron               |
| RH-003 | Protección de rama     | MEDIUM    | 3     | full  | 2s      | Rama main está protegida                   |
| RH-004 | Secretos configurados  | HIGH      | 3     | full  | 2s      | Secretos requeridos existen                |
| RH-005 | Sin PRs obsoletos      | LOW       | 3     | full  | 3s      | Sin PRs mayores a 30 días                  |
| RH-006 | Dependencias actuales  | MEDIUM    | 2     | full  | 5s      | Sin deps obsoletas con problemas seguridad |
| RH-007 | Sin vulnerabilidades   | CRITICAL  | 3     | quick | 10s     | `npm audit` pasa                           |
| RH-008 | Gitignore completo     | LOW       | 1     | quick | 100ms   | Patrones requeridos en .gitignore          |

### Detalles de Implementación

```javascript
// RH-007: Verificación de vulnerabilidades de seguridad
class VulnerabilityCheck extends BaseCheck {
  constructor() {
    super({
      id: 'RH-007',
      name: 'Sin vulnerabilidades',
      domain: 'repository',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'quick',
      timeout: 10000,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('npm', ['audit', '--json'], {
        cwd: context.projectRoot,
      });

      const audit = JSON.parse(stdout);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};

      const critical = vulnerabilities.critical || 0;
      const high = vulnerabilities.high || 0;

      if (critical === 0 && high === 0) {
        return {
          passed: true,
          message: 'Sin vulnerabilidades críticas o altas',
          details: { vulnerabilities },
        };
      }

      return {
        passed: false,
        message: `Encontradas ${critical} críticas, ${high} altas vulnerabilidades`,
        details: { vulnerabilities, audit },
        guide: {
          title: 'Vulnerabilidades de Seguridad Detectadas',
          steps: [
            'Ejecutar: npm audit para detalles',
            'Ejecutar: npm audit fix para correcciones automáticas',
            'Para cambios incompatibles: npm audit fix --force (usar con precaución)',
            'Revisar detalles CVE antes de actualizar',
          ],
          urgency: critical > 0 ? 'INMEDIATA' : 'ALTA',
        },
      };
    } catch (error) {
      return {
        passed: false,
        message: `Audit falló: ${error.message}`,
        details: { error: error.message },
      };
    }
  }
}
```

---

## Dominio 4: Entorno de Despliegue

**Propósito:** Verificar la configuración de despliegue y salud del entorno externo.

### Verificaciones

| ID     | Nombre               | Severidad | Nivel | Modo  | Timeout | Descripción                           |
| ------ | -------------------- | --------- | ----- | ----- | ------- | ------------------------------------- |
| DE-001 | Modo despliegue      | INFO      | N/A   | quick | 100ms   | Detectar local/staging/prod           |
| DE-002 | Vars entorno por env | HIGH      | 3     | full  | 500ms   | Variables específicas de entorno set  |
| DE-003 | Conexión remota      | HIGH      | 3     | full  | 5s      | Puede alcanzar objetivo de despliegue |
| DE-004 | Certificados SSL     | CRITICAL  | 3     | full  | 5s      | Certificados válidos y no expirando   |
| DE-005 | Endpoints servicio   | HIGH      | 3     | full  | 10s     | Endpoints API respondiendo            |

### Detalles de Implementación

```javascript
// DE-004: Verificación de certificado SSL
class SslCertificateCheck extends BaseCheck {
  constructor() {
    super({
      id: 'DE-004',
      name: 'Certificados SSL',
      domain: 'deployment',
      severity: 'CRITICAL',
      tier: 3,
      mode: 'full',
      timeout: 5000,
    });
  }

  async check(context) {
    const endpoints = context.deploymentConfig?.endpoints || [];

    if (endpoints.length === 0) {
      return {
        passed: true,
        message: 'Sin endpoints HTTPS configurados',
        details: { skipped: true },
      };
    }

    const results = [];
    const warningDays = 30; // Advertir si expira en 30 días

    for (const endpoint of endpoints) {
      if (!endpoint.startsWith('https://')) continue;

      try {
        const certInfo = await this.checkCertificate(endpoint);
        const daysUntilExpiry = Math.floor(
          (new Date(certInfo.validTo) - new Date()) / (1000 * 60 * 60 * 24)
        );

        results.push({
          endpoint,
          valid: certInfo.valid,
          validTo: certInfo.validTo,
          daysUntilExpiry,
          warning: daysUntilExpiry <= warningDays,
        });
      } catch (error) {
        results.push({
          endpoint,
          valid: false,
          error: error.message,
        });
      }
    }

    const invalid = results.filter((r) => !r.valid);
    const expiring = results.filter((r) => r.warning && r.valid);

    if (invalid.length > 0) {
      return {
        passed: false,
        message: `${invalid.length} certificado(s) SSL inválido(s)`,
        details: { results },
        guide: {
          title: 'Certificados SSL Inválidos',
          steps: [
            'Verificar configuración del certificado',
            'Verificar propiedad del dominio',
            'Contactar equipo TI/DevOps',
          ],
          urgency: 'INMEDIATA',
        },
      };
    }

    if (expiring.length > 0) {
      return {
        passed: false,
        message: `${expiring.length} certificado(s) expirando pronto`,
        details: { results },
        guide: {
          title: 'Advertencia de Expiración de Certificado SSL',
          steps: results
            .filter((r) => r.warning)
            .map((r) => `${r.endpoint}: Expira en ${r.daysUntilExpiry} días`),
          urgency: 'ALTA',
        },
      };
    }

    return {
      passed: true,
      message: 'Todos los certificados SSL válidos',
      details: { results },
    };
  }
}
```

---

## Dominio 5: Integración de Servicios

**Propósito:** Verificar que las integraciones de servicios externos funcionan.

### Verificaciones

| ID     | Nombre            | Severidad | Nivel | Modo  | Timeout | Descripción                               |
| ------ | ----------------- | --------- | ----- | ----- | ------- | ----------------------------------------- |
| SI-001 | Gestor de backlog | HIGH      | 1     | quick | 3s      | ClickUp/GitHub Issues accesible           |
| SI-002 | GitHub API        | HIGH      | 1     | quick | 3s      | GitHub API respondiendo                   |
| SI-003 | Servidores MCP    | MEDIUM    | 1     | quick | 5s      | Servidores MCP operacionales              |
| SI-004 | Capa de memoria   | LOW       | 1     | quick | 2s      | Estado de capa de memoria (si habilitado) |

### Detalles de Implementación

```javascript
// SI-002: Verificación GitHub API
class GitHubApiCheck extends BaseCheck {
  constructor() {
    super({
      id: 'SI-002',
      name: 'GitHub API',
      domain: 'services',
      severity: 'HIGH',
      tier: 1,
      mode: 'quick',
      timeout: 3000,
    });
  }

  async check(context) {
    try {
      const { stdout } = await execa('gh', ['api', 'user', '--jq', '.login'], {
        timeout: 3000,
      });

      return {
        passed: true,
        message: `GitHub autenticado como ${stdout.trim()}`,
        details: { user: stdout.trim() },
      };
    } catch (error) {
      if (error.message.includes('not logged in')) {
        return {
          passed: false,
          message: 'GitHub CLI no autenticado',
          guide: {
            title: 'Autenticar GitHub CLI',
            steps: [
              'Ejecutar: gh auth login',
              'Seguir los prompts para autenticarse',
              'Verificar con: gh auth status',
            ],
          },
        };
      }

      return {
        passed: false,
        message: `Error GitHub API: ${error.message}`,
        autoFixAvailable: true,
      };
    }
  }

  async heal(context) {
    // Intentar refrescar auth
    try {
      await execa('gh', ['auth', 'refresh']);
      return { healed: true, message: 'Autenticación GitHub refrescada' };
    } catch (error) {
      return { healed: false, message: 'Re-autenticación manual requerida' };
    }
  }
}
```

---

## Matriz de Verificación IDE/CLI

### Métodos de Detección

| IDE/CLI         | Archivo Config               | Método Detección    | Validación            |
| --------------- | ---------------------------- | ------------------- | --------------------- |
| **VS Code**     | `.vscode/settings.json`      | Archivo existe      | JSON schema           |
| **Cursor**      | `.cursorrules`               | Archivo existe      | Patrones de contenido |
| **Claude Code** | `.claude/CLAUDE.md`          | Archivo existe      | Secciones requeridas  |
| **MCPs**        | `.claude.json` / `.mcp.json` | Archivo existe      | Ping de salud MCP     |
| **Git**         | `.gitconfig`                 | `git config --list` | Settings requeridos   |
| **GitHub CLI**  | N/A                          | `gh auth status`    | Verificación auth     |
| **Node.js**     | N/A                          | `node --version`    | Versión >= 18         |
| **npm**         | `package.json`               | `npm --version`     | Versión >= 9          |

### Validación CLAUDE.md

```javascript
// Secciones requeridas en CLAUDE.md
const requiredSections = [
  'Project Overview', // o 'AIOX-FULLSTACK Development Rules'
  'Agent System', // o 'Workflow Execution'
  'Git Conventions', // o 'Best Practices'
];

async function validateClaudeMd(content) {
  const missing = [];

  for (const section of requiredSections) {
    const pattern = new RegExp(`^#+\\s*${section}`, 'im');
    if (!pattern.test(content)) {
      // Verificar nombres alternativos
      const altPattern = new RegExp(`^#+\\s*(${getAlternatives(section).join('|')})`, 'im');
      if (!altPattern.test(content)) {
        missing.push(section);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
```

### Verificaciones de Configuración IDE

```yaml
# .aiox-core/health-check/checks/ide-checks.yaml
checks:
  - id: IDE-VSCODE
    name: 'Configuración VS Code'
    detection:
      - file: '.vscode/settings.json'
      - file: '.vscode/extensions.json'
    validation:
      type: json-schema
      schema: '.aiox-core/schemas/vscode-settings.json'
    autoFix:
      tier: 2
      action: 'create-from-template'
      template: '.aiox-core/infrastructure/templates/ide/vscode-settings.json'

  - id: IDE-CURSOR
    name: 'Configuración Cursor'
    detection:
      - file: '.cursorrules'
      - directory: '.cursor/rules/'
    validation:
      type: content-pattern
      patterns:
        - 'You are'
        - 'AIOX'
    autoFix:
      tier: 2
      action: 'create-from-template'

  - id: IDE-CLAUDE
    name: 'Configuración Claude Code'
    detection:
      - file: '.claude/CLAUDE.md'
    validation:
      type: section-check
      sections: ['Agent System', 'Git Conventions']
    autoFix:
      tier: 2
      action: 'merge-template'
```

---

## Extensión de Verificaciones Personalizadas

### Verificaciones Personalizadas Basadas en YAML

Los usuarios pueden definir verificaciones específicas del proyecto en `.aiox/custom-checks.yaml`:

```yaml
# .aiox/custom-checks.yaml
version: 1.0

checks:
  # Verificación de existencia de archivo
  - id: CUSTOM-001
    name: 'README existe'
    type: file-exists
    path: 'README.md'
    severity: MEDIUM
    tier: 2
    mode: quick
    autoFix:
      action: create-from-template
      template: '.aiox-core/infrastructure/templates/project-docs/readme-template.md'

  # Verificación de patrón de contenido
  - id: CUSTOM-002
    name: 'Sin comentarios TODO en producción'
    type: content-pattern
    glob: 'src/**/*.{js,ts}'
    pattern: 'TODO|FIXME|HACK'
    negate: true # Falla si se encuentra patrón
    severity: LOW
    tier: 3
    mode: full
    message: 'Encontrados comentarios TODO/FIXME - considerar resolver antes del release'

  # Verificación de comando
  - id: CUSTOM-003
    name: 'TypeScript compila'
    type: command
    command: 'npm run typecheck'
    expectedExitCode: 0
    severity: HIGH
    tier: 3
    mode: full
    timeout: 30000

  # Verificación de salud API
  - id: CUSTOM-004
    name: 'API interna alcanzable'
    type: http-health
    url: 'https://api.internal.example.com/health'
    method: GET
    expectedStatus: 200
    timeout: 5000
    severity: HIGH
    tier: 3
    mode: full

  # Validación JSON schema
  - id: CUSTOM-005
    name: 'Package.json válido'
    type: json-schema
    path: 'package.json'
    schema: '.aiox-core/schemas/package-json.json'
    severity: CRITICAL
    tier: 3
    mode: quick
```

### Tipos de Verificación Personalizada

| Tipo              | Descripción                            | Parámetros                        |
| ----------------- | -------------------------------------- | --------------------------------- |
| `file-exists`     | Verificar si archivo existe            | `path`                            |
| `dir-exists`      | Verificar si directorio existe         | `path`                            |
| `content-pattern` | Buscar patrón en archivos              | `glob`, `pattern`, `negate`       |
| `command`         | Ejecutar comando y verificar exit code | `command`, `expectedExitCode`     |
| `http-health`     | Verificación de salud endpoint HTTP    | `url`, `method`, `expectedStatus` |
| `json-schema`     | Validar JSON contra schema             | `path`, `schema`                  |
| `yaml-valid`      | Verificar que YAML es parseable        | `path`                            |
| `env-var`         | Verificar variable de entorno          | `name`, `pattern`                 |

---

## Consideraciones de Rendimiento

### Orden de Ejecución

```javascript
// Orden de prioridad para verificaciones (estrategia fail-fast)
const checkPriority = {
  CRITICAL: 1, // Ejecutar primero, detener si falla
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5, // Ejecutar último, nunca falla
};

// Modo rápido ejecuta solo prioridad 1-2
// Modo completo ejecuta todas las prioridades
```

### Grupos de Ejecución Paralela

```javascript
// Verificaciones que pueden ejecutar en paralelo (sin dependencias)
const parallelGroups = [
  // Grupo 1: Verificaciones de archivo rápidas
  ['PC-001', 'PC-003', 'PC-004', 'PC-005', 'RH-008'],

  // Grupo 2: Verificaciones de versión
  ['LE-001', 'LE-002', 'LE-003'],

  // Grupo 3: Verificaciones de red (pool compartido)
  ['LE-005', 'SI-001', 'SI-002', 'SI-003'],

  // Grupo 4: Verificaciones costosas (ejecutar último)
  ['RH-007', 'PC-002', 'PC-006'],
];
```

### Estrategia de Caché

```javascript
const checkCache = new Map();

// Configuración de caché por tipo de verificación
const cacheConfig = {
  'file-exists': { ttl: 60000, key: 'path' }, // 1 min
  'content-pattern': { ttl: 300000, key: 'glob+pattern' }, // 5 min
  command: { ttl: 0 }, // Sin caché
  'http-health': { ttl: 30000, key: 'url' }, // 30 seg
  'node-version': { ttl: 3600000 }, // 1 hora
};
```

### Manejo de Timeout

```javascript
async function runCheckWithTimeout(check, context) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Verificación expiró')), check.timeout);
  });

  try {
    const result = await Promise.race([check.check(context), timeoutPromise]);
    return result;
  } catch (error) {
    return {
      passed: false,
      message: `Verificación falló: ${error.message}`,
      timedOut: error.message === 'Verificación expiró',
    };
  }
}
```

---

## Documentos Relacionados

- [ADR: Arquitectura HCS](./adr/adr-hcs-health-check-system.md)
- [Modos de Ejecución HCS](./hcs-execution-modes.md)
- [Especificación de Auto-reparación HCS](./hcs-self-healing-spec.md)

---

_Documento creado como parte de la Historia HCS-1 Investigación_
