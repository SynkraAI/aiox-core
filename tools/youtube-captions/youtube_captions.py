#!/usr/bin/env python3
"""
YouTube Captions Extractor — Extract subtitles/captions from YouTube videos.

Usage:
  python youtube_captions.py <url> [-o output_dir] [-l lang] [--format md|txt|json]
  python youtube_captions.py --playlist <playlist_url> [-o output_dir]

Extracts existing captions (manual or auto-generated) without downloading audio.
Outputs clean .md files ready for /etl-universal-converter.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp is required. Install with: pip install yt-dlp")
    sys.exit(1)


# Language priority: try these in order
DEFAULT_LANG_PRIORITY = ["pt-BR", "pt", "en", "en-US", "es"]


def slugify(text):
    """Convert text to filesystem-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80].strip("-")


def parse_subtitle_content(subtitle_data, fmt="json3"):
    """Parse subtitle data into clean text with timestamps."""
    lines = []
    seen_texts = set()

    if fmt == "json3" and "events" in subtitle_data:
        for event in subtitle_data["events"]:
            if "segs" not in event:
                continue
            text = "".join(seg.get("utf8", "") for seg in event["segs"]).strip()
            text = re.sub(r"\n", " ", text)
            if not text or text in seen_texts:
                continue
            seen_texts.add(text)

            start_ms = event.get("tStartMs", 0)
            minutes = start_ms // 60000
            seconds = (start_ms % 60000) // 1000
            timestamp = f"[{minutes:02d}:{seconds:02d}]"
            lines.append(f"{timestamp} {text}")

    return "\n".join(lines)


def fetch_subtitles_raw(video_url, lang_priority=None):
    """Fetch raw subtitle data from a YouTube video using yt-dlp."""
    if lang_priority is None:
        lang_priority = DEFAULT_LANG_PRIORITY

    ydl_opts = {
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": lang_priority,
        "subtitlesformat": "json3",
        "quiet": True,
        "no_warnings": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)

    return info


def pick_best_subtitle(info, lang_priority=None):
    """Pick the best available subtitle track. Returns (lang, url, is_auto)."""
    if lang_priority is None:
        lang_priority = DEFAULT_LANG_PRIORITY

    manual_subs = info.get("subtitles") or {}
    auto_subs = info.get("automatic_captions") or {}

    # Priority: manual > auto, then by language preference
    for lang in lang_priority:
        if lang in manual_subs:
            tracks = manual_subs[lang]
            json3 = next((t for t in tracks if t.get("ext") == "json3"), None)
            if json3:
                return lang, json3["url"], False

    for lang in lang_priority:
        if lang in auto_subs:
            tracks = auto_subs[lang]
            json3 = next((t for t in tracks if t.get("ext") == "json3"), None)
            if json3:
                return lang, json3["url"], True

    # Fallback: any manual sub
    for lang, tracks in manual_subs.items():
        json3 = next((t for t in tracks if t.get("ext") == "json3"), None)
        if json3:
            return lang, json3["url"], False

    # Fallback: any auto sub
    for lang, tracks in auto_subs.items():
        json3 = next((t for t in tracks if t.get("ext") == "json3"), None)
        if json3:
            return lang, json3["url"], True

    return None, None, None


def download_subtitle_content(url):
    """Download subtitle JSON3 content from URL."""
    import urllib.request
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def format_duration(seconds):
    """Format seconds into HH:MM:SS."""
    if not seconds:
        return "00:00:00"
    h = int(seconds) // 3600
    m = (int(seconds) % 3600) // 60
    s = int(seconds) % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


def extract_captions(video_url, output_dir=None, lang_priority=None, output_format="md"):
    """Extract captions from a single YouTube video.

    Returns dict with: title, channel, text, language, filepath (if saved).
    """
    if lang_priority is None:
        lang_priority = DEFAULT_LANG_PRIORITY

    print(f"  Fetching metadata: {video_url}")
    info = fetch_subtitles_raw(video_url, lang_priority)

    title = info.get("title", "untitled")
    channel = info.get("channel", info.get("uploader", "unknown"))
    upload_date = info.get("upload_date", "")
    duration = info.get("duration")
    video_id = info.get("id", "")
    description = (info.get("description") or "")[:500]

    lang, sub_url, is_auto = pick_best_subtitle(info, lang_priority)

    if not sub_url:
        print(f"  WARNING: No captions found for: {title}")
        return None

    sub_type = "auto-generated" if is_auto else "manual"
    print(f"  Found captions: {lang} ({sub_type})")

    sub_data = download_subtitle_content(sub_url)
    text = parse_subtitle_content(sub_data)

    if not text.strip():
        print(f"  WARNING: Empty captions for: {title}")
        return None

    # Format date
    date_formatted = ""
    if upload_date and len(upload_date) == 8:
        date_formatted = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}"

    result = {
        "title": title,
        "channel": channel,
        "date": date_formatted,
        "language": lang,
        "subtitle_type": sub_type,
        "duration": format_duration(duration),
        "video_id": video_id,
        "source_url": f"https://www.youtube.com/watch?v={video_id}",
        "description": description,
        "text": text,
        "word_count": len(text.split()),
    }

    if output_dir:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        slug = slugify(title)
        filename = f"{slug}.{output_format}"
        filepath = output_path / filename

        if output_format == "md":
            content = generate_markdown(result)
        elif output_format == "json":
            content = json.dumps(result, indent=2, ensure_ascii=False)
        else:
            content = text

        filepath.write_text(content, encoding="utf-8")
        result["filepath"] = str(filepath)
        print(f"  Saved: {filepath} ({result['word_count']} words)")

    return result


