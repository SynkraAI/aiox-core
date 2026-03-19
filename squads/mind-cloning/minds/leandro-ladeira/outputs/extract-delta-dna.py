#!/usr/bin/env python3
"""
Extract DELTA DNA from Leandro Ladeira YouTube transcripts.
Focus on patterns NOT already present in course material.
"""

import re
import os
from collections import Counter
from pathlib import Path

# Known DNA from courses (do NOT extract these again)
KNOWN_VOICE = {
    "vamos lá", "beleza", "cara", "olha que loucura", "por quê? porque",
    "entendeu", "sementes", "big idea", "big ed", "deboche", "ironia"
}

KNOWN_THINKING = {
    "m.o.e.r", "5 fases do perpétuo", "big idea framework", "stories 10x",
    "37 dispositivos", "vme", "validação pelo menor esforço",
    "sistema perpétuo", "lançamento híbrido", "13 niche playbooks",
    "google ads masterclass", "saveleads", "sales recovery"
}

def extract_voice_patterns(text):
    """Extract repeated conversational patterns"""
    patterns = {
        # Discourse markers
        "fillers": re.findall(r'\b(né|tá|tipo|assim|basicamente|literalmente)\b', text.lower()),

        # Questions/rhetorical
        "questions": re.findall(r'(quem aqui|quantos de vocês|você [^.!?]{0,30}\?|entende[^.!?]{0,20}\?)', text.lower()),

        # Metaphors
        "metaphors": re.findall(r'(é igual|é como|é tipo|parece que|é que nem)\s+[^.!?]{5,40}', text.lower()),

        # Intensifiers
        "intensifiers": re.findall(r'\b(muito louco|super|mega|absurdo|massa|show de bola|boladão)\b', text.lower()),

        # Story starters
        "story_starters": re.findall(r'(aí eu|aí a gente|teve um dia|uma vez|eu lembro)\s+[^.!?]{10,40}', text.lower()),
    }
    return patterns

def extract_thinking_patterns(text):
    """Extract frameworks, heuristics, decision patterns"""
    patterns = {
        # Numbered frameworks
        "numbered": re.findall(r'(três|3|quatro|4|cinco|5|seis|6|sete|7)\s+(passos?|fases?|etapas?|coisas?|formas?|jeitos?)[^.!?]{0,100}', text.lower()),

        # Process words
        "processes": re.findall(r'(o processo é|a lógica é|o segredo é|a chave é|o truque é)[^.!?]{10,100}', text.lower()),

        # Conditionals/heuristics
        "conditionals": re.findall(r'(se você|quando você|antes de)[^.!?]{10,80}(então|aí você|você precisa)', text.lower()),

        # Negations/warnings
        "warnings": re.findall(r'(não adianta|não tem como|não existe|nunca)[^.!?]{10,80}', text.lower()),
    }
    return patterns

def process_file(filepath):
    """Process single transcript file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip frontmatter
    if content.startswith('---'):
        content = '\n'.join(content.split('\n')[10:])

    voice = extract_voice_patterns(content)
    thinking = extract_thinking_patterns(content)

    return {
        'filename': filepath.name,
        'voice': voice,
        'thinking': thinking
    }

def main():
    transcripts_dir = Path('squads/leandro-ladeira/data/dna/youtube-transcripts')

    # Process first 14 files only (as requested)
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

    all_voice = Counter()
    all_thinking = Counter()

    results = []
    for filename in target_files:
        filepath = transcripts_dir / filename
        if filepath.exists():
            data = process_file(filepath)
            results.append(data)

            # Aggregate patterns
            for category, items in data['voice'].items():
                all_voice.update(items)

            for category, items in data['thinking'].items():
                all_thinking.update(items)

    # Output report
    print("# BATCH 1 — Delta DNA YouTube\n")

    print("## NEW VOICE PATTERNS (Top 30 by frequency)\n")
    for pattern, count in all_voice.most_common(30):
        if count >= 3:  # Only patterns that repeat 3+ times
            print(f"- **{pattern}** (appears {count}x)")

    print("\n## NEW THINKING DNA (Top 30 by frequency)\n")
    for pattern, count in all_thinking.most_common(30):
        if count >= 3:
            print(f"- **{pattern}** (appears {count}x)")

    print(f"\n## FILES PROCESSED: {len(results)}")

if __name__ == '__main__':
    main()
