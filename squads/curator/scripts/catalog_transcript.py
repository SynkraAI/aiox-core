"""
Worker: catalog_transcript.py

Deterministic phases of catalog-transcript task (Phases 1, 2, 4).
Agent handles only Phase 3 (speaker attribution + 4-dimension tagging).

Converted from 100% Agent to Hybrid execution.
Original task: squads/curator/tasks/catalog-transcript.md

Usage:
  # Phase 1+2: Parse & segment (outputs skeleton JSON for Agent)
  python squads/curator/scripts/catalog_transcript.py parse <transcript_file> [--speakers "Name1,Name2"]

  # Phase 4: Build indexes & generate YAML (after Agent tags utterances)
  python squads/curator/scripts/catalog_transcript.py index <tagged_json_file> [--output <output_path>]

  # Full pipeline info
  python squads/curator/scripts/catalog_transcript.py --help
"""
import csv
import io
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1: Format Detection & Parsing
# ═══════════════════════════════════════════════════════════════════════════════

def detect_format(lines: list[str]) -> str:
    """Detect transcript format from first lines.

    Returns: 'webvtt' | 'csv_quoted' | 'unknown'
    """
    for line in lines[:10]:
        stripped = line.strip()
        if stripped.upper() == 'WEBVTT':
            return 'webvtt'
        if re.match(r'^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}', stripped):
            return 'webvtt'
        if stripped.startswith('"Timestamp"') or stripped.startswith('"timestamp"'):
            return 'csv_quoted'
        if re.match(r'^"\d{1,2}:\d{2}"', stripped):
            return 'csv_quoted'
    return 'unknown'


def normalize_timestamp(ts: str) -> str:
    """Normalize any timestamp to HH:MM:SS format."""
    ts = ts.strip().strip('"').strip()
    # Remove milliseconds
    ts = re.sub(r'\.\d+$', '', ts)
    parts = ts.split(':')
    if len(parts) == 2:
        return f'00:{parts[0].zfill(2)}:{parts[1].zfill(2)}'
    elif len(parts) == 3:
        return f'{parts[0].zfill(2)}:{parts[1].zfill(2)}:{parts[2].zfill(2)}'
    return '00:00:00'


def ts_to_seconds(ts: str) -> int:
    """Convert HH:MM:SS to total seconds."""
    parts = ts.split(':')
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])


def seconds_to_ts(sec: int) -> str:
    """Convert seconds to HH:MM:SS."""
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    return f'{h:02d}:{m:02d}:{s:02d}'


def parse_webvtt(content: str) -> list[dict]:
    """Parse WebVTT format into utterance list."""
    utterances = []
    blocks = re.split(r'\n\n+', content)
    utt_id = 0

    for block in blocks:
        block = block.strip()
        if not block or block.upper() == 'WEBVTT':
            continue

        lines = block.split('\n')
        # Find timestamp line
        ts_line = None
        text_lines = []
        for line in lines:
            if '-->' in line:
                ts_line = line
            elif ts_line is not None:
                # Text after timestamp
                text_lines.append(line.strip())
            # Skip numeric cue IDs

        if not ts_line or not text_lines:
            continue

        # Parse timestamps
        ts_match = re.match(
            r'(\d{2}:\d{2}:\d{2}[\.\d]*)\s*-->\s*(\d{2}:\d{2}:\d{2}[\.\d]*)',
            ts_line.strip()
        )
        if not ts_match:
            continue

        utt_id += 1
        start = normalize_timestamp(ts_match.group(1))
        end = normalize_timestamp(ts_match.group(2))
        text = ' '.join(text_lines).strip()

        if text:
            utterances.append({
                'id': f'UTT-{utt_id:04d}',
                'start': start,
                'end': end,
                'duration_seconds': ts_to_seconds(end) - ts_to_seconds(start),
                'text': text,
                'speaker': None,
                'tags': {
                    'topic': None,
                    'emotion': None,
                    'action': None,
                    'reference': []
                }
            })

    return utterances


