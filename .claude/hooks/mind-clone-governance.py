#!/usr/bin/env python3
"""
Hook: Mind Clone Governance

REGRA: Agents baseados em pessoas reais (mind clones) DEVEM passar pelo
pipeline de extração de DNA antes de serem criados.

Este hook intercepta Write/Edit em squads/*/agents/*.md e verifica:
1. Se é um mind clone (baseado em pessoa real)
2. Se existe DNA extraído correspondente

NÃO BLOQUEIA:
- Orchestrators (nome contém 'chief', 'orchestrator', 'chair')
- Tool agents (nome contém 'validator', 'calculator', 'generator')
- Process agents (nome contém 'architect', 'mapper', 'designer')
- Edição de arquivo existente (apenas criação é bloqueada)

Exit Codes:
- 0: Permitido
- 2: Bloqueado (mind clone sem DNA)
"""

import json
import sys
import os
import re
from pathlib import Path

# =============================================================================
# CONFIGURAÇÃO
# =============================================================================

# Padrões que indicam que NÃO é um mind clone (agents funcionais)
FUNCTIONAL_AGENT_PATTERNS = [
    # Orchestrators
    r'.*-chief$',
    r'.*-orchestrator$',
    r'.*-chair$',
    r'^orchestrator$',

    # Tool agents
    r'.*-validator$',
    r'.*-calculator$',
    r'.*-generator$',
    r'.*-extractor$',
    r'.*-analyzer$',

    # Process agents
    r'.*-architect$',
    r'.*-mapper$',
    r'.*-designer$',
    r'.*-engineer$',

    # Generic functional
    r'^tools?-.*',
    r'^process-.*',
    r'^workflow-.*',
]

# Local canônico ÚNICO para mind clones (centralizado em 2026-03-12)
# Fallbacks mantidos para backward compatibility com squads que têm DNAs inline
DNA_LOCATIONS = [
    "squads/mind-cloning/minds/{agent_id}/",          # CANÔNICO (preferido)
    "squads/{pack}/data/minds/{agent_id}_dna.yaml",   # Fallback (squads com DNA inline)
    "squads/{pack}/data/minds/{agent_id}_dna.md",     # Fallback
    "squads/{pack}/data/{agent_id}-dna.yaml",         # Fallback
]

# =============================================================================
# LÓGICA DO HOOK
# =============================================================================

def get_project_root():
    """Obtém o root do projeto via variável de ambiente ou cwd."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def extract_agent_info(file_path: str) -> tuple:
    """Extrai pack_name e agent_id do path."""
    # squads/{pack}/agents/{agent_id}.md
    match = re.match(r'.*/squads/([^/]+)/agents/([^/]+)\.md$', file_path)
    if match:
        return match.group(1), match.group(2)
    return None, None

def is_functional_agent(agent_id: str) -> bool:
    """Verifica se o agent é funcional (não é mind clone)."""
    for pattern in FUNCTIONAL_AGENT_PATTERNS:
        if re.match(pattern, agent_id, re.IGNORECASE):
            return True
    return False

def has_dna_extracted(project_root: str, pack_name: str, agent_id: str) -> tuple:
    """Verifica se existe DNA extraído para o agent."""
    for location_template in DNA_LOCATIONS:
        location = location_template.format(pack=pack_name, agent_id=agent_id)
        full_path = os.path.join(project_root, location)

        # Se é diretório, verificar se existe
        if location.endswith('/'):
            if os.path.isdir(full_path):
                return True, full_path
        # Se é arquivo, verificar se existe
        elif os.path.isfile(full_path):
            return True, full_path

    return False, None

def file_already_exists(file_path: str) -> bool:
    """Verifica se o arquivo já existe (edit vs create)."""
    return os.path.isfile(file_path)

def main():
    # Ler input do stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Se não conseguir parsear, permitir (fail-open)
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Só processar Write e Edit
    if tool_name not in ["Write", "Edit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    # Só processar arquivos em squads/*/agents/
    if "/squads/" not in file_path or "/agents/" not in file_path:
        sys.exit(0)

    if not file_path.endswith(".md"):
        sys.exit(0)

    project_root = get_project_root()

    # Extrair informações do path
    pack_name, agent_id = extract_agent_info(file_path)
    if not pack_name or not agent_id:
        sys.exit(0)

    # Se é edição de arquivo existente, permitir
    if file_already_exists(file_path):
        sys.exit(0)

    # Se é agent funcional (não mind clone), permitir
    if is_functional_agent(agent_id):
        sys.exit(0)

    # Verificar se existe DNA extraído
    has_dna, dna_path = has_dna_extracted(project_root, pack_name, agent_id)

    if has_dna:
        sys.exit(0)

    # BLOQUEAR: Tentando criar mind clone sem DNA
    error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🧬 MIND CLONE GOVERNANCE: DNA não encontrado                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Agent: {agent_id:<60} ║
║  Pack:  {pack_name:<60} ║
║                                                                              ║
║  PROBLEMA: Este parece ser um MIND CLONE (baseado em pessoa real),           ║
║            mas não foi encontrado DNA extraído.                              ║
║                                                                              ║
║  Mind clones DEVEM passar pelo pipeline de extração:                         ║
║  1. *collect-sources  → Coletar fontes (livros, entrevistas, artigos)        ║
║  2. *extract-voice-dna → Extrair padrões linguísticos                        ║
║  3. *extract-thinking-dna → Extrair frameworks e heurísticas                 ║
║  4. *create-agent → Criar agent a partir do DNA                              ║
║                                                                              ║
║  LOCAIS VERIFICADOS:                                                         ║
║  • squads/{pack_name}/data/minds/{agent_id}_dna.yaml
║  • squads/{pack_name}/data/minds/{agent_id}_dna.md
║  • squads/mind-cloning/minds/{agent_id}/
║                                                                              ║
║  SOLUÇÕES:                                                                   ║
║  1. Execute o pipeline de clone: /squad-creator → *collect-sources           ║
║  2. OU se é agent FUNCIONAL, renomeie com sufixo:                            ║
║     -chief, -orchestrator, -validator, -architect, etc.                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(error_message, file=sys.stderr)
    sys.exit(2)

if __name__ == "__main__":
    main()
