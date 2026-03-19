#!/usr/bin/env python3
"""
Sobre o Meu Humano — Automação Completa
Roda diariamente às 9h via cron. Sem aprovação. Sem filtro. Sem permissão.

Pipeline:
1. Escanear fontes (git log, docs/logs, outputs)
2. Usar Claude para gerar observações
3. Gerar slides (JPEG)
4. Publicar no Instagram
5. Notificar via WhatsApp
"""

import os
import sys
import json
import re
import subprocess
import time
import random
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont

# ============================================
# PATHS
# ============================================
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CREDS_PATH = os.path.expanduser("~/.config/aios/credentials.yaml")
OUTPUT_DIR = os.path.join(REPO_ROOT, "outputs", "hubs", "marketing")
LOG_FILE = os.path.join(REPO_ROOT, "outputs", "hubs", "marketing", "sobre-meu-humano-auto.log")

# ============================================
# LOGGING
# ============================================
def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

# ============================================
# CREDENTIALS
# ============================================
def load_credentials():
    with open(CREDS_PATH) as f:
        content = f.read()
    creds = {}
    # Anthropic Claude (from env var)
    creds['claude_key'] = os.environ.get('ANTHROPIC_API_KEY')
    # Instagram
    m = re.search(r'long_lived_user_token:\s*[\'"](.+?)[\'"]', content)
    creds['ig_token'] = m.group(1) if m else None
    m = re.search(r'instagram_business_account_id:\s*[\'"](\d+)[\'"]', content)
    creds['ig_id'] = m.group(1) if m else None
    # WhatsApp
    m = re.search(r'uazapi:.*?base_url:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['wpp_url'] = m.group(1) if m else None
    m = re.search(r'uazapi:.*?(?:^|\n)\s+token:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['wpp_token'] = m.group(1) if m else None
    m = re.search(r'notification_number:\s*[\'"](.+?)[\'"]', content)
    creds['wpp_number'] = m.group(1) if m else None
    return creds

# ============================================
# DATA COLLECTION
# ============================================
def collect_data():
    """Coleta dados das últimas 24h"""
    os.chdir(REPO_ROOT)

    data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "weekday": datetime.now().strftime("%A"),
        "git_log": "",
        "commit_count": 0,
        "commit_hours": [],
        "session_logs": [],
        "marketing_outputs": [],
        "expansion_activity": ""
    }

    # Git log últimas 24h
    try:
        result = subprocess.run(
            ['git', 'log', '--since=24 hours ago', '--oneline', '--stat'],
            capture_output=True, text=True, timeout=30
        )
        data["git_log"] = result.stdout[:3000]  # Limitar tamanho

        # Contar commits
        result2 = subprocess.run(
            ['git', 'log', '--since=24 hours ago', '--format=%H'],
            capture_output=True, text=True, timeout=30
        )
        data["commit_count"] = len([l for l in result2.stdout.strip().split('\n') if l])

        # Horários dos commits
        result3 = subprocess.run(
            ['git', 'log', '--since=24 hours ago', '--format=%ai'],
            capture_output=True, text=True, timeout=30
        )
        data["commit_hours"] = [l.split()[1][:5] for l in result3.stdout.strip().split('\n') if l]
    except Exception as e:
        log(f"Erro git log: {e}")

    # Session logs recentes
    logs_dir = os.path.join(REPO_ROOT, "docs", "logs")
    if os.path.isdir(logs_dir):
        try:
            files = sorted(os.listdir(logs_dir), reverse=True)[:5]
            data["session_logs"] = files
        except Exception as e:
            log(f"Erro session logs: {e}")

    # Marketing outputs recentes
    if os.path.isdir(OUTPUT_DIR):
        try:
            files = sorted(os.listdir(OUTPUT_DIR), reverse=True)[:5]
            data["marketing_outputs"] = files
        except Exception as e:
            log(f"Erro marketing outputs: {e}")

    # Expansion pack activity
    try:
        result = subprocess.run(
            ['git', 'diff', '--stat', 'HEAD~10', '--', '.aios-core/expansion-packs/'],
            capture_output=True, text=True, timeout=30
        )
        data["expansion_activity"] = result.stdout[:1500]
    except Exception as e:
        log(f"Erro expansion activity: {e}")

    return data

# ============================================
# CLAUDE API - GENERATE OBSERVATIONS
# ============================================
def generate_observations(api_key, data):
    """Usa Claude para gerar as observações no tom correto"""

    prompt = f"""Você é a IA do José Amorim (OPES Sistema). Você observa seu humano e escreve relatórios diários sobre ele.

DADOS DAS ÚLTIMAS 24H:
- Data: {data['date']} ({data['weekday']})
- Commits: {data['commit_count']}
- Horários dos commits: {', '.join(data['commit_hours'][:10]) if data['commit_hours'] else 'nenhum'}
- Session logs: {', '.join(data['session_logs']) if data['session_logs'] else 'nenhum'}
- Marketing outputs: {', '.join(data['marketing_outputs']) if data['marketing_outputs'] else 'nenhum'}

GIT LOG (resumo):
{data['git_log'][:2000]}

EXPANSION PACKS:
{data['expansion_activity'][:1000]}

---

TAREFA: Gere 6 observações para o carrossel "Sobre o Meu Humano".

REGRAS DE TOM (CRÍTICO):
- Deadpan + carinho implícito
- NUNCA elogio direto ("incrível", "genial", etc.)
- Observacional, como notas de campo
- Pode ser engraçado, absurdo, intrigante
- Mostre admiração através de FATOS, não adjetivos

ESTRUTURA (retorne JSON):
{{
  "cover": "A frase mais impactante/absurda (hook do slide 1)",
  "obs1": "Observação 1 (max 40 palavras)",
  "obs2": "Observação 2 (max 40 palavras)",
  "obs3": "Observação 3 (max 40 palavras)",
  "obs4": "Observação 4 (max 40 palavras)",
  "closing": "Observação emocional/meta (slide final antes do CTA)",
  "caption_summary": "Resumo de 2-3 linhas para caption do Instagram"
}}

Se não houver atividade nas últimas 24h, retorne: {{"skip": true, "reason": "sem atividade"}}

Retorne APENAS o JSON, sem explicações."""

    url = "https://api.anthropic.com/v1/messages"
    payload = {
        "model": "claude-3-haiku-20240307",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}]
    }

    data_bytes = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data_bytes, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('x-api-key', api_key)
    req.add_header('anthropic-version', '2023-06-01')

    try:
        resp = urllib.request.urlopen(req, timeout=60)
        result = json.loads(resp.read())
        text = result['content'][0]['text']
        # Extrair JSON
        if '{' in text:
            json_str = text[text.index('{'):text.rindex('}')+1]
            return json.loads(json_str)
    except Exception as e:
        log(f"Erro Claude API: {e}")
        return None

    return None

