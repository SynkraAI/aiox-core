# 04 — Meta Paralelo: O Que Muda

**Decisão:** manter Meta Ads ATIVO em paralelo, mas com objetivo, audience e copy DIFERENTES do que estava antes. Não jogar fora os 71% view rate da LP redesignada.

---

## 1. Mudança Conceitual

| Antes (até 05/Mai) | Agora (pós-pivô) |
|---|---|
| **Objetivo:** Conversion (Purchase) | **Objetivo:** Lead (Lead Form) ou Conversion (Lead) |
| **Otimização:** Purchase event | **Otimização:** CompleteRegistration / Lead event |
| **Mensagem ad:** "Compre o pack R$10-30" | **Mensagem ad:** "Pega o PDF grátis" |
| **CTA ad:** Comprar agora | **CTA ad:** Baixar grátis |
| **Destino:** LP de venda | **Destino:** LP de venda COM popup opt-in |
| **Budget:** R$40/d | **Budget:** R$20/d (50% redução) |
| **Audience:** broad targeting | **Audience:** lookalike de leads + interests segmentados |

---

## 2. Configuração Meta Ads — Nova Campanha

### 2.1. Estrutura de campanha

```
CAMPANHA: VRZ-LEAD-MAGNET-MAY26
├─ Objetivo: Lead Generation (Outcome: Leads)
├─ Tipo: Conversions (otimizado para Lead event)
├─ Budget: R$20/d (Campaign Budget Optimization OFF — controle por adset)
├─ Schedule: Standard (não accelerated)
└─ Bid strategy: Highest Volume (sem cost cap inicial)

   ADSETS (3 paralelos, R$6.67/d cada):

   ADSET A — Advogados (33%)
   ├─ Audience: Interests "Direito" + "OAB" + "Advogado" + "Petição"
   ├─ Geo: Brazil (PRESENCE), excluir DDD <11 e >99 (validação)
   ├─ Age: 28-55
   ├─ Gender: All
   ├─ Placement: Manual (Feed Insta + Feed FB + Stories)
   ├─ Optimization: Lead event
   └─ Budget: R$6.67/d

   ADSET B — MEI / Pequeno Empresário (33%)
   ├─ Audience: Interests "MEI" + "Empreendedor" + "Pequeno negócio"
   │            + Behaviors "Small business owners" (BR)
   ├─ Geo: Brazil (PRESENCE)
   ├─ Age: 25-50
   ├─ Optimization: Lead event
   └─ Budget: R$6.67/d

   ADSET C — Professores (33%)
   ├─ Audience: Interests "Professor" + "Educação" + "Plano de aula"
   │            + Job titles "Professor", "Teacher" (BR)
   ├─ Geo: Brazil (PRESENCE)
   ├─ Age: 28-55
   ├─ Optimization: Lead event
   └─ Budget: R$6.67/d

      ADS (mesmos 2 ads em cada adset — 1 video + 1 static):

      AD-VID — Vídeo 30s
      └─ Hook (3s): mostrando ChatGPT abrindo no celular
                     "Você abriu isso 12 vezes essa semana e
                     desistiu 11. Eu sei por quê."

      AD-IMG — Imagem (carousel 3 slides)
      └─ Slide 1: "O ChatGPT te dá texto genérico?
                   Não é o ChatGPT. É como você pergunta."
      └─ Slide 2: "Pega 10 prompts já testados em
                   [advogado/MEI/professor] brasileiro."
      └─ Slide 3: "Português. Resultado em 5 minutos.
                   Grátis. → BAIXAR PDF"
```

### 2.2. Mudanças de configuração técnica

| Configuração | Antes | Agora | Razão |
|---|---|---|---|
| Optimization Goal | Purchase | Lead | Mais sinal estatístico (5-10x mais events/dia com R$20) |
| Budget | R$40/d | R$20/d | Foco no email; Meta vira complemento |
| Adsets paralelos | 1-2 | 3 | Segmentação por nicho permite copy específico |
| Audience | Broad | Interest-based + Lookalike | Pessoas que JÁ procuram solução de IA convertem mais para lead |
| Placement | Auto | Manual (Feed + Stories) | Reels e Audience Network têm CTR alta mas conversion baixa para lead form |

---

## 3. Copy dos Ads — 3 Versões

### 3.1. AD-VID-ADV (Vídeo 30s para Advogados)

**Hook (0-3s):** Cena do ChatGPT aberto no celular, dedo deslizando frustrado.
**Voz off (caixa baixa, conversacional):**
> "Você abriu o ChatGPT umas 12 vezes essa semana. E desistiu de 11. Eu sei por quê."

