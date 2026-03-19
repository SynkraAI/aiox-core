#!/usr/bin/env python3
"""
Execute FFmpeg cuts from a validated YAML cut script.

Reads a roteiro_corte.yaml (QG-004 passed) and renders video segments
using ffmpeg with format-appropriate settings.

Usage:
    python execute_ffmpeg_cuts.py --input VIDEO --cut-yaml YAML [--output-dir DIR] [--dry-run]
    python execute_ffmpeg_cuts.py --help
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML required. Install: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


# ═══════════════════════════════════════════════════════════════════════════════
# PLATFORM SPECS
# ═══════════════════════════════════════════════════════════════════════════════

PLATFORM_SPECS = {
    "shorts": {
        "reels": {"width": 1080, "height": 1920, "crop": True, "max_duration": 90},
        "tiktok": {"width": 1080, "height": 1920, "crop": True, "max_duration": 180},
        "youtube_shorts": {"width": 1080, "height": 1920, "crop": True, "max_duration": 60},
    },
    "longform": {
        "youtube": {"width": 1920, "height": 1080, "crop": False, "max_duration": None},
    },
    "longform_simple": {
        "youtube": {"width": 1920, "height": 1080, "crop": False, "max_duration": None},
    },
    "social_clips": {
        "linkedin": {"width": 1920, "height": 1080, "crop": False, "max_duration": 600},
        "twitter": {"width": 1920, "height": 1080, "crop": False, "max_duration": 140},
    },
}

# Codec defaults
CODEC_DEFAULTS = {
    "video_codec": "libx264",
    "preset": "fast",
    "crf": 23,
    "audio_codec": "aac",
    "audio_bitrate": "128k",
}


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def parse_timestamp(ts: str) -> float:
    """Convert HH:MM:SS or MM:SS or seconds string to float seconds."""
    ts = ts.strip()
    # Already a number
    if re.match(r'^\d+(\.\d+)?$', ts):
        return float(ts)
    parts = ts.split(":")
    if len(parts) == 3:
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m) * 60 + float(s)
    raise ValueError(f"Invalid timestamp format: {ts}")


def format_duration(seconds: float) -> str:
    """Format seconds as MM:SS."""
    m = int(seconds) // 60
    s = seconds - m * 60
    return f"{m:02d}:{s:05.2f}"


def check_ffmpeg():
    """Verify ffmpeg is installed and accessible."""
    if shutil.which("ffmpeg") is None:
        print("ERROR: ffmpeg not found in PATH.", file=sys.stderr)
        print("Install: choco install ffmpeg  OR  winget install ffmpeg", file=sys.stderr)
        sys.exit(1)


def get_video_duration(video_path: str) -> float:
    """Get video duration in seconds using ffprobe."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", video_path],
            capture_output=True, text=True, timeout=30
        )
        return float(result.stdout.strip())
    except Exception:
        return 0.0


def validate_cut_yaml(data: dict) -> list:
    """Validate cut YAML has required fields. Returns list of errors."""
    errors = []
    if "metadata" not in data:
        errors.append("Missing 'metadata' section")
    if "segments" not in data and "cortes" not in data and "clips" not in data:
        errors.append("Missing 'segments', 'cortes', or 'clips' section")

    segments = data.get("segments") or data.get("cortes") or data.get("clips") or []
    for i, seg in enumerate(segments):
        if "inicio" not in seg and "start" not in seg:
            errors.append(f"Segment {i+1}: missing start timestamp (inicio/start)")
        if "fim" not in seg and "end" not in seg:
            errors.append(f"Segment {i+1}: missing end timestamp (fim/end)")

    # Check QG-004 marker
    meta = data.get("metadata", {})
    qg = meta.get("quality_gate") or meta.get("qg_004") or meta.get("quality_gates", {})
    if not qg:
        errors.append("BLOCK: No QG-004 quality gate marker found in metadata")

    return errors


# ═══════════════════════════════════════════════════════════════════════════════
# RENDER ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

def build_ffmpeg_cmd(video_input: str, segment: dict, output_path: str,
                     format_type: str, platform: str) -> list:
    """Build ffmpeg command for a single segment."""
    start = segment.get("inicio") or segment.get("start")
    end = segment.get("fim") or segment.get("end")

    start_s = parse_timestamp(str(start))
    end_s = parse_timestamp(str(end))

    # Get platform spec
    specs = PLATFORM_SPECS.get(format_type, {}).get(platform, {})
    needs_crop = specs.get("crop", False)
    width = specs.get("width", 1920)
    height = specs.get("height", 1080)

    cmd = ["ffmpeg", "-y", "-ss", str(start_s), "-to", str(end_s), "-i", video_input]

    # Video filters
    vf_filters = []
    if needs_crop and width == 1080 and height == 1920:
        # Center crop from 1920x1080 to 9:16
        vf_filters.append("crop=608:1080:656:0")
        vf_filters.append("scale=1080:1920")

    if vf_filters:
        cmd.extend(["-vf", ",".join(vf_filters)])

    # Codec settings
    cmd.extend([
        "-c:v", CODEC_DEFAULTS["video_codec"],
        "-preset", CODEC_DEFAULTS["preset"],
        "-crf", str(CODEC_DEFAULTS["crf"]),
        "-c:a", CODEC_DEFAULTS["audio_codec"],
        "-b:a", CODEC_DEFAULTS["audio_bitrate"],
    ])

    cmd.append(output_path)
    return cmd


