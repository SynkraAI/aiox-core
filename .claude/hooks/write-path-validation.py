#!/usr/bin/env python3
"""
Hook: Write Path Validation

REGRA: Documentos devem ir para os paths corretos conforme convenções.

Este hook intercepta Write/Edit e AVISA (não bloqueia) quando o path
parece violar as convenções de organização de documentos.

Exit Codes:
- 0: Sempre (apenas avisa, nunca bloqueia)
"""

import json
import sys
import os
import re
from datetime import datetime

# =============================================================================
# CONFIGURAÇÃO: Regras de organização de documentos
# =============================================================================

PATH_RULES = [
    # (pattern no nome/conteúdo, path esperado, descrição)
    {
        "name_patterns": [r"session", r"handoff", r"^2\d{3}-\d{2}-\d{2}"],
        "expected_path": "docs/sessions/",
        "description": "Session logs e handoffs → docs/sessions/YYYY-MM/",
    },
    {
        "name_patterns": [r"architecture", r"system-design", r"infra"],
        "expected_path": "docs/architecture/",
        "description": "Docs de arquitetura → docs/architecture/",
        "exclude_patterns": [r"ARCHITECTURE_RULES"],  # Exceção para MMOS
    },
    {
        "name_patterns": [r"guide", r"tutorial", r"how-to"],
        "expected_path": "docs/guides/",
        "description": "Guias e tutoriais → docs/guides/",
    },
    {
        "name_patterns": [r"prd\.md$", r"epic.*\.md$", r"story.*\.md$"],
        "expected_path": "docs/projects/",
        "description": "PRDs, Epics, Stories → docs/projects/{project}/",
    },
    {
        "name_patterns": [r"mind.*specific", r"mind.*validation"],
        "expected_path": "outputs/minds/",
        "description": "Docs específicos de mind → outputs/minds/{slug}/docs/",
    },
]

# Paths que são sempre válidos (não avisar)
ALWAYS_VALID_PATHS = [
    ".claude/",
    ".aiox-core/",
    ".aiox-upstream/",
    "squads/",
    "node_modules/",
    ".git/",
    "app/",
    "supabase/",
    "outputs/",
]

# =============================================================================
# LÓGICA DO HOOK
# =============================================================================

def get_project_root():
    """Obtém o root do projeto."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def normalize_path(file_path: str, project_root: str) -> str:
    """Normaliza path para relativo."""
    if file_path.startswith(project_root):
        return file_path[len(project_root):].lstrip("/")
    return file_path

def is_always_valid(relative_path: str) -> bool:
    """Verifica se o path está em área sempre válida."""
    for valid in ALWAYS_VALID_PATHS:
        if relative_path.startswith(valid):
            return True
    return False

def is_documentation_file(relative_path: str) -> bool:
    """Verifica se é um arquivo de documentação."""
    doc_extensions = [".md", ".mdx", ".txt", ".rst"]
    return any(relative_path.endswith(ext) for ext in doc_extensions)

def check_path_rules(relative_path: str) -> list[dict]:
    """
    Verifica se o path viola alguma regra.

    Returns:
        Lista de violações com sugestões
    """
    violations = []
    filename = os.path.basename(relative_path)

    for rule in PATH_RULES:
        # Verificar se o nome do arquivo corresponde ao pattern
        matches_name = False
        for pattern in rule["name_patterns"]:
            if re.search(pattern, filename, re.IGNORECASE):
                matches_name = True
                break

        if not matches_name:
            continue

        # Verificar exceções
        if "exclude_patterns" in rule:
            is_excluded = False
            for exc_pattern in rule["exclude_patterns"]:
                if re.search(exc_pattern, filename, re.IGNORECASE):
                    is_excluded = True
                    break
            if is_excluded:
                continue

        # Verificar se está no path esperado
        expected = rule["expected_path"]
        if not relative_path.startswith(expected):
            violations.append({
                "current_path": relative_path,
                "expected_path": expected,
                "description": rule["description"],
            })

    return violations

def main():
    # Ler input do stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Só processar Write e Edit
    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    # Normalizar path
    project_root = get_project_root()
    relative_path = normalize_path(file_path, project_root)

    # Verificar se é área sempre válida
    if is_always_valid(relative_path):
        sys.exit(0)

    # Só verificar arquivos de documentação
    if not is_documentation_file(relative_path):
        sys.exit(0)

    # Verificar regras
    violations = check_path_rules(relative_path)

    if not violations:
        sys.exit(0)

    # AVISAR (não bloquear)
    violation = violations[0]  # Mostrar primeira violação

    warning_message = f"""
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚠️  PATH WARNING: Documento pode estar no local errado                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Arquivo: {relative_path[:60]:<60} │
│                                                                              │
│  Convenção: {violation['description'][:56]:<56} │
│  Esperado:  {violation['expected_path']:<57} │
│                                                                              │
│  NOTA: Este é apenas um AVISO, a operação será executada.                    │
│        Verifique se o path está correto antes de continuar.                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
"""
    # Imprimir warning mas NÃO bloquear (exit 0)
    print(warning_message, file=sys.stderr)
    sys.exit(0)

if __name__ == "__main__":
    main()
