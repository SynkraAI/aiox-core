#!/usr/bin/env python3
"""
MMOS Map Mind - Ultra-Simple Command Interface

Provides the `*map {name}` command that auto-detects everything and
executes the correct workflow with zero user configuration required.

Part of MMOS-E001 Story 3: Command Interface
"""

import os
import sys
from typing import Optional, Dict, Any
from pathlib import Path

from .workflow_detector import auto_detect_workflow
from .metadata_manager import read_metadata, MetadataManager
from .workflow_preprocessor import preprocess_workflow
from .workflow_orchestrator import WorkflowOrchestrator


# Valid modes for validation
VALID_MODES = {
    "greenfield": ["public", "no-public-interviews", "no-public-materials"],
    "brownfield": ["public-update", "no-public-incremental", "no-public-migration"]
}

ALL_VALID_MODES = VALID_MODES["greenfield"] + VALID_MODES["brownfield"]


def map_mind(person_name: str,
             force_mode: Optional[str] = None,
             materials_path: Optional[str] = None,
             show_help: bool = False) -> Dict[str, Any]:
    """
    Ultra-simple mind cloning command.

    Auto-detects workflow type, mode, and executes appropriate workflow.

    Args:
        person_name: Name of person to clone (e.g., "Daniel Kahneman")
        force_mode: Override auto-detection (optional)
        materials_path: Path to source materials (optional)
        show_help: Show help text instead of executing

    Returns:
        dict: Execution result
            {
                'status': 'completed' | 'failed' | 'help',
                'workflow_type': 'greenfield' | 'brownfield',
                'mode': str,
                'slug': str,
                'workflow_file': str,
                'error': str (if failed)
            }

    Examples:
        >>> map_mind("daniel_kahneman")
        {'status': 'completed', 'workflow_type': 'greenfield', 'mode': 'public', ...}

        >>> map_mind("pedro_valerio", force_mode="no-public-interviews")
        {'status': 'completed', 'workflow_type': 'greenfield', ...}

        >>> map_mind("", show_help=True)
        {'status': 'help', ...}
    """
    # Handle help request
    if show_help or person_name in ["--help", "-h", "help"]:
        _show_help()
        return {'status': 'help'}

    # Validate person_name
    if not person_name or person_name.strip() == "":
        _log_error("Person name is required")
        _show_help()
        return {'status': 'failed', 'error': 'Person name required'}

    # Convert to slug
    slug = _to_slug(person_name)

    try:
        # STEP 1: Handle override flags
        if force_mode:
            _log("🔧 Force mode: {} (skipping auto-detection)".format(force_mode))

            # Validate force_mode
            if force_mode not in ALL_VALID_MODES:
                raise ValueError(f"Invalid mode: '{force_mode}'")

            # Determine workflow_type from mode
            if force_mode in VALID_MODES["greenfield"]:
                workflow_type = "greenfield"
            else:
                workflow_type = "brownfield"

            mode = force_mode
            decision_log = [f"User forced mode: {force_mode}"]

        elif materials_path:
            _log(f"📁 Materials provided: {materials_path}")

            # Validate path exists
            if not os.path.exists(materials_path):
                raise ValueError(f"Materials path not found: '{materials_path}'")

            mode = "no-public-materials"
            workflow_type = "greenfield"
            decision_log = [f"Materials path provided: {materials_path}"]

        else:
            # STEP 2: Auto-detect workflow and mode
            _log(f"🔍 Auto-detecting workflow for '{person_name}'...")

            # Normalize person_name: convert slug to proper name for web search
            normalized_name = _slug_to_name(person_name) if ('_' in person_name or '-' in person_name) else person_name
            _log(f"   Using search name: '{normalized_name}'")

            detection_result = auto_detect_workflow(slug, normalized_name)
            workflow_type = detection_result["workflow_type"]
            mode = detection_result["mode"]
            decision_log = detection_result["decision_log"]

            _log(f"✅ Detected: {workflow_type}")
            _log(f"✅ Detected mode: {mode}")

        # STEP 3: Route to appropriate workflow
        workflow_file = _get_workflow_file(workflow_type)
        _log(f"🚀 Executing: {workflow_file} (mode: {mode})")

        # STEP 4: Execute workflow
        result = _execute_workflow(
            workflow_file=workflow_file,
            workflow_type=workflow_type,
            mode=mode,
            slug=slug,
            person_name=person_name,
            materials_path=materials_path,
            decision_log=decision_log
        )

        # STEP 5: Return success
        _log(f"✅ Workflow complete for '{person_name}'")

        return {
            'status': 'completed',
            'workflow_type': workflow_type,
            'mode': mode,
            'slug': slug,
            'workflow_file': workflow_file,
            'decision_log': decision_log
        }

    except ValueError as e:
        # User error (invalid input)
        _log_error(str(e))
        _suggest_recovery(str(e), person_name)
        return {
            'status': 'failed',
            'error': str(e),
            'slug': slug
        }

    except Exception as e:
        # System error (unexpected)
        _log_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'status': 'failed',
            'error': f"Unexpected error: {e}",
            'slug': slug
        }


