#!/usr/bin/env python3
"""
Extract literal quotes and delta DNA from Leandro Ladeira YouTube transcripts.
Focus on NEW patterns not in course material.
"""

import re
from pathlib import Path
from collections import Counter

def clean_transcript(text):
    """Clean up transcript repetitions and extract unique sentences"""
    # Skip frontmatter
    if text.startswith('---'):
        lines = text.split('\n')
        text = '\n'.join(lines[10:])

    # Remove repetitions (transcripts have "word word word" patterns)
    # Keep only unique segments
    segments = []
    words = text.split()

    i = 0
    while i < len(words):
        segment = []
        j = i
        # Look for natural sentence boundaries
        while j < len(words) and j < i + 50:  # Max 50 words per segment
            segment.append(words[j])
            # Check for sentence end
            if words[j].endswith(('.', '?', '!')) or words[j] in ['né', 'tá', 'aí']:
                break
            j += 1

        segment_text = ' '.join(segment)
        if len(segment_text) > 20:  # Only meaningful segments
            segments.append(segment_text)
        i = j + 1

    return segments

def extract_delta_quotes(segments):
    """Extract quotes with new DNA patterns"""
    quotes = {
        'voice_patterns': [],
        'thinking_patterns': [],
        'stories': [],
        'metaphors': []
    }

    for seg in segments:
        seg_lower = seg.lower()

        # Voice patterns (NEW: not in existing DNA)
        if any(marker in seg_lower for marker in ['brother', 'velho', 'meu deus', 'pô']):
            quotes['voice_patterns'].append(seg[:200])

        if 'é tipo' in seg_lower or 'é igual' in seg_lower or 'é como' in seg_lower:
            quotes['metaphors'].append(seg[:200])

        # Story markers
        if any(marker in seg_lower for marker in ['aí eu', 'teve um dia', 'eu lembro', 'uma vez']):
            if len(seg) > 50:
                quotes['stories'].append(seg[:300])

        # Thinking/heuristics
        if 'o segredo é' in seg_lower or 'a lógica é' in seg_lower or 'o processo é' in seg_lower:
            quotes['thinking_patterns'].append(seg[:250])

        if 'não adianta' in seg_lower or 'não tem como' in seg_lower or 'nunca' in seg_lower:
            if len(seg) > 30:
                quotes['thinking_patterns'].append(seg[:250])

    return quotes

def process_files(filenames, transcripts_dir):
    """Process list of transcript files"""
    all_quotes = {
        'voice_patterns': Counter(),
        'thinking_patterns': Counter(),
        'stories': Counter(),
        'metaphors': Counter()
    }

    for filename in filenames:
        filepath = transcripts_dir / filename
        if not filepath.exists():
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        segments = clean_transcript(content)
        quotes = extract_delta_quotes(segments)

        # Count occurrences
        for category in all_quotes:
            all_quotes[category].update(quotes[category])

    return all_quotes

def main():
    transcripts_dir = Path('squads/leandro-ladeira/data/dna/youtube-transcripts')

    # First 14 files as requested
    target_files = [
        "18 MILHÃO NO NICHO DE POMPOARISMO - PODCAST FAIXA MARROM 113.md",
        "24 HORAS COM LEANDRO LADEIRA - A ROTINA DE QUEM VENDE MUITO.md",
        "A PRÓXIMA ONDA DO MARKETING DIGITAL - Podcast 2 Centavos 002.md",
        "AGÊNCIA DE MARKETING DIGITAL DÁ DINHEIRO - Podcast 2 Centavos 006.md",
        "COMO COMEÇAR A VENDER NO MARKETING DIGITAL DO ZERO - PrimoCast 470.md",
        "COMO DESCOBRIMOS O MARKETING DIGITAL - Podcast 2 Centavos 001.md",
        "COMO LEANDRO LADEIRA CONSEGUIU MAIS DE 200 MILHÕES - G4 Podcasts.md",
        "COMO TIAGO TCAR VAI FATURAR R100 MILHÕES - O Plano Perfeito 4.md",
        "Como CRIAR INFOPRODUTOS que vendem MILHÕES - Hotmart Fire.md",
        "Como LEANDRO LADEIRA se tornou referência no MARKETING DIGITAL - Hotmart Cast.md",
        "Como criar anúncios que vendem muito - O PODER da Mandala.md",
        "Como criar um infoproduto que vende muito - Leandro Ladeira EP56.md",
        "Como fazer a sua primeira venda em 15 minutos.md",
        "Copywriting technique that worked for 8 years - Hotmart FIRE 10 Years.md",
    ]

    quotes = process_files(target_files, transcripts_dir)

    print("# BATCH 1 — Delta DNA YouTube\n")

    print("## NEW VOICE PATTERNS\n")
    for quote, count in quotes['voice_patterns'].most_common(20):
        if count >= 2:
            print(f"**Quote ({count}x):** \"{quote}...\"\n")

    print("\n## NEW METAPHORS\n")
    for quote, count in quotes['metaphors'].most_common(15):
        if count >= 2:
            print(f"**Metaphor ({count}x):** \"{quote}...\"\n")

    print("\n## NEW THINKING DNA\n")
    for quote, count in quotes['thinking_patterns'].most_common(20):
        if count >= 2:
            print(f"**Heuristic ({count}x):** \"{quote}...\"\n")

    print("\n## STORIES (Top 10)\n")
    for quote, count in quotes['stories'].most_common(10):
        if count >= 2:
            print(f"**Story ({count}x):** \"{quote}...\"\n")

if __name__ == '__main__':
    main()
