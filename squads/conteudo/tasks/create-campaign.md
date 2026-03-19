# Criar Campanha Multi-Formato

name: create-campaign
description: Criar campanha completa com carrossel + reels + stories integrados em torno de um tema central, com briefing, criacao por formato, validacao cruzada e entrega unificada
elicit: true

## INPUTS

- **Tema central:** assunto principal da campanha (obrigatorio)
- **Publico-alvo:** avatar com especificidade (obrigatorio)
- **Objetivo da campanha:** Atracao / Consciencia / Aquecimento / Venda (obrigatorio)
- **Duracao:** quantos dias a campanha roda — 3, 5 ou 7 dias (obrigatorio)
- **Oferta relacionada:** produto, mentoria ou servico (opcional)
- **Formatos desejados:** quais formatos incluir — default: carrossel + reels + stories (opcional)
- **Prints/provas:** depoimentos, resultados, screenshots (opcional)
- **Crenca a destruir:** qual crenca do mercado atacar (opcional)

## STEPS

1. Coletar as 4 informacoes obrigatorias — perguntar o que faltar
2. Definir briefing estrategico:
   - Narrativa central da campanha (fio condutor)
   - Progressao emocional ao longo dos dias
   - Papel de cada formato no funil (carrossel = autoridade, reels = alcance, stories = conversao)
3. Montar cronograma dia-a-dia com formatos distribuidos:
   - Dia 1: despertar dor (carrossel problema + stories bastidores)
   - Dia 2: amplificar problema (reels hook forte + stories insights)
   - Dia 3: novo paradigma (carrossel imperial + stories cases)
   - Dia 4: prova social (reels testemunho + stories caixinha)
   - Dia 5: oferta/CTA (carrossel oferta + stories levantada de mao)
   - Ajustar para 3 ou 7 dias conforme duracao
4. Criar carrossel(is) — usar task create-carousel internamente
5. Criar roteiro(s) de reels — hook + desenvolvimento + CTA
6. Criar sequencia(s) de stories — usar categorias de stories-categorias.md
7. Validar coerencia cruzada: tom, mensagem e progressao emocional consistentes entre formatos
8. Validar cada peca pelo oraculo (posts para carrosseis, niveis 1-3 para reels)
9. Se alguma peca < 80% → reescrever e re-validar
10. Entregar campanha completa no formato padrao

## VETO CONDITIONS

- Se nao tem as 4 informacoes obrigatorias → NAO executar, perguntar
- Se campanha tem menos de 2 formatos → NAO e campanha, e post individual (usar task especifica)
- Se narrativa central nao conecta os formatos → Refazer briefing com fio condutor
- Se tom varia entre pecas (imperial num, educativo noutro) → Padronizar tom imperial
- Se cronograma nao tem progressao emocional clara → Reestruturar (dor → paradigma → prova → acao)
- Se stories nao tem intencao estrategica → Reestruturar com categorias
- Se alguma peca score < 80% no oraculo → Reescrever ate atingir
- Se entregou teoria em vez de pecas prontas → Reescrever com execucao pratica

## OUTPUT EXAMPLE

```
CAMPANHA: Posicionamento Imperial — 5 dias
OBJETIVO: Aquecimento para lancamento de mentoria
PUBLICO: Empreendedores digitais 25-40 que faturam 5-15k/mes
NARRATIVA CENTRAL: "Voce nao tem problema de conteudo. Tem problema de posicionamento."

CRONOGRAMA:

DIA 1 — DESPERTAR DOR
Carrossel (Imperial, 10 slides): "95% dos empreendedores digitais estao INVISÍVEIS pro comprador certo."
Stories (Posicionamento + Insights): 3 stories provocando reflexao sobre visibilidade

DIA 2 — AMPLIFICAR PROBLEMA
Reels (45s): "Voce posta todo dia e ninguem compra? O problema nao e o conteudo..."
Stories (Bastidores): 4 stories mostrando metodo por tras do posicionamento

DIA 3 — NOVO PARADIGMA
Carrossel (Crenca, 7 slides): "Pare de criar conteudo. Comece a criar COMANDO."
Stories (Cases): 3 stories com prints de resultados de clientes

DIA 4 — PROVA SOCIAL
Reels (30s): Case do cliente que saiu de 3k pra 47k em 60 dias
Stories (Caixinha): "Me pergunte sobre posicionamento" + respostas direcionadas

DIA 5 — OFERTA
Carrossel (Oferta, 10 slides): "PROCURO 10 empreendedores que querem instalar posicionamento imperial."
Stories (Levantada de mao): "Responde IMPERIAL se quer saber mais" + escassez real

TOTAL DE PECAS: 2 carrosseis + 2 reels + 5 sequencias de stories
SCORE ORACULO: Todas as pecas >= 80%
```

## COMPLETION CRITERIA

- Briefing estrategico com narrativa central e progressao emocional
- Cronograma dia-a-dia com formatos distribuidos
- Todas as pecas criadas (carrosseis + reels + stories)
- Tom imperial consistente em todas as pecas
- Coerencia cruzada entre formatos validada
- Score oraculo >= 80% em cada peca
- Entrega no formato padrao (nome, objetivo, publico, narrativa, cronograma, pecas, score)

## REFERENCES

- data/tipos-de-post.md — tipos de carrossel e estruturas
- data/frameworks-copy.md — frameworks de copy para carrosseis
- data/stories-categorias.md — 7 categorias de stories com funcao no funil
- data/oraculo-posts.md — validacao de carrosseis
- tasks/create-carousel.md — task de criacao de carrossel
- tasks/create-stories.md — task de criacao de stories
