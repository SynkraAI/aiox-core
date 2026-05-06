# 05 — Tools Stack: Comparativo + Recomendação Final

**Pergunta:** qual ferramenta de email marketing usar para Vorza?

**Resposta curta:** **RESEND** (recomendação principal). Fallback **MailerLite** se user quiser GUI mais visual / não-técnico.

---

## 1. Comparativo: 5 Tools Considerados

| Critério | Resend | MailerLite | ActiveCampaign | Mailchimp | RD Station |
|---|---|---|---|---|---|
| **Custo até 1k contatos** | $0 | $0 | $15/mês (R$80) | $13/mês (R$70) | R$159/mês |
| **Custo até 5k contatos** | $0 (até 3k emails/mo) ou $20 | $9/mês | $49/mês | $20/mês | R$329/mês |
| **Custo até 10k contatos** | $20 | $18 | $79 | $35 | R$549 |
| **Limite emails/mês (free)** | 3.000 | 12.000 | — | 1.000/dia | — |
| **Automation (sequence)** | ✅ Trigger via API | ✅ GUI visual | ✅ GUI mais robusta | ✅ GUI básica | ✅ GUI BR-friendly |
| **Segmentation** | ✅ Audiences | ✅ Groups + Tags | ✅ Tags + Lists | ✅ Tags | ✅ Listas |
| **Form / Popup nativo** | ❌ (precisa custom) | ✅ Embed + popup | ✅ Embed + popup | ✅ Embed + popup | ✅ Embed |
| **Templates de email** | ⚠ Mínimo, precisa codar | ✅ 60+ templates | ✅ 100+ templates | ✅ 100+ templates | ✅ 30+ BR |
| **Deliverability BR** | 🟢 Alta (IP rotation moderna) | 🟢 Alta | 🟢 Alta | 🟡 Média (deplatforming risk) | 🟢 Alta (BR-native) |
| **Suporte PT-BR** | ❌ Inglês | ❌ Inglês | ❌ Inglês | 🟡 Parcial | ✅ PT-BR |
| **API + dev-friendly** | 🟢 BEST | ✅ Boa | ✅ Boa | 🟡 OK | 🟡 OK |
| **Webhook Kiwify direto** | ✅ Custom webhook | ✅ Zapier/native | ✅ Native | ✅ Native | ✅ Native |
| **GDPR/LGPD compliance** | ✅ | ✅ | ✅ | ✅ | ✅ (BR-native) |
| **Deplatforming risk para "make money/IA niche"** | 🟢 Baixo | 🟢 Baixo | 🟢 Baixo | 🔴 ALTO (banido várias contas) | 🟢 Baixo |
| **Performance carregamento email** | 🟢 Rápido | 🟢 Rápido | 🟡 Médio | 🟡 Médio | 🟡 Médio |

---

## 2. Análise por Critério Crítico

### 2.1. CUSTO (mais importante para Vorza com 0 leads iniciais)

**Cenário 1 — Primeiros 30 dias (0 → ~200 leads):**
- Resend: **R$0**
- MailerLite: **R$0**
- ActiveCampaign: **R$80** ($15)
- Mailchimp: **R$0** (até 500) → R$70 ($13) >500
- RD Station: **R$159**

**Vencedor: Resend ou MailerLite**

**Cenário 2 — 6 meses depois (~3k leads, ~10k emails/mês):**
- Resend: **R$108** ($20) — fica caro se ultrapassar 50k emails
- MailerLite: **R$50** ($9)
- ActiveCampaign: **R$262** ($49)
- Mailchimp: **R$108** ($20)
- RD Station: **R$329**

**Vencedor: MailerLite**

**Cenário 3 — 12 meses depois (~10k leads, ~40k emails/mês):**
- Resend: **R$108** ($20) ← fica MAIS BARATO neste cenário
- MailerLite: **R$98** ($18)
- ActiveCampaign: **R$425** ($79)
- Mailchimp: **R$190** ($35)
- RD Station: **R$549**

**Vencedor: empate Resend/MailerLite**

### 2.2. DEPLOYMENT TIME (Vorza precisa subir RÁPIDO)

| Tool | Setup completo (form + automation + templates) |
|---|---|
| Resend | 4-6h (precisa codar templates, integrar form custom) |
| MailerLite | 2-3h (GUI drag-drop, templates prontos) |
| ActiveCampaign | 3-4h (curva mais íngreme) |
| Mailchimp | 2-3h (GUI familiar) |
| RD Station | 4-6h (workflow complexo BR-style) |

**Vencedor: MailerLite ou Mailchimp**

### 2.3. RISCO DE DEPLATFORMING

**Mailchimp tem histórico documentado de banir contas em nichos:**
- "Make money online"
- "Crypto/NFT"
- "AI prompts" / "ChatGPT" (recente, 2024-2025)
- "Marketing/copywriting cursos"

**Vorza vende prompts de IA → ALTO RISCO no Mailchimp.**

