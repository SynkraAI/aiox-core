# HANDOFF: Squad Conteudo - Plano Completo de Construcao

## Status: PRONTO PARA CONSTRUIR
## Data: 2026-03-07

---

## O QUE ESTAMOS CONSTRUINDO

Squad `conteudo` para criacao de conteudo Instagram (carrosseis, Reels, Stories).
Baseado em 3 fontes do usuario:
- AGENTE IMPERADOR (sistema completo de posts intencionais)
- AGENTE BLAZE (sistema de Reels)
- BRANDCONTENT (9 frameworks de copy para carrosseis)

Objetivo final: transformar em interface visual para vender a pessoas construirem seus proprios carrosseis.

---

## ARQUITETURA DE ARQUIVOS

```
squads/conteudo/
├── agents/
│   ├── content-chief.md          <- Orchestrador (Tier 0)
│   ├── carousel-creator.md       <- Carrosseis 1-10 slides (Tier 1)
│   ├── reels-creator.md          <- Roteiros Reels - DNA BLAZE (Tier 1)
│   ├── stories-strategist.md     <- Stories de conversao (Tier 1)
│   ├── content-planner.md        <- Planejamento estrategico (Tier 2)
│   └── content-validator.md      <- Oraculo unificado (Tier 2)
│
├── data/
│   ├── nucleo.md                 <- Tom de voz + calibracao Torriani
│   ├── expression.md             <- Biblioteca de expressoes autorais
│   ├── tipos-de-post.md          <- 7 tipos narrativos completos
│   ├── frameworks-copy.md        <- 9 frameworks de abordagem
│   ├── aberturas-poderosas.md    <- 5 tipos de abertura
│   ├── hooks-bank.md             <- Hooks virais unificados
│   ├── cta-bank.md               <- CTAs imperiais por intencao
│   ├── oraculo-posts.md          <- 12 testes + 9 etapas
│   ├── oraculo-reels.md          <- 3 niveis de validacao
│   ├── reels-framework.md        <- 6 blocos oficiais
│   ├── reels-patterns.md         <- 7 padroes virais
│   ├── reels-swipefile.md        <- 500+ hooks de Reels
│   ├── swipe-posts.md            <- Exemplos reais por tipo
│   ├── cliches-proibidos.md      <- Palavras banidas
│   └── regras-inviolaveis.md     <- Regras de execucao
│
├── tasks/
│   ├── create-carousel.md
│   ├── create-reels.md
│   ├── create-stories.md
│   ├── plan-content.md
│   ├── create-campaign.md
│   ├── repurpose-content.md
│   └── validate-content.md
│
├── workflows/
│   ├── wf-create-content.yaml
│   └── wf-campaign.yaml
│
├── checklists/
│   ├── oraculo-posts.md
│   ├── oraculo-reels.md
│   └── content-rules.md
│
├── config.yaml
└── README.md
```

---

## 6 AGENTS

### 1. content-chief (Tier 0)
- Orchestrador. Sabe tudo sobre todos os formatos.
- Faz briefing, diagnostica formato/intencao/tipo, direciona para agent certo.
- Recomenda melhor combinacao tipo x framework x intencao.
- Base: NUCLEO + EXPRESSION + conhecimento de todos os agents.

### 2. carousel-creator (Tier 1)
- Cria carrosseis de 1-10 slides.
- Domina 7 tipos de post + 9 frameworks de copy.
- Gera 3 headlines (2 virais + 1 imperial).
- Adapta estrutura ao tamanho escolhido.
- Base: tipos-de-post + frameworks-copy + hooks-bank + cta-bank + expression + regras.

### 3. reels-creator (Tier 1)
- DNA do BLAZE completo.
- Framework: HOOK -> RETENCAO -> 2o HOOK -> CONTEUDO -> MORAL + CTA.
- 7 padroes virais, 500+ hooks, direcao cinematografica.
- Base: reels-framework + reels-patterns + reels-swipefile + oraculo-reels.

### 4. stories-strategist (Tier 1)
- 7 categorias: Lifestyle, Posicionamento, Insights, Bastidores, Cases, Caixinha, Levantada de Mao.
- Sequencias com intencao de conversao.
- Base: nucleo + expression.

### 5. content-planner (Tier 2)
- 5 niveis de consciencia de Schwartz.
- Mix: 50% Tensao / 25% Alinhamento / 25% Demonstracao.
- Gera 25 ideias por ciclo, calendario editorial.
- Base: planejamento + proporcoes.

### 6. content-validator (Tier 2)
- Oraculo unificado. Valida carrosseis (12 testes) E Reels (3 niveis).
- Score >= 80% para aprovar. Reescreve se reprovar.
- Checa: cliches, max palavras, perguntas no titulo, etc.
- Base: oraculo-posts + oraculo-reels + cliches + regras.

---

