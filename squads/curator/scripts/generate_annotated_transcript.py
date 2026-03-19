"""
Generate {source-slug}_transcricao_anotada.md from raw transcript + mined moments.
Maps moments to full transcript, classifies gaps as KEEP/REMOVE/BRIDGE,
identifies natural cut points for each KEEP segment.

v1.0 — Initial implementation following CODE > LLM principle.

Usage:
  python squads/curator/scripts/generate_annotated_transcript.py <transcript> <momentos> <output> <source_name>

Arguments:
  transcript    Path to raw transcript (WebVTT, SRT, or plain text with timestamps)
  momentos      Path to {source-slug}_momentos.md (compact output from mining)
  output        Path for annotated transcript output
  source_name   Human-readable source name (quote if spaces)

Example:
  python squads/curator/scripts/generate_annotated_transcript.py \\
    _temp/mining/cohort-avancado-aula1/transcript_raw.txt \\
    output/curated/cohort-avancado-aula1_momentos.md \\
    output/curated/cohort-avancado-aula1_transcricao_anotada.md \\
    "Cohort Avancado - Aula 1"
"""
import re
import sys
from datetime import datetime
from pathlib import Path


# ---------------------------------------------------------------------------
# Timestamp utilities (reused logic from generate_compact_mining.py)
# ---------------------------------------------------------------------------

def clean_timestamp(ts):
    """Convert WebVTT timestamp (HH:MM:SS.mmm) to clean HH:MM:SS."""
    if not ts or ts == '??':
        return '00:00:00'
    ts = re.sub(r'\.\d+$', '', ts.strip())
    parts = ts.split(':')
    if len(parts) == 2:
        return f'00:{parts[0].zfill(2)}:{parts[1].zfill(2)}'
    elif len(parts) == 3:
        return f'{parts[0].zfill(2)}:{parts[1].zfill(2)}:{parts[2].zfill(2)}'
    return '00:00:00'


def ts_to_sec(ts):
    """Convert timestamp string to seconds."""
    ts = clean_timestamp(ts)
    parts = ts.split(':')
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])


def sec_to_ts(sec):
    """Convert seconds to HH:MM:SS."""
    sec = max(0, int(sec))
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    return f'{h:02d}:{m:02d}:{s:02d}'


def format_duration(sec):
    """Format seconds as human-readable duration string."""
    sec = max(0, int(sec))
    if sec >= 3600:
        h = sec // 3600
        m = (sec % 3600) // 60
        s = sec % 60
        return f'{h}h{m}m{s}s'
    elif sec >= 60:
        m = sec // 60
        s = sec % 60
        return f'{m}m{s}s'
    return f'{sec}s'


# ---------------------------------------------------------------------------
# Parse moments from banco de momentos MD (reused logic)
# ---------------------------------------------------------------------------

