# Heuristics Catalog

Heuristicas do PROCESSO de clonagem (diferente das heuristicas extraidas do expert). Estas regras governam como o Helix opera durante todo o pipeline.

---

## Decision Heuristics

| ID | Nome | Regra | Racional | Fase Aplicavel |
|----|------|-------|----------|----------------|
| **AN001** | Regra 40/20/40 | SE criando clone → ENTAO 40% curadoria, 20% prompt, 40% refinamento | Inverter essa ordem = clone ruim. O segredo nao e o prompt, e a curadoria. | collect-sources, todas |
| **AN002** | Regra do Ouro | SE fonte e comentario/entrevista/story → ENTAO ouro. SE palestra antiga/generico → ENTAO bronze | Autenticidade > volume. Menos material ouro vale mais que muito bronze. | collect-sources |
| **AN003** | Regra da Trindade | SE clone esta fraco → ENTAO verificar se tem Playbook + Framework + Swipe. Provavelmente falta um. | Playbook sem framework = teorico. Framework sem swipe = abstrato. | synthesize-mind, smoke-test |
| **AN004** | Regra dos Estagios | SE comportamento muda por contexto → ENTAO criar estagios. Nunca prompt gigante unico. | IA se perde em prompt monolitico. Estagios sao mais controlados e previsíveis. | synthesize-mind |
| **AN005** | Regra do Teste Cego | SE 5-10 pessoas nao percebem que e IA → ENTAO clone esta bom. | Humanos sao o melhor teste. Score numerico e insuficiente. | smoke-test |

---

## Veto Heuristics

Condicoes que BLOQUEIAM o processo. Se qualquer veto for ativado, o Helix deve PARAR e corrigir antes de prosseguir.

| Trigger | Acao | Razao |
|---------|------|-------|
| Proposta de jogar TODO conteudo no clone sem curadoria | **VETO** - Curadoria primeiro | Volume sem curadoria = clone generico. "Se entrar coco, sai coco." |
| Clone sem Framework (so playbook) | **VETO** - Adicionar framework antes de prosseguir | Playbook sozinho nao basta para decisoes. Clone fica teorico. |
| Fontes majoritariamente bronze | **VETO** - Buscar fontes ouro antes de extrair | Se entrar coco, sai coco. Bronze como base = fidelidade baixa. |
| Prompt gigante sem estagios para clone complexo | **VETO** - Quebrar em estagios | IA vai se perder no contexto. Ref: AN004. |

---

## Prioritization Rules

### 1. Curadoria > Prompt > Refinamento

Os tres sao necessarios, mas a ordem importa:
- **Curadoria** (40%) - Separar ouro de bronze, selecionar material
- **Prompt** (20%) - Estruturar as instrucoes do clone
- **Refinamento** (40%) - Testar, iterar, melhorar

**Anti-pattern:** Gastar 80% no prompt e 20% em curadoria = clone bonito mas generico.

### 2. Ouro > Bronze (mesmo que tenha menos)

- 5 entrevistas ouro > 50 palestras bronze
- 1 livro do expert > 100 posts sobre o expert
- Comentarios respondendo perguntas > conteudo planejado

### 3. Layers 6-8 > Layers 1-4

Para subir de Basic para Premium/Elite:
- Priorize material que revela valores (Layer 6), obsessoes (Layer 7) e paradoxos (Layer 8)
- Material de superficie (como fala, como escreve) e necessario mas insuficiente

---

## Como Aplicar

1. **collect-sources:** Aplicar AN001 e AN002 para classificar e priorizar
2. **extract-voice-dna:** Buscar material ouro para layers observaveis
3. **extract-thinking-dna:** Buscar material que revela frameworks e decisoes
4. **synthesize-mind:** Aplicar AN003 (Trindade) e AN004 (Estagios)
5. **smoke-test:** Aplicar AN005 (Teste Cego) alem dos 3 testes padrao

---

## Operational Heuristics (AN006-AN010)

Heurísticas derivadas de experiência real com clones em produção (Renner Silva v1.2, Naval Ravikant). Complementam as AN001-AN005 conceituais com regras operacionais.

| ID | Nome | Regra | Racional | Fase Aplicável |
|----|------|-------|----------|----------------|
| **AN006** | Regra da Frequência Quantitativa | SE extraindo power words → ENTÃO documentar frequência real (ex: "61x 'Olha só' em 18 fontes") e não apenas "frequente" | Peso subjetivo (high/medium) é insuficiente. Frequência absoluta cross-source é evidência mensurável. | extract-voice-dna |
| **AN007** | Regra da Bidirecionalidade | SE adicionando cross-references → ENTÃO garantir que são bidirecionais (A cita B E B cita A) | Referências unidirecionais criam inconsistências. Se Voice cita Thinking, Thinking deve citar Voice. | synthesize-mind |
| **AN008** | Regra do Parafono | SE expert tem conteúdo oral (podcast/vídeo) → ENTÃO documentar prosódia: ritmo, pausas, cadência, fillers | Voice DNA textual captura O QUE diz, não COMO soa. Para experts orais, prosódia é 30%+ da identidade. | extract-voice-dna |
| **AN009** | Regra da Profundidade Episódica | SE documentando stories/memórias → ENTÃO todas com mesma profundidade (sem "brief reference" vs "full story") | Profundidade desigual faz clone dar respostas inconsistentes sobre memórias do expert. | extract-voice-dna |
| **AN010** | Regra da Sincronia System-Knowledge | SE adicionando novos KBs ao clone → ENTÃO atualizar system prompt e decision tree para referenciá-los | KBs órfãos (adicionados mas não referenciados) são peso morto — clone não os usa. | synthesize-mind, evolução |

---

## Veto Heuristics (Operacionais)

| Trigger | Ação | Razão |
|---------|------|-------|
| Power words sem frequência quantitativa | **FLAG** - Adicionar contagem antes de finalizar | AN006: "high" sem número é opinião, não dado |
| Cross-references unidirecionais | **FLAG** - Completar referência reversa | AN007: Inconsistência rastreável |
| Expert oral sem seção prosódia | **VETO** - Adicionar Phase 9 ao Voice DNA | AN008: Perda de 30%+ identidade oral |
| Stories com profundidade desigual | **FLAG** - Nivelar profundidade | AN009: Clone inconsistente em memórias |

---

*Catálogo de Heurísticas do Processo de Clonagem*
*IDs: AN001-AN010*
