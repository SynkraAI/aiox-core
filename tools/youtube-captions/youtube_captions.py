#!/usr/bin/env python3
"""
YouTube Captions Extractor — Extract subtitles/captions from YouTube videos.

Usage:
  python youtube_captions.py <url> [-o output_dir] [-l lang] [--format md|txt|json]
  python youtube_captions.py --playlist <playlist_url> [-o output_dir]
  python youtube_captions.py --search "Person Name" --max 100 -o output_dir/

Extracts existing captions (manual or auto-generated) without downloading audio.
Search mode uses YouTube Data API v3 to find top videos by view count.
Outputs clean .md files ready for /etl-universal-converter.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
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
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
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


def parse_iso8601_duration(duration_str):
    """Parse ISO 8601 duration (PT1H2M3S) into seconds."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str or "")
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


def youtube_api_get(endpoint, params, api_key):
    """Make a GET request to YouTube Data API v3."""
    params["key"] = api_key
    url = f"https://www.googleapis.com/youtube/v3/{endpoint}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_video_durations(video_ids, api_key):
    """Fetch durations for a batch of video IDs. Returns {id: seconds}."""
    durations = {}
    # API accepts max 50 IDs per request
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i : i + 50]
        data = youtube_api_get(
            "videos",
            {"part": "contentDetails", "id": ",".join(batch)},
            api_key,
        )
        for item in data.get("items", []):
            dur_str = item.get("contentDetails", {}).get("duration", "")
            durations[item["id"]] = parse_iso8601_duration(dur_str)
    return durations


