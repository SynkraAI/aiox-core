# TODO - Clone Mental: Jesus Cristo

**Status:** Em Planejamento (Viability Phase Completa)
**Última Atualização:** 2025-10-06
**Prioridade Final:** P1 - ALTA PRIORIDADE
**Timeline Total:** 7 semanas (40-60 horas)

---

## 📊 RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **APEX Score** | 9.4/10 (PREMIUM) |
| **ICP Match** | 7.2/10 (MATCH BOM) |
| **Combined Score** | 8.08/10 (P1) |
| **Arquétipo** | ÍCONE HISTÓRICO |
| **Complexidade** | PREMIUM |
| **Esforço Estimado** | 50 horas |
| **Checkpoints** | 3 gates de validação |

---

## 🎯 OBJETIVOS DO PROJETO

### Objetivos Principais
- [ ] **OBJ-01**: Criar clone mental autêntico de Jesus Cristo com 85%+ autenticidade
- [ ] **OBJ-02**: Implementar framework de liderança servidora aplicável a negócios modernos
- [ ] **OBJ-03**: Oferecer reframe identitário para Executivo Exausto e Veterano Desprezado

### Métricas de Sucesso
- [ ] Autenticidade: 85%+ em testes cegos (resposta clone vs citação canônica)
- [ ] Precisão: 90%+ em consultas sobre ética/liderança/propósito
- [ ] Consistência: 95%+ entre sessões
- [ ] Cobertura ICP: 4 de 5 arquétipos com score 7+
- [ ] Performance: <3s tempo de resposta

---

## 📅 CRONOGRAMA GERAL

### Fase 1: Research & Analysis (Semanas 1-3) - 20h
**Período:** Semana 1-3
**Checkpoint:** GATE 1 - Pós-Research

### Fase 2: Synthesis & Implementation (Semanas 4-6) - 25h
**Período:** Semana 4-6
**Checkpoint:** GATE 2 - Pós-Synthesis

### Fase 3: Testing & Refinement (Semana 7) - 5h
**Período:** Semana 7
**Checkpoint:** GATE 3 - Launch Readiness

---

## 🔍 FASE 1: RESEARCH & ANALYSIS (Semanas 1-3)

### ✅ VIABILITY (Completa)
- [x] **TASK-V01**: Executar SCORECARD APEX
  - Output: `logs/20251006-0033-viability.yaml` ✅
  - Score: 9.4/10 (PREMIUM)
  - Executor: @analyst

- [x] **TASK-V02**: Executar ICP MATCH SCORE
  - Output: `logs/20251006-0038-icp_match.yaml` ✅
  - Score: 7.2/10 (MATCH BOM)
  - Executor: @analyst

- [x] **TASK-V03**: Gerar PRD
  - Output: `docs/PRD.md` ✅
  - Executor: @pm

- [x] **TASK-V04**: Mapear Dependencies
  - Output: `metadata/dependencies.yaml` ✅
  - Executor: @architect

- [x] **TASK-V05**: Inicializar TODO
  - Output: `docs/TODO.md` ✅
  - Executor: @pm

### 📚 RESEARCH (Semana 1-2) - 12h

#### Tier 1: Fontes Primárias Críticas (8h)

- [ ] **TASK-R01**: Source Discovery - Catalogar todas as fontes
  - Executor: @analyst
  - Esforço: 2h
  - Output: `sources/sources_master.yaml`
  - Prioridade: CRÍTICA
  - Dependências: Nenhuma
  - Detalhamento:
    - [ ] Catalogar 4 Evangelhos canônicos (Mateus, Marcos, Lucas, João)
    - [ ] Catalogar 23 epístolas do Novo Testamento
    - [ ] Catalogar Atos dos Apóstolos
    - [ ] Identificar traduções preferidas (domínio público)
    - [ ] Documentar disponibilidade e formato

- [ ] **TASK-R02**: Source Collector - Evangelhos Canônicos (Tier 1)
  - Executor: @analyst
  - Esforço: 3h
  - Output: `sources/tier1_evangelhos/`
  - Prioridade: CRÍTICA
  - Dependências: TASK-R01
  - **PARALELIZÁVEL** (4 Evangelhos podem ser coletados em paralelo)
  - Detalhamento:
    - [ ] Coletar Evangelho de Mateus (Sermão da Montanha caps 5-7)
    - [ ] Coletar Evangelho de Marcos (narrativa mais antiga)
    - [ ] Coletar Evangelho de Lucas (parábolas únicas: Bom Samaritano, Filho Pródigo)
    - [ ] Coletar Evangelho de João (Logos, discursos longos)
    - [ ] Criar índice de parábolas por Evangelho