**Body (4-22s):** Texto na tela enquanto mostra prompts sendo digitados:
> "ChatGPT te dá texto genérico americano. Pra advogado brasileiro, INÚTIL.
>
> Não é o ChatGPT. É como você pede.
>
> Eu testei 50 prompts em advogados de banca pequena.
> 10 que funcionam de verdade tô oferecendo de graça."

**CTA (23-30s):** Card final com:
> "PEGA O PACK GRÁTIS
> 10 PROMPTS PARA ADVOGADO BRASILEIRO
> [Botão: BAIXAR PDF]"

**Texto descritivo do ad (caption):**
```
10 prompts AI que funcionam de verdade pra advogado
brasileiro. Petição inicial em 7min, cobrança que
rende, contrato sem retrabalho.

Em PT-BR. Testado em casos reais. Não é
"prompts genéricos do TikTok".

Baixa o PDF, lê hoje, usa amanhã.

Grátis. Sem upsell escondido.

→ vorza.com.br/advogados
```

### 3.2. AD-VID-MEI (Vídeo 30s para MEI)

**Hook:** Cena de WhatsApp aberto com cliente cobrando preço.
**Voz off:**
> "Aquele cliente que sumiu há 3 meses. Você ia cobrar quando? Hoje. Em 2 minutos. Sem parecer chato."

**Body:**
> "12 prompts pra MEI brasileiro: cobrar, propor, anunciar, responder.
>
> Cada um testado num cliente real.
>
> Pega de graça."

**Caption:**
```
MEI brasileiro: 10 prompts AI que cabem no seu dia
sem virar curso de 40h.

Cobrar cliente sumido. Fechar proposta no WhatsApp.
Postar no Insta sem travar.

Tudo em PT-BR, copia e cola.

Grátis. → vorza.com.br/mei
```

### 3.3. AD-VID-PROF (Vídeo 30s para Professores)

**Hook:** Cena de planilha de notas com 40 alunos abertos.
**Voz off:**
> "Domingo à noite. Você devia tar com a família. Mas tá fazendo plano de aula. De novo."

**Body:**
> "10 prompts AI pra professor brasileiro: plano de aula em 5min, avaliação com gabarito, atividade diferenciada.
>
> Pega o pack. Recupera o domingo."

**Caption:**
```
Professor brasileiro: pack 10 prompts AI testados
em sala de aula real (Fundamental + Médio).

Plano de aula em 5 min. Avaliação com gabarito.
Mensagem pra pai sem ofender.

Grátis. → vorza.com.br/professores
```

---

## 4. Configuração Pixel + Eventos

### 4.1. Eventos a rastrear

| Evento | Quando dispara | Para que serve |
|---|---|---|
| **PageView** | Visita LP | Audiência base |
| **ViewContent** | View 25% LP | Engagement signal |
| **Lead** | Submeteu form opt-in | Optimization principal Meta |
| **CompleteRegistration** | Confirmou e-mail (double opt-in) | Lead qualificado |
| **InitiateCheckout** | Clicou no link Kiwify do E5 | Funnel intent |
| **Purchase** | Comprou no Kiwify | ROAS final |

### 4.2. Conversion API (CAPI) — recomendação

**Status atual Vorza:** Pixel híbrido LGPD LIVE (browser-side).

**Recomendação:** **adicionar CAPI server-side** via Edge Function (Netlify) ou usando Resend webhook → Meta CAPI.

**Por quê:** iOS 14.5+ ATT block + AdBlockers reduzem captura browser-side em 30-40%. CAPI recupera ~70% dos sinais perdidos.

**Quem implementa:** @aios-dev (não Copy Chief). Adicionar à backlog técnica.

---

## 5. Relação Meta × Email

### 5.1. Fluxo completo

```
Meta Ad → LP Vorza → Opt-in (Resend) → Sequência 7 emails (Resend)
                                       ↓
                              Pixel dispara LEAD em Meta
                                       ↓
                          Meta otimiza para mais perfis similares
                                       ↓
                              Email vende front-end R$27
                                       ↓
                              Pixel dispara PURCHASE em Meta
                                       ↓
                          Meta otimiza para PERFIS QUE COMPRAM
                                       ↓
                          (após 50+ purchases) muda para
                          Conversion Purchase optimization
```

### 5.2. Quando mudar de LEAD para PURCHASE optimization

**Trigger:** quando atingir **50 Purchase events em 7 dias rolling.**

Razão: Meta precisa de ~50 events em 7d para sair de Learning Phase em Purchase optimization. Antes disso, otimizar para Lead (mais events = mais sinal).

**Estimativa:** com R$20/d e CPL R$3, geraria ~7 leads/dia = 210 leads/mês. Com 2% conv front-end, ~4 sales/mês = MUITO ABAIXO de 50/7d.

**Conclusão:** Meta vai ficar em LEAD optimization por **3-6 meses**. Não tente migrar antes.

