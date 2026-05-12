# Guia do Sistema de Greeting Contextual

> **EN** | [PT](../pt/guides/contextual-greeting-system-guide.md) | [ES](../es/guides/contextual-greeting-system-guide.md)

---

**Story:** 6.1.2.5 - Contextual Agent Load System
**Status:** Componentes Implementados, Integração Pendente
**Data:** 2025-01-15

---

## 📖 Visão Geral

O Sistema de Greeting Contextual é uma melhoria de UX que torna os greetings dos agentes AIOX inteligentes e adaptativos, mostrando informações e comandos relevantes baseados no contexto da sessão.

## 🎯 O Que Foi Implementado

### ✅ Componentes Core (Story 6.1.2.5)

1. **ContextDetector** (`.aiox-core/core/session/context-detector.js`)
   - Detecta tipo de sessão: `new`, `existing`, ou `workflow`
   - Abordagem híbrida: histórico de conversação (preferido) + arquivo de sessão (fallback)
   - TTL de 1 hora para sessões inativas

2. **GitConfigDetector** (`.aiox-core/infrastructure/scripts/git-config-detector.js`)
   - Detecta configuração do git do projeto
   - Cache com TTL de 5 minutos
   - Timeout protection de 1000ms

3. **GreetingBuilder** (`.aiox-core/development/scripts/greeting-builder.js`)
   - Monta greetings contextuais baseados no tipo de sessão
   - Filtra comandos por visibilidade (full/quick/key)
   - Timeout de 150ms com fallback gracioso

4. **WorkflowNavigator** (`.aiox-core/development/scripts/workflow-navigator.js`)
   - Detecta estado do workflow atual
   - Sugere próximos comandos baseado no estado
   - Pre-popula comandos com contexto (story path, branch)

5. **Workflow Patterns** (`.aiox-core/data/workflow-patterns.yaml`)
   - 10 workflows comuns definidos
   - Transições de estado com sugestões de próximos passos
   - Padrões validados contra uso real do projeto

### ⏳ Pendente (Story Futura - 6.1.4 ou 6.1.6)

**Integração com Processo de Ativação:**
- Interceptar ativação do agente (quando você digita `@dev`, `@po`, etc.)
- Chamar GreetingBuilder automaticamente
- Injetar greeting contextual no lugar do greeting padrão

## 📊 Tipos de Sessão

### 1. New Session (Sessão Nova)

**Quando:** Primeira interação ou após 1 hora de inatividade

**Características:**
- Apresentação completa (greeting archetypal)
- Descrição do papel do agente
- Status do projeto (se git configurado)
- Comandos completos (até 12 comandos com visibility=full)

**Exemplo:**
```
💻 Dex (Builder) ready. Let's build something solid!

**Role:** Full Stack Developer specializing in clean, maintainable code

📊 Project Status:
🌿 main
📝 5 modified files
📦 Last commit: feat: implement greeting system

**Available Commands:**
   - `*help`: Show all available commands
   - `*develop`: Implement story tasks
   - `*review-code`: Review code changes
   - `*run-tests`: Execute test suite
   - `*build`: Build for production
   ... (até 12 comandos)
```

### 2. Existing Session (Sessão Existente)

**Quando:** Continuando trabalho na mesma sessão

**Características:**
- Apresentação resumida (greeting named)
- Status do projeto
- Contexto atual (última ação)
- Comandos rápidos (6-8 comandos com visibility=quick)

**Exemplo:**
```
💻 Dex (Builder) ready.

📊 Project Status:
🌿 feature/story-6.1.2.5
📝 3 modified files

📌 **Last Action:** review-code

**Quick Commands:**
   - `*help`: Show help
   - `*develop`: Implement story
   - `*review-code`: Review code
   - `*run-tests`: Run tests
   - `*qa-gate`: Run quality gate
   ... (6-8 comandos mais usados)
```

### 3. Workflow Session (Sessão em Workflow)

**Quando:** No meio de um workflow ativo (ex: após validar story)

**Características:**
- Apresentação mínima (greeting minimal)
- Status condensado do projeto
- Contexto do workflow (working on X)
- **Sugestões de próximos passos** (NEW!)
- Comandos chave (3-5 comandos com visibility=key)

