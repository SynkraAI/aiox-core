#!/usr/bin/env python3
"""
MMOS Workflow Preprocessor

Expands module imports in MMOS workflow YAML files before execution.
Since AIOS doesn't support native YAML imports, this preprocessor handles
the `import:` directive by loading module files and inserting their phases
inline.

Usage:
    python lib/workflow_preprocessor.py workflows/greenfield-mind.yaml

Output:
    Expanded workflow printed to stdout (redirect to file if needed)
"""

import sys
import yaml
from pathlib import Path
from typing import Dict, List, Any


def load_yaml(filepath: Path) -> Dict[str, Any]:
    """Load YAML file and return parsed content."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def save_yaml(data: Dict[str, Any], filepath: Path) -> None:
    """Save data to YAML file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)


def resolve_module_path(workflow_file: Path, module_import: str) -> Path:
    """
    Resolve module import path relative to workflow file.

    Args:
        workflow_file: Path to the workflow file containing the import
        module_import: Import string (e.g., "modules/analysis-foundation.yaml")

    Returns:
        Absolute path to the module file
    """
    workflow_dir = workflow_file.parent
    module_path = workflow_dir / module_import

    if not module_path.exists():
        raise FileNotFoundError(f"Module not found: {module_path}")

    return module_path


def expand_imports(workflow: Dict[str, Any], workflow_file: Path) -> Dict[str, Any]:
    """
    Recursively expand all import directives in workflow.

    Args:
        workflow: Parsed workflow YAML
        workflow_file: Path to the workflow file (for resolving relative imports)

    Returns:
        Expanded workflow with all imports replaced by actual phase content
    """
    if 'sequence' not in workflow:
        return workflow

    expanded_sequence = []

    for step in workflow['sequence']:
        if isinstance(step, dict) and 'import' in step:
            # This is an import directive - expand it
            module_import = step['import']
            module_path = resolve_module_path(workflow_file, module_import)

            # Load module
            module = load_yaml(module_path)

            # Extract phases from module
            if 'phases' not in module:
                raise ValueError(f"Module {module_path} missing 'phases' section")

            # Add comment to indicate where import was expanded
            expanded_sequence.append({
                'comment': f"=== MODULE IMPORT: {module_import} ==="
            })

            # Add all module phases
            expanded_sequence.extend(module['phases'])

            # Add end comment
            expanded_sequence.append({
                'comment': f"=== END MODULE: {module_import} ==="
            })
        else:
            # Regular step - keep as-is
            expanded_sequence.append(step)

    # Replace sequence with expanded version
    workflow['sequence'] = expanded_sequence

    return workflow


def preprocess_workflow(workflow_path: str) -> Dict[str, Any]:
    """
    Main preprocessing function.

    Args:
        workflow_path: Path to workflow YAML file

    Returns:
        Expanded workflow ready for execution
    """
    workflow_file = Path(workflow_path)

    if not workflow_file.exists():
        raise FileNotFoundError(f"Workflow not found: {workflow_file}")

    # Load workflow
    workflow = load_yaml(workflow_file)

    # Expand imports
    expanded = expand_imports(workflow, workflow_file)

    return expanded


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python lib/workflow_preprocessor.py <workflow.yaml>")
        print("\nExpands module imports in MMOS workflows.")
        print("Output is written to stdout (redirect to save to file).")
        sys.exit(1)

    workflow_path = sys.argv[1]

    try:
        # Preprocess workflow
        expanded = preprocess_workflow(workflow_path)

        # Output to stdout
        yaml.dump(expanded, sys.stdout, default_flow_style=False, allow_unicode=True, sort_keys=False)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
