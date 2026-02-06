"""
MMOS Metadata Manager

Manages metadata.yaml files for mind mapping pipeline.
Tracks pipeline state, workflow history, and mind statistics.

Part of MMOS-E001 Story 4: Metadata & State Management
"""

import os
import yaml
from datetime import datetime, timezone
from typing import Optional, Dict, List


# Valid pipeline statuses (in order)
VALID_STATUSES = [
    'not_started',
    'viability',
    'research',
    'analysis',
    'synthesis',
    'implementation',
    'testing',
    'completed'
]


def create_metadata(slug: str, source_type: str, person_name: Optional[str] = None) -> None:
    """
    Create initial metadata.yaml for new mind.
    Called in Phase 0 (initialization) of greenfield workflow.

    Args:
        slug: File-safe slug (e.g., "pedro_valerio")
        source_type: One of: public | no-public-interviews | no-public-materials
        person_name: Human-readable name (optional, defaults to titlecased slug)

    Example:
        create_metadata("pedro_valerio", "no-public-interviews", "Pedro Valério")
    """
    # Generate name from slug if not provided
    if person_name is None:
        person_name = slug.replace('_', ' ').replace('-', ' ').title()

    # Create metadata structure
    timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    metadata = {
        'mind': {
            'name': person_name,
            'slug': slug,
            'created': timestamp,
            'source_type': source_type,
            'pipeline_status': 'not_started',
            'current_version': 'v1.0',
            'fidelity': None
        },
        'workflow_history': [],
        'statistics': {
            'total_sources': 0,
            'total_kb_chunks': 0,
            'total_executions': 0,
            'last_updated': timestamp
        }
    }

    # Ensure directory exists
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"
    os.makedirs(os.path.dirname(path), exist_ok=True)

    # Write metadata file
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    print(f"✅ Created metadata for {slug}")