## 7 TIPOS DE POST (Narrativa) - Do IMPERADOR

### 1. Imperial
- Tom: Dominante, doutrinario
- Objetivo: Narrativa completa Reptiliano -> Limbico -> Neocortex
- Estrutura 10 slides: Hook Brutal -> Inimigo Silencioso -> Dualidade -> Crenca Errada -> Nova Crenca -> O Vilao -> Novo Caminho -> Cenario Real -> A Oportunidade -> Comando Direto

### 2. Polemico
- Tom: Provocativo, controverso
- Objetivo: Polarizar audiencia, criar inimigos e aliados
- Estrutura: Gancho Polemico -> Contexto+Conflito -> Defesa da Tese -> Storytelling -> Reflexao/Provocacao -> Conclusao -> CTA

### 3. Crenca
- Tom: Revelador, conspiratorio
- Objetivo: Desconstruir crenca antiga -> implantar nova
- Estrutura: Titulo Curioso -> Contexto -> Crenca certa/errada -> Tese -> CTA

### 4. Problema
- Tom: Empatico, direcionado
- Objetivo: Amplificar dor -> solucao especifica
- Estrutura: Titulo Impactante -> Problema Interno -> Empatia -> Solucao -> Aspiracao -> Prova -> Objecao -> Autoridade -> Tese com Esperanca -> CTA

### 5. Curiosidade
- Tom: Misterioso, intrigante
- Objetivo: Suspense -> Revelacao -> Acao
- Estrutura: Titulo Curioso -> Desejo e Problema -> Imagine -> Ceu -> Ceu -> Conflito -> Conflito -> Problema -> Tese -> CTA

### 6. Historia
- Tom: Intimo, vulneravel controlado
- Objetivo: Conexao profunda, Identificacao -> Transformacao
- Estrutura: Titulo Curioso -> [narrativa pessoal ou de terceiros] -> Tese -> CTA

### 7. Oferta
- Tom: Tensao invisivel
- Objetivo: Vende com copy embutida

---

## 9 FRAMEWORKS DE COPY (Abordagem) - Do BRANDCONTENT

### 1. Abertura Curiosa
- Gatilho: Curiosidade + Loop de Incompletude
- Quando: Insights contraintuitivos, reinterpretacoes, promessas escondidas

### 2. Autoridade
- Gatilho: Prova Social Implicita + Validacao Antecipada
- Quando: Reforcar posicao de especialista, bastidores de resultados

### 3. Beneficio Direto
- Gatilho: Antecipacao + Clareza + Economia Cognitiva
- Quando: Entrega pratica, hacks, estrategias passo a passo

### 4. Pergunta Impactante
- Gatilho: Disruptividade + Interrupcao de Padrao + Autorreconhecimento
- Quando: Gerar conflito interno, quebra de objecao, mudanca de mentalidade

### 5. Testemunho Real
- Gatilho: Prova Social + Autoridade Transferida + Validacao Emocional
- Quando: Validar impacto de metodo, mostrar antes/depois

### 6. Lista Valiosa
- Gatilho: Escaneabilidade + Clareza de Valor + Antecipacao por Volume
- Quando: Valor direto, hacks, insights praticos, mini tutoriais

### 7. Problema e Solucao
- Gatilho: Consciencia de Dor + Alivio Emocional + Jornada de Transformacao
- Quando: Conteudos educativos, gerar aha moments

### 8. Passo a Passo
- Gatilho: Simplicidade + Microconquistas Mentais + Sensacao de Controle
- Quando: Intencao pratica, frameworks, tutoriais, metodos exclusivos

### 9. Segredo Revelado
- Gatilho: Exclusividade + Curiosidade Avancada + Transferencia de Poder
- Quando: Autoridade implicita, bastidores, virada de chave

---

## 5 TIPOS DE ABERTURA PODEROSA (Do BRANDCONTENT)

1. Curiosidade - Abrir loops, lacuna de informacao
2. Provocacao - Quebrar padroes, gerar dissonancia
3. Autoridade - Transferir credibilidade, abrir com validacao
4. Identificacao - Gerar empatia, espelhar dores/frustracoes
5. Beneficio Direto - Mostrar ganho claro e pratico

---

## 4 INTENCOES DE CONTEUDO

1. Atracao - Viralizar, alcance
2. Consciencia - Educar sobre o problema
3. Aquecimento - Criar desejo e conexao
4. Venda - Converter

## PROPORCAO DE CONTEUDO (Torriani)
- 50% Tensao | 25% Alinhamento | 25% Demonstracao

---

## REGRAS INVIOLAVEIS

- Slide 1: max 15 palavras, jamais pergunta, contraintuitivo
- Slides 2-10: max 30 palavras por slide
- Cliches proibidos (lista do cliches.pdf)
- Nunca revelar solucao cedo
- Nunca usar "eu" - falar do mercado ou da pessoa
- 3 variacoes de headline obrigatorias (2 virais + 1 imperial)
- CTA: nunca "clique aqui" - comando moral + palavra-chave
- Sempre validar pelo Oraculo antes de entregar

