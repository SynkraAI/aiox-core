#!/usr/bin/env python3
"""AIOS Transcriber — Unified media transcription tool.

Routes transcription to the fastest available path:
- YouTube URLs → caption extraction (seconds, no download)
- Local files → API transcription (Deepgram) or local Whisper
- Hotmart/Cademi → download + transcription

Usage:
  aios-transcriber youtube <url> [-o dir]
  aios-transcriber local <file> [-o dir] [--engine deepgram|whisper]
  aios-transcriber batch <directory> [-o dir]
  aios-transcriber hotmart <url> [-o dir] [--audio-only]
  aios-transcriber cademi <url> [-o dir] [--audio-only]
"""

import argparse
import logging
import subprocess
import sys
import time
from pathlib import Path

# Configure logging
logging.basicConfig(
    format='%(asctime)s [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    level=logging.INFO,
)
logger = logging.getLogger('aios-transcriber')

# Add lib to path
sys.path.insert(0, str(Path(__file__).parent))

from lib import audio as audio_mod
from lib import formatter
from lib.state import TranscriptionState
from lib.youtube import transcribe_youtube


def _ask_engine():
    """Ask user which engine to use when not specified via CLI."""
    print('\nWhich transcription engine?')
    print('  1. Deepgram API  — fast (~15s/hour), paid (~$0.0043/min)')
    print('  2. Whisper local — slower, free, requires GPU/CPU')
    print()

    while True:
        choice = input('Choose [1/2] (default: 1): ').strip()
        if choice in ('', '1'):
            return 'deepgram'
        elif choice == '2':
            return 'whisper'
        print('  Invalid choice. Type 1 or 2.')


def cmd_youtube(args):
    """Handle YouTube transcription (fast path)."""
    is_playlist = bool(args.playlist)
    url = args.playlist if is_playlist else args.input

    if not url:
        print('ERROR: URL required. Use: aios-transcriber youtube <url>')
        return 1

    lang_priority = args.langs if args.langs else None
    success = transcribe_youtube(url, args.output, lang_priority, is_playlist)
    return 0 if success else 1


def cmd_local(args):
    """Handle local file transcription."""
    file_path = Path(args.input)

    if not file_path.exists():
        print(f'ERROR: File not found: {file_path}')
        return 1

    if not audio_mod.is_audio_file(file_path):
        print(f'WARNING: {file_path.suffix} may not be a supported audio/video format')

    # Ask engine if not specified via CLI
    if not args.engine:
        args.engine = _ask_engine()

    engine = _create_engine(args)
    compress = not args.no_compress

    print(f'Transcribing: {file_path.name}')
    print(f'  Engine: {engine.engine_name}')

    start = time.time()
    try:
        result = engine.transcribe_file(file_path, compress=compress, bitrate=args.bitrate)
    except Exception as e:
        print(f'ERROR: {e}')
        return 1

    elapsed = time.time() - start

    # Build data for formatter
    source_type = 'whisper_local' if args.engine == 'whisper' else 'deepgram_api'
    data = {
        'title': file_path.stem.replace('-', ' ').replace('_', ' ').title(),
        'source': str(file_path),
        'source_type': source_type,
        'engine': result['engine'],
        'language': result['language'],
        'duration': formatter.format_duration(result['duration_seconds']),
        'text': result['text'],
        'word_count': len(result['text'].split()),
    }

    output_path = formatter.save_markdown(data, args.output)
    print(f'  Saved: {output_path} ({data["word_count"]} words, {elapsed:.1f}s)')
    return 0


def cmd_batch(args):
    """Handle batch transcription of a directory."""
    batch_dir = Path(args.input)

    if not batch_dir.exists() or not batch_dir.is_dir():
        print(f'ERROR: Directory not found: {batch_dir}')
        return 1

    # Find all audio/video files recursively
    files = sorted([
        f for f in batch_dir.rglob('*')
        if f.is_file() and audio_mod.is_audio_file(f)
    ])

    if not files:
        print(f'ERROR: No audio/video files found in {batch_dir}')
        return 1

    # Ask engine if not specified via CLI
    if not args.engine:
        args.engine = _ask_engine()

    # Initialize state for resume
    output_dir = Path(args.output)
    state = TranscriptionState(output_dir)
    state.set_engine(args.engine)

    # Filter already completed
    pending = [f for f in files if not state.is_completed(str(f))]
    skipped = len(files) - len(pending)

    if skipped > 0:
        print(f'Resuming: {skipped} already completed, {len(pending)} remaining')

    if not pending:
        print('All files already transcribed. Delete .transcription-state.json to re-process.')
        return 0

    print(f'Batch: {len(pending)} files to transcribe ({args.engine})')

    engine = _create_engine(args)
    compress = not args.no_compress
    errors = 0

    source_type = 'whisper_local' if args.engine == 'whisper' else 'deepgram_api'

    for i, file_path in enumerate(pending, 1):
        print(f'\n[{i}/{len(pending)}] {file_path.name}')
        start = time.time()

        try:
            result = engine.transcribe_file(file_path, compress=compress, bitrate=args.bitrate)

            data = {
                'title': file_path.stem.replace('-', ' ').replace('_', ' ').title(),
                'source': str(file_path),
                'source_type': source_type,
                'engine': result['engine'],
                'language': result['language'],
                'duration': formatter.format_duration(result['duration_seconds']),
                'text': result['text'],
                'word_count': len(result['text'].split()),
            }

            # Determine output subdirectory (preserve relative structure)
            try:
                rel_path = file_path.relative_to(batch_dir)
                sub_dir = output_dir / rel_path.parent
            except ValueError:
                sub_dir = output_dir

            saved_path = formatter.save_markdown(data, sub_dir)
            elapsed = time.time() - start

            state.mark_completed(str(file_path), str(saved_path), args.engine, result.get('duration_seconds', 0))
            print(f'  Saved: {saved_path} ({data["word_count"]} words, {elapsed:.1f}s)')

        except KeyboardInterrupt:
            print('\n\nInterrupted. Progress saved. Run again to resume.')
            return 130
        except Exception as e:
            errors += 1
            state.mark_failed(str(file_path), str(e))
            print(f'  ERROR: {e}')

    # Summary
    summary = state.summary()
    print(f'\n--- Batch Complete ---')
    print(f'  Completed: {summary["completed"]}')
    print(f'  Failed: {summary["failed"]}')
    if errors:
        print(f'  Errors in this run: {errors}')

    return 1 if errors > 0 else 0