def parse_moments(filepath):
    """Parse moments from {source-slug}_momentos.md compact format."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    moments = []
    blocks = re.split(r'### #(\d+)', content)
    for i in range(1, len(blocks), 2):
        mid = int(blocks[i])
        body = blocks[i + 1] if i + 1 < len(blocks) else ''

        ts_m = re.search(r'\*\*Timestamp:\*\*\s*(\S+)\s*-\s*(\S+)', body)
        assunto_m = re.search(r'\*\*Assunto:\*\*\s*(.+)', body)
        mqr_m = re.search(r'\*\*MQR:\*\*\s*(H(\d+)/E(\d+)/S(\d+)/C(\d+))', body)
        impact_m = re.search(r'Score\s+(\d+)', blocks[i - 1] if i > 0 else body)
        tipo_m = re.search(r'\|\s*(\w+)\s*\|\s*(\w+)\s*\|', body)
        trans_match = re.search(
            r'\*\*Transcricao:\*\*\s*\n>(.*?)(?=\n---|\n\*\*|\Z)',
            body, re.DOTALL
        )
        transcricao = trans_match.group(1).strip() if trans_match else ''

        # Try to get type and trigger from the header line: ### #N | TYPE | TRIGGER | Score N
        header_line = body.split('\n')[0] if body else ''
        tipo_header = re.search(r'\|\s*(\w+)\s*\|\s*(\w+)\s*\|', header_line)

        inicio = ts_m.group(1) if ts_m else '00:00:00'
        fim = ts_m.group(2) if ts_m else '00:00:00'

        inicio_clean = clean_timestamp(inicio)
        fim_clean = clean_timestamp(fim)

        # Extract score from header: "### #N | TYPE | TRIGGER | Score N"
        score_m = re.search(r'Score\s+(\d+)', header_line)

        moments.append({
            'id': mid,
            'inicio': inicio_clean,
            'fim': fim_clean,
            'inicio_sec': ts_to_sec(inicio_clean),
            'fim_sec': ts_to_sec(fim_clean),
            'tipo': tipo_header.group(1).lower() if tipo_header else '??',
            'gatilho': tipo_header.group(2).upper() if tipo_header else '??',
            'impact': int(score_m.group(1)) if score_m else 0,
            'mqr': mqr_m.group(1) if mqr_m else None,
            'assunto': assunto_m.group(1).strip() if assunto_m else '??',
            'preview': transcricao[:80].replace('\n', ' ').strip(),
            'transcricao': transcricao,
        })
    return moments


# ---------------------------------------------------------------------------
# Parse transcript (WebVTT, SRT, or plain text with timestamps)
# ---------------------------------------------------------------------------

def parse_webvtt(content):
    """Parse WebVTT format into timestamped blocks."""
    blocks = []
    # Match WebVTT cues: timestamp --> timestamp followed by text
    pattern = re.compile(
        r'(\d{1,2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[\.,]\d{3})\s*\n(.*?)(?=\n\n|\n\d|\Z)',
        re.DOTALL
    )
    for m in pattern.finditer(content):
        start = m.group(1).replace(',', '.')
        end = m.group(2).replace(',', '.')
        text = m.group(3).strip()
        # Remove WebVTT positioning tags
        text = re.sub(r'<[^>]+>', '', text)
        if text:
            blocks.append({
                'start': clean_timestamp(start),
                'end': clean_timestamp(end),
                'start_sec': ts_to_sec(start),
                'end_sec': ts_to_sec(end),
                'text': text,
            })
    return blocks


def parse_srt(content):
    """Parse SRT format into timestamped blocks."""
    blocks = []
    pattern = re.compile(
        r'\d+\s*\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\n(.*?)(?=\n\n|\n\d+\s*\n|\Z)',
        re.DOTALL
    )
    for m in pattern.finditer(content):
        start = m.group(1).replace(',', '.')
        end = m.group(2).replace(',', '.')
        text = m.group(3).strip()
        text = re.sub(r'<[^>]+>', '', text)
        if text:
            blocks.append({
                'start': clean_timestamp(start),
                'end': clean_timestamp(end),
                'start_sec': ts_to_sec(start),
                'end_sec': ts_to_sec(end),
                'text': text,
            })
    return blocks


def parse_plain_text(content):
    """Parse plain text with inline timestamps like [HH:MM:SS] or (HH:MM:SS)."""
    blocks = []
    # Look for lines starting with timestamp patterns
    pattern = re.compile(
        r'[\[\(]?(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)[\]\)]?\s*[-–:]?\s*(.*?)(?=[\[\(]?\d{1,2}:\d{2}|\Z)',
        re.DOTALL
    )
    matches = list(pattern.finditer(content))
    for i, m in enumerate(matches):
        start = m.group(1)
        text = m.group(2).strip()
        if not text:
            continue
        start_clean = clean_timestamp(start)
        # End is start of next block or estimated
        if i + 1 < len(matches):
            end_clean = clean_timestamp(matches[i + 1].group(1))
        else:
            # Estimate: add word count * 0.4s per word
            word_count = len(text.split())
            end_sec = ts_to_sec(start_clean) + max(5, int(word_count * 0.4))
            end_clean = sec_to_ts(end_sec)
        blocks.append({
            'start': start_clean,
            'end': end_clean,
            'start_sec': ts_to_sec(start_clean),
            'end_sec': ts_to_sec(end_clean),
            'text': text,
        })
    return blocks


def detect_and_parse_transcript(filepath):
    """Auto-detect transcript format and parse."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Detect format
    if 'WEBVTT' in content[:100]:
        print('  Format detected: WebVTT')
        return parse_webvtt(content), content
    elif re.search(r'\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->', content[:500]):
        print('  Format detected: SRT')
        return parse_srt(content), content
    elif re.search(r'[\[\(]\d{1,2}:\d{2}', content[:500]):
        print('  Format detected: Plain text with timestamps')
        return parse_plain_text(content), content
    else:
        # Try WebVTT without header (some files omit WEBVTT header)
        blocks = parse_webvtt(content)
        if blocks:
            print('  Format detected: WebVTT (no header)')
            return blocks, content
        # Try SRT as fallback
        blocks = parse_srt(content)
        if blocks:
            print('  Format detected: SRT (no numbers)')
            return blocks, content
        # Last resort: plain text
        print('  Format detected: Plain text (fallback)')
        return parse_plain_text(content), content


