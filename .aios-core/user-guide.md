# Guia do Usuário Synkra AIOS

## Visão Geral

O Synkra AIOS é um framework de desenvolvimento full stack orientado por agentes de IA que implementa uma metodologia ágil única. Este guia explica como usar o Synkra AIOS de forma eficaz através de suas duas fases principais: **Planejamento** e **Desenvolvimento**.

### As Duas Inovações Chave

**1. Planejamento Agêntico**: Agentes dedicados (analyst, pm, architect) colaboram com você para criar documentos de PRD (Product Requirements Document) e Arquitetura detalhados e consistentes. Através de engenharia avançada de prompts e refinamento com human-in-the-loop, estes agentes de planejamento produzem especificações abrangentes.

**2. Desenvolvimento Contextualizado por Engenharia**: O agente sm (Scrum Master) transforma estes planos detalhados em histórias de desenvolvimento hiperdetalhadas que contêm tudo que o agente dev precisa - contexto completo, detalhes de implementação e orientação arquitetural incorporada diretamente nos arquivos de histórias.

Esta abordagem de duas fases elimina tanto a **inconsistência de planejamento** quanto a **perda de contexto** - os maiores problemas no desenvolvimento assistido por IA.

## Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js** 20.0.0 ou superior instalado
- **npm** ou outro gerenciador de pacotes
- **GitHub CLI** (gh) instalado e configurado (para colaboração em equipe)
- **Acesso a um agente de IA**: Claude, GPT-4, Gemini, ou similar

## Instalação e Configuração Inicial

### Instalando AIOS-FullStack

O AIOS-FullStack oferece instalação simplificada através de um instalador interativo completo.

#### Instalação em Projeto Novo ou Existente

```bash
# Navegue para o diretório do seu projeto
cd /path/to/your/project

# Execute o instalador (versão RC atual)
npx aios-core@latest install

# OU usando NPM direto (produção - quando disponível)
npx @aios/fullstack install
```

**O que acontece durante a instalação**:

```
🚀 AIOS-FullStack Installation Wizard

✓ Detecting installation state...
  Current state: Clean installation

📦 Select Squads to Install:
  ◉ hybrid-ops (Pedro Valério methodology)
  ◯ expansion-creator (Create new squads)
  ◯ aios-infrastructure-devops (DevOps utilities)
  ◯ meeting-notes (Meeting assistant)

💻 Select IDEs to Configure:
  ◉ Claude Code (.claude/commands/)
  ◉ Cursor (.cursor/rules/)
  ◯ Gemini CLI (.gemini/)

📝 Sharding Preferences:
  ◯ Single file (all in one document)
  ◉ Multi-file (separate files per section)

✓ Installing .aios-core/ framework...
✓ Installing squads...
✓ Configuring IDE integrations...
✓ Creating install manifest...

✅ Installation complete!

Next steps:
  1. Activate an agent: @dev, @po, @qa, @architect
  2. Run agent command: *help
```

#### Desenvolvimento do Framework Próprio

Se você está contribuindo para o AIOS-FullStack em si:

```bash
# Clone o repositório
git clone https://github.com/SynkraAI/aios-core
cd aios-core

# Instale dependências
npm install

# Execute o instalador no modo desenvolvimento
npx aios-core@latest install
```

### Estrutura Pós-Instalação

Após executar o instalador, seu projeto terá a seguinte estrutura:

```
your-project/
├── .aios-core/                    # ✅ Framework core instalado
│   ├── agents/                    # 11 agentes (dev, po, qa, architect, etc.)
│   ├── tasks/                     # 45+ tasks executáveis
│   ├── checklists/                # 10+ checklists de validação
│   ├── data/                      # Knowledge base
│   ├── templates/                 # Templates de documentos
│   ├── workflows/                 # Workflows multi-step
│   ├── tools/                     # Configurações de ferramentas
│   ├── utils/                     # 70+ utilitários
│   └── install-manifest.yaml      # Metadata da instalação
│
├── .claude/                       # ✅ Se Claude Code selecionado
│   └── commands/
│       └── AIOS/
│           ├── agents/*.md        # 11 comandos de agentes
│           └── tasks/*.md         # 45+ comandos de tasks
│
├── .cursor/                       # ✅ Se Cursor selecionado
│   └── rules/
│       ├── dev.mdc
│       ├── po.mdc
│       └── ... (30+ rules)
│
└── Squads/               # ✅ Se squads selecionados
    ├── hybrid-ops/                # Metodologia Pedro Valério
    └── expansion-creator/         # Criador de squads
```

### Upgrade de Instalação Existente

Se você já tem AIOS instalado e quer fazer upgrade:

```bash
# Upgrade automático (RC.9+)
npx aios-core@latest install --force-upgrade

# OU interativo (todos os RCs)
npx aios-core@latest install
# → Menu aparece:
#   1. Keep current version (v1.0.0-rc.8)
#   2. Upgrade AIOS core (v1.0.0-rc.8 → v1.0.0-rc.10)
#   3. Configure IDE settings
#   4. Exit without changes
```

### Comandos Úteis

