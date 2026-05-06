# Nano Banana 2 Prompt Specs — Tocks Website v2

Generated: 2026-04-16 by @design-chief
Squad executors: @tobias-van-schneider (HOME + ATELIER), @dieter-rams (PRODUTO/materials)
Approver: @ui-designer (Pixel)
Generator executor: Orion (parent session — NOT executed here)

---

## Summary

- **Total assets:** 18
- **Total prompts:** 18 (1 variant each; Orion may regenerate for selection)
- **Categories:** HOME (8 prompts) | PRODUTO (10 prompts) | ATELIER (3 prompts)
- Correction: re-counted — HOME 8, PRODUTO 10, ATELIER 3. See execution order.
- **Executor for generation:** Orion (parent agent) via `mcp__nano-banana-2__*`
- **Design system locked:** Gilded Noir palette enforced in every prompt description + negative.

## Squad hierarchy

| Role | Agent | Responsibility | Consultation ID |
|------|-------|----------------|-----------------|
| Executor (editorial voice) | @tobias-van-schneider | Category 1 (HOME) + Category 3 (ATELIER) prompts | `4bec680c-a9b3-4f99-8fc0-bb05eafba42d` |
| Executor (material honesty) | @dieter-rams | Category 2 (PRODUTO) prompts | `7ce7799d-b81d-403f-a944-3b442adeabc9` |
| Approver (brand guardian) | @ui-designer (Pixel) | Consistency review, palette enforcement, no rewrites | `c97baf09-c504-4651-8270-363f800d4bfe` |
| Orchestrator | @design-chief | Routing + final document assembly | (this session) |

---

## Category 1 — HOME

### Asset 1.1 — Hero background (main)

- **description:** "Editorial cinematic photograph of a luxury billiards table as the sole protagonist in a dimly lit high-end residential lounge. Solid walnut frame with hand-carved detail, deep bordeaux Simonis 860 felt playing surface, single low-angle warm tungsten spotlight (approx 2700K) grazing the rail and casting long soft shadows on polished dark herringbone wood floor. Atmosphere: still, quiet, reverent — museum-quality product shot aesthetic. Background: out-of-focus architectural details of a private club interior — stone fireplace hint, leather lounge chair silhouette, floor-to-ceiling dark linen drapes. Near-black ambient tone (#0B0B0F to #1A1A1E), single warm gold highlight (#D4AF37) on the rail corner, ivory (#F5F0E6) subtle reflection on felt. Shot on medium format, shallow depth of field, f/2.0, 50mm equivalent."
- **aspectRatio:** 16:9
- **style hints:** cinematic golden-hour tungsten, editorial dark luxury, single-source key light, layered shadows, Blatt Billiards / Billard Toulet reference mood
- **negative prompt:** "no people, no champagne glasses, no cue sticks held by hands, no neon signs, no text overlays, no logos, no bright ambient lighting, no flat even illumination, no clichéd pool hall tropes, no exotic cars, no tuxedos, no watches, no cigars, no green traditional felt (use bordeaux), no pure black #000000"
- **target:** `apps/tocks-website/public/images/hero/main.jpg`
- **author:** tobias-van-schneider

### Asset 1.2 — Ambient card 1 — Living room (sala dedicada)

- **description:** "Portrait-orientation editorial photograph of a luxury billiards table as centerpiece of a dedicated games room in a contemporary Brazilian São Paulo penthouse. European oak frame, traditional green Simonis 860 felt. Architectural elements: double-height ceiling, floor-to-ceiling glass with bronze mullions, imported travertine feature wall. Warm ambient lighting, single overhead pendant fixture with brushed-brass arm hanging low over table. Paleta: near-black #0B0B0F walls, ivory #F5F0E6 travertine highlights, gold #D4AF37 pendant accent. Mood: refined, collected, old-money editorial."
- **aspectRatio:** 4:5
- **style hints:** architectural editorial, Robb Report magazine aesthetic, soft ambient key
- **negative prompt:** "no people, no clutter, no bright overhead lighting, no typical home decor, no visible cue racks, no scoreboards, no TV screens, no generic pool hall clichés"
- **target:** `apps/tocks-website/public/images/home/ambient-01-living.jpg`
- **author:** tobias-van-schneider

