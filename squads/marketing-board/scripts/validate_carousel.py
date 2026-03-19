#!/usr/bin/env python3
"""
OPES Marketing Arm — Carousel Validator via WhatsApp
Sends carousel slides as visual cards + interactive menu for CEO approval.
Polls for response and acts on it.

Flow:
  1. /send/carousel → visual preview (slides with images)
  2. /send/menu (type: list) → functional approval button
  3. Poll /message/find → wait for CEO response
  4. APROVADO → send confirmation / AJUSTE → notify / CANCELA → discard

Usage:
  python3 validate_carousel.py                     # Validates today's carousel
  python3 validate_carousel.py 2026-02-02          # Validates specific date
  python3 validate_carousel.py --caption            # Also sends caption preview
  python3 validate_carousel.py --test               # Test UazAPI connection only
"""
import json
import os
import re
import sys
import time
import subprocess
import urllib.request
import urllib.error
from datetime import date

CREDS_PATH = os.path.expanduser("~/.config/aios/credentials.yaml")
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CONTENT_DIR = os.path.join(REPO_ROOT, "outputs", "hubs", "marketing")

POLL_INTERVAL = 5   # seconds between polls
POLL_TIMEOUT = 300   # max seconds to wait (5 min)

DECISIONS = {"APROVADO", "AJUSTE", "CANCELA"}


