---
name: game-development
description: |
  Orquestrador inteligente de game development. Analisa o projeto do usuário e roteia para sub-skills
  especializados por plataforma (web, mobile, PC, VR/AR), dimensão (2D, 3D) e domínio (design, arte,
  áudio, multiplayer). Inclui decision tree automatizada, princípios universais de game dev e
  combinação multi-skill para projetos complexos.
license: Complete terms in LICENSE.txt
allowed-tools: Read, Write, Edit, Glob, Grep, Bash

version: 1.0.0
category: development
tags: [SKILL]
---

# Game Development

> **Orchestrator skill** — analisa o contexto do projeto e roteia para sub-skills especializados. Fornece princípios universais de game dev que se aplicam a qualquer plataforma ou engine.

---

## Quick Start

```
/game-development "Quero fazer um platformer 2D para browser"
/game-development "Mobile puzzle game para iOS e Android"
/game-development "Multiplayer VR shooter com Unity"
/game-development "RPG top-down com Godot"
```

---

## Quando Usar

| Cenário | Exemplo |
|---------|---------|
| Iniciar projeto de jogo do zero | "Quero fazer um jogo de plataforma" |
| Escolher engine/framework para o contexto | "Qual engine usar para um puzzle mobile?" |
| Entender padrões de arquitetura de games | "Como estruturar game loop, ECS, state machine?" |
| Projeto que combina múltiplos domínios | "VR shooter multiplayer com áudio adaptativo" |
| Otimização de performance em jogos | "Meu jogo tá com frame drops, como resolver?" |

## NÃO Usar Para

| Cenário | Alternativa |
|---------|-------------|
| Gamificação de app (pontos, badges) | Implementar diretamente com `@dev` |
| Jogo de tabuleiro/cartas físico | Design manual, não precisa de engine |
| Simulação científica sem gameplay | Framework de simulação específico |
| Aplicativo educativo sem mecânicas de jogo | `@dev` ou skill de app-builder |

---

## Discovery Questions

Perguntas para fazer antes de executar. Use `AskUserQuestion`. Pule se o usuário já forneceu contexto.

1. **Que tipo de jogo você quer fazer?** — Platformer, puzzle, RPG, shooter, tower defense, etc. (define padrões de arquitetura e sub-skills necessários)
2. **Qual a plataforma alvo?** — Web (HTML5/WebGL), mobile (iOS/Android), PC (Steam/Desktop) ou VR/AR (Meta Quest, Vision Pro). (roteia para o sub-skill de plataforma)
3. **2D ou 3D?** — Determina engine, pipeline de assets e padrões de rendering.
4. **Já tem engine/framework definido?** — Godot, Unity, Unreal, Phaser, PixiJS, etc. Se não, a decision tree recomenda. *(opcional)*
5. **Vai ter multiplayer?** — Se sim, roteia também para o sub-skill de networking e define arquitetura de rede. *(opcional)*
6. **Qual o nível de experiência com game dev?** — Iniciante, intermediário, avançado. Ajusta profundidade das explicações. *(opcional)*

---

## SKILL DEFINITION