def try_copy_mode(video_input: str, segment: dict, output_path: str) -> list:
    """Build ffmpeg command using stream copy (no re-encode) for speed."""
    start = segment.get("inicio") or segment.get("start")
    end = segment.get("fim") or segment.get("end")

    start_s = parse_timestamp(str(start))
    end_s = parse_timestamp(str(end))

    return [
        "ffmpeg", "-y",
        "-ss", str(start_s), "-to", str(end_s),
        "-i", video_input,
        "-c", "copy",
        output_path
    ]


def render_segment(video_input: str, segment: dict, output_path: str,
                   format_type: str, platform: str, dry_run: bool = False) -> dict:
    """Render a single segment. Returns result dict."""
    start = segment.get("inicio") or segment.get("start")
    end = segment.get("fim") or segment.get("end")
    name = segment.get("nome") or segment.get("name") or segment.get("titulo", "unnamed")

    start_s = parse_timestamp(str(start))
    end_s = parse_timestamp(str(end))
    expected_duration = end_s - start_s

    result = {
        "name": name,
        "start": str(start),
        "end": str(end),
        "expected_duration_s": round(expected_duration, 2),
        "output": output_path,
        "mode": "unknown",
        "status": "pending",
    }

    if expected_duration <= 0:
        result["status"] = "error"
        result["error"] = f"Invalid duration: {expected_duration}s"
        return result

    # Determine if we need re-encode (crop) or can use copy mode
    specs = PLATFORM_SPECS.get(format_type, {}).get(platform, {})
    needs_crop = specs.get("crop", False)

    if needs_crop:
        cmd = build_ffmpeg_cmd(video_input, segment, output_path, format_type, platform)
        result["mode"] = "re-encode"
    else:
        cmd = try_copy_mode(video_input, segment, output_path)
        result["mode"] = "copy"

    result["command"] = " ".join(cmd)

    if dry_run:
        result["status"] = "dry-run"
        return result

    # Execute
    t0 = time.time()
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        elapsed = time.time() - t0
        result["elapsed_s"] = round(elapsed, 2)

        if proc.returncode != 0:
            # If copy mode failed, retry with re-encode
            if result["mode"] == "copy":
                cmd = build_ffmpeg_cmd(video_input, segment, output_path, format_type, platform)
                result["mode"] = "re-encode (fallback)"
                result["command"] = " ".join(cmd)
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                elapsed = time.time() - t0
                result["elapsed_s"] = round(elapsed, 2)

            if proc.returncode != 0:
                result["status"] = "error"
                result["error"] = proc.stderr[-500:] if proc.stderr else "Unknown error"
                return result

        # Verify output
        if not os.path.exists(output_path):
            result["status"] = "error"
            result["error"] = "Output file not created"
            return result

        actual_duration = get_video_duration(output_path)
        result["actual_duration_s"] = round(actual_duration, 2)
        result["duration_diff_s"] = round(abs(actual_duration - expected_duration), 2)

        # Tolerance: ±2 seconds
        if result["duration_diff_s"] <= 2.0:
            result["status"] = "success"
        else:
            result["status"] = "warning"
            result["warning"] = f"Duration mismatch: expected {expected_duration:.1f}s, got {actual_duration:.1f}s"

    except subprocess.TimeoutExpired:
        result["status"] = "error"
        result["error"] = "FFmpeg timeout (300s)"
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


# ═══════════════════════════════════════════════════════════════════════════════
# REPORT GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