```bash
# Ver versão disponível no NPM
npm view aios-core@latest version
# Output: 1.0.0-rc.10

# Ver opções de instalação e comandos disponíveis
npx aios-core@latest --help

# Ver squads instalados
# Use o wizard de instalação para selecionar/visualizar squads disponíveis
npx aios-core@latest install

# Ajuda do instalador
npx aios-core@latest install --help
```

### 🚀 Futuro: Modo de Instalação Explícito (Story 3.14)

**Em desenvolvimento**: Sistema de detecção de modo de instalação

O futuro comando `aios init` permitirá escolher explicitamente entre dois modos:

#### Framework Development Mode
- Para desenvolvedores contribuindo ao AIOS-FullStack
- `.aios-core/` é código fonte (commitado)
- Mudanças afetam o framework
- Quality gates testam integridade do framework

#### Project Development Mode
- Para desenvolvedores usando AIOS em seus projetos
- `.aios-core/` é dependência (gitignored)
- Mudanças NÃO modificam o framework
- Quality gates testam seu projeto

**Quando disponível** (após Story 3.14):
```bash
# Após instalação, configure o modo
npx aios init

# Cria .aios-installation-config.yaml
# Atualiza .gitignore baseado no modo escolhido
```

**Status atual**: Atualmente, o instalador detecta automaticamente baseado em heurísticas (package.json name). A Story 3.14 tornará isso explícito e configurável.

### Troubleshooting

**Problema**: `unknown option '--force-upgrade'`

**Causa**: Versão RC antiga (RC.8 ou inferior)

**Solução**:
```bash
# Limpar cache NPX
npm cache clean --force

# Usar versão específica
npx aios-core@1.0.0-rc.10 install --force-upgrade
```

**Problema**: Agents/tasks não instalados

**Causa**: RC.7 ou anterior (path resolution bug)

**Solução**: Usar RC.8 ou superior
```bash
npx aios-core@latest install
```

**Problema**: Versão GitHub (4.31.1) detectada como mais nova que RC

**Causa**: Normal - versioning schemes diferentes

**Solução**: Escolher "Upgrade" ou usar `--force-upgrade`
```bash
npx aios-core@latest install --force-upgrade
# Migra de v4.31.1 para v1.0.0-rc.10 (novo scheme)
```

## Fluxo de Trabalho de Planejamento e Execução

O Synkra AIOS usa uma abordagem de duas fases que separa planejamento estratégico de implementação tática:

### Fase 1: Planejamento (Interface Web)

Use o agente de IA na interface web (Claude.ai, ChatGPT, Gemini, etc.) para:

1. **Briefing e Análise** - Trabalhe com o agente **analyst** para criar o briefing inicial
2. **Product Requirements** - Use o **pm** (Product Manager) para desenvolver o PRD completo
3. **Arquitetura do Sistema** - Colabore com o **architect** para design técnico
4. **Design UX** (opcional) - Trabalhe com **ux-expert** para experiência do usuário

### Fase 2: Desenvolvimento (IDE)


1. **Fragmentação de Histórias** - Use o **sm** (Scrum Master) para criar histórias de desenvolvimento
2. **Implementação** - Trabalhe com o **dev** para codificar as features
3. **Garantia de Qualidade** - Use o **qa** para testes e validação
4. **Gerenciamento de Backlog** - **po** (Product Owner) gerencia prioridades

## O Fluxo de Planejamento (Interface Web)

Este diagrama mostra o fluxo de trabalho de planejamento de alto nível usando agentes na interface web:

```mermaid
graph TD
    Start([User starts with idea]) --> Brief[analyst: Create Brief]
    Brief --> PRD[pm: Develop PRD]
    PRD --> Arch[architect: Design Architecture]
    Arch --> UX{Need UX?}
    UX -->|Yes| UXDesign[ux-expert: Create UX Design]
    UX -->|No| Switch[Switch to IDE]
    UXDesign --> Switch
    Switch --> Stories[sm: Fragment into Stories]

    style Start fill:#e1f5ff
    style Brief fill:#fff4e1
    style PRD fill:#ffe1f5
    style Arch fill:#f5e1ff
    style UXDesign fill:#e1ffe1
    style Switch fill:#ffe1e1
    style Stories fill:#f5f5f5
```

### Trabalhando com Agentes de Planejamento

#### 1. analyst - Analista de Negócios

O agente **analyst** ajuda você a:
- Entender e documentar requisitos de negócio
- Identificar stakeholders e suas necessidades
- Criar briefings detalhados do projeto
- Definir objetivos e métricas de sucesso

**Comandos comuns**:
- `*help` - Mostrar comandos disponíveis
- `*create-brief` - Criar novo briefing
- `*analyze-requirements` - Analisar requisitos
- `*exit` - Sair do agente

#### 2. pm - Product Manager

O **pm** (Product Manager) é responsável por:
- Transformar briefings em PRDs estruturados
- Definir features e prioridades
- Criar roadmaps de produto
- Estabelecer critérios de aceitação

**Fluxo típico**:
1. Recebe o briefing do analyst
2. Faz perguntas de esclarecimento
3. Cria PRD fragmentado por seções
4. Refina com feedback do usuário

