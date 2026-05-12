# Guía de Integración con IDEs

> **ES**

---

Guía para integrar AIOX con IDEs compatibles y plataformas de desarrollo con IA.

**Versión:** 2.1.0
**Última Actualización:** 2026-01-28

---

## IDEs Compatibles

AIOX es compatible con 6 plataformas de desarrollo potenciadas por IA. Elige la que mejor se adapte a tu flujo de trabajo.

### Tabla de Comparación Rápida

| Característica         | Claude Code | Codex CLI | Cursor | Copilot | AntiGravity | Gemini CLI |
| ---------------------- | :---------: | :-------: | :----: | :-----: | :---------: | :--------: |
| **Activación de agentes** | /command  |  /skills  | @mention | chat modes | workflow-based | prompt mention |
| **Soporte MCP**        |   Native    |  Native   | Config | Config | Provider-specific | Native |
| **Tareas de subagentes** |   Yes     |    Yes    |   No   |   No   |     Yes     |     No     |
| **Auto-sync**          |     Yes     |    Yes    |  Yes   |  Yes   |     Yes     |    Yes     |
| **Sistema de hooks**   |     Yes     |  Limited  |   No   |   No   |      No     |     Yes    |
| **Skills/Commands**    |   Native    |  Native   |   No   |   No   |      No     |   Native   |
| **Recomendación**      |    Best     |   Best    |  Best  |  Good  |     Good    |   Good     |

### Paridad de Hooks e Impacto Funcional

| IDE | Paridad de Hooks vs Claude | Qué se degrada sin hooks completos | Mitigación en AIOX |
| --- | --- | --- | --- |
| Claude Code | Completa | Ninguno (comportamiento de referencia) | Hooks nativos + pipeline completo de AIOX |
| Gemini CLI | Alta | Diferencias menores en el modelo de eventos | Hooks nativos de Gemini + mapeo unificado |
| Codex CLI | Limitada/parcial | Menor automatización del ciclo de sesión y menor enforcement pre/post-tool | `AGENTS.md` + `/skills` + MCP + scripts de sync/validación |
| Cursor | Sin hooks de ciclo equivalentes | Sin interceptación nativa pre/post-tool y trazabilidad automática más débil | Reglas sincronizadas + MCP + disciplina de workflow |
| GitHub Copilot | Sin hooks de ciclo equivalentes | Mismo impacto que Cursor, con mayor dependencia de flujo manual | Instrucciones de repositorio, chat modes y MCP en VS Code |
| AntiGravity | Basado en workflow (no en hooks) | Sin paridad de ciclo de vida estilo Claude | Generación de workflows + sync de agentes |

### Consecuencias Prácticas por Capacidad

- Automatización `SessionStart/SessionEnd`:
  - Fuerte en Claude/Gemini.
  - Parcial o manual en Codex/Cursor/Copilot/AntiGravity.
- Guardrails `BeforeTool/AfterTool`:
  - Más robustos en Claude/Gemini.
  - Limitados en Codex.
  - Principalmente de proceso en Cursor/Copilot/AntiGravity.
- Riqueza de auditoría y telemetría automáticas:
  - Mayor donde existen hooks de ciclo de vida.
  - Menor donde la integración depende de reglas/instrucciones.

---

## Instrucciones de Configuración

### Claude Code

**Nivel de Recomendación:** Mejor integración con AIOX

```yaml
config_file: .claude/CLAUDE.md
agent_folder: .claude/commands/AIOX/agents
activation: /agent-name (slash commands)
format: full-markdown-yaml
mcp_support: native
special_features:
  - Task tool for subagents
  - Native MCP integration
  - Hooks system (pre/post)
  - Custom skills
  - Memory persistence
```

**Configuración:**

1. AIOX crea automáticamente el directorio `.claude/` al inicializar
2. Los agentes están disponibles como comandos slash: `/dev`, `/qa`, `/architect`
3. Configura servidores MCP en `~/.claude.json`

**Configuración:**

```bash
# Sincronizar todos los objetivos habilitados (incluye Claude)
npm run sync:ide

# Verificar configuración
ls -la .claude/commands/AIOX/agents/
```

