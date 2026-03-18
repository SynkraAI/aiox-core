# Monster Agent — MEMORY

> Memória persistente do Rex. Actualizada via `*sync`.
> Versão do agente: **v2.0**

## Agente Activo

```yaml
version: "2.0"
last_updated: "2026-03-12"
last_sync: "2026-03-12T00:20:00Z"
```

## Projecto Activo

```yaml
active_project: aiox-core
last_switch: "2026-03-12"
```

## Projectos Conhecidos

```yaml
projects:

  aiox-core:
    name: "AIOX-FullStack Core"
    package: "@aiox-fullstack/core"
    version: "4.31.1"
    description: "Meta-agent and component generation system"
    type: aiox-framework
    phase: development
    progress_pct: 30
    tech_preset: unknown      # não configurado em core-config.yaml — usar *preset para definir
    epic_id: null             # EPIC-ACT está completed; sem epic activo
    sprint: null
    workflow_active: story-development-cycle
    workflow_step: 3          # @dev implement (step 3 de 5 no SDC)

    current_story:
      id: "DEMO-TEST"
      title: "Add API endpoints"
      status: InProgress
      agent: "@dev"
      subtask: "2.2"
      phase: Implementation
      progress_pct: 30
      phases:
        Setup: 100%           # 2/2 completo
        Implementation: 20%   # 1/5 completo — subtask 2.2 em curso
        Testing: 0%           # 0/3 completo

    next_action:
      command: "@dev *develop DEMO-TEST"
      agent: "@dev"
      description: "Continuar implementação — subtask 2.2 (Add API endpoints)"
      urgency: now
      source: workflow-chains
      after_completion: "@qa *review DEMO-TEST"

    stories_summary:
      total: 1
      done: 0
      in_progress: 1
      in_review: 0
      ready: 0
      draft: 0
      blocked: 0

    qa_loops:
      test-qa-loop:
        status: pending
        current_iteration: 0
        max_iterations: 5
        last_verdict: null
        issues_found: 0

    epic_history:
      EPIC-ACT:
        status: completed
        waves: 3
        stories: [ACT-1, ACT-2, ACT-3, ACT-4, ACT-5, ACT-6, ACT-7, ACT-8]
        tests_final: "386/386 PASS"
        completed_at: "2026-02-06T16:00:00Z"
        note: "7 bugs críticos corrigidos. Epic fechado com sucesso."

    agents_active: ["@aiox-master", "@monster"]
    blockers: []

    git:
      is_git_repo: false
      branch: null
      last_commit: null
      uncommitted_changes: 0
      note: "Projecto greenfield — sem git inicializado. Usar *devops environment-bootstrap."

    config:
      project_type: brownfield
      installed_at: "2026-03-11T17:41:27Z"
      framework_protection: true
      story_location: "docs/stories"          # directório não existe ainda
      prd_location: "docs/prd.md"
      qa_location: "docs/qa"
      mcp_enabled: false
      user_profile: advanced

    active_since: "2026-03-11"
    last_activity: "2026-03-12"
    last_sync: "2026-03-12T00:20:00Z"
```

## Comunidade IA AVANÇADA PT

```yaml
mentees: []
```

## Sessões de Ensino

```yaml
teaching_log: []
```

## Dashboard

```yaml
dashboard_last_generated: "2026-03-12"
dashboard_path: ".aiox/dashboard/monster-dashboard.html"
dashboard_version: "1.0"
note: "Dashboard gerado com dados estáticos. Fazer *dashboard --refresh para actualizar com dados do sync."
```

## Workflows Activos

```yaml
active_workflows:
  - project: aiox-core
    workflow: story-development-cycle
    story: DEMO-TEST
    current_step: 3
    current_agent: "@dev"
    status: in_progress

workflow_history:
  - project: aiox-core
    workflow: epic-orchestration
    epic: EPIC-ACT
    status: completed
    completed_at: "2026-02-06T16:00:00Z"
    waves: 3
    stories_completed: 8
```

## Sync History

```yaml
last_sync: "2026-03-12T00:20:00Z"
sync_history:
  - timestamp: "2026-03-12T00:20:00Z"
    sources_read:
      - ".aiox/status.json"
      - ".aiox/project-status.yaml"
      - ".aiox/session-state.json"
      - ".aiox/epic-EPIC-ACT-state.yaml"
      - ".aiox-core/core-config.yaml"
      - ".aiox-core/package.json"
    findings:
      project_identified: "AIOX-FullStack Core v4.31.1"
      story_active: "DEMO-TEST (30%, subtask 2.2)"
      epic_active: null
      epic_completed: "EPIC-ACT (386/386 tests)"
      git_repo: false
      stories_dir_exists: false
      handoffs_dir_exists: false
      tech_preset_configured: false
    gaps_detected:
      - "docs/stories/ não existe — criar antes de usar @sm *create-story"
      - "git não inicializado — usar *devops environment-bootstrap"
      - "tech preset não configurado — usar *preset {stack}"
      - "DEMO-TEST parece story de demo, não real — confirmar com utilizador"
```

## Standalone Skills Registry

```yaml
standalone_skills:
  architect:
    path: "C:\\Users\\XPS\\architect\\SKILL.md"
    invoke: "/architect"
    shortcut: "*arch {command}"
    last_used: null
  github_devops:
    path: "C:\\Users\\XPS\\github-devops\\SKILL.md"
    invoke: "/github-devops"
    shortcut: "*devops {command}"
    last_used: null
    note: "EXCLUSIVO para push/PR — CodeRabbit pre-push automático"
```

## Notas do Rex

```yaml
notes:
  - date: "2026-03-12"
    note: "Monster v2.0 aplicado. *sync executado pela primeira vez. Projecto identificado como AIOX-FullStack Core v4.31.1 brownfield. EPIC-ACT completed (386 testes). Story DEMO-TEST activa (30%). 3 gaps detectados: docs/stories/ em falta, git não inicializado, tech preset não configurado."

  - date: "2026-03-12"
    note: "Dashboard gerado em .aiox/dashboard/monster-dashboard.html. Dados actuais são estáticos (da primeira geração). Próximo *dashboard --refresh vai usar dados do sync."
```