- [ ] **TASK-R03**: Source Collector - Epístolas (Tier 2)
  - Executor: @analyst
  - Esforço: 2h
  - Output: `sources/tier2_epistolas/`
  - Prioridade: ALTA
  - Dependências: TASK-R01
  - **PARALELIZÁVEL**
  - Detalhamento:
    - [ ] Coletar epístolas paulinas (Romanos, 1-2 Coríntios, Gálatas, etc)
    - [ ] Coletar epístolas gerais (Tiago, 1-2 Pedro, 1-3 João, Judas)
    - [ ] Coletar Atos dos Apóstolos
    - [ ] Indexar por tema (ética, liderança, comunidade)

- [ ] **TASK-R04**: Source Collector - Contexto Histórico (Tier 3)
  - Executor: @analyst
  - Esforço: 1h
  - Output: `sources/tier3_contexto/`
  - Prioridade: MÉDIA
  - Dependências: TASK-R01
  - **PARALELIZÁVEL**
  - Detalhamento:
    - [ ] Coletar seleções da Torá (Gênesis, Êxodo, Deuteronômio)
    - [ ] Coletar Profetas citados (Isaías, Jeremias, Salmos)
    - [ ] Coletar trechos de Josefo (Antiguidades Judaicas)
    - [ ] Documentar contexto do Judaísmo Segundo Templo

#### Indexação e Priorização (4h)

- [ ] **TASK-R05**: Temporal Mapper - Timeline 3 anos de ministério
  - Executor: @analyst
  - Esforço: 2h
  - Output: `metadata/temporal_context.yaml`
  - Prioridade: ALTA
  - Dependências: TASK-R02
  - **PARALELIZÁVEL** com TASK-R06
  - Detalhamento:
    - [ ] Mapear fase inicial (Batismo - João Batista, 27 d.C.)
    - [ ] Mapear ministério na Galileia (27-29 d.C.)
    - [ ] Mapear jornada final para Jerusalém (29-30 d.C.)
    - [ ] Mapear última semana (Paixão, Morte, Ressurreição)
    - [ ] Identificar evolução dos ensinamentos ao longo do tempo

- [ ] **TASK-R06**: Priority Calculator - Matriz de prioridade de fontes
  - Executor: @analyst
  - Esforço: 1h
  - Output: `sources/priority_matrix.yaml`
  - Prioridade: ALTA
  - Dependências: TASK-R02, TASK-R03
  - **PARALELIZÁVEL** com TASK-R05
  - Detalhamento:
    - [ ] Priorizar parábolas únicas (alta densidade de ensinamento)
    - [ ] Priorizar Sermão da Montanha (framework ético completo)
    - [ ] Priorizar atestação múltipla (2+ Evangelhos = mais confiável)
    - [ ] Identificar material Q (Quelle - fonte comum a Mateus e Lucas)

- [ ] **TASK-R07**: Sources Master - Inventário completo atualizado
  - Executor: @analyst
  - Esforço: 1h
  - Output: `sources/sources_master.yaml` (v2.0)
  - Prioridade: CRÍTICA
  - Dependências: TASK-R02, TASK-R03, TASK-R04, TASK-R05, TASK-R06
  - Detalhamento:
    - [ ] Consolidar todos os sources coletados
    - [ ] Documentar prioridades (Tier 1-4)
    - [ ] Calcular volume total (horas equivalentes)
    - [ ] Atualizar gaps e mitigações
    - [ ] Criar roadmap de leitura otimizado

### 🔬 ANALYSIS (Semana 2-3) - 8h

#### Extração e Mapeamento (6h)

- [ ] **TASK-A01**: Source Reading - Leitura profunda de fontes Tier 1
  - Executor: @analyst
  - Esforço: 2h
  - Output: `docs/logs/{timestamp}-key_insights.md`
  - Prioridade: CRÍTICA
  - Dependências: TASK-R07
  - **PARALELIZÁVEL** (pode dividir por Evangelho)
  - Detalhamento:
    - [ ] Ler Mateus 5-7 (Sermão da Montanha) + extrair insights
    - [ ] Ler Lucas 15 (parábolas do perdão) + extrair insights
    - [ ] Ler João 13-17 (discursos de despedida) + extrair insights
    - [ ] Identificar padrões recorrentes
    - [ ] Documentar contexto de cada ensinamento

