# Tocks Website — Elevation to Awwwards-level (FWA-SOTD)

**Orquestrador:** `@design-lead` (Nova) — executando `*brief tocks-website elevation to Awwwards-level`
**Data:** 2026-04-17
**Status:** FASE 1 + FASE 2 entregues. Fases 3-7 aguardam escolha de direção.
**Path fonte:** `apps/tocks-website/docs/design/elevation-awwwards/`

---

## FASE 1 — Audit dos 60% existentes

### 1.1 Matriz MANTER / EVOLUIR / REFAZER

| Componente / Área | Estado atual | Decisão | Justificativa |
|---|---|---|---|
| **Tokens Gilded Noir** (`globals.css`) | 11 tokens (`--background #0B0B0F`, `--accent-gold #D4AF37`, tracking editorial, focus full-gold) | **EVOLUIR** | Escala cromática rasa demais para FWA. Precisa: 3 shades de noir (deep/mid/surface), bone variants, ivory subordinado, gold 5-step scale. Add: paper-grain texture token, cinematic-shadow token. |
| **Tipografia** (Cormorant + Inter + Montserrat) | Trindade commodity Google Fonts | **REFAZER** (ver Spiekermann na Fase 5) | Cormorant é clichê luxury 2019. Montserrat é Shopify. Inter é neutro demais. FWA demanda stack autoral. |
| **Hero organism** (`hero.tsx`) | 70L, CSS-only animação LCP-safe, left-aligned, 2 CTAs | **EVOLUIR** | Estrutura correta, mas texture radial gold 3% é wallpaper genérico. Falta: hero video (já prioridade declarada), ambient layer (mesa low-res teaser), typographic tension. |
| **Product Card editorial** | 44L, chevron-on-hover, ImagePlaceholder | **EVOLUIR** | Hover scale 1.05 é predictable. Precisa: masked reveal (madeira grain scan), dimensional label (year + material + dimension embedded), editorial number tag (01/08, 02/08). |
| **CTA Block** | Solid bg, border-top gold/40, ordinary | **MANTER** restrito | Rams aprovou sem gradient. Mantém. |
| **Concierge Form** | Server Action Next 16, a11y WCAG AA | **MANTER** | Já é o melhor componente do catálogo — não tocar. |
| **FAQ** (`faq-item.tsx`) | `<details>/<summary>` nativo | **MANTER** | Val-head aprovaria. Zero JS. Mantém. |
| **Image Grid** | Variants project/related | **EVOLUIR** | Uniform grid. FWA pede broken grid (assymmetric rows, captions off-axis). |
| **Atelier page** | 127L, conteúdo razoável | **REFAZER** | Conteúdo-chave para storytelling FWA (fabricação). Precisa scroll-triggered. |
| **Blog pages** | Layout funcional | **MANTER** minor | Não é vitrine FWA; cumpre papel SEO. |
| **3D / R3F** | Não existe (Fase 2 do roadmap original) | **ADICIONAR** | Brief atual sobe prioridade: 3D showroom navegável + produto rotacionável vai para Fase 4. |
| **Motion system** | CSS-only, 4 keyframes uniformes | **REFAZER** (Sessão 19 Patch #2c ainda pendente) | Val-head blocker `prefers-reduced-motion` ainda não aplicado. |
| **Copy pt-BR** (`constants.ts`) | "Mesas de bilhar artesanais em madeira macica" | **REFAZER** | **VIOLA feedback memória `feedback_tocks_moveis_luxo.md`**: Tocks = móveis de luxo completos, não só mesas. Brief copy global precisa reposicionar. |

### 1.2 Scorecard FWA (estado 60%)

| Critério FWA | Score atual | Target FWA | Gap |
|---|---|---|---|
| Originalidade visual | 4/10 | 9/10 | Gilded Noir é corrente (2024-2026); precisa signature unique |
| Hierarquia tipográfica | 5/10 | 9/10 | Escala sem rigor modular, trindade commodity |
| Motion craft | 5/10 | 9/10 | Uniformidade de keyframe = template (Sessão 19 verdict) |
| Storytelling | 3/10 | 9/10 | Zero narrativa fabricação/material/autor |
| Technical polish (perf + a11y) | 8/10 | 9/10 | Quase lá; `prefers-reduced-motion` pendente |
| Brand voice | 6/10 | 9/10 | Boa em copy micro; falta manifesto de marca |
| Interatividade signature | 2/10 | 9/10 | Hover scale é wallpaper; precisa signature moment |
| Content density luxury | 4/10 | 9/10 | Assets placeholder; conteúdo visual ainda pendente |
| **MÉDIA** | **4.6/10** | **9.0/10** | **Gap 4.4 pontos — elevação é real, não cosmética** |

### 1.3 Bloqueadores sistêmicos (ler antes de Fase 3)

1. **BLOCKED-BY asset:** Nano Banana 2 quota esgotada (Sessão 12). Assets reais para hero/produto/atelier ainda placeholder shimmer. **Elevação FWA sem assets reais é impossível.** Fase 3 (hero video) é o caminho crítico.
2. **Next.js 16 breaking changes:** `AGENTS.md` obriga consulta a `node_modules/next/dist/docs/` antes de qualquer Server Action / cache primitive nova. Respeitar.
3. **Art. VII < 100 linhas:** Todos componentes novos DEVEM respeitar. Organisms complexos (ex: 3D showroom shell) split em templates.
4. **Sessão 19 Patch #2c não aplicado:** `prefers-reduced-motion` é WCAG blocker. DEVE preceder qualquer novo motion.
5. **Copy reposicionamento "móveis de luxo":** `feedback_tocks_moveis_luxo.md` ainda não refletido em `constants.ts`. Fase 2 (brief) resolve direção; implementação entra na Fase 7.

---

## FASE 2 — Brief estratégico + 5 direções criativas

### 2.1 Premissa de elevação

> **Elevação não é ornamento.** O site atual não é ruim — é **correto e previsível**. FWA premia o que é **irredutível e lembrado**. Precisamos construir **um momento-assinatura** (UMA coisa que o visitante conta pra outro arquiteto) e deixar todo o resto servi-lo.

*Maeda (liderança):* A alavanca invisível em luxury digital é **reticência orquestrada** — o site FWA-SOTD de móveis de luxo **fala menos que o concorrente comum**, mas o pouco que fala é incontornável.

### 2.2 Brand DNA extendido (reposicionamento)

| Atributo | Antes | Depois |
|---|---|---|
| Posicionamento | "Mesas de bilhar artesanais" | **"Móveis de autor para interiores de autor."** |
| Voz editorial | "Sob medida, atelier, peça" | Mantém **+** adiciona vocabulário de proveniência: madeira, ano, autor, projeto-mãe |
| Tom cromático | Gilded Noir (noir + gold) | Gilded Noir **+ bone-paper cinematic layer** (contraste mais humano, menos "crypto dark") |
| Personagem da marca | Atelier anônimo | **Ateliê com rosto** — marceneiro-autor, ano 2008, narrativa geracional |
| Gesto de luxo | Gold accent + serif | **Subtração** (brancos negativos wagnerianos) |

### 2.3 5 direções criativas (mood + manifesto + referência + risco + scorecard)

Cada direção é **uma tese sobre o que eleva Tocks**. Escolher UMA é definir a gramática das Fases 3-7.

---

#### **DIREÇÃO A — "Maison Silenciosa" (Reticência Hermès)**

- **Thesis:** Luxury = silêncio editorial. Apagamos 80% dos elementos, o que resta é monumento.
- **Mood:** Viewport predominantemente **bone-paper** (#F5F0E6) com ilhas de noir. Gold reduzido a filete (1px, separadores). Tipografia dominante, imagem subordinada, grid assimétrico wagneriano.
- **Manifesto:** *"Cada peça merece o silêncio que antecede o jogo."*
- **Reference stack:** Hermès Maison, Aesop Atelier Nomade, Jan Kath.
- **Signature moment:** Hero sem vídeo. Tipografia ocupando 90vh. Primeiro scroll revela uma única mesa fotografada em proveniência documental.
- **Risco:** Brasileiro afluente pode ler como "frio/europeu"; diferenciação vs Aesop pode ficar sutil demais.
- **Scorecard FWA:** Originalidade 7 · Craft 9 · Memorabilidade 6 · Brand-fit 7. **→ Media 7.25**

---

#### **DIREÇÃO B — "Gilded Noir Cinemático" (Roche Bobois-grade editorial, recomendação baseline)**

- **Thesis:** Evoluir o que existe, não reinventar. Mantém Gilded Noir mas adiciona **camada cinemática de luz** (hero video como ritual de abertura, chiaroscuro fotográfico, tipografia editorial revista).
- **Mood:** Noir atual + bone-paper como respiro + gold 5-step scale + texture paper-grain sutil em superfícies + cinematic shadows (simulação luz de showroom).
- **Manifesto:** *"A madeira atravessa a luz. A luz atravessa a marca."*
- **Reference stack:** Roche Bobois, B&B Italia product hero, Molteni&C.
- **Signature moment:** Hero video 8-12s (showroom privado, câmera slow-dolly, mesa emergindo da penumbra ao gold accent). Scroll-triggered chapters revelando: madeira → corte → torneio → acabamento → entrega.
- **Risco:** Territorio já explorado por luxury furniture; precisa execution craft-level para não virar "mais um site dark com gold".
- **Scorecard FWA:** Originalidade 7 · Craft 9 · Memorabilidade 8 · Brand-fit 9. **→ Media 8.25 (recomendação baseline Nova)**

---

#### **DIREÇÃO C — "Ateliê Documental" (Editorial tipo New York Times Magazine)**

- **Thesis:** O site é uma longform editorial sobre um ateliê. Visitante lê, não navega.
- **Mood:** Paleta inversa — **bone-paper predominante**, noir em textos, gold em marginália editorial (numeração, small caps, folio). Fotografia documental preto-e-branco 70% + mix fine-art colorido 30%. Tipografia **serif editorial com ligaduras** (Tiempos / GT Alpina).
- **Manifesto:** *"Um ateliê escreve sobre si mesmo em madeira."*
- **Reference stack:** NYTimes Magazine longform, The Gentlewoman, Apartamento Magazine.
- **Signature moment:** Página-abertura de "Atelier" estruturada como reportagem 5000-palavras: quem é o marceneiro, desde quando, por quê. Fotos preto-e-branco do processo + sidebar com specs técnicos em small multiples (Tufte).
- **Risco:** Distância da expectativa e-commerce; CTAs enterrados. Mais difícil converter para WhatsApp.
- **Scorecard FWA:** Originalidade 9 · Craft 9 · Memorabilidade 9 · Brand-fit 6. **→ Media 8.25 (alto ceiling, risco maior)**

---

#### **DIREÇÃO D — "Showroom Navegável" (Dogstudio / Active Theory Immersive)**

- **Thesis:** O site **É** um showroom. Entrada 3D cinematográfica; navegação por ambiente-cômodo.
- **Mood:** 80% canvas R3F com iluminação HDR, mesas posicionadas em ambientes (sala, biblioteca, salão). Menu como cômodos. Gold accent vira luz emissiva nos detalhes (ink-well filete). Noir ambiental profundo.
- **Manifesto:** *"Atravesse a porta. O atelier recebe quem chega."*
- **Reference stack:** Dogstudio, Active Theory, Bang & Olufsen, The Seventh Chamber.
- **Signature moment:** Entrada: black loading com gold ink line → hero-R3F com mesa central + partículas de pó sutis → scroll "empurra" câmera para próximo ambiente.
- **Risco:** LCP mortal (R3F vs Lighthouse 90+). Mobile degradação severa. Dev effort 3-5x. Violação potencial do Art. VII.
- **Scorecard FWA:** Originalidade 10 · Craft 9 · Memorabilidade 10 · Brand-fit 7 · **Performance risk 9 (alto)** · **Feasibility 5**. **→ Media 8.2 (high ceiling, highest risk)**

---

#### **DIREÇÃO E — "Provenance Data-rich" (Tufte encontra Aesop)**

- **Thesis:** Cada peça é um objeto com histórico. Site é arquivo de proveniência + tecnologia de seleção.
- **Mood:** Bone-paper + noir para textos + gold APENAS em indicadores de dado (gráfico de tempo, mapa de origem madeira). Cards de produto com **dossier**: ficha técnica isométrica, origem, prazos, cliente anterior (anonimizado), dimensões exatas em desenho técnico.
- **Manifesto:** *"Cada peça tem um nome, uma data, uma procedência."*
- **Reference stack:** Aesop product pages + FT longform visual essays + Mast Brothers chocolate archive.
- **Signature moment:** Product page estruturada como dossier arquivístico. Pequenos infográficos tufte (origem madeira em mapa, cronologia de criação em timeline). Filtro de colecão por "madeira origem", "ano", "tipo de acabamento" — como um arquivista vitrinista faria.
- **Risco:** Exige conteúdo rico real (provenance autêntica, não fabricada). Sem esse acervo, direção cai.
- **Scorecard FWA:** Originalidade 9 · Craft 9 · Memorabilidade 8 · Brand-fit 8 · **Content-dependency 9 (alto)**. **→ Media 8.5 (ceiling alto, requer inventário de conteúdo)**

---

### 2.4 Matriz de decisão (usuário ou stakeholder escolhe UMA)

| Direção | Tese | Ceiling FWA | Risco | Dev-cost (semanas) | Asset-dep | **Recomendação Nova** |
|---|---|---|---|---|---|---|
| A — Maison Silenciosa | Subtração radical | 8.5 | Médio (frio?) | 3-4 | Baixo | **Se quiser diferenciar no Brasil** |
| **B — Gilded Noir Cinemático** | Evoluir baseline | 9.0 | Baixo | 4-5 | Médio (video) | **✅ BASELINE RECOMENDADA** |
| C — Ateliê Documental | Longform editorial | 9.5 | Médio (conversão) | 5-6 | Alto (copy) | Se quiser **awards primeiro**, vendas depois |
| D — Showroom Navegável | R3F imersivo | 9.5 | **Alto** (perf + mobile) | 8-10 | Altíssimo (3D) | Se tiver budget e team dev + quiser viralizar |
| E — Provenance Data-rich | Arquivo tufteano | 9.0 | Médio (conteúdo) | 5-7 | **Muito alto** (provenance real) | Se tiver acervo documentado |

### 2.5 Recomendação Nova (design-lead)

**Aprovar DIREÇÃO B (Gilded Noir Cinemático) como baseline + cherry-pick de 2 elementos-assinatura:**
- **B + signature "Provenance card" da E** (cada product page ganha um mini-dossier tufte: madeira-origem, cronologia, desenho técnico isométrico) → diferencia sem rebootar o DS.
- **B + signature "Broken grid editorial" da C** (Atelier page estruturada como longform com grid quebrado + small multiples) → aumenta memorabilidade sem sacrificar conversão.

**Justificativa:**
1. Preserva 80% do trabalho das Sessões 7-18 (Economia de dev-effort).
2. Hero video já é priorização declarada (Memória + usuário).
3. Dogstudio-level 3D (D) é atraente mas **Lighthouse 90+ + mobile preserve cinemática** são restrições duras do brief — D as-is é infeasible no budget atual. Pode virar Phase 3 (R3F Porsche-style no configurador), já previsto no roadmap original.
4. Copy reposicionamento "móveis de luxo" (feedback memória) fica natural no manifesto B *"A madeira atravessa a luz"* — não precisa ser literal em "mesa de bilhar".

### 2.6 Critérios de sucesso verificáveis (Karpathy Rule)

Quando a elevação está "pronta"?

- [ ] **Scorecard FWA ≥ 8/10** em 7/8 critérios (via auto-audit `*brand-check`).
- [ ] **Lighthouse Perf ≥ 90 mobile prod em Home + Produto + Contato**.
- [ ] **axe-core 0/0/0/0** + `prefers-reduced-motion` implementado em 100% das animações.
- [ ] **5-second test (Krug):** 3 de 5 arquitetos, olhando hero 5 segundos, descrevem Tocks como "ateliê de móveis autorais", não "loja de mesas de bilhar". (Se falhar: copy ainda commodity.)
- [ ] **Awwwards self-submission checklist** passa em 5 de 7 categorias: Design, Creativity, Code, Content, Mobile, UX, Trend-setting.
- [ ] **Memorabilidade signature moment:** 2 de 3 designers de interiores, 24h depois de visitar, lembram do **hero video + dossier de proveniência** sem prompt.

---

## FASE 3-7 — Desbloqueio condicional

As próximas fases **aguardam escolha explícita de direção** (A/B/C/D/E ou híbrido como recomendado).

**Próxima ação do usuário (ou Orion como delegado):**
1. Escolher direção principal (recomendação Nova: **B + cherry-pick E + cherry-pick C**).
2. Aprovar brief. Rodar `*approve` para destravar Fase 3.
3. Nova spawna squad em paralelo:
   - `@motion-designer` (Val) → Fase 6 motion system spec
   - `@ui-designer` → Fase 5 token refinement + Fase 7 component elevation spec
   - `@ux-designer` → Fase 4 3D showroom concept (se direção for B+D híbrida) ou broken-grid spec (se B+C)
   - `@ux-researcher` → validação 5-second test com micro-painel
   - `@ux-writer` → Fase 7 copy reposicionamento "móveis de luxo"
   - `@design-systems-engineer` → Fase 5 token migration plan

---

## Mind Clone Consultations (dispatched — pending ratification)

Consultas bilateral enviadas via `aios-brain-bridge` MCP em 2026-04-17. Responses informam Fases 3-7 (não bloqueiam Fase 2 porque Sessão 19 já documentou 3/6 clones verbatim).

| Clone | Consultation ID | Domínio | Pergunta |
|---|---|---|---|
| john-maeda | `84c31bb8-09ff-4434-90fd-cc7cc67ebf07` | Design leadership | Alavanca invisível do FWA luxury |
| tobias-van-schneider | `5496ad4a-ae29-4f6b-9ec2-235921595c0c` | Editorial luxury | 5 direções editoriais raw |
| dieter-rams | `bfe4eadc-62eb-4246-a4d6-d76327d2c369` | Restraint | 3 cortes + 3 restrições + 1 adição |
| val-head | `230aaf35-26d8-42d0-bf07-5d1300bb6db2` | Motion | Motion system (4-5 tipos + reduced-motion) |
| erik-spiekermann | `3692b26a-463e-4799-aab6-ef4814918407` | Editorial type | Veredito stack + proposta superior |
| edward-tufte | `ccb3c0a4-b0e4-4d85-9e57-bb6488b1515e` | Data-rich | 3 aplicações data-ink no site |

Sessão 19 já tem verdicts vinculantes de don-norman, tobias-van-schneider, val-head em `docs/qa/s-7.3-mindclone-raw-2026-04-17.md` — esses 3 clones têm position registrada e suas pontuações no scorecard desta fase derivam daquelas respostas verbatim.

---

## Apêndice A — Concorrência mapeada (validar escolha de direção)

Verticais de referência cruzada (atualizar ao submeter Awwwards):

- **Furniture luxury award-winning recente:** Molteni&C, Poliform, B&B Italia, Cassina (italianas); Hay (Dinamarca); USM Haller (Suíça). Todos operam Dir. B (cinematic baseline) com signature hero. **Tocks pode liderar no Brasil.**
- **Brasileiro luxury móveis:** Breton, Artefacto, Florense, Ornare. Nenhum com site FWA-level — **oceano branco**.
- **Diretos bilhar:** 11ravens (noir cinematic), Blatt Billiards (conservador), Olhausen (US standard). Nenhum é FWA-contender.

**Insight:** Nenhum concorrente brasileiro de móveis luxo tem site FWA. Tocks tem janela real de ser **primeiro SOTD do vertical na AL**.

---

*Final do brief Fase 1 + Fase 2. Fases 3-7 desbloqueiam mediante `*approve` + escolha de direção.*
*— Nova, Design Lead*
