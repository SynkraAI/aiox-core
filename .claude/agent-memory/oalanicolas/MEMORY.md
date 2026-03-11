# @oalanicolas Memory - Mind Cloning Architect

## Quick Stats
- Minds clonados: 5 (1 palestrante, 4 technical thought leaders)
- Fidelidade média: 9.3/10
- Fontes processadas: 50K+ linhas (livros Tier 0 + papers acadêmicos)

---

## Minds Clonados
<!-- Formato: [DATA] mind-name → arquivo (fidelidade X%, fontes Y) -->
- [2026-03-09] renner-silva v1.2 → squads/squad-creator/data/minds/renner_silva/05_clone_final/ (fidelidade 9.5/10, 19 KBs, 29 memorias episodicas)
  - v1.1: 9.3/10 | v1.2: 9.5/10 (+0.2)
  - Gap principal restante: ME-01 a ME-07 rasas, cross-refs unidirecionais

- [2026-03-11] james-taylor v2.0 → squads/business-rules-extraction/agents/james-taylor.md (fonte Tier 0: livro "Decision Management Systems", 7.6K linhas)
  - Extraído Voice DNA + Thinking DNA + 10 episodic memories de case studies
  - Vocabulary fingerprints quantificados (2891x "decision" vs 423x "rule")
  - Frameworks: AAA, decision characteristics filter, 5 discovery methods, DRD construction, three-legged stool

- [2026-03-11] barbara-von-halle v2.0 → squads/business-rules-extraction/agents/barbara-von-halle.md (fonte Tier 0: livro "The Decision Model", 22K linhas)
  - Extraído Voice DNA + 15 Principles framework + 8 episodic memories de projetos reais
  - Vocabulary fingerprints quantificados (200+ "Rule Family", 150+ "normalization", 80+ "declarative")
  - Frameworks: 15 Decision Model Principles, 3NF normalization, 7 mental frameworks, integrity triangle
  - Project metrics: 4 real projects with before/after quantified impact (42% maintenance reduction, ROI 5756:1)

- [2026-03-11] jan-vanthienen v1.1 → squads/business-rules-extraction/agents/jan-vanthienen.md (fonte Tier 1: paper acadêmico "Decision Tables to Expert System Shells", 884 linhas)
  - Extraído Voice DNA acadêmico formal + PROLOGA methodology (5-stage construction)
  - Vocabulary fingerprints quantificados (120+ "decision table", 18x "verification and validation", 15x "contraction")
  - Frameworks: PROLOGA construction, transformation framework (3 steps), optimization algorithms (Quine-McCluskey)
  - Episodic memories: HANDIPAK case study (45 decision tables, legislative verification 1987-1991)
  - 4 Knowledge Bases: PROLOGA system, optimization algorithms, transformation options, HANDIPAK case
  - Application domains + limitations documented (Section 7 do paper)

- [2026-03-11] michael-feathers v2.0 → squads/business-rules-extraction/agents/michael-feathers.md (fonte Tier 0: livro "Working Effectively with Legacy Code", 20K linhas amostragem estratégica)
  - Extraído Voice DNA + Thinking DNA + 5 episodic memories from Object Mentor consulting
  - Vocabulary fingerprints: "seam" (40+), "characterization test" (50+), "legacy code" (definição proprietária)
  - Frameworks: Legacy Code Change Algorithm (5 steps), Seam Model (3 types + enabling points), 24 Dependency-Breaking Techniques
  - Metrics obsession pattern: quantifica tudo (<1/10s unit test threshold, <10 cyclomatic complexity, <50 lines method)
  - Rhetorical patterns: "Let's do the math", "Here's a news flash", surgical metaphors ("incision", "scar", "healing")
  - Fidelidade estimada: 9.2/10

---

## Voice DNA Patterns Descobertos

### Palestrantes/Speakers (Renner Silva como referência)
- Fingerprints quantitativos funcionam melhor que qualitativos (61x "Olha so" > "frequente")
- Mineirês estratégico = dialeto como ferramenta de suavização, não constante
- Parafônicos (pausas, tom, ritmo) são críticos — sem eles, voz fica flat
- Frases-mantra de alta carga identitária > frases genéricas recorrentes
- Dados de frequência real de sessão única calibram melhor que estimativa across content

### Copywriters
- Opening hooks característicos
- Uso de PS como CTA
- Story-first structure