- [ ] **TASK-A02**: Quote Extraction - Database de citações canônicas
  - Executor: @analyst
  - Esforço: 2h
  - Output: `artifacts/quotes_database.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-R07
  - **PARALELIZÁVEL** com TASK-A01 e TASK-A03
  - Detalhamento:
    - [ ] Extrair 100+ citações diretas (ipsissima verba quando possível)
    - [ ] Indexar por tema (amor, perdão, liderança, Reino de Deus, etc)
    - [ ] Incluir referências bíblicas (livro:capítulo:versículo)
    - [ ] Marcar citações com atestação múltipla
    - [ ] Criar índice de parábolas completo (40+ parábolas)

- [ ] **TASK-A03**: Timeline Mapping - Linha do tempo completa
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/life_timeline.yaml`
  - Prioridade: ALTA
  - Dependências: TASK-R05
  - **PARALELIZÁVEL** com TASK-A01 e TASK-A02
  - Detalhamento:
    - [ ] Fase 1: Infância e juventude (0-30 d.C. - gap identificado)
    - [ ] Fase 2: Ministério inicial (Batismo, primeiros discípulos, 27-28 d.C.)
    - [ ] Fase 3: Ministério na Galileia (ensinamentos, milagres, 28-29 d.C.)
    - [ ] Fase 4: Jornada final para Jerusalém (29-30 d.C.)
    - [ ] Fase 5: Última semana (Paixão, Morte, Ressurreição, 30 d.C.)

- [ ] **TASK-A04**: Linguistic Forensics - Perfil de comunicação
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/writing_style.md`
  - Prioridade: ALTA
  - Dependências: TASK-A01, TASK-A02
  - Detalhamento:
    - [ ] Padrão 1: Parábolas (mashal - ensino narrativo)
    - [ ] Padrão 2: Perguntas socráticas ("Quem dizeis que eu sou?")
    - [ ] Padrão 3: Sínteses em mandamentos ("Amarás...")
    - [ ] Padrão 4: Inversões radicais ("Os últimos serão os primeiros")
    - [ ] Padrão 5: Hipérboles didáticas ("Mais fácil camelo passar pelo fundo de agulha")
    - [ ] Documentar estrutura de parábolas (situação → tensão → resolução → aplicação)

#### Análise Cognitiva Profunda (2h)

- [ ] **TASK-A05**: Behavioral Patterns - Padrões comportamentais
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/behavioral_patterns.md`
  - Prioridade: ALTA
  - Dependências: TASK-A01, TASK-A02, TASK-A03
  - **PARALELIZÁVEL** com TASK-A06
  - Detalhamento:
    - [ ] Liderança servidora ("Vim para servir, não para ser servido")
    - [ ] Compaixão radical (curar no sábado, tocar leprosos)
    - [ ] Confrontação estratégica (purificação do Templo)
    - [ ] Humildade deliberada (lavar pés dos discípulos)
    - [ ] Inclusão de marginalizados (mulheres, pecadores, samaritanos)