def cmd_download_and_transcribe(args, platform):
    """Handle download + transcribe for Hotmart/Cademi."""
    url = args.input
    if not url:
        print(f'ERROR: URL required. Use: aios-transcriber {platform} <url>')
        return 1

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Determine downloader CLI
    aios_root = Path(__file__).parent.parent.parent
    if platform == 'hotmart':
        cli_path = aios_root / 'tools' / 'hotmart-downloader' / '.venv' / 'bin' / 'hotmart-dl'
        download_cmd = [str(cli_path), 'download', '-c', url, '-o', str(output_dir)]
        if args.audio_only:
            download_cmd.append('--audio-only')
    elif platform == 'cademi':
        cli_path = aios_root / 'tools' / 'cademi-downloader' / '.venv' / 'bin' / 'cademi-dl'
        download_cmd = [str(cli_path), 'download', '-c', url, '-o', str(output_dir)]
        if args.audio_only:
            download_cmd.append('--audio-only')
    else:
        print(f'ERROR: Unknown platform: {platform}')
        return 1

    if not cli_path.exists():
        print(f'ERROR: {platform} downloader not found at {cli_path}')
        print(f'  Install it first in tools/{platform}-downloader/')
        return 1

    # Step 1: Download
    print(f'Step 1: Downloading from {platform}...')
    result = subprocess.run(download_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        from lib.exceptions import DownloadFailedError
        raise DownloadFailedError(platform, result.stderr)

    # Step 2: Transcribe downloaded files
    print(f'\nStep 2: Transcribing downloaded files...')
    args.input = str(output_dir)
    return cmd_batch(args)


def _create_engine(args):
    """Create the appropriate transcription engine."""
    if args.engine == 'whisper':
        from lib.whisper_engine import WhisperEngine
        return WhisperEngine(language=args.language, model=args.whisper_model)
    else:
        from lib.deepgram_engine import DeepgramEngine
        return DeepgramEngine(language=args.language, workers=args.workers)


def main():
    parser = argparse.ArgumentParser(
        prog='aios-transcriber',
        description='AIOS Transcriber — Unified media transcription tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Commands:
  youtube    Extract YouTube captions (fast, no download)
  local      Transcribe local audio/video file
  batch      Batch process a directory
  hotmart    Download from Hotmart + transcribe
  cademi     Download from Cademi + transcribe

Examples:
  %(prog)s youtube "https://youtube.com/watch?v=xxx" -o ~/output/
  %(prog)s local ~/video.mp4 -o ~/output/
  %(prog)s local ~/video.mp4 -o ~/output/ --engine whisper
  %(prog)s batch ~/Downloads/curso/ -o ~/output/
  %(prog)s hotmart "URL" -o ~/output/ --audio-only
        """,
    )

    # Common flags
    parser.add_argument('command', choices=['youtube', 'local', 'batch', 'hotmart', 'cademi'],
                        help='Transcription command')
    parser.add_argument('input', nargs='?', help='URL, file path, or directory')
    parser.add_argument('-o', '--output', default='.', help='Output directory (default: current)')
    parser.add_argument('--engine', choices=['deepgram', 'whisper'], default=None,
                        help='Transcription engine. If not specified, will ask interactively.')
    parser.add_argument('--language', default='pt-BR', help='Language code (default: pt-BR)')
    parser.add_argument('--workers', type=int, default=3,
                        help='Parallel workers for Deepgram (default: 3)')
    parser.add_argument('--no-compress', action='store_true',
                        help='Skip audio compression before upload')
    parser.add_argument('--bitrate', default='64k',
                        help='Compression bitrate (default: 64k)')
    parser.add_argument('--whisper-model', default='medium',
                        help='Whisper model size: tiny, base, small, medium, large (default: medium)')

    # YouTube-specific
    parser.add_argument('--playlist', metavar='URL',
                        help='YouTube playlist URL (use with youtube command)')
    parser.add_argument('-l', '--lang', action='append', dest='langs',
                        help='Language priority for YouTube captions (repeatable)')

    # Download-specific
    parser.add_argument('--audio-only', action='store_true', default=True,
                        help='Download audio only, skip video (default: True)')
    parser.add_argument('--with-video', action='store_true',
                        help='Download full video (overrides --audio-only)')

    args = parser.parse_args()

    # --with-video overrides --audio-only
    if args.with_video:
        args.audio_only = False

    # Route to command handler
    if args.command == 'youtube':
        return cmd_youtube(args)
    elif args.command == 'local':
        if not args.input:
            print('ERROR: File path required. Use: aios-transcriber local <file>')
            return 1
        return cmd_local(args)
    elif args.command == 'batch':
        if not args.input:
            print('ERROR: Directory required. Use: aios-transcriber batch <directory>')
            return 1
        return cmd_batch(args)
    elif args.command in ('hotmart', 'cademi'):
        return cmd_download_and_transcribe(args, args.command)

    return 1


if __name__ == '__main__':
    sys.exit(main())
