# Conclave LP Review — Metodo 3C

**Data:** 2026-03-27
**Experts:** Hormozi, Godin, Wiebe, GaryVee, Peep Laja, Oli Gardner
**Squads:** Copy Chief, Design Chief, Traffic Masters
**Objeto:** Landing Page "147 Prompts de IA para Advogados" (VORZA)

---

## Scores Atuais

| Avaliador | Score | Projetado |
|-----------|-------|-----------|
| Copy Chief | 7.1/10 | 8.8/10 |
| Design Chief (Design) | 7.0/10 | — |
| Design Chief (UX) | 6.5/10 | — |
| Traffic Masters (Ad Ready) | 5.0/10 | 8-9/10 |

---

## DECISOES UNANIMES (todos concordam)

### 1. MOSTRAR 1 PROMPT REAL FUNCIONANDO
- **Hormozi:** "E como vender faca sem mostrar ela cortando"
- **Godin:** "Demo ao vivo de 60s seria o Purple Cow"
- **Wiebe:** Confirma que prova concreta > promessa
- **Copy Chief:** Mudanca #1 que mais move a agulha
- **DECISAO:** Adicionar secao com prompt real completo (5 elementos) + resultado da IA

### 2. COMPRIMIR IMAGENS (4MB → ~1MB)
- **Laja:** "6 PNGs totalizando 4MB+ e inaceitavel para mobile. Bounce 53% se >3s"
- **Design Chief:** Converter para WebP reduz 80%
- **Traffic Masters:** Hero carrega ~1.2MB imediato, bounce alto em 3G
- **DECISAO:** Converter todos PNGs para WebP, lazy load abaixo do fold

### 3. CORRIGIR CTAs PLACEHOLDER
- **Todos:** #LINK_KIWIFY_CHECKOUT precisa ser substituido
- **DECISAO:** Substituir por placeholder descritivo ate link real chegar

### 4. MELHORAR CREDIBILIDADE DOS DEPOIMENTOS
- **Hormozi:** Iniciais anonimas + 5 estrelas em todos = red flag para advogados
- **Laja:** "Advogados sao o publico MAIS cetico. Treinados para questionar tudo"
- **Copy Chief:** Secao mais fraca (6.0/10), maior gargalo de conversao
- **DECISAO:** Adicionar OAB, cidade, especializacao. Formato mais credivel.

### 5. ADICIONAR URGENCIA
- **Copy Chief:** Zero urgencia na LP inteira
- **Hormozi:** Sem razao para comprar AGORA vs semana que vem
- **DECISAO:** Adicionar badge "Preco de Lancamento" com prazo limitado

### 6. ADICIONAR BADGE OAB PROVIMENTO 213/2025 NO HERO
- **Laja:** Elimina objecao #1 antes de surgir. +3-5% conversao
- **Godin:** Elemento de autoridade institucional necessario
- **DECISAO:** Badge "Reconhecido pela OAB — Provimento 213/2025" no hero

### 7. MOVER GARANTIA PARA PROXIMO DO HERO
- **Laja:** "Visitante precisa saber que tem saida ANTES de decidir. +5-10%"
- **Gardner:** Trust micro-badge ao lado do CTA
- **DECISAO:** Adicionar "Garantia 7 dias" como badge no hero, manter secao completa

### 8. CTAs FOCADOS NO RESULTADO (nao no produto)
- **Wiebe:** "QUERO MEUS 147 PROMPTS" e cliche. Focar no resultado.
- **Reescritas aprovadas:**
  - Hero: "COMECAR A ECONOMIZAR 3H POR PETICAO"
  - Pos-stack: "LIBERAR ACESSO IMEDIATO — R$27"
  - Final: "SIM, QUERO PRODUZIR EM 18 MINUTOS"

### 9. ADICIONAR CNPJ E PAGINAS LEGAIS
- **Traffic Masters:** Meta pode reprovar anuncios sem paginas legais
- **Laja:** Advogados checam CNPJ
- **Copy Chief:** Obrigatorio por lei
- **DECISAO:** CNPJ no footer + criar paginas Privacidade/Termos (mesmo que simples)

### 10. CORRIGIR CONTRASTE WCAG
- **Design Chief:** 5 falhas de contraste em texto sobre fundo escuro
- **DECISAO:** Aplicar correcoes CSS do relatorio Design Chief