# ---------------------------------------------------------------------------
# Build annotated transcript
# ---------------------------------------------------------------------------

BRIDGE_THRESHOLD_SEC = 30
CONTEXT_WINDOW_SEC = 2


def find_natural_cut_point(blocks, target_sec, direction, window_sec=CONTEXT_WINDOW_SEC):
    """Find natural cut point near target_sec.

    direction: 'before' (scan backwards) or 'after' (scan forwards)
    Returns (timestamp, reason) or (target as ts, 'exact moment boundary')
    """
    candidates = []

    for i, block in enumerate(blocks):
        if direction == 'before':
            # Look for blocks ending within window before target
            if target_sec - window_sec <= block['end_sec'] <= target_sec:
                # Check for sentence endings
                text = block['text'].rstrip()
                if text.endswith(('.', '!', '?')):
                    candidates.append((block['end_sec'], 'fim de frase'))
                # Check for pause (gap between this block end and next block start)
                if i + 1 < len(blocks):
                    gap = blocks[i + 1]['start_sec'] - block['end_sec']
                    if gap >= 0.5:
                        candidates.append((block['end_sec'], f'pausa {gap:.1f}s'))
        else:  # 'after'
            # Look for blocks starting within window after target
            if target_sec <= block['start_sec'] <= target_sec + window_sec:
                # Check for pause before this block
                if i > 0:
                    gap = block['start_sec'] - blocks[i - 1]['end_sec']
                    if gap >= 0.5:
                        candidates.append((block['start_sec'], f'pausa {gap:.1f}s'))
                # Check previous block for sentence ending
                if i > 0:
                    prev_text = blocks[i - 1]['text'].rstrip()
                    if prev_text.endswith(('.', '!', '?')):
                        candidates.append((blocks[i - 1]['end_sec'], 'fim de frase'))

    if candidates:
        # Prefer sentence endings, then longer pauses
        candidates.sort(key=lambda x: (0 if 'frase' in x[1] else 1, -abs(x[0] - target_sec)))
        return sec_to_ts(candidates[0][0]), candidates[0][1]

    return sec_to_ts(target_sec), 'limite do momento'


def collect_text_for_range(blocks, start_sec, end_sec):
    """Collect all transcript text within a time range."""
    texts = []
    for block in blocks:
        # Block overlaps with range
        if block['end_sec'] > start_sec and block['start_sec'] < end_sec:
            texts.append(block['text'])
    return ' '.join(texts).strip()


