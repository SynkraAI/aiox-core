# Tocks Video Pool Curation — 06/Mai

## Inventory summary

- **Total files:** 122 (111 `.mp4` + 11 `.mov`/`.MOV`)
- **Total size:** ~520 MB
- **By folder:**
  - `Pasta padrão da Skara/` — 122 files (100%)
  - `Renders/` — empty
- **By aspect (probed sample n=43, extrapolated):**
  - **16:9 (1920x1080)** — 6 files (all MOV, IMG_0871/0892/0894/0895/0896/5112/5113)
  - **16:9 (3840x2160 / 4K)** — 4 files (MOV: IMG_0872/0873/0874/0875)
  - **16:9 SD (848x480)** — ~95 files (WhatsApp-compressed MP4s, dominant pattern)
  - **9:16 portrait (1080x1920)** — 5 confirmed (VIDEO-2024-04-13 series + 462C96C2)
  - **9:16 portrait SD (480x848)** — 2+ (VIDEO-2024-04-20-11-32-00, VIDEO-2024-01-04-20-01-30)
- **Duration buckets (probed):**
  - `<5s` — ~12 files (IMG_0871/0872/0873/0874/0875, micro WhatsApp clips)
  - `5–15s` — ~25 files (sweet spot for hero loop)
  - `15–60s` — ~70+ files (b-roll / narrative range)
  - `60–180s` — 0 confirmed
  - `>180s` — 0 confirmed
- **Codec:** H.264 across the board

**Critical finding:** the bulk of the pool (≈95 of 122) is WhatsApp-compressed at 848x480. These fail the >=720p criterion and cannot be used at hero scale. The only true HD assets are the 11 native iPhone `.mov` files plus 5 portrait `.mp4`s preserved at 1080x1920.

---

## Top 3 Hero Candidates

### #1 IMG_5112.mov
- Duration: **42.8s** / Resolution: **1920x1080** / Aspect: **16:9** / Size: **76.9 MB** / Codec: H.264 30fps
- Folder: `Pasta padrão da Skara/`
- Why: Longest native HD clip in the pool (~43s) — enough runway for a narrative hero or to extract multiple 8–12s loops. Largest file = highest bitrate among the HD set, best master quality.
- Suggested role: **narrative b-roll / hero master** — cut a 8–12s loop for above-the-fold + reserve full clip for a section transition.

### #2 IMG_0895.mov
- Duration: **26.8s** / Resolution: **1920x1080** / Aspect: **16:9** / Size: **45.4 MB** / Codec: H.264 30fps
- Folder: `Pasta padrão da Skara/`
- Why: Second-largest HD clip with a clean 27s of footage — ideal length to host a 6–10s hero loop without forcing repetition. High bitrate (~14 Mbps), confidence on motion stability.
- Suggested role: **hero loop** (cut 6–10s seamless) + secondary b-roll cut.

### #3 IMG_5113.mov
- Duration: **26.3s** / Resolution: **1920x1080** / Aspect: **16:9** / Size: **47.0 MB** / Codec: H.264 30fps
- Folder: `Pasta padrão da Skara/`
- Why: Pair-mate to IMG_5112 (timestamp neighbour, similar size/quality). Provides a second 27s HD master so the hero section can A/B between two angles or use as section-2 opener.
- Suggested role: **hero loop alt** / narrative b-roll for "atelier process" section.

**Honourable mentions for hero section (16:9 HD, shorter):**
- `IMG_0896.mov` — 12.2s, 1920x1080, 17.7 MB — perfect length for a tight loop, but lower bitrate.
- `IMG_0894.mov` — 11.0s, 1920x1080, 16.7 MB — same profile.
- `IMG_0892.mov` — 7.4s, 1920x1080, 10.0 MB — shortest but loop-friendly out of the box.

---

## Story/Reels Candidates (9:16)

### #1 VIDEO-2024-04-13-18-23-34.mp4
- Duration: **12.0s** / Resolution: **1080x1920** / Aspect: **9:16** / Size: **4.4 MB** / 30fps
- Why: Longest of the 9:16 1080p batch — fits Reels/Stories cap (15s) with 3s headroom for branding outro.
- Suggested role: **Reels primary**.

### #2 VIDEO-2024-04-13-17-48-06.mp4
- Duration: **11.4s** / Resolution: **1080x1920** / Aspect: **9:16** / Size: **4.5 MB** / 30fps
- Why: Native portrait 1080p, ideal duration. Sequential timestamp with the others suggests a coherent atelier/showroom shoot.
- Suggested role: **Stories cut / paid social vertical**.

### #3 VIDEO-2024-04-13-18-54-04.mp4
- Duration: **10.8s** / Resolution: **1080x1920** / Aspect: **9:16** / Size: **3.5 MB** / 30fps
- Why: Companion to #1/#2; provides angle variety for an A/B vertical creative test.
- Suggested role: **Reels alt / Meta Ads vertical creative**.

**Honourable mentions:**
- `VIDEO-2024-04-13-19-13-15.mp4` — 8.8s, 1080x1920 — fourth piece of the same shoot batch.
- `462C96C2-0E57-4899-841E-33CE8B44F60D.MP4` — 2.6s, 1080x1920 — ultra-short, viable as transition/sting only.

---

## 4K Cuts (special use)

The four `IMG_087x.MOV` files are **3840x2160** but very short (0.9–3.3s each):
- `IMG_0872.MOV` — 0.9s
- `IMG_0873.MOV` — 3.1s
- `IMG_0874.MOV` — 2.2s
- `IMG_0875.MOV` — 3.3s

Use as **micro-cuts / detail shots** (texture closeup of felt, wood grain, hardware) inside an editorial sequence. Too short to stand alone as hero.

---

## Reject pool (do not use)

**~95 files** at **848x480** (WhatsApp/messenger-compressed MP4) and **2 files** at **480x848** (vertical compressed). All fail the >=720p criterion for hero use. Beyond the resolution issue, WhatsApp's recompression visibly destroys gradients on dark wood / felt — fatal for a luxury narrative.

Examples:
- `VIDEO-2023-04-28-15-46-22.mp4` — 848x480 / 29.3s / 5.3 MB
- `VIDEO-2023-10-09-13-24-17.mp4` — 720x1280 / 31.6s / 11.4 MB *(borderline 720p but mobile-shot vertical, low bitrate)*
- `VIDEO-2024-09-05-17-38-51.mp4` — 848x480 / 29.3s / 5.3 MB

Additional rejects:
- `IMG_0871.mov` — 1920x1080 but only **2.7s** (too short for hero standalone, possibly redundant with the 0872–0875 set).
- All `VIDEO-2023-07-07-17-00-1x` and `VIDEO-2023-07-09-11-38-46` series PHOTO files at **0 bytes** (corrupt — flagged in dir listing).

**Recommendation:** request from Skara the original (uncompressed) source for the highest-rated MP4s if any of those shots are critical. Otherwise treat the MOV/portrait-MP4 set as the de-facto usable footage library.

---

## Acquisition gaps to flag back to client

1. **No master/raw renders** — `Renders/` folder is empty.
2. **No hero-length 16:9 4K** — best 4K clips are <4s.
3. **Heavy WhatsApp compression** on ~78% of pool — request originals.
4. **No drone / dolly / tracking shots** evident from naming — all timestamps suggest handheld iPhone captures.
