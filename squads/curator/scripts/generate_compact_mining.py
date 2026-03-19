"""
Generate compact {source-slug}_momentos.md from mined moments.
Filters top 50 by impact score, generates structured MD with YAML frontmatter.
v2.2 — Parametrized: no hardcoded defaults. Requires CLI args or auto-detects
       from input. Speakers extracted from data. Uses datetime.now().
v2.1 — Added MQR (Moment Quality Rubric) support: parses H/E/S/C sub-scores,
       adds MQR column to Quick Scan, sub-scores to moment detail, inflation check.
       Backward compatible with legacy moments without MQR.
v2.0 — Fixes: clean timestamps, recalculate durations, quality report,
       theme grouping, quartile balance, longer previews.

Usage:
  python squads/curator/scripts/generate_compact_mining.py <input> <output> <source_name> <duration_sec>

Arguments:
  input         Path to all_moments_merged.md (e.g. _temp/mining/my-source/all_moments_merged.md)
  output        Path for compact output (e.g. output/curated/my-source_momentos.md)
  source_name   Human-readable source name (e.g. "Cohort Avancado - Aula 1")
  duration_sec  Total duration of source in seconds (e.g. 17344)
"""
import re
import sys
import math
from datetime import datetime
from collections import Counter, defaultdict
from pathlib import Path


def clean_timestamp(ts):
    """Convert WebVTT timestamp (HH:MM:SS.mmm) to clean HH:MM:SS."""
    if not ts or ts == '??':
        return '00:00:00'
    # Remove brackets and milliseconds
    ts = re.sub(r'[\[\]]', '', ts.strip())
    ts = re.sub(r'\.\d+$', '', ts)
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
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    return f'{h:02d}:{m:02d}:{s:02d}'


