# Planejar Calendario de Conteudo

name: plan-calendar
description: Gerar calendario editorial semanal ou mensal com distribuicao estrategica de formatos, tipos de post e intencoes por dia
elicit: true

## INPUTS

- **Periodo:** semanal ou mensal (obrigatorio)
- **Pilares de conteudo:** temas centrais que serao abordados (obrigatorio)
- **Publico:** avatar especifico (obrigatorio)
- **Proporcao desejada:** distribuicao entre intencoes — ex: 50/25/25 atracao/consciencia/venda (opcional — default: 50/30/20)
- **Formatos preferidos:** carrossel, reels, stories, post unico (opcional — default: todos)
- **Frequencia de postagem:** quantos posts por dia/semana (opcional — default: 1 post/dia + stories diarios)
- **Oferta ativa:** se tem produto/servico sendo vendido no periodo (opcional)
- **Lancamento previsto:** se ha data de lancamento que o calendario deve preparar (opcional)

## STEPS

### Etapa 1: Coleta e Diagnostico
1. Coletar as 3 informacoes obrigatorias — perguntar o que faltar
2. Definir proporcao de intencoes se nao especificada:
   - Sem lancamento: 50% atracao / 30% consciencia / 20% aquecimento
   - Pre-lancamento: 40% consciencia / 30% aquecimento / 20% atracao / 10% venda
   - Lancamento ativo: 30% venda / 30% aquecimento / 25% consciencia / 15% atracao
3. Mapear pilares de conteudo disponiveis
4. Apresentar diagnostico ao usuario: "1. Confirmar, 2. Ajustar proporcao, 3. Mudar frequencia"

### Etapa 2: Estrutura Semanal
5. Definir rotacao de formatos por dia da semana:
   - Seg: Carrossel (conteudo denso pos-fim-de-semana)
   - Ter: Reels (engajamento alto no meio da semana)
   - Qua: Stories sequencia (bastidores, conexao)
   - Qui: Carrossel ou Post unico (conteudo de valor)
   - Sex: Reels (formato leve, fim de semana chegando)
   - Sab: Stories (bastidores pessoais, humanizacao)
   - Dom: Post unico ou descanso estrategico
6. Ajustar rotacao conforme preferencias do usuario
7. Garantir alternancia de tipos de post (nunca 2 imperiais seguidos, nunca 2 polemicos seguidos)

### Etapa 3: Distribuicao de Pilares
8. Distribuir pilares de conteudo ao longo do periodo
9. Garantir que cada pilar apareca pelo menos 2x por semana (se semanal) ou 8x por mes (se mensal)
10. Intercalar pilares para manter variedade
11. Alinhar pilares com intencoes:
    - Pilar de autoridade → consciencia
    - Pilar de dor/problema → atracao
    - Pilar de transformacao → aquecimento
    - Pilar de oferta → venda

### Etapa 4: Tipo de Post por Dia
12. Atribuir tipo de post (7 tipos) para cada dia seguindo proporcao:
    - Tensao: posts que geram desconforto, quebram crencas (polemico, crenca)
    - Alinhamento: posts que educam, posicionam, demonstram (imperial, curiosidade, problema)
    - Demonstracao: posts que provam resultado (historia, oferta)
13. Proporcao recomendada de tipos:
    - 40% alinhamento (imperial, curiosidade, problema)
    - 35% tensao (polemico, crenca)
    - 25% demonstracao (historia, oferta)
14. Selecionar framework de copy para cada post (conforme matriz tipo x framework)

### Etapa 5: Stories Paralelos
15. Planejar sequencia de stories diaria complementar ao feed:
    - Stories de bastidores nos dias de carrossel
    - Stories de engajamento nos dias de reels
    - Stories de prova social nos dias de post de venda
    - Stories de levantada de mao 2-3x por semana
16. Incluir categorias de stories: bastidores, caixinha, enquete, prova, oferta

### Etapa 6: Entrega
17. Montar calendario visual dia-a-dia com:
    - Data
    - Formato do post
    - Tipo de post
    - Pilar/tema
    - Intencao (atracao/consciencia/aquecimento/venda)
    - Framework de copy sugerido
    - Stories do dia
18. Incluir resumo de proporcoes finais (% por intencao, % por formato, % por tipo)
19. Marcar datas estrategicas (lancamento, picos de engajamento)
20. Sugerir temas especificos para cada dia (baseado nos pilares)

## VETO CONDITIONS

- Se nao tem as 3 informacoes obrigatorias (periodo, pilares, publico) → NAO executar, perguntar
- Se proporcao de venda ultrapassa 40% sem lancamento ativo → Ajustar (audiencia satura)
- Se mesmo tipo de post aparece 3 dias seguidos → Redistribuir (falta variedade)
- Se algum pilar nao aparece na semana → Incluir (todos os pilares devem estar presentes)
- Se nao tem stories planejados → Adicionar (stories sao obrigatorios no calendario)
- Se todos os posts sao do mesmo formato → Redistribuir (minimo 2 formatos diferentes por semana)
- Se nao tem nenhum post de tensao na semana → Adicionar (tensao e essencial para engajamento)
- Se nao tem nenhum post de demonstracao na semana → Adicionar (prova social e essencial)
- Se calendario ignora fim de semana sem justificativa → Incluir ou justificar descanso estrategico

