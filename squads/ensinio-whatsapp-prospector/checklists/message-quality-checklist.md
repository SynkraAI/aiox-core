# Message Quality Checklist (v3.0 — Squad Delegation)

## Pre-requisitos
- [ ] Dados do prospect carregados (nome, telefone, projeto, score, classificacao, dor)
- [ ] Squads de copy consultados (awareness, big idea, clone executor, audit)
- [ ] Classificacao do prospect definida (7 tipos)

## Delegacao Confirmada (CRITICO, NON-NEGOTIABLE)
- [ ] @eugene-schwartz definiu awareness level (NAO foi hardcoded por outreach-writer)
- [ ] @leandro-ladeira definiu Big Idea para o cluster de dor
- [ ] @copy-maestro selecionou clone executor
- [ ] Clone executor escreveu o draft da mensagem
- [ ] @claude-hopkins auditou a mensagem final (PASS)
- [ ] outreach-writer NAO escreveu copy sozinho em nenhum momento

## Copy Quality — DELEGADO ao @claude-hopkins
Referencia: `squads/copywriting-squad/checklists/audit-copy-hopkins.md`

O audit de qualidade de copy (tom humano, persuasao, estrutura, anti-patterns de IA)
e responsabilidade do @claude-hopkins, NAO do outreach-writer.

outreach-writer apenas confirma:
- [ ] @claude-hopkins retornou PASS para esta mensagem
- [ ] Se retornou FAIL, ajustes foram aplicados e re-auditados

## Contexto Ensinio (outreach-writer valida)
- [ ] Fosc apresentado como "um dos fundadores", NUNCA "socio fundador"
- [ ] Fosc esta no grupo TAMBEM (pertence ao mesmo circulo)
- [ ] Condicao especial mencionada (por serem do mesmo grupo)
- [ ] Fosc como quem "pediu" pra mandar a mensagem
- [ ] Antonio como remetente

## Classificacao Correta (outreach-writer valida)
- [ ] CLIENTE_PURO: foco na dor + oferta de valor
- [ ] CLIENTE_INDICADOR: foco na dor + mencao leve de indicacao
- [ ] CLIENTE_EMBAIXADOR: foco na dor como cliente, SEM parceria na 1a msg
- [ ] PARCEIRO_TATICO: soft approach, sem pressao
- [ ] PARCEIRO_ESTRATEGICO: proposta de parceria + condicao diferenciada
- [ ] AFILIADO_PURO: programa de afiliados, tom leve
- [ ] CANAL_PREMIUM: parceria formal + prova social

## Entrada Variada (outreach-writer valida)
- [ ] Abertura diferente de outros prospects do mesmo batch
- [ ] Alternancia natural entre variacoes

## Contexto Temporal (outreach-writer valida)
- [ ] Se mensagem antiga (>90 dias): ponte temporal forte
- [ ] Se mensagem media (30-90 dias): ponte temporal leve
- [ ] Se mensagem recente (<30 dias): sem ponte

## Link WhatsApp (outreach-writer valida)
- [ ] Telefone no formato correto (+55XXXXXXXXXXX)
- [ ] Mensagem URL-encoded corretamente
- [ ] Quebras de linha codificadas (%0A)
- [ ] Acentos codificados corretamente
- [ ] Emojis codificados corretamente
- [ ] Link funcional e clicavel

## Rastreabilidade (NOVO em v3.0)
- [ ] awareness_level registrado no output (veio de @eugene-schwartz)
- [ ] big_idea_angle registrado no output (veio de @leandro-ladeira)
- [ ] copy_clone_used registrado no output (qual clone escreveu)
- [ ] audit_status registrado no output (PASS de @claude-hopkins)

## Aprovacao Final
- [ ] Mensagem montada por outreach-writer COM estrategia dos especialistas
- [ ] Passaria no "teste do amigo" (parece mensagem de pessoa real?)
- [ ] Passaria no "teste do grupo" (3 pessoas comparando nao percebem padrao?)
- [ ] Informacoes do prospect estao corretas
- [ ] Nenhum squad obrigatorio foi pulado
