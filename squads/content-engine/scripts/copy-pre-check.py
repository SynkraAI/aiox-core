#!/usr/bin/env python3
"""
Worker: copy-pre-check.py
Pre-check determinístico para tasks de copy (textstat + LeIA).

Serve 7 tasks: create-headline, write-ad, write-sales-page, write-vsl,
               write-email-sequence, write-landing-page, write-post

Usa LeIA (léxico PT-BR adaptado do VADER) para análise de sentimento.
API idêntica ao VADER, mas com léxico nativo em português.

Uso:
  # Análise simples (texto via stdin)
  echo "Seu texto aqui" | python3 copy-pre-check.py --section hook --task write-post

  # Análise com JSON estruturado (múltiplas seções)
  python3 copy-pre-check.py --json input.json

  # Apenas uma seção com thresholds custom
  python3 copy-pre-check.py --section headline --flesch-min 60 --sentence-max 12 <<< "Texto"

Deps: pip install textstat leia-br

Exit codes:
  0 = Todas seções OK
  1 = Pelo menos 1 ALERTA
  2 = Erro de input/dependência
"""

import sys
import json
import argparse
from typing import Any

try:
    import textstat
except ImportError:
    print("ERRO: pip install textstat", file=sys.stderr)
    sys.exit(2)

try:
    from LeIA import SentimentIntensityAnalyzer
except ImportError:
    print("ERRO: pip install leia-br", file=sys.stderr)
    sys.exit(2)

# ─────────────────────────────────────────────────────────────────────────────
# Thresholds por task x seção (extraídos das 7 tasks do content-engine)
# ─────────────────────────────────────────────────────────────────────────────