## OUTPUT EXAMPLE

```
CALENDARIO EDITORIAL — SEMANA 10-16 MARCO
PUBLICO: Empreendedores digitais 5-15k/mes
PILARES: Posicionamento, Vendas no Instagram, Mentalidade
PROPORCAO: 50% atracao / 30% consciencia / 20% aquecimento
FREQUENCIA: 1 post/dia + stories diarios

---

SEG 10/03
- Formato: Carrossel (10 slides)
- Tipo: Imperial
- Pilar: Posicionamento
- Intencao: Consciencia
- Framework: Abertura Curiosa
- Tema: "Por que voce e invisivel pro comprador certo"
- Stories: Bastidores de criacao + caixinha "qual seu maior desafio?"

TER 11/03
- Formato: Reels (45s)
- Tipo: Polemico
- Pilar: Vendas no Instagram
- Intencao: Atracao
- Framework: Segredo Revelado
- Tema: "Consistencia sem posicionamento e trabalho escravo"
- Stories: Enquete "voce posta todo dia?" + 3 stories de contexto

QUA 12/03
- Formato: Stories sequencia (8 stories)
- Tipo: Historia
- Pilar: Mentalidade
- Intencao: Aquecimento
- Framework: Testemunho Real
- Tema: "Como meu cliente saiu de 3k pra 47k em 60 dias"
- Stories: Sequencia completa com prova social + levantada de mao

QUI 13/03
- Formato: Carrossel (7 slides)
- Tipo: Problema
- Pilar: Vendas no Instagram
- Intencao: Consciencia
- Framework: Problema e Solucao
- Tema: "3 erros que impedem sua primeira venda pelo DM"
- Stories: Bastidores + resposta a comentarios do carrossel de segunda

SEX 14/03
- Formato: Reels (30s)
- Tipo: Curiosidade
- Pilar: Posicionamento
- Intencao: Atracao
- Framework: Pergunta Impactante
- Tema: "O que empreendedores de 50k fazem que voce nao faz"
- Stories: Bastidores pessoais + humanizacao

SAB 15/03
- Formato: Stories (5 stories)
- Tipo: Crenca
- Pilar: Mentalidade
- Intencao: Atracao
- Framework: —
- Tema: "A mentira que o mercado te vendeu sobre consistencia"
- Stories: Lifestyle + reflexao casual

DOM 16/03
- Formato: Post unico
- Tipo: Imperial
- Pilar: Posicionamento
- Intencao: Consciencia
- Framework: Autoridade
- Tema: Quote de autoridade sobre dominar mercado
- Stories: Descanso ou conteudo leve

---

RESUMO DE PROPORCOES:
- Intencao: Atracao 43% | Consciencia 29% | Aquecimento 14% | Venda 14%
- Formato: Carrossel 29% | Reels 29% | Stories 28% | Post unico 14%
- Tipo: Imperial 29% | Polemico 14% | Historia 14% | Problema 14% | Curiosidade 14% | Crenca 14%
- Pilares: Posicionamento 43% | Vendas 29% | Mentalidade 28%

LEVANTADAS DE MAO PROGRAMADAS: Qua e Sex
POSTS DE TENSAO: Ter (polemico) + Sab (crenca)
POSTS DE DEMONSTRACAO: Qua (historia)
```

## COMPLETION CRITERIA

- Todas as etapas executadas na ordem (coleta → estrutura → pilares → tipos → stories → entrega)
- Cada dia do periodo com formato, tipo, pilar, intencao e framework definidos
- Proporcao de intencoes respeitada (margem de 10% aceitavel)
- Minimo 2 formatos diferentes por semana
- Stories planejados para cada dia
- Levantadas de mao incluidas (minimo 2x por semana)
- Alternancia de tipos de post (nunca 3 iguais seguidos)
- Todos os pilares representados no periodo
- Resumo de proporcoes incluido na entrega
- Posts de tensao e demonstracao presentes toda semana

## REFERENCES

- data/tipos-de-post.md — 7 tipos de post com estrutura completa por slides
- data/frameworks-copy.md — 9 frameworks de copy + matriz tipo x framework
- data/estrategias.md — 8 estrategias de campanha com cronograma integrado
- data/posts-intencionais.md — 6 principios de posts intencionais
- data/stories-categorias.md — categorias e formatos de stories
- data/regras-inviolaveis.md — regras de tom e linguagem
- data/posicionamento.md — diretrizes de posicionamento
- data/modos-operacionais.md — modos operacionais do sistema de conteudo
