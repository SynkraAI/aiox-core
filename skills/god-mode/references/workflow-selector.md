# Workflow Selector — Guia de Decisão

## Árvore de Decisão Detalhada

```
Pedido do usuário
  │
  ├─ É um app/sistema inteiro?
  │   ├─ Greenfield (do zero)?
  │   │   ├─ Fullstack? → greenfield-fullstack.yaml
  │   │   ├─ Só backend/API? → greenfield-service.yaml
  │   │   └─ Só frontend? → greenfield-ui.yaml
  │   └─ Brownfield (existente)?
  │       ├─ Primeiro contato? → Brownfield Discovery (10 fases)
  │       ├─ Fullstack? → brownfield-fullstack.yaml
  │       ├─ Só backend? → brownfield-service.yaml
  │       └─ Só frontend? → brownfield-ui.yaml
  │
  ├─ É uma feature/story única?
  │   └─ SDC direto (story-development-cycle.yaml)
  │
  ├─ É um bug fix?
  │   ├─ Urgente? → Bug Fix Fast Track (sem Spec Pipeline)
  │   └─ Normal? → SDC com story mínima
  │
  ├─ É múltiplas features (epic)?
  │   └─ Epic Orchestration → SDC por story
  │
  ├─ É review/QA?
  │   └─ QA Loop (qa-loop.yaml)
  │
  ├─ É pesquisa/análise?
  │   └─ @analyst direto (sem workflow)
  │
  ├─ É design system?
  │   └─ design-system-build-quality.yaml
  │
  ├─ É criar componente AIOX?
  │   └─ Creation Engine (Seção 6 do SKILL.md)
  │
  └─ É configuração/setup?
      └─ @devops ou @aiox-master
```

## Complexity Scoring → Workflow Routing

Calcule o score ANTES de escolher o workflow:

| Dimensão | 1 pt | 2 pts | 3 pts | 4 pts | 5 pts |
|----------|------|-------|-------|-------|-------|
| **Scope** | 1-3 files | 4-7 files | 8-14 files | 15-19 files | 20+ files |
| **Integration** | Nenhuma API | 1 API interna | 1 API externa | 2-3 APIs | 4+ APIs |
| **Infrastructure** | Nenhuma | Config change | Novo serviço | Nova DB | Infra major |
| **Knowledge** | Expert no time | Familiar | Parcialmente novo | Maioria novo | Domínio novo |
| **Risk** | Low, reversível | Medium | High | Core system | Compliance |

| Score Total | Classe | Spec Pipeline | SDC |
|-------------|--------|---------------|-----|
| ≤8 | SIMPLE | 3 fases (1→4→5) | Modo YOLO |
| 9-15 | STANDARD | 6 fases completas | Modo Interactive |
| ≥16 | COMPLEX | 6 fases + revisão | Modo Pre-Flight |

## Combinações Comuns

### App Completo do Zero
```
Spec Pipeline (6 fases) → Epic Orchestration → SDC (por story) → QA Loop (se necessário)
```

### Feature Rápida
```
SDC direto (modo YOLO se score ≤8)
```

### Refatoração de Legado
```
Brownfield Discovery (10 fases) → Epic Orchestration → SDC (por story)
```

### Bug Fix Urgente
```
@sm *draft (mínimo) → @dev *develop --mode=yolo → @qa *review → @devops *push
```

### Sprint Completo
```
@pm *execute-epic → Para cada story: SDC completo → @devops *push (batch)
```
