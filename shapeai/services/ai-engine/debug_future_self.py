"""
Debug script para testar generate_future_self isoladamente.

USO:
    cd services/ai-engine
    python debug_future_self.py <caminho_da_foto> [opcoes]

EXEMPLOS:
    python debug_future_self.py foto.jpg
    python debug_future_self.py foto.jpg --goal fat_loss --fat 28
    python debug_future_self.py foto.jpg --goal hypertrophy --fat 22 --sex F

OPCOES:
    --goal    hypertrophy | fat_loss | conditioning | maintenance  (default: hypertrophy)
    --fat     % de gordura corporal estimada  (default: 22)
    --sex     M | F  (default: M)
    --out     caminho do arquivo de saida  (default: debug_future_self_result.jpg)
"""
import sys
import os
import argparse
import time

sys.path.insert(0, ".")

from dotenv import load_dotenv
load_dotenv()

parser = argparse.ArgumentParser(description="Testa future self generator")
parser.add_argument("foto", nargs="?", default=None, help="Caminho da foto JPEG/PNG")
parser.add_argument("--goal", default="hypertrophy", choices=["hypertrophy", "fat_loss", "conditioning", "maintenance"])
parser.add_argument("--fat", type=float, default=22.0, help="gordura corporal em pct (ex: 18, 28, 35)")
parser.add_argument("--sex", default="M", choices=["M", "F"])
parser.add_argument("--out", default="debug_future_self_result.jpg", help="Arquivo de saida")
args = parser.parse_args()

# --- Carrega foto ---
if args.foto and os.path.exists(args.foto):
    print(f"Carregando foto: {args.foto}")
    with open(args.foto, "rb") as f:
        photo_bytes = f.read()
    print(f"Foto carregada: {len(photo_bytes):,} bytes")
else:
    if args.foto:
        print(f"AVISO: foto '{args.foto}' nao encontrada — usando imagem de placeholder")
    else:
        print("AVISO: nenhuma foto informada — usando imagem de placeholder (resultado nao sera util)")
    import base64
    photo_bytes = base64.b64decode(
        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS"
        "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ"
        "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
        "MjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAA"
        "AAAAABgUH/8QAIRAAAQMEAgMAAAAAAAAAAAAAAQACAwQFERIhMUH/xAAUAQEAAAAAAAA"
        "AAAAAAAAAAAAAP/8QAFBEBAAAAAAAAAAAAAAAAAAAAkP/aAAwDAQACEQMRAD8AqNpQy00"
        "5VyS4e4kL3EuJJJPdERBpkgIiICIiD//2Q=="
    )

# --- Configuracao do teste ---
scores = {
    "overall_score": 60,
    "body_fat_estimate_pct": args.fat,
    "chest": 55,
    "shoulders": 55,
    "arms": 55,
    "legs": 55,
}
profile = {
    "sex": args.sex,
    "goal": args.goal,
}

print(f"\nConfiguracao:")
print(f"  Goal:    {args.goal}")
print(f"  Gordura: {args.fat}%")
print(f"  Sexo:    {args.sex}")
print(f"  Saida:   {args.out}")
print()

# --- Executa ---
print("Importando generate_future_self...")
from app.pipeline.future_self_generator import generate_future_self, _build_prompt
print("Importado OK\n")

# Mostra o prompt que sera enviado para debug
prompt_preview = _build_prompt(scores)
print("=" * 60)
print("PROMPT QUE SERA ENVIADO AO GEMINI:")
print("=" * 60)
print(prompt_preview)
print("=" * 60)
print()

start = time.time()
print("Chamando Gemini... (pode levar 20-60s)")
result = generate_future_self(photo_bytes, scores, profile)
elapsed = time.time() - start

print()
if result:
    with open(args.out, "wb") as f:
        f.write(result)
    print(f"Sucesso em {elapsed:.1f}s — {len(result):,} bytes")
    print(f"Resultado salvo em: {os.path.abspath(args.out)}")
else:
    print(f"Falhou em {elapsed:.1f}s — nenhuma imagem retornada")
    print("Verifique os logs acima para o motivo (safety filter, API error, etc.)")