### Asset 1.3 — Ambient card 2 — Home office premium

- **description:** "Portrait photograph of a luxury billiards table integrated as an executive centerpiece in a premium home office / private study. Ebony-stained wood frame with hand-chased bronze corner detail, deep navy Simonis 860 felt. Background: floor-to-ceiling dark walnut library shelves, single vintage brass desk lamp casting warm pool of light, leather-bound editions, mid-century modern lounge chair. Late evening mood. Paleta: near-black #0B0B0F dominant, gold #D4AF37 accents on lamp and bronze detail, ivory #F5F0E6 on book spines."
- **aspectRatio:** 4:5
- **style hints:** moody editorial, single practical light source, layered shadows, Architectural Digest feature
- **negative prompt:** "no people, no computer screens, no papers, no modern office clutter, no bright fluorescent light, no open laptops, no clichéd executive props"
- **target:** `apps/tocks-website/public/images/home/ambient-02-office.jpg`
- **author:** tobias-van-schneider

### Asset 1.4 — Ambient card 3 — Casual chic lounge

- **description:** "Portrait photograph of a luxury billiards table in a relaxed yet refined mezzanine lounge. Freijó wood frame (warm amber Brazilian hardwood), traditional green Simonis 860 felt. Background: exposed fair-faced concrete walls, single oversized abstract dark painting, brushed-brass low pendant lamp, deep chesterfield leather sofa silhouette out of focus. Evening mood, warm ambient glow. Paleta: near-black #0B0B0F concrete, gold #D4AF37 pendant glow, ivory #F5F0E6 subtle reflections."
- **aspectRatio:** 4:5
- **style hints:** editorial Brazilian modernism, warm tropical luxury, low-key lighting
- **negative prompt:** "no people, no throw pillows, no plants, no visible televisions, no bar carts, no clichéd luxury lifestyle props"
- **target:** `apps/tocks-website/public/images/home/ambient-03-casual.jpg`
- **author:** tobias-van-schneider

### Asset 1.5 — Ambient card 4 — Rustic refined (fazenda)

- **description:** "Portrait photograph of a luxury billiards table in a refined rural retreat — high-end Brazilian fazenda interior. Walnut wood frame with blackened-iron corner brackets, bordeaux Simonis 860 felt. Background: exposed dark reclaimed timber ceiling beams, rough-plastered limewashed walls, single wrought-iron pendant chandelier with incandescent bulbs. Mood: refined rustic, collected, editorial. Paleta: near-black #0B0B0F shadows, ivory #F5F0E6 limewash walls, gold #D4AF37 incandescent glow."
- **aspectRatio:** 4:5
- **style hints:** Ralph Lauren Ranch editorial, refined rustic luxury, warm incandescent
- **negative prompt:** "no people, no antlers, no obvious Western clichés, no red-checkered blankets, no rustic stereotypes, no plastic elements"
- **target:** `apps/tocks-website/public/images/home/ambient-04-rustic.jpg`
- **author:** tobias-van-schneider

### Asset 1.6 — Ambientes transformados 1 — Penthouse São Paulo

- **description:** "Editorial architectural photograph of a luxury billiards table installed in a real high-end São Paulo penthouse. Wide 3:2 perspective emphasizing the table as anchor within the full room composition. European oak frame, bordeaux felt. Background: floor-to-ceiling glass with São Paulo skyline at blue hour visible but softly out of focus, travertine feature wall, minimal furnishing. Two practical light sources only. Paleta Gilded Noir: near-black #0B0B0F dominant, gold #D4AF37 single warm accent, ivory #F5F0E6 travertine."
- **aspectRatio:** 3:2
- **style hints:** architectural editorial, Wallpaper* magazine, wide establishing shot
- **negative prompt:** "no people, no visible brand logos, no text, no bright daylight, no fluorescent lighting, no clutter"
- **target:** `apps/tocks-website/public/images/home/transformed-01-sp.jpg`
- **author:** tobias-van-schneider

### Asset 1.7 — Ambientes transformados 2 — Beach house Angra

