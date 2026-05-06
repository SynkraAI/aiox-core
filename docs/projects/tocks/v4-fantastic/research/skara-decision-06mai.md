---
project: tocks-v4-fantastic
created: 2026-05-06
created_by: orion (research agent, post-asset-drop investigation)
status: RECOMMENDATION — aguarda decisão Breno
parent: ../../../assets/MANIFEST.md
---

# Skara: Integrada ou Separada — Recomendação

**Date:** 2026-05-06
**Decision:** SEPARATE (com asterisco — ver "HYBRID curto-prazo" abaixo)
**Confidence:** MEDIUM-HIGH

## TL;DR

Skara deve ser **site separado** (`skara.com.br` ou subdomínio `skara.tockscustom.com.br`), não rota dentro do tocks-website. A papelaria DOCX (ordem de compra, papel timbrado, proposta) + o catálogo de 10 madeiras × 16 tecidos sinalizam um produto B2B/configurador-pesado — energia oposta à narrativa editorial-luxo silenciosa que está sendo construída pra Tocks v4. Misturar as duas marcas no mesmo site dilui Tocks no momento exato em que ele tenta atingir 9-10/10 fantástico via disciplina extrema. Curto-prazo viável: stub `/skara` no tocks-website só pra ranquear domínio, com link saindo pra site dedicado quando este existir.

## Evidence considered

