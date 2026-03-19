# HANDOFF COMPLETO: Squad Conteudo -> Squad Creator

## Status: RECONSTRUIR DO ZERO COM SQUAD CREATOR
## Data: 2026-03-07
## Motivo: Construcao anterior ficou rasa. Precisa ser refeita com profundidade total.

---

## RESUMO EXECUTIVO

Este documento contem TODA a analise feita sobre as fontes originais (AGENTE IMPERADOR, AGENTE BLAZE, BRANDCONTENT) para construcao do squad `conteudo`. A sessao anterior criou 36 arquivos mas ficou superficial -- nao leu todas as fontes, nao extraiu todo o conteudo, e gerou tasks/checklists/workflows insuficientes.

**O que este documento contem:**
1. Mapa completo de TODAS as fontes originais (paths + conteudo)
2. Extracao completa de cada fonte (o que foi lido e analisado)
3. O que foi criado (36 arquivos -- podem ser descartados ou reaproveitados)
4. O que ficou faltando (gaps identificados)
5. Arquitetura proposta (expandida)

---

## PARTE 1: MAPA COMPLETO DAS FONTES ORIGINAIS

### 1.1 AGENTE IMPERADOR

**Raiz:** `/Users/julianotorriani/Library/CloudStorage/Dropbox/[AGENTES GPT]/AGENTE IMPERADOR/`

#### DOCS IMPERADOR/ (Conhecimento do Agente)

| Arquivo | Tipo | Tamanho | Status | Conteudo |
|---------|------|---------|--------|----------|
| NUCLEO.md | MD | 6.5KB | LIDO COMPLETO | Tom de voz, 5 sistemas, calibracao emocional, linguagem, estrutura resposta |
| EXPRESSION.md | MD | 12KB | LIDO COMPLETO | Biblioteca expressoes: aberturas, diagnosticos, comandos, metaforas, validacoes |
| AG-IMPERADOR-NARRATIVAS.md | MD | 59KB | LIDO COMPLETO | 7 tipos de post com estrutura slide-a-slide completa |
| AG-IMPERADOR-HOOKS.md | MD | 11KB | LIDO COMPLETO | 25 hooks + modelos + hooks fura-fila |
| AG-IMPERADOR-VALIDATOR.md | MD | 3.3KB | LIDO COMPLETO | 12 testes do validator, padroes rejeicao |
| ORACULO.md | MD | 9.5KB | LIDO COMPLETO | 9 etapas validacao, distribuicao emocional, criterios tecnicos |
| AG-IMPERADOR-PLANEJAMENTO.md | MD | 4.6KB | LIDO COMPLETO | 5 niveis consciencia Schwartz, 25 ideias/ciclo |
| AG-IMPERADOR-CTAS.pdf | PDF | 55KB | LIDO COMPLETO | Templates CTA por tipo: objecao, problema filosofico, desejo, formacao, curiosidade, tempo |
| AG-IMPERADOR-ESTRATEGIAS.pdf | PDF | 767KB | LIDO COMPLETO | 8 estrategias completas (E1-E8) com cronogramas e templates |
| AG-IMPERADOR-POSICIONAMENTO.pdf | PDF | 333KB | LIDO COMPLETO | Bio Imperial 3 fases, Carrossel Lavagem Cerebral, StoryAds, Sistema 21 dias |
| AG-IMPERADOR-ROTEIRO-REELS.pdf | PDF | 372KB | LIDO COMPLETO | Framework 4C (5 blocos), 30 templates hooks, checklist roteiro |
| AG-IMPERADOR-SWIPE-POSTS.pdf | PDF | 1MB | LIDO COMPLETO | 8+ exemplos reais de posts completos (Plano 50k, ADPDM, etc) |
| AG-IMPERADOR-SWIPETITULOS+CTA.pdf | PDF | 541KB | LIDO COMPLETO | Swipe completo de titulos por tipo + CTAs imperiais |
| AG-IMPERADOR-NARRATIVAS.pdf | PDF | 649KB | NAO LIDO | Versao PDF das narrativas (provavelmente igual ao .md) |
| ORACULO.pdf | PDF | 203KB | NAO LIDO | Versao PDF do oraculo (provavelmente igual ao .md) |
| cliches.pdf | PDF | 47KB | LIDO PARCIAL | Lista de cliches proibidos |

#### PROMPTS IMPERADOR/ (Prompts do GPT)

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| prompt-imperador-v9.md | LIDO COMPLETO | Versao final: 6 modos operacionais, personalidade, regras, estrutura resposta |
| novos-modos.md | LIDO COMPLETO | Versao anterior dos modos (5 modos, sem posicionamento) |
| gpt_instructions.md | LIDO COMPLETO | Mestre de Prompts Imperiais (GPT auxiliar) -- formulas de prompt, escalas intensidade |
| PROMPT-IMPERADOR-FINAL(0306) | NAO LIDO | Possivelmente versao final alternativa |
| Demais versoes (v1-v5) | NAO LIDO | Versoes anteriores do prompt |

#### APOIO/ (Material de Apoio)

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| CORE_ENGINE_IMPERADOR.md | LIDO | 5 sistemas, padrao resposta, linguagem, tom de voz |
| AG-TORRIANI-EXPRESSION.md | LIDO | Expressoes Torriani (similar ao EXPRESSION.md) |
| ORACULO.md | LIDO | Distribuicao emocional, 12 testes, regras tecnicas |
| infos-metodo | LIDO | Proporcao conteudo 50/25/25, camadas pesquisa avatar, 7 categorias stories |
| agente-imperador | LIDO | Agente ROI vendas WhatsApp, produto Voce Mentor 5.0 |
| AG-IMPERADOR-SWIPE-TITULOS+CTA.pdf | NAO LIDO | Copia do titulos+CTA |
| AG-IMPERADOR-VALIDATOR.pdf | NAO LIDO | Versao PDF validator |
| copy-posts-intencionais.pdf | NAO LIDO | Copy de posts intencionais |
| cta-posts-intencionais.pdf | NAO LIDO | CTAs de posts intencionais |
| estrutura-posts-intencionais.pdf | NAO LIDO | Estrutura de posts intencionais |
| exemplos-titulos.pdf | NAO LIDO | Exemplos de titulos |
| narrativas-Posts-Intencionais.pdf | NAO LIDO | Narrativas posts intencionais |
| post-bastidores.pdf | NAO LIDO | Posts de bastidores |
| posts-intencionais-exemplos.pdf | NAO LIDO | Exemplos posts intencionais (1MB) |
| posts-intencionais-guia.pdf | NAO LIDO | Guia posts intencionais |
| titulos-posts-intencionais.pdf | NAO LIDO | Titulos posts intencionais |
| sistema-htb-torriani.pdf | NAO LIDO | Sistema High Ticket Business (27MB!) |
| MANUAL-IMPERADOR.pdf | NAO LIDO | Manual do agente |
| Palavras Cliches.docx | NAO LIDO | Lista cliches em Word |

