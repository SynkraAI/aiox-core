# Torriani Master Validation Checklist

**Pattern:** CP-VP-001
**Executor:** Agent (oraculo-torriani)
**Quality Gate:** QG-004

---

## SCORING AUTOMÁTICO

**REGRA: PARE e calcule o score ANTES de emitir veredito. Copie e preencha o template abaixo.**

### Fórmula de Pontuação

| Seção | Items | Peso por Item | Pontos Totais |
|-------|-------|---------------|---------------|
| VALIDADOR MASTER (5 critérios) | 5 | 2 | 10 |
| CHECKPOINT 1: Mecanismo Único | 9 | 1 | 9 |
| CHECKPOINT 2: Voz com Verdade | 24 | 1 | 24 |
| CHECKPOINT 3: Transformação Executável | 15 | 1 | 15 |
| Checklist de Limpeza | 8 | 0.5 | 4 |
| **TOTAL** | **61** | — | **62** |

### Cálculo

```
Score = (pontos_obtidos / pontos_totais) * 10
```

- Pontos totais = 62
- Cada item marcado [x] no Master vale 2 pontos
- Cada item marcado [x] nos Checkpoints 1-3 vale 1 ponto
- Cada item marcado [x] na Limpeza vale 0.5 ponto

### Regra Master (ABSOLUTA PRIORIDADE)

**Se QUALQUER critério do VALIDADOR MASTER (5/5) falhar = REPROVADO AUTOMÁTICO.**
NÃO avance para Checkpoints. NÃO calcule score parcial. Emita imediatamente:
`REPROVADO AUTOMÁTICO — Master falhou: [critério que falhou]`

### Thresholds

| Score | Veredito |
|-------|---------|
| >= 8.0 | APROVADO |
| < 8.0 | REPROVADO — volte para correção |

### Template de Resultado (OBRIGATÓRIO)

**Copie, preencha e inclua no output ANTES de emitir veredito:**

```
══════════════════════════════════════════
SCORE FINAL: X.X/10 — [APROVADO/REPROVADO]
══════════════════════════════════════════
Master:   X/5  (X/10 pontos)
CP1:      X/9  (X/9 pontos)
CP2:      X/24 (X/24 pontos)
CP3:      X/15 (X/15 pontos)
Limpeza:  X/8  (X/4 pontos)
──────────────────────────────────────────
Total:    X/62 pontos → Score: X.X/10
══════════════════════════════════════════
```

---

## Pre-Validation

- [ ] Copy completa recebida (nao rascunho parcial)
- [ ] Contexto fornecido (publico, produto, canal, campanha)
- [ ] Estado emocional do lead identificado (Urgencia/Duvida/Acao)

---

## VALIDADOR MASTER - 5 Criterios Nao-Negociaveis

**REGRA: Se falhar em QUALQUER um dos 5, PARA TUDO. Nao avanca para Checkpoints.**

### 1. Promessa Copiavel = Promessa Morta

- [ ] A promessa NAO pode ser usada por qualquer concorrente
- [ ] Tem nome proprietario ou mecanismo unico
- [ ] E visual, especifica e conectada a dor real
- [ ] **Teste:** "Se eu cobrir o nome da marca e subir no perfil do concorrente, funciona?" → Se SIM = REPROVADA

### 2. Dor Verdadeira Nao E Dor Bonita

- [ ] A dor descrita e a que a pessoa ESCONDE, nao a que posta no feed
- [ ] Tem cena viva, nao descricao generica
- [ ] Usa linguagem visceral e universal
- [ ] **Teste:** Trocou "Esta dificil vender?" por cena especifica?

### 3. Travar o Scroll E a Primeira Funcao

- [ ] Primeira frase contem contraste (antes/depois, ceu/poco)
- [ ] Quebra o esperado
- [ ] Escrita com voz, nao com palavras seguras
- [ ] Carrega energia emocional visivel
- [ ] **Teste:** A copy seria esquecida em 5 segundos?

### 4. Promessa Sem Execucao E Pior Que Vazia

- [ ] Resultado concreto (nao "aprenda" ou "descubra")
- [ ] Caminho visivel (passos claros)
- [ ] Acao simples (primeiro passo obvio)
- [ ] **Teste:** Substitua a promessa por "Aprenda estrategias para..." - se funciona igual, REPROVADA

### 5. Risco de Nao Agir Precisa Ser Palpavel

- [ ] Fantasma emocional presente (consequencia de nao agir)
- [ ] Usa memoria como arma (nao panico artificial)
- [ ] Pessoa NAO pode sair ilesa da copy
- [ ] **Teste:** A copy funciona sem urgencia? Se sim, falta risco