- **description:** "Editorial architectural photograph of a luxury billiards table installed in an oceanfront high-end residence. Wide 3:2 perspective. Freijó wood frame, navy felt. Background: large sliding glass doors leading to a dark infinity pool, framed by dark teak ceiling and limestone floor. Early evening, sky already deep indigo, warm interior practical lights dominant. Paleta: near-black #0B0B0F interior shadows, ivory #F5F0E6 limestone, gold #D4AF37 warm interior light."
- **aspectRatio:** 3:2
- **style hints:** architectural editorial, Brazilian tropical modernism, Marcio Kogan aesthetic reference
- **negative prompt:** "no people, no beach props, no towels, no surfboards, no daytime bright sun, no clichéd tropical decorations"
- **target:** `apps/tocks-website/public/images/home/transformed-02-angra.jpg`
- **author:** tobias-van-schneider

### Asset 1.8 — Ambientes transformados 3 — Fazenda Minas

- **description:** "Editorial architectural photograph of a luxury billiards table installed in a refined colonial-modernist fazenda main hall. Wide 3:2 perspective. Walnut frame with bronze detail, traditional green felt. Background: whitewashed thick-plastered walls, dark reclaimed timber beams, stone floor, single oversized chandelier overhead. Warm late-afternoon low sunlight slanting in through a deep window opening. Paleta: near-black #0B0B0F beams and shadows, ivory #F5F0E6 walls, gold #D4AF37 chandelier glow."
- **aspectRatio:** 3:2
- **style hints:** architectural editorial, refined Brazilian vernacular, warm directional light
- **negative prompt:** "no people, no obvious rural props, no hanging hats, no farm clichés, no overexposed light"
- **target:** `apps/tocks-website/public/images/home/transformed-03-mg.jpg`
- **author:** tobias-van-schneider

---

## Category 2 — PRODUTO

### Asset 2.1 — Wood macro — European Oak

- **description:** "Extreme macro photograph of European oak wood surface, hand-finished with clear satin oil. Frame fills the image edge-to-edge. Strong lateral raking light (approximately 15 degrees from horizontal) emphasizing the natural grain, medullary rays, and open pore texture honestly — no filters, no color grading beyond truth. Wood tone: warm honey-amber #B8936B to deeper caramel #8A6F3A in darker grain. Background is the wood itself — no props, no set dressing. Show the material as it is. Subtle hint of gold #D4AF37 warmth in the highlight only — do not alter the wood color."
- **aspectRatio:** 1:1
- **style hints:** honest macro product photography, scientific-grade clarity, grazing light, material truth
- **negative prompt:** "no varnish gloss, no artificial color grading, no stylized effects, no vignette, no fake grain patterns, no backgrounds, no props, no text, no watermarks"
- **target:** `apps/tocks-website/public/images/materials/wood-oak.jpg`
- **author:** dieter-rams

### Asset 2.2 — Wood macro — Walnut

- **description:** "Extreme macro photograph of American black walnut, hand-finished with clear satin oil. Frame filled entirely with the wood surface. Strong lateral raking light at 15 degrees emphasizing dark chocolate brown grain (#3E2A1F to #5C3D2A) with subtle purple undertones honest to the species. No stain, no dyes — true walnut. Background: wood only. Minimal, functional, honest."
- **aspectRatio:** 1:1
- **style hints:** honest macro, grazing light, material truth, Braun-era product photography discipline
- **negative prompt:** "no artificial coloring, no varnish gloss, no backgrounds, no props, no gold overlays on the wood itself, no stylization, no text"
- **target:** `apps/tocks-website/public/images/materials/wood-walnut.jpg`
- **author:** dieter-rams

### Asset 2.3 — Wood macro — Freijó

- **description:** "Extreme macro photograph of Freijó wood (Cordia goeldiana — Brazilian native hardwood), hand-finished with clear satin oil. Frame filled with the wood surface. Strong lateral raking light at 15 degrees. True Freijó color: warm golden-amber #C9955C with slightly darker long grain lines. Background: wood only. Show the material with functional honesty."
- **aspectRatio:** 1:1
- **style hints:** honest macro, grazing light, truthful Brazilian hardwood representation
- **negative prompt:** "no artificial staining, no varnish gloss, no props, no backgrounds, no stylized filter, no text, no logos"
- **target:** `apps/tocks-website/public/images/materials/wood-freijo.jpg`
- **author:** dieter-rams

### Asset 2.4 — Wood macro — Ebony

