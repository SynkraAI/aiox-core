#!/usr/bin/env python3
"""Research output scaffolding — creates folder structure and stub files.

Worker atom: atm_scaffold_output
Deterministic: same input = same structure. Zero LLM needed.

Ensures every research output starts with identical structure,
regardless of which model or session executes the pipeline.

Usage:
    python3 scaffold.py --slug "openrouter-best-models" --title "Best Models OpenRouter" --query "..."
    python3 scaffold.py --slug "ai-grants-gap" --title "AI Grants Gap" --query "..." --date 2026-03-28
    echo '{"slug":"...","title":"...","query":"..."}' | python3 scaffold.py --stdin
"""

import os
import sys
import json
from datetime import datetime

BASE_DIR = "docs/research"


def generate_readme(title: str, date: str) -> str:
    return f"""# Research: {title}

> **Data:** {date}
> **Tópico:** {title}
> **Status:** Em andamento

---

## TL;DR

{{A ser preenchido após síntese}}

---

## Research Metadata

```yaml
coverage_score: 0
coverage_breakdown:
  fundamentals: 0
  implementation: 0
  comparison: 0
  best_practices: 0
  real_world: 0
  current_state: 0
integrity_score: N/A
sources:
  total: 0
  high_credibility: 0
  medium_credibility: 0
  with_dates: 0
  freshness_ratio: 0%
waves: 0
```

---

## Índice

| # | Arquivo | Descrição |
|---|---------|-----------|
| 00 | [query-original.md](./00-query-original.md) | Pergunta inicial e contexto |
| 02 | [research-report.md](./02-research-report.md) | Relatório completo |
| 03 | [recommendations.md](./03-recommendations.md) | Recomendações finais |

---

## Referências Principais

{{A ser preenchido após pesquisa}}
"""


def generate_query(query: str, date: str) -> str:
    return f"""# Query Original

> **Data:** {date}

## Pergunta Original

> "{query}"

## Contexto Inferido

- **Foco:** {{a ser preenchido}}
- **Tecnologias:** {{a ser preenchido}}
- **Temporal:** {{a ser preenchido}}

## Sub-Queries Decompostas

{{A ser preenchido após decomposição}}
"""


def generate_report_stub(title: str, date: str) -> str:
    return f"""# {title}

> **Relatório de Pesquisa** | {date}
> **Coverage:** 0/100 | **Sources:** 0

---

## Executive Summary

{{A ser preenchido após síntese}}

---

{{Conteúdo do relatório será gerado pelo pipeline}}
"""


def generate_recommendations_stub(date: str) -> str:
    return f"""# Recomendações

> **Data:** {date}
> **Baseado em:** [02-research-report.md](./02-research-report.md)

---

## Decisão Recomendada

{{A ser preenchido após síntese}}

---

## Ranking de Alternativas

| # | Solução | Score | Effort | Quando Usar | Justificativa |
|---|---------|-------|--------|-------------|---------------|
{{A ser preenchido}}

---

## Implementation Roadmap

| Fase | Ação | Effort | Owner | Timeline |
|------|------|--------|-------|----------|
{{A ser preenchido}}

---

## Anti-Patterns

| O que NÃO fazer | Por quê | Consequência |
|------------------|---------|--------------|
{{A ser preenchido}}

---

## Próximos Passos

> **IMPORTANTE:** Este documento é apenas pesquisa. Para implementação:
> - **@pm** para priorização e criação de stories
> - **@dev** para execução técnica

{{A ser preenchido}}
"""


def scaffold(slug: str, title: str, query: str, date: str = None) -> dict:
    """Create research output folder with all stub files."""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    folder_name = f"{date}-{slug}"
    folder_path = os.path.join(BASE_DIR, folder_name)

    os.makedirs(folder_path, exist_ok=True)

    files = {
        "README.md": generate_readme(title, date),
        "00-query-original.md": generate_query(query, date),
        "02-research-report.md": generate_report_stub(title, date),
        "03-recommendations.md": generate_recommendations_stub(date),
    }

    created = []
    skipped = []
    for filename, content in files.items():
        filepath = os.path.join(folder_path, filename)
        if os.path.exists(filepath):
            skipped.append(filename)
        else:
            with open(filepath, "w") as f:
                f.write(content)
            created.append(filename)

    return {
        "folder": folder_path,
        "date": date,
        "slug": slug,
        "title": title,
        "created": created,
        "skipped": skipped,
        "total_files": len(files),
    }


def main():
    if "--stdin" in sys.argv:
        data = json.loads(sys.stdin.read())
        result = scaffold(
            slug=data["slug"],
            title=data["title"],
            query=data["query"],
            date=data.get("date"),
        )
        print(json.dumps(result, indent=2))
        return

    slug = None
    title = None
    query = None
    date = None

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--slug" and i + 1 < len(args):
            slug = args[i + 1]
            i += 2
        elif args[i] == "--title" and i + 1 < len(args):
            title = args[i + 1]
            i += 2
        elif args[i] == "--query" and i + 1 < len(args):
            query = args[i + 1]
            i += 2
        elif args[i] == "--date" and i + 1 < len(args):
            date = args[i + 1]
            i += 2
        else:
            i += 1

    if not slug or not title or not query:
        print("Usage: scaffold.py --slug <slug> --title <title> --query <query> [--date YYYY-MM-DD]", file=sys.stderr)
        print("   or: echo '{json}' | scaffold.py --stdin", file=sys.stderr)
        sys.exit(1)

    result = scaffold(slug=slug, title=title, query=query, date=date)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