**Exemplo:**
```
⚖️ Pax ready.

📊 🌿 main | 📝 5 modified | 📖 STORY-6.1.2.5

📌 **Context:** Working on Story 6.1.2.5

**Story validated! Next steps:**

1. `*develop-yolo story-6.1.2.5.md` - Autonomous mode (no interruptions)
2. `*develop-interactive story-6.1.2.5.md` - Interactive mode with checkpoints
3. `*develop-preflight story-6.1.2.5.md` - Plan first, then execute

**Key Commands:**
   - `*help`: Show help
   - `*validate-story-draft`: Validate story
   - `*backlog-summary`: Quick backlog status
```

## 🏗️ Command Visibility System

### Metadados de Comandos

Cada comando agora tem um atributo `visibility` que controla quando ele aparece:

```yaml
commands:
  - name: help
    visibility: [full, quick, key]  # Sempre visível
    description: "Show all available commands"

  - name: develop
    visibility: [full, quick, key]  # Comando principal
    description: "Implement story tasks"

  - name: review-code
    visibility: [full, quick]  # Usado frequentemente, mas não crítico
    description: "Review code changes"

  - name: build
    visibility: [full]  # Menos usado, só em new session
    description: "Build for production"

  - name: qa-gate
    visibility: [key]  # Crítico em workflows, mas não sempre necessário
    description: "Run quality gate"
```

### Guidelines de Categorização

**`full` (12 comandos)** - New Session
- Todos os comandos disponíveis
- Mostra capacidades completas do agente
- Ideal para descoberta

**`quick` (6-8 comandos)** - Existing Session
- Comandos usados frequentemente
- Focado em produtividade
- Remove comandos raramente usados

**`key` (3-5 comandos)** - Workflow Session
- Comandos críticos para o workflow atual
- Mínimo de distração
- Máxima eficiência

## 🔄 Workflow Navigation

### Workflows Definidos

**10 workflows comuns:**

1. **story_development** - Validate → Develop → QA → Deploy
2. **epic_creation** - Create epic → Create stories → Validate
3. **backlog_management** - Review → Prioritize → Schedule
4. **architecture_review** - Analyze → Document → Review
5. **git_workflow** - Quality gate → PR → Merge
6. **database_workflow** - Design → Migrate → Test
7. **code_quality_workflow** - Assess → Refactor → Test
8. **documentation_workflow** - Research → Document → Sync
9. **ux_workflow** - Design → Implement → Validate
10. **research_workflow** - Brainstorm → Analyze → Document

### Transições de Estado

Cada workflow define transições entre estados com:
- **Trigger:** Comando que completa com sucesso
- **Greeting Message:** Mensagem contextual
- **Next Steps:** Sugestões de próximos comandos com args pré-populados

**Exemplo (Story Development):**

```yaml
story_development:
  transitions:
    validated:
      trigger: "validate-story-draft completed successfully"
      greeting_message: "Story validated! Ready to implement."
      next_steps:
        - command: develop-yolo
          args_template: "${story_path}"
          description: "Autonomous YOLO mode (no interruptions)"
        - command: develop-interactive
          args_template: "${story_path}"
          description: "Interactive mode with checkpoints (default)"
        - command: develop-preflight
          args_template: "${story_path}"
          description: "Plan everything upfront, then execute"
```

## 🧪 Como Testar Agora

### Opção 1: Script de Teste Automático

```bash
node .aiox-core/development/scripts/test-greeting-system.js
```

Este script testa os 4 cenários:
1. New session greeting (Dev)
2. Existing session greeting (Dev)
3. Workflow session greeting (PO)
4. Simple greeting fallback

### Opção 2: Teste Manual via Node REPL

```javascript
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');
const builder = new GreetingBuilder();

// Mock agent
const mockAgent = {
  name: 'Dex',
  icon: '💻',
  persona_profile: {
    greeting_levels: {
      named: '💻 Dex (Builder) ready!'
    }
  },
  persona: { role: 'Developer' },
  commands: [
    { name: 'help', visibility: ['full', 'quick', 'key'] }
  ]
};

// Test new session
builder.buildGreeting(mockAgent, { conversationHistory: [] })
  .then(greeting => console.log(greeting));
```

