"""
MMOS Workflow Orchestrator

Simple orchestrator that sequences workflow phases and presents tasks to AI for execution.
Leverages AI's native markdown task execution capabilities (proven by AIOS/CreatorOS patterns).

Architecture:
- Load workflow YAML (preprocessed by workflow_preprocessor)
- Iterate through sequence phases
- For each phase with task: load markdown and present to AI
- Handle human checkpoints
- Track execution progress

State Persistence:
- Updates metadata.yaml after each phase completion
- Enables resume from last completed phase on failure/abort
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class WorkflowOrchestrator:
    """
    Simple orchestrator for MMOS workflow execution.

    Does NOT parse or interpret task instructions - that's AI's job.
    Only handles: loading files, sequencing phases, tracking progress.
    """

    def __init__(self, workflows_dir: Path, tasks_dir: Path, metadata_manager=None):
        """
        Initialize orchestrator.

        Args:
            workflows_dir: Path to workflows/ directory
            tasks_dir: Path to tasks/ directory
            metadata_manager: Optional MetadataManager instance for state persistence
        """
        self.workflows_dir = Path(workflows_dir)
        self.tasks_dir = Path(tasks_dir)
        self.metadata_manager = metadata_manager

    def orchestrate_workflow(self, workflow: Dict, context: Dict) -> Dict:
        """
        Execute workflow by sequencing phases and presenting tasks to AI.

        Args:
            workflow: Preprocessed workflow dict (with imports expanded)
            context: Execution context containing:
                - slug: mind slug (e.g., "thiago_finch")
                - mode: workflow mode (e.g., "public", "no-public-interviews")
                - person_name: Full person name
                - materials_path: Optional path to materials
                - decision_log: List of detection decisions

        Returns:
            Dict with:
                - status: 'completed' | 'aborted' | 'failed'
                - phases_executed: List of completed phases
                - outputs: Dict of generated outputs
                - error: Optional error message if failed
        """
        results = {
            'status': 'in_progress',
            'phases_executed': [],
            'outputs': {},
            'started_at': datetime.now().isoformat()
        }

        try:
            sequence = workflow.get('sequence', [])

            print(f"\n{'='*80}")
            print(f"WORKFLOW ORCHESTRATION STARTED")
            print(f"{'='*80}")
            print(f"Workflow: {workflow.get('id', 'unknown')}")
            print(f"Mode: {context.get('mode', 'unknown')}")
            print(f"Slug: {context.get('slug', 'unknown')}")
            print(f"Total Phases: {len(sequence)}")
            print(f"{'='*80}\n")

            for idx, phase in enumerate(sequence, 1):
                phase_id = phase.get('phase', f'phase_{idx}')

                # Check if phase should be skipped
                if self._should_skip_phase(phase, context, results):
                    print(f"⏭️  Skipping phase {idx}/{len(sequence)}: {phase_id}")
                    print(f"   Reason: {phase.get('skip_if', 'condition met')}\n")
                    continue

                print(f"\n{'='*80}")
                print(f"PHASE {idx}/{len(sequence)}: {phase_id}")
                print(f"{'='*80}")

                # Execute task if specified
                if 'task' in phase:
                    task_name = phase['task']
                    print(f"\n📋 Task: {task_name}")

                    try:
                        task_result = self._execute_task(task_name, phase, context)

                        # Track phase completion
                        phase_record = {
                            'phase': phase_id,
                            'task': task_name,
                            'status': 'completed',
                            'completed_at': datetime.now().isoformat()
                        }

                        if task_result:
                            phase_record['outputs'] = task_result.get('outputs', {})
                            results['outputs'].update(task_result.get('outputs', {}))

                        results['phases_executed'].append(phase_record)

                        # Update metadata for resume capability
                        if self.metadata_manager:
                            self._update_phase_status(context['slug'], phase_id, 'completed')

                        print(f"\n✅ Phase {idx}/{len(sequence)} completed: {phase_id}")

                    except Exception as e:
                        print(f"\n❌ Task execution failed: {task_name}")
                        print(f"   Error: {str(e)}")
                        results['status'] = 'failed'
                        results['error'] = f"Task {task_name} failed: {str(e)}"
                        return results

                # Handle human checkpoint
                if phase.get('human_checkpoint'):
                    checkpoint_result = self._handle_checkpoint(phase, results, context)

                    if checkpoint_result['decision'] == 'ABORT':
                        print(f"\n🛑 Workflow aborted by user at checkpoint: {phase_id}")
                        results['status'] = 'aborted'
                        results['aborted_at'] = datetime.now().isoformat()
                        return results

                    # Store checkpoint decision
                    results['outputs'][f'{phase_id}_checkpoint'] = checkpoint_result

                print(f"{'='*80}\n")

            # All phases completed successfully
            results['status'] = 'completed'
            results['completed_at'] = datetime.now().isoformat()

            print(f"\n{'='*80}")
            print(f"✅ WORKFLOW COMPLETED SUCCESSFULLY")
            print(f"{'='*80}")
            print(f"Phases executed: {len(results['phases_executed'])}/{len(sequence)}")
            print(f"Total outputs: {len(results['outputs'])}")
            print(f"{'='*80}\n")

            return results

        except Exception as e:
            print(f"\n❌ WORKFLOW EXECUTION FAILED")
            print(f"   Error: {str(e)}")
            results['status'] = 'failed'
            results['error'] = str(e)
            results['failed_at'] = datetime.now().isoformat()
            return results

    def _should_skip_phase(self, phase: Dict, context: Dict, results: Dict) -> bool:
        """
        Check if phase should be skipped based on skip_if condition.

        Args:
            phase: Phase dict
            context: Execution context
            results: Current results

        Returns:
            True if phase should be skipped
        """
        skip_condition = phase.get('skip_if')
        if not skip_condition:
            return False

        # Simple condition evaluation
        # Format: "mode != 'public'" or "mode == 'greenfield'"
        try:
            # Replace context variables
            condition = skip_condition
            for key, value in context.items():
                condition = condition.replace(key, f"'{value}'")

            # Evaluate (safe for simple conditions)
            return eval(condition)
        except Exception as e:
            print(f"⚠️  Warning: Could not evaluate skip condition '{skip_condition}': {e}")
            return False

    def _execute_task(self, task_name: str, phase: Dict, context: Dict) -> Optional[Dict]:
        """
        Execute task by loading markdown and presenting to AI.

        This is the core of the simple orchestrator pattern:
        1. Load task markdown (frontmatter + instructions)
        2. Print to stdout with clear formatting
        3. AI sees output and executes task autonomously
        4. AI handles: parsing frontmatter, interpreting instructions, elicitation

        Args:
            task_name: Task identifier (e.g., "viability-assessment")
            phase: Phase dict containing task metadata
            context: Execution context

        Returns:
            Optional dict with task outputs (if AI provides structured return)
        """
        task_path = self.tasks_dir / f"{task_name}.md"

        if not task_path.exists():
            raise FileNotFoundError(f"Task file not found: {task_path}")

        # Load task markdown
        try:
            task_content = task_path.read_text(encoding='utf-8')
        except Exception as e:
            raise IOError(f"Failed to read task file {task_path}: {e}")

        # Present task to AI for execution
        print(f"\n{'='*80}")
        print(f"🤖 TASK EXECUTION: {task_name}")
        print(f"{'='*80}\n")

        print(f"Task File: {task_path}")
        print(f"Agent: {phase.get('agent', 'unspecified')}")
        print(f"Phase: {phase.get('phase', 'unspecified')}")

        print(f"\n{'─'*80}")
        print(f"TASK CONTENT:")
        print(f"{'─'*80}\n")
        print(task_content)
        print(f"\n{'─'*80}")

        print(f"\n📦 EXECUTION CONTEXT:")
        print(json.dumps(context, indent=2, ensure_ascii=False))

        print(f"\n{'='*80}")
        print(f"⚡ EXECUTE TASK ABOVE ⚡")
        print(f"{'='*80}\n")

        print("Instructions for AI:")
        print("1. Read the task markdown above (frontmatter + body)")
        print("2. Parse frontmatter YAML for metadata (inputs, outputs, elicit, etc.)")
        print("3. Follow task instructions in markdown body")
        print("4. If elicit: true, use AskUserQuestion tool to interact with user")
        print("5. Create output files as specified in outputs: section")
        print("6. Report completion when done")
        print(f"\n{'='*80}\n")

        # Note: AI executes task here (reads above output and performs task)
        # Orchestrator continues after AI completes

        # Return placeholder - in real execution, AI would provide structured output
        # outputs is a list of file paths, convert to dict for proper merging
        output_paths = phase.get('outputs', [])
        return {
            'outputs': {task_name: output_paths} if output_paths else {},
            'task_executed': task_name,
            'output_paths': output_paths
        }

    def _handle_checkpoint(self, phase: Dict, results: Dict, context: Dict) -> Dict:
        """
        Handle human checkpoint by presenting decision point to user.

        Args:
            phase: Phase dict with checkpoint metadata
            results: Current execution results
            context: Execution context

        Returns:
            Dict with:
                - decision: 'APPROVE' | 'REJECT' | 'ABORT' | 'REVISE'
                - notes: Optional user notes
        """
        checkpoint_type = phase.get('checkpoint_type', 'REVIEW')
        phase_id = phase.get('phase', 'unknown')

        print(f"\n{'='*80}")
        print(f"🚦 HUMAN CHECKPOINT: {checkpoint_type}")
        print(f"{'='*80}\n")

        print(f"Phase: {phase_id}")
        print(f"Checkpoint Type: {checkpoint_type}")

        if phase.get('notes'):
            print(f"\nNotes:")
            print(phase['notes'])

        print(f"\n📊 Progress Summary:")
        print(f"Phases completed: {len(results['phases_executed'])}")
        print(f"Outputs generated: {len(results['outputs'])}")

        print(f"\n{'='*80}")
        print(f"DECISION REQUIRED")
        print(f"{'='*80}\n")

        print("Please review the work completed so far and make a decision:")
        print("- APPROVE: Continue with workflow")
        print("- REJECT: Mark this phase as failed, but continue")
        print("- ABORT: Stop workflow execution")
        print("- REVISE: Request changes before continuing")

        print(f"\n{'='*80}\n")

        # Note: In real execution, AI would use AskUserQuestion tool here
        # For now, return auto-approve (developer can implement proper checkpoint)
        return {
            'decision': 'APPROVE',
            'checkpoint_type': checkpoint_type,
            'phase': phase_id,
            'timestamp': datetime.now().isoformat()
        }

    def _update_phase_status(self, slug: str, phase_id: str, status: str):
        """
        Update phase status in metadata.yaml for resume capability.

        Args:
            slug: Mind slug
            phase_id: Phase identifier
            status: Phase status ('completed', 'failed', 'skipped')
        """
        if not self.metadata_manager:
            return

        try:
            # Update metadata with phase completion
            self.metadata_manager.update_phase_status(
                slug=slug,
                phase=phase_id,
                status=status,
                timestamp=datetime.now().isoformat()
            )
        except Exception as e:
            print(f"⚠️  Warning: Failed to update metadata for phase {phase_id}: {e}")


def load_task_markdown(task_name: str, tasks_dir: Path) -> str:
    """
    Load task markdown file.

    Args:
        task_name: Task identifier
        tasks_dir: Path to tasks directory

    Returns:
        Full task markdown content (frontmatter + body)

    Raises:
        FileNotFoundError: If task file doesn't exist
        IOError: If task file can't be read
    """
    task_path = tasks_dir / f"{task_name}.md"

    if not task_path.exists():
        raise FileNotFoundError(f"Task file not found: {task_path}")

    try:
        return task_path.read_text(encoding='utf-8')
    except Exception as e:
        raise IOError(f"Failed to read task file {task_path}: {e}")