---

### Codex CLI

**Nivel de recomendación:** Mejor (workflow terminal-first)

```yaml
config_file: AGENTS.md
agent_folder: .codex/agents
activation: /skills + atajos AGENTS.md
skills_folder: .codex/skills (local), ~/.codex/skills (global)
format: markdown
mcp_support: nativo vía Codex
special_features:
  - AGENTS.md como contrato operativo
  - Skills locales versionadas en el proyecto
  - Pipeline de greeting compartido con Claude
  - Comando notify y hooks de herramienta emergentes en releases recientes de Codex
```

**Configuración:**

1. Mantén `AGENTS.md` en la raíz del repositorio
2. Ejecuta `npm run sync:ide:codex`
3. Ejecuta `npm run sync:skills:codex`
4. Usa `/skills` y selecciona `aiox-<agent-id>`
5. Usa `sync:skills:codex:global` solo cuando quieras instalación global

```bash
npm run sync:ide:codex
npm run sync:skills:codex
ls -la AGENTS.md .codex/agents/ .codex/skills/
```

---

### Cursor

**Nivel de Recomendación:** Mejor (IDE IA popular)

```yaml
config_file: .cursor/rules.md
agent_folder: .cursor/rules
activation: @agent-name
format: condensed-rules
mcp_support: via configuration
special_features:
  - Composer integration
  - Chat modes
  - @codebase context
  - Multi-file editing
  - Soporte de subagents y handoff a cloud agents
  - Flujos de agente de larga duracion (preview)
```

**Configuración:**

1. AIOX crea el directorio `.cursor/` al inicializar
2. Los agentes se activan con @mention: `@dev`, `@qa`
3. Las reglas se sincronizan a `.cursor/rules/`

**Configuración:**

```bash
# Sincronizar Cursor
npm run sync:ide:cursor

# Verificar configuración
ls -la .cursor/rules/
```

**Configuración MCP (`.cursor/mcp.json`):**

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/sse"
    }
  }
}
```

---

### GitHub Copilot

**Nivel de Recomendación:** Bueno (integración con GitHub)

```yaml
config_file: .github/copilot-instructions.md
agent_folder: .github/agents
activation: chat modes
format: text
mcp_support: via VS Code MCP config
special_features:
  - GitHub integration
  - PR assistance
  - Code review
  - Integracion con instrucciones de repositorio y MCP en VS Code
```

**Configuración:**

1. Habilita GitHub Copilot en tu repositorio
2. AIOX crea `.github/copilot-instructions.md`
3. Las instrucciones del agente se sincronizan

**Configuración:**

```bash
# Sincronizar todos los objetivos habilitados
npm run sync:ide

# Verificar configuración
cat .github/copilot-instructions.md
```

---

### AntiGravity

**Nivel de Recomendación:** Bueno (integración con Google)

```yaml
config_file: .antigravity/rules.md
config_json: .antigravity/antigravity.json
agent_folder: .agent/workflows
activation: workflow-based
format: cursor-style
mcp_support: native (Google)
special_features:
  - Google Cloud integration
  - Workflow system
  - Native Firebase tools
```

**Configuración:**

1. AIOX crea el directorio `.antigravity/`
2. Configura las credenciales de Google Cloud
3. Los agentes se sincronizan como workflows

---

### Gemini CLI

**Nivel de Recomendación:** Bueno

```yaml
config_file: .gemini/rules.md
agent_folder: .gemini/rules/AIOX/agents
activation: prompt mention
format: text
mcp_support: native
special_features:
  - Google AI models
  - CLI-based workflow
  - Multimodal support
  - Eventos de hooks nativos y comandos de hooks
  - Soporte nativo para servidores MCP
  - UX de comandos/herramientas en evolucion rapida