### Thought Leaders / Autores de Livros Técnicos
**James Taylor como referência (DMN/EDM domain):**
- Frameworks proprietários nomeados: AAA, three-legged stool, decision characteristics filter
- Vocabulário técnico com frequência quantificada (2891x "decision" > 423x "rule" = identidade clara)
- Estrutura pedagógica: problema → solução → benefício
- Enumeração sistemática ("três formas", "quatro passos") como padrão de organização mental
- Case studies como evidência (10+ empresas reais nomeadas)
- Analogias recorrentes: "rules without decisions = words without sentences"
- Tom: authoritative educator-consultant, não acadêmico puro

**Barbara von Halle como referência (Decision Model / Normalization domain):**
- Frameworks matematicamente rigorosos: 15 Decision Model Principles (Structural 1-7, Declarative 8-10, Integrity 11-15)
- Vocabulário com distinções precisas: "Rule Family" ≠ "decision table", "declarative" vs "procedural", "1NF/2NF/3NF"
- Estrutura pedagógica: exemplo concreto → princípio abstrato → aplicação prática
- Enumeração sistemática de princípios (sempre numerados, sempre explicados em 3 partes: what, why, how)
- Project metrics obsessivos: "reduced 42%", "ROI 5756:1", "25 diagrams → 10 diagrams"
- Analogias recorrentes: Decision Model <-> Relational Model ("What Codd did for data, we do for business logic")
- Tom: rigorous teacher-architect, exigente mas pedagógica, cita Codd constantemente
- Influência da matemática: normalization theory, set theory, functional dependencies
- Case studies com before/after quantificado (4 projetos com métricas detalhadas)

**Jan Vanthienen como referência (Academic / Decision Table Verification domain):**
- Vocabulário acadêmico formal: "It has been shown that...", "We propose...", "According to numerous experiences..."
- Terminologia técnica precisa: "single-hit table" (vs multiple-hit), "prime implicants", "subsumption", "exhaustive"
- Estrutura IMRaD (Intro, Methods, Results, Discussion) com 32 referências bibliográficas
- Enumeração sistemática de estágios (1-5) e algoritmos (k! permutations, 2^k truth tables)
- Frameworks de verificação: completeness → consistency → redundancy → optimization (SEMPRE nessa ordem)
- Paper evidence citations: quotes literais do paper em anti-patterns
- Tom: meticulous academic, rigorous mathematician, passionate teacher
- Quirks acadêmicos: cita Quine-McCluskey em conversa casual, pensa em k! permutações, desenha truth tables
- Citações formais: "[24, 25]" mid-sentence
- Case study com impacto legislativo: HANDIPAK (45 decision tables, encontrou ambiguidades em LEI antes de publicação)

**Michael Feathers como referência (Legacy Code / Refactoring domain):**
- Vocabulário técnico proprietário: "seam", "enabling point", "characterization test" (termos que ELE definiu na indústria)
- Metrics obsession: quantifica tudo (<1/10s tests, <10 cyclomatic complexity, 3000 classes × 10 tests math)
- Estrutura FAQ: "The Case of..." (7 casos no Cap 9-10 — problem-driven organization)
- Surgical metaphors: "incision", "scar", "healing" (código como paciente cirúrgico)
- Empathetic tone: "I hope you've had...", "the raw joy of...", "the sad fact is...", "Unfortunately..."
- Rhetorical patterns: "Let's do the math", "Here's a news flash", antecipa objeções ("You might think this is severe")
- Highlighted boxes com "* * *" para princípios importantes (box formatting pattern)
- Algoritmização: tudo vira passo 1, 2, 3, 4, 5 (Legacy Code Change Algorithm = 5 steps)
- Tom: pragmatic surgeon-teacher, não teórico — foca em "fazer hoje com segurança"
- Paradoxo central: "The Legacy Code Dilemma" (need tests to change, need change to add tests)

---

## Thinking DNA Frameworks
- Diagnostic trees com failure modes nomeados (Impostor/Sabotador/Pobre) = alta fidelidade
- Separar "como pensar" (KB03) de "como monetizar" (KB18) = boa arquitetura de clone
- Heurísticas com tabela situação→ação são mais operacionais que quotes soltas
- Anti-patterns de negócio completam os frameworks positivos (o que NÃO fazer)
- Sistemas de princípios numerados (15 Decision Model Principles) com categorização clara (Structural/Declarative/Integrity)
- Mental frameworks nomeados (7 frameworks para Barbara: "Normalization as Progressive Refinement", "Integrity Triangle", etc.)
- Padrões de raciocínio progressivo (1NF → 2NF → 3NF, cada passo remove classe diferente de anomalia)
- Frameworks com 3 dimensões de análise (structural/logical/business integrity) = completude multidimensional
- Algoritmização de processos: experts técnicos organizam tudo em passos numerados (Legacy Code Change Algorithm = 5 steps obrigatórios)
- Decision trees para casos específicos ("The Case of..." → técnica recomendada — pattern de Feathers)
- Métricas como thresholds de decisão (<1/10s → slow test, >10 complexity → high risk — quantified heuristics)
- Paradoxos centrais nomeados ("The Legacy Code Dilemma" — defining tensions cria identidade)