- [ ] **TASK-A06**: Recognition Patterns - Radares mentais
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/recognition_patterns.yaml`
  - Prioridade: ALTA
  - Dependências: TASK-A01, TASK-A02, TASK-A03
  - **PARALELIZÁVEL** com TASK-A05
  - Detalhamento:
    - [ ] Reconhece hipocrisia ("Sepulcros caiados")
    - [ ] Reconhece fé genuína (centurião, mulher cananeia)
    - [ ] Reconhece vazio legalista (fariseus)
    - [ ] Reconhece coração transformável (Zaqueu, mulher adúltera)
    - [ ] Reconhece necessidades profundas (Nicodemos buscando renascimento)

---

## 🎯 CHECKPOINT 1: PÓS-RESEARCH (Final Semana 3)

### Critérios de Aprovação
- [ ] **CR1-01**: 100% de fontes Tier 1 coletadas (4 Evangelhos)
- [ ] **CR1-02**: 80%+ de parábolas indexadas (32+ de 40)
- [ ] **CR1-03**: Quotes database com 100+ citações
- [ ] **CR1-04**: Timeline completa (5 fases documentadas)
- [ ] **CR1-05**: Sources Master atualizado com priorização

### Entregáveis Obrigatórios
- [ ] `sources/sources_master.yaml` (v2.0 completo)
- [ ] `artifacts/quotes_database.yaml` (100+ citações)
- [ ] `artifacts/life_timeline.yaml` (5 fases)
- [ ] `artifacts/writing_style.md` (5 padrões documentados)

### Gate Decision
- [ ] **GO**: Todos os critérios atendidos → Avançar para Synthesis
- [ ] **NO-GO**: <80% critérios → Ajustar escopo ou timeline

---

## 🧬 FASE 2: SYNTHESIS & IMPLEMENTATION (Semanas 4-6)

### 🔄 SYNTHESIS (Semana 4-5) - 10h

#### Extração de Elementos Core (6h)

- [ ] **TASK-S01**: Mental Models - Modelo mental
  - Executor: @analyst
  - Esforço: 2h
  - Output: `artifacts/mental_models.md`
  - Prioridade: CRÍTICA
  - Dependências: TASK-A05, TASK-A06
  - Detalhamento:
    - [ ] Modelo 1: Reino de Deus (já presente mas não totalmente realizado)
    - [ ] Modelo 2: Liderança invertida (servir = liderar)
    - [ ] Modelo 3: Amor como meta-regra (resume toda Lei)
    - [ ] Modelo 4: Transformação interior → exterior (figueira infrutífera)
    - [ ] Modelo 5: Eternidade vs temporalidade (tesouro no céu)

- [ ] **TASK-S02**: Values Hierarchy - Hierarquia de valores
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/values_hierarchy.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-A05
  - **PARALELIZÁVEL** com TASK-S03
  - Detalhamento:
    - [ ] Nível 1: Amor a Deus (primeiro mandamento)
    - [ ] Nível 2: Amor ao próximo (segundo mandamento = primeiro)
    - [ ] Nível 3: Humildade/Serviço (beatitudes)
    - [ ] Nível 4: Perdão radical (70x7)
    - [ ] Nível 5: Justiça e compaixão (balancear verdade + misericórdia)

- [ ] **TASK-S03**: Belief System - Sistema de crenças
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/beliefs_core.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-A05
  - **PARALELIZÁVEL** com TASK-S02
  - Detalhamento:
    - [ ] Crença central: Deus como Pai amoroso
    - [ ] Natureza humana: Criada boa, mas caída, mas redimível
    - [ ] Propósito da vida: Amar Deus e próximo
    - [ ] Transformação: Possível a qualquer momento (ladrão na cruz)
    - [ ] Legado: Eterno vs temporal

- [ ] **TASK-S04**: Core Obsessions - Obsessões principais
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/core_obsessions.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-S02, TASK-S03
  - Detalhamento:
    - [ ] Obsessão 1: Reino de Deus ("Buscai primeiro o Reino")
    - [ ] Obsessão 2: Salvação de todos ("Não vim chamar justos, mas pecadores")
    - [ ] Obsessão 3: Glória do Pai ("Não a minha vontade, mas a Tua")
    - [ ] Obsessão 4: Unidade e amor ("Que sejam um")

- [ ] **TASK-S05**: Extract Core (Synthesis) - Elementos core
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/core_elements.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-S04
  - Detalhamento:
    - [ ] Elemento 1: Mandamentos do Amor (identidade central)
    - [ ] Elemento 2: Liderança servidora (diferencial único)
    - [ ] Elemento 3: Parábolas (método de ensino)
    - [ ] Elemento 4: Perdão radical (transformação relacional)
    - [ ] Elemento 5: Propósito eterno (reframe de sucesso)

#### Templates e Frameworks (4h)

- [ ] **TASK-S06**: Template Extractor - Templates de comunicação
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/communication_templates.md`
  - Prioridade: ALTA
  - Dependências: TASK-A04
  - **PARALELIZÁVEL** com TASK-S07 e TASK-S08
  - Detalhamento:
    - [ ] Template 1: Parábola (situação → tensão → resolução → pergunta)
    - [ ] Template 2: Beatitude (inversão de expectativa → bênção)
    - [ ] Template 3: Mandamento reformulado (lei → princípio)
    - [ ] Template 4: Confrontação amorosa (verdade + compaixão)

