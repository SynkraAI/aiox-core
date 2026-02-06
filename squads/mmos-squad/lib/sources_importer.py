"""
MMOS Sources Importer
=====================
Import mind sources from filesystem (outputs/minds/{mind_slug}/sources/) into Supabase database.

Features:
- Read sources.yaml inventory + actual content files
- Map to contents table schema
- Skip duplicates (based on slug)
- Raw content import (no AI processing)
- Transaction-based safety
- Detailed import reporting

Usage:
    from sources_importer import SourcesImporter

    importer = SourcesImporter()
    result = importer.import_mind_sources("sam_altman", preview=False)
    print(result)
"""

import os
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

# Try Supabase client first, fall back to psycopg2
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

try:
    import psycopg2
    import psycopg2.extras
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False


class SourcesImporter:
    """Import MMOS mind sources into Supabase database."""

    # Type mapping: YAML type → contents.content_type
    TYPE_MAPPING = {
        'blog': 'article',
        'pdf': 'essay',
        'youtube': 'video_transcript',
        'interview': 'interview',
        'podcast': 'podcast_transcript',
        'book': 'book_excerpt',
        'article': 'article',
        'essay': 'essay',
        'speech': 'speech',
        'social_media_post': 'social_media_post',
        'email': 'email',
        'conversation': 'conversation',
        'academic_paper': 'academic_paper',
    }

    # Status mapping: YAML status → contents.status
    STATUS_MAPPING = {
        'COLLECTED': 'published',
        'PENDING': 'draft',
        'PROCESSING': 'draft',
    }

    def __init__(self, db_url: Optional[str] = None):
        """
        Initialize importer with database connection.

        Args:
            db_url: PostgreSQL connection URL (defaults to SUPABASE_DB_URL or DATABASE_URL env var)
        """
        self.db_url = db_url or os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")

        if not self.db_url:
            raise ValueError(
                "Missing database connection. Set SUPABASE_DB_URL or DATABASE_URL environment variable."
            )

        if not HAS_PSYCOPG2:
            raise ValueError("psycopg2 not installed. Run: pip install psycopg2-binary")

        # Test connection
        try:
            conn = psycopg2.connect(self.db_url)
            conn.close()
        except Exception as e:
            raise ValueError(f"Failed to connect to database: {e}")

        self.project_root = Path(__file__).parent.parent.parent.parent

    def get_mind_id(self, mind_slug: str) -> Optional[str]:
        """
        Get mind UUID from database by slug.

        Args:
            mind_slug: Mind slug (e.g., 'sam_altman')

        Returns:
            Mind UUID or None if not found
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()
            cur.execute("SELECT id FROM minds WHERE slug = %s", (mind_slug,))
            result = cur.fetchone()
            cur.close()
            conn.close()
            return str(result[0]) if result else None
        except Exception as e:
            raise ValueError(f"Failed to fetch mind ID for '{mind_slug}': {e}")

    def load_sources_yaml(self, mind_slug: str) -> Dict[str, Any]:
        """
        Load sources.yaml for a mind.

        Args:
            mind_slug: Mind slug

        Returns:
            Parsed YAML data
        """
        sources_file = self.project_root / f"outputs/minds/{mind_slug}/sources/sources.yaml"

        if not sources_file.exists():
            raise FileNotFoundError(f"sources.yaml not found: {sources_file}")

        with open(sources_file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def read_source_content(self, file_path: str) -> Optional[str]:
        """
        Read content from source file.

        Args:
            file_path: Relative path from project root

        Returns:
            File content or None if file doesn't exist
        """
        full_path = self.project_root / file_path

        if not full_path.exists():
            return None

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"⚠️  Failed to read {file_path}: {e}")
            return None

    def map_source_to_content(self, source: Dict[str, Any], mind_slug: str) -> Dict[str, Any]:
        """
        Map source YAML entry to contents table schema.

        Args:
            source: Source entry from YAML
            mind_slug: Mind slug for prefixing

        Returns:
            Mapped content data for database insertion
        """
        source_type = source.get('type', 'other')
        content_type = self.TYPE_MAPPING.get(source_type, 'other')

        source_status = source.get('status', 'PENDING')
        status = self.STATUS_MAPPING.get(source_status, 'draft')

        # Generate slug: mind_slug-source_id
        slug = f"{mind_slug}-{source['id']}"

        # Read content from file
        file_path = source.get('file_path')
        content = self.read_source_content(file_path) if file_path else None

        # Build metadata
        metadata = {
            'original_id': source['id'],
            'source_url': source.get('url'),
            'source_platform': source.get('platform'),
            'quality': source.get('priority', 'MEDIUM'),
            'language': 'en',  # Default to English, can be enhanced
            'processing_status': 'completed' if source_status == 'COLLECTED' else 'pending',
        }

        # Remove None values from metadata
        metadata = {k: v for k, v in metadata.items() if v is not None}

        return {
            'ai_generated': False,
            'content_type': content_type,
            'slug': slug,
            'title': source['title'],
            'content': content,
            'file_path': file_path,
            'status': status,
            'metadata': metadata,
        }

    def content_exists(self, slug: str) -> bool:
        """
        Check if content with slug already exists in database.

        Args:
            slug: Content slug

        Returns:
            True if exists, False otherwise
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()
            cur.execute("SELECT id FROM contents WHERE slug = %s", (slug,))
            result = cur.fetchone()
            cur.close()
            conn.close()
            return result is not None
        except Exception:
            return False

    def insert_content(self, content_data: Dict[str, Any]) -> Optional[str]:
        """
        Insert content into database.

        Args:
            content_data: Content data to insert

        Returns:
            Inserted content UUID or None if failed
        """
        try:
            import json
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()

            # Convert metadata dict to JSON string
            metadata_json = json.dumps(content_data['metadata'])

            cur.execute("""
                INSERT INTO contents (
                    ai_generated, content_type, slug, title, content,
                    file_path, status, metadata
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s::jsonb
                ) RETURNING id
            """, (
                content_data['ai_generated'],
                content_data['content_type'],
                content_data['slug'],
                content_data['title'],
                content_data['content'],
                content_data['file_path'],
                content_data['status'],
                metadata_json
            ))

            result = cur.fetchone()
            content_id = str(result[0]) if result else None

            conn.commit()
            cur.close()
            conn.close()

            return content_id
        except Exception as e:
            print(f"❌ Failed to insert content '{content_data['slug']}': {e}")
            return None

    def link_content_to_mind(self, content_id: str, mind_id: str, role: str = 'author') -> bool:
        """
        Link content to mind via content_minds junction table.

        Args:
            content_id: Content UUID
            mind_id: Mind UUID
            role: Mind's role in content (default: 'author')

        Returns:
            True if successful, False otherwise
        """
        try:
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()

            cur.execute("""
                INSERT INTO content_minds (content_id, mind_id, role)
                VALUES (%s, %s, %s)
            """, (content_id, mind_id, role))

            conn.commit()
            cur.close()
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Failed to link content to mind: {e}")
            return False

    def import_mind_sources(
        self,
        mind_slug: str,
        preview: bool = False,
        skip_existing: bool = True
    ) -> Dict[str, Any]:
        """
        Import all sources for a mind into database.

        Args:
            mind_slug: Mind slug (e.g., 'sam_altman')
            preview: If True, only show what would be imported (dry run)
            skip_existing: If True, skip sources that already exist

        Returns:
            Import result with statistics
        """
        result = {
            'mind_slug': mind_slug,
            'preview': preview,
            'timestamp': datetime.now().isoformat(),
            'total_sources': 0,
            'imported': 0,
            'skipped': 0,
            'failed': 0,
            'details': [],
        }

        try:
            # 1. Get mind ID
            mind_id = self.get_mind_id(mind_slug)
            if not mind_id:
                result['error'] = f"Mind '{mind_slug}' not found in database"
                return result

            # 2. Load sources.yaml
            sources_data = self.load_sources_yaml(mind_slug)
            sources = sources_data.get('sources', [])
            result['total_sources'] = len(sources)

            # 3. Process each source
            for source in sources:
                source_id = source['id']

                # Map to content schema
                content_data = self.map_source_to_content(source, mind_slug)
                slug = content_data['slug']

                # Check if already exists
                if skip_existing and self.content_exists(slug):
                    result['skipped'] += 1
                    result['details'].append({
                        'source_id': source_id,
                        'slug': slug,
                        'status': 'skipped',
                        'reason': 'already_exists',
                    })
                    print(f"⏭️  Skipped: {slug} (already exists)")
                    continue

                # Preview mode: don't actually insert
                if preview:
                    result['details'].append({
                        'source_id': source_id,
                        'slug': slug,
                        'status': 'preview',
                        'data': content_data,
                    })
                    print(f"👁️  Preview: {slug}")
                    continue

                # Insert content
                content_id = self.insert_content(content_data)

                if content_id:
                    # Link to mind
                    linked = self.link_content_to_mind(content_id, mind_id, role='author')

                    if linked:
                        result['imported'] += 1
                        result['details'].append({
                            'source_id': source_id,
                            'slug': slug,
                            'content_id': content_id,
                            'status': 'imported',
                        })
                        print(f"✅ Imported: {slug}")
                    else:
                        result['failed'] += 1
                        result['details'].append({
                            'source_id': source_id,
                            'slug': slug,
                            'status': 'failed',
                            'reason': 'link_failed',
                        })
                else:
                    result['failed'] += 1
                    result['details'].append({
                        'source_id': source_id,
                        'slug': slug,
                        'status': 'failed',
                        'reason': 'insert_failed',
                    })

            return result

        except Exception as e:
            result['error'] = str(e)
            return result

    def validate_import(self, mind_slug: str) -> Dict[str, Any]:
        """
        Validate sources before import.

        Args:
            mind_slug: Mind slug

        Returns:
            Validation result
        """
        validation = {
            'mind_slug': mind_slug,
            'valid': True,
            'checks': [],
            'warnings': [],
            'errors': [],
        }

        try:
            # Check 1: Mind exists in database
            mind_id = self.get_mind_id(mind_slug)
            if mind_id:
                validation['checks'].append(f"✓ Mind '{mind_slug}' exists in database (ID: {mind_id})")
            else:
                validation['valid'] = False
                validation['errors'].append(f"✗ Mind '{mind_slug}' not found in database")
                return validation

            # Check 2: sources.yaml exists
            try:
                sources_data = self.load_sources_yaml(mind_slug)
                sources = sources_data.get('sources', [])
                validation['checks'].append(f"✓ sources.yaml loaded ({len(sources)} sources)")
            except FileNotFoundError as e:
                validation['valid'] = False
                validation['errors'].append(f"✗ sources.yaml not found: {e}")
                return validation

            # Check 3: Validate source files
            missing_files = 0
            for source in sources:
                file_path = source.get('file_path')
                if file_path:
                    full_path = self.project_root / file_path
                    if not full_path.exists():
                        missing_files += 1
                        validation['warnings'].append(f"⚠ Missing file: {file_path}")

            if missing_files > 0:
                validation['warnings'].append(f"⚠ {missing_files}/{len(sources)} source files missing")
            else:
                validation['checks'].append(f"✓ All {len(sources)} source files exist")

            # Check 4: Check for duplicates
            existing_count = 0
            for source in sources:
                slug = f"{mind_slug}-{source['id']}"
                if self.content_exists(slug):
                    existing_count += 1

            if existing_count > 0:
                validation['warnings'].append(f"⚠ {existing_count}/{len(sources)} sources already exist (will be skipped)")
            else:
                validation['checks'].append(f"✓ No duplicates found")

            return validation

        except Exception as e:
            validation['valid'] = False
            validation['errors'].append(f"✗ Validation failed: {e}")
            return validation

    def discover_artifacts(self, mind_slug: str) -> List[Dict[str, Any]]:
        """
        Discover all artifacts for a mind (AI-generated content).

        Args:
            mind_slug: Mind slug

        Returns:
            List of artifact file info dicts
        """
        mind_dir = self.project_root / f"outputs/minds/{mind_slug}"
        artifacts = []

        # Artifact directories to scan
        artifact_dirs = {
            'artifacts': 'artifact',
            'system_prompts': 'system_prompt',
            'kb': 'kb_chunk',
            'docs': 'documentation',
        }

        for dir_name, artifact_type in artifact_dirs.items():
            dir_path = mind_dir / dir_name
            if not dir_path.exists():
                continue

            # Find all .md and .yaml files recursively
            for file_path in dir_path.rglob('*'):
                if not file_path.is_file():
                    continue

                # Only .md, .yaml, .yml files
                if file_path.suffix not in ['.md', '.yaml', '.yml', '.txt']:
                    continue

                # Skip certain files
                skip_files = ['README.md', 'DEPRECATED.md', '.DS_Store']
                if file_path.name in skip_files:
                    continue

                # Relative path from mind dir
                rel_path = file_path.relative_to(mind_dir)

                artifacts.append({
                    'file_path': str(file_path.relative_to(self.project_root)),
                    'name': file_path.stem,
                    'artifact_type': artifact_type,
                    'dir': dir_name,
                    'extension': file_path.suffix,
                })

        return artifacts

    def import_mind_artifacts(
        self,
        mind_slug: str,
        preview: bool = False,
        skip_existing: bool = True
    ) -> Dict[str, Any]:
        """
        Import all artifacts for a mind (AI-generated content).

        Args:
            mind_slug: Mind slug
            preview: If True, dry run
            skip_existing: If True, skip existing artifacts

        Returns:
            Import result with statistics
        """
        result = {
            'mind_slug': mind_slug,
            'preview': preview,
            'timestamp': datetime.now().isoformat(),
            'total_artifacts': 0,
            'imported': 0,
            'skipped': 0,
            'failed': 0,
            'details': [],
        }

        try:
            # 1. Get mind ID
            mind_id = self.get_mind_id(mind_slug)
            if not mind_id:
                result['error'] = f"Mind '{mind_slug}' not found in database"
                return result

            # 2. Discover artifacts
            artifacts = self.discover_artifacts(mind_slug)
            result['total_artifacts'] = len(artifacts)

            if len(artifacts) == 0:
                result['error'] = "No artifacts found"
                return result

            # 3. Process each artifact
            for artifact in artifacts:
                artifact_name = artifact['name']
                slug = f"{mind_slug}-{artifact['dir']}-{artifact_name}"

                # Check if exists
                if skip_existing and self.content_exists(slug):
                    result['skipped'] += 1
                    result['details'].append({
                        'slug': slug,
                        'status': 'skipped',
                        'reason': 'already_exists',
                    })
                    print(f"⏭️  Skipped: {slug}")
                    continue

                # Read content
                content = self.read_source_content(artifact['file_path'])

                if not content:
                    result['failed'] += 1
                    result['details'].append({
                        'slug': slug,
                        'status': 'failed',
                        'reason': 'file_read_failed',
                    })
                    continue

                # Build metadata
                metadata = {
                    'artifact_type': artifact['artifact_type'],
                    'artifact_dir': artifact['dir'],
                    'file_extension': artifact['extension'],
                    'generated_by': 'mmos_pipeline',
                }

                # Map to content data
                content_data = {
                    'ai_generated': True,  # KEY DIFFERENCE from sources
                    'content_type': 'other',
                    'slug': slug,
                    'title': artifact_name.replace('-', ' ').replace('_', ' ').title(),
                    'content': content,
                    'file_path': artifact['file_path'],
                    'status': 'published',
                    'metadata': metadata,
                }

                # Preview mode
                if preview:
                    result['details'].append({
                        'slug': slug,
                        'status': 'preview',
                        'data': content_data,
                    })
                    print(f"👁️  Preview: {slug}")
                    continue

                # Insert
                content_id = self.insert_content(content_data)

                if content_id:
                    # Link to mind
                    linked = self.link_content_to_mind(content_id, mind_id, role='creator')

                    if linked:
                        result['imported'] += 1
                        result['details'].append({
                            'slug': slug,
                            'content_id': content_id,
                            'status': 'imported',
                        })
                        print(f"✅ Imported: {slug}")
                    else:
                        result['failed'] += 1
                        result['details'].append({
                            'slug': slug,
                            'status': 'failed',
                            'reason': 'link_failed',
                        })
                else:
                    result['failed'] += 1
                    result['details'].append({
                        'slug': slug,
                        'status': 'failed',
                        'reason': 'insert_failed',
                    })

            return result

        except Exception as e:
            result['error'] = str(e)
            return result

    def import_mind_complete(
        self,
        mind_slug: str,
        preview: bool = False,
        skip_existing: bool = True
    ) -> Dict[str, Any]:
        """
        Import EVERYTHING for a mind: sources + artifacts.

        Args:
            mind_slug: Mind slug
            preview: If True, dry run
            skip_existing: If True, skip existing content

        Returns:
            Combined import result
        """
        result = {
            'mind_slug': mind_slug,
            'preview': preview,
            'timestamp': datetime.now().isoformat(),
            'sources': {},
            'artifacts': {},
            'total_imported': 0,
            'total_skipped': 0,
            'total_failed': 0,
        }

        print("\n" + "="*60)
        print(f"🚀 COMPLETE IMPORT: {mind_slug}")
        print("="*60 + "\n")

        # Import sources
        print("📥 Step 1/2: Importing sources (collected content)...")
        sources_result = self.import_mind_sources(mind_slug, preview, skip_existing)
        result['sources'] = sources_result

        # Import artifacts
        print("\n📥 Step 2/2: Importing artifacts (AI-generated content)...")
        artifacts_result = self.import_mind_artifacts(mind_slug, preview, skip_existing)
        result['artifacts'] = artifacts_result

        # Aggregate stats
        result['total_imported'] = (
            sources_result.get('imported', 0) +
            artifacts_result.get('imported', 0)
        )
        result['total_skipped'] = (
            sources_result.get('skipped', 0) +
            artifacts_result.get('skipped', 0)
        )
        result['total_failed'] = (
            sources_result.get('failed', 0) +
            artifacts_result.get('failed', 0)
        )

        return result


# CLI helper functions
def print_validation_report(validation: Dict[str, Any]):
    """Pretty print validation report."""
    print("\n" + "="*60)
    print(f"VALIDATION REPORT: {validation['mind_slug']}")
    print("="*60)

    for check in validation['checks']:
        print(check)

    for warning in validation['warnings']:
        print(warning)

    for error in validation['errors']:
        print(error)

    print("\n" + "="*60)
    print(f"STATUS: {'✅ VALID' if validation['valid'] else '❌ INVALID'}")
    print("="*60 + "\n")


def print_import_report(result: Dict[str, Any]):
    """Pretty print import report."""
    print("\n" + "="*60)
    print(f"IMPORT REPORT: {result['mind_slug']}")
    print("="*60)
    print(f"Timestamp: {result['timestamp']}")
    print(f"Mode: {'PREVIEW (dry run)' if result['preview'] else 'LIVE IMPORT'}")
    print("")
    print(f"Total sources: {result['total_sources']}")
    print(f"✅ Imported: {result['imported']}")
    print(f"⏭️  Skipped: {result['skipped']}")
    print(f"❌ Failed: {result['failed']}")

    if 'error' in result:
        print(f"\n⚠️  ERROR: {result['error']}")

    print("="*60 + "\n")
