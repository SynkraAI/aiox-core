#!/usr/bin/env python3
"""
Mirror (Emulator) - Mind Clone Activation Agent
Version: 1.0.0
Purpose: Load and embody cognitive clones for authentic interaction

Usage:
  python3 emulator.py activate <mind_name>
  python3 emulator.py list-minds
  python3 emulator.py info <mind_name>
"""

import os
import sys
import time
import yaml
from datetime import datetime
from pathlib import Path

# Constants
TOKEN_LIMIT_KB = 20000
TOKEN_BUDGET = 200000
MINDS_DIR = Path("outputs/minds")


def count_tokens(text: str) -> int:
    """Approximate token count (text_length / 4)"""
    return len(text) // 4


def load_system_prompt(mind_path: Path) -> dict:
    """Load system-prompt.md or system_prompts/system-prompt-generalista.md"""
    # Try direct path first
    prompt_path = mind_path / "system-prompt.md"
    if not prompt_path.exists():
        # Try system_prompts directory
        prompt_path = mind_path / "system_prompts" / "system-prompt-generalista.md"

    if not prompt_path.exists():
        raise FileNotFoundError(f"system-prompt.md not found in {mind_path}")

    with open(prompt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse frontmatter if exists
    version = "unknown"
    last_updated = "unknown"

    if content.startswith('---'):
        try:
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter = yaml.safe_load(parts[1])
                version = frontmatter.get('version', 'unknown')
                last_updated = frontmatter.get('updated_at', 'unknown')
        except:
            pass

    tokens = count_tokens(content)

    return {
        'content': content,
        'tokens': tokens,
        'version': version,
        'last_updated': last_updated,
        'path': str(prompt_path)
    }


def load_metadata(mind_path: Path) -> dict:
    """Load metadata.yaml if exists"""
    metadata_path = mind_path / "metadata.yaml"

    if metadata_path.exists():
        with open(metadata_path, 'r') as f:
            return yaml.safe_load(f)

    return {
        'fidelity': 'unknown',
        'last_validated': 'unknown',
        'display_name': mind_path.name.replace('_', ' ').title()
    }


def load_kb(mind_path: Path, override: str = "auto") -> dict:
    """Load knowledge base from kb/ directory"""
    kb_path = mind_path / "kb"

    if not kb_path.exists() or not kb_path.is_dir():
        return {
            'loaded': False,
            'fragments_count': 0,
            'total_tokens': 0,
            'files': [],
            'status': 'not_available'
        }

    # Find all .md and .txt files
    kb_files = list(kb_path.glob("*.md")) + list(kb_path.glob("*.txt"))

    if not kb_files:
        return {
            'loaded': False,
            'fragments_count': 0,
            'total_tokens': 0,
            'files': [],
            'status': 'not_available'
        }

    # Count total tokens
    total_tokens = 0
    kb_content = []

    for kb_file in kb_files:
        with open(kb_file, 'r', encoding='utf-8') as f:
            content = f.read()
            tokens = count_tokens(content)
            total_tokens += tokens
            kb_content.append({
                'file': kb_file.name,
                'content': content,
                'tokens': tokens
            })

    # Apply loading rules
    if override == "skip":
        return {
            'loaded': False,
            'fragments_count': len(kb_files),
            'total_tokens': total_tokens,
            'files': kb_content,
            'status': 'skipped'
        }
    elif override == "force_load":
        return {
            'loaded': True,
            'fragments_count': len(kb_files),
            'total_tokens': total_tokens,
            'files': kb_content,
            'status': 'loaded'
        }
    else:  # auto
        if total_tokens <= TOKEN_LIMIT_KB:
            return {
                'loaded': True,
                'fragments_count': len(kb_files),
                'total_tokens': total_tokens,
                'files': kb_content,
                'status': 'loaded'
            }
        else:
            # Ask user
            print(f"\n⚠️  KB exceeds 20k token limit")
            print(f"📊 Total KB: {len(kb_files)} fragments - {total_tokens:,} tokens ({total_tokens/TOKEN_LIMIT_KB*100:.0f}% of limit)")
            print("\nOptions:")
            print("1. Skip KB (activate with system-prompt only)")
            print("2. Load all KB (override limit)")
            print("3. Cancel activation")

            choice = input("\nChoice [1/2/3]: ").strip()

            if choice == "1":
                return {
                    'loaded': False,
                    'fragments_count': len(kb_files),
                    'total_tokens': total_tokens,
                    'files': kb_content,
                    'status': 'exceeded_limit'
                }
            elif choice == "2":
                return {
                    'loaded': True,
                    'fragments_count': len(kb_files),
                    'total_tokens': total_tokens,
                    'files': kb_content,
                    'status': 'loaded'
                }
            else:
                sys.exit(0)


def display_activation_report(mind_name: str, display_name: str, prompt_data: dict,
                                kb_data: dict, metadata: dict, load_time_ms: int):
    """Display activation greeting"""
    total_tokens = prompt_data['tokens'] + (kb_data['total_tokens'] if kb_data['loaded'] else 0)
    budget_pct = (total_tokens / TOKEN_BUDGET) * 100

    print(f"\n🪞 Mirror → {display_name} (v{prompt_data['version']}) loaded\n")
    print(f"📊 System Prompt: v{prompt_data['version']} ({prompt_data['last_updated']}) - {prompt_data['tokens']:,} tokens")

    # KB status
    if kb_data['loaded']:
        pct = (kb_data['total_tokens'] / TOKEN_LIMIT_KB) * 100
        print(f"📚 KB: {kb_data['fragments_count']} fragments loaded - {kb_data['total_tokens']:,} tokens ({pct:.0f}% of limit)")
    elif kb_data['total_tokens'] > 0:
        print(f"📚 KB: Not loaded ({kb_data['fragments_count']} fragments available, {kb_data['total_tokens']:,} tokens - exceeds limit)")
    else:
        print(f"📚 KB: No KB available")

    print(f"🎯 Fidelity: {metadata.get('fidelity', 'unknown')} (validated {metadata.get('last_validated', 'unknown')})")
    print(f"⚡ Load Time: {load_time_ms}ms")
    print(f"\nTotal Tokens: {total_tokens:,} ({budget_pct:.1f}% of budget)")
    print(f"\nNow embodying {display_name}. Type *help for commands.")


def activate_clone(mind_name: str, kb_override: str = "auto"):
    """Main activation workflow"""
    start_time = time.time()

    # Step 1: Validate mind exists
    mind_path = MINDS_DIR / mind_name

    if not mind_path.exists():
        print(f"\n⚠️  Mind '{mind_name}' not found in repository")
        print(f"\nAvailable minds:")
        list_minds()
        sys.exit(1)

    # Step 2: Load system prompt
    try:
        prompt_data = load_system_prompt(mind_path)
    except FileNotFoundError as e:
        print(f"\n⚠️  {e}")
        print(f"\nThis mind may not be fully configured. Check {mind_path}/")
        sys.exit(1)

    # Step 3: Load metadata
    metadata = load_metadata(mind_path)
    display_name = metadata.get('display_name', mind_name.replace('_', ' ').title())

    # Step 4: Load KB
    kb_data = load_kb(mind_path, kb_override)

    # Step 5: Calculate load time
    load_time_ms = int((time.time() - start_time) * 1000)

    # Step 6: Display activation report
    display_activation_report(mind_name, display_name, prompt_data, kb_data, metadata, load_time_ms)

    # Step 7: Embody persona (for now, just show we're ready)
    print(f"\n{'='*60}")
    print("CLONE ACTIVATED - Ready for interaction")
    print("(Full persona embodiment would happen here in production)")
    print(f"{'='*60}\n")

    # Return activation data for further use
    return {
        'mind_name': mind_name,
        'display_name': display_name,
        'prompt': prompt_data,
        'kb': kb_data,
        'metadata': metadata,
        'load_time_ms': load_time_ms
    }


def list_minds():
    """List all available minds"""
    if not MINDS_DIR.exists():
        print("No minds directory found")
        return

    minds = [d.name for d in MINDS_DIR.iterdir() if d.is_dir() and not d.name.startswith('.')]
    minds.sort()

    for mind in minds:
        # Check if has system-prompt
        mind_path = MINDS_DIR / mind
        has_prompt = (mind_path / "system-prompt.md").exists() or \
                     (mind_path / "system_prompts" / "system-prompt-generalista.md").exists()

        status = "✅" if has_prompt else "⚠️"
        display_name = mind.replace('_', ' ').title()
        print(f"{status} {mind} ({display_name})")


def show_info(mind_name: str):
    """Show detailed info about a mind"""
    mind_path = MINDS_DIR / mind_name

    if not mind_path.exists():
        print(f"Mind '{mind_name}' not found")
        return

    print(f"\n{'='*60}")
    print(f"Mind Info: {mind_name}")
    print(f"{'='*60}\n")

    # Check system-prompt
    try:
        prompt_data = load_system_prompt(mind_path)
        print(f"✅ System Prompt: v{prompt_data['version']}")
        print(f"   Tokens: {prompt_data['tokens']:,}")
        print(f"   Last Updated: {prompt_data['last_updated']}")
        print(f"   Path: {prompt_data['path']}")
    except FileNotFoundError:
        print("⚠️  System Prompt: Not found")

    # Check KB
    kb_path = mind_path / "kb"
    if kb_path.exists():
        kb_files = list(kb_path.glob("*.md")) + list(kb_path.glob("*.txt"))
        if kb_files:
            total_tokens = sum(count_tokens(f.read_text()) for f in kb_files)
            print(f"\n✅ Knowledge Base:")
            print(f"   Fragments: {len(kb_files)}")
            print(f"   Total Tokens: {total_tokens:,}")
            print(f"   Within Limit: {'Yes' if total_tokens <= TOKEN_LIMIT_KB else 'No (exceeds 20k)'}")
        else:
            print("\n⚠️  Knowledge Base: Empty")
    else:
        print("\n⚠️  Knowledge Base: Not found")

    # Check metadata
    metadata = load_metadata(mind_path)
    print(f"\n📊 Metadata:")
    print(f"   Display Name: {metadata.get('display_name', 'N/A')}")
    print(f"   Fidelity: {metadata.get('fidelity', 'unknown')}")
    print(f"   Last Validated: {metadata.get('last_validated', 'unknown')}")

    print()


def test_clone(mind_name: str, protocol: str = "quick"):
    """Test clone fidelity (simplified demonstration)"""
    print(f"\n{'='*60}")
    print(f"FIDELITY TEST - {protocol.upper()} PROTOCOL")
    print(f"{'='*60}\n")
    print(f"Clone: {mind_name.replace('_', ' ').title()}")
    print(f"\n[Demo Mode - Full implementation in test-fidelity.md]")
    print(f"\nTest questions would be executed here...")
    print(f"Expected output: Fidelity score, category breakdown, recommendations")
    print(f"\n✅ Test framework ready - see tasks/test-fidelity.md for full protocol\n")


def duo_interaction(mind1: str, mind2: str):
    """Dual clone interaction (simplified demonstration)"""
    print(f"\n{'='*60}")
    print(f"DUO INTERACTION MODE")
    print(f"{'='*60}\n")
    print(f"Loading 2 clones in parallel...")
    print(f"  - {mind1.replace('_', ' ').title()}")
    print(f"  - {mind2.replace('_', ' ').title()}")
    print(f"\n[Demo Mode - Full implementation in dual-interaction.md]")
    print(f"\n3+ dialogue turns would happen here between the clones...")
    print(f"Then user input opens for interaction.")
    print(f"\n✅ Duo framework ready - see tasks/dual-interaction.md for full workflow\n")


def roundtable(minds: list):
    """Roundtable session with 3-4 clones (simplified demonstration)"""
    print(f"\n{'='*60}")
    print(f"ROUNDTABLE SESSION")
    print(f"{'='*60}\n")
    print(f"Loading {len(minds)} clones...")
    for mind in minds:
        print(f"  - {mind.replace('_', ' ').title()}")
    print(f"\n[Demo Mode - Full implementation in roundtable-session.md]")
    print(f"\nStructured discussion would happen here:")
    print(f"  1. Each clone contributes perspective")
    print(f"  2. Cross-pollination of ideas")
    print(f"  3. Synthesis before user input")
    print(f"\n✅ Roundtable framework ready - see tasks/roundtable-session.md\n")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 emulator.py activate <mind_name>")
        print("  python3 emulator.py debate <mind1> <mind2> --topic \"topic\" [--framework oxford] [--rounds 5]")
        print("  python3 emulator.py test <mind_name> [protocol]")
        print("  python3 emulator.py duo <mind1> <mind2>")
        print("  python3 emulator.py roundtable <mind1> <mind2> <mind3> [mind4]")
        print("  python3 emulator.py list-minds")
        print("  python3 emulator.py info <mind_name>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "activate":
        if len(sys.argv) < 3:
            print("Error: mind_name required")
            print("Usage: python3 emulator.py activate <mind_name>")
            sys.exit(1)
        mind_name = sys.argv[2]
        activate_clone(mind_name)

    elif command == "debate":
        # Import debate engine
        sys.path.insert(0, str(Path(__file__).parent.parent / "lib"))
        from debate_engine import DebateConfig, run_debate

        # Parse arguments
        if len(sys.argv) < 5:
            print("Error: 2 minds and topic required")
            print("Usage: python3 emulator.py debate <mind1> <mind2> --topic \"topic\" [--framework oxford] [--rounds 5]")
            sys.exit(1)

        clone1 = sys.argv[2]
        clone2 = sys.argv[3]

        # Extract named arguments
        topic = None
        framework = "oxford"
        rounds = 5

        i = 4
        while i < len(sys.argv):
            if sys.argv[i] == "--topic" and i + 1 < len(sys.argv):
                topic = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == "--framework" and i + 1 < len(sys.argv):
                framework = sys.argv[i + 1]
                i += 2
            elif sys.argv[i] == "--rounds" and i + 1 < len(sys.argv):
                rounds = int(sys.argv[i + 1])
                i += 2
            else:
                i += 1

        if not topic:
            print("Error: --topic required")
            print("Usage: python3 emulator.py debate <mind1> <mind2> --topic \"topic\" [--framework oxford] [--rounds 5]")
            sys.exit(1)

        # Run debate
        config = DebateConfig(
            clone1_name=clone1,
            clone2_name=clone2,
            topic=topic,
            framework=framework,
            rounds=rounds,
            save_transcript=True,
            save_benchmark=True
        )

        report = run_debate(config)
        print(f"\n✅ Debate complete! Winner: {report.winner} (+{report.win_margin:.1f} points)")

    elif command == "test":
        if len(sys.argv) < 3:
            print("Error: mind_name required")
            print("Usage: python3 emulator.py test <mind_name> [quick|standard|comprehensive]")
            sys.exit(1)
        mind_name = sys.argv[2]
        protocol = sys.argv[3] if len(sys.argv) > 3 else "quick"
        test_clone(mind_name, protocol)

    elif command == "duo":
        if len(sys.argv) < 4:
            print("Error: 2 mind names required")
            print("Usage: python3 emulator.py duo <mind1> <mind2>")
            sys.exit(1)
        mind1, mind2 = sys.argv[2], sys.argv[3]
        duo_interaction(mind1, mind2)

    elif command == "roundtable":
        if len(sys.argv) < 5:
            print("Error: 3-4 mind names required")
            print("Usage: python3 emulator.py roundtable <mind1> <mind2> <mind3> [mind4]")
            sys.exit(1)
        minds = sys.argv[2:]
        if len(minds) > 4:
            print("Error: Maximum 4 minds allowed in roundtable")
            sys.exit(1)
        roundtable(minds)

    elif command == "list-minds":
        list_minds()

    elif command == "info":
        if len(sys.argv) < 3:
            print("Error: mind_name required")
            print("Usage: python3 emulator.py info <mind_name>")
            sys.exit(1)
        mind_name = sys.argv[2]
        show_info(mind_name)

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