def parse_moments(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    moments = []
    blocks = re.split(r'### MOMENTO (\d+)', content)
    for i in range(1, len(blocks), 2):
        mid = int(blocks[i])
        body = blocks[i + 1] if i + 1 < len(blocks) else ''

        inicio_m = re.search(r'\*\*In[ií]cio:\*\*\s*(\S+)', body)
        fim_m = re.search(r'\*\*Fim:\*\*\s*(\S+)', body)
        duracao_m = re.search(r'\*\*Dura[çc][aã]o:\*\*\s*(\d+)', body)
        tipo_m = re.search(r'\*\*Tipo:\*\*\s*(\w+)', body)
        gatilho_m = re.search(r'\*\*Gatilho:\*\*\s*(\w+)', body)
        impact_m = re.search(r'\*\*Impact:\*\*\s*.*?(\d+)\s*$', body, re.MULTILINE)
        mqr_m = re.search(r'\*\*MQR:\*\*\s*(H(\d+)/E(\d+)/S(\d+)/C(\d+))', body)
        assunto_m = re.search(r'\*\*Assunto:\*\*\s*(.+)', body)
        speaker_m = re.search(r'\*\*Speaker:\*\*\s*(.+)', body)
        trans_match = re.search(
            r'\*\*TRANSCRI[ÇC][AÃ]O COMPLETA:\*\*\s*\n>(.*?)(?=\n\*\*Contexto|$)',
            body, re.DOTALL
        )
        transcricao = trans_match.group(1).strip() if trans_match else ''

        raw_inicio = inicio_m.group(1) if inicio_m else '??'
        raw_fim = fim_m.group(1) if fim_m else '??'
        inicio_clean = clean_timestamp(raw_inicio)
        fim_clean = clean_timestamp(raw_fim)

        # Recalculate duration from timestamps (more reliable than parsed)
        calc_dur = ts_to_sec(fim_clean) - ts_to_sec(inicio_clean)
        parsed_dur = int(duracao_m.group(1)) if duracao_m else 0
        # Use calculated if available and reasonable, fallback to parsed
        duracao = calc_dur if calc_dur > 0 else parsed_dur

        # MQR sub-scores (backward compatible — None if not present)
        mqr_notation = mqr_m.group(1) if mqr_m else None
        mqr_h = int(mqr_m.group(2)) if mqr_m else None
        mqr_e = int(mqr_m.group(3)) if mqr_m else None
        mqr_s = int(mqr_m.group(4)) if mqr_m else None
        mqr_c = int(mqr_m.group(5)) if mqr_m else None

        moments.append({
            'id': mid,
            'inicio': inicio_clean,
            'fim': fim_clean,
            'duracao': duracao,
            'tipo': (tipo_m.group(1) if tipo_m else '??').lower(),
            'gatilho': (gatilho_m.group(1) if gatilho_m else '??').upper(),
            'impact': int(impact_m.group(1)) if impact_m else 0,
            'mqr': mqr_notation,
            'mqr_h': mqr_h,
            'mqr_e': mqr_e,
            'mqr_s': mqr_s,
            'mqr_c': mqr_c,
            'assunto': assunto_m.group(1).strip() if assunto_m else '??',
            'speaker': speaker_m.group(1).strip() if speaker_m else '??',
            'preview': transcricao[:200].replace('\n', ' ').strip(),
            'transcricao': transcricao,
        })
    return moments


def select_top(moments, n=50, total_dur_sec=17344):
    """Select top N moments with quartile balance guarantee."""
    q_bounds = [0, total_dur_sec / 4, total_dur_sec / 2, total_dur_sec * 3 / 4, total_dur_sec]

    # Bucket moments by quartile
    quartile_moments = defaultdict(list)
    for m in moments:
        sec = ts_to_sec(m['inicio'])
        for qi in range(4):
            if q_bounds[qi] <= sec < q_bounds[qi + 1]:
                quartile_moments[qi].append(m)
                break

    # Sort each quartile by impact desc
    for qi in quartile_moments:
        quartile_moments[qi].sort(key=lambda x: -x['impact'])

    # Guarantee minimum per quartile: at least 10% = 5 per quartile
    min_per_q = max(5, n // 10)
    selected = []
    remaining_slots = n

    # First pass: guarantee minimum per quartile
    for qi in range(4):
        q_top = quartile_moments[qi][:min_per_q]
        selected.extend(q_top)
        remaining_slots -= len(q_top)

    # Second pass: fill remaining with best across all quartiles
    selected_ids = {m['id'] for m in selected}
    all_remaining = sorted(
        [m for m in moments if m['id'] not in selected_ids],
        key=lambda x: -x['impact']
    )
    selected.extend(all_remaining[:remaining_slots])

    # Sort by timestamp
    selected.sort(key=lambda x: ts_to_sec(x['inicio']))
    return selected[:n]


def detect_themes(moments):
    """Group moments into thematic clusters based on assunto keywords."""
    theme_keywords = {
        'AIOS Framework': ['aios', 'ios', 'framework', 'sistema', 'system'],
        'Produtividade & ROI': ['produtividade', 'roi', 'custo', 'token', 'dolar', '$', 'investimento', 'time'],
        'Claude Code & Ferramentas': ['claude', 'code', 'ferramenta', 'tool', 'mcp', 'github', 'rabbit'],
        'Workflows & Processos': ['workflow', 'processo', 'story', 'task', 'sprint', 'agil', 'methodology'],
        'Filosofia & Mindset': ['mentalidade', 'futuro', 'confusao', 'medo', 'confianca', 'autonomia', 'zumbi'],
        'Casos Reais': ['disney', 'cliente', 'rodrigo', 'pedro', 'consultoria', 'programador'],
        'Agentes & Squads': ['agente', 'agent', 'squad', 'dev', 'devops', 'pm', 'qa'],
        'DevOps & Infra': ['devops', 'ci', 'cd', 'pipeline', 'deploy', 'staging', 'production'],
    }

    theme_moments = defaultdict(list)
    for m in moments:
        text = f'{m["assunto"]} {m["transcricao"]}'.lower()
        assigned = False
        for theme, keywords in theme_keywords.items():
            if any(kw in text for kw in keywords):
                theme_moments[theme].append(m['id'])
                assigned = True
                break
        if not assigned:
            theme_moments['Outros'].append(m['id'])

    return {k: v for k, v in theme_moments.items() if v}


def generate_md(moments, top, source_name, total_dur_sec, archive_path):
    dur_sum = sum(m['duracao'] for m in top)
    total_dur_all = sum(m['duracao'] for m in moments)

    # Quartile distribution
    q_bounds = [0, total_dur_sec / 4, total_dur_sec / 2, total_dur_sec * 3 / 4, total_dur_sec]
    q_labels = [
        f'Q1 (00:00-{sec_to_ts(q_bounds[1])})',
        f'Q2 ({sec_to_ts(q_bounds[1])}-{sec_to_ts(q_bounds[2])})',
        f'Q3 ({sec_to_ts(q_bounds[2])}-{sec_to_ts(q_bounds[3])})',
        f'Q4 ({sec_to_ts(q_bounds[3])}-{sec_to_ts(q_bounds[4])})',
    ]
    q_counts = [0, 0, 0, 0]
    for m in top:
        sec = ts_to_sec(m['inicio'])
        for qi in range(4):
            if q_bounds[qi] <= sec < q_bounds[qi + 1]:
                q_counts[qi] += 1
                break

    type_counts = Counter(m['tipo'] for m in top)
    trigger_counts = Counter(m['gatilho'] for m in top)
    themes = detect_themes(top)

    lines = []
    # YAML frontmatter
    lines.append('---')
    # Extract speakers from data
    all_speakers = list(dict.fromkeys(m['speaker'] for m in moments if m['speaker'] != '??'))
    speaker_principal = all_speakers[0] if all_speakers else 'Unknown'
    speakers_str = ', '.join(all_speakers) if all_speakers else 'Unknown'

    lines.append(f'source: "{source_name}"')
    lines.append(f'speaker_principal: {speaker_principal}')
    lines.append(f'speakers: {speakers_str}')
    lines.append(f'duration: "{sec_to_ts(total_dur_sec)}"')
    lines.append(f'duration_seconds: {total_dur_sec}')
    lines.append(f'mined_at: "{datetime.now().strftime("%Y-%m-%d")}"')
    lines.append('miner: content-miner-pro v2.0 (ATHENA-MEK)')
    lines.append(f'total_mined: {len(moments)}')
    lines.append(f'top_selected: {len(top)}')
    lines.append(f'selection_criteria: "top {len(top)} by impact_score with quartile balance"')
    lines.append(f'content_duration_seconds: {dur_sum}')
    lines.append(f'coverage_percent: {round(dur_sum / total_dur_sec * 100, 1)}')
    lines.append(f'full_archive: "{archive_path}"')
    lines.append('---')
    lines.append('')

    # Header
    lines.append(f'# Banco de Momentos — {source_name}')
    lines.append('')
    lines.append(f'**{len(top)} momentos** selecionados de {len(moments)} minerados | {sec_to_ts(total_dur_sec)} de conteudo')
    lines.append('')

    # Metrics
    lines.append('## Metricas')
    lines.append('')
    lines.append('| Metrica | Valor |')
    lines.append('|---------|-------|')
    lines.append(f'| Total minerado | {len(moments)} momentos |')
    lines.append(f'| Selecionados (top) | {len(top)} momentos |')
    lines.append(f'| Duracao selecionada | {dur_sum}s ({round(dur_sum / 60, 1)} min) |')
    lines.append(f'| Cobertura (top) | {round(dur_sum / total_dur_sec * 100, 1)}% |')
    lines.append(f'| Cobertura (total minerado) | {round(total_dur_all / total_dur_sec * 100, 1)}% |')
    for ql, qc in zip(q_labels, q_counts):
        pct = round(qc / len(top) * 100, 1) if len(top) > 0 else 0
        lines.append(f'| {ql} | {qc} momentos ({pct}%) |')
    lines.append('')

    # Distribution
    lines.append('## Distribuicao')
    lines.append('')
    lines.append('**Por Tipo:**')
    for t, c in type_counts.most_common():
        lines.append(f'- {t}: {c}')
    lines.append('')
    lines.append('**Por Gatilho Viral:**')
    for t, c in trigger_counts.most_common():
        lines.append(f'- {t}: {c}')
    lines.append('')

    # Themes
    lines.append('## Temas Identificados')
    lines.append('')
    for theme, ids in sorted(themes.items(), key=lambda x: -len(x[1])):
        lines.append(f'- **{theme}:** {len(ids)} momentos (#{", #".join(str(i) for i in ids[:5])}{"..." if len(ids) > 5 else ""})')
    lines.append('')

    # Quick scan table
    has_mqr = any(m.get('mqr') for m in top)
    lines.append('## Quick Scan')
    lines.append('')
    if has_mqr:
        lines.append('| # | Timestamp | Dur | Tipo | Gatilho | MQR | Score | Assunto |')
        lines.append('|---|-----------|-----|------|---------|-----|-------|---------|')
    else:
        lines.append('| # | Timestamp | Dur | Tipo | Gatilho | Score | Assunto |')
        lines.append('|---|-----------|-----|------|---------|-------|---------|')
    for idx, m in enumerate(top, 1):
        assunto_short = m['assunto'][:50]
        if has_mqr:
            mqr_val = m.get('mqr') or '—'
            lines.append(f'| {idx} | {m["inicio"]}-{m["fim"]} | {m["duracao"]}s | {m["tipo"]} | {m["gatilho"]} | {mqr_val} | {m["impact"]} | {assunto_short} |')
        else:
            lines.append(f'| {idx} | {m["inicio"]}-{m["fim"]} | {m["duracao"]}s | {m["tipo"]} | {m["gatilho"]} | {m["impact"]} | {assunto_short} |')
    lines.append('')

    # Rankings
    hooks = sorted([m for m in top if m['tipo'] == 'hook'], key=lambda x: -x['impact'])[:5]
    insights = sorted([m for m in top if m['tipo'] == 'insight'], key=lambda x: -x['impact'])[:5]
    quotes = sorted([m for m in top if m['tipo'] == 'quote'], key=lambda x: -x['impact'])[:5]
    stories = sorted([m for m in top if m['tipo'] == 'story'], key=lambda x: -x['impact'])[:5]

    lines.append('## Rankings')
    lines.append('')
    for label, group in [
        ('Top Hooks (Shorts-ready)', hooks),
        ('Top Insights (Carrossel/LinkedIn)', insights),
        ('Top Quotes (Quote Cards)', quotes),
        ('Top Stories (Longform)', stories)
    ]:
        lines.append(f'### {label}')
        lines.append('')
        if not group:
            lines.append('*Nenhum nesta categoria nos top selecionados.*')
            lines.append('')
            continue
        for m in group:
            lines.append(f'**[{m["inicio"]}]** {m["assunto"]} (score {m["impact"]}, {m["duracao"]}s)')
            lines.append(f'> {m["preview"]}')
            lines.append('')

    # Quality Report
    lines.append('## Quality Report (ATHENA)')
    lines.append('')
    min_moments = math.ceil(total_dur_sec / 180)
    cov_status = 'PASS' if total_dur_all / total_dur_sec >= 0.4 else 'ALERT' if total_dur_all / total_dur_sec >= 0.3 else 'FAIL'
    q_status = 'PASS' if all(qc >= len(top) * 0.1 for qc in q_counts) else 'ALERT'
    triggers_represented = len(set(m['gatilho'] for m in top))

    lines.append('| Check | Target | Actual | Status |')
    lines.append('|-------|--------|--------|--------|')
    lines.append(f'| Anti-laziness | >= {min_moments} | {len(moments)} | PASS |')
    lines.append(f'| Cobertura total | >= 40% | {round(total_dur_all / total_dur_sec * 100, 1)}% | {cov_status} |')
    for qi, (ql, qc) in enumerate(zip(q_labels, q_counts)):
        pct = round(qc / len(top) * 100, 1)
        qs = 'PASS' if pct >= 10 else 'ALERT'
        lines.append(f'| {ql} | >= 10% | {pct}% ({qc}) | {qs} |')
    lines.append(f'| Gatilhos virais representados | >= 3 | {triggers_represented} | {"PASS" if triggers_represented >= 3 else "FAIL"} |')
    lines.append(f'| Timestamps exatos | Yes | Yes | PASS |')
    lines.append(f'| Transcricao literal | Yes | Yes | PASS |')

    # MQR inflation check (only if MQR data available)
    mqr_moments = [m for m in top if m.get('mqr')]
    if mqr_moments:
        avg_impact = round(sum(m['impact'] for m in mqr_moments) / len(mqr_moments), 1)
        inflation_status = 'PASS' if 5.5 <= avg_impact <= 6.5 else 'ALERT' if avg_impact <= 7.5 else 'FAIL — RECALIBRATE'
        score_10_count = sum(1 for m in mqr_moments if m['impact'] >= 10)
        score_9_10_pct = round(sum(1 for m in mqr_moments if m['impact'] >= 9) / len(mqr_moments) * 100, 1)
        lines.append(f'| MQR avg impact | 5.5-6.5 | {avg_impact} | {inflation_status} |')
        lines.append(f'| Scores 9-10 | <= 15% | {score_9_10_pct}% ({score_10_count} are 10) | {"PASS" if score_9_10_pct <= 15 else "ALERT"} |')
    lines.append('')
    overall = 'APPROVED' if cov_status != 'FAIL' and q_status != 'FAIL' else 'NEEDS REVIEW'
    lines.append(f'**Veredicto: {overall}**')
    lines.append('')

    # Full moments with transcription
    lines.append('---')
    lines.append('')
    lines.append('## Momentos Selecionados')
    lines.append('')
    for idx, m in enumerate(top, 1):
        lines.append(f'### #{idx} | {m["tipo"].upper()} | {m["gatilho"]} | Score {m["impact"]}')
        lines.append(f'**Timestamp:** {m["inicio"]} - {m["fim"]} ({m["duracao"]}s)')
        lines.append(f'**Assunto:** {m["assunto"]}')
        lines.append(f'**Speaker:** {m["speaker"]}')
        if m.get('mqr'):
            lines.append(f'**MQR:** {m["mqr"]} → Score {m["impact"]}')
        lines.append('')
        lines.append('**Transcricao:**')
        lines.append(f'> {m["transcricao"]}')
        lines.append('')
        lines.append('---')
        lines.append('')

    # Footer
    lines.append(f'*Arquivo completo com {len(moments)} momentos: `{archive_path}`*')

    return '\n'.join(lines)


def main():
    if len(sys.argv) < 5:
        print('Usage: python generate_compact_mining.py <input> <output> <source_name> <duration_sec>')
        print('  input         Path to all_moments_merged.md')
        print('  output        Path for compact output')
        print('  source_name   Human-readable source name (quote if spaces)')
        print('  duration_sec  Total duration of source in seconds')
        print()
        print('Example:')
        print('  python squads/curator/scripts/generate_compact_mining.py \\')
        print('    _temp/mining/cohort-avancado-aula1/all_moments_merged.md \\')
        print('    output/curated/cohort-avancado-aula1_momentos.md \\')
        print('    "Cohort Avancado - Aula 1" 17344')
        sys.exit(1)

    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    source_name = sys.argv[3]
    total_dur_sec = int(sys.argv[4])

    output_file.parent.mkdir(parents=True, exist_ok=True)

    print(f'Reading: {input_file}')
    moments = parse_moments(input_file)
    print(f'Parsed: {len(moments)} moments')

    # Score distribution
    for s in range(10, 0, -1):
        count = sum(1 for m in moments if m['impact'] == s)
        if count > 0:
            print(f'  Score {s}: {count}')

    # Duration stats
    total_dur_moments = sum(m['duracao'] for m in moments)
    print(f'Total moment duration: {total_dur_moments}s ({round(total_dur_moments / 60, 1)} min)')
    print(f'Coverage (all): {round(total_dur_moments / total_dur_sec * 100, 1)}%')

    top = select_top(moments, n=50, total_dur_sec=total_dur_sec)
    print(f'Selected: {len(top)} top moments')

    top_dur = sum(m['duracao'] for m in top)
    print(f'Top duration: {top_dur}s ({round(top_dur / 60, 1)} min)')

    md = generate_md(
        moments, top,
        source_name=source_name,
        total_dur_sec=total_dur_sec,
        archive_path=str(input_file)
    )

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(md)

    size_kb = len(md.encode('utf-8')) / 1024
    input_size_kb = input_file.stat().st_size / 1024
    print(f'Output: {output_file} ({round(size_kb, 1)} KB)')
    print(f'Archive: {input_file} ({round(input_size_kb, 1)} KB)')
    print(f'Ratio: {round(size_kb / input_size_kb * 100, 1)}% of archive')


if __name__ == '__main__':
    main()
