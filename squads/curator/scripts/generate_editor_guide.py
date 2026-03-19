#!/usr/bin/env python3
"""
Generate clean editor guide MD files from YAML cut files.

Usage:
    python squads/curator/scripts/generate_editor_guide.py <input_glob_or_dir> [--output-dir DIR]

Examples:
    python squads/curator/scripts/generate_editor_guide.py output/curated/my-source/cortes/longform/
    python squads/curator/scripts/generate_editor_guide.py "output/curated/my-source/cortes/**/*.yaml"
    python squads/curator/scripts/generate_editor_guide.py output/curated/my-source/cortes/longform/ --output-dir output/curated/my-source/cortes/longform/
"""

import yaml
import glob
import os
import re
import sys


def parse_bridge_string(bridge_str: str) -> dict:
    """Parse a bridge that is a raw string instead of a dict."""
    result = {"source": "", "text": "", "duracao_segundos": 0}
    match = re.search(r'\[BRIDGE\s+(\d{1,2}:\d{2}:\d{2})-(\d{1,2}:\d{2}:\d{2})', bridge_str)
    if match:
        ts_start = match.group(1)
        ts_end = match.group(2)
        result["source"] = f"BRIDGE {ts_start}-{ts_end}"
        def ts_to_secs(ts):
            parts = ts.split(":")
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        result["duracao_segundos"] = ts_to_secs(ts_end) - ts_to_secs(ts_start)
    text_match = re.search(r'["\u201c](.+?)["\u201d]', bridge_str, re.DOTALL)
    if text_match:
        result["text"] = text_match.group(1).strip()
    return result


def normalize_bridge(bridge):
    """Normalize bridge to a dict with source, text, duracao_segundos."""
    if bridge is None:
        return None
    if isinstance(bridge, dict):
        return bridge
    if isinstance(bridge, str):
        return parse_bridge_string(bridge)
    return None


def extract_bridge_timestamps(bridge: dict) -> str:
    """Extract timestamp range from bridge source field."""
    source = bridge.get("source", "")
    match = re.search(r'(\d{1,2}:\d{2}:\d{2})\s*[-\u2013]\s*(\d{1,2}:\d{2}:\d{2})', source)
    if match:
        return f"{match.group(1)} -> {match.group(2)}"
    return source


def clean_text(text: str) -> str:
    """Clean transcription text: collapse whitespace, strip edges."""
    if not text:
        return ""
    return " ".join(text.strip().split())


def transition_label(transicao) -> str:
    """Map transition type to human-readable label."""
    labels = {
        "natural": "Continuidade OK (corte natural)",
        "hard_cut": "Corte seco (hard cut)",
        "pausa_intencional": "Pausa intencional",
    }
    if not transicao:
        return "Continuidade OK"
    return labels.get(transicao, f"Transicao: {transicao}")


def check_continuity(moment_a: dict, moment_b: dict) -> str:
    """Check thematic continuity between two consecutive moments.

    Compares last ~50 words of moment A with first ~50 words of moment B.
    Returns continuity status string for editor guide.
    """
    text_a = clean_text(moment_a.get("transcricao", ""))
    text_b = clean_text(moment_b.get("transcricao", ""))

    if not text_a or not text_b:
        return "⚠️ PULO TEMÁTICO — transcrição ausente, avaliar bridge"

    # Get last 50 words of A and first 50 words of B
    words_a = text_a.split()
    words_b = text_b.split()
    tail_a = set(w.lower().strip(".,;:!?") for w in words_a[-50:] if len(w) > 3)
    head_b = set(w.lower().strip(".,;:!?") for w in words_b[:50] if len(w) > 3)

    # Check keyword overlap
    overlap = tail_a & head_b

    # Check if bridge exists
    bridge_depois = moment_a.get("bridge_depois")
    bridge_antes = moment_b.get("bridge_antes")
    has_bridge = bridge_depois is not None or bridge_antes is not None

    if len(overlap) >= 2 or has_bridge:
        return "✅ Continuidade OK"
    elif len(overlap) == 1:
        return f"✅ Continuidade OK (keyword: '{overlap.pop()}')"
    else:
        return "⚠️ PULO TEMÁTICO — avaliar bridge ou transição"