def update_pipeline_status(slug: str, new_status: str) -> None:
    """
    Update pipeline_status as workflow progresses.

    Args:
        slug: Mind slug
        new_status: One of: not_started | viability | research | analysis |
                    synthesis | implementation | testing | completed

    Raises:
        ValueError: If new_status is not valid
        FileNotFoundError: If metadata.yaml doesn't exist

    Example:
        update_pipeline_status("pedro_valerio", "analysis")
    """
    # Validate status
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{new_status}'. Must be one of: {', '.join(VALID_STATUSES)}")

    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    # Check if file exists
    if not os.path.exists(path):
        raise FileNotFoundError(f"Metadata not found for {slug}. Run create_metadata() first.")

    # Read existing metadata
    with open(path, 'r', encoding='utf-8') as f:
        metadata = yaml.safe_load(f)

    # Update status
    old_status = metadata['mind']['pipeline_status']
    metadata['mind']['pipeline_status'] = new_status
    metadata['statistics']['last_updated'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    print(f"✅ Updated {slug} status: {old_status} → {new_status}")


def append_workflow_execution(slug: str, execution_data: Dict) -> None:
    """
    Append workflow execution to history.
    Called when workflow completes (greenfield or brownfield).

    Args:
        slug: Mind slug
        execution_data: Dict containing:
            - workflow: 'greenfield-mind' | 'brownfield-mind'
            - mode: 'public' | 'no-public-interviews' | 'no-public-materials' | 'no-public-incremental'
            - version: e.g., 'v1.0', 'v1.1'
            - status: 'completed' | 'failed' | 'interrupted'
            - duration_hours: int or float
            - tokens_used: int
            - phases_completed: List[str]
            - changes: Optional[List[str]] (for brownfield only)

    Example:
        append_workflow_execution("pedro_valerio", {
            'workflow': 'greenfield-mind',
            'mode': 'no-public-interviews',
            'version': 'v1.0',
            'status': 'completed',
            'duration_hours': 18,
            'tokens_used': 1850000,
            'phases_completed': ['viability', 'research', 'analysis', 'synthesis', 'implementation', 'testing']
        })
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    # Check if file exists
    if not os.path.exists(path):
        raise FileNotFoundError(f"Metadata not found for {slug}. Run create_metadata() first.")

    # Read existing metadata
    with open(path, 'r', encoding='utf-8') as f:
        metadata = yaml.safe_load(f)

    # Generate execution ID
    timestamp = datetime.now(timezone.utc)
    execution_id = f"exec_{timestamp.strftime('%Y%m%d_%H%M%S')}"

    # Build execution entry
    execution = {
        'execution_id': execution_id,
        'timestamp': timestamp.isoformat().replace('+00:00', 'Z'),
        **execution_data
    }

    # Append to history
    metadata['workflow_history'].append(execution)
    metadata['statistics']['total_executions'] += 1
    metadata['statistics']['last_updated'] = timestamp.isoformat().replace('+00:00', 'Z')

    # If completed, update current_version
    if execution_data.get('status') == 'completed':
        metadata['mind']['current_version'] = execution_data['version']

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    print(f"✅ Appended execution {execution_id} to {slug} history")


def read_metadata(slug: str) -> Optional[Dict]:
    """
    Read metadata for existing mind.
    Used by brownfield workflows for context-awareness.

    Args:
        slug: Mind slug

    Returns:
        Dict with metadata, or None if file doesn't exist

    Example:
        metadata = read_metadata("pedro_valerio")
        if metadata:
            source_type = metadata['mind']['source_type']
            status = metadata['mind']['pipeline_status']
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    if not os.path.exists(path):
        print(f"⚠️  Warning: No metadata found for {slug}")
        return None

    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def update_statistics(slug: str, sources: Optional[int] = None,
                      kb_chunks: Optional[int] = None) -> None:
    """
    Update statistics in metadata.

    Args:
        slug: Mind slug
        sources: Total number of source files (optional)
        kb_chunks: Total number of KB chunks (optional)

    Example:
        update_statistics("pedro_valerio", sources=7, kb_chunks=48)
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    if not os.path.exists(path):
        raise FileNotFoundError(f"Metadata not found for {slug}")

    with open(path, 'r', encoding='utf-8') as f:
        metadata = yaml.safe_load(f)

    # Update statistics
    if sources is not None:
        metadata['statistics']['total_sources'] = sources
    if kb_chunks is not None:
        metadata['statistics']['total_kb_chunks'] = kb_chunks

    metadata['statistics']['last_updated'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    print(f"✅ Updated statistics for {slug}")


def update_fidelity(slug: str, overall: int, personality: int,
                    knowledge: int, style: int) -> None:
    """
    Update fidelity scores after testing phase.

    Args:
        slug: Mind slug
        overall: Overall fidelity score (0-100)
        personality: Personality fidelity score (0-100)
        knowledge: Knowledge fidelity score (0-100)
        style: Communication style fidelity score (0-100)

    Example:
        update_fidelity("pedro_valerio", overall=96, personality=98, knowledge=95, style=95)
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    if not os.path.exists(path):
        raise FileNotFoundError(f"Metadata not found for {slug}")

    with open(path, 'r', encoding='utf-8') as f:
        metadata = yaml.safe_load(f)

    # Update fidelity
    metadata['mind']['fidelity'] = {
        'overall': overall,
        'personality': personality,
        'knowledge': knowledge,
        'style': style
    }
    metadata['statistics']['last_updated'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    print(f"✅ Updated fidelity scores for {slug}")


def get_pipeline_status(slug: str) -> Optional[str]:
    """
    Get current pipeline status for a mind.

    Args:
        slug: Mind slug

    Returns:
        Current pipeline status, or None if metadata doesn't exist

    Example:
        status = get_pipeline_status("pedro_valerio")
        if status == "completed":
            print("Mind is ready!")
    """
    metadata = read_metadata(slug)
    if metadata:
        return metadata['mind']['pipeline_status']
    return None


def is_greenfield(slug: str) -> bool:
    """
    Check if mind is greenfield (no metadata exists or status is not_started).

    Args:
        slug: Mind slug

    Returns:
        True if greenfield, False if brownfield

    Example:
        if is_greenfield("pedro_valerio"):
            print("Starting greenfield workflow...")
        else:
            print("Starting brownfield workflow...")
    """
    metadata = read_metadata(slug)
    if metadata is None:
        return True

    status = metadata['mind']['pipeline_status']
    return status == 'not_started'


class MetadataManager:
    """
    Manager class for workflow state persistence via metadata.yaml.

    Provides structured API for updating phase statuses during workflow execution.
    Enables resume capability after failures or aborts.
    """

    def __init__(self, minds_dir):
        """
        Initialize metadata manager.

        Args:
            minds_dir: Path to expansion-packs/mmos/minds directory
        """
        self.minds_dir = minds_dir

    def update_phase_status(self, slug: str, phase: str, status: str, timestamp: str = None):
        """
        Update phase status in metadata.yaml.

        Args:
            slug: Mind slug
            phase: Phase identifier (e.g., "viability", "research")
            status: Phase status ("completed", "failed", "skipped")
            timestamp: ISO timestamp (defaults to now)
        """
        if timestamp is None:
            timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

        metadata = read_metadata(slug)
        if not metadata:
            # No metadata exists yet, can't update
            return

        # Ensure pipeline_phases exists
        if 'pipeline_phases' not in metadata:
            metadata['pipeline_phases'] = {}

        # Update phase status
        phase_key = f"phase_{phase}"
        if phase_key not in metadata['pipeline_phases']:
            metadata['pipeline_phases'][phase_key] = {}

        metadata['pipeline_phases'][phase_key].update({
            'status': status,
            'updated_at': timestamp
        })

        if status == 'completed':
            metadata['pipeline_phases'][phase_key]['completed_at'] = timestamp

        # Write updated metadata
        metadata_path = self.minds_dir / slug / "metadata.yaml"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            yaml.dump(metadata, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
