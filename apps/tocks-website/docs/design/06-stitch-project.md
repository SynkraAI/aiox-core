# Tocks Website v2 — Stitch Project Reference

**Created:** 2026-04-16
**Tool:** Google Stitch MCP (v0.5.3, API Key auth)
**Model:** Gemini 3.1 Pro

---

## Project

- **Title:** Tocks Website v2 — Gilded Noir
- **Project ID:** `13121423762766500977`
- **URL:** https://stitch.withgoogle.com (open project by ID)

## Design System

- **Name:** Gilded Noir — Tocks Luxury
- **Asset ID:** `17802990810530603774`
- **Color Mode:** DARK
- **Primary:** #D4AF37 (gold)
- **Secondary:** #8A6F3A (deep gold)
- **Neutral:** #0B0B0F (near-black)
- **Headline Font:** EB Garamond (proxy for Cormorant Garamond)
- **Body Font:** Inter
- **Label Font:** Montserrat
- **Roundness:** ROUND_EIGHT

## Generated Screens

| # | Page | Route | Screen ID | Resolution |
|---|------|-------|-----------|------------|
| 1 | Home | `/` | `e5bf76fd830945338a639f4ba1b0ec6c` | 2560x10392 |
| 2 | Colecao | `/colecao` | `515cbce20ddf4859ab0413d1ff2a940d` | 2560x4444 |
| 3 | Produto | `/colecao/[slug]` | `2b7e9726eda64e35acae981be7eb2f2e` | 2560x6916 |
| 4 | Atelier | `/atelier` | `d4a20b9e147e458f92984c697ada0b2e` | 2560x10146 |
| 5 | Projetos | `/projetos` | `f3b1efb4671f4c9d9ed245a5d97b228e` | 2560x4864 |
| 6 | Blog | `/blog` | `2d8056375c4f446395a14daee0c2ee74` | 2560x4182 |
| 7 | Contato | `/contato` | `a6446aa28f4e4ca4a92342d51d4d3bf1` | 2560x6288 |

## Stitch CLI Commands

```bash
# List screens
npx -y @_davideast/stitch-mcp list-screens --project 13121423762766500977

# Get specific screen
npx -y @_davideast/stitch-mcp get-screen --project 13121423762766500977 --screen {SCREEN_ID}

# Apply design system to screens
# Use mcp__stitch__apply_design_system with projectId + assetId + selectedScreenInstances
```

## Next Steps

- [ ] Review screens in Stitch UI (mind clones: don-norman, dieter-rams)
- [ ] Apply design system to all 7 screens
- [ ] Generate variants for Home and Produto pages
- [ ] Extract component patterns for implementation
- [ ] Generate product images with Nano Banana 2