**Resend, MailerLite, ActiveCampaign, RD Station: sem histórico de deplatforming neste nicho.**

**Eliminação direta: Mailchimp ❌**

### 2.4. DELIVERABILITY BRASIL

Todos os 4 restantes têm boa deliverability no Brasil. Diferenciais:
- **RD Station** tem IPs dedicados em SP/BR (vantagem marginal)
- **Resend** usa IPs modernos com warm-up automático (vantagem técnica)
- **MailerLite** e **ActiveCampaign** usam IPs compartilhados (médio)

**Vencedor marginal: Resend ou RD Station**

### 2.5. INTEGRAÇÃO COM STACK ATUAL VORZA

**Stack atual:**
- Landing page: Netlify (static)
- Checkout: Kiwify
- Pixel: Meta híbrido + Kiwify
- Tracking: client-side principalmente

**Resend brilha aqui:** API-first, integra naturalmente com Netlify Edge Functions, fácil disparar email a partir de webhook Kiwify.

**MailerLite tem:** integration nativa com Kiwify (Brasil). Webhook automático.

**ActiveCampaign:** integração nativa Kiwify também.

**RD Station:** integração nativa Kiwify (BR-pareado).

---

## 3. Recomendação Final do Conclave

### 3.1. Recomendação principal: **RESEND**

**Por quê:**
1. **CUSTO ZERO** durante construção da lista (0-3k emails/mês caem em FREE TIER)
2. **API-first** = perfeito para stack Netlify + integrações custom
3. **Deliverability moderna** (IPs novos, warm-up automático)
4. **Sem risco de deplatforming** para nicho IA prompts
5. **Cresce com Vorza** — mesmo em 12 meses ainda fica em $20/mês (vs $79 ActiveCampaign)
6. **Documentação técnica excelente** para developers (e Orion/AIOS prefere code-as-config)

**Trade-off aceito:**
- Não tem GUI visual de automation flow → user precisa configurar via JSON/dashboard básico
- Templates email precisam ser HTML codado (mas Resend tem builder simples)
- Form de captura precisa ser custom (HTML+JS no LP, Resend só recebe API call)

### 3.2. Recomendação fallback: **MAILERLITE**

**Quando escolher MailerLite em vez de Resend:**
- User NÃO quer mexer com código de email
- Prefere drag-and-drop visual
- Quer popup de captura nativo (sem precisar codar)
- Está OK pagando R$50-100/mês a partir do mês 6

**Trade-off:**
- Menos flexibilidade técnica
- Templates podem ficar genéricos
- Brand voice fica menos customizada

### 3.3. ELIMINADOS (não usar)

| Tool | Razão de eliminação |
|---|---|
| **Mailchimp** | Risco de deplatforming alto para nicho IA prompts |
| **ActiveCampaign** | Caro demais para fase de validação (R$80+/mês desde mês 1) |
| **RD Station** | Overkill para low-ticket B2C; preço alto (R$159+/mês), GUI feita para B2B com SDR |

---

## 4. Setup Resend — Passo a Passo

### 4.1. Conta e domínio