### 11. FALLBACK NOSCRIPT
- **Design Chief:** Conteudo invisivel se JS falhar (opacity:0)
- **Laja:** Counters ficam em "0" se script falha
- **DECISAO:** Adicionar noscript fallback + valores estaticos default

---

## DECISOES POR MAIORIA (4+ experts)

### 12. REDUZIR COMPRIMENTO DA LP
- **Gardner:** "1047 linhas e LP de R$497+. Para R$27, ideal: 5 secoes"
- **Laja:** "50-60% dos visitantes mobile NUNCA vem garantia ou FAQ"
- **CONTRA:** Copy Chief acha que a estrutura esta solida
- **DECISAO:** Fundir secoes (Dor+Historia, Dicotomia+CTA Final). Manter core.

### 13. ADICIONAR BLOCO ROI VISUAL
- **Hormozi:** "1 peticao extra/dia x R$2.000 x 22 dias = R$44.000/mes vs R$27"
- **Copy Chief:** Confirma como melhoria de alto impacto
- **DECISAO:** Adicionar calculadora visual de ROI antes do value stack

### 14. REESCREVER HEADLINE DO HERO
- **Wiebe:** Atual e longa (24 palavras), jargao "Prompts" pode confundir
- **Reescrita aprovada:** "Peticoes em 18 Minutos (Nao em 3 Horas). 147 Modelos de IA Prontos Para Seu Escritorio."

### 15. LINKS LEGAIS EM MODAL
- **Gardner:** Links no footer sao saida. Abrir em modal mantem visitante na LP.
- **DECISAO:** Privacidade/Termos abrem em modal overlay

---

## DECISOES QUE PRECISAM DO USUARIO

### A. PRECO: R$27 ou R$37?
- Criativos de ads dizem R$37, LP diz R$37
- **Traffic Masters:** Decisao obrigatoria antes de gastar 1 centavo
- **DECIDIDO: R$37** — LP atualizada para R$37 em todos os pontos (CTAs, value stack, ROI, garantia, FAQ, Meta Pixel)

### B. LINK KIWIFY CHECKOUT
- **AGUARDANDO USUARIO** — Sem link real, LP nao funciona

### C. CNPJ PARA O FOOTER
- **AGUARDANDO USUARIO** — Precisa do CNPJ da VORZA ou pessoa fisica

---

## INSIGHTS ESTRATEGICOS (nao aplicaveis na LP, mas valiosos)

### GaryVee — Distribuicao
- LinkedIn organico e OBRIGATORIO para advogados
- Lead magnet: "5 Prompts Gratis" para capturar email
- Grupo WhatsApp exclusivo para compradores
- Conteudo "1 Prompt por Semana" cria habito

### Godin — Tribo
- Criar identidade tribal: "Advogados 3C" ou "Juristas Digitais"
- Badge compartilhavel: "Advogado Digital 2026"
- A LP vende produto, nao pertencimento — oportunidade perdida

### Hormozi — Backend/LTV
- Sem backend, R$27/cliente = precisa 370 clientes/mes para 10k
- Upsell imediato (thank you page): R$97-197
- Email sequence 7 dias
- Continuity R$47-97/mes com prompts atualizados

---

## PLANO DE EXECUCAO

### Fase 1 — Bloqueadores (executar AGORA)
1. Comprimir imagens para WebP
2. Corrigir contraste WCAG
3. Adicionar noscript fallback
4. Reescrever CTAs (resultado > produto)
5. Adicionar badge OAB Provimento 213 no hero
6. Adicionar badge garantia no hero
7. Adicionar urgencia (preco de lancamento)
8. Adicionar exemplo de prompt real
9. Melhorar depoimentos
10. Corrigir footer (CNPJ placeholder + links legais)
11. Adicionar bloco ROI visual
12. Fundir secoes para reduzir comprimento
13. Reescrever headline hero

### Fase 2 — Aguardando usuario
- Substituir link Kiwify real
- Definir preco final
- Adicionar CNPJ real
- Criar paginas legais completas

---

*Conclave realizado em 2026-03-27 por Orion (AIOS Master)*
*9 perspectivas: 6 mind clones + 3 squads*