- **description:** "Extreme macro photograph of Macassar ebony, hand-finished with satin oil. Frame filled with wood surface. Strong lateral raking light at 15 degrees to reveal the dramatic black and amber striping (#1A1A1E blacks to #6B4A2A amber bands) honest to the species. No artificial color enhancement. Background: wood only."
- **aspectRatio:** 1:1
- **style hints:** honest macro, grazing light, material integrity, Rams-era Braun product clarity
- **negative prompt:** "no fake gloss, no artificial staining, no props, no backgrounds, no filters, no text"
- **target:** `apps/tocks-website/public/images/materials/wood-ebony.jpg`
- **author:** dieter-rams

### Asset 2.5 — Felt close-up — Traditional Green

- **description:** "Macro photograph of Simonis 860 billiards cloth, traditional championship green (#1F4A36 approx). Frame filled with the felt surface at 45-degree slight angle to reveal the characteristic worsted wool nap direction. Raking light from left. Show fiber truth — the slight directional sheen that reveals quality. No stylization. Paleta note: near-black shadow #0B0B0F at far left fall-off only."
- **aspectRatio:** 1:1
- **style hints:** honest material macro, fiber-truth photography, grazing directional light
- **negative prompt:** "no chalk marks, no billiard balls in frame, no cue tips, no stylized effects, no color grading, no props, no gradient overlays"
- **target:** `apps/tocks-website/public/images/materials/felt-green.jpg`
- **author:** dieter-rams

### Asset 2.6 — Felt close-up — Bordeaux / Wine

- **description:** "Macro photograph of Simonis 860 billiards cloth in deep bordeaux / wine red (#6B2B38 approx). Frame filled with felt surface at slight 45-degree angle. Raking light from left revealing worsted wool nap direction. Honest material representation. Shadow fall-off to near-black #0B0B0F at edge."
- **aspectRatio:** 1:1
- **style hints:** honest material macro, fiber truth, directional grazing light
- **negative prompt:** "no props, no balls, no chalk, no cues, no color grading beyond truth, no stylized vignette"
- **target:** `apps/tocks-website/public/images/materials/felt-bordeaux.jpg`
- **author:** dieter-rams

### Asset 2.7 — Felt close-up — Navy Blue

- **description:** "Macro photograph of Simonis 860 billiards cloth in deep navy blue (#1B2A45 approx). Frame filled with felt at slight 45-degree angle. Raking light from left revealing worsted wool nap. Honest material. Shadow fall-off to near-black #0B0B0F at edge."
- **aspectRatio:** 1:1
- **style hints:** honest material macro, fiber truth, directional grazing light
- **negative prompt:** "no props, no balls, no chalk, no cues, no stylized color grading, no gradient overlays, no text"
- **target:** `apps/tocks-website/public/images/materials/felt-navy.jpg`
- **author:** dieter-rams

### Asset 2.8 — Projetos Realizados 1 — Contemporary architectural

- **description:** "Architectural photograph (2:3 portrait) of a luxury billiards table in a contemporary Brazilian apartment, table as clear protagonist occupying lower two-thirds of frame. Walnut frame, bordeaux felt. Background: clean concrete wall, single piece of restrained dark-framed art, polished concrete floor. Single overhead pendant. Honest architectural lens — rectilinear, no distortion, no stylized wide-angle. Paleta Gilded Noir strictly: #0B0B0F dominant shadow, #D4AF37 single pendant warmth, #F5F0E6 ivory wall highlight."
- **aspectRatio:** 2:3
- **style hints:** architectural photography, restrained, functional, long-lasting visual language (Rams principle 7)
- **negative prompt:** "no people, no decorative clutter, no plants, no books, no rugs, no stylized wide-angle distortion, no HDR, no text"
- **target:** `apps/tocks-website/public/images/projects/project-01-contemporary.jpg`
- **author:** dieter-rams

### Asset 2.9 — Projetos Realizados 2 — Classical library

- **description:** "Architectural photograph (2:3 portrait) of a luxury billiards table installed in a private library room. Ebony frame, navy felt. Background: floor-to-ceiling dark wood shelving with leather-bound volumes, single brass library picture light. Table as protagonist. Restrained, timeless framing. Paleta Gilded Noir: #0B0B0F dominant, #D4AF37 brass accent, #F5F0E6 subtle ivory highlights on book edges."
- **aspectRatio:** 2:3
- **style hints:** architectural photography, classical restraint, functional honesty
- **negative prompt:** "no people, no cue racks, no billiard balls on table, no decorative clutter, no stylized effects"
- **target:** `apps/tocks-website/public/images/projects/project-02-library.jpg`
- **author:** dieter-rams