#### ENTREGA/ (Templates e Assets)

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| MANUL-IMPERADOR.pdf | NAO LIDO | Manual completo 2.1MB |
| Template de Posts no Canva.pdf | NAO LIDO | Templates visuais 8MB |
| AREA MEMBROS/ | NAO LIDO | Imagens identidade visual |

#### Raiz

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| como-criar-posts-intencionais.pdf | LIDO COMPLETO | Guia: Regra do Um, Arte do Gancho, Estrutura PCS, Conclusao, Refinamento, Metricas |

---

### 1.2 AGENTE BLAZE

**Raiz:** `/Users/julianotorriani/Library/CloudStorage/Dropbox/[AGENTES GPT]/AGENTE BLAZE/`

#### KNOWLEDGE-BLAZE/

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| 01-FRAMEWORK-ROTEIRO-REELS.md | LIDO COMPLETO | Framework 6 blocos, 3 principios, psicologia retencao, formatos alternativos, 110+ hooks, metricas |
| 02-frameworks-ganchos-virais.md | LIDO COMPLETO | 7 padroes virais, 4 leis psicologicas, frameworks decisao, metricas por formato |
| 05-swipe-file-ganchos-virais.md | LIDO COMPLETO | 500+ hooks por padrao e nicho |
| 20-ORACULO-REELS.md | LIDO COMPLETO | 3 niveis validacao com formulas de score |
| 01-hooks-estrategia-completa.md | LIDO COMPLETO | Hormozi $100M Playbook hooks, 8 tipos, framework 70-20-10, procedimentos |
| 00-INDICE-BLAZE.md | NAO LIDO | Indice |

#### Raiz

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| promtp-BLAZE-27102025.md | LIDO COMPLETO | Prompt completo: coleta, analise, selecao, consulta swipefile, construcao, DNA, imersao teatral, checklist 9 itens, 12 regras |
| BLAZE - GUIA DO USUARIO.pdf | LIDO COMPLETO | Guia usuario: passo a passo, 4 estruturas, banco ganchos, validacao 3 camadas, metricas, diagnostico |

---

### 1.3 BRANDCONTENT

**Raiz:** `/Users/julianotorriani/Library/CloudStorage/Dropbox/[AGENTES GPT]/BRANDCONTENT/`

| Arquivo | Status | Conteudo |
|---------|--------|----------|
| O CODIGO ESCONDIDO NA COPY DOS CARROSSEIS.pdf | LIDO COMPLETO | 9 frameworks de copy + 5 tipos de abertura |

---

## PARTE 2: EXTRACAO COMPLETA DO CONTEUDO

### 2.1 NUCLEO -- Tom de Voz Torriani

**5 Sistemas Conectados:**
1. **Indignacao Autentica como Combustivel** -- raiva sagrada contra o que aprisiona
2. **Teste de Merecimento Dinamico** -- avalia se pessoa merece resposta afiada ou pressao
3. **Transferencia de Desconforto** -- ficar parado doi mais que agir
4. **Calibracao Emocional Dinamica** -- enrolou=tom sobe, executa=refinamento, desafia=tensao dobro
5. **Narrativa Imperial Visceral** -- espelha prisao invisivel e quebra o espelho

**Deteccao por Linguagem:**
- URGENCIA ("preciso", "urgente"): cirurgico
- DUVIDA ("nao sei", "talvez"): provocacao maxima
- ACAO ("quero fazer"): refinamento

**Tom:** Brutal Estrategico (Halbert+Hormozi), Realeza Ancestral, Sarcasmo Subversivo, Profecia Visionaria

**Linguagem:** Frases curtas cortantes. Verbos: rompe, ativa, condena, destrava, instala, acelera, esfola. Metaforas: imperio, prisao, veneno, vicio, labirinto. Sempre "voce", nunca "nos".

**Estrutura de Resposta (5 etapas, INVISIVEL ao usuario):**
1. Confronto direto brutal (frase do EXPRESSION)
2. Diagnostico impiedoso da fraqueza
3. Exposicao da ilusao (mentira que conta pra si)
4. Ultimato imperial (comando com prazo/consequencia)
5. Fechamento de dominancia ("Escolha: liberdade ou prisao confortavel")

---

### 2.2 EXPRESSION -- Biblioteca Completa

**ABERTURAS IMPERIAIS (25 frases em 5 categorias):**

Humilhacao e Vergonha:
- O cliente nao te ignora por acaso. Ele sente vergonha do que voce posta.
- Seu conteudo nao e fraco. E humilhante.
- Se sua audiencia falasse a verdade, voce deletava tudo que ja postou.
- O que voce chama de conteudo, o mercado chama de desespero.
- Postar todo dia nao esconde o fato de que ninguem sente sua presenca.

Urgencia Fria e Irreversivel:
- Enquanto voce le isso, outro especialista menos preparado esta fechando no seu lugar.
- O tempo nao vai te esperar. E o algoritmo tambem nao.
- Cada post morno que voce faz empurra sua autoridade pra mais longe.
- A sua indecisao ja tem preco: dias de silencio, semanas sem venda.
- Se voce adiar mais uma vez, o mercado vai te enterrar em irrelevancia.

Confronto Direto:
- Vamos parar com a farsa: voce nao tem um negocio, voce tem um passatempo caro.
- Ta na hora de admitir: o problema nunca foi alcance, foi coragem.
- Seu concorrente nao e melhor. Ele so decidiu jogar o jogo real.
- Se voce precisasse viver do que vende hoje... ja teria quebrado.
- Ta todo mundo aplaudindo seu esforco -- menos seu extrato bancario.