1. Criar conta em **resend.com** (free tier)
2. Adicionar domínio **vorza.com.br** (ou subdomínio `mail.vorza.com.br`)
3. Configurar DNS:
   - **SPF:** `v=spf1 include:_spf.resend.com ~all`
   - **DKIM:** TXT record fornecido pelo Resend
   - **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@vorza.com.br`
4. Aguardar verificação (5-30 min)
5. **Warm-up:** começar enviando 50 emails/dia por 7 dias antes de blast (Resend faz auto)

### 4.2. Audiences (segmentação)

Criar 4 audiences:
1. **`vorza-advogados`** — leads de LP advogados ou opt-in com profissão = Advogado
2. **`vorza-mei`** — leads MEI
3. **`vorza-professores`** — leads Professor
4. **`vorza-outros`** — leads sem nicho definido

### 4.3. Form de captura (custom HTML)

Endpoint Resend para adicionar contato:
```
POST https://api.resend.com/audiences/{audience_id}/contacts
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "email": "user@email.com",
  "first_name": "Nome",
  "data": {
    "profissao": "advogado"
  }
}
```

User/dev cria HTML form na LP que faz POST para um Edge Function Netlify que chama Resend API.

**Alternativa (mais simples):** usar widget de form que algum serviço como **ConvertKit forms** ou **Tally.so** fornece, e dispara webhook → Edge Function → Resend.

### 4.4. Automation (sequência D+0 → D+10)

**Resend não tem GUI de automation flow nativo (em maio/2026).**

**Solução:** usar **Resend Sequences** (feature em GA desde Q1/2026) ou implementar via:
- **Cron Edge Function Netlify** + tabela de subscribers + lógica "se subscriber inscrito há X dias, enviar email Y"
- OU **Trigger.dev** (open-source workflow) integrado com Resend
- OU **Zapier** (mais lento, mais caro a longo prazo)

**Recomendação:** começar com **Resend Sequences** se já estiver disponível no plano free (verificar em maio/2026). Se não, usar Trigger.dev (free tier generoso).

### 4.5. Templates dos emails

Templates em **HTML simples** (Resend recomenda usar **react-email** ou **MJML**).

Para Vorza (estética minimalista, lowercase, brand voice Handley), templates devem ser:
- **Texto-first** (não design-heavy como newsletters corporativas)
- **Largura ~600px máximo**
- **Sans-serif** (Helvetica, Arial, Inter)
- **Sem header/footer pesado** (só logo Vorza pequeno + unsubscribe link)
- **CTA com botão grande no centro**
- **Cores Vorza** (consultar brand book; provavelmente preto/branco/laranja se Aurora paleta)

---

## 5. Setup MailerLite (alternativa) — Passo a Passo

### 5.1. Conta e domínio

1. Criar conta em **mailerlite.com** (free tier — até 1k contatos, 12k emails/mês)
2. Verificar domínio (DNS DKIM + SPF)
3. Avatar/branding básico

### 5.2. Groups (segmentação)

Criar 4 groups:
1. `Vorza - Advogados`
2. `Vorza - MEI`
3. `Vorza - Professores`
4. `Vorza - Outros`

### 5.3. Form de captura

Usar **MailerLite Forms** nativo:
- Tipo: Popup ou Embed
- Customização visual via GUI
- Field "Profissão" (dropdown) faz auto-grouping
- Embed code 1 linha de JS na LP

### 5.4. Automation

Workflow visual com triggers:
- **Trigger:** "Joins group X"
- **Step 1:** Wait 0 days → Send email "Pack chegou"
- **Step 2:** Wait 1 day → Send email "História"
- **Step 3:** Wait 1 day → Send email "Caso de uso"
- ...etc

Drag-drop, fácil de configurar.

### 5.5. Templates

70+ templates prontos. Para Vorza, escolher template **"Plain text style"** ou **"Newsletter minimalista"**, customizar.

---

## 6. Custos Comparados (12 meses)

**Cenário realista: lista cresce 0 → 3k em 12 meses, envio médio 4 emails/contato/mês.**

| Mês | Lista | Emails/mês | Resend | MailerLite |
|---|---|---|---|---|
| 1 | 100 | 400 | $0 | $0 |
| 3 | 500 | 2.000 | $0 | $0 |
| 6 | 1.500 | 6.000 | $20 | $9 |
| 9 | 2.500 | 10.000 | $20 | $18 |
| 12 | 3.500 | 14.000 | $20 | $25 |

**Total 12 meses:**
- **Resend: ~$140 (~R$760)**
- **MailerLite: ~$110 (~R$600)**

Diferença: ~R$160/ano. Insignificante.

**Critério desempate: técnico (Resend vence) ou facilidade (MailerLite vence).**

---

## 7. Decisão Final + Razão

**Recomendação Conclave (consenso 4 de 5):** **RESEND**

**Voto único divergente: handley** — "para alguém que NUNCA fez email marketing, MailerLite é menos ansiogênico. Mas se tem dev (ou Orion ajudando), Resend é melhor."

**Decisão final Orion:** **RESEND**, porque:
1. User tem stack Netlify + tem Orion/AIOS para suporte técnico
2. Free tier inicial reduz risco de drain financeiro durante validação
3. Long-term, custo cresce mais lentamente que MailerLite (vantagem em $20 fixo)
4. Brand voice Handley pede emails simples (texto-first), perfeitos para Resend

**Se user reclamar de complexidade técnica**, downgrade para MailerLite em <30 min.

---

## 8. Riscos Específicos da Recomendação Resend

| Risco | Mitigação |
|---|---|
| User não consegue configurar automation sem ajuda técnica | Orion/AIOS escreve scripts Edge Function (1-2h trabalho) |
| Resend ainda em maturação (lançado 2023) — possível bug | Backup mensal de lista exportada CSV |
| Sequence feature pode ainda estar em beta em maio/2026 | Verificar; se beta, usar Trigger.dev como fallback |
| Templates HTML codados podem ter inconsistências mobile | Testar em Litmus ou Email on Acid antes de blast |

---

## 9. Migration Path (se um dia precisar trocar)

**Vendor lock-in baixo:** todos os tools exportam CSV de contatos. Migração de Resend → MailerLite (ou vice-versa) é ~1 dia de trabalho.

**Lock-in real:** automation flow precisa ser recriado manualmente. Isso é trabalho de 4-8h.

**Recomendação:** documentar todas as automations em markdown (este documento + `02-email-sequence.md` + `07-implementation-checklist.md`) para que migration seja recopy-paste.

---

— *Stack definido. Resend é a escolha. MailerLite é o plano B. Mailchimp/AC/RD eliminados. Next: 06-success-metrics.md.*
