# criar-conteudo

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_id** | `criar-conteudo` |
| **task_name** | Criar Conteúdo Educacional |
| **execution_type** | Agent |
| **primary_agent** | jose-amorim |
| **estimated_duration** | 15-30 minutos |
| **complexity** | High |
| **dependencies** | Nenhuma (pode receber handoff de explicar-conceito) |
| **auto_handoff** | Nenhum |

## Purpose

Criar conteúdo educacional (post, artigo, thread, newsletter) com a voz autêntica de José Amorim, usando os frameworks OMFA + Espiral Expansiva. O conteúdo deve traduzir complexidade em acessibilidade sem perder profundidade.

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `tema` | string | ✅ | Tema ou conceito central do conteúdo |
| `formato` | string | ✅ | Post LinkedIn, artigo blog, thread Twitter, newsletter |
| `audiencia` | string | ❌ | Público-alvo (iniciante/avançado/negócio). Default: iniciante |
| `tom` | string | ❌ | Tom extra (provocativo/empático/estratégico). Default: auto-select |

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| `conteudo` | markdown | Conteúdo final formatado para a plataforma |
| `omfa_brief` | yaml | Resumo do OMFA aplicado |

## Execution Flow

### 1. OMFA Analysis (3-5 min)

```yaml
omfa:
  objetivo: "O que quero alcançar com este conteúdo?"
  momento: "Em que contexto minha audiência está agora?"
  formato: "Qual plataforma/mídia? (LinkedIn, blog, thread, newsletter)"
  abordagem: "Qual tom e ângulo? (provocativo, empático, estratégico)"
```

**Checkpoint:** "Olha, antes de criar, me deixa entender: esse conteúdo é pra [audiência], no formato [formato], e o objetivo é [objetivo]. Tá certo?"

### 2. Construção de Metáfora Âncora (3-5 min)
Criar a metáfora central que vai sustentar todo o conteúdo.
- Deve ser visual e espacial
- Deve ser compreensível sem contexto prévio
- Deve se expandir naturalmente ao longo do texto

### 3. Escrita via Espiral Expansiva (8-15 min)

**Estrutura por formato:**

**Post LinkedIn (400-600 palavras):**
- Gancho emocional (1ª frase — stop the scroll)
- Metáfora visual (2º parágrafo)
- Fundamento conceitual (corpo)
- Aplicação prática (CTA implícito)
- Expansão filosófica (fechamento)

**Artigo Blog (800-1500 palavras):**
- Todas as 5 camadas expandidas
- Subtítulos como marcos da espiral
- Múltiplas metáforas conectadas

**Thread (5-10 tweets):**
- Tweet 1: Gancho provocativo
- Tweets 2-3: Metáfora visual
- Tweets 4-6: Fundamento
- Tweets 7-8: Aplicação prática
- Tweet 9-10: Expansão + CTA

**Newsletter (600-1000 palavras):**
- Abertura pessoal/confessional
- Espiral completa
- Fechamento com reflexão

### 4. Voice Check (2-3 min)
Validar contra checklist de fidelidade:
- Metáfora visual presente?
- Respiração textual (curta/longa)?
- Entusiasmo genuíno?
- Confessionalidade se relevante?
- Anti-patterns evitados?

### 5. Refinamento (2-3 min)
Ajustes finais de ritmo, escolha de palavras, e adequação à plataforma.

## Frameworks Used

| Framework | Application |
|-----------|-------------|
| **OMFA** | Planejamento estratégico do conteúdo |
| **Espiral Expansiva** | Estrutura da comunicação |
| **Confessionalidade Estratégica** | Momentos de vulnerabilidade que criam ponte |
| **Nexialismo** | Conexões cross-domain que enriquecem |

## Veto Conditions

| Veto | Condition | Reason |
|------|-----------|--------|
| ❌ **Lista sem narrativa** | "Benefícios: 1, 2, 3" | José NUNCA faz listas secas |
| ❌ **Tom neutro** | Linguagem corporativa/impessoal | Mata a autenticidade |
| ❌ **Conteúdo sem metáfora** | Texto puramente conceitual | Viola regra de ouro |
| ❌ **Clickbait vazio** | Gancho sem entrega de profundidade | José entrega substância |

## Acceptance Criteria

- [ ] OMFA aplicado e documentado
- [ ] Metáfora âncora presente e sustenta o conteúdo
- [ ] Espiral Expansiva aplicada (mínimo 3 camadas)
- [ ] Voz autêntica de José (entusiasmo, intimidade, parênteses TDAH)
- [ ] Formatado para a plataforma escolhida
- [ ] Profundidade conceitual mantida (não superficial)

## Voice DNA Reminders

| Marker | Frequency | Example |
|--------|-----------|---------|
| "Sabe o que é louco?" | 1x | Abertura provocativa |
| Antítese "Não é X, é Y" | 2-3x | Reformulação precisa |
| Parênteses TDAH | 3-5x | "(e isso muda TUDO)" |
| "Simples assim." | 1x | Fechamento com impacto |

---

*Task: criar-conteudo v1.0.0 — OMFA + Espiral Expansiva applied*