```

---

## Sistema de Sincronización

### Cómo Funciona la Sincronización

AIOX mantiene una única fuente de verdad para las definiciones de agentes y las sincroniza con todos los IDEs configurados:

```
┌─────────────────────────────────────────────────────┐
│                    AIOX Core                         │
│  .aiox-core/development/agents/  (Fuente de Verdad) │
│                        │                             │
│            ┌───────────┼───────────┐                │
│            ▼           ▼           ▼                │
│  .claude/     .codex/      .cursor/                  │
│  .antigravity/ .gemini/                              │
└─────────────────────────────────────────────────────┘
```

### Comandos de Sincronización

```bash
# Sincronizar todos los objetivos habilitados
npm run sync:ide

# Sincronizar objetivos específicos
npm run sync:ide:cursor
npm run sync:ide:codex
npm run sync:ide:gemini
npm run sync:ide:github-copilot
npm run sync:ide:antigravity

# Ejecución en seco (previsualizar cambios)
npm run sync:ide -- --dry-run

# Sincronización estándar
npm run sync:ide
```

### Sincronización Automática

AIOX puede configurarse para sincronizar automáticamente cuando hay cambios en los agentes:

```yaml
# .aiox-core/core/config/sync.yaml
auto_sync:
  enabled: true
  watch_paths:
    - .aiox-core/development/agents/
  platforms:
    - claude
    - codex
    - cursor
    - gemini
```

---

## Solución de Problemas

### El Agente No Aparece en el IDE

```bash
# Verificar que el agente existe en la fuente
ls .aiox-core/development/agents/

# Sincronizar y validar
npm run sync:ide
npm run sync:ide:check

# Revisar directorio específico de la plataforma
ls .cursor/rules/  # Para Cursor
ls .claude/commands/AIOX/agents/  # Para Claude Code
```

### Conflictos de Sincronización

```bash
# Previsualizar qué cambiaría
npm run sync:ide -- --dry-run

# Hacer respaldo antes de sincronización
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:ide
```

### MCP No Funciona

```bash
# Revisar estado de MCP
aiox mcp status

# Verificar configuración de MCP para el IDE
cat ~/.claude.json  # Para Claude Code
cat .cursor/mcp.json  # Para Cursor
```

### Problemas Específicos del IDE

**Claude Code:**

- Asegúrate de que `.claude/` esté en la raíz del proyecto
- Revisa permisos de hooks: `chmod +x .claude/hooks/*.py`

**Cursor:**

- Reinicia Cursor después de la sincronización
- Revisa permisos de `.cursor/rules/`

## Guía de Decisión de Plataforma

Usa esta guía para elegir la plataforma correcta:

```
¿Usas la API de Claude/Anthropic?
├── Sí --> Claude Code (Mejor integración con AIOX)
└── No
    └── ¿Prefieres VS Code?
        ├── Sí --> ¿Quieres una extensión?
        │   ├── Sí --> GitHub Copilot (Funciones nativas de GitHub)
        │   └── No --> GitHub Copilot (Características nativas de GitHub)
        └── No --> ¿Quieres un IDE IA dedicado?
            ├── Sí --> ¿Qué modelo prefieres?
            │   ├── Claude/GPT --> Cursor (IDE IA más popular)
            └── No --> ¿Usas Google Cloud?
                ├── Sí --> AntiGravity (integración con Google)
                └── No --> Gemini CLI (Especializados)
```

---

## Migración Entre IDEs

### De Cursor a Claude Code

```bash
# Exportar reglas actuales
cp -r .cursor/rules/ ./rules-backup/

# Inicializar Claude Code
npm run sync:ide

# Verificar migración
diff -r ./rules-backup/ .claude/commands/AIOX/agents/
```

### De Claude Code a Cursor

```bash
# Sincronizar a Cursor
npm run sync:ide:cursor

# Configurar MCP (si es necesario)
# Copiar configuración de MCP a .cursor/mcp.json
```

---

## Documentación Relacionada

- [Guías de Plataformas](./platforms/README.md)
- [Guía de Claude Code](./platforms/claude-code.md)
- [Guía de Cursor](./platforms/cursor.md)
- [Guía de Referencia de Agentes](./agent-reference-guide.md)
- [Configuración Global de MCP](./guides/mcp-global-setup.md)

---

_Guía de Integración con IDEs de Synkra AIOX v4.0_
