# Framework Primário: Team Topologies

**Type:** Primary Operating Framework
**Agent:** @kaizen:skelton-pais
**Status:** Adotado por centenas de organizações globalmente (ThoughtWorks, Spotify, governo do UK)

## Overview

Team Topologies é um framework para design organizacional que otimiza fluxo rápido de mudança em entrega de software. Define 4 tipos fundamentais de times e 3 modos de interação, com carga cognitiva como constraint central. A premissa: organizações são sistemas, times são os componentes, e a "arquitetura organizacional" determina a arquitetura do software (Lei de Conway).

## Framework 1: Os 4 Tipos Fundamentais de Time

### Stream-aligned Team

```text
DEFINIÇÃO: Time alinhado a um único fluxo de valor
MISSÃO: Entregar valor contínuo ao usuário final com autonomia

CARACTERÍSTICAS:
  - Ownership end-to-end de um fluxo (produto, serviço, jornada, persona)
  - Capacidade de entregar sem depender de outros times
  - Responsável por build E run (não joga código por cima do muro)
  - Monitora métricas de negócio do próprio fluxo

PROPORÇÃO IDEAL: 60-80% de todos os times

COMO IDENTIFICAR:
  1. Quem consome o output? → Usuário final
  2. Pode entregar sozinho? → Sim, na maioria dos casos
  3. Tem métricas de negócio próprias? → Sim

ANTI-PATTERNS:
  - Stream-aligned que depende de 3+ times para qualquer feature
  - Escopo tão amplo que ninguém lembra tudo que o time faz
  - Confundido com "feature team" genérico sem ownership real
```

### Enabling Team

```text
DEFINIÇÃO: Time que ajuda stream-aligned teams a superar obstáculos
MISSÃO: Detectar gaps de capacidade e coaching de times

CARACTERÍSTICAS:
  - NÃO entrega features ao usuário final
  - Foco em coaching, mentoria, pair programming
  - Interação TEMPORÁRIA com cada time (semanas a meses)
  - Objetivo: tornar-se desnecessário para o time ajudado

PROPORÇÃO IDEAL: 5-15% de todos os times

COMO IDENTIFICAR:
  1. Quem consome o output? → Outros times (não usuário final)
  2. O trabalho é permanente? → Não — é temporário por time
  3. O time cresce a capacidade de outros? → Sim

ANTI-PATTERNS:
  - Enabling que vira dependência permanente (gargalo disfarçado)
  - Enabling que entrega features (é stream-aligned disfarçado)
  - Confundido com "shared services" ou "centro de excelência"
```

### Complicated Subsystem Team

```text
DEFINIÇÃO: Time que encapsula conhecimento especializado que seria carga excessiva
MISSÃO: Abstrair complexidade técnica profunda via interfaces claras

CARACTERÍSTICAS:
  - Especialistas profundos em domínio técnico específico
  - Provê API/interface clara para stream-aligned consumir
  - Domínio requer anos de experiência (ML, codec, cálculo financeiro)
  - RARAMENTE necessário — só quando especialidade justifica

PROPORÇÃO IDEAL: 0-10% de todos os times (deve ser exceção)

COMO IDENTIFICAR:
  1. A especialização requer anos de estudo? → Sim
  2. Stream-aligned ficaria sobrecarregado com essa complexidade? → Sim
  3. Existe interface clara de consumo? → Deve existir

ANTI-PATTERNS:
  - Mais de 30% dos times são Complicated Subsystem (fragmentação)
  - Sem interface clara — consumo é ad hoc e acoplado
  - Usado como desculpa para não ensinar stream-aligned teams
```

### Platform Team

```text
DEFINIÇÃO: Time que provê serviços internos como self-service
MISSÃO: Reduzir carga cognitiva dos stream-aligned via abstrações

CARACTERÍSTICAS:
  - Tratada como PRODUTO INTERNO com clientes internos
  - Self-service: consumo sem necessidade de ticket ou conversa
  - Reduz carga extraneous dos times consumidores
  - Documentação, APIs, e developer experience são prioridade

PROPORÇÃO IDEAL: 10-20% de todos os times

COMO IDENTIFICAR:
  1. Quem consome? → Outros times (via self-service)
  2. Consomem sem precisar conversar? → Sim (esse é o teste)
  3. Reduz carga cognitiva dos consumidores? → Sim

O TESTE DEFINITIVO:
  "O time stream-aligned consegue usar a plataforma sem abrir ticket?"
  - Se sim → Platform saudável
  - Se não → Platform imatura (precisa melhorar DX)

ANTI-PATTERNS:
  - "Platform" que é só infra sem mentalidade de produto
  - Consumidores precisam de reunião para usar qualquer serviço
  - Sem métricas de satisfação dos times internos
```

## Framework 2: Os 3 Modos de Interação

