# Atomizar Conteudo Pilar

name: atomize-content
description: Extrair atomos de conteudo de 1 peca pilar (video, live, artigo, podcast) e gerar 10-30 briefs de micro-conteudo para diferentes formatos
elicit: true

## INPUTS

- **Conteudo pilar:** video, live, artigo, podcast ou post longo (obrigatorio)
- **Transcricao:** texto completo se o pilar for video/audio (obrigatorio se video/audio)
- **Tema central:** assunto principal do conteudo pilar (obrigatorio)
- **Publico:** avatar especifico que consome o conteudo (obrigatorio)
- **Formatos desejados:** carrossel, reels, stories, post unico, frase de impacto, email (opcional — default: todos)
- **Quantidade alvo:** numero de micro-pecas desejadas (opcional — default: 15-20)
- **Intencao dominante:** atracao, consciencia, aquecimento, venda (opcional — distribui automaticamente)
- **Fonte original:** URL YouTube, live, podcast, artigo (opcional — para rastreabilidade)

## STEPS

### Etapa 1: Analise do Pilar
1. Ler/analisar o conteudo pilar completo
2. Identificar o tema central e subtemas abordados
3. Mapear a estrutura do conteudo (introducao, desenvolvimento, conclusao)
4. Avaliar se o pilar tem substancia suficiente (minimo 3 insights acionaveis)
5. Se nao tem substancia → VETO, explicar e pedir conteudo mais robusto

### Etapa 2: Extracao de Atomos
6. Extrair **insights acionaveis** — ideias que o publico pode aplicar imediatamente
7. Extrair **quotes de impacto** — frases memoraveis, provocativas ou contraintuitivas. EXTRAIR TODAS — nao limitar a 5. Um video de 1h tem 15-25 frases quotable.
8. Extrair **dados e provas** — estatisticas, resultados, cases mencionados
9. Extrair **historias** — narrativas, exemplos, analogias usadas
10. Extrair **provocacoes** — crencas quebradas, mitos derrubados, verdades incomodas
11. Extrair **frameworks** — modelos, passos, processos explicados
12. Classificar cada atomo: [insight | quote | dado | historia | provocacao | framework]

### Etapa 2B: Extracao de Cortes de Video (se fonte for video)
13. Mapear **timestamps de cortes** — trechos do video que funcionam ISOLADOS como conteudo
14. Para cada corte, registrar:
    - Timestamp inicio (min:seg)
    - Timestamp fim (min:seg)
    - Duracao estimada
    - Tema/ideia central do corte
    - Por que funciona isolado (gancho forte, historia completa, framework explicado)
15. Objetivo: 10-15 cortes por hora de video
16. Cortes sao complementares aos roteiros de Reels — Reels sao criados do zero, cortes sao trechos originais

### Etapa 2C: Resumo Pre-Criacao
17. Para CADA atomo extraido, gerar resumo pre-criacao:
    - 2-3 opcoes de titulo
    - Preview dos primeiros 2-3 slides (carrossel) ou primeiros 3-6 segundos (reels)
    - Angulo de abordagem em 1 linha
18. Este resumo e OBRIGATORIO e sera apresentado ao usuario ANTES de criar qualquer peca
19. Apresentar lista completa ao usuario: "1. Confirmar, 2. Ajustar, 3. Adicionar mais"

### Etapa 3: Mapeamento Atomo → Formato
20. Para cada atomo, definir o formato mais adequado:
    - **Insight acionavel** → Carrossel (estrutura passo a passo) ou Reels (explicacao rapida)
    - **Quote de impacto** → Frase de impacto (quote card feed + stories) ou Post unico
    - **Dado/prova** → Carrossel (antes/depois, comparacao) ou Reels (revelacao)
    - **Historia** → Reels (narrativa curta) ou Carrossel (arco narrativo) ou Email (narrativa longa)
    - **Provocacao** → Post unico (afirmacao chocante) ou Reels (hot take) ou Frase de impacto
    - **Framework** → Carrossel (passo a passo visual) ou Reels (tutorial rapido)
    - **Insight profundo** → Email (handoff Squad Copywriters — gerar brief, nao criar email)
15. Definir tipo de post para cada peca (imperial, polemico, crenca, problema, curiosidade, historia, oferta)
16. Definir intencao de cada peca (atracao, consciencia, aquecimento, venda)

### Etapa 4: Geracao de Briefs
17. Para cada atomo mapeado, gerar um brief contendo:
    - Titulo/tema do micro-conteudo
    - Formato definido (carrossel, reels, stories, post unico)
    - Tipo de post e framework de copy recomendados
    - Intencao (atracao, consciencia, aquecimento, venda)
    - Angulo de abordagem (como esse atomo sera apresentado)
    - Hook sugerido (1 linha de abertura)
    - CTA sugerido
    - Notas de execucao (duracao se reels, num slides se carrossel)
18. Ordenar briefs por prioridade (alto impacto primeiro)
19. Garantir variedade de formatos (nao mais que 40% no mesmo formato)
19b. **PROPORCIONALIDADE:** se tem X carrosseis, deve ter proporcionalmente X briefs de email, stories e frases. Nao faz sentido ter 24 carrosseis e 1 email.
19c. **CADA atomo pode gerar MULTIPLOS formatos** — um insight pode virar carrossel + reel + email