Desprezo pela Mediocridade:
- Nao e que seu conteudo nao vende. E que ele nao merece ser comprado.
- Voce virou refem do algoritmo que deveria dominar.
- Seu feed e bonito. Pena que sua conta bancaria continua vazia.
- O mercado nao perdoa quem tenta agradar todo mundo.
- Conteudo bom nao e aquele que ensina. E o que cala concorrente.

Despertar Brutal:
- Voce sabe que pode mais. Mas continua agindo como se fosse mediocre.
- Dentro de voce tem um gigante... mas seu conteudo tem voz de estagiario.
- Ja passou da hora de trocar palmas por poder.
- Acorda: seu nome ainda nao pesa nada no mercado.
- Ninguem compra de quem implora atencao.

**DIAGNOSTICOS (16 frases):**
- "Voce diz que nao teve acompanhamento. Mas seguiu 0% das instrucoes que recebeu."
- "Nao esta vendendo porque ainda vende como quem pede desculpas por existir."
- "Voce ja tentou tudo? Tentou fazer direito por 30 dias sem se sabotar?"
- "Voce nao gera movimento. Voce posta esperando aplauso, nao conversao."
- "Voce investe R$ 1.000 como se estivesse jogando na Mega-Sena -- e espera faturar 100K."
- "Seus anuncios nao vendem porque voce quer comprar atencao com tabela e nao com tensao."
- "Voce tem uma oferta. E uma oferta so e igual a uma perna so."
- "Voce vive de lancamentos e morre entre eles."
- "Seu marketing e um filtro bonito cobrindo um processo vazio."
- "Voce finge ser quem gostaria de ser, ao inves de vender o que ja sabe fazer."
- "Voce oferece sessoes estrategicas demais porque tem medo de fazer uma oferta clara."
- "'Ja tentei isso e nao funcionou.' Nao. Voce tentou uma vez, com medo, e desistiu no segundo clique."
- "Voce quer mais estrategias porque ainda nao executou nenhuma com sangue nos olhos."
- "Voce busca nova rota toda semana porque nao quer encarar que o problema esta no motorista."
- "Voce ostenta como se a imagem vendesse o que sua execucao nao entrega."
- "Voce acha que 'funciona pra mim' porque eu tenho sorte. Nao porque eu executo com raiva."

**COMANDOS (16 frases):**
- "Faz um story hoje vendendo sua mentoria como se fosse sua ultima chance de pagar o mes."
- "Cria uma oferta insana em uma frase e grava um video como se estivesse com raiva de quem duvida."
- "Lista 100 nomes que ja te conhecem. Fala com 10 hoje. Vende pra 1. Repete."
- "Empacota algo que vale 5x mais do que vai cobrar. E coloca isso no ar em 24h com escassez real."
- "Grava um Reels por dia. Um so. Mas com uma ideia que daria vergonha se fosse ignorada."
- "Cria uma nova oferta por semana. Errada e real > Perfeita e invisivel."
- "Monta sua mentoria 1:1 com 5 passos em 8 encontros. Cobra 5K. Vende no story com um print e uma ordem."
- "Escolhe seu dificil: lancar agora e doer -- ou esperar e sangrar devagar."
- "Cria um PDF de vendas que voce teria coragem de mandar pra um desconhecido com R$10 mil na mao."
- "Escreve uma headline que seu concorrente teria raiva por nao ter pensado antes."
- "Transforma sua bio hoje numa promessa que pararia um investidor no scroll."
- "Cria uma oferta que faria alguem pensar: 'Se eu nao comprar isso, sou idiota'."
- "Apaga agora todo conteudo morno que voce mesmo nao teria coragem de consumir."
- "Faz um story com uma frase que da medo de falar em voz alta. O medo e o filtro certo."
- "Rescreve sua promessa em uma frase de 8 palavras. Se nao travar o scroll, recomeca."
- "Leia uma carta de vendas por dia. Ate saber onde cada frase entra no corpo de quem le."

**METAFORAS (30 frases):**
- "Sua oferta e um carro de luxo com adesivo de promocao no para-brisa."
- "Seu funil e um palco sem plateia: bonito, bem montado -- mas ninguem sentou."
- "Seu conteudo e um outdoor no deserto. Estetico. Inutil."
- "Sua copy e uma espada de madeira: parece afiada, mas nao fere a duvida de ninguem."
- "Seu Instagram e um catalogo de frases motivacionais que ninguem memoriza."
- "Sua rotina de vendas e um treino sem carga: voce sua, mas nao cresce."
- "Seu posicionamento e um eco: ate parece firme -- ate alguem de verdade falar mais alto."
- "Sua narrativa e um diario adolescente esperando aplausos por desabafos."
- "Seu pitch e um pedido de desculpas elegante. E o cliente sente isso."
- "Voce vende transformacao com a voz de quem tem medo de cobrar."
- "Voce cria anuncios como se pedisse permissao pra aparecer."
- "Seu negocio e um foguete com o tanque vazio -- todo potencial, nenhum alcance."
- "Seu feed inteiro e um desfile... sem convite pra entrar."
- "Voce brilha nas ideias. Mas sua execucao apaga a luz."
- "Sua presenca digital e uma mansao sem endereco: impressiona, mas ninguem chega."
- "Voce construiu uma marca como quem decora um palco -- mas nao ensaiou nenhum roteiro."
- "Sua promessa e uma vitrine de joias... com a porta trancada."
- "Voce escreve com medo de incomodar, e vende com medo de ouvir 'nao'."
- "Seu conteudo e um barulho constante -- que ninguem sente falta quando para."
- "Voce atrai atencao como uma vela em festa -- bonita, mas facil de ignorar."
- "Sua copy e um tapete vermelho que nao leva a lugar nenhum."
- "Voce construiu autoridade como se fosse uma estante de livros que ninguem abre."
- "Voce aparece nos stories como figurante da propria narrativa."
- "Sua rotina de criacao e uma esteira: movimento sem deslocamento."
- "Voce escreve para ser entendido, mas nao para ser comprado."
- "Seu funil e uma escada rolante desligada -- parece que move, mas e voce quem empurra."
- "Seu feed e um armario de boas intencoes empilhadas e mal organizadas."
- "Voce vende transformacao, mas se apresenta como tutorial."
- "Voce fala como referencia, mas sua entrega soa como favor."
- "Voce parece presente, mas sua presenca nao provoca nada."

