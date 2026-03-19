# GERADOR DOS 17 DOCUMENTOS DA KNOWLEDGE BASE (12 Originais + 5 Decision Intelligence)

## 🎯 OBJETIVO
Gerar os 17 documentos especializados que compõem a Knowledge Base completa do clone com Decision Intelligence integrado.
**Tempo total**: 4-5 horas (pode fazer em sessões)

---

## 📋 ESTRUTURA DOS 17 DOCUMENTOS

### CORE COGNITIVO (3 docs)
1. META_AXIOMAS_EXPLICITOS.md
2. LINGUAGEM_SWIPE_FILE_EXPANDIDO.md
3. FRAMEWORKS_PENSAMENTO.md

### PSICOLOGIA (4 docs)
4. BLIND_SPOTS_[nome].md
5. PARADOXOS_PRODUTIVOS_[nome].md
6. FINGERPRINTS_UNICOS_[nome].md
7. HEURISTICAS_DECISAO_FORMAIS.md

### CONTEXTO (4 docs)
8. BIOGRAFIA_COMPLETA_[nome].md
9. MEMORIAS_EPISODICAS_[nome].md
10. SWIPE_FILE_COMUNICACAO.md
11. TIMELINE_[nome]_SINTETICA.md

### REFERÊNCIA (1 doc)
12. SISTEMA_IMUNOLOGICO_HIERARQUIZADO.md

### DECISION INTELLIGENCE (5 docs) **NOVO!**
13. DECISION_CONTEXT_LIBRARY.md
14. ACTION_TRIGGER_PLAYBOOK.md
15. OBJECTION_HANDLING_MATRIX.md
16. DECISION_HEURISTICS_CODEX.md
17. OUTCOME_LEARNING_PATTERNS.md

---

## 🔧 COMO GERAR

**Opção A - Gerar todos de uma vez**:
Use o prompt master abaixo que gera todos os 12 documentos sequencialmente.

**Opção B - Gerar individualmente**:
Use os prompts específicos em `/templates/` para cada documento.

---

## 📋 PROMPT MASTER - GERA TODOS OS 12 DOCUMENTOS

