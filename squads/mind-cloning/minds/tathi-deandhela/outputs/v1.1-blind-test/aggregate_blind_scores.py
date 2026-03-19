#!/usr/bin/env python3
import csv
from statistics import mean
from collections import defaultdict
from pathlib import Path

csv_path = Path('squads/mind-cloning/minds/tathi-deandhela/v1.1-blind-test/blind_test_scores.csv')
if not csv_path.exists():
    raise SystemExit('scores file not found')

rows = []
with csv_path.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        try:
            vals = {
                'voice_similarity': float(r['voice_similarity']),
                'thinking_similarity': float(r['thinking_similarity']),
                'naturalness': float(r['naturalness']),
                'values_alignment': float(r['values_alignment']),
                'pressure_robustness': float(r['pressure_robustness']),
                'overall_score': float(r['overall_score']),
            }
        except Exception:
            continue
        r.update(vals)
        rows.append(r)

if not rows:
    raise SystemExit('no complete scored rows yet')

metric_means = {k: mean([r[k] for r in rows]) for k in [
    'voice_similarity','thinking_similarity','naturalness','values_alignment','pressure_robustness','overall_score'
]}

by_group = defaultdict(list)
for r in rows:
    by_group[r['test_group']].append(r['overall_score'])

print('Blind Test Aggregate')
print('--------------------')
for k,v in metric_means.items():
    print(f'{k}: {v:.2f}')
print('')
for g,vals in by_group.items():
    print(f'{g}: {mean(vals):.2f}')

pass_overall = metric_means['overall_score'] >= 8.5
pass_dims = all(metric_means[k] >= 8.0 for k in metric_means if k != 'overall_score')

print('')
print('PASS_OVERALL>=8.5:', pass_overall)
print('PASS_ALL_DIMS>=8.0:', pass_dims)
print('FINAL:', 'PASS' if (pass_overall and pass_dims) else 'REWORK')