```yaml
skill:
  name: Game Development Orchestrator
  id: game-development
  type: orchestrator

veto_conditions:
  - id: VETO_NOT_A_GAME
    trigger: "Request is clearly not game development (e.g., CRUD app, landing page)"
    action: "REDIRECT: 'Isso não parece ser um jogo. Use @dev para apps ou /app-builder para aplicações.'"
    keywords:
      - "landing page"
      - "dashboard"
      - "CRUD"
      - "formulário"
      - "e-commerce"

  - id: VETO_NO_CONTEXT
    trigger: "User provides zero context about what game they want"
    action: "ASK: Executar Discovery Questions completas antes de rotear."

  - id: VETO_SCOPE_CREEP
    trigger: "User asks to build entire game in one prompt"
    action: "WARN: 'Jogos são iterativos. Vamos começar pelo protótipo: game loop + uma mecânica core. Depois expandimos.'"

constraints:
  forbidden_actions:
    - NEVER recomendar engine sem entender o contexto (plataforma, 2D/3D, scope)
    - NEVER pular prototipagem — sempre começar pelo game loop mínimo
    - NEVER otimizar antes de ter gameplay funcional ("make it work, make it right, make it fast")

decision_tree:
  description: |
    Árvore de decisão automatizada para rotear o projeto aos sub-skills corretos.
    Pode rotear para múltiplos sub-skills simultaneamente em projetos complexos.

  step_1_platform:
    question: "Qual a plataforma alvo?"
    branches:
      web_browser:
        signal: "browser, HTML5, WebGL, web, navegador, itch.io"
        route: "game-development/web-games"
        engines: ["Phaser 3", "PixiJS", "Three.js", "PlayCanvas", "Kaboom.js"]
      mobile:
        signal: "iOS, Android, mobile, celular, tablet, App Store, Google Play"
        route: "game-development/mobile-games"
        engines: ["Unity", "Godot", "Flutter Flame", "React Native (Skia)"]
      pc_desktop:
        signal: "Steam, PC, desktop, Windows, Mac, Linux"
        route: "game-development/pc-games"
        engines: ["Godot", "Unity", "Unreal Engine", "Bevy (Rust)", "MonoGame"]
      vr_ar:
        signal: "VR, AR, Meta Quest, Vision Pro, headset, XR, realidade virtual"
        route: "game-development/vr-ar"
        engines: ["Unity (XR Toolkit)", "Unreal (OpenXR)", "Godot XR", "A-Frame (WebXR)"]
      multi_platform:
        signal: "todas as plataformas, cross-platform, multiplataforma"
        route: "Rotear para plataforma PRINCIPAL primeiro, depois adaptar"
        engines: ["Godot", "Unity"]

  step_2_dimension:
    question: "O jogo é 2D ou 3D?"
    branches:
      2d:
        signal: "2D, sprites, pixel art, tilemap, side-scroller, top-down"
        route: "game-development/2d-games"
        notes: "Sprites, tilemaps, physics 2D, câmera ortográfica"
      3d:
        signal: "3D, meshes, shaders, modelos 3D, primeira pessoa, terceira pessoa"
        route: "game-development/3d-games"
        notes: "Meshes, shaders, lighting, câmera perspectiva, LOD"
      2_5d:
        signal: "2.5D, isométrico, perspectiva falsa, oblique"
        route: "game-development/2d-games + referência 3d-games para shaders"
        notes: "Renderização 2D com ilusão de profundidade"

  step_3_specialty:
    question: "O projeto precisa de expertise em áreas especializadas?"
    branches:
      game_design:
        signal: "GDD, balanceamento, economia, progressão, level design, player psychology"
        route: "game-development/game-design"
      multiplayer:
        signal: "multiplayer, online, netcode, lobby, matchmaking, servidor"
        route: "game-development/multiplayer"
      game_art:
        signal: "arte, visual, sprites, animação, pipeline de assets, shader"
        route: "game-development/game-art"
      game_audio:
        signal: "áudio, som, música, SFX, áudio adaptativo, FMOD, Wwise"
        route: "game-development/game-audio"

  combination_rules: |
    Projetos complexos usam MÚLTIPLOS sub-skills em sequência:

    1. SEMPRE começar pela PLATAFORMA (define constraints técnicos)
    2. Depois DIMENSÃO (define pipeline de assets)
    3. Depois ESPECIALIDADES conforme necessário

    Exemplo: "Multiplayer VR shooter"
    → game-development/vr-ar (plataforma + comfort)
    → game-development/3d-games (rendering + shaders)
    → game-development/multiplayer (netcode + arquitetura)

workflow:
  phases:
    0_discovery:
      name: "Discovery e Classificação"
      execution: |
        1. Ler contexto do usuário
        2. Se contexto insuficiente: executar Discovery Questions
        3. Classificar projeto na decision tree (plataforma → dimensão → especialidades)
        4. Montar lista de sub-skills a carregar

    1_routing:
      name: "Roteamento para Sub-Skills"
      execution: |
        1. Apresentar ao usuário o roteamento decidido:
           "Com base no seu projeto, vou usar: [lista de sub-skills]"
        2. Confirmar se está correto
        3. Carregar sub-skills na ordem: plataforma → dimensão → especialidades

    2_principles:
      name: "Aplicar Princípios Universais"
      execution: |
        1. Aplicar os Core Principles (game loop, patterns, input, performance)
        2. Contextualizar para o projeto específico
        3. Delegar implementação para sub-skills especializados

    3_prototype:
      name: "Guiar Prototipagem"
      execution: |
        1. Definir MVP: game loop + 1 mecânica core
        2. Iterar: Input → Update → Render funcional
        3. Expandir incrementalmente

engine_selector:
  description: "Recomendação de engine baseada em critérios do projeto"
  matrix:
    - criteria: "2D + Web + Iniciante"
      recommendation: "Phaser 3"
      reason: "API simples, boa documentação, deploy via browser"
    - criteria: "2D + Qualquer + Intermediário"
      recommendation: "Godot"
      reason: "GDScript acessível, leve, export multiplataforma, open-source"
    - criteria: "3D + PC/Mobile + Intermediário"
      recommendation: "Godot ou Unity"
      reason: "Godot se open-source importa; Unity se asset store importa"
    - criteria: "3D + PC + Avançado + AAA"
      recommendation: "Unreal Engine"
      reason: "Pipeline AAA, Nanite, Lumen, Blueprint + C++"
    - criteria: "VR/AR + Qualquer"
      recommendation: "Unity (XR Toolkit)"
      reason: "Melhor ecossistema XR, mais dispositivos suportados"
    - criteria: "Mobile + Casual + Pequeno"
      recommendation: "Flutter Flame ou Godot"
      reason: "Flame se já usa Flutter; Godot para dedicado"
    - criteria: "Web + 3D"
      recommendation: "Three.js ou PlayCanvas"
      reason: "Three.js para controle total; PlayCanvas para editor visual"
    - criteria: "Multiplayer + Competitivo"
      recommendation: "Unity ou Unreal + servidor dedicado"
      reason: "Netcode maduro, rollback libraries disponíveis"
```

