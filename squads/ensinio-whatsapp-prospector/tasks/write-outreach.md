# Task: Write Outreach Messages (v3.0 — Squad Delegation)

## Task Anatomy
- **task_name:** write-outreach
- **status:** active
- **responsible_executor:** outreach-writer (outreach-writer) — ASSEMBLER, not copywriter
- **execution_type:** Agent (with mandatory squad delegation)
- **input:**
  - Analyzed prospect data from prospect-analyst (v3.0, dual scoring + classification)
  - Copy strategy from specialist squads (mandatory consultation)
  - Ensinio knowledge from ensinio-mind squad
- **output:**
  - Personalized messages with WhatsApp links (JSON)
  - URL-encoded message text
  - Valid WhatsApp links
  - approach_type based on 7 classifications

## Filosofia v3.0

**MUDANCA CRITICA:** outreach-writer NAO escreve copy. outreach-writer MONTA mensagens com base na estrategia dos especialistas.

Pense assim: outreach-writer e o garcom que monta o prato. Os chefs estao na cozinha (squads de copy).
Ele nao inventa receitas. Ele recebe o prato pronto e apresenta na mesa com o toque final.

**Squads obrigatorios:**
- `copywriting-squad` — estrategia, execucao e audit
- `leandro-ladeira` — Big Idea por cluster de dor
- `ensinio-mind` — contexto do produto (ICP, solutions, arguments)

**Squads opcionais:**
- `hormozi` — hooks fortes
- `storytelling-masters-fosc` — narrativas de conexao
- `conversao-extrema` — word mapping para objecoes

## Action Items

### Step 1: Load Prospect Data
Load analyzed prospect data (v3.0 with dual scoring + classification).
**VETO:** Se dados nao estiverem no formato v3.0, HALT.

### Step 2: Load Ensinio Context
Load from ensinio-mind squad:
- `ensinio-mind/data/ensinio-solutions-kb.md` (67 features)
- `ensinio-mind/data/ensinio-icps.md` (ICP)
- `ensinio-mind/data/ensinio-arguments.md` (argumentos)
- `ensinio-mind/data/ensinio-sales-playbook.md` (objecoes + respostas)

### Step 3: Consult @eugene-schwartz (Awareness)
**Squad:** copywriting-squad
**Agent:** @eugene-schwartz
**Reference:** squads/copywriting-squad/data/awareness-levels-kb.md

Para CADA prospect (ou grupo de prospects similares):
- Enviar: dados do prospect (projeto, dor, classificacao)
- Perguntar: "Qual nivel de awareness? Como abordar nesse nivel?"
- Receber: awareness_level + abordagem recomendada

**Output esperado:** Mapa prospect → awareness_level

### Step 4: Consult @leandro-ladeira (Big Idea)
**Squad:** leandro-ladeira
**Agent:** @leandro-ladeira
**Command:** *big-idea

Para CADA cluster de dor (agrupar prospects por dor similar):
- Enviar: cluster de dor + contexto do grupo WhatsApp
- Perguntar: "Qual angulo unico (Big Idea) para esse cluster?"
- Receber: big_idea_angle + hook_principal

**Output esperado:** Mapa cluster_dor → big_idea

### Step 5: Consult @copy-maestro (Strategy + Clone Selection)
**Squad:** copywriting-squad
**Agent:** @copy-maestro

Para CADA prospect:
- Enviar: dados + awareness (step 3) + big_idea (step 4) + classificacao
- Perguntar: "Qual clone executor? Qual estrutura de mensagem?"
- Receber: clone_selecionado + estrutura + tom

**Hints de routing por classificacao:**
| Classificacao | Clone sugerido | Por que |
|---|---|---|
| CLIENTE_PURO | @clayton-makepeace ou @gary-halbert | Emocao + dor ou storytelling |
| CLIENTE_INDICADOR | @andre-chaperon | Relationship first |
| CLIENTE_EMBAIXADOR | @gary-halbert | Story de conexao, foco na dor |
| PARCEIRO_TATICO | @ben-settle | Tom casual, sem pressao |
| PARCEIRO_ESTRATEGICO | @david-ogilvy | Copy premium/B2B |
| AFILIADO_PURO | @ben-settle | Infotainment, leve |
| CANAL_PREMIUM | @david-ogilvy | Parceria premium + prova social |

**IMPORTANTE:** Estes sao hints, nao regras. @copy-maestro decide o clone final.

### Step 6: Consult Clone Executor (Draft)
**Squad:** copywriting-squad
**Agent:** [clone selecionado no step 5]