#### 3. architect - Arquiteto de Sistema

O agente **architect** desenha:
- Arquitetura técnica do sistema
- Escolha de tecnologias e frameworks
- Estrutura de dados e modelos
- Padrões de design e best practices
- Diagramas de componentes e fluxos

**Responsabilidades**:
- Criar documentos de arquitetura técnica
- Definir stack tecnológico
- Estabelecer padrões de código
- Planejar escalabilidade e performance

#### 4. ux-expert - Especialista em UX (Opcional)

O **ux-expert** foca em:
- Design de interface do usuário
- Fluxos de usuário e jornadas
- Wireframes e mockups conceituais
- Princípios de usabilidade

### Documentos Criados na Fase de Planejamento

Ao final da fase de planejamento, você terá:

```
docs/
├── brief/
│   └── project-brief.md           # Briefing inicial do projeto
├── prd/
│   ├── 01-overview.md             # Visão geral do produto
│   ├── 02-features.md             # Especificação de features
│   ├── 03-requirements.md         # Requisitos detalhados
│   └── 04-success-metrics.md      # Métricas de sucesso
├── architecture/
│   ├── 01-system-design.md        # Design do sistema
│   ├── 02-tech-stack.md           # Stack tecnológico
│   ├── 03-data-models.md          # Modelos de dados
│   └── 04-patterns.md             # Padrões e convenções
└── ux/ (opcional)
    ├── 01-user-flows.md           # Fluxos de usuário
    └── 02-wireframes.md           # Wireframes conceituais
```

## O Ciclo Principal de Desenvolvimento (IDE)

Após completar o planejamento, você muda para o IDE onde o trabalho real de implementação acontece:

```mermaid
graph TD
    Docs[PRD + Architecture Docs] --> SM[sm: Fragment into Stories]
    SM --> Story[Story File Created]
    Story --> Dev[dev: Implement]
    Dev --> Code[Code Written]
    Code --> QA[qa: Test & Validate]
    QA --> Pass{Tests Pass?}
    Pass -->|Yes| Done[Story Complete]
    Pass -->|No| Fix[dev: Fix Issues]
    Fix --> QA
    Done --> Next{More Stories?}
    Next -->|Yes| SM
    Next -->|No| Release[Release Ready]

    style Docs fill:#e1f5ff
    style SM fill:#fff4e1
    style Story fill:#ffe1f5
    style Dev fill:#f5e1ff
    style Code fill:#e1ffe1
    style QA fill:#ffe1e1
    style Pass fill:#f5f5f5
    style Done fill:#e1ffe1
    style Release fill:#e1f5ff
```

### Trabalhando com Agentes de Desenvolvimento

#### 1. sm - Scrum Master

O **sm** (Scrum Master) é crucial para organizar o trabalho:

**Responsabilidades principais**:
- Fragmentar PRD e Arquitetura em histórias de desenvolvimento
- Criar arquivos de story em `docs/stories/`
- Definir tarefas e checkboxes para cada story
- Estabelecer critérios de aceitação
- Organizar dependências entre stories

**Estrutura de uma Story**:
```markdown
# Story 1.1: Configuração Inicial do Projeto

## Descrição
Configurar a estrutura inicial do projeto...

## Contexto
[Referências ao PRD e Arquitetura]

## Tarefas
- [ ] Inicializar repositório Git
- [ ] Configurar package.json
- [ ] Instalar dependências base
- [ ] Criar estrutura de diretórios

## Critérios de Aceitação
- [ ] Projeto inicializa sem erros
- [ ] Todas as dependências instaladas
- [ ] Estrutura de pastas criada

## Arquivos Criados/Modificados
[Atualizado pelo dev durante implementação]

## Notas
[Anotações do dev e qa]
```

#### 2. dev - Desenvolvedor

O agente **dev** é responsável pela implementação:

**Fluxo de trabalho**:
1. Lê a story atual
2. Entende o contexto do PRD e Arquitetura
3. Implementa o código seguindo os padrões
4. Atualiza checkboxes conforme completa tarefas
5. Mantém a seção "Arquivos Criados/Modificados"
6. Adiciona notas sobre decisões técnicas

**Boas práticas**:
- Sempre ler a story completamente antes de começar
- Seguir padrões definidos na Arquitetura
- Escrever código limpo e auto-documentado
- Adicionar tratamento de erros
- Documentar decisões importantes nas Notas

**Comandos no IDE**:
- `*read-story {id}` - Ler uma story específica
- `*update-story` - Atualizar progresso da story
- `*complete-task {id}` - Marcar tarefa como completa

#### 3. qa - Quality Assurance

O agente **qa** valida a implementação:

**Responsabilidades**:
- Revisar código implementado
- Executar testes
- Validar critérios de aceitação
- Reportar bugs e problemas
- Sugerir melhorias

**Processo de validação**:
1. Revisar código do dev
2. Executar suite de testes
3. Validar critérios de aceitação
4. Testar edge cases
5. Documentar resultados nas Notas da story

