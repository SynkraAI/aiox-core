#!/usr/bin/env python3
"""Source credibility scoring by domain patterns.

Worker atom: atm_pattern_match (partially)
Deterministic: regex-based scoring, no LLM needed.

Usage:
    python credibility_scorer.py "https://docs.python.org/3/tutorial"
    python credibility_scorer.py --batch '["url1","url2"]'
    echo '{"url":"...","title":"..."}' | python credibility_scorer.py --stdin
"""

import re
import sys
import json
from typing import Optional

CREDIBILITY_RULES = {
    "high": {
        "patterns": [
            r"docs\.[a-z0-9-]+\.(com|org|io|dev)",
            r"[a-z0-9-]+\.dev/",
            r"developer\.[a-z0-9-]+\.com",
            r"arxiv\.org",
            r"github\.com/.+/README",
            r"github\.com/[^/]+/[^/]+/?$",
            r"engineering\.[a-z0-9-]+\.com",
            r"\.edu/",
            r"nature\.com/",
            r"acm\.org/",
            r"ieee\.org/",
            r"openreview\.net/",
            r"aclanthology\.org/",
            r"frontiersin\.org/",
        ],
        "multiplier": 1.3,
        "label": "HIGH",
    },
    "medium": {
        "patterns": [
            r"github\.com/.+/issues/",
            r"stackoverflow\.com/questions/",
            r"dev\.to/",
            r"medium\.com/@[a-zA-Z]",
            r"hashnode\.dev/",
            r"npmjs\.com/package/",
            r"pypi\.org/project/",
            r"hackernoon\.com/",
            r"freecodecamp\.org/",
        ],
        "multiplier": 1.0,
        "label": "MEDIUM",
    },
    "low": {
        "patterns": [
            r"(best|top|ultimate|amazing).*\d",
            r"medium\.com/[^@]",
            r"(sponsored|partner|affiliate)",
        ],
        "multiplier": 0.7,
        "label": "LOW",
    },
}

RED_FLAGS = {
    "no_author": -0.2,
    "no_date": -0.1,
    "paywall": -0.3,
    "outdated": -0.3,
    "sponsored": -0.2,
}


def score_credibility(
    url: str,
    title: str = "",
    date: Optional[str] = None,
    has_author: bool = True,
) -> dict:
    """Score URL credibility based on domain patterns and metadata."""
    for level, config in CREDIBILITY_RULES.items():
        for pattern in config["patterns"]:
            if re.search(pattern, url, re.IGNORECASE):
                multiplier = config["multiplier"]

                flags_applied = []
                if not has_author:
                    multiplier += RED_FLAGS["no_author"]
                    flags_applied.append("no_author")
                if date is None:
                    multiplier += RED_FLAGS["no_date"]
                    flags_applied.append("no_date")
                if title and "sponsored" in title.lower():
                    multiplier += RED_FLAGS["sponsored"]
                    flags_applied.append("sponsored")

                return {
                    "url": url,
                    "credibility": config["label"],
                    "multiplier": round(max(0.4, multiplier), 2),
                    "flags": flags_applied,
                }

    return {
        "url": url,
        "credibility": "MEDIUM",
        "multiplier": 1.0,
        "flags": [],
    }


def score_batch(sources: list[dict]) -> list[dict]:
    """Score a batch of sources."""
    results = []
    for source in sources:
        result = score_credibility(
            url=source.get("url", ""),
            title=source.get("title", ""),
            date=source.get("pub_date"),
            has_author=source.get("has_author", True),
        )
        results.append(result)
    return results


def summarize(results: list[dict]) -> dict:
    """Summarize credibility breakdown."""
    counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    total_multiplier = 0.0
    for r in results:
        counts[r["credibility"]] += 1
        total_multiplier += r["multiplier"]

    return {
        "high": counts["HIGH"],
        "medium": counts["MEDIUM"],
        "low": counts["LOW"],
        "total": len(results),
        "average_multiplier": round(total_multiplier / max(len(results), 1), 2),
    }


def main():
    if len(sys.argv) < 2 and not sys.stdin.isatty():
        data = json.loads(sys.stdin.read())
        if isinstance(data, list):
            results = score_batch(data)
        else:
            results = [score_credibility(
                url=data.get("url", ""),
                title=data.get("title", ""),
                date=data.get("pub_date"),
            )]
        output = {"results": results, "summary": summarize(results)}
        print(json.dumps(output, indent=2))
        return

    if len(sys.argv) < 2:
        print("Usage: credibility_scorer.py <url> | --batch '<json>' | --stdin", file=sys.stderr)
        sys.exit(1)

    if sys.argv[1] == "--batch":
        sources = json.loads(sys.argv[2])
        results = score_batch(sources)
        output = {"results": results, "summary": summarize(results)}
        print(json.dumps(output, indent=2))
    else:
        result = score_credibility(sys.argv[1])
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
