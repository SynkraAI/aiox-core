# Feature Requests — Backlog de Produto

> Demandas de features identificadas em calls de vendas/suporte (tl;dv)

## Priorização

| Prioridade | Critério |
|------------|----------|
| **P0 (Crítico)** | Impacto em churn ativo OU 3+ clientes solicitaram OU bloqueador para nicho grande |
| **P1 (Alto)** | 2 clientes solicitaram OU melhora significativa de retenção/conversão |
| **P2 (Médio)** | 1 cliente solicitou OU nice-to-have com impacto incremental |
| **P3 (Baixo)** | Estético ou edge case |

---

## P0 — CRÍTICO (Resolver URGENTE)

### FR-001: Dashboard de engajamento ("quem comprou X dias atrás e usou Y vezes")

**Solicitado por:** 3 clientes (Marlos/Aforismos, Elton, Gil Junior)

**Problema:**
- Cliente precisa saber: "Quem comprou há X dias e usou pelo menos Y vezes?"
- Hoje: Exportar vendas (jan) + exportar acessos (jan) → cruzar emails manualmente no Excel
- Não tem dashboard automática

**Impacto:**
- ALTO — Retenção depende disso
- Clientes usam para identificar quem precisa de follow-up
- Aforismos (40% churn risk) precisa desses dados para reduzir cancelamentos

**Workaround atual:** Cruzamento manual via Excel

**Solução esperada:**
Dashboard com filtros:
- Período de compra (ex: jan/2026)
- Frequência de acesso (ex: usou 3+ vezes)
- Resultado: Lista de emails + % conclusão + último acesso

**Status:** Backlog

**Fonte:** tl;dv calls batch 3 (Aforismos, Elton Luiz, Gil Junior), 2026-03-11 a 2026-03-14

---

### FR-002: Bug arquivo .apkg (Anki flashcards) — NÃO FUNCIONA

**Solicitado por:** 1 cliente (Gil Junior - CHURN RISK 85%)

**Problema:**
- Cliente de preparatórios (concursos) precisa de flashcards .apkg (Anki)
- Arquivo não funciona quando sobe (desconfigurado, não abre como deveria)
- **CRÍTICO** para nicho de concursos (PF, OAB, tribunais, militares)

**Impacto:**
- ALTO — Gil Junior em 85% churn risk por isso
- Nicho preparatórios é grande e lucrativo (R$ 50-200K/mês por cliente)
- Se perder Gil Junior, sinal negativo para todo o nicho

**Workaround atual:** Nenhum (bloqueador)

**Solução esperada:**
- Corrigir upload/processamento de arquivos .apkg
- Garantir que Anki consiga importar corretamente
- Testar com Gil Junior antes de validar

**Status:** Backlog (URGENTE — decisão dia 25)

**Fonte:** tl;dv call Gil Junior & Ensinio, 2026-03-14

---

## P1 — ALTO (Resolver em 1-2 meses)

### FR-003: Sessões por aula (não só módulo/grupo)

**Solicitado por:** 2 clientes (Camila Tourinho, não especificado)

**Problema:**
- Cliente quer criar sessão mostrando apenas aulas específicas (ex: "Cardio Intenso" só as aulas desse tema)
- Limitação técnica atual: só módulos ou grupos
- Alternativa atual: tipo módulo (mostra módulos do grupo) — mas não resolve

**Impacto:**
- MÉDIO — Limitação de UX, não bloqueante
- Afeta clientes com múltiplos produtos (fitness, preparatórios)

**Workaround atual:** Criar grupos separados (não ideal)

**Solução esperada:**
- Permitir criar sessão com filtro de aulas específicas
- Ex: "Mostrar apenas aulas com tag 'Cardio Intenso'"

**Status:** Backlog

**Fonte:** tl;dv call Camila Tourinho, 2026-03-14

---

### FR-004: Marca d'água em vídeo (DRM) — Ensinio Stream

**Solicitado por:** 1 cliente (Flavia Affonso)

**Problema:**
- Cliente preocupado com pirataria/cópia de vídeos
- Tem histórico de plagiadores
- DRM social em PDF já existe, mas não em vídeo

**Impacto:**
- MÉDIO — Proteção de conteúdo premium
- Nicho artesanato/cursos longos valoriza isso

**Workaround atual:** DRM social apenas em PDFs

**Solução esperada:**
- Marca d'água dinâmica em vídeo (nome do aluno + email)
- Integração com Ensinio Stream