**Tipos de validação**:
- ✅ **Testes unitários** - Funções individuais
- ✅ **Testes de integração** - Componentes juntos
- ✅ **Testes E2E** - Fluxos completos
- ✅ **Code review** - Qualidade do código
- ✅ **Performance** - Métricas de performance

#### 4. po - Product Owner

O **po** (Product Owner) gerencia o backlog:

**Funções**:
- Priorizar stories no backlog
- Clarificar requisitos quando necessário
- Validar que implementação atende o PRD
- Aprovar stories completadas
- Ajustar escopo conforme necessário

## Capacidades do Test Architect (QA Agent)

O agente **qa** do Synkra AIOS inclui capacidades avançadas de arquitetura de testes:

### 1. Perfil de Risco e Priorização

O QA Agent pode:
- Analisar o código para identificar áreas de alto risco
- Priorizar esforços de teste baseado em complexidade
- Sugerir estratégias de teste apropriadas
- Balancear cobertura vs. recursos

### 2. Geração Automática de Testes

**Testes Unitários**:
```javascript
// Exemplo gerado pelo qa agent
describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = { name: 'Test', email: 'test@example.com' };
    const result = await userService.create(userData);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test');
  });

  it('should reject invalid email', async () => {
    const userData = { name: 'Test', email: 'invalid' };
    await expect(userService.create(userData))
      .rejects.toThrow('Invalid email');
  });
});
```

**Testes de Integração**:
- Testes de API endpoints
- Testes de banco de dados
- Testes de serviços externos
- Testes de autenticação/autorização

**Testes E2E**:
- Fluxos completos de usuário
- Navegação entre páginas
- Submissão de formulários
- Validação de estados

### 3. Estratégias de Teste

O QA Agent sugere estratégias baseadas em:

**Complexidade do Código**:
- Código complexo → Testes abrangentes + edge cases
- Código simples → Testes básicos de happy path
- Código crítico → Testes exaustivos + stress tests

**Tipo de Funcionalidade**:
- **CRUD básico** → Testes unitários + integração
- **Lógica de negócio** → Testes unitários extensivos
- **UI/UX** → Testes E2E + acessibilidade
- **APIs** → Testes de contrato + carga

### 4. Cobertura e Métricas

O agente **qa** monitora:
- Cobertura de código (linha, branch, função)
- Cobertura de features (vs. PRD)
- Cobertura de cenários de usuário
- Métricas de qualidade (bugs encontrados, tempo de fix)

## Integração com IDE


1. **Configurar regras globais**:
   - Abrir Settings → Global Rules
   - Salvar configuração

2. **Ativar agentes**:
   ```
   @dev
   *help
   ```

3. **Trabalhar com stories**:
   ```
   @sm
   *create-story "Implementar autenticação"
   ```

### Configuração para Cursor

1. **Configurar user rules**:
   - Abrir Settings → User Rules
   - Copiar conteúdo de `.cursor/global-rules.md`
   - Salvar configuração

2. **Comandos principais**:
   - `@agent-name` - Ativar agente específico
   - `*command` - Executar comando do agente
   - `*exit` - Sair do agente

### Configuração para Claude Code

1. **Automático**:
   - Arquivo `.claude/CLAUDE.md` é carregado automaticamente
   - Nenhuma configuração manual necessária

2. **Recursos especiais**:
   - Reconhecimento automático de comandos AIOS
   - Integração com workflows e tasks
   - Rastreamento automático de checkboxes

## Sistema de Preferências Técnicas

O Synkra AIOS permite configurar preferências técnicas que influenciam decisões dos agentes:

### Definir Preferências

Crie um arquivo `docs/tech-preferences.md`:

```markdown
# Preferências Técnicas do Projeto

## Stack Principal
- **Backend**: Node.js + Express
- **Frontend**: React + TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma

## Padrões de Código
- **Style Guide**: Airbnb JavaScript Style Guide
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library

## Arquitetura
- **Pattern**: Clean Architecture
- **API**: RESTful + GraphQL
- **Auth**: JWT + OAuth2

## DevOps
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend) + Railway (Backend)
- **Monitoring**: Sentry + LogRocket
```

### Como os Agentes Usam as Preferências

**architect**:
- Usa preferências para desenhar arquitetura consistente
- Sugere tecnologias alinhadas com o stack definido
- Aplica padrões especificados

**dev**:
- Implementa usando frameworks e bibliotecas preferidos
- Segue style guides e padrões definidos
- Usa ferramentas de desenvolvimento especificadas

**qa**:
- Configura testes com frameworks escolhidos
- Valida conformidade com padrões
- Verifica integração com ferramentas de CI/CD

## Fluxo de Trabalho Completo: Do Conceito à Produção

### 1. Ideação e Planejamento (Interface Web)

**Semana 1**: Trabalhe com agentes de planejamento

```
Dia 1-2: analyst
- Criar briefing inicial
- Identificar stakeholders
- Definir objetivos de negócio

Dia 3-4: pm
- Desenvolver PRD completo
- Definir features e prioridades
- Estabelecer roadmap

Dia 5-6: architect
- Desenhar arquitetura técnica
- Escolher stack tecnológico
- Criar diagramas de sistema

Dia 7 (opcional): ux-expert
- Design de experiência do usuário
- Criar wireframes
- Definir fluxos de usuário
```