---

## 6. Targets e Gates

### 6.1. KPIs Meta paralelo (revisão semanal)

| Métrica | Pessimista | Realista | Otimista |
|---|---|---|---|
| **CPL (cost per lead)** | R$5+ | R$2-3 | R$0.80-1.50 |
| **Lead form conv rate** | 8% | 15% | 25% |
| **CTR (link click)** | 0.8% | 1.5% | 3% |
| **Spend / lead** | — | — | — |
| **Leads/dia** | 4 | 7 | 15 |

### 6.2. Gate D+7 Meta paralelo

**Decisão GO/NO-GO em 7 dias após reativação:**

| Cenário | Ação |
|---|---|
| CPL ≤ R$3 + Lead conv ≥ 12% | ✅ MANTER R$20/d, considerar escalar para R$30/d |
| CPL R$3-5 + Lead conv 8-12% | 🟡 OTIMIZAR criativos (testar 3 novos hooks) |
| CPL > R$5 + Lead conv <8% | 🔴 PAUSAR Meta, focar 100% em orgânico para opt-in |

### 6.3. Gate D+30 Meta paralelo

**Decisão final:**

| Cenário | Ação |
|---|---|
| EPL > CPL (ROI positivo) | ✅ ESCALAR para R$50-100/d |
| EPL ≤ CPL mas crescimento de lista 200+/mês | 🟡 MANTER R$20/d (CAC aceitável para construção de ativo) |
| EPL << CPL E lista <100/mês | 🔴 KILL Meta, evitar drain |

---

## 7. Riscos do Meta Paralelo

| Risco | Mitigação |
|---|---|
| **Approve do ad demorado (Meta hostile a "make money" niche)** | Escrever copy SEM "ganhe dinheiro" / "automatize seu trabalho". Foco em "economia de tempo" + "qualidade". |
| **Lead form Meta nativo vs LP popup — qual converte mais?** | A/B testar nas primeiras 2 semanas. Lead Form Meta tem auto-fill (mais leads, qualidade menor). LP popup tem qualidade maior, conversion menor. |
| **CAPI ainda não server-side** | Aceitar perda de 30% sinal por enquanto; @aios-dev implementa CAPI em sprint paralela. |
| **Audience overlap entre os 3 adsets** | Excluir mutual: Adset A exclui interests de B e C, etc. |
| **Frequency cap em audience pequena** | Monitorar; se freq > 3.5, pausar adset por 48h. |

---

## 8. O que NÃO Fazer no Meta Paralelo

- ❌ Reotimizar para PURCHASE com R$20/d (insuficiente)
- ❌ Usar Advantage+ Audience (broad demais para nicho profissional)
- ❌ Criar 6 adsets para "testar mais audiences" (R$20/d = R$3.33/adset, abaixo do mínimo viável)
- ❌ Mudar copy do ad antes de 7 dias (fragmenta sinal)
- ❌ Postar lead magnet em Stories sem CTA "swipe up" (Meta não permite link em Stories pra contas <10k)
- ❌ Esquecer de configurar UTM no link (sem UTM = sem tracking de qual ad converteu)

---

## 9. UTMs Padrão

```
Source: meta
Medium: paid_lead
Campaign: VRZ-LEAD-MAGNET-MAY26
Content: ad-vid-adv | ad-vid-mei | ad-vid-prof | ad-img-{nicho}
Term: {adset name}
```

Exemplo URL:
```
https://vorza.com.br/advogados?utm_source=meta&utm_medium=paid_lead&utm_campaign=VRZ-LEAD-MAGNET-MAY26&utm_content=ad-vid-adv&utm_term=adv-interest
```

---

## 10. Reativar Meta — Checklist

| # | Tarefa | Responsável | Tempo |
|---|---|---|---|
| 1 | Criar nova campanha VRZ-LEAD-MAGNET-MAY26 | User | 30 min |
| 2 | Configurar 3 adsets (Adv/MEI/Prof) | User | 30 min |
| 3 | Subir 6 ads (3 vídeos + 3 imagens) | User + Designer | 4h (criação) |
| 4 | Configurar evento Lead no pixel + LP | @aios-dev | 1h |
| 5 | Testar fluxo end-to-end (clique ad → form → email entregue) | User | 30 min |
| 6 | Pausar campanha antiga 6986644457499 (já PAUSED, manter) | — | 0 |
| 7 | Setar budget R$20/d total + monitor | User | 5 min |

**Total:** ~6.5h. Possível subir em 1-2 dias úteis SE criativos prontos.

---

— *Meta paralelo definido. Lead optimization, R$20/d, 3 adsets segmentados, copy diferente do paid puro. Next: 05-tools-stack.md.*
