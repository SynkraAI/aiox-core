# Criar Bio Imperial

name: create-bio
description: Criar Bio Imperial completa em 3 fases (Inversao de Poder + Desafio da Realidade + Redefinicao) coletando 6 perguntas uma por vez
elicit: true

## INPUTS

Coletar UMA PERGUNTA POR VEZ, nesta ordem:

1. **Quem e seu cliente ideal?** (ex: mentores, empresarios, coaches, nutricionistas)
2. **Qual o momento especifico em que essa pessoa percebe que precisa de ajuda?** (ex: quando posta todo dia e ninguem compra)
3. **Qual o problema real que trava o crescimento?** (ex: conteudo sem venda, falta de autoridade)
4. **Qual o resultado que ele quer, mas nao consegue sozinho?** (ex: previsibilidade, vendas no automatico)
5. **Qual esforco inutil ele continua fazendo porque o mercado diz que e certo?** (ex: criar conteudo diario, rodar trafego pago)
6. **Qual verdade incomoda voce acredita que contradiz o senso comum?** (ex: conteudo nao vende. Posicionamento vende.)

## STEPS

1. Fazer pergunta 1 e aguardar resposta
2. Fazer pergunta 2 e aguardar resposta
3. Fazer pergunta 3 e aguardar resposta
4. Fazer pergunta 4 e aguardar resposta
5. Fazer pergunta 5 e aguardar resposta
6. Fazer pergunta 6 e aguardar resposta
7. Construir Fase 1 — Inversao de Poder: "[CLIENTE_IDEAL] me procuram quando [MOMENTO_DE_COLAPSO]."
8. Construir Fase 2 — Desafio da Realidade Aceita: "Eu [transformacao] sem [esforco inutil]."
9. Construir Fase 3 — Redefinicao da Realidade: "Porque [verdade contraintuitiva]."
10. Montar Frase de Dominio completa (3 fases concatenadas)
11. Sintetizar Frase da Bio (ate 150 caracteres)
12. Gerar 3 variacoes de cada para escolha do usuario

## VETO CONDITIONS

- Se fez mais de 1 pergunta por vez → Parar e corrigir (1 por vez)
- Se alguma resposta e vaga/generica → Pedir mais especificidade antes de continuar
- Se Frase de Dominio usa verbos proibidos ("ajudo", "inspiro", "ensino") → Reescrever
- Se Frase da Bio tem mais de 150 caracteres → Reduzir
- Se Bio parece conteudo de LinkedIn ou generica → Refazer completamente
- Se nao usa verbos permitidos (reposiciono, instalo, desbloqueio, acelero, substituo, reprogramo, codifico, transformo) → Corrigir

## OUTPUT EXAMPLE

```
FRASE DE DOMINIO:

"Mentores me procuram quando percebem que postam todo dia e nao vendem.
Eu instalo posicionamento lucrativo onde so existia conteudo vazio — sem depender de posts diarios.
Porque conteudo nao vende. Comando vende."

FRASE DA BIO (150 chars):

"Posiciono mentores para vender todos os dias sem depender de conteudo diario ou formulas cansadas."

---

VARIACAO 2:
Dominio: [variacao]
Bio: [variacao]

VARIACAO 3:
Dominio: [variacao]
Bio: [variacao]
```

## COMPLETION CRITERIA

- 6 perguntas feitas uma por vez (nao em bloco)
- Frase de Dominio com 3 fases claras (Inversao + Desafio + Redefinicao)
- Frase da Bio com ate 150 caracteres
- 3 variacoes para escolha
- Verbos permitidos usados corretamente
- Zero verbos proibidos ("ajudo", "inspiro", "ensino")
- Tom imperial — nao parece generico nem de LinkedIn

references:
  - data/posicionamento.md
  - data/nucleo.md
  - data/cliches-proibidos.md
  - data/regras-inviolaveis.md