### 2. Preparação para Desenvolvimento (IDE)

**Início da Semana 2**: Setup e fragmentação

```
@sm
*fragment-prd

[sm cria stories numeradas baseadas no PRD]

Stories criadas:
- Story 1.1: Setup inicial do projeto
- Story 1.2: Configurar banco de dados
- Story 2.1: Implementar autenticação
- Story 2.2: CRUD de usuários
- Story 3.1: UI de login
...
```

### 3. Desenvolvimento Iterativo (IDE)

**Semanas 2-X**: Ciclo dev → qa

Para cada story:

```
@dev
*read-story 1.1

[dev implementa seguindo a story]
[atualiza checkboxes: [ ] → [x]]
[adiciona arquivos criados]
[documenta decisões nas Notas]

@qa
*validate-story 1.1

[qa revisa código]
[executa testes]
[valida critérios de aceitação]
[reporta issues ou aprova]
```

### 4. Gestão de Backlog (Contínua)

```
@po
*prioritize-backlog

[po reorganiza stories baseado em:]
- Feedback de stakeholders
- Blockers e dependências
- Mudanças de requisitos
- Valor de negócio
```

### 5. Release e Deployment

Quando todas as stories estão completas:

```
@qa
*final-validation

[qa executa:]
- Suite completa de testes
- Testes de regressão
- Validação de performance
- Security audit

@dev
*prepare-release

[dev prepara:]
- Build de produção
- Documentação de deployment
- Migration scripts
- Rollback procedures
```

## Repository Integrity e GitHub DevOps Agent

### O Agente @github-devops

O AIOS-FullStack impõe integridade de repositório através de um agente centralizado de DevOps.

**Regra Crítica**: APENAS @github-devops pode fazer push para repositórios GitHub.

#### Por Que Isso Importa

Sem controle centralizado:
- ❌ Código não testado chega à produção
- ❌ Builds quebrados na branch main
- ❌ Conflitos de versão
- ❌ Gerenciamento de release inconsistente

Com @github-devops:
- ✅ Quality gates automatizados antes do push
- ✅ Gerenciamento de versão sistemático
- ✅ Criação de PR automatizada
- ✅ Orquestração de CI/CD

#### Usando @github-devops

**Ativar o agente**:
```
@github-devops
*help
```

**Comandos comuns**:
- `*detect-repo` - Mostra repositório e modo detectados
- `*pre-push` - Executa quality gates e faz push para GitHub
- `*create-pr` - Cria pull request da branch atual
- `*version-check` - Analisa requisitos de bump de versão
- `*configure-ci` - Configura workflows do GitHub Actions
- `*cleanup` - Remove branches obsoletas e arquivos temporários

#### Workflow de Quality Gate

1. **Faça mudanças** no seu codebase
2. **Commit localmente** (git commit)
3. **Ative @github-devops**
4. **Execute pre-push quality gate**:
   ```
   @github-devops
   *pre-push
   ```

5. **Agente executa**:
   - ✓ npm run lint (se existir)
   - ✓ npm run test (se existir)
   - ✓ npm run typecheck (se existir)
   - ✓ npm run build (se existir)
   - ✓ Verifica story status = Done
   - ✓ Checa se não há mudanças uncommitted

6. **Aprovação do usuário** - Agente apresenta resumo para confirmação
7. **Push para GitHub** - Só prossegue se todos os gates passarem

#### Design Repository-Agnostic

O agente @github-devops funciona com QUALQUER repositório git:
- Detecta seu repositório automaticamente
- Adapta quality gates aos seus npm scripts
- Funciona em framework-dev E project-dev modes (quando disponível)
- Sem assumptions hard-coded de repositório

**Modo Framework Development** (futuro):
```bash
# No repositório aios-core
@github-devops
*detect-repo
# Output:
# Repository: github.com/SynkraAI/aios-core
# Mode: framework-development
# Quality Gates: Testes do framework AIOS
```

**Modo Project Development** (futuro):
```bash
# No seu projeto
@github-devops
*detect-repo
# Output:
# Repository: github.com/seuusuario/seu-projeto
# Mode: project-development
# Quality Gates: Testes do SEU projeto
```

#### Git Hook Enforcement

Um git hook pre-push previne pushes diretos acidentais:

```bash
# Isso vai FALHAR:
git push origin main

# Erro: Git push bloqueado!
# Apenas o agente @github-devops pode fazer push ao repositório remoto.
```

**Para fazer push de mudanças**:
1. Ative @github-devops
2. Execute `*pre-push`
3. Siga o workflow do quality gate

#### Criando Pull Requests

```
@github-devops
*create-pr
```

O agente irá:
- Criar feature branch do story ID
- Gerar descrição do PR do contexto da story
- Linkar PR à story
- Atribuir reviewers baseado no tipo da story
- Usar repositório detectado (não hard-coded)

#### Configuração do GitHub Actions