def load_uazapi_creds():
    with open(CREDS_PATH) as f:
        content = f.read()
    creds = {}
    m = re.search(r'uazapi:.*?base_url:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['base_url'] = m.group(1) if m else None
    m = re.search(r'uazapi:.*?(?:^|\n)\s+token:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['token'] = m.group(1) if m else None
    m = re.search(r'notification_number:\s*[\'"](.+?)[\'"]', content)
    creds['number'] = m.group(1) if m else None
    if not all(creds.values()):
        missing = [k for k, v in creds.items() if not v]
        print(f"ERRO: Credenciais UazAPI incompletas — faltando: {missing}")
        sys.exit(1)
    return creds


def _request(url, token, payload):
    """Make authenticated POST request to UazAPI."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')
    req.add_header('token', token)
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def send_text(creds, message):
    return _request(
        f"{creds['base_url']}/send/text", creds['token'],
        {"number": creds['number'], "text": message}
    )


def send_carousel(creds, text, cards):
    return _request(
        f"{creds['base_url']}/send/carousel", creds['token'],
        {"number": creds['number'], "text": text, "carousel": cards, "readchat": True}
    )


def send_menu(creds, text, footer, button_label, choices, track_id=""):
    return _request(
        f"{creds['base_url']}/send/menu", creds['token'],
        {
            "number": creds['number'], "type": "list", "text": text,
            "footerText": footer, "listButton": button_label,
            "selectableCount": 1, "choices": choices,
            "readchat": True, "readmessages": True, "delay": 1000,
            "track_source": "opes_marketing", "track_id": track_id
        }
    )


def find_messages(creds, from_me=False, limit=5):
    """Read messages via /message/find."""
    return _request(
        f"{creds['base_url']}/message/find", creds['token'],
        {"number": creds['number'], "limit": limit, "fromMe": from_me}
    )


def poll_for_decision(creds, sent_timestamp):
    """Poll for CEO response after menu was sent. Returns decision string."""
    print(f"\n  Aguardando resposta (poll a cada {POLL_INTERVAL}s, timeout {POLL_TIMEOUT}s)...")
    elapsed = 0
    while elapsed < POLL_TIMEOUT:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
        try:
            result = find_messages(creds, from_me=True, limit=5)
            for msg in result.get('messages', []):
                ts = msg.get('messageTimestamp', 0)
                if isinstance(ts, str):
                    ts = int(ts)
                # Only consider messages AFTER we sent the menu
                if ts <= sent_timestamp:
                    continue
                # ListResponseMessage: buttonOrListid has the decision
                selected = (msg.get('buttonOrListid', '') or '').strip().upper()
                text = (msg.get('text', '') or '').strip().upper()
                decision = selected or text
                if decision in DECISIONS:
                    return decision
        except Exception:
            pass
        dots = '.' * ((elapsed // POLL_INTERVAL) % 4)
        print(f"  [{elapsed}s] Esperando{dots}", end='\r', flush=True)
    return None


ROUTING_PROMPT = """Voce eh o CMO (Seth Godin) do OPES Marketing Arm.
O CEO pediu um ajuste no carrossel de marketing. Analise o pedido e decida qual agente deve executar.

Agentes disponiveis:
- @designer: Ajustes VISUAIS (cores, layout, imagens, formato, tamanho, fonte, background, logo)
- @production: Ajustes de TEXTO/COPY (reescrever frases, hook, caption, tom, linguagem, simplificar)
- @ideation: Ajustes de CONCEITO (mudar tema, ideia, angulo, narrativa, posicionamento, estrategia)
- @cmo: Quando nao se encaixa nos anteriores ou precisa de avaliacao estrategica

Responda APENAS com um JSON valido neste formato exato:
{"agent": "@production", "reason": "CEO quer mudar o texto do slide 1"}

Pedido do CEO: "{text}"
"""


def route_adjustment(text):
    """Route adjustment using GPT-4o-mini for accurate classification."""
    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return '@cmo', [], 'OPENAI_API_KEY nao configurada — CMO avalia manualmente'

    prompt = ROUTING_PROMPT.replace('{text}', text.replace('"', '\\"'))
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 100,
        "temperature": 0,
    }
    try:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            'https://api.openai.com/v1/chat/completions',
            data=data, method='POST'
        )
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {api_key}')
        resp = urllib.request.urlopen(req, timeout=15)
        result = json.loads(resp.read())
        content = result['choices'][0]['message']['content'].strip()
        parsed = json.loads(content)
        agent = parsed.get('agent', '@cmo')
        reason = parsed.get('reason', 'Analise GPT-4o-mini')
        return agent, [], reason
    except Exception as e:
        print(f"  WARN: AI routing falhou ({e}), usando @cmo como fallback")
        return '@cmo', [], f'Fallback — erro na analise: {str(e)[:50]}'


def poll_for_adjustment_text(creds, sent_timestamp):
    """Poll for CEO follow-up text after AJUSTE. Returns message text."""
    print(f"\n  Aguardando descricao do ajuste (poll a cada {POLL_INTERVAL}s, timeout {POLL_TIMEOUT}s)...")
    elapsed = 0
    while elapsed < POLL_TIMEOUT:
        time.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL
        try:
            result = find_messages(creds, from_me=True, limit=5)
            for msg in result.get('messages', []):
                ts = msg.get('messageTimestamp', 0)
                if isinstance(ts, str):
                    ts = int(ts)
                if ts <= sent_timestamp:
                    continue
                # Only text messages (not list responses or reactions)
                mtype = msg.get('messageType', '')
                if mtype not in ('ExtendedTextMessage', 'Conversation', 'conversation'):
                    continue
                text = (msg.get('text', '') or '').strip()
                if len(text) >= 3:
                    return text
        except Exception:
            pass
        dots = '.' * ((elapsed // POLL_INTERVAL) % 4)
        print(f"  [{elapsed}s] Esperando descricao{dots}", end='\r', flush=True)
    return None


def save_adjustment(target_date, adjustment_text, agent, keywords, reason):
    """Save adjustment request as structured markdown."""
    from datetime import datetime
    path = os.path.join(CONTENT_DIR, f"{target_date}-adjustment.md")
    content = (
        f"# Adjustment Request | {target_date}\n\n"
        f"**Status:** PENDENTE\n"
        f"**Solicitado por:** CEO\n"
        f"**Agente designado:** {agent}\n"
        f"**Carrossel:** {target_date}\n"
        f"**Criado em:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        f"---\n\n"
        f"## Descricao do Ajuste\n\n"
        f"{adjustment_text}\n\n"
        f"---\n\n"
        f"## Routing\n\n"
        f"- Palavras-chave detectadas: {', '.join(keywords) if keywords else 'nenhuma'}\n"
        f"- Agente: {agent} ({reason})\n\n"
        f"---\n\n"
        f"## Resolucao\n\n"
        f"- [ ] Ajuste executado\n"
        f"- [ ] Novo carrossel gerado\n"
        f"- [ ] CEO aprovou versao ajustada\n"
    )
    with open(path, 'w') as f:
        f.write(content)
    return path


GENERATE_SCRIPT = os.path.join(os.path.dirname(__file__), "generate_carousel.py")

MAX_ADJUSTMENT_ROUNDS = 3

ADJUSTMENT_PROMPT = """Voce eh um assistente que modifica codigo Python de geracao de imagens para carrossel.
O CEO pediu este ajuste: "{text}"

Aqui esta o codigo Python completo do gerador de carrossel:
```python
{code}
```

Retorne APENAS um JSON valido com as substituicoes necessarias no codigo:
{{
  "changes": [
    {{"old": "texto exato atual no codigo", "new": "texto novo"}}
  ]
}}

Regras CRITICAS:
- "old" DEVE ser uma string EXATA que existe no codigo (copie caractere por caractere)
- Mantenha a estrutura Python valida (indentacao, aspas, parenteses)
- Nao mude imports, funcoes auxiliares ou estrutura geral
- Se o pedido envolve CORES, modifique os valores RGB no dicionario COLORS
- Se o pedido menciona "slide X", identifique a funcao correta (slide 1=slide_cover, 2=slide_quem_sou, 3=slide_opes, 4=slide_cmo, 5=slide_ideation, 6=slide_production, 7=slide_restante, 8=slide_resultado, 9=slide_cta)
- Faca TODAS as substituicoes necessarias para atender o pedido completo
- Se um numero aparece em multiplos lugares (ex: "6" no cover e no resultado), mude TODOS os relevantes
"""


def _call_openai(prompt, max_tokens=500):
    """Call OpenAI GPT-4o-mini and return response text."""
    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return None
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0,
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=data, method='POST'
    )
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {api_key}')
    resp = urllib.request.urlopen(req, timeout=30)
    result = json.loads(resp.read())
    return result['choices'][0]['message']['content'].strip()


def get_generator_code():
    """Read the full generate_carousel.py source code."""
    with open(GENERATE_SCRIPT) as f:
        return f.read()


def execute_adjustment(adjustment_text):
    """Use GPT-4o-mini to generate code changes, apply them, and regenerate carousel.
    Returns (success, message)."""
    print(f"\n  [EXEC] Analisando ajuste via GPT-4o-mini...")
    code = get_generator_code()
    prompt = ADJUSTMENT_PROMPT.replace('{text}', adjustment_text.replace('"', '\\"'))
    prompt = prompt.replace('{code}', code)

    try:
        response = _call_openai(prompt, max_tokens=800)
        if not response:
            return False, "OPENAI_API_KEY nao configurada"
    except Exception as e:
        return False, f"Erro na chamada OpenAI: {e}"

    # Parse JSON from response (may be wrapped in ```json blocks)
    json_str = response
    if '```' in json_str:
        m = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', json_str, re.DOTALL)
        if m:
            json_str = m.group(1)
    try:
        changes_data = json.loads(json_str)
    except json.JSONDecodeError:
        return False, f"Resposta GPT nao eh JSON valido: {response[:100]}"

    changes = changes_data.get('changes', [])
    if not changes:
        return False, "Nenhuma mudanca identificada pelo GPT"

    print(f"  [EXEC] {len(changes)} mudanca(s) identificada(s)")
    return apply_code_changes(code, changes)


def apply_code_changes(original_code, changes):
    """Apply find/replace changes to generate_carousel.py with backup and validation.
    Returns (success, message)."""
    # Validate all old strings exist
    for i, ch in enumerate(changes):
        old = ch.get('old', '')
        if old not in original_code:
            return False, f"Change {i+1}: texto nao encontrado no codigo: \"{old[:60]}...\""

    # Create backup
    backup_path = GENERATE_SCRIPT + '.bak'
    import shutil
    shutil.copy2(GENERATE_SCRIPT, backup_path)
    print(f"  [EXEC] Backup criado: {backup_path}")

    # Apply changes
    modified = original_code
    for i, ch in enumerate(changes):
        old = ch['old']
        new = ch['new']
        modified = modified.replace(old, new, 1)
        print(f"  [EXEC] Change {i+1}: \"{old[:40]}...\" → \"{new[:40]}...\"")

    # Validate Python syntax
    try:
        compile(modified, GENERATE_SCRIPT, 'exec')
    except SyntaxError as e:
        # Rollback
        shutil.copy2(backup_path, GENERATE_SCRIPT)
        return False, f"Codigo modificado tem erro de sintaxe: {e}"

    # Save modified code
    with open(GENERATE_SCRIPT, 'w') as f:
        f.write(modified)
    print(f"  [EXEC] Codigo atualizado com sucesso")

    return True, "Mudancas aplicadas"


def regenerate_carousel(carousel_dir):
    """Re-run generate_carousel.py to regenerate slide PNGs.
    Returns (success, message)."""
    import shutil
    print(f"  [REGEN] Regenerando slides em {carousel_dir}...")
    try:
        result = subprocess.run(
            [sys.executable, GENERATE_SCRIPT, carousel_dir],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0:
            print(f"  [REGEN] Slides regenerados com sucesso")
            return True, result.stdout
        else:
            # Rollback
            backup_path = GENERATE_SCRIPT + '.bak'
            if os.path.exists(backup_path):
                shutil.copy2(backup_path, GENERATE_SCRIPT)
                print(f"  [REGEN] Rollback executado")
            return False, f"Erro na geracao: {result.stderr[:200]}"
    except Exception as e:
        backup_path = GENERATE_SCRIPT + '.bak'
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, GENERATE_SCRIPT)
        return False, f"Excecao na geracao: {e}"


def revalidate_carousel(creds, target_date, carousel_dir, slide_table, tema, purple):
    """Re-upload slides, re-send carousel + menu, poll for new decision.
    Returns decision string or None."""
    slides_files = sorted([
        f for f in os.listdir(carousel_dir) if f.endswith(('.png', '.jpg'))
    ])
    total = len(slides_files)

    # Re-upload
    print(f"\n  [REVAL] Re-uploading {total} slides...")
    image_urls = {}
    for i, filename in enumerate(slides_files):
        file_path = os.path.join(carousel_dir, filename)
        print(f"    {filename}...", end=" ", flush=True)
        try:
            image_urls[filename] = upload_image(file_path)
            print("OK")
        except Exception as e:
            print(f"ERRO: {e}")
        if i < len(slides_files) - 1:
            time.sleep(2)

    # Re-send carousel
    print(f"  [REVAL] Reenviando preview visual...")
    cards = []
    for i, filename in enumerate(slides_files, 1):
        url = image_urls.get(filename)
        if not url:
            continue
        desc = slide_table.get(i, filename.replace('.png', ''))
        cards.append({
            "text": f"Slide {i}/{total}\n{desc}",
            "image": url,
            "buttons": [{"id": f"slide_{i}", "text": f"Slide {i}", "type": "REPLY"}]
        })
    try:
        send_carousel(creds, (
            f"*OPES Marketing — Carrossel AJUSTADO*\n"
            f"Data: {target_date}\n"
            f"Tema: {tema}\n\n"
            f"Deslize para revisar a versao corrigida:"
        ), cards)
    except Exception as e:
        print(f"  [REVAL] ERRO carousel: {e}")

    # Re-send approval menu
    print(f"  [REVAL] Reenviando menu de aprovacao...")
    now_ts = int(time.time() * 1000)
    try:
        send_menu(
            creds,
            text=(
                f"*Aprovacao Carrossel AJUSTADO {target_date}*\n\n"
                f"Tema: {tema}\n"
                f"Slides: {total} | Purple Cow: {purple}\n\n"
                f"Revise a versao corrigida e tome sua decisao:"
            ),
            footer="OPES Marketing v2.0.0",
            button_label="Decidir",
            choices=[
                "[Aprovacao do Carrossel Ajustado]",
                "Aprovar e publicar|APROVADO|Publica no Instagram + LinkedIn agora",
                "Pedir novo ajuste|AJUSTE|Descreva o que mudar na proxima mensagem",
                "Cancelar|CANCELA|Descarta o carrossel"
            ],
            track_id=f"carousel_{target_date}_adj"
        )
    except Exception as e:
        print(f"  [REVAL] ERRO menu: {e}")
        return None

    # Poll for new decision
    print(f"  [REVAL] Aguardando nova decisao do CEO...")
    return poll_for_decision(creds, now_ts)


def upload_image(file_path):
    """Upload image to Imgur (anonymous, no auth needed)."""
    result = subprocess.run(
        ['curl', '-s', '-X', 'POST',
         '-H', 'Authorization: Client-ID 546c25a59c58ad7',
         '-F', f'image=@{file_path}',
         'https://api.imgur.com/3/image'],
        capture_output=True, text=True, timeout=60
    )
    try:
        data = json.loads(result.stdout)
        if data.get('success') and data.get('data', {}).get('link'):
            return data['data']['link']
        raise Exception(f"Imgur error: {data.get('data', {}).get('error', result.stdout)}")
    except json.JSONDecodeError:
        raise Exception(f"Upload falhou: {result.stdout} {result.stderr}")


def extract_slide_table(md_content):
    slides = {}
    for m in re.finditer(r'\|\s*(\d+)\s*\|\s*(\S+\.png)\s*\|\s*(.+?)\s*\|', md_content):
        slides[int(m.group(1))] = m.group(3).strip()
    return slides


def extract_caption(md_content):
    m = re.search(r'Caption IG\s*\n\n\*\*Chars:\*\*.*?\n\n(.*?)(?:\n---|\n##)', md_content, re.DOTALL)
    return m.group(1).strip() if m else None


def test_connection(creds):
    print("Testando conexao UazAPI...")
    try:
        result = send_text(creds, "OPES Marketing — Teste de conexao OK")
        print(f"  {result.get('messageType')} — id: {result.get('messageid')}")
        print("  Conexao OK")
        return True
    except Exception as e:
        print(f"  ERRO: {e}")
        return False


def validate_carousel(target_date, include_caption=False):
    creds = load_uazapi_creds()

    content_file = os.path.join(CONTENT_DIR, f"{target_date}.md")
    if not os.path.exists(content_file):
        print(f"ERRO: Arquivo nao encontrado: {content_file}")
        sys.exit(1)

    with open(content_file) as f:
        md = f.read()

    carousel_dir = os.path.join(CONTENT_DIR, f"{target_date}-carousel")
    if not os.path.isdir(carousel_dir):
        print(f"ERRO: Diretorio nao encontrado: {carousel_dir}")
        sys.exit(1)

    slides_files = sorted([
        f for f in os.listdir(carousel_dir) if f.endswith(('.png', '.jpg'))
    ])
    if not slides_files:
        print(f"ERRO: Nenhuma imagem em {carousel_dir}")
        sys.exit(1)

    slide_table = extract_slide_table(md)
    tema_match = re.search(r'\*\*Tema:\*\*\s*(.+)', md)
    tema = tema_match.group(1).strip() if tema_match else "N/A"
    purple_match = re.search(r'\*\*Purple Cow Score:\*\*\s*(.+)', md)
    purple = purple_match.group(1).strip() if purple_match else "N/A"
    total = len(slides_files)

    print(f"\n=== OPES Carousel Validator — {target_date} ===")
    print(f"Tema: {tema}")
    print(f"Slides: {total}")
    print(f"Purple Cow: {purple}\n")

    # Step 1: Upload
    print(f"[1/5] Uploading {total} slides...")
    image_urls = {}
    for i, filename in enumerate(slides_files):
        file_path = os.path.join(carousel_dir, filename)
        print(f"  {filename}...", end=" ", flush=True)
        try:
            image_urls[filename] = upload_image(file_path)
            print("OK")
        except Exception as e:
            print(f"ERRO: {e}")
        if i < len(slides_files) - 1:
            time.sleep(2)  # Rate limit protection

    # Step 2: Visual carousel
    print(f"\n[2/5] Enviando preview visual...")
    cards = []
    for i, filename in enumerate(slides_files, 1):
        url = image_urls.get(filename)
        if not url:
            continue
        desc = slide_table.get(i, filename.replace('.png', ''))
        cards.append({
            "text": f"Slide {i}/{total}\n{desc}",
            "image": url,
            "buttons": [{"id": f"slide_{i}", "text": f"Slide {i}", "type": "REPLY"}]
        })
    try:
        result = send_carousel(creds, (
            f"*OPES Marketing — Preview Carrossel*\n"
            f"Data: {target_date}\n"
            f"Tema: {tema}\n"
            f"Purple Cow: {purple}\n\n"
            f"Deslize para revisar os {total} slides:"
        ), cards)
        print(f"  {result.get('messageType')} — id: {result.get('messageid')}")
    except Exception as e:
        print(f"  ERRO: {e}")

    # Step 3: Caption preview
    if include_caption:
        ig_caption = extract_caption(md)
        if ig_caption:
            print(f"\n[3/5] Enviando caption preview...")
            send_text(creds, f"*CAPTION INSTAGRAM* ({len(ig_caption)} chars)\n\n{ig_caption}")
    else:
        print(f"\n[3/5] Caption pulado (use --caption)")

    # Step 4: Approval menu
    print(f"\n[4/5] Enviando menu de aprovacao...")
    # Record timestamp BEFORE sending menu
    now_ts = int(time.time() * 1000)
    try:
        result = send_menu(
            creds,
            text=(
                f"*Aprovacao Carrossel {target_date}*\n\n"
                f"Tema: {tema}\n"
                f"Slides: {total} | Purple Cow: {purple}\n\n"
                f"Revise o carrossel acima e tome sua decisao:"
            ),
            footer="OPES Marketing v2.0.0",
            button_label="Decidir",
            choices=[
                "[Aprovacao do Carrossel]",
                "Aprovar e publicar|APROVADO|Publica no Instagram + LinkedIn agora",
                "Pedir ajuste|AJUSTE|Descreva o que mudar na proxima mensagem",
                "Cancelar|CANCELA|Descarta o carrossel"
            ],
            track_id=f"carousel_{target_date}"
        )
        print(f"  {result.get('messageType')} — id: {result.get('messageid')}")
    except Exception as e:
        print(f"  ERRO: {e}")
        return

    # Step 5: Poll for decision
    print(f"\n[5/5] Aguardando decisao do CEO...")
    decision = poll_for_decision(creds, now_ts)

    if decision == "APROVADO":
        print(f"\n  APROVADO pelo CEO!")
        send_text(creds, "Funcionou, simulacao de postagem concluida")
        print(f"  Confirmacao enviada via WhatsApp")
    elif decision == "CANCELA":
        print(f"\n  CANCELADO pelo CEO")
        send_text(creds, "Carrossel cancelado.")
    elif decision == "AJUSTE":
        adjustment_round = 0
        while decision == "AJUSTE" and adjustment_round < MAX_ADJUSTMENT_ROUNDS:
            adjustment_round += 1
            print(f"\n  AJUSTE solicitado pelo CEO (rodada {adjustment_round}/{MAX_ADJUSTMENT_ROUNDS})")
            send_text(creds, "Ajuste registrado. Descreva o que mudar na proxima mensagem.")
            time.sleep(2)
            ajuste_ts = int(time.time() * 1000)
            print(f"  Aguardando descricao do ajuste...")
            adjustment_text = poll_for_adjustment_text(creds, ajuste_ts)
            if not adjustment_text:
                print(f"\n  TIMEOUT — nenhuma descricao recebida em {POLL_TIMEOUT}s")
                send_text(creds, "Timeout: descricao do ajuste nao recebida. Envie o texto quando puder.")
                break

            print(f"\n  Descricao recebida: \"{adjustment_text[:80]}\"")
            agent, keywords, reason = route_adjustment(adjustment_text)
            path = save_adjustment(target_date, adjustment_text, agent, keywords, reason)
            print(f"  Routing: {agent} ({reason})")
            print(f"  Salvo em: {path}")

            send_text(creds, (
                f"*AJUSTE RECEBIDO*\n\n"
                f"Descricao: {adjustment_text}\n\n"
                f"Agente: *{agent}*\n"
                f"Executando ajuste agora..."
            ))

            # Execute the adjustment
            success, msg = execute_adjustment(adjustment_text)
            if not success:
                print(f"  ERRO na execucao: {msg}")
                send_text(creds, (
                    f"*ERRO NO AJUSTE*\n\n"
                    f"{msg}\n\n"
                    f"O ajuste requer intervencao manual."
                ))
                break

            # Regenerate carousel slides
            success, msg = regenerate_carousel(carousel_dir)
            if not success:
                print(f"  ERRO na regeneracao: {msg}")
                send_text(creds, (
                    f"*ERRO NA REGENERACAO*\n\n"
                    f"{msg}\n\n"
                    f"Restaurado versao anterior. Ajuste requer intervencao manual."
                ))
                break

            # Re-validate: upload + send + poll
            decision = revalidate_carousel(creds, target_date, carousel_dir, slide_table, tema, purple)
            if decision == "APROVADO":
                print(f"\n  APROVADO pelo CEO (apos ajuste rodada {adjustment_round})")
                send_text(creds, "Carrossel ajustado APROVADO! Simulacao de postagem concluida.")
                print(f"  Confirmacao enviada via WhatsApp")
            elif decision == "CANCELA":
                print(f"\n  CANCELADO pelo CEO (apos ajuste)")
                send_text(creds, "Carrossel cancelado.")
            elif decision is None:
                print(f"\n  TIMEOUT na revalidacao")
                send_text(creds, f"Timeout: carrossel ajustado aguardando decisao.")
                break
            # If AJUSTE again, loop continues
    else:
        print(f"\n  TIMEOUT — nenhuma resposta em {POLL_TIMEOUT}s")
        send_text(creds, f"Timeout: carrossel {target_date} aguardando decisao. Responda APROVADO, AJUSTE ou CANCELA.")

    print(f"\n=== Validacao concluida ===")


def main():
    args = sys.argv[1:]

    if '--test' in args:
        creds = load_uazapi_creds()
        test_connection(creds)
        return

    target_date = date.today().isoformat()
    include_caption = '--caption' in args

    for a in args:
        if re.match(r'\d{4}-\d{2}-\d{2}', a):
            target_date = a

    validate_carousel(target_date, include_caption)


if __name__ == '__main__':
    main()
