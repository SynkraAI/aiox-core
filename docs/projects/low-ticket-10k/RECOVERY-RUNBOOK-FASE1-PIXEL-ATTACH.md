# Recovery Runbook — Fase 1: Atribuir Pixel à Ad Account

**Projeto:** Low Ticket 10k — Vorza/Metodo3C
**Data:** 27/Abr/2026
**Owner da execução:** USER (UI-only, sem MCP)
**Tempo estimado:** 8-12 minutos
**Pré-requisitos:** acesso Admin ao BM Vorza + Ad Account `act_793656664671388`

---

## Contexto rápido

A campanha `[ABO] M3C — TOPO Frio v1` (`120242728863470621`) está marcada como ACTIVE no MCP, mas os 4 ads estão PAUSED e o spend last_30d é R$ 0,00. Causa-raiz: o Pixel `26458851600417959` foi criado no BM Vorza e instalado no HTML da LP `vorza-metodo3c.netlify.app`, mas **NÃO foi atribuído à Ad Account `act_793656664671388`**. Sem essa atribuição, adsets com `optimization_goal=OFFSITE_CONVERSIONS` ficam sem `promoted_object.pixel_id` válido e a Meta não entrega tráfego.

**Esta fase é UI-only no Business Manager. Não execute via MCP.**

---

## Passo 1 — Atribuir Pixel à Ad Account no BM (3-5 min)

### 1.1 Abrir Business Settings

1. Acesse https://business.facebook.com
2. Confirme no canto superior esquerdo que está no **BM Vorza** (não Tocks/Bretda). Se aparecer outro BM, clique na seta e troque.
3. No menu lateral esquerdo, clique em **Configurações do Negócio** (Business Settings).

### 1.2 Localizar o Pixel

1. Em **Fontes de dados** (Data Sources) → **Conjuntos de dados** ou **Pixels** (Meta às vezes renomeia — ambos levam ao mesmo lugar).
2. Procure o pixel com ID `26458851600417959` (provavelmente nome "Vorza" ou "Metodo3C" — confirme pelo ID).
3. Clique no pixel para selecioná-lo.

### 1.3 Atribuir à Ad Account

1. Com o pixel selecionado, clique na aba **Contas atribuídas** (Assigned Assets) ou **Ad Accounts**.
2. Clique em **Adicionar contas de anúncios** (Add Ad Accounts) ou **Adicionar ativos**.
3. Marque a Ad Account **`act_793656664671388`** (o ID aparece na linha — pode aparecer como "793656664671388" ou com o nome dado à conta na Vorza).
4. **Permissão:** selecione **Controle total** (Full Control). Não use "Visualizar apenas" — a ad account precisa **gravar** events com o pixel ID.
5. Clique em **Salvar** ou **Adicionar**.

### 1.4 Verificar atribuição

- Após salvar, recarregue a página. A Ad Account `act_793656664671388` deve aparecer listada na seção "Ad Accounts atribuídas" do pixel.
- Se aparecer erro tipo "você não tem permissão" — verifique se você é **Admin** do BM Vorza. Se for outro role, peça ao admin do BM pra fazer este passo.

---

## Passo 2 — Configurar Conversion Location dos Adsets (3 min)

Mesmo com o pixel atribuído à conta, os adsets precisam ter o pixel **selecionado** explicitamente como conversion source.

### 2.1 Acessar Ads Manager

1. Vá para https://adsmanager.facebook.com
2. Confirme no seletor superior que está na Ad Account **Vorza** (`act_793656664671388`).

### 2.2 Editar Adset C1 (`120242729974200621`)

1. Encontre a campanha `[ABO] M3C — TOPO Frio v1`.
2. Expanda → encontre o adset com nome contendo **"INT Advocacia"** ou **"OAB"** (ID `120242729974200621`).
3. Clique no nome do adset para abrir o painel de edição.
4. Procure a seção **Conversion** (Conversão) no topo.
5. **Conversion location**: deve estar como **Website**. Se estiver outro, troque.
6. **Pixel**: selecione no dropdown o pixel `26458851600417959` (vai aparecer com o nome dado a ele).
7. **Conversion event**: selecione **Purchase**.
8. Clique em **Publicar** ou **Salvar e fechar**.

### 2.3 Editar Adset C3 (`120242729976720621`)

Repita exatamente os mesmos passos 2.2 para o adset com nome contendo **"BROAD Superior"** (ID `120242729976720621`).

### 2.4 Não despause os ads ainda

Os 4 ads (C1-A `120244099410470621`, C1-B `120244099412870621`, C3-A `120244099414140621`, C3-B `120244099414750621`) **PERMANECEM PAUSED**. Despausar agora = queimar R$74/dia sem CAPI. Despausa só na Fase 4 com OK explícito.

---

## Passo 3 — Validar pixel ativo no Events Manager (2 min)

### 3.1 Abrir Events Manager

1. Vá para https://business.facebook.com/events_manager2
2. Selecione o pixel `26458851600417959`.
3. Aba **Visão geral** (Overview).

### 3.2 Verificar status

Espera-se ver:

- **Status:** Active (verde)
- **PageView nas últimas 24h:** > 0 events
- **Última disparada:** "há X minutos/horas" (não "há vários dias")

### 3.3 Se PageView estiver zero ou status Inactive

- Abra a LP `https://vorza-metodo3c.netlify.app` em uma aba anônima e dê um F5.
- Aguarde 30 segundos e recarregue o Events Manager.
- Use a extensão Chrome **Meta Pixel Helper** na LP para confirmar que o Pixel está disparando PageView. Deve aparecer um indicador verde com o ID 26458851600417959.

---

## Confirmação para Orion (a fazer)

Quando concluir os 3 passos, envie ao Orion (no chat) **uma das duas respostas**:

**OPÇÃO A — tudo OK:**
```
Fase 1 OK:
- Pixel atribuído à ad account com Full Control: SIM
- C1 e C3 com pixel + Purchase event configurado: SIM
- Events Manager mostrando PageView ativo nas últimas 24h: SIM
```

**OPÇÃO B — encontrei problema:**
```
Fase 1 BLOQUEADO no passo {N}: {descrição do que apareceu/erro}
```

Não avance pra Fase 2 (CAPI Kiwify) sem confirmar Fase 1 OK.

---

## Anti-checklist (NÃO fazer nesta fase)

- ❌ NÃO ative os 4 ads. Eles continuam PAUSED até Fase 4.
- ❌ NÃO mexa em C2 (`120243622860290621`) ou C4 (`120243622876870621`) — ficam PAUSED até 50 Purchases acumulados.
- ❌ NÃO troque o objetivo da campanha. Continua OFFSITE_CONVERSIONS.
- ❌ NÃO mude budget. Continua R$37 + R$37 = R$74/dia.
- ❌ NÃO atribua pixel a outras contas (Tocks/Bretda) por engano. Apenas `act_793656664671388`.