def generate_report(results: list, metadata: dict, output_dir: str) -> str:
    """Generate render_report.md."""
    total = len(results)
    success = sum(1 for r in results if r["status"] == "success")
    warnings = sum(1 for r in results if r["status"] == "warning")
    errors = sum(1 for r in results if r["status"] == "error")
    copy_mode = sum(1 for r in results if "copy" in r.get("mode", ""))
    reencode = total - copy_mode

    source = metadata.get("source", metadata.get("fonte", "unknown"))
    fmt = metadata.get("format", metadata.get("formato", "unknown"))

    lines = [
        f"# Render Report — {source}",
        "",
        f"**Date:** {time.strftime('%Y-%m-%d %H:%M')}",
        f"**Format:** {fmt}",
        f"**Total segments:** {total}",
        f"**Success:** {success} | **Warnings:** {warnings} | **Errors:** {errors}",
        f"**Mode:** {copy_mode} copy, {reencode} re-encode",
        "",
        "## Segments",
        "",
        "| # | Name | Start | End | Duration | Mode | Status |",
        "|---|------|-------|-----|----------|------|--------|",
    ]

    for i, r in enumerate(results, 1):
        status_icon = {"success": "✅", "warning": "⚠️", "error": "❌", "dry-run": "🔍"}.get(r["status"], "❓")
        dur = f"{r['expected_duration_s']}s"
        lines.append(f"| {i} | {r['name']} | {r['start']} | {r['end']} | {dur} | {r['mode']} | {status_icon} {r['status']} |")

    # Errors detail
    error_results = [r for r in results if r.get("error")]
    if error_results:
        lines.extend(["", "## Errors", ""])
        for r in error_results:
            lines.append(f"- **{r['name']}:** {r['error']}")

    # Warning detail
    warn_results = [r for r in results if r.get("warning")]
    if warn_results:
        lines.extend(["", "## Warnings", ""])
        for r in warn_results:
            lines.append(f"- **{r['name']}:** {r['warning']}")

    lines.extend(["", "---", f"*Generated by execute_ffmpeg_cuts.py*"])
    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Execute FFmpeg cuts from a validated YAML cut script.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python execute_ffmpeg_cuts.py --input video.mp4 --cut-yaml roteiro_corte.yaml
  python execute_ffmpeg_cuts.py --input video.mp4 --cut-yaml cuts.yaml --output-dir renders/
  python execute_ffmpeg_cuts.py --input video.mp4 --cut-yaml cuts.yaml --dry-run
        """,
    )
    parser.add_argument("--input", "-i", required=True, help="Path to source video file")
    parser.add_argument("--cut-yaml", "-c", required=True, help="Path to YAML cut script (QG-004 passed)")
    parser.add_argument("--output-dir", "-o", default=None, help="Output directory (default: alongside YAML)")
    parser.add_argument("--platform", "-p", default=None, help="Override platform (reels, tiktok, youtube, etc.)")
    parser.add_argument("--dry-run", action="store_true", help="Show commands without executing")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    args = parser.parse_args()

    # Validate inputs
    if not os.path.exists(args.input):
        print(f"BLOCK: Video file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(args.cut_yaml):
        print(f"BLOCK: Cut YAML not found: {args.cut_yaml}", file=sys.stderr)
        sys.exit(1)

    check_ffmpeg()

    # Load YAML
    with open(args.cut_yaml, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    # Validate
    errors = validate_cut_yaml(data)
    if errors:
        for e in errors:
            print(f"VALIDATION ERROR: {e}", file=sys.stderr)
        if any("BLOCK" in e for e in errors):
            sys.exit(1)

    metadata = data.get("metadata", {})
    segments = data.get("segments") or data.get("cortes") or data.get("clips") or []
    format_type = metadata.get("format") or metadata.get("formato", "longform")
    platform = args.platform or metadata.get("platform") or metadata.get("plataforma", "youtube")

    # Output directory
    if args.output_dir:
        out_dir = args.output_dir
    else:
        yaml_dir = os.path.dirname(os.path.abspath(args.cut_yaml))
        out_dir = os.path.join(yaml_dir, "renders")

    os.makedirs(out_dir, exist_ok=True)

    # Render each segment
    results = []
    for i, seg in enumerate(segments, 1):
        name = seg.get("nome") or seg.get("name") or seg.get("titulo", f"segment-{i:02d}")
        safe_name = re.sub(r'[^\w\-]', '-', name.lower()).strip('-')
        ext = ".mp4"
        output_path = os.path.join(out_dir, f"{i:02d}-{safe_name}{ext}")

        if not args.dry_run:
            print(f"[{i}/{len(segments)}] Rendering: {name}...")

        result = render_segment(args.input, seg, output_path, format_type, platform, args.dry_run)
        results.append(result)

        if not args.dry_run and result["status"] in ("success", "warning"):
            print(f"  → {result['status']} ({result.get('elapsed_s', '?')}s, {result['mode']})")
        elif not args.dry_run:
            print(f"  → ERROR: {result.get('error', 'unknown')}")

    # Generate report
    report = generate_report(results, metadata, out_dir)
    report_path = os.path.join(out_dir, "render_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print(f"\n{'='*60}")
        success_count = sum(1 for r in results if r["status"] in ("success", "warning"))
        print(f"Done: {success_count}/{len(results)} segments rendered")
        print(f"Report: {report_path}")
        print(f"Output: {out_dir}")

    # Exit code
    if any(r["status"] == "error" for r in results):
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