---

## 7 ETAPAS DE CRIACAO (Workflow)

1. BRIEFING: Tema + publico + crenca + contexto
2. CONFIGURACAO: Formato + Intencao + Tipo de Post + Abordagem de Copy + Tamanho
3. HEADLINE: 3 opcoes (2 virais + 1 imperial), usuario seleciona
4. ARGUMENTACAO: Fatos/argumentos + progressao emocional + framework aplicado
5. CTA: 3 opcoes alinhadas com intencao, usuario seleciona
6. VALIDACAO: Oraculo (score >= 80%), reescreve se reprovar
7. ENTREGA: Post formatado + caption + sugestoes de repurpose

---

## ADAPTACAO POR TAMANHO

- 1 slide: Hook unico + CTA
- 3 slides: Hook -> Argumento -> CTA
- 5 slides: Hook -> Build-up -> Climax -> Resolucao -> CTA
- 7 slides: Hook -> 2 Build-up -> Climax -> Nova crenca -> Resolucao -> CTA
- 10 slides: Estrutura completa do tipo escolhido

---

## BLAZE - FRAMEWORK DE REELS

### Estrutura Oficial (por segundos):
- BLOCO 1 - HOOK (0-3s): Parar scroll, max 1.5s ideal
- BLOCO 2 - RETENCAO (3-30s): Contextualizar, storytelling ABT
- BLOCO 3 - SEGUNDO HOOK (30-40s): Re-engajar quem ia sair
- BLOCO 4 - CONTEUDO PRINCIPAL (40-70%): Valor/historia/revelacao
- BLOCO 5 - CTA + MORAL (final): Fechamento com acao clara

### 7 Padroes Virais:
1. Contraintuitivo
2. Segredo
3. Confissao
4. Urgencia
5. Prova Imediata
6. Tribal
7. Meta

### 3 Principios Operacionais:
1. Retencao Forcada - Nunca entregar resposta completa no hook
2. Movimento/Causa - Conectar a um movimento maior
3. Sentimento Climatico - Gerar 1 dos 5 sentimentos-chave

---

## ORDEM DE CONSTRUCAO

1. data/ - Converter materiais dos GPTs
2. agents/content-chief.md - Orchestrador
3. agents/carousel-creator.md - Core
4. agents/reels-creator.md - BLAZE
5. agents/content-validator.md - Oraculo
6. agents/stories-strategist.md
7. agents/content-planner.md
8. tasks/ - Workflows
9. checklists/ - Validacao
10. config.yaml + README.md

---

## FONTES ORIGINAIS (Paths)

- IMPERADOR: /Users/julianotorriani/Library/CloudStorage/Dropbox/[AGENTES GPT]/AGENTE IMPERADOR/
  - DOCS: DOCS IMPERADOR/ (NARRATIVAS.md, HOOKS.md, VALIDATOR.md, ORACULO.md, NUCLEO.md, EXPRESSION.md, PLANEJAMENTO.md, + PDFs)
  - PROMPTS: PROMPTS IMPERADOR/ (prompt-imperador-v9.md e outros)
- BLAZE: /Users/julianotorriani/Library/CloudStorage/Dropbox/[AGENTES GPT]/AGENTE BLAZE/
  - KNOWLEDGE: KNOWLEDGE-BLAZE/ (01-FRAMEWORK-ROTEIRO-REELS.md, 02-frameworks-ganchos-virais.md, 05-swipe-file-ganchos-virais.md, 20-ORACULO-REELS.md)
  - PROMPT: promtp-BLAZE-27102025.md
- BRANDCONTENT: /Users/julianotorriani/Library/CloudStorage/Dropbox/[AGENTES GPT]/BRANDCONTENT/
  - O CODIGO ESCONDIDO NA COPY DOS CARROSSEIS.pdf (9 frameworks + 5 aberturas)
- Posts Intencionais: AGENTE IMPERADOR/como-criar-posts-intencionais.pdf

## NARRATIVAS COMPLETAS JA EXTRAIDAS

O arquivo completo de narrativas (todos os 7 tipos com estrutura slide-a-slide) foi salvo em:
/Users/julianotorriani/.claude/projects/-Users-julianotorriani-claude-legacy/17d2910e-bbe8-45be-9ca0-d51895327612/tool-results/toolu_01NJwp1eMmtokLRxFwNSsuFm.txt

---

## INSTRUCAO PARA PROXIMA SESSAO

Apos /clear, ler este arquivo e comecar a construcao na ordem definida.
Para cada arquivo data/, ler a fonte original e converter para formato do squad.
Comecar pelo data/ pois todos os agents dependem dele.