**Status:** Em desenvolvimento (segundo Bhrenda na call)

**Fonte:** tl;dv call Flavia Affonso & Ensinio, 2026-03-14

---

## P2 — MÉDIO (Resolver em 3-6 meses)

### FR-005: Comissionamento de afiliados por cupom (não só link)

**Solicitado por:** 1 cliente (Mel Guedes - gestora de afiliados do Prof Fredão)

**Problema:**
- Hoje: comissão só por link de afiliado
- Cliente quer: comissionar por cupom também
- Motivo: rastrear campanhas específicas (ex: cupom "BLACK30" do afiliado X)

**Impacto:**
- BAIXO-MÉDIO — Nice-to-have para gestão avançada de afiliados
- Não bloqueia vendas, só dificulta atribuição

**Workaround atual:**
- Cupons existem, mas sem comissão atrelada
- Cliente usa cupons apenas para rastreio de campanha, não para comissionar

**Solução esperada:**
- Permitir vincular cupom a afiliado
- Comissão calculada automaticamente quando cupom é usado

**Status:** Backlog (refatoração completa necessária segundo Bhrenda)

**Fonte:** tl;dv call Prof. Fredão & Ensinio, 2026-03-14

---

### FR-006: Botão SSO (Okta) em segundo plano — não em destaque

**Solicitado por:** 2 clientes (Prof. Fredão, TexPlay/Okta)

**Problema:**
- Botão "Entrar com Okta" em destaque na tela de login
- Cliente final (alunos) não usa Okta, só interno
- Confunde UX

**Impacto:**
- BAIXO — Questão estética, não bloqueante
- Afeta apenas clientes B2B/Enterprise com SSO

**Workaround atual:** Nenhum (cliente convive com isso)

**Solução esperada:**
- Colocar botão SSO embaixo do email/senha (secundário)
- Ou permitir customizar visibilidade do botão SSO

**Status:** Backlog (dev vai avaliar viabilidade)

**Fonte:** tl;dv calls batch 3 (Prof. Fredão, 04032026-Meeting), 2026-03-14

---

## P3 — BAIXO (Backlog futuro)

### FR-007: Split de pagamento nativo (2 cartões)

**Solicitado por:** 1 cliente (Rossana Ielestein - Rica Pro)

**Problema:**
- Cliente quer permitir pagamento em 2 cartões (ex: R$ 5K = R$ 2,5K + R$ 2,5K)
- Não existe split nativo

**Impacto:**
- BAIXO — Edge case (lançamentos de alto ticket R$ 5K+)
- Workaround gambiarra funciona (produto auxiliar + redirect)

**Workaround atual:**
- Criar grupo auxiliar (R$ 2,5K) → página de obrigado redireciona para oferta principal (R$ 2,5K)
- Não ideal, mas funciona

**Solução esperada:**
- Checkout com opção "Parcelar em 2 cartões"
- Cliente digita valor 1 + cartão 1, valor 2 + cartão 2

**Status:** Backlog (baixa prioridade)

**Fonte:** tl;dv call Rica Pro & Ensinio, 2026-03-14

---

## Resumo Executivo

| Prioridade | Quantidade | Impacto Estimado |
|------------|------------|------------------|
| **P0** | 2 | ALTO — Churn risk ativo (Gil 85%) + retenção (3 clientes) |
| **P1** | 2 | MÉDIO — UX + proteção de conteúdo |
| **P2** | 2 | BAIXO-MÉDIO — Gestão avançada + estética |
| **P3** | 1 | BAIXO — Edge case com workaround |

**Total:** 7 feature requests

---

## Próximos Passos

1. **P0 URGENTE:**
   - FR-002 (bug .apkg) → Resolver antes do dia 25 (decisão Gil Junior)
   - FR-001 (dashboard engajamento) → Evita churn de Aforismos e outros

2. **P1 (1-2 meses):**
   - FR-003 (sessões por aula) → 2 clientes solicitaram
   - FR-004 (marca d'água vídeo) → já em desenvolvimento

3. **P2-P3 (backlog):**
   - Avaliar ROI vs esforço de desenvolvimento
   - Priorizar quando houver mais clientes solicitando

---

**Versão:** 1.0.0 | **Criado:** 2026-03-14 | **Fonte:** tl;dv calls batch 3 (16 calls, 2026-03-14)
