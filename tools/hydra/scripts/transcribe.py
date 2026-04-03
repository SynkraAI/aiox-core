#!/usr/bin/env python3
"""
HYDRA Transcription Script — faster-whisper backend.

Uses CTranslate2 (via faster-whisper) instead of torch-based openai-whisper.
~4x less memory, ~4x faster, same quality.

Usage:
    python scripts/transcribe.py <audio_file> [model] [output_dir]

Arguments:
    audio_file  - Path to audio file (mp3, wav, etc.)
    model       - Whisper model name (default: small). Options: tiny, base, small, medium, large-v2
    output_dir  - Directory for output .txt file (default: same dir as audio file)

Output:
    Creates <basename>.txt in output_dir with the full transcription text.
    Exits with code 0 on success, 1 on failure.
"""

import sys
import os

# Limit MKL/OpenMP thread memory allocation to prevent OOM errors
os.environ.setdefault('MKL_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')

# Force HuggingFace cache to D: drive (C: has insufficient space)
os.environ.setdefault("HF_HOME", "D:\\cache\\huggingface")
os.environ.setdefault("HF_HUB_CACHE", "D:\\cache\\huggingface\\hub")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")


def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <audio_file> [model] [output_dir]", file=sys.stderr)
        sys.exit(1)

    audio_path = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else "small"
    output_dir = sys.argv[3] if len(sys.argv) > 3 else os.path.dirname(audio_path) or "."

    if not os.path.isfile(audio_path):
        print(f"Error: audio file not found: {audio_path}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            "Error: faster-whisper not installed. Run: pip install faster-whisper",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        # CPU + int8 for minimal memory footprint (no CUDA/torch dependency)
        # Use 'tiny' as fallback if 'small' fails due to memory
        try:
            model = WhisperModel(model_name, device="cpu", compute_type="int8")
            segments, info = model.transcribe(audio_path, beam_size=1)
        except (MemoryError, Exception) as mem_err:
            if model_name != "tiny":
                print(f"Model '{model_name}' failed ({mem_err}), falling back to 'tiny'...", file=sys.stderr)
                model = WhisperModel("tiny", device="cpu", compute_type="int8")
                segments, info = model.transcribe(audio_path, beam_size=1)
            else:
                raise

        # Collect all segments into full text
        text_parts = []
        for segment in segments:
            text_parts.append(segment.text.strip())

        text = " ".join(text_parts)

        if not text.strip():
            print("Warning: transcription produced empty text", file=sys.stderr)
            sys.exit(1)

        # Write output file
        base = os.path.splitext(os.path.basename(audio_path))[0]
        out_path = os.path.join(output_dir, f"{base}.txt")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"Transcribed: {out_path} ({len(text)} chars, lang={info.language})")

    except Exception as e:
        print(f"Transcription error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
