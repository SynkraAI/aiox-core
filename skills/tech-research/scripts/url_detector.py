#!/usr/bin/env python3
"""URL type detection and ID extraction for tech-research pipeline.

Worker atom: atm_classify_urls, atm_parse_query
Deterministic: same input = same output. Zero LLM needed.

Usage:
    python url_detector.py "https://youtube.com/watch?v=abc123"
    python url_detector.py --batch urls.txt
    echo '["url1","url2"]' | python url_detector.py --stdin
"""

import re
import sys
import json
from typing import Optional

URL_PATTERNS = {
    "youtube": [
        r"(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})",
    ],
    "github_repo": [
        r"github\.com/([^/]+)/([^/\s?#]+)(?:/|$|\?|#)",
    ],
    "github_issue": [
        r"github\.com/([^/]+)/([^/]+)/issues/(\d+)",
    ],
    "arxiv": [
        r"arxiv\.org/(?:abs|html|pdf)/(\d+\.\d+)",
    ],
    "stackoverflow": [
        r"stackoverflow\.com/questions/(\d+)",
    ],
    "official_docs": [
        r"docs\.([a-z0-9-]+)\.",
        r"([a-z0-9-]+)\.dev/",
        r"developer\.([a-z0-9-]+)\.",
    ],
    "npm": [
        r"npmjs\.com/package/([^/\s?#]+)",
    ],
    "pypi": [
        r"pypi\.org/project/([^/\s?#]+)",
    ],
    "medium": [
        r"medium\.com/@([^/\s?#]+)",
    ],
    "devto": [
        r"dev\.to/([^/\s?#]+)",
    ],
}

BLOG_DOMAINS = [
    r"dev\.to/",
    r"medium\.com/",
    r"hashnode\.dev/",
    r"hackernoon\.com/",
    r"freecodecamp\.org/news/",
    r"marktechpost\.com/",
    r"blog\.",
    r"\.blog\.",
]


def detect_url_type(url: str) -> dict:
    """Detect URL type and extract relevant IDs."""
    result = {"url": url, "type": "generic", "ids": {}}

    for url_type, patterns in URL_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                result["type"] = url_type
                result["ids"] = {
                    f"id_{i}": g for i, g in enumerate(match.groups())
                }
                return result

    for pattern in BLOG_DOMAINS:
        if re.search(pattern, url, re.IGNORECASE):
            result["type"] = "blog"
            return result

    return result


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL."""
    result = detect_url_type(url)
    if result["type"] == "youtube":
        return result["ids"].get("id_0")
    return None


def classify_urls(urls: list[str]) -> list[dict]:
    """Classify a list of URLs by type."""
    return [detect_url_type(url) for url in urls]


def main():
    if len(sys.argv) < 2 and not sys.stdin.isatty():
        urls = json.loads(sys.stdin.read())
        results = classify_urls(urls)
        print(json.dumps(results, indent=2))
        return

    if len(sys.argv) < 2:
        print("Usage: url_detector.py <url> | --batch <file> | --stdin", file=sys.stderr)
        sys.exit(1)

    if sys.argv[1] == "--batch":
        with open(sys.argv[2]) as f:
            urls = [line.strip() for line in f if line.strip()]
        results = classify_urls(urls)
        print(json.dumps(results, indent=2))
    elif sys.argv[1] == "--stdin":
        urls = json.loads(sys.stdin.read())
        results = classify_urls(urls)
        print(json.dumps(results, indent=2))
    else:
        result = detect_url_type(sys.argv[1])
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
