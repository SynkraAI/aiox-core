#!/usr/bin/env python3
"""
Shared utilities for timestamp and transcription validation scripts.

Provides:
  - Timestamp conversion (HH:MM:SS <-> seconds)
  - Raw transcript parsing (bracketed, WebVTT, SRT)
  - MD segment parsing (all_moments_merged, momentos.md, GUIA_EDITOR)
  - Auto-discovery of transcript_raw.txt
  - Text normalization and similarity
"""
import glob
import re
from difflib import SequenceMatcher
from pathlib import Path


# ---------------------------------------------------------------------------
# Timestamp helpers
# ---------------------------------------------------------------------------

def ts_to_seconds(ts: str) -> float:
    """Convert HH:MM:SS, MM:SS, or SS to seconds."""
    ts = ts.strip().replace(",", ".")
    parts = ts.split(":")
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    return float(parts[0])


def seconds_to_ts(s: float) -> str:
    """Convert seconds to HH:MM:SS (or MM:SS if < 1h)."""
    h = int(s) // 3600
    m = (int(s) % 3600) // 60
    sec = int(s) % 60
    if h > 0:
        return f"{h:02d}:{m:02d}:{sec:02d}"
    return f"{m:02d}:{sec:02d}"


# ---------------------------------------------------------------------------
# Text normalization and similarity
# ---------------------------------------------------------------------------

def normalize_text(s: str) -> str:
    """Lowercase, strip accents, strip punctuation, collapse whitespace."""
    import unicodedata
    s = s.lower()
    # Strip accents: é→e, ã→a, ç→c, etc.
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^\w\s]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def text_similarity(a: str, b: str) -> float:
    """Compute similarity ratio between two strings (0.0 - 1.0)."""
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


# ---------------------------------------------------------------------------
# Transcript auto-discovery
# ---------------------------------------------------------------------------

def find_transcript_auto(input_md_path: str) -> str | None:
    """
    Try to automatically find transcript_raw.txt based on the input_md path.

    Search strategy:
      1. If input is in _temp/mining/{slug}/, look for transcript_raw.txt in same dir
      2. If input is in Output/curated/{slug}/, look for _temp/mining/*/transcript_raw.txt
         with matching slug
      3. Scan all _temp/mining/*/transcript_raw.txt and return first found
    """
    md_path = Path(input_md_path).resolve()
    project_root = _find_project_root(md_path)

    # Strategy 1: input is inside _temp/mining/{slug}/
    parts = md_path.parts
    for i, part in enumerate(parts):
        if part == "_temp" and i + 2 < len(parts) and parts[i + 1] == "mining":
            slug_dir = Path(*parts[: i + 3])
            candidate = slug_dir / "transcript_raw.txt"
            if candidate.exists():
                return str(candidate)

    # Strategy 2: input is inside Output/curated/{slug}/
    for i, part in enumerate(parts):
        if part.lower() == "output" and i + 2 < len(parts) and parts[i + 1].lower() == "curated":
            slug = parts[i + 2]
            if project_root:
                candidate = project_root / "_temp" / "mining" / slug / "transcript_raw.txt"
                if candidate.exists():
                    return str(candidate)

    # Strategy 3: scan all _temp/mining/*/transcript_raw.txt
    if project_root:
        pattern = str(project_root / "_temp" / "mining" / "*" / "transcript_raw.txt")
        found = glob.glob(pattern)
        if len(found) == 1:
            return found[0]
        if len(found) > 1:
            # Multiple transcripts; can't auto-select
            return None

    return None


def _find_project_root(path: Path) -> Path | None:
    """Walk up from path to find project root (has .git or CLAUDE.md)."""
    current = path if path.is_dir() else path.parent
    for _ in range(20):
        if (current / ".git").exists() or (current / "CLAUDE.md").exists():
            return current
        parent = current.parent
        if parent == current:
            break
        current = parent
    return None


# ---------------------------------------------------------------------------
# Raw transcript parser
# ---------------------------------------------------------------------------

