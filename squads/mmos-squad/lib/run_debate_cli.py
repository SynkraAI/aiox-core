#!/usr/bin/env python3
"""
CLI wrapper for debate engine
Usage: python run_debate_cli.py <clone1> <clone2> "<topic>" [--framework NAME] [--rounds N]
"""

import sys
import argparse
from pathlib import Path

# Import debate engine
from debate_engine import DebateConfig, run_debate


def main():
    parser = argparse.ArgumentParser(description="Run a debate between two cognitive clones")
    parser.add_argument("clone1", help="First clone name (e.g., sam_altman)")
    parser.add_argument("clone2", help="Second clone name (e.g., elon_musk)")
    parser.add_argument("topic", help="Debate topic")
    parser.add_argument("--framework", default="steel_man",
                       choices=["steel_man", "oxford", "socratic", "devils_advocate", "hegelian"],
                       help="Debate framework (default: steel_man)")
    parser.add_argument("--rounds", type=int, default=3,
                       help="Number of debate rounds (default: 3)")

    args = parser.parse_args()

    # Validate clones exist
    minds_dir = Path("expansion-packs/mmos/minds")
    clone1_path = minds_dir / args.clone1
    clone2_path = minds_dir / args.clone2

    if not clone1_path.exists():
        print(f"❌ Error: Clone '{args.clone1}' not found in expansion-packs/mmos/minds/")
        sys.exit(1)

    if not clone2_path.exists():
        print(f"❌ Error: Clone '{args.clone2}' not found in expansion-packs/mmos/minds/")
        sys.exit(1)

    print(f"⚔️  Starting debate: {args.clone1} vs {args.clone2}")
    print(f"📋 Topic: {args.topic}")
    print(f"🎯 Framework: {args.framework}")
    print(f"🔄 Rounds: {args.rounds}\n")

    # Create config
    config = DebateConfig(
        clone1_name=args.clone1,
        clone2_name=args.clone2,
        topic=args.topic,
        framework=args.framework,
        rounds=args.rounds,
        save_transcript=True,
        save_benchmark=True
    )

    # Run debate
    try:
        report = run_debate(config)
        print(f"\n✅ Debate complete! Winner: {report.winner}")
        print(f"📊 Win margin: {report.win_margin:.1f} points")
    except Exception as e:
        print(f"❌ Debate failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