### Collaboration Mode

```text
DEFINIÇÃO: Dois times trabalhando juntos temporariamente
QUANDO: Exploração, descoberta, inovação, novo domínio
DURAÇÃO: Temporário — semanas a poucos meses (máximo ~3 meses)

BENEFÍCIOS:
  - Inovação rápida via combinação de perspectivas
  - Transferência de conhecimento bidirecional
  - Ideal para situações de alta incerteza

CUSTOS:
  - Alto overhead de comunicação
  - Limites de ownership ficam nebulosos
  - Não escala — funciona entre 2 times, não entre 5

SINAL DE ALERTA:
  Se collaboration dura mais de 3 meses → provavelmente deveria ser
  X-as-a-Service com interface clara definida
```

### X-as-a-Service Mode

```text
DEFINIÇÃO: Um time consome o que outro provê via API/contrato
QUANDO: Interface clara, domínio bem definido, interação estável
DURAÇÃO: Permanente (enquanto a relação fizer sentido)

BENEFÍCIOS:
  - Desacoplamento máximo entre times
  - Autonomia preservada dos dois lados
  - Previsibilidade de consumo

CUSTOS:
  - Requer interface bem definida (investimento upfront)
  - Menos flexibilidade que Collaboration
  - Provider precisa tratar consumidores como clientes

TESTE:
  "Os times conseguem trabalhar sem conversar diariamente?"
  Se sim → X-as-a-Service funcionando
```

### Facilitating Mode

```text
DEFINIÇÃO: Um time ajuda outro a aprender e melhorar
QUANDO: Gap de capacidade detectado, adoção de nova prática
DURAÇÃO: Temporário — até o time absorver a capacidade
QUEM: Tipicamente Enabling teams facilitando Stream-aligned

BENEFÍCIOS:
  - Crescimento orgânico de capacidades
  - Não cria dependência permanente
  - Multiplica conhecimento pela organização

CUSTOS:
  - Requer habilidades de coaching (não só técnicas)
  - Resultado demora mais que "resolver para eles"

SINAL DE SUCESSO:
  O time facilitado não precisa mais do Enabling team
```

## Framework 3: Cognitive Load como Constraint

### O Modelo

```text
Carga Cognitiva Total = Intrinsic + Extraneous + Germane

INTRINSIC (inerente ao domínio):
  - Não pode ser eliminada, pode ser dividida
  - Ex: regras de negócio de pagamentos

EXTRANEOUS (desnecessária):
  - DEVE ser eliminada agressivamente
  - Ex: deploy manual, tooling ruim, processos burocráticos

GERMANE (gera aprendizado):
  - DEVE ser maximizada
  - Ex: aprender tecnologia relevante, experimentar abordagens

REGRA: Minimize extraneous → libera espaço para germane → time cresce
```

### Limites Práticos

| Dimensão | Limite Saudável | Alerta | Crítico |
|----------|----------------|--------|---------|
| Domínios por time | 1-3 | 4 | 5+ |
| Serviços por time | 3-9 | 10-12 | 15+ |
| Pessoas por time | 5-9 | 10-12 | 15+ |
| Ops ratio | <30% | 30-50% | >50% |

## Framework 4: Reverse Conway Maneuver

### Princípio

```text
Lei de Conway (original):
  "Organizações produzem designs que copiam suas estruturas de comunicação."

Reverse Conway Maneuver:
  "Projete a estrutura organizacional para OBTER a arquitetura desejada."

APLICAÇÃO:
  1. Defina a arquitetura de software desejada
  2. Projete os times para espelhar essa arquitetura
  3. Defina modos de interação que suportem as interfaces desejadas
  4. A arquitetura emergirá naturalmente da estrutura dos times
```

## Integration: Como os Frameworks se Conectam

```text
Cognitive Load (constraint) → Team Types (building blocks) →
Interaction Modes (interfaces) → Conway's Law (validação) →
Fast Flow of Change (resultado)
```

Nenhum framework funciona isolado. Carga cognitiva é o constraint que limita o design. Os 4 tipos são os building blocks. Os 3 modos são as interfaces. A Lei de Conway valida (ou invalida) o design. E o resultado é fluxo rápido de mudança — o objetivo final.

## Evolução de Topologias

Topologias não são estáticas. A organização evolui:

1. **Startup (5-15 pessoas):** 1-2 stream-aligned, talvez 1 platform informal
2. **Scale-up (15-50):** Múltiplos stream-aligned, 1 platform, talvez 1 enabling
3. **Growth (50-150):** Topologia completa com todos os 4 tipos
4. **Enterprise (150+):** Múltiplas topologias aninhadas por divisão

A chave: reavalie a topologia a cada mudança significativa de contexto.

---

**Source:** SP Mind DNA - Team Topologies Operational Framework