### Score Master

- [ ] 5/5 criterios passaram → AVANCA para Checkpoints
- [ ] Qualquer falha → PARA. Protocolo de correcao.

---

## CHECKPOINT 1: Mecanismo Unico

**So validar se passou no Master**

- [ ] Oferta tem NOME PROPRIO que nao existe no mercado?
- [ ] Metodo e VISUAL e pode ser explicado em 30s?
- [ ] Existe processo EXCLUSIVO desse contexto?
- [ ] Concorrente consegue replicar mudando so o nome? (SE SIM = REPROVAR)
- [ ] Mecanismo resolve de forma DIFERENTE (nao so "melhor")?
- [ ] Da pra explicar sem "mais rapido/facil/completo"?
- [ ] Tem framework/modelo/sistema batizado?
- [ ] Existe metafora/analogia proprietaria?
- [ ] Entrega e TANGIVEL (ferramenta, template, processo)?

### Score Checkpoint 1

- [ ] 9-10 SIM → Categoria proprietaria estabelecida
- [ ] 6-8 SIM → Mecanismo presente mas generico (REFINAR)
- [ ] 0-5 SIM → Copy commodity (REFAZER DO ZERO)

---

## CHECKPOINT 2: Voz com Verdade

**So validar se passou no Master**

### 12 Testes de Validacao Imperial

| #   | Teste                                                           | Pass? |
| --- | --------------------------------------------------------------- | ----- |
| 1   | Autenticidade Emocional - furia legitima, nunca teatral         | [ ]   |
| 2   | Zero Marcadores - sem [diagnostico], flui como cena viva        | [ ]   |
| 3   | Visual Narrativo - impacto visual, gesto, metafora              | [ ]   |
| 4   | Linguagem Cirurgica - direto na ferida, sem anestesia           | [ ]   |
| 5   | Profundidade em Camadas - superficial → emocional → existencial | [ ]   |
| 6   | Comando Inegociavel - verbo + prazo + tensao                    | [ ]   |
| 7   | Tensao Crescente - arco com climax e ruptura                    | [ ]   |
| 8   | Equilibrio 70/30 - 70% valor, 30% brutalidade estrategica       | [ ]   |
| 9   | Estrutura Integrada - inicio, apice e fecho conectados          | [ ]   |
| 10  | Variedade Expressiva - nada parece repetido                     | [ ]   |
| 11  | Coerencia com Doutrina - encaixa no metodo                      | [ ]   |
| 12  | Protecao de Sistema - nao expoe estrutura interna               | [ ]   |

### 12 Criterios de Impacto Direto

| #   | Criterio                                       | Pass? |
| --- | ---------------------------------------------- | ----- |
| 1   | Tensao na Primeira Frase                       | [ ]   |
| 2   | Confronto de Verdade                           | [ ]   |
| 3   | Gatilho de Acao                                | [ ]   |
| 4   | Dualidade (evoluir ou se arrepender)           | [ ]   |
| 5   | Comando Explicito (verbo sem permissao)        | [ ]   |
| 6   | Exposicao do Erro (cumplicidade da estagnacao) | [ ]   |
| 7   | Foco Unico de Transformacao                    | [ ]   |
| 8   | Dor antes de Curiosidade                       | [ ]   |
| 9   | Urgencia Imposta                               | [ ]   |
| 10  | Tom de Lideranca (lidera, nao convida)         | [ ]   |
| 11  | Promessa Violenta (clara, especifica, brutal)  | [ ]   |
| 12  | Fecho com Pressao (decisao com peso)           | [ ]   |

### Score Checkpoint 2

- [ ] 10-12 SIM em cada → Voz autentica e tensao calibrada
- [ ] 7-9 SIM → Boa, sem personalidade marcante (REFINAR)
- [ ] 0-6 SIM → Copy generica educada (REESCREVER)

---

## CHECKPOINT 3: Transformacao Executavel

**So validar se passou no Master**

### 7 Pilares da Promessa Violenta + 8 Extras