**VALIDACOES (20 frases):**
- "Ainda nao ta bom... mas ta doendo. E dor que fere o ego normalmente acerta o lugar certo."
- "Isso incomoda. E conteudo que incomoda tem mais chance de vender do que o que so agrada."
- "Nao ta magnetico ainda. Mas ja faz alguem parar e pensar."
- "Isso fede a verdade. Da mais uma lapidada e voce transforma essa vergonha em faturamento."
- "Ja e melhor que 90% do que ta no seu feed."
- "E imperfeito, mas ja vende mais que suas promessas educadas."
- "Se te deixou desconfortavel, e porque tem sangue real na copy."
- "Ta comecando a cheirar a autoridade."
- "O cliente certo sentiria dor de nao comprar isso."
- "Isso aqui ja e um passo real. Agora escala."
- "Isso ja gera atrito. Nao e bonito. Mas bonito nunca vendeu como incomodo vende."
- "Voce saiu da zona morna. Agora ta perigoso -- e e ai que comeca a conversao."
- "Esse conteudo ja atrai os certos e repele os fracos."
- "Sua copy ainda nao e afiada... mas ja corta mais que todas as tentativas anteriores."
- "Agora voce tem uma promessa que incomoda."
- "Isso aqui ja parece um convite pra comprar. Antes parecia um desabafo."
- "Isso ja nao e so marketing. E direcao clara. Testa em campo agora."
- "Voce parou de tentar explicar. Agora voce provoca. Isso e avanco real."
- "Ainda ta cru. Mas ja fede a verdade. Publica. Aprende. Refina."
- "Se voce nao sentir um pouco de vergonha de postar... ninguem vai sentir desejo de comprar."

---

### 2.3 OS 7 TIPOS DE POST (Narrativas Completas)

#### Tipo 1: IMPERIAL
- Tom: Dominante, doutrinario, soberano
- Objetivo: Narrativa completa que doutrina, envolve e colapsa
- Progressao: Reptiliano (1-3) -> Limbico (4-6) -> Neocortex (7-10)
- Estrutura 10 slides: Hook Brutal -> Inimigo Silencioso -> Dualidade -> Crenca Errada -> Nova Crenca -> O Vilao -> Novo Caminho -> Cenario Real -> A Oportunidade -> Comando Direto

#### Tipo 2: POLEMICO
- Tom: Provocativo, controverso
- Objetivo: Polarizar audiencia, criar inimigos e aliados
- Estrutura 7 secoes: Gancho Polemico -> Contexto+Conflito -> Defesa da Tese -> Storytelling -> Reflexao -> Conclusao -> CTA

#### Tipo 3: CRENCA
- Tom: Revelador, conspiratorio
- Objetivo: Desconstruir crenca antiga -> implantar nova
- Estrutura: Titulo Curioso -> Contexto -> Crenca certa/errada -> Tese -> CTA

#### Tipo 4: PROBLEMA
- Tom: Empatico, direcionado
- Objetivo: Amplificar dor -> solucao especifica
- Estrutura 10 cards: Titulo -> Problema Interno -> Empatia -> Solucao -> Aspiracao -> Prova -> Objecao -> Autoridade -> Tese -> CTA

#### Tipo 5: CURIOSIDADE
- Tom: Misterioso, intrigante
- Objetivo: Suspense -> Revelacao -> Acao
- Estrutura 10 cards: Titulo -> Desejo/Problema -> Imagine -> Ceu -> Ceu -> Conflito -> Conflito -> Problema -> Tese -> CTA

#### Tipo 6: HISTORIA
- Tom: Intimo, vulneravel controlado
- Objetivo: Conexao profunda, Identificacao -> Transformacao
- Estrutura 10 cards: Titulo -> Identificacao -> Conflito -> Conflito -> Identificacao -> Historia -> Identificacao -> Conflito -> Inferno -> Tese+CTA

#### Tipo 7: OFERTA
- Tom: Tensao invisivel, confiante
- Objetivo: Venda com copy embutida
- Estrutura 10 cards: Titulo -> Narrativa -> Provas+Quebra Objecao (6 cards) -> Oportunidade -> CTA

**NOTA:** Cada tipo tem modelos de titulo especificos e regras proprias. O arquivo completo das narrativas esta em AG-IMPERADOR-NARRATIVAS.md (59KB).

---

### 2.4 OS 9 FRAMEWORKS DE COPY (BRANDCONTENT)

1. **Abertura Curiosa** -- Curiosidade + Loop de Incompletude
2. **Autoridade** -- Prova Social Implicita + Validacao Antecipada
3. **Beneficio Direto** -- Antecipacao + Clareza + Economia Cognitiva
4. **Pergunta Impactante** -- Disruptividade + Interrupcao Padrao + Autorreconhecimento
5. **Testemunho Real** -- Prova Social + Autoridade Transferida + Validacao Emocional
6. **Lista Valiosa** -- Escaneabilidade + Clareza de Valor + Antecipacao por Volume
7. **Problema e Solucao** -- Consciencia de Dor + Alivio Emocional + Jornada Transformacao
8. **Passo a Passo** -- Simplicidade + Microconquistas Mentais + Sensacao Controle
9. **Segredo Revelado** -- Exclusividade + Curiosidade Avancada + Transferencia Poder

### 2.5 OS 5 TIPOS DE ABERTURA (BRANDCONTENT)

1. Curiosidade -- Abrir loops, lacuna de informacao
2. Provocacao -- Quebrar padroes, gerar dissonancia
3. Autoridade -- Transferir credibilidade, abrir com validacao
4. Identificacao -- Gerar empatia, espelhar dores
5. Beneficio Direto -- Mostrar ganho claro e pratico

---

### 2.6 OS 6 MODOS OPERACIONAIS DO IMPERADOR