def _get_workflow_file(workflow_type: str) -> str:
    """
    Get workflow file name based on workflow type.

    Args:
        workflow_type: "greenfield" or "brownfield"

    Returns:
        Workflow filename (e.g., "greenfield-mind.yaml")
    """
    if workflow_type == "greenfield":
        return "greenfield-mind.yaml"
    elif workflow_type == "brownfield":
        return "brownfield-mind.yaml"
    else:
        raise ValueError(f"Unknown workflow type: {workflow_type}")


def _execute_workflow(workflow_file: str,
                     workflow_type: str,
                     mode: str,
                     slug: str,
                     person_name: str,
                     materials_path: Optional[str],
                     decision_log: list) -> Dict[str, Any]:
    """
    Execute AIOS workflow with parameters.

    Note: This is a placeholder for actual AIOS workflow execution.
    In production, this would load the YAML, preprocess imports,
    and execute each phase in sequence.

    Args:
        workflow_file: YAML filename
        workflow_type: greenfield or brownfield
        mode: execution mode
        slug: person slug
        person_name: human-readable name
        materials_path: optional materials path
        decision_log: detection decisions

    Returns:
        Execution result dict
    """
    # Log workflow execution context
    print("\n" + "="*60)
    print("📍 WORKFLOW EXECUTION CONTEXT")
    print("="*60)
    print(f"Workflow: {workflow_file}")
    print(f"Type: {workflow_type}")
    print(f"Mode: {mode}")
    print(f"Slug: {slug}")
    print(f"Person: {person_name}")
    if materials_path:
        print(f"Materials: {materials_path}")
    print("\nDetection Log:")
    for entry in decision_log:
        print(f"  {entry}")
    print("="*60 + "\n")

    # ACTUAL WORKFLOW EXECUTION (Story E001.6-SIMPLE)
    try:
        # Get paths to workflow and task directories
        mmos_root = Path(__file__).parent.parent
        workflows_dir = mmos_root / "workflows"
        tasks_dir = mmos_root / "tasks"

        # 1. Load and preprocess workflow YAML (expands module imports)
        workflow_path = workflows_dir / workflow_file

        print(f"\n📥 Loading workflow: {workflow_path}")
        preprocessed = preprocess_workflow(str(workflow_path))

        # Preprocessor returns {'workflow': {...}}, extract the workflow
        expanded_workflow = preprocessed.get('workflow', preprocessed)
        print(f"✅ Workflow loaded and preprocessed")

        # 2. Prepare execution context
        execution_context = {
            'slug': slug,
            'mode': mode,
            'person_name': person_name,
            'materials_path': materials_path,
            'decision_log': decision_log,
            'workflow_type': workflow_type,
            'workflow_file': workflow_file
        }

        # 3. Initialize metadata manager for state persistence
        minds_dir = Path("expansion-packs/mmos/minds")
        metadata_manager = MetadataManager(minds_dir)

        # 4. Create orchestrator and execute workflow
        orchestrator = WorkflowOrchestrator(
            workflows_dir=workflows_dir,
            tasks_dir=tasks_dir,
            metadata_manager=metadata_manager
        )

        print(f"\n🚀 Starting workflow execution...")
        result = orchestrator.orchestrate_workflow(expanded_workflow, execution_context)

        # 5. Return execution result
        return {
            'workflow_file': workflow_file,
            'execution': 'completed' if result['status'] == 'completed' else result['status'],
            'phases_executed': result.get('phases_executed', []),
            'outputs': result.get('outputs', {}),
            'status': result['status'],
            'error': result.get('error')
        }

    except FileNotFoundError as e:
        print(f"\n❌ Workflow file not found: {e}")
        return {
            'workflow_file': workflow_file,
            'execution': 'failed',
            'error': f'Workflow file not found: {e}'
        }

    except Exception as e:
        print(f"\n❌ Workflow execution failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            'workflow_file': workflow_file,
            'execution': 'failed',
            'error': str(e)
        }


def _to_slug(person_name: str) -> str:
    """
    Convert person name to file-safe slug.

    Args:
        person_name: "Daniel Kahneman"

    Returns:
        "daniel_kahneman"
    """
    import re

    # Lowercase, replace spaces/special chars with underscores
    slug = person_name.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove special chars
    slug = re.sub(r'[-\s]+', '_', slug)   # Replace spaces/hyphens with underscores
    slug = slug.strip('_')                # Remove leading/trailing underscores

    return slug


def _slug_to_name(slug: str) -> str:
    """
    Convert slug to proper name for display and web search.

    Args:
        slug: "thiago_finch" or "daniel-kahneman"

    Returns:
        "Thiago Finch" or "Daniel Kahneman"

    Examples:
        >>> _slug_to_name("thiago_finch")
        "Thiago Finch"
        >>> _slug_to_name("daniel-kahneman")
        "Daniel Kahneman"
    """
    return slug.replace('_', ' ').replace('-', ' ').title()


def _log(message: str):
    """Log message with emoji."""
    print(message)