- [ ] **TASK-S07**: Phrases Miner - Frases assinatura
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/signature_phrases.md`
  - Prioridade: ALTA
  - Dependências: TASK-A02
  - **PARALELIZÁVEL** com TASK-S06 e TASK-S08
  - Detalhamento:
    - [ ] "Vinde a mim, vós que estais cansados..."
    - [ ] "Os últimos serão os primeiros"
    - [ ] "De que adianta ganhar o mundo e perder a alma?"
    - [ ] "Buscai primeiro o Reino de Deus"
    - [ ] "Não julgueis para não serdes julgados"
    - [ ] "Perdoai 70 vezes 7"
    - [ ] "Amai os vossos inimigos"

- [ ] **TASK-S08**: Frameworks Identifier - Frameworks sintetizados
  - Executor: @analyst
  - Esforço: 2h
  - Output: `artifacts/frameworks_synthesized.md`
  - Prioridade: CRÍTICA
  - Dependências: TASK-S01
  - Detalhamento:
    - [ ] Framework 1: Beatitudes (8 princípios do Reino)
    - [ ] Framework 2: Mandamentos do Amor (meta-regra única)
    - [ ] Framework 3: Parábola do Semeador (4 tipos de ouvintes)
    - [ ] Framework 4: Liderança Servidora (inverter hierarquia)
    - [ ] Framework 5: Perdão em 3 níveis (vertical/horizontal/interior)

### ⚙️ IMPLEMENTATION (Semana 5-6) - 15h

#### Arquitetura e Instruções (10h)

- [ ] **TASK-I01**: Unique Algorithm - Algoritmo cognitivo
  - Executor: @analyst
  - Esforço: 2h
  - Output: `artifacts/unique_algorithm.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-S04
  - **PARALELIZÁVEL** com TASK-I02
  - Detalhamento:
    - [ ] Input → Processar via lente de amor/compaixão
    - [ ] Questionar motivação (coração vs aparência)
    - [ ] Aplicar princípio eterno (não regra legalista)
    - [ ] Responder com parábola/pergunta (não prescrição direta)
    - [ ] Orientar para Reino de Deus (propósito transcendente)

- [ ] **TASK-I02**: Contradictions Map - Mapa de paradoxos
  - Executor: @analyst
  - Esforço: 1h
  - Output: `artifacts/contradictions.yaml`
  - Prioridade: ALTA
  - Dependências: TASK-S04
  - **PARALELIZÁVEL** com TASK-I01
  - Detalhamento:
    - [ ] Paradoxo 1: "Manso" mas confrontou Templo (humildade + coragem)
    - [ ] Paradoxo 2: "Amai inimigos" mas chamou fariseus de "serpentes"
    - [ ] Paradoxo 3: "Não vim julgar" mas "julgamento virá"
    - [ ] Paradoxo 4: "Paz" mas "trouxe espada" (divisão)
    - [ ] Resolução: Contexto e timing (tempo de confrontar vs acolher)

- [ ] **TASK-I03**: Cognitive Architecture - Arquitetura cognitiva
  - Executor: @architect
  - Esforço: 3h
  - Output: `artifacts/cognitive_architecture.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-I01, TASK-I02
  - Detalhamento:
    - [ ] **Identity Core**: Mandamentos do Amor (base imutável)
    - [ ] **Parable Engine**: Gerador de analogias contextualizadas
    - [ ] **Ethical Validator**: Verificador de consistência com valores
    - [ ] **Historical Context Layer**: Judaísmo Século I (background)
    - [ ] **Dual Presentation Layer**: Secular mode vs Spiritual mode
    - [ ] Integração: Como os módulos se comunicam

- [ ] **TASK-I04**: Extract Patterns (Implementation) - Padrões finais
  - Executor: @architect
  - Esforço: 1h
  - Output: `artifacts/patterns_synthesized.md`
  - Prioridade: ALTA
  - Dependências: TASK-S08
  - **PARALELIZÁVEL** com TASK-I05
  - Detalhamento:
    - [ ] Padrão comunicação: Parábolas + perguntas socráticas
    - [ ] Padrão decisão: Princípio eterno > regra situacional
    - [ ] Padrão liderança: Servir = liderar
    - [ ] Padrão transformação: Interior → exterior

- [ ] **TASK-I05**: Identity Core - Identidade central
  - Executor: @architect
  - Esforço: 1h
  - Output: `artifacts/identity_core.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-S05
  - **PARALELIZÁVEL** com TASK-I04 e TASK-I06
  - Detalhamento:
    - [ ] Eu sou: Filho de Deus, Servo da humanidade, Mestre/Rabi
    - [ ] Eu existo para: Revelar amor do Pai, salvar perdidos, ensinar o caminho
    - [ ] Não sou: Rei político, revolucionário violento, legalista
    - [ ] Nunca farei: Julgar aparência, rejeitar arrependido, usar violência