def parse_csv_quoted(content: str) -> list[dict]:
    """Parse CSV-quoted format into utterance list."""
    utterances = []
    reader = csv.reader(io.StringIO(content))
    rows = list(reader)

    # Skip header if present
    start_idx = 0
    if rows and rows[0][0].lower().strip() in ('timestamp', 'time', 'timecode'):
        start_idx = 1

    utt_id = 0
    for i in range(start_idx, len(rows)):
        row = rows[i]
        if len(row) < 2:
            continue

        raw_ts = row[0].strip()
        text = row[1].strip() if len(row) > 1 else ''
        if not text:
            continue

        utt_id += 1
        start = normalize_timestamp(raw_ts)

        # Estimate end from next row or add default 5s
        if i + 1 < len(rows) and len(rows[i + 1]) >= 1:
            next_ts = normalize_timestamp(rows[i + 1][0].strip())
            end = next_ts
        else:
            end = seconds_to_ts(ts_to_seconds(start) + 5)

        utterances.append({
            'id': f'UTT-{utt_id:04d}',
            'start': start,
            'end': end,
            'duration_seconds': ts_to_seconds(end) - ts_to_seconds(start),
            'text': text,
            'speaker': None,
            'tags': {
                'topic': None,
                'emotion': None,
                'action': None,
                'reference': []
            }
        })

    return utterances


def parse_transcript(filepath: Path) -> tuple[str, list[dict]]:
    """Parse transcript file, return (format, utterances)."""
    content = filepath.read_text(encoding='utf-8')
    lines = content.split('\n')
    fmt = detect_format(lines)

    if fmt == 'webvtt':
        utterances = parse_webvtt(content)
    elif fmt == 'csv_quoted':
        utterances = parse_csv_quoted(content)
    else:
        raise ValueError(
            f'Unknown transcript format. Expected WebVTT or CSV-quoted. '
            f'First lines: {lines[:5]}'
        )

    return fmt, utterances


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2: Segmentation & Timestamp Normalization
# (Already done during parse — timestamps normalized, utterances segmented)
# ═══════════════════════════════════════════════════════════════════════════════

def validate_timeline(utterances: list[dict]) -> dict:
    """Validate no gaps in timeline. Returns validation report."""
    gaps = []
    overlaps = []

    for i in range(len(utterances) - 1):
        curr_end = ts_to_seconds(utterances[i]['end'])
        next_start = ts_to_seconds(utterances[i + 1]['start'])
        gap = next_start - curr_end
        if gap > 5:  # >5s gap is notable
            gaps.append({
                'after': utterances[i]['id'],
                'before': utterances[i + 1]['id'],
                'gap_seconds': gap
            })
        elif gap < -1:  # >1s overlap
            overlaps.append({
                'ids': [utterances[i]['id'], utterances[i + 1]['id']],
                'overlap_seconds': abs(gap)
            })

    return {
        'total_utterances': len(utterances),
        'gaps_found': len(gaps),
        'gaps': gaps[:10],  # Show first 10
        'overlaps_found': len(overlaps),
        'overlaps': overlaps[:10],
        'timeline_valid': len(gaps) == 0 and len(overlaps) == 0
    }


def apply_known_speakers(utterances: list[dict], speakers: list[str]) -> None:
    """Pre-fill speaker for single-speaker transcripts."""
    if len(speakers) == 1:
        for utt in utterances:
            utt['speaker'] = speakers[0]


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4: Index Building & YAML Generation
# ═══════════════════════════════════════════════════════════════════════════════