def search_youtube(query, output_dir, max_results=100, api_key=None,
                   min_duration=600, lang_priority=None, output_format="md",
                   list_only=False, delay=5):
    """Search YouTube for videos and extract captions from results."""
    if not api_key:
        api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        print("ERROR: YouTube Data API key required.")
        print("  Set YOUTUBE_API_KEY env var or use --api-key flag.")
        print("  Get a key at: https://console.cloud.google.com/apis/credentials")
        sys.exit(1)

    if lang_priority is None:
        lang_priority = DEFAULT_LANG_PRIORITY

    print(f'Searching YouTube for: "{query}" (max {max_results} videos, min {min_duration}s)')

    # Phase 1: Collect video IDs via search
    video_entries = []
    page_token = None
    while len(video_entries) < max_results:
        per_page = min(50, max_results - len(video_entries))
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "viewCount",
            "maxResults": per_page,
        }
        if page_token:
            params["pageToken"] = page_token

        try:
            data = youtube_api_get("search", params, api_key)
        except urllib.error.HTTPError as e:
            print(f"ERROR: YouTube API returned {e.code}: {e.reason}")
            if e.code == 403:
                print("  Check your API key and quota at https://console.cloud.google.com/")
            sys.exit(1)

        for item in data.get("items", []):
            video_id = item.get("id", {}).get("videoId")
            title = item.get("snippet", {}).get("title", "")
            if video_id:
                video_entries.append({"id": video_id, "title": title})

        page_token = data.get("nextPageToken")
        if not page_token:
            break

    print(f"Found {len(video_entries)} videos from search.")

    # Phase 2: Filter by duration
    all_ids = [v["id"] for v in video_entries]
    durations = get_video_durations(all_ids, api_key)

    filtered = []
    skipped_short = 0
    for entry in video_entries:
        dur = durations.get(entry["id"], 0)
        if dur >= min_duration:
            filtered.append(entry)
        else:
            skipped_short += 1

    print(f"After duration filter (>= {min_duration}s): {len(filtered)} videos ({skipped_short} skipped)")

    if not filtered:
        print("No videos matched the duration filter.")
        return []

    # List-only mode: save URLs without extracting captions
    if list_only:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        urls_path = output_path / "_urls.txt"
        url_lines = []
        for entry in filtered:
            url_lines.append(f"https://www.youtube.com/watch?v={entry['id']}")
        urls_path.write_text("\n".join(url_lines) + "\n", encoding="utf-8")

        index_path = output_path / "_INDEX.md"
        index_lines = [f"# YouTube Search: {query}\n"]
        index_lines.append(f"Total: {len(filtered)} videos found (list-only mode)\n")
        index_lines.append("| # | Title | Duration | URL |")
        index_lines.append("|---|-------|----------|-----|")
        for idx, entry in enumerate(filtered, 1):
            dur = durations.get(entry["id"], 0)
            url = f"https://www.youtube.com/watch?v={entry['id']}"
            index_lines.append(f"| {idx} | {entry['title']} | {format_duration(dur)} | {url} |")
        index_path.write_text("\n".join(index_lines) + "\n", encoding="utf-8")

        print(f"\nList saved: {urls_path} ({len(filtered)} URLs)")
        print(f"Index saved: {index_path}")
        print(f"\nTo extract captions, run one at a time:")
        print(f'  python youtube_captions.py "URL" -o {output_dir}')
        print(f"\nOr use xargs for batch with delay:")
        print(f'  cat {urls_path} | xargs -I {{}} -P1 sh -c \'sleep 3 && python youtube_captions.py "{{}}" -o {output_dir}\'')
        return filtered

    # Phase 3: Extract captions
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    results = []
    skipped_no_captions = 0
    total = len(filtered)

    for i, entry in enumerate(filtered, 1):
        video_url = f"https://www.youtube.com/watch?v={entry['id']}"
        print(f"\n[{i}/{total}] {entry['title'][:60]}")

        retries = 0
        while retries < 3:
            try:
                result = extract_captions(video_url, str(output_path), lang_priority, output_format)
                if result:
                    results.append(result)
                else:
                    skipped_no_captions += 1
                break
            except Exception as e:
                if "429" in str(e) and retries < 2:
                    retries += 1
                    wait = delay * (2 ** retries)
                    print(f"  Rate limited, waiting {wait}s (retry {retries}/2)...")
                    time.sleep(wait)
                else:
                    print(f"  ERROR: {e}")
                    skipped_no_captions += 1
                    break

        # Delay between videos to avoid rate limiting
        if i < total:
            time.sleep(delay)

    # Phase 4: Generate index and manifest
    if results:
        # INDEX.md (same format as playlist)
        index_path = output_path / "_INDEX.md"
        index_lines = [f"# YouTube Search: {query}\n"]
        index_lines.append(f"Total: {len(results)}/{total} videos extracted\n")
        index_lines.append("| # | Title | Duration | Words | Language |")
        index_lines.append("|---|-------|----------|-------|----------|")
        for idx, r in enumerate(results, 1):
            fname = Path(r.get("filepath", "")).name
            index_lines.append(
                f"| {idx} | [{r['title']}]({fname}) | {r['duration']} | {r['word_count']} | {r['language']} |"
            )
        index_path.write_text("\n".join(index_lines) + "\n", encoding="utf-8")
        print(f"\nIndex saved: {index_path}")

    # _search_manifest.yaml
    total_words = sum(r.get("word_count", 0) for r in results)
    total_seconds = sum(
        sum(int(x) * m for x, m in zip(r.get("duration", "0:0:0").split(":"), [3600, 60, 1]))
        for r in results
    )
    manifest = {
        "search": {
            "query": query,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "total_found": len(video_entries),
            "total_extracted": len(results),
            "skipped_short": skipped_short,
            "skipped_no_captions": skipped_no_captions,
            "total_words": total_words,
            "duration_total": format_duration(total_seconds),
        }
    }
    manifest_path = output_path / "_search_manifest.yaml"
    # Write YAML manually to avoid pyyaml dependency
    lines = ["search:"]
    for k, v in manifest["search"].items():
        if isinstance(v, str):
            lines.append(f'  {k}: "{v}"')
        else:
            lines.append(f"  {k}: {v}")
    manifest_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Manifest saved: {manifest_path}")

    print(f"\nDone: {len(results)}/{total} videos extracted to {output_path}")
    print(f"  Words: {total_words} | Duration: {format_duration(total_seconds)}")
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
  %(prog)s --search "Naval Ravikant" --max 100 --min-duration 600 -o ~/transcripts/
  %(prog)s https://youtube.com/watch?v=xxx -l en -l pt-BR
        """,
    )
    parser.add_argument("url", nargs="?", help="YouTube video URL")
    parser.add_argument("--playlist", metavar="URL", help="YouTube playlist URL")
    parser.add_argument("--search", metavar="QUERY", help="Search YouTube for videos (requires API key)")
    parser.add_argument("--max", type=int, default=100, help="Max videos to fetch in search mode (default: 100)")
    parser.add_argument("--api-key", help="YouTube Data API v3 key (or set YOUTUBE_API_KEY env var)")
    parser.add_argument("--min-duration", type=int, default=600, help="Min video duration in seconds for search mode (default: 600 = 10min)")
    parser.add_argument("--list-only", action="store_true", help="Search mode: only list video URLs, don't extract captions")
    parser.add_argument("--delay", type=int, default=5, help="Seconds between caption extractions to avoid rate limiting (default: 5)")
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

    if not args.url and not args.playlist and not args.search:
        parser.print_help()
        sys.exit(1)

    lang_priority = args.langs if args.langs else DEFAULT_LANG_PRIORITY

    if args.search:
        search_youtube(
            args.search, args.output, max_results=args.max, api_key=args.api_key,
            min_duration=args.min_duration, lang_priority=lang_priority,
            output_format=args.format, list_only=args.list_only, delay=args.delay,
        )
    elif args.playlist:
        extract_playlist(args.playlist, args.output, lang_priority, args.format)
    elif args.url:
        result = extract_captions(args.url, args.output, lang_priority, args.format)
        if not result:
            print("No captions found.")
            sys.exit(1)


if __name__ == "__main__":
    main()