def parse_transcript(filepath: str) -> list[dict]:
    """
    Parse raw transcript file. Returns list of {'start': float, 'end': float|None, 'text': str}.

    Supports:
      - Bracketed: [HH:MM:SS] text
      - WebVTT:    HH:MM:SS.mmm --> HH:MM:SS.mmm \\n text
      - SRT:       N \\n HH:MM:SS,mmm --> HH:MM:SS,mmm \\n text
    """
    text = Path(filepath).read_text(encoding="utf-8")
    lines = text.splitlines()

    # Detect format by scanning first 50 lines
    fmt = "bracketed"
    bare_ts_re = re.compile(r"^(\d{1,2}:\d{2}(?::\d{2})?)$")
    for line in lines[:50]:
        if "-->" in line:
            fmt = "vtt"
            break
    if fmt == "bracketed":
        for line in lines[:50]:
            if bare_ts_re.match(line.strip()):
                fmt = "bare"
                break

    entries: list[dict] = []

    if fmt == "bare":
        i = 0
        while i < len(lines):
            m = bare_ts_re.match(lines[i].strip())
            if m:
                ts = ts_to_seconds(m.group(1))
                text_lines = []
                i += 1
                while i < len(lines):
                    if bare_ts_re.match(lines[i].strip()):
                        break
                    txt = lines[i].strip()
                    if txt:
                        text_lines.append(txt)
                    i += 1
                if text_lines:
                    entries.append({"start": ts, "end": None, "text": " ".join(text_lines)})
            else:
                i += 1
        # Fill end timestamps from next entry's start
        for i in range(len(entries) - 1):
            entries[i]["end"] = entries[i + 1]["start"]
        if entries:
            entries[-1]["end"] = entries[-1]["start"] + 5

    elif fmt == "bracketed":
        pat = re.compile(r"^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)")
        for line in lines:
            m = pat.match(line.strip())
            if m:
                ts = ts_to_seconds(m.group(1))
                txt = re.sub(r"^>>\s*", "", m.group(2).strip())
                if txt:
                    entries.append({"start": ts, "end": None, "text": txt})
        # Fill end timestamps from next entry's start
        for i in range(len(entries) - 1):
            entries[i]["end"] = entries[i + 1]["start"]
        if entries:
            entries[-1]["end"] = entries[-1]["start"] + 5

    else:  # vtt or srt
        arrow_pat = re.compile(
            r"(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?)\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?)"
        )
        # Detect speaker labels: scan text lines for consistent "Name: text" pattern
        speaker_pat = re.compile(r"^([A-Za-z][A-Za-z0-9 _.'-]+):\s")
        speaker_candidates: dict[str, int] = {}
        for line in lines:
            s = line.strip()
            if not s or "-->" in s or re.match(r"^\d+$", s):
                continue
            sm = speaker_pat.match(s)
            if sm:
                speaker_candidates[sm.group(1)] = speaker_candidates.get(sm.group(1), 0) + 1
        # A real speaker appears 3+ times
        speakers = {name for name, count in speaker_candidates.items() if count >= 3}

        i = 0
        while i < len(lines):
            m = arrow_pat.search(lines[i].strip())
            if m:
                start = ts_to_seconds(m.group(1))
                end = ts_to_seconds(m.group(2))
                text_lines = []
                i += 1
                while i < len(lines) and lines[i].strip():
                    txt = re.sub(r"<[^>]+>", "", lines[i].strip())
                    txt = re.sub(r"^>>\s*", "", txt)
                    # Strip known speaker labels only
                    if speakers:
                        sm = speaker_pat.match(txt)
                        if sm and sm.group(1) in speakers:
                            txt = txt[sm.end():]
                    # Skip SRT sequence numbers (pure digits)
                    if txt and not re.match(r"^\d+$", txt):
                        text_lines.append(txt)
                    i += 1
                if text_lines:
                    entries.append({"start": start, "end": end, "text": " ".join(text_lines)})
            else:
                i += 1

    return entries


# ---------------------------------------------------------------------------
# MD segment parser — auto-detects format
# ---------------------------------------------------------------------------