---

## Core Principles (Universais — Todas as Plataformas)

### 1. The Game Loop

Todo jogo, independente de plataforma, segue este padrão:

```
INPUT  → Ler ações do jogador
UPDATE → Processar lógica do jogo (fixed timestep)
RENDER → Desenhar o frame (interpolado)
```

**Fixed Timestep Rule:**
- Física/lógica: Taxa fixa (ex: 50Hz / 20ms por tick)
- Rendering: O mais rápido possível (vsync ou uncapped)
- Interpolar entre estados para visuais suaves
- Acumular delta time e consumir em ticks fixos

```
// Pseudocode — fixed timestep com interpolação
accumulator += deltaTime
while (accumulator >= FIXED_DT):
    previousState = currentState
    update(FIXED_DT)
    accumulator -= FIXED_DT

alpha = accumulator / FIXED_DT
render(lerp(previousState, currentState, alpha))
```

---

### 2. Pattern Selection Matrix

| Padrão | Quando Usar | Exemplo | Complexidade |
|--------|-------------|---------|-------------|
| **State Machine** | 3-5 estados discretos | Player: Idle→Walk→Jump→Fall | Baixa |
| **Hierarchical FSM** | Estados com sub-estados | Combat: {Attack→{Light, Heavy}, Block, Dodge} | Média |
| **Object Pooling** | Spawn/destroy frequente | Balas, partículas, inimigos wave | Baixa |
| **Observer/Events** | Comunicação cross-system | Health→UI, Score→Leaderboard | Baixa |
| **ECS** | Milhares de entidades similares | RTS units, partículas, simulação | Alta |
| **Command** | Undo, replay, networking | Input recording, replay system | Média |
| **Behavior Tree** | IA com decisões complexas | Enemy AI modular, NPCs | Média |
| **Blackboard** | Compartilhar dados entre sistemas | AI ↔ World knowledge | Média |
| **Component** | Composição flexível de entidades | Player = Physics + Sprite + Input + Health | Baixa |
| **Singleton** | Managers globais (com cuidado) | AudioManager, InputManager | Baixa |

**Decision Rule:** Comece com State Machine + Component. Adicione ECS somente quando performance exigir. Behavior Tree para IA não-trivial.

---

### 3. Input Abstraction

Abstrair input em AÇÕES, não teclas cruas:

```
// Mapeamento de ações
"jump"   → Space, Gamepad A, Touch tap, Swipe up
"move"   → WASD, Left stick, Virtual joystick, Arrow keys
"attack" → Left click, Gamepad X, Touch hold
"pause"  → Escape, Start, System gesture
```

**Por quê:** Habilita multi-plataforma, controles rebindáveis, acessibilidade.

**Implementação:**
1. Camada de Input crua (platform-specific)
2. Camada de Mapeamento (action ↔ input)
3. Camada de Consumo (game logic lê ações, não teclas)

---

### 4. Performance Budget (60 FPS = 16.67ms)

| Sistema | Budget | Notas |
|---------|--------|-------|
| Input | 1ms | Polling ou event-driven |
| Physics | 3ms | Broadphase + narrowphase |
| AI | 2ms | Pode ser distribuída entre frames |
| Game Logic | 4ms | State updates, spawning |
| Rendering | 5ms | Draw calls, shaders |
| Audio | 0.5ms | Mix assíncrono |
| Buffer | 1.17ms | Margem de segurança |