### Asset 2.10 — Projetos Realizados 3 — Warm minimalism

- **description:** "Architectural photograph (2:3 portrait) of a luxury billiards table in a warm minimalist residence. Freijó frame, green felt. Background: single whitewashed plaster wall, dark timber floor, one restrained linen drape. Single ceiling recessed light. Table protagonist. Paleta Gilded Noir applied with restraint: #0B0B0F shadow, #F5F0E6 wall, #D4AF37 only in the warm light temperature."
- **aspectRatio:** 2:3
- **style hints:** architectural photography, warm minimalism, less-is-more
- **negative prompt:** "no people, no decorative props, no stylized effects, no plants, no clutter, no text"
- **target:** `apps/tocks-website/public/images/projects/project-03-minimal.jpg`
- **author:** dieter-rams

---

## Category 3 — ATELIER

### Asset 3.1 — Craftsman hands

- **description:** "Tight 4:3 photograph of experienced marceneiro hands shaping a piece of dark walnut with a hand chisel. Only hands and forearms visible from the wrist down — no face, no torso. Hands show authentic age and craft: fine sawdust on the skin, subtle tool-wear. Duotone treatment: warm gold (#D4AF37) for highlights, deep near-black (#0B0B0F) for shadows, no true blacks — midtones carry the detail. Background: out-of-focus workbench surface with a single chisel and a small pile of wood shavings. Workshop ambient light from a single high window, soft diffused key."
- **aspectRatio:** 4:3
- **style hints:** duotone gold/black editorial, craft photography, Vanity Fair artisanship spread reference
- **negative prompt:** "no face, no full body, no modern power tools, no plastic, no safety glasses in frame, no branded tools, no text, no pure B&W (use duotone), no pure black #000000"
- **target:** `apps/tocks-website/public/images/atelier/hands.jpg`
- **author:** tobias-van-schneider

### Asset 3.2 — Atelier shot 1 — Workbench

- **description:** "Wide 16:9 editorial photograph of a luxury furniture atelier workbench in low-key lighting. Heavy walnut workbench in foreground with a single in-progress billiards table rail cross-section mounted in a vise, hand chisels arranged in a clean row, plane, marking gauge — all high-quality hand tools laid out with discipline. Workshop ambient light from a single high-window shaft of warm afternoon light cutting across the bench. No people visible. Dark workshop interior beyond the lit zone. Paleta Gilded Noir: #0B0B0F workshop shadows dominant, gold #D4AF37 warm light shaft, ivory #F5F0E6 only on highlights of raw wood cross-section."
- **aspectRatio:** 16:9
- **style hints:** cinematic craft narrative, editorial workshop photography, single-shaft window light, still-life discipline
- **negative prompt:** "no people, no modern power tools, no plastic bins, no branded stickers, no fluorescent overhead tubes, no bright overall lighting, no visible text on tools, no clichéd workshop clutter"
- **target:** `apps/tocks-website/public/images/atelier/workbench.jpg`
- **author:** tobias-van-schneider

### Asset 3.3 — Atelier shot 2 — Wood storage

- **description:** "Wide 16:9 editorial photograph of a luxury atelier's wood storage area. Rows of stacked hardwood boards — walnut, oak, freijó, ebony — stickered with precision air-drying spacers, visible end-grain facing camera. Industrial shelving rack, discreet and functional. Single warm tungsten work-light hanging low illuminating the nearest stack; deeper shelves fall into shadow. No people. Paleta Gilded Noir: #0B0B0F deep shadows in back, warm gold #D4AF37 light on nearest boards, ivory #F5F0E6 pale oak endgrain highlight."
- **aspectRatio:** 16:9
- **style hints:** editorial craft narrative, inventory-as-beauty, single practical warm light
- **negative prompt:** "no people, no forklifts, no barcodes, no shipping labels, no branded text, no modern industrial fluorescent light, no clutter"
- **target:** `apps/tocks-website/public/images/atelier/storage.jpg`
- **author:** tobias-van-schneider