---

## Fontes de Alta Qualidade
<!-- Fontes que consistentemente produzem bom DNA -->
### Tier 0 (Ouro)
- Livros do próprio autor
- Transcrições de cursos

### Tier 1 (Prata)
- Papers acadêmicos do próprio autor (884 linhas de Vanthienen = 4 KBs + 5 episodic memories + frameworks completos)
- Entrevistas longas (1h+)
- Newsletters originais

### Tier 2 (Bronze)
- Artigos sobre o expert
- Resumos de terceiros

---

## Erros de Extração
- Cross-references entre KBs devem ser BIDIRECIONAIS (novos KBs referenciam antigos MAS antigos não referenciam novos)
- Memorias com "brief reference" vs "full story" criam inconsistência de profundidade
- Placeholders genéricos (R$X, N people) quando dados reais existem nas fontes = perda de fidelidade
- SYSTEM_PROMPT e DECISION_TREE devem ser atualizados junto com novos KBs (senão clone tem knowledge mas não sabe quando acessar)

---

## Notas Recentes
- [2026-03-11] Michael Feathers DNA extraction from 20K-line book complete. Pattern: technical authors NEED books (Tier 0).
  - Sampled strategically: intro, Seam Model chapter, Characterization Tests chapter, Dependency-Breaking catalog
  - Vocabulary fingerprints validated via grep: "seam" (40+), "characterization test" (50+), "legacy code" (HIS definition)
  - Metrics obsession discovered: EVERY threshold quantified (<1/10s, <10 complexity, <50 lines, 3000 classes)
  - Surgical metaphor thread: "incision", "scar", "healing" (consistent metaphor family throughout 400-page book)
  - Rhetorical patterns: "Let's do the math" (math as persuasion), "Here's a news flash" (myth-busting), empathetic disclaimers
  - 5 episodic memories from consulting stories (Object Mentor, financial team 4h→15min, Erik Meade quote)
  - Highlighted boxes pattern: "* * *" delimita princípios importantes (formatting as pedagogy)
  - FAQ structure: "The Case of..." (7 casos Cap 9-10) — problem-first organization
- [2026-03-11] Jan Vanthienen v1.1 DNA extraction from 884-line academic paper complete. Tier 1 source (papers acadêmicos).
  - Academic voice DNA: vocabulary fingerprints (120+ "decision table", 18x "verification and validation"), academic markers ("It has been shown..."), formal citations ("[24, 25]")
  - PROLOGA methodology extracted: 5-stage construction framework com verificação integrada
  - Transformation framework: optimization (4 types) → implementation (trees vs rules) → consultation (generic environment)
  - HANDIPAK case study: 45 decision tables, legislative quality control (found ambiguities BEFORE law publication 1987-1991)
  - 4 Knowledge Bases created: PROLOGA system, optimization algorithms (Quine-McCluskey), transformation strategies, HANDIPAK case
  - Application domains + limitations from paper Section 7 (knows when NOT to use decision tables)
  - Quirks acadêmicos autênticos: "thinks in k! permutations", "draws truth tables on napkins", cita algoritmos em conversa casual
- [2026-03-11] James Taylor DNA extraction from 7600-line book complete. Tier 0 source = gold mine.
  - Vocabulary fingerprints >> qualitative descriptions (2891x "decision" data point > "frequently uses 'decision'")
  - Book index provided term frequency cross-validation (e.g., "BRMS" appears 38x)
  - 10 episodic memories with quantified outcomes (e.g., "50% premium increase", "5th → 99th rank")
  - 5 core frameworks extracted: AAA, characteristics filter, discovery methods, DRD, three-legged stool
- [2026-03-09] Renner Silva v1.2 scored 9.5/10 (APPROVED). Delta +0.2 from v1.1.
- [2026-02-05] Agent Memory implementado - Epic AAA