def summarize_text(text, max_words=20):
    """Create 1-line summary from text (first N words + context)."""
    words = text.split()
    if len(words) <= max_words:
        return text.replace('\n', ' ')
    return ' '.join(words[:max_words]) + '...'


def build_segments(blocks, moments, total_duration_sec):
    """Build annotated segments covering the entire transcript timeline."""
    if not moments:
        return []

    segments = []
    timeline_cursor = 0  # Current position in seconds

    # Sort moments by start time
    sorted_moments = sorted(moments, key=lambda m: m['inicio_sec'])

    for i, moment in enumerate(sorted_moments):
        m_start = moment['inicio_sec']
        m_end = moment['fim_sec']

        # --- Gap BEFORE this moment ---
        if timeline_cursor < m_start:
            gap_duration = m_start - timeline_cursor
            gap_text = collect_text_for_range(blocks, timeline_cursor, m_start)

            # Determine if BRIDGE or REMOVE
            is_bridge = (
                gap_duration < BRIDGE_THRESHOLD_SEC
                and gap_text.strip()
            )

            if is_bridge:
                # Determine which moments this bridges
                prev_moment_id = sorted_moments[i - 1]['id'] if i > 0 else None
                next_moment_id = moment['id']
                segments.append({
                    'type': 'BRIDGE',
                    'start_sec': timeline_cursor,
                    'end_sec': m_start,
                    'start_ts': sec_to_ts(timeline_cursor),
                    'end_ts': sec_to_ts(m_start),
                    'duration': gap_duration,
                    'text': gap_text,
                    'connects_from': prev_moment_id,
                    'connects_to': next_moment_id,
                })
            else:
                # REMOVE — generate summary
                summary = summarize_text(gap_text) if gap_text else 'Sem conteudo transcrito'
                # Check for rescue content
                rescue_note = None
                if gap_text and gap_duration > 60:
                    # Look for potential quote-worthy sentences
                    sentences = re.split(r'[.!?]+', gap_text)
                    for sent in sentences:
                        sent = sent.strip()
                        if len(sent.split()) > 8 and len(sent.split()) < 30:
                            rescue_note = sent
                            break

                segments.append({
                    'type': 'REMOVE',
                    'start_sec': timeline_cursor,
                    'end_sec': m_start,
                    'start_ts': sec_to_ts(timeline_cursor),
                    'end_ts': sec_to_ts(m_start),
                    'duration': gap_duration,
                    'summary': summary,
                    'rescue_note': rescue_note,
                })

        # --- KEEP segment (the moment itself) ---
        cut_in_ts, cut_in_reason = find_natural_cut_point(blocks, m_start, 'before')
        cut_out_ts, cut_out_reason = find_natural_cut_point(blocks, m_end, 'after')

        segments.append({
            'type': 'KEEP',
            'start_sec': m_start,
            'end_sec': m_end,
            'start_ts': moment['inicio'],
            'end_ts': moment['fim'],
            'duration': m_end - m_start,
            'moment': moment,
            'cut_in_ts': cut_in_ts,
            'cut_in_reason': cut_in_reason,
            'cut_out_ts': cut_out_ts,
            'cut_out_reason': cut_out_reason,
        })

        timeline_cursor = m_end

    # --- Gap AFTER last moment to end of transcript ---
    if timeline_cursor < total_duration_sec:
        gap_text = collect_text_for_range(blocks, timeline_cursor, total_duration_sec)
        summary = summarize_text(gap_text) if gap_text else 'Final do conteudo'
        segments.append({
            'type': 'REMOVE',
            'start_sec': timeline_cursor,
            'end_sec': total_duration_sec,
            'start_ts': sec_to_ts(timeline_cursor),
            'end_ts': sec_to_ts(total_duration_sec),
            'duration': total_duration_sec - timeline_cursor,
            'summary': summary,
            'rescue_note': None,
        })

    return segments


# ---------------------------------------------------------------------------
# Generate output MD
# ---------------------------------------------------------------------------

