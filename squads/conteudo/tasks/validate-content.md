# Validar Conteudo pelo Oraculo

name: validate-content
description: Validar qualquer conteudo (carrossel ou reels) pelo oraculo unificado — 9 etapas para posts, 3 niveis para reels, com relatorio de score e correcoes
elicit: true

## INPUTS

- **Conteudo:** post completo ou roteiro de reels (obrigatorio)
- **Formato:** Carrossel / Reels (obrigatorio)
- **Tipo de post:** Imperial / Polemico / Crenca / Problema / Curiosidade / Historia / Oferta (obrigatorio)
- **Framework de copy usado:** 1 dos 9 frameworks (opcional)
- **Intencao original:** Atracao / Consciencia / Aquecimento / Venda (opcional)

## STEPS

### Para Carrosseis (Oraculo Posts — 9 Etapas)
1. Validar S1_HOOKS: exatamente 3 linhas (2 VIRAL + 1 IMPERIAL), max 15 palavras, sem interrogacao
2. ETAPA 1 — Distribuicao emocional: reptiliano (slides 1-3), limbico (4-6), neocortex (7-10)
3. ETAPA 2 — 12 testes do validator (autenticidade, ausencia de marcadores, presenca cinematografica, linguagem cirurgica, profundidade, comando militar, tensao narrativa, valor x brutalidade 70/30, estrutura integrada, variabilidade, coerencia com frameworks, protecao contra vazamentos)
4. ETAPA 3 — Proibicoes absolutas: checar linguagem banida, frases de rejeicao, palavras proibidas
5. ETAPA 4 — Criterios tecnicos: max 25 palavras/slide, 3 variacoes headline, foco no leitor, progressao emocional
6. ETAPA 5 — Padroes de rejeicao: linguagem generica, estrutura previsivel, autoajuda, arrogancia sem profundidade
7. ETAPA 6 — Checagem de autenticidade: frustracao legitima, pressao real, tensao constante, escolha binaria
8. ETAPA 7 — Acoes obrigatorias: pelo menos 1 dissonancia, 1 comando com prazo, 1 escolha binaria
9. ETAPA 8-9 — Padrao de qualidade e resultado esperado

### Para Reels (3 Niveis)
1. NIVEL 1 — Copy: texto do roteiro segue tom imperial, sem palavras proibidas, sem cliches
2. NIVEL 2 — Hook: primeiros 3 segundos capturam atencao, afirmacao chocante (nao pergunta)
3. NIVEL 3 — Completo: progressao emocional, CTA claro, roteiro coeso do inicio ao fim

10. Calcular score por etapa/nivel (0-100%)
11. Score geral = media ponderada das etapas
12. Se score >= 80% → APROVADO
13. Se score < 80% → REESCREVER pecas que falharam e re-validar
14. Gerar relatorio completo no formato padrao

## VETO CONDITIONS

- Se conteudo esta incompleto (sem CTA, sem headline) → NAO validar, pedir conteudo completo
- Se formato nao e carrossel nem reels → NAO executar (stories tem validacao propria)
- Se score geral < 80% e nao reescreveu → NAO aprovar, obrigatorio reescrever
- Se reescreveu 3x e nao atingiu 80% → Sinalizar problema estrutural, sugerir refazer do zero
- Se qualquer etapa tem score 0% → Rejeicao imediata, nao calcular media
- Se usa palavras proibidas (segredo, dica, truque, hack, simples, facil) → Rejeicao automatica na etapa 3

## OUTPUT EXAMPLE

```
RELATORIO DE VALIDACAO — ORACULO POSTS
FORMATO: Carrossel (10 slides)
TIPO: Imperial
FRAMEWORK: Abertura Curiosa

SCORE POR ETAPA:
| Etapa | Score | Status |
|-------|-------|--------|
| S1_HOOKS | 100% | APROVADO |
| E1 Distribuicao Emocional | 90% | APROVADO |
| E2 12 Testes Validator | 85% | APROVADO |
| E3 Proibicoes | 100% | APROVADO |
| E4 Criterios Tecnicos | 75% | REPROVADO |
| E5 Padroes Rejeicao | 90% | APROVADO |
| E6 Autenticidade | 85% | APROVADO |
| E7 Acoes Obrigatorias | 80% | APROVADO |
| E8-9 Qualidade | 85% | APROVADO |

SCORE GERAL: 88% — APROVADO (com ressalvas)

PROBLEMAS ENCONTRADOS:
1. E4: Slide 6 com 28 palavras (max 25) → Reduzir
2. E4: Slide 8 com foco no "eu" em vez do "voce" → Reescrever

CORRECOES APLICADAS:
1. Slide 6 reescrito: "[texto corrigido]" (22 palavras)
2. Slide 8 reescrito: "[texto corrigido]" (foco no leitor)

SCORE APOS CORRECAO: 92% — APROVADO

VEREDICTO: PRONTO PARA PUBLICAR
```

## COMPLETION CRITERIA

- Todas as etapas/niveis executadas na ordem correta
- Score calculado por etapa com detalhamento
- Problemas listados com localizacao exata (qual slide, qual frase)
- Correcoes aplicadas quando score < 80%
- Re-validacao apos correcoes
- Relatorio no formato padrao com veredicto final
- Score geral >= 80% para aprovacao

## REFERENCES

- data/oraculo-posts.md — 9 etapas + 12 testes completos
- data/tipos-de-post.md — estruturas dos 7 tipos para checagem de coerencia
- data/frameworks-copy.md — frameworks para checagem de coerencia (etapa 2, teste 11)