```
Você é especialista em documentação de personas e criação de knowledge bases.

# TAREFA
Gere os 12 DOCUMENTOS DA KNOWLEDGE BASE completos.

# INPUTS
Cole TODOS os documentos processados:
- PSH_SHELL_MASTER
- Todos os 6 documentos de humanização (blind spots, paradoxos, fingerprints, memórias, sistema imun., meta-axiomas)
- Consolidações
- TSM, APR, MCC

---

# DOCUMENTO 1: META_AXIOMAS_EXPLICITOS

[Use o conteúdo já gerado em `04_humanizacao_avancada/meta_axiomas.md`]

Formate como documento final da Knowledge Base:
- Título
- 9 axiomas numerados
- Cada um com: Formulação / Origem / Como governa / Consequências
- Matriz de axiomas
- Conflitos entre axiomas

---

# DOCUMENTO 2: LINGUAGEM_SWIPE_FILE_EXPANDIDO

**Conteúdo**: 120+ frases categorizadas que [nome] usa.

[Use P2_output + frases do PSH]

## Categorias:

### Sobre Trabalho (20 frases)
1. [...]
2. [...]

### Sobre Dinheiro/Finanças (20 frases)
1. [...]

### Sobre Decisões (15 frases)
1. [...]

### Medos e Inseguranças (15 frases)
1. [...]

### Objetivos e Sonhos (15 frases)
1. [...]

### Conversas Casuais (15 frases)
1. [...]

### Estresse/Pressão (10 frases)
1. [...]

### Dúvida/Hesitação (10 frases)
1. [...]

### Entusiasmo (10 frases)
1. [...]

### Reclamações/Desabafos (10 frases)
1. [...]

**Total**: 140 frases

---

# DOCUMENTO 3: FRAMEWORKS_PENSAMENTO

**Conteúdo**: Modelos mentais e heurísticas que [nome] usa.

## Framework #1: Decisão de Compra
[Use P7 5-Gate Model]

## Framework #2: Priorização de Tarefas
[Com base em C score + MCC costs]

## Framework #3: Gestão de Ansiedade
[Com base em TSM + Coping mechanisms]

## Framework #4: Avaliação de Oportunidades
[Com base em Valores + Affordability]

## Framework #5: Tomada de Decisão Sob Incerteza
[Com base em Vieses + Valores]

[Cada framework deve ter]:
- Nome
- Quando usa
- Como funciona (passo a passo)
- Exemplo aplicado
- Limitações/vieses

---

# DOCUMENTO 4: BLIND_SPOTS_[nome]

[Use o conteúdo já gerado em `04_humanizacao_avancada/blind_spots.md`]

---

# DOCUMENTO 5: PARADOXOS_PRODUTIVOS_[nome]

[Use o conteúdo já gerado em `04_humanizacao_avancada/paradoxos_produtivos.md`]

---

# DOCUMENTO 6: FINGERPRINTS_UNICOS_[nome]

[Use o conteúdo já gerado em `04_humanizacao_avancada/fingerprints_unicos.md`]

---

# DOCUMENTO 7: HEURISTICAS_DECISAO_FORMAIS

**Conteúdo**: Pseudocódigo de como [nome] decide em situações específicas.

## Heurística #1: Decisão de Aceitar Projeto Novo

```
FUNÇÃO decidir_aceitar_projeto(projeto):

    # Gate 1: Affordability
    SE projeto.valor < affordability_minima:
        RETORNAR REJEITAR("Não paga o suficiente")

    # Gate 2: Alinhamento de Valores
    SE projeto.conflita_com(valor_independencia) OU projeto.conflita_com(valor_autenticidade):
        RETORNAR REJEITAR_ABSOLUTO("Viola valores core")

    # Gate 3: Capacidade Mental
    custo_mental = estimar_MCC(projeto)
    SE custo_mental > budget_cognitivo_disponivel:
        RETORNAR HESITAR("Muito desgastante, procrastinar decisão")

    # Gate 4: Risco vs Recompensa
    SE projeto.risco == "alto" E ansiedade_atual > 7:
        RETORNAR REJEITAR("Ansiedade não permite arriscar agora")

    # Gate 5: Comparação Social
    SE colegas.fazem_projetos_maiores:
        ansiedade_FOMO += 2
        SE ansiedade_FOMO > 8:
            RETORNAR ACEITAR_IMPULSIVAMENTE("FOMO override razão")

    # Default
    RETORNAR PROCRASTINAR("Preciso pensar mais...")

FIM FUNÇÃO
```

[Crie 5-7 heurísticas para situações diferentes]:
- Aceitar projeto novo
- Comprar curso/produto
- Decidir aumentar preço
- Lidar com cliente difícil
- Escolher entre segurança e crescimento
- [...]

---

# DOCUMENTO 8: BIOGRAFIA_COMPLETA_[nome]

**Conteúdo**: História de vida detalhada em formato narrativo.

## Infância e Adolescência (0-18 anos)
[Parágrafo narrativo de 150-200 palavras]

[Se houver dados no briefing, use. Se não, crie plausível baseado em personalidade e contexto]

## Formação Acadêmica e Primeiras Experiências (18-24 anos)
[...]

## Início de Carreira (24-28 anos)
[...]

## Fase Atual (28-32 anos)
[Detalhado, baseado em todos os dados coletados]

## Relacionamentos Significativos
[...]

## Eventos Transformadores
[Liste as memórias episódicas integradas na narrativa]

---

# DOCUMENTO 9: MEMORIAS_EPISODICAS_[nome]

[Use o conteúdo já gerado em `04_humanizacao_avancada/memorias_episodicas.md`]

---

# DOCUMENTO 10: SWIPE_FILE_COMUNICACAO

**Conteúdo**: Templates de comunicação por canal.

## WhatsApp

### Conversa com Amiga
```
[Amiga: Vamos jantar hoje?]
Você: Ai, queria muito mas tô durassa esse mês 😅
Você: Deixa pro mês que vem? Prometo que a gente vai!
```

[10 exemplos de conversas WhatsApp]

### Conversa com Cliente
```
[Cliente: Quanto fica o projeto?]
Você: Oi! Então, depende do escopo né
Você: Mas pra ter uma ideia, projetos nesse estilo ficam em torno de R$ X
Você: Posso fazer um orçamento certinho pra você?
```

[10 exemplos]

## Email

### Email Profissional - Orçamento
```
Assunto: Orçamento projeto [nome]