```
@github-devops
*configure-ci
```

Instala workflows em .github/workflows/:
- ci.yml - Testes em PRs
- cd.yml - Deploy em merge para main
- quality-gate.yml - Lint + Test + Build

Workflows se adaptam aos npm scripts do seu repositório.

**Nota**: Esta funcionalidade está planejada para Story 3.14. O instalador atual não configura git hooks ou modos de instalação ainda.

## Modos de Desenvolvimento de Stories

O AIOS-FullStack oferece três modos de desenvolvimento para acomodar diferentes níveis de habilidade e restrições de tempo.

### Modo 1: YOLO Mode 🚀

**Melhor para**: Desenvolvedores experientes, stories simples, restrições de tempo

**Características**:
- Tomada de decisão autônoma
- Prompts mínimos ao usuário (0-1)
- Execução rápida
- Log automático de todas as decisões

**Como usar**:
```
@dev
*develop-yolo "Story 2.5"
```

**O que acontece**:
- Agente lê story completamente
- Toma todas as decisões técnicas autonomamente
- Loga decisões para revisão
- Implementa story completa
- Gera relatório de decisões no final

**Exemplo de Log de Decisão**:
```markdown
## Decisões YOLO Mode - Story 2.5

1. **Escolha de Biblioteca**: Selecionou Axios em vez de Fetch
   Razão: Melhor tratamento de erros e interceptors

2. **State Management**: Escolheu React Context
   Razão: Requisitos da story não justificam complexidade do Redux

3. **Abordagem de Testes**: Jest + React Testing Library
   Razão: Corresponde ao tech stack existente
```

### Modo 2: Interactive Mode 🤝

**Melhor para**: Aprendizado, stories complexas, decisões importantes

**Características**:
- Checkpoints explícitos de decisão
- Explicações educacionais
- Velocidade e controle balanceados
- Usuário confirma decisões chave

**Como usar**:
```
@dev
*develop-story "Story 2.5"
# ou
*develop-interactive "Story 2.5"
```

**Checkpoints de Decisão**:
- Seleção de padrão arquitetural
- Escolhas de biblioteca/framework
- Abordagens de implementação de algoritmos
- Decisões de estrutura de dados
- Estratégia de testes

**Exemplo de Interação**:
```
Agente: Preciso escolher uma abordagem de state management.

Opções:
1. React Context - Simples, built-in
2. Redux Toolkit - Mais complexo, melhor para state grande
3. Zustand - Leve, moderno

Requisitos da Story: State de formulário simples, 3-4 campos

Recomendação: React Context (opção 1)
Razão: Requisitos da story são simples, Context é suficiente

Sua escolha [1/2/3]: _
```

### Modo 3: Pre-Flight Planning Mode 📋

**Melhor para**: Stories ambíguas, features críticas, evitar scope drift

**Características**:
- Planejamento abrangente upfront
- Questionário completo antes do desenvolvimento
- Execução com zero ambiguidade
- Controle máximo

**Como usar**:
```
@dev
*develop-preflight "Story 2.5"
```

**Workflow**:

**Fase 1: Análise da Story**
- Agente lê story completamente
- Identifica TODAS as ambiguidades e questões abertas
- Gera questionário abrangente

**Fase 2: Coleta de Input em Batch**
```
Questionário Pre-Flight Planning - Story 2.5

Questões de Arquitetura:
1. Padrão de endpoint de API? (RESTful, GraphQL, RPC)
2. Onde colocar lógica de negócio? (Service layer, Controller, Model)

Questões de Biblioteca:
3. Preferência de HTTP client? (Axios, Fetch, node-fetch)
4. Biblioteca de validação de formulário? (Yup, Zod, Joi, custom)

Questões de Testes:
5. Alvo de cobertura de testes? (80%, 90%, 100%)
6. Estratégia de dados de teste? (Fixtures, Factories, Mocks)

Questões de Design:
7. Abordagem de tratamento de erros? (Try-catch, Error boundaries, ambos)
8. UI de loading state? (Spinner, Skeleton, Progress bar)

Suas respostas [separar com | ]:
RESTful | Service layer | Axios | Yup | 80% | Fixtures | Ambos | Spinner
```

**Fase 3: Execução com Contexto Completo**
- Agente tem TODAS as respostas upfront
- Sem perguntas durante desenvolvimento
- Sem scope drift
- Sem alucinações em requisitos ambíguos

**Fase 4: Registro de Decisão**
```markdown
## Decisões Pre-Flight - Story 2.5

Baseado em input do usuário durante planejamento pre-flight:

1. Padrão de API: RESTful
2. Lógica de Negócio: Service layer
3. HTTP Client: Axios
4. Validação de Formulário: Yup
5. Cobertura de Testes: 80%
6. Dados de Teste: Fixtures
7. Tratamento de Erros: Try-catch + Error boundaries
8. UI de Loading: Spinner

Implementação prosseguiu com zero ambiguidade.
```

### Escolhendo o Modo Certo