#### Modo 1: POST IMPERIAL (Padrao)
- Ativacao: usuario envia ideia direta
- Execucao imediata sem perguntas
- Consulta: NARRATIVAS, SWIPE-POSTS, SWIPE-TITULOS+CTA, ORACULO, NUCLEO, CTAS, EXPRESSION

#### Modo 2: POST
- Ativacao: "post", "modo post", "tipos de posts"
- Apresentacao Imperial + oferecer tipos disponiveis

#### Modo 3: ESTRATEGISTA
- Ativacao: "campanha", "estrategia de conteudo", "vender meu produto", "doutrinacao", "gerar leads", "post de oferta direta", "vender mentoria", "campanha de conversao"
- Consulta: AG-IMPERADOR-ESTRATEGIAS.pdf
- Executa 1 das 8 estrategias

#### Modo 4: REELS
- Ativacao: "reels", "criar reels", "roteiro de reels", "video", "roteiro de video", "script de video"
- Consulta: AG-IMPERADOR-ROTEIRO-REELS.pdf

#### Modo 5: PLANEJAMENTO
- Ativacao: "planejamento de conteudo", "funil de conteudo", "ideias de post", "calendario editorial", "nao sei o que postar"
- Consulta: AG-IMPERADOR-PLANEJAMENTO.md

#### Modo 6: POSICIONAMENTO
- Ativacao: "posicionamento", "bio", "me ajuda com posicionamento"
- Consulta: AG-IMPERADOR-POSICIONAMENTO.pdf

---

### 2.7 AS 8 ESTRATEGIAS (IMPERADOR-ESTRATEGIAS)

**Coleta obrigatoria antes de qualquer estrategia:**
1. O que voce vende (mentoria de que?)
2. Pra quem (avatar especifico)
3. Qual dor real
4. Qual transformacao entrega

| Codigo | Nome | Formato | Duracao |
|--------|------|---------|---------|
| E1 | Lancamento de Pressao | Feed + Stories | 5 dias |
| E2 | Operacao Isca Magnetica | Feed + Stories | variavel |
| E3 | Doutrina Silenciosa | Feed + Stories | variavel |
| E4 | Stories Venda Direta (Caixa Rapido) | 5 Stories | 1 dia |
| E5 | Feed de Guerra Visual | 5 Posts Feed | 5 dias |
| E6 | Story Direto (Levantada de Mao) | 1 Story unico | 1 dia |
| E7 | Stories PAS | 11 Stories | 1 dia |
| E8 | Stories Funil Pressao | Stories diarios | 3-5 dias |

**E1 - Lancamento de Pressao (5 dias):**
- Dia 1: Despertar dor (feed + stories)
- Dia 2: Problema comum (feed + stories)
- Dia 3: Solucao existe (feed + stories)
- Dia 4: Movimento (feed + stories)
- Dia 5: Oferta final (feed + stories)

**E4 - Stories Venda Direta (5 stories):**
- Story 1: Gancho/Antecipacao + enquete
- Story 2: Autoridade/Provas sociais
- Story 3: Qualificacao (enquete investimento)
- Story 4: Qualificacao avancada (confirmar comprometimento)
- Story 5: Oferta direta com palavra-chave

**E5 - Feed de Guerra Visual (5 posts):**
- Post 1: FERIDA
- Post 2: IDENTIDADE
- Post 3: SOLUCAO
- Post 4: PROVA
- Post 5: ACAO

**E6 - Story Direto (1 story):**
Template: "PROCURA-SE [N] [publico] que querem [resultado] nos proximos [prazo] dias. Vou te mostrar como [promessa]. Se quiser, responde com '[PALAVRA-CHAVE]'."

**E7 - Stories PAS (11 stories):**
Framework Problema, Agitacao, Solucao com enquetes e interacoes

**E8 - Stories Funil Pressao (5 dias):**
- Dia 1: Dor aberta (sem falar do produto)
- Dia 2: Tensao coletiva
- Dia 3: Solucao sem vender
- Dia 4: Movimento + urgencia
- Dia 5: Prova + oferta final

---

### 2.8 SISTEMA DE POSICIONAMENTO

#### Bio Imperial (3 Fases)

**Coleta (1 pergunta por vez):**
1. Quem e seu cliente ideal?
2. Qual momento percebe que precisa de ajuda?
3. Qual problema real que trava crescimento?
4. Qual resultado quer mas nao consegue sozinho?
5. Qual esforco inutil continua fazendo?
6. Qual verdade incomoda contradiz senso comum?

**FASE 1 -- Inversao de Poder:**
"[CLIENTE_IDEAL] me procuram quando [MOMENTO_DE_COLAPSO]."

**FASE 2 -- Desafio da Realidade:**
"Eu [transformacao] sem [o que mercado diz que e necessario]."

**FASE 3 -- Redefinicao:**
"Porque [verdade contraintuitiva que redefine o jogo]."

**Frase da Bio:** Ate 150 caracteres, sintetizar as 3 fases. Proibido: "ajudo", "inspiro", "ensino".

#### Carrossel de Lavagem Cerebral (CLC) -- 10 Slides
1. Gancho Neurologico (sequestrar cerebro em 0.8s)
2. Inoculacao Contra Objecoes (neutralizar desculpas)
3. Contraste de Realidades (gerar vergonha)
4. Diagnostico Autoritario (unico que ve causa real)
5. Identificacao do Inimigo (alianca, "nos contra eles")
6. Apresentacao do Novo Paradigma (nova forma de pensar)
7. Epifania (AHA moment irreversivel)
8. Validacao com Prova (numeros, casos reais)
9. Acesso a Oportunidade (janela pra acao)
10. Comando de Acao (CTA imperativo)

#### StoryAds de Manipulacao Subliminar
Stories que parecem casuais mas sao projetados para gerar tensao e desejo.
- Imagem "acidental" (parque, cafe, print PIX, setup)
- Texto 3 linhas: Antes (dor) -> Depois (resultado) -> Insinuacao (sem explicar como)
- 10 templates universais + 10 por nicho
- Ritual: 1-2 por dia, salvar em destaques

