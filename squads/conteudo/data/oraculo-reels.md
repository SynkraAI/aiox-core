# ORACULO REELS - Validacao em 3 Niveis (DNA BLAZE)

> Sistema definitivo de validacao de Reels.
> Threshold: >= 80% OBRIGATORIO em cada nivel.
> Progressao: Nivel 1 -> Nivel 2 -> Nivel 3 (nao pula).

---

## Arquitetura

```
REEL -> NIVEL 1 (Copy) >=80%? -> NIVEL 2 (Hook) >=80%? -> NIVEL 3 (Completo) >=80%? -> APROVADO
```

---

## NIVEL 1: Validacao Universal de Copy

### Categoria 1: Fundacao Estrutural (Peso 20%)

**Banco de 4 Pernas (AWAI):**
- Beneficio: forte e irresistivel?
- Track Record: historico e prova?
- Credibilidade: autoridade crivel?
- Ideia Unica: angulo diferenciador?

**CBPP:** Credibilidade, Beneficio, Prova, Push

Formula: `CAT1 = (4PERNAS x 0.60) + (CBPP x 0.40)` | Minimo 70%

### Categoria 2: Persuasao Core (Peso 25%)

**4 Us (AWAI):** Util, Urgente, Unico, Ultraespecifico
- Se qualquer U <50% = copy fraca

**4 Ps (AWAI):** Promise, Picture, Prove, Push

Formula: `CAT2 = (4US x 0.60) + (4PS x 0.40)` | Minimo 75%

### Categoria 3: Qualidade Tecnica (Peso 20%)

**Especificidade Brutal:**
- Numeros exatos (127, nao "muitas")
- Numeros impares (7, nao 10)
- Detalhes concretos ("R$47k em marco")
- Resultados mensuraveis
- Contexto temporal especifico
- Nomes proprios

**10 Regras de Boa Escrita (AWAI):**
Hook atrativo, Lead com WIIFM, Proposito unico, Ideia principal clara, Estrutura retorica, Densidade informacional, Autoridade, Sem jargao, Concisao, Coerencia inicio-fim

Formula: `CAT3 = (ESPECIFICIDADE x 0.50) + (10REGRAS x 0.50)` | Minimo 70%

### Categoria 4: Impacto Emocional (Peso 25%)

**12 Testes do Validator:** (mesmos do Oraculo Posts)

**5 Indicadores de Persuasao:**
Dissonancia, Pressao emocional, Urgencia real, Comando claro, Tensao narrativa

Formula: `CAT4 = (12TESTES x 0.70) + (INDICADORES x 0.30)` | Minimo 75%

### Categoria 5: Compliance e Proibicoes (Peso 10%)

**Reprovacao automatica se contem:**
- Perguntas que geram "nao"
- Cliches de coach
- Venda direta crua
- Autocentrismo
- Frases de rejeicao
- Palavras proibidas

Formula: Contem proibicao = 0%. Tudo OK = 100%. **Minimo 100% (nao negociavel).**

### Score Nivel 1
```
SCORE_N1 = (CAT1 x 0.20) + (CAT2 x 0.25) + (CAT3 x 0.20) + (CAT4 x 0.25) + (CAT5 x 0.10)
```
Aprovado >= 80%

---

## NIVEL 2: Validacao Especifica de Hook

### Categoria 1: Padrao Viral (Peso 30%)
Deve usar 1+ dos 7 padroes: Contraintuitivo, Segredo, Confissao, Urgente, Prova, Tribal, Meta

### Categoria 2: Estrutura Tecnica (Peso 25%)
- Max 5 palavras (>5 = REPROVACAO AUTOMATICA)
- Primeira palavra inesperada
- Textual E falado
- Clareza imediata (0.5s)
- Sem jargao tecnico

### Categoria 3: Impacto Emocional (Peso 25%)
Sentimentos: Choque, Curiosidade, Raiva/Indignacao, Ego/Identificacao, Medo/Urgencia
Se nao gera nenhum sentimento forte = 0%

### Categoria 4: Incompletude Forcada (Peso 10%)
Nao revela solucao, cria gap, promessa implicita, tensao cognitiva

### Categoria 5: Qualidade Viral (Peso 10%)
Breakability, Shareability, Comentabilidade, Distinctiveness

### Score Nivel 2
```
SCORE_N2 = (PADRAO x 0.30) + (ESTRUTURA x 0.25) + (SENTIMENTO x 0.25) + (INCOMPLETUDE x 0.10) + (VIRAL x 0.10)
```
Aprovado >= 80%

---

## NIVEL 3: Validacao Completa do Reel

### Bloco 2: Retencao (3-30s) - Peso 25%
- Gap de Informacao (40%): curiosidade, loop, promessa, contexto
- Tensao Narrativa (35%): conflito, escalada, micro-climax, sem vale
- Qualidade Contexto (25%): relevante, especifico, dinamico, conciso

### Bloco 3: Segundo Hook (30-40s) - Peso 20%
- Re-engajamento (40%): novo conflito, pattern interrupt, promessa renovada
- Segmentacao (35%): segmenta ICP, dor especifica, qualificacao
- Tecnicas (25%): pergunta, revelacao parcial, contraste, urgencia

### Bloco 4: Conteudo Principal (40-70%) - Peso 30%
- Entrega de Valor (35%): resolve dor, vitoria rapida, pratico, memoravel
- Elemento do Movimento (35%): crenca, inimigo, mantra, posicionamento
  **SE NENHUM ELEMENTO = REPROVAR**
- Qualidade Execucao (30%): nao tecnico, densidade, fluxo, engajamento

### Bloco 5: Moral + CTA - Peso 25%
- 5 Sentimentos Climaticos (40%) **SE NENHUM = REPROVAR**
- Qualidade Moral (30%): crenca certa, insight, coerente, memoravel
- CTA (30%): transicao fluida, comando claro, nao vende direto, alinhado

### Score Nivel 3
```
SCORE_N3 = (BLOCO2 x 0.25) + (BLOCO3 x 0.20) + (BLOCO4 x 0.30) + (BLOCO5 x 0.25)
```

---

## Score Geral Consolidado

```
SCORE_GERAL = (NIVEL1 x 0.30) + (NIVEL2 x 0.30) + (NIVEL3 x 0.40)
```

| Score | Classificacao | Acao |
|-------|---------------|------|
| >=90% | Excelencia | GRAVAR AGORA |
| 85-89% | Muito Forte | GRAVAR |
| 80-84% | Forte | GRAVAR |
| 75-79% | Bom | Revisar pontos fracos |
| 70-74% | Aceitavel | Retrabalhar secoes |
| <70% | Reprovar | Reconstruir |

---

## Regras Inviolaveis do Oraculo Reels

- Threshold 80% sagrado em cada nivel
- Progressao obrigatoria (nao pula nivel)
- Compliance binario (100% ou reprovar)
- Hook >5 palavras = reprovacao automatica
- Palavras proibidas = reprovacao instantanea
- Bloco 4 DEVE ter elemento do movimento
- Bloco 5 DEVE gerar 1 dos 5 sentimentos
- CTA nao vende diretamente (gera desejo)

---

## Protocolo de Falha (3 reprovacoes)

Pedir ao usuario:
1. Dor principal do avatar
2. Desejo mais profundo
3. Resultado especifico com numeros
4. Prova disponivel
5. O que torna unico
6. Crenca a quebrar
7. Emocao a ativar