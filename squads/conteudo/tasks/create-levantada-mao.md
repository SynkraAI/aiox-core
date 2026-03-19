# Criar Story Direto - Levantada de Mao (E6)

name: create-levantada-mao
description: Criar 1 story poderoso para gerar lead qualificado imediato com chamada especifica (Estrategia E6 - Story Direto)
elicit: true

## INPUTS

- **O que voce vende:** mentoria, servico ou produto (obrigatorio)
- **Para quem:** publico especifico com detalhe (obrigatorio)
- **Resultado mensuravel:** o que o lead vai conseguir (obrigatorio)
- **Prazo:** em quantos dias/semanas (obrigatorio)
- **Numero de vagas:** quantidade limitada (default: 3-5)
- **Ativo que o lead ja tem:** audiencia, experiencia, lista (opcional)

## STEPS

1. Coletar as 4 informacoes obrigatorias
2. Montar estrutura do template universal: PROCURO [N] [publico] que querem [resultado] nos proximos [prazo]
3. Adicionar linha de promessa estrategica: "Vou te mostrar como [promessa]"
4. Definir palavra-chave de resposta (ex: EU QUERO, ESCALAR, QUERO)
5. Criar CTA final com instrucao clara
6. Gerar 3 variacoes para o usuario escolher
7. Validar pelo oraculo (concisao, especificidade, tom)
8. Entregar story final formatado

## VETO CONDITIONS

- Se nao tem as 4 informacoes obrigatorias → NAO executar, perguntar
- Se story tem mais de 5 linhas → Reescrever mais conciso
- Se nao tem numero especifico de vagas → Adicionar (3-5)
- Se nao tem prazo especifico → Perguntar ou sugerir (30-60 dias)
- Se resultado nao e mensuravel ("melhorar", "crescer") → Tornar especifico
- Se palavra-chave nao esta definida → Definir
- Se parece generico/aplicavel a qualquer nicho → Reescrever com especificidade

## OUTPUT EXAMPLE

```
VARIACAO 1 (Para Mentores):
"PROCURO 4 pessoas que querem vender 10 mentorias de R$ 5k nos proximos 60 dias, usando so a audiencia que ja tem.
Vou te mostrar como estruturar oferta que gera desejo imediato.
Responde com EU QUERO que te passo os bastidores."

VARIACAO 2 (Para Empresarios):
"PROCURO 2 empresarios que querem escalar para R$ 100k/mes nos proximos 45 dias, sem aumentar time ou criar produtos.
Vou te mostrar como simplificar oferta e vender todos os dias.
Responde com ESCALAR e eu te mando os detalhes."

VARIACAO 3 (Para [nicho do usuario]):
[Adaptacao especifica com dados coletados]
```

## COMPLETION CRITERIA

- 3 variacoes do story para escolha do usuario
- Cada variacao segue template universal (PROCURO + resultado + prazo + CTA)
- Palavra-chave definida e destacada
- Numero de vagas especifico (escassez)
- Resultado mensuravel (nao generico)
- Tom imperial e direto
- Score oraculo >= 80%

references:
  - data/stories-categorias.md
  - data/cta-bank.md
  - data/hooks-bank.md