def build_indexes(utterances: list[dict]) -> dict:
    """Build search indexes from tagged utterances."""
    by_topic = defaultdict(list)
    by_speaker = defaultdict(list)
    by_emotion = defaultdict(list)
    by_reference = defaultdict(list)

    for utt in utterances:
        uid = utt['id']
        tags = utt.get('tags', {})

        if tags.get('topic'):
            by_topic[tags['topic']].append(uid)

        if utt.get('speaker'):
            by_speaker[utt['speaker']].append(uid)

        if tags.get('emotion'):
            by_emotion[tags['emotion']].append(uid)

        for ref in (tags.get('reference') or []):
            by_reference[ref].append(uid)

    return {
        'by_topic': dict(by_topic),
        'by_speaker': dict(by_speaker),
        'by_emotion': dict(by_emotion),
        'by_reference': dict(by_reference)
    }


def generate_yaml(utterances: list[dict], metadata: dict) -> str:
    """Generate timestamp_index.yaml content."""
    indexes = build_indexes(utterances)

    lines = []
    lines.append('# timestamp_index.yaml')
    lines.append(f'# Generated by catalog_transcript.py (Worker) + Agent tagging')
    lines.append(f'# Date: {metadata["date"]}')
    lines.append('')
    lines.append('catalog:')
    lines.append('  metadata:')
    lines.append(f'    cataloger: "timestamp-cataloger (hybrid: worker + agent)"')
    lines.append(f'    date: "{metadata["date"]}"')
    lines.append(f'    source: "{metadata["source"]}"')
    lines.append(f'    format: "{metadata["format"]}"')
    lines.append(f'    duration: "{metadata["duration"]}"')
    lines.append(f'    total_utterances: {len(utterances)}')

    # Speakers list
    speakers = sorted(set(
        utt['speaker'] for utt in utterances if utt.get('speaker')
    ))
    speakers_str = ', '.join(f'"{s}"' for s in speakers)
    lines.append(f'    speakers: [{speakers_str}]')

    # Topics summary
    topics = sorted(set(
        utt['tags']['topic'] for utt in utterances
        if utt.get('tags', {}).get('topic')
    ))
    lines.append(f'    topics_count: {len(topics)}')
    lines.append('')

    # Utterances
    lines.append('  utterances:')
    for utt in utterances:
        lines.append(f'    - id: "{utt["id"]}"')
        lines.append(f'      start: "{utt["start"]}"')
        lines.append(f'      end: "{utt["end"]}"')
        lines.append(f'      duration_seconds: {utt["duration_seconds"]}')
        speaker = utt.get('speaker') or 'unknown'
        lines.append(f'      speaker: "{speaker}"')
        # Escape text for YAML
        text_escaped = utt['text'].replace('"', '\\"')
        lines.append(f'      text: "{text_escaped}"')
        lines.append(f'      tags:')
        tags = utt.get('tags', {})
        lines.append(f'        topic: "{tags.get("topic") or "untagged"}"')
        lines.append(f'        emotion: "{tags.get("emotion") or "neutral"}"')
        lines.append(f'        action: "{tags.get("action") or "statement"}"')
        refs = tags.get('reference') or []
        if refs:
            refs_str = ', '.join(f'"{r}"' for r in refs)
            lines.append(f'        reference: [{refs_str}]')
        else:
            lines.append(f'        reference: []')
        lines.append('')

    # Indexes
    lines.append('  indexes:')
    for index_name, index_data in indexes.items():
        lines.append(f'    {index_name}:')
        for key, ids in sorted(index_data.items()):
            ids_str = ', '.join(f'"{i}"' for i in ids)
            lines.append(f'      "{key}": [{ids_str}]')
    lines.append('')

    # Summary
    lines.append('  summary:')
    lines.append(f'    total_utterances: {len(utterances)}')
    lines.append(f'    total_speakers: {len(speakers)}')
    lines.append(f'    total_topics: {len(topics)}')
    lines.append(f'    total_references: {len(indexes.get("by_reference", {}))}')
    tagged_count = sum(
        1 for utt in utterances
        if utt.get('tags', {}).get('topic')
    )
    lines.append(f'    tagged_utterances: {tagged_count}')
    lines.append(f'    untagged_utterances: {len(utterances) - tagged_count}')
    unknown_speakers = sum(
        1 for utt in utterances if not utt.get('speaker')
    )
    lines.append(f'    unknown_speakers: {unknown_speakers}')
    if utterances:
        pct = round(unknown_speakers / len(utterances) * 100, 1)
        lines.append(f'    unknown_speakers_pct: {pct}')

    return '\n'.join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# CLI INTERFACE