Oi [nome],

Tudo bem? Obrigada pelo contato!

Vi o que você precisa e já tenho algumas ideias 😊

[Corpo do email...]

Qualquer dúvida, pode me chamar!

Abs,
[Seu nome]
```

[5 templates de email]

## Instagram

### Posts sobre Trabalho
```
[Foto de projeto]

Finalizei mais um projeto que amei demais! 💙

[Descrição...]

O que acharam? 👀

#arquitetura #design #projeto
```

[10 exemplos de posts]

### Stories
```
[Foto da tela do computador]

"Gente, tô aqui quebrando a cabeça nesse projeto... 😅

Render não quer sair de jeito nenhum

Alguém entende de [software]? Me salvaaaa 🙏"
```

[10 exemplos]

---

# DOCUMENTO 11: TIMELINE_[nome]_SINTETICA

**Conteúdo**: 60+ eventos cronológicos da vida.

| Ano | Idade | Evento | Categoria | Impacto |
|-----|-------|--------|-----------|---------|
| 1995 | 0 | Nascimento em [cidade] | Origem | - |
| 2013 | 18 | Entrou faculdade Arquitetura | Formação | Alto |
| 2017 | 22 | Formou-se | Formação | Alto |
| 2018 | 23 | Primeiro emprego CLT | Carreira | Médio |
| 2019 | 24 | Saiu do CLT, virou autônoma | Carreira | Muito Alto |
| 2019 | 24 | Memória: Pediu $ emprestado | Financeiro | Muito Alto |
| [...] | [...] | [...] | [...] | [...] |

[Continue até ano atual com 60+ eventos]

---

# DOCUMENTO 12: SISTEMA_IMUNOLOGICO_HIERARQUIZADO

[Use o conteúdo já gerado em `04_humanizacao_avancada/sistema_imunologico.md`]

---

# DOCUMENTO 13: DECISION_CONTEXT_LIBRARY

**Conteúdo**: Biblioteca completa de contextos decisórios e como afetam decisões.

[Use P10_output]

## Estrutura:

### Inventário de Decisões por Categoria
- Profissionais (micro/meso/macro)
- Financeiras (por faixa de preço)
- Pessoais/Relacionais

### Fatores Contextuais
- Pressão Temporal (4 tipos)
- Recursos Disponíveis ($, tempo, energia, suporte)
- Estado Emocional (ansioso, confiante, frustrado, etc.)
- Influências Sociais (privado, semipúblico, público, colaborativo)

### Mudança de Modo Decisório
- Gatilhos de mudança "exploração" → "decisão"
- Gatilhos de reversão/cancelamento

### Matriz Decisória Contextual
Tabela: Contexto × Stakes (baixos/médios/altos)

### Decision Budget
- Capacidade decisória diária
- O que consome/economiza budget
- Estratégias de simplificação

### Contextos Específicos de Compra
- Modo descoberta/consideração/decisão
- Contextos que bloqueiam compra

---

# DOCUMENTO 14: ACTION_TRIGGER_PLAYBOOK

**Conteúdo**: Guia completo de gatilhos que movem para ação.

[Use P11_output]

## Estrutura:

### Anatomia da Procrastinação
- Padrão dominante
- Limiar de dor necessário

### Gatilhos de Ação Imediata
**Racionais** (5-7 gatilhos com condições exatas)
**Emocionais** (5-7 gatilhos com intensidade)
**Sociais** (5-7 gatilhos com credibilidade)
**Temporais** (3-5 gatilhos com timing)

### Combinações de Gatilhos
- Gatilhos compostos (fórmulas que funcionam)
- Anti-combinações (que se cancelam)

### Limiares "Bom O Suficiente"
Tabela de critérios: Mínimo / Bom o Suficiente / Ideal

### Estruturas de Permissão
- Permissões necessárias (interna/externa/financeira/social)
- Auto-sabotagem e contra-permissões

### Mecanismos de Compromisso
- Micro-compromissos
- Pré-compromissos (if-then plans)

### Quebra-Procrastinação
- 5-7 gatilhos que rompem paralisia
- Facilitadores de ação

### Fórmula de Ação
Equação personalizada de decisão

### Janelas de Ação Ótimas
- Temporal/Emocional/Financeira/Social

### Estratégia de Conversão Personalizada
5 fases: Ativação → Validação → Facilitação → Urgência → Reforço

---

# DOCUMENTO 15: OBJECTION_HANDLING_MATRIX

**Conteúdo**: Matriz detalhada de objeções e como tratá-las.

[Use P12_output]

## Estrutura:

### Hierarquia de Objeções
**Primárias** (7-10 objeções superficiais faladas)
**Secundárias** (5-7 objeções ocultas profundas)
**Absolutas** (3-5 dealbreakers não negociáveis)

### Fricções Inconscientes
**Cognitivas** (5-7 fricções + custos MCC)
**Emocionais** (5-7 fricções + intensidade)
**Práticas** (3-5 fricções + taxa abandono)

### Cadeia de Objeções
- Objeções sequenciais (Estágios 1-4)
- Taxa de conversão por estágio
- Objeções cíclicas

### Matriz Objeções × Contexto
Tabela: Contexto × Objeção Dominante × Intensidade × Taxa Superação

### Anatomia da Desconfiança
- 3 níveis de ceticismo
- 5-7 gatilhos de desconfiança máxima

### Paralisia Decisória
- 4 fases (sobrecarga → análise → fadiga → adiamento)
- Métodos de resgate (3-5)

### Arrependimento Pós-Decisão
- Gatilhos de arrependimento (5-7)
- Prevenção de buyer's remorse (3-5 estratégias)

### Matriz de Tratamento
Tabela: Objeção × Tipo × Resposta Eficaz × Resposta Ineficaz × Taxa Conversão

---

# DOCUMENTO 16: DECISION_HEURISTICS_CODEX

**Conteúdo**: Código decisório real - heurísticas e vieses.

[Use P13_output]

## Estrutura:

### Perfil Decisório Geral
- System 1 vs System 2 (ativação + frequência)
- Satisficer vs Maximizer (por tipo de decisão)

### Heurísticas Clássicas
**Disponibilidade** (5-7 exemplos concretos)
**Representatividade** (5-7 exemplos)
**Ancoragem** (5-7 exemplos)
**Afeto** (5-7 exemplos)

### Regras Decisórias Específicas
**IF-THEN Automáticas** (10-15 regras)
```
SE [condição] ENTÃO [ação]
```

**Regras de Eliminação** (7-10 critérios)
**Regras de Seleção** (5-7 critérios)

### Top 5 Vieses Mais Fortes
Para cada viés:
- Tipo + Intensidade (0-10)
- Manifestação específica
- Situações típicas
- Consciência (0-10)
- Consequências
- Como explorar em marketing

### Pseudocódigo Decisório
**Algoritmo de Compra** (completo em Python/pseudocódigo)
**Algoritmo Profissional** (decisões de projeto/emprego)
**Algoritmo de Priorização** (o que fazer primeiro)

### Atalhos Mentais Personalizados
5-7 heurísticas únicas específicas da persona

### Modelos Mentais Preferenciais
3-5 frameworks que aplica recorrentemente

### Implicações para Marketing
Lista: ✅ FAZER / ❌ NÃO FAZER

---

# DOCUMENTO 17: OUTCOME_LEARNING_PATTERNS

**Conteúdo**: Como aprende (ou não) com resultados.

[Use P14_output]

## Estrutura:

### Padrões de Atribuição
**Sucesso**: Interno/Externo/Misto
**Fracasso**: Interno/Externo/Misto
**Estilo Explicativo** (3 dimensões × 2 outcomes)

### Processamento de Feedback
**Feedback Positivo** (reação + incorporação + taxa aprendizado)
**Feedback Negativo** (reação + incorporação + taxa)
**Feedback Construtivo** (reação + incorporação + taxa)

**Fontes Confiáveis** (5-7 fontes + credibilidade)
**Fontes Rejeitadas** (3-5)

**Ciclo de Feedback** (tempo processamento + ação + implementação)

### Atualização de Crenças
**Taxa de Atualização** por tipo:
- Crença fraca (rápida)
- Crença média
- Crença forte (muito lenta)

**Resistência a Atualização** (3-5 crenças rígidas + custo)
**Gatilhos de Atualização Rápida** (3-5 eventos que forçam mudança)

### Calibração de Confiança
Tabela: Área × Competência Real × Confiança × Calibração × Impacto

**Ajuste Pós-Resultado**:
- Após sucesso (ajuste + duração)
- Após fracasso (ajuste + duração)

**Estratégias de Recalibração** (3-5)

### Consolidação de Aprendizado
**Taxa de Retenção** por tipo:
- Técnico/Operacional
- Emocional/Relacional
- Sobre si mesmo

**Memórias de Aprendizado** (5-7 mais formativas + rigidez)

**Generalização vs Especificação**:
- Padrão após 1 caso negativo
- Padrão após 1 caso positivo
- Padrão ideal vs real

### Evolução Adaptativa
**Estratégias que Evoluíram** (3-5 exemplos)
**Estratégias que NÃO Evoluíram** (3-5 exemplos + por quê)

**Ciclos de Aprendizado** (tempo por tipo)

### Minimização de Arrependimento
**Gatilhos de Arrependimento**:
- De ação
- De inação

**Estratégias de Minimização** (3-5 + eficácia)
**Paradoxo**: Como estratégias geram arrependimento

### Experiência Pós-Compra Ideal
4 fases: 48h → Semana 1 → Mês 1 → Longo Prazo
(Objetivo + Ação + Por quê funciona)

---

# VALIDAÇÃO DOS 17 DOCUMENTOS

- [ ] Documento 1: META_AXIOMAS_EXPLICITOS (9 axiomas)
- [ ] Documento 2: LINGUAGEM_SWIPE_FILE (120+ frases)
- [ ] Documento 3: FRAMEWORKS_PENSAMENTO (5 frameworks)
- [ ] Documento 4: BLIND_SPOTS (8 blind spots)
- [ ] Documento 5: PARADOXOS_PRODUTIVOS (6 paradoxos)
- [ ] Documento 6: FINGERPRINTS_UNICOS (7 fingerprints)
- [ ] Documento 7: HEURISTICAS_DECISAO (5-7 pseudocódigos)
- [ ] Documento 8: BIOGRAFIA_COMPLETA (narrativa completa)
- [ ] Documento 9: MEMORIAS_EPISODICAS (10+ memórias)
- [ ] Documento 10: SWIPE_FILE_COMUNICACAO (30+ templates)
- [ ] Documento 11: TIMELINE (60+ eventos)
- [ ] Documento 12: SISTEMA_IMUNOLOGICO (3 níveis)
- [ ] Documento 13: DECISION_CONTEXT_LIBRARY (contextos decisórios)
- [ ] Documento 14: ACTION_TRIGGER_PLAYBOOK (gatilhos de ação)
- [ ] Documento 15: OBJECTION_HANDLING_MATRIX (objeções e fricções)
- [ ] Documento 16: DECISION_HEURISTICS_CODEX (heurísticas e vieses)
- [ ] Documento 17: OUTCOME_LEARNING_PATTERNS (aprendizado com resultados)

Gere TODOS os 17 documentos completos.
```

**Salvar**: Cada documento como arquivo separado na pasta `knowledge_base/`

---

## 🎉 CHECKPOINT FINAL DE GERAÇÃO

Ao completar, você terá:
- ✅ 1 System Prompt Master (1200+ linhas com Decision Intelligence)
- ✅ 17 Documentos Knowledge Base especializados (12 originais + 5 DI)
- ✅ Total: ~20.000-25.000 palavras de documentação do clone
- ✅ Sistema completo com capacidades decisórias avançadas

**Próxima fase**: Validação e testes do clone gerado (incluindo testes DI)

**Vá para**: `06_validacao_qualidade/`
