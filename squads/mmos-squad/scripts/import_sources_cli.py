#!/usr/bin/env python3
"""
MMOS Sources Import CLI
=======================
Command-line interface for importing mind sources into Supabase database.

Usage:
    python import_sources_cli.py validate sam_altman
    python import_sources_cli.py preview sam_altman
    python import_sources_cli.py import sam_altman
    python import_sources_cli.py import sam_altman --force
"""

import sys
import argparse
from pathlib import Path

# Add lib/ to path
sys.path.insert(0, str(Path(__file__).parent.parent / "lib"))

from sources_importer import SourcesImporter, print_validation_report, print_import_report


def main():
    parser = argparse.ArgumentParser(
        description="Import MMOS mind sources into Supabase database"
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate sources before import')
    validate_parser.add_argument('mind_slug', help='Mind slug (e.g., sam_altman)')

    # Preview command
    preview_parser = subparsers.add_parser('preview', help='Preview what will be imported (dry run)')
    preview_parser.add_argument('mind_slug', help='Mind slug (e.g., sam_altman)')

    # Import command (sources only)
    import_parser = subparsers.add_parser('import', help='Import sources into database')
    import_parser.add_argument('mind_slug', help='Mind slug (e.g., sam_altman)')
    import_parser.add_argument(
        '--force',
        action='store_true',
        help='Force import even if sources already exist (overwrite)'
    )

    # Import artifacts command
    import_artifacts_parser = subparsers.add_parser('import-artifacts', help='Import artifacts (AI-generated content)')
    import_artifacts_parser.add_argument('mind_slug', help='Mind slug (e.g., sam_altman)')
    import_artifacts_parser.add_argument(
        '--force',
        action='store_true',
        help='Force import even if artifacts already exist (overwrite)'
    )

    # Import complete command (sources + artifacts)
    import_complete_parser = subparsers.add_parser('import-complete', help='Import EVERYTHING (sources + artifacts)')
    import_complete_parser.add_argument('mind_slug', help='Mind slug (e.g., sam_altman)')
    import_complete_parser.add_argument(
        '--force',
        action='store_true',
        help='Force import even if content already exists (overwrite)'
    )

    # Status command
    status_parser = subparsers.add_parser('status', help='Check database connection')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    try:
        importer = SourcesImporter()

        if args.command == 'validate':
            validation = importer.validate_import(args.mind_slug)
            print_validation_report(validation)
            sys.exit(0 if validation['valid'] else 1)

        elif args.command == 'preview':
            result = importer.import_mind_sources(args.mind_slug, preview=True)
            print_import_report(result)
            sys.exit(0 if 'error' not in result else 1)

        elif args.command == 'import':
            skip_existing = not args.force

            if args.force:
                print("⚠️  FORCE MODE: Will overwrite existing sources\n")

            result = importer.import_mind_sources(
                args.mind_slug,
                preview=False,
                skip_existing=skip_existing
            )
            print_import_report(result)
            sys.exit(0 if 'error' not in result and result['failed'] == 0 else 1)

        elif args.command == 'import-artifacts':
            skip_existing = not args.force

            if args.force:
                print("⚠️  FORCE MODE: Will overwrite existing artifacts\n")

            result = importer.import_mind_artifacts(
                args.mind_slug,
                preview=False,
                skip_existing=skip_existing
            )
            print_import_report(result)
            sys.exit(0 if 'error' not in result and result['failed'] == 0 else 1)

        elif args.command == 'import-complete':
            skip_existing = not args.force

            if args.force:
                print("⚠️  FORCE MODE: Will overwrite ALL existing content\n")

            result = importer.import_mind_complete(
                args.mind_slug,
                preview=False,
                skip_existing=skip_existing
            )

            # Print summary
            print("\n" + "="*60)
            print("COMPLETE IMPORT SUMMARY")
            print("="*60)
            print(f"Mind: {result['mind_slug']}")
            print(f"Timestamp: {result['timestamp']}")
            print("")
            print(f"Sources:")
            print(f"  ✅ Imported: {result['sources'].get('imported', 0)}")
            print(f"  ⏭️  Skipped: {result['sources'].get('skipped', 0)}")
            print(f"  ❌ Failed: {result['sources'].get('failed', 0)}")
            print("")
            print(f"Artifacts:")
            print(f"  ✅ Imported: {result['artifacts'].get('imported', 0)}")
            print(f"  ⏭️  Skipped: {result['artifacts'].get('skipped', 0)}")
            print(f"  ❌ Failed: {result['artifacts'].get('failed', 0)}")
            print("")
            print(f"TOTAL:")
            print(f"  ✅ Imported: {result['total_imported']}")
            print(f"  ⏭️  Skipped: {result['total_skipped']}")
            print(f"  ❌ Failed: {result['total_failed']}")
            print("="*60 + "\n")

            sys.exit(0 if result['total_failed'] == 0 else 1)

        elif args.command == 'status':
            print("🔍 Checking database connection...")
            # Try to connect
            import psycopg2
            conn = psycopg2.connect(importer.db_url)
            cur = conn.cursor()
            cur.execute("SELECT slug FROM minds LIMIT 5")
            minds = cur.fetchall()
            cur.close()
            conn.close()
            print(f"✅ Connected to database")
            print(f"📊 Found {len(minds)} sample minds:")
            for mind in minds:
                print(f"   - {mind[0]}")
            sys.exit(0)

    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}\n")
        print("Make sure you have set the following environment variables:")
        print("  - SUPABASE_URL")
        print("  - SUPABASE_SERVICE_KEY")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