### Opção 3: Aguardar Integração Completa

Quando a integração com o processo de ativação estiver implementada (Story 6.1.4/6.1.6), o sistema funcionará automaticamente ao ativar qualquer agente:

```
@dev              → Greeting contextual automático
@po               → Greeting contextual automático
@qa               → Greeting contextual automático
```

## 📁 Arquivos Relacionados

### Scripts Core
- `.aiox-core/core/session/context-detector.js` - Detecção de tipo de sessão
- `.aiox-core/infrastructure/scripts/git-config-detector.js` - Detecção de git config
- `.aiox-core/development/scripts/greeting-builder.js` - Montagem do greeting
- `.aiox-core/development/scripts/workflow-navigator.js` - Navegação de workflow
- `.aiox-core/development/scripts/agent-exit-hooks.js` - Hooks de saída (para persistência)

### Data Files
- `.aiox-core/data/workflow-patterns.yaml` - Definições de workflows

### Tests
- `tests/unit/context-detector.test.js` - 23 testes
- `tests/unit/git-config-detector.test.js` - 19 testes
- `tests/unit/greeting-builder.test.js` - 23 testes
- `tests/integration/performance.test.js` - Performance validation

### Configuration
- `.aiox-core/core-config.yaml` - Configuração global (git + agentIdentity sections)

### Agents (Updated)
- `.aiox-core/agents/dev.md` - ✅ Command visibility metadata
- `.aiox-core/agents/po.md` - ✅ Command visibility metadata
- `.aiox-core/agents/*.md` - ⏳ Remaining 9 agents (pending update)

## 🎯 Próximos Passos

### Immediate (Fix Test Issues)
1. Fix test configuration issues (1-2 hours)
2. Run full test suite
3. Execute performance tests

### Short-term (Story 6.1.4 ou 6.1.6)
1. Implement integration with agent activation process
2. Update remaining 9 agents with command visibility metadata
3. Test with real agent activations

### Long-term (Story 6.1.2.6)
1. Implement dynamic workflow pattern learning
2. Add usage-based command prioritization
3. Implement agent collaboration hints

## 📊 Performance Metrics

**Target (from Story 6.1.2.5):**
- P50 latency: <100ms
- P95 latency: <130ms
- P99 latency: <150ms (hard limit)

**Expected (based on code review):**
- Git config (cache hit): <5ms ✅
- Git config (cache miss): <50ms ✅
- Context detection: <50ms ✅
- Session file I/O: <10ms ✅
- Workflow matching: <20ms ✅
- **Total P99:** ~100-120ms ✅ (well under limit)

**Optimizations:**
- Parallel execution (Promise.all)
- TTL-based caching
- Timeout protection
- Early exit on cache hit

## 🛡️ Backwards Compatibility

**100% Backwards Compatible:**
- Agents sem metadata de visibilidade mostram todos os comandos (max 12)
- Fallback gracioso para simple greeting em qualquer erro
- Zero breaking changes no processo de ativação
- Migração gradual (Phase 1: dev/po → Phase 2: remaining 9)

## ❓ FAQ

**Q: Por que o greeting não está contextual quando ativo um agente agora?**
A: A integração com o processo de ativação ainda não foi implementada. Os componentes existem mas não são chamados automaticamente ainda.

**Q: Quando a integração será feita?**
A: Em uma story futura (provavelmente 6.1.4 ou 6.1.6). Depende do sistema de configuração de agentes.

**Q: Como posso testar agora?**
A: Use o script de teste: `node .aiox-core/development/scripts/test-greeting-system.js`

**Q: O que acontece se um agente não tiver metadata de visibilidade?**
A: Fallback: mostra todos os comandos (max 12). Não quebra nada.

**Q: Como adiciono metadata de visibilidade nos meus comandos?**
A: Veja a seção "Command Visibility System" acima e os exemplos nos agents dev.md e po.md.

**Q: Posso desabilitar o greeting contextual?**
A: Sim, via config: `core-config.yaml` → `agentIdentity.greeting.contextDetection: false`

---

**Documento Atualizado:** 2025-01-15
**Autor:** Quinn (QA) + Dex (Dev)
**Story:** 6.1.2.5 - Contextual Agent Load System