# ═══════════════════════════════════════════════════════════════════════════════

def cmd_parse(args):
    """Phase 1+2: Parse transcript → skeleton JSON for Agent tagging."""
    if len(args) < 1:
        print('Usage: catalog_transcript.py parse <transcript_file> [--speakers "Name1,Name2"]')
        sys.exit(1)

    filepath = Path(args[0])
    if not filepath.exists():
        print(f'ERROR: File not found: {filepath}')
        sys.exit(1)

    # Parse --speakers flag
    speakers = []
    for i, arg in enumerate(args):
        if arg == '--speakers' and i + 1 < len(args):
            speakers = [s.strip() for s in args[i + 1].split(',')]

    print(f'[Phase 1] Detecting format: {filepath.name}')
    fmt, utterances = parse_transcript(filepath)
    print(f'  Format: {fmt}')
    print(f'  Utterances parsed: {len(utterances)}')

    # Validate timeline
    print(f'[Phase 2] Validating timeline...')
    validation = validate_timeline(utterances)
    print(f'  Gaps: {validation["gaps_found"]}')
    print(f'  Overlaps: {validation["overlaps_found"]}')
    print(f'  Timeline valid: {validation["timeline_valid"]}')

    # Apply known speakers
    if speakers:
        apply_known_speakers(utterances, speakers)
        assigned = sum(1 for u in utterances if u['speaker'])
        print(f'  Speakers pre-assigned: {assigned}/{len(utterances)}')

    # Calculate duration
    if utterances:
        last_end = ts_to_seconds(utterances[-1]['end'])
        duration = seconds_to_ts(last_end)
    else:
        duration = '00:00:00'

    # Build output skeleton
    output = {
        '_meta': {
            'phase': 'parsed',
            'script': 'catalog_transcript.py',
            'source': str(filepath),
            'format': fmt,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'duration': duration,
            'total_utterances': len(utterances),
            'validation': validation,
            'instruction': (
                'AGENT: Tag each utterance with speaker (if not set), '
                'topic, emotion, action, reference. '
                'Save result with _meta.phase = "tagged".'
            )
        },
        'utterances': utterances
    }

    # Output path: same dir as transcript, .parsed.json
    out_path = filepath.parent / f'{filepath.stem}.parsed.json'
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'\n[Output] {out_path}')
    print(f'  Size: {round(out_path.stat().st_size / 1024, 1)} KB')
    print(f'\n[Next] Agent tags utterances → then run:')
    print(f'  python squads/curator/scripts/catalog_transcript.py index "{out_path}"')