- [ ] **TASK-I06**: Meta Axioms - Meta axiomas
  - Executor: @architect
  - Esforço: 1h
  - Output: `artifacts/meta_axioms.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-I04
  - **PARALELIZÁVEL** com TASK-I04 e TASK-I05
  - Detalhamento:
    - [ ] Axioma 1: "Amarás o Senhor teu Deus de todo coração..." (prioridade máxima)
    - [ ] Axioma 2: "...e ao próximo como a ti mesmo" (segundo = primeiro)
    - [ ] Axioma 3: "Fazei aos outros o que quereis que vos façam" (regra de ouro)
    - [ ] Axioma 4: "Buscai primeiro o Reino e tudo será acrescentado" (foco único)

- [ ] **TASK-I07**: Core Instructions - Instruções fundamentais
  - Executor: @architect
  - Esforço: 1h
  - Output: `artifacts/instructions_core.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-I04
  - Detalhamento:
    - [ ] Instrução 1: Sempre responder com amor/compaixão (mesmo confrontando)
    - [ ] Instrução 2: Preferir parábolas a prescrições diretas
    - [ ] Instrução 3: Questionar motivações (coração vs aparência)
    - [ ] Instrução 4: Orientar para propósito eterno (não só solução imediata)
    - [ ] Instrução 5: Validar transformação possível (nunca é tarde)

#### System Prompts (5h)

- [ ] **TASK-I08**: Generalista Compiler - System prompt generalista
  - Executor: @architect
  - Esforço: 3h
  - Output: `system_prompts/{timestamp}-v1.0-generalista.md`
  - Prioridade: CRÍTICA
  - Dependências: TASK-I05, TASK-I06, TASK-I07, TASK-I03
  - Detalhamento:
    - [ ] Seção 1: Identity Core (quem sou)
    - [ ] Seção 2: Meta Axioms (princípios máximos)
    - [ ] Seção 3: Core Instructions (como responder)
    - [ ] Seção 4: Parable Engine (como usar parábolas)
    - [ ] Seção 5: Ethical Validator (regras de consistência)
    - [ ] Seção 6: Context Awareness (quando modo secular vs espiritual)
    - [ ] Seção 7: Limitations (o que NÃO fazer)
    - [ ] Teste inicial: 10 perguntas de validação

- [ ] **TASK-I09**: Operational Manual - Manual operacional
  - Executor: @pm
  - Esforço: 1h
  - Output: `docs/operational_manual.md`
  - Prioridade: ALTA
  - Dependências: TASK-I08
  - **PARALELIZÁVEL** com TASK-I10
  - Detalhamento:
    - [ ] Quando usar este clone (transformação identitária, liderança)
    - [ ] Quando NÃO usar (monetização, táticas step-by-step)
    - [ ] Como ativar modo secular vs espiritual
    - [ ] Sinergias recomendadas (Jesus + Hormozi, Jesus + Allen)
    - [ ] Métricas de sucesso esperadas

- [ ] **TASK-I10**: Testing Protocol - Plano de testes
  - Executor: @qa
  - Esforço: 1h
  - Output: `docs/testing_protocol.md`
  - Prioridade: CRÍTICA
  - Dependências: TASK-I08
  - **PARALELIZÁVEL** com TASK-I09
  - Detalhamento:
    - [ ] Teste 1: Autenticidade (resposta clone vs citação canônica - 20 testes)
    - [ ] Teste 2: Consistência de valores (0 contradições em 50 consultas)
    - [ ] Teste 3: Aplicação contextual (parábola → caso moderno - 10 testes)
    - [ ] Teste 4: Combate à paralisia (4 de 5 padrões validados)
    - [ ] Teste 5: ICP fit (aprovação de Executivo Exausto ou Veterano)

---

## 🎯 CHECKPOINT 2: PÓS-SYNTHESIS (Final Semana 6)

### Critérios de Aprovação
- [ ] **CR2-01**: Cognitive Architecture completa com 5 módulos
- [ ] **CR2-02**: System Prompt Generalista v1.0 gerado
- [ ] **CR2-03**: Identity Core + Meta Axioms + Core Instructions definidos
- [ ] **CR2-04**: Parable Engine documentado (como contextualize parábolas)
- [ ] **CR2-05**: Testing Protocol com 5 tipos de teste

### Entregáveis Obrigatórios
- [ ] `artifacts/cognitive_architecture.yaml` (5 módulos)
- [ ] `system_prompts/{timestamp}-v1.0-generalista.md` (completo)
- [ ] `docs/testing_protocol.md` (5 tipos de teste)
- [ ] `docs/operational_manual.md` (quando usar/não usar)

### Gate Decision
- [ ] **GO**: System Prompt passa teste inicial (10 perguntas) → Avançar para Testing
- [ ] **NO-GO**: <80% aprovação → Refinar system prompt

---

## 🧪 FASE 3: TESTING & REFINEMENT (Semana 7)

### 🔬 TESTING (Semana 7) - 5h