TASK_THRESHOLDS: dict[str, dict[str, dict[str, Any]]] = {
    "create-headline": {
        "headline": {
            "flesch_min": 60,
            "avg_sentence_max": 12,
            "sentiment_compound_abs_min": 0.3,  # headline precisa de carga emocional
        },
    },
    "write-ad": {
        "hook": {
            "flesch_min": 65,
            "avg_sentence_max": 10,
            "sentiment_compound_abs_min": 0.3,
        },
        "body": {
            "flesch_min": 65,
            "avg_sentence_max": 10,
        },
        "cta": {
            "flesch_min": 65,
            "sentiment_compound_min": 0.1,
        },
    },
    "write-sales-page": {
        "headline": {"flesch_min": 55, "sentiment_compound_abs_min": 0.3},
        "lead": {"flesch_min": 50, "sentiment_compound_max": -0.1},
        "problem": {"sentiment_compound_max": -0.2, "avg_sentence_max": 15},
        "mechanism": {"sentiment_compound_min": -0.1, "sentiment_compound_max": 0.3},
        "offer": {"flesch_min": 55, "sentiment_compound_min": 0.1},
        "cta": {"flesch_min": 60, "sentiment_compound_min": 0.2},
        "ps": {"sentiment_compound_abs_min": 0.2},
    },
    "write-vsl": {
        "pattern-interrupt": {"flesch_min": 65, "sentiment_compound_abs_min": 0.4},
        "problem": {"flesch_min": 60, "sentiment_compound_max": -0.2},
        "mechanism": {"sentiment_compound_min": 0.0, "sentiment_compound_max": 0.3, "avg_sentence_max": 15},
        "credibility": {"flesch_min": 55, "sentiment_compound_min": 0.1},
        "offer": {"flesch_min": 60, "sentiment_compound_min": 0.2},
        "urgency": {"flesch_min": 60, "sentiment_compound_max": -0.1},
        "cta": {"flesch_min": 65, "sentiment_compound_min": 0.2},
        "full": {"flesch_min": 60},
    },
    "write-email-sequence": {
        "subject": {"char_max": 50, "sentiment_compound_abs_min": 0.2},
        "email-1-welcome": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_min": 0.1, "sentiment_compound_max": 0.4},
        "email-2-story": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_min": -0.2, "sentiment_compound_max": 0.2},
        "email-3-value": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_min": 0.1},
        "email-4-problem": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_max": -0.2},
        "email-5-mechanism": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_min": 0.0, "sentiment_compound_max": 0.3},
        "email-6-proof": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_min": 0.2},
        "email-7-offer": {"flesch_min": 55, "avg_sentence_max": 15, "sentiment_compound_min": 0.1},
    },
    "write-landing-page": {
        "hero": {"flesch_min": 60, "sentiment_compound_abs_min": 0.3},
        "problem": {"flesch_min": 55, "sentiment_compound_max": -0.1},
        "solution": {"flesch_min": 55, "sentiment_compound_min": 0.1, "avg_sentence_max": 15},
        "proof": {"flesch_min": 55, "sentiment_compound_min": 0.2},
        "cta": {"flesch_min": 65, "sentiment_compound_min": 0.2},
        "full": {"flesch_min": 55, "reading_time_max": 180},
    },
    "write-post": {
        "hook": {
            "sentiment_compound_abs_min": 0.3,
            "sentiment_neu_max": 0.8,
        },
        "full": {
            "flesch_min": 60,
            "avg_sentence_max": 12,
        },
        "cta": {
            "sentiment_compound_min": 0.1,
        },
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# Análise
# ─────────────────────────────────────────────────────────────────────────────

analyzer = SentimentIntensityAnalyzer()


def analyze_section(text: str, section: str, thresholds: dict[str, Any]) -> dict[str, Any]:
    """Analisa uma seção de texto contra thresholds específicos."""
    if not text or not text.strip():
        return {
            "section": section,
            "status": "ERRO",
            "alerts": ["Texto vazio"],
            "metrics": {},
        }

    # Métricas base
    flesch = textstat.flesch_reading_ease(text)
    avg_sentence = textstat.avg_sentence_length(text)
    char_count = len(text)
    word_count = textstat.lexicon_count(text)
    reading_time = textstat.reading_time(text)
    sentiment = analyzer.polarity_scores(text)

    metrics = {
        "flesch": round(flesch, 1),
        "avg_sentence_length": round(avg_sentence, 1),
        "char_count": char_count,
        "word_count": word_count,
        "reading_time_sec": round(reading_time, 1),
        "sentiment_compound": round(sentiment["compound"], 3),
        "sentiment_pos": round(sentiment["pos"], 3),
        "sentiment_neg": round(sentiment["neg"], 3),
        "sentiment_neu": round(sentiment["neu"], 3),
    }

    alerts: list[str] = []

    # Aplicar thresholds
    if "flesch_min" in thresholds and flesch < thresholds["flesch_min"]:
        alerts.append(f"Flesch {flesch:.0f} < {thresholds['flesch_min']} (texto complexo demais)")

    if "avg_sentence_max" in thresholds and avg_sentence > thresholds["avg_sentence_max"]:
        alerts.append(f"Avg sentence {avg_sentence:.1f} > {thresholds['avg_sentence_max']} palavras")

    if "char_max" in thresholds and char_count > thresholds["char_max"]:
        alerts.append(f"Chars {char_count} > {thresholds['char_max']}")

    if "reading_time_max" in thresholds and reading_time > thresholds["reading_time_max"]:
        alerts.append(f"Reading time {reading_time:.0f}s > {thresholds['reading_time_max']}s")

    # Sentiment compound — mínimo (valor positivo esperado)
    if "sentiment_compound_min" in thresholds and sentiment["compound"] < thresholds["sentiment_compound_min"]:
        alerts.append(
            f"Sentiment compound {sentiment['compound']:.3f} < {thresholds['sentiment_compound_min']} "
            f"(tom insuficiente)"
        )

    # Sentiment compound — máximo (valor negativo esperado, ex: seção de dor)
    if "sentiment_compound_max" in thresholds and sentiment["compound"] > thresholds["sentiment_compound_max"]:
        alerts.append(
            f"Sentiment compound {sentiment['compound']:.3f} > {thresholds['sentiment_compound_max']} "
            f"(deveria ser mais negativo/tenso)"
        )

    # Sentiment compound — valor absoluto mínimo (carga emocional)
    if "sentiment_compound_abs_min" in thresholds and abs(sentiment["compound"]) < thresholds["sentiment_compound_abs_min"]:
        alerts.append(
            f"Sentiment |compound| {abs(sentiment['compound']):.3f} < {thresholds['sentiment_compound_abs_min']} "
            f"(sem carga emocional suficiente)"
        )

    # Sentiment neutro — máximo (hook não pode ser neutro)
    if "sentiment_neu_max" in thresholds and sentiment["neu"] > thresholds["sentiment_neu_max"]:
        alerts.append(
            f"Sentiment neu {sentiment['neu']:.3f} > {thresholds['sentiment_neu_max']} "
            f"(texto neutro demais = invisível)"
        )

    return {
        "section": section,
        "status": "OK" if not alerts else "ALERTA",
        "alerts": alerts,
        "metrics": metrics,
    }


def analyze_task(task: str, sections: dict[str, str], custom_thresholds: dict | None = None) -> dict[str, Any]:
    """Analisa todas as seções de uma task."""
    task_cfg = TASK_THRESHOLDS.get(task, {})
    results: list[dict] = []
    has_alerts = False
    has_errors = False

    if not sections:
        return {
            "task": task,
            "sections_analyzed": 0,
            "overall_status": "ERRO",
            "results": [{"section": "(nenhuma)", "status": "ERRO", "alerts": ["Nenhuma seção fornecida"], "metrics": {}}],
        }

    for section_name, text in sections.items():
        # Prioridade: custom > task config > defaults básicos
        thresholds = {}
        if section_name in task_cfg:
            thresholds.update(task_cfg[section_name])
        if custom_thresholds and section_name in custom_thresholds:
            thresholds.update(custom_thresholds[section_name])

        # Default mínimo se nenhum threshold definido
        if not thresholds:
            thresholds = {"flesch_min": 50, "avg_sentence_max": 20}

        result = analyze_section(text, section_name, thresholds)
        results.append(result)
        if result["status"] == "ERRO":
            has_errors = True
        elif result["status"] != "OK":
            has_alerts = True

    overall = "ERRO" if has_errors else ("ALERTA" if has_alerts else "OK")
    return {
        "task": task,
        "sections_analyzed": len(results),
        "overall_status": overall,
        "results": results,
    }


def format_table(report: dict[str, Any]) -> str:
    """Formata resultado como tabela markdown."""
    lines = [
        f"## Pre-Check: {report['task']}",
        f"**Status geral:** {report['overall_status']}",
        "",
        "| Seção | Flesch | Avg Sent | Sentiment | Status | Alertas |",
        "|-------|--------|----------|-----------|--------|---------|",
    ]
    for r in report["results"]:
        m = r["metrics"]
        if not m:
            lines.append(f"| {r['section']} | — | — | — | {r['status']} | {'; '.join(r['alerts'])} |")
            continue
        alerts_str = "; ".join(r["alerts"]) if r["alerts"] else "—"
        lines.append(
            f"| {r['section']} "
            f"| {m['flesch']} "
            f"| {m['avg_sentence_length']} "
            f"| {m['sentiment_compound']} "
            f"| {r['status']} "
            f"| {alerts_str} |"
        )
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Pre-check determinístico para copy (textstat + LeIA)"
    )
    parser.add_argument("--task", default="generic", help="Nome da task (ex: write-post, write-ad)")
    parser.add_argument("--section", default="full", help="Nome da seção (ex: hook, cta, headline)")
    parser.add_argument("--json", type=str, help="Arquivo JSON com múltiplas seções")
    parser.add_argument("--flesch-min", type=float, help="Override: Flesch mínimo")
    parser.add_argument("--sentence-max", type=float, help="Override: avg sentence máximo")
    parser.add_argument("--format", choices=["json", "table"], default="json", help="Formato de saída")

    args = parser.parse_args()

    if args.json:
        # Modo batch: JSON com {task, sections: {name: text}, thresholds?}
        with open(args.json, encoding="utf-8") as f:
            data = json.load(f)
        task = data.get("task", args.task)
        sections = data.get("sections", {})
        custom = data.get("thresholds", None)
        report = analyze_task(task, sections, custom)
    else:
        # Modo simples: texto via stdin
        text = sys.stdin.read().strip()
        if not text:
            print("ERRO: nenhum texto fornecido via stdin", file=sys.stderr)
            sys.exit(2)

        custom_thresholds = None
        if args.flesch_min or args.sentence_max:
            overrides: dict[str, Any] = {}
            if args.flesch_min:
                overrides["flesch_min"] = args.flesch_min
            if args.sentence_max:
                overrides["avg_sentence_max"] = args.sentence_max
            custom_thresholds = {args.section: overrides}

        report = analyze_task(args.task, {args.section: text}, custom_thresholds)

    if args.format == "table":
        print(format_table(report))
    else:
        print(json.dumps(report, indent=2, ensure_ascii=False))

    # Exit code baseado no status
    if report["overall_status"] == "ERRO":
        sys.exit(2)
    elif report["overall_status"] == "ALERTA":
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