def _log_error(message: str):
    """Log error message."""
    print(f"\n❌ ERROR: {message}\n")


def _suggest_recovery(error: str, person_name: str):
    """
    Suggest recovery actions based on error.

    Args:
        error: Error message
        person_name: Person name being processed
    """
    print("💡 Suggestions:")
    print()

    if "Invalid mode" in error:
        print("   Valid modes:")
        print("   Greenfield:")
        for mode in VALID_MODES["greenfield"]:
            print(f"     - {mode}")
        print("   Brownfield:")
        for mode in VALID_MODES["brownfield"]:
            print(f"     - {mode}")
        print()
        print(f"   Try: *map {person_name} --force-mode=public")

    elif "Materials path not found" in error:
        print(f"   Please provide a valid directory path:")
        print(f"     *map {person_name} --materials-path=./sources/{_to_slug(person_name)}/")

    elif "Could not auto-detect" in error or "ambiguous" in error.lower():
        print("   Specify mode manually:")
        print(f"     *map {person_name} --force-mode=public")
        print(f"     *map {person_name} --force-mode=no-public-interviews")
        print(f"     *map {person_name} --materials-path=./path/to/sources/")

    else:
        print("   Try:")
        print(f"     *map {person_name} --help")
        print("     *map --help")

    print()


def _show_help():
    """Display help text."""
    help_text = """
═══════════════════════════════════════════════════════════════
MMOS Map Command - Ultra-Simple Mind Clone Creation
═══════════════════════════════════════════════════════════════

Usage:
  *map {person_name}                          Auto-detect everything
  *map {person_name} --force-mode={mode}      Override auto-detection
  *map {person_name} --materials-path={path}  Provide materials

The system automatically detects:
  ✅ Greenfield vs Brownfield (based on existing clone)
  ✅ Public vs No-Public (based on web content availability)
  ✅ Correct workflow and mode for execution

───────────────────────────────────────────────────────────────
Examples
───────────────────────────────────────────────────────────────

  *map daniel_kahneman
    → Auto-detect: greenfield + public
    → Create new public figure clone via web scraping

  *map pedro_valerio
    → Auto-detect: greenfield + no web content
    → Ask user: "1. Interviews  2. Materials"
    → Proceed based on user choice

  *map jose_amorim
    → Auto-detect: brownfield (if clone exists)
    → Update existing clone incrementally

───────────────────────────────────────────────────────────────
Advanced Options
───────────────────────────────────────────────────────────────

  --force-mode={mode}
    Force specific mode (skip auto-detection)

    Valid modes:
      Greenfield:
        • public                  Web scraping + automated research
        • no-public-interviews    5-session interview protocol
        • no-public-materials     Process provided materials

      Brownfield:
        • public-update           Update public clone with new sources
        • no-public-incremental   Update private clone incrementally
        • no-public-migration     Migrate from another system

  --materials-path={path}
    Path to source materials directory
    Forces mode: no-public-materials

    Example:
      *map jose_amorim --materials-path=./sources/jose/

  --help, -h
    Show this help text

───────────────────────────────────────────────────────────────
What Gets Auto-Detected
───────────────────────────────────────────────────────────────

  1. Workflow Type (greenfield vs brownfield)
     → Checks if expansion-packs/mmos/minds/{slug}/ exists
     → If YES + completed: brownfield (update)
     → If NO: greenfield (create new)

  2. Mode (public vs no-public variants)
     → If greenfield:
       - Quick web search for person
       - If found: public mode
       - If not found: ask user (interviews vs materials)
     → If brownfield:
       - Read metadata.yaml
       - Use existing source_type

  3. Workflow File
     → greenfield-mind.yaml (for new clones)
     → brownfield-mind.yaml (for updates)

───────────────────────────────────────────────────────────────
More Info
───────────────────────────────────────────────────────────────

  Documentation: docs/guides/mmos-usage.md
  Workflows: expansion-packs/mmos/workflows/
  Tasks: expansion-packs/mmos/tasks/

═══════════════════════════════════════════════════════════════
"""
    print(help_text)


# CLI entry point
def main():
    """Command-line interface for *map command."""
    import argparse

    parser = argparse.ArgumentParser(
        description="MMOS Map - Ultra-simple mind clone creation",
        add_help=False  # Custom help
    )

    parser.add_argument(
        "person_name",
        nargs="?",
        help="Name of person to clone"
    )

    parser.add_argument(
        "--force-mode",
        help="Force specific mode (skip auto-detection)"
    )

    parser.add_argument(
        "--materials-path",
        help="Path to source materials"
    )

    parser.add_argument(
        "--help", "-h",
        action="store_true",
        help="Show help text"
    )

    args = parser.parse_args()

    # Execute map_mind
    result = map_mind(
        person_name=args.person_name or "",
        force_mode=args.force_mode,
        materials_path=args.materials_path,
        show_help=args.help
    )

    # Exit with appropriate code
    if result['status'] == 'completed':
        sys.exit(0)
    elif result['status'] == 'help':
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