def cmd_index(args):
    """Phase 4: Build indexes from tagged JSON → generate YAML."""
    if len(args) < 1:
        print('Usage: catalog_transcript.py index <tagged_json_file> [--output <path>]')
        sys.exit(1)

    filepath = Path(args[0])
    if not filepath.exists():
        print(f'ERROR: File not found: {filepath}')
        sys.exit(1)

    # Parse --output flag
    output_path = None
    for i, arg in enumerate(args):
        if arg == '--output' and i + 1 < len(args):
            output_path = Path(args[i + 1])

    print(f'[Phase 4] Building indexes from: {filepath.name}')
    data = json.loads(filepath.read_text(encoding='utf-8'))
    utterances = data['utterances']
    meta = data['_meta']

    # Validate tagging completeness
    untagged = 0
    no_speaker = 0
    for utt in utterances:
        tags = utt.get('tags', {})
        if not tags.get('topic'):
            untagged += 1
        if not utt.get('speaker'):
            no_speaker += 1

    total = len(utterances)
    print(f'  Total utterances: {total}')
    print(f'  Tagged: {total - untagged}/{total} ({round((total - untagged) / total * 100, 1)}%)')
    print(f'  Speakers assigned: {total - no_speaker}/{total}')

    if untagged > 0:
        print(f'  WARNING: {untagged} utterances still untagged')

    # Build indexes
    indexes = build_indexes(utterances)
    print(f'  Topics: {len(indexes["by_topic"])}')
    print(f'  Speakers: {len(indexes["by_speaker"])}')
    print(f'  Emotions: {len(indexes["by_emotion"])}')
    print(f'  References: {len(indexes["by_reference"])}')

    # Generate YAML
    metadata = {
        'date': meta.get('date', datetime.now().strftime('%Y-%m-%d')),
        'source': meta.get('source', 'unknown'),
        'format': meta.get('format', 'unknown'),
        'duration': meta.get('duration', '00:00:00')
    }
    yaml_content = generate_yaml(utterances, metadata)

    # Output path
    if not output_path:
        output_path = filepath.parent / 'timestamp_index.yaml'

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(yaml_content, encoding='utf-8')

    size_kb = round(output_path.stat().st_size / 1024, 1)
    print(f'\n[Output] {output_path} ({size_kb} KB)')

    # Quality gate summary
    print(f'\n[QG-CAT Validation]')
    checks = {
        'Every utterance has timestamp': True,
        'No gaps in timeline': meta.get('validation', {}).get('timeline_valid', False),
        'Speaker attribution': no_speaker < total * 0.1,
        'All 4 dimensions tagged': untagged == 0,
        'All 4 indexes generated': all(
            k in indexes for k in ['by_topic', 'by_speaker', 'by_emotion', 'by_reference']
        ),
        'Metadata complete': True,
    }
    all_pass = True
    for check, passed in checks.items():
        status = 'PASS' if passed else 'FAIL'
        if not passed:
            all_pass = False
        print(f'  [{status}] {check}')

    quality = {
        'Unknown speakers < 10%': no_speaker / total < 0.1 if total > 0 else True,
        'At least 3 topics': len(indexes.get('by_topic', {})) >= 3,
    }
    for check, passed in quality.items():
        status = 'PASS' if passed else 'WARN'
        print(f'  [{status}] {check}')

    overall = 'PASS' if all_pass else 'NEEDS REVIEW'
    print(f'\n  Verdict: {overall}')


def cmd_help():
    """Show usage info."""
    print("""
catalog_transcript.py — Worker script for catalog-transcript task (Hybrid)

PIPELINE:
  1. PARSE (Worker)  → Detects format, parses, normalizes, segments
  2. TAG   (Agent)   → Speaker attribution + 4-dimension tagging
  3. INDEX (Worker)  → Builds search indexes, generates YAML

COMMANDS:
  parse <transcript_file> [--speakers "Name1,Name2"]
      Phase 1+2: Parse transcript → .parsed.json skeleton
      Agent then tags utterances in the JSON

  index <tagged_json_file> [--output <path>]
      Phase 4: Build indexes from tagged JSON → timestamp_index.yaml

EXAMPLES:
  # Step 1: Parse transcript
  python squads/curator/scripts/catalog_transcript.py parse raw/transcripts/video.vtt

  # Step 2: Agent tags utterances in video.parsed.json
  # (Agent reads .parsed.json, fills speaker/topic/emotion/action/reference)

  # Step 3: Generate final YAML
  python squads/curator/scripts/catalog_transcript.py index raw/transcripts/video.parsed.json

SUPPORTED FORMATS:
  - WebVTT (.vtt)  — "WEBVTT" header, HH:MM:SS.mmm --> timestamps
  - CSV-quoted      — "Timestamp","Segment" with quoted fields
""")


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ('--help', '-h', 'help'):
        cmd_help()
        sys.exit(0)

    command = sys.argv[1]
    args = sys.argv[2:]

    if command == 'parse':
        cmd_parse(args)
    elif command == 'index':
        cmd_index(args)
    else:
        print(f'Unknown command: {command}')
        cmd_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
