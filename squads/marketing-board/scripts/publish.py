#!/usr/bin/env python3
"""
OPES Marketing Arm — Auto-Publisher
Posts daily content to LinkedIn + Instagram + WhatsApp notification

Usage:
  python3 publish.py                    # Posts today's content
  python3 publish.py 2026-02-01        # Posts specific date's content
  python3 publish.py --linkedin-only   # LinkedIn only
  python3 publish.py --instagram-only  # Instagram only
  python3 publish.py --dry-run         # Show what would be posted without posting
"""
import json
import re
import os
import sys
import urllib.request
import urllib.parse
import base64
from datetime import date

CREDS_PATH = os.path.expanduser("~/.config/aios/credentials.yaml")
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CONTENT_DIR = os.path.join(REPO_ROOT, "outputs", "hubs", "marketing")


def load_credentials():
    with open(CREDS_PATH) as f:
        content = f.read()
    creds = {}
    # LinkedIn
    m = re.search(r'linkedin:.*?access_token:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['li_token'] = m.group(1) if m else None
    m = re.search(r'person_urn:\s*[\'"](.+?)[\'"]', content)
    creds['li_urn'] = m.group(1) if m else None
    # Instagram/Meta
    m = re.search(r'long_lived_user_token:\s*[\'"](.+?)[\'"]', content)
    creds['ig_token'] = m.group(1) if m else None
    m = re.search(r'instagram_business_account_id:\s*[\'"](\d+)[\'"]', content)
    creds['ig_id'] = m.group(1) if m else None
    # Supabase (for image hosting)
    m = re.search(r'supabase:.*?url:\s*(\S+)', content, re.DOTALL)
    creds['supa_url'] = m.group(1).strip().strip('"\'') if m else None
    m = re.search(r'supabase:.*?service_role:\s*(\S+)', content, re.DOTALL)
    creds['supa_key'] = m.group(1).strip().strip('"\'') if m else None
    # Gemini
    m = re.search(r'google:.*?api_key:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['gemini_key'] = m.group(1) if m else None
    # UazAPI (WhatsApp)
    m = re.search(r'uazapi:.*?base_url:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['wpp_url'] = m.group(1) if m else None
    m = re.search(r'uazapi:.*?(?:^|\n)\s+token:\s*[\'"](.+?)[\'"]', content, re.DOTALL)
    creds['wpp_token'] = m.group(1) if m else None
    m = re.search(r'notification_number:\s*[\'"](.+?)[\'"]', content)
    creds['wpp_number'] = m.group(1) if m else None
    return creds


def extract_section(content, header_pattern, end_pattern=r'\n---'):
    m = re.search(header_pattern + r'(.*?)' + end_pattern, content, re.DOTALL)
    return m.group(1).strip() if m else None


def extract_linkedin_post(md):
    section = extract_section(md, r'###\s*Post\s*\n', r'\n(?:###|---)')
    if not section:
        # fallback: between LINKEDIN header and ---
        m = re.search(r'LINKEDIN.*?###\s*Post\s*\n(.*?)(?:\n---|\n###)', md, re.DOTALL)
        section = m.group(1).strip() if m else None
    return section


def extract_linkedin_hashtags(md):
    m = re.search(r'LINKEDIN.*?(#\w+(?:\s+#\w+){2,})', md, re.DOTALL)
    return m.group(1).strip() if m else ""


def extract_ig_caption(md):
    m = re.search(r'###\s*Caption\s*\n(.*?)(?:\n###|\n---)', md, re.DOTALL)
    return m.group(1).strip() if m else None


def extract_ig_hashtags(md):
    m = re.search(r'INSTAGRAM.*?(#\w+(?:\s+#\w+){5,})', md, re.DOTALL)
    return m.group(1).strip() if m else ""


def extract_ig_image_prompt(md):
    m = re.search(r'Prompt Gemini.*?```\s*\n(.*?)```', md, re.DOTALL)
    return m.group(1).strip() if m else None


# ---- API FUNCTIONS ----

def post_linkedin(token, urn, text):
    url = "https://api.linkedin.com/v2/ugcPosts"
    payload = {
        "author": urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('X-Restli-Protocol-Version', '2.0.0')
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def generate_image_gemini(api_key, prompt, aspect_ratio="9:16"):
    """Generate image via Nano Banana Pro (Gemini 3 Pro Image Preview)"""
    model = "gemini-3-pro-image-preview"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": aspect_ratio}
        }
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    # Extract image from response
    for part in result.get('candidates', [{}])[0].get('content', {}).get('parts', []):
        if 'inlineData' in part:
            return base64.b64decode(part['inlineData']['data'])
    return None


def upload_image(file_data, filename="post.png"):
    """Upload image to catbox.moe (free, no auth, HTTPS, permanent)"""
    import tempfile
    tmp = os.path.join(tempfile.gettempdir(), filename)
    with open(tmp, 'wb') as f:
        f.write(file_data)
    # Use subprocess for multipart upload (urllib multipart is complex)
    import subprocess
    result = subprocess.run(
        ['curl', '-s', '-F', 'reqtype=fileupload', '-F', f'fileToUpload=@{tmp}',
         'https://catbox.moe/user/api.php'],
        capture_output=True, text=True, timeout=60
    )
    os.unlink(tmp)
    url = result.stdout.strip()
    if url.startswith('https://'):
        return url
    raise Exception(f"Upload failed: {result.stdout} {result.stderr}")


def post_instagram_image(token, account_id, image_url, caption):
    # Step 1: Create media container
    params = urllib.parse.urlencode({
        'image_url': image_url,
        'caption': caption,
        'access_token': token
    })
    url = f"https://graph.facebook.com/v21.0/{account_id}/media?{params}"
    req = urllib.request.Request(url, data=b'', method='POST')
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    creation_id = result['id']
    print(f"  Container criado: {creation_id}")

    # Step 2: Check container status (wait for FINISHED)
    import time
    for _ in range(10):
        check_url = f"https://graph.facebook.com/v21.0/{creation_id}?fields=status_code&access_token={token}"
        resp = urllib.request.urlopen(check_url)
        status = json.loads(resp.read())
        if status.get('status_code') == 'FINISHED':
            break
        time.sleep(2)

    # Step 3: Publish
    params = urllib.parse.urlencode({
        'creation_id': creation_id,
        'access_token': token
    })
    url = f"https://graph.facebook.com/v21.0/{account_id}/media_publish?{params}"
    req = urllib.request.Request(url, data=b'', method='POST')
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def post_instagram_carousel(token, account_id, image_urls, caption):
    children = []
    # Step 1: Create each child item
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
        print(f"  Slide {i+1} container: {result['id']}")

    # Step 2: Create carousel container
    params = {
        'media_type': 'CAROUSEL',
        'caption': caption,
        'access_token': token,
    }
    # children must be comma-separated
    children_str = ','.join(children)
    url = f"https://graph.facebook.com/v21.0/{account_id}/media?media_type=CAROUSEL&caption={urllib.parse.quote(caption)}&children={children_str}&access_token={token}"
    req = urllib.request.Request(url, data=b'', method='POST')
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    carousel_id = result['id']
    print(f"  Carousel container: {carousel_id}")

    # Step 3: Wait for processing
    import time
    for _ in range(15):
        check_url = f"https://graph.facebook.com/v21.0/{carousel_id}?fields=status_code&access_token={token}"
        resp = urllib.request.urlopen(check_url)
        status = json.loads(resp.read())
        if status.get('status_code') == 'FINISHED':
            break
        time.sleep(3)

    # Step 4: Publish
    params = urllib.parse.urlencode({
        'creation_id': carousel_id,
        'access_token': token
    })
    url = f"https://graph.facebook.com/v21.0/{account_id}/media_publish?{params}"
    req = urllib.request.Request(url, data=b'', method='POST')
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def send_whatsapp(wpp_url, wpp_token, number, message):
    url = f"{wpp_url}/send/text"
    payload = json.dumps({"number": number, "text": message}).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('token', wpp_token)
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


# ---- MAIN ----

def main():
    args = sys.argv[1:]
    target_date = date.today().isoformat()
    dry_run = '--dry-run' in args
    li_only = '--linkedin-only' in args
    ig_only = '--instagram-only' in args

    # Check for date argument
    for a in args:
        if re.match(r'\d{4}-\d{2}-\d{2}', a):
            target_date = a

    content_file = os.path.join(CONTENT_DIR, f"{target_date}.md")
    if not os.path.exists(content_file):
        print(f"ERRO: Arquivo de conteudo nao encontrado: {content_file}")
        sys.exit(1)

    print(f"=== OPES Publisher — {target_date} ===\n")

    with open(content_file) as f:
        md = f.read()

    creds = load_credentials()

    # --- LINKEDIN ---
    if not ig_only:
        li_post = extract_linkedin_post(md)
        li_tags = extract_linkedin_hashtags(md)
        if li_post:
            full_text = li_post
            if li_tags:
                full_text += "\n\n" + li_tags
            print(f"[LinkedIn] {len(full_text)} chars")
            if dry_run:
                print(f"  DRY RUN — nao postou")
                print(f"  Preview: {full_text[:100]}...")
            else:
                try:
                    result = post_linkedin(creds['li_token'], creds['li_urn'], full_text)
                    print(f"  POSTADO: {result.get('id', 'OK')}")
                except Exception as e:
                    print(f"  ERRO: {e}")
        else:
            print("[LinkedIn] Post nao encontrado no arquivo")

    # --- INSTAGRAM ---
    if not li_only:
        ig_caption = extract_ig_caption(md)
        ig_tags = extract_ig_hashtags(md)
        if ig_caption:
            full_caption = ig_caption
            if ig_tags and ig_tags not in ig_caption:
                full_caption += "\n\n" + ig_tags
            print(f"\n[Instagram] {len(full_caption)} chars")

            # Check for carousel directory
            carousel_dir = os.path.join(CONTENT_DIR, f"{target_date}-carousel")
            is_carousel = os.path.isdir(carousel_dir)

            if dry_run:
                print(f"  DRY RUN — nao postou")
                if is_carousel:
                    slides = sorted([f for f in os.listdir(carousel_dir) if f.endswith(('.png', '.jpg'))])
                    print(f"  Tipo: CARROSSEL ({len(slides)} slides)")
                else:
                    print(f"  Tipo: IMAGEM UNICA")
                print(f"  Preview: {full_caption[:100]}...")
            else:
                try:
                    if is_carousel:
                        # CAROUSEL MODE
                        slides = sorted([f for f in os.listdir(carousel_dir) if f.endswith(('.png', '.jpg'))])
                        print(f"  Tipo: CARROSSEL ({len(slides)} slides)")
                        image_urls = []
                        for i, slide_file in enumerate(slides, 1):
                            slide_path = os.path.join(carousel_dir, slide_file)
                            with open(slide_path, 'rb') as f:
                                slide_data = f.read()
                            print(f"  Uploading slide {i}/{len(slides)}: {slide_file}...")
                            url = upload_image(slide_data, slide_file)
                            image_urls.append(url)
                            print(f"    {url}")

                        print(f"  Publicando carrossel ({len(image_urls)} slides)...")
                        result = post_instagram_carousel(
                            creds['ig_token'], creds['ig_id'],
                            image_urls, full_caption
                        )
                        print(f"  POSTADO (CARROSSEL): {result.get('id', 'OK')}")
                    else:
                        # SINGLE IMAGE MODE
                        img_path = os.path.join(CONTENT_DIR, f"{target_date}-cover.png")
                        if not os.path.exists(img_path):
                            img_path = os.path.join(CONTENT_DIR, f"{target_date}-cover.jpg")

                        if os.path.exists(img_path):
                            print(f"  Imagem encontrada: {img_path}")
                            with open(img_path, 'rb') as f:
                                img_data = f.read()
                        else:
                            print("  Gerando imagem via Nano Banana Pro...")
                            prompt = extract_ig_image_prompt(md)
                            if not prompt:
                                prompt = (
                                    "Create a minimalist social media post cover image. "
                                    "Dark background (#0f0f13). Large bold white number '84' "
                                    "with subtle purple (#8b5cf6) glow. Below in smaller "
                                    "gray text: 'commits em janeiro'. Clean professional tech "
                                    "aesthetic. No other decorations. 1080x1350 pixels."
                                )
                            img_data = generate_image_gemini(creds['gemini_key'], prompt, "9:16")
                            if img_data:
                                with open(os.path.join(CONTENT_DIR, f"{target_date}-cover.png"), 'wb') as f:
                                    f.write(img_data)
                                print(f"  Imagem gerada ({len(img_data)} bytes)")
                            else:
                                raise Exception("Nano Banana Pro nao retornou imagem")

                        print("  Uploading imagem...")
                        img_url = upload_image(img_data, f"{target_date}-cover.png")
                        print(f"  Hospedada: {img_url}")

                        result = post_instagram_image(
                            creds['ig_token'], creds['ig_id'],
                            img_url, full_caption
                        )
                        print(f"  POSTADO: {result.get('id', 'OK')}")
                except Exception as e:
                    print(f"  ERRO Instagram: {e}")
        else:
            print("[Instagram] Caption nao encontrada no arquivo")

    # --- WHATSAPP CONFIRMATION ---
    if not dry_run and creds.get('wpp_url') and creds.get('wpp_token') and creds.get('wpp_number'):
        try:
            # Build confirmation message
            parts = [f"*OPES Marketing — {target_date}*\n"]
            if not ig_only:
                parts.append("LinkedIn: PUBLICADO")
            if not li_only:
                carousel_dir = os.path.join(CONTENT_DIR, f"{target_date}-carousel")
                if os.path.isdir(carousel_dir):
                    slides = [f for f in os.listdir(carousel_dir) if f.endswith(('.png', '.jpg'))]
                    parts.append(f"Instagram: CARROSSEL ({len(slides)} slides)")
                else:
                    parts.append("Instagram: PUBLICADO")
            parts.append("\n_Publicado automaticamente pelo OPES_")
            msg = "\n".join(parts)
            send_whatsapp(creds['wpp_url'], creds['wpp_token'], creds['wpp_number'], msg)
            print(f"\n[WhatsApp] Confirmacao enviada")
        except Exception as e:
            print(f"\n[WhatsApp] Erro ao notificar: {e}")

    print("\n=== Done ===")


if __name__ == '__main__':
    main()