def parse_segments(filepath: str) -> list[dict]:
    """
    Parse any curator output MD and extract segments with timestamps + transcription.

    Returns list of:
      {'label': str, 'inicio': float, 'fim': float|None, 'transcription': str}

    Auto-detects formats:
      A) all_moments_merged: ### MOMENTO N / **Inicio:** / **Fim:** / **TRANSCRIÇÃO COMPLETA:**
      B) momentos.md:        ### #N | TYPE | ... / **Timestamp:** HH:MM:SS - HH:MM:SS / **Transcricao:**
      C) GUIA_EDITOR:        ### Momento #N (...) / - **Timestamp:** HH:MM:SS -> HH:MM:SS / - **Transcricao:**
      D) COLD OPEN section:  - Timestamp: **HH:MM:SS -> HH:MM:SS** / - **Transcricao:**
    """
    text = Path(filepath).read_text(encoding="utf-8")
    lines = text.splitlines()
    segments: list[dict] = []

    # --- Timestamp patterns ---
    # Format B/C: **Timestamp:** HH:MM:SS -> HH:MM:SS  or  HH:MM:SS - HH:MM:SS
    ts_kw_arrow = re.compile(
        r"\*\*Timestamp:\*\*\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:->|-)\s*(\d{1,2}:\d{2}(?::\d{2})?)"
    )
    # Format D (COLD OPEN): - Timestamp: **HH:MM:SS -> HH:MM:SS**
    ts_cold = re.compile(
        r"-\s*Timestamp:\s*\*\*(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:->|-)\s*(\d{1,2}:\d{2}(?::\d{2})?)\*\*"
    )
    # Format A: **Inicio:** or **Início:**
    inicio_pat = re.compile(r"\*\*In[ií]cio:\*\*\s*(\d{1,2}:\d{2}(?::\d{2})?)")
    fim_pat = re.compile(r"\*\*Fim:\*\*\s*(\d{1,2}:\d{2}(?::\d{2})?)")

    # --- Header patterns ---
    header_guia = re.compile(r"^###\s+Momento\s+#(\d+)")        # GUIA_EDITOR (old)
    header_merged = re.compile(r"^###\s+MOMENTO\s+(\d+)")       # all_moments_merged
    header_momentos = re.compile(r"^###\s+#(\d+)\s*\|")          # momentos.md v3
    # GUIA_EDITOR v2 (longform_simple): ### Take N — (HH:MM:SS → HH:MM:SS) or ### Take N — GANCHO (...)
    header_take = re.compile(
        r"^###\s+Take\s+(\d+)\s*[—–\-]\s*(?:GANCHO\s*)?\((\d{1,2}:\d{2}(?::\d{2})?)\s*(?:→|->)\s*(\d{1,2}:\d{2}(?::\d{2})?)\)"
    )

    # --- Transcription labels ---
    trans_labels = ("**Transcricao:**", "**TRANSCRIÇÃO COMPLETA:**", "**Transcricao:**")

    def _is_section_boundary(ln: str) -> bool:
        ln = ln.strip()
        return bool(
            header_guia.match(ln)
            or header_merged.match(ln)
            or header_momentos.match(ln)
            or header_take.match(ln)
            or ln.startswith("## ")
        )

    def _extract_transcription(lines_list: list[str], start_idx: int) -> tuple[str, int]:
        """Extract blockquote text after a transcription label. Returns (text, next_idx)."""
        k = start_idx
        # Skip blank lines between label and blockquote
        while k < len(lines_list) and lines_list[k].strip() == "":
            k += 1
        trans_lines = []
        while k < len(lines_list):
            ln = lines_list[k].strip()
            if ln.startswith(">"):
                # Strip > prefix and optional leading space
                content = ln.lstrip(">").lstrip(" ")
                trans_lines.append(content)
                k += 1
            elif ln == "":
                # Blank line could be paragraph break inside blockquote
                # Check if next non-blank line is also a blockquote
                peek = k + 1
                while peek < len(lines_list) and lines_list[peek].strip() == "":
                    peek += 1
                if peek < len(lines_list) and lines_list[peek].strip().startswith(">"):
                    trans_lines.append("")  # preserve paragraph break
                    k += 1
                else:
                    break
            else:
                break
        return " ".join(t for t in trans_lines if t), k

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # --- Detect segment header ---
        label = None
        take_inicio = None
        take_fim = None

        # Check Take header first (has timestamp inline)
        tm_take = header_take.match(line)
        if tm_take:
            label = f"Take{tm_take.group(1)}"
            take_inicio = ts_to_seconds(tm_take.group(2))
            take_fim = ts_to_seconds(tm_take.group(3))

        if label is None:
            hm = header_guia.match(line) or header_merged.match(line) or header_momentos.match(line)
            if hm:
                label = f"#{hm.group(1)}"
            elif line.startswith("## COLD OPEN"):
                label = "COLD_OPEN"

        if label is not None:
            inicio = take_inicio
            fim = take_fim
            transcription = ""

            j = i + 1
            while j < len(lines):
                jline = lines[j].strip()

                # Stop at next segment boundary
                if j > i + 1 and _is_section_boundary(jline):
                    break

                # Try Format D (COLD OPEN inline timestamp)
                cm = ts_cold.search(jline)
                if cm:
                    inicio = ts_to_seconds(cm.group(1))
                    fim = ts_to_seconds(cm.group(2))
                    j += 1
                    continue

                # Try Format B/C (keyword **Timestamp:**)
                tm = ts_kw_arrow.search(jline)
                if tm:
                    inicio = ts_to_seconds(tm.group(1))
                    fim = ts_to_seconds(tm.group(2))
                    j += 1
                    continue

                # Try Format A (**Inicio:**)
                im = inicio_pat.search(jline)
                if im and inicio is None:
                    inicio = ts_to_seconds(im.group(1))

                fm = fim_pat.search(jline)
                if fm and fim is None:
                    fim = ts_to_seconds(fm.group(1))

                # Transcription block — labeled or bare blockquote
                has_trans = False
                for tl in trans_labels:
                    if tl.lower() in jline.lower() or tl.lower() in lines[j].lower():
                        has_trans = True
                        break
                if has_trans:
                    transcription, j = _extract_transcription(lines, j + 1)
                    continue

                # Bare blockquote (Take format — no label, just > text)
                # Skip bridge blockquotes (after "Ponte de entrada/saída" lines)
                is_bridge_quote = False
                if jline.startswith(">"):
                    # Check if previous non-blank line was a bridge label
                    for lookback in range(j - 1, max(j - 4, i), -1):
                        prev = lines[lookback].strip()
                        if not prev:
                            continue
                        if "ponte de entrada" in prev.lower() or "ponte de sa" in prev.lower():
                            is_bridge_quote = True
                        break
                if not transcription and jline.startswith(">") and not jline.startswith("> Texto da ponte") and not is_bridge_quote:
                    transcription, j = _extract_transcription(lines, j)
                    continue

                j += 1

            if inicio is not None:
                if not label:
                    label = f"seg@{seconds_to_ts(inicio)}"
                segments.append({
                    "label": label,
                    "inicio": inicio,
                    "fim": fim,
                    "transcription": transcription,
                })
            i = max(j, i + 1)
        else:
            i += 1

    return segments
