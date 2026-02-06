"""
MMOS Database Persister
=======================
Persists MMOS pipeline outputs directly to Supabase.
Complements metadata.yaml with database persistence.

Tables used:
- minds: Central mind registry
- mind_system_mappings: Assessment results (MBTI, Big5, etc.)
- mind_component_scores: Scores per component (dichotomies, dimensions)
- mind_drivers: Cognitive drivers detected
- mind_values: Value hierarchy
- mind_obsessions: Core interests/obsessions
- mind_profiles: System prompts
- fragments: Knowledge base chunks
- mind_tools: Frameworks/tools used by mind
- component_driver_map: Links system components to drivers (for inference)
- job_executions: Pipeline execution tracking

SQL Functions used:
- infer_drivers_from_scores(mind_id): Infers drivers from component scores

Author: MMOS Team
Created: 2025-12-19
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timezone
from contextlib import contextmanager

# Try Supabase client
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    Client = None

logger = logging.getLogger(__name__)


class MMOSPersister:
    """
    Handles persistence of MMOS pipeline outputs to Supabase.

    Usage:
        persister = MMOSPersister()

        # Phase 0: Init
        mind_id = persister.create_or_update_mind('sam_altman', 'Sam Altman')

        # Phase 1: Viability
        persister.save_viability_result(mind_id, apex_score=7.8, ...)

        # Phase 3: Analysis
        persister.save_system_mapping(mind_id, 'mbti', {'type': 'INTJ'}, ...)
        persister.save_drivers(mind_id, [{'driver_slug': 'curiosity', 'strength': 9}])

        # Phase 5: Implementation
        persister.save_mind_profile(mind_id, 'generalista', system_prompt_content)
    """

    def __init__(self):
        """Initialize Supabase client."""
        # Check feature flag
        self.feature_flag = os.getenv('MMOS_DB_PERSIST', 'false').lower() == 'true'

        if not self.feature_flag:
            logger.info("MMOS Database persistence DISABLED (set MMOS_DB_PERSIST=true to enable)")
            self.client = None
            return

        if not HAS_SUPABASE:
            logger.warning("supabase-py not installed. Run: pip install supabase")
            self.client = None
            return

        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

        if not supabase_url or not supabase_key:
            logger.warning(
                "SUPABASE_URL or SUPABASE_SERVICE_KEY not set. "
                "Database persistence will be skipped."
            )
            self.client = None
        else:
            self.client = create_client(supabase_url, supabase_key)
            logger.info("✓ MMOS Database persister initialized")

    def _is_enabled(self) -> bool:
        """Check if database persistence is enabled."""
        return self.feature_flag and self.client is not None

    @contextmanager
    def _safe_write(self):
        """
        Context manager for safe database writes.
        Logs errors but doesn't raise (filesystem is source of truth).
        """
        try:
            yield
        except Exception as e:
            logger.error(f"Database write failed: {e}", exc_info=True)

    def _now(self) -> str:
        """Get current timestamp in ISO format."""
        return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    # ═══════════════════════════════════════════════════════════════════════════
    # LOOKUP HELPERS
    # ═══════════════════════════════════════════════════════════════════════════

    def get_mind_id(self, slug: str) -> Optional[str]:
        """Get mind UUID by slug."""
        if not self._is_enabled():
            return None

        try:
            result = self.client.table('minds').select('id').eq('slug', slug).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Failed to get mind_id for '{slug}': {e}")
            return None

    def get_system_id(self, system_slug: str) -> Optional[str]:
        """Get mapping_system UUID by slug (e.g., 'mbti', 'big-five')."""
        if not self._is_enabled():
            return None

        try:
            result = self.client.table('mapping_systems').select('id').eq('slug', system_slug).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Failed to get system_id for '{system_slug}': {e}")
            return None

    def get_component_id(self, component_slug: str) -> Optional[str]:
        """Get system_component UUID by slug (e.g., 'mbti-intj', 'mbti-ei')."""
        if not self._is_enabled():
            return None

        try:
            result = self.client.table('system_components').select('id').eq('slug', component_slug).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Failed to get component_id for '{component_slug}': {e}")
            return None

    def get_driver_id(self, driver_slug: str) -> Optional[str]:
        """Get driver UUID by slug (e.g., 'curiosity', 'autonomy')."""
        if not self._is_enabled():
            return None

        try:
            result = self.client.table('drivers').select('id').eq('slug', driver_slug).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Failed to get driver_id for '{driver_slug}': {e}")
            return None

    def get_tool_id(self, tool_slug: str) -> Optional[str]:
        """Get toolbox UUID by slug (e.g., 'first-principles', 'inversion')."""
        if not self._is_enabled():
            return None

        try:
            result = self.client.table('toolbox').select('id').eq('slug', tool_slug).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]['id']
            return None
        except Exception as e:
            logger.error(f"Failed to get tool_id for '{tool_slug}': {e}")
            return None

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 0: INITIALIZATION
    # ═══════════════════════════════════════════════════════════════════════════

    def create_or_update_mind(
        self,
        slug: str,
        name: str,
        short_bio: Optional[str] = None,
        primary_language: str = 'en',
        avatar_url: Optional[str] = None,
        created_by: str = 'mmos_pipeline',
        mmos_metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """
        Create or update a mind record.

        Args:
            slug: Unique mind slug (e.g., 'sam_altman')
            name: Display name (e.g., 'Sam Altman')
            short_bio: Brief biography
            primary_language: Primary language code ('en', 'pt', etc.)
            avatar_url: URL to avatar image
            created_by: Creator identifier
            mmos_metadata: MMOS-specific metadata dict

        Returns:
            Mind UUID if successful, None if failed/disabled
        """
        if not self._is_enabled():
            return None

        with self._safe_write():
            # Check if mind already exists
            existing_id = self.get_mind_id(slug)

            data = {
                'slug': slug,
                'name': name,
                'short_bio': short_bio,
                'primary_language': primary_language,
                'avatar_url': avatar_url,
                'created_by': created_by,
                'mmos_metadata': mmos_metadata or {},
                'privacy_level': 'public'
            }

            # Filter None values
            data = {k: v for k, v in data.items() if v is not None}

            if existing_id:
                # Update existing
                data['updated_at'] = self._now()
                result = self.client.table('minds').update(data).eq('id', existing_id).execute()
                if result.data and len(result.data) > 0:
                    logger.info(f"✓ Updated mind: {slug} (id={existing_id})")
                    return existing_id
            else:
                # Create new
                result = self.client.table('minds').insert(data).execute()
                if result.data and len(result.data) > 0:
                    mind_id = result.data[0]['id']
                    logger.info(f"✓ Created mind: {slug} (id={mind_id})")
                    return mind_id

            logger.warning(f"✗ Failed to create/update mind: {slug}")
            return None

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 1: VIABILITY
    # ═══════════════════════════════════════════════════════════════════════════

    def save_viability_result(
        self,
        mind_id: str,
        apex_score: float,
        apex_breakdown: Optional[Dict[str, int]] = None,
        icp_match: Optional[Dict[str, Any]] = None,
        recommendation: str = 'GO',
        notes: Optional[str] = None
    ) -> bool:
        """
        Save viability assessment result.

        Args:
            mind_id: UUID of the mind
            apex_score: Overall APEX score (0-10)
            apex_breakdown: Score per dimension {availability: 8, public_persona: 7, ...}
            icp_match: ICP matching data
            recommendation: 'GO', 'NO-GO', or 'CONDITIONAL'
            notes: Additional notes

        Returns:
            True if successful, False otherwise
        """
        if not self._is_enabled():
            return False

        with self._safe_write():
            # Build mmos_metadata with viability data
            viability_data = {
                'viability': {
                    'apex_score': apex_score,
                    'apex_breakdown': apex_breakdown or {},
                    'icp_match': icp_match or {},
                    'recommendation': recommendation,
                    'notes': notes,
                    'assessed_at': self._now()
                }
            }

            # Fetch existing mmos_metadata and merge
            existing = self.client.table('minds').select('mmos_metadata').eq('id', mind_id).execute()
            if existing.data and len(existing.data) > 0:
                current_metadata = existing.data[0].get('mmos_metadata', {}) or {}
                viability_data = {**current_metadata, **viability_data}

            result = self.client.table('minds').update({
                'apex_score': apex_score,
                'mmos_metadata': viability_data,
                'updated_at': self._now()
            }).eq('id', mind_id).execute()

            success = result.data and len(result.data) > 0
            if success:
                logger.info(f"✓ Saved viability for mind {mind_id}: APEX={apex_score}, {recommendation}")
            else:
                logger.warning(f"✗ Failed to save viability for mind {mind_id}")
            return success

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 3: ANALYSIS (8 LAYERS)
    # ═══════════════════════════════════════════════════════════════════════════

    def save_system_mapping(
        self,
        mind_id: str,
        system_slug: str,
        result: Dict[str, Any],
        confidence: int = 70,
        evidence: Optional[List[str]] = None,
        notes: Optional[str] = None,
        assessed_by: str = 'mmos_pipeline'
    ) -> Optional[str]:
        """
        Save complete assessment result for a mapping system.

        Args:
            mind_id: UUID of the mind
            system_slug: System slug (e.g., 'mbti', 'big-five', 'enneagram')
            result: Structured result (e.g., {'type': 'INTJ', 'function_stack': ['Ni','Te','Fi','Se']})
            confidence: Confidence score 1-100
            evidence: List of evidence strings
            notes: Additional notes
            assessed_by: Who/what performed the assessment

        Returns:
            Mapping UUID if successful, None otherwise
        """
        if not self._is_enabled():
            return None

        with self._safe_write():
            system_id = self.get_system_id(system_slug)
            if not system_id:
                logger.warning(f"✗ System not found: {system_slug}")
                return None

            data = {
                'mind_id': mind_id,
                'system_id': system_id,
                'result': result,
                'confidence': max(1, min(100, confidence)),  # Clamp 1-100
                'evidence': evidence or [],
                'notes': notes,
                'assessed_by': assessed_by,
                'assessed_at': self._now()
            }

            # Filter None values
            data = {k: v for k, v in data.items() if v is not None}

            # Upsert: update if exists for same mind+system
            existing = self.client.table('mind_system_mappings').select('id').eq(
                'mind_id', mind_id
            ).eq('system_id', system_id).execute()

            if existing.data and len(existing.data) > 0:
                mapping_id = existing.data[0]['id']
                data['updated_at'] = self._now()
                result_db = self.client.table('mind_system_mappings').update(data).eq('id', mapping_id).execute()
            else:
                result_db = self.client.table('mind_system_mappings').insert(data).execute()

            if result_db.data and len(result_db.data) > 0:
                mapping_id = result_db.data[0]['id']
                logger.info(f"✓ Saved {system_slug} mapping for mind {mind_id}")
                return mapping_id

            logger.warning(f"✗ Failed to save {system_slug} mapping")
            return None

    def save_component_scores(
        self,
        mind_id: str,
        scores: List[Dict[str, Any]],
        assessed_by: str = 'mmos_pipeline'
    ) -> List[str]:
        """
        Save scores for multiple components (dichotomies, dimensions, etc.).

        Args:
            mind_id: UUID of the mind
            scores: List of score dicts, each containing:
                - component_slug: e.g., 'mbti-ei', 'big-five-openness'
                - score_numeric: Optional numeric score (0-100)
                - score_text: Optional text score (e.g., 'I', 'INTJ')
                - score_rank: Optional rank
                - confidence: Optional confidence (1-100)
                - evidence: Optional list of evidence strings
                - notes: Optional notes
            assessed_by: Who performed assessment

        Returns:
            List of created/updated score UUIDs
        """
        if not self._is_enabled():
            return []

        created_ids = []

        for score in scores:
            with self._safe_write():
                component_slug = score.get('component_slug')
                if not component_slug:
                    continue

                component_id = self.get_component_id(component_slug)
                if not component_id:
                    logger.warning(f"✗ Component not found: {component_slug}")
                    continue

                data = {
                    'mind_id': mind_id,
                    'component_id': component_id,
                    'score_numeric': score.get('score_numeric'),
                    'score_text': score.get('score_text'),
                    'score_rank': score.get('score_rank'),
                    'confidence': score.get('confidence'),
                    'evidence': score.get('evidence', []),
                    'notes': score.get('notes'),
                    'assessed_by': assessed_by,
                    'assessed_at': self._now()
                }

                # Filter None values
                data = {k: v for k, v in data.items() if v is not None}

                # Upsert: update if exists for same mind+component
                existing = self.client.table('mind_component_scores').select('id').eq(
                    'mind_id', mind_id
                ).eq('component_id', component_id).execute()

                if existing.data and len(existing.data) > 0:
                    score_id = existing.data[0]['id']
                    data['updated_at'] = self._now()
                    result = self.client.table('mind_component_scores').update(data).eq('id', score_id).execute()
                else:
                    result = self.client.table('mind_component_scores').insert(data).execute()

                if result.data and len(result.data) > 0:
                    created_ids.append(result.data[0]['id'])

        logger.info(f"✓ Saved {len(created_ids)}/{len(scores)} component scores for mind {mind_id}")
        return created_ids

    def save_drivers(
        self,
        mind_id: str,
        drivers: List[Dict[str, Any]],
        assessed_by: str = 'mmos_pipeline'
    ) -> List[str]:
        """
        Save cognitive drivers for a mind (Layer 5-6).

        Args:
            mind_id: UUID of the mind
            drivers: List of driver dicts, each containing:
                - driver_slug: e.g., 'curiosity', 'autonomy', 'mastery'
                - relationship: 'core', 'strong', 'moderate', 'weak'
                - strength: 1-10
                - evidence: Evidence text
                - context: Context where this driver manifests
                - confidence: Optional confidence score
            assessed_by: Who performed assessment

        Returns:
            List of created/updated driver mapping UUIDs
        """
        if not self._is_enabled():
            return []

        created_ids = []

        for driver in drivers:
            with self._safe_write():
                driver_slug = driver.get('driver_slug')
                if not driver_slug:
                    continue

                driver_id = self.get_driver_id(driver_slug)
                if not driver_id:
                    logger.warning(f"✗ Driver not found: {driver_slug}")
                    continue

                strength = driver.get('strength', 5)
                strength = max(1, min(10, strength))  # Clamp 1-10

                data = {
                    'mind_id': mind_id,
                    'driver_id': driver_id,
                    'relationship': driver.get('relationship', 'moderate'),
                    'strength': strength,
                    'evidence': driver.get('evidence'),
                    'context': driver.get('context'),
                    'confidence': driver.get('confidence'),
                    'assessed_by': assessed_by,
                    'extracted_at': self._now()
                }

                # Filter None values
                data = {k: v for k, v in data.items() if v is not None}

                # Upsert: update if exists for same mind+driver
                existing = self.client.table('mind_drivers').select('id').eq(
                    'mind_id', mind_id
                ).eq('driver_id', driver_id).execute()

                if existing.data and len(existing.data) > 0:
                    mapping_id = existing.data[0]['id']
                    data['updated_at'] = self._now()
                    result = self.client.table('mind_drivers').update(data).eq('id', mapping_id).execute()
                else:
                    result = self.client.table('mind_drivers').insert(data).execute()

                if result.data and len(result.data) > 0:
                    created_ids.append(result.data[0]['id'])

        logger.info(f"✓ Saved {len(created_ids)}/{len(drivers)} drivers for mind {mind_id}")
        return created_ids

    def save_values(
        self,
        mind_id: str,
        values: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Save value hierarchy for a mind (Layer 4).

        Args:
            mind_id: UUID of the mind
            values: List of value dicts, each containing:
                - name: Value name (e.g., 'Autonomy', 'Truth', 'Impact')
                - importance_10: Importance score 0-10
                - notes: Optional notes

        Returns:
            List of created value UUIDs
        """
        if not self._is_enabled():
            return []

        created_ids = []

        for value in values:
            with self._safe_write():
                name = value.get('name')
                if not name:
                    continue

                importance = value.get('importance_10', 5)
                importance = max(0, min(10, importance))  # Clamp 0-10

                data = {
                    'mind_id': mind_id,
                    'name': name,
                    'importance_10': importance,
                    'notes': value.get('notes')
                }

                # Filter None values
                data = {k: v for k, v in data.items() if v is not None}

                # Check if exists (by mind_id + name)
                existing = self.client.table('mind_values').select('id').eq(
                    'mind_id', mind_id
                ).eq('name', name).execute()

                if existing.data and len(existing.data) > 0:
                    value_id = existing.data[0]['id']
                    result = self.client.table('mind_values').update(data).eq('id', value_id).execute()
                else:
                    result = self.client.table('mind_values').insert(data).execute()

                if result.data and len(result.data) > 0:
                    created_ids.append(result.data[0]['id'])

        logger.info(f"✓ Saved {len(created_ids)}/{len(values)} values for mind {mind_id}")
        return created_ids

    def save_obsessions(
        self,
        mind_id: str,
        obsessions: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Save core obsessions/interests for a mind (Layer 5).

        Args:
            mind_id: UUID of the mind
            obsessions: List of obsession dicts, each containing:
                - name: Topic/obsession name (e.g., 'AI Safety', 'Compounding')
                - intensity_10: Intensity score 0-10
                - notes: Optional notes
                - driven_by: Optional driver_slug that drives this obsession

        Returns:
            List of created obsession UUIDs
        """
        if not self._is_enabled():
            return []

        created_ids = []

        for obsession in obsessions:
            with self._safe_write():
                name = obsession.get('name')
                if not name:
                    continue

                intensity = obsession.get('intensity_10', 5)
                intensity = max(0, min(10, intensity))  # Clamp 0-10

                # Resolve driver if provided
                driven_by = None
                driver_slug = obsession.get('driven_by')
                if driver_slug:
                    driven_by = self.get_driver_id(driver_slug)

                data = {
                    'mind_id': mind_id,
                    'name': name,
                    'intensity_10': intensity,
                    'notes': obsession.get('notes'),
                    'driven_by': driven_by
                }

                # Filter None values
                data = {k: v for k, v in data.items() if v is not None}

                # Check if exists (by mind_id + name)
                existing = self.client.table('mind_obsessions').select('id').eq(
                    'mind_id', mind_id
                ).eq('name', name).execute()

                if existing.data and len(existing.data) > 0:
                    obs_id = existing.data[0]['id']
                    result = self.client.table('mind_obsessions').update(data).eq('id', obs_id).execute()
                else:
                    result = self.client.table('mind_obsessions').insert(data).execute()

                if result.data and len(result.data) > 0:
                    created_ids.append(result.data[0]['id'])

        logger.info(f"✓ Saved {len(created_ids)}/{len(obsessions)} obsessions for mind {mind_id}")
        return created_ids

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 4: SYNTHESIS
    # ═══════════════════════════════════════════════════════════════════════════

    def save_fragments(
        self,
        mind_id: str,
        source_id: str,
        fragments: List[Dict[str, Any]],
        category_id: int = 1
    ) -> List[str]:
        """
        Save knowledge base fragments (for RAG).

        Args:
            mind_id: UUID of the mind
            source_id: UUID of the source content
            fragments: List of fragment dicts, each containing:
                - type: Fragment type (e.g., 'quote', 'insight', 'principle')
                - content: The fragment content
                - context: Context around the fragment
                - insight: Extracted insight
                - location: Location in source (e.g., 'page 47', 'timestamp 12:34')
                - relevance: Relevance score 0-10
                - metadata: Optional additional metadata
            category_id: Category ID (default 1)

        Returns:
            List of created fragment UUIDs
        """
        if not self._is_enabled():
            return []

        created_ids = []

        for fragment in fragments:
            with self._safe_write():
                content = fragment.get('content')
                if not content:
                    continue

                relevance = fragment.get('relevance', 5)
                relevance = max(0, min(10, relevance))  # Clamp 0-10

                data = {
                    'mind_id': mind_id,
                    'source_id': source_id,
                    'category_id': category_id,
                    'type': fragment.get('type', 'quote'),
                    'content': content,
                    'context': fragment.get('context', ''),
                    'insight': fragment.get('insight', ''),
                    'location': fragment.get('location', ''),
                    'relevance': relevance,
                    'metadata': fragment.get('metadata', {})
                }

                result = self.client.table('fragments').insert(data).execute()

                if result.data and len(result.data) > 0:
                    created_ids.append(result.data[0]['id'])

        logger.info(f"✓ Saved {len(created_ids)}/{len(fragments)} fragments for mind {mind_id}")
        return created_ids

    def save_mind_tools(
        self,
        mind_id: str,
        tools: List[Dict[str, Any]],
        assessed_by: str = 'mmos_pipeline'
    ) -> List[str]:
        """
        Link cognitive tools/frameworks to a mind.

        Args:
            mind_id: UUID of the mind
            tools: List of tool dicts, each containing:
                - tool_slug: e.g., 'first-principles', 'inversion', 'second-order-thinking'
                - usage_frequency: 'signature', 'frequent', 'occasional', 'rare'
                - proficiency: Optional proficiency level
                - evidence: Evidence of tool usage
                - context: Context where tool is used
            assessed_by: Who performed assessment

        Returns:
            List of created mind_tool UUIDs
        """
        if not self._is_enabled():
            return []

        created_ids = []

        for tool in tools:
            with self._safe_write():
                tool_slug = tool.get('tool_slug')
                if not tool_slug:
                    continue

                tool_id = self.get_tool_id(tool_slug)
                if not tool_id:
                    logger.warning(f"✗ Tool not found: {tool_slug}")
                    continue

                data = {
                    'mind_id': mind_id,
                    'tool_id': tool_id,
                    'usage_frequency': tool.get('usage_frequency', 'occasional'),
                    'proficiency': tool.get('proficiency'),
                    'evidence': tool.get('evidence'),
                    'context': tool.get('context'),
                    'assessed_by': assessed_by,
                    'extracted_at': self._now()
                }

                # Filter None values
                data = {k: v for k, v in data.items() if v is not None}

                # Upsert: update if exists for same mind+tool
                existing = self.client.table('mind_tools').select('id').eq(
                    'mind_id', mind_id
                ).eq('tool_id', tool_id).execute()

                if existing.data and len(existing.data) > 0:
                    mapping_id = existing.data[0]['id']
                    result = self.client.table('mind_tools').update(data).eq('id', mapping_id).execute()
                else:
                    result = self.client.table('mind_tools').insert(data).execute()

                if result.data and len(result.data) > 0:
                    created_ids.append(result.data[0]['id'])

        logger.info(f"✓ Saved {len(created_ids)}/{len(tools)} tools for mind {mind_id}")
        return created_ids

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 5: IMPLEMENTATION
    # ═══════════════════════════════════════════════════════════════════════════

    def save_mind_profile(
        self,
        mind_id: str,
        profile_type: str,
        content_text: str,
        content_json: Optional[Dict[str, Any]] = None,
        storage_format: str = 'md',
        is_ai_generated: bool = True,
        generation_execution_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Save system prompt / mind profile.

        Args:
            mind_id: UUID of the mind
            profile_type: Type of profile ('generalista', 'copywriter', 'strategist', etc.)
            content_text: System prompt content (markdown)
            content_json: Optional structured version
            storage_format: 'md', 'json', 'yaml'
            is_ai_generated: Whether AI generated this
            generation_execution_id: Optional job execution ID

        Returns:
            Profile UUID if successful, None otherwise
        """
        if not self._is_enabled():
            return None

        with self._safe_write():
            data = {
                'mind_id': mind_id,
                'profile_type': profile_type,
                'content_text': content_text,
                'content_json': content_json,
                'storage_format': storage_format,
                'is_ai_generated': is_ai_generated,
                'generation_execution_id': generation_execution_id
            }

            # Filter None values
            data = {k: v for k, v in data.items() if v is not None}

            # Upsert: update if exists for same mind+profile_type
            existing = self.client.table('mind_profiles').select('id').eq(
                'mind_id', mind_id
            ).eq('profile_type', profile_type).execute()

            if existing.data and len(existing.data) > 0:
                profile_id = existing.data[0]['id']
                data['updated_at'] = self._now()
                result = self.client.table('mind_profiles').update(data).eq('id', profile_id).execute()
            else:
                result = self.client.table('mind_profiles').insert(data).execute()

            if result.data and len(result.data) > 0:
                profile_id = result.data[0]['id']
                logger.info(f"✓ Saved {profile_type} profile for mind {mind_id}")
                return profile_id

            logger.warning(f"✗ Failed to save {profile_type} profile")
            return None

    # ═══════════════════════════════════════════════════════════════════════════
    # PHASE 6: TESTING
    # ═══════════════════════════════════════════════════════════════════════════

    def update_mind_fidelity(
        self,
        mind_id: str,
        overall: float,
        personality: Optional[float] = None,
        knowledge: Optional[float] = None,
        style: Optional[float] = None
    ) -> bool:
        """
        Update fidelity scores after testing phase.

        Args:
            mind_id: UUID of the mind
            overall: Overall fidelity score (0.0-1.0)
            personality: Personality fidelity (0.0-1.0)
            knowledge: Knowledge fidelity (0.0-1.0)
            style: Style fidelity (0.0-1.0)

        Returns:
            True if successful, False otherwise
        """
        if not self._is_enabled():
            return False

        with self._safe_write():
            # Fetch existing mmos_metadata
            existing = self.client.table('minds').select('mmos_metadata').eq('id', mind_id).execute()
            current_metadata = {}
            if existing.data and len(existing.data) > 0:
                current_metadata = existing.data[0].get('mmos_metadata', {}) or {}

            # Build fidelity data
            fidelity_data = {
                'overall': overall,
                'tested_at': self._now()
            }
            if personality is not None:
                fidelity_data['personality'] = personality
            if knowledge is not None:
                fidelity_data['knowledge'] = knowledge
            if style is not None:
                fidelity_data['style'] = style

            # Merge with existing metadata
            current_metadata['fidelity'] = fidelity_data

            result = self.client.table('minds').update({
                'mmos_metadata': current_metadata,
                'updated_at': self._now()
            }).eq('id', mind_id).execute()

            success = result.data and len(result.data) > 0
            if success:
                logger.info(f"✓ Updated fidelity for mind {mind_id}: {overall:.0%}")
            else:
                logger.warning(f"✗ Failed to update fidelity for mind {mind_id}")
            return success

    # ═══════════════════════════════════════════════════════════════════════════
    # TRACKING & UTILITIES
    # ═══════════════════════════════════════════════════════════════════════════

    def track_job_execution(
        self,
        name: str,
        status: str = 'completed',
        llm_provider: str = 'anthropic',
        llm_model: str = 'claude-3-opus',
        tokens_prompt: int = 0,
        tokens_completion: int = 0,
        cost_usd: float = 0.0,
        latency_ms: Optional[int] = None,
        params: Optional[Dict[str, Any]] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> Optional[str]:
        """
        Track a job execution (LLM call, pipeline phase, etc.).

        Args:
            name: Job name (e.g., 'viability_assessment', 'layer_3_analysis')
            status: 'completed', 'failed', 'in_progress'
            llm_provider: LLM provider ('anthropic', 'openai', 'google')
            llm_model: Model used
            tokens_prompt: Prompt tokens used
            tokens_completion: Completion tokens used
            cost_usd: Cost in USD
            latency_ms: Latency in milliseconds
            params: Input parameters
            result: Output result
            error: Error message if failed

        Returns:
            Job execution UUID if successful, None otherwise
        """
        if not self._is_enabled():
            return None

        with self._safe_write():
            data = {
                'name': name,
                'status': status,
                'llm_provider': llm_provider,
                'llm_model': llm_model,
                'tokens_prompt': tokens_prompt,
                'tokens_completion': tokens_completion,
                'tokens_total': tokens_prompt + tokens_completion,
                'cost_usd': cost_usd,
                'latency_ms': latency_ms,
                'params': params,
                'result': result,
                'error': error,
                'executed_at': self._now()
            }

            # Filter None values
            data = {k: v for k, v in data.items() if v is not None}

            result_db = self.client.table('job_executions').insert(data).execute()

            if result_db.data and len(result_db.data) > 0:
                job_id = result_db.data[0]['id']
                logger.info(f"✓ Tracked job: {name} (id={job_id})")
                return job_id

            logger.warning(f"✗ Failed to track job: {name}")
            return None

    def update_pipeline_status(
        self,
        mind_id: str,
        status: str,
        phase_completed: Optional[str] = None
    ) -> bool:
        """
        Update pipeline status in mmos_metadata.

        Args:
            mind_id: UUID of the mind
            status: Pipeline status ('not_started', 'viability', 'research',
                    'analysis', 'synthesis', 'implementation', 'testing', 'completed')
            phase_completed: Optional phase that was just completed

        Returns:
            True if successful, False otherwise
        """
        if not self._is_enabled():
            return False

        with self._safe_write():
            # Fetch existing mmos_metadata
            existing = self.client.table('minds').select('mmos_metadata').eq('id', mind_id).execute()
            current_metadata = {}
            if existing.data and len(existing.data) > 0:
                current_metadata = existing.data[0].get('mmos_metadata', {}) or {}

            # Update pipeline status
            current_metadata['pipeline_status'] = status
            current_metadata['last_updated'] = self._now()

            if phase_completed:
                if 'phases_completed' not in current_metadata:
                    current_metadata['phases_completed'] = []
                if phase_completed not in current_metadata['phases_completed']:
                    current_metadata['phases_completed'].append(phase_completed)

            result = self.client.table('minds').update({
                'mmos_metadata': current_metadata,
                'updated_at': self._now()
            }).eq('id', mind_id).execute()

            success = result.data and len(result.data) > 0
            if success:
                logger.info(f"✓ Updated pipeline status for mind {mind_id}: {status}")
            return success

    # ═══════════════════════════════════════════════════════════════════════════
    # DRIVER INFERENCE
    # ═══════════════════════════════════════════════════════════════════════════

    def infer_drivers_from_scores(self, mind_id: str) -> List[Dict[str, Any]]:
        """
        Infer drivers from component scores using component_driver_map.

        Uses SQL function: infer_drivers_from_scores(mind_id)

        This function:
        1. Looks up scores in mind_component_scores
        2. Joins with component_driver_map to find related drivers
        3. Weights by relevance (primary=1x, secondary=0.7x, partial=0.5x, inverse=100-score)
        4. Returns aggregated driver strengths

        Args:
            mind_id: UUID of the mind

        Returns:
            List of dicts with:
                - driver_name: Name of the driver
                - driver_type: Type (cognitive, motivational, etc.)
                - inferred_strength: Weighted average score (0-100)
                - source_components: Array of component names used

        Note:
            Requires component_driver_map to be populated.
            Returns empty list if no mappings exist.
        """
        if not self._is_enabled():
            return []

        try:
            # Call the SQL function via RPC
            result = self.client.rpc(
                'infer_drivers_from_scores',
                {'p_mind_id': mind_id}
            ).execute()

            if result.data:
                logger.info(f"✓ Inferred {len(result.data)} drivers for mind {mind_id}")
                return result.data
            return []

        except Exception as e:
            logger.error(f"Failed to infer drivers for mind {mind_id}: {e}")
            return []

    def get_component_driver_mappings(self, component_slug: str) -> List[Dict[str, Any]]:
        """
        Get all driver mappings for a component.

        Args:
            component_slug: Slug of the component (e.g., 'mbti-ei', 'big-five-openness')

        Returns:
            List of dicts with driver info and relevance
        """
        if not self._is_enabled():
            return []

        try:
            component_id = self.get_component_id(component_slug)
            if not component_id:
                logger.warning(f"Component not found: {component_slug}")
                return []

            result = self.client.table('component_driver_map').select(
                'id, relevance, notes, drivers(slug, name, driver_type, domain)'
            ).eq('component_id', component_id).execute()

            if result.data:
                return result.data
            return []

        except Exception as e:
            logger.error(f"Failed to get driver mappings for {component_slug}: {e}")
            return []

    def save_component_driver_mapping(
        self,
        component_slug: str,
        driver_slug: str,
        relevance: str = 'primary',
        notes: Optional[str] = None
    ) -> Optional[str]:
        """
        Save a mapping between a component and a driver.

        Args:
            component_slug: Slug of the component
            driver_slug: Slug of the driver
            relevance: 'primary', 'secondary', 'partial', or 'inverse'
            notes: Optional notes about the mapping

        Returns:
            Mapping UUID if successful, None otherwise
        """
        if not self._is_enabled():
            return None

        with self._safe_write():
            component_id = self.get_component_id(component_slug)
            driver_id = self.get_driver_id(driver_slug)

            if not component_id:
                logger.warning(f"Component not found: {component_slug}")
                return None
            if not driver_id:
                logger.warning(f"Driver not found: {driver_slug}")
                return None

            data = {
                'component_id': component_id,
                'driver_id': driver_id,
                'relevance': relevance,
                'notes': notes
            }

            # Filter None values
            data = {k: v for k, v in data.items() if v is not None}

            # Upsert: update if exists
            existing = self.client.table('component_driver_map').select('id').eq(
                'component_id', component_id
            ).eq('driver_id', driver_id).execute()

            if existing.data and len(existing.data) > 0:
                mapping_id = existing.data[0]['id']
                result = self.client.table('component_driver_map').update(data).eq('id', mapping_id).execute()
            else:
                result = self.client.table('component_driver_map').insert(data).execute()

            if result.data and len(result.data) > 0:
                mapping_id = result.data[0]['id']
                logger.info(f"✓ Saved component-driver mapping: {component_slug} → {driver_slug}")
                return mapping_id

            return None

    def bulk_save_component_driver_mappings(
        self,
        mappings: List[Dict[str, Any]]
    ) -> int:
        """
        Bulk save component-driver mappings.

        Args:
            mappings: List of dicts with:
                - component_slug: Component slug
                - driver_slug: Driver slug
                - relevance: 'primary', 'secondary', 'partial', 'inverse'
                - notes: Optional notes

        Returns:
            Number of mappings saved
        """
        if not self._is_enabled():
            return 0

        saved = 0
        for mapping in mappings:
            result = self.save_component_driver_mapping(
                component_slug=mapping['component_slug'],
                driver_slug=mapping['driver_slug'],
                relevance=mapping.get('relevance', 'primary'),
                notes=mapping.get('notes')
            )
            if result:
                saved += 1

        logger.info(f"✓ Bulk saved {saved}/{len(mappings)} component-driver mappings")
        return saved


# ═══════════════════════════════════════════════════════════════════════════════
# CONVENIENCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def get_persister() -> MMOSPersister:
    """Get singleton persister instance."""
    if not hasattr(get_persister, '_instance'):
        get_persister._instance = MMOSPersister()
    return get_persister._instance


# Example usage
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    # Enable persistence
    os.environ['MMOS_DB_PERSIST'] = 'true'

    persister = MMOSPersister()

    if persister._is_enabled():
        # Example: Create mind and save analysis
        mind_id = persister.create_or_update_mind(
            slug='test_mind',
            name='Test Mind',
            short_bio='A test mind for demonstration'
        )

        if mind_id:
            # Save viability
            persister.save_viability_result(
                mind_id=mind_id,
                apex_score=7.5,
                apex_breakdown={
                    'availability': 8,
                    'public_persona': 7,
                    'expertise': 8,
                    'x_factor': 7,
                    'temporal': 8,
                    'value': 7
                },
                recommendation='GO'
            )

            # Save MBTI mapping
            persister.save_system_mapping(
                mind_id=mind_id,
                system_slug='mbti',
                result={
                    'type': 'INTJ',
                    'function_stack': ['Ni', 'Te', 'Fi', 'Se']
                },
                confidence=85,
                evidence=['Source 1: quote about strategic thinking...']
            )

            # Save component scores
            persister.save_component_scores(
                mind_id=mind_id,
                scores=[
                    {'component_slug': 'mbti-ei', 'score_numeric': 25, 'score_text': 'I'},
                    {'component_slug': 'mbti-sn', 'score_numeric': 80, 'score_text': 'N'},
                    {'component_slug': 'mbti-tf', 'score_numeric': 70, 'score_text': 'T'},
                    {'component_slug': 'mbti-jp', 'score_numeric': 75, 'score_text': 'J'},
                ]
            )

            # Save drivers
            persister.save_drivers(
                mind_id=mind_id,
                drivers=[
                    {'driver_slug': 'curiosity', 'strength': 9, 'relationship': 'core'},
                    {'driver_slug': 'autonomy', 'strength': 8, 'relationship': 'strong'},
                ]
            )

            # Save values
            persister.save_values(
                mind_id=mind_id,
                values=[
                    {'name': 'Truth', 'importance_10': 10},
                    {'name': 'Impact', 'importance_10': 9},
                    {'name': 'Autonomy', 'importance_10': 8},
                ]
            )

            # Save obsessions
            persister.save_obsessions(
                mind_id=mind_id,
                obsessions=[
                    {'name': 'AI Safety', 'intensity_10': 10, 'driven_by': 'curiosity'},
                    {'name': 'Compounding', 'intensity_10': 8},
                ]
            )

            # Save profile
            persister.save_mind_profile(
                mind_id=mind_id,
                profile_type='generalista',
                content_text='# Test Mind System Prompt\n\nYou are Test Mind...',
                is_ai_generated=True
            )

            # Update fidelity
            persister.update_mind_fidelity(
                mind_id=mind_id,
                overall=0.94,
                personality=0.96,
                knowledge=0.92,
                style=0.93
            )

            # Infer drivers from scores (requires component_driver_map populated)
            inferred = persister.infer_drivers_from_scores(mind_id)
            if inferred:
                print(f"\n📊 Inferred drivers: {len(inferred)}")
                for driver in inferred[:5]:
                    print(f"  - {driver['driver_name']}: {driver['inferred_strength']:.1f}")
            else:
                print("\n⚠️  No drivers inferred (component_driver_map may be empty)")

            print("\n✅ All operations completed successfully!")
    else:
        print("Database persistence is disabled. Set MMOS_DB_PERSIST=true to enable.")