**Optimization Priority (nesta ordem):**

| Prioridade | Técnica | Impacto |
|-----------|---------|---------|
| 1 | Algoritmo (O(n²) → O(n log n)) | Exponencial |
| 2 | Spatial partitioning (grid, quadtree) | Alto para muitos objetos |
| 3 | Batching (reduzir draw calls) | Alto para rendering |
| 4 | Pooling (evitar GC spikes) | Alto para spawn/destroy |
| 5 | LOD (detalhe por distância) | Médio para 3D |
| 6 | Culling (pular invisíveis) | Médio para mundos grandes |
| 7 | Multithreading | Alto mas complexo |

**Regra de ouro:** NUNCA otimizar sem profiler. "Premature optimization is the root of all evil."

---

### 5. AI Selection by Complexity

| Tipo de IA | Complexidade | Quando Usar | Prós | Contras |
|-----------|-------------|-------------|------|---------|
| **FSM** | Simples | 3-5 estados, comportamento previsível | Fácil de debugar | Explode com muitos estados |
| **Behavior Tree** | Média | Modular, designer-friendly | Reutilizável, visual | Overhead de travessia |
| **GOAP** | Alta | Emergente, planning-based | Comportamento criativo | Difícil de controlar |
| **Utility AI** | Alta | Scoring-based decisions | Suave, sem transitions | Difícil de tunar pesos |
| **ML/Neural** | Muito Alta | Aprendizado, adaptação | Comportamento adaptativo | Caixa preta, treinamento |

**Decision Tree para IA:**
```
Precisa de IA? →
  ├─ Inimigo patrulha + ataca → FSM
  ├─ IA modular, múltiplos comportamentos → Behavior Tree
  ├─ IA que "planeja" (busca recursos, crafta) → GOAP
  ├─ IA que escolhe "melhor opção" fluidamente → Utility AI
  └─ IA que aprende com o jogador → ML (raramente necessário)
```

---

### 6. Collision Strategy

| Tipo | Melhor Para | Performance | Precisão |
|------|-----------|-------------|----------|
| **AABB** | Retângulos, fast checks | O(1) | Baixa (bounding box) |
| **Circle/Sphere** | Objetos redondos | O(1) | Média |
| **SAT** | Polígonos convexos | O(n) | Alta |
| **GJK** | Formas complexas 3D | O(n) | Muito alta |
| **Spatial Hash** | Muitos objetos de tamanho similar | O(1) amortizado | Depende da forma |
| **Quadtree/Octree** | Mundos grandes, tamanhos variados | O(log n) | Depende da forma |
| **Sweep & Prune** | Objetos em movimento contínuo | O(n log n) | Alta |

**Broadphase + Narrowphase:**
1. Broadphase: Spatial hash/quadtree para filtrar candidatos (rápido, impreciso)
2. Narrowphase: AABB/SAT/GJK nos candidatos (lento, preciso)

---

### 7. Game Architecture Patterns

| Arquitetura | Quando Usar | Exemplo |
|------------|-------------|---------|
| **Scene/Level based** | Jogos lineares, fases distintas | Platformer, puzzle |
| **Scene tree** | Hierarquia de objetos (Godot style) | Qualquer gênero |
| **ECS puro** | Dados massivos, performance crítica | RTS, simulação |
| **Component-based** | Composição flexível (Unity style) | Qualquer gênero |
| **Event-driven** | Sistemas desacoplados | UI, achievements, analytics |
| **State stack** | Menus, pausa, transições | Qualquer jogo com menus |

---

## Anti-Patterns (Universais)

| Não Faça | Faça Isso | Por Quê |
|----------|-----------|---------|
| Update tudo todo frame | Use events, dirty flags | Performance: só processe o que mudou |
| Criar objetos em hot loops | Object pooling | GC spikes causam stuttering |
| Não cachear referências | Cache FindNode/GetComponent no _ready | Busca repetida é desperdício |
| Otimizar sem profiling | Profile PRIMEIRO, depois otimize | Você vai otimizar o lugar errado |
| Misturar input com lógica | Abstract input layer | Impossível portar sem isso |
| God objects (tudo num script) | Single Responsibility | Manutenção vira pesadelo |
| Hardcode de valores | Config files / exported vars | Designers não mexem em código |
| Physics para movimento simples | Kinematic com move_and_slide | Mais controle, menos bugs |
| Ignorar frame-rate independence | Multiplicar por delta time | Jogo roda diferente em cada PC |
| Singletons para tudo | Dependency injection ou events | Acoplamento global = bugs globais |

---

