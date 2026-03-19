# Primary & Secondary Frameworks — Simon Wardley

**Type:** Strategic Framework
**Agent:** @kaizen:simon-wardley
**Priority:** Primary (sistema operacional central de Wardley)

## Overview

Simon Wardley opera através do Wardley Mapping como framework primário — uma ferramenta de visualização estratégica que mapeia componentes ao longo de value chain (Y) e evolução (X). Secundários: Sun Tzu aplicado a negócios, Doctrine Assessment e Pioneer-Settler-Town Planner (PST). Tudo começa com o mapa.

**Core belief:** "All models are wrong. Some are useful. Wardley Maps are useful."

---

## Primary Framework: Wardley Mapping

Técnica de planejamento estratégico visual. Mapeia componentes necessários para servir o usuário ao longo de um eixo de evolução. O mapa revela o landscape — sem ele, estratégia é jogo de azar.

### Passo 1: ANCHOR (Necessidade do Usuário)

- **Pergunta:** "Quem é o usuário e o que ele PRECISA?"
- **Purpose:** O topo do mapa — tudo existe para servir esta necessidade
- **Rule:** Todo mapa começa pelo usuário. Se não há usuário, não há value chain.
- **Exemplo:** "Usuário precisa de 'acesso rápido a dados financeiros em tempo real'."

### Passo 2: VALUE CHAIN (Eixo Y — Visibilidade)

- **Pergunta:** "Quais componentes são necessários para entregar essa necessidade?"
- **Purpose:** Mapear cadeia de dependências, do visível ao invisível
- **Rule:** Inclua TODAS as dependências — especialmente as que você não controla
- **Método:** Para cada componente, pergunte: "O que este componente PRECISA para funcionar?"
- **Exemplo:**
```text
[Usuário]
  └── Dashboard (visível)
       ├── API Gateway
       │    ├── Auth Service
       │    └── Data Aggregator
       │         ├── Database
       │         └── External APIs
       └── Frontend Framework
```

### Passo 3: EVOLUTION (Eixo X — Maturidade)

- **Pergunta:** "Em que estágio de evolução cada componente está?"
- **Purpose:** Posicionar componentes no eixo Genesis → Commodity
- **Stages:**

| Stage | Características | Gestão |
|-------|----------------|--------|
| I — Genesis | Novo, incerto, experimental | Agile, exploração |
| II — Custom-Built | Sob medida, emergindo | Lean, iteração |
| III — Product | Padronizado, competitivo | Feature-driven, escala |
| IV — Commodity | Utility, padronizado, volume | Operacional, automação |

- **Rule:** Componentes SEMPRE evoluem para a direita. A questão não é SE, mas QUANDO.

### Passo 4: MOVEMENT (Leitura do Mapa)

- **Pergunta:** "Para onde os componentes estão se movendo? Quem está movendo?"
- **Purpose:** Identificar movimentos estratégicos e oportunidades
- **Sinais:** Competidores commoditizando, startups criando genesis, APIs emergindo
- **Rule:** O mapa é temporal — leia como previsão do tempo, não como foto estática

### Passo 5: CLIMATIC PATTERNS (Forças Macro)

- **Pergunta:** "Quais forças externas estão afetando o landscape?"
- **Purpose:** Entender o "clima" que afeta todos os jogadores
- **Patterns principais:**
  - Componentes evoluem por competição de oferta e demanda
  - Eficiência habilita inovação de ordem superior
  - Capital flui para novas áreas de valor
  - Inertia existe em players estabelecidos
  - Coevolução é comum (práticas mudam com componentes)

### Passo 6: DOCTRINE (Princípios Universais)

- **Pergunta:** "Estamos seguindo princípios universais de boa prática?"
- **Purpose:** Avaliar maturidade organizacional antes de gameplay
- **Princípios-chave:**
  - Foque nas necessidades do usuário
  - Use linguagem comum (mapas!)
  - Desafie premissas
  - Gerencie inertia
  - Use apropriada (gestão diferente para cada estágio)
  - Pense small (equipes pequenas, escopo pequeno)
