# Planejar Conteudo Estrategico

name: plan-content
description: Gerar planejamento estrategico de conteudo com 25 ideias por ciclo, distribuidas nos 5 niveis de consciencia (Schwartz), proporcao 50/25/25 Torriani e calendario editorial semanal
elicit: true

## INPUTS

- **Publico:** avatar com especificidade — quem e, o que faz, qual dor (obrigatorio)
- **Oferta:** produto, servico ou mentoria que sera vendida (obrigatorio)
- **Crenca central:** ideia a ser vendida/instalada ao longo dos conteudos (obrigatorio)
- **Transformacao:** resultado mensuravel que a oferta entrega (obrigatorio)
- **Frequencia de postagem:** quantos posts por semana — default: 5 (opcional)
- **Ciclo:** semanal ou quinzenal — default: semanal (opcional)
- **Prioridade de formato:** carrossel / reels / misto — default: misto (opcional)

## STEPS

1. Coletar as 4 informacoes obrigatorias — perguntar o que faltar
2. Mapear os 5 niveis de consciencia do avatar (Eugene Schwartz):
   - **Inconsciente:** nao sabe que tem o problema
   - **Consciente do problema:** sabe que tem o problema, nao sabe a solucao
   - **Consciente da solucao:** sabe que existe solucao, nao conhece a sua
   - **Consciente do produto:** conhece sua oferta, ainda nao decidiu
   - **Mais consciente:** pronto pra comprar, precisa de empurrao final
3. Gerar 25 ideias de conteudo — 5 por nivel de consciencia:
   - Nivel 1 (Inconsciente): conteudo de choque, provocacao, polemica → tipo Polemico/Imperial
   - Nivel 2 (Consciente do problema): amplificar dor, diagnostico → tipo Problema/Crenca
   - Nivel 3 (Consciente da solucao): novo paradigma, metodo, insights → tipo Curiosidade/Historia
   - Nivel 4 (Consciente do produto): cases, provas, comparacoes → tipo Oferta/Historia
   - Nivel 5 (Mais consciente): oferta direta, escassez, CTA → tipo Oferta/Imperial
4. Aplicar proporcao 50/25/25 Torriani:
   - 50% conteudo de POSICIONAMENTO (niveis 1-2): provocar, polarizar, criar inimigos
   - 25% conteudo de AUTORIDADE (nivel 3): mostrar que sabe, entregar insights
   - 25% conteudo de CONVERSAO (niveis 4-5): provar e vender
5. Distribuir formatos por tipo:
   - Posicionamento: carrosseis imperiais, polemicos + reels de hook forte
   - Autoridade: carrosseis de crenca, curiosidade + reels educativos
   - Conversao: carrosseis de oferta + stories de levantada de mao
6. Montar calendario editorial semanal com dia, formato, tipo de post, nivel de consciencia e ideia
7. Sugerir framework de copy para cada ideia (referencia: matriz tipo x framework)
8. Entregar planejamento completo no formato padrao

## VETO CONDITIONS

- Se nao tem as 4 informacoes obrigatorias → NAO executar, perguntar
- Se ideias sao genericas ("fale sobre seu produto") → Reescrever com especificidade e angulo claro
- Se todas as ideias estao no mesmo nivel de consciencia → Redistribuir nos 5 niveis
- Se proporcao nao respeita 50/25/25 → Rebalancear (posicionamento deve dominar)
- Se calendario nao tem formato + tipo + nivel por dia → Completar
- Se nao tem pelo menos 1 ideia de conversao direta por semana → Adicionar
- Se ideias parecem conteudo educativo de guru → Reescrever no tom imperial (provocar, nao ensinar)
- Se entregou so lista de temas sem angulo de abordagem → Reescrever com hook e tipo definidos

## OUTPUT EXAMPLE

```
PLANEJAMENTO DE CONTEUDO — CICLO SEMANAL
AVATAR: Empreendedores digitais 25-40, faturam 5-15k/mes, postam todo dia sem resultado
OFERTA: Mentoria de Posicionamento Imperial (R$ 5.000)
CRENCA CENTRAL: "Posicionamento > Consistencia"
TRANSFORMACAO: Sair de 5-15k/mes para 30-50k/mes em 90 dias

PROPORCAO APLICADA:
- Posicionamento: 13 ideias (52%)
- Autoridade: 6 ideias (24%)
- Conversao: 6 ideias (24%)

25 IDEIAS POR NIVEL DE CONSCIENCIA:

NIVEL 1 — INCONSCIENTE (5 ideias):
1. "Voce nao tem problema de vendas. Tem problema de ANONIMATO." (Carrossel Imperial / Abertura Curiosa)
2. "95% dos empreendedores digitais sao INVISIVEIS pro comprador certo." (Reels / Segredo Revelado)
3. "Consistencia e a maior MENTIRA que te venderam." (Carrossel Polemico / Pergunta Impactante)
4. "Postar todo dia e a versao digital de gritar no deserto." (Reels / Problema e Solucao)
5. "O mercado te ensinou a criar conteudo. Deveria ter ensinado a criar COMANDO." (Carrossel Imperial / Autoridade)

[...]

NIVEL 5 — MAIS CONSCIENTE (5 ideias):
21. "PROCURO 10 empreendedores que querem instalar posicionamento imperial em 90 dias." (Carrossel Oferta / Beneficio Direto)
[...]

CALENDARIO SEMANAL (Semana 1):
| Dia | Formato | Tipo | Nivel | Ideia |
|-----|---------|------|-------|-------|
| SEG | Carrossel | Imperial | 1 | Ideia #1 |
| TER | Reels | Polemico | 1 | Ideia #3 |
| QUA | Carrossel | Crenca | 3 | Ideia #12 |
| QUI | Reels | Historia | 4 | Ideia #18 |
| SEX | Carrossel | Oferta | 5 | Ideia #21 |

STORIES COMPLEMENTARES: 2-3 sequencias por semana (posicionamento + bastidores + levantada de mao)
```

## COMPLETION CRITERIA

- 25 ideias geradas (5 por nivel de consciencia)
- Proporcao 50/25/25 respeitada (posicionamento/autoridade/conversao)
- Cada ideia com: hook, formato, tipo de post e framework sugerido
- Calendario editorial semanal montado
- Niveis de consciencia corretamente mapeados pro avatar
- Tom imperial em todas as ideias (nao educativo)
- Sugestoes de stories complementares incluidas

## REFERENCES

- data/tipos-de-post.md — 7 tipos de post e estruturas
- data/frameworks-copy.md — 9 frameworks e matriz tipo x framework
- data/stories-categorias.md — categorias de stories para complementar o feed
- data/oraculo-posts.md — referencia de tom e linguagem