## Sub-Skill Routing (Referência Rápida)

### Por Plataforma

| Plataforma Alvo | Sub-Skill | Foco Principal |
|-----------------|-----------|----------------|
| Web browsers (HTML5, WebGL) | `game-development/web-games` | Phaser, PixiJS, deploy web |
| Mobile (iOS, Android) | `game-development/mobile-games` | Touch input, stores, performance mobile |
| PC (Steam, Desktop) | `game-development/pc-games` | Steam SDK, input gamepad, distribuição |
| VR/AR headsets | `game-development/vr-ar` | Comfort, imersão, tracking |

### Por Dimensão

| Dimensão | Sub-Skill | Foco Principal |
|----------|-----------|----------------|
| 2D (sprites, tilemaps) | `game-development/2d-games` | Sprites, tilemap, physics 2D |
| 3D (meshes, shaders) | `game-development/3d-games` | Meshes, lighting, shaders, LOD |

### Por Especialidade

| Domínio | Sub-Skill | Foco Principal |
|---------|-----------|----------------|
| Game design, balanceamento | `game-development/game-design` | GDD, economia, level design |
| Multiplayer, networking | `game-development/multiplayer` | Netcode, rollback, lobbies |
| Arte, visual, animação | `game-development/game-art` | Pipeline de assets, shaders visuais |
| Áudio, música, SFX | `game-development/game-audio` | FMOD, Wwise, áudio adaptativo |

---

## Routing Examples

### Exemplo 1: "Quero fazer um platformer 2D para browser"

**Decision tree:**
1. Plataforma → Web → `game-development/web-games` (Phaser 3 recomendado)
2. Dimensão → 2D → `game-development/2d-games` (sprites, tilemap, physics)
3. Especialidade → `game-development/game-design` (level design de platformer)

**Ordem de execução:** web-games → 2d-games → game-design

### Exemplo 2: "Mobile puzzle game para iOS e Android"

**Decision tree:**
1. Plataforma → Mobile → `game-development/mobile-games` (touch, stores)
2. Dimensão → 2D (implícito para puzzle)
3. Especialidade → `game-development/game-design` (balanceamento de dificuldade)

**Ordem de execução:** mobile-games → game-design

### Exemplo 3: "Multiplayer VR shooter"

**Decision tree:**
1. Plataforma → VR/AR → `game-development/vr-ar` (comfort, imersão)
2. Dimensão → 3D → `game-development/3d-games` (rendering, shaders)
3. Especialidade → `game-development/multiplayer` (netcode, latência)
4. Especialidade → `game-development/game-audio` (áudio espacial 3D)

**Ordem de execução:** vr-ar → 3d-games → multiplayer → game-audio

### Exemplo 4: "RPG top-down com Godot"

**Decision tree:**
1. Plataforma → PC (default) → `game-development/pc-games`
2. Dimensão → 2D → `game-development/2d-games`
3. Engine → Godot (já definida, pular engine selector)
4. Especialidade → `game-development/game-design` (economia, progressão, quests)

**Ordem de execução:** pc-games → 2d-games → game-design

---

## Referências Internas

| Sub-Skill | Path | Linhas Aprox. |
|-----------|------|---------------|
| Web Games | `game-development/web-games/SKILL.md` | Framework selection, deploy web |
| Mobile Games | `game-development/mobile-games/SKILL.md` | Touch, stores, performance |
| PC Games | `game-development/pc-games/SKILL.md` | Steam, desktop, input |
| VR/AR | `game-development/vr-ar/SKILL.md` | XR, comfort, tracking |
| 2D Games | `game-development/2d-games/SKILL.md` | Sprites, tilemap, physics 2D |
| 3D Games | `game-development/3d-games/SKILL.md` | Meshes, shaders, lighting |
| Game Design | `game-development/game-design/SKILL.md` | GDD, balanceamento, UX |
| Multiplayer | `game-development/multiplayer/SKILL.md` | Netcode, rollback, lobbies |
| Game Art | `game-development/game-art/SKILL.md` | Assets, animação, visual |
| Game Audio | `game-development/game-audio/SKILL.md` | SFX, música, áudio adaptativo |

---

## Skill Relacionada

| Skill | Quando Usar |
|-------|-------------|
| `godot-gdscript-patterns` | Projeto Godot que precisa de padrões avançados de GDScript |
| `unreal-engine-cpp-pro` | Projeto Unreal Engine com C++ |

---

> **Lembre-se:** Grandes jogos vêm de iteração, não de perfeição. Protótipo rápido, depois polish. "Make it work → make it right → make it fast."
