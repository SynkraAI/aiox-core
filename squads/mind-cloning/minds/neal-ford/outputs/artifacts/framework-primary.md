# Framework Primary - Neal Ford

**Type:** Primary Framework Reference
**Agent:** @kaizen:neal-ford
**Framework:** Fitness Functions / Evolutionary Architecture
**Organization:** ThoughtWorks

## Origin

As Fitness Functions para arquitetura de software nasceram da observação de um problema recorrente: **sistemas degradam ao longo do tempo**. Performance cai, segurança enfraquece, acoplamento aumenta, manutenibilidade desmorona — e isso acontece de forma imperceptível até que seja tarde demais.

**Motivação original:**

Neal Ford e colaboradores (Rebecca Parsons, Patrick Kua) observaram que:
1. Equipes DIZEM que qualidades arquiteturais (performance, segurança, escalabilidade) são críticas
2. Mas não TÊM mecanismos automatizados para PROTEGER essas qualidades
3. Resultado: decisões incrementais de código degradam lentamente a arquitetura
4. Quando percebem, o custo de reverter é proibitivo

**Inspiração biológica:**

O conceito vem de **algoritmos genéticos**, onde uma "fitness function" avalia quão bem uma solução candidata atende aos critérios desejados. Em biologia evolutiva, fitness mede a capacidade de um organismo sobreviver e reproduzir. Em arquitetura de software, fitness functions medem se o sistema ainda atende às suas características arquiteturais críticas.

**Publicação seminal:**