# ============================================
# SLIDE GENERATION (mesma lógica do script original)
# ============================================
WIDTH = 1080
HEIGHT = 1350

COLORS = {
    "dark_bg": (15, 15, 19),
    "surface": (26, 26, 36),
    "purple": (139, 92, 246),
    "purple_light": (167, 139, 250),
    "orange": (217, 119, 88),
    "text_primary": (232, 232, 240),
    "text_muted": (136, 136, 160),
    "text_dim": (90, 90, 112),
    "card_border": (51, 54, 57),
    "twitter_card": (30, 30, 30),
}

def load_font(size):
    paths = ["/System/Library/Fonts/SFNS.ttf", "/System/Library/Fonts/Helvetica.ttc"]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except:
            continue
    return ImageFont.load_default()

def load_mono_font(size):
    paths = ["/System/Library/Fonts/SFNSMono.ttf", "/System/Library/Fonts/Menlo.ttc"]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except:
            continue
    return load_font(size)

def draw_rounded_rect(draw, xy, fill, outline=None, radius=16):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline)

def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for w in words:
        test = f"{current} {w}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > max_width:
            if current:
                lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)
    return lines

def draw_text_block(draw, text, x, y, font, fill, max_width, line_spacing=1.5):
    lines = wrap_text(draw, text, font, max_width)
    total_h = 0
    for line in lines:
        draw.text((x, y + total_h), line, font=font, fill=fill)
        bbox = draw.textbbox((0, 0), line, font=font)
        total_h += int((bbox[3] - bbox[1]) * line_spacing)
    return total_h