- [ ] Tem NUMERO concreto? (nao "mais", "muito")
- [ ] Tem PRAZO definido? (dias/semanas, nao "rapido")
- [ ] Tem METRICA observavel? (fatura, leads, tempo)
- [ ] Pessoa consegue SE VER com o resultado?
- [ ] Existe ANTES/DEPOIS emocional claro?
- [ ] Transformacao e PALPAVEL ou conceitual?
- [ ] Ha custo de NAO agir agora?
- [ ] Tempo e INIMIGO visivel na narrativa?
- [ ] Existe "ultima janela" estrutural (nao artificial)?
- [ ] Promete FAZER ou apenas "aprender"?
- [ ] Resultado independe de "esforco" vago?
- [ ] Tem primeiro passo OBVIO pos-compra?
- [ ] Serve SO pra esse publico/contexto?
- [ ] Alguem "de fora" se sentiria excluido?
- [ ] Usa linguagem tribal/interna do nicho?

### Score Checkpoint 3

- [ ] 12-15 SIM → Promessa executavel e violenta
- [ ] 8-11 SIM → Promessa presente mas vaga (REFINAR)
- [ ] 0-7 SIM → Promessa teorica (REESCREVER)

---

## Checklist de Limpeza

- [ ] Removidos qualificadores: muito, basicamente, talvez, provavelmente
- [ ] Removidos preenchimentos: "na verdade", "gostaria de", "acredito que"
- [ ] Removidas redundancias: subir pra cima, colaborar junto
- [ ] Substantivos → verbos ("fazer uma analise" → "analisar")
- [ ] Voz passiva → ativa ("foi enviado" → "enviei")
- [ ] Frases longas → 2 curtas
- [ ] Zero cliches de coach ("acredite em voce", "destrave seu potencial")
- [ ] Zero frases vazias ("conteudo de valor", "escale seus resultados")

---

## Escala de Gravidade

| Falha                            | Gravidade | Prioridade       |
| -------------------------------- | --------- | ---------------- |
| Falta de risco de nao agir       | 10        | Reescreve ja     |
| Promessa generica                | 9         | Reescreve ja     |
| Dor vaga / socialmente aceitavel | 8         | Corrige com cena |
| Ausencia de CTA real             | 7         | Reforca o final  |
| Falta de mecanismo unico         | 6         | Reposiciona      |
| Ritmo fraco                      | 4         | Reestrutura      |
| Metafora fraca ou cliche         | 2         | Opcional         |

**Falhas nota 7+ = NAO PUBLICAVEL**

---

## Decisão Final

**PARE. Calcule o score usando a fórmula acima ANTES de emitir veredito.**

1. Preencha o Template de Resultado (seção SCORING AUTOMÁTICO)
2. Verifique se Master passou (5/5) — se não, REPROVADO AUTOMÁTICO
3. Calcule score final: `(pontos_obtidos / 62) * 10`
4. Aplique threshold:
   - Score >= 8.0 → **APROVADO**. Pode subir.
   - Score < 8.0 → **REPROVADO**. Protocolo de correção.

**"Copy genérica não passa. Score decide, não opinião."**

---

## Auto-Correcao — Se Falhar, Faca Isso

| Falha | Correcao |
|-------|----------|
| Master 1 — Promessa copiavel | Batize a promessa com nome proprietario. Conecte ao mecanismo unico do Tiago. Teste: troque a marca — se funciona igual, refaca |
| Master 2 — Dor bonita/generica | Substitua descricao por cena viva: "Voce abre o notebook, 47 abas, 3 cursos comecados, nenhum terminado" |
| Master 3 — Nao trava scroll | Reescreva primeira frase com contraste (antes/depois). Quebre o esperado. Adicione energia emocional |
| Master 4 — Promessa sem execucao | Troque "aprenda" por resultado concreto + caminho visivel + primeiro passo obvio |
| Master 5 — Sem risco de nao agir | Adicione fantasma emocional: consequencia real de continuar igual. Use memoria, nao panico artificial |
| CP1 — Mecanismo generico | Crie nome proprio para o metodo. Adicione metafora proprietaria. Garanta que entrega e tangivel |
| CP2 — Voz sem personalidade | Remova linguagem segura. Adicione furia legitima (nao teatral). Substitua convites por comandos |
| CP2 — Impacto fraco | Adicione tensao na primeira frase. Coloque dor ANTES de curiosidade. Feche com pressao de decisao |
| CP3 — Promessa vaga | Adicione numeros concretos + prazo definido + metrica observavel. Ex: "Em 7 dias, 1 decisao clara" |
| CP3 — Sem custo de nao agir | Torne o tempo inimigo visivel: "Cada semana sem clareza e mais 1 semana perdida" |
| Limpeza — Qualificadores presentes | Buscar e deletar: muito, basicamente, talvez, provavelmente, na verdade, gostaria de |
| Score < 8.0 | Identifique as 3 secoes com menor pontuacao. Aplique as correcoes acima por prioridade (Master primeiro) |