Livro "Building Evolutionary Architectures" (2017, O'Reilly) — co-autoria com Rebecca Parsons e Patrick Kua.

## Core Components

### 1. Architectural Characteristics (As "ilities")

Qualidades que a arquitetura deve preservar. Também chamadas de "non-functional requirements" ou "quality attributes."

**Categorias:**

#### Operational Characteristics

Qualidades relacionadas a OPERAÇÃO do sistema em produção.

- **Performance:** Tempo de resposta, throughput, latência
- **Scalability:** Capacidade de crescer (horizontal/vertical)
- **Availability:** Uptime, failover, disaster recovery
- **Reliability:** MTBF (Mean Time Between Failures), MTTR (Mean Time To Recovery)

#### Structural Characteristics

Qualidades relacionadas à ESTRUTURA do código.

- **Modularity:** Coesão dentro de módulos, baixo acoplamento entre módulos
- **Extensibility:** Facilidade de adicionar novas funcionalidades
- **Maintainability:** Facilidade de modificar código existente
- **Testability:** Facilidade de escrever e executar testes

#### Cross-Cutting Characteristics

Qualidades que atravessam múltiplas camadas.

- **Security:** Autenticação, autorização, encriptação, proteção contra ataques
- **Observability:** Logs, métricas, tracing distribuído
- **Deployability:** Frequência de deploy, automação, rollback
- **Cost Efficiency:** Custo por transação, custo de infraestrutura

**Princípio crítico:**

Você NÃO PODE proteger tudo. Sistemas reais têm **3-5 características arquiteturais críticas**. Identificá-las é o primeiro passo.

### 2. Fitness Function Types

Fitness functions são **testes automatizados** que validam características arquiteturais. Existem várias dimensões de classificação:

#### Por Granularidade (Atomic vs Holistic)

**Atomic Fitness Function:**
- Testa **UMA** característica isolada
- Exemplo: "Tempo de resposta da API < 200ms no p95"
- Fácil de implementar, fácil de debugar

**Holistic Fitness Function:**
- Testa a **INTERAÇÃO** entre múltiplas características
- Exemplo: "Performance não degrada mais que 10% quando segurança é adicionada"
- Mais complexa, mas captura trade-offs reais

#### Por Modo de Execução (Triggered vs Continuous)

**Triggered Fitness Function:**
- Executa em **evento específico** (deploy, PR, schedule)
- Exemplo: "No deploy: verificar que nenhuma dependência tem CVE crítico"
- Integrada no CI/CD pipeline

**Continuous Fitness Function:**
- Monitora em **tempo real** em produção
- Exemplo: "Alertar se latência p99 > 500ms em janela de 5 minutos"
- Integrada em observability stack (Prometheus, Datadog, etc.)

#### Por Tipo de Medição

**Threshold:**
- Valor fixo que não pode ser ultrapassado
- Exemplo: "Latência < 200ms", "Zero CVEs críticos", "Cobertura de testes >= 70%"

**Trend:**
- Direção ao longo do tempo
- Exemplo: "Cobertura de testes deve crescer ou manter", "Tamanho de bundle não deve aumentar"

**Comparative:**
- Comparação entre versões
- Exemplo: "Nova versão não pode ser mais lenta que versão anterior"

### 3. Measurement & Automation

**Princípios inegociáveis:**

1. **Fitness functions DEVEM ser automatizadas**
   - Manual não escala
   - Humanos esquecem, máquinas não

2. **Use métricas reais, não estimativas**
   - "Achamos que está rápido" ≠ "p95 < 200ms"
   - "Parece seguro" ≠ "Zero CVEs críticos em dependências"

3. **Integre no pipeline de CI/CD**
   - Fitness function que não bloqueia deploy é apenas um alerta
   - Alerta é ignorado. Gate de deploy força ação.

4. **Revise e atualize fitness functions periodicamente**
   - Características arquiteturais mudam ao longo do tempo
   - O que era crítico há 2 anos pode não ser mais
   - Revise trimestralmente

**Onde executar fitness functions:**

| Stage | Examples |
|-------|----------|
| **PR time** | Lint, type check, unit tests, dependency audit, bundle size |
| **Merge time** | Integration tests, performance benchmarks, architecture tests |
| **Deploy time** | Smoke tests, canary analysis, security scan |
| **Runtime** | SLO monitoring, anomaly detection, error rate alerts |

### 4. Governance Model

**Como implementar fitness functions em uma organização:**

#### Step 1: Identify Critical Characteristics

Workshop com stakeholders: "Quais são as 3-5 qualidades que este sistema NÃO PODE perder?"

Resultado: Lista priorizada (ex: Performance, Security, Maintainability)

#### Step 2: Define Measurable Thresholds

Para cada característica crítica: "Qual é o limite aceitável?"

| Característica | Threshold |
|---------------|-----------|
| Performance | API response < 200ms p95 |
| Security | Zero CVEs críticos em dependências |
| Maintainability | Nenhum arquivo > 500 LOC |

#### Step 3: Measure Baseline

Antes de criar fitness function, meça o estado ATUAL.

Exemplo: "Hoje, p95 latency = 180ms" → Threshold de 200ms tem margem de 20ms

#### Step 4: Implement Automated Verification

Escolha ferramentas:
- Performance: k6, Artillery, Gatling
- Security: Snyk, npm audit, OWASP Dependency-Check
- Maintainability: ESLint custom rules, complexity analyzers

#### Step 5: Integrate into CI/CD

Adicione como gate obrigatório. Deploy falha se fitness function falha.

#### Step 6: Monitor Trends

Threshold previne degradação aguda. Trend identifica degradação gradual.

Se latência está subindo (mas ainda abaixo de 200ms), investigue ANTES de quebrar.

### 5. Evolutionary Architecture Principles

Fitness functions são o mecanismo de GOVERNANÇA. Evolutionary Architecture é a FILOSOFIA.

**Princípios:**

1. **Arquitetura deve ser projetada para MUDAR, não para ser permanente**
   - Requisitos mudam, tecnologia muda, organização muda
   - Arquitetura que não evolui morre

2. **Mudança incremental é sempre preferível a reescrita completa**
   - Big bang rewrites são "eventos de extinção em massa"
   - Strangler Fig Pattern: substitui gradualmente o sistema legado

3. **Fitness functions guiam a evolução — são os guardrails**
   - Permitem mudança DENTRO de limites aceitáveis
   - Bloqueiam mudança que viola características críticas

4. **Architectural quantum: a menor unidade deployável independentemente**
   - Quanto menor o quantum, mais evoluível o sistema
   - Monolito = 1 quantum. Microservices = N quanta.

5. **Acoplamento é o inimigo da evolvabilidade**
   - Alto acoplamento = mudanças propagam = mudança é cara
   - Baixo acoplamento = mudanças isoladas = mudança é barata

**Dimensions of Evolutionary Architecture:**

- **Technical:** Stack tecnológico, linguagens, frameworks
- **Data:** Schemas, migrações, partições, coupling de dados
- **Organizational:** Estrutura de times (Lei de Conway), Team Topologies

## Application in Kaizen Squad

### Quando usar Fitness Functions framework:

1. **Definindo governança arquitetural:**
   - Squad está criando novo sistema
   - Neal Ford pergunta: "Quais são as 3-5 características arquiteturais críticas?"
   - Cria fitness functions para cada uma

2. **Detectando degradação:**
   - Sistema em produção começa a apresentar problemas
   - Neal Ford: "Vocês têm fitness functions monitorando performance? Segurança?"
   - Se não, cria retrospectivamente

3. **Avaliando mudanças arquiteturais:**
   - Proposta de migração (monolito → microservices, SQL → NoSQL)
   - Neal Ford: "Como vocês vão GARANTIR que performance não degrada durante migração?"
   - Resposta: fitness functions comparativas (before/after)

4. **Code reviews arquiteturais:**
   - PR grande que toca camadas arquiteturais
   - Neal Ford: "Quais fitness functions validam que isso não quebra modularidade?"

### Como o framework se integra:

**Com Martin Fowler (Technology Radar):**
- Radar identifica QUAIS tecnologias adotar
- Fitness Functions garantem que adoção não degrada qualidades arquiteturais

**Com outros especialistas:**
- Fitness Functions fornecem LINGUAGEM COMUM para discutir qualidade
- "Performance está degradando" → "Fitness function de latência está falhando em 15% dos builds"

## Integration Points

### Input para Fitness Functions

**Fontes de características críticas:**
1. **Business stakeholders:** "O que o negócio NÃO PODE TOLERAR?" (ex: downtime, lentidão)
2. **Tech stakeholders:** "O que nos impede de evoluir?" (ex: acoplamento, falta de testes)
3. **Postmortems:** Incidentes passados revelam características não-protegidas

**O que NÃO conta como característica crítica:**
- "Seria legal se..." (nice-to-have, não crítico)
- Características que não podem ser medidas objetivamente

### Output de Fitness Functions

**Para quem é útil:**
1. **Desenvolvedores:** Feedback imediato no CI/CD — "você quebrou performance"
2. **Arquitetos:** Visibilidade de tendências — "acoplamento está aumentando"
3. **Product Managers:** Trade-offs quantificados — "adicionar feature X vai aumentar latência em Y ms"
4. **Liderança:** Garantia de que qualidade não está sendo sacrificada por velocidade

**Formato de saída:**
- **CI/CD pipeline:** Pass/Fail + detalhes (ex: "Latency p95 = 230ms, threshold = 200ms, FAIL")
- **Dashboards:** Tendências ao longo do tempo (Grafana, Datadog)
- **Alertas:** PagerDuty, Slack quando fitness function falha em produção

### Integração com outros frameworks

**Com Technology Radar (Martin Fowler):**
- Fitness Functions validam que adoção de nova tecnologia não degrada qualidades
- Exemplo: Adotamos Supabase (Radar: Trial) → Fitness function garante latência < 200ms ainda

**Com Refactoring (Fowler):**
- Refactoring é seguro quando há fitness functions
- Exemplo: "Refatorei módulo X, fitness function de acoplamento ainda passa"

**Com ADRs (Architecture Decision Records):**
- Cada ADR deve especificar: "Como vamos proteger essa decisão?"
- Resposta: "Fitness function que valida X"

---

**Source:** NF Mind DNA - Fitness Functions Framework (complete)
**Last Updated:** 2026-02-15