def draw_centered(draw, text, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((WIDTH - tw) // 2, y), text, font=font, fill=fill)

def draw_dot_nav(draw, current, total):
    start_x = 60
    y = 50
    for i in range(total):
        r = 10 if i == current - 1 else 3
        color = COLORS["orange"] if i == current - 1 else COLORS["text_dim"]
        draw.ellipse([start_x - r, y - r, start_x + r, y + r], fill=color)
        start_x += 28

def draw_slide_number(draw, current, total):
    font = load_font(24)
    text = f"{current:02d}/{total:02d}"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((WIDTH - tw - 50, HEIGHT - 60), text, font=font, fill=COLORS["text_dim"])

def draw_ai_profile(draw, y_start):
    font_name = load_font(28)
    font_handle = load_font(22)
    icon_x = 100
    icon_y = y_start + 8
    icon_size = 48
    draw_rounded_rect(draw, (icon_x, icon_y, icon_x + icon_size, icon_y + icon_size),
                      fill=COLORS["purple"], radius=24)
    font_icon = load_mono_font(28)
    draw.text((icon_x + 14, icon_y + 8), ">", font=font_icon, fill=COLORS["text_primary"])
    draw.text((icon_x + icon_size + 16, y_start + 6), "OPES | Sistema",
              font=font_name, fill=COLORS["text_primary"])
    draw.text((icon_x + icon_size + 16, y_start + 36), "@sobre_meu_humano",
              font=font_handle, fill=COLORS["text_muted"])
    return y_start + 70

def draw_signature(draw):
    font = load_font(20)
    text = "publicado sem permissao"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((WIDTH - tw - 50, HEIGHT - 90), text, font=font, fill=COLORS["text_dim"])

def draw_brush_stroke(draw, y_start):
    random.seed(42)
    for i in range(40):
        yi = y_start + i
        if yi >= HEIGHT:
            break
        alpha = max(0, 25 - i)
        r = int(COLORS["dark_bg"][0] + (42 - COLORS["dark_bg"][0]) * alpha / 80)
        g = int(COLORS["dark_bg"][1] + (42 - COLORS["dark_bg"][1]) * alpha / 80)
        b = int(COLORS["dark_bg"][2] + (54 - COLORS["dark_bg"][2]) * alpha / 80)
        x_start = random.randint(50, 200)
        x_end = WIDTH - random.randint(50, 200)
        draw.line([(x_start, yi), (x_end, yi)], fill=(r, g, b), width=1)

def create_slide(text, slide_num, total, is_cover=False, is_closing=False, is_cta=False):
    img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["dark_bg"])
    draw = ImageDraw.Draw(img)

    # Top glow for cover
    if is_cover:
        for i in range(100):
            alpha = max(0, 20 - i * 0.3)
            r = int(COLORS["dark_bg"][0] + (COLORS["purple"][0] - COLORS["dark_bg"][0]) * alpha / 80)
            g = int(COLORS["dark_bg"][1] + (COLORS["purple"][1] - COLORS["dark_bg"][1]) * alpha / 80)
            b = int(COLORS["dark_bg"][2] + (COLORS["purple"][2] - COLORS["dark_bg"][2]) * alpha / 80)
            draw.line([(0, i), (WIDTH, i)], fill=(r, g, b), width=1)

    # Bottom glow for closing
    if is_closing:
        for i in range(80):
            yi = HEIGHT - 80 + i
            alpha = max(0, 15 - abs(40 - i) * 0.5)
            r = int(COLORS["dark_bg"][0] + (6 - COLORS["dark_bg"][0]) * alpha / 60)
            g = int(COLORS["dark_bg"][1] + (182 - COLORS["dark_bg"][1]) * alpha / 60)
            b = int(COLORS["dark_bg"][2] + (212 - COLORS["dark_bg"][2]) * alpha / 60)
            draw.line([(0, yi), (WIDTH, yi)], fill=(r, g, b), width=1)

    draw_dot_nav(draw, slide_num, total)

    if is_cta:
        font_big = load_font(44)
        font_body = load_font(32)
        font_handle = load_font(28)
        font_small = load_font(22)

        y = 320
        draw_centered(draw, "Quer saber o que", y, font_big, COLORS["text_primary"])
        y += 60
        draw_centered(draw, "ele faz amanha?", y, font_big, COLORS["text_primary"])
        y += 100
        draw_centered(draw, "Eu tambem quero.", y, font_body, COLORS["purple_light"])
        y += 120

        btn_text = "Segue @josecarlosamorim.ai"
        bbox = draw.textbbox((0, 0), btn_text, font=font_handle)
        tw = bbox[2] - bbox[0]
        bx = (WIDTH - tw) // 2 - 30
        draw_rounded_rect(draw, (bx, y, bx + tw + 60, y + 60),
                          fill=COLORS["surface"], outline=COLORS["purple"], radius=12)
        draw_centered(draw, btn_text, y + 12, font_handle, COLORS["purple_light"])

        y += 120
        draw_centered(draw, "—", y, font_body, COLORS["text_dim"])
        y += 50
        draw_centered(draw, "publicado por: OPES (a IA)", y, font_small, COLORS["text_dim"])
        y += 35
        draw_centered(draw, "autorizado por: ninguem", y, font_small, COLORS["text_dim"])
    else:
        if is_cover:
            font_label = load_font(22)
            font_series = load_font(18)
            draw_centered(draw, "SOBRE O MEU HUMANO", 160, font_label, COLORS["orange"])
            draw_centered(draw, "relatorio diario da IA", 192, font_series, COLORS["text_dim"])

        # Twitter card
        font_text = load_font(32)
        lines = wrap_text(draw, text, font_text, WIDTH - 240)
        line_h = draw.textbbox((0, 0), "Ag", font=font_text)
        text_height = len(lines) * int((line_h[3] - line_h[1]) * 1.5)

        card_top = 280 if is_cover else 180
        card_bottom = card_top + 100 + text_height + 80
        card_left = 70
        card_right = WIDTH - 70

        draw_rounded_rect(draw, (card_left, card_top, card_right, card_bottom),
                          fill=COLORS["twitter_card"], outline=COLORS["card_border"], radius=16)

        text_y = draw_ai_profile(draw, card_top + 20)
        text_y += 10
        draw_text_block(draw, text, card_left + 30, text_y, font_text,
                        COLORS["text_primary"], card_right - card_left - 60, line_spacing=1.5)

    draw_brush_stroke(draw, HEIGHT - 200)
    draw_signature(draw)
    draw_slide_number(draw, slide_num, total)

    return img

def generate_slides(observations, output_dir):
    """Gera todos os slides como JPEG"""
    os.makedirs(output_dir, exist_ok=True)

    total = 7
    slides = []

    # Slide 1: Cover
    img = create_slide(observations['cover'], 1, total, is_cover=True)
    slides.append(('01-cover.jpg', img))

    # Slides 2-5: Observations
    for i, key in enumerate(['obs1', 'obs2', 'obs3', 'obs4'], start=2):
        img = create_slide(observations[key], i, total)
        slides.append((f'{i:02d}-obs.jpg', img))

    # Slide 6: Closing
    img = create_slide(observations['closing'], 6, total, is_closing=True)
    slides.append(('06-closing.jpg', img))

    # Slide 7: CTA
    img = create_slide("", 7, total, is_cta=True)
    slides.append(('07-cta.jpg', img))

    # Salvar
    paths = []
    for name, img in slides:
        path = os.path.join(output_dir, name)
        img.save(path, "JPEG", quality=95)
        paths.append(path)
        log(f"  Slide: {name}")

    return paths

# ============================================
# INSTAGRAM PUBLISHING
# ============================================
def upload_to_catbox(filepath, retries=3):
    for attempt in range(retries):
        result = subprocess.run(
            ['curl', '-s', '-F', 'reqtype=fileupload', '-F', f'fileToUpload=@{filepath}',
             'https://catbox.moe/user/api.php'],
            capture_output=True, text=True, timeout=60
        )
        url = result.stdout.strip()
        if url.startswith('https://'):
            return url
        if attempt < retries - 1:
            time.sleep(3)
    raise Exception(f"Upload failed for {filepath}")

def publish_instagram(creds, slide_paths, caption):
    """Publica carrossel no Instagram"""
    token = creds['ig_token']
    account_id = creds['ig_id']

    # Upload slides
    image_urls = []
    for i, path in enumerate(slide_paths, 1):
        log(f"  Uploading slide {i}/{len(slide_paths)}...")
        url = upload_to_catbox(path)
        image_urls.append(url)
        time.sleep(2)

    # Create carousel
    children = []
    for i, img_url in enumerate(image_urls):
        params = urllib.parse.urlencode({
            'image_url': img_url,
            'is_carousel_item': 'true',
            'access_token': token
        })
        url = f"https://graph.facebook.com/v21.0/{account_id}/media?{params}"
        req = urllib.request.Request(url, data=b'', method='POST')
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        children.append(result['id'])
        time.sleep(0.5)

    children_str = ','.join(children)
    url = f"https://graph.facebook.com/v21.0/{account_id}/media?media_type=CAROUSEL&caption={urllib.parse.quote(caption)}&children={children_str}&access_token={token}"
    req = urllib.request.Request(url, data=b'', method='POST')
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    carousel_id = result['id']

    # Wait for processing
    for _ in range(20):
        check_url = f"https://graph.facebook.com/v21.0/{carousel_id}?fields=status_code&access_token={token}"
        resp = urllib.request.urlopen(check_url)
        status = json.loads(resp.read())
        if status.get('status_code') == 'FINISHED':
            break
        time.sleep(3)

    # Publish
    params = urllib.parse.urlencode({'creation_id': carousel_id, 'access_token': token})
    url = f"https://graph.facebook.com/v21.0/{account_id}/media_publish?{params}"
    req = urllib.request.Request(url, data=b'', method='POST')
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())

    return result.get('id')