- **Zero menções prévias de Skara** no codebase (`apps/`), nas 47 docs do v4-fantastic, na pasta `docs/stories/`, ou nos memory files (`C:\Users\kingp\.claude\projects\D--AIOS\memory\`). Decisão é greenfield — não contradiz nada.
- **MANIFEST.md já flagou a dúvida explícita** (linha 142-148): *"Skara é linha integrada Tocks ou é um site separado? Os acabamentos Skara também aplicam a Tocks?"* — confirma que ainda não foi decidido.
- **Estrutura dos assets Skara**:
  - `Logos/` — 4 SVGs (Logo1+Logo2 × Azul+Branca) → identidade visual **própria e completa**, não variação Tocks
  - `Papelaria/` — 3 DOCX: ordem de compra, papel timbrado, timbrado-proposta → **vocabulário comercial B2B/contratual**, não lifestyle storytelling
  - `Opções de acabamento/` — 10 madeiras nominadas (Angelin, Cerejeira, Wengue…) + 16 tecidos com códigos numéricos (102, 103-91, 269-21…) → **catálogo de configurador**, não curadoria editorial
- **Estrutura do tocks-website atual** (`D:\AIOS\apps\tocks-website\src\app/`): rotas existentes são `colecao/`, `atelier/`, `projetos/`, `blog/`, `contato/`, `preview/`. Tom uniforme: editorial-luxo, narrative-driven. `data/products.ts` modela `Product` com `tagline`, `description` literária, `formattedPrice` único — **não foi desenhado pra hospedar configurador 10×16 = 160 SKUs combinatórios**.
- **Direção v4-fantastic** (`manifesto/tocks-brand-book.md`, 7 references): "paleta no máximo 4 cores", "headlines ≥200px", "0px radius universal", "tracking negativo extremo" — Tocks v4 é **disciplina visual radical**. Catálogo Skara com seleção de tecido por código numérico é o oposto disso.
- **Logos Tocks vs Skara são marcas distintas**: Tocks tem 3 símbolos canon (Branco/Azul/Dourado) + tipografia Libre Caslon Text; Skara tem Logo1+Logo2 com sufixo `-SKARA`. São **brands paralelas, não children**.

## Reasoning

**1. Brand positioning — risco de diluição é assimétrico.** Tocks v4 está sendo construído pra ser 9-10/10 num mercado (móveis-luxo-BR) que tem talvez 3-5 players com site decente. A vantagem competitiva é **disciplina radical**. Adicionar uma rota `/skara/*` que comporta papelaria comercial + 160 combinações de acabamento força o tocks-website a hospedar dois sistemas tipográficos, dois tons de voz, dois IA's. As 7 references analisadas no brand-book (Studio Tumulte, Antonsson, Berlin Biennale, Elva, Faccia Brutto, Exhibition Magazine, Valiente) **todas servem uma marca, não duas**. Misturar é assinar 8/10 quando o objetivo é 10/10.

**2. Funcional — produto Skara parece B2B/projeto-fechado, não DTC editorial.** "Ordem de compra" e "papel timbrado proposta" são artefatos de venda B2B (arquitetos, designers de interiores, hotéis, restaurantes que compram via cotação). Esses compradores não navegam um site editorial em busca de inspiração — eles querem catálogo, ficha técnica, código de acabamento, prazo, condição de pagamento. **A jornada UX é fundamentalmente diferente** da jornada Tocks-DTC-luxo (que é storytelling → desejo → contato concierge). Forçar ambas no mesmo IA quebra o IA pra os dois lados.

**3. SEO/branding — domínios separados protegem ambos.** Se Skara tem identidade própria (logos próprios, papelaria própria), ela merece um domínio próprio. Subjugar Skara em `tockscustom.com.br/skara` sinaliza "marca filha menor" e o Skara nunca terá autoridade de domínio independente. Inversamente, hospedar o catálogo B2B Skara dentro do site Tocks contamina os sinais de SEO Tocks com keywords B2B-commodity ("tecido bilhar 269-21", "madeira itaúba mesa") quando o objetivo Tocks v4 é ranquear pra "mesa de bilhar luxo SP".

**4. Custo de implementação — separado pode ser mais barato.** Configurador 10 madeiras × 16 tecidos com previews e PDF de proposta é trabalho substancial (provavelmente Story-de-épico próprio, ~3-5 sprints). Construir isso dentro do tocks-website significa: (a) abstrair `Product` model atual pra suportar variantes combinatórias, (b) duplicar componentes em variante "skara-themed", (c) gerenciar dois tokens-de-design no mesmo CSS. Construir como Next.js app separado em `apps/skara-website/` reusa packages compartilhados (UI atoms, fonts, MCP integrations) **sem contaminar o IA Tocks**.

**5. Por que MEDIUM e não HIGH confidence.** Falta dado de negócio que só o user tem: (a) **Skara é linha de produto Tocks (mesmo CNPJ, mesmo concierge, só sub-marca de catálogo) ou empresa independente?** (b) Os 10×16 acabamentos Skara também são oferecidos em mesas Tocks? (c) Volume relativo Tocks vs Skara — se Skara é 80% do faturamento, a recomendação inverte. Na ausência desses dados, o sinal mais forte vem dos próprios assets (papelaria contratual + catálogo combinatório = B2B distinto de DTC).

## Implementation path (if user accepts SEPARATE)

**Curto-prazo (próximas 2 semanas, foco Tocks v4):**
1. **Não tocar em Skara agora.** Tocks v4 é o priority — scope-creep aqui mata o 10/10.
2. **Adicionar redirect stub em tocks-website** se algum link externo aponta pra `/skara`: rota `app/skara/page.tsx` com "Skara — site dedicado em breve. Para orçamentos: contato@skara.com.br" — bloqueia scope creep visual no tocks-website.
3. **Reservar domínios:** `skara.com.br`, `.com`, `.com.br` — proteger antes de squatter pegar (custo ~R$80/ano).

**Médio-prazo (depois Tocks v4 launch, ~30 dias):**
4. **Criar `apps/skara-website/`** — Next.js 16 (mesma versão Tocks), reusa `packages/db`, `packages/ui` se existirem.
5. **Definir IA Skara explícito**: catálogo configurador-first. Stories: `[Skara-1] Catalog Browser`, `[Skara-2] Combinator (madeira × tecido)`, `[Skara-3] PDF Proposta Generator`, `[Skara-4] B2B Lead Form`.
6. **Brand book Skara dedicado** (não derivar do Tocks v4 brand book — Skara merece análise independente; references B2B-luxo de mobiliário tipo Roche Bobois, Minotti).

**Esforço estimado:**
- Stub `/skara` no tocks-website: **30 minutos** (1 página)
- Domain registration: **15 minutos**
- App Skara dedicado MVP (catálogo + combinator): **3-5 sprints** (2-3 semanas dev)
- Brand book Skara (paralelo): **2-3 dias** com Mind Clones (april-dunford pricing/positioning + dieter-rams config catalog craft)

## Risks

- **Risco principal — Skara é maior que Tocks no faturamento.** Se Skara é o cash cow e Tocks v4 é o brand showcase, o user pode querer o oposto: site monolítico onde Tocks é o flagship marketing e Skara é onde a venda B2B real acontece. Dado que falta business context, a recomendação pode estar invertendo a hierarquia comercial. **Mitigação:** ver "Open questions for user" — se a resposta inverte, mudamos pra HYBRID com Tocks como vitrine e Skara como motor.
- **Risco — fragmentação de domínio prejudica autoridade.** Dois sites pequenos = duas autoridades fracas em vez de uma média. **Mitigação:** se volume Skara é baixo (<10 leads/mês), aceitar autoridade fraca dois anos até crescer. Se volume é alto, manter os dois é justificável.
- **Risco — o user quer "uma mesma loja com duas linhas".** Possível interpretação: Tocks = linha premium artesanal, Skara = linha técnica/contratual, mas mesma empresa, mesma compra. Se for esse o caso, INTEGRATED com `/colecao/skara` faz mais sentido. **Mitigação:** as Open questions abaixo descobrem isso em uma única resposta do user.
- **Risco — duplicação de infra.** Dois Next.js apps = duas pipelines Vercel, dois sentry, dois analytics. **Mitigação:** monorepo turborepo já reduz isso; packages compartilhadas mantêm UI consistency.

## Open questions for user

1. **Skara é o quê em relação a Tocks comercialmente?** (a) sub-marca da mesma empresa Tocks Custom, mesmo CNPJ; (b) empresa irmã/separada do mesmo dono; (c) marca-filha pra um canal específico (B2B/projeto fechado vs DTC); (d) outro? — **Esta é a pergunta crítica. Tudo depende dela.**
2. **Os 10 madeiras + 16 tecidos do "Opções de acabamento Skara" também são oferecidos nas mesas Tocks?** Se sim, talvez o catálogo de acabamentos seja transversal (componente `<FinishesCatalog>` reusável nos dois sites) e a separação de marca seja só na home/storytelling.
3. **Existe site Skara hoje** (mesmo que ruim/abandonado)? Se sim, qual URL? Importa pra continuidade SEO.
4. **Volume relativo:** Skara faz % do faturamento Tocks Custom? Se for ≥50%, inverter prioridade.
5. **Quem é o cliente Skara?** Arquiteto/designer de interiores (B2B) ou consumidor final (DTC)? A papelaria de "ordem de compra/proposta" sugere B2B, mas confirmar.

---

**Próximo passo recomendado:** user responde Q1 + Q5 acima → orion finaliza decisão (SEPARATE vs INTEGRATED vs HYBRID) com HIGH confidence em uma única passada. Antes disso, **manter foco em Tocks v4 thesis selection** — Skara não é bloqueador de v4-fantastic.