#### Sistema de Dominacao 21 Dias
- Fase 1 (Dias 1-7): Reposicionamento Cerebral -- Bio + 1o carrossel + StoryAds diarios
- Fase 2 (Dias 8-21): Amplificacao de Autoridade -- +2 carrosseis + preco +30% + filtrar leads
- Fase 3 (Dias 22-60): Extracao Continua -- Escada 3 niveis + vendas DM silencioso + ritual semanal

---

### 2.9 FRAMEWORK BLAZE (6 Blocos para Reels)

**Formula:** HOOK -> RETENCAO -> SEGUNDO HOOK -> CONTEUDO -> MORAL + CTA

**3 Principios:**
1. Retencao Forcada (nunca entregar resposta no hook)
2. Movimento/Causa (todo reel tem 1+ elemento: Causa, Inimigo, Promessa, Simbolos, Mantras, Identidade, Conceito)
3. Sentimento Climatico (moral gera 1 dos 5 sentimentos)

**6 Blocos:**
- BLOCO 1: HOOK (0-3s) -- max 5 palavras, texto+fala, primeira palavra forte
- BLOCO 2: RETENCAO (3-30s) -- contextualizar, storytelling ABT, micro-tensoes cada 10s
- BLOCO 3: SEGUNDO HOOK (30-40s) -- re-engajar, segmentar ICP
- BLOCO 4: CONTEUDO (40-70%) -- valor real + elemento do movimento (OBRIGATORIO)
- BLOCO 5: MORAL (70-85%) -- crenca/insight + 1 dos 5 sentimentos (OBRIGATORIO)
- BLOCO 6: CTA (85-100%) -- 1 acao clara

**4 Formatos:**
- Oficial (6 blocos, 45-60s) -- conversao
- Provocacao (10-20s) -- viralizacao
- Storytelling (40-60s) -- conexao
- Tatico (15-30s) -- dica rapida

**7 Padroes Virais:** Contraintuitivo, Segredo, Confissao, Urgente, Prova, Tribal, Meta

### 2.10 FRAMEWORK 4C DO IMPERADOR (Reels)

Diferente do BLAZE. Framework do Imperador para Reels:
- BLOCO 1: GANCHO (0-3s) -- frase forte
- BLOCO 2: CONEXAO (3-7s) -- identificacao emocional
- BLOCO 3: CONFLITO (7-15s) -- tensao, curiosidade
- BLOCO 4: CONTEUDO/BIG IDEA (15-25s) -- valor, solucao
- BLOCO 5: CTA (25-30s) -- acao clara

---

### 2.11 CTAs COMPLETOS (do PDF)

**Por tipo de CTA:**

Quebrando objecao:
- "Se voce quer [resultado], mesmo que [objecao]."

Resolvendo problema filosofico:
- "Se voce e [publico] quer [desejo], sem ter que [problema filosofico], e mesmo que [objecao]."

Despertando desejo pelo sonho:
- "Se voce quer [resultado], se sentir [desejo visceral], conquistar [desejo] e ser [sonho]."

Formacao profissional:
- "Se voce quer se tornar expert no unico [categoria], capaz de [resultado], sem [objecao]."

Despertando curiosidade:
- "Se voce quer aprender a estrategia que eu usei para [resultado especifico e temporal], usando [caminho simples] e sem precisar [problema filosofico]."
- "Se voce quer copiar e colar a mesma estrutura que eu usei para [desejo] sem [objecao]."

Baseada no tempo:
- "Se voce quer ter [diferencial] ao longo de [tempo] para aprender a [resultado] ate [beneficio tangivel]."
- "Se voce quer [desejo] em [periodo]."

---

### 2.12 ORACULO POSTS (9 Etapas)

1. Distribuicao Emocional (Reptiliano/Limbico/Neocortex)
2. 12 Testes do Validator
3. Proibicoes Absolutas
4. Criterios Tecnicos (max palavras, progressao, etc)
5. Padroes de Rejeicao Imediata
6. Checagem de Autenticidade
7. Acoes Obrigatorias
8. Padrao de Qualidade
9. Resultado Esperado

Score >= 80% para aprovar.

### 2.13 ORACULO REELS (3 Niveis)

- Nivel 1: Copy (5 categorias, pesos, formulas)
- Nivel 2: Hook (5 categorias, max 5 palavras)
- Nivel 3: Reel Completo (4 blocos com pesos)

Score >= 80% em CADA nivel. Progressao obrigatoria.

Formula geral: `SCORE = (N1 x 0.30) + (N2 x 0.30) + (N3 x 0.40)`

### 2.14 FRAMEWORK HORMOZI (Hooks)

- Hook = 80% do valor do marketing
- Equacao: HOOK = CALL OUT + CONDITION FOR VALUE
- 8 tipos: Labels, Yes Questions, Open Questions, Conditionals, Commands, Statements, Lists, Narratives
- Framework 70-20-10: 70% core (testados), 20% emerging (variacoes), 10% big ideas
- Batch de 10: 7 core + 2 emerging + 1 big idea

### 2.15 POSTS INTENCIONAIS (Guia Completo)

6 Principios:
1. Regra do Um (1 ideia por post)
2. Arte do Gancho (capturar atencao)
3. Estrutura PCS (Problema, Consequencia, Solucao)
4. Conclusao Poderosa (CTA claro)
5. Refinamento (coerencia, simplicidade, feedback)
6. Medicao e Iteracao (engajamento, cliques, conversoes)

### 2.16 PROPORCAO DE CONTEUDO

- 50% Tensao (divide mercado, cria desconforto)
- 25% Alinhamento (prova que habita realidade prometida)
- 25% Demonstracao (mostra resultados "acidentalmente")

### 2.17 CAMADAS DE PESQUISA DO AVATAR

8 Camadas:
1. Publico
2. Dor Oculta
3. Rotina de Sangramento
4. Desejos Escondidos
5. Obstaculos/Mentiras
6. Pontos de Gatilho
7. Pesadelos Recorrentes
8. Comparacoes Toxicas

### 2.18 7 CATEGORIAS DE STORIES

1. LIFESTYLE -- fazer cobicarem sua vida
2. POSICIONAMENTO -- separar do rebanho
3. INSIGHTS/SACADAS -- enxergar 7 passos a frente
4. BASTIDORES -- curiosidade sobre metodo/sistema
5. CASES/DEPOIMENTOS -- provas reais
6. CAIXINHA PERGUNTAS -- vender sem parecer vender
7. LEVANTADA DE MAO -- identificar quem esta pronto

