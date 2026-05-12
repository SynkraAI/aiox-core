#!/usr/bin/env python3
"""
Hook: Enforce Architecture-First Development

REGRA: Código só pode ser criado/editado se existir documentação prévia.

Este hook intercepta Write/Edit em paths de código e verifica se existe
documentação aprovada antes de permitir a operação.

Exit Codes:
- 0: Permitido (doc existe ou path não requer doc)
- 2: Bloqueado (doc não existe para path protegido)
"""

import json
import sys
import os
from pathlib import Path

# =============================================================================
# CONFIGURAÇÃO: Paths que EXIGEM documentação prévia
# =============================================================================

PROTECTED_PATHS = [
    # Edge Functions - exigem docs/architecture/{function-name}.md
    {
        "pattern": "supabase/functions/",
        "doc_patterns": [
            "docs/architecture/{name}.md",
            "docs/architecture/{name}-architecture.md",
            "docs/approved-plans/{name}.md",
        ],
        "extract_name": lambda p: p.split("supabase/functions/")[1].split("/")[0] if "supabase/functions/" in p else None,
    },
    # Migrations - exigem documentação de schema changes
    {
        "pattern": "supabase/migrations/",
        "doc_patterns": [
            "docs/approved-plans/migration-{name}.md",
            "docs/architecture/database-changes.md",
        ],
        "extract_name": lambda p: Path(p).stem if "supabase/migrations/" in p else None,
        "allow_if_exists": True,  # Permite editar migrations existentes
    },
]

# Paths que são SEMPRE permitidos (não exigem doc)
ALWAYS_ALLOWED = [
    ".claude/",
    "docs/",
    "outputs/",
    "squads/",
    ".aiox-core/",
    ".aiox-custom/",
    "node_modules/",
    ".git/",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    ".env",
    "README.md",
]

# =============================================================================
# LÓGICA DO HOOK
# =============================================================================

def get_project_root():
    """Obtém o root do projeto via variável de ambiente ou cwd."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def is_always_allowed(file_path: str) -> bool:
    """Verifica se o path está na lista de sempre permitidos."""
    for allowed in ALWAYS_ALLOWED:
        if allowed in file_path:
            return True
    return False

def find_matching_protection(file_path: str) -> dict | None:
    """Encontra a regra de proteção que corresponde ao path."""
    for protection in PROTECTED_PATHS:
        if protection["pattern"] in file_path:
            return protection
    return None

def check_documentation_exists(file_path: str, protection: dict, project_root: str) -> tuple[bool, str]:
    """
    Verifica se existe documentação para o path protegido.

    Returns:
        (exists: bool, doc_path: str | None)
    """
    extract_fn = protection.get("extract_name")
    if not extract_fn:
        return True, None

    name = extract_fn(file_path)
    if not name:
        return True, None

    # Verificar cada padrão de documentação
    for doc_pattern in protection["doc_patterns"]:
        doc_path = doc_pattern.format(name=name)
        full_doc_path = os.path.join(project_root, doc_path)

        if os.path.exists(full_doc_path):
            return True, doc_path

    # Se allow_if_exists e o arquivo já existe, permitir edição
    if protection.get("allow_if_exists"):
        full_file_path = os.path.join(project_root, file_path) if not file_path.startswith("/") else file_path
        if os.path.exists(full_file_path):
            return True, "(arquivo existente)"

    return False, None

def format_required_docs(protection: dict, name: str) -> str:
    """Formata a lista de documentos aceitos."""
    docs = []
    for pattern in protection["doc_patterns"]:
        docs.append(f"  - {pattern.format(name=name)}")
    return "\n".join(docs)

def main():
    # Ler input do stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Se não conseguir parsear, permitir (fail-open)
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Só processar Write e Edit
    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    # Normalizar path (remover prefixo absoluto se presente)
    project_root = get_project_root()
    relative_path = file_path
    if file_path.startswith(project_root):
        relative_path = file_path[len(project_root):].lstrip("/")

    # Verificar se é sempre permitido
    if is_always_allowed(relative_path):
        sys.exit(0)

    # Verificar se path está protegido
    protection = find_matching_protection(relative_path)
    if not protection:
        # Path não protegido, permitir
        sys.exit(0)

    # Verificar se documentação existe
    doc_exists, doc_path = check_documentation_exists(relative_path, protection, project_root)

    if doc_exists:
        # Documentação existe, permitir
        sys.exit(0)

    # BLOQUEAR: Documentação não existe
    name = protection["extract_name"](relative_path) or "unknown"
    required_docs = format_required_docs(protection, name)

    error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🛑 ARCHITECTURE-FIRST: Documentação obrigatória antes de código             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Arquivo bloqueado: {relative_path[:50]:<50} ║
║                                                                              ║
║  REGRA: Antes de criar/editar código em paths protegidos, você DEVE:         ║
║                                                                              ║
║  1. Documentar o plano de arquitetura                                        ║
║  2. Obter aprovação do usuário                                               ║
║  3. Criar o arquivo de documentação                                          ║
║                                                                              ║
║  Documentos aceitos para '{name}':                                           ║
{required_docs}
║                                                                              ║
║  AÇÃO: Crie um dos documentos acima com o plano aprovado, depois tente       ║
║        novamente a operação de código.                                       ║
║                                                                              ║
║  DICA: Use `*create-doc architecture` para criar doc de arquitetura          ║
║        Ou crie docs/approved-plans/{name}.md com o plano resumido             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

    print(error_message, file=sys.stderr)
    sys.exit(2)  # Exit code 2 = bloqueia o tool

if __name__ == "__main__":
    main()