---

## Approval

**Reviewer:** @ui-designer (Pixel)
**Status:** APPROVED WITH NOTES

**Consistency notes (no rewrites — reinforcements only):**

1. **Palette discipline strong.** All 18 prompts reference the Gilded Noir triad (`#0B0B0F`, `#D4AF37`, `#F5F0E6`) explicitly in the description — keep this pattern for future asset additions.
2. **Cliché prevention uniform.** Every prompt carries negative entries for people, logos, text, and luxury tropes (champagne, tuxedos, exotic cars). Nano Banana 2 should respect these negatives.
3. **Mood split is intentional and correct.** Tobias prompts (HOME/ATELIER) lean cinematic + editorial; Rams prompts (PRODUTO/materials) lean honest + scientific. This is a feature, not a bug — materials macros must be truthful while environment shots must be aspirational. Do NOT try to merge the two moods.
4. **Target paths** follow `apps/tocks-website/public/images/{category}/{slug}.{ext}` convention — aligns with Next.js `public/` + existing component expectations.
5. **One watch-item for Orion:** Nano Banana 2 sometimes injects pure black `#000000`. All prompts negative-prompt this explicitly. If outputs come back too dark, re-gen with `#0B0B0F` explicitly mentioned twice.
6. **Recommendation:** Orion should run 2 variants per hero-tier prompt (1.1, 1.6, 2.1) to maximize selection quality on highest-leverage assets.

---

## Execution order for Orion

### Tier A — Highest leverage (run first)

1. **Asset 2.1** — Oak wood macro → swatch-picker unblocks product config UX for 4 woods.
2. **Asset 2.5** — Green felt macro → same swatch-picker pattern for 3 felts.
3. **Asset 1.1** — Hero background → must-have before any launch, drives first-fold emotion.

### Tier B — Complete category when A validated

4. Asset 2.2, 2.3, 2.4 — remaining wood macros (follow 2.1 exact style for visual consistency).
5. Asset 2.6, 2.7 — remaining felt macros.
6. Assets 1.2–1.5 — 4 ambient cards.
7. Assets 1.6–1.8 — 3 "Ambientes transformados".
8. Assets 2.8–2.10 — 3 "Projetos Realizados".

### Tier C — Nice-to-have (can defer post-launch)

9. Asset 3.1 — Craftsman hands duotone.
10. Asset 3.2, 3.3 — Workbench + storage atelier shots.

**Rationale:** Category 2 first because (a) lowest cost per asset (macros are simple for Nano Banana), (b) materials UX is currently blocked on images, (c) validates that Gilded Noir palette is being honored before committing to bigger cinematic shots.

---

## Tradeoffs / Tensions surfaced between clones

1. **Tobias vs Rams on gold overlay.** Tobias wanted gold `#D4AF37` reflection visible on felt and wood surfaces. Rams rejected for Category 2 — "material honesty forbids false highlights; gold only in the light source, never on the material itself." Resolved: PRODUTO category prompts carry explicit "no gold overlays on the wood itself" negative; HOME category keeps gold accents in environment lighting.
2. **Cinematic vs restrained framing.** Tobias favored dramatic low-key single-spot lighting for HOME. Rams favored even, truthful light for PRODUTO. This split is preserved because the use-contexts differ (hero emotion vs product-configurator clarity).
3. **Green felt default.** Tobias defaulted several HOME prompts to bordeaux felt for editorial drama. Rams noted bordeaux is not the most ordered Brazilian customer color (green traditional remains #1 per catalog). Compromise: hero (1.1) = bordeaux for distinction; ambient cards mix green + bordeaux + navy to show range without privileging one.
4. **"Atelier" preservation.** Both clones agreed to preserve "Atelier" as editorial concept (no literal factory-tour shots of Itajaí/SC facility). Category 3 depicts archetypal craft workshop, not documentary.

---

## Blockers

None. All specs ready for Orion execution.

## Consultation IDs (audit trail)

- tobias-van-schneider: `4bec680c-a9b3-4f99-8fc0-bb05eafba42d`
- dieter-rams: `7ce7799d-b81d-403f-a944-3b442adeabc9`
- ui-designer: `c97baf09-c504-4651-8270-363f800d4bfe`