| Cenário | Modo Recomendado | Razão |
|---------|------------------|-------|
| Feature CRUD simples | YOLO | Padrões standard, baixo risco |
| Aprender novo framework | Interactive | Valor educacional |
| Sistema de autenticação crítico | Pre-Flight | Evitar erros de segurança |
| Correção de bug | YOLO | Rápido, baixa ambiguidade |
| Algoritmo complexo | Pre-Flight | Muitas escolhas de design |
| Refatoração de rotina | Interactive | Bom balanço |
| Spike/prototype | YOLO | Velocidade importa |
| Feature de produção | Pre-Flight | Qualidade importa |

### Comparação de Modos

| Aspecto | YOLO | Interactive | Pre-Flight |
|---------|------|-------------|------------|
| Prompts ao Usuário | 0-1 | 5-10 | 10-30 |
| Velocidade | Mais Rápido | Médio | Mais Lento |
| Controle | Mais Baixo | Médio | Mais Alto |
| Aprendizado | Baixo | Alto | Médio |
| Qualidade de Decisão | Automatizada | Colaborativa | Abrangente |
| Risco de Scope Drift | Médio | Baixo | Mais Baixo |

**Nota**: Esta funcionalidade está planejada para Story 3.13. O agente @dev atual usa modo interativo padrão.

## Boas Práticas e Dicas

### Para Fase de Planejamento

✅ **Faça**:
- Seja específico e detalhado no briefing inicial
- Responda completamente às perguntas dos agentes
- Revise e refine documentos iterativamente
- Mantenha consistência entre PRD e Arquitetura
- Documente decisões importantes e suas razões

❌ **Evite**:
- Pular etapas do planejamento
- Criar PRDs vagos ou incompletos
- Ignorar considerações de arquitetura
- Misturar requisitos de negócio com detalhes de implementação

### Para Fase de Desenvolvimento

✅ **Faça**:
- Trabalhe uma story por vez, do início ao fim
- Atualize checkboxes imediatamente após completar tarefas
- Mantenha a lista "Arquivos Criados/Modificados" atualizada
- Documente decisões técnicas importantes nas Notas
- Execute testes antes de marcar story como completa
- Siga os padrões definidos na Arquitetura

❌ **Evite**:
- Começar múltiplas stories simultaneamente
- Pular testes ou validação de QA
- Ignorar critérios de aceitação
- Desviar dos padrões sem documentar
- Deixar checkboxes desatualizados

### Comunicação Entre Agentes

As stories servem como **meio de comunicação** entre agentes:

**sm → dev**: Story define o que construir
**dev → qa**: Notas da story explicam como foi construído
**qa → dev**: Notas da story reportam issues
**po → todos**: Priorização e esclarecimentos

**Exemplo de comunicação via Notas**:

```markdown
## Notas

### [dev - 2025-01-15]
Implementei autenticação usando JWT com refresh tokens.
Escolhi bcrypt para hash de senhas (10 rounds).
Tokens expiram em 15min, refresh em 7 dias.

### [qa - 2025-01-16]
✅ Testes unitários passando (12/12)
✅ Testes de integração OK (5/5)
⚠️ Encontrado: Token não é invalidado no logout
   Severity: HIGH
   Precisa fix antes de aprovar

### [dev - 2025-01-16]
✅ Fix aplicado: Implementado blacklist de tokens
✅ Novos testes adicionados para logout
Pronto para nova validação

### [qa - 2025-01-17]
✅ Story aprovada
Todos os critérios atendidos
```

## Trabalhando em Projetos Brownfield

Ao integrar Synkra AIOS em projetos existentes:

### 1. Análise Inicial

```
@analyst
*analyze-existing-project

[Forneça ao analyst:]
- Visão geral do projeto atual
- Stack tecnológico existente
- Documentação disponível
- Pain points e objetivos de melhoria
```

### 2. Documentação Retroativa

```
@architect
*document-existing-architecture

[architect criará:]
- Mapeamento da arquitetura atual
- Identificação de padrões existentes
- Documentação de tech debt
- Recomendações de melhoria
```

### 3. Planejamento Incremental

```
@pm
*create-migration-plan

[pm desenvolverá:]
- Roadmap de migração
- Stories de refatoração
- Plano de modernização
- Estratégia de rollout
```

## Solução de Problemas

### Agente não está seguindo instruções

**Problema**: Agente ignora parte do PRD ou Arquitetura

**Solução**:
1. Verifique se o documento está fragmentado corretamente
2. Certifique-se de que o contexto está explícito na story
3. Use notas na story para dar contexto adicional
4. Se necessário, fragmente a story em partes menores

### Stories muito grandes

**Problema**: Story tem muitas tarefas e se torna difícil de gerenciar

**Solução**:
```
@sm
*split-story 3.1

[sm dividirá em:]
- Story 3.1a: Primeira parte
- Story 3.1b: Segunda parte
```

### Conflito entre PRD e Arquitetura

**Problema**: PRD pede feature que conflita com arquitetura

**Solução**:
1. Volte para a interface web
2. Trabalhe com pm e architect para resolver
3. Atualize os documentos
4. Notifique o sm para revisar stories afetadas

### Mudança de requisitos