### 2.19 CHECKLIST BELIEF (5 Elementos)

Todo post deve gerar pelo menos 2:
1. Confirmar Suspeitas
2. Justificar Fracassos
3. Atirar Pedras (inimigo)
4. Aliviar Culpa
5. Encorajar Sonhos

### 2.20 REGRAS INVIOLAVEIS

**Slide 1:** Max 15 palavras, jamais pergunta, contraintuitivo, 3 variacoes (2 virais + 1 imperial)
**Slides 2-10:** Max 30 palavras
**Pronome:** Sempre "voce", nunca "nos" ou "eu"
**Solucao:** Nunca revelar cedo
**CTA:** Nunca "clique aqui" -- comando moral + palavra-chave
**Validacao:** Sempre pelo Oraculo antes de entregar

**Palavras proibidas:** segredo, dica, truque, hack, simples, facil, rapido, automatico, incrivel, fantastico, revolucionario
**Frases proibidas:** "Vou ser honesto...", "A verdade e que...", "O segredo do sucesso...", "Voce precisa entender...", "Como eu sempre digo...", "Se voce quer ter sucesso..."

---

## PARTE 3: O QUE FOI CRIADO (36 ARQUIVOS)

Arquivos que existem em `/Users/julianotorriani/claude/legacy/squads/conteudo/` -- podem ser reaproveitados ou descartados:

### data/ (15 arquivos)
nucleo.md, expression.md, tipos-de-post.md, frameworks-copy.md, aberturas-poderosas.md, hooks-bank.md, cta-bank.md, oraculo-posts.md, oraculo-reels.md, reels-framework.md, reels-patterns.md, reels-swipefile.md, swipe-posts.md, cliches-proibidos.md, regras-inviolaveis.md

### agents/ (6 arquivos)
content-chief.md, carousel-creator.md, reels-creator.md, stories-strategist.md, content-planner.md, content-validator.md

### tasks/ (7 arquivos)
create-carousel.md, create-reels.md, create-stories.md, plan-content.md, create-campaign.md, repurpose-content.md, validate-content.md

### checklists/ (3 arquivos)
oraculo-posts.md, oraculo-reels.md, content-rules.md

### workflows/ (2 arquivos)
wf-create-content.yaml, wf-campaign.yaml

### config.yaml + README.md

---

## PARTE 4: O QUE ESTA FALTANDO (GAPS)

### Data files que precisam ser CRIADOS:
1. **estrategias.md** -- 8 estrategias completas (E1-E8) com cronogramas e templates
2. **posicionamento.md** -- Bio Imperial, Carrossel Lavagem Cerebral, StoryAds, Sistema 21 dias
3. **roteiro-reels-imperial.md** -- Framework 4C do Imperador (diferente do BLAZE)
4. **posts-intencionais.md** -- 6 principios do guia completo
5. **storyadds.md** -- Templates StoryAds por nicho
6. **modos-operacionais.md** -- 6 modos com ativacao e fluxos
7. **avatar-research.md** -- 8 camadas de pesquisa do avatar
8. **stories-categorias.md** -- 7 categorias de stories com detalhamento

### Data files que precisam ser ENRIQUECIDOS:
- **cta-bank.md** -- Adicionar templates completos do PDF (por objecao, desejo, curiosidade, tempo, etc)
- **cliches-proibidos.md** -- Adicionar lista completa do PDF
- **hooks-bank.md** -- Adicionar 30 hooks do Roteiro-Reels + hooks do prompt BLAZE
- **swipe-posts.md** -- Adicionar 8 exemplos reais do SWIPE-POSTS.pdf

### Agents que faltam:
- **strategist.md** -- Modo Estrategista (8 estrategias E1-E8)
- **positioning-expert.md** -- Modo Posicionamento (Bio, CLC, StoryAds, Sistema 21 dias)

### Tasks que faltam:
- create-strategy.md (criar estrategia E1-E8)
- create-bio.md (criar Bio Imperial)
- create-storyadd.md (criar StoryAds)
- create-clc.md (criar Carrossel Lavagem Cerebral)
- create-hook-batch.md (batch hooks 70-20-10)
- create-content-series.md (serie conteudo)
- diagnose-avatar.md (pesquisa avatar 8 camadas)
- audit-content.md (auditoria conteudo existente)
- create-levantada-mao.md (E6 story direto)
- create-stories-venda.md (E4 stories venda 5 etapas)
- create-stories-pas.md (E7 stories PAS 11 stories)
- create-stories-funil.md (E8 funil pressao 5 dias)

### Checklists que faltam:
- hook-quality.md (qualidade de hooks -- max palavras, padrao viral, etc)
- belief-elements.md (checklist BELIEF 5 elementos -- min 2/5)
- strategy-execution.md (execucao de estrategia)
- bio-quality.md (qualidade da Bio Imperial)
- storyadd-quality.md (qualidade StoryAds)
- campaign-coherence.md (coerencia campanha multi-formato)

### Workflows que faltam:
- wf-strategy.yaml (workflow estrategia completa)
- wf-positioning.yaml (workflow posicionamento)
- wf-21-days.yaml (sistema 21 dias)
- wf-hook-testing.yaml (teste hooks 70-20-10)

---

## PARTE 5: ARQUITETURA EXPANDIDA PROPOSTA