### Etapa 5: Entrega
20. Entregar lista completa de briefs organizados por formato
21. Incluir resumo quantitativo (total por formato, por intencao, por tipo)
22. Sugerir ordem de criacao (prioridade)
23. Indicar quais briefs podem virar serie de conteudo conectada

## VETO CONDITIONS

- Se conteudo pilar tem menos de 3 insights acionaveis → NAO executar, pedir conteudo mais robusto
- Se nao tem as 3 informacoes obrigatorias (pilar, tema, publico) → NAO executar, perguntar
- Se mais de 40% dos atomos caem no mesmo formato → Redistribuir antes de entregar
- Se algum brief nao tem hook sugerido → Completar antes de entregar
- Se algum brief parece copia direta do pilar (sem adaptacao) → Reescrever com angulo proprio
- Se tom nao e imperial → Reescrever no tom correto
- Se usa palavras proibidas (segredo, dica, truque, hack, simples, facil) → Substituir
- Se brief nao funciona isoladamente (depende de contexto do pilar) → Ajustar para independencia

## OUTPUT EXAMPLE

```
ATOMIZACAO: Conteudo Pilar → Micro-Conteudos
PILAR: Live sobre posicionamento de marca (47 min)
TEMA: Posicionamento como arma de conversao
PUBLICO: Empreendedores digitais 5-15k/mes
TOTAL ATOMOS: 18

RESUMO:
- Carrosseis: 6
- Reels: 5
- Stories: 4
- Frases de impacto: 3
- Briefs de email (handoff copywriters): 2
- Posts unicos: 1

---

BRIEF #1 [PRIORIDADE ALTA]
Atomo: "95% dos empreendedores sao invisiveis pro comprador certo"
Tipo: Provocacao
Formato: Carrossel (10 slides)
Tipo de post: Imperial
Framework: Abertura Curiosa
Intencao: Consciencia
Angulo: Atacar a crenca de que "postar mais = vender mais"
Hook: "Voce posta todo dia e ninguem compra. O problema nao e o conteudo."
CTA: "Comenta POSICIONAMENTO se voce quer sair da invisibilidade"
Notas: 10 slides, progressao reptiliano → limbico → neocortex

BRIEF #2 [PRIORIDADE ALTA]
Atomo: "Cliente saiu de 3k pra 47k em 60 dias com reposicionamento"
Tipo: Dado/Prova
Formato: Reels (45s)
Tipo de post: Historia
Framework: Testemunho Real
Intencao: Aquecimento
Angulo: Case real com numeros concretos
Hook: "3 mil por mes. Mesmo publico. 60 dias depois: 47 mil."
CTA: "Link na bio pra entender como"
Notas: Roteiro 45s, talking head com cortes dinamicos

BRIEF #3 [PRIORIDADE MEDIA]
Atomo: "Consistencia sem posicionamento e barulho"
Tipo: Quote de impacto
Formato: Post unico
Tipo de post: Polemico
Framework: Pergunta Impactante
Intencao: Atracao
Angulo: Provocar quem posta muito e vende pouco
Hook: "Consistencia sem posicionamento e trabalho escravo digital."
CTA: "Salva e manda pra quem precisa ouvir isso"
Notas: Imagem com fundo escuro + quote centralizada

[... briefs 4-18 ...]

SERIES SUGERIDAS:
- Briefs #1, #4, #9 formam serie "Posicionamento em 3 atos"
- Briefs #2, #7 formam serie "Cases de transformacao"

ORDEM DE CRIACAO RECOMENDADA:
1. Brief #1 (carrossel — ancora da atomizacao)
2. Brief #2 (reels — prova social)
3. Brief #3 (post unico — rapido de produzir)
[...]
```

## COMPLETION CRITERIA

- Todas as etapas executadas na ordem (analise → extracao → mapeamento → briefs → entrega)
- Minimo 10 atomos extraidos e classificados (video de 1h+ deve ter 30-50 atomos)
- Cortes de video mapeados com timestamps (se fonte for video)
- Resumo pre-criacao gerado para CADA atomo (titulo + preview)
- Cada atomo classificado por tipo (insight, quote, dado, historia, provocacao, framework)
- Cada brief com formato, tipo de post, framework, intencao, hook e CTA definidos
- Variedade de formatos (max 40% no mesmo formato)
- Briefs ordenados por prioridade
- Resumo quantitativo incluido
- Series de conteudo identificadas quando aplicavel
- Tom imperial consistente em todos os hooks e CTAs
- Nenhum brief depende do pilar para fazer sentido (independencia)

## REFERENCES

- data/tipos-de-post.md — 7 tipos de post com estrutura completa por slides
- data/frameworks-copy.md — 9 frameworks de copy + matriz tipo x framework
- data/oraculo-posts.md — 9 etapas de validacao + 12 testes
- data/oraculo-reels.md — framework de validacao de reels
- data/hooks-bank.md — banco de hooks para referencia
- data/posts-intencionais.md — 6 principios de posts intencionais
- data/estrategias.md — 8 estrategias de campanha com cronograma
- data/regras-inviolaveis.md — regras de tom e linguagem
- data/cliches-proibidos.md — palavras e expressoes proibidas