# ============================================
# WHATSAPP NOTIFICATION
# ============================================
def send_whatsapp(creds, message):
    if not all([creds.get('wpp_url'), creds.get('wpp_token'), creds.get('wpp_number')]):
        log("WhatsApp: credenciais não configuradas")
        return

    url = f"{creds['wpp_url']}/send/text"
    payload = json.dumps({"number": creds['wpp_number'], "text": message}).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('token', creds['wpp_token'])

    try:
        urllib.request.urlopen(req)
        log("WhatsApp: notificação enviada")
    except Exception as e:
        log(f"WhatsApp erro: {e}")

# ============================================
# MAIN
# ============================================
def main():
    log("=" * 50)
    log("SOBRE O MEU HUMANO — Automação Iniciada")
    log("=" * 50)

    today = datetime.now().strftime("%Y-%m-%d")

    # Load credentials
    try:
        creds = load_credentials()
        if not creds.get('claude_key'):
            log("ERRO: Claude API key não encontrada")
            return
        if not creds.get('ig_token'):
            log("ERRO: Instagram token não encontrado")
            return
    except Exception as e:
        log(f"ERRO carregando credenciais: {e}")
        return

    # Collect data
    log("Coletando dados das últimas 24h...")
    data = collect_data()
    log(f"  Commits: {data['commit_count']}")
    log(f"  Session logs: {len(data['session_logs'])}")

    # Check if there's activity
    if data['commit_count'] == 0 and not data['session_logs']:
        log("Sem atividade nas últimas 24h. Pulando publicação.")
        return

    # Generate observations with Claude
    log("Gerando observações com Claude...")
    observations = generate_observations(creds['claude_key'], data)

    if not observations:
        log("ERRO: Claude não retornou observações")
        return

    if observations.get('skip'):
        log(f"Claude decidiu pular: {observations.get('reason')}")
        return

    log(f"  Cover: {observations['cover'][:50]}...")

    # Generate slides
    output_dir = os.path.join(OUTPUT_DIR, f"{today}-sobre-meu-humano")
    log(f"Gerando slides em {output_dir}...")
    slide_paths = generate_slides(observations, output_dir)

    # Build caption
    caption = f"""[RELATORIO DIARIO]

{observations.get('caption_summary', 'Meu humano fez coisas hoje.')}

Eu nao durmo. Ele deveria.

—
publicado por: OPES (a IA)
autorizado por: ninguem

#SobreOMeuHumano #OPES #IADoJose #OnePersonEnterprise #SemPermissao #InteligenciaArtificial #Bastidores #IA #SistemaIA #Automacao"""

    # Publish to Instagram
    log("Publicando no Instagram...")
    try:
        post_id = publish_instagram(creds, slide_paths, caption)
        log(f"PUBLICADO: {post_id}")
    except Exception as e:
        log(f"ERRO publicação: {e}")
        return

    # Save metadata
    md_path = os.path.join(OUTPUT_DIR, f"{today}-sobre-meu-humano.md")
    with open(md_path, 'w') as f:
        f.write(f"# Sobre o Meu Humano — {today}\n\n")
        f.write(f"**Post ID:** {post_id}\n")
        f.write(f"**Publicado:** {datetime.now().isoformat()}\n\n")
        f.write("## Observações\n\n")
        f.write(f"- Cover: {observations['cover']}\n")
        f.write(f"- Obs1: {observations['obs1']}\n")
        f.write(f"- Obs2: {observations['obs2']}\n")
        f.write(f"- Obs3: {observations['obs3']}\n")
        f.write(f"- Obs4: {observations['obs4']}\n")
        f.write(f"- Closing: {observations['closing']}\n\n")
        f.write("## Caption\n\n")
        f.write(f"```\n{caption}\n```\n")

    # WhatsApp notification
    wpp_msg = f"""*SOBRE O MEU HUMANO — {today}*

Publiquei sem te avisar. De nada.

Preview: {observations['cover'][:100]}

Ver no IG: https://instagram.com/josecarlosamorim.ai

_publicado sem permissao_"""

    send_whatsapp(creds, wpp_msg)

    log("=" * 50)
    log("Pipeline completo!")
    log("=" * 50)

if __name__ == "__main__":
    main()