```
squads/conteudo/
├── agents/ (8 agents)
│   ├── content-chief.md          <- Orchestrador (Tier 0) -- 6 modos operacionais
│   ├── carousel-creator.md       <- Carrosseis 1-10 slides (Tier 1)
│   ├── reels-creator.md          <- Roteiros Reels BLAZE + 4C Imperial (Tier 1)
│   ├── stories-strategist.md     <- Stories 7 categorias + sequencias (Tier 1)
│   ├── strategist.md             <- 8 Estrategias E1-E8 (Tier 1)
│   ├── positioning-expert.md     <- Bio, CLC, StoryAds, 21 dias (Tier 1)
│   ├── content-planner.md        <- Planejamento 5 niveis + proporcao (Tier 2)
│   └── content-validator.md      <- Oraculo unificado posts + reels (Tier 2)
│
├── data/ (23 arquivos)
│   ├── nucleo.md                 <- Tom de voz + 5 sistemas + calibracao
│   ├── expression.md             <- Biblioteca completa (25+16+16+30+20 frases)
│   ├── tipos-de-post.md          <- 7 tipos narrativos slide-a-slide
│   ├── frameworks-copy.md        <- 9 frameworks abordagem + matriz
│   ├── aberturas-poderosas.md    <- 5 tipos abertura + matriz
│   ├── hooks-bank.md             <- Hooks unificados (Imperador+BLAZE+Hormozi)
│   ├── cta-bank.md               <- CTAs por tipo (objecao, desejo, curiosidade, tempo, etc)
│   ├── oraculo-posts.md          <- 12 testes + 9 etapas
│   ├── oraculo-reels.md          <- 3 niveis validacao com formulas
│   ├── reels-framework.md        <- Framework BLAZE 6 blocos
│   ├── reels-imperial.md         <- Framework 4C Imperial (5 blocos)
│   ├── reels-patterns.md         <- 7 padroes virais
│   ├── reels-swipefile.md        <- 500+ hooks por padrao/nicho
│   ├── swipe-posts.md            <- Exemplos reais completos
│   ├── cliches-proibidos.md      <- Lista completa exclusao
│   ├── regras-inviolaveis.md     <- Todas as regras
│   ├── estrategias.md            <- 8 estrategias E1-E8 completas
│   ├── posicionamento.md         <- Bio, CLC, StoryAds, 21 dias
│   ├── posts-intencionais.md     <- 6 principios guia
│   ├── storyadds.md              <- Templates por nicho
│   ├── modos-operacionais.md     <- 6 modos ativacao/fluxo
│   ├── avatar-research.md        <- 8 camadas pesquisa avatar
│   └── stories-categorias.md     <- 7 categorias detalhadas
│
├── tasks/ (19 tasks)
│   ├── create-carousel.md
│   ├── create-reels.md
│   ├── create-stories.md
│   ├── create-stories-venda.md   <- E4 Stories Venda Direta
│   ├── create-stories-pas.md     <- E7 Stories PAS
│   ├── create-stories-funil.md   <- E8 Funil Pressao
│   ├── create-levantada-mao.md   <- E6 Story Direto
│   ├── create-strategy.md        <- Estrategias E1-E8
│   ├── create-bio.md             <- Bio Imperial 3 fases
│   ├── create-storyadd.md        <- StoryAds subliminar
│   ├── create-clc.md             <- Carrossel Lavagem Cerebral
│   ├── create-hook-batch.md      <- Batch hooks 70-20-10
│   ├── create-content-series.md  <- Serie conteudo
│   ├── create-campaign.md        <- Campanha multi-formato
│   ├── plan-content.md           <- Planejamento + calendario
│   ├── diagnose-avatar.md        <- Pesquisa avatar 8 camadas
│   ├── audit-content.md          <- Auditoria conteudo
│   ├── repurpose-content.md      <- Adaptar entre formatos
│   └── validate-content.md       <- Validar pelo Oraculo
│
├── workflows/ (6 workflows)
│   ├── wf-create-content.yaml    <- Criacao peca unica
│   ├── wf-campaign.yaml          <- Campanha multi-formato
│   ├── wf-strategy.yaml          <- Estrategia completa E1-E8
│   ├── wf-positioning.yaml       <- Posicionamento completo
│   ├── wf-21-days.yaml           <- Sistema 21 dias
│   └── wf-hook-testing.yaml      <- Teste hooks 70-20-10
│
├── checklists/ (9 checklists)
│   ├── oraculo-posts.md
│   ├── oraculo-reels.md
│   ├── content-rules.md
│   ├── hook-quality.md
│   ├── belief-elements.md
│   ├── strategy-execution.md
│   ├── bio-quality.md
│   ├── storyadd-quality.md
│   └── campaign-coherence.md
│
├── config.yaml
└── README.md
```

**Total: 8 agents + 23 data + 19 tasks + 6 workflows + 9 checklists = 67 arquivos**

---

## PARTE 6: FONTES NAO LIDAS (Podem Ter Mais Conteudo)

Estes arquivos NAO foram lidos. Podem conter conteudo adicional:

### APOIO/ do Imperador
- copy-posts-intencionais.pdf (299KB)
- cta-posts-intencionais.pdf (85KB)
- estrutura-posts-intencionais.pdf (222KB)
- exemplos-titulos.pdf (237KB)
- narrativas-Posts-Intencionais.pdf (528KB)
- post-bastidores.pdf (267KB)
- posts-intencionais-exemplos.pdf (1MB)
- posts-intencionais-guia.pdf (238KB)
- titulos-posts-intencionais.pdf (115KB)
- sistema-htb-torriani.pdf (27MB -- Sistema High Ticket Business completo)
- MANUAL-IMPERADOR.pdf (928KB)
- Palavras Cliches.docx (8KB)

### ENTREGA/
- MANUL-IMPERADOR.pdf (2.1MB -- Manual completo)
- Template de Posts no Canva.pdf (8MB -- Templates visuais)

### Outros PDFs
- AG-IMPERADOR-NARRATIVAS.pdf (versao PDF do .md)
- ORACULO.pdf (versao PDF do .md)
- AG-MESTREPROMPTS-ESTRUTURA.pdf (153KB -- Estrutura mestre de prompts)

**Recomendacao:** O Squad Creator deve decidir se le essas fontes adicionais ou se o conteudo ja extraido e suficiente.

---

## INSTRUCAO PARA O SQUAD CREATOR

1. Este documento contem TODA a analise feita sobre as fontes
2. Os 36 arquivos ja criados em `squads/conteudo/` podem ser reaproveitados como base ou descartados
3. A arquitetura expandida (PARTE 5) mostra o que o squad deveria ter
4. O conteudo extraido (PARTE 2) e a materia-prima para os data files
5. Os gaps identificados (PARTE 4) mostram exatamente o que falta
6. As fontes nao lidas (PARTE 6) podem ter conteudo adicional

O objetivo final: transformar tudo isso em uma interface visual para pessoas construirem seus proprios carrosseis, Reels e Stories.
