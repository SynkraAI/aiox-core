# Diagnosticar Avatar (8 Camadas)

name: diagnose-avatar
description: Pesquisa profunda do avatar em 8 camadas de profundidade para criar conteudo que acerta no centro emocional
elicit: true

## INPUTS

- **Nicho/mercado:** area de atuacao (obrigatorio)
- **Publico inicial:** descricao basica do avatar (obrigatorio)
- **O que voce vende:** produto/servico/mentoria (obrigatorio)
- **Informacoes existentes:** dados ja coletados sobre o avatar (opcional)
- **Conteudo que ja performou:** posts com mais engajamento (opcional)

## STEPS

1. Coletar nicho, publico e oferta
2. Analisar Camada 1 — Publico: profissao, faixa etaria, plataformas, ticket medio
3. Analisar Camada 2 — Dor Oculta: o que sente mas nao admite publicamente
4. Analisar Camada 3 — Rotina de Sangramento: habitos que drenam sem resultado
5. Analisar Camada 4 — Desejos Escondidos: o que quer mas tem vergonha de admitir
6. Analisar Camada 5 — Obstaculos/Mentiras: desculpas e crenças limitantes
7. Analisar Camada 6 — Pontos de Gatilho: o que faz agir impulsivamente
8. Analisar Camada 7 — Pesadelos Recorrentes: o que mais teme
9. Analisar Camada 8 — Comparacoes Toxicas: com quem se compara
10. Mapear cada camada para tipos de post ideais (conforme tabela data/avatar-research.md)
11. Gerar mapa completo do avatar com aplicacoes praticas
12. Sugerir 10 ideias de conteudo baseadas nas camadas

## VETO CONDITIONS

- Se nao tem as 3 informacoes obrigatorias → NAO executar, perguntar
- Se analise e superficial/generica → Aprofundar com exemplos especificos
- Se camadas nao tem exemplos concretos ("Ex:") → Adicionar
- Se mapeamento camada → tipo de post nao esta presente → Incluir
- Se sugestoes de conteudo nao ativam pelo menos 2 camadas cada → Reescrever
- Se linguagem e academica/tecnica → Reescrever em linguagem pratica

## OUTPUT EXAMPLE

```
MAPA DO AVATAR — [Nicho]

CAMADA 1 — PUBLICO:
- Profissao: Mentores/coaches digitais
- Faixa etaria: 28-45 anos
- Plataformas: Instagram (principal), YouTube
- Ticket medio atual: R$ 500-2.000

CAMADA 2 — DOR OCULTA:
- "Posto todo dia mas ninguem compra"
- Dor real: "Sera que meu trabalho nao vale nada?"
→ Tipo de post ideal: Imperial, Problema

CAMADA 3 — ROTINA DE SANGRAMENTO:
- Passa 3h/dia criando conteudo que ninguem engaja
- Faz lives pra 15 pessoas
→ Tipo de post ideal: Polemico, Crenca

[... camadas 4-8]

MAPEAMENTO CAMADA → CONTEUDO:
| Camada | Tipo de Post | Gatilho Emocional |
|--------|-------------|-------------------|
| Dor Oculta | Imperial | Vergonha |
| Rotina | Polemico | Frustracao |
[...]

10 IDEIAS DE CONTEUDO BASEADAS NAS CAMADAS:
1. [Camadas 2+5] "Voce posta todo dia porque o mercado te disse que consistencia vende. Mentira."
2. [Camadas 4+8] "Aquela coach que comecou depois de voce ja fatura 50k. Sabe o que ela fez diferente?"
[...]
```

## COMPLETION CRITERIA

- 8 camadas analisadas com profundidade
- Cada camada com exemplos concretos e especificos do nicho
- Mapeamento camada → tipo de post completo
- 10 ideias de conteudo que ativam pelo menos 2 camadas cada
- Linguagem pratica (nao academica)
- Mapa utilizavel para criacao de conteudo imediata

references:
  - data/avatar-research.md
  - data/belief-checklist.md
  - data/nucleo.md
  - data/posicionamento.md