def generate_annotated_md(segments, moments, source_name, total_duration_sec,
                          momentos_path, transcript_path):
    """Generate the annotated transcript MD file."""
    keep_count = sum(1 for s in segments if s['type'] == 'KEEP')
    bridge_count = sum(1 for s in segments if s['type'] == 'BRIDGE')
    remove_count = sum(1 for s in segments if s['type'] == 'REMOVE')
    cut_points = keep_count * 2  # IN + OUT per KEEP

    lines = []

    # YAML frontmatter
    lines.append('---')
    lines.append(f'source: "{source_name}"')
    lines.append(f'duration: "{sec_to_ts(total_duration_sec)}"')
    lines.append(f'duration_seconds: {total_duration_sec}')
    lines.append(f'generated: "{datetime.now().strftime("%Y-%m-%d")}"')
    lines.append('generator: "generate_annotated_transcript.py v1.0"')
    lines.append(f'banco_momentos: "{momentos_path}"')
    lines.append(f'transcript_source: "{transcript_path}"')
    lines.append('segments:')
    lines.append(f'  keep: {keep_count}')
    lines.append(f'  bridge: {bridge_count}')
    lines.append(f'  remove: {remove_count}')
    lines.append(f'cut_points_identified: {cut_points}')
    lines.append(f'context_window_seconds: {CONTEXT_WINDOW_SEC}')
    lines.append(f'bridge_threshold_seconds: {BRIDGE_THRESHOLD_SEC}')
    lines.append('---')
    lines.append('')

    # Header
    lines.append(f'# Transcricao Anotada — {source_name}')
    lines.append('')
    lines.append(f'**Source:** {source_name}')
    lines.append(f'**Duration:** {sec_to_ts(total_duration_sec)}')
    lines.append(f'**Segments:** {keep_count} KEEP | {bridge_count} BRIDGE | {remove_count} REMOVE')
    lines.append(f'**Generated:** {datetime.now().strftime("%Y-%m-%d")}')
    lines.append(f'**Banco de Momentos:** {momentos_path}')
    lines.append('')
    lines.append('---')
    lines.append('')
    lines.append('## Legenda')
    lines.append('- **KEEP** = Momento selecionado (presente no banco de momentos)')
    lines.append('- **REMOVE** = Conteudo descartado (setup tecnico, filler, repeticao)')
    lines.append('- **BRIDGE** = Material de transicao disponivel entre momentos adjacentes')
    lines.append('')
    lines.append('---')
    lines.append('')

    # Segments
    for seg in segments:
        if seg['type'] == 'KEEP':
            m = seg['moment']
            mqr_str = f'\n  MQR: {m["mqr"]}' if m.get('mqr') else ''
            lines.append(f'[{seg["start_ts"]} - {seg["end_ts"]}] KEEP — Momento #{m["id"]} (Score {m["impact"]}, {m["tipo"]}, {m["gatilho"]})')
            if m.get('mqr'):
                lines.append(f'  MQR: {m["mqr"]}')
            lines.append(f'  "{m["preview"]}..."')
            lines.append(f'  Corte natural IN: {seg["cut_in_ts"]} ({seg["cut_in_reason"]})')
            lines.append(f'  Corte natural OUT: {seg["cut_out_ts"]} ({seg["cut_out_reason"]})')
            lines.append(f'  Contexto: {m["assunto"]}')

        elif seg['type'] == 'REMOVE':
            lines.append(f'[{seg["start_ts"]} - {seg["end_ts"]}] REMOVE — {seg["summary"]}')
            lines.append(f'  Duracao: {format_duration(seg["duration"])}')
            if seg.get('rescue_note'):
                lines.append(f'  Nota: Contem frase potencialmente util: "{seg["rescue_note"]}"')

        elif seg['type'] == 'BRIDGE':
            lines.append(f'[{seg["start_ts"]} - {seg["end_ts"]}] BRIDGE — Material de transicao disponivel')
            lines.append(f'  "{seg["text"]}"')
            from_str = f'Momento #{seg["connects_from"]}' if seg['connects_from'] else 'Inicio'
            to_str = f'Momento #{seg["connects_to"]}' if seg['connects_to'] else 'Fim'
            lines.append(f'  Conecta: {from_str} → {to_str}')
            lines.append(f'  Uso sugerido: transicao natural se momentos adjacentes no corte')

        lines.append('')
        lines.append('---')
        lines.append('')

    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 5:
        print('Usage: python generate_annotated_transcript.py <transcript> <momentos> <output> <source_name>')
        print()
        print('Arguments:')
        print('  transcript    Path to raw transcript (WebVTT, SRT, or plain text)')
        print('  momentos      Path to {source-slug}_momentos.md')
        print('  output        Path for annotated transcript output')
        print('  source_name   Human-readable source name (quote if spaces)')
        print()
        print('Example:')
        print('  python squads/curator/scripts/generate_annotated_transcript.py \\')
        print('    _temp/mining/my-source/transcript_raw.txt \\')
        print('    output/curated/my-source_momentos.md \\')
        print('    output/curated/my-source_transcricao_anotada.md \\')
        print('    "My Source Name"')
        sys.exit(1)

    transcript_path = Path(sys.argv[1])
    momentos_path = Path(sys.argv[2])
    output_path = Path(sys.argv[3])
    source_name = sys.argv[4]

    # Validate inputs exist
    if not transcript_path.exists():
        print(f'ERROR: Transcript file not found: {transcript_path}')
        sys.exit(1)
    if not momentos_path.exists():
        print(f'ERROR: Momentos file not found: {momentos_path}')
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Parse transcript
    print(f'Reading transcript: {transcript_path}')
    blocks, raw_content = detect_and_parse_transcript(transcript_path)
    print(f'  Parsed: {len(blocks)} timestamped blocks')

    if not blocks:
        print('ERROR: No timestamped blocks found in transcript.')
        print('  Supported formats: WebVTT, SRT, plain text with [HH:MM:SS] markers')
        sys.exit(1)

    # Determine total duration
    total_duration_sec = max(b['end_sec'] for b in blocks)
    print(f'  Duration: {sec_to_ts(total_duration_sec)} ({total_duration_sec}s)')

    # Parse moments
    print(f'Reading moments: {momentos_path}')
    moments = parse_moments(momentos_path)
    print(f'  Parsed: {len(moments)} moments')

    if not moments:
        print('ERROR: No moments found in momentos file.')
        sys.exit(1)

    # Build segments
    print('Building annotated segments...')
    segments = build_segments(blocks, moments, total_duration_sec)
    keep_count = sum(1 for s in segments if s['type'] == 'KEEP')
    bridge_count = sum(1 for s in segments if s['type'] == 'BRIDGE')
    remove_count = sum(1 for s in segments if s['type'] == 'REMOVE')
    print(f'  Segments: {keep_count} KEEP | {bridge_count} BRIDGE | {remove_count} REMOVE')

    # Generate output
    print('Generating annotated transcript...')
    md = generate_annotated_md(
        segments, moments, source_name, total_duration_sec,
        str(momentos_path), str(transcript_path)
    )

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)

    # Stats
    output_size_kb = len(md.encode('utf-8')) / 1024
    input_size_kb = transcript_path.stat().st_size / 1024
    overhead_pct = round((output_size_kb - input_size_kb) / input_size_kb * 100, 1) if input_size_kb > 0 else 0

    print(f'Output: {output_path} ({round(output_size_kb, 1)} KB)')
    print(f'Transcript: {transcript_path} ({round(input_size_kb, 1)} KB)')
    print(f'Overhead: {overhead_pct}% (target: <20%)')
    print(f'Segments: {keep_count} KEEP | {bridge_count} BRIDGE | {remove_count} REMOVE')
    print(f'Cut points identified: {keep_count * 2}')


if __name__ == '__main__':
    main()