def generate_markdown(data):
    """Generate markdown with frontmatter from caption data."""
    frontmatter = f"""---
title: "{data['title']}"
channel: "{data['channel']}"
date: "{data['date']}"
language: "{data['language']}"
subtitle_type: "{data['subtitle_type']}"
duration: "{data['duration']}"
source_url: "{data['source_url']}"
source_type: youtube_captions
word_count: {data['word_count']}
extracted_at: "{datetime.now().strftime('%Y-%m-%d %H:%M')}"
---"""

    return f"{frontmatter}\n\n# {data['title']}\n\n{data['text']}\n"


def extract_playlist(playlist_url, output_dir, lang_priority=None, output_format="md"):
    """Extract captions from all videos in a YouTube playlist."""
    if lang_priority is None:
        lang_priority = DEFAULT_LANG_PRIORITY

    print(f"Fetching playlist: {playlist_url}")

    ydl_opts = {
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        playlist_info = ydl.extract_info(playlist_url, download=False)

    entries = playlist_info.get("entries", [])
    playlist_title = playlist_info.get("title", "playlist")
    print(f"Found {len(entries)} videos in: {playlist_title}\n")

    playlist_dir = Path(output_dir) / slugify(playlist_title)
    playlist_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for i, entry in enumerate(entries, 1):
        video_id = entry.get("id") or entry.get("url", "")
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        print(f"[{i}/{len(entries)}] Processing...")

        try:
            result = extract_captions(video_url, str(playlist_dir), lang_priority, output_format)
            if result:
                results.append(result)
        except Exception as e:
            print(f"  ERROR: {e}")

    # Generate index
    if results:
        index_path = playlist_dir / "_INDEX.md"
        index_lines = [f"# {playlist_title}\n"]
        index_lines.append(f"Total: {len(results)}/{len(entries)} videos extracted\n")
        index_lines.append("| # | Title | Duration | Words | Language |")
        index_lines.append("|---|-------|----------|-------|----------|")
        for i, r in enumerate(results, 1):
            fname = Path(r.get("filepath", "")).name
            index_lines.append(
                f"| {i} | [{r['title']}]({fname}) | {r['duration']} | {r['word_count']} | {r['language']} |"
            )
        index_path.write_text("\n".join(index_lines) + "\n", encoding="utf-8")
        print(f"\nIndex saved: {index_path}")

    print(f"\nDone: {len(results)}/{len(entries)} videos extracted to {playlist_dir}")
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Extract YouTube captions/subtitles (no audio download)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s https://youtube.com/watch?v=xxx
  %(prog)s https://youtube.com/watch?v=xxx -o ~/transcripts/
  %(prog)s --playlist https://youtube.com/playlist?list=xxx -o ~/transcripts/
  %(prog)s https://youtube.com/watch?v=xxx -l en -l pt-BR
        """,
    )
    parser.add_argument("url", nargs="?", help="YouTube video URL")
    parser.add_argument("--playlist", metavar="URL", help="YouTube playlist URL")
    parser.add_argument("-o", "--output", default=".", help="Output directory (default: current)")
    parser.add_argument(
        "-l", "--lang", action="append", dest="langs",
        help="Language priority (repeatable, e.g. -l pt-BR -l en). Default: pt-BR, pt, en",
    )
    parser.add_argument(
        "--format", choices=["md", "txt", "json"], default="md",
        help="Output format (default: md)",
    )

    args = parser.parse_args()

    if not args.url and not args.playlist:
        parser.print_help()
        sys.exit(1)

    lang_priority = args.langs if args.langs else DEFAULT_LANG_PRIORITY

    if args.playlist:
        extract_playlist(args.playlist, args.output, lang_priority, args.format)
    elif args.url:
        result = extract_captions(args.url, args.output, lang_priority, args.format)
        if not result:
            print("No captions found.")
            sys.exit(1)


if __name__ == "__main__":
    main()
