# Ping-Pong Session — FFmpeg Cutter Script

## Scope
- files:
  - squads/curator/scripts/execute_ffmpeg_cuts.py
  - squads/curator/agents/ffmpeg-cutter.md

## Goals
- Correção do script Python: edge cases, error handling, segurança
- Validação de timestamps robusta (formatos inválidos, negativos, start > end)
- Fallback stream-copy → re-encode funciona corretamente
- Platform specs cobrem todos os formatos necessários
- Output de render_report.md é consistente e útil
- Coerência entre o agent definition e o script (specs, heurísticas)
- Sem vulnerabilidades (command injection via nomes de arquivo, path traversal)
- Código Pythonic, sem dependências desnecessárias

## Constraints
- Script Python standalone (~443 linhas) com dependência PyYAML
- Agent definition é markdown/YAML — foco na coerência com o script
- Não modificar a interface CLI (argparse) sem justificativa forte
- Foco: qualidade do código e robustez, não features novas