def generate_shorts_guide(data: dict) -> str:
    """Generate editor guide markdown for shorts (beats-based) YAML.

    Output is 100% Portuguese, uses editor-friendly vocabulary, and follows
    the same header/disclaimer pattern as longform and longform_simple guides.
    """
    meta = data["metadata"]
    beats = data.get("beats", [])
    hook = data.get("hook_analysis", {}).get("selected_hook", {})
    di = data.get("duration_intelligence", {})
    overlays = data.get("text_overlays", [])
    sumario = data.get("sumario", {})
    lines = []

    dur_final = sumario.get("duracao_final", di.get("recommended_duration", "?"))

    # =====================================================================
    # HEADER
    # =====================================================================
    lines.append(f"# GUIA DO EDITOR — SHORT — {meta.get('titulo', 'Sem titulo')}")
    lines.append("")
    lines.append(f"**Vídeo original:** {meta.get('fonte_original', '?')}")
    lines.append(f"**Duração do original:** {meta.get('duracao_original', '?')}")
    lines.append(f"**Duração deste corte:** ~{dur_final}s")
    lines.append(f"**Total de beats:** {len(beats)}")
    lines.append("")
    lines.append("> Transcrição automática (STT). Nomes próprios e termos técnicos podem")
    lines.append("> ter erros de grafia. Consulte o áudio original em caso de dúvida.")
    lines.append("")

    # =====================================================================
    # ANÁLISE DO GANCHO
    # =====================================================================
    if hook:
        lines.append("## Análise do Gancho")
        lines.append("")
        lines.append(f"- Tipo de gancho: **{hook.get('hook_type', '?')}**")
        lines.append(f"- Pontuação: **{hook.get('hook_point_score', '?')}/10**")
        lines.append(f"- Momento: #{hook.get('moment_id', '?')} (impacto {hook.get('impact_score', '?')})")
        one_sec = clean_text(hook.get("one_second_capture", ""))
        if one_sec:
            lines.append(f"- Captura em 1 segundo: {one_sec}")
        lines.append("")
        lines.append("---")
        lines.append("")

    # =====================================================================
    # ESTRUTURA DE BEATS
    # =====================================================================
    lines.append("## Estrutura de Beats")
    lines.append("")
    lines.append("| Beat | Nome | Duração | Timestamp |")
    lines.append("|------|------|---------|-----------|")
    for b in beats:
        ts_in = b.get("timestamp_inicio", "?")
        ts_out = b.get("timestamp_fim", "?")
        dur = b.get("duracao_segundos", "?")
        lines.append(f"| {b.get('beat', '?')} | {b.get('name', '?')} | {dur}s | {ts_in} → {ts_out} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Detailed beats
    for b in beats:
        lines.append(f"### Beat {b.get('beat', '?')} — {b.get('name', '?')}")
        lines.append("")
        lines.append(f"- **Timestamp:** {b.get('timestamp_inicio', '?')} → {b.get('timestamp_fim', '?')}")
        lines.append(f"- **Duração:** {b.get('duracao_segundos', '?')}s")
        mid = b.get("moment_id")
        if mid is not None:
            lines.append(f"- **Momento:** #{mid}")
        full_text = clean_text(b.get("transcricao", ""))
        if full_text:
            lines.append(f"- **Transcrição:**")
            lines.append("")
            lines.append(f"> {full_text}")
            lines.append("")
        notas = b.get("notas_editor", "")
        if notas:
            lines.append(f"- **Notas editor:** {clean_text(notas)}")
        lines.append("")

    lines.append("---")
    lines.append("")

    # =====================================================================
    # TEXTOS NA TELA
    # =====================================================================
    if overlays:
        lines.append("## Textos na Tela")
        lines.append("")
        lines.append("| Segundo | Texto | Estilo | Duração |")
        lines.append("|---------|-------|--------|---------|")
        for ov in overlays:
            lines.append(f"| {ov.get('at_second', '?')}s | {ov.get('text', '?')} | {ov.get('style', '?')} | {ov.get('duration', '?')}s |")
        lines.append("")

    # =====================================================================
    # RESUMO FINAL
    # =====================================================================
    lines.append("## Resumo Final")
    lines.append("")
    lines.append(f"- Beats totais: {len(beats)}")
    lines.append(f"- Duração final estimada: ~{dur_final}s")
    lines.append(f"- Plataforma: {meta.get('plataforma', '?')}")
    lines.append(f"- Estilo: {meta.get('style_preset', 'viral')}")
    lines.append("")

    # Confidence
    conf = di.get("confidence", "")
    conf_note = di.get("confidence_note", "")
    if conf:
        lines.append(f"**Confiança:** {conf} — {conf_note}")
        lines.append("")

    return "\n".join(lines)


def generate_longform_simple_guide(data: dict) -> str:
    """Generate editor guide markdown for longform simple (chronological) YAML.

    Output is 100% Portuguese, uses editor-friendly vocabulary (takes, cortes,
    pontes), and follows a linear flow: Resumo → Abertura → Fluxo Principal → Resumo Final.
    """
    meta = data["metadata"]
    abertura = data.get("abertura_engenheirada", {})
    momentos = data.get("momentos", [])
    di = data.get("duration_intelligence", {})
    sumario = data.get("sumario", {})
    lines = []

    # --- Count abertura takes ---
    num_abertura = 0
    hook = abertura.get("hook", {}) if abertura else {}
    momentos_ab = abertura.get("momentos_abertura", []) if abertura else []
    if hook:
        num_abertura += 1
    num_abertura += len(momentos_ab)

    total_takes = num_abertura + len(momentos)

    # Count gap types in main flow
    num_cortes_secos = 0
    num_pontes = 0
    num_continuidade = 0
    for m in momentos:
        gap = m.get("gap_antes", {})
        if isinstance(gap, dict):
            gap_tipo = gap.get("tipo", "none")
            if gap_tipo == "REMOVE":
                num_cortes_secos += 1
            elif gap_tipo == "BRIDGE":
                num_pontes += 1
            else:
                num_continuidade += 1
        else:
            num_continuidade += 1

    dur_final = sumario.get("duracao_final_estimada", di.get("recommended_duration", "?"))

    # =====================================================================
    # HEADER
    # =====================================================================
    lines.append(f"# GUIA DO EDITOR — {meta.get('titulo', 'Sem titulo')}")
    lines.append("")
    lines.append(f"**Vídeo original:** {meta.get('fonte_original', '?')}")
    lines.append(f"**Duração do original:** {meta.get('duracao_original', '?')}")
    lines.append(f"**Duração deste corte:** ~{dur_final}")
    lines.append(f"**Total de takes:** {total_takes}")
    lines.append("")
    lines.append("> Transcrição automática (STT). Nomes próprios e termos técnicos podem")
    lines.append("> ter erros de grafia. Consulte o áudio original em caso de dúvida.")
    lines.append("")

    # =====================================================================
    # RESUMO RÁPIDO
    # =====================================================================
    lines.append("## Resumo Rápido")
    lines.append("")
    lines.append(f"- **Como funciona:** Os primeiros ~2 minutos usam {num_abertura} momentos escolhidos")
    lines.append(f"  a dedo (podem estar fora da ordem original). Depois disso, o vídeo segue")
    lines.append(f"  a ordem natural da conversa — é só cortar os trechos marcados.")
    lines.append("")
    lines.append("---")
    lines.append("")

    # =====================================================================
    # ABERTURA
    # =====================================================================
    if abertura:
        lines.append(f"## Abertura (primeiros ~2 minutos)")
        lines.append("")
        lines.append(f"A abertura usa {num_abertura} momentos fora da ordem para prender atenção.")
        lines.append("")

        take_num = 1

        # Hook
        if hook:
            ts_in = hook.get("timestamp_inicio", "?")
            ts_out = hook.get("timestamp_fim", "?")
            lines.append(f"### Take {take_num} — GANCHO ({ts_in} → {ts_out})")
            lines.append("")
            hook_text = clean_text(hook.get("transcricao", ""))
            if hook_text:
                lines.append(f"> {hook_text}")
                lines.append("")
            lines.append("**Nota:** Este é o gancho. Corte direto no início, sem intro.")
            lines.append("")
            take_num += 1

        # Opening moments
        for m in momentos_ab:
            ts_in = m.get("timestamp_inicio", "?")
            ts_out = m.get("timestamp_fim", "?")
            lines.append(f"### Take {take_num} — ({ts_in} → {ts_out})")
            lines.append("")
            m_text = clean_text(m.get("transcricao", ""))
            if m_text:
                lines.append(f"> {m_text}")
                lines.append("")
            take_num += 1

        lines.append(f"**Depois do Take {take_num - 1}, o vídeo segue na ordem natural da conversa.**")
        lines.append("")
        lines.append("---")
        lines.append("")

    # =====================================================================
    # FLUXO PRINCIPAL
    # =====================================================================
    take_num = num_abertura + 1

    lines.append("## Fluxo Principal (ordem da conversa)")
    lines.append("")
    lines.append("A partir daqui, siga a ordem abaixo. Entre cada take, a instrução diz")
    lines.append("o que fazer: **corte seco** (pula o trecho) ou **ponte** (mantém a ligação).")
    lines.append("")

    for i, m in enumerate(momentos):
        ts_in = m.get("timestamp_inicio", "?")
        ts_out = m.get("timestamp_fim", "?")
        dur = m.get("duracao_segundos", "?")

        lines.append(f"### Take {take_num} — ({ts_in} → {ts_out}) · {dur}s")
        lines.append("")

        full_text = clean_text(m.get("transcricao", ""))
        if full_text:
            lines.append(f"> {full_text}")
            lines.append("")

        # Instruction for what happens AFTER this take (gap to next)
        if i < len(momentos) - 1:
            next_m = momentos[i + 1]
            next_gap = next_m.get("gap_antes", {})
            if isinstance(next_gap, dict):
                next_gap_tipo = next_gap.get("tipo", "none")
                next_gap_dur = next_gap.get("duracao_segundos", 0)
                bridge_text = clean_text(next_gap.get("bridge_text", ""))

                if next_gap_tipo == "REMOVE":
                    lines.append(f"**→ Corte seco até o próximo take** ({next_gap_dur}s de filler removido)")
                elif next_gap_tipo == "BRIDGE":
                    lines.append(f"**→ Manter ponte até o próximo take** (ligação natural de {next_gap_dur}s)")
                    if bridge_text:
                        lines.append(f"> Texto da ponte: \"{bridge_text}\"")
                else:
                    lines.append("**→ Continuidade natural** (sem corte, segue direto)")
            else:
                lines.append("**→ Continuidade natural** (sem corte, segue direto)")
        else:
            lines.append("**→ FIM DO VÍDEO.** End card / CTA de inscrição após este take.")

        lines.append("")
        take_num += 1

    lines.append("---")
    lines.append("")

    # =====================================================================
    # RESUMO FINAL
    # =====================================================================
    lines.append("## Resumo Final")
    lines.append("")
    lines.append(f"- Takes na abertura: {num_abertura}")
    lines.append(f"- Takes no fluxo principal: {len(momentos)}")
    lines.append(f"- Cortes secos (jump cuts): {num_cortes_secos}")
    lines.append(f"- Pontes mantidas: {num_pontes}")
    lines.append(f"- Continuidades naturais: {num_continuidade}")
    lines.append(f"- Duração final estimada: ~{dur_final}")
    lines.append("")

    return "\n".join(lines)


def generate_guide(data: dict) -> str:
    """Generate editor guide markdown for longform (chapters) YAML.

    Output is 100% Portuguese, uses editor-friendly vocabulary (takes, cortes,
    pontes, blocos), and follows a linear flow the editor can follow top-to-bottom.
    """
    meta = data["metadata"]
    cold_open = data["cold_open"]
    chapters = data["chapters"]
    lines = []

    # Count total takes
    total_takes = 1  # cold open = take 1
    for ch in chapters:
        total_takes += len(ch.get("momentos", []))

    # =====================================================================
    # HEADER
    # =====================================================================
    lines.append(f"# GUIA DO EDITOR — {meta.get('titulo', 'Sem titulo')}")
    lines.append("")
    lines.append(f"**Vídeo original:** {meta.get('fonte_original', '?')}")
    lines.append(f"**Duração do original:** {meta.get('duracao_original', '?')}")
    lines.append(f"**Duração deste corte:** ~{meta.get('duracao_final_estimada', '?')}")
    lines.append(f"**Total de takes:** {total_takes}")
    lines.append(f"**Blocos (capítulos):** {len(chapters)}")
    lines.append("")
    lines.append("> Transcrição automática (STT). Nomes próprios e termos técnicos podem")
    lines.append("> ter erros de grafia. Consulte o áudio original em caso de dúvida.")
    lines.append("")

    # =====================================================================
    # RESUMO DOS BLOCOS
    # =====================================================================
    lines.append("## Estrutura do Vídeo")
    lines.append("")
    lines.append("| Bloco | Tema | Duração |")
    lines.append("|-------|------|---------|")
    lines.append(f"| Gancho | Abertura de impacto | {cold_open.get('duracao_segundos', '?')}s |")
    for ch in chapters:
        lines.append(f"| {ch['chapter']} | {ch['title']} | {ch.get('duracao_estimada', '?')} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # =====================================================================
    # GANCHO (COLD OPEN)
    # =====================================================================
    take_num = 1
    ts_in = cold_open.get("timestamp_inicio", "?")
    ts_out = cold_open.get("timestamp_fim", "?")
    dur = cold_open.get("duracao_segundos", "?")

    lines.append(f"## Gancho de Abertura")
    lines.append("")
    lines.append(f"### Take {take_num} — GANCHO ({ts_in} → {ts_out}) · {dur}s")
    lines.append("")
    co_text = clean_text(cold_open.get("transcricao", ""))
    if co_text:
        lines.append(f"> {co_text}")
        lines.append("")
    lines.append("**Nota:** Este é o gancho. Corte direto no início, sem intro.")
    lines.append("")
    lines.append("---")
    lines.append("")
    take_num += 1

    # =====================================================================
    # BLOCOS (CHAPTERS)
    # =====================================================================
    for ch in chapters:
        lines.append(f"## Bloco {ch['chapter']} — {ch['title']}")
        lines.append("")
        lines.append(f"Duração estimada: ~{ch.get('duracao_estimada', '?')}")
        lines.append("")

        momentos = ch.get("momentos", [])
        momentos_sorted = sorted(momentos, key=lambda m: m.get("ordem_montagem", 0))

        for idx, m in enumerate(momentos_sorted):
            ts_in = m.get("timestamp_inicio", "?")
            ts_out = m.get("timestamp_fim", "?")
            dur = m.get("duracao_segundos", "?")

            lines.append(f"### Take {take_num} — ({ts_in} → {ts_out}) · {dur}s")
            lines.append("")

            # Bridge antes (ponte de entrada)
            bridge_antes = normalize_bridge(m.get("bridge_antes"))
            if bridge_antes:
                br_dur = bridge_antes.get("duracao_segundos", "?")
                br_text = clean_text(bridge_antes.get("text", ""))
                ts_range = extract_bridge_timestamps(bridge_antes)
                lines.append(f"**Ponte de entrada** ({ts_range} · {br_dur}s)")
                if br_text:
                    lines.append(f"> {br_text}")
                lines.append("")

            # Full transcription
            full_text = clean_text(m.get("transcricao", ""))
            if full_text:
                lines.append(f"> {full_text}")
                lines.append("")

            # Bridge depois (ponte de saída)
            bridge_depois = normalize_bridge(m.get("bridge_depois"))
            if bridge_depois:
                br_dur = bridge_depois.get("duracao_segundos", "?")
                br_text = clean_text(bridge_depois.get("text", ""))
                ts_range = extract_bridge_timestamps(bridge_depois)
                lines.append(f"**Ponte de saída** ({ts_range} · {br_dur}s)")
                if br_text:
                    lines.append(f"> {br_text}")
                lines.append("")

            # Instruction for what happens AFTER this take
            transicao = m.get("transicao_depois", "natural")
            if idx < len(momentos_sorted) - 1:
                if transicao == "hard_cut":
                    lines.append("**→ Corte seco até o próximo take**")
                elif transicao == "pausa_intencional":
                    lines.append("**→ Pausa intencional antes do próximo take** (respiração, silêncio)")
                else:
                    lines.append("**→ Continuidade natural** (sem corte, segue direto)")
            lines.append("")
            take_num += 1

        # End of chapter instruction
        if ch != chapters[-1]:
            lines.append("**→ Fim do bloco. Transição para o próximo bloco.**")
            lines.append("")
        else:
            lines.append("**→ FIM DO VÍDEO.** End card / CTA de inscrição após este take.")
            lines.append("")

        lines.append("---")
        lines.append("")

    # =====================================================================
    # RESUMO FINAL
    # =====================================================================
    lines.append("## Resumo Final")
    lines.append("")
    lines.append(f"- Takes totais: {take_num - 1}")
    lines.append(f"- Blocos: {len(chapters)}")
    lines.append(f"- Duração final estimada: ~{meta.get('duracao_final_estimada', '?')}")
    lines.append("")

    return "\n".join(lines)


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate editor guide MD files from YAML cut files."
    )
    parser.add_argument(
        "input_path",
        help="Directory containing YAML cut files, or glob pattern (e.g. 'output/curated/my-source/cortes/**/*.yaml')"
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Output directory for guide files. Default: same directory as each YAML file."
    )
    args = parser.parse_args()

    input_path = args.input_path

    # Determine YAML files to process
    if os.path.isdir(input_path):
        # Directory mode: find all *.yaml files
        yaml_files = sorted(glob.glob(os.path.join(input_path, "*.yaml")))
    else:
        # Glob pattern mode
        yaml_files = sorted(glob.glob(input_path, recursive=True))

    # Filter to only YAML files (exclude non-yaml matches from glob)
    yaml_files = [f for f in yaml_files if f.endswith(".yaml") or f.endswith(".yml")]

    if not yaml_files:
        print(f"ERROR: No YAML files found matching {input_path}")
        sys.exit(1)

    print(f"Found {len(yaml_files)} YAML cut files.")

    for fpath in yaml_files:
        print(f"\nProcessing: {os.path.basename(fpath)}")

        with open(fpath, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        # ── Format Detection (hardened v3.1.0) ──────────────────────────
        # Priority: explicit metadata > structural inference > error exit
        formato = data.get("metadata", {}).get("formato", "")
        if not formato:
            # Structural inference
            if "beats" in data:
                formato = "shorts"
            elif "abertura_engenheirada" in data or "janela_temporal" in data:
                formato = "longform_simple"
            elif "chapters" in data and "cold_open" in data:
                formato = "longform"
            else:
                print(f"ERROR: Cannot determine format for {os.path.basename(fpath)}.")
                print(f"  Set metadata.formato explicitly (shorts | longform_simple | longform)")
                print(f"  Or ensure structural keys exist (beats | abertura_engenheirada | chapters+cold_open)")
                sys.exit(1)

        # ── Required field validation ────────────────────────────────────
        if formato == "shorts" and "beats" not in data:
            print(f"ERROR: formato=shorts but 'beats' key missing in {os.path.basename(fpath)}")
            sys.exit(1)
        if formato == "longform" and "cold_open" not in data:
            print(f"ERROR: formato=longform but 'cold_open' key missing in {os.path.basename(fpath)}")
            sys.exit(1)
        if formato == "longform" and "chapters" not in data:
            print(f"ERROR: formato=longform but 'chapters' key missing in {os.path.basename(fpath)}")
            sys.exit(1)

        # ── Generate guide by detected format ────────────────────────────
        if formato == "shorts":
            md_content = generate_shorts_guide(data)
            fmt_label = "shorts"
        elif formato == "longform_simple":
            md_content = generate_longform_simple_guide(data)
            fmt_label = "longform_simple"
        elif formato == "longform":
            md_content = generate_guide(data)
            fmt_label = "longform"
        else:
            print(f"ERROR: Unknown formato '{formato}' in {os.path.basename(fpath)}")
            sys.exit(1)

        # Build output filename: replace .yaml with _GUIA_EDITOR.md
        basename = os.path.basename(fpath)
        out_name = re.sub(r'\.ya?ml$', '_GUIA_EDITOR.md', basename)

        if args.output_dir:
            os.makedirs(args.output_dir, exist_ok=True)
            out_path = os.path.join(args.output_dir, out_name)
        else:
            out_path = os.path.join(os.path.dirname(fpath), out_name)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(md_content)

        print(f"  -> Saved: {out_path}")
        if fmt_label == "shorts":
            num_beats = len(data.get("beats", []))
            print(f"  -> {fmt_label}: {num_beats} beats")
        elif fmt_label == "longform_simple":
            num_moments = len(data.get("momentos", []))
            num_insertions = sum(1 for m in data.get("momentos", []) if m.get("fora_janela"))
            print(f"  -> {fmt_label}: {num_moments} moments ({num_insertions} insertions)")
        else:
            num_chapters = len(data.get("chapters", []))
            num_moments = sum(len(ch.get("momentos", [])) for ch in data.get("chapters", []))
            print(f"  -> {fmt_label}: {num_chapters} chapters, {num_moments} moments")

    print("\nDone. All editor guides generated.")


if __name__ == "__main__":
    main()