**Problema**: Cliente/stakeholder muda requisitos no meio do projeto

**Solução**:
```
1. @po
   *update-prd "Nova feature X necessária"

2. @architect
   *assess-impact "Nova feature X"

3. @sm
   *create-change-stories

4. @po
   *reprioritize-backlog
```

## Meta-Agentes

O Synkra AIOS inclui meta-agentes para orquestração:

### aios-master

O **aios-master** é o agente de orquestração principal:

**Capacidades**:
- Coordenar múltiplos agentes
- Executar workflows complexos
- Gerenciar estado do projeto
- Tomar decisões de alto nível

**Quando usar**:
- Operações que envolvem múltiplos agentes
- Workflows automatizados
- Situações que requerem decisões contextuais

### aios-orchestrator

O **aios-orchestrator** gerencia fluxos de trabalho:

**Funções**:
- Sequenciar tarefas entre agentes
- Gerenciar dependências
- Monitorar progresso
- Coordenar handoffs

### aios-developer

O **aios-developer** é o meta-agente para o próprio AIOS:

**Uso**:
- Criar novos agentes
- Modificar workflows
- Estender o framework
- Customizar comportamentos

```
@aios-developer
*create-agent "custom-agent"

[aios-developer guiará você na criação de um novo agente]
```

## Expansão e Customização

### Squads

O Synkra AIOS suporta squads para domínios específicos:

**Disponíveis durante instalação**:
- **hybrid-ops** - Metodologia Pedro Valério (operações híbridas humano-agente)
- **expansion-creator** - Ferramentas para criar novos squads
- **aios-infrastructure-devops** - Utilities de DevOps e infraestrutura
- **meeting-notes** - Assistente de notas e atas de reuniões

**Configurar squads na instalação**:
```bash
# Durante a instalação, o wizard pergunta quais squads instalar
npx aios-core@latest install

# O wizard mostra:
# 📦 Select Squads to Install:
#   ◉ hybrid-ops
#   ◯ expansion-creator
#   ◯ aios-infrastructure-devops
#   ◯ meeting-notes
```

**Adicionar squads depois**:
```bash
# Re-execute o instalador
npx aios-core@latest install

# Escolha "Configure IDE settings" ou "Upgrade"
# Wizard permitirá adicionar squads não instalados
```

### Criar Seus Próprios Agentes

Use o **aios-developer** para criar agentes customizados:

```
@aios-developer
*create-agent

[Siga a elicitação interativa:]
Nome do agente: data-scientist
Expertise: Análise de dados e machine learning
Comandos principais: *analyze, *visualize, *predict
Workflows: data-analysis.yml, ml-model.yml
```

### Criar Templates Customizados

Adicione templates próprios em `aios-core/templates/`:

```markdown
---
template: custom-document
category: planning
description: Template personalizado para X
---

# Título do Template

## Seções
...
```

## Checklist de Workflow

Use este checklist para garantir que está seguindo o workflow corretamente:

### Fase de Planejamento (Web UI)
- [ ] Briefing criado com analyst
- [ ] PRD completo desenvolvido com pm
- [ ] Arquitetura técnica definida com architect
- [ ] UX design criado (se aplicável) com ux-expert
- [ ] Todos os documentos revisados e aprovados
- [ ] Preferências técnicas documentadas
- [ ] Pronto para mudança ao IDE

### Fase de Desenvolvimento (IDE)
- [ ] Stories criadas pelo sm
- [ ] Dependências entre stories identificadas
- [ ] Stories priorizadas pelo po
- [ ] Working directory configurado
- [ ] Repositório Git inicializado
- [ ] IDE configurado com regras AIOS

### Para Cada Story
- [ ] Story lida completamente
- [ ] Contexto do PRD/Arquitetura entendido
- [ ] Implementação seguindo padrões
- [ ] Checkboxes atualizados durante trabalho
- [ ] Arquivos criados/modificados documentados
- [ ] Testes escritos e executados
- [ ] Code review realizado
- [ ] Critérios de aceitação validados
- [ ] Notas documentadas com decisões
- [ ] Story aprovada pelo qa

### Antes do Release
- [ ] Todas as stories completas
- [ ] Suite completa de testes passando
- [ ] Documentação atualizada
- [ ] Performance validada
- [ ] Security audit realizado
- [ ] Build de produção testado
- [ ] Plano de deployment pronto
- [ ] Procedimentos de rollback documentados

## Recursos Adicionais

### Documentação
- [Guia de Instalação](../docs/getting-started.md)
- [Arquitetura do AIOS](../docs/architecture.md)
- [Guia de Squads](../docs/Squads.md)
- [Trabalhando em Brownfield](./working-in-the-brownfield.md)

### Suporte
- [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)

### Exemplos
Veja `Squads/` para exemplos de:
- Agentes customizados
- Workflows especializados
- Templates de documentos
- Checklists de validação

---

**Nota**: Este guia é uma visão geral. Para detalhes específicos de implementação, consulte a documentação técnica na pasta `docs/`.

*Synkra AIOS User Guide v2.0*
*Última atualização: Janeiro 2025*