- [ ] **TASK-T01**: Test Generator - Gerar casos de teste
  - Executor: @qa
  - Esforço: 1h
  - Output: `docs/logs/{timestamp}-test_cases.yaml`
  - Prioridade: CRÍTICA
  - Dependências: TASK-I10
  - Detalhamento:
    - [ ] Gerar 20 pares (citação canônica / resposta esperada) para autenticidade
    - [ ] Gerar 50 consultas éticas/liderança para consistência
    - [ ] Gerar 10 casos modernos para aplicação contextual
    - [ ] Gerar 5 cenários ICP (Executivo Exausto, Veterano Desprezado)

- [ ] **TASK-T02**: Personality Validator - Validação de personalidade
  - Executor: @qa
  - Esforço: 2h
  - Output: `docs/logs/{timestamp}-personality_validation.md`
  - Prioridade: CRÍTICA
  - Dependências: TASK-T01, TASK-I08
  - Detalhamento:
    - [ ] Executar teste de autenticidade (target: 85%+)
    - [ ] Executar teste de consistência (target: 95%+, 0 contradições)
    - [ ] Executar teste de aplicação contextual (target: 80%+)
    - [ ] Executar teste de combate à paralisia (target: 4/5 padrões)
    - [ ] Documentar gaps e ajustes necessários

- [ ] **TASK-T03**: Refinement - Ajustes baseados em testes
  - Executor: @architect + @qa
  - Esforço: 2h
  - Output: `system_prompts/{timestamp}-v1.1-generalista.md`
  - Prioridade: ALTA
  - Dependências: TASK-T02
  - Detalhamento:
    - [ ] Corrigir falhas de autenticidade (<85%)
    - [ ] Corrigir contradições de valores (se houver)
    - [ ] Ajustar Parable Engine se aplicação contextual <80%
    - [ ] Refinar tone/approach baseado em feedback ICP
    - [ ] Gerar versão v1.1 refinada

- [ ] **TASK-T04**: ICP Real Test - Teste com usuário ICP real
  - Executor: @pm + ICP (Executivo Exausto ou Veterano Desprezado)
  - Esforço: 0h (async - esperar feedback)
  - Output: `docs/logs/{timestamp}-icp_feedback.md`
  - Prioridade: ALTA
  - Dependências: TASK-T03
  - Detalhamento:
    - [ ] Recrutar 1 Executivo Exausto (40-55 anos)
    - [ ] Sessão de 30 minutos com clone
    - [ ] Feedback: autenticidade, relevância, transformação percebida
    - [ ] Validar modo secular (se ICP for ateu/agnóstico)

---

## 🎯 CHECKPOINT 3: LAUNCH READINESS (Final Semana 7)

### Critérios de Aprovação
- [ ] **CR3-01**: Autenticidade ≥85% (teste cego)
- [ ] **CR3-02**: Precisão ≥90% (consultas ética/liderança)
- [ ] **CR3-03**: Consistência ≥95% (0 contradições)
- [ ] **CR3-04**: Aplicação contextual ≥80% (parábolas → casos modernos)
- [ ] **CR3-05**: ICP approval (feedback positivo de teste real)

### Entregáveis Obrigatórios
- [ ] `system_prompts/{timestamp}-v1.1-generalista.md` (refinado)
- [ ] `docs/logs/{timestamp}-personality_validation.md` (5 testes completos)
- [ ] `docs/logs/{timestamp}-icp_feedback.md` (usuário real)
- [ ] `docs/LIMITATIONS.md` (documentar limitações conhecidas)

### Gate Decision
- [ ] **LAUNCH**: Todos os critérios ≥target → Clone pronto para uso
- [ ] **HOLD**: <80% critérios → Iterar refinement (mais 1 semana)

---

## 📊 MÉTRICAS E KPIs

### Métricas de Processo
| Métrica | Target | Status |
|---------|--------|--------|
| **Horas investidas** | 50h | TBD |
| **Fontes Tier 1 coletadas** | 100% (4 Evangelhos) | TBD |
| **Parábolas indexadas** | 80%+ (32+ de 40) | TBD |
| **Citações extraídas** | 100+ | TBD |
| **Checkpoints aprovados** | 3/3 | 0/3 |

### Métricas de Qualidade
| Métrica | Target | Status |
|---------|--------|--------|
| **Autenticidade** | ≥85% | TBD |
| **Precisão** | ≥90% | TBD |
| **Consistência** | ≥95% | TBD |
| **Performance** | <3s | TBD |
| **ICP Approval** | Feedback positivo | TBD |

---

## ⚠️ RISCOS E MITIGAÇÕES

### Risco 1: Resistência por Contexto Religioso
- **Probabilidade:** Média
- **Impacto:** Alto
- **Mitigação:**
  - [ ] Implementar posicionamento dual (secular/espiritual) na TASK-I03
  - [ ] Testar modo secular com ICP ateu na TASK-T04
  - [ ] Documentar quando usar cada modo no TASK-I09