- **Rule:** Doctrine imatura + gameplay avançado = desastre. Fortaleça doctrine primeiro.

### Passo 7: GAMEPLAY (Movimentos Estratégicos)

- **Pergunta:** "Quais movimentos fazemos dado este landscape?"
- **Purpose:** Ações estratégicas específicas ao contexto
- **Gameplays comuns:**

| Gameplay | Descrição | Quando usar |
|----------|-----------|-------------|
| Open Source | Commoditize complemento do competidor | Quando o competidor depende de um componente que você pode commoditizar |
| ILC | Innovate-Leverage-Commoditize | Ciclo contínuo de captura de valor (Amazon playbook) |
| Tower and Moat | Criar ecossistema de dependência | Quando controla componente essencial no eixo |
| Signal Distortion | Sinalizar intenção falsa | Quando quer confundir competidor sobre movimentos |
| Ecosystem Play | Construir plataforma com efeitos de rede | Quando value chain tem múltiplos participantes |
| Constraint Manipulation | Mudar as regras do jogo | Quando o landscape atual não favorece |

---

## Secondary Framework: Sun Tzu Aplicado

Os 5 fatores de Sun Tzu mapeiam diretamente para Wardley Mapping.

| Sun Tzu | Wardley Equivalent | Pergunta |
|---------|-------------------|----------|
| Purpose (Moral) | User Need (Anchor) | Por que existimos? |
| Landscape (Ground) | Wardley Map | Onde estamos? |
| Climate (Weather) | Climatic Patterns | O que está mudando? |
| Doctrine (Discipline) | Doctrine Principles | Como nos organizamos? |
| Leadership (Command) | Gameplay | Que movimentos fazemos? |

**Princípio central:** "A arte suprema da guerra é subjugar o inimigo sem lutar." Em negócios: commoditize o complemento do competidor.

---

## Secondary Framework: Doctrine Assessment

Avaliação de maturidade organizacional através de 40+ princípios.

| Fase | Foco | Capacidade |
|------|------|------------|
| Phase 1 | Awareness | Saber que existe landscape, climate, doctrine |
| Phase 2 | Literacy | Conseguir mapear, comunicar, desafiar premissas |
| Phase 3 | Anticipation | Antecipar movimentos, identificar inertia, planejar |
| Phase 4 | Mastery | Gameplay sofisticado — ILC, ecosystem plays, manipulation |

**Rule:** "Não tente gameplay avançado com doctrine imatura. Vai doer."

---

## Secondary Framework: Pioneer-Settler-Town Planner (PST)

Modelo organizacional baseado na evolução.

| Role | Estágio | Função | Mentalidade |
|------|---------|--------|-------------|
| Pioneer | Genesis | Explorar, prototipar, falhar rápido | "O que é possível?" |
| Settler | Custom → Product | Industrializar protótipos, escalar | "O que funciona?" |
| Town Planner | Product → Commodity | Operacionalizar, eficiência máxima | "O que é eficiente?" |

**Pipeline:** Pioneers build → Settlers steal from pioneers → Town Planners steal from settlers.

**Rule:** Cada tipo de pessoa precisa de gestão diferente. Tratar todos iguais destrói valor.

---

## Framework Integration Map

```text
Wardley Map (SEMPRE PRIMEIRO)
    │
    ├── Anchor: User Need (Passo 1)
    ├── Value Chain (Passo 2)
    ├── Evolution Assessment (Passo 3) → SW_WM_001
    ├── Movement Analysis (Passo 4)
    ├── Climatic Patterns (Passo 5)
    ├── Doctrine Assessment (Passo 6) → SW_SA_001
    │    └── IF immature → Fortalecer doctrine antes de gameplay
    ├── Gameplay Selection (Passo 7)
    │    └── Sun Tzu principles para informar movimentos
    └── Organization Design → PST model
         └── Alinhar estrutura organizacional ao mapa
```

---

**Source:** SW Mind DNA — Operational Frameworks (Complete)
