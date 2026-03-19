# QG-RENDER — Rendered Video Quality Gate

**Purpose:** Verify rendered video cuts meet platform specs before delivery
**Applies to:** All video renders (shorts, longform, reels, VSL cuts)
**Verdict:** PASS (all ✓) | CONCERNS (minor fixes) | FAIL (critical issues)

---

## File & Playability

- [ ] Output file exists at expected path
- [ ] File is playable (no corruption)
- [ ] File size is reasonable (>1MB for shorts, >10MB for longform, >100MB for 4K)
- [ ] Container codec matches platform requirement (H.264, VP9, H.265)

## Duration & Timing

- [ ] Total duration within ±2 seconds of expected
- [ ] Duration matches render_report.md specification
- [ ] Segment timings match source markers (accurate cuts)

## Resolution & Format

**For Shorts (Instagram Reels, TikTok, YouTube Shorts):**
- [ ] Resolution is 1080×1920 (9:16 portrait)
- [ ] Frame rate matches source (usually 24fps or 30fps)
- [ ] Aspect ratio locked (no stretch/squeeze artifacts)

**For Longform (YouTube, LinkedIn, Blog):**
- [ ] Resolution is 1920×1080 (16:9 landscape)
- [ ] Frame rate matches source
- [ ] Aspect ratio locked

## Audio

- [ ] Audio track present (not muted)
- [ ] Audio levels normalized (-6dB peak, -14dB average)
- [ ] Audio synced to video (no lip-sync issues)
- [ ] No audio dropout or glitches
- [ ] Background music/SFX mixed correctly

## Visual Quality

- [ ] No black frames at start of video
- [ ] No black frames at end of video
- [ ] Transitions between segments are clean (no frame duplication)
- [ ] Color grading applied (no washed out segments)
- [ ] No visible encoding artifacts (banding, blocking)

## Completeness

- [ ] render_report.md exists at expected path
- [ ] render_report.md lists all segments with timings
- [ ] All segments from source bank present in output
- [ ] No dropped or missing segments
- [ ] Segment count matches expected (e.g., 12/12 segments rendered)

## Efficiency

- [ ] Copy mode used where no effects applied (no unnecessary transcoding)
- [ ] Re-encoding only applied to segments requiring effects
- [ ] Render time matches baseline for file size

## Sign-Off

- [ ] Spot check: Play first 10s, middle 10s, last 10s (quality confirms throughout)
- [ ] Video ready for platform upload
- [ ] Metadata correct (title, description, tags if applicable)

---

**Notes:**
- If CONCERNS: Document specific issue (e.g., "audio level -8dB, recommend -6dB")
- If FAIL: Do not upload; return to rendering with issue logged
- render_report.md should be human-readable and track segment source, timecodes, and duration