Para CADA prospect:
- Enviar: Big Idea + awareness + estrutura + dados do prospect
- Pedir: "Escreva draft de mensagem WhatsApp (4-5 paragrafos, casual brasileiro)"
- Restricoes: max 4-5 paragrafos, sem bullet points, sem formalidade, sem hifen/travessao
- Receber: draft_mensagem (corpo da copy)

### Step 7: outreach-writer Assembly (Contexto Ensinio)
outreach-writer recebe o draft e adiciona o contexto Ensinio:

1. **Greeting:** "Oi [primeiro nome]! [entrada variada], da Ensinio."
2. **Fosc ponte:** Inserir posicionamento do Fosc conforme classificacao
3. **Draft do clone:** Corpo da mensagem (step 6)
4. **Contexto temporal:** Se mensagem antiga, adicionar ponte
5. **Proposta Ensinio:** Conforme classificacao (condicao especial, parceria, afiliacao)
6. **CTA:** Manter o CTA do clone ou adaptar com contexto Ensinio
7. **Fechamento:** "Abraco!"

**Regras Ensinio (so outreach-writer aplica):**
- Fosc como "um dos fundadores" (NUNCA "socio fundador")
- Condicao especial por serem do mesmo grupo
- Antonio como remetente
- Variacao de entrada entre prospects
- EMBAIXADOR: SEM parceria na 1a msg
- ESTRATEGICO/CANAL: parceria como proposta principal

### Step 8: Audit @claude-hopkins
**Squad:** copywriting-squad
**Agent:** @claude-hopkins
**Reference:** squads/copywriting-squad/checklists/audit-copy-hopkins.md

Para CADA mensagem final:
- Enviar: mensagem completa montada
- Pedir: audit de qualidade (tom humano, persuasao natural, CTA de valor)
- Receber: PASS/FAIL + ajustes

Se FAIL: voltar ao step 6 com feedback do Hopkins. Max 2 iteracoes.

### Step 9: Generate WhatsApp Links
Para cada mensagem aprovada pelo Hopkins:
1. URL-encode a mensagem
2. Tratar caracteres especiais (newlines, acentos, emojis)
3. Montar link: `https://api.whatsapp.com/send?phone={phone}&text={encoded_message}`
4. Validar formato do link

### Step 10: Output
Gerar JSON com:
- prospect_name, phone, classification
- awareness_level (de @eugene-schwartz)
- big_idea_angle (de @leandro-ladeira)
- copy_clone_used (qual clone escreveu)
- raw_message, whatsapp_link
- audit_status (PASS de @claude-hopkins)

## Acceptance Criteria
- TODA mensagem foi escrita por um clone especialista (nao por outreach-writer sozinho)
- TODA mensagem passou pelo audit de @claude-hopkins
- Awareness definido por @eugene-schwartz (nao hardcoded)
- Big Idea definida por @leandro-ladeira (nao inventada)
- Clone selecionado por @copy-maestro (nao arbitrario)
- Contexto Ensinio aplicado por outreach-writer (Fosc, Antonio, classificacoes)
- WhatsApp links corretamente URL-encoded
- Cada mensagem e unica (nao copy-paste)
- Entradas variadas entre prospects

## Veto Conditions
- **BLOCKING:** Prospect analysis data not available (must be v3.0)
- **BLOCKING:** Mensagem escrita sem consultar squad de copy
- **BLOCKING:** Awareness definido sem consultar @eugene-schwartz
- **BLOCKING:** Big Idea definida sem consultar @leandro-ladeira
- **BLOCKING:** Mensagem nao passou pelo audit de @claude-hopkins
- **BLOCKING:** Prospect has no name or phone
- **BLOCKING:** Mensagem usa "socio fundador"
- **WARNING:** Prospect has low scores (client < 5 AND partner < 5)
- **WARNING:** No temporal context but messages are > 6 months old

## Error Handling
- **Squad indisponivel:** Log qual squad falhou, tentar fallback (carregar KB direto)
- **Clone FAIL no audit:** Reescrever max 2x, se persistir escalar para @copy-maestro
- **No prospect data:** HALT e pedir conclusao do analyze-prospects
- **URL encoding failure:** Log, skip prospect, continuar batch
- **Missing phone:** Skip e flag no error report

## Completion Criteria
Todos os prospects tem mensagens escritas por clones especializados, auditadas por Hopkins, montadas por outreach-writer com contexto Ensinio, com WhatsApp links funcionais.