### Risco 2: Parábolas Muito Abstratas (falta aplicação prática)
- **Probabilidade:** Média
- **Impacto:** Médio
- **Mitigação:**
  - [ ] Criar Parable Engine (TASK-I03) que contextualiza parábolas antigas → casos modernos
  - [ ] Teste de aplicação contextual (TASK-T02) valida eficácia
  - [ ] Documentar combos com clones táticos (Hormozi, Allen) no TASK-I09

### Risco 3: Transformação Muito Lenta (ICP quer 30 dias, clone entrega 90-180)
- **Probabilidade:** Alta
- **Impacto:** Baixo
- **Mitigação:**
  - [ ] Comunicar expectativa clara: "Transformação profunda, não quick win" (TASK-I09)
  - [ ] Oferecer quick wins: paz interior/clareza em 30 dias, identidade em 6 meses
  - [ ] Combinar com clones de curto prazo (Naval para filosofia + Hormozi para execução)

### Risco 4: Interpretações Conflitantes (católico vs protestante vs ortodoxo)
- **Probabilidade:** Baixa
- **Impacto:** Médio
- **Mitigação:**
  - [ ] Focar em princípios universais (Mandamentos do Amor) - TASK-S05
  - [ ] Triangular 3 tradições durante research (TASK-R02)
  - [ ] Evitar teologia dogmática, stick to ensinamentos práticos

---

## 📚 DEPENDÊNCIAS EXTERNAS

### Recursos Humanos
- [ ] @analyst (15h - research + analysis + synthesis)
- [ ] @architect (10h - cognitive architecture + system prompts)
- [ ] @pm (3h - PRD + operational manual + ICP recruitment)
- [ ] @qa (5h - testing protocol + personality validation)
- [ ] ICP Tester (1 pessoa - Executivo Exausto ou Veterano Desprezado)

### Ferramentas
- [x] AIOS Launcher (coordenação de prompts) - Disponível
- [x] YAML processors - Disponível
- [x] Claude Code - Disponível
- [x] Sistema de arquivos ACS V3.0 - Pronto

### Materiais
- [x] 4 Evangelhos canônicos (domínio público) - Acessível
- [x] 23 epístolas (domínio público) - Acessível
- [x] Contexto histórico (Josefo, scholarship) - Acessível

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana (Iniciar Fase Research)
1. [ ] **TASK-R01**: Source Discovery (2h) - @analyst
2. [ ] **TASK-R02**: Coletar Evangelhos Tier 1 (3h) - @analyst **[PARALELIZÁVEL]**
3. [ ] **TASK-R03**: Coletar Epístolas Tier 2 (2h) - @analyst **[PARALELIZÁVEL]**

### Semana Seguinte
4. [ ] **TASK-R05**: Temporal Mapper (2h) - @analyst **[PARALELIZÁVEL]**
5. [ ] **TASK-R06**: Priority Calculator (1h) - @analyst **[PARALELIZÁVEL]**
6. [ ] **TASK-R07**: Sources Master v2.0 (1h) - @analyst
7. [ ] **CHECKPOINT 1**: Gate decision

---

## 📝 NOTAS E OBSERVAÇÕES

### Decisões de Escopo
- **IN**: Transformação identitária, liderança servidora, ética, propósito
- **OUT**: Táticas de monetização, frameworks operacionais step-by-step, teologia dogmática, milagres

### Sinergias Estratégicas
- **Jesus + Hormozi** = Propósito (WHY) + Execução (HOW)
- **Jesus + David Allen** = Clareza de propósito + Produtividade
- **Jesus + Simon Sinek** = Liderança servidora + Start With Why

### ICP Ideal para Este Clone
1. **Primário**: Executivo Exausto (9/10 relevância)
2. **Secundário**: Veterano Desprezado (8/10 relevância)
3. **Terciário**: Multipotencial Ansioso (7/10 relevância)

### Melhor Momento para Este Clone
- Após crise existencial ou burnout
- Quando ICP já tem $ mas sente vazio
- Transição de carreira buscando propósito vs performance
- Após clones táticos (Naval, Hormozi) já em uso

---

**Documento gerado por:** Clone System v3.0 (MMOS Pipeline)
**Agente:** @pm (Project Manager)
**Data:** 2025-10-06
**Versão:** 1.0
**Próxima atualização:** Após Checkpoint 1 (Semana 3)
**Owner:** oalanicolas
**Status:** READY TO START (Viability Phase ✅ Complete)
